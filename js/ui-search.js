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

    // 메모/태그 옵션 추가 (마지막)
    slotSelect.innerHTML += `<option value="메모/태그">메모/태그</option>`;

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

    // 메모/태그
    if (selectedSlot === "메모/태그") {
        sections.forEach(section => {
            const job  = section.querySelector('[data-key="info_job"]')?.value  || '미정';
            const name = section.querySelector('[data-key="info_name"]')?.value || '이름없음';
            const memo = section.querySelector('[data-key="info_memo"]')?.value || '';
            const tags = (AppState.charTags?.[section.id] || []).join('\n');
            searchResults.push({ job, name, memo, tags });
        });
        displaySearchResults(selectedSlot, searchResults);
        return;
    }

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

    // 아바타 슬롯 전용
    if (slot === "아바타") {
        const btn = section.querySelector('button[data-key="아바타_itemname"]');
        return {
            isSpecial: true,
            specialType: 'avatar',
            avatarValue: btn?.getAttribute('data-avatar-value') || btn?.textContent || '',
            weaponStat: section.querySelector('select[data-key="아바타_weapon_stat"]')?.value || '',
            desc: section.querySelector('[data-key="아바타_desc"]')?.value || ''
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
        container.innerHTML = '';
        container.appendChild(createCreatureSearchTable(results));
        return;
    }

    // 칭호/외형칭호 통합 처리
    if (slot === "칭호/외형칭호") {
        createTitleSearchTable(container, results);
        return;
    }

    // 오라 간소화 처리
    if (slot === "오라") {
        createSimpleSlotSearchTable(container, results, slot);
        return;
    }

    // 아바타 전용 처리
    if (slot === "아바타") {
        createAvatarSearchTable(container, results);
        return;
    }

    // 메모/태그
    if (slot === "메모/태그") {
        createMemoTagSearchTable(container, results);
        return;
    }

    // 일반 슬롯 테이블 생성
    const table = document.createElement('table');
    table.className = 'compare-table search-result-table search-table-custom';
    table.style.tableLayout = 'auto';
    table.style.width = 'auto';
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

    // thead
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th rowspan="2">직업/이름</th>
            <th colspan="5">기본 정보</th>
            <th colspan="4">마법봉인</th>
            <th colspan="2">엠블렘</th>
            <th colspan="2">마법부여</th>
            <th rowspan="2" class="desc-col">설명 <button id="descEditToggleBtn" title="설명 편집" style="background:#4a5abb;color:#fff;border:none;border-radius:4px;padding:1px 6px;cursor:pointer;font-size:11px;margin-left:4px;">✏️</button></th>
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

    container.style.overflowX = 'auto';
    container.style.webkitOverflowScrolling = 'touch';
    container.innerHTML = '';
    container.appendChild(table);

    // 설명 편집 버튼 이벤트 등록
    _initDescToggleBtn(table, '#descEditToggleBtn');

    // 각 행의 설명 td에 클릭 편집 등록
    table.querySelectorAll('tbody tr').forEach(tr => {
        const descTd = tr.querySelectorAll('td')[14];
        if (descTd) {
            descTd.dataset.descCell = 'true';
            _makeDescEditable(descTd, tr.dataset.charId, tr.dataset.slot);
        }
    });
}

/**
 * 검색 결과 행 생성
 */
function createSearchResultRow(slot, result) {
    const tr = document.createElement('tr');
    tr.dataset.charId = result.charId;
    tr.dataset.slot = slot;
    tr.style.cursor = 'pointer';
    tr.title = '클릭하여 편집';

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
        <td style="white-space: nowrap; user-select: none; cursor: pointer;">✏️ ${result.job}(${result.name})</td>
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
        <td class="desc-col" style="white-space: pre-wrap; text-align: left; padding: 4px 8px;">${result.desc || ''}</td>
    `;

    // 직업/이름 셀 클릭 시 인라인 편집 (설명 제외)
    tr.querySelector('td:first-child').addEventListener('click', () => {
        if (tr.dataset.editing === 'true') return;
        _enterSearchRowEditMode(tr, slot, result);
    });

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
 * 아바타 검색 테이블 생성
 * | 직업/이름 | 파츠 설정 | 무기 아바타 수치 | 설명 |
 */
function createAvatarSearchTable(container, results) {
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
    `;
    document.head.appendChild(style);

    // thead
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>직업/이름</th>
            <th>파츠 설정</th>
            <th>무기 아바타 수치</th>
            <th>설명 <button class="simple-desc-toggle-btn" title="설명 편집" style="background:#4a5abb;color:#fff;border:none;border-radius:4px;padding:1px 6px;cursor:pointer;font-size:11px;margin-left:4px;">✏️</button></th>
        </tr>
    `;
    table.appendChild(thead);

    // tbody
    const tbody = document.createElement('tbody');
    results.forEach(result => {
        const tr = document.createElement('tr');

        const tdName = document.createElement('td');
        tdName.style.whiteSpace = 'nowrap';
        tdName.textContent = `${result.job}(${result.name})`;

        // 파츠 설정 - 언커먼/레어 색상 적용 (renderAvatarBtnHTML 활용)
        const tdAvatar = document.createElement('td');
        tdAvatar.style.cssText = 'white-space:nowrap; text-align:left; padding:2px 6px;';
        if (typeof renderAvatarBtnHTML === 'function') {
            tdAvatar.innerHTML = renderAvatarBtnHTML(result.avatarValue || '');
        } else {
            tdAvatar.textContent = result.avatarValue || '';
        }

        const tdWeaponStat = document.createElement('td');
        tdWeaponStat.style.whiteSpace = 'nowrap';
        // value("힘,지능,체력,정신력|18") 대신 label 표시
        const weaponStatLabel = (() => {
            const val = result.weaponStat || '';
            if (!val) return '';
            const matched = (typeof AVATAR_WEAPON_STATS !== 'undefined')
                ? AVATAR_WEAPON_STATS.find(item => {
                    if (!item.stats || item.stats.length === 0) return false;
                    const statStr = item.stats.join(',');
                    const encoded = item.amount !== null ? `${statStr}|${item.amount}` : statStr;
                    return encoded === val;
                })
                : null;
            return matched ? matched.label : val;
        })();
        tdWeaponStat.textContent = weaponStatLabel;

        const tdDesc = document.createElement('td');
        tdDesc.dataset.descCell = 'true';
        tdDesc.style.cssText = 'white-space:pre-wrap; text-align:left; padding:4px 8px;';
        tdDesc.textContent = result.desc || '';
        _makeDescEditable(tdDesc, result.charId, '아바타');

        tr.appendChild(tdName);
        tr.appendChild(tdAvatar);
        tr.appendChild(tdWeaponStat);
        tr.appendChild(tdDesc);
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    container.innerHTML = '';
    container.appendChild(table);

    _initDescToggleBtn(table, '.simple-desc-toggle-btn');
}

/**
 * 간소화된 슬롯 검색 테이블 생성 (오라, 아바타)
 */
function createSimpleSlotSearchTable(container, results, slot) {
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
    `;
    document.head.appendChild(style);

    // thead - 간소화된 구조
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>직업/이름</th>
            <th>희귀도</th>
            <th>아이템명</th>
            <th>설명 <button class="simple-desc-toggle-btn" title="설명 편집" style="background:#4a5abb;color:#fff;border:none;border-radius:4px;padding:1px 6px;cursor:pointer;font-size:11px;margin-left:4px;">✏️</button></th>
        </tr>
    `;
    table.appendChild(thead);

    // tbody
    const tbody = document.createElement('tbody');
    results.forEach(result => {
        const tr = document.createElement('tr');
        const rarityClass = result.rarity ? `rare-${result.rarity}` : '';

        const tdName = document.createElement('td');
        tdName.style.whiteSpace = 'nowrap';
        tdName.textContent = `${result.job}(${result.name})`;

        const tdRarity = document.createElement('td');
        tdRarity.className = rarityClass;
        tdRarity.textContent = result.rarity || '';

        const tdItem = document.createElement('td');
        tdItem.textContent = result.itemname || '';

        const tdDesc = document.createElement('td');
        tdDesc.dataset.descCell = 'true';
        tdDesc.style.cssText = 'white-space:pre-wrap; text-align:left; padding:4px 8px;';
        tdDesc.textContent = result.desc || '';
        _makeDescEditable(tdDesc, result.charId, slot);

        tr.appendChild(tdName);
        tr.appendChild(tdRarity);
        tr.appendChild(tdItem);
        tr.appendChild(tdDesc);
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    container.innerHTML = '';
    container.appendChild(table);

    // 설명 편집 버튼 토글
    _initDescToggleBtn(table, '.simple-desc-toggle-btn');
}

/**
 * 스킬룬 검색 테이블 생성
 * | 구분자는 무조건 연하게
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

            // | 구분자는 무조건 연하게
            const summaryArray = [];
            runeMap.forEach((val) => {
                const skillLv = (AppConstants.NO_SKILL_LV_RUNES.includes(val.name) || !val.skillLv) ? "" : `[${val.skillLv}]`;
                const text = `${val.name}${val.lv}${skillLv} ${val.count}개`;

                // IV 룬만 연한 글자로 표시
                if (val.lv === 'IV') {
                    summaryArray.push(`<span style="opacity: 0.5;">${text}</span>`);
                } else {
                    summaryArray.push(text);
                }
            });

            // | 구분자는 무조건 연하게
            runeDetail = summaryArray.join(' <span style="opacity: 0.5;">|</span> ');
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
        <th rowspan="2">설명 <button class="title-desc-toggle-btn" title="설명 편집" style="background:#4a5abb;color:#fff;border:none;border-radius:4px;padding:1px 6px;cursor:pointer;font-size:11px;margin-left:4px;">✏️</button></th>
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

            if (index === 0) {
                const tdName = document.createElement('td');
                tdName.rowSpan = charResults.length;
                tdName.style.whiteSpace = 'nowrap';
                tdName.textContent = charKey;
                tr.appendChild(tdName);
            }

            const tdSlot = document.createElement('td');
            tdSlot.textContent = result.slotType || '';
            const tdRarity = document.createElement('td');
            tdRarity.className = rarityClass;
            tdRarity.textContent = result.rarity || '';
            const tdItem = document.createElement('td');
            tdItem.textContent = result.itemname || '';
            const tdEmb1 = document.createElement('td');
            tdEmb1.className = embClass;
            tdEmb1.textContent = result.emb1 || '';
            const tdEmb2 = document.createElement('td');
            tdEmb2.className = embClass;
            tdEmb2.textContent = result.emb2 || '';
            const tdEnchant = document.createElement('td');
            tdEnchant.textContent = result.enchant || '';
            const tdEnchantVal = document.createElement('td');
            tdEnchantVal.textContent = result.enchant_val || '';
            const tdDesc = document.createElement('td');
            tdDesc.dataset.descCell = 'true';
            tdDesc.style.cssText = 'white-space:pre-wrap; text-align:left; padding:4px 8px;';
            tdDesc.textContent = result.desc || '';
            _makeDescEditable(tdDesc, result.charId, result.slotType);

            tr.appendChild(tdSlot);
            tr.appendChild(tdRarity);
            tr.appendChild(tdItem);
            tr.appendChild(tdEmb1);
            tr.appendChild(tdEmb2);
            tr.appendChild(tdEnchant);
            tr.appendChild(tdEnchantVal);
            tr.appendChild(tdDesc);
            tbody.appendChild(tr);
        });
    });
    table.appendChild(tbody);

    container.innerHTML = '';
    container.appendChild(table);

    // 설명 편집 버튼 토글
    _initDescToggleBtn(table, '.title-desc-toggle-btn');
}

/**
 * 크리쳐 검색 테이블 생성
 */
function createCreatureSearchTable(results) {
    // 스타일 삽입 (한 번만)
    if (!document.querySelector('#creature-search-style')) {
        const style = document.createElement('style');
        style.id = 'creature-search-style';
        style.textContent = `
            .creature-search-table { table-layout: auto; width: auto; font-weight: 900; }
            .creature-artifacts-cell { padding: 8px !important; }
            .creature-artifacts-wrapper { display: flex; gap: 10px; justify-content: start; }
            .creature-art-group { display: flex; flex-direction: column; gap: 4px; border: 1px solid var(--border); padding: 6px; background: var(--bg-dark); flex: 1; min-width: 150px; }
            .creature-art-item { display: flex; align-items: center; gap: 5px; font-size: var(--fs-search); min-height: 20px; }
            .creature-art-top { border-bottom: 1px dashed var(--border); padding-bottom: 4px; margin-bottom: 4px; }
            .creature-art-rarity { padding: 2px 4px; min-width: 45px; text-align: center; font-size: var(--fs-search); }
            .creature-art-text { flex: 1; font-size: var(--fs-search); }
        `;
        document.head.appendChild(style);
    }

    const table = document.createElement('table');
    table.className = 'compare-table search-result-table search-table-custom creature-search-table';

    table.innerHTML = `
        <thead>
            <tr>
                <th>직업/이름</th>
                <th>희귀도</th>
                <th>크리쳐 이름</th>
                <th>아티팩트</th>
                <th>설명 <button class="creature-desc-toggle-btn" title="설명 편집" style="background:#4a5abb;color:#fff;border:none;border-radius:4px;padding:1px 6px;cursor:pointer;font-size:11px;margin-left:4px;">✏️</button></th>
            </tr>
        </thead>
    `;

    const tbody = document.createElement('tbody');

    results.forEach(result => {
        const rarityClass = result.rarity ? `rare-${result.rarity}` : '';

        const createArtBox = (color) => {
            const topRarity = result[`art_${color}_top_rarity`] || '';
            const topText   = result[`art_${color}_top_text`]   || '';
            const bg1       = result[`art_${color}_bg_1`]        || '';
            const opt1      = result[`art_${color}_opt_1`]       || '';
            const bg2       = result[`art_${color}_bg_2`]        || '';
            const opt2      = result[`art_${color}_opt_2`]       || '';
            const div = document.createElement('div');
            div.className = 'creature-art-group';
            div.innerHTML = `
                <div class="creature-art-item creature-art-top">
                    <span class="creature-art-rarity ${topRarity ? 'bg-'+topRarity : ''}">${topRarity || '-'}</span>
                    <span class="creature-art-text">${topText || '-'}</span>
                </div>
                <div class="creature-art-item">
                    <span class="creature-art-rarity ${bg1 ? 'bg-'+bg1 : ''}">${bg1 || '-'}</span>
                    <span class="creature-art-text">${opt1 || '-'}</span>
                </div>
                <div class="creature-art-item">
                    <span class="creature-art-rarity ${bg2 ? 'bg-'+bg2 : ''}">${bg2 || '-'}</span>
                    <span class="creature-art-text">${opt2 || '-'}</span>
                </div>
            `;
            return div;
        };

        const tr = document.createElement('tr');

        const tdName = document.createElement('td');
        tdName.style.whiteSpace = 'nowrap';
        tdName.textContent = `${result.job}(${result.name})`;

        const tdRarity = document.createElement('td');
        tdRarity.className = rarityClass;
        tdRarity.textContent = result.rarity || '-';

        const tdCreatureName = document.createElement('td');
        tdCreatureName.textContent = result.itemname || '-';

        const tdArt = document.createElement('td');
        tdArt.className = 'creature-artifacts-cell';
        const wrapper = document.createElement('div');
        wrapper.className = 'creature-artifacts-wrapper';
        wrapper.appendChild(createArtBox('red'));
        wrapper.appendChild(createArtBox('blue'));
        wrapper.appendChild(createArtBox('green'));
        tdArt.appendChild(wrapper);

        const tdDesc = document.createElement('td');
        tdDesc.dataset.descCell = 'true';
        tdDesc.style.cssText = 'white-space:pre-wrap; text-align:left; padding:4px 8px;';
        tdDesc.textContent = result.desc || '';
        _makeDescEditable(tdDesc, result.charId, '크리쳐');

        tr.appendChild(tdName);
        tr.appendChild(tdRarity);
        tr.appendChild(tdCreatureName);
        tr.appendChild(tdArt);
        tr.appendChild(tdDesc);
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);

    // 설명 편집 버튼 토글 (return 전에 등록, DOM에 추가된 후 버튼 클릭 시 동작)
    setTimeout(() => _initDescToggleBtn(table, '.creature-desc-toggle-btn'), 0);

    return table;
}

/**
 * 메모/태그 검색 테이블 생성
 */
function createMemoTagSearchTable(container, results) {
    const table = document.createElement('table');
    table.className = 'compare-table search-result-table search-table-custom';
    table.style.tableLayout = 'auto';
    table.style.width = 'auto';
    table.style.fontWeight = '900';

    table.innerHTML = `
        <thead>
            <tr>
                <th>직업/이름</th>
                <th>메모</th>
                <th>태그</th>
            </tr>
        </thead>
        <tbody>
            ${results.map(r => `
                <tr>
                    <td style="white-space: nowrap;">${r.job}(${r.name})</td>
                    <td style="white-space: pre-wrap; text-align: left; padding: 4px 8px;">${r.memo || ''}</td>
                    <td style="white-space: pre-wrap; text-align: left; padding: 4px 8px;">${r.tags || ''}</td>
                </tr>
            `).join('')}
        </tbody>
    `;

    container.innerHTML = '';
    container.appendChild(table);
}




/* ============================================================
   검색 결과 인라인 편집 (설명 제외) + 설명 헤더 버튼 토글
   ============================================================ */

const _SEARCH_EDIT_OPTIONS = {
    rarity: ['에픽', '유니크', '레어', '언커먼', '커먼', '티어'],
    exceed: ['', '이상', '선봉', '의지'],
    prefix: ['', '전격', '허상', '작열', '침식', '수호', '왜곡', '자상', '맹독', '보호', '쇄도', '신속', '연격'],
    seal_weapon_n1: ['', '데미지 증가', '추가 데미지', '모든 직업 50레벨스킬', '화속강', '수속강', '명속강', '암속강', '힘', '지능', '물리 공격력', '마법 공격력'],
    seal_weapon_n2: ['', '물리 공격력', '마법 공격력', '힘', '지능', '체력', '정신력', '공격속도', '캐스팅속도', '이동속도', '최대 HP 증가', '최대 MP 증가', '물리 방어력', '마법 방어력', '적중', '회피'],
    seal_armor_n1: ['', '힘', '지능', '체력', '정신력', '물리 크리티컬', '마법 크리티컬'],
    seal_armor_n2: ['', '물리 크리티컬', '마법 크리티컬', '힘', '지능', '체력', '정신력', '공격속도', '캐스팅속도', '이동속도', '최대 HP 증가', '최대 MP 증가', '물리 방어력', '마법 방어력', '적중', '회피'],
    seal_accessory_n1: ['', '화속강', '수속강', '명속강', '암속강', '힘', '지능', '체력', '정신력'],
    seal_accessory_n2: ['', '화속강', '수속강', '명속강', '암속강', '힘', '지능', '체력', '정신력', '공격속도', '캐스팅속도', '이동속도', '최대 HP 증가', '최대 MP 증가', '물리 방어력', '마법 방어력', '화속성 저항', '수속성 저항', '명속성 저항', '암속성 저항', '적중', '회피'],
    seal_special_n1: ['', '물리 공격력', '마법 공격력', '힘', '지능', '물리 크리티컬', '마법 크리티컬', '적중', '회피'],
    seal_special_n2: ['', '물리 공격력', '마법 공격력', '물리 크리티컬', '마법 크리티컬', '힘', '지능', '체력', '정신력', '공격속도', '캐스팅속도', '이동속도', '최대 HP 증가', '최대 MP 증가', '물리 방어력', '마법 방어력', '적중', '회피'],
};

function _getSealOptions(slot, isN1) {
    const armorSlots = ['상의', '하의', '어깨', '벨트', '신발'];
    const accSlots = ['팔찌', '목걸이', '반지'];
    const specialSlots = ['보조장비', '귀걸이', '마법석'];
    const suffix = isN1 ? '_n1' : '_n2';
    if (slot === '무기') return _SEARCH_EDIT_OPTIONS['seal_weapon' + suffix];
    if (armorSlots.includes(slot)) return _SEARCH_EDIT_OPTIONS['seal_armor' + suffix];
    if (accSlots.includes(slot)) return _SEARCH_EDIT_OPTIONS['seal_accessory' + suffix];
    if (specialSlots.includes(slot)) return _SEARCH_EDIT_OPTIONS['seal_special' + suffix];
    return [''];
}

function _makeSelect(options, currentVal) {
    const sel = document.createElement('select');
    sel.style.cssText = 'width:100%; background:#1a2040; color:#fff; border:1px solid #4a5abb; border-radius:3px; padding:2px; font-size:inherit;';
    options.forEach(opt => {
        const o = document.createElement('option');
        o.value = opt; o.textContent = opt || '(없음)';
        if (opt === currentVal) o.selected = true;
        sel.appendChild(o);
    });
    return sel;
}

function _makeInput(currentVal) {
    const inp = document.createElement('input');
    inp.type = 'text'; inp.value = currentVal || '';
    inp.style.cssText = 'width:100%; background:#1a2040; color:#fff; border:1px solid #4a5abb; border-radius:3px; padding:2px; box-sizing:border-box; font-size:inherit;';
    return inp;
}

/**
 * 설명 편집 버튼 토글 초기화 (칭호/외형칭호, 오라/아바타, 크리쳐 공통)
 * btnSelector: 버튼의 class selector
 */
function _initDescToggleBtn(table, btnSelector) {
    const btn = table.querySelector(btnSelector);
    if (!btn) return;

    let editMode = false;

    btn.addEventListener('click', () => {
        editMode = !editMode;
        btn.style.background = editMode ? '#25c2a0' : '#4a5abb';
        btn.title = editMode ? '설명 편집 종료' : '설명 편집';

        // 모든 설명 td에 editMode 플래그 설정
        table.querySelectorAll('tbody td[data-desc-cell="true"]').forEach(td => {
            td.dataset.descEditMode = editMode ? 'on' : 'off';
            td.style.cursor = editMode ? 'text' : 'default';
            td.title = editMode ? '클릭하여 설명 편집' : '';

            // 편집 모드 ON: 파란 테두리 + 살짝 밝은 배경
            if (editMode) {
                td.style.outline = '1px solid #4a5abb';
                td.style.background = 'rgba(74,91,187,0.15)';
            } else {
                td.style.outline = '';
                td.style.background = '';
                // 편집 모드 OFF 시 열려 있는 textarea를 blur로 닫기
                const ta = td.querySelector('textarea');
                if (ta) ta.blur();
            }
        });
    });
}

/**
 * 설명 td를 클릭 시 바로 편집 가능하게 만드는 공통 함수
 * (칭호/외형칭호, 오라, 아바타, 크리쳐에 사용)
 */
function _makeDescEditable(td, charId, slot) {
    td.style.cursor = 'default';

    td.addEventListener('click', () => {
        if (!td.dataset.descEditMode || td.dataset.descEditMode !== 'on') return; // 편집 모드 OFF
        if (td.querySelector('textarea')) return; // 이미 편집 중

        // 클릭 시점에 td 실제 크기 측정 (클릭한 td 자신이므로 정확함)
        const rect = td.getBoundingClientRect();
        const tdW = rect.width;
        const tdH = Math.max(rect.height, 40);

        const currentVal = td.dataset.descVal !== undefined ? td.dataset.descVal : td.textContent;
        td.dataset.descVal = currentVal;

        const ta = document.createElement('textarea');
        ta.value = currentVal === '-' ? '' : currentVal;
        ta.style.cssText = `width:${tdW}px; height:${tdH}px; min-height:${tdH}px; background:#1a2040; color:#fff; border:1px solid #4a5abb; border-radius:3px; padding:4px; box-sizing:border-box; font-size:inherit; font-family:inherit; resize:vertical; display:block;`;

        ta.addEventListener('blur', () => {
            const newVal = ta.value;
            td.dataset.descVal = newVal;
            td.className = td.className || '';  // desc-col 등 기존 클래스 유지
            td.style.cssText = 'white-space:pre-wrap; text-align:left; padding:4px 8px; cursor:text; outline:1px solid #4a5abb; background:rgba(74,91,187,0.15);';
            td.title = '클릭하여 설명 편집';
            td.textContent = newVal || '';
            if (charId && slot) _applySearchEditToDOM(charId, slot, { desc: newVal });
        });

        ta.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') ta.blur();
        });

        td.innerHTML = '';
        td.style.padding = '0';
        td.title = '';
        td.appendChild(ta);
        ta.focus();
    });
}

/**
 * 설명 td 편집 모드 전환 (헤더 버튼으로 제어)
 * width:100% 사용 → 측정 오차 없이 td 크기 그대로
 */
/**
 * 인라인 편집 모드 진입 (설명 제외)
 */
function _enterSearchRowEditMode(tr, slot, result) {
    tr.dataset.editing = 'true';
    tr.style.background = 'rgba(74,91,187,0.2)';

    const tds = tr.querySelectorAll('td');

    // td 크기 고정 (편집 중 레이아웃 안 흔들리도록)
    Array.from(tds).forEach(td => {
        const w = td.getBoundingClientRect().width;
        td.style.width = w + 'px';
        td.style.minWidth = w + 'px';
        td.style.maxWidth = w + 'px';
    });

    // [0] 저장/취소 버튼
    tds[0].innerHTML = '';
    tds[0].style.whiteSpace = 'nowrap';
    const saveBtn = document.createElement('button');
    saveBtn.textContent = '💾';
    saveBtn.title = '저장';
    saveBtn.style.cssText = 'background:#25c2a0;color:#fff;border:none;border-radius:4px;padding:3px 7px;cursor:pointer;margin-right:3px;font-size:13px;';
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '✖';
    cancelBtn.title = '취소';
    cancelBtn.style.cssText = 'background:#e05252;color:#fff;border:none;border-radius:4px;padding:3px 7px;cursor:pointer;font-size:13px;';
    const nameSpan = document.createElement('div');
    nameSpan.textContent = `${result.job}(${result.name})`;
    nameSpan.style.cssText = 'font-size:11px;color:#aaa;margin-top:3px;';
    tds[0].appendChild(saveBtn);
    tds[0].appendChild(cancelBtn);
    tds[0].appendChild(nameSpan);

    // [1~13] select / input (설명 tds[14] 제외)
    const fields = [
        { idx:1,  el: _makeSelect(_SEARCH_EDIT_OPTIONS.rarity, result.rarity) },
        { idx:2,  el: _makeSelect(_SEARCH_EDIT_OPTIONS.exceed, result.exceed) },
        { idx:3,  el: _makeSelect(_SEARCH_EDIT_OPTIONS.prefix, result.prefix) },
        { idx:4,  el: _makeInput(result.itemname) },
        { idx:5,  el: _makeInput(result.reinforce) },
        { idx:6,  el: _makeSelect(_getSealOptions(slot, true), result.seal1) },
        { idx:7,  el: _makeInput(result.seal1_val) },
        { idx:8,  el: _makeSelect(_getSealOptions(slot, false), result.seal2) },
        { idx:9,  el: _makeInput(result.seal2_val) },
        { idx:10, el: _makeInput(result.emb1) },
        { idx:11, el: _makeInput(result.emb2) },
        { idx:12, el: _makeInput(result.enchant) },
        { idx:13, el: _makeInput(result.enchant_val) },
    ];
    fields.forEach(({ idx, el }) => { tds[idx].innerHTML = ''; tds[idx].appendChild(el); });

    // 저장
    saveBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const descTa = tds[14].querySelector('textarea');
        const descVal = descTa ? descTa.value : (tds[14].dataset.descVal ?? tds[14].textContent);
        const newData = {
            rarity:      tds[1].querySelector('select').value,
            exceed:      tds[2].querySelector('select').value,
            prefix:      tds[3].querySelector('select').value,
            itemname:    tds[4].querySelector('input').value,
            reinforce:   tds[5].querySelector('input').value,
            seal1:       tds[6].querySelector('select').value,
            seal1_val:   tds[7].querySelector('input').value,
            seal2:       tds[8].querySelector('select').value,
            seal2_val:   tds[9].querySelector('input').value,
            emb1:        tds[10].querySelector('input').value,
            emb2:        tds[11].querySelector('input').value,
            enchant:     tds[12].querySelector('input').value,
            enchant_val: tds[13].querySelector('input').value,
            desc:        descVal,
        };
        _applySearchEditToDOM(result.charId, slot, newData);
        Object.assign(result, newData);
        _exitSearchRowEditMode(tr, slot, result);
    });

    // 취소
    cancelBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        _exitSearchRowEditMode(tr, slot, result);
    });
}

/**
 * 인라인 편집 모드 종료
 */
function _exitSearchRowEditMode(tr, slot, result) {
    tr.dataset.editing = 'false';
    tr.style.background = '';

    tr.querySelectorAll('td').forEach(td => {
        td.style.width = '';
        td.style.minWidth = '';
        td.style.maxWidth = '';
    });

    const rarityClass = result.rarity ? `rare-${result.rarity}` : '';
    const exceedClass = result.exceed ? `ex-${result.exceed}` : '';
    let prefixClass = '';
    if (result.prefix) {
        if (result.prefix.startsWith('T')) prefixClass = 'prefix-tier';
        else {
            prefixClass = 'prefix-selected';
            if (slot === '무기') {
                if (result.prefix === '광채') prefixClass += ' p-blue';
                else if (result.prefix === '분쇄') prefixClass += ' p-red';
                else if (result.prefix === '선명') prefixClass += ' p-green';
                else if (result.prefix === '강타') prefixClass += ' p-yellow';
            }
        }
    }
    const seal1Class = getSealHighlight(slot, result.seal1, result.statType, result.eleType, true);
    const seal2Class = getSealHighlight(slot, result.seal2, result.statType, result.eleType, false);
    const embClass   = getEmblemHighlight(slot, result.emb1, result.eleType);

    const tds = tr.querySelectorAll('td');

    // [0] 직업/이름 복원 + 클릭 이벤트 재등록
    const newTd = tds[0].cloneNode(false);
    newTd.innerHTML = `✏️ ${result.job}(${result.name})`;
    newTd.style.cssText = 'white-space:nowrap; user-select:none; cursor:pointer;';
    newTd.addEventListener('click', () => {
        if (tr.dataset.editing === 'true') return;
        _enterSearchRowEditMode(tr, slot, result);
    });
    tds[0].parentNode.replaceChild(newTd, tds[0]);

    const allTds = tr.querySelectorAll('td');
    allTds[1].className = rarityClass;  allTds[1].textContent = result.rarity;
    allTds[2].className = exceedClass;  allTds[2].textContent = result.exceed;
    allTds[3].className = prefixClass;  allTds[3].textContent = result.prefix;
    allTds[4].textContent = result.itemname;
    allTds[5].textContent = result.reinforce;
    allTds[6].className = seal1Class;   allTds[6].textContent = result.seal1;
    allTds[7].className = seal1Class;   allTds[7].textContent = result.seal1_val;
    allTds[8].className = seal2Class;   allTds[8].textContent = result.seal2;
    allTds[9].className = seal2Class;   allTds[9].textContent = result.seal2_val;
    allTds[10].className = embClass;    allTds[10].textContent = result.emb1;
    allTds[11].className = embClass;    allTds[11].textContent = result.emb2;
    allTds[12].textContent = result.enchant;
    allTds[13].textContent = result.enchant_val;

    // [14] 설명 - 값 갱신 (textarea가 열려 있으면 값만 업데이트, 아니면 텍스트 복원)
    const descTd = allTds[14];
    const descTa = descTd.querySelector('textarea');
    descTd.dataset.descVal = result.desc || '';
    if (descTa) {
        descTa.value = result.desc || '';
    } else {
        descTd.className = 'desc-col';
        // 편집 모드 ON 상태면 테두리/배경 유지
        if (descTd.dataset.descEditMode === 'on') {
            descTd.style.cssText = 'white-space:pre-wrap; text-align:left; padding:4px 8px; cursor:text; outline:1px solid #4a5abb; background:rgba(74,91,187,0.15);';
        } else {
            descTd.style.cssText = 'white-space:pre-wrap; text-align:left; padding:4px 8px;';
        }
        descTd.textContent = result.desc || '';
    }
}

/**
 * 편집 결과를 실제 상세입력 DOM에 반영 + autoSave
 */
function _applySearchEditToDOM(charId, slot, newData) {
    const section = document.getElementById(charId);
    if (!section) return;

    const fieldMap = {
        rarity:      `select[data-key="${slot}_rarity"]`,
        exceed:      `select[data-key="${slot}_exceed"]`,
        prefix:      `select[data-key="${slot}_prefix"]`,
        itemname:    `[data-key="${slot}_itemname"]`,
        reinforce:   `input[data-key="${slot}_reinforce"]`,
        seal1:       `select[data-key="${slot}_seal1"]`,
        seal1_val:   `input[data-key="${slot}_seal1_val"]`,
        seal2:       `select[data-key="${slot}_seal2"]`,
        seal2_val:   `input[data-key="${slot}_seal2_val"]`,
        emb1:        `[data-key="${slot}_emb1"]`,
        emb2:        `[data-key="${slot}_emb2"]`,
        enchant:     `input[data-key="${slot}_enchant"]`,
        enchant_val: `input[data-key="${slot}_enchant_val"]`,
        desc:        `[data-key="${slot}_desc"]`,
    };

    Object.entries(newData).forEach(([field, val]) => {
        const el = section.querySelector(fieldMap[field]);
        if (el) el.value = val;
    });

    if (typeof updateStyle === 'function') {
        const rarityEl = section.querySelector(`select[data-key="${slot}_rarity"]`);
        if (rarityEl) updateStyle(rarityEl, 'rarity');
        const prefixEl = section.querySelector(`select[data-key="${slot}_prefix"]`);
        if (prefixEl) updateStyle(prefixEl, 'prefix');
    }

    if (typeof checkArmorSetColor === 'function') checkArmorSetColor(charId);
    if (typeof checkAccSetColor === 'function') checkAccSetColor(charId);
    if (typeof checkSpecialSetColor === 'function') checkSpecialSetColor(charId);

    if (typeof autoSave === 'function') autoSave();
}

console.log("✅ ui-search.js 로드 완료");