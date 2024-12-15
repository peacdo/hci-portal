// components/admin/ResourceUploader.js
import { useState, useCallback } from 'react';
import {
    Upload,
    X,
    AlertTriangle,
    FileText,
    File,
    Loader,
    CheckCircle,
    Plus
} from 'lucide-react';
import { uploadResource } from '../../lib/githubUtils';
import { useResources } from '../../contexts/ResourceContext';
import Alert from '../ui/Alert';

const ResourceUploader = ({ onComplete, existingWeeks = [] }) => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [weekNumber, setWeekNumber] = useState(existingWeeks[0]?.toString() || '');
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(null);
    const [overallProgress, setOverallProgress] = useState(0);
    const { reload } = useResources();

    const validateFile = (file) => {
        // Check file type
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type)) {
            return 'Invalid file type. Only PDF and DOCX files are allowed.';
        }

        // Check file size (100MB limit)
        const maxSize = 100 * 1024 * 1024; // 100MB in bytes
        if (file.size > maxSize) {
            return 'File size exceeds 100MB limit.';
        }

        return null;
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files);

        const validFiles = [];
        const newErrors = { ...errors };

        droppedFiles.forEach(file => {
            const error = validateFile(file);
            if (error) {
                newErrors[file.name] = error;
            } else {
                validFiles.push({
                    file,
                    id: Math.random().toString(36).substr(2, 9),
                    status: 'pending'
                });
            }
        });

        if (validFiles.length > 0) {
            setFiles(prev => [...prev, ...validFiles]);
        }
        setErrors(newErrors);
    }, [errors]);

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files || []);

        const validFiles = [];
        const newErrors = { ...errors };

        selectedFiles.forEach(file => {
            const error = validateFile(file);
            if (error) {
                newErrors[file.name] = error;
            } else {
                validFiles.push({
                    file,
                    id: Math.random().toString(36).substr(2, 9),
                    status: 'pending'
                });
            }
        });

        if (validFiles.length > 0) {
            setFiles(prev => [...prev, ...validFiles]);
        }
        setErrors(newErrors);
    };

    const removeFile = (fileId) => {
        setFiles(prev => prev.filter(f => f.id !== fileId));
        setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
        });
    };

    const uploadFiles = async () => {
        if (files.length === 0 || !weekNumber) return;

        setUploading(true);
        setSuccess(null);
        setErrors({});
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
                setSuccess('All files uploaded successfully');
                onComplete?.();
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
            {/* Week Selection */}
            <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Target Week
                </label>
                <select
                    value={weekNumber}
                    onChange={(e) => setWeekNumber(e.target.value)}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                    disabled={uploading || existingWeeks.length === 0}
                >
                    {existingWeeks.length === 0 ? (
                        <option value="">No weeks available</option>
                    ) : (
                        existingWeeks.map(week => (
                            <option key={week} value={week}>Week {week}</option>
                        ))
                    )}
                </select>
                {existingWeeks.length === 0 && (
                    <p className="mt-2 text-sm text-red-500">
                        Please create a week in the Week Manager before uploading resources.
                    </p>
                )}
            </div>

            {/* Success/Error Messages */}
            {success && (
                <Alert className="mb-4">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {success}
                </Alert>
            )}

            {Object.keys(errors).length > 0 && (
                <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <div>
                        <p className="font-medium">Upload errors:</p>
                        <ul className="list-disc list-inside mt-2">
                            {Object.entries(errors).map(([filename, error]) => (
                                <li key={filename} className="text-sm">
                                    {filename}: {error}
                                </li>
                            ))}
                        </ul>
                    </div>
                </Alert>
            )}

            {/* Upload Area */}
            <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                } ${
                    files.length > 0
                        ? 'border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10'
                        : 'border-gray-300 dark:border-gray-700 hover:border-blue-400'
                }`}
            >
                <input
                    type="file"
                    multiple
                    accept=".pdf,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    disabled={uploading}
                />
                <label
                    htmlFor="file-upload"
                    className="cursor-pointer"
                >
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                        Drag & drop files here, or click to select
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        PDF or DOCX files up to 100MB each
                    </p>
                </label>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="mt-6 space-y-4">
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
                                    <p className="truncate font-medium text-gray-900 dark:text-white">
                                        {file.name}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4 ml-4">
                                {uploadProgress[id] !== undefined && (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                                            <div
                                                className="h-full bg-blue-600 rounded-full transition-all"
                                                style={{ width: `${uploadProgress[id]}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
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
                        disabled={uploading || !weekNumber}
                        className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {uploading ? (
                            <>
                                <Loader className="animate-spin h-5 w-5 mr-2" />
                                Uploading... ({Math.round(overallProgress)}%)
                            </>
                        ) : (
                            <>
                                <Upload className="h-5 w-5 mr-2" />
                                Upload {files.length} {files.length === 1 ? 'File' : 'Files'}
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ResourceUploader;