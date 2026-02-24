// ============================================
// ui-memo-tag.js - 메모/태그 기능
// ============================================

/**
 * 메모/설명/태그 변경 사항을 changeHistory에 기록
 */
function _recordMemoTagHistory(charId, slot, oldVal, newVal) {
    if (!AppState || typeof AppState.changeHistory === 'undefined') return;
    if (oldVal === newVal) return;

    const section = document.getElementById(charId);
    const charName = section?.querySelector('[data-key="info_name"]')?.value || '이름없음';
    const timeStr = (typeof getCurrentDateTime === 'function') ? getCurrentDateTime() : new Date().toLocaleString();

    AppState.changeHistory.unshift({
        time: timeStr,
        charName: charName,
        slot: slot,
        old: oldVal === '' ? '(빈칸)' : oldVal,
        new: newVal === '' ? '(빈칸)' : newVal
    });
    if (AppState.changeHistory.length > 10) AppState.changeHistory.pop();
    AppState.saveHistory();
    AppState.updateSnapshot();
}

// ============================================
// 팝업 설정 (여기서 한 번에 관리)
// ============================================

// 메모 팝업 설정
const MEMO_POPUP = {
    // 팝업 모달 크기/스타일
    width:        '350px',
    background:   '#1a1a1a',
    border:       '3px solid #ffd700',
    borderRadius: '8px',
    padding:      '15px',
    boxShadow:    '0 8px 32px rgba(0, 0, 0, 0.9)',
    zIndex:       '1000',

    // 입력창 (편집 모드)
    textareaHeight:     '120px',
    textareaBg:         '#0a0a0a',
    textareaBorder:     '2px solid #444',
    textareaFontSize:   '13px',

    // 읽기전용 div (잠금 모드)
    readonlyMinHeight:  '120px',
    readonlyMaxHeight:  '200px',  // 이 높이 초과 시 스크롤
    readonlyBg:         '#0a0a0a',
    readonlyBorder:     '2px solid #333',
};

// 설명 팝업 설정
const DESC_POPUP = {
    // 팝업 모달 크기/스타일
    width:        '350px',
    background:   '#1a1a1a',
    border:       '3px solid #ffd700',
    borderRadius: '8px',
    padding:      '15px',
    boxShadow:    '0 8px 32px rgba(0, 0, 0, 0.9)',
    zIndex:       '1000',

    // 입력창 (편집 모드)
    textareaHeight:     '100px',
    textareaBg:         '#0a0a0a',
    textareaBorder:     '2px solid #444',
    textareaFontSize:   '13px',

    // 읽기전용 div (잠금 모드)
    readonlyMinHeight:  '60px',
    readonlyMaxHeight:  '200px',  // 이 높이 초과 시 스크롤
    readonlyBg:         '#0a0a0a',
    readonlyBorder:     '2px solid #333',
};

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

    // 히스토리 기록
    _recordMemoTagHistory(charId, '태그', '(이전)', tag + ' 추가');

    autoSave();
}

/**
 * 태그 칩 HTML 생성
 */
function createTagChip(tag, charId) {
    const chip = document.createElement('div');
    chip.className = 'tag-chip';
    chip.dataset.tag = tag;
    chip.style.cursor = 'default';

    // 태그 타입별 색상
    const tagType = getTagType(tag);
    if (tagType) {
        chip.dataset.tagType = tagType;
    }

    chip.innerHTML = `
        <span>${tag}</span>
        <span class="tag-remove" style="cursor: pointer;" onclick="removeTag('${charId}', '${escapeQuotes(tag)}'); event.stopPropagation();">×</span>
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

        // 히스토리 기록
        _recordMemoTagHistory(charId, '태그', tag + ' 삭제', '(이후)');

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

    // 잠금 상태 체크
    const lockBtn = section.querySelector('.lock-btn');
    const isLocked = lockBtn?.classList.contains('btn-active');

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
    modal.style.position    = 'absolute';
    modal.style.background  = MEMO_POPUP.background;
    modal.style.border      = MEMO_POPUP.border;
    modal.style.borderRadius= MEMO_POPUP.borderRadius;
    modal.style.padding     = MEMO_POPUP.padding;
    modal.style.width       = MEMO_POPUP.width;
    modal.style.boxShadow   = MEMO_POPUP.boxShadow;
    modal.style.zIndex      = MEMO_POPUP.zIndex;

    if (isLocked) {
        // 잠금 상태: 읽기 전용
        modal.innerHTML = `
            <div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #444;">
                <span style="font-weight: bold; color: #ffd700; font-size: 14px;">📝 메모</span>
                <span style="color: #888; font-size: 12px; margin-left: 8px;">${charName}</span>
                <span style="color: #f90; font-size: 11px; margin-left: 8px;">🔒 잠금</span>
            </div>
            <div style="width: 100%; min-height: ${MEMO_POPUP.readonlyMinHeight}; max-height: ${MEMO_POPUP.readonlyMaxHeight}; overflow-y: auto; padding: 10px;
                       background: ${MEMO_POPUP.readonlyBg}; color: #fff; border: ${MEMO_POPUP.readonlyBorder};
                       border-radius: 4px; font-size: ${MEMO_POPUP.textareaFontSize}; line-height: 1.5;
                       box-sizing: border-box; margin-bottom: 10px; white-space: pre-wrap; word-break: break-word;">${currentMemo || '(메모 없음)'}</div>
            <div style="display: flex; gap: 8px;">
                <button class="btn-action" style="background:var(--btn-secondary); padding: 8px 20px; font-size: 13px;" onclick="closeMemoModal()">닫기</button>
            </div>
        `;
    } else {
        modal.innerHTML = `
            <div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #444;">
                <span style="font-weight: bold; color: #ffd700; font-size: 14px;">📝 메모</span>
                <span style="color: #888; font-size: 12px; margin-left: 8px;">${charName}</span>
            </div>
            <textarea 
                id="memoModalTextarea" 
                placeholder="메모를 입력하세요..."
                style="width: 100%; height: ${MEMO_POPUP.textareaHeight}; resize: vertical; padding: 10px;
                       background: ${MEMO_POPUP.textareaBg}; color: #fff; border: ${MEMO_POPUP.textareaBorder};
                       border-radius: 4px; font-size: ${MEMO_POPUP.textareaFontSize}; line-height: 1.5;
                       font-family: inherit; box-sizing: border-box; margin-bottom: 10px;">${currentMemo}</textarea>
            <div style="display: flex; gap: 8px;">
                <button class="btn-action" style="background:var(--btn-success); padding: 8px 20px; font-size: 13px;" onclick="saveMemoFromModal()">💾 저장</button>
                <button class="btn-action" style="background:var(--btn-secondary); padding: 8px 20px; font-size: 13px;" onclick="closeMemoModal()">닫기</button>
            </div>
        `;
    }

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

    // textarea에 포커스 (잠금 아닐 때만)
    if (!isLocked) {
        setTimeout(() => {
            document.getElementById('memoModalTextarea').focus();
        }, 100);
    }
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
        const oldVal = memoTextarea.value;
        const newVal = modalTextarea.value;
        memoTextarea.value = newVal;
        updateMemoPreview(currentMemoCharId);

        // 히스토리 기록
        _recordMemoTagHistory(currentMemoCharId, '메모', oldVal, newVal);

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

// ============================================
// 설명칸 팝업 기능
// ============================================

let currentDescInput = null;

/**
 * 설명칸 팝업 열기
 */
function openDescModal(inputEl) {
    // 해당 캐릭터 섹션 찾기
    const section = inputEl.closest('.char-section');
    const isLocked = section?.querySelector('.lock-btn')?.classList.contains('btn-active');
    const currentVal = inputEl.value || '';

    currentDescInput = inputEl;

    // 기존 모달 제거
    const existingModal = document.getElementById('descModal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'descModal';
    modal.style.position    = 'absolute';
    modal.style.background  = DESC_POPUP.background;
    modal.style.border      = DESC_POPUP.border;
    modal.style.borderRadius= DESC_POPUP.borderRadius;
    modal.style.padding     = DESC_POPUP.padding;
    modal.style.width       = DESC_POPUP.width;
    modal.style.boxShadow   = DESC_POPUP.boxShadow;
    modal.style.zIndex      = DESC_POPUP.zIndex;

    if (isLocked) {
        modal.innerHTML = `
            <div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #444;">
                <span style="font-weight: bold; color: #ffd700; font-size: 14px;">📋 설명</span>
                <span style="color: #f90; font-size: 11px; margin-left: 8px;">🔒 잠금</span>
            </div>
            <div style="width: 100%; min-height: ${DESC_POPUP.readonlyMinHeight}; max-height: ${DESC_POPUP.readonlyMaxHeight}; overflow-y: auto; padding: 10px;
                       background: ${DESC_POPUP.readonlyBg}; color: #fff; border: ${DESC_POPUP.readonlyBorder};
                       border-radius: 4px; font-size: ${DESC_POPUP.textareaFontSize}; line-height: 1.5;
                       box-sizing: border-box; margin-bottom: 10px; white-space: pre-wrap; word-break: break-word;">${currentVal || '(설명 없음)'}</div>
            <div style="display: flex; gap: 8px;">
                <button class="btn-action" style="background:var(--btn-secondary); padding: 8px 20px; font-size: 13px;" onclick="closeDescModal()">닫기</button>
            </div>
        `;
    } else {
        modal.innerHTML = `
            <div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #444;">
                <span style="font-weight: bold; color: #ffd700; font-size: 14px;">📋 설명</span>
            </div>
            <textarea 
                id="descModalTextarea" 
                placeholder="설명을 입력하세요..."
                style="width: 100%; height: ${DESC_POPUP.textareaHeight}; resize: vertical; padding: 10px;
                       background: ${DESC_POPUP.textareaBg}; color: #fff; border: ${DESC_POPUP.textareaBorder};
                       border-radius: 4px; font-size: ${DESC_POPUP.textareaFontSize}; line-height: 1.5;
                       font-family: inherit; box-sizing: border-box; margin-bottom: 10px;">${currentVal}</textarea>
            <div style="display: flex; gap: 8px;">
                <button class="btn-action" style="background:var(--btn-success); padding: 8px 20px; font-size: 13px;" onclick="saveDescFromModal()">💾 저장</button>
                <button class="btn-action" style="background:var(--btn-secondary); padding: 8px 20px; font-size: 13px;" onclick="closeDescModal()">닫기</button>
            </div>
        `;
    }

    // 일단 body에 붙여서 실제 크기 측정
    modal.style.visibility = 'hidden';
    document.body.appendChild(modal);

    const rect = inputEl.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const modalW = modal.offsetWidth;
    const modalH = modal.offsetHeight;
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;

    // 기본: input 아래, input 왼쪽 정렬
    let top = rect.bottom + scrollTop + 5;
    let left = rect.left + scrollLeft;

    // 오른쪽 벗어나면 왼쪽으로 당기기
    if (rect.left + modalW > viewW) {
        left = scrollLeft + viewW - modalW - 10;
    }

    // 아래 벗어나면 input 위로 올리기
    if (rect.bottom + modalH + 5 > viewH) {
        top = rect.top + scrollTop - modalH - 5;
    }

    // 화면 왼쪽 밖으로 나가면 보정
    if (left < scrollLeft + 5) {
        left = scrollLeft + 5;
    }

    modal.style.top = top + 'px';
    modal.style.left = left + 'px';
    modal.style.visibility = 'visible';

    if (!isLocked) {
        setTimeout(() => {
            const ta = document.getElementById('descModalTextarea');
            if (ta) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }
        }, 100);
    }
}

/**
 * 설명칸 저장
 */
function saveDescFromModal() {
    const ta = document.getElementById('descModalTextarea');
    if (currentDescInput && ta) {
        const section = currentDescInput.closest('.char-section');
        const charId = section?.id;
        const oldVal = currentDescInput.value;
        const newVal = ta.value;

        currentDescInput.value = newVal;

        // 히스토리 기록
        if (charId) _recordMemoTagHistory(charId, '설명', oldVal, newVal);

        autoSave();
    }
    closeDescModal();
}

/**
 * 설명칸 모달 닫기
 */
function closeDescModal() {
    const modal = document.getElementById('descModal');
    if (modal) modal.remove();
    currentDescInput = null;
}

console.log("✅ ui-memo-tag.js 로드 완료");