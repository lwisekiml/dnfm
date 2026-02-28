// ============================================
// state.js - 애플리케이션 상태 관리
// ============================================

const AppState = {
    // 캐릭터 룬 데이터
    charRuneData: {},

    // 현재 편집 중인 캐릭터 ID
    currentEditingCharId: null,

    // 변경 히스토리
    changeHistory: [],

    // 마지막 스냅샷
    lastSnapshot: [],

    // 비교 모드 선택
    compareSelection: {
        left: null,
        right: null
    },

    /**
     * 초기화 메서드
     */
    init() {
        // _loadUnified()를 통해 통합 스토리지에서 히스토리 불러오기
        try {
            const unified = _loadUnified();
            this.changeHistory = unified.history || [];
            this.lastSnapshot = unified.characters || [];
        } catch (e) {
            console.error("스토리지 로드 실패:", e);
            this.changeHistory = [];
            this.lastSnapshot = [];
        }
    },

    /**
     * 히스토리 저장
     */
    saveHistory() {
        try {
            const unified = _loadUnified();
            unified.history = this.changeHistory;
            localStorage.setItem(STORAGE_KEYS.UNIFIED, JSON.stringify(unified));
        } catch (e) {
            console.error("히스토리 저장 실패:", e);
        }
    },

    /**
     * 스냅샷 업데이트
     */
    updateSnapshot() {
        this.lastSnapshot = Array.from(document.querySelectorAll('.char-section')).map(sec => {
            const inputsObj = {};
            sec.querySelectorAll('input[data-key], select[data-key], textarea[data-key]').forEach(el => {
                const key = el.getAttribute('data-key');
                // info_ 계열은 플랫 구조 유지
                if (key.startsWith('info_')) {
                    inputsObj[key] = { val: el.value };
                    return;
                }
                // 슬롯_필드 → 중첩 구조 (autoSave와 동일한 방식)
                const underIdx = key.indexOf('_');
                if (underIdx === -1) {
                    inputsObj[key] = { val: el.value };
                    return;
                }
                const slot = key.slice(0, underIdx);
                const field = key.slice(underIdx + 1);
                if (!inputsObj[slot]) inputsObj[slot] = {};
                inputsObj[slot][field] = { val: el.value };
            });
            return { id: sec.id, inputs: inputsObj };
        });
    }
};

// 전역 별칭 제거 완료 - 모든 코드에서 AppState.* 직접 사용