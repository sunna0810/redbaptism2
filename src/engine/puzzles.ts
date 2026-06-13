import { GameState, Puzzle } from '../types';
import { GAME_DATA } from '../data/gameData';
import { cloneState } from './state';

export interface ValidationResult {
  correct: boolean;
  message: string;
  batteryLost?: number;
  suspicionGained?: number;
}

/**
 * Validates any puzzle input based on type-specific escape rules.
 */
export function validatePuzzleInput(
  puzzleId: string,
  input: any,
  silentMode: boolean,
  state: GameState
): ValidationResult {
  const p = GAME_DATA.puzzles[puzzleId];
  if (!p) return { correct: false, message: '퍼즐을 찾을 수 없습니다.' };

  switch (p.type) {
    case 'keypadSilent': {
      const code = String(input);
      if (code !== p.answer.code) {
        return { correct: false, message: '번호가 맞지 않는다.' };
      }
      if (!silentMode) {
        return { 
          correct: false, 
          message: '레버가 삐걱거린다. 어디선가 발걸음 소리. (임선아가 가까워지며 배터리 감점)', 
          batteryLost: 3 
        };
      }
      return { correct: true, message: '— 금고가 침묵 속에서 열린다 —' };
    }

    case 'visualChoice': {
      const id = String(input);
      const opt = p.options?.find(o => o.id === id);
      if (opt?.correct) {
        return { correct: true, message: '성분 분석 완료: 뇌파 억제 화합물 검출.' };
      }
      return { correct: false, message: '일반 식수. 의미 없음.' };
    }

    case 'bedGrid': {
      const sel = String(input);
      if (sel === p.answer) {
        return { correct: true, message: '매트리스 아래 — 봉인 봉투 발견.' };
      }
      if (sel === '46') {
        return { 
          correct: false, 
          message: '46번 — 평범한 빈 침대. 노윤아의 말은 거짓이었다.', 
          suspicionGained: 1 
        };
      }
      return { correct: false, message: '다른 사람의 침대다.' };
    }

    case 'textInput':
    case 'memoAssembly': {
      const v = String(input).trim().toUpperCase();
      const answers = Array.isArray(p.answer) ? p.answer : [p.answer];
      const ok = answers.some((a: string) => a.toUpperCase() === v);
      if (ok) {
        return { correct: true, message: '— 잠금 해제 —' };
      }
      return { correct: false, message: '정답이 아니다.' };
    }

    case 'radioDial': {
      const ch = Number(input);
      if (ch === p.answer) {
        return { correct: true, message: '— 두 목소리. 노윤아와 — 교주. "B4 암호 변경. 광휘-2404." —' };
      }
      return { correct: false, message: '이 채널이 아니다.' };
    }

    case 'compass': {
      const dir = String(input);
      if (dir === p.answer) {
        return { correct: true, message: '— 새벽 공기. 지상이다. —' };
      }
      return { 
        correct: false, 
        message: '막힌 통로다. 되돌아온다.', 
        batteryLost: 3 
      };
    }

    default:
      return { correct: false, message: '알 수 없는 퍼즐 유형입니다.' };
  }
}

/**
 * Executes a puzzle solve event, applying rewards and updating core state metrics.
 */
export function applyPuzzleSolve(
  puzzleId: string,
  state: GameState,
  showAtmosphere: (text: string) => void
): GameState {
  const nextState = cloneState(state);
  const p = GAME_DATA.puzzles[puzzleId];
  if (!p) return nextState;

  // Execute internal onSolve of puzzle (uses static definitions but updates nextState copies safely)
  if (p.onSolve) {
    p.onSolve(nextState, showAtmosphere);
  } else {
    // Fallback automatic solve logger
    nextState.mq.add(puzzleId);
  }

  // Clear current puzzle focusing
  nextState.currentPuzzle = null;
  nextState.screen = 'game';

  return nextState;
}
