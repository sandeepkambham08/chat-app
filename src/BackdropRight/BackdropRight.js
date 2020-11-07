import React from 'react';
import './BackdropRight.css'

const BackdropRight = (props) =>(
props.isopen? <div className='BackdropRight' onClick={props.backdropClicked}></div> : null
)
export default  BackdropRight;