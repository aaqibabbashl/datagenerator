import React, { useState, useEffect } from 'react';
import { Database, ChevronDown, ChevronUp, Play, List, Edit, Zap, Settings, Cpu, Network, Terminal, Layers } from 'lucide-react';
import { ParsedCurl, FieldConfig, FieldMetadata, RandomDataType, GenerationMethod } from '../types';
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
  generationMethod: GenerationMethod;
  onGenerationMethodChange: (method: GenerationMethod) => void;
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
  onUpdateHeaders,
  generationMethod,
  onGenerationMethodChange
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

  const handleHeaderSave = (updatedHeaders: Record<string, string>) => {
    onUpdateHeaders(updatedHeaders);
    setShowHeaderEditor(false);
  };
  
  // Add a helper function to group fields by their parent properties
  const groupFieldsByParent = (fields: Record<string, FieldMetadata>) => {
    const grouped: Record<string, Record<string, FieldMetadata>> = {};
    
    Object.entries(fields).forEach(([fieldName, metadata]) => {
      const parts = fieldName.split('.');
      if (parts.length > 1) {
        const parent = parts[0];
        const child = parts.slice(1).join('.');
        
        if (!grouped[parent]) {
          grouped[parent] = {};
        }
        grouped[parent][child] = metadata;
      } else {
        if (!grouped['_root']) {
          grouped['_root'] = {};
        }
        grouped['_root'][fieldName] = metadata;
      }
    });
    
    return grouped;
  };
  
  // Function to render the random data type options dropdown
  const renderRandomTypeOptions = () => {
    return Object.values(RandomDataType).map(type => (
      <option key={type} value={type}>
        {type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1')}
      </option>
    ));
  };

  const groupedFields = groupFieldsByParent(fields);

  return (
    <div className="cyber-card bg-gradient-to-br from-dark-800/90 to-dark-900/90 backdrop-blur-sm border border-neon-purple/30 rounded-lg shadow-2xl shadow-neon-purple/20 p-6 animate-fadeIn relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/5 to-neon-pink/5 animate-pulse"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan animate-dataFlow"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Cpu className="h-6 w-6 text-neon-purple animate-neonGlow" />
              <div className="absolute inset-0 bg-neon-purple/20 rounded-full blur-md animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent font-orbitron">
                NEURAL DATA GENERATOR
              </h2>
              <p className="text-sm text-neon-purple/70 font-rajdhani">
                Advanced field configuration • AI-powered generation
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHeaderEditor(!showHeaderEditor)}
              className="cyber-button flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-neon-cyan/20 to-neon-cyan/10 border border-neon-cyan/50 rounded-lg text-neon-cyan hover:from-neon-cyan/30 hover:to-neon-cyan/20 hover:border-neon-cyan transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/30 group"
              title="Configure headers"
            >
              <Settings className="h-4 w-4 group-hover:animate-spin" />
              <span className="font-rajdhani font-medium">HEADERS</span>
            </button>
            
            <button
              onClick={handleToggleDetails}
              className="cyber-button flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-neon-purple/20 to-neon-purple/10 border border-neon-purple/50 rounded-lg text-neon-purple hover:from-neon-purple/30 hover:to-neon-purple/20 hover:border-neon-purple transition-all duration-300 hover:shadow-lg hover:shadow-neon-purple/30 group"
              title="Toggle field details"
            >
              <List className="h-4 w-4" />
              <span className="font-rajdhani font-medium">
                {showDetails ? 'HIDE DETAILS' : 'SHOW DETAILS'}
              </span>
              {showDetails ? (
                <ChevronUp className="h-4 w-4 group-hover:animate-bounce" />
              ) : (
                <ChevronDown className="h-4 w-4 group-hover:animate-bounce" />
              )}
            </button>
          </div>
        </div>

        {/* Header Editor */}
        {showHeaderEditor && (
          <div className="mb-6">
            <HeaderEditor
              headers={parsedCurl.headers}
              onSave={handleHeaderSave}
              onCancel={() => setShowHeaderEditor(false)}
            />
          </div>
        )}

        {/* Configuration Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* Number of Entries */}
          <div className="cyber-card bg-gradient-to-br from-neon-cyan/10 to-neon-cyan/5 border border-neon-cyan/30 rounded-lg p-4">
            <label className="block text-sm font-medium text-neon-cyan mb-2 font-rajdhani">
              <Database className="inline h-4 w-4 mr-2" />
              DATA ENTRIES
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              value={numberOfEntries}
              onChange={(e) => onChangeNumberOfEntries(parseInt(e.target.value) || 1)}
              className="cyber-input w-full px-3 py-2 bg-dark-800/50 border border-neon-cyan/30 rounded-md text-neon-cyan placeholder-neon-cyan/50 focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan font-fira-code"
              placeholder="Enter count..."
            />
          </div>

          {/* HTTP Method */}
          <div className="cyber-card bg-gradient-to-br from-neon-purple/10 to-neon-purple/5 border border-neon-purple/30 rounded-lg p-4">
            <label className="block text-sm font-medium text-neon-purple mb-2 font-rajdhani">
              <Network className="inline h-4 w-4 mr-2" />
              HTTP METHOD
            </label>
            <select
              value={method}
              onChange={handleMethodChange}
              className="cyber-input w-full px-3 py-2 bg-dark-800/50 border border-neon-purple/30 rounded-md text-neon-purple focus:outline-none focus:ring-2 focus:ring-neon-purple/50 focus:border-neon-purple font-fira-code"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          {/* Generation Method */}
          <div className="cyber-card bg-gradient-to-br from-neon-yellow/10 to-neon-yellow/5 border border-neon-yellow/30 rounded-lg p-4">
            <label className="block text-sm font-medium text-neon-yellow mb-2 font-rajdhani">
              <Layers className="inline h-4 w-4 mr-2" />
              GENERATION METHOD
            </label>
            <select
              value={generationMethod}
              onChange={(e) => onGenerationMethodChange(e.target.value as GenerationMethod)}
              className="cyber-input w-full px-3 py-2 bg-dark-800/50 border border-neon-yellow/30 rounded-md text-neon-yellow focus:outline-none focus:ring-2 focus:ring-neon-yellow/50 focus:border-neon-yellow font-fira-code"
            >
              <option value={GenerationMethod.Loop}>Sequential Loop</option>
              <option value={GenerationMethod.ParallelPromises}>Parallel Promises</option>
            </select>
            <div className="text-xs text-neon-yellow/60 mt-1 font-rajdhani">
              {generationMethod === GenerationMethod.Loop ? 'Slower, less memory' : 'Faster, more memory'}
            </div>
          </div>

          {/* API Testing */}
          <div className="cyber-card bg-gradient-to-br from-neon-pink/10 to-neon-pink/5 border border-neon-pink/30 rounded-lg p-4">
            <label className="block text-sm font-medium text-neon-pink mb-2 font-rajdhani">
              <Terminal className="inline h-4 w-4 mr-2" />
              API TESTING
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={runApiRequests}
                  onChange={onToggleApiRequests}
                  className="w-4 h-4 text-neon-pink bg-dark-800 border-neon-pink/30 rounded focus:ring-neon-pink/50 focus:ring-2"
                />
                <span className="text-sm text-neon-pink font-rajdhani">Enable</span>
              </label>
              {runApiRequests && (
                <input
                  type="number"
                  min="200"
                  max="599"
                  value={expectedStatus}
                  onChange={(e) => onExpectedStatusChange(parseInt(e.target.value) || 200)}
                  className="cyber-input flex-1 px-2 py-1 bg-dark-800/50 border border-neon-pink/30 rounded text-neon-pink placeholder-neon-pink/50 focus:outline-none focus:ring-1 focus:ring-neon-pink/50 font-fira-code text-sm"
                  placeholder="Status"
                />
              )}
            </div>
          </div>
        </div>

        {/* Field Configuration */}
        {showDetails && Object.keys(fields).length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <Edit className="h-5 w-5 text-neon-cyan animate-neonGlow" />
                <div className="absolute inset-0 bg-neon-cyan/20 rounded-full blur-md animate-pulse"></div>
              </div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent font-orbitron">
                FIELD CONFIGURATION MATRIX
              </h3>
            </div>
            
            <div className="space-y-4">
              {Object.entries(groupedFields).map(([groupName, groupFields]) => (
                <div key={groupName} className="cyber-card bg-gradient-to-br from-dark-800/50 to-dark-900/50 border border-neon-cyan/20 rounded-lg p-4">
                  {groupName !== '_root' && (
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neon-cyan/20">
                      <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse"></div>
                      <h4 className="font-medium text-neon-cyan font-rajdhani uppercase tracking-wide">
                        {groupName} Object
                      </h4>
                    </div>
                  )}
                  
                  <div className="grid gap-4">
                    {Object.entries(groupFields).map(([fieldName, metadata]) => {
                      const fullFieldName = groupName === '_root' ? fieldName : `${groupName}.${fieldName}`;
                      const config = fieldConfigs[fullFieldName];
                      
                      return (
                        <div key={fullFieldName} className="grid grid-cols-1 lg:grid-cols-4 gap-3 p-3 bg-gradient-to-r from-neon-cyan/5 to-neon-purple/5 rounded-lg border border-neon-cyan/10">
                          {/* Field Name */}
                          <div className="lg:col-span-1">
                            <label className="block text-sm font-medium text-neon-cyan mb-1 font-rajdhani">
                              FIELD NAME
                            </label>
                            <div className="text-sm text-neon-cyan/80 font-fira-code bg-dark-800/30 px-2 py-1 rounded border border-neon-cyan/20">
                              {fieldName}
                            </div>
                            <div className="text-xs text-neon-cyan/60 mt-1 font-rajdhani">
                              Type: {metadata.type}
                            </div>
                          </div>

                          {/* Value Type Toggle */}
                          <div className="lg:col-span-1">
                            <label className="block text-sm font-medium text-neon-purple mb-1 font-rajdhani">
                              VALUE TYPE
                            </label>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleFieldTypeChange(fullFieldName, true)}
                                className={`flex-1 px-3 py-1 text-xs rounded transition-all duration-300 font-rajdhani font-medium ${
                                  config?.isStatic
                                    ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50'
                                    : 'bg-dark-800/50 text-gray-400 border border-gray-600/30 hover:border-neon-cyan/30'
                                }`}
                              >
                                STATIC
                              </button>
                              <button
                                onClick={() => handleFieldTypeChange(fullFieldName, false)}
                                className={`flex-1 px-3 py-1 text-xs rounded transition-all duration-300 font-rajdhani font-medium ${
                                  !config?.isStatic
                                    ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/50'
                                    : 'bg-dark-800/50 text-gray-400 border border-gray-600/30 hover:border-neon-purple/30'
                                }`}
                              >
                                RANDOM
                              </button>
                            </div>
                          </div>

                          {/* Value Configuration */}
                          <div className="lg:col-span-2">
                            {config?.isStatic ? (
                              <div>
                                <label className="block text-sm font-medium text-neon-cyan mb-1 font-rajdhani">
                                  STATIC VALUE
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={config.staticValue || ''}
                                    onChange={(e) => handleStaticValueChange(fullFieldName, e.target.value)}
                                    className="cyber-input flex-1 px-3 py-1 bg-dark-800/50 border border-neon-cyan/30 rounded text-neon-cyan placeholder-neon-cyan/50 focus:outline-none focus:ring-1 focus:ring-neon-cyan/50 font-fira-code text-sm"
                                    placeholder="Enter static value..."
                                  />
                                  {(metadata.type === 'array' || metadata.type === 'object') && (
                                    <button
                                      onClick={() => handleSetSampleValue(fullFieldName, metadata)}
                                      className="cyber-button px-3 py-1 bg-gradient-to-r from-neon-purple/20 to-neon-purple/10 border border-neon-purple/50 rounded text-neon-purple hover:from-neon-purple/30 hover:to-neon-purple/20 text-xs font-rajdhani font-medium"
                                      title="Set sample value"
                                    >
                                      SAMPLE
                                    </button>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <label className="block text-sm font-medium text-neon-purple mb-1 font-rajdhani">
                                  RANDOM TYPE
                                </label>
                                <select
                                  value={config?.randomType || RandomDataType.Default}
                                  onChange={(e) => handleRandomTypeChange(fullFieldName, e.target.value as RandomDataType)}
                                  className="cyber-input w-full px-3 py-1 bg-dark-800/50 border border-neon-purple/30 rounded text-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple/50 font-fira-code text-sm"
                                >
                                  {renderRandomTypeOptions()}
                                </select>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="text-center">
          <button
            onClick={onGenerate}
            disabled={isLoading}
            className={`cyber-button inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-neon-green/20 to-neon-cyan/20 border-2 border-neon-green/50 rounded-lg text-neon-green hover:from-neon-green/30 hover:to-neon-cyan/30 hover:border-neon-green transition-all duration-300 hover:shadow-xl hover:shadow-neon-green/30 font-orbitron font-bold text-lg group ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <RefreshIcon className="h-6 w-6 animate-spin" />
                <span>PROCESSING...</span>
              </>
            ) : (
              <>
                <Play className="h-6 w-6 group-hover:animate-pulse" />
                <span>GENERATE DATA</span>
                <Zap className="h-4 w-4 group-hover:animate-bounce" />
              </>
            )}
          </button>
        </div>
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