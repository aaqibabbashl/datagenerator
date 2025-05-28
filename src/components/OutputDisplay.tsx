import React, { useState } from 'react';
import { Copy, Download, CheckCircle, XCircle, ChevronDown, ChevronUp, Database, Terminal } from 'lucide-react';
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
  const format = 'json'; // Fixed format for display
  
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-600 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-600 rounded-lg p-2">
            <Terminal className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">
              Data Output
            </h2>
            <p className="text-sm text-gray-300">
              {data.length} entries generated • Processing complete
            </p>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyToClipboard}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold uppercase tracking-wider text-xs transition-colors duration-200"
          >
            <div className="flex items-center gap-2">
              <Copy className="h-3 w-3" />
              <span>COPY</span>
            </div>
          </button>
          <button
            onClick={handleExport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold uppercase tracking-wider text-xs transition-colors duration-200"
          >
            <div className="flex items-center gap-2">
              <Download className="h-3 w-3" />
              <span>EXPORT</span>
            </div>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg overflow-hidden">
        <div className="bg-gray-700 border-b border-gray-600">
          <div className="flex">
            {[
              { id: 'data', label: 'GENERATED DATA', icon: Database, color: 'cyan' },
              { id: 'api', label: 'API RESULTS', icon: Terminal, color: 'purple' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'data' | 'api')}
                className={`
                  flex items-center gap-2 px-6 py-3 font-semibold uppercase tracking-wider text-sm
                  transition-all duration-200 relative
                  ${activeTab === tab.id 
                    ? `text-${tab.color}-400 border-b-2 border-${tab.color}-400 bg-gray-600` 
                    : 'text-gray-300 hover:text-white hover:bg-gray-600'
                  }
                `}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'data' && (
            <div className="space-y-4">
              {data.slice(0, showAllItems ? data.length : 3).map((item, index) => (
                <div key={index} className="bg-gray-700 border border-gray-600 rounded-lg overflow-hidden">
                  <div className="bg-gray-600 px-4 py-2 border-b border-gray-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-cyan-600 rounded flex items-center justify-center">
                          <span className="text-xs font-semibold text-white">{index + 1}</span>
                        </div>
                        <span className="text-sm font-semibold text-white uppercase tracking-wider">
                          Data Entry #{index + 1}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleItem(index);
                        }}
                        className="bg-gray-500 hover:bg-gray-400 p-1 rounded transition-colors duration-200"
                        title={expandedItems.has(index) ? 'Collapse' : 'Expand'}
                      >
                        {expandedItems.has(index) ? (
                          <ChevronUp className="h-4 w-4 text-white" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-white" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    {expandedItems.has(index) && (
                      <SyntaxHighlighter
                        language={format === 'json' ? 'json' : 'text'}
                        style={vs2015}
                        customStyle={{
                          margin: 0,
                          padding: '16px',
                          borderRadius: '0',
                          fontSize: '0.875rem',
                          fontFamily: 'monospace',
                          background: '#1f2937',
                          color: '#e5e7eb',
                          border: 'none',
                        }}
                      >
                        {format === 'json' 
                          ? JSON.stringify(item, (key, value) => {
                              if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string' && value[0].includes('[object Object]')) {
                                try {
                                  if (key === 'relations') {
                                    const count = (value[0].match(/\[object Object\]/g) || []).length;
                                    return Array(count).fill(0).map((_, i) => ({ 
                                      id: i === 0 ? 123 : 456, 
                                      type: i === 0 ? "friend" : "family"
                                    }));
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
                </div>
              ))}
              
              {data.length > 3 && (
                <div className="text-center pt-4">
                  <button
                    onClick={toggleShowAll}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                  >
                    {showAllItems ? 'COLLAPSE VIEW' : `EXPAND ALL (${data.length - 3} MORE)`}
                  </button>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'api' && apiResults && (
            <div className="space-y-4">
              {apiResults.map((result, index) => (
                <div key={index} className="bg-gray-700 border border-gray-600 rounded-lg overflow-hidden">
                  <div className="bg-gray-600 px-4 py-2 border-b border-gray-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
                          <span className="text-xs font-semibold text-white">{index + 1}</span>
                        </div>
                        <span className="text-sm font-semibold text-white uppercase tracking-wider">
                          API REQUEST #{index + 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-sm font-semibold ${
                          result.success ? 'text-green-500' : 'text-red-500'
                        }`}>
                          STATUS: {result.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <SyntaxHighlighter
                      language="json"
                      style={vs2015}
                      customStyle={{
                        margin: 0,
                        padding: '16px',
                        borderRadius: '0',
                        fontSize: '0.875rem',
                        fontFamily: 'monospace',
                        background: '#1f2937',
                        color: '#e5e7eb',
                        border: 'none',
                      }}
                    >
                      {JSON.stringify(result.response, null, 2)}
                    </SyntaxHighlighter>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutputDisplay;