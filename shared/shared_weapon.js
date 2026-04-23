// ============================================================
// shared_weapon.js - 공유 무기 데이터
// ============================================================
// ※ 이 파일은 project2(eq_index.html)의 무기 데이터를 분리한 파일입니다.
//    추후 project1에서도 무기 정보가 필요할 경우 이 파일을 로드하세요.
// ※ 로드 순서: shared_constants.js 다음에 로드하세요.
// ============================================================

/* ============================================================
   [섹션 1] 직업별 무기 데이터
   구조: { 무기종류: [대서사, 에픽1, 에픽2] }
   ============================================================ */

const WEAPON_DATA_SLAYER = {
    "소검": ["대서사의 탄생 - 소검", "암흑의 별",       "왕위 계승자"],
    "도":   ["대서사의 탄생 - 도",   "요도 : 무라마사", "트리니티 이터니아"],
    "둔기": ["대서사의 탄생 - 둔기", "세계의 무게추",   "신검의 나뭇가지"],
    "대검": ["대서사의 탄생 - 대검", "성검 : 엑스칼리버", "데빌 오브 플레어"],
    "광검": ["대서사의 탄생 - 광검", "아마 겟 돈",      "뇌검 : 고룬"]
};

const WEAPON_DATA_FIGHTER = {
    "너클":     ["대서사의 탄생 - 너클",     "라오 데솔",         "베르세르크"],
    "건틀릿":   ["대서사의 탄생 - 건틀릿",   "반격의 서막",       "룰렛러시안"],
    "클로":     ["대서사의 탄생 - 클로",     "흑월랑아",          "악마의 갈퀴 : 이그노어"],
    "권투글러브":["대서사의 탄생 - 권투글러브","티쥬 엠플리파이어", "파울 키드니블로"],
    "통파":     ["대서사의 탄생 - 통파",     "킬 아르니스 협곡",  "습격의 드라우프니르"]
};

const WEAPON_DATA_GUNNER = {
    "리볼버":   ["대서사의 탄생 - 리볼버",   "이스 미 터너",     "실버 불렛"],
    "자동권총": ["대서사의 탄생 - 자동권총", "이온 리필서",      "마이스터의 분노"],
    "머스켓":   ["대서사의 탄생 - 머스켓",   "Code N : 오라클",  "블라인드 스팟"],
    "핸드캐넌": ["대서사의 탄생 - 핸드캐넌", "거포 우르반",      "해를 먹는 자"],
    "보우건":   ["대서사의 탄생 - 보우건",   "데스 리뷰저",      "제너럴 보우건"]
};

const WEAPON_DATA_MAGE = {
    "창":    ["대서사의 탄생 - 창",    "쥬빌런스 혼",           "전장의 여신의 창"],
    "봉":    ["대서사의 탄생 - 봉",    "케세라세라 : 해피 ~!",  "요정왕의 비밀"],
    "로드":  ["대서사의 탄생 - 로드",  "히어로 오브 더 문",     "양치기의 로드"],
    "스태프":["대서사의 탄생 - 스태프","웨리 : 리미트 브레이커","창마화의 연"],
    "빗자루":["대서사의 탄생 - 빗자루","보배 - 파초선",         "스노우 프린세스"]
};

const WEAPON_DATA_PRIEST = {
    "십자가":  ["대서사의 탄생 - 십자가",  "헤이렐 - 교만의 빛",        "저주 받은 십자가 : 토루아"],
    "염주":    ["대서사의 탄생 - 염주",    "음양사천",                   "명인의 수"],
    "토템":    ["대서사의 탄생 - 토템",    "씰 더 리바이어던",           "풍운뇌우"],
    "낫":      ["대서사의 탄생 - 낫",      "소울 디바우링",              "선고 : 사신의 낫"],
    "배틀엑스":["대서사의 탄생 - 배틀엑스","행성파괴자",                 "오만의 끝"]
};

const WEAPON_DATA_WARRIOR = {
    "락소드":   ["대서사의 탄생 - 락소드",   "우주적 기운의 락소드", "라이프 파인더"],
    "윙블레이드":["대서사의 탄생 - 윙블레이드","프로스트 윙 블레이드","코카트리스"]
};

const WEAPON_DATA_LANCER = {
    "미늘창": ["대서사의 탄생 - 미늘창", "크림슨 로드",       "광염의 극"],
    "투창":   ["대서사의 탄생 - 투창",   "헬 오브 데빌로드",  "미라클 런치"]
};

const WEAPON_DATA_THIEF = {
    "단검":     ["대서사의 탄생 - 단검",     "실버 스피릿",   "월광검"],
    "쌍검":     ["대서사의 탄생 - 쌍검",     "흑미쌍검",      "히게-히자키리"],
    "차크라웨펀":["대서사의 탄생 - 차크라웨펀","크리드 오브 닌자","무염화"]
};


/* ============================================================
   [섹션 2] 직업 매핑 및 목록
   ============================================================ */

const WEAPON_DATA_MAP = {
    "귀검사":    WEAPON_DATA_SLAYER,
    "격투가":    WEAPON_DATA_FIGHTER,
    "거너":      WEAPON_DATA_GUNNER,
    "마법사":    WEAPON_DATA_MAGE,
    "프리스트":  WEAPON_DATA_PRIEST,
    "워리어":    WEAPON_DATA_WARRIOR,
    "마창사":    WEAPON_DATA_LANCER,
    "도적":      WEAPON_DATA_THIEF
};

const JOB_LIST = Object.keys(WEAPON_DATA_MAP);

/* ============================================================
   [섹션 3] 직업 선택지 & 무기 헬퍼
   ============================================================ */

const JOB_SELECT_OPTIONS = [
    { value: "귀검사(남)",      type: "base" },
    { value: "",                type: "disabled" },
    { value: "웨펀마스터",      type: "sub" },
    { value: "검성",            type: "sub" },
    { value: "검신",            type: "sub" },
    { value: "",                type: "disabled" },
    { value: "소울브링어",      type: "sub" },
    { value: "소울테이커",      type: "sub" },
    { value: "다크로드",        type: "sub" },
    { value: "",                type: "disabled" },
    { value: "버서커",          type: "sub" },
    { value: "헬벤터",          type: "sub" },
    { value: "블러드 이블",     type: "sub" },
    { value: "",                type: "disabled" },
    { value: "아수라",          type: "sub" },
    { value: "대암흑천",        type: "sub" },
    { value: "인다라천",        type: "sub" },
    { value: "---",             type: "separator" },

    { value: "귀검사(여)",      type: "base" },
    { value: "",                type: "disabled" },
    { value: "소드마스터",      type: "sub" },
    { value: "노블레스",        type: "sub" },
    { value: "마제스티",        type: "sub" },
    { value: "",                type: "disabled" },
    { value: "다크템플러",      type: "sub" },
    { value: "암제",            type: "sub" },
    { value: "네메시스",        type: "sub" },
    { value: "",                type: "disabled" },
    { value: "데몬슬레이어",    type: "sub" },
    { value: "검마",            type: "sub" },
    { value: "디어사이드",      type: "sub" },
    { value: "",                type: "disabled" },
    { value: "베가본드",        type: "sub" },
    { value: "검호",            type: "sub" },
    { value: "검제",            type: "sub" },
    { value: "",                type: "disabled" },
    { value: "블레이드",        type: "sub" },
    { value: "리벨리온",        type: "sub" },
    { value: "벤데타",          type: "sub" },
    { value: "---",             type: "separator" },

    { value: "격투가(여)",          type: "base" },
    { value: "",                type: "disabled" },
    { value: "넨마스터",        type: "sub" },
    { value: "백화요란",        type: "sub" },
    { value: "염제 폐월수화",   type: "sub" },
    { value: "",                type: "disabled" },
    { value: "스트라이커",      type: "sub" },
    { value: "챔피언",          type: "sub" },
    { value: "카이저",          type: "sub" },
    { value: "",                type: "disabled" },
    { value: "스트리트파이터",  type: "sub" },
    { value: "독왕",            type: "sub" },
    { value: "용독문주",        type: "sub" },
    { value: "",                type: "disabled" },
    { value: "그래플러",        type: "sub" },
    { value: "토네이도",        type: "sub" },
    { value: "얼티밋 디바",     type: "sub" },

    { value: "---",             type: "separator" },
    { value: "격투가(남)",          type: "base" },
    { value: "",                type: "disabled" },
    { value: "스트라이커",      type: "sub" },
    { value: "무극",          type: "sub" },
    { value: "패황",          type: "sub" },
    { value: "",                type: "disabled" },
    { value: "스트리트파이터",  type: "sub" },
    { value: "천수나한",            type: "sub" },
    { value: "명왕",        type: "sub" },
    { value: "---",             type: "separator" },

    { value: "거너(남)",        type: "base" },
    { value: "",                type: "disabled" },
    { value: "레인저(남)",      type: "sub" },
    { value: "데스페라도",      type: "sub" },
    { value: "레이븐",          type: "sub" },
    { value: "",                type: "disabled" },
    { value: "런처(남)",        type: "sub" },
    { value: "블래스터",        type: "sub" },
    { value: "디스트로이어",    type: "sub" },
    { value: "",                type: "disabled" },
    { value: "메카닉(남)",      type: "sub" },
    { value: "마이스터",        type: "sub" },
    { value: "프라임",          type: "sub" },
    { value: "",                type: "disabled" },
    { value: "스핏파이어(남)",  type: "sub" },
    { value: "제너럴",          type: "sub" },
    { value: "커맨더",          type: "sub" },
    { value: "---",             type: "separator" },

    { value: "거너(여)",        type: "base" },
    { value: "",                type: "disabled" },
    { value: "레인저(여)",      type: "sub" },
    { value: "블러디아",        type: "sub" },
    { value: "크림슨로제",      type: "sub" },
    { value: "",                type: "disabled" },
    { value: "런처(여)",        type: "sub" },
    { value: "헤비배럴",        type: "sub" },
    { value: "스톰트루퍼",      type: "sub" },
    { value: "",                type: "disabled" },
    { value: "메카닉(여)",      type: "sub" },
    { value: "메탈하트",        type: "sub" },
    { value: "옵티머스",        type: "sub" },
    { value: "",                type: "disabled" },
    { value: "스핏파이어(여)",  type: "sub" },
    { value: "발키리",          type: "sub" },
    { value: "프레이야",        type: "sub" },
    { value: "---",             type: "separator" },

    { value: "마법사(여)",          type: "base" },
    { value: "",                type: "disabled" },
    { value: "엘레멘탈 마스터", type: "sub" },
    { value: "아크메이지",      type: "sub" },
    { value: "오버마인드",      type: "sub" },
    { value: "",                type: "disabled" },
    { value: "배틀메이지",      type: "sub" },
    { value: "벨라트릭스",      type: "sub" },
    { value: "아슈타르테",      type: "sub" },
    { value: "",                type: "disabled" },
    { value: "마도학자",        type: "sub" },
    { value: "트릭스터",        type: "sub" },
    { value: "지니위즈",        type: "sub" },
    { value: "",                type: "disabled" },
    { value: "인챈트리스",      type: "sub" },
    { value: "블랙 메이든",     type: "sub" },
    { value: "헤카테",          type: "sub" },
    { value: "---",             type: "separator" },

    { value: "마법사(남)",          type: "base" },
    { value: "",                type: "disabled" },
    { value: "빙결사", type: "sub" },
    { value: "프로즌하트",      type: "sub" },
    { value: "이터널",      type: "sub" },
    { value: "",                type: "disabled" },
    { value: "스위프트 마스터",      type: "sub" },
    { value: "스톰브링어",      type: "sub" },
    { value: "아이올로스",      type: "sub" },
    { value: "---",             type: "separator" },

    { value: "프리스트(남)",    type: "base" },
    { value: "",                type: "disabled" },
    { value: "크루세이더(남)",  type: "sub" },
    { value: "홀리오더",        type: "sub" },
    { value: "세인트",          type: "sub" },
    { value: "",                type: "disabled" },
    { value: "인파이터(남)",    type: "sub" },
    { value: "갓헤드",          type: "sub" },
    { value: "저스티스",        type: "sub" },
    { value: "---",             type: "separator" },

    { value: "프리스트(여)",    type: "base" },
    { value: "",                type: "disabled" },
    { value: "크루세이더(여)",  type: "sub" },
    { value: "에반젤리스트",    type: "sub" },
    { value: "세라핌",          type: "sub" },
    { value: "",                type: "disabled" },
    { value: "이단심판관",      type: "sub" },
    { value: "헬카이트",        type: "sub" },
    { value: "인페르노",        type: "sub" },
    { value: "",                type: "disabled" },
    { value: "무녀",            type: "sub" },
    { value: "신녀",            type: "sub" },
    { value: "천선낭랑",        type: "sub" },
    { value: "",                type: "disabled" },
    { value: "미스트리스",      type: "sub" },
    { value: "신세이어",        type: "sub" },
    { value: "리디머",          type: "sub" },
    { value: "",                type: "disabled" },
    { value: "인파이터(여)",    type: "sub" },
    { value: "레이징 하트",     type: "sub" },
    { value: "이그제큐터",      type: "sub" },
    { value: "---",             type: "separator" },

    { value: "워리어",          type: "base" },
    { value: "",                type: "disabled" },
    { value: "와일드베인",      type: "sub" },
    { value: "데버스테이터",    type: "sub" },
    { value: "테라 치프",       type: "sub" },
    { value: "",                type: "disabled" },
    { value: "윈드시어",        type: "sub" },
    { value: "마엘스트롬",      type: "sub" },
    { value: "트라이브 윙",     type: "sub" },
    { value: "---",             type: "separator" },

    { value: "도적",            type: "base" },
    { value: "",                type: "disabled" },
    { value: "로그",            type: "sub" },
    { value: "실버문",          type: "sub" },
    { value: "알키오네",        type: "sub" },
    { value: "",                type: "disabled" },
    { value: "쿠노이치",        type: "sub" },
    { value: "이즈나비",        type: "sub" },
    { value: "시라누이",        type: "sub" },
    { value: "---",             type: "separator" },

    { value: "마창사",          type: "base" },
    { value: "",                type: "disabled" },
    { value: "뱅가드",          type: "sub" },
    { value: "레버넌트",        type: "sub" },
    { value: "워로드",          type: "sub" },
    { value: "",                type: "disabled" },
    { value: "다크 랜서",       type: "sub" },
    { value: "렘페이저",        type: "sub" },
    { value: "에레보스",        type: "sub" }
];

// 기본직업명 → WEAPON_DATA_MAP 키
const JOB_TO_WEAPON_KEY = {
    "귀검사(남)":   "귀검사",
    "귀검사(여)":   "귀검사",
    "격투가(여)":       "격투가",
    "격투가(남)":       "격투가",
    "거너(남)":     "거너",
    "거너(여)":     "거너",
    "마법사(여)":       "마법사",
    "마법사(남)":   "마법사",
    "프리스트(남)": "프리스트",
    "프리스트(여)": "프리스트",
    "워리어":       "워리어",
    "도적":         "도적",
    "마창사":       "마창사"
};

// 전직직업 → 기본직업명
const SUBJOB_TO_BASE = {
    // 귀검사(남)
    "웨펀마스터":"귀검사(남)", "검성":"귀검사(남)", "검신":"귀검사(남)",
    "소울브링어":"귀검사(남)", "소울테이커":"귀검사(남)", "다크로드":"귀검사(남)",
    "버서커":"귀검사(남)", "헬벤터":"귀검사(남)", "블러드 이블":"귀검사(남)",
    "아수라":"귀검사(남)", "대암흑천":"귀검사(남)", "인다라천":"귀검사(남)",
    // 귀검사(여)
    "소드마스터":"귀검사(여)", "노블레스":"귀검사(여)", "마제스티":"귀검사(여)",
    "다크템플러":"귀검사(여)", "암제":"귀검사(여)", "네메시스":"귀검사(여)",
    "데몬슬레이어":"귀검사(여)", "검마":"귀검사(여)", "디어사이드":"귀검사(여)",
    "베가본드":"귀검사(여)", "검호":"귀검사(여)", "검제":"귀검사(여)",
    "블레이드":"귀검사(여)", "리벨리온":"귀검사(여)", "벤데타":"귀검사(여)",
    // 격투가(여)
    "넨마스터":"격투가(여)", "백화요란":"격투가(여)", "염제 폐월수화":"격투가(여)",
    "스트라이커":"격투가(여)", "챔피언":"격투가(여)", "카이저":"격투가(여)",
    "스트리트파이터":"격투가(여)", "독왕":"격투가(여)", "용독문주":"격투가(여)",
    "그래플러":"격투가(여)", "토네이도":"격투가(여)", "얼티밋 디바":"격투가(여)",
    // 격투가(남)
    "스트라이커":"격투가(남)", "무극":"격투가(남)", "패황":"격투가(남)",
    "스트리트파이터":"격투가(남)", "천수나한":"격투가(남)", "명왕":"격투가(남)",
    // 거너(남)
    "레인저(남)":"거너(남)", "데스페라도":"거너(남)", "레이븐":"거너(남)",
    "런처(남)":"거너(남)", "블래스터":"거너(남)", "디스트로이어":"거너(남)",
    "메카닉(남)":"거너(남)", "마이스터":"거너(남)", "프라임":"거너(남)",
    "스핏파이어(남)":"거너(남)", "제너럴":"거너(남)", "커맨더":"거너(남)",
    // 거너(여)
    "레인저(여)":"거너(여)", "블러디아":"거너(여)", "크림슨로제":"거너(여)",
    "런처(여)":"거너(여)", "헤비배럴":"거너(여)", "스톰트루퍼":"거너(여)",
    "메카닉(여)":"거너(여)", "메탈하트":"거너(여)", "옵티머스":"거너(여)",
    "스핏파이어(여)":"거너(여)", "발키리":"거너(여)", "프레이야":"거너(여)",
    // 마법사
    "엘레멘탈 마스터":"마법사(여)", "아크메이지":"마법사(여)", "오버마인드":"마법사(여)",
    "배틀메이지":"마법사(여)", "벨라트릭스":"마법사(여)", "아슈타르테":"마법사(여)",
    "마도학자":"마법사(여)", "트릭스터":"마법사(여)", "지니위즈":"마법사(여)",
    "인챈트리스":"마법사(여)", "블랙 메이든":"마법사(여)", "헤카테":"마법사(여)",
    // 마법사(남)
    "빙결사":"마법사(남)", "프로즌하트":"마법사(남)", "이터널":"마법사(남)",
    "스위프트 마스터":"마법사(남)", "스톰브링어":"마법사(남)", "아이올로스":"마법사(남)",
    // 프리스트(남)
    "크루세이더(남)":"프리스트(남)", "홀리오더":"프리스트(남)", "세인트":"프리스트(남)",
    "인파이터(남)":"프리스트(남)", "갓헤드":"프리스트(남)", "저스티스":"프리스트(남)",
    // 프리스트(여)
    "크루세이더(여)":"프리스트(여)", "에반젤리스트":"프리스트(여)", "세라핌":"프리스트(여)",
    "이단심판관":"프리스트(여)", "헬카이트":"프리스트(여)", "인페르노":"프리스트(여)",
    "무녀":"프리스트(여)", "신녀":"프리스트(여)", "천선낭랑":"프리스트(여)",
    "미스트리스":"프리스트(여)", "신세이어":"프리스트(여)", "리디머":"프리스트(여)",
    "인파이터(여)":"프리스트(여)", "레이징 하트":"프리스트(여)", "이그제큐터":"프리스트(여)",
    // 워리어
    "와일드베인":"워리어", "데버스테이터":"워리어", "테라 치프":"워리어",
    "윈드시어":"워리어", "마엘스트롬":"워리어", "트라이브 윙":"워리어",
    // 도적
    "로그":"도적", "실버문":"도적", "알키오네":"도적",
    "쿠노이치":"도적", "이즈나비":"도적", "시라누이":"도적",
    // 마창사
    "뱅가드":"마창사", "레버넌트":"마창사", "워로드":"마창사",
    "다크 랜서":"마창사", "렘페이저":"마창사", "에레보스":"마창사"
};

/**
 * 직업명(기본 또는 전직)으로 무기 데이터 반환
 * @param {string} jobName
 * @returns {Object|null}
 */
function getWeaponDataByJob(jobName) {
    if (!jobName) return null;
    const baseKey = JOB_TO_WEAPON_KEY[jobName];
    if (baseKey) return WEAPON_DATA_MAP[baseKey] || null;
    const base = SUBJOB_TO_BASE[jobName];
    if (base) return WEAPON_DATA_MAP[JOB_TO_WEAPON_KEY[base]] || null;
    return null;
}