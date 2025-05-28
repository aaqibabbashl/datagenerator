import React from 'react';
import { Database, RefreshCcw } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-primary-600 to-accent-600 text-white py-6 px-4 sm:px-6 md:px-8">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-8 w-8" />
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
                CURL Dummy Data Generator
              </h1>
              <p className="text-sm sm:text-base text-white/80">
                Transform your CURL requests into realistic dummy data
              </p>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <RefreshCcw className="h-4 w-4 animate-spin" />
            <span>Building better test data</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;