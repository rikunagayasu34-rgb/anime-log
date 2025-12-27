'use client';

import type { User } from '@supabase/supabase-js';

interface NavigationProps {
  activeTab: 'home' | 'discover' | 'collection' | 'profile';
  setActiveTab: (tab: 'home' | 'discover' | 'collection' | 'profile') => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDarkMode: boolean) => void;
  user: User | null;
  userName: string;
  userIcon: string;
  setShowSettings: (show: boolean) => void;
  setShowAuthModal: (show: boolean) => void;
}

export function Navigation({
  activeTab,
  setActiveTab,
  isDarkMode,
  setIsDarkMode,
  user,
  userName,
  userIcon,
  setShowSettings,
  setShowAuthModal,
}: NavigationProps) {
  return (
    <>
      {/* ヘッダー */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10 lg:ml-[200px]">
        <div className="max-w-md md:max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-black bg-linear-to-r from-[#ffc2d1] to-[#ffb07c] bg-clip-text text-transparent">
            アニメログ
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title={isDarkMode ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            {user ? (
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <span className="text-2xl">{userIcon}</span>
                <span className="font-bold text-sm dark:text-white">{userName}</span>
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-3 py-1.5 rounded-full bg-[#ffc2d1] hover:bg-[#ffb07c] text-white font-bold text-sm transition-colors"
              >
                ログイン
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ボトムナビゲーション（スマホ・タブレット） */}
      <nav className="block lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 z-10">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="flex justify-around items-center">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center justify-center py-2 px-4 rounded-lg transition-all ${
                activeTab === 'home'
                  ? 'text-[#ffc2d1] dark:text-[#ffc2d1]'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <span className={`text-2xl transition-transform ${activeTab === 'home' ? 'scale-110' : 'scale-100'}`}>
                📺
              </span>
              <span className="text-xs font-medium mt-1">ホーム</span>
            </button>
            
            <button
              onClick={() => setActiveTab('discover')}
              className={`flex flex-col items-center justify-center py-2 px-4 rounded-lg transition-all ${
                activeTab === 'discover'
                  ? 'text-[#ffc2d1] dark:text-[#ffc2d1]'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <span className={`text-2xl transition-transform ${activeTab === 'discover' ? 'scale-110' : 'scale-100'}`}>
                📊
              </span>
              <span className="text-xs font-medium mt-1">統計</span>
            </button>
            
            <button
              onClick={() => setActiveTab('collection')}
              className={`flex flex-col items-center justify-center py-2 px-4 rounded-lg transition-all ${
                activeTab === 'collection'
                  ? 'text-[#ffc2d1] dark:text-[#ffc2d1]'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <span className={`text-2xl transition-transform ${activeTab === 'collection' ? 'scale-110' : 'scale-100'}`}>
                🏆
              </span>
              <span className="text-xs font-medium mt-1">コレクション</span>
            </button>
            
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center justify-center py-2 px-4 rounded-lg transition-all ${
                activeTab === 'profile'
                  ? 'text-[#ffc2d1] dark:text-[#ffc2d1]'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <span className={`text-2xl transition-transform ${activeTab === 'profile' ? 'scale-110' : 'scale-100'}`}>
                👤
              </span>
              <span className="text-xs font-medium mt-1">マイページ</span>
            </button>
          </div>
        </div>
      </nav>

      {/* サイドバーナビゲーション（PC） */}
      <nav className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[200px] bg-white dark:bg-gray-800 border-r dark:border-gray-700 z-10 flex-col pt-20">
        <div className="flex flex-col gap-2 px-2">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-3 py-3 px-4 rounded-lg transition-all ${
              activeTab === 'home'
                ? 'bg-[#ffc2d1]/20 dark:bg-[#ffc2d1]/20 text-[#ffc2d1] dark:text-[#ffc2d1]'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span className="text-2xl">📺</span>
            <span className="font-medium">ホーム</span>
          </button>
          
          <button
            onClick={() => setActiveTab('discover')}
            className={`flex items-center gap-3 py-3 px-4 rounded-lg transition-all ${
              activeTab === 'discover'
                ? 'bg-[#ffc2d1]/20 dark:bg-[#ffc2d1]/20 text-[#ffc2d1] dark:text-[#ffc2d1]'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span className="text-2xl">📊</span>
            <span className="font-medium">統計</span>
          </button>
          
          <button
            onClick={() => setActiveTab('collection')}
            className={`flex items-center gap-3 py-3 px-4 rounded-lg transition-all ${
              activeTab === 'collection'
                ? 'bg-[#ffc2d1]/20 dark:bg-[#ffc2d1]/20 text-[#ffc2d1] dark:text-[#ffc2d1]'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span className="text-2xl">🏆</span>
            <span className="font-medium">コレクション</span>
          </button>
          
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 py-3 px-4 rounded-lg transition-all ${
              activeTab === 'profile'
                ? 'bg-[#ffc2d1]/20 dark:bg-[#ffc2d1]/20 text-[#ffc2d1] dark:text-[#ffc2d1]'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span className="text-2xl">👤</span>
            <span className="font-medium">マイページ</span>
          </button>
        </div>
      </nav>
    </>
  );
}

