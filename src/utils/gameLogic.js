import { ROLES } from '../constants/roles';
import { shuffle } from './random';

// Build shuffled role assignment array from roleConfig
export function buildRoleArray(roleConfig) {
  const roles = [];
  Object.entries(roleConfig).forEach(([roleId, count]) => {
    for (let i = 0; i < count; i++) {
      roles.push(roleId);
    }
  });
  return shuffle(roles);
}

// Create initial players array (no names yet)
export function createPlayers(roleArray) {
  return roleArray.map((role, index) => ({
    id: index,
    name: '',
    role,
    isAlive: true,
  }));
}

// Resolve night actions - returns { killed, policeResult, silenced }
// nightActions: { mafia: targetId, doctor: targetId, police: targetId, lady: targetId }
export function resolveNight(players, nightActions) {
  const { mafia, doctor, lady, police } = nightActions;

  // Lady silences: the chosen player cannot speak during the day
  const silenced = lady ?? null;

  // Mafia kill
  const mafiaKillTarget = mafia ?? null;

  // Doctor save
  const doctorSaveTarget = doctor ?? null;

  // Resolve kill vs save
  let killed = null;
  if (mafiaKillTarget !== null) {
    if (doctorSaveTarget !== mafiaKillTarget) {
      killed = mafiaKillTarget;
    }
  }

  // Police result
  let policeResult = null;
  if (police !== null && police !== undefined) {
    const target = players.find((p) => p.id === police);
    if (target) {
      // Don appears innocent to police
      // Don and Lady appear innocent to police
      const role = ROLES[target.role];
      const isMafia =
        role?.team === 'mafia' && target.role !== 'don' && target.role !== 'lady';
      policeResult = {
        targetId: police,
        targetName: target.name,
        isMafia,
        label: isMafia ? '🔴 MAFIJA' : '🟢 NEVIN',
        message: isMafia
          ? `${target.name} je MAFIJA!`
          : `${target.name} je nevin mještanin.`,
      };
    }
  }

  return { killed, policeResult, silenced };
}

function findMafiaLeaderId(players) {
  const don = players.find((p) => p.role === 'don' && p.isAlive);
  if (don) return don.id;
  const mafia = players.find((p) => p.role === 'mafia' && p.isAlive);
  return mafia?.id ?? null;
}

// Check win condition
// Returns 'mafia' | 'village' | null (game continues)
export function checkWinCondition(players) {
  const alive = players.filter((p) => p.isAlive);
  const aliveMafia = alive.filter((p) => ROLES[p.role]?.team === 'mafia');
  const aliveVillage = alive.filter((p) => ROLES[p.role]?.team === 'village');

  if (aliveMafia.length === 0) return 'village';
  if (aliveMafia.length >= aliveVillage.length) return 'mafia';
  return null;
}

// Get players who should see/act during a night group phase
export function getGroupPlayers(players, groupRoles) {
  return players.filter((p) => p.isAlive && groupRoles.includes(p.role));
}

// Get all alive players (potential targets)
export function getAlivePlayers(players) {
  return players.filter((p) => p.isAlive);
}
