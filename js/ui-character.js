// ============================================
// ui-character.js - 캐릭터 관리 UI
// ============================================

/**
 * 캐릭터 테이블 생성
 */
function createCharacterTable(savedData = null) {
    // 1) 고유 ID 생성 및 룬 데이터 초기화
    const charId = savedData && savedData.id ? savedData.id : "char_" + Date.now() + Math.random().toString(16).slice(2);
    const section = document.createElement('div');
    section.className = 'char-section';
    section.id = charId;

    // 룬 데이터 메모리 할당 - AppState 사용
    AppState.charRuneData[charId] = (savedData && savedData.runeData) ? savedData.runeData : {
        runes: Array(20).fill().map(() => ({name: '', lv: '', skillLv: ''})),
        gakin: ['', '']
    };

    // 2) 테이블 기본 구조(HTML) 생성
    section.innerHTML = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th rowspan="2" class="col-char-info">직업/이름</th>
                        <th rowspan="2" class="col-slot v-border-heavy">슬롯</th>
                        <th rowspan="2" class="col-rarity">희귀도</th>
                        <th rowspan="2" class="col-exceed">익시드</th>
                        <th rowspan="2" class="col-prefix">접두어</th>
                        <th rowspan="2" style="min-width:120px;">아이템이름</th>
                        <th rowspan="2" class="col-val-short">강화</th>
                        <th colspan="4" class="group-header">마법봉인</th>
                        <th colspan="2" class="group-header">엠블렘</th>
                        <th colspan="2" class="group-header">마법부여</th>
                        <th rowspan="2" style="min-width:230px;" class="v-border-heavy">설명</th>
                    </tr>
                    <tr>
                        <th>고유 옵션</th><th class="col-val-short">수치</th><th>일반 옵션</th><th class="col-val-short">수치</th>
                        <th class="col-emblem">엠블렘</th><th class="col-emblem">엠블렘</th>
                        <th class="col-enchant">마법부여</th><th class="col-val-short">수치</th>
                    </tr>
                </thead>
                <tbody class="tbody-content"></tbody>
            </table>
        </div>`;

    const tbody = section.querySelector('.tbody-content');

    // 3) 각 장비 슬롯(20여 개) 생성 루프
    slots.forEach((slot, index) => {
        const tr = document.createElement('tr');
        if (heavyBorderSlots.includes(slot)) tr.style.borderBottom = "2px solid var(--border-heavy)";

        // 왼쪽 캐릭터 정보 칸 (첫 번째 행에만 rowspan으로 추가)
        if (index === 0) {
            tr.innerHTML += `
            <td rowspan="${slots.length}" style="background-color: #121216; vertical-align: top;">
                <div style="display:flex; flex-direction:column; gap:4px; padding:5px;">
                    <div style="display:flex; gap:4px;">
                        <select data-key="info_stat_type" onchange="applySealHighlight('${charId}'); autoSave();" style="flex:1; border:1px solid #444; background:#000; color:#fff; font-size:11px; height:22px;">
                            <option value="">(스탯)</option>
                            <option value="힘">힘</option>
                            <option value="지능">지능</option>
                        </select>
                        <select data-key="info_ele_type" onchange="applySealHighlight('${charId}'); autoSave();" style="flex:1; border:1px solid #444; background:#000; color:#fff; font-size:11px; height:22px;">
                            <option value=""></option>
                            <option value="화속강">화속강</option>
                            <option value="수속강">수속강</option>
                            <option value="명속강">명속강</option>
                            <option value="암속강">암속강</option>
                        </select>
                    </div>
                    <div style="border-bottom: 2px solid var(--gold); margin: 4px 0;"></div>
                    <input type="text" placeholder="직업" data-key="info_job" oninput="autoSave()">
                    <input type="text" placeholder="이름" data-key="info_name" oninput="autoSave()">
					<input type="text" placeholder="항마력" data-key="info_power" oninput="autoSave()">
                    <div style="border-bottom: 2px solid var(--gold); margin: 8px 0;"></div>
                    <button onclick="toggleEdit('${charId}', true)" class="btn-char-lock lock-btn">잠금</button>
                    <button onclick="toggleEdit('${charId}', false)" class="btn-char-unlock unlock-btn">해제</button>
                    <div style="border-bottom: 2px solid var(--gold); margin: 10px 0;"></div>
					<div style="display:flex; gap:2px; margin-bottom: 4px;">
						<button onclick="moveCharacter('${charId}', 'up')" class="btn-action" style="flex:1; background:#444; padding:2px;">▲</button>
						<button onclick="moveCharacter('${charId}', 'down')" class="btn-action" style="flex:1; background:#444; padding:2px;">▼</button>
					</div>
                    <button onclick="deleteCharacter('${charId}')" class="del-btn" style="background:#ff4d4d; color:white; border:none; padding:4px; cursor:pointer; font-size:11px; border-radius:2px;">삭제</button>
                </div>
            </td>`;
        }

        // 4) 슬롯별 특수 UI 분기 (스킬룬, 크리쳐, 일반장비)
        if (slot === "스킬룬") {
            tr.innerHTML += `
                <td class="col-slot v-border-heavy">스킬룬</td>
                <td colspan="3"><button class="btn-action" onclick="openRuneModal('${charId}')" style="background:#059669; padding:2px 8px;">수정</button> <button class="btn-action" onclick="resetRuneData('${charId}')" style="background:#444; padding:2px 8px;">초기화</button></td>
                <td colspan="10" id="${charId}_runeSummary" style="text-align:left; padding-left:10px; color:var(--gold); font-size:11px; font-weight:bold;">설정된 룬 없음</td>
                <td class="v-border-heavy"><input type="text" data-key="${slot}_desc" oninput="autoSave()" style="text-align: left; padding-left: 6px;"></td>`;
        } else if (slot === "크리쳐") {
            tr.innerHTML += `
        <td class="col-slot v-border-heavy">크리쳐</td>
        <td class="col-rarity">
            <select data-key="${slot}_rarity" onchange="updateStyle(this, 'rarity')" class="rare-에픽">
                <option>에픽</option><option>유니크</option><option>레어</option><option>언커먼</option><option>커먼</option>
            </select>
        </td>
        <td colspan="2">
            <input type="text" data-key="${slot}_name" placeholder="크리쳐 이름" class="rare-에픽" oninput="autoSave()">
        </td>
        <td colspan="10">
            <div class="artifact-main-wrapper">
                ${['red', 'blue', 'green'].map((color) => `
                    <div class="art-group">
                        <div class="art-item custom-top-line" style="margin-bottom: 4px; border-bottom: 1px dashed #444; padding-bottom: 4px;">
                            <select data-key="${slot}_art_${color}_top_rarity"
                                    class="art-color-select bg-에픽"
                                    style="width:65px;"
                                    onchange="updateStyle(this, 'artBg')">
                                <option>에픽</option><option>유니크</option><option>레어</option><option>언커먼</option><option>커먼</option>
                            </select>
                            <input type="text"
                                   data-key="${slot}_art_${color}_top_text"
                                   class="art-opt-select bg-에픽"
                                   style="width:110px;"
                                   placeholder="내용 입력"
                                   oninput="autoSave()">
                        </div>
                        ${[1, 2].map(num => `
                            <div class="art-item">
                                <select data-key="${slot}_art_${color}_bg_${num}" class="art-color-select bg-에픽" style="width:65px;" onchange="updateStyle(this, 'artBg')"><option>에픽</option><option>유니크</option><option>레어</option><option>언커먼</option><option>커먼</option></select>
                                <select data-key="${slot}_art_${color}_opt_${num}" class="art-opt-select bg-에픽" style="width:110px;" onchange="autoSave()"><option value="">옵션 선택</option>${artOptions[color].map(o => `<option>${o}</option>`).join('')}</select>
                            </div>`).join('')}
                    </div>`).join('')}
            </div>
        </td>
        <td class="v-border-heavy"><input type="text" data-key="${slot}_desc" oninput="autoSave()" style="text-align: left; padding-left: 6px;"></td>`;
        } else {
            // 일반 장비 슬롯 로직
            const isEq = index < 12;
            const isExSlot = ['상의', '팔찌', '귀걸이'].includes(slot);
            const hasEmb = !["외형칭호", "오라", "아바타", "크리쳐"].includes(slot);
            const isElemSlot = ["보조장비", "귀걸이", "마법석", "칭호"].includes(slot);

            // 신규 추가 시 마법부여 기본값 설정 로직
            let defaultEnchant = "";
            let defaultEnchantVal = "";

            if (!savedData) {
                if (slot === "무기") {
                    defaultEnchant = "물마공";
                    defaultEnchantVal = "30";
                } else if (["상의", "하의"].includes(slot)) {
                    defaultEnchant = "힘지능";
                    defaultEnchantVal = "68";
                } else if (["어깨", "신발", "벨트"].includes(slot)) {
                    defaultEnchant = "물마크";
                    defaultEnchantVal = "50";
                } else if (["목걸이", "팔찌", "반지"].includes(slot)) {
                    defaultEnchant = "모속강";
                    defaultEnchantVal = "13";
                } else if (slot === "보조장비") {
                    defaultEnchant = "물마공/크";
                    defaultEnchantVal = "30/19";
                }
            }

            // 마법봉인 목록 가져오기
            let g = {n1: [], n2: []};
            if (slot === "무기") g = GameData.sealData.weapon;
            else if (index >= 1 && index <= 5) g = GameData.sealData.armor;
            else if (index >= 6 && index <= 8) g = GameData.sealData.accessory;
            else if (index >= 9 && index <= 11) g = GameData.sealData.special;

            let embCls = (["상의", "하의"].includes(slot)) ? "emb-bg-red" : (["어깨", "벨트"].includes(slot)) ? "emb-bg-yellow" : (["신발", "팔찌"].includes(slot)) ? "emb-bg-blue" : (["목걸이", "반지"].includes(slot)) ? "emb-bg-green" : "emb-bg-gray";
            const tierSlots = ["무기", "상의", "어깨", "하의", "신발", "벨트", "목걸이", "팔찌", "반지", "보조장비"];
            const rarityOptions = tierSlots.includes(slot) ? `<option>에픽</option><option>유니크</option><option>레어</option><option>언커먼</option><option>커먼</option><option>티어</option>` : `<option>에픽</option><option>유니크</option><option>레어</option><option>언커먼</option><option>커먼</option>`;

            let itemNameHTML = itemOptions[slot]
                ? `<select data-key="${slot}_itemname" class="rare-에픽 itemname-color-sync" onchange="${["상의", "하의", "어깨", "벨트", "신발"].includes(slot) ? `checkArmorSetColor('${charId}'); ` : ''}autoSave()"><option value=""></option>${itemOptions[slot].map(opt => `<option value="${opt}">${opt}</option>`).join('')}</select>`
                : `<input type="text" data-key="${slot}_itemname" class="rare-에픽 itemname-color-sync" oninput="autoSave()">`;

            let descTdHTML = (slot === "칭호") ? `<td rowspan="2" class="v-border-heavy" style="padding: 2px; vertical-align: middle;"><textarea data-key="칭호_desc" oninput="autoSave()" style="width:calc(100% - 4px); height:calc(100% - 2px); min-height:44px; background:#000; color:#fff; border:1px solid #444; padding:4px 6px; resize:none; font-family: sans-serif; font-size: 11px; box-sizing:border-box; text-align:left; outline:none;"></textarea></td>` : (slot === "외형칭호") ? '' : `<td class="v-border-heavy"><input type="text" data-key="${slot}_desc" oninput="autoSave()" style="text-align: left; padding-left: 6px; outline:none;"></td>`;

            const tabAttr = (slot === "외형칭호") ? 'tabindex="-1"' : '';

            tr.innerHTML += `
    <td class="col-slot v-border-heavy">${slot}</td>
    <td class="col-rarity"><select ${tabAttr} data-key="${slot}_rarity" data-slot="${slot}" onchange="updateStyle(this, 'rarity')" class="rare-에픽">${rarityOptions}</select></td>
    <td class="col-exceed">${isExSlot ? `<select ${tabAttr} data-key="${slot}_exceed" data-slot="${slot}" onchange="updateStyle(this,'exceed')"><option></option><option>이상</option><option>선봉</option><option>의지</option></select>` : '-'}</td>
    <td class="col-prefix">${isEq ? `<select ${tabAttr} data-key="${slot}_prefix" data-slot="${slot}" onchange="updateStyle(this,'prefix')">${prefixes.map(p => `<option>${p}</option>`).join('')}</select>` : '-'}</td>
    <td>${itemNameHTML.replace('<select ', '<select ' + tabAttr + ' ').replace('<input ', '<input ' + tabAttr + ' ')}</td>
    <td class="col-val-short">${isEq ? `<input ${tabAttr} type="text" data-key="${slot}_reinforce" oninput="autoSave()">` : '-'}</td>
    <td>${isEq ? `<select ${tabAttr} data-key="${slot}_seal1" data-slot="${slot}" onchange="handleSealChange(this)">${g.n1.map(o => `<option>${o}</option>`).join('')}</select>` : '-'}</td>
    <td class="col-val-short">${isEq ? `<input ${tabAttr} type="text" data-key="${slot}_seal1_val" oninput="applySealHighlight('${charId}'); autoSave();">` : '-'}</td>
    <td>${isEq ? `<select ${tabAttr} data-key="${slot}_seal2" data-slot="${slot}" onchange="handleSealChange(this)">${g.n2.map(o => `<option>${o}</option>`).join('')}</select>` : '-'}</td>
    <td class="col-val-short">${isEq ? `<input ${tabAttr} type="text" data-key="${slot}_seal2_val" oninput="applySealHighlight('${charId}'); autoSave();">` : '-'}</td>
    <td class="col-emblem">${hasEmb ? (isElemSlot ? `<select ${tabAttr} data-key="${slot}_emb1" class="${embCls}" onchange="autoSave()">${elementEmbList.map(e => `<option>${e}</option>`).join('')}</select>` : `<input ${tabAttr} type="text" data-key="${slot}_emb1" class="${embCls}" oninput="autoSave()">`) : '-'}</td>
    <td class="col-emblem">${hasEmb ? `<input ${tabAttr} type="text" data-key="${slot}_emb2" class="${embCls}" oninput="autoSave()">` : '-'}</td>
    <td class="col-enchant">${index < 12 || slot === "칭호" ? `<input ${tabAttr} type="text" data-key="${slot}_enchant" value="${defaultEnchant}" oninput="autoSave()">` : '-'}</td>
    <td class="col-val-short">${index < 12 || slot === "칭호" ? `<input ${tabAttr} type="text" data-key="${slot}_enchant_val" value="${defaultEnchantVal}" oninput="autoSave()">` : '-'}</td>
    ${descTdHTML}`;
        }
        tbody.appendChild(tr);
    });

    // 5) 문서에 테이블 삽입 및 초기화
    document.getElementById('characterContainer').appendChild(section);
    updateRuneSummary(charId);

    // 신규 추가 시에도 접두어 리스트를 부위에 맞게 즉시 갱신
    section.querySelectorAll('select[data-key$="_prefix"]').forEach(sel => {
        const slot = sel.getAttribute('data-slot');
        const raritySel = section.querySelector(`select[data-key="${slot}_rarity"]`);
        updateStyle(sel, 'prefix', true);
        if (raritySel) {
            updateStyle(raritySel, 'rarity', true);
        }
    });

    // 6) 저장된 데이터 복구 로직
    if (savedData) {
        // 6-1) 희귀도 먼저 설정
        const rarityInputs = section.querySelectorAll('select[data-key$="_rarity"]');
        rarityInputs.forEach(el => {
            const key = el.getAttribute('data-key');
            if (savedData.inputs[key]) {
                el.value = savedData.inputs[key].val;
                updateStyle(el, 'rarity', true);
            }
        });

        // 6-2) 모든 나머지 입력값 복구
        const inputs = section.querySelectorAll('input[data-key], select[data-key], textarea[data-key]');
        inputs.forEach(el => {
            const key = el.getAttribute('data-key');
            if (savedData.inputs && savedData.inputs[key]) {
                const data = savedData.inputs[key];
                if (key.endsWith('_rarity')) return;

                el.value = data.val;

                // 크리쳐 아티팩트 배경색 강제 동기화
                if (key.includes('_art_') && key.includes('_bg_')) {
                    updateStyle(el, 'artBg', true);
                } else if (data.cls) {
                    el.className = data.cls;
                }

                if (key.endsWith('_prefix')) {
                    updateStyle(el, 'prefix', true);
                }
            }
        });

        // 3. 세트 체크 및 하이라이트 재적용
        setTimeout(() => {
            if (typeof checkArmorSetColor === "function") {
                checkArmorSetColor(charId);
            }
            const setTargetSlots = ["목걸이", "팔찌", "반지", "보조장비", "귀걸이", "마법석"];
            setTargetSlots.forEach(slot => {
                if (typeof runSetCheck === "function") {
                    runSetCheck(slot, charId);
                }
            });
            applySealHighlight(charId);
        }, 0);

        toggleEdit(charId, !!savedData.locked);
    }

    toggleEdit(charId, savedData ? !!savedData.locked : false);
}

/**
 * 캐릭터 삭제
 */
function deleteCharacter(charId) {
    const section = document.getElementById(charId);
    if (!section) return;

    const lockBtn = section.querySelector('.lock-btn');
    const isLocked = lockBtn && lockBtn.classList.contains('btn-active');

    if (isLocked) {
        alert("캐릭터가 잠금 상태입니다. '해제' 버튼을 누른 후 삭제해주세요.");
        return;
    }

    if (confirm("정말로 이 캐릭터를 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.")) {
        section.remove();
        delete AppState.charRuneData[charId];
        autoSave();

        const statusMsg = document.getElementById('statusMsg');
        if (statusMsg) {
            statusMsg.innerText = "캐릭터가 삭제되었습니다.";
            setTimeout(() => statusMsg.innerText = "", 2000);
        }
    }
}

/**
 * 캐릭터 이동
 */
function moveCharacter(charId, direction) {
    const section = document.getElementById(charId);
    if (!section) return;

    if (direction === 'up') {
        const prev = section.previousElementSibling;
        if (prev && prev.classList.contains('char-section')) {
            section.parentNode.insertBefore(section, prev);
        }
    } else {
        const next = section.nextElementSibling;
        if (next && next.classList.contains('char-section')) {
            section.parentNode.insertBefore(next, section);
        }
    }

    AppState.updateLastSnapshot();
    autoSave();

    section.style.boxShadow = "0 0 10px var(--gold)";
    setTimeout(() => section.style.boxShadow = "", 500);
}

/**
 * 모든 캐릭터 잠금
 */
function lockAllCharacters() {
    const allSections = document.querySelectorAll('.char-section');

    if (allSections.length === 0) return;

    if (confirm("모든 캐릭터를 잠금 상태로 변경하시겠습니까?")) {
        allSections.forEach(section => {
            const charId = section.id;
            toggleEdit(charId, true);
        });

        const statusMsg = document.getElementById('statusMsg');
        if (statusMsg) {
            statusMsg.innerText = "🔒 모든 캐릭터가 잠겼습니다.";
            setTimeout(() => statusMsg.innerText = "", 2000);
        }
    }
}

/**
 * 편집 잠금/해제 토글
 */
function toggleEdit(charId, isLock) {
    const section = document.getElementById(charId);
    if (!section) return;

    const lockBtn = section.querySelector('.lock-btn');
    const unlockBtn = section.querySelector('.unlock-btn');
    const actionBtns = section.querySelectorAll('.btn-action');
    const delBtn = section.querySelector('.del-btn');

    const inputs = section.querySelectorAll('input, select, textarea');

    inputs.forEach(el => {
        if (el === lockBtn || el === unlockBtn) return;

        if (isLock) {
            if (el.tagName === 'SELECT') {
                el.disabled = true;
            } else {
                el.readOnly = true;
            }
            el.style.cursor = "default";
        } else {
            el.disabled = false;
            el.readOnly = false;

            if (el.tagName === 'SELECT' || el.type === 'button') {
                el.style.cursor = "pointer";
            } else {
                el.style.cursor = "text";
            }
        }
    });

    [...actionBtns, delBtn].forEach(btn => {
        if (btn) {
            btn.disabled = isLock;
            btn.style.opacity = isLock ? "0.5" : "1";
            btn.style.pointerEvents = isLock ? "none" : "auto";
        }
    });

    if (isLock) {
        lockBtn?.classList.add('btn-active');
        unlockBtn?.classList.remove('btn-active');
    } else {
        lockBtn?.classList.remove('btn-active');
        unlockBtn?.classList.add('btn-active');
    }

    autoSave();
}