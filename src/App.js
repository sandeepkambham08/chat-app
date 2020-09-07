import React, { Component } from 'react';
import App_holder from './App_holder';
import * as firebase from 'firebase';


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
  constructor(props) {
    super(props);
  }
  state =  {
    loggedIn:false,
    userName:'',
    userEmail:'',
    userId:'',
    userPic:'',
  }

  loginButton=()=>{
    const that = this;
    // const loggedIn = !this.state.loggedIn;
    // this.setState({loggedIn:true});
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function(result){
      console.log(result);
      const user = result.additionalUserInfo.profile;
      console.log('Logged in successfully')
      console.log(user);
      // console.log(user.name + user.email );
      // console.log(user.picture)
      that.setState({loggedIn:true,userName:user.name, userEmail:user.email,  userId:user.id, userPic: user.picture});
      console.log(that.state);
      // db.ref("/Users/"+this.state.userId+"/profile_Details/").set({ name: profile.getGivenName(), userLogo: profile.getImageUrl(), userEmail: profile.getEmail() })
      db.ref("/Users/"+user.id+"/profile_detials").set({isActive:true,userName:user.name,userEmail:user.email,userId:user.id,userPic:user.picture});

    }).catch(function(err){
      console.log(err)
      console.log('Login failed')
    })

  }
    render(){
      if(this.state.loggedIn){
        return(
          <App_holder
          userName={this.state.userName}
          userEmail={this.state.userEmail}
          userPic={this.state.userPic}
          />
        )
      }
      else if(!this.state.loggedIn){
        return(
          <div className="App">
         <div className="App-header">
            {/* <img className='Contacts-drawer-button' src={rightSide_drawer} onClick={this.drawerToggle} /> */}
            {/* <img className='Side-drawer-button' src={side_drawer} onClick={this.drawerToggle} /> */}
            <p>Have a conversation with privacy</p>
          </div>
          {/* <input type='text'/> */}
          <button className='logInButton' onClick={()=>this.loginButton()}>Login</button>
          </div>
        )
      }
    }
}

export default App;