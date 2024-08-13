import React, { useState, useEffect } from 'react';
import {
  Route,
  Routes,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import RegistrationForm from './RegistrationForm';
import AdminPanel from './AdminPanel';
import Login from './Login';
import Header from './Header';
import './App.css';
import UserQRCode from './UserQRCode';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!token && location.pathname === '/admin') {
      navigate('/login');
    }
  }, [token, location.pathname, navigate]);

  useEffect(() => {
    localStorage.setItem('token', token);
  }, [token]);

  return (
    <div className="App">
      {location.pathname !== '/login' && <Header />}
      <Routes>
        <Route path="/" element={<RegistrationForm />} />
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/user/:id/qr" element={<UserQRCode />} />
        <Route
          path="/admin"
          element={
            token ? (
              <AdminPanel setToken={setToken} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </div>
  );
};

export default App;
