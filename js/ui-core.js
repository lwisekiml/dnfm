// ============================================
// ui-core.js - 핵심 UI 기능 (중복 제거 완료)
// ============================================

/**
 * project1 info_job/info_name 변경 시 project2 characters 배열 즉시 동기화
 * - merged.html 템플릿의 info_job, info_name oninput 에서 호출
 */
function syncCharInfoToP2(el) {
    const section = el.closest('.char-section');
    if (!section) return;
    const charId = section.id;
    const key = el.getAttribute('data-key');
    const val = el.value;

    if (typeof characters !== 'undefined') {
        const char = characters.find(c => c.id === charId);
        if (char) {
            if (key === 'info_job') char.job = val;
            if (key === 'info_name') char.name = val;
            // project2 캐릭터 목록 버튼 즉시 갱신
            if (typeof renderCharacterList === 'function') renderCharacterList();
        }
    }

    autoSave();
}

/**
 * 마법봉인 변경 처리
 */
function handleSealChange(el) {
    const key = el.getAttribute('data-key');
    const slot = el.getAttribute('data-slot');
    const row = el.closest('tr');
    const opt = el.value;

    // 1. 고유 옵션 (seal1) 수치 자동 입력
    if (key.includes("_seal1")) {
        const vIn = row.querySelector(`input[data-key="${slot}_seal1_val"]`);
        if (!vIn) return;

        const value = DataTables.getSealValue(SlotUtils.getSlotType(slot), opt, 1);
        if (value) vIn.value = value;
    }

    // 2. 일반 옵션 (seal2) 수치 자동 입력
    if (key.includes("_seal2")) {
        const vIn = row.querySelector(`input[data-key="${slot}_seal2_val"]`);
        if (!vIn) return;

        const value = DataTables.getSealValue(SlotUtils.getSlotType(slot), opt, 2);
        if (value) vIn.value = value;
    }

    // 3. 힘지능/속강 선택지에 따른 노란색 강조 실행
    const charSection = el.closest('.char-section');
    if (charSection) {
        applySealHighlight(charSection.id);
    }

    autoSave();
}

/**
 * 세트 체크 실행
 */
function runSetCheck(slot, charId) {
    const slotType = SlotUtils.getSlotType(slot);
    if (slotType === 'armor') checkSetColor(charId, 'armor');
    else if (slotType === 'accessory') checkSetColor(charId, 'accessory');
    else if (slotType === 'special') checkSetColor(charId, 'special');
}

/**
 * 세트 색상 체크 (통합 버전)
 * 3개 함수를 1개로 통합하여 중복 제거
 */
function checkSetColor(charId, setType) {
    const section = document.getElementById(charId);
    if (!section) return;

    // 세트 타입별 설정
    const setConfig = {
        armor: {
            slots: ["상의", "하의", "어깨", "벨트", "신발"],
            sets: armorSets,
            requireRarity: false
        },
        accessory: {
            slots: ["팔찌", "목걸이", "반지"],
            sets: accSets,
            requireRarity: true,
            requiredRarity: "에픽"
        },
        special: {
            slots: ["귀걸이", "마법석", "보조장비"],
            sets: specialSets,
            requireRarity: true,
            requiredRarity: "에픽"
        }
    };

    const config = setConfig[setType];
    if (!config) return;

    // 1. 현재 장착 아이템 수집
    const currentItems = {};
    let isAllCorrectRarity = true;

    config.slots.forEach(slot => {
        if (config.requireRarity) {
            const raritySel = section.querySelector(`select[data-key="${slot}_rarity"]`);
            const rarity = raritySel ? raritySel.value : "";
            if (rarity !== config.requiredRarity) {
                isAllCorrectRarity = false;
            }
        }

        const nameEl = section.querySelector(`[data-key="${slot}_itemname"]`);
        const name = nameEl ? nameEl.value.trim() : "";
        if (name) currentItems[slot] = name;
    });

    // 2. 세트 카운팅
    const setCounts = {};
    const slotToSetName = {};

    for (const [setName, setList] of Object.entries(config.sets)) {
        setCounts[setName] = 0;
        config.slots.forEach(slot => {
            const itemName = currentItems[slot];
            if (itemName && setList.includes(itemName)) {
                setCounts[setName]++;
                slotToSetName[slot] = setName;
            }
        });
    }

    // 3. 세트 효과 활성화 여부 확인
    let isSetComplete = false;
    if (!config.requireRarity || isAllCorrectRarity) {
        for (const setName in setCounts) {
            if (setCounts[setName] >= 3) {
                isSetComplete = true;
                break;
            }
        }
    }

    // 4. 하이라이트 적용
    config.slots.forEach(slot => {
        const nameEl = section.querySelector(`[data-key="${slot}_itemname"]`);
        if (!nameEl) return;

        if (isSetComplete) {
            nameEl.style.setProperty('color', '#71D2E5', 'important');
            nameEl.style.fontWeight = 'bold';
            const setName = slotToSetName[slot];
            if (setName) {
                nameEl.title = `${setName} 세트 효과 활성화 (${setCounts[setName]}셋)`;
            }
        } else {
            nameEl.style.color = "";
            nameEl.style.fontWeight = "";
            nameEl.title = "";
        }
    });
}

/**
 * 호환성을 위한 래퍼 함수들
 */
function checkArmorSetColor(charId) {
    checkSetColor(charId, 'armor');
}

function checkAccSetColor(charId) {
    checkSetColor(charId, 'accessory');
}

function checkSpecialSetColor(charId) {
    checkSetColor(charId, 'special');
}

/**
 * 봉인 하이라이트 적용
 */
function applySealHighlight(charId) {
    const section = document.getElementById(charId);
    if (!section) return;

    const statType = section.querySelector(`select[data-key="info_stat_type"]`)?.value || "";
    const eleType = section.querySelector(`select[data-key="info_ele_type"]`)?.value || "";

    const armorSlots = ["상의", "어깨", "하의", "신발", "벨트"];
    const accSlots = ["목걸이", "팔찌", "반지"];
    const specialSlots = ["보조장비", "귀걸이", "마법석"];
    const embHighlightSlots = ["보조장비", "귀걸이", "마법석", "칭호"];

    const rows = Array.from(section.querySelectorAll('tr'));
    const rowMap = {};
    rows.forEach(r => {
        const slotName = r.querySelector('.col-slot')?.innerText;
        if (slotName) rowMap[slotName] = r;
    });

    slots.forEach(slot => {
        if (slot === "스킬룬" || slot === "크리쳐") return;
        const row = rowMap[slot];
        if (!row) return;

        const s1 = row.querySelector(`select[data-key="${slot}_seal1"]`);
        const v1 = row.querySelector(`input[data-key="${slot}_seal1_val"]`);
        const s2 = row.querySelector(`select[data-key="${slot}_seal2"]`);
        const v2 = row.querySelector(`input[data-key="${slot}_seal2_val"]`);
        const emb1 = row.querySelector(`[data-key="${slot}_emb1"]`);
        const emb2 = row.querySelector(`[data-key="${slot}_emb2"]`);

        [s1, v1, s2, v2, emb1, emb2].forEach(el =>
            el?.classList.remove('highlight-yellow')
        );

        if (s1 && s2) {
            if (slot === "무기" && statType) {
                if (s1.value === "데미지 증가") {
                    s1.classList.add('highlight-yellow');
                    v1?.classList.add('highlight-yellow');
                }
                if (s2.value === statType) {
                    s2.classList.add('highlight-yellow');
                    v2?.classList.add('highlight-yellow');
                }
            }

            if ((armorSlots.includes(slot) || specialSlots.includes(slot)) && statType) {
                if (s1.value === statType) {
                    s1.classList.add('highlight-yellow');
                    v1?.classList.add('highlight-yellow');
                }
                if (s2.value === statType) {
                    s2.classList.add('highlight-yellow');
                    v2?.classList.add('highlight-yellow');
                }
            }

            if (accSlots.includes(slot) && eleType) {
                if (s1.value === eleType) {
                    s1.classList.add('highlight-yellow');
                    v1?.classList.add('highlight-yellow');
                }
                if (s2.value === eleType) {
                    s2.classList.add('highlight-yellow');
                    v2?.classList.add('highlight-yellow');
                }
            }
        }

        if (embHighlightSlots.includes(slot) && eleType) {
            if (emb1 && (emb1.value === eleType || emb1.value === "모속강")) {
                emb1.classList.add('highlight-yellow');
                emb2?.classList.add('highlight-yellow');
            }
        }
    });
}

/**
 * 스타일 업데이트
 */
function updateStyle(el, type, isInitial = false) {
    const row = el.closest('tr');
    let slot = el.getAttribute('data-slot');

    if (!slot) {
        const slotCell = el.closest('tr')?.querySelector('.col-slot');
        if (slotCell) slot = slotCell.innerText.trim();
    }

    const section = el.closest('.char-section');
    const charId = section.id;

    el.className = Array.from(el.classList)
        .filter(c =>
            !c.startsWith('rare-') &&
            !c.startsWith('ex-') &&
            !c.startsWith('bg-') &&
            c !== 'prefix-selected' &&
            c !== 'prefix-tier'
        ).join(' ');

    if (el.value) {
        if (type === 'rarity') {
            const rarityClass = 'rare-' + el.value;
            el.classList.add(rarityClass);

            const nameEl = row.querySelector(`[data-key="${slot}_itemname"]`);

            if (type === 'rarity' && slot === "크리쳐") {
                const creatureNameEl = row.querySelector('[data-key="크리쳐_name"]');
                if (creatureNameEl) {
                    creatureNameEl.className = Array.from(creatureNameEl.classList)
                        .filter(c => !c.startsWith('rare-')).join(' ');
                    creatureNameEl.classList.add('rare-' + el.value);
                }
            }

            if (nameEl) {
                nameEl.className = Array.from(nameEl.classList)
                    .filter(c => !c.startsWith('rare-')).join(' ');
                nameEl.classList.add(rarityClass);
                nameEl.classList.add('itemname-color-sync');
            }

            const prefixSel = row.querySelector(`select[data-key="${slot}_prefix"]`);
            if (prefixSel) {
                const savedPrefixValue = prefixSel.getAttribute('data-saved-value') || prefixSel.value;

                const accSlots = ["목걸이", "팔찌", "반지"];
                const specialSlots = ["보조장비", "귀걸이", "마법석"];

                let optionsHTML = "";
                if (slot === "무기" && el.value === "에픽") {
                    const weaponEpicPrefixes = ["", "광채", "분쇄", "선명", "강타"];
                    optionsHTML = weaponEpicPrefixes.map(p => `<option value="${p}">${p}</option>`).join('');
                } else if (el.value === "티어") {
                    optionsHTML = tierPrefixes.map(p => `<option value="${p}">${p}</option>`).join('');
                } else if (accSlots.includes(slot)) {
                    optionsHTML = accPrefixes.map(p => `<option value="${p}">${p}</option>`).join('');
                } else if (specialSlots.includes(slot)) {
                    optionsHTML = specPrefixes.map(p => `<option value="${p}">${p}</option>`).join('');
                } else {
                    optionsHTML = armorPrefixes.map(p => `<option value="${p}">${p}</option>`).join('');
                }

                prefixSel.innerHTML = optionsHTML;
                if (savedPrefixValue) prefixSel.value = savedPrefixValue;

                updateStyle(prefixSel, 'prefix', isInitial);
            }

            if (nameEl && itemOptions[slot]) {
                replaceItemNameField(nameEl.parentElement, slot, el.value, nameEl.value, charId);
            }
            runSetCheck(slot, charId);
        }

        else if (type === 'exceed') {
            el.classList.remove('ex-이상', 'ex-선봉', 'ex-의지');
            if (el.value) el.classList.add('ex-' + el.value);

            const nameEl = row.querySelector(`[data-key="${slot}_itemname"]`);
            if (nameEl) {
                if (el.value !== "") {
                    nameEl.classList.add('ex-itemname-light');
                } else {
                    nameEl.classList.remove('ex-itemname-light');
                }
            }

            if (typeof runSetCheck === "function") runSetCheck(slot, charId);
        }

        else if (type === 'prefix') {
            el.classList.remove('p-blue', 'p-red', 'p-green', 'p-yellow');

            if (el.value.startsWith('T')) {
                el.classList.add('prefix-tier');
            } else if (el.value !== "") {
                el.classList.add('prefix-selected');

                if (slot === "무기") {
                    if (el.value === "광채") el.classList.add('p-blue');
                    if (el.value === "분쇄") el.classList.add('p-red');
                    if (el.value === "선명") el.classList.add('p-green');
                    if (el.value === "강타") el.classList.add('p-yellow');
                }
            }
        }

        else if (type === 'artBg') {
            el.classList.add('bg-' + el.value);
            const optSelect = el.parentElement.querySelector('.art-opt-select');
            if (optSelect) optSelect.className = 'art-opt-select bg-' + el.value;
        }

    }

    if (!isInitial) autoSave();
}

/**
 * 아이템 이름 필드 교체
 */
function replaceItemNameField(parentTd, slot, rarity, value, charId) {
    const oldEl = parentTd.querySelector(`[data-key="${slot}_itemname"]`);
    if (oldEl) oldEl.remove();

    const section = document.getElementById(charId);
    const isLocked = section?.querySelector('.lock-btn')?.classList.contains('btn-active');

    let newEl;
    if (rarity === "에픽") {
        newEl = document.createElement('select');
        newEl.innerHTML = `<option value=""></option>` +
            (itemOptions[slot] || []).map(opt =>
                `<option value="${opt}">${opt}</option>`
            ).join('');

        if (isLocked) newEl.disabled = true;
    } else {
        newEl = document.createElement('input');
        newEl.type = 'text';

        if (isLocked) {
            newEl.readOnly = true;
            newEl.style.cursor = "default";
        }
    }

    newEl.value = value || "";
    newEl.setAttribute('data-key', `${slot}_itemname`);
    newEl.className = `rare-${rarity} itemname-color-sync`;

    newEl.addEventListener('change', () => {
        runSetCheck(slot, charId);
        autoSave();
    });
    newEl.addEventListener('input', () => {
        runSetCheck(slot, charId);
        autoSave();
    });

    parentTd.appendChild(newEl);

    runSetCheck(slot, charId);

    const exceedSel = parentTd.closest('tr').querySelector(`select[data-key="${slot}_exceed"]`);
    if (exceedSel && exceedSel.value !== "") {
        newEl.classList.add('ex-itemname-light');
    }
}

// ============================================
// 세트 아이템 메뉴
// ============================================

/**
 * 아이템이름 헤더 버튼 클릭 시 세트 목록 표시
 */
function openSetMenuFromHeader(event, charId) {
    closeSetContextMenu();

    const menu = document.createElement('div');
    menu.id = 'setContextMenu';
    menu.style.cssText = `
        position: fixed;
        z-index: 9999;
        background: #1a1a1a;
        border: 2px solid #ffd700;
        border-radius: 6px;
        padding: 6px 0;
        box-shadow: 0 8px 24px rgba(0,0,0,0.9);
        min-width: 220px;
        max-height: 500px;
        overflow-y: auto;
    `;

    const sections = [
        { label: '🛡️ 방어구', setsMap: armorSets,    slotType: 'armor' },
        { label: '💍 악세서리', setsMap: accSets,     slotType: 'accessory' },
        { label: '⚙️ 특수장비', setsMap: specialSets, slotType: 'special' },
    ];

    sections.forEach(({ label, setsMap, slotType }) => {
        const header = document.createElement('div');
        header.textContent = label;
        header.style.cssText = `
            padding: 6px 14px; color: #ffd700; font-weight: bold;
            font-size: 12px; border-bottom: 1px solid #333; margin-top: 4px;
        `;
        menu.appendChild(header);

        Object.keys(setsMap).forEach(setName => {
            const item = document.createElement('div');
            item.textContent = setName;
            item.style.cssText = `padding: 7px 20px; color: #fff; font-size: 12px; cursor: pointer;`;
            item.onmouseenter = () => item.style.background = '#333';
            item.onmouseleave = () => item.style.background = '';
            item.onclick = () => { applySetItems(charId, slotType, setsMap, setName); closeSetContextMenu(); };
            item.ontouchend = (e) => { e.preventDefault(); applySetItems(charId, slotType, setsMap, setName); closeSetContextMenu(); };
            menu.appendChild(item);
        });
    });

    menu.style.left = event.clientX + 'px';
    menu.style.top  = event.clientY + 'px';
    document.body.appendChild(menu);

    const rect = menu.getBoundingClientRect();
    if (rect.right  > window.innerWidth)  menu.style.left = (event.clientX - rect.width)  + 'px';
    if (rect.bottom > window.innerHeight) menu.style.top  = (event.clientY - rect.height) + 'px';

    const outsideHandler = (e) => {
        if (!menu.contains(e.target)) {
            closeSetContextMenu();
            document.removeEventListener('click', outsideHandler);
        }
    };
    setTimeout(() => document.addEventListener('click', outsideHandler), 0);
}

/**
 * 세트 메뉴 닫기
 */
function closeSetContextMenu() {
    const menu = document.getElementById('setContextMenu');
    if (menu) menu.remove();
}

/**
 * 슬롯에 맞는 아이템 찾기 (itemOptions 기반 - 마지막 매칭 반환)
 */
function getMatchedItemForSlot(slot, itemList) {
    const slotOptions = itemOptions[slot] || [];
    let matched = null;
    itemList.forEach(item => {
        if (slotOptions.includes(item)) matched = item;
    });
    return matched;
}

/**
 * 세트 아이템 전체 적용
 */
function applySetItems(charId, slotType, setsMap, setName) {
    const section = document.getElementById(charId);
    if (!section) return;

    const itemList = setsMap[setName];
    const slots = slotType === 'armor'     ? SlotUtils.ARMOR_SLOTS
        : slotType === 'accessory' ? SlotUtils.ACCESSORY_SLOTS
            : SlotUtils.SPECIAL_SLOTS;

    slots.forEach(slot => {
        const matched = getMatchedItemForSlot(slot, itemList);
        if (!matched) return;
        const nameEl = section.querySelector(`[data-key="${slot}_itemname"]`);
        if (nameEl) {
            nameEl.value = matched;
            nameEl.dispatchEvent(new Event('change'));
        }
    });

    runSetCheck(slots[0], charId);
    autoSave();
}

// ============================================
// 접두어 일괄 적용 메뉴
// ============================================

/**
 * 접두어 헤더 버튼 클릭 시 접두어 목록 표시
 */
function openPrefixMenuFromHeader(event, charId) {
    closeSetContextMenu();

    const menu = document.createElement('div');
    menu.id = 'setContextMenu';
    menu.style.cssText = `
        position: fixed;
        z-index: 9999;
        background: #1a1a1a;
        border: 2px solid #ffd700;
        border-radius: 6px;
        padding: 6px 0;
        box-shadow: 0 8px 24px rgba(0,0,0,0.9);
        min-width: 180px;
        max-height: 500px;
        overflow-y: auto;
    `;

    const sections = [
        { label: '🛡️ 방어구', prefixList: armorPrefixes, slots: SlotUtils.ARMOR_SLOTS },
        { label: '💍 악세서리', prefixList: accPrefixes, slots: SlotUtils.ACCESSORY_SLOTS },
        { label: '⚙️ 특수장비', prefixList: specPrefixes, slots: SlotUtils.SPECIAL_SLOTS },
    ];

    sections.forEach(({ label, prefixList, slots }) => {
        const header = document.createElement('div');
        header.textContent = label;
        header.style.cssText = `
            padding: 6px 14px; color: #ffd700; font-weight: bold;
            font-size: 12px; border-bottom: 1px solid #333; margin-top: 4px;
        `;
        menu.appendChild(header);

        prefixList.filter(p => p !== '').forEach(prefix => {
            const item = document.createElement('div');
            item.textContent = prefix;
            item.style.cssText = `padding: 7px 20px; color: #fff; font-size: 12px; cursor: pointer;`;
            item.onmouseenter = () => item.style.background = '#333';
            item.onmouseleave = () => item.style.background = '';

            const apply = () => {
                applyPrefixToSlots(charId, slots, prefix);
                closeSetContextMenu();
            };
            item.onclick = apply;
            item.ontouchend = (e) => { e.preventDefault(); apply(); };
            menu.appendChild(item);
        });
    });

    menu.style.left = event.clientX + 'px';
    menu.style.top  = event.clientY + 'px';
    document.body.appendChild(menu);

    const rect = menu.getBoundingClientRect();
    if (rect.right  > window.innerWidth)  menu.style.left = (event.clientX - rect.width)  + 'px';
    if (rect.bottom > window.innerHeight) menu.style.top  = (event.clientY - rect.height) + 'px';

    const outsideHandler = (e) => {
        if (!menu.contains(e.target)) {
            closeSetContextMenu();
            document.removeEventListener('click', outsideHandler);
        }
    };
    setTimeout(() => document.addEventListener('click', outsideHandler), 0);
}

/**
 * 해당 슬롯들에 접두어 일괄 적용
 */
function applyPrefixToSlots(charId, slots, prefix) {
    const section = document.getElementById(charId);
    if (!section) return;

    slots.forEach(slot => {
        const prefixSel = section.querySelector(`select[data-key="${slot}_prefix"]`);
        if (prefixSel) {
            prefixSel.value = prefix;
            prefixSel.dispatchEvent(new Event('change'));
        }
    });

    autoSave();
}

// ============================================
// 강화 일괄 적용 메뉴
// ============================================

/**
 * 강화 헤더 버튼 클릭 시 숫자 목록 표시
 */
function openReinforceMenuFromHeader(event, charId) {
    closeSetContextMenu();

    const menu = document.createElement('div');
    menu.id = 'setContextMenu';
    menu.style.cssText = `
        position: fixed;
        z-index: 9999;
        background: #1a1a1a;
        border: 2px solid #ffd700;
        border-radius: 6px;
        padding: 6px 0;
        box-shadow: 0 8px 24px rgba(0,0,0,0.9);
        min-width: 120px;
        max-height: 500px;
        overflow-y: auto;
    `;

    const header = document.createElement('div');
    header.textContent = '⚔️ 강화 일괄 적용';
    header.style.cssText = `
        padding: 6px 14px; color: #ffd700; font-weight: bold;
        font-size: 12px; border-bottom: 1px solid #333; margin-bottom: 4px;
    `;
    menu.appendChild(header);

    const allSlots = [...SlotUtils.ARMOR_SLOTS, ...SlotUtils.ACCESSORY_SLOTS, ...SlotUtils.SPECIAL_SLOTS];

    for (let i = 1; i <= 20; i++) {
        const item = document.createElement('div');
        item.textContent = `+${i}`;
        item.style.cssText = `padding: 7px 20px; color: #fff; font-size: 12px; cursor: pointer;`;
        item.onmouseenter = () => item.style.background = '#333';
        item.onmouseleave = () => item.style.background = '';

        const apply = () => {
            applyReinforceToSlots(charId, allSlots, String(i));
            closeSetContextMenu();
        };
        item.onclick = apply;
        item.ontouchend = (e) => { e.preventDefault(); apply(); };
        menu.appendChild(item);
    }

    menu.style.left = event.clientX + 'px';
    menu.style.top  = event.clientY + 'px';
    document.body.appendChild(menu);

    const rect = menu.getBoundingClientRect();
    if (rect.right  > window.innerWidth)  menu.style.left = (event.clientX - rect.width)  + 'px';
    if (rect.bottom > window.innerHeight) menu.style.top  = (event.clientY - rect.height) + 'px';

    const outsideHandler = (e) => {
        if (!menu.contains(e.target)) {
            closeSetContextMenu();
            document.removeEventListener('click', outsideHandler);
        }
    };
    setTimeout(() => document.addEventListener('click', outsideHandler), 0);
}

/**
 * 해당 슬롯들에 강화 수치 일괄 적용
 */
function applyReinforceToSlots(charId, slots, value) {
    const section = document.getElementById(charId);
    if (!section) return;

    slots.forEach(slot => {
        const el = section.querySelector(`input[data-key="${slot}_reinforce"]`);
        if (el) el.value = value;
    });

    autoSave();
}

console.log("✅ ui-core.js 로드 완료");