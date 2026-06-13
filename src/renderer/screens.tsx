import React, { useState, useEffect } from 'react';
import { GameState, Dialogue, GameEvent, MonologueLine, Ending, Puzzle } from '../types';
import { GAME_DATA } from '../data/gameData';
import { endings } from '../data/endings';
import { checkChoiceRequirements } from '../engine/dialogue';

// ---------- TITLE SCREEN ----------
interface TitleScreenProps {
  onStartGame: () => void;
  onOpenApiKey: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStartGame, onOpenApiKey }) => {
  return (
    <div className="title-screen">
      <div className="title-blood"></div>
      <div className="stamp">CONFIDENTIAL  ·  EYES ONLY</div>
      <h1>
        붉은 세례<span className="ark">침묵의 방주</span>
      </h1>
      <div className="latin">RED BAPTISM · ARK OF SILENCE</div>
      <p className="tag">
        사회부 기자인 당신, 실종된 동료의 단서를 쫓아 사이비 종교 본거지에 잠입한다. 진실을 전송하거나, 그것과 함께 묻히거나.
      </p>
      <div className="btn-line">
        <button className="btn-primary" id="btn-start" onClick={onStartGame}>
          잠입을 시작한다
        </button>
        <button className="btn-secondary" id="btn-apikey" onClick={onOpenApiKey}>
          Gemini API 키 입력 (선택)
        </button>
      </div>
      <div className="title-credits">A MODULAR REACT WEB EXPERIENCE  ·  KR LANGUAGE  ·  75–100 MIN</div>
    </div>
  );
};

// ---------- API KEY MODAL ----------
interface ApiKeyModalProps {
  onClose: () => void;
  onSave: (key: string) => void;
  currentKey: string;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onClose, onSave, currentKey }) => {
  const [val, setVal] = useState(currentKey);
  return (
    <div className="modal">
      <div className="modal-box">
        <h2>Gemini API 키 입력</h2>
        <p>
          NPC 대화가 동적으로 생성되어 더 풍부해집니다.
          <br />키 없이도 모든 콘텐츠 정적 플레이 가능합니다.
        </p>
        <input
          type="password"
          id="api-key-input"
          placeholder="AIza..."
          autoComplete="off"
          spellCheck="false"
          value={val}
          onChange={(e) => setVal(e.target.value)}
        />
        <p className="small">
          키는 브라우저 세션에만 유지되며 저장되지 않습니다.
          <br />발급: aistudio.google.com → Get API key
        </p>
        <div className="modal-actions">
          <button id="api-cancel" onClick={onClose}>
            취소
          </button>
          <button className="ok" id="api-save" onClick={() => onSave(val)}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------- NARRATIVE SCREEN / MONOLOGUE ----------
interface NarrativeScreenProps {
  lines: MonologueLine[];
  onFinish: () => void;
}

export const NarrativeScreen: React.FC<NarrativeScreenProps> = ({ lines, onFinish }) => {
  const [idx, setIdx] = useState(0);
  const line = lines[idx];

  if (!line) return null;

  const handleNext = () => {
    if (idx < lines.length - 1) {
      setIdx(idx + 1);
    } else {
      onFinish();
    }
  };

  return (
    <div className="narrative" onClick={handleNext}>
      <div className="narrative-text">
        <span className="speaker">{line.speaker}</span>
        {line.text.split('\n').map((para, i) => (
          <React.Fragment key={i}>
            {para}
            <br />
          </React.Fragment>
        ))}
      </div>
      <div className="narrative-next">
        ▶  {idx < lines.length - 1 ? '계속' : '다음'}  ◀
      </div>
    </div>
  );
};

// ---------- DIALOGUE SCREEN ----------
interface DialogueScreenProps {
  dialogueId: string;
  state: GameState;
  dynamicText: string | null;
  onChoiceSelect: (choiceIdx: number) => void;
}

export const DialogueScreen: React.FC<DialogueScreenProps> = ({
  dialogueId,
  state,
  dynamicText,
  onChoiceSelect,
}) => {
  const dlg = GAME_DATA.dialogues[dialogueId];
  if (!dlg) return null;

  return (
    <div className={`scene scene-${state.room}`}>
      <div className="dialog">
        <div className="dialog-speaker">{dlg.speaker}</div>
        <div className="dialog-text">
          {(dynamicText || dlg.text).split('\n').map((para, i) => (
            <React.Fragment key={i}>
              {para}
              <br />
            </React.Fragment>
          ))}
        </div>
        <div className="dialog-choices">
          {dlg.choices.map((c, i) => {
            const isDisabled = !checkChoiceRequirements(c, state);
            return (
              <button
                className={`choice ${isDisabled ? 'disabled' : ''}`}
                key={i}
                onClick={() => !isDisabled && onChoiceSelect(i)}
              >
                <span className="num">{String(i + 1).padStart(2, '0')}</span>
                {c.text}
                {isDisabled && (
                  <span style={{ opacity: 0.5, fontSize: '11px', marginLeft: '8px' }}>
                    {c.requiresMsg || ''}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ---------- EVENT SCREEN ----------
interface EventScreenProps {
  eventId: string;
  state: GameState;
  onChoiceSelect: (choiceIdx: number) => void;
  onTimeLimitReached: () => void;
}

export const EventScreen: React.FC<EventScreenProps> = ({
  eventId,
  state,
  onChoiceSelect,
  onTimeLimitReached,
}) => {
  const evt = GAME_DATA.events[eventId];
  if (!evt) return null;

  const [timeLeft, setTimeLeft] = useState(evt.timed || 0);

  // ✅ 수정 1: 타임아웃 여부를 별도 state로 분리
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!evt.timed) return;

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          clearInterval(timerId);
          // ✅ 수정 2: 여기서 onChoiceSelect 직접 호출 제거 → setTimedOut만 호출
          setTimedOut(true);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(timerId);
  }, [evt.timed]);

  // ✅ 수정 3: timedOut이 true가 된 다음 렌더에서 안전하게 부모 state 업데이트
  useEffect(() => {
    if (timedOut) {
      onChoiceSelect(evt.choices.length - 1);
    }
  }, [timedOut]);

  const percentage = evt.timed ? (timeLeft / evt.timed) * 100 : 100;

  return (
    <div className={`scene scene-${state.room}`}>
      {evt.timed && (
        <div className="timed">
          <div className="timed-bar">
            <div className="timed-bar-fill" style={{ width: `${percentage}%` }}></div>
          </div>
        </div>
      )}
      <div className="dialog">
        <div className="dialog-speaker atmos">상황</div>
        <div className="dialog-text atmosphere">{evt.atmosphere}</div>
        {evt.text && (
          <>
            <div className="dialog-speaker" style={{ marginTop: '14px' }}>
              {evt.speaker || ''}
            </div>
            <div className="dialog-text">{evt.text}</div>
          </>
        )}
        <div className="dialog-choices">
          {evt.choices.map((c, i) => (
            <button className="choice" key={i} onClick={() => onChoiceSelect(i)}>
              <span className="num">{String(i + 1).padStart(2, '0')}</span>
              {c.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ---------- PUZZLE SCREEN ----------
interface PuzzleScreenProps {
  puzzleId: string;
  state: GameState;
  onCancel: () => void;
  onValidate: (input: any, silentMode: boolean) => { correct: boolean; message: string; suspicionGained?: number; batteryLost?: number };
  onSolve: () => void;
}

export const PuzzleScreen: React.FC<PuzzleScreenProps> = ({
  puzzleId,
  state,
  onCancel,
  onValidate,
  onSolve,
}) => {
  const p = GAME_DATA.puzzles[puzzleId];
  if (!p) return null;

  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(null);
  const [keypadInput, setKeypadInput] = useState('');
  const [silentMode, setSilentMode] = useState(false);
  const [selectedBed, setSelectedBed] = useState<string | null>(null);
  const [textVal, setTextVal] = useState('');
  const [radioChannel, setRadioChannel] = useState(0);

  const displayFeedback = (msg: string, isOk: boolean) => {
    setFeedback({ text: msg, ok: isOk });
  };

  const handleKeypadClick = (n: string | number) => {
    if (keypadInput.length < 4) {
      setKeypadInput((prev) => prev + String(n));
    }
  };

  const clearKeypad = () => setKeypadInput('');

  const handleKeypadSubmit = () => {
    const res = onValidate(keypadInput, silentMode);
    displayFeedback(res.message, res.correct);
    if (res.correct) setTimeout(onSolve, 1200);
  };

  const handleVisualChoiceSelect = (id: string) => {
    const res = onValidate(id, false);
    displayFeedback(res.message, res.correct);
    if (res.correct) setTimeout(onSolve, 1400);
  };

  const handleBedSelect = (n: number) => setSelectedBed(String(n));

  const handleBedSubmit = () => {
    if (!selectedBed) return;
    const res = onValidate(selectedBed, false);
    displayFeedback(res.message, res.correct);
    if (res.correct) setTimeout(onSolve, 1200);
  };

  const handleTextSubmit = () => {
    const res = onValidate(textVal, false);
    displayFeedback(res.message, res.correct);
    if (res.correct) setTimeout(onSolve, 1200);
  };

  const handleRadioChannelChange = (dir: number) => {
    setRadioChannel((prev) => Math.max(0, Math.min(12, prev + dir)));
  };

  const handleRadioSubmit = () => {
    const res = onValidate(radioChannel, false);
    displayFeedback(res.message, res.correct);
    if (res.correct) setTimeout(onSolve, 1800);
  };

  const handleCompassSelect = (dir: string) => {
    const res = onValidate(dir, false);
    displayFeedback(res.message, res.correct);
    if (res.correct) setTimeout(onSolve, 1200);
  };

  const renderPuzzleBody = () => {
    switch (p.type) {
      case 'keypadSilent':
        return (
          <>
            <div className="keypad-display">{keypadInput}</div>
            <div className="keypad">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <button key={n} onClick={() => handleKeypadClick(n)}>{n}</button>
              ))}
              <button onClick={clearKeypad} style={{ background: '#2a1a1a', color: 'var(--blood-bright)' }}>×</button>
              <button onClick={() => handleKeypadClick(0)}>0</button>
              <button onClick={handleKeypadSubmit} style={{ background: '#1a2a1a', color: '#4adba0' }}>▾</button>
            </div>
            <div className="keypad-toggle">
              <button className={silentMode ? 'on' : ''} onClick={() => setSilentMode(!silentMode)}>
                [ 침묵 모드: {silentMode ? 'ON' : 'OFF'} ]
              </button>
              <span style={{ fontSize: '10px', color: 'var(--ink-dim)' }}>— 레버를 당기기 전에</span>
            </div>
          </>
        );

      case 'visualChoice':
        return (
          <div className="choice-grid">
            {p.options?.map((o) => (
              <div className={`choice-card ${o.vis}`} key={o.id} onClick={() => handleVisualChoiceSelect(o.id)}>
                <div className="vis"></div>
                <div className="name">{o.label}</div>
              </div>
            ))}
          </div>
        );

      case 'bedGrid':
        return (
          <>
            <div className="bed-grid">
              {Array.from({ length: 48 }, (_, i) => i + 1).map((n) => (
                <div
                  className={`bed ${selectedBed === String(n) ? 'selected' : ''}`}
                  key={n}
                  onClick={() => handleBedSelect(n)}
                >
                  {n}
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--gold)' }}>
              {selectedBed ? `${selectedBed}번 침대 선택됨` : '— 선택되지 않음 —'}
            </div>
          </>
        );

      case 'textInput':
        return (
          <div className="text-puzzle">
            <input
              type="text"
              placeholder={p.placeholder || ''}
              autoComplete="off"
              spellCheck="false"
              value={textVal}
              onChange={(e) => setTextVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
            />
          </div>
        );

      case 'radioDial': {
        const buzzes = [
          '— 잡음 —', '...즈즈... 정파 신호', '..예배 방송 중...', '...신도 일과...',
          '...의료 채널...', '...주방 통신...', '...경비 무전...', '...낯익은 목소리 — ?',
          '...무음...', '...구역 안내...', '...치료실...', '...관리...', '...정파 신호',
        ];
        return (
          <div className="radio-dial">
            <div className="radio-display">CH {radioChannel}</div>
            <div className="radio-buzz" style={{ color: radioChannel === p.answer ? 'var(--bone)' : '' }}>
              {buzzes[radioChannel]}
            </div>
            <div className="radio-controls">
              <button onClick={() => handleRadioChannelChange(-1)}>◀ DOWN</button>
              <button onClick={() => handleRadioChannelChange(1)}>UP ▶</button>
            </div>
          </div>
        );
      }

      case 'memoAssembly':
        return (
          <>
            <div className="memo-list">
              {p.pieces?.map((piece, i) => {
                const isCollected = state.clues.has(`CLU_B4_MEMO${i + 1}`);
                return (
                  <div className="memo-piece" style={{ opacity: isCollected ? 1 : 0.3 }} key={i}>
                    <span>[{piece.where}] {isCollected ? piece.text : '???'}</span>
                    <span className="where">{isCollected ? '수집됨' : '미수집'}</span>
                  </div>
                );
              })}
            </div>
            <input
              className="memo-input"
              type="text"
              placeholder="조합한 비밀번호"
              autoComplete="off"
              spellCheck="false"
              value={textVal}
              onChange={(e) => setTextVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
            />
          </>
        );

      case 'compass':
        return (
          <>
            <div className="compass">
              <div className="compass-needle"></div>
              <div className="compass-dir N" onClick={() => handleCompassSelect('N')}>N</div>
              <div className="compass-dir E" onClick={() => handleCompassSelect('E')}>E</div>
              <div className="compass-dir S" onClick={() => handleCompassSelect('S')}>S</div>
              <div className="compass-dir W" onClick={() => handleCompassSelect('W')}>W</div>
            </div>
            <div style={{ textAlign: 'center', fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--ink-dim)' }}>
              — 진북(眞北)을 선택하라 —
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="puzzle">
      <div className="puzzle-box">
        <div className="puzzle-sub">{p.sub}</div>
        <h2 className="puzzle-title">{p.name}</h2>
        <p className="puzzle-desc">{p.desc}</p>

        {renderPuzzleBody()}

        {p.warning && <p className="memo-warning">⚠ {p.warning}</p>}

        <div className={`puzzle-feedback ${feedback?.ok ? 'ok' : 'no'}`}>
          {feedback ? feedback.text : <>&nbsp;</>}
        </div>

        <div className="puzzle-actions">
          <button onClick={onCancel}>취소</button>
          {p.type !== 'visualChoice' && p.type !== 'compass' && (
            <button className="ok" onClick={
              p.type === 'keypadSilent' ? handleKeypadSubmit :
              p.type === 'bedGrid'     ? handleBedSubmit :
              p.type === 'radioDial'   ? handleRadioSubmit :
              handleTextSubmit
            }>
              시도
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------- ENDING SCREEN ----------
interface EndingScreenProps {
  endingId: string;
  onRestart: (skipTitle: boolean) => void;
}

export const EndingScreen: React.FC<EndingScreenProps> = ({ endingId, onRestart }) => {
  const e = endings[endingId] || endings.END2;
  return (
    <div className={`ending ${endingId}`}>
      <div className="ending-id">{e.id}</div>
      <h1 className="ending-title">{e.title}</h1>
      <p className="ending-epilogue">{e.epilogue}</p>
      <div className="ending-actions">
        <button onClick={() => onRestart(true)}>다시 잠입한다</button>
        <button onClick={() => onRestart(false)}>타이틀로</button>
      </div>
    </div>
  );
};

// ---------- UTILITY MODALS ----------
interface FlashModalProps {
  text: string;
  onConfirm: () => void;
}

export const FlashModal: React.FC<FlashModalProps> = ({ text, onConfirm }) => {
  return (
    <div className="modal">
      <div className="modal-box">
        <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--gold)', letterSpacing: '.25em', marginBottom: '10px' }}>
          [ 무전 ]
        </div>
        <p style={{ fontFamily: 'var(--serif)', fontSize: '16px', lineHeight: 1.7, color: 'var(--ink)' }}>{text}</p>
        <div className="modal-actions">
          <button className="ok" onClick={onConfirm}>확인</button>
        </div>
      </div>
    </div>
  );
};

interface StatusModalProps {
  state: GameState;
  onClose: () => void;
}

export const StatusModal: React.FC<StatusModalProps> = ({ state, onClose }) => {
  return (
    <div className="modal">
      <div className="modal-box">
        <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--gold)', letterSpacing: '.25em', marginBottom: '14px' }}>
          [ 상태 점검 ]
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', lineHeight: 2, color: 'var(--ink)' }}>
          구역 ............ {state.room}<br />
          배터리 .......... {state.battery}%<br />
          진행 MQ ......... {[...state.mq].join(', ') || '—'}<br />
          진행 SQ ......... {[...state.sq].join(', ') || '—'}<br />
          의심 수치 ....... {'●'.repeat(state.suspicion)}{'○'.repeat(Math.max(0, 5 - state.suspicion))}<br />
          {state.flags.timerActive && (
            <><br /><span style={{ color: 'var(--blood-bright)' }}>자폭 카운트다운 진행 중</span></>
          )}
        </div>
        <div className="modal-actions">
          <button className="ok" onClick={onClose}>확인</button>
        </div>
      </div>
    </div>
  );
};