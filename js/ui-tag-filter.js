// ============================================
// ui-tag-filter.js - 태그 필터링 + 빠른버튼 + 자동완성
// ============================================

// ============================================
// 1. 태그 필터링
// ============================================

let currentFilterTag = '';  // 현재 필터 상태

/**
 * 태그로 필터링
 */
function filterByTag(tag) {
    currentFilterTag = tag;
    const sections = document.querySelectorAll('.char-section');

    sections.forEach(section => {
        const charId = section.id;
        const tags = AppState.charTags?.[charId] || [];

        if (tag === '' || tags.includes(tag)) {
            section.style.display = '';
        } else {
            section.style.display = 'none';
        }
    });
}

// ============================================
// 2. 태그 필터 팝업 패널
// ============================================

/**
 * 태그 필터 패널 열기/닫기
 */
function toggleTagFilterPanel() {
    const existing = document.getElementById('tagFilterPanel');
    if (existing) {
        existing.remove();
        document.getElementById('btnTagFilter').classList.remove('active');
        return;
    }

    document.getElementById('btnTagFilter').classList.add('active');
    showTagFilterPanel();
}

/**
 * 태그 필터 패널 생성
 */
function showTagFilterPanel() {
    const panel = document.createElement('div');
    panel.id = 'tagFilterPanel';

    // 패널 스타일
    panel.style.cssText = `
        position: fixed;
        top: 50px;
        left: 50%;
        transform: translateX(-50%);
        background: #1a1a1a;
        border: 2px solid #ffd700;
        border-radius: 8px;
        padding: 16px;
        z-index: 1000;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
        min-width: 300px;
        max-width: 600px;
    `;

    // 태그 수집
    const allTags = getAllTagsWithCount();

    // 팝업 내용 구성
    let buttonsHTML = '';

    // 전체보기 버튼
    buttonsHTML += `
        <button 
            class="tag-filter-btn ${currentFilterTag === '' ? 'tag-filter-active' : ''}"
            onclick="applyTagFilter('')"
            style="padding: 7px 16px; margin: 4px; font-size: 13px; font-weight: bold;
                   background: ${currentFilterTag === '' ? '#ffd700' : 'rgba(255,255,255,0.1)'};
                   color: ${currentFilterTag === '' ? '#000' : '#fff'};
                   border: 2px solid ${currentFilterTag === '' ? '#ffd700' : '#555'};
                   border-radius: 20px; cursor: pointer; transition: all 0.2s;">
            전체보기 (${document.querySelectorAll('.char-section').length})
        </button>
    `;

    // 태그별 버튼
    allTags.forEach(({ tag, count }) => {
        const isActive = currentFilterTag === tag;
        const color = getTagDisplayColor(tag);
        buttonsHTML += `
            <button 
                onclick="applyTagFilter('${escapeQuotes(tag)}')"
                style="padding: 7px 16px; margin: 4px; font-size: 13px; font-weight: bold;
                       background: ${isActive ? color : 'rgba(255,255,255,0.08)'};
                       color: ${isActive ? '#fff' : color};
                       border: 2px solid ${color};
                       border-radius: 20px; cursor: pointer; transition: all 0.2s;">
                ${tag} (${count})
            </button>
        `;
    });

    if (allTags.length === 0) {
        buttonsHTML += `<div style="color: #888; padding: 10px; text-align: center;">태그가 없습니다</div>`;
    }

    panel.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <span style="font-weight: bold; color: #ffd700; font-size: 15px;">🏷️ 태그 필터</span>
            <button onclick="closeTagFilterPanel()" 
                    style="background: transparent; border: none; color: #fff; font-size: 20px; cursor: pointer; padding: 0;">×</button>
        </div>
        <div style="display: flex; flex-wrap: wrap;">
            ${buttonsHTML}
        </div>
    `;

    document.body.appendChild(panel);
}

/**
 * 태그 필터 적용 + 패널 닫기
 */
function applyTagFilter(tag) {
    filterByTag(tag);
    closeTagFilterPanel();

    // 태그 버튼 활성화 표시
    const btn = document.getElementById('btnTagFilter');
    if (btn) {
        if (tag === '') {
            btn.classList.remove('active');
            btn.style.background = '';
        } else {
            btn.classList.add('active');
            btn.style.background = '#ffd700';
            btn.style.color = '#000';
        }
    }
}

/**
 * 태그 필터 패널 닫기
 */
function closeTagFilterPanel() {
    const panel = document.getElementById('tagFilterPanel');
    if (panel) panel.remove();

    const btn = document.getElementById('btnTagFilter');
    if (btn && currentFilterTag === '') {
        btn.classList.remove('active');
        btn.style.background = '';
        btn.style.color = '';
    }
}

/**
 * 태그별 캐릭터 수 포함 목록
 */
function getAllTagsWithCount() {
    const tagCounts = {};

    Object.values(AppState.charTags || {}).forEach(tags => {
        tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
    });

    return Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([tag, count]) => ({ tag, count }));
}

/**
 * 태그 색상
 */
function getTagDisplayColor(tag) {
    const t = tag.toLowerCase();
    if (t.includes('레이드')) return '#ff5252';
    if (t.includes('pvp'))   return '#448aff';
    if (t.includes('육성')) return '#40c057';
    if (t.includes('메인')) return '#ffd700';
    if (t.includes('서브')) return '#888';
    return '#667eea';
}

// ============================================
// 3. 태그 자동완성
// ============================================

/**
 * 자동완성 표시
 */
function showTagAutocomplete(charId, inputValue) {
    removeTagAutocomplete();

    if (!inputValue || inputValue.length < 1) return;

    const searchTerm = inputValue.replace('#', '').toLowerCase();
    const allTags = getAllTagsWithCount();
    const matched = allTags.filter(({ tag }) =>
        tag.toLowerCase().includes(searchTerm)
    );

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
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.8);
        z-index: 2000;
        max-height: 200px;
        overflow-y: auto;
        min-width: 150px;
    `;

    const rect = input.getBoundingClientRect();
    const scrollTop  = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    panel.style.top  = (rect.bottom + scrollTop + 2) + 'px';
    panel.style.left = (rect.left + scrollLeft) + 'px';

    matched.forEach(({ tag, count }) => {
        const item = document.createElement('div');
        item.style.cssText = `
            padding: 8px 12px; cursor: pointer; transition: background 0.1s;
            border-left: 3px solid ${getTagDisplayColor(tag)};
            display: flex; justify-content: space-between; align-items: center;
        `;
        item.innerHTML = `
            <span style="color: white; font-size: 13px;">${tag}</span>
            <span style="color: #888; font-size: 11px;">${count}개</span>
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

/**
 * 자동완성 제거
 */
function removeTagAutocomplete() {
    const panel = document.getElementById('tagAutocompletePanel');
    if (panel) panel.remove();
    document.removeEventListener('click', closeAutocompleteOnClickOutside);
}

function closeAutocompleteOnClickOutside(e) {
    const panel = document.getElementById('tagAutocompletePanel');
    const inputs = document.querySelectorAll('input[data-key="info_tag_input"]');
    let inside = false;
    inputs.forEach(input => { if (input.contains(e.target)) inside = true; });
    if (panel && !panel.contains(e.target) && !inside) {
        removeTagAutocomplete();
    }
}

// ============================================
// 키보드 네비게이션
// ============================================

let autocompleteIndex = -1;

function handleAutocompleteKeyboard(event, charId) {
    const panel = document.getElementById('tagAutocompletePanel');
    if (!panel) return;

    const items = panel.querySelectorAll('div');
    if (items.length === 0) return;

    if (event.key === 'ArrowDown') {
        event.preventDefault();
        autocompleteIndex = Math.min(autocompleteIndex + 1, items.length - 1);
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        autocompleteIndex = Math.max(autocompleteIndex - 1, -1);
    } else if (event.key === 'Enter' && autocompleteIndex >= 0) {
        event.preventDefault();
        items[autocompleteIndex].click();
        return;
    } else if (event.key === 'Escape') {
        removeTagAutocomplete();
        return;
    }

    items.forEach((item, i) => {
        item.style.background = i === autocompleteIndex ? 'rgba(255,215,0,0.3)' : 'transparent';
    });
}

console.log("✅ ui-tag-filter.js 로드 완료");
