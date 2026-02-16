// ============================================
// storage.js - 저장/불러오기 기능
// ============================================

/**
 * 자동 저장
 */
function autoSave() {
    clearTimeout(window.sTime);
    window.sTime = setTimeout(() => {
        const allData = Array.from(document.querySelectorAll('.char-section')).map(sec => {
            const inputsObj = {};
            sec.querySelectorAll('input[data-key], select[data-key], textarea[data-key]').forEach(el => {
                inputsObj[el.getAttribute('data-key')] = {
                    val: el.value,
                    cls: el.className
                };
            });
            return {
                id: sec.id,
                locked: sec.querySelector('.lock-btn')?.classList.contains('btn-active'),
                inputs: inputsObj,
                runeData: AppState.charRuneData[sec.id],
                tags: AppState.charTags?.[sec.id] || []  // ⭐ 추가
            };
        });

        localStorage.setItem(AppConstants.STORAGE_KEY, JSON.stringify(allData));

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
    const charData = localStorage.getItem(AppConstants.STORAGE_KEY);
    const historyData = localStorage.getItem(AppConstants.STORAGE_KEY + "_history");

    if (!charData) return alert("저장된 데이터가 없습니다.");

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const fileName = `dnfm_character_equipment_backup_${year}-${month}-${day}_${hours}-${minutes}.json`;

    const backup = {
        characters: JSON.parse(charData),
        history: historyData ? JSON.parse(historyData) : []
    };

    const blob = new Blob([JSON.stringify(backup)], {type: "application/json"});
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
    const charData = localStorage.getItem(AppConstants.STORAGE_KEY);
    const historyData = localStorage.getItem(AppConstants.STORAGE_KEY + "_history");

    if (!charData) return alert("저장된 데이터가 없습니다.");

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const defaultFileName = `dnfm_character_equipment_backup_${year}-${month}-${day}.json`;

    const backup = {
        characters: JSON.parse(charData),
        history: historyData ? JSON.parse(historyData) : []
    };

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
            await writable.write(JSON.stringify(backup, null, 2));
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
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
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

            if (Array.isArray(importedData)) {
                charactersToRestore = importedData;
                historyToRestore = [];
            } else if (importedData && importedData.characters) {
                charactersToRestore = importedData.characters;
                historyToRestore = importedData.history || [];
            } else {
                throw new Error("지원하지 않는 데이터 형식입니다.");
            }

            document.getElementById('characterContainer').innerHTML = "";
            AppState.charRuneData = {};
            AppState.charTags = {};  // ⭐ 추가
            charactersToRestore.forEach(d => createCharacterTable(d));

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
            autoSave();

            alert("데이터 복구가 완료되었습니다.");
        } catch (err) {
            alert("파일 불러오기 실패: " + err.message);
            console.error(err);
        }
    };
    reader.readAsText(input.files[0]);
}