// ============================================
// core-main.js - 메인 초기화 및 이벤트 리스너
// ============================================

/**
 * project1 데이터 복원 함수
 * - 단독 실행: window.onload 에서 호출
 * - 통합 환경: switchTo('detail') 에서 호출 (탭 진입 시)
 */
// _p1Initialized → UIState.p1Initialized (core-state.js)

function initProject1() {
    if (UIState.p1Initialized) return; // 이미 초기화됐으면 중복 실행 방지
    UIState.p1Initialized = true;

    console.log("project1 초기화: 데이터 복구를 시작합니다.");

    AppState.init();

    // 통합 환경: dnfm_unified의 characters 배열 사용
    // 단독 환경: 기존 AppConstants.STORAGE_KEY 사용
    let parsedList = [];
    try {
        if (typeof STORAGE_KEYS !== 'undefined' && STORAGE_KEYS.UNIFIED) {
            const unified = JSON.parse(localStorage.getItem(STORAGE_KEYS.UNIFIED) || '{}');
            parsedList = unified.characters || [];
        } else {
            parsedList = JSON.parse(localStorage.getItem(AppConstants.STORAGE_KEY) || '[]');
        }
    } catch (e) {
        console.error("데이터 파싱 오류 발생:", e);
        parsedList = [];
    }

    const container = document.getElementById('characterContainer');
    if (container) container.innerHTML = "";

    // 구버전 inputs 마이그레이션 (순서 중요: 플랫→중첩 먼저, runeData 병합 나중)
    let needsSave = false;
    if (parsedList && parsedList.length > 0) {
        parsedList = parsedList.map(c => {
            const before = JSON.stringify(c);
            if (typeof migrateInputs === 'function') c = { ...c, inputs: migrateInputs(c.inputs) };
            if (typeof migrateRuneData === 'function') c = migrateRuneData(c);
            if (JSON.stringify(c) !== before) needsSave = true;
            return c;
        });
    }

    if (parsedList && parsedList.length > 0) {
        parsedList.forEach(data => {
            createCharacterTable(data);
        });
    } else {
        createCharacterTable();
    }

    // 마이그레이션이 실제로 발생했으면 createCharacterTable 이후에 저장
    // (AppState.charRuneData가 채워진 다음이어야 runeData가 제대로 포함됨)
    if (needsSave && typeof characters !== 'undefined') {
        if (typeof saveLocalData === 'function') saveLocalData();
    }

    AppState.updateSnapshot();
}

/**
 * 페이지 로드 시 초기화
 * - 통합 환경: section-detail-view 가 존재하면 탭 진입 시 초기화로 위임
 * - 단독 실행(index.html): 즉시 초기화
 */
window.addEventListener('load', () => {
    const isIntegrated = !!document.getElementById('section-detail-view');
    if (!isIntegrated) {
        // 단독 실행 환경 (기존 index.html)
        initProject1();
    }
    // 통합 환경에서는 switchTo('detail') 호출 시 initProject1() 실행
});

// ============================================
// 이벤트 리스너 → core-events.js 로 이동
// ============================================
// keydown(탭 이동), change(히스토리 기록),
// DOMContentLoaded(모달/팝업 초기화) → core-events.js 참조

console.log("✅ core-main.js 로드 완료");