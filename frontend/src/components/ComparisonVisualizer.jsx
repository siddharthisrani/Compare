// ComparisonVisualizer.jsx - Only responsive changes, exact same logic
import React, { useMemo, useState } from 'react';
import { computeIntersectionAndMissing, buildCourseMap, topicKey } from '../utils/compare';

/**
 * Make a nicer label for a module / technology.
 * - If moduleName is "__EMPTY_x" or "Module", we build a label from first few topic names.
 */
function prettyModuleName(moduleName, topics) {
  const raw = (moduleName || '').trim();
  if (/^__empty_\d+$/i.test(raw) || /^module$/i.test(raw) || raw === '') {
    if (!topics || !topics.length) return 'Additional topics';
    const names = topics.slice(0, 3).map(t => t.name);
    return names.join(' / ');
  }
  return raw;
}

/**
 * Merge "label-only" modules (like "Adv Node JS" with just [Adv Node JS])
 * into their corresponding big __EMPTY_x module so we don't show duplicates.
 */
function mergeLabelModules(modules) {
  const result = [...modules];
  const toRemove = new Set();

  const isEmptyName = (name) => /^__empty_\d+$/i.test(name || '');

  // candidates whose moduleName is the technology label
  const candidates = result.filter(m => {
    const name = m.moduleName || '';
    if (!name || isEmptyName(name)) return false;
    const topics = m.topics || [];
    if (!topics.length || topics.length > 5) return false;
    const nameKey = topicKey(name);
    if (!nameKey) return false;

    // All topic names should be contained in moduleName text
    const allMatch = topics.every(t => nameKey.includes(topicKey(t.name || '')));
    return allMatch;
  });

  for (const labelMod of candidates) {
    const labelKey = topicKey(labelMod.moduleName || '');
    const topicsOfLabel = labelMod.topics || [];

    // find partner big module (usually __EMPTY_x) that shares at least one of the label topics
    const partnerIndex = result.findIndex(m => {
      if (m === labelMod) return false;
      if (!isEmptyName(m.moduleName)) return false;
      const topics = m.topics || [];
      return topics.some(t => topicKey(t.name || '') === labelKey || topicsOfLabel.some(l => topicKey(l.name || '') === topicKey(t.name || '')));
    });

    if (partnerIndex >= 0) {
      const partner = result[partnerIndex];
      result[partnerIndex] = {
        ...partner,
        labelOverride: labelMod.moduleName
      };
      toRemove.add(labelMod.moduleName);
    }
  }

  return result.filter(m => !toRemove.has(m.moduleName));
}

/**
 * Stable pseudo-random importance (High / Medium) so it looks varied.
 */
function decorateImportance(t) {
  const key = topicKey(t.name || '');
  let importance = t.importance || 'Medium';
  let sum = 0;
  for (let i = 0; i < key.length; i++) sum += key.charCodeAt(i);
  importance = (sum % 10) < 6 ? 'High' : 'Medium'; // ~60% High
  return { ...t, importance };
}

/**
 * ComparisonVisualizer
 * props:
 *  - courses: [courseA, courseB]
 *  - onTopicClick(topic, importance)
 */
export default function ComparisonVisualizer({ courses = [],studentName, onExplainTopic }) {
  const left = courses[0] || null;
  const right = courses[1] || null;

  const [openModule, setOpenModule] = useState(null);
  const [showAllCovered, setShowAllCovered] = useState(false);

  const { common, missingModules, mapB, longerCourse, shorterCourse } = useMemo(() => {
    if (!left || !right) return { common: [], missingModules: [], mapB: new Map(), longerCourse: null, shorterCourse: null };

    const countTopics = (c) =>
      (c.syllabus || []).reduce((sum, m) => sum + ((m.topics || []).length), 0);

    const leftSize = countTopics(left);
    const rightSize = countTopics(right);

    const shorter = leftSize <= rightSize ? left : right;
    const longer  = leftSize <= rightSize ? right : left;

    const { common, missingModules, mapB } = computeIntersectionAndMissing(shorter, longer);
    return { common, missingModules, mapB, longerCourse: longer,shorterCourse: shorter };
  }, [left, right]);

  function handleUpgradeClick() {
  if (!shorterCourse || !longerCourse) return;

  const phone = '916261437008'; // 91 + 6261437008
  const namePart = studentName && studentName.trim()
    ? studentName.trim()
    : '________';

  const fromLabel = `${shorterCourse.name || ''}${
    shorterCourse.displayDuration ? ` (${shorterCourse.displayDuration})` : ''
  }`;

  const toLabel = `${longerCourse.name || ''}${
    longerCourse.displayDuration ? ` (${longerCourse.displayDuration})` : ''
  }`;

  const text = [
    `Hello, my name is ${namePart}.`,
    '',
    `I was comparing courses on the Cybrom course comparison website and I am interested in upgrading my course.`,
    '',
    `Current course: ${fromLabel}`,
    `Upgrade to: ${toLabel}`,
    '',
    'Please share the upgrade process, fees, and the nearest upcoming batch details.',
    '',
    'Thank you.'
  ].join('\n');

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

  if (!left || !right) {
    return <div className="p-6 text-gray-500">Please select two courses to compare.</div>;
  }

  const coveredToShow = showAllCovered ? common : common.slice(0, 20);
  const coveredExtra  = common.length > 20 ? common.length - 20 : 0;

  // Clean technology/module names for covered topics using longer course modules
  const mapLonger = useMemo(() => buildCourseMap(longerCourse || {}), [longerCourse]);

  return (
    <div className="space-y-4">
      {/* header summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Comparison</h2>
            <div className="text-sm text-gray-500">
              <strong>{left.name}</strong> vs <strong>{right.name}</strong>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Covered topics: <span className="font-medium">{common.length}</span> ·
              Missing technologies: <span className="font-medium">{missingModules.length}</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 flex sm:block gap-2">
            <div className="px-2 py-1 bg-gray-50 dark:bg-gray-700 rounded">
              {left.displayDuration || left.code || ''}
            </div>
            <div className="px-2 py-1 bg-gray-50 dark:bg-gray-700 rounded">
              {right.displayDuration || right.code || ''}
            </div>
          </div>
        </div>
      </div>

      {/* Covered topics (intersection) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
        <h3 className="font-semibold mb-3">Covered topics — both courses teach these</h3>
        {common.length === 0 ? (
          <div className="text-sm text-gray-500">No overlapping topics found.</div>
        ) : (
          <>
            <div className="space-y-2">
              {coveredToShow.map(c => {
                // map modules -> prettier technology labels
                const labels = (c.modules || []).map(mName => {
                  const entry = mapLonger.get(mName);
                  const topics = entry ? Array.from(entry.topics.values()) : [];
                  return prettyModuleName(mName, topics);
                }).filter(Boolean);

                return (
                  <div
                    key={c.key}
                    className="px-3 py-2 border rounded-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                  >
                    <div className="text-sm font-medium">{c.name}</div>
                    {labels.length > 0 && (
                      <div className="text-xs text-gray-400 sm:text-right sm:ml-4">
                        {labels.join(', ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {coveredExtra > 0 && (
              <div className="mt-3 flex justify-center">
                <button
                  className="btn-ghost px-3 py-1 text-sm"
                  onClick={() => setShowAllCovered(v => !v)}
                >
                  {showAllCovered
                    ? 'Show less'
                    : `Show more (${coveredExtra} more topics)`}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Missing topics grouped by technology */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
        <h3 className="font-semibold mb-3">
          Topics only in the longer course (missing in shorter)
        </h3>

        {missingModules.length === 0 ? (
          <div className="text-sm text-gray-500">
            No extra topics — both courses cover the same things.
          </div>
        ) : (
          <div className="space-y-3">
            {mergeLabelModules(missingModules).map(m => {
              const topics = (m.topics || []).map(decorateImportance);
              const label = m.labelOverride || prettyModuleName(m.moduleName, topics);

              return (
                <div key={m.moduleName} className="border rounded">
                  {/* Technology row */}
                  <div className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gray-50 dark:bg-gray-700">
                    <div className="flex-1">
                      <div className="font-medium">{label}</div>
                      <div className="text-xs text-gray-500">
                        {topics.length} extra topic{topics.length !== 1 ? 's' : ''} in this
                        technology
                      </div>
                    </div>
                    <div className="flex justify-between gap-2">
                      <button
                        className="btn-ghost px-2 py-1"
                        onClick={() =>
                          setOpenModule(openModule === m.moduleName ? null : m.moduleName)
                        }
                      >
                        {openModule === m.moduleName ? 'Hide' : 'View'}
                      </button>
                      <button
             className="btn px-2 py-1"
                onClick={handleUpgradeClick}
                                >
                    Upgrade
                  </button>
                    </div>
                  </div>

                  {/* Topics inside this technology */}
                  {openModule === m.moduleName && (
                    <div className="p-3 bg-white dark:bg-gray-800">
                      {topics.length === 0 ? (
                        <div className="text-sm text-gray-500">
                          No detailed topics listed yet – this is a brand new technology in the longer course.
                        </div>
                      ) : (
                        <ul className="space-y-2">
                          {topics.map(t => (
                            <li key={t.key} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                              <div className="text-sm font-medium">{t.name}</div>
                              <button
                                className="btn-ghost px-2 py-1 text-xs self-start"
                                type="button"
                                onClick={() => onExplainTopic && onExplainTopic(t.name, m.moduleName)}
                              >
                                Why important? (AI)
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}