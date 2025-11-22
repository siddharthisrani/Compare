import React from "react";

export default function CourseCard({
  course,
  selected,
  onToggle,
  onEdit,
  onDeactivate,
}) {
  return (
    <article className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition">
      {/* Top Section */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{course.name}</h3>
          <div className="text-xs text-gray-500">
            {course.track} • {course.displayDuration} • {course.level}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {course.projects_count || 0} projects
          </div>
          <div className="flex gap-1">
            <button
              className="btn-ghost px-2 py-1 text-xs rounded"
              onClick={() => onEdit(course)}
            >
              Edit
            </button>
            <button
              className="btn-ghost px-2 py-1 text-xs rounded"
              onClick={() => onDeactivate(course.id)}
            >
              Deactivate
            </button>
          </div>
        </div>
      </div>

      {/* Skills + Tools */}
      <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
        <div>
          <strong>Skills:</strong>{" "}
          {course.skills?.slice(0, 4).join(", ")}
          {course.skills?.length > 4 ? "..." : ""}
        </div>
        <div className="mt-2">
          <strong>Tools:</strong> {course.tools?.join(", ")}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="mt-4 flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggle(course.id)}
          />
          <span className="text-sm">Compare</span>
        </label>

        <a
          className="text-sm text-indigo-500 hover:underline"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            alert("Course detail coming soon!");
          }}
        >
          View
        </a>
      </div>
    </article>
  );
}