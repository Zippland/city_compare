'use client';

import Link from 'next/link';
import React from 'react';

export default function Custom404() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="p-8 max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-blue-500 mb-4">页面未找到</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          您请求的页面不存在或已被移动。
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
} 