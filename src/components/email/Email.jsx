import React from "react";
import './Email.css';
import { 
    faEnvelope,
    faPaperPlane 
} from "@fortawesome/free-solid-svg-icons";  
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import bg3 from '../../assets/Background3.jpg';

const Email = () => {
    return(
        <div className="email-container">
            <h2 className="email-text">Be a part of our family & get everything in your email address</h2>

            <div className="email-input">
                 <FontAwesomeIcon 
                    icon={faEnvelope} 
                    className="input-icon left"
                />

                <input 
                    type="email" 
                    placeholder="Enter your email address"
                />

                <FontAwesomeIcon 
                    icon={faPaperPlane} 
                    className="input-icon right"
                />
            </div>
        </div>
    )
}

export default Email;