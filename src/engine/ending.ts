import { GameState } from '../types';

/**
 * Evaluates the final stats and flags to determine the correct ending ID.
 */
export function decideEnding(state: GameState): 'HIDDEN' | 'END1' | 'END2' | 'END3' | 'END4' {
  const { trust, aggression, sq, flags } = state;
  
  // HIDDEN (highest priority for special path: trusted NoYuna but zero/negative trust)
  if (flags.trustedNoYuna && trust <= 0) {
    return 'HIDDEN';
  }
  
  // END1 — full exposure (requires high trust, and checking all three sub quests)
  if (trust >= 3 && sq.has('SQ1') && sq.has('SQ2') && sq.has('SQ3')) {
    return 'END1';
  }
  
  // END3 — cold scoop (aggression-dominant, leaving partner behind or being brutal)
  if (aggression >= 3) {
    return 'END3';
  }
  
  // END4 — silent escape (trusted NoYuna during the critical confrontation on MQ4)
  if (flags.trustedNoYunaInMQ4) {
    return 'END4';
  }
  
  // END2 — default wounded victory
  return 'END2';
}
