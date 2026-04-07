import React from "react";
import "./ContactPage.css";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaPaperPlane } from "react-icons/fa";

const ContactPage = () => {
    return (
        <div className="contact-container">

            {/* LEFT SIDE */}
            <div className="contact-left">
                <h2>Contact Us</h2>
                <p className="sub-text">We’d love to hear from you!</p>

                <div className="info-item">
                    <FaEnvelope className="icon" />
                    <div>
                        <h4>Email</h4>
                        <p>support@nearpoint.com</p>
                    </div>
                </div>

                <div className="info-item">
                    <FaPhoneAlt className="icon" />
                    <div>
                        <h4>Phone</h4>
                        <p>+234 810 234 5678</p>
                    </div>
                </div>

                <div className="info-item">
                    <FaMapMarkerAlt className="icon" />
                    <div>
                        <h4>Address</h4>
                        <p>Lagos, Nigeria</p>
                    </div>
                </div>

                {/* Partnerships Section */}
                <div className="partnership-box">
                    <h3>Partnerships</h3>
                    <p>For collaborations or business inquiries:</p>
                    <a href="mailto:partnerships@nearpoint.com" className="email-btn">
                        Send Email
                    </a>
                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="contact-right">
                <h3>Send Us a Message</h3>

                <form className="contact-form">
                    <input type="text" placeholder="Your Name" required />
                    <input type="email" placeholder="Your Email" required />
                    <input type="text" placeholder="Phone Number (optional)" />

                    <textarea placeholder="Your Message" required></textarea>

                    <button type="submit" className="send-btn">
                        <FaPaperPlane className="send-icon" />
                        Send Message
                    </button>
                </form>
            </div>

        </div>
    );
};

export default ContactPage;
