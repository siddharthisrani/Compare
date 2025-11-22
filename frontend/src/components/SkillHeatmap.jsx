import React from 'react'

export default function SkillHeatmap({ courses = [] }) {
  const skills = Array.from(new Set(courses.flatMap(c => c.skills || []))).slice(0, 20)
  const topCourses = courses.slice(0, 6)
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <h4 className="font-semibold">Skill Heatmap</h4>
      <p className="text-sm text-gray-500">Quick glance which course covers which skills</p>
      <div className="mt-3 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left p-2">Skill</th>
              {topCourses.map(c => <th key={c.id} className="p-2 text-left">{c.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {skills.map(skill => (
              <tr key={skill} className="border-t">
                <td className="p-2 font-medium">{skill}</td>
                {topCourses.map(c => (
                  <td key={c.id} className="p-2">
                    {c.skills?.includes(skill)
                      ? <span className="inline-block px-2 py-1 text-xs rounded-full bg-indigo-100 dark:bg-indigo-700">Yes</span>
                      : <span className="text-gray-400">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
