// lib/githubResourceService.js
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
const GITHUB_REPO = 'peacdo/hci-portal-resources';
const GITHUB_BRANCH = 'main';

export async function getResources() {
    const response = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/contents/data/resources.json`,
        {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3.raw'
            }
        }
    );
    if (!response.ok) throw new Error('Failed to fetch resources');
    return response.json();
}

export async function updateResources(content) {
    const currentFile = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/contents/data/resources.json`,
        {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        }
    );
    const fileData = await currentFile.json();

    const response = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/contents/data/resources.json`,
        {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: 'Update resources',
                content: Buffer.from(JSON.stringify(content)).toString('base64'),
                sha: fileData.sha,
                branch: GITHUB_BRANCH
            })
        }
    );
    if (!response.ok) throw new Error('Failed to update resources');
    return true;
}