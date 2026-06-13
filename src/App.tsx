import React, { useState, useEffect } from 'react';
import { GameState, Hotspot } from './types';
import { createInitialState, cloneState } from './engine/state';
import { GAME_DATA } from './data/gameData';
import { checkChoiceRequirements, handleDialogueChoice } from './engine/dialogue';
import { handleEventChoice, tryAdvanceRoom } from './engine/events';
import { validatePuzzleInput, applyPuzzleSolve } from './engine/puzzles';
import { decideEnding } from './engine/ending';
import { Gemini } from './engine/gemini';
import { HUD, SidePanel } from './renderer/hud';
import { RoomView } from './renderer/rooms';
import {
  TitleScreen,
  ApiKeyModal,
  NarrativeScreen,
  DialogueScreen,
  EventScreen,
  PuzzleScreen,
  EndingScreen,
  FlashModal,
  StatusModal,
} from './renderer/screens';

export default function App() {
  const [state, setState] = useState<GameState>(createInitialState());
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [atmosphereText, setAtmosphereText] = useState<string | null>(null);
  const [flashText, setFlashText] = useState<string | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const [dynamicDialogueText, setDynamicDialogueText] = useState<string | null>(null);

  // Helper: Deep copies state, modifies it run-time, and forces React re-render cleanly.
  const updateState = (updater: (s: GameState) => void) => {
    setState((prev) => {
      const next = cloneState(prev);
      updater(next);
      return next;
    });
  };

  // ---------------------------------------------------------------------
  // SELF DESTRUCT TIMER
  // ---------------------------------------------------------------------
  useEffect(() => {
    if (!state.flags.timerActive) return;

    const interval = setInterval(() => {
      setState((prev) => {
        if (!prev.flags.timerActive) {
          clearInterval(interval);
          return prev;
        }
        if (prev.flags.timerSeconds <= 1) {
          clearInterval(interval);
          const next = cloneState(prev);
          next.flags.timerActive = false;
          next.screen = 'ending';
          next.currentDialogue = null;
          next.currentEvent = null;
          next.currentPuzzle = null;
          // Force END3 (Cold Scoop) on timeout
          return next;
        }
        const next = cloneState(prev);
        next.flags.timerSeconds--;
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.flags.timerActive]);

  // ---------------------------------------------------------------------
  // GEMINI DYNAMIC DIALOGUE GENERATION
  // ---------------------------------------------------------------------
  useEffect(() => {
    if (state.screen !== 'dialogue' || !state.currentDialogue || !state.geminiKey) {
      setDynamicDialogueText(null);
      return;
    }

    const dlg = GAME_DATA.dialogues[state.currentDialogue];
    if (!dlg || !dlg.npc) return;

    let active = true;

    const fetchDynamicSpeech = async () => {
      const npcPrompts: Record<string, string> = {
        NOYUNA: '당신은 노윤아입니다. 전직 기자, 현재 교주의 첩자. 딸의 안전을 위해 3년 전 포섭됨. 불안하고 죄책감 있음. 한국어, 60자 이내.',
        BOSS: '당신은 교주 박규빈입니다. 전직 정관계 로비스트. 자신을 실험자라고 생각함. 항상 차분하고 합리적. 한국어, 80자 이내.',
        KIM: '당신은 편집장 김재원입니다. 냉정하고 건조함. 무전기 품질로 끊김. 한국어, 40자 이내.',
      };

      const sys = npcPrompts[dlg.npc!];
      if (!sys) return;

      const userCtx = `현재 구역: ${state.room}, 신뢰도: ${state.trust}, 의심: ${state.suspicion}. 원본 대사: "${dlg.text}". 같은 의미·톤을 유지하며 같은 정보를 전달하되 자연스럽게 다시 써 주세요.`;
      
      const res = await Gemini.generate(state.geminiKey, sys, userCtx);
      if (active && res) {
        setDynamicDialogueText(res);
      }
    };

    fetchDynamicSpeech();

    return () => {
      active = false;
    };
  }, [state.screen, state.currentDialogue, state.geminiKey]);

  // ---------------------------------------------------------------------
  // GAME ACTION FLOW ROUTING
  // ---------------------------------------------------------------------
  const handleStartGame = () => {
    updateState((s) => {
      s.screen = 'intro';
      s.introIndex = 0;
    });
  };

  const handleFinishIntro = () => {
    handleEnterRoom('B1', true);
  };

  const handleEnterRoom = (roomId: 'B1' | 'B2' | 'B3' | 'B4', skipMono = false) => {
    updateState((s) => {
      s.room = roomId;
      s.screen = 'game';
    });

    // Show monologue intro if specified for the zone
    if (!skipMono && GAME_DATA.monologues[roomId]) {
      updateState((s) => {
        s.screen = 'intro';
        s.introIndex = 0;
      });
    }
  };

  const handleHotspotClick = (h: Hotspot) => {
    if (h.type === 'npc' && h.dialog) {
      updateState((s) => {
        s.currentDialogue = h.dialog!;
        s.screen = 'dialogue';
      });
      return;
    }
    if (h.event) {
      handleTriggerEvent(h.event);
      return;
    }
    if (h.puzzle) {
      updateState((s) => {
        s.currentPuzzle = h.puzzle!;
        s.screen = 'puzzle';
      });
      return;
    }
    if (h.clue) {
      handleDiscoverClue(h.clue);
      return;
    }
  };

  const handleDiscoverClue = (clueId: string) => {
    const alreadyHad = state.clues.has(clueId);
    
    updateState((s) => {
      s.clues.add(clueId);
      const clue = GAME_DATA.clues[clueId];
      if (clue) {
        if (!alreadyHad && clue.item) {
          s.inventory.push(clue.item);
        }
        if (!alreadyHad && clue.effect === 'suspicionMaybe') {
          s.suspicion += 1;
        }
      }
    });

    const clue = GAME_DATA.clues[clueId];
    if (clue) {
      setAtmosphereText(`[단서 발견: ${clue.title}]\n\n${clue.text}`);
    }
  };

  const handleTriggerEvent = (eventId: string) => {
    const evt = GAME_DATA.events[eventId];
    if (!evt) return;

    updateState((s) => {
      s.currentEvent = eventId;
      s.screen = 'event';
    });

    if (evt.onTrigger) {
      updateState((s) => {
        evt.onTrigger!(s);
      });
    }
  };

  const handleDialogueChoiceSelect = (choiceIdx: number) => {
    if (!state.currentDialogue) return;
    const dlg = GAME_DATA.dialogues[state.currentDialogue];
    if (!dlg) return;

    const next = handleDialogueChoice(dlg, choiceIdx, state, handleEnterRoom);
    setState(next);
  };

  const handleEventChoiceSelect = (choiceIdx: number) => {
    if (!state.currentEvent) return;
    const evt = GAME_DATA.events[state.currentEvent];
    if (!evt) return;

    const next = handleEventChoice(
      evt,
      choiceIdx,
      state,
      handleEnterRoom,
      (dlgId) => updateState((s) => { s.currentDialogue = dlgId; s.screen = 'dialogue'; }),
      (puzId) => updateState((s) => { s.currentPuzzle = puzId; s.screen = 'puzzle'; }),
      handleTriggerEnding,
      (text) => setAtmosphereText(text)
    );
    setState(next);
  };

  const handleValidatePuzzle = (input: any, silentMode: boolean) => {
    if (!state.currentPuzzle) return { correct: false, message: '진행 중인 퍼즐이 없습니다.' };

    const res = validatePuzzleInput(state.currentPuzzle, input, silentMode, state);
    if (res.batteryLost) {
      updateState((s) => {
        s.battery = Math.max(0, s.battery - res.batteryLost!);
      });
    }
    if (res.suspicionGained) {
      updateState((s) => {
        s.suspicion += res.suspicionGained!;
      });
    }
    return res;
  };

  const handleSolvePuzzle = () => {
    if (!state.currentPuzzle) return;
    const puzId = state.currentPuzzle;

    updateState((s) => {
      const updated = applyPuzzleSolve(puzId, s, (text) => setAtmosphereText(text));
      
      // Auto solver special reactions
      if (puzId === 'MQ4') {
        updated.flags.serverAccessed = true;
        updated.flags.timerActive = true;
        updated.flags.timerSeconds = 1200; // 20 minutes
      }

      // Propagate Set operations manually to trigger state changes
      if (puzId.startsWith('MQ')) updated.mq.add(puzId);
      if (puzId.startsWith('SQ')) updated.sq.add(puzId);

      // Mutate status checks
      s.screen = 'game';
      s.currentPuzzle = null;
      s.battery = updated.battery;
      s.inventory = updated.inventory;
      s.mq = updated.mq;
      s.sq = updated.sq;
      s.flags = updated.flags;
      s.suspicion = updated.suspicion;
    });

    // Check advance room triggers
    setTimeout(() => {
      if (puzId === 'MQ1' || puzId === 'MQ2' || puzId === 'MQ3') {
        setState((prev) => {
          return tryAdvanceRoom(
            prev,
            handleEnterRoom,
            handleTriggerEvent,
            handleTriggerEnding
          );
        });
      }
      if (puzId === 'MQ5') {
        handleTriggerEnding();
      }
    }, 1200);
  };

  const handleTriggerEnding = () => {
    const endingId = decideEnding(state);
    updateState((s) => {
      s.flags.timerActive = false;
      s.screen = 'ending';
      s.currentDialogue = null;
      s.currentEvent = null;
      s.currentPuzzle = null;
      s.room = null;
    });
    // Set to final screen ending explicitly
    setState((prev) => {
      const next = cloneState(prev);
      next.screen = 'ending';
      next.currentDialogue = endingId; // Storage target is endings[endingId]
      return next;
    });
  };

  const handleRestartGame = (skipTitle: boolean) => {
    const initial = createInitialState();
    if (skipTitle) {
      initial.screen = 'intro';
      initial.introIndex = 0;
    }
    setState(initial);
    setDynamicDialogueText(null);
  };

  // ---------------------------------------------------------------------
  // HINTS & STATUS CALLS
  // ---------------------------------------------------------------------
  const handleRequestHint = async () => {
    let target = state.currentPuzzle;
    if (!target && state.room) {
      const room = GAME_DATA.rooms[state.room];
      const mqHs = room.hotspots.find(
        (h) => h.puzzle && h.puzzle.startsWith('MQ') && !state.mq.has(h.puzzle)
      );
      if (mqHs) target = mqHs.puzzle!;
    }

    if (!target) {
      setFlashText('현재 도울 게 없어요.');
      return;
    }

    if (state.battery < 10) {
      setFlashText('배터리 부족 — 김재원과 교신 불가.');
      return;
    }

    const puz = GAME_DATA.puzzles[target];
    let count = (state.hintCount[target] || 0) + 1;
    let n = Math.min(count, 3) - 1;

    updateState((s) => {
      s.battery = Math.max(0, s.battery - 10);
      s.hintCount[target!] = count;
    });

    let hint = puz.hints[n];

    if (state.geminiKey) {
      const sys = `당신은 편집장 김재원입니다. 무전기로 힌트를 전합니다. 정답은 절대 직접 말하지 마세요. 한국어, 40자 이내.`;
      const userMsg = `퍼즐: ${puz.name}. 힌트 수준 ${n + 1}/3. 기본 힌트: "${puz.hints[n]}". 이를 자연스럽게 다시 써 주세요.`;
      const res = await Gemini.generate(state.geminiKey, sys, userMsg);
      if (res) hint = res;
    }

    setFlashText(`김재원: "${hint}"`);
  };

  // Expose global debug object like original for complete code fidelity
  useEffect(() => {
    (window as any).__rb = {
      State: state,
      GAME_DATA,
      triggerEnding: handleTriggerEnding,
      forceEnding: (id: string) => {
        updateState((s) => {
          s.screen = 'ending';
          s.currentDialogue = id; // ending selection
          s.flags.timerActive = false;
        });
      }
    };
  }, [state]);

  // ---------------------------------------------------------------------
  // RENDER SELECTION
  // ---------------------------------------------------------------------
  const renderContent = () => {
    switch (state.screen) {
      case 'title':
        return (
          <TitleScreen
            onStartGame={handleStartGame}
            onOpenApiKey={() => setApiKeyModalOpen(true)}
          />
        );

      case 'intro': {
        const monologues = GAME_DATA.monologues;
        const currentLines =
          state.room && monologues[state.room]
            ? monologues[state.room]
            : monologues.INTRO;
        return (
          <NarrativeScreen
            lines={currentLines}
            onFinish={
              state.room
                ? () => handleEnterRoom(state.room!, true)
                : handleFinishIntro
            }
          />
        );
      }

      case 'game':
        return (
          <div className="game-screen">
            <HUD
              state={state}
              onRequestHint={handleRequestHint}
              onShowStatus={() => setStatusOpen(true)}
            />
            <RoomView state={state} onHotspotClick={handleHotspotClick} />
            <SidePanel
              state={state}
              onRequestHint={handleRequestHint}
              onShowStatus={() => setStatusOpen(true)}
            />
          </div>
        );

      case 'dialogue':
        return (
          <div className="game-screen">
            <HUD
              state={state}
              onRequestHint={handleRequestHint}
              onShowStatus={() => setStatusOpen(true)}
            />
            {state.currentDialogue && (
              <DialogueScreen
                dialogueId={state.currentDialogue}
                state={state}
                dynamicText={dynamicDialogueText}
                onChoiceSelect={handleDialogueChoiceSelect}
              />
            )}
            <SidePanel
              state={state}
              onRequestHint={handleRequestHint}
              onShowStatus={() => setStatusOpen(true)}
            />
          </div>
        );

      case 'event':
        return (
          <div className="game-screen">
            <HUD
              state={state}
              onRequestHint={handleRequestHint}
              onShowStatus={() => setStatusOpen(true)}
            />
            {state.currentEvent && (
              <EventScreen
                eventId={state.currentEvent}
                state={state}
                onChoiceSelect={handleEventChoiceSelect}
                onTimeLimitReached={() => handleEventChoiceSelect(0)}
              />
            )}
            <SidePanel
              state={state}
              onRequestHint={handleRequestHint}
              onShowStatus={() => setStatusOpen(true)}
            />
          </div>
        );

      case 'puzzle':
        return (
          <div className="game-screen">
            <HUD
              state={state}
              onRequestHint={handleRequestHint}
              onShowStatus={() => setStatusOpen(true)}
            />
            <RoomView state={state} onHotspotClick={handleHotspotClick} />
            {state.currentPuzzle && (
              <PuzzleScreen
                puzzleId={state.currentPuzzle}
                state={state}
                onCancel={() => updateState((s) => { s.screen = 'game'; s.currentPuzzle = null; })}
                onValidate={handleValidatePuzzle}
                onSolve={handleSolvePuzzle}
              />
            )}
            <SidePanel
              state={state}
              onRequestHint={handleRequestHint}
              onShowStatus={() => setStatusOpen(true)}
            />
          </div>
        );

      case 'ending':
        return (
          <EndingScreen
            endingId={state.currentDialogue || 'END2'}
            onRestart={handleRestartGame}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div id="app-container">
      <div className="grain"></div>
      <div className="scanlines"></div>
      <div className="vignette"></div>

      {renderContent()}

      {/* ---------- Modals Layer ---------- */}
      {apiKeyModalOpen && (
        <ApiKeyModal
          currentKey={state.geminiKey}
          onClose={() => setApiKeyModalOpen(false)}
          onSave={(key) => {
            updateState((s) => {
              s.geminiKey = key;
            });
            setApiKeyModalOpen(false);
          }}
        />
      )}

      {atmosphereText && (
        <div className="narrative" style={{ background: 'rgba(0,0,0,0.95)', zIndex: 600 }} onClick={() => setAtmosphereText(null)}>
          <div className="narrative-text">
            <span className="speaker">상황</span>
            {atmosphereText.split('\n').map((para, i) => (
              <React.Fragment key={i}>
                {para}
                <br />
              </React.Fragment>
            ))}
          </div>
          <div className="narrative-next">▶  닫기  ◀</div>
        </div>
      )}

      {flashText && (
        <FlashModal text={flashText} onConfirm={() => setFlashText(null)} />
      )}

      {statusOpen && (
        <StatusModal state={state} onClose={() => setStatusOpen(false)} />
      )}
    </div>
  );
}
