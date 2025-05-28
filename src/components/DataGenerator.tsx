import React, { useState, useEffect } from 'react';
import { Database, ChevronDown, ChevronUp, Play, List, Edit, Zap } from 'lucide-react';
import { ParsedCurl, FieldConfig, FieldMetadata, RandomDataType } from '../types';
import { extractFieldsFromParsedCurl } from '../utils/curlParser';
import HeaderEditor from './HeaderEditor';

interface DataGeneratorProps {
  parsedCurl: ParsedCurl;
  numberOfEntries: number;
  onChangeNumberOfEntries: (value: number) => void;
  fieldConfigs: Record<string, FieldConfig>;
  onFieldConfigChange: (fieldName: string, config: FieldConfig) => void;
  runApiRequests: boolean;
  onToggleApiRequests: () => void;
  expectedStatus: number;
  onExpectedStatusChange: (status: number) => void;
  onGenerate: () => void;
  isLoading: boolean;
  onUpdateHeaders: (headers: Record<string, string>) => void;
}

const DataGenerator: React.FC<DataGeneratorProps> = ({
  parsedCurl,
  numberOfEntries,
  onChangeNumberOfEntries,
  fieldConfigs,
  onFieldConfigChange,
  runApiRequests,
  onToggleApiRequests,
  expectedStatus,
  onExpectedStatusChange,
  onGenerate,
  isLoading,
  onUpdateHeaders
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [method, setMethod] = useState(parsedCurl.method);
  const [showHeaderEditor, setShowHeaderEditor] = useState(false);
  const fields = extractFieldsFromParsedCurl(parsedCurl);
  
  // Initialize field configurations with original values as static values
  useEffect(() => {
    // Only add configs for fields that don't have one yet
    const newConfigs: Record<string, FieldConfig> = {};
    let hasNewConfigs = false;
    
    Object.entries(fields).forEach(([fieldName, metadata]) => {
      if (!fieldConfigs[fieldName] && metadata.originalValue !== undefined) {
        newConfigs[fieldName] = {
          type: metadata.type,
          isStatic: true,
          staticValue: String(metadata.originalValue),
          randomType: guessRandomDataType(fieldName, metadata.type), // Pre-select appropriate random type
          fieldName: fieldName // Include the field name
        };
        hasNewConfigs = true;
      }
    });
    
    // Only update if we have new configurations
    if (hasNewConfigs) {
      Object.entries(newConfigs).forEach(([fieldName, config]) => {
        onFieldConfigChange(fieldName, config);
      });
    }
  }, [fields, fieldConfigs, onFieldConfigChange]);
  
  // Function to guess appropriate random data type based on field name
  const guessRandomDataType = (fieldName: string, fieldType: string): RandomDataType => {
    const name = fieldName.toLowerCase();
    
    if (/id$|^id$|_id$/.test(name)) return RandomDataType.ID;
    if (/uuid|guid/.test(name)) return RandomDataType.GUID;
    if (/email|e-mail/.test(name)) return RandomDataType.Email;
    if (/name$/.test(name)) return RandomDataType.Name;
    if (/first[_-]?name/.test(name)) return RandomDataType.FirstName;
    if (/last[_-]?name/.test(name)) return RandomDataType.LastName;
    if (/phone|mobile|cell/.test(name)) return RandomDataType.Phone;
    if (/address/.test(name)) return RandomDataType.Address;
    if (/city/.test(name)) return RandomDataType.City;
    if (/state|province/.test(name)) return RandomDataType.State;
    if (/country/.test(name)) return RandomDataType.Country;
    if (/zip|postal/.test(name)) return RandomDataType.ZipCode;
    if (/date|time/.test(name)) return RandomDataType.Date;
    if (/age/.test(name)) return RandomDataType.Age;
    if (/gender|sex/.test(name)) return RandomDataType.Gender;
    if (/url|website|site/.test(name)) return RandomDataType.URL;
    if (/description|desc|summary|text|content/.test(name)) return RandomDataType.Text;
    if (/price|cost|amount/.test(name)) return RandomDataType.Price;
    if (/image|picture|avatar|photo/.test(name)) return RandomDataType.Image;
    if (/color|colour/.test(name)) return RandomDataType.Color;
    if (/boolean|bool|flag|is[A-Z]/.test(name)) return RandomDataType.Boolean;
    if (/company|business|organization/.test(name)) return RandomDataType.CompanyName;
    if (/job|position|title/.test(name)) return RandomDataType.JobTitle;
    if (/username|login/.test(name)) return RandomDataType.Username;
    if (/password|pwd|pass/.test(name)) return RandomDataType.Password;
    if (/credit|card|cc/.test(name)) return RandomDataType.CreditCardNumber;
    
    // Fall back to type-based mapping if name doesn't match
    if (fieldType === 'number') return RandomDataType.Number;
    if (fieldType === 'boolean') return RandomDataType.Boolean;
    
    // Default
    return RandomDataType.Default;
  };
  
  const handleToggleDetails = () => {
    setShowDetails(prev => !prev);
  };
  
  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMethod(e.target.value);
    // Update the parsedCurl object's method
    parsedCurl.method = e.target.value;
  };
  
  const handleFieldTypeChange = (fieldName: string, isStatic: boolean) => {
    const metadata = fields[fieldName];
    const currentConfig = fieldConfigs[fieldName] || { 
      type: metadata?.type || '', 
      isStatic: true,
      staticValue: metadata?.originalValue ? String(metadata.originalValue) : '',
      randomType: guessRandomDataType(fieldName, metadata?.type || ''),
      fieldName: fieldName
    };
    
    onFieldConfigChange(fieldName, {
      ...currentConfig,
      isStatic
    });
  };
  
  const handleStaticValueChange = (fieldName: string, value: string) => {
    const metadata = fields[fieldName];
    const currentConfig = fieldConfigs[fieldName] || { 
      type: metadata?.type || '', 
      isStatic: true,
      fieldName: fieldName
    };
    
    onFieldConfigChange(fieldName, {
      ...currentConfig,
      isStatic: true,
      staticValue: value
    });
  };
  
  const handleRandomTypeChange = (fieldName: string, randomType: RandomDataType) => {
    const currentConfig = fieldConfigs[fieldName] || { 
      type: '',
      isStatic: false,
      randomType: RandomDataType.Default,
      fieldName: fieldName
    };
    
    onFieldConfigChange(fieldName, {
      ...currentConfig,
      randomType
    });
  };

  // Helper function to generate sample values for arrays and objects
  const generateSampleValue = (fieldName: string, fieldType: string): string => {
    const name = fieldName.toLowerCase();
    
    if (fieldType === 'array' || /s$|list$|array$|items$|collection$|^additional/.test(name)) {
      if (name.includes('email')) {
        return JSON.stringify(['user1@example.com', 'user2@example.com']);
      } else if (name.includes('phone')) {
        return JSON.stringify(['555-123-4567', '555-987-6543']);
      } else if (name.includes('address')) {
        return JSON.stringify(['123 Main St', '456 Oak Ave']);
      } else if (name.includes('name')) {
        return JSON.stringify(['John Doe', 'Jane Smith']);
      } else {
        return JSON.stringify(['item1', 'item2']);
      }
    } else if (fieldType === 'object' || /^props|^options|^config|^settings|^attributes|^metadata|^data$/.test(name)) {
      if (name.includes('address')) {
        return JSON.stringify({
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zip: '12345'
        });
      } else if (name.includes('contact')) {
        return JSON.stringify({
          email: 'contact@example.com',
          phone: '555-123-4567'
        });
      } else {
        return JSON.stringify({ key: 'value' });
      }
    }
    return '';
  };

  // Helper function to automatically set appropriate static value
  const handleSetSampleValue = (fieldName: string, metadata: FieldMetadata) => {
    const sampleValue = generateSampleValue(fieldName, metadata.type);
    if (sampleValue) {
      handleStaticValueChange(fieldName, sampleValue);
    }
  };

  // Helper function to detect and highlight authorization tokens
  const formatHeaderValue = (key: string, value: string) => {
    if (key.toLowerCase() === 'authorization') {
      const parts = value.split(' ');
      if (parts.length === 2 && ['bearer', 'basic', 'token'].includes(parts[0].toLowerCase())) {
        return (
          <span className="flex items-center">
            <span className="font-medium text-primary-600 dark:text-primary-400">{parts[0]}</span>
            <span className="ml-1 text-xs bg-gray-100 dark:bg-gray-600 px-1 rounded-sm overflow-x-auto max-w-60 truncate" title={parts[1]}>
              {parts[1]}
            </span>
          </span>
        );
      }
    }
    return value;
  };

  const handleHeaderSave = (updatedHeaders: Record<string, string>) => {
    onUpdateHeaders(updatedHeaders);
    setShowHeaderEditor(false);
  };
  
  // Add a helper function to group fields by their parent properties
  const groupFieldsByParent = (fields: Record<string, FieldMetadata>) => {
    const groups: Record<string, Record<string, FieldMetadata>> = {
      '': {} // Root level fields
    };
    
    Object.entries(fields).forEach(([fieldName, metadata]) => {
      const parts = fieldName.split('.');
      if (parts.length === 1) {
        // Root level field
        groups[''][fieldName] = metadata;
      } else {
        // Get the top-level parent
        const topParent = parts[0];
        
        if (!groups[topParent]) {
          groups[topParent] = {};
        }
        
        if (parts.length === 2) {
          // Direct child of top parent
          groups[topParent][parts[1]] = metadata;
        } else {
          // Nested deeper, use dot notation for the rest
          const restOfPath = parts.slice(1).join('.');
          groups[topParent][restOfPath] = metadata;
        }
      }
    });
    
    return groups;
  };
  
  // Function to render the random data type options dropdown
  const renderRandomTypeOptions = () => {
    return Object.values(RandomDataType).map(type => {
      // Format the enum value for display (e.g., "firstName" -> "First Name")
      const displayName = type === RandomDataType.Default 
        ? "Auto Detect" 
        : type.replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase())
          .trim();
      
      return (
        <option key={type} value={type}>
          {displayName}
        </option>
      );
    });
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Data Generation Settings</h2>
        </div>
        
        <button
          onClick={handleToggleDetails}
          className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          {showDetails ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          <span className="sr-only">Show details</span>
        </button>
      </div>
      
      {/* Request details */}
      <div className="mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <label htmlFor="httpMethod" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Method:
            </label>
            <select
              id="httpMethod"
              value={method}
              onChange={handleMethodChange}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
              <option value="HEAD">HEAD</option>
              <option value="OPTIONS">OPTIONS</option>
            </select>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-sm text-gray-500 dark:text-gray-400">URL:</div>
            <div className="text-sm font-medium break-all">{parsedCurl.url}</div>
          </div>
        </div>
        
        {/* Headers display */}
        {Object.keys(parsedCurl.headers).length > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between">
              <div 
                className="flex items-center gap-1 cursor-pointer text-sm text-gray-700 dark:text-gray-300 mb-2"
                onClick={handleToggleDetails}
              >
                <List className="h-4 w-4" />
                <span className="font-medium">Headers ({Object.keys(parsedCurl.headers).length})</span>
              </div>
              <button
                onClick={() => setShowHeaderEditor(true)}
                className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors"
              >
                <Edit className="h-3 w-3" />
                <span>Edit Headers</span>
              </button>
            </div>
            
            {showDetails && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 text-sm max-h-60 overflow-y-auto">
                {Object.entries(parsedCurl.headers).map(([key, value]) => (
                  <div key={key} className="mb-1 last:mb-0">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{key}: </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {formatHeaderValue(key, value)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Show "Add Headers" button if no headers present */}
        {Object.keys(parsedCurl.headers).length === 0 && (
          <div className="mt-3">
            <button
              onClick={() => setShowHeaderEditor(true)}
              className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors"
            >
              <Edit className="h-4 w-4" />
              <span>Add Headers</span>
            </button>
          </div>
        )}

        {/* Header Editor Modal */}
        {showHeaderEditor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-2xl">
              <HeaderEditor 
                headers={parsedCurl.headers} 
                onSave={handleHeaderSave}
                onCancel={() => setShowHeaderEditor(false)} 
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Field configuration */}
      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-800 dark:text-white mb-3">Field Configuration</h3>
        
        <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto p-1">
          {Object.entries(groupFieldsByParent(fields)).map(([parentName, childFields]) => (
            <div key={parentName} className={parentName ? "border-t border-gray-200 dark:border-gray-700 pt-3 mt-3" : ""}>
              {parentName && (
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 bg-gray-100 dark:bg-gray-600 px-3 py-1.5 rounded">
                  {parentName} (Object)
                </div>
              )}
              
              {Object.entries(childFields).map(([fieldName, metadata]) => {
                const fullFieldName = parentName ? `${parentName}.${fieldName}` : fieldName;
                const config = fieldConfigs[fullFieldName] || { 
                  type: metadata.type, 
                  isStatic: true,
                  staticValue: metadata.originalValue !== undefined ? String(metadata.originalValue) : '',
                  randomType: guessRandomDataType(fieldName, metadata.type),
                  fieldName: fullFieldName
                };
                
                return (
                  <div key={fullFieldName} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div>
                        <div className="font-medium text-gray-800 dark:text-white">{fieldName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Type: {metadata.type}
                          {metadata.originalValue !== undefined && (
                            <span className="ml-2 text-primary-600 dark:text-primary-400">
                              Original: {String(metadata.originalValue)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <select
                        value={config.isStatic ? "static" : "random"}
                        onChange={(e) => handleFieldTypeChange(fullFieldName, e.target.value === "static")}
                        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="random">Random</option>
                        <option value="static">Static</option>
                      </select>
                    </div>
                    
                    {config.isStatic ? (
                      // Static value input field
                      <div className="mt-2">
                        {metadata.type === 'array' || /s$|list$|array$|items$|collection$|^additional/.test(fieldName.toLowerCase()) ? (
                          <>
                            <div className="flex justify-between items-center">
                              <div className="text-xs text-gray-500 mb-1">Array format: Enter JSON array or comma-separated values</div>
                              <button
                                onClick={() => handleSetSampleValue(fullFieldName, metadata)}
                                className="text-xs text-primary-600 hover:text-primary-700"
                                title="Generate sample array"
                              >
                                Generate sample
                              </button>
                            </div>
                            <textarea
                              placeholder='E.g., ["value1", "value2"] or value1, value2'
                              value={config.staticValue || ""}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleStaticValueChange(fullFieldName, e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </>
                        ) : metadata.type === 'object' || /^props|^options|^config|^settings|^attributes|^metadata|^data$/.test(fieldName.toLowerCase()) ? (
                          <>
                            <div className="flex justify-between items-center">
                              <div className="text-xs text-gray-500 mb-1">Object format: Enter valid JSON</div>
                              <button
                                onClick={() => handleSetSampleValue(fullFieldName, metadata)}
                                className="text-xs text-primary-600 hover:text-primary-700"
                                title="Generate sample object"
                              >
                                Generate sample
                              </button>
                            </div>
                            <textarea
                              placeholder='E.g., {"key": "value"}'
                              value={config.staticValue || ""}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleStaticValueChange(fullFieldName, e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </>
                        ) : (
                          <input
                            type="text"
                            placeholder="Static value"
                            value={config.staticValue || ""}
                            onChange={(e) => handleStaticValueChange(fullFieldName, e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        )}
                      </div>
                    ) : (
                      // Random data type selector
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-primary-500" />
                          <select
                            value={config.randomType || RandomDataType.Default}
                            onChange={(e) => handleRandomTypeChange(fullFieldName, e.target.value as RandomDataType)}
                            className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                          >
                            {renderRandomTypeOptions()}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      {/* API Testing */}
      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-800 dark:text-white mb-3">API Testing</h3>
        
        <div className="flex items-center mb-3">
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={runApiRequests}
              onChange={onToggleApiRequests}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            <span className="ms-3 text-sm font-medium text-gray-700 dark:text-gray-300">Run API requests</span>
          </label>
        </div>
        
        {runApiRequests && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
            <label htmlFor="expectedStatus" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Expected Status:
            </label>
            <input
              id="expectedStatus"
              type="number"
              min="100"
              max="599"
              value={expectedStatus}
              onChange={(e) => onExpectedStatusChange(parseInt(e.target.value) || 200)}
              className="w-24 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        )}
      </div>
      
      {/* Number of entries */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div className="font-medium text-gray-800 dark:text-white">Number of entries to generate:</div>
        <div className="flex items-center">
          <input
            type="number"
            min="1"
            max="1000"
            value={numberOfEntries}
            onChange={(e) => onChangeNumberOfEntries(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))}
            className="w-24 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">Maximum: 1000 entries</p>
      </div>
      
      {/* Generate button */}
      <div className="flex justify-end">
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-md
            ${isLoading 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800'
            }
            transition-colors duration-200
          `}
        >
          {isLoading ? (
            <>
              <RefreshIcon className="h-4 w-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              <span>Generate Data</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// RefreshIcon component for loading state
const RefreshIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 21h5v-5" />
  </svg>
);

export default DataGenerator;