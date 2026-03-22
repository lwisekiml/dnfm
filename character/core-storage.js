// ============================================
// core-storage.js - 저장/불러오기 기능
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
                // 무기 종류 select는 저장 제외 (무기_itemname으로 복원 시 역추적)
                if (key === '무기_weapontype') return;
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

            // button[data-key] 수집 (input/select/textarea에는 button 미포함)
            sec.querySelectorAll('button[data-key]').forEach(btn => {
                const key = btn.getAttribute('data-key');

                // 크리쳐 버튼 저장 (이름/모드/세트효과 - 아티팩트는 hidden input으로 별도 저장)
                if (key === '크리쳐_name') {
                    if (!inputsObj['크리쳐']) inputsObj['크리쳐'] = {};
                    const cName       = btn.getAttribute('data-creature-name')          || btn.textContent.trim() || '';
                    const cMode       = btn.getAttribute('data-creature-mode')          || 'sel';
                    const cSetEff     = btn.getAttribute('data-creature-seteffect')     || '';
                    const cSetAuto    = btn.getAttribute('data-creature-setauto')       || 'false';
                    const cArtSetEff   = btn.getAttribute('data-creature-art-seteffect') || '';
                    const cArtSetAuto  = btn.getAttribute('data-creature-art-setauto')   || 'false';
                    inputsObj['크리쳐']['name']           = { val: cName,       cls: btn.className };
                    inputsObj['크리쳐']['mode']           = { val: cMode,       cls: '' };
                    inputsObj['크리쳐']['seteffect']      = { val: cSetEff,     cls: '' };
                    inputsObj['크리쳐']['setauto']        = { val: cSetAuto,    cls: '' };
                    inputsObj['크리쳐']['art-seteffect']  = { val: cArtSetEff,  cls: '' };
                    inputsObj['크리쳐']['art-setauto']    = { val: cArtSetAuto, cls: '' };
                    return;
                }

                // 칭호 버튼 저장
                if (key === '칭호_itemname') {
                    if (!inputsObj['칭호']) inputsObj['칭호'] = {};
                    const name  = btn.getAttribute('data-title-name') || btn.textContent.trim() || '';
                    const stats = btn.getAttribute('data-title-stats') || '{}';
                    inputsObj['칭호']['itemname']    = { val: name,  cls: btn.className };
                    inputsObj['칭호']['title_stats'] = { val: stats, cls: '' };
                    return;
                }

                if (key === '오라_itemname') {
                    if (!inputsObj['오라']) inputsObj['오라'] = {};
                    const name  = btn.getAttribute('data-aura-name') || btn.textContent.trim() || '';
                    const stats = btn.getAttribute('data-aura-stats') || '{}';
                    inputsObj['오라']['itemname']   = { val: name,  cls: btn.className };
                    inputsObj['오라']['aura_stats'] = { val: stats, cls: '' };
                    return;
                }

                if (key !== '아바타_itemname') return;

                if (!inputsObj['아바타']) inputsObj['아바타'] = {};

                // rawVal: "모자(레어) 얼굴(언커먼) ..." 형태
                const rawVal = btn.getAttribute('data-avatar-value') ?? btn.textContent ?? '';

                // parts: { "모자": "레어", "얼굴": "언커먼", ... } 구조로 저장
                const parts = {};
                rawVal.trim().split(/\s+/).forEach(token => {
                    const m = token.match(/^(.+)\((.+)\)$/);
                    if (m) parts[m[1]] = m[2];
                });
                inputsObj['아바타']['parts'] = parts;

                // 화면 표시용 원본도 유지 (복원 시 버튼 innerHTML 재생성에 사용)
                inputsObj['아바타']['itemname'] = { val: rawVal, cls: btn.className };
            });

            // 무기 아바타 수치 버튼: weapon_stat_v2 구조로 저장
            const weaponAvatarBtn = sec.querySelector('button[data-weapon-avatar-btn]');
            if (weaponAvatarBtn) {
                if (!inputsObj['아바타']) inputsObj['아바타'] = {};
                const waName  = weaponAvatarBtn.getAttribute('data-weapon-avatar-name') || '';
                const waStats = JSON.parse(weaponAvatarBtn.getAttribute('data-weapon-avatar-stats') || '{}');
                inputsObj['아바타']['weapon_stat_v2'] = {
                    name: waName,
                    base: waStats.base || [],
                    eff:  waStats.eff  || [],
                    desc: waStats.desc || ''
                };
            }

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

        // 변경된 characters를 localStorage에 저장
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

    const fileName = `dnfm_backup_${getCurrentDateTimeForFile()}.json`;

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

    const defaultFileName = `dnfm_backup_${getCurrentDateForFile()}.json`;

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

// ============================================
// 구버전 데이터 마이그레이션 → core-migration.js 로 이동
// ============================================
// migrateToUnified, migrateRuneData, migrateInputs → core-migration.js 참조