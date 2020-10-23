import React from 'react';


// List of people available - to fill contacts drawer// 

const AllContacts = (props) =>{
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

return(
    <div className={ContactListClasses.join(' ')}>
                {/* <p >Your ID : {this.props.userId}  </p> */}

                <p>Contacts</p>

                {Object.keys(props.peopleList).map((key) => {
                    // console.log(key);
                    // console.log(Object.keys(props.peopleList).length);
                    // console.log(this.state.friendListIds);           
                    if(key!==props.userId){
                        // console.log(props.peopleList[key]);
                        if (props.peopleList[key].isActive===true && props.peopleList[key].userBusy===false) {
                            return (
                                <div className={ContactListItemOnline.join('  ')} key={key} disabled={!props.userBusy} onClick={()=>props.CallOtherScreen(key)}>
                                <img src={props.peopleList[key].userPic} alt="contactListPic" className='contactListPic' />
                                <span>User Online</span>
                                <p key={key} className='onlinePerson' id='onlinePerson' >  {props.peopleList[key].userName} </p>
                                </div>   )
                        }
                        else if(props.peopleList[key].isActive===false && props.peopleList[key].userBusy===false){
                            return (
                                <div className={ContactListItemOffline.join('  ')} key={key} disabled={!props.userBusy} onClick={()=>props.CallOtherScreen(key)} >
                                <img src={props.peopleList[key].userPic} alt="contactListPic" className='contactListPic' />
                                <span>User not online</span>
                                <p key={key} className='offlinePerson' id='offlinePerson'>  {props.peopleList[key].userName} </p>
                                </div>
                            )
                        }
                        else if(props.peopleList[key].isActive===true && props.peopleList[key].userBusy===true){
                            return (
                                <div className={ContactListItemBusy.join('  ')} key={key} disabled={!props.userBusy} onClick={()=>props.CallOtherScreen(key)} >
                                <img src={props.peopleList[key].userPic} alt="contactListPic" className='contactListPic' />
                                <span>User is Busy</span>
                                <p key={key} className='BusyPerson' id='BusyPerson'>  {props.peopleList[key].userName} </p>
                                </div>
                            )
                        }
                    }
                })}

            </div>
)

}


export default AllContacts;