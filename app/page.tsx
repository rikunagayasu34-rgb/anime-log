'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import type { User } from '@supabase/supabase-js';
import { searchAnime, searchAnimeBySeason } from './lib/anilist';
import type { UserProfile } from './lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import { 
  searchUsers, 
  getRecommendedUsers, 
  followUser, 
  unfollowUser, 
  getFollowers, 
  getFollowing, 
  getPublicProfile, 
  getPublicAnimes,
  isFollowing,
  getFollowCounts,
  upsertUserProfile,
  getMyProfile
} from './lib/supabase';
import type { 
  Season, 
  Review, 
  Anime, 
  Achievement, 
  EvangelistList, 
  FavoriteCharacter, 
  VoiceActor 
} from './types';
import {
  availableTags,
  characterCategories,
  otakuTypes,
  characterPresetTags,
  sampleFavoriteCharacters,
  achievements,
  sampleSeasons,
  ratingLabels,
  genreTranslation,
} from './constants';
import { StarRating } from './components/StarRating';
import { AnimeCard } from './components/AnimeCard';
import { UserCard } from './components/UserCard';
import { AchievementsTab } from './components/tabs/AchievementsTab';
import { MusicTab } from './components/tabs/MusicTab';
import { ProfileTab } from './components/tabs/ProfileTab';
import { HomeTab } from './components/tabs/HomeTab';
import { DiscoverTab } from './components/tabs/DiscoverTab';
import { CollectionTab } from './components/tabs/CollectionTab';
import { ReviewModal } from './components/modals/ReviewModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { AuthModal } from './components/modals/AuthModal';
import { FavoriteAnimeModal } from './components/modals/FavoriteAnimeModal';
import { SongModal } from './components/modals/SongModal';
import { UserProfileModal } from './components/modals/UserProfileModal';
import { FollowListModal } from './components/modals/FollowListModal';
import { CreateListModal } from './components/modals/CreateListModal';
import { AddCharacterModal } from './components/modals/AddCharacterModal';
import { AddVoiceActorModal } from './components/modals/AddVoiceActorModal';
import { AddQuoteModal } from './components/modals/AddQuoteModal';
import { DNAModal } from './components/modals/DNAModal';
import { AddAnimeFormModal } from './components/modals/AddAnimeFormModal';
import { AnimeDetailModal } from './components/modals/AnimeDetailModal';
import { Navigation } from './components/Navigation';
import { useAnimeReviews } from './hooks/useAnimeReviews';
import { translateGenre } from './utils/helpers';




// メインページ
export default function Home() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const prevSeasonsRef = useRef<string>('');
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [count, setCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showFavoriteAnimeModal, setShowFavoriteAnimeModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDNAModal, setShowDNAModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userName, setUserName] = useState<string>('ユーザー');
  const [userIcon, setUserIcon] = useState<string>('👤');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [userOtakuType, setUserOtakuType] = useState<string>('');
  const [favoriteAnimeIds, setFavoriteAnimeIds] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'discover' | 'collection' | 'profile'>('home');
  const [homeSubTab, setHomeSubTab] = useState<'seasons' | 'series'>('seasons');
  const [discoverSubTab, setDiscoverSubTab] = useState<'trends'>('trends');
  const [collectionSubTab, setCollectionSubTab] = useState<'achievements' | 'characters' | 'quotes' | 'lists' | 'music' | 'voiceActors'>('achievements');
  const [expandedSeasons, setExpandedSeasons] = useState<Set<string>>(new Set());
  const [evangelistLists, setEvangelistLists] = useState<EvangelistList[]>([]);
  const [favoriteCharacters, setFavoriteCharacters] = useState<FavoriteCharacter[]>([]);
  const [voiceActors, setVoiceActors] = useState<VoiceActor[]>([]);
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [selectedList, setSelectedList] = useState<EvangelistList | null>(null);
  const [editingList, setEditingList] = useState<EvangelistList | null>(null);
  const [showAddCharacterModal, setShowAddCharacterModal] = useState(false);
  const [newCharacterName, setNewCharacterName] = useState('');
  const [newCharacterAnimeId, setNewCharacterAnimeId] = useState<number | null>(null);
  const [newCharacterImage, setNewCharacterImage] = useState('👤');
  const [newCharacterCategory, setNewCharacterCategory] = useState('');
  const [newCharacterTags, setNewCharacterTags] = useState<string[]>([]);
  const [newCustomTag, setNewCustomTag] = useState('');
  const [editingCharacter, setEditingCharacter] = useState<FavoriteCharacter | null>(null);
  const [characterFilter, setCharacterFilter] = useState<string | null>(null);
  const [showAddVoiceActorModal, setShowAddVoiceActorModal] = useState(false);
  const [newVoiceActorName, setNewVoiceActorName] = useState('');
  const [newVoiceActorImage, setNewVoiceActorImage] = useState('🎤');
  const [newVoiceActorAnimeIds, setNewVoiceActorAnimeIds] = useState<number[]>([]);
  const [newVoiceActorNotes, setNewVoiceActorNotes] = useState('');
  const [editingVoiceActor, setEditingVoiceActor] = useState<VoiceActor | null>(null);
  const [voiceActorSearchQuery, setVoiceActorSearchQuery] = useState('');
  const [quoteSearchQuery, setQuoteSearchQuery] = useState('');
  const [quoteFilterType, setQuoteFilterType] = useState<'all' | 'anime' | 'character'>('all');
  const [selectedAnimeForFilter, setSelectedAnimeForFilter] = useState<number | null>(null);
  const [listSortType, setListSortType] = useState<'date' | 'title' | 'count'>('date');
  
  // SNS機能の状態管理
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchedUsers, setSearchedUsers] = useState<UserProfile[]>([]);
  const [recommendedUsers, setRecommendedUsers] = useState<UserProfile[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserProfile | null>(null);
  const [selectedUserAnimes, setSelectedUserAnimes] = useState<Anime[]>([]);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [userFollowStatus, setUserFollowStatus] = useState<{ [userId: string]: boolean }>({});
  const [followCounts, setFollowCounts] = useState<{ following: number; followers: number }>({ following: 0, followers: 0 });
  const [showFollowListModal, setShowFollowListModal] = useState(false);
  const [followListType, setFollowListType] = useState<'following' | 'followers'>('following');
  const [followListUsers, setFollowListUsers] = useState<UserProfile[]>([]);
  const [myProfile, setMyProfile] = useState<UserProfile | null>(null);
  const [isProfilePublic, setIsProfilePublic] = useState(false);
  const [userBio, setUserBio] = useState('');
  const [userHandle, setUserHandle] = useState<string>('');
  
  // フォロー/フォロワー一覧モーダルを開く際にデータを読み込む
  useEffect(() => {
    if (showFollowListModal && user) {
      const loadFollowList = async () => {
        try {
          if (followListType === 'following') {
            const following = await getFollowing(user.id);
            setFollowListUsers(following);
          } else {
            const followers = await getFollowers(user.id);
            setFollowListUsers(followers);
          }
        } catch (error) {
          console.error('Failed to load follow list:', error);
        }
      };
      
      loadFollowList();
    }
  }, [showFollowListModal, followListType, user]);
  const [showAddQuoteModal, setShowAddQuoteModal] = useState(false);
  const [editingQuote, setEditingQuote] = useState<{ animeId: number; quoteIndex: number } | null>(null);
  const [newQuoteAnimeId, setNewQuoteAnimeId] = useState<number | null>(null);
  const [newQuoteText, setNewQuoteText] = useState('');
  const [newQuoteCharacter, setNewQuoteCharacter] = useState('');
  const [showSongModal, setShowSongModal] = useState(false);
  const [songType, setSongType] = useState<'op' | 'ed' | null>(null);
  const [newSongTitle, setNewSongTitle] = useState('');
  const [newSongArtist, setNewSongArtist] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  // レビュー関連の状態をカスタムフックで管理
  const {
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
  } = useAnimeReviews(user);

  // 認証状態の監視
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 現在のセッションを確認
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
      });

      // 認証状態の変化を監視
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  // localStorageから初期値を読み込む
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('userName');
      const savedIcon = localStorage.getItem('userIcon');
      const savedDarkMode = localStorage.getItem('darkMode');
      const savedOtakuType = localStorage.getItem('userOtakuType');
      const savedFavoriteAnimeIds = localStorage.getItem('favoriteAnimeIds');
      const savedSeasons = localStorage.getItem('animeSeasons');
      const savedLists = localStorage.getItem('evangelistLists');
      const savedCharacters = localStorage.getItem('favoriteCharacters');
      
      if (savedName) setUserName(savedName);
      if (savedIcon) setUserIcon(savedIcon);
      if (savedDarkMode === 'true') setIsDarkMode(true);
      if (savedOtakuType) setUserOtakuType(savedOtakuType);
      if (savedFavoriteAnimeIds) {
        try {
          setFavoriteAnimeIds(JSON.parse(savedFavoriteAnimeIds));
        } catch (e) {
          console.error('Failed to parse favoriteAnimeIds', e);
        }
      }
      
      // 布教リストを読み込む
      if (savedLists) {
        try {
          const parsedLists = JSON.parse(savedLists);
          // Date型に変換
          const listsWithDates = parsedLists.map((list: any) => ({
            ...list,
            createdAt: new Date(list.createdAt),
          }));
          setEvangelistLists(listsWithDates);
        } catch (e) {
          console.error('Failed to parse evangelist lists', e);
        }
      }
      
      // 推しキャラを読み込む
      if (savedCharacters) {
        try {
          const parsedCharacters = JSON.parse(savedCharacters);
          // サンプルデータを検出（IDが1-3のキャラクターが含まれている場合）
          const hasSampleData = parsedCharacters.some((char: FavoriteCharacter) =>
            char.id >= 1 && char.id <= 3
          );
          
          if (hasSampleData) {
            // サンプルデータが含まれている場合はlocalStorageをクリア
            localStorage.removeItem('favoriteCharacters');
            setFavoriteCharacters([]);
          } else {
            setFavoriteCharacters(parsedCharacters);
          }
        } catch (e) {
          console.error('Failed to parse favorite characters', e);
          // エラーの場合は空の配列を使用
          setFavoriteCharacters([]);
        }
      } else {
        // 保存データがない場合は空の配列を使用
        setFavoriteCharacters([]);
      }
      
      // アニメデータを読み込む（未ログイン時のみlocalStorageから、ログイン時はSupabaseから読み込む）
      // ログイン時はSupabaseからの読み込み処理（useEffect）で上書きされるため、ここでは未ログイン時の処理のみ
      // ただし、isLoadingが完了するまで待つ必要があるため、この処理は認証状態確認後に行う
    }
  }, []);

  // ダークモードの適用
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('darkMode', isDarkMode.toString());
    }
  }, [isDarkMode]);

  // ユーザー情報をlocalStorageに保存
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userName', userName);
      localStorage.setItem('userIcon', userIcon);
      if (userOtakuType) {
        localStorage.setItem('userOtakuType', userOtakuType);
      } else {
        localStorage.removeItem('userOtakuType');
      }
      localStorage.setItem('favoriteAnimeIds', JSON.stringify(favoriteAnimeIds));
    }
  }, [userName, userIcon, userOtakuType, favoriteAnimeIds]);

  // アニメデータをlocalStorageに保存（未ログイン時のみ）
  useEffect(() => {
    if (typeof window !== 'undefined' && !user && seasons.length > 0) {
      const seasonsString = JSON.stringify(seasons);
      // 前回の値と比較して、変更があった場合のみ保存
      if (prevSeasonsRef.current !== seasonsString) {
        localStorage.setItem('animeSeasons', seasonsString);
        prevSeasonsRef.current = seasonsString;
      }
    }
  }, [seasons, user]);

  // 布教リストをlocalStorageに保存
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('evangelistLists', JSON.stringify(evangelistLists));
    }
  }, [evangelistLists]);

  // 推しキャラをlocalStorageに保存
  useEffect(() => {
    if (typeof window !== 'undefined' && favoriteCharacters.length > 0) {
      localStorage.setItem('favoriteCharacters', JSON.stringify(favoriteCharacters));
    }
  }, [favoriteCharacters]);

  // 認証処理

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // ログアウト時にseasonsを空にする
      setSeasons([]);
    } catch (error: any) {
      console.error('Logout error:', error);
    }
  };

  // シーズン名を日本語に変換
  const getSeasonName = (season: string) => {
    const seasonMap: { [key: string]: string } = {
      'WINTER': '冬',
      'SPRING': '春',
      'SUMMER': '夏',
      'FALL': '秋',
    };
    return seasonMap[season] || season;
  };

  // SNS機能の関数
  const handleUserSearch = async () => {
    if (!userSearchQuery.trim()) return;
    
    setIsSearchingUsers(true);
    try {
      const results = await searchUsers(userSearchQuery.trim());
      setSearchedUsers(results);
      
      // フォロー状態を確認
      if (user) {
        const followStatus: { [userId: string]: boolean } = {};
        await Promise.all(
          results.map(async (u) => {
            followStatus[u.id] = await isFollowing(u.id);
          })
        );
        setUserFollowStatus(prev => ({ ...prev, ...followStatus }));
      }
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setIsSearchingUsers(false);
    }
  };

  const handleViewUserProfile = async (userId: string) => {
    try {
      const profile = await getPublicProfile(userId);
      if (!profile) {
        alert('このユーザーのプロフィールは公開されていません');
        return;
      }
      
      const animes = await getPublicAnimes(userId);
      const following = await isFollowing(userId);
      
      setSelectedUserProfile(profile);
      setSelectedUserAnimes(animes.map(a => supabaseToAnime(a)));
      setUserFollowStatus(prev => ({ ...prev, [userId]: following }));
      setShowUserProfileModal(true);
    } catch (error) {
      console.error('Failed to view user profile:', error);
      alert('プロフィールの取得に失敗しました');
    }
  };

  const handleToggleFollow = async (userId: string) => {
    if (!user) {
      alert('ログインが必要です');
      return;
    }
    
    const currentlyFollowing = userFollowStatus[userId] || false;
    
    try {
      let success = false;
      if (currentlyFollowing) {
        success = await unfollowUser(userId);
      } else {
        success = await followUser(userId);
      }
      
      if (success) {
        setUserFollowStatus(prev => ({
          ...prev,
          [userId]: !currentlyFollowing,
        }));
        
        // フォロー数を更新
        if (user) {
          const counts = await getFollowCounts(user.id);
          setFollowCounts(counts);
        }
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      alert('フォロー操作に失敗しました');
    }
  };


  // タイトルからシリーズ名を自動判定する関数
  const extractSeriesName = (title: string): string | undefined => {
    // 「2期」「3期」「Season 2」「S2」などのパターンを検出
    const patterns = [
      /^(.+?)\s*[第]?(\d+)[期季]/,
      /^(.+?)\s*Season\s*(\d+)/i,
      /^(.+?)\s*S(\d+)/i,
      /^(.+?)\s*第(\d+)期/,
      /^(.+?)\s*第(\d+)シーズン/i,
    ];
    
    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return undefined;
  };


  // データマッピング関数：Anime型 → Supabase形式（snake_case）
  const animeToSupabase = (anime: Anime, seasonName: string, userId: string) => {
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
  };

  // データマッピング関数：Supabase形式 → Anime型
  const supabaseToAnime = (row: any): Anime => {
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
  };


  // アニメが選択されたときに感想を読み込む
  useEffect(() => {
    if (selectedAnime && user) {
      loadReviews(selectedAnime.id);
    } else if (!selectedAnime || !user) {
      // アニメが選択されていない、またはログインしていない場合は空にする
      // loadReviewsは既に空にする処理を含んでいるので、ここでは何もしない
    }
  }, [selectedAnime?.id, user, loadReviews]);

  // ログイン時にSupabaseからアニメデータを読み込む、未ログイン時はlocalStorageから読み込む
  useEffect(() => {
    const loadAnimes = async () => {
      if (isLoading) return;

      if (user) {
        // ログイン時：Supabaseから読み込む
        try {
          const { data, error } = await supabase
            .from('animes')
            .select('*')
            .eq('user_id', user.id)
            .order('id', { ascending: true });

          if (error) throw error;

          if (data && data.length > 0) {
            // シーズンごとにグループ化
            const seasonMap = new Map<string, Anime[]>();
            data.forEach((row) => {
              const anime = supabaseToAnime(row);
              const seasonName = row.season_name || '未分類';
              if (!seasonMap.has(seasonName)) {
                seasonMap.set(seasonName, []);
              }
              seasonMap.get(seasonName)!.push(anime);
            });

            // Season型に変換
            const loadedSeasons: Season[] = Array.from(seasonMap.entries()).map(([name, animes]) => ({
              name,
              animes,
            }));

            if (loadedSeasons.length > 0) {
              setSeasons(loadedSeasons);
              setExpandedSeasons(new Set([loadedSeasons[0].name]));
            } else {
              setSeasons([]);
            }
          } else {
            setSeasons([]);
          }
        } catch (error) {
          console.error('Failed to load animes from Supabase:', error);
        }
      } else {
        // 未ログイン時：localStorageから読み込む
        if (typeof window !== 'undefined') {
          const savedSeasons = localStorage.getItem('animeSeasons');
          if (savedSeasons) {
            try {
              const parsedSeasons = JSON.parse(savedSeasons);
              // サンプルデータを検出（IDが1-4のアニメが含まれている場合）
              const hasSampleData = parsedSeasons.some((season: Season) =>
                season.animes.some((anime: Anime) => anime.id >= 1 && anime.id <= 4)
              );
              
              if (hasSampleData) {
                // サンプルデータが含まれている場合はlocalStorageをクリア
                localStorage.removeItem('animeSeasons');
                setSeasons([]);
              } else {
                setSeasons(parsedSeasons);
                if (parsedSeasons.length > 0) {
                  setExpandedSeasons(new Set([parsedSeasons[0].name]));
                }
              }
            } catch (e) {
              // パースエラーの場合は空の配列を使用
              setSeasons([]);
            }
          } else {
            // 保存データがない場合は空の配列を使用
            setSeasons([]);
          }
        }
      }
    };

    loadAnimes();
  }, [user, isLoading]);

  // ログイン時にプロフィール情報を読み込む
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          const profile = await getMyProfile();
          if (profile) {
            setMyProfile(profile);
            setUserName(profile.username || userName);
            setUserBio(profile.bio || '');
            setIsProfilePublic(profile.is_public || false);
            setUserHandle(profile.handle || '');
          }
        } catch (error) {
          console.error('Failed to load profile:', error);
        }
      } else {
        setMyProfile(null);
        setUserHandle('');
      }
    };
    
    loadProfile();
  }, [user]);

  // すべてのアニメを取得
  const allAnimes = seasons.flatMap(season => season.animes);

  // 平均評価を計算
  const averageRating = allAnimes.length > 0 && allAnimes.some(a => a.rating > 0)
    ? allAnimes.filter(a => a.rating > 0).reduce((sum, a) => sum + a.rating, 0) / allAnimes.filter(a => a.rating > 0).length
    : 0;

  // 累計周回数を計算
  const totalRewatchCount = allAnimes.reduce((sum, a) => sum + (a.rewatchCount ?? 0), 0);

  // カウントアップアニメーション
  useEffect(() => {
    const targetCount = allAnimes.length;
    const duration = 1500; // 1.5秒
    const steps = 60;
    const increment = targetCount / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const nextCount = Math.min(Math.ceil(increment * currentStep), targetCount);
      setCount(nextCount);
      
      if (nextCount >= targetCount) {
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [allAnimes.length]);

  return (
    <div className="min-h-screen bg-[#fef6f0] dark:bg-gray-900">
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        user={user}
        userName={userName}
        userIcon={userIcon}
        setShowSettings={setShowSettings}
        setShowAuthModal={setShowAuthModal}
      />

      {/* メインコンテンツ */}
      <main className="max-w-md md:max-w-6xl mx-auto px-4 py-6 pb-24 lg:pb-6 lg:ml-[200px]">
        {activeTab === 'home' && (
          <HomeTab
            homeSubTab={homeSubTab}
            setHomeSubTab={setHomeSubTab}
            count={count}
            totalRewatchCount={totalRewatchCount}
            averageRating={averageRating}
            seasons={seasons}
            expandedSeasons={expandedSeasons}
            setExpandedSeasons={setExpandedSeasons}
            onOpenAddForm={() => setShowAddForm(true)}
            setSelectedAnime={setSelectedAnime}
          />
        )}
        
        {activeTab === 'discover' && (
          <DiscoverTab
            allAnimes={allAnimes}
            seasons={seasons}
          />
        )}

        {activeTab === 'collection' && (
          <CollectionTab
            collectionSubTab={collectionSubTab}
            setCollectionSubTab={setCollectionSubTab}
            allAnimes={allAnimes}
            seasons={seasons}
            setSeasons={setSeasons}
            user={user}
            supabaseClient={supabase}
            achievements={achievements}
            favoriteCharacters={favoriteCharacters}
            setFavoriteCharacters={setFavoriteCharacters}
            characterFilter={characterFilter}
            setCharacterFilter={setCharacterFilter}
            onOpenAddCharacterModal={() => {
              setNewCharacterName('');
              setNewCharacterAnimeId(null);
              setNewCharacterImage('👤');
              setNewCharacterCategory('');
              setNewCharacterTags([]);
              setNewCustomTag('');
              setEditingCharacter(null);
              setShowAddCharacterModal(true);
            }}
            onEditCharacter={(character) => {
              setEditingCharacter(character);
              setNewCharacterName(character.name);
              setNewCharacterAnimeId(character.animeId);
              setNewCharacterImage(character.image);
              setNewCharacterCategory(character.category);
              setNewCharacterTags([...character.tags]);
              setNewCustomTag('');
              setShowAddCharacterModal(true);
            }}
            quoteSearchQuery={quoteSearchQuery}
            setQuoteSearchQuery={setQuoteSearchQuery}
            quoteFilterType={quoteFilterType}
            setQuoteFilterType={setQuoteFilterType}
            selectedAnimeForFilter={selectedAnimeForFilter}
            setSelectedAnimeForFilter={setSelectedAnimeForFilter}
            onOpenAddQuoteModal={() => {
              setEditingQuote(null);
              setNewQuoteAnimeId(null);
              setNewQuoteText('');
              setNewQuoteCharacter('');
              setShowAddQuoteModal(true);
            }}
            onEditQuote={(animeId, quoteIndex) => {
              const anime = allAnimes.find(a => a.id === animeId);
              if (anime && anime.quotes && anime.quotes[quoteIndex]) {
                setEditingQuote({ animeId, quoteIndex });
                setNewQuoteText(anime.quotes[quoteIndex].text);
                setNewQuoteCharacter(anime.quotes[quoteIndex].character || '');
                setShowAddQuoteModal(true);
              }
            }}
            evangelistLists={evangelistLists}
            setEvangelistLists={setEvangelistLists}
            listSortType={listSortType}
            setListSortType={setListSortType}
            onSelectList={setSelectedList}
            onOpenCreateListModal={() => {
              setEditingList(null);
              setShowCreateListModal(true);
            }}
            voiceActors={voiceActors}
            setVoiceActors={setVoiceActors}
            voiceActorSearchQuery={voiceActorSearchQuery}
            setVoiceActorSearchQuery={setVoiceActorSearchQuery}
            onOpenAddVoiceActorModal={() => {
              setNewVoiceActorName('');
              setNewVoiceActorImage('🎤');
              setNewVoiceActorAnimeIds([]);
              setNewVoiceActorNotes('');
              setEditingVoiceActor(null);
              setShowAddVoiceActorModal(true);
            }}
            onEditVoiceActor={(actor) => {
              setEditingVoiceActor(actor);
              setNewVoiceActorName(actor.name);
              setNewVoiceActorImage(actor.image);
              setNewVoiceActorAnimeIds(actor.animeIds);
              setNewVoiceActorNotes(actor.notes || '');
              setShowAddVoiceActorModal(true);
            }}
            setSelectedAnime={setSelectedAnime}
            setSongType={setSongType}
            setNewSongTitle={setNewSongTitle}
            setNewSongArtist={setNewSongArtist}
            setShowSongModal={setShowSongModal}
          />
        )}
        
        {activeTab === 'profile' && (
          <ProfileTab
            allAnimes={allAnimes}
            seasons={seasons}
            userName={userName}
            userIcon={userIcon}
            userHandle={userHandle}
            averageRating={averageRating}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            setShowSettings={setShowSettings}
            handleLogout={handleLogout}
            userOtakuType={userOtakuType}
            favoriteAnimeIds={favoriteAnimeIds}
            setFavoriteAnimeIds={setFavoriteAnimeIds}
            setShowFavoriteAnimeModal={setShowFavoriteAnimeModal}
            followCounts={followCounts}
            setShowFollowListModal={setShowFollowListModal}
            setFollowListType={setFollowListType}
            setFollowListUsers={setFollowListUsers}
            user={user}
            setUserName={setUserName}
            setUserIcon={setUserIcon}
            setUserOtakuType={setUserOtakuType}
            isProfilePublic={isProfilePublic}
            setIsProfilePublic={setIsProfilePublic}
            userBio={userBio}
            setUserBio={setUserBio}
            upsertUserProfile={upsertUserProfile}
            userSearchQuery={userSearchQuery}
            setUserSearchQuery={setUserSearchQuery}
            searchedUsers={searchedUsers}
            recommendedUsers={recommendedUsers}
            isSearchingUsers={isSearchingUsers}
            handleUserSearch={handleUserSearch}
            handleViewUserProfile={handleViewUserProfile}
            handleToggleFollow={handleToggleFollow}
            userFollowStatus={userFollowStatus}
          />
        )}
      </main>

      <AddAnimeFormModal
        show={showAddForm}
        onClose={() => setShowAddForm(false)}
        seasons={seasons}
        setSeasons={setSeasons}
        expandedSeasons={expandedSeasons}
        setExpandedSeasons={setExpandedSeasons}
        user={user}
        extractSeriesName={extractSeriesName}
        getSeasonName={getSeasonName}
        animeToSupabase={animeToSupabase}
        supabaseToAnime={supabaseToAnime}
      />

      {/* 感想投稿モーダル */}
      <ReviewModal
        show={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        selectedAnime={selectedAnime}
        user={user}
        userName={userName}
        userIcon={userIcon}
        onReviewPosted={async () => {
          if (selectedAnime) {
            await loadReviews(selectedAnime.id);
          }
        }}
      />

      <SettingsModal
        show={showSettings}
        onClose={() => setShowSettings(false)}
        userName={userName}
        setUserName={setUserName}
        userIcon={userIcon}
        setUserIcon={setUserIcon}
        userHandle={userHandle}
        setUserHandle={setUserHandle}
        userOtakuType={userOtakuType}
        setUserOtakuType={setUserOtakuType}
        favoriteAnimeIds={favoriteAnimeIds}
        setFavoriteAnimeIds={setFavoriteAnimeIds}
        isProfilePublic={isProfilePublic}
        setIsProfilePublic={setIsProfilePublic}
        userBio={userBio}
        setUserBio={setUserBio}
        user={user}
        allAnimes={allAnimes}
        setShowFavoriteAnimeModal={setShowFavoriteAnimeModal}
        upsertUserProfile={upsertUserProfile}
        setMyProfile={setMyProfile}
      />

      <FavoriteAnimeModal
        show={showFavoriteAnimeModal}
        onClose={() => setShowFavoriteAnimeModal(false)}
        allAnimes={allAnimes}
        favoriteAnimeIds={favoriteAnimeIds}
        setFavoriteAnimeIds={setFavoriteAnimeIds}
      />

      <UserProfileModal
        show={showUserProfileModal}
        onClose={() => setShowUserProfileModal(false)}
        selectedUserProfile={selectedUserProfile}
        selectedUserAnimes={selectedUserAnimes}
        user={user}
        userFollowStatus={userFollowStatus}
        onToggleFollow={handleToggleFollow}
        onAnimeClick={setSelectedAnime}
      />

      <FollowListModal
        show={showFollowListModal}
        onClose={() => setShowFollowListModal(false)}
        user={user}
        followListType={followListType}
        setFollowListType={setFollowListType}
        followListUsers={followListUsers}
        setFollowListUsers={setFollowListUsers}
        userFollowStatus={userFollowStatus}
        onViewUserProfile={handleViewUserProfile}
        onToggleFollow={handleToggleFollow}
      />

      {/* 認証モーダル */}
      <AuthModal
        show={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={() => {
          // 認証成功後の処理（必要に応じて）
        }}
      />

      {/* アニメ詳細モーダル */}
      {selectedAnime && (
        <AnimeDetailModal
          selectedAnime={selectedAnime}
          setSelectedAnime={setSelectedAnime}
          seasons={seasons}
          setSeasons={setSeasons}
          user={user}
          supabase={supabase}
          animeReviews={animeReviews}
          loadingReviews={loadingReviews}
          loadReviews={loadReviews}
          reviewFilter={reviewFilter}
          setReviewFilter={setReviewFilter}
          reviewSort={reviewSort}
          setReviewSort={setReviewSort}
          userSpoilerHidden={userSpoilerHidden}
          setUserSpoilerHidden={setUserSpoilerHidden}
          expandedSpoilerReviews={expandedSpoilerReviews}
          setExpandedSpoilerReviews={setExpandedSpoilerReviews}
          setShowReviewModal={setShowReviewModal}
          setShowSongModal={setShowSongModal}
          setSongType={setSongType}
          setNewSongTitle={setNewSongTitle}
          setNewSongArtist={setNewSongArtist}
        />
      )}

      <CreateListModal
        show={showCreateListModal}
        onClose={() => {
          setShowCreateListModal(false);
          setEditingList(null);
        }}
        allAnimes={allAnimes}
        editingList={editingList}
        onSave={(list) => {
          if (editingList) {
            // 編集
            const updatedLists = evangelistLists.map(l =>
              l.id === editingList.id
                ? {
                    ...l,
                    title: list.title,
                    description: list.description,
                    animeIds: list.animeIds,
                  }
                : l
            );
            setEvangelistLists(updatedLists);
          } else {
            // 新規作成
            const newList: EvangelistList = {
              id: Date.now(),
              title: list.title,
              description: list.description,
              animeIds: list.animeIds,
              createdAt: new Date(),
            };
            setEvangelistLists([...evangelistLists, newList]);
          }
          setEditingList(null);
        }}
      />

      {/* 布教リスト詳細モーダル */}
      {selectedList && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedList(null)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-2 dark:text-white">{selectedList.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{selectedList.description}</p>
            
            {/* アニメ一覧 */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {selectedList.animeIds.length}作品
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {selectedList.animeIds.map((animeId) => {
                  const anime = allAnimes.find(a => a.id === animeId);
                  if (!anime) return null;
                  const isImageUrl = anime.image && (anime.image.startsWith('http://') || anime.image.startsWith('https://'));
                  return (
                    <div
                      key={animeId}
                      onClick={() => {
                        setSelectedAnime(anime);
                        setSelectedList(null);
                      }}
                      className="bg-linear-to-br from-[#ffc2d1] to-[#ffb07c] rounded-xl p-3 text-white text-center cursor-pointer hover:scale-105 transition-transform"
                    >
                      {isImageUrl ? (
                        <img
                          src={anime.image}
                          alt={anime.title}
                          className="w-full h-16 object-cover rounded mb-1"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            const parent = (e.target as HTMLImageElement).parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="text-3xl mb-1">🎬</div><p class="text-xs font-bold truncate">' + anime.title + '</p>';
                            }
                          }}
                        />
                      ) : (
                        <div className="text-3xl mb-1">{anime.image}</div>
                      )}
                      <p className="text-xs font-bold truncate">{anime.title}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditingList(selectedList);
                  setSelectedList(null);
                  setShowCreateListModal(true);
                }}
                className="flex-1 bg-[#ffc2d1] text-white py-3 rounded-xl font-bold hover:bg-[#ffb07c] transition-colors"
              >
                編集
              </button>
              <button
                onClick={() => setSelectedList(null)}
                className="flex-1 bg-gray-500 text-white py-3 rounded-xl font-bold hover:bg-gray-600 transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      <AddCharacterModal
        show={showAddCharacterModal}
        onClose={() => {
          setShowAddCharacterModal(false);
          setEditingCharacter(null);
        }}
        allAnimes={allAnimes}
        editingCharacter={editingCharacter}
        favoriteCharacters={favoriteCharacters}
        onSave={(character) => {
          if (editingCharacter) {
            // 編集
            setFavoriteCharacters(favoriteCharacters.map(c =>
              c.id === editingCharacter.id ? character : c
            ));
          } else {
            // 新規作成
            setFavoriteCharacters([...favoriteCharacters, character]);
          }
          setShowAddCharacterModal(false);
          setEditingCharacter(null);
        }}
      />

      <AddVoiceActorModal
        show={showAddVoiceActorModal}
        onClose={() => {
          setShowAddVoiceActorModal(false);
          setEditingVoiceActor(null);
        }}
        allAnimes={allAnimes}
        editingVoiceActor={editingVoiceActor}
        voiceActors={voiceActors}
        onSave={(actor) => {
          if (editingVoiceActor) {
            // 編集
            setVoiceActors(voiceActors.map(a =>
              a.id === editingVoiceActor.id ? actor : a
            ));
          } else {
            // 新規作成
            setVoiceActors([...voiceActors, actor]);
          }
          setShowAddVoiceActorModal(false);
          setEditingVoiceActor(null);
        }}
      />
      <CreateListModal
        show={showCreateListModal}
        onClose={() => {
          setShowCreateListModal(false);
          setEditingList(null);
        }}
        allAnimes={allAnimes}
        editingList={editingList}
        onSave={(list) => {
          if (editingList) {
            // 編集
            const updatedLists = evangelistLists.map(l =>
              l.id === editingList.id
                ? {
                    ...l,
                    title: list.title,
                    description: list.description,
                    animeIds: list.animeIds,
                  }
                : l
            );
            setEvangelistLists(updatedLists);
          } else {
            // 新規作成
            const newList: EvangelistList = {
              id: Date.now(),
              title: list.title,
              description: list.description,
              animeIds: list.animeIds,
              createdAt: new Date(),
            };
            setEvangelistLists([...evangelistLists, newList]);
          }
          setEditingList(null);
        }}
      />

      {/* 布教リスト詳細モーダル */}
      {selectedList && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedList(null)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-2 dark:text-white">{selectedList.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{selectedList.description}</p>
            
            {/* アニメ一覧 */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {selectedList.animeIds.length}作品
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {selectedList.animeIds.map((animeId) => {
                  const anime = allAnimes.find(a => a.id === animeId);
                  if (!anime) return null;
                  const isImageUrl = anime.image && (anime.image.startsWith('http://') || anime.image.startsWith('https://'));
                  return (
                    <div
                      key={animeId}
                      onClick={() => {
                        setSelectedAnime(anime);
                        setSelectedList(null);
                      }}
                      className="bg-linear-to-br from-[#ffc2d1] to-[#ffb07c] rounded-xl p-3 text-white text-center cursor-pointer hover:scale-105 transition-transform"
                    >
                      {isImageUrl ? (
                        <img
                          src={anime.image}
                          alt={anime.title}
                          className="w-full h-16 object-cover rounded mb-1"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            const parent = (e.target as HTMLImageElement).parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="text-3xl mb-1">🎬</div><p class="text-xs font-bold truncate">' + anime.title + '</p>';
                            }
                          }}
                        />
                      ) : (
                        <div className="text-3xl mb-1">{anime.image}</div>
                      )}
                      <p className="text-xs font-bold truncate">{anime.title}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={async () => {
                  if (navigator.share) {
                    try {
                      const animeTitles = selectedList.animeIds
                        .map(id => allAnimes.find(a => a.id === id)?.title)
                        .filter(Boolean)
                        .join('、');
                      
                      await navigator.share({
                        title: selectedList.title,
                        text: `${selectedList.description}\n\n${animeTitles}`,
                      });
                    } catch (error) {
                      console.error('Share failed:', error);
                    }
                  } else {
                    // フォールバック: テキストをクリップボードにコピー
                    const animeTitles = selectedList.animeIds
                      .map(id => allAnimes.find(a => a.id === id)?.title)
                      .filter(Boolean)
                      .join('、');
                    const shareText = `${selectedList.title}\n${selectedList.description}\n\n${animeTitles}`;
                    await navigator.clipboard.writeText(shareText);
                    alert('リストをクリップボードにコピーしました');
                  }
                }}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                📤 シェア
              </button>
              <button
                onClick={() => {
                  setEditingList(selectedList);
                  setSelectedList(null);
                  setShowCreateListModal(true);
                }}
                className="flex-1 bg-[#ffc2d1] text-white py-3 rounded-xl font-bold hover:bg-[#ffb07c] transition-colors"
              >
                編集
              </button>
              <button
                onClick={() => {
                  setEvangelistLists(evangelistLists.filter(list => list.id !== selectedList.id));
                  setSelectedList(null);
                }}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-colors"
              >
                削除
              </button>
            </div>
            
            <button
              onClick={() => setSelectedList(null)}
              className="w-full mt-3 text-gray-500 dark:text-gray-400 text-sm"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      <AddCharacterModal
        show={showAddCharacterModal}
        onClose={() => {
          setShowAddCharacterModal(false);
          setEditingCharacter(null);
        }}
        allAnimes={allAnimes}
        editingCharacter={editingCharacter}
        favoriteCharacters={favoriteCharacters}
        onSave={(character) => {
          if (editingCharacter) {
            setFavoriteCharacters(favoriteCharacters.map(c => 
              c.id === editingCharacter.id ? character : c
            ));
          } else {
            setFavoriteCharacters([...favoriteCharacters, character]);
          }
          setShowAddCharacterModal(false);
          setEditingCharacter(null);
        }}
      />

      <AddVoiceActorModal
        show={showAddVoiceActorModal}
        onClose={() => {
          setShowAddVoiceActorModal(false);
          setEditingVoiceActor(null);
        }}
        allAnimes={allAnimes}
        editingVoiceActor={editingVoiceActor}
        voiceActors={voiceActors}
        onSave={(voiceActor) => {
          if (editingVoiceActor) {
            const updated = voiceActors.map(va => 
              va.id === editingVoiceActor.id ? voiceActor : va
            );
            setVoiceActors(updated);
            if (typeof window !== 'undefined') {
              localStorage.setItem('voiceActors', JSON.stringify(updated));
            }
          } else {
            const updated = [...voiceActors, voiceActor];
            setVoiceActors(updated);
            if (typeof window !== 'undefined') {
              localStorage.setItem('voiceActors', JSON.stringify(updated));
            }
          }
          setShowAddVoiceActorModal(false);
          setEditingVoiceActor(null);
        }}
      />

      <AddQuoteModal
        show={showAddQuoteModal}
        onClose={() => {
          setShowAddQuoteModal(false);
          setEditingQuote(null);
        }}
        allAnimes={allAnimes}
        seasons={seasons}
        setSeasons={setSeasons}
        user={user}
        editingQuote={editingQuote}
        onSave={() => {
          setShowAddQuoteModal(false);
          setEditingQuote(null);
        }}
      />

      <SongModal
        show={showSongModal}
        onClose={() => {
          setShowSongModal(false);
          setSongType(null);
          setSelectedAnime(null);
          setNewSongTitle('');
          setNewSongArtist('');
        }}
        selectedAnime={selectedAnime}
        setSelectedAnime={setSelectedAnime}
        allAnimes={allAnimes}
        seasons={seasons}
        setSeasons={setSeasons}
        user={user}
        initialSongType={songType}
        initialSongTitle={newSongTitle}
        initialSongArtist={newSongArtist}
      />

      <DNAModal
        show={showDNAModal}
        onClose={() => setShowDNAModal(false)}
        allAnimes={allAnimes}
        favoriteAnimeIds={favoriteAnimeIds}
        count={count}
        averageRating={averageRating}
      />

    </div>
  );
}