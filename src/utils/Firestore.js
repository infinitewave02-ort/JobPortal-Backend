import { db } from '../config/firebase.js';

export const getCollection = (collectionName) => db.collection(collectionName);

export const getDocument = (collectionName, docId) => db.collection(collectionName).doc(docId);

export const createBatch = () => db.batch();
