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

    // 3. 세트 효과 활성화된 세트명 목록 수집
    // 방어구: 3개 이상이면 세트 효과, 악세/특장: 3개(풀세트)이면 세트 효과
    const activeSetNames = new Set();
    if (!config.requireRarity || isAllCorrectRarity) {
        for (const setName in setCounts) {
            if (setCounts[setName] >= 3) {
                activeSetNames.add(setName);
            }
        }
    }

    // 4. 하이라이트 적용
    // - 해당 슬롯이 활성화된 세트에 속한 경우만 파란색
    // - 세트에 속하지 않거나 세트 효과 미달이면 색상 제거
    config.slots.forEach(slot => {
        const nameEl = section.querySelector(`[data-key="${slot}_itemname"]`);
        if (!nameEl) return;

        const setName = slotToSetName[slot];
        if (setName && activeSetNames.has(setName)) {
            nameEl.style.setProperty('color', '#71D2E5', 'important');
            nameEl.style.fontWeight = 'bold';
            nameEl.title = `${setName} 세트 효과 활성화 (${setCounts[setName]}셋)`;
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

    // 현재 캐릭터 데이터 (보유 아이템)
    let char = (typeof characters !== 'undefined') ? characters.find(c => c.id === charId) : null;
    if (!char && typeof characters !== 'undefined') {
        const sec = document.getElementById(charId);
        if (sec) {
            const jobVal  = sec.querySelector('[data-key="info_job"]')?.value  || '';
            const nameVal = sec.querySelector('[data-key="info_name"]')?.value || '';
            char = characters.find(c =>
                (jobVal  && c.job  === jobVal ) ||
                (nameVal && c.name === nameVal)
            ) || null;
        }
    }

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
        min-width: 280px;
        width: max-content;
        max-width: 90vw;
        overflow-y: auto;
        overscroll-behavior: contain;
        -webkit-overflow-scrolling: touch;
        touch-action: pan-y;
        box-sizing: border-box;
    `;
    menu.addEventListener('wheel', (e) => {
        const atTop    = menu.scrollTop === 0;
        const atBottom = menu.scrollTop + menu.clientHeight >= menu.scrollHeight - 1;
        if (!(atTop && e.deltaY < 0) && !(atBottom && e.deltaY > 0)) {
            e.stopPropagation();
        }
        if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) return;
        e.preventDefault();
        menu.scrollTop += e.deltaY;
    }, { passive: false });
    let _menuTouchStartY = 0;
    menu.addEventListener('touchstart', (e) => { _menuTouchStartY = e.touches[0].clientY; }, { passive: true });
    menu.addEventListener('touchmove', (e) => {
        const dy = e.touches[0].clientY - _menuTouchStartY;
        const atTop    = menu.scrollTop === 0;
        const atBottom = menu.scrollTop + menu.clientHeight >= menu.scrollHeight - 1;
        if ((atTop && dy > 0) || (atBottom && dy < 0)) return;
        e.stopPropagation();
    }, { passive: true });

    function getOwnedSlotsSimple(setName, setsMap, slotTypeSlots) {
        if (!char) return { count: 0, items: [] };
        const itemList = setsMap[setName] || [];
        const owned = [];
        const counts = char.armorCounts || {};
        const countKeys = Object.keys(counts).filter(k => (counts[k] || 0) > 0);

        slotTypeSlots.forEach(slot => {
            const slotSuffix = ' ' + slot;
            let hasIt = false;
            let displayItem = getMatchedItemForSlot(slot, itemList) || (setName + ' ' + slot);

            if (counts[setName + slotSuffix] > 0) {
                hasIt = true;
            }

            if (!hasIt) {
                hasIt = itemList.some(item => {
                    if ((counts[item] || 0) > 0) return true;
                    return false;
                });
            }

            if (!hasIt) {
                hasIt = countKeys.some(k => {
                    if (!k.endsWith(slotSuffix)) return false;
                    const namepart = k.slice(0, k.length - slotSuffix.length);
                    return namepart === setName || namepart.includes(': ' + setName) || namepart.endsWith(': ' + setName);
                });
            }

            if (!hasIt) {
                const slotItems = itemList.filter(item => item.endsWith(slotSuffix) || item.endsWith(slot));
                hasIt = slotItems.some(item => (counts[item] || 0) > 0);
                if (hasIt) {
                    const found = slotItems.find(item => (counts[item] || 0) > 0);
                    if (found) displayItem = found;
                }
            }

            if (hasIt) owned.push({ slot, item: displayItem });
        });
        return { count: owned.length, items: owned };
    }

    const sections = [
        { label: '🛡️ 방어구', setsMap: armorSets,    slotType: 'armor',     slotTypeSlots: SlotUtils.ARMOR_SLOTS,     fullSize: 5 },
        { label: '💍 악세서리', setsMap: accSets,     slotType: 'accessory', slotTypeSlots: SlotUtils.ACCESSORY_SLOTS, fullSize: 3 },
        { label: '⚙️ 특수장비', setsMap: specialSets, slotType: 'special',   slotTypeSlots: SlotUtils.SPECIAL_SLOTS,   fullSize: 3 },
    ];

    sections.forEach(({ label, setsMap, slotType, slotTypeSlots, fullSize }) => {
        const header = document.createElement('div');
        header.textContent = label;
        header.style.cssText = `
            padding: 6px 14px; color: #ffd700; font-weight: bold;
            font-size: 12px; border-bottom: 1px solid #333; margin-top: 4px;
        `;
        menu.appendChild(header);

        Object.keys(setsMap).forEach(setName => {
            const { count, items } = getOwnedSlotsSimple(setName, setsMap, slotTypeSlots);
            const isFull = count >= fullSize;
            // ★ 수정1: 방어구 1~4개도 서브패널, 0개만 비활성
            const isPartial = count >= 1 && !isFull;

            const item = document.createElement('div');
            item.style.cssText = `display: flex; align-items: center;
                padding: 0 8px 0 20px; font-size: 12px; cursor: default;`;
            item.onmouseenter = () => item.style.background = '#333';
            item.onmouseleave = () => item.style.background = '';

            const countLabel = count > 0 ? ` (${count})` : '';
            const isDisabled = count === 0;
            const textSpan = document.createElement('span');
            textSpan.textContent = setName + countLabel;
            textSpan.style.cssText = `
                padding: 7px 8px 7px 0;
                color: ${isFull ? '#ffd700' : isDisabled ? '#555' : '#fff'};
                font-weight: ${isFull ? 'bold' : 'normal'};
                cursor: ${isDisabled ? 'default' : 'pointer'};
                user-select: none;
                -webkit-user-select: none;
                white-space: nowrap;
            `;

            // ★ 수정2: 오른쪽 빈 영역 클릭 시 서브패널 닫기
            const spacer = document.createElement('span');
            spacer.style.cssText = `flex: 1; min-width: 40px; padding: 7px 0;
                display: block; cursor: default;`;
            spacer.addEventListener('click', (e) => {
                e.stopPropagation();
                const ep = document.getElementById('setSlotSelectPanel');
                if (ep) ep.remove();
            });
            spacer._tsx = 0; spacer._tsy = 0;
            spacer.addEventListener('touchstart', (e) => {
                spacer._tsx = e.touches[0].clientX;
                spacer._tsy = e.touches[0].clientY;
            }, { passive: true });
            spacer.addEventListener('touchend', (e) => {
                const dx = e.changedTouches[0].clientX - spacer._tsx;
                const dy = e.changedTouches[0].clientY - spacer._tsy;
                if (Math.sqrt(dx * dx + dy * dy) > 8) return;
                e.preventDefault();
                e.stopPropagation();
                const ep = document.getElementById('setSlotSelectPanel');
                if (ep) ep.remove();
            });

            item.appendChild(textSpan);
            item.appendChild(spacer);

            const handleClick = (e) => {
                if (isFull) {
                    // 풀세트: 서브패널 닫고 바로 적용
                    const ep = document.getElementById('setSlotSelectPanel');
                    if (ep) ep.remove();
                    applySetItems(charId, slotType, setsMap, setName);
                    closeSetContextMenu();
                } else {
                    // 1개 이상: 서브패널 열기
                    const cx = e?.clientX || e?.changedTouches?.[0]?.clientX || window.innerWidth / 2;
                    const cy = e?.clientY || e?.changedTouches?.[0]?.clientY || window.innerHeight / 2;
                    openSlotSelectPanel(charId, setName, setsMap, slotType, slotTypeSlots, items, cx, cy);
                }
            };

            if (!isDisabled) {
                textSpan.onclick = (e) => {
                    e.stopPropagation();
                    const ep = document.getElementById('setSlotSelectPanel');
                    if (ep) ep.remove();
                    handleClick(e);
                };
                textSpan._tsx = 0; textSpan._tsy = 0;
                textSpan.addEventListener('touchstart', (e) => {
                    textSpan._tsx = e.touches[0].clientX;
                    textSpan._tsy = e.touches[0].clientY;
                }, { passive: true });
                textSpan.addEventListener('touchend', (e) => {
                    const dx = e.changedTouches[0].clientX - textSpan._tsx;
                    const dy = e.changedTouches[0].clientY - textSpan._tsy;
                    if (Math.sqrt(dx * dx + dy * dy) > 8) return;
                    e.preventDefault();
                    e.stopPropagation();
                    const ep = document.getElementById('setSlotSelectPanel');
                    if (ep) ep.remove();
                    handleClick(e);
                });
            }

            menu.appendChild(item);
        });
    });

    _positionMenu(menu, event);
    document.body.appendChild(menu);  // _adjustMenuPosition에서 tableContainer로 이동됨
    _adjustMenuPosition(menu, event);
    _addOutsideHandler(menu);
}

/**
 * 부위 선택 서브패널
 */
function openSlotSelectPanel(charId, setName, setsMap, slotType, slotTypeSlots, ownedItems, cx, cy) {
    const existingPanel = document.getElementById('setSlotSelectPanel');
    if (existingPanel) existingPanel.remove();

    const panel = document.createElement('div');
    panel.id = 'setSlotSelectPanel';
    panel.style.cssText = `
        position: absolute;
        z-index: 10000;
        background: #1a1a1a;
        border: 2px solid #ffd700;
        border-radius: 6px;
        padding: 10px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.9);
        min-width: 220px;
        overflow-y: auto;
        overscroll-behavior: contain;
        -webkit-overflow-scrolling: touch;
        touch-action: pan-y;
        box-sizing: border-box;
    `;
    panel.addEventListener('wheel', (e) => {
        const atTop    = panel.scrollTop === 0;
        const atBottom = panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 1;
        if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) return;
        e.preventDefault();
        e.stopPropagation();
        panel.scrollTop += e.deltaY;
    }, { passive: false });
    let _panelTouchStartY = 0;
    panel.addEventListener('touchstart', (e) => { _panelTouchStartY = e.touches[0].clientY; }, { passive: true });
    panel.addEventListener('touchmove', (e) => {
        const dy = e.touches[0].clientY - _panelTouchStartY;
        const atTop    = panel.scrollTop === 0;
        const atBottom = panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 1;
        if ((atTop && dy > 0) || (atBottom && dy < 0)) return;
        e.stopPropagation();
    }, { passive: true });

    const title = document.createElement('div');
    title.textContent = setName + ' - 부위 선택';
    title.style.cssText = `color: #ffd700; font-weight: bold; font-size: 12px;
        margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #333;`;
    panel.appendChild(title);

    const checkboxes = [];
    ownedItems.forEach(({ slot, item }) => {
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.dataset.slot = slot;
        cb.dataset.item = item;
        cb.style.cssText = `display: none;`;

        const row = document.createElement('div');
        row.style.cssText = `display: flex; align-items: center; gap: 8px;
            padding: 6px 4px; color: #fff; font-size: 12px; cursor: pointer;
            user-select: none; -webkit-user-select: none;`;

        const box = document.createElement('span');
        box.style.cssText = `
            display: inline-flex; align-items: center; justify-content: center;
            width: 16px; height: 16px; min-width: 16px; min-height: 16px;
            border: 2px solid #888; border-radius: 3px; background: #222;
            flex-shrink: 0; font-size: 12px; line-height: 1;
        `;

        const slotTag = document.createElement('span');
        slotTag.textContent = `(${slot}) `;
        slotTag.style.cssText = `color: #ffd700; font-size: 11px; flex-shrink: 0;`;

        const nameSpan = document.createElement('span');
        nameSpan.textContent = item;

        const toggle = () => {
            cb.checked = !cb.checked;
            if (cb.checked) {
                box.style.background = '#ffd700';
                box.style.borderColor = '#ffd700';
                box.textContent = '✓';
                box.style.color = '#000';
            } else {
                box.style.background = '#222';
                box.style.borderColor = '#888';
                box.textContent = '';
            }
        };

        row.addEventListener('click', toggle);
        row.addEventListener('touchend', (e) => { e.preventDefault(); toggle(); });

        row.appendChild(box);
        row.appendChild(cb);
        row.appendChild(slotTag);
        row.appendChild(nameSpan);
        panel.appendChild(row);
        checkboxes.push(cb);
    });

    const btnRow = document.createElement('div');
    btnRow.style.cssText = `display: flex; gap: 8px; margin-top: 10px; justify-content: flex-end;`;

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '취소';
    cancelBtn.style.cssText = `padding: 5px 12px; background: #444; color: #fff;
        border: none; border-radius: 4px; cursor: pointer; font-size: 12px;`;
    cancelBtn.onclick = () => { panel.remove(); };

    const applyBtn = document.createElement('button');
    applyBtn.textContent = '적용';
    applyBtn.style.cssText = `padding: 5px 12px; background: #ffd700; color: #000;
        border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold;`;
    applyBtn.onclick = () => {
        const section = document.getElementById(charId);
        if (!section) return;
        checkboxes.filter(cb => cb.checked).forEach(cb => {
            const slot = cb.dataset.slot;
            const itemName = cb.dataset.item;
            const nameEl = section.querySelector(`[data-key="${slot}_itemname"]`);
            if (nameEl) {
                nameEl.value = itemName;
                nameEl.dispatchEvent(new Event('change'));
            }
        });
        if (checkboxes.some(cb => cb.checked)) {
            runSetCheck(slotTypeSlots[0], charId);
            autoSave();
        }
        panel.remove();
        closeSetContextMenu();
    };

    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(applyBtn);
    panel.appendChild(btnRow);

    // table-container 기준 absolute 배치
    const _sec = document.getElementById(charId);
    const _tc  = _sec ? _sec.querySelector('.table-container') : null;

    if (_tc) {
        if (window.getComputedStyle(_tc).position === 'static') _tc.style.position = 'relative';
        _tc.appendChild(panel);

        const tcRect = _tc.getBoundingClientRect();
        const visTop    = Math.max(tcRect.top,    0) - tcRect.top;
        const visBottom = Math.min(tcRect.bottom, window.innerHeight) - tcRect.top;
        const visLeft   = Math.max(tcRect.left,   0) - tcRect.left;
        const visRight  = Math.min(tcRect.right,  window.innerWidth)  - tcRect.left;

        panel.style.maxHeight = Math.max(visBottom - visTop - 8, 100) + 'px';

        const pRect = panel.getBoundingClientRect();
        let pl = cx - tcRect.left;
        let pt = cy - tcRect.top;

        if (pl + pRect.width  > visRight)  pl = visRight  - pRect.width;
        if (pt + pRect.height > visBottom) pt = visBottom - pRect.height;
        if (pl < visLeft) pl = visLeft;
        if (pt < visTop)  pt = visTop;

        panel.style.left = pl + 'px';
        panel.style.top  = pt + 'px';
    } else {
        // fallback: fixed
        panel.style.position = 'fixed';
        document.body.appendChild(panel);
        panel.style.maxHeight = Math.floor(window.innerHeight * 0.8) + 'px';
        const pRect = panel.getBoundingClientRect();
        let pl = cx, pt = cy;
        if (pl + pRect.width  > window.innerWidth)  pl = window.innerWidth  - pRect.width  - 4;
        if (pt + pRect.height > window.innerHeight) pt = window.innerHeight - pRect.height - 4;
        if (pl < 0) pl = 4;
        if (pt < 0) pt = 4;
        panel.style.left = pl + 'px';
        panel.style.top  = pt + 'px';
    }
}

/**
 * 메뉴 위치 초기 설정
 */
function _positionMenu(menu, event) {
    menu.style.left = '-9999px';
    menu.style.top  = '-9999px';
}

/**
 * 메뉴 위치 최종 조정
 * - position: absolute, table-container 기준으로 배치
 * - 페이지 스크롤 시 버튼과 함께 움직임
 */
function _adjustMenuPosition(menu, event) {
    const btn = event.target.closest('button') || event.target;
    const tableContainer = btn.closest('.table-container');

    if (!tableContainer) {
        menu.style.position = 'fixed';
        const maxH = Math.floor(window.innerHeight * 0.8);
        menu.style.maxHeight = maxH + 'px';
        const rect = menu.getBoundingClientRect();
        let left = event.clientX;
        let top  = event.clientY;
        if (left + rect.width  > window.innerWidth)  left = window.innerWidth  - rect.width;
        if (top  + rect.height > window.innerHeight) top  = window.innerHeight - rect.height;
        if (left < 0) left = 0;
        if (top  < 0) top  = 0;
        menu.style.left = left + 'px';
        menu.style.top  = top  + 'px';
        return;
    }

    // table-container 기준 absolute 배치
    menu.style.position = 'absolute';

    // table-container에 position:relative 보장
    if (window.getComputedStyle(tableContainer).position === 'static') {
        tableContainer.style.position = 'relative';
    }

    tableContainer.appendChild(menu);

    const tcRect  = tableContainer.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    // 버튼 바로 아래, 왼쪽 정렬
    let left = btnRect.left - tcRect.left;
    let top  = btnRect.bottom - tcRect.top;

    // table-container 가시 영역 (화면과 교집합)
    const visTop    = Math.max(tcRect.top,    0) - tcRect.top;
    const visBottom = Math.min(tcRect.bottom, window.innerHeight) - tcRect.top;
    const visLeft   = Math.max(tcRect.left,   0) - tcRect.left;
    const visRight  = Math.min(tcRect.right,  window.innerWidth)  - tcRect.left;

    // max-height = 가시 영역 높이 - 여백 (팝업이 표 세로보다 짧게)
    const maxH = Math.max(visBottom - visTop - 8, 100);
    menu.style.maxHeight = maxH + 'px';

    const mRect = menu.getBoundingClientRect();

    if (left + mRect.width > visRight)  left = visRight - mRect.width;
    if (top  + mRect.height > visBottom) top = (btnRect.top - tcRect.top) - mRect.height;
    if (left < visLeft) left = visLeft;
    if (top  < visTop)  top  = visTop;

    menu.style.left = left + 'px';
    menu.style.top  = top  + 'px';
}

let _menuOutsideHandler = null;

function _addOutsideHandler(menu) {
    if (_menuOutsideHandler) {
        document.removeEventListener('pointerdown', _menuOutsideHandler);
        _menuOutsideHandler = null;
    }

    _menuOutsideHandler = (e) => {
        const panel = document.getElementById('setSlotSelectPanel');
        const insideMenu  = menu.contains(e.target);
        const insidePanel = panel && panel.contains(e.target);

        if (insideMenu || insidePanel) return;

        if (panel) panel.remove();
        closeSetContextMenu();
    };
    setTimeout(() => {
        document.addEventListener('pointerdown', _menuOutsideHandler);
    }, 200);
}

/**
 * 세트 메뉴 닫기
 */
function closeSetContextMenu() {
    const menu = document.getElementById('setContextMenu');
    if (menu) menu.remove();
    const panel = document.getElementById('setSlotSelectPanel');
    if (panel) panel.remove();
    if (_menuOutsideHandler) {
        document.removeEventListener('pointerdown', _menuOutsideHandler);
        _menuOutsideHandler = null;
    }
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
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        touch-action: pan-y;
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
            item._tsx = 0; item._tsy = 0;
            item.addEventListener('touchstart', (e) => { item._tsx = e.touches[0].clientX; item._tsy = e.touches[0].clientY; }, { passive: true });
            item.addEventListener('touchend', (e) => {
                const dx = e.changedTouches[0].clientX - item._tsx;
                const dy = e.changedTouches[0].clientY - item._tsy;
                if (Math.sqrt(dx*dx+dy*dy) > 10) return;
                e.preventDefault(); e.stopPropagation(); apply();
            });
            menu.appendChild(item);
        });
    });

    _positionMenu(menu, event);
    document.body.appendChild(menu);
    _adjustMenuPosition(menu, event);
    _addOutsideHandler(menu);
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
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        touch-action: pan-y;
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
        item._tsx = 0; item._tsy = 0;
        item.addEventListener('touchstart', (e) => { item._tsx = e.touches[0].clientX; item._tsy = e.touches[0].clientY; }, { passive: true });
        item.addEventListener('touchend', (e) => {
            const dx = e.changedTouches[0].clientX - item._tsx;
            const dy = e.changedTouches[0].clientY - item._tsy;
            if (Math.sqrt(dx*dx+dy*dy) > 10) return;
            e.preventDefault(); e.stopPropagation(); apply();
        });
        menu.appendChild(item);
    }

    _positionMenu(menu, event);
    document.body.appendChild(menu);
    _adjustMenuPosition(menu, event);
    _addOutsideHandler(menu);
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
