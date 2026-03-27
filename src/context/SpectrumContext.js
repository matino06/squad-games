import React, { createContext, useContext, useReducer } from 'react';
import { SPECTRUM_CONCEPTS } from '../data/spectrumConcepts';
import { randomInt } from '../utils/random';

const SpectrumContext = createContext(null);

function getScore(target, guess) {
  const diff = Math.abs(target - guess);
  if (diff <= 10) return 4;
  if (diff <= 20) return 2;
  if (diff <= 30) return 1;
  return 0;
}

// Build guesser queue: all player indices except clueGiverIndex, starting after clue giver
function buildGuesserQueue(clueGiverIndex, playerCount) {
  return Array.from({ length: playerCount - 1 }, (_, i) => (clueGiverIndex + 1 + i) % playerCount);
}

const initialState = {
  players: [],
  clueGiverIndex: 0,
  guesserQueue: [],    // player indices who still need to guess this round; [0] = current guesser
  roundNumber: 1,
  winScore: 15,
  phase: 'setup',     // 'setup' | 'transition_clue' | 'clue' | 'transition_guess' | 'guess' | 'result'
  currentConcept: null,
  targetPosition: 50,
  clue: '',
  guessPosition: 50,
  roundScore: 0,       // last submitted guesser's score
  roundScores: [],     // [{playerIndex, score}] — all guessers this round
};

function spectrumReducer(state, action) {
  switch (action.type) {
    case 'ADD_PLAYER': {
      return { ...state, players: [...state.players, { name: action.payload, score: 0 }] };
    }
    case 'REMOVE_PLAYER': {
      return { ...state, players: state.players.filter((_, i) => i !== action.payload) };
    }
    case 'UPDATE_PLAYER_NAME': {
      const newP = [...state.players];
      newP[action.payload.index] = { ...newP[action.payload.index], name: action.payload.name };
      return { ...state, players: newP };
    }
    case 'START_GAME': {
      const lang = action.payload?.language ?? 'bs';
      const concept = SPECTRUM_CONCEPTS[randomInt(SPECTRUM_CONCEPTS.length)];
      const conceptLabels = concept[lang] ?? concept.bs;
      const target = 15 + randomInt(70);
      return {
        ...state,
        clueGiverIndex: 0,
        guesserQueue: buildGuesserQueue(0, state.players.length),
        roundNumber: 1,
        winScore: action.payload?.winScore ?? state.winScore,
        phase: 'transition_clue',
        currentConcept: conceptLabels,
        targetPosition: target,
        clue: '',
        guessPosition: 50,
        roundScore: 0,
        roundScores: [],
      };
    }
    case 'READY_TO_GIVE_CLUE': {
      return { ...state, phase: 'clue' };
    }
    case 'SUBMIT_CLUE': {
      return { ...state, clue: action.payload, phase: 'transition_guess' };
    }
    case 'READY_TO_GUESS': {
      // Reset slider to center for each new guesser
      return { ...state, phase: 'guess', guessPosition: 50 };
    }
    case 'SET_GUESS_POSITION': {
      return { ...state, guessPosition: action.payload };
    }
    case 'SUBMIT_GUESS': {
      const score = getScore(state.targetPosition, state.guessPosition);
      const currentGuesserIdx = state.guesserQueue[0];
      const newPlayers = [...state.players];
      newPlayers[currentGuesserIdx] = {
        ...newPlayers[currentGuesserIdx],
        score: newPlayers[currentGuesserIdx].score + score,
      };
      const newRoundScores = [...state.roundScores, { playerIndex: currentGuesserIdx, score, guessPosition: state.guessPosition }];
      const remainingQueue = state.guesserQueue.slice(1);

      if (remainingQueue.length > 0) {
        // More guessers — go to transition so next guesser can prepare
        return {
          ...state,
          players: newPlayers,
          guesserQueue: remainingQueue,
          roundScore: score,
          roundScores: newRoundScores,
          phase: 'transition_guess',
        };
      } else {
        // All guessers done — show result
        return {
          ...state,
          players: newPlayers,
          guesserQueue: [],
          roundScore: score,
          roundScores: newRoundScores,
          phase: 'result',
        };
      }
    }
    case 'NEXT_ROUND': {
      const lang = action.payload?.language ?? 'bs';
      const count = state.players.length;
      const nextClue = (state.clueGiverIndex + 1) % count;
      const concept = SPECTRUM_CONCEPTS[randomInt(SPECTRUM_CONCEPTS.length)];
      const conceptLabels = concept[lang] ?? concept.bs;
      const target = 15 + randomInt(70);
      return {
        ...state,
        clueGiverIndex: nextClue,
        guesserQueue: buildGuesserQueue(nextClue, count),
        roundNumber: state.roundNumber + 1,
        phase: 'transition_clue',
        currentConcept: conceptLabels,
        targetPosition: target,
        clue: '',
        guessPosition: 50,
        roundScore: 0,
        roundScores: [],
      };
    }
    case 'RESET':
      return { ...initialState };

    case 'RESET_KEEP_PLAYERS':
      return {
        ...initialState,
        players: state.players.map(p => ({ ...p, score: 0 })),
        winScore: state.winScore,
      };
    default:
      return state;
  }
}

export function SpectrumProvider({ children }) {
  const [state, dispatch] = useReducer(spectrumReducer, initialState);
  return <SpectrumContext.Provider value={{ state, dispatch }}>{children}</SpectrumContext.Provider>;
}

export function useSpectrum() {
  const ctx = useContext(SpectrumContext);
  if (!ctx) throw new Error('useSpectrum must be used within SpectrumProvider');
  return ctx;
}
