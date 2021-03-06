import React, { Component } from 'react';
import AppHolder from './AppHolder';
import * as firebase from 'firebase/app';
import Login_button from './media/login_button_white.png';
import chat_app_logo from './media/chat_app_logo.png';

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

//var provider = new firebase.auth.GoogleAuthProvider();

// var ui = new firebaseui.auth.AuthUI(firebase.auth());

// ui.start('#firebaseui-auth-container', {
//   signInOptions: [
//     // List of OAuth providers supported.
//     firebase.auth.GoogleAuthProvider.PROVIDER_ID,
//     firebase.auth.FacebookAuthProvider.PROVIDER_ID,
//   ],
//   // Other config options...
// });
const app = firebase.initializeApp(firebaseConfig,"other");
const db = app.database();
const auth = firebase.auth();


class App extends Component {
  
  state =  {
    loggedIn:false,       // To maintain login status
    userName:null,          // Store user name 
    userEmail:null,         // Store user email
    userId:null,           // Store user Id
    userPic:'',           // Store user image
  }

  

  // To Login // 
  loginButton=()=>{
    const that = this;
    // const loggedIn = !this.state.loggedIn;
    // this.setState({loggedIn:true});
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function(result){
     // console.log(result);
      const user = result.additionalUserInfo.profile;
      console.log('Logged in successfully')
      let picture_low = user.picture;
      let picture = picture_low.replace("=s96-c","=s400");
      that.setState({loggedIn:true,userName:user.name, userEmail:user.email,  userId:user.id, userPic: picture});
      // console.log(that.state);
      // db.ref("/Users/"+this.state.userId+"/profile_Details/").set({ name: profile.getGivenName(), userLogo: profile.getImageUrl(), userEmail: profile.getEmail() })
      db.ref("/Users/"+user.id+"/profile_detials").set({isActive:true,userName:user.name,userEmail:user.email,userId:user.id,userPic:picture,userBusy:false});
      db.ref("/Users/"+user.id+"/rejected").set({callRejected:false});      //To initialize 

    }).catch(function(err){
      console.log(err)
      console.log('Login failed')
    })
  }

  // Signout from the app 
  signOut = () =>{
    const that = this;
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
        console.log('Signed out now');
        that.setState({loggedIn:false});
        db.ref("/Users/"+that.state.userId+"/profile_detials").update({isActive:false,userBusy:false});
      }).catch(function(error) {
        console.log(error);
      }).then(()=>{
        window.location.reload();
      });      
  }
    render()
    {
      
      // If the user is logged in // 
      if(this.state.loggedIn){            
        return(
          <AppHolder
          userName={this.state.userName}
          userEmail={this.state.userEmail}
          userPic={this.state.userPic}
          userId={this.state.userId}
          signOut={this.signOut}
          />
        )
      }
       // If the user is not logged in // 
      else if(!this.state.loggedIn){
        return(
        <div className="App">
         <div className="App-header">
            <p>Have a conversation with privacy</p>
          </div>
          {/* <input type='text'/> */}
          <div className='App-body'> </div>
          <img src={chat_app_logo} alt='Chat-app-logo' className='chat-app-logo'/>
          <img src={Login_button} alt='Login-button' className='logInButton' onClick={()=>this.loginButton()}/>
          <div className='App-footer'>
          <p>Developed by Sandeep ©</p>
          </div>
          </div>
        )
      }
    }
    componentDidMount(){
      // To keep user logged in once signed in
      auth.onAuthStateChanged(user =>{
        if(user){
          console.log("User is already logged in");
          // console.log(user.email, user.displayName, user.photoURL, user.providerData[0].uid)
          this.setState({loggedIn:true,userName:user.displayName, userEmail:user.email,  userId:user.providerData[0].uid, userPic:user.photoURL});
          db.ref("/Users/"+user.providerData[0].uid+"/profile_detials").set({isActive:true,userName:user.displayName,userEmail:user.email,userId:user.providerData[0].uid,userPic:user.photoURL,userBusy:false});
          db.ref("/Users/"+user.providerData[0].uid+"/rejected").set({callRejected:false});      //To initialize 
          // this.setState({userEmail:user.email},()=>{
          //   console.log(this.state.userEmail)
          // })

        }
        else {
          console.log('User logged out');
        }
        ;
      })
    }
}

export default App;