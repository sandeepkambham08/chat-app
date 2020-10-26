import React from 'react';
import './FriendRequestsReceived.css';

const FriendRequestReceived = (props) =>{
return(
    <div>
                    <p>Friend requests received:</p>
                    {Object.keys(props.friendRequestsReceived).map((key) => {                    
                        if(key!==props.userId){
                            // console.log(props.peopleList[key]);
                                return (
                                    <div key={key} className='Friend-request-card' disabled={!props.userBusy} >
                                    <img src={props.friendRequestsReceived[key].userPic} alt="contactListPic" className='contactListPic' />
                                    {/* <span>User Online</span> */}
                                    <p key={key} className='onlinePerson' id='onlinePerson' >  {props.friendRequestsReceived[key].userName} </p>
                                    <p className='Accept-Friendrequest' onClick={()=>{this.acceptFriendRequest(key,props.peopleList[key])}} >Accept</p>
                                    <p className='Accept-Friendrequest' >Decline</p>
                                    </div>   )
                        }
                    })}
    </div>
)
}

export default FriendRequestReceived;