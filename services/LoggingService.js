class LoggingService {
    constructor() {
        this.currentSessionId = null;
        this.sessionStartTime = null;
        this.activityBuffer = [];
        this.BUFFER_SIZE = 10;
        this.FLUSH_INTERVAL = 30000; // 30 seconds
        this.flushInterval = null;
    }

    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getCurrentSessionId() {
        return this.currentSessionId;
    }

    startSession(userId) {
        this.currentSessionId = this.generateSessionId();
        this.sessionStartTime = Date.now();

        // Start periodic flushing of activity buffer
        this.flushInterval = setInterval(() => {
            this.flushActivityBuffer();
        }, this.FLUSH_INTERVAL);

        // Log session start
        this.logActivity({
            type: 'session_start',
            userId,
            sessionId: this.currentSessionId,
            timestamp: new Date().toISOString()
        });
    }

    endSession() {
        if (this.currentSessionId) {
            // Log session end
            this.logActivity({
                type: 'session_end',
                sessionId: this.currentSessionId,
                duration: Date.now() - this.sessionStartTime,
                timestamp: new Date().toISOString()
            });

            // Flush any remaining activities
            this.flushActivityBuffer(true);

            // Clear session data
            clearInterval(this.flushInterval);
            this.currentSessionId = null;
            this.sessionStartTime = null;
        }
    }

    async logActivity(activity) {
        // Add to buffer
        this.activityBuffer.push(activity);

        // Flush if buffer is full
        if (this.activityBuffer.length >= this.BUFFER_SIZE) {
            await this.flushActivityBuffer();
        }

        // Store locally for offline support
        this.storeActivityLocally(activity);
    }

    async flushActivityBuffer(force = false) {
        if (this.activityBuffer.length === 0) return;

        try {
            // Clone and clear buffer
            const activities = [...this.activityBuffer];
            this.activityBuffer = [];

            // Send to server
            await this.sendActivitiesToServer(activities);

            // Remove from local storage if successful
            activities.forEach(activity => {
                this.removeActivityFromLocalStorage(activity);
            });
        } catch (error) {
            console.error('Failed to flush activity buffer:', error);

            if (!force) {
                // Put activities back in buffer if not force flushing
                this.activityBuffer.unshift(...activities);
            }
        }
    }

    async sendActivitiesToServer(activities) {
        // TODO: Implement actual API call to your backend
        await fetch('/api/log-activities', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(activities)
        });
    }

    storeActivityLocally(activity) {
        try {
            const storedActivities = JSON.parse(localStorage.getItem('activityLog') || '[]');
            storedActivities.push(activity);
            localStorage.setItem('activityLog', JSON.stringify(storedActivities));
        } catch (error) {
            console.error('Failed to store activity locally:', error);
        }
    }

    removeActivityFromLocalStorage(activity) {
        try {
            const storedActivities = JSON.parse(localStorage.getItem('activityLog') || '[]');
            const updatedActivities = storedActivities.filter(a =>
                a.timestamp !== activity.timestamp || a.type !== activity.type
            );
            localStorage.setItem('activityLog', JSON.stringify(updatedActivities));
        } catch (error) {
            console.error('Failed to remove activity from local storage:', error);
        }
    }

    getSessionStats() {
        if (!this.currentSessionId) return null;

        const duration = Date.now() - this.sessionStartTime;
        const storedActivities = JSON.parse(localStorage.getItem('activityLog') || '[]');
        const sessionActivities = storedActivities.filter(
            activity => activity.sessionId === this.currentSessionId
        );

        return {
            sessionId: this.currentSessionId,
            duration,
            activityCount: sessionActivities.length,
            startTime: new Date(this.sessionStartTime).toISOString(),
            activities: sessionActivities
        };
    }
}

export default new LoggingService();