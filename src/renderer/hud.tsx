import React, { useState } from 'react';
import { GameState } from '../types';
import { GAME_DATA } from '../data/gameData';

interface HUDProps {
  state: GameState;
  onRequestHint: () => void;
  onShowStatus: () => void;
}

export const HUD: React.FC<HUDProps> = ({ state, onRequestHint, onShowStatus }) => {
  const bat = state.battery;
  const isBatLow = bat <= 30;
  const isBatCrit = bat <= 15;

  let batClass = '';
  if (isBatCrit) batClass = 'crit';
  else if (isBatLow) batClass = 'low';

  const roomData = state.room ? GAME_DATA.rooms[state.room] : null;

  const m = Math.floor(state.flags.timerSeconds / 60);
  const s = String(state.flags.timerSeconds % 60).padStart(2, '0');

  return (
    <div className="hud-top">
      <div className="hud-rec">REC</div>
      <div className="hud-zone">{roomData ? roomData.subtitle : ''}</div>
      {state.flags.timerActive && (
        <div className="hud-timer">⚠ {m}:{s}</div>
      )}
      <div className="hud-battery">
        <span>BATTERY {bat}%</span>
        <div className="hud-bat-bar">
          <div className={`hud-bat-fill ${batClass}`} style={{ width: `${bat}%` }} />
        </div>
      </div>
    </div>
  );
};

interface SidePanelProps {
  state: GameState;
  onRequestHint: () => void;
  onShowStatus: () => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({ state, onRequestHint, onShowStatus }) => {
  const [collapsed, setCollapsed] = useState(false);

  const hintDisabled = state.battery < 10;
  const hintCostText = state.battery >= 10 ? '(배터리 -10%)' : '(배터리 부족)';

  return (
    <div
      className="side-panel"
      style={{
        width: collapsed ? '42px' : '200px',
        overflow: 'hidden',
        transition: 'width 0.25s ease',
      }}
    >
      {/* 토글 버튼 — 항상 표시 */}
      <button
        onClick={() => setCollapsed((prev) => !prev)}
        style={{
          display: 'block',
          width: '100%',
          fontFamily: 'var(--mono)',
          fontSize: '12px',
          color: 'var(--gold)',
          background: 'transparent',
          border: 'none',
          borderBottom: '1px solid #2a2a36',
          padding: '6px 0',
          cursor: 'pointer',
          textAlign: 'center',
          letterSpacing: '.1em',
          marginBottom: '8px',
          whiteSpace: 'nowrap',
        }}
        title={collapsed ? '패널 열기' : '패널 닫기'}
      >
        {collapsed ? '▶' : '◀ 접기'}
      </button>

      {/* 접혔을 때는 아무것도 안 보임 */}
      {!collapsed && (
        <>
          <h3>인벤토리</h3>
          <div className="inv-list">
            {state.inventory.length > 0 ? (
              state.inventory.map((item, idx) => (
                <div className="inv-item" key={idx}>
                  ▸ {item}
                </div>
              ))
            ) : (
              <div className="inv-empty">— 비어 있음 —</div>
            )}
          </div>
          <h3>액션</h3>
          <div className="side-actions">
            <button disabled={hintDisabled} onClick={onRequestHint}>
              힌트 요청<span className="hint-cost">{hintCostText}</span>
            </button>
            <button onClick={onShowStatus}>상태 확인</button>
          </div>
        </>
      )}
    </div>
  );
};