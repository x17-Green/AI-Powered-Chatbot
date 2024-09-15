import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/api';
import { motion } from 'framer-motion';
import { FaPaperPlane } from 'react-icons/fa';

interface ChatProps {
  onMovieSelect: (movie: string) => void;
  isDarkMode: boolean;
}

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

const Chat: React.FC<ChatProps> = ({ onMovieSelect, isDarkMode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [lastKey, setLastKey] = useState<string | null>(null);

  useEffect(() => {
    // Remove this function call as it's not defined
    // loadChatHistory();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      const userMessage: Message = { text: input, sender: 'user', timestamp: Date.now() };
      setMessages(prev => [...prev, userMessage]);
      // Remove this function call as it's not defined
      // await saveChatMessage(userMessage);
      setInput('');
      try {
        const response = await sendChatMessage(input);
        const botMessage: Message = { text: response, sender: 'bot', timestamp: Date.now() };
        setMessages(prev => [...prev, botMessage]);
        // Remove this function call as it's not defined
        // await saveChatMessage(botMessage);
        
        const movieTitleMatch = response.match(/.*"(.+)".*/);
        if (movieTitleMatch) {
          onMovieSelect(movieTitleMatch[1]);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage: Message = { 
          text: "Sorry, I couldn't process your request.", 
          sender: 'bot', 
          timestamp: Date.now() 
        };
        setMessages(prev => [...prev, errorMessage]);
        // Remove this function call as it's not defined
        // await saveChatMessage(errorMessage);
      }
    }
  };

  // Remove these functions as they're not used and causing errors
  // const shareConversation = () => { ... };
  // const loadMoreMessages = async () => { ... };
  // const handleClearChat = async () => { ... };

  return (
    <div className={`rounded-lg shadow-md p-4 h-[500px] flex flex-col ${isDarkMode ? 'bg-darkBg text-darkText' : 'bg-white text-gray-900'}`}>
      <h2 className="text-2xl font-bold mb-4">Chat</h2>
      <div 
        ref={messagesEndRef}
        className="flex-grow overflow-y-auto mb-4 space-y-4"
      >
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`p-2 rounded-lg ${
              msg.sender === 'user' 
                ? isDarkMode ? 'bg-blue-900 ml-auto' : 'bg-blue-100 ml-auto'
                : isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            } max-w-[80%]`}
          >
            {msg.text}
          </motion.div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={`flex-grow p-2 border rounded-l-lg ${
            isDarkMode 
              ? 'bg-darkInput border-darkBorder text-darkText' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
          placeholder="Type your message..."
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600 transition-colors"
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default Chat;