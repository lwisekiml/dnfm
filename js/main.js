// ============================================
// main.js - 메인 초기화 및 이벤트 리스너
// ============================================

/**
 * project1 데이터 복원 함수
 * - 단독 실행: window.onload 에서 호출
 * - 통합 환경: switchTo('detail') 에서 호출 (탭 진입 시)
 */
let _p1Initialized = false;

function initProject1() {
    if (_p1Initialized) return; // 이미 초기화됐으면 중복 실행 방지
    _p1Initialized = true;

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

    // 구버전 inputs 마이그레이션 (로드 시 자동 변환)
    if (parsedList && parsedList.length > 0) {
        parsedList = parsedList.map(c => ({
            ...c,
            inputs: typeof migrateInputs === 'function' ? migrateInputs(c.inputs) : c.inputs
        }));
    }

    if (parsedList && parsedList.length > 0) {
        parsedList.forEach(data => {
            createCharacterTable(data);
        });
    } else {
        createCharacterTable();
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

/**
 * 키보드 탭 이동 처리
 */
document.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
        const activeEx = document.activeElement;
        const key = activeEx.getAttribute('data-key') || "";
        const section = activeEx.closest('.char-section');
        if (!section) return;

        e.preventDefault();

        if (activeEx.tagName === 'TEXTAREA' || key.endsWith('_desc')) {
            const descFields = Array.from(section.querySelectorAll('input[data-key$="_desc"], textarea[data-key$="_desc"]'));
            const currentIndex = descFields.indexOf(activeEx);

            if (e.shiftKey) {
                if (currentIndex > 0) descFields[currentIndex - 1].focus();
            } else {
                if (currentIndex < descFields.length - 1) descFields[currentIndex + 1].focus();
            }
            return;
        }

        const currentSlot = activeEx.getAttribute('data-slot') || key.split('_')[0];
        const suffix = key.replace(currentSlot, '');
        const currentIndex = slots.indexOf(currentSlot);

        let nextIndex = e.shiftKey ? currentIndex - 1 : currentIndex + 1;

        if (nextIndex >= 0 && nextIndex < slots.length) {
            const nextSlot = slots[nextIndex];
            const targetInput = section.querySelector(`[data-key="${nextSlot}${suffix}"]`);

            if (targetInput && !targetInput.disabled) {
                targetInput.focus();
                if (targetInput.select) targetInput.select();
            }
        }
    }
});

/**
 * 입력 변경 감지 및 히스토리 기록
 */
document.addEventListener('change', function (e) {
    const el = e.target;
    const key = el.getAttribute('data-key');
    if (!key) return;

    const section = el.closest('.char-section');
    if (!section) return;

    const charName = section.querySelector('[data-key="info_name"]').value || "이름없음";
    const slot = key.split('_')[0];

    const prevChar = AppState.lastSnapshot.find(c => c.id === section.id);
    let oldVal = "";
    if (prevChar && prevChar.inputs) {
        if (key.startsWith('info_')) {
            oldVal = prevChar.inputs[key]?.val || "";
        } else {
            const underIdx = key.indexOf('_');
            if (underIdx !== -1) {
                const slot = key.slice(0, underIdx);
                const field = key.slice(underIdx + 1);
                oldVal = prevChar.inputs[slot]?.[field]?.val || "";
            }
        }
    }
    const newVal = el.value;

    if (oldVal !== newVal) {
        const timeStr = getCurrentDateTime();

        AppState.changeHistory.unshift({
            time: timeStr,
            charName: charName,
            slot: slot,
            old: (oldVal === "" ? "(빈칸)" : oldVal),
            new: (newVal === "" ? "(빈칸)" : newVal)
        });
        if (AppState.changeHistory.length > 10) AppState.changeHistory.pop();

        AppState.saveHistory();
        AppState.updateSnapshot();

        if (key.includes('info_stat_type') ||
            key.includes('info_ele_type') ||
            key.includes('_emb') ||
            key.includes('_seal')) {
            applySealHighlight(section.id);
        }
    }
});

/**
 * 모달 오버레이 클릭 시 모달 닫기
 */
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('modalOverlay');

    if (overlay) {
        overlay.addEventListener('click', () => {
            if (typeof closeHistoryModal === "function") closeHistoryModal();
            if (typeof closeRuneModal === "function") closeRuneModal();
        });
    }
});

console.log("✅ main.js 로드 완료");