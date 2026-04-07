import React from "react";
import './Bfooter.css';
import logo from '../../assets/logo.png';
import { 
  faEnvelope,
  faPhone,
  faLocationDot
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Bfooter = () => {
    return (
        <div className="bfooter-container">
            <div className="logo-content">
                    <img src={logo} alt="Logo" className="bfooter-logo" width={50}/>
                    <h2 className="logo-text">NearPoint</h2>
            </div>
                
            <div className="bfooter-content" id="bfooter">
                <div className="about-us">
                    <h3 className="about-text">About Us</h3>
                    <div className="bfooter-line"></div>
                    <p>NearPoint is a platform dedicated to connecting people with 
                        local events and activities. Our mission is to help you 
                        discover new experiences and make meaningful connections in your community.</p>
                </div>
                <div className="bfooter-links">
                    <h3 className="link-text">Quick Links</h3>
                    <div className="bfooter-line"></div>
                    <ul>
                        <li><a href="/home">Home</a></li>
                        <li><a href="/privacy">Privacy Policy</a></li>
                        <li><a href="/terms">Terms of Service</a></li>
                    </ul>
                    
                    
                </div>
                <div className="contact-info">
                    <h3 className="contact-text">Contact Us</h3>
                    <div className="bfooter-line"></div>
                    <ul>
                        <li><FontAwesomeIcon icon={faEnvelope} className="contact-icon" /> <a href="mailto:support@nearpoint.com">deborahibekwe019@gmail.com</a></li>
                        <li><FontAwesomeIcon icon={faPhone} className="contact-icon" /> 
                        <a href= "tel:+2349139040930">(+234) 913-904-0930</a> </li>
                        <li><FontAwesomeIcon icon={faLocationDot} className="contact-icon" /> Address: 123 Main St, Anytown, USA</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
export default Bfooter;