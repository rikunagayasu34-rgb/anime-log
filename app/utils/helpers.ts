import { genreTranslation } from '../constants';
import type { Anime } from '../types';

// ジャンルを日本語に変換
export const translateGenre = (genre: string): string => {
  return genreTranslation[genre] || genre;
};

// データマッピング関数：Anime型 → Supabase形式（snake_case）
export function animeToSupabase(anime: Anime, seasonName: string, userId: string) {
  return {
    user_id: userId,
    season_name: seasonName,
    title: anime.title,
    image: anime.image || null,
    rating: anime.rating && anime.rating > 0 ? anime.rating : null, // 0の場合はNULLにする
    watched: anime.watched ?? false,
    rewatch_count: anime.rewatchCount ?? 0,
    tags: (anime.tags && anime.tags.length > 0) ? anime.tags : null,
    songs: anime.songs || null,
    quotes: anime.quotes || null,
    series_name: anime.seriesName || null,
    studios: (anime.studios && anime.studios.length > 0) ? anime.studios : null,
  };
}

// データマッピング関数：Supabase形式 → Anime型
export function supabaseToAnime(row: any): Anime {
  return {
    id: row.id,
    title: row.title,
    image: row.image,
    rating: row.rating,
    watched: row.watched,
    rewatchCount: row.rewatch_count ?? 0,
    tags: row.tags || [],
    songs: row.songs || undefined,
    quotes: row.quotes || undefined,
    seriesName: row.series_name || undefined,
    studios: row.studios || undefined,
  };
}

// タイトルからシリーズ名を自動判定する関数
export function extractSeriesName(title: string): string {
  // 「2期」「3期」「Season 2」「S2」「The Final Season」などのパターンを検出
  const patterns = [
    /^(.+?)\s*[第]?(\d+)[期季]/,
    /^(.+?)\s*Season\s*(\d+)/i,
    /^(.+?)\s*S(\d+)/i,
    /^(.+?)\s*第(\d+)期/,
    /^(.+?)\s*第(\d+)シーズン/i,
    /^(.+?)\s*The\s+Final\s+Season/i,
  ];
  
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // パターンにマッチしない場合は元の文字列を返す
  return title;
}

// シーズン名を日本語に変換、または年とクォーターからシーズン名を生成する関数
// オーバーロード: 文字列を受け取る場合（既存コードとの互換性）
export function getSeasonName(season: string): string;
// オーバーロード: 年とクォーターを受け取る場合（テスト用）
export function getSeasonName(year: number, quarter: number): string;
// 実装
export function getSeasonName(seasonOrYear: string | number, quarter?: number): string {
  // 2つの引数が渡された場合（年とクォーター）
  if (typeof seasonOrYear === 'number' && quarter !== undefined) {
    const seasonNames = ['冬', '春', '夏', '秋'];
    if (quarter < 1 || quarter > 4) {
      throw new Error('Quarter must be between 1 and 4');
    }
    return `${seasonOrYear}年${seasonNames[quarter - 1]}`;
  }
  
  // 1つの引数が渡された場合（文字列のシーズン名）
  const seasonMap: { [key: string]: string } = {
    'WINTER': '冬',
    'SPRING': '春',
    'SUMMER': '夏',
    'FALL': '秋',
  };
  return seasonMap[seasonOrYear as string] || (seasonOrYear as string);
}
