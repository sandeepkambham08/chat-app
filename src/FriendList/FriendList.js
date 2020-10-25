import React from 'react';
import './FriendList.css';
// To show the people who sent you friend request

const FriendList = (props) =>{
    // Contact drawer items classes //
    let ContactListClasses = ['Contact-list'];
    let ContactListItemOnline  =  ['Contact-list-item-online'];
    let ContactListItemOffline  = ['Contact-list-item-offline'];
    let ContactListItemBusy = ['Contact-list-item-busy'];
    let ContactList = null;

    if(props.userBusy){
        ContactListClasses = ['Contact-list', 'left-drawer-userBusy'];
        ContactListItemOnline =  ['Contact-list-item-online', 'left-drawer-userBusy'];
        ContactListItemOffline  = ['Contact-list-item-offline', 'left-drawer-userBusy'];
        ContactListItemBusy = ['Contact-list-item-busy', 'left-drawer-userBusy'];
    }

    return (
        <div className='Friend-list'>
                <p>Friends :</p>
                {Object.keys(props.peopleList).map((key) => {        
                    
                        if(props.friendListIds.indexOf(key)>=0){   
                            if(props.peopleList[key].isActive===true){
                            return (
                                <div className={ContactListItemOnline.join('  ')} key={key} disabled={!props.userBusy} onClick={()=>props.CallOtherScreen(key)}>
                                <img src={props.peopleList[key].userPic} alt="contactListPic" className='contactListPic' />
                                <span>User Online</span>
                                <p key={key} className='onlinePerson' id='onlinePerson' >  {props.peopleList[key].userName} </p>
                                </div>   )
                            }
                            if(props.peopleList[key].isActive===false){
                                return (
                                    <div className={ContactListItemOffline.join('  ')} key={key} disabled={!props.userBusy} onClick={()=>props.CallOtherScreen(key)} >
                                    <img src={props.peopleList[key].userPic} alt="contactListPic" className='contactListPic' />
                                    <span>User not online</span>
                                    <p key={key} className='offlinePerson' id='offlinePerson'>  {props.peopleList[key].userName} </p>
                                    </div>
                                )
                            }
                        } 
                })}
    </div>
    )

}

export default FriendList;