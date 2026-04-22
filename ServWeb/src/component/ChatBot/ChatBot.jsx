import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  ShieldAlert, 
  HelpCircle, 
  Search, 
  CreditCard, 
  UserCheck 
} from 'lucide-react';
import './ChatBot.css';

const ROUGH_WORDS = [
  'abuse', 'bad', 'stupid', 'idiot', 'useless', 'scam', 'fake', 'hate', 
  'fuck', 'shit', 'bitch', 'asshole', 'dick', 'bastard', 'crap', 'garbage',
  'kukur', 'mula', 'lado', 'chikne', 'randi'
];

const KNOWLEDGE_BASE = [
  {
    keywords: ['system', 'work', 'platform', 'servad'],
    reply: "**ServAd** is a digital marketplace connecting homeowners with **verified professionals** in Nepal. You can search for services, view provider profiles, book appointments, and pay securely through our platform."
  },
  {
    keywords: ['search', 'find', 'looking', 'service'],
    reply: "To find a service, use the **Search Bar** on our Home page. You can filter by **Service Type** (like Plumbing or Cleaning) and your **Province** to find providers near you."
  },
  {
    keywords: ['book', 'appointment', 'hire'],
    reply: "Once you find a provider, click **'Book Now'**. You'll need to be logged in to confirm. After booking, you can **chat with the provider** directly to discuss details."
  },
  {
    keywords: ['pay', 'payment', 'esewa', 'khalti', 'cost', 'price'],
    reply: "We support secure payments via **eSewa** and **Khalti**. Prices vary based on the service. You can see the **estimated cost** before confirming your booking."
  },
  {
    keywords: ['verify', 'trust', 'safe', 'secure'],
    reply: "Your safety is our priority! All service providers undergo a **strict identity verification process** (NID/Citizenship) by our admin team before they can offer services."
  },
  {
    keywords: ['province', 'location', 'nepal', 'district'],
    reply: "We currently serve **all 7 provinces of Nepal**! Whether you're in Kathmandu, Pokhara, or Biratnagar, we've got local professionals ready to help."
  },
  {
    keywords: ['payout', 'withdraw', 'money', 'provider'],
    reply: "Providers can request a **withdrawal** to their eSewa or Khalti account once the work is completed and verified by the customer."
  },
  {
    keywords: ['hi', 'hello', 'hey', 'namaste'],
    reply: "Namaste! Welcome to **ServAd Support**. I'm here to explain how the system works. What would you like to know today?"
  },
  {
    keywords: ['how are you', 'how r u', 'how are u', 'how goes it'],
    reply: "I'm doing great, thank you for asking! I'm ready to help you navigate **ServAd**. How can I assist you today?"
  }
];

const SUGGESTED_QUESTIONS = [
  { text: "How it works?", icon: <Search size={14} /> },
  { text: "Is it safe?", icon: <UserCheck size={14} /> },
  { text: "How to pay?", icon: <CreditCard size={14} /> },
  { text: "Withdrawal?", icon: <HelpCircle size={14} /> }
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      type: 'bot', 
      text: "Namaste! Explore how **ServAd** simplifies home services in Nepal. Ask me anything about **booking, payments, or safety!**" 
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const clearChat = () => {
    setMessages([{ 
      id: 1, 
      type: 'bot', 
      text: "Chat cleared! How can I help you understand ServAd today?" 
    }]);
  };

  const handleSend = (forcedValue = null) => {
    const valueToSend = forcedValue || inputValue.trim();
    if (!valueToSend) return;

    const userMessage = valueToSend.toLowerCase();
    
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: valueToSend }]);
    if (!forcedValue) setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      
      const containsRoughWord = ROUGH_WORDS.some(word => userMessage.includes(word));
      
      if (containsRoughWord) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          type: 'warning',
          text: "⚠️ SYSTEM WARNING: Inappropriate language detected. Please maintain professional decorum. Continued abuse will lead to account suspension."
        }]);
        return;
      }

      const match = KNOWLEDGE_BASE.find(entry => 
        entry.keywords.some(keyword => userMessage.includes(keyword))
      );

      if (match) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          type: 'bot',
          text: renderText(match.reply)
        }]);
      } else {

        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          type: 'bot',
          text: "I'm a support bot for **ServAd instructions**. Ask about searching, booking, or payments!"
        }]);
      }
    }, 800);
  };

  // Simple formatter for **bold** text
  const renderText = (text) => {
    if (typeof text !== 'string') return text;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: '#ef4444' }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="chatbot-wrapper">
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageCircle size={20} />
              <h3>ServAd Support</h3>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={clearChat} title="Clear Chat" style={{ opacity: 0.8 }}>
                <ShieldAlert size={18} />
              </button>
              <button onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chatbot-message ${msg.type}`}>
                {renderText(msg.text)}
              </div>
            ))}
            {isTyping && <div className="typing">ServAd is typing...</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-quick-replies">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button key={i} onClick={() => handleSend(q.text)} className="quick-reply-btn">
                {q.icon}
                {q.text}
              </button>
            ))}
          </div>

          <div className="chatbot-input">
            <input 
              type="text" 
              placeholder="Type your question here..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={() => handleSend()} disabled={!inputValue.trim()}>
              <Send size={18} />
            </button>
          </div>
        </div>
      )}


      {/* Toggle Button */}
      <button className="chatbot-fab" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
}
