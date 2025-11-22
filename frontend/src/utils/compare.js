// src/utils/compare.js
// Normalization, splitting and comparison helpers used by ComparisonVisualizer

// list of tokens/words to ignore (empty noise)
const BASE_IGNORE_TOKENS = new Set([
  '', '-', '—', 'na', 'n/a', 'none', 'nil', 'null',
  'sunday','monday','tuesday','wednesday','thursday','friday','saturday',
  'day', 'week', 'hours'
]);

export function normalizeTopic(raw) {
  if (raw === undefined || raw === null) return '';
  let s = String(raw).trim();

  // remove common bullets/leading punctuation
  s = s.replace(/^[\-\u2022\*]+\s*/, '').trim();

  // collapse whitespace
  s = s.replace(/\s+/g, ' ');

  // strip trailing punctuation
  s = s.replace(/^[\.,:;]+|[ \.,:;]+$/g, '').trim();

  return s;
}

// create de-duplication key
export function topicKey(s) {
  const n = normalizeTopic(s).toLowerCase().replace(/[^\w\s]/g, '');
  return n.replace(/\s+/g, ' ').trim();
}

// build an ignore set that also includes the course name
function makeIgnoreSetForCourse(course) {
  const set = new Set(BASE_IGNORE_TOKENS);
  const courseKey = topicKey(course?.name || '');
  if (courseKey) set.add(courseKey); // ignore “full stack mern 5 1”, etc.
  return set;
}

// split cell content into multiple topics intelligently
export function splitTopics(cell) {
  if (cell === undefined || cell === null) return [];
  const raw = String(cell).trim();
  if (!raw) return [];

  // prefer newline splits
  if (raw.includes('\n')) {
    return raw.split(/\r?\n/).map(normalizeTopic).filter(Boolean);
  }
  // semicolon or pipe
  if (raw.includes(';') || raw.includes('|')) {
    return raw.split(/[;|]/).map(normalizeTopic).filter(Boolean);
  }
  // comma heuristics: split by comma into items
  if (raw.includes(',')) {
    const parts = raw
      .split(',')
      .map(normalizeTopic)
      .map(p => p.replace(/^["']|["']$/g, '').trim())
      .filter(Boolean);
    return parts;
  }
  // otherwise single topic
  const single = normalizeTopic(raw);
  return single ? [single] : [];
}

// Build moduleName -> { topics: Map<key,{name,importance}> }
export function buildCourseMap(course) {
  const map = new Map();
  if (!course || !Array.isArray(course.syllabus)) return map;

  const ignoreKeys = makeIgnoreSetForCourse(course);

  for (const m of course.syllabus) {
    const moduleName = (m.moduleName || 'Module').trim();
    if (!moduleName) continue;

    let entry = map.get(moduleName);
    if (!entry) {
      entry = { topics: new Map() };
      map.set(moduleName, entry);
    }

    const topicsArr = Array.isArray(m.topics) ? m.topics : [];

    for (const t of topicsArr) {
      const parts = splitTopics(t.name || '');
      const importance = t.importance || 'Medium';

      for (const p of parts) {
        const key = topicKey(p);
        if (!key) continue;

        // ignore noise tokens and pure numbers ("1", "10"...)
        if (ignoreKeys.has(key)) continue;
        if (/^\d+$/.test(key)) continue;

        if (!entry.topics.has(key)) {
          entry.topics.set(key, { name: p, importance });
        }
      }
    }
  }
  return map;
}

/**
 * Compute:
 * - common: [{ key, name, modules: [moduleName...] }]  (intersection)
 * - missingModules: [{ moduleName, topics: [{key,name,importance}] }]
 *
 * We treat courseB as "longer" (extra topics) and courseA as "shorter".
 */
export function computeIntersectionAndMissing(courseA, courseB) {
  const mapA = buildCourseMap(courseA);
  const mapB = buildCourseMap(courseB);
  const ignoreKeysB = makeIgnoreSetForCourse(courseB);

  // build flat maps: key -> { name, modules: Set }
  const flatA = new Map();
  for (const [moduleName, entry] of mapA.entries()) {
    for (const [k, v] of entry.topics.entries()) {
      const o = flatA.get(k) || { name: v.name, modules: new Set() };
      o.modules.add(moduleName);
      flatA.set(k, o);
    }
  }

  const flatB = new Map();
  for (const [moduleName, entry] of mapB.entries()) {
    for (const [k, v] of entry.topics.entries()) {
      const o = flatB.get(k) || { name: v.name, modules: new Set() };
      o.modules.add(moduleName);
      flatB.set(k, o);
    }
  }

  // intersection (common topics)
  const common = [];
  for (const [k, aObj] of flatA.entries()) {
    if (flatB.has(k)) {
      const bObj = flatB.get(k);
      const modules = Array.from(new Set([...aObj.modules, ...bObj.modules]));
      common.push({ key: k, name: aObj.name || bObj.name, modules });
    }
  }

  // missing: topics present in B but not in A, grouped by module from B
  const missingByModule = new Map();
  for (const [moduleName, entry] of mapB.entries()) {
    for (const [k, v] of entry.topics.entries()) {
      if (!flatA.has(k)) {
        const arr = missingByModule.get(moduleName) || [];
        arr.push({
          key: k,
          name: v.name,
          importance: v.importance || 'Medium'
        });
        missingByModule.set(moduleName, arr);
      }
    }
  }

  // Also include modules from B that have NO topics (e.g. FIGMA row)
  const moduleNamesA = new Set(
    (courseA?.syllabus || [])
      .map(m => (m.moduleName || '').trim())
      .filter(Boolean)
  );

  for (const m of courseB?.syllabus || []) {
    const name = (m.moduleName || '').trim();
    if (!name) continue;
    if (missingByModule.has(name)) continue;
    if (moduleNamesA.has(name)) continue;

    const topicsArr = Array.isArray(m.topics) ? m.topics : [];
    const collected = [];

    for (const t of topicsArr) {
      const parts = splitTopics(t.name || '');
      for (const p of parts) {
        const key = topicKey(p);
        if (!key) continue;
        if (ignoreKeysB.has(key)) continue;
        if (/^\d+$/.test(key)) continue;
        if (!collected.some(c => c.key === key)) {
          collected.push({ key, name: p, importance: t.importance || 'Medium' });
        }
      }
    }

    // even if collected is empty, we still want a technology row
    missingByModule.set(name, collected);
  }

  // Sort common alphabetically
  common.sort((x, y) => x.name.localeCompare(y.name));

  // Build missingModules array and sort by size
  const missingModules = Array.from(missingByModule.entries())
    .map(([moduleName, topics]) => ({
      moduleName,
      topics: topics.sort((a, b) => a.name.localeCompare(b.name))
    }))
    .sort((a, b) => b.topics.length - a.topics.length || a.moduleName.localeCompare(b.moduleName));

  return { common, missingModules, mapB };
}
