// EnhancedCourseCard.jsx - More attractive course card with stats
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Code, Briefcase, Download, ArrowRight, Award, TrendingUp } from 'lucide-react';

export default function EnhancedCourseCard({ course, onDownload }) {
  const getId = c => c?.id || c?._id;
  
  const topicCount = (course.syllabus || []).reduce(
    (sum, m) => sum + (m.topics || []).length, 
    0
  );
  
  const techCount = (course.syllabus || []).length;

  return (
    <article className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="text-xs uppercase tracking-wide text-indigo-100 font-semibold mb-1">
              {course.track || 'Course'}
            </div>
            <h2 className="font-bold text-white text-lg leading-tight line-clamp-2">
              {course.name}
            </h2>
          </div>
          {course.includes_placement && (
            <div className="ml-2 p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
              <Award size={18} className="text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 rounded">
              <Code size={14} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Topics</div>
              <div className="font-bold text-sm text-gray-900 dark:text-white">{topicCount}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="p-1.5 bg-purple-100 dark:bg-purple-900/40 rounded">
              <TrendingUp size={14} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Techs</div>
              <div className="font-bold text-sm text-gray-900 dark:text-white">{techCount}</div>
            </div>
          </div>

          {course.projects_count > 0 && (
            <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="p-1.5 bg-green-100 dark:bg-green-900/40 rounded">
                <Briefcase size={14} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Projects</div>
                <div className="font-bold text-sm text-gray-900 dark:text-white">{course.projects_count}</div>
              </div>
            </div>
          )}

          {course.displayDuration && (
            <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="p-1.5 bg-orange-100 dark:bg-orange-900/40 rounded">
                <Clock size={14} className="text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Duration</div>
                <div className="font-bold text-sm text-gray-900 dark:text-white">{course.displayDuration}</div>
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {course.code && (
            <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium">
              {course.code}
            </span>
          )}
          {course.includes_internship && (
            <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium">
              Internship
            </span>
          )}
          {course.includes_placement && (
            <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium">
              Placement
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
            <span>
              Updated: {course.lastUpdated ? new Date(course.lastUpdated).toLocaleDateString() : '—'}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors"
              onClick={() => onDownload(getId(course))}
            >
              <Download size={16} />
              <span className="hidden sm:inline">Download</span>
            </button>
            <Link
              to="/compare"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-all group-hover:shadow-lg"
            >
              Compare
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}