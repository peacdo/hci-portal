import React, { useState } from 'react';
import { FileText, Download, Eye, Book, X, Loader } from 'lucide-react';
import Layout from '../components/Layout';
import resources from '../data/resources';

const Alert = ({ children, variant = 'default' }) => {
  const bgColor = variant === 'destructive' ? 'bg-red-50' : 'bg-blue-50';
  const textColor = variant === 'destructive' ? 'text-red-700' : 'text-blue-700';
  const borderColor = variant === 'destructive' ? 'border-red-400' : 'border-blue-400';

  return (
    <div className={`${bgColor} ${textColor} p-4 rounded-lg border ${borderColor}`} role="alert">
      {children}
    </div>
  );
};

const ResourceViewer = ({ resource, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const getViewerUrl = (resource) => {
    if (resource.type === 'pdf') {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(resource.viewLink)}&embedded=true`;
    }
    return null;
  };

  const viewerUrl = getViewerUrl(resource);

  if (resource.type === 'docx') {
    return (
      <div 
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="resource-viewer-title"
      >
        <div className="bg-white rounded-lg w-full max-w-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 id="resource-viewer-title" className="text-lg font-semibold">
              {resource.title}
              <span className="ml-2 text-sm text-gray-500 uppercase">({resource.type})</span>
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Close resource viewer"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="text-center py-6">
            <FileText className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 mb-6">
              This document needs to be downloaded to view its contents. Click the button below to download the file.
            </p>
            <a
              href={resource.downloadLink}
              download
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              onClick={() => {
                // Close the modal after starting the download
                setTimeout(onClose, 1000);
              }}
            >
              <Download className="h-5 w-5 mr-2" />
              Download Document
            </a>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Note: Microsoft Word or a compatible document viewer is required to open this file.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resource-viewer-title"
    >
      <div className="bg-white rounded-lg w-full h-full max-w-6xl flex flex-col">
        <div className="p-4 flex justify-between items-center border-b">
          <h3 id="resource-viewer-title" className="text-lg font-semibold">
            {resource.title}
            <span className="ml-2 text-sm text-gray-500 uppercase">({resource.type})</span>
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Close resource viewer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 p-4 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <Loader className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          )}
          {hasError ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <Alert variant="destructive">
                <p>Failed to load the PDF viewer.</p>
              </Alert>
              <a
                href={resource.downloadLink}
                download
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <Download className="h-5 w-5 mr-2" />
                Download Instead
              </a>
            </div>
          ) : (
            <iframe
              src={viewerUrl}
              className="w-full h-full rounded border"
              title={`Viewing ${resource.title}`}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
              sandbox="allow-scripts allow-same-origin"
            />
          )}
        </div>
        <div className="p-4 border-t">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Having trouble viewing? You can download the file directly.
            </p>
            <a
              href={resource.downloadLink}
              download
              className="flex items-center px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const WeekCard = ({ weekData }) => {
  const [viewingResource, setViewingResource] = useState(null);
  const [error, setError] = useState(null);

  const handleViewResource = (resource) => {
    try {
      setViewingResource(resource);
      setError(null);
    } catch (err) {
      setError('Failed to open resource viewer');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <Book className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-semibold">
          {weekData.week === 'misc' ? 'Additional Resources' : `Week ${weekData.week}: ${weekData.title}`}
        </h2>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <p>{error}</p>
        </Alert>
      )}

      <div className="space-y-4">
        {weekData.materials.map((material, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center">
              <FileText 
                className={`h-5 w-5 ${
                  material.type === 'pdf' ? 'text-red-500' : 'text-blue-500'
                } mr-3`} 
              />
              <span className="font-medium">{material.title}</span>
              <span className="ml-2 text-sm text-gray-500 uppercase">
                {material.type}
              </span>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleViewResource(material)}
                className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                aria-label={`View ${material.title}`}
              >
                <Eye className="h-4 w-4 mr-1" />
                {material.type === 'docx' ? 'View' : 'View'}
              </button>
              <a
                href={material.downloadLink}
                download
                className="flex items-center px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                aria-label={`Download ${material.title}`}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </a>
            </div>
          </div>
        ))}
      </div>

      {viewingResource && (
        <ResourceViewer
          resource={viewingResource}
          onClose={() => setViewingResource(null)}
        />
      )}
    </div>
  );
};

const ResourcesPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Course Resources</h1>
        <div className="space-y-6">
          {resources.map((weekData) => (
            <WeekCard key={weekData.week} weekData={weekData} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default ResourcesPage;