import React from 'react'
import CourseCard from './CourseCard'

export default function CourseGrid({ courses, selected, toggleSelect, onEdit, onDeactivate }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {courses.map(c => (
        <CourseCard
          key={c.id}
          course={c}
          selected={selected.includes(c.id)}
          onToggle={toggleSelect}
          onEdit={onEdit}
          onDeactivate={onDeactivate}
        />
      ))}
    </div>
  )
}
