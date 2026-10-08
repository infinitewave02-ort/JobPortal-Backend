import express from 'express';
import { db } from '../config/firebase.js';

const router = express.Router();

router.get('/firestore-test', async (req, res) => {
    try {
        // Attempt to write a test document
        const docRef = db.collection('test_connection').doc('test');
        await docRef.set({
            connected: true,
            timestamp: new Date().toISOString()
        });

        // Attempt to read the test document
        const doc = await docRef.get();
        if (doc.exists) {
            res.status(200).json({
                success: true,
                message: "Successfully connected to Firestore!",
                data: doc.data()
            });
        } else {
            res.status(500).json({
                success: false,
                message: "Connected, but could not read the test document."
            });
        }
    } catch (error) {
        console.error("Firestore connection error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to connect to Firestore",
            error: error.message
        });
    }
});

export default router;
