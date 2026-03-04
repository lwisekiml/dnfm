// ============================================
// ui-character.js - 캐릭터 관리 UI (템플릿 리팩토링 완료)
// ============================================

// 캐릭터 추가 동기화 무한루프 방지 플래그
let _syncInProgress = false;

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
    } else if (!_syncInProgress) {
        // 신규 추가 (savedData 없음) 시 project2 characters 배열에도 동기화
        _syncInProgress = true;
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
        _syncInProgress = false;
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
        const _imgSlots = ['상의','하의','어깨','벨트','신발','팔찌','목걸이','반지','귀걸이','마법석','보조장비','칭호','외형칭호','오라'];
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

function initializePrefixSelects(section) {
    section.querySelectorAll('select[data-key$="_prefix"]').forEach(sel => {
        const slot = sel.getAttribute('data-slot');
        const raritySel = section.querySelector(`select[data-key="${slot}_rarity"]`);

        updateStyle(sel, 'prefix', true);

        if (raritySel) {
            updateStyle(raritySel, 'rarity', true);
        }
    });

    // 칭호/외형칭호/오라는 prefix가 없으므로 rarity를 직접 트리거해 itemname을 select로 교체
    ['칭호', '외형칭호', '오라'].forEach(slot => {
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

    // 2-b) 아바타 버튼 & weapon_stat select 복원
    const avatarBtn = section.querySelector('button[data-key="아바타_itemname"]');
    if (avatarBtn) {
        const avatarInputs = savedData?.inputs?.['아바타'] || {};

        // weapon_stat select 옵션 먼저 채우기
        initAvatarWeaponStatSelect(section);

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
// 아바타 팝업
// ============================================

const AVATAR_PARTS = ["모자", "얼굴", "상의", "목가슴", "신발", "머리", "하의", "허리", "피부"];
const AVATAR_GRADES = ["언커먼", "레어"];

// 희귀도별 CSS 클래스
const AVATAR_GRADE_CLASS = { '언커먼': 'rare-언커먼', '레어': 'rare-레어' };

/**
 * 무기 아바타 수치 선택지 데이터
 * - label      : 화면에 표시될 텍스트
 * - stats      : 저장 시 스탯 키 배열 (JSON 저장용, 단일 수치면 배열 1개)
 * - amount     : 저장 시 숫자값 (없으면 null)
 * - optgroup    : true 이면 optgroup으로 렌더링 (선택 불가, 흰색 글자 유지)
 *
 * 추가 시 이 배열에만 항목을 넣으면 select에 자동 반영됨
 */
const AVATAR_WEAPON_STATS = [
    { label: '',                             stats: [],                                       amount: null                      },
    { label: '무기 아바타 수치',               stats: ['무기 아바타 수치'],                        amount: null, optgroup: true     },
    { label: '힘, 지능, 체력, 정신력 +18',     stats: ['힘', '지능', '체력', '정신력'],             amount: 18                        },
];

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
let _avatarCharId = null;
let _avatarBtn = null;

/**
 * 아바타 팝업 열기
 * @param {string} charId
 * @param {HTMLElement} btn - 아바타_itemname 버튼
 */
function openAvatarPopup(charId, btn) {
    _avatarCharId = charId;
    _avatarBtn = btn;

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
        header.style.cssText = 'display:grid; grid-template-columns:60px 1fr 1fr; gap:4px; align-items:center; font-size:0.85em; text-align:center;';

        header.appendChild(document.createElement('span')); // 빈 칸

        AVATAR_GRADES.forEach(grade => {
            const span = document.createElement('span');
            span.textContent = grade;
            span.style.cssText = 'cursor:pointer; user-select:none; padding:2px 4px; border-radius:4px; color:#aaa;';
            span.title = `${grade} 전체 체크/해제`;

            // 호버 효과
            span.addEventListener('mouseenter', () => { span.style.color = '#fff'; span.style.background = 'rgba(255,255,255,0.1)'; });
            span.addEventListener('mouseleave', () => { span.style.color = '#aaa'; span.style.background = ''; });

            // 클릭: 해당 등급 전체 체크 (이미 전부 체크면 전체 해제)
            span.addEventListener('click', () => {
                const allCbs = AVATAR_PARTS.map(p => document.getElementById(`avatar-cb-${p}-${grade}`)).filter(Boolean);
                const allChecked = allCbs.every(c => c.checked);
                allCbs.forEach(c => {
                    c.checked = !allChecked;
                    // 같은 부위 다른 등급 해제
                    if (!allChecked) {
                        AVATAR_GRADES.forEach(g => {
                            if (g !== grade) {
                                const other = document.getElementById(`avatar-cb-${c.getAttribute('data-part')}-${g}`);
                                if (other) other.checked = false;
                            }
                        });
                    }
                });
            });

            header.appendChild(span);
        });

        return header;
    }

    grid.appendChild(makeHeader());
    grid.appendChild(makeHeader());

    // 부위 행 (5개 + 4개로 2열)
    const left5  = AVATAR_PARTS.slice(0, 5);
    const right4 = AVATAR_PARTS.slice(5, 9);

    function makeRow(part) {
        const row = document.createElement('div');
        row.style.cssText = 'display:grid; grid-template-columns:60px 1fr 1fr; gap:4px; align-items:center;';

        const label = document.createElement('span');
        label.textContent = part;
        label.style.cssText = 'font-size:0.95em; text-align:right; padding-right:6px;';
        row.appendChild(label);

        let checkedGrade = currentMap[part] || null;

        AVATAR_GRADES.forEach(grade => {
            const wrapper = document.createElement('div');
            wrapper.style.cssText = 'display:flex; justify-content:center; align-items:center;';

            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.setAttribute('data-part', part);
            cb.setAttribute('data-grade', grade);
            cb.id = `avatar-cb-${part}-${grade}`;
            cb.checked = (checkedGrade === grade);
            cb.style.cssText = 'width:20px; height:20px; cursor:pointer;';

            // 같은 부위에서 하나만 체크
            cb.addEventListener('change', () => {
                if (cb.checked) {
                    AVATAR_GRADES.forEach(g => {
                        if (g !== grade) {
                            const other = document.getElementById(`avatar-cb-${part}-${g}`);
                            if (other) other.checked = false;
                        }
                    });
                }
            });

            wrapper.appendChild(cb);
            row.appendChild(wrapper);
        });

        return row;
    }

    left5.forEach(part => grid.appendChild(makeRow(part)));
    right4.forEach(part => grid.appendChild(makeRow(part)));

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

    if (_avatarBtn) {
        _avatarBtn.setAttribute('data-avatar-value', rawVal);
        _avatarBtn.innerHTML = renderAvatarBtnHTML(rawVal);
    }

    avatarPopupClose();
    if (typeof autoSave === 'function') autoSave();
}

/** 아바타 팝업 닫기 */
function avatarPopupClose() {
    const overlay = document.getElementById('avatar-popup-overlay');
    if (overlay) overlay.style.display = 'none';
    _avatarCharId = null;
    _avatarBtn = null;
}