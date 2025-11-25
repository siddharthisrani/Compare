// frontend/src/pages/Compare.jsx - With visual components integrated
import React, { useEffect, useMemo, useState } from 'react';
import { fetchCourses } from '../api/courses';
import { fetchTopicImportance } from '../api/ai';
import ComparisonVisualizer from '../components/ComparisonVisualizer';
import CourseDetailModal from '../components/CourseDetailModal';
import CourseStatsVisual from '../components/CourseStatsVisual';
import TopicCoverageChart from '../components/TopicCoverageChart';
import { computeIntersectionAndMissing } from '../utils/compare';
import { useAuth } from '../context/AuthProvider';

const getId = c => c?.id || c?._id;

export default function Compare() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leftId, setLeftId] = useState('');
  const [rightId, setRightId] = useState('');
  const [detailTopic, setDetailTopic] = useState(null); // {topic, technology, reason, wikiUrl}
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await fetchCourses();
        if (mounted) setCourses(data || []);
      } catch (err) {
        console.error('Failed to load courses', err);
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

  const leftCourse = activeCourses.find(c => getId(c) === leftId);
  const rightCourse = activeCourses.find(c => getId(c) === rightId);
  const selectedCourses = [leftCourse, rightCourse].filter(Boolean);

  // Calculate comparison data for TopicCoverageChart
  const comparisonData = useMemo(() => {
    if (selectedCourses.length !== 2) {
      return { common: [], missingModules: [] };
    }

    const [courseA, courseB] = selectedCourses;
    
    const countTopics = (c) =>
      (c.syllabus || []).reduce((sum, m) => sum + ((m.topics || []).length), 0);

    const leftSize = countTopics(courseA);
    const rightSize = countTopics(courseB);

    const shorter = leftSize <= rightSize ? courseA : courseB;
    const longer = leftSize <= rightSize ? courseB : courseA;

    const { common, missingModules } = computeIntersectionAndMissing(shorter, longer);
    return { common, missingModules };
  }, [selectedCourses]);

  async function handleExplainTopic(topicName, technology) {
    if (!leftCourse || !rightCourse) return;

    setAiLoading(true);
    setDetailTopic({ topic: topicName, technology, reason: null, wikiUrl: null });

    try {
      const leftSize = (leftCourse.syllabus || []).reduce(
        (s, m) => s + (m.topics || []).length,
        0
      );
      const rightSize = (rightCourse.syllabus || []).reduce(
        (s, m) => s + (m.topics || []).length,
        0
      );

      const longerCourse = leftSize >= rightSize ? leftCourse : rightCourse;
      const shorterCourse = longerCourse === leftCourse ? rightCourse : leftCourse;

      const data = await fetchTopicImportance({
        topic: topicName,
        longerCourse: longerCourse.name,
        shorterCourse: shorterCourse.name
      });

      setDetailTopic({
        topic: topicName,
        technology,
        reason: data.reason || data.message,
        wikiUrl: data.wikiUrl || null
      });
    } catch (err) {
      console.error(err);
      setDetailTopic({
        topic: topicName,
        technology,
        reason:
          'Could not fetch external explanation right now. This topic is still very useful for real projects and interviews.',
        wikiUrl: null
      });
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Compare Two Courses
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Choose exactly two courses to see which topics are common and which
              extra topics you get in the longer course.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left: Course Selection & Comparison */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Course Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow">
            <h2 className="font-semibold text-base sm:text-lg mb-4 text-gray-900 dark:text-white">
              Select Courses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CourseSelect
                label="Course A"
                courses={activeCourses}
                value={leftId}
                onChange={setLeftId}
              />
              <CourseSelect
                label="Course B"
                courses={activeCourses}
                value={rightId}
                onChange={setRightId}
              />
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mt-4">
              <span>
                Selected: <strong className="text-gray-900 dark:text-white">{selectedCourses.length}/2</strong>
              </span>
            </div>
          </div>

          {/* Visual Components - Only show when 2 courses selected */}
          {!loading && selectedCourses.length === 2 && (
            <>
              {/* Quick Stats Overview */}
              <CourseStatsVisual courses={selectedCourses} />

              {/* Topic Coverage Chart */}
              <TopicCoverageChart
                courses={selectedCourses}
                common={comparisonData.common}
                missingModules={comparisonData.missingModules}
              />

              {/* Comparison Table */}
              {/* <ComparisonTable courses={selectedCourses} /> */}

              {/* Detailed Comparison */}
              <ComparisonVisualizer
                courses={selectedCourses}
                 studentName={user?.name}
                onExplainTopic={handleExplainTopic}
              />
            </>
          )}

          {/* Empty State */}
          {!loading && selectedCourses.length !== 2 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 sm:p-12 shadow text-center">
              <div className="max-w-md mx-auto">
                <svg
                  className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-gray-300 dark:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Ready to Compare?
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Select two courses above to see detailed comparison with visual insights,
                  coverage analysis, and missing topic recommendations.
                </p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-12 shadow text-center">
              <div className="w-12 h-12 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading courses...</p>
            </div>
          )}
        </div>

        {/* Right: Sidebar */}
        <aside className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Quick Actions
            </h3>
            <div className="flex flex-col gap-2">
              <button
                className="btn w-full"
                onClick={() => {
                  if (activeCourses.length >= 2) {
                    setLeftId(getId(activeCourses[0]));
                    setRightId(getId(activeCourses[1]));
                  }
                }}
                disabled={activeCourses.length < 2}
              >
                Compare First 2 Courses
              </button>
              <button
                className="btn-ghost w-full"
                onClick={() => {
                  setLeftId('');
                  setRightId('');
                }}
                disabled={!leftId && !rightId}
              >
                Clear Selection
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 shadow border border-indigo-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Why Compare?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Compare topics, technologies and find which course covers crucial
              skills you may miss in a shorter duration. Missing topics are
              grouped by technology so it's easy to understand the upgrade
              value.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 shadow border border-green-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Pro Tip
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Click "Why important?" on any missing topic to get AI-powered
              explanations about its real-world relevance and career impact.
            </p>
          </div>
        </aside>
      </div>

      {/* Course Detail Modal */}
      {detailTopic && (
        <CourseDetailModal
          topic={detailTopic.topic}
          technology={detailTopic.technology}
          importance={null}
          reason={detailTopic.reason}
          wikiUrl={detailTopic.wikiUrl}
          loading={aiLoading}
          onClose={() => setDetailTopic(null)}
        />
      )}
    </div>
  );
}

function CourseSelect({ label, courses, value, onChange }) {
  const [q, setQ] = useState('');
  const options = useMemo(() => {
    const lower = q.trim().toLowerCase();
    return courses.filter(
      c =>
        !lower ||
        (c.name || '').toLowerCase().includes(lower) ||
        (c.track || '').toLowerCase().includes(lower) ||
        (c.code || '').toLowerCase().includes(lower)
    );
  }, [courses, q]);

  return (
    <div>
      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
        {label}
      </label>
      <div className="space-y-2">
        <div className="relative">
          <input
            className="input w-full pl-9"
            placeholder="Search courses..."
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
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
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="input w-full"
        >
          <option value="">— Select a course —</option>
          {options.map(c => (
            <option key={getId(c)} value={getId(c)}>
              {c.name} — {c.displayDuration || c.code}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}