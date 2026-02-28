// ============================================
// storage.js - 저장/불러오기 기능
// ============================================
// ※ localStorage 읽기는 eq_core.js의 _loadUnified() 공통 헬퍼 사용

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
                const key = el.getAttribute('data-key');
                // info_ 계열은 플랫 구조 유지
                if (key.startsWith('info_')) {
                    inputsObj[key] = { val: el.value, cls: el.className };
                    return;
                }
                // 슬롯_필드 → 중첩 구조
                const underIdx = key.indexOf('_');
                if (underIdx === -1) {
                    inputsObj[key] = { val: el.value, cls: el.className };
                    return;
                }
                const slot = key.slice(0, underIdx);
                const field = key.slice(underIdx + 1);
                if (!inputsObj[slot]) inputsObj[slot] = {};
                inputsObj[slot][field] = { val: el.value, cls: el.className };
            });

            // 메모리의 characters 배열에서 해당 캐릭터 찾아 병합
            // (스토리지에서 읽지 않고 메모리 기준으로 처리 → armorCounts 등 덮어쓰기 방지)
            if (typeof characters !== 'undefined') {
                const existing = characters.find(c => c.id === charId);
                if (existing) {
                    existing.locked = sec.querySelector('.lock-btn')?.classList.contains('btn-active') || false;
                    existing.inputs = inputsObj;
                    // runeData를 inputs["스킬룬"].runeData 안에 저장 후 최상위에서 삭제
                    const runeData = AppState.charRuneData[charId] || existing.runeData;
                    if (runeData) {
                        if (!existing.inputs['스킬룬']) existing.inputs['스킬룬'] = {};
                        existing.inputs['스킬룬'].runeData = runeData;
                    }
                    delete existing.runeData;
                    existing.tags = AppState.charTags?.[charId] || existing.tags || [];
                    if (inputsObj['info_job']?.val) existing.job = inputsObj['info_job'].val;
                    if (inputsObj['info_name']?.val) existing.name = inputsObj['info_name'].val;
                } else {
                    const newRuneData = AppState.charRuneData[charId] || {
                        runes: Array(20).fill(null).map(() => ({ name: '', lv: '', skillLv: '' })),
                        gakin: ['', '']
                    };
                    if (!inputsObj['스킬룬']) inputsObj['스킬룬'] = {};
                    inputsObj['스킬룬'].runeData = newRuneData;
                    characters.push({
                        id: charId,
                        job: inputsObj['info_job']?.val || '',
                        name: inputsObj['info_name']?.val || '',
                        locked: sec.querySelector('.lock-btn')?.classList.contains('btn-active') || false,
                        inputs: inputsObj,
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
    const unified = _loadUnified();
    if (!unified.characters || unified.characters.length === 0) {
        return alert("저장된 데이터가 없습니다.");
    }

    // 내보내기 전 마이그레이션 적용
    // 순서 중요: inputs 플랫→중첩 먼저(스킬룬_desc 변환), 그 다음 runeData 병합
    unified.characters = unified.characters.map(c => {
        c = { ...c, inputs: migrateInputs(c.inputs) };
        c = migrateRuneData(c);
        return c;
    });

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
    const unified = _loadUnified();
    if (!unified.characters || unified.characters.length === 0) {
        return alert("저장된 데이터가 없습니다.");
    }

    // 내보내기 전 마이그레이션 적용
    // 순서 중요: inputs 플랫→중첩 먼저(스킬룬_desc 변환), 그 다음 runeData 병합
    unified.characters = unified.characters.map(c => {
        c = { ...c, inputs: migrateInputs(c.inputs) };
        c = migrateRuneData(c);
        return c;
    });

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
 * 구버전 character.runeData → inputs["스킬룬"].runeData 마이그레이션
 */
function migrateRuneData(character) {
    if (!character) return character;
    // 이미 inputs["스킬룬"].runeData에 있으면 스킵
    if (character.inputs?.['스킬룬']?.runeData) return character;
    // character.runeData가 있으면 이동
    if (character.runeData) {
        if (!character.inputs) character.inputs = {};
        if (!character.inputs['스킬룬']) character.inputs['스킬룬'] = {};
        character.inputs['스킬룬'].runeData = character.runeData;
        delete character.runeData;
    }
    return character;
}

/**
 * 구버전 inputs(플랫) → 신버전 inputs(중첩) 마이그레이션
 */
function migrateInputs(inputs) {
    if (!inputs) return inputs;
    // 이미 중첩 구조인지 확인 (슬롯 키가 객체면 신버전)
    // 단, 스킬룬(runeData 포함)은 val이 없으므로 예외 처리
    for (const [key, val] of Object.entries(inputs)) {
        if (key === '스킬룬') continue;
        if (!key.startsWith('info_') && typeof val === 'object' && val !== null && !('val' in val)) {
            return inputs; // 이미 신버전
        }
    }
    const newInputs = {};
    for (const [key, val] of Object.entries(inputs)) {
        // info_ 계열, 스킬룬(runeData 객체)은 그대로 유지
        if (key.startsWith('info_') || key === '스킬룬') {
            newInputs[key] = val;
            continue;
        }
        const underIdx = key.indexOf('_');
        if (underIdx === -1) { newInputs[key] = val; continue; }
        const slot = key.slice(0, underIdx);
        const field = key.slice(underIdx + 1);
        if (!newInputs[slot]) newInputs[slot] = {};
        newInputs[slot][field] = val;
    }
    return newInputs;
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

            // 구버전 inputs 마이그레이션 (순서 중요: 플랫→중첩 먼저, runeData 병합 나중)
            charactersToRestore = charactersToRestore.map(c => {
                c = { ...c, inputs: migrateInputs(c.inputs) };
                c = migrateRuneData(c);
                return c;
            });

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
// ============================================
// 구버전 데이터 → 통합 스토리지 마이그레이션 (1회성)
// ============================================

/**
 * 기존 데이터 마이그레이션 (1회성)
 * - dnfm_character_equipment_data (project1) + dnfm_eq (project2) → dnfm_unified
 * - dnfm_unified가 이미 존재하면 실행하지 않음
 */
function migrateToUnified() {
    if (localStorage.getItem(STORAGE_KEYS.UNIFIED)) return;

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

    // PROJECT1 = inputs 데이터, PROJECT2 = armorCounts/weaponCounts 데이터
    // 직업 기준으로 매칭해서 두 데이터를 하나로 합침
    const merged = [];
    const usedJobs = new Set();

    p1Chars.forEach(p1 => {
        const job = p1.inputs?.['info_job']?.val || '';
        if (usedJobs.has(job)) return;
        usedJobs.add(job);

        const p2 = p2Chars.find(c => (c.job || c.inputs?.['info_job']?.val || '') === job);

        merged.push({
            id: p1.id,
            job: job,
            name: p1.inputs?.['info_name']?.val || '',
            locked: p1.locked || false,
            inputs: p1.inputs || {},
            runeData: p1.runeData || { runes: Array(20).fill(null).map(() => ({ name: '', lv: '', skillLv: '' })), gakin: ['', ''] },
            tags: p1.tags || [],
            armorCounts: p2?.armorCounts || {},
            weaponCounts: p2?.weaponCounts || {},
            updateTimes: p2?.updateTimes || {},
            craftMaterials: p2?.craftMaterials || {}
        });
    });

    // p1에 없는 p2 캐릭터 추가
    p2Chars.forEach(p2 => {
        const job = p2.job || p2.inputs?.['info_job']?.val || '';
        if (usedJobs.has(job)) return;
        usedJobs.add(job);

        merged.push({
            id: p2.id,
            job: job,
            name: p2.name || p2.inputs?.['info_name']?.val || '',
            locked: p2.locked || false,
            inputs: p2.inputs || {},
            runeData: p2.runeData || { runes: Array(20).fill(null).map(() => ({ name: '', lv: '', skillLv: '' })), gakin: ['', ''] },
            tags: p2.tags || [],
            armorCounts: p2.armorCounts || {},
            weaponCounts: p2.weaponCounts || {},
            updateTimes: p2.updateTimes || {},
            craftMaterials: p2.craftMaterials || {}
        });
    });

    localStorage.setItem(STORAGE_KEYS.UNIFIED, JSON.stringify({ characters: merged, history }));
    console.log(`✅ 마이그레이션 완료: 총 ${merged.length}명`);
}