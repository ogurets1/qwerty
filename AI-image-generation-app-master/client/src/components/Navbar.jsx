import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { logo } from '../assets';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="w-full flex justify-between items-center bg-white sm:px-8 px-4 py-4 border-b border-b-[#e6ebf4]">
      <Link to="/">
        <img src={logo} alt="logo" className="w-28 object-contain" />
      </Link>
      <div className="flex items-center">
        {user ? (
          <>
            <Link to="/profile" className="font-inter font-medium text-black px-4 py-2">Profile</Link>
            <Link to="/create-post" className="font-inter font-medium text-black px-4 py-2">Post</Link>
            <button onClick={logout} className="font-inter font-medium text-black px-4 py-2">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="font-inter font-medium text-black px-4 py-2">Login</Link>
            <Link to="/register" className="font-inter font-medium text-black px-4 py-2">Register</Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
