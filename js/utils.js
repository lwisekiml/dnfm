// ============================================
// utils.js - 유틸리티 함수 모음
// ============================================

// ===================================
// 1. DOM 유틸리티
// ===================================
const DOMUtils = {
    getSlotElement(section, slot, key) {
        return section.querySelector(`[data-key="${slot}_${key}"]`);
    },

    getSlotElements(section, slot, keys) {
        const elements = {};
        keys.forEach(key => {
            elements[key] = this.getSlotElement(section, slot, key);
        });
        return elements;
    },

    getCharInfo(section, key) {
        const el = section.querySelector(`[data-key="info_${key}"]`);
        return el ? (el.value || '') : '';
    },

    getCharInfos(section, keys) {
        const infos = {};
        keys.forEach(key => {
            infos[key] = this.getCharInfo(section, key);
        });
        return infos;
    }
};

// ===================================
// 2. 슬롯 유틸리티
// ===================================
const SlotUtils = {
    ARMOR_SLOTS: ["상의", "어깨", "하의", "신발", "벨트"],
    ACCESSORY_SLOTS: ["목걸이", "팔찌", "반지"],
    SPECIAL_SLOTS: ["보조장비", "귀걸이", "마법석"],
    EMBLEM_HIGHLIGHT_SLOTS: ["보조장비", "귀걸이", "마법석", "칭호"],

    isArmorSlot(slot) {
        return this.ARMOR_SLOTS.includes(slot);
    },

    isAccessorySlot(slot) {
        return this.ACCESSORY_SLOTS.includes(slot);
    },

    isSpecialSlot(slot) {
        return this.SPECIAL_SLOTS.includes(slot);
    },

    getSlotType(slot) {
        if (this.isArmorSlot(slot)) return 'armor';
        if (this.isAccessorySlot(slot)) return 'accessory';
        if (this.isSpecialSlot(slot)) return 'special';
        return 'other';
    }
};

// ===================================
// 3. 클래스 조작 유틸리티
// ===================================
const ClassUtils = {
    removeClassesStartingWith(el, prefixes) {
        const prefixArray = Array.isArray(prefixes) ? prefixes : [prefixes];
        el.className = Array.from(el.classList)
            .filter(c => !prefixArray.some(prefix => c.startsWith(prefix)))
            .join(' ');
    },

    toggleHighlight(el, condition, highlightClass = 'highlight-yellow') {
        if (!el) return;
        if (condition) {
            el.classList.add(highlightClass);
        } else {
            el.classList.remove(highlightClass);
        }
    },

    removeHighlightFromAll(elements, highlightClass = 'highlight-yellow') {
        elements.forEach(el => {
            if (el) el.classList.remove(highlightClass);
        });
    }
};

// ===================================
// 4. 데이터 테이블 유틸리티
// ===================================
const DataTables = {
    COMMON_VALUES: {
        "힘": "46", "지능": "46", "체력": "46", "정신력": "46",
        "공격속도": "1.6", "캐스팅속도": "2", "이동속도": "1.6",
        "최대 HP 증가": "456", "최대 MP 증가": "270",
        "물리 방어력": "234", "마법 방어력": "178",
        "적중": "124", "회피": "70"
    },

    WEAPON_SEAL1: {
        "데미지 증가": "8", "추가 데미지": "8",
        "모든 직업 50레벨스킬": "1",
        "화속강": "10", "수속강": "10", "명속강": "10", "암속강": "10",
        "힘": "46", "지능": "46",
        "물리 공격력": "19", "마법 공격력": "19"
    },

    ARMOR_SEAL1: {
        "힘": "46", "지능": "46", "체력": "46", "정신력": "46",
        "물리 크리티컬": "29", "마법 크리티컬": "29"
    },

    ACCESSORY_SEAL1: {
        "화속강": "10", "수속강": "10", "명속강": "10", "암속강": "10",
        "힘": "46", "지능": "46", "체력": "46", "정신력": "46"
    },

    SPECIAL_SEAL1: {
        "물리 공격력": "19", "마법 공격력": "19",
        "힘": "46", "지능": "46",
        "물리 크리티컬": "60", "마법 크리티컬": "60",
        "적중": "75", "회피": "75"
    },

    RESISTANCE_VALUES: {
        "화속성 저항": "8", "수속성 저항": "8",
        "명속성 저항": "8", "암속성 저항": "8",
        "화속강": "8", "수속강": "8", "명속강": "8", "암속강": "8"
    },

    getSealValue(slotType, option, sealLevel) {
        if (sealLevel === 1) {
            switch (slotType) {
                case 'weapon': return this.WEAPON_SEAL1[option] || null;
                case 'armor': return this.ARMOR_SEAL1[option] || null;
                case 'accessory': return this.ACCESSORY_SEAL1[option] || null;
                case 'special': return this.SPECIAL_SEAL1[option] || null;
            }
        } else if (sealLevel === 2) {
            if (slotType === 'weapon' && (option === "물리 공격력" || option === "마법 공격력")) {
                return "18";
            }
            if ((slotType === 'armor' || slotType === 'special') && (option === "물리 크리티컬" || option === "마법 크리티컬")) {
                return "30";
            }
            if (slotType === 'accessory' && this.RESISTANCE_VALUES[option]) {
                return this.RESISTANCE_VALUES[option];
            }
            return this.COMMON_VALUES[option] || null;
        }
        return null;
    }
};

// ===================================
// 5. 헬퍼 함수들
// ===================================

/**
 * 현재 날짜/시간 반환
 */
function getCurrentDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 색상이 적용된 span 태그 반환
 */
function getSpanWithColor(text) {
    let color = "#ddd";
    for (const key in rarityColors) {
        if (text.includes(key)) {
            color = rarityColors[key];
            break;
        }
    }
    return `<span style="color:${color}; font-weight:bold;">${text}</span>`;
}

/**
 * 숫자 추출
 */
function extractNumber(str) {
    const num = str.match(/\d+/);
    return num ? num[0] : '0';
}

/**
 * 강화 차이 계산
 */
function calculateReinforceDiff(slot, val1, val2) {
    const noReinforcedSlots = ["칭호", "외형칭호", "오라", "아바타"];
    if (noReinforcedSlots.includes(slot)) return '';
    if (!val1 || !val2) return '-';
    const diff = parseInt(val2) - parseInt(val1);
    if (diff === 0) return '-';
    if (diff > 0) return `⬆ +${diff}`;
    return `⬇ ${diff}`;
}

/**
 * 수치 차이 계산
 */
function calculateNumDiff(val1, val2) {
    if (!val1 || !val2) return '-';
    const diff = parseInt(val2) - parseInt(val1);
    if (diff === 0) return '-';
    if (diff > 0) return `⬆ +${diff}`;
    return `⬇ ${diff}`;
}