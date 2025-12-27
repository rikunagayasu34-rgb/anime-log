'use client';

import { useState } from 'react';
import type { FavoriteCharacter } from '../types';

export function useFormStates() {
  // キャラクター関連のフォーム状態
  const [newCharacterName, setNewCharacterName] = useState('');
  const [newCharacterAnimeId, setNewCharacterAnimeId] = useState<number | null>(null);
  const [newCharacterImage, setNewCharacterImage] = useState('👤');
  const [newCharacterCategory, setNewCharacterCategory] = useState('');
  const [newCharacterTags, setNewCharacterTags] = useState<string[]>([]);
  const [newCustomTag, setNewCustomTag] = useState('');
  const [editingCharacter, setEditingCharacter] = useState<FavoriteCharacter | null>(null);
  const [characterFilter, setCharacterFilter] = useState<string | null>(null);

  // 名言関連のフォーム状態
  const [editingQuote, setEditingQuote] = useState<{ animeId: number; quoteIndex: number } | null>(null);
  const [newQuoteAnimeId, setNewQuoteAnimeId] = useState<number | null>(null);
  const [newQuoteText, setNewQuoteText] = useState('');
  const [newQuoteCharacter, setNewQuoteCharacter] = useState('');
  const [quoteSearchQuery, setQuoteSearchQuery] = useState('');
  const [quoteFilterType, setQuoteFilterType] = useState<'all' | 'anime' | 'character'>('all');
  const [selectedAnimeForFilter, setSelectedAnimeForFilter] = useState<number | null>(null);

  // 楽曲関連のフォーム状態
  const [songType, setSongType] = useState<'op' | 'ed' | null>(null);
  const [newSongTitle, setNewSongTitle] = useState('');
  const [newSongArtist, setNewSongArtist] = useState('');

  return {
    // キャラクター関連
    newCharacterName,
    setNewCharacterName,
    newCharacterAnimeId,
    setNewCharacterAnimeId,
    newCharacterImage,
    setNewCharacterImage,
    newCharacterCategory,
    setNewCharacterCategory,
    newCharacterTags,
    setNewCharacterTags,
    newCustomTag,
    setNewCustomTag,
    editingCharacter,
    setEditingCharacter,
    characterFilter,
    setCharacterFilter,
    // 名言関連
    editingQuote,
    setEditingQuote,
    newQuoteAnimeId,
    setNewQuoteAnimeId,
    newQuoteText,
    setNewQuoteText,
    newQuoteCharacter,
    setNewQuoteCharacter,
    quoteSearchQuery,
    setQuoteSearchQuery,
    quoteFilterType,
    setQuoteFilterType,
    selectedAnimeForFilter,
    setSelectedAnimeForFilter,
    // 楽曲関連
    songType,
    setSongType,
    newSongTitle,
    setNewSongTitle,
    newSongArtist,
    setNewSongArtist,
  };
}

