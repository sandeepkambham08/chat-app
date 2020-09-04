 hasUserMedia=() => { 
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia 
       || navigator.mozGetUserMedia || navigator.msGetUserMedia; 
    return !!navigator.getUserMedia; 
 };
  
 if (hasUserMedia) { 
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia
       || navigator.mozGetUserMedia || navigator.msGetUserMedia;
         
    //get both video and audio streams from user's camera 
    navigator.getUserMedia({ video: true, audio: false }, function (stream) { 
       var video = document.querySelector('video'); 
       
       //insert stream into the video tag 
       video.srcObject = stream; 
       console.log(stream.getVideoTracks())
    }, function (err) {}); 
     
 }
 var connection= new RTCPeerConnection();
 connection.createOffer().then(
   console.log('offer created successfully')
 );
 console.log(connection);
 console.log(connection.getStats());
 console.log(connection.createOffer())
 
 var name = ""; 
 
 var loginInput = document.querySelector('#loginInput'); 
 var loginBtn = document.querySelector('#loginBtn'); 
 var otherUsernameInput = document.querySelector('#otherUsernameInput'); 
 var connectToOtherUsernameBtn = document.querySelector('#connectToOtherUsernameBtn'); 
 var connectedUser, myConnection;


   
 //when a user clicks the login button 
  loginClicked = e   =>  { 
    name = loginInput.value; 
   
    if(name.length > 0){ 
       send({ 
          type: "login", 
          name: name 
       }); 
    } 
   console.log('clicked login button')
 };
   
 function send(message) { 

  if (connectedUser) { 
     message.name = connectedUser; 
  } 
 
  connection.send(JSON.stringify(message)); 
};

loginClicked = e => {
   var name = document.getElementById('loginInput').value;

   if (name.length > 0) {

     console.log(connection);
     connection.onicecandidate = (event) => {
       if (event.candidate) {
         console.log('testing');
       }
       else {
         console.log('ice not found');
       }
     }
   }
   else {
     console.log('Name shouldn\'t be empty')
   }
 };


//* Data Channel *//

// let dataChannel = pc.createDataChannel("MyApp Channel");

// dataChannel.addEventListener("open", (event) => {
//   dataChannel.send('hello');
//   console.log('Data Channel is open now!' + Date.now());
//   //beginTransmission(dataChannel);
// });


//* Data Channel *//
