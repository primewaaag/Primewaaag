import { Handler } from '@netlify/functions';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Helper to decode JWT payload safely
function getEmailFromToken(headers: any): string | null {
  const authHeader = headers.authorization || headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    const payloadPart = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(payloadPart, 'base64').toString('utf-8'));
    return payload.email || null;
  } catch (e) {
    return null;
  }
}

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Auth check
  const email = getEmailFromToken(event.headers);
  if (!email || email.toLowerCase() !== 'marc.aeschbach@icloud.com') {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ error: 'Access Denied. Admins only.' }),
    };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};

    // 1. ADD NEW VIDEO (POST)
    if (event.httpMethod === 'POST') {
      const { id, title, thumbnail, url, order } = body;
      if (!id || !title || !thumbnail || !url) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID, Title, Thumbnail, and Link (URL) are required.' }),
        };
      }

      // Limit validation
      const videosCol = collection(db, 'videos');
      const snapshot = await getDocs(query(videosCol));
      if (snapshot.size >= 3) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Validation Error: A maximum of 3 videos can be featured, but you are trying to add a 4th video.' }),
        };
      }

      const docRef = doc(db, 'videos', id);
      await setDoc(docRef, {
        title,
        thumbnail,
        url,
        order: typeof order === 'number' ? order : 0,
        adminSecret: firebaseConfig.apiKey || null,
      });

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ message: 'Video added successfully.', id }),
      };
    }

    // 2. UPDATE VIDEO (PUT)
    if (event.httpMethod === 'PUT') {
      const { id, title, thumbnail, url, order } = body;
      if (!id || !title || !thumbnail || !url) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID, Title, Thumbnail, and Link (URL) are required.' }),
        };
      }

      const docRef = doc(db, 'videos', id);
      await updateDoc(docRef, {
        title,
        thumbnail,
        url,
        order: typeof order === 'number' ? order : 0,
        adminSecret: firebaseConfig.apiKey || null,
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Video updated successfully.', id }),
      };
    }

    // 3. DELETE VIDEO (DELETE)
    if (event.httpMethod === 'DELETE') {
      const { id } = body;
      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID is required to delete.' }),
        };
      }

      const docRef = doc(db, 'videos', id);
      await deleteDoc(docRef);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Video deleted successfully.', id }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };

  } catch (error: any) {
    console.error('manage-videos error:', error);
    let msg = error.message || 'Internal Server Error';
    if (msg.includes('permission') || msg.includes('Permission') || msg.includes('insufficient')) {
      msg = 'Firebase Firestore Permission Error: Please update database Security Rules in Firebase Console to allow write.';
    }
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: msg }),
    };
  }
};
