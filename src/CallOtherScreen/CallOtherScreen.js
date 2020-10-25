import React from 'react';

 // Screen after selecting a contact from the list //  

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
                <button className='Back-button' onClick={()=>{props.backFromCallOtherScreen()}}  >Go back</button>       {/*User not online button */}
                </div>}
                {!props.peopleList[props.friendId].isActive && 
                <div className='Connect-now-button-block' >
                <button className='Cannot-connect-now-button'  >User not Online </button>       {/*User not online button */}
                <button className='Back-button' onClick={()=>{props.backFromCallOtherScreen()}}  >Go back</button>       {/*User not online button */}
                </div>}
                {props.peopleList[props.friendId].isActive && props.peopleList[props.friendId].userBusy &&
                <div className='Connect-now-button-block' >    
                <button className='Cannot-connect-now-button'  >User is Busy </button>       {/*User not online button */}  
                <button className='Back-button' onClick={()=>{props.backFromCallOtherScreen()}}  >Go back</button>       {/*User not online button */}           
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