// ============================================
// shared_item_stats.js - 아이템 데이터 참조
// ============================================
// 실제 데이터는 data/ 폴더의 JS 파일에 있음
//   - data/armor.js                : 방어구           → ARMOR_ITEM_STATS
//   - data/armor_set_effects.js    : 방어구 세트 효과  → ARMOR_SET_EFFECTS
//   - data/exceed_unique_effects.js: 익시드 고유 효과  → EXCEED_UNIQUE_EFFECTS
//
// 각 파일이 index.html에서 script 태그로 먼저 로드되므로
// 여기서는 별도 선언 없이 그대로 사용 가능
//
// 참조 예시:
//   ARMOR_ITEM_STATS["어느 말괄량이의 가죽 자켓"].base["의지"]["전격"]
//   EXCEED_UNIQUE_EFFECTS["못말리는 말괄량이의 가죽 자켓"]["이상"]["암제|네메시스|다크템플러"]

let ACCESSORY_ITEM_STATS = {};
let SPECIAL_ITEM_STATS   = {};