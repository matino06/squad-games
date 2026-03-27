import React, { createContext, useContext, useReducer } from 'react';
import { shuffle } from '../utils/random';
import {
  CHARACTERS,
  CHARACTER_IDS,
  CARD_COPIES,
  ACTIONS,
  STARTING_DUCATS,
  STARTING_CARDS,
  MANDATORY_COUP_THRESHOLD,
} from '../constants/intrigue';

const IntrigueContext = createContext(null);

// ─────────────────────────────────────────────────────────────
//  Initial state
// ─────────────────────────────────────────────────────────────
const initialState = {
  phase: 'setup', // setup | handoff | view_turn | reactions | block_challenge | challenge_proof | lose_influence | exchange | victory
  players: [],
  deck: [],
  currentPlayerIdx: 0,
  // handoff: { playerId, nextPhase, context }
  handoffTo: null,
  // pendingAction: { type, actorId, targetId, claimedCharacter }
  pendingAction: null,
  reactorQueue: [], // playerIds still to react
  currentReactorId: null,
  // pendingBlock: { blockerId, claimedCharacter }
  pendingBlock: null,
  // pendingChallenge: { challengerId, challengedId, claimedCharacter, context: 'action'|'block' }
  pendingChallenge: null,
  // loseInfluenceQueue: [{ playerId, reason }]
  loseInfluenceQueue: [],
  // exchangeDrawnCards: 2 cards drawn for Putnik exchange
  exchangeDrawnCards: [],
  winner: null,
  lastResult: null,
};

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────
function buildDeck() {
  const cards = [];
  let cardId = 0;
  for (const charId of CHARACTER_IDS) {
    for (let i = 0; i < CARD_COPIES; i++) {
      cards.push({ id: `card_${cardId++}`, character: charId, revealed: false });
    }
  }
  return shuffle(cards);
}

function dealCards(deck, players) {
  const newDeck = [...deck];
  const dealtPlayers = players.map((p) => {
    const cards = newDeck.splice(0, STARTING_CARDS).map((c) => ({
      ...c,
      revealed: false,
    }));
    return { ...p, cards };
  });
  return { players: dealtPlayers, deck: newDeck };
}

function getActivePlayers(players) {
  return players.filter((p) => p.cards.some((c) => !c.revealed));
}

function isEliminated(player) {
  return player.cards.every((c) => c.revealed);
}

function checkWinner(players) {
  const alive = players.filter((p) => !isEliminated(p));
  if (alive.length === 1) return alive[0].id;
  if (alive.length === 0) return players[players.length - 1]?.id ?? null;
  return null;
}

function nextPlayerIdx(players, currentIdx) {
  const count = players.length;
  let idx = (currentIdx + 1) % count;
  let attempts = 0;
  while (isEliminated(players[idx]) && attempts < count) {
    idx = (idx + 1) % count;
    attempts++;
  }
  return idx;
}

function buildReactorQueue(players, actorId) {
  // All non-eliminated players except actor, in turn order starting after actor
  const actorIdx = players.findIndex((p) => p.id === actorId);
  const queue = [];
  for (let i = 1; i < players.length; i++) {
    const idx = (actorIdx + i) % players.length;
    const p = players[idx];
    if (!isEliminated(p)) queue.push(p.id);
  }
  return queue;
}

function playerById(players, id) {
  return players.find((p) => p.id === id);
}

// Apply action results (ducats changes, influence loss queuing, etc.)
function applyActionSuccess(state, action) {
  let players = [...state.players];
  let deck = [...state.deck];
  let loseInfluenceQueue = [...state.loseInfluenceQueue];
  let exchangeDrawnCards = [];
  let nextPhase = 'handoff';
  let handoffTo = null;

  const actor = playerById(players, action.actorId);
  const actorIdx = players.findIndex((p) => p.id === action.actorId);

  switch (action.type) {
    case 'saberi': {
      players = players.map((p) =>
        p.id === actor.id ? { ...p, ducats: p.ducats + 1 } : p
      );
      break;
    }
    case 'donacija': {
      players = players.map((p) =>
        p.id === actor.id ? { ...p, ducats: p.ducats + 2 } : p
      );
      break;
    }
    case 'prevrat': {
      // Cost already deducted in SELECT_ACTION
      loseInfluenceQueue = [
        ...loseInfluenceQueue,
        { playerId: action.targetId, reason: 'prevrat' },
      ];
      break;
    }
    case 'porez': {
      players = players.map((p) =>
        p.id === actor.id ? { ...p, ducats: p.ducats + 3 } : p
      );
      break;
    }
    case 'ubojstvo': {
      // Cost already deducted when announced
      loseInfluenceQueue = [
        ...loseInfluenceQueue,
        { playerId: action.targetId, reason: 'ubojstvo' },
      ];
      break;
    }
    case 'pljacka': {
      const target = playerById(players, action.targetId);
      const stolen = Math.min(2, target.ducats);
      players = players.map((p) => {
        if (p.id === actor.id) return { ...p, ducats: p.ducats + stolen };
        if (p.id === action.targetId) return { ...p, ducats: p.ducats - stolen };
        return p;
      });
      break;
    }
    case 'razmjena': {
      // Draw 2 from deck privately
      const drawn = deck.splice(0, 2);
      exchangeDrawnCards = drawn;
      nextPhase = 'exchange';
      handoffTo = {
        playerId: actor.id,
        nextPhase: 'exchange',
        context: 'exchange',
      };
      break;
    }
    default:
      break;
  }

  if (nextPhase !== 'exchange') {
    // After action success, process influence losses if any
    if (loseInfluenceQueue.length > 0) {
      const next = loseInfluenceQueue[0];
      const remaining = loseInfluenceQueue.slice(1);
      handoffTo = {
        playerId: next.playerId,
        nextPhase: 'lose_influence',
        context: next.reason,
      };
      return {
        ...state,
        players,
        deck,
        phase: 'handoff',
        handoffTo,
        loseInfluenceQueue: remaining,
        exchangeDrawnCards,
        pendingAction: null,
        pendingBlock: null,
        pendingChallenge: null,
        reactorQueue: [],
        currentReactorId: null,
        lastResult: 'action_success',
      };
    }

    // No influence losses, go to next player's turn
    const nextIdx = nextPlayerIdx(players, actorIdx);
    const nextPlayer = players[nextIdx];
    handoffTo = {
      playerId: nextPlayer.id,
      nextPhase: 'view_turn',
      context: 'your_turn',
    };
  }

  // Check winner
  const winnerId = checkWinner(players);
  if (winnerId) {
    return {
      ...state,
      players,
      deck,
      phase: 'victory',
      winner: winnerId,
      exchangeDrawnCards,
      pendingAction: null,
      pendingBlock: null,
      pendingChallenge: null,
      reactorQueue: [],
      currentReactorId: null,
      loseInfluenceQueue: [],
      lastResult: 'action_success',
    };
  }

  return {
    ...state,
    players,
    deck,
    phase: nextPhase === 'exchange' ? 'handoff' : 'handoff',
    handoffTo,
    exchangeDrawnCards,
    pendingAction: null,
    pendingBlock: null,
    pendingChallenge: null,
    reactorQueue: [],
    currentReactorId: null,
    loseInfluenceQueue,
    lastResult: 'action_success',
  };
}

function processNextInfluenceLoss(state) {
  const { loseInfluenceQueue, players } = state;

  // Check winner after each loss
  const winnerId = checkWinner(players);
  if (winnerId) {
    return {
      ...state,
      phase: 'victory',
      winner: winnerId,
      pendingAction: null,
      pendingBlock: null,
      pendingChallenge: null,
      reactorQueue: [],
      currentReactorId: null,
      loseInfluenceQueue: [],
    };
  }

  if (loseInfluenceQueue.length > 0) {
    const next = loseInfluenceQueue[0];
    const remaining = loseInfluenceQueue.slice(1);
    return {
      ...state,
      phase: 'handoff',
      handoffTo: {
        playerId: next.playerId,
        nextPhase: 'lose_influence',
        context: next.reason,
      },
      loseInfluenceQueue: remaining,
      pendingAction: null,
      pendingBlock: null,
      pendingChallenge: null,
      reactorQueue: [],
      currentReactorId: null,
    };
  }

  // Done with losses — go to next player's turn
  const actorId = state.pendingAction?.actorId;
  const actorIdx = players.findIndex((p) => p.id === actorId);
  const nextIdx = nextPlayerIdx(players, actorIdx >= 0 ? actorIdx : state.currentPlayerIdx);
  const nextPlayer = players[nextIdx];
  return {
    ...state,
    phase: 'handoff',
    handoffTo: {
      playerId: nextPlayer.id,
      nextPhase: 'view_turn',
      context: 'your_turn',
    },
    pendingAction: null,
    pendingBlock: null,
    pendingChallenge: null,
    reactorQueue: [],
    currentReactorId: null,
    loseInfluenceQueue: [],
  };
}

// ─────────────────────────────────────────────────────────────
//  Reducer
// ─────────────────────────────────────────────────────────────
function intrigueReducer(state, action) {
  switch (action.type) {

    case 'SETUP_GAME': {
      const { playerNames } = action.payload;
      const deck = buildDeck();
      const rawPlayers = playerNames.map((name, idx) => ({
        id: `player_${idx}`,
        name,
        ducats: STARTING_DUCATS,
        cards: [],
      }));
      const { players, deck: remainingDeck } = dealCards(deck, rawPlayers);
      const firstPlayer = players[0];
      return {
        ...initialState,
        phase: 'handoff',
        players,
        deck: remainingDeck,
        currentPlayerIdx: 0,
        handoffTo: {
          playerId: firstPlayer.id,
          nextPhase: 'view_turn',
          context: 'your_turn',
        },
      };
    }

    case 'CONFIRM_HANDOFF': {
      const { nextPhase } = state.handoffTo ?? {};
      const actorPlayer = playerById(state.players, state.handoffTo?.playerId);
      const actorIdx = state.players.findIndex((p) => p.id === actorPlayer?.id);

      return {
        ...state,
        phase: nextPhase ?? 'view_turn',
        currentPlayerIdx: actorIdx >= 0 ? actorIdx : state.currentPlayerIdx,
        handoffTo: null,
      };
    }

    case 'SELECT_ACTION': {
      const { actionType, targetId } = action.payload;
      const actor = state.players[state.currentPlayerIdx];
      const actionDef = ACTIONS[actionType];

      // Deduct cost immediately
      let players = [...state.players];
      if (actionDef.cost > 0) {
        players = players.map((p) =>
          p.id === actor.id ? { ...p, ducats: p.ducats - actionDef.cost } : p
        );
      }

      const pendingAction = {
        type: actionType,
        actorId: actor.id,
        targetId: targetId ?? null,
        claimedCharacter: actionDef.character ?? null,
      };

      // Saberi: no reactions, instant execute
      if (actionType === 'saberi') {
        players = players.map((p) =>
          p.id === actor.id ? { ...p, ducats: p.ducats + 1 } : p
        );
        const nextIdx = nextPlayerIdx(players, state.currentPlayerIdx);
        const nextPlayer = players[nextIdx];
        return {
          ...state,
          players,
          phase: 'handoff',
          handoffTo: {
            playerId: nextPlayer.id,
            nextPhase: 'view_turn',
            context: 'your_turn',
          },
          pendingAction: null,
          lastResult: 'action_success',
        };
      }

      // Prevrat: no reactions, instant — queue influence loss
      if (actionType === 'prevrat') {
        const loseInfluenceQueue = [{ playerId: targetId, reason: 'prevrat' }];
        const winnerId = checkWinner(players);
        if (winnerId) {
          return {
            ...state,
            players,
            phase: 'victory',
            winner: winnerId,
            pendingAction: null,
          };
        }
        return {
          ...state,
          players,
          phase: 'handoff',
          handoffTo: {
            playerId: targetId,
            nextPhase: 'lose_influence',
            context: 'prevrat',
          },
          loseInfluenceQueue: [], // will process remaining after this one
          pendingAction: { ...pendingAction, actorId: actor.id },
          lastResult: null,
        };
      }

      // Build reactor queue for all other actions
      const reactorQueue = buildReactorQueue(players, actor.id);
      const currentReactorId = reactorQueue[0] ?? null;

      if (!currentReactorId) {
        // No reactors (only 1 player? shouldn't happen, but handle)
        return applyActionSuccess(
          { ...state, players, pendingAction, loseInfluenceQueue: state.loseInfluenceQueue },
          pendingAction
        );
      }

      // Handoff to first reactor
      return {
        ...state,
        players,
        phase: 'handoff',
        handoffTo: {
          playerId: currentReactorId,
          nextPhase: 'reactions',
          context: 'react',
        },
        pendingAction,
        reactorQueue: reactorQueue.slice(1),
        currentReactorId,
        lastResult: null,
      };
    }

    case 'REACT': {
      const { playerId, reaction, claimedCharacter } = action.payload;
      const { pendingAction, reactorQueue, players } = state;
      const actionDef = ACTIONS[pendingAction.type];

      if (reaction === 'challenge') {
        // Challenge the actor's character claim
        return {
          ...state,
          phase: 'handoff',
          handoffTo: {
            playerId: pendingAction.actorId,
            nextPhase: 'challenge_proof',
            context: 'action',
          },
          pendingChallenge: {
            challengerId: playerId,
            challengedId: pendingAction.actorId,
            claimedCharacter: pendingAction.claimedCharacter,
            context: 'action',
          },
          reactorQueue: [],
          currentReactorId: null,
        };
      }

      if (reaction === 'block') {
        // Block: now actor reacts to the block
        const pendingBlock = { blockerId: playerId, claimedCharacter };
        return {
          ...state,
          phase: 'handoff',
          handoffTo: {
            playerId: pendingAction.actorId,
            nextPhase: 'block_challenge',
            context: 'block',
          },
          pendingBlock,
          reactorQueue: [],
          currentReactorId: null,
        };
      }

      // Accept: advance to next reactor or execute action
      if (reactorQueue.length === 0) {
        // All accepted — execute action
        return applyActionSuccess(
          { ...state, players },
          pendingAction
        );
      }

      const nextReactorId = reactorQueue[0];
      return {
        ...state,
        phase: 'handoff',
        handoffTo: {
          playerId: nextReactorId,
          nextPhase: 'reactions',
          context: 'react',
        },
        reactorQueue: reactorQueue.slice(1),
        currentReactorId: nextReactorId,
      };
    }

    case 'BLOCK_REACTION': {
      // Actor's response to a block: 'accept' or 'challenge'
      const { reaction } = action.payload;
      const { pendingBlock, pendingAction, players } = state;

      if (reaction === 'accept') {
        // Block succeeds — action fails
        // Ubojstvo: cost already deducted from actor, no refund (per rules)
        const actorIdx = players.findIndex((p) => p.id === pendingAction.actorId);
        const nextIdx = nextPlayerIdx(players, actorIdx);
        const nextPlayer = players[nextIdx];
        return {
          ...state,
          phase: 'handoff',
          handoffTo: {
            playerId: nextPlayer.id,
            nextPhase: 'view_turn',
            context: 'your_turn',
          },
          pendingAction: null,
          pendingBlock: null,
          reactorQueue: [],
          currentReactorId: null,
          lastResult: 'action_blocked',
        };
      }

      if (reaction === 'challenge') {
        // Challenge the block — blocker must prove their character
        return {
          ...state,
          phase: 'handoff',
          handoffTo: {
            playerId: pendingBlock.blockerId,
            nextPhase: 'challenge_proof',
            context: 'block',
          },
          pendingChallenge: {
            challengerId: pendingAction.actorId,
            challengedId: pendingBlock.blockerId,
            claimedCharacter: pendingBlock.claimedCharacter,
            context: 'block',
          },
        };
      }

      return state;
    }

    case 'REVEAL_FOR_CHALLENGE': {
      // Challenged player reveals a card to prove/disprove their claim
      const { cardId, hasCard } = action.payload;
      const { pendingChallenge, players, deck } = state;
      let updatedPlayers = [...players];
      let updatedDeck = [...deck];
      let loseInfluenceQueue = [...state.loseInfluenceQueue];

      if (hasCard) {
        // Challenger loses — challenged player proved their claim
        // Replace proved card with new card from deck
        updatedPlayers = updatedPlayers.map((p) => {
          if (p.id !== pendingChallenge.challengedId) return p;
          const newCard = updatedDeck.length > 0 ? updatedDeck.splice(0, 1)[0] : null;
          const newCards = p.cards.map((c) => {
            if (c.id !== cardId) return c;
            return newCard ? { ...newCard, revealed: false } : c;
          });
          // Return old card to bottom of deck
          const oldCard = p.cards.find((c) => c.id === cardId);
          if (oldCard) updatedDeck = [...updatedDeck, { ...oldCard, revealed: false }];
          return { ...p, cards: newCards };
        });
        // Challenger loses 1 influence
        loseInfluenceQueue = [
          { playerId: pendingChallenge.challengerId, reason: 'challenge_lost' },
          ...loseInfluenceQueue,
        ];

        // If challenge was against an action, action proceeds
        // loseInfluenceQueue already has challenger's loss prepended — applyActionSuccess
        // will pick it up and route to lose_influence first, then execute the action effect
        if (pendingChallenge.context === 'action') {
          return applyActionSuccess(
            {
              ...state,
              players: updatedPlayers,
              deck: updatedDeck,
              pendingChallenge: null,
              loseInfluenceQueue,
            },
            state.pendingAction
          );
        }

        // Challenge was against a block — block fails, action proceeds
        if (pendingChallenge.context === 'block') {
          return applyActionSuccess(
            {
              ...state,
              players: updatedPlayers,
              deck: updatedDeck,
              pendingChallenge: null,
              pendingBlock: null,
              loseInfluenceQueue,
            },
            state.pendingAction
          );
        }
      } else {
        // hasCard === false: Challenged player was bluffing — they lose 1 influence
        // Action/block fails
        loseInfluenceQueue = [
          { playerId: pendingChallenge.challengedId, reason: 'challenge_won' },
          ...loseInfluenceQueue,
        ];

        const challengedIdx = updatedPlayers.findIndex((p) => p.id === pendingChallenge.challengedId);
        const actorIdx = updatedPlayers.findIndex((p) => p.id === state.pendingAction?.actorId);

        return {
          ...state,
          players: updatedPlayers,
          deck: updatedDeck,
          phase: 'handoff',
          handoffTo: {
            playerId: pendingChallenge.challengedId,
            nextPhase: 'lose_influence',
            context: 'challenge_won',
          },
          pendingAction: null,
          pendingBlock: null,
          pendingChallenge: null,
          reactorQueue: [],
          currentReactorId: null,
          loseInfluenceQueue: loseInfluenceQueue.slice(1), // will process the first one
          lastResult: 'action_failed',
        };
      }

      return state;
    }

    case 'CHOOSE_INFLUENCE_TO_LOSE': {
      const { playerId, cardId } = action.payload;
      let players = state.players.map((p) => {
        if (p.id !== playerId) return p;
        return {
          ...p,
          cards: p.cards.map((c) =>
            c.id === cardId ? { ...c, revealed: true } : c
          ),
        };
      });

      // Check winner
      const winnerId = checkWinner(players);
      if (winnerId) {
        return {
          ...state,
          players,
          phase: 'victory',
          winner: winnerId,
          pendingAction: null,
          pendingBlock: null,
          pendingChallenge: null,
          reactorQueue: [],
          currentReactorId: null,
          loseInfluenceQueue: [],
        };
      }

      return processNextInfluenceLoss({ ...state, players });
    }

    case 'CONFIRM_EXCHANGE': {
      const { keepCardIds } = action.payload;
      const actor = state.players[state.currentPlayerIdx];
      const allCards = [...actor.cards, ...state.exchangeDrawnCards];
      const kept = allCards.filter((c) => keepCardIds.includes(c.id));
      const returned = allCards.filter((c) => !keepCardIds.includes(c.id));

      let players = state.players.map((p) => {
        if (p.id !== actor.id) return p;
        return { ...p, cards: kept.map((c) => ({ ...c, revealed: false })) };
      });

      // Return unchosen cards to bottom of deck
      const updatedDeck = [...state.deck, ...returned.map((c) => ({ ...c, revealed: false }))];

      const nextIdx = nextPlayerIdx(players, state.currentPlayerIdx);
      const nextPlayer = players[nextIdx];

      const winnerId = checkWinner(players);
      if (winnerId) {
        return {
          ...state,
          players,
          deck: updatedDeck,
          phase: 'victory',
          winner: winnerId,
          exchangeDrawnCards: [],
          pendingAction: null,
        };
      }

      return {
        ...state,
        players,
        deck: updatedDeck,
        phase: 'handoff',
        handoffTo: {
          playerId: nextPlayer.id,
          nextPhase: 'view_turn',
          context: 'your_turn',
        },
        exchangeDrawnCards: [],
        pendingAction: null,
        lastResult: 'action_success',
      };
    }

    case 'RESET':
      return { ...initialState };

    default:
      return state;
  }
}

// ─────────────────────────────────────────────────────────────
//  Provider
// ─────────────────────────────────────────────────────────────
export function IntrigueProvider({ children }) {
  const [state, dispatch] = useReducer(intrigueReducer, initialState);
  return (
    <IntrigueContext.Provider value={{ state, dispatch }}>
      {children}
    </IntrigueContext.Provider>
  );
}

export function useIntrigue() {
  const ctx = useContext(IntrigueContext);
  if (!ctx) throw new Error('useIntrigue must be used within IntrigueProvider');
  return ctx;
}
