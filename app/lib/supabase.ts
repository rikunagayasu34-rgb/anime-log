import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Vercel project settings.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// SNS機能用の型定義
export type UserProfile = {
  id: string;
  username: string;
  handle: string | null; // @で始まるハンドル（@なしで保存）
  bio: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type Follow = {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
};

// UUID形式かどうかを判定する関数
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// ハンドル形式かどうかを判定する関数（@で始まる、英数字・アンダースコア・ハイフンのみ）
function isHandle(str: string): boolean {
  const handleRegex = /^@?[a-z0-9_]+$/i;
  return handleRegex.test(str);
}

// ハンドルから@を除去して正規化
function normalizeHandle(handle: string): string {
  return handle.startsWith('@') ? handle.substring(1).toLowerCase() : handle.toLowerCase();
}

// ユーザー検索（ユーザー名またはハンドルで検索）
export async function searchUsers(query: string): Promise<UserProfile[]> {
  if (!query.trim()) return [];
  
  const trimmedQuery = query.trim();
  
  // ハンドル形式の場合はhandleで検索
  if (isHandle(trimmedQuery)) {
    const normalizedHandle = normalizeHandle(trimmedQuery);
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('handle', normalizedHandle)
      .eq('is_public', true)
      .limit(20);
    
    if (error) {
      console.error('Failed to search users by handle:', error);
      return [];
    }
    
    return data || [];
  }
  
  // ユーザー名で検索
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .ilike('username', `%${trimmedQuery}%`)
    .eq('is_public', true)
    .limit(20);
  
  if (error) {
    console.error('Failed to search users:', error);
    return [];
  }
  
  return data || [];
}

// おすすめユーザー取得（公開プロフィールのユーザー）
export async function getRecommendedUsers(limit: number = 10): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Failed to get recommended users:', error);
    return [];
  }
  
  return data || [];
}

// ユーザーをフォロー
export async function followUser(followingId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  const { error } = await supabase
    .from('follows')
    .insert({
      follower_id: user.id,
      following_id: followingId,
    });
  
  if (error) {
    console.error('Failed to follow user:', error);
    return false;
  }
  
  return true;
}

// ユーザーのフォローを解除
export async function unfollowUser(followingId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', followingId);
  
  if (error) {
    console.error('Failed to unfollow user:', error);
    return false;
  }
  
  return true;
}

// フォロワー一覧取得
export async function getFollowers(userId: string): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('following_id', userId);
  
  if (error) {
    console.error('Failed to get followers:', error);
    return [];
  }
  
  if (!data || data.length === 0) return [];
  
  const followerIds = data.map((item: { follower_id: string }) => item.follower_id);
  
  const { data: profiles, error: profilesError } = await supabase
    .from('user_profiles')
    .select('*')
    .in('id', followerIds);
  
  if (profilesError) {
    console.error('Failed to get follower profiles:', profilesError);
    return [];
  }
  
  return profiles || [];
}

// フォロー中一覧取得
export async function getFollowing(userId: string): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId);
  
  if (error) {
    console.error('Failed to get following:', error);
    return [];
  }
  
  if (!data || data.length === 0) return [];
  
  const followingIds = data.map((item: { following_id: string }) => item.following_id);
  
  const { data: profiles, error: profilesError } = await supabase
    .from('user_profiles')
    .select('*')
    .in('id', followingIds);
  
  if (profilesError) {
    console.error('Failed to get following profiles:', profilesError);
    return [];
  }
  
  return profiles || [];
}

// 公開プロフィール取得
export async function getPublicProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .eq('is_public', true)
    .single();
  
  if (error) {
    console.error('Failed to get public profile:', error);
    return null;
  }
  
  return data;
}

// 公開アニメ一覧取得
export async function getPublicAnimes(userId: string): Promise<unknown[]> {
  const { data, error } = await supabase
    .from('animes')
    .select('*')
    .eq('user_id', userId)
    .eq('watched', true)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Failed to get public animes:', error);
    return [];
  }
  
  return data || [];
}

// フォロー状態を確認
export async function isFollowing(followingId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  const { data, error } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', followingId)
    .single();
  
  if (error || !data) return false;
  return true;
}

// フォロー数・フォロワー数を取得
export async function getFollowCounts(userId: string): Promise<{ following: number; followers: number }> {
  const [followingResult, followersResult] = await Promise.all([
    supabase
      .from('follows')
      .select('id', { count: 'exact', head: true })
      .eq('follower_id', userId),
    supabase
      .from('follows')
      .select('id', { count: 'exact', head: true })
      .eq('following_id', userId),
  ]);
  
  return {
    following: followingResult.count || 0,
    followers: followersResult.count || 0,
  };
}

// プロフィール作成・更新
export async function upsertUserProfile(profile: {
  username: string;
  handle?: string | null;
  bio?: string;
  is_public?: boolean;
}): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  // handleを正規化（@を除去、小文字に変換）
  const normalizedProfile = {
    ...profile,
    handle: profile.handle ? normalizeHandle(profile.handle) : null,
  };
  
  const { error } = await supabase
    .from('user_profiles')
    .upsert({
      id: user.id,
      ...normalizedProfile,
      updated_at: new Date().toISOString(),
    });
  
  if (error) {
    console.error('Failed to upsert user profile:', error);
    return false;
  }
  
  return true;
}

// 自分のプロフィール取得
export async function getMyProfile(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (error) {
    // プロフィールが存在しない場合はnullを返す
    if (error.code === 'PGRST116') return null;
    console.error('Failed to get my profile:', error);
    return null;
  }
  
  return data;
}

// usernameで公開プロフィールを取得
export async function getProfileByUsername(username: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('username', username)
    .eq('is_public', true)
    .single();
  
  if (error) {
    // プロフィールが存在しない場合はnullを返す
    if (error.code === 'PGRST116') return null;
    console.error('Failed to get profile by username:', error);
    return null;
  }
  
  return data;
}

// handleで公開プロフィールを取得
export async function getProfileByHandle(handle: string): Promise<UserProfile | null> {
  const normalizedHandle = normalizeHandle(handle);
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('handle', normalizedHandle)
    .eq('is_public', true)
    .single();
  
  if (error) {
    // プロフィールが存在しない場合はnullを返す
    if (error.code === 'PGRST116') return null;
    console.error('Failed to get profile by handle:', error);
    return null;
  }
  
  return data;
}