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

// ============================================
// 아이템이름 색상 적용 (세트 / 익시드)
//
// 우선순위:
//   1순위: 3세트 이상 해당 슬롯 → 파란색
//   2순위: 익시드 선택됨          → 초록색
//   기본:  (없음)                 → 노란색 (CSS rare-에픽 기본값)
// ============================================

/**
 * 단일 슬롯의 아이템이름 색상을 계산하여 적용
 * @param {Element} nameEl  - [data-key="${slot}_itemname"] 요소
 * @param {boolean} isSet   - 이 슬롯이 3세트 이상에 포함되는지
 * @param {boolean} isExceed - 이 슬롯에 익시드가 선택됐는지
 */
function applyItemNameColor(nameEl, isSet, isExceed) {
    if (!nameEl) return;
    // 기존 인라인 color 초기화
    nameEl.style.removeProperty('color');
    nameEl.title = "";

    if (isSet) {
        nameEl.style.setProperty('color', '#71D2E5', 'important'); // 파란색
    } else if (isExceed) {
        nameEl.style.setProperty('color', '#85EFAD', 'important'); // 초록색 (익시드)
    }
    // 기본(노란색)은 CSS .rare-에픽 / itemname-color-sync 가 처리
}

/**
 * 세트 판정 — setsMap에서 3개 이상인 세트에 속하는 슬롯 집합을 반환
 * @param {Element} section
 * @param {string[]} slots
 * @param {Object} setsMap
 * @returns {Set<string>} 3세트 이상 활성 슬롯 이름 집합
 */
function getActiveSetSlots(section, slots, setsMap) {
    // 각 슬롯의 아이템이름 수집
    const itemOf = {};
    slots.forEach(slot => {
        const el = section.querySelector(`[data-key="${slot}_itemname"]`);
        itemOf[slot] = el ? el.value.trim() : "";
    });

    // 아이템→세트 역방향 맵 먼저 구성 (아이템이 어느 세트 소속인지)
    const itemToSet = {};
    for (const [setName, setList] of Object.entries(setsMap)) {
        setList.forEach(item => {
            itemToSet[item] = setName;
        });
    }

    // 슬롯별로 소속 세트 결정
    const slotToSet = {};
    slots.forEach(slot => {
        const item = itemOf[slot];
        if (item && itemToSet[item]) {
            slotToSet[slot] = itemToSet[item];
        }
    });

    // 세트별 카운트
    const setCounts = {};
    Object.values(slotToSet).forEach(setName => {
        setCounts[setName] = (setCounts[setName] || 0) + 1;
    });

    // 3개 이상인 세트에 속하는 슬롯만 추출
    const activeSlots = new Set();
    slots.forEach(slot => {
        const sn = slotToSet[slot];
        if (sn && (setCounts[sn] || 0) >= 3) activeSlots.add(slot);
    });
    return { activeSlots, slotToSet, setCounts };
}

/**
 * 특정 슬롯 그룹 전체의 아이템이름 색상을 갱신
 */
function refreshItemNameColors(charId, slots, setsMap) {
    const section = document.getElementById(charId);
    if (!section) return;

    const { activeSlots, slotToSet, setCounts } = getActiveSetSlots(section, slots, setsMap);

    slots.forEach(slot => {
        const nameEl = section.querySelector(`[data-key="${slot}_itemname"]`);
        if (!nameEl) return;

        const isSet = activeSlots.has(slot);
        const exceedSel = section.querySelector(`select[data-key="${slot}_exceed"]`);
        const isExceed = !!(exceedSel && exceedSel.value !== "");

        applyItemNameColor(nameEl, isSet, isExceed);

        if (isSet) {
            const setName = slotToSet[slot] ?? "";
            const count = setCounts[setName] ?? 0;
            nameEl.title = `${setName} 세트 효과 활성화 (${count}셋)`;
        }
    });
}

/** 방어구 슬롯 전체 색상 갱신 */
function checkArmorSetColor(charId) {
    refreshItemNameColors(charId, ["상의", "하의", "어깨", "벨트", "신발"], armorSets);
}

/** 악세서리 슬롯 전체 색상 갱신 */
function checkAccSetColor(charId) {
    refreshItemNameColors(charId, ["팔찌", "목걸이", "반지"], accSets);
}

/** 특수장비 슬롯 전체 색상 갱신 */
function checkSpecialSetColor(charId) {
    refreshItemNameColors(charId, ["귀걸이", "마법석", "보조장비"], specialSets);
}

/**
 * 슬롯 하나가 속하는 그룹을 판별해 해당 그룹 전체 갱신
 * (기존 runSetCheck 호환)
 */
function runSetCheck(slot, charId) {
    const slotType = SlotUtils.getSlotType(slot);
    if (slotType === 'armor')     checkArmorSetColor(charId);
    else if (slotType === 'accessory') checkAccSetColor(charId);
    else if (slotType === 'special')   checkSpecialSetColor(charId);
}

/** 모든 슬롯 그룹 한번에 갱신 (페이지 로드 등) */
function refreshAllItemNameColors(charId) {
    checkArmorSetColor(charId);
    checkAccSetColor(charId);
    checkSpecialSetColor(charId);
}

// ============================================
// 방어구 슬롯 접두어/익시드 활성화 상태 관리
// ============================================

/**
 * 아이템이름 기준으로 해당 행의 접두어/익시드 select 상태를 갱신
 * - 아이템이름 없음  → 접두어 disabled, 익시드 disabled
 * - 일반 아이템      → 접두어 enabled(세트 접두어), 익시드 disabled
 * - 익시드 아이템    → 접두어 enabled(세트 접두어), 익시드는 접두어 선택 시 enabled
 * @param {string} slot
 * @param {string} charId
 * @param {boolean} isRestore - true이면 초기화 없이 현재값 유지
 */
function refreshArmorSlotState(slot, charId, isRestore = false) {
    const section = document.getElementById(charId);
    if (!section) return;

    const row = section.querySelector(`tr[data-slot="${slot}"]`)
        || section.querySelector(`[data-key="${slot}_itemname"]`)?.closest('tr');
    if (!row) return;

    const itemnameSel = row.querySelector(`[data-key="${slot}_itemname"]`);
    const prefixSel   = row.querySelector(`select[data-key="${slot}_prefix"]`);
    const exceedSel   = row.querySelector(`select[data-key="${slot}_exceed"]`);

    if (!prefixSel) return;

    const itemName = itemnameSel ? itemnameSel.value.trim() : "";
    const info = (typeof ARMOR_ITEM_INFO !== 'undefined') ? ARMOR_ITEM_INFO[itemName] : null;

    // ── 케이스 1: 아이템이름 없음 ──────────────────────────────
    if (!itemName || !info) {
        prefixSel.disabled = true;
        prefixSel.innerHTML = '<option value=""></option>';
        prefixSel.value = "";
        prefixSel.classList.remove('prefix-selected', 'prefix-tier');
        if (exceedSel) {
            exceedSel.disabled = true;
            exceedSel.value = "";
        }
        return;
    }

    // ── 케이스 2: 익시드 아이템 (index 0) ──────────────────────
    if (info.isExceed) {
        // 접두어: 공백 없이 세트 접두어만
        const setPrefixes = [...info.prefixes]; // 공백 없음

        // ※ innerHTML 교체 전에 현재 값 저장 (교체 후엔 value 초기화됨)
        const savedPrefix = prefixSel.value;

        prefixSel.disabled = false;
        prefixSel.innerHTML = setPrefixes.map(p => `<option value="${p}">${p}</option>`).join('');

        if (isRestore) {
            // 복구: 저장값이 목록에 있으면 유지, 없으면 첫 번째 값
            prefixSel.value = setPrefixes.includes(savedPrefix) ? savedPrefix : setPrefixes[0];
        } else {
            // 신규 선택: 첫 번째 값 자동 선택
            prefixSel.value = setPrefixes[0];
        }
        prefixSel.classList.remove('prefix-tier');
        prefixSel.classList.add('prefix-selected');

        // 익시드: innerHTML 교체로 공백 옵션 제거 + 값 설정
        if (exceedSel) {
            // ※ innerHTML 교체 전에 현재 값 저장
            const savedExceed = exceedSel.value;
            exceedSel.innerHTML = '<option>이상</option><option>선봉</option><option>의지</option>';
            exceedSel.disabled = false;
            if (isRestore) {
                // 복구: 저장값 유지, 없으면 "이상"
                exceedSel.value = ["이상", "선봉", "의지"].includes(savedExceed) ? savedExceed : "이상";
            } else {
                // 신규 선택: "이상" 자동 선택
                exceedSel.value = "이상";
            }
        }
        return;
    }

    // ── 케이스 3: 일반 아이템 (index 1) ────────────────────────
    // 접두어: 공백 포함 세트 접두어
    const setPrefixes = ["", ...info.prefixes];

    // ※ innerHTML 교체 전에 현재 값 저장
    const savedPrefix = prefixSel.value;

    prefixSel.disabled = false;
    prefixSel.innerHTML = setPrefixes.map(p => `<option value="${p}">${p}</option>`).join('');

    if (isRestore) {
        // 복구: 저장값이 목록에 있으면 유지, 없으면 공백
        prefixSel.value = setPrefixes.includes(savedPrefix) ? savedPrefix : "";
    } else {
        // 신규 선택: 공백
        prefixSel.value = "";
    }
    prefixSel.classList.remove('prefix-tier');
    if (prefixSel.value !== "") {
        prefixSel.classList.add('prefix-selected');
    } else {
        prefixSel.classList.remove('prefix-selected');
    }

    // 익시드: HTML 원본 옵션 복원 + disabled (공백 포함 원래 상태로)
    if (exceedSel) {
        exceedSel.innerHTML = '<option></option><option>이상</option><option>선봉</option><option>의지</option>';
        exceedSel.disabled = true;
        exceedSel.value = "";
    }
}

/**
 * 캐릭터 전체 방어구 슬롯 상태 일괄 갱신 (페이지 로드 시)
 */
function refreshAllArmorSlotStates(charId) {
    ["상의", "하의", "어깨", "벨트", "신발"].forEach(slot => {
        refreshArmorSlotState(slot, charId, true);
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

                // 방어구 슬롯은 접두어를 refreshArmorSlotState가 처리하므로 여기서는 비방어구만 updateStyle
                const isArmorSlot = !["목걸이", "팔찌", "반지", "보조장비", "귀걸이", "마법석", "무기"].includes(slot);
                if (!isArmorSlot) {
                    updateStyle(prefixSel, 'prefix', isInitial);
                }
            }

            if (nameEl && itemOptions[slot]) {
                replaceItemNameField(nameEl.parentElement, slot, el.value, nameEl.value, charId);
            }
            runSetCheck(slot, charId);
        }

        else if (type === 'exceed') {
            el.classList.remove('ex-이상', 'ex-선봉', 'ex-의지');
            if (el.value) el.classList.add('ex-' + el.value);

            // 색상은 runSetCheck가 익시드 여부까지 포함해 처리
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

    // 방어구 접두어 변경 시 익시드 활성화 재계산
    // (익시드 상의는 공백 없이 항상 선택값이 있으므로 이 코드는 주로 안전장치 역할)
    if (type === 'prefix') {
        const armorSlots = ["상의", "하의", "어깨", "벨트", "신발"];
        if (armorSlots.includes(slot)) {
            const exceedSel = row.querySelector(`select[data-key="${slot}_exceed"]`);
            if (exceedSel) {
                const itemnameSel = row.querySelector(`[data-key="${slot}_itemname"]`);
                const itemName = itemnameSel ? itemnameSel.value.trim() : "";
                const info = (typeof ARMOR_ITEM_INFO !== 'undefined') ? ARMOR_ITEM_INFO[itemName] : null;
                // 익시드 아이템 + 접두어 선택됨 → enabled, 나머지 → disabled
                if (info?.isExceed && el.value !== "") {
                    exceedSel.disabled = false;
                } else if (!info?.isExceed) {
                    // 일반 아이템은 항상 disabled
                    exceedSel.disabled = true;
                    exceedSel.value = "";
                }
            }
        }
    }

    if (!isInitial) autoSave();
}

/**
 * 아이템 이름 필드 교체
 */
function replaceItemNameField(parentTd, slot, rarity, value, charId) {
    // 기존 itemname 요소 제거
    const oldEl = parentTd.querySelector(`[data-key="${slot}_itemname"]`);
    if (oldEl) oldEl.remove();

    // 상의 슬롯: 기존 이미지 미리보기도 제거 (재생성 예정)
    const oldImg = parentTd.querySelector('.itemname-img-preview');
    if (oldImg) oldImg.remove();

    const section = document.getElementById(charId);
    const isLocked = section?.querySelector('.lock-btn')?.classList.contains('btn-active');

    let newEl;
    if (rarity === "에픽") {
        newEl = document.createElement('select');
        // itemOptions 배열 자체에 이미 첫 번째 빈 값이 포함되어 있으므로 중복 추가 없이 그대로 사용
        newEl.innerHTML = (itemOptions[slot] || []).map(opt =>
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

    // 상의 슬롯 이벤트: 이미지 미리보기 업데이트 포함
    if (slot === '상의' && rarity === '에픽') {
        newEl.addEventListener('change', () => {
            if (typeof updateItemImage === 'function') updateItemImage(newEl);
            if (typeof refreshArmorSlotState === 'function') refreshArmorSlotState(slot, charId);
            runSetCheck(slot, charId);
            autoSave();
        });
    } else {
        newEl.addEventListener('change', () => {
            if (typeof refreshArmorSlotState === 'function') refreshArmorSlotState(slot, charId);
            runSetCheck(slot, charId);
            autoSave();
        });
    }
    newEl.addEventListener('input', () => {
        runSetCheck(slot, charId);
        autoSave();
    });

    // 상의 에픽: 이미지 미리보기를 select 앞에 삽입
    if (slot === '상의' && rarity === '에픽') {
        const img = document.createElement('img');
        img.className = 'itemname-img-preview';
        img.src = '';
        img.alt = '';
        parentTd.appendChild(img);
    }

    parentTd.appendChild(newEl);

    // 상의 에픽: 현재 값에 맞게 이미지 즉시 업데이트
    if (slot === '상의' && rarity === '에픽' && typeof updateItemImage === 'function') {
        updateItemImage(newEl);
    }

    runSetCheck(slot, charId);

    // 방어구 슬롯: 접두어/익시드 상태 재계산
    const armorSlots = ["상의", "하의", "어깨", "벨트", "신발"];
    if (armorSlots.includes(slot) && typeof refreshArmorSlotState === 'function') {
        refreshArmorSlotState(slot, charId, true);
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