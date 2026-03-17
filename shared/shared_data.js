// ============================================================
// shared_data.js - 공유 세트/아이템 데이터
// ============================================================
// ※ 이 파일은 project1(index.html)과 project2(eq_index.html)
//    양쪽에서 공통으로 사용하는 세트/아이템명 데이터를 담습니다.
// ※ 로드 순서: 이 파일을 constants.js/eq_data.js 보다 먼저 로드하세요.
// ============================================================

/* ============================================================
   [섹션 1] 방어구 세트
   - ARMOR_SETS       : 세트명 → 슬롯 배열 (project2 기준)
   - ARMOR_DISPLAY_NAMES : 세트명 → 슬롯 → 실제 아이템명 (project2 기준)
   - ARMOR_PREFIX     : 세트명 → 접두어 배열 (project2 기준)
   ============================================================ */

const ARMOR_SETS = {
    "어느 말괄량이의 탐사복":   ["상의", "하의", "어깨", "벨트", "신발"],
    "포이즈닝 퀸 스파이더":    ["상의", "하의", "어깨", "벨트", "신발"],
    "거인의 스펙쿨룸 아이언":   ["상의", "하의", "어깨", "벨트", "신발"],
    "어둠을 쏘아 내리는 자":   ["상의", "하의", "어깨", "벨트", "신발"],
    "수호자의 초합금":         ["상의", "하의", "어깨", "벨트", "신발"],
    "스틱키 애시드 웨펀":      ["상의", "하의", "어깨", "벨트", "신발"],
    "섬뜩한 강철 용":          ["상의", "하의", "어깨", "벨트", "신발"],
    "익스플로시브 버닝 스톤":   ["상의", "하의", "어깨", "벨트", "신발"],
    "빛의 헌신자":             ["상의", "하의", "어깨", "벨트", "신발"],
    "여명을 쏘아 올리는 자":   ["상의", "하의", "어깨", "벨트", "신발"],
    "콰트로 카시테움":         ["상의", "하의", "어깨", "벨트", "신발"],
    "그란테 전투기갑 파츠":    ["상의", "하의", "어깨", "벨트", "신발"],
    "레거시: 마력의 소용돌이": ["상의", "하의", "어깨", "벨트", "신발"],
    "레거시: 자연의 수호자":   ["상의", "하의", "어깨", "벨트", "신발"]
};

const ARMOR_PREFIX = {
    "어느 말괄량이의 탐사복":   ["전격", "허상"],
    "포이즈닝 퀸 스파이더":    ["작열", "침식"],
    "거인의 스펙쿨룸 아이언":   ["수호", "왜곡"],
    "어둠을 쏘아 내리는 자":   ["자상", "맹독"],
    "수호자의 초합금":         ["허상", "보호"],
    "스틱키 애시드 웨펀":      ["맹독", "왜곡"],
    "섬뜩한 강철 용":          ["쇄도", "침식"],
    "익스플로시브 버닝 스톤":   ["신속", "연격"],
    "빛의 헌신자":             ["수호", "연격"],
    "여명을 쏘아 올리는 자":   ["자상", "쇄도"],
    "콰트로 카시테움":         ["작열", "보호"],
    "그란테 전투기갑 파츠":    ["신속", "전격"],
    "레거시: 마력의 소용돌이": ["레거시"],
    "레거시: 자연의 수호자":   ["레거시"]
};

// 세트별 슬롯별 실제 아이템명
// - 상의처럼 2개 변형이 있는 경우 배열로 표기 [고급, 일반]
// - 나머지 슬롯은 문자열
const ARMOR_DISPLAY_NAMES = {
    "어느 말괄량이의 탐사복": {
        "상의": ["못말리는 말괄량이의 가죽 자켓", "어느 말괄량이의 가죽 자켓"],
        "하의": "어느 말괄량이의 버블 반바지",
        "어깨": "어느 말괄량이의 특수 고글",
        "벨트": "어느 말괄량이의 벨트",
        "신발": "어느 말괄량이의 신발"
    },
    "포이즈닝 퀸 스파이더": {
        "상의": ["엠프리스 스파이더 상의", "퀸 스파이더 상의"],
        "하의": "퀸 스파이더 하의",
        "어깨": "퀸 스파이더 머리",
        "벨트": "퀸 스파이더 벨트 장식",
        "신발": "퀸 스파이더 신발"
    },
    "거인의 스펙쿨룸 아이언": {
        "상의": ["거신의 스펙쿨룸 상의", "거인의 스펙쿨룸 상의"],
        "하의": "거인의 스펙쿨룸 하의",
        "어깨": "거인의 스펙쿨룸 어깨 장식",
        "벨트": "거인의 스펙쿨룸 허리띠",
        "신발": "거인의 스펙쿨룸 신발"
    },
    "어둠을 쏘아 내리는 자": {
        "상의": ["밤을 쏘아 내리는 자의 상의", "어둠을 쏘아 내리는 자의 상의"],
        "하의": "어둠을 쏘아 내리는 자의 하의",
        "어깨": "어둠을 쏘아 내리는 자의 어깨 덧댐",
        "벨트": "어둠을 쏘아 내리는 자의 허리띠",
        "신발": "어둠을 쏘아 내리는 자의 신발"
    },
    "수호자의 초합금": {
        "상의": ["수호군주의 초합금 상의", "수호자의 초합금 상의"],
        "하의": "수호자의 초합금 하의",
        "어깨": "수호자의 초합금 어깨",
        "벨트": "수호자의 초합금 벨트",
        "신발": "수호자의 초합금 신발"
    },
    "스틱키 애시드 웨펀": {
        "상의": ["네트 스파이더 상의", "웹 스파이더의 상의"],
        "하의": "웹 스파이더의 하의",
        "어깨": "웹 스파이더의 어깨",
        "벨트": "웹 스파이더의 허리",
        "신발": "웹 스파이더의 신발"
    },
    "섬뜩한 강철 용": {
        "상의": ["강철 용의 스케일 재킷", "강철 용의 가죽 재킷"],
        "하의": "강철 용의 가죽 그리브",
        "어깨": "강철 용의 뿔 장식",
        "벨트": "강철 용의 휴대용 벨트",
        "신발": "강철 용의 가죽 신발"
    },
    "익스플로시브 버닝 스톤": {
        "상의": ["블레이징 기어 플레이트 메일", "버닝 기어 플레이트 메일"],
        "하의": "버닝 기어 플레이트 레깅스",
        "어깨": "버닝 기어 플레이트 햇",
        "벨트": "버닝 기어 플레이트 코일",
        "신발": "버닝 기어 플레이트 사바톤"
    },
    "빛의 헌신자": {
        "상의": ["빛의 수호자의 상의", "빛의 헌신자의 상의"],
        "하의": "빛의 헌신자의 하의",
        "어깨": "빛의 헌신자의 모자",
        "벨트": "빛의 헌신자의 허리장식",
        "신발": "빛의 헌신자의 신발"
    },
    "여명을 쏘아 올리는 자": {
        "상의": ["여명을 밝힌 자의 상의", "여명을 쏘아 올리는 자의 상의"],
        "하의": "여명을 쏘아 올리는 자의 바지",
        "어깨": "여명을 쏘아 올리는 자의 어깨 덧댐",
        "벨트": "여명을 쏘아 올리는 자의 허리띠",
        "신발": "여명을 쏘아 올리는 자의 신발"
    },
    "콰트로 카시테움": {
        "상의": ["콰트로 카시테움 아머Mk2", "콰트로 카시테움 아머"],
        "하의": "콰트로 카시테움 각반",
        "어깨": "콰트로 카시테움 새로운 손",
        "벨트": "콰트로 카시테움 코일",
        "신발": "콰트로 카시테움 그리브"
    },
    "그란테 전투기갑 파츠": {
        "상의": ["그런데 마누스 전투기갑 상의", "그란데 전투기갑 상의"],
        "하의": "그란데 전투기갑 하의",
        "어깨": "그란데 전투기갑 헤드기어",
        "벨트": "그란데 전투기갑 허리",
        "신발": "그란데 전투기갑 신발"
    },
    "레거시: 마력의 소용돌이": {
        "상의": ["휘몰아치는 마력의 태풍", "마력의 폭풍우"],
        "하의": "영력의 회오리",
        "어깨": "마법의 대격변",
        "벨트": "마나의 소용돌이",
        "신발": "정수의 태풍"
    },
    "레거시: 자연의 수호자": {
        "상의": ["루미너스 오토 상의", "라이트니스 오토 상의"],
        "하의": "파이어니스 오토 하의",
        "어깨": "블랙니스 오토 어깨",
        "벨트": "아이니스 오토 벨트",
        "신발": "윈드니스 오토 신발"
    }
};

// ※ project1 호환용: armorSets (세트명 → 아이템명 전체 배열)
// ARMOR_DISPLAY_NAMES 에서 자동 생성
const armorSets = (() => {
    const result = {};
    Object.entries(ARMOR_DISPLAY_NAMES).forEach(([setName, slotMap]) => {
        const items = [];
        Object.values(slotMap).forEach(v => {
            if (Array.isArray(v)) items.push(...v);
            else items.push(v);
        });
        result[setName] = items;
    });
    return result;
})();

// ※ project1 호환용: ARMOR_ITEM_INFO
// 아이템이름 → { setName, prefixes, isExceed } 역방향 맵
// 상의 배열에서 index 0 = 익시드 아이템, index 1 = 일반 아이템
const ARMOR_ITEM_INFO = (() => {
    const result = {};
    Object.entries(ARMOR_DISPLAY_NAMES).forEach(([setName, slotMap]) => {
        const prefixes = ARMOR_PREFIX[setName] || [];
        Object.entries(slotMap).forEach(([slot, val]) => {
            if (Array.isArray(val)) {
                val.forEach((itemName, idx) => {
                    if (itemName) result[itemName] = { setName, prefixes, isExceed: idx === 0 };
                });
            } else {
                if (val) result[val] = { setName, prefixes, isExceed: false };
            }
        });
    });
    return result;
})();


/* ============================================================
   [섹션 2] 악세서리 세트
   ============================================================ */

const ACCESSORY_SETS = {
    "엘팅 메모리얼의 기억":    ["팔찌", "목걸이", "반지"],
    "섬뜩한 빛의 관리자":     ["팔찌", "목걸이", "반지"],
    "부식된 메탈기어":        ["팔찌", "목걸이", "반지"],
    "화력 개조 탄띠":         ["팔찌", "목걸이", "반지"],
    "신비로운 빛의 소용돌이":  ["팔찌", "목걸이", "반지"],
    "콰트로 마누스 연산장치":  ["팔찌", "목걸이", "반지"],
    "레거시: 에테리얼 리베넌트":  ["팔찌", "목걸이", "반지"],
    "레거시: 지나온 영광의 시대": ["팔찌", "목걸이", "반지"]
};

const ACCESSORY_PREFIX = {
    "엘팅 메모리얼의 기억":    ["견고", "혈독"],
    "섬뜩한 빛의 관리자":     ["초석", "각오"],
    "부식된 메탈기어":        ["각오", "가속"],
    "화력 개조 탄띠":         ["혈독", "견고"],
    "신비로운 빛의 소용돌이":  ["조화", "초석"],
    "콰트로 마누스 연산장치":  ["가속", "조화"],
    "레거시: 에테리얼 리베넌트":  ["레거시"],
    "레거시: 지나온 영광의 시대": ["레거시"]
};

const ACCESSORY_DISPLAY_NAMES = {
    "엘팅 메모리얼의 기억": {
        "팔찌": ["선명한 기억의 팔찌", "묻힌 시간의 팔찌"],
        "목걸이": "흐릿한 과거의 목걸이",
        "반지": "덮어둔 기억의 반지"
    },
    "섬뜩한 빛의 관리자": {
        "팔찌": ["이심전심", "무언의 연결"],
        "목걸이": "숨겨진 맥락",
        "반지": "감춰진 결"
    },
    "부식된 메탈기어": {
        "팔찌": ["기계의 심박", "기계의 맥박"],
        "목걸이": "사라진 동력",
        "반지": "정지된 흐름"
    },
    "화력 개조 탄띠": {
        "팔찌": ["멀티플 툴즈", "트리플 툴즈"],
        "목걸이": "피어싱 드릴 네클레스",
        "반지": "오토매틱 실린더"
    },
    "신비로운 빛의 소용돌이": {
        "팔찌": ["시린 달빛", "푸른 달빛"],
        "목걸이": "은색의 별빛",
        "반지": "붉은 햇빛"
    },
    "콰트로 마누스 연산장치": {
        "팔찌": ["기계의 주시", "기계의 시선"],
        "목걸이": "에너지의 눈",
        "반지": "응시의 흔적"
    },
    "레거시: 에테리얼 리베넌트": {
        "팔찌": ["아이언 엠벨리시드 밴드", "강철 리스트 가드"],
        "목걸이": "영혼 추적장치",
        "반지": "할기의 본링"
    },
    "레거시: 지나온 영광의 시대": {
        "팔찌": ["세이트 루멘아이트 렐릭", "홀리 미스릴 렐릭"],
        "목걸이": "펠 로스 글로리",
        "반지": "에이션트 엘븐 링"
    }
};

// 악세 추가 정보 (project2 전용이지만 shared에 보관)
const ACCESSORY_EXTRA_INFO = {
    "엘팅 메모리얼의 기억":    "선명한,묻힌 / 흐릿한 / 덮어둔",
    "섬뜩한 빛의 관리자":     "이심전심,무언 / 숨겨진 / 감춰진",
    "부식된 메탈기어":        "기계의 심박,맥박 / 사라진 / 정지",
    "화력 개조 탄띠":         "멀티플,트리플 / 피어싱 / 오토매틱",
    "신비로운 빛의 소용돌이":  "시린,푸른 / 은색 / 붉은",
    "콰트로 마누스 연산장치":  "기계의 주시,시선 / 에너지 / 응시",
    "레거시: 에테리얼 리베넌트": "아이언,강철 / 영혼 / 할기",
    "레거시: 지나온 영광의 시대": "세이트,홀리 / 펠 / 에이션트"
};

// ※ project1 호환용: ACC_ITEM_INFO
// 아이템이름 → { setName, prefixes, isExceed } 역방향 맵
// 악세서리 배열에서 index 0 = 익시드 아이템, index 1 = 일반 아이템
const ACC_ITEM_INFO = (() => {
    const result = {};
    Object.entries(ACCESSORY_DISPLAY_NAMES).forEach(([setName, slotMap]) => {
        const prefixes = ACCESSORY_PREFIX[setName] || [];
        Object.entries(slotMap).forEach(([slot, val]) => {
            if (Array.isArray(val)) {
                val.forEach((itemName, idx) => {
                    if (itemName) result[itemName] = { setName, prefixes, isExceed: idx === 0 };
                });
            } else {
                if (val) result[val] = { setName, prefixes, isExceed: false };
            }
        });
    });
    return result;
})();

// 일반 아이템이지만 접두어가 강제 지정되는 아이템 목록 (공백 선택 없음, 첫 번째 값 자동 선택)
// 레거시 세트의 일반 아이템이 해당됨
const FORCED_PREFIX_ITEMS = new Set([
    "라이트니스 오토 상의",
    "마력의 폭풍우",
    "강철 리스트 가드",
    "홀리 미스릴 렐릭"
]);


// ※ project1 호환용: accSets
const accSets = (() => {
    const result = {};
    Object.entries(ACCESSORY_DISPLAY_NAMES).forEach(([setName, slotMap]) => {
        const items = [];
        Object.values(slotMap).forEach(v => {
            if (Array.isArray(v)) items.push(...v);
            else items.push(v);
        });
        result[setName] = items;
    });
    return result;
})();


/* ============================================================
   [섹션 3] 특수장비 세트
   ============================================================ */

const SPECIAL_SETS = {
    "개구쟁이 호문쿨루스":     ["귀걸이", "마법석", "보조장비"],
    "라이트닝 에너지 코어":    ["귀걸이", "마법석", "보조장비"],
    "철갑을 두른 탑의 수호꾼": ["귀걸이", "마법석", "보조장비"],
    "깊은 불구덩이의 섬멸자":  ["귀걸이", "마법석", "보조장비"],
    "허영 속 어둠의 피조물":   ["귀걸이", "마법석", "보조장비"],
    "부정한 빛의 우상":        ["귀걸이", "마법석", "보조장비"]
};

const SPECIAL_PREFIX = {
    "개구쟁이 호문쿨루스":     ["불굴", "숙련"],
    "라이트닝 에너지 코어":    ["숙련", "결의"],
    "철갑을 두른 탑의 수호꾼": ["격변", "촉진"],
    "깊은 불구덩이의 섬멸자":  ["불굴", "촉진"],
    "허영 속 어둠의 피조물":   ["질주", "결의"],
    "부정한 빛의 우상":        ["질주", "격변"]
};

const SPECIAL_DISPLAY_NAMES = {
    "개구쟁이 호문쿨루스": {
        "귀걸이": ["말괄량이의 문양 귀걸이", "베키의 문양 귀걸이"],
        "마법석": "베키의 새총",
        "보조장비":   "베키의 장갑"
    },
    "라이트닝 에너지 코어": {
        "귀걸이": ["거신의 스펙쿨룸 이어링", "거인의 스펙쿨룸 이어링"],
        "마법석": "거인의 스펙쿨룸 코어",
        "보조장비":   "거인의 건들릿"
    },
    "철갑을 두른 탑의 수호꾼": {
        "귀걸이": ["메탈기어의 초합금 태엽", "메탈기어의 태엽 귀걸이"],
        "마법석": "메탈기어의 두뇌",
        "보조장비":   "메탈기어의 조작부"
    },
    "깊은 불구덩이의 섬멸자": {
        "귀걸이": ["강철 용의 기관총 이어링", "강철 용의 기총 이어링"],
        "마법석": "강철 용의 천공기",
        "보조장비":   "강철 용의 칼날 외골격"
    },
    "허영 속 어둠의 피조물": {
        "귀걸이": ["골드 크라운의 서커스 장식", "골드 크라운의 머리 장식"],
        "마법석": "골드 크라운의 핵심 부품",
        "보조장비":   "골드 크라운의 에너지 방출기"
    },
    "부정한 빛의 우상": {
        "귀걸이": ["콰트로 마누스의 기억", "콰트로 마누스의 태엽 장식"],
        "마법석": "콰트로 마누스의 두뇌",
        "보조장비":   "콰트로 마누스의 에너지 코어"
    }
};

// ※ project1 호환용: SPECIAL_ITEM_INFO
// 아이템이름 → { setName, prefixes, isExceed } 역방향 맵
// 귀걸이 배열에서 index 0 = 익시드 아이템, index 1 = 일반 아이템
const SPECIAL_ITEM_INFO = (() => {
    const result = {};
    Object.entries(SPECIAL_DISPLAY_NAMES).forEach(([setName, slotMap]) => {
        const prefixes = SPECIAL_PREFIX[setName] || [];
        Object.entries(slotMap).forEach(([slot, val]) => {
            if (Array.isArray(val)) {
                val.forEach((itemName, idx) => {
                    if (itemName) result[itemName] = { setName, prefixes, isExceed: idx === 0 };
                });
            } else {
                if (val) result[val] = { setName, prefixes, isExceed: false };
            }
        });
    });
    return result;
})();

// 특장 추가 정보 (project2 전용이지만 shared에 보관)
const SPECIAL_EXTRA_INFO = {
    "개구쟁이 호문쿨루스":     "말괄량이,베키",
    "라이트닝 에너지 코어":    "거신,거인",
    "철갑을 두른 탑의 수호꾼": "메탈기어",
    "깊은 불구덩이의 섬멸자":  "강철",
    "허영 속 어둠의 피조물":   "골드",
    "부정한 빛의 우상":        "콰트로"
};

// ※ project1 호환용: specialSets
const specialSets = (() => {
    const result = {};
    Object.entries(SPECIAL_DISPLAY_NAMES).forEach(([setName, slotMap]) => {
        const items = [];
        Object.values(slotMap).forEach(v => {
            if (Array.isArray(v)) items.push(...v);
            else items.push(v);
        });
        result[setName] = items;
    });
    return result;
})();


/* ============================================================
   [섹션 4] 통합 세트 (project2 전용)
   ============================================================ */

const ALL_SETS   = { ...ARMOR_SETS,   ...ACCESSORY_SETS,   ...SPECIAL_SETS   };
const ALL_PREFIX = { ...ARMOR_PREFIX, ...ACCESSORY_PREFIX, ...SPECIAL_PREFIX };

// 레거시 세트 목록 (접두어 키 생성 시 특수 처리 필요)
const LEGACY_PREFIX_SETS = [
    "레거시: 마력의 소용돌이",
    "레거시: 자연의 수호자",
    "레거시: 에테리얼 리베넌트",
    "레거시: 지나온 영광의 시대"
];

// 접두어 키 생성 헬퍼 (레거시는 setName 그대로 사용)
function makePrefixKey(pref, setName) {
    if (LEGACY_PREFIX_SETS.includes(setName)) return setName;
    return `${pref}: ${setName}`;
}


/* ============================================================
   [섹션 5] project1 전용: 마법봉인 / itemOptions / sealData
   - project1(index.html)에서만 사용하는 데이터
   - 기존 data.js 에서 이관
   ============================================================ */

// 마법봉인 옵션
const sealData = {
    weapon: {
        n1: ["", "데미지 증가", "추가 데미지", "모든 직업 50레벨스킬", "화속강", "수속강", "명속강", "암속강", "힘", "지능", "물리 공격력", "마법 공격력"],
        n2: ["", "물리 공격력", "마법 공격력", "힘", "지능", "체력", "정신력", "공격속도", "캐스팅속도", "이동속도", "최대 HP 증가", "최대 MP 증가", "물리 방어력", "마법 방어력", "적중", "회피"]
    },
    armor: {
        n1: ["", "힘", "지능", "체력", "정신력", "물리 크리티컬", "마법 크리티컬"],
        n2: ["", "물리 크리티컬", "마법 크리티컬", "힘", "지능", "체력", "정신력", "공격속도", "캐스팅속도", "이동속도", "최대 HP 증가", "최대 MP 증가", "물리 방어력", "마법 방어력", "적중", "회피"]
    },
    accessory: {
        n1: ["", "화속강", "수속강", "명속강", "암속강", "힘", "지능", "체력", "정신력"],
        n2: ["", "화속강", "수속강", "명속강", "암속강", "힘", "지능", "체력", "정신력", "공격속도", "캐스팅속도", "이동속도", "최대 HP 증가", "최대 MP 증가", "물리 방어력", "마법 방어력", "화속성 저항", "수속성 저항", "명속성 저항", "암속성 저항", "적중", "회피"]
    },
    special: {
        n1: ["", "물리 공격력", "마법 공격력", "힘", "지능", "물리 크리티컬", "마법 크리티컬", "적중", "회피"],
        n2: ["", "물리 공격력", "마법 공격력", "물리 크리티컬", "마법 크리티컬", "힘", "지능", "체력", "정신력", "공격속도", "캐스팅속도", "이동속도", "최대 HP 증가", "최대 MP 증가", "물리 방어력", "마법 방어력", "적중", "회피"]
    }
};

// 슬롯별 아이템 선택 옵션 목록 (project1 드롭다운용)
// DISPLAY_NAMES 에서 자동 생성
// 칭호/오라 아이템 상세 정보 (나중에 정보 열람 기능에서 사용)
// desc는 팝업창 설명칸에 나온다.
const _TITLE_TEMPLATES = {
    V1: {
        info: `기본정보
힘, 지능 +33
체력, 정신력 +22
공격속도 +2%
캐스팅속도 +2%
이동속도 +2%
물리 크리티컬 +30
마법 크리티컬 +30
---
효과
HP MAX +220
모든 속성 강화 +10
데미지 10% 증가
공격 시 1% 확률로 무색 큐블 조각 1개를 소모하여 30초간 힘 30, 지능 30, 체력 20, 정신력 20, 공격속도 5%, 캐스팅속도 5%, 이동속도 5% 증가합니다.`,
        desc: `공격 시 1% 확률로 무색 큐블 조각 1개를 소모하여 30초간 힘 30, 지능 30, 체력 20, 정신력 20, 공격속도 5%, 캐스팅속도 5%, 이동속도 5% 증가합니다.`,
        base: [
            {stats: ['힘', '지능'], amount: 33, unit: ''},
            {stats: ['체력', '정신력'], amount: 22, unit: ''},
            {stats: ['공격속도'], amount: 2, unit: '%'},
            {stats: ['캐스팅속도'], amount: 2, unit: '%'},
            {stats: ['이동속도'], amount: 2, unit: '%'},
            {stats: ['물리 크리티컬'], amount: 30, unit: ''},
            {stats: ['마법 크리티컬'], amount: 30, unit: ''},
        ],
        eff: [
            {stats: ['HP MAX'], amount: 220, unit: ''},
            {stats: ['모든 속성 강화'], amount: 10, unit: ''},
            {stats: ['데미지 증가'], amount: 10, unit: '%'},
        ],
    },
    V2: {
        info: `기본정보
힘, 지능 +33
체력, 정신력 +22
공격속도 +2%
캐스팅속도 +3%
이동속도 +2%
물리 크리티컬 +30
마법 크리티컬 +30
---
효과
HP MAX +220
모든 속성 강화 +3
데미지 15% 증가
공격 시 1% 확률로 무색 큐블 조각 1개를 소모하여 30초간 힘 30, 지능 30, 체력 20, 정신력 20, 공격속도 5%, 캐스팅속도 5%, 이동속도 5% 증가합니다.`,
        desc: `공격 시 1% 확률로 무색 큐블 조각 1개를 소모하여 30초간 힘 30, 지능 30, 체력 20, 정신력 20, 공격속도 5%, 캐스팅속도 5%, 이동속도 5% 증가합니다.`,
        base: [
            { stats: ['힘', '지능'],           amount: 33  , unit: ''},
            { stats: ['체력', '정신력'],        amount: 22  , unit: ''},
            { stats: ['공격속도'],             amount: 2   , unit: '%'},
            { stats: ['캐스팅속도'],           amount: 3   , unit: '%'},
            { stats: ['이동속도'],             amount: 2   , unit: '%'},
            { stats: ['물리 크리티컬'],        amount: 30  , unit: ''},
            { stats: ['마법 크리티컬'],        amount: 30  , unit: ''},
        ],
        eff: [
            { stats: ['HP MAX'],              amount: 220 , unit: ''},
            { stats: ['모든 속성 강화'],       amount: 3   , unit: ''},
            { stats: ['데미지 증가'],              amount: 15  , unit: '%'},
        ]
    },
    V3: {
        info: `기본정보
힘 +32
지능 +32
정신력 +32
공격속도 +2%
캐스팅속도 +3%
이동속도 +2%
---
효과
HP MAX +55
MP MAX +110
수속성 저항 +7
수속강 +3`,
        base: [
            { stats: ['힘', '지능', '정신력'], amount: 32  , unit: ''},
            { stats: ['공격속도'],             amount: 2   , unit: '%'},
            { stats: ['캐스팅속도'],           amount: 3   , unit: '%'},
            { stats: ['이동속도'],             amount: 2   , unit: '%'},
        ],
        eff: [
            { stats: ['HP MAX'],              amount: 55  , unit: ''},
            { stats: ['MP MAX'],              amount: 110 , unit: ''},
            { stats: ['수속성 저항'],         amount: 7   , unit: ''},
            { stats: ['수속강'],              amount: 3   , unit: ''},
        ]
    },
    V4: {
        info: `기본정보
힘, 지능, 체력, 정신력 +18
공격속도 +1.5%
캐스팅속도 +2.2%
이동속도 +1.5%`,
        base: [
            { stats: ['힘', '지능', '체력', '정신력'], amount: 18  , unit: ''},
            { stats: ['공격속도'],                     amount: 1.5 , unit: '%'},
            { stats: ['캐스팅속도'],                   amount: 2.2 , unit: '%'},
            { stats: ['이동속도'],                     amount: 1.5 , unit: '%'},
        ],
        eff: []
    },
    V5: {
        info: `기본정보
힘, 지능, 체력, 정신력 +8`,
        base: [
            { stats: ['힘', '지능', '체력', '정신력'], amount: 8  , unit: ''},
        ],
        eff: []
    },
    V6: {
        info: `기본정보
힘 +32
지능 +32
체력 +32
정신력 +32
공격속도 +2%
캐스팅속도 +3%
이동속도 +2%
---
효과
HP MAX +55
MP MAX +110
화속성 저항 +7
화속강 +3`,
        base: [
            { stats: ['힘', '지능', '체력','정신력'], amount: 32  , unit: ''},
            { stats: ['공격속도'],             amount: 2   , unit: '%'},
            { stats: ['캐스팅속도'],           amount: 3   , unit: '%'},
            { stats: ['이동속도'],             amount: 2   , unit: '%'},
        ],
        eff: [
            { stats: ['HP MAX'],              amount: 55  , unit: ''},
            { stats: ['MP MAX'],              amount: 110 , unit: ''},
            { stats: ['화속성 저항'],         amount: 7   , unit: ''},
            { stats: ['화속강'],              amount: 3   , unit: ''},
        ]
    },
    // 우리모두 Arcade, 4th Anniversary
    V7: {
        info: `기본정보
힘, 지능 +66
체력, 정신력 +33
공격속도 +5%
캐스팅속도 +7%
이동속도 +5%
물리 크리티컬 +30
마법 크리티컬 +30
---
효과
HP MAX +220
모든 속성 강화 +3
데미지 20% 증가`,
        base: [
            { stats: ['힘', '지능'], amount: 66  , unit: ''},
            { stats: ['체력','정신력'], amount: 33  , unit: ''},
            { stats: ['공격속도'],             amount: 5   , unit: '%'},
            { stats: ['캐스팅속도'],           amount: 7   , unit: '%'},
            { stats: ['이동속도'],             amount: 5   , unit: '%'},
            { stats: ['물리 크리티컬'],             amount: 30   , unit: ''},
            { stats: ['마법 크리티컬'],             amount: 30   , unit: ''},
        ],
        eff: [
            { stats: ['HP MAX'],              amount: 220  , unit: ''},
            { stats: ['모든 속성 강화'],         amount: 3   , unit: ''},
            { stats: ['데미지 증가'],              amount: 20   , unit: '%'},
        ]
    },
    // 아라드 오션브리즈[플래티넘], 던전밥
    V8: {
        info: `기본정보
힘, 지능 +66
체력, 정신력 +33
공격속도 +5%
캐스팅속도 +7%
이동속도 +5%
물리 크리티컬 +30
마법 크리티컬 +30
---
효과
HP MAX +220
모든 속성 강화 +3
마을 이동속도 증가 +10%
모든 직업 15~70레벨 스킬Lv+1(TP스킬 제외)
데미지 20% 증가`,
        desc: `모든 직업 15~70레벨 스킬Lv+1(TP스킬 제외)`,
        base: [
            { stats: ['힘', '지능'], amount: 66  , unit: ''},
            { stats: ['체력','정신력'], amount: 33  , unit: ''},
            { stats: ['공격속도'],             amount: 5   , unit: '%'},
            { stats: ['캐스팅속도'],           amount: 7   , unit: '%'},
            { stats: ['이동속도'],             amount: 5   , unit: '%'},
            { stats: ['물리 크리티컬'],             amount: 30   , unit: ''},
            { stats: ['마법 크리티컬'],             amount: 30   , unit: ''},
        ],
        eff: [
            { stats: ['HP MAX'],              amount: 220  , unit: ''},
            { stats: ['모든 속성 강화'],         amount: 3   , unit: ''},
            { stats: ['마을 이동속도 증가'],         amount: 10   , unit: '%'},
            { stats: ['데미지 증가'],              amount: 20   , unit: '%'},
        ]
    },
    // 아라드 선라이즈, 아라드 선셋
    V9: {
        info: `기본정보
힘, 지능 +66
체력, 정신력 +33
공격속도 +5%
캐스팅속도 +7%
이동속도 +5%
물리 크리티컬 +30
마법 크리티컬 +30
---
효과
HP MAX +220
모든 속성 강화 +3
데미지 15% 증가`,
        desc: `모든 직업 15~70레벨 스킬Lv+1(TP스킬 제외)`,
        base: [
            { stats: ['힘', '지능'], amount: 66  , unit: ''},
            { stats: ['체력','정신력'], amount: 33  , unit: ''},
            { stats: ['공격속도'],             amount: 5   , unit: '%'},
            { stats: ['캐스팅속도'],           amount: 7   , unit: '%'},
            { stats: ['이동속도'],             amount: 5   , unit: '%'},
            { stats: ['물리 크리티컬'],             amount: 30   , unit: ''},
            { stats: ['마법 크리티컬'],             amount: 30   , unit: ''},
        ],
        eff: [
            { stats: ['HP MAX'],              amount: 220  , unit: ''},
            { stats: ['모든 속성 강화'],         amount: 3   , unit: ''},
            { stats: ['데미지 증가'],              amount: 15   , unit: '%'},
        ]
    },
};

const TITLE_ITEM_INFO = {
    "우리들의 Arcade": _TITLE_TEMPLATES.V1,
    "우리함께 Arcade": _TITLE_TEMPLATES.V2,
    "우리모두 Arcade": _TITLE_TEMPLATES.V7,
    "2nd Anniversary 칭호": _TITLE_TEMPLATES.V1,
    "3rd Anniversary": _TITLE_TEMPLATES.V2,
    "4th Anniversary": _TITLE_TEMPLATES.V7,
    "아라드 오션브리즈[플래티넘]": _TITLE_TEMPLATES.V8,
    "던전밥": _TITLE_TEMPLATES.V8,
    "원탁의 기사 [白]": _TITLE_TEMPLATES.V8,
    "아라드 선라이즈": _TITLE_TEMPLATES.V9,
    "아라드 선셋": _TITLE_TEMPLATES.V9,
    "천해의 수호자": _TITLE_TEMPLATES.V3,
    "Specialist": _TITLE_TEMPLATES.V4,
    "안톤:공대 참전자": _TITLE_TEMPLATES.V5,
    "안톤 정복자": _TITLE_TEMPLATES.V6,
};

const _AURA_TEMPLATES = {
    V1: {
        info: `기본정보
힘, 지능, 체력, 정신력 +45
물리 크리티컬 +110
마법 크리티컬 +110
---
효과
화속강 +8
수속강 +8
암속강 +8
명속강 +8`,
        base: [
            {stats: ['힘', '지능', '체력', '정신력'], amount: 45, unit: ''},
            {stats: ['물리 크리티컬', '마법 크리티컬'], amount: 110, unit: ''},
        ],
        eff: [
            {stats: ['화속강', '수속강', '암속강', '명속강'], amount: 8, unit: ''},
        ]
    },
    // 우리모두 Arcade 오라, 3rd Anniversary 오라, 4th Anniversary 오라
    V2: {
        info: `기본정보
힘, 지능, 체력, 정신력 +50
물리 크리티컬 확률 +2%
마법 크리티컬 확률 +2%
물리 크리티컬 +130
마법 크리티컬 +130
---
효과
모든 속성 강화 +10
마을 이동속도 증가 +5%
데미지 5% 증가`,
        base: [
            { stats: ['힘', '지능', '체력', '정신력'], amount: 50, unit: ''},
            { stats: ['물리 크리티컬 확률', '마법 크리티컬 확률'], amount: 2, unit: '%'},
            { stats: ['물리 크리티컬', '마법 크리티컬'], amount: 130, unit: ''},
        ],
        eff: [
            { stats: ['모든 속성 강화'], amount: 10, unit: ''},
            { stats: ['마을 이동속도 증가'], amount: 5, unit: '%'},
            { stats: ['데미지 증가'], amount: 5, unit: "%" },
        ]
    },
    V3: {
        info: `기본정보
힘, 지능, 체력, 정신력 +45
물리 크리티컬 +110
마법 크리티컬 +110
---
효과
모든 속성 강화 +8`,
        base: [
            { stats: ['힘', '지능', '체력', '정신력'], amount: 45, unit: ''},
            { stats: ['물리 크리티컬', '마법 크리티컬'], amount: 110, unit: ''},
        ],
        eff: [
            { stats: ['모든 속성 강화'], amount: 8, unit: ''},
        ]
    },
    V4: {
        info: `기본정보
힘, 지능, 체력, 정신력 +9
`,
        base: [
            { stats: ['힘', '지능', '체력', '정신력'], amount: 9, unit: ''},
        ]
    },
    V5: {
        info: `기본정보
힘, 지능, 체력, 정신력 +24
적중 +80
`,
        base: [
            { stats: ['힘', '지능', '체력', '정신력'], amount: 24, unit: ''},
            { stats: ['적중'], amount: 80, unit: ''},
        ]
    },
    // 극한을 정복한 자, 코스믹 스피어, 마르실의 소생 마법 오라
    V6: {
        info: `기본정보
힘, 지능, 체력, 정신력 +50
물리 크리티컬 확률 +5%
마법 크리티컬 확률 +5%
물리 크리티컬 +130
마법 크리티컬 +130
---
효과
모든 속성 강화 +10
마을 이동속도 증가 +5%
데미지 7% 증가`,
        base: [
            { stats: ['힘', '지능', '체력', '정신력'], amount: 50, unit: ''},
            { stats: ['물리 크리티컬 확률', '마법 크리티컬 확률'], amount: 5, unit: '%'},
            { stats: ['물리 크리티컬', '마법 크리티컬'], amount: 130, unit: ''},
        ],
        eff: [
            { stats: ['모든 속성 강화'], amount: 10, unit: ''},
            { stats: ['마을 이동속도 증가'], amount: 5, unit: '%'},
            { stats: ['데미지 증가'], amount: 7, unit: "%" },
        ]
    },
    // 극한을 이겨낸 자, 체인질링 오라, 광기의 물결 오라
    V7: {
        info: `기본정보
힘, 지능, 체력, 정신력 +50
물리 크리티컬 +130
마법 크리티컬 +130
---
효과
모든 속성 강화 +10`,
        base: [
            {stats: ['힘', '지능', '체력', '정신력'], amount: 50, unit: ''},
            {stats: ['물리 크리티컬', '마법 크리티컬'], amount: 130, unit: ''},
        ],
        eff: [
            {stats: ['모든 속성 강화'], amount: 10, unit: ''},
        ]
    },
};

const AURA_ITEM_INFO = {
    "우리들의 Arcade 오라":  _AURA_TEMPLATES.V1,
    "우리모두 Arcade 오라":  _AURA_TEMPLATES.V2,
    "2nd Anniversary 오라": _AURA_TEMPLATES.V1,
    "3rd Anniversary 오라": _AURA_TEMPLATES.V2,
    "4rd Anniversary 오라": _AURA_TEMPLATES.V2,
    "해방전력 오라": _AURA_TEMPLATES.V3,
    "성안의 봉인 오라": _AURA_TEMPLATES.V4,
    "검의 기억 오라": _AURA_TEMPLATES.V4,
    "즐거운 새로움이 가득한 오라": _AURA_TEMPLATES.V4,
    "혼돈의 조각": _AURA_TEMPLATES.V4,
    "천해의 지배": _AURA_TEMPLATES.V4,
    "신목의 정복자 오라": _AURA_TEMPLATES.V4,
    "눈꽃 오라": _AURA_TEMPLATES.V5,
    "극한을 정복한 자": _AURA_TEMPLATES.V6,
    "코스믹 스피어": _AURA_TEMPLATES.V6,
    "마르실의 소생 마법 오라": _AURA_TEMPLATES.V6,
    "극한을 이겨낸 자": _AURA_TEMPLATES.V7,
    "체인질링 오라": _AURA_TEMPLATES.V7,
    "광기의 물결 오라": _AURA_TEMPLATES.V7,
};

const itemOptions = (() => {
    const result = {};

    // 방어구 슬롯
    const armorSlots = ["상의", "하의", "어깨", "벨트", "신발"];
    armorSlots.forEach(slot => {
        result[slot] = [""];
        Object.entries(ARMOR_DISPLAY_NAMES).forEach(([setName, slotMap]) => {
            const val = slotMap[slot];
            if (!val) return;
            if (Array.isArray(val)) {
                val.forEach(v => result[slot].push(v));
                result[slot].push(""); // 세트 구분용 빈칸
            } else {
                result[slot].push(val);
            }
        });
    });

    // 악세 슬롯
    const accSlots = ["팔찌", "목걸이", "반지"];
    accSlots.forEach(slot => {
        result[slot] = [""];
        Object.entries(ACCESSORY_DISPLAY_NAMES).forEach(([setName, slotMap]) => {
            const val = slotMap[slot];
            if (!val) return;
            if (Array.isArray(val)) {
                val.forEach(v => result[slot].push(v));
                result[slot].push("");
            } else {
                result[slot].push(val);
            }
        });
    });

    // 특수장비 슬롯 (보조장비 = 보조장비, 귀걸이, 마법석)
    result["보조장비"] = [""];
    result["귀걸이"]   = [""];
    result["마법석"]   = [""];
    Object.entries(SPECIAL_DISPLAY_NAMES).forEach(([setName, slotMap]) => {
        const subEquip = slotMap["보조장비"];
        const ear  = slotMap["귀걸이"];
        const gem  = slotMap["마법석"];
        if (subEquip) {
            if (Array.isArray(subEquip)) result["보조장비"].push(...subEquip, "");
            else result["보조장비"].push(subEquip);
        }
        if (ear) {
            if (Array.isArray(ear)) result["귀걸이"].push(...ear, "");
            else result["귀걸이"].push(ear);
        }
        if (gem) {
            if (Array.isArray(gem)) result["마법석"].push(...gem, "");
            else result["마법석"].push(gem);
        }
    });

    // 칭호 슬롯
    result["칭호"] = ["", "우리들의 Arcade"];

    // 외형칭호 슬롯
    result["외형칭호"] = ["", "포효하는 번개"];

    // 오라 슬롯
    result["오라"] = ["", "우리들의 Arcade 오라"];

    return result;
})();

// ※ GameData 호환 객체 (기존 project1 코드가 GameData.* 로 참조하는 경우 대비)
// ============================================
// 무기 아바타 수치 아이템 정보
// ============================================

/**
 * 무기 아바타 수치 템플릿
 * 오라의 _AURA_TEMPLATES 와 동일한 방식으로 사용
 *
 * 구조:
 *   info  : 설명란에 표시될 텍스트 (자동입력용, 개행 포함 가능)
 *   base  : 기본정보 스탯 배열 [{ stats:['스탯키',...], amount:수치, unit:'' }]
 *   eff   : 효과 스탯 배열    [{ stats:['스탯키',...], amount:수치, unit:'' }]
 *   desc  : 스탯으로 표현 못하는 특수 효과 텍스트 (선택)
 *
 * ─────────────────────────────────────────
 * 예시)
 *   WA_V1: {
 *       info: `기본정보
 * 힘, 지능, 체력, 정신력 +18
 * ---
 * 효과
 * 모든 속성 강화 +5`,
 *       base: [
 *           { stats: ['힘', '지능', '체력', '정신력'], amount: 18, unit: '' },
 *       ],
 *       eff: [
 *           { stats: ['모든 속성 강화'], amount: 5, unit: '' },
 *       ]
 *   },
 * ─────────────────────────────────────────
 */
const _WEAPON_AVATAR_TEMPLATES = {
    // ↓ 템플릿을 여기에 추가 (WA_V1, WA_V2, ...)
    // 예시:
    WA_V1: {
        info: `기본정보
힘, 지능, 체력, 정신력 +18
---
효과
물리 공격력 5% 증가
마법 공격력 5% 증가
`,
        base: [
            { stats: ['힘', '지능', '체력', '정신력'], amount: 18, unit: '' },
        ],
        eff: [
            { stats: ['물리 공격력 증가'], amount: 5, unit: '%' },
            { stats: ['마법 공격력 증가'], amount: 5, unit: '%' },
        ]
    },
    WA_V2: {
        info: `기본정보
힘, 지능, 체력, 정신력 +18
---
효과
물리 공격력 3% 증가
마법 공격력 3% 증가
`,
        base: [
            { stats: ['힘', '지능', '체력', '정신력'], amount: 18, unit: '' },
        ],
        eff: [
            { stats: ['물리 공격력 증가'], amount: 3, unit: '%' },
            { stats: ['마법 공격력 증가'], amount: 3, unit: '%' },
        ]
    },
    WA_V3: {
        info: `기본정보
힘, 지능, 체력, 정신력 +18
---
효과
공격 시 5% 추가 데미지
`,
        base: [
            { stats: ['힘', '지능', '체력', '정신력'], amount: 18, unit: '' },
        ],
        eff: [
            { stats: ['공격 시 추가 데미지'], amount: 5, unit: '%' },
        ]
    },
    WA_V4: {
        info: `기본정보
힘, 지능, 체력, 정신력 +18
`,
        base: [
            { stats: ['힘', '지능', '체력', '정신력'], amount: 18, unit: '' },
        ],
        eff: []
    },
    WA_V5: {
        info: `기본정보
힘, 지능, 체력, 정신력 +11
`,
        base: [
            { stats: ['힘', '지능', '체력', '정신력'], amount: 11, unit: '' },
        ],
        eff: []
    },
};

/**
 * 무기 아바타 수치 아이템 목록
 * 드롭다운에 표시될 이름: 템플릿 매핑
 *
 *   "아이템 이름": _WEAPON_AVATAR_TEMPLATES.WA_V1,
 */
const WEAPON_AVATAR_ITEM_INFO = {
    // ↓ 여기에 무기 아바타 수치 아이템을 추가하세요
    "블루 레몬 에이드": _WEAPON_AVATAR_TEMPLATES.WA_V1,
    "클래식 코튼 글러브": _WEAPON_AVATAR_TEMPLATES.WA_V1,
    "청룡의 무기": _WEAPON_AVATAR_TEMPLATES.WA_V1,
    "티라미수 케이크": _WEAPON_AVATAR_TEMPLATES.WA_V1,
    "황천의 구도자 무기": _WEAPON_AVATAR_TEMPLATES.WA_V2,
    "명계의 구도자 무기": _WEAPON_AVATAR_TEMPLATES.WA_V2,
    "무형의 무기": _WEAPON_AVATAR_TEMPLATES.WA_V3,
    "기사단의 무기": _WEAPON_AVATAR_TEMPLATES.WA_V3,
    "생명의 나무 무기": _WEAPON_AVATAR_TEMPLATES.WA_V3,
    "홈쇼핑 공구세트 무기": _WEAPON_AVATAR_TEMPLATES.WA_V3,

    "사랑 가득 마법봉": _WEAPON_AVATAR_TEMPLATES.WA_V5,
    "명부의 구도자 무기": _WEAPON_AVATAR_TEMPLATES.WA_V5,
    "특제 고블린 몽둥이": _WEAPON_AVATAR_TEMPLATES.WA_V5,
    "흑도 : 쿠로이츠키의 형상": _WEAPON_AVATAR_TEMPLATES.WA_V5,
    "천해의 형상 무기": _WEAPON_AVATAR_TEMPLATES.WA_V5,
};

const GameData = {
    sealData,
    itemOptions,
    armorSets,
    accSets,
    specialSets,
    TITLE_ITEM_INFO,
    AURA_ITEM_INFO,
    WEAPON_AVATAR_ITEM_INFO
};


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
    // 진 : 옥령왕, 뇌해:마고스, 멸망의 칼릭스
    EPIC_V1: {
        info: `모든 속성 강화 +5\n공격 시 18% 추가 데미지`,
        stats: [
            { stat: '모든 속성 강화',      amount: 5,  label: '모든 속성 강화 +5'       },
            { stat: '공격 시 추가 데미지', amount: 18, label: '공격 시 18% 추가 데미지' },
        ]
    },
    // 곰인형 민D, ARCADE 세리아
    EPIC_V2: {
        info: `물리, 마법 크리티컬 확률 +2%\n모든 속성 강화 +8\n공격 시 21% 추가 데미지`,
        stats: [
            { stat: '물리 크리티컬 확률', amount: 2,  unit: '%', label: '물리 크리티컬 확률 +2%'  },
            { stat: '마법 크리티컬 확률', amount: 2,  unit: '%', label: '마법 크리티컬 확률 +2%'  },
            { stat: '모든 속성 강화',     amount: 8,             label: '모든 속성 강화 +8'       },
            { stat: '공격 시 추가 데미지',amount: 21,            label: '공격 시 21% 추가 데미지' },
        ]
    },
    // 4th Anniversary 세리아
    EPIC_V3: {
        info: `물리, 마법 크리티컬 확률 +2%\n모든 속성 강화 +10\n공격 시 25% 추가 데미지`,
        stats: [
            { stat: '물리 크리티컬 확률', amount: 2,  unit: '%', label: '물리 크리티컬 확률 +2%'  },
            { stat: '마법 크리티컬 확률', amount: 2,  unit: '%', label: '마법 크리티컬 확률 +2%'  },
            { stat: '모든 속성 강화',     amount: 10,             label: '모든 속성 강화 +10'       },
            { stat: '공격 시 추가 데미지',amount: 25,            label: '공격 시 25% 추가 데미지' },
        ]
    },
    // 드래곤테이머 소피아
    EPIC_V4: {
        info: `물리, 마법 크리티컬 확률 +2%\n모든 속성 강화 +10\n공격 시 25% 추가 데미지\n최종 데미지 5% 증가`,
        stats: [
            { stat: '물리 크리티컬 확률',   amount: 2,  unit: '%', label: '물리 크리티컬 확률 +2%'  },
            { stat: '마법 크리티컬 확률',   amount: 2,  unit: '%', label: '마법 크리티컬 확률 +2%'  },
            { stat: '모든 속성 강화',      amount: 10,             label: '모든 속성 강화 +10'       },
            { stat: '공격 시 추가 데미지',  amount: 25,            label: '공격 시 25% 추가 데미지' },
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
    // 유이
    UNIQUE_V3: {
        info: `던전 입장 시 자신을 포함한 파티원의 모든 속성 강화 11증가\n공격 시 5% 추가 데미지`,
        stats: [
            { stat: '공격 시 추가 데미지', amount: 5, unit: '%', label: '공격 시 5% 추가 데미지' },
        ]
    },
    // 검돌이, 방위대 드론
    UNIQUE_V4: {
        info: `공격 시 15% 추가 데미지`,
        stats: [
            { stat: '공격 시 추가 데미지', amount: 15, unit: '%', label: '공격 시 15% 추가 데미지' },
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
    "검돌이":                            { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V4  },
    "곰인형 민D":                        { grade: '에픽',   ..._CREATURE_TEMPLATES.EPIC_V2    },
    "녹색 잭 오 랜턴":                   { grade: '레어',   ..._CREATURE_TEMPLATES.RARE_V7    },
    "뇌해:마고스":                       { grade: '에픽',   ..._CREATURE_TEMPLATES.EPIC_V1    },
    "단진의 축복":                       { grade: '레어',   ..._CREATURE_TEMPLATES.RARE_V9    },
    "달빛 매니저":                       { grade: '레어',   ..._CREATURE_TEMPLATES.RARE_V2    },
    "마법학 교수":                       { grade: '레어',   ..._CREATURE_TEMPLATES.RARE_V2    },
    "멸망의 칼릭스":                     { grade: '에픽',   ..._CREATURE_TEMPLATES.EPIC_V1    },
    "무직":                              { grade: '레어',   ..._CREATURE_TEMPLATES.RARE_V2    },
    "방위대 드론":                       { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V4  },
    "베히의 축복":                       { grade: '레어',   ..._CREATURE_TEMPLATES.RARE_V9    },
    "붉은 잭 오 랜턴":                   { grade: '레어',   ..._CREATURE_TEMPLATES.RARE_V6    },
    "비네":                              { grade: '언커먼', ..._CREATURE_TEMPLATES.UNCOMMON_V1 },
    "쁘띠 골드크라운":                   { grade: '레어',   ..._CREATURE_TEMPLATES.RARE_V8    },
    "쁘띠 베키":                         { grade: '레어',   ..._CREATURE_TEMPLATES.RARE_V8    },
    "쁘띠 스켈레톤 골드":                { grade: '언커먼', ..._CREATURE_TEMPLATES.UNCOMMON_V1 },
    "쁘띠 아르고스":                     { grade: '레어',   ..._CREATURE_TEMPLATES.RARE_V8    },
    "웅녀":                              { grade: '레어',   ..._CREATURE_TEMPLATES.RARE_V9    },
    "유이":                              { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V3  },
    "진 : 옥령왕":                       { grade: '에픽',   ..._CREATURE_TEMPLATES.EPIC_V1    },
    "짐꾼 당나귀":                       { grade: '레어',   ..._CREATURE_TEMPLATES.RARE_V1    },
    "초등학생 크리쳐":                   { grade: '레어',   ..._CREATURE_TEMPLATES.RARE_V2    },
    "통통 베히볼":                       { grade: '레어',   ..._CREATURE_TEMPLATES.RARE_V11   },
    "퍼스트 버서커 : 카잔 파핑 크리쳐":  { grade: '레어',   ..._CREATURE_TEMPLATES.RARE_V10   },
    "펌킨 단진":                         { grade: '레어',   ..._CREATURE_TEMPLATES.RARE_V6    },
    "펌킨 랜디":                         { grade: '레어',   ..._CREATURE_TEMPLATES.RARE_V7    },
    "SD 스테로페":                       { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V2  },
    "SD 여거너":                         { grade: '레어',   ..._CREATURE_TEMPLATES.RARE_V4    },
    "SD 여귀검사":                       { grade: '레어',   ..._CREATURE_TEMPLATES.RARE_V3    },
    "SD 여프리스트":                     { grade: '레어',   ..._CREATURE_TEMPLATES.RARE_V5    },
    "SD 켈라이노":                       { grade: '유니크', ..._CREATURE_TEMPLATES.UNIQUE_V1  },
    "2주년 케이크 모자를 쓴 플랑":       { grade: '커먼',   ..._CREATURE_TEMPLATES.COMMON_V1  },
    "3rd 뿌우단진":                      { grade: '커먼',   ..._CREATURE_TEMPLATES.COMMON_V1  },
    "4th Anniversary 세리아":            { grade: '에픽',   ..._CREATURE_TEMPLATES.EPIC_V3  },
    "드래곤테이머 소피아":            { grade: '에픽',   ..._CREATURE_TEMPLATES.EPIC_V4  },
    "ARCADE 세리아":            { grade: '에픽',   ..._CREATURE_TEMPLATES.EPIC_V2  },
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
        setName: '아스마르 아티펙트 3세트 효과',
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
        setName: '새끼용, 실프, 에메랄드',
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
];