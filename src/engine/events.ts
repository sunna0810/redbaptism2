import { GameState, GameEvent, Choice } from '../types';
import { GAME_DATA } from '../data/gameData';
import { cloneState } from './state';

/**
 * Handles choice selection in events, performing state modifications and routing.
 */
export function handleEventChoice(
  evt: GameEvent,
  idx: number,
  state: GameState,
  onEnterRoom: (roomId: 'B1' | 'B2' | 'B3' | 'B4') => void,
  onOpenDialogue: (dialogId: string) => void,
  onOpenPuzzle: (puzzleId: string) => void,
  onTriggerEnding: () => void,
  showAtmosphere: (text: string) => void
): GameState {
  const nextState = cloneState(state);
  const choice = evt.choices[idx];
  
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

  // Clear event tracking
  nextState.currentEvent = null;

  // Next destination checks
  if (choice.next) {
    if (choice.next.startsWith('__DLG__')) {
      nextState.currentDialogue = choice.next.replace('__DLG__', '');
      nextState.screen = 'dialogue';
      return nextState;
    }
    if (choice.next.startsWith('__PUZZLE__')) {
      nextState.currentPuzzle = choice.next.replace('__PUZZLE__', '');
      nextState.screen = 'puzzle';
      return nextState;
    }
  }

  // Special scenario-specific flows for standard event selections
  const currentEventId = state.currentEvent;
  if (currentEventId === 'EVT_CHASING') {
    // Escaped the chasing event, move to B3
    setTimeout(() => onEnterRoom('B3'), 100);
  } else if (currentEventId === 'EVT_BETRAYAL') {
    if (idx === 0) {
      // Dialog chosen, transition directly to the betrayal dialogue
      nextState.currentDialogue = 'DLG_NY_BETRAYAL';
      nextState.screen = 'dialogue';
    } else {
      // Skipped debate, directly breach boss room
      setTimeout(() => onEnterRoom('B4'), 100);
    }
  } else if (currentEventId === 'EVT_ESCAPE') {
    // Open the final orientation compass puzzle
    setTimeout(() => onOpenPuzzle('MQ5'), 100);
  } else if (currentEventId === 'EVT_JISU_FOUND') {
    nextState.screen = 'game';
  } else {
    nextState.screen = 'game';
  }

  return nextState;
}

/**
 * Handles room transition requirements, triggering escape blocks or post-exit traps if defined.
 */
export function tryAdvanceRoom(
  state: GameState,
  onEnterRoom: (roomId: 'B1' | 'B2' | 'B3' | 'B4') => void,
  onTriggerEvent: (eventId: string) => void,
  onTriggerEnding: () => void
): GameState {
  const nextState = cloneState(state);
  const room = GAME_DATA.rooms[state.room || 'B1'];
  
  if (!room) return nextState;

  // If room exit event is defined and hasn't been triggered yet
  if (room.onExit && !state.flags['exit_' + state.room]) {
    nextState.flags['exit_' + state.room] = true;
    setTimeout(() => onTriggerEvent(room.onExit!), 50);
    return nextState;
  }

  if (room.nextRoom === 'ENDING') {
    setTimeout(onTriggerEnding, 50);
    return nextState;
  }

  // Normal progression
  setTimeout(() => onEnterRoom(room.nextRoom as 'B1' | 'B2' | 'B3' | 'B4'), 100);
  return nextState;
}
