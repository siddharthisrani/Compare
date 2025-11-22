import React from 'react'


export default function Hero(){
return (
<div className="bg-gradient-to-r from-white/60 to-indigo-50 dark:from-transparent dark:to-gray-800 border border-gray-100 dark:border-gray-800 rounded-lg p-6 shadow-sm">
<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
<div>
<h1 className="text-2xl md:text-3xl font-bold">Smart course comparison for institutes</h1>
<p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Let students compare syllabi, skills, projects and career outcomes — updated dynamically by trainers.</p>
<div className="mt-4 flex gap-2">
<button className="btn">Get started</button>
<button className="btn-ghost px-3 py-2 rounded">Watch demo</button>
</div>
</div>
<div className="hidden md:block w-56">
<div className="bg-white dark:bg-gray-900 rounded-lg p-3 shadow">
<div className="text-xs text-gray-500 mb-2">Quick stats</div>
<div className="grid grid-cols-3 gap-2">
<div className="text-center"><div className="text-lg font-semibold">+20</div><div className="text-xs text-gray-500">Courses</div></div>
<div className="text-center"><div className="text-lg font-semibold">7</div><div className="text-xs text-gray-500">Tracks</div></div>
<div className="text-center"><div className="text-lg font-semibold">40+</div><div className="text-xs text-gray-500">Projects</div></div>
</div>
</div>
</div>
</div>
</div>
)
}