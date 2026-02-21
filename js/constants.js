// ============================================
// constants.js - 상수 정의
// ============================================

const AppConstants = {
    // 스토리지 키
    STORAGE_KEY: 'dnfm_character_equipment_data',

    // 슬롯 정의
    SLOTS: ["무기", "상의", "어깨", "하의", "신발", "벨트", "목걸이", "팔찌", "반지", "보조장비", "귀걸이", "마법석", "칭호", "외형칭호", "오라", "아바타", "스킬룬", "크리쳐"],
    HEAVY_BORDER_SLOTS: ["무기", "벨트", "반지", "마법석", "아바타", "스킬룬", "크리쳐"],

    // 접두어
    ARMOR_PREFIXES: ["", "전격", "허상", "작열", "침식", "수호", "왜곡", "자상", "맹독", "보호", "쇄도", "신속", "연격"],
    TIER_PREFIXES: ["", "T1", "T2", "T3", "T4", "T5", "T6", "T7"],
    ACC_PREFIXES: ["", "견고", "혈독", "초석", "각오", "가속", "조화"],
    SPEC_PREFIXES: ["", "불굴", "숙련", "결의", "격변", "촉진", "질주"],

    // 룬
    RUNE_NAMES: ["", "각성", "가호", "왜곡", "지혜", "수호", "보호", "가속", "겁화", "혹한", "섬광", "암격", "숙련", "회복", "명상", "파멸", "허상", "마력", "불굴", "재물", "기교", "귀백", "혼백", "견고", "생존", "작열", "맹독", "자상", "전격", "모독", "기만", "경화", "속박", "나태", "칠흑", "몽환", "충격", "결빙", "미지"],
    RUNE_LEVELS: ["", "I", "II", "III", "IV"],
    RUNE_SKILL_LEVELS: ["", "0", "15", "20", "25", "30", "35", "40", "45", "50", "55", "60", "65"],
    NO_SKILL_LV_RUNES: ["가호", "왜곡", "수호", "보호", "귀백", "혼백"],

    // 엠블렘
    ELEMENT_EMB_LIST: ["", "모속강", "화속강", "수속강", "명속강", "암속강", "힘", "지능"],

    // 아티팩트 옵션
    ART_OPTIONS: {
        red: ["힘", "지능", "체력", "정신력", "적중", "회피"],
        blue: ["HP MAX", "MP MAX", "물리 공격력", "마법 공격력", "물리 방어력", "마법 방어력"],
        green: ["물리 크리티컬", "마법 크리티컬", "공격속도", "캐스팅속도", "이동속도", "화속강", "수속강", "명속강", "암속강", "모속강"]
    },

    // 희귀도 색상
    RARITY_COLORS: {
        "에픽": "#fcc419", "유니크": "#ff80ab", "레어": "#b197fc", "언커먼": "#4dabf7", "커먼": "#888", "티어": "#ffffff",
        "선봉": "#ff5252", "의지": "#448aff", "이상": "#40c057", "데이터 초기화됨": "#ff5252", "새로운 설정으로 변경됨": "#40c057",
        "전격": "#fcc419", "허상": "#fcc419", "작열": "#fcc419", "침식": "#fcc419",
        "수호": "#fcc419", "왜곡": "#fcc419", "자상": "#fcc419", "맹독": "#fcc419",
        "보호": "#fcc419", "쇄도": "#fcc419", "신속": "#fcc419", "연격": "#fcc419",
        "견고": "#fcc419", "혈독": "#fcc419", "초석": "#fcc419", "각오": "#fcc419", "가속": "#fcc419", "조화": "#fcc419",
        "불굴": "#fcc419", "숙련": "#fcc419", "결의": "#fcc419", "격변": "#fcc419", "촉진": "#fcc419", "질주": "#fcc419"
    }
};

// 읽기 전용 별칭 (전역 오염 방지를 위해 const 사용)
// 원본: AppConstants.*
const slots = AppConstants.SLOTS;
const heavyBorderSlots = AppConstants.HEAVY_BORDER_SLOTS;
const armorPrefixes  = AppConstants.ARMOR_PREFIXES;
const tierPrefixes = AppConstants.TIER_PREFIXES;
const accPrefixes = AppConstants.ACC_PREFIXES;
const specPrefixes = AppConstants.SPEC_PREFIXES;
const runeNames = AppConstants.RUNE_NAMES;
const runeLevels = AppConstants.RUNE_LEVELS;
const runeSkillLevels = AppConstants.RUNE_SKILL_LEVELS;
const noSkillLvRunes = AppConstants.NO_SKILL_LV_RUNES;
const elementEmbList = AppConstants.ELEMENT_EMB_LIST;
const artOptions = AppConstants.ART_OPTIONS;
const rarityColors = AppConstants.RARITY_COLORS;