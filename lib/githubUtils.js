// lib/githubUtils.js
import { getResources, updateResources as updateLocalResources } from './githubResourceService';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Reexport the getResources function from our local service
export const getResourcesData = getResources;

// Helper function to convert file to base64
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Remove the data URL prefix and get only the base64 string
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = (error) => reject(error);
    });
};

// Upload resource to GitHub
export async function uploadResource(file, weekId, { onProgress, metadata = {} } = {}) {
    try {
        // Convert file to base64
        onProgress?.(10); // Start progress
        const content = await fileToBase64(file);
        onProgress?.(30); // Base64 conversion complete

        // Generate a clean filename (remove special characters and spaces)
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const path = `resources/week${weekId}/${Date.now()}-${cleanFileName}`;

        // Upload to GitHub
        const response = await fetch(`https://api.github.com/repos/${process.env.NEXT_PUBLIC_GITHUB_REPO}/contents/${path}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Upload resource: ${cleanFileName}`,
                content,
                branch: 'main'
            })
        });

        onProgress?.(70); // GitHub upload complete

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`GitHub API Error: ${errorData.message}`);
        }

        const data = await response.json();
        
        // Create resource metadata with proper URLs
        const downloadUrl = data.content.download_url;
        const viewUrl = downloadUrl; // For most files, view and download URLs are the same
        
        const resourceMetadata = {
            id: Date.now().toString(),
            weekId: parseInt(weekId),
            title: metadata.title || file.name,
            description: metadata.description || '',
            type: metadata.type || getFileType(file),
            url: viewUrl,
            downloadUrl: downloadUrl,
            path: path,
            size: file.size,
            createdAt: new Date().toISOString(),
            views: 0,
            downloads: 0
        };

        // Get current resources and update
        const currentResources = await getResources() || [];
        
        // Add the new resource to the list
        currentResources.push(resourceMetadata);
        
        // Update resources.json with the new list
        await updateLocalResources(currentResources);

        onProgress?.(100); // Process complete

        return {
            id: resourceMetadata.id,
            downloadUrl: downloadUrl,
            url: viewUrl,
            path: path
        };
    } catch (error) {
        console.error('Upload resource error:', error);
        throw error;
    }
}

// Helper function to determine file type
function getFileType(file) {
    if (file.type.includes('pdf')) return 'PDF';
    if (file.type.includes('video')) return 'VIDEO';
    if (file.type.includes('text') || file.type.includes('javascript') || file.type.includes('json')) return 'CODE';
    return 'DOCUMENT';
}

export async function deleteResource(path) {
    console.log('Mock delete resource:', path);
    return true;
}

export async function updateResourcesJson(newContent) {
    return updateLocalResources(newContent);
}

export const getGithubCommits = async (path) => {
    console.log('Mock get commits:', path);
    return [{
        sha: 'mock-sha',
        commit: {
            message: 'Mock commit',
            author: {
                date: new Date().toISOString()
            }
        }
    }];
};

export const createGithubCommit = async (path, content, message) => {
    console.log('Mock create commit:', { path, content, message });
    return true;
};

export const compareGithubVersions = async (path, base, head) => {
    console.log('Mock compare versions:', { path, base, head });
    return {
        files: [],
        commits: []
    };
};

export const getGithubFileContent = async (path, ref = null) => {
    console.log('Mock get file content:', { path, ref });
    return null;
};

export const getGithubDownloadUrl = (url) => {
    return url;
};

export async function getGitHubFile(path) {
    try {
        const response = await fetch(`https://api.github.com/repos/${process.env.NEXT_PUBLIC_GITHUB_REPO}/contents/${path}`, {
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`GitHub API Error: ${errorData.message}`);
        }

        const data = await response.json();
        if (!data.content) return null;

        const content = Buffer.from(data.content, 'base64').toString('utf8');
        return JSON.parse(content);
    } catch (error) {
        if (error.message.includes('404')) {
            return null;
        }
        console.error('Error getting GitHub file:', error);
        throw error;
    }
}

export async function updateGitHubFile(path, content, retryCount = 3) {
    try {
        // First, try to get the current file to get its SHA
        const currentFileResponse = await fetch(`https://api.github.com/repos/${process.env.NEXT_PUBLIC_GITHUB_REPO}/contents/${path}`, {
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        let sha;
        if (currentFileResponse.ok) {
            const currentFile = await currentFileResponse.json();
            sha = currentFile.sha;
        }

        // Convert content to base64
        const contentString = JSON.stringify(content, null, 2);
        const contentBase64 = Buffer.from(contentString).toString('base64');

        // Prepare the request body
        const body = {
            message: `Update ${path}`,
            content: contentBase64,
            branch: 'main'
        };

        // Include SHA if file exists (for updating)
        if (sha) {
            body.sha = sha;
        }

        // Make the PUT request
        const response = await fetch(`https://api.github.com/repos/${process.env.NEXT_PUBLIC_GITHUB_REPO}/contents/${path}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            
            // If we get a conflict and have retries left, try again
            if (errorData.message && errorData.message.includes('is at') && retryCount > 0) {
                console.log(`Retrying update for ${path}, ${retryCount} attempts remaining`);
                // Wait a short time before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
                return updateGitHubFile(path, content, retryCount - 1);
            }
            
            throw new Error(`GitHub API Error: ${errorData.message}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating GitHub file:', error);
        throw error;
    }
}