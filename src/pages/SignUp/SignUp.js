import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { createUserProfile } from '../../services/firestore';
import '../Login/Auth.css';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (password.length < 6) {
      return setError('Password should be at least 6 characters');
    }
    
    try {
      setError('');
      setLoading(true);
      const userCredential = await signup(email, password, displayName);
      
      // Create user profile in Firestore
      await createUserProfile(userCredential.user.uid, {
        email,
        displayName,
      });
      
      navigate('/');
    } catch (error) {
      setError(error.message || 'Failed to create an account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      const userCredential = await signInWithGoogle();
      
      // Create user profile in Firestore if it's a new user
      await createUserProfile(userCredential.user.uid, {
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
      });
      
      navigate('/');
    } catch (error) {
      setError(error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Sign Up for Mealo</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="displayName">Display Name</label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              placeholder="Enter your name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your password"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="divider">
          <span>OR</span>
        </div>
        
        <button 
          onClick={handleGoogleSignIn} 
          disabled={loading}
          className="btn-google"
        >
          Sign up with Google
        </button>
        
        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
