// ============================================
// ui-rune.js - 스킬룬 모달 관련 기능
// ============================================

/**
 * 룬 모달 열기
 */
function openRuneModal(charId) {
    AppState.currentEditingCharId = charId;
    const body = document.getElementById('runeModalBody');
    body.innerHTML = '';
    const data = AppState.charRuneData[charId];

    const batchNameSelect = document.getElementById('m-batch-rune-name');
    if (batchNameSelect) {
        batchNameSelect.innerHTML = '<option value=""></option>' +
            runeNames.map(n => n ? `<option>${n}</option>` : '').join('');
    }

    const batchRuneLvSelect = document.getElementById('m-batch-rune-lv');
    if (batchRuneLvSelect) {
        batchRuneLvSelect.innerHTML = runeLevels.map(lv => `<option>${lv}</option>`).join('');
    }

    const batchSkillSelect = document.getElementById('m-batch-skill-lv');
    if (batchSkillSelect) {
        batchSkillSelect.innerHTML = '<option value=""></option>' +
            runeSkillLevels.filter(lv => lv !== "").map(lv => `<option>${lv}</option>`).join('');
    }

    for (let i = 0; i < 20; i++) {
        const r = data.runes[i] || {name: '', lv: '', skillLv: ''};
        const tr = document.createElement('tr');
        tr.innerHTML = `<td class="col-m-num">${i + 1}</td>
            <td><select class="m-rune-name">${runeNames.map(n => `<option ${r.name === n ? 'selected' : ''}>${n}</option>`).join('')}</select></td>
            <td><select class="m-rune-lv">${runeLevels.map(n => `<option ${r.lv === n ? 'selected' : ''}>${n}</option>`).join('')}</select></td>
            <td><select class="m-rune-skillLv">${runeSkillLevels.map(n => `<option ${r.skillLv === n ? 'selected' : ''}>${n}</option>`).join('')}</select></td>`;
        body.appendChild(tr);
    }
    document.getElementById('m-gakin1').value = data.gakin[0];
    document.getElementById('m-gakin2').value = data.gakin[1];
    document.getElementById('modalOverlay').style.display = 'block';
    document.getElementById('skillRunemodal').style.display = 'block';
}

/**
 * 모든 룬 이름 일괄 설정
 */
function setAllRunesBatch() {
    const selectedName = document.getElementById('m-batch-rune-name').value;
    const body = document.getElementById('runeModalBody');
    const rows = body.querySelectorAll('tr');

    rows.forEach(row => {
        const nameSelect = row.querySelector('.m-rune-name');
        if (nameSelect) {
            nameSelect.value = selectedName;
        }
    });
}

/**
 * 모든 룬 레벨 일괄 설정
 */
function setAllRuneLevels() {
    const selectedRuneLv = document.getElementById('m-batch-rune-lv').value;
    const body = document.getElementById('runeModalBody');
    const rows = body.querySelectorAll('tr');

    rows.forEach(row => {
        const lvSelect = row.querySelector('.m-rune-lv');
        if (lvSelect) lvSelect.value = selectedRuneLv;
    });
}

/**
 * 모든 스킬 레벨 일괄 설정
 */
function setAllSkillLevels() {
    const selectedSkillLv = document.getElementById('m-batch-skill-lv').value;
    const body = document.getElementById('runeModalBody');
    const rows = body.querySelectorAll('tr');

    rows.forEach(row => {
        const skillLvSelect = row.querySelector('.m-rune-skillLv');
        if (skillLvSelect) {
            skillLvSelect.value = selectedSkillLv;
        }
    });
}

/**
 * 룬 모달 닫기
 */
function closeRuneModal() {
    document.getElementById('modalOverlay').style.display = 'none';
    document.getElementById('skillRunemodal').style.display = 'none';
}

/**
 * 룬 데이터 저장
 */
function saveRuneData() {
    const body = document.getElementById('runeModalBody');
    const rows = body.querySelectorAll('tr');
    const newRunes = [];
    rows.forEach(row => {
        newRunes.push({
            name: row.querySelector('.m-rune-name').value,
            lv: row.querySelector('.m-rune-lv').value,
            skillLv: row.querySelector('.m-rune-skillLv').value
        });
    });
    const section = document.getElementById(AppState.currentEditingCharId);
    const charName = section.querySelector('[data-key="info_name"]').value || "이름없음";
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    AppState.changeHistory.unshift({time: timeStr, charName: charName, slot: "스킬룬", old: "기존 설정", new: "새로운 설정으로 변경됨"});
    if (AppState.changeHistory.length > 10) AppState.changeHistory.pop();

    AppState.saveHistory();

    AppState.charRuneData[AppState.currentEditingCharId] = {
        runes: newRunes,
        gakin: [document.getElementById('m-gakin1').value, document.getElementById('m-gakin2').value]
    };
    updateRuneSummary(AppState.currentEditingCharId);
    closeRuneModal();
    autoSave();
}

/**
 * 룬 요약 업데이트
 */
function updateRuneSummary(charId) {
    const summaryEl = document.getElementById(`${charId}_runeSummary`);
    const data = AppState.charRuneData[charId];
    const activeRunes = data.runes.filter(r => r.name !== '');

    let runeStr = "설정된 룬 없음";
    if (activeRunes.length > 0) {
        const runeMap = new Map();
        activeRunes.forEach(r => {
            const effectiveSkillLv = noSkillLvRunes.includes(r.name) ? "" : r.skillLv;
            const key = `${r.name}|${r.lv}|${effectiveSkillLv}`;
            if (runeMap.has(key)) runeMap.get(key).count += 1; else runeMap.set(key, {...r, count: 1});
        });

        const summaryArray = [];
        runeMap.forEach((val) => {
            const skillLv = (noSkillLvRunes.includes(val.name) || !val.skillLv) ? "" : `[${val.skillLv}]`;

            let lvColor = "#ddd";
            if (val.lv === 'IV') lvColor = "#888";

            summaryArray.push(`<span style="color:${lvColor}">${val.name}${val.lv}</span>${skillLv} <span style="color:#888;">${val.count}개</span>`);
        });
        runeStr = summaryArray.join(' <span style="color:#444; margin:0 4px;">|</span> ');
    }

    let gakinContent = "";
    const g2 = data.gakin[1] || "";
    if (g2) {
        gakinContent = `<span class="v-line"></span> <span style="color:var(--gakin-2);">${g2}</span>`;
    }
    summaryEl.innerHTML = runeStr + gakinContent;
}

/**
 * 룬 데이터 초기화
 */
function resetRuneData(charId) {
    if (confirm("초기화하시겠습니까?")) {
        const section = document.getElementById(charId);
        const charName = section.querySelector('[data-key="info_name"]').value || "이름없음";

        const timeStr = getCurrentDateTime();

        AppState.changeHistory.unshift({time: timeStr, charName: charName, slot: "스킬룬", old: "기존 설정", new: "데이터 초기화됨"});
        if (AppState.changeHistory.length > 10) AppState.changeHistory.pop();

        AppState.saveHistory();

        AppState.charRuneData[charId] = {
            runes: Array(20).fill().map(() => ({name: '', lv: '', skillLv: ''})),
            gakin: ['', '']
        };
        updateRuneSummary(charId);
        autoSave();
    }
}