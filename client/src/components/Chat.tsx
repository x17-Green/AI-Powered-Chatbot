import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/api';
import { motion } from 'framer-motion';
import { FaPaperPlane } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';

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
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      await handleUserMessage(input);
    }
  };

  const handleUserMessage = async (userInput: string) => {
    const userMessage: Message = { text: userInput, sender: 'user', timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true); // Start loading animation

    try {
      const response = await sendChatMessage(userInput);
      simulateTyping(response); // Simulate typing effect for the AI response
    } catch (error) {
      const errorMessage: Message = { 
        text: "Sorry, I couldn't process your request.", 
        sender: 'bot', 
        timestamp: Date.now() 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false); // Stop loading animation
    }
  };

  const simulateTyping = (response: string) => {
    const words = response.split(' ');
    let index = 0;
    const typingMessage: Message = { text: '', sender: 'bot', timestamp: Date.now() };

    // Add the typing message to the messages array
    setMessages(prev => [...prev, typingMessage]);

    const typingInterval = setInterval(() => {
      if (index < words.length) {
        typingMessage.text += (index === 0 ? '' : ' ') + words[index]; // Add space before each word except the first
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = typingMessage; // Update the last message
          return newMessages;
        });
        index++;
      } else {
        clearInterval(typingInterval);
        handleMovieSelection(response); // Call movie selection after typing is done
      }
    }, 150); // Adjust typing speed here (150ms per word for faster generation)
  };

  const handleMovieSelection = (response: string) => {
    const movieTitleMatch = response.match(/.*"(.+)".*/);
    if (movieTitleMatch) {
      onMovieSelect(movieTitleMatch[1]);
    }
  };

  return (
    <div className={`rounded-lg shadow-lg p-4 h-[400px] flex flex-col ${isDarkMode ? 'bg-darkBg text-darkText border border-darkBorder' : 'bg-white text-gray-900 border border-gray-300'}`}>
      <h2 className="text-xl font-bold mb-2">Chat</h2>
      <div ref={chatContainerRef} className="flex-grow overflow-y-auto mb-2 space-y-2">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }} // Fading effect duration
            className={`p-2 rounded-lg text-sm ${msg.sender === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'}`}
          >
            <ReactMarkdown>{msg.text}</ReactMarkdown>
          </motion.div>
        ))}
        {isLoading && (
          <div className="p-2 rounded-lg text-sm bg-gray-100">
            <span>KodePanther are growling...</span>
            <span className="animate-pulse">...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={`flex-grow p-2 text-sm border rounded-l-lg ${isDarkMode ? 'bg-darkInput border-darkBorder text-darkText' : 'bg-white border-gray-300 text-gray-900'}`}
          placeholder="Type your message..."
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600 transition-colors">
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default Chat;