// ============================================
// mode-compare.js - 비교 모드 진입점
// ============================================
// ※ 로드 순서:
//   1. mode-compare-utils.js  (공통 헬퍼)
//   2. mode-compare-eq.js     (장비 비교)
//   3. mode-compare-stat.js   (스탯 비교)
//   4. mode-compare-all.js    (전체 비교)
//   5. mode-compare.js        (진입점 - 이 파일)
// ============================================

// ============================================
// 모드 전환 함수
// ============================================

function switchToBasicMode() {
    document.getElementById('characterContainer').style.display = 'block';
    document.getElementById('compareCharSelectionContainer').style.display = 'none';
    document.getElementById('compareContainer').style.display = 'none';
    document.getElementById('compareTabBar').style.display = 'none';
    document.getElementById('searchContainer').style.display = 'none';
    document.getElementById('btnBasicMode').classList.add('active');
    document.getElementById('btnCompareMode').classList.remove('active');
    document.getElementById('btnSearchMode').classList.remove('active');
    const btnFilter = document.getElementById('btnFilter');
    if (btnFilter) { btnFilter.disabled = false; btnFilter.style.opacity = ''; btnFilter.style.cursor = ''; }
    const btnAdd    = document.getElementById('btnAddCharacter');
    const btnLock   = document.getElementById('btnLockAll');
    const btnUnlock = document.getElementById('btnUnlockAll');
    if (btnAdd)    { btnAdd.disabled    = false; btnAdd.style.opacity    = ''; btnAdd.style.cursor    = ''; }
    if (btnLock)   { btnLock.disabled   = false; btnLock.style.opacity   = ''; btnLock.style.cursor   = ''; }
    if (btnUnlock) { btnUnlock.disabled = false; btnUnlock.style.opacity = ''; btnUnlock.style.cursor = ''; }
    if (typeof closeRuneModal === 'function') closeRuneModal();
    if (typeof closeHistoryModal === 'function') closeHistoryModal();
}

function enterCompareMode() {
    const sections = document.querySelectorAll('.char-section');
    if (sections.length === 0) { alert("비교할 캐릭터가 없습니다."); return; }

    document.getElementById('characterContainer').style.display = 'none';
    document.getElementById('compareCharSelectionContainer').style.display = 'block';
    document.getElementById('compareContainer').style.display = 'none';
    document.getElementById('compareTabBar').style.display = 'none';
    document.getElementById('searchContainer').style.display = 'none';
    document.getElementById('btnBasicMode').classList.remove('active');
    document.getElementById('btnCompareMode').classList.add('active');
    document.getElementById('btnSearchMode').classList.remove('active');

    if (typeof closeFilterPanel === 'function') closeFilterPanel();
    const btnFilter = document.getElementById('btnFilter');
    if (btnFilter) { btnFilter.disabled = true; btnFilter.style.opacity = '0.4'; btnFilter.style.cursor = 'not-allowed'; }
    const btnAdd    = document.getElementById('btnAddCharacter');
    const btnLock   = document.getElementById('btnLockAll');
    const btnUnlock = document.getElementById('btnUnlockAll');
    if (btnAdd)    { btnAdd.disabled    = true; btnAdd.style.opacity    = '0.4'; btnAdd.style.cursor    = 'not-allowed'; }
    if (btnLock)   { btnLock.disabled   = true; btnLock.style.opacity   = '0.4'; btnLock.style.cursor   = 'not-allowed'; }
    if (btnUnlock) { btnUnlock.disabled = true; btnUnlock.style.opacity = '0.4'; btnUnlock.style.cursor = 'not-allowed'; }

    const selectLeft  = document.getElementById('compareCharacterSelectLeft');
    const selectRight = document.getElementById('compareCharacterSelectRight');
    selectLeft.innerHTML  = '<option value="">캐릭터 선택...</option>';
    selectRight.innerHTML = '<option value="">캐릭터 선택...</option>';
    AppState.compareSelection = { left: null, right: null };

    const charList = [];
    sections.forEach(section => {
        const charId = section.id;
        const job    = section.querySelector('[data-key="info_job"]')?.value  || '미정';
        const name   = section.querySelector('[data-key="info_name"]')?.value || '이름없음';
        const stat   = section.querySelector('[data-key="info_stat_type"]')?.value || '';
        const ele    = section.querySelector('[data-key="info_ele_type"]')?.value  || '';
        charList.push({ charId, displayName: `${job}(${name})`, stat, ele });
    });

    const addOption   = (sel, id, text) => { const o = document.createElement('option'); o.value = id; o.textContent = text; sel.appendChild(o); };
    const addDisabled = (sel, text) => { const o = document.createElement('option'); o.disabled = true; o.textContent = text; o.style.color = '#ffd700'; o.style.fontWeight = 'bold'; sel.appendChild(o); };

    ['힘', '지능'].forEach(stat => {
        let added = false;
        ['화속강', '수속강', '명속강', '암속강'].forEach(ele => {
            const matched = charList.filter(c => c.stat === stat && c.ele === ele);
            if (!matched.length) return;
            if (!added) { addDisabled(selectLeft, ''); addDisabled(selectRight, ''); addDisabled(selectLeft, `── ${stat} ──`); addDisabled(selectRight, `── ${stat} ──`); added = true; }
            addDisabled(selectLeft, `  ${ele}`); addDisabled(selectRight, `  ${ele}`);
            matched.forEach(({ charId, displayName }) => { addOption(selectLeft, charId, `    ${displayName}`); addOption(selectRight, charId, `    ${displayName}`); });
        });
    });
    const others = charList.filter(c => !c.stat && !c.ele);
    if (others.length > 0) {
        addDisabled(selectLeft, '── 기타 ──'); addDisabled(selectRight, '── 기타 ──');
        others.forEach(({ charId, displayName }) => { addOption(selectLeft, charId, `  ${displayName}`); addOption(selectRight, charId, `  ${displayName}`); });
    }

    selectLeft.addEventListener('change', (e) => {
        AppState.compareSelection.left = e.target.value || null;
        if (AppState.compareSelection.left && AppState.compareSelection.right) displayComparison();
        else document.getElementById('compareContainer').style.display = 'none';
    });
    selectRight.addEventListener('change', (e) => {
        AppState.compareSelection.right = e.target.value || null;
        if (AppState.compareSelection.left && AppState.compareSelection.right) displayComparison();
        else document.getElementById('compareContainer').style.display = 'none';
    });
}

function displayComparison() {
    document.getElementById('compareCharSelectionContainer').style.display = 'block';
    document.getElementById('compareContainer').style.display = 'block';
    document.getElementById('compareTabBar').style.display = 'block';

    const section1 = document.getElementById(AppState.compareSelection.left);
    const section2 = document.getElementById(AppState.compareSelection.right);

    const job1   = section1.querySelector('[data-key="info_job"]')?.value   || '미정';
    const name1  = section1.querySelector('[data-key="info_name"]')?.value  || '이름없음';
    const power1 = section1.querySelector('[data-key="info_power"]')?.value || '-';
    const job2   = section2.querySelector('[data-key="info_job"]')?.value   || '미정';
    const name2  = section2.querySelector('[data-key="info_name"]')?.value  || '이름없음';
    const power2 = section2.querySelector('[data-key="info_power"]')?.value || '-';

    const dn1 = `${job1}(${name1}) / ${power1}`;
    const dn2 = `${job2}(${name2}) / ${power2}`;

    // 장비 비교 탭
    const containerEq = document.getElementById('compareContentEq');
    containerEq.innerHTML = '';
    [buildEquipmentCompare, buildSealCompare, buildSealCompare, buildEmblemCompare, buildEnchantCompare].forEach((fn, i) => {
        containerEq.appendChild(i === 1 ? fn(section1, section2, dn1, dn2, true) : i === 2 ? fn(section1, section2, dn1, dn2, false) : fn(section1, section2, dn1, dn2));
    });

    // 스탯 비교 탭
    const containerStat = document.getElementById('compareContentStat');
    containerStat.innerHTML = '';

    const navBtnWrap = document.createElement('div');
    navBtnWrap.style.cssText = 'display:flex;gap:8px;margin-top:16px;margin-bottom:16px;flex-wrap:wrap;';
    ['방어구 비교', '악세서리 비교', '특수장비 비교'].forEach((label, i) => {
        const targetId = ['cmp-stat-armor', 'cmp-stat-acc', 'cmp-stat-special'][i];
        const btn = document.createElement('button');
        btn.textContent = label;
        btn.style.cssText = 'padding:6px 16px;background:#2a3158;color:#e6e9ff;border:1px solid #4a5178;border-radius:4px;cursor:pointer;font-size:0.85em;';
        btn.onmouseenter = () => btn.style.borderColor = '#ffd700';
        btn.onmouseleave = () => btn.style.borderColor = '#4a5178';
        btn.onclick = () => { const el = document.getElementById(targetId); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
        navBtnWrap.appendChild(btn);
    });
    containerStat.appendChild(navBtnWrap);

    containerStat.appendChild(buildTotalStatCompare(section1, section2, dn1, dn2));
    containerStat.appendChild(buildWeaponStatCompare(section1, section2, dn1, dn2));
    const armorEl = buildArmorStatCompare(section1, section2, dn1, dn2); armorEl.id = 'cmp-stat-armor'; containerStat.appendChild(armorEl);
    containerStat.appendChild(buildArmorSetEffectCompare(section1, section2, dn1, dn2));
    const accEl = buildAccStatCompare(section1, section2, dn1, dn2); accEl.id = 'cmp-stat-acc'; containerStat.appendChild(accEl);
    containerStat.appendChild(buildAccSetEffectCompare(section1, section2, dn1, dn2));
    const specialEl = buildSpecialStatCompare(section1, section2, dn1, dn2); specialEl.id = 'cmp-stat-special'; containerStat.appendChild(specialEl);
    containerStat.appendChild(buildSpecialSetEffectCompare(section1, section2, dn1, dn2));

    switchCompareTab('stat');
}

// ============================================
// 비교 모드 탭 전환
// ============================================

function switchCompareTab(tab) {
    const isEq = tab === 'eq', isStat = tab === 'stat', isAll = tab === 'all';
    document.getElementById('compareContentEq').style.display   = isEq   ? 'block' : 'none';
    document.getElementById('compareContentStat').style.display = isStat ? 'block' : 'none';
    document.getElementById('compareContentAll').style.display  = isAll  ? 'block' : 'none';

    const tabEq = document.getElementById('compareTabEq'), tabStat = document.getElementById('compareTabStat'), tabAll = document.getElementById('compareTabAll');
    if (tabEq)   { tabEq.style.borderBottomColor   = isEq   ? '#ffd700' : 'transparent'; tabEq.style.color   = isEq   ? '#ffd700' : '#888'; }
    if (tabStat) { tabStat.style.borderBottomColor = isStat ? '#ffd700' : 'transparent'; tabStat.style.color = isStat ? '#ffd700' : '#888'; }
    if (tabAll)  { tabAll.style.borderBottomColor  = isAll  ? '#ffd700' : 'transparent'; tabAll.style.color  = isAll  ? '#ffd700' : '#888'; }

    if (isAll) {
        const container = document.getElementById('compareContentAll');
        if (!container._rendered) { container._rendered = true; buildAllItemsCompare(container); }
    }
    if (isEq) {
        const containerEq = document.getElementById('compareContentEq');
        setTimeout(() => {
            containerEq.querySelectorAll('.compare-section-wrapper').forEach(wrapper => {
                if (wrapper._tables) syncRowHeights(wrapper._tables.leftTable, wrapper._tables.centerTable, wrapper._tables.rightTable);
            });
        }, 50);
    }
}

const CompareTable = {};

console.log("✅ mode-compare.js 로드 완료");