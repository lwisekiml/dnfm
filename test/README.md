## JS 테스트 (`logic.js` + `logic.test.js`)

### 구조 개요

```
logic.js          ← 테스트 대상 (순수 로직)
logic.test.js     ← 테스트 코드
package.json      ← { "type": "module" } 한 줄
```

`logic.js`는 원본 HTML의 `<script>` 블록에서 DOM을 건드리지 않는 함수들만 뽑아낸 파일입니다. `export`로 내보내고, `logic.test.js`에서 `import`해서 씁니다.

---

### logic.js 핵심 구조

```js
// 데이터 상수 정의
const ARMOR_SETS = { "어느 말괄량이의 탐사복": ["상의","하의",...], ... };
const LEGACY_PREFIX_SETS = ["레거시: 마력의 소용돌이", ...];

// 로직 함수들
function makePrefixKey(pref, setName) { ... }
function isExceedName(name) { ... }
function calcTotalDistinctParts(char, baseSetName) { ... }
// ...

// 마지막에 전부 export
export { ARMOR_SETS, makePrefixKey, isExceedName, ... };
```

테스트하려면 함수가 파일 밖에서 보여야 하기 때문에 `export`가 필요합니다. 원본 HTML에는 export가 없으니 logic.js를 따로 만든 이유입니다.

---

### logic.test.js 핵심 구조

```js
// Node.js 내장 테스트 모듈 import (설치 불필요)
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// 테스트 대상 함수 import
import { makePrefixKey, isExceedName, ... } from './logic.js';

// 테스트 헬퍼
function makeChar(armorCounts = {}) {
    return { id: 'c1', name: '테스트', job: '귀검사', armorCounts, updateTimes: {} };
}

// 테스트 작성
describe('makePrefixKey', () => {       // 그룹 묶기
    test('일반 세트 → 접두어: 세트명', () => {
        assert.equal(
            makePrefixKey('전격', '어느 말괄량이의 탐사복'),
            '전격: 어느 말괄량이의 탐사복'
        );
    });
});
```

`describe`는 관련 테스트를 묶는 그룹, `test`는 개별 케이스입니다. `assert`는 기댓값과 실제값을 비교해서 다르면 에러를 던집니다.

---

### assert 메서드 사용 현황

| 메서드 | 용도 | 사용 예 |
|---|---|---|
| `assert.equal(a, b)` | `a === b` 확인 | 함수 반환값 비교 |
| `assert.ok(val)` | `val`이 truthy인지 | 정규식 결과 등 |
| `assert.deepEqual(a, b)` | 배열/객체 내용 비교 | 상수 배열 검증 |

---

## HTML 테스트 (`test_runner.html`)

Node.js가 없는 환경을 위해 같은 테스트를 **브라우저에서 실행**할 수 있게 만든 파일입니다. 파일 하나에 모든 것이 들어있습니다.

### 파일 내부 구조 (3개 블록이 순서대로)

```
<script>
  ① logic.js 내용 (인라인)
  ② 미니 테스트 프레임워크 (describe/test/assert 직접 구현)
  ③ logic.test.js의 테스트 케이스 (인라인)
</script>
```

---

### ② 미니 프레임워크 — Node의 `node:test`를 직접 흉내냄

```js
// 등록 저장소
const _suites = [];
let _currentSuite = null;

// describe 호출 시 → _suites 배열에 추가
function describe(name, fn) {
    _currentSuite = { name, tests: [] };
    _suites.push(_currentSuite);
    fn();           // 안에 있는 test()들이 즉시 실행되며 등록됨
    _currentSuite = null;
}

// test 호출 시 → 현재 suite의 tests 배열에 추가 (실행은 아직 안 함)
function test(name, fn) {
    _currentSuite.tests.push({ name, fn });
}

// assert 호환 레이어 — Node의 assert와 동일한 인터페이스
const assert = {
    equal(a, b, msg)     { if (a !== b) throw new Error(...); },
    deepEqual(a, b, msg) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(...); },
    ok(val, msg)         { if (!val) throw new Error(...); },
};
```

`describe`/`test`/`assert`의 시그니처가 Node.js와 똑같아서 `logic.test.js`의 테스트 코드를 import 부분만 제거하고 그대로 가져다 쓸 수 있습니다.

---

### 실행 흐름 (버튼 클릭 시)

```
runAll() 호출
    └─ _suites 순회
        └─ 각 test의 fn() 실행
            ├─ 성공 → pass 카운트 +1
            └─ 실패 → fail 카운트 +1, 에러 메시지 저장
    └─ DOM에 결과 렌더링
        ├─ 실패한 suite → 자동으로 펼쳐짐
        └─ 진행률 바 업데이트
```

---

### JS와 HTML 테스트의 차이점 요약

| | `logic.test.js` | `test_runner.html` |
|---|---|---|
| 실행 환경 | Node.js 터미널 | 브라우저 |
| 프레임워크 | Node.js 내장 `node:test` | 직접 구현한 미니 프레임워크 |
| 모듈 시스템 | ES Module (`import/export`) | 인라인 `<script>` (전역 스코프) |
| 테스트 케이스 | 동일 67개 | 동일 67개 |
| 결과 출력 | 터미널 TAP 포맷 | 브라우저 UI |

테스트 케이스 자체는 완전히 동일하고, 실행 환경과 프레임워크만 다릅니다.