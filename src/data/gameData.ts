import { Room, Clue, Puzzle, Dialogue, GameEvent, MonologueLine } from '../types';

export const GAME_DATA: {
  rooms: Record<string, Room>;
  clues: Record<string, Clue>;
  puzzles: Record<string, Puzzle>;
  dialogues: Record<string, Dialogue>;
  events: Record<string, GameEvent>;
  monologues: Record<string, MonologueLine[]>;
} = {
  /* ---------------------------------------------------------------------
     ROOMS — hotspot definitions (positions in % of scene)
     --------------------------------------------------------------------- */
  rooms: {
    B1: {
      name: '예배당',
      subtitle: 'B1 · CHAPEL',
      atmosphere: '붉은 조명이 천장에서 흘러내린다. 신도들의 복창 소리. 향내. 벽 어딘가에서 누군가의 시선이 느껴진다.',
      hotspots: [
        { id: 'B1_noyuna', x: 22, y: 62, label: '노윤아', type: 'npc', dialog: 'DLG_NY_B1_01' },
        { id: 'B1_score', x: 42, y: 38, label: '성가 악보', clue: 'CLU_B1_01' },
        { id: 'B1_plate', x: 58, y: 55, label: '신도 번호판', clue: 'CLU_B1_02' },
        { id: 'B1_frame', x: 75, y: 32, label: '기도문 액자', clue: 'CLU_B1_03' },
        { id: 'B1_offering', x: 30, y: 78, label: '헌금함', clue: 'CLU_B1_DECOY' },
        { id: 'B1_safe', x: 82, y: 64, label: '금고', puzzle: 'MQ1', requires: ['CLU_B1_01', 'CLU_B1_02', 'CLU_B1_03'] },
      ],
      nextRoom: 'B2',
    },

    B2: {
      name: '생활관',
      subtitle: 'B2 · DORM',
      atmosphere: '낮게 켜진 형광등이 자꾸 흔들린다. 침대 수십 개가 줄지어 있다. 사람들이 자고 있다. 너무 고요하다.',
      hotspots: [
        { id: 'B2_chart', x: 18, y: 48, label: '침대 배정표', clue: 'CLU_B2_CHART' },
        { id: 'B2_fountain', x: 80, y: 38, label: '성수대', puzzle: 'SQ1' },
        { id: 'B2_bed47', x: 50, y: 60, label: '47번 침대', puzzle: 'MQ2', requires: ['CLU_B2_CHART'] },
        { id: 'B2_noyuna', x: 30, y: 78, label: '노윤아', type: 'npc', dialog: 'DLG_NY_B2' },
      ],
      nextRoom: 'B3',
      onExit: 'EVT_CHASING',
    },

    B3: {
      name: '집행 구역',
      subtitle: 'B3 · ENFORCEMENT',
      atmosphere: '완전한 어둠. 스마트 글라스 조명을 켠다. 발소리 없는 진동만이 멀리서 울린다. 누군가가 가까이 있다.',
      hotspots: [
        { id: 'B3_ledger', x: 24, y: 42, label: '처리 대장', puzzle: 'SQ2' },
        { id: 'B3_jisu', x: 78, y: 55, label: '어둠 속 형체', event: 'EVT_JISU_FOUND' },
        { id: 'B3_wall', x: 50, y: 35, label: '벽의 흔적', clue: 'CLU_B3_01' },
        { id: 'B3_vent', x: 38, y: 72, label: '환기구', clue: 'CLU_B3_02', requires: ['CLU_B3_01'] },
        { id: 'B3_radio', x: 62, y: 55, label: '무전 수신기', puzzle: 'MQ3' },
      ],
      nextRoom: 'B4',
      onExit: 'EVT_BETRAYAL',
    },

    B4: {
      name: '심장부',
      subtitle: 'B4 · THE HEART',
      atmosphere: '냉백색 형광등. 설교가 멈췄다. 처음으로 진짜 침묵이다. 교주실 — 20년의 꿈이 결박된 공간.',
      hotspots: [
        { id: 'B4_photo', x: 22, y: 35, label: '벽의 사진들', clue: 'CLU_B4_01' },
        { id: 'B4_diary', x: 34, y: 55, label: '교주 일기장', puzzle: 'SQ3', requires: ['CLU_B4_01'] },
        { id: 'B4_memo1', x: 50, y: 42, label: '책상 메모', clue: 'CLU_B4_MEMO1' },
        { id: 'B4_memo2', x: 78, y: 28, label: '화장실', clue: 'CLU_B4_MEMO2' },
        { id: 'B4_memo3', x: 14, y: 68, label: '출입문', clue: 'CLU_B4_MEMO3' },
        { id: 'B4_memo4', x: 68, y: 62, label: '책장', clue: 'CLU_B4_MEMO4' },
        {
          id: 'B4_server', x: 50, y: 78, label: '서버 터미널', puzzle: 'MQ4',
          requires: ['CLU_B4_MEMO1', 'CLU_B4_MEMO2', 'CLU_B4_MEMO3', 'CLU_B4_MEMO4'],
        },
        { id: 'B4_boss', x: 88, y: 78, label: '박규빈', type: 'npc', dialog: 'DLG_BOSS_B4_01' },
        { id: 'B4_exit', x: 50, y: 18, label: '탈출구', event: 'EVT_ESCAPE', requires: ['MQ4_DONE'] },
      ],
      nextRoom: 'ENDING',
    },
  },

  /* ---------------------------------------------------------------------
     CLUES — discovery narration + state updates
     --------------------------------------------------------------------- */
  clues: {
    CLU_B1_01: {
      title: '성가 악보 3페이지',
      text: '악보 세 번째 페이지. 다른 페이지는 평범한데 이것만 다르다. 도·미·솔·시 음표에만 빨간 밑줄이 그어져 있다.\n\n도=1  미=3  솔=5  시=7',
      item: '악보 단서 — 1·3·5·7',
    },
    CLU_B1_02: {
      title: '신도 번호판',
      text: '벽에 신도 번호판들이 배열되어 있다. 그 중 한 자리만 번호가 지워져 있다. 자세히 보니 그 옆에 미세하게 새겨진 화살표 — 금고 쪽을 가리킨다.',
      item: '번호판 단서 — 금고 위치',
    },
    CLU_B1_03: {
      title: '기도문 액자 (뒷면)',
      text: '액자를 뒤집는다. 뒷면 모서리, 누군가 손톱으로 새긴 듯한 작은 글씨.\n\n"빛은 침묵 속에서만 말한다."',
      item: '액자 단서 — 침묵의 조건',
    },
    CLU_B1_DECOY: {
      title: '헌금함',
      text: '헌금함 표면에 새겨진 숫자: 4-8-2-6. 깔끔한 글씨체. 너무 깔끔하다. 이건 함정이다.',
      atmosphereOnly: true,
    },

    CLU_B2_CHART: {
      title: '침대 배정표',
      text: '벽에 붙은 침대 배정표. 수십 명의 이름이 적혀 있다. 손가락으로 짚어 내려간다.\n\n이준혁 ... 47번 침대.\n\n노윤아는 분명히 46번이라고 했다.',
      item: '배정표 단서 — 47번',
      effect: 'suspicionMaybe',
    },

    CLU_B3_01: {
      title: '고문실 벽 새김',
      text: '못으로 긁어 새긴 글씨가 어둠 속에서 떠오른다.\n\n"B4-진실-7711"\n"나는 살아있다 — 찾아라"\n\n7711. 박지수가 봉투에 남긴 그 숫자.',
      item: '벽 단서 — B4 진실 / 7711',
    },
    CLU_B3_02: {
      title: '환기구 안 소형 수신기',
      text: '환기구 안으로 손을 넣자 차가운 금속이 잡힌다. 작은 무전 수신기. 채널 다이얼이 0에 맞춰져 있다.\n\n12개 채널 중 하나에서 누군가의 대화가 잡힐 것이다.',
      item: '무전 수신기 (12채널)',
    },

    CLU_B4_01: {
      title: '벽의 흑백 사진',
      text: '벽에는 컬러 사진들이 빼곡히 걸려 있다. 그 가운데 단 한 장만 흑백이다. 사진 구석에 작은 글씨로 적힌 날짜.\n\n1994. 03. 15.',
      item: '사진 단서 — 1994.03.15',
    },
    CLU_B4_MEMO1: { title: '책상 메모', text: '책상 위 찢어진 메모지 조각. "ARCH"라고 적혀있다.', item: '메모 조각 1 — ARCH' },
    CLU_B4_MEMO2: { title: '화장실 거울 안쪽', text: '화장실 거울 뒤 좁은 틈. 메모지 조각. "E0"이라 적혀있다.', item: '메모 조각 2 — E0' },
    CLU_B4_MEMO3: { title: '출입문 안쪽', text: '문 안쪽 손잡이 아래. 종이 한 장. "1"이라 적혀있다.', item: '메모 조각 3 — 1' },
    CLU_B4_MEMO4: { title: '책장 책 사이', text: '책장의 두꺼운 책 사이. "10"이라 적힌 메모 조각.', item: '메모 조각 4 — 10' },
  },

  /* ---------------------------------------------------------------------
     PUZZLES — each main/sub quest
     --------------------------------------------------------------------- */
  puzzles: {
    MQ1: {
      name: '예배당의 암호',
      sub: 'MAIN QUEST 1  ·  CHAPEL',
      desc: '금고 앞에 선다. 4자리 숫자 키패드. 그리고 옆에는 작은 레버.\n\n번호를 입력하고 레버를 당겨야 한다. 단 — 액자 뒷면의 글귀가 떠오른다.',
      type: 'keypadSilent',
      answer: { code: '1357', silent: true },
      hints: [
        '악보가 여러 장인 것 같은데요... 표시된 음표를 보세요.',
        '음계를 숫자로 생각해보세요. 도=1, 레=2, 미=3...',
        '1-3-5-7 순서로 입력하고, 레버는 반드시 [침묵 모드]를 켠 채 당겨야 해요.',
      ],
      reward: ['배터리팩 +20%', '이준혁 신도증', 'B2 이동 패스'],
      onSolve(S, showAtmosphere) {
        S.battery = Math.min(100, S.battery + 20);
        S.inventory.push('이준혁 신도증');
        S.inventory.push('스캐너 키트');
        S.mq.add('MQ1');
        S.flags.B2unlocked = true;
        showAtmosphere('금고가 침묵 속에서 열린다. 박지수의 흔적이 손에 잡힌다. 이준혁. 그가 살았던 이름.');
      },
    },
    SQ1: {
      name: '성수의 비밀',
      sub: 'SUB QUEST 1  ·  DORM',
      desc: '성수대가 두 개 나란히 놓여있다. 한쪽은 투명한 물. 한쪽은 우윳빛으로 탁하다.\n\n스캐너 키트로 분석한다. 어느 쪽이 "정화의 성수"일까.',
      type: 'visualChoice',
      options: [
        { id: 'clear', label: '투명한 쪽', vis: 'clear', correct: false },
        { id: 'murky', label: '탁한 우윳빛', vis: 'murky', correct: true },
      ],
      hints: ['두 성수대의 색이 다르네요.', '탁한 쪽이 의심스러워요.', '우윳빛으로 탁한 것이 성수예요.'],
      reward: ['성수 분석 리포트', 'MQ4 배터리 절감 효과'],
      onSolve(S) {
        S.battery = Math.max(0, S.battery - 5);
        S.inventory.push('성수 분석 리포트');
        S.sq.add('SQ1');
      },
    },
    MQ2: {
      name: '생활관의 유품',
      sub: 'MAIN QUEST 2  ·  DORM',
      desc: '47번 침대 앞에 선다. 매트리스를 들어올린다.\n\n그러나 — 노윤아의 목소리가 떠오른다. "46번이 맞을 거예요." 어느 침대를 열 것인가.',
      type: 'bedGrid',
      answer: '47',
      hints: ['배정표를 다시 떠올려보세요.', '노윤아가 말한 것과 배정표는 다릅니다.', '47번이에요. 매트리스를 들어올리세요.'],
      reward: ['박지수 육성 녹음', 'B3 고문실 코드 7711'],
      onSolve(S, showAtmosphere) {
        S.inventory.push('박지수 육성 녹음');
        S.inventory.push('B3 코드 7711');
        S.mq.add('MQ2');
        S.suspicion += 1;
        showAtmosphere('녹음 펜의 LED가 깜빡인다. 박지수의 목소리: "나는 살아있다 — 찾아라."');
      },
    },
    SQ2: {
      name: '신도 처리 대장',
      sub: 'SUB QUEST 2  ·  ENFORCEMENT',
      desc: '두꺼운 장부. 신도들의 처리 기록. 항목마다 분류가 적혀있다 — "복귀", "이송", "보류"...\n\n"보류" 항목에서 발견되는 이름이 있다. 그 이름을 입력하라.',
      type: 'textInput',
      answer: ['박지수', 'jisu', '지수', '파크지수', 'park jisu'],
      placeholder: '이름 입력...',
      hints: ['보류 표시된 항목을 찾으세요.', '박지수가 거기 있을 거예요.', '"박지수"를 입력하세요.'],
      reward: ['임선아 순찰표', 'MQ3 채널 직접 힌트'],
      onSolve(S) {
        S.inventory.push('임선아 순찰표');
        S.sq.add('SQ2');
      },
    },
    MQ3: {
      name: '집행 구역의 진실',
      sub: 'MAIN QUEST 3  ·  ENFORCEMENT',
      desc: '소형 무전 수신기. 12개 채널. 천천히 다이얼을 돌린다.\n\n_낯익은 목소리가 잡히는 그 채널을 찾아라.',
      type: 'radioDial',
      answer: 7,
      hints: ['낮은 채널부터 시도해보세요.', '한 자리 숫자 범위예요.', '채널 7번을 맞춰보세요.'],
      reward: ['B4 진입 코드 광휘-2404', '노윤아 배신 증거 녹음'],
      onSolve(S) {
        S.battery = Math.max(0, S.battery - 5);
        S.inventory.push('B4 코드 광휘-2404');
        S.inventory.push('노윤아 배신 증거');
        S.mq.add('MQ3');
      },
    },
    SQ3: {
      name: '박규빈의 과거',
      sub: 'SUB QUEST 3  ·  THE HEART',
      desc: '교주 책상 서랍의 잠긴 일기장. 네 자리 자물쇠.\n\n벽의 흑백 사진 — 1994년 3월 15일. 그 숫자가 열쇠라면.',
      type: 'textInput',
      answer: ['0315'],
      placeholder: '4자리 숫자',
      hints: ['벽의 사진을 다시 떠올려요.', '날짜가 적힌 건 흑백 사진 한 장.', '0315를 입력하세요.'],
      reward: ['정관계 로비 증거', '엔딩 1 조건 충족', '교주 동요 씬 해금'],
      onSolve(S, showAtmosphere) {
        S.inventory.push('정관계 로비 증거');
        S.sq.add('SQ3');
        S.trust += 1;
        showAtmosphere('일기장 첫 페이지: "이 이름들은 절대 공개되어선 안 된다." 7명의 명단. 그 중 3명은 — 현직 국회의원.');
      },
    },
    MQ4: {
      name: '심장부의 서버',
      sub: 'MAIN QUEST 4  ·  THE HEART',
      desc: '서버 터미널. 메모 조각 네 장을 모두 조합해 정확한 비밀번호를 만든다.\n\n[책상] ARCH  +  [화장실] E0  +  [출입문] 1  +  [책장] 10',
      type: 'memoAssembly',
      answer: ['ARCHE0110'],
      pieces: [
        { where: '책상', text: 'ARCH' },
        { where: '화장실', text: 'E0' },
        { where: '출입문', text: '1' },
        { where: '책장', text: '10' },
      ],
      warning: '주의 — 비밀번호를 입력하면 김재원의 백업 시스템이 가동되고 자폭 타이머가 시작됩니다.',
      hints: ['조각들을 순서대로 연결하세요.', '책상→화장실→출입문→책장 순서.', 'ARCHE0110을 입력하세요.'],
      reward: ['교주 범죄 데이터 다운로드', '자폭 타이머 가동 (20분)'],
      onSolve(S, showAtmosphere) {
        S.inventory.push('교주 범죄 데이터');
        S.mq.add('MQ4');
        S.flags.serverAccessed = true;
        // Start self destruct timer logic is delegated to state controller
        showAtmosphere('전송이 시작된다. 동시에 — 천장 스피커에서 차가운 여성 목소리. "자가폭파 절차 가동. 20분 후 시설 봉쇄."');
      },
    },
    MQ5: {
      name: '탈출과 송출',
      sub: 'MAIN QUEST 5  ·  ESCAPE',
      desc: '복도. 비상구 표지판들 — 그러나 그 화살표들은 모두 같은 방향을 가리킨다. 너무 정확하게 같은 방향을.\n\n스마트 글라스의 나침반을 켠다. 진북(眞北)은 어느 쪽인가.',
      type: 'compass',
      answer: 'N',
      hints: ['표지판을 믿지 말아요.', '나침반 바늘을 보세요.', '북쪽이 진짜 탈출구예요.'],
      reward: ['지상 탈출', '엔딩 분기'],
      onSolve(S) {
        S.mq.add('MQ5');
      },
    },
  },

  /* ---------------------------------------------------------------------
     DIALOGUES — branching trees
     --------------------------------------------------------------------- */
  dialogues: {
    DLG_NY_B1_01: {
      speaker: '노윤아', npc: 'NOYUNA',
      text: '조심하세요... 여기 신도들이 많아요. 저를 따라오세요. 성수는 절대 마시지 마세요. 절대로.',
      choices: [
        { text: '왜 성수가 문제야?', effect: { trust: 1 }, next: 'DLG_NY_B1_02' },
        { text: '(침묵하며 고개를 끄덕인다)', effect: {}, next: null },
        { text: '당신을 믿어도 돼?', effect: { aggression: 1 }, next: 'DLG_NY_B1_03' },
      ],
    },
    DLG_NY_B1_02: {
      speaker: '노윤아', npc: 'NOYUNA',
      text: '성수에... 뭔가 섞여 있어요. 마시면 생각이 느려져요. 저도 한 번 마셨을 때... 기억이 흐릿해요. 이틀 동안.',
      choices: [{ text: '(스마트 글라스로 스캔한다)', effect: { trust: 1 }, next: null }],
    },
    DLG_NY_B1_03: {
      speaker: '노윤아', npc: 'NOYUNA',
      text: '...(잠시 멈춘다) 저는 기자였어요. 당신 선배처럼. 그게 전부예요. 믿어도 돼요.',
      choices: [{ text: '(시선을 거두며 따라간다)', effect: {}, next: null }],
    },
    DLG_NY_B2: {
      speaker: '노윤아', npc: 'NOYUNA',
      text: '박지수 씨가 쓰던 침대... 46번이 맞을 거예요. 제가 봤어요.',
      choices: [
        { text: '(고개를 끄덕인다)', effect: {}, next: null },
        { text: '직접 배정표를 확인하겠어', effect: {}, next: null },
      ],
    },
    DLG_BOSS_B4_01: {
      speaker: '박규빈 (교주)', npc: 'BOSS',
      text: '어서 오십시오. 저는 거짓말쟁이가 아닙니다. 실험자입니다. 20년 전 나는 국회에서 자유의지를 팔았어요. 사람들이 자유롭다고 느낄수록 더 쉽게 조종된다 — 그게 진실입니다.',
      choices: [
        { text: '당신 범죄를 전부 공개할 거야', effect: { aggression: 1 }, next: null },
        { text: '먼저 박지수를 풀어줘', effect: { trust: 1 }, next: 'DLG_BOSS_B4_02' },
        {
          text: '7명의 이름도 포함이다', effect: { trust: 2 }, next: 'DLG_BOSS_SHOCK',
          requires: { sq: 'SQ3' }, requiresMsg: '(정관계 증거 확보 시에만)'
        },
      ],
    },
    DLG_BOSS_B4_02: {
      speaker: '박규빈 (교주)', npc: 'BOSS',
      text: '박지수... 그 사람은 저를 이해했어요. 3주 동안. 마지막엔 고집만 피웠지만. 터미널을 여세요.',
      choices: [{ text: '(터미널로 향한다)', effect: { trust: 1 }, next: null }],
    },
    DLG_BOSS_SHOCK: {
      speaker: '박규빈 (교주)', npc: 'BOSS',
      text: '...그 일기는 어디서. (2초 침묵) 이름이... 7명이 적혀있었을 거예요. 그 중 3명은 현직입니다. 지금도.',
      choices: [{ text: '(백업 스위치를 가동한다)', effect: { trust: 1 }, next: null }],
    },

    /* betrayal dialog tree */
    DLG_NY_BETRAYAL: {
      speaker: '노윤아', npc: 'NOYUNA',
      text: '거기까지예요. 미안해요. 진짜로. 근데 당신이 그 파일 보내면 나도 끝이에요. 우리 가족도 끝이에요.\n\n...저도 기자였어요. 3년 전까지. 이 사람들 취재하다가 — 딸 사진이 왔어요. 학교 앞에서 찍은 거. 주소도 같이.',
      choices: [
        { text: '지금이라도 같이 나가자', effect: { trust: 2 }, next: 'DLG_NY_BETR_A' },
        { text: '이건 잘못된 선택이야', effect: { trust: 1 }, next: 'DLG_NY_BETR_B' },
        { text: '(아무 말 없이 코드를 입력한다)', effect: { aggression: 1, flag: 'enteredB4Cold' }, next: null },
      ],
    },
    DLG_NY_BETR_A: {
      speaker: '노윤아', npc: 'NOYUNA',
      text: '딸이 중학교 들어갔어요. 저는 그 애한테 기자 엄마라고 거짓말했어요... 제가 지금 뭘 하고 있는 건지...',
      choices: [
        { text: '네 딸이 이 기사를 보게 될 거야', effect: { aggression: 1 }, next: null },
        { text: '(재밍 장치를 부드럽게 빼앗는다)', effect: { trust: 2, flag: 'trustedNoYuna' }, next: 'DLG_NY_BETR_WIN' },
      ],
    },
    DLG_NY_BETR_B: {
      speaker: '노윤아', npc: 'NOYUNA',
      text: '잘못된 선택이라뇨. 저한테는 이거 말고 선택지가 없었어요. 당신이라면... 당신 가족이 그 자리에 있었다면... 당신도 기사를 쓸 수 있었겠어요?',
      choices: [
        { text: '그래도 막을 수 없어', effect: {}, next: null },
      ],
    },
    DLG_NY_BETR_WIN: {
      speaker: '노윤아', npc: 'NOYUNA',
      text: '(재밍 장치를 내려놓는다) ...같이 가요. 증언할게요. 다 말할게요.',
      choices: [{ text: '(함께 진입한다)', effect: { flag: 'trustedNoYuna' }, next: null }],
    },
  },

  /* ---------------------------------------------------------------------
     EVENTS — cutscenes / timed choices
     --------------------------------------------------------------------- */
  events: {
    EVT_JISU_FOUND: {
      atmosphere: 'B3 어둠 속. 형체가 있다. 가까이 다가간다.',
      speaker: '박지수',
      text: '(어둠 속에서 손가락으로 바닥에 무언가를 쓴다)\n\n"Y가 교주를 안내한다."',
      onTrigger(S) {
        S.flags.jisuFound = true;
        S.suspicion += 1;
      },
      choices: [{ text: '(녹화한다)', next: null }],
    },
    EVT_CHASING: {
      atmosphere: '적막. 3초. 저음 진동이 바닥에서 올라온다. 김재원: "...조심해요. 뭔가 움직여요." 임선아가 가까이 있다.',
      speaker: '노윤아',
      text: '(속삭임) 이쪽으로—',
      timed: 8,
      choices: [
        { text: '노윤아를 따른다', effect: { trust: 1, suspicion: 1 }, next: null },
        { text: '반대 방향 비상계단으로 달린다', effect: { aggression: 1, battery: -15 }, next: null },
        { text: '성수대 뒤에 숨는다', effect: { battery: -5 }, next: null },
      ],
    },
    EVT_BETRAYAL: {
      atmosphere: '교주실 문 앞. 노윤아가 그림자에서 나타난다. 손에 작은 재밍 장치. 스마트 글라스 HUD가 흔들린다.',
      speaker: '노윤아',
      text: '거기까지예요.',
      choices: [
        { text: '대화한다', next: '__DLG__DLG_NY_BETRAYAL' },
        { text: '글라스 배터리로 강제 전송 시도', effect: { aggression: 1, battery: -40 }, next: null },
        { text: '코드를 입력해 교주실 진입', effect: { trust: 1 }, next: null },
      ],
    },
    EVT_ESCAPE: {
      atmosphere: '복도. 비상구 표지판들. 자폭 카운트다운. 박지수를 감금실에서 풀어내야 한다.',
      speaker: null,
      text: '어느 방향이 진짜 출구인가.',
      choices: [{ text: '(나침반 퍼즐을 푼다)', next: '__PUZZLE__MQ5' }],
    },
  },

  /* ---------------------------------------------------------------------
     INTRO / ZONE ENTRY MONOLOGUES
     --------------------------------------------------------------------- */
  monologues: {
    INTRO: [
      { speaker: '시스템', text: '[ 스마트 글라스 HUD 활성화 ]\n배터리: 100%\n녹화: ON', kind: 'system' },
      { speaker: '나 (내면)', text: '기자로서 15년. 전쟁터, 사고 현장, 독재 정권 기자회견장.\n그 어디서도 이런 기분은 없었다.\n이건 단순한 현장이 아니야. 누군가 의도적으로 설계한 공간이다.', kind: 'atmosphere' },
      { speaker: '김재원 (무전)', text: '"듣고 있어요? 오늘 밤 안에 나와야 합니다. 증거 없이는 기사 못 써요. 증거 있어야 사람도 살려요."', kind: 'speaker' },
      { speaker: '노윤아', text: '"늦었어요. 오늘 밤 새 신도 입교식이 있어요. 그 틈에 들어가야 해요. 절대… 성수는 마시지 마세요."', kind: 'speaker' },
      { speaker: '박규빈 (스피커)', text: '"두려움은 자유의 착각입니다. 방주 안에서는… 모두가 평온합니다."', kind: 'speaker' },
      { speaker: '나 (내면)', text: '박지수, 나 왔어.', kind: 'atmosphere' },
    ],
    B2: [{ speaker: '나 (내면)', text: '예배당에서 얻은 신도증을 손에 쥔다. 이준혁 — 박지수의 위장 이름.\n이 침대 번호를 기억하고, 단서를 숨겼다는 건 아직 이성이 남아있었다는 뜻이다.\n살아있어. 반드시.', kind: 'atmosphere' }],
    B3: [{ speaker: '나 (내면)', text: '혼자다. 완전한 어둠. 발소리가 사라진 줄 알았는데 — 아니, 처음부터 없었다.\n임선아는 소리를 내지 않는다. 저음 진동이 그녀가 접근하는 방식이다.\n움직여야 한다. 지금 당장.', kind: 'atmosphere' }],
    B4: [{ speaker: '나 (내면)', text: '냉백색 형광등. 설교 소리가 멈췄다. 처음으로 진짜 침묵이다.\n교주실. 20년 동안 이 사람이 꿈꾸던 공간.\n증거를 가져가야 한다. 그게 내 일이다. 다른 건 없다.', kind: 'atmosphere' }],
  },
};
