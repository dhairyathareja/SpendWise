import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PremiumBackground from './components/PremiumBackground';
import Navbar from './components/Navbar';

import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Blog from './pages/Blog';
import './index.css';

function App() {
  return (
    <Router>
      <div className="page-container">
        <PremiumBackground />
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/blog" element={<Blog />} />
          </Routes>
        </main>

      </div>
    </Router>
  );
}

export default App;
