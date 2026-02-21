/* ========================================
[섹션 13] 탭 전환
======================================== */

// 3-1. 화면 전환 함수 수정
function switchTo(view) {
    const sections = {
        'char': document.getElementById("section-character-view"),
        'weapon': document.getElementById("section-weapon-view"),
        'equipment': document.getElementById("section-equipment-view"),
        'craft': document.getElementById("section-craft-view") // ✅ 추가
    };
    const buttons = {
        'char': document.getElementById("tab-char"),
        'weapon': document.getElementById("tab-weapon"),
        'equipment': document.getElementById("tab-equipment"),
        'craft': document.getElementById("tab-craft") // ✅ 추가
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

    window.scrollTo(0, 0);
}

/* ========================================
[섹션 14] JSON 백업/복원
======================================== */
function exportJSON() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    // 변경된 파일명 형식: dnfm_eq_YYYY-MM-DD_HH-MM.json
    const fileName = `dnfm_eq_${year}-${month}-${day}_${hours}-${minutes}.json`;

    const dataStr = JSON.stringify(characters, null, 2);
    const blob = new Blob([dataStr], {type: "application/json"});
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function saveJsonWithLocation() {
    const dataStr = localStorage.getItem('dnfm_eq');
    if (!dataStr) {
        alert("저장할 데이터가 없습니다.");
        return;
    }

    // 파일 기본 이름 설정 (오늘 날짜 포함)
    const defaultName = "dnfm_eq_JSON_backup_" + new Date().toISOString().slice(0, 10) + ".json";

    // 1. 최신 브라우저용 (File System Access API) - 직접 폴더/이름 지정 가능
    if ('showSaveFilePicker' in window) {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: defaultName,
                types: [{
                    description: 'JSON Files',
                    accept: {'application/json': ['.json']},
                }],
            });

            const writable = await handle.createWritable();
            await writable.write(dataStr);
            await writable.close();

            alert("지정된 위치에 저장되었습니다.");
        } catch (err) {
            // 사용자가 취소를 누른 경우 외의 에러 처리
            if (err.name !== 'AbortError') {
                console.error(err);
                alert("파일 저장 중 오류가 발생했습니다.");
            }
        }
    }
    // 2. 구형 브라우저/모바일용 (대체 수단)
    else {
        alert("현재 브라우저가 저장 위치 지정을 직접 지원하지 않아 기본 다운로드 방식으로 진행합니다.");
        const blob = new Blob([dataStr], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = defaultName;
        link.click();
        URL.revokeObjectURL(url);
    }
}

function importJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const imported = JSON.parse(e.target.result);

            if (!Array.isArray(imported)) {
                throw new Error("데이터가 배열 형식이 아닙니다.");
            }

            // 1. 전역 데이터 교체 및 필수 필드 보정
            characters = imported.map(char => {
                if (!char.name || !char.job) throw new Error("캐릭터 이름 또는 직업 정보가 누락된 항목이 있습니다.");
                return {
                    id: char.id || "c" + Date.now() + Math.random().toString(36).substr(2, 5),
                    name: char.name,
                    job: char.job,
                    armorCounts: char.armorCounts || {},
                    weaponCounts: char.weaponCounts || {},
                    updateTimes: char.updateTimes || {},
                    craftMaterials: char.craftMaterials || {}
                };
            });

            // 2. 상태 초기화 (UI 꼬임 방지)
            activeCharacterId = null;
            currentSetName = null;
            currentChar = null;

            // 3. 로컬 저장
            saveLocalData();

            // 4. ✅ 각 섹션 DOM 요소 미리 가져오기
            const charView = document.getElementById("section-character-view");
            const weaponView = document.getElementById("section-weapon-view");
            const equipmentView = document.getElementById("section-equipment-view");
            const craftView = document.getElementById("section-craft-view");

            // 5. 캐릭터 탭 갱신 (항상)
            renderCharacterList();
            document.getElementById("setList").innerHTML = "";
            document.getElementById("panel").innerHTML = "";

            // 6. 무기 탭이 열려있으면 갱신
            if (weaponView.style.display !== "none") {
                selectWeaponJob(activeWeaponJob || '귀검사', true);
            }

            // 7. ✅ 장비 관리 탭이 열려있으면 갱신
            if (equipmentView.style.display !== "none") {
                // ✅ 캐릭터별 장비 보유 현황이 열려있으면 갱신
                if (isCharacterEquipmentViewOpen && selectedCharacterForEquipment) {
                    const char = characters.find(c => c.id === selectedCharacterForEquipment);
                    if (char) {
                        renderCharacterButtons();
                        renderCharacterEquipmentDetail(char);
                    }
                } else {
                    // 일반 장비 관리 화면이면 갱신
                    renderEquipmentTab('ALL');
                }
            }

            // 8. 제작 탭이 열려있으면 갱신
            if (craftView.style.display !== "none") {
                renderCraftTable();
            }

            alert(`데이터 복구 완료! 총 ${characters.length}명의 데이터가 적용되었습니다.`);
            event.target.value = '';

        } catch (err) {
            console.error(err);
            alert("파일 읽기 중 오류 발생: " + err.message);
        }
    };
    reader.readAsText(file);
}

/* ========================================
[섹션 15] 초기화 & 이벤트 리스너
======================================== */
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