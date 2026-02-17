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

// ============================================
// 메모 모달 기능
// ============================================

let currentMemoCharId = null;

/**
 * 메모 모달 열기 (라벨 클릭 시)
 */
function openMemoModal(charId) {
    const section = document.getElementById(charId);

    // 잠금 상태 체크 (조용히 무시)
    const lockBtn = section.querySelector('.lock-btn');
    const isLocked = lockBtn?.classList.contains('btn-active');

    if (isLocked) {
        return;  // 그냥 아무것도 안 함
    }

    currentMemoCharId = charId;
    const charName = section.querySelector('[data-key="info_job"]')?.value || '미정';
    const memoTextarea = section.querySelector('[data-key="info_memo"]');
    const currentMemo = memoTextarea?.value || '';

    // 기존 모달이 있으면 제거
    const existingModal = document.getElementById('memoModal');
    if (existingModal) {
        existingModal.remove();
    }

    // 모달 생성
    const modal = document.createElement('div');
    modal.id = 'memoModal';
    modal.className = 'memo-popup';

    // 인라인 스타일 직접 추가
    modal.style.position = 'absolute';
    modal.style.background = '#1a1a1a';
    modal.style.border = '3px solid #ffd700';
    modal.style.borderRadius = '8px';
    modal.style.padding = '15px';
    modal.style.width = '350px';
    modal.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.9)';
    modal.style.zIndex = '1000';

    modal.innerHTML = `
        <div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #444;">
            <span style="font-weight: bold; color: #ffd700; font-size: 14px;">📝 메모</span>
            <span style="color: #888; font-size: 12px; margin-left: 8px;">${charName}</span>
        </div>
        <textarea 
            id="memoModalTextarea" 
            placeholder="메모를 입력하세요..."
            style="width: 100%; height: 120px; resize: vertical; padding: 10px;
                   background: #0a0a0a; color: #fff; border: 2px solid #444;
                   border-radius: 4px; font-size: 13px; line-height: 1.5;
                   font-family: inherit; box-sizing: border-box; margin-bottom: 10px;">${currentMemo}</textarea>
        <div style="display: flex; gap: 8px;">
            <button class="btn-action" style="background:var(--btn-success); padding: 8px 20px; font-size: 13px;" onclick="saveMemoFromModal()">💾 저장</button>
            <button class="btn-action" style="background:var(--btn-secondary); padding: 8px 20px; font-size: 13px;" onclick="closeMemoModal()">닫기</button>
        </div>
    `;

    // 메모 미리보기 위치 찾기
    const memoPreview = document.getElementById(`${charId}_memo_preview`);
    if (memoPreview) {
        const rect = memoPreview.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        // 미리보기 바로 아래에 배치
        modal.style.top = (rect.bottom + scrollTop + 5) + 'px';
        modal.style.left = (rect.left + scrollLeft) + 'px';
    }

    document.body.appendChild(modal);

    // textarea에 포커스
    setTimeout(() => {
        document.getElementById('memoModalTextarea').focus();
    }, 100);
}

/**
 * 메모 모달에서 저장
 */
function saveMemoFromModal() {
    if (!currentMemoCharId) return;

    const section = document.getElementById(currentMemoCharId);
    const memoTextarea = section.querySelector('[data-key="info_memo"]');
    const modalTextarea = document.getElementById('memoModalTextarea');

    // 메모 저장
    if (memoTextarea && modalTextarea) {
        memoTextarea.value = modalTextarea.value;
        updateMemoPreview(currentMemoCharId);
        autoSave();
    }

    closeMemoModal();
}

/**
 * 메모 모달 닫기
 */
function closeMemoModal() {
    const modal = document.getElementById('memoModal');
    if (modal) {
        modal.remove();
    }
    currentMemoCharId = null;
}

/**
 * 메모 미리보기 업데이트
 */
function updateMemoPreview(charId) {
    const section = document.getElementById(charId);
    const memoTextarea = section.querySelector('[data-key="info_memo"]');
    const previewDiv = document.getElementById(`${charId}_memo_preview`);

    if (!memoTextarea || !previewDiv) return;

    const memoText = memoTextarea.value.trim();

    if (memoText) {
        // 첫 줄만 가져오기 (줄바꿈 제거)
        const firstLine = memoText.split('\n')[0];
        // 10자까지만 표시
        const preview = firstLine.length > 10 ? firstLine.substring(0, 10) + '...' : firstLine;
        previewDiv.textContent = preview;
        previewDiv.style.color = '#fff';
        previewDiv.style.fontStyle = 'normal';
    } else {
        previewDiv.textContent = '(메모 없음)';
        previewDiv.style.color = '#aaa';
        previewDiv.style.fontStyle = 'italic';
    }
}

console.log("✅ ui-memo-tag.js 로드 완료");