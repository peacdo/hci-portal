// lib/progressSyncService.js
import { db, auth } from './firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

class ProgressSyncService {
    constructor() {
        this.pendingSyncs = new Map();
    }

    async syncProgress(userId, progress) {
        if (!userId || !auth.currentUser) {
            console.log('No user ID or user not authenticated, skipping sync');
            this.saveToLocalStorage(null, null, progress);
            return;
        }

        try {
            const userProgressRef = doc(db, 'userProgress', userId);
            await setDoc(userProgressRef, {
                progress,
                lastUpdated: new Date().toISOString(),
                userId
            }, { merge: true });

            // Backup to localStorage
            this.saveToLocalStorage(null, null, progress, userId);
        } catch (error) {
            console.error('Failed to sync progress:', error);
            this.saveToLocalStorage(null, null, progress, userId);
            this.pendingSyncs.set(userId, progress);
            throw error;
        }
    }

    async loadProgress(userId) {
        if (!userId || !auth.currentUser) {
            console.log('No user ID or user not authenticated, loading from localStorage only');
            return this.loadFromLocalStorage();
        }

        try {
            const userProgressRef = doc(db, 'userProgress', userId);
            const progressDoc = await getDoc(userProgressRef);

            if (progressDoc.exists()) {
                const progress = progressDoc.data().progress || {};
                this.saveToLocalStorage(null, null, progress, userId);
                return progress;
            }

            // If no Firebase document exists, try localStorage
            const localProgress = this.loadFromLocalStorage(userId);
            
            // If we have local progress, sync it to Firebase
            if (Object.keys(localProgress).length > 0) {
                await this.syncProgress(userId, localProgress);
            }
            
            return localProgress;
        } catch (error) {
            console.error('Failed to load progress from Firebase:', error);
            return this.loadFromLocalStorage(userId);
        }
    }

    loadFromLocalStorage(userId = null) {
        try {
            if (userId) {
                const userProgress = localStorage.getItem(`progress_${userId}`);
                if (userProgress) {
                    return JSON.parse(userProgress);
                }
            }

            const generalProgress = localStorage.getItem('courseProgress');
            return generalProgress ? JSON.parse(generalProgress) : {};
        } catch (error) {
            console.error('Failed to load progress from localStorage:', error);
            return {};
        }
    }

    async updateMaterialProgress(userId, weekId, materialId, completed) {
        if (!userId || !auth.currentUser) {
            console.log('No user ID or user not authenticated, saving to localStorage only');
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

            this.saveToLocalStorage(weekId, materialId, completed, userId);
        } catch (error) {
            console.error('Failed to update material progress:', error);
            this.saveToLocalStorage(weekId, materialId, completed, userId);
            throw error;
        }
    }

    saveToLocalStorage(weekId, materialId, progress, userId = null) {
        try {
            let storageProgress = {};

            // If we're saving a specific material's progress
            if (weekId && materialId) {
                const key = `${weekId}-${materialId}`;
                if (userId) {
                    const existing = localStorage.getItem(`progress_${userId}`);
                    storageProgress = existing ? JSON.parse(existing) : {};
                    storageProgress[key] = progress;
                } else {
                    const existing = localStorage.getItem('courseProgress');
                    storageProgress = existing ? JSON.parse(existing) : {};
                    storageProgress[key] = progress;
                }
            } else {
                // If we're saving the entire progress object
                storageProgress = progress;
            }

            if (userId) {
                localStorage.setItem(`progress_${userId}`, JSON.stringify(storageProgress));
            }
            localStorage.setItem('courseProgress', JSON.stringify(storageProgress));
        } catch (error) {
            console.error('Failed to save progress to localStorage:', error);
        }
    }

    async retryFailedSyncs(userId) {
        if (!userId || !auth.currentUser || !this.pendingSyncs.has(userId)) return;

        try {
            const progress = this.pendingSyncs.get(userId);
            await this.syncProgress(userId, progress);
            this.pendingSyncs.delete(userId);
        } catch (error) {
            console.error('Failed to retry sync:', error);
        }
    }
}

export default new ProgressSyncService();