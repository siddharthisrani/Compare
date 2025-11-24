// Header.jsx - Only responsive changes, no logic changes
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

export default function Header() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full px-4 sm:px-6">
      <div className="flex items-center justify-between py-4">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm sm:text-base">
              CC
            </div>
            <div className="xs:block">
              <div className="font-semibold text-sm sm:text-base">CourseCompare</div>
              <div className="text-xs text-gray-500">Compare. Learn. Upgrade.</div>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-3">
          <Link to="/compare" className="text-sm px-3 py-2 rounded hover:bg-gray-100">Compare</Link>
          <Link to="/" className="text-sm px-3 py-2 rounded hover:bg-gray-100">Courses</Link>

          {user ? (
            <>
              {(user.role === 'admin' || user.role === 'trainer') && (
                <Link to="/admin" className="px-3 py-2 rounded bg-indigo-600 text-white">Admin</Link>
              )}
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

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded hover:bg-gray-100"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden pb-4 border-t pt-4">
          <nav className="flex flex-col gap-2">
            <Link
              to="/compare"
              className="text-sm px-3 py-2 rounded hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Compare
            </Link>
            <Link
              to="/"
              className="text-sm px-3 py-2 rounded hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Courses
            </Link>

            {user ? (
              <>
                {(user.role === 'admin' || user.role === 'trainer') && (
                  <Link
                    to="/admin"
                    className="px-3 py-2 rounded bg-indigo-600 text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <div className="text-sm text-gray-700 dark:text-gray-200 px-3 py-2 border-t mt-2 pt-3">
                  Hi, {user.name}
                </div>
                <button
                  onClick={() => {
                    logout();
                    nav('/login');
                    setMobileMenuOpen(false);
                  }}
                  className="btn-ghost text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 rounded border"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-2 rounded bg-indigo-600 text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}