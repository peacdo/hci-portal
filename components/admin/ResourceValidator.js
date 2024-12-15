// components/admin/ResourceValidator.js
import { useState, useCallback } from 'react';
import { AlertTriangle, CheckCircle, Upload, Loader } from 'lucide-react';
import ResourceValidationService from '../../lib/resourceValidation';
import Alert from '../ui/Alert';

const ResourceValidator = ({ onValidated, children }) => {
    const [validating, setValidating] = useState(false);
    const [validationResults, setValidationResults] = useState(null);

    const validateFiles = useCallback(async (files) => {
        setValidating(true);
        setValidationResults(null);

        try {
            const results = await Promise.all(
                files.map(async file => {
                    const result = await ResourceValidationService.validateFile(file);
                    return {
                        file,
                        ...result
                    };
                })
            );

            const validResults = results.filter(r => r.valid);
            const invalidResults = results.filter(r => !r.valid);

            setValidationResults({
                valid: invalidResults.length === 0,
                results,
                validFiles: validResults.map(r => r.file),
                invalidFiles: invalidResults
            });

            if (invalidResults.length === 0) {
                onValidated?.(validResults.map(r => r.file));
            }

            return invalidResults.length === 0;
        } catch (error) {
            console.error('Validation failed:', error);
            setValidationResults({
                valid: false,
                error: 'Validation failed due to an unexpected error'
            });
            return false;
        } finally {
            setValidating(false);
        }
    }, [onValidated]);

    const renderValidationResults = () => {
        if (!validationResults) return null;

        if (validationResults.error) {
            return (
                <Alert variant="destructive" className="mt-4">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    {validationResults.error}
                </Alert>
            );
        }

        return (
            <div className="mt-4 space-y-4">
                {validationResults.valid ? (
                    <Alert variant="success">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        All files passed validation
                    </Alert>
                ) : (
                    <div>
                        <Alert variant="destructive">
                            <AlertTriangle className="h-5 w-5 mr-2" />
                            Some files failed validation
                        </Alert>
                        <div className="mt-2 space-y-2">
                            {validationResults.invalidFiles.map((result, index) => (
                                <div
                                    key={index}
                                    className="bg-red-50 dark:bg-red-900/30 p-3 rounded"
                                >
                                    <p className="font-medium text-red-700 dark:text-red-300">
                                        {result.file.name}
                                    </p>
                                    <ul className="mt-1 list-disc list-inside text-sm text-red-600 dark:text-red-400">
                                        {result.errors.map((error, i) => (
                                            <li key={i}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {children({
                validateFiles,
                validating,
                validationResults
            })}
            {validating && (
                <div className="flex items-center justify-center p-4">
                    <Loader className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                    <span>Validating files...</span>
                </div>
            )}
            {renderValidationResults()}
        </div>
    );
};

export default ResourceValidator;