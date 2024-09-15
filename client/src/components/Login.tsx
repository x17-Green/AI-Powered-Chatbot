import React, { useState } from 'react';
import { signInWithGoogle, signInWithGithub, signInWithEmailPassword, createUserWithEmailPassword } from '../services/auth';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleEmailPasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await createUserWithEmailPassword(email, password);
      } else {
        await signInWithEmailPassword(email, password);
      }
      onLogin();
    } catch (error) {
      console.error('Error during email/password auth:', error);
      // Handle error (show message to user)
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      onLogin();
    } catch (error) {
      console.error('Error during Google sign in:', error);
      // Handle error
    }
  };

  const handleGithubSignIn = async () => {
    try {
      await signInWithGithub();
      onLogin();
    } catch (error) {
      console.error('Error during GitHub sign in:', error);
      // Handle error
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">
        {isSignUp ? 'Sign Up' : 'Login'}
      </h2>
      <form onSubmit={handleEmailPasswordAuth} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          required
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          {isSignUp ? 'Sign Up' : 'Login'}
        </button>
      </form>
      <div className="mt-4 flex justify-between">
        <button onClick={handleGoogleSignIn} className="bg-red-500 text-white p-2 rounded hover:bg-red-600">
          Sign in with Google
        </button>
        <button onClick={handleGithubSignIn} className="bg-gray-800 text-white p-2 rounded hover:bg-gray-900">
          Sign in with GitHub
        </button>
      </div>
      <p className="mt-4 text-center dark:text-white">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="ml-2 text-blue-500 hover:underline"
        >
          {isSignUp ? 'Login' : 'Sign Up'}
        </button>
      </p>
    </div>
  );
};

export default Login;