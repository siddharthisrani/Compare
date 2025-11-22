import React, { useState } from 'react';
import client from '../api/client';
import { importCsv } from '../api/courses';

export default function AdminCsvUploader() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);

   async function upload() {
    if (!file) return alert('Choose a CSV file first');
    const fd = new FormData();
    fd.append('file', file);
    setStatus('Uploading...');
    try {
      const res = await importCsv(fd, selectedCourseCode || '');
      setStatus('Imported: ' + (res.created || 0) + ' created, ' + (res.updated || 0) + ' updated');
      if (typeof onImported === 'function') onImported(res);
    } catch (err) {
      console.error(err);
      setStatus('Failed: ' + (err.response?.data?.message || err.message));
    }
  }

  return (
    <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded shadow">
      <h4 className="font-semibold">Upload syllabus (CSV)</h4>
      <p className="text-sm text-gray-500">CSV can be wide (modules = columns) or long (one topic per row). If your CSV doesn't include course code, select the course first.</p>
      <div className="mt-3 flex gap-2 items-center">
        <input type="file" accept=".csv" onChange={e => setFile(e.target.files?.[0] || null)} />
        <button className="btn" onClick={upload}>Upload</button>
      </div>
      {status && <div className="mt-2 text-sm text-gray-500">{status}</div>}
    </div>
  );
}
