// ─────────────────────────────────────────────────────────────
//  INTRIGE — Game Constants
// ─────────────────────────────────────────────────────────────

export const CHARACTERS = {
  knez: {
    id: 'knez',
    icon: 'crown',
    color: '#FFD700',
    action: 'porez',
    blocks: 'donacija',
  },
  ubojica: {
    id: 'ubojica',
    icon: 'eye-off-outline',
    color: '#9B59B6',
    action: 'ubojstvo',
    blockedBy: 'cuvarica',
  },
  razbojnik: {
    id: 'razbojnik',
    icon: 'knife',
    color: '#E74C3C',
    action: 'pljacka',
    blockedBy: 'razbojnik',
  },
  putnik: {
    id: 'putnik',
    icon: 'bag-personal-outline',
    color: '#3498DB',
    action: 'razmjena',
  },
  cuvarica: {
    id: 'cuvarica',
    icon: 'shield-outline',
    color: '#2ECC71',
    action: null,
    blocks: 'ubojstvo',
  },
};

// 3 copies of each = 15 cards
export const CARD_COPIES = 3;
export const CHARACTER_IDS = Object.keys(CHARACTERS);

export const ACTIONS = {
  // General actions (no character claim needed)
  saberi: {
    id: 'saberi',
    isGeneral: true,
    cost: 0,
    gain: 1,
    challengeable: false,
    blockable: false,
    needsTarget: false,
  },
  donacija: {
    id: 'donacija',
    isGeneral: true,
    cost: 0,
    gain: 2,
    challengeable: false,
    blockable: true,
    blockedByCharacter: 'knez',
    blockedByAny: true, // any player claiming knez can block
    needsTarget: false,
  },
  prevrat: {
    id: 'prevrat',
    isGeneral: true,
    cost: 7,
    challengeable: false,
    blockable: false,
    needsTarget: true,
    causesInfluenceLoss: true,
  },
  // Character actions
  porez: {
    id: 'porez',
    isGeneral: false,
    character: 'knez',
    cost: 0,
    gain: 3,
    challengeable: true,
    blockable: false,
    needsTarget: false,
  },
  ubojstvo: {
    id: 'ubojstvo',
    isGeneral: false,
    character: 'ubojica',
    cost: 3,
    challengeable: true,
    blockable: true,
    blockedByCharacter: 'cuvarica',
    blockedByTargetOnly: true,
    needsTarget: true,
    causesInfluenceLoss: true,
    // Cost deducted immediately when announced
    immediateDeduct: true,
  },
  pljacka: {
    id: 'pljacka',
    isGeneral: false,
    character: 'razbojnik',
    cost: 0,
    stealAmount: 2,
    challengeable: true,
    blockable: true,
    blockedByCharacter: 'razbojnik',
    blockedByTargetOnly: true,
    needsTarget: true,
  },
  razmjena: {
    id: 'razmjena',
    isGeneral: false,
    character: 'putnik',
    cost: 0,
    challengeable: true,
    blockable: false,
    needsTarget: false,
    isExchange: true,
  },
};

export const STARTING_DUCATS = 2;
export const MANDATORY_COUP_THRESHOLD = 10;
export const STARTING_CARDS = 2;
