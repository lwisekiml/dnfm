// ============================================
// main.js - 메인 초기화 및 이벤트 리스너
// ============================================

/**
 * 페이지 로드 시 초기화
 */
window.onload = () => {
    console.log("페이지 로딩 완료: 데이터 복구를 시작합니다.");

    // AppState 초기화
    if (typeof AppState !== 'undefined' && typeof AppState.init === 'function') {
        AppState.init();
    }

    const storageData = localStorage.getItem(AppConstants.STORAGE_KEY);
    let parsedList = [];

    try {
        parsedList = JSON.parse(storageData || "[]");
    } catch (e) {
        console.error("데이터 파싱 오류 발생:", e);
        parsedList = [];
    }

    const container = document.getElementById('characterContainer');
    if (container) container.innerHTML = "";

    if (parsedList && parsedList.length > 0) {
        parsedList.forEach(data => {
            createCharacterTable(data);
        });
    } else {
        createCharacterTable();
    }

    if (typeof AppState !== 'undefined' && typeof AppState.updateSnapshot === 'function') {
        AppState.updateSnapshot();
    } else if (typeof updateLastSnapshot === 'function') {
        updateLastSnapshot();
    }
};

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

    const prevChar = (typeof AppState !== 'undefined' ? AppState.lastSnapshot : lastSnapshot).find(c => c.id === section.id);
    const oldVal = (prevChar && prevChar.inputs && prevChar.inputs[key]) ? prevChar.inputs[key].val : "";
    const newVal = el.value;

    if (oldVal !== newVal) {
        const timeStr = getCurrentDateTime();

        const history = typeof AppState !== 'undefined' ? AppState.changeHistory : changeHistory;
        history.unshift({
            time: timeStr,
            charName: charName,
            slot: slot,
            old: (oldVal === "" ? "(빈칸)" : oldVal),
            new: (newVal === "" ? "(빈칸)" : newVal)
        });
        if (history.length > 10) history.pop();

        if (typeof AppState !== 'undefined' && typeof AppState.saveHistory === 'function') {
            AppState.saveHistory();
        } else if (typeof saveHistory === 'function') {
            saveHistory();
        }

        if (typeof AppState !== 'undefined' && typeof AppState.updateSnapshot === 'function') {
            AppState.updateSnapshot();
        } else if (typeof updateLastSnapshot === 'function') {
            updateLastSnapshot();
        }

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