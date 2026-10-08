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

// 1️⃣ Primary: Full JSON string in FIREBASE_SERVICE_ACCOUNT (used in .env and Render)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        const raw = process.env.FIREBASE_SERVICE_ACCOUNT
            .trim()
            .replace(/^'|'$/g, '')  // strip surrounding single quotes
            .replace(/^"|"$/g, ''); // strip surrounding double quotes
        serviceAccount = JSON.parse(raw);
        // Ensure the private key has real newlines
        if (serviceAccount.private_key) {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }
    } catch (err) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', err.message);
    }
}

// 2️⃣ Fallback: Individual env vars (FIREBASE_PROJECT_ID, etc.)
if (!serviceAccount && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY
            .replace(/\\n/g, '\n')
            .replace(/"/g, '')
    };
}

// 3️⃣ Fallback: Local service account JSON file (local dev only)
if (!serviceAccount) {
    const localKeyPath = path.join(__dirname, '..', 'firebaseadmin.json');
    try {
        if (fs.existsSync(localKeyPath)) {
            serviceAccount = JSON.parse(fs.readFileSync(localKeyPath, 'utf8'));
        }
    } catch (error) {
        console.error('Error reading local Firebase Service Account file:', error.message);
    }
}

if (!serviceAccount) {
    if (process.env.K_SERVICE || process.env.FUNCTIONS_EMULATOR || process.env.FUNCTIONS_WORKER_ID) {
        console.log('Running in Firebase Functions environment, using default credentials');
        initializeApp({
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${process.env.GCLOUD_PROJECT || 'job-portal-vijay'}.firebasestorage.app`
        });
    } else {
        console.error('❌ No Firebase credentials found. Set FIREBASE_SERVICE_ACCOUNT or individual FIREBASE_* env vars.');
        process.exit(1);
    }
} else {
    initializeApp({
        credential: cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET ||
            `${serviceAccount.project_id || serviceAccount.projectId}.firebasestorage.app`
    });
}

export const db = getFirestore();
export const auth = getAuth();
export const storage = getStorage();
export { FieldValue };
export default { db, auth, storage, FieldValue };
