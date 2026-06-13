import { GameState } from '../types';

export const createInitialState = (): GameState => ({
  screen: 'title',
  room: null,
  battery: 100,
  trust: 0,
  aggression: 0,
  suspicion: 0,
  inventory: [],
  mq: new Set<string>(),
  sq: new Set<string>(),
  clues: new Set<string>(),
  flags: {
    jisuFound: false,
    serverAccessed: false,
    timerActive: false,
    timerSeconds: 1200,
    trustedNoYuna: false,
    trustedNoYunaInMQ4: false,
    enteredB4Cold: false,
    B2unlocked: false,
    B4entered: false,
  },
  geminiKey: '',
  geminiHistory: [],
  introIndex: 0,
  currentDialogue: null,
  currentEvent: null,
  currentPuzzle: null,
  hintCount: {},
});

export const cloneState = (state: GameState): GameState => {
  return {
    ...state,
    inventory: [...state.inventory],
    mq: new Set(state.mq),
    sq: new Set(state.sq),
    clues: new Set(state.clues),
    flags: { ...state.flags },
    geminiHistory: [...state.geminiHistory],
    hintCount: { ...state.hintCount },
  };
};
