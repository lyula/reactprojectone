import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Password strength: min 8 chars, at least 1 letter and 1 number
  const isStrongPassword = (pwd) => {
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(pwd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

gi    // 1. Check if email exists first
    try {
      const emailCheck = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/check-email`,
        { email },
        { headers: { 'x-api-key': 'clip-pilot2000' } }
      );
      if (emailCheck.data.exists) {
        Swal.fire({
          icon: 'warning',
          title: 'Email Already Registered',
          text: 'The email you entered is already in use. Please use a different email.',
          confirmButtonText: 'OK'
        });
        return;
      }
    } catch (err) {
      // If the endpoint doesn't exist or fails, fallback to old logic
      // (You can remove this catch if your backend always supports check-email)
    }

    // 2. Validate password strength
    if (!isStrongPassword(password)) {
      Swal.fire({
        icon: 'warning',
        title: 'Weak Password',
        text: 'Password must be at least 8 characters long and contain at least one letter and one number.',
        confirmButtonText: 'OK'
      });
      return;
    }

    // 3. Validate password match
    if (password !== confirmPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Password Mismatch',
        text: 'Passwords do not match.',
        confirmButtonText: 'OK'
      });
      return;
    }

    // 4. Register user
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/register`,
        { name, email, password },
        { headers: { 'x-api-key': 'clip-pilot2000' } }
      );
      Swal.fire({
        icon: 'success',
        title: `Welcome, ${name}!`,
        text: 'Your account has been created successfully.',
        confirmButtonText: 'OK'
      }).then(() => {
        navigate('/login');
      });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error registering';
      if (
        error.response &&
        (error.response.status === 409 ||
          errorMsg.toLowerCase().includes('email') && errorMsg.toLowerCase().includes('exist'))
      ) {
        Swal.fire({
          icon: 'warning',
          title: 'Email Already Registered',
          text: 'The email you entered is already in use. Please use a different email.',
          confirmButtonText: 'OK'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: errorMsg,
          confirmButtonText: 'OK'
        });
      }
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div className="card p-4 shadow" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="mb-4 text-center">Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
          <div className="mb-3 position-relative">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                color: '#888'
              }}
            >
              {showPassword ? (
                <i className="bi bi-eye-slash"></i>
              ) : (
                <i className="bi bi-eye"></i>
              )}
            </span>
          </div>
          <div className="mb-3 position-relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="form-control"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <span
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                color: '#888'
              }}
            >
              {showConfirmPassword ? (
                <i className="bi bi-eye-slash"></i>
              ) : (
                <i className="bi bi-eye"></i>
              )}
            </span>
          </div>
          <button type="submit" className="btn btn-primary w-100 mb-2">Register</button>
        </form>
        <div className="text-center">
          <span>Already have an account? </span>
          <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
