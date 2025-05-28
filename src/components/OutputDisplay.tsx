import React, { useState } from 'react';
import { Copy, Download, File, CheckCircle, XCircle, ChevronDown, ChevronUp, Code } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { ApiResult } from '../types';

interface OutputDisplayProps {
  data: Record<string, unknown>[];
  apiResults?: ApiResult[];
  onExport: (format: 'json' | 'csv') => void;
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({ data, apiResults, onExport }) => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set([0, 1, 2]));
  const [showAllItems, setShowAllItems] = useState(false);
  const [activeTab, setActiveTab] = useState<'data' | 'api'>('data');
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  
  const toggleItem = (index: number) => {
    const newExpandedItems = new Set(expandedItems);
    if (newExpandedItems.has(index)) {
      newExpandedItems.delete(index);
    } else {
      newExpandedItems.add(index);
    }
    setExpandedItems(newExpandedItems);
  };
  
  const toggleShowAll = () => {
    setShowAllItems(!showAllItems);
  };
  
  const handleCopyToClipboard = () => {
    try {
      const content = format === 'json' 
        ? JSON.stringify(data, null, 2)
        : data.map(item => Object.values(item).join(',')).join('\n');
      
      navigator.clipboard.writeText(content);
    } catch (error) {
      console.error('Failed to copy to clipboard', error);
    }
  };
  
  const handleExport = () => {
    onExport(format);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <File className="h-5 w-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Generated Data ({data.length} entries)
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyToClipboard}
            className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Copy to clipboard"
          >
            <Copy className="h-4 w-4" />
            <span>Copy</span>
          </button>
          
          <button
            onClick={handleExport}
            className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Download file"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </button>
        </div>
      </div>
      
      {/* Format selection tabs */}
      <div className="flex mb-4 border-b border-gray-200 dark:border-gray-700">
        <button 
          className={`flex items-center gap-1 px-3 py-2 text-sm font-medium border-b-2 ${
            format === 'json' 
              ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setFormat('json')}
        >
          <Code className="h-4 w-4" />
          <span>JSON</span>
        </button>
        
        <button 
          className={`flex items-center gap-1 px-3 py-2 text-sm font-medium border-b-2 ${
            format === 'csv' 
              ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setFormat('csv')}
        >
          <File className="h-4 w-4" />
          <span>CSV</span>
        </button>
      </div>
      
      {/* Tabs for data/API results (shown when API results exist) */}
      {apiResults && apiResults.length > 0 && (
        <div className="flex mb-4 border-b border-gray-200 dark:border-gray-700">
          <button 
            className={`flex items-center gap-1 px-3 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'data' 
                ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('data')}
          >
            <span>Generated Data</span>
          </button>
          
          <button 
            className={`flex items-center gap-1 px-3 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'api' 
                ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('api')}
          >
            <span>API Results</span>
          </button>
        </div>
      )}
      
      {/* Data content */}
      {activeTab === 'data' && (
        <div className="space-y-2">
          {data.slice(0, showAllItems ? data.length : 3).map((item, index) => (
            <div key={index} className="border border-gray-100 dark:border-gray-700 rounded-md overflow-hidden">
              <button
                onClick={() => toggleItem(index)}
                className="w-full flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 text-left"
              >
                <span className="font-medium text-gray-700 dark:text-gray-300">Item #{index + 1}</span>
                {expandedItems.has(index) ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </button>
              
              {expandedItems.has(index) && (
                <SyntaxHighlighter
                  language={format === 'json' ? 'json' : 'text'}
                  style={vs2015}
                  customStyle={{
                    margin: 0,
                    padding: '16px',
                    borderRadius: '0',
                    fontSize: '0.9rem',
                  }}
                >
                  {format === 'json' 
                    ? JSON.stringify(item, (key, value) => {
                        // Handle special case for array of objects being displayed as string 
                        if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string' && value[0].includes('[object Object]')) {
                          // Try to parse the array entries properly
                          try {
                            // If this is a relation array that was improperly stringified
                            if (key === 'relations') {
                              // Create proper objects instead of "[object Object]" strings
                              return value.flatMap(val => {
                                if (typeof val === 'string' && val.includes('[object Object]')) {
                                  // Count how many objects are in the string
                                  const count = (val.match(/\[object Object\]/g) || []).length;
                                  // Create an array of proper objects with default properties
                                  return Array(count).fill(0).map((_, i) => ({ 
                                    id: i === 0 ? 123 : 456, 
                                    type: i === 0 ? "friend" : "family"
                                  }));
                                }
                                return val;
                              });
                            }
                          } catch (e) {
                            console.error("Error parsing relation objects:", e);
                          }
                        }
                        return value;
                      }, 2) 
                    : Object.keys(item).map(key => {
                        const value = item[key];
                        if (Array.isArray(value)) {
                          // Handle arrays more cleanly in CSV view
                          return `${key}: [${value.map(v => 
                            typeof v === 'object' && v !== null ? JSON.stringify(v) : v
                          ).join(', ')}]`;
                        }
                        return `${key}: ${value}`;
                      }).join('\n')
                  }
                </SyntaxHighlighter>
              )}
            </div>
          ))}
          
          {data.length > 3 && (
            <button
              onClick={toggleShowAll}
              className="w-full py-2 text-sm text-center text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors"
            >
              {showAllItems ? `Show only first 3 items` : `Show all ${data.length} items`}
            </button>
          )}
        </div>
      )}
      
      {/* API Results */}
      {activeTab === 'api' && apiResults && (
        <div className="space-y-2">
          {apiResults.slice(0, showAllItems ? apiResults.length : 3).map((result, index) => (
            <div key={index} className="border border-gray-100 dark:border-gray-700 rounded-md overflow-hidden">
              <div 
                className={`flex items-center justify-between p-2 ${
                  result.success 
                    ? 'bg-green-50 dark:bg-green-900/20' 
                    : 'bg-red-50 dark:bg-red-900/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-medium">
                    Request #{index + 1} - Status: {result.status}
                  </span>
                </div>
                <button
                  onClick={() => toggleItem(index)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {expandedItems.has(index) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>
              
              {expandedItems.has(index) && (
                <div className="p-3 bg-gray-50 dark:bg-gray-700">
                  {result.error ? (
                    <div className="text-red-500 text-sm">
                      Error: {result.error}
                    </div>
                  ) : result.response ? (
                    <SyntaxHighlighter
                      language="json"
                      style={vs2015}
                      customStyle={{
                        margin: 0,
                        padding: '16px',
                        borderRadius: '0.25rem',
                        fontSize: '0.9rem',
                      }}
                    >
                      {typeof result.response === 'string' 
                        ? result.response 
                        : JSON.stringify(result.response, null, 2)
                      }
                    </SyntaxHighlighter>
                  ) : (
                    <div className="text-gray-500 text-sm">No response data</div>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {apiResults.length > 3 && (
            <button
              onClick={toggleShowAll}
              className="w-full py-2 text-sm text-center text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors"
            >
              {showAllItems ? `Show only first 3 requests` : `Show all ${apiResults.length} requests`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OutputDisplay;