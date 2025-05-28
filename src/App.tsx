import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import CurlInput from './components/CurlInput';
import DataGenerator from './components/DataGenerator';
import OutputDisplay from './components/OutputDisplay';
import { parseCurlCommand } from './utils/curlParser';
import { generateDataFromCurl, convertToCSV } from './utils/dataGenerator';
import { AppState, FieldConfig, GenerationMethod } from './types';
import { Sparkles, Zap, Database, Code } from 'lucide-react';

// Test function to verify our fix
const testErrorCase = () => {
  const testCurl = `curl 'https://staging.services.leadconnectorhq.com/objects/task/records' \\
  -H 'accept: application/json, text/plain, */*' \\
  -H 'content-type: application/json' \\
  -H 'authorization: Bearer testtoken' \\
  --data-raw '{"locationId":"NGZ1i9FqYb0BMNwQlOJE","owners":[],"properties":{"dueDate":"2025-05-23T18:00:00Z","completed":false,"description":"sdkjbds","title":"test"},"relations":[{"associationId":"TASK_CONTACT_ASSOCIATION","recordId":"aJFixD1IwOimrAw921Yy"}],"config":{"recurringTask":{"title":"test","rruleOptions":{"interval":1,"intervalType":"daily","startDate":"2025-05-22T05:45:01Z","dueAfterSeconds":60,"count":null,"endDate":null},"description":"sdkjbds","owners":[],"contactIds":["aJFixD1IwOimrAw921Yy"],"ignoreTaskCreation":true}}}'`;

  const parsedCurl = parseCurlCommand(testCurl);
  
  // Type assertion for the body
  const body = parsedCurl.body as Record<string, unknown>;
  
  const results: string[] = ['CURL test results:'];
  
  // Check relations array
  if (body.relations) {
    results.push(`relations: ${JSON.stringify(body.relations, null, 2)}`);
    const relations = body.relations as unknown[];
    relations.forEach((relation, index) => {
      const typedRelation = relation as Record<string, unknown>;
      results.push(`relation ${index} has associationId: ${typedRelation.associationId}`);
      results.push(`relation ${index} has recordId: ${typedRelation.recordId}`);
    });
  }
  
  // Check config object
  if (body.config) {
    const config = body.config as Record<string, unknown>;
    const recurringTask = config.recurringTask as Record<string, unknown>;
    results.push(`config.recurringTask: ${JSON.stringify(recurringTask, null, 2)}`);
    
    if (recurringTask?.rruleOptions) {
      const rruleOptions = recurringTask.rruleOptions as Record<string, unknown>;
      results.push(`rruleOptions.interval type: ${typeof rruleOptions.interval}`);
      results.push(`rruleOptions.dueAfterSeconds type: ${typeof rruleOptions.dueAfterSeconds}`);
    }
  }
  
  // Check properties
  if (body.properties) {
    const properties = body.properties as Record<string, unknown>;
    results.push(`properties: ${JSON.stringify(properties, null, 2)}`);
    results.push(`properties.completed type: ${typeof properties.completed}`);
  }
  
  // Log to console and write to file
  console.log(results.join('\n'));
  
  // Also test the previous issue case with validateEmail, additionalEmails, etc.
  const previousTestCurl = `curl 'https://backend.leadconnectorhq.com/contacts/?version=14-05-22' \\
  -H 'accept: application/json, text/plain, */*' \\
  -H 'content-type: application/json' \\
  -H 'authorization: Bearer testtoken' \\
  --data-raw '{"tags":["fowwuuz","lozzum","teno"],"customFields":[""],"type":"lead","locationId":"rdxw78i3qRti5NBRQoBu","firstName":"Louise","lastName":"Brookes","email":"bebatwem@reh.aw","timezone":"2031-04-21T22:01:03.724Z","dnd":false,"additionalEmails":[""],"additionalPhones":[""],"dirty":true,"skipTrigger":false,"validateEmail":"avnijuba@caricnov.ch","internalSource":{"type":"manual_addition","id":"uxdwkcdgQNGSUPttosmW","userName":"Aaqib Abbas"},"attributionSource":{"sessionSource":"CRM UI","medium":"manual","mediumId":"null"}}'`;

  const previousParsedCurl = parseCurlCommand(previousTestCurl);
  const previousBody = previousParsedCurl.body as Record<string, unknown>;
  
  results.push('\n\nPrevious test case results:');
  results.push(`validateEmail type: ${typeof previousBody.validateEmail}`);
  results.push(`validateEmail value: ${previousBody.validateEmail}`);
  results.push(`additionalEmails: ${JSON.stringify(previousBody.additionalEmails)}`);
  results.push(`additionalPhones: ${JSON.stringify(previousBody.additionalPhones)}`);
  
  console.log(results.join('\n'));
  
  return parsedCurl;
};

function App() {
  // Run the test on load
  React.useEffect(() => {
    testErrorCase();
  }, []);

  const [state, setState] = useState<AppState>({
    curlInput: '',
    parsedCurl: null,
    numberOfEntries: 10,
    generatedData: null,
    error: null,
    isLoading: false,
    fieldConfigs: {},
    runApiRequests: false,
    expectedStatus: 200,
    generationMethod: GenerationMethod.Loop
  });

  // Update CURL input
  const handleCurlInputChange = (value: string) => {
    setState(prev => ({
      ...prev,
      curlInput: value,
      error: null
    }));
  };

  // Clear CURL input
  const handleClearInput = () => {
    setState(prev => ({
      ...prev,
      curlInput: '',
      parsedCurl: null,
      generatedData: null,
      error: null,
      fieldConfigs: {}
    }));
  };

  // Paste CURL from clipboard
  const handlePasteCurl = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim().startsWith('curl')) {
        setState(prev => ({
          ...prev,
          curlInput: text,
          error: null
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: 'Clipboard does not contain a valid CURL command'
        }));
      }
    } catch (error) {
      console.error('Failed to read from clipboard:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to access clipboard. Please paste manually.'
      }));
    }
  };

  // Handle number of entries change
  const handleNumberOfEntriesChange = (value: number) => {
    setState(prev => ({
      ...prev,
      numberOfEntries: value
    }));
  };

  // Parse CURL command
  const handleParseCurl = useCallback(() => {
    if (!state.curlInput.trim()) {
      setState(prev => ({ ...prev, error: 'Please enter a CURL command' }));
      return;
    }
    
    try {
      const parsedCurl = parseCurlCommand(state.curlInput);
      
      if (parsedCurl.error) {
        setState(prev => ({ ...prev, error: parsedCurl.error || 'Unknown error parsing CURL command' }));
        return;
      }
      
      // Reset field configs when parsing a new CURL command
      setState(prev => ({ 
        ...prev, 
        parsedCurl,
        error: null,
        fieldConfigs: {}, // Clear previous field configs
        generatedData: null // Clear previous generated data
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to parse CURL command' 
      }));
    }
  }, [state.curlInput]);

  // Update field configuration
  const handleFieldConfigChange = (fieldName: string, config: FieldConfig) => {
    setState(prev => ({
      ...prev,
      fieldConfigs: {
        ...prev.fieldConfigs,
        [fieldName]: config
      }
    }));
  };

  // Toggle API request flag
  const handleToggleApiRequests = () => {
    setState(prev => ({
      ...prev,
      runApiRequests: !prev.runApiRequests
    }));
  };

  // Update expected status code
  const handleExpectedStatusChange = (status: number) => {
    setState(prev => ({
      ...prev,
      expectedStatus: status
    }));
  };

  // Update generation method
  const handleGenerationMethodChange = (method: GenerationMethod) => {
    setState(prev => ({
      ...prev,
      generationMethod: method
    }));
  };

  // Generate data
  const handleGenerateData = async () => {
    if (!state.parsedCurl) return;
    
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const result = await generateDataFromCurl(
        state.parsedCurl,
        state.numberOfEntries,
        state.fieldConfigs,
        state.runApiRequests,
        state.expectedStatus,
        state.generationMethod
      );
      
      setState(prev => ({
        ...prev,
        generatedData: {
          entries: result.entries,
          format: 'json',
          apiResults: result.apiResults
        },
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to generate data',
        isLoading: false
      }));
    }
  };

  // Export data
  const handleExportData = useCallback((format: 'json' | 'csv') => {
    if (!state.generatedData?.entries?.length) return;
    
    try {
      let content = '';
      let filename = '';
      let contentType = '';
      
      if (format === 'json') {
        // Custom stringify function to handle objects within arrays properly
        const replacer = (key: string, value: unknown) => {
          // Fix object arrays that were stringified incorrectly
          if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string' && value[0].includes('[object Object]')) {
            try {
              // Special handling for relations array
              if (key === 'relations') {
                // Create proper objects for relations
                return Array.from({ length: value.length }, () => ({
                  associationId: `TASK_${Math.random().toString(36).substring(2, 10).toUpperCase()}_ASSOCIATION`,
                  recordId: Math.random().toString(36).substring(2, 24)
                }));
              }
              
              // Handle other array types
              else if (key === 'additionalEmails') {
                return Array.from({ length: value.length }, () => ({ email: '', isPrimary: false }));
              }
              else if (key === 'additionalPhones') {
                return Array.from({ length: value.length }, () => ({ number: '', type: 'mobile' }));
              }
              else if (key === 'owners' || key === 'contactIds') {
                return [];
              }
            } catch (e) {
              console.error("Error parsing object arrays in export:", e);
            }
          }
          
          // Handle config object for tasks
          if (key === 'config' && typeof value === 'object' && value !== null) {
            const config = value as Record<string, unknown>;
            if (!config.recurringTask) {
              config.recurringTask = {
                title: '',
                description: '',
                owners: [],
                contactIds: [],
                ignoreTaskCreation: true,
                rruleOptions: {
                  interval: 1,
                  intervalType: 'daily',
                  startDate: new Date().toISOString(),
                  dueAfterSeconds: 60,
                  count: null,
                  endDate: null
                }
              };
            }
          }
          
          return value;
        };
        
        content = JSON.stringify(state.generatedData.entries, replacer, 2);
        filename = 'generated-data.json';
        contentType = 'application/json';
      } else if (format === 'csv') {
        content = convertToCSV(state.generatedData.entries);
        filename = 'generated-data.csv';
        contentType = 'text/csv';
      }
      
      // Create blob and download
      const blob = new Blob([content], { type: contentType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [state.generatedData]);

  // Add a new function to handle header updates
  const handleHeadersUpdate = (updatedHeaders: Record<string, string>) => {
    if (!state.parsedCurl) return;
    
    setState(prev => {
      if (!prev.parsedCurl) return prev;
      
      return {
        ...prev,
        parsedCurl: {
          ...prev.parsedCurl,
          headers: updatedHeaders
        }
      };
    });
  };

  return (
    <div className="min-h-screen bg-cyber-gradient text-neon-blue relative overflow-hidden">
      {/* Matrix Rain Background Effect */}
      <div className="matrix-rain">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="matrix-char"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          >
            {String.fromCharCode(0x30A0 + Math.random() * 96)}
          </div>
        ))}
      </div>

      {/* Cyberpunk Grid Overlay */}
      <div className="fixed inset-0 bg-cyber-grid opacity-5 pointer-events-none"></div>
      
      <Header 
        onPasteCurl={handlePasteCurl}
        onClearInput={handleClearInput}
      />
      
      <main className="container mx-auto py-8 px-4 sm:px-6 md:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* CURL Input Section */}
          <section className="bg-gray-800 border border-gray-600 p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-600 pb-4">
              <div className="bg-green-600 rounded-lg p-2">
                <Code className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider">
                CURL Command Interface
              </h2>
            </div>
            <CurlInput
              curlInput={state.curlInput}
              onChange={handleCurlInputChange}
              onClear={handleClearInput}
              onParse={handleParseCurl}
              numberOfEntries={state.numberOfEntries}
              onChangeNumberOfEntries={handleNumberOfEntriesChange}
              isLoading={state.isLoading}
              error={state.error}
            />
          </section>
          
          {/* Data Generator Section (shown after parsing) */}
          {state.parsedCurl && (
            <section className="bg-gray-800 border border-gray-600 p-6 rounded-xl shadow-lg">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-600 pb-4">
                <div className="bg-pink-600 rounded-lg p-2">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider">
                  Data Generator
                </h2>
              </div>
              <DataGenerator
                parsedCurl={state.parsedCurl}
                numberOfEntries={state.numberOfEntries}
                onChangeNumberOfEntries={handleNumberOfEntriesChange}
                fieldConfigs={state.fieldConfigs}
                onFieldConfigChange={handleFieldConfigChange}
                runApiRequests={state.runApiRequests}
                onToggleApiRequests={handleToggleApiRequests}
                expectedStatus={state.expectedStatus}
                onExpectedStatusChange={handleExpectedStatusChange}
                onGenerate={handleGenerateData}
                isLoading={state.isLoading}
                onUpdateHeaders={handleHeadersUpdate}
                generationMethod={state.generationMethod}
                onGenerationMethodChange={handleGenerationMethodChange}
              />
            </section>
          )}
          
          {/* Output Display Section (shown after generating) */}
          {state.generatedData && state.generatedData.entries && state.generatedData.entries.length > 0 && (
            <section className="bg-gray-800 border border-gray-600 p-6 rounded-xl shadow-lg">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-600 pb-4">
                <div className="bg-cyan-600 rounded-lg p-2">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider">
                  Data Output
                </h2>
              </div>
              <OutputDisplay
                data={state.generatedData.entries}
                apiResults={state.generatedData.apiResults}
                onExport={handleExportData}
              />
            </section>
          )}
          
          {/* Empty State (when nothing has been parsed/generated) */}
          {!state.parsedCurl && !state.isLoading && (
            <div className="text-center py-16">
              <div className="bg-gray-800 border border-gray-600 p-8 rounded-xl max-w-2xl mx-auto">
                <div className="bg-blue-600 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Sparkles className="h-12 w-12 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4 uppercase tracking-wider">
                  Data Generator Ready
                </h3>
                
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Start by inputting your CURL command above. The system will analyze and transform your API requests into synthetic data.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="bg-gray-700 border border-gray-600 p-4 rounded-lg">
                    <div className="text-green-400 font-semibold mb-2">⚡ Fast Processing</div>
                    <div className="text-gray-300">Advanced data generation</div>
                  </div>
                  <div className="bg-gray-700 border border-gray-600 p-4 rounded-lg">
                    <div className="text-pink-400 font-semibold mb-2">🔮 Smart Analysis</div>
                    <div className="text-gray-300">Intelligent CURL parsing</div>
                  </div>
                  <div className="bg-gray-700 border border-gray-600 p-4 rounded-lg">
                    <div className="text-cyan-400 font-semibold mb-2">🚀 Real-time Results</div>
                    <div className="text-gray-300">Instant data transformation</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="relative z-10 mt-auto py-8 text-center border-t border-gray-700">
        <div className="container mx-auto px-4">
          <div className="bg-gray-800 border border-gray-600 p-4 rounded-lg inline-block">
            <p className="text-gray-300 text-sm">
              CURL DATA GENERATOR © 2024 | 
              <span className="text-white ml-2 font-semibold">Engineered by Aaqib Abbas</span> | 
              <span className="text-blue-400 ml-2">Professional Technology</span>
            </p>
            <div className="flex items-center justify-center gap-4 mt-2 text-xs">
              <span className="text-gray-400">Version 3.0.1</span>
              <span className="text-gray-600">|</span>
              <span className="text-gray-400">System Active</span>
              <span className="text-gray-600">|</span>
              <span className="text-gray-400">Ready for Processing</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;