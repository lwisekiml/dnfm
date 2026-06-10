// ============================================
// mode-tag-filter.js - 통합 필터 (태그 + 스탯 + 속강)
// ============================================

// ============================================
// 1. 필터 적용 공통 함수
// ============================================

/**
 * 태그 AND 스탯 AND 속강 세 조건을 평가해 캐릭터 섹션 표시/숨김
 */
function _applyFilters() {
    const tag  = UIState.filterTag  || '';
    const stat = UIState.filterStat || '';
    const ele  = UIState.filterEle  || '';
    const sections = document.querySelectorAll('.char-section');

    sections.forEach(section => {
        const charId = section.id;

        // 태그 조건
        const tagOk = (tag === '') || (AppState.charTags?.[charId] || []).includes(tag);

        // 스탯 조건 (힘/지능)
        let statOk = true;
        if (stat !== '') {
            const statVal = section.querySelector('select[data-key="info_stat_type"]')?.value || '';
            statOk = (statVal === stat);
        }

        // 속강 조건 (화/수/명/암속강)
        let eleOk = true;
        if (ele !== '') {
            const eleVal = section.querySelector('select[data-key="info_ele_type"]')?.value || '';
            eleOk = (eleVal === ele);
        }

        section.style.display = (tagOk && statOk && eleOk) ? '' : 'none';
    });
}

// ============================================
// 2. 통합 필터 패널
// ============================================

/**
 * 통합 필터 패널 열기/닫기
 */
function toggleFilterPanel() {
    const existing = document.getElementById('filterPanel');
    if (existing) {
        existing.remove();
        _updateFilterBtnState();
        return;
    }
    showFilterPanel();
}

// 하위 호환 별칭
function toggleTagFilterPanel()  { toggleFilterPanel(); }
function toggleStatFilterPanel() { toggleFilterPanel(); }

/**
 * 통합 필터 패널 닫기
 */
function closeFilterPanel() {
    const panel = document.getElementById('filterPanel');
    if (panel) panel.remove();
    _updateFilterBtnState();
}

// 하위 호환 별칭
function closeTagFilterPanel()  { closeFilterPanel(); }
function closeStatFilterPanel() { closeFilterPanel(); }

/**
 * 필터 버튼 활성화 상태 갱신
 */
function _updateFilterBtnState() {
    const btn = document.getElementById('btnFilter');
    if (!btn) return;
    const hasFilter = !!(UIState.filterTag || UIState.filterStat || UIState.filterEle);
    if (hasFilter) {
        btn.classList.add('active');
        btn.style.background = '#ffd700';
        btn.style.color = '#000';
    } else {
        btn.classList.remove('active');
        btn.style.background = '';
        btn.style.color = '';
    }
}

/**
 * 통합 필터 패널 생성
 */
function showFilterPanel() {
    const panel = document.createElement('div');
    panel.id = 'filterPanel';
    panel.style.cssText = `
        position: fixed;
        top: 50px;
        left: 50%;
        transform: translateX(-50%);
        background: #1a1a1a;
        border: 2px solid #ffd700;
        border-radius: 8px;
        padding: 18px 20px;
        z-index: 1000;
        box-shadow: 0 8px 32px rgba(0,0,0,0.8);
        min-width: 340px;
        max-width: 640px;
    `;

    // 패널 열릴 때 임시 상태 초기화 (적용 버튼 전까지 실제 필터 변경 안 함)
    let tempTag  = UIState.filterTag  || '';
    let tempStat = UIState.filterStat || '';
    let tempEle  = UIState.filterEle  || '';

    // ── 태그 목록 ──
    const allTags = getAllTagsWithCount();
    const totalChars = document.querySelectorAll('.char-section').length;

    const tagBtnsHTML = (() => {
        let html = `<button data-tag-btn="" style="${_filterBtnStyle(tempTag === '', '#ffd700', '#000')}">
            전체 (${totalChars})
        </button>`;
        allTags.forEach(({ tag, count }) => {
            const color = getTagDisplayColor(tag);
            html += `<button data-tag-btn="${_esc(tag)}" style="${_filterBtnStyle(tempTag === tag, color)}">
                ${tag} (${count})
            </button>`;
        });
        if (allTags.length === 0) {
            html += `<span style="color:#888;font-size:13px;padding:4px 8px;">태그가 없습니다</span>`;
        }
        return html;
    })();

    // ── 스탯/속강 목록 ──
    const sections = document.querySelectorAll('.char-section');
    const statCounts = { '힘': 0, '지능': 0 };
    const eleCounts  = { '화속강': 0, '수속강': 0, '명속강': 0, '암속강': 0 };
    sections.forEach(sec => {
        const sv = sec.querySelector('select[data-key="info_stat_type"]')?.value || '';
        const ev = sec.querySelector('select[data-key="info_ele_type"]')?.value  || '';
        if (statCounts[sv] !== undefined) statCounts[sv]++;
        if (eleCounts[ev]  !== undefined) eleCounts[ev]++;
    });

    const statGroup = [
        { label: '전체', value: '', color: '#ffd700' },
        { label: '힘',   value: '힘',   color: '#ff8c42' },
        { label: '지능', value: '지능', color: '#5bc0eb' },
    ];
    const eleGroup = [
        { label: '전체',   value: '', color: '#ffd700' },
        { label: '화속강', value: '화속강', color: '#ff5252' },
        { label: '수속강', value: '수속강', color: '#448aff' },
        { label: '명속강', value: '명속강', color: '#ffd700' },
        { label: '암속강', value: '암속강', color: '#b39ddb' },
    ];

    const makeStatBtn = (opt) => {
        const countStr = opt.value === '' ? `(${totalChars})` : `(${statCounts[opt.value] ?? 0})`;
        const isActive = tempStat === opt.value;
        const tc = opt.value === '' ? '#000' : '#fff';
        return `<button data-stat-btn="${opt.value}" style="${_filterBtnStyle(isActive, opt.color, tc)}">
            ${opt.label} ${countStr}
        </button>`;
    };
    const makeEleBtn = (opt) => {
        const countStr = opt.value === '' ? `(${totalChars})` : `(${eleCounts[opt.value] ?? 0})`;
        const isActive = tempEle === opt.value;
        const tc = opt.value === '' ? '#000' : '#fff';
        return `<button data-ele-btn="${opt.value}" style="${_filterBtnStyle(isActive, opt.color, tc)}">
            ${opt.label} ${countStr}
        </button>`;
    };

    panel.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
            <span style="font-weight:bold; color:#ffd700; font-size:15px;">🔍 필터</span>
            <button id="filterPanelCloseBtn"
                    style="background:transparent; border:none; color:#fff; font-size:20px; cursor:pointer; padding:0;">×</button>
        </div>

        <!-- 태그 섹션 -->
        <div style="font-size:12px; color:#aaa; margin-bottom:6px;">🏷️ 태그 <span style="color:#555; font-size:11px;">(1개 선택)</span></div>
        <div id="filterTagBtns" style="display:flex; flex-wrap:wrap; gap:2px; margin-bottom:14px;">
            ${tagBtnsHTML}
        </div>

        <hr style="border:none; border-top:1px solid #2a3158; margin:0 0 14px 0;">

        <!-- 스탯 섹션 -->
        <div style="font-size:12px; color:#aaa; margin-bottom:6px;">💪 스탯 <span style="color:#555; font-size:11px;">(1개 선택)</span></div>
        <div id="filterStatBtns" style="display:flex; flex-wrap:wrap; gap:2px; margin-bottom:14px;">
            ${statGroup.map(makeStatBtn).join('')}
        </div>

        <hr style="border:none; border-top:1px solid #2a3158; margin:0 0 14px 0;">

        <!-- 속강 섹션 -->
        <div style="font-size:12px; color:#aaa; margin-bottom:6px;">🌀 속강 <span style="color:#555; font-size:11px;">(1개 선택)</span></div>
        <div id="filterEleBtns" style="display:flex; flex-wrap:wrap; gap:2px; margin-bottom:16px;">
            ${eleGroup.map(makeEleBtn).join('')}
        </div>

        <!-- 버튼 행 -->
        <div style="display:flex; gap:8px; justify-content:flex-end;">
            <button id="filterResetBtn"
                    style="padding:7px 18px; background:#333; color:#aaa; border:1px solid #444;
                           border-radius:6px; cursor:pointer; font-size:13px;">초기화</button>
            <button id="filterApplyBtn"
                    style="padding:7px 22px; background:#ffd700; color:#000; border:none;
                           border-radius:6px; cursor:pointer; font-size:13px; font-weight:bold;">적용</button>
        </div>
    `;

    document.body.appendChild(panel);

    // ── 이벤트 바인딩 ──

    // 닫기
    panel.querySelector('#filterPanelCloseBtn').addEventListener('click', () => closeFilterPanel());

    // 태그 버튼 토글
    panel.querySelector('#filterTagBtns').addEventListener('click', e => {
        const btn = e.target.closest('button[data-tag-btn]');
        if (!btn) return;
        tempTag = btn.getAttribute('data-tag-btn');
        panel.querySelectorAll('button[data-tag-btn]').forEach(b => {
            const t = b.getAttribute('data-tag-btn');
            const color = t === '' ? '#ffd700' : getTagDisplayColor(t);
            const tc = t === '' ? '#000' : '#fff';
            b.style.cssText = _filterBtnStyle(t === tempTag, color, tc);
        });
    });

    // 스탯 버튼 토글
    panel.querySelector('#filterStatBtns').addEventListener('click', e => {
        const btn = e.target.closest('button[data-stat-btn]');
        if (!btn) return;
        tempStat = btn.getAttribute('data-stat-btn');
        panel.querySelectorAll('button[data-stat-btn]').forEach(b => {
            const v   = b.getAttribute('data-stat-btn');
            const opt = statGroup.find(o => o.value === v);
            if (!opt) return;
            const tc = v === '' ? '#000' : '#fff';
            b.style.cssText = _filterBtnStyle(v === tempStat, opt.color, tc);
        });
    });

    // 속강 버튼 토글
    panel.querySelector('#filterEleBtns').addEventListener('click', e => {
        const btn = e.target.closest('button[data-ele-btn]');
        if (!btn) return;
        tempEle = btn.getAttribute('data-ele-btn');
        panel.querySelectorAll('button[data-ele-btn]').forEach(b => {
            const v   = b.getAttribute('data-ele-btn');
            const opt = eleGroup.find(o => o.value === v);
            if (!opt) return;
            const tc = v === '' ? '#000' : '#fff';
            b.style.cssText = _filterBtnStyle(v === tempEle, opt.color, tc);
        });
    });

    // 초기화 (팝업 내 임시값만 초기화)
    panel.querySelector('#filterResetBtn').addEventListener('click', () => {
        tempTag  = '';
        tempStat = '';
        tempEle  = '';
        panel.querySelectorAll('button[data-tag-btn]').forEach(b => {
            const t = b.getAttribute('data-tag-btn');
            const color = t === '' ? '#ffd700' : getTagDisplayColor(t);
            const tc = t === '' ? '#000' : '#fff';
            b.style.cssText = _filterBtnStyle(t === '', color, tc);
        });
        panel.querySelectorAll('button[data-stat-btn]').forEach(b => {
            const v   = b.getAttribute('data-stat-btn');
            const opt = statGroup.find(o => o.value === v);
            if (!opt) return;
            const tc = v === '' ? '#000' : '#fff';
            b.style.cssText = _filterBtnStyle(v === '', opt.color, tc);
        });
        panel.querySelectorAll('button[data-ele-btn]').forEach(b => {
            const v   = b.getAttribute('data-ele-btn');
            const opt = eleGroup.find(o => o.value === v);
            if (!opt) return;
            const tc = v === '' ? '#000' : '#fff';
            b.style.cssText = _filterBtnStyle(v === '', opt.color, tc);
        });
    });

    // 적용
    panel.querySelector('#filterApplyBtn').addEventListener('click', () => {
        UIState.filterTag  = tempTag;
        UIState.filterStat = tempStat;
        UIState.filterEle  = tempEle;
        _applyFilters();
        closeFilterPanel();
        _updateFilterBtnState();
    });
}

// ── 스타일 헬퍼 ──
function _filterBtnStyle(isActive, color, activeTextColor = '#fff') {
    return `padding:6px 14px; margin:3px; font-size:13px; font-weight:bold; cursor:pointer;
        border-radius:20px; border:2px solid ${color}; transition:all 0.15s;
        background:${isActive ? color : 'rgba(255,255,255,0.07)'};
        color:${isActive ? activeTextColor : color};`;
}
function _esc(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// ============================================
// 3. 하위 호환 함수
// ============================================

function filterByTag(tag) {
    UIState.filterTag = tag;
    _applyFilters();
    _updateFilterBtnState();
}

function filterByStat(value) {
    // 기존 단일 filterStat 값이 스탯인지 속강인지 판별해서 분기
    const statValues = ['힘', '지능'];
    const eleValues  = ['화속강', '수속강', '명속강', '암속강'];
    if (statValues.includes(value)) {
        UIState.filterStat = value;
    } else if (eleValues.includes(value)) {
        UIState.filterEle = value;
    } else {
        UIState.filterStat = '';
        UIState.filterEle  = '';
    }
    _applyFilters();
    _updateFilterBtnState();
}

// ============================================
// 4. 태그 목록 헬퍼
// ============================================

function getAllTagsWithCount() {
    const tagCounts = {};
    Object.values(AppState.charTags || {}).forEach(tags => {
        tags.forEach(tag => { tagCounts[tag] = (tagCounts[tag] || 0) + 1; });
    });
    return Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([tag, count]) => ({ tag, count }));
}

function getTagDisplayColor(tag) {
    const t = tag.toLowerCase();
    if (t.includes('레이드')) return '#ff5252';
    if (t.includes('pvp'))   return '#448aff';
    if (t.includes('육성'))  return '#40c057';
    if (t.includes('메인'))  return '#ffd700';
    if (t.includes('서브'))  return '#888';
    return '#667eea';
}

// ============================================
// 5. 태그 자동완성
// ============================================

function showTagAutocomplete(charId, inputValue) {
    removeTagAutocomplete();

    if (!inputValue || inputValue.length < 1) return;

    const searchTerm = inputValue.replace('#', '').toLowerCase();
    const allTags = getAllTagsWithCount();
    const matched = allTags.filter(({ tag }) => tag.toLowerCase().includes(searchTerm));

    if (matched.length === 0) return;

    const input = document.querySelector(`#${charId} input[data-key="info_tag_input"]`);
    if (!input) return;

    const panel = document.createElement('div');
    panel.id = 'tagAutocompletePanel';
    panel.style.cssText = `
        position: absolute;
        background: #1a1a1a;
        border: 2px solid #ffd700;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.8);
        z-index: 2000;
        max-height: 200px;
        overflow-y: auto;
        min-width: 150px;
    `;

    const rect     = input.getBoundingClientRect();
    const scrollTop  = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    panel.style.top  = (rect.bottom + scrollTop  + 2) + 'px';
    panel.style.left = (rect.left   + scrollLeft) + 'px';

    matched.forEach(({ tag, count }) => {
        const item = document.createElement('div');
        item.style.cssText = `
            padding: 8px 12px; cursor: pointer; transition: background 0.1s;
            border-left: 3px solid ${getTagDisplayColor(tag)};
            display: flex; justify-content: space-between; align-items: center;
        `;
        item.innerHTML = `
            <span style="color:white; font-size:13px;">${tag}</span>
            <span style="color:#888; font-size:11px;">${count}개</span>
        `;
        item.onmouseenter = () => item.style.background = 'rgba(255,215,0,0.15)';
        item.onmouseleave = () => item.style.background = 'transparent';
        item.onclick = () => {
            input.value = tag;
            addTag(charId);
            removeTagAutocomplete();
        };
        panel.appendChild(item);
    });

    document.body.appendChild(panel);

    setTimeout(() => {
        document.addEventListener('click', closeAutocompleteOnClickOutside);
    }, 100);
}

function removeTagAutocomplete() {
    const panel = document.getElementById('tagAutocompletePanel');
    if (panel) panel.remove();
    document.removeEventListener('click', closeAutocompleteOnClickOutside);
}

function closeAutocompleteOnClickOutside(e) {
    const panel  = document.getElementById('tagAutocompletePanel');
    const inputs = document.querySelectorAll('input[data-key="info_tag_input"]');
    let inside = false;
    inputs.forEach(input => { if (input.contains(e.target)) inside = true; });
    if (panel && !panel.contains(e.target) && !inside) {
        removeTagAutocomplete();
    }
}

// ============================================
// 6. 키보드 네비게이션
// ============================================

function handleAutocompleteKeyboard(event, charId) {
    const panel = document.getElementById('tagAutocompletePanel');
    if (!panel) return;

    const items = panel.querySelectorAll('div');
    if (items.length === 0) return;

    if (event.key === 'ArrowDown') {
        event.preventDefault();
        UIState.autocompleteIndex = Math.min(UIState.autocompleteIndex + 1, items.length - 1);
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        UIState.autocompleteIndex = Math.max(UIState.autocompleteIndex - 1, -1);
    } else if (event.key === 'Enter' && UIState.autocompleteIndex >= 0) {
        event.preventDefault();
        items[UIState.autocompleteIndex].click();
        return;
    } else if (event.key === 'Escape') {
        removeTagAutocomplete();
        return;
    }

    items.forEach((item, i) => {
        item.style.background = i === UIState.autocompleteIndex ? 'rgba(255,215,0,0.3)' : 'transparent';
    });
}

console.log("✅ mode-tag-filter.js 로드 완료");