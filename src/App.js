import React, { Component } from 'react';
import './App.css';
import * as firebase from 'firebase';
import Button from '@material-ui/core/Button';
//import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import SaveIcon from '@material-ui/icons/Save';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';

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
const pc = new RTCPeerConnection(servers)
console.log('STEP 1/2 : Created Peer connection - TIME: ' + Date.now());
//File sharing 
var chunkLength = 10000;     // To divide file into chunks
var loaded = 0;        // To calculate percentage of downloaded file on receiver side

//Screen share
const senders= [];
let userMediaStream;
let displayMediaStream;

var iceCandidateCount = 1;
pc.onicecandidate = (event) => {
  //console.log('testing iterations')
  if (event.candidate) {
    console.log(iceCandidateCount++);
    sendIceMessage(yourId, JSON.stringify({ 'ice': event.candidate }));
    console.log('STEP 9/16 - ICE canadidates generated in your device - TIME: ' + Date.now())
    //console.log(event.candidate);
  }
  else {
    console.log("STEP 10/17 - *  *  * *  All Ice candidates are sent *  *  * *  - TIME: " + Date.now())
  }
}

function sendIceMessage(senderId, data) {
  db.ref('/ice/').push({ sender: senderId, message: data });
  //console.log(data);
  //msg.remove();  // Check this  - This is deleting all the ice candidates on single go
}

pc.onconnectionstatechange = (event) => {
  if (pc.connectionState === "disconnected") {
    console.log('= = = = = Call Ended - - - -  --  ')
    // pc.close();
    // pc.onicecandidate = null;
    // pc.onaddstream = null;
    window.location.reload();
    db.ref('/').remove();
  };
}


let dataChannel = pc.createDataChannel("MyApp Channel");
class App extends Component {

  constructor(props) {
    super(props);
    // create a ref to store the textInput DOM element
    this.friendsVideo = React.createRef();
  }

  state = {
    caller: true,
    receiver: false,
    callingOther: false,
    offerReceived: false,
    offerAccepted: false,
    messageReceived: '',
    messageBoxActive: false,
    fileList: null,
    fileURL:null,
    fileName:'',
    downloadButton:false,
    progressBar:false,
    screenShare:false,
    stream:null,
    audioTrack:null,
    videoTrack:null,
  }

  // To start a video call & creating an offer 
  showFriendsFace = () => {
    dataChannel.addEventListener("open", (event) => {
      //dataChannel.send('hello');
      console.log('Data Channel is open now!' + Date.now());
      //   //beginTransmission(dataChannel);
    });

    pc.createOffer()
      .then(offer => {
        console.log("STEP 5: Created offer on my computer - TIME: " + Date.now());
        pc.setLocalDescription(offer)
      })
      .then(() => {
        console.log("STEP 6: Added offer on my PC local Description - TIME: " + Date.now());
        //console.log('Local Description')
        //console.log(pc.localDescription);
        this.sendMessage(yourId, JSON.stringify({ 'sdp': pc.localDescription }));
        console.log('STEP 7: Sent offer to peer - TIME: ' + Date.now());
      });
    this.setState({ callingOther: true });
    dataChannel.onmessage = function (event) {
      console.log(event.data);
    }
  }

  // To send Offer Answer
  sendMessage = (senderId, data) => {
    db.ref('/offerAnswer/').push({ sender: senderId, message: data });
  }

  // To read messages from signalling server - to receive offer/answer
  readMessage = (data) => {
    var that = this;
    //console.log(data.val().message);
    var msg = JSON.parse(data.val().message);
    //console.log(msg);
    var sender = data.val().sender;
    if (sender !== yourId) {
      if (msg.sdp.type === "offer") {
        this.setState({ messageReceived: msg }, () => {
          this.setState({ offerReceived: true })           //To make ANSWER  button active
        })
        console.log('Received message : OFFER' + Date.now())
      }
      else if (msg.sdp.type === "answer") {
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
          db.ref('/ice/').on('child_added', (snapshot) => {
            this.readIceMessage(snapshot)
            this.setState({ messageBoxActive: true }) //Caller side message box active 
          });
        });
      }
    }
  };

  // To accept the call & send ANSWER back
  acceptCall = () => {
    var that = this;
    this.setState({ offerAccepted: true });
    var msg = this.state.messageReceived;
    pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
      .then(() => {
        //console.log('Remote description set after receiving OFFER')
        console.log('STEP 8: Added offer to pc RemoteDescription - TIME: ' + Date.now());
        db.ref('/ice/').on('child_added', (snapshot) => {
          this.readIceMessage(snapshot)
          console.log("Adding received ICE candidates via OFFER ")
        });
        pc.createAnswer().then(() => { console.log("STEP 12: Created ANSWER ") })
      })
      .then(answer =>
        pc.setLocalDescription(answer)
      )
      .then(() => {
        console.log('STEP 13: Added answer to PC localDescription - TIME: ' + Date.now())
        this.sendMessage(yourId, JSON.stringify({ 'sdp': pc.localDescription }));
        console.log('STEP 14: Sent ANSWER to you')
        this.setState({ messageBoxActive: true })  //Receiver side message box active 
        pc.ondatachannel = function (event) {
          var channelReceived = event.channel;
          var arrayToStoreChunks = [];
          channelReceived.onmessage = function (event) {
            that.handleChatMessage(event, arrayToStoreChunks);
          }
          console.log(channelReceived);
        }

      });
  }

  //  To read ICE candidates received from other user
  readIceMessage = (data) => {
    //var path = db.ref('/ice/');
    var msg = JSON.parse(data.val().message);
    var sender = data.val().sender;
    if (sender !== yourId) {
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
stopVideo = () =>{
    
  const tracks = this.state.stream.getTracks();
  tracks.forEach(track=>{
    if(track.kind==='video'){
      console.log(track);
      track.stop();
      console.log('Video off');
    }
    //senders.push(pc.addTrack(track,stream))
    //pc.addTrack(track,this.state.stream)
    //selfView.srcObject = stream;
    console.log(this.state.stream.getTracks());
  })
}

resumeVideo =() =>{
  navigator.mediaDevices.getUserMedia({ audio: true, video: true })
  .then((stream)=>{
    // console.log(stream.getTracks());
    // console.log(senders);
    senders.find(sender => sender.track.kind === 'video').replaceTrack(stream.getTracks()[1]);
    // console.log(senders);
    // console.log(stream.getTracks());
    document.getElementById('self-view').srcObject = stream;
  })
}
  // // Stop Video //
  // stopVideo = () =>{
  
  //   const tracks = this.state.stream.getTracks();
  //   const videoTrack = this.state.videoTrack;
  //   console.log(videoTrack)
  //   // tracks.forEach(track=>{
  //   //   if(track.kind==='video'){
  //   //     console.log(track);
  //   //     track.stop();
  //   //     //senders.find(sender => sender.track.kind === 'video').stop();
  //   //     console.log('Video off');
  //   //   }
  //   //   //senders.push(pc.addTrack(track,stream))
  //   //   //pc.addTrack(track,this.state.stream)
  //   //   //selfView.srcObject = stream;
  //   // })
  //   videoTrack.stop();
  //   console.log('video stopped')
  //   console.log(videoTrack);
  //   // this.setState({videoTrack:null});
  // }

  // resumeVideo =() =>{
  //   navigator.mediaDevices.getUserMedia({ audio: true, video: true })
  //   .then((stream)=>{
  //     const tracks = stream.getTracks();
  //     tracks.forEach(track=>{
  //     if(track.kind==='video'){
  //       console.log('Video type found in resume video');
  //       this.setState({videoTrack:track});
  //       pc.addTrack(track,stream);
  //     }
  //   })
  //     // console.log(stream.getTracks());
  //     // console.log(senders);
  //     // senders.find(sender => sender.track.kind === 'video').replaceTrack(stream.getTracks()[1]);
  //     // console.log(senders);
  //     // console.log(stream.getTracks());
  //     document.getElementById('self-view').srcObject = stream;
  //   })


  //   // const mediaStream = this.state.stream;
  //   // mediaStream.getVideoTracks()[0].enabled =
  //   // !(mediaStream.getVideoTracks()[0].enabled);
    
  //   // const tracks = this.state.stream.getTracks();
  //   // tracks.forEach(track=>{
  //   //   if(track.kind==='video'){
  //   //     console.log(track);
  //   //     pc.addTrack(track,this.state.stream)
  //   //     console.log('Video on');
  //   //   }
  //   //   //senders.push(pc.addTrack(track,stream))
  //   //   //pc.addTrack(track,this.state.stream)
  //   //   //selfView.srcObject = stream;
  //   //   console.log(this.state.stream.getTracks());
  //   // })
   
  // }

  // Share screen 
  shareScreenStart = () => {
    // if (!displayMediaStream) {
    //   displayMediaStream = navigator.mediaDevices.getDisplayMedia();
    // }
    navigator.mediaDevices.getDisplayMedia().then(stream=>{
      console.log(stream.getTracks());
      console.log(senders);
      senders.find(sender => sender.track.kind === 'video').replaceTrack(stream.getTracks()[0]);
      console.log(senders);
      console.log(stream.getTracks());
      document.getElementById('self-view').srcObject = stream;
    })
    this.setState({screenShare:true});
  }

  shareScreenStop = () =>{
     this.setState({screenShare:false});
    console.log('Stop share');

    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
    .then((stream)=>{
      // console.log(stream.getTracks());
      // console.log(senders);
      senders.find(sender => sender.track.kind === 'video').replaceTrack(stream.getTracks()[1]);
      // console.log(senders);
      // console.log(stream.getTracks());
      document.getElementById('self-view').srcObject = stream;
    })

    // senders.find(sender => sender.track.kind === 'video').removeTrack(this.state.stream.getTracks()[0]);
    // const tracks = this.state.stream.getTracks();
    //   tracks.forEach(track=>{
    //     console.log(track);
    //     //senders.push(pc.addTrack(track,stream))
    //     //pc.addTrack(track,this.state.stream)
    //     //selfView.srcObject = stream;
    //     console.log(this.state.stream.getTracks());
    //   })
    // console.log(this.state.stream.getTracks())

  //   senders.find(sender => sender.track.kind === 'video')
  //   .replaceTrack(userMediaStream.getTracks().find(track => track.kind === 'video'));
  // document.getElementById('self-view').srcObject = userMediaStream;
  }


  // To send messages on chat
  sendInputMessage = () => {
    const input = document.getElementById('textInput');
    console.log("You entered : " + input.value)
    // document.getElementById('messageReceived').innerHTML+='<p class="You">You: </p>';
    document.getElementById('messageReceived').append('You :' + input.value);
    document.getElementById('messageReceived').innerHTML += '<br></br>';
    var data = {};
    data.type = 'text';
    data.message = input.value;
    dataChannel.send(JSON.stringify(data));
    input.value = null;  //To clear the input box
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
    this.setState({progressBar:true});     // Show progress bar
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
      this.setState({progressBar:true});  
      var fileName = data.fileName;
      var fileType = data.fileType;
      var fileSize = data.fileSize;
      var totalLength = data.totalLength;
      if(totalLength){            // totalLength only sent on start
        progressValue.max=totalLength;
        console.log(totalLength);
        progressValue.value=0;
      }
      progressValue.max = fileSize;
      console.log(fileName + fileType + fileSize);
      arrayToStoreChunks.push(data.message); // pushing chunks in array  
      //console.log(data.message.length);
      loaded+=data.message.length;
      console.log(loaded);
      progressValue.value=loaded;
      if (data.last) {
       // this.saveToDisk(arrayToStoreChunks.join(''), fileName);
       this.setState({fileURL:arrayToStoreChunks.join(''), fileName: fileName, downloadButton:true})
        arrayToStoreChunks = []; // resetting array
      }

    }
    else if (data.type === 'text') {
      console.log(data.message);
      console.log('Friend : ' + data.message);
      // console.log(event.data.size);
      document.getElementById('messageReceived').append('Friend :' + data.message);
      document.getElementById('messageReceived').innerHTML += '<br></br>'
    }
  }

  // To SEND the file once loaded
  onReadAsDataURL = (event, text) => {
    const that = this;
    var file = that.state.fileList;
    //var fileDetailsArray = Object.keys(file).map((key)=>[key,file[key]])
    var data = {}; // data object to transmit over data channel
    data.fileName = file.name;
    data.fileType = file.type;
    data.fileSize = file.size;

    if (event) {
      text =event.target.result;
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
    this.setState({downloadButton:false})
  }

  deleteReceivedfile = () =>{
    this.setState({downloadButton:false,fileURL:null,fileName:''});
    var progressValue = document.getElementById('progressBar');
    progressValue.value = 0;
  }

  // To END the call with friend
  endCall = () => {
    var ice = db.ref('/ice/');
    //console.log(msg);
    ice.remove();

    var offerAnswer = db.ref('/offerAnswer/');
    offerAnswer.remove();
    //console.log(msg);
    
    pc.close();

    window.location.reload();
    this.setState({ offerReceived: false, callingOther: false });
  }

  render() {

    if (this.state.caller && !this.state.receiver) {
      return (
        <div className="App">
          <div className="App-header">
            <p>Have a conversation with privacy</p>
          </div>
          <div className='Videos-block split' >
            <div className='friendsVideoBlock'>
              <p>Friend's Video</p>
              <video ref={this.friendsVideo}  className='friendsVideo' id="friendsVideo" autoPlay ></video>
            </div>

            <p>My Video</p>
            {/* <video id="myVideo" className='myVideo' autoPlay muted style={{ width: '200px', transform: 'scale(-1,1)' }}></video> */}
            <video id="self-view" className='self-view' autoPlay muted ></video>
            <button onClick={this.stopVideo}>Off Video</button>
            <button onClick={this.resumeVideo}>On Video</button>
            <button className='Start-share' hidden={!this.state.messageBoxActive || this.state.screenShare} onClick={this.shareScreenStart}>Share screen</button>
            <button className='Stop-share' hidden={!this.state.screenShare} onClick={this.shareScreenStop}>Stop share</button>
            <br></br>
            {!this.state.offerReceived && !this.state.callingOther &&
              <Button variant="contained" color="primary" onClick={this.showFriendsFace} style={{ margin: '10px' }}> Call </Button>
            }
            {this.state.offerReceived && !this.state.offerAccepted &&
              <Button className='answerButton' variant="contained" hidden={!this.state.offerReceived} onClick={this.acceptCall} style={{ margin: '10px', backgroundColor: 'green' }} > Answer </Button>
            }
            <Button variant="contained" color="secondary" onClick={this.endCall}> End Call </Button>
            <br></br>
          </div>
          <div className='Message-block' style={{ paddingTop: '20px' }}>
            <div className=' split Conversation-block'>
              <p> Conversation </p>
              <div id='messageReceived'>

              </div>
            </div>

            <div className='Message-input-box'>
              <textarea id='textInput' className='textInput' placeholder="Enter your message here " disabled={!this.state.messageBoxActive} onKeyDown={(e) => { this.enterAsInput(e) }}></textarea>
              <br></br>
              <button variant="contained" className='sendButton' disabled={!this.state.messageBoxActive} onClick={this.sendInputMessage}>SEND ></button>
              <br></br>
            </div>
            {/* <label htmlFor="inputFile" hidden={this.state.messageBoxActive} className="custom-file-upload" > Custom Upload </label>
            <input id='inputFile' disabled={!this.state.messageBoxActive} onChange={(e) => { this.fileSelect(e) }} type="file"/>  */}
            <input id='inputFile'  className='inputFile' type='file' disabled={!this.state.messageBoxActive} onChange={(e) => { this.fileSelect(e) }} size="60" style={{ display: 'block', float: 'left', padding: '22px 15px 0 15px' }}></input>
            {/* <Button variant="contained" onChange={(e) => { this.fileSelect(e) }} color="primary" startIcon={<CloudUploadIcon />} >Upload
            </Button> */}
            <br></br>
            <div className='File-options'>
            <progress id='progressBar' hidden={!this.state.progressBar} value='0' max='0'></progress>
            {/* <CircularProgress id='progressBar2'variant="static" value={0}/>  */}
            {/* <button onClick={this.saveToDisk} hidden={!this.state.downloadButton} disabled={!this.state.downloadButton}>Download</button> */}
            <Button className='Save-button' size='small' onClick={this.saveToDisk} hidden={!this.state.downloadButton} disabled={!this.state.downloadButton} variant="contained" color="default" startIcon={<SaveIcon />} style={{ marginLeft: '15px',padding:'5px', borderRadius: '10px'}}>Save</Button>
            <IconButton aria-label="delete" onClick={this.deleteReceivedfile} disabled={!this.state.downloadButton}> <DeleteIcon/> </IconButton>
            </div>
            {/* <button  onClick={(e)=>{this.sendFileButton(e)}}  style={{display:'block', float:'left', marginLeft:'20px'}} >Send file</button> */}
            {/* <div id='downloadSection' className='downloadSection'>
              <img id='preview' className='preview' />
            </div> */}
            
          </div>
        </div> //App end div
      );
    }

  }
  componentDidMount() {
    const that = this;

    const myVideo = document.getElementById('myVideo');
    const friendsVideo = document.getElementById('friendsVideo');
    const selfView = document.getElementById('self-view')

    // ------  Adding self Video  --------//
    // navigator.mediaDevices.getUserMedia({ audio: true, video: true })
    //   .then((stream) => {
    //     console.log(stream.getTracks());
    //     console.log(stream);
    //     myVideo.srcObject = stream;
    //     console.log("STEP 3/4 : Added your video on screen - TIME: " + Date.now());
    //     return stream;
    //   })
    //   .then(stream => pc.addStream(stream));
    
    // ------^^Adding self Video^^--------//

    // Listen for Offer / Answer on firebase 
    db.ref('/offerAnswer/').on('child_added', (snapshot) => {
      that.readMessage(snapshot)
    });

    // ------  Listener for Adding Friends Video  --------// 
    pc.addEventListener('track', ({ streams: [stream] }) => {
      console.log('Now added friends stream' + Date.now())
      // console.log(stream);
      friendsVideo.srcObject = stream;
    })
    // ------  Listener for Adding Friends Video  --------// 

    // ------ Screenshare with self Video  -----------  //
    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
    .then((stream)=>{
      this.setState({stream:stream});
      const tracks = stream.getTracks();
      tracks.forEach(track=>{
        if(track.kind==='audio'){
          this.setState({audioTrack:track});
         // pc.addTrack(track,stream);
        }
        if(track.kind==='video'){
          this.setState({videoTrack:track});
         // pc.addTrack(track,stream);
        }
        console.log(track);
        senders.push(pc.addTrack(track,stream))
        selfView.srcObject = stream;
        console.log(this.state.stream.getTracks());
      })
      return stream;
      })
      // .then(stream => pc.addStream(stream));

      // pc.ontrack = (event) =>{
      //   console.log('Now added friends stream' + Date.now())
      //   friendsVideo.srcObject = event.streams[0];
      // }
    
    
    // userMediaStream.getTracks()
    //     .forEach(track => senders.push(pc.addTrack(track, userMediaStream)));
    //   document.getElementById('self-view').srcObject = userMediaStream;


    // ------ Screenshare -----------  //
  }
}

export default App;
