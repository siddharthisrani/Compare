// frontend/src/pages/Home.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { fetchCourses } from '../api/courses';
import { Link } from 'react-router-dom';

const getId = c => c?.id || c?._id;

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await fetchCourses();
        if (mounted) setCourses(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const activeCourses = useMemo(
    () => (courses || []).filter(c => c.isActive !== false),
    [courses]
  );

  const filtered = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    if (!q) return activeCourses;
    return activeCourses.filter(c =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.track || '').toLowerCase().includes(q) ||
      (c.code || '').toLowerCase().includes(q)
    );
  }, [activeCourses, query]);

  return (
    <div className="space-y-6">
      <header className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Choose your course</h1>
          <p className="text-sm text-gray-500">
            Search by name, technology or code and compare different durations
            to see what you’ll learn and what you might miss.
          </p>
        </div>
        <div className="w-full md:w-80">
          <input
            className="input w-full"
            placeholder="Search e.g. MERN, Java, Data Science..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </header>

      <section className="bg-transparent">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading courses…</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No active courses matched your search.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(c => (
              <article
                key={getId(c)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="text-xs uppercase tracking-wide text-indigo-500">
                    {c.track || 'Course'}
                  </div>
                  <h2 className="font-semibold">{c.name}</h2>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    {c.displayDuration && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                        {c.displayDuration}
                      </span>
                    )}
                    {c.code && (
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {c.code}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Updated:{' '}
                    {c.lastUpdated
                      ? new Date(c.lastUpdated).toLocaleDateString()
                      : '—'}
                  </span>
                  <Link
                    to="/compare"
                    className="text-indigo-600 hover:underline font-medium"
                  >
                    Compare →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
