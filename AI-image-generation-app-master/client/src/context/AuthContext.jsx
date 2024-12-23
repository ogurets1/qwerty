import React, { createContext, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const register = async (formData) => {
    try {
      const response = await axios.post('http://localhost:8080/api/v1/auth/register', formData);
      console.log('Registration response:', response.data);
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error.response ? error.response.data : error.message);
      if (error.response && error.response.data.message === 'Email already in use') {
        alert('Email already in use. Please try a different email.');
      } else {
        alert('Error registering user. Please try again later.');
      }
    }
  };

  const login = async (formData) => {
    try {
      const { data } = await axios.post('http://localhost:8080/api/v1/auth/login', formData);
      localStorage.setItem('token', data.token);
      setUser({ id: data.userId });
      navigate('/');
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Error logging in. Please try again later.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
