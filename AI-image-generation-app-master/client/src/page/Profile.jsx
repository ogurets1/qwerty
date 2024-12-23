import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found in localStorage');
          return;
        }

        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
        const response = await axios.get('http://localhost:8080/api/v1/auth/profile', config);
        setUser(response.data.user);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const handleSubscribe = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.post('http://localhost:8080/api/v1/auth/subscribe', {}, config);
      const response = await axios.get('http://localhost:8080/api/v1/auth/profile', config);
      setUser(response.data.user);
    } catch (error) {
      console.error('Error subscribing user:', error);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.post('http://localhost:8080/api/v1/auth/cancel-subscription', {}, config);
      const response = await axios.get('http://localhost:8080/api/v1/auth/profile', config);
      setUser(response.data.user);
    } catch (error) {
      console.error('Error canceling subscription:', error);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">User Profile</h2>
        <div className="profile">
          {user && (
            <>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Subscription:</strong> {user.subscription ? 'Active' : 'Inactive'}</p>
              {user.subscription && user.subscriptionEndDate && (
                <p><strong>Subscription ends:</strong> {new Date(user.subscriptionEndDate).toLocaleDateString()}</p>
              )}
              <div className="flex justify-center mt-4">
                {!user.subscription ? (
                  <button onClick={handleSubscribe} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Activate Subscription
                  </button>
                ) : (
                  <button onClick={handleCancelSubscription} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                    Cancel Subscription
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
