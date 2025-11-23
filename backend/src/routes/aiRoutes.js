// backend/src/routes/aiRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const axios = require('axios');

const router = express.Router();

/**
 * Clean topic → better search query.
 */
function buildSearchQuery(topic) {
  return String(topic || '')
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\+\-]/g, ' ')
    .trim();
}

/**
 * Call Wikipedia:
 * 1) search the topic
 * 2) get first result
 * 3) fetch summary + URL
 */
async function fetchWikipediaInfo(topic) {
  const query = buildSearchQuery(topic);
  if (!query) return null;

  // search
  const searchUrl = 'https://en.wikipedia.org/w/api.php';
  const searchParams = {
    action: 'query',
    list: 'search',
    srsearch: query,
    format: 'json',
    srlimit: 1,
    origin: '*'
  };

  const searchRes = await axios.get(searchUrl, { params: searchParams });
  const searchResults = searchRes.data?.query?.search || [];
  if (!searchResults.length) return null;

  const title = searchResults[0].title;
  const encodedTitle = encodeURIComponent(title);

  // summary
  const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodedTitle}`;
  const summaryRes = await axios.get(summaryUrl);
  const extract = summaryRes.data?.extract || '';

  if (!extract) return null;

  // keep first 3–4 sentences for a "bigger" explanation
  const sentences = extract.split('. ');
  const short = sentences.slice(0, 4).join('. ').trim();
  const summary = short.endsWith('.') ? short : short + '.';

  const pageUrl = `https://en.wikipedia.org/wiki/${encodedTitle}`;

  return { summary, url: pageUrl };
}

/**
 * Local fallback explanation – always returns something.
 */
function generateLocalImportance(topic, longerCourse, shorterCourse) {
  const raw = topic || '';
  const t = raw.toLowerCase().trim();

  const courseLine = (longerCourse && shorterCourse)
    ? `It is an extra advantage you get in ${longerCourse} compared to ${shorterCourse}.`
    : `It helps you go beyond the very basic course coverage.`;

  if (t.includes('async') || t.includes('await') || t.includes('promise')) {
    return `${raw} teaches you how to handle asynchronous work in JavaScript (API calls, timers, database operations). This avoids "callback hell" and is used in almost every real project. ${courseLine}`;
  }

  if (t.includes('api') || t.includes('rest') || t.includes('http')) {
    return `${raw} is important for understanding how frontend and backend talk to each other using APIs. This is core for full-stack development and is very common in MERN job roles. ${courseLine}`;
  }

  if (t.includes('git') || t.includes('github')) {
    return `${raw} is used for version control and collaboration in almost every software company. It lets you track changes, work in teams and manage code safely. ${courseLine}`;
  }

  if (t.includes('scrum') || t.includes('agile')) {
    return `${raw} explains how software teams work in real life using Agile/Scrum. It helps you fit better into company processes and work effectively with your team. ${courseLine}`;
  }

  if (t.includes('react')) {
    return `${raw} is part of React, a very popular frontend library. It helps you build modern, interactive interfaces and appears in many frontend/MERN job descriptions. ${courseLine}`;
  }

  if (t.includes('node') || t.includes('express')) {
    return `${raw} helps you build backend APIs with Node and Express. It is what makes you a real full-stack developer who can handle both client and server. ${courseLine}`;
  }

  if (t.includes('mongodb') || t.includes('database') || t.includes('sql')) {
    return `${raw} is related to databases, which power almost all real applications. It helps you store, manage and query user data correctly, which is asked a lot in interviews. ${courseLine}`;
  }

  if (t.includes('html')) {
    return `${raw} strengthens your HTML structure, which is the foundation of every web page. Good HTML improves SEO, accessibility and cross-browser behaviour. ${courseLine}`;
  }

  if (t.includes('css')) {
    return `${raw} helps you build clean, responsive layouts and professional-looking UIs. Good CSS is essential to make your projects look like real products. ${courseLine}`;
  }

  if (t.includes('figma') || t.includes('ui') || t.includes('ux') || t.includes('wireframe')) {
    return `${raw} gives you UI/UX and design thinking skills. It helps you create screens that are not only technically correct but also easy and pleasant for users. ${courseLine}`;
  }

  if (t.includes('data structure') || t.includes('algorithm')) {
    return `${raw} improves your logic and problem-solving skills. It is a classic area for technical interviews and helps you write more efficient code. ${courseLine}`;
  }

  return `"${raw}" deepens your practical understanding of the subject. It helps you move from just theoretical knowledge to skills that you can apply in real projects and interviews. ${courseLine}`;
}

// POST /api/ai/topic-importance
router.post(
  '/topic-importance',
  body('topic').isString().notEmpty(),
  body('longerCourse').optional().isString(),
  body('shorterCourse').optional().isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: 'Invalid input', errors: errors.array() });
    }

    const { topic, longerCourse, shorterCourse } = req.body;

    try {
      let wikiInfo = null;

      try {
        wikiInfo = await fetchWikipediaInfo(topic);
      } catch (e) {
        console.error('Wikipedia fetch failed, falling back to local text:', e.message);
      }

      const reason =
        wikiInfo?.summary || generateLocalImportance(topic, longerCourse, shorterCourse);

      return res.json({
        topic,
        reason,
        wikiUrl: wikiInfo?.url || null
      });
    } catch (err) {
      console.error('topic-importance route error', err);
      const reason = generateLocalImportance(topic, longerCourse, shorterCourse);
      return res.status(500).json({
        message: 'Explanation service error',
        reason,
        wikiUrl: null
      });
    }
  }
);

module.exports = router;
