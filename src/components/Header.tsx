import React from 'react';
import { Database, Clipboard, Trash2, Code, Terminal, Activity, Zap } from 'lucide-react';

interface HeaderProps {
  onPasteCurl?: () => void;
  onClearInput?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onPasteCurl, onClearInput }) => {
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim().startsWith('curl')) {
        if (onPasteCurl) {
          onPasteCurl();
        }
      } else {
        alert('Clipboard does not contain a valid CURL command');
      }
    } catch (error) {
      console.error('Failed to read from clipboard:', error);
      alert('Failed to access clipboard. Please paste manually.');
    }
  };

  const handleClearInput = () => {
    if (onClearInput) {
      onClearInput();
    }
  };

  return (
    <header className="bg-gray-900 text-white py-6 px-4 sm:px-6 md:px-8 border-b border-gray-700">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Simple Title Section */}
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Database className="h-8 w-8 text-white" />
            </div>
            
            <div className="text-left">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                CURL DATA GENERATOR
              </h1>
              <p className="text-sm sm:text-base text-gray-300 mt-1">
                Professional API Testing & Data Generation Platform
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                <Terminal className="h-3 w-3" />
                <span>Enterprise-Grade CURL to JSON Converter</span>
              </div>
            </div>
          </div>
          
          {/* Simple Action Panel */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* CURL Actions */}
            <div className="bg-gray-800 border border-gray-600 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">CURL Operations</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-500">READY</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePasteFromClipboard}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded transition-colors duration-200"
                  title="Paste CURL command from clipboard"
                >
                  <div className="flex items-center gap-2">
                    <Clipboard className="h-3 w-3" />
                    <span>PASTE CURL</span>
                  </div>
                </button>
                
                <button
                  onClick={handleClearInput}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded transition-colors duration-200"
                  title="Clear input field"
                >
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-3 w-3" />
                    <span>CLEAR</span>
                  </div>
                </button>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-gray-800 border border-gray-600 p-4 rounded-lg min-w-[180px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">System Status</span>
                <Activity className="h-3 w-3 text-blue-500" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Processing</span>
                  <span className="text-green-500">Active</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Memory</span>
                  <span className="text-green-500">Optimal</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Network</span>
                  <span className="text-green-500">Stable</span>
                </div>
              </div>
            </div>

            {/* Creator Badge */}
            <div className="bg-gray-800 border border-gray-600 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-600 p-2 rounded-full">
                  <Code className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Developed By</div>
                  <div className="text-sm font-bold text-white">Aaqib Abbas</div>
                  <div className="text-xs text-gray-400">Full Stack Developer</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Simple Status Bar */}
        <div className="mt-4 pt-3 border-t border-gray-700">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-blue-500" />
                <span className="text-gray-300">Real-time Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-300">Data Generation Active</span>
              </div>
              <div className="flex items-center gap-2">
                <Terminal className="h-3 w-3 text-purple-500" />
                <span className="text-gray-300">API Testing Ready</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-gray-400">
              <span>v2.1.0</span>
              <span className="text-gray-600">|</span>
              <span>Build 2024.12.19</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;