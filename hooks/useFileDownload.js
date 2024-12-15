import { useState } from 'react';
import { useResourceLogger } from '../contexts/LoggerContext';

export const useFileDownload = () => {
    const [downloading, setDownloading] = useState(false);
    const { logActivity } = useResourceLogger();

    const downloadFile = async (url, filename) => {
        try {
            setDownloading(true);
            const response = await fetch(url);
            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(downloadUrl);

            logActivity('file_downloaded', { filename });
            return true;
        } catch (error) {
            console.error('Download error:', error);
            throw error;
        } finally {
            setDownloading(false);
        }
    };

    return { downloadFile, downloading };
};