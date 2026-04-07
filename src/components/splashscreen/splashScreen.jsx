import { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import "./splashScreen.css";

const SplashScreen = ({ onFinish }) => {
  const [shiftLogo, setShiftLogo] = useState(false);
  const [showText, setShowText] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShiftLogo(true), 1400);
    const t2 = setTimeout(() => setShowText(true), 1700);
    const t3 = setTimeout(() => setFadeOut(true), 3000);
    const t4 = setTimeout(() => onFinish(), 3700);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [onFinish]);

  return (
    <div className={`splash-container ${fadeOut ? "splash-fadeout" : ""}`}>
      <div className="splash-glow" />

      <div className="splash-row">
        <img
          src={logo}
          alt="NearPoint"
          className={`splash-logo ${shiftLogo ? "logo-shifted" : ""}`}
        />
        <div className={`splash-brand ${showText ? "brand-visible" : ""}`}>
          <h1 className="splash-name">NearPoint</h1>
          <p className="splash-tagline">Discover local businesses</p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;