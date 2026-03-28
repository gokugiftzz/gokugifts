import React, { useState, useRef, useEffect } from 'react';
import { FiMessageSquare, FiX, FiSend, FiMinimize2, FiMaximize2 } from 'react-icons/fi';
import { MdAutoAwesome } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { getAIChat } from '../../utils/api';
import styles from './AIChatbot.module.css';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I am Goku, your personal gift assistant. 🎁 How can I help you find the perfect gift today?' }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await getAIChat({ message: input, history: messages });
      setMessages(prev => [...prev, { role: 'assistant', text: res.data.message }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: "I'm having a bit of trouble connecting right now. 🎁 Try checking out our AI Gift Finder for more structured help!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <motion.button 
          className={styles.toggleBtn}
          onClick={() => setIsOpen(true)}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <MdAutoAwesome />
          <span className={styles.badge}>🎁</span>
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className={`${styles.chatWindow} ${isMinimized ? styles.minimized : ''}`}
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
          >
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerInfo}>
                <div className={styles.aiAvatar}><MdAutoAwesome /></div>
                <div>
                  <h3>Goku AI</h3>
                  <p>Gift Expert • Online</p>
                </div>
              </div>
              <div className={styles.headerActions}>
                <button onClick={() => setIsMinimized(!isMinimized)}>
                  {isMinimized ? <FiMaximize2 /> : <FiMinimize2 />}
                </button>
                <button onClick={() => setIsOpen(false)}><FiX /></button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div className={styles.messages}>
                  {messages.map((msg, i) => (
                    <div key={i} className={`${styles.message} ${msg.role === 'user' ? styles.userMsg : styles.aiMsg}`}>
                      <div className={styles.msgText}>{msg.text}</div>
                    </div>
                  ))}
                  {loading && (
                    <div className={styles.aiMsg}>
                      <div className={styles.typing}><span>.</span><span>.</span><span>.</span></div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <form className={styles.inputArea} onSubmit={handleSend}>
                  <input 
                    type="text" 
                    placeholder="Ask about gift ideas..." 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    disabled={loading}
                  />
                  <button type="submit" disabled={!input.trim() || loading}>
                    <FiSend />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
