// TopicCoverageChart.jsx - Visual progress bar showing topic coverage
import React, { useMemo } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function TopicCoverageChart({ courses, common, missingModules }) {
  if (!courses || courses.length !== 2) return null;

  const [courseA, courseB] = courses;

  const stats = useMemo(() => {
    const totalA = (courseA.syllabus || []).reduce((sum, m) => sum + (m.topics || []).length, 0);
    const totalB = (courseB.syllabus || []).reduce((sum, m) => sum + (m.topics || []).length, 0);
    
    const commonCount = common.length;
    const missingCount = missingModules.reduce((sum, m) => sum + (m.topics || []).length, 0);
    
    const longerTotal = Math.max(totalA, totalB);
    const coveragePercent = longerTotal > 0 ? Math.round((commonCount / longerTotal) * 100) : 0;
    const missingPercent = longerTotal > 0 ? Math.round((missingCount / longerTotal) * 100) : 0;

    return {
      totalA,
      totalB,
      commonCount,
      missingCount,
      longerTotal,
      coveragePercent,
      missingPercent,
      shorterCourse: totalA <= totalB ? courseA : courseB,
      longerCourse: totalA <= totalB ? courseB : courseA
    };
  }, [courses, common, missingModules]);

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 sm:p-6 shadow-sm border border-indigo-100 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></span>
            Coverage Analysis
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
            How much of <strong>{stats.longerCourse.name}</strong> is covered by <strong>{stats.shorterCourse.name}</strong>
          </p>
        </div>
        
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-300">Covered</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-amber-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-300">Missing</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="h-12 sm:h-16 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex">
          {/* Covered portion */}
          <div
            className="bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm transition-all duration-500"
            style={{ width: `${stats.coveragePercent}%` }}
          >
            {stats.coveragePercent > 15 && (
              <span className="flex items-center gap-1">
                <CheckCircle2 size={16} />
                {stats.coveragePercent}%
              </span>
            )}
          </div>
          
          {/* Missing portion */}
          <div
            className="bg-gradient-to-r from-amber-400 to-amber-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm transition-all duration-500"
            style={{ width: `${stats.missingPercent}%` }}
          >
            {stats.missingPercent > 15 && (
              <span className="flex items-center gap-1">
                <AlertCircle size={16} />
                {stats.missingPercent}%
              </span>
            )}
          </div>
        </div>
        
        {/* Labels below bar for small percentages */}
        <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
          {stats.coveragePercent <= 15 && (
            <span className="flex items-center gap-1">
              <CheckCircle2 size={14} className="text-green-500" />
              {stats.coveragePercent}% covered
            </span>
          )}
          {stats.missingPercent <= 15 && (
            <span className="flex items-center gap-1 ml-auto">
              <AlertCircle size={14} className="text-amber-500" />
              {stats.missingPercent}% missing
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 text-center backdrop-blur-sm">
          <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
            {stats.commonCount}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Topics Covered</div>
        </div>
        
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 text-center backdrop-blur-sm">
          <div className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">
            {stats.missingCount}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Topics Missing</div>
        </div>
        
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 text-center backdrop-blur-sm">
          <div className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            {stats.totalA}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
            {courseA.name.split(' ')[0]}
          </div>
        </div>
        
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 text-center backdrop-blur-sm">
          <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
            {stats.totalB}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
            {courseB.name.split(' ')[0]}
          </div>
        </div>
      </div>

      {/* Insight Message */}
      {stats.coveragePercent < 70 && (
        <div className="mt-4 p-3 bg-amber-100 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-800 rounded-lg">
          <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200">
            <strong>💡 Learning Gap:</strong> The shorter course covers only {stats.coveragePercent}% of the longer course content. 
            Consider upgrading to gain access to {stats.missingCount} additional topics!
          </p>
        </div>
      )}
      
      {stats.coveragePercent >= 70 && stats.coveragePercent < 90 && (
        <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-800 rounded-lg">
          <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
            <strong>👍 Good Coverage:</strong> You're getting {stats.coveragePercent}% of the content! 
            {stats.missingCount > 0 && ` ${stats.missingCount} advanced topics are available in the longer course.`}
          </p>
        </div>
      )}
      
      {stats.coveragePercent >= 90 && (
        <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-800 rounded-lg">
          <p className="text-xs sm:text-sm text-green-800 dark:text-green-200">
            <strong>✅ Excellent Coverage:</strong> Both courses cover nearly identical content ({stats.coveragePercent}%)!
          </p>
        </div>
      )}
    </div>
  );
}