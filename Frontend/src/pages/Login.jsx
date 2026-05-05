import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CloudLightning, Loader2 } from 'lucide-react';
import { clearAuthMessages, loginUser } from '../store/authSlice';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { status, error, apiNotice } = useSelector((state) => state.auth);
  const isLoading = status === 'loading';
  const destination = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthMessages());

    try {
      await dispatch(loginUser({ email, password })).unwrap();
      navigate(destination, { replace: true });
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
        <h1>Welcome back</h1>
        <p>Sign in to SpendWise</p>

        {(error || apiNotice) && (
          <div className={error ? 'form-message error' : 'form-message notice'}>
            {error || apiNotice}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
            {isLoading ? 'Signing in' : 'Continue'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
