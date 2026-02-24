/* ========================================
[섹션 13] 탭 전환
======================================== */
function switchTo(view) {
    const sections = {
        'char': document.getElementById("section-character-view"),
        'weapon': document.getElementById("section-weapon-view"),
        'equipment': document.getElementById("section-equipment-view"),
        'craft': document.getElementById("section-craft-view"),
        'detail': document.getElementById("section-detail-view")
    };
    const buttons = {
        'char': document.getElementById("tab-char"),
        'weapon': document.getElementById("tab-weapon"),
        'equipment': document.getElementById("tab-equipment"),
        'craft': document.getElementById("tab-craft"),
        'detail': document.getElementById("tab-detail")
    };

    // 모든 섹션 숨기고 버튼 스타일 초기화
    Object.keys(sections).forEach(k => {
        if (sections[k]) sections[k].style.display = "none";
        if (buttons[k]) {
            buttons[k].style.background = "#2a3158";
            buttons[k].style.border = "2px solid transparent";
        }
    });

    // 선택된 섹션 보이기 및 버튼 강조
    if (sections[view]) sections[view].style.display = "block";
    if (buttons[view]) {
        buttons[view].style.background = "#4a33cc";
        buttons[view].style.border = "2px solid #fff";
    }

    // 탭별 초기 데이터 로드
    if (view === 'char') renderCharacterList();
    if (view === 'weapon') selectWeaponJob('귀검사', true);
    if (view === 'equipment') {
        renderEquipmentTab('ALL');

        // 장비 관리 툴바의 첫 번째 버튼을 찾아서 active 클래스 부여
        const equipmentToolbar = document.querySelector("#section-equipment-view .toolbar");
        const firstBtn = equipmentToolbar.querySelector(".char-btn");

        // 모든 장비 버튼 초기화 후 첫 번째 버튼만 켬
        equipmentToolbar.querySelectorAll(".char-btn").forEach(b => b.classList.remove("active"));
        if (firstBtn) firstBtn.classList.add("active");
    }
    if (view === 'craft') renderCraftTable();
    if (view === 'detail') {
        // project1 초기화 - 저장 데이터 복원
        if (typeof initProject1 === 'function') initProject1();
    }

    window.scrollTo(0, 0);
}

/* ========================================
[섹션 14] JSON 백업/복원
======================================== */
// exportJSON() → storage.js의 exportToJSON() 사용
// importJSON()  → storage.js의 importFromJSON() 사용

// saveJsonWithLocation() → storage.js의 통합 버전 사용

/* ========================================
[섹션 15] 초기화 & 이벤트 리스너
======================================== */

/**
 * 기존 데이터 마이그레이션 (1회성)
 * - dnfm_character_equipment_data (project1) + dnfm_eq (project2) → dnfm_unified
 * - dnfm_unified가 이미 존재하면 실행하지 않음
 */
function migrateToUnified() {
    // ── 1단계: dnfm_unified 없으면 최초 생성 ──────────────────────────────
    if (!localStorage.getItem(STORAGE_KEYS.UNIFIED)) {
        let p1Chars = [];
        let p2Chars = [];
        let history = [];

        try {
            const p1Raw = localStorage.getItem(STORAGE_KEYS.PROJECT1);
            if (p1Raw) p1Chars = JSON.parse(p1Raw);
        } catch (e) {}

        try {
            const p2Raw = localStorage.getItem(STORAGE_KEYS.PROJECT2);
            if (p2Raw) p2Chars = JSON.parse(p2Raw);
        } catch (e) {}

        try {
            const hRaw = localStorage.getItem(STORAGE_KEYS.PROJECT1 + "_history");
            if (hRaw) history = JSON.parse(hRaw);
        } catch (e) {}

        const merged = [];
        const usedJobs = new Set();

        p1Chars.forEach(c => {
            const job = c.inputs?.['info_job']?.val || c.job || '';
            if (!usedJobs.has(job)) {
                usedJobs.add(job);
                merged.push({
                    id: c.id,
                    job: job,
                    name: c.inputs?.['info_name']?.val || c.name || '',
                    locked: c.locked || false,
                    inputs: c.inputs || {},
                    runeData: c.runeData || { runes: Array(20).fill(null).map(() => ({ name: '', lv: '', skillLv: '' })), gakin: ['', ''] },
                    tags: c.tags || [],
                    armorCounts: c.armorCounts || {},
                    weaponCounts: c.weaponCounts || {},
                    updateTimes: c.updateTimes || {},
                    craftMaterials: c.craftMaterials || {}
                });
            }
        });

        p2Chars.forEach(c => {
            const job = c.job || c.inputs?.['info_job']?.val || '';
            if (!usedJobs.has(job)) {
                usedJobs.add(job);
                merged.push({
                    id: c.id,
                    job: job,
                    name: c.name || c.inputs?.['info_name']?.val || '',
                    locked: c.locked || false,
                    inputs: c.inputs || {},
                    runeData: c.runeData || { runes: Array(20).fill(null).map(() => ({ name: '', lv: '', skillLv: '' })), gakin: ['', ''] },
                    tags: c.tags || [],
                    armorCounts: c.armorCounts || {},
                    weaponCounts: c.weaponCounts || {},
                    updateTimes: c.updateTimes || {},
                    craftMaterials: c.craftMaterials || {}
                });
            }
        });

        localStorage.setItem(STORAGE_KEYS.UNIFIED, JSON.stringify({ characters: merged, history }));
        console.log(`✅ 최초 마이그레이션 완료: 총 ${merged.length}명`);
        return;
    }

    // ── 2단계: dnfm_unified가 이미 있으면 p2 누락 캐릭터 보완 ───────────────
    // 캐릭터 장비 관리(p2, dnfm_eq)에 있지만 dnfm_unified에 없는 캐릭터를 추가
    let p2Chars = [];
    try {
        const p2Raw = localStorage.getItem(STORAGE_KEYS.PROJECT2);
        if (p2Raw) p2Chars = JSON.parse(p2Raw);
    } catch (e) {}

    if (p2Chars.length === 0) return; // p2 데이터 없으면 종료

    let unified = { characters: [], history: [] };
    try {
        unified = JSON.parse(localStorage.getItem(STORAGE_KEYS.UNIFIED));
    } catch (e) { return; }

    // unified에 이미 있는 id, job 세트 수집
    const unifiedIds = new Set(unified.characters.map(c => c.id));
    const unifiedJobs = new Set(unified.characters.map(c => c.job || ''));

    let added = 0;
    p2Chars.forEach(c => {
        const job = c.job || c.inputs?.['info_job']?.val || '';
        const name = c.name || c.inputs?.['info_name']?.val || '';
        // id 또는 직업이 이미 unified에 있으면 skip
        if (unifiedIds.has(c.id) || unifiedJobs.has(job)) return;

        unified.characters.push({
            id: c.id,
            job: job,
            name: name,
            locked: c.locked || false,
            inputs: c.inputs || {
                'info_job': { val: job, cls: '' },
                'info_name': { val: name, cls: '' }
            },
            runeData: c.runeData || { runes: Array(20).fill(null).map(() => ({ name: '', lv: '', skillLv: '' })), gakin: ['', ''] },
            tags: c.tags || [],
            armorCounts: c.armorCounts || {},
            weaponCounts: c.weaponCounts || {},
            updateTimes: c.updateTimes || {},
            craftMaterials: c.craftMaterials || {}
        });
        unifiedIds.add(c.id);
        unifiedJobs.add(job);
        added++;
    });

    if (added > 0) {
        localStorage.setItem(STORAGE_KEYS.UNIFIED, JSON.stringify(unified));
        console.log(`✅ p2 누락 캐릭터 ${added}명 추가됨 (총 ${unified.characters.length}명)`);
    }
}

migrateToUnified();
calculateGlobalWidths();
loadLocalData();
renderCharacterList();
selectWeaponJob('귀검사');

// 모바일 환경 터치 대응 통합
window.ontouchstart = function (event) {
    const prefixModal = document.getElementById("prefixFullModal");
    const updateModal = document.getElementById("updateModal");
    const actionModal = document.getElementById("actionModal");
    const confirmModal = document.getElementById("confirmModal");

    if (event.target === prefixModal) prefixModal.style.display = 'none';
    if (event.target === updateModal) updateModal.style.display = 'none';
    if (event.target === actionModal) actionModal.style.display = 'none';
    if (event.target === confirmModal) {
        if (typeof closeConfirmModal === "function") closeConfirmModal();
        else confirmModal.style.display = 'none';
    }
};

// Enter 키 검색 지원
const searchInput = document.getElementById("equipment-search-input");
if (searchInput) {
    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            searchEquipment();
        }
    });
}

// // 모바일 환경을 위한 터치 이벤트 대응
// window.ontouchstart = function (event) {
//     const modal = document.getElementById("updateModal");
//     if (event.target === modal) {
//         modal.style.display = 'none';
//     }
// };
//
//
// // 모바일 터치 대응 (터치 시작 시 닫기)
// window.ontouchstart = function (event) {
//     const modal = document.getElementById("prefixFullModal");
//     if (event.target === modal) {
//         modal.style.display = "none";
//     }
// };


// // 모든 팝업창 외부 클릭 시 닫기 처리 (통합 버전)
// window.onclick = function (event) {
//     const updateModal = document.getElementById("updateModal");
//     const prefixModal = document.getElementById("prefixFullModal");
//     const actionModal = document.getElementById("actionModal");
//     const confirmModal = document.getElementById("confirmModal");
//
//     // 1. 최근 업데이트 내역 모달
//     if (event.target === updateModal) {
//         updateModal.style.display = 'none';
//     }
//     // 2. 전체 장비 현황 모달
//     if (event.target === prefixModal) {
//         prefixModal.style.display = 'none';
//     }
//     // 3. 캐릭터 액션(수정/삭제 등) 모달
//     if (event.target === actionModal) {
//         actionModal.style.display = 'none';
//     }
//     // 4. 확인(Confirm) 모달
//     if (event.target === confirmModal) {
//         if (typeof closeConfirmModal === "function") closeConfirmModal();
//         else confirmModal.style.display = 'none';
//     }
// };


/* ========================================
[테스트용 export]
Node.js(logic.js 브릿지)에서 이 HTML을 파싱할 때만 사용됨.
브라우저에서는 typeof exports === 'undefined' 이므로 무시됨.
======================================== */
if (typeof exports !== 'undefined') {
    Object.assign(exports, {
        // 상수
        ARMOR_SETS, ACCESSORY_SETS, SPECIAL_SETS, ALL_SETS,
        ARMOR_PREFIX, ACCESSORY_PREFIX, SPECIAL_PREFIX, ALL_PREFIX,
        ARMOR_EXCEED_ONLY, ACCESSORY_EXCEED_ONLY,
        LEGACY_PREFIX_SETS, EXCEED_TAGS, EXCEED_SLOTS,
        // 순수 로직 함수
        makePrefixKey, isExceedName, getGroupKey, getSetType,
        calcTotalDistinctParts,
        // 정렬 (DOM 의존 부분 제거한 순수 로직만)
        _sortByName: (chars) => [...chars].sort((a, b) => a.name.localeCompare(b.name, 'ko-KR')),
        _sortByJob: (chars) => [...chars].sort((a, b) => {
            const j = a.job.localeCompare(b.job, 'ko-KR');
            return j !== 0 ? j : a.name.localeCompare(b.name, 'ko-KR');
        }),
        // 카운트 증감 (DOM 의존 부분 제거한 순수 로직만)
        _incrementCount: (char, key) => {
            char.armorCounts[key] = (char.armorCounts[key] || 0) + 1;
        },
        _decrementCount: (char, key) => {
            char.armorCounts[key] = Math.max(0, (char.armorCounts[key] || 0) - 1);
        },
        // 세트 완성도
        _getSetType3or5: (count, setName) => {
            const slots = ALL_SETS[setName] || [];
            const total = slots.length;
            if (total === 0) return null;
            const ratio = count / total;
            if (ratio >= 1.0) return 5;
            if (ratio >= 0.6) return 3;
            return null;
        },
    });
}