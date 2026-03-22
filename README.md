# 🛡️ 던파 모바일 시즌5 캐릭터 관리

> **던전앤파이터 모바일 (DNFM)** 캐릭터 장비 관리 웹 애플리케이션

## 📂 프로젝트 구조

```
project/
├── index.html                          # 진입점, 전체 탭 구조 및 스크립트 로드
├── character/                          # 캐릭터 관리 탭 (구 js/)
│   ├── base-character.js               # 캐릭터 테이블 생성, 슬롯 구성, 저장 데이터 복원
│   ├── base-core.js                    # 아이템색상·세트판정·접두어/익시드·봉인 하이라이트·각종 메뉴
│   ├── base-popups.js                  # 크리쳐/칭호/오라 팝업, 자동완성 드롭다운
│   ├── base-rune.js                    # 스킬룬 모달 (입력, 저장, 요약 표시)
│   ├── base-templates.js               # HTML 템플릿 헬퍼 (template 태그 복제 및 데이터 주입)
│   ├── core-core-events.js                  # 전역 이벤트 리스너 (탭이동, 변경감지, 모달초기화)
│   ├── core-main.js                    # 캐릭터 관리 탭 초기화 (initProject1)
│   ├── core-memo-tag.js                # 메모/설명 모달, 태그 추가·삭제·저장
│   ├── core-core-migration.js               # 구버전 데이터 → 신버전 마이그레이션 (1회성)
│   ├── core-core-state.js                   # 전역 상태 관리 (AppState, UIState)
│   ├── core-core-storage.js                 # 자동저장, JSON 내보내기/가져오기
│   ├── core-core-utils.js                   # DOM·슬롯·클래스 유틸, 봉인 수치 테이블, 헬퍼 함수
│   ├── mode-compare.js                 # 비교 모드 전체 (장비·봉인·엠블렘·스탯·세트 비교)
│   ├── mode-search.js                  # 검색 모드 전체 (슬롯별 검색, 결과 표시, 인라인 편집)
│   └── mode-tag-filter.js              # 태그 필터 패널, 빠른 버튼, 태그 자동완성
├── data/                               # 아이템 원본 데이터
│   ├── accessory.js                    # 악세서리 아이템별 스탯 데이터
│   ├── accessory_set_effects.js        # 악세서리 세트 효과 데이터
│   ├── armor.js                        # 방어구 아이템별 스탯 데이터
│   ├── armor_set_effects.js            # 방어구 세트 효과 데이터
│   ├── exceed_unique_effects.js        # 익시드 고유 효과 데이터
│   ├── special.js                      # 특수장비 아이템별 스탯 데이터
│   └── special_set_effects.js          # 특수장비 세트 효과 데이터
├── equipment/                          # 획득장비/무기/제작 탭 (구 scripts/)
│   ├── eq_character.js                 # 캐릭터 목록 UI (추가/삭제/이동/편집)
│   ├── eq_core.js                      # 저장/불러오기 핵심, 장비 행 생성, 캐시 관리
│   ├── eq_craft.js                     # 제작 시스템 (재료 입력, 잠금, 계산, 실행취소)
│   ├── eq_data.js                      # 전역 변수 선언 (characters 배열, craftLocked 등)
│   ├── eq_equipment.js                 # 세트 버튼, 세트 상세, 장비 증감, 행 색상
│   ├── eq_main.js                      # 탭 전환, 캐릭터 순서 동기화, 초기화 진입점
│   ├── eq_render.js                    # 획득장비 탭 화면 렌더링
│   ├── eq_statistics.js                # 장비/무기 통계 및 검색
│   └── eq_weapon.js                    # 무기 등록 탭, 최근 업데이트 모달
├── images/                             # 아이템 이미지 리소스
│   ├── ACCESSORY/                      # 악세서리 이미지
│   ├── ARMOR/                          # 방어구 이미지
│   ├── SPECIAL/                        # 특수장비 이미지
│   ├── WEAPON/                         # 무기 이미지
│   ├── appearanceTitle/                # 외형칭호 이미지
│   ├── aura/                           # 오라 이미지
│   ├── craftMaterials/                 # 제작 재료 이미지
│   └── title/                          # 칭호 이미지
├── shared/                             # 양쪽 탭 공통 데이터/상수
│   ├── shared_constants.js             # 슬롯·접두어·희귀도·스토리지 키 등 전역 상수
│   ├── shared_data.js                  # 세트명·슬롯·아이템명·크리쳐·아티팩트 데이터
│   └── shared_weapon.js                # 무기 아이템 데이터
└── styles/                             # 스타일
├── base.css                        # 캐릭터 관리 탭 핵심 UI 스타일
├── components.css                  # 전역 공통 컴포넌트 스타일 (버튼·툴바·테이블 등)
├── responsive.css                  # 반응형 미디어쿼리, 접근성
├── themes.css                      # 테마 6종, 팝업·자동완성 스타일
├── themes-test.css                 # 실험용 테마 2종
└── variables.css                   # CSS 전역 변수 (색상·배경·폰트·간격 등)
```

---

## 전체 파일 역할 정리

### 📁 data/ — 아이템 원본 데이터

| 파일 | 역할 | 언제/어디서 필요 |
|------|------|----------------|
| `accessory.js` | 악세서리 아이템별 스탯 데이터 (`ACCESSORY_ITEM_STATS`) | 캐릭터 관리 비교 모드의 악세서리 스탯 비교 |
| `accessory_set_effects.js` | 악세서리 세트 효과 데이터 (`ACCESSORY_SET_EFFECTS`) | 캐릭터 관리 비교 모드의 악세서리 세트 효과 비교 |
| `armor.js` | 방어구 아이템별 스탯 데이터 (`ARMOR_ITEM_STATS`) | 캐릭터 관리 비교 모드의 방어구 스탯 비교 |
| `armor_set_effects.js` | 방어구 세트 효과 데이터 (`ARMOR_SET_EFFECTS`) | 캐릭터 관리 비교 모드의 방어구 세트 효과 비교 |
| `exceed_unique_effects.js` | 익시드 고유 효과 데이터 (`EXCEED_UNIQUE_EFFECTS`) | 캐릭터 관리 장비 정보 표시 |
| `special.js` | 특수장비 아이템별 스탯 데이터 (`SPECIAL_ITEM_STATS`) | 캐릭터 관리 비교 모드의 특수장비 스탯 비교 |
| `special_set_effects.js` | 특수장비 세트 효과 데이터 (`SPECIAL_SET_EFFECTS`) | 캐릭터 관리 비교 모드의 특수장비 세트 효과 비교 |

---

### 📁 shared/ — 양쪽 공통 데이터/상수

| 파일 | 역할 | 언제/어디서 필요 |
|------|------|----------------|
| `shared_constants.js` | 슬롯 목록, 접두어 목록, 익시드 태그, 희귀도 색상, 스토리지 키 등 모든 전역 상수 | 전체 탭에서 상시 참조 |
| `shared_data.js` | 세트명·슬롯·아이템명·크리쳐·아티팩트 데이터 (`ARMOR_ITEM_INFO`, `ACC_ITEM_INFO`, `CREATURE_ITEM_INFO` 등) | 전체 탭에서 세트 판정, 드롭다운 목록, 비교 모드 세트 효과 판정 |
| `shared_weapon.js` | 무기 아이템 데이터 | 획득장비 탭 무기 등록, 캐릭터 관리 무기 선택 |

---

### 📁 equipment/ — 획득장비/무기/제작 탭

| 파일 | 역할 | 언제/어디서 필요 |
|------|------|----------------|
| `eq_character.js` | 캐릭터 목록 UI (`addCharacter`, `renderCharacterList`, `deleteCharacterConfirmed`, `moveCharacterUp/Down`) | 획득장비 탭 좌측 캐릭터 목록 패널 |
| `eq_core.js` | 저장/불러오기 핵심 (`saveLocalData`, `_loadUnified`), 장비 행 생성, 캐시 관리 | 모든 equipment 파일에서 참조 |
| `eq_craft.js` | 제작 시스템 (`renderCraftTable`, `setCraftLock`, `applyCraftModulo`, `undoCraftModulo`) | 제작 등록 탭 |
| `eq_data.js` | 전역 변수 선언 (`characters` 배열, `craftLocked`, 페이지 상수 등) | 모든 equipment 파일의 기반, 가장 먼저 로드 |
| `eq_equipment.js` | 세트 버튼, 세트 상세(`openSet`), 장비 행 증감, 행 색상 업데이트 | 획득장비 탭 메인 기능 |
| `eq_main.js` | 탭 전환 (`switchTo`), 캐릭터 순서 동기화, 초기화 진입점 | 페이지 로드 시 탭 구조 초기화 |
| `eq_render.js` | 획득장비 탭 렌더링 (`renderEquipmentTab`, `renderFullEquipmentTab`, 캐릭터별 보유현황) | 획득장비 탭 화면 그리기 |
| `eq_statistics.js` | 장비/무기 통계, 장비 검색 (`showEquipmentStatistics`, `searchEquipment`) | 획득장비 탭 통계·검색 기능 |
| `eq_weapon.js` | 무기 등록 탭 전체 (`selectWeaponJob`, 증감, 최근 업데이트 모달) | 무기 등록 탭 |

---

### 📁 character/ — 캐릭터 관리 탭

| 파일 | 역할 | 언제/어디서 필요 |
|------|------|----------------|
| `base-character.js` | 캐릭터 테이블 생성, 슬롯 콘텐츠 생성, 이미지 업데이트, 저장 데이터 복원, 삭제/이동/잠금 | 캐릭터 관리 탭 기본 모드 전체 |
| `base-core.js` | 아이템이름 색상, 세트 판정, 접두어/익시드 상태 관리, 봉인 하이라이트, 세트/접두어/강화 메뉴, 크리쳐 연동, 히스토리 모달 | 캐릭터 관리 탭 기본 모드에서 장비 입력 시 상시 |
| `base-popups.js` | 크리쳐/칭호/오라 팝업, 자동완성 드롭다운 | 캐릭터 관리 탭 기본 모드에서 크리쳐·칭호·오라 입력 시 |
| `base-rune.js` | 스킬룬 모달 (`openRuneModal`, `saveRuneData`, `updateRuneSummary`) | 캐릭터 관리 탭 기본 모드에서 스킬룬 입력 시 |
| `base-templates.js` | HTML 템플릿 헬퍼 (`<template>` 태그 복제 및 데이터 주입) | 캐릭터 테이블 생성 시 |
| `core-core-events.js` | 전역 이벤트 리스너 - 탭 이동(keydown), 변경 감지·히스토리 기록(change), 모달 초기화(DOMContentLoaded) | 페이지 전체에서 상시 동작 |
| `core-main.js` | 캐릭터 관리 탭 초기화 (`initProject1`), 페이지 로드 이벤트 | 캐릭터 관리 탭 진입 시 1회 |
| `core-memo-tag.js` | 메모 모달, 설명 모달, 태그 추가/삭제/저장/조회 | 기본 모드 메모·태그 입력 시, 태그 필터 모드에서 태그 데이터 참조 시 |
| `core-core-migration.js` | 구버전 데이터 → 신버전 마이그레이션 (`migrateToUnified`, `migrateRuneData`, `migrateInputs`) | 페이지 로드 시 1회, core-storage.js보다 먼저 |
| `core-core-state.js` | 앱 전역 상태 관리 (`AppState`, `UIState`) - 히스토리, 스냅샷, 비교 선택, 각종 UI 상태 | 전체 character 파일에서 상시 참조 |
| `core-core-storage.js` | 자동저장(`autoSave`), JSON 내보내기/가져오기(`exportToJSON`, `importFromJSON`, `saveJsonWithLocation`) | 입력 변경 시마다, 저장·불러오기 버튼 |
| `core-core-utils.js` | DOM 유틸, 슬롯 유틸, 클래스 유틸, 봉인 수치 테이블, 날짜/숫자 헬퍼 함수 | 전체 character 파일에서 상시 참조 |
| `mode-compare.js` | 비교 모드 전체 - 캐릭터 선택, 장비/봉인/엠블렘/마법부여/스탯/세트 효과 비교 표 생성 | 캐릭터 관리 탭 비교 모드 |
| `mode-search.js` | 검색 모드 전체 - 슬롯별 검색, 결과 표시, 인라인 편집 | 캐릭터 관리 탭 검색 모드 |
| `mode-tag-filter.js` | 태그 필터 패널, 빠른 버튼, 태그 자동완성 | 캐릭터 관리 탭 태그 필터 사용 시 |

---

## 캐릭터 관리 탭 - 기능별 필요 파일

### 🔵 기본 모드

| 파일 | 이유 |
|------|------|
| `base-character.js` | 캐릭터 테이블 생성, 슬롯 구성, 저장 복원 |
| `base-core.js` | 아이템 색상, 세트 판정, 접두어/익시드, 봉인 하이라이트, 각종 메뉴 |
| `base-popups.js` | 크리쳐/칭호/오라 팝업 |
| `base-rune.js` | 스킬룬 모달 |
| `base-templates.js` | 템플릿 헬퍼 |
| `core-core-events.js` | 탭 이동, 변경 감지, 히스토리 기록 |
| `core-main.js` | 탭 초기화 |
| `core-memo-tag.js` | 메모/설명 모달, 태그 추가·삭제·저장 |
| `core-core-migration.js` | 로드 시 구버전 데이터 변환 |
| `core-core-state.js` | AppState, UIState 전역 상태 |
| `core-core-storage.js` | 자동저장, JSON 내보내기/가져오기 |
| `core-core-utils.js` | 슬롯 유틸, 봉인 수치, 헬퍼 함수 |
| `data/` 전체 | 익시드 고유효과 표시 |
| `shared_constants.js` | 슬롯/접두어/상수 |
| `shared_data.js` | 세트 판정, 아이템 목록 |
| `shared_weapon.js` | 무기 아이템 목록 |

---

### 🟡 비교 모드

기본 모드 파일 전체 +

| 파일 | 이유 |
|------|------|
| `mode-compare.js` | 비교 모드 UI 전체 |
| `data/accessory.js` | 악세서리 스탯 비교 |
| `data/accessory_set_effects.js` | 악세서리 세트 효과 비교 |
| `data/armor.js` | 방어구 스탯 비교 |
| `data/armor_set_effects.js` | 방어구 세트 효과 비교 |
| `data/special.js` | 특수장비 스탯 비교 |
| `data/special_set_effects.js` | 특수장비 세트 효과 비교 |

---

### 🟢 검색 모드

기본 모드 파일 전체 +

| 파일 | 이유 |
|------|------|
| `mode-search.js` | 검색 모드 UI 전체, 결과 표시, 인라인 편집 |

---

### 🔴 태그 필터

기본 모드 파일 전체 +

| 파일 | 이유 |
|------|------|
| `core-memo-tag.js` | 태그 데이터 관리 (태그 조회 함수를 mode-tag-filter.js에서 직접 호출) |
| `mode-tag-filter.js` | 태그 필터 패널, 빠른 버튼, 자동완성 |

---
