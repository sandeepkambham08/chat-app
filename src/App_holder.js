import React, { Component } from 'react';
import './App.css';
import './All-person-and-friends.css';
import * as firebase from 'firebase';

// Image imports //
import video_off from './media/video_off.png';
import video_on from './media/video_on.png';
import audio_icon from './media/audio_icon.png';
import audio_icon_off from './media/audio_officon.png';
import side_drawer from './media/side_drawer_new.png';
import leftSide_drawer from './media/leftSide_drawer.png';
import friendRequest from './media/leftSide_drawer1.png';
import screen_share from './media/screen_share.png';
import notification_dot from './media/notification_dot.png'
// ^^^ Image imports ^^^ //

// Import Buttons for file sharing options// 
import Button from '@material-ui/core/Button';
import SaveIcon from '@material-ui/icons/Save';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
// ^^^ Import Buttons for file sharing options ^^^// 

// Alert UI //
import swal from '@sweetalert/with-react';
// import AllContacts from './AllContacts/AllContacts';
import FriendsList from './FriendList/FriendList';
import CallOthersScreen from './CallOtherScreen/CallOtherScreen';
import Discover from './Discover/Discover';
import FriendRequestsReceived from './FriendRequestsReceived/FriendRequestsReceived';



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

// Servers for webRTC connection establishment
var servers = { 'iceServers': [{ 'urls': 'stun:stun01.sipphone.com' }, { 'urls': 'stun:stun.services.mozilla.com' }, { 'urls': 'stun:stun.l.google.com:19302' }, { 'urls': 'turn:numb.viagenie.ca', 'credential': 'beaver', 'username': 'webrtc.websitebeaver@gmail.com' }] };


//File sharing variables
var chunkLength = 10000;     // To divide file into chunks
var loaded = 0;        // To calculate percentage of downloaded file on receiver side

//Array to store media tracks  
let senders = [];

//Counter for ice candidates 
var iceCandidateCount = 1;

const ScreenWidth = window.screen.width;
// const ScreenHeight = window.screen.height;

// Main class begin // 
class App_holder extends Component {

    constructor(props) {
        super(props);
        this.friendsVideo = React.createRef();
    }


    state = {
        pc: null,                       // To  store generated peer connnection    
        dataChannel: null,              // Store dataChannel        
        callingOther: false,           // To check if user is calling friend 
        offerReceived: false,          // To check if user is receiving a call 
        offerAccepted: false,          // To detect if call is accepted
        messageReceived: '',           // Store received msg 
        callConnected: false,          // To maintain if call is connected 
        fileList: null,                // File sharing - list of files
        fileURL: null,                 // File sharing - download url
        fileName: '',                  // File sharing - name
        downloadButton: false,         // Download button visibility
        progressBar: false,            // Progress bar visibility 
        screenShare: false,            // Screenshare state                 
        videoOn: true,                 // To control video toggle button
        audioOn: true,                 // To control audio toggle button
        drawerOpen: false,             // Messages drawer 
        drawerLeftOpen: false,          // Contacts drawer is initially  open 
        peopleList: {},                // Store available contacts 
        friendId: null,                 // Friend ID to connect 
        callInitiated: false,           // To display your profile at beginning
        callInitiatedNew: false,        //*** To show  only video screen **************************
        userBusy: false,                // To  maintain user state during a call
        friendRequestsSent: [],         // To maintain friend requests sent data 
        friendRequestsReceived: [],     // To maintain friend requests received data
        friendList: {},                 // To maintain friend list 
        // peopleListLoaded:false         // To make sure that the people list is fully loaded with data 
        friendListIds: [],              // To maintain friend list Ids
        CallOtherScreen: false,         // To show connect now screen 

    }

    // Toggle screen to call other screen // 
    CallOtherScreen = (key) => {
        if (key) {
            // console.log(key);
            if (!this.state.userBusy) {
                if (this.state.friendId === null) {
                    this.setState(prevState => ({
                        CallOtherScreen: !prevState.CallOtherScreen
                    }))
                }
                this.setState({ friendId: key });
                if (this.state.friendId === key) {
                    this.setState(prevState => ({
                        CallOtherScreen: !prevState.CallOtherScreen
                    }))
                }
            }
        }
        else {
            if (!this.state.userBusy) {
                if (this.state.friendId === null) {
                    this.setState(prevState => ({
                        CallOtherScreen: !prevState.CallOtherScreen
                    }))
                }
            }
        }

    }



    // To start a video call & creating an offer - updated 
    showFriendsFace = () => {
        const pc = new RTCPeerConnection(servers);
        console.log('STEP 1/2 : Created Peer connection - TIME: ' + Date.now());
        let dataChannel = pc.createDataChannel("MyApp Channel");
        db.ref('/Users/' + this.props.userId + '/profile_detials/').update({ userBusy: true });  // Update DB that the user is busy 
        this.setState({ callInitiated: true, userBusy: true });            // To change screen to call view
        this.setState({ callInitiatedNew: true });
        this.setState({ audioOn: true });
        this.setState({ pc: pc, dataChannel: dataChannel }, () => {
            let promise = new Promise(resolve => {
                this.initializeListeners(pc, resolve)                //Promise to get media tracks before creating offer 
            })

            dataChannel.addEventListener("open", (event) => {
                //dataChannel.send('hello');
                console.log('Data Channel is open now!' + Date.now());
                //   //beginTransmission(dataChannel);
            });

            promise.then(() => {
                pc.createOffer()
                .then(offer => {
                    console.log("STEP 5: Created offer on my computer - TIME: " + Date.now());
                    pc.setLocalDescription(offer)
                })
                .then(() => {
                    console.log("STEP 6: Added offer on my PC local Description - TIME: " + Date.now());
                    this.sendMessage(this.state.friendId, JSON.stringify({ 'sdp': pc.localDescription }));
                    console.log('STEP 7: Sent offer to peer - TIME: ' + Date.now());
                });
            })
            this.setState({ callingOther: true, CallOtherScreen: false, videoOn: true });
            dataChannel.onmessage = function (event) {
                console.log(event.data);
            }
        });

    }

    // Initialize - Media devices and listerners to  detect iceCandidates / tracks / state changes
    initializeListeners = (pc, resolve) => {
        console.log(' ******************  Inside listener initializer ******************');
        var that = this;
        //const pc1 = that.state.pc;

        // const myVideo = document.getElementById('myVideo');
        const friendsVideo = document.getElementById('friendsVideo');
        const selfView = document.getElementById('self-view');
        navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            .then((stream) => {
                // this.setState({ stream: stream });
                const tracks = stream.getTracks();
                tracks.forEach(track => {
                    senders.push(pc.addTrack(track, stream));
                    selfView.srcObject = stream;      // Adding self video
                    
                })
                return stream;
            }).then(() => {
                resolve('done');
            })
        // var pc  = this.state.pc;

        // To detect new ice candidates generated after setting local description
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                console.log(iceCandidateCount++)
                console.log('STEP 9/16 - ICE canadidates generated in your device - TIME: ' + Date.now())
                that.sendIceMessage(this.props.userId, JSON.stringify({ 'ice': event.candidate }));
            }
            else {
                // this.sendMessage(this.state.friendId, JSON.stringify({ 'sdp': pc.localDescription }));   // added to check sync
                console.log("STEP 10/17 - *  *  * *  All Ice candidates are sent *  *  * *  - TIME: " + Date.now())
            }
        }


        //------  Listener for Adding Friends Video  --------// 
        pc.addEventListener('track', ({ streams: [stream] }) => {
            console.log('Now added friends stream' + Date.now())
            friendsVideo.srcObject = stream;
        })

        // ------  Listener for Adding Friends Video  --------// 

        // To detect call ended by  friend // 
        pc.onconnectionstatechange = (event) => {
            if (pc.connectionState === "disconnected") {
                console.log('= = = = = Call Ended - - - -  --  ');
                this.endCall();
            };
        }
        // return 1;
    }


    // To send Offer/Answer to friend- updated 
    sendMessage = (friendId, data) => {
        db.ref('/Users/' + friendId + '/offerAnswer/').push({ sender: this.props.userId, message: data });
    }

    // To send ice candidates to friend
    sendIceMessage = (userId, data) => {
        db.ref('/Users/' + this.state.friendId + '/ice/').push({ sender: userId, message: data }).then(() => {
            console.log('STEP 9.5/16.5 - ICE canadidates sent in your device - TIME: ' + Date.now())
        });
    }


    // To read OFFER/ANSWER from signalling server - firebase own node listening
    readMessage = (data) => {
        var that = this;
        var msg = JSON.parse(data.val().message);
        var sender = data.val().sender;
        if (sender !== that.props.userId) {
            that.setState({ friendId: sender });
            if (msg.sdp.type === "offer") {                         // If read message is OFFER 
                that.setState({ messageReceived: msg }, () => {
                    // const pc = new RTCPeerConnection(servers);
                    // let dataChannel = pc.createDataChannel("MyApp Channel");
                    //  that.setState({ offerReceived: true, pc: pc, dataChannel:dataChannel }, ()=>{that.initializeListeners(pc)})  
                    that.setState({ offerReceived: true, userBusy: true, CallOtherScreen: false })         //To make ANSWER  button active
                    db.ref('/Users/' + this.props.userId + '/profile_detials/').update({ userBusy: true });  // Update DB that the user is busy 
                    //   this.setState({callInitiated:true});          // To make video block active 
                })
                console.log('Received message : OFFER' + Date.now())
            }
            else if (msg.sdp.type === "answer") {                   // If read message is ANSWER after sending offer 
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
                    db.ref('/Users/' + that.props.userId + '/ice/').on('child_added', (snapshot) => {
                        that.readIceMessage(snapshot)
                        that.setState({ callConnected: true }) //Caller side message box active 
                        // console.log(pc);
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
        this.setState({ callInitiated: true, callInitiatedNew: true }, () => {
            this.setState({ offerAccepted: true, pc: pc, dataChannel: dataChannel, videoOn: true })
            this.setState({ audioOn: true });
            // that.initializeListeners(pc)
            let promise = new Promise(resolve => {
                this.initializeListeners(pc, resolve)              //Promise to get media tracks before creating offer 
            })

            var msg = this.state.messageReceived;
            console.log('Offer is now Accepted')
            // var pc = that.state.pc;
            promise.then(() => {
                pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
                    .then(() => {
                        //console.log('Remote description set after receiving OFFER')
                        console.log('STEP 8: Added offer to pc RemoteDescription - TIME: ' + Date.now());
                        db.ref('/Users/' + that.props.userId + '/ice/').on('child_added', (snapshot) => {
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
        var pc = this.state.pc;
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
        if (videoTrack) {
            videoTrack.track.enabled = false;
            // videoTrack.track.stop();
        }
        console.log('Video off');
        this.setState({ videoOn: false }); // Video button toggle
    }

    // Resume Video //
    resumeVideo = () => {
        console.log(senders);
        navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            .then((stream) => {
                
                senders.find(sender => sender.track.kind === 'video').replaceTrack(stream.getTracks()[1]);
                
                document.getElementById('self-view').srcObject = stream;
            })
        console.log(senders.find(sender => sender.track.kind === 'video'));
        this.setState({ videoOn: true });   // Video button toggle
    }

    // Stop Audio //
    stopAudio = () => {
        const audioTrack = senders.find(sender => sender.track.kind === 'audio');
        console.log(audioTrack);
        if (audioTrack) {
            audioTrack.track.enabled = false;
            console.log('Audio off');
        }

        this.setState({ audioOn: false }); // Audio stop button
    }

    // Resume Audio //
    resumeAudio = () => {
        const audioTrack = senders.find(sender => sender.track.kind === 'audio');
        console.log(audioTrack);
        if (audioTrack) {
            audioTrack.track.enabled = true;
            console.log('Audio on');
        }
        this.setState({ audioOn: true }); // Audio button toggle
    }

    // Start Share screen //
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

    // Stop Share screen //
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
                    
                    senders.find(sender => sender.track.kind === 'video').replaceTrack(stream.getTracks()[1]);
                    
                    document.getElementById('self-view').srcObject = stream;
                    this.setState({ screenShare: false });
                })
        }
    }


    // To send messages on chat //
    sendInputMessage = () => {
        const input = document.getElementById('textInput').value;
        // console.log("You entered : " + input)

        document.getElementById('messageReceived').innerHTML += "<p class='Your-input'><span class='who-tag'>You : </span>" + input + "</p>"

        var dataChannel = this.state.dataChannel;
        var data = {};
        data.type = 'text';
        data.message = input;
        dataChannel.send(JSON.stringify(data));
        document.getElementById('textInput').value = null;  //To clear the input box
        var objDiv = document.getElementById("Conversation-block");
        objDiv.scrollTop = objDiv.scrollHeight;
    }

    // To enable 'Enter' to send message  // 
    enterAsInput = (e) => {
        //console.log(e.keyCode)
        if (e.keyCode === 13) {
            // console.log('You clicked enter')
            this.sendInputMessage();
            //  e.target.value =null;
        }
    }


    // To handle received message on chat/file transfer
    handleChatMessage = (event, arrayToStoreChunks) => {
        var data = JSON.parse(event.data);
        var progressValue = document.getElementById('progressBar');

        console.log(data.type);
        if (data.type === 'file') {
            this.setState({ progressBar: true, drawerOpen: true });
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
            this.setState({ drawerOpen: true });
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
        // const img = document.getElementById('preview')     // To show preview

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


    // To SEND the file once loaded
    onReadAsDataURL = (event, text) => {
        const that = this;
        var dataChannel = this.state.dataChannel;
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

    // To save the file received during call //
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
    // Delete received file //
    deleteReceivedfile = () => {
        this.setState({ downloadButton: false, fileURL: null, fileName: '' });
        var progressValue = document.getElementById('progressBar');
        progressValue.value = 0;
    }

    // To END the call with friend
    endCall = (rejected) => {
        
        // To empty the chat screen after the call 
        if(rejected === 'false'){
            document.getElementById('messageReceived').innerHTML = '';
        }
        

        // To detect call rejection by friend!
        if (rejected === 'true') {
            db.ref('/Users/' + this.state.friendId + '/rejected/').update({ callRejected: true });
        }
        // Stop Video / Audio after call  // 
        this.stopVideo();
        this.stopAudio();

        // Making senders back to null
        senders = [];

        // To change screen to call view               
        this.setState({ callInitiated: false, userBusy: false, callInitiatedNew: false });

        // Close peerConnection // 
        var pc = this.state.pc;
        //console.log(msg);
        if (pc) {
            pc.close();
        }

        db.ref('/Users/' + this.props.userId + '/profile_detials/').update({ userBusy: false });

        // Remove friend offerAnswer / ice  //
        var friendOfferAnswer = db.ref('/Users/' + this.state.friendId + '/offerAnswer/');
        friendOfferAnswer.remove();
        var frienndice = db.ref('/Users/' + this.state.friendId + '/ice/');
        frienndice.remove();

        // Remove self offerAnswer / ice //
        var offerAnswer = db.ref('/Users/' + this.props.userId + '/offerAnswer/');
        offerAnswer.remove();
        var ice = db.ref('/Users/' + this.props.userId + '/ice/');
        //console.log(msg);
        ice.remove();


        db.ref('/Users/' + this.props.userId + '/ice/').off();      // Stop listening for ice candidates after call end 
        db.ref('/Users/' + this.props.userId + '/rejected/').update({ callRejected: false });  // To make call rejection back to false after end!


        this.setState({ offerReceived: false, callingOther: false, pc: null, friendId: null, callConnected: false });



        // Make iceCandidate counter value again to initial
        iceCandidateCount = 1;
    }


    // Message drawer toggle // 
    drawerToggle = () => {
        this.setState(prevState=>({ 
            drawerOpen: !prevState.drawerOpen }));
    }

    // Contacts drawer toggle // 
    drawerLeftToggle = () => {
        this.setState(prevState => ({
            drawerLeftOpen: !prevState.drawerLeftOpen
        }));
    }

    // Friend request function //

    sendFriendRequest = (key, details) => {
        console.log('Person ID : ', key, details);
        // db.ref('/Users/'+key+'/friend_requests/').push({friendId:this.props.userId});
        // db.ref('/Users/'+this.props.userId+'/friend_request_sent/').push({friendId:key});
        db.ref('/Users/' + this.props.userId + '/friend_requests_sent/' + key).set({ userId: details.userId, userEmail: details.userEmail, userName: details.userName, userPic: details.userPic });
        db.ref('/Users/' + key + '/friend_requests_received/' + this.props.userId).set({ userId: this.props.userId, userEmail: this.props.userEmail, userName: this.props.userName, userPic: this.props.userPic });

        // db.ref('/Users/'+this.props.userId+'/profile_detials/').update({userBusy:true}); 
    }

    acceptFriendRequest = (key, details) => {
        const myDetails = this.state.peopleList[this.props.userId];
        
        db.ref('/Users/' + this.props.userId + '/friend_list/' + key).update({ userId: details.userId, userEmail: details.userEmail, userName: details.userName, userPic: details.userPic, userBusy: details.userBusy, isActive: details.isActive });
        db.ref('/Users/' + key + '/friend_list/' + this.props.userId).update({ userId: myDetails.userId, userEmail: myDetails.userEmail, userName: myDetails.userName, userPic: myDetails.userPic, userBusy: myDetails.userBusy, isActive: myDetails.isActive });
        db.ref('/Users/' + this.props.userId + '/friend_requests_received/' + key).remove();
        db.ref('/Users/' + key + '/friend_requests_sent/' + this.props.userId).remove();
        this.setState(prevState => ({
            friendRequestsReceived: prevState.friendRequestsReceived.filter((id) => id !== key)
        }))
    }

    declineFriendRequest = (key, details) =>{
        db.ref('/Users/' + this.props.userId + '/friend_requests_received/' + key).remove();
        db.ref('/Users/' + key + '/friend_requests_sent/' + this.props.userId).remove();
        this.setState(prevState => ({
            friendRequestsReceived: prevState.friendRequestsReceived.filter((id) => id !== key)
        }))
    }

    backFromCallOtherScreen = () => {
        this.setState({ CallOtherScreen: false });
    }


    render() {
        let sideDrawerClasses = ['Side-drawer', 'Drawer-close'];                    //Friend request drawer classes 
        let sideDrawerClassesLeft = ['Side-drawer-left', 'Left-Drawer-close'];      //Contact drawer classes 
        let sideDrawerClassesMessages = ['Side-drawer-messages', 'Drawer-close-messages'];                    //Friend request drawer classes 

        // Different screen classes // 
        let WelcomeScreen = null;
        let OfferReceivedScreen = null;

        if (this.state.drawerOpen) {
            sideDrawerClasses = ['Side-drawer', 'Drawer-open'];
            sideDrawerClassesMessages = ['Side-drawer-messages', 'Drawer-open-messages']
        }
        if (this.state.drawerLeftOpen && !this.state.userBusy) {
            sideDrawerClassesLeft = ['Side-drawer-left', 'Left-Drawer-open'];
        }
        if (this.state.drawerLeftOpen && this.state.userBusy) {
            sideDrawerClassesLeft = ['Side-drawer-left', 'Left-Drawer-open', 'left-drawer-userBusy'];
        }




        // Welcome screen to user after login // 
        WelcomeScreen = (
            !this.state.callInitiated && !this.state.CallOtherScreen && !this.state.offerReceived && !this.state.callInitiatedNew &&
            <div className='Welcome-screen'>
                <img className='Main-profile-pic' alt="Main-profile-pic"  src={this.props.userPic} />
                <p>Hello, {this.props.userName}</p>
            </div>
        )

        // Screen during receving a offer from a friend // 
        OfferReceivedScreen = (
            this.state.offerReceived &&
            <div className='call-other-screen'>
                <div className='self-pic-and-name'>
                    <img className='Main-profile-pic' alt="Main-profile-pic" src={this.props.userPic} />
                    <p >You</p>
                </div>
                {this.state.peopleList[this.state.friendId].isActive &&
                    <div className='Connect-now-button-offer' >
                        {/* <button className='Connect-now-button' onClick={()=>{this.showFriendsFace()}} >Connect now</button> */}
                        <Button className='answerButton' variant="contained" hidden={!this.state.offerReceived} onClick={this.acceptCall} style={{ backgroundColor: 'green', zIndex: '200', color: 'antiquewhite' }} > Answer </Button>
                        <Button variant="contained" color="secondary" onClick={() => { this.endCall('true') }} style={{ margin: '10px', zIndex: '200' }}> Reject </Button>
                    </div>}
                <div className='Friend-pic-and-name'>
                    <img className='Main-profile-pic' alt='Main-profile-pic' src={this.state.peopleList[this.state.friendId].userPic} />
                    <p>{this.state.peopleList[this.state.friendId].userName}</p>
                </div>
            </div>
        )



        // Main return of the class // 
        if (!this.state.callInitiatedNew) {
            let notification_show = this.state.friendRequestsReceived.length - 1 > 0;
            // console.log(notification_show)
            return (
                <div className="App">
                    <div className="App-header">
                        <img className='Contacts-drawer-button' alt="Contacts-drawer-button" src={leftSide_drawer} onClick={this.drawerLeftToggle} />
                        <span className='Hello-name'>Discover</span>
                        {!this.state.callInitiated &&
                            <div>
                            <img className='Side-drawer-button' alt="Side-drawer-button" src={friendRequest} onClick={this.drawerToggle} />
                            </div>}
                        {notification_show && 
                        <img className='notification-icon' alt="Side-drawer-button" src={notification_dot}/>
                        }
                        <span className='Hello-name-right'>Notifications</span>
                        <p>Have a conversation with privacy</p>
                    </div>

                    {WelcomeScreen}

                    {this.state.CallOtherScreen && !this.state.userBusy &&
                        <CallOthersScreen
                            peopleList={this.state.peopleList}
                            friendId={this.state.friendId}
                            CallOtherScreen={this.state.CallOtherScreen}
                            userBusy={this.state.userBusy}
                            userPic={this.props.userPic}
                            backFromCallOtherScreen={this.backFromCallOtherScreen}
                            showFriendsFace={this.showFriendsFace}
                        />}
                    {!this.state.CallOtherScreen && !this.state.offerReceived &&
                    <FriendsList
                        peopleList={this.state.peopleList}
                        friendListIds={this.state.friendListIds}
                        userBusy={this.props.userBusy}
                        CallOtherScreen={this.CallOtherScreen}
                        drawerLeftOpen={this.state.drawerLeftOpen}
                        drawerLeftToggle={this.drawerLeftToggle}
                    />}    
                    
                    {OfferReceivedScreen}

                    <div className={sideDrawerClassesLeft.join('  ')}>
                        <div className='All-contacts-div'>

                            <Discover
                                peopleList={this.state.peopleList}
                                userId={this.props.userId}
                                userBusy={this.state.userBusy}
                                sendFriendRequest={this.sendFriendRequest}
                                friendListIds={this.state.friendListIds}
                                friendRequestsSent={this.state.friendRequestsSent}
                                friendRequestsReceived={this.state.friendRequestsReceived}
                            />
                            {/* {FriendList} */}
                        </div>
                        <div className='Sign-out-button-div'>
                            <button className='Sign-out-button' onClick={() => this.props.signOut()}>Sign out</button>
                        </div>
                    </div>

                    <div className={sideDrawerClasses.join('  ')} style={{ paddingTop: '20px' }}>
                        {!this.state.callInitiated && !this.state.CallOtherScreen && !this.state.offerReceived &&
                            <FriendRequestsReceived
                                friendRequestsReceived={this.state.friendRequestsReceived}
                                userBusy={this.state.userBusy}
                                peopleList={this.state.peopleList}
                                userId={this.props.userId}
                                acceptFriendRequest={this.acceptFriendRequest}
                                declineFriendRequest={this.declineFriendRequest}
                            />
                        }
                    </div>
                </div> //App end div
            )
        };
        // ******* If the call is started ******* // 
        if (this.state.callInitiatedNew) {
            return (
                <div>
                    <div className='Videos-block' >

                        <div className='Both-Videos'>
                            <video id="friendsVideo" className='friendsVideo' style={{ width: ScreenWidth }} ref={this.friendsVideo} autoPlay >sdfsf</video>
                            <img className='Messages-button' alt="Side-drawer-button" src={side_drawer} onClick={this.drawerToggle} />
                            <div className='myVideo-and-controls'>
                                <img id="videoOn" className='videoOn' src={video_off} onClick={this.resumeVideo} hidden={this.state.videoOn} alt='Video on' />
                                <img id="videoOff" className='videoOff' src={video_on} onClick={this.stopVideo} hidden={!this.state.videoOn} alt='Video off' />
                                <img id="audioOff" className='audioOff' src={audio_icon} onClick={this.stopAudio} hidden={!this.state.audioOn} alt='Audio off' />
                                <img id="audioOn" className='audioOn' src={audio_icon_off} onClick={this.resumeAudio} hidden={this.state.audioOn} alt='Audio on' />
                                {/* <img id="audioOff" className='audioOff' src={video_on} onClick={this.stopVideo} hidden={!this.state.videoOn} alt='Video off' /> */}
                                <img id="screenShare" className='Start-share' src={screen_share} hidden={!this.state.callConnected || this.state.screenShare} alt='Screenshare-start' onClick={this.shareScreenStart} />
                                <img id="screenShare" className='Stop-share' src={screen_share} hidden={!this.state.screenShare} alt='Screenshare-stop' onClick={this.shareScreenStop} />
                                {/* <button className='Stop-share' hidden={!this.state.screenShare} onClick={this.shareScreenStop}>Stop share</button> */}
                                <video id="self-view" className='self-view' autoPlay muted ></video>
                                {/* <Self_video/> */}
                            </div>
                            <br></br>
                            <button variant="contained" color="secondary" onClick={this.endCall} className='End-call-button' > End Call </button>
                            {/* } */}
                            <br></br>
                        </div>
                    </div>
                    <div className={sideDrawerClassesMessages.join('  ')} style={{ paddingTop: '20px' }}>
                  {this.state.callConnected && <div>
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
                    
                        <div className='File-options' >
                            <input id='inputFile' className='inputFile' type='file' disabled={!this.state.callConnected} onChange={(e) => { this.fileSelect(e) }} size="60" style={{ display: 'block', float: 'left', padding: '22px 15px 0 15px' }}></input>
                            <progress id='progressBar' hidden={!this.state.progressBar} value='0' max='0'></progress>
                            <Button className='Save-button' size='small' onClick={this.saveToDisk} hidden={!this.state.downloadButton} disabled={!this.state.downloadButton} variant="contained" color="default" startIcon={<SaveIcon />} style={{ marginLeft: '15px', padding: '5px', borderRadius: '10px' }}>Save</Button>
                            <IconButton aria-label="delete" onClick={this.deleteReceivedfile} disabled={!this.state.downloadButton}> <DeleteIcon /> </IconButton>
                        </div>
                    {/* <button  onClick={(e)=>{this.sendFileButton(e)}}  style={{display:'block', float:'left', marginLeft:'20px'}} >Send file</button> */}
                    {/* <div id='downloadSection' className='downloadSection'>
              <img id='preview' className='preview' />
            </div> */}
                </div>}
                </div>
                </div>
            )
        }


    }
    componentDidMount() {
        const that = this;

        // To get the details of the contacts // 
        db.ref('/Users/').on('child_added', function (userIdList) {
            userIdList.forEach(function (profile_details) {

                let userId = profile_details.val().userId;
                let userName = profile_details.val().userName;
                let userEmail = profile_details.val().userEmail;
                let isActive = profile_details.val().isActive;
                let userPic = profile_details.val().userPic;
                let userBusy = profile_details.val().userBusy;
                // that.setState({ peopleList: { ...that.state.peopleList, [userId]: false } });  //old
                if (userId !== undefined) {
                    that.setState(prevState => ({
                        peopleList: {
                            ...prevState.peopleList,           // copy all other key-value pairs of peopleList object
                            [userId]: {                     // specific object/user-detail of peopleList object
                                ...prevState.peopleList.userId,   // copy all single user key-value pairs
                                userId: userId,                    // update the name property, assign a new value                 
                                userName: userName,
                                userEmail: userEmail,
                                isActive: isActive,
                                userPic: userPic,
                                userBusy: userBusy, // update value of specific key
                            }
                        }
                    }))
                }
                
            })
            
        })

        // To get updated details of the contacts once loggedIn// 
        db.ref('/Users/').on('child_changed', function (userIdList) {
            userIdList.forEach(function (profile_details) {
                let userId = profile_details.val().userId;
                let userName = profile_details.val().userName;
                let userEmail = profile_details.val().userEmail;
                let isActive = profile_details.val().isActive;
                let userPic = profile_details.val().userPic;
                let userBusy = profile_details.val().userBusy;
                if (userId !== undefined) {
                    that.setState(prevState => ({
                        peopleList: {
                            ...prevState.peopleList,           // copy all other key-value pairs of peopleList object
                            [userId]: {                     // specific object/user-detail of peopleList object
                                ...prevState.peopleList.userId,    // copy all single user key-value pairs
                                userId: userId,                    // update the name property, assign a new value                 
                                userName: userName,
                                userEmail: userEmail,
                                isActive: isActive,
                                userPic: userPic,
                                userBusy: userBusy,// update value of specific key
                            }
                        }
                    }))
                }
            })
        })

        // Friends list - current friends// 
        db.ref("/Users/" + that.props.userId + '/friend_list/').on('child_added', (snapshot) => {
           
            let userId = snapshot.val().userId;
            that.setState(prevState => ({
                friendListIds: [...prevState.friendListIds, userId]
            }))
        });
        // Friends list - current friends  - check for updates// 
        db.ref("/Users/" + that.props.userId + '/friend_list/').on('child_changed', (snapshot) => {
         
            let userId = snapshot.val().userId;
            that.setState(prevState => ({
                friendListIds: [...prevState.friendListIds, userId]
            }))
        });

        // Friend requests sent by you // 
        db.ref("/Users/" + that.props.userId + '/friend_requests_sent/').on('child_added', (snapshot) => {
            
            let userId = snapshot.val().userId;
            that.setState(prevState => ({
                friendRequestsSent: [...prevState.friendRequestsSent, userId]
            }))
        });
        // Friend requests sent by you - check for updates// 
        db.ref("/Users/" + that.props.userId + '/friend_requests_sent/').on('child_changed', (snapshot) => {
            
            let userId = snapshot.val().userId;
            that.setState(prevState => ({
                friendRequestsSent: [...prevState.friendRequestsSent, userId]
            }))
        });

        // Friend requests received by you // 
        db.ref("/Users/" + that.props.userId + '/friend_requests_received/').on('child_added', (snapshot) => {
            let userId = snapshot.val().userId;
            that.setState(prevState => ({
                friendRequestsReceived: [prevState.friendRequestsReceived, userId]
            }))
        });
        // Friend requests received by you - check for updates// 
        db.ref("/Users/" + that.props.userId + '/friend_requests_received/').on('child_changed', (snapshot) => {
            
            let userId = snapshot.val().userId;
            that.setState(prevState => ({
                friendRequestsReceived: [prevState.friendRequestsReceived, userId]
            }))
        });

        // Listen for Offer/Answer on firebase  // 
        db.ref("/Users/" + that.props.userId + '/offerAnswer/').on('child_added', (snapshot) => {
            that.readMessage(snapshot)
        });

        // Listen for new Offer/Answer on firebase  // 
        db.ref("/Users/" + that.props.userId + '/offerAnswer/').on('child_changed', (snapshot) => {
            that.readMessage(snapshot)
            console.log('new change');
        });


        //  To change status on call Disconnect //
        var presenceRef = db.ref('/Users/' + that.props.userId + '/profile_detials/');
        presenceRef.onDisconnect().update({ isActive: false, userBusy: false });

        var deleteIceOfferRef = db.ref('/Users/' + that.props.userId);
        deleteIceOfferRef.onDisconnect().update({ ice: null, offerAnswer: null });
        //  ^^^^^ To change status on Disconnect ^^^^^ //


        // To check if the offer is rejected by other user //
        db.ref("/Users/" + that.props.userId + '/rejected/').on('child_added', (snapshot) => {
           
            if (snapshot.val().callRejected) {
                swal("Done!", "Call rejected by friend", "error", { buttons: false, timer: 1500, });
                console.log('Call is Rejected by other user');
                that.endCall();
            };
        });
        // To check new rejections // 
        db.ref("/Users/" + that.props.userId + '/rejected/').on('value', (snapshot) => {
            //  console.log(snapshot.val().callRejected);
            if (snapshot.val().callRejected) {
                swal("Sorry!", "Call rejected by friend", "error", { buttons: false, timer: 1500, });
                console.log('Call is Rejected by other user');
                that.endCall();
            };
        });
        // ^^^^^^^ To check if the offer is rejected by other user ^^^^^^ //

    }

    componentWillUnmount() {
        const videoTrack = senders.find(sender => sender.track.kind === 'video');
        videoTrack.track.stop();
        console.log('Video off');
    }

}

export default App_holder;