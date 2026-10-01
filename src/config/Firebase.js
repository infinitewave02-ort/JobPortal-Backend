import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Attempt to read from the local file first, then fall back to env var
let serviceAccount = null;
const localKeyPath = path.join(__dirname, '..', 'firebaseadmin.json');

try {
    if (fs.existsSync(localKeyPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(localKeyPath, 'utf8'));
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT && !process.env.FIREBASE_SERVICE_ACCOUNT.includes('Your-Private-Key')) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    }
} catch (error) {
    console.error('Error reading Firebase Service Account:', error.message);
}

if (serviceAccount) {
    initializeApp({
        credential: cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`
    });
} else {
    // Fallback for default credentials (e.g., deployed environment)
    initializeApp({
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
}

export const db = getFirestore();
export const auth = getAuth();
export const storage = getStorage();
export { FieldValue };
export default { db, auth, storage, FieldValue };
