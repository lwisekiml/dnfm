// ============================================
// ui-search.js - 검색 모드 기능
// ============================================

/**
 * 검색 모드 진입
 */
function enterSearchMode() {
    const sections = document.querySelectorAll('.char-section');
    if (sections.length === 0) {
        alert("검색할 캐릭터가 없습니다.");
        return;
    }

    // 화면 전환
    document.getElementById('characterContainer').style.display = 'none';
    document.getElementById('compareCharSelectionContainer').style.display = 'none';
    document.getElementById('compareContainer').style.display = 'none';
    document.getElementById('searchContainer').style.display = 'block';

    // 버튼 상태 업데이트
    document.getElementById('btnBasicMode').classList.remove('active');
    document.getElementById('btnCompareMode').classList.remove('active');
    document.getElementById('btnSearchMode').classList.add('active');

    // 슬롯 선택 초기화
    const slotSelect = document.getElementById('searchSlotSelect');

    // 기본 option (disabled + selected)
    let optionsHTML = '<option value="" disabled selected>▼ 슬롯 선택...</option>';

    // 각 슬롯 옵션 추가
    AppConstants.SLOTS.forEach(slot => {
        optionsHTML += `<option value="${slot}">${slot}</option>`;
    });

    slotSelect.innerHTML = optionsHTML;

    // 검색 결과 초기화
    document.getElementById('searchResultContent').innerHTML =
        '<div style="text-align: center; padding: 40px; color: #888; font-size: 18px;">슬롯을 선택하여 검색하세요.</div>';

    // 이벤트 리스너 등록
    slotSelect.onchange = performSearch;
}

/**
 * 검색 수행
 */
function performSearch() {
    const selectedSlot = document.getElementById('searchSlotSelect').value;

    if (!selectedSlot) {
        document.getElementById('searchResultContent').innerHTML =
            '<div style="text-align: center; padding: 40px; color: #888;">슬롯을 선택하여 검색하세요.</div>';
        return;
    }

    const sections = document.querySelectorAll('.char-section');
    const searchResults = [];

    // 모든 캐릭터에서 해당 슬롯 데이터 수집
    sections.forEach(section => {
        const charId = section.id;
        const job = section.querySelector('[data-key="info_job"]')?.value || '미정';
        const name = section.querySelector('[data-key="info_name"]')?.value || '이름없음';
        const statType = section.querySelector('[data-key="info_stat_type"]')?.value || '';
        const eleType = section.querySelector('[data-key="info_ele_type"]')?.value || '';

        const slotData = getSlotDataForSearch(section, selectedSlot);

        searchResults.push({
            charId,
            job,
            name,
            statType,
            eleType,
            ...slotData
        });
    });

    // 검색 결과 테이블 생성
    displaySearchResults(selectedSlot, searchResults);
}

/**
 * 슬롯 데이터 가져오기 (검색용)
 */
function getSlotDataForSearch(section, slot) {
    // 스킬룬, 크리쳐는 특수 처리
    if (slot === "스킬룬") {
        const charId = section.id;
        const runeData = AppState.charRuneData[charId];
        const activeRunes = runeData?.runes?.filter(r => r.name !== '') || [];
        return {
            isSpecial: true,
            specialType: 'rune',
            runeCount: activeRunes.length,
            runeData: runeData
        };
    }

    if (slot === "크리쳐") {
        return {
            isSpecial: true,
            specialType: 'creature',
            rarity: section.querySelector(`select[data-key="${slot}_rarity"]`)?.value || '',
            name: section.querySelector(`input[data-key="${slot}_name"]`)?.value || ''
        };
    }

    // 일반 슬롯
    return {
        isSpecial: false,
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
        enchant_val: section.querySelector(`input[data-key="${slot}_enchant_val"]`)?.value || '',
        desc: section.querySelector(`[data-key="${slot}_desc"]`)?.value || ''
    };
}

/**
 * 검색 결과 표시
 */
function displaySearchResults(slot, results) {
    const container = document.getElementById('searchResultContent');

    // 특수 슬롯 처리
    if (slot === "스킬룬") {
        container.innerHTML = createRuneSearchTable(results);
        return;
    }

    if (slot === "크리쳐") {
        container.innerHTML = createCreatureSearchTable(results);
        return;
    }

    // 일반 슬롯 테이블 생성
    const table = document.createElement('table');
    table.className = 'compare-table search-result-table search-table-custom';
    table.style.width = 'auto';
    table.style.fontWeight = '900';

    // 모든 셀에 직접 스타일 적용
    const style = document.createElement('style');
    style.textContent = `
        .search-table-custom,
        .search-table-custom th,
        .search-table-custom td {
            font-size: 14px !important;
        }
    `;
    document.head.appendChild(style);

    // colgroup - 모든 컬럼 자동 너비
    const colgroup = document.createElement('colgroup');
    const colClasses = [
        'compare-slot-col',  // 직업/이름
        'compare-attr-col',
        'compare-attr-col',
        'compare-attr-col',
        'compare-item-col',
        'compare-reinforce-col',
        'compare-option-col',
        'compare-value-col',
        'compare-option-col',
        'compare-value-col',
        'compare-option-col',
        'compare-option-col',
        'compare-option-col',
        'compare-value-col'
    ];

    colClasses.forEach((cls) => {
        const col = document.createElement('col');
        col.className = cls;
        col.style.width = 'auto';
        colgroup.appendChild(col);
    });
    table.appendChild(colgroup);

    // thead
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th rowspan="2">직업/이름</th>
            <th colspan="5">기본 정보</th>
            <th colspan="4">마법봉인</th>
            <th colspan="2">엠블렘</th>
            <th colspan="2">마법부여</th>
        </tr>
        <tr>
            <th>희귀도</th>
            <th>익시드</th>
            <th>접두어</th>
            <th>아이템명</th>
            <th>강화</th>
            <th>고유옵션</th>
            <th>수치</th>
            <th>일반옵션</th>
            <th>수치</th>
            <th>엠블렘1</th>
            <th>엠블렘2</th>
            <th>마법부여</th>
            <th>수치</th>
        </tr>
    `;
    table.appendChild(thead);

    // tbody
    const tbody = document.createElement('tbody');
    results.forEach(result => {
        const tr = createSearchResultRow(slot, result);
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    container.innerHTML = '';
    container.appendChild(table);
}

/**
 * 검색 결과 행 생성
 */
function createSearchResultRow(slot, result) {
    const tr = document.createElement('tr');

    // 희귀도 클래스
    const rarityClass = result.rarity ? `rare-${result.rarity}` : '';
    const exceedClass = result.exceed ? `ex-${result.exceed}` : '';

    // 접두어 클래스
    let prefixClass = '';
    if (result.prefix) {
        if (result.prefix.startsWith('T')) {
            prefixClass = 'prefix-tier';
        } else {
            prefixClass = 'prefix-selected';
            if (slot === "무기") {
                if (result.prefix === "광채") prefixClass += ' p-blue';
                else if (result.prefix === "분쇄") prefixClass += ' p-red';
                else if (result.prefix === "선명") prefixClass += ' p-green';
                else if (result.prefix === "강타") prefixClass += ' p-yellow';
            }
        }
    }

    // 봉인 하이라이트
    const seal1Class = getSealHighlight(slot, result.seal1, result.statType, result.eleType, true);
    const seal2Class = getSealHighlight(slot, result.seal2, result.statType, result.eleType, false);

    // 엠블렘 하이라이트
    const embClass = getEmblemHighlight(slot, result.emb1, result.eleType);

    tr.innerHTML = `
        <td style="white-space: nowrap;">${result.job}(${result.name})</td>
        <td class="${rarityClass}">${result.rarity}</td>
        <td class="${exceedClass}">${result.exceed}</td>
        <td class="${prefixClass}">${result.prefix}</td>
        <td>${result.itemname}</td>
        <td>${result.reinforce}</td>
        <td class="${seal1Class}">${result.seal1}</td>
        <td class="${seal1Class}">${result.seal1_val}</td>
        <td class="${seal2Class}">${result.seal2}</td>
        <td class="${seal2Class}">${result.seal2_val}</td>
        <td class="${embClass}">${result.emb1}</td>
        <td class="${embClass}">${result.emb2}</td>
        <td>${result.enchant}</td>
        <td>${result.enchant_val}</td>
    `;

    return tr;
}

/**
 * 봉인 하이라이트 클래스 반환
 */
function getSealHighlight(slot, sealValue, statType, eleType, isSeal1) {
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
}

/**
 * 엠블렘 하이라이트 클래스 반환
 */
function getEmblemHighlight(slot, embValue, eleType) {
    const embHighlightSlots = ["보조장비", "귀걸이", "마법석", "칭호"];
    if (embHighlightSlots.includes(slot) && (embValue === eleType || embValue === "모속강")) {
        return 'highlight-yellow';
    }
    return '';
}

/**
 * 스킬룬 검색 테이블 생성
 */
function createRuneSearchTable(results) {
    let html = `
        <table class="compare-table search-result-table search-table-custom" style="width: auto; font-weight: 900;">
            <colgroup>
                <col style="width: auto;">
                <col style="width: auto;">
                <col style="width: auto;">
            </colgroup>
            <thead>
                <tr>
                    <th>직업/이름</th>
                    <th>설정된 룬 개수</th>
                    <th>룬 상세</th>
                </tr>
            </thead>
            <tbody>
    `;

    results.forEach(result => {
        const runeData = result.runeData;
        const activeRunes = runeData?.runes?.filter(r => r.name !== '') || [];

        let runeDetail = '-';
        if (activeRunes.length > 0) {
            const runeMap = new Map();
            activeRunes.forEach(r => {
                const effectiveSkillLv = AppConstants.NO_SKILL_LV_RUNES.includes(r.name) ? "" : r.skillLv;
                const key = `${r.name}|${r.lv}|${effectiveSkillLv}`;
                if (runeMap.has(key)) {
                    runeMap.get(key).count += 1;
                } else {
                    runeMap.set(key, {...r, count: 1});
                }
            });

            const summaryArray = [];
            runeMap.forEach((val) => {
                const skillLv = (AppConstants.NO_SKILL_LV_RUNES.includes(val.name) || !val.skillLv) ? "" : `[${val.skillLv}]`;
                summaryArray.push(`${val.name}${val.lv}${skillLv} ${val.count}개`);
            });
            runeDetail = summaryArray.join(' | ');
        }

        html += `
            <tr>
                <td style="white-space: nowrap;">${result.job}(${result.name})</td>
                <td>${activeRunes.length}개</td>
                <td style="text-align: left; padding-left: 12px;">${runeDetail}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    return html;
}

/**
 * 크리쳐 검색 테이블 생성
 */
function createCreatureSearchTable(results) {
    let html = `
        <table class="compare-table search-result-table search-table-custom" style="width: auto; font-weight: 900;">
            <colgroup>
                <col style="width: auto;">
                <col style="width: auto;">
                <col style="width: auto;">
            </colgroup>
            <thead>
                <tr>
                    <th>직업/이름</th>
                    <th>희귀도</th>
                    <th>크리쳐 이름</th>
                </tr>
            </thead>
            <tbody>
    `;

    results.forEach(result => {
        const rarityClass = result.rarity ? `rare-${result.rarity}` : '';

        html += `
            <tr>
                <td style="white-space: nowrap;">${result.job}(${result.name})</td>
                <td class="${rarityClass}">${result.rarity}</td>
                <td>${result.name || '-'}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    return html;
}

console.log("✅ ui-search.js 로드 완료");