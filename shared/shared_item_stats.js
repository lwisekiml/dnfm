// ============================================
// shared_item_stats.js - 아이템 데이터 JSON 로더
// ============================================
// 실제 데이터는 data/ 폴더의 JSON 파일에 있음
//   - data/armor.json         : 방어구
//   - data/accessory.json     : 악세서리
//   - data/special.json       : 특수장비
//   - data/exceed_effects.json: 익시드 고유효과 (직업별)
//
// 참조 예시:
//   ARMOR_ITEM_STATS["어느 말괄량이의 가죽 자켓"].base["의지"]["전격"]
//   EXCEED_UNIQUE_EFFECTS["암제"]["어느 말괄량이의 가죽 자켓"]["의지"]

let ARMOR_ITEM_STATS      = {};
let ACCESSORY_ITEM_STATS  = {};
let SPECIAL_ITEM_STATS    = {};
let EXCEED_UNIQUE_EFFECTS = {};

async function loadItemStats() {
    const BASE = './data';
    const [armor, accessory, special, exceed] = await Promise.all([
        fetch(`${BASE}/armor.json`).then(r => r.json()),
        fetch(`${BASE}/accessory.json`).then(r => r.json()),
        fetch(`${BASE}/special.json`).then(r => r.json()),
        fetch(`${BASE}/exceed_effects.json`).then(r => r.json()),
    ]);
    ARMOR_ITEM_STATS      = armor;
    ACCESSORY_ITEM_STATS  = accessory;
    SPECIAL_ITEM_STATS    = special;
    EXCEED_UNIQUE_EFFECTS = exceed;
}
