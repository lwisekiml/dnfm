// ============================================================
// shared_data_seal.js - 봉인/칭호/오라/무기아바타 데이터
// ============================================================
// ※ 로드 순서: shared_data.js 다음에 로드하세요.
// ============================================================


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
    // 아라드 오션브리즈[플래티넘], 던전밥, 란마 1/2[플래티넘]
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
모든 직업 15~70레벨 스킬Lv+1(TP스킬 제외)
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
    // 차원 여행자, 차원 이동자
    V10: {
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
    V11: {
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
데미지 20% 증가`,
        desc: ``,
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
    V12: {
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
모든 속성 강화 +10
공격 시 10% 추가 데미지`,
        desc: ``,
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
            {stats: ['공격 시 추가 데미지'], amount: 10, unit: '%'},
        ],
    },
};

const TITLE_ITEM_INFO = {
    // 기본정보
    // 힘, 지능 +33
    // 체력, 정신력 +22
    // 공격속도 +2%
    // 캐스팅속도 +2%
    // 이동속도 +2%
    // 물리 크리티컬 +30
    // 마법 크리티컬 +30
    // ---
    // 효과
    // HP MAX +220
    // 모든 속성 강화 +10
    // 데미지 10% 증가
    // 공격 시 1% 확률로 무색 큐블 조각 1개를 소모하여 30초간 힘 30, 지능 30, 체력 20, 정신력 20, 공격속도 5%, 캐스팅속도 5%, 이동속도 5% 증가합니다.`,
    "우리들의 Arcade": _TITLE_TEMPLATES.V1,
    "2nd Anniversary 칭호": _TITLE_TEMPLATES.V1,
    "신수의 가호 - 쾌청": _TITLE_TEMPLATES.V1,

    // 기본정보
    // 힘, 지능 +33
    // 체력, 정신력 +22
    // 공격속도 +2%
    // 캐스팅속도 +3%
    // 이동속도 +2%
    // 물리 크리티컬 +30
    // 마법 크리티컬 +30
    // ---
    // 효과
    // HP MAX +220
    // 모든 속성 강화 +3
    // 데미지 15% 증가
    // 공격 시 1% 확률로 무색 큐블 조각 1개를 소모하여 30초간 힘 30, 지능 30, 체력 20, 정신력 20, 공격속도 5%, 캐스팅속도 5%, 이동속도 5% 증가합니다.`,
    "우리함께 Arcade": _TITLE_TEMPLATES.V2,
    "3rd Anniversary": _TITLE_TEMPLATES.V2,

    // 기본정보
    // 힘 +32
    // 지능 +32
    // 정신력 +32
    // 공격속도 +2%
    // 캐스팅속도 +3%
    // 이동속도 +2%
    // ---
    // 효과
    // HP MAX +55
    // MP MAX +110
    // 수속성 저항 +7
    // 수속강 +3
    "천해의 수호자": _TITLE_TEMPLATES.V3,

    // 기본정보
    // 힘, 지능, 체력, 정신력 +18
    // 공격속도 +1.5%
    // 캐스팅속도 +2.2%
    // 이동속도 +1.5%
    "Specialist": _TITLE_TEMPLATES.V4,


    // 기본정보
    // 힘, 지능, 체력, 정신력 +8
    "안톤:공대 참전자": _TITLE_TEMPLATES.V5,

    // 기본정보
    // 힘 +32
    // 지능 +32
    // 체력 +32
    // 정신력 +32
    // 공격속도 +2%
    // 캐스팅속도 +3%
    // 이동속도 +2%
    // ---
    // 효과
    // HP MAX +55
    // MP MAX +110
    // 화속성 저항 +7
    // 화속강 +3
    "안톤 정복자": _TITLE_TEMPLATES.V6,

    // 기본정보
    // 힘, 지능 +66
    // 체력, 정신력 +33
    // 공격속도 +5%
    // 캐스팅속도 +7%
    // 이동속도 +5%
    // 물리 크리티컬 +30
    // 마법 크리티컬 +30
    // ---
    // 효과
    // HP MAX +220
    // 모든 속성 강화 +3
    // 데미지 20% 증가
    "우리모두 Arcade": _TITLE_TEMPLATES.V7,
    "4th Anniversary": _TITLE_TEMPLATES.V7,

    // 기본정보
    // 힘, 지능 +66
    // 체력, 정신력 +33
    // 공격속도 +5%
    // 캐스팅속도 +7%
    // 이동속도 +5%
    // 물리 크리티컬 +30
    // 마법 크리티컬 +30
    // ---
    // 효과
    // HP MAX +220
    // 모든 속성 강화 +3
    // 마을 이동속도 증가 +10%
    // 모든 직업 15~70레벨 스킬Lv+1(TP스킬 제외)
    // 데미지 20% 증가
    "아라드 오션브리즈[플래티넘]": _TITLE_TEMPLATES.V8,
    "던전밥": _TITLE_TEMPLATES.V8,
    "코스믹 히치하이커": _TITLE_TEMPLATES.V8,
    "란마 1/2[플래티넘]": _TITLE_TEMPLATES.V8,
    "Noblesse Oblige[플래티넘]": _TITLE_TEMPLATES.V8,

    "원탁의 기사 [白] (확인 필요)": _TITLE_TEMPLATES.V8,


    // 기본정보
    // 힘, 지능 +66
    // 체력, 정신력 +33
    // 공격속도 +5%
    // 캐스팅속도 +7%
    // 이동속도 +5%
    // 물리 크리티컬 +30
    // 마법 크리티컬 +30
    // ---
    // 효과
    // HP MAX +220
    // 모든 속성 강화 +3
    // 모든 직업 15~70레벨 스킬Lv+1(TP스킬 제외)
    // 데미지 15% 증가
    "아라드 선라이즈": _TITLE_TEMPLATES.V9,
    "아라드 선셋": _TITLE_TEMPLATES.V9,


    // 기본정보
    // 힘, 지능 +66
    // 체력, 정신력 +33
    // 공격속도 +5%
    // 캐스팅속도 +7%
    // 이동속도 +5%
    // 물리 크리티컬 +30
    // 마법 크리티컬 +30
    // ---
    // 효과
    // HP MAX +220
    // 모든 속성 강화 +3
    // 데미지 15% 증가
    "차원 여행자": _TITLE_TEMPLATES.V10,
    "차원 이동자": _TITLE_TEMPLATES.V10,

    // 기본정보
    // 힘, 지능 +66
    // 체력, 정신력 +33
    // 공격속도 +5%
    // 캐스팅속도 +7%
    // 이동속도 +5%
    // 물리 크리티컬 +30
    // 마법 크리티컬 +30
    // ---
    // 효과
    // HP MAX +220
    // 모든 속성 강화 +3
    // 마을 이동속도 증가 +10%
    // 데미지 20% 증가
    "Ultimate Dignity 2.0": _TITLE_TEMPLATES.V11,

    // 기본정보
    // 힘, 지능 +66
    // 체력, 정신력 +33
    // 공격속도 +5%
    // 캐스팅속도 +7%
    // 이동속도 +5%
    // 물리 크리티컬 +30
    // 마법 크리티컬 +30
    // ---
    // 효과
    // HP MAX +220
    // 모든 속성 강화 +10
    // 공격 시 10% 추가 데미지
    "이상한 나라의 래빗": _TITLE_TEMPLATES.V12,
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
적중 +80`,
        base: [
            { stats: ['힘', '지능', '체력', '정신력'], amount: 24, unit: ''},
            { stats: ['적중'], amount: 80, unit: ''},
        ]
    },
    // 극한을 정복한 자, 코스믹 스피어, 마르실의 소생 마법 오라, 천상의 문 오라
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
    // 극한을 이겨낸 자, 체인질링 오라, 광기의 물결 오라, 차원 스캐너(알파), 차원 스캐너(베타)
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
    //기본정보
    // 힘, 지능, 체력, 정신력 +45
    // 물리 크리티컬 +110
    // 마법 크리티컬 +110
    // ---
    // 효과
    // 화속강 +8
    // 수속강 +8
    // 암속강 +8
    // 명속강 +8
    "우리들의 Arcade 오라":  _AURA_TEMPLATES.V1,
    "2nd Anniversary 오라": _AURA_TEMPLATES.V1,

    // 기본정보
    // 힘, 지능, 체력, 정신력 +50
    // 물리 크리티컬 확률 +2%
    // 마법 크리티컬 확률 +2%
    // 물리 크리티컬 +130
    // 마법 크리티컬 +130
    // ---
    // 효과
    // 모든 속성 강화 +10
    // 마을 이동속도 증가 +5%
    // 데미지 5% 증가
    "우리모두 Arcade 오라":  _AURA_TEMPLATES.V2,
    "3rd Anniversary 오라": _AURA_TEMPLATES.V2,
    "4rd Anniversary 오라": _AURA_TEMPLATES.V2,
    "Ultimate 2.0 오라": _AURA_TEMPLATES.V2,
    "행운을 넘어선 행복 오라": _AURA_TEMPLATES.V2,

    // 기본정보
    // 힘, 지능, 체력, 정신력 +45
    // 물리 크리티컬 +110
    // 마법 크리티컬 +110
    // ---
    // 효과
    // 모든 속성 강화 +8
    "해방전력 오라": _AURA_TEMPLATES.V3,

    // 기본정보
    // 힘, 지능, 체력, 정신력 +9
    "성안의 봉인 오라": _AURA_TEMPLATES.V4,
    "검의 기억 오라": _AURA_TEMPLATES.V4,
    "즐거운 새로움이 가득한 오라": _AURA_TEMPLATES.V4,
    "혼돈의 조각": _AURA_TEMPLATES.V4,
    "천해의 지배": _AURA_TEMPLATES.V4,
    "신목의 정복자 오라": _AURA_TEMPLATES.V4,
    "탈태의 요람": _AURA_TEMPLATES.V4,
    "허상의 눈": _AURA_TEMPLATES.V4,
    "일렉트로닉 플레임": _AURA_TEMPLATES.V4,
    "공업지대의 악몽": _AURA_TEMPLATES.V4,
    "포효하는 번개 오라": _AURA_TEMPLATES.V4,

    // 기본정보
    // 힘, 지능, 체력, 정신력 +24
    // 적중 +80
    "눈꽃 오라": _AURA_TEMPLATES.V5,

    // 기본정보
    // 힘, 지능, 체력, 정신력 +50
    // 물리 크리티컬 확률 +5%
    // 마법 크리티컬 확률 +5%
    // 물리 크리티컬 +130
    // 마법 크리티컬 +130
    // ---
    // 효과
    // 모든 속성 강화 +10
    // 마을 이동속도 증가 +5%
    // 데미지 7% 증가
    "극한을 정복한 자": _AURA_TEMPLATES.V6,
    "코스믹 스피어": _AURA_TEMPLATES.V6,
    "마르실의 소생 마법 오라": _AURA_TEMPLATES.V6,
    "천상의 문 오라": _AURA_TEMPLATES.V6,

    // 기본정보
    // 힘, 지능, 체력, 정신력 +50
    // 물리 크리티컬 +130
    // 마법 크리티컬 +130
    // ---
    // 효과
    // 모든 속성 강화 +10
    "극한을 이겨낸 자": _AURA_TEMPLATES.V7,
    "체인질링 오라": _AURA_TEMPLATES.V7,
    "광기의 물결 오라": _AURA_TEMPLATES.V7,
    "차원 스캐너(알파)": _AURA_TEMPLATES.V7,
    "차원 스캐너(베타)": _AURA_TEMPLATES.V7,
    "란마 1/2 오라 - 적호": _AURA_TEMPLATES.V7,
    "란마 1/2 오라 - 청룡": _AURA_TEMPLATES.V7,
    "천계의 음양": _AURA_TEMPLATES.V7,
    "해변의 청량한 파도": _AURA_TEMPLATES.V7,
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
힘, 지능, 체력, 정신력 +50
물리 크리티컬 +130
마법 크리티컬 +130
---
효과
모든 속성 강화 +10
`,
        base: [
            { stats: ['힘', '지능', '체력', '정신력'], amount: 50, unit: '' },
            { stats: ['물리 크리티컬', '마법 크리티컬'], amount: 130, unit: '' },
        ],
        eff: [
            { stats: ['모든 속성 강화'], amount: 10, unit: '' },
        ]
    },

    WA_V18: {
        info: `기본정보
힘, 지능, 체력, 정신력 +18
`,
        base: [
            { stats: ['힘', '지능', '체력', '정신력'], amount: 18, unit: '' },
        ],
        eff: []
    },
    WA_V11: {
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
    // 기본정보
    // 힘, 지능, 체력, 정신력 +18
    // ---
    // 효과
    // 물리 공격력 5% 증가
    // 마법 공격력 5% 증가
    "블루 레몬 에이드": _WEAPON_AVATAR_TEMPLATES.WA_V1,
    "클래식 코튼 글러브": _WEAPON_AVATAR_TEMPLATES.WA_V1,
    "청룡의 무기": _WEAPON_AVATAR_TEMPLATES.WA_V1,
    "티라미수 케이크": _WEAPON_AVATAR_TEMPLATES.WA_V1,
    "아이스 아메리카노(포장)": _WEAPON_AVATAR_TEMPLATES.WA_V1,

    // 기본정보
    // 힘, 지능, 체력, 정신력 +18
    // ---
    // 효과
    // 물리 공격력 3% 증가
    // 마법 공격력 3% 증가
    "황천의 구도자 무기": _WEAPON_AVATAR_TEMPLATES.WA_V2,
    "명계의 구도자 무기": _WEAPON_AVATAR_TEMPLATES.WA_V2,
    "흐려진 어둠의 염원 무기": _WEAPON_AVATAR_TEMPLATES.WA_V2,

    // 기본정보
    // 힘, 지능, 체력, 정신력 +18
    // ---
    // 효과
    // 공격 시 5% 추가 데미지
    "무형의 무기": _WEAPON_AVATAR_TEMPLATES.WA_V3,
    "기사단의 무기": _WEAPON_AVATAR_TEMPLATES.WA_V3,
    "생명의 나무 무기": _WEAPON_AVATAR_TEMPLATES.WA_V3,
    "홈쇼핑 공구세트 무기": _WEAPON_AVATAR_TEMPLATES.WA_V3,
    "디멘션 사복검": _WEAPON_AVATAR_TEMPLATES.WA_V3,
    "수행자의 도": _WEAPON_AVATAR_TEMPLATES.WA_V3,
    "차원 과학자의 무기": _WEAPON_AVATAR_TEMPLATES.WA_V3,

    // 기본정보
    // 힘, 지능, 체력, 정신력 +50
    // 물리 크리티컬 +130
    // 마법 크리티컬 +130
    // ---
    // 효과
    // 모든 속성 강화 +10
    "그린 커서": _WEAPON_AVATAR_TEMPLATES.WA_V4,

    // 힘, 지능, 체력, 정신력 +18
    "주부 9단 후라이팬": _WEAPON_AVATAR_TEMPLATES.WA_V18,
    "계란말이란 말이오": _WEAPON_AVATAR_TEMPLATES.WA_V18,
    "샐러드용 당근 통파": _WEAPON_AVATAR_TEMPLATES.WA_V18,
    "토메이토 토마토": _WEAPON_AVATAR_TEMPLATES.WA_V18,
    "아이스 쵸코 바닐라": _WEAPON_AVATAR_TEMPLATES.WA_V18,
    "신선한 유기농 옥수수": _WEAPON_AVATAR_TEMPLATES.WA_V18,
    "따끈한 웰던 스테이크": _WEAPON_AVATAR_TEMPLATES.WA_V18,
    "한입 가득 산적 꼬치": _WEAPON_AVATAR_TEMPLATES.WA_V18,
    "냉동 화덕 피자": _WEAPON_AVATAR_TEMPLATES.WA_V18,

    "파인애플맛 막대사탕": _WEAPON_AVATAR_TEMPLATES.WA_V18,
    "프리스트의 검정색 장미 토템": _WEAPON_AVATAR_TEMPLATES.WA_V18,
    "프리스트의 장미 토템": _WEAPON_AVATAR_TEMPLATES.WA_V18,
    "글렌 시보그의 머스켓": _WEAPON_AVATAR_TEMPLATES.WA_V18,
    "옵티머스의 무기 아바타": _WEAPON_AVATAR_TEMPLATES.WA_V18,
    "모디스의 미사일 런처": _WEAPON_AVATAR_TEMPLATES.WA_V18,
    "크림슨로제의 무기 아바타": _WEAPON_AVATAR_TEMPLATES.WA_V18,

    // 힘, 지능, 체력, 정신력 +11
    "사랑 가득 마법봉": _WEAPON_AVATAR_TEMPLATES.WA_V11,
    "명부의 구도자 무기": _WEAPON_AVATAR_TEMPLATES.WA_V11,
    "특제 고블린 몽둥이": _WEAPON_AVATAR_TEMPLATES.WA_V11,
    "흑도 : 쿠로이츠키의 형상": _WEAPON_AVATAR_TEMPLATES.WA_V11,
    "천해의 형상 무기": _WEAPON_AVATAR_TEMPLATES.WA_V11,
    "방천극의 형상": _WEAPON_AVATAR_TEMPLATES.WA_V11,
    "롤리팝": _WEAPON_AVATAR_TEMPLATES.WA_V11,
    "스카사의 만년빙": _WEAPON_AVATAR_TEMPLATES.WA_V11,
    "레이저 홀릭의 형상": _WEAPON_AVATAR_TEMPLATES.WA_V11,
    "말이야? 당근이지!": _WEAPON_AVATAR_TEMPLATES.WA_V11,
    "빛의 리볼버 - 라이트 익스펜션": _WEAPON_AVATAR_TEMPLATES.WA_V11,
    "물약 스태프": _WEAPON_AVATAR_TEMPLATES.WA_V11,
    "강인한 푸른빛 기타": _WEAPON_AVATAR_TEMPLATES.WA_V11,
    "하이퍼리온의 형상": _WEAPON_AVATAR_TEMPLATES.WA_V11,
    "오카리나": _WEAPON_AVATAR_TEMPLATES.WA_V11,
    "여왕의 간식": _WEAPON_AVATAR_TEMPLATES.WA_V11,
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

console.log("✅ shared_data_seal.js 로드 완료");
