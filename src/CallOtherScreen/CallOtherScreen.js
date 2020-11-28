import React from 'react';
import emailjs from 'emailjs-com';
import './CallOtherScreen.css'

 // Screen after selecting a contact from the list //  
// const sendEmail =(friendDetails, myName) =>{
//     console.log('email sent', friendDetails.userEmail, myName)
//  }

 const sendEmail = (friendDetails, myName) =>{

    const friendName = friendDetails.userName;
    const friendEmail = friendDetails.userEmail;
    
        let templateParams = {
            from_name:myName,
            to_name: friendName,
            to_email: friendEmail,
          }
          emailjs.send("service_akjas4q","template_o41bq7h", templateParams, "user_fVYZoRLi0XbkQ3eIIr9Es")
            .then(function (response) {
            console.log('SUCCESS!', response.status, response.text);
            document.getElementById('email_status').innerHTML="Email notification sent successfully"
            document.getElementById("email-notification-button").classList.add("email-sent");
            document.getElementById("email_status").classList.add("email-sent-message");
            }, function (error) {
            console.log('FAILED...', error);
            document.getElementById('email_status').innerHTML="Error occured! Please try later."
            document.getElementById("email-notification-button").classList.add("email-sent");
            }
            );
            
}

const CallOtherScreen = (props) => {
    // if(props.CallOtherScreen && !props.userBusy){
        return(
            <div className='call-other-screen'>
                <div className='self-pic-and-name'>
                    <img className='Main-profile-pic' alt="Main-profile-pic"  src={props.userPic} />
                    <p >You</p>
                </div>
                {props.peopleList[props.friendId].isActive && !props.peopleList[props.friendId].userBusy &&
                <div className='Connect-now-button-block' >                 
                <button className='Connect-now-button' onClick={()=>{props.showFriendsFace()}} >Connect now</button> {/*User online button */}
                <button className='Back-button' onClick={()=>{props.backFromCallOtherScreen()}}  >Cancel</button>       {/*User not online button */}
                </div>}
                {!props.peopleList[props.friendId].isActive && 
                <div className='Connect-now-button-block' >
                <button className='Cannot-connect-now-button'  >User not Online </button>       {/*User not online button */}
                <button className='Connect-now-button ' id='email-notification-button' onClick={()=>{sendEmail(props.peopleList[props.friendId], props.userName)}} > Send Email notification </button>
                <p id='email_status' className='email_status'></p>
                <button className='Back-button' onClick={()=>{props.backFromCallOtherScreen()}} > Back </button>       {/*User not online button */}
                </div>}
                {props.peopleList[props.friendId].isActive && props.peopleList[props.friendId].userBusy &&
                <div className='Connect-now-button-block' >    
                <button className='Cannot-connect-now-button'  >User is Busy </button>       {/*User not online button */}  
                <button className='Back-button' onClick={()=>{props.backFromCallOtherScreen()}}  >Cancel</button>       {/*User not online button */}           
                </div>}
                <div className='Friend-pic-and-name'>
                    <img className='Main-profile-pic' alt="Main-profile-pic"  src={props.peopleList[props.friendId].userPic} />  
                    <p>{props.peopleList[props.friendId].userName}</p>   
                </div>
            </div>
        )
    // }
    // else return null;
}

export default CallOtherScreen;