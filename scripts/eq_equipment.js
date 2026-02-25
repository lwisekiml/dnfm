/* ═══════════════════════════════════════════════════════════════
   📚 equipment.js - 장비 관리 시스템
   ═══════════════════════════════════════════════════════════════

   📖 함수 목차 (Ctrl+F로 검색)

   [모달 관리] (1-80줄)
   - openActionModal()
   - closeActionModal()
   - openConfirmModal()
   - closeConfirmModal()

   [세트 버튼] (82-250줄)
   - showSetButtons()
   - makeSetButton()

   [세트 열기] (251-600줄)
   - openSet()

   [테이블 생성] (601-900줄)
   - makeRow()
   - makeNumberButton()

   [증감 함수] (901-1000줄)
   - increment()
   - decrement()

   [UI 업데이트] (1001-1300줄)
   - updateEquipmentButton()
   - updateRowColor()
   - updateAllRowColors()
   - updateSetButtonCount()
   - updateCategoryTotals()

   [장비 탭] (1301-1700줄)
   - renderEquipmentTab()
   - renderFullEquipmentTab()
   - setActiveEquipmentButton()
   - scrollToCategory()

   [캐릭터별 현황] (1701-1900줄)
   - toggleCharacterEquipmentView()
   - renderCharacterButtons()
   - renderCharacterEquipmentDetail()
   - showEquipmentStatistics()

   [검색] (1901-2071줄)
   - searchEquipment()

   ═══════════════════════════════════════════════════════════════ */

/* ========================================
[섹션 8] 모달 관리
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
          <input type="text" id="edit-charJob" value="${job}"
                 style="flex:1; padding:8px; background:#181c33; color:#fff; border:1px solid #2a3158; border-radius:4px;">
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
[섹션 9] 장비 관리 (세트 시스템)
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
            return `<th style="white-space:nowrap; font-size:0.9em; padding:8px; text-align:center;"><div style="color:#888; font-size:0.85em; margin-bottom:3px;">${s}</div><div>${displayName}</div></th>`;
        }).join("");
        table1.innerHTML = `<thead><tr>
  <th style="white-space:nowrap; padding:8px;">세트 이름</th>
  ${headerSlots1}
</tr></thead><tbody></tbody>`;
        const tbody1 = table1.querySelector("tbody");

        tbody1.appendChild(createEquipmentRow({
            char: char,
            setName: setName,
            nameKey: setName,
            labelText: "일반",
            slots: allSlots1,
            fullSize: 3
        }));

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
                const labelHtml = `<span style="color:${color}; font-weight:bold;">[${ex}]</span> ${pref}`;
                const tr = document.createElement("tr");
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
            return `<th style="white-space:nowrap; font-size:0.9em; padding:8px; text-align:center;"><div style="color:#888; font-size:0.85em; margin-bottom:3px;">${s}</div><div>${displayName}</div></th>`;
        }).join("");
        accTable1.innerHTML = `<thead><tr>
  <th style="white-space:nowrap; padding:8px;">세트 이름</th>
  ${headerSlots1}
</tr></thead><tbody></tbody>`;
        const tbody1 = accTable1.querySelector("tbody");

        // ★ 레거시 악세: 일반 행 없음, 접두어("레거시") 행만
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
            return `<th style="white-space:nowrap; font-size:0.9em; padding:8px; text-align:center;"><div style="color:#888; font-size:0.85em; margin-bottom:3px;">${s}</div><div>${displayName}</div></th>`;
        }).join("");
        armTable2.innerHTML = `<thead><tr>
  <th style="white-space:nowrap; padding:8px;">세트 이름</th>
  ${headerSlots2}
</tr></thead><tbody></tbody>`;
        const tbody2 = armTable2.querySelector("tbody");

        // ★ 레거시 방어구: 일반 행 없음, 접두어("레거시") 행만
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
            return `<th style="max-width:150px; white-space:normal; font-size:0.9em; line-height:1.3; padding:8px;">${s}</th>`;
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

    // 4단계: 디버깅 (개발자 도구에서 확인용, 나중에 제거 가능)
    if (!buttonFound) {
        console.log('버튼을 찾지 못했습니다:', key);
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

    let totalArmor = 0;
    Object.keys(ARMOR_SETS).forEach(setName => {
        const slots = ARMOR_SETS[setName];
        const prefixes = ARMOR_PREFIX[setName] || [];

        if (!LEGACY_PREFIX_SETS.includes(setName)) {
            slots.forEach(slot => {
                totalArmor += char.armorCounts[`${setName} ${slot}`] || 0;
            });
        }

        prefixes.forEach(pref => {
            const prefKey = makePrefixKey(pref, setName);
            slots.forEach(slot => {
                totalArmor += char.armorCounts[`${prefKey} ${slot}`] || 0;
            });

            EXCEED_TAGS.forEach(tag => {
                slots.forEach(slot => {
                    totalArmor += char.armorCounts[`[${tag}] ${prefKey} ${slot}`] || 0;
                });
            });
        });
    });

    let totalAccessory = 0;
    Object.keys(ACCESSORY_SETS).forEach(setName => {
        const slots = ACCESSORY_SETS[setName];
        const prefixes = ACCESSORY_PREFIX[setName] || [];

        if (!LEGACY_PREFIX_SETS.includes(setName)) {
            slots.forEach(slot => {
                totalAccessory += char.armorCounts[`${setName} ${slot}`] || 0;
            });
        }

        prefixes.forEach(pref => {
            const prefKey = makePrefixKey(pref, setName);
            slots.forEach(slot => {
                totalAccessory += char.armorCounts[`${prefKey} ${slot}`] || 0;
            });

            EXCEED_TAGS.forEach(tag => {
                slots.forEach(slot => {
                    totalAccessory += char.armorCounts[`[${tag}] ${prefKey} ${slot}`] || 0;
                });
            });
        });
    });

    let totalSpecial = 0;
    Object.keys(SPECIAL_SETS).forEach(setName => {
        const slots = SPECIAL_SETS[setName];
        const prefixes = SPECIAL_PREFIX[setName] || [];

        slots.forEach(slot => {
            totalSpecial += char.armorCounts[`${setName} ${slot}`] || 0;
        });

        prefixes.forEach(pref => {
            const prefKey = makePrefixKey(pref, setName);
            slots.forEach(slot => {
                totalSpecial += char.armorCounts[`${prefKey} ${slot}`] || 0;
            });

            EXCEED_TAGS.forEach(tag => {
                slots.forEach(slot => {
                    totalSpecial += char.armorCounts[`[${tag}] ${prefKey} ${slot}`] || 0;
                });
            });
        });
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
function renderEquipmentTab(mode) {
    // 상태 초기화
    isCharacterEquipmentViewOpen = false;
    isStatisticsViewOpen = false;
    selectedCharacterForEquipment = null;

    // 모든 영역 초기화
    document.getElementById("character-selection-area").style.display = "none";
    document.getElementById("character-equipment-detail").style.display = "none";
    document.getElementById("equipment-display-area").style.display = "block";

    const displayArea = document.getElementById("equipment-display-area");
    const CATEGORIES = [
        {name: "방어구", sets: ARMOR_SETS, prefix: ARMOR_PREFIX, id: 'cat-armor'},
        {name: "악세", sets: ACCESSORY_SETS, prefix: ACCESSORY_PREFIX, id: 'cat-accessory'},
        {name: "특장", sets: SPECIAL_SETS, prefix: SPECIAL_PREFIX, id: 'cat-special'}
    ];

    // 스크롤 버튼 추가
    let scrollButtonHtml = `<div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">`;
    CATEGORIES.forEach(cat => {
        scrollButtonHtml += `<button class="char-btn" style="background: #4a33cc; border: 1px solid #ffd700;"
                            onclick="scrollToCategory('${cat.id}')">${cat.name}로 이동 →</button>`;
    });
    scrollButtonHtml += `</div>`;

    let fullHtml = scrollButtonHtml + `<h2 style="color:#ffd700; margin-bottom:20px;">📊 캐릭터별 상세 현황 (${mode})</h2>`;

    CATEGORIES.forEach(cat => {
        fullHtml += `<div id="${cat.id}" style="margin-bottom: 50px; padding-top: 20px; border-top: 3px solid #4a33cc;">`;
        fullHtml += `<h2 style="color:#ffd700; font-size: 24px; margin-bottom: 15px;">🔹 ${cat.name}</h2>`;

        Object.keys(cat.sets).forEach(baseSetName => {
            const prefixes = cat.prefix[baseSetName] || [];
            const slots = cat.sets[baseSetName];
            const setType = getSetType(baseSetName);
            let targetGroupKeys = [];

            // NORMAL: 레거시 세트는 일반 행 없음
            if ((mode === 'NORMAL' || mode === 'ALL') && !LEGACY_PREFIX_SETS.includes(baseSetName)) {
                targetGroupKeys.push({
                    full: baseSetName,
                    display: "일반",
                    type: 'NORMAL'
                });
            }

            if (mode === 'PREFIX' || mode === 'ALL') {
                prefixes.forEach(p => {
                    const prefKey = makePrefixKey(p, baseSetName);
                    targetGroupKeys.push({
                        full: prefKey,
                        display: p,
                        type: 'PREFIX'
                    });
                });
            }

            if (mode === 'EXCEED' || mode === 'ALL') {
                if (prefixes.length > 0) {
                    prefixes.forEach(p => {
                        const prefKey = makePrefixKey(p, baseSetName);
                        EXCEED_TAGS.forEach(tag => targetGroupKeys.push({
                            full: `[${tag}] ${prefKey}`,
                            display: p,
                            tag: tag,
                            type: 'EXCEED'
                        }));
                    });
                }
            }

            if (targetGroupKeys.length === 0) return;

            fullHtml += `<h3 style="color:#fff; margin-top:30px;">[${baseSetName} 세트]</h3>`;

            let displaySlots = slots;
            if (mode === 'EXCEED') {
                if (setType === "ARMOR") displaySlots = ["상의"];
                else if (setType === "ACCESSORY") displaySlots = ["팔찌"];
                else if (setType === "SPECIAL") displaySlots = ["귀걸이"];
            }

            fullHtml += `<table style="width:max-content; border-collapse:collapse; margin-bottom:20px; border:1px solid #2a3158;">
    <thead style="background:#181c33;"><tr>
        <th style="padding:10px; border:1px solid #2a3158; white-space:nowrap;">직업</th>
        <th style="padding:10px; border:1px solid #2a3158; white-space:nowrap;">이름</th>
        ${(mode === 'ALL' || mode === 'EXCEED') ? '<th style="padding:10px; border:1px solid #2a3158; white-space:nowrap;">익시드</th>' : ''}
        ${mode !== 'NORMAL' ? '<th style="padding:10px; border:1px solid #2a3158; white-space:nowrap;">접두어</th>' : ''}
        ${displaySlots.map(s => {
                const rawName = (setType === "SPECIAL" && SPECIAL_DISPLAY_NAMES[baseSetName] && SPECIAL_DISPLAY_NAMES[baseSetName][s])
                    ? SPECIAL_DISPLAY_NAMES[baseSetName][s]
                    : (setType === "ACCESSORY" && ACCESSORY_DISPLAY_NAMES[baseSetName] && ACCESSORY_DISPLAY_NAMES[baseSetName][s])
                        ? ACCESSORY_DISPLAY_NAMES[baseSetName][s]
                        : (setType === "ARMOR" && ARMOR_DISPLAY_NAMES[baseSetName] && ARMOR_DISPLAY_NAMES[baseSetName][s])
                            ? ARMOR_DISPLAY_NAMES[baseSetName][s]
                            : s;
                let displayName;
                if (Array.isArray(rawName)) {
                    // 익시드 모드: [0](익시드), 일반/접두어 모드: [1](일반), ALL: 둘 다 표시
                    if (mode === 'EXCEED') displayName = rawName[0];
                    else if (mode === 'ALL') displayName = rawName[0] + "<br>" + rawName[1];
                    else displayName = rawName[1];
                } else {
                    displayName = rawName;
                }
                const thWrap = (Array.isArray(rawName) && mode === 'ALL') ? "normal" : "nowrap";
                return `<th style="padding:10px; border:1px solid #2a3158; white-space:${thWrap}; font-size:0.85em; line-height:1.2;">${displayName}</th>`;
            }).join('')}
        ${mode !== 'EXCEED' ? '<th style="padding:10px; border:1px solid #2a3158; white-space:nowrap;">달성</th>' : ''}
    </tr></thead><tbody>`;

            characters.forEach(char => {
                const totalDistinct = calcTotalDistinctParts(char, baseSetName);

                // 해당 캐릭터가 가진 현재 세트의 아이템 데이터 그룹들
                const charGroups = targetGroupKeys.filter(group =>
                    slots.some(s => (char.armorCounts?.[`${group.full} ${s}`] || 0) > 0)
                );

                charGroups.forEach((group, gIdx) => {
                    // 각 모드별로 달성도 계산
                    let displayDistinct = totalDistinct;
                    let statusColor = "#fff";

                    if (mode === 'NORMAL') {
                        displayDistinct = 0;
                        slots.forEach(slot => {
                            const key = `${baseSetName} ${slot}`;
                            if ((char.armorCounts[key] || 0) > 0) displayDistinct++;
                        });
                    } else if (mode === 'PREFIX') {
                        displayDistinct = 0;
                        slots.forEach(slot => {
                            const key = `${group.full} ${slot}`;
                            if ((char.armorCounts[key] || 0) > 0) displayDistinct++;
                        });
                    }

                    // 색상 결정
                    if (setType === "ARMOR") {
                        if (displayDistinct === 5) statusColor = "#ffd700";
                        else if (displayDistinct >= 3) statusColor = "#2ecc71";
                    } else {
                        if (displayDistinct === 3) statusColor = "#2ecc71";
                    }

                    let slotsHtml = displaySlots.map(s => {
                        const count = char.armorCounts?.[`${group.full} ${s}`] || 0;
                        return `<td style="padding:10px; border:1px solid #2a3158; text-align:center; color:${count > 0 ? '#fff' : '#444'}; font-weight:bold;">${count}</td>`;
                    }).join('');

                    let rowInfo = "";
                    const tagColor = EXCEED_COLOR_MAP[group.tag] || "#ffd700";

                    // 일반 모드가 아닐 때만 접두어(display) 셀을 생성
                    if (mode === 'ALL' || mode === 'EXCEED') {
                        const tagCol = group.tag ? `<td style="padding:10px; border:1px solid #2a3158; color:${tagColor}; font-weight:bold; white-space:nowrap;">[${group.tag}]</td>` : `<td style="border:1px solid #2a3158;"></td>`;
                        rowInfo = tagCol + `<td style="padding:10px; border:1px solid #2a3158; color:#ffd700; font-weight:bold; white-space:nowrap;">${group.display}</td>`;
                    } else if (mode === 'PREFIX') {
                        rowInfo = `<td style="padding:10px; border:1px solid #2a3158; color:#ffd700; font-weight:bold; white-space:nowrap;">${group.display}</td>`;
                    }

                    // [모두] 버튼일 때만 캐릭터 경계선에 진한 선 적용
                    const isLastRowOfChar = (gIdx === charGroups.length - 1);
                    const borderStyle = (mode === 'ALL' && isLastRowOfChar) ? "border-bottom: 3px solid #666;" : "border-bottom: 1px solid #2a3158;";

                    fullHtml += `<tr>
                    <td style="padding:10px; ${borderStyle} background:#181c33; white-space:nowrap;">${char.job}</td>
                    <td style="padding:10px; ${borderStyle} white-space:nowrap;">${char.name}</td>
                    ${rowInfo.replace(/border:1px solid #2a3158/g, borderStyle)}${slotsHtml.replace(/border:1px solid #2a3158/g, borderStyle)}
                    ${mode !== 'EXCEED' ? `<td style="padding:10px; ${borderStyle} font-weight:bold; text-align:center; color:${statusColor};">${displayDistinct}</td>` : ''}
                </tr>`;
                });
            });
            fullHtml += `</tbody></table>`;
        });

        fullHtml += `</div>`; // 카테고리 닫는 태그 추가
    });

    displayArea.innerHTML = fullHtml;
}

// 2. 전체 현황 렌더링 (이름 열 너비 고정 및 색상 적용)
function renderFullEquipmentTab(mode) {
    // 상태 초기화
    isCharacterEquipmentViewOpen = false;
    isStatisticsViewOpen = false;
    selectedCharacterForEquipment = null;

    // 모든 영역 초기화
    document.getElementById("character-selection-area").style.display = "none";
    document.getElementById("character-equipment-detail").style.display = "none";
    document.getElementById("equipment-display-area").style.display = "block";

    const displayArea = document.getElementById("equipment-display-area");
    const CATEGORIES = [
        {name: "방어구", sets: ARMOR_SETS, prefix: ARMOR_PREFIX, id: 'cat-armor'},
        {name: "악세", sets: ACCESSORY_SETS, prefix: ACCESSORY_PREFIX, id: 'cat-accessory'},
        {name: "특장", sets: SPECIAL_SETS, prefix: SPECIAL_PREFIX, id: 'cat-special'}
    ];

    // 스크롤 버튼 추가
    let scrollButtonHtml = `<div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">`;
    CATEGORIES.forEach(cat => {
        scrollButtonHtml += `<button class="char-btn" style="background: #4a33cc; border: 1px solid #ffd700;"
                            onclick="scrollToCategory('${cat.id}')">${cat.name}로 이동 →</button>`;
    });
    scrollButtonHtml += `</div>`;

    let fullHtml = scrollButtonHtml + `<h2 style="color:#ffd700; margin-bottom:20px;">🌎 아이템별 전체 현황 (${mode})</h2>`;

    CATEGORIES.forEach(cat => {
        fullHtml += `<div id="${cat.id}" style="margin-bottom: 50px; padding-top: 20px; border-top: 3px solid #4a33cc;">`;
        fullHtml += `<h2 style="color:#ffd700; font-size: 24px; margin-bottom: 15px;">🔹 ${cat.name}</h2>`;

        Object.keys(cat.sets).forEach(baseSetName => {
            const prefixes = cat.prefix[baseSetName] || [];
            let slots = [...cat.sets[baseSetName]];
            let targetGroups = [];

            if (mode === 'NORMAL' && !LEGACY_PREFIX_SETS.includes(baseSetName)) {
                targetGroups.push({display: baseSetName, full: baseSetName, type: 'NORMAL'});
            } else if (mode === 'PREFIX') {
                prefixes.forEach(p => {
                    const prefKey = makePrefixKey(p, baseSetName);
                    targetGroups.push({
                        display: p,
                        full: prefKey,
                        type: 'PREFIX'
                    });
                });
            } else if (mode === 'EXCEED') {
                slots = slots.filter(s => s === "상의" || s === "팔찌" || s === "귀걸이");
                if (slots.length === 0) return;

                // 기존 로직 (접두어 있는 익시드)
                if (prefixes.length > 0) {
                    prefixes.forEach(p => {
                        const prefKey = makePrefixKey(p, baseSetName);
                        EXCEED_TAGS.forEach(tag => targetGroups.push({
                            display: p,
                            full: prefKey,
                            tag: tag,
                            type: 'EXCEED'
                        }));
                    });
                }
            }

            if (targetGroups.length === 0) return;

            // 해당 세트 데이터 존재 여부 확인
            const hasData = targetGroups.some(group => {
                const searchKeyBase = group.tag ? `[${group.tag}] ${group.full}` : group.full;
                return characters.some(c => slots.some(slot => (c.armorCounts?.[`${searchKeyBase} ${slot}`] || 0) > 0));
            });
            if (!hasData) return;

            fullHtml += `<h3 style="color:#fff; margin-top:30px; margin-bottom:10px;">[${baseSetName} 세트]</h3>`;

            // renderFullEquipmentTab() 함수 내부
            fullHtml += `<table style="width: max-content; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #2a3158;">
    <thead style="background:#181c33;"><tr>
        <th style="padding:10px; border:1px solid #2a3158; color:#fff; text-align:center; white-space:nowrap;">아이템 세트 이름</th>
        ${slots.map(s => {
                // 표시용 이름 적용
                const setType = getSetType(baseSetName);
                const rawName = (setType === "SPECIAL" && SPECIAL_DISPLAY_NAMES[baseSetName] && SPECIAL_DISPLAY_NAMES[baseSetName][s])
                    ? SPECIAL_DISPLAY_NAMES[baseSetName][s]
                    : (setType === "ACCESSORY" && ACCESSORY_DISPLAY_NAMES[baseSetName] && ACCESSORY_DISPLAY_NAMES[baseSetName][s])
                        ? ACCESSORY_DISPLAY_NAMES[baseSetName][s]
                        : (setType === "ARMOR" && ARMOR_DISPLAY_NAMES[baseSetName] && ARMOR_DISPLAY_NAMES[baseSetName][s])
                            ? ARMOR_DISPLAY_NAMES[baseSetName][s]
                            : s;
                let displayName;
                if (Array.isArray(rawName)) {
                    // 익시드 모드: [0](익시드), 일반/접두어 모드: [1](일반)
                    displayName = (mode === 'EXCEED') ? rawName[0] : rawName[1];
                } else {
                    displayName = rawName;
                }
                return `<th style="padding:10px; border:1px solid #2a3158; color:#fff; text-align:center; white-space:nowrap; min-width:180px; max-width:200px; font-size:0.85em; line-height:1.2;">${displayName}</th>`;
            }).join('')}
    </tr></thead><tbody>`;

            targetGroups.forEach(group => {
                const searchKeyBase = group.tag ? `[${group.tag}] ${group.full}` : group.full;

                // 접두어 장비일 때만 모든 슬롯 보유 여부를 체크
                const isFullPrefixSet = (group.type === 'PREFIX') && slots.every(slot =>
                    characters.some(c => (c.armorCounts?.[`${searchKeyBase} ${slot}`] || 0) > 0)
                );

                const rowBg = isFullPrefixSet ? "#5c4d00" : "#0f1222";
                const labelBg = isFullPrefixSet ? "#7a6700" : "#111529";

                let relevantOwners = characters.filter(c => {
                    return slots.some(slot => (c.armorCounts?.[`${searchKeyBase} ${slot}`] || 0) > 0);
                });

                let displayName = "";
                if (group.type === 'EXCEED' || group.type === 'PREFIX') {
                    // 레거시 세트: baseSetName이 이미 "레거시: 마력의 소용돌이" 형태
                    // group.full도 "레거시: 마력의 소용돌이"이므로 중복 방지
                    if (LEGACY_PREFIX_SETS.includes(baseSetName)) {
                        // baseSetName에서 "레거시: " 부분 제거
                        const pureSetName = baseSetName.replace(/^레거시:\s*/, '');
                        displayName = `<span style="color:#ffd700; font-weight:bold;">레거시</span>: <span style="color:#fff;">${pureSetName}</span>`;
                    } else {
                        displayName = `<span style="color:#ffd700; font-weight:bold;">${group.display}</span>: <span style="color:#fff;">${baseSetName}</span>`;
                    }
                    if (group.tag) {
                        const tagColor = EXCEED_COLOR_MAP[group.tag] || "#ffd700";
                        displayName = `<span style="color:${tagColor}; font-weight:bold;">[${group.tag}]</span> ` + displayName;
                    }
                } else {
                    displayName = `<span style="color:#fff;">${group.full}</span>`;
                }

                fullHtml += `<tr style="background: ${rowBg};">
                <td style="padding:12px; border:1px solid #2a3158; background:${labelBg}; vertical-align:middle; text-align:center; white-space:nowrap; color:#fff; font-size:14px;">${displayName}</td>`;

                slots.forEach(slot => {
                    fullHtml += `<td style="padding:8px; border:1px solid #2a3158; vertical-align:middle; text-align:center;">`;

                    if (mode === 'EXCEED') {
                        // 익시드: 가로줄 맞추지 않고 데이터가 있는 캐릭터만 촘촘하게 출력
                        const ownersWithItem = characters.filter(c => (c.armorCounts?.[`${searchKeyBase} ${slot}`] || 0) > 0);
                        if (ownersWithItem.length > 0) {
                            ownersWithItem.forEach(owner => {
                                const count = owner.armorCounts[`${searchKeyBase} ${slot}`];
                                fullHtml += `<div style="margin:4px 0; white-space:nowrap; font-size:14px;">
                                    <span style="color:#aaa;">${owner.job}</span>
                                    <span style="color:#fff; font-weight:bold;">(${owner.name})</span>
                                    <span style="color:#ffd700; font-weight:bold;">[${count}]</span>
                                </div>`;
                            });
                        } else {
                            fullHtml += `<span style="color:#444;">0</span>`;
                        }
                    } else {
                        // 일반/접두어: 모든 캐릭터의 자리를 만들어 가로줄 라인을 맞춤 (30px 고정)
                        relevantOwners.forEach(owner => {
                            const count = owner.armorCounts?.[`${searchKeyBase} ${slot}`] || 0;
                            fullHtml += `<div style="height:30px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:center; align-items:center; gap:8px; white-space:nowrap; padding: 0 10px; font-size:14px;">`;
                            if (count > 0) {
                                fullHtml += `<span style="color:#aaa;">${owner.job}</span>
                                             <span style="color:#fff; font-weight:bold;">(${owner.name})</span>
                                             <span style="color:#ffd700; font-weight:bold;">[${count}]</span>`;
                            } else {
                                fullHtml += `<span style="color:#444;">0</span>`;
                            }
                            fullHtml += `</div>`;
                        });
                    }
                    fullHtml += `</td>`;
                });
                fullHtml += `</tr>`;
            });
            fullHtml += `</tbody></table>`;
        });
        fullHtml += `</div>`; // 카테고리 닫는 태그 추가
    });

    displayArea.innerHTML = fullHtml;
}

// 장비 관리 버튼 활성화 로직 (무기 관리 방식 참조)
function setActiveEquipmentButton(clickedBtn) {
    // 1. 장비 관리 섹션(#section-equipment-view) 전체에서 모든 char-btn을 찾음
    const allEquipmentButtons = document.querySelectorAll("#section-equipment-view .char-btn");

    // 2. 모든 버튼에서 active 클래스 제거 (불빛 끄기)
    allEquipmentButtons.forEach(btn => btn.classList.remove('active'));

    // 3. 현재 클릭한 버튼에만 active 클래스 추가 (불빛 켜기)
    if (clickedBtn) {
        clickedBtn.classList.add('active');
    }
}

function scrollToCategory(categoryId) {
    const element = document.getElementById(categoryId);
    if (element) {
        element.scrollIntoView({behavior: 'smooth'});
    }
}

/* ========================================
7-5. 캐릭터별 장비 보유 현황
======================================== */
let isCharacterEquipmentViewOpen = false;
let selectedCharacterForEquipment = null;
let isStatisticsViewOpen = false;  // 통계 화면 상태 추가

// 캐릭터별 장비 보유 현황 토글
function toggleCharacterEquipmentView() {
    const selectionArea = document.getElementById("character-selection-area");
    const detailArea = document.getElementById("character-equipment-detail");
    const displayArea = document.getElementById("equipment-display-area");

    // 통계 화면 닫기
    isStatisticsViewOpen = false;

    // 토글
    isCharacterEquipmentViewOpen = !isCharacterEquipmentViewOpen;

    if (isCharacterEquipmentViewOpen) {
        // 열기
        displayArea.style.display = "none";
        selectionArea.style.display = "block";
        detailArea.style.display = "none";

        // 캐릭터 버튼 렌더링
        renderCharacterButtons();

        // 모든 장비 관리 버튼 비활성화
        document.querySelectorAll("#section-equipment-view .equipment-button-row .char-btn").forEach(btn => {
            btn.classList.remove('active');
        });
    } else {
        // 닫기
        selectionArea.style.display = "none";
        detailArea.style.display = "none";
        displayArea.style.display = "block";

        // 기본 화면으로 복귀
        renderEquipmentTab('ALL');

        // 첫 번째 버튼(모두) 활성화
        const firstBtn = document.querySelector("#section-equipment-view .equipment-button-row .char-btn");
        if (firstBtn) {
            firstBtn.classList.add('active');
        }
    }
}

// 캐릭터 버튼 렌더링
function renderCharacterButtons() {
    const buttonArea = document.getElementById("character-buttons-area");
    buttonArea.innerHTML = "";

    characters.forEach(char => {
        const btn = document.createElement("button");
        btn.className = "char-btn";
        btn.textContent = `${char.job} (${char.name})`;
        btn.style.minWidth = "150px";

        if (selectedCharacterForEquipment === char.id) {
            btn.classList.add("active");
        }

        btn.onclick = () => {
            selectedCharacterForEquipment = char.id;
            renderCharacterButtons(); // 버튼 활성화 상태 갱신
            renderCharacterEquipmentDetail(char);
        };

        buttonArea.appendChild(btn);
    });
}

// 캐릭터 장비 상세 현황 렌더링
function renderCharacterEquipmentDetail(char) {
    const detailArea = document.getElementById("character-equipment-detail");
    detailArea.style.display = "block";

    let html = `<h2 style="color: #ffd700; margin-bottom: 20px;">${char.job} (${char.name}) - 장비 보유 현황</h2>`;

    const CATEGORIES = [
        {
            title: "방어구",
            sets: ARMOR_SETS,
            prefix: ARMOR_PREFIX,
            exceedOnly: [],
            exceedSlot: "상의"
        },
        {
            title: "악세",
            sets: ACCESSORY_SETS,
            prefix: ACCESSORY_PREFIX,
            exceedOnly: [],
            exceedSlot: "팔찌"
        },
        {
            title: "특장",
            sets: SPECIAL_SETS,
            prefix: SPECIAL_PREFIX,
            exceedOnly: [],
            exceedSlot: "귀걸이"
        }
    ];

    CATEGORIES.forEach(category => {
        // 카테고리별 총 개수 계산
        let categoryTotal = 0;
        Object.keys(category.sets).forEach(baseSetName => {
            const setSlots = category.sets[baseSetName];
            const prefixes = category.prefix[baseSetName] || [];
            const isLegacy = LEGACY_PREFIX_SETS.includes(baseSetName);

            // 일반 장비 개수 (레거시는 없음)
            if (!isLegacy) {
                setSlots.forEach(slot => {
                    const normalKey = `${baseSetName} ${slot}`;
                    categoryTotal += char.armorCounts[normalKey] || 0;
                });
            }

            // 접두어 장비 개수
            prefixes.forEach(pref => {
                const prefKey = makePrefixKey(pref, baseSetName);
                setSlots.forEach(slot => {
                    categoryTotal += char.armorCounts[`${prefKey} ${slot}`] || 0;
                });
            });

            // 익시드 장비 개수
            EXCEED_TAGS.forEach(tag => {
                prefixes.forEach(pref => {
                    const prefKey = makePrefixKey(pref, baseSetName);
                    setSlots.forEach(slot => {
                        const exceedKey = `[${tag}] ${prefKey} ${slot}`;
                        categoryTotal += char.armorCounts[exceedKey] || 0;
                    });
                });
            });
        });

        // 제목에 총 개수 표시
        html += `<h2 style="color: #ffd700; margin-bottom: 15px;">🔹 ${category.title} <span style="color: #ffd700; font-weight: bold;">(${categoryTotal}개)</span></h2>`;

        html += `<table style="width: max-content; border-collapse: collapse; margin-bottom: 30px;">`;

        // 헤더
        const slots = Object.values(category.sets)[0] || [];
        // renderCharacterEquipmentDetail() 함수 내부
        html += `<thead style="background: #181c33;"><tr>
    <th style="padding: 10px; border: 1px solid #2a3158; white-space: nowrap; text-align: center;">세트</th>
    <th style="padding: 10px; border: 1px solid #2a3158; white-space: nowrap;">익시드</th>
    <th style="padding: 10px; border: 1px solid #2a3158; white-space: nowrap;">접두어</th>`;

        slots.forEach(slot => {
            html += `<th style="padding: 10px; border: 1px solid #2a3158; white-space: normal; max-width: 120px; font-size: 0.85em; line-height: 1.2;">${slot}</th>`;
        });

        html += `</tr></thead><tbody>`;

        // 각 세트별 데이터
        Object.keys(category.sets).forEach(baseSetName => {
            const setSlots = category.sets[baseSetName];
            const prefixes = category.prefix[baseSetName] || [];
            const exceedSlot = category.exceedSlot;
            const isLegacy = LEGACY_PREFIX_SETS.includes(baseSetName);

            // 세트별 데이터 수집
            let rows = [];

            prefixes.forEach(pref => {
                EXCEED_TAGS.forEach(tag => {
                    let rowData = {
                        type: 'exceed',
                        exceed: tag,
                        prefix: pref,
                        slots: {}
                    };

                    setSlots.forEach(slot => {
                        const prefKey = makePrefixKey(pref, baseSetName);
                        const key = `[${tag}] ${prefKey} ${slot}`;
                        rowData.slots[slot] = char.armorCounts[key] || 0;
                    });

                    if (Object.values(rowData.slots).some(v => v > 0)) {
                        rows.push(rowData);
                    }
                });
            });

            prefixes.forEach(pref => {
                let rowData = {
                    type: 'prefix',
                    exceed: '',
                    prefix: pref,
                    slots: {}
                };

                setSlots.forEach(slot => {
                    const prefKey = makePrefixKey(pref, baseSetName);
                    const key = `${prefKey} ${slot}`;
                    rowData.slots[slot] = char.armorCounts[key] || 0;
                });

                // 데이터가 있는 경우만 추가
                if (Object.values(rowData.slots).some(v => v > 0)) {
                    rows.push(rowData);
                }
            });

            // 3. 일반 행 (레거시 세트는 없음)
            if (!isLegacy) {
                let normalRowData = {
                    type: 'normal',
                    exceed: '',
                    prefix: '',
                    slots: {}
                };

                setSlots.forEach(slot => {
                    const key = `${baseSetName} ${slot}`;
                    normalRowData.slots[slot] = char.armorCounts[key] || 0;
                });

                if (Object.values(normalRowData.slots).some(v => v > 0)) {
                    rows.push(normalRowData);
                }
            }

            // 행이 하나도 없으면 이 세트는 건너뜀
            if (rows.length === 0) return;

            // 테이블 행 렌더링
            rows.forEach((row, rowIdx) => {
                html += `<tr style="border-bottom: 1px solid #444;">`;

                // 세트명 (첫 행에만 rowspan으로 표시)
                if (rowIdx === 0) {
                    html += `<td rowspan="${rows.length}" style="padding: 10px; border: 1px solid #2a3158; font-weight: bold; background: #1a1e33; text-align: center; vertical-align: middle; white-space: nowrap;">${baseSetName}</td>`;
                }

                // 익시드 열
                if (row.exceed) {
                    const tagColor = EXCEED_COLOR_MAP[row.exceed] || "#ffd700";
                    html += `<td style="padding: 10px; border: 1px solid #2a3158; text-align: center; white-space: nowrap;">
                        <span style="color: ${tagColor}; font-weight: bold;">[${row.exceed}]</span>
                    </td>`;
                } else {
                    html += `<td style="padding: 10px; border: 1px solid #2a3158; text-align: center;"></td>`;
                }

                // 접두어 열
                if (row.prefix) {
                    html += `<td style="padding: 10px; border: 1px solid #2a3158; text-align: center; white-space: nowrap;">
                        <span style="color: #e6b800; font-weight: bold;">${row.prefix}</span>
                    </td>`;
                } else {
                    html += `<td style="padding: 10px; border: 1px solid #2a3158; text-align: center;"></td>`;
                }

                // 각 슬롯별 개수
                setSlots.forEach(slot => {
                    const count = row.slots[slot] || 0;

                    // 익시드 행인데 익시드 슬롯이 아니면 빈칸
                    if (row.type === 'exceed' && slot !== exceedSlot) {
                        html += `<td style="padding: 10px; border: 1px solid #2a3158; text-align: center; background: #0a0c15;"></td>`;
                    } else {
                        const displayCount = count > 0 ? count : "";
                        html += `<td style="padding: 10px; border: 1px solid #2a3158; text-align: center; color: #fff; font-weight: bold;">${displayCount}</td>`;
                    }
                });

                html += `</tr>`;
            });

            // 세트 구분선 (두꺼운 선)
            html += `<tr style="height: 3px; background: #2a3158;"><td colspan="${3 + setSlots.length}" style="padding: 0; border: none;"></td></tr>`;
        });

        html += `</tbody></table>`;
    });

    // 무기 섹션 추가
    if (char.weaponCounts && Object.keys(char.weaponCounts).length > 0) {
        // 무기 총 개수 계산
        let totalWeapons = 0;
        Object.values(char.weaponCounts).forEach(count => {
            totalWeapons += count || 0;
        });

        html += `<h2 style="color: #ffd700; margin-top: 40px; margin-bottom: 15px;">🔹 무기 <span style="color: #ffd700; font-weight: bold;">(${totalWeapons}개)</span></h2>`;

        // 직업별로 무기 분류
        JOB_LIST.forEach(jobName => {
            const jobWeaponData = WEAPON_DATA_MAP[jobName];
            if (!jobWeaponData) return;

            // 해당 직업의 무기를 보유하고 있는지 확인
            let hasWeaponsForJob = false;
            const weaponRows = [];

            Object.entries(jobWeaponData).forEach(([category, weaponList]) => {
                let categoryWeapons = [];

                weaponList.forEach(weaponName => {
                    WEAPON_PREFIXES.forEach(prefix => {
                        const weaponKey = `${prefix.tag} ${weaponName}`;
                        const count = char.weaponCounts[weaponKey] || 0;

                        if (count > 0) {
                            hasWeaponsForJob = true;
                            categoryWeapons.push({name: weaponName, prefix: prefix, count: count});
                        }
                    });
                });

                if (categoryWeapons.length > 0) {
                    weaponRows.push({category: category, weapons: categoryWeapons});
                }
            });

            if (!hasWeaponsForJob) return;

            html += `<h4 style="color: #fff; margin-top: 25px; margin-bottom: 10px;">[${jobName}]</h4>`;

            html += `<table style="width: max-content; border-collapse: collapse; margin-bottom: 20px;">`;
            html += `<thead style="background: #181c33;"><tr>
                <th style="padding: 10px; border: 1px solid #2a3158; white-space: nowrap; text-align: center; width: 100px;">종류</th>
                <th style="padding: 10px; border: 1px solid #2a3158; white-space: nowrap; text-align: left;">무기 이름</th>
                <th style="padding: 10px; border: 1px solid #2a3158; white-space: nowrap; text-align: center; width: 80px;">개수</th>
            </tr></thead><tbody>`;

            weaponRows.forEach(row => {
                row.weapons.forEach((weapon, idx) => {
                    html += `<tr style="border-bottom: 1px solid #444;">`;

                    // 종류 (첫 무기에만 rowspan)
                    if (idx === 0) {
                        html += `<td rowspan="${row.weapons.length}" style="padding: 10px; border: 1px solid #2a3158; font-weight: bold; background: #1a1e33; text-align: center; vertical-align: middle;">${row.category}</td>`;
                    }

                    // 무기 이름 (접두어 색상 적용)
                    html += `<td style="padding: 10px; border: 1px solid #2a3158; text-align: left;">
                        <span style="color: ${weapon.prefix.color}; font-weight: bold;">${weapon.prefix.tag}</span> ${weapon.name}
                    </td>`;

                    // 개수
                    html += `<td style="padding: 10px; border: 1px solid #2a3158; text-align: center; color: #fff; font-weight: bold;">${weapon.count}</td>`;

                    html += `</tr>`;
                });

                // 종류 구분선
                html += `<tr style="height: 3px; background: #2a3158;"><td colspan="3" style="padding: 0; border: none;"></td></tr>`;
            });

            html += `</tbody></table>`;
        });
    }

    detailArea.innerHTML = html;
}

// 장비 통계 표시 함수
function showEquipmentStatistics() {
    // 상태 업데이트
    isCharacterEquipmentViewOpen = false;
    isStatisticsViewOpen = true;
    selectedCharacterForEquipment = null;

    // 기존 화면 숨기기
    document.getElementById("character-selection-area").style.display = "none";
    document.getElementById("character-equipment-detail").style.display = "none";

    const displayArea = document.getElementById("equipment-display-area");
    displayArea.style.display = "block";

    // 모든 장비 관리 버튼 비활성화
    document.querySelectorAll("#section-equipment-view .equipment-button-row .char-btn").forEach(btn => {
        btn.classList.remove('active');
    });

    let html = `<h2 style="color: #ffd700; margin-bottom: 20px;">📊 캐릭터별 장비 보유 통계</h2>`;

    // 통계 테이블
    html += `<table style="width: max-content; border-collapse: collapse; margin-bottom: 30px;">`;
    html += `<thead style="background: #181c33;"><tr>
        <th style="padding: 10px; border: 1px solid #2a3158; white-space: nowrap; text-align: center;">직업(이름)</th>
        <th style="padding: 10px; border: 1px solid #2a3158; white-space: nowrap; text-align: center;">방어구</th>
        <th style="padding: 10px; border: 1px solid #2a3158; white-space: nowrap; text-align: center;">악세</th>
        <th style="padding: 10px; border: 1px solid #2a3158; white-space: nowrap; text-align: center;">특장</th>
        <th style="padding: 10px; border: 1px solid #2a3158; white-space: nowrap; text-align: center;">무기</th>
        <th style="padding: 10px; border: 1px solid #2a3158; white-space: nowrap; text-align: center;">합계</th>
    </tr></thead><tbody>`;

    // 각 캐릭터별 통계
    characters.forEach(char => {
        let armorCount = 0;
        let accessoryCount = 0;
        let specialCount = 0;
        let weaponCount = 0;

        // 방어구/악세/특장 개수 계산
        if (char.armorCounts) {
            Object.entries(char.armorCounts).forEach(([key, count]) => {
                if (count <= 0) return;

                const parts = key.split(' ');
                const slot = parts.pop();
                const name = parts.join(' ');
                const groupKey = getGroupKey(name);
                const setType = getSetType(groupKey);

                if (setType === "ARMOR") armorCount += count;
                else if (setType === "ACCESSORY") accessoryCount += count;
                else if (setType === "SPECIAL") specialCount += count;
            });
        }

        // 무기 개수 계산
        if (char.weaponCounts) {
            Object.values(char.weaponCounts).forEach(count => {
                weaponCount += count || 0;
            });
        }

        const total = armorCount + accessoryCount + specialCount + weaponCount;

        html += `<tr style="border-bottom: 1px solid #444;">
            <td style="padding: 10px; border: 1px solid #2a3158; text-align: center; font-weight: bold;">${char.job}(${char.name})</td>
            <td style="padding: 10px; border: 1px solid #2a3158; text-align: center; color: #fff; font-weight: bold;">${armorCount}</td>
            <td style="padding: 10px; border: 1px solid #2a3158; text-align: center; color: #fff; font-weight: bold;">${accessoryCount}</td>
            <td style="padding: 10px; border: 1px solid #2a3158; text-align: center; color: #fff; font-weight: bold;">${specialCount}</td>
            <td style="padding: 10px; border: 1px solid #2a3158; text-align: center; color: #fff; font-weight: bold;">${weaponCount}</td>
            <td style="padding: 10px; border: 1px solid #2a3158; text-align: center; color: #ffd700; font-weight: bold;">${total}</td>
        </tr>`;
    });

    // 전체 합계 행
    let totalArmor = 0;
    let totalAccessory = 0;
    let totalSpecial = 0;
    let totalWeapon = 0;

    characters.forEach(char => {
        if (char.armorCounts) {
            Object.entries(char.armorCounts).forEach(([key, count]) => {
                if (count <= 0) return;
                const parts = key.split(' ');
                const slot = parts.pop();
                const name = parts.join(' ');
                const groupKey = getGroupKey(name);
                const setType = getSetType(groupKey);

                if (setType === "ARMOR") totalArmor += count;
                else if (setType === "ACCESSORY") totalAccessory += count;
                else if (setType === "SPECIAL") totalSpecial += count;
            });
        }

        if (char.weaponCounts) {
            Object.values(char.weaponCounts).forEach(count => {
                totalWeapon += count || 0;
            });
        }
    });

    const grandTotal = totalArmor + totalAccessory + totalSpecial + totalWeapon;

    html += `<tr style="background: #1a1e33; border-top: 3px solid #ffd700;">
        <td style="padding: 10px; border: 1px solid #2a3158; text-align: center; font-weight: bold; color: #ffd700;">전체 합계</td>
        <td style="padding: 10px; border: 1px solid #2a3158; text-align: center; color: #ffd700; font-weight: bold;">${totalArmor}</td>
        <td style="padding: 10px; border: 1px solid #2a3158; text-align: center; color: #ffd700; font-weight: bold;">${totalAccessory}</td>
        <td style="padding: 10px; border: 1px solid #2a3158; text-align: center; color: #ffd700; font-weight: bold;">${totalSpecial}</td>
        <td style="padding: 10px; border: 1px solid #2a3158; text-align: center; color: #ffd700; font-weight: bold;">${totalWeapon}</td>
        <td style="padding: 10px; border: 1px solid #2a3158; text-align: center; color: #ffd700; font-weight: bold; font-size: 1.1em;">${grandTotal}</td>
    </tr>`;

    html += `</tbody></table>`;

    displayArea.innerHTML = html;
}

/* ========================================
7-5-1. 무기 보유 현황
======================================== */
// 현재 선택된 직업군 (무기 보유 현황용)
let activeWeaponStatJob = null;

function showWeaponStatistics(selectedJob = null) {
    isCharacterEquipmentViewOpen = false;
    isStatisticsViewOpen = true;
    selectedCharacterForEquipment = null;

    document.getElementById("character-selection-area").style.display = "none";
    document.getElementById("character-equipment-detail").style.display = "none";

    const displayArea = document.getElementById("equipment-display-area");
    displayArea.style.display = "block";

    // 보유 무기가 있는 직업군만 버튼 생성
    const availableJobs = JOB_LIST.filter(jobGroup => {
        const jobData = WEAPON_DATA_MAP[jobGroup];
        if (!jobData) return false;
        return Object.values(jobData).some(weaponList =>
            weaponList.some(weaponName =>
                WEAPON_PREFIXES.some(prefix =>
                    characters.some(char => (char.weaponCounts?.[`${prefix.tag} ${weaponName}`] || 0) > 0)
                )
            )
        );
    });

    if (!selectedJob) selectedJob = availableJobs[0] || null;
    activeWeaponStatJob = selectedJob;

    // 직업군 선택 버튼
    let html = `<h2 style="color:#ffd700; margin-bottom:16px;">⚔️ 무기 보유 현황</h2>`;
    html += `<div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:20px;">`;
    availableJobs.forEach(job => {
        html += `<button class="char-btn${job === selectedJob ? ' active' : ''}" onclick="showWeaponStatistics('${job}')">${job}</button>`;
    });
    html += `</div>`;

    if (!selectedJob) {
        html += `<p style="color:#888;">보유한 무기가 없습니다.</p>`;
        displayArea.innerHTML = html;
        return;
    }

    const jobData = WEAPON_DATA_MAP[selectedJob];

    html += `<div style="overflow-x:auto;">`;
    html += `<table style="table-layout:fixed; border-collapse:collapse; width:max-content;">`;
    html += `<thead><tr style="background:#181c33;">`;
    html += `<th style="width:120px; padding:12px; border:1px solid #2a3158; white-space:nowrap;">종류</th>`;
    html += `<th style="width:300px; padding:12px; border:1px solid #2a3158; white-space:nowrap;">무기 이름</th>`;
    html += `<th style="width:150px; padding:12px; border:1px solid #2a3158; white-space:nowrap; text-align:center;">직업(이름)</th>`;
    html += `<th style="width:70px;  padding:12px; border:1px solid #2a3158; white-space:nowrap; text-align:center;">개수</th>`;
    html += `</tr></thead><tbody>`;

    const categories = Object.keys(jobData);
    categories.forEach((category, cIdx) => {
        const weaponList = jobData[category];

        // 카테고리 내 보이는 행: [무기이름 × 접두어] 중 한 명이라도 보유한 것만
        // 각 항목: { weaponName, pref, owners: [{job, name, val}] }
        const visibleItems = [];
        weaponList.forEach(weaponName => {
            WEAPON_PREFIXES.forEach(pref => {
                const key = `${pref.tag} ${weaponName}`;
                const owners = characters
                    .map(char => ({ job: char.job, name: char.name, val: char.weaponCounts?.[key] || 0 }))
                    .filter(o => o.val > 0);
                if (owners.length > 0) {
                    visibleItems.push({ weaponName, pref, owners });
                }
            });
        });
        if (visibleItems.length === 0) return;

        // 종류 rowspan = 전체 owners 행 수 합계
        const totalRows = visibleItems.reduce((sum, item) => sum + item.owners.length, 0);
        let categoryRendered = false;

        visibleItems.forEach((item, iIdx) => {
            // 무기이름 rowspan = owners 수
            item.owners.forEach((owner, oIdx) => {
                html += `<tr>`;

                // 종류 셀 (첫 행만)
                if (!categoryRendered) {
                    html += `<td rowspan="${totalRows}" style="background:#181c33; font-weight:bold; width:120px; border:1px solid #2a3158; text-align:center; vertical-align:middle; color:#fff; padding:10px;">${category}</td>`;
                    categoryRendered = true;
                }

                // 무기 이름 셀 (소유자 수만큼 rowspan)
                if (oIdx === 0) {
                    html += `<td rowspan="${item.owners.length}" style="text-align:left; padding:8px 15px; white-space:nowrap; border:1px solid #2a3158; vertical-align:middle;">`;
                    html += `<span style="color:${item.pref.color}; font-weight:bold;">${item.pref.tag}</span>&nbsp;${item.weaponName}`;
                    html += `</td>`;
                }

                // 직업/이름
                html += `<td style="padding:6px 10px; border:1px solid #2a3158; text-align:center; white-space:nowrap;">${owner.job}(${owner.name})</td>`;
                // 개수
                html += `<td style="padding:6px 10px; border:1px solid #2a3158; text-align:center; color:${item.pref.color}; font-weight:bold;">${owner.val}</td>`;

                html += `</tr>`;
            });
        });

        // 카테고리 간 구분선
        if (cIdx < categories.length - 1) {
            html += `<tr style="height:20px;"><td colspan="4" style="border:none; border-bottom:1px solid #2a3158; background:transparent;"></td></tr>`;
        }
    });

    html += `</tbody></table></div>`;
    displayArea.innerHTML = html;
}

/* ========================================
7-6. 장비 검색 기능
======================================== */
function searchEquipment() {
    const searchInput = document.getElementById("equipment-search-input");
    const searchTerm = searchInput.value.trim();

    if (!searchTerm) {
        alert("검색어를 입력해주세요!");
        return;
    }

    // 상태 업데이트
    isCharacterEquipmentViewOpen = false;
    isStatisticsViewOpen = false;
    selectedCharacterForEquipment = null;

    // 기존 화면 숨기기
    document.getElementById("character-selection-area").style.display = "none";
    document.getElementById("character-equipment-detail").style.display = "none";

    const displayArea = document.getElementById("equipment-display-area");
    displayArea.style.display = "block";

    // 모든 장비 관리 버튼 비활성화
    document.querySelectorAll("#section-equipment-view .equipment-button-row .char-btn").forEach(btn => {
        btn.classList.remove('active');
    });

    let html = `<h2 style="color: #ffd700; margin-bottom: 20px;">🔍 검색 결과: "${searchTerm}"</h2>`;

    const CATEGORIES = [
        {name: "방어구", sets: ARMOR_SETS, prefix: ARMOR_PREFIX},
        {name: "악세", sets: ACCESSORY_SETS, prefix: ACCESSORY_PREFIX},
        {name: "특장", sets: SPECIAL_SETS, prefix: SPECIAL_PREFIX}
    ];

    let foundSets = [];

    // 검색어와 일치하는 세트 찾기
    CATEGORIES.forEach(category => {
        Object.keys(category.sets).forEach(baseSetName => {
            if (baseSetName.includes(searchTerm)) {
                foundSets.push({
                    category: category.name,
                    setName: baseSetName,
                    slots: category.sets[baseSetName],
                    prefixes: category.prefix[baseSetName] || [],
                    isLegacy: LEGACY_PREFIX_SETS.includes(baseSetName)
                });
            }
        });
    });

    if (foundSets.length === 0) {
        html += `<p style="color: #888; font-size: 1.2em; margin-top: 50px; text-align: center;">검색 결과가 없습니다.</p>`;
        displayArea.innerHTML = html;
        return;
    }

    // 검색 결과 표시
    foundSets.forEach(set => {
        html += `<h3 style="color: #fff; margin-top: 30px; margin-bottom: 15px;">[${set.category}] ${set.setName}</h3>`;

        html += `<table style="width: max-content; border-collapse: collapse; margin-bottom: 30px; border: 1px solid #2a3158;">`;
        html += `<thead style="background: #181c33;"><tr>
            <th style="padding: 10px; border: 1px solid #2a3158; white-space: nowrap;">직업(이름)</th>
            <th style="padding: 10px; border: 1px solid #2a3158; white-space: nowrap;">익시드</th>
            <th style="padding: 10px; border: 1px solid #2a3158; white-space: nowrap;">접두어</th>`;

        set.slots.forEach(slot => {
            html += `<th style="padding: 10px; border: 1px solid #2a3158; white-space: normal; max-width: 120px; font-size: 0.85em; line-height: 1.2;">${slot}</th>`;
        });

        html += `<th style="padding: 10px; border: 1px solid #2a3158; white-space: nowrap;">합계</th>`;
        html += `</tr></thead><tbody>`;

        // 캐릭터별 데이터 수집
        characters.forEach(char => {
            let charRows = [];

            // 익시드 데이터
            if (set.prefixes.length > 0) {
                set.prefixes.forEach(pref => {
                    EXCEED_TAGS.forEach(tag => {
                        let rowData = {type: 'exceed', exceed: tag, prefix: pref, slots: {}, total: 0};
                        const prefKey = makePrefixKey(pref, set.setName);
                        set.slots.forEach(slot => {
                            const key = `[${tag}] ${prefKey} ${slot}`;
                            const count = char.armorCounts?.[key] || 0;
                            rowData.slots[slot] = count;
                            rowData.total += count;
                        });
                        if (rowData.total > 0) charRows.push(rowData);
                    });
                });
            }

            // 접두어 데이터
            set.prefixes.forEach(pref => {
                let rowData = {type: 'prefix', exceed: '', prefix: pref, slots: {}, total: 0};
                const prefKey = makePrefixKey(pref, set.setName);
                set.slots.forEach(slot => {
                    const key = `${prefKey} ${slot}`;
                    const count = char.armorCounts?.[key] || 0;
                    rowData.slots[slot] = count;
                    rowData.total += count;
                });

                if (rowData.total > 0) charRows.push(rowData);
            });

            // 일반 데이터 (레거시 세트는 건너뜀)
            if (!set.isLegacy) {
                let normalRow = {type: 'normal', exceed: '', prefix: '', slots: {}, total: 0};
                set.slots.forEach(slot => {
                    const key = `${set.setName} ${slot}`;
                    const count = char.armorCounts?.[key] || 0;
                    normalRow.slots[slot] = count;
                    normalRow.total += count;
                });
                if (normalRow.total > 0) charRows.push(normalRow);
            }

            // 행이 없으면 이 캐릭터는 건너뜀
            if (charRows.length === 0) return;

            // 테이블 행 렌더링
            charRows.forEach((row, rowIdx) => {
                html += `<tr style="border-bottom: 1px solid #444;">`;

                // 캐릭터 이름 (첫 행에만 rowspan)
                if (rowIdx === 0) {
                    html += `<td rowspan="${charRows.length}" style="padding: 10px; border: 1px solid #2a3158; font-weight: bold; background: #1a1e33; text-align: center; vertical-align: middle; white-space: nowrap;">${char.job}(${char.name})</td>`;
                }

                // 익시드 열
                if (row.exceed) {
                    const tagColor = EXCEED_COLOR_MAP[row.exceed] || "#ffd700";
                    html += `<td style="padding: 10px; border: 1px solid #2a3158; text-align: center; white-space: nowrap;">
                        <span style="color: ${tagColor}; font-weight: bold;">[${row.exceed}]</span>
                    </td>`;
                } else {
                    html += `<td style="padding: 10px; border: 1px solid #2a3158;"></td>`;
                }

                // 접두어 열
                if (row.prefix) {
                    html += `<td style="padding: 10px; border: 1px solid #2a3158; text-align: center; white-space: nowrap;">
                        <span style="color: #e6b800; font-weight: bold;">${row.prefix}</span>
                    </td>`;
                } else {
                    html += `<td style="padding: 10px; border: 1px solid #2a3158;"></td>`;
                }

                // 슬롯별 개수
                set.slots.forEach(slot => {
                    const count = row.slots[slot] || 0;
                    const displayCount = count > 0 ? count : "";
                    html += `<td style="padding: 10px; border: 1px solid #2a3158; text-align: center; color: #fff; font-weight: bold;">${displayCount}</td>`;
                });

                // 합계
                html += `<td style="padding: 10px; border: 1px solid #2a3158; text-align: center; color: #ffd700; font-weight: bold;">${row.total}</td>`;

                html += `</tr>`;
            });

            // 캐릭터 구분선
            html += `<tr style="height: 3px; background: #666;"><td colspan="${4 + set.slots.length}" style="padding: 0; border: none;"></td></tr>`;
        });

        html += `</tbody></table>`;
    });

    displayArea.innerHTML = html;
}

// Enter 키로도 검색 가능하도록 이벤트 리스너 추가 (초기화 섹션에 추가)
document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById("equipment-search-input");
    if (searchInput) {
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') searchEquipment();
        });
    }
});