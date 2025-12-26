import type { Anime, Season } from '../types';
import type { User } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * アニメを更新するユーティリティ関数
 * @param animeId 更新するアニメのID
 * @param seasons 現在のシーズン配列
 * @param updater アニメを更新する関数
 * @param user 現在のユーザー（ログイン時のみ）
 * @param supabase Supabaseクライアント
 * @param supabaseUpdater Supabaseを更新する関数（オプション）
 * @returns 更新されたシーズン配列と更新されたアニメ
 */
export async function updateAnimeInSeasons(
  animeId: number,
  seasons: Season[],
  updater: (anime: Anime) => Anime,
  user: User | null,
  supabase: SupabaseClient,
  supabaseUpdater?: (anime: Anime) => Promise<void>
): Promise<{ updatedSeasons: Season[]; updatedAnime: Anime | null }> {
  // 更新対象のアニメを探す
  let targetAnime: Anime | null = null;
  const updatedSeasons = seasons.map(season => ({
    ...season,
    animes: season.animes.map((anime) => {
      if (anime.id === animeId) {
        const updated = updater(anime);
        targetAnime = updated;
        return updated;
      }
      return anime;
    }),
  }));

  // Supabaseを更新（ログイン時のみ）
  if (user && targetAnime && supabaseUpdater) {
    try {
      await supabaseUpdater(targetAnime);
    } catch (error) {
      console.error('Failed to update anime in Supabase:', error);
    }
  }

  return {
    updatedSeasons,
    updatedAnime: targetAnime,
  };
}

/**
 * アニメの評価を更新する
 */
export async function updateAnimeRating(
  animeId: number,
  seasons: Season[],
  rating: number,
  user: User | null,
  supabase: SupabaseClient
): Promise<{ updatedSeasons: Season[]; updatedAnime: Anime | null }> {
  return updateAnimeInSeasons(
    animeId,
    seasons,
    (anime) => ({ ...anime, rating }),
    user,
    supabase,
    async (anime) => {
      const { error } = await supabase
        .from('animes')
        .update({ rating })
        .eq('id', anime.id)
        .eq('user_id', user!.id);
      
      if (error) throw error;
    }
  );
}

/**
 * アニメの周回数を更新する
 */
export async function updateAnimeRewatchCount(
  animeId: number,
  seasons: Season[],
  rewatchCount: number,
  user: User | null,
  supabase: SupabaseClient
): Promise<{ updatedSeasons: Season[]; updatedAnime: Anime | null }> {
  return updateAnimeInSeasons(
    animeId,
    seasons,
    (anime) => ({ ...anime, rewatchCount }),
    user,
    supabase,
    async (anime) => {
      const { error } = await supabase
        .from('animes')
        .update({ rewatch_count: rewatchCount })
        .eq('id', anime.id)
        .eq('user_id', user!.id);
      
      if (error) throw error;
    }
  );
}

/**
 * アニメのタグを更新する
 */
export async function updateAnimeTags(
  animeId: number,
  seasons: Season[],
  tags: string[],
  user: User | null,
  supabase: SupabaseClient
): Promise<{ updatedSeasons: Season[]; updatedAnime: Anime | null }> {
  return updateAnimeInSeasons(
    animeId,
    seasons,
    (anime) => ({ ...anime, tags }),
    user,
    supabase,
    async (anime) => {
      const { error } = await supabase
        .from('animes')
        .update({ tags })
        .eq('id', anime.id)
        .eq('user_id', user!.id);
      
      if (error) throw error;
    }
  );
}

/**
 * アニメのシリーズ名を更新する
 */
export async function updateAnimeSeriesName(
  animeId: number,
  seasons: Season[],
  seriesName: string | undefined,
  user: User | null,
  supabase: SupabaseClient
): Promise<{ updatedSeasons: Season[]; updatedAnime: Anime | null }> {
  return updateAnimeInSeasons(
    animeId,
    seasons,
    (anime) => ({ ...anime, seriesName }),
    user,
    supabase,
    async (anime) => {
      const { error } = await supabase
        .from('animes')
        .update({ series_name: seriesName || null })
        .eq('id', anime.id)
        .eq('user_id', user!.id);
      
      if (error) throw error;
    }
  );
}

/**
 * アニメの楽曲（OP/ED）を更新する
 */
export async function updateAnimeSongs(
  animeId: number,
  seasons: Season[],
  songs: Anime['songs'],
  user: User | null,
  supabase: SupabaseClient
): Promise<{ updatedSeasons: Season[]; updatedAnime: Anime | null }> {
  return updateAnimeInSeasons(
    animeId,
    seasons,
    (anime) => ({ ...anime, songs }),
    user,
    supabase,
    async (anime) => {
      const { error } = await supabase
        .from('animes')
        .update({ songs })
        .eq('id', anime.id)
        .eq('user_id', user!.id);
      
      if (error) throw error;
    }
  );
}

/**
 * アニメの名言を更新する
 */
export async function updateAnimeQuotes(
  animeId: number,
  seasons: Season[],
  quotes: Anime['quotes'],
  user: User | null,
  supabase: SupabaseClient
): Promise<{ updatedSeasons: Season[]; updatedAnime: Anime | null }> {
  return updateAnimeInSeasons(
    animeId,
    seasons,
    (anime) => ({ ...anime, quotes }),
    user,
    supabase,
    async (anime) => {
      const { error } = await supabase
        .from('animes')
        .update({ quotes })
        .eq('id', anime.id)
        .eq('user_id', user!.id);
      
      if (error) throw error;
    }
  );
}

