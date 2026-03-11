// ============================================
// main.js - 메인 초기화 및 이벤트 리스너
// ============================================

/**
 * project1 데이터 복원 함수
 * - 단독 실행: window.onload 에서 호출
 * - 통합 환경: switchTo('detail') 에서 호출 (탭 진입 시)
 */
// _p1Initialized → UIState.p1Initialized (state.js)

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

    // 변경된 필드명 표시용 레이블 생성
    const FIELD_LABELS = {
        'rarity': '희귀도', 'exceed': '익시드', 'prefix': '접두어',
        'itemname': '아이템이름', 'reinforce': '강화',
        'seal1': '봉인(고유)', 'seal1_val': '봉인(고유)수치',
        'seal2': '봉인(일반)', 'seal2_val': '봉인(일반)수치',
        'emb1': '엠블렘1', 'emb2': '엠블렘2',
        'enchant': '마법부여', 'enchant_val': '마법부여수치',
        'desc': '설명',
        'info_job': '직업', 'info_name': '이름',
        'info_stat_type': '스탯', 'info_ele_type': '속강',
        'info_power': '항마력',
        'weapon_stat': '무기아바타수치',
        'name': '크리쳐이름',
        'art_red_bg': '아티팩트(빨강)희귀도', 'art_red_opt': '아티팩트(빨강)옵션',
        'art_blue_bg': '아티팩트(파랑)희귀도', 'art_blue_opt': '아티팩트(파랑)옵션',
        'art_green_bg': '아티팩트(초록)희귀도', 'art_green_opt': '아티팩트(초록)옵션',
        'title_stats': '칭호스탯',
    };
    function getFieldLabel(dataKey) {
        if (dataKey.startsWith('info_')) return FIELD_LABELS[dataKey] || dataKey;
        const underIdx = dataKey.indexOf('_');
        if (underIdx === -1) return dataKey;
        const slotPart = dataKey.slice(0, underIdx);
        const fieldPart = dataKey.slice(underIdx + 1);
        const fieldLabel = FIELD_LABELS[fieldPart] || fieldPart;
        return slotPart + ' ' + fieldLabel;
    }
    const slotLabel = getFieldLabel(key);

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

    // select 요소인 경우 value 대신 선택된 option의 표시 텍스트(label)를 기록에 사용
    function getDisplayVal(val, element) {
        if (!val) return "";
        if (element && element.tagName === 'SELECT') {
            const opt = Array.from(element.options).find(o => o.value === val);
            if (opt) return opt.text;
        }
        return val;
    }

    if (oldVal !== newVal) {
        const timeStr = getCurrentDateTime();

        const displayOld = getDisplayVal(oldVal, el);
        const displayNew = getDisplayVal(newVal, el);

        AppState.changeHistory.unshift({
            time: timeStr,
            charName: charName,
            slot: slotLabel,
            old: (displayOld === "" ? "(빈칸)" : displayOld),
            new: (displayNew === "" ? "(빈칸)" : displayNew)
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
    // 아이템 데이터 JSON 로드(data 에 있는 장비 정보 로드)
    // if (typeof loadItemStats === 'function') {
    //     loadItemStats().catch(err => console.warn('아이템 데이터 로드 실패:', err));
    // }

    const overlay = document.getElementById('modalOverlay');

    if (overlay) {
        overlay.addEventListener('click', () => {
            const historyModal = document.getElementById('historyModal');
            if (historyModal && getComputedStyle(historyModal).display !== 'none') {
                if (typeof closeHistoryModal === "function") closeHistoryModal();
            }
        });
    }

    // 칭호/오라 팝업 숫자 input에서 e, E, +, -, ArrowUp, ArrowDown 입력 차단
    ['title-popup', 'aura-popup'].forEach(id => {
        const popup = document.getElementById(id);
        if (!popup) return;
        popup.addEventListener('keydown', e => {
            if (e.target.type === 'number' && ['e', 'E', '+', '-', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                e.preventDefault();
            }
        });
    });
});

console.log("✅ main.js 로드 완료");