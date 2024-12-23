import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './page/Home';
import CreatePost from './page/CreatePost';
import Login from './page/Login';
import Profile from './page/Profile';
import Register from './page/Register';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create-post" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
