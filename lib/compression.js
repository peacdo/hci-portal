import pako from 'pako';

export const compress = async (data) => {
    try {
        const compressed = pako.deflate(data);
        return Buffer.from(compressed).toString('base64');
    } catch (error) {
        console.error('Compression failed:', error);
        throw new Error('Failed to compress data');
    }
};

export const decompress = async (data) => {
    try {
        const buffer = Buffer.from(data, 'base64');
        const decompressed = pako.inflate(buffer);
        return new TextDecoder().decode(decompressed);
    } catch (error) {
        console.error('Decompression failed:', error);
        throw new Error('Failed to decompress data');
    }
};