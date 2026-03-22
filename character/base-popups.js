// ============================================
// base-popups.js - 팝업 관리 (칭호/오라/크리쳐/아바타/무기아바타)
// ============================================

// ============================================
// 공통 상수 및 헬퍼 함수
// ============================================

const _STAT_LABELS = {
    '힘':'힘', '지능':'지능', '체력':'체력', '정신력':'정신력',
    '적중':'적중', '회피':'회피',
    '공격속도':'공격속도', '캐스팅속도':'캐스팅속도', '이동속도':'이동속도',
    '물리 크리티컬':'물리 크리티컬', '마법 크리티컬':'마법 크리티컬',
    '물리 크리티컬 확률':'물리 크리티컬 확률', '마법 크리티컬 확률':'마법 크리티컬 확률',
    'HP MAX':'HP MAX', 'MP MAX':'MP MAX',
    '모든 속성 강화':'모든 속성 강화', '모든 속성 저항':'모든 속성 저항',
    '화속강':'화속강', '수속강':'수속강', '명속강':'명속강', '암속강':'암속강',
    '화속성 저항':'화속성 저항', '수속성 저항':'수속성 저항',
    '명속성 저항':'명속성 저항', '암속성 저항':'암속성 저항',
    '기절 내성':'기절 내성', '점프력':'점프력',
    '데미지 증가':'데미지 증가', '마을 이동속도 증가':'마을 이동속도 증가',
    '물리 공격력 증가':'물리 공격력 증가', '마법 공격력 증가':'마법 공격력 증가',
    '공격 시 추가 데미지':'공격 시 추가 데미지',
};

/**
 * 스탯 배열 → { statKey_type: "amount+unit" } 맵 변환
 * @param {Array} arr   stats 배열 (base 또는 eff)
 * @param {string} type 'base' | 'eff'
 */
function _toStatMap(arr, type) {
    const m = {};
    arr.forEach(e => e.stats.forEach(s => { m[`${s}_${type}`] = `${e.amount}${e.unit}`; }));
    return m;
}

/**
 * 스탯 배열 → popup 복원용 { statKey: amount } 맵 변환
 * @param {Array|null} data base 또는 eff 배열
 */
function _buildStatMap(data) {
    const map = {};
    if (!data) return map;
    if (Array.isArray(data)) {
        data.forEach(entry => {
            (entry.stats || []).forEach(s => { map[s] = entry.amount; });
        });
    }
    return map;
}

/**
 * 스탯 그룹 정의 (순서대로 출력)
 */
const _STAT_GROUPS = [
    ['힘', '지능', '체력', '정신력'],
    ['적중', '회피'],
    ['공격속도', '캐스팅속도', '이동속도'],
    ['물리 크리티컬', '마법 크리티컬'],
    ['물리 크리티컬 확률', '마법 크리티컬 확률'],
    ['HP MAX', 'MP MAX'],
    ['모든 속성 강화', '모든 속성 저항'],
    ['화속강', '수속강', '명속강', '암속강'],
    ['화속성 저항', '수속성 저항', '명속성 저항', '암속성 저항'],
    ['기절 내성'],
    ['점프력'],
    ['데미지 증가'],
    ['마을 이동속도 증가'],
    ['물리 공격력 증가', '마법 공격력 증가'],
    ['공격 시 추가 데미지']
];

/**
 * 스탯 배열 → desc textarea 용 문자열 배열 변환 (그룹별 정렬)
 * @param {Array} arr base 또는 eff 배열: [{stats:['힘','지능'], amount:50, unit:''}, ...]
 * @returns {Array} 정렬된 라인 배열
 */
function _entriesToLines(arr) {
    if (!arr || arr.length === 0) return [];

    // 스탯별로 {stat: amount+unit} 맵 생성
    const statMap = {};
    arr.forEach(entry => {
        const valStr = `${entry.amount}${entry.unit}`;
        entry.stats.forEach(stat => {
            statMap[stat] = valStr;
        });
    });

    const lines = [];

    // 그룹별로 순회
    _STAT_GROUPS.forEach(group => {
        // 이 그룹에 속한 스탯들 중 실제 값이 있는 것만 추출
        const groupStats = group.filter(stat => statMap[stat] !== undefined);
        if (groupStats.length === 0) return;

        // 같은 수치끼리 묶기: {수치: [스탯들]}
        const valueMap = {};
        groupStats.forEach(stat => {
            const val = statMap[stat];
            if (!valueMap[val]) valueMap[val] = [];
            valueMap[val].push(stat);
        });

        // 그룹 내에서 원래 순서 유지하면서 출력
        const usedValues = new Set();
        groupStats.forEach(stat => {
            const val = statMap[stat];
            if (usedValues.has(val)) return; // 이미 출력한 수치는 스킵
            usedValues.add(val);

            const statsWithSameValue = valueMap[val];
            const labels = statsWithSameValue.map(s => _STAT_LABELS[s] || s).join(', ');
            lines.push(`${labels} +${val}`);
        });
    });

    return lines;
}

// 캐릭터 추가 동기화 무한루프 방지 플래그
// _syncInProgress → UIState.syncInProgress (core-state.js)

/**
 * 캐릭터 테이블 생성 (템플릿 방식)
 */


// ============================================
// 크리쳐 팝업
// ============================================

let _creatureCharId = null;
let _creatureBtn    = null;

const _CREATURE_ART_KEYS = [
    '크리쳐_art_red_top_rarity',  '크리쳐_art_red_top_text',
    '크리쳐_art_red_stat_물리 공격력', '크리쳐_art_red_stat_마법 공격력',
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
// ============================================
// 공통 자동완성 드롭다운 시스템
// ============================================

/**
 * 드롭다운 표시
 * @param {string} ddId      - ul 요소 id
 * @param {string[]} items   - 후보 목록
 * @param {function} onSelect - 항목 선택 콜백(name, ...extraArgs)
 * @param {...*} extraArgs
 */
function acDropdownShow(ddId, items, onSelect, ...extraArgs) {
    const dd = document.getElementById(ddId);
    if (!dd) return;
    if (items.length === 0) { dd.style.display = 'none'; return; }

    // items가 [{group, names}] 형태면 그룹 렌더링, 아니면 기존 방식
    const isGrouped = items.length > 0 && typeof items[0] === 'object' && items[0].group !== undefined;

    if (isGrouped) {
        let idx = 0;
        dd.innerHTML = items.map(({ group, names }) => {
            if (!names.length) return '';
            const labelHtml = `<li class="ac-dropdown-group-label">${group}</li>`;
            const itemsHtml = names.map(name =>
                `<li data-idx="${idx++}" data-name="${name}">${name}</li>`
            ).join('');
            return labelHtml + itemsHtml;
        }).join('');
    } else {
        dd.innerHTML = items.map((name, i) =>
            `<li data-idx="${i}" data-name="${name}">${name}</li>`
        ).join('');
    }

    dd.querySelectorAll('li:not(.ac-dropdown-group-label)').forEach(li => {
        li.addEventListener('mousedown', e => {
            e.preventDefault();
            onSelect(li.getAttribute('data-name'), ...extraArgs);
            dd.style.display = 'none';
        });
    });
    dd.style.display = 'block';
}

/**
 * 방향키 / Enter / Escape 처리
 */
function acDropdownKeydown(e, ddId, onSelect, ...extraArgs) {
    const dd = document.getElementById(ddId);
    if (!dd || dd.style.display === 'none') return;
    const items = Array.from(dd.querySelectorAll('li:not(.ac-dropdown-group-label)'));
    if (!items.length) return;

    const active = dd.querySelector('li.ac-active');
    let idx = active ? parseInt(active.getAttribute('data-idx')) : -1;

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        idx = Math.min(idx + 1, items.length - 1);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        idx = Math.max(idx - 1, 0);
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (active) {
            onSelect(active.getAttribute('data-name'), ...extraArgs);
            dd.style.display = 'none';
        }
        return;
    } else if (e.key === 'Escape') {
        dd.style.display = 'none';
        return;
    } else {
        return;
    }

    items.forEach(li => li.classList.remove('ac-active'));
    const target = items[idx];
    if (target) {
        target.classList.add('ac-active');
        target.scrollIntoView({ block: 'nearest' });
    }
}

/** 드롭다운 외부 클릭 시 닫기 (최초 1회 등록) */
function _acDropdownInit() {
    if (window._acDropdownListenerAdded) return;
    window._acDropdownListenerAdded = true;
    document.addEventListener('mousedown', e => {
        document.querySelectorAll('.ac-dropdown').forEach(dd => {
            if (!dd.contains(e.target) && !dd.previousElementSibling?.contains(e.target)) {
                dd.style.display = 'none';
            }
        });
    });
}

// ============================================
// 크리쳐 이름 자동완성
// ============================================

/** 크리쳐 이름 드롭다운 표시 + 스킬 효과 갱신 */
function creatureNameDropdownShow() {
    const input = document.getElementById('creature-popup-name-text');
    if (!input || typeof CREATURE_ITEM_INFO === 'undefined') return;
    const val = input.value.trim();

    const gradeOrder = ['에픽', '유니크', '레어', '언커먼', '커먼'];
    const grouped = {};
    gradeOrder.forEach(g => { grouped[g] = []; });

    Object.entries(CREATURE_ITEM_INFO).forEach(([name, data]) => {
        if (val && !name.includes(val)) return;
        const g = data.grade || '기타';
        if (!grouped[g]) grouped[g] = [];
        grouped[g].push(name);
    });

    gradeOrder.forEach(g => {
        grouped[g].sort((a, b) => a.localeCompare(b, 'ko'));
    });

    const candidates = gradeOrder
        .filter(g => grouped[g].length > 0)
        .map(g => ({ group: g, names: grouped[g] }));

    const totalCount = candidates.reduce((s, c) => s + c.names.length, 0);
    if (totalCount === 0) {
        document.getElementById('creature-name-dropdown').style.display = 'none';
    } else {
        acDropdownShow('creature-name-dropdown', candidates, creatureNameDropdownSelect);
    }

    _creatureUpdateSetEffect();
}

/** 크리쳐 이름 항목 선택 */
function creatureNameDropdownSelect(name) {
    const input = document.getElementById('creature-popup-name-text');
    if (input) input.value = name;
    _creatureUpdateSetEffect(name);
}

/** 크리쳐 스킬 효과 자동입력/수동 전환 */
function _creatureUpdateSetEffect(forceName) {
    const textEl = document.getElementById('creature-popup-name-text');
    const setTA  = document.getElementById('creature-popup-seteffect');
    const badge  = document.getElementById('creature-seteffect-badge');
    if (!setTA) return;

    const selName = forceName !== undefined ? forceName : (textEl ? textEl.value.trim() : '');
    if (selName && typeof CREATURE_ITEM_INFO !== 'undefined') {
        const creature = CREATURE_ITEM_INFO[selName];
        if (creature) {
            setTA.value    = creature.info || creature.stats.map(s => s.label).join('\n');
            setTA.readOnly = true;
            setTA.style.opacity = '0.7';
            if (badge) badge.style.display = 'inline';
            setTA.setAttribute('data-auto', 'true');
            return;
        }
    }
    // 수동 입력 모드 (자동입력 상태였다면 내용 초기화)
    if (setTA.getAttribute('data-auto') === 'true') {
        setTA.value = '';
    }
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
    if (selEl && typeof CREATURE_ITEM_INFO !== 'undefined') {
        selEl.innerHTML = '<option value="">크리쳐 선택</option>' +
            Object.keys(CREATURE_ITEM_INFO).map(name => `<option value="${name}">${name}</option>`).join('');
    }

    // 모드에 따라 복원
    // select 제거됨 — 이름은 항상 텍스트 input에 복원
    if (textEl) { textEl.value = savedName; textEl.disabled = false; }

    // 아티팩트 값 복원
    _CREATURE_ART_KEYS.forEach(key => {
        const hidden = section?.querySelector(`input[type="hidden"][data-key="${key}"]`);
        const dest   = popup.querySelector(`[data-creature-art="${key}"]`);
        if (!hidden || !dest) return;
        dest.value = hidden.value || (key.includes('_rarity') ? '에픽' : '');
        if (key.includes('_rarity')) creaturePopupArtBg(dest);
    });

    // 크리쳐 스킬 효과 복원
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

    // 아티팩트 세트 효과 복원
    const artSetTA = document.getElementById('creature-popup-art-seteffect');
    if (artSetTA) {
        artSetTA.value = btn.getAttribute('data-creature-art-seteffect') || '';
        const artAuto  = btn.getAttribute('data-creature-art-setauto') || 'false';
        const artBadge = document.getElementById('creature-art-seteffect-badge');
        if (artAuto === 'true') {
            artSetTA.readOnly = true;
            artSetTA.style.opacity = '0.7';
            artSetTA.setAttribute('data-auto', 'true');
            if (artBadge) artBadge.style.display = 'inline';
        } else {
            artSetTA.readOnly = false;
            artSetTA.style.opacity = '';
            artSetTA.setAttribute('data-auto', 'false');
            if (artBadge) artBadge.style.display = 'none';
        }
    }

    // 공통 자동완성 드롭다운 외부클릭 닫기 초기화
    _acDropdownInit();
    // 아티팩트 스탯 badge 초기 상태 복원
    setTimeout(() => {
        if (typeof ARTIFACT_SET_DATA === 'undefined') return;
        const p = document.getElementById('creature-popup');
        if (!p) return;
        ['red','blue','green'].forEach(color => {
            const name = p.querySelector(`[data-creature-art="크리쳐_art_${color}_top_text"]`)?.value.trim() || '';
            const badge = document.getElementById(`creature-art-badge-${color}`);
            const matched = ARTIFACT_SET_DATA.find(s => s[color]?.name === name);
            if (badge) badge.style.display = matched ? 'block' : 'none';
        });
    }, 0);

    // 팝업 표시: body로 이동 후 absolute 배치 (스크롤 시 표와 함께 이동)
    overlay.style.display = 'block';
    if (popup.parentElement !== document.body) {
        document.body.appendChild(popup);
    }
    const section_cr   = _creatureBtn ? _creatureBtn.closest('.char-section') : null;
    const infoTable_cr = section_cr ? section_cr.querySelector('.char-info-table') : null;
    const refEl_cr     = infoTable_cr || (_creatureBtn ? _creatureBtn.closest('table') : null) || _creatureBtn;
    const rect_cr      = refEl_cr ? refEl_cr.getBoundingClientRect() : { left: 100, top: 100 };
    const popupW_cr    = popup.offsetWidth || 560;
    const vw_cr        = window.innerWidth;
    let left_cr = rect_cr.left + 180;
    let top_cr  = rect_cr.top + 150 + window.scrollY;
    if (left_cr < 8) left_cr = 8;
    if (left_cr + popupW_cr > vw_cr - 8) left_cr = vw_cr - popupW_cr - 8;
    if (top_cr  < 8) top_cr  = 8;
    popup.style.position = 'absolute';
    popup.style.zIndex   = '3001';
    popup.style.left     = left_cr + 'px';
    popup.style.top      = top_cr  + 'px';
    popup.style.display  = 'block';
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

    // 크리쳐 스킬 효과 및 자동입력 여부
    const setVal    = setTA ? setTA.value.trim() : '';
    const setAuto   = setTA ? (setTA.getAttribute('data-auto') === 'true' ? 'true' : 'false') : 'false';
    const artSetTA  = document.getElementById('creature-popup-art-seteffect');
    const artSetVal = artSetTA ? artSetTA.value.trim() : '';

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
        '크리쳐_art_red_stat_물리 공격력':'RED 물리 공격력', '크리쳐_art_red_stat_마법 공격력':'RED 마법 공격력',
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
    const artSetAuto = artSetTA ? (artSetTA.getAttribute('data-auto') === 'true' ? 'true' : 'false') : 'false';
    _creatureBtn.setAttribute('data-creature-name',          name);
    _creatureBtn.setAttribute('data-creature-mode',          mode);
    _creatureBtn.setAttribute('data-creature-seteffect',     setVal);
    _creatureBtn.setAttribute('data-creature-setauto',       setAuto);
    _creatureBtn.setAttribute('data-creature-art-seteffect', artSetVal);
    _creatureBtn.setAttribute('data-creature-art-setauto',   artSetAuto);
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
                // 페어 텍스트 span도 동기화
                const pairKey = key.includes('_top_rarity')
                    ? key.replace('_top_rarity', '_top_text')
                    : key.replace('_bg_1', '_opt_1').replace('_bg_2', '_opt_2');
                const pairDisp = section?.querySelector(`[data-creature-disp="${pairKey}"]`);
                if (pairDisp) {
                    pairDisp.className = pairDisp.className.replace(/bg-\S+/g, '').trim();
                    if (val) pairDisp.classList.add('bg-' + val);
                }
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

/**
 * 아티팩트 이름 입력 시 자동완성 → 스탯 자동입력 + 세트효과 감지
 * @param {HTMLInputElement} input
 * @param {'red'|'blue'|'green'} color
 */
function creatureArtNameInput(input, color) {
    if (typeof ARTIFACT_SET_DATA === 'undefined') return;
    const val   = input.value.trim();
    const popup = document.getElementById('creature-popup');
    if (!popup) return;

    // 후보 필터링
    const candidates = ARTIFACT_SET_DATA
        .map(s => s[color]?.name || '')
        .filter(name => name && (!val || name.includes(val)));

    acDropdownShow(`artifact-dropdown-${color}`, candidates, creatureArtDropdownSelect, color);

    // 정확히 일치하면 스탯 자동입력
    const matched = ARTIFACT_SET_DATA.find(s => s[color]?.name === val);
    const badge = document.getElementById(`creature-art-badge-${color}`);
    if (matched) {
        Object.entries(matched[color].stats).forEach(([key, statVal]) => {
            const el = popup.querySelector(`[data-creature-art="${key}"]`);
            if (el) el.value = statVal;
        });
        if (badge) badge.style.display = 'inline';
    } else {
        if (badge) badge.style.display = 'none';
    }

    _creatureCheckArtSet(popup);
}

/** 아티팩트 드롭다운 항목 선택 */
function creatureArtDropdownSelect(name, color) {
    const popup = document.getElementById('creature-popup');
    if (!popup) return;
    const input = popup.querySelector(`[data-creature-art="크리쳐_art_${color}_top_text"]`);
    if (input) input.value = name;

    const matched = ARTIFACT_SET_DATA.find(s => s[color]?.name === name);
    const badge = document.getElementById(`creature-art-badge-${color}`);
    if (matched) {
        Object.entries(matched[color].stats).forEach(([key, statVal]) => {
            const el = popup.querySelector(`[data-creature-art="${key}"]`);
            if (el) el.value = statVal;
        });
        if (badge) badge.style.display = 'inline';
    } else {
        if (badge) badge.style.display = 'none';
    }
    _creatureCheckArtSet(popup);
}

/** 아티팩트 세트 완성 감지 → 세트효과 자동입력 */
function _creatureCheckArtSet(popup) {
    if (typeof ARTIFACT_SET_DATA === 'undefined') return;
    const redName   = popup.querySelector('[data-creature-art="크리쳐_art_red_top_text"]')?.value.trim()   || '';
    const blueName  = popup.querySelector('[data-creature-art="크리쳐_art_blue_top_text"]')?.value.trim()  || '';
    const greenName = popup.querySelector('[data-creature-art="크리쳐_art_green_top_text"]')?.value.trim() || '';

    const artSetTA  = document.getElementById('creature-popup-art-seteffect');
    const artBadge  = document.getElementById('creature-art-seteffect-badge');
    if (!artSetTA) return;

    const matchedSet = ARTIFACT_SET_DATA.find(s =>
        s.red?.name   === redName  &&
        s.blue?.name  === blueName &&
        s.green?.name === greenName
    );

    if (matchedSet) {
        artSetTA.value         = matchedSet.setEffect || '';
        artSetTA.readOnly      = true;
        artSetTA.style.opacity = '0.7';
        artSetTA.setAttribute('data-auto', 'true');
        if (artBadge) artBadge.style.display = 'inline';
    } else {
        if (artSetTA.getAttribute('data-auto') === 'true') {
            artSetTA.value = '';
        }
        artSetTA.readOnly      = false;
        artSetTA.style.opacity = '';
        artSetTA.setAttribute('data-auto', 'false');
        if (artBadge) artBadge.style.display = 'none';
    }
}

/** 크리쳐 팝업 닫기 */
function creaturePopupClose() {
    const overlay = document.getElementById('creature-popup-overlay');
    const popup   = document.getElementById('creature-popup');
    if (overlay) overlay.style.display = 'none';
    if (popup && popup.parentElement !== overlay) {
        overlay.appendChild(popup);
        popup.style.display = '';
    }
    document.querySelectorAll('.ac-dropdown').forEach(d => d.style.display = 'none');
    _creatureCharId = null;
    _creatureBtn    = null;
}


// ============================================
// 칭호/오라 팝업 스탯 자동 입력 헬퍼
// ============================================

/**
 * stats 배열 → 칭호 팝업 input 자동 입력
 * stats: [{stats:['힘','지능'], amount:33, unit:''}, ...]
 * base/eff 구분 없이 모든 stat input에 매핑
 */
function _applyTitleStats(popup, info) {
    if (!popup || !info) return;
    // 기존 값 초기화
    popup.querySelectorAll('[data-title-stat]').forEach(el => { el.value = ''; });
    // base/eff 분리 구조 지원 ({ base:[...], eff:[...] }) 및 구버전 배열 호환
    const baseArr = Array.isArray(info) ? info : (info.base || []);
    const effArr  = Array.isArray(info) ? []   : (info.eff  || []);
    // statKey → { amount, type } 맵 생성
    const map = {};
    baseArr.forEach(entry => { (entry.stats || []).forEach(s => { map[s] = { amount: entry.amount, type: 'base' }; }); });
    effArr.forEach( entry => { (entry.stats || []).forEach(s => { map[s] = { amount: entry.amount, type: 'eff'  }; }); });
    popup.querySelectorAll('[data-title-stat]').forEach(input => {
        const raw     = input.getAttribute('data-title-stat');
        const isPct   = raw.endsWith('_pct');
        const key     = isPct ? raw.slice(0, -4) : raw;
        const parts   = key.split('_');
        const type    = parts[parts.length - 1];        // 'base' or 'eff'
        const statKey = parts.slice(0, -1).join('_');
        const entry   = map[statKey];
        if (entry && entry.type === type) input.value = String(entry.amount);
    });
}

/**
 * stats 배열 → 오라 팝업 input 자동 입력
 */
function _applyAuraStats(popup, info) {
    if (!popup || !info) return;
    popup.querySelectorAll('[data-aura-stat]').forEach(el => { el.value = ''; });
    const baseArr = Array.isArray(info) ? info : (info.base || []);
    const effArr  = Array.isArray(info) ? []   : (info.eff  || []);
    const map = {};
    baseArr.forEach(entry => { (entry.stats || []).forEach(s => { map[s] = { amount: entry.amount, type: 'base' }; }); });
    effArr.forEach( entry => { (entry.stats || []).forEach(s => { map[s] = { amount: entry.amount, type: 'eff'  }; }); });
    popup.querySelectorAll('[data-aura-stat]').forEach(input => {
        const raw     = input.getAttribute('data-aura-stat');
        const isPct   = raw.endsWith('_pct');
        const key     = isPct ? raw.slice(0, -4) : raw;
        const parts   = key.split('_');
        const type    = parts[parts.length - 1];
        const statKey = parts.slice(0, -1).join('_');
        const entry   = map[statKey];
        if (entry && entry.type === type) input.value = String(entry.amount);
    });
}

// ============================================
// 칭호 팝업
// ============================================

let _titleCharId = null;
let _titleBtn    = null;

// ============================================
// 칭호 이름 자동완성
// ============================================

// ============================================
// 칭호/오라 팝업 자동입력 lock / unlock 헬퍼
// ============================================

/**
 * 칭호 팝업 stat input + desc → readOnly 설정
 * @param {boolean} lock true=잠금(자동입력), false=해제(수동입력)
 */
function _titlePopupLock(lock) {
    const popup  = document.getElementById('title-popup');
    const descTA = document.getElementById('title-popup-desc');
    if (!popup) return;
    popup.querySelectorAll('[data-title-stat]').forEach(el => {
        el.readOnly = lock;
        el.style.opacity = lock ? '0.65' : '';
        el.style.cursor  = '';
    });
    if (descTA) {
        descTA.readOnly = lock;
        descTA.style.opacity = lock ? '0.65' : '';
        descTA.style.cursor  = '';
    }
}

/**
 * 오라 팝업 stat input + desc → readOnly 설정
 */
function _auraPopupLock(lock) {
    const popup  = document.getElementById('aura-popup');
    const descTA = document.getElementById('aura-popup-desc');
    if (!popup) return;
    popup.querySelectorAll('[data-aura-stat]').forEach(el => {
        el.readOnly = lock;
        el.style.opacity = lock ? '0.65' : '';
        el.style.cursor  = '';
    });
    if (descTA) {
        descTA.readOnly = lock;
        descTA.style.opacity = lock ? '0.65' : '';
        descTA.style.cursor  = '';
    }
}

function titleNameDropdownShow() {
    const input = document.getElementById('title-popup-name');
    if (!input) return;
    const val = input.value.trim();
    const keys = Object.keys(GameData.TITLE_ITEM_INFO || {});
    const candidates = keys.filter(k => !val || k.includes(val));
    acDropdownShow('title-name-dropdown', candidates, titleNameDropdownSelect);

    // 실시간 자동입력 상태 체크 및 UI 업데이트
    const info = (GameData.TITLE_ITEM_INFO || {})[val];
    const isAutoInput = !!(info?.base || info?.eff || info?.stats);

    const badgeBase = document.getElementById('title-badge-base');
    const badgeEff  = document.getElementById('title-badge-eff');
    const badgeDesc = document.getElementById('title-badge-desc');

    if (!isAutoInput) {
        // 자동입력 데이터가 없으면 badge 숨기고 잠금 해제
        if (badgeBase) badgeBase.style.display = 'none';
        if (badgeEff) badgeEff.style.display = 'none';
        if (badgeDesc) badgeDesc.style.display = 'none';
        _titlePopupLock(false);
    }
    // 자동입력 데이터가 있는 경우는 드롭다운 선택 시에만 처리
}

/**
 * 칭호 팝업 수치/설명 초기화
 */
function resetTitlePopupStats() {
    const popup = document.getElementById('title-popup');
    if (!popup) return;

    // 자동입력 상태 확인
    const nameInput = document.getElementById('title-popup-name');
    const name = nameInput ? nameInput.value.trim() : '';
    const info = (GameData.TITLE_ITEM_INFO || {})[name];
    const isAutoInput = !!(info?.base || info?.eff || info?.stats);

    if (isAutoInput) {
        alert('자동입력된 칭호는 초기화할 수 없습니다.\n\n직접 입력한 이름으로 변경 후 사용해주세요.');
        return;
    }

    // 모든 스탯 input 초기화
    popup.querySelectorAll('[data-title-stat]').forEach(el => el.value = '');

    // 설명 초기화
    const descTA = document.getElementById('title-popup-desc');
    if (descTA) descTA.value = '';

    // badge 숨기기
    const badgeBase = document.getElementById('title-badge-base');
    const badgeEff  = document.getElementById('title-badge-eff');
    const badgeDesc = document.getElementById('title-badge-desc');
    if (badgeBase) badgeBase.style.display = 'none';
    if (badgeEff) badgeEff.style.display = 'none';
    if (badgeDesc) badgeDesc.style.display = 'none';

    // 잠금 해제
    _titlePopupLock(false);
}

function titleNameDropdownSelect(name) {
    const input = document.getElementById('title-popup-name');
    if (input) input.value = name;
    titleNameApplyStats(name);
    document.getElementById('title-name-dropdown').style.display = 'none';
    // 드롭다운 선택 → 자동입력 → 수정 잠금
    const info = (GameData.TITLE_ITEM_INFO || {})[name];
    _titlePopupLock(!!(info?.base || info?.eff || info?.stats));
}

function titleNameApplyStats(name) {
    const popup = document.getElementById('title-popup');
    if (!popup) return;
    const info = (GameData.TITLE_ITEM_INFO || {})[name];
    const badgeBase = document.getElementById('title-badge-base');
    const badgeEff  = document.getElementById('title-badge-eff');
    const badgeDesc = document.getElementById('title-badge-desc');
    const show = v => v && (v.style.display = 'inline');
    const hide = v => v && (v.style.display = 'none');
    if (info?.base || info?.eff || info?.stats) {
        _applyTitleStats(popup, info);
        const descTA = document.getElementById('title-popup-desc');
        if (descTA) descTA.value = info?.desc || '';
        show(badgeBase); show(badgeEff); show(badgeDesc);
    } else {
        popup.querySelectorAll('[data-title-stat]').forEach(el => el.value = '');
        const descTA = document.getElementById('title-popup-desc');
        if (descTA) descTA.value = '';
        hide(badgeBase); hide(badgeEff); hide(badgeDesc);
        // 직접 입력(매칭 없음) → 잠금 해제
        _titlePopupLock(false);
    }
}

// ============================================
// 오라 이름 자동완성
// ============================================

function auraNameDropdownShow() {
    const input = document.getElementById('aura-popup-name');
    if (!input) return;
    const val = input.value.trim();
    const keys = Object.keys(GameData.AURA_ITEM_INFO || {});
    const candidates = keys.filter(k => !val || k.includes(val));
    acDropdownShow('aura-name-dropdown', candidates, auraNameDropdownSelect);

    // 실시간 자동입력 상태 체크 및 UI 업데이트
    const info = (GameData.AURA_ITEM_INFO || {})[val];
    const isAutoInput = !!(info?.base || info?.eff || info?.stats);

    const badgeBase = document.getElementById('aura-badge-base');
    const badgeEff  = document.getElementById('aura-badge-eff');
    const badgeDesc = document.getElementById('aura-badge-desc');

    if (!isAutoInput) {
        // 자동입력 데이터가 없으면 badge 숨기고 잠금 해제
        if (badgeBase) badgeBase.style.display = 'none';
        if (badgeEff) badgeEff.style.display = 'none';
        if (badgeDesc) badgeDesc.style.display = 'none';
        _auraPopupLock(false);
    }
    // 자동입력 데이터가 있는 경우는 드롭다운 선택 시에만 처리
}

/**
 * 오라 팝업 수치/설명 초기화
 */
function resetAuraPopupStats() {
    const popup = document.getElementById('aura-popup');
    if (!popup) return;

    // 자동입력 상태 확인
    const nameInput = document.getElementById('aura-popup-name');
    const name = nameInput ? nameInput.value.trim() : '';
    const info = (GameData.AURA_ITEM_INFO || {})[name];
    const isAutoInput = !!(info?.base || info?.eff || info?.stats);

    if (isAutoInput) {
        alert('자동입력된 오라는 초기화할 수 없습니다.\n\n직접 입력한 이름으로 변경 후 사용해주세요.');
        return;
    }

    // 모든 스탯 input 초기화
    popup.querySelectorAll('[data-aura-stat]').forEach(el => el.value = '');

    // 설명 초기화
    const descTA = document.getElementById('aura-popup-desc');
    if (descTA) descTA.value = '';

    // badge 숨기기
    const badgeBase = document.getElementById('aura-badge-base');
    const badgeEff  = document.getElementById('aura-badge-eff');
    const badgeDesc = document.getElementById('aura-badge-desc');
    if (badgeBase) badgeBase.style.display = 'none';
    if (badgeEff) badgeEff.style.display = 'none';
    if (badgeDesc) badgeDesc.style.display = 'none';

    // 잠금 해제
    _auraPopupLock(false);
}

function auraNameDropdownSelect(name) {
    const input = document.getElementById('aura-popup-name');
    if (input) input.value = name;
    auraNameApplyStats(name);
    document.getElementById('aura-name-dropdown').style.display = 'none';
    // 드롭다운 선택 → 자동입력 → 수정 잠금
    const info = (GameData.AURA_ITEM_INFO || {})[name];
    _auraPopupLock(!!(info?.base || info?.eff || info?.stats));
}

function auraNameApplyStats(name) {
    const popup = document.getElementById('aura-popup');
    if (!popup) return;
    const info = (GameData.AURA_ITEM_INFO || {})[name];
    const badgeBase = document.getElementById('aura-badge-base');
    const badgeEff  = document.getElementById('aura-badge-eff');
    const badgeDesc = document.getElementById('aura-badge-desc');
    const show = v => v && (v.style.display = 'inline');
    const hide = v => v && (v.style.display = 'none');
    if (info?.base || info?.eff || info?.stats) {
        _applyAuraStats(popup, info);
        const descTA = document.getElementById('aura-popup-desc');
        if (descTA) descTA.value = info?.desc || '';
        show(badgeBase); show(badgeEff); show(badgeDesc);
    } else {
        popup.querySelectorAll('[data-aura-stat]').forEach(el => el.value = '');
        const descTA = document.getElementById('aura-popup-desc');
        if (descTA) descTA.value = '';
        hide(badgeBase); hide(badgeEff); hide(badgeDesc);
        // 직접 입력(매칭 없음) → 잠금 해제
        _auraPopupLock(false);
    }
}

function openTitlePopup(charId, btn) {
    _titleCharId = charId;
    _titleBtn    = btn;

    const overlay = document.getElementById('title-popup-overlay');
    const popup   = document.getElementById('title-popup');
    if (!overlay || !popup) return;

    // 이름 복원 + 드롭다운 초기화
    const nameInput = document.getElementById('title-popup-name');
    if (nameInput) {
        nameInput.value    = btn.getAttribute('data-title-name') || '';
        nameInput.disabled = false;
    }
    _acDropdownInit();

    // 스탯 복원: V4 { base:[{stats:[...], amount:N, unit:''}], eff:[...], desc:'' }
    const savedData = JSON.parse(btn.getAttribute('data-title-stats') || '{}');
    const savedName = btn.getAttribute('data-title-name') || '';

    // 자동입력 데이터 확인
    const info = (GameData.TITLE_ITEM_INFO || {})[savedName];
    const isAutoInput = !!(info?.base || info?.eff || info?.stats);

    if (isAutoInput) {
        // 자동입력 데이터가 있으면 그것을 적용
        setTimeout(() => {
            titleNameApplyStats(savedName);
            _titlePopupLock(true);
        }, 0);
    } else {
        // 직접 입력한 경우 저장된 값 복원
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

        // badge 숨기기 및 잠금 해제
        const badgeBase = document.getElementById('title-badge-base');
        const badgeEff  = document.getElementById('title-badge-eff');
        const badgeDesc = document.getElementById('title-badge-desc');
        if (badgeBase) badgeBase.style.display = 'none';
        if (badgeEff) badgeEff.style.display = 'none';
        if (badgeDesc) badgeDesc.style.display = 'none';
        _titlePopupLock(false);
    }

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
                details.push(`${typeLabel}${_STAT_LABELS[statKey] || statKey}: ${ov} → ${nv}`);
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
            // 자동입력 데이터가 있으면 그것을 사용
            if (infoEntry?.info) {
                descEl.value = infoEntry.info;
            } else {
                // 직접 입력: 스탯 기반 자동생성 + 사용자 입력 설명 결합
                const baseLines = _entriesToLines(stats.base);
                const effLines  = _entriesToLines(stats.eff);
                const lines = [];

                // 스탯이 있으면 기본정보/효과 섹션 추가
                if (baseLines.length) {
                    lines.push('기본정보');
                    lines.push(...baseLines);
                }
                if (effLines.length) {
                    if (baseLines.length) lines.push('---');
                    lines.push('효과');
                    lines.push(...effLines);
                }

                // 사용자가 입력한 설명이 있으면 추가
                if (stats.desc) {
                    if (lines.length > 0) lines.push('---');
                    lines.push(stats.desc);
                }

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

    // 이름 복원 + 드롭다운 초기화
    const nameInput = document.getElementById('aura-popup-name');
    if (nameInput) {
        nameInput.value    = btn.getAttribute('data-aura-name') || '';
        nameInput.disabled = false;
    }
    _acDropdownInit();

    // 스탯 복원: V4 { base:[{stats:[...], amount:N, unit:''}], eff:[...], desc:'' }
    const savedData = JSON.parse(btn.getAttribute('data-aura-stats') || '{}');
    const savedName = btn.getAttribute('data-aura-name') || '';

    // 자동입력 데이터 확인
    const info = (GameData.AURA_ITEM_INFO || {})[savedName];
    const isAutoInput = !!(info?.base || info?.eff || info?.stats);

    if (isAutoInput) {
        // 자동입력 데이터가 있으면 그것을 적용
        setTimeout(() => {
            auraNameApplyStats(savedName);
            _auraPopupLock(true);
        }, 0);
    } else {
        // 직접 입력한 경우 저장된 값 복원
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

        // badge 숨기기 및 잠금 해제
        const badgeBase = document.getElementById('aura-badge-base');
        const badgeEff  = document.getElementById('aura-badge-eff');
        const badgeDesc = document.getElementById('aura-badge-desc');
        if (badgeBase) badgeBase.style.display = 'none';
        if (badgeEff) badgeEff.style.display = 'none';
        if (badgeDesc) badgeDesc.style.display = 'none';
        _auraPopupLock(false);
    }

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
                details.push(`${typeLabel}${_STAT_LABELS[statKey] || statKey}: ${ov} → ${nv}`);
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
            // 자동입력 데이터가 있으면 그것을 사용
            if (infoEntry?.info) {
                descEl.value = infoEntry.info;
            } else {
                // 직접 입력: 스탯 기반 자동생성 + 사용자 입력 설명 결합
                const baseLines = _entriesToLines(stats.base);
                const effLines  = _entriesToLines(stats.eff);
                const lines = [];

                // 스탯이 있으면 기본정보/효과 섹션 추가
                if (baseLines.length) {
                    lines.push('기본정보');
                    lines.push(...baseLines);
                }
                if (effLines.length) {
                    if (baseLines.length) lines.push('---');
                    lines.push('효과');
                    lines.push(...effLines);
                }

                // 사용자가 입력한 설명이 있으면 추가
                if (stats.desc) {
                    if (lines.length > 0) lines.push('---');
                    lines.push(stats.desc);
                }

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
// _avatarCharId → UIState.avatarCharId (core-state.js)
// _avatarBtn     → UIState.avatarBtn     (core-state.js)

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

    // 팝업 표시: body로 이동 후 absolute 배치 (스크롤 시 표와 함께 이동)
    const overlay = document.getElementById('avatar-popup-overlay');
    const popup   = document.getElementById('avatar-popup');
    if (overlay) overlay.style.display = 'block';
    if (popup) {
        if (popup.parentElement !== document.body) {
            document.body.appendChild(popup);
        }
        const section_av   = UIState.avatarBtn ? UIState.avatarBtn.closest('.char-section') : null;
        const infoTable_av = section_av ? section_av.querySelector('.char-info-table') : null;
        const refEl_av     = infoTable_av || (UIState.avatarBtn ? UIState.avatarBtn.closest('table') : null) || UIState.avatarBtn;
        const rect_av      = refEl_av ? refEl_av.getBoundingClientRect() : { left: 100, top: 100 };
        const popupW_av    = popup.offsetWidth || 400;
        const vw_av        = window.innerWidth;
        let left_av = rect_av.left + 200;
        let top_av  = rect_av.top + 280 + window.scrollY;
        if (left_av < 8) left_av = 8;
        if (top_av  < 8) top_av  = 8;
        popup.style.position = 'absolute';
        popup.style.zIndex   = '3001';
        popup.style.left     = left_av + 'px';
        popup.style.top      = top_av  + 'px';
        popup.style.display  = 'block';
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
    const popup   = document.getElementById('avatar-popup');
    if (overlay) overlay.style.display = 'none';
    if (popup && popup.parentElement !== overlay) {
        overlay.appendChild(popup);
        popup.style.display = '';
    }
    UIState.avatarCharId = null;
    UIState.avatarBtn = null;
}

// ============================================
// 무기 아바타 수치 팝업
// ============================================

let _weaponAvatarCharId = null;
let _weaponAvatarBtn    = null;

/**
 * 무기 아바타 팝업 stat input + desc → readOnly 설정
 */
function _weaponAvatarPopupLock(lock) {
    const popup  = document.getElementById('weapon-avatar-popup');
    const descTA = document.getElementById('weapon-avatar-popup-desc');
    if (!popup) return;
    popup.querySelectorAll('[data-weapon-avatar-stat]').forEach(el => {
        el.readOnly = lock;
        el.style.opacity = lock ? '0.65' : '';
    });
    if (descTA) {
        descTA.readOnly = lock;
        descTA.style.opacity = lock ? '0.65' : '';
    }
}

/**
 * 무기 아바타 팝업 수치/설명 초기화
 */
function resetWeaponAvatarPopupStats() {
    const popup = document.getElementById('weapon-avatar-popup');
    if (!popup) return;
    // 자동입력 데이터가 있으면 초기화 차단 (칭호/오라와 동일)
    const nameInput = document.getElementById('weapon-avatar-popup-name');
    const name = nameInput ? nameInput.value.trim() : '';
    const info = (GameData.WEAPON_AVATAR_ITEM_INFO || {})[name];
    const isAutoInput = !!(info?.eff || info?.base || info?.stats);
    if (isAutoInput) {
        alert('자동입력된 무기 아바타 수치는 초기화할 수 없습니다.\n\n직접 입력한 이름으로 변경 후 사용해주세요.');
        return;
    }
    popup.querySelectorAll('[data-weapon-avatar-stat]').forEach(el => el.value = '');
    const descTA = document.getElementById('weapon-avatar-popup-desc');
    if (descTA) descTA.value = '';
    const badgeBase = document.getElementById('weapon-avatar-badge-base');
    const badgeEff  = document.getElementById('weapon-avatar-badge-eff');
    const badgeDesc = document.getElementById('weapon-avatar-badge-desc');
    if (badgeBase) badgeBase.style.display = 'none';
    if (badgeEff)  badgeEff.style.display  = 'none';
    if (badgeDesc) badgeDesc.style.display = 'none';
    _weaponAvatarPopupLock(false);
}

/**
 * 무기 아바타 이름 드롭다운 (현재는 빈 목록, 향후 데이터 추가 가능)
 */
function weaponAvatarNameDropdownShow() {
    const input = document.getElementById('weapon-avatar-popup-name');
    if (!input) return;
    const val  = input.value.trim();
    const keys = Object.keys(GameData.WEAPON_AVATAR_ITEM_INFO || {});
    const candidates = keys.filter(k => !val || k.includes(val));
    acDropdownShow('weapon-avatar-name-dropdown', candidates, weaponAvatarNameDropdownSelect);

    // 실시간 자동입력 상태 체크 → badge 토글
    const info       = (GameData.WEAPON_AVATAR_ITEM_INFO || {})[val];
    const isAutoInput = !!(info?.eff || info?.base || info?.stats);
    const badgeBase  = document.getElementById('weapon-avatar-badge-base');
    const badgeEff   = document.getElementById('weapon-avatar-badge-eff');
    const badgeDesc  = document.getElementById('weapon-avatar-badge-desc');
    if (!isAutoInput) {
        if (badgeBase) badgeBase.style.display = 'none';
        if (badgeEff)  badgeEff.style.display  = 'none';
        if (badgeDesc) badgeDesc.style.display = 'none';
        _weaponAvatarPopupLock(false);
    }
}

function weaponAvatarNameDropdownSelect(name) {
    const input = document.getElementById('weapon-avatar-popup-name');
    if (input) input.value = name;
    weaponAvatarNameApplyStats(name);
    const dd = document.getElementById('weapon-avatar-name-dropdown');
    if (dd) dd.style.display = 'none';
    // 드롭다운 선택 → 자동입력 → 수정 잠금
    const info = (GameData.WEAPON_AVATAR_ITEM_INFO || {})[name];
    _weaponAvatarPopupLock(!!(info?.eff || info?.base || info?.stats));
}

/**
 * 이름에 해당하는 스탯을 팝업에 자동입력
 */
function weaponAvatarNameApplyStats(name) {
    const popup = document.getElementById('weapon-avatar-popup');
    if (!popup) return;
    const info     = (GameData.WEAPON_AVATAR_ITEM_INFO || {})[name];
    const badgeBase = document.getElementById('weapon-avatar-badge-base');
    const badgeEff  = document.getElementById('weapon-avatar-badge-eff');
    const badgeDesc = document.getElementById('weapon-avatar-badge-desc');
    const show = v => v && (v.style.display = 'inline');
    const hide = v => v && (v.style.display = 'none');

    if (info?.eff || info?.base || info?.stats) {
        // 스탯 자동입력 (_applyTitleStats 와 동일 방식, data-weapon-avatar-stat 속성 사용)
        popup.querySelectorAll('[data-weapon-avatar-stat]').forEach(el => { el.value = ''; });
        const baseArr = Array.isArray(info) ? info : (info.base || []);
        const effArr  = Array.isArray(info) ? []   : (info.eff  || []);
        const map = {};
        baseArr.forEach(entry => { (entry.stats || []).forEach(s => { map[s] = { amount: entry.amount, type: 'base' }; }); });
        effArr.forEach( entry => { (entry.stats || []).forEach(s => { map[s] = { amount: entry.amount, type: 'eff'  }; }); });
        popup.querySelectorAll('[data-weapon-avatar-stat]').forEach(input => {
            const raw     = input.getAttribute('data-weapon-avatar-stat');
            const isPct   = raw.endsWith('_pct');
            const key     = isPct ? raw.slice(0, -4) : raw;
            const parts   = key.split('_');
            const type    = parts[parts.length - 1];
            const statKey = parts.slice(0, -1).join('_');
            const entry   = map[statKey];
            if (entry && entry.type === type) input.value = String(entry.amount);
        });
        const descTA = document.getElementById('weapon-avatar-popup-desc');
        if (descTA) descTA.value = info?.desc || '';
        show(badgeBase); show(badgeEff); show(badgeDesc);
    } else {
        popup.querySelectorAll('[data-weapon-avatar-stat]').forEach(el => { el.value = ''; });
        const descTA = document.getElementById('weapon-avatar-popup-desc');
        if (descTA) descTA.value = '';
        hide(badgeBase); hide(badgeEff); hide(badgeDesc);
        _weaponAvatarPopupLock(false);
    }
}


/**
 * 무기 아바타 팝업 열기
 */
function openWeaponAvatarPopup(charId, btn) {
    _weaponAvatarCharId = charId;
    _weaponAvatarBtn    = btn;

    const overlay = document.getElementById('weapon-avatar-popup-overlay');
    const popup   = document.getElementById('weapon-avatar-popup');
    if (!overlay || !popup) return;

    // 이름 복원
    const nameInput = document.getElementById('weapon-avatar-popup-name');
    if (nameInput) {
        nameInput.value    = btn.getAttribute('data-weapon-avatar-name') || '';
        nameInput.disabled = false;
    }

    // 스탯 복원: 자동입력 데이터 있으면 적용, 없으면 저장값 복원
    const savedData  = JSON.parse(btn.getAttribute('data-weapon-avatar-stats') || '{}');
    const savedName2 = btn.getAttribute('data-weapon-avatar-name') || '';
    const info2      = (GameData.WEAPON_AVATAR_ITEM_INFO || {})[savedName2];
    const isAutoInput = !!(info2?.eff || info2?.base || info2?.stats);

    _acDropdownInit();

    if (isAutoInput) {
        // 자동입력 데이터 적용 후 잠금
        setTimeout(() => {
            weaponAvatarNameApplyStats(savedName2);
            _weaponAvatarPopupLock(true);
        }, 0);
    } else {
        // 직접 입력한 경우 저장된 값 복원
        const baseMap = _buildStatMap(savedData.base);
        const effMap  = _buildStatMap(savedData.eff);
        popup.querySelectorAll('[data-weapon-avatar-stat]').forEach(input => {
            const raw     = input.getAttribute('data-weapon-avatar-stat');
            const isPct   = raw.endsWith('_pct');
            const key     = isPct ? raw.slice(0, -4) : raw;
            const parts   = key.split('_');
            const type    = parts[parts.length - 1];
            const statKey = parts.slice(0, -1).join('_');
            const val     = (type === 'base' ? baseMap[statKey] : effMap[statKey]);
            input.value   = val !== undefined ? String(val) : '';
        });
        const descTA = document.getElementById('weapon-avatar-popup-desc');
        if (descTA) descTA.value = savedData.desc || '';
        // badge 숨기기 및 잠금 해제
        const badgeBase = document.getElementById('weapon-avatar-badge-base');
        const badgeEff  = document.getElementById('weapon-avatar-badge-eff');
        const badgeDesc = document.getElementById('weapon-avatar-badge-desc');
        if (badgeBase) badgeBase.style.display = 'none';
        if (badgeEff)  badgeEff.style.display  = 'none';
        if (badgeDesc) badgeDesc.style.display = 'none';
        _weaponAvatarPopupLock(false);
    }

    // 팝업 표시: body 직계 자식으로 이동 후 absolute 배치
    if (popup.parentElement !== document.body) {
        document.body.appendChild(popup);
    }
    overlay.style.display = 'block';

    const section_wa   = _weaponAvatarBtn ? _weaponAvatarBtn.closest('.char-section') : null;
    const infoTable_wa = section_wa ? section_wa.querySelector('.char-info-table') : null;
    const refEl_wa     = infoTable_wa || (_weaponAvatarBtn ? _weaponAvatarBtn.closest('table') : null) || btn;
    const rect_wa      = refEl_wa.getBoundingClientRect();
    const popupW_wa    = popup.offsetWidth || 1100;
    const vw_wa        = window.innerWidth;
    let left_wa = rect_wa.left + 90;
    let top_wa  = rect_wa.top + 200 + window.scrollY;
    if (left_wa < 8) left_wa = 8;
    if (left_wa + popupW_wa > vw_wa - 8) left_wa = vw_wa - popupW_wa - 8;
    if (top_wa  < 8) top_wa  = 8;
    popup.style.position = 'absolute';
    popup.style.zIndex   = '3001';
    popup.style.left     = left_wa + 'px';
    popup.style.top      = top_wa  + 'px';
    popup.style.display  = 'block';
}

/** 무기 아바타 팝업 저장 */
function weaponAvatarPopupSave() {
    if (!_weaponAvatarBtn) { weaponAvatarPopupClose(); return; }

    const nameInput = document.getElementById('weapon-avatar-popup-name');
    const name = nameInput ? nameInput.value.trim() : '';

    // 스탯 수집: V4 { base:[{stats:[...], amount:N, unit:''}], eff:[...], desc:'' }
    const baseMap = {}, effMap = {};
    const popupEl = document.getElementById('weapon-avatar-popup');
    if (popupEl) {
        popupEl.querySelectorAll('[data-weapon-avatar-stat]').forEach(input => {
            const val = input.value.trim();
            if (!val) return;
            const raw     = input.getAttribute('data-weapon-avatar-stat');
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
    const descTA = document.getElementById('weapon-avatar-popup-desc');
    const stats = {
        base: Object.values(baseMap),
        eff:  Object.values(effMap),
        desc: descTA ? descTA.value.trim() : ''
    };

    // 변경 기록
    const oldName = _weaponAvatarBtn.getAttribute('data-weapon-avatar-name') || '';
    if (_weaponAvatarCharId) {
        const section  = document.getElementById(_weaponAvatarCharId);
        const charName = section?.querySelector('[data-key="info_name"]')?.value || '이름없음';
        const timeStr  = (typeof getCurrentDateTime === 'function') ? getCurrentDateTime() : new Date().toLocaleString();

        const oldStats = JSON.parse(_weaponAvatarBtn.getAttribute('data-weapon-avatar-stats') || '{}');
        const details  = [];
        const oldBaseMap = _toStatMap(oldStats.base || [], 'base');
        const oldEffMap  = _toStatMap(oldStats.eff  || [], 'eff');
        const newBaseMap = _toStatMap(stats.base || [], 'base');
        const newEffMap  = _toStatMap(stats.eff  || [], 'eff');
        const oldStatMap = { ...oldBaseMap, ...oldEffMap };
        const newStatMap = { ...newBaseMap, ...newEffMap };
        const allKeys = [...new Set([...Object.keys(oldStatMap), ...Object.keys(newStatMap)])];
        allKeys.sort((a, b) => (a.endsWith('_eff') ? 1 : 0) - (b.endsWith('_eff') ? 1 : 0));
        allKeys.forEach(k => {
            const ov = oldStatMap[k] || '없음';
            const nv = newStatMap[k] || '없음';
            if (ov !== nv) {
                const [statKey, type] = k.split(/_(?=base$|eff$)/);
                const typeLabel = type === 'eff' ? '[효과] ' : '[기본] ';
                details.push(`${typeLabel}${_STAT_LABELS[statKey] || statKey}: ${ov} → ${nv}`);
            }
        });
        if (oldName !== name) details.unshift(`이름: ${oldName || '(빈칸)'} → ${name || '(빈칸)'}`);

        if (details.length > 0) {
            AppState.changeHistory.unshift({
                time: timeStr, charName, slot: '무기 아바타 수치',
                old: oldName === '' ? '(빈칸)' : oldName,
                new: name    === '' ? '(빈칸)' : name,
                details
            });
            if (AppState.changeHistory.length > 10) AppState.changeHistory.pop();
            AppState.saveHistory();
        }
    }

    // 버튼 업데이트
    _weaponAvatarBtn.setAttribute('data-weapon-avatar-name',  name);
    _weaponAvatarBtn.setAttribute('data-weapon-avatar-stats', JSON.stringify(stats));
    _weaponAvatarBtn.textContent = name;

    // desc 자동 입력 (칭호/오라와 동일 방식)
    if (_weaponAvatarCharId) {
        const section = document.getElementById(_weaponAvatarCharId);
        const descEl  = section?.querySelector('[data-key="아바타_desc"]');
        if (descEl) {
            const baseLines = _entriesToLines(stats.base);
            const effLines  = _entriesToLines(stats.eff);
            const lines = [];
            if (baseLines.length) {
                lines.push('기본정보');
                lines.push(...baseLines);
            }
            if (effLines.length) {
                if (baseLines.length) lines.push('---');
                lines.push('효과');
                lines.push(...effLines);
            }
            if (stats.desc) {
                if (lines.length > 0) lines.push('---');
                lines.push(stats.desc);
            }
            descEl.value = lines.join('\n');
        }
    }

    weaponAvatarPopupClose();
    if (typeof autoSave === 'function') autoSave();
}

/** 무기 아바타 팝업 닫기 */
function weaponAvatarPopupClose() {
    const overlay = document.getElementById('weapon-avatar-popup-overlay');
    const popup   = document.getElementById('weapon-avatar-popup');
    if (overlay) overlay.style.display = 'none';
    if (popup && popup.parentElement !== overlay) {
        overlay.appendChild(popup);
        popup.style.display = '';
    }
    _weaponAvatarCharId = null;
    _weaponAvatarBtn    = null;
}