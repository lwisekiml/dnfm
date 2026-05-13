// ============================================
// mode-search.js - 검색 모드 기능
// ============================================

// ============================================
// 검색 결과 인라인 편집 옵션 상수
// ============================================
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
    document.getElementById('compareTabBar').style.display = 'none';
    document.getElementById('searchContainer').style.display = 'block';

    // 버튼 상태 업데이트
    document.getElementById('btnBasicMode').classList.remove('active');
    document.getElementById('btnCompareMode').classList.remove('active');
    document.getElementById('btnSearchMode').classList.add('active');

    // 슬롯 선택 초기화
    const slotSelect = document.getElementById('searchSlotSelect');

    // 기본 option (disabled + selected)
    let optionsHTML = '<option value="" disabled selected>▼ 슬롯 선택...</option>';

    // 그룹 옵션 추가 (방어구/악세서리/특수장비 전체 검색)
    optionsHTML += `<option value="방어구" style="font-weight:bold; color:#ffd700;">── 방어구 (전체) ──</option>`;
    optionsHTML += `<option value="악세서리" style="font-weight:bold; color:#ffd700;">── 악세서리 (전체) ──</option>`;
    optionsHTML += `<option value="특수장비" style="font-weight:bold; color:#ffd700;">── 특수장비 (전체) ──</option>`;

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

    // 그룹 선택 시 탭 UI로 표시
    const GROUP_SLOTS = {
        "방어구":   ["상의", "어깨", "하의", "신발", "벨트"],
        "악세서리": ["목걸이", "팔찌", "반지"],
        "특수장비": ["보조장비", "귀걸이", "마법석"]
    };

    if (GROUP_SLOTS[selectedSlot]) {
        _renderGroupSlotTabs(selectedSlot, GROUP_SLOTS[selectedSlot]);
        return;
    }

    const sections = document.querySelectorAll('.char-section');
    const searchResults = [];

    // 메모/태그
    if (selectedSlot === "메모/태그") {
        sections.forEach(section => {
            const charId = section.id;
            const job  = section.querySelector('[data-key="info_job"]')?.value  || '미정';
            const name = section.querySelector('[data-key="info_name"]')?.value || '이름없음';
            const memo = section.querySelector('[data-key="info_memo"]')?.value || '';
            const tags = (AppState.charTags?.[charId] || []);
            searchResults.push({ charId, job, name, memo, tags });
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
        const btn = section.querySelector('button[data-key="크리쳐_name"]');
        const getDisp = key => section.querySelector(`[data-creature-disp="${key}"]`)?.textContent.trim() || '';
        return {
            isSpecial: true,
            specialType: 'creature',
            rarity: section.querySelector(`select[data-key="${slot}_rarity"]`)?.value || '',
            name: btn?.getAttribute('data-creature-name') || btn?.textContent.trim() || '',
            // 아티팩트 정보 수집 (Red, Blue, Green만)
            art_red_top_rarity: getDisp('크리쳐_art_red_top_rarity'),
            art_red_top_text:   getDisp('크리쳐_art_red_top_text'),
            art_red_bg_1:       getDisp('크리쳐_art_red_bg_1'),
            art_red_opt_1:      getDisp('크리쳐_art_red_opt_1'),
            art_red_bg_2:       getDisp('크리쳐_art_red_bg_2'),
            art_red_opt_2:      getDisp('크리쳐_art_red_opt_2'),
            art_blue_top_rarity: getDisp('크리쳐_art_blue_top_rarity'),
            art_blue_top_text:   getDisp('크리쳐_art_blue_top_text'),
            art_blue_bg_1:       getDisp('크리쳐_art_blue_bg_1'),
            art_blue_opt_1:      getDisp('크리쳐_art_blue_opt_1'),
            art_blue_bg_2:       getDisp('크리쳐_art_blue_bg_2'),
            art_blue_opt_2:      getDisp('크리쳐_art_blue_opt_2'),
            art_green_top_rarity: getDisp('크리쳐_art_green_top_rarity'),
            art_green_top_text:   getDisp('크리쳐_art_green_top_text'),
            art_green_bg_1:       getDisp('크리쳐_art_green_bg_1'),
            art_green_opt_1:      getDisp('크리쳐_art_green_opt_1'),
            art_green_bg_2:       getDisp('크리쳐_art_green_bg_2'),
            art_green_opt_2:      getDisp('크리쳐_art_green_opt_2'),
            desc: section.querySelector(`[data-key="${slot}_desc"]`)?.value || ''
        };
    }

    // 아바타 슬롯 전용
    if (slot === "아바타") {
        const btn = section.querySelector('button[data-key="아바타_itemname"]');
        const weaponAvatarBtn = section.querySelector('button[data-weapon-avatar-btn]');
        return {
            isSpecial: true,
            specialType: 'avatar',
            avatarValue: btn?.getAttribute('data-avatar-value') || btn?.textContent || '',
            weaponStat: section.querySelector('select[data-key="아바타_weapon_stat"]')?.value || '',
            weaponAvatarName: weaponAvatarBtn?.getAttribute('data-weapon-avatar-name') || '',
            desc: section.querySelector('[data-key="아바타_desc"]')?.value || ''
        };
    }

    // ─── 칭호: 버튼에서 이름 읽기 ───────────────────────────────────
    if (slot === "칭호") {
        const btn = section.querySelector('button[data-key="칭호_itemname"]');
        return {
            isSpecial: false,
            rarity:      section.querySelector(`select[data-key="칭호_rarity"]`)?.value || '',
            exceed:      '',
            prefix:      '',
            itemname:    btn ? (btn.getAttribute('data-title-name') || btn.textContent.trim() || '') : '',
            reinforce:   '',
            seal1:       '',
            seal1_val:   '',
            seal2:       '',
            seal2_val:   '',
            emb1:        section.querySelector(`[data-key="칭호_emb1"]`)?.value || '',
            emb2:        section.querySelector(`[data-key="칭호_emb2"]`)?.value || '',
            enchant:     section.querySelector(`input[data-key="칭호_enchant"]`)?.value || '',
            enchant_val: section.querySelector(`input[data-key="칭호_enchant_val"]`)?.value || '',
            desc:        section.querySelector(`[data-key="칭호_desc"]`)?.value || ''
        };
    }

    // ─── 외형칭호: input에서 이름 읽기 (일반 input) ─────────────────
    if (slot === "외형칭호") {
        return {
            isSpecial: false,
            rarity:      section.querySelector(`select[data-key="외형칭호_rarity"]`)?.value || '',
            exceed:      '',
            prefix:      '',
            itemname:    section.querySelector(`[data-key="외형칭호_itemname"]`)?.value || '',
            reinforce:   '',
            seal1:       '',
            seal1_val:   '',
            seal2:       '',
            seal2_val:   '',
            emb1:        '',
            emb2:        '',
            enchant:     '',
            enchant_val: '',
            desc:        ''
        };
    }

    // ─── 오라: 버튼에서 이름 읽기 ────────────────────────────────────
    if (slot === "오라") {
        const btn = section.querySelector('button[data-key="오라_itemname"]');
        return {
            isSpecial: false,
            rarity:      section.querySelector(`select[data-key="오라_rarity"]`)?.value || '',
            exceed:      '',
            prefix:      '',
            itemname:    btn ? (btn.getAttribute('data-aura-name') || btn.textContent.trim() || '') : '',
            reinforce:   '',
            seal1:       '',
            seal1_val:   '',
            seal2:       '',
            seal2_val:   '',
            emb1:        '',
            emb2:        '',
            enchant:     '',
            enchant_val: '',
            desc:        section.querySelector(`[data-key="오라_desc"]`)?.value || ''
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
 * 검색 결과 행 생성 (읽기 전용, 설명만 편집 가능)
 */
function createSearchResultRow(slot, result) {
    const tr = document.createElement('tr');
    tr.dataset.charId = result.charId;
    tr.dataset.slot = slot;

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
        <td class="desc-col" style="white-space: pre-wrap; text-align: left; padding: 4px 8px;">${result.desc || ''}</td>
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

    // thead — "무기 아바타 수치" → "무기 아바타" + 이름 컬럼 추가
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>직업/이름</th>
            <th>파츠 설정</th>
            <th>무기 아바타</th>
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

        // 파츠 설정 - 언커먼/레어 색상 적용
        const tdAvatar = document.createElement('td');
        tdAvatar.style.cssText = 'white-space:nowrap; text-align:left; padding:2px 6px;';
        if (typeof renderAvatarBtnHTML === 'function') {
            tdAvatar.innerHTML = renderAvatarBtnHTML(result.avatarValue || '');
        } else {
            tdAvatar.textContent = result.avatarValue || '';
        }

        // 무기 아바타 이름
        const tdWeaponAvatarName = document.createElement('td');
        tdWeaponAvatarName.style.whiteSpace = 'nowrap';
        tdWeaponAvatarName.textContent = result.weaponAvatarName || '';

        const tdDesc = document.createElement('td');
        tdDesc.dataset.descCell = 'true';
        tdDesc.style.cssText = 'white-space:pre-wrap; text-align:left; padding:4px 8px;';
        tdDesc.textContent = result.desc || '';
        _makeDescEditable(tdDesc, result.charId, '아바타');

        tr.appendChild(tdName);
        tr.appendChild(tdAvatar);
        tr.appendChild(tdWeaponAvatarName);
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
 * - 칭호/외형칭호 2행을 캐릭터 단위로 묶고, 설명 칸은 rowspan=2로 합쳐 1개만 표시 (기본 화면과 동일)
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
        /* 슬롯 열 너비 조정 */
        .search-table-custom th:nth-child(2),
        .search-table-custom td:nth-child(2) {
            min-width: 80px;
        }
    `;
    document.head.appendChild(style);

    // thead
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

    const tbody = document.createElement('tbody');

    // 캐릭터별로 그룹화 (charId 기준 — 동명이인 구분)
    const charOrder = [];
    const groupedResults = {};
    results.forEach(result => {
        const key = result.charId;
        if (!groupedResults[key]) {
            groupedResults[key] = [];
            charOrder.push(key);
        }
        groupedResults[key].push(result);
    });

    charOrder.forEach(charId => {
        const charResults = groupedResults[charId];

        // 칭호 행 / 외형칭호 행 분리
        const titleResult      = charResults.find(r => r.slotType === '칭호')      || charResults[0];
        const appTitleResult   = charResults.find(r => r.slotType === '외형칭호')  || null;
        const charKey = `${titleResult.job}(${titleResult.name})`;

        // ── 칭호 행 ──────────────────────────────────────────────
        const trTitle = document.createElement('tr');

        // 직업/이름: 칭호+외형칭호 2행 합치기
        const tdName = document.createElement('td');
        tdName.rowSpan = appTitleResult ? 2 : 1;
        tdName.style.cssText = 'white-space:nowrap; vertical-align:middle;';
        tdName.textContent = charKey;
        trTitle.appendChild(tdName);

        const buildDataCells = (result, tr) => {
            const rarityClass = result.rarity ? `rare-${result.rarity}` : '';
            const embClass = getEmblemHighlight('칭호', result.emb1, result.eleType);

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

            tr.appendChild(tdSlot);
            tr.appendChild(tdRarity);
            tr.appendChild(tdItem);
            tr.appendChild(tdEmb1);
            tr.appendChild(tdEmb2);
            tr.appendChild(tdEnchant);
            tr.appendChild(tdEnchantVal);
        };

        buildDataCells(titleResult, trTitle);

        // 설명: 칭호 행에서만 생성, 외형칭호가 있으면 rowspan=2로 합침
        const tdDesc = document.createElement('td');
        tdDesc.rowSpan = appTitleResult ? 2 : 1;
        tdDesc.dataset.descCell = 'true';
        tdDesc.style.cssText = 'white-space:pre-wrap; text-align:left; padding:4px 8px; vertical-align:middle;';
        tdDesc.textContent = titleResult.desc || '';
        _makeDescEditable(tdDesc, titleResult.charId, '칭호');
        trTitle.appendChild(tdDesc);

        tbody.appendChild(trTitle);

        // ── 외형칭호 행 (설명 td 없음 — 위에서 rowspan으로 합침) ──
        if (appTitleResult) {
            const trApp = document.createElement('tr');
            buildDataCells(appTitleResult, trApp);
            // 설명 td는 추가하지 않음 (칭호 행의 rowspan=2 셀이 커버)
            tbody.appendChild(trApp);
        }
    });

    table.appendChild(tbody);

    container.innerHTML = '';
    container.appendChild(table);

    // 설명 편집 버튼 토글 (칭호 행의 설명 td에만 적용)
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
                    <span class="creature-art-text ${topRarity ? 'bg-'+topRarity : ''}">${topText || '-'}</span>
                </div>
                <div class="creature-art-item">
                    <span class="creature-art-rarity ${bg1 ? 'bg-'+bg1 : ''}">${bg1 || '-'}</span>
                    <span class="creature-art-text ${bg1 ? 'bg-'+bg1 : ''}">${opt1 || '-'}</span>
                </div>
                <div class="creature-art-item">
                    <span class="creature-art-rarity ${bg2 ? 'bg-'+bg2 : ''}">${bg2 || '-'}</span>
                    <span class="creature-art-text ${bg2 ? 'bg-'+bg2 : ''}">${opt2 || '-'}</span>
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
        tdCreatureName.textContent = result.name || '-';

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

    // thead — 메모/태그 헤더에 각각 ✏️ 토글 버튼 (설명 칸과 동일한 패턴)
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>직업/이름</th>
            <th>메모 <button id="memoEditToggleBtn" title="메모 편집" style="background:#4a5abb;color:#fff;border:none;border-radius:4px;padding:1px 6px;cursor:pointer;font-size:11px;margin-left:4px;">✏️</button></th>
            <th>태그 <button id="tagEditToggleBtn" title="태그 편집" style="background:#4a5abb;color:#fff;border:none;border-radius:4px;padding:1px 6px;cursor:pointer;font-size:11px;margin-left:4px;">✏️</button></th>
        </tr>
    `;
    table.appendChild(thead);

    // tbody — 각 행 생성
    const tbody = document.createElement('tbody');
    results.forEach(result => {
        tbody.appendChild(_createMemoTagRow(result));
    });
    table.appendChild(tbody);

    container.innerHTML = '';
    container.appendChild(table);

    // 메모 토글 버튼 초기화
    _initMemoToggleBtn(table, '#memoEditToggleBtn');
    // 태그 토글 버튼 초기화
    _initTagToggleBtn(table, '#tagEditToggleBtn');
}

/**
 * 메모/태그 행 생성 (표시 전용 — 편집은 헤더 토글 버튼으로 활성화)
 */
function _createMemoTagRow(result) {
    const tr = document.createElement('tr');
    tr.dataset.charId = result.charId;

    // [0] 직업/이름
    const tdName = document.createElement('td');
    tdName.style.cssText = 'white-space:nowrap; vertical-align:middle; padding:6px 8px;';
    tdName.textContent = `${result.job}(${result.name})`;

    // [1] 메모 — 클릭 편집 이벤트 등록
    const tdMemo = document.createElement('td');
    tdMemo.dataset.memoCell = 'true';
    tdMemo.dataset.charId = result.charId;
    tdMemo.style.cssText = 'vertical-align:top; padding:6px 8px; min-width:260px; white-space:pre-wrap; word-break:break-all;';
    tdMemo.style.color = result.memo ? '#ddd' : '#666';
    tdMemo.style.fontStyle = result.memo ? 'normal' : 'italic';
    tdMemo.textContent = result.memo || '(메모 없음)';
    _makeMemoEditable(tdMemo);

    // [2] 태그 — 클릭 편집 이벤트 등록
    const tdTags = document.createElement('td');
    tdTags.dataset.tagCell = 'true';
    tdTags.dataset.charId = result.charId;
    tdTags.style.cssText = 'vertical-align:middle; padding:6px 8px; min-width:140px;';
    _renderTagChipsInCell(tdTags, result.tags || []);

    tr.appendChild(tdName);
    tr.appendChild(tdMemo);
    tr.appendChild(tdTags);
    return tr;
}

/**
 * 메모 헤더 토글 버튼 초기화 (설명 칸의 _initDescToggleBtn과 동일한 패턴)
 */
function _initMemoToggleBtn(table, btnSelector) {
    const btn = table.querySelector(btnSelector);
    if (!btn) return;
    let editMode = false;

    btn.addEventListener('click', () => {
        editMode = !editMode;
        btn.style.background = editMode ? '#25c2a0' : '#4a5abb';
        btn.title = editMode ? '메모 편집 종료' : '메모 편집';

        table.querySelectorAll('tbody td[data-memo-cell="true"]').forEach(td => {
            td.dataset.memoEditMode = editMode ? 'on' : 'off';
            td.style.cursor = editMode ? 'text' : 'default';
            td.title = editMode ? '클릭하여 메모 편집' : '';
            if (editMode) {
                td.style.outline = '1px solid #4a5abb';
                td.style.background = 'rgba(74,91,187,0.15)';
            } else {
                td.style.outline = '';
                td.style.background = '';
                // 열려있는 textarea blur 처리
                const ta = td.querySelector('textarea');
                if (ta) ta.blur();
            }
        });
    });
}

/**
 * 태그 헤더 토글 버튼 초기화
 * 토글 ON → 즉시 모든 태그 셀에 편집 UI 표시
 * 토글 OFF → 편집 UI 닫고 칩 표시 복원
 */
function _initTagToggleBtn(table, btnSelector) {
    const btn = table.querySelector(btnSelector);
    if (!btn) return;
    let editMode = false;

    btn.addEventListener('click', () => {
        editMode = !editMode;
        btn.style.background = editMode ? '#25c2a0' : '#4a5abb';
        btn.title = editMode ? '태그 편집 종료' : '태그 편집';

        table.querySelectorAll('tbody td[data-tag-cell="true"]').forEach(td => {
            td.dataset.tagEditMode = editMode ? 'on' : 'off';
            if (editMode) {
                _insertTagEditUI(td);
            } else {
                const charId = td.dataset.charId;
                const tags = (typeof AppState !== 'undefined' && AppState.charTags?.[charId]) || [];
                td.innerHTML = '';
                td.style.cssText = 'vertical-align:middle; padding:6px 8px; min-width:140px; cursor:default;';
                td.title = '';
                _renderTagChipsInCell(td, tags);
            }
        });
    });
}

/**
 * 메모 td 클릭 시 textarea로 편집 (설명 칸의 _makeDescEditable과 동일한 패턴)
 */
function _makeMemoEditable(td) {
    td.addEventListener('click', () => {
        if (td.dataset.memoEditMode !== 'on') return;
        if (td.querySelector('textarea')) return; // 이미 편집 중

        const charId = td.dataset.charId;
        const rect = td.getBoundingClientRect();
        const tdW = rect.width;
        const tdH = Math.max(rect.height, 60);

        const currentVal = td.dataset.memoVal !== undefined ? td.dataset.memoVal : td.textContent.replace('(메모 없음)', '');

        const ta = document.createElement('textarea');
        ta.value = currentVal;
        ta.placeholder = '메모를 입력하세요...';
        ta.style.cssText = `width:${tdW}px; height:${tdH}px; min-height:${tdH}px; background:#1a2040; color:#fff; border:1px solid #4a5abb; border-radius:3px; padding:4px; box-sizing:border-box; font-size:inherit; font-family:inherit; resize:vertical; display:block;`;

        ta.addEventListener('blur', () => {
            const newVal = ta.value;
            td.dataset.memoVal = newVal;
            td.style.cssText = 'vertical-align:top; padding:6px 8px; min-width:260px; white-space:pre-wrap; word-break:break-all; cursor:text; outline:1px solid #4a5abb; background:rgba(74,91,187,0.15);';
            td.style.color = newVal ? '#ddd' : '#666';
            td.style.fontStyle = newVal ? 'normal' : 'italic';
            td.title = '클릭하여 메모 편집';
            td.textContent = newVal || '(메모 없음)';

            // 캐릭터 관리 탭 반영
            if (charId) {
                const section = document.getElementById(charId);
                if (section) {
                    const memoEl = section.querySelector('[data-key="info_memo"]');
                    if (memoEl) memoEl.value = newVal;
                    if (typeof updateMemoPreview === 'function') updateMemoPreview(charId);
                }
                if (typeof autoSave === 'function') autoSave();
            }
        });

        ta.addEventListener('keydown', e => { if (e.key === 'Escape') ta.blur(); });

        td.innerHTML = '';
        td.style.padding = '0';
        td.title = '';
        td.appendChild(ta);
        ta.focus();
        ta.setSelectionRange(ta.value.length, ta.value.length);
    });
}

/**
 * 태그 td에 편집 UI 삽입 (토글 ON 즉시 호출)
 * 레이아웃: [기존 칩들(×삭제)] [입력창][+][💾]
 */
function _insertTagEditUI(td) {
    const charId = td.dataset.charId;
    let editingTags = [...((typeof AppState !== 'undefined' && AppState.charTags?.[charId]) || [])];

    td.innerHTML = '';
    td.style.cssText = 'vertical-align:top; padding:4px 6px; min-width:160px; outline:1px solid #4a5abb; background:rgba(74,91,187,0.15);';

    const editArea = document.createElement('div');
    editArea.className = 'tag-edit-area';

    // 칩 영역 (× 포함)
    const editChips = document.createElement('div');
    editChips.style.cssText = 'display:flex; flex-wrap:wrap; gap:4px; margin-bottom:4px; min-height:20px;';

    // 입력 행
    const inputRow = document.createElement('div');
    inputRow.style.cssText = 'display:flex; gap:3px; align-items:center;';
    const tagInput = document.createElement('input');
    tagInput.type = 'text';
    tagInput.placeholder = '#태그...';
    tagInput.style.cssText = 'flex:1; min-width:50px; background:#1a2040; color:#fff; border:1px solid #4a5abb; border-radius:4px; padding:2px 5px; font-size:inherit; box-sizing:border-box;';
    const addBtn = document.createElement('button');
    addBtn.textContent = '+';
    addBtn.style.cssText = 'background:#25c2a0;color:#fff;border:none;border-radius:4px;padding:2px 7px;cursor:pointer;font-weight:bold;flex-shrink:0;';
    inputRow.appendChild(tagInput);
    inputRow.appendChild(addBtn);

    editArea.appendChild(editChips);
    editArea.appendChild(inputRow);
    td.appendChild(editArea);

    const renderEditChips = () => {
        editChips.innerHTML = '';
        if (editingTags.length === 0) {
            const empty = document.createElement('span');
            empty.style.cssText = 'color:#555; font-style:italic; font-size:11px;';
            empty.textContent = '(태그 없음)';
            editChips.appendChild(empty);
        }
        editingTags.forEach((tag, idx) => {
            const chip = document.createElement('span');
            chip.style.cssText = 'background:#2a3158; color:#e6e9ff; border-radius:12px; padding:2px 7px; font-size:12px; display:inline-flex; align-items:center; gap:3px;';
            const lbl = document.createElement('span');
            lbl.textContent = tag;
            const del = document.createElement('span');
            del.textContent = '×';
            del.style.cssText = 'cursor:pointer; font-weight:bold; color:#ff8080; line-height:1;';
            del.onclick = () => { editingTags.splice(idx, 1); syncTags(); renderEditChips(); };
            chip.appendChild(lbl);
            chip.appendChild(del);
            editChips.appendChild(chip);
        });
        tagInput.disabled = editingTags.length >= 3;
        addBtn.disabled = editingTags.length >= 3;
        tagInput.style.opacity = editingTags.length >= 3 ? '0.4' : '1';
    };
    renderEditChips();

    // 태그 변경 시 즉시 저장
    const syncTags = () => {
        if (typeof AppState !== 'undefined' && AppState.charTags) {
            AppState.charTags[charId] = [...editingTags];
        }
        const section = document.getElementById(charId);
        if (section) {
            const tagContainer = document.getElementById(`${charId}_tags`);
            if (tagContainer) {
                tagContainer.innerHTML = '';
                editingTags.forEach(tag => {
                    if (typeof createTagChip === 'function') {
                        tagContainer.appendChild(createTagChip(tag, charId));
                    }
                });
            }
        }
        if (typeof autoSave === 'function') autoSave();
    };

    const addTag = () => {
        let val = tagInput.value.trim();
        if (!val) return;
        if (editingTags.length >= 3) { alert('태그는 최대 3개까지 추가할 수 있습니다.'); return; }
        if (!val.startsWith('#')) val = '#' + val;
        if (editingTags.includes(val)) { alert('이미 존재하는 태그입니다.'); return; }
        editingTags.push(val);
        tagInput.value = '';
        syncTags();
        renderEditChips();
    };

    addBtn.addEventListener('click', addTag);
    tagInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
    });
}

/**
 * 태그 칩을 td에 직접 렌더링 (표시 전용)
 */
function _renderTagChipsInCell(td, tags) {
    const existing = td.querySelector('.tag-chips-wrap');
    if (existing) existing.remove();

    if (!tags || tags.length === 0) {
        const empty = document.createElement('span');
        empty.style.cssText = 'color:#666; font-style:italic; font-size:12px;';
        empty.textContent = '(태그 없음)';
        td.appendChild(empty);
        return;
    }
    const wrap = document.createElement('div');
    wrap.className = 'tag-chips-wrap';
    wrap.style.cssText = 'display:flex; flex-wrap:wrap; gap:4px;';
    tags.forEach(tag => {
        const chip = document.createElement('span');
        chip.style.cssText = 'background:#2a3158; color:#e6e9ff; border-radius:12px; padding:2px 10px; font-size:12px;';
        chip.textContent = tag;
        wrap.appendChild(chip);
    });
    td.appendChild(wrap);
}

/**
 * 봉인 옵션 반환 (슬롯/n1|n2 기준)
 */
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

        // 자동입력 상태 확인 (칭호/외형칭호, 오라, 크리쳐)
        if ((slot === '칭호' || slot === '외형칭호' || slot === '오라' || slot === '크리쳐') && charId) {
            const section = document.getElementById(charId);
            if (section) {
                let isAutoDesc = false;

                if (slot === '칭호' || slot === '외형칭호') {
                    const titleBtn = section.querySelector('button[data-key="칭호_itemname"]');
                    if (titleBtn) {
                        const titleName = titleBtn.getAttribute('data-title-name') || '';
                        const titleInfo = (typeof GameData !== 'undefined' && GameData.TITLE_ITEM_INFO)
                            ? GameData.TITLE_ITEM_INFO[titleName]
                            : null;
                        isAutoDesc = !!(titleInfo?.info || titleInfo?.desc);
                    }
                } else if (slot === '오라') {
                    const auraBtn = section.querySelector('button[data-key="오라_itemname"]');
                    if (auraBtn) {
                        const auraName = auraBtn.getAttribute('data-aura-name') || '';
                        const auraInfo = (typeof GameData !== 'undefined' && GameData.AURA_ITEM_INFO)
                            ? GameData.AURA_ITEM_INFO[auraName]
                            : null;
                        isAutoDesc = !!(auraInfo?.info || auraInfo?.desc);
                    }
                } else if (slot === '크리쳐') {
                    const creatureBtn = section.querySelector('button[data-creature-btn]');
                    if (creatureBtn) {
                        const setAuto = creatureBtn.getAttribute('data-creature-setauto') || 'false';
                        isAutoDesc = (setAuto === 'true');
                    }
                }

                if (isAutoDesc) {
                    // 자동입력 상태일 때 수정 불가 알림
                    alert('자동입력된 설명은 수정할 수 없습니다.\n\n팝업에서 아이템 이름을 직접 입력하면 수정 가능합니다.');
                    return;
                }
            }
        }

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
            if (charId && slot) _applyDescToDOM(charId, slot, newVal);
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
 * 설명 변경 결과를 실제 상세입력 DOM에 반영 + autoSave
 */
function _applyDescToDOM(charId, slot, descVal) {
    const section = document.getElementById(charId);
    if (!section) return;

    const descEl = section.querySelector(`[data-key="${slot}_desc"]`);
    if (descEl) descEl.value = descVal;

    if (typeof autoSave === 'function') autoSave();
}

/**
 * 그룹 슬롯 전체 테이블 렌더링 (방어구/악세서리/특수장비)
 * 모든 캐릭터의 해당 슬롯들을 한 테이블에 표시
 * 구조: 직업/이름(rowspan) | 슬롯 | 희귀도 | 익시드 | 접두어 | 아이템명 | 강화 | 봉인×2 | 엠블렘×2 | 마법부여×2 | 설명(rowspan)
 */
function _renderGroupSlotTabs(groupName, slotList) {
    const container = document.getElementById('searchResultContent');
    const sections  = document.querySelectorAll('.char-section');

    // 그룹별 setsMap 매핑
    const GROUP_SETS_MAP = {
        "방어구":   armorSets,
        "악세서리": accSets,
        "특수장비": specialSets
    };
    const setsMap = GROUP_SETS_MAP[groupName] || {};

    const wrapper = document.createElement('div');
    wrapper.style.overflowX = 'auto';
    wrapper.style.webkitOverflowScrolling = 'touch';

    const table = document.createElement('table');
    table.className = 'compare-table search-result-table search-table-custom';
    table.style.tableLayout = 'auto';
    table.style.width = 'auto';
    table.style.fontWeight = '900';

    // thead
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th rowspan="2">직업/이름</th>
            <th rowspan="2">슬롯</th>
            <th colspan="5">기본 정보</th>
            <th colspan="4">마법봉인</th>
            <th colspan="2">엠블렘</th>
            <th colspan="2">마법부여</th>
            <th rowspan="2" class="desc-col">설명 <button class="grp-desc-toggle-btn" style="background:#4a5abb;color:#fff;border:none;border-radius:4px;padding:1px 6px;cursor:pointer;font-size:11px;margin-left:4px;">✏️</button></th>
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

    const tbody = document.createElement('tbody');

    sections.forEach(section => {
        const charId   = section.id;
        const job      = section.querySelector('[data-key="info_job"]')?.value  || '미정';
        const name     = section.querySelector('[data-key="info_name"]')?.value || '이름없음';
        const statType = section.querySelector('[data-key="info_stat_type"]')?.value || '';
        const eleType  = section.querySelector('[data-key="info_ele_type"]')?.value  || '';
        const rowCount = slotList.length;

        // 세트 정보 수집: setCounts = { 세트명: 개수 }
        const { setCounts } = getActiveSetSlots(section, slotList, setsMap);
        // 2개 이상인 세트만 추출 (1개는 표시 안 함)
        const setLines = Object.entries(setCounts)
            .filter(([, cnt]) => cnt >= 2)
            .sort((a, b) => b[1] - a[1])  // 개수 많은 순
            .map(([setName, cnt]) => ({ setName, cnt }));

        slotList.forEach((slot, idx) => {
            const slotData = getSlotDataForSearch(section, slot);
            const result   = { charId, job, name, statType, eleType, ...slotData };

            const tr = document.createElement('tr');
            tr.dataset.charId = charId;
            tr.dataset.slot   = slot;

            // 첫 슬롯에만 직업/이름 td 추가 (rowspan)
            if (idx === 0) {
                const tdName = document.createElement('td');
                tdName.rowSpan = rowCount;
                tdName.style.cssText = 'white-space:nowrap; vertical-align:middle; border-bottom:2px solid var(--border-heavy, #555); padding: 4px 8px;';

                // 직업/이름 텍스트
                const nameDiv = document.createElement('div');
                nameDiv.textContent = `${job}(${name})`;
                tdName.appendChild(nameDiv);

                // 세트 정보 (2개 이상인 세트만 표시)
                setLines.forEach(({ setName, cnt }) => {
                    const setDiv = document.createElement('div');
                    setDiv.style.cssText = 'font-size:11px; color:#71D2E5; margin-top:3px; white-space:nowrap;';
                    setDiv.textContent = `${setName} ${cnt}세트`;
                    tdName.appendChild(setDiv);
                });

                tr.appendChild(tdName);
            }

            // 슬롯명 td
            const tdSlot = document.createElement('td');
            tdSlot.style.whiteSpace = 'nowrap';
            tdSlot.style.color = '#ffd700';
            tdSlot.textContent = slot;
            tr.appendChild(tdSlot);

            // 희귀도 ~ 마법부여 수치 (createSearchResultRow와 동일 로직)
            const rarityClass  = result.rarity ? `rare-${result.rarity}` : '';
            const exceedClass  = result.exceed ? `ex-${result.exceed}`   : '';

            let prefixClass = '';
            if (result.prefix) {
                if (result.prefix.startsWith('T')) {
                    prefixClass = 'prefix-tier';
                } else {
                    prefixClass = 'prefix-selected';
                }
            }

            const seal1Class = getSealHighlight(slot, result.seal1, statType, eleType, true);
            const seal2Class = getSealHighlight(slot, result.seal2, statType, eleType, false);
            const embClass   = getEmblemHighlight(slot, result.emb1, eleType);

            const dataCells = [
                { cls: rarityClass,  text: result.rarity      || '' },
                { cls: exceedClass,  text: result.exceed      || '' },
                { cls: prefixClass,  text: result.prefix      || '' },
                { cls: '',           text: result.itemname    || '' },
                { cls: '',           text: result.reinforce   || '' },
                { cls: seal1Class,   text: result.seal1       || '' },
                { cls: seal1Class,   text: result.seal1_val   || '' },
                { cls: seal2Class,   text: result.seal2       || '' },
                { cls: seal2Class,   text: result.seal2_val   || '' },
                { cls: embClass,     text: result.emb1        || '' },
                { cls: embClass,     text: result.emb2        || '' },
                { cls: '',           text: result.enchant     || '' },
                { cls: '',           text: result.enchant_val || '' },
            ];

            dataCells.forEach(({ cls, text }) => {
                const td = document.createElement('td');
                if (cls) td.className = cls;
                td.textContent = text;
                tr.appendChild(td);
            });

            // 설명 td: 첫 슬롯에만 rowspan으로 합치기
            if (idx === 0) {
                const tdDesc = document.createElement('td');
                tdDesc.rowSpan = rowCount;
                tdDesc.dataset.descCell = 'true';
                tdDesc.style.cssText = 'white-space:pre-wrap; text-align:left; padding:4px 8px; vertical-align:middle; border-bottom:2px solid var(--border-heavy, #555);';
                // 설명은 첫 슬롯(상의 등) 기준으로 표시
                tdDesc.textContent = result.desc || '';
                _makeDescEditable(tdDesc, charId, slot);
                tr.appendChild(tdDesc);
            }

            // 캐릭터 구분선: 마지막 슬롯 행에 두꺼운 아래 테두리
            if (idx === rowCount - 1) {
                tr.style.borderBottom = '2px solid var(--border-heavy, #555)';
            }

            tbody.appendChild(tr);
        });
    });

    table.appendChild(tbody);
    wrapper.appendChild(table);
    container.innerHTML = '';
    container.appendChild(wrapper);

    // 설명 편집 버튼 토글
    _initDescToggleBtn(table, '.grp-desc-toggle-btn');
}

console.log("✅ mode-search.js 로드 완료");