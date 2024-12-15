import { useState, useCallback } from 'react';
import { useResourceLogger } from '../contexts/LoggerContext';
import { useError } from '../contexts/ErrorContext';

export const useFilePreview = () => {
    const [previewFile, setPreviewFile] = useState(null);
    const { logActivity } = useResourceLogger();
    const { handleError } = useError();

    const openPreview = useCallback(async (file) => {
        try {
            setPreviewFile(file);
            logActivity('preview_opened', {
                fileType: file.type,
                fileName: file.name
            });
        } catch (error) {
            handleError(error);
        }
    }, [logActivity, handleError]);

    const closePreview = useCallback(() => {
        if (previewFile) {
            logActivity('preview_closed', {
                fileType: previewFile.type,
                fileName: previewFile.name
            });
        }
        setPreviewFile(null);
    }, [previewFile, logActivity]);

    return {
        previewFile,
        openPreview,
        closePreview,
        isPreviewOpen: !!previewFile
    };
};

export default useFilePreview;