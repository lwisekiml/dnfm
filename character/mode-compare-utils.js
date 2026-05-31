// ============================================
// mode-compare-utils.js - 비교 모드 공통 헬퍼
// ============================================
// ※ 로드 순서: mode-compare-eq.js, mode-compare-stat.js,
//              mode-compare-all.js 보다 먼저 로드해야 함
// ============================================

// ============================================
// [1] 외부 데이터 참조 - typeof 체크 통합
// ============================================
const CmpData = {
    get weapon()   { return (typeof WEAPON_ITEM_STATS     !== 'undefined') ? WEAPON_ITEM_STATS     : {}; },
    get armor()    { return (typeof ARMOR_ITEM_STATS      !== 'undefined') ? ARMOR_ITEM_STATS      : {}; },
    get acc()      { return (typeof ACCESSORY_ITEM_STATS  !== 'undefined') ? ACCESSORY_ITEM_STATS  : {}; },
    get special()  { return (typeof SPECIAL_ITEM_STATS    !== 'undefined') ? SPECIAL_ITEM_STATS    : {}; },
    get armorSE()  { return (typeof ARMOR_SET_EFFECTS     !== 'undefined') ? ARMOR_SET_EFFECTS     : {}; },
    get accSE()    { return (typeof ACCESSORY_SET_EFFECTS !== 'undefined') ? ACCESSORY_SET_EFFECTS : {}; },
    get specialSE(){ return (typeof SPECIAL_SET_EFFECTS   !== 'undefined') ? SPECIAL_SET_EFFECTS   : {}; },
    get armorInfo(){ return (typeof ARMOR_ITEM_INFO       !== 'undefined') ? ARMOR_ITEM_INFO       : {}; },
    get accInfo()  { return (typeof ACC_ITEM_INFO         !== 'undefined') ? ACC_ITEM_INFO         : {}; },
    get specialInfo(){ return (typeof SPECIAL_ITEM_INFO   !== 'undefined') ? SPECIAL_ITEM_INFO     : {}; },
    get exceedFx() { return (typeof EXCEED_UNIQUE_EFFECTS !== 'undefined') ? EXCEED_UNIQUE_EFFECTS : {}; },
    get weaponFx() { return (typeof EXCEED_WEAPON_UNIQUE_EFFECTS !== 'undefined') ? EXCEED_WEAPON_UNIQUE_EFFECTS : {}; },
};

// ============================================
// [2] 인라인 스타일 상수
// ============================================
const CS = {
    // 테두리
    BR_THIN:   'border-right:1px solid #2a3158;',
    BR_THICK:  'border-right:2px solid #aaa !important;',
    BL_THIN:   'border-left:1px solid #2a3158;',
    BT_THIN:   'border-top:1px solid #2a3158;',

    // 셀 공통
    TAG_CELL:  (color) => `text-align:center;padding:2px 6px;color:${color};font-size:0.75em;white-space:nowrap;`,
    VAL_CELL:  'text-align:center;padding:2px 8px;color:#e6e9ff;font-size:0.85em;white-space:nowrap;',
    KEY_CELL:  'text-align:center;padding:2px 8px;color:#ccc;font-size:0.82em;white-space:nowrap;',
    SLOT_CELL: 'text-align:center;padding:4px 8px;color:#e6c86e;font-size:0.85em;white-space:nowrap;font-weight:bold;',
    NAME_CELL: 'text-align:center;padding:3px 8px;color:#aad4ff;font-size:0.78em;white-space:nowrap;',
    ATTR_CELL: 'text-align:center;padding:2px 6px;color:#b0bcff;font-size:0.75em;white-space:nowrap;',
    DESC_CELL: 'padding:4px 8px;color:#c8b87a;font-size:0.8em;text-align:left;vertical-align:top;',

    // 행 배경
    ROW_HL:    'background:rgba(100,114,168,0.12);',
    ROW_ATTR:  'background:rgba(100,114,168,0.08);',
    ROW_DESC:  'background:rgba(240,165,0,0.06);',

    // 아이템 태그 색상
    TAG_BASE:   '#7a9fcf',
    TAG_EFF:    '#a0d4a0',
    TAG_MASTER: '#c8a0d4',
    TAG_UNIQUE: '#d6d989',
    TAG_ATTR:   '#b0bcff',
    TAG_DESC:   '#c8b87a',
};

// ============================================
// [3] 아이템 스탯 맵 공통 헬퍼
// ============================================

/**
 * 슬롯 DOM에서 아이템명/익시드/접두어를 읽어 스탯맵을 반환하는 공통 함수
 * @param {Element} section       - 캐릭터 섹션 DOM
 * @param {string}  slot          - 슬롯명
 * @param {Object}  itemData      - 해당 슬롯의 아이템 데이터 객체 (CmpData.armor 등)
 * @param {string}  defaultPrefix - 익시드 아이템의 기본 접두어 (예: '전격', '견고', '불굴')
 * @param {boolean} hasMastery    - 방어구 마스터리 포함 여부
 * @returns {{ itemname, exceed, prefix, stats, attrs, desc }}
 */
function _getItemSlotStats(section, slot, itemData, defaultPrefix, hasMastery = false) {
    const itemname = section.querySelector(`[data-key="${slot}_itemname"]`)?.value || '';
    const exceed   = section.querySelector(`select[data-key="${slot}_exceed"]`)?.value || '';
    const prefix   = section.querySelector(`select[data-key="${slot}_prefix"]`)?.value || '';
    if (!itemname || !itemData[itemname]) return { itemname, exceed, prefix, stats: null, attrs: [], desc: '' };

    const item   = itemData[itemname];
    const pfxKey = item.exceed ? (prefix || defaultPrefix) : (prefix || '기본');
    const eStage = exceed || '이상';
    const map    = {};

    const add = (arr, label) => {
        if (!Array.isArray(arr)) return;
        arr.forEach(e => {
            (e.stats || []).forEach(sn => {
                const k = `[${label}] ${sn}`;
                if (!map[k]) map[k] = { amount: 0, unit: e.unit || '' };
                map[k].amount += (e.amount || 0);
            });
        });
    };

    add(item.base?.[pfxKey], '기본효과');
    add(item.eff?.[pfxKey],  '효과');
    if (hasMastery) add(item.mastery?.[pfxKey], '방어구 마스터리');

    const attrs = item.attrs
        ? (item.exceed ? (item.attrs?.[eStage]?.[prefix || defaultPrefix] || []) : (item.attrs?.[pfxKey] || []))
        : [];
    const desc = item.desc
        ? (item.exceed ? (item.desc?.[eStage]?.[prefix || defaultPrefix] || '') : (item.desc?.[pfxKey] || ''))
        : '';

    return { itemname, exceed, prefix, stats: map, attrs, desc };
}

// ============================================
// [4] 수치 표시 헬퍼
// ============================================

function _fmtStatCell(myVal, otherVal, unit, hasData) {
    if (!hasData || myVal === 0) return '';
    const diff = myVal - otherVal;
    if (diff <= 0) return `${myVal}${unit}`;
    return `${myVal}${unit} <span style="color:#2ecc71;font-size:0.85em;">↑ +${diff}${unit}</span>`;
}

// ============================================
// [5] 익시드 고유효과 헬퍼
// ============================================

function getExceedUniqueEffect(job, exceed) {
    if (!job || !exceed) return '';
    const stageMap = CmpData.exceedFx[exceed];
    if (!stageMap) return '';
    for (const [keyGroup, effectText] of Object.entries(stageMap)) {
        if (keyGroup.split('|').includes(job)) return effectText;
    }
    return '';
}

function buildExceedUniqueEffectRows(effect1, exceed1, effect2, exceed2) {
    if (!effect1 && !effect2) return '';
    const exceedColor = { '이상': '#2ecc71', '선봉': '#ff5252', '의지': '#448aff' };
    const fmtEffect = (effect, exceed) => {
        if (!effect) return '<span style="color:#555;font-size:0.8em;">-</span>';
        const color = exceedColor[exceed] || '#e6e9ff';
        return effect.split('\n').map(line =>
            `<span style="display:block;line-height:1.5;color:${color};font-size:0.8em;">${line}</span>`
        ).join('');
    };
    const exceedLabel1 = exceed1 ? `<span style="color:${exceedColor[exceed1]||'#fff'};font-weight:bold;font-size:0.78em;">[${exceed1}]</span> ` : '';
    const exceedLabel2 = exceed2 ? `<span style="color:${exceedColor[exceed2]||'#fff'};font-weight:bold;font-size:0.78em;">[${exceed2}]</span> ` : '';
    return `<tr style="${CS.ROW_ATTR}">
        <td style="${CS.TAG_CELL(CS.TAG_UNIQUE)}${CS.BR_THIN}">고유 효과</td>
        <td style="text-align:left;padding:4px 8px;${CS.BR_THICK}vertical-align:top;" colspan="2">${exceedLabel1}${fmtEffect(effect1, exceed1)}</td>
        <td style="text-align:left;padding:4px 8px;${CS.BR_THIN}vertical-align:top;" colspan="2">${exceedLabel2}${fmtEffect(effect2, exceed2)}</td>
        <td style="${CS.TAG_CELL(CS.TAG_UNIQUE)}${CS.BL_THIN}">고유 효과</td>
    </tr>`;
}

// ============================================
// [6] 비교 유틸리티
// ============================================

const CompareUtils = {
    getRarityClass(rarity) { return rarity ? `rare-${rarity}` : ''; },
    getExceedClass(exceed) { return exceed ? `ex-${exceed}` : ''; },
    getPrefixClass(slot, prefix) {
        if (!prefix) return '';
        if (prefix.startsWith('T')) return 'prefix-tier';
        let classes = 'prefix-selected';
        if (slot === "무기") {
            if (prefix === "광채") classes += ' p-blue';
            else if (prefix === "분쇄") classes += ' p-red';
            else if (prefix === "선명") classes += ' p-green';
            else if (prefix === "강타") classes += ' p-yellow';
        }
        return classes;
    },
    getSealHighlightClass(slot, sealValue, statType, eleType, isSeal1 = true) {
        const armorSlots   = ["상의", "어깨", "하의", "신발", "벨트"];
        const accSlots     = ["목걸이", "팔찌", "반지"];
        const specialSlots = ["보조장비", "귀걸이", "마법석"];
        if (isSeal1) {
            if (slot === "무기" && sealValue === "데미지 증가") return 'highlight-yellow';
            if ((armorSlots.includes(slot) || specialSlots.includes(slot)) && sealValue === statType) return 'highlight-yellow';
            if (accSlots.includes(slot) && sealValue === eleType) return 'highlight-yellow';
        } else {
            if ((armorSlots.includes(slot) || slot === "무기" || specialSlots.includes(slot)) && sealValue === statType) return 'highlight-yellow';
            if (accSlots.includes(slot) && sealValue === eleType) return 'highlight-yellow';
        }
        return '';
    },
    getEmblemHighlightClass(slot, embValue, eleType) {
        if (!embValue || !eleType) return '';
        if (embValue === eleType || embValue === '모속강') return 'highlight-yellow';
        return '';
    },
    getDiffClass(diffValue) {
        if (!diffValue || diffValue === '-' || diffValue === '') return 'same';
        if (diffValue.includes('+') || diffValue.includes('⬆')) return 'positive';
        if (diffValue.includes('-') || diffValue.includes('⬇')) return 'negative';
        if (diffValue.includes('다름')) return 'negative';
        return 'same';
    }
};

// ============================================
// [7] 3열 레이아웃 비교 빌더
// ============================================

function createCompareSection(title, leftHeader, centerLabel, rightHeader, leftRows, centerRows, rightRows) {
    const wrapper = document.createElement('div');
    wrapper.className = 'compare-section-wrapper';

    const titleEl = document.createElement('div');
    titleEl.className = 'compare-section-title';
    titleEl.textContent = title;
    wrapper.appendChild(titleEl);

    const row = document.createElement('div');
    row.className = 'compare-three-col';

    const leftWrap = document.createElement('div');
    leftWrap.className = 'compare-side compare-left';
    const leftTable = buildSideTable(leftHeader, leftRows, 'left');
    leftWrap.appendChild(leftTable);

    const centerWrap = document.createElement('div');
    centerWrap.className = 'compare-center';
    const centerTable = buildCenterTable(centerLabel, centerRows);
    centerWrap.appendChild(centerTable);

    const rightWrap = document.createElement('div');
    rightWrap.className = 'compare-side compare-right';
    const rightTable = buildSideTable(rightHeader, rightRows, 'right');
    rightWrap.appendChild(rightTable);

    row.appendChild(leftWrap);
    row.appendChild(centerWrap);
    row.appendChild(rightWrap);
    wrapper.appendChild(row);

    wrapper._tables = { leftTable, centerTable, rightTable };
    return wrapper;
}

function syncRowHeights(leftTable, centerTable, rightTable) {
    [leftTable, centerTable, rightTable].forEach(t => {
        t.querySelectorAll('tr').forEach(tr => { tr.style.height = ''; });
    });
    const lRows = leftTable.querySelectorAll('tr');
    const cRows = centerTable.querySelectorAll('tr');
    const rRows = rightTable.querySelectorAll('tr');
    const maxLen = Math.max(lRows.length, cRows.length, rRows.length);
    for (let i = 0; i < maxLen; i++) {
        const heights = [];
        if (lRows[i]) heights.push(lRows[i].getBoundingClientRect().height);
        if (cRows[i]) heights.push(cRows[i].getBoundingClientRect().height);
        if (rRows[i]) heights.push(rRows[i].getBoundingClientRect().height);
        const maxH = Math.max(...heights);
        if (maxH <= 0) continue;
        if (lRows[i]) lRows[i].style.height = maxH + 'px';
        if (cRows[i]) cRows[i].style.height = maxH + 'px';
        if (rRows[i]) rRows[i].style.height = maxH + 'px';
    }
}

function buildSideTable(headers, rows, side) {
    const table = document.createElement('table');
    table.className = `compare-side-table compare-side-${side}`;
    const thead = document.createElement('thead');
    headers.forEach(headerRow => {
        const tr = document.createElement('tr');
        headerRow.forEach(cell => {
            const th = document.createElement('th');
            th.textContent = cell.text;
            if (cell.colspan) th.colSpan = cell.colspan;
            if (cell.cls)     th.className = cell.cls;
            tr.appendChild(th);
        });
        thead.appendChild(tr);
    });
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    rows.forEach(row => {
        if (row.divider) {
            const tr = document.createElement('tr');
            tr.className = 'compare-divider-row';
            tr.innerHTML = `<td colspan="99"></td>`;
            tbody.appendChild(tr);
            return;
        }
        const tr = document.createElement('tr');
        row.cells.forEach(cell => {
            const td = document.createElement('td');
            if (cell.html)    td.innerHTML = cell.html;
            else              td.textContent = cell.text ?? '';
            if (cell.cls)     td.className = cell.cls;
            if (cell.colspan) td.colSpan = cell.colspan;
            if (cell.style)   td.style.cssText = cell.style;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    return table;
}

function buildCenterTable(label, rows) {
    const table = document.createElement('table');
    table.className = 'compare-center-table';
    const thead = document.createElement('thead');
    thead.innerHTML = `<tr><th>비교값</th></tr><tr><th>차이</th></tr>`;
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    rows.forEach(row => {
        if (row.divider) {
            const tr = document.createElement('tr');
            tr.className = 'compare-divider-row';
            tr.innerHTML = `<td></td>`;
            tbody.appendChild(tr);
            return;
        }
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        if (row.html) { td.innerHTML = row.html; td.className = 'compare-diff'; }
        else { td.textContent = row.text ?? '-'; td.className = `compare-diff ${CompareUtils.getDiffClass(row.text)}`; }
        tr.appendChild(td);
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    return table;
}

// ============================================
// [8] 세트 효과 계산 함수
// ============================================

function _getArmorSetEffectsShared(section) {
    const ARMOR_SLOTS  = ["상의", "어깨", "하의", "신발", "벨트"];
    const setEffectsData = CmpData.armorSE;
    const armorItemInfo  = CmpData.armorInfo;
    const equipped = {};
    ARMOR_SLOTS.forEach(slot => {
        const itemname = section.querySelector(`[data-key="${slot}_itemname"]`)?.value || '';
        const prefix   = section.querySelector(`select[data-key="${slot}_prefix"]`)?.value || '';
        if (itemname) equipped[slot] = { itemname, prefix };
    });
    const setTotalCount = {}, setPrefixCount = {};
    Object.values(equipped).forEach(({ itemname, prefix }) => {
        const info = armorItemInfo[itemname];
        if (!info) return;
        const sn = info.setName;
        setTotalCount[sn] = (setTotalCount[sn] || 0) + 1;
        if (prefix) {
            if (!setPrefixCount[sn]) setPrefixCount[sn] = {};
            setPrefixCount[sn][prefix] = (setPrefixCount[sn][prefix] || 0) + 1;
        }
    });
    let bestSet = null, bestCount = 0;
    Object.entries(setTotalCount).forEach(([sn, c]) => { if (c > bestCount) { bestSet = sn; bestCount = c; } });
    if (!bestSet || bestCount < 3) return { baseEffects: null, prefixEffect: null };
    const setData = setEffectsData[bestSet] || {};
    const pfxCnt  = setPrefixCount[bestSet] || {};
    let bestPrefix = null, bestPrefixCount = 0;
    Object.entries(pfxCnt).forEach(([p, c]) => { if (c >= 3 && c > bestPrefixCount) { bestPrefix = p; bestPrefixCount = c; } });
    let prefixEffect = null;
    if (bestPrefix) {
        const pData = setData[bestPrefix] || {};
        prefixEffect = { prefix: bestPrefix, count: bestPrefixCount,
            effects3: bestPrefixCount >= 3 ? (pData['3'] || null) : null,
            effects5: bestPrefixCount >= 5 ? (pData['5'] || null) : null };
    }
    const allSamePrefix = bestPrefix && bestPrefixCount === bestCount;
    let baseEffects = null;
    if (!allSamePrefix) {
        const bData = setData['기본'] || {};
        if (bestPrefix) {
            const has5 = bestCount >= 5 && bData['5'];
            baseEffects = { effects3: (!has5 && bestCount >= 3) ? (bData['3'] || null) : null, effects5: has5 ? (bData['5'] || null) : null };
        } else {
            baseEffects = { effects3: bestCount >= 3 ? (bData['3'] || null) : null, effects5: bestCount >= 5 ? (bData['5'] || null) : null };
        }
    }
    return { baseEffects, prefixEffect };
}

function _getAccSetEffectsShared(section) {
    const ACC_SLOTS      = ["팔찌", "목걸이", "반지"];
    const setEffectsData = CmpData.accSE;
    const accItemInfo    = CmpData.accInfo;
    const slots = {};
    ACC_SLOTS.forEach(slot => {
        const itemname = section.querySelector(`[data-key="${slot}_itemname"]`)?.value || '';
        const prefix   = section.querySelector(`select[data-key="${slot}_prefix"]`)?.value || '';
        if (itemname) slots[slot] = { itemname, prefix };
    });
    const items = Object.values(slots);
    if (!items.length) return { effects3: null };
    const setNames = items.map(({ itemname }) => accItemInfo[itemname]?.setName).filter(Boolean);
    if (!setNames.length) return { effects3: null };
    const snCnt = {};
    setNames.forEach(s => { snCnt[s] = (snCnt[s] || 0) + 1; });
    const bestSet = Object.entries(snCnt).sort((a, b) => b[1] - a[1])[0][0];
    const count   = snCnt[bestSet];
    if (count < 3) return { effects3: null };
    const bp = slots['팔찌']?.prefix || '기본', np = slots['목걸이']?.prefix || '기본', rp = slots['반지']?.prefix || '기본';
    const resultPrefix = (bp === np && np === rp && bp !== '기본') ? bp : '기본';
    let effects3 = null;
    const setData = setEffectsData[bestSet];
    if (setData?.[resultPrefix]) { effects3 = setData[resultPrefix]["3"]; }
    else { const sd = setEffectsData[bestSet.replace(/^[^:]+:\s*/, '')]; if (sd?.[resultPrefix]) effects3 = sd[resultPrefix]["3"]; }
    return { effects3 };
}

function _getSpecialSetEffectsShared(section) {
    const SPECIAL_SLOTS   = ["귀걸이", "마법석", "보조장비"];
    const setEffectsData  = CmpData.specialSE;
    const specialItemInfo = CmpData.specialInfo;
    const slots = {};
    SPECIAL_SLOTS.forEach(slot => {
        const itemname = section.querySelector(`[data-key="${slot}_itemname"]`)?.value || '';
        const prefix   = section.querySelector(`select[data-key="${slot}_prefix"]`)?.value || '';
        if (itemname) slots[slot] = { itemname, prefix };
    });
    const items = Object.values(slots);
    if (!items.length) return { effects3: null };
    const setNames = items.map(({ itemname }) => specialItemInfo[itemname]?.setName).filter(Boolean);
    if (!setNames.length) return { effects3: null };
    const snCnt = {};
    setNames.forEach(s => { snCnt[s] = (snCnt[s] || 0) + 1; });
    const bestSet = Object.entries(snCnt).sort((a, b) => b[1] - a[1])[0][0];
    const count   = snCnt[bestSet];
    if (count < 3) return { effects3: null };
    const ep = slots['귀걸이']?.prefix || '기본', gp = slots['마법석']?.prefix || '기본', sp = slots['보조장비']?.prefix || '기본';
    const resultPrefix = (ep === gp && gp === sp && ep !== '기본') ? ep : '기본';
    let effects3 = null;
    const setData = setEffectsData[bestSet];
    if (setData?.[resultPrefix]) effects3 = setData[resultPrefix]["3"];
    return { effects3 };
}

// ============================================
// [9] 전체 스탯 합산 헬퍼
// ============================================

function collectTotalStats(section) {
    const ATTACK_SPEED_NAMES = [
        '매우 느린 공격 속도', '느린 공격 속도', '보통 공격 속도', '빠른 공격 속도', '매우 빠른 공격 속도',
        '매우 느린 뽑는 속도', '느린 뽑는 속도', '보통 뽑는 속도', '빠른 뽑는 속도', '매우 빠른 뽑는 속도',
    ];
    const statMap = {};
    const attrsSet = new Set();
    let speedStat = null;

    function addStats(statsArr) {
        if (!Array.isArray(statsArr)) return;
        statsArr.forEach(entry => {
            (entry.stats || []).forEach(statName => {
                if (ATTACK_SPEED_NAMES.includes(statName)) { if (!speedStat) speedStat = statName; return; }
                if (!statMap[statName]) statMap[statName] = { amount: 0, unit: entry.unit || '' };
                statMap[statName].amount += (entry.amount || 0);
            });
        });
    }
    function addSetEffect(eff) {
        if (!eff) return;
        addStats(eff.stats || []);
        (eff.attrs || []).forEach(a => attrsSet.add(a));
    }

    // 무기
    const weaponData   = CmpData.weapon;
    const weaponName   = section.querySelector('[data-key="무기_itemname"]')?.value || '';
    const weaponExceed = section.querySelector('select[data-key="무기_exceed"]')?.value || '';
    if (weaponName && weaponData[weaponName]) {
        const item = weaponData[weaponName];
        const src  = (weaponExceed === '침식' && item.침식) ? item.침식 : item;
        addStats(src.base); addStats(src.eff);
        (src.attrs || []).forEach(a => attrsSet.add(a));
    }

    // 방어구
    const armorData = CmpData.armor;
    ["상의", "어깨", "하의", "신발", "벨트"].forEach(slot => {
        const itemname = section.querySelector(`[data-key="${slot}_itemname"]`)?.value || '';
        const prefix   = section.querySelector(`select[data-key="${slot}_prefix"]`)?.value || '';
        if (!itemname || !armorData[itemname]) return;
        const item = armorData[itemname], pfx = prefix || '기본';
        addStats(item.base?.[pfx]); addStats(item.eff?.[pfx]); addStats(item.mastery?.[pfx]);
        (item.attrs?.[pfx] || []).forEach(a => attrsSet.add(a));
    });
    const armorSE = _getArmorSetEffectsShared(section);
    addSetEffect(armorSE.baseEffects?.effects3); addSetEffect(armorSE.baseEffects?.effects5);
    addSetEffect(armorSE.prefixEffect?.effects3); addSetEffect(armorSE.prefixEffect?.effects5);

    // 악세서리
    const accData = CmpData.acc;
    ["팔찌", "목걸이", "반지"].forEach(slot => {
        const itemname = section.querySelector(`[data-key="${slot}_itemname"]`)?.value || '';
        const prefix   = section.querySelector(`select[data-key="${slot}_prefix"]`)?.value || '';
        if (!itemname || !accData[itemname]) return;
        const item = accData[itemname], pfx = prefix || '기본';
        addStats(item.base?.[pfx]); addStats(item.eff?.[pfx]);
        (item.attrs?.[pfx] || []).forEach(a => attrsSet.add(a));
    });
    const accSE = _getAccSetEffectsShared(section);
    addSetEffect(accSE.effects3);

    // 특수장비
    const specialData = CmpData.special;
    ["귀걸이", "마법석", "보조장비"].forEach(slot => {
        const itemname = section.querySelector(`[data-key="${slot}_itemname"]`)?.value || '';
        const prefix   = section.querySelector(`select[data-key="${slot}_prefix"]`)?.value || '';
        if (!itemname || !specialData[itemname]) return;
        const item = specialData[itemname], pfx = prefix || '기본';
        addStats(item.base?.[pfx]); addStats(item.eff?.[pfx]);
        (item.attrs?.[pfx] || []).forEach(a => attrsSet.add(a));
    });
    const specialSE = _getSpecialSetEffectsShared(section);
    addSetEffect(specialSE.effects3);

    return { statMap, speedStat, attrs: attrsSet };
}

// ============================================
// [10] 스탯 비교 테이블 공통 헬퍼
// ============================================

function _statTableThead(name1, name2) {
    return `
    <thead>
        <tr>
            <th colspan="3" style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.85em;color:#ffd700;${CS.BR_THICK}">${name1}</th>
            <th colspan="3" style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.85em;color:#ffd700;">${name2}</th>
        </tr>
        <tr>
            <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:80px;${CS.BR_THIN}">구분</th>
            <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;">스탯</th>
            <th class="stat-divider-right" style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:140px;${CS.BR_THICK}">수치</th>
            <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:140px;${CS.BR_THIN}">수치</th>
            <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;">스탯</th>
            <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:80px;">구분</th>
        </tr>
    </thead>`;
}

function _statRow(tagColor, sectionTag, displayKey, display1, display2, highlight, hasData1, hasData2) {
    return `<tr style="${highlight}">
    <td style="${CS.TAG_CELL(tagColor)}${CS.BR_THIN}">${hasData1 ? sectionTag : ''}</td>
    <td style="${CS.KEY_CELL}">${hasData1 ? displayKey : ''}</td>
    <td class="stat-divider-right" style="${CS.VAL_CELL}${CS.BR_THICK}">${display1}</td>
    <td style="${CS.VAL_CELL}${CS.BR_THIN}">${display2}</td>
    <td style="${CS.KEY_CELL}">${hasData2 ? displayKey : ''}</td>
    <td style="${CS.TAG_CELL(tagColor)}${CS.BL_THIN}">${hasData2 ? sectionTag : ''}</td>
</tr>`;
}

function _setEffectThead(name1, name2) {
    return `
    <thead>
        <tr>
            <th colspan="3" style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.85em;color:#ffd700;${CS.BR_THICK}">${name1}</th>
            <th colspan="3" style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.85em;color:#ffd700;">${name2}</th>
        </tr>
        <tr>
            <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:80px;${CS.BR_THIN}">구분</th>
            <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;">스탯</th>
            <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:140px;${CS.BR_THICK}">수치</th>
            <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:140px;${CS.BR_THIN}">수치</th>
            <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;">스탯</th>
            <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:80px;">구분</th>
        </tr>
    </thead>`;
}

// ============================================
// [11] 슬롯 데이터 / 특수 슬롯 헬퍼
// ============================================

function getSlotData(section, slot) {
    return {
        rarity:      section.querySelector(`select[data-key="${slot}_rarity"]`)?.value     || '',
        exceed:      section.querySelector(`select[data-key="${slot}_exceed"]`)?.value     || '',
        prefix:      section.querySelector(`select[data-key="${slot}_prefix"]`)?.value     || '',
        itemname:    section.querySelector(`[data-key="${slot}_itemname"]`)?.value         || '',
        reinforce:   section.querySelector(`input[data-key="${slot}_reinforce"]`)?.value   || '',
        seal1:       section.querySelector(`select[data-key="${slot}_seal1"]`)?.value      || '',
        seal1_val:   section.querySelector(`input[data-key="${slot}_seal1_val"]`)?.value   || '',
        seal2:       section.querySelector(`select[data-key="${slot}_seal2"]`)?.value      || '',
        seal2_val:   section.querySelector(`input[data-key="${slot}_seal2_val"]`)?.value   || '',
        emb1:        section.querySelector(`[data-key="${slot}_emb1"]`)?.value             || '',
        emb2:        section.querySelector(`[data-key="${slot}_emb2"]`)?.value             || '',
        enchant:     section.querySelector(`input[data-key="${slot}_enchant"]`)?.value     || '',
        enchant_val: section.querySelector(`input[data-key="${slot}_enchant_val"]`)?.value || ''
    };
}

function getSpecialSlotName(section, slot) {
    if (slot === '칭호')  { const btn = section.querySelector('[data-key="칭호_itemname"]');  return btn ? (btn.getAttribute('data-title-name')   || btn.textContent.trim() || '') : ''; }
    if (slot === '오라')  { const btn = section.querySelector('[data-key="오라_itemname"]');  return btn ? (btn.getAttribute('data-aura-name')    || btn.textContent.trim() || '') : ''; }
    if (slot === '아바타'){ const btn = section.querySelector('[data-key="아바타_itemname"]'); return btn ? (btn.getAttribute('data-avatar-value') || btn.textContent.trim() || '') : ''; }
    return '';
}

function _parseSpecialStats(statsJson) {
    try {
        const data = typeof statsJson === 'string' ? JSON.parse(statsJson) : statsJson;
        const lines = [];
        const push = (arr, label) => {
            if (!arr || !arr.length) return;
            arr.forEach(e => {
                const names = (e.stats || []).join(', ');
                const val   = e.amount != null ? `${e.amount}${e.unit || ''}` : '';
                if (names) lines.push(`[${label}] ${names}${val ? ' +' + val : ''}`);
            });
        };
        push(data.base, '기본'); push(data.eff, '효과');
        return lines;
    } catch (e) { return []; }
}

console.log("✅ mode-compare-utils.js 로드 완료");