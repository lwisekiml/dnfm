# DNF Mobile 통합 장비 관리 - 개발 로그

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
├── 빝의저장소.png
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
