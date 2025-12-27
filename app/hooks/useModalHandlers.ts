'use client';

import { useCallback } from 'react';
import type { EvangelistList, FavoriteCharacter, VoiceActor } from '../types';

interface UseModalHandlersProps {
  evangelistLists: EvangelistList[];
  setEvangelistLists: (lists: EvangelistList[]) => void;
  favoriteCharacters: FavoriteCharacter[];
  setFavoriteCharacters: (characters: FavoriteCharacter[]) => void;
  voiceActors: VoiceActor[];
  setVoiceActors: (actors: VoiceActor[]) => void;
  editingList: EvangelistList | null;
  setEditingList: (list: EvangelistList | null) => void;
  editingCharacter: FavoriteCharacter | null;
  setEditingCharacter: (character: FavoriteCharacter | null) => void;
  editingVoiceActor: VoiceActor | null;
  setEditingVoiceActor: (actor: VoiceActor | null) => void;
  setShowCreateListModal: (show: boolean) => void;
  setShowAddCharacterModal: (show: boolean) => void;
  setShowAddVoiceActorModal: (show: boolean) => void;
  setNewCharacterName: (name: string) => void;
  setNewCharacterAnimeId: (id: number | null) => void;
  setNewCharacterImage: (image: string) => void;
  setNewCharacterCategory: (category: string) => void;
  setNewCharacterTags: (tags: string[]) => void;
  setNewCustomTag: (tag: string) => void;
  setNewVoiceActorName: (name: string) => void;
  setNewVoiceActorImage: (image: string) => void;
  setNewVoiceActorAnimeIds: (ids: number[]) => void;
  setNewVoiceActorNotes: (notes: string) => void;
}

export function useModalHandlers({
  evangelistLists,
  setEvangelistLists,
  favoriteCharacters,
  setFavoriteCharacters,
  voiceActors,
  setVoiceActors,
  editingList,
  setEditingList,
  editingCharacter,
  setEditingCharacter,
  editingVoiceActor,
  setEditingVoiceActor,
  setShowCreateListModal,
  setShowAddCharacterModal,
  setShowAddVoiceActorModal,
  setNewCharacterName,
  setNewCharacterAnimeId,
  setNewCharacterImage,
  setNewCharacterCategory,
  setNewCharacterTags,
  setNewCustomTag,
  setNewVoiceActorName,
  setNewVoiceActorImage,
  setNewVoiceActorAnimeIds,
  setNewVoiceActorNotes,
}: UseModalHandlersProps) {
  // 布教リスト保存
  const handleCreateListSave = useCallback(
    (list: { title: string; description: string; animeIds: number[] }) => {
      if (editingList) {
        const updatedLists = evangelistLists.map((l) =>
          l.id === editingList.id
            ? { ...l, title: list.title, description: list.description, animeIds: list.animeIds }
            : l
        );
        setEvangelistLists(updatedLists);
      } else {
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
    },
    [editingList, evangelistLists, setEvangelistLists, setEditingList]
  );

  // 布教リストモーダルを閉じる
  const handleCreateListClose = useCallback(() => {
    setShowCreateListModal(false);
    setEditingList(null);
  }, [setShowCreateListModal, setEditingList]);

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

  // 声優保存
  const handleVoiceActorSave = useCallback(
    (voiceActor: VoiceActor) => {
      if (editingVoiceActor) {
        setVoiceActors(voiceActors.map((va) => (va.id === editingVoiceActor.id ? voiceActor : va)));
      } else {
        setVoiceActors([...voiceActors, voiceActor]);
      }
      setShowAddVoiceActorModal(false);
      setEditingVoiceActor(null);
    },
    [editingVoiceActor, voiceActors, setVoiceActors, setShowAddVoiceActorModal, setEditingVoiceActor]
  );

  // 声優モーダルを閉じる
  const handleVoiceActorClose = useCallback(() => {
    setShowAddVoiceActorModal(false);
    setEditingVoiceActor(null);
  }, [setShowAddVoiceActorModal, setEditingVoiceActor]);

  // 声優追加モーダルを開く
  const handleOpenAddVoiceActorModal = useCallback(() => {
    setNewVoiceActorName('');
    setNewVoiceActorImage('🎤');
    setNewVoiceActorAnimeIds([]);
    setNewVoiceActorNotes('');
    setEditingVoiceActor(null);
    setShowAddVoiceActorModal(true);
  }, [
    setNewVoiceActorName,
    setNewVoiceActorImage,
    setNewVoiceActorAnimeIds,
    setNewVoiceActorNotes,
    setEditingVoiceActor,
    setShowAddVoiceActorModal,
  ]);

  // 声優編集
  const handleEditVoiceActor = useCallback(
    (actor: VoiceActor) => {
      setEditingVoiceActor(actor);
      setNewVoiceActorName(actor.name);
      setNewVoiceActorImage(actor.image);
      setNewVoiceActorAnimeIds(actor.animeIds);
      setNewVoiceActorNotes(actor.notes || '');
      setShowAddVoiceActorModal(true);
    },
    [
      setEditingVoiceActor,
      setNewVoiceActorName,
      setNewVoiceActorImage,
      setNewVoiceActorAnimeIds,
      setNewVoiceActorNotes,
      setShowAddVoiceActorModal,
    ]
  );

  return {
    handleCreateListSave,
    handleCreateListClose,
    handleCharacterSave,
    handleCharacterClose,
    handleOpenAddCharacterModal,
    handleEditCharacter,
    handleVoiceActorSave,
    handleVoiceActorClose,
    handleOpenAddVoiceActorModal,
    handleEditVoiceActor,
  };
}
