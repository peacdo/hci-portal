class ErrorHandlingService {
    constructor() {
        this.errorLogQueue = [];
        this.isProcessing = false;
        this.MAX_RETRIES = 3;
        this.RETRY_DELAY = 1000; // 1 second
    }

    async logError(error) {
        try {
            const enhancedError = this.enhanceError(error);
            await this.queueError(enhancedError);
            await this.processErrorQueue();
        } catch (err) {
            console.error('Failed to log error:', err);
            // Store locally if remote logging fails
            this.storeErrorLocally(error);
        }
    }

    enhanceError(error) {
        return {
            ...error,
            environment: process.env.NODE_ENV,
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
            timestamp: new Date().toISOString(),
            url: typeof window !== 'undefined' ? window.location.href : null
        };
    }

    async queueError(error) {
        this.errorLogQueue.push({
            error,
            retries: 0,
            timestamp: Date.now()
        });
    }

    async processErrorQueue() {
        if (this.isProcessing || this.errorLogQueue.length === 0) return;

        this.isProcessing = true;

        try {
            while (this.errorLogQueue.length > 0) {
                const errorItem = this.errorLogQueue[0];

                try {
                    await this.sendErrorToServer(errorItem.error);
                    this.errorLogQueue.shift(); // Remove successfully processed error
                } catch (err) {
                    if (errorItem.retries < this.MAX_RETRIES) {
                        errorItem.retries++;
                        await this.delay(this.RETRY_DELAY * errorItem.retries);
                    } else {
                        this.storeErrorLocally(errorItem.error);
                        this.errorLogQueue.shift();
                    }
                }
            }
        } finally {
            this.isProcessing = false;
        }
    }

    async sendErrorToServer(error) {
        // TODO: Implement actual error reporting to your backend/service
        await fetch('/api/log-error', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(error)
        });
    }

    storeErrorLocally(error) {
        try {
            const storedErrors = JSON.parse(localStorage.getItem('errorLog') || '[]');
            storedErrors.push({
                ...error,
                storedAt: new Date().toISOString()
            });
            localStorage.setItem('errorLog', JSON.stringify(storedErrors));
        } catch (err) {
            console.error('Failed to store error locally:', err);
        }
    }

    async syncStoredErrors() {
        try {
            const storedErrors = JSON.parse(localStorage.getItem('errorLog') || '[]');
            if (storedErrors.length === 0) return;

            const successfullySync = [];

            for (let error of storedErrors) {
                try {
                    await this.sendErrorToServer(error);
                    successfullySync.push(error);
                } catch (err) {
                    console.error('Failed to sync stored error:', err);
                }
            }

            // Remove successfully synced errors
            const remainingErrors = storedErrors.filter(
                error => !successfullySync.includes(error)
            );
            localStorage.setItem('errorLog', JSON.stringify(remainingErrors));
        } catch (err) {
            console.error('Failed to sync stored errors:', err);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export default new ErrorHandlingService();