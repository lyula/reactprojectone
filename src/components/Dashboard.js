import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { useNavigate } from 'react-router-dom';

const UPDATE_LIMIT = 2; // max updates allowed
const UPDATE_WINDOW_DAYS = 7;

const Dashboard = ({ token, setToken }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [country, setCountry] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [localTime, setLocalTime] = useState('');
  const [timezone, setTimezone] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);
  const [lastUpdates, setLastUpdates] = useState([]);
  const [form, setForm] = useState({ name: '', email: '' });
  const navigate = useNavigate();

  // Load update history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('profileUpdateHistory');
    if (stored) {
      const parsed = JSON.parse(stored);
      const now = Date.now();
      const recent = parsed.filter(
        (t) => now - t < UPDATE_WINDOW_DAYS * 24 * 60 * 60 * 1000
      );
      setLastUpdates(recent);
      setUpdateCount(recent.length);
      localStorage.setItem('profileUpdateHistory', JSON.stringify(recent));
    }
  }, []);

  // Fetch user data
  useEffect(() => {
    if (!token) {
      setError('Please log in');
      navigate('/login');
      return;
    }
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/users/me`,
          {
            headers: {
              'x-api-key': 'clip-pilot2000',
              Authorization: `Bearer ${token}`
            }
          }
        );
        setUser(response.data);
        setForm({ name: response.data.name, email: response.data.email });
      } catch (error) {
        setError(error.response?.data.message || 'Failed to load user data');
        setToken('');
        navigate('/login');
      }
    };
    fetchUser();
  }, [token, navigate, setToken]);

  // Fetch location data
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await axios.get('https://ipapi.co/json/');
        setCountry(res.data.country_name || 'Unknown');
        setCountryCode(res.data.country_code?.toLowerCase() || '');
        setTimezone(res.data.timezone || 'Unknown');
        const now = new Date().toLocaleString('en-US', {
          timeZone: res.data.timezone,
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        setLocalTime(now);
      } catch {
        setCountry('Unknown');
        setCountryCode('');
        setTimezone('Unknown');
        setLocalTime(
          new Date().toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        );
      }
    };
    fetchLocation();
  }, []);

  const currentYear = new Date().getFullYear();

  // Handle profile form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const now = Date.now();
    const recent = lastUpdates.filter(
      (t) => now - t < UPDATE_WINDOW_DAYS * 24 * 60 * 60 * 1000
    );
    if (recent.length >= UPDATE_LIMIT) {
      Swal.fire({
        icon: 'warning',
        title: 'Update Limit Reached',
        text: `You can only update your profile ${UPDATE_LIMIT} times every ${UPDATE_WINDOW_DAYS} days.`,
        confirmButtonText: 'OK'
      });
      return;
    }
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/me`,
        { name: form.name, email: form.email },
        {
          headers: {
            'x-api-key': 'clip-pilot2000',
            Authorization: `Bearer ${token}`
          }
        }
      );
      setUser(response.data);
      setForm({ name: response.data.name, email: response.data.email });
      setEditMode(false);
      const updates = [...recent, now];
      setLastUpdates(updates);
      setUpdateCount(updates.length);
      localStorage.setItem('profileUpdateHistory', JSON.stringify(updates));
      Swal.fire({
        icon: 'success',
        title: 'Profile Updated',
        text: 'Your profile has been updated successfully!',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      const errorMsg = error.response?.data.message || 'Failed to update profile';
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: errorMsg,
        confirmButtonText: 'OK'
      });
    }
  };

  // Handle logout
  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('profileUpdateHistory'); // Clear update history on logout
    navigate('/login');
  };

  // User details component for profile view
  const UserProfileDetails = () => (
    <div className="card mt-4 shadow-sm border-0">
      <div className="card-body text-center">
        <h5 className="card-title text-primary mb-3">
          <i className="bi bi-person-circle me-2"></i>User Profile
        </h5>
        <div className="mb-3">
          <img
            src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=0D8ABC&color=fff&size=80`}
            alt="avatar"
            className="rounded-circle mb-2"
            width="80"
            height="80"
          />
        </div>
        {!editMode ? (
          <>
            <div className="mb-2"><strong>Name:</strong> {user?.name}</div>
            <div className="mb-2"><strong>Email:</strong> {user?.email}</div>
            <div className="mb-2"><strong>Country:</strong> {country}</div>
            <div className="mb-2"><strong>Timezone:</strong> {timezone}</div>
            <div className="mb-2">
              <strong>Joined:</strong>{' '}
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : 'N/A'}
            </div>
            <button
              className="btn btn-outline-primary mt-3"
              onClick={() => {
                setEditMode(true);
                setForm({ name: user?.name || '', email: user?.email || '' });
              }}
              disabled={editMode || updateCount >= UPDATE_LIMIT}
            >
              Edit Profile
            </button>
            {updateCount >= UPDATE_LIMIT && (
              <div className="mt-2 text-danger small">
                You have reached your update limit for {UPDATE_WINDOW_DAYS} days.
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleProfileUpdate} className="mt-3">
            <div className="mb-2">
              <input
                type="text"
                name="name"
                className="form-control"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Name"
              />
            </div>
            <div className="mb-2">
              <input
                type="email"
                name="email"
                className="form-control"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="Email"
              />
            </div>
            <button
              type="submit"
              className="btn btn-success me-2"
              disabled={updateCount >= UPDATE_LIMIT}
            >
              Save
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setEditMode(false);
                setForm({ name: user?.name || '', email: user?.email || '' });
              }}
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );

  // Quick Tips component for default view
  const QuickTips = () => (
    <div className="card mt-4 shadow-sm border-0">
      <div className="card-body">
        <h5 className="card-title text-primary mb-3">
          <i className="bi bi-lightbulb-fill me-2"></i>Quick Tips
        </h5>
        <ul className="list-unstyled mb-0">
          <li className="mb-2">
            <i className="bi bi-check-circle-fill text-success me-2"></i>
            Practice CRUD operations regularly.
          </li>
          <li className="mb-2">
            <i className="bi bi-check-circle-fill text-success me-2"></i>
            Read and write code every day.
          </li>
          <li className="mb-2">
            <i className="bi bi-check-circle-fill text-success me-2"></i>
            Explore MongoDB queries and aggregations.
          </li>
          <li className="mb-2">
            <i className="bi bi-check-circle-fill text-success me-2"></i>
            Build small MERN projects to master concepts.
          </li>
          <li>
            <i className="bi bi-check-circle-fill text-success me-2"></i>
            Don’t hesitate to Google and ask questions!
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <style>
        {`
          .form-control {
            padding: 8px;
            font-size: 1rem;
            border-radius: 4px;
            border: 1px solid #ced4da;
            width: 100%;
            max-width: 300px;
            margin: 0 auto;
          }
          .btn-success, .btn-secondary, .btn-outline-primary {
            padding: 8px 16px;
            font-size: 1rem;
            border-radius: 4px;
          }
          .btn-success {
            background-color: #28a745;
            border-color: #28a745;
          }
          .btn-success:hover {
            background-color: #218838;
            border-color: #1e7e34;
          }
          .btn-secondary {
            background-color: #6c757d;
            border-color: #6c757d;
          }
          .btn-secondary:hover {
            background-color: #5a6268;
            border-color: #545b62;
          }
          .card-body {
            padding: 20px;
          }
        `}
      </style>
      <nav className="d-md-none navbar navbar-light bg-white shadow-sm px-3 mb-3 d-flex flex-row align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <img
            src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=0D8ABC&color=fff&size=40`}
            alt="avatar"
            className="rounded-circle me-2"
            width="40"
            height="40"
          />
          <div>
            <div className="fw-bold">{user ? user.name : 'User'}</div>
            <div className="text-muted small">{user ? user.email : ''}</div>
          </div>
        </div>
        <button className="btn btn-danger btn-sm" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i> Log Out
        </button>
      </nav>
      <div className="row flex-grow-1 g-0 flex-fill" style={{ minHeight: 0 }}>
        <nav className="col-md-3 col-lg-2 d-none d-md-flex flex-column bg-white shadow-sm p-0 min-vh-100 position-relative">
          <div className="text-center my-4">
            <img
              src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=0D8ABC&color=fff&size=80`}
              alt="avatar"
              className="rounded-circle mb-2"
              width="80"
              height="80"
            />
            <h5 className="mt-2">{user ? user.name : 'User'}</h5>
            <span className="text-muted small">{user ? user.email : ''}</span>
          </div>
          <ul className="nav flex-column text-center mb-5">
            <li className="nav-item mb-2">
              <span
                className={`nav-link fw-bold ${!showProfile ? 'active' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => setShowProfile(false)}
              >
                <i className="bi bi-house-door-fill me-2"></i>Home
              </span>
            </li>
            <li className="nav-item mb-2">
              <span
                className={`nav-link ${showProfile ? 'active fw-bold' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => setShowProfile(true)}
              >
                <i className="bi bi-person-fill me-2"></i>Profile
              </span>
            </li>
            <li className="nav-item mt-4">
              <button className="btn btn-danger w-75" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i>Log Out
              </button>
            </li>
          </ul>
          <footer
            className="text-center py-3 px-2 w-100 position-absolute bottom-0 start-0"
            style={{
              background: 'linear-gradient(90deg, #0d6efd 0%, #6610f2 100%)',
              color: '#fff',
              fontWeight: 500,
              letterSpacing: '0.5px',
              borderTop: '4px solid #198754',
              fontSize: '1.1rem',
            }}
          >
            <span>
              © {currentYear}{' '}
              <a
                href="https://zack-lyula-portfolio.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#fff',
                  textDecoration: 'underline',
                  fontWeight: 700,
                  transition: 'color 0.2s',
                }}
                onMouseOver={(e) => (e.target.style.color = '#ffd700')}
                onMouseOut={(e) => (e.target.style.color = '#fff')}
              >
                Zack Lyula
              </a>
              . All Rights Reserved.
            </span>
          </footer>
        </nav>
        <main
          className="col-12 col-md-9 col-lg-10 d-flex align-items-center justify-content-center py-4"
          style={{ minHeight: 0 }}
        >
          <div className="w-100" style={{ maxWidth: '600px' }}>
            <div
              className="card shadow p-4 mb-4"
              style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}
            >
              <h2 className="mb-4 text-center">Welcome to Your Dashboard</h2>
              {user ? (
                <div className="card-body p-0">
                  <div className="d-flex flex-column flex-sm-row justify-content-center align-items-center mb-3 gap-3">
                    <div className="text-center">
                      <strong>Your Country:</strong>
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        {country}
                        {countryCode && (
                          <img
                            src={`https://flagcdn.com/24x18/${countryCode}.png`}
                            alt={country}
                            title={country}
                            width="24"
                            height="18"
                            style={{ borderRadius: '2px', border: '1px solid #eee' }}
                          />
                        )}
                      </div>
                    </div>
                    <div
                      className="d-none d-sm-block mx-4"
                      style={{ borderLeft: '2px solid #eee', height: '40px' }}
                    ></div>
                    <div className="text-center">
                      <strong>Current Time:</strong>
                      <div>{localTime}</div>
                      <div className="small text-muted mt-1">
                        <i className="bi bi-globe2 me-1"></i>
                        {timezone}
                      </div>
                    </div>
                  </div>
                  <div className="alert alert-info text-center mt-4">
                    Keep coding, <strong>MERN Stack</strong> will get easier when you practice often!
                  </div>
                  {showProfile ? <UserProfileDetails /> : <QuickTips />}
                  <div className="text-center mt-4">
                    <div className="display研发6 mb-2" style={{ color: '#0d6efd', fontWeight: 700 }}>
                      🎉 Happy Coding! 🎉
                    </div>
                    <div className="lead" style={{ color: '#198754', fontWeight: 500 }}>
                      Best of luck on your MERN journey!
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center">{error || 'Loading...'}</p>
              )}
            </div>
          </div>
        </main>
      </div>
      <footer
        className="d-md-none w-100 text-center py-2"
        style={{
          background: '#0d6efd',
          color: '#fff',
          fontWeight: 500,
          fontSize: '1rem',
          borderTop: '2px solid #198754',
        }}
      >
        <span>
          © {currentYear}{' '}
          <a
            href="https://zack-lyula-portfolio.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#fff',
              textDecoration: 'underline',
              fontWeight: 700,
            }}
          >
            Zack Lyula
          </a>
        </span>
      </footer>
    </div>
  );
};

export default Dashboard;