// ============================================
// ui-character.js - 캐릭터 관리 UI (템플릿 리팩토링 완료)
// ============================================

/**
 * 캐릭터 테이블 생성 (템플릿 방식)
 */
function createCharacterTable(savedData = null) {
    // 1) 고유 ID 생성
    const charId = savedData?.id || "char_" + Date.now() + Math.random().toString(16).slice(2);

    // 2) 섹션 생성
    const section = document.createElement('div');
    section.className = 'char-section';
    section.id = charId;

    // 3) 룬 데이터 초기화
    AppState.charRuneData[charId] = savedData?.runeData || {
        runes: Array(20).fill().map(() => ({name: '', lv: '', skillLv: ''})),
        gakin: ['', '']
    };

    // ⭐ 태그 데이터 초기화 추가 (안전한 방식)
    if (!AppState.charTags) {
        AppState.charTags = {};  // 객체가 없으면 생성
    }
    if (savedData?.tags) {
        AppState.charTags[charId] = savedData.tags;
    }

    // 4) 테이블 기본 구조 생성
    section.innerHTML = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th rowspan="2" class="col-char-info">직업/이름</th>
                        <th rowspan="2" class="col-slot v-border-heavy">슬롯</th>
                        <th rowspan="2" class="col-rarity">희귀도</th>
                        <th rowspan="2" class="col-exceed">익시드</th>
                        <th rowspan="2" class="col-prefix">접두어 <button class="set-apply-btn" onclick="event.stopPropagation(); openPrefixMenuFromHeader(event, '${charId}')" tabindex="-1">🎯</button></th>
                        <th rowspan="2" style="min-width:120px;">아이템이름 <button class="set-apply-btn" onclick="event.stopPropagation(); openSetMenuFromHeader(event, '${charId}')" tabindex="-1">🎯</button></th>
                        <th rowspan="2" class="col-val-short">강화 <button class="set-apply-btn" onclick="event.stopPropagation(); openReinforceMenuFromHeader(event, '${charId}')" tabindex="-1">🎯</button></th>
                        <th colspan="4" class="group-header">마법봉인</th>
                        <th colspan="2" class="group-header">엠블렘</th>
                        <th colspan="2" class="group-header">마법부여</th>
                        <th rowspan="2" style="min-width:230px;" class="v-border-heavy">설명</th>
                    </tr>
                    <tr>
                        <th>고유 옵션</th>
                        <th class="col-val-short">수치</th>
                        <th>일반 옵션</th>
                        <th class="col-val-short">수치</th>
                        <th class="col-emblem">엠블렘</th>
                        <th class="col-emblem">엠블렘</th>
                        <th class="col-enchant">마법부여</th>
                        <th class="col-val-short">수치</th>
                    </tr>
                </thead>
                <tbody class="tbody-content"></tbody>
            </table>
        </div>`;

    const tbody = section.querySelector('.tbody-content');

    // 5) 각 슬롯별 행 생성 (템플릿 사용) ✅ 수정됨!
    slots.forEach((slot, index) => {
        // ✅ 슬롯 컨텐츠에서 <tr> 가져오기
        const slotFragment = createSlotContent(slot, index, charId, savedData);
        const tr = slotFragment.querySelector('tr');  // ✅ 템플릿의 <tr> 추출

        if (!tr) {
            console.error(`템플릿에서 <tr>을 찾을 수 없습니다: ${slot}`);
            return;
        }

        // ✅ 첫 번째 행: 캐릭터 정보 칸 추가
        if (index === 0) {
            const charInfoFragment = TemplateHelper.createCharacterInfo(charId);
            const charInfoCell = charInfoFragment.firstElementChild;  // <td>

            // ✅ tr의 맨 앞에 캐릭터 정보 td 삽입
            tr.insertBefore(charInfoCell, tr.firstChild);
        }

        // ✅ 테두리 적용
        if (heavyBorderSlots.includes(slot)) {
            tr.style.borderBottom = "2px solid var(--border-heavy)";
        }

        tbody.appendChild(tr);
    });

    // 6) 문서에 삽입
    document.getElementById('characterContainer').appendChild(section);
    updateRuneSummary(charId);

    // 7) 접두어 리스트 초기화
    initializePrefixSelects(section);

    // 8) 저장된 데이터 복구
    if (savedData) {
        restoreSavedData(section, savedData, charId);
    }

    // 9) 잠금 상태 설정
    toggleEdit(charId, savedData ? !!savedData.locked : false);
}

/**
 * 슬롯별 컨텐츠 생성 (템플릿 사용)
 */
function createSlotContent(slot, index, charId, savedData) {
    // 스킬룬
    if (slot === "스킬룬") {
        return TemplateHelper.createSkillRuneRow(charId);
    }

    // 크리쳐
    if (slot === "크리쳐") {
        return TemplateHelper.createCreatureRow();
    }

    // 칭호 (textarea 특수 처리)
    if (slot === "칭호") {
        return TemplateHelper.createTitleRow();
    }

    // 외형칭호 (설명 칸 없음)
    if (slot === "외형칭호") {
        return TemplateHelper.clone('appearance-title-row-template');
    }

    // 오라/아바타 (설명 칸 있음)
    if (["오라", "아바타"].includes(slot)) {
        return TemplateHelper.createSimpleRow(slot);
    }

    // 일반 장비
    const options = {
        emblemClass: TemplateHelper.getEmblemClass(slot),
        ...(!savedData ? TemplateHelper.getDefaultEnchant(slot) : {enchant: '', val: ''})
    };

    const equipRow = TemplateHelper.createEquipmentRow(slot, charId, options);

    // 마법봉인 옵션 동적 추가
    populateSealOptions(equipRow, slot, index);

    // 아이템 이름 필드 처리 (select vs input)
    handleItemNameField(equipRow, slot, charId);

    return equipRow;
}

/**
 * 마법봉인 옵션 채우기
 */
function populateSealOptions(rowFragment, slot, index) {
    let sealData = {n1: [], n2: []};

    if (slot === "무기") {
        sealData = GameData.sealData.weapon;
    } else if (index >= 1 && index <= 5) {
        sealData = GameData.sealData.armor;
    } else if (index >= 6 && index <= 8) {
        sealData = GameData.sealData.accessory;
    } else if (index >= 9 && index <= 11) {
        sealData = GameData.sealData.special;
    }

    // seal1 옵션 추가
    const seal1Select = rowFragment.querySelector(`select[data-key="${slot}_seal1"]`);
    if (seal1Select && sealData.n1.length > 0) {
        seal1Select.innerHTML = sealData.n1.map(opt => `<option>${opt}</option>`).join('');
    }

    // seal2 옵션 추가
    const seal2Select = rowFragment.querySelector(`select[data-key="${slot}_seal2"]`);
    if (seal2Select && sealData.n2.length > 0) {
        seal2Select.innerHTML = sealData.n2.map(opt => `<option>${opt}</option>`).join('');
    }
}

/**
 * 아이템 이름 필드 처리 (select/input 교체)
 */
function handleItemNameField(rowFragment, slot, charId) {
    const container = rowFragment.querySelector(`[data-key="${slot}_itemname"]`)?.parentElement;
    if (!container) return;

    const existingField = container.querySelector(`[data-key="${slot}_itemname"]`);
    if (!existingField) return;

    // itemOptions에 정의된 슬롯은 select로 변경
    if (itemOptions[slot]) {
        const select = document.createElement('select');
        select.setAttribute('data-key', `${slot}_itemname`);
        select.className = 'rare-에픽 itemname-color-sync';

        // 세트 체크 이벤트 추가
        const needsSetCheck = ["상의", "하의", "어깨", "벨트", "신발"].includes(slot);
        select.onchange = () => {
            if (needsSetCheck) checkArmorSetColor(charId);
            autoSave();
        };

        // 옵션 추가
        select.innerHTML = '<option value=""></option>' +
            itemOptions[slot].map(opt => `<option value="${opt}">${opt}</option>`).join('');

        existingField.replaceWith(select);
    }
}

/**
 * 접두어 select 초기화
 */
function initializePrefixSelects(section) {
    section.querySelectorAll('select[data-key$="_prefix"]').forEach(sel => {
        const slot = sel.getAttribute('data-slot');
        const raritySel = section.querySelector(`select[data-key="${slot}_rarity"]`);

        updateStyle(sel, 'prefix', true);

        if (raritySel) {
            updateStyle(raritySel, 'rarity', true);
        }
    });
}

/**
 * 저장된 데이터 복구
 */
function restoreSavedData(section, savedData, charId) {
    // 1) 희귀도 먼저 설정
    const rarityInputs = section.querySelectorAll('select[data-key$="_rarity"]');
    rarityInputs.forEach(el => {
        const key = el.getAttribute('data-key');
        if (savedData.inputs?.[key]) {
            el.value = savedData.inputs[key].val;
            updateStyle(el, 'rarity', true);
        }
    });

    // 2) 모든 입력값 복구
    const inputs = section.querySelectorAll('input[data-key], select[data-key], textarea[data-key]');
    inputs.forEach(el => {
        const key = el.getAttribute('data-key');
        const data = savedData.inputs?.[key];

        if (!data || key.endsWith('_rarity')) return;

        el.value = data.val;

        // 크리쳐 아티팩트 배경색 동기화
        if (key.includes('_art_') && key.includes('_bg_')) {
            updateStyle(el, 'artBg', true);
        } else if (data.cls) {
            el.className = data.cls;
        }

        if (key.endsWith('_prefix')) {
            updateStyle(el, 'prefix', true);
        }
    });

    // 3) 세트 체크 및 하이라이트
    setTimeout(() => {
        if (typeof checkArmorSetColor === "function") {
            checkArmorSetColor(charId);
        }

        ["목걸이", "팔찌", "반지", "보조장비", "귀걸이", "마법석"].forEach(slot => {
            if (typeof runSetCheck === "function") {
                runSetCheck(slot, charId);
            }
        });

        applySealHighlight(charId);

        // ⭐ 태그 복원 추가
        if (savedData?.tags && typeof loadTags === 'function') {
            loadTags(charId);
        }

        // ⭐ 메모 미리보기 업데이트 추가
        if (typeof updateMemoPreview === 'function') {
            updateMemoPreview(charId);
        }
    }, 0);
}

/**
 * 캐릭터 삭제
 */
function deleteCharacter(charId) {
    const section = document.getElementById(charId);
    if (!section) return;

    const lockBtn = section.querySelector('.lock-btn');
    const isLocked = lockBtn?.classList.contains('btn-active');

    if (isLocked) {
        alert("캐릭터가 잠금 상태입니다. '해제' 버튼을 누른 후 삭제해주세요.");
        return;
    }

    if (confirm("정말로 이 캐릭터를 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.")) {
        section.remove();
        delete AppState.charRuneData[charId];
        delete AppState.charTags[charId];  // ⭐ 추가
        autoSave();

        const statusMsg = document.getElementById('statusMsg');
        if (statusMsg) {
            statusMsg.innerText = "캐릭터가 삭제되었습니다.";
            setTimeout(() => statusMsg.innerText = "", 2000);
        }
    }
}

/**
 * 캐릭터 이동
 */
function moveCharacter(charId, direction) {
    const section = document.getElementById(charId);
    if (!section) return;

    if (direction === 'up') {
        const prev = section.previousElementSibling;
        if (prev?.classList.contains('char-section')) {
            section.parentNode.insertBefore(section, prev);
        }
    } else {
        const next = section.nextElementSibling;
        if (next?.classList.contains('char-section')) {
            section.parentNode.insertBefore(next, section);
        }
    }

    AppState.updateSnapshot();
    autoSave();

    section.style.boxShadow = "0 0 10px var(--gold)";
    setTimeout(() => section.style.boxShadow = "", 500);
}

/**
 * 모든 캐릭터 잠금
 */
function lockAllCharacters() {
    const allSections = document.querySelectorAll('.char-section');
    if (allSections.length === 0) return;

    if (confirm("모든 캐릭터를 잠금 상태로 변경하시겠습니까?")) {
        allSections.forEach(section => toggleEdit(section.id, true));

        const statusMsg = document.getElementById('statusMsg');
        if (statusMsg) {
            statusMsg.innerText = "🔒 모든 캐릭터가 잠겼습니다.";
            setTimeout(() => statusMsg.innerText = "", 2000);
        }
    }
}

/**
 * 편집 잠금/해제 토글
 */
function toggleEdit(charId, isLock) {
    const section = document.getElementById(charId);
    if (!section) return;

    const lockBtn = section.querySelector('.lock-btn');
    const unlockBtn = section.querySelector('.unlock-btn');
    const actionBtns = section.querySelectorAll('.btn-action');
    const delBtn = section.querySelector('.del-btn');
    const inputs = section.querySelectorAll('input, select, textarea');

    inputs.forEach(el => {
        if (el === lockBtn || el === unlockBtn) return;

        if (isLock) {
            if (el.tagName === 'SELECT') {
                el.disabled = true;
            } else {
                el.readOnly = true;
            }
            el.style.cursor = "default";
        } else {
            el.disabled = false;
            el.readOnly = false;
            el.style.cursor = (el.tagName === 'SELECT' || el.type === 'button') ? "pointer" : "text";
        }
    });

    [...actionBtns, delBtn].forEach(btn => {
        if (btn) {
            btn.disabled = isLock;
            btn.style.opacity = isLock ? "0.5" : "1";
            btn.style.pointerEvents = isLock ? "none" : "auto";
        }
    });

    if (isLock) {
        lockBtn?.classList.add('btn-active');
        unlockBtn?.classList.remove('btn-active');
    } else {
        lockBtn?.classList.remove('btn-active');
        unlockBtn?.classList.add('btn-active');
    }

    // 설명/메모 팝업이 열려있으면 저장 후 닫기
    if (typeof saveDescFromModal === 'function') saveDescFromModal();
    if (typeof saveMemoFromModal === 'function') saveMemoFromModal();

    autoSave();
}