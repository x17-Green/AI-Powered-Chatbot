import React, { useState } from 'react';
import { signInWithGoogle, signInWithGithub, signInWithEmailPassword, createUserWithEmailPassword } from '../services/auth';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import loginBg from '../assets/login-bg.mp4';

interface LoginProps {
  onLogin: () => Promise<void>;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await createUserWithEmailPassword(email, password);
      } else {
        await signInWithEmailPassword(email, password);
      }
      await onLogin();
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      await onLogin();
    } catch (error) {
      console.error('Google sign-in error:', error);
    }
  };

  const handleGithubSignIn = async () => {
    try {
      await signInWithGithub();
      await onLogin();
    } catch (error) {
      console.error('GitHub sign-in error:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <video autoPlay loop muted className="absolute top-0 left-0 w-full h-full object-cover z-[-1]">
        <source src={loginBg} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </h2>
        <form onSubmit={handleSubmit} className="mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-3 py-2 border rounded-md text-gray-700 mb-3"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-3 py-2 border rounded-md text-gray-700 mb-3"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200"
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
        <div className="text-center mb-4 text-gray-600">OR</div>
        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-white text-gray-700 border border-gray-300 py-2 rounded-md mb-2 hover:bg-gray-100 transition duration-200 flex items-center justify-center"
        >
          <FaGoogle className="mr-2" /> Continue with Google
        </button>
        <button
          onClick={handleGithubSignIn}
          className="w-full bg-gray-800 text-white py-2 rounded-md hover:bg-gray-900 transition duration-200 flex items-center justify-center"
        >
          <FaGithub className="mr-2" /> Continue with GitHub
        </button>
        <p className="mt-4 text-center text-gray-600">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button 
            onClick={() => setIsSignUp(!isSignUp)} 
            className="text-blue-500 hover:underline ml-1"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;