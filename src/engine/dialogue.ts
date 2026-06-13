import { GameState, Dialogue, Choice } from '../types';
import { cloneState } from './state';

/**
 * Validates whether a dialogue choice's static prereqs are satisfied.
 */
export function checkChoiceRequirements(choice: Choice, state: GameState): boolean {
  if (!choice.requires) return true;
  
  const { sq, mq, flag } = choice.requires;
  
  if (sq && !state.sq.has(sq)) return false;
  if (mq && !state.mq.has(mq)) return false;
  if (flag && !state.flags[flag]) return false;
  
  return true;
}

/**
 * Handles dialogue selection, branching, state modifications, and end triggers.
 */
export function handleDialogueChoice(
  dlg: Dialogue,
  idx: number,
  state: GameState,
  onEnterRoom: (roomId: 'B1' | 'B2' | 'B3' | 'B4') => void
): GameState {
  const nextState = cloneState(state);
  const choice = dlg.choices[idx];
  
  // Apply side effects
  if (choice.effect) {
    if (choice.effect.trust) nextState.trust += choice.effect.trust;
    if (choice.effect.aggression) nextState.aggression += choice.effect.aggression;
    if (choice.effect.suspicion) nextState.suspicion += choice.effect.suspicion;
    if (choice.effect.battery) {
      nextState.battery = Math.max(0, Math.min(100, nextState.battery + choice.effect.battery));
    }
    if (choice.effect.flag) {
      nextState.flags[choice.effect.flag] = true;
    }
  }

  // Branch routing
  if (choice.next) {
    if (choice.next.startsWith('__DLG__')) {
      nextState.currentDialogue = choice.next.replace('__DLG__', '');
      nextState.screen = 'dialogue';
    } else if (choice.next.startsWith('__PUZZLE__')) {
      nextState.currentPuzzle = choice.next.replace('__PUZZLE__', '');
      nextState.screen = 'puzzle';
    } else {
      nextState.currentDialogue = choice.next;
      nextState.screen = 'dialogue';
    }
  } else {
    // End dialogue loop
    nextState.currentDialogue = null;
    nextState.screen = 'game';
    
    // Post betrayal-choice handling (Move to B4 if just completed B3 escape segment)
    if (state.room === 'B3' && state.mq.has('MQ3') && !state.flags.B4entered) {
      nextState.flags.B4entered = true;
      setTimeout(() => onEnterRoom('B4'), 50);
    }
  }

  return nextState;
}
