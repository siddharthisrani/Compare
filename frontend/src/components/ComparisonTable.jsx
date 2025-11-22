import React from 'react'

export default function ComparisonTable({ courses }) {
  const rows = [
    { label: 'Duration', accessor: c => c.displayDuration },
    { label: 'Prerequisites', accessor: c => (c.prerequisites || []).join(', ') },
    { label: 'Skills', accessor: c => (c.skills || []).join(', ') },
    { label: 'Tools', accessor: c => (c.tools || []).join(', ') },
    { label: 'Projects', accessor: c => String(c.projects_count || 0) },
    { label: 'Internship', accessor: c => (c.includes_internship ? 'Yes' : 'No') },
    { label: 'Placement', accessor: c => (c.includes_placement ? 'Yes' : 'No') },
  ]

  const uniqueSkills = courses.map((c, i) => {
    const others = courses.filter((_, idx) => idx !== i).flatMap(x => x.skills || [])
    return (c.skills || []).filter(s => !others.includes(s))
  })

  return (
    <div className="overflow-auto bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left text-xs text-gray-500 border-b">
            <th className="p-2">Feature</th>
            {courses.map(c => <th key={c.id} className="p-2">{c.name}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.label} className="align-top border-b">
              <td className="p-2 font-medium text-sm w-48">{r.label}</td>
              {courses.map(c => <td key={c.id} className="p-2 text-sm">{r.accessor(c)}</td>)}
            </tr>
          ))}

          <tr className="align-top">
            <td className="p-2 font-medium text-sm">Unique skills you would miss</td>
            {uniqueSkills.map((u, idx) => <td key={idx} className="p-2 text-sm">{u.length ? u.join(', ') : '—'}</td>)}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
