import React from 'react';

/**
 * Minimal modal to show topic importance, description and CTA to upgrade
 */
export default function CourseDetailModal({ topic, importance, onClose }) {
  // simple importance description
  const importanceExplainer = {
    High: 'This topic is critical for real-world job tasks and interviews.',
    Medium: 'This topic helps you be more productive and build intermediate projects.',
    Low: 'This topic is optional but useful for specific tasks.'
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-2xl w-full overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold">{topic}</h2>
              <div className="mt-1 text-sm text-gray-500">Importance: <strong>{importance}</strong></div>
            </div>
            <button className="text-gray-400 hover:text-gray-600" onClick={onClose}>✕</button>
          </div>

          <div className="mt-4 text-sm text-gray-700 dark:text-gray-200">
            <p>{importanceExplainer[importance] || importanceExplainer['Medium']}</p>
            <p className="mt-3">Why this matters: employers ask about it in interviews, or it shortens development time when building production-ready apps.</p>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <a href="/contact" className="btn">Upgrade your course / Add months</a>
            <button className="btn-ghost" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
