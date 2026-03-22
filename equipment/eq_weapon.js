/* ========================================
[섹션 10] 무기 관리
======================================== */

// ─────────────────────────────────────────
// 10.1 무기 렌더링
// ─────────────────────────────────────────
// ===== 무기 직업 선택 및 버튼 갱신 (종류 열 너비 고정 및 정중앙 정렬) =====
function selectWeaponJob(jobName, keepOpen = false) {
    const weaponPanel = document.getElementById("weaponPanel");
    const container = document.getElementById("weaponJobButtons");

    if (!keepOpen && activeWeaponJob === jobName) {
        activeWeaponJob = null;
        weaponPanel.innerHTML = "";
        selectWeaponJob(null);
        return;
    }

    activeWeaponJob = jobName;

    container.innerHTML = "";
    JOB_LIST.forEach(j => {
        let totalCount = 0;
        const jobData = WEAPON_DATA_MAP[j];
        if (jobData) {
            characters.forEach(char => {
                if (char.weaponCounts) {
                    Object.values(jobData).forEach(weaponList => {
                        weaponList.forEach(weaponName => {
                            WEAPON_PREFIXES.forEach(pref => {
                                const weaponKey = `${pref.tag} ${weaponName}`;
                                totalCount += (char.weaponCounts[weaponKey] || 0);
                            });
                        });
                    });
                }
            });
        }
        const btn = document.createElement("button");
        btn.className = "char-btn" + (j === activeWeaponJob ? " active" : "");
        btn.textContent = `${j} (${totalCount})`;
        btn.onclick = () => selectWeaponJob(j);
        container.appendChild(btn);
    });

    if (!jobName) return;

    const currentData = WEAPON_DATA_MAP[jobName];
    if (!currentData) {
        weaponPanel.innerHTML = `<h3 style="margin-top:20px;">${jobName} 데이터는 준비 중입니다.</h3>`;
        return;
    }

    let html = `<div style="overflow-x: auto; margin-top: 20px;">`;
    html += `<table id="weaponDetailTable" style="table-layout: fixed; border-collapse: collapse; width: max-content;">`;
    html += `<thead><tr style="background: #181c33;">`;

    // 1. 종류 열의 너비를 120px로 고정 (가장 긴 글자인 '자동권총' 등을 고려)
    html += `<th style="width: 120px; padding: 12px; border: 1px solid #2a3158; white-space: nowrap;">종류</th>`;
    html += `<th style="width: 300px; padding: 12px; border: 1px solid #2a3158; white-space: nowrap;">무기 이름</th>`;

    characters.forEach((char, idx) => {
        const colIdx = idx + 2;
        html += `<th onclick="toggleColumnHighlight(${colIdx})" style="width: 100px; padding: 12px; border: 1px solid #2a3158; white-space: nowrap; text-align: center; cursor: pointer; user-select: none;">${char.job}<br>${char.name}</th>`;
    });
    html += `</tr></thead><tbody>`;

    // ---------------------------------------------------------
    // 종류별 루프 (정중앙 정렬 및 고정 너비 적용)
    // ---------------------------------------------------------
    const categories = Object.keys(currentData);

    categories.forEach((category, cIdx) => {
        const weaponList = currentData[category];
        const rowSpanCount = weaponList.length * WEAPON_PREFIXES.length;

        weaponList.forEach((weaponName, wIdx) => {
            WEAPON_PREFIXES.forEach((pref, pIdx) => {
                const rowId = `weapon-row-${categories.indexOf(category)}-${wIdx}-${pIdx}`;
                html += `<tr id="${rowId}" onclick="toggleRowHighlight('${rowId}')">`;

                // 종류 셀: 가로/세로 정중앙 + 너비 고정 적용
                if (wIdx === 0 && pIdx === 0) {
                    html += `<td rowspan="${rowSpanCount}" style="background:#181c33; font-weight:bold; width: 120px; border: 1px solid #2a3158; text-align:center; vertical-align: middle; color: #fff; padding: 10px;">${category}</td>`;
                }

                const styledName = `<span style="color:${pref.color}; font-weight:bold;">${pref.tag}</span>&nbsp;${weaponName}`;
                html += `<td style="text-align:left; padding: 8px 15px; white-space: nowrap; border: 1px solid #2a3158; cursor: pointer;">${styledName}</td>`;

                characters.forEach(char => {
                    const weaponKey = `${pref.tag} ${weaponName}`;
                    const val = (char.weaponCounts && char.weaponCounts[weaponKey]) || 0;
                    html += `<td style="padding: 5px; border: 1px solid #2a3158; text-align:center;">${makeWeaponNumberButton(char.id, weaponKey, val, jobName)}</td>`;
                });
                html += `</tr>`;
            });
        });

        // 카테고리 간 구분 공백 (투명)
        if (cIdx < categories.length - 1) {
            html += `<tr style="height: 20px;">`;
            html += `<td colspan="${characters.length + 2}" style="border: none; border-bottom: 1px solid #2a3158; background: transparent;"></td>`;
            html += `</tr>`;
        }
    });

    html += `</tbody></table></div>`;
    weaponPanel.innerHTML = html;

    if (typeof applyStoredHighlights === "function") {
        applyStoredHighlights();
    }
}

// 무기 전용 숫자 버튼 생성 함수 (기존 makeNumberButton 복사 및 수정)
function makeWeaponNumberButton(charId, key, val, jobName) {
    const extraClass = val > 0 ? " positive" : "";
    return `<button class="num-btn${extraClass}"
      oncontextmenu="decrementWeapon('${charId}','${key}', '${jobName}'); return false;"
      onclick="incrementWeapon('${charId}','${key}', '${jobName}')">${val}</button>`;
}

// 8-2. 무기 증감
// 무기 전용 증가 함수
function incrementWeapon(charId, key, jobName) {
    const char = characters.find(c => c.id === charId);
    if (!char) return;
    if (!char.weaponCounts) char.weaponCounts = {};

    const oldValue = char.weaponCounts[key] || 0;
    const newValue = oldValue + 1;
    char.weaponCounts[key] = newValue;
    char.updateTimes[key] = Date.now();
    if (!char.updateHistory) char.updateHistory = [];
    char.updateHistory.push({ key, timestamp: char.updateTimes[key], oldCount: oldValue, newCount: newValue });

    saveLocalData();

    // 전체 테이블 재렌더링 대신 해당 버튼만 업데이트
    updateWeaponButton(charId, key, char.weaponCounts[key]);
}

// 무기 전용 감소 함수
function decrementWeapon(charId, key, jobName) {
    const char = characters.find(c => c.id === charId);
    if (!char) return;
    if (!char.weaponCounts) char.weaponCounts = {};

    const cur = char.weaponCounts[key] || 0;
    const newValue = Math.max(0, cur - 1);
    char.weaponCounts[key] = newValue;
    char.updateTimes[key] = Date.now();
    if (!char.updateHistory) char.updateHistory = [];
    char.updateHistory.push({ key, timestamp: char.updateTimes[key], oldCount: cur, newCount: newValue });

    saveLocalData();

    // 전체 테이블 재렌더링 대신 해당 버튼만 업데이트
    updateWeaponButton(charId, key, char.weaponCounts[key]);
}

// 무기 버튼만 업데이트하는 헬퍼 함수 (전체 테이블 재렌더링 방지)
function updateWeaponButton(charId, key, newValue) {
    // 해당 버튼을 찾아서 내용과 스타일만 업데이트
    const table = document.getElementById("weaponDetailTable");
    if (!table) return;

    const buttons = table.querySelectorAll('.num-btn');
    buttons.forEach(btn => {
        // onclick 속성에서 charId와 key가 일치하는 버튼 찾기
        const onclickStr = btn.getAttribute('onclick') || '';
        if (onclickStr.includes(`'${charId}'`) && onclickStr.includes(`'${key}'`)) {
            btn.textContent = newValue;
            // positive 클래스 토글
            if (newValue > 0) {
                btn.classList.add('positive');
            } else {
                btn.classList.remove('positive');
            }
        }
    });

    // 상단 직업 버튼의 총 개수도 업데이트
    updateWeaponJobTotals();
}

// 직업별 총 개수만 업데이트하는 함수
function updateWeaponJobTotals() {
    const container = document.getElementById("weaponJobButtons");
    if (!container) return;

    JOB_LIST.forEach(j => {
        let totalCount = 0;
        const jobData = WEAPON_DATA_MAP[j];
        if (jobData) {
            characters.forEach(char => {
                if (char.weaponCounts) {
                    Object.values(jobData).forEach(weaponList => {
                        weaponList.forEach(weaponName => {
                            WEAPON_PREFIXES.forEach(pref => {
                                const weaponKey = `${pref.tag} ${weaponName}`;
                                totalCount += (char.weaponCounts[weaponKey] || 0);
                            });
                        });
                    });
                }
            });
        }

        // 해당 직업 버튼 찾아서 텍스트만 업데이트
        const buttons = container.querySelectorAll('.char-btn');
        buttons.forEach(btn => {
            if (btn.textContent.startsWith(j)) {
                btn.textContent = `${j} (${totalCount})`;
            }
        });
    });
}

// 8-3. 무기 테이블 강조
function toggleRowHighlight(rowId) {
    const table = document.getElementById("weaponDetailTable");
    if (!table) return;

    const rows = table.querySelectorAll('tbody tr');

    // 이미 선택된 행을 다시 누르면 해제
    if (highlightedRowId === rowId) {
        highlightedRowId = null;
    } else {
        highlightedRowId = rowId;
    }

    // 모든 행의 강조 해제
    rows.forEach(row => {
        row.style.backgroundColor = "";
    });

    // 선택된 행만 강조
    if (highlightedRowId) {
        const selectedRow = document.getElementById(highlightedRowId);
        if (selectedRow) {
            selectedRow.style.backgroundColor = "rgba(255, 255, 200, 0.15)";
        }
    }
}

function toggleColumnHighlight(colIdx) {
    // 이미 선택된 열을 다시 누르면 해제, 아니면 해당 열 번호 저장
    if (highlightedColumnIndex === colIdx) {
        highlightedColumnIndex = null;
    } else {
        highlightedColumnIndex = colIdx;
    }
    applyStoredHighlights();
}

function applyStoredHighlights() {
    const table = document.getElementById("weaponDetailTable");
    if (!table) return;

    const rows = table.rows;
    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].cells;

        // 종류/무기이름 셀을 제외한 실제 캐릭터 데이터 셀들의 시작 위치 계산
        const charStartIdx = cells.length - characters.length;

        characters.forEach((_, charIdx) => {
            const currentCellIdx = charStartIdx + charIdx;
            const absoluteColIdx = charIdx + 2; // 캐릭터의 고유 순번(2번부터 시작)

            if (cells[currentCellIdx]) {
                // 현재 순번이 저장된 단일 선택 인덱스와 일치할 때만 강조
                if (highlightedColumnIndex === absoluteColIdx) {
                    cells[currentCellIdx].style.backgroundColor = "rgba(255, 255, 200, 0.15)";
                } else {
                    // 강조되지 않은 셀은 원래 색상으로 복구
                    cells[currentCellIdx].style.backgroundColor = i === 0 ? "#181c33" : "";
                }
            }
        });
    }
}

/* ========================================
[섹션 11] 최근 업데이트 내역
======================================== */
function showRecentUpdates() {
    allUpdatesData = [];

    characters.forEach(char => {
        // updateHistory(누적 이력)가 있으면 우선 사용, 없으면 updateTimes 기반 레거시 처리
        const historyEntries = char.updateHistory && char.updateHistory.length > 0
            ? char.updateHistory
            : Object.entries(char.updateTimes || {}).map(([key, timestamp]) => ({
                key, timestamp, oldCount: null, newCount: char.armorCounts?.[key] ?? char.weaponCounts?.[key] ?? 0
            }));

        historyEntries.forEach(entry => {
            const fullKey = entry.key;
            const timestamp = entry.timestamp;
            if (!timestamp || timestamp <= 0) return;

            const isWeaponKey = Object.values(WEAPON_DATA_MAP).some(jobData =>
                Object.values(jobData).some(list => list.some(name => fullKey.includes(name)))
            );

            if (!isWeaponKey && char.armorCounts && char.armorCounts[fullKey] !== undefined) {
                const parts = fullKey.split(' ');
                const slot = parts.pop();
                const itemName = parts.join(' ');

                let category = "방어구";
                const baseName = itemName.split(':').pop().trim();
                const setType = getSetType(baseName);
                if (setType === "ACCESSORY") category = "악세";
                else if (setType === "SPECIAL") category = "특장";

                // 실제 아이템 이름 조회 (표시용, JSON 데이터는 변경 없음)
                let realItemName = null;
                const isExceedItem = fullKey.startsWith('[');
                try {
                    if (setType === "ARMOR" && ARMOR_DISPLAY_NAMES[baseName] && ARMOR_DISPLAY_NAMES[baseName][slot]) {
                        const raw = ARMOR_DISPLAY_NAMES[baseName][slot];
                        realItemName = Array.isArray(raw) ? (isExceedItem ? raw[0] : raw[1]) : raw;
                    } else if (setType === "ACCESSORY" && ACCESSORY_DISPLAY_NAMES[baseName] && ACCESSORY_DISPLAY_NAMES[baseName][slot]) {
                        const raw = ACCESSORY_DISPLAY_NAMES[baseName][slot];
                        realItemName = Array.isArray(raw) ? (isExceedItem ? raw[0] : raw[1]) : raw;
                    } else if (setType === "SPECIAL" && SPECIAL_DISPLAY_NAMES[baseName] && SPECIAL_DISPLAY_NAMES[baseName][slot]) {
                        const raw = SPECIAL_DISPLAY_NAMES[baseName][slot];
                        realItemName = Array.isArray(raw) ? (isExceedItem ? raw[0] : raw[1]) : raw;
                    }
                } catch(e) { realItemName = null; }

                allUpdatesData.push({
                    name: char.name, job: char.job, itemName: itemName,
                    realItemName: realItemName,
                    category: category, slot: slot,
                    count: entry.newCount,
                    oldCount: entry.oldCount,
                    timestamp: timestamp
                });
            } else if (isWeaponKey || (char.weaponCounts && char.weaponCounts[fullKey] !== undefined)) {
                let weaponSubCategory = "-";
                outerLoop:
                    for (const jobData of Object.values(WEAPON_DATA_MAP)) {
                        for (const [catName, list] of Object.entries(jobData)) {
                            if (list.some(name => fullKey.includes(name))) {
                                weaponSubCategory = catName;
                                break outerLoop;
                            }
                        }
                    }
                allUpdatesData.push({
                    name: char.name, job: char.job, itemName: fullKey,
                    category: "무기", slot: weaponSubCategory,
                    count: entry.newCount,
                    oldCount: entry.oldCount,
                    timestamp: timestamp
                });
            }
        });
    });

    allUpdatesData.sort((a, b) => b.timestamp - a.timestamp);

    const modalContent = document.getElementById("updateModalContent");

    // ── 탭 헤더 렌더링 ──
    let p1History = [];
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.UNIFIED);
        if (raw) {
            const unified = JSON.parse(raw);
            p1History = unified.history || [];
        }
    } catch (e) {}
    if (typeof AppState !== 'undefined' && AppState.changeHistory && AppState.changeHistory.length > 0) {
        p1History = AppState.changeHistory;
    }

    modalContent.innerHTML = `
        <div style="display:flex; gap:8px; margin-bottom:16px; border-bottom:2px solid #2a3158; padding-bottom:8px;">
            <button id="tab-update-p2" onclick="switchUpdateTab('p2')"
                style="padding:6px 18px; border-radius:6px 6px 0 0; border:none; cursor:pointer;
                       background:#4a33cc; color:#fff; font-weight:bold; font-size:14px;">
                🌟 장비 업데이트
            </button>
            <button id="tab-update-p1" onclick="switchUpdateTab('p1')"
                style="padding:6px 18px; border-radius:6px 6px 0 0; border:none; cursor:pointer;
                       background:#2a3158; color:#aaa; font-size:14px;">
                📜 상세입력 변경 기록
            </button>
        </div>
        <div id="update-tab-p2"></div>
        <div id="update-tab-p1" style="display:none;"></div>
    `;

    filteredUpdatesData = allUpdatesData.slice();
    currentUpdatePage = 1;

    // 검색창 렌더링 (p2 탭 안에 삽입)
    const p2El = document.getElementById('update-tab-p2');
    if (p2El) {
        p2El.innerHTML = `
            <div style="display:flex; gap:8px; align-items:center; margin-bottom:12px; flex-wrap:wrap;">
                <input id="update-search-jobname" type="text" placeholder="직업 / 이름"
                    style="flex:1; min-width:120px; padding:8px 12px; background:#181c33; color:#e6e9ff;
                           border:1px solid #2a3158; border-radius:6px; font-size:14px;"
                    onkeydown="if(event.key==='Enter') filterUpdateData()" />
                <input id="update-search-slot" type="text" placeholder="종류 (부위)"
                    style="flex:1; min-width:120px; padding:8px 12px; background:#181c33; color:#e6e9ff;
                           border:1px solid #2a3158; border-radius:6px; font-size:14px;"
                    onkeydown="if(event.key==='Enter') filterUpdateData()" />
                <input id="update-search-item" type="text" placeholder="아이템 이름"
                    style="flex:1; min-width:120px; padding:8px 12px; background:#181c33; color:#e6e9ff;
                           border:1px solid #2a3158; border-radius:6px; font-size:14px;"
                    onkeydown="if(event.key==='Enter') filterUpdateData()" />
                <button onclick="filterUpdateData()"
                    style="padding:8px 14px; background:#4a33cc; color:#fff;
                           border:1px solid #6a53ec; border-radius:6px; cursor:pointer; font-size:13px; font-weight:bold; white-space:nowrap;">
                    🔍 검색
                </button>
                <button onclick="clearUpdateSearch()"
                    style="padding:8px 14px; background:#2a3158; color:#aaa;
                           border:1px solid #3a4168; border-radius:6px; cursor:pointer; font-size:13px; white-space:nowrap;">
                    ↺ 초기화
                </button>
            </div>
            <div id="update-search-result-info" style="font-size:12px; color:#aaa; margin-bottom:8px; min-height:16px;"></div>
        `;
    }

    renderUpdatePage(1);

    const p1El = document.getElementById('update-tab-p1');
    if (p1History.length === 0) {
        p1El.innerHTML = '<p style="color:#aaa;">변경 기록이 없습니다.</p>';
    } else {
        p1El.innerHTML = p1History.map((h, idx) => {
            const details = Array.isArray(h.details) ? h.details : [];
            const hasDetails = details.length > 0;

            // 요약 텍스트 생성
            const nameChanged = h.old !== h.new;
            const isCreature  = h.slot === '크리쳐';
            const detailLabel = isCreature ? `항목 ${details.length}개 변경` : `스탯 ${details.length}개 변경`;
            let summary = '';
            if (isCreature) {
                // 크리쳐: "크리쳐 설정 수정" 고정 표시
                summary = `크리쳐 설정 수정` + (hasDetails ? ` <span style="color:#aaa;font-size:0.9em">(${detailLabel})</span>` : '');
            } else if (nameChanged && hasDetails) {
                summary = `${getSpanWithColor(h.old)} → ${getSpanWithColor(h.new)} <span style="color:#aaa;font-size:0.9em">(${detailLabel})</span>`;
            } else if (nameChanged) {
                summary = `${getSpanWithColor(h.old)} → ${getSpanWithColor(h.new)}`;
            } else if (hasDetails) {
                summary = `${getSpanWithColor(h.new)} <span style="color:#aaa;font-size:0.9em">(${detailLabel})</span>`;
            } else {
                summary = `${getSpanWithColor(h.old)} → ${getSpanWithColor(h.new)}`;
            }

            const detailHtml = hasDetails ? `
                <div id="hist-detail-${idx}" style="display:none; margin-top:6px; padding:6px 10px;
                     background:#1a1a2e; border-radius:6px; font-size:0.88em; color:#ccc; line-height:1.7;">
                    ${details.join('<br>')}
                </div>
                <button onclick="toggleHistDetail(${idx})" id="hist-btn-${idx}"
                    style="margin-top:4px; padding:2px 10px; font-size:0.82em; background:#2a3158;
                           color:#aaa; border:1px solid #3a4168; border-radius:4px; cursor:pointer;">
                    ▶ 상세보기
                </button>` : '';

            return `<div style="border-bottom:1px solid #333; padding:8px 0;">
                <span style="color:#ffd700;">[${h.time}]</span>
                <b style="color:#fff;"> ${h.charName}</b>
                <span style="color:#aaa;"> - ${h.slot}:</span><br>
                ${summary}
                ${detailHtml}
            </div>`;
        }).join('');
    }

    document.getElementById("updateModal").style.display = 'flex';
}

function toggleHistDetail(idx) {
    const detail = document.getElementById('hist-detail-' + idx);
    const btn    = document.getElementById('hist-btn-' + idx);
    if (!detail) return;
    const isOpen = detail.style.display !== 'none';
    detail.style.display = isOpen ? 'none' : 'block';
    if (btn) btn.textContent = isOpen ? '▶ 상세보기' : '▼ 접기';
}

function switchUpdateTab(tab) {
    const p2El = document.getElementById('update-tab-p2');
    const p1El = document.getElementById('update-tab-p1');
    const p2Btn = document.getElementById('tab-update-p2');
    const p1Btn = document.getElementById('tab-update-p1');
    const paginationEl = document.getElementById('updatePagination');

    if (tab === 'p2') {
        p2El.style.display = '';
        p1El.style.display = 'none';
        p2Btn.style.background = '#4a33cc';
        p2Btn.style.color = '#fff';
        p2Btn.style.fontWeight = 'bold';
        p1Btn.style.background = '#2a3158';
        p1Btn.style.color = '#aaa';
        p1Btn.style.fontWeight = '';
        if (paginationEl) paginationEl.style.display = '';
    } else {
        p2El.style.display = 'none';
        p1El.style.display = '';
        p2Btn.style.background = '#2a3158';
        p2Btn.style.color = '#aaa';
        p2Btn.style.fontWeight = '';
        p1Btn.style.background = '#4a33cc';
        p1Btn.style.color = '#fff';
        p1Btn.style.fontWeight = 'bold';
        if (paginationEl) paginationEl.style.display = 'none';
    }
}

function renderUpdatePage(pageNum) {
    const p2Container = document.getElementById("update-tab-p2");
    const modalContent = p2Container || document.getElementById("updateModalContent");
    const paginationContainer = document.getElementById("updatePagination");

    const dataSource = (typeof filteredUpdatesData !== 'undefined' && filteredUpdatesData !== null)
        ? filteredUpdatesData : allUpdatesData;

    const startIdx = (pageNum - 1) * ITEMS_PER_PAGE;
    const endIdx = startIdx + ITEMS_PER_PAGE;
    const pageItems = dataSource.slice(startIdx, endIdx);

    const table = document.createElement("table");
    table.style.width = '100%';
    table.innerHTML = `<thead><tr>
    <th style="width:20%;">직업 / 이름</th>
    <th style="width:15%;">종류 (부위)</th>
    <th style="width:35%;">아이템</th>
    <th style="width:10%;">변경</th>
    <th style="width:20%;">업데이트 시간</th>
</tr></thead><tbody></tbody>`;

    const tbody = table.querySelector("tbody");

    pageItems.forEach(item => {
        const date = new Date(item.timestamp);
        const formatTime = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

        let styledItemName = item.itemName;
        const tagMatch = styledItemName.match(/^(\[.*?\])\s*(.*)/);

        if (tagMatch) {
            const tag = tagMatch[1];
            const restName = tagMatch[2];
            let tagColor = '#ffd700';
            if (tag.includes('선봉') || tag.includes('분쇄')) tagColor = '#ff4d4f';
            else if (tag.includes('의지') || tag.includes('광채')) tagColor = '#3399cc';
            else if (tag.includes('이상')) tagColor = '#25c2a0';
            else if (tag.includes('강타')) tagColor = '#ffd700';

            let baseNamePart = restName;
            if (restName.includes(':')) {
                const pMatch = restName.match(/(.+?):\s*(.+)/);
                if (pMatch) baseNamePart = `<span style="color:#e6b800; font-weight:bold;">${pMatch[1]}</span>: ${pMatch[2]}`;
            }
            styledItemName = `<span style="color:${tagColor}; font-weight:bold;">${tag}</span> ${baseNamePart}`;
        } else if (styledItemName.includes(':')) {
            const pMatch = styledItemName.match(/(.+?):\s*(.+)/);
            if (pMatch) styledItemName = `<span style="color:#e6b800; font-weight:bold;">${pMatch[1]}</span>: ${pMatch[2]}`;
        }

        // 실제 아이템 이름이 있으면 "접두어/익시드: 아이템이름 (세트이름)" 형식으로 표시
        let displayItemCell;
        if (item.realItemName) {
            // 앞에 붙일 태그/접두어 파트 추출 (styledItemName에서 세트명 제거)
            const rawName = item.itemName; // 예: "[의지] 조화: 신비로운 빛의 소용돌이"
            let prefixPart = '';

            const tagMatch2 = rawName.match(/^(\[.*?\])\s*(.*)/);
            if (tagMatch2) {
                const tag = tagMatch2[1];
                const rest = tagMatch2[2];
                const tagColor = tag.includes('선봉') || tag.includes('분쇄') ? '#ff4d4f'
                    : tag.includes('의지') || tag.includes('광채') ? '#3399cc'
                        : tag.includes('이상') ? '#25c2a0' : '#ffd700';
                // rest = "조화: 신비로운 빛의 소용돌이" → 접두어만 추출
                const pMatch2 = rest.match(/^(.+?):\s*/);
                const prefLabel = pMatch2 ? `<span style="color:#e6b800; font-weight:bold;">${pMatch2[1]}</span>: ` : '';
                prefixPart = `<span style="color:${tagColor}; font-weight:bold;">${tag}</span> ${prefLabel}`;
            } else if (rawName.includes(':')) {
                const pMatch2 = rawName.match(/^(.+?):\s*/);
                if (pMatch2) prefixPart = `<span style="color:#e6b800; font-weight:bold;">${pMatch2[1]}</span>: `;
            }

            // 세트 이름만 추출 (접두어/익시드 제거)
            const baseSetName = rawName.split(':').pop().trim();

            displayItemCell = `${prefixPart}${item.realItemName} <span style="color:#888; font-size:0.85em;">(${baseSetName})</span>`;
        } else {
            displayItemCell = styledItemName;
        }

        const tr = document.createElement("tr");
        const changeDisplay = item.oldCount !== null
            ? `<span style="color:#888;">${item.oldCount}</span> → <span style="font-weight:bold; color:${item.count > item.oldCount ? '#ffcc00' : item.count < item.oldCount ? '#ff6b6b' : '#888'};">${item.count}</span>`
            : `<span style="font-weight:bold; color:${item.count > 0 ? '#ffcc00' : '#888'};">${item.count}</span>`;
        tr.innerHTML = `
        <td style="white-space:nowrap;">${item.job} / ${item.name}</td>
        <td>[${item.category}] ${item.slot}</td>
        <td style="text-align:left;">${displayItemCell}</td>
        <td style="text-align:center;">${changeDisplay}</td>
        <td style="font-size:0.9em;">${formatTime}</td>
    `;
        tbody.appendChild(tr);
    });

    // p2Container(탭)에 렌더링 시 검색창/결과정보는 유지하고 기존 테이블만 교체
    if (p2Container) {
        const oldTable = p2Container.querySelector('table');
        if (oldTable) oldTable.remove();
        p2Container.appendChild(table);
    } else {
        modalContent.innerHTML = "";
        modalContent.appendChild(table);
    }

    renderPaginationButtons(pageNum);
}

function renderPaginationButtons(currentPage) {
    const paginationContainer = document.getElementById("updatePagination");
    paginationContainer.innerHTML = "";

    const dataSource = (typeof filteredUpdatesData !== 'undefined' && filteredUpdatesData !== null)
        ? filteredUpdatesData : allUpdatesData;
    const totalPages = Math.ceil(dataSource.length / ITEMS_PER_PAGE);

    // 데이터가 없으면 버튼 생성 안 함
    if (totalPages === 0) return;

    // 처음으로 버튼
    const firstBtn = document.createElement("button");
    firstBtn.textContent = "⏮ 처음으로";
    firstBtn.disabled = currentPage === 1;
    firstBtn.onclick = () => {
        currentUpdatePage = 1;
        renderUpdatePage(1);
    };
    paginationContainer.appendChild(firstBtn);

    // 이전 페이지 버튼
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "◀ 이전";
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentUpdatePage = currentPage - 1;
            renderUpdatePage(currentUpdatePage);
        }
    };
    paginationContainer.appendChild(prevBtn);

    // 페이지 범위 계산 (현재 페이지 기준으로 5개씩)
    const pageGroupStart = Math.floor((currentPage - 1) / 5) * 5 + 1;
    const pageGroupEnd = Math.min(pageGroupStart + 4, totalPages);

    // 페이지 번호 버튼 (5개씩 표시)
    for (let i = pageGroupStart; i <= pageGroupEnd; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.textContent = i;
        pageBtn.className = currentPage === i ? "active" : "";
        pageBtn.onclick = () => {
            currentUpdatePage = i;
            renderUpdatePage(i);
        };
        paginationContainer.appendChild(pageBtn);
    }

    // 다음 페이지 버튼
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "다음 ▶";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentUpdatePage = currentPage + 1;
            renderUpdatePage(currentUpdatePage);
        }
    };
    paginationContainer.appendChild(nextBtn);

    // 끝으로 버튼
    const lastBtn = document.createElement("button");
    lastBtn.textContent = "끝으로 ⏭";
    lastBtn.disabled = currentPage === totalPages;
    lastBtn.onclick = () => {
        currentUpdatePage = totalPages;
        renderUpdatePage(totalPages);
    };
    paginationContainer.appendChild(lastBtn);

    // 페이지 검색 입력창 추가
    const searchDiv = document.createElement("div");
    searchDiv.style.display = "flex";
    searchDiv.style.gap = "8px";
    searchDiv.style.alignItems = "center";
    searchDiv.style.marginLeft = "15px";

    const searchLabel = document.createElement("span");
    searchLabel.textContent = "페이지 검색:";
    searchLabel.style.color = "#e6e9ff";
    searchLabel.style.fontWeight = "bold";
    searchDiv.appendChild(searchLabel);

    const searchInput = document.createElement("input");
    searchInput.type = "number";
    searchInput.min = "1";
    searchInput.max = totalPages;
    searchInput.placeholder = `1-${totalPages}`;
    searchInput.style.cssText = "width:80px; padding:8px; border:1px solid #2a3158; background:#181c33; color:#e6e9ff; border-radius:6px; text-align:center;";

    const searchBtn = document.createElement("button");
    searchBtn.textContent = "🔍 이동";
    searchBtn.style.cssText = "padding:8px 15px; border:1px solid #2a3158; background:#25c2a0; color:#fff; border-radius:6px; cursor:pointer; font-weight:bold;";
    searchBtn.onclick = () => {
        const pageNum = parseInt(searchInput.value);
        if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
            alert(`1 ~ ${totalPages} 사이의 페이지를 입력하세요.`);
            return;
        }
        currentUpdatePage = pageNum;
        renderUpdatePage(pageNum);
    };

    // Enter 키로도 검색 가능
    searchInput.onkeypress = (e) => {
        if (e.key === "Enter") searchBtn.click();
    };

    searchDiv.appendChild(searchInput);
    searchDiv.appendChild(searchBtn);
    paginationContainer.appendChild(searchDiv);
}

// 검색 필터링
function filterUpdateData() {
    const jobnameInput = document.getElementById('update-search-jobname');
    const slotInput    = document.getElementById('update-search-slot');
    const itemInput    = document.getElementById('update-search-item');
    const infoEl       = document.getElementById('update-search-result-info');

    const termJobName = jobnameInput ? jobnameInput.value.trim().toLowerCase() : '';
    const termSlot    = slotInput    ? slotInput.value.trim().toLowerCase()    : '';
    const termItem    = itemInput    ? itemInput.value.trim().toLowerCase()    : '';

    const hasFilter = termJobName || termSlot || termItem;

    if (!hasFilter) {
        filteredUpdatesData = allUpdatesData.slice();
    } else {
        filteredUpdatesData = allUpdatesData.filter(item => {
            const jobName  = (item.job + ' ' + item.name).toLowerCase();
            const slotFull = (item.category + ' ' + item.slot).toLowerCase();
            const itemName = (item.itemName + ' ' + (item.realItemName || '')).toLowerCase();

            const matchJobName = !termJobName || jobName.includes(termJobName);
            const matchSlot    = !termSlot    || slotFull.includes(termSlot);
            const matchItem    = !termItem    || itemName.includes(termItem);

            return matchJobName && matchSlot && matchItem;
        });
    }

    if (infoEl) {
        infoEl.textContent = hasFilter
            ? `검색 결과: ${filteredUpdatesData.length}건 / 전체 ${allUpdatesData.length}건`
            : '';
    }

    currentUpdatePage = 1;
    renderUpdatePage(1);
}

// 검색 초기화
function clearUpdateSearch() {
    const jobnameInput = document.getElementById('update-search-jobname');
    const slotInput    = document.getElementById('update-search-slot');
    const itemInput    = document.getElementById('update-search-item');
    if (jobnameInput) jobnameInput.value = '';
    if (slotInput)    slotInput.value    = '';
    if (itemInput)    itemInput.value    = '';
    filterUpdateData();
}

// 새로 추가: 업데이트 모달 닫기 함수
function closeUpdateModal() {
    document.getElementById("updateModal").style.display = 'none';
}


/* ========================================
[섹션 12] 제작 시스템 → eq_craft.js 로 이동
======================================== */
// renderCraftTable, updateCraftTotals, setCraftLock,
// applyCraftModulo, undoCraftModulo → eq_craft.js 참조

console.log("✅ eq_weapon.js 로드 완료");