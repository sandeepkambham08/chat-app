import React from 'react';
import './Backdrop.css'

const Backdrop = (props) =>(
props.isopen? <div className='Backdrop' onClick={props.backdropClicked}></div> : null
)
export default  Backdrop;