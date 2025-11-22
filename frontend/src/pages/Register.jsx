import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useAuth();
  const nav = useNavigate();
  const [err, setErr] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);
    try {
      await register({ name, email, password });
      nav('/login');
    } catch (error) {
      setErr(error.response?.data?.message || error.message || 'Registration failed');
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Create account</h2>
      {err && <div className="text-red-500 mb-2">{err}</div>}
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" />
        <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
        <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
        <div className="flex items-center gap-2">
          <button className="btn">Create</button>
        </div>
      </form>
    </div>
  );
}
