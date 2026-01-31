// ============================================
// ui-compare.js - 비교 모드 기능
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
 * 비교 결과 표시
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

    let html = '';

    html += `<div class="compare-section-title">*장비 비교*</div>`;
    html += generateEquipmentComparisonTable(section1, section2, displayName1, displayName2);

    html += `<div class="compare-section-title">*마법봉인 비교*</div>`;
    html += generateSealComparisonTable(section1, section2, displayName1, displayName2);

    html += `<div class="compare-section-title">*엠블렘 비교*</div>`;
    html += generateEmblemComparisonTable(section1, section2, displayName1, displayName2);

    html += `<div class="compare-section-title">*마법부여 비교*</div>`;
    html += generateEnchantComparisonTable(section1, section2, displayName1, displayName2);

    document.getElementById('compareContent').innerHTML = html;
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

/**
 * 장비 비교 테이블 생성
 */
function generateEquipmentComparisonTable(section1, section2, displayName1, displayName2) {
    const equipSlots = ["무기", "상의", "어깨", "하의", "신발", "벨트", "목걸이", "팔찌", "반지", "보조장비", "귀걸이", "마법석", "칭호", "외형칭호", "오라", "아바타"];
    const groupSlots = {
        group1: ["무기", "상의", "어깨", "하의", "신발", "벨트"],
        group2: ["목걸이", "팔찌", "반지"],
        group3: ["보조장비", "귀걸이", "마법석"],
        group4: ["칭호", "외형칭호", "오라", "아바타"]
    };

    let html = `<table class="compare-table">
        <colgroup>
            <col class="compare-slot-col">
            <col class="compare-attr-col">
            <col class="compare-attr-col">
            <col class="compare-attr-col">
            <col class="compare-item-col">
            <col class="compare-reinforce-col">
            <col class="compare-diff-col">
            <col class="compare-reinforce-col">
            <col class="compare-item-col">
            <col class="compare-attr-col">
            <col class="compare-attr-col">
            <col class="compare-attr-col">
        </colgroup>
        <thead>
            <tr>
                <th></th>
                <th colspan="5">${displayName1}</th>
                <th class="compare-diff-col">비교값</th>
                <th colspan="5">${displayName2}</th>
            </tr>
            <tr>
                <th>슬롯</th>
                <th>희귀도</th>
                <th>익시드</th>
                <th>접두어</th>
                <th>아이템이름</th>
                <th>강화</th>
                <th>차이</th>
                <th>강화</th>
                <th>아이템이름</th>
                <th>접두어</th>
                <th>익시드</th>
                <th>희귀도</th>
            </tr>
        </thead>
        <tbody>`;

    let currentGroup = '';
    equipSlots.forEach((slot) => {
        for (const [groupName, groupArray] of Object.entries(groupSlots)) {
            if (groupArray[0] === slot && currentGroup !== groupName) {
                if (currentGroup !== '') {
                    html += `<tr class="compare-divider-row"><td colspan="12"></td></tr>`;
                }
                currentGroup = groupName;
                break;
            }
        }

        const data1 = getSlotData(section1, slot);
        const data2 = getSlotData(section2, slot);
        const reinforceDiff = calculateReinforceDiff(slot, data1.reinforce, data2.reinforce);

        const rarityClass1 = data1.rarity ? `rare-${data1.rarity}` : '';
        const rarityClass2 = data2.rarity ? `rare-${data2.rarity}` : '';
        const exceedClass1 = data1.exceed ? `ex-${data1.exceed}` : '';
        const exceedClass2 = data2.exceed ? `ex-${data2.exceed}` : '';

        let prefixClass1 = '';
        let prefixClass2 = '';

        if (data1.prefix) {
            if (data1.prefix.startsWith('T')) {
                prefixClass1 = 'prefix-tier';
            } else if (data1.prefix !== '') {
                prefixClass1 = 'prefix-selected';
                if (slot === "무기") {
                    if (data1.prefix === "광채") prefixClass1 += ' p-blue';
                    else if (data1.prefix === "분쇄") prefixClass1 += ' p-red';
                    else if (data1.prefix === "선명") prefixClass1 += ' p-green';
                    else if (data1.prefix === "강타") prefixClass1 += ' p-yellow';
                }
            }
        }

        if (data2.prefix) {
            if (data2.prefix.startsWith('T')) {
                prefixClass2 = 'prefix-tier';
            } else if (data2.prefix !== '') {
                prefixClass2 = 'prefix-selected';
                if (slot === "무기") {
                    if (data2.prefix === "광채") prefixClass2 += ' p-blue';
                    else if (data2.prefix === "분쇄") prefixClass2 += ' p-red';
                    else if (data2.prefix === "선명") prefixClass2 += ' p-green';
                    else if (data2.prefix === "강타") prefixClass2 += ' p-yellow';
                }
            }
        }

        html += `<tr>
            <td class="compare-slot-name">${slot}</td>
            <td class="${rarityClass1}">${data1.rarity}</td>
            <td class="${exceedClass1}">${data1.exceed}</td>
            <td class="${prefixClass1}">${data1.prefix}</td>
            <td>${data1.itemname}</td>
            <td>${data1.reinforce}</td>
            <td class="compare-diff ${reinforceDiff === '' || reinforceDiff === '-' ? 'same' : reinforceDiff.includes('+') ? 'positive' : 'negative'}">${reinforceDiff}</td>
            <td>${data2.reinforce}</td>
            <td>${data2.itemname}</td>
            <td class="${prefixClass2}">${data2.prefix}</td>
            <td class="${exceedClass2}">${data2.exceed}</td>
            <td class="${rarityClass2}">${data2.rarity}</td>
        </tr>`;
    });

    html += `</tbody></table>`;
    return html;
}

/**
 * 봉인 비교 테이블 생성
 */
function generateSealComparisonTable(section1, section2, displayName1, displayName2) {
    const equipSlots = ["무기", "상의", "어깨", "하의", "신발", "벨트", "목걸이", "팔찌", "반지", "보조장비", "귀걸이", "마법석"];
    const groupSlots = {
        group1: ["무기", "상의", "어깨", "하의", "신발", "벨트"],
        group2: ["목걸이", "팔찌", "반지"],
        group3: ["보조장비", "귀걸이", "마법석"]
    };

    const armorSlots = ["상의", "어깨", "하의", "신발", "벨트"];
    const accSlots = ["목걸이", "팔찌", "반지"];
    const specialSlots = ["보조장비", "귀걸이", "마법석"];

    // 고유 옵션 테이블
    let html = `<table class="compare-table">
        <colgroup>
            <col class="compare-slot-col">
            <col class="compare-option-col">
            <col class="compare-value-col">
            <col class="compare-diff-col">
            <col class="compare-option-col">
            <col class="compare-value-col">
        </colgroup>
        <thead>
            <tr>
                <th></th>
                <th colspan="2">${displayName1}</th>
                <th class="compare-diff-col">비교값</th>
                <th colspan="2">${displayName2}</th>
            </tr>
            <tr>
                <th>슬롯</th>
                <th>고유 옵션</th>
                <th>수치</th>
                <th>차이</th>
                <th>고유 옵션</th>
                <th>수치</th>
            </tr>
        </thead>
        <tbody>`;

    let currentGroup = '';
    equipSlots.forEach((slot) => {
        for (const [groupName, groupArray] of Object.entries(groupSlots)) {
            if (groupArray[0] === slot && currentGroup !== groupName) {
                if (currentGroup !== '') {
                    html += `<tr class="compare-divider-row"><td colspan="6"></td></tr>`;
                }
                currentGroup = groupName;
                break;
            }
        }

        const data1 = getSlotData(section1, slot);
        const data2 = getSlotData(section2, slot);

        const statType1 = section1.querySelector(`select[data-key="info_stat_type"]`)?.value || "";
        const eleType1 = section1.querySelector(`select[data-key="info_ele_type"]`)?.value || "";
        const statType2 = section2.querySelector(`select[data-key="info_stat_type"]`)?.value || "";
        const eleType2 = section2.querySelector(`select[data-key="info_ele_type"]`)?.value || "";

        let seal1Class1 = '';
        let seal1Class2 = '';

        if (slot === "무기" && data1.seal1 === "데미지 증가") {
            seal1Class1 = 'highlight-yellow';
        } else if ((armorSlots.includes(slot) || specialSlots.includes(slot)) && data1.seal1 === statType1) {
            seal1Class1 = 'highlight-yellow';
        } else if (accSlots.includes(slot) && data1.seal1 === eleType1) {
            seal1Class1 = 'highlight-yellow';
        }

        if (slot === "무기" && data2.seal1 === "데미지 증가") {
            seal1Class2 = 'highlight-yellow';
        } else if ((armorSlots.includes(slot) || specialSlots.includes(slot)) && data2.seal1 === statType2) {
            seal1Class2 = 'highlight-yellow';
        } else if (accSlots.includes(slot) && data2.seal1 === eleType2) {
            seal1Class2 = 'highlight-yellow';
        }

        let seal1Diff = '-';
        if (data1.seal1 === data2.seal1 && data1.seal1 !== '') {
            seal1Diff = calculateNumDiff(data1.seal1_val, data2.seal1_val);
        } else if (data1.seal1 !== data2.seal1 && (data1.seal1 !== '' || data2.seal1 !== '')) {
            seal1Diff = '고유옵션 값이 다름';
        }

        html += `<tr>
            <td class="compare-slot-name">${slot}</td>
            <td class="${seal1Class1}">${data1.seal1}</td>
            <td class="${seal1Class1}">${data1.seal1_val}</td>
            <td class="compare-diff ${seal1Diff === '-' ? 'same' : seal1Diff.includes('+') ? 'positive' : 'negative'}">${seal1Diff}</td>
            <td class="${seal1Class2}">${data2.seal1}</td>
            <td class="${seal1Class2}">${data2.seal1_val}</td>
        </tr>`;
    });

    html += `</tbody></table>`;

    // 일반 옵션 테이블
    html += `<table class="compare-table">
        <colgroup>
            <col class="compare-slot-col">
            <col class="compare-option-col">
            <col class="compare-value-col">
            <col class="compare-diff-col">
            <col class="compare-option-col">
            <col class="compare-value-col">
        </colgroup>
        <thead>
            <tr>
                <th></th>
                <th colspan="2">${displayName1}</th>
                <th class="compare-diff-col">비교값</th>
                <th colspan="2">${displayName2}</th>
            </tr>
            <tr>
                <th>슬롯</th>
                <th>일반 옵션</th>
                <th>수치</th>
                <th>차이</th>
                <th>일반 옵션</th>
                <th>수치</th>
            </tr>
        </thead>
        <tbody>`;

    currentGroup = '';
    equipSlots.forEach((slot) => {
        for (const [groupName, groupArray] of Object.entries(groupSlots)) {
            if (groupArray[0] === slot && currentGroup !== groupName) {
                if (currentGroup !== '') {
                    html += `<tr class="compare-divider-row"><td colspan="6"></td></tr>`;
                }
                currentGroup = groupName;
                break;
            }
        }

        const data1 = getSlotData(section1, slot);
        const data2 = getSlotData(section2, slot);

        const statType1 = section1.querySelector(`select[data-key="info_stat_type"]`)?.value || "";
        const eleType1 = section1.querySelector(`select[data-key="info_ele_type"]`)?.value || "";
        const statType2 = section2.querySelector(`select[data-key="info_stat_type"]`)?.value || "";
        const eleType2 = section2.querySelector(`select[data-key="info_ele_type"]`)?.value || "";

        let seal2Class1 = '';
        let seal2Class2 = '';

        if ((armorSlots.includes(slot) || slot === "무기" || specialSlots.includes(slot)) && data1.seal2 === statType1) {
            seal2Class1 = 'highlight-yellow';
        } else if (accSlots.includes(slot) && data1.seal2 === eleType1) {
            seal2Class1 = 'highlight-yellow';
        }

        if ((armorSlots.includes(slot) || slot === "무기" || specialSlots.includes(slot)) && data2.seal2 === statType2) {
            seal2Class2 = 'highlight-yellow';
        } else if (accSlots.includes(slot) && data2.seal2 === eleType2) {
            seal2Class2 = 'highlight-yellow';
        }

        // 일반 옵션 테이블 tbody 부분에서
        let seal2Diff = '-';
        let seal2DiffClass = 'same';

        if (data1.seal2 === data2.seal2 && data1.seal2 !== '') {
            seal2Diff = calculateNumDiff(data1.seal2_val, data2.seal2_val);
            if (seal2Diff !== '-') {
                seal2DiffClass = seal2Diff.includes('+') ? 'positive' : 'negative';
            }
        } else if (data1.seal2 !== data2.seal2 && (data1.seal2 !== '' || data2.seal2 !== '')) {
            seal2Diff = '일반옵션 값이 다름';
            seal2DiffClass = 'negative';
        }

        html += `<tr>
    <td class="compare-slot-name">${slot}</td>
    <td class="${seal2Class1}">${data1.seal2}</td>
    <td class="${seal2Class1}">${data1.seal2_val}</td>
    <td class="compare-diff ${seal2DiffClass}">${seal2Diff}</td>
    <td class="${seal2Class2}">${data2.seal2}</td>
    <td class="${seal2Class2}">${data2.seal2_val}</td>
</tr>`;
    });

    html += `</tbody></table>`;
    return html;
}

/**
 * 엠블렘 비교 테이블 생성
 */
function generateEmblemComparisonTable(section1, section2, displayName1, displayName2) {
    const emblemSlots = ["무기", "상의", "어깨", "하의", "신발", "벨트", "목걸이", "팔찌", "반지", "보조장비", "귀걸이", "마법석", "칭호"];
    const selectEmblemSlots = ["보조장비", "귀걸이", "마법석", "칭호"];
    const groupSlots = {
        group1: ["무기", "상의", "어깨", "하의", "신발", "벨트"],
        group2: ["목걸이", "팔찌", "반지"],
        group3: ["보조장비", "귀걸이", "마법석"],
        group4: ["칭호"]
    };

    const embHighlightSlots = ["보조장비", "귀걸이", "마법석", "칭호"];

    let html = `<table class="compare-table">
        <colgroup>
            <col class="compare-slot-col">
            <col class="compare-option-col">
            <col class="compare-option-col">
            <col class="compare-diff-col">
            <col class="compare-option-col">
            <col class="compare-option-col">
        </colgroup>
        <thead>
            <tr>
                <th></th>
                <th colspan="2">${displayName1}</th>
                <th class="compare-diff-col">비교값</th>
                <th colspan="2">${displayName2}</th>
            </tr>
            <tr>
                <th>슬롯</th>
                <th>엠블렘1</th>
                <th>엠블렘2</th>
                <th>차이</th>
                <th>엠블렘1</th>
                <th>엠블렘2</th>
            </tr>
        </thead>
        <tbody>`;

    let currentGroup = '';
    emblemSlots.forEach((slot) => {
        for (const [groupName, groupArray] of Object.entries(groupSlots)) {
            if (groupArray[0] === slot && currentGroup !== groupName) {
                if (currentGroup !== '') {
                    html += `<tr class="compare-divider-row"><td colspan="6"></td></tr>`;
                }
                currentGroup = groupName;
                break;
            }
        }

        const data1 = getSlotData(section1, slot);
        const data2 = getSlotData(section2, slot);

        const eleType1 = section1.querySelector(`select[data-key="info_ele_type"]`)?.value || "";
        const eleType2 = section2.querySelector(`select[data-key="info_ele_type"]`)?.value || "";

        let emb1Class1 = '';
        let emb1Class2 = '';

        if (embHighlightSlots.includes(slot) && (data1.emb1 === eleType1 || data1.emb1 === "모속강")) {
            emb1Class1 = 'highlight-yellow';
        }

        if (embHighlightSlots.includes(slot) && (data2.emb1 === eleType2 || data2.emb1 === "모속강")) {
            emb1Class2 = 'highlight-yellow';
        }

        let embDiff = '-';
        let embDiffClass = 'same';

        if (selectEmblemSlots.includes(slot)) {
            if (data1.emb1 === data2.emb1 && data1.emb1 !== '') {
                const emb2Diff = calculateNumDiff(extractNumber(data1.emb2), extractNumber(data2.emb2));
                embDiff = emb2Diff;
                if (emb2Diff !== '-') {
                    embDiffClass = emb2Diff.includes('+') ? 'positive' : 'negative';
                }
            } else if (data1.emb1 !== data2.emb1 && (data1.emb1 !== '' || data2.emb1 !== '')) {
                embDiff = '값이 다름';
                embDiffClass = 'negative';
            }
        } else {
            const emb1Diff = calculateNumDiff(extractNumber(data1.emb1), extractNumber(data2.emb1));
            const emb2Diff = calculateNumDiff(extractNumber(data1.emb2), extractNumber(data2.emb2));
            embDiff = `${emb1Diff} / ${emb2Diff}`;

            if (embDiff !== '- / -') {
                // 둘 중 하나라도 증가/감소가 있으면 색상 적용
                const hasPositive = emb1Diff.includes('+') || emb2Diff.includes('+');
                const hasNegative = (emb1Diff.includes('⬇') || emb2Diff.includes('⬇')) ||
                    (emb1Diff !== '-' && !emb1Diff.includes('+')) ||
                    (emb2Diff !== '-' && !emb2Diff.includes('+'));

                if (hasPositive && !hasNegative) {
                    embDiffClass = 'positive';
                } else if (hasNegative && !hasPositive) {
                    embDiffClass = 'negative';
                } else if (hasPositive && hasNegative) {
                    embDiffClass = ''; // 증가와 감소가 섞여있으면 기본 노란색
                }
            }
        }

        html += `<tr>
            <td class="compare-slot-name">${slot}</td>
            <td class="${emb1Class1}">${data1.emb1}</td>
            <td class="${emb1Class1}">${data1.emb2}</td>
            <td class="compare-diff ${embDiffClass}">${embDiff}</td>
            <td class="${emb1Class2}">${data2.emb1}</td>
            <td class="${emb1Class2}">${data2.emb2}</td>
        </tr>`;
    });

    html += `</tbody></table>`;
    return html;
}

/**
 * 마법부여 비교 테이블 생성
 */
function generateEnchantComparisonTable(section1, section2, displayName1, displayName2) {
    const enchantSlots = ["무기", "상의", "어깨", "하의", "신발", "벨트", "목걸이", "팔찌", "반지", "보조장비", "귀걸이", "마법석", "칭호"];
    const groupSlots = {
        group1: ["무기", "상의", "어깨", "하의", "신발", "벨트"],
        group2: ["목걸이", "팔찌", "반지"],
        group3: ["보조장비", "귀걸이", "마법석"],
        group4: ["칭호"]
    };

    let html = `<table class="compare-table">
        <colgroup>
            <col class="compare-slot-col">
            <col class="compare-option-col">
            <col class="compare-value-col">
            <col class="compare-diff-col">
            <col class="compare-option-col">
            <col class="compare-value-col">
        </colgroup>
        <thead>
            <tr>
                <th></th>
                <th colspan="2">${displayName1}</th>
                <th class="compare-diff-col">비교값</th>
                <th colspan="2">${displayName2}</th>
            </tr>
            <tr>
                <th>슬롯</th>
                <th>마법부여</th>
                <th>수치</th>
                <th>차이</th>
                <th>마법부여</th>
                <th>수치</th>
            </tr>
        </thead>
        <tbody>`;

    let currentGroup = '';
    enchantSlots.forEach((slot) => {
        for (const [groupName, groupArray] of Object.entries(groupSlots)) {
            if (groupArray[0] === slot && currentGroup !== groupName) {
                if (currentGroup !== '') {
                    html += `<tr class="compare-divider-row"><td colspan="6"></td></tr>`;
                }
                currentGroup = groupName;
                break;
            }
        }

        const data1 = getSlotData(section1, slot);
        const data2 = getSlotData(section2, slot);

        let enchantDiff = '-';
        let enchantDiffClass = 'same';

        if (data1.enchant === data2.enchant && data1.enchant !== '') {
            enchantDiff = calculateNumDiff(data1.enchant_val, data2.enchant_val);
            if (enchantDiff !== '-') {
                enchantDiffClass = enchantDiff.includes('+') ? 'positive' : 'negative';
            }
        } else if (data1.enchant !== data2.enchant && (data1.enchant !== '' || data2.enchant !== '')) {
            enchantDiff = '값이 다름';
            enchantDiffClass = 'negative';
        }

        html += `<tr>
            <td class="compare-slot-name">${slot}</td>
            <td>${data1.enchant}</td>
            <td>${data1.enchant_val}</td>
            <td class="compare-diff ${enchantDiffClass}">${enchantDiff}</td>
            <td>${data2.enchant}</td>
            <td>${data2.enchant_val}</td>
        </tr>`;
    });

    html += `</tbody></table>`;
    return html;
}