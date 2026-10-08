import { auth } from '../config/firebase.js';

export const getAuth = () => auth;

export const verifyIdToken = async (token) => {
    return await auth.verifyIdToken(token);
};
