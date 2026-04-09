// ============================================
// mode-compare.js - 비교 모드 기능 (리팩토링 완료)
// ============================================


function getExceedUniqueEffect(job, exceed) {
    if (!job || !exceed) return '';
    if (typeof EXCEED_UNIQUE_EFFECTS === 'undefined') return '';
    const stageMap = EXCEED_UNIQUE_EFFECTS[exceed];
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
    const isSame = effect1 === effect2;
    const diffText  = isSame ? '동일' : '다름';
    const diffStyle = isSame ? 'color:#888;' : 'color:#f0a500;font-weight:bold;';
    const exceedLabel1 = exceed1 ? `<span style="color:${exceedColor[exceed1]||'#fff'};font-weight:bold;font-size:0.78em;">[${exceed1}]</span> ` : '';
    const exceedLabel2 = exceed2 ? `<span style="color:${exceedColor[exceed2]||'#fff'};font-weight:bold;font-size:0.78em;">[${exceed2}]</span> ` : '';
    return `<tr style="background:rgba(100,114,168,0.08);">
        <td style="text-align:center;padding:2px 6px;color:#d6d989;font-size:0.75em;white-space:nowrap;border-right:1px solid #2a3158;">고유 효과</td>
        <td style="padding:4px 8px;border-right:1px solid #2a3158;vertical-align:top;" colspan="2">
            ${exceedLabel1}${fmtEffect(effect1, exceed1)}
        </td>
        <td style="text-align:center;padding:2px 8px;font-size:0.85em;white-space:nowrap;border-right:1px solid #2a3158;${diffStyle}">${diffText}</td>
        <td style="padding:4px 8px;border-right:1px solid #2a3158;vertical-align:top;" colspan="2">
            ${exceedLabel2}${fmtEffect(effect2, exceed2)}
        </td>
        <td style="text-align:center;padding:2px 6px;color:#d6d989;font-size:0.75em;white-space:nowrap;border-left:1px solid #2a3158;">고유 효과</td>
    </tr>`;
}

/**
 * 비교 유틸리티 함수
 */
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
        const armorSlots = ["상의", "어깨", "하의", "신발", "벨트"];
        const accSlots = ["목걸이", "팔찌", "반지"];
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
        if (embValue === eleType) return 'highlight-yellow';
        if (embValue === '모속강') return 'highlight-yellow';
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
// 3열 레이아웃 비교 빌더
// ============================================

/**
 * 비교 섹션(3열) 생성
 * leftRows: [{cells}], centerRows: [{text, cls}], rightRows: [{cells}]
 */
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

    // 나중에 동기화할 수 있도록 테이블 참조 저장
    wrapper._tables = { leftTable, centerTable, rightTable };

    return wrapper;
}

function syncRowHeights(leftTable, centerTable, rightTable) {
    const leftRows  = leftTable.querySelectorAll('tr');
    const centerRows = centerTable.querySelectorAll('tr');
    const rightRows = rightTable.querySelectorAll('tr');

    const maxLen = Math.max(leftRows.length, centerRows.length, rightRows.length);
    for (let i = 0; i < maxLen; i++) {
        const heights = [];
        if (leftRows[i])   heights.push(leftRows[i].getBoundingClientRect().height);
        if (centerRows[i]) heights.push(centerRows[i].getBoundingClientRect().height);
        if (rightRows[i])  heights.push(rightRows[i].getBoundingClientRect().height);
        const maxH = Math.max(...heights);
        if (leftRows[i])   leftRows[i].style.height   = maxH + 'px';
        if (centerRows[i]) centerRows[i].style.height = maxH + 'px';
        if (rightRows[i])  rightRows[i].style.height  = maxH + 'px';
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
            if (cell.cls) th.className = cell.cls;
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
            if (cell.html) td.innerHTML = cell.html;
            else td.textContent = cell.text ?? '';
            if (cell.cls) td.className = cell.cls;
            if (cell.colspan) td.colSpan = cell.colspan;
            if (cell.style) td.style.cssText = cell.style;
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
// 각 비교 섹션 데이터 생성
// ============================================

function buildEquipmentCompare(section1, section2, name1, name2) {
    const slots = ["무기", "상의", "어깨", "하의", "신발", "벨트", "목걸이", "팔찌", "반지", "보조장비", "귀걸이", "마법석", "칭호", "외형칭호", "오라", "아바타"];
    const groups = { group1: ["무기"], group2: ["상의"], group3: ["목걸이"], group4: ["보조장비"], group5: ["칭호"] };
    const dividerBefore = ["상의", "목걸이", "보조장비", "칭호"];

    const leftRows = [], centerRows = [], rightRows = [];

    const specialSlots = ['칭호', '오라', '아바타'];

    slots.forEach(slot => {
        if (dividerBefore.includes(slot)) {
            leftRows.push({ divider: true });
            centerRows.push({ divider: true });
            rightRows.push({ divider: true });
        }

        // 칭호/오라/아바타: 이름 표시 + 중앙에 비교 버튼
        if (specialSlots.includes(slot)) {
            const rawName1 = getSpecialSlotName(section1, slot);
            const rawName2 = getSpecialSlotName(section2, slot);
            const s1Id = section1.id;
            const s2Id = section2.id;
            const btnHtml = `<button onclick="openCompareSpecialPopup('${slot}','${s1Id}','${s2Id}',this)" style="font-size:0.85em;padding:2px 8px;cursor:pointer;background:#2a3158;color:#fff;border:1px solid #4a5178;border-radius:4px;">비교</button>`;

            // 아바타: 값이 있으면 "아바타", 없으면 빈칸
            const displayName = (slot === '아바타')
                ? (rawName1 ? '아바타' : '')
                : rawName1;
            const displayName2 = (slot === '아바타')
                ? (rawName2 ? '아바타' : '')
                : rawName2;

            leftRows.push({ cells: [
                    { text: slot, cls: 'compare-slot-name' },
                    { text: displayName, colspan: 5, style: 'max-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;' },
                ]});
            centerRows.push({ html: btnHtml });
            rightRows.push({ cells: [
                    { text: displayName2, colspan: 5, style: 'max-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;' },
                    { text: slot, cls: 'compare-slot-name' },
                ]});
            return;
        }

        const d1 = getSlotData(section1, slot);
        const d2 = getSlotData(section2, slot);
        const diff = calculateReinforceDiff(slot, d1.reinforce, d2.reinforce);

        leftRows.push({ cells: [
                { text: slot, cls: 'compare-slot-name' },
                { text: d1.rarity, cls: CompareUtils.getRarityClass(d1.rarity) },
                { text: d1.exceed, cls: CompareUtils.getExceedClass(d1.exceed) },
                { text: d1.prefix, cls: CompareUtils.getPrefixClass(slot, d1.prefix) },
                { text: d1.itemname },
                { text: d1.reinforce },
            ]});
        centerRows.push({ text: diff });
        rightRows.push({ cells: [
                { text: d2.reinforce },
                { text: d2.itemname },
                { text: d2.prefix, cls: CompareUtils.getPrefixClass(slot, d2.prefix) },
                { text: d2.exceed, cls: CompareUtils.getExceedClass(d2.exceed) },
                { text: d2.rarity, cls: CompareUtils.getRarityClass(d2.rarity) },
                { text: slot, cls: 'compare-slot-name' },
            ]});
    });

    return createCompareSection(
        '*장비 비교*',
        [
            [{ text: name1, colspan: 6 }],
            [{ text: '슬롯' }, { text: '희귀도' }, { text: '익시드' }, { text: '접두어' }, { text: '아이템이름' }, { text: '강화' }]
        ],
        name1 + ' vs ' + name2,
        [
            [{ text: name2, colspan: 6 }],
            [{ text: '강화' }, { text: '아이템이름' }, { text: '접두어' }, { text: '익시드' }, { text: '희귀도' }, { text: '슬롯' }]
        ],
        leftRows, centerRows, rightRows
    );
}

function buildSealCompare(section1, section2, name1, name2, isSeal1) {
    const slots = ["무기", "상의", "어깨", "하의", "신발", "벨트", "목걸이", "팔찌", "반지", "보조장비", "귀걸이", "마법석"];
    const dividerBefore = ["목걸이", "보조장비"];
    const sealKey = isSeal1 ? 'seal1' : 'seal2';
    const sealValKey = isSeal1 ? 'seal1_val' : 'seal2_val';
    const label = isSeal1 ? '고유 옵션' : '일반 옵션';

    const statType1 = section1.querySelector(`select[data-key="info_stat_type"]`)?.value || "";
    const eleType1  = section1.querySelector(`select[data-key="info_ele_type"]`)?.value || "";
    const statType2 = section2.querySelector(`select[data-key="info_stat_type"]`)?.value || "";
    const eleType2  = section2.querySelector(`select[data-key="info_ele_type"]`)?.value || "";

    const leftRows = [], centerRows = [], rightRows = [];

    slots.forEach(slot => {
        if (dividerBefore.includes(slot)) {
            leftRows.push({ divider: true }); centerRows.push({ divider: true }); rightRows.push({ divider: true });
        }

        const d1 = getSlotData(section1, slot);
        const d2 = getSlotData(section2, slot);
        const sc1 = CompareUtils.getSealHighlightClass(slot, d1[sealKey], statType1, eleType1, isSeal1);
        const sc2 = CompareUtils.getSealHighlightClass(slot, d2[sealKey], statType2, eleType2, isSeal1);

        let diff = '-';
        if (d1[sealKey] === d2[sealKey] && d1[sealKey] !== '') diff = calculateNumDiff(d1[sealValKey], d2[sealValKey]);
        else if (d1[sealKey] !== d2[sealKey] && (d1[sealKey] !== '' || d2[sealKey] !== '')) diff = isSeal1 ? '고유옵션 값이 다름' : '일반옵션 값이 다름';

        leftRows.push({ cells: [{ text: slot, cls: 'compare-slot-name' }, { text: d1[sealKey], cls: sc1 }, { text: d1[sealValKey], cls: sc1 }] });
        centerRows.push({ text: diff });
        rightRows.push({ cells: [{ text: d2[sealValKey], cls: sc2 }, { text: d2[sealKey], cls: sc2 }, { text: slot, cls: 'compare-slot-name' }] });
    });

    return createCompareSection(
        `*마법봉인 비교 (${label})*`,
        [[{ text: name1, colspan: 3 }], [{ text: '슬롯' }, { text: label }, { text: '수치' }]],
        name1 + ' vs ' + name2,
        [[{ text: name2, colspan: 3 }], [{ text: '수치' }, { text: label }, { text: '슬롯' }]],
        leftRows, centerRows, rightRows
    );
}

function buildEmblemCompare(section1, section2, name1, name2) {
    const slots = ["무기", "상의", "어깨", "하의", "신발", "벨트", "목걸이", "팔찌", "반지", "보조장비", "귀걸이", "마법석", "칭호"];
    const selectSlots = ["보조장비", "귀걸이", "마법석", "칭호"];
    const dividerBefore = ["목걸이", "보조장비", "칭호"];

    const eleType1 = section1.querySelector(`select[data-key="info_ele_type"]`)?.value || "";
    const eleType2 = section2.querySelector(`select[data-key="info_ele_type"]`)?.value || "";

    const leftRows = [], centerRows = [], rightRows = [];

    slots.forEach(slot => {
        if (dividerBefore.includes(slot)) {
            leftRows.push({ divider: true }); centerRows.push({ divider: true }); rightRows.push({ divider: true });
        }

        const d1 = getSlotData(section1, slot);
        const d2 = getSlotData(section2, slot);
        const ec1 = CompareUtils.getEmblemHighlightClass(slot, d1.emb1, eleType1);
        const ec2 = CompareUtils.getEmblemHighlightClass(slot, d2.emb1, eleType2);

        let diff = '-';
        if (selectSlots.includes(slot)) {
            if (d1.emb1 === d2.emb1 && d1.emb1 !== '') diff = calculateNumDiff(extractNumber(d1.emb2), extractNumber(d2.emb2));
            else if (d1.emb1 !== d2.emb1 && (d1.emb1 !== '' || d2.emb1 !== '')) diff = '엠블렘 값이 다름';
        } else {
            const e1 = calculateNumDiff(extractNumber(d1.emb1), extractNumber(d2.emb1));
            const e2 = calculateNumDiff(extractNumber(d1.emb2), extractNumber(d2.emb2));
            diff = `${e1} / ${e2}`;
        }

        leftRows.push({ cells: [{ text: slot, cls: 'compare-slot-name' }, { text: d1.emb1, cls: ec1 }, { text: d1.emb2, cls: ec1 }] });
        centerRows.push({ text: diff });
        rightRows.push({ cells: [{ text: d2.emb1, cls: ec2 }, { text: d2.emb2, cls: ec2 }, { text: slot, cls: 'compare-slot-name' }] });
    });

    return createCompareSection(
        '*엠블렘 비교*',
        [[{ text: name1, colspan: 3 }], [{ text: '슬롯' }, { text: '엠블렘1' }, { text: '엠블렘2' }]],
        name1 + ' vs ' + name2,
        [[{ text: name2, colspan: 3 }], [{ text: '엠블렘1' }, { text: '엠블렘2' }, { text: '슬롯' }]],
        leftRows, centerRows, rightRows
    );
}

function buildEnchantCompare(section1, section2, name1, name2) {
    const slots = ["무기", "상의", "어깨", "하의", "신발", "벨트", "목걸이", "팔찌", "반지", "보조장비", "귀걸이", "마법석", "칭호"];
    const dividerBefore = ["목걸이", "보조장비", "칭호"];

    const leftRows = [], centerRows = [], rightRows = [];

    slots.forEach(slot => {
        if (dividerBefore.includes(slot)) {
            leftRows.push({ divider: true }); centerRows.push({ divider: true }); rightRows.push({ divider: true });
        }

        const d1 = getSlotData(section1, slot);
        const d2 = getSlotData(section2, slot);

        let diff = '-';
        if (d1.enchant === d2.enchant && d1.enchant !== '') diff = calculateNumDiff(d1.enchant_val, d2.enchant_val);
        else if (d1.enchant !== d2.enchant && (d1.enchant !== '' || d2.enchant !== '')) diff = '마법부여 값이 다름';

        leftRows.push({ cells: [{ text: slot, cls: 'compare-slot-name' }, { text: d1.enchant }, { text: d1.enchant_val }] });
        centerRows.push({ text: diff });
        rightRows.push({ cells: [{ text: d2.enchant_val }, { text: d2.enchant }, { text: slot, cls: 'compare-slot-name' }] });
    });

    return createCompareSection(
        '*마법부여 비교*',
        [[{ text: name1, colspan: 3 }], [{ text: '슬롯' }, { text: '마법부여' }, { text: '수치' }]],
        name1 + ' vs ' + name2,
        [[{ text: name2, colspan: 3 }], [{ text: '수치' }, { text: '마법부여' }, { text: '슬롯' }]],
        leftRows, centerRows, rightRows
    );
}

// 기존 CompareTable은 호환성을 위해 빈 객체로 유지
const CompareTable = {};

// ============================================
// 전체 장비 스탯 표 (전체 비교 탭)
// ============================================

/**
 * armor.js / accessory.js / special.js 전체 아이템을 스탯 표 형식으로 렌더링
 * - exceed:true  → 이상 + 첫번째 접두어 조합으로 1행
 * - exceed:false → 기본 / 접두어1 / 접두어2 각각 1행씩
 */
function buildAllItemsCompare(container) {
    const armorData   = (typeof ARMOR_ITEM_STATS   !== 'undefined') ? ARMOR_ITEM_STATS   : {};
    const accData     = (typeof ACCESSORY_ITEM_STATS !== 'undefined') ? ACCESSORY_ITEM_STATS : {};
    const specialData = (typeof SPECIAL_ITEM_STATS  !== 'undefined') ? SPECIAL_ITEM_STATS  : {};

    // 섹션별 렌더
    const sections = [
        { label: '방어구', data: armorData,   type: 'armor'   },
        { label: '악세서리', data: accData,   type: 'acc'     },
        { label: '특수장비', data: specialData, type: 'special' },
    ];

    sections.forEach(({ label, data, type }) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'compare-section-wrapper';
        wrapper.style.marginBottom = '24px';

        const titleEl = document.createElement('div');
        titleEl.className = 'compare-section-title';
        titleEl.textContent = `*${label} 전체 스탯*`;
        wrapper.appendChild(titleEl);

        const tableWrap = document.createElement('div');
        tableWrap.style.cssText = 'overflow-x:auto;margin-top:6px;';

        let tbodyHtml = '';

        Object.entries(data).forEach(([itemname, item]) => {
            // 이 아이템에서 표시할 (접두어, 레이블) 조합 목록 생성
            const variants = _getAllItemVariants(item, itemname);

            variants.forEach(({ prefixKey, displayLabel }, varIdx) => {
                const stats = _extractStatMap(item, prefixKey, type);
                const allKeys = Object.keys(stats);

                const sectionOrder = ['[기본효과]', '[효과]', '[방어구 마스터리]'];
                allKeys.sort((a, b) => {
                    const sa = sectionOrder.findIndex(s => a.startsWith(s));
                    const sb = sectionOrder.findIndex(s => b.startsWith(s));
                    return (sa === -1 ? 99 : sa) - (sb === -1 ? 99 : sb);
                });

                // 아이템 구분선 (첫번째 variant의 첫번째 행 앞)
                if (varIdx === 0) {
                    tbodyHtml += `<tr><td colspan="4" style="padding:0;border-top:2px solid #2a3158;"></td></tr>`;
                }

                // 아이템+접두어 헤더 행
                tbodyHtml += `<tr>
                    <td colspan="4" style="padding:4px 10px;background:rgba(100,114,168,0.18);color:#aad4ff;font-size:0.82em;white-space:nowrap;font-weight:bold;">
                        ${displayLabel}
                    </td>
                </tr>`;

                if (allKeys.length === 0) {
                    tbodyHtml += `<tr><td colspan="4" style="padding:3px 10px;color:#555;font-size:0.8em;">(스탯 데이터 없음)</td></tr>`;
                }

                allKeys.forEach(key => {
                    const entry = stats[key];
                    const v = entry.amount;
                    const unit = entry.unit || '';
                    const displayKey = key.replace(/^\[기본효과\] |^\[효과\] |^\[방어구 마스터리\] /, '');
                    const sectionTag = key.match(/^\[(.+?)\]/)?.[1] || '';
                    const tagColor = sectionTag === '기본효과' ? '#7a9fcf' : sectionTag === '효과' ? '#a0d4a0' : '#c8a0d4';

                    tbodyHtml += `<tr>
                        <td style="text-align:center;padding:2px 8px;color:${tagColor};font-size:0.75em;white-space:nowrap;width:90px;border-right:1px solid #2a3158;">${sectionTag}</td>
                        <td style="text-align:left;padding:2px 10px;color:#ccc;font-size:0.82em;white-space:nowrap;">${displayKey}</td>
                        <td style="text-align:center;padding:2px 10px;color:#e6e9ff;font-size:0.85em;white-space:nowrap;border-left:1px solid #2a3158;width:80px;">${v !== 0 ? `${v}${unit}` : ''}</td>
                        <td style="width:10px;"></td>
                    </tr>`;
                });

                // attrs 행
                const attrs = _getItemAttrs(item, prefixKey);
                if (attrs.length > 0) {
                    const attrHtml = attrs.map(a =>
                        `<span style="display:inline-block;padding:1px 6px;border-radius:3px;background:rgba(100,114,168,0.25);color:#b0bcff;font-size:0.8em;margin:1px 2px;">${a}</span>`
                    ).join(' ');
                    tbodyHtml += `<tr style="background:rgba(100,114,168,0.08);">
                        <td style="text-align:center;padding:2px 8px;color:#b0bcff;font-size:0.75em;white-space:nowrap;border-right:1px solid #2a3158;">속성</td>
                        <td colspan="3" style="padding:3px 10px;">${attrHtml}</td>
                    </tr>`;
                }

                // desc 행
                const desc = _getItemDesc(item, prefixKey);
                if (desc) {
                    const fmtDesc = desc.split('\n').map(line =>
                        `<span style="display:block;line-height:1.5;">${line}</span>`
                    ).join('');
                    tbodyHtml += `<tr>
                        <td style="text-align:center;padding:2px 8px;color:#c8b87a;font-size:0.75em;white-space:nowrap;border-right:1px solid #2a3158;">설명</td>
                        <td colspan="3" style="padding:4px 10px;color:#c8b87a;font-size:0.8em;text-align:left;vertical-align:top;">${fmtDesc}</td>
                    </tr>`;
                }
            });
        });

        tableWrap.innerHTML = `
        <table style="border-collapse:collapse;width:max-content;min-width:340px;">
            <thead>
                <tr>
                    <th style="padding:4px 8px;text-align:center;font-size:0.8em;width:90px;border-right:1px solid #2a3158;">구분</th>
                    <th style="padding:4px 8px;text-align:center;font-size:0.8em;">스탯</th>
                    <th style="padding:4px 8px;text-align:center;font-size:0.8em;width:80px;border-left:1px solid #2a3158;">수치</th>
                    <th style="width:10px;"></th>
                </tr>
            </thead>
            <tbody>${tbodyHtml}</tbody>
        </table>`;

        wrapper.appendChild(tableWrap);
        container.appendChild(wrapper);
    });
}

/**
 * 아이템의 표시 variant 목록 반환
 * exceed:true  → [{ prefixKey: '이상+첫번째접두어', displayLabel }]
 * exceed:false → 접두어별 각각
 */
function _getAllItemVariants(item, itemname) {
    const variants = [];
    if (item.exceed) {
        // exceed:true → 이상 + base의 첫번째 접두어
        const firstPrefix = Object.keys(item.base || {})[0] || '';
        variants.push({
            prefixKey:    firstPrefix,
            displayLabel: `[익시드 이상] ${itemname} / ${firstPrefix}`,
        });
    } else {
        // exceed:false → base의 모든 접두어 각각
        const prefixes = Object.keys(item.base || {});
        prefixes.forEach(pfx => {
            const label = pfx === '기본' ? `${itemname}` : `${itemname} / ${pfx}`;
            variants.push({
                prefixKey:    pfx,
                displayLabel: label,
            });
        });
    }
    return variants;
}

/**
 * 아이템의 스탯 맵 추출 (base + eff + mastery)
 */
function _extractStatMap(item, prefixKey, type) {
    const map = {};
    const addToMap = (arr, section) => {
        if (!Array.isArray(arr)) return;
        arr.forEach(entry => {
            (entry.stats || []).forEach(statName => {
                const key = `[${section}] ${statName}`;
                if (!map[key]) map[key] = { amount: 0, unit: entry.unit || '' };
                map[key].amount += (entry.amount || 0);
            });
        });
    };

    addToMap(item.base?.[prefixKey],    '기본효과');
    addToMap(item.eff?.[prefixKey],     '효과');
    if (type === 'armor') {
        addToMap(item.mastery?.[prefixKey], '방어구 마스터리');
    }
    return map;
}

/**
 * 아이템의 attrs 반환
 */
function _getItemAttrs(item, prefixKey) {
    if (!item.attrs) return [];
    const val = item.attrs[prefixKey];
    if (Array.isArray(val)) return val;
    return [];
}

/**
 * 아이템의 desc 반환
 */
function _getItemDesc(item, prefixKey) {
    if (!item.desc) return '';
    const val = item.desc[prefixKey];
    return typeof val === 'string' ? val : '';
}


// ============================================
// 메인 함수들
// ============================================

/**
 * 기본 모드로 전환
 */
function switchToBasicMode() {
    document.getElementById('characterContainer').style.display = 'block';
    document.getElementById('compareCharSelectionContainer').style.display = 'none';
    document.getElementById('compareContainer').style.display = 'none';
    document.getElementById('compareTabBar').style.display = 'none';
    document.getElementById('searchContainer').style.display = 'none';

    document.getElementById('btnBasicMode').classList.add('active');
    document.getElementById('btnCompareMode').classList.remove('active');
    document.getElementById('btnSearchMode').classList.remove('active');

    if (typeof closeRuneModal === 'function') closeRuneModal();
    if (typeof closeHistoryModal === 'function') closeHistoryModal();
}

/**
 * 비교 모드 진입
 */
function enterCompareMode() {
    const sections = document.querySelectorAll('.char-section');
    if (sections.length === 0) {
        alert("비교할 캐릭터가 없습니다.");
        return;
    }

    document.getElementById('characterContainer').style.display = 'none';
    document.getElementById('compareCharSelectionContainer').style.display = 'block';
    document.getElementById('compareContainer').style.display = 'none';
    document.getElementById('compareTabBar').style.display = 'none';
    document.getElementById('searchContainer').style.display = 'none';

    document.getElementById('btnBasicMode').classList.remove('active');
    document.getElementById('btnCompareMode').classList.add('active');
    document.getElementById('btnSearchMode').classList.remove('active');

    const selectLeft = document.getElementById('compareCharacterSelectLeft');
    const selectRight = document.getElementById('compareCharacterSelectRight');
    selectLeft.innerHTML = '<option value="">캐릭터 선택...</option>';
    selectRight.innerHTML = '<option value="">캐릭터 선택...</option>';
    AppState.compareSelection = { left: null, right: null };

    // 캐릭터 정보 수집
    const charList = [];
    sections.forEach(section => {
        const charId  = section.id;
        const job     = section.querySelector('[data-key="info_job"]')?.value  || '미정';
        const name    = section.querySelector('[data-key="info_name"]')?.value || '이름없음';
        const stat    = section.querySelector('[data-key="info_stat_type"]')?.value || '';
        const ele     = section.querySelector('[data-key="info_ele_type"]')?.value || '';
        charList.push({ charId, displayName: `${job}(${name})`, stat, ele });
    });

    const stats = ['힘', '지능'];
    const eles  = ['화속강', '수속강', '명속강', '암속강'];

    const addOption = (select, charId, displayName) => {
        const opt = document.createElement('option');
        opt.value = charId;
        opt.textContent = displayName;
        select.appendChild(opt);
    };

    const addDisabled = (select, text) => {
        const opt = document.createElement('option');
        opt.disabled = true;
        opt.textContent = text;
        opt.style.color = '#ffd700';
        opt.style.fontWeight = 'bold';
        select.appendChild(opt);
    };

    stats.forEach(stat => {
        let statHeaderAdded = false;

        eles.forEach(ele => {
            const matched = charList.filter(c => c.stat === stat && c.ele === ele);
            if (matched.length === 0) return;

            if (!statHeaderAdded) {
                addDisabled(selectLeft,  '');
                addDisabled(selectRight, '');
                addDisabled(selectLeft,  `── ${stat} ──`);
                addDisabled(selectRight, `── ${stat} ──`);
                statHeaderAdded = true;
            }

            addDisabled(selectLeft,  `  ${ele}`);
            addDisabled(selectRight, `  ${ele}`);
            matched.forEach(({ charId, displayName }) => {
                addOption(selectLeft,  charId, `    ${displayName}`);
                addOption(selectRight, charId, `    ${displayName}`);
            });
        });
    });

    // 스탯/속강 미설정 캐릭터
    const others = charList.filter(c => !c.stat && !c.ele);
    if (others.length > 0) {
        addDisabled(selectLeft,  '── 기타 ──');
        addDisabled(selectRight, '── 기타 ──');
        others.forEach(({ charId, displayName }) => {
            addOption(selectLeft,  charId, `  ${displayName}`);
            addOption(selectRight, charId, `  ${displayName}`);
        });
    }

    selectLeft.addEventListener('change', (e) => {
        AppState.compareSelection.left = e.target.value || null;
        if (AppState.compareSelection.left && AppState.compareSelection.right) {
            displayComparison();
        } else {
            document.getElementById('compareContainer').style.display = 'none';
        }
    });

    selectRight.addEventListener('change', (e) => {
        AppState.compareSelection.right = e.target.value || null;
        if (AppState.compareSelection.left && AppState.compareSelection.right) {
            displayComparison();
        } else {
            document.getElementById('compareContainer').style.display = 'none';
        }
    });
}

/**
 * 비교 결과 표시 (리팩토링 완료)
 */
function displayComparison() {
    document.getElementById('compareCharSelectionContainer').style.display = 'block';
    document.getElementById('compareContainer').style.display = 'block';
    document.getElementById('compareTabBar').style.display = 'block';

    const charId1 = AppState.compareSelection.left;
    const charId2 = AppState.compareSelection.right;

    const section1 = document.getElementById(charId1);
    const section2 = document.getElementById(charId2);

    const job1 = section1.querySelector('[data-key="info_job"]')?.value || '미정';
    const name1 = section1.querySelector('[data-key="info_name"]')?.value || '이름없음';
    const power1 = section1.querySelector('[data-key="info_power"]')?.value || '-';
    const job2 = section2.querySelector('[data-key="info_job"]')?.value || '미정';
    const name2 = section2.querySelector('[data-key="info_name"]')?.value || '이름없음';
    const power2 = section2.querySelector('[data-key="info_power"]')?.value || '-';

    const displayName1 = `${job1}(${name1}) / ${power1}`;
    const displayName2 = `${job2}(${name2}) / ${power2}`;

    // 장비 비교 탭
    const containerEq = document.getElementById('compareContentEq');
    containerEq.innerHTML = '';

    const sections = [
        buildEquipmentCompare(section1, section2, displayName1, displayName2),
        buildSealCompare(section1, section2, displayName1, displayName2, true),
        buildSealCompare(section1, section2, displayName1, displayName2, false),
        buildEmblemCompare(section1, section2, displayName1, displayName2),
        buildEnchantCompare(section1, section2, displayName1, displayName2),
    ];
    sections.forEach(s => containerEq.appendChild(s));

    // 스탯 비교 탭
    const containerStat = document.getElementById('compareContentStat');
    containerStat.innerHTML = '';

    const weaponStatEl = buildWeaponStatCompare(section1, section2, displayName1, displayName2);
    containerStat.appendChild(weaponStatEl);

    const armorStatEl = buildArmorStatCompare(section1, section2, displayName1, displayName2);
    containerStat.appendChild(armorStatEl);

    const armorSetEffectEl = buildArmorSetEffectCompare(section1, section2, displayName1, displayName2);
    containerStat.appendChild(armorSetEffectEl);

    const accStatEl = buildAccStatCompare(section1, section2, displayName1, displayName2);
    containerStat.appendChild(accStatEl);

    const accSetEffectEl = buildAccSetEffectCompare(section1, section2, displayName1, displayName2);
    containerStat.appendChild(accSetEffectEl);

    const specialStatEl = buildSpecialStatCompare(section1, section2, displayName1, displayName2);
    containerStat.appendChild(specialStatEl);

    const specialSetEffectEl = buildSpecialSetEffectCompare(section1, section2, displayName1, displayName2);
    containerStat.appendChild(specialSetEffectEl);

    // 기본은 장비 비교 탭 선택
    switchCompareTab('eq');

    // DOM에 추가된 후 행 높이 동기화
    requestAnimationFrame(() => {
        sections.forEach(s => {
            if (s._tables) {
                const { leftTable, centerTable, rightTable } = s._tables;
                syncRowHeights(leftTable, centerTable, rightTable);
            }
        });
    });
}

/**
 * 직업명으로 무기 접두어 고유효과 텍스트 반환
 * @param {string} job    - 캐릭터 직업명 (예: "검신")
 * @param {string} prefix - 접두어 (예: "광채", "분쇄", "선명", "강타")
 * @returns {string}
 */
function getWeaponPrefixUniqueEffect(job, prefix) {
    if (!job || !prefix) return '';
    if (typeof EXCEED_WEAPON_UNIQUE_EFFECTS === 'undefined') return '';
    const prefixMap = EXCEED_WEAPON_UNIQUE_EFFECTS[prefix];
    if (!prefixMap) return '';
    for (const [keyGroup, effectText] of Object.entries(prefixMap)) {
        if (keyGroup.split('|').includes(job)) return effectText;
    }
    return '';
}

/**
 * 무기 스탯 비교 표
 */
function buildWeaponStatCompare(section1, section2, name1, name2) {
    const weaponData = (typeof WEAPON_ITEM_STATS !== 'undefined') ? WEAPON_ITEM_STATS : {};

    function getWeaponStats(section) {
        const itemname = section.querySelector('[data-key="무기_itemname"]')?.value || '';
        const prefix   = section.querySelector('select[data-key="무기_prefix"]')?.value || '';
        const exceed   = section.querySelector('select[data-key="무기_exceed"]')?.value || '';
        const job      = section.querySelector('[data-key="info_job"]')?.value || '';

        if (!itemname || !weaponData[itemname]) return { itemname, prefix, exceed, job, stats: null, attrs: [], desc: '' };

        const item = weaponData[itemname];

        // 침식 여부에 따라 데이터 소스 선택
        const src = (exceed === '침식' && item.침식) ? item.침식 : item;

        const map = {};
        const addToMap = (arr, sectionLabel) => {
            if (!Array.isArray(arr)) return;
            arr.forEach(entry => {
                (entry.stats || []).forEach(statName => {
                    const key = `[${sectionLabel}] ${statName}`;
                    if (!map[key]) map[key] = { amount: 0, unit: entry.unit || '' };
                    map[key].amount += (entry.amount || 0);
                });
            });
        };
        addToMap(src.base, '기본효과');
        addToMap(src.eff,  '효과');

        return {
            itemname,
            prefix,
            exceed,
            job,
            stats: map,
            attrs: src.attrs || [],
            desc:  src.desc  || ''
        };
    }

    const r1 = getWeaponStats(section1);
    const r2 = getWeaponStats(section2);

    // 접두어 색상 (base-core.js의 WEAPON_PREFIXES와 동일)
    const prefixColor = { '광채': '#3399cc', '분쇄': '#ff4d4f', '선명': '#25c2a0', '강타': '#ffd700' };

    let tbodyHtml = '';

    // ── 아이템 헤더 행 ───────────────────────────────────────────
    const CHIM_LABEL = `<span style="
        background: linear-gradient(to bottom, #ffb3c6, #ffffff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-weight: bold;
        font-size: 0.9em;
    ">[침식]</span> `;

    const makeWeaponLabel = (r) => {
        if (!r.itemname) return '(미착용)';
        const chimPart   = r.exceed === '침식' ? CHIM_LABEL : '';
        const prefixPart = r.prefix ? `<span style="color:${prefixColor[r.prefix]||'#fff'};font-weight:bold;">[${r.prefix}]</span> ` : '';
        return `${chimPart}${prefixPart}${r.itemname}`;
    };

    const itemLabel1 = makeWeaponLabel(r1);
    const itemLabel2 = makeWeaponLabel(r2);

    tbodyHtml += `<tr>
        <td style="text-align:center;padding:4px 8px;color:#e6c86e;font-size:0.85em;white-space:nowrap;font-weight:bold;border-right:1px solid #2a3158;">무기</td>
        <td style="text-align:center;padding:3px 8px;color:#aad4ff;font-size:0.78em;white-space:nowrap;" colspan="2">${itemLabel1}</td>
        <td style="text-align:center;padding:3px 8px;color:#888;font-size:0.78em;white-space:nowrap;">vs</td>
        <td style="text-align:center;padding:3px 8px;color:#aad4ff;font-size:0.78em;white-space:nowrap;" colspan="2">${itemLabel2}</td>
        <td style="text-align:center;padding:4px 8px;color:#e6c86e;font-size:0.85em;white-space:nowrap;font-weight:bold;border-left:1px solid #2a3158;">무기</td>
    </tr>`;

    // ── 스탯 행 ──────────────────────────────────────────────────
    const noData1 = !r1.stats || Object.keys(r1.stats).length === 0;
    const noData2 = !r2.stats || Object.keys(r2.stats).length === 0;

    if (!noData1 || !noData2) {
        const allKeys = [...new Set([
            ...Object.keys(r1.stats || {}),
            ...Object.keys(r2.stats || {})
        ])];
        const sectionOrder = ['[기본효과]', '[효과]'];
        allKeys.sort((a, b) => {
            const sa = sectionOrder.findIndex(s => a.startsWith(s));
            const sb = sectionOrder.findIndex(s => b.startsWith(s));
            return sa - sb;
        });

        allKeys.forEach(key => {
            const e1 = r1.stats?.[key];
            const e2 = r2.stats?.[key];
            const v1 = e1?.amount ?? 0;
            const v2 = e2?.amount ?? 0;
            const unit = e1?.unit || e2?.unit || '';
            const diff = v2 - v1;
            const highlight = (v1 !== v2) ? 'background:rgba(100,114,168,0.12);' : '';
            const displayKey = key.replace(/^\[기본효과\] |^\[효과\] /, '');
            const sectionTag = key.match(/^\[(.+?)\]/)?.[1] || '';
            const tagColor = sectionTag === '기본효과' ? '#7a9fcf' : '#a0d4a0';

            const display1 = e1 !== undefined ? `${v1}${unit}` : '';
            const display2 = e2 !== undefined ? `${v2}${unit}` : '';

            let diffText = '', diffStyle2 = 'color:#888;';
            if (e1 !== undefined && e2 !== undefined) {
                if (diff > 0)      { diffText = `↑ +${diff}${unit}`; diffStyle2 = 'color:#2ecc71;font-weight:bold;'; }
                else if (diff < 0) { diffText = `↓ ${diff}${unit}`;  diffStyle2 = 'color:#e74c3c;font-weight:bold;'; }
                else               { diffText = '동일'; }
            } else if (e1 === undefined && e2 !== undefined) {
                diffText = `↑ +${v2}${unit}`; diffStyle2 = 'color:#2ecc71;font-weight:bold;';
            } else if (e1 !== undefined && e2 === undefined) {
                diffText = `↓ -${v1}${unit}`; diffStyle2 = 'color:#e74c3c;font-weight:bold;';
            }

            const hasData1 = e1 !== undefined;
            const hasData2 = e2 !== undefined;
            tbodyHtml += `<tr style="${highlight}">
    <td style="text-align:center;padding:2px 6px;color:${tagColor};font-size:0.75em;white-space:nowrap;border-right:1px solid #2a3158;">${hasData1 ? sectionTag : ''}</td>
    <td style="text-align:center;padding:2px 8px;color:#ccc;font-size:0.82em;white-space:nowrap;">${hasData1 ? displayKey : ''}</td>
    <td style="text-align:center;padding:2px 8px;color:#e6e9ff;font-size:0.85em;white-space:nowrap;border-right:1px solid #2a3158;">${display1}</td>
    <td style="text-align:center;padding:2px 8px;font-size:0.85em;white-space:nowrap;border-right:1px solid #2a3158;${diffStyle2}">${diffText}</td>
    <td style="text-align:center;padding:2px 8px;color:#e6e9ff;font-size:0.85em;white-space:nowrap;border-right:1px solid #2a3158;">${display2}</td>
    <td style="text-align:center;padding:2px 8px;color:#ccc;font-size:0.82em;white-space:nowrap;">${hasData2 ? displayKey : ''}</td>
    <td style="text-align:center;padding:2px 6px;color:${tagColor};font-size:0.75em;white-space:nowrap;border-left:1px solid #2a3158;">${hasData2 ? sectionTag : ''}</td>
</tr>`;
        });
    }

    // ── attrs 행 ─────────────────────────────────────────────────
    const attrs1 = r1.attrs || [];
    const attrs2 = r2.attrs || [];
    if (attrs1.length > 0 || attrs2.length > 0) {
        const attrDisplay = (attrs) => attrs.length > 0
            ? attrs.map(a => `<span style="display:inline-block;padding:1px 6px;border-radius:3px;background:rgba(100,114,168,0.25);color:#b0bcff;font-size:0.8em;margin:1px 2px;">${a}</span>`).join(' ')
            : '<span style="color:#555;font-size:0.8em;">-</span>';
        const attrsSame = JSON.stringify([...attrs1].sort()) === JSON.stringify([...attrs2].sort());
        const attrDiffText  = attrsSame ? '동일' : '다름';
        const attrDiffStyle = attrsSame ? 'color:#888;' : 'color:#f0a500;font-weight:bold;';
        tbodyHtml += `<tr style="background:rgba(100,114,168,0.08);">
            <td style="text-align:center;padding:2px 6px;color:#b0bcff;font-size:0.75em;white-space:nowrap;border-right:1px solid #2a3158;">속성</td>
            <td style="text-align:center;padding:3px 8px;white-space:nowrap;" colspan="2">${attrDisplay(attrs1)}</td>
            <td style="text-align:center;padding:2px 8px;font-size:0.85em;white-space:nowrap;border-right:1px solid #2a3158;${attrDiffStyle}">${attrDiffText}</td>
            <td style="text-align:center;padding:3px 8px;white-space:nowrap;" colspan="2">${attrDisplay(attrs2)}</td>
            <td style="text-align:center;padding:2px 6px;color:#b0bcff;font-size:0.75em;white-space:nowrap;border-left:1px solid #2a3158;">속성</td>
        </tr>`;
    }

    // ── desc 행 ──────────────────────────────────────────────────
    const desc1 = r1.desc || '';
    const desc2 = r2.desc || '';
    if (desc1 || desc2) {
        const descSame = desc1 === desc2;
        const fmtDesc = (d) => d
            ? d.split('\n').map(line => `<span style="display:block;line-height:1.5;">${line}</span>`).join('')
            : '<span style="color:#555;font-size:0.8em;">-</span>';
        const descDiffText  = descSame ? '동일' : '다름';
        const descDiffStyle = descSame ? 'color:#888;' : 'color:#f0a500;font-weight:bold;';
        const rowBg = !descSame ? 'background:rgba(240,165,0,0.06);' : '';
        tbodyHtml += `<tr style="${rowBg}">
            <td style="text-align:center;padding:2px 6px;color:#c8b87a;font-size:0.75em;white-space:nowrap;border-right:1px solid #2a3158;">설명</td>
            <td colspan="2" style="padding:4px 8px;color:#c8b87a;font-size:0.8em;border-right:1px solid #2a3158;text-align:left;vertical-align:top;">${fmtDesc(desc1)}</td>
            <td style="text-align:center;padding:2px 8px;font-size:0.85em;white-space:nowrap;border-right:1px solid #2a3158;${descDiffStyle}">${descDiffText}</td>
            <td colspan="2" style="padding:4px 8px;color:#c8b87a;font-size:0.8em;border-right:1px solid #2a3158;text-align:left;vertical-align:top;">${fmtDesc(desc2)}</td>
            <td style="text-align:center;padding:2px 6px;color:#c8b87a;font-size:0.75em;white-space:nowrap;border-left:1px solid #2a3158;">설명</td>
        </tr>`;
    }

    // ── 접두어 고유효과 행 (각 캐릭터가 선택한 접두어만, 항상 한 행) ──
    const PREFIXES_ORDER = ['광채', '분쇄', '선명', '강타'];

    const fmtEff = (eff, pref) => {
        if (!eff) return '<span style="color:#555;font-size:0.8em;">-</span>';
        const color = prefixColor[pref] || '#fff';
        const prefixLabel = `<span style="color:${color};font-weight:bold;font-size:0.8em;">[${pref}]</span>`;
        const lines = eff.split('\n').map(line =>
            `<span style="display:block;line-height:1.5;color:${color};font-size:0.8em;">${line}</span>`
        ).join('');
        return `${prefixLabel}${lines}`;
    };

    const hasPrefix1 = PREFIXES_ORDER.includes(r1.prefix);
    const hasPrefix2 = PREFIXES_ORDER.includes(r2.prefix);
    const eff1 = hasPrefix1 ? getWeaponPrefixUniqueEffect(r1.job, r1.prefix) : '';
    const eff2 = hasPrefix2 ? getWeaponPrefixUniqueEffect(r2.job, r2.prefix) : '';

    if (eff1 || eff2) {
        const isSame = (r1.prefix === r2.prefix) && (eff1 === eff2);
        const diffText  = isSame ? '동일' : '다름';
        const diffStyle = isSame ? 'color:#888;' : 'color:#f0a500;font-weight:bold;';
        tbodyHtml += `<tr style="background:rgba(100,114,168,0.08);">
            <td style="text-align:center;padding:2px 6px;color:#d6d989;font-size:0.75em;white-space:nowrap;border-right:1px solid #2a3158;">고유 효과</td>
            <td style="padding:4px 8px;border-right:1px solid #2a3158;vertical-align:top;" colspan="2">${fmtEff(eff1, r1.prefix)}</td>
            <td style="text-align:center;padding:2px 8px;font-size:0.85em;white-space:nowrap;border-right:1px solid #2a3158;${diffStyle}">${diffText}</td>
            <td style="padding:4px 8px;border-right:1px solid #2a3158;vertical-align:top;" colspan="2">${fmtEff(eff2, r2.prefix)}</td>
            <td style="text-align:center;padding:2px 6px;color:#d6d989;font-size:0.75em;white-space:nowrap;border-left:1px solid #2a3158;">고유 효과</td>
        </tr>`;
    }

    // ── 래퍼 생성 ─────────────────────────────────────────────────
    const wrapper = document.createElement('div');
    wrapper.className = 'compare-section-wrapper';

    const titleEl = document.createElement('div');
    titleEl.className = 'compare-section-title';
    titleEl.textContent = '*무기 스탯 비교*';
    wrapper.appendChild(titleEl);

    const tableWrap = document.createElement('div');
    tableWrap.style.cssText = 'overflow-x:auto;margin-top:6px;';
    tableWrap.innerHTML = `
    <table style="border-collapse:collapse;width:max-content;min-width:400px;">
        <thead>
            <tr>
                <th colspan="3" style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.85em;color:#ffd700;border-right:1px solid #2a3158;">${name1}</th>
                <th rowspan="2" style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:80px;border-right:1px solid #2a3158;">차이</th>
                <th colspan="3" style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.85em;color:#ffd700;">${name2}</th>
            </tr>
            <tr>
                <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:80px;border-right:1px solid #2a3158;">구분</th>
                <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;">스탯</th>
                <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:100px;border-right:1px solid #2a3158;">수치</th>
                <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:100px;border-right:1px solid #2a3158;">수치</th>
                <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;">스탯</th>
                <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:80px;">구분</th>
            </tr>
        </thead>
        <tbody>${tbodyHtml}</tbody>
    </table>`;

    wrapper.appendChild(tableWrap);
    return wrapper;
}

/**
 * 방어구 부위별 스탯 비교 표
 */
function buildArmorStatCompare(section1, section2, name1, name2) {
    const ARMOR_SLOTS = ["상의", "어깨", "하의", "신발", "벨트"];

    // shared_item_stats.js에 인라인으로 정의된 데이터 사용 (fetch 불필요)
    const armorData = (typeof ARMOR_ITEM_STATS !== 'undefined') ? ARMOR_ITEM_STATS : {};

    // 슬롯에서 스탯 배열 추출 헬퍼
    // exceed 아이템: base[prefix], eff[prefix], mastery[prefix]
    // 일반 아이템:   base[prefix],              eff[prefix], mastery[prefix]
    function getArmorStats(section, slot) {
        const itemname = section.querySelector(`[data-key="${slot}_itemname"]`)?.value || '';
        const exceed   = section.querySelector(`select[data-key="${slot}_exceed"]`)?.value || '';
        const prefix   = section.querySelector(`select[data-key="${slot}_prefix"]`)?.value || '';
        if (!itemname || !armorData[itemname]) return { itemname, exceed, prefix, stats: null };

        const item = armorData[itemname];
        let baseArr, effArr, masteryArr;

        const exceed_stage = exceed || '이상';
        if (item.exceed) {
            // exceed 아이템: base[prefix], eff[prefix], mastery[prefix]
            const prefixKey = prefix || '전격';
            baseArr    = item.base?.[prefixKey]    || [];
            effArr     = item.eff?.[prefixKey]     || [];
            masteryArr = item.mastery?.[prefixKey] || [];
        } else {
            // 일반 아이템: prefix = 기본/전격/허상
            const prefixKey = prefix || '기본';
            baseArr    = item.base?.[prefixKey]    || [];
            effArr     = item.eff?.[prefixKey]     || [];
            masteryArr = item.mastery?.[prefixKey] || [];
        }

        // stats 배열 → { [스탯명]: { amount, unit } } 맵으로 변환
        const map = {};
        const addToMap = (arr, section) => {
            arr.forEach(entry => {
                (entry.stats || []).forEach(statName => {
                    const key = `[${section}] ${statName}`;
                    if (!map[key]) map[key] = { amount: 0, unit: entry.unit || '' };
                    map[key].amount += (entry.amount || 0);
                });
            });
        };
        addToMap(baseArr,    '기본효과');
        addToMap(effArr,     '효과');
        addToMap(masteryArr, '방어구 마스터리');

        // attrs, desc 읽기
        let attrs = [], desc = '';
        if (item.attrs) {
            if (item.exceed) {
                attrs = item.attrs?.[exceed_stage]?.[prefix || '전격'] || [];
            } else {
                attrs = item.attrs?.[prefix || '기본'] || [];
            }
        }
        if (item.desc) {
            if (item.exceed) {
                desc = item.desc?.[exceed_stage]?.[prefix || '전격'] || '';
            } else {
                desc = item.desc?.[prefix || '기본'] || '';
            }
        }

        return { itemname, exceed, prefix, stats: map, attrs, desc };
    }

    // 두 캐릭터의 모든 스탯 키 합집합
    const slotResults1 = {};
    const slotResults2 = {};
    ARMOR_SLOTS.forEach(slot => {
        slotResults1[slot] = getArmorStats(section1, slot);
        slotResults2[slot] = getArmorStats(section2, slot);
    });

    // 표 HTML 생성
    const diffStyle = (d) => d > 0 ? 'color:#2ecc71;font-weight:bold;' : d < 0 ? 'color:#e74c3c;font-weight:bold;' : 'color:#888;';
    const fmtDiff   = (d) => d > 0 ? `↑ +${d}` : d < 0 ? `↓ ${d}` : '-';

    let tbodyHtml = '';

    ARMOR_SLOTS.forEach((slot, slotIdx) => {
        const r1 = slotResults1[slot];
        const r2 = slotResults2[slot];

        // 슬롯 구분선 (첫 슬롯 제외)
        if (slotIdx > 0) {
            tbodyHtml += `<tr><td colspan="8" style="padding:0;border-top:1px solid #2a3158;"></td></tr>`;
        }

        const noData1 = !r1.stats;
        const noData2 = !r2.stats;

        if (noData1 && noData2) {
            // 아이템 없음 또는 데이터 없음
            const label1 = r1.itemname || '(미착용)';
            const label2 = r2.itemname || '(미착용)';
            tbodyHtml += `<tr>
                <td style="text-align:center;padding:3px 8px;color:#aaa;font-size:0.85em;white-space:nowrap;font-weight:bold;border-right:1px solid #2a3158;">${slot}</td>
                <td style="text-align:center;padding:3px 8px;color:#555;font-size:0.8em;" colspan="2">${label1}</td>
                <td style="text-align:center;padding:3px 8px;color:#888;font-size:0.78em;">vs</td>
                <td style="text-align:center;padding:3px 8px;color:#555;font-size:0.8em;" colspan="3">${label2}</td>
            </tr>`;
            return;
        }

        // 이 슬롯에 등장하는 모든 스탯 키
        const allKeys = [...new Set([
            ...Object.keys(r1.stats || {}),
            ...Object.keys(r2.stats || {})
        ])];

        // 섹션 순서: 기본효과 → 효과 → 방어구 마스터리, 각 섹션 내 순서는 json 정의 순서 유지
        const sectionOrder = ['[기본효과]', '[효과]', '[방어구 마스터리]'];
        allKeys.sort((a, b) => {
            const sa = sectionOrder.findIndex(s => a.startsWith(s));
            const sb = sectionOrder.findIndex(s => b.startsWith(s));
            return sa - sb;
        });

        // 슬롯 헤더 행 (아이템명 + 익시드/접두어 표시)
        // 슬롯 헤더 행 (아이템명 + 익시드/접두어 표시)
        const itemLabel1 = r1.itemname
            ? `${r1.exceed ? `[${r1.exceed}] ` : ''}${r1.prefix ? `${r1.prefix}: ` : ''}${r1.itemname}`
            : '(미착용)';
        const itemLabel2 = r2.itemname
            ? `${r2.exceed ? `[${r2.exceed}] ` : ''}${r2.prefix ? `${r2.prefix}: ` : ''}${r2.itemname}`
            : '(미착용)';

        tbodyHtml += `<tr>
            <td style="text-align:center;padding:4px 8px;color:#e6c86e;font-size:0.85em;white-space:nowrap;font-weight:bold;border-right:1px solid #2a3158;">${slot}</td>
            <td style="text-align:center;padding:3px 8px;color:#aad4ff;font-size:0.78em;white-space:nowrap;" colspan="2">${itemLabel1}</td>
            <td style="text-align:center;padding:3px 8px;color:#888;font-size:0.78em;white-space:nowrap;">vs</td>
            <td style="text-align:center;padding:3px 8px;color:#aad4ff;font-size:0.78em;white-space:nowrap;" colspan="2">${itemLabel2}</td>
            <td style="text-align:center;padding:4px 8px;color:#e6c86e;font-size:0.85em;white-space:nowrap;font-weight:bold;border-left:1px solid #2a3158;">${slot}</td>
        </tr>`;

        allKeys.forEach(key => {
            const e1 = r1.stats?.[key];
            const e2 = r2.stats?.[key];
            const v1 = e1?.amount ?? 0;
            const v2 = e2?.amount ?? 0;
            const unit = e1?.unit || e2?.unit || '';
            const diff = v2 - v1;
            const highlight = (v1 !== v2) ? 'background:rgba(100,114,168,0.12);' : '';
            // 키에서 섹션 태그 제거하여 표시
            const displayKey = key.replace(/^\[기본효과\] |^\[효과\] |^\[방어구 마스터리\] /, '');
            const sectionTag = key.match(/^\[(.+?)\]/)?.[1] || '';
            const tagColor = sectionTag === '기본효과' ? '#7a9fcf' : sectionTag === '효과' ? '#a0d4a0' : '#c8a0d4';

            const display1 = e1 !== undefined ? `${v1}${unit}` : '';
            const display2 = e2 !== undefined ? `${v2}${unit}` : '';

            let diffText = '';
            let diffStyle2 = 'color:#888;';
            if (e1 !== undefined && e2 !== undefined) {
                if (diff > 0)      { diffText = `↑ +${diff}${unit}`; diffStyle2 = 'color:#2ecc71;font-weight:bold;'; }
                else if (diff < 0) { diffText = `↓ ${diff}${unit}`;  diffStyle2 = 'color:#e74c3c;font-weight:bold;'; }
                else               { diffText = '동일'; }
            } else if (e1 === undefined && e2 !== undefined) {
                diffText = `↑ +${v2}${unit}`; diffStyle2 = 'color:#2ecc71;font-weight:bold;';
            } else if (e1 !== undefined && e2 === undefined) {
                diffText = `↓ -${v1}${unit}`; diffStyle2 = 'color:#e74c3c;font-weight:bold;';
            }

            const hasData1 = e1 !== undefined;
            const hasData2 = e2 !== undefined;
            tbodyHtml += `<tr style="${highlight}">
    <td style="text-align:center;padding:2px 6px;color:${tagColor};font-size:0.75em;white-space:nowrap;border-right:1px solid #2a3158;">${hasData1 ? sectionTag : ''}</td>
    <td style="text-align:center;padding:2px 8px;color:#ccc;font-size:0.82em;white-space:nowrap;">${hasData1 ? displayKey : ''}</td>
    <td style="text-align:center;padding:2px 8px;color:#e6e9ff;font-size:0.85em;white-space:nowrap;border-right:1px solid #2a3158;">${display1}</td>
    <td style="text-align:center;padding:2px 8px;font-size:0.85em;white-space:nowrap;border-right:1px solid #2a3158;${diffStyle2}">${diffText}</td>
    <td style="text-align:center;padding:2px 8px;color:#e6e9ff;font-size:0.85em;white-space:nowrap;border-right:1px solid #2a3158;">${display2}</td>
    <td style="text-align:center;padding:2px 8px;color:#ccc;font-size:0.82em;white-space:nowrap;">${hasData2 ? displayKey : ''}</td>
    <td style="text-align:center;padding:2px 6px;color:${tagColor};font-size:0.75em;white-space:nowrap;border-left:1px solid #2a3158;">${hasData2 ? sectionTag : ''}</td>
</tr>`;
        });

        // attrs 행
        const attrs1 = r1.attrs || [];
        const attrs2 = r2.attrs || [];
        if (attrs1.length > 0 || attrs2.length > 0) {
            const attrDisplay = (attrs) => attrs.length > 0
                ? attrs.map(a => `<span style="display:inline-block;padding:1px 6px;border-radius:3px;background:rgba(100,114,168,0.25);color:#b0bcff;font-size:0.8em;margin:1px 2px;">${a}</span>`).join(' ')
                : '<span style="color:#555;font-size:0.8em;">-</span>';
            const attrsSame = JSON.stringify([...attrs1].sort()) === JSON.stringify([...attrs2].sort());
            const attrDiffText  = attrsSame ? '동일' : '다름';
            const attrDiffStyle = attrsSame ? 'color:#888;' : 'color:#f0a500;font-weight:bold;';
            tbodyHtml += `<tr style="background:rgba(100,114,168,0.08);">
                <td style="text-align:center;padding:2px 6px;color:#b0bcff;font-size:0.75em;white-space:nowrap;border-right:1px solid #2a3158;">속성</td>
                <td style="text-align:center;padding:3px 8px;white-space:nowrap;" colspan="2">${attrDisplay(attrs1)}</td>
                <td style="text-align:center;padding:2px 8px;font-size:0.85em;white-space:nowrap;border-right:1px solid #2a3158;${attrDiffStyle}">${attrDiffText}</td>
                <td style="text-align:center;padding:3px 8px;white-space:nowrap;" colspan="2">${attrDisplay(attrs2)}</td>
                <td style="text-align:center;padding:2px 6px;color:#b0bcff;font-size:0.75em;white-space:nowrap;border-left:1px solid #2a3158;">속성</td>
            </tr>`;
        }

        // desc 행
        const desc1 = r1.desc || '';
        const desc2 = r2.desc || '';
        if (desc1 || desc2) {
            const descSame = desc1 === desc2;
            const fmtDesc = (d) => d
                ? d.split('\n').map(line => `<span style="display:block;line-height:1.5;">${line}</span>`).join('')
                : '<span style="color:#555;font-size:0.8em;">-</span>';
            const descDiffText  = descSame ? '동일' : '다름';
            const descDiffStyle = descSame ? 'color:#888;' : 'color:#f0a500;font-weight:bold;';
            const rowBg = !descSame ? 'background:rgba(240,165,0,0.06);' : '';
            tbodyHtml += `<tr style="${rowBg}">
                <td style="text-align:center;padding:2px 6px;color:#c8b87a;font-size:0.75em;white-space:nowrap;border-right:1px solid #2a3158;">설명</td>
                <td colspan="2" style="padding:4px 8px;color:#c8b87a;font-size:0.8em;border-right:1px solid #2a3158;text-align:left;vertical-align:top;">${fmtDesc(desc1)}</td>
                <td style="text-align:center;padding:2px 8px;font-size:0.85em;white-space:nowrap;border-right:1px solid #2a3158;${descDiffStyle}">${descDiffText}</td>
                <td colspan="2" style="padding:4px 8px;color:#c8b87a;font-size:0.8em;border-right:1px solid #2a3158;text-align:left;vertical-align:top;">${fmtDesc(desc2)}</td>
                <td style="text-align:center;padding:2px 6px;color:#c8b87a;font-size:0.75em;white-space:nowrap;border-left:1px solid #2a3158;">설명</td>
            </tr>`;
        }

        if (slot === '상의') {
            const job1    = section1.querySelector('[data-key="info_job"]')?.value || '';
            const job2    = section2.querySelector('[data-key="info_job"]')?.value || '';
            const exceed1 = r1.exceed || '';
            const exceed2 = r2.exceed || '';
            const eff1 = getExceedUniqueEffect(job1, exceed1);
            const eff2 = getExceedUniqueEffect(job2, exceed2);
            tbodyHtml += buildExceedUniqueEffectRows(eff1, exceed1, eff2, exceed2);
        }
        // ↑↑↑ 여기까지 추가 ↑↑↑

    });

    const wrapper = document.createElement('div');
    wrapper.className = 'compare-section-wrapper';

    const titleEl = document.createElement('div');
    titleEl.className = 'compare-section-title';
    titleEl.textContent = '*방어구 스탯 비교*';
    wrapper.appendChild(titleEl);

    const tableWrap = document.createElement('div');
    tableWrap.style.cssText = 'overflow-x:auto;margin-top:6px;';

    tableWrap.innerHTML = `
    <table style="border-collapse:collapse;width:max-content;min-width:400px;">
        <thead>
            <tr>
                <th colspan="3" style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.85em;color:#ffd700;border-right:1px solid #2a3158;">${name1}</th>
                <th rowspan="2" style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:80px;border-right:1px solid #2a3158;">차이</th>
                <th colspan="3" style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.85em;color:#ffd700;">${name2}</th>
            </tr>
            <tr>
                <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:80px;border-right:1px solid #2a3158;">구분</th>
                <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;">스탯</th>
                <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:100px;border-right:1px solid #2a3158;">수치</th>
                <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:100px;border-right:1px solid #2a3158;">수치</th>
                <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;">스탯</th>
                <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:80px;">구분</th>
            </tr>
        </thead>
        <tbody>${tbodyHtml}</tbody>
    </table>`;



    wrapper.appendChild(tableWrap);
    return wrapper;
}

/**
 * 세트 효과 비교 tbody 행 생성 헬퍼
 * @param {object|null} eff1 - 캐릭터1의 세트 효과 객체 (effects3 or effects5)
 * @param {object|null} eff2 - 캐릭터2의 세트 효과 객체
 * @param {string} tierLabel - "3세트" or "5세트"
 * @param {string} tierColor - 헤더 색상 hex
 * @param {string} tierBg    - 헤더 배경 rgba
 * @returns {string} tbodyHtml 추가분
 */
function buildSetEffectRows(eff1, eff2, tierLabel, tierColor, tierBg) {
    let html = '';

    // 헤더 행
    html += `<tr style="background:${tierBg};">
        <td colspan="7" style="text-align:center;padding:6px 8px;color:${tierColor};font-size:0.9em;font-weight:bold;">━━━ ${tierLabel} 효과 ━━━</td>
    </tr>`;

    // ── attrs 행 ──────────────────────────────────────────────
    const attrs1 = eff1?.attrs || [];
    const attrs2 = eff2?.attrs || [];
    const allAttrs = [...new Set([...attrs1, ...attrs2])];

    if (allAttrs.length > 0) {
        const attrDisplay = (attrs) => attrs.length > 0
            ? attrs.map(a => `<span style="display:inline-block;padding:1px 6px;border-radius:3px;background:rgba(100,114,168,0.25);color:#b0bcff;font-size:0.8em;margin:1px 2px;">${a}</span>`).join(' ')
            : '<span style="color:#555;font-size:0.8em;">-</span>';

        const a1 = attrDisplay(attrs1);
        const a2 = attrDisplay(attrs2);

        const attrsSame = JSON.stringify([...attrs1].sort()) === JSON.stringify([...attrs2].sort());
        const diffText  = attrsSame ? '동일' : '다름';
        const diffStyle = attrsSame ? 'color:#888;' : 'color:#f0a500;font-weight:bold;';

        html += `<tr style="background:rgba(100,114,168,0.08);">
            <td style="text-align:center;padding:2px 6px;color:${tierColor};font-size:0.75em;white-space:nowrap;border-right:1px solid #2a3158;">${tierLabel}</td>
            <td style="text-align:center;padding:3px 8px;white-space:nowrap;">${a1}</td>
            <td style="text-align:center;padding:3px 8px;color:#b0bcff;font-size:0.78em;white-space:nowrap;border-right:1px solid #2a3158;">속성부여</td>
            <td style="text-align:center;padding:2px 8px;font-size:0.85em;white-space:nowrap;border-right:1px solid #2a3158;${diffStyle}">${diffText}</td>
            <td style="text-align:center;padding:3px 8px;color:#b0bcff;font-size:0.78em;white-space:nowrap;border-right:1px solid #2a3158;">속성부여</td>
            <td style="text-align:center;padding:3px 8px;white-space:nowrap;">${a2}</td>
            <td style="text-align:center;padding:2px 6px;color:${tierColor};font-size:0.75em;white-space:nowrap;border-left:1px solid #2a3158;">${tierLabel}</td>
        </tr>`;
    }

    // ── stats 행 ─────────────────────────────────────────────
    const stats1 = eff1?.stats || [];
    const stats2 = eff2?.stats || [];

    const statMap1 = {};
    const statMap2 = {};
    stats1.forEach(entry => entry.stats.forEach(n => { statMap1[n] = { amount: entry.amount, unit: entry.unit }; }));
    stats2.forEach(entry => entry.stats.forEach(n => { statMap2[n] = { amount: entry.amount, unit: entry.unit }; }));

    const allStatNames = [...new Set([...Object.keys(statMap1), ...Object.keys(statMap2)])];

    if (allStatNames.length === 0 && attrs1.length === 0 && attrs2.length === 0) {
        html += `<tr>
            <td colspan="7" style="text-align:center;padding:8px;color:#888;font-size:0.85em;">${tierLabel} 효과 데이터 없음</td>
        </tr>`;
    } else {
        allStatNames.forEach(statName => {
            const val1 = statMap1[statName];
            const val2 = statMap2[statName];

            const display1 = val1 ? `${val1.amount}${val1.unit}` : '';
            const display2 = val2 ? `${val2.amount}${val2.unit}` : '';

            let diffText = '';
            let diffClass = 'color:#888;';

            if (val1 && val2) {
                if (val1.amount === val2.amount && val1.unit === val2.unit) {
                    diffText = '동일'; diffClass = 'color:#888;';
                } else {
                    const diff = val2.amount - val1.amount;
                    if (diff > 0)      { diffText = `↑ +${diff}${val2.unit}`; diffClass = 'color:#2ecc71;font-weight:bold;'; }
                    else if (diff < 0) { diffText = `↓ ${diff}${val2.unit}`;  diffClass = 'color:#e74c3c;font-weight:bold;'; }
                    else               { diffText = '동일'; diffClass = 'color:#888;'; }
                }
            } else if (!val1 && val2) {
                diffText = `↑ +${val2.amount}${val2.unit}`; diffClass = 'color:#2ecc71;font-weight:bold;';
            } else if (val1 && !val2) {
                diffText = `↓ -${val1.amount}${val1.unit}`; diffClass = 'color:#e74c3c;font-weight:bold;';
            }

            const highlight = (display1 !== display2) ? 'background:rgba(100,114,168,0.12);' : '';

            html += `<tr style="${highlight}">
                <td style="text-align:center;padding:2px 6px;color:${tierColor};font-size:0.75em;white-space:nowrap;border-right:1px solid #2a3158;">${tierLabel}</td>
                <td style="text-align:center;padding:2px 8px;color:#ccc;font-size:0.82em;white-space:nowrap;">${val1 ? statName : ''}</td>
                <td style="text-align:center;padding:2px 8px;color:#e6e9ff;font-size:0.85em;white-space:nowrap;border-right:1px solid #2a3158;">${display1}</td>
                <td style="text-align:center;padding:2px 8px;font-size:0.85em;white-space:nowrap;border-right:1px solid #2a3158;${diffClass}">${diffText}</td>
                <td style="text-align:center;padding:2px 8px;color:#e6e9ff;font-size:0.85em;white-space:nowrap;border-right:1px solid #2a3158;">${display2}</td>
                <td style="text-align:center;padding:2px 8px;color:#ccc;font-size:0.82em;white-space:nowrap;">${val2 ? statName : ''}</td>
                <td style="text-align:center;padding:2px 6px;color:${tierColor};font-size:0.75em;white-space:nowrap;border-left:1px solid #2a3158;">${tierLabel}</td>
            </tr>`;
        });
    }

    // ── desc 행 ──────────────────────────────────────────────
    const desc1 = eff1?.desc || '';
    const desc2 = eff2?.desc || '';

    if (desc1 || desc2) {
        const descSame = desc1 === desc2;
        const fmtDesc = (d) => d
            ? d.split('\n').map(line => `<span style="display:block;line-height:1.5;">${line}</span>`).join('')
            : '<span style="color:#555;font-size:0.8em;">-</span>';

        const diffText  = descSame ? '동일' : '다름';
        const diffStyle = descSame ? 'color:#888;' : 'color:#f0a500;font-weight:bold;';
        const rowBg     = !descSame ? 'background:rgba(240,165,0,0.06);' : '';

        html += `<tr style="${rowBg}">
            <td style="text-align:center;padding:2px 6px;color:${tierColor};font-size:0.75em;white-space:nowrap;border-right:1px solid #2a3158;">${tierLabel}</td>
            <td colspan="2" style="padding:4px 8px;color:#c8b87a;font-size:0.8em;border-right:1px solid #2a3158;text-align:left;vertical-align:top;">${fmtDesc(desc1)}</td>
            <td style="text-align:center;padding:2px 8px;font-size:0.85em;white-space:nowrap;border-right:1px solid #2a3158;${diffStyle}">${diffText}</td>
            <td colspan="2" style="padding:4px 8px;color:#c8b87a;font-size:0.8em;border-right:1px solid #2a3158;text-align:left;vertical-align:top;">${fmtDesc(desc2)}</td>
            <td style="text-align:center;padding:2px 6px;color:${tierColor};font-size:0.75em;white-space:nowrap;border-left:1px solid #2a3158;">${tierLabel}</td>
        </tr>`;
    }

    return html;
}

/**
 * 방어구 세트 효과 비교 표
 */
function buildArmorSetEffectCompare(section1, section2, name1, name2) {
    const ARMOR_SLOTS = ["상의", "어깨", "하의", "신발", "벨트"];

    // armor_set_effects.js 데이터 사용
    const setEffectsData = (typeof ARMOR_SET_EFFECTS !== 'undefined') ? ARMOR_SET_EFFECTS : {};

    /**
     * 캐릭터의 방어구 세트 효과 계산
     * @returns { setName, prefix, count, effects3, effects5 }
     */
    function getArmorSetEffects(section) {
        const equipped = {};

        // 1. 각 슬롯의 아이템명, 접두어, 익시드 정보 수집
        ARMOR_SLOTS.forEach(slot => {
            const itemname = section.querySelector(`[data-key="${slot}_itemname"]`)?.value || '';
            const prefix   = section.querySelector(`select[data-key="${slot}_prefix"]`)?.value || '';
            const exceed   = section.querySelector(`select[data-key="${slot}_exceed"]`)?.value || '';

            if (itemname) {
                equipped[slot] = { itemname, prefix, exceed };
            }
        });

        // 2. 세트별로 그룹화 (ARMOR_ITEM_INFO 사용)
        const armorItemInfo = (typeof ARMOR_ITEM_INFO !== 'undefined') ? ARMOR_ITEM_INFO : {};
        const setSets = {}; // { setName: { prefix: count } }

        Object.values(equipped).forEach(({ itemname, prefix }) => {
            const info = armorItemInfo[itemname];
            if (!info) return;

            const setName = info.setName;
            if (!setSets[setName]) setSets[setName] = {};

            // 접두어가 있으면 접두어로, 없으면 "기본"으로 카운트
            const key = prefix || "기본";
            setSets[setName][key] = (setSets[setName][key] || 0) + 1;
        });

        // 3. 세트 효과 판정 (접두어 우선, 없으면 기본)
        let bestSet = null;
        let bestPrefix = null;
        let bestCount = 0;
        let effects3 = null;
        let effects5 = null;

        // 모든 세트에서 가장 많은 개수를 찾기
        Object.entries(setSets).forEach(([setName, prefixCounts]) => {
            Object.entries(prefixCounts).forEach(([prefix, count]) => {
                // 접두어가 있는 것 우선, 같은 개수면 접두어 우선
                if (count > bestCount) {
                    bestSet = setName;
                    bestPrefix = prefix;
                    bestCount = count;
                } else if (count === bestCount && prefix !== "기본" && bestPrefix === "기본") {
                    // 같은 개수인데 현재가 접두어고 기존이 기본이면 교체
                    bestSet = setName;
                    bestPrefix = prefix;
                    bestCount = count;
                }
            });
        });

        // 4. 세트 효과 데이터 가져오기
        if (bestSet && bestCount >= 3) {
            const setData = setEffectsData[bestSet];
            if (setData && setData[bestPrefix]) {
                effects3 = setData[bestPrefix]["3"];
                if (bestCount >= 5) {
                    effects5 = setData[bestPrefix]["5"];
                }
            }
        }

        return {
            setName: bestSet,
            prefix: bestPrefix,
            count: bestCount,
            effects3,
            effects5
        };
    }

    const result1 = getArmorSetEffects(section1);
    const result2 = getArmorSetEffects(section2);

    // 표 HTML 생성
    const wrapper = document.createElement('div');
    wrapper.className = 'compare-section-wrapper';

    const titleEl = document.createElement('div');
    titleEl.className = 'compare-section-title';
    titleEl.textContent = '*방어구 세트 효과 비교*';
    wrapper.appendChild(titleEl);

    const tableWrap = document.createElement('div');
    tableWrap.style.cssText = 'overflow-x:auto;margin-top:6px;';

    let tbodyHtml = '';

    // 캐릭터1 세트 정보
    const set1Label = result1.setName
        ? `${result1.prefix && result1.prefix !== '기본' && !result1.setName.startsWith(result1.prefix) ? result1.prefix + ': ' : ''}${result1.setName} (${result1.count}셋)`
        : '세트 없음';
    const set2Label = result2.setName
        ? `${result2.prefix && result2.prefix !== '기본' && !result2.setName.startsWith(result2.prefix) ? result2.prefix + ': ' : ''}${result2.setName} (${result2.count}셋)`
        : '세트 없음';

    tbodyHtml += `<tr>
        <td style="text-align:center;padding:6px 8px;color:#ffd700;font-size:0.9em;white-space:nowrap;font-weight:bold;border-right:1px solid #2a3158;" colspan="3">${set1Label}</td>
        <td style="text-align:center;padding:6px 8px;color:#888;font-size:0.85em;border-right:1px solid #2a3158;" colspan="1">vs</td>
        <td style="text-align:center;padding:6px 8px;color:#ffd700;font-size:0.9em;white-space:nowrap;font-weight:bold;" colspan="3">${set2Label}</td>
    </tr>`;

    // 3세트 효과 비교
    const has3Set1 = result1.count >= 3 && result1.effects3;
    const has3Set2 = result2.count >= 3 && result2.effects3;
    if (has3Set1 || has3Set2) {
        tbodyHtml += buildSetEffectRows(
            result1.effects3 || null,
            result2.effects3 || null,
            '3세트', '#7fd4ff', 'rgba(127,212,255,0.15)'
        );
    }

    // 5세트 효과 비교
    const has5Set1 = result1.count >= 5 && result1.effects5;
    const has5Set2 = result2.count >= 5 && result2.effects5;
    if (has5Set1 || has5Set2) {
        tbodyHtml += buildSetEffectRows(
            result1.effects5 || null,
            result2.effects5 || null,
            '5세트', '#ffd700', 'rgba(255,215,0,0.15)'
        );
    }

    // 세트 효과가 둘 다 없을 때
    if (!result1.effects3 && !result2.effects3 && !result1.effects5 && !result2.effects5) {
        tbodyHtml += `<tr>
            <td colspan="7" style="text-align:center;padding:12px 8px;color:#888;font-size:0.85em;">세트 효과 없음</td>
        </tr>`;
    }

    tableWrap.innerHTML = `
    <table style="border-collapse:collapse;width:max-content;min-width:400px;">
    <thead>
        <tr>
            <th colspan="3" style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.85em;color:#ffd700;border-right:1px solid #2a3158;">${name1}</th>
            <th rowspan="2" style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:80px;border-right:1px solid #2a3158;">차이</th>
            <th colspan="3" style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.85em;color:#ffd700;">${name2}</th>
        </tr>
        <tr>
            <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:80px;border-right:1px solid #2a3158;">구분</th>
            <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;">스탯</th>
            <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:100px;border-right:1px solid #2a3158;">수치</th>
            <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:100px;border-right:1px solid #2a3158;">수치</th>
            <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;">스탯</th>
            <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:80px;">구분</th>
        </tr>
    </thead>
        <tbody>${tbodyHtml}</tbody>
    </table>`;

    wrapper.appendChild(tableWrap);
    return wrapper;
}

/**
 * 악세서리 부위별 스탯 비교 표
 */
function buildAccStatCompare(section1, section2, name1, name2) {
    const ACC_SLOTS = ["팔찌", "목걸이", "반지"];

    const accData = (typeof ACCESSORY_ITEM_STATS !== 'undefined') ? ACCESSORY_ITEM_STATS : {};

    function getAccStats(section, slot) {
        const itemname = section.querySelector(`[data-key="${slot}_itemname"]`)?.value || '';
        const exceed   = section.querySelector(`select[data-key="${slot}_exceed"]`)?.value || '';
        const prefix   = section.querySelector(`select[data-key="${slot}_prefix"]`)?.value || '';
        if (!itemname || !accData[itemname]) return { itemname, exceed, prefix, stats: null };

        const item = accData[itemname];
        let baseArr, effArr;

        const exceed_stage = exceed || '이상';
        if (item.exceed) {
            const prefixKey = prefix || '견고';
            baseArr = item.base?.[prefixKey] || [];
            effArr  = item.eff?.[prefixKey]  || [];
        } else {
            const prefixKey = prefix || '기본';
            baseArr = item.base?.[prefixKey] || [];
            effArr  = item.eff?.[prefixKey]  || [];
        }

        const map = {};
        const addToMap = (arr, section) => {
            arr.forEach(entry => {
                (entry.stats || []).forEach(statName => {
                    const key = `[${section}] ${statName}`;
                    if (!map[key]) map[key] = { amount: 0, unit: entry.unit || '' };
                    map[key].amount += (entry.amount || 0);
                });
            });
        };
        addToMap(baseArr, '기본효과');
        addToMap(effArr,  '효과');

        // attrs, desc 읽기
        let attrs = [], desc = '';
        if (item.attrs) {
            if (item.exceed) {
                attrs = item.attrs?.[exceed_stage]?.[prefix || '견고'] || [];
            } else {
                attrs = item.attrs?.[prefix || '기본'] || [];
            }
        }
        if (item.desc) {
            if (item.exceed) {
                desc = item.desc?.[exceed_stage]?.[prefix || '견고'] || '';
            } else {
                desc = item.desc?.[prefix || '기본'] || '';
            }
        }

        return { itemname, exceed, prefix, stats: map, attrs, desc };
    }

    const slotResults1 = {};
    const slotResults2 = {};
    ACC_SLOTS.forEach(slot => {
        slotResults1[slot] = getAccStats(section1, slot);
        slotResults2[slot] = getAccStats(section2, slot);
    });

    let tbodyHtml = '';

    ACC_SLOTS.forEach((slot, slotIdx) => {
        const r1 = slotResults1[slot];
        const r2 = slotResults2[slot];

        if (slotIdx > 0) {
            tbodyHtml += `<tr><td colspan="8" style="padding:0;border-top:1px solid #2a3158;"></td></tr>`;
        }

        const noData1 = !r1.stats;
        const noData2 = !r2.stats;

        if (noData1 && noData2) {
            const label1 = r1.itemname || '(미착용)';
            const label2 = r2.itemname || '(미착용)';
            tbodyHtml += `<tr>
                <td style="text-align:center;padding:3px 8px;color:#aaa;font-size:0.85em;white-space:nowrap;font-weight:bold;border-right:1px solid #2a3158;">${slot}</td>
                <td style="text-align:center;padding:3px 8px;color:#555;font-size:0.8em;" colspan="2">${label1}</td>
                <td style="text-align:center;padding:3px 8px;color:#888;font-size:0.78em;">vs</td>
                <td style="text-align:center;padding:3px 8px;color:#555;font-size:0.8em;" colspan="3">${label2}</td>
            </tr>`;
            return;
        }

        const allKeys = [...new Set([
            ...Object.keys(r1.stats || {}),
            ...Object.keys(r2.stats || {})
        ])];

        const sectionOrder = ['[기본효과]', '[효과]'];
        allKeys.sort((a, b) => {
            const sa = sectionOrder.findIndex(s => a.startsWith(s));
            const sb = sectionOrder.findIndex(s => b.startsWith(s));
            return sa - sb;
        });

        const itemLabel1 = r1.itemname
            ? `${r1.exceed ? `[${r1.exceed}] ` : ''}${r1.prefix ? `${r1.prefix}: ` : ''}${r1.itemname}`
            : '(미착용)';
        const itemLabel2 = r2.itemname
            ? `${r2.exceed ? `[${r2.exceed}] ` : ''}${r2.prefix ? `${r2.prefix}: ` : ''}${r2.itemname}`
            : '(미착용)';

        tbodyHtml += `<tr>
            <td style="text-align:center;padding:4px 8px;color:#e6c86e;font-size:0.85em;white-space:nowrap;font-weight:bold;border-right:1px solid #2a3158;">${slot}</td>
            <td style="text-align:center;padding:3px 8px;color:#aad4ff;font-size:0.78em;white-space:nowrap;" colspan="2">${itemLabel1}</td>
            <td style="text-align:center;padding:3px 8px;color:#888;font-size:0.78em;white-space:nowrap;">vs</td>
            <td style="text-align:center;padding:3px 8px;color:#aad4ff;font-size:0.78em;white-space:nowrap;" colspan="2">${itemLabel2}</td>
            <td style="text-align:center;padding:4px 8px;color:#e6c86e;font-size:0.85em;white-space:nowrap;font-weight:bold;border-left:1px solid #2a3158;">${slot}</td>
        </tr>`;

        allKeys.forEach(key => {
            const e1 = r1.stats?.[key];
            const e2 = r2.stats?.[key];
            const v1 = e1?.amount ?? 0;
            const v2 = e2?.amount ?? 0;
            const unit = e1?.unit || e2?.unit || '';
            const diff = v2 - v1;
            const highlight = (v1 !== v2) ? 'background:rgba(100,114,168,0.12);' : '';
            const displayKey = key.replace(/^\[기본효과\] |^\[효과\] /, '');
            const sectionTag = key.match(/^\[(.+?)\]/)?.[1] || '';
            const tagColor = sectionTag === '기본효과' ? '#7a9fcf' : '#a0d4a0';

            const display1 = e1 !== undefined ? `${v1}${unit}` : '';
            const display2 = e2 !== undefined ? `${v2}${unit}` : '';

            let diffText = '';
            let diffStyle2 = 'color:#888;';
            if (e1 !== undefined && e2 !== undefined) {
                if (diff > 0)      { diffText = `↑ +${diff}${unit}`; diffStyle2 = 'color:#2ecc71;font-weight:bold;'; }
                else if (diff < 0) { diffText = `↓ ${diff}${unit}`;  diffStyle2 = 'color:#e74c3c;font-weight:bold;'; }
                else               { diffText = '동일'; }
            } else if (e1 === undefined && e2 !== undefined) {
                diffText = `↑ +${v2}${unit}`; diffStyle2 = 'color:#2ecc71;font-weight:bold;';
            } else if (e1 !== undefined && e2 === undefined) {
                diffText = `↓ -${v1}${unit}`; diffStyle2 = 'color:#e74c3c;font-weight:bold;';
            }

            const hasData1 = e1 !== undefined;
            const hasData2 = e2 !== undefined;
            tbodyHtml += `<tr style="${highlight}">
    <td style="text-align:center;padding:2px 6px;color:${tagColor};font-size:0.75em;white-space:nowrap;border-right:1px solid #2a3158;">${hasData1 ? sectionTag : ''}</td>
    <td style="text-align:center;padding:2px 8px;color:#ccc;font-size:0.82em;white-space:nowrap;">${hasData1 ? displayKey : ''}</td>
    <td style="text-align:center;padding:2px 8px;color:#e6e9ff;font-size:0.85em;white-space:nowrap;border-right:1px solid #2a3158;">${display1}</td>
    <td style="text-align:center;padding:2px 8px;font-size:0.85em;white-space:nowrap;border-right:1px solid #2a3158;${diffStyle2}">${diffText}</td>
    <td style="text-align:center;padding:2px 8px;color:#e6e9ff;font-size:0.85em;white-space:nowrap;border-right:1px solid #2a3158;">${display2}</td>
    <td style="text-align:center;padding:2px 8px;color:#ccc;font-size:0.82em;white-space:nowrap;">${hasData2 ? displayKey : ''}</td>
    <td style="text-align:center;padding:2px 6px;color:${tagColor};font-size:0.75em;white-space:nowrap;border-left:1px solid #2a3158;">${hasData2 ? sectionTag : ''}</td>
</tr>`;
        });

        // attrs 행
        const attrs1 = r1.attrs || [];
        const attrs2 = r2.attrs || [];
        if (attrs1.length > 0 || attrs2.length > 0) {
            const attrDisplay = (attrs) => attrs.length > 0
                ? attrs.map(a => `<span style="display:inline-block;padding:1px 6px;border-radius:3px;background:rgba(100,114,168,0.25);color:#b0bcff;font-size:0.8em;margin:1px 2px;">${a}</span>`).join(' ')
                : '<span style="color:#555;font-size:0.8em;">-</span>';
            const attrsSame = JSON.stringify([...attrs1].sort()) === JSON.stringify([...attrs2].sort());
            const attrDiffText  = attrsSame ? '동일' : '다름';
            const attrDiffStyle = attrsSame ? 'color:#888;' : 'color:#f0a500;font-weight:bold;';
            tbodyHtml += `<tr style="background:rgba(100,114,168,0.08);">
                <td style="text-align:center;padding:2px 6px;color:#b0bcff;font-size:0.75em;white-space:nowrap;border-right:1px solid #2a3158;">속성</td>
                <td style="text-align:center;padding:3px 8px;white-space:nowrap;" colspan="2">${attrDisplay(attrs1)}</td>
                <td style="text-align:center;padding:2px 8px;font-size:0.85em;white-space:nowrap;border-right:1px solid #2a3158;${attrDiffStyle}">${attrDiffText}</td>
                <td style="text-align:center;padding:3px 8px;white-space:nowrap;" colspan="2">${attrDisplay(attrs2)}</td>
                <td style="text-align:center;padding:2px 6px;color:#b0bcff;font-size:0.75em;white-space:nowrap;border-left:1px solid #2a3158;">속성</td>
            </tr>`;
        }

        // desc 행
        const desc1 = r1.desc || '';
        const desc2 = r2.desc || '';
        if (desc1 || desc2) {
            const descSame = desc1 === desc2;
            const fmtDesc = (d) => d
                ? d.split('\n').map(line => `<span style="display:block;line-height:1.5;">${line}</span>`).join('')
                : '<span style="color:#555;font-size:0.8em;">-</span>';
            const descDiffText  = descSame ? '동일' : '다름';
            const descDiffStyle = descSame ? 'color:#888;' : 'color:#f0a500;font-weight:bold;';
            const rowBg = !descSame ? 'background:rgba(240,165,0,0.06);' : '';
            tbodyHtml += `<tr style="${rowBg}">
                <td style="text-align:center;padding:2px 6px;color:#c8b87a;font-size:0.75em;white-space:nowrap;border-right:1px solid #2a3158;">설명</td>
                <td colspan="2" style="padding:4px 8px;color:#c8b87a;font-size:0.8em;border-right:1px solid #2a3158;text-align:left;vertical-align:top;">${fmtDesc(desc1)}</td>
                <td style="text-align:center;padding:2px 8px;font-size:0.85em;white-space:nowrap;border-right:1px solid #2a3158;${descDiffStyle}">${descDiffText}</td>
                <td colspan="2" style="padding:4px 8px;color:#c8b87a;font-size:0.8em;border-right:1px solid #2a3158;text-align:left;vertical-align:top;">${fmtDesc(desc2)}</td>
                <td style="text-align:center;padding:2px 6px;color:#c8b87a;font-size:0.75em;white-space:nowrap;border-left:1px solid #2a3158;">설명</td>
            </tr>`;
        }

        if (slot === '팔찌') {
            const job1    = section1.querySelector('[data-key="info_job"]')?.value || '';
            const job2    = section2.querySelector('[data-key="info_job"]')?.value || '';
            const exceed1 = r1.exceed || '';
            const exceed2 = r2.exceed || '';
            const eff1 = getExceedUniqueEffect(job1, exceed1);
            const eff2 = getExceedUniqueEffect(job2, exceed2);
            tbodyHtml += buildExceedUniqueEffectRows(eff1, exceed1, eff2, exceed2);
        }
    });

    const wrapper = document.createElement('div');
    wrapper.className = 'compare-section-wrapper';

    const titleEl = document.createElement('div');
    titleEl.className = 'compare-section-title';
    titleEl.textContent = '*악세서리 스탯 비교*';
    wrapper.appendChild(titleEl);

    const tableWrap = document.createElement('div');
    tableWrap.style.cssText = 'overflow-x:auto;margin-top:6px;';

    tableWrap.innerHTML = `
    <table style="border-collapse:collapse;width:max-content;min-width:400px;">
        <thead>
            <tr>
                <th colspan="3" style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.85em;color:#ffd700;border-right:1px solid #2a3158;">${name1}</th>
                <th rowspan="2" style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:80px;border-right:1px solid #2a3158;">차이</th>
                <th colspan="3" style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.85em;color:#ffd700;">${name2}</th>
            </tr>
            <tr>
                <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:80px;border-right:1px solid #2a3158;">구분</th>
                <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;">스탯</th>
                <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:100px;border-right:1px solid #2a3158;">수치</th>
                <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:100px;border-right:1px solid #2a3158;">수치</th>
                <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;">스탯</th>
                <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:80px;">구분</th>
            </tr>
        </thead>
        <tbody>${tbodyHtml}</tbody>
    </table>`;

    wrapper.appendChild(tableWrap);
    return wrapper;
}

/**
 * 악세서리 세트 효과 비교 표
 */
function buildAccSetEffectCompare(section1, section2, name1, name2) {
    const ACC_SLOTS = ["팔찌", "목걸이", "반지"];

    const setEffectsData = (typeof ACCESSORY_SET_EFFECTS !== 'undefined') ? ACCESSORY_SET_EFFECTS : {};

    function getAccSetEffects(section) {
        const accItemInfo = (typeof ACC_ITEM_INFO !== 'undefined') ? ACC_ITEM_INFO : {};

        // 슬롯별 아이템명, 접두어 수집
        const slots = {};
        ACC_SLOTS.forEach(slot => {
            const itemname = section.querySelector(`[data-key="${slot}_itemname"]`)?.value || '';
            const prefix   = section.querySelector(`select[data-key="${slot}_prefix"]`)?.value || '';
            if (itemname) slots[slot] = { itemname, prefix };
        });

        // 3슬롯 모두 없으면 판정 불필요
        const items = Object.values(slots);
        if (items.length === 0) return { setName: null, prefix: null, count: 0, effects3: null };

        // 세트명 확인 (모두 같은 세트인지)
        const setNames = items.map(({ itemname }) => accItemInfo[itemname]?.setName).filter(Boolean);
        if (setNames.length === 0) return { setName: null, prefix: null, count: 0, effects3: null };

        // 가장 많이 등장하는 세트명 선택
        const setNameCount = {};
        setNames.forEach(s => { setNameCount[s] = (setNameCount[s] || 0) + 1; });
        const bestSet = Object.entries(setNameCount).sort((a, b) => b[1] - a[1])[0][0];
        const count = setNameCount[bestSet];

        if (count < 3) return { setName: bestSet, prefix: null, count, effects3: null };

        // 접두어 판정:
        // - 팔찌/목걸이/반지 접두어가 모두 같으면 해당 접두어 세트 (팔찌 익시드 무관)
        // - 나머지는 기본 세트
        const braceletPrefix  = slots['팔찌']?.prefix  || '기본';
        const necklacePrefix  = slots['목걸이']?.prefix || '기본';
        const ringPrefix      = slots['반지']?.prefix   || '기본';

        let resultPrefix;
        if (braceletPrefix === necklacePrefix && necklacePrefix === ringPrefix && braceletPrefix !== '기본') {
            // 셋 다 같은 접두어
            resultPrefix = braceletPrefix;
        } else {
            // 나머지 모두 기본 세트 효과 (팔찌 익시드 + 목걸이/반지 기본 포함)
            resultPrefix = '기본';
        }

        let effects3 = null;
        const setData = setEffectsData[bestSet];
        if (setData && setData[resultPrefix]) {
            effects3 = setData[resultPrefix]["3"];
        } else if (!setData) {
            const strippedName = bestSet.replace(/^[^:]+:\s*/, '');
            const strippedData = setEffectsData[strippedName];
            if (strippedData && strippedData[resultPrefix]) {
                effects3 = strippedData[resultPrefix]["3"];
            }
        }

        return { setName: bestSet, prefix: resultPrefix, count, effects3 };
    }

    const result1 = getAccSetEffects(section1);
    const result2 = getAccSetEffects(section2);

    const wrapper = document.createElement('div');
    wrapper.className = 'compare-section-wrapper';

    const titleEl = document.createElement('div');
    titleEl.className = 'compare-section-title';
    titleEl.textContent = '*악세서리 세트 효과 비교*';
    wrapper.appendChild(titleEl);

    const tableWrap = document.createElement('div');
    tableWrap.style.cssText = 'overflow-x:auto;margin-top:6px;';

    let tbodyHtml = '';

    const set1Label = result1.setName
        ? `${result1.prefix && result1.prefix !== '기본' && !result1.setName.startsWith(result1.prefix) ? result1.prefix + ': ' : ''}${result1.setName} (${result1.count}셋)`
        : '세트 없음';
    const set2Label = result2.setName
        ? `${result2.prefix && result2.prefix !== '기본' && !result2.setName.startsWith(result2.prefix) ? result2.prefix + ': ' : ''}${result2.setName} (${result2.count}셋)`
        : '세트 없음';

    tbodyHtml += `<tr>
        <td style="text-align:center;padding:6px 8px;color:#ffd700;font-size:0.9em;white-space:nowrap;font-weight:bold;border-right:1px solid #2a3158;" colspan="3">${set1Label}</td>
        <td style="text-align:center;padding:6px 8px;color:#888;font-size:0.85em;border-right:1px solid #2a3158;" colspan="1">vs</td>
        <td style="text-align:center;padding:6px 8px;color:#ffd700;font-size:0.9em;white-space:nowrap;font-weight:bold;" colspan="3">${set2Label}</td>
    </tr>`;

    const has3Set1 = result1.count >= 3 && result1.effects3;
    const has3Set2 = result2.count >= 3 && result2.effects3;

    if (has3Set1 || has3Set2) {
        tbodyHtml += buildSetEffectRows(
            result1.effects3 || null,
            result2.effects3 || null,
            '3세트', '#7fd4ff', 'rgba(127,212,255,0.15)'
        );
    }

    if (!result1.effects3 && !result2.effects3) {
        tbodyHtml += `<tr>
            <td colspan="7" style="text-align:center;padding:12px 8px;color:#888;font-size:0.85em;">세트 효과 없음</td>
        </tr>`;
    }

    tableWrap.innerHTML = `
    <table style="border-collapse:collapse;width:max-content;min-width:400px;">
    <thead>
        <tr>
            <th colspan="3" style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.85em;color:#ffd700;border-right:1px solid #2a3158;">${name1}</th>
            <th rowspan="2" style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:80px;border-right:1px solid #2a3158;">차이</th>
            <th colspan="3" style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.85em;color:#ffd700;">${name2}</th>
        </tr>
        <tr>
            <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:80px;border-right:1px solid #2a3158;">구분</th>
            <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;">스탯</th>
            <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:100px;border-right:1px solid #2a3158;">수치</th>
            <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:100px;border-right:1px solid #2a3158;">수치</th>
            <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;">스탯</th>
            <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:80px;">구분</th>
        </tr>
    </thead>
        <tbody>${tbodyHtml}</tbody>
    </table>`;

    wrapper.appendChild(tableWrap);
    return wrapper;
}

/**
 * 특수장비 부위별 스탯 비교 표
 */
function buildSpecialStatCompare(section1, section2, name1, name2) {
    const SPECIAL_SLOTS = ["귀걸이", "마법석", "보조장비"];

    const specialData = (typeof SPECIAL_ITEM_STATS !== 'undefined') ? SPECIAL_ITEM_STATS : {};

    function getSpecialStats(section, slot) {
        const itemname = section.querySelector(`[data-key="${slot}_itemname"]`)?.value || '';
        const exceed   = section.querySelector(`select[data-key="${slot}_exceed"]`)?.value || '';
        const prefix   = section.querySelector(`select[data-key="${slot}_prefix"]`)?.value || '';
        if (!itemname || !specialData[itemname]) return { itemname, exceed, prefix, stats: null };

        const item = specialData[itemname];
        let baseArr, effArr;

        const exceed_stage = exceed || '이상';
        if (item.exceed) {
            const prefixKey = prefix || '불굴';
            baseArr = item.base?.[prefixKey] || [];
            effArr  = item.eff?.[prefixKey]  || [];
        } else {
            const prefixKey = prefix || '기본';
            baseArr = item.base?.[prefixKey] || [];
            effArr  = item.eff?.[prefixKey]  || [];
        }

        const map = {};
        const addToMap = (arr, section) => {
            arr.forEach(entry => {
                (entry.stats || []).forEach(statName => {
                    const key = `[${section}] ${statName}`;
                    if (!map[key]) map[key] = { amount: 0, unit: entry.unit || '' };
                    map[key].amount += (entry.amount || 0);
                });
            });
        };
        addToMap(baseArr, '기본효과');
        addToMap(effArr,  '효과');

        // attrs, desc 읽기
        let attrs = [], desc = '';
        if (item.attrs) {
            if (item.exceed) {
                attrs = item.attrs?.[exceed_stage]?.[prefix || '불굴'] || [];
            } else {
                attrs = item.attrs?.[prefix || '기본'] || [];
            }
        }
        if (item.desc) {
            if (item.exceed) {
                desc = item.desc?.[exceed_stage]?.[prefix || '불굴'] || '';
            } else {
                desc = item.desc?.[prefix || '기본'] || '';
            }
        }

        return { itemname, exceed, prefix, stats: map, attrs, desc };
    }

    const slotResults1 = {};
    const slotResults2 = {};
    SPECIAL_SLOTS.forEach(slot => {
        slotResults1[slot] = getSpecialStats(section1, slot);
        slotResults2[slot] = getSpecialStats(section2, slot);
    });

    let tbodyHtml = '';

    SPECIAL_SLOTS.forEach((slot, slotIdx) => {
        const r1 = slotResults1[slot];
        const r2 = slotResults2[slot];

        if (slotIdx > 0) {
            tbodyHtml += `<tr><td colspan="8" style="padding:0;border-top:1px solid #2a3158;"></td></tr>`;
        }

        const noData1 = !r1.stats;
        const noData2 = !r2.stats;

        if (noData1 && noData2) {
            const label1 = r1.itemname || '(미착용)';
            const label2 = r2.itemname || '(미착용)';
            tbodyHtml += `<tr>
                <td style="text-align:center;padding:3px 8px;color:#aaa;font-size:0.85em;white-space:nowrap;font-weight:bold;border-right:1px solid #2a3158;">${slot}</td>
                <td style="text-align:center;padding:3px 8px;color:#555;font-size:0.8em;" colspan="2">${label1}</td>
                <td style="text-align:center;padding:3px 8px;color:#888;font-size:0.78em;">vs</td>
                <td style="text-align:center;padding:3px 8px;color:#555;font-size:0.8em;" colspan="3">${label2}</td>
            </tr>`;
            return;
        }

        const allKeys = [...new Set([
            ...Object.keys(r1.stats || {}),
            ...Object.keys(r2.stats || {})
        ])];

        const sectionOrder = ['[기본효과]', '[효과]'];
        allKeys.sort((a, b) => {
            const sa = sectionOrder.findIndex(s => a.startsWith(s));
            const sb = sectionOrder.findIndex(s => b.startsWith(s));
            return sa - sb;
        });

        const itemLabel1 = r1.itemname
            ? `${r1.exceed ? `[${r1.exceed}] ` : ''}${r1.prefix && r1.prefix !== '기본' ? `${r1.prefix}: ` : ''}${r1.itemname}`
            : '(미착용)';
        const itemLabel2 = r2.itemname
            ? `${r2.exceed ? `[${r2.exceed}] ` : ''}${r2.prefix && r2.prefix !== '기본' ? `${r2.prefix}: ` : ''}${r2.itemname}`
            : '(미착용)';

        tbodyHtml += `<tr>
            <td style="text-align:center;padding:4px 8px;color:#e6c86e;font-size:0.85em;white-space:nowrap;font-weight:bold;border-right:1px solid #2a3158;">${slot}</td>
            <td style="text-align:center;padding:3px 8px;color:#aad4ff;font-size:0.78em;white-space:nowrap;" colspan="2">${itemLabel1}</td>
            <td style="text-align:center;padding:3px 8px;color:#888;font-size:0.78em;white-space:nowrap;">vs</td>
            <td style="text-align:center;padding:3px 8px;color:#aad4ff;font-size:0.78em;white-space:nowrap;" colspan="2">${itemLabel2}</td>
            <td style="text-align:center;padding:4px 8px;color:#e6c86e;font-size:0.85em;white-space:nowrap;font-weight:bold;border-left:1px solid #2a3158;">${slot}</td>
        </tr>`;

        allKeys.forEach(key => {
            const e1 = r1.stats?.[key];
            const e2 = r2.stats?.[key];
            const v1 = e1?.amount ?? 0;
            const v2 = e2?.amount ?? 0;
            const unit = e1?.unit || e2?.unit || '';
            const diff = v2 - v1;
            const highlight = (v1 !== v2) ? 'background:rgba(100,114,168,0.12);' : '';
            const displayKey = key.replace(/^\[기본효과\] |^\[효과\] /, '');
            const sectionTag = key.match(/^\[(.+?)\]/)?.[1] || '';
            const tagColor = sectionTag === '기본효과' ? '#7a9fcf' : '#a0d4a0';

            const display1 = e1 !== undefined ? `${v1}${unit}` : '';
            const display2 = e2 !== undefined ? `${v2}${unit}` : '';

            let diffText = '';
            let diffStyle2 = 'color:#888;';
            if (e1 !== undefined && e2 !== undefined) {
                if (diff > 0)      { diffText = `↑ +${diff}${unit}`; diffStyle2 = 'color:#2ecc71;font-weight:bold;'; }
                else if (diff < 0) { diffText = `↓ ${diff}${unit}`;  diffStyle2 = 'color:#e74c3c;font-weight:bold;'; }
                else               { diffText = '동일'; }
            } else if (e1 === undefined && e2 !== undefined) {
                diffText = `↑ +${v2}${unit}`; diffStyle2 = 'color:#2ecc71;font-weight:bold;';
            } else if (e1 !== undefined && e2 === undefined) {
                diffText = `↓ -${v1}${unit}`; diffStyle2 = 'color:#e74c3c;font-weight:bold;';
            }

            const hasData1 = e1 !== undefined;
            const hasData2 = e2 !== undefined;
            tbodyHtml += `<tr style="${highlight}">
    <td style="text-align:center;padding:2px 6px;color:${tagColor};font-size:0.75em;white-space:nowrap;border-right:1px solid #2a3158;">${hasData1 ? sectionTag : ''}</td>
    <td style="text-align:center;padding:2px 8px;color:#ccc;font-size:0.82em;white-space:nowrap;">${hasData1 ? displayKey : ''}</td>
    <td style="text-align:center;padding:2px 8px;color:#e6e9ff;font-size:0.85em;white-space:nowrap;border-right:1px solid #2a3158;">${display1}</td>
    <td style="text-align:center;padding:2px 8px;font-size:0.85em;white-space:nowrap;border-right:1px solid #2a3158;${diffStyle2}">${diffText}</td>
    <td style="text-align:center;padding:2px 8px;color:#e6e9ff;font-size:0.85em;white-space:nowrap;border-right:1px solid #2a3158;">${display2}</td>
    <td style="text-align:center;padding:2px 8px;color:#ccc;font-size:0.82em;white-space:nowrap;">${hasData2 ? displayKey : ''}</td>
    <td style="text-align:center;padding:2px 6px;color:${tagColor};font-size:0.75em;white-space:nowrap;border-left:1px solid #2a3158;">${hasData2 ? sectionTag : ''}</td>
</tr>`;
        });

        // attrs 행
        const attrs1 = r1.attrs || [];
        const attrs2 = r2.attrs || [];
        if (attrs1.length > 0 || attrs2.length > 0) {
            const attrDisplay = (attrs) => attrs.length > 0
                ? attrs.map(a => `<span style="display:inline-block;padding:1px 6px;border-radius:3px;background:rgba(100,114,168,0.25);color:#b0bcff;font-size:0.8em;margin:1px 2px;">${a}</span>`).join(' ')
                : '<span style="color:#555;font-size:0.8em;">-</span>';
            const attrsSame = JSON.stringify([...attrs1].sort()) === JSON.stringify([...attrs2].sort());
            const attrDiffText  = attrsSame ? '동일' : '다름';
            const attrDiffStyle = attrsSame ? 'color:#888;' : 'color:#f0a500;font-weight:bold;';
            tbodyHtml += `<tr style="background:rgba(100,114,168,0.08);">
                <td style="text-align:center;padding:2px 6px;color:#b0bcff;font-size:0.75em;white-space:nowrap;border-right:1px solid #2a3158;">속성</td>
                <td style="text-align:center;padding:3px 8px;white-space:nowrap;" colspan="2">${attrDisplay(attrs1)}</td>
                <td style="text-align:center;padding:2px 8px;font-size:0.85em;white-space:nowrap;border-right:1px solid #2a3158;${attrDiffStyle}">${attrDiffText}</td>
                <td style="text-align:center;padding:3px 8px;white-space:nowrap;" colspan="2">${attrDisplay(attrs2)}</td>
                <td style="text-align:center;padding:2px 6px;color:#b0bcff;font-size:0.75em;white-space:nowrap;border-left:1px solid #2a3158;">속성</td>
            </tr>`;
        }

        // desc 행
        const desc1 = r1.desc || '';
        const desc2 = r2.desc || '';
        if (desc1 || desc2) {
            const descSame = desc1 === desc2;
            const fmtDesc = (d) => d
                ? d.split('\n').map(line => `<span style="display:block;line-height:1.5;">${line}</span>`).join('')
                : '<span style="color:#555;font-size:0.8em;">-</span>';
            const descDiffText  = descSame ? '동일' : '다름';
            const descDiffStyle = descSame ? 'color:#888;' : 'color:#f0a500;font-weight:bold;';
            const rowBg = !descSame ? 'background:rgba(240,165,0,0.06);' : '';
            tbodyHtml += `<tr style="${rowBg}">
                <td style="text-align:center;padding:2px 6px;color:#c8b87a;font-size:0.75em;white-space:nowrap;border-right:1px solid #2a3158;">설명</td>
                <td colspan="2" style="padding:4px 8px;color:#c8b87a;font-size:0.8em;border-right:1px solid #2a3158;text-align:left;vertical-align:top;">${fmtDesc(desc1)}</td>
                <td style="text-align:center;padding:2px 8px;font-size:0.85em;white-space:nowrap;border-right:1px solid #2a3158;${descDiffStyle}">${descDiffText}</td>
                <td colspan="2" style="padding:4px 8px;color:#c8b87a;font-size:0.8em;border-right:1px solid #2a3158;text-align:left;vertical-align:top;">${fmtDesc(desc2)}</td>
                <td style="text-align:center;padding:2px 6px;color:#c8b87a;font-size:0.75em;white-space:nowrap;border-left:1px solid #2a3158;">설명</td>
            </tr>`;
        }

        if (slot === '귀걸이') {
            const job1    = section1.querySelector('[data-key="info_job"]')?.value || '';
            const job2    = section2.querySelector('[data-key="info_job"]')?.value || '';
            const exceed1 = r1.exceed || '';
            const exceed2 = r2.exceed || '';
            const eff1 = getExceedUniqueEffect(job1, exceed1);
            const eff2 = getExceedUniqueEffect(job2, exceed2);
            tbodyHtml += buildExceedUniqueEffectRows(eff1, exceed1, eff2, exceed2);
        }
    });

    const wrapper = document.createElement('div');
    wrapper.className = 'compare-section-wrapper';

    const titleEl = document.createElement('div');
    titleEl.className = 'compare-section-title';
    titleEl.textContent = '*특수장비 스탯 비교*';
    wrapper.appendChild(titleEl);

    const tableWrap = document.createElement('div');
    tableWrap.style.cssText = 'overflow-x:auto;margin-top:6px;';

    tableWrap.innerHTML = `
    <table style="border-collapse:collapse;width:max-content;min-width:400px;">
        <thead>
            <tr>
                <th colspan="3" style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.85em;color:#ffd700;border-right:1px solid #2a3158;">${name1}</th>
                <th rowspan="2" style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:80px;border-right:1px solid #2a3158;">차이</th>
                <th colspan="3" style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.85em;color:#ffd700;">${name2}</th>
            </tr>
            <tr>
                <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:80px;border-right:1px solid #2a3158;">구분</th>
                <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;">스탯</th>
                <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:100px;border-right:1px solid #2a3158;">수치</th>
                <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:100px;border-right:1px solid #2a3158;">수치</th>
                <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;">스탯</th>
                <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:80px;">구분</th>
            </tr>
        </thead>
        <tbody>${tbodyHtml}</tbody>
    </table>`;

    wrapper.appendChild(tableWrap);
    return wrapper;
}

/**
 * 특수장비 세트 효과 비교 표
 */
function buildSpecialSetEffectCompare(section1, section2, name1, name2) {
    const SPECIAL_SLOTS = ["귀걸이", "마법석", "보조장비"];

    const setEffectsData = (typeof SPECIAL_SET_EFFECTS !== 'undefined') ? SPECIAL_SET_EFFECTS : {};

    function getSpecialSetEffects(section) {
        const specialItemInfo = (typeof SPECIAL_ITEM_INFO !== 'undefined') ? SPECIAL_ITEM_INFO : {};

        const slots = {};
        SPECIAL_SLOTS.forEach(slot => {
            const itemname = section.querySelector(`[data-key="${slot}_itemname"]`)?.value || '';
            const prefix   = section.querySelector(`select[data-key="${slot}_prefix"]`)?.value || '';
            if (itemname) slots[slot] = { itemname, prefix };
        });

        const items = Object.values(slots);
        if (items.length === 0) return { setName: null, prefix: null, count: 0, effects3: null };

        const setNames = items.map(({ itemname }) => specialItemInfo[itemname]?.setName).filter(Boolean);
        if (setNames.length === 0) return { setName: null, prefix: null, count: 0, effects3: null };

        const setNameCount = {};
        setNames.forEach(s => { setNameCount[s] = (setNameCount[s] || 0) + 1; });
        const bestSet = Object.entries(setNameCount).sort((a, b) => b[1] - a[1])[0][0];
        const count = setNameCount[bestSet];

        if (count < 3) return { setName: bestSet, prefix: null, count, effects3: null };

        // 접두어 판정: 귀걸이/마법석/보조장비 모두 같은 접두어이면 해당 접두어, 아니면 기본
        const earPrefix  = slots['귀걸이']?.prefix  || '기본';
        const gemPrefix  = slots['마법석']?.prefix  || '기본';
        const subPrefix  = slots['보조장비']?.prefix || '기본';

        let resultPrefix;
        if (earPrefix === gemPrefix && gemPrefix === subPrefix && earPrefix !== '기본') {
            resultPrefix = earPrefix;
        } else {
            resultPrefix = '기본';
        }

        let effects3 = null;
        const setData = setEffectsData[bestSet];
        if (setData && setData[resultPrefix]) {
            effects3 = setData[resultPrefix]["3"];
        }

        return { setName: bestSet, prefix: resultPrefix, count, effects3 };
    }

    const result1 = getSpecialSetEffects(section1);
    const result2 = getSpecialSetEffects(section2);

    const wrapper = document.createElement('div');
    wrapper.className = 'compare-section-wrapper';

    const titleEl = document.createElement('div');
    titleEl.className = 'compare-section-title';
    titleEl.textContent = '*특수장비 세트 효과 비교*';
    wrapper.appendChild(titleEl);

    const tableWrap = document.createElement('div');
    tableWrap.style.cssText = 'overflow-x:auto;margin-top:6px;';

    let tbodyHtml = '';

    const set1Label = result1.setName
        ? `${result1.prefix && result1.prefix !== '기본' ? result1.prefix + ': ' : ''}${result1.setName} (${result1.count}셋)`
        : '세트 없음';
    const set2Label = result2.setName
        ? `${result2.prefix && result2.prefix !== '기본' ? result2.prefix + ': ' : ''}${result2.setName} (${result2.count}셋)`
        : '세트 없음';

    tbodyHtml += `<tr>
        <td style="text-align:center;padding:6px 8px;color:#ffd700;font-size:0.9em;white-space:nowrap;font-weight:bold;border-right:1px solid #2a3158;" colspan="3">${set1Label}</td>
        <td style="text-align:center;padding:6px 8px;color:#888;font-size:0.85em;border-right:1px solid #2a3158;" colspan="1">vs</td>
        <td style="text-align:center;padding:6px 8px;color:#ffd700;font-size:0.9em;white-space:nowrap;font-weight:bold;" colspan="3">${set2Label}</td>
    </tr>`;

    const has3Set1 = result1.count >= 3 && result1.effects3;
    const has3Set2 = result2.count >= 3 && result2.effects3;

    if (has3Set1 || has3Set2) {
        tbodyHtml += buildSetEffectRows(
            result1.effects3 || null,
            result2.effects3 || null,
            '3세트', '#7fd4ff', 'rgba(127,212,255,0.15)'
        );
    }

    if (!result1.effects3 && !result2.effects3) {
        tbodyHtml += `<tr>
            <td colspan="7" style="text-align:center;padding:12px 8px;color:#888;font-size:0.85em;">세트 효과 없음</td>
        </tr>`;
    }

    tableWrap.innerHTML = `
    <table style="border-collapse:collapse;width:max-content;min-width:400px;">
    <thead>
        <tr>
            <th colspan="3" style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.85em;color:#ffd700;border-right:1px solid #2a3158;">${name1}</th>
            <th rowspan="2" style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:80px;border-right:1px solid #2a3158;">차이</th>
            <th colspan="3" style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.85em;color:#ffd700;">${name2}</th>
        </tr>
        <tr>
            <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:80px;border-right:1px solid #2a3158;">구분</th>
            <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;">스탯</th>
            <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:100px;border-right:1px solid #2a3158;">수치</th>
            <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:100px;border-right:1px solid #2a3158;">수치</th>
            <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;">스탯</th>
            <th style="padding:4px 8px;text-align:center;white-space:nowrap;font-size:0.8em;width:80px;">구분</th>
        </tr>
    </thead>
        <tbody>${tbodyHtml}</tbody>
    </table>`;

    wrapper.appendChild(tableWrap);
    return wrapper;
}

/**
 * 비교 모드 종료
 */
/**
 * 비교 모드 탭 전환 (장비 비교 / 스탯 비교)
 */
function switchCompareTab(tab) {
    const isEq   = tab === 'eq';
    const isStat = tab === 'stat';
    const isAll  = tab === 'all';

    document.getElementById('compareContentEq').style.display   = isEq   ? 'block' : 'none';
    document.getElementById('compareContentStat').style.display = isStat ? 'block' : 'none';
    document.getElementById('compareContentAll').style.display  = isAll  ? 'block' : 'none';

    const tabEq   = document.getElementById('compareTabEq');
    const tabStat = document.getElementById('compareTabStat');
    const tabAll  = document.getElementById('compareTabAll');

    tabEq.style.borderBottomColor   = isEq   ? '#ffd700' : 'transparent';
    tabEq.style.color                = isEq   ? '#ffd700' : '#888';
    tabStat.style.borderBottomColor  = isStat ? '#ffd700' : 'transparent';
    tabStat.style.color              = isStat ? '#ffd700' : '#888';
    tabAll.style.borderBottomColor   = isAll  ? '#ffd700' : 'transparent';
    tabAll.style.color               = isAll  ? '#ffd700' : '#888';

    // 전체 비교 탭: 처음 열릴 때 한 번만 렌더링
    if (isAll) {
        const container = document.getElementById('compareContentAll');
        if (!container._rendered) {
            container._rendered = true;
            buildAllItemsCompare(container);
        }
    }
}

/**
 * 슬롯 데이터 가져오기
 */
function getSlotData(section, slot) {
    return {
        rarity: section.querySelector(`select[data-key="${slot}_rarity"]`)?.value || '',
        exceed: section.querySelector(`select[data-key="${slot}_exceed"]`)?.value || '',
        prefix: section.querySelector(`select[data-key="${slot}_prefix"]`)?.value || '',
        itemname: section.querySelector(`[data-key="${slot}_itemname"]`)?.value || '',
        reinforce: section.querySelector(`input[data-key="${slot}_reinforce"]`)?.value || '',
        seal1: section.querySelector(`select[data-key="${slot}_seal1"]`)?.value || '',
        seal1_val: section.querySelector(`input[data-key="${slot}_seal1_val"]`)?.value || '',
        seal2: section.querySelector(`select[data-key="${slot}_seal2"]`)?.value || '',
        seal2_val: section.querySelector(`input[data-key="${slot}_seal2_val"]`)?.value || '',
        emb1: section.querySelector(`[data-key="${slot}_emb1"]`)?.value || '',
        emb2: section.querySelector(`[data-key="${slot}_emb2"]`)?.value || '',
        enchant: section.querySelector(`input[data-key="${slot}_enchant"]`)?.value || '',
        enchant_val: section.querySelector(`input[data-key="${slot}_enchant_val"]`)?.value || ''
    };
}

// ============================================
// ============================================
// 칭호/오라/아바타 비교 헬퍼
// ============================================

/**
 * 칭호/오라/아바타 이름 읽기
 */
function getSpecialSlotName(section, slot) {
    if (slot === '칭호') {
        const btn = section.querySelector('[data-key="칭호_itemname"]');
        return btn ? (btn.getAttribute('data-title-name') || btn.textContent.trim() || '') : '';
    }
    if (slot === '오라') {
        const btn = section.querySelector('[data-key="오라_itemname"]');
        return btn ? (btn.getAttribute('data-aura-name') || btn.textContent.trim() || '') : '';
    }
    if (slot === '아바타') {
        const btn = section.querySelector('[data-key="아바타_itemname"]');
        return btn ? (btn.getAttribute('data-avatar-value') || btn.textContent.trim() || '') : '';
    }
    return '';
}

/**
 * 칭호/오라 스탯 파싱 → 표시용 배열 반환
 * stats JSON: { base: [{stats, amount, unit}, ...], eff: [...] }
 */
function _parseSpecialStats(statsJson) {
    try {
        const data = typeof statsJson === 'string' ? JSON.parse(statsJson) : statsJson;
        const lines = [];
        const push = (arr, label) => {
            if (!arr || !arr.length) return;
            arr.forEach(e => {
                const names = (e.stats || []).join(', ');
                const val = e.amount != null ? `${e.amount}${e.unit || ''}` : '';
                if (names) lines.push(`[${label}] ${names}${val ? ' +' + val : ''}`);
            });
        };
        push(data.base, '기본');
        push(data.eff, '효과');
        return lines;
    } catch (e) {
        return [];
    }
}

/**
 * 칭호/오라/아바타 비교 팝업
 */
function openCompareSpecialPopup(slot, s1Id, s2Id, triggerBtn) {
    const section1 = document.getElementById(s1Id);
    const section2 = document.getElementById(s2Id);
    if (!section1 || !section2) return;

    const charName1 = section1.querySelector('[data-key="info_name"]')?.value || s1Id;
    const charName2 = section2.querySelector('[data-key="info_name"]')?.value || s2Id;

    let html = '';

    // ── 칭호 / 오라 비교 ──────────────────────────────
    if (slot === '칭호' || slot === '오라') {
        const btnKey    = slot === '칭호' ? '[data-key="칭호_itemname"]' : '[data-key="오라_itemname"]';
        const nameAttr  = slot === '칭호' ? 'data-title-name' : 'data-aura-name';
        const statsAttr = slot === '칭호' ? 'data-title-stats' : 'data-aura-stats';

        const btn1 = section1.querySelector(btnKey);
        const btn2 = section2.querySelector(btnKey);
        const itemName1 = btn1?.getAttribute(nameAttr) || '';
        const itemName2 = btn2?.getAttribute(nameAttr) || '';

        const parseStatMap = (json) => {
            const map = {};
            try {
                const data = JSON.parse(json || '{}');
                ['base','eff'].forEach(type => {
                    (data[type] || []).forEach(e => {
                        (e.stats || []).forEach(s => { map[`${s}_${type}`] = Number(e.amount) || 0; });
                    });
                });
            } catch(e) {}
            return map;
        };

        const map1 = parseStatMap(btn1?.getAttribute(statsAttr));
        const map2 = parseStatMap(btn2?.getAttribute(statsAttr));
        const allKeys = [...new Set([...Object.keys(map1), ...Object.keys(map2)])];
        allKeys.sort((a, b) => (a.endsWith('_eff') ? 1 : 0) - (b.endsWith('_eff') ? 1 : 0));

        const diffStyle = (d) => d > 0 ? 'color:#2ecc71;font-weight:bold;' : d < 0 ? 'color:#e74c3c;font-weight:bold;' : 'color:#888;';
        const roundDiff = (d) => Math.round(d * 10000) / 10000;
        const fmtDiff   = (d) => d > 0 ? `↑ +${d}` : d < 0 ? `↓ ${d}` : '-';

        const statRows = allKeys.map(k => {
            const [statKey, type] = k.split(/_(?=base$|eff$)/);
            const typeLabel = type === 'eff' ? '[효과]' : '[기본]';
            const label = (typeof _STAT_LABELS !== 'undefined' && _STAT_LABELS[statKey]) || statKey;
            const fullLabel = `${typeLabel} ${label}`;
            const v1 = map1[k] ?? 0;
            const v2 = map2[k] ?? 0;
            const diff = roundDiff(v2 - v1);
            const highlight = (v1 !== v2) ? 'background:rgba(255,255,255,0.04);' : '';
            return `<tr style="${highlight}">
                <td style="text-align:center;padding:3px 10px;white-space:nowrap;">${fullLabel}</td>
                <td style="text-align:center;padding:3px 10px;white-space:nowrap;">${v1 !== 0 ? v1 : ''}</td>
                <td style="text-align:center;padding:3px 10px;white-space:nowrap;${diffStyle(diff)}">${fmtDiff(diff)}</td>
                <td style="text-align:center;padding:3px 10px;white-space:nowrap;">${v2 !== 0 ? v2 : ''}</td>
                <td style="text-align:center;padding:3px 10px;white-space:nowrap;">${fullLabel}</td>
            </tr>`;
        }).join('');

        html = `
        <div style="display:flex;justify-content:space-between;margin-bottom:10px;gap:8px;">
            <span style="color:#ffd700;font-weight:bold;">${charName1}</span>
            <span style="color:#aad4ff;font-size:0.85em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${itemName1 || '(미착용)'}</span>
            <span style="color:#888;font-size:0.85em;">vs</span>
            <span style="color:#aad4ff;font-size:0.85em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${itemName2 || '(미착용)'}</span>
            <span style="color:#ffd700;font-weight:bold;">${charName2}</span>
        </div>
        <div style="overflow-x:auto;">
        <table style="border-collapse:collapse;white-space:nowrap;">
            <thead><tr>
                <th style="padding:4px 10px;color:#aaa;font-size:0.8em;text-align:center;">스탯</th>
                <th style="padding:4px 10px;color:#ffd700;font-size:0.85em;text-align:center;">${charName1}</th>
                <th style="padding:4px 10px;color:#aaa;font-size:0.8em;text-align:center;">차이</th>
                <th style="padding:4px 10px;color:#ffd700;font-size:0.85em;text-align:center;">${charName2}</th>
                <th style="padding:4px 10px;color:#aaa;font-size:0.8em;text-align:center;">스탯</th>
            </tr></thead>
            <tbody>${statRows || '<tr><td colspan="5" style="text-align:center;color:#888;padding:8px;">스탯 데이터 없음</td></tr>'}</tbody>
        </table>
        </div>`;
    }

    // ── 아바타 비교 ───────────────────────────────────
    if (slot === '아바타') {
        const btn1 = section1.querySelector('[data-key="아바타_itemname"]');
        const btn2 = section2.querySelector('[data-key="아바타_itemname"]');
        const raw1 = btn1?.getAttribute('data-avatar-value') || '';
        const raw2 = btn2?.getAttribute('data-avatar-value') || '';

        const parseParts = (raw) => {
            const parts = {};
            raw.trim().split(/\s+/).forEach(token => {
                const m = token.match(/^(.+)\((.+)\)$/);
                if (m) parts[m[1]] = m[2];
            });
            return parts;
        };

        const parts1 = parseParts(raw1);
        const parts2 = parseParts(raw2);
        const ALL_PARTS = ['모자','얼굴','상의','목가슴','신발','머리','하의','허리','피부'];
        const GRADE_COLOR = { '언커먼': '#4dabf7', '레어': '#b197fc' };
        const gradeStyle = (g) => g ? `color:${GRADE_COLOR[g]||'#fff'};font-weight:bold;` : 'color:#555;';

        const getStatLabel = (part, grade) => {
            if (!grade || typeof AVATAR_PART_STATS === 'undefined') return '';
            return AVATAR_PART_STATS[part]?.[grade]?.label || '';
        };
        const getAmount = (part, grade) => {
            if (!grade || typeof AVATAR_PART_STATS === 'undefined') return null;
            return AVATAR_PART_STATS[part]?.[grade]?.amount ?? null;
        };
        const diffStyle = (d) => d > 0 ? 'color:#2ecc71;font-weight:bold;' : d < 0 ? 'color:#e74c3c;font-weight:bold;' : 'color:#888;';
        const roundDiff = (d) => Math.round(d * 10000) / 10000;
        const fmtDiff   = (d) => d > 0 ? `↑ +${d}` : d < 0 ? `↓ ${d}` : '-';

        const rows = ALL_PARTS.map(part => {
            const g1 = parts1[part] || '';
            const g2 = parts2[part] || '';
            const stat1 = getStatLabel(part, g1);
            const stat2 = getStatLabel(part, g2);
            const a1 = getAmount(part, g1);
            const a2 = getAmount(part, g2);
            const diff = (a1 !== null && a2 !== null) ? roundDiff(a2 - a1) : null;
            const diffHtml = (diff !== null) ? `<span style="${diffStyle(diff)}">${fmtDiff(diff)}</span>` : '-';
            const highlight = (g1 !== g2) ? 'background:rgba(255,255,255,0.04);' : '';
            return `<tr style="${highlight}">
                <td style="text-align:center;padding:3px 8px;color:#aaa;font-size:0.85em;white-space:nowrap;">${part}</td>
                <td style="text-align:center;padding:3px 8px;white-space:nowrap;${gradeStyle(g1)}">${g1 || '-'}</td>
                <td style="text-align:center;padding:3px 8px;color:#bbb;font-size:0.8em;white-space:nowrap;">${stat1}</td>
                <td style="text-align:center;padding:3px 8px;font-size:0.85em;white-space:nowrap;">${diffHtml}</td>
                <td style="text-align:center;padding:3px 8px;color:#bbb;font-size:0.8em;white-space:nowrap;">${stat2}</td>
                <td style="text-align:center;padding:3px 8px;white-space:nowrap;${gradeStyle(g2)}">${g2 || '-'}</td>
                <td style="text-align:center;padding:3px 8px;color:#aaa;font-size:0.85em;white-space:nowrap;">${part}</td>
            </tr>`;
        }).join('');

        const weaponStat1 = section1.querySelector('[data-key="아바타_weapon_stat"]');
        const weaponStat2 = section2.querySelector('[data-key="아바타_weapon_stat"]');
        const wsLabel = (sel) => {
            if (!sel) return '-';
            const opt = sel.options[sel.selectedIndex];
            return opt ? (opt.text || '-') : '-';
        };

        html = `
        <div style="overflow-x:auto;">
        <table style="border-collapse:collapse;white-space:nowrap;">
            <thead><tr>
                <th style="padding:4px 8px;color:#aaa;font-size:0.8em;text-align:center;">파츠</th>
                <th style="padding:4px 8px;color:#ffd700;font-size:0.85em;text-align:center;">${charName1}</th>
                <th style="padding:4px 8px;color:#aaa;font-size:0.8em;text-align:center;">수치</th>
                <th style="padding:4px 8px;color:#aaa;font-size:0.8em;text-align:center;">차이</th>
                <th style="padding:4px 8px;color:#aaa;font-size:0.8em;text-align:center;">수치</th>
                <th style="padding:4px 8px;color:#ffd700;font-size:0.85em;text-align:center;">${charName2}</th>
                <th style="padding:4px 8px;color:#aaa;font-size:0.8em;text-align:center;">파츠</th>
            </tr></thead>
            <tbody>${rows}</tbody>
        </table>
        </div>
        <div style="border-top:1px solid #2a3158;padding-top:8px;margin-top:8px;display:grid;grid-template-columns:1fr auto 1fr;gap:4px;font-size:0.85em;align-items:center;">
            <span style="text-align:center;color:#aad4ff;white-space:nowrap;">${wsLabel(weaponStat1)}</span>
            <span style="text-align:center;color:#888;padding:0 8px;white-space:nowrap;">무기 아바타</span>
            <span style="text-align:center;color:#aad4ff;white-space:nowrap;">${wsLabel(weaponStat2)}</span>
        </div>`;
    }

    // 팝업 렌더링
    const existingOverlay = document.getElementById('compare-special-overlay');
    if (existingOverlay) existingOverlay.remove();

    // 테마 감지
    const bodyClass = document.body.className || '';
    const isNavy  = bodyClass.includes('theme-navy');
    const isDark  = bodyClass.includes('theme-dark');
    const isMixed = bodyClass.includes('theme-mixed');

    // 남색: navy / 다크·혼합: dark / 기본: navy
    const theme = isNavy ? 'navy' : (isDark || isMixed) ? 'dark' : 'navy';
    const themeStyles = {
        navy: {
            bg:          '#0f1222',
            border:      '#2a3158',
            headerBg:    '#181c33',
            rowBg:       '#1a1e33',
            rowHlBg:     'rgba(100,114,168,0.15)',
            text:        '#e6e9ff',
            subText:     '#8899cc',
            closeBtnBg:  '#2a3158',
            closeBtnBorder: '#4a5178',
        },
        dark: {
            bg:          '#1a1a1f',
            border:      '#444',
            headerBg:    '#2a2a32',
            rowBg:       '#1a1a1f',
            rowHlBg:     'rgba(255,255,255,0.06)',
            text:        '#ddd',
            subText:     '#888',
            closeBtnBg:  '#2a2a32',
            closeBtnBorder: '#555',
        },
    };
    const t = themeStyles[theme];

    // 트리거 버튼이 속한 표를 찾아 그 부모에 absolute로 붙임 → 표와 함께 스크롤
    const triggerTable = triggerBtn?.closest('table');
    const container = triggerTable?.parentElement || document.body;
    container.style.position = 'relative';

    // 표 세로 중앙 위치 계산
    const containerRect = container.getBoundingClientRect();
    const tableRect = triggerTable ? triggerTable.getBoundingClientRect() : containerRect;
    const tableCenterY = tableRect.top - containerRect.top + container.scrollTop + tableRect.height / 2;

    // 행 하이라이트를 테마 색으로 교체
    html = html.replaceAll('background:rgba(255,255,255,0.04)', `background:${t.rowHlBg}`);

    const overlay = document.createElement('div');
    overlay.id = 'compare-special-overlay';
    overlay.style.cssText = [
        'position:absolute;',
        'z-index:4000;',
        `top:${tableCenterY}px;`,
        'left:50%;',
        'transform:translate(-50%, -50%);',
        `background:${t.bg};`,
        `border:1px solid ${t.border};`,
        'border-radius:8px;',
        'padding:20px;',
        'max-height:80vh;',
        'overflow-y:auto;',
        'box-shadow:0 8px 32px rgba(0,0,0,0.8);',
    ].join('');

    overlay.innerHTML = `
        <div style="color:#ffd700;font-weight:bold;font-size:1.05em;margin-bottom:14px;text-align:center;">${slot} 비교</div>
        ${html}
        <div style="text-align:center;margin-top:16px;">
            <button onclick="document.getElementById('compare-special-overlay').remove()"
                style="padding:4px 20px;background:${t.closeBtnBg};color:${t.text};border:1px solid ${t.closeBtnBorder};border-radius:4px;cursor:pointer;">닫기</button>
        </div>`;

    // 테이블 헤더/셀 색상 적용
    container.appendChild(overlay);
    overlay.querySelectorAll('thead th').forEach(th => {
        th.style.background = t.headerBg;
        if (!th.style.color || th.style.color === 'rgb(170, 170, 170)') th.style.color = t.subText;
    });
    overlay.querySelectorAll('tbody td').forEach(td => {
        if (!td.style.background) td.style.background = t.rowBg;
        if (!td.style.color) td.style.color = t.text;
    });
}