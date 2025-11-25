// CourseStatsVisual.jsx - Add visual comparison metrics
import React from 'react';
import { Award, BookOpen, Briefcase, Clock, Code, TrendingUp } from 'lucide-react';

export default function CourseStatsVisual({ courses }) {
  if (!courses || courses.length !== 2) return null;

  const [courseA, courseB] = courses;

  // Calculate stats
  const getTopicCount = (course) => {
    return (course.syllabus || []).reduce((sum, m) => sum + (m.topics || []).length, 0);
  };

  // Helper to check if duration is > 5 months
const hasPlacement = (course) => {
  if (course.includes_placement) return true;
  const duration = course.displayDuration || '';
  const match = duration.match(/(\d+)/);
  if (match) {
    const months = parseInt(match[1]);
    return months >= 5;
  }
  return false;
};

// Helper to check if duration has '+' (internship)
const hasInternship = (course) => {
  if (course.includes_internship) return true;
  const duration = course.displayDuration || '';
  return duration.includes('+');
};

  const stats = [
    {
      icon: BookOpen,
      label: 'Total Topics',
      valueA: getTopicCount(courseA),
      valueB: getTopicCount(courseB),
      color: 'blue'
    },
    {
      icon: Code,
      label: 'Technologies',
      valueA: (courseA.syllabus || []).length,
      valueB: (courseB.syllabus || []).length,
      color: 'purple'
    },
    {
      icon: Briefcase,
      label: 'Projects',
      valueA: courseA.projects_count || 3,
      valueB: courseB.projects_count || 3,
      color: 'green'
    },
    {
      icon: Clock,
      label: 'Duration',
      valueA: courseA.displayDuration || '—',
      valueB: courseB.displayDuration || '—',
      color: 'orange',
      isText: true
    },
    {
      icon: Award,
      label: 'Placement Support',
      valueA:  hasPlacement(courseA) ? 'Yes' : 'No', 
      valueB:  hasPlacement(courseB) ? 'Yes' : 'No',
      color: 'indigo',
      isText: true
    },
    {
      icon: TrendingUp,
      label: 'Internship',
      valueA: hasInternship(courseA) ? 'Yes' : 'No',  // ← now dynamic
      valueB: hasInternship(courseB) ? 'Yes' : 'No',  // ← now dynamic
      color: 'pink',
      isText: true
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    pink: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
      <h3 className="font-semibold text-base sm:text-lg mb-4 text-gray-900 dark:text-white">
        Quick Comparison Overview
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          const colorClass = colorClasses[stat.color];
          
          // Determine winner for numeric values
          let winner = null;
          if (!stat.isText) {
            if (stat.valueA > stat.valueB) winner = 'A';
            else if (stat.valueB > stat.valueA) winner = 'B';
          }

          return (
            <div
              key={idx}
              className={`border rounded-lg p-4 ${colorClass} transition-all hover:shadow-md`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon size={20} className="flex-shrink-0" />
                <span className="text-sm font-medium">{stat.label}</span>
              </div>
              
              <div className="space-y-2">
                {/* Course A */}
                <div className={`flex items-center justify-between p-2 rounded ${winner === 'A' ? 'bg-white/50 dark:bg-gray-700/50 ring-2 ring-current' : 'bg-white/30 dark:bg-gray-700/30'}`}>
                  <span className="text-xs truncate mr-2">{courseA.name}</span>
                  <span className="font-bold text-sm">{stat.valueA}</span>
                </div>
                
                {/* Course B */}
                <div className={`flex items-center justify-between p-2 rounded ${winner === 'B' ? 'bg-white/50 dark:bg-gray-700/50 ring-2 ring-current' : 'bg-white/30 dark:bg-gray-700/30'}`}>
                  <span className="text-xs truncate mr-2">{courseB.name}</span>
                  <span className="font-bold text-sm">{stat.valueB}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}