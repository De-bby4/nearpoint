import React from "react";
import './HowItWork.css' 
import work3 from '../../assets/work.3.png'
import work1 from '../../assets/work2.png'
import work2 from '../../assets/work1.png'

const HowItWork = () => {
    return(
        <div className="work-container">
            <h1 className="work-h1">How It Work</h1>
            <div className="line"></div>
            <div className="div-boxes">
                <div className="div-1">
                    <div className="div-img1">
                        <img src={work1} alt="Choose What To Do" width="500" height="600" />
                    </div>
                    <h2 className="work-h2">Choose What To Do</h2>
                    <p className="work-p">Select whether you want to list your business or discover amazing services around you. It only takes a few clicks to get started.</p>
                </div>
                <div className="div-2">
                    <div className="div-img2">
                        <img src={work3} alt="Explore Amazing Places" width="300" height="300" />
                    </div>
                    <h2 className="work-h2">Find What You Want</h2>
                    <p className="work-p">Search by category, name, or location to quickly connect with the right businesses for your needs.</p>
                </div>
                <div className="div-3">
                    <div className="div-img3">
                        <img src={work2} alt="Find What You Want" width="400" height="500" />
                    </div>
                    <h2 className="work-h2">Explore Amazing Places</h2>
                    <p className="work-p">Discover top-rated businesses, hidden gems, and trusted services in your area all in one place.</p>
                </div>
            </div>
        </div>
    )
}

export default HowItWork;