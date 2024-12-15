// lib/githubFlashcardService.js
export async function getFlashcards() {
    const response = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/contents/data/flashcards.json`,
        {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3.raw'
            }
        }
    );
    if (!response.ok) throw new Error('Failed to fetch flashcards');
    return response.json();
}

export async function updateFlashcards(content) {
    const currentFile = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/contents/data/flashcards.json`,
        {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        }
    );
    const fileData = await currentFile.json();

    const response = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/contents/data/flashcards.json`,
        {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: 'Update flashcards',
                content: Buffer.from(JSON.stringify(content)).toString('base64'),
                sha: fileData.sha,
                branch: GITHUB_BRANCH
            })
        }
    );
    if (!response.ok) throw new Error('Failed to update flashcards');
    return true;
}