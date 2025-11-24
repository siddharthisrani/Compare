// frontend/src/pages/Compare.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { fetchCourses } from '../api/courses';
import { fetchTopicImportance } from '../api/ai';
import ComparisonVisualizer from '../components/ComparisonVisualizer';
import CourseDetailModal from '../components/CourseDetailModal';
import CourseStatsVisual from '../components/CourseStatsVisual';
import TopicCoverageChart from '../components/TopicCoverageChart';


const getId = c => c?.id || c?._id;

export default function Compare() {
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

  // 👇 now receives technology / module name as 2nd argument
  async function handleExplainTopic(topicName, technology) {
    if (!leftCourse || !rightCourse) return;

    setAiLoading(true);
    setDetailTopic({ topic: topicName, technology, reason: null, wikiUrl: null });

    try {
      // pick "longer" course by number of topics (same logic as before)
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
    <div className="space-y-6">
      <header className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Compare two courses</h1>
          <p className="text-sm text-gray-500">
            Choose exactly two courses to see which topics are common and which
            extra topics you get in the longer course.
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="space-y-4">
            {/* two slots only */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span>
                Selected: <strong>{selectedCourses.length}/2</strong>
              </span>
            </div>

            <div className="mt-3">
              {!loading && selectedCourses.length === 2 ? (
                <ComparisonVisualizer
                  courses={selectedCourses}
                  onExplainTopic={handleExplainTopic}
                />
              ) : (
                <div className="p-8 text-center text-gray-500">
                  Pick two active courses above to start comparison.
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <h3 className="font-semibold">Quick actions</h3>
            <div className="mt-3 flex flex-col gap-2">
              <button
                className="btn"
                onClick={() => {
                  if (activeCourses.length >= 2) {
                    setLeftId(getId(activeCourses[0]));
                    setRightId(getId(activeCourses[1]));
                  }
                }}
              >
                Compare first 2 active courses
              </button>
              <button
                className="btn-ghost"
                onClick={() => {
                  setLeftId('');
                  setRightId('');
                }}
              >
                Clear selection
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <h3 className="font-semibold">Why compare?</h3>
            <p className="text-sm text-gray-500 mt-2">
              Compare topics, technologies and find which course covers crucial
              skills you may miss in a shorter duration. Missing topics are
              grouped by technology so it’s easy to understand the upgrade
              value.
            </p>
          </div>
        </aside>
      </section>

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
      <label className="text-xs text-gray-500">{label}</label>
      <div className="mt-1">
        <input
          className="input w-full mb-2"
          placeholder="Search courses..."
          value={q}
          onChange={e => setQ(e.target.value)}
        />
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="input w-full"
        >
          <option value="">— select course —</option>
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
