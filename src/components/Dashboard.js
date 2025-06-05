import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = ({ token }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
         `${process.env.REACT_APP_API_URL}/api/users/me`,
          {
            headers: {
              'x-api-key': 'clip-pilot2000',
              'Authorization': `Bearer ${token}`
            }
          }
        );
        setUser(response.data);
      } catch (error) {
        setError('Failed to load user data');
      }
    };
    if (token) fetchUser();
  }, [token]);

  return (
    <div>
      <h2>Dashboard</h2>
      {user ? (
        <p>Welcome, {user.name}!</p>
      ) : (
        <p>{error || 'Loading...'}</p>
      )}
    </div>
  );
};

export default Dashboard;