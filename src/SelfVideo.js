import React, { Component } from 'react';

class selfVideo extends Component {
    render(){
        return(
            <video id="self-view" className='self-view' autoPlay muted ></video>
        )
    }
    componentDidMount() {
        const that = this;
        const selfView = document.getElementById('self-view');
          navigator.mediaDevices.getUserMedia({ audio: true, video: true })
          .then((stream) => {
              selfView.srcObject = stream;
              //console.log(this.state.stream.getTracks());
            })
            
          }
}


export default selfVideo;