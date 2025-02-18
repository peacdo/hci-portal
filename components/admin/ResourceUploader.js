// components/admin/ResourceUploader.js
import { useState, useCallback, useEffect } from 'react';
import {
    Upload,
    X,
    AlertTriangle,
    FileText,
    File,
    Loader,
    CheckCircle,
    Plus,
    Video,
    Code
} from 'lucide-react';
import { uploadResource } from '../../lib/githubUtils';
import { useResources } from '../../contexts/ResourceContext';
import Alert from '../ui/Alert';

const ResourceUploader = ({ onComplete, onClose, existingWeeks = [] }) => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [weekNumber, setWeekNumber] = useState('');
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(null);
    const [overallProgress, setOverallProgress] = useState(0);
    const { reload } = useResources();

    useEffect(() => {
        // Set initial week number if weeks exist
        if (existingWeeks.length > 0) {
            setWeekNumber(existingWeeks[0].toString());
        }
    }, [existingWeeks]);

    const validateFile = (file) => {
        const maxSize = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE) || 104857600; // 100MB default
        const allowedTypes = (process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES || '').split(',');
        
        if (!allowedTypes.includes(file.type)) {
            return 'Invalid file type. Only PDF, DOCX, MP4, WebM, and text files are allowed.';
        }
        
        if (file.size > maxSize) {
            return 'File is too large. Maximum size is 100MB.';
        }
        
        return null;
    };

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files || []);
        const newErrors = {};
        const validFiles = selectedFiles.filter(file => {
            const error = validateFile(file);
            if (error) {
                newErrors[file.name] = error;
                return false;
            }
            return true;
        });

        setFiles(prev => [...prev, ...validFiles]);
        setErrors(prev => ({ ...prev, ...newErrors }));
    };

    const uploadFiles = async () => {
        if (!weekNumber) {
            setErrors(prev => ({ ...prev, week: 'Please select a week' }));
            return;
        }

        if (files.length === 0) {
            setErrors(prev => ({ ...prev, files: 'Please select at least one file' }));
            return;
        }

        setUploading(true);
        let completed = 0;

        try {
            for (const file of files) {
                try {
                    await uploadResource(file, weekNumber, {
                        onProgress: (progress) => {
                            setUploadProgress(prev => ({
                                ...prev,
                                [file.name]: progress
                            }));
                        }
                    });
                    completed++;
                    setOverallProgress((completed / files.length) * 100);
                } catch (err) {
                    console.error(`Failed to upload ${file.name}:`, err);
                    setErrors(prev => ({
                        ...prev,
                        [file.name]: `Failed to upload: ${err.message}`
                    }));
                }
            }

            await reload();
            setSuccess('Files uploaded successfully');
            setTimeout(() => {
                onComplete?.();
            }, 1500);
        } catch (err) {
            setErrors(prev => ({
                ...prev,
                general: 'Failed to upload files. Please try again.'
            }));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Upload Resources</h2>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Week Selection */}
            <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                    Target Week
                </label>
                {existingWeeks.length === 0 ? (
                    <div className="text-red-500">
                        No weeks are available. Please create weeks in the Week Manager section before uploading resources.
                    </div>
                ) : (
                    <select
                        value={weekNumber}
                        onChange={(e) => {
                            setWeekNumber(e.target.value);
                            setErrors(prev => ({ ...prev, week: null }));
                        }}
                        className="w-full px-4 py-2 border rounded-lg dark:border-gray-700 dark:bg-gray-800"
                    >
                        {existingWeeks.map(week => (
                            <option key={week} value={week}>
                                Week {week}
                            </option>
                        ))}
                    </select>
                )}
                {errors.week && (
                    <p className="mt-1 text-sm text-red-500">{errors.week}</p>
                )}
            </div>

            {/* File Upload Area */}
            <div className="mb-6">
                <div
                    className="border-2 border-dashed dark:border-gray-700 rounded-lg p-8 text-center"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        handleFileSelect({ target: { files: e.dataTransfer.files } });
                    }}
                >
                    <input
                        type="file"
                        id="fileInput"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                        accept={process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES}
                    />
                    <div className="flex flex-col items-center">
                        <Upload className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg mb-2">
                            Drag & drop files here, or click to select
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            PDF or DOCX files up to 100MB each
                        </p>
                        <button
                            onClick={() => document.getElementById('fileInput').click()}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Select Files
                        </button>
                    </div>
                </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-4">Selected Files</h3>
                    <div className="space-y-4">
                        {files.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                            >
                                <div className="flex items-center space-x-4">
                                    <FileText className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="font-medium">{file.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>
                                {uploadProgress[file.name] !== undefined && (
                                    <div className="flex items-center space-x-4">
                                        <div className="w-24 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                            <div
                                                className="bg-blue-600 h-2.5 rounded-full"
                                                style={{ width: `${uploadProgress[file.name]}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {Math.round(uploadProgress[file.name])}%
                                        </span>
                                    </div>
                                )}
                                {!uploading && (
                                    <button
                                        onClick={() => {
                                            setFiles(files.filter((_, i) => i !== index));
                                            setErrors(prev => {
                                                const newErrors = { ...prev };
                                                delete newErrors[file.name];
                                                return newErrors;
                                            });
                                        }}
                                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Errors */}
            {Object.entries(errors).map(([key, error]) => (
                <Alert
                    key={key}
                    type="error"
                    message={error}
                    className="mb-4"
                />
            ))}

            {/* Success Message */}
            {success && (
                <Alert
                    type="success"
                    message={success}
                    className="mb-4"
                />
            )}

            {/* Upload Button */}
            <div className="flex justify-end">
                <button
                    onClick={uploadFiles}
                    disabled={uploading || files.length === 0 || existingWeeks.length === 0}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                    {uploading ? (
                        <>
                            <Loader className="animate-spin h-4 w-4" />
                            <span>Uploading...</span>
                        </>
                    ) : (
                        <>
                            <Upload className="h-4 w-4" />
                            <span>Upload</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ResourceUploader;