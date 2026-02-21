// ============================================
// ui-compare.js - 비교 모드 기능 (리팩토링 완료)
// ============================================

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
            td.textContent = cell.text ?? '';
            if (cell.cls) td.className = cell.cls;
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
        td.textContent = row.text ?? '-';
        td.className = `compare-diff ${CompareUtils.getDiffClass(row.text)}`;
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

    slots.forEach(slot => {
        if (dividerBefore.includes(slot)) {
            leftRows.push({ divider: true });
            centerRows.push({ divider: true });
            rightRows.push({ divider: true });
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
        rightRows.push({ cells: [{ text: slot, cls: 'compare-slot-name' }, { text: d2[sealKey], cls: sc2 }, { text: d2[sealValKey], cls: sc2 }] });
    });

    return createCompareSection(
        `*마법봉인 비교 (${label})*`,
        [[{ text: name1, colspan: 3 }], [{ text: '슬롯' }, { text: label }, { text: '수치' }]],
        name1 + ' vs ' + name2,
        [[{ text: name2, colspan: 3 }], [{ text: '슬롯' }, { text: label }, { text: '수치' }]],
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
            else if (d1.emb1 !== d2.emb1 && (d1.emb1 !== '' || d2.emb1 !== '')) diff = '값이 다름';
        } else {
            const e1 = calculateNumDiff(extractNumber(d1.emb1), extractNumber(d2.emb1));
            const e2 = calculateNumDiff(extractNumber(d1.emb2), extractNumber(d2.emb2));
            diff = `${e1} / ${e2}`;
        }

        leftRows.push({ cells: [{ text: slot, cls: 'compare-slot-name' }, { text: d1.emb1, cls: ec1 }, { text: d1.emb2, cls: ec1 }] });
        centerRows.push({ text: diff });
        rightRows.push({ cells: [{ text: slot, cls: 'compare-slot-name' }, { text: d2.emb1, cls: ec2 }, { text: d2.emb2, cls: ec2 }] });
    });

    return createCompareSection(
        '*엠블렘 비교*',
        [[{ text: name1, colspan: 3 }], [{ text: '슬롯' }, { text: '엠블렘1' }, { text: '엠블렘2' }]],
        name1 + ' vs ' + name2,
        [[{ text: name2, colspan: 3 }], [{ text: '슬롯' }, { text: '엠블렘1' }, { text: '엠블렘2' }]],
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
        else if (d1.enchant !== d2.enchant && (d1.enchant !== '' || d2.enchant !== '')) diff = '값이 다름';

        leftRows.push({ cells: [{ text: slot, cls: 'compare-slot-name' }, { text: d1.enchant }, { text: d1.enchant_val }] });
        centerRows.push({ text: diff });
        rightRows.push({ cells: [{ text: slot, cls: 'compare-slot-name' }, { text: d2.enchant }, { text: d2.enchant_val }] });
    });

    return createCompareSection(
        '*마법부여 비교*',
        [[{ text: name1, colspan: 3 }], [{ text: '슬롯' }, { text: '마법부여' }, { text: '수치' }]],
        name1 + ' vs ' + name2,
        [[{ text: name2, colspan: 3 }], [{ text: '슬롯' }, { text: '마법부여' }, { text: '수치' }]],
        leftRows, centerRows, rightRows
    );
}

// 기존 CompareTable은 호환성을 위해 빈 객체로 유지
const CompareTable = {};

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

    const container = document.getElementById('compareContent');
    container.innerHTML = '';

    const sections = [
        buildEquipmentCompare(section1, section2, displayName1, displayName2),
        buildSealCompare(section1, section2, displayName1, displayName2, true),
        buildSealCompare(section1, section2, displayName1, displayName2, false),
        buildEmblemCompare(section1, section2, displayName1, displayName2),
        buildEnchantCompare(section1, section2, displayName1, displayName2),
    ];

    sections.forEach(s => container.appendChild(s));

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
 * 비교 모드 종료
 */
function exitCompareMode() {
    document.getElementById('characterContainer').style.display = 'block';
    document.getElementById('compareCharSelectionContainer').style.display = 'none';
    document.getElementById('compareContainer').style.display = 'none';
    AppState.compareSelection = { left: null, right: null };
    document.getElementById('compareContent').innerHTML = '';
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