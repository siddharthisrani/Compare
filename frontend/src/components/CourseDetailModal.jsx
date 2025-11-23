// src/components/CourseDetailModal.jsx
import React from 'react';

export default function CourseDetailModal({
  topic,
  technology,
  importance,
  reason,
  wikiUrl,
  loading,
  onClose
}) {
  const topicText = topic || '';

  // if comparator passed technology/module use that,
  // otherwise try to guess from topic text
  const techMatch =
    technology ||
    (topicText.match(
      /React|Node\.?js?|MongoDB|SQL|JavaScript|JS|HTML|CSS|Redux|Git|Figma|Scrum|Axios|API/i
    ) || [])[0] ||
    '';

  const googleQuery = `${topicText} ${techMatch} web development`.trim();
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(
    googleQuery
  )}`;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold break-words">{topic}</h2>
            {techMatch && (
              <div className="text-xs text-gray-500 mt-1">
                Technology / Module:{' '}
                <span className="font-medium">{techMatch}</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {importance && (
          <div className="text-xs text-gray-500 mb-2">
            Importance level: <strong>{importance}</strong>
          </div>
        )}

        <div className="text-sm text-gray-700 dark:text-gray-200 min-h-[60px]">
          {loading && (
            <div className="text-gray-500 text-sm">
              Generating explanation…
            </div>
          )}
          {!loading && reason && <p>{reason}</p>}
          {!loading && !reason && (
            <p>
              This topic helps you build stronger, job-ready skills in real
              projects.
            </p>
          )}
        </div>

        {/* External link: Wikipedia if we have a direct article, else Google */}
        {!loading && (
          <a
            href={wikiUrl || googleUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center mt-4 text-sm text-indigo-600 hover:underline"
          >
            {wikiUrl ? 'Read more on Wikipedia →' : 'Search full details on Google →'}
          </a>
        )}
      </div>
    </div>
  );
}
