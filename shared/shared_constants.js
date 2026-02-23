// ============================================================
// shared_constants.js - 공유 상수 정의
// ============================================================
// ※ 이 파일은 project1(index.html)과 project2(eq_index.html)
//    양쪽에서 공통으로 사용하는 상수를 담습니다.
// ※ 로드 순서: shared_data.js 다음에 로드하세요.
// ============================================================

/* ============================================================
   [섹션 1] 슬롯 정의
   - project1: AppConstants.SLOTS 로 참조
   - project2: SlotUtils.* 로 참조
   ============================================================ */

// 전체 슬롯 순서 (project1 기준)
const SHARED_SLOTS = [
    "무기", "상의", "어깨", "하의", "신발", "벨트",
    "목걸이", "팔찌", "반지",
    "보조장비", "귀걸이", "마법석",
    "칭호", "외형칭호", "오라", "아바타", "스킬룬", "크리쳐"
];

// 굵은 테두리 슬롯 (project1 전용)
const SHARED_HEAVY_BORDER_SLOTS = [
    "무기", "벨트", "반지", "마법석", "아바타", "스킬룬", "크리쳐"
];

// 슬롯 타입별 분류 (양쪽 공용)
const SLOT_TYPES = {
    ARMOR:     ["상의", "어깨", "하의", "신발", "벨트"],
    ACCESSORY: ["목걸이", "팔찌", "반지"],
    SPECIAL:   ["보조장비", "귀걸이", "마법석"],
    EMBLEM_HIGHLIGHT: ["보조장비", "귀걸이", "마법석", "칭호"]
};


/* ============================================================
   [섹션 2] 접두어 목록
   - SHARED_ARMOR_PREFIXES  : 방어구 접두어 (project1 드롭다운용 전체 목록)
   - ARMOR_PREFIX (세트별)  : shared_data.js 에 위치
   ============================================================ */

// 방어구 접두어 전체 목록 (project1 드롭다운)
const SHARED_ARMOR_PREFIXES = [
    "", "전격", "허상", "작열", "침식", "수호", "왜곡",
    "자상", "맹독", "보호", "쇄도", "신속", "연격"
];

// 방어구 티어 접두어
const SHARED_TIER_PREFIXES = ["", "T1", "T2", "T3", "T4", "T5", "T6", "T7"];

// 악세 접두어 전체 목록
const SHARED_ACC_PREFIXES = ["", "견고", "혈독", "초석", "각오", "가속", "조화"];

// 특수장비 접두어 전체 목록
const SHARED_SPEC_PREFIXES = ["", "불굴", "숙련", "결의", "격변", "촉진", "질주"];


/* ============================================================
   [섹션 3] 익시드 관련 상수 (project2 중심, 양쪽 공용)
   ============================================================ */

const EXCEED_TAGS = ["선봉", "의지", "이상"];

// 익시드가 적용되는 슬롯 (세트 타입별)
const EXCEED_SLOTS = {
    ARMOR:     ["상의"],
    ACCESSORY: ["팔찌"],
    SPECIAL:   ["귀걸이"]
};

// 익시드 색상
const EXCEED_COLOR_MAP = {
    "선봉": "#ff4d4d",
    "의지": "#4d94ff",
    "이상": "#2ecc71"
};

// 레거시 세트 여부 판단 (shared_data.js 의 LEGACY_PREFIX_SETS 참조)
// → makePrefixKey() 도 shared_data.js 에 위치


/* ============================================================
   [섹션 4] 희귀도 / 색상 (양쪽 공용)
   ============================================================ */

const SHARED_RARITY_COLORS = {
    // 희귀도
    "에픽":   "#fcc419",
    "유니크": "#ff80ab",
    "레어":   "#b197fc",
    "언커먼": "#4dabf7",
    "커먼":   "#888",
    "티어":   "#ffffff",
    // 시스템 메시지
    "선봉":                  "#ff5252",
    "의지":                  "#448aff",
    "이상":                  "#40c057",
    "데이터 초기화됨":        "#ff5252",
    "새로운 설정으로 변경됨": "#40c057",
    // 방어구 접두어
    "전격": "#fcc419", "허상": "#fcc419", "작열": "#fcc419", "침식": "#fcc419",
    "수호": "#fcc419", "왜곡": "#fcc419", "자상": "#fcc419", "맹독": "#fcc419",
    "보호": "#fcc419", "쇄도": "#fcc419", "신속": "#fcc419", "연격": "#fcc419",
    // 악세 접두어
    "견고": "#fcc419", "혈독": "#fcc419", "초석": "#fcc419",
    "각오": "#fcc419", "가속": "#fcc419", "조화": "#fcc419",
    // 특수장비 접두어
    "불굴": "#fcc419", "숙련": "#fcc419", "결의": "#fcc419",
    "격변": "#fcc419", "촉진": "#fcc419", "질주": "#fcc419"
};

// 무기 접두어 (project2 전용이지만 색상 정보 포함)
const WEAPON_PREFIXES = [
    { tag: "[광채]", color: "#3399cc" },
    { tag: "[분쇄]", color: "#ff4d4f" },
    { tag: "[선명]", color: "#25c2a0" },
    { tag: "[강타]", color: "#ffd700" }
];


/* ============================================================
   [섹션 5] project1 전용 상수
   - 룬, 엠블렘, 아티팩트 등 project2에는 없는 항목
   ============================================================ */

const SHARED_RUNE_NAMES = [
    "", "각성", "가호", "왜곡", "지혜", "수호", "보호", "가속", "겁화", "혹한",
    "섬광", "암격", "숙련", "회복", "명상", "파멸", "허상", "마력", "불굴", "재물",
    "기교", "귀백", "혼백", "견고", "생존", "작열", "맹독", "자상", "전격", "모독",
    "기만", "경화", "속박", "나태", "칠흑", "몽환", "충격", "결빙", "미지"
];
const SHARED_RUNE_LEVELS      = ["", "I", "II", "III", "IV"];
const SHARED_RUNE_SKILL_LEVELS = ["", "0", "15", "20", "25", "30", "35", "40", "45", "50", "55", "60", "65"];
const SHARED_NO_SKILL_LV_RUNES = ["가호", "왜곡", "수호", "보호", "귀백", "혼백"];

const SHARED_ELEMENT_EMB_LIST = ["", "모속강", "화속강", "수속강", "명속강", "암속강", "힘", "지능"];

const SHARED_ART_OPTIONS = {
    red:   ["힘", "지능", "체력", "정신력", "적중", "회피"],
    blue:  ["HP MAX", "MP MAX", "물리 공격력", "마법 공격력", "물리 방어력", "마법 방어력"],
    green: ["물리 크리티컬", "마법 크리티컬", "공격속도", "캐스팅속도", "이동속도",
        "화속강", "수속강", "명속강", "암속강", "모속강"]
};


/* ============================================================
   [섹션 6] 스토리지 키 (충돌 방지)
   ============================================================ */

const STORAGE_KEYS = {
    UNIFIED:  "dnfm_unified",                   // 통합 키 (현재 사용)
    PROJECT1: "dnfm_character_equipment_data",  // project1 구버전 (마이그레이션용)
    PROJECT2: "dnfm_eq"                         // project2 구버전 (마이그레이션용)
};


/* ============================================================
   [섹션 7] 하위 호환 별칭
   - 기존 project1 코드가 AppConstants.* 로 참조하는 경우 대비
   - 기존 project2 코드가 직접 변수명으로 참조하는 경우 대비
   ============================================================ */

// project1: AppConstants 호환
const AppConstants = {
    STORAGE_KEY:        STORAGE_KEYS.UNIFIED,
    SLOTS:              SHARED_SLOTS,
    HEAVY_BORDER_SLOTS: SHARED_HEAVY_BORDER_SLOTS,
    ARMOR_PREFIXES:     SHARED_ARMOR_PREFIXES,
    TIER_PREFIXES:      SHARED_TIER_PREFIXES,
    ACC_PREFIXES:       SHARED_ACC_PREFIXES,
    SPEC_PREFIXES:      SHARED_SPEC_PREFIXES,
    RUNE_NAMES:         SHARED_RUNE_NAMES,
    RUNE_LEVELS:        SHARED_RUNE_LEVELS,
    RUNE_SKILL_LEVELS:  SHARED_RUNE_SKILL_LEVELS,
    NO_SKILL_LV_RUNES:  SHARED_NO_SKILL_LV_RUNES,
    ELEMENT_EMB_LIST:   SHARED_ELEMENT_EMB_LIST,
    ART_OPTIONS:        SHARED_ART_OPTIONS,
    RARITY_COLORS:      SHARED_RARITY_COLORS
};

// project1 전역 별칭 (기존 constants.js 별칭 유지)
const slots              = AppConstants.SLOTS;
const heavyBorderSlots   = AppConstants.HEAVY_BORDER_SLOTS;
const armorPrefixes      = AppConstants.ARMOR_PREFIXES;
const tierPrefixes       = AppConstants.TIER_PREFIXES;
const accPrefixes        = AppConstants.ACC_PREFIXES;
const specPrefixes       = AppConstants.SPEC_PREFIXES;
const runeNames          = AppConstants.RUNE_NAMES;
const runeLevels         = AppConstants.RUNE_LEVELS;
const runeSkillLevels    = AppConstants.RUNE_SKILL_LEVELS;
const noSkillLvRunes     = AppConstants.NO_SKILL_LV_RUNES;
const elementEmbList     = AppConstants.ELEMENT_EMB_LIST;
const artOptions         = AppConstants.ART_OPTIONS;
const rarityColors       = AppConstants.RARITY_COLORS;

// project2 SlotUtils 호환 (utils.js 의 SlotUtils 는 그대로 유지하되, 데이터는 여기서 참조)
// → 실제 SlotUtils 객체는 utils.js 에 남겨두고 SLOT_TYPES 를 공유 소스로 사용