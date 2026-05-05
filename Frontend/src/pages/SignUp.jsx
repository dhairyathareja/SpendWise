import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CloudLightning, Loader2 } from 'lucide-react';
import { clearAuthMessages, signUpUser } from '../store/authSlice';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { status, error, apiNotice } = useSelector((state) => state.auth);
  const isLoading = status === 'loading';

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthMessages());

    try {
      await dispatch(signUpUser({ name, email, organization, password })).unwrap();
      navigate('/dashboard', { replace: true });
    } catch {
      // The slice owns the error message shown below.
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        className="glass-panel"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <img src="/Logo.png" alt="SpendWise Logo" className="auth-logo" />
        <h1>Create Account</h1>
        <p>Start optimizing your AWS costs</p>

        {(error || apiNotice) && (
          <div className={error ? 'form-message error' : 'form-message notice'}>
            {error || apiNotice}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            className="input-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
          <input
            type="text"
            placeholder="Organization"
            className="input-field"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            disabled={isLoading}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
          <button type="submit" className="btn-primary full-button" disabled={isLoading}>
            {isLoading && <Loader2 size={18} className="spin" />}
            {isLoading ? 'Creating' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignUp;
