import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const nav = useNavigate();
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true); setErr(null);
    try {
      await login({ email, password });
      nav('/');
    } catch (error) {
      setErr(error.response?.data?.message || error.message || 'Login failed');
    } finally { setLoading(false); }
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Sign in</h2>
      {err && <div className="text-red-500 mb-2">{err}</div>}
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
        <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
        <div className="flex items-center gap-2">
          <button className="btn" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
          <button type="button" className="btn-ghost" onClick={()=>{ setEmail('admin@institute.com'); setPassword('password123'); }}>Use demo</button>
        </div>
      </form>
    </div>
  );
}
