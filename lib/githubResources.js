// lib/githubResources.js
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
const GITHUB_REPO = 'peacdo/hci-portal-resources';
const GITHUB_BRANCH = 'main';

export async function fetchResources() {
    try {
        // Fetch the resources.json file from GitHub
        const response = await fetch(
            `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/resources.json`,
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

        const resources = await response.json();
        return resources;
    } catch (error) {
        console.error('Error fetching resources:', error);
        throw error;
    }
}

export async function updateResources(newResources) {
    try {
        // First get the current file to get its SHA
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

        // Update the file
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
                    content: Buffer.from(JSON.stringify(newResources, null, 2)).toString('base64'),
                    sha: fileData.sha,
                    branch: GITHUB_BRANCH
                })
            }
        );

        if (!response.ok) {
            throw new Error('Failed to update resources');
        }

        return true;
    } catch (error) {
        console.error('Error updating resources:', error);
        throw error;
    }
}