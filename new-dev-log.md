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
