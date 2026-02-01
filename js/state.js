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
        // 로컬 스토리지에서 히스토리 불러오기
        const historyData = localStorage.getItem(AppConstants.STORAGE_KEY + "_history");
        if (historyData) {
            try {
                this.changeHistory = JSON.parse(historyData);
            } catch (e) {
                console.error("히스토리 로드 실패:", e);
                this.changeHistory = [];
            }
        }

        // 로컬 스토리지에서 마지막 스냅샷 불러오기
        const snapshotData = localStorage.getItem(AppConstants.STORAGE_KEY);
        if (snapshotData) {
            try {
                this.lastSnapshot = JSON.parse(snapshotData);
            } catch (e) {
                console.error("스냅샷 로드 실패:", e);
                this.lastSnapshot = [];
            }
        }
    },

    /**
     * 히스토리 저장
     */
    saveHistory() {
        localStorage.setItem(AppConstants.STORAGE_KEY + "_history", JSON.stringify(this.changeHistory));
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