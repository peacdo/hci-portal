// lib/progressSyncService.js
import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

class ProgressSyncService {
    constructor() {
        this.pendingSyncs = new Map();
    }

    async syncProgress(userId, progress) {
        if (!userId) {
            console.log('No user ID provided, skipping sync');
            return;
        }

        try {
            const userProgressRef = doc(db, 'userProgress', userId);
            await setDoc(userProgressRef, {
                progress,
                lastUpdated: new Date().toISOString(),
                userId // Include userId in the document for extra validation
            }, { merge: true });
        } catch (error) {
            console.error('Failed to sync progress:', error);
            // Store in localStorage as backup
            localStorage.setItem(`progress_${userId}`, JSON.stringify(progress));
            // Store failed sync attempt for retry
            this.pendingSyncs.set(userId, progress);
            throw error; // Propagate error for handling in the context
        }
    }

    async loadProgress(userId) {
        if (!userId) {
            console.log('No user ID provided, loading from localStorage only');
            return this.loadFromLocalStorage();
        }

        try {
            // First try to load from Firebase
            const userProgressRef = doc(db, 'userProgress', userId);
            const progressDoc = await getDoc(userProgressRef);

            if (progressDoc.exists()) {
                // Save to localStorage as backup
                localStorage.setItem(`progress_${userId}`, JSON.stringify(progressDoc.data().progress || {}));
                return progressDoc.data().progress || {};
            }

            // If no Firebase document exists, try localStorage
            return this.loadFromLocalStorage(userId);
        } catch (error) {
            console.error('Failed to load progress from Firebase:', error);
            // Fallback to localStorage
            return this.loadFromLocalStorage(userId);
        }
    }

    loadFromLocalStorage(userId = null) {
        try {
            // Try user-specific progress first
            if (userId) {
                const userProgress = localStorage.getItem(`progress_${userId}`);
                if (userProgress) {
                    return JSON.parse(userProgress);
                }
            }

            // Fall back to general progress
            const generalProgress = localStorage.getItem('courseProgress');
            return generalProgress ? JSON.parse(generalProgress) : {};
        } catch (error) {
            console.error('Failed to load progress from localStorage:', error);
            return {};
        }
    }

    async retryFailedSyncs(userId) {
        if (!userId || !this.pendingSyncs.has(userId)) return;

        try {
            const progress = this.pendingSyncs.get(userId);
            await this.syncProgress(userId, progress);
            this.pendingSyncs.delete(userId);
        } catch (error) {
            console.error('Failed to retry sync:', error);
        }
    }

    async updateMaterialProgress(userId, weekId, materialId, completed) {
        if (!userId) {
            console.log('No user ID provided, saving to localStorage only');
            this.saveToLocalStorage(weekId, materialId, completed);
            return;
        }

        try {
            const userProgressRef = doc(db, 'userProgress', userId);
            const key = `${weekId}-${materialId}`;

            await updateDoc(userProgressRef, {
                [`progress.${key}`]: completed,
                lastUpdated: new Date().toISOString()
            });

            // Backup to localStorage
            this.saveToLocalStorage(weekId, materialId, completed, userId);
        } catch (error) {
            console.error('Failed to update material progress:', error);
            // Fallback to localStorage
            this.saveToLocalStorage(weekId, materialId, completed, userId);
            throw error;
        }
    }

    saveToLocalStorage(weekId, materialId, completed, userId = null) {
        try {
            const key = `${weekId}-${materialId}`;
            let progress = {};

            // Try to load existing progress
            if (userId) {
                const existingProgress = localStorage.getItem(`progress_${userId}`);
                if (existingProgress) {
                    progress = JSON.parse(existingProgress);
                }
            } else {
                const existingProgress = localStorage.getItem('courseProgress');
                if (existingProgress) {
                    progress = JSON.parse(existingProgress);
                }
            }

            // Update progress
            progress[key] = completed;

            // Save back to localStorage
            if (userId) {
                localStorage.setItem(`progress_${userId}`, JSON.stringify(progress));
            }
            localStorage.setItem('courseProgress', JSON.stringify(progress));
        } catch (error) {
            console.error('Failed to save progress to localStorage:', error);
        }
    }
}

export default new ProgressSyncService();