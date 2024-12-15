// lib/resourceValidation.js
class ResourceValidationService {
    constructor() {
        this.MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
        this.ALLOWED_TYPES = {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        };
        this.VIRUS_SCAN_API_KEY = process.env.NEXT_PUBLIC_VIRUS_SCAN_API_KEY;
    }

    async validateFile(file) {
        const validations = await Promise.all([
            this.validateFileSize(file),
            this.validateFileType(file),
            this.validateFileContent(file),
            this.validateFileName(file),
            this.scanForMalware(file)
        ]);

        const errors = validations.filter(v => !v.valid);
        return {
            valid: errors.length === 0,
            errors: errors.map(e => e.error)
        };
    }

    async validateFileSize(file) {
        return {
            valid: file.size <= this.MAX_FILE_SIZE,
            error: file.size > this.MAX_FILE_SIZE
                ? `File size exceeds maximum limit of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`
                : null
        };
    }

    async validateFileType(file) {
        const isValidType = Object.keys(this.ALLOWED_TYPES).includes(file.type);
        const extension = `.${file.name.split('.').pop().toLowerCase()}`;
        const isValidExtension = isValidType &&
            this.ALLOWED_TYPES[file.type].includes(extension);

        return {
            valid: isValidType && isValidExtension,
            error: !isValidType
                ? 'Invalid file type'
                : !isValidExtension
                    ? 'File extension does not match type'
                    : null
        };
    }

    async validateFileContent(file) {
        try {
            // Read first few bytes to validate file signature
            const buffer = await this.readFileHeader(file);
            const isValid = this.validateFileSignature(buffer, file.type);

            return {
                valid: isValid,
                error: !isValid ? 'File content does not match declared type' : null
            };
        } catch (error) {
            return {
                valid: false,
                error: 'Failed to validate file content'
            };
        }
    }

    async validateFileName(file) {
        const validNameRegex = /^[a-zA-Z0-9-_\s.]+$/;
        const isValid = validNameRegex.test(file.name);

        return {
            valid: isValid,
            error: !isValid ? 'Invalid characters in filename' : null
        };
    }

    async scanForMalware(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('https://api.virustotal.com/v3/files', {
                method: 'POST',
                headers: {
                    'x-apikey': this.VIRUS_SCAN_API_KEY
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Virus scan failed');
            }

            const result = await response.json();
            const isClean = result.data.attributes.stats.malicious === 0;

            return {
                valid: isClean,
                error: !isClean ? 'File contains malicious content' : null
            };
        } catch (error) {
            console.error('Malware scan failed:', error);
            return {
                valid: false,
                error: 'Failed to complete security scan'
            };
        }
    }

    async readFileHeader(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(new Uint8Array(reader.result));
            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(file.slice(0, 4100));
        });
    }

    validateFileSignature(buffer, type) {
        const signatures = {
            'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                [0x50, 0x4B, 0x03, 0x04] // DOCX (ZIP)
        };

        const signature = signatures[type];
        if (!signature) return false;

        return signature.every((byte, index) => buffer[index] === byte);
    }

    async validateMetadata(metadata) {
        const requiredFields = ['title', 'type', 'weekId'];
        const missingFields = requiredFields.filter(field => !metadata[field]);

        if (missingFields.length > 0) {
            return {
                valid: false,
                error: `Missing required fields: ${missingFields.join(', ')}`
            };
        }

        return { valid: true };
    }

    sanitizeFileName(fileName) {
        // Remove unsafe characters and potential path traversal
        return fileName
            .replace(/[^a-zA-Z0-9-_\s.]/g, '')
            .replace(/\.{2,}/g, '.')
            .trim();
    }
}

export default new ResourceValidationService();