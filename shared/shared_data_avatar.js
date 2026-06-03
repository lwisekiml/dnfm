// ============================================================
// shared_data_avatar.js - 아바타/크리쳐/아티팩트 데이터
// ============================================================
// ※ 로드 순서: shared_data_seal.js 다음에 로드하세요.
// ============================================================


// ============================================
// 아바타 공통 상수
// ============================================
const AVATAR_PARTS = ["모자", "얼굴", "상의", "목가슴", "신발", "머리", "하의", "허리", "피부"];
const AVATAR_GRADES = ["언커먼", "레어"];

// 희귀도별 CSS 클래스
const AVATAR_GRADE_CLASS = { '언커먼': 'rare-언커먼', '레어': 'rare-레어' };

/**
 * 무기 아바타 수치 선택지 데이터
 * - label      : 화면에 표시될 텍스트
 * - stats      : 저장 시 스탯 키 배열 (JSON 저장용, 단일 수치면 배열 1개)
 * - amount     : 저장 시 숫자값 (없으면 null)
 * - optgroup   : true 이면 optgroup으로 렌더링 (선택 불가, 흰색 글자 유지)
 *
 * 추가 시 이 배열에만 항목을 넣으면 select에 자동 반영됨
 */
const AVATAR_WEAPON_STATS = [
    { label: '',                             stats: [],                                       amount: null                      },
    { label: '무기 아바타 수치',               stats: ['무기 아바타 수치'],                        amount: null, optgroup: true     },
    { label: '힘, 지능, 체력, 정신력 +18',     stats: ['힘', '지능', '체력', '정신력'],             amount: 18                        },
    { label: '힘, 지능, 체력, 정신력 +11',     stats: ['힘', '지능', '체력', '정신력'],             amount: 11                        },
];

// ============================================
// 아바타 파츠별 등급별 스탯 데이터
// ============================================
/**
 * - stats  : 스탯 키 배열 (백엔드 연동 시 사용)
 * - amount : 수치 (텍스트 표현이 필요한 경우 null)
 * - label  : 화면 표시 텍스트
 */
const AVATAR_PART_STATS = {
    "모자": {
        "언커먼": { stats: ['캐스팅속도'],   amount: 12,   label: '캐스팅속도 +12%'                             },
        "레어":   { stats: ['캐스팅속도'],   amount: 14,   label: '캐스팅속도 +14%'                             },
    },
    "얼굴": {
        "언커먼": { stats: ['공격속도'],     amount: 5,    label: '공격속도 +5%'                                },
        "레어":   { stats: ['공격속도'],     amount: 6,    label: '공격속도 +6%'                                },
    },
    "상의": {
        "언커먼": { stats: ['스킬Lv'],       amount: null, label: '모든 직업 15레벨 스킬Lv+1(TP스킬 제외)'      },
        "레어":   { stats: ['스킬Lv'],       amount: null, label: '모든 직업 10~30레벨 스킬Lv+1(TP스킬 제외)'  },
    },
    "목가슴": {
        "언커먼": { stats: ['공격속도'],     amount: 5,    label: '공격속도 +5%'                                },
        "레어":   { stats: ['공격속도'],     amount: 6,    label: '공격속도 +6%'                                },
    },
    "신발": {
        "언커먼": { stats: ['이동속도'],     amount: 5,    label: '이동속도 +5%'                                },
        "레어":   { stats: ['이동속도'],     amount: 6,    label: '이동속도 +6%'                                },
    },
    "머리": {
        "언커먼": { stats: ['캐스팅속도'],   amount: 12,   label: '캐스팅속도 +12%'                             },
        "레어":   { stats: ['캐스팅속도'],   amount: 14,   label: '캐스팅속도 +14%'                             },
    },
    "하의": {
        "언커먼": { stats: ['HP MAX'],       amount: 418,  label: 'HP MAX +418'                                 },
        "레어":   { stats: ['HP MAX'],       amount: 682,  label: 'HP MAX +682'                                 },
    },
    "허리": {
        "언커먼": { stats: ['회피확률'],     amount: 4,    label: '회피 확률 +4%'                               },
        "레어":   { stats: ['회피확률'],     amount: 6.5,  label: '회피 확률 +6.5%'                             },
    },
    "피부": {
        "언커먼": { stats: ['히트리커버리'], amount: 80,   label: '히트 리커버리 +80'                           },
        "레어":   { stats: ['히트리커버리'], amount: 100,  label: '히트 리커버리 +100'                },
    },
};
// ============================================
// 아바타 세트 효과 데이터
// ============================================
/**
 * - label      : 화면 표시 텍스트
 * - cumulative : true = 이전 세트 효과 누적 적용 (5세트→3세트 포함, 8세트→3+5세트 포함)
 * - stats      : 해당 단계 고유 스탯 (누적분 미포함)
 */
const AVATAR_SET_EFFECTS = {
    "언커먼": {
        3: {
            label: '힘/지능 +20, 체력 +10, 정신력 +10',
            cumulative: false,
            stats: [
                { stats: ['힘', '지능'],  amount: 20 },
                { stats: ['체력'],        amount: 10 },
                { stats: ['정신력'],      amount: 10 },
            ]
        },
        5: {
            label: 'HP MAX +100, MP MAX +100',
            cumulative: true,
            stats: [
                { stats: ['HP MAX'],  amount: 100 },
                { stats: ['MP MAX'],  amount: 100 },
            ]
        },
        8: {
            label: '힘/지능 +20, 체력 +20, 정신력 +10, 공격/캐스팅/이동속도 +1%',
            cumulative: true,
            stats: [
                { stats: ['힘', '지능'],  amount: 20  },
                { stats: ['체력'],        amount: 20  },
                { stats: ['정신력'],      amount: 10  },
                { stats: ['공격속도'],    amount: 1   },
                { stats: ['캐스팅속도'],  amount: 1   },
                { stats: ['이동속도'],    amount: 1   },
            ]
        },
    },
    "레어": {
        3: {
            label: '힘/지능 +35, 체력/정신력 +20, 공격/캐스팅/이동속도 +1.5%',
            cumulative: false,
            stats: [
                { stats: ['힘', '지능'],  amount: 35  },
                { stats: ['체력'],        amount: 20  },
                { stats: ['정신력'],      amount: 20  },
                { stats: ['공격속도'],    amount: 1.5 },
                { stats: ['캐스팅속도'],  amount: 1.5 },
                { stats: ['이동속도'],    amount: 1.5 },
            ]
        },
        5: {
            label: 'HP MAX +220, MP MAX +220, 적중/회피 확률 +1%',
            cumulative: true,
            stats: [
                { stats: ['HP MAX'],      amount: 220 },
                { stats: ['MP MAX'],      amount: 220 },
                { stats: ['적중확률'],    amount: 1   },
                { stats: ['회피확률'],    amount: 1   },
            ]
        },
        8: {
            label: '힘/지능 +35, 체력/정신력 +20, 공격/캐스팅/이동속도 +1.5%, 모든 속성 저항 +10, 마을 이동속도 +60%',
            cumulative: true,
            stats: [
                { stats: ['힘', '지능'],       amount: 35  },
                { stats: ['체력'],             amount: 20  },
                { stats: ['정신력'],           amount: 20  },
                { stats: ['공격속도'],         amount: 1.5 },
                { stats: ['캐스팅속도'],       amount: 1.5 },
                { stats: ['이동속도'],         amount: 1.5 },
                { stats: ['모든 속성 저항'],     amount: 10  },
                { stats: ['마을 이동속도 증가'],     amount: 60  },
            ]
        },
    },
};
// ============================================
// 크리쳐 아티팩트 희귀도별 스탯 데이터
// ============================================
/**
 * 아티팩트 색상별(red=1번, blue=2번, green=3번) × 희귀도별 스탯
 * - stat  : 스탯 키 (DB 저장용)
 * - amount: 수치
 * - label : 화면 표시 텍스트 ("힘 +10")
 */
const CREATURE_ART_STATS = {
    red: {
        "커먼":   [
            { stat: '힘',   amount: 10, label: '힘 +10'  },
            { stat: '지능', amount: 10, label: '지능 +10' },
            { stat: '체력', amount: 10, label: '체력 +10' },
            { stat: '정신력', amount: 10, label: '정신력 +10' },
            { stat: '적중', amount: 2,  label: '적중 +2'  },
            { stat: '회피', amount: 2,  label: '회피 +2'  },
        ],
        "언커먼": [
            { stat: '힘',   amount: 15, label: '힘 +15'  },
            { stat: '지능', amount: 15, label: '지능 +15' },
            { stat: '체력', amount: 15, label: '체력 +15' },
            { stat: '정신력', amount: 15, label: '정신력 +15' },
            { stat: '적중', amount: 4,  label: '적중 +4'  },
            { stat: '회피', amount: 4,  label: '회피 +4'  },
        ],
        "레어":   [
            { stat: '힘',   amount: 20, label: '힘 +20'  },
            { stat: '지능', amount: 20, label: '지능 +20' },
            { stat: '체력', amount: 20, label: '체력 +20' },
            { stat: '정신력', amount: 20, label: '정신력 +20' },
            { stat: '적중', amount: 6,  label: '적중 +6'  },
            { stat: '회피', amount: 6,  label: '회피 +6'  },
        ],
        "유니크": [
            { stat: '힘',   amount: 25, label: '힘 +25'  },
            { stat: '지능', amount: 25, label: '지능 +25' },
            { stat: '체력', amount: 25, label: '체력 +25' },
            { stat: '정신력', amount: 25, label: '정신력 +25' },
            { stat: '적중', amount: 9,  label: '적중 +9'  },
            { stat: '회피', amount: 9,  label: '회피 +9'  },
        ],
        "에픽":   [
            { stat: '힘',   amount: 30, label: '힘 +30'  },
            { stat: '지능', amount: 30, label: '지능 +30' },
            { stat: '체력', amount: 30, label: '체력 +30' },
            { stat: '정신력', amount: 30, label: '정신력 +30' },
            { stat: '적중', amount: 12, label: '적중 +12' },
            { stat: '회피', amount: 12, label: '회피 +12' },
        ],
    },
    blue: {
        "커먼":   [
            { stat: 'HP MAX',    amount: 30, label: 'HP MAX +30'    },
            { stat: 'MP MAX',    amount: 30, label: 'MP MAX +30'    },
            { stat: '물리 공격력', amount: 10, label: '물리 공격력 +10' },
            { stat: '마법 공격력', amount: 10, label: '마법 공격력 +10' },
            { stat: '물리 방어력', amount: 20, label: '물리 방어력 +20' },
            { stat: '마법 방어력', amount: 20, label: '마법 방어력 +20' },
        ],
        "언커먼": [
            { stat: 'HP MAX',    amount: 45, label: 'HP MAX +45'    },
            { stat: 'MP MAX',    amount: 45, label: 'MP MAX +45'    },
            { stat: '물리 공격력', amount: 15, label: '물리 공격력 +15' },
            { stat: '마법 공격력', amount: 15, label: '마법 공격력 +15' },
            { stat: '물리 방어력', amount: 30, label: '물리 방어력 +30' },
            { stat: '마법 방어력', amount: 30, label: '마법 방어력 +30' },
        ],
        "레어":   [
            { stat: 'HP MAX',    amount: 60, label: 'HP MAX +60'    },
            { stat: 'MP MAX',    amount: 60, label: 'MP MAX +60'    },
            { stat: '물리 공격력', amount: 20, label: '물리 공격력 +20' },
            { stat: '마법 공격력', amount: 20, label: '마법 공격력 +20' },
            { stat: '물리 방어력', amount: 40, label: '물리 방어력 +40' },
            { stat: '마법 방어력', amount: 40, label: '마법 방어력 +40' },
        ],
        "유니크": [
            { stat: 'HP MAX',    amount: 75, label: 'HP MAX +75'    },
            { stat: 'MP MAX',    amount: 75, label: 'MP MAX +75'    },
            { stat: '물리 공격력', amount: 25, label: '물리 공격력 +25' },
            { stat: '마법 공격력', amount: 25, label: '마법 공격력 +25' },
            { stat: '물리 방어력', amount: 50, label: '물리 방어력 +50' },
            { stat: '마법 방어력', amount: 50, label: '마법 방어력 +50' },
        ],
        "에픽":   [
            { stat: 'HP MAX',    amount: 90, label: 'HP MAX +90'    },
            { stat: 'MP MAX',    amount: 90, label: 'MP MAX +90'    },
            { stat: '물리 공격력', amount: 30, label: '물리 공격력 +30' },
            { stat: '마법 공격력', amount: 30, label: '마법 공격력 +30' },
            { stat: '물리 방어력', amount: 60, label: '물리 방어력 +60' },
            { stat: '마법 방어력', amount: 60, label: '마법 방어력 +60' },
        ],
    },
    green: {
        "커먼":   [
            { stat: '물리 크리티컬', amount: 2,   label: '물리 크리티컬 +2'  },
            { stat: '마법 크리티컬', amount: 2,   label: '마법 크리티컬 +2'  },
            { stat: '공격속도',     amount: 0.2, label: '공격속도 +0.2%'    },
            { stat: '캐스팅속도',   amount: 0.2, label: '캐스팅속도 +0.2%'  },
            { stat: '이동속도',     amount: 0.2, label: '이동속도 +0.2%'    },
            { stat: '화속강',       amount: 2,   label: '화속강 +2'         },
            { stat: '수속강',       amount: 2,   label: '수속강 +2'         },
            { stat: '명속강',       amount: 2,   label: '명속강 +2'         },
            { stat: '모속강',       amount: 2,   label: '모속강 +2'         },
        ],
        "언커먼": [
            { stat: '물리 크리티컬', amount: 4,   label: '물리 크리티컬 +4'  },
            { stat: '마법 크리티컬', amount: 4,   label: '마법 크리티컬 +4'  },
            { stat: '공격속도',     amount: 0.3, label: '공격속도 +0.3%'    },
            { stat: '캐스팅속도',   amount: 0.3, label: '캐스팅속도 +0.3%'  },
            { stat: '이동속도',     amount: 0.3, label: '이동속도 +0.3%'    },
            { stat: '화속강',       amount: 3,   label: '화속강 +3'         },
            { stat: '수속강',       amount: 3,   label: '수속강 +3'         },
            { stat: '명속강',       amount: 3,   label: '명속강 +3'         },
            { stat: '모속강',       amount: 3,   label: '모속강 +3'         },
        ],
        "레어":   [
            { stat: '물리 크리티컬', amount: 7,   label: '물리 크리티컬 +7'  },
            { stat: '마법 크리티컬', amount: 7,   label: '마법 크리티컬 +7'  },
            { stat: '공격속도',     amount: 0.4, label: '공격속도 +0.4%'    },
            { stat: '캐스팅속도',   amount: 0.4, label: '캐스팅속도 +0.4%'  },
            { stat: '이동속도',     amount: 0.4, label: '이동속도 +0.4%'    },
            { stat: '화속강',       amount: 4,   label: '화속강 +4'         },
            { stat: '수속강',       amount: 4,   label: '수속강 +4'         },
            { stat: '명속강',       amount: 4,   label: '명속강 +4'         },
            { stat: '모속강',       amount: 4,   label: '모속강 +4'         },
        ],
        "유니크": [
            { stat: '물리 크리티컬', amount: 10,  label: '물리 크리티컬 +10' },
            { stat: '마법 크리티컬', amount: 10,  label: '마법 크리티컬 +10' },
            { stat: '공격속도',     amount: 0.5, label: '공격속도 +0.5%'    },
            { stat: '캐스팅속도',   amount: 0.5, label: '캐스팅속도 +0.5%'  },
            { stat: '이동속도',     amount: 0.5, label: '이동속도 +0.5%'    },
            { stat: '화속강',       amount: 5,   label: '화속강 +5'         },
            { stat: '수속강',       amount: 5,   label: '수속강 +5'         },
            { stat: '명속강',       amount: 5,   label: '명속강 +5'         },
            { stat: '모속강',       amount: 5,   label: '모속강 +5'         },
        ],
        "에픽":   [
            { stat: '물리 크리티컬', amount: 14,  label: '물리 크리티컬 +14' },
            { stat: '마법 크리티컬', amount: 14,  label: '마법 크리티컬 +14' },
            { stat: '공격속도',     amount: 0.6, label: '공격속도 +0.6%'    },
            { stat: '캐스팅속도',   amount: 0.6, label: '캐스팅속도 +0.6%'  },
            { stat: '이동속도',     amount: 0.6, label: '이동속도 +0.6%'    },
            { stat: '화속강',       amount: 6,   label: '화속강 +6'         },
            { stat: '수속강',       amount: 6,   label: '수속강 +6'         },
            { stat: '명속강',       amount: 6,   label: '명속강 +6'         },
            { stat: '모속강',       amount: 6,   label: '모속강 +6'         },
        ],
    },
};
// ============================================
// 크리쳐 데이터
// ============================================
/**
 * 크리쳐 이름 목록 및 설명
 * - name  : 화면 표시 / 저장값
 * - info : 있을 경우 info 출력. 없을 경우 stats 출력(사용방법 : ``로 감싸서 사용)
 * - stats : 스탯 목록 ({ stat, amount, label })
 *           label 을 줄바꿈으로 이어붙여 desc textarea에 자동 입력
 */
const _CREATURE_TEMPLATES = {
    // 진 : 옥령왕, 뇌해:마고스, 멸망의 칼릭스, 파광의 아스마르
    EPIC_V1: {
        info: `모든 속성 강화 +5\n공격 시 18% 추가 데미지`,
        stats: [
            { stat: '모든 속성 강화',      amount: 5,  label: '모든 속성 강화 +5'       },
            { stat: '공격 시 추가 데미지', amount: 18, unit: '%', label: '공격 시 18% 추가 데미지' },
        ]
    },
    // 곰인형 민D, ARCADE 세리아
    EPIC_V2: {
        info: `물리, 마법 크리티컬 확률 +2%\n모든 속성 강화 +8\n공격 시 21% 추가 데미지`,
        stats: [
            { stat: '물리 크리티컬 확률', amount: 2,  unit: '%', label: '물리 크리티컬 확률 +2%'  },
            { stat: '마법 크리티컬 확률', amount: 2,  unit: '%', label: '마법 크리티컬 확률 +2%'  },
            { stat: '모든 속성 강화',     amount: 8,             label: '모든 속성 강화 +8'       },
            { stat: '공격 시 추가 데미지',amount: 21, unit: '%', label: '공격 시 21% 추가 데미지' },
        ]
    },
    // 4th Anniversary 세리아, 에지, 캐넌 아스칸, 캐넌 레아, 우주로 떠난 토끼
    EPIC_V3: {
        info: `물리, 마법 크리티컬 확률 +2%\n모든 속성 강화 +10\n공격 시 25% 추가 데미지`,
        stats: [
            { stat: '물리 크리티컬 확률', amount: 2,  unit: '%', label: '물리 크리티컬 확률 +2%'  },
            { stat: '마법 크리티컬 확률', amount: 2,  unit: '%', label: '마법 크리티컬 확률 +2%'  },
            { stat: '모든 속성 강화',     amount: 10,             label: '모든 속성 강화 +10'       },
            { stat: '공격 시 추가 데미지',amount: 25, unit: '%', label: '공격 시 25% 추가 데미지' },
        ]
    },
    // 드래곤테이머 소피아, 시공을 초월한 차원 여행자 에오스, 샴푸
    EPIC_V4: {
        info: `물리, 마법 크리티컬 확률 +2%\n모든 속성 강화 +10\n공격 시 25% 추가 데미지\n최종 데미지 5% 증가`,
        stats: [
            { stat: '물리 크리티컬 확률',   amount: 2,  unit: '%', label: '물리 크리티컬 확률 +2%'  },
            { stat: '마법 크리티컬 확률',   amount: 2,  unit: '%', label: '마법 크리티컬 확률 +2%'  },
            { stat: '모든 속성 강화',      amount: 10,             label: '모든 속성 강화 +10'       },
            { stat: '공격 시 추가 데미지',  amount: 25, unit: '%', label: '공격 시 25% 추가 데미지' },
            { stat: '최종 데미지 증가',    amount: 5,  unit: '%',  label: '최종 데미지 5% 증가' },
        ]
    },


    // SD 켈라이노
    UNIQUE_V1: {
        info: `던전 입장 시 힘 +30\n물리 공격력 +5% 증가`,
        stats: []
    },
    // SD 스테로페
    UNIQUE_V2: {
        info: `던전 입장 시 지능 +30\n마법 공격력 +5% 증가`,
        stats: []
    },
    // 유이, 마법사 소피아, 소피아, 아스나, 리즈벳, 스구하, 토티, 전장의 발키리 에이르, 마가티나
    // SD 타크로드, SD 네메시스, SD 염제 폐월수화, SD 지니위즈, SD 헤카테, SD 세인트, SD 세라핌, SD 천선낭랑
    // 무스
    UNIQUE_V3: {
        info: `던전 입장 시 자신을 포함한 파티원의 모든 속성 강화 11 증가\n공격 시 5% 추가 데미지`,
        stats: [
            { stat: '공격 시 추가 데미지', amount: 5, unit: '%', label: '공격 시 5% 추가 데미지' },
        ]
    },
    // 검돌이, 방위대 드론, 기사 세바스찬, 세바스찬, 델피나, 전장의 발키리 미스트, 마가티노
    // SD 검신, SD 블러드 이블, SD 인다라천, SD 마제스티, SD 디어사이드, SD 검제, SD 카이저, SD 용독문주, SD 얼티밋 디바, SD 레이븐, SD 디스트로이어, SD 프라임, SD 커맨더, SD 크림슨로제, SD 스톰트루퍼, SD 옵티머스, SD 프레이야, SD 오버마인드, SD 아슈타르테
    // SD 저스티스, SD 인페르노, SD 리디머, SD 이그제큐터, SD 알키오네, SD 시라누이, SD 워로드, SD 에레보스, SD 테라 치프, SD 트라이브 윙
    UNIQUE_V4: {
        info: `공격 시 15% 추가 데미지`,
        stats: [
            { stat: '공격 시 추가 데미지', amount: 15, unit: '%', label: '공격 시 15% 추가 데미지' },
        ]
    },
    // 차원 여행자 에오스, P짱
    UNIQUE_V5: {
        info: `공격 시 18% 추가 데미지`,
        stats: [
            { stat: '공격 시 추가 데미지', amount: 18, unit: '%', label: '공격 시 18% 추가 데미지' },
        ]
    },
    // 차원 과학자 헤스
    UNIQUE_V6: {
        info: `던전 입장 시 자신을 포함한 파티원의 모든 속성 강화 18 증가\n공격 시 5% 추가 데미지`,
        stats: [
            { stat: '공격 시 추가 데미지', amount: 5, unit: '%', label: '공격 시 5% 추가 데미지' },
        ]
    },


    // 짐꾼 당나귀
    RARE_V1: {
        info: `던전 입장 시 공격속도 3%, 이동속도 3%, 캐스팅속도 3%, 물리, 마법 방어력 1200 증가`,
        stats: []
    },
    // 무직, 마법학 교수, 초등학생 크리쳐, 달빛 매니저
    RARE_V2: {
        info: `던전 입장 시 60초 마다 HP 1% 회복`,
        stats: []
    },
    // SD 여귀검사
    RARE_V3: {
        info: `신검합일 +1, 컨제스트+1, 광폭화 +1, 오기조원 +1, 트레이스 +1\n반월 +1, 블랙 미러 +1, 혈화난무 +1, 난화검 +1, 와일드 플로우 +1`,
        stats: []
    },
    // SD 여거너
    RARE_V4: {
        info: `페이탈 스팟 +1, 토크 오버클럭 +1, 임프루브먼트 +1, 오버 차지 +1\n권총의 춤 +1, 다연장로켓포 - 칼리오페 +1, 마그네틱 필드 +1, 네이팜 탄 +1`,
        stats: []
    },
    // SD 여프리스트
    RARE_V5: {
        info: `용맹의 축복 +1, 광적인 믿음 +1, 신탁의 기원 +1, 일곱개의 대죄 +1, 러쉬 스탠스 +1\n홀리 플래쉬 +1, 성화 +1, 용의 격노 +1, 그리드 더 러커 +1, 래빗 펀치 +1`,
        stats: []
    },
    // 펌킨 단진, 붉은 잭 오 랜턴
    RARE_V6: {
        info: `던전 입장 시 화속성 강화 4, 수속성 강화 4, 화속성 저항 4, 수속성 저항 4 증가`,
        stats: []
    },
    // 펌킨 랜디, 녹색 잭 오 랜턴
    RARE_V7: {
        info: `던전 입장 시 암속성 강화 4, 명속성 강화 4, 암속성 저항 4, 명속성 저항 4 증가`,
        stats: []
    },
    // 쁘띠 베키, 쁘띠 골드크라운, 쁘띠 아르고스
    RARE_V8: {
        info: `공격 시 5% 확률로 10초 동안 공격속도, 캐스팅속도, 이동속도 3% 증가(쿨타임 10초)`,
        stats: []
    },
    // 베히의 축복, 웅녀, 단진의 축복
    RARE_V9: {
        info: `공격 시 5% 확률로 20초 동안 공격속도, 캐스팅속도, 이동속도 3% 증가(쿨타임 10초)`,
        stats: []
    },
    // 퍼스트 버서커 : 카잔 파핑 크리쳐
    RARE_V10: {
        info: `공격 시 5% 확률로 15초 동안 공격속도, 캐스팅속도, 이동속도 3% 증가(쿨타임 15초)`,
        stats: []
    },
    // 통통 베히볼
    RARE_V11: {
        info: `던전 입장 시 자신을 포함한 파티원의 모든 속성 강화 2 증가`,
        stats: []
    },
    // 4th 아루, 4th 따봉 기어, 4th 하트 에임, 4th 파티 크라운, 4th 사회자 마누스, 4th 윙키, SD 라라아 크리쳐
    RARE_V12: {
        info: `던전 입장 시 모든 속성 강화 3, 모든 속성 저항 3 증가`,
        stats: [
            { stat: '던전 입장 시 모든 속성 강화', amount: 3, unit: '', label: '던전 입장 시 모든 속성 강화 3' },
            { stat: '던전 입장 시 모든 속성 저항', amount: 3, unit: '', label: '던전 입장 시 모든 속성 저항 3' },

        ]
    },
    // SD 남격투가
    RARE_V13: {
        info: `화염의 각 +1, 뒷골목 싸움법 +1, 홍염질풍각 +1, 마운트 +1`,
        stats: []
    },


    // 비네, 쁘띠 스켈레톤 골드
    UNCOMMON_V1: {
        info: `공격 시 104의 추가 데미지`,
        stats: [
            { stat: '공격 시 추가 데미지', amount: 104, unit: '', label: '공격 시 104의 추가 데미지' },
        ]
    },


    // 2주년 케이크 모자를 쓴 플랑, 3rd 뿌우단진
    COMMON_V1: {
        info: `공격 시 52의 추가 데미지`,
        stats: [
            { stat: '공격 시 추가 데미지', amount: 52, unit: '', label: '공격 시 52의 추가 데미지' },
        ]
    },
};

const CREATURE_ITEM_INFO = {
    // === 에픽 (EPIC) ===
    "4th Anniversary 세리아": { grade: '에픽', ..._CREATURE_TEMPLATES.EPIC_V3 },
    "ARCADE 세리아": { grade: '에픽', ..._CREATURE_TEMPLATES.EPIC_V2 },
    "곰인형 민D": { grade: '에픽', ..._CREATURE_TEMPLATES.EPIC_V2 },
    "뇌해:마고스": { grade: '에픽', ..._CREATURE_TEMPLATES.EPIC_V1 },
    "단진의 축복": { grade: '레어', ..._CREATURE_TEMPLATES.RARE_V9 },
    "드래곤테이머 소피아": { grade: '에픽', ..._CREATURE_TEMPLATES.EPIC_V4 },
    "멸망의 칼릭스": { grade: '에픽', ..._CREATURE_TEMPLATES.EPIC_V1 },
    "밧코": { grade: '에픽', ..._CREATURE_TEMPLATES.EPIC_V3 },
    "선장 제니아": { grade: '에픽', ..._CREATURE_TEMPLATES.EPIC_V3 },
    "시공을 초월한 차원 여행자 에오스": { grade: '에픽', ..._CREATURE_TEMPLATES.EPIC_V4 },
    "에지": { grade: '에픽', ..._CREATURE_TEMPLATES.EPIC_V3 },
    "우주로 떠난 토끼": { grade: '에픽', ..._CREATURE_TEMPLATES.EPIC_V3 },
    "진 : 옥령왕": { grade: '에픽', ..._CREATURE_TEMPLATES.EPIC_V1 },
    "캐넌 레아": { grade: '에픽', ..._CREATURE_TEMPLATES.EPIC_V3 },
    "캐넌 아스칸": { grade: '에픽', ..._CREATURE_TEMPLATES.EPIC_V3 },
    "파광의 아스마르": { grade: '에픽', ..._CREATURE_TEMPLATES.EPIC_V1 },
    "샴푸": { grade: '에픽', ..._CREATURE_TEMPLATES.EPIC_V4 },

    // === 유니크 (UNIQUE) ===
    "SD 검신": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V4 },
    "SD 검제": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V4 },
    "SD 네메시스": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V3 },
    "SD 디어사이드": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V4 },
    "SD 디스트로이어": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V4 },
    "SD 레이븐": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V4 },
    "SD 리디머": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V4 },
    "SD 마제스티": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V4 },
    "SD 블러드 이블": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V4 },
    "SD 세라핌": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V3 },
    "SD 세인트": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V3 },
    "SD 스테로페": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V2 },
    "SD 스톰트루퍼": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V4 },
    "SD 시라누이": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V4 },
    "SD 아슈타르테": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V4 },
    "SD 알키오네": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V4 },
    "SD 에레보스": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V4 },
    "SD 염제 폐월수화": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V3 },
    "SD 오버마인드": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V4 },
    "SD 옵티머스": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V4 },
    "SD 용독문주": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V4 },
    "SD 워로드": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V4 },
    "SD 인다라천": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V4 },
    "SD 인페르노": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V4 },
    "SD 저스티스": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V4 },
    "SD 지니위즈": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V3 },
    "SD 천선낭랑": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V3 },
    "SD 카이저": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V4 },
    "SD 커맨더": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V4 },
    "SD 켈라이노": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V1 },
    "SD 크림슨로제": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V4 },
    "SD 타크로드": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V3 },
    "SD 테라 치프": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V4 },
    "SD 트라이브 윙": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V4 },
    "SD 프라임": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V4 },
    "SD 프레이야": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V4 },
    "SD 헤카테": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V3 },
    "검돌이": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V4 },
    "기사 세바스찬": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V4 },
    "델피나": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V4 },
    "리즈벳": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V3 },
    "마가티나": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V3 },
    "마가티노": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V4 },
    "마법사 소피아": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V3 },
    "방위대 드론": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V4 },
    "세바스찬": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V4 },
    "소피아": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V3 },
    "스구하": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V3 },
    "아스나": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V3 },
    "유이": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V3 },
    "전장의 발키리 미스트": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V4 },
    "전장의 발키리 에이르": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V3 },
    "차원 과학자 헤스": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V6 },
    "차원 여행자 에오스": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V5 },
    "P짱": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V5 },
    "토티": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V3 },
    "무스": { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V3 },

    // === 레어 (RARE) ===
    "4th 따봉 기어": { grade: '레어', ..._CREATURE_TEMPLATES.RARE_V11 },
    "4th 사회자 마누스": { grade: '레어', ..._CREATURE_TEMPLATES.RARE_V11 },
    "4th 아루": { grade: '레어', ..._CREATURE_TEMPLATES.RARE_V11 },
    "4th 윙키": { grade: '레어', ..._CREATURE_TEMPLATES.RARE_V11 },
    "4th 파티 크라운": { grade: '레어', ..._CREATURE_TEMPLATES.RARE_V11 },
    "4th 하트 에임": { grade: '레어', ..._CREATURE_TEMPLATES.RARE_V11 },
    "SD 여거너": { grade: '레어', ..._CREATURE_TEMPLATES.RARE_V4 },
    "SD 여귀검사": { grade: '레어', ..._CREATURE_TEMPLATES.RARE_V3 },
    "SD 여프리스트": { grade: '레어', ..._CREATURE_TEMPLATES.RARE_V5 },
    "SD 남격투가": { grade: '레어', ..._CREATURE_TEMPLATES.RARE_V13 },
    "녹색 잭 오 랜턴": { grade: '레어', ..._CREATURE_TEMPLATES.RARE_V7 },
    "달빛 매니저": { grade: '레어', ..._CREATURE_TEMPLATES.RARE_V2 },
    "마법학 교수": { grade: '레어', ..._CREATURE_TEMPLATES.RARE_V2 },
    "무직": { grade: '레어', ..._CREATURE_TEMPLATES.RARE_V2 },
    "베히의 축복": { grade: '레어', ..._CREATURE_TEMPLATES.RARE_V9 },
    "붉은 잭 오 랜턴": { grade: '레어', ..._CREATURE_TEMPLATES.RARE_V6 },
    "쁘띠 골드크라운": { grade: '레어', ..._CREATURE_TEMPLATES.RARE_V8 },
    "쁘띠 베키": { grade: '레어', ..._CREATURE_TEMPLATES.RARE_V8 },
    "쁘띠 아르고스": { grade: '레어', ..._CREATURE_TEMPLATES.RARE_V8 },
    "웅녀": { grade: '레어', ..._CREATURE_TEMPLATES.RARE_V9 },
    "짐꾼 당나귀": { grade: '레어', ..._CREATURE_TEMPLATES.RARE_V1 },
    "초등학생 크리쳐": { grade: '레어', ..._CREATURE_TEMPLATES.RARE_V2 },
    "통통 베히볼": { grade: '레어', ..._CREATURE_TEMPLATES.RARE_V11 },
    "퍼스트 버서커 : 카잔 파핑 크리쳐": { grade: '레어', ..._CREATURE_TEMPLATES.RARE_V10 },
    "펌킨 단진": { grade: '레어', ..._CREATURE_TEMPLATES.RARE_V6 },
    "펌킨 랜디": { grade: '레어', ..._CREATURE_TEMPLATES.RARE_V7 },
    "SD 라라아 크리쳐": { grade: '레어', ..._CREATURE_TEMPLATES.RARE_V12 },

    // === 언커먼 (UNCOMMON) ===
    "비네": { grade: '언커먼', ..._CREATURE_TEMPLATES.UNCOMMON_V1 },
    "쁘띠 스켈레톤 골드": { grade: '언커먼', ..._CREATURE_TEMPLATES.UNCOMMON_V1 },

    // === 커먼 (COMMON) ===
    "2주년 케이크 모자를 쓴 플랑": { grade: '커먼', ..._CREATURE_TEMPLATES.COMMON_V1 },
    "3rd 뿌우단진": { grade: '커먼', ..._CREATURE_TEMPLATES.COMMON_V1 }
};
// ============================================
// 아티팩트 세트 데이터
// ============================================
/**
 * ARTIFACT_SET_DATA
 * - setName  : 세트 이름 (아티팩트 세트 효과 라벨)
 * - red/blue/green
 *     - name   : 아티팩트 이름 (datalist 후보 + 자동입력 키)
 *     - stats  : 아티팩트 스탯 ({ key: data-creature-art key, val: 값 })
 * - setEffect : 세트 효과 텍스트 (줄바꿈 구분)
 */
const ARTIFACT_SET_DATA = [
    {
        setName: '솔도로스 아티팩트 세트',
        red: {
            name: '솔도로스의 사자검',
            stats: {
                '크리쳐_art_red_stat_물리 공격력': '22',
                '크리쳐_art_red_stat_마법 공격력': '22',
                '크리쳐_art_red_stat_힘':         '36',
                '크리쳐_art_red_stat_지능':        '36',
            }
        },
        blue: {
            name: '솔도로스의 탈혼검',
            stats: {
                '크리쳐_art_blue_stat_공격속도':   '5',
                '크리쳐_art_blue_stat_캐스팅속도':  '7.5',
                '크리쳐_art_blue_stat_이동속도':   '2.5',
                '크리쳐_art_blue_stat_적중':       '100',
            }
        },
        green: {
            name: '솔도로스의 탈명도',
            stats: {
                '크리쳐_art_green_stat_HPMAX':  '165',
                '크리쳐_art_green_stat_MPMAX':  '165',
                '크리쳐_art_green_stat_모속강': '4',
            }
        },
        setEffect: '최종 데미지 5% 증가\n모속강 +10\n공격 시 5% 추가 데미지\n30초 마다 공격속도 3%, 이동속도 3%, 캐스팅속도 3% 증가',
    },
    {
        setName: '흑룡 아티팩트 3세트 효과',
        red: {
            name: '어둠을 부리는 지팡이',
            stats: {
                '크리쳐_art_red_stat_물리 공격력': '22',
                '크리쳐_art_red_stat_마법 공격력': '22',
                '크리쳐_art_red_stat_힘':         '36',
                '크리쳐_art_red_stat_지능':        '36',
            }
        },
        blue: {
            name: '복수를 가리는 가면',
            stats: {
                '크리쳐_art_blue_stat_공격속도':   '5',
                '크리쳐_art_blue_stat_캐스팅속도':  '7.5',
                '크리쳐_art_blue_stat_이동속도':   '2.5',
                '크리쳐_art_blue_stat_적중':       '100',
            }
        },
        green: {
            name: '마법이 깃든 망토',
            stats: {
                '크리쳐_art_green_stat_HPMAX':  '165',
                '크리쳐_art_green_stat_MPMAX':  '165',
                '크리쳐_art_green_stat_모속강': '4',
            }
        },
        setEffect: '모속강 +10\n공격 시 5% 추가 데미지\n30초 마다 공격속도 3%, 이동속도 3%, 캐스팅속도 3% 증가',
    },
    {
        setName: '시로코 아티팩트 3세트 효과',
        red: {
            name: '침식된 마검',
            stats: {
                '크리쳐_art_red_stat_물리 공격력': '22',
                '크리쳐_art_red_stat_마법 공격력': '22',
                '크리쳐_art_red_stat_힘':         '36',
                '크리쳐_art_red_stat_지능':        '36',
            }
        },
        blue: {
            name: '여왕의 왕관',
            stats: {
                '크리쳐_art_blue_stat_공격속도':   '5',
                '크리쳐_art_blue_stat_캐스팅속도':  '7.5',
                '크리쳐_art_blue_stat_이동속도':   '2.5',
                '크리쳐_art_blue_stat_적중':       '100',
            }
        },
        green: {
            name: '침식의 베일',
            stats: {
                '크리쳐_art_green_stat_HPMAX':  '165',
                '크리쳐_art_green_stat_MPMAX':  '165',
                '크리쳐_art_green_stat_모속강': '4',
            }
        },
        setEffect: '최종 데미지 5% 증가\n모속강 +10\n공격 시 5% 추가 데미지\n30초 마다 공격속도 3%, 이동속도 3%, 캐스팅속도 3% 증가',
    },
    {
        setName: '아스마르 아티팩트 3세트 효과',
        red: {
            name: '광기 서린 손톱',
            stats: {
                '크리쳐_art_red_stat_물리 공격력': '22',
                '크리쳐_art_red_stat_마법 공격력': '22',
                '크리쳐_art_red_stat_힘':         '36',
                '크리쳐_art_red_stat_지능':        '36',
            }
        },
        blue: {
            name: '갈망을 머금은 꼬리',
            stats: {
                '크리쳐_art_blue_stat_공격속도':   '5',
                '크리쳐_art_blue_stat_캐스팅속도':  '7.5',
                '크리쳐_art_blue_stat_이동속도':   '2.5',
                '크리쳐_art_blue_stat_적중':       '100',
            }
        },
        green: {
            name: '증오의 갑각 외피',
            stats: {
                '크리쳐_art_green_stat_HPMAX':  '165',
                '크리쳐_art_green_stat_MPMAX':  '165',
                '크리쳐_art_green_stat_모속강': '4',
            }
        },
        setEffect: '모속강 +10\n공격 시 5% 추가 데미지\n30초 마다 공격속도 3%, 이동속도 3%, 캐스팅속도 3% 증가',
    },
    {
        setName: '새끼용의 손톱, 실프의 오브, 에메랄드 오브',
        red: {
            name: '새끼용의 손톱',
            stats: {
                '크리쳐_art_red_stat_힘':         '18',
                '크리쳐_art_red_stat_지능':        '18',
            }
        },
        blue: {
            name: '실프의 오브',
            stats: {
                '크리쳐_art_blue_stat_공격속도':   '5',
                '크리쳐_art_blue_stat_캐스팅속도':  '7.5',
            }
        },
        green: {
            name: '에메랄드 오브',
            stats: {
                '크리쳐_art_green_stat_HPMAX':  '165',
            }
        },
    },
    {
        setName: '새끼용의 이빨, 실프의 날개, 에메랄드 머리장식',
        red: {
            name: '새끼용의 이빨',
            stats: {
                '크리쳐_art_red_stat_힘':         '13',
                '크리쳐_art_red_stat_지능':        '13',
            }
        },
        blue: {
            name: '실프의 날개',
            stats: {
                '크리쳐_art_blue_stat_공격속도':   '4',
                '크리쳐_art_blue_stat_캐스팅속도':  '6',
            }
        },
        green: {
            name: '에메랄드 머리장식',
            stats: {
                '크리쳐_art_green_stat_HPMAX':  '132',
            }
        },
    },
    {
        setName: '찐빵 세트',
        red: {
            name: '피자 찐빵',
            stats: {
                '크리쳐_art_red_stat_힘':         '18',
                '크리쳐_art_red_stat_지능':        '18',
            }
        },
        blue: {
            name: '고구마 찐빵',
            stats: {
                '크리쳐_art_blue_stat_공격속도':   '5',
                '크리쳐_art_blue_stat_캐스팅속도':  '7.5',
            }
        },
        green: {
            name: '야채 찐빵',
            stats: {
                '크리쳐_art_green_stat_HPMAX':  '165',
            }
        },
    },
    {
        setName: '디저트 세트',
        red: {
            name: '초코 바닐라 딸기 콘',
            stats: {
                '크리쳐_art_red_stat_힘':         '18',
                '크리쳐_art_red_stat_지능':        '18',
            }
        },
        blue: {
            name: '트로피컬 블루 레몬 하드',
            stats: {
                '크리쳐_art_blue_stat_공격속도':   '5',
                '크리쳐_art_blue_stat_캐스팅속도':  '7.5',
            }
        },
        green: {
            name: '과일 초코 녹차 파르페',
            stats: {
                '크리쳐_art_green_stat_HPMAX':  '165',
            }
        },
    },
    {
        setName: '초콜릿 세트',
        red: {
            name: '장난감을 품은 초콜릿',
            stats: {
                '크리쳐_art_red_stat_힘':         '18',
                '크리쳐_art_red_stat_지능':        '18',
            }
        },
        blue: {
            name: '뭐지 모름',
            stats: {
                '크리쳐_art_blue_stat_공격속도':   '5',
                '크리쳐_art_blue_stat_캐스팅속도':  '7.5',
            }
        },
        green: {
            name: '두바이를 건너온 초콜릿',
            stats: {
                '크리쳐_art_green_stat_HPMAX':  '165',
            }
        },
    },
];

console.log("✅ shared_data_avatar.js 로드 완료");
