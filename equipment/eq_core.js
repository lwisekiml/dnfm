/* ========================================
[섹션 4] 데이터 관리 (로컬 스토리지)
======================================== */
function saveLocalData() {
    const existing = _loadUnified();
    existing.characters = characters;
    localStorage.setItem(STORAGE_KEYS.UNIFIED, JSON.stringify(existing));
}

// 통합 스토리지에서 전체 객체 읽기 (내부 헬퍼)
function _loadUnified() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.UNIFIED);
        if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { characters: [], history: [] };
}

// 데이터 로드
function loadLocalData() {
    const unified = _loadUnified();
    characters = unified.characters || [];
}

/* ========================================
[섹션 5] 초기 계산 함수
======================================== */
function calculateGlobalWidths() {
    const allNames = [], allSlots = [];
    [{sets: ARMOR_SETS, pref: ARMOR_PREFIX},
        {sets: ACCESSORY_SETS, pref: ACCESSORY_PREFIX},
        {sets: SPECIAL_SETS, pref: SPECIAL_PREFIX}].forEach(({sets, pref}) => {
        Object.keys(sets).forEach(setName => {
            allNames.push(setName);
            const prefixes = pref[setName] || [];
            prefixes.forEach(p => {
                allNames.push(`${p}: ${setName}`);
                EXCEED_TAGS.forEach(ex => allNames.push(`[${ex}] ${p}: ${setName}`));
            });
            sets[setName].forEach(slot => allSlots.push(slot));
        });
    });
    globalSetNameWidth = Math.max(...allNames.map(n => n.length)) * 12;
    globalSlotWidth = Math.max(...allSlots.map(s => s.length)) * 12;
}

/* ========================================
[섹션 6] 유틸리티 함수
======================================== */

// 표에 들어갈 행 이름 배열을 받아 가장 긴 이름 기준으로 너비(px) 계산
function calcNameWidth(names) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.font = "14px sans-serif";
    const max = Math.max(...names.map(n => ctx.measureText(n).width));
    return Math.ceil(max) + 24;
}

/**
 * 장비 테이블 행 생성 공통 함수
 */
function createEquipmentRow(config) {
    const {
        char, setName, nameKey, labelText, slots, fullSize
    } = config;

    const totalDistinct = getCachedDistinctParts(char, setName);
    let hasAnyPart = false;

    slots.forEach(slot => {
        if ((char.armorCounts[`${nameKey} ${slot}`] || 0) > 0) {
            hasAnyPart = true;
        }
    });

    const tr = document.createElement("tr");

    if (hasAnyPart) {
        if (fullSize === 5) {
            if (totalDistinct === fullSize) tr.className = "set5";
            else if (totalDistinct >= 3) tr.className = "set3";
        } else {
            if (totalDistinct === 3) tr.className = "set3";
        }
    }

    let html = `<td style="text-align:center;">${labelText}</td>`;
    slots.forEach(slot => {
        const key = `${nameKey} ${slot}`;
        const val = char.armorCounts[key] || 0;
        html += `<td>${makeNumberButton(char.id, key, val)}</td>`;
    });

    tr.innerHTML = html;
    return tr;
}

/**
 * 익시드 태그 색상 가져오기
 */
function getExceedColor(tag) {
    const cleanTag = tag.replace(/[\[\]]/g, '');
    return EXCEED_COLOR_MAP[cleanTag] || '#ffd700';
}

/**
 * 익시드/접두어가 포함된 이름을 HTML로 변환
 */
function formatEquipmentName(name) {
    let html = '';

    const exceedMatch = name.match(/^(\[.*?\])\s*(.*)/);
    if (exceedMatch) {
        const tag = exceedMatch[1];
        const rest = exceedMatch[2];
        const color = getExceedColor(tag);
        html += `<span style="color:${color}; font-weight:bold;">${tag}</span> `;
        name = rest;
    }

    const prefixMatch = name.match(/^(.+?):\s*(.+)/);
    if (prefixMatch) {
        const prefix = prefixMatch[1];
        const base = prefixMatch[2];
        html += `<span style="color:#e6b800; font-weight:bold;">${prefix}</span>: ${base}`;
    } else {
        html += name;
    }

    return html;
}

function isExceedName(name) {
    return /^\[(선봉|의지|이상)\]\s/.test(name);
}

function getGroupKey(name) {
    return name.replace(/^\[.*?\]\s*/, "");
}

function getSetType(setName) {
    if (ARMOR_SETS[setName]) return "ARMOR";
    if (ACCESSORY_SETS[setName]) return "ACCESSORY";
    if (SPECIAL_SETS[setName]) return "SPECIAL";

    // 접두어나 익시드가 붙은 이름에서 기본 세트명을 추출하여 판별
    const baseName = setName.includes(':') ? setName.split(':').pop().trim() : setName;
    if (ARMOR_SETS[baseName]) return "ARMOR";
    if (ACCESSORY_SETS[baseName]) return "ACCESSORY";
    if (SPECIAL_SETS[baseName]) return "SPECIAL";

    // 레거시 세트 판별 (setName 자체가 키)
    for (const legacyName of LEGACY_PREFIX_SETS) {
        if (setName === legacyName || setName.endsWith(legacyName)) {
            if (ARMOR_SETS[legacyName]) return "ARMOR";
            if (ACCESSORY_SETS[legacyName]) return "ACCESSORY";
        }
    }

    return "ARMOR";
}

// 캐시 키 생성
function makeDistinctCacheKey(char, setName) {
    return `${char.id}|${setName}`;
}

// 캐시 무효화 (데이터 변경 시)
function invalidateDistinctCache(charId, setName) {
    if (setName) {
        // 특정 세트만 무효화
        const key = `${charId}|${setName}`;
        delete distinctPartsCache[key];
    } else {
        // 해당 캐릭터의 모든 캐시 무효화
        Object.keys(distinctPartsCache).forEach(key => {
            if (key.startsWith(`${charId}|`)) {
                delete distinctPartsCache[key];
            }
        });
    }
}

// 캐시된 결과 가져오기
function getCachedDistinctParts(char, setName) {
    const cacheKey = makeDistinctCacheKey(char, setName);

    // 캐시에 있으면 반환
    if (distinctPartsCache[cacheKey] !== undefined) {
        return distinctPartsCache[cacheKey];
    }

    // 없으면 계산 후 저장
    const result = calcTotalDistinctParts(char, setName);
    distinctPartsCache[cacheKey] = result;
    return result;
}

function calcTotalDistinctParts(char, baseSetName) {
    const slots = ALL_SETS[baseSetName] || [];
    const prefixes = ALL_PREFIX[baseSetName] || [];
    const setType = getSetType(baseSetName);
    const exceedSlots = EXCEED_SLOTS[setType] || [];

    // 검색할 모든 그룹 이름 (기본, 접두어, 익시드) 생성
    const namesToSearch = [];

    // 레거시 세트는 일반 행 없음 (접두어만)
    if (!LEGACY_PREFIX_SETS.includes(baseSetName)) {
        namesToSearch.push(baseSetName);
    }

    prefixes.forEach(p => {
        const prefKey = makePrefixKey(p, baseSetName);
        namesToSearch.push(prefKey);
        EXCEED_TAGS.forEach(ex => namesToSearch.push(`[${ex}] ${prefKey}`));
    });

    let totalDistinct = 0;

    slots.forEach(slot => {
        let hasPartInSlot = false;

        namesToSearch.forEach(nameComponent => {
            const isExceedKey = nameComponent.startsWith('[');

            // 익시드 키는 특정 슬롯에만 존재하므로, 아닌 경우는 건너뜁니다.
            if (isExceedKey && !exceedSlots.includes(slot)) {
                return;
            }

            const fullKey = `${nameComponent} ${slot}`;
            if ((char.armorCounts[fullKey] || 0) > 0) {
                hasPartInSlot = true;
            }
        });

        if (hasPartInSlot) {
            totalDistinct++;
        }
    });

    return totalDistinct;
}