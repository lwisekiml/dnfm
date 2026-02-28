/* ========================================
[섹션 12-1] 상세입력 탭 캐릭터 순서 동기화
======================================== */
/**
 * characters 배열 순서대로 상세입력 탭의 DOM을 재정렬
 * - 캐릭터 관리 탭에서 순서 변경 후 상세입력 탭 진입 시 호출
 * - DOM을 다시 그리지 않고 순서만 바꾸므로 입력값 유지됨
 */
function syncDetailTabOrder() {
    const container = document.getElementById('characterContainer');
    if (!container) return;
    if (!characters || characters.length === 0) return;

    // characters 배열 순서대로 DOM 재배치 + 없는 캐릭터는 새로 생성
    // querySelector는 id에 점(.)이 포함되면 오류 발생하므로 getElementById 사용
    characters.forEach(char => {
        let section = document.getElementById(char.id);
        if (!section) {
            // DOM에 없는 캐릭터 처리
            if (typeof createCharacterTable === 'function') {
                const isNewChar = !char.inputs || Object.keys(char.inputs).length === 0;
                if (isNewChar) {
                    // inputs가 없는 신규 캐릭터: savedData 없이 생성 → 기본값(마법부여 등) 적용
                    // 생성 후 id를 char.id로 교정하고 job/name 필드 채우기
                    createCharacterTable(null);
                    // 방금 생성된 섹션 = container 마지막 자식
                    const newSection = container.lastElementChild;
                    if (newSection && newSection.classList.contains('char-section')) {
                        // id 교정
                        const oldId = newSection.id;
                        newSection.id = char.id;
                        // AppState 키도 교정
                        if (typeof AppState !== 'undefined') {
                            if (AppState.charRuneData?.[oldId]) {
                                AppState.charRuneData[char.id] = AppState.charRuneData[oldId];
                                delete AppState.charRuneData[oldId];
                            }
                            if (AppState.charTags?.[oldId]) {
                                AppState.charTags[char.id] = AppState.charTags[oldId];
                                delete AppState.charTags[oldId];
                            }
                        }
                        // data-char-id 속성도 교정
                        newSection.querySelectorAll('[data-char-id]').forEach(el => {
                            if (el.getAttribute('data-char-id') === oldId) {
                                el.setAttribute('data-char-id', char.id);
                            }
                        });
                        // job/name 필드 채우기
                        const jobEl = newSection.querySelector('[data-key="info_job"]');
                        const nameEl = newSection.querySelector('[data-key="info_name"]');
                        if (jobEl) jobEl.value = char.job || '';
                        if (nameEl) nameEl.value = char.name || '';
                    }
                } else {
                    // inputs가 있는 기존 캐릭터: savedData와 함께 생성
                    createCharacterTable(char);
                }
            }
        } else if (section.closest('#characterContainer')) {
            // 이미 있으면 순서만 맞게 재배치
            container.appendChild(section);
        }
    });
}

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
        // 캐릭터 관리 탭에서 순서 변경 시 상세입력 탭 DOM도 재정렬
        syncDetailTabOrder();
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

// migrateToUnified() 함수는 storage.js로 이동

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