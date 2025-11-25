// Home.jsx - Updated with visual components (no logic changes)
import React, { useEffect, useMemo, useState } from 'react';
import { fetchCourses } from '../api/courses';
import HomeHeroSection from '../components/HomeHeroSection';
import EnhancedCourseCard from '../components/EnhancedCourseCard';

const getId = c => c?.id || c?._id;

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    return () => {
      mounted = false;
    };
  }, []);

  const activeCourses = useMemo(
    () => (courses || []).filter(c => c.isActive !== false),
    [courses]
  );

  function downloadXlsx(id) {
    window.open(`${apiBase}/courses/${id}/export-xlsx`, '_blank');
  }

  const filtered = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    if (!q) return activeCourses;
    return activeCourses.filter(
      c =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.track || '').toLowerCase().includes(q) ||
        (c.code || '').toLowerCase().includes(q)
    );
  }, [activeCourses, query]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero Section */}
      <HomeHeroSection />

      {/* Search Section */}
      <div id="courses-section" className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Explore Courses
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Search by name, technology or code and compare different durations
              to see what you'll learn and what you might miss.
            </p>
          </div>
          <div className="w-full md:w-80">
            <div className="relative">
              <input
                className="input w-full pl-10"
                placeholder="Search e.g. MERN, Java, Data Science..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <section>
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading courses…</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center shadow">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No courses matched your search.
            </p>
            <button
              onClick={() => setQuery('')}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Showing <strong>{filtered.length}</strong> course{filtered.length !== 1 ? 's' : ''}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map(c => (
                <EnhancedCourseCard
                  key={getId(c)}
                  course={c}
                  onDownload={downloadXlsx}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}