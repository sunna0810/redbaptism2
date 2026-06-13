export interface Hotspot {
  id: string;
  x: number;
  y: number;
  label: string;
  type?: 'npc' | 'object' | string;
  clue?: string;
  puzzle?: string;
  dialog?: string;
  event?: string;
  requires?: string[];
}

export interface Room {
  name: string;
  subtitle: string;
  atmosphere: string;
  hotspots: Hotspot[];
  nextRoom: string;
  onExit?: string;
  onExitTriggered?: boolean;
}

export interface Clue {
  title: string;
  text: string;
  item?: string;
  atmosphereOnly?: boolean;
  effect?: 'suspicionMaybe' | string;
}

export interface PuzzleOption {
  id: string;
  label: string;
  vis: 'clear' | 'murky' | string;
  correct: boolean;
}

export interface PuzzlePiece {
  where: string;
  text: string;
}

export interface Puzzle {
  name: string;
  sub: string;
  desc: string;
  type: 'keypadSilent' | 'visualChoice' | 'bedGrid' | 'textInput' | 'radioDial' | 'memoAssembly' | 'compass' | string;
  answer?: any; // could be { code: string, silent: boolean }, string, number, string[] depending on type
  options?: PuzzleOption[];
  pieces?: PuzzlePiece[];
  placeholder?: string;
  warning?: string;
  hints: string[];
  reward: string[];
  onSolve?: (state: GameState, showAtmosphere: (text: string) => void) => void;
}

export interface Choice {
  text: string;
  effect?: {
    trust?: number;
    aggression?: number;
    suspicion?: number;
    battery?: number;
    flag?: string;
  };
  next?: string | null;
  requires?: {
    sq?: string;
    mq?: string;
    flag?: string;
  };
  requiresMsg?: string;
}

export interface Dialogue {
  speaker: string;
  npc?: 'NOYUNA' | 'BOSS' | 'KIM' | string;
  text: string;
  choices: Choice[];
}

export interface GameEvent {
  atmosphere: string;
  speaker?: string | null;
  text?: string;
  timed?: number;
  choices: Choice[];
  onTrigger?: (state: GameState) => void;
}

export interface MonologueLine {
  speaker: string;
  text: string;
  kind?: 'system' | 'atmosphere' | 'speaker' | string;
}

export interface Ending {
  title: string;
  id: string;
  epilogue: string;
}

export interface GameState {
  screen: 'title' | 'intro' | 'game' | 'dialogue' | 'puzzle' | 'event' | 'ending';
  room: 'B1' | 'B2' | 'B3' | 'B4' | null;
  battery: number;
  trust: number;
  aggression: number;
  suspicion: number;
  inventory: string[];
  mq: Set<string>; // Main Quests Solved
  sq: Set<string>; // Sub Quests Solved
  clues: Set<string>; // Discovered Clues
  flags: {
    jisuFound: boolean;
    serverAccessed: boolean;
    timerActive: boolean;
    timerSeconds: number;
    trustedNoYuna: boolean;
    trustedNoYunaInMQ4: boolean;
    enteredB4Cold: boolean;
    B2unlocked: boolean;
    B4entered: boolean;
    [key: string]: boolean | number;
  };
  geminiKey: string;
  geminiHistory: string[];
  introIndex: number;
  currentDialogue: string | null;
  currentEvent: string | null;
  currentPuzzle: string | null;
  hintCount: Record<string, number>;
}
