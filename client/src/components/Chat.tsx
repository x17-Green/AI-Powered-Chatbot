import React, { useState, useRef, useEffect, useCallback } from 'react';
import { sendChatMessage } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaMicrophone, FaEdit, FaTrash } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import debounce from 'lodash/debounce';
import { useAuth } from '../contexts/AuthContext';

// Add type definitions for SpeechRecognition
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
}

// Add this new interface
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface ChatProps {
  onMovieSelect: (movie: string) => void;
  isDarkMode: boolean;
  userId: string;
}

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

const Chat: React.FC<ChatProps> = ({ onMovieSelect, isDarkMode, userId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>(() => {
    const savedMessages = localStorage.getItem(`chatMessages_${userId}`);
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognition = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    localStorage.setItem(`chatMessages_${userId}`, JSON.stringify(messages));
  }, [messages, userId]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map((result: SpeechRecognitionResult) => result[0].transcript)
          .join('');
        setInput(transcript);
        console.log('Speech recognized:', transcript);
      };
      recognition.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error, event.message);
      };
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
  }, []);

  const debouncedSetIsTyping = useCallback(
    debounce((value: boolean) => setIsTyping(value), 300),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    debouncedSetIsTyping(e.target.value.length > 0);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastMessageTime < 1000) {
      alert('Please wait a moment before sending another message.');
      return;
    }
    if (input.trim()) {
      if (input.trim().toLowerCase() === '/clear') {
        setMessages([]);
        setInput('');
        return;
      }
      const newMessage: Message = { text: input.trim(), sender: 'user', timestamp: now };
      setMessages(prev => [...prev, newMessage]);
      setInput('');
      setIsTyping(false);
      setLastMessageTime(now);
      setIsBotTyping(true);

      try {
        const response = await sendChatMessage(input.trim());
        const botMessage: Message = { text: response, sender: 'bot', timestamp: Date.now() };
        setMessages(prev => [...prev, botMessage]);
        setIsBotTyping(false);

        const movieMatch = response.match(/I recommend (.*?)\./);
        if (movieMatch && movieMatch[1]) {
          onMovieSelect(movieMatch[1]);
        }
      } catch (error: any) {
        console.error('Error sending message:', error);
        const errorMessage: Message = { 
          text: error.message || 'Sorry, there was an error processing your request.', 
          sender: 'bot', 
          timestamp: Date.now() 
        };
        setMessages(prev => [...prev, errorMessage]);
        setIsBotTyping(false);
      }
    }
  };

  const handleEditMessage = (index: number) => {
    const messageToEdit = messages[index];
    if (messageToEdit.sender === 'user') {
      setInput(messageToEdit.text);
      setMessages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleDeleteMessage = (index: number) => {
    setMessages(prev => prev.filter((_, i) => i !== index));
  };

  const toggleSpeechRecognition = () => {
    if (isListening) {
      recognition.current?.stop();
    } else {
      recognition.current?.start();
    }
    setIsListening(!isListening);
    console.log('Speech recognition toggled:', !isListening);
  };

  return (
    <div className={`flex flex-col h-[600px] ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
      <h2 className="text-2xl font-bold p-4 border-b border-gray-300 dark:border-gray-700">
        Chat with AI Movie Assistant
      </h2>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
              message.sender === 'user' ? 'bg-blue-500 text-white' : isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            } relative group`}>
              <ReactMarkdown>{message.text}</ReactMarkdown>
              {message.sender === 'user' && (
                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEditMessage(index)} aria-label="Edit message" className="text-xs p-1">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDeleteMessage(index)} aria-label="Delete message" className="text-xs p-1">
                    <FaTrash />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isBotTyping && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Bot is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-300 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className={`flex-1 p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}
            aria-label="Chat input"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className={`p-2 rounded-full ${isTyping ? 'bg-blue-500' : 'bg-gray-300'} text-white`}
            disabled={!isTyping}
            aria-label="Send message"
          >
            <FaPaperPlane />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={toggleSpeechRecognition}
            className={`p-2 rounded-full ${isListening ? 'bg-red-500' : 'bg-gray-300'} text-white`}
            aria-label={isListening ? 'Stop listening' : 'Start listening'}
          >
            <FaMicrophone />
          </motion.button>
        </div>
        {isListening && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Listening... Speak now.
          </p>
        )}
      </form>
    </div>
  );
};

export default Chat;