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

    // 각 슬롯 옵션 추가 (칭호/외형칭호 통합)
    AppConstants.SLOTS.forEach(slot => {
        // 칭호와 외형칭호를 하나로 통합
        if (slot === "칭호") {
            optionsHTML += `<option value="칭호/외형칭호">칭호/외형칭호</option>`;
        } else if (slot === "외형칭호") {
            // 이미 칭호에서 통합했으므로 스킵
            return;
        } else {
            optionsHTML += `<option value="${slot}">${slot}</option>`;
        }
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

    // 칭호/외형칭호 통합 처리
    if (selectedSlot === "칭호/외형칭호") {
        sections.forEach(section => {
            const charId = section.id;
            const job = section.querySelector('[data-key="info_job"]')?.value || '미정';
            const name = section.querySelector('[data-key="info_name"]')?.value || '이름없음';
            const statType = section.querySelector('[data-key="info_stat_type"]')?.value || '';
            const eleType = section.querySelector('[data-key="info_ele_type"]')?.value || '';

            // 칭호 데이터
            const titleData = getSlotDataForSearch(section, "칭호");
            searchResults.push({
                charId,
                job,
                name,
                statType,
                eleType,
                slotType: "칭호",
                ...titleData
            });

            // 외형칭호 데이터
            const appearTitleData = getSlotDataForSearch(section, "외형칭호");
            searchResults.push({
                charId,
                job,
                name,
                statType,
                eleType,
                slotType: "외형칭호",
                ...appearTitleData
            });
        });
    } else {
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
    }

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
            name: section.querySelector(`input[data-key="${slot}_name"]`)?.value || '',
            // 아티팩트 정보 수집 (Red, Blue, Green만)
            art_red_top_rarity: section.querySelector(`select[data-key="${slot}_art_red_top_rarity"]`)?.value || '',
            art_red_top_text: section.querySelector(`input[data-key="${slot}_art_red_top_text"]`)?.value || '',
            art_red_bg_1: section.querySelector(`select[data-key="${slot}_art_red_bg_1"]`)?.value || '',
            art_red_opt_1: section.querySelector(`select[data-key="${slot}_art_red_opt_1"]`)?.value || '',
            art_red_bg_2: section.querySelector(`select[data-key="${slot}_art_red_bg_2"]`)?.value || '',
            art_red_opt_2: section.querySelector(`select[data-key="${slot}_art_red_opt_2"]`)?.value || '',
            art_blue_top_rarity: section.querySelector(`select[data-key="${slot}_art_blue_top_rarity"]`)?.value || '',
            art_blue_top_text: section.querySelector(`input[data-key="${slot}_art_blue_top_text"]`)?.value || '',
            art_blue_bg_1: section.querySelector(`select[data-key="${slot}_art_blue_bg_1"]`)?.value || '',
            art_blue_opt_1: section.querySelector(`select[data-key="${slot}_art_blue_opt_1"]`)?.value || '',
            art_blue_bg_2: section.querySelector(`select[data-key="${slot}_art_blue_bg_2"]`)?.value || '',
            art_blue_opt_2: section.querySelector(`select[data-key="${slot}_art_blue_opt_2"]`)?.value || '',
            art_green_top_rarity: section.querySelector(`select[data-key="${slot}_art_green_top_rarity"]`)?.value || '',
            art_green_top_text: section.querySelector(`input[data-key="${slot}_art_green_top_text"]`)?.value || '',
            art_green_bg_1: section.querySelector(`select[data-key="${slot}_art_green_bg_1"]`)?.value || '',
            art_green_opt_1: section.querySelector(`select[data-key="${slot}_art_green_opt_1"]`)?.value || '',
            art_green_bg_2: section.querySelector(`select[data-key="${slot}_art_green_bg_2"]`)?.value || '',
            art_green_opt_2: section.querySelector(`select[data-key="${slot}_art_green_opt_2"]`)?.value || '',
            desc: section.querySelector(`[data-key="${slot}_desc"]`)?.value || ''
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

    // 칭호/외형칭호 통합 처리
    if (slot === "칭호/외형칭호") {
        createTitleSearchTable(container, results);
        return;
    }

    // 일반 슬롯 테이블 생성
    const table = document.createElement('table');
    table.className = 'compare-table search-result-table search-table-custom';
    table.style.tableLayout = 'auto';  // 내용에 맞춰 자동 조정
    table.style.width = 'auto';        // 테이블 전체 너비 자동
    table.style.fontWeight = '900';

    // CSS 변수 사용 (--fs-search)
    const style = document.createElement('style');
    style.textContent = `
        .search-table-custom,
        .search-table-custom th,
        .search-table-custom td {
            font-size: var(--fs-search) !important;
        }
    `;
    document.head.appendChild(style);

    // colgroup 제거 - 자동 너비 조정을 위해
    // 각 열이 내용에 맞춰 자동으로 크기 조정됨

    // thead
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th rowspan="2">직업/이름</th>
            <th colspan="5">기본 정보</th>
            <th colspan="4">마법봉인</th>
            <th colspan="2">엠블렘</th>
            <th colspan="2">마법부여</th>
            <th rowspan="2">설명</th>
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
        <td style="white-space: pre-wrap; text-align: left; padding: 4px 8px;">${result.desc || ''}</td>
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
 * 칭호/외형칭호 검색 테이블 생성
 */
function createTitleSearchTable(container, results) {
    const table = document.createElement('table');
    table.className = 'compare-table search-result-table search-table-custom';
    table.style.tableLayout = 'auto';
    table.style.width = 'auto';
    table.style.fontWeight = '900';

    const style = document.createElement('style');
    style.textContent = `
        .search-table-custom,
        .search-table-custom th,
        .search-table-custom td {
            font-size: var(--fs-search) !important;
        }
        /* ⭐ 슬롯 열 너비 조정 */
        .search-table-custom th:nth-child(2),
        .search-table-custom td:nth-child(2) {
            min-width: 80px;
        }
    `;
    document.head.appendChild(style);

    // thead - rowspan 추가
    const thead = document.createElement('thead');
    thead.innerHTML = `
    <tr>
        <th rowspan="2">직업/이름</th>
        <th rowspan="2">슬롯</th>
        <th colspan="2">기본 정보</th>
        <th colspan="2">엠블렘</th>
        <th colspan="2">마법부여</th>
        <th rowspan="2">설명</th>
    </tr>
    <tr>
        <th>희귀도</th>
        <th>아이템명</th>
        <th>엠블렘1</th>
        <th>엠블렘2</th>
        <th>마법부여</th>
        <th>수치</th>
    </tr>
`;
    table.appendChild(thead);

    // tbody - 같은 캐릭터는 직업/이름 셀 합치기
    const tbody = document.createElement('tbody');

    // 캐릭터별로 그룹화
    const groupedResults = {};
    results.forEach(result => {
        const key = `${result.job}(${result.name})`;
        if (!groupedResults[key]) {
            groupedResults[key] = [];
        }
        groupedResults[key].push(result);
    });

    // 그룹별로 행 생성
    Object.entries(groupedResults).forEach(([charKey, charResults]) => {
        charResults.forEach((result, index) => {
            const tr = document.createElement('tr');
            const rarityClass = result.rarity ? `rare-${result.rarity}` : '';
            const embClass = getEmblemHighlight('칭호', result.emb1, result.eleType);

            // 첫 번째 행에만 직업/이름 셀 추가 (rowspan)
            if (index === 0) {
                tr.innerHTML = `
                    <td rowspan="${charResults.length}" style="white-space: nowrap;">${charKey}</td>
                    <td>${result.slotType || ''}</td>
                    <td class="${rarityClass}">${result.rarity || ''}</td>
                    <td>${result.itemname || ''}</td>
                    <td class="${embClass}">${result.emb1 || ''}</td>
                    <td class="${embClass}">${result.emb2 || ''}</td>
                    <td>${result.enchant || ''}</td>
                    <td>${result.enchant_val || ''}</td>
                    <td style="white-space: pre-wrap; text-align: left; padding: 4px 8px;">${result.desc || ''}</td>
                `;
            } else {
                // 두 번째 행부터는 직업/이름 셀 제외
                tr.innerHTML = `
                    <td>${result.slotType || ''}</td>
                    <td class="${rarityClass}">${result.rarity || ''}</td>
                    <td>${result.itemname || ''}</td>
                    <td class="${embClass}">${result.emb1 || ''}</td>
                    <td class="${embClass}">${result.emb2 || ''}</td>
                    <td>${result.enchant || ''}</td>
                    <td>${result.enchant_val || ''}</td>
                    <td style="white-space: pre-wrap; text-align: left; padding: 4px 8px;">${result.desc || ''}</td>
                `;
            }

            tbody.appendChild(tr);
        });
    });
    table.appendChild(tbody);

    container.innerHTML = '';
    container.appendChild(table);
}

/**
 * 크리쳐 검색 테이블 생성
 */
function createCreatureSearchTable(results) {
    let html = `
        <style>
            .creature-search-table {
                table-layout: auto;
                width: auto;
                font-weight: 900;
            }
            .creature-artifacts-cell {
                padding: 8px !important;
            }
            .creature-artifacts-wrapper {
                display: flex;
                gap: 10px;
                justify-content: start;
            }
            .creature-art-group {
                display: flex;
                flex-direction: column;
                gap: 4px;
                border: 1px solid var(--border);
                padding: 6px;
                background: var(--bg-dark);
                flex: 1;
                min-width: 150px;
            }
            .creature-art-item {
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: var(--fs-search);
                min-height: 20px;
            }
            .creature-art-top {
                border-bottom: 1px dashed var(--border);
                padding-bottom: 4px;
                margin-bottom: 4px;
            }
            .creature-art-rarity {
                padding: 2px 4px;
                min-width: 45px;
                text-align: center;
                font-size: var(--fs-search);
            }
            .creature-art-text {
                flex: 1;
                font-size: var(--fs-search);
            }
        </style>
        <table class="compare-table search-result-table search-table-custom creature-search-table">
            <thead>
                <tr>
                    <th>직업/이름</th>
                    <th>희귀도</th>
                    <th>크리쳐 이름</th>
                    <th>아티팩트</th>
                    <th>설명</th>
                </tr>
            </thead>
            <tbody>
    `;

    results.forEach(result => {
        const rarityClass = result.rarity ? `rare-${result.rarity}` : '';

        // 아티팩트 박스 생성 함수
        const createArtBox = (color, colorName) => {
            const topRarity = result[`art_${color}_top_rarity`] || '';
            const topText = result[`art_${color}_top_text`] || '';
            const bg1 = result[`art_${color}_bg_1`] || '';
            const opt1 = result[`art_${color}_opt_1`] || '';
            const bg2 = result[`art_${color}_bg_2`] || '';
            const opt2 = result[`art_${color}_opt_2`] || '';

            const rarityClassTop = topRarity ? `bg-${topRarity}` : '';
            const rarityClassBg1 = bg1 ? `bg-${bg1}` : '';
            const rarityClassBg2 = bg2 ? `bg-${bg2}` : '';

            return `
                <div class="creature-art-group">
                    <div class="creature-art-item creature-art-top">
                        <span class="creature-art-rarity ${rarityClassTop}">${topRarity || '-'}</span>
                        <span class="creature-art-text">${topText || '-'}</span>
                    </div>
                    <div class="creature-art-item">
                        <span class="creature-art-rarity ${rarityClassBg1}">${bg1 || '-'}</span>
                        <span class="creature-art-text">${opt1 || '-'}</span>
                    </div>
                    <div class="creature-art-item">
                        <span class="creature-art-rarity ${rarityClassBg2}">${bg2 || '-'}</span>
                        <span class="creature-art-text">${opt2 || '-'}</span>
                    </div>
                </div>
            `;
        };

        html += `
            <tr>
                <td style="white-space: nowrap;">${result.job}(${result.name})</td>
                <td class="${rarityClass}">${result.rarity || '-'}</td>
                <td>${result.name || '-'}</td>
                <td class="creature-artifacts-cell">
                    <div class="creature-artifacts-wrapper">
                        ${createArtBox('red', 'Red')}
                        ${createArtBox('blue', 'Blue')}
                        ${createArtBox('green', 'Green')}
                    </div>
                </td>
                <td style="white-space: pre-wrap; text-align: left; padding: 4px 8px;">${result.desc || '-'}</td>
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