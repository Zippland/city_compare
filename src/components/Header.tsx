import React from 'react';
import Image from 'next/image';

const Header: React.FC = () => {
  return (
    <header className="py-8 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900">
      <div className="container mx-auto px-4">
        <h1 className="text-center">
          <div className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 transform hover:scale-105 transition-transform duration-300">
            城市Offer薪资对比工具          
          </div>
          <div className="text-l md:text-l font-black text-red-500 dark:text-red-400 mt-3">
            在不同城市要过上同等生活水平的我到底需要多少钱？
          </div>
        </h1>
        
        {/* 联系方式 - 同一行 */}
        <div className="flex justify-center items-center mt-4 text-xs text-gray-600 dark:text-gray-400">
          <a 
            href="https://github.com/Zippland/city_compare" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <svg className="w-3.5 h-3.5 mr-1" viewBox="0 0 24 24">
              <path 
                fill="currentColor" 
                d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
              />
            </svg>
            GitHub
          </a>
          
          <div className="mx-2 dark:text-gray-500">|</div>
          
          <a 
            href="mailto:zylanjian@outlook.com" 
            className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <svg className="w-3.5 h-3.5 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            Email
          </a>
          
          <div className="mx-2 dark:text-gray-500">|</div>
          
          <a 
            href="https://www.xiaohongshu.com/user/profile/623e8b080000000010007721?xsec_token=YBdeHZTp_aVwi1Ijmras5CgSgVn-T1HN3-18kywqqmPZE%3D&xsec_source=app_share&xhsshare=CopyLink&appuid=623e8b080000000010007721&apptime=1742055526&share_id=5dde53ca3ec1478a8b408ed5b2310ed7&share_channel=copy_link" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <svg className="w-3.5 h-3.5 mr-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.2 6.6l-3.3-1.6V3.8c0-.7-.6-1.3-1.3-1.3H9.3C8.6 2.5 8 3.1 8 3.8V5l-3.3 1.6c-.5.3-.8.8-.8 1.4v5c0 .6.3 1.1.8 1.4l3.3 1.6v1.2c0 .7.6 1.3 1.3 1.3h5.3c.7 0 1.3-.6 1.3-1.3v-1.2l3.3-1.6c.5-.3.8-.8.8-1.4V8c0-.6-.3-1.1-.8-1.4zM12 13.5c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z"></path>
            </svg>
            小红书
          </a>
        </div>
        
        {/* 访问计数 - 下一行 */}
        <div className="flex justify-center items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="visit-counter">
            <Image 
              src="https://hits.sh/citycompare.zippland.com.svg?label=visitors&extraCount=402601&color=9f9f9f&labelColor=007ec6" 
              alt="访问计数" 
              width={100}
              height={20}
              unoptimized
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 