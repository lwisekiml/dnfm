# DNF Mobile 통합 장비 관리 - 개발 로그

> 이 파일은 project1(상세입력), project2(장비관리), 통합 작업의 전체 개발 기록을 포함합니다.

---

## [통합 이전] project1 개발 기록

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

---

## [통합 이전] project2 개발 기록

---

## 2026-02-22

### 1. 세트 이름 칸 가로 너비 개선 (`equipment.js`)

**변경 전**
- 방어구/악세/특장 모든 표의 세트 이름 열이 전역 `globalSetNameWidth` 값으로 통일 적용

**변경 후**
- `calcNameWidth()` 헬퍼 함수 추가 (Canvas API로 실제 텍스트 렌더링 너비 측정)
- 표1(일반/접두어)과 표2(익시드) 각각 해당 표에 실제 들어가는 행 이름들 기준으로 너비 개별 계산
  - 표1: `"일반"`, 접두어 이름들 중 가장 긴 것 기준
  - 표2: `"[선봉] 불굴"`, `"[의지] 숙련"` 등 익시드 행 이름 기준

---

### 2. 표 글자 가운데 정렬 (`equipment.js`)

**변경 전**
- 세트 이름 첫 번째 열 td가 `text-align:left`

**변경 후**
- 방어구/악세/특장 표의 세트 이름 열 전체 `text-align:center` 로 통일
- 적용 위치: `createEquipmentRow()`, 익시드 행 `tr.innerHTML` 생성부 (총 8곳)

---

### 3. 표 헤더에 슬롯 이름 추가 표시 (`equipment.js`)

**변경 전**
- 헤더에 아이템 이름만 표시
  ```
  | 어느 말괄량이의 가죽 자켓 | 어느 말괄량이의 버블 반바지 | ...
  ```

**변경 후**
- 헤더 상단에 슬롯 이름(회색 소자), 하단에 아이템 이름 표시
  ```
  |        상의         |          하의          | ...
  | 어느 말괄량이의 가죽 자켓 | 어느 말괄량이의 버블 반바지 | ...
  ```
- 적용 대상: 방어구 표2 `headerSlots2`, 악세 표1 `headerSlots1`, 특장 표1 `headerSlots1` (3곳)
- 슬롯 이름 스타일: `color:#888; font-size:0.85em;`

---

### 4. 최근 업데이트 팝업 아이템 이름 개선 (`weapon.js`)

**변경 전**
- 아이템 열에 세트 이름(저장 키)이 그대로 표시
  ```
  철갑을 두른 탑의 수호꾼
  초석: 신비로운 빛의 소용돌이
  [의지] 조화: 신비로운 빛의 소용돌이
  ```

**변경 후**
- 실제 아이템 이름을 앞에, 세트 이름을 괄호 안 회색으로 표시
- 접두어/익시드 태그는 아이템 이름 앞에 붙임
  ```
  메탈기어의 조작부 (철갑을 두른 탑의 수호꾼)
  초석: 은색의 별빛 (신비로운 빛의 소용돌이)
  [의지] 조화: 시린 달빛 (신비로운 빛의 소용돌이)
  ```
- **JSON 데이터 구조 변경 없음** - 표시 시점에만 변환, 기존 저장 데이터 호환 유지
- 구현 방식:
  - `showRecentUpdates()`에서 `ARMOR_DISPLAY_NAMES` / `ACCESSORY_DISPLAY_NAMES` / `SPECIAL_DISPLAY_NAMES` 조회
  - 배열 슬롯(익시드/일반 구분)은 `fullKey.startsWith('[')` 으로 판별
  - 조회 실패 시 `realItemName = null` → 기존 표시 방식 fallback
  - `renderUpdatePage()`에서 `displayItemCell` 로 최종 조합하여 렌더링

---

### 메모

- 로컬스토리지 용량: 캐릭터 20명 / 업데이트 약 1,280건 기준 **약 190KB** 수준으로 여유 있음 (한도 5MB)
- updateTimes는 count가 0이 되어도 삭제되지 않고 계속 누적되는 구조 → 향후 "count 0 항목 정리" 기능 추가 검토

---

## [통합 이후] 개발 기록

---

## 2026-02-22

### 데이터 통합 1단계: 공유 파일 분리 및 eq_data.js 정리

**배경**
- project1(`index.html`)과 project2(`eq_index.html`)를 하나로 통합하는 작업 시작
- 두 프로젝트가 같은 세트명/아이템명 데이터를 각자 별도로 관리하고 있어 중복 제거 필요

---

### 1. 신규 파일 3개 생성 (`shared/` 폴더)

#### `shared/shared_data.js`

두 프로젝트 공통 세트/아이템명 데이터를 통합.

| 포함 내용 | 출처 |
|---|---|
| `ARMOR_SETS`, `ACCESSORY_SETS`, `SPECIAL_SETS` | eq_data.js |
| `ARMOR_PREFIX`, `ACCESSORY_PREFIX`, `SPECIAL_PREFIX` | eq_data.js |
| `ARMOR_DISPLAY_NAMES`, `ACCESSORY_DISPLAY_NAMES`, `SPECIAL_DISPLAY_NAMES` | eq_data.js |
| `ACCESSORY_EXTRA_INFO`, `SPECIAL_EXTRA_INFO` | eq_data.js |
| `ALL_SETS`, `ALL_PREFIX`, `LEGACY_PREFIX_SETS`, `makePrefixKey()` | eq_data.js |
| `sealData` | data.js |
| `armorSets`, `accSets`, `specialSets` | data.js (DISPLAY_NAMES에서 자동 생성) |
| `itemOptions` | data.js (DISPLAY_NAMES에서 자동 생성) |
| `GameData` | data.js (호환 객체) |

**레거시 아이템명 통일 기준**
- 기존 `eq_data.js`의 `ARMOR_DISPLAY_NAMES`는 레거시 아이템명에서 `"레거시: "` 접두어를 제거한 방식이었음
- `data.js`의 `itemOptions`는 `"레거시: 휘몰아치는 마력의 태풍"` 처럼 접두어 포함 방식
- `ui-core.js`의 `checkSetColor()`가 `armorSets[setName].includes(itemName)` 으로 세트 색상 체크하므로 저장 데이터와 불일치 발생 가능
- **`data.js` 기준(`"레거시: "` 접두어 포함)으로 통일** → project2 표시 시에는 세트명에서 `replace(/^레거시:\s*/, '')` 처리하므로 영향 없음

#### `shared/shared_constants.js`

양쪽 공통 상수 통합.

| 포함 내용 | 출처 |
|---|---|
| `SHARED_SLOTS`, `SHARED_HEAVY_BORDER_SLOTS` | constants.js |
| `SLOT_TYPES` (방어구/악세/특수 슬롯 분류) | utils.js의 SlotUtils |
| `SHARED_ARMOR_PREFIXES`, `SHARED_ACC_PREFIXES`, `SHARED_SPEC_PREFIXES`, `SHARED_TIER_PREFIXES` | constants.js |
| `EXCEED_TAGS`, `EXCEED_SLOTS`, `EXCEED_COLOR_MAP` | eq_data.js |
| `SHARED_RARITY_COLORS` | constants.js + eq_data.js EXCEED_COLOR_MAP 통합 |
| `WEAPON_PREFIXES` ([광채]/[분쇄]/[선명]/[강타]) | eq_data.js |
| `SHARED_RUNE_NAMES`, `SHARED_RUNE_LEVELS`, `SHARED_RUNE_SKILL_LEVELS`, `SHARED_NO_SKILL_LV_RUNES` | constants.js |
| `SHARED_ELEMENT_EMB_LIST`, `SHARED_ART_OPTIONS` | constants.js |
| `STORAGE_KEYS` (project1/2 스토리지 키 분리 관리) | 신규 |
| `AppConstants` + 전역 별칭 전체 | constants.js (하위 호환) |

#### `shared/shared_weapon.js`

무기 데이터 분리.

| 포함 내용 | 출처 |
|---|---|
| `WEAPON_DATA_SLAYER/FIGHTER/GUNNER/MAGE/PRIEST/WARRIOR/LANCER/THIEF` | eq_data.js |
| `WEAPON_DATA_MAP`, `JOB_LIST` | eq_data.js |

---

### 2. `eq_data.js` 정리

shared 파일로 이관된 섹션 2(데이터 정의), 섹션 2.6(무기 데이터) 전체 제거.

**남긴 내용**
- 섹션 1: 전역 상태 변수 (`activeCharacterId`, `characters`, `currentFilter` 등)
- `ARMOR_EXCEED_ONLY`, `ACCESSORY_EXCEED_ONLY` : 빈 배열로 유지 (Node.js 테스트 export 블록에서 참조)
- 섹션 2(구 섹션 3): 초기 캐릭터 샘플 데이터

**제거된 내용 (shared로 이관)**
- `ARMOR_SETS`, `ARMOR_PREFIX`, `ARMOR_DISPLAY_NAMES`
- `ACCESSORY_SETS`, `ACCESSORY_PREFIX`, `ACCESSORY_DISPLAY_NAMES`, `ACCESSORY_EXTRA_INFO`
- `SPECIAL_SETS`, `SPECIAL_PREFIX`, `SPECIAL_DISPLAY_NAMES`, `SPECIAL_EXTRA_INFO`
- `ALL_SETS`, `ALL_PREFIX`, `LEGACY_PREFIX_SETS`, `makePrefixKey()`
- `EXCEED_TAGS`, `EXCEED_SLOTS`, `EXCEED_COLOR_MAP`
- `WEAPON_DATA_*`, `WEAPON_PREFIXES`, `WEAPON_DATA_MAP`, `JOB_LIST`

---

### 3. HTML 스크립트 로드 순서 변경

#### `index.html`

```html
<!-- 변경 전 -->
<script src="js/constants.js"></script>
<script src="js/data.js"></script>

<!-- 변경 후 -->
<script src="shared/shared_data.js"></script>
<script src="shared/shared_constants.js"></script>
<script src="shared/shared_weapon.js"></script>
```

- `constants.js`, `data.js` 는 `shared/` 파일들로 대체되어 더 이상 로드하지 않음
- 기존 코드가 참조하는 `AppConstants`, `GameData`, `armorSets`, `itemOptions` 등 모든 전역 별칭은 `shared_constants.js` / `shared_data.js` 에서 동일하게 제공하므로 하위 코드 수정 불필요

#### `eq_index.html`

```html
<!-- 변경 전 -->
<script src="scripts/eq_data.js"></script>
...

<!-- 변경 후 -->
<script src="shared/shared_data.js"></script>
<script src="shared/shared_constants.js"></script>
<script src="shared/shared_weapon.js"></script>
<script src="scripts/eq_data.js"></script>
...
```

- `eq_data.js` 앞에 shared 파일 3개 추가
- 정리된 `eq_data.js`는 전역 상태 변수만 선언하므로 shared 파일이 먼저 로드되어야 함

---

### 4. 영향받는 파일 없음

`eq_core.js`, `eq_character.js`, `eq_equipment.js`, `eq_weapon.js`, `eq_main.js` 및 project1의 모든 `ui-*.js`, `storage.js`, `main.js` 파일은 **수정하지 않음**.
shared 파일에서 기존 변수명을 그대로 제공하므로 참조 코드 수정 불필요.

---

### 다음 작업 예정

- 화면 통합: eq_index.html 탭 구조를 기준으로 project1 기능 탭 추가

---

## 2026-02-22 (2차)

### 화면 통합: eq_index.html + index.html 통합

---

### 1. 충돌 분석 결과

**함수 충돌**
- `saveJsonWithLocation()` 1개 — 두 프로젝트가 각자 구현 보유

**CSS 충돌**
- `.active` — 하위 선택자(`.btn-mode.active`, `.char-btn.active`)라 실제 충돌 없음
- `.positive` — 하위 선택자(`.compare-center-table td.positive`, `.num-btn.positive`)라 실제 충돌 없음
- `.modal-overlay` — 진짜 충돌. eq_main.css에 `justify-content`, `align-items` 추가 속성 있음

---

### 2. 신규 파일: `merged.html`

`eq_index.html`을 기반으로 project1 전체를 `[상세 입력]` 탭으로 추가.

**툴바 변경**
```
[캐릭터 관리] [무기 관리] [장비 관리] [제작]
→
[캐릭터 관리] [무기 관리] [장비 관리] [제작] [상세 입력]
```

**추가된 내용**
- `<div id="section-detail-view">` — project1 전체 HTML 포함
  - 컨트롤바 (JSON 저장/불러오기, 캐릭터 추가, 잠금, 비교/검색/태그 모드 버튼)
  - 비교 모드 UI (`#compareCharSelectionContainer`, `#compareContainer`)
  - 검색 모드 UI (`#searchContainer`)
  - 캐릭터 목록 (`#characterContainer`)
  - 스킬룬 모달, 히스토리 모달
  - 캐릭터 테이블 템플릿 6개 전체

**CSS 링크 변경**
```html
<!-- 변경 전 -->
<link rel="stylesheet" href="styles/eq_main.css">

<!-- 변경 후 -->
<link rel="stylesheet" href="styles/merged.css">
```

**스크립트 로드 순서**
```html
shared/shared_data.js → shared/shared_constants.js → shared/shared_weapon.js
→ scripts/eq_data.js ~ scripts/eq_main.js  (project2)
→ js/state.js ~ js/main.js                 (project1)
```

---

### 3. 수정된 파일: `eq_main.js`

**`switchTo()` 함수에 `detail` 탭 추가**
- sections/buttons 맵에 `'detail'` 키 추가
- `view === 'detail'` 분기 추가 → `restoreSavedData()` 호출

**`saveJsonWithLocation()` 제거**
- storage.js의 통합 버전으로 대체

---

### 4. 수정된 파일: `storage.js`

**`saveJsonWithLocation()` 통합**
- 현재 활성 탭 기준으로 스토리지 키 결정
  - `section-detail-view` 표시 중 → `STORAGE_KEYS.PROJECT1` (`dnfm_character_equipment_data`)
  - 그 외 탭 → `STORAGE_KEYS.PROJECT2` (`dnfm_eq`)
- 파일명도 탭에 따라 다르게 생성
  - project1: `dnfm_character_equipment_backup_YYYY-MM-DD.json`
  - project2: `dnfm_eq_backup_YYYY-MM-DD.json`
- backup 객체도 탭에 따라 다르게 구성
  - project1: `{ characters, history }` 형태
  - project2: localStorage 원본 그대로

---

### 5. 수정된 파일: `main.js`

**`window.onload` → `restoreSavedData()` 함수로 분리**
- `_p1Initialized` 플래그로 중복 실행 방지
- 통합 환경 감지: `document.getElementById('section-detail-view')` 존재 여부
  - 존재하면 → `switchTo('detail')` 진입 시 실행 (지연 초기화)
  - 없으면 → 기존 index.html 단독 실행 환경으로 판단하여 즉시 초기화

---

### 6. 신규 파일: `merged.css`

`styles.css`를 기반으로 `eq_main.css` 내용을 추가 통합.

**`.modal-overlay` 충돌 해결**
- styles.css 기존: `display:none; z-index: var(--z-overlay)` (1999)
- eq_main.css: `justify-content:center; align-items:center; z-index:1000`
- 통합 결과: 두 스타일 병합, z-index는 CSS 변수 기준(1999) 유지

**파일 구조**
```
merged.css = styles.css 전체
           + eq_main.css (.modal-overlay 제거 후 나머지)
```

---

### 적용 시 파일 구조

```
프로젝트 루트/
├── merged.html              ← 신규 (통합 진입점)
├── shared/
│   ├── shared_data.js
│   ├── shared_constants.js
│   └── shared_weapon.js
├── styles/
│   └── merged.css           ← 신규 (통합 CSS)
├── scripts/
│   ├── eq_data.js           ← 이전 작업에서 수정
│   ├── eq_main.js           ← 수정 (switchTo 추가, saveJsonWithLocation 제거)
│   └── ...나머지 eq_*.js
└── js/
    ├── storage.js           ← 수정 (saveJsonWithLocation 통합)
    ├── main.js              ← 수정 (restoreSavedData 분리, 통합 환경 분기)
    └── ...나머지 ui-*.js
```

---

## 2026-02-22 (3차)

### CSS 스코프 분리: project1 스타일이 project2 화면에 영향 주는 문제 수정

---

### 문제

`merged.css`는 `styles.css`(project1) + `eq_main.css`(project2)를 단순 합산한 구조였음.
`styles.css`의 `h2`, `h3`, `body` 등 전역 선택자와 `--gold` CSS 변수가 전역으로 선언되어,
[상세 입력] 탭 외의 탭(캐릭터 관리, 장비 관리 등)에도 금색 텍스트/가로선 등이 적용되는 문제 발생.

- `h2 { color: var(--gold); border-bottom: ... var(--gold); }` → 캐릭터 관리 탭의 [캐릭터] 제목에 금색 적용됨
- `--gold`, `--border-heavy` 등 CSS 변수가 `:root`(전역)에 선언되어 eq_main.css에서도 의도치 않게 참조 가능

---

### 해결 방법

**수정된 파일: `styles/merged.css`**

`styles.css` 파트의 스타일을 Python 스크립트로 자동 파싱하여 `#section-detail-view` 스코프로 한정.

```
[변경 전 구조]
merged.css = :root { ... }          ← 전역
           + styles.css 나머지      ← 전역 (문제)
           + eq_main.css            ← 전역

[변경 후 구조]
merged.css = :root { ... }                        ← 전역 (CSS 변수)
           + #section-detail-view { ... }         ← project1 스코프 한정
           + eq_main.css                          ← 전역 (project2)
```

**처리 규칙**
- `:root` 변수 블록 → 전역 유지 (eq_main.css에서도 필요한 변수 있을 수 있으므로)
- `body`, `html`, `*` 선택자 → `#section-detail-view`로 대체
- 일반 선택자 (`.control-bar`, `h2`, `table` 등) → `#section-detail-view .control-bar`, `#section-detail-view h2` 등으로 변환
- `@media` 쿼리 내부 선택자 → 동일하게 스코프 추가
- `@keyframes`, `@font-face` → 내부 수정 없이 그대로 유지
- eq_main.css 전체 → 그대로 전역 유지

**검증 결과**
- styles.css 파트 내 스코프 없이 남은 전역 선택자: 0개
- `#section-detail-view` 적용 줄 수: 361줄
- 전역 `body` 규칙: eq_main.css 파트 1개만 존재 (정상)

---

## 2026-02-22 (4차)

### 버그 수정: JSON 불러오기 후 데이터가 화면에 안 그려지는 문제 (근본 원인)

---

### 문제

`main.js`와 `ui-character.js`에 `restoreSavedData`라는 **동일한 함수명**이 존재.

| 파일 | 함수 시그니처 | 역할 |
|---|---|---|
| `main.js` | `restoreSavedData()` | 통합 환경 초기화 (localStorage → 화면 렌더) |
| `ui-character.js` | `restoreSavedData(section, savedData, charId)` | 캐릭터 테이블에 저장 데이터 채워넣기 |

스크립트 로드 순서: `ui-character.js` → `main.js` 순서로 로드되므로
`main.js`의 함수가 `ui-character.js`의 함수를 **덮어씀**.

결과: `createCharacterTable(savedData)` 내부에서 `restoreSavedData(section, savedData, charId)` 호출 시
실제로는 인자를 무시하는 `main.js` 버전이 실행되어 **데이터가 DOM에 채워지지 않음**.
alert는 뜨지만 화면에 데이터가 안 나타나는 현상의 원인.

---

### 수정 내용

`main.js`의 함수명을 `initProject1()`으로 변경하여 충돌 해소.

**수정된 파일: `main.js`**
- `function restoreSavedData()` → `function initProject1()`
- `window.addEventListener` 내 호출도 `initProject1()`으로 변경

**수정된 파일: `eq_main.js`**
- `switchTo('detail')` 내 호출: `restoreSavedData()` → `initProject1()`

---

---

## 프로젝트 파일 구조 (현재 기준)

```
project/
├── dev-log.md
├── eq_dev-log.md
├── eq_index.html
├── eq_README.md
├── index.html
├── merged.html
├── new-dev-log.md
├── package.json
├── QUICK-START.md
├── README-TEST.md
├── README.md
├── README_old.md
├── 강철화로의파편.png
├── 강화된데이터칩.png
├── 데이터칩.png
├── 마누스메모리얼.png
├── 망가진강철톱니바퀴.png
├── 망가진기계캡슐.png
├── 빛의저장소.png
├── 스펙쿨룸파편.png
├── css/
│   └── styles.css
├── js/
│   ├── constants.js
│   ├── data.js
│   ├── main.js
│   ├── state.js
│   ├── storage.js
│   ├── ui-character.js
│   ├── ui-compare.js
│   ├── ui-core.js
│   ├── ui-memo-tag.js
│   ├── ui-modal.js
│   ├── ui-rune.js
│   ├── ui-search.js
│   ├── ui-tag-filter.js
│   ├── ui-templates.js
│   └── utils.js
├── scripts/
│   ├── eq_character.js
│   ├── eq_core.js
│   ├── eq_data.js
│   ├── eq_equipment.js
│   ├── eq_main.js
│   └── eq_weapon.js
├── shared/
│   ├── shared_constants.js
│   ├── shared_data.js
│   └── shared_weapon.js
└── styles/
    ├── eq_main.css
    └── merged.css
```

---

---

## 데이터 통합 2단계: 두 프로젝트 데이터 완전 통합 계획

### 목표

현재 `merged.html`은 project1(상세 입력)과 project2(캐릭터/장비/무기/제작 관리)가 한 화면에 합쳐져 있지만, 데이터는 여전히 두 개의 로컬 스토리지 키와 두 가지 캐릭터 데이터 구조로 분리 관리되고 있다. 이를 하나의 통합된 데이터 구조와 하나의 JSON 파일로 완전히 합치는 것이 목표다.

---

### 현재 상태 (문제점)

**로컬 스토리지 키가 2개**
- `dnfm_character_equipment_data` — project1 전용 (상세 입력 데이터)
- `dnfm_eq` — project2 전용 (캐릭터/장비/무기/제작 데이터)

**캐릭터 데이터 구조가 완전히 다름**

project1 캐릭터 객체 (`dnfm_character_equipment_data`에 배열로 저장):
```json
{
  "id": "char_xxxxx",
  "locked": false,
  "inputs": {
    "상의_rarity": { "val": "에픽", "cls": "rare-에픽" },
    "상의_itemname": { "val": "어느 말괄량이의 탐사복 상의", "cls": "..." },
    ...
  },
  "runeData": {
    "runes": [ { "name": "", "lv": "", "skillLv": "" }, ... ],
    "gakin": ["", ""]
  },
  "tags": ["공략용", "메인"]
}
```

project2 캐릭터 객체 (`dnfm_eq`에 배열로 저장):
```json
{
  "id": "c1",
  "job": "검귀",
  "name": "강의",
  "armorCounts": {
    "어느 말괄량이의 탐사복 상의": 1,
    ...
  },
  "weaponCounts": {},
  "updateTimes": {
    "어느 말괄량이의 탐사복 상의": 1700000000000,
    ...
  },
  "craftMaterials": {}
}
```

→ project1에는 `job`, `name`이 없고, project2에는 `inputs`, `runeData`, `tags`가 없음.
→ 같은 캐릭터인데 id도 다르게 생성되어 연결고리가 없음.

---

### 통합 후 목표 데이터 구조

로컬 스토리지 키를 `dnfm_unified`(가칭) 하나로 통합하고, 캐릭터 객체에 양쪽 데이터를 모두 담는다.

```json
{
  "characters": [
    {
      "id": "char_xxxxx",
      "job": "검귀",
      "name": "강의",
      "locked": false,
      "inputs": { ... },
      "runeData": { ... },
      "tags": [],
      "armorCounts": { ... },
      "weaponCounts": {},
      "updateTimes": { ... },
      "craftMaterials": {}
    }
  ],
  "history": [ ... ]
}
```

---

### 개발 순서

#### 1단계: 캐릭터 데이터 구조 통합

**목표:** 두 프로젝트의 캐릭터 객체를 하나로 합친다.

**작업 내용:**
- project1의 `createCharacterTable()` (ui-character.js) — 캐릭터 생성 시 `job`, `name` 필드 추가
- project2의 `addCharacter()` (eq_character.js) — 캐릭터 생성 시 `inputs`, `runeData`, `tags` 필드 추가 (빈 값으로 초기화)
- 두 프로젝트가 같은 `id`를 공유하도록 id 생성 방식 통일

**영향 파일:** `js/ui-character.js`, `scripts/eq_character.js`

---

#### 2단계: localStorage 키 통합

**목표:** 저장/불러오기를 단일 키 `dnfm_unified`로 일원화한다.

**작업 내용:**
- `scripts/eq_core.js` — `saveLocalData()`, `loadLocalData()`의 키를 `dnfm_unified`로 변경, 저장 형식을 `{ characters, history }` 구조로 변경
- `js/storage.js` — `autoSave()`, `exportToJSON()` 등의 키를 `dnfm_unified`로 변경
- `js/state.js` — `AppConstants.STORAGE_KEY` 참조를 `dnfm_unified`로 변경
- `shared/shared_constants.js` — `STORAGE_KEYS` 및 `AppConstants.STORAGE_KEY` 값 변경
- 기존 `dnfm_character_equipment_data`, `dnfm_eq` 키로 저장된 데이터를 `dnfm_unified`로 **마이그레이션하는 1회성 코드** 추가 (기존 사용자 데이터 보존)

**영향 파일:** `scripts/eq_core.js`, `js/storage.js`, `js/state.js`, `shared/shared_constants.js`

---

#### 3단계: 캐릭터 추가/삭제 동기화

**목표:** 어느 탭에서 캐릭터를 추가/삭제해도 양쪽에 즉시 반영된다.

**작업 내용:**
- project2의 `addCharacter()` — 캐릭터 추가 시 project1의 `createCharacterTable()`도 함께 호출
- project1의 `createCharacterTable()` — 캐릭터 추가 시 project2의 `characters` 배열에도 추가
- project2의 `deleteCharacter()` — 삭제 시 project1의 DOM에서도 해당 캐릭터 제거
- project1의 `deleteCharacter()` — 삭제 시 project2의 `characters` 배열에서도 제거
- 중복 실행 방지 플래그 추가 (무한 루프 방지)

**영향 파일:** `scripts/eq_character.js`, `js/ui-character.js`

---

#### 4단계: JSON 저장/불러오기 통합

**목표:** 저장 버튼 하나로 모든 데이터(상세 입력 + 장비/무기/제작)가 담긴 JSON 하나를 저장하고, 불러오기 버튼 하나로 전체 복원된다.

**작업 내용:**
- `js/storage.js` — `exportToJSON()`, `saveJsonWithLocation()`, `importFromJSON()` 을 통합 구조 기준으로 수정
- `scripts/eq_main.js` — `exportJSON()`, `importJSON()` 제거 (storage.js 통합 버전으로 대체)
- `merged.html` — 중복된 저장/불러오기 버튼 정리 (상세 입력 탭 내부 버튼과 상단 툴바 버튼 중 하나로 통일)

**영향 파일:** `js/storage.js`, `scripts/eq_main.js`, `merged.html`

---

#### 5단계: 기록 + 최근 업데이트 합치기

**목표:** project1의 변경 기록(📜 기록)과 project2의 최근 업데이트(🌟 최근 업데이트)를 하나의 통합 히스토리로 관리한다.

**작업 내용:**
- 통합 히스토리 구조 설계 — 현재 두 기록의 항목 형식이 다르므로 공통 포맷 정의
  - project1 기록: `{ time, charName, slot, old, new }`
  - project2 업데이트: `{ itemName, charName, updateTime }` (추정)
- `js/state.js` — 히스토리 저장/불러오기를 통합 키 기준으로 수정
- `scripts/eq_main.js` — 최근 업데이트 렌더링 함수를 통합 히스토리 기준으로 수정
- `merged.html` — 기록/최근 업데이트 버튼 UI 통합

**영향 파일:** `js/state.js`, `scripts/eq_main.js`, `merged.html`

---

### 주의사항

- 각 단계는 **순서대로** 진행해야 한다. 특히 1단계(데이터 구조 통합)가 완료되어야 이후 단계가 가능하다.
- 2단계에서 기존 로컬 스토리지 데이터 마이그레이션 코드를 반드시 포함해야 기존 사용자 데이터가 유실되지 않는다.
- 3단계에서 캐릭터 추가/삭제 동기화 시 무한 루프(A→B→A→...) 방지를 위한 플래그 처리가 필요하다.
- 각 단계 완료 후 반드시 JSON 저장→새로고침→복원 흐름을 테스트한다.

---

---

## 2026-02-22 (5차)

### 데이터 통합 2단계 - 1단계: 캐릭터 데이터 구조 통합

---

### 수정된 파일

**`js/ui-character.js`**

`createCharacterTable(savedData)` 에서 데이터 복구 시, `savedData`에 최상위 `job`/`name` 필드가 있고 `inputs`에 해당 값이 없으면 자동으로 `inputs`에 주입.
→ project2 형식의 캐릭터 객체를 project1 상세 입력 화면에서도 정상 렌더링 가능.

```javascript
if (savedData.job && !savedData.inputs?.['info_job']) {
    savedData.inputs['info_job'] = { val: savedData.job, cls: '' };
}
if (savedData.name && !savedData.inputs?.['info_name']) {
    savedData.inputs['info_name'] = { val: savedData.name, cls: '' };
}
```

**`scripts/eq_character.js`**

`addCharacter()` — 캐릭터 생성 시 통합 구조 필드 추가:
- id 생성 방식을 `char_` + Date.now() + random 으로 통일 (기존: `c` + Date.now())
- `inputs`, `runeData`, `tags`, `locked` 필드를 빈 값으로 초기화하여 생성

`updateCharacterInfo()` — 이름/직업 수정 시:
- `char.inputs['info_job']`, `char.inputs['info_name']` 도 함께 업데이트
- project1 DOM에 해당 캐릭터 테이블이 렌더링된 경우 `info_job`, `info_name` 필드 값도 직접 동기화

---

---

## 2026-02-23 (6차)

### 데이터 통합 2단계 - 2단계: localStorage 키 통합

---

### 목표

`dnfm_character_equipment_data` (project1) + `dnfm_eq` (project2) 두 개의 로컬 스토리지 키를 `dnfm_unified` 하나로 통합.

저장 형식: `{ characters: [...], history: [...] }`

---

### 수정된 파일

**`shared/shared_constants.js`**
- `STORAGE_KEYS.UNIFIED = "dnfm_unified"` 추가
- `AppConstants.STORAGE_KEY` → `STORAGE_KEYS.UNIFIED` 로 변경
- 기존 `PROJECT1`, `PROJECT2` 키는 마이그레이션용으로 유지

**`scripts/eq_core.js`**
- `saveLocalData()` — `dnfm_unified` 키에 `{ characters, history }` 구조로 저장
- `loadLocalData()` — `dnfm_unified` 에서 `characters` 배열만 추출하여 전역 변수에 할당
- `_loadUnified()` 헬퍼 함수 추가

**`js/storage.js`** (전면 재작성)
- `_loadUnifiedStorage()` 헬퍼 함수 추가
- `autoSave()` — DOM `.char-section` 에서 읽은 입력값을 `characters` 배열에 병합 후 `dnfm_unified` 에 저장. `info_job`/`info_name` 값을 `job`/`name` 최상위 필드에도 동기화
- `exportToJSON()` — `dnfm_unified` 전체를 `dnfm_backup_YYYY-MM-DD_HH-MM.json` 으로 저장
- `saveJsonWithLocation()` — 동일하게 통합 구조로 저장
- `importFromJSON()` — 통합 형식 및 구버전 배열 형식 모두 지원. 불러오기 시 `characters` 전역 배열 교체 + project1 DOM 재렌더링 + project2 `renderCharacterList()` 동시 갱신

**`js/state.js`**
- `init()` — `dnfm_unified` 에서 `history`, `characters` 읽도록 변경
- `saveHistory()` — `dnfm_unified` 의 `history` 필드만 업데이트하여 저장

**`js/main.js`**
- `initProject1()` — `dnfm_unified` 에서 `characters` 배열 읽어 렌더링

**`scripts/eq_main.js`**
- `migrateToUnified()` 함수 추가 — 페이지 최초 로드 시 1회 실행
  - `dnfm_unified` 가 이미 존재하면 즉시 종료 (중복 실행 방지)
  - `dnfm_character_equipment_data` (p1) + `dnfm_eq` (p2) 데이터를 id 또는 name+job 기준으로 매칭하여 통합 캐릭터 객체로 병합
  - p2에만 있는 캐릭터 → inputs 빈 값으로 추가
  - p1에만 있는 캐릭터 → armorCounts 등 빈 값으로 추가
  - 결과를 `dnfm_unified` 에 저장

---

---

## 2026-02-23 (7차)

### 데이터 통합 2단계 - 3단계: 캐릭터 추가/삭제 동기화

---

### 수정된 파일

**`js/ui-character.js`**

- 파일 상단에 `_syncInProgress` 플래그 추가 (무한 루프 방지용)
- `createCharacterTable()` — `savedData` 없이 신규 추가 시 project2 `characters` 배열에도 동일 캐릭터 추가 후 `saveLocalData()`, `renderCharacterList()` 호출
- `deleteCharacter()` — project1 DOM 제거 후 project2 `characters` 배열에서도 해당 캐릭터 제거 후 `saveLocalData()`, `renderCharacterList()` 호출

**`scripts/eq_character.js`**

- `addCharacter()` — project2에서 캐릭터 추가 시 `createCharacterTable(newChar)` 도 함께 호출하여 project1 상세입력 탭 DOM에도 즉시 반영
- `deleteCharacterConfirmed()` — project2에서 캐릭터 삭제 시 project1 DOM에서도 해당 섹션 제거, `AppState.charRuneData`/`AppState.charTags` 에서도 정리

### 무한 루프 방지 구조

```
project2 addCharacter()
  → _syncInProgress = true
  → createCharacterTable(newChar)   ← project1
      → savedData 있으므로 동기화 블록 건너뜀
  → _syncInProgress = false

project1 createCharacterTable() (신규, savedData 없음)
  → _syncInProgress = true
  → characters.push(...)            ← project2
  → renderCharacterList()
  → _syncInProgress = false
```

---

## 2026-02-23 (7차 추가)

### 3단계 보완: project1 이름/직업 수정 시 project2 즉시 동기화

---

### 문제

project1 상세입력 탭에서 `info_name`/`info_job` 필드를 직접 수정하면 `autoSave()`의 800ms 딜레이 때문에 project2 `characters` 배열의 `name`/`job` 필드가 즉시 갱신되지 않아, 삭제 등 id 외 이름 기반 로직에서 불일치가 생길 수 있음.

### 수정된 파일

**`js/ui-core.js`**
- `syncCharInfoToP2(el)` 함수 추가
  - `info_job` 또는 `info_name` 필드 변경 시 `characters` 배열의 해당 캐릭터 `job`/`name` 즉시 업데이트
  - `renderCharacterList()` 즉시 호출하여 project2 캐릭터 목록 버튼 이름도 실시간 갱신
  - 이후 `autoSave()` 호출하여 저장까지 처리

**`merged.html`**
- `character-info-template` 내 `info_job`, `info_name` 입력 필드의 `oninput` 이벤트를 `autoSave()` → `syncCharInfoToP2(this)` 로 변경

---

---

## 2026-02-23 (8차)

### 데이터 통합 2단계 - 4단계: JSON 저장/불러오기 통합

---

### 수정된 파일

**`merged.html`**
- 상단 툴바 `exportJSON()` → `exportToJSON()` 로 변경
- 상단 툴바 `importJSON(event)` → `importFromJSON(this)` 로 변경
- 상세입력 탭 내 버튼은 이미 올바른 함수명 사용 중이었으므로 변경 없음

**`scripts/eq_main.js`**
- `exportJSON()` 함수 제거 → `storage.js`의 `exportToJSON()` 로 대체
- `importJSON()` 함수 제거 → `storage.js`의 `importFromJSON()` 로 대체
- 주석으로 storage.js 통합 버전 사용 안내 추가

### 결과

모든 JSON 저장/불러오기가 `storage.js`의 통합 함수 하나로 일원화됨.
저장 시 `dnfm_unified` 전체(`characters` + `history`)가 하나의 JSON 파일로 저장되고,
불러오기 시 project1 DOM과 project2 캐릭터 목록이 동시에 갱신됨.

---

---

## 2026-02-23 (9차)

### 데이터 통합 2단계 - 5단계: 기록 + 최근 업데이트 합치기

---

### 수정된 파일

**`scripts/eq_weapon.js`**

`showRecentUpdates()` 함수 수정:
- 기존: project2 장비 업데이트만 표시
- 변경: 모달 상단에 탭 두 개 추가
  - **🌟 장비 업데이트** 탭 — 기존 project2 `updateTimes` 기반 업데이트 내역
  - **📜 상세입력 변경 기록** 탭 — project1 `AppState.changeHistory` 기반 변경 기록

`switchUpdateTab(tab)` 함수 추가:
- `p2` / `p1` 탭 전환 처리
- 탭 전환 시 페이지네이션 표시/숨김 처리 (p1 탭은 페이지네이션 불필요)

`renderUpdatePage(pageNum)` 함수 수정:
- 탭 구조(`update-tab-p2`)가 있으면 해당 컨테이너에 렌더링
- 없으면 기존 `updateModalContent`에 렌더링 (하위 호환)

### 결과

`🌟 최근 업데이트` 버튼 하나에서 장비 업데이트 내역과 상세입력 변경 기록을 탭으로 구분하여 모두 확인 가능.
상세입력 탭 내 `📜 기록` 버튼은 기존과 동일하게 유지.

---

## 2026-02-23 (9차 추가)

### 5단계 버그 수정: 상세입력 변경 기록 미표시 문제

**문제**

`🌟 최근 업데이트` 모달의 `📜 상세입력 변경 기록` 탭에 아무것도 표시되지 않음.

**원인**

`AppState.init()`은 상세입력 탭에 처음 진입할 때(`initProject1()`) 실행됨.
상세입력 탭에 한 번도 들어가지 않은 상태에서 `🌟 최근 업데이트`를 누르면
`AppState.changeHistory`가 빈 배열 그대로라 기록이 표시되지 않음.

**수정**

`showRecentUpdates()` 내부에서 `AppState.changeHistory`를 읽는 대신
`dnfm_unified` 스토리지에서 `history` 필드를 직접 읽도록 변경.
`AppState`가 이미 초기화된 경우(상세입력 탭 진입 후)엔 메모리의 최신 데이터를 우선 사용.
→ 어느 탭에 있든 상관없이 기록이 항상 표시됨.

---

---

## 2026-02-23 (10차)

### 버그 수정 3건

---

### 버그 1: 악세/특장 숫자 증가 시 세트 버튼 카운트 미갱신

**원인**

`autoSave()`가 `_loadUnifiedStorage()`로 스토리지를 새로 읽어 DOM 기반으로 수정 후 저장하는 방식이었음.
`increment()` → `saveLocalData()`로 `armorCounts` 저장 직후, 상세입력 탭의 입력 이벤트로 `autoSave()` 800ms 타이머 발동 시
스토리지에서 다시 읽은 `unified` 객체에 DOM 입력값만 병합해서 저장하므로, 메모리상의 `armorCounts` 변경분이 스토리지에서 덮어써지는 타이밍 충돌 발생.

**수정 (`js/storage.js`)**

`autoSave()`가 `_loadUnifiedStorage()`로 스토리지를 읽는 대신,
메모리의 `characters` 배열을 직접 수정하고 `saveLocalData()`로 저장하도록 변경.
→ `armorCounts`, `weaponCounts`, `updateTimes` 등 project2 데이터가 덮어써지지 않음.

---

### 버그 2: JSON 불러오기 후 화면 미갱신

**원인**

`importFromJSON()`에 `setList`, `panel` 초기화 및 현재 열린 탭(무기/장비/제작) 갱신 코드 누락.
기존 `importJSON()`에 있던 탭별 갱신 로직이 통합 과정에서 빠짐.

**수정 (`js/storage.js`)**

- `setList`, `panel` innerHTML 초기화 추가
- 현재 열린 탭 감지 후 `selectWeaponJob()`, `renderEquipmentTab('ALL')`, `renderCraftTable()` 각각 호출

---

### 버그 3: JSON 불러오기 후 세트 버튼 노란색 유지

**원인**

`importFromJSON()`에 `activeCharacterId`, `currentSetName`, `currentChar` 상태 초기화 코드 누락.
기존 `importJSON()`에 있던 상태 초기화 로직이 통합 과정에서 빠짐.

**수정 (`js/storage.js`)**

불러오기 완료 후 세 전역 변수를 `null`로 초기화하도록 추가.

---

---

## 2026-02-23 (11차)

### 버그 2, 3 재수정

---

**버그 2: JSON 불러오기 후 가끔 상세입력 탭으로 이동**

- 기존 수정에서 `!_p1Initialized`일 때 `switchTo('detail')`을 호출하는 코드가 남아있었음
- `createCharacterTable()`은 `characterContainer`에 직접 렌더링하므로 탭 전환 불필요
- `switchTo('detail')` 및 `_p1Initialized` 조건 분기 전체 제거

**버그 3: JSON 불러오기 후 세트 버튼 노란색 유지**

- 기존 수정에서 `activeCharacterId`, `currentSetName`, `currentChar` 초기화만 했고 `distinctPartsCache` 초기화 누락
- `distinctPartsCache`는 세트 완성 여부를 캐싱하는 객체로, 불러오기 후에도 이전 데이터 기준 캐시가 남아 노란색(set3/set5) 버튼이 유지됨
- 불러오기 완료 후 `distinctPartsCache`의 모든 키를 삭제하도록 추가

**수정 파일:** `js/storage.js`

---

---

## 2026-02-23 (12차)

### 버그 1 재수정: 악세/특장 숫자 증가 시 세트 버튼 카운트 미갱신

**원인 (재분석)**

`updateSetButtonCount()`에서 버튼 텍스트 교체 방식이 문제였음:

```js
// 기존 코드
const newText = btnText.replace(/\(\d+\)/, `(${totalParts})`);
btn.innerHTML = btn.innerHTML.replace(btnText, newText);
```

- `btnText = btn.textContent` → HTML 태그 제외 순수 텍스트
- `btn.innerHTML` → HTML 태그 포함 문자열

악세/특장 버튼은 `ACCESSORY_EXTRA_INFO`, `SPECIAL_EXTRA_INFO`에 정의된 추가 정보가 있어서
`btn.innerHTML = "철갑을 두른 탑의 수호꾼 (0)<br>(메탈기어)</span>"` 형태로 저장됨.
이 경우 `textContent("철갑을 두른 탑의 수호꾼 (0)메탈기어")`와 `innerHTML`이 달라서
`innerHTML.replace(btnText, newText)`가 항상 실패 → 숫자 미갱신.
방어구는 EXTRA_INFO가 없어서 textContent == innerHTML → 정상 동작.

**수정 (`scripts/eq_equipment.js`)**

`btn.innerHTML.replace(btnText, newText)` 방식 제거.
`btn.innerHTML`에서 정규식 `/\(\d+\)/`으로 첫 번째 `(숫자)` 패턴만 직접 교체.

```js
btn.innerHTML = btn.innerHTML.replace(/\(\d+\)/, `(${totalParts})`);
```

→ innerHTML 구조와 무관하게 항상 올바른 카운트로 갱신됨.

**수정 파일:** `scripts/eq_equipment.js`

---

---

## 2026-02-23 (13차)

### migrateToUnified 매칭 기준 변경: 이름+직업 → 직업만

**배경**

예전 로컬 스토리지에서 캐릭터 이름이 잘못 입력되어 같은 캐릭터가 두 개씩 나오는 현상 발생.
이 함수는 1회 실행 후 삭제 예정이므로, 직업(job)만으로 매칭하도록 임시 변경.

**수정 (`scripts/eq_main.js`)**

- p2 기준 매칭: `id 일치 || (이름+직업 일치)` → `id 일치 || 직업 일치`
- p1 중복 체크: `id 일치 || (이름+직업 일치)` → `id 일치 || 직업 일치`

**주의**

같은 직업 캐릭터가 여러 명이면 첫 번째 캐릭터로 합쳐짐.
1회 실행 후 `migrateToUnified()` 함수 및 호출부 삭제 예정.

---

## 2026-02-23 (14차)

### 장비관리(p2) 캐릭터가 dnfm_unified에 누락된 경우 자동 보완

**배경**

`migrateToUnified()`는 `dnfm_unified`가 이미 있으면 바로 return했음.
최초 마이그레이션 당시 p2(`dnfm_eq`)에만 있던 캐릭터가 누락된 경우 복구 불가.
→ p2 기준 캐릭터가 우선이므로, 매 페이지 로드 시 p2와 unified를 비교해 누락분을 보완.

**수정 (`scripts/eq_main.js`)**

`migrateToUnified()` 2단계 로직 추가:
- 1단계: `dnfm_unified` 없으면 기존과 동일하게 최초 생성
- 2단계: `dnfm_unified`가 이미 있으면 `dnfm_eq`(p2)를 읽어 누락 캐릭터 보완
  - `unifiedIds`(id 기준), `unifiedJobs`(직업 기준) 중복 체크
  - p2에만 있는 캐릭터를 `unified.characters`에 추가
  - 추가된 경우에만 `localStorage.setItem`으로 저장

**수정된 파일:** `scripts/eq_main.js`

---

## 2026-02-24 (15차)

### migrateToUnified 매칭 로직 전면 재수정

**배경**

통계 화면에서 일부 캐릭터 장비 보유 수치가 0으로 나오는 문제 발생.

**원인 분석**

두 스토리지 키의 데이터 구조가 완전히 달랐음:

- `dnfm_character_equipment_data` (PROJECT1): `inputs.info_job`, `inputs.info_name` 구조 (상세입력 데이터), `armorCounts` 없음
- `dnfm_eq` (PROJECT2): 최상위에 `job`, `name` 필드 직접 존재, `armorCounts`/`weaponCounts` 있음, `inputs` 없음

기존 코드는 두 키가 같은 형식이라고 가정하고 직업 기준 중복 제거만 했기 때문에, p1을 먼저 처리하면서 같은 직업의 p2 데이터(`armorCounts`)를 무시함.
또한 p2 매칭 시 `c.inputs?.['info_job']?.val`로 읽으려 했으나 p2에는 `inputs`가 없어 항상 빈 문자열 → 매칭 실패.

**수정 (`scripts/eq_main.js`)**

- p1(`inputs` 구조) 기준으로 순회하면서 p2에서 같은 직업(`c.job || c.inputs?.['info_job']?.val`)을 찾아 `armorCounts`/`weaponCounts`/`updateTimes`/`craftMaterials`를 가져와 합침
- p1에 없는 p2 캐릭터는 별도로 추가 (p2 구조도 `job || inputs.info_job` 양쪽 모두 커버)

---
## 2026-02-24 (16차)

### UI 정리: 중복 버튼 제거 및 최근 업데이트 버튼 위치 변경

**변경 1: 상세입력 탭 control-bar 중복 버튼 제거**

상단 툴바에 이미 동일 기능이 있어 상세입력 탭에서 제거:
- `📤 JSON 파일 저장` 제거
- `📂 JSON 경로 지정 저장` 제거
- `📥 JSON 파일 불러오기` 제거 (+ `fileInput` hidden input 제거)
- `📜 기록` 제거
- `➕ 캐릭터 추가` 제거 (캐릭터 관리 탭에만 유지)

남은 버튼: 전체 잠금, 📋 기본, ⚖️ 비교, 🔍 검색, 🏷️ 태그

**변경 2: 최근 업데이트 버튼 위치 변경**

기존: 탭 메뉴 아래 단독으로 떠있는 구조
변경: 상단 툴바 탭 버튼들 우측 끝에 구분선(`|`) 추가 후 배치

**변경 3: HTML 함수 호출 방식 정리 (`merged.html`)**

불필요한 alias 함수 없이 직접 호출하도록 변경:
- `onclick="exportJSON()"` → `onclick="exportToJSON()"`
- `onchange="importJSON(event)"` → `onchange="importFromJSON(this)"`

**수정 파일:** `merged.html`, `js/storage.js`

---

## 2026-02-24 (17차)

### 캐릭터 순서 변경 시 상세입력 탭 동기화

**배경**

캐릭터 관리 탭에서 편집 모드로 순서를 변경해도 상세입력 탭에서는 순서가 반영되지 않는 문제.
JSON 저장/불러오기 시에는 DOM을 재생성하므로 반영됨.

**원인**

`initProject1()`은 `_p1Initialized` 플래그로 최초 1회만 실행됨.
이후 상세입력 탭 재진입 시 DOM을 다시 그리지 않아 `characters` 배열 순서 변경이 반영되지 않음.

**수정 (`scripts/eq_main.js`)**

`syncDetailTabOrder()` 함수 추가 (섹션 12-1):
- `characterContainer` 안의 `.char-section` DOM들을 `characters` 배열 순서대로 `appendChild`로 재배치
- DOM을 다시 그리지 않고 순서만 바꾸므로 입력값 유지
- `getElementById` 사용 (id에 점(`.`)이 포함된 경우 `querySelector` 오류 방지)
- `section.closest('#characterContainer')` 로 다른 섹션의 요소를 잘못 이동시키지 않도록 방어

`switchTo('detail')` 진입 시 `syncDetailTabOrder()` 호출 추가.

---

## 2026-02-24 (18차)

### 상세입력 순서 변경 시 캐릭터 관리 탭 미반영 수정

**원인**

`moveCharacter()`가 DOM 순서만 바꾸고 `autoSave()`를 호출.
`autoSave()`는 `characters.find()`로 배열 값만 업데이트하고 배열 순서는 건드리지 않음.
→ `characters` 배열 순서가 그대로라 `renderCharacterList()`에서 캐릭터 관리 탭 순서도 그대로 유지됨.

**수정 (`js/ui-character.js`)**

`moveCharacter()` 수정:
- `autoSave()` 제거
- DOM 이동 후 `#characterContainer .char-section` 순서를 읽어 `characters` 배열을 `sort()`로 재정렬
- `saveLocalData()` + `renderCharacterList()` 호출 → 캐릭터 관리 탭에도 즉시 반영

**수정된 파일:** `js/ui-character.js`

---

## 2026-02-24 (19차)

### 메모/설명/태그 변경 시 상세입력 변경 기록 미등록 수정

**원인**

`main.js`의 `change` 이벤트 리스너에서만 `changeHistory`에 기록.
메모/설명/태그는 `change` 이벤트 없이 각 함수(`saveMemoFromModal`, `saveDescFromModal`, `addTag`, `removeTag`)에서 직접 `autoSave()`만 호출하므로 기록에 남지 않음.

**수정 (`js/ui-memo-tag.js`)**

`_recordMemoTagHistory(charId, slot, oldVal, newVal)` 헬퍼 함수 추가:
- `AppState.changeHistory`에 변경 내역 기록
- `AppState.saveHistory()`, `AppState.updateSnapshot()` 호출

각 저장 함수에 호출 추가:
- `saveMemoFromModal()` — 저장 전 oldVal 캡처 후 기록 (slot: '메모')
- `saveDescFromModal()` — 저장 전 oldVal 캡처 후 기록 (slot: '설명')
- `addTag()` — 태그 추가 시 기록 (slot: '태그')
- `removeTag()` — 태그 삭제 시 기록 (slot: '태그')

**수정된 파일:** `js/ui-memo-tag.js`

---

## 2026-02-24 (20차)

### 상세입력 세트 파란색 하이라이트 버그 수정

**버그 1: 세트 아닌 슬롯도 파란색**

기존 코드에서 `isSetComplete`(boolean)가 true면 슬롯 전체에 파란색 적용.
세트에 속하지 않는 슬롯(`slotToSetName[slot]` 없음)도 파란색이 됨.

**버그 2: 방어구 3세트인데 5개 슬롯 전부 파란색**

방어구는 5슬롯 중 3개 이상이면 세트 효과인데, `isSetComplete=true`가 되면 5개 전부 파란색 적용.
실제로 그 세트에 속한 슬롯만 파란색이어야 함.

**수정 (`js/ui-core.js`)**

`checkSetColor()` 3~4단계 수정:
- `isSetComplete`(boolean) → `activeSetNames`(Set) 로 변경
- 세트 효과 달성한 세트명들을 Set에 수집
- 4단계 하이라이트: `slotToSetName[slot]`이 `activeSetNames`에 포함된 경우만 파란색 적용
- 해당 슬롯이 세트에 속하지 않거나 세트 효과 미달이면 색상 제거

**수정된 파일:** `js/ui-core.js`

---

## 2026-02-24 (21차)

### 신규 캐릭터 마법부여 기본값 미적용 - 근본 원인 수정

**원인**

`createSlotContent()`의 `isNewChar` 조건이 `Object.keys(savedData.inputs).length === 0` 이었으나,
`createCharacterTable()` 105~113번 라인에서 `savedData.job`/`savedData.name`을 `inputs`에 `info_job`/`info_name`으로 주입하기 때문에
`addCharacter()`로 추가된 신규 캐릭터도 `inputs`에 최소 2개 키가 존재 → `isNewChar`가 `false`로 판정됨.

**수정 (`js/ui-character.js`)**

`isNewChar` 조건을 장비 관련 inputs 키 유무로 변경:
- `info_job`, `info_name`, `info_stat_type`, `info_ele_type`, `info_power`, `info_memo`, `info_tag_input` 제외한 키가 없으면 신규 캐릭터로 간주
- 신규 캐릭터 → `getDefaultEnchant(slot)` 적용 (마법부여 기본값)
- 기존 캐릭터 → 저장된 값 유지

---
## 2026-02-25 (22차)

### 무기 보유 현황 기능 추가

**추가 내용**

- `merged.html`: 장비 관리 탭 📊 통계 버튼 오른쪽에 ⚔️ 무기 보유 현황 버튼 추가
- `scripts/eq_equipment.js`: `showWeaponStatistics(selectedJob)` 함수 추가

**표 구조**

- 상단 직업군 버튼 (보유 무기 있는 직업군만), 클릭 시 해당 직업군 테이블 전환
- 열: 종류(rowspan) | 무기 이름(rowspan) | 직업(이름) | 개수
- 보유한 캐릭터만 행으로 표시, 아무도 없는 무기/카테고리 생략
- 표 감싸는 외곽 border 없음

**수정 파일:** `merged.html`, `scripts/eq_equipment.js`

---

## 2026-02-25 (23차)

### 장비 검색 기능 개선 + 무기 관리 탭 border 제거

**수정 내용**

1. `scripts/eq_equipment.js`: 검색 기능에 무기 추가
  - 종류(소검/도/너클 등) 또는 무기 이름으로 검색 가능
  - 결과는 무기 보유 현황과 동일한 표 구조 (종류/무기이름/직업(이름)/개수)
  - 보유 캐릭터 없는 항목 생략

2. `scripts/eq_equipment.js`: 검색 결과 합계 열 제거
  - 캐릭터 구분선 colspan 3 + slots.length 로 수정

3. `scripts/eq_weapon.js`: 무기 관리 탭 표 감싸는 외곽 border 제거

**수정 파일:** `scripts/eq_equipment.js`, `scripts/eq_weapon.js`

---

## 2026-02-25 (24차)

### 검색 결과 편집 - 모달 팝업 방식 적용

**수정 (`js/ui-search.js`)**

일반 슬롯 검색 결과에서 ✏️ 직업(이름) 셀 클릭 시 모달 팝업으로 편집.

**동작 방식**
- ✏️ 직업(이름) 셀 클릭 → 화면 중앙 모달 팝업
- 설명 필드는 `<textarea>` (5행, resize 가능)로 넓게 표시
- 💾 저장 → 상세입력 DOM 반영 + 표 행 갱신 + `autoSave()`
- ✖ 취소 또는 overlay 클릭 → 모달 닫기

**수정된 파일:** `js/ui-search.js`

---

## 2026-02-25 (25차)

### showWeaponStatistics 함수 누락 수정

**원인:** outputs 파일 덮어쓰기 과정에서 `showWeaponStatistics` 함수가 누락된 채로 배포됨

**수정 내용:** `scripts/eq_equipment.js`에 `showWeaponStatistics` 함수 재추가

**수정 파일:** `scripts/eq_equipment.js`

---

## 2026-02-25 (26차)

### 제작 탭 계산 기능 개선

**수정 내용**

- `merged.html`: 실행 취소 버튼 추가 (계산 후 활성화, 초기/취소 후 비활성)
- `scripts/eq_weapon.js`:
  - 캐릭터 이름 칸 클릭 시 해당 행 전체 선택/해제 토글
  - `applyCraftModulo()`: 계산 전 undo 스냅샷 저장, 실행 취소 버튼 활성화
  - `undoCraftModulo()`: 스냅샷으로 복원 후 버튼 비활성화

**수정 파일:** `merged.html`, `scripts/eq_weapon.js`

---

## 2026-02-25 (27차)

### showRecentUpdates 탭 구조 복원

**원인:** 무기 관리 탭 border 제거 작업 시 eq_weapon.js를 프로젝트 원본(이전 버전) 기준으로 작업하면서 showRecentUpdates의 탭 구조(🌟 장비 업데이트 / 📜 상세입력 변경 기록)와 switchUpdateTab 함수가 누락됨

**복원 내용**
- `showRecentUpdates()`: 탭 헤더(장비 업데이트 / 상세입력 변경 기록) 및 p1 history 렌더링 복원
- `switchUpdateTab()`: 탭 전환 함수 복원
- `renderUpdatePage()`: p2 컨테이너(update-tab-p2) 방식 복원

**수정 파일:** `scripts/eq_weapon.js`

---

## 2026-02-25 (28차)

### 검색 결과 설명 칸 크기 조절 방법 확인

**크기 조절 위치 (`js/ui-search.js`)**

- **가로 너비** (평소 + 수정 칸 동시 적용)
  - `.search-table-custom th.desc-col, td.desc-col` 의 `width / min-width / max-width` 세 값을 동일하게 수정
  - 현재값: `220px`

- **세로 높이** (수정 칸일 때만 적용)
  - `_toggleDescCell()` 내 textarea 스타일의 `min-height` 수정
  - 현재값: `50px`

---

## 2026-02-25 (29차)

### 캐릭터 추가/삭제 기능 수정 (eq_character.js 첨부 코드 기반 재작업)

**수정 내용 (`scripts/eq_character.js`)**

1. `addCharacter()` 수정
   - 이름/직업 input 제거에 맞게 빈 캐릭터 바로 생성
   - id 형식을 `char_` + Date.now() + random으로 변경 (삭제 시 id 불일치 방지)
   - project1 필드(`locked`, `inputs`, `runeData`, `tags`) 초기화 포함
   - `createCharacterTable()` 호출로 캐릭터 관리 탭에 표 즉시 생성

2. `deleteCharacterConfirmed()` 수정
   - project1 DOM(`p1Section.remove()`) 동기화 추가
   - `AppState.charRuneData`, `charTags` 정리 추가

3. `updateCharacterInfo()` 수정
   - `inputs['info_job']`, `inputs['info_name']` 동기화 추가
   - project1 DOM(`data-key` 셀렉터) 동기화 추가

**수정 파일:** `scripts/eq_character.js`

---

## 2026-02-25 (30차)

### 탭 이름 변경 및 캐릭터 추가 기능 이동

**수정 내용**

- `merged.html`: 탭 이름 5개 변경
  - 캐릭터 관리 → 획득 장비 등록
  - 무기 관리 → 무기 등록
  - 장비 관리 → 장비 현황
  - 제작 → 제작 등록
  - 상세 입력 → 캐릭터 관리

- `merged.html`: 획득 장비 등록 탭에서 이름 입력칸, 직업 입력칸, ➕ 추가 버튼 제거

- `merged.html`: 캐릭터 관리(기존 상세입력) 탭 컨트롤바 맨 앞에 ➕ 캐릭터 추가 버튼 추가

- `scripts/eq_character.js`: `addCharacter()` 수정
  - 이름/직업 입력 없이 빈 캐릭터 바로 생성
  - id 형식 `char_` + Date.now() + random으로 변경
  - project1 필드(`locked`, `inputs`, `runeData`, `tags`) 초기화 포함
  - `createCharacterTable()` 호출로 캐릭터 관리 탭에 표 즉시 생성
  - 추가 후 "캐릭터가 추가되었습니다!" 알림

- `scripts/eq_character.js`: `deleteCharacterConfirmed()` 수정
  - project1 DOM(`p1Section.remove()`) 동기화 추가

- `scripts/eq_character.js`: `updateCharacterInfo()` 수정
  - `inputs` 필드 및 project1 DOM 동기화 추가

**수정 파일:** `merged.html`, `scripts/eq_character.js`

---

## 2026-02-25 (31차)

### 획득 장비 등록 탭 정렬/순서 버튼 및 관련 함수 제거

**수정 내용**

- `merged.html`: 순서 등록, 등록 순서로 복원, 이름순 정렬, 직업순 정렬 버튼 제거

- `scripts/eq_character.js`: 관련 함수 4개 제거
  - `saveCurrentOrder()`
  - `resetToOriginalOrder()`
  - `sortCharactersByName()`
  - `sortCharactersByJob()`

**수정 파일:** `merged.html`, `scripts/eq_character.js`

---

## 2026-02-25 (32차)

### 획득 장비 등록 탭 헤더/버튼 레이아웃 수정

**수정 내용**

- `merged.html`: `[획득 장비 등록]` 문구 → `[캐릭터]`로 변경
- `merged.html`: 편집 버튼을 `[캐릭터]` 제목 오른쪽 옆에 나란히 배치

**수정 파일:** `merged.html`

---

## 2026-02-25 (33차)

### 검색 결과 설명 칸 편집 기능 추가 - 전 슬롯 통일

**추가 함수 (`js/ui-search.js`)**

- `_makeDescEditable(td, charId, slot)` — 설명 td에 클릭 편집 등록하는 공통 함수
  - 편집 모드 ON 상태일 때만 클릭 반응
  - 클릭 시점에 td 크기 직접 측정(`getBoundingClientRect()`) → textarea에 동일 크기 적용
  - blur 시 자동 저장 + `_applySearchEditToDOM()` 호출 + 텍스트로 복원
  - Escape 키로 편집 취소
- `_initDescToggleBtn(table, btnSelector)` — 설명 편집 버튼 토글 초기화 공통 함수
  - 버튼 클릭 시 ON/OFF 토글 (파란색: OFF, 초록색: ON)
  - ON 시: 설명 td에 파란 테두리 + 밝은 배경 표시, 클릭하면 편집 가능
  - OFF 시: 스타일 제거, 열려 있는 textarea 자동 닫기

**적용 대상**
- `createSimpleSlotSearchTable()` (오라/아바타): innerHTML → DOM 방식으로 변경, 설명 th에 ✏️ 버튼 추가
- `createTitleSearchTable()` (칭호/외형칭호): innerHTML → DOM 방식으로 변경, 설명 th에 ✏️ 버튼 추가
- `createCreatureSearchTable()` (크리쳐): innerHTML 문자열 반환 → DOM 방식으로 전환, 설명 th에 ✏️ 버튼 추가
- 일반 슬롯(무기/상의 등): 기존 `_toggleDescCell` 방식 → `_makeDescEditable` + `_initDescToggleBtn` 방식으로 교체, `_toggleDescCell` 함수 제거
- 일반 슬롯 설명 칸 가로 고정(`220px`) CSS 제거 → 내용에 따라 자동 조정

**버그 수정**
- 빈 칸 편집 후 blur 시 `-` 표시되는 문제: `newVal || '-'` → `newVal || ''` 로 변경

**수정된 파일:** `js/ui-search.js`

---

## 2026-02-25 (34차)

### 테마 설정 기능 추가 및 디자인 정리

**배경**
캐릭터 관리 탭이 검정 계열, 나머지 탭이 남색 계열로 달라 이질감이 있었음.
통일하되 테마를 선택할 수 있는 설정 기능을 추가하는 방향으로 진행.

**추가 내용**

- `merged.html`: ⚙️ 설정 버튼 추가 (최근 업데이트 버튼 옆)
- `merged.html`: 테마 선택 모달 추가
  - 🌗 혼합 테마: 다른 탭 남색 + 캐릭터 관리 다크 (기본값)
  - 🌌 남색 테마: 전체 남색
  - ⚫ 다크 테마: 전체 다크
- `merged.html`: 테마 JS 함수 추가
  - `openThemeModal()` / `closeThemeModal()`: 모달 열기/닫기
  - `applyTheme(theme)`: 테마 적용 + localStorage 저장 (새로고침 유지)
  - `updateThemeButtons(theme)`: 현재 적용 중 표시 (초록 테두리 + 텍스트)
  - 모달 바깥 클릭 시 닫힘

- `styles/merged.css`: CSS 변수 전체를 남색 계열로 변경 (캐릭터 관리 탭 통일)
  - `--bg`: `#0f0f12` → `#0f1222`
  - `--bg-section`: `#121216` → `#0f1222`
  - `--bg-row`: `#1a1a1f` → `#1a1e33`
  - `--table-bg`: `#1a1a1f` → `#1a1e33`
  - `--bg-header`: `#2a2a32` → `#181c33`
  - `--bg-header-alt`: `#3a3a42` → `#222644`
  - `--border`: `#444` → `#2a3158`
  - 표 안 진한 선(group-header, v-border-heavy 등) 제거
  - 표 외곽선 남색 계열로 변경

- `styles/merged.css`: 테마별 CSS 추가
  - `body.theme-mixed`: 혼합 테마 (body 남색, 캐릭터 관리 탭만 다크 변수 적용)
  - `body.theme-navy`: 전체 남색
  - `body.theme-dark`: 전체 다크
  - 각 테마별 `.set-btn.set3`(초록), `.set-btn.set5`(노랑), `.num-btn.positive`(파랑) 예외처리

**수정 파일:** `merged.html`, `styles/merged.css`

---
## 2026-02-26 (35차)

### 캐릭터 관리 탭 버튼 디자인 통일 및 테마 설정 기능 추가

**수정 내용**

- `merged.html`: ⚙️ 설정 버튼 추가 (최근 업데이트 버튼 옆)
- `merged.html`: 테마 선택 모달 추가 (🌗 혼합 / 🌌 남색 / ⚫ 다크, 기본값 혼합)
- `merged.html`: 테마 JS 함수 추가 (`openThemeModal`, `closeThemeModal`, `applyTheme`, `updateThemeButtons`)
  - 선택한 테마 localStorage 저장 → 새로고침 유지
  - 모달 바깥 클릭 시 닫힘

- `styles/merged.css`: 테마별 CSS 추가
  - `body.theme-mixed`: body 남색 + 캐릭터 관리 탭만 다크 강제 적용
  - `body.theme-navy`: 전체 남색
  - `body.theme-dark`: 전체 다크
  - 각 테마별 `.set-btn.set3`(초록), `.set-btn.set5`(노랑), `.num-btn.positive`(파랑) 예외처리

- `styles/merged.css`: 캐릭터 관리 탭 버튼 디자인 통일
  - `➕ 캐릭터 추가`: 글자색 흰색으로 변경
  - `전체 잠금`: 남색 그라디언트, 흰 글씨, 둥근 모서리
  - `기본/비교/검색/태그`: `#e6a817` 노란색, 흰 글씨 / active 시 `#e6a800` + 흰 테두리

**수정 파일:** `merged.html`, `styles/merged.css`

---

## 2026-02-26 (36차)

### 캐릭터 관리 탭 - 구분선/외곽 테두리 복원 + 테마2 추가

**원인**

`merged.css`에서 `#section-detail-view` 스코프로 구분선/테두리 관련 항목들이 모두 `none`으로 덮어씌워져 있었음.

**수정 (`merged.css`) - 복원 항목**

- `#section-detail-view table`: `border: none` → `border: var(--border-width-heavy) var(--border-style) var(--gold)`
- `.v-border-heavy`: `border-left: none` → `border-left: var(--border-width-heavy) ...`
- `.group-header`: `border-bottom: none` → `border-bottom: var(--border-width-heavy) ... var(--gold)`
- `.compare-divider-row td`: `border-top: none` → `border-top: var(--border-width-heavy) ... var(--gold)`
- `.border-gold-2`: `border: none` → `border: var(--border-width-heavy) ... var(--gold)`

**테마2 추가 (`merged.html`, `merged.css`)**

- 기존 테마(혼합/남색/다크)는 그대로 유지
- 테마 모달에 혼합2/남색2/다크2 버튼 추가
- 테마2는 기존 테마와 색상 동일하지만 위 복원 항목이 적용된 버전

**수정된 파일:** `merged.html`, `merged.css`

---

## 2026-02-27 (37차)

### 제작 등록 탭 - 헤더 2행 → 1행으로 합치기

**수정 (`scripts/eq_weapon.js`)**

- 헤더 1행(재료명)과 2행(이미지)을 하나로 합침
- 이미지(위) + 재료명(아래) 구조로 한 행에 표시

**수정된 파일:** `scripts/eq_weapon.js`

---

## 2026-02-27 (38차)

### 제작 등록 탭 - 특산물 상자 표 추가 및 계산 연동

**수정 (`scripts/eq_weapon.js`)**

- 메인 재료 표 위에 죽은 자의 성 던전 특산물 선택 상자 별도 표 추가
  - 헤더: 이미지 + 이름 / 개수 2열 구조
  - 데이터 행: 이미지 표시 칸 + 개수 입력 1개
  - 데이터는 `char.craftMaterials`에 함께 저장
- 특산물 상자 input에 `craft-special` 클래스 추가 → `allInputs` 및 포커스 복원 로직에서 제외 (인덱스 밀림 버그 수정)
- `applyCraftModulo()` 계산 시 특산물 상자 자동 합산 추가
  - 망가진 기계 캡슐 ~ 마누스 메모리얼 선택 칸: 기존대로 `% 100` 나머지 계산
  - 추가: `Math.floor(원래값 / 100) * 10` 합산 → 특산물 상자 개수에 더함
  - 실행 취소 시 특산물 상자 값도 함께 복원

**수정된 파일:** `scripts/eq_weapon.js`

---

## 2026-02-27 (39차)

### 제작 등록 탭 - 특산물 표 확장 및 계산 연동 개선

**수정 (`scripts/eq_weapon.js`)**

- 특산물 표를 3개 항목으로 확장 (이름+이미지 한 칸, 개수 입력 1개 구조)
  - 죽은 자의 성 던전 특산물 선택 상자
  - 데이터 칩 상자 (특산물) — 아래 메인 표의 데이터와 별도 저장
  - 강화된 데이터 칩 상자 (특산물) — 아래 메인 표의 데이터와 별도 저장
- `applyCraftModulo()` 계산 시 특산물 칸 자동 합산 개선
  - 망가진 기계 캡슐 ~ 마누스 메모리얼(matIdx 0~5): `Math.floor(값/100)*10` → 죽은자의성 특산물에 합산
  - 데이터 칩 상자(matIdx 6): `Math.floor(값/10)` → 데이터 칩 상자 (특산물)에 합산
  - 강화된 데이터 칩 상자(matIdx 7): `Math.floor(값/10)` → 강화된 데이터 칩 상자 (특산물)에 합산
  - 실행 취소 시 특산물 값도 함께 복원

**수정된 파일:** `scripts/eq_weapon.js`

---

## 2026-02-27 (40차)

### inputs 구조 개선 - 플랫 → 중첩 구조 변환

**배경**
기존 `inputs` 객체가 `"슬롯_필드"` 형태의 플랫 구조로 저장되어 있어 가독성이 낮고 구조적으로 좋지 않았음. `inputs["슬롯"]["필드"]` 중첩 구조로 개선.

**변경 전**
```json
"inputs": {
    "info_job": { "val": "귀검사", "cls": "" },
    "상의_rarity": { "val": "에픽", "cls": "rare-에픽" },
    "상의_itemname": { "val": "못말리는 말괄량이의 가죽", "cls": "" }
}
```

**변경 후**
```json
"inputs": {
    "info_job": { "val": "귀검사", "cls": "" },
    "상의": {
        "rarity": { "val": "에픽", "cls": "rare-에픽" },
        "itemname": { "val": "못말리는 말괄량이의 가죽", "cls": "" }
    }
}
```

**수정 내용**

- `storage.js`: `autoSave()`에서 DOM 수집 시 `슬롯_필드` → `inputs[슬롯][필드]` 중첩 구조로 저장
- `storage.js`: `migrateInputs()` 함수 추가 - 구버전 플랫 구조 → 신버전 중첩 구조 자동 변환 (멱등성 보장)
- `storage.js`: `importFromJSON()` 불러오기 시 마이그레이션 자동 적용
- `ui-character.js`: `restoreSavedData()`에 `getInputData()` 헬퍼 추가 - 중첩 구조에서 데이터 조회
- `ui-character.js`: `equipInputKeys` 판단 로직 - `info_` 외 키를 슬롯 키로 판단
- `main.js`: 히스토리 기록 시 중첩 구조에서 이전값 조회
- `main.js`: 초기 로드 시 localStorage 데이터 마이그레이션 자동 적용

**규칙**
- `info_` 계열(`info_job`, `info_name` 등)은 플랫 구조 유지
- 나머지 장비 슬롯은 전부 중첩 구조

**수정 파일:** `storage.js`, `ui-character.js`, `main.js`

---

## 2026-02-27 (41차)

### runeData 위치 이동 - inputs["스킬룬"] 안으로

**배경**
룬 데이터(`runeData`)가 캐릭터 최상위에 별도로 저장되어 있었음. 스킬룬 슬롯 관련 데이터이므로 `inputs["스킬룬"]` 안에 포함하는 것이 구조적으로 올바름.

**변경 전**
```json
{
    "id": "char_1",
    "runeData": {
        "runes": [...],
        "gakin": ["가킨A", "가킨B"]
    },
    "inputs": { ... }
}
```

**변경 후**
```json
{
    "id": "char_1",
    "inputs": {
        "스킬룬": {
            "itemname": { "val": "화룡의 스킬룬", "cls": "" },
            "runeData": {
                "runes": [...],
                "gakin": ["가킨A", "가킨B"]
            }
        }
    }
}
```

**수정 내용**

- `storage.js`: `migrateRuneData()` 함수 추가 - 구버전 `character.runeData` → `inputs["스킬룬"].runeData` 이동 (멱등성 보장)
- `storage.js`: `autoSave()`에서 runeData를 `inputs["스킬룬"].runeData`에 저장
- `storage.js`: `migrateInputs()`에 스킬룬 예외처리 추가 - runeData는 `val`이 없으므로 플랫→중첩 변환 대상에서 제외
- `storage.js`: `importFromJSON()`에서 `migrateRuneData` + `migrateInputs` 순서로 마이그레이션 적용
- `ui-character.js`: `createCharacterTable()`에서 `inputs["스킬룬"].runeData` 우선 읽기 (구버전 `character.runeData` fallback 포함)
- `ui-character.js`: 신규 캐릭터 생성 시 `inputs["스킬룬"].runeData`에 초기값 저장
- `main.js`: 초기 로드 시 `migrateRuneData` → `migrateInputs` 순서로 마이그레이션 적용

**수정 파일:** `storage.js`, `ui-character.js`, `main.js`

---

## 2026-02-27 (42차)

### 마이그레이션 버그 수정

**문제점**

36~37차에서 구조 변경 후 아래 버그들이 발생했음.

1. **`runeData`가 `inputs["스킬룬"]` 안으로 안 들어가는 문제**
  - `exportToJSON`, `saveJsonWithLocation`이 localStorage를 직접 읽어서 내보내는 구조라 마이그레이션이 적용 안 됨
  - `autoSave`에서 runeData를 inputs에 넣은 후 `existing.runeData` 삭제를 안 해서 최상위에 그대로 남아있었음

2. **`스킬룬_desc`가 사라지는 문제**
  - 마이그레이션 순서가 `migrateRuneData` → `migrateInputs` 였는데, `migrateRuneData`가 먼저 실행되면서 `inputs["스킬룬"]` 키가 생성됨
  - 이후 `migrateInputs`가 `스킬룬` 키가 존재하니 신버전으로 판단하고 `스킬룬_desc` 플랫 키 변환을 건너뜀 → desc 소실

3. **캐릭터 관리 탭에서 데이터 복구 안 되는 문제**
  - localStorage에 구버전 플랫 데이터가 남아있는 상태에서 `createCharacterTable`이 마이그레이션 없이 `restoreSavedData`에 데이터를 넘겨서 빈 표만 표시됨

**수정 내용**

- `storage.js`: `exportToJSON`, `saveJsonWithLocation`에 내보내기 직전 마이그레이션 적용
- `storage.js`: `autoSave`에서 `existing.runeData` 삭제 추가 (`delete existing.runeData`)
- `storage.js`, `main.js`: 마이그레이션 순서 통일 → `migrateInputs` 먼저, `migrateRuneData` 나중
- `ui-character.js`: `createCharacterTable`에서 savedData 복구 전 마이그레이션 적용

**수정 파일:** `storage.js`, `ui-character.js`, `main.js`

---

## 2026-02-28 (43차)

### 코드 수정 - 버그 및 불필요 코드 제거

**1. `state.js` - 스토리지 접근 방식 통일**

`init()`과 `saveHistory()`에서 localStorage를 직접 읽던 방식을 `_loadUnified()` 헬퍼로 통일.

- 변경 전: `localStorage.getItem(AppConstants.STORAGE_KEY)` + 직접 `JSON.parse`
- 변경 후: `_loadUnified()` 호출 (파싱 + 에러처리 + 기본값 반환 내장)
- 저장 키도 `AppConstants.STORAGE_KEY` → `STORAGE_KEYS.UNIFIED` 로 명시적으로 변경
- 기능은 동일하나 코드 일관성 및 유지보수성 향상

**2. `eq_weapon.js` - 실험용 주석 코드 삭제**

이미지 배치 방식 실험 중 남긴 주석처리 코드 3줄 삭제.
- "이미지 오른쪽으로" 주석 포함 `nameTd.innerHTML` 줄
- "이미지 왼쪽으로" 주석 포함 `nameTd.innerHTML` 줄

**3. `eq_main.js` - 주석처리된 이벤트 핸들러 삭제**

더 이상 사용하지 않는 주석처리된 블록 전체 삭제.
- `window.ontouchstart` (updateModal 대응) 블록
- `window.ontouchstart` (prefixFullModal 대응) 블록
- `window.onclick` (모든 팝업 외부 클릭 닫기) 블록

**4. `빝의저장소.png` - 오타 파일 삭제**

`빛의저장소.png`와 `빝의저장소.png` 두 파일이 공존하던 것을 오타 파일(`빝의저장소.png`) 삭제.

**수정 파일:** `state.js`, `eq_weapon.js`, `eq_main.js`
**삭제 파일:** `빝의저장소.png`

---

## 2026-02-28 (44차)

### 최적화 - 중복 코드 제거 및 스냅샷 구조 통일

**1. `state.js` `updateSnapshot()` - 중첩 구조로 변경**

스냅샷을 플랫 구조(`inputsObj[key]`)로 저장하던 것을 `autoSave()`와 동일한 중첩 구조로 변경.
`main.js`의 히스토리 비교 코드(`prevChar.inputs[slot]?.[field]?.val`)와 구조가 일치하지 않아 항상 이전값을 찾지 못하던 문제 해결.
- `info_` 계열 → 플랫 유지
- 장비 슬롯 → `inputs[슬롯][필드]` 중첩 구조

**2. `storage.js` - `_loadUnifiedStorage()` 중복 제거**

`storage.js`의 `_loadUnifiedStorage()`와 `eq_core.js`의 `_loadUnified()`가 완전히 동일한 역할을 하던 것을 통일.
- `_loadUnifiedStorage()` 함수 선언 제거
- 호출처 2곳(`exportToJSON`, `saveJsonWithLocation`) → `_loadUnified()`로 교체
- `eq_core.js`가 `storage.js`보다 먼저 로드되므로 참조 문제 없음

**보류 항목**
- `autoSave()` 변경된 캐릭터만 처리하는 최적화: 호출처가 20곳 이상이고 각 함수에서 `charId` 전달 방식이 제각각이라 수정 범위 및 리스크가 커서 보류

**수정 파일:** `state.js`, `storage.js`

---

## 2026-02-28 (45차)

### 코드 정리 - 중복 파일 제거 및 함수 위치 이동

**1. `constants.js`, `data.js` 삭제**

`index.html`, `eq_index.html`, `merged.html` 모두 `shared_constants.js`, `shared_data.js`를 로드하고 있어서 루트의 `constants.js`, `data.js`는 어디서도 로드되지 않는 완전 중복 파일이었음. 삭제.

**2. `migrateToUnified()` → `storage.js`로 이동**

마이그레이션 관련 함수가 `eq_main.js`(초기화/이벤트 파일)에 있어 역할 분리가 안 되어 있었음.
- `storage.js` 하단으로 함수 이동
- `eq_main.js`에는 호출부(`migrateToUnified()`)만 남기고 선언 제거
- `merged.html` 로드 순서 조정: `storage.js`가 `eq_main.js`보다 먼저 로드되도록 변경
  - 변경 전: `eq_main.js(9번)` → `storage.js(12번)`
  - 변경 후: `storage.js(9번)` → `eq_main.js(10번)`

**보류 항목**
- `ui-search.js` 분리: 함수 간 의존성이 복잡해 현 단계에서 분리 시 버그 리스크가 큼. 추후 별도 작업으로 진행.

**수정 파일:** `storage.js`, `eq_main.js`, `merged.html`
**삭제 파일:** `constants.js`, `data.js`

---

## 2026-02-28 (46차)

### 주석 정리 (4번) + 이미지 폴더 이동 (7번) + md 파일 정리 (6번)

**[4번] 주석 추가/수정/제거**

- `eq_equipment.js`: 디버그용 `console.log` → `console.warn`으로 변경, "나중에 제거 가능" 주석 제거
- `storage.js`:
  - `autoSave()` 주석 "saveLocalData와 동일한 방식" → "변경된 characters를 localStorage에 저장"으로 수정
  - `migrateRuneData()` 앞에 호출 순서 명시 주석 추가 (migrateInputs 먼저 실행해야 함)
  - `migrateInputs()` 앞에 호출 순서 및 구조 예시 주석 추가
- `state.js`: "전역 별칭 제거 완료" 주석 → "AppConstants 별칭은 shared_constants.js에서 하위 호환용으로 유지 중"으로 수정
- `ui-character.js`: `getInputData()` 헬퍼 주석에 중첩 구조 예시 추가

**[7번] 이미지 파일 폴더 이동**

- `eq_weapon.js`: 이미지 경로 전체를 `"파일명.png"` → `"images/파일명.png"` 로 변경 (11곳)
- 실제 이미지 파일 이동(`images/` 폴더 생성)은 5번 파일 트리 정리 시 함께 진행

**[6번] .md 파일 정리**

- `README_old.md` 삭제 (구버전 내용)
- `README-TEST.md` 삭제 (테스트 기록)
- `QUICK-START.md` 삭제 (README.md와 내용 중복)
- `eq_README.md` 삭제 (README.md와 내용 완전 동일)
- `dev-log.md` 삭제 → `new-dev-log.md`에 "[통합 이전] project1 개발 기록" 섹션으로 통합
- `eq_dev-log.md` 삭제 → `new-dev-log.md`에 "[통합 이전] project2 개발 기록" 섹션으로 통합
- 최종 md 파일: `README.md`, `new-dev-log.md` 2개만 유지

**수정 파일:** `eq_equipment.js`, `storage.js`, `state.js`, `ui-character.js`, `eq_weapon.js`, `new-dev-log.md`
**삭제 파일:** `README_old.md`, `README-TEST.md`, `QUICK-START.md`, `eq_README.md`, `dev-log.md`, `eq_dev-log.md`

---

## 2026-02-28 (47차)

### 파일 트리 구조 정리 (5번)

**폴더 생성 및 파일 이동**

| 폴더 | 이동한 파일 |
|------|------------|
| `js/` | main.js, state.js, storage.js, utils.js, ui-*.js (13개) |
| `scripts/` | eq_character.js, eq_core.js, eq_data.js, eq_equipment.js, eq_main.js, eq_weapon.js |
| `shared/` | shared_constants.js, shared_data.js, shared_weapon.js |
| `styles/` | styles.css, eq_main.css, merged.css |
| `images/` | 이미지 파일 9개 (png) |

**경로 수정**

- `index.html`: `css/styles.css` → `styles/styles.css` (기존에 css/ 폴더가 없었으므로 styles/로 통일)
- `eq_index.html`, `merged.html`: 이미 올바른 경로 사용 중 → 수정 불필요
- `scripts/eq_weapon.js`: 7번(46차)에서 이미 `images/` 경로로 수정 완료

**최종 트리**
```
project/
├── eq_index.html
├── index.html
├── merged.html
├── new-dev-log.md
├── package.json
├── README.md
├── images/
│   ├── 강철화로의파편.png
│   ├── 강화된데이터칩.png
│   ├── 데이터칩.png
│   ├── 마누스메모리얼.png
│   ├── 망가진강철톱니바퀴.png
│   ├── 망가진기계캡슐.png
│   ├── 빛의저장소.png
│   ├── 스펙쿨룸파편.png
│   └── 죽은자의성던전특산물선택상자.png
├── js/
│   ├── main.js
│   ├── state.js
│   ├── storage.js
│   ├── ui-character.js
│   ├── ui-compare.js
│   ├── ui-core.js
│   ├── ui-memo-tag.js
│   ├── ui-modal.js
│   ├── ui-rune.js
│   ├── ui-search.js
│   ├── ui-tag-filter.js
│   ├── ui-templates.js
│   └── utils.js
├── scripts/
│   ├── eq_character.js
│   ├── eq_core.js
│   ├── eq_data.js
│   ├── eq_equipment.js
│   ├── eq_main.js
│   └── eq_weapon.js
├── shared/
│   ├── shared_constants.js
│   ├── shared_data.js
│   └── shared_weapon.js
└── styles/
    ├── eq_main.css
    ├── merged.css
    └── styles.css
```

**수정 파일:** `index.html`

---

## 2026-03-01 (48차)

### 캐릭터 관리 탭 - 직업/이름 정보 영역 레이아웃 전면 개편

---

### 변경 배경

기존에 `col-char-info`(좌측 세로 열, `rowspan="18"`)로 구현되어 있던 캐릭터 정보 영역을
표 **위쪽에 가로 한 줄**로 배치하는 방식으로 전면 개편.

---

### 수정 내용

**`js/ui-character.js`**

- `createCharacterTable()` 테이블 구조 변경
  - 기존: `col-char-info` 열(`rowspan="18"`)이 tbody 첫 행 앞에 삽입되는 구조
  - 변경: `char-section-inner` > `char-info-table-wrap` + `table-container` 형태로 분리
    - `char-info-table-wrap` 자리에 템플릿으로 생성한 캐릭터 정보 테이블을 `replaceWith()`로 삽입
    - 장비 표(`table-container`)는 그 아래 독립적으로 배치
  - thead에서 `col-char-info` 열 제거 (기존 `rowspan="2"` 구조로 복원)
  - 삽입 관련 주석 번호 정리 (5-a/5-b → 5/6)

**`styles/merged.css`**

- `table-fit` CSS 블록 전체 제거 (기능 폐기)
- 신규 스타일 추가:
  - `.char-section-inner`: `display: block` (정보 영역 + 표 수직 배치)
  - `.char-info-table`: 장비 표와 동일한 스타일 기반, `border-bottom: none`으로 표와 자연스럽게 연결
  - `.char-info-table th`: 헤더 스타일 (골드색, `white-space: nowrap`)
  - `.char-info-table td`: 셀 패딩 `4px 6px`
  - `.char-info-table input[type="text"]`: `width: 100%`, `box-sizing: border-box`
- 기존 `char-info-bar`, `char-info-cell`, `char-info-divider`, `char-info-memo-preview`, `char-info-btn` 등 이전 시도 스타일 전체 제거

**`js/ui-memo-tag.js`**

- `updateMemoPreview()` 미리보기 글자 수: 5자 → 10자로 변경

**`merged.html`**

- `character-info-template` 구조 전면 변경
  - 기존: `<td class="col-char-info" rowspan="18">` 안에 세로 div 레이아웃으로 스탯/속강/직업/이름/항마력/메모/태그/잠금/해제/이동/삭제 배치
  - 변경: `<table class="char-info-table">` 구조로 교체
    - thead: 직업/이름 | 스탯/속강 | 메모 | 태그 | 잠금 | 해제 | 삭제 | 순서변경 (가로 헤더)
    - tbody: 각 항목을 `<td>` 셀로 가로 배치
      - 1열(rowspan=3): 직업/이름/항마력 input 세로 나열
      - 2열(rowspan=3): 스탯 select + 구분선 + 속강 select 세로 나열
      - 3열(rowspan=3): 메모 미리보기 div + textarea (width: 250px)
      - 4열(rowspan=3): 태그 input + 추가 버튼 + 태그 컨테이너 (width: 150px)
      - 5~8열: 잠금/해제/삭제/▲▼ 버튼 각각 별도 셀

**수정 파일:** `merged.html`, `js/ui-character.js`, `styles/merged.css`, `js/ui-memo-tag.js`

---

### 결과

- 직업/이름/스탯/속강/항마력/메모/태그/잠금/삭제/이동 버튼이 장비 표 위에 별도 테이블(`char-info-table`) 형태로 가로 배치
- 장비 표(`슬롯|희귀도|...`)는 그 아래 독립적으로 배치, 열 너비가 서로 영향 없음
- `col-char-info` 열 완전 제거로 장비 표 구조 단순화
- `merged.html`의 `character-info-template`을 `<td rowspan="18">` 세로 구조 → `<table class="char-info-table">` 가로 테이블 구조로 전면 교체

**수정 파일:** `merged.html`, `js/ui-character.js`, `styles/merged.css`, `js/ui-memo-tag.js`

---
## 2026-03-01 (49차)

### 획득 장비 등록 탭 - 세트 표 헤더에 마법봉인 값 표시

---

### 변경 배경

획득 장비 등록 탭에서 방어구/악세/특장 세트를 열었을 때, 각 부위 헤더에 현재 캐릭터의 마법봉인 값이 표시되지 않아 별도로 캐릭터 관리 탭을 확인해야 했음.

---

### 수정 내용

**`scripts/eq_equipment.js`**

- `getSealHeaderHtml(char, slot)` 헬퍼 함수 추가 (`openSet` 함수 앞)
  - `char.inputs[슬롯]['seal1']['val']`, `['seal1_val']['val']`, `['seal2']['val']`, `['seal2_val']['val']` 값을 읽어 헤더용 HTML 반환
  - 표시 형식: `고유옵션 수치 / 일반옵션 수치` (값이 없는 항목은 `-`로 표시)
  - 둘 다 없는 슬롯도 `- / -`로 표시
  - 텍스트 색상: `#aad4ff` (연하늘색), `font-size: 0.9em`

- `openSet()` 내 각 장비 유형 헤더(`<th>`)에 마법봉인 표시 추가
  - **방어구 (ARMOR_DISPLAY_NAMES 있음)**: `headerSlots2` 각 `<th>`에 추가
  - **방어구 (ARMOR_DISPLAY_NAMES 없음)**: `headerSlots` 각 `<th>`에 추가
  - **악세 (ACCESSORY)**: `headerSlots1` 각 `<th>`에 추가
  - **특장 (SPECIAL)**: `headerSlots1` 각 `<th>`에 추가

**수정 파일:** `scripts/eq_equipment.js`

---

### 결과

- 세트 버튼 클릭 시 나타나는 표의 각 부위 헤더(슬롯명 + 아이템명) 아래에 현재 캐릭터의 마법봉인 값이 연하늘색으로 표시됨
- 값이 없는 항목은 `-`로 표시, 둘 다 없어도 `- / -`로 표시
- 표시 예시:
  ```
  지능 46 / 지능 46   ← 둘 다 있는 경우
  지능 46 / -         ← 첫 번째만 있는 경우
  - / 지능 46         ← 두 번째만 있는 경우
  - / -               ← 둘 다 없는 경우
  ```

---

## 2026-03-01 (50차)

### 캐릭터별 장비 보유 현황 / 검색 결과 - 달성 열 추가

---

### 변경 배경

캐릭터별 장비 보유 현황 표와 검색 결과 표에 달성 열이 없어, 세트 달성 여부를 한눈에 확인하기 어려웠음.
모두/일반/접두어 탭의 달성 열과 동일한 방식으로 추가 요청.

---

### 수정 내용

**`scripts/eq_equipment.js`**

- `renderCharacterEquipmentDetail()` 수정
  - 표 헤더 맨 끝에 `달성` `<th>` 추가
  - 각 행 맨 끝에 달성 `<td>` 추가
    - 익시드 행: 빈 칸
    - 일반/접두어 행: 보유 슬롯 수 표시
  - 세트 구분선 `colspan` 수정: `3 + slots` → `4 + slots`
  - 색상 기준: 방어구 5부위 달성 시 금색(`#ffd700`), 3부위 이상 초록(`#2ecc71`) / 악세·특장 3부위 달성 시 초록

- `searchEquipment()` 수정
  - 표 헤더 맨 끝에 `달성` `<th>` 추가
  - 각 행 맨 끝에 달성 `<td>` 추가 (동일한 색상 기준 적용)
  - 세트 구분선 `colspan` 수정: `3 + slots` → `4 + slots`

**수정 파일:** `scripts/eq_equipment.js`

---

### 결과

- 캐릭터별 장비 보유 현황 표와 검색 결과 표 오른쪽 끝에 달성 열 표시
- 모두/일반/접두어 탭과 동일한 색상 기준으로 세트 달성 여부 표시

---

## 2026-03-02 (51차)

### 버튼 스타일 정리 및 통합

---

### 변경 배경

상단 툴바 버튼(JSON 저장/불러오기)과 캐릭터 관리 탭 버튼들이 서로 다른 클래스를 사용하고 있어 크기 조절 시 여러 곳을 수정해야 하는 불편함이 있었음. 또한 `<label>` 태그로 구현된 JSON 불러오기 버튼이 `<button>`과 렌더링 크기가 달랐음.

---

### 수정 내용

**`merged.html`**

- JSON 불러오기: `<label class="file-label">` → `<button class="action-btn">` 으로 변경
  - `<input type="file">`은 바깥으로 분리, 버튼 클릭 시 `document.getElementById('jsonFile').click()`으로 동작
- JSON 경로 지정 저장: `class="char-btn"` → `class="action-btn"` 으로 변경
  - 세 JSON 버튼(저장/경로지정저장/불러오기) 모두 `action-btn`으로 통일
- 획득 장비 등록 탭 편집 버튼: `class="add-btn"` → `class="edit-btn"` 으로 변경
- 캐릭터 관리 탭 6개 버튼: 모두 `class="ctrl-btn"` 으로 통일
  - 캐릭터 추가: `add-btn` → `ctrl-btn`
  - 전체 잠금: `btn-all-lock` → `ctrl-btn`
  - 기본/비교/검색/태그: `btn-mode` → `ctrl-btn`

**`merged.css`**

- `.file-label` 관련 스타일 사실상 미사용 (JSON 불러오기가 button으로 전환됨)
- `.add-btn` → `.edit-btn` 으로 클래스명 변경 (편집 버튼 전용)
- `.ctrl-btn` 신규 추가: 캐릭터 관리 탭 6개 버튼 공통 스타일
- `.ctrl-btn.active` 추가: 기본/비교/검색/태그 눌린 상태 스타일
- `#section-detail-view .btn-all-lock` 제거 → `.ctrl-btn`으로 통합
- `#section-detail-view .btn-mode` / `.btn-mode.active` 제거 → `.ctrl-btn`으로 통합
- `#section-detail-view .ctrl-btn` 중복 블록 제거 → `.ctrl-btn` 단일 블록으로 통합
- 미디어쿼리(초소형/소형 화면) 및 프린트 스타일에서 `btn-mode`, `btn-all-lock` → `ctrl-btn` 으로 교체

**수정 파일:** `merged.html`, `merged.css`

---

### 결과

- JSON 저장/경로지정저장/불러오기: `.action-btn` 하나로 크기 통합 관리
- 캐릭터 관리 탭 6개 버튼: `.ctrl-btn` 하나로 크기 통합 관리
- 획득 장비 등록 탭 편집 버튼: `.edit-btn` 으로 독립 관리

---

## 2026-03-02 (52차)

### 탭별 상단 공백 통합 관리 및 구조 정리

---

### 변경 배경

각 탭 전환 시 툴바/버튼과의 거리(상단 공백)가 탭마다 제각각이었음. 원인은 각 섹션에 인라인 `padding`이 제각각으로 붙어있고, `.toolbar`/`.control-bar` 등 서로 다른 요소가 공백을 담당하고 있었기 때문. 또한 `.toolbar`에 인라인 `padding: 10px 0`이 직접 붙어있어 CSS 클래스 수정이 무시되고 있었음.

---

### 수정 내용

**`merged.html`**

- 5개 섹션 div 모두 `class="section-view"` 추가, 인라인 `padding` 제거
  - `section-equipment-view`: `padding: 20px` 제거
  - `section-weapon-view`: `padding-top: 0` 제거, `<h2>[무기]</h2>` 구조를 다른 탭과 동일하게 `margin:0` 적용
  - `section-craft-view`: `padding: 20px` 제거
  - `section-detail-view`: `padding-top: 0` 인라인 추가 (sticky control-bar가 별도로 padding 처리)
- `.toolbar` div 인라인 스타일에서 `padding: 10px 0` 제거

**`merged.css`**

- `.section-view { padding-top: 15px; }` 신규 추가
  - **이 값 하나로 모든 탭의 상단 공백을 한번에 조절 가능**
- `.toolbar`의 `margin: 15px 0` → `margin: 0` 으로 초기화 (section-view로 통합)
- `#section-detail-view .control-bar`의 `padding: var(--spacing-md) 0` → `padding: 15px 0 0 0` 으로 변경
  - `control-bar`는 `position: sticky`라 부모의 `padding-top`을 무시함
  - 대신 `control-bar` 자체에 `padding-top: 15px`을 줘서 `.section-view`와 동일한 값으로 맞춤
  - `.section-view`의 `padding-top` 값 변경 시 이 값도 같이 맞춰줘야 함

**수정 파일:** `merged.html`, `merged.css`

---

### 결과

- 모든 탭(획득 장비 등록 / 무기 등록 / 장비 현황 / 제작 등록 / 캐릭터 관리)의 상단 공백이 동일하게 통일됨
- 공백 조절은 `merged.css`의 `.section-view { padding-top: 15px; }` 값 하나만 수정하면 됨
  - 단, 캐릭터 관리 탭은 `#section-detail-view .control-bar`의 `padding-top`도 같은 값으로 같이 수정 필요

---

## 2026-03-02 (53차)

### 제작 등록 탭 - 숫자 입력 시 깜박임 및 스크롤 이동 문제 수정

---

### 변경 배경

제작 등록 탭에서 숫자를 입력할 때마다 화면이 깜박이고 스크롤 위치가 초기화되는 문제가 있었음.

---

### 원인

`input` 이벤트 발생 시마다 `renderCraftTable()`을 호출하여 테이블 전체를 DOM에서 삭제하고 다시 생성했기 때문. 전체 재렌더링으로 인해 깜박임과 스크롤 위치 초기화가 발생.

---

### 수정 내용

**`scripts/eq_weapon.js`**

- `updateCraftTotals()` 함수 신규 추가
  - 기존 DOM은 그대로 유지하고 합계 셀 숫자만 업데이트
  - 캐릭터별 합계 셀(각 행 마지막 `td`) 갱신
  - 재료별 합계 행(마지막 `tr`) 갱신
  - 전체 합계 셀 갱신

- `input` 이벤트 핸들러 수정
  - 수정 전: `renderCraftTable()` 호출 (전체 재렌더링)
  - 수정 후: `updateCraftTotals()` 호출 (합계만 갱신)

- `renderCraftTable()`은 기존대로 탭 전환 / 계산 / 실행취소 시에만 호출

**수정 파일:** `scripts/eq_weapon.js`

---

### 결과

- 숫자 입력 시 깜박임 없음
- 스크롤 위치 유지

---

## 2026-03-02 (54차)

### 캐릭터 관리 탭 - 모바일 버튼 크기 및 장비 표 스크롤 구조 수정

---

### 변경 배경

모바일(844px 기준)에서 두 가지 문제 발생:
1. 캐릭터 추가/전체 잠금/기본/비교/검색/태그 버튼(`ctrl-btn`)과 잠금/해제/삭제/순서변경 버튼이 모바일에서 크기가 줄어들지 않음
2. 직업/이름 표는 전체 페이지 가로 스크롤로 볼 수 있는데, 장비 표는 컨테이너 안에서만 스크롤되어 구조가 다름

---

### 원인 분석

**버튼 크기 문제**
- CSS 선언 순서 문제: 기본 `.ctrl-btn` 스타일(2200번대 줄)이 미디어쿼리(300번대 줄)보다 뒤에 위치하여 미디어쿼리 수정이 덮어씌워짐
- `btn-char-lock`, `btn-char-unlock`, `del-btn` 버튼에 모바일 미디어쿼리 스타일이 아예 없었음
- HTML 템플릿의 잠금/해제/삭제 버튼에 인라인 `style="width:100%"`가 있어 CSS 무시됨

**장비 표 스크롤 문제**
- `.table-container`에 `overflow-x: auto`가 설정되어 장비 표가 컨테이너 안에서만 스크롤됨
- 직업/이름 표(`char-info-table`)는 overflow 설정 없이 전체 페이지 스크롤

---

### 수정 내용

**`merged.css`**

버튼 크기:
- `max-width: 1024px` 미디어쿼리에 `.ctrl-btn` `!important` 추가
- `max-width: 1024px` 미디어쿼리에 `.btn-char-lock`, `.btn-char-unlock`, `.del-btn`, `.btn-move` 크기 축소 추가
- `max-width: 480px` 미디어쿼리에 `.ctrl-btn`, `.btn-char-lock` 등 `!important` 추가
- 중복 미디어쿼리 3세트(`max-width: 1024px`, `max-width: 767px`, `max-width: 480px`) → 1세트로 통합
- `.control-bar button` → `.ctrl-btn`으로 교체 (일반 미디어쿼리 + orientation 미디어쿼리 모두)

장비 표 스크롤:
- `.table-container` `overflow-x: auto` → `visible` (기본 스타일 + 미디어쿼리 전체)
- `portrait` 미디어쿼리의 `table-container` 내 `overflow-x: auto`, scrollbar 스타일 제거 → `overflow-x: visible`로 교체
- `min-width: 700px`, `min-width: 800px` 제거

**`merged.html`**

- 잠금/해제/삭제 버튼 인라인 `style`에서 `width: 100%` 제거

---

### 참고

- 중복 미디어쿼리 제거 시 두 블록의 차이: 첫 번째 블록은 `font-size: var(--fs-button)`, 두 번째 블록은 `font-size: var(--fs-xs)` → 두 번째 기준으로 통합
- `.section-view`의 `padding-top` 값 변경 시 `.control-bar`의 `padding-top`도 같이 맞춰야 함 (52차 참고)
- `portrait` 미디어쿼리의 scrollbar 스타일은 `overflow-x: visible` 전환으로 적용 대상이 없어져 함께 제거

**수정 파일:** `merged.css`, `merged.html`

---

## 2026-03-02 (55차)

### 세트/접두어/강화 팝업 - 동작 개선 통합

**수정된 파일:** `js/ui-core.js`

---

### 변경 내용

**1. 팝업 position:absolute 전환 (표 높이 초과 스크롤바 문제 해결)**

- 기존: 모든 팝업이 `position: fixed` + `document.body.appendChild` 구조 → 팝업이 표 바깥에 렌더링되어 페이지 스크롤바 발생
- 변경: `_adjustMenuPosition()`에서 `tableContainer.appendChild(menu)`로 이동, `position: absolute` 전환
  - 팝업이 `.table-container` 내부 요소가 되어 페이지 레이아웃에 영향 없음
  - `max-height = 표 가시 높이 - 8px` 기준으로 제한 → 팝업이 표 세로를 넘지 않음
  - 서브패널도 동일하게 `_tc.appendChild(panel)` + `position: absolute`
  - `_positionMenu()`: 초기 위치를 `-9999px`로 설정 (화면 밖에서 렌더링 후 이동)

**2. 방어구 1~4개 서브패널 허용 (alert 제거)**

- 기존: 방어구 3개 미만이면 `alert('보유 세트가 3개 미만입니다.')` 표시 후 팝업 닫힘
- 변경: `isPartial = count >= 1 && !isFull` → 1개 이상이면 서브패널 열기
- 0개일 때만 비활성 (클릭 불가), `hasNone` 변수 및 alert 완전 제거

**3. 서브패널 닫힘 동작 개선**

- 세트 항목 텍스트 클릭 시: 기존 서브패널 먼저 닫고 새 서브패널 열기 (onclick/touchend 양쪽 처리)
- 세트 항목 오른쪽 빈 공간(`spacer`) 클릭/터치 시: 서브패널 닫기
  - 기존 `pointer-events: none` → 이벤트 수신 가능하도록 변경
- 풀세트 클릭 시: 서브패널 있으면 먼저 닫고 바로 적용
- 취소 버튼: `panel.remove()`만 실행 (세트 팝업은 유지)

---

## 2026-03-03 (56차)

### 세트/익시드 아이템이름 색상 로직 전면 재작성 및 버그 수정

**수정된 파일:** `js/ui-core.js`, `js/ui-character.js`, `styles/styles.css`, `styles/merged.css`

---

### 변경 배경

세트 색상 표시가 잘못 동작하는 문제 지속 발생:
1. 세트가 아닌 부위에 파란색이 표시됨
2. 익시드 장비는 초록색으로 잘 표시되나 세트 판정이 전혀 안 됨
3. 페이지 로드(데이터 복구) 시에만 색상이 잘못 나오고, 직접 변경하면 정상

---

### 원인 분석

**1. 구조적 문제 — 기존 `checkSetColor()` 로직**
- `armorSets` 순회 시 `slotToSet[slot] = setName`을 반복 덮어써서 마지막 순회 세트명으로 판정되는 버그

**2. NodeList static 스냅샷 문제 — `restoreSavedData`**
- `const inputs = section.querySelectorAll(...)` 으로 미리 저장하면 static snapshot
- 1단계 rarity 복구 시 `replaceItemNameField`가 새 select를 생성하는데 이 요소가 목록에 없어 값 복구 누락
- 결과적으로 `refreshAllItemNameColors` 실행 시 itemname 값이 모두 `""`로 읽혀 세트 판정 실패

**3. localStorage 저장 데이터 잔재 클래스 — 근본 원인**
- 구버전 코드에서 세트/익시드 색상을 CSS 클래스(`.set-highlight`, `.ex-itemname-light`)로 처리
- 이 클래스가 localStorage `cls` 필드에 저장된 채 남아있어, 복구 시 `el.className = data.cls`로 적용되어 잘못된 색상 표시
- 콘솔로 localStorage 직접 확인하여 발견:
```json
"itemname": { "val": "퀸 스파이더 상의", "cls": "itemname-color-sync set-highlight" }
```

---

### 수정 내용

**`js/ui-core.js` — 색상 로직 전면 재작성**

기존 `checkSetColor()` 계열 함수 전부 제거 후 새로 작성:
- 제거: `checkSetColor()`, `clearAllArmorSetColors()`, 기존 `runSetCheck()` 및 래퍼 3종
- 추가: `applyItemNameColor()`, `getActiveSetSlots()`, `refreshItemNameColors()`, `refreshAllItemNameColors()`

색상 우선순위:
1. 3세트 이상 해당 슬롯 → 파란색 `#71D2E5`
2. 익시드 선택됨 → 초록색 `#85EFAD`
3. 기본 → 노란색 (CSS `.rare-에픽` 기본값)

세트 판정 방식 변경: 기존 세트 순회 덮어쓰기 → 아이템→세트 역방향 맵으로 정확하게 판정

**`js/ui-character.js` — `restoreSavedData` 수정**

- `const inputs = querySelectorAll(...)` 제거 → `querySelectorAll(...).forEach(...)` 직접 호출로 변경
- cls 복구 시 `set-highlight`, `ex-itemname-light` 클래스 정규식으로 제거

**`styles/styles.css`, `styles/merged.css`**

- `.set-highlight`, `.ex-itemname-light` 규칙 제거 (JS 미사용, inline style로 처리)

---

## 2026-03-03 (57차)

### 방어구 이미지 경로 수정

**수정된 파일:** `js/ui-character.js`

---

### 변경 내용

- 상의 아이템이름 이미지 미리보기 경로 변경
  - 기존: `images/{아이템명}.png`
  - 변경: `images/ARMOR/{아이템명}.png`

---

## 2026-03-03 (58차)

### 상의 슬롯 접두어/익시드 연동 및 글자색 버그 수정

**수정된 파일:** `js/ui-core.js`, `js/ui-character.js`, `shared/shared_data.js`, `styles/styles.css`, `styles/merged.css`

---

### 변경 내용

**`shared/shared_data.js` — ARMOR_ITEM_INFO 맵 추가**

- 아이템이름 → `{ setName, prefixes, isExceed }` 역방향 맵 자동 생성
- `ARMOR_DISPLAY_NAMES` 기준으로 상의 배열 index 0 = 익시드 아이템, index 1 = 일반 아이템으로 판별

**`js/ui-core.js` — refreshArmorSlotState / refreshAllArmorSlotStates 추가**

케이스 3개로 명확히 분리:

1. 아이템이름 없음 → 접두어/익시드 모두 disabled + 빈칸 초기화
2. 익시드 아이템 (index 0) → 접두어 공백 없이 세트 목록 + 첫 번째 자동 선택, 익시드 공백 없이 "이상" 자동 선택 (복구 시 저장값 유지, 유효하지 않으면 첫 번째 값)
3. 일반 아이템 (index 1) → 접두어 공백 포함 세트 목록 + 공백 선택, 익시드 항상 disabled (복구 시 저장값 유지, 유효하지 않으면 공백)

버그 수정:
- `innerHTML` 교체 전 현재값 저장 (교체 후 value 초기화되는 타이밍 문제)
- 익시드 select `innerHTML`도 직접 교체하여 HTML 원본 공백 옵션 제거
- 일반 아이템 복구 시 exceedSel에 이전 값이 남아 초록색으로 나오던 문제 수정
- `change` 이벤트 실행 순서 수정: `refreshArmorSlotState` → `runSetCheck` 순서로 변경 (기존 반대 순서로 색상 결정 시 exceedSel이 이전 값이었음)
- `updateStyle` prefix 블록의 `refreshArmorSlotState` 호출이 무한루프를 일으키던 문제 수정 → 익시드 재계산만 직접 처리

**`js/ui-character.js`**

- `handleItemNameField` itemname onchange 순서 수정: `refreshArmorSlotState` → `runSetCheck`
- `restoreSavedData` itemname 복구 시 `rare-에픽`, `itemname-color-sync` 클래스 강제 보장 (구버전 저장 데이터 cls에 클래스 누락 시 흰색으로 나오던 문제)
- `restoreSavedData` setTimeout에 `refreshAllArmorSlotStates` 추가
- 신규 캐릭터 생성 시 `refreshAllArmorSlotStates` 호출 추가

**`styles/styles.css`, `styles/merged.css`**

- `.col-exceed select:disabled`, `.col-prefix select:disabled` → `opacity: 0.5` 추가

---

### 이미지 경로 수정

- 상의 아이템 이미지 경로: `images/` → `images/ARMOR/`

---

## 2026-03-03 (59차)

### 상의 슬롯 접두어/익시드/이미지 연동 구현 및 버그 수정

**수정된 파일:** `js/ui-core.js`, `js/ui-character.js`, `shared/shared_data.js`, `styles/styles.css`, `styles/merged.css`

---

### 변경 내용

**`shared/shared_data.js` — ARMOR_ITEM_INFO 맵 추가**

- 아이템이름 → `{ setName, prefixes, isExceed }` 역방향 맵 자동 생성
- `ARMOR_DISPLAY_NAMES` 배열 기준 index 0 = 익시드 아이템, index 1 = 일반 아이템으로 자동 판별

**`js/ui-core.js` — refreshArmorSlotState / refreshAllArmorSlotStates 추가**

케이스 3개로 분리:

- 아이템이름 없음 → 접두어/익시드 모두 disabled + 초기화
- 익시드 아이템 → 접두어 공백 없이 세트 목록, 첫 번째 자동 선택 / 익시드 공백 없이 "이상" 자동 선택 (복구 시 저장값 유지, 유효하지 않으면 첫 번째 값)
- 일반 아이템 → 접두어 공백 포함 세트 목록, 공백 선택 / 익시드 항상 disabled (복구 시 저장값 유지, 유효하지 않으면 공백)

버그 수정:

- `innerHTML` 교체 전 현재값 저장 (교체 후 value 초기화되는 타이밍 문제)
- 익시드 select `innerHTML` 직접 교체하여 HTML 원본 공백 옵션 제거
- `updateStyle` prefix 블록의 `refreshArmorSlotState` 호출 무한루프 방지 → 익시드 재계산만 직접 처리
- 접두어 변경 시 상의 이미지 갱신 추가 (`updateStyle` prefix 블록)
- `replaceItemNameField` change 이벤트에 `refreshArmorSlotState` 누락 수정

**`js/ui-character.js`**

- `handleItemNameField` / `replaceItemNameField` change 이벤트 실행 순서 수정
  - 기존: `updateItemImage` → `refreshArmorSlotState` → `runSetCheck`
  - 변경: `refreshArmorSlotState` → `updateItemImage` → `runSetCheck`
- `restoreSavedData` 2단계 조기 `updateItemImage` 호출 제거 (접두어 복구 전 잘못된 이미지 표시 방지)
- `restoreSavedData` setTimeout에 `refreshAllArmorSlotStates` → `updateItemImage` 순서로 통합
- 신규 캐릭터 생성 시 `refreshAllArmorSlotStates` 호출 추가
- itemname 복구 시 `rare-에픽`, `itemname-color-sync` 클래스 강제 보장 (흰색 글자 방지)
- `updateItemImage` 파일명 규칙 변경
  - 접두어 없음 → `images/ARMOR/{아이템이름}.png`
  - 접두어 있음 → `images/ARMOR/{접두어}_{아이템이름}.png`
  - 아이템이름 콜론(`:`) → `_` 치환 (예: `레거시: 라이트니스 오토 상의` → `레거시_라이트니스 오토 상의`)

**`styles/styles.css`, `styles/merged.css`**

- `.col-exceed select:disabled`, `.col-prefix select:disabled` → `opacity: 0.5` 추가

---

## 2026-03-03 (60차)

### 팔찌 슬롯 접두어/익시드/이미지 연동 구현 + 레거시 아이템이름 정리 + 강제 접두어 처리

**수정된 파일:** `js/ui-core.js`, `js/ui-character.js`, `shared/shared_data.js`

---

### 변경 내용

**`shared/shared_data.js`**

- `ACC_ITEM_INFO` 맵 추가 (`ACCESSORY_DISPLAY_NAMES` + `ACCESSORY_PREFIX` 기반, `ARMOR_ITEM_INFO`와 동일 구조)
- `ARMOR_DISPLAY_NAMES`, `ACCESSORY_DISPLAY_NAMES` 내 레거시 아이템이름에서 `"레거시: "` 접두 제거 (방어구 12개, 악세서리 8개)
  - 예: `"레거시: 휘몰아치는 마력의 태풍"` → `"휘몰아치는 마력의 태풍"`
  - 세트명 키(`"레거시: 마력의 소용돌이"` 등)는 변경하지 않음
  - 이유: 레거시는 접두어 자체가 "레거시"이므로 아이템이름에 중복 포함할 필요 없음
- `FORCED_PREFIX_ITEMS` 상수 추가
  - 일반 아이템이지만 접두어가 강제 지정되는 아이템 목록 (공백 선택 없음, 첫 번째 값 자동 선택)
  - 해당 아이템: `"라이트니스 오토 상의"`, `"마력의 폭풍우"`, `"강철 리스트 가드"`, `"홀리 미스릴 렐릭"`

**`js/ui-core.js`**

- `_refreshSlotState` 공통 함수로 추출 (방어구/악세서리 공통 로직)
- `refreshAccSlotState(slot, charId, isRestore)` 추가 — `ACC_ITEM_INFO` 기반
- `refreshAllAccSlotStates(charId)` 추가 — 팔찌/목걸이/반지 일괄 갱신
- `_refreshSlotState` 케이스 3(일반 아이템)에 `FORCED_PREFIX_ITEMS` 체크 추가
  - 해당 아이템 선택 시 공백 없이 첫 번째 접두어 자동 선택
  - 무효 접두어 복구 시에도 첫 번째 값으로 자동 보정
- `replaceItemNameField` 이벤트 분기 확장
  - 팔찌: `refreshAccSlotState` → `updateAccImage` → `runSetCheck`
  - 목걸이/반지: `refreshAccSlotState` → `runSetCheck`
- 팔찌 접두어 변경 시 `updateAccImage` 갱신 추가
- 익시드 재계산 블록을 방어구 + 악세서리 슬롯 모두 처리하도록 확장

**`js/ui-character.js`**

- `updateAccImage` 함수 추가
  - 경로: `images/ACCESSORY/{접두어}_{아이템이름}.png` / `images/ACCESSORY/{아이템이름}.png`
  - 콜론+공백 → `_` 치환, 접두어 중복 방지 (레거시 케이스)
- `updateItemImage`도 동일하게 접두어 중복 방지 로직 적용
  - `(prefix && !safeName.startsWith(prefix + '_'))` 조건 추가
- `handleItemNameField` 이벤트 분기 확장
  - 팔찌: `refreshAccSlotState` → `updateAccImage` → `runSetCheck`
  - 목걸이/반지: `refreshAccSlotState` → `runSetCheck`
  - 팔찌 슬롯 이미지 미리보기 img 태그 추가
- `restoreSavedData` setTimeout에 `refreshAllAccSlotStates` + 팔찌 이미지 복구 추가
- 신규 캐릭터 생성 시 `refreshAllAccSlotStates` 호출 추가

### 이미지 파일명 규칙

- 접두어 없음 → `images/ACCESSORY/{아이템이름}.png`
- 접두어 있음 → `images/ACCESSORY/{접두어}_{아이템이름}.png`
- 레거시: `"아이언 엠벨리시드 밴드"` + 접두어 `"레거시"` → `레거시_아이언 엠벨리시드 밴드.png`

---

## 2026-03-03 (61차)

### 귀걸이 슬롯 접두어/익시드/이미지 연동 구현

**수정된 파일:** `js/ui-core.js`, `js/ui-character.js`, `shared/shared_data.js`

---

### 변경 내용

**`shared/shared_data.js`**

- `SPECIAL_ITEM_INFO` 맵 추가 (`SPECIAL_DISPLAY_NAMES` + `SPECIAL_PREFIX` 기반, 기존 INFO 맵과 동일 구조)
  - 귀걸이 배열 index 0 = 익시드, index 1 = 일반
  - 레거시 없음

**`js/ui-core.js`**

- `refreshSpecialSlotState(slot, charId, isRestore)` 추가 — `SPECIAL_ITEM_INFO` 기반
- `refreshAllSpecialSlotStates(charId)` 추가 — 귀걸이/마법석/보조장비 일괄 갱신
- `replaceItemNameField` 이벤트 분기 확장
  - 귀걸이: `refreshSpecialSlotState` → `updateSpecialImage` → `runSetCheck`
  - 귀걸이 이미지 미리보기 img 태그 추가
  - 귀걸이 에픽 즉시 이미지 갱신 추가
  - 귀걸이/마법석/보조장비 `refreshSpecialSlotState` 호출 추가
- 접두어 변경 시 익시드 재계산 블록을 특수장비 슬롯까지 확장
- 귀걸이 접두어 변경 시 `updateSpecialImage` 갱신 추가

**`js/ui-character.js`**

- `updateSpecialImage` 함수 추가
  - 경로: `images/SPECIAL/{접두어}_{아이템이름}.png` / `images/SPECIAL/{아이템이름}.png`
- `handleItemNameField` 귀걸이 분기 추가
  - `refreshSpecialSlotState` → `updateSpecialImage` → `runSetCheck`
  - 귀걸이 이미지 미리보기 img 태그 추가
- `restoreSavedData` setTimeout에 `refreshAllSpecialSlotStates` + 귀걸이 이미지 복구 추가
- 신규 캐릭터 생성 시 `refreshAllSpecialSlotStates` 호출 추가

---

## 2026-03-03 (62차)

### 전체 슬롯 접두어/이미지 연동 구현

**수정된 파일:** `js/ui-core.js`, `js/ui-character.js`

---

### 변경 내용

**`js/ui-character.js`**

- `_applySlotImage(select, slot, folder)` 공통 헬퍼 추가
  - 기존 `updateItemImage`, `updateAccImage`, `updateSpecialImage` 3개 함수를 헬퍼 기반으로 리팩토링
  - 신규 8개 슬롯 이미지 함수 추가
    - ARMOR: `updatePantsImage`(하의), `updateShoulderImage`(어깨), `updateBeltImage`(벨트), `updateShoesImage`(신발)
    - ACCESSORY: `updateNecklaceImage`(목걸이), `updateRingImage`(반지)
    - SPECIAL: `updateMagicImage`(마법석), `updateSubImage`(보조장비)
- `handleItemNameField` 슬롯별 이벤트 분기 확장
  - 하의/어깨/벨트/신발: `refreshArmorSlotState` + 이미지 갱신
  - 목걸이/반지: `refreshAccSlotState` + 이미지 갱신
  - 마법석/보조장비: `refreshSpecialSlotState` + 이미지 갱신
- 이미지 미리보기 img 태그 삽입 조건을 전체 11개 슬롯으로 확장
- `restoreSavedData` 이미지 복구를 11개 슬롯 루프로 통합

**`js/ui-core.js`**

- `replaceItemNameField` change 이벤트를 슬롯맵(`_slotRefreshFn`, `_slotImgFn`) 기반으로 통합
  - 슬롯에 따라 refresh 함수와 이미지 함수 자동 선택
- 접두어 변경 시 이미지 갱신 블록을 `_prefixImgFnMap` 기반으로 통합 (11개 슬롯 일괄 처리)
- 이미지 미리보기 img 태그 삽입 및 즉시 업데이트 조건을 전체 슬롯으로 확장
- `refreshSpecialSlotState` 호출을 `replaceItemNameField` 내 슬롯맵으로 통합

### 이미지 경로 규칙 (전체)

| 슬롯 | 폴더 |
|------|------|
| 상의/하의/어깨/벨트/신발 | `images/ARMOR/` |
| 팔찌/목걸이/반지 | `images/ACCESSORY/` |
| 귀걸이/마법석/보조장비 | `images/SPECIAL/` |

---

## 2026-03-04 (63차)

### 무기 엠블렘 색상 선택 버튼 추가

**수정된 파일:** `js/ui-character.js`

---

### 변경 내용

**`js/ui-character.js`**

- 테이블 헤더 `엠블렘` th에 🎨 버튼 추가
  - 버튼 클릭 시 `openEmblemColorPicker(event, charId)` 호출
- `openEmblemColorPicker` 함수 추가
  - 빨강/노랑/파랑/초록 4개 색상 버튼 팝업 표시
  - 선택 시 `applyWeaponEmblemColor(charId, colorCls)` 호출
  - 외부 클릭 시 자동 닫힘
- `applyWeaponEmblemColor` 함수 추가
  - 무기 행 `emb1`, `emb2` **input 요소에 직접** `emb-bg-*` 클래스 적용
  - td에 클래스를 주면 input이 위를 덮고, inline style은 `!important` CSS에 지므로 input에 직접 클래스 추가하는 방식 사용
  - `무기_emb_color` hidden input에 선택 색상 저장 → `autoSave()` 연동
  - 저장/복구는 `autoSave`가 `el.className` 저장, `restoreSavedData`가 `el.className = data.cls`로 복구하므로 자동 처리됨
- 신규 캐릭터 생성 시 무기 엠블렘 기본 색상 **빨강** 자동 적용
- `restoreSavedData` setTimeout에 `emb_color` hidden input 기반 복구 로직 추가 (이중 보장)

---

## 2026-03-04 (64차)

### 칭호/외형칭호/오라 select 전환 및 이미지 연동

**수정된 파일:** `js/ui-character.js`, `js/ui-core.js`, `shared/shared_data.js`

---

### 변경 내용

**`shared/shared_data.js`**

- `itemOptions`에 칭호/외형칭호/오라 선택지 추가
  - `"칭호"`: `["", "우리들의 Arcade"]`
  - `"외형칭호"`: `["", "포효하는 번개"]`
  - `"오라"`: `["", "우리들의 Arcade 오라"]`
- `TITLE_ITEM_INFO` 상수 추가 — 칭호 아이템 상세 정보 (나중에 열람 기능에서 사용)
  - `"우리들의 Arcade"` 기본정보 및 효과 텍스트 포함
- `AURA_ITEM_INFO` 상수 추가 — 오라 아이템 상세 정보
  - `"우리들의 Arcade 오라"` 기본정보 및 효과 텍스트 포함
- `GameData`에 `TITLE_ITEM_INFO`, `AURA_ITEM_INFO` 추가

**`js/ui-core.js`**

- `replaceItemNameField`에 `_forceSelectSlots` 추가
  - 칭호/외형칭호/오라는 희귀도 무관하게 항상 select로 교체
- 이미지 미리보기 img 태그 삽입 조건에 칭호/외형칭호/오라 추가
- change 이벤트, 즉시 이미지 업데이트 조건 `_forceSelectSlots` 포함으로 확장
- `_slotImgFn`, `_prefixImgFnMap`에 칭호/외형칭호/오라 추가
  - 외형칭호: `updateAppearanceTitleImage` (폴더: `images/appearanceTitle/`)

**`js/ui-character.js`**

- `updateTitleImage` → `images/title/`
- `updateAppearanceTitleImage` → `images/appearanceTitle/` (기존 `updateCosmeticImage`에서 변경)
- `updateAuraImage` → `images/aura/`
- `initializePrefixSelects`에서 칭호/외형칭호/오라 rarity select 직접 트리거
  - prefix select 없는 슬롯이므로 별도 처리 필요
- `handleItemNameField` 칭호/외형칭호/오라 분기 추가

### 이미지 파일명 규칙

- `images/title/{아이템이름}.png`
- `images/appearanceTitle/{아이템이름}.png`
- `images/aura/{아이템이름}.png`

---

## 2026-03-04 (65차)

### 칭호/외형칭호/오라 텍스트 입력 차단 및 설명 자동 입력

**수정된 파일:** `js/ui-character.js`, `js/ui-core.js`, `js/ui-memo-tag.js`

---

### 변경 내용

**`js/ui-character.js`**

- `applyItemInfoToDesc(select, slot, charId, infoMap)` 함수 추가
  - 선택한 아이템명으로 `TITLE_ITEM_INFO` 또는 `AURA_ITEM_INFO`에서 info 조회 후 `_desc` textarea에 자동 입력
- 칭호 onchange: `updateTitleImage` + `applyItemInfoToDesc(TITLE_ITEM_INFO)` 호출
- 오라 onchange: `updateAuraImage` + `applyItemInfoToDesc(AURA_ITEM_INFO)` 호출
- 칭호/외형칭호/오라는 `itemOptions` 등록 + `_forceSelectSlots`로 항상 select 보장 → 텍스트 직접 입력 차단

**`js/ui-core.js`**

- `replaceItemNameField` change 이벤트에 칭호/오라 desc 자동 입력 추가

**`js/ui-memo-tag.js`**

- `openDescModal`에서 칭호/외형칭호/오라 desc는 잠금 여부와 무관하게 항상 읽기 전용으로 열림
  - `data-key`가 `칭호_desc`, `외형칭호_desc`, `오라_desc`인 경우 `isReadonlySlot = true`
  - `isLocked || isReadonlySlot` 조건으로 편집 불가 처리
  - 잠금 아이콘은 실제 잠금 상태일 때만 표시

---

## 2026-03-04 (66차)

### 아바타 슬롯 - 팝업 방식으로 전면 개편

**수정된 파일:** `js/ui-character.js`, `js/storage.js`, `styles/merged.css`, `index.html`

---

### 변경 배경

아바타 슬롯은 10개 부위(모자/얼굴/상의/목가슴/신발/머리/하의/허리/피부/무기)에 각각 언커먼/레어 희귀도를 선택해야 하는 구조라, 기존 테이블 행 하나에 모든 칸(희귀도 select, 익시드, 접두어, 강화 수치 등)을 배치하는 방식은 불필요하고 테이블도 복잡해짐.

---

### 수정 내용

**`index.html`**

- `avatar-row-template` 신규 추가
  - 기존 `simple-row-template` 대신 아바타 전용 구조 사용
  - `슬롯명 | 버튼(colspan=13) | 설명` 형태 — 희귀도·익시드·접두어·봉인·엠블렘·마법부여 칸 전부 제거
  - 버튼: `itemname-color-sync` 클래스 + `font-size:var(--fs-table); font-weight:bold` → 다른 아이템이름과 동일한 글자 스타일, `text-align:center`
- 아바타 팝업 HTML 추가
  - overlay + 그리드 컨테이너 + 저장/취소 버튼
  - overlay 클릭 시 팝업 닫힘
  - 팝업 내부 박스는 `avatar-popup-box` 클래스로 테마별 스타일 분리

**`js/ui-character.js`**

- 아바타 행 생성 시 `avatar-row-template` 사용하도록 변경
- `AVATAR_PARTS` 상수 추가: 모자/얼굴/상의/목가슴/신발/머리/하의/허리/피부/무기 10개 부위
- `AVATAR_GRADES` 상수 추가: 언커먼/레어
- `AVATAR_GRADE_CLASS` 상수 추가: 희귀도 → CSS 클래스 매핑
- `renderAvatarBtnHTML(text)` 함수 추가
  - `"모자(언커먼) 상의(레어)"` 형태 텍스트 → 희귀도별 `rare-언커먼` / `rare-레어` 색상 span HTML로 변환
- `openAvatarPopup(charId, btn)` 함수 추가
  - `data-avatar-value` 속성 기준으로 현재 저장값 파싱 → 팝업 열 때 체크박스 상태 복원
  - 헤더("언커먼"/"레어" 텍스트)를 클릭 가능한 span으로 생성
    - 클릭 시 해당 등급 전체 체크, 이미 전부 체크된 상태면 전체 해제(토글)
    - 전체 체크 시 같은 부위의 다른 등급 자동 해제
    - 마우스 호버 시 시각적 피드백
  - 10개 부위를 5개씩 2열로 그리드 배치
  - 같은 부위에서 언커먼/레어 중 하나만 체크 가능
- `avatarPopupSave()` 함수 추가
  - 체크된 항목을 `"모자(언커먼) 상의(레어)"` 형태로 조합
  - 버튼 `data-avatar-value` 속성에 순수 텍스트 저장, `innerHTML`에 `renderAvatarBtnHTML` 결과 적용
  - `autoSave()` 호출
- `avatarPopupClose()` 함수 추가: overlay 클릭으로도 닫힘
- `restoreSavedData` 수정: button 요소에 `renderAvatarBtnHTML`로 색상 span 복원 추가
- 아바타 버튼 텍스트 가운데 정렬

**`js/storage.js`**

- `autoSave()`에 `button[data-key]` 요소 별도 수집 로직 추가
  - `input/select/textarea`는 button을 포함하지 않으므로 별도 처리
  - `data-avatar-value` 속성 우선 사용 (innerHTML의 span 태그 제외한 순수 텍스트 저장)

**`styles/merged.css`**

- `.avatar-popup-box`, `.avatar-popup-title`, `.avatar-popup-btn` 기본 스타일 추가
- 남색 테마(`theme-navy`, `theme-navy2`): 남색 배경 + 남색 테두리 + 밝은 텍스트
- 다크/혼합 테마(`theme-dark`, `theme-mixed`, `theme-dark2`, `theme-mixed2`): 어두운 배경 + 회색 테두리 + 회색 텍스트

---

## 2026-03-04 (67차)

### 아바타 슬롯 - 무기 제거 및 무기 수치 select 추가

**수정된 파일:** `js/ui-character.js`, `js/storage.js`, `index.html`

---

### 변경 내용

**`index.html`**

- `avatar-row-template` 구조 변경
  - 버튼: `colspan=13` → `colspan=9` (희귀도~봉인수치 자리까지)
  - 버튼 오른쪽에 `colspan=4` select 신규 추가 (엠블렘~마법부여 수치 자리)
    - 옵션은 빈 상태로 두고 JS(`AVATAR_WEAPON_STATS`)에서 채움
    - `data-key="아바타_weapon_stat"`

**`js/ui-character.js`**

- `AVATAR_PARTS`에서 `"무기"` 제거 → 팝업에 9개 부위만 표시
- 팝업 그리드: 5개 + 5개 → 5개 + 4개
- `AVATAR_WEAPON_STATS` 배열 추가 — 선택지 데이터를 JS에서 관리
  - `label`: 화면 표시 텍스트
  - `stats`: 저장 시 스탯 키 배열 (쉼표 구분 → 개별 항목으로 분리)
  - `amount`: 저장 시 숫자값 (없으면 null)
  - `optgroup`: true면 `<optgroup>`으로 렌더링 → 선택 불가, 흰색 글자 유지
  - 예시:
    ```js
    { label: '무기 아바타 수치',           stats: ['무기 아바타 수치'],              amount: null, optgroup: true }
    { label: '힘, 지능, 체력, 정신력 +18', stats: ['힘', '지능', '체력', '정신력'], amount: 18 }
    ```
  - 항목 추가/수정은 이 배열만 변경하면 자동 반영
- `_encodeWeaponStatValue(item)` 함수 추가
  - stats 배열을 쉼표로 join + amount는 파이프로 구분하여 option value 인코딩
  - 예: `"힘,지능,체력,정신력|18"`, `"무기 아바타 수치"`
- `initAvatarWeaponStatSelect(section)` 함수 추가
  - 아바타 행 생성/복원 시 `AVATAR_WEAPON_STATS`로 select 옵션 채움
  - `optgroup: true` 항목은 `<optgroup label="...">` 으로 렌더링 (브라우저 기본 동작으로 선택 불가, 흰색 글자 유지)
- 아바타 행 생성 시 `initAvatarWeaponStatSelect` 호출
  - `DocumentFragment`에 직접 호출 (tmpDiv 우회 없이)
- `restoreSavedData` - weapon_stat 복원 로직 추가
  - 신규 구조(`stats` 배열): `stats.join(',') + '|' + amount`로 재조합하여 select value 설정
  - 구버전 `stat` 단일 문자열 / `val` 형식 fallback 처리

**`js/storage.js`**

- 아바타 weapon_stat 저장 구조 변경: `{ stat, amount }` → `{ stats(배열), amount }`
  - select value `"힘,지능,체력,정신력|18"` → `split(',')` 로 배열 분리 후 저장
  - 예: `"weapon_stat": { "stats": ["힘", "지능", "체력", "정신력"], "amount": 18 }`
  - 단일 스탯: `"weapon_stat": { "stats": ["무기 아바타 수치"], "amount": null }`
  - 빈 선택: `"weapon_stat": { "stats": [], "amount": null }`

---

## 2026-03-04 (68차)

### 무기 직업 select + 아이템이름 select 구현 + 비에픽 접두어 비활성화

---

### 변경 배경

`info_job` 텍스트 입력을 직업 선택 드롭다운으로, 무기 슬롯 에픽 아이템이름을 직업 기반 단일 select로 교체.
무기 희귀도가 커먼/언커먼/레어/유니크일 때 접두어를 선택할 수 없도록 비활성화.

---

### 수정 내용

**`shared/shared_weapon.js` — 섹션3 전면 교체**

- `JOB_SELECT_OPTIONS`: 기본직업(11개) + 전직직업(114개) + 구분선/공백 포함 select 옵션 배열
- `JOB_TO_WEAPON_KEY`: 기본직업명 → `WEAPON_DATA_MAP` 키 매핑
- `SUBJOB_TO_BASE`: 전직직업 → 기본직업명 매핑 (114개)
- `getWeaponDataByJob(jobName)`: 기본직업 또는 전직직업으로 무기 데이터 반환

**`index.html`**

- `info_job` `<input type="text">` → `<select onchange="onJobSelectChange(this);">` 교체

**`js/ui-character.js`**

- `initJobSelect(sel, savedVal)`: `info_job` select 옵션 초기화 (기본직업/전직직업/구분선 포함)
- `onJobSelectChange(el)`: 직업 변경 시 `syncCharInfoToP2` + 무기 select 옵션 갱신 + `autoSave` 호출
- `initWeaponItemSelect(charId, savedVal)`: 직업 기반 단일 select 옵션 생성
  - 무기종류 헤더(disabled) + 아이템 목록 구조
  - 무기종류 그룹 사이에 빈 option(disabled) 추가
  - 저장값 없으면 첫 번째 선택 가능한 아이템 자동 선택
- `updateWeaponImage(select)`: `images/WEAPON/` 경로 이미지 업데이트
  - 콜론만 제거 (`replace(/:/g, '')`) — 공백 유지
- `handleItemNameField`: 무기 슬롯 분기 추가
  - 단일 `<select data-key="무기_itemname">` + `<img class="itemname-img-preview">` 생성
- `createCharacterTable`: DOM 삽입 후 `initJobSelect` + `initWeaponItemSelect` 호출
- `restoreSavedData`: `info_job` 복구 → `initJobSelect` → `initWeaponItemSelect` 순서 처리 + 무기 이미지 복구

**`js/ui-core.js`**

- `updateStyle` rarity 처리에 무기 슬롯 전용 분기 추가
  - 에픽 → `<select>` + `<img>` 생성 후 `initWeaponItemSelect` 호출, 접두어 활성화
  - 커먼/언커먼/레어/유니크 → 텍스트 `<input>`으로 교체 + 접두어 select disabled
  - 티어 → 텍스트 `<input>`, 접두어 선택 가능 유지

**`js/storage.js`**

- `autoSave()` 내 DOM 수집 시 `무기_weapontype` 키 저장 제외
  - 무기 종류 select는 `무기_itemname` 복원 시 역추적 가능하므로 저장 불필요

**`styles/styles.css`**

- 무기 에픽일 때 행 높이 auto 처리
  ```css
  tr:has(.td-weapon-epic) td, tr:has(.td-weapon-epic) th { height: auto !important; }
  td.td-weapon-epic { display: block !important; height: auto !important; }
  ```
- `.weapon-wrap`: 단일 select를 감싸는 flex column 컨테이너
- `.weapon-wrap select`: 너비 100%, 높이 `var(--height-select)`
- `.itemname-img-preview`: 24×24 아이템 이미지 미리보기 (visibility:hidden → has-image 시 visible)
- `td:has(.itemname-img-preview)`: flex + align-items:center 레이아웃
- `.td-itemname select:not(.weapon-type-sel)`: flex:1 적용

---

### 수정 파일

`shared/shared_weapon.js`, `index.html`, `js/ui-character.js`, `js/ui-core.js`, `js/storage.js`, `styles/styles.css`

---

## 2026-03-04 (69차)

### 상세입력 변경 기록 - select 값 표시 텍스트로 변환

**수정된 파일:** `js/main.js`

---

### 변경 배경

아바타 weapon_stat select에서 "힘, 지능, 체력, 정신력 +18"을 선택하면 변경 기록에 내부 인코딩값(`힘,지능,체력,정신력|18`)이 그대로 표시되는 문제.

### 원인

`main.js`의 change 이벤트 핸들러에서 `el.value`를 그대로 기록에 저장하고 있었음. select 요소의 value는 내부 인코딩값이고, 화면에 표시되는 텍스트는 option의 text 속성이므로 불일치 발생.

### 수정 내용

**`js/main.js`**

- `getDisplayVal(val, element)` 함수 추가
  - select 요소인 경우 선택된 `option.text`(화면 표시 텍스트)를 반환
  - select 이외 요소는 value 그대로 반환
- 변경 기록 저장 시 `oldVal`/`newVal` 대신 `displayOld`/`displayNew` 사용
  - 모든 select 필드(weapon_stat 포함)의 변경 기록이 value 대신 label로 표시됨

---

## 2026-03-05 (70차)

### 아바타 팝업 - 파츠별 스탯 표시 + 레이아웃 수정 + weapon CSS 복원

**수정된 파일:** `js/ui-character.js`, `styles/styles.css`, `shared/shared_data.js`

> **66차 추가:** `AVATAR_PARTS`, `AVATAR_GRADES`, `AVATAR_GRADE_CLASS`, `AVATAR_WEAPON_STATS` 도 `shared/shared_data.js`로 이동

---

### 변경 내용

**`styles/styles.css` — 아바타 팝업 CSS 추가**

- `.avatar-popup-box`: `width: auto`, `max-width: 90vw`
- `#avatar-popup-grid`: `grid-template-columns: 1fr 1fr`, `gap: 6px 24px`

**`shared/shared_data.js` — `AVATAR_PART_STATS` 상수 추가**

- `TITLE_ITEM_INFO`, `AURA_ITEM_INFO` 등 아이템 데이터와 함께 관리
- `js/ui-character.js`에서 이동 (데이터와 UI 로직 분리)

**`js/ui-character.js` — `AVATAR_PART_STATS` 제거**

파츠별 등급별 스탯 데이터 정의 (9개 파츠 × 언커먼/레어):

| 파츠 | 언커먼 | 레어 |
|------|--------|------|
| 모자 | 캐스팅속도 +12% | 캐스팅속도 +14% |
| 얼굴 | 공격속도 +5% | 공격속도 +6% |
| 상의 | 모든 직업 15레벨 스킬Lv+1(TP스킬 제외) | 모든 직업 10~30레벨 스킬Lv+1(TP스킬 제외) |
| 목가슴 | 공격속도 +5% | 공격속도 +6% |
| 신발 | 이동속도 +5% | 이동속도 +6% |
| 머리 | 캐스팅속도 +12% | 캐스팅속도 +14% |
| 하의 | HP MAX +418 | HP MAX +682 |
| 허리 | 회피 확률 +4% | 회피 확률 +6.5% |
| 피부 | 히트 리커버리 +80 | 히트 리커버리(확인필요) +100 |

각 항목 구조: `{ stats, amount, label }` (백엔드 연동 대비 수치 분리)

**`js/ui-character.js` — 팝업 레이아웃 전면 수정**

- 그리드: `grid-template-columns: 50px 44px 44px 16em`
  - 파츠명(50px) | 언커먼 체크박스(44px) | 레어 체크박스(44px) | 스탯 고정영역(16em)
- 헤더 행: "언커먼" 파란색(`#4dabf7`), "레어" 보라색(`#b197fc`) 가로 표시
  - 클릭 시 해당 등급 전체 체크/해제 유지
- 체크박스 클릭 시 해당 등급 스탯 색으로 표시, 해제 시 숨김
  - 언커먼 체크 → 파란색 스탯
  - 레어 체크 → 보라색 스탯
- 스탯 영역 `16em` 고정 → 가장 긴 문장("모든 직업 10~30레벨 스킬Lv+1(TP스킬 제외)") 기준으로 팝업 크기 고정
- 좌(모자~신발) / 우(머리~피부) 2컬럼 유지

--

## 2026-03-05 (71차)

### 아바타 세트 효과 데이터 추가

**수정된 파일:** `shared/shared_data.js`

---

### 변경 내용

**`AVATAR_SET_EFFECTS` 상수 추가**

언커먼/레어 각 3·5·8세트 효과 데이터:

- `cumulative: false` — 해당 단계 단독 효과 (3세트)
- `cumulative: true` — 이전 단계 누적 적용 (5세트→3세트 포함, 8세트→3+5세트 포함)
- `stats` — 해당 단계 고유 스탯만 포함 (누적분 미포함)
- `label` — 화면 표시용 텍스트

백엔드에서 언커먼/레어 개수를 받아 세트 수 계산 후 `cumulative` 플래그로 누적 여부 판단 가능

---

## 2026-03-05 (72차)

### 아바타 검색 결과 테이블 전용 처리

**수정된 파일:** `js/ui-search.js`

---

### 변경 내용

**`getSlotDataForSearch` — 아바타 전용 분기 추가**

- 기존: 일반 슬롯으로 처리 → `itemname`이 button이라 value 읽기 실패
- 변경: 아바타 전용 분기
  - `avatarValue`: `button[data-avatar-value]` 속성으로 파츠 설정값 읽기
  - `weaponStat`: `select[data-key="아바타_weapon_stat"]` value 읽기
  - `desc`: textarea 그대로 읽기

**`displaySearchResults` — 아바타 분기 분리**

- 기존: 오라/아바타 동일하게 `createSimpleSlotSearchTable` 호출
- 변경: 아바타는 `createAvatarSearchTable`, 오라는 기존 유지

**`createAvatarSearchTable` 함수 신규 추가**

- 컬럼: 직업/이름 | 파츠 설정 | 무기 아바타 수치 | 설명
- 파츠 설정: `renderAvatarBtnHTML` 활용해 언커먼(파란색)/레어(보라색) 색상 그대로 표시
- 무기 아바타 수치: value(`힘,지능,체력,정신력|18`) 대신 `AVATAR_WEAPON_STATS`에서 매칭되는 `label`(`힘, 지능, 체력, 정신력 +18`) 표시
- 설명 편집 버튼(✏️) 포함
---

## 2026-03-05 (73차)

### 크리쳐 아티팩트 희귀도별 스탯 수치 표시

**수정된 파일:** `shared/shared_data.js`, `js/ui-core.js`

---

### 변경 내용

**`shared/shared_data.js` — `CREATURE_ART_STATS` 상수 추가**

아티팩트 색상(red/blue/green) × 희귀도(커먼/언커먼/레어/유니크/에픽)별 스탯 데이터:
- `stat`: DB 저장용 키
- `amount`: 수치
- `label`: 화면 표시 텍스트 ("힘 +10" 형태)

| 색상 | 스탯 항목 |
|------|----------|
| red(1번) | 힘, 지능, 체력, 정신력, 적중, 회피 |
| blue(2번) | HP MAX, MP MAX, 물리/마법 공격력, 물리/마법 방어력 |
| green(3번) | 물리/마법 크리티컬, 공격/캐스팅/이동속도, 화/수/명/모속강 |

**`js/ui-core.js` — `artBg` 핸들러 수정**

- 희귀도 select 변경 시 옵션 select를 `CREATURE_ART_STATS` 기반으로 동적 업데이트
- data-key의 `_red_` / `_blue_` / `_green_` 으로 색상 판별
- 기존 선택값 보존 후 옵션 재구성 → 복원 시에도 선택값 유지
---

## 2026-03-05 (74차)

### 크리쳐 이름 선택지 + 설명 자동 입력 + 설명 잠금 토글

**수정된 파일:** `index.html`, `js/ui-core.js`, `js/ui-character.js`, `js/ui-memo-tag.js`, `shared/shared_data.js`

---

### 변경 내용

**`shared/shared_data.js` — `CREATURE_DATA` 상수 추가**

- 크리쳐 이름 목록 및 선택 시 자동 입력될 설명 데이터
- 현재 항목: `진 : 옥령왕` (모든 속성 강화 +5 / 공격 시 18% 추가 데미지)

**`index.html` — 크리쳐 이름 input → select 변경**

- `크리쳐_name` : `<input type="text">` → `<select>` (CREATURE_DATA 기반 동적 옵션)
- 크리쳐_desc textarea에 `data-creature-desc="1"` 속성 추가
- 컨트롤바에 `🐉 설명 잠금 ON/OFF` 토글 버튼 추가

**`js/ui-core.js` — 크리쳐 관련 함수 추가**

- `initCreatureNameSelect(section)` : select에 CREATURE_DATA 옵션 채우기
- `onCreatureNameChange(sel)` : 이름 선택 시 해당 크리쳐 desc 자동 입력
- `toggleCreatureDescLock(btn)` : 설명 잠금 ON/OFF 토글
  - ON(기본): 설명칸 편집 불가
  - OFF: 편집 가능

**`js/ui-character.js` — 크리쳐 행 생성/복원 시 select 초기화**

- 크리쳐 행 생성 시 `initCreatureNameSelect` 호출
- 캐릭터 복원 시 `initCreatureNameSelect` 호출

**`js/ui-memo-tag.js` — 크리쳐 설명 잠금 동적 처리**

- `openDescModal` 내 readonlySlots를 `window._creatureDescLocked` 플래그에 따라 동적 구성
- 기본값: 잠금(true) → 크리쳐_desc 편집 불가

---

## 2026-03-06 (75차)

### 코드 구조 개선 (전역 변수 통합 / 중복 제거 / 위치 정리)

**수정된 파일:** `js/storage.js`, `js/utils.js`, `js/ui-search.js`, `js/state.js`, `js/ui-character.js`, `js/ui-core.js`, `js/ui-memo-tag.js`, `js/ui-tag-filter.js`, `js/main.js`

---

### 변경 내용

- **storage.js** — `migrateRuneData`, `migrateInputs` 함수를 파일 하단으로 이동 (하위 호환용 구버전 코드 구분)
- **utils.js** — `SlotUtils` 슬롯 배열 4개를 `SLOT_TYPES` 참조로 변경 (중복 제거)
- **ui-search.js** — `_SEARCH_EDIT_OPTIONS` 상수를 파일 상단으로 이동
- **state.js** — `UIState` 객체 추가 (각 파일에 흩어진 UI 상태 전역 변수 9개 통합)
- **ui-character.js** — `_syncInProgress`, `_avatarCharId`, `_avatarBtn` → `UIState` 참조
- **ui-core.js** — `_menuOutsideHandler` → `UIState` 참조
- **ui-memo-tag.js** — `currentMemoCharId`, `currentDescInput` → `UIState` 참조
- **ui-tag-filter.js** — `currentFilterTag`, `autocompleteIndex` → `UIState` 참조
- **main.js** — `_p1Initialized` → `UIState` 참조
---

## 2026-03-06 (76차)

### CREATURE_DATA stats 구조 적용

**수정된 파일:** `shared/shared_data.js`, `js/ui-core.js`

---

### 변경 내용

**`shared/shared_data.js` — CREATURE_DATA 구조 변경**

- `desc` 문자열 → `stats` 배열 (`{ stat, amount, label }`) 로 변경
- `CREATURE_ART_STATS` 등 다른 스탯 데이터와 동일한 형식으로 통일

**`js/ui-core.js` — `onCreatureNameChange` 수정**

- `creature.desc` 직접 참조 → `creature.stats.map(s => s.label).join('\n')` 으로 변경

- `info` 필드 우선 처리 추가: `info` 있으면 `info` 표시, 없으면 `stats` `label` 조합

---

## 2026-03-06 (77차)

### 상세입력 변경 기록 - select 표시 텍스트 및 아바타 변경 기록 추가

**수정된 파일:** `js/main.js`, `js/ui-character.js`

---

### 변경 내용

**`js/main.js`**

- `getDisplayVal(val, element)` 함수 추가
  - select 요소인 경우 `el.value` 대신 선택된 `option.text`(화면 표시 텍스트)를 반환
  - select 이외 요소는 value 그대로 반환
  - 변경 기록 저장 시 `oldVal`/`newVal` 대신 `displayOld`/`displayNew` 사용
  - 모든 select 필드(weapon_stat 포함)의 변경 기록이 인코딩값 대신 label로 표시됨

**`js/ui-character.js`**

- `avatarPopupSave()`에 변경 기록 추가
  - 아바타는 버튼 클릭 → 팝업 → 저장 방식이라 `document.addEventListener('change', ...)` 이벤트가 발생하지 않아 기록이 남지 않는 문제 수정
  - 저장 직전 이전 값(`data-avatar-value`)과 새 값을 비교해 변경이 있을 때만 `AppState.changeHistory`에 직접 기록
  - `_recordMemoTagHistory`와 동일한 패턴 적용

---

## 2026-03-06 (78차)

### 칭호 팝업 개선 + 스크롤 동작 수정 + 변경 기록 개선 + 저장 버튼 수정

**수정된 파일:** `index.html`, `js/ui-character.js`, `styles/merged.css`, `scripts/eq_weapon.js`

---

### 변경 내용

**칭호 팝업 전면 개선 (`index.html`, `styles/merged.css`)**
- 팝업 4열 grid 배치 (기본정보 열1/열2, 효과 열3/열4), 최소 너비 1100px
- 팝업 스크롤 동작: 팝업이 표 위치에 absolute로 배치되어 스크롤 시 표와 함께 이동
- popup을 `document.body` 직계 자식으로 이동하여 overlay containing block 영향 차단
- `top = rect.top + window.scrollY` 로 페이지 절대 좌표 계산
- 닫을 때 popup 숨기고 overlay 안으로 복원

**변경 기록 개선 (`js/ui-character.js`, `scripts/eq_weapon.js`)**
- `changedParts` 배열을 `details` 필드로 별도 저장
- 기록 목록에 요약만 표시: `이전이름 → 새이름 (스탯 N개 변경)`
- `[▶ 상세보기]` 버튼 클릭 시 인라인으로 펼침/접기
- 이름만 변경: `이전이름 → 새이름` (버튼 없음)
- 스탯만 변경: `칭호이름 (스탯 N개 변경)`
- 구버전 기록(details 없음)도 정상 처리

**저장 버튼 수정 (`js/ui-character.js`)**
- popup을 body로 이동하면서 `overlay.querySelectorAll('[data-title-stat]')`가 스탯을 못 찾는 버그 수정
- `overlay.querySelectorAll` → `popup.querySelectorAll` 2곳 변경
- `titlePopupSave()`에 `popup` 변수 선언 추가

**칭호 팝업 위치 조정 (`js/ui-character.js`)**
- 팝업 상단이 직업/이름/스탯 표(`char-info-table`) 상단에 맞게 위치하도록 수정
- `_titleBtn.closest('.char-section')`으로 섹션 찾고 `querySelector('.char-info-table')`로 기준 표 참조
- 가로: `left = rect.left` 로 표 왼쪽 끝에 맞춤
- 세로: `top = rect.top + 30 + window.scrollY` 로 직업/이름 헤더(약 30px) 아래부터 시작

---

## 2026-03-06 (79차)

### 외형칭호 / 오라 아이템이름 이미지 제거

**수정된 파일:** `js/ui-character.js`, `js/ui-core.js`

---

### 변경 내용

**`js/ui-character.js`**

- `_imgSlots`에서 `'오라'` 제거 (이미 외형칭호는 없었음)
  - `handleItemNameField` 내 이미지 img 태그 삽입 대상에서 제외

**`js/ui-core.js`**

- `_allImgSlots`에서 `'외형칭호'`, `'오라'` 제거
  - `replaceItemNameField` 내 이미지 img 태그 삽입 대상에서 제외
  - 외형칭호/오라 select 교체 시 더 이상 img 태그가 앞에 삽입되지 않음

---

## 2026-03-06 (80차)

### 크리쳐 팝업 개편 + 변경 기록 개선

**수정된 파일:** `index.html`, `js/ui-character.js`, `js/storage.js`, `styles/merged.css`, `scripts/eq_weapon.js`

---

### 변경 내용

**`index.html`**

- 크리쳐 팝업
  - 크리쳐 이름: select 단독 → 텍스트 입력 + select 상호배타 방식
    - 텍스트 입력 시 select 비활성, select 선택 시 텍스트 비활성
    - 텍스트: CREATURE_DATA 외 직접 입력 용도
  - 세트효과 textarea 추가 (`id="creature-popup-seteffect"`)
    - select 선택 → CREATURE_DATA stats 라벨 자동입력 + readonly + "자동입력" badge 표시
    - 텍스트 직접 입력 → 세트효과 수동 수정 가능
  - 아티팩트 카드 내 고정 스탯 수치 입력칸 추가
    - RED: 물리 공격력, 마법 공격력, 힘, 지능
    - BLUE: 공격속도, 캐스팅속도, 이동속도, 적중
    - GREEN: HP MAX, MP MAX, 모속강
  - 저장 시 직접입력/자동입력 여부 구분 플래그 (`data-creature-setauto`) 저장

**`styles/merged.css`**

- `.modal-overlay` z-index `1000` → `3000` (control-bar sticky가 팝업 위 덮는 문제 수정)
- `.title-popup-row span.pct-label { width:auto }` 추가
- `.creature-popup-name-input` 추가 (텍스트 입력칸 스타일, disabled 흐림 처리)
- `.creature-art-stat-rows`, `.creature-art-stat-row`, `.creature-art-stat-input` 추가

**`js/ui-character.js`**

- 크리쳐 팝업
  - `openCreaturePopup`: fixed 기준 표 가운데 배치, `window.scroll` 재계산, 닫힐 때 제거
  - `creatureNameInputToggle` / `creatureNameSelToggle`: 상호배타 전환
  - `_creatureUpdateSetEffect`: select 선택 시 세트효과 자동입력/readonly 전환
  - `creaturePopupSave`: mode/seteffect/setauto 버튼 속성으로 저장, desc textarea 반영
  - 복원 시 mode에 따라 텍스트/select 상태 복구
  - `_CREATURE_ART_KEYS`에 신규 stat 키 등록
  - 변경 기록 전면 교체: 이름/세트효과/아티팩트 전체 비교 후 `details` 배열 수집
    - 변경사항이 1개 이상일 때만 기록

**`js/storage.js`**

- 크리쳐 버튼 저장 시 `mode`, `seteffect`, `setauto` 필드 추가 저장

**`scripts/eq_weapon.js`**

- 상세입력 변경 기록 렌더러에서 크리쳐 슬롯 처리 추가
  - slot이 `'크리쳐'`이면 요약에 `"크리쳐 설정 수정 (항목 N개 변경)"` 고정 표시
  - 상세보기 클릭 시 변경된 항목 목록 표시

---

---

---

## 2026-03-07 (81차)

### 오라 슬롯 팝업 구현 + 칭호/오라 변경 기록 개선

**수정된 파일:** `index.html`, `js/ui-character.js`, `js/ui-core.js`, `js/storage.js`

---

### 변경 내용

**오라 슬롯 - 아이템이름 버튼 팝업 (`index.html`, `js/ui-character.js`, `js/ui-core.js`, `js/storage.js`)**
- `index.html`: `aura-row-template` 추가 (simple-row-template 구조 동일, itemname만 button으로 교체) + 오라 팝업 HTML 추가 (칭호 팝업과 동일 구조, id/data만 aura로 변경)
- `js/ui-core.js`: `replaceItemNameField`에서 오라 예외처리 추가 (`if (slot === '칭호' || slot === '오라') return`)
- `js/ui-character.js`:
  - 오라 행 생성 시 `aura-row-template` 사용
  - `['외형칭호', '오라'].forEach` → `['외형칭호'].forEach` 로 변경 (오라 itemname이 select로 교체되던 버그 수정)
  - `openAuraPopup` / `auraPopupSave` / `auraPopupClose` 함수 추가
  - 팝업 위치: body 직계 자식으로 이동 후 `position: absolute`, `top = rect.top + 30 + window.scrollY` (칭호 팝업과 동일)
  - 오라 버튼 복원 코드 추가 (restoreSavedData)
  - `data-title-stat` → `data-aura-stat` 수정 (오라 팝업 스탯 읽기 오류 수정)
  - `overlay.querySelectorAll` → `popup.querySelectorAll` 수정 (popup이 body로 이동된 후 스탯 읽기 오류 수정)
- `js/storage.js`: 오라 버튼(`오라_itemname`) 저장/복원 로직 추가

**칭호/오라 변경 기록 개선 (`js/ui-character.js`)**
- `titlePopupSave()` / `auraPopupSave()` 변경 기록에 `details` 배열 추가
  - 이전/이후 스탯을 statKey 기준 맵으로 변환 후 변경된 항목만 추출
  - 이름 변경 시 `이름: 이전 → 이후` 항목을 details 맨 앞에 추가
  - `old`/`new`에는 이름만 저장 (스탯 요약 제거)
  - `details.length > 0` 인 경우에만 기록 저장
  - 표시 형식: `이름 (스탯 N개 변경) [▶ 상세보기]` (이름 동일 시) / `이전이름 → 새이름 (스탯 N개 변경) [▶ 상세보기]` (이름 변경 시)

---

---

## 2026-03-07 (82차)

### 칭호/오라 변경 기록 - 효과(eff) 스탯 누락 버그 수정 + [기본]/[효과] 출력 순서 정렬

**수정된 파일:** `js/ui-character.js`

---

### 변경 내용

**`js/ui-character.js`**

- `titlePopupSave()` / `auraPopupSave()` 변경 기록 `_toStatMap` 버그 수정
  - 기존: base/eff 구분 없이 statKey만으로 맵 생성 → 같은 스탯명이 base/eff 양쪽에 있으면 나중 값이 덮어씌워져 효과(eff) 변경사항 누락
  - 수정: `_toStatMap(arr, type)` 으로 분리, 맵 키를 `statKey_base` / `statKey_eff` 로 구분
  - details 표시에 `[기본]` / `[효과]` 라벨 추가하여 어느 쪽이 변경됐는지 구분 가능

- `titlePopupSave()` / `auraPopupSave()` 변경 기록 출력 순서 정렬
  - 기존: `Set` 순회 순서가 보장되지 않아 `[기본]`/`[효과]` 항목이 뒤섞여 출력
  - 수정: `allKeys` 배열 정렬 추가 — `_base` 키(0) → `_eff` 키(1) 순으로 정렬하여 `[기본]` 항목이 모두 먼저, `[효과]` 항목이 이후에 출력되도록 개선

---

## 2026-03-07 (83차)

### 칭호/오라 스탯 입력 숫자 전용 제한

**수정된 파일:** `index.html`, `js/main.js`, `styles/merged.css`

---

### 변경 내용

**칭호/오라 스탯 input 숫자 전용 전환 (`index.html`)**

- `data-title-stat` / `data-aura-stat` 속성을 가진 input 116개 `type="text"` → `type="number" inputmode="numeric" step="any"` 변경
  - 이름(`title-popup-name`, `aura-popup-name`) / 설명 input은 제외

**스피너(증감 버튼) 제거 (`styles/merged.css`)**

- `.title-popup-row input[type="number"]`에 스피너 제거 CSS 추가
  - `::-webkit-outer-spin-button`, `::-webkit-inner-spin-button` → `-webkit-appearance: none` (Chrome/Safari)
  - `-moz-appearance: textfield` (Firefox)

**`e`, `E`, `+`, `-` 입력 차단 (`js/main.js`)**

- `DOMContentLoaded`에 keydown 이벤트 추가
  - `title-popup`, `aura-popup` 내 `type="number"` input에서 `e`, `E`, `+`, `-` 키 `preventDefault()`로 차단
  - 이벤트 위임 방식으로 팝업 전체에 한 번만 등록

---

## 2026-03-07 (84차)

### 칭호/오라 팝업 - 이름 선택지 추가 + 스탯/desc 자동 입력

**수정된 파일:** `index.html`, `js/ui-character.js`

---

### 변경 내용

**칭호/오라 팝업 이름 선택지 추가 (`index.html`)**

- 칭호 이름 input 오른쪽에 `#title-popup-select` select 추가 (TITLE_ITEM_INFO 키 목록)
- 오라 이름 input 오른쪽에 `#aura-popup-select` select 추가 (AURA_ITEM_INFO 키 목록)

**이름 input ↔ select 상호 배타 (`js/ui-character.js`)**

- 이름 input에 텍스트 입력 시 → select 비활성화, select 값 초기화
- select에서 항목 선택 시 → 이름 input 비활성화, input 값 초기화
- 팝업 열 때 저장된 이름이 select 항목과 일치하면 select 선택 상태로 복원, input 비활성화
- 저장 시 이름 결정 우선순위: select 값 → input 값

**스탯 자동 입력 헬퍼 함수 추가 (`js/ui-character.js`)**

- `_applyTitleStats(popup, stats)`: stats 배열 → 칭호 팝업 input 자동 입력
- `_applyAuraStats(popup, stats)`: stats 배열 → 오라 팝업 input 자동 입력
- select 선택 시 TITLE_ITEM_INFO / AURA_ITEM_INFO의 `stats` 배열을 읽어 해당 stat key와 일치하는 input에 amount 값 자동 입력

**desc 자동 입력 구현 (`js/ui-character.js`)**

- select 선택 시 해당 항목의 `desc` 값을 팝업 설명 textarea에 자동 입력
- `shared_data.js` 템플릿에 `desc` 필드 추가 시 동작
  - 예: `desc: '설명 텍스트'`

---

## 2026-03-07 (85차)

### 외형칭호 아이템이름 텍스트 입력칸으로 고정

**수정된 파일:** `js/ui-core.js`

---

### 변경 내용

**`js/ui-core.js`**

- `replaceItemNameField()` 의 `useSelect` 조건에 `slot !== '외형칭호'` 추가
  - 기존: 희귀도 에픽이면 외형칭호도 select로 전환
  - 수정: 외형칭호는 희귀도 무관하게 항상 텍스트 input 유지

---

## 2026-03-07 (86차)

### 칭호/오라/크리쳐 팝업 안내 문구, placeholder 추가 + 크리쳐 이름 행 너비 조정

**수정된 파일:** `index.html`, `styles/merged.css`

---

### 변경 내용

**`index.html`**

- 칭호/오라/크리쳐 팝업 선택지(select) 오른쪽에 안내 문구 추가
  - `텍스트 입력과 선택은 동시에 할 수 없습니다.` (회색 소문자, `font-size: 0.82em`)
- 칭호/오라/크리쳐 팝업 이름 입력칸 placeholder 추가 및 통일
  - 기존 크리쳐: `직접 입력` → `선택지에 없으면 직접 입력`
  - 칭호/오라: placeholder 없음 → `선택지에 없으면 직접 입력`

**`styles/merged.css`**

- `.creature-popup-name-input` `width: 120px` → `width: 250px`
- `.creature-popup-name-select` `flex: 1` → `width: 250px`

---

## 2026-03-07 (87차)

### 캐릭터 추가 버튼 ReferenceError 수정

**수정된 파일:** `scripts/eq_character.js`

---

### 변경 내용

**`scripts/eq_character.js`**

- `_syncInProgress` 변수 선언 누락으로 인한 `ReferenceError` 수정
  - 기존: 선언 없이 `_syncInProgress` 사용 → `Uncaught ReferenceError: _syncInProgress is not defined`
  - 수정: 파일 상단 CRUD 섹션에 `let _syncInProgress = false;` 선언 추가

---

## 2026-03-07 (88차)

### 획득 장비 등록 탭 캐릭터 설정 팝업 - 직업 텍스트 입력 → 선택지로 변경

**수정된 파일:** `scripts/eq_equipment.js`

---

### 변경 내용

**`scripts/eq_equipment.js`**

- `openActionModal()` 내 직업 `<input type="text">` → `<select>`로 교체
- 모달 열릴 때 `JOB_SELECT_OPTIONS`(shared_weapon.js) 기반으로 옵션 동적 생성
  - separator / disabled 타입 그대로 반영 (구분선, 빈 항목)
  - 현재 저장된 직업 값으로 선택 상태 자동 복원

---

---

## 2026-03-07 (89차)

### 크리쳐 팝업 개편 + 아티팩트 자동완성

**수정된 파일:** `index.html`, `js/ui-character.js`, `js/storage.js`, `styles/merged.css`, `scripts/eq_weapon.js`, `shared/shared_data.js`

---

### 변경 내용

**`index.html`**

- 크리쳐 팝업 전면 재설계
  - 크리쳐 이름: select 단독 → 텍스트 input 하나로 통합 (자동완성 드롭다운)
  - 아티팩트 카드(RED/BLUE/GREEN) 내 고정 스탯 수치 입력칸 추가
    - RED: 물리 공격력, 마법 공격력, 힘, 지능
    - BLUE: 공격속도, 캐스팅속도, 이동속도, 적중
    - GREEN: HP MAX, MP MAX, 모속강
  - 기존 세트효과 → **크리쳐 스킬 효과**로 명칭 변경
  - **아티팩트 세트 효과** 칸 추가 (크리쳐 스킬 효과와 나란히 flex 배치)
  - 아티팩트 이름 input에 커스텀 자동완성 드롭다운 연결 (개별 `<ul class="ac-dropdown">`)
  - 크리쳐/아티팩트 이름 input에 `onkeydown="acDropdownKeydown(...)"` 추가
  - 자동입력 badge (`creature-seteffect-badge`, `creature-art-seteffect-badge`) 추가

**`styles/merged.css`**

- `.modal-overlay` z-index `1000` → `3000` (control-bar sticky 위 덮힘 문제 수정)
- `.creature-popup-name-input` 추가
- `.creature-art-stat-rows`, `.creature-art-stat-row`, `.creature-art-stat-input` 추가
- `.ac-dropdown` 공통 자동완성 드롭다운 스타일 추가 (다크 테마, hover/방향키 활성 강조)

**`js/ui-character.js`**

- 크리쳐 팝업 위치: 표 가운데 fixed 배치, `window.scroll` 재계산, 닫힐 때 제거
- 공통 자동완성 드롭다운 시스템 추가
  - `acDropdownShow()`: 후보 목록 렌더링
  - `acDropdownKeydown()`: 방향키(↑↓) 이동, Enter 선택, Escape 닫기
  - `_acDropdownInit()`: 외부 클릭 시 전체 드롭다운 닫기 (최초 1회 등록)
- 크리쳐 이름 자동완성
  - `creatureNameDropdownShow()`: CREATURE_DATA 기반 후보 표시, 타이핑 시 스킬 효과 즉시 갱신
  - `creatureNameDropdownSelect()`: 선택 시 스킬 효과 자동입력
  - `_creatureUpdateSetEffect()`: 이름 수정 시 자동입력 해제 + 내용 초기화
- 아티팩트 이름 자동완성
  - `creatureArtNameInput()`: ARTIFACT_SET_DATA 기반 후보 표시, 일치 시 스탯 자동입력
  - `creatureArtDropdownSelect()`: 선택 시 스탯 자동입력 + 세트 감지
  - `_creatureCheckArtSet()`: RED/BLUE/GREEN 세트 완성 시 아티팩트 세트 효과 자동입력 + badge 표시
- 저장 시 `mode`, `seteffect`, `setauto`, `art-seteffect`, `art-setauto` 버튼 속성으로 관리
- 변경 기록: 이름/세트효과/아티팩트 전체 비교 후 `details` 배열 수집, 변경사항 있을 때만 기록
- `_CREATURE_ART_KEYS`에 신규 stat 키 등록

**`js/storage.js`**

- 크리쳐 버튼 저장 시 `mode`, `seteffect`, `setauto`, `art-seteffect`, `art-setauto` 필드 추가 저장

**`shared/shared_data.js`**

- `ARTIFACT_SET_DATA` 배열 추가
  - 세트 단위로 RED/BLUE/GREEN 아티팩트명 + 각 카드 스탯 + 세트효과 묶음
  - 흑룡 세트 1개 포함 (어둠을 부리는 지팡이 / 복수를 가리는 가면 / 마법이 깃든 망토)

---

## 2026-03-07 (90차)

### 칭호/오라/크리쳐 팝업 자동입력 badge 추가 + 크리쳐 아티팩트 카드 레이아웃 조정

**수정된 파일:** `index.html`, `js/ui-character.js`, `styles/merged.css`

---

### 변경 내용

**`index.html`**

- 칭호 팝업: `기본정보`, `효과` section-label 옆, `설명` label 옆에 "자동입력" badge 추가
  - id: `title-badge-base`, `title-badge-eff`, `title-badge-desc`
- 오라 팝업: `기본정보`, `효과` section-label 옆, `설명` label 옆에 "자동입력" badge 추가
  - id: `aura-badge-base`, `aura-badge-eff`, `aura-badge-desc`
- 크리쳐 팝업 아티팩트 카드(RED/BLUE/GREEN)
  - 카드 내 순서 변경: `선택지 두 개(opt-row)` → `자동입력 badge` → `스탯 수치 입력칸(stat-rows)` 순으로 재배치
  - "자동입력" badge를 `span` 태그로 스탯 수치 바로 위에 배치
    - id: `creature-art-badge-red`, `creature-art-badge-blue`, `creature-art-badge-green`
    - `display:none` → JS에서 `inline`으로 전환
    - `line-height:1` 추가로 badge 아래 여백 최소화
  - 두 번째 opt-row에 `creature-art-opt-row-last` 클래스 추가 (구분선 표시용)

**`styles/merged.css`**

- `.creature-art-opt-row-last` 추가: 두 번째 선택지 행 아래 구분선 (`border-bottom: 1px dashed`)
- `.creature-art-stat-rows`: `border-bottom` 제거, `padding` 조정 (`0px 0`)

**`js/ui-character.js`**

- `titleNameApplyStats()`: 자동입력 시 `title-badge-*` 3개 표시, 미등록 이름 시 숨김
- `auraNameApplyStats()`: 자동입력 시 `aura-badge-*` 3개 표시, 미등록 이름 시 숨김
- `creatureArtNameInput()`: 이름 일치 시 해당 color badge `inline` 표시, 불일치 시 숨김
- `creatureArtDropdownSelect()`: 선택 시 해당 color badge `inline` 표시
- 팝업 열릴 때 badge 초기 상태 복원
  - 칭호: `setTimeout(() => titleNameApplyStats(savedName), 0)`
  - 오라: `setTimeout(() => auraNameApplyStats(savedName), 0)`
  - 크리쳐: 각 color별 ARTIFACT_SET_DATA 매칭 여부로 badge 복원

---

## 2026-03-07 (91차)

### `_syncInProgress` 이중 관리 통합

**수정된 파일:** `scripts/eq_character.js`

---

### 변경 내용

**`scripts/eq_character.js`**

- `let _syncInProgress = false;` 선언 제거
  - 기존: `eq_character.js`에 별도 `let _syncInProgress` 선언 → `ui-character.js`의 `UIState.syncInProgress`와 서로 다른 변수를 참조하는 이중 관리 상태
  - 수정: `_syncInProgress` → `UIState.syncInProgress` 로 교체하여 `state.js`에서 일괄 관리
  - 주석 추가: `// _syncInProgress → UIState.syncInProgress (state.js) 로 통합`

---

## 2026-03-07 (92차)

### 칭호/오라 팝업 공통 헬퍼 중복 정의 제거

**수정된 파일:** `js/ui-character.js`

---

### 변경 내용

**`js/ui-character.js`**

- `titlePopupSave()`, `auraPopupSave()`, `openTitlePopup()`, `openAuraPopup()` 4개 함수 안에 각각 중복 정의되어 있던 상수/함수를 파일 상단 공통 영역으로 통합
  - `const statLabels2` (2곳) → `const _STAT_LABELS_SHORT` (상단 1회)
  - `const statLabels` (2곳) → `const _STAT_LABELS_LONG` (상단 1회)
  - `function _toStatMap()` (2곳) → 상단 1회
  - `function _buildStatMap()` (2곳) → 상단 1회
  - `function _entriesToLines()` (2곳) → 상단 1회, 내부 참조를 `_STAT_LABELS_LONG` 로 통일
- 각 함수 내 `statLabels2[...]` 참조 → `_STAT_LABELS_SHORT[...]` 로 교체

---

맞습니다, 빠졌네요. 전체 이번 작업 내용으로 다시 올립니다.

---

## 2026-03-07 (93차)

### 코드 중복 및 전역 오염 정리

**수정된 파일:** `js/main.js`, `js/ui-memo-tag.js`, `scripts/eq_equipment.js`, `js/storage.js`, `js/state.js`

---

### 변경 내용

**`js/main.js`**

- `FIELD_LABELS` 객체와 `getFieldLabel()` 함수를 `change` 이벤트 핸들러 안에서 모듈 상단으로 이동
  - 기존: `document.addEventListener('change', ...)` 핸들러 내부에 정의 → 입력값 변경 시마다 객체/함수 재생성
  - 수정: 핸들러 바깥 상수/함수로 분리 → 최초 1회만 생성, 이후 재사용

**`js/ui-memo-tag.js`**

- `filterByTag()` 함수 제거
  - 기존: `ui-memo-tag.js`와 `ui-tag-filter.js` 두 곳에 동일 이름 함수 존재
  - `ui-tag-filter.js` 버전에 `UIState.filterTag = tag` 상태 관리 코드가 추가로 있어 해당 버전이 정식
  - 제거 위치에 주석 추가: `// filterByTag → ui-tag-filter.js 에 정의`

**`scripts/eq_equipment.js`**

- `openActionModal()` 내 직업 select 옵션 생성 블록(18줄) → `initJobSelect()` 호출 1줄로 교체
  - 기존: `JOB_SELECT_OPTIONS.forEach(...)` 직접 작성 → `ui-character.js`의 `initJobSelect()`와 동일 로직 중복
  - 수정: `if (typeof initJobSelect === 'function') initJobSelect(jobSel, job);`

**`js/storage.js`**

- `window.sTime` → `UIState.saveTimer` 로 교체 (전역 네임스페이스 오염 제거)

**`js/state.js`**

- `UIState`에 `saveTimer: null` 필드 추가 (`// autoSave 디바운스 타이머 (storage.js)`)

---

이전 검토에서 지적했던 항목들이 모두 완료됐습니다. 추가로 코드 전체를 다시 한번 확인하겠습니다.발견했습니다. `storage.js`에 날짜 포맷 코드가 중복이고, `utils.js`에 이미 `getCurrentDateTime()`이 있는데 활용하지 않고 있습니다. 이걸 정리하겠습니다.깔끔합니다. 파일 출력합니다.---

## 2026-03-07 (94차)

### 날짜 포맷 중복 코드 헬퍼 함수로 통합

**수정된 파일:** `js/utils.js`, `js/storage.js`

---

### 변경 내용

**`js/utils.js`**

- `getCurrentDateTimeForFile()` 추가: `"YYYY-MM-DD_HH-MM"` 형식 반환 — `exportToJSON` 파일명용
- `getCurrentDateForFile()` 추가: `"YYYY-MM-DD"` 형식 반환 — `saveJsonWithLocation` 파일명용
- 기존 `getCurrentDateTime()`은 히스토리 기록용(`"YYYY-MM-DD HH:MM:SS"`)으로 유지

**`js/storage.js`**

- `exportToJSON()`: `new Date()` + `padStart` 5줄 → `getCurrentDateTimeForFile()` 호출 1줄로 교체
- `saveJsonWithLocation()`: `new Date()` + `padStart` 3줄 → `getCurrentDateForFile()` 호출 1줄로 교체

---

네, 적어두는 게 좋을 것 같습니다.

---

## 2026-03-07 (95차)

### 아바타 행 기본 너비 고정

**수정된 파일:** `index.html`

---

### 변경 내용

**`index.html`**

- `avatar-row-template`의 `colspan="9"` `td`에 `min-width:800px` 추가
  - 기존: 아바타를 전부 언커먼으로 설정 시 텍스트 길이만큼 표 가로 너비가 늘어나는 문제
  - 수정: 언커먼 9개 텍스트를 수용할 수 있는 너비를 기본값으로 고정하여 설정 변경 시 표 너비 변동 없음

---
---

## 2026-03-07 (96차)

### 칭호/오라 팝업 숫자 input 개선, 자동입력 수정 잠금, 팝업 글자색 흰색 적용, 스탯 키 표기 통일

**수정된 파일:** `styles/merged.css`, `js/main.js`, `js/ui-character.js`, `index.html`, `shared/shared_data.js`

---

### 변경 내용

**`styles/merged.css`**
- `.title-popup-row input[type="number"]` 스피너(증감 버튼) 제거
  - `::-webkit-inner-spin-button`, `::-webkit-outer-spin-button` → `-webkit-appearance: none`
  - `-moz-appearance: textfield` (Firefox 대응)
- `.title-popup-section-label` 에 `color: #fff` 추가
- `.title-popup-row span` 에 `color: #fff` 추가

**`index.html`**
- 칭호/오라 팝업 "칭호 이름", "오라 이름" 라벨 inline style에 `color:#fff` 추가
- 칭호/오라 팝업 "설명" 라벨 inline style에 `color:#fff` 추가
- `avatar-row-template` 아바타 행 `colspan="9"` td에 `min-width:800px` 추가 (아바타 언커먼 설정 시 표 너비 늘어나는 문제 해결)

**`js/main.js`**
- 칭호/오라 팝업 숫자 input keydown 차단 목록에 `ArrowUp`, `ArrowDown` 추가
  - 기존: `e, E, +, -` 차단
  - 수정: `e, E, +, -, ArrowUp, ArrowDown` 차단 (방향키 숫자 변경 및 마이너스 입력 방지)

**`js/ui-character.js`**
- `_titlePopupLock(lock)` / `_auraPopupLock(lock)` 헬퍼 추가
  - `lock=true`: stat input 전체 + desc textarea `readOnly`, opacity `0.65`, cursor `not-allowed`
  - `lock=false`: 잠금 해제
- `titleNameDropdownSelect`: 드롭다운 선택 시 데이터 매칭되면 `_titlePopupLock(true)` 호출
- `titleNameApplyStats`: 직접 타이핑으로 매칭 없을 때 `_titlePopupLock(false)` 호출
- `auraNameDropdownSelect` / `auraNameApplyStats`: 오라 팝업 동일하게 적용
- `openTitlePopup` / `openAuraPopup`: 팝업 열 때 저장된 이름이 데이터와 매칭되면 lock 상태로 복원

**`shared/shared_data.js`**
- `_TITLE_TEMPLATES` V1~V4 구조 변경: `stats: [...]` 단일 배열 → `base: [...]`, `eff: [...]` 분리
  - V4는 `eff: []`


전체 코드에서 같은 의미의 스탯 키가 다르게 표기된 항목을 통일

| 변경 전 | 변경 후 | 위치 |
|---|---|---|
| `'마을이동속도'` | `'마을 이동속도 증가'` | `shared_data.js` AVATAR_SET_EFFECTS |
| `'마을 이동속도'` (키) | `'마을 이동속도 증가'` | `ui-character.js` _STAT_LABELS_SHORT/LONG, `index.html` data-title-stat/data-aura-stat |
| `'모든속성저항'` | `'모든 속성 저항'` | `shared_data.js` AVATAR_SET_EFFECTS |
| `'물리크리티컬'`, `'마법크리티컬'` | `'물리 크리티컬'`, `'마법 크리티컬'` | `shared_data.js` CREATURE_ART_STATS green |
| `'물리공격력'`, `'마법공격력'` | `'물리 공격력'`, `'마법 공격력'` | `shared_data.js` CREATURE_ART_STATS blue, ARTIFACT_SET_DATA key, `ui-character.js`, `index.html` |
| `'물리방어력'`, `'마법방어력'` | `'물리 방어력'`, `'마법 방어력'` | `shared_data.js` CREATURE_ART_STATS blue |
| `'모든속성강화'` | `'모든 속성 강화'` | `shared_data.js` CREATURE_DATA |

---
---

## 2026-03-07 (97차)

### 테스트 테마 / 테스트 테마2 추가

**수정된 파일:** `index.html`, `js/ui-character.js`, `styles/merged.css`

---

### 변경 내용

**`index.html`**

- 테마 설정 모달에 🧪 테스트 테마, 🧪 테스트 테마2 버튼 추가
- `applyTheme`, `updateThemeButtons` JS에 `theme-test`, `theme-test2` 추가

**`styles/merged.css`**

- 테스트 테마 (`theme-test`) 추가
  - 기반: 다크 테마2 색상 + 크리쳐 팝업 카드 디자인
  - `char-info-table`, 슬롯 표: `border-collapse: separate`, `border-radius: 10px`, 골드 테두리, `box-shadow`
  - 캐릭터 탭 버튼: `border-radius: 10px`, hover 시 골드 글로우
  - 장비 슬롯 버튼: `border-radius: 8px`, set3/set5 반투명 컬러 배경
- 테스트 테마2 (`theme-test2`) 추가
  - 테스트 테마 전체 + 다크 테마2 진한 구분선 적용
  - `border-collapse: separate` 환경에서 셀 끊김 방지: `border-right/bottom` 제거, `border-left/top`만 유지
  - `td[data-heavy-border-bottom]`으로 그룹 구분 가로선 표시
  - `td.v-border-heavy`, `th.v-border-heavy`: 설명칸 왼쪽 세로선
  - `th.group-header`, `td.group-header`: 헤더 아래 가로선
- 혼합/남색/다크 테마 (1세대): `char-info-table` 진한 테두리 제거 (`2px → 1px` 일반 테두리)

**`js/ui-character.js`**

- `heavyBorderSlots` 행 생성 시 `td`에 `data-heavy-border-bottom` 속성 추가
  - `tr.style.borderBottom`은 `border-collapse: separate` 환경에서 미작동하므로 `td` 직접 타겟팅

---
---

## 2026-03-08 (98차)

### 잠금 상태 버튼 클릭 차단 및 자동입력 커서 아이콘 제거

**수정된 파일:** `js/ui-character.js`, `scripts/ui-core.js`, `styles/styles.css`

---

### 변경 내용

**`js/ui-character.js`**

- 칭호, 오라, 아바타, 크리쳐 버튼 — 잠금 상태(`lock-btn`에 `btn-active` 클래스)일 때 팝업 열리지 않도록 `onclick` 핸들러에 잠금 체크 추가
- `_titlePopupLock`, `_auraPopupLock` 함수 — 자동입력 시 `cursor: not-allowed` 아이콘이 표시되던 문제 제거 (`el.style.cursor = ''`로 변경)
- `toggleEdit` 함수 — 잠금 시 `.col-prefix select`, `.col-exceed select`에 `style.opacity = '1'` 인라인 설정, 잠금 해제 시 `''`로 초기화하여 CSS 기본값 복원

**`scripts/ui-core.js`**

- `_refreshSlotState` 함수 — 섹션의 잠금 상태를 체크하여, 잠금 중일 때 익시드/접두어 `select`에 `disabled = false`가 덮어씌워지지 않도록 수정
  - 익시드 아이템 케이스: `prefixSel.disabled`, `exceedSel.disabled` → `isLocked ? true : false`
  - 일반 아이템 케이스: `prefixSel.disabled` → `isLocked ? true : false`
- `updateStyle` 함수
  - 무기 에픽 희귀도 선택 시 `prefixSel.disabled = false` → 잠금 상태 체크 후 설정
  - 접두어 변경 시 `exceedSel.disabled = false` → 잠금 상태 체크 후 설정

**`styles/styles.css`**

- `.col-exceed select:disabled`, `.col-prefix select:disabled` — `color: var(--color-white) !important`, `font-weight: normal !important` 추가

---
---

## 2026-03-08 (99차)

### 크리쳐 검색 데이터 수집 오류 수정 / 아티팩트 색상 동기화 / 버튼 onclick 구조 복원

**수정된 파일:** `js/ui-character.js`, `js/ui-search.js`

---

### 변경 내용

**`js/ui-character.js`**

- 크리쳐/칭호/오라/아바타 버튼 `onclick` 구조 — `if (section) { lockBtn 체크; openXxxPopup(); }` 원래 구조로 복원 (이전에 구조 변경되었던 것 되돌림)
- 크리쳐 팝업 저장 시 (`creaturePopupSave`) — 희귀도 span(`_top_rarity`, `_bg_1`, `_bg_2`) 변경 시 페어 텍스트 span(`_top_text`, `_opt_1`, `_opt_2`)에도 `bg-X` 클래스 동기화
- 데이터 복원 시 (`restoreSavedData`) — 동일하게 페어 텍스트 span `bg-X` 클래스 동기화 추가

**`js/ui-search.js`**

- 크리쳐 데이터 수집 (`getSlotDataForSearch`) 수정
  - 크리쳐 이름: `input[data-key="크리쳐_name"]` → `button[data-key="크리쳐_name"]`의 `data-creature-name` 속성으로 수정
  - 아티팩트 값: `select/input[data-key]` → `[data-creature-disp]` span의 `textContent`로 수정
- 크리쳐 검색 결과 출력 — `result.itemname` → `result.name` 으로 수정
- 검색 결과 `createArtBox` — `creature-art-text` span에 `bg-X` 클래스 추가 (희귀도 글자색 표시)

---
---

## 2026-03-08 (100차)

### 스킬룬 팝업 UI 개선 및 위치 수정

**수정된 파일:** `index.html`, `js/ui-rune.js`, `js/main.js`, `styles/styles.css`, `styles/merged.css`

**변경 내용**

**`index.html`**
- 스킬룬 모달 테이블을 좌우 2개로 분리 (`runeModalBody` / `runeModalBody2`)
  - 1~10번 왼쪽, 11~20번 오른쪽
- `modalOverlay` `onclick="closeRuneModal()"` 제거 (바깥 클릭으로 닫히지 않도록)

**`styles/styles.css`, `styles/merged.css`**
- `--width-modal` `310px` → `640px` (좌우 2열 수용)
- `.rune-row-divider td` 추가 — 5번/15번 행 아래 금색 구분선 (`border-bottom: 2px solid var(--gold)`)
- `#section-detail-view` `position: relative` 추가
- `#skillRunemodal` `position: fixed` → `absolute`, `top`/`left`/`transform` CSS 제거 (JS로 직접 제어)
- `.modal-overlay` `position: absolute` → `fixed` 복원 (화면 전체 커버)

**`js/ui-rune.js`**
- `openRuneModal`: 1~10번 → `runeModalBody`, 11~20번 → `runeModalBody2` 분기
- 5번(i===4), 15번(i===14) 행에 `rune-row-divider` 클래스 추가
- 팝업 위치: `visibility:hidden`으로 먼저 렌더링해 실제 높이 측정 후, 스킬룬 행(`${charId}_runeSummary`) 기준으로 화면 중앙에 `absolute` 배치
- `setAllRunesBatch`, `setAllRuneLevels`, `setAllSkillLevels`, `saveRuneData` — `runeModalBody2` 포함하도록 수정

**`js/main.js`**
- `modalOverlay` 클릭 이벤트에서 `closeRuneModal()` 호출 제거
- `closeHistoryModal()` 호출 조건을 `getComputedStyle(historyModal).display !== 'none'`으로 변경 (히스토리 모달 열려있을 때만 닫도록)

---
---

## 2026-03-08 (101차)

### 아바타 팝업 바깥 클릭 닫힘 방지

**수정된 파일:** `index.html`

**변경 내용**

**`index.html`**
- `avatar-popup-overlay` `onclick="if(event.target===this) avatarPopupClose();"` 제거
  - 이제 취소 버튼을 눌러야만 팝업이 닫힘
  
---
---

## 2026-03-09 (102차)

### 최근 업데이트 팝업 변경 이력 누적 기록

**수정된 파일:** `scripts/eq_equipment.js`, `scripts/eq_weapon.js`

---

### 변경 내용

**`scripts/eq_equipment.js`**

- `increment()` / `decrement()` 함수에 `char.updateHistory` 배열 누적 저장 추가
  - 기존: `char.updateTimes[key] = Date.now()` — 키당 하나의 타임스탬프만 유지 (덮어씌워짐)
  - 수정: `char.updateHistory.push({ key, timestamp, oldCount, newCount })` — 클릭할 때마다 누적
  - `updateHistory`가 없는 캐릭터는 자동으로 초기화 (`if (!char.updateHistory) char.updateHistory = []`)

**`scripts/eq_weapon.js`**

- `showRecentUpdates()` — 데이터 수집 로직 변경
  - 기존: `char.updateTimes` (키→타임스탬프 맵) 기반, 현재 `armorCounts` 값을 읽어옴
  - 수정: `char.updateHistory`(누적 배열) 우선 사용, 없으면 `updateTimes` 기반으로 레거시 처리 (하위 호환 유지)
  - `allUpdatesData` 항목에 `oldCount`, `newCount` 필드 추가

- `renderUpdatePage()` — 테이블 표시 변경
  - 헤더 "보유 개수" → "변경"으로 변경
  - 변경 셀: `oldCount → newCount` 형식으로 표시
    - 증가: newCount 노란색(`#ffcc00`)
    - 감소: newCount 빨간색(`#ff6b6b`)
    - 레거시(oldCount 없음): 기존 방식으로 숫자만 표시

---