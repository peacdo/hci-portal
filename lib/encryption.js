// lib/encryption.js
import { AES, enc } from 'crypto-js';

export const encrypt = async (data, key) => {
    try {
        const encrypted = AES.encrypt(data, key).toString();
        return encrypted;
    } catch (error) {
        console.error('Encryption failed:', error);
        throw new Error('Failed to encrypt data');
    }
};

export const decrypt = async (data, key) => {
    try {
        const decrypted = AES.decrypt(data, key).toString(enc.Utf8);
        if (!decrypted) {
            throw new Error('Decryption failed - invalid key or corrupted data');
        }
        return decrypted;
    } catch (error) {
        console.error('Decryption failed:', error);
        throw new Error('Failed to decrypt data');
    }
};

export const generateEncryptionKey = () => {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
};

export const validateEncryptionKey = (key) => {
    return /^[a-f0-9]{64}$/i.test(key);
};