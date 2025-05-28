import React from 'react';
import { Terminal, Trash, ArrowRight, Code2, Clipboard } from 'lucide-react';

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
    'curl -X POST https://api.nexus.com/users -H "Content-Type: application/json" -H "Authorization: Bearer token123" -d \'{"name":"John Doe","email":"john@example.com","age":30}\'',
    'curl -X GET https://api.nexus.com/products?category=electronics&limit=10 -H "Accept: application/json"',
    'curl -X PUT https://api.nexus.com/orders/123 -H "Content-Type: application/json" -d \'{"status":"shipped","tracking":"ABC123"}\''
  ];

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim().startsWith('curl')) {
        onChange(text.trim());
      } else {
        alert('Clipboard does not contain a valid CURL command');
      }
    } catch (error) {
      console.error('Failed to read from clipboard:', error);
      alert('Failed to access clipboard. Please paste manually.');
    }
  };

  const handleExampleClick = (example: string) => {
    onChange(example);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="cyber-card bg-dark-900/80 border-neon-cyan shadow-neon-cyan p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Terminal className="h-5 w-5 text-neon-cyan animate-neonGlow" />
            <h3 className="font-orbitron font-bold text-neon-cyan neon-text">
              NEURAL COMMAND PROCESSOR
            </h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePasteFromClipboard}
              className="cyber-button bg-neon-green/10 border-neon-green text-neon-green hover:bg-neon-green/20 px-3 py-1 text-xs"
              title="Paste CURL from clipboard"
            >
              <Clipboard className="h-3 w-3" />
            </button>
            
            <button
              onClick={onClear}
              className="cyber-button bg-neon-pink/10 border-neon-pink text-neon-pink hover:bg-neon-pink/20 px-3 py-1 text-xs"
              title="Clear input"
            >
              <Trash className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Input Section */}
      <div className="cyber-card bg-dark-900/90 border-neon-cyan shadow-neon-cyan p-6">
        <div className="space-y-4">
          {/* Input Area */}
          <div className="relative">
            <div className="flex items-center space-x-2 mb-3">
              <Code2 className="h-4 w-4 text-neon-cyan animate-neonPulse" />
              <label className="text-sm font-orbitron font-bold text-neon-cyan">
                CURL COMMAND INPUT
              </label>
              <button
                onClick={handlePasteFromClipboard}
                className="cyber-button bg-neon-cyan/10 border-neon-cyan text-neon-cyan hover:bg-neon-cyan/20 px-2 py-1 text-xs ml-auto"
              >
                <Clipboard className="h-3 w-3 mr-1" />
                PASTE CURL
              </button>
            </div>
            
            <textarea
              value={curlInput}
              onChange={(e) => onChange(e.target.value)}
              placeholder="curl -X POST https://api.example.com/endpoint -H Content-Type:application/json -d data"
              className="cyber-input w-full h-32 resize-none font-fira-code text-sm bg-dark-800/90 border-2 border-neon-cyan/50 focus:border-neon-cyan text-neon-cyan placeholder-neon-cyan/40"
              style={{
                background: 'rgba(17, 17, 17, 0.95)',
                boxShadow: '0 0 15px rgba(0, 255, 255, 0.2), inset 0 0 15px rgba(0, 255, 255, 0.05)',
              }}
            />
            
            {/* Animated cursor effect */}
            <div className="absolute bottom-2 right-2">
              <div className="w-2 h-4 bg-neon-cyan animate-blink"></div>
            </div>
          </div>

          {/* Configuration Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="cyber-card bg-dark-800/50 border-neon-green shadow-neon-green p-4">
              <label className="block text-sm font-orbitron font-bold text-neon-green mb-2">
                DATA ENTRIES
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={numberOfEntries}
                onChange={(e) => onChangeNumberOfEntries(parseInt(e.target.value) || 1)}
                className="cyber-input w-full bg-dark-700/90 border-neon-green text-neon-green"
              />
            </div>

            <div className="cyber-card bg-dark-800/50 border-neon-purple shadow-neon-purple p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-orbitron font-bold text-neon-purple">
                  PROCESSING STATUS
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-neon-yellow animate-neonPulse' : 'bg-neon-green animate-neonGlow'}`}></div>
                <span className="text-xs font-fira-code text-neon-cyan">
                  {isLoading ? 'PROCESSING...' : 'READY FOR INPUT'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <button
              onClick={onParse}
              disabled={!curlInput.trim() || isLoading}
              className="cyber-button bg-neon-cyan/10 border-neon-cyan text-neon-cyan hover:bg-neon-cyan/20 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3 text-lg font-orbitron font-bold"
            >
              <div className="flex items-center space-x-3">
                <ArrowRight className="h-5 w-5 animate-neonGlow" />
                <span>{isLoading ? 'INITIALIZING...' : 'INITIALIZE PARSING'}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Neural Templates Section */}
      <div className="cyber-card bg-dark-900/80 border-neon-yellow shadow-neon-yellow p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Terminal className="h-5 w-5 text-neon-yellow animate-neonPulse" />
          <h3 className="font-orbitron font-bold text-neon-yellow neon-text">
            NEURAL TEMPLATES
          </h3>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
              className="cyber-card bg-dark-800/50 border-neon-blue/50 hover:border-neon-blue shadow-neon-blue/50 hover:shadow-neon-blue p-3 text-left transition-all duration-300 group"
            >
              <div className="flex items-start space-x-3">
                <div className="cyber-card bg-dark-700/80 border-neon-blue p-2 mt-1">
                  <span className="text-xs font-orbitron font-bold text-neon-blue">
                    T{index + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-fira-code text-neon-cyan/80 group-hover:text-neon-cyan transition-colors duration-300 break-all">
                    {example.length > 100 ? `${example.substring(0, 100)}...` : example}
                  </div>
                  <div className="text-xs text-neon-blue/60 mt-1 font-rajdhani">
                    {index === 0 && 'POST Request with JSON payload'}
                    {index === 1 && 'GET Request with query parameters'}
                    {index === 2 && 'PUT Request for data updates'}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="cyber-card bg-dark-900/90 border-neon-pink shadow-neon-pink p-4">
          <div className="flex items-center space-x-3">
            <div className="cyber-card bg-neon-pink/20 border-neon-pink p-2">
              <Terminal className="h-4 w-4 text-neon-pink animate-neonFlicker" />
            </div>
            <div>
              <h4 className="font-orbitron font-bold text-neon-pink mb-1">
                SYSTEM ERROR DETECTED
              </h4>
              <p className="text-sm font-fira-code text-neon-pink/80">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurlInput; 