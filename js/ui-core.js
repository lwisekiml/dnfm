// ============================================
// ui-core.js - 핵심 UI 기능
// ============================================

/**
 * 마법봉인 변경 처리
 */
function handleSealChange(el) {
    const key = el.getAttribute('data-key');
    const slot = el.getAttribute('data-slot');
    const row = el.closest('tr');
    const opt = el.value;
    const armors = ["상의", "어깨", "하의", "신발", "벨트"];
    const accs = ["목걸이", "팔찌", "반지"];
    const specials = ["보조장비", "귀걸이", "마법석"];
    const commonValTable = {
        "힘": "46",
        "지능": "46",
        "체력": "46",
        "정신력": "46",
        "공격속도": "1.6",
        "캐스팅속도": "2",
        "이동속도": "1.6",
        "최대 HP 증가": "456",
        "최대 MP 증가": "270",
        "물리 방어력": "234",
        "마법 방어력": "178",
        "적중": "124",
        "회피": "70"
    };

    // ===== 1. 고유 옵션 (seal1) 수치 자동 입력 =====
    if (key.includes("_seal1")) {
        const vIn = row.querySelector(`input[data-key="${slot}_seal1_val"]`);
        if (!vIn) return;
        if (slot === "무기") {
            const weaponTable = {
                "데미지 증가": "8",
                "추가 데미지": "8",
                "모든 직업 50레벨스킬": "1",
                "화속강": "10",
                "수속강": "10",
                "명속강": "10",
                "암속강": "10",
                "힘": "46",
                "지능": "46",
                "물리 공격력": "19",
                "마법 공격력": "19"
            };
            if (weaponTable[opt]) vIn.value = weaponTable[opt];
        } else if (armors.includes(slot)) {
            const armorTable = {"힘": "46", "지능": "46", "체력": "46", "정신력": "46", "물리 크리티컬": "29", "마법 크리티컬": "29"};
            if (armorTable[opt]) vIn.value = armorTable[opt];
        } else if (accs.includes(slot)) {
            const accTable = {
                "화속강": "10",
                "수속강": "10",
                "명속강": "10",
                "암속강": "10",
                "힘": "46",
                "지능": "46",
                "체력": "46",
                "정신력": "46"
            };
            if (accTable[opt]) vIn.value = accTable[opt];
        } else if (specials.includes(slot)) {
            const specTable = {
                "물리 공격력": "19",
                "마법 공격력": "19",
                "힘": "46",
                "지능": "46",
                "물리 크리티컬": "60",
                "마법 크리티컬": "60",
                "적중": "75",
                "회피": "75"
            };
            if (specTable[opt]) vIn.value = specTable[opt];
        }
    }

    // ===== 2. 일반 옵션 (seal2) 수치 자동 입력 =====
    if (key.includes("_seal2")) {
        const vIn = row.querySelector(`input[data-key="${slot}_seal2_val"]`);
        if (!vIn) return;
        if (slot === "무기") {
            if (opt === "물리 공격력" || opt === "마법 공격력") vIn.value = "18";
            else if (commonValTable[opt]) vIn.value = commonValTable[opt];
        } else if (armors.includes(slot)) {
            if (opt === "물리 크리티컬" || opt === "마법 크리티컬") vIn.value = "30";
            else if (commonValTable[opt]) vIn.value = commonValTable[opt];
        } else if (accs.includes(slot)) {
            const resTable = {
                "화속성 저항": "8",
                "수속성 저항": "8",
                "명속성 저항": "8",
                "암속성 저항": "8",
                "화속강": "8",
                "수속강": "8",
                "명속강": "8",
                "암속강": "8"
            };
            if (resTable[opt]) vIn.value = resTable[opt];
            else if (commonValTable[opt]) vIn.value = commonValTable[opt];
        } else if (specials.includes(slot)) {
            if (opt === "물리 공격력" || opt === "마법 공격력") vIn.value = "18";
            else if (opt === "물리 크리티컬" || opt === "마법 크리티컬") vIn.value = "30";
            else if (commonValTable[opt]) vIn.value = commonValTable[opt];
        }
    }

    // ===== 3. 힘지능/속강 선택지에 따른 노란색 강조 실행 =====
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
    if (slotType === 'armor') checkArmorSetColor(charId);
    else if (slotType === 'accessory') checkAccSetColor(charId);
    else if (slotType === 'special') checkSpecialSetColor(charId);
}

/**
 * 방어구 세트 색상 체크
 */
function checkArmorSetColor(charId) {
    const section = document.getElementById(charId);
    if (!section) return;

    const checkSlots = [
        "상의", "하의", "어깨", "벨트", "신발",
        "목걸이", "팔찌", "반지",
        "보조장비", "귀걸이", "마법석"
    ];

    const currentItems = {};
    checkSlots.forEach(slot => {
        const el = section.querySelector(`[data-key="${slot}_itemname"]`);
        if (el && el.value.trim()) {
            currentItems[slot] = el.value.trim();
        }
    });

    const setCounts = {};
    const slotToSetName = {};

    for (const [setName, setList] of Object.entries(armorSets)) {
        setCounts[setName] = 0;
        checkSlots.forEach(slot => {
            const itemName = currentItems[slot];
            if (itemName && setList.includes(itemName)) {
                setCounts[setName]++;
                slotToSetName[slot] = setName;
            }
        });
    }

    checkSlots.forEach(slot => {
        const el = section.querySelector(`[data-key="${slot}_itemname"]`);
        if (!el) return;

        const setName = slotToSetName[slot];
        if (setName && setCounts[setName] >= 3) {
            el.style.setProperty("color", "#71D2E5", "important");
            el.style.fontWeight = "bold";
            el.title = `${setName} 세트 효과 활성화 (${setCounts[setName]}셋)`;
        } else {
            el.style.color = "";
            el.style.fontWeight = "";
            el.title = "";
        }
    });
}

/**
 * 악세서리 세트 색상 체크
 */
function checkAccSetColor(charId) {
    const section = document.getElementById(charId);
    if (!section) return;

    const accSlots = ["팔찌", "목걸이", "반지"];
    let equippedItems = [];
    let isAllEpic = true;

    accSlots.forEach(slot => {
        const raritySel = section.querySelector(`select[data-key="${slot}_rarity"]`);
        const nameEl = section.querySelector(`[data-key="${slot}_itemname"]`);

        const rarity = raritySel ? raritySel.value : "";
        const name = nameEl ? nameEl.value.trim() : "";

        if (rarity !== "에픽") isAllEpic = false;
        if (name) equippedItems.push(name);
    });

    let isSetComplete = false;
    if (isAllEpic && equippedItems.length >= 3) {
        for (const setName in accSets) {
            const setList = accSets[setName];
            const matchCount = equippedItems.filter(item => setList.includes(item)).length;
            if (matchCount >= 3) {
                isSetComplete = true;
                break;
            }
        }
    }

    accSlots.forEach(slot => {
        const nameEl = section.querySelector(`[data-key="${slot}_itemname"]`);
        if (nameEl) {
            if (isSetComplete) {
                nameEl.style.setProperty('color', '#71D2E5', 'important');
            } else {
                nameEl.style.color = "";
            }
        }
    });
}

/**
 * 특수장비 세트 색상 체크
 */
function checkSpecialSetColor(charId) {
    const section = document.getElementById(charId);
    if (!section) return;

    const specialSlots = ["귀걸이", "마법석", "보조장비"];
    let equippedItems = [];
    let isAllEpic = true;

    specialSlots.forEach(slot => {
        const raritySel = section.querySelector(`select[data-key="${slot}_rarity"]`);
        const nameEl = section.querySelector(`[data-key="${slot}_itemname"]`);

        const rarity = raritySel ? raritySel.value : "";
        const name = nameEl ? nameEl.value.trim() : "";

        if (rarity !== "에픽") isAllEpic = false;
        if (name) equippedItems.push(name);
    });

    let isSetComplete = false;
    if (isAllEpic && equippedItems.length >= 3) {
        for (const setName in specialSets) {
            const setList = specialSets[setName];
            const matchCount = equippedItems.filter(item => setList.includes(item)).length;
            if (matchCount >= 3) {
                isSetComplete = true;
                break;
            }
        }
    }

    specialSlots.forEach(slot => {
        const nameEl = section.querySelector(`[data-key="${slot}_itemname"]`);
        if (nameEl) {
            if (isSetComplete) {
                nameEl.style.setProperty('color', '#71D2E5', 'important');
            } else {
                nameEl.style.color = "";
            }
        }
    });
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

            const colorSyncSlots = ["칭호", "외형칭호", "오라", "아바타"];
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
                    optionsHTML = prefixes.map(p => `<option value="${p}">${p}</option>`).join('');
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