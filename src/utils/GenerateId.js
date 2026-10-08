import { db } from '../config/firebase.js';

export const generateFirestoreId = (collectionName) => {
    return db.collection(collectionName).doc().id;
};
