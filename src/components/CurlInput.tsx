import React from 'react';
import { Terminal, Trash, ArrowRight } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface CurlInputProps {
  curlInput: string;
  numberOfEntries: number;
  onChange: (value: string) => void;
  onChangeNumberOfEntries: (value: number) => void;
  onClear: () => void;
  onParse: () => void;
  isLoading: boolean;
  error: string | null;
}

const CurlInput: React.FC<CurlInputProps> = ({
  curlInput,
  numberOfEntries,
  onChange,
  onChangeNumberOfEntries,
  onClear,
  onParse,
  isLoading,
  error
}) => {
  // Example CURL commands for demo
  const examples = [
    'curl -X POST https://api.example.com/users -H "Content-Type: application/json" -d \'{"name": "John Doe", "email": "john@example.com", "age": 30}\'',
    'curl -X POST https://api.example.com/products -H "Content-Type: application/json" -d \'{"productName": "Smartphone", "price": 999.99, "description": "Latest model", "available": true, "category": "Electronics"}\'',
  ];

  const handleExample = (example: string) => {
    onChange(example);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">CURL Command</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onClear}
            className="p-2 text-gray-500 hover:text-error-500 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Clear input"
          >
            <Trash className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* CURL input area */}
      <div className="mb-4 relative">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <SyntaxHighlighter
            language="bash"
            style={vs2015}
            customStyle={{
              margin: 0,
              padding: '16px',
              borderRadius: '0.5rem',
              fontSize: '0.9rem',
              minHeight: '120px',
              maxHeight: '300px',
              overflowY: 'auto',
              fontFamily: 'monospace',
            }}
          >
            {curlInput || '# Paste your CURL command here'}
          </SyntaxHighlighter>
          <textarea
            value={curlInput}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste your CURL command here..."
            className="absolute top-0 left-0 w-full h-full opacity-0 resize-none"
            style={{ minHeight: '120px' }}
          />
        </div>
      </div>
      
      {/* Number of entries */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <label htmlFor="numberOfEntries" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Number of entries to generate:
          </label>
          <div className="flex items-center">
            <input
              id="numberOfEntries"
              type="number"
              min="1"
              max="1000"
              value={numberOfEntries}
              onChange={(e) => onChangeNumberOfEntries(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))}
              className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Maximum: 1000 entries</p>
      </div>
      
      {/* Examples */}
      <div className="mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Examples:</p>
        <div className="flex flex-col gap-2">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExample(example)}
              className="text-left text-xs p-2 border border-gray-100 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 truncate overflow-hidden"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-error-500/10 text-error-500 rounded-md text-sm">
          <p className="font-medium">Error processing CURL command:</p>
          <p>{error}</p>
        </div>
      )}
      
      {/* Parse button */}
      <div className="flex justify-end">
        <button
          onClick={onParse}
          disabled={isLoading || !curlInput.trim()}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-md
            ${isLoading || !curlInput.trim() 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800'
            }
            transition-colors duration-200
          `}
        >
          {isLoading ? (
            <>
              <RefreshIcon className="h-4 w-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <ArrowRight className="h-4 w-4" />
              <span>Parse CURL</span>
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

export default CurlInput;