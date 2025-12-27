'use client';

import type { User } from '@supabase/supabase-js';
import type { UserProfile } from '../../lib/supabase';
import { getMyProfile } from '../../lib/supabase';

export function SettingsModal({
  show,
  onClose,
  userName,
  setUserName,
  userIcon,
  setUserIcon,
  userHandle,
  setUserHandle,
  isProfilePublic,
  setIsProfilePublic,
  userBio,
  setUserBio,
  user,
  upsertUserProfile,
  setMyProfile,
}: {
  show: boolean;
  onClose: () => void;
  userName: string;
  setUserName: (name: string) => void;
  userIcon: string;
  setUserIcon: (icon: string) => void;
  userHandle: string;
  setUserHandle: (handle: string) => void;
  isProfilePublic: boolean;
  setIsProfilePublic: (isPublic: boolean) => void;
  userBio: string;
  setUserBio: (bio: string) => void;
  user: User | null;
  upsertUserProfile: (profile: { username: string; handle?: string | null; bio?: string; is_public?: boolean }) => Promise<boolean>;
  setMyProfile: (profile: UserProfile | null) => void;
}) {
  if (!show) return null;

  const handleSave = async () => {
    // プロフィール情報を保存
    if (user) {
      try {
        const success = await upsertUserProfile({
          username: userName,
          handle: userHandle || null,
          bio: userBio,
          is_public: isProfilePublic,
        });
        
        if (!success) {
          alert('プロフィールの保存に失敗しました。コンソールを確認してください。');
          return;
        }
        
        // プロフィールを再読み込み
        const profile = await getMyProfile();
        if (profile) {
          setMyProfile(profile);
          setUserHandle(profile.handle || '');
        }
        
        // localStorageに保存
        localStorage.setItem('userName', userName);
        localStorage.setItem('userIcon', userIcon);
        onClose();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'プロフィールの保存に失敗しました';
        alert(errorMessage);
        console.error('Save error:', error);
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 w-full max-w-md ml-auto h-full shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold dark:text-white">プロフィール編集</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>
          
          {/* アイコン選択（画像アップロードのみ） */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              プロフィール画像
            </label>
            <div className="space-y-3">
              {/* 現在のアイコン表示 */}
              <div className="flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                  {userIcon && (userIcon.startsWith('http://') || userIcon.startsWith('https://') || userIcon.startsWith('data:')) ? (
                    <img
                      src={userIcon}
                      alt="アイコン"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <span className="text-2xl text-gray-400">👤</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 画像アップロード */}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const result = event.target?.result;
                        if (typeof result === 'string') {
                          setUserIcon(result);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e879d4] dark:bg-gray-700 dark:text-white text-sm"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  画像ファイルを選択してください（JPG、PNG、GIFなど）
                </p>
              </div>
            </div>
          </div>

          {/* ユーザー名入力 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ユーザー名
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e879d4] dark:bg-gray-700 dark:text-white"
              placeholder="ユーザー名を入力"
            />
          </div>

          {/* ハンドル入力 */}
          {user && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                @ハンドル
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400">@</span>
                <input
                  type="text"
                  inputMode="text"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  value={userHandle}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
                    setUserHandle(value);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e879d4] dark:bg-gray-700 dark:text-white"
                  placeholder="handle"
                  maxLength={30}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                英数字、アンダースコア(_)のみ使用可能。他のユーザーから検索される際に使用されます。
              </p>
            </div>
          )}
          
          {/* プロフィール公開設定 */}
          {user && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                プロフィールを公開
              </label>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <span className="text-sm dark:text-white">
                  {isProfilePublic ? '他のユーザーから見える' : '非公開'}
                </span>
                <button
                  onClick={() => setIsProfilePublic(!isProfilePublic)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    isProfilePublic ? 'bg-[#e879d4]' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      isProfilePublic ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              {isProfilePublic && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    自己紹介（任意）
                  </label>
                  <textarea
                    value={userBio}
                    onChange={(e) => setUserBio(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e879d4] dark:bg-gray-700 dark:text-white"
                    placeholder="自己紹介を入力..."
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          <button 
            onClick={handleSave}
            className="w-full bg-[#e879d4] text-white py-3 rounded-xl font-bold hover:bg-[#f09fe3] transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
