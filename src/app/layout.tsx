import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '在别的城市要过上现在的生活，我tm到底要赚多少钱？',
  description: '城市生活成本与薪资水平计算器，快速估算不同城市之间的薪资差异',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark:bg-gray-900">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          // 检测系统暗色模式并应用
          (function() {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
            
            // 监听系统主题变化
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
              if (e.matches) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            });
          })();
        ` }} />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} dark:bg-gray-900 dark:text-gray-200`}>{children}</body>
    </html>
  );
}
