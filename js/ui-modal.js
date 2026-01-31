// ============================================
// ui-modal.js - 모달 관련 기능
// ============================================

/**
 * 히스토리 모달 열기
 */
function openHistoryModal() {
    const listEl = document.getElementById('historyList');
    if (AppState.changeHistory.length === 0) {
        listEl.innerHTML = "변경 기록이 없습니다.";
    } else {
        listEl.innerHTML = AppState.changeHistory.map(h =>
            `<div style="border-bottom:1px solid #333; padding:5px 0;">
                <span style="color:var(--gold)">[${h.time}]</span> 
                <b>${h.charName}</b> - ${h.slot}: <br>
                ${getSpanWithColor(h.old)} → ${getSpanWithColor(h.new)}
            </div>`
        ).join('');
    }
    document.getElementById('modalOverlay').style.display = 'block';
    document.getElementById('historyModal').style.display = 'block';
}

/**
 * 히스토리 모달 닫기
 */
function closeHistoryModal() {
    document.getElementById('modalOverlay').style.display = 'none';
    document.getElementById('historyModal').style.display = 'none';
}