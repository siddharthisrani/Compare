// HomeHeroSection.jsx - Attractive hero section for home page
import React from 'react';
import { ArrowRight, Sparkles, TrendingUp, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomeHeroSection() {
  return (
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl p-6 sm:p-8 lg:p-12 shadow-xl border border-indigo-100 dark:border-gray-700 overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-pink-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          {/* Left Content */}
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-xs sm:text-sm font-medium text-indigo-600 dark:text-indigo-400">
              <Sparkles size={16} />
              Smart Course Comparison Platform
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
              Find Your Perfect
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Learning Path
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
              Compare courses side-by-side, discover what you'll learn, and identify missing topics. 
              Make informed decisions about your education with AI-powered insights.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                to="/compare"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all hover:shadow-xl hover:scale-105"
              >
                Start Comparing
                <ArrowRight size={20} />
              </Link>
              
              <button
                onClick={() => document.getElementById('courses-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg shadow border border-gray-200 dark:border-gray-700 transition-all"
              >
                Browse Courses
              </button>
            </div>
          </div>

          {/* Right Content - Stats Grid */}
          <div className="grid grid-cols-2 gap-4 lg:w-80">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-700/20 shadow-lg">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                <Target size={20} />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                100%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Topic Coverage Analysis
              </div>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-700/20 shadow-lg">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
                <TrendingUp size={20} />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                AI
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Powered Insights
              </div>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-700/20 shadow-lg">
              <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400 mb-2">
                <Sparkles size={20} />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Smart
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Visual Comparisons
              </div>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-700/20 shadow-lg">
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Free
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Always Free to Use
              </div>
            </div>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="mt-8 flex flex-wrap gap-2">
          {['Side-by-side Comparison', 'Topic Coverage', 'Missing Skills', 'AI Explanations', 'Export Reports'].map((feature) => (
            <div
              key={feature}
              className="px-3 py-1.5 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 border border-white/20 dark:border-gray-700/20"
            >
              {feature}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}