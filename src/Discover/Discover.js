import React,{Component} from 'react';
import './Discover.css';

class  Discover extends Component {

    


    render(){
    // if(!this.state.callInitiated && !this.state.CallOtherScreen &&  !this.state.offerReceived )
    return(
        <div className="Discover">
        <p>Discover here :</p>
        {Object.keys(this.props.peopleList).map((key) => {
            // console.log(key);
            // console.log(this.props.peopleList[key].userEmail);                 
            if(key!==this.props.userId){
                // console.log(this.props.peopleList[key]);
                    return (
                        <div style={{float:'left'}} className="Discover-contact-card" key={key} disabled={!this.props.userBusy} >
                        <img src={this.props.peopleList[key].userPic} alt="contactListPic" className='Discover-contactListPic' />
                        {/* <span>User Online</span> */}
                        <p key={key} className='Discover-contact-name' id='onlinePerson' >  {this.props.peopleList[key].userName} </p>
                        <p className='Send-Friendrequest' onClick={()=>{this.props.sendFriendRequest(key,this.props.peopleList[key])}} >Send request</p>
                        </div>   )  
            }
        })}
    </div>
    )
} 
}

export default Discover;