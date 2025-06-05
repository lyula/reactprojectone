import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ setToken }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('sweetalert2').then((module) => {
        window.Swal = module.default;
      });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/login`,
        { email, password },
        { headers: { 'x-api-key': 'clip-pilot2000' } }
      );
      setToken(response.data.token);
      Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: 'Welcome back!',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        navigate('/dashboard');
      });
    } catch (error) {
      let errorMsg = 'Error logging in';
      if (error.response && error.response.data && error.response.data.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      console.log('Login error:', errorMsg, error);
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: errorMsg,
        confirmButtonText: 'OK'
      });
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div className="card p-4 shadow" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="mb-4 text-center">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 mb-2">Login</button>
        </form>
        <div className="text-center">
          <span>Don't have an account? </span>
          <Link to="/">{'Register'}</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;