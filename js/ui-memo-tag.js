// ============================================
// ui-memo-tag.js - 메모/태그 기능
// ============================================

/**
 * 태그 추가
 */
function addTag(charId) {
    const section = document.getElementById(charId);
    const input = section.querySelector('input[data-key="info_tag_input"]');
    const tagText = input.value.trim();

    if (!tagText) return;

    // # 자동 추가
    const tag = tagText.startsWith('#') ? tagText : '#' + tagText;

    // 태그 컨테이너
    const container = document.getElementById(`${charId}_tags`);

    // 중복 체크
    const existingTags = Array.from(container.querySelectorAll('.tag-chip'))
        .map(chip => chip.dataset.tag);
    if (existingTags.includes(tag)) {
        alert('이미 존재하는 태그입니다.');
        return;
    }

    // 태그 칩 생성
    const chip = createTagChip(tag, charId);
    container.appendChild(chip);

    // 입력 필드 초기화
    input.value = '';

    // 데이터 저장
    saveTags(charId);
    autoSave();
}

/**
 * 태그 칩 HTML 생성
 */
function createTagChip(tag, charId) {
    const chip = document.createElement('div');
    chip.className = 'tag-chip';
    chip.dataset.tag = tag;

    // 태그 타입별 색상
    const tagType = getTagType(tag);
    if (tagType) {
        chip.dataset.tagType = tagType;
    }

    chip.innerHTML = `
        <span>${tag}</span>
        <span class="tag-remove" onclick="removeTag('${charId}', '${escapeQuotes(tag)}')">×</span>
    `;

    return chip;
}

/**
 * 따옴표 이스케이프 (XSS 방지)
 */
function escapeQuotes(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

/**
 * 태그 타입 판별 (색상 지정용)
 */
function getTagType(tag) {
    const tagLower = tag.toLowerCase();
    if (tagLower.includes('레이드')) return '레이드';
    if (tagLower.includes('pvp')) return 'PVP';
    if (tagLower.includes('육성')) return '육성';
    if (tagLower.includes('메인')) return '메인';
    if (tagLower.includes('서브')) return '서브';
    return null;
}

/**
 * 태그 제거
 */
function removeTag(charId, tag) {
    const container = document.getElementById(`${charId}_tags`);
    const chip = Array.from(container.querySelectorAll('.tag-chip'))
        .find(c => c.dataset.tag === tag);

    if (chip) {
        chip.remove();
        saveTags(charId);
        autoSave();
    }
}

/**
 * Enter 키로 태그 추가
 */
function handleTagInput(event, charId) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addTag(charId);
    }
}

/**
 * 태그 데이터 저장 (AppState에)
 */
function saveTags(charId) {
    const container = document.getElementById(`${charId}_tags`);
    const tags = Array.from(container.querySelectorAll('.tag-chip'))
        .map(chip => chip.dataset.tag);

    // AppState에 저장
    AppState.charTags[charId] = tags;
}

/**
 * 태그 복원 (데이터 로드 시)
 */
function loadTags(charId) {
    if (!AppState.charTags || !AppState.charTags[charId]) return;

    const container = document.getElementById(`${charId}_tags`);
    if (!container) return;

    container.innerHTML = '';

    AppState.charTags[charId].forEach(tag => {
        const chip = createTagChip(tag, charId);
        container.appendChild(chip);
    });
}

/**
 * 태그별 필터링 (추후 확장 기능)
 */
function filterByTag(tag) {
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

/**
 * 모든 태그 목록 가져오기 (추후 확장 기능)
 */
function getAllTags() {
    const allTags = new Set();
    Object.values(AppState.charTags || {}).forEach(tags => {
        tags.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).sort();
}

console.log("✅ ui-memo-tag.js 로드 완료");