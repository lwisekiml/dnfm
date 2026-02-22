/**
 * ============================================================
 * logic.test.js — DNF Mobile 장비 관리 유닛 테스트
 * ============================================================
 *
 * 실행 방법:
 *   node --test logic.test.js
 *
 * 필요 조건:
 *   - Node.js 18 이상 (node:test 내장 모듈 사용)
 *   - 같은 폴더에 package.json { "type": "module" } 필요
 *   - logic.js 가 같은 폴더에 있어야 함
 *
 * 테스트 구조:
 *   describe() : 관련 테스트를 묶는 그룹 (=테스트 스위트)
 *   test()     : 개별 테스트 케이스 하나
 *   assert.*   : 기댓값과 실제값을 비교, 다르면 에러 throw → 테스트 실패
 * ============================================================
 */

// ============================================================
// import 섹션
// ============================================================

// Node.js 18+ 에 내장된 테스트 프레임워크. 별도 설치 불필요.
// describe: 테스트 그룹, test: 개별 케이스
import { test, describe } from 'node:test';

// Node.js 내장 단언(assertion) 모듈.
// '/strict' 를 붙이면 == 대신 === 로 비교하는 엄격 모드.
import assert from 'node:assert/strict';

// 테스트 대상: logic.js 에서 필요한 것만 골라서 가져옴
import {
    LEGACY_PREFIX_SETS, EXCEED_TAGS, EXCEED_SLOTS,
    ARMOR_SETS, ACCESSORY_SETS, ALL_SETS, ALL_PREFIX,
    ARMOR_EXCEED_ONLY, ACCESSORY_EXCEED_ONLY,
    makePrefixKey, isExceedName, getGroupKey, getSetType,
    calcTotalDistinctParts, incrementCount, decrementCount,
    sortByName, sortByJob, getSetType3or5,
} from './logic.js';


// ============================================================
// 테스트 헬퍼
// ============================================================

/**
 * 테스트용 캐릭터 객체 생성기.
 *
 * 왜 필요한가?
 *   calcTotalDistinctParts, incrementCount 등은 캐릭터 객체를 인자로 받는다.
 *   매 테스트마다 직접 만들면 코드가 길어지므로 이 함수로 간단히 생성.
 *
 * @param {object} armorCounts - 미리 넣어둘 아이템 데이터
 *                               예: { "말괄량이 상의": 1 }
 *                               기본값은 빈 객체 (아무것도 없는 캐릭터)
 * @returns {{ id, name, job, armorCounts, updateTimes }}
 *
 * 사용 예:
 *   const char = makeChar({});                          // 빈 캐릭터
 *   const char = makeChar({ "말괄량이 상의": 2 });      // 상의 2개 보유
 */
function makeChar(armorCounts = {}) {
    return { id: 'c1', name: '테스트', job: '귀검사', armorCounts, updateTimes: {} };
}


// ============================================================
// 1. makePrefixKey 테스트
//    접두어 키를 올바르게 생성하는지 검증.
//    특히 레거시 세트에서 "레거시: 레거시: XXX" 가 되지 않는지가 핵심.
// ============================================================
describe('makePrefixKey', () => {

    test('일반 세트 → "접두어: 세트명" 형식 반환', () => {
        // 일반 세트는 "전격: 말괄량이" 형태가 되어야 함
        assert.equal(
            makePrefixKey('전격', '어느 말괄량이의 탐사복'),
            '전격: 어느 말괄량이의 탐사복'
        );
    });

    test('일반 세트 — 다른 접두어도 동일 패턴', () => {
        assert.equal(
            makePrefixKey('작열', '포이즈닝 퀸 스파이더'),
            '작열: 포이즈닝 퀸 스파이더'
        );
    });

    test('레거시 방어구 세트 → setName 그대로 반환 (중복 접두어 방지)', () => {
        // ❌ 잘못된 결과: "레거시: 레거시: 마력의 소용돌이"
        // ✅ 올바른 결과: "레거시: 마력의 소용돌이"  (세트명 그대로)
        assert.equal(
            makePrefixKey('레거시', '레거시: 마력의 소용돌이'),
            '레거시: 마력의 소용돌이'
        );
    });

    test('레거시 방어구 두 번째 세트도 동일', () => {
        assert.equal(
            makePrefixKey('레거시', '레거시: 자연의 수호자'),
            '레거시: 자연의 수호자'
        );
    });

    test('레거시 악세 첫 번째 세트', () => {
        assert.equal(
            makePrefixKey('레거시', '레거시: 에테리얼 리베넌트'),
            '레거시: 에테리얼 리베넌트'
        );
    });

    test('레거시 악세 두 번째 세트', () => {
        assert.equal(
            makePrefixKey('레거시', '레거시: 지나온 영광의 시대'),
            '레거시: 지나온 영광의 시대'
        );
    });

    test('모든 LEGACY_PREFIX_SETS 항목에 대해 중복 접두어 없음', () => {
        // 4개 레거시 세트 전체를 한 번에 순회해서 검증
        for (const setName of LEGACY_PREFIX_SETS) {
            const key = makePrefixKey('레거시', setName);
            // 반환값이 세트명 자체와 같아야 함
            assert.equal(key, setName, `${setName} 키 중복 발생`);
            // 혹시라도 "레거시: 레거시:" 로 시작하면 버그
            assert.ok(!key.startsWith('레거시: 레거시:'), `중복 접두어 발생: ${key}`);
        }
    });
});


// ============================================================
// 2. isExceedName 테스트
//    아이템 키가 "[선봉/의지/이상] ..." 형태인지 판별하는 정규식 검증.
// ============================================================
describe('isExceedName', () => {

    // --- true 가 나와야 하는 케이스 ---

    test('[선봉] 접두어 → true', () => {
        // assert.ok(값) : 값이 truthy 면 통과
        assert.ok(isExceedName('[선봉] 레거시: 마력의 소용돌이 상의'));
    });

    test('[의지] 접두어 → true', () => {
        assert.ok(isExceedName('[의지] 어느 말괄량이의 탐사복 상의'));
    });

    test('[이상] 접두어 → true', () => {
        assert.ok(isExceedName('[이상] 포이즈닝 퀸 스파이더 상의'));
    });

    // --- false 가 나와야 하는 케이스 ---

    test('일반 아이템명 → false', () => {
        // assert.ok(!값) : 값이 falsy 면 통과
        assert.ok(!isExceedName('어느 말괄량이의 탐사복 상의'));
    });

    test('접두어 아이템명 → false', () => {
        assert.ok(!isExceedName('전격: 어느 말괄량이의 탐사복 상의'));
    });

    test('레거시 접두어 아이템명 → false', () => {
        // "레거시: ..." 는 익시드가 아니라 접두어 아이템
        assert.ok(!isExceedName('레거시: 마력의 소용돌이 상의'));
    });

    test('빈 문자열 → false', () => {
        assert.ok(!isExceedName(''));
    });

    test('공백이 없는 괄호 형식은 false (패턴 불일치)', () => {
        // 정규식이 "[태그] " (공백 포함) 를 요구하므로 공백 없으면 false
        // "[선봉]레거시..." 처럼 공백 없는 경우는 잘못된 데이터이므로 false 가 맞음
        assert.ok(!isExceedName('[선봉]레거시: 마력의 소용돌이 상의'));
    });

    test('EXCEED_TAGS 전체 검증 (선봉/의지/이상 모두 인식)', () => {
        // EXCEED_TAGS 배열을 순회해서 세 태그 모두 정상 인식되는지 확인
        for (const tag of EXCEED_TAGS) {
            assert.ok(isExceedName(`[${tag}] 어느 세트명 상의`), `태그 [${tag}] 인식 실패`);
        }
    });
});


// ============================================================
// 3. getGroupKey 테스트
//    "[선봉] XXX" 에서 "[선봉] " 부분을 제거하고 "XXX" 만 반환하는지 검증.
// ============================================================
describe('getGroupKey', () => {

    test('익시드 접두어 제거 → 베이스 키 반환', () => {
        assert.equal(
            getGroupKey('[선봉] 레거시: 마력의 소용돌이 상의'),
            '레거시: 마력의 소용돌이 상의'  // "[선봉] " 이 제거됨
        );
    });

    test('[의지] 제거', () => {
        assert.equal(
            getGroupKey('[의지] 어느 말괄량이의 탐사복'),
            '어느 말괄량이의 탐사복'
        );
    });

    test('괄호 없는 문자열은 그대로 반환', () => {
        // 일반 아이템은 변경 없이 그대로
        assert.equal(
            getGroupKey('어느 말괄량이의 탐사복 상의'),
            '어느 말괄량이의 탐사복 상의'
        );
    });

    test('접두어 키 → 변경 없이 반환', () => {
        // "전격: ..." 은 익시드 태그가 아니라 접두어 키이므로 변경 없음
        assert.equal(
            getGroupKey('전격: 어느 말괄량이의 탐사복'),
            '전격: 어느 말괄량이의 탐사복'
        );
    });
});


// ============================================================
// 4. getSetType 테스트
//    세트 이름으로 ARMOR / ACCESSORY / SPECIAL 을 올바르게 판별하는지 검증.
// ============================================================
describe('getSetType', () => {

    test('방어구 세트 → ARMOR', () => {
        // 하나의 test() 안에 여러 assert 를 넣을 수 있음
        assert.equal(getSetType('어느 말괄량이의 탐사복'), 'ARMOR');
        assert.equal(getSetType('콰트로 카시테움'), 'ARMOR');
    });

    test('악세서리 세트 → ACCESSORY', () => {
        assert.equal(getSetType('엘팅 메모리얼의 기억'), 'ACCESSORY');
        assert.equal(getSetType('콰트로 마누스 연산장치'), 'ACCESSORY');
    });

    test('특수장비 세트 → SPECIAL', () => {
        assert.equal(getSetType('개구쟁이 호문쿨루스'), 'SPECIAL');
        assert.equal(getSetType('부정한 빛의 우상'), 'SPECIAL');
    });

    test('레거시 방어구 세트 → ARMOR', () => {
        // 레거시 세트도 카테고리 판별이 정확해야 함
        assert.equal(getSetType('레거시: 마력의 소용돌이'), 'ARMOR');
        assert.equal(getSetType('레거시: 자연의 수호자'), 'ARMOR');
    });

    test('레거시 악세서리 세트 → ACCESSORY', () => {
        assert.equal(getSetType('레거시: 에테리얼 리베넌트'), 'ACCESSORY');
        assert.equal(getSetType('레거시: 지나온 영광의 시대'), 'ACCESSORY');
    });
});


// ============================================================
// 5. calcTotalDistinctParts 테스트
//    이 프로젝트의 핵심 비즈니스 로직.
//    "같은 슬롯이면 종류 무관 1개" 규칙이 올바르게 동작하는지 검증.
// ============================================================
describe('calcTotalDistinctParts', () => {

    // ── 일반 세트 ──────────────────────────────────────────

    test('아무것도 없으면 0', () => {
        const char = makeChar({}); // 빈 캐릭터
        assert.equal(calcTotalDistinctParts(char, '어느 말괄량이의 탐사복'), 0);
    });

    test('일반 상의 1개 보유 → 1', () => {
        // armorCounts 에 "세트명 슬롯" 형태의 키로 저장됨
        const char = makeChar({ '어느 말괄량이의 탐사복 상의': 1 });
        assert.equal(calcTotalDistinctParts(char, '어느 말괄량이의 탐사복'), 1);
    });

    test('일반 상의+하의 보유 → 2', () => {
        const char = makeChar({
            '어느 말괄량이의 탐사복 상의': 1,
            '어느 말괄량이의 탐사복 하의': 1,
        });
        assert.equal(calcTotalDistinctParts(char, '어느 말괄량이의 탐사복'), 2);
    });

    test('같은 슬롯을 일반+접두어로 보유해도 1로만 카운트', () => {
        // 상의를 "일반 상의" 와 "전격 접두어 상의" 두 종류 보유해도
        // 상의 슬롯은 1개로만 카운트됨 (고유 슬롯 기준)
        const char = makeChar({
            '어느 말괄량이의 탐사복 상의': 1,
            '전격: 어느 말괄량이의 탐사복 상의': 1,
        });
        assert.equal(calcTotalDistinctParts(char, '어느 말괄량이의 탐사복'), 1);
    });

    test('5개 슬롯 전부 보유 → 5', () => {
        const char = makeChar({
            '어느 말괄량이의 탐사복 상의': 1,
            '어느 말괄량이의 탐사복 하의': 1,
            '어느 말괄량이의 탐사복 어깨': 1,
            '어느 말괄량이의 탐사복 벨트': 1,
            '어느 말괄량이의 탐사복 신발': 1,
        });
        assert.equal(calcTotalDistinctParts(char, '어느 말괄량이의 탐사복'), 5);
    });

    // ── 레거시 세트 ────────────────────────────────────────
    // 레거시 세트는 일반 행이 없고 접두어(레거시)로만 존재함.
    // 키 형식: "레거시: 마력의 소용돌이 상의" (중복 접두어 없이)

    test('레거시 세트 — 아무것도 없으면 0', () => {
        const char = makeChar({});
        assert.equal(calcTotalDistinctParts(char, '레거시: 마력의 소용돌이'), 0);
    });

    test('레거시 세트 — 올바른 키("레거시: 마력의 소용돌이 상의")로 카운트됨', () => {
        // 레거시 세트의 저장 키는 "레거시: 마력의 소용돌이 상의" 형태
        const char = makeChar({ '레거시: 마력의 소용돌이 상의': 1 });
        assert.equal(calcTotalDistinctParts(char, '레거시: 마력의 소용돌이'), 1);
    });

    test('레거시 세트 — 잘못된 키("레거시: 레거시: ...")는 카운트 안 됨 (버그 방지)', () => {
        // 리팩터링 전의 버그 키: "레거시: 레거시: 마력의 소용돌이 상의"
        // 이 키는 함수가 인식하지 못해야 함 → 결과 0
        const wrongKey = '레거시: 레거시: 마력의 소용돌이 상의';
        const char = makeChar({ [wrongKey]: 5 }); // 5개나 있어도
        assert.equal(calcTotalDistinctParts(char, '레거시: 마력의 소용돌이'), 0);
    });

    test('레거시 세트 — 익시드 키("[선봉] 레거시: 마력의 소용돌이 상의") 카운트됨', () => {
        // 상의는 ARMOR 의 익시드 슬롯이므로 인식됨
        const char = makeChar({ '[선봉] 레거시: 마력의 소용돌이 상의': 1 });
        assert.equal(calcTotalDistinctParts(char, '레거시: 마력의 소용돌이'), 1);
    });

    test('레거시 세트 — 익시드 키가 하의에 있으면 카운트 안 됨', () => {
        // 하의는 익시드 슬롯이 아님 (ARMOR 익시드는 상의만)
        // "[선봉] 레거시: 마력의 소용돌이 하의" 는 존재하지 않는 키이므로 0
        const char = makeChar({ '[선봉] 레거시: 마력의 소용돌이 하의': 1 });
        assert.equal(calcTotalDistinctParts(char, '레거시: 마력의 소용돌이'), 0);
    });

    test('레거시 세트 — 5슬롯 전부 접두어로 보유 → 5', () => {
        const char = makeChar({
            '레거시: 마력의 소용돌이 상의': 1,
            '레거시: 마력의 소용돌이 하의': 1,
            '레거시: 마력의 소용돌이 어깨': 1,
            '레거시: 마력의 소용돌이 벨트': 1,
            '레거시: 마력의 소용돌이 신발': 1,
        });
        assert.equal(calcTotalDistinctParts(char, '레거시: 마력의 소용돌이'), 5);
    });

    // ── 악세서리 세트 ──────────────────────────────────────

    test('악세서리 세트 — 팔찌 보유 → 1', () => {
        const char = makeChar({ '엘팅 메모리얼의 기억 팔찌': 1 });
        assert.equal(calcTotalDistinctParts(char, '엘팅 메모리얼의 기억'), 1);
    });

    test('악세서리 세트 — 3슬롯 전부 → 3', () => {
        const char = makeChar({
            '엘팅 메모리얼의 기억 팔찌': 1,
            '엘팅 메모리얼의 기억 목걸이': 1,
            '엘팅 메모리얼의 기억 반지': 1,
        });
        assert.equal(calcTotalDistinctParts(char, '엘팅 메모리얼의 기억'), 3);
    });
});


// ============================================================
// 6. incrementCount / decrementCount 테스트
//    카운트 증감의 경계값(음수 방지, 없는 키 처리 등) 검증.
// ============================================================
describe('incrementCount / decrementCount', () => {

    // describe 안에서 공통으로 쓸 상수 선언
    const KEY = '어느 말괄량이의 탐사복 상의';

    test('없는 키를 increment → 1', () => {
        const char = makeChar({}); // 아무것도 없는 캐릭터
        incrementCount(char, KEY);
        // (undefined || 0) + 1 = 1 이 되어야 함
        assert.equal(char.armorCounts[KEY], 1);
    });

    test('연속 increment → 누적', () => {
        const char = makeChar({});
        incrementCount(char, KEY); // 1
        incrementCount(char, KEY); // 2
        incrementCount(char, KEY); // 3
        assert.equal(char.armorCounts[KEY], 3);
    });

    test('decrement → 1 감소', () => {
        const char = makeChar({ [KEY]: 3 }); // 3개에서 시작
        decrementCount(char, KEY);
        assert.equal(char.armorCounts[KEY], 2); // 2가 됨
    });

    test('decrement — 0 미만으로 내려가지 않음', () => {
        // 이미 0인 상태에서 감소해도 0 유지
        const char = makeChar({ [KEY]: 0 });
        decrementCount(char, KEY);
        assert.equal(char.armorCounts[KEY], 0); // -1 이 되면 안 됨
    });

    test('decrement — 없는 키도 0 유지', () => {
        // 키 자체가 없는 상태에서 감소 → Math.max(0, -1) = 0
        const char = makeChar({});
        decrementCount(char, KEY);
        assert.equal(char.armorCounts[KEY], 0);
    });

    test('increment 후 decrement → 원복', () => {
        const char = makeChar({ [KEY]: 2 });
        incrementCount(char, KEY); // 2 → 3
        decrementCount(char, KEY); // 3 → 2
        assert.equal(char.armorCounts[KEY], 2); // 원래대로
    });
});


// ============================================================
// 7. sortByName / sortByJob 테스트
//    정렬 결과와 원본 불변성 검증.
// ============================================================
describe('sortByName', () => {

    // describe 안에서 공통으로 쓸 입력 배열
    // 일부러 가나다 역순으로 배치
    const chars = [
        { name: '다람쥐', job: '마법사' },
        { name: '가나다', job: '귀검사' },
        { name: '나비',   job: '거너'   },
    ];

    test('이름 가나다순 정렬', () => {
        const sorted = sortByName(chars);
        // 정렬 결과 확인
        assert.equal(sorted[0].name, '가나다');
        assert.equal(sorted[1].name, '나비');
        assert.equal(sorted[2].name, '다람쥐');
    });

    test('원본 배열 변경 없음 (불변)', () => {
        // sortByName 은 [...characters] 로 복사 후 정렬하므로 원본이 바뀌면 안 됨
        sortByName(chars);
        assert.equal(chars[0].name, '다람쥐'); // 원본 첫 번째는 그대로 '다람쥐'
    });

    test('빈 배열 → 빈 배열', () => {
        // assert.deepEqual: 배열/객체 내용을 깊이 비교
        assert.deepEqual(sortByName([]), []);
    });

    test('1개짜리 배열 → 그대로', () => {
        const result = sortByName([{ name: '혼자', job: '도적' }]);
        assert.equal(result[0].name, '혼자');
    });
});

describe('sortByJob', () => {

    const chars = [
        { name: '나전사',   job: '워리어' },
        { name: '가궁수',   job: '거너'   },
        { name: '다마법',   job: '마법사' },
        { name: '라거너2',  job: '거너'   }, // 가궁수와 같은 직업
    ];

    test('직업 가나다순 정렬', () => {
        const sorted = sortByJob(chars);
        // 거너(가) < 마법사(마) < 워리어(워) 순서
        assert.equal(sorted[0].job, '거너');
        assert.equal(sorted[2].job, '마법사');
        assert.equal(sorted[3].job, '워리어');
    });

    test('같은 직업 내에서 이름순 정렬', () => {
        const sorted = sortByJob(chars);
        // 거너 2명: "가궁수" 와 "라거너2" → 이름 가나다순으로 가궁수가 먼저
        const gunners = sorted.filter(c => c.job === '거너');
        assert.equal(gunners[0].name, '가궁수');
        assert.equal(gunners[1].name, '라거너2');
    });

    test('원본 불변', () => {
        sortByJob(chars);
        assert.equal(chars[0].name, '나전사'); // 원본 첫 번째 그대로
    });
});


// ============================================================
// 8. getSetType3or5 테스트
//    완성도 비율(60%, 100%)에 따른 3셋/5셋 판별 경계값 검증.
// ============================================================
describe('getSetType3or5', () => {

    const SET = '어느 말괄량이의 탐사복'; // 5슬롯짜리 세트

    test('0/5 → null (미완성)', () => {
        assert.equal(getSetType3or5(0, SET), null);
    });

    test('2/5 (40%) → null (3셋 미달)', () => {
        // 60% 미만이므로 null
        assert.equal(getSetType3or5(2, SET), null);
    });

    test('3/5 (60%) → 3 (3셋 달성)', () => {
        // 정확히 60% = 경계값 → 3셋
        assert.equal(getSetType3or5(3, SET), 3);
    });

    test('4/5 (80%) → 3 (5셋 미달, 3셋 유지)', () => {
        assert.equal(getSetType3or5(4, SET), 3);
    });

    test('5/5 (100%) → 5 (5셋 달성)', () => {
        assert.equal(getSetType3or5(5, SET), 5);
    });

    test('악세서리 3슬롯 세트 — 2/3(66%) → 3', () => {
        // 3슬롯 세트에서 2개 보유: 66% → 3셋
        const ASET = '엘팅 메모리얼의 기억';
        assert.equal(getSetType3or5(2, ASET), 3);
    });

    test('악세서리 3슬롯 세트 — 3/3(100%) → 5', () => {
        const ASET = '엘팅 메모리얼의 기억';
        assert.equal(getSetType3or5(3, ASET), 5);
    });

    test('알 수 없는 세트명 → null', () => {
        // ALL_SETS 에 없는 세트명은 슬롯이 0 → null 반환
        assert.equal(getSetType3or5(3, '존재하지않는세트'), null);
    });
});


// ============================================================
// 9. 상수 무결성 검증
//    데이터 상수들이 올바른 구조를 갖추고 있는지 검증.
//    리팩터링 후에도 데이터가 깨지지 않았는지 확인하는 용도.
// ============================================================
describe('상수 무결성', () => {

    test('LEGACY_PREFIX_SETS 4개 정확히 존재', () => {
        // 레거시 세트는 방어구 2개 + 악세 2개 = 총 4개
        assert.equal(LEGACY_PREFIX_SETS.length, 4);
    });

    test('LEGACY_PREFIX_SETS 항목이 ALL_SETS에 존재', () => {
        // 레거시 세트가 세트 목록에 등록되어 있는지 확인
        // assert.ok(값) : 값이 truthy(존재) 면 통과
        for (const name of LEGACY_PREFIX_SETS) {
            assert.ok(ALL_SETS[name], `${name} 이 ALL_SETS에 없음`);
        }
    });

    test('LEGACY_PREFIX_SETS 항목이 ALL_PREFIX에 있고 접두어가 ["레거시"]', () => {
        for (const name of LEGACY_PREFIX_SETS) {
            assert.ok(ALL_PREFIX[name], `${name} 이 ALL_PREFIX에 없음`);
            // 레거시 세트의 접두어는 정확히 ["레거시"] 하나여야 함
            assert.deepEqual(ALL_PREFIX[name], ['레거시'], `${name} 의 접두어가 레거시가 아님`);
        }
    });

    test('ARMOR_EXCEED_ONLY 와 ACCESSORY_EXCEED_ONLY 가 빈 배열', () => {
        // 레거시 리팩터링의 핵심 변경: 이전에는 레거시 세트가 여기 있었지만
        // 접두어 방식으로 바뀌면서 이 배열들이 비워졌어야 함
        assert.deepEqual(ARMOR_EXCEED_ONLY, []);
        assert.deepEqual(ACCESSORY_EXCEED_ONLY, []);
    });

    test('EXCEED_TAGS 가 ["선봉","의지","이상"] 3개', () => {
        assert.deepEqual(EXCEED_TAGS, ['선봉', '의지', '이상']);
    });

    test('EXCEED_SLOTS 각 타입 슬롯 정확', () => {
        // 방어구-상의, 악세-팔찌, 특수-귀걸이만 익시드 슬롯
        assert.deepEqual(EXCEED_SLOTS.ARMOR,     ['상의']);
        assert.deepEqual(EXCEED_SLOTS.ACCESSORY, ['팔찌']);
        assert.deepEqual(EXCEED_SLOTS.SPECIAL,   ['귀걸이']);
    });

    test('모든 ARMOR_SETS 항목은 5슬롯', () => {
        // 방어구는 상의/하의/어깨/벨트/신발 정확히 5개여야 함
        for (const [name, slots] of Object.entries(ARMOR_SETS)) {
            assert.equal(slots.length, 5, `${name}: 슬롯 수가 5가 아님 (${slots.length})`);
        }
    });

    test('모든 ACCESSORY_SETS 항목은 3슬롯', () => {
        // 악세서리는 팔찌/목걸이/반지 정확히 3개여야 함
        for (const [name, slots] of Object.entries(ACCESSORY_SETS)) {
            assert.equal(slots.length, 3, `${name}: 슬롯 수가 3이 아님 (${slots.length})`);
        }
    });
});