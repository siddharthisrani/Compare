// src/api/courses.js
// Axios-based course API for frontend.
// Uses the shared client in src/api/client.js (make sure that exists)

import client from './client';


const getId = c => c?.id || c?._id;
/** Public: list courses (optionally search q) */
export async function fetchCourses() {
  const res = await client.get('/courses');
  return res.data || [];
}

/** Public: get one course */
export async function getCourse(id) {
  const res = await client.get(`/courses/${id}`);
  return res.data;
}

/** Protected: create course */
export async function createCourse(payload) {
  const res = await client.post('/courses', payload);
  return res.data;
}

/** Protected: update course */
export async function updateCourse(id, payload) {
  const res = await client.put(`/courses/${id}`, payload);
  return res.data;
}

/** Protected: deactivate (soft-delete) */
export async function deactivateCourse(id) {
  const res = await client.delete(`/courses/${id}`);
  return res.data;
}

// general CSV import; options.replace => ?replace=1
export async function importCsv(formData, code, options = {}) {
  const params = [];
  if (code) params.push(`code=${encodeURIComponent(code)}`);
  if (options.replace) params.push('replace=1');
  const qs = params.length ? `?${params.join('&')}` : '';
  const res = await client.post(`/imports/courses/csv${qs}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}
/* -------------------------
 * Backwards-compatible helpers
 * ------------------------*/

/**
 * createOrUpdateCourse(payload)
 * - If payload.id exists -> calls updateCourse(payload.id, payload)
 * - Otherwise -> calls createCourse(payload)
 */
export async function createOrUpdateCourse(course) {
  const id = getId(course);
  if (id) {
    const res = await client.put(`/courses/${id}`, course);
    return res.data;
  }
  const res = await client.post('/courses', course);
  return res.data;
}

// 🔁 toggle active via full update helper
export async function toggleCourseActive(course) {
  const id = getId(course);
  if (!id) throw new Error('Course id required');
  const payload = { ...course, isActive: !course.isActive };
  const res = await client.put(`/courses/${id}`, payload);
  return res.data;
}
/** Backwards-compatible alias for deactivateCourse */
export async function deleteCourse(id) {
  return deactivateCourse(id);
}
