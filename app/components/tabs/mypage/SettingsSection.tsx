'use client';

interface SettingsSectionProps {
  onOpenSettingsModal: () => void;
  handleLogout: () => void;
}

export default function SettingsSection({ onOpenSettingsModal, handleLogout }: SettingsSectionProps) {
  return (
    <section className="space-y-2">
      <h2 className="text-xl font-bold px-4 text-[#6b5b6e] dark:text-white font-mixed">⚙️ 設定</h2>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl divide-y divide-gray-200 dark:divide-gray-700 shadow-md">
        <button 
          onClick={onOpenSettingsModal}
          className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-[#6b5b6e] dark:text-white font-mixed"
        >
          プロフィール編集
        </button>
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLScfwMPJs8-qazTa9kfnDU6b4gqRLJVleDJkDgeCFDeuJjlxUQ/viewform"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors block text-[#6b5b6e] dark:text-white font-mixed"
        >
          ご意見・ご感想
        </a>
        <button 
          onClick={handleLogout}
          className="w-full px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors font-mixed"
        >
          ログアウト
        </button>
      </div>
    </section>
  );
}

