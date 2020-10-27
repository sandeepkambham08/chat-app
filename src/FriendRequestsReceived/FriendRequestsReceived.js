import React from 'react';
import './FriendRequestsReceived.css';

const FriendRequestReceived = (props) =>{
    if(props.friendRequestsReceived.length){
return(
    <div>
                    <p className='Friend-request-header'>Friend requests received</p>
                    {Object.keys(props.peopleList).map((key) => {                
                        if(key!==props.userId && props.friendRequestsReceived.indexOf(key)>=0){
                            // console.log(props.peopleList[key]);
                                return (
                                    <div key={key} className='Friend-request-card' disabled={!props.userBusy} >
                                    <img src={props.peopleList[key].userPic} alt="contactListPic" className='contactListPic' />
                                    {/* <span>User Online</span> */}
                                    <p key={key} className='onlinePerson' id='onlinePerson' >  {props.peopleList[key].userName} </p>
                                    <p className='Accept Friendrequest' onClick={()=>{props.acceptFriendRequest(key,props.peopleList[key])}} >Accept</p>
                                    <p className='Decline Friendrequest' >Decline</p>
                                    </div>   )
                        }
                    })}
    </div>
)}
else return (
    <p className='Friend-request-header'>No pending requests</p>
);
}

export default FriendRequestReceived;