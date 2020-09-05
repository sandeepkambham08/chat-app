// // Stop Video //


stopVideo = () =>{
  {/*Working
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
    //console.log(this.state.stream.getTracks());
    console.log(senders.find(sender => sender.track.kind === 'video'));
  })
*/}

// new working // 
const videoTrack = senders.find(sender => sender.track.kind === 'video')
videoTrack.track.stop();
this.setState({videoOn:false});
// new working // 
}

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
