// var config = {
//     apiKey: "AIzaSyCTw5HVSY8nZ7QpRp_gBOUyde_IPU9UfXU",
//     authDomain: "websitebeaver-de9a6.firebaseapp.com",
//     databaseURL: "https://websitebeaver-de9a6.firebaseio.com",
//     storageBucket: "websitebeaver-de9a6.appspot.com",
//     messagingSenderId: "411433309494"
//    };
//    firebase.initializeApp(config);
   
   var database = firebase.database().ref();
  // var yourVideo = document.getElementById("yourVideo");
   //var friendsVideo = document.getElementById("friendsVideo");
   //var yourId = Math.floor(Math.random()*1000000000);
   //var servers = {'iceServers': [{'urls': 'stun:stun.services.mozilla.com'}, {'urls': 'stun:stun.l.google.com:19302'}, {'urls': 'turn:numb.viagenie.ca','credential': 'webrtc','username': 'websitebeaver@mail.com'}]};
 //  var pc = new RTCPeerConnection(servers);
   pc.onicecandidate = (event => event.candidate?sendMessage(yourId, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice") );
   pc.onaddstream = (event => friendsVideo.srcObject = event.stream);
   
   function sendMessage(senderId, data) {
    var msg = database.push({ sender: senderId, message: data });
    msg.remove();
   }
   
   function readMessage(data) {
    var msg = JSON.parse(data.val().message);
    var sender = data.val().sender;
    if (sender != yourId) {
    if (msg.ice != undefined)
    pc.addIceCandidate(new RTCIceCandidate(msg.ice));
    else if (msg.sdp.type == "offer")
    pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
    .then(() => pc.createAnswer())
    .then(answer => pc.setLocalDescription(answer))
    .then(() => sendMessage(yourId, JSON.stringify({'sdp': pc.localDescription})));
    else if (msg.sdp.type == "answer")
    pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
    }
   };
   
   database.on('child_added', readMessage);
   
   function showMyFace() {
    navigator.mediaDevices.getUserMedia({audio:true, video:true})
    .then(stream => yourVideo.srcObject = stream)
    .then(stream => pc.addStream(stream));
   }
   
   function showFriendsFace() {
    pc.createOffer()
    .then(offer => pc.setLocalDescription(offer) )
    .then(() => sendMessage(yourId, JSON.stringify({'sdp': pc.localDescription})) );
   }


//async function videoCall() {
  //   const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  //   var myVideo = document.getElementById('myVideo');
  //   var friendsVideo = document.getElementById('friendsVideo');
  //   myVideo.srcObject = stream;

  //   const pc1 = new RTCPeerConnection(servers);
  //   const pc2 = new RTCPeerConnection(servers);
  //   console.log("Created PC 1 : " + pc1);
  //   console.log("Created PC 2 : " + pc2);
  //   pc1.addEventListener('icecandidate', ({ candidate }) => {
  //  // console.log(candidate);
  //   if(candidate){
  //     console.log('Sending message in ice candidate')
      
  //   }
  //   else {
  //     // console.log('Ice candidate already added')
  //   }
  //   }
  //   );

  //   pc2.addEventListener('icecandidate', ({ candidate }) => {
  //    // console.log(candidate);
  //     if(candidate){
  //       pc1.addIceCandidate(candidate)
  //     }
  //     else {
  //       // console.log('Ice candidate already added')
  //     }
  //     }
  //     );

  //   stream.getTracks().forEach(track => {
  //     pc1.addTrack(track, stream)
  //     // console.log(track);
  //   });

  //   pc2.addEventListener('track',({streams:[stream]})=>{
  //      console.log(stream);
      
  //     friendsVideo.srcObject = stream;
  //   })

  //   const offer = await pc1.createOffer({
  //     offerToReceiveAudio:1,
  //     offerToReceiveVideo:1
  //   });

  //  await pc1.setLocalDescription(offer);
  //  await pc2.setRemoteDescription(offer);

  //   const answer = await pc2.createAnswer();

  //   await pc2.setLocalDescription(answer);
  //   await pc1.setRemoteDescription(answer);
  // }


  // async function myvideoCall(){
   
  //  // var yourId = Math.floor(Math.random()*1000000000);
    
  //   console.log("Created PC 1 : " + pc);

  //   pc.addEventListener('icecandidate', ({ candidate }) => {
  //  // console.log(candidate);
  //   if(candidate){
  //     console.log('Sending message in ice candidate')
  //     this.sendMessage(yourId, JSON.stringify({'ice': candidate}))
  //   }
  //   else {
  //     console.log('All Ice candidate added')
  //   }
  //   }
  //   );

  //   pc.onaddstream = (event => friendsVideo.srcObject = event.stream);









  // }


    // if(!this.state.caller &&  !this.state.receiver){
    // return(
    //   <div className="App">
    //   <p>Please select which one you are</p>
    //   <button onClick={this.selectedCaller}>Caller</button>
    //   <button onClick={this.selectedReceiver}>Receiver</button>
    //   </div>
    // )
    // }


 {/* <p>You are the caller now</p>
      <div> 
         <input type = "text" id = "loginInput" /> 
         <button id = "loginBtn" onClick={(e)=>this.loginClicked()}>Login</button> 
      </div> 
	
      <div> 
         <input type = "text" id = "otherUsernameInput" />
         <button id = "connectToOtherUsernameBtn" onClick={this.createCall}>Establish connection</button> 
      </div> 
      <div>
        <button onClick={this.resetToHome}>Home</button>
      </div> */}

//  if (this.hasUserMedia) { 
//     navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia
//        || navigator.mozGetUserMedia || navigator.msGetUserMedia;

//     //get both video and audio streams from user's camera 
//     navigator.getUserMedia({ video: true, audio: false }, function (stream) { 
//        var video = document.querySelector('video'); 

//        //insert stream into the video tag 
//        video.srcObject = stream; 
//        console.log(stream.getVideoTracks())
//     }, function (err) {}); 

//  }

// if(!this.state.caller && this.state.receiver){
//   return (
//     <div className="App">
//       <video autoPlay></video> 
//       <p>You are the receiver now</p>
//       <div> 
//          <input type = "text" id = "loginInput" /> 
//          <button id = "loginBtn" onClick={(e)=>this.loginClicked()}>Login</button> 
//       </div> 

//       <div> 
//          <input type = "text" id = "otherUsernameInput" />
//          <button id = "connectToOtherUsernameBtn">Establish connection</button> 
//       </div> 
//       <div>
//         <button onClick={this.resetToHome}>Home</button>
//       </div>
//     </div>
//   );
// }

// createCall = () => {

//   console.log(yourId);
//   //make an offer 
//   connection.createOffer().then((offer) => {
//     const localDescription = JSON.stringify(connection.localDescription);
//     connection.setLocalDescription(offer);
//     // db.ref("/usernames/"+yourId).update({type:offer.type});
//     db.ref("/usernames/" + yourId).update({ localDescriptionn: offer });
//     console.log(localDescription);
//   })
//   //console.log(connection);
//   connection.onicecandidate = (event) => {
//     if (event.candidate) {
//       console.log('testing');
//     }
//     else {
//       console.log('ice not found');
//     }
//   }
// }

// selectedCaller = () => {
//   this.setState({ caller: true });
// }

// selectedReceiver = () => {
//   this.setState({ receiver: true });
// }
// resetToHome = () => {
//   this.setState({ caller: false, receiver: false });
// }

// hasUserMedia = () => {
//   navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia
//     || navigator.mozGetUserMedia || navigator.msGetUserMedia;
//   return !!navigator.getUserMedia;
// };