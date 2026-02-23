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
