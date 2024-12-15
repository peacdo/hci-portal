// components/admin/ResourceBatchUploader.js
import { useState, useCallback } from 'react';
import {
    Upload, X, AlertTriangle, File,
    FileText, CheckCircle, Loader
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { uploadResource } from '../../lib/githubUtils';
import { useResources } from '../../contexts/ResourceContext';
import Alert from '../ui/Alert';

const ResourceBatchUploader = () => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [weekNumber, setWeekNumber] = useState('1');
    const [errors, setErrors] = useState({});
    const [overallProgress, setOverallProgress] = useState(0);
    const { reload } = useResources();

    const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
        // Handle rejected files
        const newErrors = { ...errors };
        rejectedFiles.forEach(({ file, errors: fileErrors }) => {
            newErrors[file.name] = fileErrors.map(err => err.message).join(', ');
        });
        setErrors(newErrors);

        // Add accepted files
        setFiles(prev => [
            ...prev,
            ...acceptedFiles.map(file => ({
                file,
                id: Math.random().toString(36).substr(2, 9),
                status: 'pending'
            }))
        ]);
    }, [errors]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        maxSize: 100 * 1024 * 1024 // 100MB
    });

    const removeFile = (fileId) => {
        setFiles(prev => prev.filter(f => f.id !== fileId));
        setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
        });
    };

    const uploadFiles = async () => {
        if (files.length === 0) return;

        setUploading(true);
        const totalFiles = files.length;
        let completedFiles = 0;

        try {
            const uploadPromises = files.map(async ({ file, id }) => {
                try {
                    setUploadProgress(prev => ({ ...prev, [id]: 0 }));

                    await uploadResource(file, weekNumber, {
                        onProgress: (progress) => {
                            setUploadProgress(prev => ({ ...prev, [id]: progress }));
                        }
                    });

                    completedFiles++;
                    setOverallProgress((completedFiles / totalFiles) * 100);

                    return { id, success: true };
                } catch (error) {
                    setErrors(prev => ({
                        ...prev,
                        [file.name]: error.message
                    }));
                    return { id, success: false, error: error.message };
                }
            });

            const results = await Promise.allSettled(uploadPromises);
            const allSuccessful = results.every(result =>
                result.status === 'fulfilled' && result.value.success
            );

            if (allSuccessful) {
                await reload();
                setFiles([]);
                setUploadProgress({});
            }
        } catch (error) {
            setErrors(prev => ({
                ...prev,
                general: 'Failed to upload some files. Please try again.'
            }));
        } finally {
            setUploading(false);
            setOverallProgress(0);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Batch Upload Resources</h2>

            {/* Week Selection */}
            <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Target Week</label>
                <select
                    value={weekNumber}
                    onChange={(e) => setWeekNumber(e.target.value)}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    disabled={uploading}
                >
                    {Array.from({ length: 14 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>Week {i + 1}</option>
                    ))}
                </select>
            </div>

            {/* Drop Zone */}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
                    isDragActive
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                        : 'border-gray-300 dark:border-gray-600'
                } ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <input {...getInputProps()} disabled={uploading} />
                <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        {isDragActive
                            ? 'Drop the files here...'
                            : 'Drag & drop files here, or click to select'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        PDF or DOCX files up to 100MB each
                    </p>
                </div>
            </div>

            {/* Error Messages */}
            {Object.keys(errors).length > 0 && (
                <div className="mt-4">
                    <Alert variant="destructive">
                        <ul className="list-disc list-inside">
                            {Object.entries(errors).map(([filename, error]) => (
                                <li key={filename}>{filename}: {error}</li>
                            ))}
                        </ul>
                    </Alert>
                </div>
            )}

            {/* File List */}
            {files.length > 0 && (
                <div className="mt-6 space-y-3">
                    {files.map(({ file, id }) => (
                        <div
                            key={id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                            <div className="flex items-center min-w-0">
                                {file.name.endsWith('.pdf') ? (
                                    <FileText className="h-5 w-5 text-red-500 mr-3" />
                                ) : (
                                    <File className="h-5 w-5 text-blue-500 mr-3" />
                                )}
                                <div className="min-w-0">
                                    <p className="truncate font-medium">
                                        {file.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                {uploadProgress[id] !== undefined && (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                                            <div
                                                className="h-full bg-blue-600 rounded-full transition-all"
                                                style={{ width: `${uploadProgress[id]}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {Math.round(uploadProgress[id])}%
                                        </span>
                                    </div>
                                )}
                                {!uploading && (
                                    <button
                                        onClick={() => removeFile(id)}
                                        className="p-1 text-gray-400 hover:text-red-500"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Button */}
            {files.length > 0 && (
                <div className="mt-6">
                    <button
                        onClick={uploadFiles}
                        disabled={uploading}
                        className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {uploading ? (
                            <>
                                <Loader className="animate-spin h-5 w-5 mr-2" />
                                Uploading... ({Math.round(overallProgress)}%)
                            </>
                        ) : (
                            <>
                                <Upload className="h-5 w-5 mr-2" />
                                Upload {files.length} Files
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ResourceBatchUploader;