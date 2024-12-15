// lib/githubUtils.js
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
const GITHUB_REPO = 'peacdo/hci-portal-resources';

export async function getResourcesData() {
    try {
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_REPO}/contents/resources.json`,
            {
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3.raw'
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch resources');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching resources:', error);
        throw error;
    }
}

export async function uploadResource(file, weekId, metadata) {
    try {
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const path = `week${weekId}/${Date.now()}-${sanitizedFileName}`;

        const content = await fileToBase64(file);

        const uploadResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`,
            {
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
            }
        );

        if (!uploadResponse.ok) {
            throw new Error('Failed to upload file');
        }

        const uploadData = await uploadResponse.json();
        const downloadUrl = uploadData.content.download_url;

        // Update resources.json
        const resources = await getResourcesData();
        let week = resources.find(w => w.week.toString() === weekId.toString());

        if (!week) {
            week = {
                week: parseInt(weekId),
                title: `Week ${weekId}`,
                keywords: [],
                materials: []
            };
            resources.push(week);
        }

        week.materials.push({
            ...metadata,
            viewLink: downloadUrl,
            downloadLink: downloadUrl,
            path
        });

        await updateResourcesJson(resources);

        return { downloadUrl, path };
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
}

export async function deleteResource(path) {
    try {
        // Get file SHA
        const getResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`,
            {
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        if (!getResponse.ok) {
            throw new Error('Failed to get file info');
        }

        const fileData = await getResponse.json();

        // Delete file
        const deleteResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`,
            {
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
            }
        );

        if (!deleteResponse.ok) {
            throw new Error('Failed to delete file');
        }

        // Update resources.json
        const resources = await getResourcesData();
        resources.forEach(week => {
            week.materials = week.materials.filter(material =>
                material.path !== path
            );
        });

        // Remove empty weeks
        const updatedResources = resources.filter(week => week.materials.length > 0);

        await updateResourcesJson(updatedResources);

        return true;
    } catch (error) {
        console.error('Delete error:', error);
        throw error;
    }
}

// Add export to the function
export async function updateResourcesJson(newContent) {
    try {
        // Get current file SHA
        const currentFile = await fetch(
            `https://api.github.com/repos/${GITHUB_REPO}/contents/resources.json`,
            {
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        const fileData = await currentFile.json();

        // Update file
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_REPO}/contents/resources.json`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'Update resources.json',
                    content: Buffer.from(JSON.stringify(newContent, null, 2)).toString('base64'),
                    sha: fileData.sha,
                    branch: 'main'
                })
            }
        );

        if (!response.ok) {
            throw new Error('Failed to update resources.json');
        }

        return true;
    } catch (error) {
        console.error('Error updating resources.json:', error);
        throw error;
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            let encoded = reader.result.toString().replace(/^data:(.*,)?/, '');
            resolve(encoded);
        };
        reader.onerror = error => reject(error);
    });
}

export const getGithubCommits = async (path, options = {}) => {
    try {
        const url = `https://api.github.com/repos/${GITHUB_REPO}/commits?path=${path}`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch commits');
        }

        const commits = await response.json();
        return commits;
    } catch (error) {
        console.error('Error fetching commits:', error);
        throw error;
    }
};

export const createGithubCommit = async (path, content, message, parentSha = null) => {
    try {
        // First get the current file to get its SHA
        const currentFile = await fetch(
            `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`,
            {
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        const fileData = await currentFile.json();

        // Create the commit
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    content: content ? Buffer.from(content).toString('base64') : fileData.content,
                    sha: fileData.sha,
                    branch: 'main',
                    ...(parentSha && { parents: [parentSha] })
                })
            }
        );

        if (!response.ok) {
            throw new Error('Failed to create commit');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating commit:', error);
        throw error;
    }
};

export const compareGithubVersions = async (path, base, head) => {
    try {
        const url = `https://api.github.com/repos/${GITHUB_REPO}/compare/${base}...${head}`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to compare versions');
        }

        return await response.json();
    } catch (error) {
        console.error('Error comparing versions:', error);
        throw error;
    }
};

export const getGithubFileContent = async (path, ref = null) => {
    try {
        const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}${ref ? `?ref=${ref}` : ''}`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3.raw'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch file content');
        }

        return await response.text();
    } catch (error) {
        console.error('Error fetching file content:', error);
        throw error;
    }
};

export const getGithubDownloadUrl = (url) => {
    if (!url) return '';
    return url.replace('github.com', 'raw.githubusercontent.com')
        .replace('/blob/', '/');
};