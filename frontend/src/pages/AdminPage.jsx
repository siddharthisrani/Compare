// frontend/src/pages/AdminPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import AdminModal from '../components/AdminModal';
import { fetchCourses, createOrUpdateCourse, toggleCourseActive, importCsv } from '../api/courses';
import { fetchUsers, createUser, updateUser, deactivateUser } from '../api/users';
import { useAuth } from '../context/AuthProvider';

const getId = c => c?.id || c?._id;

export default function AdminPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('courses'); // 'courses' | 'users'

  if (!user) {
    return <div className="p-6 bg-white rounded shadow">Please login.</div>;
  }

  const isAdmin = user.role === 'admin';
  const isTrainer = user.role === 'trainer';

  if (!isAdmin && !isTrainer) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded shadow">
        Only <strong>admin or trainer</strong> can access this page.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            {isAdmin ? 'Admin Dashboard' : 'Trainer Dashboard'}
          </h2>
          <div className="text-sm text-gray-500">
            {isAdmin
              ? 'Manage courses and users.'
              : 'Manage your courses and syllabus.'}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className={`px-3 py-1 rounded ${
              tab === 'courses' ? 'bg-indigo-600 text-white' : 'btn-ghost'
            }`}
            onClick={() => setTab('courses')}
          >
            Courses
          </button>
          {isAdmin && (
            <button
              className={`px-3 py-1 rounded ${
                tab === 'users' ? 'bg-indigo-600 text-white' : 'btn-ghost'
              }`}
              onClick={() => setTab('users')}
            >
              Users
            </button>
          )}
        </div>
      </div>

      {tab === 'courses' ? <AdminCoursesSection /> : isAdmin ? <AdminUsersSection /> : null}
    </div>
  );
}

/* ------------------ Courses section ------------------ */

function AdminCoursesSection() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);
  const [importing, setImporting] = useState(false);
  const [selectedCourseCode, setSelectedCourseCode] = useState('');

  useEffect(() => { loadCourses(); }, []);

  async function loadCourses() {
    setLoading(true);
    try {
      const data = await fetchCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: 'Failed to load courses' });
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(course) {
    setEditing(course);
    setModalOpen(true);
  }

  function closeModal() {
    setEditing(null);
    setModalOpen(false);
  }

  async function handleSave(course) {
    try {
      setStatusMsg({ type: 'info', text: 'Saving...' });
      await createOrUpdateCourse(course);
      setStatusMsg({ type: 'success', text: 'Saved' });
      await loadCourses();
    } catch (err) {
      console.error(err);
      setStatusMsg({
        type: 'error',
        text:
          err.response?.data?.message ||
          err.message ||
          'Save failed'
      });
    } finally {
      closeModal();
      setTimeout(() => setStatusMsg(null), 2500);
    }
  }

  async function handleToggleActive(course) {
    const label = course.isActive ? 'deactivate' : 'activate';
    if (!window.confirm(`Do you want to ${label} this course?`)) return;

    try {
      await toggleCourseActive(course);
      await loadCourses();
      setStatusMsg({
        type: 'success',
        text: `Course ${course.isActive ? 'deactivated' : 'activated'}`
      });
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: 'Failed to change status' });
    } finally {
      setTimeout(() => setStatusMsg(null), 2500);
    }
  }

  // CSV import from top bar (add or merge topics)
  async function handleCsvImport(file) {
    if (!file) return;
    if (!selectedCourseCode) {
      setStatusMsg({ type: 'error', text: 'Select a course code first' });
      return;
    }
    setImporting(true);
    setStatusMsg({ type: 'info', text: 'Uploading CSV…' });
    try {
      const fd = new FormData();
      fd.append('file', file);
      await importCsv(fd, selectedCourseCode); // merge mode
      setStatusMsg({ type: 'success', text: 'CSV imported successfully' });
      await loadCourses();
    } catch (err) {
      console.error(err);
      setStatusMsg({
        type: 'error',
        text:
          err.response?.data?.message ||
          err.message ||
          'Upload failed'
      });
    } finally {
      setImporting(false);
      setTimeout(() => setStatusMsg(null), 3500);
    }
  }

  const filtered = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    if (!q) return courses;
    return courses.filter(c =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.track || '').toLowerCase().includes(q) ||
      (c.code || '').toLowerCase().includes(q)
    );
  }, [courses, query]);

  return (
    <div className="space-y-4 bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <button className="btn" onClick={openNew}>+ New course</button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            className="input"
            value={selectedCourseCode}
            onChange={e => setSelectedCourseCode(e.target.value)}
          >
            <option value="">Select course (for CSV import)</option>
            {courses.map(c => (
              <option key={getId(c)} value={c.code || getId(c)}>
                {c.name} {c.displayDuration ? `(${c.displayDuration})` : ''}
              </option>
            ))}
          </select>

          <label className="btn-ghost cursor-pointer px-3 py-2 rounded flex items-center gap-2">
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) handleCsvImport(file);
              }}
            />
            <span>{importing ? 'Uploading…' : 'Upload topics (CSV)'}</span>
          </label>

          <input
            className="input max-w-xs"
            placeholder="Search courses..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-2 rounded text-sm ${
            statusMsg.type === 'error'
              ? 'bg-red-100 text-red-700'
              : statusMsg.type === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-blue-100 text-blue-700'
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-gray-500">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Code</th>
              <th className="p-2 text-left">Track</th>
              <th className="p-2 text-left">Duration</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="p-4">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="6" className="p-4 text-center text-gray-500">No courses</td></tr>
            ) : (
              filtered.map(c => (
                <tr key={getId(c)} className="border-b last:border-0">
                  <td className="p-2">{c.name}</td>
                  <td className="p-2">{c.code}</td>
                  <td className="p-2">{c.track}</td>
                  <td className="p-2">{c.displayDuration}</td>
                  <td className="p-2">{c.isActive === false ? 'Inactive' : 'Active'}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button className="btn-ghost px-2 py-1" onClick={() => openEdit(c)}>
                        Edit
                      </button>
                      <button
                        className="btn-ghost px-2 py-1"
                        onClick={() => handleToggleActive(c)}
                      >
                        {c.isActive === false ? 'Activate' : 'Deactivate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <AdminModal initial={editing} onClose={closeModal} onSave={handleSave} />
      )}
    </div>
  );
}

/* ------------------ Users section stays same as before ------------------ */

function AdminUsersSection() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'trainer' });
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  }

  function startNew() {
    setEditing(null);
    setForm({ name: '', email: '', password: '', role: 'trainer' });
  }

  function startEdit(u) {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: '', role: u.role });
  }

  function onChangeField(k, v) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    try {
      setStatusMsg({ type: 'info', text: editing ? 'Updating user...' : 'Creating user...' });
      if (editing) {
        const payload = { name: form.name, email: form.email, role: form.role };
        if (form.password) payload.password = form.password;
        await updateUser(getId(editing), payload);
      } else {
        await createUser(form);
      }
      setStatusMsg({ type: 'success', text: 'Saved' });
      await loadUsers();
      startNew();
    } catch (err) {
      console.error(err);
      const data = err.response?.data;
      const text = data?.errors
        ? data.errors.map(e => e.msg).join(', ')
        : data?.message || err.message || 'Save failed';
      setStatusMsg({ type: 'error', text });
    } finally {
      setTimeout(() => setStatusMsg(null), 3000);
    }
  }

  async function onDeactivate(u) {
    if (!window.confirm(`Deactivate user ${u.email}?`)) return;
    try {
      await deactivateUser(getId(u));
      await loadUsers();
      setStatusMsg({ type: 'success', text: 'User deactivated' });
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: 'Failed to deactivate user' });
    } finally {
      setTimeout(() => setStatusMsg(null), 3000);
    }
  }

  const filtered = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    if (!q) return users;
    return users.filter(u =>
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.role || '').toLowerCase().includes(q)
    );
  }, [users, query]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
        <h3 className="font-semibold mb-2">{editing ? 'Edit user' : 'Add new user'}</h3>
        {statusMsg && (
          <div
            className={`p-2 mb-2 rounded text-sm ${
              statusMsg.type === 'error'
                ? 'bg-red-100 text-red-700'
                : statusMsg.type === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {statusMsg.text}
          </div>
        )}
        <form onSubmit={onSubmit} className="space-y-2">
          <input
            className="input"
            placeholder="Name"
            value={form.name}
            onChange={e => onChangeField('name', e.target.value)}
          />
          <input
            className="input"
            placeholder="Email"
            value={form.email}
            onChange={e => onChangeField('email', e.target.value)}
          />
          <input
            className="input"
            type="password"
            placeholder={editing ? 'New password (optional)' : 'Password'}
            value={form.password}
            onChange={e => onChangeField('password', e.target.value)}
          />
          <select
            className="input"
            value={form.role}
            onChange={e => onChangeField('role', e.target.value)}
          >
            <option value="trainer">Trainer</option>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
          <div className="flex gap-2">
            <button className="btn" type="submit">
              {editing ? 'Update' : 'Create'}
            </button>
            {editing && (
              <button type="button" className="btn-ghost" onClick={startNew}>
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Users</h3>
          <input
            className="input max-w-xs"
            placeholder="Search users..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Role</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="p-4">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="5" className="p-4 text-center text-gray-500">No users</td></tr>
              ) : (
                filtered.map(u => (
                  <tr key={getId(u)} className="border-b last:border-0">
                    <td className="p-2">{u.name}</td>
                    <td className="p-2">{u.email}</td>
                    <td className="p-2">{u.role}</td>
                    <td className="p-2">{u.isActive === false ? 'Inactive' : 'Active'}</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <button className="btn-ghost px-2 py-1" onClick={() => startEdit(u)}>
                          Edit
                        </button>
                        {u.role !== 'admin' && (
                          <button
                            className="btn-ghost px-2 py-1"
                            onClick={() => onDeactivate(u)}
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
