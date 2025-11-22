// frontend/src/components/AdminModal.jsx
import React, { useEffect, useState } from 'react';
import { importCsv } from '../api/courses';

export default function AdminModal({ initial, onClose, onSave }) {
  const isEdit = !!initial;

  const [form, setForm] = useState({
    name: '',
    code: '',
    displayDuration: ''
  });

  const [saving, setSaving] = useState(false);

  // CSV replace state
  const [csvFile, setCsvFile] = useState(null);
  const [csvStatus, setCsvStatus] = useState(null);
  const [uploadingCsv, setUploadingCsv] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || '',
        code: initial.code || '',
        displayDuration: initial.displayDuration || ''
      });
    }
  }, [initial]);

  function updateField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ ...(initial || {}), ...form });
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleCsvReplace() {
    if (!isEdit) {
      setCsvStatus('Save the course first, then replace syllabus.');
      return;
    }
    if (!csvFile) {
      setCsvStatus('Choose a CSV file first.');
      return;
    }
    setUploadingCsv(true);
    setCsvStatus('Uploading & replacing syllabus…');

    try {
      const fd = new FormData();
      fd.append('file', csvFile);
      const code = form.code || initial.code;
      await importCsv(fd, code, { replace: true });
      setCsvStatus('Syllabus replaced successfully.');
    } catch (err) {
      console.error(err);
      setCsvStatus(
        err.response?.data?.message ||
        err.message ||
        'Failed to replace syllabus.'
      );
    } finally {
      setUploadingCsv(false);
      setTimeout(() => setCsvStatus(null), 4000);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {isEdit ? 'Edit course' : 'Create new course'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 3 simple fields only */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500">Course name</label>
            <input
              className="input w-full"
              value={form.name}
              onChange={e => updateField('name', e.target.value)}
              placeholder="Full Stack MERN 5+1"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500">Course code</label>
            <input
              className="input w-full"
              value={form.code}
              onChange={e => updateField('code', e.target.value)}
              placeholder="FSDM5"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500">Duration display</label>
            <input
              className="input w-full"
              value={form.displayDuration}
              onChange={e => updateField('displayDuration', e.target.value)}
              placeholder="5+1"
            />
          </div>

          {/* CSV replace block – only visible when editing */}
          {isEdit && (
            <div className="mt-4 border-t pt-4 space-y-2">
              <div className="text-sm font-semibold">
                Replace syllabus from CSV
              </div>
              <p className="text-xs text-gray-500">
                Upload the updated syllabus CSV exported from the faculty sheet.
                This will <strong>replace</strong> existing topics for this course.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".csv"
                  onChange={e => setCsvFile(e.target.files?.[0] || null)}
                />
                <button
                  type="button"
                  className="btn text-xs"
                  onClick={handleCsvReplace}
                  disabled={uploadingCsv}
                >
                  {uploadingCsv ? 'Replacing…' : 'Replace syllabus'}
                </button>
              </div>
              {csvStatus && (
                <div className="text-xs text-gray-600">{csvStatus}</div>
              )}
            </div>
          )}

          {/* buttons */}
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
              disabled={saving}
            >
              Cancel
            </button>
            <button className="btn" type="submit" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
