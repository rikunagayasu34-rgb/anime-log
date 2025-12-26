'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Review } from '../types';

export function useAnimeReviews(user: User | null) {
  const [animeReviews, setAnimeReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'overall' | 'episode'>('all');
  const [reviewSort, setReviewSort] = useState<'newest' | 'likes' | 'helpful'>('newest');
  const [userSpoilerHidden, setUserSpoilerHidden] = useState(false);
  const [expandedSpoilerReviews, setExpandedSpoilerReviews] = useState<Set<string>>(new Set());

  const loadReviews = async (animeId: number) => {
    if (!user) {
      setAnimeReviews([]);
      return;
    }
    
    setLoadingReviews(true);
    try {
      // アニメのUUIDを取得（animesテーブルから）
      const { data: animeData, error: animeError } = await supabase
        .from('animes')
        .select('id')
        .eq('id', animeId)
        .eq('user_id', user.id)
        .single();
      
      if (animeError || !animeData) {
        console.error('Failed to find anime:', animeError);
        setAnimeReviews([]);
        setLoadingReviews(false);
        return;
      }
      
      const animeUuid = animeData.id;
      
      // レビューを取得
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('anime_id', animeUuid)
        .order('created_at', { ascending: false });
      
      if (reviewsError) throw reviewsError;
      
      // 現在のユーザーがいいね/役に立ったを押したか確認
      if (reviewsData && reviewsData.length > 0) {
        const reviewIds = reviewsData.map(r => r.id);
        
        // いいね情報を取得
        const { data: likesData } = await supabase
          .from('review_likes')
          .select('review_id')
          .in('review_id', reviewIds)
          .eq('user_id', user.id);
        
        // 役に立った情報を取得
        const { data: helpfulData } = await supabase
          .from('review_helpful')
          .select('review_id')
          .in('review_id', reviewIds)
          .eq('user_id', user.id);
        
        const likedReviewIds = new Set(likesData?.map(l => l.review_id) || []);
        const helpfulReviewIds = new Set(helpfulData?.map(h => h.review_id) || []);
        
        const reviews: Review[] = reviewsData.map((r: any) => ({
          id: r.id,
          animeId: animeId, // 数値IDを保持
          userId: r.user_id,
          userName: r.user_name,
          userIcon: r.user_icon,
          type: r.type as 'overall' | 'episode',
          episodeNumber: r.episode_number || undefined,
          content: r.content,
          containsSpoiler: r.contains_spoiler,
          spoilerHidden: r.spoiler_hidden,
          likes: r.likes || 0,
          helpfulCount: r.helpful_count || 0,
          createdAt: new Date(r.created_at),
          updatedAt: new Date(r.updated_at),
          userLiked: likedReviewIds.has(r.id),
          userHelpful: helpfulReviewIds.has(r.id),
        }));
        
        setAnimeReviews(reviews);
      } else {
        setAnimeReviews([]);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
      setAnimeReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  return {
    animeReviews,
    loadingReviews,
    reviewFilter,
    setReviewFilter,
    reviewSort,
    setReviewSort,
    userSpoilerHidden,
    setUserSpoilerHidden,
    expandedSpoilerReviews,
    setExpandedSpoilerReviews,
    loadReviews,
  };
}

