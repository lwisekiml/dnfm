// ============================================
// storage.js - 저장/불러오기 기능
// ============================================

/**
 * 통합 스토리지에서 전체 객체 읽기 (내부 헬퍼)
 */
function _loadUnifiedStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.UNIFIED);
        if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { characters: [], history: [] };
}

/**
 * 자동 저장
 * - DOM의 .char-section 에서 project1 입력값을 읽어 characters 배열에 병합 후 저장
 */
function autoSave() {
    clearTimeout(window.sTime);
    window.sTime = setTimeout(() => {
        // DOM에서 현재 상세입력 탭의 입력값 수집
        const domSections = Array.from(document.querySelectorAll('.char-section'));

        domSections.forEach(sec => {
            const charId = sec.id;
            const inputsObj = {};
            sec.querySelectorAll('input[data-key], select[data-key], textarea[data-key]').forEach(el => {
                inputsObj[el.getAttribute('data-key')] = {
                    val: el.value,
                    cls: el.className
                };
            });

            // 메모리의 characters 배열에서 해당 캐릭터 찾아 병합
            // (스토리지에서 읽지 않고 메모리 기준으로 처리 → armorCounts 등 덮어쓰기 방지)
            if (typeof characters !== 'undefined') {
                const existing = characters.find(c => c.id === charId);
                if (existing) {
                    existing.locked = sec.querySelector('.lock-btn')?.classList.contains('btn-active') || false;
                    existing.inputs = inputsObj;
                    existing.runeData = AppState.charRuneData[charId] || existing.runeData;
                    existing.tags = AppState.charTags?.[charId] || existing.tags || [];
                    if (inputsObj['info_job']?.val) existing.job = inputsObj['info_job'].val;
                    if (inputsObj['info_name']?.val) existing.name = inputsObj['info_name'].val;
                } else {
                    characters.push({
                        id: charId,
                        job: inputsObj['info_job']?.val || '',
                        name: inputsObj['info_name']?.val || '',
                        locked: sec.querySelector('.lock-btn')?.classList.contains('btn-active') || false,
                        inputs: inputsObj,
                        runeData: AppState.charRuneData[charId] || {
                            runes: Array(20).fill(null).map(() => ({ name: '', lv: '', skillLv: '' })),
                            gakin: ['', '']
                        },
                        tags: AppState.charTags?.[charId] || [],
                        armorCounts: {},
                        weaponCounts: {},
                        updateTimes: {},
                        craftMaterials: {}
                    });
                }
            }
        });

        // 메모리 characters를 스토리지에 저장 (saveLocalData와 동일한 방식)
        if (typeof saveLocalData === 'function') {
            saveLocalData();
        }

        const msg = document.getElementById('statusMsg');
        if (msg) {
            msg.innerText = "💾 저장됨";
            setTimeout(() => msg.innerText = "", 1000);
        }
    }, 800);
}

/**
 * JSON으로 내보내기
 */
function exportToJSON() {
    const unified = _loadUnifiedStorage();
    if (!unified.characters || unified.characters.length === 0) {
        return alert("저장된 데이터가 없습니다.");
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const fileName = `dnfm_backup_${year}-${month}-${day}_${hours}-${minutes}.json`;

    const blob = new Blob([JSON.stringify(unified, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();

    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/**
 * 경로 지정 저장
 */
async function saveJsonWithLocation() {
    const unified = _loadUnifiedStorage();
    if (!unified.characters || unified.characters.length === 0) {
        return alert("저장된 데이터가 없습니다.");
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const defaultFileName = `dnfm_backup_${year}-${month}-${day}.json`;

    if ('showSaveFilePicker' in window) {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: defaultFileName,
                types: [{
                    description: 'JSON Files',
                    accept: { 'application/json': ['.json'] },
                }],
            });

            const writable = await handle.createWritable();
            await writable.write(JSON.stringify(unified, null, 2));
            await writable.close();

            const statusMsg = document.getElementById('statusMsg');
            if (statusMsg) {
                statusMsg.innerText = `✅ "${handle.name}" 저장 완료`;
                setTimeout(() => statusMsg.innerText = "", 2000);
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error(err);
                alert("파일 저장 중 오류가 발생했습니다.");
            }
        }
    } else {
        alert("현재 브라우저가 저장 위치 지정을 직접 지원하지 않아 기본 다운로드 방식으로 진행합니다.");
        const blob = new Blob([JSON.stringify(unified, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = defaultFileName;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);

        const statusMsg = document.getElementById('statusMsg');
        if (statusMsg) {
            statusMsg.innerText = `✅ "${defaultFileName}" 저장 완료`;
            setTimeout(() => statusMsg.innerText = "", 2000);
        }
    }
}

/**
 * JSON에서 불러오기
 */
function importFromJSON(input) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            let charactersToRestore = [];
            let historyToRestore = [];

            // 통합 형식: { characters, history }
            if (importedData && importedData.characters) {
                charactersToRestore = importedData.characters;
                historyToRestore = importedData.history || [];
                // 구버전 project1 형식: 배열
            } else if (Array.isArray(importedData)) {
                charactersToRestore = importedData;
                historyToRestore = [];
            } else {
                throw new Error("지원하지 않는 데이터 형식입니다.");
            }

            // project2 전역 characters 배열 교체
            characters = charactersToRestore;

            // project2 상태 초기화 (UI 꼬임 방지)
            if (typeof activeCharacterId !== 'undefined') activeCharacterId = null;
            if (typeof currentSetName !== 'undefined') currentSetName = null;
            if (typeof currentChar !== 'undefined') currentChar = null;

            // 세트 완성 여부 캐시 초기화 (이전 데이터 기준 캐시가 남아 노란색 버튼 유지되는 문제 방지)
            if (typeof distinctPartsCache !== 'undefined') {
                Object.keys(distinctPartsCache).forEach(k => delete distinctPartsCache[k]);
            }

            // project1 DOM 재렌더링
            const characterContainer = document.getElementById('characterContainer');
            if (characterContainer) characterContainer.innerHTML = "";
            AppState.charRuneData = {};
            AppState.charTags = {};
            charactersToRestore.forEach(d => createCharacterTable(d));

            // project2 UI 갱신 - 캐릭터 목록
            if (typeof renderCharacterList === 'function') renderCharacterList();

            // setList, panel 초기화
            const setListEl = document.getElementById("setList");
            const panelEl = document.getElementById("panel");
            if (setListEl) setListEl.innerHTML = "";
            if (panelEl) panelEl.innerHTML = "";

            // 현재 열려있는 탭 갱신
            const weaponView = document.getElementById("section-weapon-view");
            const equipmentView = document.getElementById("section-equipment-view");
            const craftView = document.getElementById("section-craft-view");

            if (weaponView && weaponView.style.display !== "none") {
                if (typeof selectWeaponJob === 'function') selectWeaponJob(activeWeaponJob || '귀검사', true);
            }
            if (equipmentView && equipmentView.style.display !== "none") {
                if (typeof renderEquipmentTab === 'function') renderEquipmentTab('ALL');
            }
            if (craftView && craftView.style.display !== "none") {
                if (typeof renderCraftTable === 'function') renderCraftTable();
            }

            // 히스토리 복원
            AppState.changeHistory = historyToRestore;
            const timeStr = getCurrentDateTime();
            AppState.changeHistory.unshift({
                time: timeStr,
                charName: "시스템",
                slot: "데이터 복구",
                old: "-",
                new: "백업 파일로부터 데이터가 복원됨"
            });
            if (AppState.changeHistory.length > 10) AppState.changeHistory.pop();
            AppState.saveHistory();

            // 통합 스토리지에 저장
            localStorage.setItem(STORAGE_KEYS.UNIFIED, JSON.stringify({
                characters: charactersToRestore,
                history: historyToRestore
            }));

            alert("데이터 복구가 완료되었습니다.");
        } catch (err) {
            alert("파일 불러오기 실패: " + err.message);
            console.error(err);
        }
    };
    reader.readAsText(input.files[0]);
}