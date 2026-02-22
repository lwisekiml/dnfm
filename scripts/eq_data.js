/* ========================================
[섹션 1] 전역 변수 & 상수 선언
======================================== */
// ※ 세트/아이템 데이터 → shared_data.js
// ※ 접두어/익시드/색상 상수 → shared_constants.js
// ※ 무기 데이터 → shared_weapon.js

let activeCharacterId = null;
let activeWeaponJob = null;
let currentUpdatePage = 1;
let allUpdatesData = [];
const ITEMS_PER_PAGE = 10;
const TOTAL_PAGES = 5;

let currentActionCharId = null;

// ===== 전역 상태 변수 =====
let currentSetName = null;
let currentChar = null;
let currentFilter = 'ALL'; // 현재 선택된 필터 ('ALL', 'BASE', 'PREFIX', 'EXCEED')

// 무기 테이블 행 강조
let highlightedRowId = null;

// 강조 상태 (기존 Set에서 단일 변수로 변경)
let highlightedColumnIndex = null;

let craftLocked = true;

// calcTotalDistinctParts 결과 캐시
// 구조: { "charId|setName": distinctParts }
let distinctPartsCache = {};

// 캐릭터 순서 편집 모드
let isEditingCharacterOrder = false;

// 전역 최대 길이 (calculateGlobalWidths에서 계산됨)
let globalSetNameWidth = 200;
let globalSlotWidth = 100;

// 레거시 장비는 접두어만 있고 일반 장비가 없음 (빈 배열) - 테스트 export용
const ARMOR_EXCEED_ONLY = [];
const ACCESSORY_EXCEED_ONLY = [];

/* ========================================
[섹션 2] 초기 캐릭터 데이터
======================================== */
let characters = [
    {
        id: "c1", job: "검귀", name: "강의", armorCounts: {
            "어느 말괄량이의 탐사복 상의": 1,
            "어느 말괄량이의 탐사복 하의": 1,
            "어느 말괄량이의 탐사복 어깨": 1,
            "엘팅 메모리얼의 기억 팔찌": 1,
            "[의지] 견고: 엘팅 메모리얼의 기억 팔찌": 1,
            "개구쟁이 호문쿨루스 귀걸이": 1
        }, updateTimes: {
            "어느 말괄량이의 탐사복 상의": Date.now() - 50000,
            "어느 말괄량이의 탐사복 하의": Date.now() - 40000,
            "어느 말괄량이의 탐사복 어깨": Date.now() - 30000,
            "엘팅 메모리얼의 기억 팔찌": Date.now() - 20000,
            "[의지] 견고: 엘팅 메모리얼의 기억 팔찌": Date.now() - 10000,
            "개구쟁이 호문쿨루스 귀걸이": Date.now()
        }
    }
];
