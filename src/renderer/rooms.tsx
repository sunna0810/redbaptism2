import React from 'react';
import { GameState, Hotspot } from '../types';
import { GAME_DATA } from '../data/gameData';

interface RoomArtProps {
  room: string;
}

export const RoomArt: React.FC<RoomArtProps> = ({ room }) => {
  if (room === 'B1') {
    return (
      <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="g1" cx="50%" cy="20%">
            <stop offset="0%" stopColor="#ff2a45" stopOpacity=".4" />
            <stop offset="100%" stopColor="#7a0a1e" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1000" height="600" fill="url(#g1)" />
        <path d="M400 50 L500 0 L600 50 L600 200 L400 200 Z" fill="none" stroke="#c8102e" strokeWidth="1.5" opacity=".6" />
        <line x1="500" y1="40" x2="500" y2="180" stroke="#c8102e" strokeWidth="1" opacity=".5" />
        <line x1="450" y1="100" x2="550" y2="100" stroke="#c8102e" strokeWidth="1" opacity=".5" />
        <rect x="100" y="300" width="800" height="2" fill="#c6a967" opacity=".3" />
        <text x="500" y="500" textAnchor="middle" fontFamily="serif" fontSize="80" fontWeight="900" fill="#7a0a1e" opacity=".15">
          광휘의 방주
        </text>
      </svg>
    );
  }
  
  if (room === 'B2') {
    return (
      <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <g stroke="#3a3a30" strokeWidth="1" fill="none" opacity=".5">
          {Array.from({ length: 5 }, (_, r) =>
            Array.from({ length: 10 }, (_, c) => (
              <g key={`${r}-${c}`}>
                <rect x={50 + c * 90} y={150 + r * 80} width="70" height="50" />
                <rect x={55 + c * 90} y={155 + r * 80} width="60" height="6" fill="#2a2a22" />
              </g>
            ))
          )}
        </g>
        <line x1="0" y1="100" x2="1000" y2="100" stroke="#1a1a14" strokeWidth="40" />
        <circle cx="200" cy="80" r="6" fill="#d8d0bc" opacity=".4" />
        <circle cx="500" cy="80" r="6" fill="#d8d0bc" opacity=".4" />
        <circle cx="800" cy="80" r="6" fill="#d8d0bc" opacity=".4" />
      </svg>
    );
  }

  if (room === 'B3') {
    return (
      <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <rect width="1000" height="600" fill="#000" />
        <path d="M0 400 L1000 400" stroke="#1a0508" strokeWidth="100" opacity=".6" />
        <rect x="50" y="200" width="200" height="180" fill="none" stroke="#1a0508" strokeWidth="2" />
        <rect x="750" y="200" width="200" height="180" fill="none" stroke="#1a0508" strokeWidth="2" />
        <line x1="50" y1="240" x2="250" y2="240" stroke="#1a0508" />
        <line x1="50" y1="290" x2="250" y2="290" stroke="#1a0508" />
        <line x1="50" y1="340" x2="250" y2="340" stroke="#1a0508" />
      </svg>
    );
  }

  if (room === 'B4') {
    return (
      <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <rect width="1000" height="600" fill="#0a0e12" />
        <line x1="100" y1="80" x2="900" y2="80" stroke="#cfe3f0" strokeWidth="3" opacity=".3" />
        <line x1="100" y1="84" x2="900" y2="84" stroke="#cfe3f0" strokeWidth="1" opacity=".5" />
        <rect x="350" y="200" width="300" height="280" fill="none" stroke="#2a3540" strokeWidth="2" />
        <rect x="380" y="230" width="240" height="160" fill="#06080a" />
        <text x="500" y="320" textAnchor="middle" fontFamily="monospace" fontSize="14" fill="#cfe3f0" opacity=".5">
          PHRX-9 SERVER
        </text>
        <circle cx="500" cy="350" r="8" fill="#ff2a45" opacity=".6" />
      </svg>
    );
  }

  return null;
};

interface RoomViewProps {
  state: GameState;
  onHotspotClick: (h: Hotspot) => void;
}

export const RoomView: React.FC<RoomViewProps> = ({ state, onHotspotClick }) => {
  const currentRoomId = state.room || 'B1';
  const room = GAME_DATA.rooms[currentRoomId];
  if (!room) return null;

  return (
    <div className={`scene scene-${currentRoomId}`} id="scene">
      <div className="room-art">
        <RoomArt room={currentRoomId} />
      </div>
      
      {room.hotspots.map((h) => {
        // Evaluate if the hotspot is completed
        const done =
          (h.clue && state.clues.has(h.clue)) ||
          (h.puzzle && (state.mq.has(h.puzzle) || state.sq.has(h.puzzle)));

        // Evaluate prerequisites
        const reqMet =
          !h.requires ||
          h.requires.every((r) => {
            if (r.endsWith('_DONE')) return state.mq.has(r.replace('_DONE', ''));
            return state.clues.has(r) || state.mq.has(r) || state.sq.has(r);
          });

        if (!reqMet) return null;

        const hotspotClass = [
          done ? 'done' : '',
          h.type === 'npc' ? 'npc' : '',
        ].join(' ').trim();

        return (
          <div
            className={`hotspot ${hotspotClass}`}
            id={`hs-${h.id}`}
            key={h.id}
            style={{ left: `${h.x}%`, top: `${h.y}%` }}
            onClick={() => onHotspotClick(h)}
          >
            <span className="lbl">{h.label}</span>
          </div>
        );
      })}

      <div className="dialog">
        <div className="dialog-speaker atmos">분위기</div>
        <div className="dialog-text atmosphere">{room.atmosphere}</div>
      </div>
    </div>
  );
};
