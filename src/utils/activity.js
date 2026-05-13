// MICH YT PROJECT - Activity Logger

import { db, auth } from '../firebase/config.js';
import { collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

export async function logActivity(type, data = {}) {
  try {
    const user = auth.currentUser;
    if (!user) return;

    const messages = {
      login: `Signed in from ${navigator.platform}`,
      note: `Saved note: "${data.title || ''}"`,
      task: `Added task: "${data.text || ''}"`,
      youtube: `Opened YouTube: ${data.page || ''}`,
      upload: `Uploaded: ${data.name || ''}`,
      settings: `Updated settings`,
    };

    await addDoc(collection(db, 'activity_logs'), {
      uid: user.uid,
      type,
      message: messages[type] || type,
      meta: data,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    // Silent fail - don't interrupt user flow for logging
    console.warn('[Activity Log]', err.message);
  }
}
