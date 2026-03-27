import React, { createContext, useContext, useReducer } from 'react';
import { WORD_PAIRS_BY_LANG } from '../data/imposterWords';
import { randomInt } from '../utils/random';

const ImposterContext = createContext(null);

const initialState = {
  playerCount: 5,
  players: [],
  wordPair: null,
  winner: null,       // 'village' | 'imposter'
  eliminatedPlayer: null,
};

function imposterReducer(state, action) {
  switch (action.type) {
    case 'START_GAME': {
      const { playerCount, language } = action.payload;
      const pairs = WORD_PAIRS_BY_LANG[language] ?? WORD_PAIRS_BY_LANG.bs;
      const wordPair = pairs[randomInt(pairs.length)];
      const imposterIndex = randomInt(playerCount);
      const players = Array.from({ length: playerCount }, (_, i) => ({
        id: i,
        name: '',
        word: i === imposterIndex ? wordPair.category : wordPair.main,
        isImposter: i === imposterIndex,
      }));
      return { ...state, playerCount, players, wordPair, winner: null, eliminatedPlayer: null };
    }

    case 'SET_PLAYER_NAME': {
      const players = state.players.map((p) =>
        p.id === action.payload.id ? { ...p, name: action.payload.name } : p
      );
      return { ...state, players };
    }

    case 'ELIMINATE_PLAYER': {
      const eliminated = state.players.find((p) => p.id === action.payload);
      const winner = eliminated?.isImposter ? 'village' : 'imposter';
      return { ...state, eliminatedPlayer: action.payload, winner };
    }

    case 'RESET':
      return { ...initialState };

    case 'RESET_KEEP_SETTINGS':
      return {
        ...initialState,
        playerCount: state.playerCount,
        players: state.players.map(p => ({ id: p.id, name: p.name, word: '', isImposter: false })),
      };

    default:
      return state;
  }
}

export function ImposterProvider({ children }) {
  const [state, dispatch] = useReducer(imposterReducer, initialState);
  return (
    <ImposterContext.Provider value={{ state, dispatch }}>
      {children}
    </ImposterContext.Provider>
  );
}

export function useImposter() {
  const ctx = useContext(ImposterContext);
  if (!ctx) throw new Error('useImposter must be used within ImposterProvider');
  return ctx;
}
