import React, { createContext, useContext, useReducer } from 'react';
import { buildRoleArray, createPlayers, resolveNight, checkWinCondition } from '../utils/gameLogic';

const GameContext = createContext(null);

const initialState = {
  playerCount: 6,
  roleConfig: { civilian: 3, mafia: 1, doctor: 1, police: 1 },
  players: [],
  round: 1,
  nightActions: {},
  killedLastNight: null,
  savedLastNight: null,
  doctorLastSaved: null,
  ladyLastSilenced: null,
  policeResult: null,
  silencedPlayer: null,
  eliminatedToday: null,
  winner: null,
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_PLAYER_COUNT':
      return { ...state, playerCount: action.payload };

    case 'SET_ROLE_CONFIG':
      return { ...state, roleConfig: action.payload };

    case 'ASSIGN_ROLES': {
      const roleArray = buildRoleArray(state.roleConfig);
      const players = createPlayers(roleArray);
      return { ...state, players };
    }

    case 'SET_PLAYER_NAME': {
      const players = state.players.map((p) =>
        p.id === action.payload.id ? { ...p, name: action.payload.name } : p
      );
      return { ...state, players };
    }

    case 'SET_NIGHT_ACTION': {
      return {
        ...state,
        nightActions: {
          ...state.nightActions,
          [action.payload.group]: action.payload.targetId,
        },
      };
    }

    case 'RESOLVE_NIGHT': {
      const { killed, policeResult, silenced } = resolveNight(state.players, state.nightActions);
      let players = state.players;
      if (killed !== null) {
        players = players.map((p) =>
          p.id === killed ? { ...p, isAlive: false } : p
        );
      }
      const winner = checkWinCondition(players);
      const doctorLastSaved = state.nightActions.doctor ?? null;
      const ladyLastSilenced = state.nightActions.lady ?? null;
      return {
        ...state,
        players,
        killedLastNight: killed,
        policeResult,
        silencedPlayer: silenced,
        doctorLastSaved,
        ladyLastSilenced,
        nightActions: {},
        round: state.round + 1,
        winner,
      };
    }

    case 'ELIMINATE_PLAYER': {
      const players = state.players.map((p) =>
        p.id === action.payload ? { ...p, isAlive: false } : p
      );
      const winner = checkWinCondition(players);
      return {
        ...state,
        players,
        eliminatedToday: action.payload,
        winner,
      };
    }

    case 'START_NEW_NIGHT':
      return {
        ...state,
        killedLastNight: null,
        policeResult: null,
        silencedPlayer: null,
        eliminatedToday: null,
        nightActions: {},
      };

    case 'RESET_GAME':
      return { ...initialState };

    case 'RESET_GAME_KEEP_SETTINGS':
      return {
        ...initialState,
        playerCount: state.playerCount,
        roleConfig: state.roleConfig,
      };

    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
