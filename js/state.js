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
        // 통합 스토리지에서 히스토리 불러오기
        try {
            const raw = localStorage.getItem(AppConstants.STORAGE_KEY);
            if (raw) {
                const unified = JSON.parse(raw);
                this.changeHistory = unified.history || [];
                this.lastSnapshot = unified.characters || [];
            }
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
            const raw = localStorage.getItem(AppConstants.STORAGE_KEY);
            const unified = raw ? JSON.parse(raw) : { characters: [], history: [] };
            unified.history = this.changeHistory;
            localStorage.setItem(AppConstants.STORAGE_KEY, JSON.stringify(unified));
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
                inputsObj[el.getAttribute('data-key')] = {val: el.value};
            });
            return {id: sec.id, inputs: inputsObj};
        });
    }
};

// 전역 별칭 제거 완료 - 모든 코드에서 AppState.* 직접 사용