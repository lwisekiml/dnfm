// ============================================
// mode-compare-eq.js - 장비 비교 탭
// ============================================
// ※ 의존: mode-compare-utils.js
// ============================================

// ============================================
// 장비 비교 섹션 빌더
// ============================================

function buildEquipmentCompare(section1, section2, name1, name2) {
    const slots = ["무기", "상의", "어깨", "하의", "신발", "벨트", "목걸이", "팔찌", "반지", "보조장비", "귀걸이", "마법석", "칭호", "외형칭호", "오라", "아바타"];
    const dividerBefore = ["상의", "목걸이", "보조장비", "칭호"];
    const leftRows = [], centerRows = [], rightRows = [];
    const specialSlots = ['칭호', '오라', '아바타'];

    slots.forEach(slot => {
        if (dividerBefore.includes(slot)) {
            leftRows.push({ divider: true }); centerRows.push({ divider: true }); rightRows.push({ divider: true });
        }
        if (specialSlots.includes(slot)) {
            const rawName1 = getSpecialSlotName(section1, slot);
            const rawName2 = getSpecialSlotName(section2, slot);
            const s1Id = section1.id, s2Id = section2.id;
            const btnHtml = `<button onclick="openCompareSpecialPopup('${slot}','${s1Id}','${s2Id}',this)" style="font-size:0.85em;padding:2px 8px;cursor:pointer;background:#2a3158;color:#fff;border:1px solid #4a5178;border-radius:4px;">비교</button>`;
            const dn1 = (slot === '아바타') ? '아바타' : rawName1;
            const dn2 = (slot === '아바타') ? '아바타' : rawName2;
            leftRows.push({ cells: [{ text: slot, cls: 'compare-slot-name' }, { text: dn1, colspan: 5, style: 'max-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;' }]});
            centerRows.push({ html: btnHtml });
            rightRows.push({ cells: [{ text: dn2, colspan: 5, style: 'max-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;' }, { text: slot, cls: 'compare-slot-name' }]});
            return;
        }
        const d1 = getSlotData(section1, slot);
        const d2 = getSlotData(section2, slot);
        const diff = calculateReinforceDiff(slot, d1.reinforce, d2.reinforce);
        leftRows.push({ cells: [
                { text: slot, cls: 'compare-slot-name' },
                { text: d1.rarity, cls: CompareUtils.getRarityClass(d1.rarity) },
                { text: d1.exceed, cls: CompareUtils.getExceedClass(d1.exceed) },
                { text: d1.prefix, cls: CompareUtils.getPrefixClass(slot, d1.prefix) },
                { text: d1.itemname }, { text: d1.reinforce },
            ]});
        centerRows.push({ text: diff });
        rightRows.push({ cells: [
                { text: d2.reinforce }, { text: d2.itemname },
                { text: d2.prefix, cls: CompareUtils.getPrefixClass(slot, d2.prefix) },
                { text: d2.exceed, cls: CompareUtils.getExceedClass(d2.exceed) },
                { text: d2.rarity, cls: CompareUtils.getRarityClass(d2.rarity) },
                { text: slot, cls: 'compare-slot-name' },
            ]});
    });

    return createCompareSection(
        '*장비 비교*',
        [[{ text: name1, colspan: 6 }], [{ text: '슬롯' }, { text: '희귀도' }, { text: '익시드' }, { text: '접두어' }, { text: '아이템이름' }, { text: '강화' }]],
        name1 + ' vs ' + name2,
        [[{ text: name2, colspan: 6 }], [{ text: '강화' }, { text: '아이템이름' }, { text: '접두어' }, { text: '익시드' }, { text: '희귀도' }, { text: '슬롯' }]],
        leftRows, centerRows, rightRows
    );
}

function buildSealCompare(section1, section2, name1, name2, isSeal1) {
    const slots = ["무기", "상의", "어깨", "하의", "신발", "벨트", "목걸이", "팔찌", "반지", "보조장비", "귀걸이", "마법석"];
    const dividerBefore = ["목걸이", "보조장비"];
    const sealKey = isSeal1 ? 'seal1' : 'seal2';
    const sealValKey = isSeal1 ? 'seal1_val' : 'seal2_val';
    const label = isSeal1 ? '고유 옵션' : '일반 옵션';
    const statType1 = section1.querySelector(`select[data-key="info_stat_type"]`)?.value || "";
    const eleType1  = section1.querySelector(`select[data-key="info_ele_type"]`)?.value || "";
    const statType2 = section2.querySelector(`select[data-key="info_stat_type"]`)?.value || "";
    const eleType2  = section2.querySelector(`select[data-key="info_ele_type"]`)?.value || "";
    const leftRows = [], centerRows = [], rightRows = [];

    slots.forEach(slot => {
        if (dividerBefore.includes(slot)) {
            leftRows.push({ divider: true }); centerRows.push({ divider: true }); rightRows.push({ divider: true });
        }
        const d1 = getSlotData(section1, slot);
        const d2 = getSlotData(section2, slot);
        const sc1 = CompareUtils.getSealHighlightClass(slot, d1[sealKey], statType1, eleType1, isSeal1);
        const sc2 = CompareUtils.getSealHighlightClass(slot, d2[sealKey], statType2, eleType2, isSeal1);
        let diff = '-';
        if (d1[sealKey] === d2[sealKey] && d1[sealKey] !== '') diff = calculateNumDiff(d1[sealValKey], d2[sealValKey]);
        else if (d1[sealKey] !== d2[sealKey] && (d1[sealKey] !== '' || d2[sealKey] !== '')) diff = isSeal1 ? '고유옵션 값이 다름' : '일반옵션 값이 다름';
        leftRows.push({ cells: [{ text: slot, cls: 'compare-slot-name' }, { text: d1[sealKey], cls: sc1 }, { text: d1[sealValKey], cls: sc1 }] });
        centerRows.push({ text: diff });
        rightRows.push({ cells: [{ text: d2[sealValKey], cls: sc2 }, { text: d2[sealKey], cls: sc2 }, { text: slot, cls: 'compare-slot-name' }] });
    });

    return createCompareSection(
        `*마법봉인 비교 (${label})*`,
        [[{ text: name1, colspan: 3 }], [{ text: '슬롯' }, { text: label }, { text: '수치' }]],
        name1 + ' vs ' + name2,
        [[{ text: name2, colspan: 3 }], [{ text: '수치' }, { text: label }, { text: '슬롯' }]],
        leftRows, centerRows, rightRows
    );
}

function buildEmblemCompare(section1, section2, name1, name2) {
    const slots = ["무기", "상의", "어깨", "하의", "신발", "벨트", "목걸이", "팔찌", "반지", "보조장비", "귀걸이", "마법석", "칭호"];
    const selectSlots = ["보조장비", "귀걸이", "마법석", "칭호"];
    const dividerBefore = ["목걸이", "보조장비", "칭호"];
    const eleType1 = section1.querySelector(`select[data-key="info_ele_type"]`)?.value || "";
    const eleType2 = section2.querySelector(`select[data-key="info_ele_type"]`)?.value || "";
    const leftRows = [], centerRows = [], rightRows = [];

    slots.forEach(slot => {
        if (dividerBefore.includes(slot)) {
            leftRows.push({ divider: true }); centerRows.push({ divider: true }); rightRows.push({ divider: true });
        }
        const d1 = getSlotData(section1, slot);
        const d2 = getSlotData(section2, slot);
        const ec1 = CompareUtils.getEmblemHighlightClass(slot, d1.emb1, eleType1);
        const ec2 = CompareUtils.getEmblemHighlightClass(slot, d2.emb1, eleType2);
        let diff = '-';
        if (selectSlots.includes(slot)) {
            if (d1.emb1 === d2.emb1 && d1.emb1 !== '') diff = calculateNumDiff(extractNumber(d1.emb2), extractNumber(d2.emb2));
            else if (d1.emb1 !== d2.emb1 && (d1.emb1 !== '' || d2.emb1 !== '')) diff = '엠블렘 값이 다름';
        } else {
            diff = `${calculateNumDiff(extractNumber(d1.emb1), extractNumber(d2.emb1))} / ${calculateNumDiff(extractNumber(d1.emb2), extractNumber(d2.emb2))}`;
        }
        leftRows.push({ cells: [{ text: slot, cls: 'compare-slot-name' }, { text: d1.emb1, cls: ec1 }, { text: d1.emb2, cls: ec1 }] });
        centerRows.push({ text: diff });
        rightRows.push({ cells: [{ text: d2.emb1, cls: ec2 }, { text: d2.emb2, cls: ec2 }, { text: slot, cls: 'compare-slot-name' }] });
    });

    return createCompareSection(
        '*엠블렘 비교*',
        [[{ text: name1, colspan: 3 }], [{ text: '슬롯' }, { text: '엠블렘1' }, { text: '엠블렘2' }]],
        name1 + ' vs ' + name2,
        [[{ text: name2, colspan: 3 }], [{ text: '엠블렘1' }, { text: '엠블렘2' }, { text: '슬롯' }]],
        leftRows, centerRows, rightRows
    );
}

function buildEnchantCompare(section1, section2, name1, name2) {
    const slots = ["무기", "상의", "어깨", "하의", "신발", "벨트", "목걸이", "팔찌", "반지", "보조장비", "귀걸이", "마법석", "칭호"];
    const dividerBefore = ["목걸이", "보조장비", "칭호"];
    const leftRows = [], centerRows = [], rightRows = [];

    slots.forEach(slot => {
        if (dividerBefore.includes(slot)) {
            leftRows.push({ divider: true }); centerRows.push({ divider: true }); rightRows.push({ divider: true });
        }
        const d1 = getSlotData(section1, slot);
        const d2 = getSlotData(section2, slot);
        let diff = '-';
        if (d1.enchant === d2.enchant && d1.enchant !== '') diff = calculateNumDiff(d1.enchant_val, d2.enchant_val);
        else if (d1.enchant !== d2.enchant && (d1.enchant !== '' || d2.enchant !== '')) diff = '마법부여 값이 다름';
        leftRows.push({ cells: [{ text: slot, cls: 'compare-slot-name' }, { text: d1.enchant }, { text: d1.enchant_val }] });
        centerRows.push({ text: diff });
        rightRows.push({ cells: [{ text: d2.enchant_val }, { text: d2.enchant }, { text: slot, cls: 'compare-slot-name' }] });
    });

    return createCompareSection(
        '*마법부여 비교*',
        [[{ text: name1, colspan: 3 }], [{ text: '슬롯' }, { text: '마법부여' }, { text: '수치' }]],
        name1 + ' vs ' + name2,
        [[{ text: name2, colspan: 3 }], [{ text: '수치' }, { text: '마법부여' }, { text: '슬롯' }]],
        leftRows, centerRows, rightRows
    );
}

// ============================================
// 칭호·오라·아바타 팝업 비교
// ============================================

function openCompareSpecialPopup(slot, s1Id, s2Id, triggerBtn) {
    const section1 = document.getElementById(s1Id), section2 = document.getElementById(s2Id);
    if (!section1 || !section2) return;
    const charName1 = section1.querySelector('[data-key="info_name"]')?.value || s1Id;
    const charName2 = section2.querySelector('[data-key="info_name"]')?.value || s2Id;
    let html = '';

    if (slot === '칭호' || slot === '오라') {
        const btnKey = slot === '칭호' ? '[data-key="칭호_itemname"]' : '[data-key="오라_itemname"]';
        const nameAttr = slot === '칭호' ? 'data-title-name' : 'data-aura-name';
        const statsAttr = slot === '칭호' ? 'data-title-stats' : 'data-aura-stats';
        const btn1 = section1.querySelector(btnKey), btn2 = section2.querySelector(btnKey);
        const itemName1 = btn1?.getAttribute(nameAttr) || '', itemName2 = btn2?.getAttribute(nameAttr) || '';
        const parseStatMap = (json) => {
            const map = {};
            try { const data = JSON.parse(json || '{}'); ['base','eff'].forEach(type => { (data[type]||[]).forEach(e => { (e.stats||[]).forEach(s => { map[`${s}_${type}`] = Number(e.amount)||0; }); }); }); } catch(e) {}
            return map;
        };
        const map1 = parseStatMap(btn1?.getAttribute(statsAttr));
        const map2 = parseStatMap(btn2?.getAttribute(statsAttr));
        const allKeys = [...new Set([...Object.keys(map1), ...Object.keys(map2)])];
        allKeys.sort((a, b) => (a.endsWith('_eff') ? 1 : 0) - (b.endsWith('_eff') ? 1 : 0));
        const diffStyle = (d) => d > 0 ? 'color:#2ecc71;font-weight:bold;' : d < 0 ? 'color:#e74c3c;font-weight:bold;' : 'color:#888;';
        const rd = (d) => Math.round(d * 10000) / 10000;
        const fd = (d) => d > 0 ? `↑ +${d}` : d < 0 ? `↓ ${d}` : '-';
        const statRows = allKeys.map(k => {
            const [statKey, type] = k.split(/_(?=base$|eff$)/);
            const typeLabel = type === 'eff' ? '[효과]' : '[기본]';
            const label = (typeof _STAT_LABELS !== 'undefined' && _STAT_LABELS[statKey]) || statKey;
            const v1 = map1[k] ?? 0, v2 = map2[k] ?? 0, diff = rd(v2 - v1);
            const hl = (v1 !== v2) ? 'background:rgba(255,255,255,0.04);' : '';
            return `<tr style="${hl}"><td style="text-align:center;padding:3px 10px;white-space:nowrap;">${typeLabel} ${label}</td><td style="text-align:center;padding:3px 10px;white-space:nowrap;">${v1 !== 0 ? v1 : ''}</td><td style="text-align:center;padding:3px 10px;white-space:nowrap;${diffStyle(diff)}">${fd(diff)}</td><td style="text-align:center;padding:3px 10px;white-space:nowrap;">${v2 !== 0 ? v2 : ''}</td><td style="text-align:center;padding:3px 10px;white-space:nowrap;">${typeLabel} ${label}</td></tr>`;
        }).join('');
        html = `<div style="display:flex;justify-content:space-between;margin-bottom:10px;gap:8px;"><span style="color:#ffd700;font-weight:bold;">${charName1}</span><span style="color:#aad4ff;font-size:0.85em;overflow:hidden;text-overflow:ellipsis;">${itemName1||'(미착용)'}</span><span style="color:#888;font-size:0.85em;">vs</span><span style="color:#aad4ff;font-size:0.85em;overflow:hidden;text-overflow:ellipsis;">${itemName2||'(미착용)'}</span><span style="color:#ffd700;font-weight:bold;">${charName2}</span></div>
        <div style="overflow-x:auto;"><table style="border-collapse:collapse;white-space:nowrap;"><thead><tr><th style="padding:4px 10px;color:#aaa;font-size:0.8em;text-align:center;">스탯</th><th style="padding:4px 10px;color:#ffd700;font-size:0.85em;text-align:center;">${charName1}</th><th style="padding:4px 10px;color:#aaa;font-size:0.8em;text-align:center;">차이</th><th style="padding:4px 10px;color:#ffd700;font-size:0.85em;text-align:center;">${charName2}</th><th style="padding:4px 10px;color:#aaa;font-size:0.8em;text-align:center;">스탯</th></tr></thead><tbody>${statRows||'<tr><td colspan="5" style="text-align:center;color:#888;padding:8px;">스탯 데이터 없음</td></tr>'}</tbody></table></div>`;
    }

    if (slot === '아바타') {
        const btn1 = section1.querySelector('[data-key="아바타_itemname"]'), btn2 = section2.querySelector('[data-key="아바타_itemname"]');
        const raw1 = btn1?.getAttribute('data-avatar-value') || '', raw2 = btn2?.getAttribute('data-avatar-value') || '';
        const parseParts = (raw) => { const parts = {}; raw.trim().split(/\s+/).forEach(t => { const m = t.match(/^(.+)\((.+)\)$/); if (m) parts[m[1]] = m[2]; }); return parts; };
        const parts1 = parseParts(raw1), parts2 = parseParts(raw2);
        const ALL_PARTS = ['모자','얼굴','상의','목가슴','신발','머리','하의','허리','피부'];
        const GRADE_COLOR = { '언커먼': '#4dabf7', '레어': '#b197fc' };
        const gradeStyle = (g) => g ? `color:${GRADE_COLOR[g]||'#fff'};font-weight:bold;` : 'color:#555;';
        const getStatLabel = (part, grade) => (!grade || typeof AVATAR_PART_STATS === 'undefined') ? '' : (AVATAR_PART_STATS[part]?.[grade]?.label || '');
        const getAmount = (part, grade) => (!grade || typeof AVATAR_PART_STATS === 'undefined') ? null : (AVATAR_PART_STATS[part]?.[grade]?.amount ?? null);
        const diffStyle = (d) => d > 0 ? 'color:#2ecc71;font-weight:bold;' : d < 0 ? 'color:#e74c3c;font-weight:bold;' : 'color:#888;';
        const rd = (d) => Math.round(d * 10000) / 10000;
        const fd = (d) => d > 0 ? `↑ +${d}` : d < 0 ? `↓ ${d}` : '-';
        const rows = ALL_PARTS.map(part => {
            const g1 = parts1[part]||'', g2 = parts2[part]||'';
            const a1 = getAmount(part, g1), a2 = getAmount(part, g2);
            const diff = (a1 !== null && a2 !== null) ? rd(a2 - a1) : null;
            const hl = (g1 !== g2) ? 'background:rgba(255,255,255,0.04);' : '';
            return `<tr style="${hl}"><td style="text-align:center;padding:3px 8px;color:#aaa;font-size:0.85em;white-space:nowrap;">${part}</td><td style="text-align:center;padding:3px 8px;white-space:nowrap;${gradeStyle(g1)}">${g1||'-'}</td><td style="text-align:center;padding:3px 8px;color:#bbb;font-size:0.8em;white-space:nowrap;">${getStatLabel(part,g1)}</td><td style="text-align:center;padding:3px 8px;font-size:0.85em;white-space:nowrap;">${diff!==null?`<span style="${diffStyle(diff)}">${fd(diff)}</span>`:'-'}</td><td style="text-align:center;padding:3px 8px;color:#bbb;font-size:0.8em;white-space:nowrap;">${getStatLabel(part,g2)}</td><td style="text-align:center;padding:3px 8px;white-space:nowrap;${gradeStyle(g2)}">${g2||'-'}</td><td style="text-align:center;padding:3px 8px;color:#aaa;font-size:0.85em;white-space:nowrap;">${part}</td></tr>`;
        }).join('');
        const wsLabel = (btn) => btn ? (btn.getAttribute('data-weapon-avatar-name') || btn.textContent.trim() || '-') : '-';
        html = `<div style="overflow-x:auto;"><table style="border-collapse:collapse;white-space:nowrap;"><thead><tr><th style="padding:4px 8px;color:#aaa;font-size:0.8em;text-align:center;">파츠</th><th style="padding:4px 8px;color:#ffd700;font-size:0.85em;text-align:center;">${charName1}</th><th style="padding:4px 8px;color:#aaa;font-size:0.8em;text-align:center;">수치</th><th style="padding:4px 8px;color:#aaa;font-size:0.8em;text-align:center;">차이</th><th style="padding:4px 8px;color:#aaa;font-size:0.8em;text-align:center;">수치</th><th style="padding:4px 8px;color:#ffd700;font-size:0.85em;text-align:center;">${charName2}</th><th style="padding:4px 8px;color:#aaa;font-size:0.8em;text-align:center;">파츠</th></tr></thead><tbody>${rows}</tbody></table></div>
        <div style="border-top:1px solid #2a3158;padding-top:8px;margin-top:8px;display:grid;grid-template-columns:1fr auto 1fr;gap:4px;font-size:0.85em;align-items:center;"><span style="text-align:center;color:#aad4ff;white-space:nowrap;">${wsLabel(section1.querySelector('button[data-weapon-avatar-btn]'))}</span><span style="text-align:center;color:#888;padding:0 8px;white-space:nowrap;">무기 아바타</span><span style="text-align:center;color:#aad4ff;white-space:nowrap;">${wsLabel(section2.querySelector('button[data-weapon-avatar-btn]'))}</span></div>`;
    }

    const existingOverlay = document.getElementById('compare-special-overlay');
    if (existingOverlay) existingOverlay.remove();

    const bodyClass = document.body.className || '';
    const theme = bodyClass.includes('theme-navy') ? 'navy' : (bodyClass.includes('theme-dark') || bodyClass.includes('theme-mixed')) ? 'dark' : 'navy';
    const themeStyles = {
        navy: { bg:'#0f1222', border:'#2a3158', headerBg:'#181c33', rowBg:'#1a1e33', rowHlBg:'rgba(100,114,168,0.15)', text:'#e6e9ff', subText:'#8899cc', closeBtnBg:'#2a3158', closeBtnBorder:'#4a5178' },
        dark: { bg:'#1a1a1f', border:'#444',    headerBg:'#2a2a32', rowBg:'#1a1a1f', rowHlBg:'rgba(255,255,255,0.06)', text:'#ddd',    subText:'#888',    closeBtnBg:'#2a2a32', closeBtnBorder:'#555' },
    };
    const t = themeStyles[theme];

    const triggerTable = triggerBtn?.closest('table');
    const container = triggerTable?.parentElement || document.body;
    container.style.position = 'relative';
    const containerRect = container.getBoundingClientRect();
    const tableRect = triggerTable ? triggerTable.getBoundingClientRect() : containerRect;
    const tableCenterY = tableRect.top - containerRect.top + container.scrollTop + tableRect.height / 2;

    html = html.replaceAll('background:rgba(255,255,255,0.04)', `background:${t.rowHlBg}`);

    const overlay = document.createElement('div');
    overlay.id = 'compare-special-overlay';
    overlay.style.cssText = `position:absolute;z-index:4000;top:${tableCenterY}px;left:50%;transform:translate(-50%,-50%);background:${t.bg};border:1px solid ${t.border};border-radius:8px;padding:20px;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.8);`;
    overlay.innerHTML = `<div style="color:#ffd700;font-weight:bold;font-size:1.05em;margin-bottom:14px;text-align:center;">${slot} 비교</div>${html}<div style="text-align:center;margin-top:16px;"><button onclick="document.getElementById('compare-special-overlay').remove()" style="padding:4px 20px;background:${t.closeBtnBg};color:${t.text};border:1px solid ${t.closeBtnBorder};border-radius:4px;cursor:pointer;">닫기</button></div>`;

    container.appendChild(overlay);
    overlay.querySelectorAll('thead th').forEach(th => { th.style.background = t.headerBg; if (!th.style.color || th.style.color === 'rgb(170,170,170)') th.style.color = t.subText; });
    overlay.querySelectorAll('tbody td').forEach(td => { if (!td.style.background) td.style.background = t.rowBg; if (!td.style.color) td.style.color = t.text; });
}

console.log("✅ mode-compare-eq.js 로드 완료");
