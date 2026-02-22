# RPG 장비 관리 시스템 - 개발 내용 정리

---

## 수정된 파일 목록

| 파일 | 내용 |
|---|---|
| `ui-memo-tag.js` | 메모/설명 팝업 기능 전반 |
| `ui-character.js` | 잠금/해제 시 팝업 처리 |
| `ui-search.js` | 검색 메모/태그 항목 추가 |
| `index.html` | 설명칸 textarea 변환 |
| `styles.css` | 참고용 (수치칸, 마법부여 너비 변수) |

---

## 1. 메모 팝업 (ui-memo-tag.js)

### 잠금 상태에서 메모 클릭 시 읽기 전용 모달 표시
- 기존: 잠금 상태에서 메모 클릭 시 아무 동작 없음
- 변경: 읽기 전용 모달 팝업 표시 (🔒 잠금 표시, 닫기 버튼만 제공)

### 팝업 설정 변수 분리 (MEMO_POPUP / DESC_POPUP)
- 메모와 설명 팝업 설정을 파일 상단에서 한 번에 관리
- 실제로 사용되는 값만 변수로 선언

```javascript
const MEMO_POPUP = {
    width:        '350px',
    background:   '#1a1a1a',
    border:       '3px solid #ffd700',
    borderRadius: '8px',
    padding:      '15px',
    boxShadow:    '0 8px 32px rgba(0, 0, 0, 0.9)',
    zIndex:       '1000',
    textareaHeight:     '120px',
    textareaBg:         '#0a0a0a',
    textareaBorder:     '2px solid #444',
    textareaFontSize:   '13px',
    readonlyMinHeight:  '120px',
    readonlyMaxHeight:  '200px',  // 초과 시 스크롤
    readonlyBg:         '#0a0a0a',
    readonlyBorder:     '2px solid #333',
};

const DESC_POPUP = {
    // MEMO_POPUP과 동일한 구조, 값만 다름
    textareaHeight:     '100px',
    readonlyMinHeight:  '60px',
    readonlyMaxHeight:  '200px',
    ...
};
```

### 잠금 모드 읽기전용 영역 스크롤
- 내용이 많을 경우 팝업이 무한정 커지는 문제 수정
- `max-height` + `overflow-y: auto`로 세로 길이 제한 후 스크롤 처리
- `readonlyMaxHeight` 변수로 조절 가능

---

## 2. 설명칸 팝업 (ui-memo-tag.js)

### openDescModal() 함수 추가
- 모든 `_desc` 필드(장비, 스킬룬, 크리쳐, 칭호, 오라/아바타)에 `onclick="openDescModal(this)"` 적용
- 잠금 상태: 읽기 전용 표시
- 해제 상태: textarea로 편집 가능, 저장 시 `autoSave()` 호출

### 팝업 위치 자동 조정
- 화면 오른쪽 벗어남 → 왼쪽으로 이동
- 화면 아래 벗어남 → input 위로 이동
- 최소 여백 5px 유지

---

## 3. 설명칸 textarea 변환 (index.html)

- `input type="text"` → `textarea`로 변경 (4개 필드)
- 줄바꿈(`\n`) 저장/표시 지원
- 셀 내부: 첫 줄만 보임 (`overflow: hidden`)
- 팝업: 전체 내용 편집 가능 (`resize: vertical`)

---

## 4. 잠금/해제 시 팝업 처리 (ui-character.js)

### toggleEdit() 수정
- 잠금 버튼 클릭 시 열려있는 팝업 자동 처리
- 기존: 그냥 닫기 (`closeDescModal`, `closeMemoModal`)
- 변경: **저장 후 닫기** (`saveDescFromModal`, `saveMemoFromModal`)
  - 글 작성 중 잠금 시 내용 유실 방지

```javascript
// 설명/메모 팝업이 열려있으면 저장 후 닫기
if (typeof saveDescFromModal === 'function') saveDescFromModal();
if (typeof saveMemoFromModal === 'function') saveMemoFromModal();
```

---

## 5. 검색 메모/태그 항목 추가 (ui-search.js)

### 슬롯 선택 목록 마지막에 메모/태그 추가
- 선택 시 아래 형식으로 표시

| 직업/이름 | 메모 | 태그 |
|---|---|---|
| 귀검사(홍길동) | 메모 내용... | #레이드\n#보스 |

- 태그는 세로로 표시 (`\n` join + `white-space: pre-wrap`)

---

## 6. CSS 너비 관련 참고 (styles.css)

### 수정 가능한 너비 변수
```css
--width-val-short: 35px;   /* 수치칸 (마법봉인 수치, 강화 등) */
--width-enchant:   55px;   /* 마법부여 이름칸 */
```

### 테이블 너비 동작 방식
- 기본 표: `width: max-content` → 칸이 커지면 표도 같이 커짐
- 비교 표: `width: 100%` + `table-layout: fixed` → 표 크기 고정, 칸이 커지면 다른 칸이 줄어듦

---

## 7. 구글 드라이브 저장 (취소됨)

- `file://` 프로토콜에서는 Google OAuth 동작 불가
- 로컬 서버(`http://`) 환경 필요
- 기능 구현 후 `file://` 환경 문제로 **없던 걸로 처리**

---

## 8. 세트 자동 적용 기능 (ui-core.js, ui-character.js, styles.css)

### 최종 구현 방식
- `아이템이름` 헤더(th)에 🎯 버튼 추가
- 버튼 클릭 시 방어구 / 악세서리 / 특수장비 세트 목록이 섹션별로 표시
- 세트 선택 시 해당 슬롯 전체에 아이템 자동 입력

### 주요 함수 (ui-core.js)

```javascript
// 헤더 버튼 클릭 시 세트 목록 팝업 표시
function openSetMenuFromHeader(event, charId) { ... }

// 슬롯에 맞는 아이템 찾기 - itemOptions 기반, 마지막 매칭(B 아이템) 반환
function getMatchedItemForSlot(slot, itemList) {
    const slotOptions = itemOptions[slot] || [];
    let matched = null;
    itemList.forEach(item => {
        if (slotOptions.includes(item)) matched = item;
    });
    return matched;
}

// 세트 아이템 전체 적용
function applySetItems(charId, slotType, setsMap, setName) { ... }
```

### 세트 데이터 구조 참고
- 방어구: `[상의A, 상의B, 하의, 어깨, 벨트, 신발]` → 상의B 적용
- 악세: `[팔찌A, 팔찌B, 목걸이, 반지]` → 팔찌B 적용
- 특장: `[귀걸이A, 귀걸이B, 마법석, 보조장비]` → 귀걸이B 적용

### 겪었던 문제들
- 우클릭/롱프레스 방식 시도 → 모바일에서 메뉴가 뜨자마자 닫히는 문제
  - 원인: `outsideHandler`가 버튼 클릭 이벤트 버블링을 잡아서 즉시 닫힘
  - 해결: 헤더 th에 버튼을 두는 방식으로 변경
- 아이템이름 칸 크기 제각각 문제
  - 원인: 버튼을 칸 안에 넣으면서 wrapper div가 생겨 레이아웃이 깨짐
  - 해결: 버튼을 th로 옮겨서 td는 건드리지 않음
- 세트 선택해도 적용 안 되는 문제
  - 원인: `section.innerHTML` 템플릿 리터럴 안에 `'{CHAR_ID}'` 문자열이 치환되지 않아 실제 charId 대신 `{CHAR_ID}` 그대로 전달됨
  - 해결: `'${charId}'`로 수정

### CSS 추가 (styles.css)
```css
.set-apply-btn {
    background: none;
    border: none;
    padding: 0 2px;
    cursor: pointer;
    font-size: 11px;
    opacity: 0.5;
}
.set-apply-btn:hover { opacity: 1; }
```

---

## 9. 접두어 일괄 적용 기능 (ui-core.js, ui-character.js)

- `접두어` 헤더(th)에 🎯 버튼 추가
- 버튼 클릭 시 방어구 / 악세서리 / 특수장비 접두어 목록이 섹션별로 표시
- 선택 시 해당 슬롯 전체에 일괄 적용


```javascript
function openPrefixMenuFromHeader(event, charId) { ... }
function applyPrefixToSlots(charId, slots, prefix) { ... }
```

---

## 10. 강화 일괄 적용 기능 (ui-core.js, ui-character.js)

- `강화` 헤더(th)에 🎯 버튼 추가
- 버튼 클릭 시 +1 ~ +20 목록 표시
- 선택 시 방어구 / 악세서리 / 특수장비 전체 슬롯에 일괄 적용

```javascript
function openReinforceMenuFromHeader(event, charId) { ... }
function applyReinforceToSlots(charId, slots, value) { ... }
```

---

## 11. 비교 캐릭터 선택지 분류 (ui-compare.js)

- 기존 단순 목록 → 힘/지능 × 화/수/명/암속강 기준으로 그룹 분류
- disabled option으로 구분선 표시 (`── 힘 ──`, `  화속강`)
- 스탯/속강 미설정 캐릭터는 `── 기타 ──` 그룹으로 분류
- 힘/지능 헤더 앞에 빈 줄 추가하여 시각적 구분

---

## 12. 비교 레이아웃 3열 구조로 전면 재작성 (ui-compare.js, styles.css)

### 구조 변경
- 기존: 단일 테이블 (좌측 데이터 | 비교값 | 우측 데이터)
- 변경: **3열 Flex 레이아웃** (좌측 div | 중앙 고정 div | 우측 div)
- 비교값(차이) 칸이 화면 정중앙 고정, 양옆 테이블이 화면 크기에 따라 반응형으로 축소

### 주요 함수 (ui-compare.js)
```javascript
function createCompareSection(...) { ... }  // 3열 섹션 생성
function buildSideTable(headers, rows, side) { ... }  // 좌/우 테이블 생성
function buildCenterTable(label, rows) { ... }  // 중앙 비교값 테이블 생성
function syncRowHeights(leftTable, centerTable, rightTable) { ... }  // 행 높이 동기화
function buildEquipmentCompare(...) { ... }
function buildSealCompare(...) { ... }
function buildEmblemCompare(...) { ... }
function buildEnchantCompare(...) { ... }
```

### 열 순서
- 장비: 좌 `슬롯|희귀도|익시드|접두어|아이템이름|강화` / 우 `강화|아이템이름|접두어|익시드|희귀도|슬롯` (대칭)
- 마법봉인: 좌 `슬롯|옵션|수치` / 우 `수치|옵션|슬롯` (대칭)
- 엠블렘: 좌우 모두 `슬롯|엠블렘1|엠블렘2` (동일)
- 마법부여: 좌 `슬롯|마법부여|수치` / 우 `수치|마법부여|슬롯` (대칭)

### CSS 추가 (styles.css)
```css
.compare-three-col { display: flex; align-items: flex-start; width: 100%; }
.compare-side { flex: 1; min-width: 0; overflow-x: auto; }
.compare-center { flex: 0 0 130px; width: 130px; }
```

### 겪었던 문제
- 단일 테이블에서 컬럼 수가 달라 `width: 8%`가 섹션별로 다르게 렌더링됨
- `table-layout: fixed` + `width: 100%` 조합에서 px 고정도 효과 없음
- HTML 테이블 구조 한계 → Flex 3열 레이아웃으로 근본 해결
- `requestAnimationFrame`으로 DOM 렌더링 후 행 높이 동기화하여 좌/중/우 행 높이 일치

---

## 13. 전체 코드 품질 개선 (ui-core.js, ui-character.js, ui-compare.js, storage.js, main.js)

### 수정 내용

**ui-core.js**
- `console.log("✅ ui-core.js 로드 완료")` 위치를 파일 중간(535번)에서 파일 맨 끝으로 이동
  - 중간에 있으면 아래 함수들이 존재하는지 파악이 어려움
- 함수 순서 재정렬: 호출하는 함수와 호출받는 함수를 쌍으로 붙임
  - 기존: `openPrefixMenuFromHeader` → `openReinforceMenuFromHeader` → `applyReinforceToSlots` → `applyPrefixToSlots`
  - 변경: `openPrefixMenuFromHeader` → `applyPrefixToSlots` → `openReinforceMenuFromHeader` → `applyReinforceToSlots`
- `applyPrefixToSlots` 함수 주석 누락 → 추가
- 접두어/강화 메뉴 섹션 구분선(`// ====`) 추가
- `checkSetColor` 주석의 `⭐` 제거

**ui-character.js**
- 개발 임시 주석 정리: `⭐ 태그 데이터 초기화 추가`, `⭐ 태그 복원 추가`, `⭐ 메모 미리보기 업데이트 추가`, `✅ 수정됨!` 등 → 일반 주석으로 변경
- `delete AppState.charTags[charId]` 뒤 `// ⭐ 추가` 제거

**ui-compare.js**
- `CompareTable = {}` 빈 객체 제거
  - 3열 레이아웃으로 전면 재작성 후 실제로 사용되지 않는 코드였음

**storage.js**
- `// ⭐ 추가` 주석 2곳 제거

**main.js**
- `typeof AppState !== 'undefined'` 방어 코드 전부 제거
  - `AppState`는 `state.js`에서 항상 전역으로 선언되며, `index.html`에서 `state.js`가 먼저 로드되므로 `main.js` 실행 시점에 항상 존재
  - 없을 수 없는 변수를 매번 `typeof`로 체크하면 코드가 길어지고 혼란을 줌
