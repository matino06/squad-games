import React, { createContext, useContext, useReducer } from 'react';
import { ALIAS_WORDS_BY_LANG } from '../data/aliasWords';
import { shuffle } from '../utils/random';

const AliasContext = createContext(null);

const initialState = {
  teamA: { name: 'Tim A', score: 0, rounds: 0 },
  teamB: { name: 'Tim B', score: 0, rounds: 0 },
  roundDuration: 90,
  winScore: 50,
  currentTeam: 'A',
  roundNumber: 1,
  currentWords: [],
  wordIndex: 0,
  roundResults: [],
  phase: 'setup', // 'setup' | 'playing' | 'score'
  gameOver: false,
};

function buildWordPool(language = 'bs') {
  const pool = ALIAS_WORDS_BY_LANG[language] ?? ALIAS_WORDS_BY_LANG.bs;
  return shuffle([...pool]);
}

function aliasReducer(state, action) {
  switch (action.type) {
    case 'SET_TEAM_NAME': {
      const { team, name } = action.payload;
      if (team === 'A') return { ...state, teamA: { ...state.teamA, name } };
      return { ...state, teamB: { ...state.teamB, name } };
    }

    case 'SET_ROUND_DURATION':
      return { ...state, roundDuration: action.payload };

    case 'SET_WIN_SCORE':
      return { ...state, winScore: action.payload };

    case 'START_ROUND': {
      const words = buildWordPool(action.payload?.language);
      return {
        ...state,
        currentWords: words,
        wordIndex: 0,
        roundResults: [],
        phase: 'playing',
      };
    }

    case 'NEXT_WORD': {
      const { correct } = action.payload;
      const currentWord = state.currentWords[state.wordIndex];
      const newResults = [
        ...state.roundResults,
        { word: currentWord, correct },
      ];
      const newIndex = state.wordIndex + 1;
      return {
        ...state,
        roundResults: newResults,
        wordIndex: newIndex,
      };
    }

    case 'END_ROUND': {
      const correctCount = state.roundResults.filter((r) => r.correct).length;
      const teamKey = state.currentTeam === 'A' ? 'teamA' : 'teamB';
      const team = state[teamKey];
      const updatedTeam = { ...team, score: team.score + correctCount, rounds: team.rounds + 1 };
      const updatedState = { ...state, [teamKey]: updatedTeam, phase: 'score' };

      // Calculate current scores and rounds after this turn
      const aScore = teamKey === 'teamA' ? updatedTeam.score : state.teamA.score;
      const bScore = teamKey === 'teamB' ? updatedTeam.score : state.teamB.score;
      const aRounds = teamKey === 'teamA' ? updatedTeam.rounds : state.teamA.rounds;
      const bRounds = teamKey === 'teamB' ? updatedTeam.rounds : state.teamB.rounds;

      // Game over only when both teams have played equal rounds AND someone hit winScore
      const anyReached = aScore >= state.winScore || bScore >= state.winScore;
      const equalRounds = aRounds === bRounds;
      const gameOver = anyReached && equalRounds;

      return { ...updatedState, gameOver };
    }

    case 'NEXT_ROUND': {
      const nextTeam = state.currentTeam === 'A' ? 'B' : 'A';
      return {
        ...state,
        currentTeam: nextTeam,
        roundNumber: state.roundNumber + 1,
        currentWords: [],
        wordIndex: 0,
        roundResults: [],
        phase: 'ready',
      };
    }

    case 'RESET':
      return { ...initialState };

    case 'RESET_KEEP_SETTINGS':
      return {
        ...initialState,
        teamA: { ...initialState.teamA, name: state.teamA.name },
        teamB: { ...initialState.teamB, name: state.teamB.name },
        roundDuration: state.roundDuration,
        winScore: state.winScore,
      };

    default:
      return state;
  }
}

export function AliasProvider({ children }) {
  const [state, dispatch] = useReducer(aliasReducer, initialState);
  return (
    <AliasContext.Provider value={{ state, dispatch }}>
      {children}
    </AliasContext.Provider>
  );
}

export function useAlias() {
  const ctx = useContext(AliasContext);
  if (!ctx) throw new Error('useAlias must be used within AliasProvider');
  return ctx;
}
