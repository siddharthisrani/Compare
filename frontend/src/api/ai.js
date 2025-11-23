// frontend/src/api/ai.js
import client from './client';

export async function fetchTopicImportance({ topic, longerCourse, shorterCourse }) {
  const res = await client.post('/ai/topic-importance', {
    topic,
    longerCourse,
    shorterCourse
  });
  return res.data; // { topic, reason }
}
