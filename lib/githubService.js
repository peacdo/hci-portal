// lib/githubService.js

const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
const GITHUB_REPO = 'peacdo/hci-portal-resources';

export const uploadToGithub = async (file, path) => {
    try {
        const content = await fileToBase64(file);

        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Upload ${file.name}`,
                content,
                branch: 'main'
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`GitHub API Error: ${errorData.message}`);
        }

        const data = await response.json();
        return data.content.download_url;
    } catch (error) {
        console.error('GitHub upload error:', error);
        throw error;
    }
};

export const deleteFromGithub = async (path) => {
    try {
        // Get file SHA first
        const getResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!getResponse.ok) {
            throw new Error('Failed to get file info');
        }

        const fileData = await getResponse.json();

        // Delete file using SHA
        const deleteResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Delete ${path}`,
                sha: fileData.sha,
                branch: 'main'
            })
        });

        if (!deleteResponse.ok) {
            throw new Error('Failed to delete file');
        }

        return true;
    } catch (error) {
        console.error('GitHub delete error:', error);
        throw error;
    }
};

const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            let encoded = reader.result.toString().replace(/^data:(.*,)?/, '');
            resolve(encoded);
        };
        reader.onerror = error => reject(error);
    });
};

export const validateFileSize = (file) => {
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes
    return file.size <= MAX_FILE_SIZE;
};