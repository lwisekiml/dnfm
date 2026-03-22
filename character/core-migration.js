// ============================================
// core-migration.js - 구버전 데이터 마이그레이션
// ============================================
// ※ STORAGE_KEYS → shared_constants.js 에 선언됨
// ※ 이 파일은 core-storage.js 보다 먼저 로드되어야 함
// ============================================

// ============================================
// 구버전 데이터 → 통합 스토리지 마이그레이션 (1회성)
// ============================================

/**
 * 기존 데이터 마이그레이션 (1회성)
 * - dnfm_character_equipment_data (project1) + dnfm_eq (project2) → dnfm_unified
 * - dnfm_unified가 이미 존재하면 실행하지 않음
 */
function migrateToUnified() {
    if (localStorage.getItem(STORAGE_KEYS.UNIFIED)) return;

    let p1Chars = [];
    let p2Chars = [];
    let history = [];

    try {
        const p1Raw = localStorage.getItem(STORAGE_KEYS.PROJECT1);
        if (p1Raw) p1Chars = JSON.parse(p1Raw);
    } catch (e) {}

    try {
        const p2Raw = localStorage.getItem(STORAGE_KEYS.PROJECT2);
        if (p2Raw) p2Chars = JSON.parse(p2Raw);
    } catch (e) {}

    try {
        const hRaw = localStorage.getItem(STORAGE_KEYS.PROJECT1 + "_history");
        if (hRaw) history = JSON.parse(hRaw);
    } catch (e) {}

    // PROJECT1 = inputs 데이터, PROJECT2 = armorCounts/weaponCounts 데이터
    // 직업 기준으로 매칭해서 두 데이터를 하나로 합침
    const merged = [];
    const usedJobs = new Set();

    p1Chars.forEach(p1 => {
        const job = p1.inputs?.['info_job']?.val || '';
        if (usedJobs.has(job)) return;
        usedJobs.add(job);

        const p2 = p2Chars.find(c => (c.job || c.inputs?.['info_job']?.val || '') === job);

        merged.push({
            id: p1.id,
            job: job,
            name: p1.inputs?.['info_name']?.val || '',
            locked: p1.locked || false,
            inputs: p1.inputs || {},
            runeData: p1.runeData || { runes: Array(20).fill(null).map(() => ({ name: '', lv: '', skillLv: '' })), gakin: ['', ''] },
            tags: p1.tags || [],
            armorCounts: p2?.armorCounts || {},
            weaponCounts: p2?.weaponCounts || {},
            updateTimes: p2?.updateTimes || {},
            craftMaterials: p2?.craftMaterials || {}
        });
    });

    // p1에 없는 p2 캐릭터 추가
    p2Chars.forEach(p2 => {
        const job = p2.job || p2.inputs?.['info_job']?.val || '';
        if (usedJobs.has(job)) return;
        usedJobs.add(job);

        merged.push({
            id: p2.id,
            job: job,
            name: p2.name || p2.inputs?.['info_name']?.val || '',
            locked: p2.locked || false,
            inputs: p2.inputs || {},
            runeData: p2.runeData || { runes: Array(20).fill(null).map(() => ({ name: '', lv: '', skillLv: '' })), gakin: ['', ''] },
            tags: p2.tags || [],
            armorCounts: p2.armorCounts || {},
            weaponCounts: p2.weaponCounts || {},
            updateTimes: p2.updateTimes || {},
            craftMaterials: p2.craftMaterials || {}
        });
    });

    localStorage.setItem(STORAGE_KEYS.UNIFIED, JSON.stringify({ characters: merged, history }));
    console.log(`✅ 마이그레이션 완료: 총 ${merged.length}명`);
}

// ============================================
// 구버전 inputs/runeData 마이그레이션 (하위 호환용)
// ============================================

/**
 * 구버전 character.runeData → inputs["스킬룬"].runeData 마이그레이션
 * ※ 호출 순서: migrateInputs() 먼저 실행 후 이 함수 실행
 */
function migrateRuneData(character) {
    if (!character) return character;
    if (character.inputs?.['스킬룬']?.runeData) return character;
    if (character.runeData) {
        if (!character.inputs) character.inputs = {};
        if (!character.inputs['스킬룬']) character.inputs['스킬룬'] = {};
        character.inputs['스킬룬'].runeData = character.runeData;
        delete character.runeData;
    }
    return character;
}

/**
 * 구버전 inputs(플랫) → 신버전 inputs(중첩) 마이그레이션
 * ※ 호출 순서: 반드시 migrateRuneData() 보다 먼저 실행
 *   - 플랫 구조: { "스킬룬_desc": { val, cls }, "상의_rarity": { val, cls } }
 *   - 중첩 구조: { "스킬룬": { "desc": { val, cls } }, "상의": { "rarity": { val, cls } } }
 */
function migrateInputs(inputs) {
    if (!inputs) return inputs;
    for (const [key, val] of Object.entries(inputs)) {
        if (key === '스킬룬') continue;
        if (!key.startsWith('info_') && typeof val === 'object' && val !== null && !('val' in val)) {
            return inputs;
        }
    }
    const newInputs = {};
    for (const [key, val] of Object.entries(inputs)) {
        if (key.startsWith('info_') || key === '스킬룬') {
            newInputs[key] = val;
            continue;
        }
        const underIdx = key.indexOf('_');
        if (underIdx === -1) { newInputs[key] = val; continue; }
        const slot = key.slice(0, underIdx);
        const field = key.slice(underIdx + 1);
        if (!newInputs[slot]) newInputs[slot] = {};
        newInputs[slot][field] = val;
    }
    return newInputs;
}

console.log("✅ core-migration.js 로드 완료");
