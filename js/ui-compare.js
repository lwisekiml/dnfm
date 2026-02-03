// ============================================
// ui-compare.js - 비교 모드 기능 (리팩토링 완료)
// ============================================

/**
 * 비교 유틸리티 함수
 */
const CompareUtils = {
    /**
     * 희귀도 클래스 반환
     */
    getRarityClass(rarity) {
        return rarity ? `rare-${rarity}` : '';
    },

    /**
     * 익시드 클래스 반환
     */
    getExceedClass(exceed) {
        return exceed ? `ex-${exceed}` : '';
    },

    /**
     * 접두어 클래스 반환
     */
    getPrefixClass(slot, prefix) {
        if (!prefix) return '';

        if (prefix.startsWith('T')) {
            return 'prefix-tier';
        }

        let classes = 'prefix-selected';

        if (slot === "무기") {
            if (prefix === "광채") classes += ' p-blue';
            else if (prefix === "분쇄") classes += ' p-red';
            else if (prefix === "선명") classes += ' p-green';
            else if (prefix === "강타") classes += ' p-yellow';
        }

        return classes;
    },

    /**
     * 봉인 하이라이트 클래스 반환
     */
    getSealHighlightClass(slot, sealValue, statType, eleType, isSeal1 = true) {
        const armorSlots = ["상의", "어깨", "하의", "신발", "벨트"];
        const accSlots = ["목걸이", "팔찌", "반지"];
        const specialSlots = ["보조장비", "귀걸이", "마법석"];

        if (isSeal1) {
            // seal1 하이라이트
            if (slot === "무기" && sealValue === "데미지 증가") {
                return 'highlight-yellow';
            }
            if ((armorSlots.includes(slot) || specialSlots.includes(slot)) && sealValue === statType) {
                return 'highlight-yellow';
            }
            if (accSlots.includes(slot) && sealValue === eleType) {
                return 'highlight-yellow';
            }
        } else {
            // seal2 하이라이트
            if ((armorSlots.includes(slot) || slot === "무기" || specialSlots.includes(slot)) && sealValue === statType) {
                return 'highlight-yellow';
            }
            if (accSlots.includes(slot) && sealValue === eleType) {
                return 'highlight-yellow';
            }
        }

        return '';
    },

    /**
     * 엠블렘 하이라이트 클래스 반환
     */
    getEmblemHighlightClass(slot, embValue, eleType) {
        const embHighlightSlots = ["보조장비", "귀걸이", "마법석", "칭호"];

        if (embHighlightSlots.includes(slot) && (embValue === eleType || embValue === "모속강")) {
            return 'highlight-yellow';
        }

        return '';
    },

    /**
     * 차이값 클래스 반환
     */
    getDiffClass(diffValue) {
        if (!diffValue || diffValue === '-' || diffValue === '') {
            return 'same';
        }
        if (diffValue.includes('+') || diffValue.includes('⬆')) {
            return 'positive';
        }
        return 'negative';
    }
};

/**
 * 비교 행 생성 함수
 */
const CompareRow = {
    /**
     * 장비 비교 행 생성
     */
    createEquipmentRow(slot, data1, data2, reinforceDiff) {
        const tr = document.createElement('tr');

        const rarityClass1 = CompareUtils.getRarityClass(data1.rarity);
        const rarityClass2 = CompareUtils.getRarityClass(data2.rarity);
        const exceedClass1 = CompareUtils.getExceedClass(data1.exceed);
        const exceedClass2 = CompareUtils.getExceedClass(data2.exceed);
        const prefixClass1 = CompareUtils.getPrefixClass(slot, data1.prefix);
        const prefixClass2 = CompareUtils.getPrefixClass(slot, data2.prefix);
        const diffClass = CompareUtils.getDiffClass(reinforceDiff);

        tr.innerHTML = `
            <td class="compare-slot-name">${slot}</td>
            <td class="${rarityClass1}">${data1.rarity}</td>
            <td class="${exceedClass1}">${data1.exceed}</td>
            <td class="${prefixClass1}">${data1.prefix}</td>
            <td>${data1.itemname}</td>
            <td>${data1.reinforce}</td>
            <td class="compare-diff ${diffClass}">${reinforceDiff}</td>
            <td>${data2.reinforce}</td>
            <td>${data2.itemname}</td>
            <td class="${prefixClass2}">${data2.prefix}</td>
            <td class="${exceedClass2}">${data2.exceed}</td>
            <td class="${rarityClass2}">${data2.rarity}</td>
        `;

        return tr;
    },

    /**
     * 봉인 비교 행 생성
     */
    createSealRow(slot, data1, data2, sealDiff, statType1, eleType1, statType2, eleType2, isSeal1 = true) {
        const tr = document.createElement('tr');

        const sealKey = isSeal1 ? 'seal1' : 'seal2';
        const sealValKey = isSeal1 ? 'seal1_val' : 'seal2_val';

        const sealClass1 = CompareUtils.getSealHighlightClass(slot, data1[sealKey], statType1, eleType1, isSeal1);
        const sealClass2 = CompareUtils.getSealHighlightClass(slot, data2[sealKey], statType2, eleType2, isSeal1);
        const diffClass = CompareUtils.getDiffClass(sealDiff);

        tr.innerHTML = `
            <td class="compare-slot-name">${slot}</td>
            <td class="${sealClass1}">${data1[sealKey]}</td>
            <td class="${sealClass1}">${data1[sealValKey]}</td>
            <td class="compare-diff ${diffClass}">${sealDiff}</td>
            <td class="${sealClass2}">${data2[sealKey]}</td>
            <td class="${sealClass2}">${data2[sealValKey]}</td>
        `;

        return tr;
    },

    /**
     * 엠블렘 비교 행 생성
     */
    createEmblemRow(slot, data1, data2, embDiff, eleType1, eleType2) {
        const tr = document.createElement('tr');

        const emb1Class1 = CompareUtils.getEmblemHighlightClass(slot, data1.emb1, eleType1);
        const emb1Class2 = CompareUtils.getEmblemHighlightClass(slot, data2.emb1, eleType2);
        const diffClass = CompareUtils.getDiffClass(embDiff);

        tr.innerHTML = `
            <td class="compare-slot-name">${slot}</td>
            <td class="${emb1Class1}">${data1.emb1}</td>
            <td class="${emb1Class1}">${data1.emb2}</td>
            <td class="compare-diff ${diffClass}">${embDiff}</td>
            <td class="${emb1Class2}">${data2.emb1}</td>
            <td class="${emb1Class2}">${data2.emb2}</td>
        `;

        return tr;
    },

    /**
     * 마법부여 비교 행 생성
     */
    createEnchantRow(slot, data1, data2, enchantDiff) {
        const tr = document.createElement('tr');

        const diffClass = CompareUtils.getDiffClass(enchantDiff);

        tr.innerHTML = `
            <td class="compare-slot-name">${slot}</td>
            <td>${data1.enchant}</td>
            <td>${data1.enchant_val}</td>
            <td class="compare-diff ${diffClass}">${enchantDiff}</td>
            <td>${data2.enchant}</td>
            <td>${data2.enchant_val}</td>
        `;

        return tr;
    },

    /**
     * 구분선 행 생성
     */
    createDividerRow(colspan) {
        const tr = document.createElement('tr');
        tr.className = 'compare-divider-row';
        tr.innerHTML = `<td colspan="${colspan}"></td>`;
        return tr;
    }
};

/**
 * 비교 테이블 생성 함수
 */
const CompareTable = {
    /**
     * 테이블 구조 생성
     */
    createTableStructure(colgroup, headers) {
        const table = document.createElement('table');
        table.className = 'compare-table';

        // colgroup 추가
        const colgroupEl = document.createElement('colgroup');
        colgroup.forEach(col => {
            const colEl = document.createElement('col');
            colEl.className = col;
            colgroupEl.appendChild(colEl);
        });
        table.appendChild(colgroupEl);

        // thead 추가
        const thead = document.createElement('thead');
        headers.forEach(headerRow => {
            const tr = document.createElement('tr');
            headerRow.forEach(cell => {
                const th = document.createElement('th');
                if (cell.colspan) th.colSpan = cell.colspan;
                if (cell.className) th.className = cell.className;
                th.textContent = cell.text;
                tr.appendChild(th);
            });
            thead.appendChild(tr);
        });
        table.appendChild(thead);

        // tbody 추가
        const tbody = document.createElement('tbody');
        table.appendChild(tbody);

        return table;
    },

    /**
     * 장비 비교 테이블 생성
     */
    createEquipmentTable(section1, section2, displayName1, displayName2) {
        const equipSlots = ["무기", "상의", "어깨", "하의", "신발", "벨트", "목걸이", "팔찌", "반지", "보조장비", "귀걸이", "마법석", "칭호", "외형칭호", "오라", "아바타"];
        const groupSlots = {
            group1: ["무기", "상의", "어깨", "하의", "신발", "벨트"],
            group2: ["목걸이", "팔찌", "반지"],
            group3: ["보조장비", "귀걸이", "마법석"],
            group4: ["칭호", "외형칭호", "오라", "아바타"]
        };

        const colgroup = [
            'compare-slot-col', 'compare-attr-col', 'compare-attr-col', 'compare-attr-col',
            'compare-item-col', 'compare-reinforce-col', 'compare-diff-col', 'compare-reinforce-col',
            'compare-item-col', 'compare-attr-col', 'compare-attr-col', 'compare-attr-col'
        ];

        const headers = [
            [
                { text: '' },
                { text: displayName1, colspan: 5 },
                { text: '비교값', className: 'compare-diff-col' },
                { text: displayName2, colspan: 5 }
            ],
            [
                { text: '슬롯' },
                { text: '희귀도' },
                { text: '익시드' },
                { text: '접두어' },
                { text: '아이템이름' },
                { text: '강화' },
                { text: '차이' },
                { text: '강화' },
                { text: '아이템이름' },
                { text: '접두어' },
                { text: '익시드' },
                { text: '희귀도' }
            ]
        ];

        const table = this.createTableStructure(colgroup, headers);
        const tbody = table.querySelector('tbody');

        let currentGroup = '';
        equipSlots.forEach(slot => {
            // 그룹 구분선
            for (const [groupName, groupArray] of Object.entries(groupSlots)) {
                if (groupArray[0] === slot && currentGroup !== groupName) {
                    if (currentGroup !== '') {
                        tbody.appendChild(CompareRow.createDividerRow(12));
                    }
                    currentGroup = groupName;
                    break;
                }
            }

            const data1 = getSlotData(section1, slot);
            const data2 = getSlotData(section2, slot);
            const reinforceDiff = calculateReinforceDiff(slot, data1.reinforce, data2.reinforce);

            const row = CompareRow.createEquipmentRow(slot, data1, data2, reinforceDiff);
            tbody.appendChild(row);
        });

        return table;
    },

    /**
     * 봉인 비교 테이블 생성
     */
    createSealTable(section1, section2, displayName1, displayName2, isSeal1 = true) {
        const equipSlots = ["무기", "상의", "어깨", "하의", "신발", "벨트", "목걸이", "팔찌", "반지", "보조장비", "귀걸이", "마법석"];
        const groupSlots = {
            group1: ["무기", "상의", "어깨", "하의", "신발", "벨트"],
            group2: ["목걸이", "팔찌", "반지"],
            group3: ["보조장비", "귀걸이", "마법석"]
        };

        const colgroup = [
            'compare-slot-col', 'compare-option-col', 'compare-value-col',
            'compare-diff-col', 'compare-option-col', 'compare-value-col'
        ];

        const optionLabel = isSeal1 ? '고유 옵션' : '일반 옵션';
        const headers = [
            [
                { text: '' },
                { text: displayName1, colspan: 2 },
                { text: '비교값', className: 'compare-diff-col' },
                { text: displayName2, colspan: 2 }
            ],
            [
                { text: '슬롯' },
                { text: optionLabel },
                { text: '수치' },
                { text: '차이' },
                { text: optionLabel },
                { text: '수치' }
            ]
        ];

        const table = this.createTableStructure(colgroup, headers);
        const tbody = table.querySelector('tbody');

        const statType1 = section1.querySelector(`select[data-key="info_stat_type"]`)?.value || "";
        const eleType1 = section1.querySelector(`select[data-key="info_ele_type"]`)?.value || "";
        const statType2 = section2.querySelector(`select[data-key="info_stat_type"]`)?.value || "";
        const eleType2 = section2.querySelector(`select[data-key="info_ele_type"]`)?.value || "";

        let currentGroup = '';
        equipSlots.forEach(slot => {
            // 그룹 구분선
            for (const [groupName, groupArray] of Object.entries(groupSlots)) {
                if (groupArray[0] === slot && currentGroup !== groupName) {
                    if (currentGroup !== '') {
                        tbody.appendChild(CompareRow.createDividerRow(6));
                    }
                    currentGroup = groupName;
                    break;
                }
            }

            const data1 = getSlotData(section1, slot);
            const data2 = getSlotData(section2, slot);

            const sealKey = isSeal1 ? 'seal1' : 'seal2';
            const sealValKey = isSeal1 ? 'seal1_val' : 'seal2_val';

            let sealDiff = '-';
            if (data1[sealKey] === data2[sealKey] && data1[sealKey] !== '') {
                sealDiff = calculateNumDiff(data1[sealValKey], data2[sealValKey]);
            } else if (data1[sealKey] !== data2[sealKey] && (data1[sealKey] !== '' || data2[sealKey] !== '')) {
                sealDiff = isSeal1 ? '고유옵션 값이 다름' : '일반옵션 값이 다름';
            }

            const row = CompareRow.createSealRow(slot, data1, data2, sealDiff, statType1, eleType1, statType2, eleType2, isSeal1);
            tbody.appendChild(row);
        });

        return table;
    },

    /**
     * 엠블렘 비교 테이블 생성
     */
    createEmblemTable(section1, section2, displayName1, displayName2) {
        const emblemSlots = ["무기", "상의", "어깨", "하의", "신발", "벨트", "목걸이", "팔찌", "반지", "보조장비", "귀걸이", "마법석", "칭호"];
        const selectEmblemSlots = ["보조장비", "귀걸이", "마법석", "칭호"];
        const groupSlots = {
            group1: ["무기", "상의", "어깨", "하의", "신발", "벨트"],
            group2: ["목걸이", "팔찌", "반지"],
            group3: ["보조장비", "귀걸이", "마법석"],
            group4: ["칭호"]
        };

        const colgroup = [
            'compare-slot-col', 'compare-option-col', 'compare-option-col',
            'compare-diff-col', 'compare-option-col', 'compare-option-col'
        ];

        const headers = [
            [
                { text: '' },
                { text: displayName1, colspan: 2 },
                { text: '비교값', className: 'compare-diff-col' },
                { text: displayName2, colspan: 2 }
            ],
            [
                { text: '슬롯' },
                { text: '엠블렘1' },
                { text: '엠블렘2' },
                { text: '차이' },
                { text: '엠블렘1' },
                { text: '엠블렘2' }
            ]
        ];

        const table = this.createTableStructure(colgroup, headers);
        const tbody = table.querySelector('tbody');

        const eleType1 = section1.querySelector(`select[data-key="info_ele_type"]`)?.value || "";
        const eleType2 = section2.querySelector(`select[data-key="info_ele_type"]`)?.value || "";

        let currentGroup = '';
        emblemSlots.forEach(slot => {
            // 그룹 구분선
            for (const [groupName, groupArray] of Object.entries(groupSlots)) {
                if (groupArray[0] === slot && currentGroup !== groupName) {
                    if (currentGroup !== '') {
                        tbody.appendChild(CompareRow.createDividerRow(6));
                    }
                    currentGroup = groupName;
                    break;
                }
            }

            const data1 = getSlotData(section1, slot);
            const data2 = getSlotData(section2, slot);

            let embDiff = '-';

            if (selectEmblemSlots.includes(slot)) {
                if (data1.emb1 === data2.emb1 && data1.emb1 !== '') {
                    embDiff = calculateNumDiff(extractNumber(data1.emb2), extractNumber(data2.emb2));
                } else if (data1.emb1 !== data2.emb1 && (data1.emb1 !== '' || data2.emb1 !== '')) {
                    embDiff = '값이 다름';
                }
            } else {
                const emb1Diff = calculateNumDiff(extractNumber(data1.emb1), extractNumber(data2.emb1));
                const emb2Diff = calculateNumDiff(extractNumber(data1.emb2), extractNumber(data2.emb2));
                embDiff = `${emb1Diff} / ${emb2Diff}`;
            }

            const row = CompareRow.createEmblemRow(slot, data1, data2, embDiff, eleType1, eleType2);
            tbody.appendChild(row);
        });

        return table;
    },

    /**
     * 마법부여 비교 테이블 생성
     */
    createEnchantTable(section1, section2, displayName1, displayName2) {
        const enchantSlots = ["무기", "상의", "어깨", "하의", "신발", "벨트", "목걸이", "팔찌", "반지", "보조장비", "귀걸이", "마법석", "칭호"];
        const groupSlots = {
            group1: ["무기", "상의", "어깨", "하의", "신발", "벨트"],
            group2: ["목걸이", "팔찌", "반지"],
            group3: ["보조장비", "귀걸이", "마법석"],
            group4: ["칭호"]
        };

        const colgroup = [
            'compare-slot-col', 'compare-option-col', 'compare-value-col',
            'compare-diff-col', 'compare-option-col', 'compare-value-col'
        ];

        const headers = [
            [
                { text: '' },
                { text: displayName1, colspan: 2 },
                { text: '비교값', className: 'compare-diff-col' },
                { text: displayName2, colspan: 2 }
            ],
            [
                { text: '슬롯' },
                { text: '마법부여' },
                { text: '수치' },
                { text: '차이' },
                { text: '마법부여' },
                { text: '수치' }
            ]
        ];

        const table = this.createTableStructure(colgroup, headers);
        const tbody = table.querySelector('tbody');

        let currentGroup = '';
        enchantSlots.forEach(slot => {
            // 그룹 구분선
            for (const [groupName, groupArray] of Object.entries(groupSlots)) {
                if (groupArray[0] === slot && currentGroup !== groupName) {
                    if (currentGroup !== '') {
                        tbody.appendChild(CompareRow.createDividerRow(6));
                    }
                    currentGroup = groupName;
                    break;
                }
            }

            const data1 = getSlotData(section1, slot);
            const data2 = getSlotData(section2, slot);

            let enchantDiff = '-';
            if (data1.enchant === data2.enchant && data1.enchant !== '') {
                enchantDiff = calculateNumDiff(data1.enchant_val, data2.enchant_val);
            } else if (data1.enchant !== data2.enchant && (data1.enchant !== '' || data2.enchant !== '')) {
                enchantDiff = '값이 다름';
            }

            const row = CompareRow.createEnchantRow(slot, data1, data2, enchantDiff);
            tbody.appendChild(row);
        });

        return table;
    }
};

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

    document.getElementById('btnBasicMode').classList.add('active');
    document.getElementById('btnCompareMode').classList.remove('active');

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

    document.getElementById('btnBasicMode').classList.remove('active');
    document.getElementById('btnCompareMode').classList.add('active');

    const selectLeft = document.getElementById('compareCharacterSelectLeft');
    const selectRight = document.getElementById('compareCharacterSelectRight');
    selectLeft.innerHTML = '<option value="">캐릭터 선택...</option>';
    selectRight.innerHTML = '<option value="">캐릭터 선택...</option>';
    AppState.compareSelection = { left: null, right: null };

    sections.forEach(section => {
        const charId = section.id;
        const jobEl = section.querySelector('[data-key="info_job"]');
        const nameEl = section.querySelector('[data-key="info_name"]');
        const job = jobEl ? jobEl.value : '미정';
        const name = nameEl ? nameEl.value : '이름없음';
        const displayName = `${job}(${name})`;

        const optionLeft = document.createElement('option');
        optionLeft.value = charId;
        optionLeft.textContent = displayName;
        selectLeft.appendChild(optionLeft);

        const optionRight = document.createElement('option');
        optionRight.value = charId;
        optionRight.textContent = displayName;
        selectRight.appendChild(optionRight);
    });

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

    // 장비 비교
    const titleEquip = document.createElement('div');
    titleEquip.className = 'compare-section-title';
    titleEquip.textContent = '*장비 비교*';
    container.appendChild(titleEquip);
    container.appendChild(CompareTable.createEquipmentTable(section1, section2, displayName1, displayName2));

    // 마법봉인 비교
    const titleSeal = document.createElement('div');
    titleSeal.className = 'compare-section-title';
    titleSeal.textContent = '*마법봉인 비교*';
    container.appendChild(titleSeal);
    container.appendChild(CompareTable.createSealTable(section1, section2, displayName1, displayName2, true));
    container.appendChild(CompareTable.createSealTable(section1, section2, displayName1, displayName2, false));

    // 엠블렘 비교
    const titleEmb = document.createElement('div');
    titleEmb.className = 'compare-section-title';
    titleEmb.textContent = '*엠블렘 비교*';
    container.appendChild(titleEmb);
    container.appendChild(CompareTable.createEmblemTable(section1, section2, displayName1, displayName2));

    // 마법부여 비교
    const titleEnchant = document.createElement('div');
    titleEnchant.className = 'compare-section-title';
    titleEnchant.textContent = '*마법부여 비교*';
    container.appendChild(titleEnchant);
    container.appendChild(CompareTable.createEnchantTable(section1, section2, displayName1, displayName2));
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
// 레거시 함수 (호환성 유지)
// ============================================

/**
 * @deprecated CompareTable.createEquipmentTable() 사용 권장
 */
function generateEquipmentComparisonTable(section1, section2, displayName1, displayName2) {
    const table = CompareTable.createEquipmentTable(section1, section2, displayName1, displayName2);
    const wrapper = document.createElement('div');
    wrapper.appendChild(table);
    return wrapper.innerHTML;
}

/**
 * @deprecated CompareTable.createSealTable() 사용 권장
 */
function generateSealComparisonTable(section1, section2, displayName1, displayName2) {
    const table1 = CompareTable.createSealTable(section1, section2, displayName1, displayName2, true);
    const table2 = CompareTable.createSealTable(section1, section2, displayName1, displayName2, false);
    const wrapper = document.createElement('div');
    wrapper.appendChild(table1);
    wrapper.appendChild(table2);
    return wrapper.innerHTML;
}

/**
 * @deprecated CompareTable.createEmblemTable() 사용 권장
 */
function generateEmblemComparisonTable(section1, section2, displayName1, displayName2) {
    const table = CompareTable.createEmblemTable(section1, section2, displayName1, displayName2);
    const wrapper = document.createElement('div');
    wrapper.appendChild(table);
    return wrapper.innerHTML;
}

/**
 * @deprecated CompareTable.createEnchantTable() 사용 권장
 */
function generateEnchantComparisonTable(section1, section2, displayName1, displayName2) {
    const table = CompareTable.createEnchantTable(section1, section2, displayName1, displayName2);
    const wrapper = document.createElement('div');
    wrapper.appendChild(table);
    return wrapper.innerHTML;
}