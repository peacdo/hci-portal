// lib/githubResourceService.js

import { getGitHubFile, updateGitHubFile } from './githubUtils';

// Resource Types
export const RESOURCE_TYPES = {
    PDF: 'PDF',
    VIDEO: 'VIDEO',
    LINK: 'LINK',
    DOCUMENT: 'DOCUMENT',
    CODE_SAMPLE: 'CODE_SAMPLE'
};

// Sample resource data for testing and development
const SAMPLE_RESOURCES = [
    {
        id: 'res_001',
        title: 'Introduction to Human-Computer Interaction',
        description: 'A comprehensive overview of HCI principles and fundamentals',
        type: RESOURCE_TYPES.PDF,
        url: 'https://example.com/hci-intro.pdf',
        downloadUrl: 'https://example.com/hci-intro.pdf',
        topics: ['HCI/Fundamentals', 'HCI/Principles'],
        views: 156,
        downloads: 89,
        duration: '45 mins',
        createdAt: new Date('2024-01-15'),
        ratings: [
            { userId: 'user1', value: 5 },
            { userId: 'user2', value: 4 },
            { userId: 'user3', value: 5 }
        ]
    },
    {
        id: 'res_002',
        title: 'Usability Testing Methods',
        description: 'Learn different methods for conducting usability tests',
        type: RESOURCE_TYPES.VIDEO,
        url: 'https://example.com/usability-testing.mp4',
        topics: ['HCI/Testing', 'HCI/Methods'],
        views: 234,
        downloads: 0,
        duration: '32 mins',
        createdAt: new Date('2024-01-20'),
        ratings: [
            { userId: 'user1', value: 4 },
            { userId: 'user4', value: 5 }
        ]
    },
    {
        id: 'res_003',
        title: 'UI Design Patterns',
        description: 'Common UI design patterns and their applications',
        type: RESOURCE_TYPES.DOCUMENT,
        url: 'https://example.com/ui-patterns',
        downloadUrl: 'https://example.com/ui-patterns.pdf',
        topics: ['UI/Patterns', 'UI/Design'],
        views: 312,
        downloads: 145,
        duration: '60 mins',
        createdAt: new Date('2024-01-25'),
        ratings: [
            { userId: 'user2', value: 5 },
            { userId: 'user3', value: 5 }
        ]
    },
    {
        id: 'res_004',
        title: 'Cognitive Psychology in HCI',
        description: 'Understanding how cognitive psychology influences HCI design',
        type: RESOURCE_TYPES.PDF,
        url: 'https://example.com/cognitive-hci.pdf',
        downloadUrl: 'https://example.com/cognitive-hci.pdf',
        topics: ['HCI/Psychology', 'HCI/Cognitive'],
        views: 178,
        downloads: 92,
        duration: '50 mins',
        createdAt: new Date('2024-02-01'),
        ratings: [
            { userId: 'user1', value: 4 },
            { userId: 'user4', value: 4 }
        ]
    },
    {
        id: 'res_005',
        title: 'Responsive Design Implementation',
        description: 'Code examples and best practices for responsive design',
        type: RESOURCE_TYPES.CODE_SAMPLE,
        url: 'https://example.com/responsive-code',
        topics: ['UI/Responsive', 'UI/Implementation'],
        views: 423,
        downloads: 201,
        duration: '25 mins',
        createdAt: new Date('2024-02-05'),
        content: `// Responsive Design Example
const breakpoints = {
    mobile: '320px',
    tablet: '768px',
    desktop: '1024px'
};

function createResponsiveContainer() {
    const container = document.createElement('div');
    container.classList.add('responsive-container');
    container.style.cssText = \`
        width: 100%;
        max-width: var(--container-width);
        margin: 0 auto;
        padding: 1rem;
    \`;
    return container;
}

// Media Query Helper
function createMediaQuery(breakpoint) {
    return \`@media (min-width: \${breakpoints[breakpoint]})\`;
}`,
        ratings: [
            { userId: 'user2', value: 5 },
            { userId: 'user3', value: 4 }
        ]
    },
    {
        id: 'res_006',
        title: 'User Research Methods',
        description: 'Comprehensive guide to conducting user research',
        type: RESOURCE_TYPES.VIDEO,
        url: 'https://example.com/user-research.mp4',
        topics: ['HCI/Research', 'HCI/Methods'],
        views: 289,
        downloads: 0,
        duration: '45 mins',
        createdAt: new Date('2024-02-10'),
        ratings: [
            { userId: 'user1', value: 5 },
            { userId: 'user4', value: 5 }
        ]
    },
    {
        id: 'res_007',
        title: 'Accessibility Guidelines',
        description: 'WCAG 2.1 guidelines and implementation examples',
        type: RESOURCE_TYPES.DOCUMENT,
        url: 'https://example.com/accessibility',
        downloadUrl: 'https://example.com/accessibility.pdf',
        topics: ['UI/Accessibility', 'UI/Standards'],
        views: 267,
        downloads: 134,
        duration: '40 mins',
        createdAt: new Date('2024-02-15'),
        content: `# Accessibility Guidelines

## WCAG 2.1 Key Principles

1. Perceivable
2. Operable
3. Understandable
4. Robust

## Implementation Examples

### 1. Alternative Text
\`\`\`html
<img src="logo.png" alt="Company Logo" />
\`\`\`

### 2. Keyboard Navigation
\`\`\`javascript
element.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        // Activate the element
    }
});
\`\`\``,
        ratings: [
            { userId: 'user2', value: 4 },
            { userId: 'user3', value: 5 }
        ]
    },
    {
        id: 'res_008',
        title: 'Interactive Prototyping',
        description: 'Tools and techniques for creating interactive prototypes',
        type: RESOURCE_TYPES.LINK,
        url: 'https://example.com/prototyping',
        topics: ['UI/Prototyping', 'UI/Tools'],
        views: 198,
        downloads: 0,
        duration: '35 mins',
        createdAt: new Date('2024-02-20'),
        ratings: [
            { userId: 'user1', value: 4 },
            { userId: 'user4', value: 4 }
        ]
    }
];

// Get all resources
export async function getResources() {
    try {
        const resources = await getGitHubFile('resources.json');
        return resources || [];
    } catch (error) {
        console.error('Error getting resources:', error);
        return [];
    }
}

// Get resources for a specific module
export async function getModuleResources(courseId, moduleId) {
    const resources = await getResources();
    return resources.filter(resource => 
        resource.courseId === courseId && 
        resource.moduleId === moduleId
    );
}

// Get resource recommendations
export async function getResourceRecommendations(courseId, studentId) {
    const resources = await getResources();
    // For now, just return the first 3 resources
    // In a real implementation, you would implement recommendation logic
    return resources.slice(0, 3).map(resource => ({
        ...resource,
        relevance: 'Based on your interests'
    }));
}

// Track resource usage
export async function trackResourceUsage(courseId, moduleId, resourceId, action) {
    // Implementation for tracking resource usage
    console.log('Tracking resource usage:', { courseId, moduleId, resourceId, action });
}

// Get resource content
export async function getResourceContent(path) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const resource = SAMPLE_RESOURCES.find(r => r.url.includes(path));
    if (!resource) return null;

    return resource.content || null;
}

// Update resources
export async function updateResources(resources) {
    try {
        await updateGitHubFile('resources.json', resources);
        return true;
    } catch (error) {
        console.error('Error updating resources:', error);
        throw error;
    }
}