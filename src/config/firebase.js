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

let serviceAccount = null;

if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/^"(.*)"$/, '$1')
    };
} else {
    // Fallback to local JSON file for local development if env vars are missing
    const localKeyPath = path.join(__dirname, '..', 'firebaseadmin.json');
    try {
        if (fs.existsSync(localKeyPath)) {
            serviceAccount = JSON.parse(fs.readFileSync(localKeyPath, 'utf8'));
        }
    } catch (error) {
        console.error('Error reading Firebase Service Account:', error.message);
    }
}

if (serviceAccount) {
    initializeApp({
        credential: cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.projectId || serviceAccount.project_id}.appspot.com`
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
