// lib/resourceBackup.js
import { compress, decompress } from './compression';
import { encrypt, decrypt } from './encryption';

class ResourceBackupService {
    constructor() {
        this.BACKUP_VERSION = '1.0';
        this.ENCRYPTION_KEY = process.env.NEXT_PUBLIC_BACKUP_ENCRYPTION_KEY;
    }

    async createBackup(resources, options = {}) {
        try {
            const backup = {
                version: this.BACKUP_VERSION,
                timestamp: new Date().toISOString(),
                metadata: {
                    totalResources: resources.reduce((sum, week) =>
                        sum + week.materials.length, 0
                    ),
                    totalWeeks: resources.length,
                    createdBy: options.userId || 'unknown',
                    description: options.description || ''
                },
                resources,
                checksum: this.generateChecksum(JSON.stringify(resources))
            };

            // Compress the backup
            const compressed = await compress(JSON.stringify(backup));

            // Encrypt if encryption is enabled
            if (options.encrypt) {
                const encrypted = await encrypt(compressed, this.ENCRYPTION_KEY);
                return {
                    data: encrypted,
                    encrypted: true,
                    checksum: backup.checksum
                };
            }

            return {
                data: compressed,
                encrypted: false,
                checksum: backup.checksum
            };
        } catch (error) {
            console.error('Failed to create backup:', error);
            throw new Error('Backup creation failed');
        }
    }

    async restoreBackup(backupData, options = {}) {
        try {
            let data = backupData.data;

            // Decrypt if encrypted
            if (backupData.encrypted) {
                data = await decrypt(data, this.ENCRYPTION_KEY);
            }

            // Decompress
            const decompressed = await decompress(data);
            const backup = JSON.parse(decompressed);

            // Validate backup
            this.validateBackup(backup);

            // Verify checksum
            if (backup.checksum !== this.generateChecksum(JSON.stringify(backup.resources))) {
                throw new Error('Backup checksum verification failed');
            }

            return {
                version: backup.version,
                metadata: backup.metadata,
                resources: backup.resources
            };
        } catch (error) {
            console.error('Failed to restore backup:', error);
            throw new Error('Backup restoration failed');
        }
    }

    async verifyBackup(backupData) {
        try {
            const backup = await this.restoreBackup(backupData, { verifyOnly: true });
            return {
                valid: true,
                metadata: backup.metadata
            };
        } catch (error) {
            return {
                valid: false,
                error: error.message
            };
        }
    }

    generateChecksum(data) {
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    validateBackup(backup) {
        if (!backup.version || !backup.resources || !backup.metadata) {
            throw new Error('Invalid backup format');
        }

        if (backup.version !== this.BACKUP_VERSION) {
            throw new Error(`Unsupported backup version: ${backup.version}`);
        }

        if (!Array.isArray(backup.resources)) {
            throw new Error('Invalid resources format in backup');
        }
    }

    async getBackupMetadata(backupData) {
        try {
            const { metadata } = await this.restoreBackup(backupData, { metadataOnly: true });
            return metadata;
        } catch (error) {
            console.error('Failed to get backup metadata:', error);
            throw new Error('Failed to read backup metadata');
        }
    }
}

export default new ResourceBackupService();