'use client';

import { useMemo, useState, useCallback } from 'react';
import type { Anime, Season } from '../../types';
import { AnimeCard } from '../AnimeCard';
import { GalleryTab } from './GalleryTab';
import { WatchlistTab } from './WatchlistTab';

// フィルターの型
type FilterType = 'all' | 'unrated' | 'unwatched';

// YearHeaderコンポーネント
function YearHeader({ 
  year, 
  animes, 
  isExpanded, 
  onToggle 
}: { 
  year: string; 
  animes: Anime[]; 
  isExpanded: boolean; 
  onToggle: () => void;
}) {
  const stats = useMemo(() => {
    const total = animes.length;
    const godTier = animes.filter(a => a.rating === 5).length;
    const avgRating = animes.length > 0 
      ? (animes.reduce((sum, a) => sum + a.rating, 0) / animes.length).toFixed(1)
      : '0.0';
    return { total, godTier, avgRating };
  }, [animes]);

  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-3 px-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 rounded-xl transition-all"
    >
      <div className="flex items-center gap-3">
        <span className="text-gray-400 text-sm">
          {isExpanded ? '▼' : '▶'}
        </span>
        <span className="font-bold text-xl dark:text-white">{year}年</span>
      </div>
      
      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          <span className="font-bold" style={{ color: '#764ba2' }}>{stats.total}</span> 作品
        </span>
        <span className="text-gray-600 dark:text-gray-400">
          平均 <span className="font-bold text-orange-500">{stats.avgRating}</span>
        </span>
        <span className="text-gray-600 dark:text-gray-400">
          神作 <span className="font-bold" style={{ color: '#e879d4' }}>{stats.godTier}</span>
        </span>
      </div>
    </button>
  );
}

// SeasonHeaderコンポーネント
function SeasonHeader({ 
  season, 
  animes, 
  isExpanded, 
  onToggle 
}: { 
  season: string; 
  animes: Anime[]; 
  isExpanded: boolean; 
  onToggle: () => void;
}) {
  const stats = useMemo(() => {
    const total = animes.length;
    const godTier = animes.filter(a => a.rating === 5).length;
    const avgRating = animes.length > 0 
      ? (animes.reduce((sum, a) => sum + a.rating, 0) / animes.length).toFixed(1)
      : '0.0';
    return { total, godTier, avgRating };
  }, [animes]);

  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors ml-4"
    >
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-sm">
          {isExpanded ? '▼' : '▶'}
        </span>
        <span className="font-medium text-gray-700 dark:text-gray-300">{season}</span>
      </div>
      
      <div className="flex items-center gap-3 text-sm">
        <span className="text-gray-500 dark:text-gray-400">
          <span className="font-medium" style={{ color: '#764ba2' }}>{stats.total}</span> 作品
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          平均 <span className="font-medium text-orange-500">{stats.avgRating}</span>
        </span>
        {stats.godTier > 0 && (
          <span className="text-gray-500 dark:text-gray-400">
            神作 <span className="font-medium" style={{ color: '#e879d4' }}>{stats.godTier}</span>
          </span>
        )}
      </div>
    </button>
  );
}

export function HomeTab({
  homeSubTab,
  setHomeSubTab,
  count,
  totalRewatchCount,
  averageRating,
  seasons,
  expandedYears,
  setExpandedYears,
  expandedSeasons,
  setExpandedSeasons,
  onOpenAddForm,
  setSelectedAnime,
  allAnimes,
  user,
}: {
  homeSubTab: 'seasons' | 'series' | 'gallery' | 'watchlist';
  setHomeSubTab: (tab: 'seasons' | 'series' | 'gallery' | 'watchlist') => void;
  count: number;
  totalRewatchCount: number;
  averageRating: number;
  seasons: Season[];
  expandedYears: Set<string>;
  setExpandedYears: (years: Set<string>) => void;
  expandedSeasons: Set<string>;  // "2024-春" のような形式
  setExpandedSeasons: (seasons: Set<string>) => void;
  onOpenAddForm: () => void;
  setSelectedAnime: (anime: Anime | null) => void;
  allAnimes: Anime[];
  user: any;
}) {
  const [filter, setFilter] = useState<FilterType>('all');
  const seasonOrder = ['冬', '春', '夏', '秋'];

  // フィルター適用
  const filterAnime = useCallback((anime: Anime): boolean => {
    switch (filter) {
      case 'unrated':
        return !anime.rating || anime.rating === 0;
      case 'unwatched':
        return !anime.rewatchCount || anime.rewatchCount === 0;
      default:
        return true;
    }
  }, [filter]);

  // 年→季節→アニメの階層データを生成（フィルター適用済み）
  const yearSeasonData = useMemo(() => {
    const data = new Map<string, Map<string, Anime[]>>();
    
    seasons.forEach(season => {
      season.animes.forEach(anime => {
        // フィルター適用
        if (!filterAnime(anime)) return;
        
        // season.name から年と季節を抽出（例: "2024年春" → year: "2024", seasonName: "春"）
        const match = season.name.match(/(\d{4})年(冬|春|夏|秋)/);
        if (match) {
          const year = match[1];
          const seasonName = match[2];
          
          if (!data.has(year)) {
            data.set(year, new Map());
          }
          if (!data.get(year)!.has(seasonName)) {
            data.get(year)!.set(seasonName, []);
          }
          data.get(year)!.get(seasonName)!.push(anime);
        }
      });
    });
    
    // 年を降順でソート
    const sortedYears = Array.from(data.keys()).sort((a, b) => Number(b) - Number(a));
    
    return sortedYears
      .map(year => ({
        year,
        seasons: seasonOrder
          .filter(s => data.get(year)!.has(s) && data.get(year)!.get(s)!.length > 0)
          .map(s => ({
            season: s,
            animes: data.get(year)!.get(s)!,
          })),
        allAnimes: Array.from(data.get(year)!.values()).flat(),
      }))
      .filter(y => y.allAnimes.length > 0); // 作品がない年は非表示
  }, [seasons, filterAnime, seasonOrder]);

  // 全展開/全折りたたみ
  const expandAll = useCallback(() => {
    const allYears = new Set(yearSeasonData.map(y => y.year));
    const allSeasons = new Set<string>();
    yearSeasonData.forEach(y => {
      y.seasons.forEach(s => {
        allSeasons.add(`${y.year}-${s.season}`);
      });
    });
    setExpandedYears(allYears);
    setExpandedSeasons(allSeasons);
  }, [yearSeasonData, setExpandedYears, setExpandedSeasons]);

  const collapseAll = useCallback(() => {
    setExpandedYears(new Set());
    setExpandedSeasons(new Set());
  }, [setExpandedYears, setExpandedSeasons]);

  const isAllExpanded = expandedYears.size === yearSeasonData.length && 
    yearSeasonData.every(y => y.seasons.every(s => expandedSeasons.has(`${y.year}-${s.season}`)));

  // 年の展開切り替え
  const toggleYear = useCallback((year: string) => {
    const newExpanded = new Set(expandedYears);
    if (newExpanded.has(year)) {
      newExpanded.delete(year);
      // 年を閉じたら、その年の季節も閉じる
      const newSeasons = new Set(expandedSeasons);
      yearSeasonData.find(y => y.year === year)?.seasons.forEach(s => {
        newSeasons.delete(`${year}-${s.season}`);
      });
      setExpandedSeasons(newSeasons);
    } else {
      newExpanded.add(year);
    }
    setExpandedYears(newExpanded);
  }, [expandedYears, expandedSeasons, yearSeasonData, setExpandedYears, setExpandedSeasons]);

  // 季節の展開切り替え
  const toggleSeason = useCallback((year: string, season: string) => {
    const key = `${year}-${season}`;
    const newExpanded = new Set(expandedSeasons);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedSeasons(newExpanded);
  }, [expandedSeasons, setExpandedSeasons]);

  // フィルター後の統計
  const filteredStats = useMemo(() => {
    const filteredAnimes = allAnimes.filter(filterAnime);
    return {
      count: filteredAnimes.length,
      totalCount: allAnimes.length,
    };
  }, [allAnimes, filterAnime]);

  return (
    <>
      {/* サブタブ */}
      <div className="flex gap-2 md:gap-3 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'seasons', label: 'クール別' },
          { id: 'series', label: 'シリーズ' },
          { id: 'gallery', label: 'ギャラリー' },
          { id: 'watchlist', label: '積みアニメ' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setHomeSubTab(tab.id as typeof homeSubTab)}
            className={`px-4 md:px-6 py-2 rounded-full text-sm md:text-base font-medium whitespace-nowrap transition-all ${
              homeSubTab === tab.id
                ? 'bg-[#e879d4] text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {homeSubTab === 'seasons' && (
        <>
          {/* 統計カード */}
          <div 
            className="rounded-2xl p-5 text-white mb-6 relative"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 35%, #e879d4 65%, #f093fb 100%)'
            }}
          >
            {/* 統計情報 */}
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <p className="text-3xl font-black">{count}</p>
                <p className="text-white/80 text-xs mt-1">作品</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black">{totalRewatchCount}</p>
                <p className="text-white/80 text-xs mt-1">周</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black">
                  {averageRating > 0 ? `⭐${averageRating.toFixed(1)}` : '⭐0.0'}
                </p>
                <p className="text-white/80 text-xs mt-1">平均評価</p>
              </div>
            </div>
          </div>

          {/* コントロールバー */}
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <button 
              onClick={onOpenAddForm}
              className="py-3 px-6 border-2 border-dashed border-[#e879d4] rounded-xl text-[#e879d4] font-bold hover:border-[#d45dbf] hover:text-[#d45dbf] hover:bg-[#e879d4]/5 transition-colors"
            >
              + アニメを追加
            </button>
            
            <div className="flex items-center gap-2">
              {/* フィルター */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterType)}
                className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#e879d4]"
              >
                <option value="all">すべて</option>
                <option value="unrated">未評価</option>
                <option value="unwatched">周回未登録</option>
              </select>
              
              {/* 全展開/全折りたたみ */}
              <button
                onClick={isAllExpanded ? collapseAll : expandAll}
                className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all text-sm font-medium text-gray-600 dark:text-gray-300"
              >
                {isAllExpanded ? '全て折りたたむ' : '全て展開'}
              </button>
            </div>
          </div>

          {/* フィルター適用中の表示 */}
          {filter !== 'all' && (
            <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              {filteredStats.count} / {filteredStats.totalCount} 作品を表示中
            </div>
          )}

          {/* 年別リスト */}
          <div className="space-y-3">
            {yearSeasonData.map(({ year, seasons: yearSeasons, allAnimes }) => (
              <div key={year} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
                <YearHeader
                  year={year}
                  animes={allAnimes}
                  isExpanded={expandedYears.has(year)}
                  onToggle={() => toggleYear(year)}
                />
                
                {expandedYears.has(year) && (
                  <div className="px-2 pb-3 space-y-2">
                    {yearSeasons.map(({ season, animes }) => (
                      <div key={`${year}-${season}`}>
                        <SeasonHeader
                          season={season}
                          animes={animes}
                          isExpanded={expandedSeasons.has(`${year}-${season}`)}
                          onToggle={() => toggleSeason(year, season)}
                        />
                        
                        {expandedSeasons.has(`${year}-${season}`) && (
                          <div className="ml-8 mt-2 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 px-2">
                            {animes.map(anime => (
                              <AnimeCard 
                                key={anime.id} 
                                anime={anime}
                                onClick={() => setSelectedAnime(anime)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 作品がない場合 */}
          {yearSeasonData.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              {filter !== 'all' ? '該当する作品がありません' : 'アニメが登録されていません'}
            </p>
          )}
        </>
      )}

      {homeSubTab === 'series' && (
        <SeriesView seasons={seasons} setSelectedAnime={setSelectedAnime} onOpenAddForm={onOpenAddForm} />
      )}

      {homeSubTab === 'gallery' && (
        <GalleryTab
          allAnimes={allAnimes}
          setSelectedAnime={setSelectedAnime}
        />
      )}

      {homeSubTab === 'watchlist' && (
        <WatchlistTab
          setSelectedAnime={setSelectedAnime}
          onOpenAddForm={onOpenAddForm}
          user={user}
        />
      )}
    </>
  );
}

// シリーズビューコンポーネント（計算をメモ化）
function SeriesView({ 
  seasons, 
  setSelectedAnime,
  onOpenAddForm
}: { 
  seasons: Season[]; 
  setSelectedAnime: (anime: Anime | null) => void;
  onOpenAddForm: () => void;
}) {
  const [expandedSeries, setExpandedSeries] = useState<Set<string>>(new Set());
  const [expandedStandalone, setExpandedStandalone] = useState(false);
  const [suggestedSeasons, setSuggestedSeasons] = useState<Map<string, any[]>>(new Map());
  const [loadingSuggestions, setLoadingSuggestions] = useState<Set<string>>(new Set());
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(() => {
    // localStorageから非表示にした提案を読み込む
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dismissedAnimeSuggestions');
      return saved ? new Set(JSON.parse(saved)) : new Set<string>();
    }
    return new Set<string>();
  });

  // タイトルから期数を取得する関数
  const getSeasonNumber = (title: string): number | null => {
    const patterns = [
      /第(\d+)期/,
      /第(\d+)シーズン/i,
      /(\d+)期/,
      /Season\s*(\d+)/i,
      /S(\d+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
    }
    
    return null;
  };

  // シリーズごとのグループ化とソートをメモ化
  const { seriesArray, standaloneAnimes } = useMemo(() => {
    // すべてのアニメを取得
    const allAnimes = seasons.flatMap(s => s.animes);
    
    // シリーズごとにグループ化
    const seriesMap = new Map<string, Anime[]>();
    const standalone: Anime[] = [];
    
    allAnimes.forEach(anime => {
      if (anime.seriesName) {
        if (!seriesMap.has(anime.seriesName)) {
          seriesMap.set(anime.seriesName, []);
        }
        seriesMap.get(anime.seriesName)!.push(anime);
      } else {
        standalone.push(anime);
      }
    });
    
    // 1作品のみのシリーズは単発作品に移動
    const filteredSeriesMap = new Map<string, Anime[]>();
    seriesMap.forEach((animes, seriesName) => {
      if (animes.length > 1) {
        filteredSeriesMap.set(seriesName, animes);
      } else {
        standalone.push(...animes);
      }
    });
    
    // シリーズ内を時系列順にソート（期数とシーズン名から判断）
    filteredSeriesMap.forEach((animes) => {
      animes.sort((a, b) => {
        // 期数でソート
        const aSeasonNum = getSeasonNumber(a.title);
        const bSeasonNum = getSeasonNumber(b.title);
        
        if (aSeasonNum !== null && bSeasonNum !== null) {
          return aSeasonNum - bSeasonNum;
        }
        if (aSeasonNum !== null) return -1;
        if (bSeasonNum !== null) return 1;
        
        // 期数がない場合はシーズン名でソート
        const aSeason = seasons.find(s => s.animes.includes(a));
        const bSeason = seasons.find(s => s.animes.includes(b));
        if (aSeason && bSeason) {
          const seasonIndexA = seasons.indexOf(aSeason);
          const seasonIndexB = seasons.indexOf(bSeason);
          if (seasonIndexA !== seasonIndexB) {
            return seasonIndexA - seasonIndexB;
          }
          const animeIndexA = aSeason.animes.indexOf(a);
          const animeIndexB = bSeason.animes.indexOf(b);
          return animeIndexA - animeIndexB;
        }
        return 0;
      });
    });
    
    return {
      seriesArray: Array.from(filteredSeriesMap.entries()),
      standaloneAnimes: standalone,
    };
  }, [seasons]);

  // 未登録シーズンの提案を取得
  const fetchSuggestions = async (seriesName: string, registeredTitles: Set<string>) => {
    if (loadingSuggestions.has(seriesName) || suggestedSeasons.has(seriesName)) {
      return;
    }

    setLoadingSuggestions(prev => new Set(prev).add(seriesName));

    try {
      const { searchAnime } = await import('../../lib/anilist');
      const results = await searchAnime(seriesName);
      
      // 登録済みでない作品をフィルタリング（タイトルで比較）
      const unregistered = results.filter((anime: any) => {
        const animeId = anime.id.toString();
        // 非表示にした提案を除外
        if (dismissedSuggestions.has(animeId)) {
          return false;
        }
        
        const titleRomaji = anime.title?.romaji?.toLowerCase() || '';
        const titleNative = anime.title?.native?.toLowerCase() || '';
        
        // 登録済みタイトルと比較
        return !Array.from(registeredTitles).some(registeredTitle => {
          const lowerRegistered = registeredTitle.toLowerCase();
          return titleRomaji.includes(lowerRegistered) || 
                 titleNative.includes(lowerRegistered) ||
                 lowerRegistered.includes(titleRomaji) ||
                 lowerRegistered.includes(titleNative);
        });
      });

      if (unregistered.length > 0) {
        setSuggestedSeasons(prev => {
          const newMap = new Map(prev);
          newMap.set(seriesName, unregistered);
          return newMap;
        });
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setLoadingSuggestions(prev => {
        const newSet = new Set(prev);
        newSet.delete(seriesName);
        return newSet;
      });
    }
  };

  const toggleSeries = (seriesName: string, registeredTitles: Set<string>) => {
    const newExpanded = new Set(expandedSeries);
    if (newExpanded.has(seriesName)) {
      newExpanded.delete(seriesName);
    } else {
      newExpanded.add(seriesName);
      // 展開時に提案を取得
      fetchSuggestions(seriesName, registeredTitles);
    }
    setExpandedSeries(newExpanded);
  };

  // 提案を非表示にする
  const dismissSuggestion = (animeId: string) => {
    const newDismissed = new Set(dismissedSuggestions);
    newDismissed.add(animeId);
    setDismissedSuggestions(newDismissed);
    
    // localStorageに保存
    if (typeof window !== 'undefined') {
      localStorage.setItem('dismissedAnimeSuggestions', JSON.stringify(Array.from(newDismissed)));
    }
    
    // 提案リストから削除
    setSuggestedSeasons(prev => {
      const newMap = new Map(prev);
      newMap.forEach((suggestions, key) => {
        const filtered = suggestions.filter((s: any) => s.id.toString() !== animeId);
        if (filtered.length === 0) {
          newMap.delete(key);
        } else {
          newMap.set(key, filtered);
        }
      });
      return newMap;
    });
  };

  return (
    <div className="space-y-6">
      {/* シリーズ一覧 */}
      {seriesArray.map(([seriesName, animes]) => {
        const isExpanded = expandedSeries.has(seriesName);
        const registeredTitles = new Set(animes.map(a => a.title));
        const suggestions = suggestedSeasons.get(seriesName) || [];
        const isLoading = loadingSuggestions.has(seriesName);

        return (
          <div key={seriesName} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
            <button
              onClick={() => toggleSeries(seriesName, registeredTitles)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm">
                  {isExpanded ? '▼' : '▶'}
                </span>
                <h2 className="text-xl font-bold dark:text-white">{seriesName}</h2>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                全{animes.length}作品
              </span>
            </button>
            
            {isExpanded && (
              <div className="px-4 pb-4">
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {animes.map((anime, index) => {
                    const seasonNum = getSeasonNumber(anime.title);
                    return (
                      <div key={anime.id} className="relative">
                        {seasonNum !== null && (
                          <div className="absolute -top-1 -right-1 bg-[#e879d4] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10">
                            第{seasonNum}期
                          </div>
                        )}
                        <AnimeCard anime={anime} onClick={() => setSelectedAnime(anime)} />
                      </div>
                    );
                  })}
                </div>

                {/* 未登録シーズンの提案 */}
                {suggestions.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                      このシリーズの他の作品が見つかりました
                    </p>
                    <div className="space-y-2">
                      {suggestions.slice(0, 3).map((suggestion: any) => (
                        <div
                          key={suggestion.id}
                          className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                          onClick={() => {
                            onOpenAddForm();
                            // ここで選択された作品の情報をAddAnimeFormModalに渡す必要がある
                            // 現時点ではモーダルを開くだけ
                          }}
                        >
                          {suggestion.coverImage?.medium && (
                            <img
                              src={suggestion.coverImage.medium}
                              alt={suggestion.title.romaji || suggestion.title.native}
                              className="w-12 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                              {suggestion.title.romaji || suggestion.title.native}
                            </p>
                            {suggestion.seasonYear && suggestion.season && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {suggestion.seasonYear}年{suggestion.season === 'SPRING' ? '春' : suggestion.season === 'SUMMER' ? '夏' : suggestion.season === 'FALL' ? '秋' : '冬'}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                dismissSuggestion(suggestion.id.toString());
                              }}
                              className="px-2 py-1 text-xs bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                              title="間違っている"
                            >
                              ×
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenAddForm();
                              }}
                              className="px-3 py-1 text-xs bg-[#e879d4] text-white rounded hover:bg-[#d45dbf] transition-colors"
                            >
                              追加
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {isLoading && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      他の作品を検索中...
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      
      {/* 単発作品 */}
      {standaloneAnimes.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
          <button
            onClick={() => setExpandedStandalone(!expandedStandalone)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm">
                {expandedStandalone ? '▼' : '▶'}
              </span>
              <h2 className="text-xl font-bold dark:text-white">単発作品</h2>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              全{standaloneAnimes.length}作品
            </span>
          </button>
          
          {expandedStandalone && (
            <div className="px-4 pb-4">
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {standaloneAnimes.map((anime) => (
                  <AnimeCard
                    key={anime.id}
                    anime={anime}
                    onClick={() => setSelectedAnime(anime)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {seriesArray.length === 0 && standaloneAnimes.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          アニメが登録されていません
        </p>
      )}
    </div>
  );
}
