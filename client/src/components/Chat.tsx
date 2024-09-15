import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage, saveChatMessage, getChatHistory, clearChatHistory } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShare } from 'react-icons/fa';

interface ChatProps {
  onMovieSelect: (movie: string) => void;
}

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

const Chat: React.FC<ChatProps> = ({ onMovieSelect }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [lastKey, setLastKey] = useState<string | null>(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const { messages } = await getChatHistory();
      setMessages(messages);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      const userMessage: Message = { text: input, sender: 'user', timestamp: Date.now() };
      setMessages(prev => [...prev, userMessage]);
      await saveChatMessage(userMessage);
      setInput('');
      try {
        const response = await sendChatMessage(input);
        const botMessage: Message = { text: response, sender: 'bot', timestamp: Date.now() };
        setMessages(prev => [...prev, botMessage]);
        await saveChatMessage(botMessage);
        
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
        await saveChatMessage(errorMessage);
      }
    }
  };

  const shareConversation = () => {
    const conversationText = messages.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
    const shareText = encodeURIComponent(`Check out this conversation about movies:\n\n${conversationText}`);
    const shareUrl = encodeURIComponent(window.location.href);
    
    const twitterShareLink = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
    window.open(twitterShareLink, '_blank');
  };

  const loadMoreMessages = async () => {
    if (lastKey) {
      const { messages: oldMessages, lastKey: newLastKey } = await getChatHistory(50, lastKey);
      setMessages(prevMessages => [...oldMessages, ...prevMessages]);
      setLastKey(newLastKey);
    }
  };

  const handleClearChat = async () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      await clearChatHistory();
      setMessages([]);
      setLastKey(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden flex flex-col h-full">
      <div className="bg-blue-600 dark:bg-blue-800 p-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Chat with AI</h2>
        <div>
          <button 
            onClick={handleClearChat}
            className="text-white hover:text-blue-200 transition duration-200 mr-2"
            title="Clear chat history"
          >
            Clear
          </button>
          <button 
            onClick={shareConversation}
            className="text-white hover:text-blue-200 transition duration-200"
            title="Share conversation"
          >
            <FaShare size={20} />
          </button>
        </div>
      </div>
      <div className="flex-grow overflow-auto p-4 bg-gray-50 dark:bg-gray-700">
        {lastKey && (
          <button onClick={loadMoreMessages} className="w-full text-blue-500 hover:text-blue-600 mb-4">
            Load More
          </button>
        )}
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div 
              key={index} 
              className={`flex mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className={`flex items-end ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.sender === 'user' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                } text-white text-sm font-bold`}>
                  {msg.sender === 'user' ? 'U' : 'AI'}
                </div>
                <div className={`mx-2 py-2 px-4 rounded-lg ${
                  msg.sender === 'user' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-white dark:bg-gray-600'
                } max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg`}>
                  <p className="text-sm dark:text-white">{msg.text}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow border rounded-l-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Ask about a movie..."
          />
          <button 
            type="submit" 
            className="bg-blue-500 text-white px-6 py-3 rounded-r-lg hover:bg-blue-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;