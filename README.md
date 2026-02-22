# 🛡️ RPG 통합 장비 관리 시스템

> **던전앤파이터 모바일 (DNFM)** 캐릭터 장비 관리 웹 애플리케이션

[![Tests](https://img.shields.io/badge/tests-106%20passed-brightgreen)]()
[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

---

## ✨ 주요 기능

### 🎮 캐릭터 관리
- ✅ **다중 캐릭터 지원** - 무제한 캐릭터 생성 및 관리
- ✅ **실시간 자동 저장** - localStorage 기반 자동 백업
- ✅ **JSON 내보내기/불러오기** - 데이터 백업 및 복원
- ✅ **캐릭터 잠금/해제** - 실수로 수정 방지

### ⚔️ 장비 관리
- ✅ **18개 슬롯** - 무기, 방어구, 악세서리, 특수장비, 칭호 등
- ✅ **희귀도 시스템** - 에픽/유니크/레어/언커먼/커먼/티어
- ✅ **익시드 등급** - 이상/선봉/의지
- ✅ **접두어 12종** - 전격/허상/작열/침식 등
- ✅ **마법봉인** - 고유/일반 옵션 2가지
- ✅ **엠블렘** - 2개 슬롯 (색상별 그라디언트)
- ✅ **마법부여** - 슬롯별 기본값 자동 입력
- ✅ **강화 수치** - +0 ~ +13

### 💎 스킬룬 시스템
- ✅ **20개 룬 슬롯** - 각성/가호/수호 등 38종 룬
- ✅ **룬 레벨** - I/II/III/IV
- ✅ **스킬 레벨** - 0~65 단계
- ✅ **각인 시스템** - 메인 미표시/표시 50%
- ✅ **일괄 설정** - 룬 이름/레벨/스킬레벨 한 번에 설정

### 🐲 크리쳐 아티팩트
- ✅ **3색 아티팩트** - Red/Blue/Green
- ✅ **각 색상별 3줄** - 상단 텍스트 + 옵션 2개
- ✅ **희귀도별 배경색** - 그라디언트 효과
- ✅ **옵션 선택** - 힘/지능/HP/물리공격력 등

### ⚖️ 비교 모드
- ✅ **2개 캐릭터 비교** - 좌우 선택 및 비교
- ✅ **4가지 비교 테이블** - 장비/봉인/엠블렘/마법부여
- ✅ **차이값 표시** - 강화 수치 차이 계산
- ✅ **색상 하이라이트** - 증가(녹색)/감소(빨간색)/동일(회색)

### 🎨 스타일 시스템
- ✅ **희귀도별 색상** - 자동 색상 동기화
- ✅ **세트 효과 강조** - 3셋 이상 시 청록색 표시
- ✅ **엠블렘 배경** - 5색 그라디언트
- ✅ **접두어 색상** - 무기 4색 (파랑/빨강/초록/노랑)
- ✅ **속강/스탯 하이라이트** - 선택한 속성 노란색 강조

### 📜 히스토리
- ✅ **변경 기록 10개** - 최근 수정 내역 추적
- ✅ **시간 기록** - 변경 시각 표시
- ✅ **Before/After** - 이전값 → 새로운값

---

## 🚀 빠른 시작

### 1. 프로젝트 클론

```bash
git clone https://github.com/your-username/rpg-equipment-manager.git
cd rpg-equipment-manager
```

### 2. 로컬 서버 실행

```bash
# Python 3
python -m http.server 8000

# 또는 Node.js
npx http-server -p 8000
```

### 3. 브라우저에서 열기

```
http://localhost:8000
```

---

## 📦 설치 (테스트용)

### 기본 사용
별도 설치 필요 없음! 브라우저에서 바로 실행 가능합니다.

### 테스트 실행 (선택)

```bash
# 의존성 설치
npm install

# 또는 Playwright만
npm run install:playwright

# 또는 Cypress만
npm run install:cypress
```

---

## 🧪 테스트

### 테스트 현황
- ✅ **단위 테스트:** 49개
- ✅ **통합 테스트:** 35개
- ✅ **E2E 테스트:** 22개
- ✅ **총 테스트:** **106개 전체 통과**

### 빠른 실행

```bash
# 로컬 서버 실행
npm run serve

# Playwright 테스트
npm run test:playwright

# Cypress GUI
npm run test:cypress:open

# 모든 E2E 테스트
npm run test:e2e
```

### 상세 가이드
자세한 테스트 가이드는 [README-TEST.md](./README-TEST.md)를 참고하세요.

---

## 📂 프로젝트 구조

```
rpg-equipment-manager/
├── index.html                      # 메인 애플리케이션
├── css/                            # 스타일시트
│   └── styles.css                 # 메인 CSS (CSS 변수, 반응형)
├── js/                             # JavaScript 소스
│   ├── constants.js               # 상수 정의
│   ├── data.js                    # 게임 데이터 (아이템, 세트)
│   ├── state.js                   # 애플리케이션 상태 관리
│   ├── utils.js                   # 유틸리티 함수
│   ├── storage.js                 # 저장/불러오기
│   ├── ui-core.js                 # 핵심 UI 기능
│   ├── ui-character.js            # 캐릭터 관리 UI
│   ├── ui-rune.js                 # 스킬룬 모달
│   ├── ui-modal.js                # 일반 모달
│   ├── ui-compare.js              # 비교 모드
│   ├── ui-templates.js            # HTML 템플릿 헬퍼
│   └── main.js                    # 메인 초기화
├── test/                           # 테스트 파일
│   ├── test-unit.html             # 단위 테스트 (49개)
│   ├── test-integration.html      # 통합 테스트 (35개)
│   ├── test-e2e-javascript.html   # E2E JavaScript (4개)
│   ├── test-e2e-playwright.spec.js # E2E Playwright (8개)
│   └── test-e2e-cypress.cy.js     # E2E Cypress (10개)
├── cypress/                        # Cypress 설정
├── package.json                    # npm 설정 및 스크립트
├── README.md                       # 이 파일
├── README-TEST.md                  # 테스트 가이드
└── QUICK-START.md                  # 빠른 시작 가이드
```

### 파일 설명

#### 📄 index.html
- 메인 HTML 구조
- `<template>` 태그로 재사용 컴포넌트
- CSS/JS 외부 파일 로드

#### 🎨 css/styles.css
- **100+ CSS 변수** 정의
- 색상 시스템 (희귀도, 익시드, 엠블렘)
- 간격/크기 시스템
- 반응형 미디어 쿼리
- 다크 테마 준비

#### 📜 JavaScript 모듈

| 파일 | 역할 | 주요 기능 |
|------|------|----------|
| `constants.js` | 상수 | 슬롯, 희귀도, 룬, 접두어 |
| `data.js` | 데이터 | 아이템, 세트, 봉인 옵션 |
| `state.js` | 상태 관리 | charRuneData, 히스토리 |
| `utils.js` | 유틸리티 | DOM, 클래스, 계산 함수 |
| `storage.js` | 저장/복구 | localStorage, JSON |
| `ui-core.js` | UI 핵심 | 봉인, 세트, 스타일 |
| `ui-character.js` | 캐릭터 | 생성, 삭제, 이동, 잠금 |
| `ui-rune.js` | 스킬룬 | 모달, 일괄설정, 요약 |
| `ui-modal.js` | 모달 | 히스토리 모달 |
| `ui-compare.js` | 비교 | 비교 모드, 테이블 생성 |
| `ui-templates.js` | 템플릿 | HTML 생성 헬퍼 |
| `main.js` | 초기화 | 이벤트 리스너, 로드 |

---

## 💻 사용 방법

### 1. 캐릭터 생성

1. **"캐릭터 추가"** 버튼 클릭
2. 직업, 이름, 항마력 입력
3. 자동으로 저장됨 ✅

### 2. 장비 설정

각 슬롯별로:
- **희귀도** 선택 (에픽/유니크/레어 등)
- **익시드** 선택 (이상/선봉/의지)
- **접두어** 선택 (전격/허상 등)
- **아이템 이름** 입력/선택
- **강화 수치** 입력 (+12 등)
- **마법봉인** 2개 설정
- **엠블렘** 2개 설정
- **마법부여** 설정

### 3. 스킬룬 설정

1. **"수정"** 버튼 클릭 (스킬룬 행)
2. 20개 룬 슬롯에 각각 설정:
    - 룬 이름 선택
    - 룬 레벨 선택
    - 스킬 레벨 선택
3. **일괄 설정** 기능 활용:
    - 모든 룬 → 같은 이름
    - 모든 룬 → 같은 레벨
    - 모든 스킬 → 같은 레벨
4. **각인** 입력 (선택)
5. **"저장"** 버튼 클릭

### 4. 비교 모드

1. 2개 이상의 캐릭터 생성
2. **"비교"** 버튼 클릭
3. 좌우에서 캐릭터 선택
4. 4가지 비교 테이블 확인:
    - 장비 비교
    - 마법봉인 비교
    - 엠블렘 비교
    - 마법부여 비교
5. **차이값** 확인 (녹색↑/빨간색↓)

### 5. 데이터 백업

- **"JSON 파일 저장"** - 다운로드 폴더에 자동 저장
- **"JSON 경로 지정 저장"** - 원하는 위치에 저장
- **"JSON 파일 불러오기"** - 백업 파일 복원

---

## 🎨 UI 특징

### CSS 변수 시스템 (100+ 변수)

**styles.css**는 완전히 CSS 변수 기반으로 작성되었습니다:

```css
:root {
    /* ===== 기본 색상 팔레트 ===== */
    --color-white: #ffffff;
    --color-black: #000000;
    --gold: #c5a678;

    /* ===== 배경 색상 ===== */
    --bg: #0f0f12;
    --bg-dark: #000;
    --bg-section: #121216;
    --bg-row: #1a1a1f;

    /* ===== 희귀도 색상 ===== */
    --txt-epic: #fcc419;
    --txt-unique: #ff80ab;
    --txt-rare: #b197fc;
    --txt-uncom: #4dabf7;
    --txt-common: #888;

    /* ===== 엠블렘 그라디언트 ===== */
    --gradient-emb-red: linear-gradient(to bottom, #6a1a1a 0%, #4a1212 100%);
    --gradient-emb-yellow: linear-gradient(to bottom, #6a5a1a 0%, #4a3f12 100%);
    --gradient-emb-blue: linear-gradient(to bottom, #1a2a6a 0%, #121d4a 100%);
    --gradient-emb-green: linear-gradient(to bottom, #1a6a2a 0%, #124a1d 100%);

    /* ===== 간격 시스템 ===== */
    --spacing-xs: 2px;
    --spacing-sm: 4px;
    --spacing-md: 5px;
    --spacing-lg: 8px;
    --spacing-xl: 10px;
    --spacing-2xl: 15px;
    --spacing-3xl: 20px;

    /* ===== 폰트 크기 ===== */
    --fs-xs: 11px;
    --fs-sm: 12px;
    --fs-md: 13px;
    --fs-lg: 1.1rem;

    /* ===== 너비 시스템 ===== */
    --width-slot: 45px;
    --width-rarity: 42px;
    --width-enchant: 55px;
    /* ... 총 100개 이상의 변수 */
}
```

**장점:**
- ✅ **일관성** - 모든 요소가 동일한 색상/간격 사용
- ✅ **유지보수** - 변수만 수정하면 전체 적용
- ✅ **확장성** - 다크 테마 등 쉽게 추가 가능
- ✅ **가독성** - 의미 있는 변수명

### 색상 시스템

**희귀도:**
- 🟡 **에픽** - 노란색
- 🩷 **유니크** - 분홍색
- 🟣 **레어** - 보라색
- 🔵 **언커먼** - 파란색
- ⚪ **커먼** - 회색
- ⚪ **티어** - 흰색

**익시드:**
- 🟢 **이상** - 초록색
- 🔴 **선봉** - 빨간색
- 🔵 **의지** - 파란색

**접두어 (무기):**
- 🔵 **광채** - 파란색
- 🔴 **분쇄** - 빨간색
- 🟢 **선명** - 초록색
- 🟡 **강타** - 노란색

**엠블렘 배경:**
- 🔴 **상의/하의** - 빨간색 그라디언트
- 🟡 **어깨/벨트** - 노란색 그라디언트
- 🔵 **신발/팔찌** - 파란색 그라디언트
- 🟢 **목걸이/반지** - 초록색 그라디언트

### 세트 효과 하이라이트

- 3셋 이상 착용 시 아이템 이름 **청록색**으로 표시
- 지원 세트:
    - 방어구 14종
    - 악세서리 8종
    - 특수장비 6종

---

## ⚙️ 기술 스택

- **Frontend:** HTML5, CSS3 (CSS Variables), Vanilla JavaScript (ES6+)
- **Style System:** CSS Custom Properties (100+ 변수)
- **Storage:** localStorage API
- **Testing:** Playwright, Cypress, 바닐라 JavaScript
- **Build:** 빌드 도구 불필요 (순수 HTML/CSS/JS)

### CSS 아키텍처

```css
/* css/styles.css - 100% CSS 변수 기반 */
:root {
    /* 색상 팔레트 */
    --color-white: #ffffff;
    --gold: #c5a678;
    
    /* 희귀도 색상 */
    --txt-epic: #fcc419;
    --txt-unique: #ff80ab;
    --txt-rare: #b197fc;
    
    /* 엠블렘 배경 그라디언트 */
    --gradient-emb-red: linear-gradient(to bottom, #6a1a1a 0%, #4a1212 100%);
    --gradient-emb-yellow: linear-gradient(to bottom, #6a5a1a 0%, #4a3f12 100%);
    
    /* 간격/크기 시스템 */
    --spacing-xs: 2px;
    --spacing-sm: 4px;
    --spacing-md: 5px;
    /* ... 총 100+ 변수 */
}
```

**특징:**
- ✅ **일관된 디자인** - 모든 색상/간격이 변수화
- ✅ **쉬운 커스터마이징** - 변수만 수정하면 전체 테마 변경
- ✅ **반응형 설계** - 미디어 쿼리와 조합
- ✅ **다크 테마 준비** - 변수 재정의만으로 다크모드 가능

---

## 🌟 주요 기능 상세

### 자동 저장 시스템

```javascript
// 800ms 디바운스로 자동 저장
function autoSave() {
    clearTimeout(window.sTime);
    window.sTime = setTimeout(() => {
        localStorage.setItem('dnfm_character_equipment_data', JSON.stringify(allData));
    }, 800);
}
```

- ✅ 입력할 때마다 자동으로 저장
- ✅ 브라우저 종료 후 다시 열어도 복구
- ✅ 상태 메시지 표시 (💾 저장됨)

### 템플릿 시스템

```html
<template id="equipment-row-template">
    <!-- 재사용 가능한 HTML 템플릿 -->
</template>
```

- ✅ HTML `<template>` 태그 활용
- ✅ 동적으로 행 생성
- ✅ 메모리 효율적

### 이벤트 위임

```javascript
// 버블링 활용한 효율적인 이벤트 처리
document.addEventListener('change', function(e) {
    if (e.target.matches('[data-key]')) {
        autoSave();
    }
});
```

---

## 📱 반응형 디자인

- ✅ **테이블 가로 스크롤** - `overflow-x: auto`
- ✅ **모바일 뷰포트** - 작은 화면에서도 사용 가능
- ✅ **터치 지원** - 모바일 디바이스 최적화

---

## 🔒 데이터 보안

### localStorage 사용

- ✅ **클라이언트 저장소** - 서버 전송 없음
- ✅ **브라우저별 격리** - 다른 사이트 접근 불가
- ✅ **5MB 용량** - 수백 개 캐릭터 저장 가능

### JSON 백업

- ✅ **로컬 파일** - 사용자 PC에 저장
- ✅ **암호화 없음** - 텍스트 에디터로 편집 가능
- ✅ **버전 관리** - 파일명에 날짜/시간 포함

---

## 🤝 기여하기

### 버그 리포트

이슈를 생성할 때 다음을 포함해주세요:
1. 브라우저 및 버전
2. 재현 단계
3. 예상 동작 vs 실제 동작
4. 스크린샷 (선택)

### 기능 제안

1. 이슈에서 논의
2. Fork & Pull Request
3. 테스트 포함 (106개 테스트 유지)

---

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능합니다.

---

## 📞 문의

- **이슈:** GitHub Issues
- **테스트 가이드:** [README-TEST.md](./README-TEST.md)
- **문서:** 이 파일 (README.md)

---

## 🎉 감사합니다!

**RPG 통합 장비 관리 시스템**을 사용해주셔서 감사합니다!

즐거운 게임 되세요! 🎮✨

---

**최종 업데이트:** 2026-02-07  
**버전:** 1.0.0  
**테스트 현황:** 106/106 통과 ✅