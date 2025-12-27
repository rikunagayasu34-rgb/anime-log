'use client';

import { useCallback } from 'react';
import type { FavoriteCharacter } from '../types';

interface UseModalHandlersProps {
  favoriteCharacters: FavoriteCharacter[];
  setFavoriteCharacters: (characters: FavoriteCharacter[]) => void;
  editingCharacter: FavoriteCharacter | null;
  setEditingCharacter: (character: FavoriteCharacter | null) => void;
  setShowAddCharacterModal: (show: boolean) => void;
  setNewCharacterName: (name: string) => void;
  setNewCharacterAnimeId: (id: number | null) => void;
  setNewCharacterImage: (image: string) => void;
  setNewCharacterCategory: (category: string) => void;
  setNewCharacterTags: (tags: string[]) => void;
  setNewCustomTag: (tag: string) => void;
}

export function useModalHandlers({
  favoriteCharacters,
  setFavoriteCharacters,
  editingCharacter,
  setEditingCharacter,
  setShowAddCharacterModal,
  setNewCharacterName,
  setNewCharacterAnimeId,
  setNewCharacterImage,
  setNewCharacterCategory,
  setNewCharacterTags,
  setNewCustomTag,
}: UseModalHandlersProps) {

  // キャラクター保存
  const handleCharacterSave = useCallback(
    (character: FavoriteCharacter) => {
      if (editingCharacter) {
        setFavoriteCharacters(
          favoriteCharacters.map((c) => (c.id === editingCharacter.id ? character : c))
        );
      } else {
        setFavoriteCharacters([...favoriteCharacters, character]);
      }
      setShowAddCharacterModal(false);
      setEditingCharacter(null);
    },
    [editingCharacter, favoriteCharacters, setFavoriteCharacters, setShowAddCharacterModal, setEditingCharacter]
  );

  // キャラクターモーダルを閉じる
  const handleCharacterClose = useCallback(() => {
    setShowAddCharacterModal(false);
    setEditingCharacter(null);
  }, [setShowAddCharacterModal, setEditingCharacter]);

  // キャラクター追加モーダルを開く
  const handleOpenAddCharacterModal = useCallback(() => {
    setNewCharacterName('');
    setNewCharacterAnimeId(null);
    setNewCharacterImage('👤');
    setNewCharacterCategory('');
    setNewCharacterTags([]);
    setNewCustomTag('');
    setEditingCharacter(null);
    setShowAddCharacterModal(true);
  }, [
    setNewCharacterName,
    setNewCharacterAnimeId,
    setNewCharacterImage,
    setNewCharacterCategory,
    setNewCharacterTags,
    setNewCustomTag,
    setEditingCharacter,
    setShowAddCharacterModal,
  ]);

  // キャラクター編集
  const handleEditCharacter = useCallback(
    (character: FavoriteCharacter) => {
      setEditingCharacter(character);
      setNewCharacterName(character.name);
      setNewCharacterAnimeId(character.animeId);
      setNewCharacterImage(character.image);
      setNewCharacterCategory(character.category);
      setNewCharacterTags([...character.tags]);
      setNewCustomTag('');
      setShowAddCharacterModal(true);
    },
    [
      setEditingCharacter,
      setNewCharacterName,
      setNewCharacterAnimeId,
      setNewCharacterImage,
      setNewCharacterCategory,
      setNewCharacterTags,
      setNewCustomTag,
      setShowAddCharacterModal,
    ]
  );

  return {
    handleCharacterSave,
    handleCharacterClose,
    handleOpenAddCharacterModal,
    handleEditCharacter,
  };
}
