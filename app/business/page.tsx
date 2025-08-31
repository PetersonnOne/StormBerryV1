'use client';

import React from 'react';

const BusinessPage = () => {
  return (
    <>
      {/* Header Banner with Swapped Gradients */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 rounded-2xl mx-6 mt-6 p-8 text-white">
        <h1 className="text-4xl font-bold mb-4">Welcome to the Business & Productivity Module!</h1>
        <p className="text-xl mb-6 opacity-90">
          Streamline your workflow and enhance your productivity with our AI-powered tools.
        </p>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span className="text-sm">All systems operational</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span className="text-sm">Fast performance</span>
          </div>
        </div>
      </div>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8">
        {/* Add Business & Productivity specific content here */}
      </div>
    </>
  );
};

export default BusinessPage;