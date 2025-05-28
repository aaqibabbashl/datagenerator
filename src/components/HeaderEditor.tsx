import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Save, X, Check } from 'lucide-react';

interface HeaderEditorProps {
  headers: Record<string, string>;
  onSave: (headers: Record<string, string>) => void;
  onCancel: () => void;
}

const HeaderEditor: React.FC<HeaderEditorProps> = ({ headers, onSave, onCancel }) => {
  const [editedHeaders, setEditedHeaders] = useState<Record<string, string>>({ ...headers });
  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [includeVersionHeader, setIncludeVersionHeader] = useState(!!headers['x-ms-version']);

  // Effect to add or remove version header when checkbox is toggled
  useEffect(() => {
    if (includeVersionHeader) {
      setEditedHeaders(prev => ({
        ...prev,
        'version': '2021-07-28'
      }));
    } else {
      setEditedHeaders(prev => {
        const newHeaders = { ...prev };
        delete newHeaders['version'];
        return newHeaders;
      });
    }
  }, [includeVersionHeader]);

  // Handle updating an existing header
  const handleHeaderChange = (key: string, value: string) => {
    setEditedHeaders(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle removing a header
  const handleRemoveHeader = (key: string) => {
    // If removing version header, also uncheck the checkbox
    if (key === 'x-ms-version') {
      setIncludeVersionHeader(false);
    }
    
    setEditedHeaders(prev => {
      const newHeaders = { ...prev };
      delete newHeaders[key];
      return newHeaders;
    });
  };

  // Handle adding a new header
  const handleAddHeader = () => {
    if (!newHeaderKey.trim()) return;
    
    setEditedHeaders(prev => ({
      ...prev,
      [newHeaderKey]: newHeaderValue
    }));
    
    // Reset form
    setNewHeaderKey('');
    setNewHeaderValue('');
    setShowAddForm(false);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedHeaders);
  };

  // Toggle version header
  const handleToggleVersionHeader = () => {
    setIncludeVersionHeader(prev => !prev);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 animate-fadeIn">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white">Edit Headers</h3>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            aria-label="Cancel"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            onClick={handleSubmit}
            className="p-1.5 rounded-md text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            aria-label="Save headers"
          >
            <Save className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Version Header Toggle */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center h-5">
              <input
                id="version-header-checkbox"
                type="checkbox"
                checked={includeVersionHeader}
                onChange={handleToggleVersionHeader}
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div className="ml-2 text-sm">
              <label htmlFor="version-header-checkbox" className="font-medium text-gray-900 dark:text-gray-300">
                Include Version Header
              </label>
              <p className="text-xs font-normal text-gray-500 dark:text-gray-400">
                Add <code className="text-xs bg-gray-200 dark:bg-gray-600 px-1 rounded">x-ms-version: 2021-07-28</code> header to requests
              </p>
            </div>
          </div>
          {includeVersionHeader && (
            <div className="flex items-center text-xs text-green-600 dark:text-green-400">
              <Check className="h-3 w-3 mr-1" />
              <span>Added</span>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {Object.entries(editedHeaders).map(([key, value]) => (
            <div key={key} className={`flex gap-2 items-center ${key === 'x-ms-version' ? 'bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md' : ''}`}>
              <div className="flex-1">
                <input
                  type="text"
                  value={key}
                  disabled
                  className={`w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 ${key === 'x-ms-version' ? 'font-medium' : ''}`}
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleHeaderChange(key, e.target.value)}
                  disabled={key === 'x-ms-version'} // Make version header value read-only
                  className={`w-full px-3 py-2 ${key === 'x-ms-version' ? 'bg-gray-100 dark:bg-gray-700 font-medium' : 'bg-white dark:bg-gray-800'} border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  placeholder="Header value"
                />
              </div>
              <button
                onClick={() => handleRemoveHeader(key)}
                className="p-1.5 text-gray-500 hover:text-red-500 transition-colors"
                aria-label={`Remove ${key} header`}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {showAddForm ? (
        <div className="mb-4 p-3 border border-gray-200 dark:border-gray-700 rounded-md">
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <input
                type="text"
                value={newHeaderKey}
                onChange={(e) => setNewHeaderKey(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Header name"
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={newHeaderValue}
                onChange={(e) => setNewHeaderValue(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Header value"
              />
            </div>
            <div className="flex gap-1">
              <button
                onClick={handleAddHeader}
                className="p-1.5 text-primary-500 hover:text-primary-600 transition-colors"
                aria-label="Add header"
              >
                <Save className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Cancel"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add Header</span>
        </button>
      )}
    </div>
  );
};

export default HeaderEditor; 