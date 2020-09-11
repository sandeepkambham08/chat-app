import React, { Component } from 'react';
import './App.css';
import * as firebase from 'firebase';
import Button from '@material-ui/core/Button';
//import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import SaveIcon from '@material-ui/icons/Save';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import video_off from './media/video_off.png';
import video_on from './media/video_on.png';
import side_drawer from './media/messages-icon.png';
import leftSide_drawer from './media/leftSide_drawer.png';
import screen_share from './media/screen_share.png';
import Self_video from './SelfVideo.js'

//import adapter from 'webrtc-adapter';

var firebaseConfig = {
    apiKey: "AIzaSyBw8TC9om3UZO9HPHkOOn0zm0VYjmgmvnc",
    authDomain: "chatbox-390df.firebaseapp.com",
    databaseURL: "https://chatbox-390df.firebaseio.com",
    projectId: "chatbox-390df",
    storageBucket: "chatbox-390df.appspot.com",
    messagingSenderId: "560038737659",
    appId: "1:560038737659:web:3d15e56cc2cc98c807225e",
    measurementId: "G-75W8MF9XE9"
};
// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = app.database();


const yourId = Math.floor(Math.random() * 10000);  //  generate a random id 
console.log(yourId)

var servers = { 'iceServers': [{ 'urls': 'stun:stun01.sipphone.com' }, { 'urls': 'stun:stun.services.mozilla.com' }, { 'urls': 'stun:stun.l.google.com:19302' }, { 'urls': 'turn:numb.viagenie.ca', 'credential': 'beaver', 'username': 'webrtc.websitebeaver@gmail.com' }] };
// const pc = new RTCPeerConnection(servers)
console.log('STEP 1/2 : Created Peer connection - TIME: ' + Date.now());
//File sharing 
var chunkLength = 10000;     // To divide file into chunks
var loaded = 0;        // To calculate percentage of downloaded file on receiver side

//Screen share
let senders = [];

var iceCandidateCount = 1;




// let dataChannel = pc.createDataChannel("MyApp Channel");
class App_holder extends Component {

    constructor(props) {
        super(props);
        // create a ref to store the textInput DOM element
        this.friendsVideo = React.createRef();
        // var peopleList = new Object();  
    }


    state = {
        pc:null,
        dataChannel:null,
        caller: true,
        receiver: false,
        callingOther: false,
        offerReceived: false,
        offerAccepted: false,
        messageReceived: '',
        callConnected: false,
        fileList: null,
        fileURL: null,
        fileName: '',
        downloadButton: false,
        progressBar: false,
        screenShare: false,
        stream: null,
        audioTrack: null,
        videoTrack: null,
        videoOn: true,
        drawerOpen: false,
        drawerLeftOpen: true,
        loggedIn: true,
        peopleList: {},
        friendId:null,
        callInitiated:false,            // To display your profile at beginning
        // senderId:null,
        userBusy:false,
    }

    // To start a video call & creating an offer - updated 
    showFriendsFace = () => {
        const pc = new RTCPeerConnection(servers);
        let dataChannel = pc.createDataChannel("MyApp Channel");
        db.ref('/Users/'+this.props.userId+'/profile_detials/').update({userBusy:true});  // Update DB that the user is busy 
        this.setState({callInitiated:true,userBusy:true});            // To change screen to call view
        this.setState({ pc: pc, dataChannel:dataChannel}, ()=>{
            let promise = new Promise(resolve =>{
                this.initializeListeners(pc,resolve)
            })
            
            dataChannel.addEventListener("open", (event) => {
                //dataChannel.send('hello');
                console.log('Data Channel is open now!' + Date.now());
                //   //beginTransmission(dataChannel);
            });
    
            promise.then(()=>{pc.createOffer()
                .then(offer => {
                    console.log("STEP 5: Created offer on my computer - TIME: " + Date.now());
                    pc.setLocalDescription(offer)
                })
                .then(() => {
                    console.log("STEP 6: Added offer on my PC local Description - TIME: " + Date.now());
                    //console.log('Local Description')
                    //console.log(pc.localDescription);
                    this.sendMessage(this.state.friendId, JSON.stringify({ 'sdp': pc.localDescription }));
                    console.log('STEP 7: Sent offer to peer - TIME: ' + Date.now());
                });
            })
            this.setState({ callingOther: true , CallOtherScreen :false, videoOn:true});
            dataChannel.onmessage = function (event) {
            console.log(event.data);
            }
        });

    }


    initializeListeners = (pc,resolve) =>{
        console.log(' ******************  Inside listener initializer ******************');
        var that = this;
        //const pc1 = that.state.pc;

                // const myVideo = document.getElementById('myVideo');
            const friendsVideo = document.getElementById('friendsVideo');
            const selfView = document.getElementById('self-view');
                navigator.mediaDevices.getUserMedia({ audio: true, video: true })
                    .then((stream) => {
                        this.setState({ stream: stream });
                        const tracks = stream.getTracks();
                        console.log(tracks);
                        tracks.forEach(track => {
                            if (track.kind === 'audio') {
                                this.setState({ audioTrack: track });
                              //  pc.addTrack(track,stream);
                            }
                            if (track.kind === 'video') {
                                this.setState({ videoTrack: track });
                              //  pc.addTrack(track,stream);
                                console.log(track);
                            }
                            
                            // console.log(pc);
                            // pc.addTrack(track, stream)
                            // console.log(pc);
                          senders.push(pc.addTrack(track, stream));
                          console.log(senders);
                            // senders.push(pc.addStream(stream));
                            // console.log(senders);
                            selfView.srcObject = stream;      // Adding self video
                            // console.log(this.state.stream.getTracks());
                        })
                        return stream;
                    }).then(()=>{
                        resolve('done');
                    })
        // var pc  = this.state.pc;

        pc.onicecandidate = (event) => {
            //console.log('testing iterations')
            if (event.candidate) {
                console.log(iceCandidateCount++);
                console.log('STEP 9/16 - ICE canadidates generated in your device - TIME: ' + Date.now())
                that.sendIceMessage(this.props.userId, JSON.stringify({ 'ice': event.candidate }));
                //console.log(event.candidate);
            }
            else {
                // this.sendMessage(this.state.friendId, JSON.stringify({ 'sdp': pc.localDescription }));   // added to check sync
                console.log("STEP 10/17 - *  *  * *  All Ice candidates are sent *  *  * *  - TIME: " + Date.now())
            }
        }


        //------  Listener for Adding Friends Video  --------// 
        pc.addEventListener('track', ({ streams: [stream] }) => {
            console.log('Now added friends stream' + Date.now())
            // console.log(stream);
            friendsVideo.srcObject = stream;
        })

        pc.onaddTrack = ((event) => {
            console.log('Now added friends stream - Inside Track' + Date.now())
            // friendsVideo.srcObject = event.stream;
        })
        pc.onaddStream = ((event) => {
            console.log('Now added friends stream - Inside Stream' + Date.now())
            // friendsVideo.srcObject = event.stream;
        })

        // ------  Listener for Adding Friends Video  --------// 

        pc.onconnectionstatechange = (event) => {
            if (pc.connectionState === "disconnected") {
                console.log('= = = = = Call Ended - - - -  --  ');
                // pc.close();
                // pc.onicecandidate = null;
                // pc.onaddstream = null;
                //  window.location.reload();
                //   db.ref('/ice/').remove();
                //   db.ref('/offerAnswer/').remove();
                this.endCall();
            };
        }
        return 1;
    }

    // callPerson = (key) =>{
    //     console.log(key);
    // }


    // To send Offer Answer - updated 
    sendMessage = (friendId, data) => {
        db.ref('/Users/'+friendId+'/offerAnswer/').push({ sender: this.props.userId, message: data });
    }
    
    //
    sendIceMessage=(userId, data)=>{
        db.ref('/Users/'+this.state.friendId+'/ice/').push({ sender: userId, message: data }).then(()=>{
            console.log('STEP 9.5/16.5 - ICE canadidates sent in your device - TIME: ' + Date.now())
        });
        
        //console.log(data);
        //msg.remove();  // Check this  - This is deleting all the ice candidates on single go
    }
    

    // To read messages from signalling server - to receive offer/answer
    readMessage = (data) => {
        var that = this;
        //console.log(data.val().message);
        var msg = JSON.parse(data.val().message);
        //console.log(msg);
        var sender = data.val().sender;
        if (sender !== that.props.userId) {
            that.setState({friendId:sender});
            if (msg.sdp.type === "offer") {
                that.setState({ messageReceived: msg }, () => {
                   // const pc = new RTCPeerConnection(servers);
                   // let dataChannel = pc.createDataChannel("MyApp Channel");
                  //  that.setState({ offerReceived: true, pc: pc, dataChannel:dataChannel }, ()=>{that.initializeListeners(pc)})  
                  that.setState({ offerReceived: true, userBusy: true})         //To make ANSWER  button active
                //   this.setState({callInitiated:true});          // To make video block active 
                })
                console.log('Received message : OFFER' + Date.now())
            }
            else if (msg.sdp.type === "answer") {
                const pc = that.state.pc;
                pc.ondatachannel = (event) => {
                    console.log('Listening data channel')
                    var channelRec = event.channel;
                    var arrayToStoreChunks = [];
                    channelRec.onmessage = function (event) {
                        that.handleChatMessage(event, arrayToStoreChunks);
                    }
                    console.log(channelRec);
                }
                console.log('Read message : ANSWER')
                pc.setRemoteDescription(new RTCSessionDescription(msg.sdp)).then(() => {
                    console.log('STEP 15: ANSWER added to Remote description - TIME: ' + Date.now())
                    db.ref('/Users/'+that.props.userId+'/ice/').on('child_added', (snapshot) => {
                        that.readIceMessage(snapshot)
                        that.setState({ callConnected: true }) //Caller side message box active 
                        console.log(pc);
                    });
                });
            }
        }
    };

    // To accept the call & send ANSWER back
    acceptCall = () => {
        var that = this;
        const pc = new RTCPeerConnection(servers);
        let dataChannel = pc.createDataChannel("MyApp Channel");
        this.setState({callInitiated:true},()=>{
            this.setState({ offerAccepted: true,pc:pc, dataChannel:dataChannel, videoOn:true})
            // that.initializeListeners(pc)
        let promise = new Promise(resolve =>{
            this.initializeListeners(pc,resolve)
        })
       
        
        
        var msg = this.state.messageReceived;
        console.log('Offer is now Accepted')
        // var pc = that.state.pc;
        promise.then(()=>{
        pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
            .then(() => {
                //console.log('Remote description set after receiving OFFER')
                console.log('STEP 8: Added offer to pc RemoteDescription - TIME: ' + Date.now());
                db.ref('/Users/'+that.props.userId+'/ice/').on('child_added', (snapshot) => {
                    this.readIceMessage(snapshot)
                    console.log("Adding received ICE candidates via OFFER ")
                });
                
                    pc.createAnswer().then(() => { console.log("STEP 12: Created ANSWER ") })
               
            })
            .then(answer => pc.setLocalDescription(answer)
            )
            .then(() => {
                console.log('STEP 13: Added answer to PC localDescription - TIME: ' + Date.now())
                this.sendMessage(that.state.friendId, JSON.stringify({ 'sdp': pc.localDescription }));
                console.log('STEP 14: Sent ANSWER to you')
                this.setState({ callConnected: true })  //Receiver side message box active 
                console.log(pc);
                pc.ondatachannel = function (event) {
                    var channelReceived = event.channel;
                    var arrayToStoreChunks = [];
                    channelReceived.onmessage = function (event) {
                        that.handleChatMessage(event, arrayToStoreChunks);
                    }
                    console.log(channelReceived);
                }

            });
        })
     });  // Inside setState of callInitiated 
    }

    //  To read ICE candidates received from other user
    readIceMessage = (data) => {
        //var path = db.ref('/ice/');
        var msg = JSON.parse(data.val().message);
        var sender = data.val().sender;
        var pc =  this.state.pc;
        if (sender !== this.props.userId) {

            // console.log(pc.remoteDescription);
            if (msg.ice !== undefined) {
                console.log('STEP 11/18: Added remote ice candidate - TIME: ' + Date.now())
                pc.addIceCandidate(new RTCIceCandidate(msg.ice)).then(/*()=>console.log(pc)*/);
                // console.log(msg.ice)
            }
        }
        else { console.log('================ Self generated ICE candidates ================') }
    }

    // ^^^^^^^^^^^^^^ Call now Connected ^^^^^^^^^^^^^^^^^ //
    // Stop Video //
    stopVideo = () => {
        console.log(senders);
        const videoTrack = senders.find(sender => sender.track.kind === 'video');
        console.log(videoTrack);
        if(videoTrack){
            videoTrack.track.stop();
        }
        console.log('Video off');
        this.setState({ videoOn: false }); // Video button toggle
    }

    resumeVideo = () => {
        console.log(senders);
        navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            .then((stream) => {
                // console.log(stream.getTracks());
                // console.log(senders);
                senders.find(sender => sender.track.kind === 'video').replaceTrack(stream.getTracks()[1]);
                // console.log(senders);
                // console.log(stream.getTracks());
                document.getElementById('self-view').srcObject = stream;
            })
        console.log(senders.find(sender => sender.track.kind === 'video'));
        this.setState({ videoOn: true });   // Video button toggle
    }

    // Share screen 
    shareScreenStart = () => {
        // if (!displayMediaStream) {
        //   displayMediaStream = navigator.mediaDevices.getDisplayMedia();
        // }
        navigator.mediaDevices.getDisplayMedia().then(stream => {
            console.log(stream.getTracks());
            console.log(senders);
            senders.find(sender => sender.track.kind === 'video').replaceTrack(stream.getTracks()[0]);
            console.log(senders);
            console.log(stream.getTracks());
            document.getElementById('self-view').srcObject = stream;
            this.setState({ screenShare: true });
        })
    }

    shareScreenStop = () => {
        console.log('Stop share');
        if (!this.state.videoOn) {
            const screenTrack = senders.find(sender => sender.track.kind === 'video');
            screenTrack.track.stop();
            this.setState({ screenShare: false });
        }
        else {
            const shareTrack = senders.find(sender => sender.track.kind === 'video');
            shareTrack.track.stop();
            navigator.mediaDevices.getUserMedia({ audio: true, video: true })
                .then((stream) => {
                    // console.log(stream.getTracks());
                    // console.log(senders);
                    senders.find(sender => sender.track.kind === 'video').replaceTrack(stream.getTracks()[1]);
                    // console.log(senders);
                    // console.log(stream.getTracks());
                    document.getElementById('self-view').srcObject = stream;
                    this.setState({ screenShare: false });
                })
        }
    }


    // To send messages on chat
    sendInputMessage = () => {
        const input = document.getElementById('textInput').value;
        console.log("You entered : " + input)
        //const messageReceived = document.getElementById('messageReceived');
        //messageReceived.innerHTML+="<span class='Your-input' >You : {input}</span>"
        // old working 
        //  document.getElementById('messageReceived').append('You :' + input.value);
        document.getElementById('messageReceived').innerHTML += "<p class='Your-input'><span class='who-tag'>You : </span>" + input + "</p>"
        // document.getElementById('messageReceived').className='Your-input'
        // document.getElementById('messageReceived').innerHTML += '<br></br>';
        //

        /* new working 
        var tag = document.createElement("p");
        var text = document.createTextNode('You :' + input.value);
        //tag.className='Your-input';
        tag.appendChild(text);
        messageReceived.append(text);
        */
        var dataChannel  = this.state.dataChannel;
        var data = {};
        data.type = 'text';
        data.message = input;
        dataChannel.send(JSON.stringify(data));
        document.getElementById('textInput').value = null;  //To clear the input box
        var objDiv = document.getElementById("Conversation-block");
        objDiv.scrollTop = objDiv.scrollHeight;
    }

    // To enable 'Enter' to send message
    enterAsInput = (e) => {
        //console.log(e.keyCode)
        if (e.keyCode === 13) {
            console.log('You clicked enter')
            this.sendInputMessage();
            //  e.target.value =null;
        }
    }

    // To select and load the file
    fileSelect = (e) => {
        this.setState({ progressBar: true });     // Show progress bar
        var fileList = e.target.files;
        var file = fileList[0];
        this.setState({ fileList: file })
        console.log(fileList);
        console.log('File name: ' + file.name + '  File type: ' + file.type + ' File size: ' + file.size);

        const reader = new FileReader();
        reader.readAsDataURL(file);
        const img = document.getElementById('preview')     // To show preview
        // To show the image on screen
        // reader.addEventListener('load', (event) => {
        //  img.src = event.target.result;
        // });

        var progressValue = document.getElementById('progressBar');
        progressValue.max = 100;
        // To get % progress of file uploading 
        reader.addEventListener('progress', (event) => {
            if (event.loaded && event.total) {
                const percent = (event.loaded / event.total) * 100;
                console.log(`Progress: ${Math.round(percent)}`);
                progressValue.value = percent;
                progressValue.innerHTML = 'percent';
            }
        });
        reader.onload = this.onReadAsDataURL;

    }

    // To SEND the file after clicking 'SEND' button  - - - NOT IMPLEMENTED YET - - - 
    sendFileButton = (e) => {
        var input = document.getElementById('inputFile').value;
        // var files = this.files[0];
        // console.log(files);
        //document.getElementById('downloadSection').innerHTML= '<a href="input" download="inputfile">'
        console.log(input);
    }

    // To handle received message on chat/file transfer
    handleChatMessage = (event, arrayToStoreChunks) => {
        var data = JSON.parse(event.data);
        var progressValue = document.getElementById('progressBar');

        console.log(data.type);
        if (data.type === 'file') {
            this.setState({ progressBar: true });
            var fileName = data.fileName;
            var fileType = data.fileType;
            var fileSize = data.fileSize;
            var totalLength = data.totalLength;
            if (totalLength) {            // totalLength only sent on start
                progressValue.max = totalLength;
                console.log(totalLength);
                progressValue.value = 0;
            }
            progressValue.max = fileSize;
            console.log(fileName + fileType + fileSize);
            arrayToStoreChunks.push(data.message); // pushing chunks in array  
            //console.log(data.message.length);
            loaded += data.message.length;
            console.log(loaded);
            progressValue.value = loaded;
            if (data.last) {
                // this.saveToDisk(arrayToStoreChunks.join(''), fileName);
                this.setState({ fileURL: arrayToStoreChunks.join(''), fileName: fileName, downloadButton: true })
                arrayToStoreChunks = []; // resetting array
            }

        }
        else if (data.type === 'text') {
            console.log(data.message);
            console.log('Friend : ' + data.message);
            // console.log(event.data.size);
            // document.getElementById('messageReceived').append('Friend :' + data.message);
            document.getElementById('messageReceived').innerHTML += "<p class='Friend-input'> <span class='who-tag'>Friend : </span>" + data.message + "</p>"
            // document.getElementById('messageReceived').innerHTML += '<br></br>'
            var objDiv = document.getElementById("Conversation-block");
            objDiv.scrollTop = objDiv.scrollHeight;
        }
    }

    // To SEND the file once loaded
    onReadAsDataURL = (event, text) => {
        const that = this;
        var dataChannel  = this.state.dataChannel;
        var file = that.state.fileList;
        //var fileDetailsArray = Object.keys(file).map((key)=>[key,file[key]])
        var data = {}; // data object to transmit over data channel
        data.fileName = file.name;
        data.fileType = file.type;
        data.fileSize = file.size;

        if (event) {
            text = event.target.result;
            data.totalLength = text.length;
        } // on first invocation

        if (text.length > chunkLength) {
            data.message = text.slice(0, chunkLength); // getting chunk using predefined chunk length
            data.type = 'file';
        } else {
            data.message = text;
            data.type = 'file';
            data.last = true;
        }

        dataChannel.send(JSON.stringify(data));

        var remainingDataURL = text.slice(data.message.length);
        if (remainingDataURL.length) {
            that.onReadAsDataURL(null, remainingDataURL); // continue transmitting
        }
    }

    // To save the file received during call
    saveToDisk = () => {
        const fileUrl = this.state.fileURL;
        const fileName = this.state.fileName;
        var save = document.createElement('a');
        save.href = fileUrl;
        save.target = '_blank';
        save.download = fileName || fileUrl;

        var evt = document.createEvent('MouseEvents');
        evt.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);

        save.dispatchEvent(evt);
        (window.URL || window.webkitURL).revokeObjectURL(save.href);
        this.setState({ downloadButton: false })
    }

    deleteReceivedfile = () => {
        this.setState({ downloadButton: false, fileURL: null, fileName: '' });
        var progressValue = document.getElementById('progressBar');
        progressValue.value = 0;
    }

    // To END the call with friend
    endCall = () => {
        this.stopVideo(); //Stop Video;
        var pc = this.state.pc;
        this.setState({callInitiated:false, userBusy:false});            // To change screen to call view
        senders=[];                                     // making senders back to null
        var frienndice = db.ref('/Users/'+this.state.friendId+'/ice/');
        frienndice.remove();
        var friendOfferAnswer = db.ref('/Users/'+this.state.friendId+'/offerAnswer/');
        friendOfferAnswer.remove();
        var ice = db.ref('/Users/'+this.props.userId+'/ice/');
        //console.log(msg);
        ice.remove();

        var offerAnswer = db.ref('/Users/'+this.props.userId+'/offerAnswer/');
        offerAnswer.remove();
        //console.log(msg);
        if(pc){
            pc.close();
        }

        db.ref('/Users/'+this.props.userId+'/ice/').off();      // Stop listening for ice candidates after call end 

        //window.location.reload();
        this.setState({ offerReceived: false, callingOther: false, pc:null,friendId:null, callConnected:false});
        
        document.getElementById('messageReceived').innerHTML='';
    }
    loginButton = () => {
        const loggedIn = !this.state.loggedIn;
        this.setState({ loggedIn: loggedIn });
    }
    drawerToggle = () => {
        let updated = !this.state.drawerOpen;
        this.setState({ drawerOpen: updated });
    }
    drawerLeftToggle = () => {
        let updated = !this.state.drawerLeftOpen;
        this.setState({ drawerLeftOpen: updated });
    }

    CallOtherScreen = (key) =>{
        console.log(key);
        if(this.state.friendId===null){
            this.setState(prevState =>({
                CallOtherScreen:!prevState.CallOtherScreen
            })) 
        }
        this.setState({friendId:key});
        if(this.state.friendId===key){
            this.setState(prevState =>({
                CallOtherScreen:!prevState.CallOtherScreen
            }))
        }
       
    }



    render() {
        let sideDrawerClasses = ['Side-drawer', 'Drawer-close'];
        let ContactList = null;
        let WelcomeScreen = null;
        let CallOtherScreen  = null;
        let OfferReceivedScreen =null;
        if (this.state.drawerOpen) {
            sideDrawerClasses = ['Side-drawer', 'Drawer-open'];
        }
        let sideDrawerClassesLeft = ['Side-drawer-left', 'Left-Drawer-close'];
        if (this.state.drawerLeftOpen) {
            sideDrawerClassesLeft = ['Side-drawer-left', 'Left-Drawer-open'];
        }

        ContactList = (

            <div className='Contact-list'>
                {/* <p >Your ID : {this.props.userId}  </p> */}

                <p>Contacts</p>

                {Object.keys(this.state.peopleList).map((key) => {
                    // console.log(key);
                    // console.log(this.state.peopleList[key].userEmail);                     
                    if(key!==this.props.userId){
                        // console.log(this.state.peopleList[key]);
                        if (this.state.peopleList[key].isActive===true && this.state.peopleList[key].userBusy===false) {
                            return (
                                <div className='Contact-list-item-online' key={key} onClick={()=>this.CallOtherScreen(key)}>
                                <img src={this.state.peopleList[key].userPic} className='contactListPic' />
                                <span>Click to call</span>
                                <p key={key} className='onlinePerson' id='onlinePerson' >  {this.state.peopleList[key].userName} </p>
                                </div>   )
                        }
                        else if(this.state.peopleList[key].isActive===false && this.state.peopleList[key].userBusy===false){
                            return (
                                <div className='Contact-list-item-offline' key={key} onClick={()=>this.CallOtherScreen(key)} >
                                <img src={this.state.peopleList[key].userPic} className='contactListPic' />
                                <span>User not online</span>
                                <p key={key} className='offlinePerson' id='offlinePerson'>  {this.state.peopleList[key].userName} </p>
                                </div>
                            )
                        }
                        else if(this.state.peopleList[key].isActive===true && this.state.peopleList[key].userBusy===true){
                            return (
                                <div className='Contact-list-item-busy' key={key} onClick={()=>this.CallOtherScreen(key)} >
                                <img src={this.state.peopleList[key].userPic} className='contactListPic' />
                                <span>User is Busy</span>
                                <p key={key} className='BusyPerson' id='BusyPerson'>  {this.state.peopleList[key].userName} </p>
                                </div>
                            )
                        }

                    }

                })}

            </div>
        )

        WelcomeScreen = (
            !this.state.callInitiated && !this.state.CallOtherScreen &&  !this.state.offerReceived &&
            <div className='Welcome-screen'>
                <img className='Main-profile-pic' src={this.props.userPic} />
                <p>Hello, {this.props.userName}</p>
            </div>
        )
        CallOtherScreen=(
            this.state.CallOtherScreen &&
            <div className='call-other-screen'>
                <div className='self-pic-and-name'>
                    <img className='Main-profile-pic' src={this.props.userPic} />
                    <p >You</p>
                </div>
                {this.state.peopleList[this.state.friendId].isActive && 
                <div className='Connect-now-button-block' >
                <button className='Connect-now-button' onClick={()=>{this.showFriendsFace()}} >Connect now</button>
                </div>}
                {!this.state.peopleList[this.state.friendId].isActive && 
                <div className='Connect-now-button-block' >
                <button className='Cannot-connect-now-button'  >User not Online </button>
                </div>}
                <div className='Friend-pic-and-name'>
                    <img className='Main-profile-pic' src={this.state.peopleList[this.state.friendId].userPic} />  
                    <p>{this.state.peopleList[this.state.friendId].userName}</p>   
                </div>
            </div>
        )
        OfferReceivedScreen=(
            this.state.offerReceived &&
            <div className='call-other-screen'>
                <div className='self-pic-and-name'>
                    <img className='Main-profile-pic' src={this.props.userPic} />
                    <p >You</p>
                </div>
                {this.state.peopleList[this.state.friendId].isActive && 
                <div className='Connect-now-button-offer' >
                {/* <button className='Connect-now-button' onClick={()=>{this.showFriendsFace()}} >Connect now</button> */}
                <Button className='answerButton' variant="contained" hidden={!this.state.offerReceived} onClick={this.acceptCall} style={{ backgroundColor: 'green', zIndex: '200' }} > Answer </Button>
                <Button variant="contained" color="secondary" onClick={this.endCall} style={{ margin: '10px', zIndex: '200' }}> Reject </Button>
                </div>}
                <div className='Friend-pic-and-name'>
                    <img className='Main-profile-pic' src={this.state.peopleList[this.state.friendId].userPic} />  
                    <p>{this.state.peopleList[this.state.friendId].userName}</p>   
                </div>
            </div>
        )
        return (
            <div className="App">
                <div className="App-header">
                    <img className='Contacts-drawer-button' src={leftSide_drawer} onClick={this.drawerLeftToggle} />
                    <img className='Side-drawer-button' src={side_drawer} onClick={this.drawerToggle} />
                    <span className='Hello-name'>Contacts</span>
                    <p>Have a conversation with privacy</p>
                </div>
                {WelcomeScreen}
                {CallOtherScreen}
                {OfferReceivedScreen}
                {this.state.callInitiated && 
                <div className='Videos-block' >
                    <div className='caption'>
                        <p>Connect with loved ones</p>
                    </div>

                    <div className='Both-Videos'>
                        <video id="friendsVideo" className='friendsVideo' ref={this.friendsVideo} autoPlay > sdfsf</video>

                        <div className='myVideo-and-controls'>
                            <img id="videoOn" className='videoOn' src={video_off} onClick={this.resumeVideo} hidden={this.state.videoOn} alt='Video on' />
                            <img id="videoOff" className='videoOff' src={video_on} onClick={this.stopVideo} hidden={!this.state.videoOn} alt='Video off' />
                            <img id="screenShare" className='Start-share' src={screen_share} hidden={!this.state.callConnected || this.state.screenShare} onClick={this.shareScreenStart} />
                            <img id="screenShare" className='Stop-share' src={screen_share} hidden={!this.state.screenShare} onClick={this.shareScreenStop} />
                            {/* <button className='Stop-share' hidden={!this.state.screenShare} onClick={this.shareScreenStop}>Stop share</button> */}
                            <video id="self-view" className='self-view' autoPlay muted ></video>
                            {/* <Self_video/> */}
                        </div>

                        <br></br>
                        {/* {!this.state.offerReceived && !this.state.callingOther &&
                            <Button variant="contained" color="primary" onClick={this.showFriendsFace} style={{ margin: '10px', zIndex: '200' }}> Call </Button>
                        } */}
                        {/* {this.state.offerReceived && !this.state.offerAccepted &&
                            <Button className='answerButton' variant="contained" hidden={!this.state.offerReceived} onClick={this.acceptCall} style={{ backgroundColor: 'green', zIndex: '200' }} > Answer </Button>
                        } */}
                        {/* {(this.state.offerReceived || this.state.callConnected) && */}
                        <Button variant="contained" color="secondary" onClick={this.endCall} style={{ margin: '10px', zIndex: '200' }}> End Call </Button>
                        {/* } */}
                        <br></br>
                    </div>
                    </div> } {/*End Videos class */}

                <div className={sideDrawerClassesLeft.join('  ')}>
                    <div className='All-contacts-div'>
                    {ContactList}
                    </div>
                    <div className='Sign-out-button-div'>
                    <button className='Sign-out-button' onClick={() => this.props.signOut()}>Sign out</button>
                    </div>
                </div>

                <div className={sideDrawerClasses.join('  ')} style={{ paddingTop: '20px' }}>
                    <div className=' split Conversation-block' id='Conversation-block'>
                        <p> Conversation </p>
                        <div id='messageReceived'>

                        </div>
                    </div>

                    <div className='Message-input-box'>
                        <input type='text' id='textInput' className='textInput' placeholder="Enter your message here " disabled={!this.state.callConnected} onKeyDown={(e) => { this.enterAsInput(e) }} style={{ width: '150%', height: '1.75em' }}></input>
                        <br></br>
                        <button variant="contained" className='sendButton' disabled={!this.state.callConnected} onClick={this.sendInputMessage}>SEND</button>
                        <br></br>
                    </div>
                    {/* <label htmlFor="inputFile" hidden={this.state.callConnected} className="custom-file-upload" > Custom Upload </label>
            <input id='inputFile' disabled={!this.state.callConnected} onChange={(e) => { this.fileSelect(e) }} type="file"/>  */}
                    <br></br>
                    {this.state.callConnected &&
                        <div className='File-options' >
                            <input id='inputFile' className='inputFile' type='file' disabled={!this.state.callConnected} onChange={(e) => { this.fileSelect(e) }} size="60" style={{ display: 'block', float: 'left', padding: '22px 15px 0 15px' }}></input>
                            <progress id='progressBar' hidden={!this.state.progressBar} value='0' max='0'></progress>
                            <Button className='Save-button' size='small' onClick={this.saveToDisk} hidden={!this.state.downloadButton} disabled={!this.state.downloadButton} variant="contained" color="default" startIcon={<SaveIcon />} style={{ marginLeft: '15px', padding: '5px', borderRadius: '10px' }}>Save</Button>
                            <IconButton aria-label="delete" onClick={this.deleteReceivedfile} disabled={!this.state.downloadButton}> <DeleteIcon /> </IconButton>
                        </div>}
                    {/* <button  onClick={(e)=>{this.sendFileButton(e)}}  style={{display:'block', float:'left', marginLeft:'20px'}} >Send file</button> */}
                    {/* <div id='downloadSection' className='downloadSection'>
              <img id='preview' className='preview' />
            </div> */}

                </div>
            </div> //App end div
        );

      

    }
    componentDidMount() {
        const that = this;
        var pc =  that.state.pc;
       

        db.ref('/Users/').on('child_added', function (userIdList) {
            userIdList.forEach(function (profile_details) {

                    let userId = profile_details.val().userId;
                    let userName = profile_details.val().userName;
                    let userEmail = profile_details.val().userEmail;
                    let isActive = profile_details.val().isActive;
                    let userPic = profile_details.val().userPic;
                    let userBusy = profile_details.val().userBusy;
                   // that.setState({ peopleList: { ...that.state.peopleList, [userId]: false } });  //old
                    that.setState(prevState => ({
                        peopleList: {
                          ...prevState.peopleList,           // copy all other key-value pairs of peopleList object
                          [userId]: {                     // specific object/user-detail of peopleList object
                            ...prevState.peopleList.userId,   // copy all single user key-value pairs
                            userId : userId,                    // update the name property, assign a new value                 
                            userName : userName,
                            userEmail : userEmail,
                            isActive : isActive,
                            userPic : userPic,
                            userBusy: userBusy, // update value of specific key
                          }
                        }
                      }))  
                    //}
                // profile_details.forEach(function (names) {
                //     // console.log(names.val());
                // })
            })
            console.log(that.state.peopleList);
        })
        db.ref('/Users/').on('child_changed', function (userIdList) {
            userIdList.forEach(function (profile_details) {
                // console.log(profile_details.val());
                // console.log(profile_details.val());
                // console.log(profile_details.val().userId);
                let userId = profile_details.val().userId;
                let userName = profile_details.val().userName;
                let userEmail = profile_details.val().userEmail;
                let isActive = profile_details.val().isActive;
                let userPic = profile_details.val().userPic;
                let userBusy = profile_details.val().userBusy;

                that.setState(prevState => ({
                    peopleList: {
                      ...prevState.peopleList,           // copy all other key-value pairs of peopleList object
                      [userId]: {                     // specific object/user-detail of peopleList object
                        ...prevState.peopleList.userId,    // copy all single user key-value pairs
                        userId : userId,                    // update the name property, assign a new value                 
                        userName : userName,
                        userEmail : userEmail,
                        isActive : isActive,
                        userPic : userPic, 
                        userBusy: userBusy,// update value of specific key
                      }
                    }
                  }))    
                
                // profile_details.forEach(function (names) {
                //     // console.log(names.val());
                // })
            })
            console.log(that.state.peopleList);
        })


        // Listen for Offer / Answer on firebase 
        db.ref("/Users/"+that.props.userId+'/offerAnswer/').on('child_added', (snapshot) => {
        that.readMessage(snapshot)
        });

        db.ref("/Users/"+that.props.userId+'/offerAnswer/').on('child_changed', (snapshot) => {
            that.readMessage(snapshot)
            console.log('new change');
            });

        //  To change status on Disconnect //
        var presenceRef = db.ref('/Users/'+that.props.userId+'/profile_detials/');
        presenceRef.onDisconnect().update({isActive:false,userBusy:false});
        
        var deleteIceOfferRef = db.ref('/Users/'+that.props.userId);
        deleteIceOfferRef.onDisconnect().update({ice:null,offerAnswer:null});
        //  ^^^^^ To change status on Disconnect ^^^^^ //

    }

    // componentWillUnmount() {
    //     const videoTrack = senders.find(sender => sender.track.kind === 'video');
    //     videoTrack.track.stop();
    //     console.log('Video off');
    // }

}

export default App_holder;