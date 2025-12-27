'use client';

import { forwardRef } from 'react';

interface DNACardForExportProps {
  userName: string;
  userHandle: string | null;
  avatarUrl: string | null;
  otakuTypeDisplay: string;
  favoriteAnimes: {
    id: string;
    title: string;
    imageUrl?: string;
  }[];
}

// 画像URLをプロキシ経由に変換
const getProxiedUrl = (url: string | undefined): string | null => {
  if (!url) return null;
  if (url.startsWith('data:') || url.startsWith('/')) return url;
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
};

const DNACardForExport = forwardRef<HTMLDivElement, DNACardForExportProps>(
  ({ userName, userHandle, avatarUrl, otakuTypeDisplay, favoriteAnimes }, ref) => {
    
    const styles = {
      container: {
        width: 1200,
        height: 630,
        background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #6366f1 100%)',
        padding: 48,
        fontFamily: '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif',
        display: 'flex',
        flexDirection: 'column' as const,
        position: 'relative' as const,
        overflow: 'hidden',
        boxSizing: 'border-box' as const,
      },
      header: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 32,
      },
      logo: {
        width: 44,
        height: 44,
        background: 'rgba(255, 255, 255, 0.25)',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 24,
        color: '#ffffff',
        fontWeight: 'bold' as const,
      },
      title: {
        fontSize: 32,
        fontWeight: 'bold' as const,
        color: '#ffffff',
        letterSpacing: 3,
      },
      profileSection: {
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        marginBottom: 32,
      },
      avatar: {
        width: 120,
        height: 120,
        borderRadius: 16,
        objectFit: 'cover' as const,
        border: '4px solid rgba(255, 255, 255, 0.3)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      },
      avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 16,
        border: '4px solid rgba(255, 255, 255, 0.3)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 48,
      },
      profileInfo: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 8,
      },
      userName: {
        fontSize: 36,
        fontWeight: 'bold' as const,
        color: '#ffffff',
      },
      userHandle: {
        fontSize: 20,
        color: 'rgba(255, 255, 255, 0.8)',
      },
      otakuType: {
        display: 'inline-block',
        padding: '8px 20px',
        background: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 24,
        fontSize: 18,
        color: '#ffffff',
        marginTop: 4,
      },
      favoritesSection: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column' as const,
      },
      favoritesTitle: {
        fontSize: 22,
        fontWeight: 'bold' as const,
        color: '#ffffff',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      },
      favoritesGrid: {
        display: 'flex',
        gap: 16,
        flex: 1,
        alignItems: 'flex-start',
      },
      favoriteItem: {
        width: 140,
        height: 200,
        borderRadius: 12,
        objectFit: 'cover' as const,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        border: '3px solid rgba(255, 255, 255, 0.2)',
      },
      favoriteItemPlaceholder: {
        width: 140,
        height: 200,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        border: '3px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 14,
      },
      watermark: {
        position: 'absolute' as const,
        bottom: 24,
        right: 48,
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.5)',
        letterSpacing: 1,
      },
    };

    return (
      <div ref={ref} style={styles.container}>
        {/* ヘッダー */}
        <div style={styles.header}>
          <div style={styles.logo}>V</div>
          <span style={styles.title}>ANIME DNA</span>
        </div>

        {/* プロフィールセクション */}
        <div style={styles.profileSection}>
          {avatarUrl ? (
            <img 
              src={getProxiedUrl(avatarUrl) || avatarUrl} 
              alt={userName} 
              style={styles.avatar} 
              crossOrigin="anonymous" 
            />
          ) : (
            <div style={styles.avatarPlaceholder}>👤</div>
          )}
          <div style={styles.profileInfo}>
            <div style={styles.userName}>{userName}</div>
            {userHandle && <div style={styles.userHandle}>@{userHandle}</div>}
            <div style={styles.otakuType}>{otakuTypeDisplay}</div>
          </div>
        </div>

        {/* 最推し作品 */}
        {favoriteAnimes.length > 0 && (
          <div style={styles.favoritesSection}>
            <div style={styles.favoritesTitle}>
              <span>🏆</span>
              <span>最推し作品</span>
            </div>
            <div style={styles.favoritesGrid}>
              {favoriteAnimes.slice(0, 5).map((anime, index) => {
                const proxiedUrl = getProxiedUrl(anime.imageUrl);
                return proxiedUrl ? (
                  <img
                    key={anime.id || index}
                    src={proxiedUrl}
                    alt={anime.title}
                    style={styles.favoriteItem}
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div key={anime.id || index} style={styles.favoriteItemPlaceholder}>
                    No Image
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ウォーターマーク */}
        <div style={styles.watermark}>アニメログ</div>
      </div>
    );
  }
);

DNACardForExport.displayName = 'DNACardForExport';

export default DNACardForExport;
