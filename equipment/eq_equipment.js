/* ========================================
   eq_equipment.js - 장비 관리 (모달, 세트버튼, openSet, 증감, UI업데이트)
   ※ 렌더링(탭) → eq_render.js
   ※ 통계/검색    → eq_statistics.js
======================================== */

/* ========================================
모달 관리
======================================== */
function openActionModal(charId, name, job) {
    currentActionCharId = charId;
    const modal = document.getElementById("actionModal");
    if (!modal) return;

    const content = modal.querySelector(".modal-content");
    if (!content) return;

    content.innerHTML = `
      <h2 style="margin-bottom:25px; color:#fff;">캐릭터 설정 수정</h2>

      <div style="margin-bottom:15px; display:flex; align-items:center;">
          <label style="width:60px; font-weight:bold; color:#ccc;">이름 :</label>
          <input type="text" id="edit-charName" value="${name}"
                 style="flex:1; padding:8px; background:#181c33; color:#fff; border:1px solid #2a3158; border-radius:4px;">
      </div>

      <div style="margin-bottom:25px; display:flex; align-items:center;">
          <label style="width:60px; font-weight:bold; color:#ccc;">직업 :</label>
          <select id="edit-charJob"
                  style="flex:1; padding:8px; background:#181c33; color:#fff; border:1px solid #2a3158; border-radius:4px; cursor:pointer;">
          </select>
      </div>

      <div class="modal-options" style="display:flex; flex-direction:column; gap:10px;">
          <button type="button" class="modal-btn" style="background:#25c2a0; font-weight:bold; color:#fff;"
                  onclick="updateCharacterInfo('${charId}')">정보 수정 완료</button>
          <div style="display:flex; gap:8px;">
              <button type="button" class="modal-btn" style="flex:1; background:#f39c12; font-size:0.9em; color:#fff;"
                      onclick="resetCharacterStatsConfirmed()">수치 초기화</button>
              <button type="button" class="modal-btn" style="flex:1; background:#e74c3c; font-size:0.9em; color:#fff;"
                      onclick="deleteCharacterConfirmed()">캐릭터 삭제</button>
          </div>
          <button type="button" class="modal-btn" style="background:#444; color:#fff;" onclick="closeActionModal()">취소</button>
      </div>
  `;
    modal.style.display = "flex";

    // 직업 select 옵션 초기화 (ui-character.js의 initJobSelect 공용 함수 사용)
    const jobSel = document.getElementById('edit-charJob');
    if (typeof initJobSelect === 'function') initJobSelect(jobSel, job);
}

// 모달 닫기 함수가 없다면 아래를 추가하세요.
function closeActionModal() {
    const modal = document.getElementById("actionModal");
    if (modal) modal.style.display = "none";
}

// 확인 모달 열기 함수 (에러 방지용 보완)
function openConfirmModal(title, message, onConfirm) {
    const modal = document.getElementById("confirmModal");
    const titleEl = document.getElementById("confirmTitle");
    const messageEl = document.getElementById("confirmMessage");
    const confirmBtn = document.getElementById("confirmYes");

    if (!modal || !titleEl || !messageEl || !confirmBtn) return;

    titleEl.textContent = title;
    messageEl.textContent = message;

    confirmBtn.onclick = function () {
        if (typeof onConfirm === "function") {
            onConfirm(); // 여기서 전달받은 함수를 실행합니다.
        }
        closeConfirmModal();
    };

    modal.style.display = 'flex';
}

// 모달 닫기 (기존 코드와 동일)
function closeConfirmModal() {
    const modal = document.getElementById("confirmModal");
    if (modal) modal.style.display = 'none';
}

/* ========================================
장비 관리 (세트 시스템)
======================================== */

// ─────────────────────────────────────────
// 9.1 세트 버튼 관리
// ─────────────────────────────────────────
function showSetButtons(char, isRefresh = false) {
    const setList = document.getElementById("setList");
    const panel = document.getElementById("panel");

    if (!isRefresh && activeCharacterId === char.id) {
        activeCharacterId = null;
        setList.innerHTML = "";
        panel.innerHTML = "";
        renderCharacterList(); // 선택 표시(노란불) 해제
        return;
    }

    // 캐릭터 선택 상태 업데이트 및 노란색 불 켜기
    activeCharacterId = char.id;
    renderCharacterList();

    setList.innerHTML = "";

    // ----------------------------------------------------
    // ----------------------------------------------------
    let totalArmor = 0;
    let totalAccessory = 0;
    let totalSpecial = 0;

    Object.entries(char.armorCounts).forEach(([fullKey, count]) => {
        if (count <= 0) return;

        const parts = fullKey.split(' ');
        const slot = parts.pop();
        const name = parts.join(' ');

        const groupKey = getGroupKey(name);
        const setType = getSetType(groupKey);

        if (setType === "ARMOR") totalArmor += count;
        else if (setType === "ACCESSORY") totalAccessory += count;
        else if (setType === "SPECIAL") totalSpecial += count;
    });

    // ----------------------------------------------------
    // ----------------------------------------------------

    // 방어구
    const armorTitle = document.createElement("h2");
    armorTitle.textContent = `[방어구 (${totalArmor}개)]`;
    setList.appendChild(armorTitle);
    Object.keys(ARMOR_SETS).forEach(setName => {
        setList.appendChild(makeSetButton(setName, char));
    });

    // 악세
    const accTitle = document.createElement("h2");
    accTitle.textContent = `[악세 (${totalAccessory}개)]`;
    setList.appendChild(accTitle);
    Object.keys(ACCESSORY_SETS).forEach(setName => {
        setList.appendChild(makeSetButton(setName, char));
    });

    // 특장
    const spTitle = document.createElement("h2");
    spTitle.textContent = `[특장 (${totalSpecial}개)]`;
    setList.appendChild(spTitle);
    Object.keys(SPECIAL_SETS).forEach(setName => {
        setList.appendChild(makeSetButton(setName, char));
    });

    document.getElementById("panel").innerHTML = "";
}

function makeSetButton(setName, char) {
    let count3 = 0, count5 = 0;
    let totalParts = 0; // x 값 (총 개수) 초기화

    const slots = ALL_SETS[setName] || [];
    const prefixes = ALL_PREFIX[setName] || [];
    const setType = getSetType(setName);
    const exceedSlots = EXCEED_SLOTS[setType] || [];

    const distinctParts = getCachedDistinctParts(char, setName);

    const allGroupKeys = [];

    if (!LEGACY_PREFIX_SETS.includes(setName)) {
        allGroupKeys.push(setName);
    }

    prefixes.forEach(pref => {
        const prefKey = makePrefixKey(pref, setName);
        allGroupKeys.push(prefKey);
        EXCEED_TAGS.forEach(tag => {
            allGroupKeys.push(`[${tag}] ${prefKey}`);
        });
    });

    allGroupKeys.forEach(groupKey => {
        const isExceedKey = groupKey.startsWith('[');
        slots.forEach(slot => {
            let key = `${groupKey} ${slot}`;
            if (isExceedKey && !exceedSlots.includes(slot)) return;
            totalParts += char.armorCounts[key] || 0;
        });
    });

    const fullSize = slots.length;

    if (fullSize === 5) { // 방어구
        if (distinctParts === fullSize) count5 = 1; // 5세트 달성
        else if (distinctParts >= 3) count3 = 1; // 3세트 달성 (3 또는 4)
    } else { // 악세/특장 (3부위)
        if (distinctParts === 3) count3 = 1; // 3세트 달성
    }

    const btn = document.createElement("button");
    btn.className = "set-btn";

    // 화면 표시를 위한 0 또는 1 값 설정
    const final_count3 = count3 > 0 ? 1 : 0;
    const final_count5 = count5 > 0 ? 1 : 0;

    // 배경색 적용
    if (final_count5 > 0) btn.classList.add("set5");
    else if (final_count3 > 0) btn.classList.add("set3");

    // [선택 상태 유지 로직 추가]: 현재 선택된 세트와 이름이 같으면 selected 클래스 유지
    if (currentSetName === setName && currentChar && currentChar.id === char.id) {
        btn.classList.add("selected");
    }

    // 수정된 부분: "세트명 (장비수)" 형태로 내용 구성
    let buttonContent = `${setName} (${totalParts})`;

    // 추가: 악세/특장 추가 정보 표시
    if (setType === "ACCESSORY" && ACCESSORY_EXTRA_INFO[setName]) {
        buttonContent += `<br>(${ACCESSORY_EXTRA_INFO[setName]})</span>`;
    } else if (setType === "SPECIAL" && SPECIAL_EXTRA_INFO[setName]) {
        buttonContent += `<br>(${SPECIAL_EXTRA_INFO[setName]})</span>`;
    }

    btn.innerHTML = buttonContent; // innerHTML로 내용 설정

    btn.onclick = (event) => {
        // [선택 로직 추가]: 모든 세트 버튼에서 'selected' 클래스 제거
        document.querySelectorAll(".set-btn").forEach(b => b.classList.remove("selected"));
        // [선택 로직 추가]: 현재 클릭된 버튼에 'selected' 클래스 추가
        event.currentTarget.classList.add("selected");

        openSet(setName, char);
    };

    return btn;
}

// ─────────────────────────────────────────
// 9.0 마법봉인 헤더 표시 헬퍼
// ─────────────────────────────────────────
function getSealHeaderHtml(char, slot) {
    const slotData = char.inputs?.[slot] || {};
    const seal1 = slotData['seal1']?.val || '';
    const seal1val = slotData['seal1_val']?.val || '';
    const seal2 = slotData['seal2']?.val || '';
    const seal2val = slotData['seal2_val']?.val || '';

    const part1 = seal1 ? `${seal1} ${seal1val}`.trim() : '-';
    const part2 = seal2 ? `${seal2} ${seal2val}`.trim() : '-';

    const text = `${part1} / ${part2}`;

    return `<div style="color:#aad4ff; font-size:0.78em; margin-top:3px; white-space:nowrap;">${text}</div>`;
}

function openSet(setName, char) {
    if (currentSetName !== setName || currentChar?.id !== char.id) {
        currentFilter = 'ALL';
    }

    currentSetName = setName;
    currentChar = char;

    // 세트 열 때 해당 캐릭터의 캐시 미리 계산
    getCachedDistinctParts(char, setName);

    const panel = document.getElementById("panel");
    panel.innerHTML = `<h2>[${setName} 세트]</h2>`;

    const slots = ALL_SETS[setName] || [];
    const setType = getSetType(setName);
    const table = document.createElement("table");

    if (setType === "SPECIAL") {
        // ====================================================
        // 특장 전용: 표 2개로 나누어 렌더링
        // 표1(위): 귀걸이(두 번째 이름)+나머지슬롯 - 일반/프리픽스 행
        // 표2(아래): 귀걸이(첫 번째 이름)만 - 익시드+프리픽스 행
        // ====================================================
        const displayNames = SPECIAL_DISPLAY_NAMES[setName] || null;
        const prefixes = ALL_PREFIX[setName] || [];
        const exceedSlot = EXCEED_SLOTS["SPECIAL"][0];
        const earringRaw = displayNames ? (displayNames[exceedSlot] || exceedSlot) : exceedSlot;
        const earringName1 = Array.isArray(earringRaw) ? earringRaw[0] : earringRaw;
        const earringName2 = Array.isArray(earringRaw) ? earringRaw[1] : earringRaw;

        // ── 표 1 (위): 일반/프리픽스 (귀걸이 두 번째 이름 + 나머지 슬롯) ──
        const table1 = document.createElement("table");
        const otherSlots = slots.filter(s => s !== exceedSlot);
        const allSlots1 = [exceedSlot, ...otherSlots];

        const headerSlots1 = allSlots1.map(s => {
            let displayName;
            if (s === exceedSlot) {
                displayName = earringName2;
            } else {
                displayName = displayNames ? (displayNames[s] || s) : s;
            }
            const sealHtml = getSealHeaderHtml(char, s);
            return `<th style="white-space:nowrap; font-size:0.9em; padding:8px; text-align:center;"><div style="color:#888; font-size:0.85em; margin-bottom:3px;">${s}</div><div>${displayName}</div>${sealHtml}</th>`;
        }).join("");
        table1.innerHTML = `<thead><tr>
  <th style="white-space:nowrap; padding:8px;">세트 이름</th>
  ${headerSlots1}
</tr></thead><tbody></tbody>`;
        const tbody1 = table1.querySelector("tbody");

        prefixes.forEach(pref => {
            const styledPref = `<span style="color:#e6b800; font-weight:bold;">${pref}</span>`;
            tbody1.appendChild(createEquipmentRow({
                char: char,
                setName: setName,
                nameKey: `${pref}: ${setName}`,
                labelText: styledPref,
                slots: allSlots1,
                fullSize: 3
            }));
        });

        tbody1.appendChild(createEquipmentRow({
            char: char,
            setName: setName,
            nameKey: setName,
            labelText: "일반",
            slots: allSlots1,
            fullSize: 3
        }));

        // ── 표 2 (아래): exceed 전용 (귀걸이 첫 번째 이름만) ──
        const table2 = document.createElement("table");
        table2.innerHTML = `<thead><tr>
  <th style="white-space:nowrap; padding:8px;">세트 이름</th>
  <th style="white-space:nowrap; font-size:0.9em; padding:8px;">${earringName1}</th>
</tr></thead><tbody></tbody>`;
        const tbody2 = table2.querySelector("tbody");

        prefixes.forEach(pref => {
            EXCEED_TAGS.forEach(ex => {
                const name = `[${ex}] ${pref}: ${setName}`;
                const key = `${name} ${exceedSlot}`;
                const val = char.armorCounts[key] || 0;
                const color = EXCEED_COLOR_MAP[ex] || "#fff";
                const labelHtml = `<span style="color:${color}; font-weight:bold;">[${ex}]</span> <span style="color:#e6b800; font-weight:bold;">${pref}</span>`;                const tr = document.createElement("tr");
                tr.innerHTML = `<td style="text-align:center;">${labelHtml}</td><td>${makeNumberButton(char.id, key, val)}</td>`;
                tbody2.appendChild(tr);
            });
        });

        panel.appendChild(table1);
        panel.appendChild(document.createElement("br"));
        panel.appendChild(table2);

        // 표1(위) 너비: 일반/접두어 행 이름 기준
        const normalNames = ["일반", ...prefixes];
        const w1 = calcNameWidth(normalNames);
        table1.querySelectorAll("th:first-child, td:first-child").forEach(cell => {
            cell.style.width = w1 + "px";
        });

        // 표2(아래) 너비: 익시드 행 이름 기준
        const exceedNames = prefixes.flatMap(p => EXCEED_TAGS.map(ex => `[${ex}] ${p}`));
        const w2 = calcNameWidth(exceedNames.length ? exceedNames : ["일반"]);
        table2.querySelectorAll("th:first-child, td:first-child").forEach(cell => {
            cell.style.width = w2 + "px";
        });

    } else if (setType === "ACCESSORY" && ACCESSORY_DISPLAY_NAMES[setName]) {
        // ====================================================
        // 악세 전용: 표 2개로 나누어 렌더링 (특장과 동일한 방식)
        // 표1(위): 일반/프리픽스 - 팔찌 두번째 이름 + 목걸이 + 반지
        // 표2(아래): 익시드 전용 - 팔찌 첫번째 이름만
        // ====================================================
        const displayNames = ACCESSORY_DISPLAY_NAMES[setName];
        const prefixes = ALL_PREFIX[setName] || [];
        const exceedSlot = EXCEED_SLOTS["ACCESSORY"][0];
        const braceletRaw = displayNames[exceedSlot] || exceedSlot;
        const braceletName1 = Array.isArray(braceletRaw) ? braceletRaw[0] : braceletRaw;
        const braceletName2 = Array.isArray(braceletRaw) ? braceletRaw[1] : braceletRaw;

        // ── 표1(위): 일반/프리픽스 (팔찌 두번째 + 목걸이 + 반지) ──
        const accTable1 = document.createElement("table");
        const otherSlots = slots.filter(s => s !== exceedSlot);
        const allSlots1 = [exceedSlot, ...otherSlots];

        const headerSlots1 = allSlots1.map(s => {
            let displayName;
            if (s === exceedSlot) {
                displayName = braceletName2;
            } else {
                displayName = displayNames[s] || s;
            }
            const sealHtml = getSealHeaderHtml(char, s);
            return `<th style="white-space:nowrap; font-size:0.9em; padding:8px; text-align:center;"><div style="color:#888; font-size:0.85em; margin-bottom:3px;">${s}</div><div>${displayName}</div>${sealHtml}</th>`;
        }).join("");
        accTable1.innerHTML = `<thead><tr>
  <th style="white-space:nowrap; padding:8px;">세트 이름</th>
  ${headerSlots1}
</tr></thead><tbody></tbody>`;
        const tbody1 = accTable1.querySelector("tbody");

        // ★ 레거시 악세: 일반 행 없음, 접두어("레거시") 행만
        prefixes.forEach(pref => {
            const styledPref = `<span style="color:#e6b800; font-weight:bold;">${pref}</span>`;
            const prefKey = makePrefixKey(pref, setName);
            tbody1.appendChild(createEquipmentRow({
                char: char,
                setName: setName,
                nameKey: prefKey,
                labelText: styledPref,
                slots: allSlots1,
                fullSize: 3
            }));
        });
        if (!LEGACY_PREFIX_SETS.includes(setName)) {
            tbody1.appendChild(createEquipmentRow({
                char: char,
                setName: setName,
                nameKey: setName,
                labelText: "일반",
                slots: allSlots1,
                fullSize: 3
            }));
        }

        const accTable2 = document.createElement("table");
        accTable2.innerHTML = `<thead><tr>
  <th style="white-space:nowrap; padding:8px;">세트 이름</th>
  <th style="white-space:nowrap; font-size:0.9em; padding:8px;">${braceletName1}</th>
</tr></thead><tbody></tbody>`;
        const tbody2 = accTable2.querySelector("tbody");

        if (prefixes.length > 0) {
            prefixes.forEach(pref => {
                EXCEED_TAGS.forEach(ex => {
                    const prefKey = makePrefixKey(pref, setName);
                    const name = `[${ex}] ${prefKey}`;
                    const key = `${name} ${exceedSlot}`;
                    const val = char.armorCounts[key] || 0;
                    const color = EXCEED_COLOR_MAP[ex] || "#fff";
                    const labelHtml = `<span style="color:${color}; font-weight:bold;">[${ex}]</span> <span style="color:#e6b800; font-weight:bold;">${pref}</span>`;
                    const tr = document.createElement("tr");
                    tr.innerHTML = `<td style="text-align:center;">${labelHtml}</td><td>${makeNumberButton(char.id, key, val)}</td>`;
                    tbody2.appendChild(tr);
                });
            });
        }

        panel.appendChild(accTable1);
        panel.appendChild(document.createElement("br"));
        panel.appendChild(accTable2);

        const accNormalNames = LEGACY_PREFIX_SETS.includes(setName) ? [...prefixes] : ["일반", ...prefixes];
        const accW1 = calcNameWidth(accNormalNames.length ? accNormalNames : ["일반"]);
        accTable1.querySelectorAll("th:first-child, td:first-child").forEach(cell => {
            cell.style.width = accW1 + "px";
        });

        const accExceedNames = prefixes.flatMap(p => EXCEED_TAGS.map(ex => `[${ex}] ${p}`));
        const accW2 = calcNameWidth(accExceedNames.length ? accExceedNames : ["일반"]);
        accTable2.querySelectorAll("th:first-child, td:first-child").forEach(cell => {
            cell.style.width = accW2 + "px";
        });

    } else if (setType === "ARMOR" && ARMOR_DISPLAY_NAMES[setName]) {
        // ====================================================
        // 방어구 전용: 표 2개로 나누어 렌더링
        // 표1(위): 일반/프리픽스 - 상의 두번째 이름 + 나머지 슬롯
        // 표2(아래): 익시드 전용 - 상의 첫번째 이름만
        // ====================================================
        const displayNames = ARMOR_DISPLAY_NAMES[setName];
        const prefixes = ALL_PREFIX[setName] || [];
        const exceedSlot = EXCEED_SLOTS["ARMOR"][0];
        const topRaw = displayNames[exceedSlot] || exceedSlot;
        const topName1 = Array.isArray(topRaw) ? topRaw[0] : topRaw;
        const topName2 = Array.isArray(topRaw) ? topRaw[1] : topRaw;

        // ── 표1(위): 익시드 전용 (상의 첫번째 이름만) ──
        const armTable1 = document.createElement("table");
        armTable1.innerHTML = `<thead><tr>
  <th style="white-space:nowrap; padding:8px;">세트 이름</th>
  <th style="white-space:nowrap; font-size:0.9em; padding:8px;">${topName1}</th>
</tr></thead><tbody></tbody>`;
        const tbody1 = armTable1.querySelector("tbody");

        if (prefixes.length > 0) {
            prefixes.forEach(pref => {
                EXCEED_TAGS.forEach(ex => {
                    const prefKey = makePrefixKey(pref, setName);
                    const name = `[${ex}] ${prefKey}`;
                    const key = `${name} ${exceedSlot}`;
                    const val = char.armorCounts[key] || 0;
                    const color = EXCEED_COLOR_MAP[ex] || "#fff";
                    const labelHtml = `<span style="color:${color}; font-weight:bold;">[${ex}]</span> <span style="color:#e6b800; font-weight:bold;">${pref}</span>`;
                    const tr = document.createElement("tr");
                    tr.innerHTML = `<td style="text-align:center;">${labelHtml}</td><td>${makeNumberButton(char.id, key, val)}</td>`;
                    tbody1.appendChild(tr);
                });
            });
        }

        // ── 표2(아래): 일반/접두어 ──
        const armTable2 = document.createElement("table");
        const otherSlots = slots.filter(s => s !== exceedSlot);
        const allSlots2 = [exceedSlot, ...otherSlots];

        const headerSlots2 = allSlots2.map(s => {
            let displayName;
            if (s === exceedSlot) {
                displayName = topName2;
            } else {
                displayName = displayNames[s] || s;
            }
            const sealHtml = getSealHeaderHtml(char, s);
            return `<th style="white-space:nowrap; font-size:0.9em; padding:8px; text-align:center;"><div style="color:#888; font-size:0.85em; margin-bottom:3px;">${s}</div><div>${displayName}</div>${sealHtml}</th>`;
        }).join("");
        armTable2.innerHTML = `<thead><tr>
  <th style="white-space:nowrap; padding:8px;">세트 이름</th>
  ${headerSlots2}
</tr></thead><tbody></tbody>`;
        const tbody2 = armTable2.querySelector("tbody");

        // ★ 레거시 방어구: 일반 행 없음, 접두어("레거시") 행만
        prefixes.forEach(pref => {
            const styledPref = `<span style="color:#e6b800; font-weight:bold;">${pref}</span>`;
            const prefKey = makePrefixKey(pref, setName);
            tbody2.appendChild(createEquipmentRow({
                char: char,
                setName: setName,
                nameKey: prefKey,
                labelText: styledPref,
                slots: allSlots2,
                fullSize: slots.length
            }));
        });
        if (!LEGACY_PREFIX_SETS.includes(setName)) {
            tbody2.appendChild(createEquipmentRow({
                char: char,
                setName: setName,
                nameKey: setName,
                labelText: "일반",
                slots: allSlots2,
                fullSize: slots.length
            }));
        }

        panel.appendChild(armTable2);
        panel.appendChild(document.createElement("br"));
        panel.appendChild(armTable1);

        const armNormalNames = LEGACY_PREFIX_SETS.includes(setName) ? [...prefixes] : ["일반", ...prefixes];
        const armW1 = calcNameWidth(armNormalNames.length ? armNormalNames : ["일반"]);
        armTable2.querySelectorAll("th:first-child, td:first-child").forEach(cell => {
            cell.style.width = armW1 + "px";
        });

        const armExceedNames = prefixes.flatMap(p => EXCEED_TAGS.map(ex => `[${ex}] ${p}`));
        const armW2 = calcNameWidth(armExceedNames.length ? armExceedNames : ["일반"]);
        armTable1.querySelectorAll("th:first-child, td:first-child").forEach(cell => {
            cell.style.width = armW2 + "px";
        });

    } else {
        // 방어구 기존 로직 (ARMOR_DISPLAY_NAMES 없는 경우)
        const headerSlots = slots.map(s => {
            const sealHtml = getSealHeaderHtml(char, s);
            return `<th style="max-width:150px; white-space:normal; font-size:0.9em; line-height:1.3; padding:8px;">${s}${sealHtml}</th>`;
        }).join("");
        table.innerHTML = `<thead><tr>
  <th style="max-width:200px; white-space:normal;">세트 이름</th>
  ${headerSlots}
</tr></thead><tbody></tbody>`;
        const tbody = table.querySelector("tbody");

        if (!LEGACY_PREFIX_SETS.includes(setName)) {
            tbody.appendChild(makeRow(setName, setName, char));
        }
        const prefixes = ALL_PREFIX[setName] || [];
        prefixes.forEach(pref => {
            const prefKey = makePrefixKey(pref, setName);
            tbody.appendChild(makeRow(prefKey, setName, char));
        });
        prefixes.forEach(pref => {
            EXCEED_TAGS.forEach(ex => {
                const prefKey = makePrefixKey(pref, setName);
                tbody.appendChild(makeRow(`[${ex}] ${prefKey}`, setName, char));
            });
        });

        panel.appendChild(table);

        table.querySelectorAll("th:first-child, td:first-child").forEach(cell => {
            cell.style.width = globalSetNameWidth + "px";
        });
        table.querySelectorAll("th:not(:first-child), td:not(:first-child)").forEach(cell => {
            cell.style.width = globalSlotWidth + "px";
        });
    }
}

// ─────────────────────────────────────────
// 9.2 테이블 행 생성
// ─────────────────────────────────────────
function makeRow(name, setName, char) {
    const slots = ALL_SETS[setName] || [];
    const groupKey = getGroupKey(name);
    const isExceed = isExceedName(name);
    const setType = getSetType(setName);
    const exceedSlots = EXCEED_SLOTS[setType];

    const totalDistinct = getCachedDistinctParts(char, setName);
    const fullSize = slots.length;

    const tr = document.createElement("tr");
    let hasAnyPartInRow = false;

    slots.forEach(slot => {
        let key = `${name} ${slot}`;
        if ((char.armorCounts[key] || 0) > 0) {
            hasAnyPartInRow = true;
        }
    });

    if (hasAnyPartInRow) {
        if (setType === "ARMOR") {
            if (totalDistinct === fullSize) tr.className = "set5";
            else if (totalDistinct >= 3) tr.className = "set3";
        } else {
            if (totalDistinct === 3) tr.className = "set3";
        }
    }

    let itemName = name;
    let finalHtmlName = itemName;

    const exceedMatch = itemName.match(/^(\[.*?\])\s*(.*)/);
    let exceedTagHtml = '';
    let nameWithoutTag = itemName;

    if (exceedMatch) {
        const tag = exceedMatch[1];
        nameWithoutTag = exceedMatch[2];
        const color = getExceedColor(tag);
        exceedTagHtml = `<span style="color:${color}; font-weight:bold;">${tag}</span> `;
    }

    let baseNameHtml = nameWithoutTag;
    const prefixMatch = nameWithoutTag.match(/(.+?):\s*(.+)/);

    if (prefixMatch) {
        const prefix = prefixMatch[1];
        const baseSet = prefixMatch[2];
        const styledPrefix = `<span style="color:#e6b800; font-weight:bold;">${prefix}</span>`;
        baseNameHtml = `${styledPrefix}: ${baseSet}`;
    }

    finalHtmlName = exceedTagHtml + baseNameHtml;

    let html = `<td style="text-align:left;">${finalHtmlName}</td>`;

    slots.forEach(slot => {
        let key = `${name} ${slot}`;
        const val = char.armorCounts[key] || 0;
        if (isExceed) {
            if (exceedSlots.includes(slot)) {
                html += `<td>${makeNumberButton(char.id, key, val)}</td>`;
            } else {
                html += `<td></td>`;
            }
        } else {
            html += `<td>${makeNumberButton(char.id, key, val)}</td>`;
        }
    });
    tr.innerHTML = html;
    return tr;
}

// 7-3. 장비 증감
function makeNumberButton(charId, key, val) {
    const extraClass = val > 0 ? " positive" : "";
    return `<button class="num-btn${extraClass}"
      oncontextmenu="decrement('${charId}','${key}'); return false;"
      onclick="increment('${charId}','${key}')">${val}</button>`;
}

// ─────────────────────────────────────────
// 9.4 UI 업데이트 (Step 1 최적화)
// ─────────────────────────────────────────
function updateEquipmentButton(charId, key, newValue) {
    // 1단계: 테이블에서 모든 버튼 검색
    const tables = document.querySelectorAll("#panel table");
    if (!tables || tables.length === 0) return;

    let buttonFound = false;

    // 2단계: 모든 테이블 순회 (익시드는 별도 테이블)
    tables.forEach(table => {
        const buttons = table.querySelectorAll('.num-btn');
        buttons.forEach(btn => {
            const onclickStr = btn.getAttribute('onclick') || '';
            const oncontextmenuStr = btn.getAttribute('oncontextmenu') || '';

            // 3단계: onclick 또는 oncontextmenu에서 매치 확인
            const matchInClick = onclickStr.includes(`'${charId}'`) && onclickStr.includes(`'${key}'`);
            const matchInContext = oncontextmenuStr.includes(`'${charId}'`) && oncontextmenuStr.includes(`'${key}'`);

            if (matchInClick || matchInContext) {
                buttonFound = true;

                // 버튼 업데이트
                btn.textContent = newValue;
                if (newValue > 0) {
                    btn.classList.add('positive');
                } else {
                    btn.classList.remove('positive');
                }

                // 행 색상 업데이트
                const row = btn.closest('tr');
                if (row && currentSetName && currentChar) {
                    updateRowColor(row, currentChar, currentSetName);
                }
            }
        });
    });

    if (!buttonFound) {
        console.warn('버튼을 찾지 못했습니다:', key);
    }
}

// 테이블 행의 세트 색상 업데이트
function updateRowColor(row, char, setName) {
    const totalDistinct = getCachedDistinctParts(char, setName);
    const setType = getSetType(setName);
    const slots = ALL_SETS[setName] || [];
    const fullSize = slots.length;

    // 기존 색상 제거
    row.classList.remove('set3', 'set5');

    const firstCell = row.querySelector('td');
    if (!firstCell) return;

    const rowText = firstCell.textContent || firstCell.innerText;

    // 행 이름에서 그룹키 추출
    let rowGroupKey = '';

    // 익시드 + 접두어
    const exceedMatch = rowText.match(/\[(선봉|의지|이상)\]/);
    const prefixMatch = rowText.match(/(전격|허상|작열|침식|수호|왜곡|자상|맹독|보호|쇄도|신속|연격|레거시|견고|혈독|초석|각오|가속|조화|불굴|숙련|결의|격변|촉진|질주)/);

    if (rowText.includes('일반')) {
        // 일반 행
        rowGroupKey = setName;
    } else if (exceedMatch && prefixMatch) {
        // 익시드 행: [선봉] 전격
        const tag = exceedMatch[1];
        const prefix = prefixMatch[1];
        const prefKey = makePrefixKey(prefix, setName);
        rowGroupKey = `[${tag}] ${prefKey}`;
    } else if (prefixMatch) {
        // 접두어 행: 전격
        const prefix = prefixMatch[1];
        rowGroupKey = makePrefixKey(prefix, setName);
    }

    if (!rowGroupKey) return;

    // 이 행이 실제로 데이터를 가지고 있는지 확인
    let hasAnyPartInRow = false;
    const exceedSlots = EXCEED_SLOTS[setType] || [];
    const isExceedRow = rowGroupKey.startsWith('[');

    slots.forEach(slot => {
        // 익시드 행은 특정 슬롯만 체크
        if (isExceedRow && !exceedSlots.includes(slot)) return;

        const key = `${rowGroupKey} ${slot}`;
        if ((char.armorCounts[key] || 0) > 0) {
            hasAnyPartInRow = true;
        }
    });

    // 이 행에 데이터가 있으면 전체 세트 기준으로 색상 적용
    if (hasAnyPartInRow) {
        if (setType === "ARMOR") {
            if (totalDistinct === fullSize) {
                row.classList.add('set5');
            } else if (totalDistinct >= 3) {
                row.classList.add('set3');
            }
        } else {
            if (totalDistinct === 3) {
                row.classList.add('set3');
            }
        }
    }
}

// 테이블의 모든 행 색상을 업데이트 (세트 효과 변경 시)
function updateAllRowColors(char, setName) {
    // 모든 테이블 선택 (일반/접두어 + 익시드)
    const tables = document.querySelectorAll("#panel table");
    if (!tables || tables.length === 0) return;

    // 각 테이블의 모든 행 업데이트
    tables.forEach(table => {
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            updateRowColor(row, char, setName);
        });
    });
}

// 세트 버튼의 개수만 업데이트 (재렌더링 없이)
function updateSetButtonCount(setName, char) {
    const setButtons = document.querySelectorAll('.set-btn');
    setButtons.forEach(btn => {
        const btnText = btn.textContent || btn.innerText;
        if (!btnText.includes(setName)) return;

        const slots = ALL_SETS[setName] || [];
        const prefixes = ALL_PREFIX[setName] || [];
        const setType = getSetType(setName);
        const exceedSlots = EXCEED_SLOTS[setType] || [];

        const allGroupKeys = [];
        if (!LEGACY_PREFIX_SETS.includes(setName)) {
            allGroupKeys.push(setName);
        }
        prefixes.forEach(pref => {
            const prefKey = makePrefixKey(pref, setName);
            allGroupKeys.push(prefKey);
            EXCEED_TAGS.forEach(tag => {
                allGroupKeys.push(`[${tag}] ${prefKey}`);
            });
        });

        let totalParts = 0;
        allGroupKeys.forEach(groupKey => {
            const isExceedKey = groupKey.startsWith('[');
            slots.forEach(slot => {
                if (isExceedKey && !exceedSlots.includes(slot)) return;
                const key = `${groupKey} ${slot}`;
                totalParts += char.armorCounts[key] || 0;
            });
        });

        // innerHTML에서 첫 번째 (숫자) 패턴만 교체
        // (textContent != innerHTML인 악세/특장 EXTRA_INFO 버튼도 정상 동작)
        btn.innerHTML = btn.innerHTML.replace(/\(\d+\)/, `(${totalParts})`);

        const distinctParts = getCachedDistinctParts(char, setName);
        const fullSize = slots.length;

        btn.classList.remove('set3', 'set5');
        if (fullSize === 5) {
            if (distinctParts === fullSize) btn.classList.add('set5');
            else if (distinctParts >= 3) btn.classList.add('set3');
        } else {
            if (distinctParts === 3) btn.classList.add('set3');
        }
    });
}

// 카테고리별 총 개수 업데이트 (방어구, 악세, 특장)
function updateCategoryTotals(char) {
    const setList = document.getElementById("setList");
    if (!setList) return;

    // renderEquipmentTab과 동일한 방식: armorCounts 전체 순회 후 getSetType으로 분류
    let totalArmor = 0;
    let totalAccessory = 0;
    let totalSpecial = 0;

    Object.entries(char.armorCounts).forEach(([fullKey, count]) => {
        if (count <= 0) return;

        const parts = fullKey.split(' ');
        const slot = parts.pop();
        const name = parts.join(' ');

        const groupKey = getGroupKey(name);
        const setType = getSetType(groupKey);

        if (setType === "ARMOR") totalArmor += count;
        else if (setType === "ACCESSORY") totalAccessory += count;
        else if (setType === "SPECIAL") totalSpecial += count;
    });

    const headers = setList.querySelectorAll('h2');
    headers.forEach(header => {
        const text = header.textContent;
        if (text.includes('방어구')) {
            header.textContent = `[방어구 (${totalArmor}개)]`;
        } else if (text.includes('악세')) {
            header.textContent = `[악세 (${totalAccessory}개)]`;
        } else if (text.includes('특장')) {
            header.textContent = `[특장 (${totalSpecial}개)]`;
        }
    });
}

// ─────────────────────────────────────────
// 9.3 장비 개수 증감
// ─────────────────────────────────────────
function increment(charId, key) {
    const char = characters.find(c => c.id === charId);
    const oldValue = char.armorCounts[key] || 0;
    const newValue = oldValue + 1;

    char.armorCounts[key] = newValue;
    char.updateTimes[key] = Date.now();
    if (!char.updateHistory) char.updateHistory = [];
    char.updateHistory.push({ key, timestamp: char.updateTimes[key], oldCount: oldValue, newCount: newValue });
    saveLocalData();

    // 캐시 무효화 (데이터 변경되었으므로)
    if (currentSetName) {
        invalidateDistinctCache(charId, currentSetName);
    }

    updateEquipmentButton(charId, key, newValue);
    if (currentSetName) {
        updateSetButtonCount(currentSetName, char);
        updateAllRowColors(char, currentSetName);
    }
    updateCategoryTotals(char);
}

// 감소 함수 (우클릭 시 호출)
function decrement(charId, key) {
    const char = characters.find(c => c.id === charId);
    const cur = char.armorCounts[key] || 0;
    const newValue = Math.max(0, cur - 1);

    char.armorCounts[key] = newValue;
    char.updateTimes[key] = Date.now();
    if (!char.updateHistory) char.updateHistory = [];
    char.updateHistory.push({ key, timestamp: char.updateTimes[key], oldCount: cur, newCount: newValue });
    saveLocalData();

    // 캐시 무효화
    if (currentSetName) {
        invalidateDistinctCache(charId, currentSetName);
    }

    updateEquipmentButton(charId, key, newValue);
    if (currentSetName) {
        updateSetButtonCount(currentSetName, char);
        updateAllRowColors(char, currentSetName);
    }
    updateCategoryTotals(char);
}

// ─────────────────────────────────────────
// 9.5 장비 관리 탭
// ─────────────────────────────────────────