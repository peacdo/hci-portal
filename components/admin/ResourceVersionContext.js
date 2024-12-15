// contexts/ResourceVersionContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { useResources } from './ResourceContext';
import { getGithubCommits, createGithubCommit } from '../lib/githubUtils';

const ResourceVersionContext = createContext({});

export function ResourceVersionProvider({ children }) {
    const { resources, reload } = useResources();
    const [versions, setVersions] = useState({});
    const [loading, setLoading] = useState({});
    const [error, setError] = useState(null);

    // Load version history for a resource
    const loadVersionHistory = async (resourcePath) => {
        setLoading(prev => ({ ...prev, [resourcePath]: true }));
        setError(null);

        try {
            const commits = await getGithubCommits(resourcePath);
            setVersions(prev => ({
                ...prev,
                [resourcePath]: commits.map(commit => ({
                    sha: commit.sha,
                    message: commit.commit.message,
                    author: commit.commit.author.name,
                    date: commit.commit.author.date,
                    changes: commit.files?.[0]?.changes || 0,
                    additions: commit.files?.[0]?.additions || 0,
                    deletions: commit.files?.[0]?.deletions || 0
                }))
            }));
        } catch (err) {
            setError(`Failed to load version history: ${err.message}`);
        } finally {
            setLoading(prev => ({ ...prev, [resourcePath]: false }));
        }
    };

    // Create a new version
    const createVersion = async (resourcePath, content, message) => {
        setLoading(prev => ({ ...prev, [resourcePath]: true }));
        setError(null);

        try {
            const result = await createGithubCommit(resourcePath, content, message);
            await loadVersionHistory(resourcePath);
            await reload();
            return result;
        } catch (err) {
            setError(`Failed to create version: ${err.message}`);
            throw err;
        } finally {
            setLoading(prev => ({ ...prev, [resourcePath]: false }));
        }
    };

    // Restore a previous version
    const restoreVersion = async (resourcePath, sha) => {
        setLoading(prev => ({ ...prev, [resourcePath]: true }));
        setError(null);

        try {
            await createGithubCommit(
                resourcePath,
                null,
                `Restore version ${sha}`,
                sha
            );
            await loadVersionHistory(resourcePath);
            await reload();
        } catch (err) {
            setError(`Failed to restore version: ${err.message}`);
            throw err;
        } finally {
            setLoading(prev => ({ ...prev, [resourcePath]: false }));
        }
    };

    // Compare versions
    const compareVersions = async (resourcePath, sha1, sha2) => {
        try {
            // Implement version comparison logic
            const comparison = await getGithubCommits(resourcePath, {
                sha1,
                sha2
            });
            return comparison;
        } catch (err) {
            setError(`Failed to compare versions: ${err.message}`);
            throw err;
        }
    };

    // Get version details
    const getVersionDetails = (resourcePath, sha) => {
        const resourceVersions = versions[resourcePath] || [];
        return resourceVersions.find(v => v.sha === sha);
    };

    // Get latest version
    const getLatestVersion = (resourcePath) => {
        const resourceVersions = versions[resourcePath] || [];
        return resourceVersions[0];
    };

    // Get version history for a resource
    const getVersionHistory = (resourcePath) => {
        return versions[resourcePath] || [];
    };

    // Check if a version exists
    const versionExists = (resourcePath, sha) => {
        const resourceVersions = versions[resourcePath] || [];
        return resourceVersions.some(v => v.sha === sha);
    };

    return (
        <ResourceVersionContext.Provider value={{
            loadVersionHistory,
            createVersion,
            restoreVersion,
            compareVersions,
            getVersionDetails,
            getLatestVersion,
            getVersionHistory,
            versionExists,
            versions,
            loading,
            error
        }}>
            {children}
        </ResourceVersionContext.Provider>
    );
}

export const useResourceVersions = () => useContext(ResourceVersionContext);