import React from 'react';
import './FriendList.css';
import add_friend from '../media/add_friend_icon.png';
// To show the people who sent you friend request

const FriendList = (props) =>{
    // Contact drawer items classes //
    // let ContactListClasses = ['Contact-list'];
    let ContactListItemOnline  =  ['Contact-list-item-online'];
    let ContactListItemOffline  = ['Contact-list-item-offline'];
    let ContactListItemBusy = ['Contact-list-item-busy'];
    // let ContactList = null;
    let AddFriendsBlock  = ['Add-friends-block'];

    if(props.drawerLeftOpen){
        AddFriendsBlock  = ['Add-friends-block', 'blurred-out'];
    }
    if(props.userBusy){
        // ContactListClasses = ['Contact-list', 'left-drawer-userBusy'];
        ContactListItemOnline =  ['Contact-list-item-online', 'left-drawer-userBusy'];
        ContactListItemOffline  = ['Contact-list-item-offline', 'left-drawer-userBusy'];
        ContactListItemBusy = ['Contact-list-item-busy', 'left-drawer-userBusy'];
    }

    return (
        <div className='Friends-block'>
        <div className='Friend-list'>
                <p className='Friends-title'>Friends</p>
                {Object.keys(props.peopleList).map((key) => {        
                    
                        if(props.friendListIds.indexOf(key)>=0){   
                            if(props.peopleList[key].isActive===true && props.peopleList[key].userBusy===false){
                            return (
                                <div className={ContactListItemOnline.join('  ')} key={key} disabled={!props.userBusy} onClick={()=>props.CallOtherScreen(key)}>
                                <img src={props.peopleList[key].userPic} alt="Friendpic" className='Friend-pic' />
                                <br></br>
                                <span>User Online</span>
                                <p key={key} className='onlinePerson' id='onlinePerson' >  {props.peopleList[key].userName} </p>
                                </div>   )
                            }
                            if(props.peopleList[key].isActive===true && props.peopleList[key].userBusy===true){
                                return (
                                    <div className={ContactListItemBusy.join('  ')} key={key} disabled={!props.userBusy} onClick={()=>props.CallOtherScreen(key)}>
                                    <img src={props.peopleList[key].userPic} alt="Friendpic" className='Friend-pic' />
                                    <br></br>
                                    <span>User Busy</span>
                                    <p key={key} className='onlinePerson' id='onlinePerson' >  {props.peopleList[key].userName} </p>
                                    </div>   )
                                }
                            if(props.peopleList[key].isActive===false){
                                return (
                                    <div className={ContactListItemOffline.join('  ')} key={key} disabled={!props.userBusy} onClick={()=>props.CallOtherScreen(key)} >
                                    <img src={props.peopleList[key].userPic} alt="Friendpic" className='Friend-pic' />
                                    <br></br>
                                    <span>User not online</span>
                                    <p key={key} className='offlinePerson' id='offlinePerson'>  {props.peopleList[key].userName} </p>
                                    </div>
                                )
                            }
                        } 
                })}
                {/* <button className='Discover-button-friends'>+</button> */}
                <div className={AddFriendsBlock.join(' ')}  onClick={()=>props.drawerLeftToggle()} >
                <img className='Add-friends-button' alt='Add-friends-button' src={add_friend}/>
                <p >Add friends</p>
                </div>
                
    </div>
    </div>
    )

}

export default FriendList;