import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  // Persist token to localStorage when it changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/dashboard" element={<Dashboard token={token} setToken={setToken} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;