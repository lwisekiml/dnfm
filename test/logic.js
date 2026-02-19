/**
 * ============================================================
 * logic.js — DNF Mobile 장비 관리 순수 로직 모듈
 * ============================================================
 *
 * 역할:
 *   원본 index_legacy_prefix.html 의 <script> 블록에서
 *   DOM(화면 조작)을 건드리지 않는 순수 계산 로직만 뽑아낸 파일.
 *
 * 왜 따로 빼냐?
 *   원본 HTML 안의 함수들은 document.getElementById() 같은
 *   브라우저 전용 API를 써서 Node.js 환경에서 직접 import 하면
 *   에러가 난다. 그래서 DOM 없이도 돌아가는 함수들만 이 파일에
 *   모아두고, 테스트는 이 파일만 대상으로 한다.
 *
 * 사용법:
 *   import { makePrefixKey, calcTotalDistinctParts } from './logic.js';
 *
 * 주의:
 *   package.json 에 "type": "module" 이 있어야 import/export 문법이
 *   Node.js 에서 동작한다.
 * ============================================================
 */


// ============================================================
// 1. 세트 데이터 상수
//    장비 세트 이름 → 슬롯 목록 매핑
//    예: "어느 말괄량이의 탐사복" → ["상의","하의","어깨","벨트","신발"]
// ============================================================

// 방어구 세트: 상의/하의/어깨/벨트/신발 5슬롯
const ARMOR_SETS = {
    "어느 말괄량이의 탐사복":  ["상의","하의","어깨","벨트","신발"],
    "포이즈닝 퀸 스파이더":    ["상의","하의","어깨","벨트","신발"],
    "거인의 스펙쿨룸 아이언":  ["상의","하의","어깨","벨트","신발"],
    "어둠을 쏘아 내리는 자":  ["상의","하의","어깨","벨트","신발"],
    "수호자의 초합금":         ["상의","하의","어깨","벨트","신발"],
    "스틱키 애시드 웨펀":      ["상의","하의","어깨","벨트","신발"],
    "섬뜩한 강철 용":          ["상의","하의","어깨","벨트","신발"],
    "익스플로시브 버닝 스톤":  ["상의","하의","어깨","벨트","신발"],
    "빛의 헌신자":             ["상의","하의","어깨","벨트","신발"],
    "여명을 쏘아 올리는 자":  ["상의","하의","어깨","벨트","신발"],
    "콰트로 카시테움":         ["상의","하의","어깨","벨트","신발"],
    "그란테 전투기갑 파츠":   ["상의","하의","어깨","벨트","신발"],
    // 레거시 방어구 세트 — 슬롯 구성은 동일하지만 접두어/키 처리가 다름
    "레거시: 마력의 소용돌이": ["상의","하의","어깨","벨트","신발"],
    "레거시: 자연의 수호자":   ["상의","하의","어깨","벨트","신발"],
};

// 방어구 접두어: 세트명 → 가능한 접두어 목록
// 일반 세트는 ["전격","허상"] 같은 2가지, 레거시는 ["레거시"] 1가지만 있음
const ARMOR_PREFIX = {
    "어느 말괄량이의 탐사복":  ["전격","허상"],
    "포이즈닝 퀸 스파이더":    ["작열","침식"],
    "거인의 스펙쿨룸 아이언":  ["수호","왜곡"],
    "어둠을 쏘아 내리는 자":  ["자상","맹독"],
    "수호자의 초합금":         ["허상","보호"],
    "스틱키 애시드 웨펀":      ["맹독","왜곡"],
    "섬뜩한 강철 용":          ["쇄도","침식"],
    "익스플로시브 버닝 스톤":  ["신속","연격"],
    "빛의 헌신자":             ["수호","연격"],
    "여명을 쏘아 올리는 자":  ["자상","쇄도"],
    "콰트로 카시테움":         ["작열","보호"],
    "그란테 전투기갑 파츠":   ["신속","전격"],
    // 레거시 세트: 접두어가 "레거시" 하나뿐
    "레거시: 마력의 소용돌이": ["레거시"],
    "레거시: 자연의 수호자":   ["레거시"],
};

// 레거시 리팩터링 이전에 사용하던 "익시드 전용 세트" 목록.
// 현재는 레거시 세트가 접두어 방식으로 바뀌어서 빈 배열.
// 빈 배열인지 테스트로 검증해서 리팩터링이 정상 적용됐음을 확인한다.
const ARMOR_EXCEED_ONLY = [];

// 악세서리 세트: 팔찌/목걸이/반지 3슬롯
const ACCESSORY_SETS = {
    "엘팅 메모리얼의 기억":       ["팔찌","목걸이","반지"],
    "섬뜩한 빛의 관리자":         ["팔찌","목걸이","반지"],
    "부식된 메탈기어":            ["팔찌","목걸이","반지"],
    "화력 개조 탄띠":             ["팔찌","목걸이","반지"],
    "신비로운 빛의 소용돌이":     ["팔찌","목걸이","반지"],
    "콰트로 마누스 연산장치":     ["팔찌","목걸이","반지"],
    // 레거시 악세서리 세트
    "레거시: 에테리얼 리베넌트":  ["팔찌","목걸이","반지"],
    "레거시: 지나온 영광의 시대": ["팔찌","목걸이","반지"],
};

const ACCESSORY_PREFIX = {
    "엘팅 메모리얼의 기억":       ["견고","혈독"],
    "섬뜩한 빛의 관리자":         ["초석","각오"],
    "부식된 메탈기어":            ["각오","가속"],
    "화력 개조 탄띠":             ["혈독","견고"],
    "신비로운 빛의 소용돌이":     ["조화","초석"],
    "콰트로 마누스 연산장치":     ["가속","조화"],
    "레거시: 에테리얼 리베넌트":  ["레거시"],
    "레거시: 지나온 영광의 시대": ["레거시"],
};

const ACCESSORY_EXCEED_ONLY = []; // ARMOR_EXCEED_ONLY 와 동일한 이유로 빈 배열

// 특수장비 세트: 귀걸이/마법석/보장 3슬롯
const SPECIAL_SETS = {
    "개구쟁이 호문쿨루스":        ["귀걸이","마법석","보장"],
    "라이트닝 에너지 코어":       ["귀걸이","마법석","보장"],
    "철갑을 두른 탑의 수호꾼":   ["귀걸이","마법석","보장"],
    "깊은 불구덩이의 섬멸자":    ["귀걸이","마법석","보장"],
    "허영 속 어둠의 피조물":     ["귀걸이","마법석","보장"],
    "부정한 빛의 우상":           ["귀걸이","마법석","보장"],
};

const SPECIAL_PREFIX = {
    "개구쟁이 호문쿨루스":        ["불굴","숙련"],
    "라이트닝 에너지 코어":       ["숙련","결의"],
    "철갑을 두른 탑의 수호꾼":   ["격변","촉진"],
    "깊은 불구덩이의 섬멸자":    ["불굴","촉진"],
    "허영 속 어둠의 피조물":     ["질주","결의"],
    "부정한 빛의 우상":           ["질주","격변"],
};

// 세 카테고리를 하나로 합친 편의용 상수.
// 스프레드 연산자(...)로 객체 키를 모두 합침.
// 함수에서 카테고리 구분 없이 세트 검색할 때 사용.
const ALL_SETS    = { ...ARMOR_SETS,   ...ACCESSORY_SETS,   ...SPECIAL_SETS };
const ALL_PREFIX  = { ...ARMOR_PREFIX, ...ACCESSORY_PREFIX, ...SPECIAL_PREFIX };


// ============================================================
// 2. 레거시 & 익시드 관련 상수
// ============================================================

/**
 * 레거시 세트 이름 목록.
 *
 * 왜 필요한가?
 *   일반 세트의 접두어 키는 "접두어: 세트명" 형태로 만든다.
 *   예) makePrefixKey("전격", "말괄량이") → "전격: 말괄량이"
 *
 *   그런데 레거시 세트는 세트명 자체가 이미 "레거시: XXX" 형태라서
 *   같은 방식으로 만들면 "레거시: 레거시: XXX" 가 되어버린다. (버그)
 *
 *   그래서 이 목록에 있는 세트는 키 생성 시 세트명을 그대로 사용한다.
 */
const LEGACY_PREFIX_SETS = [
    "레거시: 마력의 소용돌이",
    "레거시: 자연의 수호자",
    "레거시: 에테리얼 리베넌트",
    "레거시: 지나온 영광의 시대",
];

// 익시드 태그 종류: 아이템명 앞에 "[선봉]", "[의지]", "[이상]" 형태로 붙음
const EXCEED_TAGS  = ["선봉", "의지", "이상"];

// 익시드 아이템이 존재하는 슬롯.
// 방어구는 상의, 악세는 팔찌, 특수는 귀걸이만 익시드 버전이 있음.
// 나머지 슬롯(예: 하의, 목걸이)에는 익시드가 없으므로 카운트에서 제외해야 함.
const EXCEED_SLOTS = { ARMOR: ["상의"], ACCESSORY: ["팔찌"], SPECIAL: ["귀걸이"] };


// ============================================================
// 3. 순수 로직 함수들
// ============================================================

/**
 * 접두어 키 생성
 *
 * 아이템을 저장할 때 쓰는 키(문자열)를 만드는 함수.
 *
 * 일반 세트:  "전격: 어느 말괄량이의 탐사복 상의" 처럼
 *             "접두어: 세트명 슬롯" 형태로 저장됨.
 *             이 함수는 "접두어: 세트명" 부분(슬롯 제외)을 만든다.
 *
 * 레거시 세트: 세트명이 이미 "레거시: XXX" 형태이므로
 *             앞에 "레거시: "를 또 붙이면 "레거시: 레거시: XXX" 가 됨.
 *             그래서 레거시 세트는 세트명 자체를 그대로 반환.
 *
 * @param {string} pref    - 접두어 이름 (예: "전격", "레거시")
 * @param {string} setName - 세트 이름 (예: "어느 말괄량이의 탐사복")
 * @returns {string} 키 문자열
 *
 * 예시:
 *   makePrefixKey("전격", "어느 말괄량이의 탐사복")   → "전격: 어느 말괄량이의 탐사복"
 *   makePrefixKey("레거시", "레거시: 마력의 소용돌이") → "레거시: 마력의 소용돌이"  (중복 방지)
 */
function makePrefixKey(pref, setName) {
    // 레거시 세트면 setName 자체가 이미 올바른 키 → 그대로 반환
    if (LEGACY_PREFIX_SETS.includes(setName)) return setName;
    // 일반 세트: "접두어: 세트명" 형태로 조합
    return `${pref}: ${setName}`;
}

/**
 * 익시드 아이템 여부 판별
 *
 * 아이템 키 문자열이 익시드 형태("[선봉] ...", "[의지] ...", "[이상] ...")인지 검사.
 * 정규식으로 문자열 시작 부분을 검사한다.
 *
 * @param {string} name - 아이템 키 문자열
 * @returns {boolean}
 *
 * 예시:
 *   isExceedName("[선봉] 레거시: 마력의 소용돌이 상의") → true
 *   isExceedName("레거시: 마력의 소용돌이 상의")        → false
 *   isExceedName("[선봉]레거시: 마력의 소용돌이 상의")  → false  (괄호 뒤 공백 필수)
 */
function isExceedName(name) {
    // ^ : 문자열 시작
    // \[ : 여는 괄호 (특수문자라 백슬래시 필요)
    // (선봉|의지|이상) : 세 태그 중 하나
    // \] : 닫는 괄호
    // \s : 공백 한 칸 (공백 없으면 불일치)
    return /^\[(선봉|의지|이상)\]\s/.test(name);
}

/**
 * 익시드 태그 제거 → 베이스 키 반환
 *
 * "[선봉] 레거시: 마력의 소용돌이 상의" 에서 "[선봉] " 부분을 제거해
 * "레거시: 마력의 소용돌이 상의" 를 돌려준다.
 * 익시드가 아닌 문자열은 그대로 반환.
 *
 * @param {string} name - 아이템 키 문자열
 * @returns {string}
 */
function getGroupKey(name) {
    // /^\[.*?\]\s*/ : 문자열 시작의 "[...]" 과 뒤따르는 공백을 빈 문자열로 치환
    // .*? : 최소 일치 (탐욕적이지 않음, 첫 번째 ']' 에서 멈춤)
    return name.replace(/^\[.*?\]\s*/, "");
}

/**
 * 세트 타입 판별 (ARMOR / ACCESSORY / SPECIAL)
 *
 * 세트 이름을 받아서 어느 카테고리인지 반환.
 * 판별 순서:
 *   1. 세트명으로 직접 ARMOR_SETS / ACCESSORY_SETS / SPECIAL_SETS 검색
 *   2. 없으면 "접두어: 세트명" 에서 세트명 부분만 추출해 재검색
 *   3. 그래도 없으면 LEGACY_PREFIX_SETS 순회로 검색
 *   4. 최후에도 없으면 기본값 "ARMOR" 반환
 *
 * @param {string} setName
 * @returns {"ARMOR"|"ACCESSORY"|"SPECIAL"}
 */
function getSetType(setName) {
    // 1단계: 세트명 직접 검색
    if (ARMOR_SETS[setName])     return "ARMOR";
    if (ACCESSORY_SETS[setName]) return "ACCESSORY";
    if (SPECIAL_SETS[setName])   return "SPECIAL";

    // 2단계: "전격: 말괄량이" 형태면 ":" 뒤를 잘라서 재검색
    const baseName = setName.includes(':') ? setName.split(':').pop().trim() : setName;
    if (ARMOR_SETS[baseName])     return "ARMOR";
    if (ACCESSORY_SETS[baseName]) return "ACCESSORY";
    if (SPECIAL_SETS[baseName])   return "SPECIAL";

    // 3단계: 레거시 세트 순회
    for (const legacyName of LEGACY_PREFIX_SETS) {
        if (setName === legacyName || setName.endsWith(legacyName)) {
            if (ARMOR_SETS[legacyName])     return "ARMOR";
            if (ACCESSORY_SETS[legacyName]) return "ACCESSORY";
        }
    }

    return "ARMOR"; // 기본값 (알 수 없는 세트)
}

/**
 * 캐릭터가 보유한 세트의 고유 파츠 수 계산
 *
 * "고유 파츠"란: 같은 슬롯(예: 상의)이면 일반/접두어/익시드 중
 * 어떤 종류를 보유했든 딱 1개로 카운트한다.
 * 즉 상의를 일반+전격 2개 보유해도 상의 슬롯은 1개.
 *
 * 로직:
 *   1. 세트의 슬롯 목록을 가져옴 (예: ["상의","하의","어깨","벨트","신발"])
 *   2. 검색할 이름 목록 생성:
 *      - 일반 세트: 세트명 자체 추가
 *      - 레거시 세트: 일반 행이 없으므로 세트명은 추가 안 함
 *      - 접두어별로 makePrefixKey 로 키 생성 후 추가
 *      - 각 접두어 키에 익시드 태그 조합해서도 추가
 *   3. 슬롯별로 위 이름 목록 중 하나라도 count > 0 이면 해당 슬롯 보유로 판정
 *   4. 보유 슬롯 수 합산해서 반환
 *
 * @param {object} char        - 캐릭터 객체 { armorCounts: { "키": 숫자, ... } }
 * @param {string} baseSetName - 세트 기본 이름
 * @returns {number} 보유 중인 고유 슬롯 수
 */
function calcTotalDistinctParts(char, baseSetName) {
    const slots       = ALL_SETS[baseSetName]   || []; // 이 세트의 슬롯 목록
    const prefixes    = ALL_PREFIX[baseSetName] || []; // 이 세트의 접두어 목록
    const setType     = getSetType(baseSetName);
    const exceedSlots = EXCEED_SLOTS[setType]   || []; // 익시드가 존재하는 슬롯

    // 검색할 이름(키 앞부분) 목록 구성
    const namesToSearch = [];

    // 레거시 세트는 일반 행이 없음 → 세트명을 목록에 넣지 않음
    // 일반 세트는 세트명 자체가 하나의 키 prefix 가 됨
    if (!LEGACY_PREFIX_SETS.includes(baseSetName)) {
        namesToSearch.push(baseSetName);
    }

    // 접두어별 키 추가 (예: "전격: 말괄량이", "레거시: 마력의 소용돌이")
    prefixes.forEach(p => {
        const prefKey = makePrefixKey(p, baseSetName);
        namesToSearch.push(prefKey);

        // 각 접두어 키의 익시드 버전도 추가 (예: "[선봉] 전격: 말괄량이")
        EXCEED_TAGS.forEach(ex => namesToSearch.push(`[${ex}] ${prefKey}`));
    });

    let totalDistinct = 0;

    // 슬롯별로 보유 여부 체크
    slots.forEach(slot => {
        let hasPartInSlot = false;

        namesToSearch.forEach(nameComponent => {
            const isExceedKey = nameComponent.startsWith('[');

            // 익시드 키인데 이 슬롯이 익시드 슬롯이 아니면 → 스킵
            // 예: "[선봉] 레거시: 마력의 소용돌이 하의" — 하의는 익시드 슬롯 아님
            if (isExceedKey && !exceedSlots.includes(slot)) return;

            // 실제 저장 키: "이름 슬롯" (예: "레거시: 마력의 소용돌이 상의")
            const fullKey = `${nameComponent} ${slot}`;
            if ((char.armorCounts[fullKey] || 0) > 0) {
                hasPartInSlot = true;
            }
        });

        if (hasPartInSlot) totalDistinct++;
    });

    return totalDistinct;
}

/**
 * 아이템 카운트 증가
 * 원본의 increment() 에서 DOM 조작(saveLocalData, showSetButtons 등)을 제거한 순수 버전.
 *
 * @param {object} char - 캐릭터 객체
 * @param {string} key  - 아이템 키 (예: "어느 말괄량이의 탐사복 상의")
 */
function incrementCount(char, key) {
    // 키가 없으면 0으로 시작해서 +1
    char.armorCounts[key] = (char.armorCounts[key] || 0) + 1;
}

/**
 * 아이템 카운트 감소 (0 미만 방지)
 *
 * @param {object} char - 캐릭터 객체
 * @param {string} key  - 아이템 키
 */
function decrementCount(char, key) {
    const cur = char.armorCounts[key] || 0;
    // Math.max(0, ...) 로 음수 방지
    char.armorCounts[key] = Math.max(0, cur - 1);
}

/**
 * 캐릭터 이름순 정렬
 * 원본 배열을 변경하지 않고 새 배열을 반환한다. ([...characters] 로 복사)
 * localeCompare('ko-KR') 로 한국어 가나다순 정렬.
 *
 * @param {Array} characters - 캐릭터 배열
 * @returns {Array} 정렬된 새 배열
 */
function sortByName(characters) {
    return [...characters].sort((a, b) => a.name.localeCompare(b.name, 'ko-KR'));
}

/**
 * 캐릭터 직업순 정렬 (같은 직업 내에서는 이름순)
 *
 * @param {Array} characters
 * @returns {Array} 정렬된 새 배열
 */
function sortByJob(characters) {
    return [...characters].sort((a, b) => {
        const jobCompare = a.job.localeCompare(b.job, 'ko-KR');
        if (jobCompare !== 0) return jobCompare; // 직업이 다르면 직업순
        return a.name.localeCompare(b.name, 'ko-KR'); // 직업 같으면 이름순
    });
}

/**
 * 세트 완성도 판별 (3셋 / 5셋)
 *
 * 보유 파츠 수가 전체 슬롯의 60% 이상이면 3셋, 100%면 5셋으로 판정.
 * 방어구(5슬롯): 3개 이상 → 3셋, 5개 → 5셋
 * 악세/특수(3슬롯): 2개 이상 → 3셋, 3개 → 5셋
 *
 * @param {number} count   - 보유 파츠 수
 * @param {string} setName - 세트 이름
 * @returns {3|5|null} 완성도 등급, 미달이면 null
 */
function getSetType3or5(count, setName) {
    const slots = ALL_SETS[setName] || [];
    const total = slots.length;
    if (total === 0) return null; // 알 수 없는 세트

    const ratio = count / total;
    if (ratio >= 1.0) return 5; // 100% → 5셋
    if (ratio >= 0.6) return 3; // 60% 이상 → 3셋
    return null;
}


// ============================================================
// 4. export
//    이 파일을 import 하는 쪽(logic.test.js)에서
//    필요한 상수와 함수를 꺼내 쓸 수 있도록 내보낸다.
//    export 가 없으면 import 해도 undefined 가 된다.
// ============================================================
export {
    // 상수
    ARMOR_SETS, ACCESSORY_SETS, SPECIAL_SETS, ALL_SETS,
    ARMOR_PREFIX, ACCESSORY_PREFIX, SPECIAL_PREFIX, ALL_PREFIX,
    ARMOR_EXCEED_ONLY, ACCESSORY_EXCEED_ONLY,
    LEGACY_PREFIX_SETS, EXCEED_TAGS, EXCEED_SLOTS,
    // 함수
    makePrefixKey, isExceedName, getGroupKey, getSetType,
    calcTotalDistinctParts, incrementCount, decrementCount,
    sortByName, sortByJob, getSetType3or5,
};