// ============================================
// ui-character.js - 캐릭터 관리 UI (템플릿 리팩토링 완료)
// ============================================

// 캐릭터 추가 동기화 무한루프 방지 플래그
// _syncInProgress → UIState.syncInProgress (state.js)

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

    // 3) 룬 데이터 초기화 (inputs["스킬룬"].runeData 에서 읽기)
    AppState.charRuneData[charId] = savedData?.inputs?.['스킬룬']?.runeData
        || savedData?.runeData  // 구버전 호환
        || {
            runes: Array(20).fill().map(() => ({name: '', lv: '', skillLv: ''})),
            gakin: ['', '']
        };

    // 태그 데이터 초기화 (AppState.charTags가 없으면 생성)
    if (!AppState.charTags) {
        AppState.charTags = {};
    }
    if (savedData?.tags) {
        AppState.charTags[charId] = savedData.tags;
    }

    // 4) 테이블 기본 구조 생성
    section.innerHTML = `
        <div class="char-section-inner">
            <div class="char-info-table-wrap"></div>
            <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th rowspan="2" class="col-slot v-border-heavy group-header">슬롯</th>
                        <th rowspan="2" class="col-rarity group-header">희귀도</th>
                        <th rowspan="2" class="col-exceed group-header">익시드</th>
                        <th rowspan="2" class="col-prefix group-header">접두어 <button class="set-apply-btn" onclick="event.stopPropagation(); openPrefixMenuFromHeader(event, '${charId}')" tabindex="-1">🎯</button></th>
                        <th rowspan="2" style="min-width:120px;" class="group-header">아이템이름 <button class="set-apply-btn" onclick="event.stopPropagation(); openSetMenuFromHeader(event, '${charId}')" tabindex="-1">🎯</button></th>
                        <th rowspan="2" class="col-val-short group-header">강화 <button class="set-apply-btn" onclick="event.stopPropagation(); openReinforceMenuFromHeader(event, '${charId}')" tabindex="-1">🎯</button></th>
                        <th colspan="4">마법봉인</th>
                        <th colspan="2">엠블렘 <button class="set-apply-btn" onclick="event.stopPropagation(); openEmblemColorPicker(event, '${charId}')" tabindex="-1">🎨</button></th>
                        <th colspan="2">마법부여</th>
                        <th rowspan="2" style="min-width:230px;" class="v-border-heavy group-header">설명</th>
                    </tr>
                    <tr>
                        <th class="group-header">고유 옵션</th>
                        <th class="col-val-short group-header">수치</th>
                        <th class="group-header">일반 옵션</th>
                        <th class="col-val-short group-header">수치</th>
                        <th class="col-emblem group-header">엠블렘</th>
                        <th class="col-emblem group-header">엠블렘</th>
                        <th class="col-enchant group-header">마법부여</th>
                        <th class="col-val-short group-header">수치</th>
                    </tr>
                </thead>
                <tbody class="tbody-content"></tbody>
            </table>
        </div>
        </div>`;

    const tbody = section.querySelector('.tbody-content');

    // 5) 캐릭터 정보 테이블 먼저 삽입 (slots 루프 전)
    const charInfoFragment = TemplateHelper.createCharacterInfo(charId);
    const charInfoEl = charInfoFragment.firstElementChild;
    const wrap = section.querySelector('.char-info-table-wrap');
    if (wrap) wrap.replaceWith(charInfoEl);

    // 6) 각 슬롯별 행 생성 (템플릿 사용)
    slots.forEach((slot, index) => {
        // 슬롯 컨텐츠에서 <tr> 가져오기
        const slotFragment = createSlotContent(slot, index, charId, savedData);
        const tr = slotFragment.querySelector('tr');  // 템플릿의 <tr> 추출

        if (!tr) {
            console.error(`템플릿에서 <tr>을 찾을 수 없습니다: ${slot}`);
            return;
        }

        // 테두리 적용
        if (heavyBorderSlots.includes(slot)) {
            tr.style.borderBottom = "2px solid var(--border-heavy)";
        }

        tbody.appendChild(tr);
    });

    // 6) 문서에 삽입
    document.getElementById('characterContainer').appendChild(section);
    updateRuneSummary(charId);

    // info_job select 옵션 초기화 (DOM 삽입 후)
    const _jobSel = section.querySelector('select[data-key="info_job"]');
    if (_jobSel && typeof initJobSelect === 'function') initJobSelect(_jobSel);

    // 무기 아이템 select 옵션 초기화
    if (typeof initWeaponItemSelect === 'function') initWeaponItemSelect(charId);

    // 7) 접두어 리스트 초기화
    initializePrefixSelects(section);

    // 8) 저장된 데이터 복구
    if (savedData) {
        // 구버전 데이터 마이그레이션 (플랫→중첩, runeData 위치 이동)
        if (typeof migrateInputs === 'function') savedData.inputs = migrateInputs(savedData.inputs);
        if (typeof migrateRuneData === 'function') savedData = migrateRuneData(savedData);

        // 통합 구조: job/name이 최상위 필드로 있으면 inputs에 주입 (project2 호환)
        if (savedData.job && !savedData.inputs?.['info_job']) {
            if (!savedData.inputs) savedData.inputs = {};
            savedData.inputs['info_job'] = { val: savedData.job, cls: '' };
        }
        if (savedData.name && !savedData.inputs?.['info_name']) {
            if (!savedData.inputs) savedData.inputs = {};
            savedData.inputs['info_name'] = { val: savedData.name, cls: '' };
        }
        restoreSavedData(section, savedData, charId);
    } else if (!UIState.syncInProgress) {
        // 신규 추가 (savedData 없음) 시 project2 characters 배열에도 동기화
        UIState.syncInProgress = true;
        if (typeof characters !== 'undefined') {
            const exists = characters.find(c => c.id === charId);
            if (!exists) {
                const initRuneData = AppState.charRuneData[charId];
                const initInputs = { '스킬룬': { runeData: initRuneData } };
                characters.push({
                    id: charId,
                    job: '',
                    name: '',
                    locked: false,
                    inputs: initInputs,
                    tags: [],
                    armorCounts: {},
                    weaponCounts: {},
                    updateTimes: {},
                    craftMaterials: {}
                });
                if (typeof saveLocalData === 'function') saveLocalData();
                if (typeof renderCharacterList === 'function') renderCharacterList();
            }
        }
        UIState.syncInProgress = false;
    }

    // 9) 잠금 상태 설정
    toggleEdit(charId, savedData ? !!savedData.locked : false);

    // 10) 신규 캐릭터도 접두어/익시드 초기 상태 설정
    if (!savedData) {
        setTimeout(() => {
            if (typeof refreshAllArmorSlotStates === 'function') refreshAllArmorSlotStates(charId);
            if (typeof refreshAllAccSlotStates === 'function') refreshAllAccSlotStates(charId);
            if (typeof refreshAllSpecialSlotStates === 'function') refreshAllSpecialSlotStates(charId);
            // 무기 엠블렘 기본 색상: 빨강
            if (typeof applyWeaponEmblemColor === 'function') applyWeaponEmblemColor(charId, 'emb-bg-red');
        }, 0);
    }
}

/**
 * 슬롯별 컨텐츠 생성 (템플릿 사용)
 */
function createSlotContent(slot, index, charId, savedData) {
    // 스킬룬
    if (slot === "스킬룬") {
        return TemplateHelper.createSkillRuneRow(charId);
    }

    // 크리쳐 (버튼 팝업 방식)
    if (slot === "크리쳐") {
        const rowFrag = TemplateHelper.createCreatureRow();
        const btn = rowFrag.querySelector('button[data-creature-btn]');
        if (btn) {
            btn.onclick = (e) => {
                e.preventDefault();
                const section = btn.closest('.char-section');
                if (section) openCreaturePopup(section.id, btn);
            };
        }
        return rowFrag;
    }

    // 칭호 (버튼 팝업 방식)
    if (slot === "칭호") {
        const titleFrag = TemplateHelper.createTitleRow();
        const btn = titleFrag.querySelector('button[data-title-btn]');
        if (btn) {
            btn.onclick = (e) => {
                e.preventDefault();
                const section = btn.closest('.char-section');
                if (section) openTitlePopup(section.id, btn);
            };
        }
        return titleFrag;
    }

    // 외형칭호 (설명 칸 없음)
    if (slot === "외형칭호") {
        return TemplateHelper.clone('appearance-title-row-template');
    }

    // 오라/아바타 (설명 칸 있음)
    if (["오라", "아바타"].includes(slot)) {
        // 아바타: 전용 템플릿 (버튼 한 칸으로 합침)
        if (slot === "아바타") {
            const rowFrag = TemplateHelper.clone('avatar-row-template');
            const btn = rowFrag.querySelector('button[data-avatar-btn]');
            if (btn) {
                btn.onclick = (e) => {
                    e.preventDefault();
                    const section = btn.closest('.char-section');
                    if (section) openAvatarPopup(section.id, btn);
                };
            }
            // weapon_stat select에 AVATAR_WEAPON_STATS 옵션 채우기
            // (Fragment 상태에서 querySelector 가능 - appendChild 후 firstElementChild 방식 사용 불필요)
            initAvatarWeaponStatSelect(rowFrag);
            return rowFrag;
        }
        // 오라: 전용 템플릿 (itemname이 버튼)
        if (slot === '오라') {
            const frag = TemplateHelper.clone('aura-row-template');
            const btn = frag.querySelector('button[data-aura-btn]');
            if (btn) {
                btn.onclick = (e) => {
                    e.preventDefault();
                    const section = btn.closest('.char-section');
                    if (section) openAuraPopup(section.id, btn);
                };
            }
            return frag;
        }
        return TemplateHelper.createSimpleRow(slot);
    }

    // 일반 장비
    // getDefaultEnchant는 { enchant, val } 반환, createEquipmentRow는 { defaultEnchant, defaultEnchantVal } 사용
    // info_job/info_name은 addCharacter()로 주입되므로 장비 관련 키가 없으면 신규 캐릭터로 간주
    const equipInputKeys = savedData?.inputs
        ? Object.keys(savedData.inputs).filter(k => !k.startsWith('info_'))
        : [];
    const isNewChar = !savedData || !savedData.inputs || equipInputKeys.length === 0;
    const enchantDefault = isNewChar ? TemplateHelper.getDefaultEnchant(slot) : { enchant: '', val: '' };
    const options = {
        emblemClass: TemplateHelper.getEmblemClass(slot),
        defaultEnchant: enchantDefault.enchant,
        defaultEnchantVal: enchantDefault.val
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

    // 칭호: 버튼 팝업 방식 - select 교체 없이 리턴
    if (slot === '칭호') return;

    // 무기 슬롯: 직업 기반 단일 select + 이미지
    if (slot === '무기') {
        const select = document.createElement('select');
        select.setAttribute('data-key', '무기_itemname');
        select.className = 'rare-에픽 itemname-color-sync';
        select.onchange = () => { updateWeaponImage(select); autoSave(); };

        const img = document.createElement('img');
        img.className = 'itemname-img-preview';
        img.src = '';
        img.alt = '';

        existingField.replaceWith(select);
        container.insertBefore(img, select);
        // 옵션은 DOM 삽입 후 initWeaponItemSelect(charId) 에서 채움
        return;
    }

    // itemOptions에 정의된 슬롯은 select로 변경
    if (itemOptions[slot]) {
        const select = document.createElement('select');
        select.setAttribute('data-key', `${slot}_itemname`);
        select.className = 'rare-에픽 itemname-color-sync';

        // 세트 체크 이벤트 추가
        const needsSetCheck = ["상의", "하의", "어깨", "벨트", "신발"].includes(slot);

        // 상의 슬롯: 선택 시 왼쪽 이미지 미리보기 업데이트
        if (slot === '상의') {
            select.onchange = () => {
                if (typeof refreshArmorSlotState === 'function') refreshArmorSlotState(slot, charId);
                updateItemImage(select);
                runSetCheck(slot, charId);
                autoSave();
            };
        } else if (slot === '팔찌') {
            select.onchange = () => {
                if (typeof refreshAccSlotState === 'function') refreshAccSlotState(slot, charId);
                updateAccImage(select);
                runSetCheck(slot, charId);
                autoSave();
            };
        } else if (slot === '귀걸이') {
            select.onchange = () => {
                if (typeof refreshSpecialSlotState === 'function') refreshSpecialSlotState(slot, charId);
                updateSpecialImage(select);
                runSetCheck(slot, charId);
                autoSave();
            };
        } else if (["하의", "어깨", "벨트", "신발"].includes(slot)) {
            const _armorImgFn = { '하의': updatePantsImage, '어깨': updateShoulderImage, '벨트': updateBeltImage, '신발': updateShoesImage };
            select.onchange = () => {
                if (typeof refreshArmorSlotState === 'function') refreshArmorSlotState(slot, charId);
                if (_armorImgFn[slot]) _armorImgFn[slot](select);
                runSetCheck(slot, charId);
                autoSave();
            };
        } else if (["목걸이", "반지"].includes(slot)) {
            const _accImgFn = { '목걸이': updateNecklaceImage, '반지': updateRingImage };
            select.onchange = () => {
                if (typeof refreshAccSlotState === 'function') refreshAccSlotState(slot, charId);
                if (_accImgFn[slot]) _accImgFn[slot](select);
                runSetCheck(slot, charId);
                autoSave();
            };
        } else if (["마법석", "보조장비"].includes(slot)) {
            const _specImgFn = { '마법석': updateMagicImage, '보조장비': updateSubImage };
            select.onchange = () => {
                if (typeof refreshSpecialSlotState === 'function') refreshSpecialSlotState(slot, charId);
                if (_specImgFn[slot]) _specImgFn[slot](select);
                runSetCheck(slot, charId);
                autoSave();
            };
        } else if (slot === '칭호') {
            select.onchange = () => {
                updateTitleImage(select);
                applyItemInfoToDesc(select, slot, charId, GameData.TITLE_ITEM_INFO);
                autoSave();
            };
        } else if (slot === '외형칭호') {
            select.onchange = () => { updateAppearanceTitleImage(select); autoSave(); };
        } else if (slot === '오라') {
            select.onchange = () => {
                updateAuraImage(select);
                applyItemInfoToDesc(select, slot, charId, GameData.AURA_ITEM_INFO);
                autoSave();
            };
        } else {
            select.onchange = () => {
                runSetCheck(slot, charId);
                autoSave();
            };
        }

        // 옵션 추가 (itemOptions 배열 자체에 이미 첫 번째 빈 값이 포함되어 있으므로 그대로 사용)
        select.innerHTML = itemOptions[slot].map(opt => `<option value="${opt}">${opt}</option>`).join('');

        existingField.replaceWith(select);

        // 이미지 미리보기가 있는 슬롯: select 왼쪽에 img 태그 추가
        const _imgSlots = ['상의','하의','어깨','벨트','신발','팔찌','목걸이','반지','귀걸이','마법석','보조장비'];
        if (_imgSlots.includes(slot)) {
            const img = document.createElement('img');
            img.className = 'itemname-img-preview';
            img.src = '';
            img.alt = '';
            select.parentElement.insertBefore(img, select);
        }
    }
}

/**
 * 상의 아이템 이미지 미리보기 업데이트
 * 파일명 규칙:
 *   접두어 없음 → images/ARMOR/{아이템이름}.png
 *   접두어 있음 → images/ARMOR/{접두어}_{아이템이름}.png
 *   아이템이름에 콜론(:) 포함 시 → _ 로 대체
 */
/**
 * 슬롯 이미지 미리보기 공통 헬퍼
 * @param {HTMLElement} select - itemname select
 * @param {string} slot        - 슬롯명 (접두어 key 참조용)
 * @param {string} folder      - 이미지 폴더 (ARMOR / ACCESSORY / SPECIAL)
 */
function _applySlotImage(select, slot, folder) {
    const td = select.parentElement;
    const img = td.querySelector('.itemname-img-preview');
    if (!img) return;

    const itemName = select.value;

    img.onerror = null;
    img.src = '';
    img.classList.remove('has-image');

    if (!itemName) {
        img.alt = '';
        return;
    }

    const row = select.closest('tr');
    const prefixSel = row ? row.querySelector(`select[data-key="${slot}_prefix"]`) : null;
    const prefix = prefixSel ? prefixSel.value.trim() : "";

    // 파일명 생성 (콜론+공백 → _ 치환, 접두어 중복 방지)
    const safeName = itemName.replace(/:\s*/g, '_');
    const fileName = (prefix && !safeName.startsWith(prefix + '_')) ? `${prefix}_${safeName}` : safeName;

    img.alt = itemName;
    img.onerror = function() {
        this.onerror = null;
        this.src = '';
        this.classList.remove('has-image');
    };
    img.src = `images/${folder}/${fileName}.png`;
    img.classList.add('has-image');
}

// 슬롯별 이미지 업데이트 함수 (images/ 하위 폴더별)
// ARMOR 슬롯
function updateItemImage(select)    { _applySlotImage(select, '상의',   'ARMOR'); }
function updateShoulderImage(select){ _applySlotImage(select, '어깨',   'ARMOR'); }
function updatePantsImage(select)   { _applySlotImage(select, '하의',   'ARMOR'); }
function updateShoesImage(select)   { _applySlotImage(select, '신발',   'ARMOR'); }
function updateBeltImage(select)    { _applySlotImage(select, '벨트',   'ARMOR'); }
// ACCESSORY 슬롯
function updateAccImage(select)     { _applySlotImage(select, '팔찌',   'ACCESSORY'); }
function updateNecklaceImage(select){ _applySlotImage(select, '목걸이', 'ACCESSORY'); }
function updateRingImage(select)    { _applySlotImage(select, '반지',   'ACCESSORY'); }
// SPECIAL 슬롯
function updateSpecialImage(select) { _applySlotImage(select, '귀걸이', 'SPECIAL'); }
function updateMagicImage(select)   { _applySlotImage(select, '마법석', 'SPECIAL'); }
function updateSubImage(select)     { _applySlotImage(select, '보조장비', 'SPECIAL'); }
// 칭호/외형칭호/오라 슬롯
function updateTitleImage(select)   { _applySlotImage(select, '칭호',   'title'); }
function updateAppearanceTitleImage(select){ _applySlotImage(select, '외형칭호', 'appearanceTitle'); }
function updateAuraImage(select)    { _applySlotImage(select, '오라',   'aura'); }

/**
 * 무기 아이템 이미지 업데이트 (images/WEAPON/{아이템이름}.png)
 * 콜론+공백 → _ 치환
 */
function updateWeaponImage(select) {
    const td = select.parentElement;
    const img = td ? td.querySelector('.itemname-img-preview') : null;
    if (!img) return;

    const itemName = select.value;
    img.onerror = null;
    img.src = '';
    img.classList.remove('has-image');

    if (!itemName) { img.alt = ''; return; }

    // 콜론만 제거 (예: "요도 : 무라마사" → "요도  무라마사" - 공백 두 개 유지)
    const safeName = itemName.replace(/:/g, '');
    img.alt = itemName;
    img.onerror = function() { this.onerror = null; this.src = ''; this.classList.remove('has-image'); };
    img.src = 'images/WEAPON/' + safeName + '.png';
    img.classList.add('has-image');
}

/**
 * 직업에 맞게 무기_itemname select 옵션을 채운다 (단일 select)
 * 형식: 무기종류(disabled 헤더) → 에픽 아이템들
 * @param {string} charId
 * @param {string} [savedVal] 복구할 선택값
 */
function initWeaponItemSelect(charId, savedVal) {
    const section = document.getElementById(charId);
    if (!section) return;

    const weaponSel = section.querySelector('select[data-key="무기_itemname"]');
    if (!weaponSel) return;

    const jobSel = section.querySelector('select[data-key="info_job"]');
    const jobVal = jobSel ? jobSel.value : '';
    const weaponData = (typeof getWeaponDataByJob === 'function') ? getWeaponDataByJob(jobVal) : null;

    weaponSel.innerHTML = '<option value="" disabled selected></option>';

    if (weaponData) {
        const entries = Object.entries(weaponData);
        entries.forEach(([weaponType, items], idx) => {
            // 두 번째 무기종류부터 앞에 공백 옵션 추가 (선택 불가)
            if (idx > 0) {
                const blank = document.createElement('option');
                blank.value = '';
                blank.disabled = true;
                blank.textContent = '';
                weaponSel.appendChild(blank);
            }

            // 무기종류 헤더 (disabled, 선택 불가)
            const hdr = document.createElement('option');
            hdr.value = '';
            hdr.textContent = weaponType;
            hdr.disabled = true;
            weaponSel.appendChild(hdr);

            // 에픽 아이템들 (선택 가능)
            items.forEach(itemName => {
                const opt = document.createElement('option');
                opt.value = itemName;
                opt.textContent = itemName;
                weaponSel.appendChild(opt);
            });
        });
    }

    if (savedVal) {
        weaponSel.value = savedVal;
    } else {
        // 저장값 없으면 첫 번째 선택 가능한 아이템 자동 선택
        const firstSelectable = Array.from(weaponSel.options).find(o => !o.disabled && o.value !== '');
        if (firstSelectable) weaponSel.value = firstSelectable.value;
    }
    updateWeaponImage(weaponSel);
}

/**
 * info_job select 변경 시 호출
 * syncCharInfoToP2 + 무기 select 갱신 + 저장
 */
function onJobSelectChange(el) {
    if (typeof syncCharInfoToP2 === 'function') syncCharInfoToP2(el);
    const section = el.closest('.char-section');
    if (!section) return;
    initWeaponItemSelect(section.id);
    autoSave();
}

/**
 * info_job select에 직업 선택지 옵션을 채운다
 * @param {HTMLSelectElement} sel
 * @param {string} [savedVal]
 */
function initJobSelect(sel, savedVal) {
    if (!sel || typeof JOB_SELECT_OPTIONS === 'undefined') return;

    sel.innerHTML = '<option value="" disabled selected></option>';

    JOB_SELECT_OPTIONS.forEach(opt => {
        const o = document.createElement('option');
        if (opt.type === 'separator') {
            o.disabled = true;
            o.textContent = '───────────────';
            o.value = '';
        } else if (opt.type === 'disabled') {
            o.disabled = true;
            o.value = '';
            o.textContent = '';
        } else {
            o.value = opt.value;
            o.textContent = opt.value;
        }
        sel.appendChild(o);
    });

    if (savedVal) sel.value = savedVal;
}

function initializePrefixSelects(section) {
    section.querySelectorAll('select[data-key$="_prefix"]').forEach(sel => {
        const slot = sel.getAttribute('data-slot');
        const raritySel = section.querySelector(`select[data-key="${slot}_rarity"]`);

        updateStyle(sel, 'prefix', true);

        if (raritySel) {
            updateStyle(raritySel, 'rarity', true);
        }
    });

    // 외형칭호/오라는 prefix가 없으므로 rarity를 직접 트리거해 itemname을 select로 교체
    // 칭호는 버튼 팝업 방식이므로 제외
    ['외형칭호'].forEach(slot => {
        const raritySel = section.querySelector(`select[data-key="${slot}_rarity"]`);
        if (raritySel) updateStyle(raritySel, 'rarity', true);
    });
}

/**
 * 저장된 데이터 복구
 */
function restoreSavedData(section, savedData, charId) {
    // inputs에서 data-key 속성값으로 데이터 조회하는 헬퍼
    // 중첩 구조 예시:
    //   key="info_job"  → inputs["info_job"]         (플랫)
    //   key="상의_rarity" → inputs["상의"]["rarity"]  (중첩)
    function getInputData(inputs, key) {
        if (!inputs) return null;
        // info_ 계열은 플랫
        if (key.startsWith('info_')) return inputs[key] || null;
        // 슬롯_필드 → 중첩 조회
        const underIdx = key.indexOf('_');
        if (underIdx === -1) return inputs[key] || null;
        const slot = key.slice(0, underIdx);
        const field = key.slice(underIdx + 1);
        return inputs[slot]?.[field] || null;
    }

    // 1) 희귀도 먼저 설정
    const rarityInputs = section.querySelectorAll('select[data-key$="_rarity"]');
    rarityInputs.forEach(el => {
        const key = el.getAttribute('data-key');
        const data = getInputData(savedData.inputs, key);
        if (data) {
            el.value = data.val;
            updateStyle(el, 'rarity', true);
        }
    });

    // 2) 모든 입력값 복구
    // ※ 1단계에서 updateStyle(rarity)가 replaceItemNameField를 호출해 새 select를 생성하므로
    //   querySelectorAll을 const로 미리 저장하지 않고 직접 호출해야 새 요소도 포함됨
    section.querySelectorAll('input[data-key], select[data-key], textarea[data-key]').forEach(el => {
        const key = el.getAttribute('data-key');
        const data = getInputData(savedData.inputs, key);

        if (!data || key.endsWith('_rarity')) return;

        el.value = data.val;

        // 크리쳐 아티팩트 배경색 동기화
        if (key.includes('_art_') && key.includes('_bg_')) {
            updateStyle(el, 'artBg', true);
        } else if (data.cls) {
            // set-highlight, ex-itemname-light는 구버전 저장 데이터 잔재 — 제거
            el.className = data.cls
                .replace(/\bset-highlight\b/g, '')
                .replace(/\bex-itemname-light\b/g, '')
                .trim();
        }

        // itemname 필드: rare-에픽 + itemname-color-sync 클래스 보장
        if (key.endsWith('_itemname')) {
            if (!el.classList.contains('rare-에픽')) el.classList.add('rare-에픽');
            if (!el.classList.contains('itemname-color-sync')) el.classList.add('itemname-color-sync');
        }

        if (key.endsWith('_prefix')) {
            updateStyle(el, 'prefix', true);
        }
    });

    // 2-b) 칭호 버튼 복원
    const titleBtn = section.querySelector('button[data-key="칭호_itemname"]');
    if (titleBtn) {
        const titleInputs = savedData?.inputs?.['칭호'] || {};
        const name  = titleInputs.itemname?.val || '';
        const stats = titleInputs.title_stats?.val || '{}';
        titleBtn.setAttribute('data-title-name', name);
        titleBtn.setAttribute('data-title-stats', stats);
        titleBtn.textContent = name;
    }

    // 2-b2) 오라 버튼 복원
    const auraBtn = section.querySelector('button[data-key="오라_itemname"]');
    if (auraBtn) {
        const auraInputs = savedData?.inputs?.['오라'] || {};
        const aName  = auraInputs.itemname?.val || '';
        const aStats = auraInputs.aura_stats?.val || '{}';
        auraBtn.setAttribute('data-aura-name', aName);
        auraBtn.setAttribute('data-aura-stats', aStats);
        auraBtn.textContent = aName;
    }

    // 2-c) 아바타 버튼 & weapon_stat select 복원
    const avatarBtn = section.querySelector('button[data-key="아바타_itemname"]');
    if (avatarBtn) {
        const avatarInputs = savedData?.inputs?.['아바타'] || {};

        // weapon_stat select 옵션 먼저 채우기
        initAvatarWeaponStatSelect(section);
        // 크리쳐 버튼 + 아티팩트 표시 복원
        const creatureBtn = section.querySelector('button[data-creature-btn]');
        if (creatureBtn) {
            const cInputs = savedData?.inputs?.['크리쳐'] || {};
            const cName     = cInputs.name?.val       || '';
            const cMode     = cInputs.mode?.val        || 'sel';
            const cSetEff   = cInputs.seteffect?.val   || '';
            const cSetAuto  = cInputs.setauto?.val     || 'false';
            creatureBtn.setAttribute('data-creature-name',      cName);
            creatureBtn.setAttribute('data-creature-mode',      cMode);
            creatureBtn.setAttribute('data-creature-seteffect', cSetEff);
            creatureBtn.setAttribute('data-creature-setauto',   cSetAuto);
            creatureBtn.textContent = cName;
        }
        // 아티팩트 hidden input → 표시 span 동기화
        _CREATURE_ART_KEYS.forEach(key => {
            const hidden = section.querySelector(`input[type="hidden"][data-key="${key}"]`);
            const disp   = section.querySelector(`[data-creature-disp="${key}"]`);
            if (!hidden || !disp) return;
            const val = hidden.value || '';
            disp.textContent = val;
            // 희귀도 칸: bg-X 클래스 동기화
            if (key.includes('_bg_') || key.includes('_top_rarity')) {
                disp.className = disp.className.replace(/bg-\S+/g, '').trim();
                if (val) disp.classList.add('bg-' + val);
            }
        });

        // itemname 복원: 신규 구조(parts) 우선, 구버전(itemname.val) fallback
        let rawVal = '';
        if (avatarInputs.parts && typeof avatarInputs.parts === 'object') {
            rawVal = Object.entries(avatarInputs.parts)
                .map(([p, g]) => `${p}(${g})`)
                .join(' ');
        } else if (avatarInputs.itemname?.val) {
            rawVal = avatarInputs.itemname.val;
        }
        avatarBtn.setAttribute('data-avatar-value', rawVal);
        avatarBtn.innerHTML = typeof renderAvatarBtnHTML === 'function'
            ? renderAvatarBtnHTML(rawVal)
            : rawVal;

        // weapon_stat select 복원: { stats(배열), amount } 구조
        const weaponStatSel = section.querySelector('[data-key="아바타_weapon_stat"]');
        if (weaponStatSel && avatarInputs.weapon_stat) {
            const ws = avatarInputs.weapon_stat;
            // 신규 구조: stats 배열 → "힘,지능,체력,정신력|18" 형태로 재조합
            let storedValue = '';
            if (Array.isArray(ws.stats) && ws.stats.length > 0) {
                const statStr = ws.stats.join(',');
                storedValue = (ws.amount !== null && ws.amount !== undefined)
                    ? `${statStr}|${ws.amount}`
                    : statStr;
            } else if (ws.stat) {
                // 구버전 stat 단일 문자열 fallback
                storedValue = (ws.amount !== null && ws.amount !== undefined)
                    ? `${ws.stat}|${ws.amount}`
                    : ws.stat;
            }
            weaponStatSel.value = storedValue;
            // 구버전 val 형식 fallback (이전에 "힘, 지능, 체력, 정신력 +18" 형태로 저장된 경우)
            if (!weaponStatSel.value && ws.val) {
                const matched = Array.from(weaponStatSel.options)
                    .find(o => o.text === ws.val || o.value === ws.val);
                if (matched) weaponStatSel.value = matched.value;
            }
        }
    }

    // 3) 색상 갱신 및 기타 후처리
    setTimeout(() => {
        if (typeof refreshAllItemNameColors === 'function') {
            refreshAllItemNameColors(charId);
        }

        // 접두어/익시드 활성화 상태 복구
        if (typeof refreshAllArmorSlotStates === 'function') {
            refreshAllArmorSlotStates(charId);
        }
        if (typeof refreshAllAccSlotStates === 'function') {
            refreshAllAccSlotStates(charId);
        }
        if (typeof refreshAllSpecialSlotStates === 'function') {
            refreshAllSpecialSlotStates(charId);
        }

        // 전체 슬롯 이미지 복구 (접두어 복구 완료 후 갱신)
        {
            const section = document.getElementById(charId);
            const _restoreImgFns = [
                ['상의',    updateItemImage],    ['하의',    updatePantsImage],
                ['어깨',    updateShoulderImage], ['벨트',    updateBeltImage],
                ['신발',    updateShoesImage],
                ['팔찌',    updateAccImage],     ['목걸이',  updateNecklaceImage],
                ['반지',    updateRingImage],
                ['귀걸이',  updateSpecialImage], ['마법석',  updateMagicImage],
                ['보조장비', updateSubImage],
                ['칭호',    updateTitleImage],   ['외형칭호', updateAppearanceTitleImage],
                ['오라',    updateAuraImage]
            ];
            _restoreImgFns.forEach(([sl, fn]) => {
                if (typeof fn !== 'function') return;
                const sel = section?.querySelector(`[data-key="${sl}_itemname"]`);
                if (sel && sel.tagName === 'SELECT') fn(sel);
            });

            // 무기 이미지 복구
            if (typeof updateWeaponImage === 'function') {
                const _wSel = section?.querySelector('select[data-key="무기_itemname"]');
                if (_wSel) updateWeaponImage(_wSel);
            }
        }

        applySealHighlight(charId);

        // 무기 엠블렘 색상 복구
        const embColorData = savedData?.inputs?.['무기']?.['emb_color'];
        if (embColorData?.val && typeof applyWeaponEmblemColor === 'function') {
            applyWeaponEmblemColor(charId, embColorData.val);
        }

        // 태그 복원
        if (savedData?.tags && typeof loadTags === 'function') {
            loadTags(charId);
        }

        // 메모 미리보기 업데이트
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
        delete AppState.charTags[charId];

        // project2 characters 배열에서도 제거
        if (typeof characters !== 'undefined') {
            characters = characters.filter(c => String(c.id) !== String(charId));
            if (typeof saveLocalData === 'function') saveLocalData();
            if (typeof renderCharacterList === 'function') renderCharacterList();
        } else {
            autoSave();
        }

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

    // DOM 순서 기준으로 characters 배열 재정렬 → 캐릭터 관리 탭에도 반영
    if (typeof characters !== 'undefined') {
        const domOrder = Array.from(document.querySelectorAll('#characterContainer .char-section'))
            .map(sec => sec.id);
        characters.sort((a, b) => {
            const ai = domOrder.indexOf(a.id);
            const bi = domOrder.indexOf(b.id);
            if (ai === -1) return 1;
            if (bi === -1) return -1;
            return ai - bi;
        });
        if (typeof saveLocalData === 'function') saveLocalData();
        if (typeof renderCharacterList === 'function') renderCharacterList();
    }

    AppState.updateSnapshot();

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

    // 🎯 일괄 적용 버튼(접두어/아이템이름/강화) 잠금 처리
    const applyBtns = section.querySelectorAll('.set-apply-btn');
    applyBtns.forEach(btn => {
        btn.disabled = isLock;
        btn.style.opacity = isLock ? "0.3" : "";
        btn.style.pointerEvents = isLock ? "none" : "auto";
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
// ============================================
// 무기 엠블렘 색상 선택
// ============================================

/**
 * 엠블렘 색상 선택 팝업 열기
 */
function openEmblemColorPicker(event, charId) {
    // 기존 팝업 제거
    const existing = document.getElementById('emblemColorPicker');
    if (existing) { existing.remove(); return; }

    const colors = [
        { label: '빨강', cls: 'emb-bg-red',    bg: '#6a1a1a' },
        { label: '노랑', cls: 'emb-bg-yellow',  bg: '#6a5a1a' },
        { label: '파랑', cls: 'emb-bg-blue',    bg: '#1a2a6a' },
        { label: '초록', cls: 'emb-bg-green',   bg: '#1a6a2a' },
    ];

    const picker = document.createElement('div');
    picker.id = 'emblemColorPicker';
    picker.style.cssText = `
        position: fixed;
        z-index: 9999;
        background: #1a1a1a;
        border: 2px solid #ffd700;
        border-radius: 6px;
        padding: 6px;
        display: flex;
        gap: 6px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.8);
    `;

    colors.forEach(({ label, cls, bg }) => {
        const btn = document.createElement('button');
        btn.textContent = label;
        btn.style.cssText = `
            background: ${bg};
            color: #fff;
            border: 1px solid rgba(255,255,255,0.3);
            border-radius: 4px;
            padding: 4px 10px;
            cursor: pointer;
            font-size: 12px;
            white-space: nowrap;
        `;
        btn.onclick = () => {
            applyWeaponEmblemColor(charId, cls);
            picker.remove();
        };
        picker.appendChild(btn);
    });

    // 위치 설정
    document.body.appendChild(picker);
    const rect = event.target.getBoundingClientRect();
    const pw = picker.offsetWidth;
    const ph = picker.offsetHeight;
    let left = rect.left;
    let top  = rect.bottom + 4;
    if (left + pw > window.innerWidth - 8) left = window.innerWidth - pw - 8;
    if (top + ph > window.innerHeight - 8) top = rect.top - ph - 4;
    picker.style.left = left + 'px';
    picker.style.top  = top + 'px';

    // 외부 클릭 시 닫기
    setTimeout(() => {
        document.addEventListener('click', function _close(e) {
            if (!picker.contains(e.target)) {
                picker.remove();
                document.removeEventListener('click', _close);
            }
        });
    }, 0);
}

/**
 * 무기 행의 엠블렘 input에 색상 클래스 직접 적용 + 저장
 * td에 줘도 input이 덮고, inline style은 !important CSS에 지므로
 * input 요소에 emb-bg-* 클래스를 직접 추가해야 함
 */
function applyWeaponEmblemColor(charId, colorCls) {
    const section = document.getElementById(charId);
    if (!section) return;

    const emb1 = section.querySelector('[data-key="무기_emb1"]');
    const emb2 = section.querySelector('[data-key="무기_emb2"]');

    const embClasses = ['emb-bg-red', 'emb-bg-yellow', 'emb-bg-blue', 'emb-bg-green', 'emb-bg-gray'];

    [emb1, emb2].forEach(el => {
        if (!el) return;
        // td 클래스도 정리 (보조적)
        const td = el.closest('td');
        if (td) embClasses.forEach(c => td.classList.remove(c));
        // input에 직접 클래스 적용 (.emb-bg-* { background !important } 이용)
        embClasses.forEach(c => el.classList.remove(c));
        if (colorCls) {
            el.classList.add(colorCls);
            if (td) td.classList.add(colorCls);
        }
        // inline style 초기화
        el.style.background = '';
    });

    // 색상 저장
    let hiddenInput = section.querySelector('[data-key="무기_emb_color"]');
    if (!hiddenInput) {
        hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.setAttribute('data-key', '무기_emb_color');
        section.appendChild(hiddenInput);
    }
    hiddenInput.value = colorCls;

    autoSave();
}

// ============================================
// 칭호/오라 설명 자동 입력
// ============================================

/**
 * 선택한 아이템의 info를 desc textarea에 자동 입력
 * @param {HTMLElement} select  - itemname select
 * @param {string} slot         - 슬롯명
 * @param {string} charId       - 캐릭터 ID
 * @param {Object} infoMap      - TITLE_ITEM_INFO 또는 AURA_ITEM_INFO
 */
function applyItemInfoToDesc(select, slot, charId, infoMap) {
    const section = document.getElementById(charId);
    if (!section) return;
    const descEl = section.querySelector(`[data-key="${slot}_desc"]`);
    if (!descEl) return;

    const itemName = select.value;
    const info = infoMap?.[itemName]?.info || '';
    descEl.value = info;
}

// ============================================
// 크리쳐 팝업
// ============================================

let _creatureCharId = null;
let _creatureBtn    = null;

const _CREATURE_ART_KEYS = [
    '크리쳐_art_red_top_rarity',  '크리쳐_art_red_top_text',
    '크리쳐_art_red_stat_물리공격력', '크리쳐_art_red_stat_마법공격력',
    '크리쳐_art_red_stat_힘',         '크리쳐_art_red_stat_지능',
    '크리쳐_art_red_bg_1',        '크리쳐_art_red_opt_1',
    '크리쳐_art_red_bg_2',        '크리쳐_art_red_opt_2',
    '크리쳐_art_blue_top_rarity', '크리쳐_art_blue_top_text',
    '크리쳐_art_blue_stat_공격속도',  '크리쳐_art_blue_stat_캐스팅속도',
    '크리쳐_art_blue_stat_이동속도',  '크리쳐_art_blue_stat_적중',
    '크리쳐_art_blue_bg_1',       '크리쳐_art_blue_opt_1',
    '크리쳐_art_blue_bg_2',       '크리쳐_art_blue_opt_2',
    '크리쳐_art_green_top_rarity','크리쳐_art_green_top_text',
    '크리쳐_art_green_stat_HPMAX',    '크리쳐_art_green_stat_MPMAX',
    '크리쳐_art_green_stat_모속강',
    '크리쳐_art_green_bg_1',      '크리쳐_art_green_opt_1',
    '크리쳐_art_green_bg_2',      '크리쳐_art_green_opt_2',
];

/** 팝업 내 희귀도 select 변경 시 opt/text 색상 동기화 */
function creaturePopupArtBg(rarity_sel) {
    const row  = rarity_sel.closest('.creature-art-top-row, .creature-art-opt-row');
    if (!row) return;
    const val  = rarity_sel.value;
    const cls  = 'cr-' + val;
    const peer = row.querySelector('.creature-art-text, .creature-art-opt');
    // 희귀도 select 자신
    rarity_sel.className = rarity_sel.className.replace(/cr-\S+/g, '').trim() + ' ' + cls;
    // 페어 요소
    if (peer) peer.className = peer.className.replace(/cr-\S+/g, '').trim() + ' ' + cls;
}

/**
 * 크리쳐 이름 상호배타 토글 (텍스트 ↔ 선택)
 */
function creatureNameInputToggle() {
    const textEl = document.getElementById('creature-popup-name-text');
    const selEl  = document.getElementById('creature-popup-name-sel');
    if (!textEl || !selEl) return;
    if (textEl.value.trim()) {
        // 텍스트 입력 중 → select 비활성
        selEl.value    = '';
        selEl.disabled = true;
    } else {
        selEl.disabled = false;
    }
    _creatureUpdateSetEffect();
}

function creatureNameSelToggle() {
    const textEl = document.getElementById('creature-popup-name-text');
    const selEl  = document.getElementById('creature-popup-name-sel');
    if (!textEl || !selEl) return;
    if (selEl.value) {
        // 선택 중 → 텍스트 비활성
        textEl.value    = '';
        textEl.disabled = true;
    } else {
        textEl.disabled = false;
    }
    _creatureUpdateSetEffect();
}

/** 세트효과 자동입력/수동 전환 */
function _creatureUpdateSetEffect() {
    const selEl     = document.getElementById('creature-popup-name-sel');
    const setTA     = document.getElementById('creature-popup-seteffect');
    const badge     = document.getElementById('creature-seteffect-badge');
    if (!setTA) return;

    const selName = selEl ? selEl.value : '';
    if (selName && typeof CREATURE_DATA !== 'undefined') {
        const creature = CREATURE_DATA.find(c => c.name === selName);
        if (creature) {
            setTA.value    = creature.info || creature.stats.map(s => s.label).join('\n');
            setTA.readOnly = true;
            setTA.style.opacity = '0.7';
            if (badge) badge.style.display = 'inline';
            setTA.setAttribute('data-auto', 'true');
            return;
        }
    }
    // 수동 입력 모드
    setTA.readOnly = false;
    setTA.style.opacity = '';
    if (badge) badge.style.display = 'none';
    setTA.setAttribute('data-auto', 'false');
}

/**
 * 크리쳐 팝업 열기
 */
function openCreaturePopup(charId, btn) {
    _creatureCharId = charId;
    _creatureBtn    = btn;

    const overlay = document.getElementById('creature-popup-overlay');
    const popup   = document.getElementById('creature-popup');
    if (!overlay || !popup) return;

    const section = document.getElementById(charId);

    // 저장된 크리쳐 이름 복원
    const savedName = btn.getAttribute('data-creature-name') || '';
    const savedMode = btn.getAttribute('data-creature-mode') || 'sel'; // 'sel' or 'text'

    const textEl = document.getElementById('creature-popup-name-text');
    const selEl  = document.getElementById('creature-popup-name-sel');

    // select 목록 채우기
    if (selEl && typeof CREATURE_DATA !== 'undefined') {
        selEl.innerHTML = '<option value="">크리쳐 선택</option>' +
            CREATURE_DATA.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    }

    // 모드에 따라 복원
    if (savedMode === 'text') {
        if (textEl) { textEl.value = savedName; textEl.disabled = false; }
        if (selEl)  { selEl.value  = '';         selEl.disabled  = true;  }
    } else {
        if (selEl)  { selEl.value  = savedName;  selEl.disabled  = false; }
        if (textEl) { textEl.value = '';          textEl.disabled = false; }
    }

    // 아티팩트 값 복원
    _CREATURE_ART_KEYS.forEach(key => {
        const hidden = section?.querySelector(`input[type="hidden"][data-key="${key}"]`);
        const dest   = popup.querySelector(`[data-creature-art="${key}"]`);
        if (!hidden || !dest) return;
        dest.value = hidden.value || (key.includes('_rarity') ? '에픽' : '');
        if (key.includes('_rarity')) creaturePopupArtBg(dest);
    });

    // 세트효과 복원
    const setTA  = document.getElementById('creature-popup-seteffect');
    const setVal = btn.getAttribute('data-creature-seteffect') || '';
    const setAuto= btn.getAttribute('data-creature-setauto')   || 'false';
    if (setTA) {
        setTA.value = setVal;
        setTA.setAttribute('data-auto', setAuto);
        if (setAuto === 'true') {
            setTA.readOnly = true;
            setTA.style.opacity = '0.7';
            const badge = document.getElementById('creature-seteffect-badge');
            if (badge) badge.style.display = 'inline';
        } else {
            setTA.readOnly = false;
            setTA.style.opacity = '';
            const badge = document.getElementById('creature-seteffect-badge');
            if (badge) badge.style.display = 'none';
        }
    }

    // 팝업 표시 (fixed 기준 — 스크롤 따라 재계산)
    overlay.style.display = 'block';

    function _posCreature() {
        const table  = _creatureBtn ? _creatureBtn.closest('table') : null;
        const rect   = table ? table.getBoundingClientRect() : _creatureBtn.getBoundingClientRect();
        const popupW = popup.offsetWidth;
        const popupH = popup.offsetHeight;
        const vw = window.innerWidth, vh = window.innerHeight;
        let left = rect.left + rect.width  / 2 - popupW / 2;
        let top  = rect.top  + rect.height / 2 - popupH / 2;
        if (left < 8) left = 8;
        if (left + popupW > vw - 8) left = vw - popupW - 8;
        if (top  < 8) top  = 8;
        if (top  + popupH > vh - 8) top  = vh - popupH - 8;
        popup.style.left = left + 'px';
        popup.style.top  = top  + 'px';
    }
    _posCreature();

    window._creatureScrollHandler = () => { if (_creatureBtn) _posCreature(); };
    window.addEventListener('scroll', window._creatureScrollHandler);
}

/** 크리쳐 팝업 저장 */
function creaturePopupSave() {
    if (!_creatureBtn || !_creatureCharId) { creaturePopupClose(); return; }

    const popup   = document.getElementById('creature-popup');
    const textEl  = document.getElementById('creature-popup-name-text');
    const selEl   = document.getElementById('creature-popup-name-sel');
    const setTA   = document.getElementById('creature-popup-seteffect');
    const section = document.getElementById(_creatureCharId);

    // 이름 및 모드 결정
    const isText = textEl && !textEl.disabled && textEl.value.trim();
    const name   = isText ? textEl.value.trim() : (selEl ? selEl.value : '');
    const mode   = isText ? 'text' : 'sel';

    // 세트효과 및 자동입력 여부
    const setVal  = setTA ? setTA.value.trim() : '';
    const setAuto = setTA ? (setTA.getAttribute('data-auto') === 'true' ? 'true' : 'false') : 'false';

    // 변경 기록: 이름/아티팩트/세트효과 모두 비교해서 details 생성
    const oldName     = _creatureBtn.getAttribute('data-creature-name')      || '';
    const oldSetEff   = _creatureBtn.getAttribute('data-creature-seteffect') || '';
    const charName    = section?.querySelector('[data-key="info_name"]')?.value || '이름없음';
    const timeStr     = (typeof getCurrentDateTime === 'function') ? getCurrentDateTime() : new Date().toLocaleString();
    const details     = [];

    // 이름 변경
    if (oldName !== name) {
        details.push(`크리쳐 이름: ${oldName || '(빈칸)'} → ${name || '(빈칸)'}`);
    }

    // 세트효과 변경
    if (oldSetEff !== setVal) {
        const oldPreview = oldSetEff ? oldSetEff.replace(/\n/g, ' / ').slice(0, 40) + (oldSetEff.length > 40 ? '...' : '') : '(빈칸)';
        const newPreview = setVal    ? setVal.replace(/\n/g, ' / ').slice(0, 40)    + (setVal.length > 40    ? '...' : '') : '(빈칸)';
        details.push(`세트효과: ${oldPreview} → ${newPreview}`);
    }

    // 아티팩트 변경 비교
    const artLabelMap = {
        '크리쳐_art_red_top_rarity':'RED 희귀도',   '크리쳐_art_red_top_text':'RED 아티팩트명',
        '크리쳐_art_red_stat_물리공격력':'RED 물리공격력', '크리쳐_art_red_stat_마법공격력':'RED 마법공격력',
        '크리쳐_art_red_stat_힘':'RED 힘',           '크리쳐_art_red_stat_지능':'RED 지능',
        '크리쳐_art_red_bg_1':'RED 옵션1 희귀도',    '크리쳐_art_red_opt_1':'RED 옵션1',
        '크리쳐_art_red_bg_2':'RED 옵션2 희귀도',    '크리쳐_art_red_opt_2':'RED 옵션2',
        '크리쳐_art_blue_top_rarity':'BLUE 희귀도',  '크리쳐_art_blue_top_text':'BLUE 아티팩트명',
        '크리쳐_art_blue_stat_공격속도':'BLUE 공격속도','크리쳐_art_blue_stat_캐스팅속도':'BLUE 캐스팅속도',
        '크리쳐_art_blue_stat_이동속도':'BLUE 이동속도','크리쳐_art_blue_stat_적중':'BLUE 적중',
        '크리쳐_art_blue_bg_1':'BLUE 옵션1 희귀도',  '크리쳐_art_blue_opt_1':'BLUE 옵션1',
        '크리쳐_art_blue_bg_2':'BLUE 옵션2 희귀도',  '크리쳐_art_blue_opt_2':'BLUE 옵션2',
        '크리쳐_art_green_top_rarity':'GREEN 희귀도','크리쳐_art_green_top_text':'GREEN 아티팩트명',
        '크리쳐_art_green_stat_HPMAX':'GREEN HP MAX','크리쳐_art_green_stat_MPMAX':'GREEN MP MAX',
        '크리쳐_art_green_stat_모속강':'GREEN 모속강',
        '크리쳐_art_green_bg_1':'GREEN 옵션1 희귀도','크리쳐_art_green_opt_1':'GREEN 옵션1',
        '크리쳐_art_green_bg_2':'GREEN 옵션2 희귀도','크리쳐_art_green_opt_2':'GREEN 옵션2',
    };
    _CREATURE_ART_KEYS.forEach(key => {
        const src    = popup?.querySelector(`[data-creature-art="${key}"]`);
        const hidden = section?.querySelector(`input[type="hidden"][data-key="${key}"]`);
        if (!src || !hidden) return;
        const oldVal = hidden.value || '';
        const newVal = src.value    || '';
        if (oldVal !== newVal) {
            const label = artLabelMap[key] || key;
            details.push(`${label}: ${oldVal || '(빈칸)'} → ${newVal || '(빈칸)'}`);
        }
    });

    if (details.length > 0) {
        AppState.changeHistory.unshift({
            time: timeStr, charName, slot: '크리쳐',
            old: oldName || '(빈칸)',
            new: name    || '(빈칸)',
            details
        });
        if (AppState.changeHistory.length > 10) AppState.changeHistory.pop();
        AppState.saveHistory();
    }

    // 버튼에 저장
    _creatureBtn.setAttribute('data-creature-name',      name);
    _creatureBtn.setAttribute('data-creature-mode',      mode);
    _creatureBtn.setAttribute('data-creature-seteffect', setVal);
    _creatureBtn.setAttribute('data-creature-setauto',   setAuto);
    _creatureBtn.textContent = name;

    // 아티팩트: 팝업 값 → hidden input + 표시 span 반영
    _CREATURE_ART_KEYS.forEach(key => {
        const src    = popup?.querySelector(`[data-creature-art="${key}"]`);
        const hidden = section?.querySelector(`input[type="hidden"][data-key="${key}"]`);
        const disp   = section?.querySelector(`[data-creature-disp="${key}"]`);
        const val    = src ? src.value : '';
        if (hidden) hidden.value = val;
        if (disp) {
            disp.textContent = val;
            if (key.includes('_bg_') || key.includes('_top_rarity')) {
                disp.className = disp.className.replace(/bg-\S+/g, '').trim();
                if (val) disp.classList.add('bg-' + val);
            }
        }
    });

    // desc textarea 반영 (세트효과)
    if (section) {
        const descEl = section.querySelector('textarea[data-key="크리쳐_desc"]');
        if (descEl) descEl.value = setVal;
    }

    creaturePopupClose();
    if (typeof autoSave === 'function') autoSave();
}

/** 크리쳐 팝업 닫기 */
function creaturePopupClose() {
    const overlay = document.getElementById('creature-popup-overlay');
    if (overlay) overlay.style.display = 'none';
    if (window._creatureScrollHandler) {
        window.removeEventListener('scroll', window._creatureScrollHandler);
        window._creatureScrollHandler = null;
    }
    _creatureCharId = null;
    _creatureBtn    = null;
}


// ============================================
// 칭호 팝업
// ============================================

let _titleCharId = null;
let _titleBtn    = null;

/**
 * 칭호 팝업 열기
 */
function openTitlePopup(charId, btn) {
    _titleCharId = charId;
    _titleBtn    = btn;

    const overlay = document.getElementById('title-popup-overlay');
    const popup   = document.getElementById('title-popup');
    if (!overlay || !popup) return;

    // 이름 복원
    const nameInput = document.getElementById('title-popup-name');
    if (nameInput) nameInput.value = btn.getAttribute('data-title-name') || '';

    // 스탯 복원: V4 { base:[{stats:[...], amount:N, unit:''}], eff:[...], desc:'' }
    const savedData = JSON.parse(btn.getAttribute('data-title-stats') || '{}');
    function _buildStatMap(data) {
        const map = {};
        if (!data) return map;
        // V4 배열 구조
        if (Array.isArray(data)) {
            data.forEach(entry => {
                (entry.stats || []).forEach(s => { map[s] = entry.amount; });
            });
        }
        return map;
    }
    const baseMap = _buildStatMap(savedData.base);
    const effMap  = _buildStatMap(savedData.eff);
    popup.querySelectorAll('[data-title-stat]').forEach(input => {
        const raw     = input.getAttribute('data-title-stat');
        const isPct   = raw.endsWith('_pct');
        const key     = isPct ? raw.slice(0, -4) : raw;
        const parts   = key.split('_');
        const type    = parts[parts.length - 1];
        const statKey = parts.slice(0, -1).join('_');
        const val     = (type === 'base' ? baseMap[statKey] : effMap[statKey]);
        input.value   = val !== undefined ? String(val) : '';
    });
    const descTA = document.getElementById('title-popup-desc');
    if (descTA) descTA.value = savedData.desc || '';

    // 팝업 표시: body 직계 자식으로 이동 후 absolute 배치 (스크롤 시 표와 함께 이동)
    if (popup.parentElement !== document.body) {
        document.body.appendChild(popup);
    }
    overlay.style.display = 'block';

    const section_t   = _titleBtn ? _titleBtn.closest('.char-section') : null;
    const infoTable_t = section_t ? section_t.querySelector('.char-info-table') : null;
    const refEl_t     = infoTable_t || (_titleBtn ? _titleBtn.closest('table') : null) || btn;
    const rect_t      = refEl_t.getBoundingClientRect();
    const popupW_t    = popup.offsetWidth  || 1100;
    const vw_t = window.innerWidth;
    let left_t = rect_t.left+60;
    let top_t  = rect_t.top + 30 + window.scrollY;
    if (left_t < 8) left_t = 8;
    if (left_t + popupW_t > vw_t - 8) left_t = vw_t - popupW_t - 8;
    if (top_t  < 8) top_t  = 8;
    popup.style.position = 'absolute';
    popup.style.zIndex   = '3001';
    popup.style.left = left_t + 'px';
    popup.style.top  = top_t  + 'px';
    popup.style.display = 'block';
}

/** 칭호 팝업 저장 */
function titlePopupSave() {
    if (!_titleBtn) { titlePopupClose(); return; }

    const nameInput = document.getElementById('title-popup-name');
    const name = nameInput ? nameInput.value.trim() : '';

    // 스탯 수집: V4 { base:[{stats:[...], amount:N, unit:''}], eff:[...], desc:'' }
    const baseMap = {}, effMap = {};
    const overlay = document.getElementById('title-popup-overlay');
    const popupEl = document.getElementById('title-popup');
    if (popupEl) {
        popupEl.querySelectorAll('[data-title-stat]').forEach(input => {
            const val = input.value.trim();
            if (!val) return;
            const raw     = input.getAttribute('data-title-stat');
            const isPct   = raw.endsWith('_pct');
            const key     = isPct ? raw.slice(0, -4) : raw;
            const parts   = key.split('_');
            const type    = parts[parts.length - 1];
            const statKey = parts.slice(0, -1).join('_');
            const amount  = parseFloat(val) || 0;
            const unit    = isPct ? '%' : '';
            const mapKey  = `${amount}__${unit}`;
            const target  = type === 'base' ? baseMap : effMap;
            if (!target[mapKey]) target[mapKey] = { stats: [], amount, unit };
            target[mapKey].stats.push(statKey);
        });
    }
    const descTA = document.getElementById('title-popup-desc');
    const stats = {
        base: Object.values(baseMap),
        eff:  Object.values(effMap),
        desc: descTA ? descTA.value.trim() : ''
    };

    // 변경 기록
    const oldName = _titleBtn.getAttribute('data-title-name') || '';
    if (_titleCharId) {
        const section  = document.getElementById(_titleCharId);
        const charName = section?.querySelector('[data-key="info_name"]')?.value || '이름없음';
        const timeStr  = (typeof getCurrentDateTime === 'function') ? getCurrentDateTime() : new Date().toLocaleString();

        // 이전 스탯
        const oldStats = JSON.parse(_titleBtn.getAttribute('data-title-stats') || '{}');

        // details: 스탯별 변경 내역
        const details = [];
        const statLabels2 = {
            '힘':'힘','지능':'지능','체력':'체력','정신력':'정신력',
            '적중':'적중','회피':'회피',
            '공격속도':'공격속도','캐스팅속도':'캐스팅속도','이동속도':'이동속도',
            '물리크리티컬':'물리크리','마법크리티컬':'마법크리',
            '물리크리티컬확률':'물리크리확률','마법크리티컬확률':'마법크리확률',
            'HPMAX':'HP MAX','MPMAX':'MP MAX',
            '모든속성강화':'속성강화','모든속성저항':'속성저항',
            '화속강':'화속강','수속강':'수속강','명속강':'명속강','암속강':'암속강',
            '데미지증가':'데미지증가','마을이동속도':'마을이동속도',
        };
        // 이전/이후 스탯을 type 구분 맵으로 변환 (base/eff 분리)
        function _toStatMap(arr, type) {
            const m = {};
            arr.forEach(e => e.stats.forEach(s => { m[`${s}_${type}`] = `${e.amount}${e.unit}`; }));
            return m;
        }
        const oldBaseMap = _toStatMap(oldStats.base || [], 'base');
        const oldEffMap  = _toStatMap(oldStats.eff  || [], 'eff');
        const newBaseMap = _toStatMap(stats.base || [], 'base');
        const newEffMap  = _toStatMap(stats.eff  || [], 'eff');
        const oldStatMap = { ...oldBaseMap, ...oldEffMap };
        const newStatMap = { ...newBaseMap, ...newEffMap };
        const allKeys = [...new Set([...Object.keys(oldStatMap), ...Object.keys(newStatMap)])];
        // [기본](_base) 먼저, [효과](_eff) 나중에 정렬
        allKeys.sort((a, b) => {
            const ta = a.endsWith('_eff') ? 1 : 0;
            const tb = b.endsWith('_eff') ? 1 : 0;
            return ta - tb;
        });
        allKeys.forEach(k => {
            const ov = oldStatMap[k] || '없음';
            const nv = newStatMap[k] || '없음';
            if (ov !== nv) {
                const [statKey, type] = k.split(/_(?=base$|eff$)/);
                const typeLabel = type === 'eff' ? '[효과] ' : '[기본] ';
                details.push(`${typeLabel}${statLabels2[statKey] || statKey}: ${ov} → ${nv}`);
            }
        });
        if (oldName !== name) details.unshift(`이름: ${oldName || '(빈칸)'} → ${name || '(빈칸)'}`);

        const newVal = name === '' ? '(빈칸)' : name;
        const oldVal = oldName === '' ? '(빈칸)' : oldName;

        if (details.length > 0) {
            AppState.changeHistory.unshift({
                time: timeStr, charName, slot: '칭호',
                old: oldVal,
                new: newVal,
                details
            });
            if (AppState.changeHistory.length > 10) AppState.changeHistory.pop();
            AppState.saveHistory();
        }
    }

    // 버튼 업데이트
    _titleBtn.setAttribute('data-title-name', name);
    _titleBtn.setAttribute('data-title-stats', JSON.stringify(stats));
    _titleBtn.textContent = name;

    // desc 자동 입력
    if (_titleCharId) {
        const section = document.getElementById(_titleCharId);
        const descEl = section?.querySelector('[data-key="칭호_desc"]');
        if (descEl) {
            const infoEntry = GameData.TITLE_ITEM_INFO?.[name];
            if (infoEntry?.info) {
                descEl.value = infoEntry.info;
            } else {
                const statLabels = {
                    '힘':'힘', '지능':'지능', '체력':'체력', '정신력':'정신력',
                    '적중':'적중', '회피':'회피',
                    '공격속도':'공격속도', '캐스팅속도':'캐스팅속도', '이동속도':'이동속도',
                    '물리크리티컬':'물리 크리티컬', '마법크리티컬':'마법 크리티컬',
                    '물리크리티컬확률':'물리 크리티컬 확률', '마법크리티컬확률':'마법 크리티컬 확률',
                    'HPMAX':'HP MAX', 'MPMAX':'MP MAX',
                    '모든속성강화':'모든 속성 강화', '모든속성저항':'모든 속성 저항',
                    '화속강':'화속강', '수속강':'수속강', '명속강':'명속강', '암속강':'암속강',
                    '화속성저항':'화속성 저항', '수속성저항':'수속성 저항',
                    '명속성저항':'명속성 저항', '암속성저항':'암속성 저항',
                    '기절내성':'기절 내성', '점프력':'점프력',
                    '데미지증가':'데미지 증가', '마을이동속도':'마을 이동속도 증가',
                };
                function _entriesToLines(arr) {
                    return (arr || []).map(e => {
                        const labels = e.stats.map(s => statLabels[s] || s).join(', ');
                        return `${labels} +${e.amount}${e.unit}`;
                    });
                }
                const baseLines = _entriesToLines(stats.base);
                const effLines  = _entriesToLines(stats.eff);
                const lines = [];
                if (baseLines.length) { lines.push('기본정보'); lines.push(...baseLines); }
                if (effLines.length)  { if (baseLines.length) lines.push('---'); lines.push('효과'); lines.push(...effLines); }
                descEl.value = lines.join('\n');
            }
        }
    }

    titlePopupClose();
    if (typeof autoSave === 'function') autoSave();
}

/** 칭호 팝업 닫기 */
function titlePopupClose() {
    const overlay = document.getElementById('title-popup-overlay');
    const popup   = document.getElementById('title-popup');
    if (overlay) overlay.style.display = 'none';
    if (popup && popup.parentElement !== overlay) {
        overlay.appendChild(popup);
        popup.style.display = '';
    }
    _titleCharId = null;
    _titleBtn    = null;
}


let _auraCharId = null;
let _auraBtn    = null;

/**
 * 오라 팝업 열기
 */
function openAuraPopup(charId, btn) {
    _auraCharId = charId;
    _auraBtn    = btn;

    const overlay = document.getElementById('aura-popup-overlay');
    const popup   = document.getElementById('aura-popup');
    if (!overlay || !popup) return;

    // 이름 복원
    const nameInput = document.getElementById('aura-popup-name');
    if (nameInput) nameInput.value = btn.getAttribute('data-aura-name') || '';

    // 스탯 복원: V4 { base:[{stats:[...], amount:N, unit:''}], eff:[...], desc:'' }
    const savedData = JSON.parse(btn.getAttribute('data-aura-stats') || '{}');
    function _buildStatMap(data) {
        const map = {};
        if (!data) return map;
        // V4 배열 구조
        if (Array.isArray(data)) {
            data.forEach(entry => {
                (entry.stats || []).forEach(s => { map[s] = entry.amount; });
            });
        }
        return map;
    }
    const baseMap = _buildStatMap(savedData.base);
    const effMap  = _buildStatMap(savedData.eff);
    popup.querySelectorAll('[data-aura-stat]').forEach(input => {
        const raw     = input.getAttribute('data-aura-stat');
        const isPct   = raw.endsWith('_pct');
        const key     = isPct ? raw.slice(0, -4) : raw;
        const parts   = key.split('_');
        const type    = parts[parts.length - 1];
        const statKey = parts.slice(0, -1).join('_');
        const val     = (type === 'base' ? baseMap[statKey] : effMap[statKey]);
        input.value   = val !== undefined ? String(val) : '';
    });
    const descTA = document.getElementById('aura-popup-desc');
    if (descTA) descTA.value = savedData.desc || '';

    // 팝업 표시: body 직계 자식으로 이동 후 absolute 배치 (스크롤 시 표와 함께 이동)
    if (popup.parentElement !== document.body) {
        document.body.appendChild(popup);
    }
    overlay.style.display = 'block';

    const section_a   = _auraBtn ? _auraBtn.closest('.char-section') : null;
    const infoTable_a = section_a ? section_a.querySelector('.char-info-table') : null;
    const refEl_a     = infoTable_a || (_auraBtn ? _auraBtn.closest('table') : null) || btn;
    const rect_a      = refEl_a.getBoundingClientRect();
    const popupW_a    = popup.offsetWidth  || 1100;
    const vw_a = window.innerWidth;
    let left_a = rect_a.left+60;
    let top_a  = rect_a.top + 30 + window.scrollY;
    if (left_a < 8) left_a = 8;
    if (left_a + popupW_a > vw_a - 8) left_a = vw_a - popupW_a - 8;
    if (top_a  < 8) top_a  = 8;
    popup.style.position = 'absolute';
    popup.style.zIndex   = '3001';
    popup.style.left = left_a + 'px';
    popup.style.top  = top_a  + 'px';
    popup.style.display = 'block';
}

/** 오라 팝업 저장 */
function auraPopupSave() {
    if (!_auraBtn) { auraPopupClose(); return; }

    const nameInput = document.getElementById('aura-popup-name');
    const name = nameInput ? nameInput.value.trim() : '';

    // 스탯 수집: V4 { base:[{stats:[...], amount:N, unit:''}], eff:[...], desc:'' }
    const baseMap = {}, effMap = {};
    const overlay = document.getElementById('aura-popup-overlay');
    const popupEl = document.getElementById('aura-popup');
    if (popupEl) {
        popupEl.querySelectorAll('[data-aura-stat]').forEach(input => {
            const val = input.value.trim();
            if (!val) return;
            const raw     = input.getAttribute('data-aura-stat');
            const isPct   = raw.endsWith('_pct');
            const key     = isPct ? raw.slice(0, -4) : raw;
            const parts   = key.split('_');
            const type    = parts[parts.length - 1];
            const statKey = parts.slice(0, -1).join('_');
            const amount  = parseFloat(val) || 0;
            const unit    = isPct ? '%' : '';
            const mapKey  = `${amount}__${unit}`;
            const target  = type === 'base' ? baseMap : effMap;
            if (!target[mapKey]) target[mapKey] = { stats: [], amount, unit };
            target[mapKey].stats.push(statKey);
        });
    }
    const descTA = document.getElementById('aura-popup-desc');
    const stats = {
        base: Object.values(baseMap),
        eff:  Object.values(effMap),
        desc: descTA ? descTA.value.trim() : ''
    };

    // 변경 기록
    const oldName = _auraBtn.getAttribute('data-aura-name') || '';
    if (_auraCharId) {
        const section  = document.getElementById(_auraCharId);
        const charName = section?.querySelector('[data-key="info_name"]')?.value || '이름없음';
        const timeStr  = (typeof getCurrentDateTime === 'function') ? getCurrentDateTime() : new Date().toLocaleString();

        // 이전 스탯
        const oldStats = JSON.parse(_auraBtn.getAttribute('data-aura-stats') || '{}');

        // details: 스탯별 변경 내역
        const details = [];
        const statLabels2 = {
            '힘':'힘','지능':'지능','체력':'체력','정신력':'정신력',
            '적중':'적중','회피':'회피',
            '공격속도':'공격속도','캐스팅속도':'캐스팅속도','이동속도':'이동속도',
            '물리크리티컬':'물리크리','마법크리티컬':'마법크리',
            '물리크리티컬확률':'물리크리확률','마법크리티컬확률':'마법크리확률',
            'HPMAX':'HP MAX','MPMAX':'MP MAX',
            '모든속성강화':'속성강화','모든속성저항':'속성저항',
            '화속강':'화속강','수속강':'수속강','명속강':'명속강','암속강':'암속강',
            '데미지증가':'데미지증가','마을이동속도':'마을이동속도',
        };
        // 이전/이후 스탯을 type 구분 맵으로 변환 (base/eff 분리)
        function _toStatMap(arr, type) {
            const m = {};
            arr.forEach(e => e.stats.forEach(s => { m[`${s}_${type}`] = `${e.amount}${e.unit}`; }));
            return m;
        }
        const oldBaseMap = _toStatMap(oldStats.base || [], 'base');
        const oldEffMap  = _toStatMap(oldStats.eff  || [], 'eff');
        const newBaseMap = _toStatMap(stats.base || [], 'base');
        const newEffMap  = _toStatMap(stats.eff  || [], 'eff');
        const oldStatMap = { ...oldBaseMap, ...oldEffMap };
        const newStatMap = { ...newBaseMap, ...newEffMap };
        const allKeys = [...new Set([...Object.keys(oldStatMap), ...Object.keys(newStatMap)])];
        // [기본](_base) 먼저, [효과](_eff) 나중에 정렬
        allKeys.sort((a, b) => {
            const ta = a.endsWith('_eff') ? 1 : 0;
            const tb = b.endsWith('_eff') ? 1 : 0;
            return ta - tb;
        });
        allKeys.forEach(k => {
            const ov = oldStatMap[k] || '없음';
            const nv = newStatMap[k] || '없음';
            if (ov !== nv) {
                const [statKey, type] = k.split(/_(?=base$|eff$)/);
                const typeLabel = type === 'eff' ? '[효과] ' : '[기본] ';
                details.push(`${typeLabel}${statLabels2[statKey] || statKey}: ${ov} → ${nv}`);
            }
        });
        if (oldName !== name) details.unshift(`이름: ${oldName || '(빈칸)'} → ${name || '(빈칸)'}`);

        const newVal = name === '' ? '(빈칸)' : name;
        const oldVal = oldName === '' ? '(빈칸)' : oldName;

        if (details.length > 0) {
            AppState.changeHistory.unshift({
                time: timeStr, charName, slot: '오라',
                old: oldVal,
                new: newVal,
                details
            });
            if (AppState.changeHistory.length > 10) AppState.changeHistory.pop();
            AppState.saveHistory();
        }
    }

    // 버튼 업데이트
    _auraBtn.setAttribute('data-aura-name', name);
    _auraBtn.setAttribute('data-aura-stats', JSON.stringify(stats));
    _auraBtn.textContent = name;

    // desc 자동 입력
    if (_auraCharId) {
        const section = document.getElementById(_auraCharId);
        const descEl = section?.querySelector('[data-key="오라_desc"]');
        if (descEl) {
            const infoEntry = GameData.AURA_ITEM_INFO?.[name];
            if (infoEntry?.info) {
                descEl.value = infoEntry.info;
            } else {
                const statLabels = {
                    '힘':'힘', '지능':'지능', '체력':'체력', '정신력':'정신력',
                    '적중':'적중', '회피':'회피',
                    '공격속도':'공격속도', '캐스팅속도':'캐스팅속도', '이동속도':'이동속도',
                    '물리크리티컬':'물리 크리티컬', '마법크리티컬':'마법 크리티컬',
                    '물리크리티컬확률':'물리 크리티컬 확률', '마법크리티컬확률':'마법 크리티컬 확률',
                    'HPMAX':'HP MAX', 'MPMAX':'MP MAX',
                    '모든속성강화':'모든 속성 강화', '모든속성저항':'모든 속성 저항',
                    '화속강':'화속강', '수속강':'수속강', '명속강':'명속강', '암속강':'암속강',
                    '화속성저항':'화속성 저항', '수속성저항':'수속성 저항',
                    '명속성저항':'명속성 저항', '암속성저항':'암속성 저항',
                    '기절내성':'기절 내성', '점프력':'점프력',
                    '데미지증가':'데미지 증가', '마을이동속도':'마을 이동속도 증가',
                };
                function _entriesToLines(arr) {
                    return (arr || []).map(e => {
                        const labels = e.stats.map(s => statLabels[s] || s).join(', ');
                        return `${labels} +${e.amount}${e.unit}`;
                    });
                }
                const baseLines = _entriesToLines(stats.base);
                const effLines  = _entriesToLines(stats.eff);
                const lines = [];
                if (baseLines.length) { lines.push('기본정보'); lines.push(...baseLines); }
                if (effLines.length)  { if (baseLines.length) lines.push('---'); lines.push('효과'); lines.push(...effLines); }
                descEl.value = lines.join('\n');
            }
        }
    }

    auraPopupClose();
    if (typeof autoSave === 'function') autoSave();
}

/** 오라 팝업 닫기 */
function auraPopupClose() {
    const overlay = document.getElementById('aura-popup-overlay');
    const popup   = document.getElementById('aura-popup');
    if (overlay) overlay.style.display = 'none';
    if (popup && popup.parentElement !== overlay) {
        overlay.appendChild(popup);
        popup.style.display = '';
    }
    _auraCharId = null;
    _auraBtn    = null;
}


// ============================================
// 아바타 팝업
// ============================================


/**
 * AVATAR_WEAPON_STATS 항목 → select option value 인코딩
 * stats 배열을 쉼표로 join, amount는 파이프로 구분
 * 예: ["힘","지능","체력","정신력"] + 18 → "힘,지능,체력,정신력|18"
 *     ["무기 아바타 수치"] + null    → "무기 아바타 수치"
 */
function _encodeWeaponStatValue(item) {
    if (!item.stats || item.stats.length === 0) return '';
    const statStr = item.stats.join(',');
    return item.amount !== null ? `${statStr}|${item.amount}` : statStr;
}

/**
 * 아바타 weapon_stat select에 AVATAR_WEAPON_STATS 옵션을 채운다.
 * section 내 [data-key="아바타_weapon_stat"] select를 찾아 초기화.
 * optgroup 항목은 <optgroup label="...">으로 렌더링하여 선택 불가, 흰색 글자 유지
 */
function initAvatarWeaponStatSelect(section) {
    const sel = section.querySelector('[data-key="아바타_weapon_stat"]');
    if (!sel) return;

    // optgroup 항목은 <optgroup label="...">으로, 일반 항목은 <option>으로 렌더링
    sel.innerHTML = AVATAR_WEAPON_STATS.map(item =>
        item.optgroup
            ? `<optgroup label="${item.label}"></optgroup>`
            : `<option value="${_encodeWeaponStatValue(item)}">${item.label}</option>`
    ).join('');
}

/**
 * 저장 텍스트 "모자(언커먼) 상의(레어)" → 색상 span HTML로 변환
 */
function renderAvatarBtnHTML(text) {
    if (!text) return '';
    const SEP = '<span style="color:var(--color-white);"> </span>';
    return text.split(' ')
        .filter(t => t)
        .map(token => {
            const m = token.match(/^(.+)\((.+)\)$/);
            if (m) {
                const cls = AVATAR_GRADE_CLASS[m[2]] || '';
                return `<span class="${cls}">${token}</span>`;
            }
            return `<span>${token}</span>`;
        })
        .join(SEP);
}

// 현재 팝업 대상 정보
// _avatarCharId → UIState.avatarCharId (state.js)
// _avatarBtn     → UIState.avatarBtn     (state.js)

/**
 * 아바타 팝업 열기
 * @param {string} charId
 * @param {HTMLElement} btn - 아바타_itemname 버튼
 */
function openAvatarPopup(charId, btn) {
    UIState.avatarCharId = charId;
    UIState.avatarBtn = btn;

    // 현재 저장된 값 파싱: "모자(언커먼) 상의(레어)" → { 모자: '언커먼', 상의: '레어' }
    // innerHTML에 span이 있을 수 있으므로 data-avatar-value 속성 우선 사용
    const currentText = btn.getAttribute('data-avatar-value') || btn.textContent || '';
    const currentMap = {};
    const re = /([^\s(]+)\(([^)]+)\)/g;
    let m;
    while ((m = re.exec(currentText)) !== null) {
        currentMap[m[1]] = m[2];
    }

    // 그리드 생성
    const grid = document.getElementById('avatar-popup-grid');
    if (!grid) return;
    grid.innerHTML = '';

    // 헤더 행 - 클릭 시 해당 등급 전체 체크/해제
    function makeHeader() {
        const header = document.createElement('div');
        header.style.cssText = 'display:grid; grid-template-columns:50px 44px 44px 16em; gap:4px; align-items:center; margin-bottom:2px;';

        header.appendChild(document.createElement('span')); // 파츠명 빈칸

        AVATAR_GRADES.forEach(grade => {
            const gradeColor = grade === '언커먼' ? '#4dabf7' : '#b197fc';
            const span = document.createElement('span');
            span.textContent = grade;
            span.style.cssText = `cursor:pointer; user-select:none; text-align:center; font-size:0.85em; font-weight:bold; color:${gradeColor};`;
            span.title = `${grade} 전체 체크/해제`;

            span.addEventListener('mouseenter', () => { span.style.opacity = '0.7'; });
            span.addEventListener('mouseleave', () => { span.style.opacity = '1'; });

            span.addEventListener('click', () => {
                const allCbs = AVATAR_PARTS.map(p => document.getElementById(`avatar-cb-${p}-${grade}`)).filter(Boolean);
                const allChecked = allCbs.every(c => c.checked);
                allCbs.forEach(c => {
                    c.checked = !allChecked;
                    if (!allChecked) {
                        AVATAR_GRADES.forEach(g => {
                            if (g !== grade) {
                                const other = document.getElementById(`avatar-cb-${c.getAttribute('data-part')}-${g}`);
                                if (other) other.checked = false;
                            }
                        });
                    }
                    // 스탯 갱신
                    c.dispatchEvent(new Event('change'));
                });
            });

            header.appendChild(span);
        });

        header.appendChild(document.createElement('span')); // 스탯 열 빈칸

        return header;
    }

    grid.appendChild(makeHeader());
    grid.appendChild(makeHeader());

    // 부위 행 (5개 + 4개로 2열)
    const left5  = AVATAR_PARTS.slice(0, 5);
    const right4 = AVATAR_PARTS.slice(5, 9);

    function makeRow(part) {
        // 파츠명 | □(언커먼) | □(레어) | 스탯(고정너비)
        const row = document.createElement('div');
        row.style.cssText = 'display:grid; grid-template-columns:50px 44px 44px 16em; gap:4px; align-items:center;';

        const label = document.createElement('span');
        label.textContent = part;
        label.style.cssText = 'font-size:0.95em; text-align:right; padding-right:4px;';
        row.appendChild(label);

        let checkedGrade = currentMap[part] || null;

        // 스탯 표시 span - 고정너비(16em = 가장 긴 문장 기준)
        const statSpan = document.createElement('span');
        statSpan.style.cssText = 'font-size:0.82em; white-space:nowrap; overflow:hidden;';

        function updateStatSpan() {
            const uncomCb = document.getElementById(`avatar-cb-${part}-언커먼`);
            const rareCb  = document.getElementById(`avatar-cb-${part}-레어`);
            if (uncomCb?.checked) {
                const d = AVATAR_PART_STATS[part]?.['언커먼'];
                statSpan.textContent = d?.label || '';
                statSpan.style.color = '#4dabf7'; // --txt-uncom 파란색
            } else if (rareCb?.checked) {
                const d = AVATAR_PART_STATS[part]?.['레어'];
                statSpan.textContent = d?.label || '';
                statSpan.style.color = '#b197fc'; // --txt-rare 보라색
            } else {
                statSpan.textContent = '';
            }
        }

        AVATAR_GRADES.forEach(grade => {
            const wrapper = document.createElement('div');
            wrapper.style.cssText = 'display:flex; justify-content:center; align-items:center;';

            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.setAttribute('data-part', part);
            cb.setAttribute('data-grade', grade);
            cb.id = `avatar-cb-${part}-${grade}`;
            cb.checked = (checkedGrade === grade);
            cb.style.cssText = 'width:16px; height:16px; cursor:pointer;';

            cb.addEventListener('change', () => {
                if (cb.checked) {
                    AVATAR_GRADES.forEach(g => {
                        if (g !== grade) {
                            const other = document.getElementById(`avatar-cb-${part}-${g}`);
                            if (other) other.checked = false;
                        }
                    });
                }
                updateStatSpan();
            });

            wrapper.appendChild(cb);
            row.appendChild(wrapper);
        });

        row.appendChild(statSpan);

        // 초기 로드 시 저장된 값 반영
        setTimeout(updateStatSpan, 0);

        return row;
    }

    // 좌우 2컬럼 레이아웃
    const colLeft  = document.createElement('div');
    const colRight = document.createElement('div');
    colLeft.style.cssText  = 'display:flex; flex-direction:column; gap:4px;';
    colRight.style.cssText = 'display:flex; flex-direction:column; gap:4px;';

    left5.forEach(part  => colLeft.appendChild(makeRow(part)));
    right4.forEach(part => colRight.appendChild(makeRow(part)));

    grid.appendChild(colLeft);
    grid.appendChild(colRight);

    // 팝업 표시
    const overlay = document.getElementById('avatar-popup-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
}

/** 아바타 팝업 저장 */
function avatarPopupSave() {
    const parts = [];  // 저장용 순수 텍스트

    AVATAR_PARTS.forEach(part => {
        AVATAR_GRADES.forEach(grade => {
            const cb = document.getElementById(`avatar-cb-${part}-${grade}`);
            if (cb && cb.checked) {
                parts.push(`${part}(${grade})`);
            }
        });
    });

    const rawVal = parts.join(' ');

    // 변경 기록: 저장 전 이전 값과 비교
    if (UIState.avatarBtn && UIState.avatarCharId) {
        const oldVal = UIState.avatarBtn.getAttribute('data-avatar-value') || '';
        if (oldVal !== rawVal) {
            const charId = UIState.avatarCharId;
            const section = document.getElementById(charId);
            const charName = section?.querySelector('[data-key="info_name"]')?.value || '이름없음';
            const timeStr = (typeof getCurrentDateTime === 'function') ? getCurrentDateTime() : new Date().toLocaleString();
            AppState.changeHistory.unshift({
                time: timeStr,
                charName: charName,
                slot: '아바타',
                old: oldVal === '' ? '(빈칸)' : oldVal,
                new: rawVal === '' ? '(빈칸)' : rawVal
            });
            if (AppState.changeHistory.length > 10) AppState.changeHistory.pop();
            AppState.saveHistory();
        }
    }

    if (UIState.avatarBtn) {
        UIState.avatarBtn.setAttribute('data-avatar-value', rawVal);
        UIState.avatarBtn.innerHTML = renderAvatarBtnHTML(rawVal);
    }

    avatarPopupClose();
    if (typeof autoSave === 'function') autoSave();
}

/** 아바타 팝업 닫기 */
function avatarPopupClose() {
    const overlay = document.getElementById('avatar-popup-overlay');
    if (overlay) overlay.style.display = 'none';
    UIState.avatarCharId = null;
    UIState.avatarBtn = null;
}