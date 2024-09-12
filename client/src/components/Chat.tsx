import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/api';

interface ChatProps {
  onMovieSelect: (movie: string) => void;
}

const Chat: React.FC<ChatProps> = ({ onMovieSelect }) => {
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'bot' }[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: 'user' }]);
      setInput('');
      try {
        const response = await sendChatMessage(input);
        setMessages(prev => [...prev, { text: response, sender: 'bot' }]);
        
        const movieTitleMatch = response.match(/.*"(.+)".*/);
        if (movieTitleMatch) {
          onMovieSelect(movieTitleMatch[1]);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        setMessages(prev => [...prev, { text: "Sorry, I couldn't process your request.", sender: 'bot' }]);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden flex flex-col h-full">
      <div className="bg-blue-600 p-4">
        <h2 className="text-xl font-semibold text-white">Chat with AI</h2>
      </div>
      <div className="flex-grow overflow-auto p-4 bg-gray-50">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-4 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-3 rounded-lg ${
              msg.sender === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}>
              {msg.text}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 bg-gray-100 border-t border-gray-200">
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow border rounded-l-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
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