import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

export default function Header() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <header className="flex items-center justify-between py-4">
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold">CC</div>
          <div>
            <div className="font-semibold">CourseCompare</div>
            <div className="text-xs text-gray-500">Compare. Learn. Upgrade.</div>
          </div>
        </Link>
      </div>

      <nav className="flex items-center gap-3">
        <Link to="/compare" className="text-sm px-3 py-2 rounded hover:bg-gray-100">Compare</Link>
        <Link to="/" className="text-sm px-3 py-2 rounded hover:bg-gray-100">Courses</Link>

        {user ? (
          <>
            { (user.role === 'admin' || user.role === 'trainer') && <Link to="/admin" className="px-3 py-2 rounded bg-indigo-600 text-white">Admin</Link> }
            <div className="text-sm text-gray-700 dark:text-gray-200 mr-2">Hi, {user.name}</div>
            <button onClick={() => { logout(); nav('/login'); }} className="btn-ghost">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="px-3 py-2 rounded border">Login</Link>
            <Link to="/register" className="px-3 py-2 rounded bg-indigo-600 text-white">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  );
}
