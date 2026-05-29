// ============================================
// mode-compare-stat.js - 스탯 비교 탭
// ============================================
// ※ 의존: mode-compare-utils.js
// ============================================

// ============================================
// 전체 스탯 합산 비교 표
// ============================================

function buildTotalStatCompare(section1, section2, name1, name2) {
    const total1 = collectTotalStats(section1);
    const total2 = collectTotalStats(section2);

    const allStatNames = [
        ...Object.keys(total1.statMap),
        ...Object.keys(total2.statMap).filter(n => !total1.statMap[n])
    ];

    const wrapper = document.createElement('div');
    wrapper.className = 'compare-section-wrapper';
    const titleEl = document.createElement('div');
    titleEl.className = 'compare-section-title';
    titleEl.textContent = '*전체 스탯 합산 비교*';
    wrapper.appendChild(titleEl);

    const tableWrap = document.createElement('div');
    tableWrap.style.cssText = 'overflow-x:auto;margin-top:6px;';

    let tbodyHtml = '';

    // 속성부여 행
    const attrs1List = [...total1.attrs];
    const attrs2List = [...total2.attrs];
    if (attrs1List.length > 0 || attrs2List.length > 0) {
        const attrDisplay = (a) => `<span style="display:inline-block;padding:1px 6px;border-radius:3px;background:rgba(100,114,168,0.25);color:#b0bcff;font-size:0.8em;margin:1px 2px;">${a}</span>`;
        const common = attrs1List.filter(a => total2.attrs.has(a));
        const only1  = attrs1List.filter(a => !total2.attrs.has(a));
        const only2  = attrs2List.filter(a => !total1.attrs.has(a));
        common.forEach(attr => {
            tbodyHtml += `<tr style="background:rgba(100,114,168,0.08);">
    <td style="text-align:center;padding:2px 6px;color:#b0bcff;font-size:0.75em;white-space:nowrap;border-right:1px solid #2a3158;">속성부여</td>
    <td style="text-align:center;padding:3px 8px;white-space:nowrap;border-right:2px solid #aaa !important;" colspan="2">${attrDisplay(attr)}</td>
    <td style="text-align:center;padding:3px 8px;white-space:nowrap;" colspan="2">${attrDisplay(attr)}</td>
    <td style="text-align:center;padding:2px 6px;color:#b0bcff;font-size:0.75em;white-space:nowrap;border-left:1px solid #2a3158;">속성부여</td>
</tr>`;
        });
        const maxOnly = Math.max(only1.length, only2.length);
        for (let i = 0; i < maxOnly; i++) {
            const a1 = only1[i] || null;
            const a2 = only2[i] || null;
            tbodyHtml += `<tr style="background:rgba(100,114,168,0.08);">
    <td style="text-align:center;padding:2px 6px;color:#b0bcff;font-size:0.75em;white-space:nowrap;border-right:1px solid #2a3158;">${a1 ? '속성부여' : ''}</td>
    <td style="text-align:center;padding:3px 8px;white-space:nowrap;border-right:2px solid #aaa !important;" colspan="2">${a1 ? attrDisplay(a1) : ''}</td>
    <td style="text-align:center;padding:3px 8px;white-space:nowrap;" colspan="2">${a2 ? attrDisplay(a2) : ''}</td>
    <td style="text-align:center;padding:2px 6px;color:#b0bcff;font-size:0.75em;white-space:nowrap;border-left:1px solid #2a3158;">${a2 ? '속성부여' : ''}</td>
</tr>`;
        }
    }

    // 공격속도 행
    const speed1 = total1.speedStat || '';
    const speed2 = total2.speedStat || '';
    if (speed1 || speed2) {
        const isSame = speed1 === speed2;
        const hl = !isSame ? 'background:rgba(100,114,168,0.12);' : '';
        tbodyHtml += `<tr style="${hl}">
    <td style="text-align:center;padding:2px 6px;color:#7a9fcf;font-size:0.75em;white-space:nowrap;border-right:1px solid #2a3158;">${speed1 ? '기본효과' : ''}</td>
    <td style="text-align:center;padding:2px 8px;color:#ccc;font-size:0.82em;white-space:nowrap;border-right:2px solid #aaa !important;" colspan="2">${speed1}</td>
    <td style="text-align:center;padding:2px 8px;color:#ccc;font-size:0.82em;white-space:nowrap;" colspan="2">${speed2}</td>
    <td style="text-align:center;padding:2px 6px;color:#7a9fcf;font-size:0.75em;white-space:nowrap;border-left:1px solid #2a3158;">${speed2 ? '기본효과' : ''}</td>
</tr>`;
    }

    // 수치 스탯 행
    allStatNames.forEach(statName => {
        const s1 = total1.statMap[statName] || null;
        const s2 = total2.statMap[statName] || null;
        const v1 = s1?.amount ?? 0;
        const v2 = s2?.amount ?? 0;
        const unit = s1?.unit || s2?.unit || '';
        const hl = (v1 !== v2) ? 'background:rgba(100,114,168,0.12);' : '';
        const display1 = _fmtStatCell(v1, v2, unit, !!s1);
        const display2 = _fmtStatCell(v2, v1, unit, !!s2);
        tbodyHtml += `<tr style="${hl}">
    <td style="text-align:center;padding:2px 6px;color:#aaa;font-size:0.75em;white-space:nowrap;border-right:1px solid #2a3158;">${s1 ? '합산' : ''}</td>
    <td style="text-align:center;padding:2px 8px;color:#ccc;font-size:0.82em;white-space:nowrap;">${s1 ? statName : ''}</td>
    <td style="text-align:center;padding:2px 8px;color:#e6e9ff;font-size:0.85em;white-space:nowrap;border-right:2px solid #aaa !important;">${display1}</td>
    <td style="text-align:center;padding:2px 8px;color:#e6e9ff;font-size:0.85em;white-space:nowrap;border-right:1px solid #2a3158;">${display2}</td>
    <td style="text-align:center;padding:2px 8px;color:#ccc;font-size:0.82em;white-space:nowrap;">${s2 ? statName : ''}</td>
    <td style="text-align:center;padding:2px 6px;color:#aaa;font-size:0.75em;white-space:nowrap;border-left:1px solid #2a3158;">${s2 ? '합산' : ''}</td>
</tr>`;
    });

    tableWrap.innerHTML = `<table class="stat-compare-table" style="border-collapse:collapse;width:max-content;min-width:400px;">${_statTableThead(name1, name2)}<tbody>${tbodyHtml}</tbody></table>`;
    wrapper.appendChild(tableWrap);
    return wrapper;
}

// ============================================
// 무기 스탯 비교 표
// ============================================

function getWeaponPrefixUniqueEffect(job, prefix) {
    if (!job || !prefix) return '';
    if (typeof EXCEED_WEAPON_UNIQUE_EFFECTS === 'undefined') return '';
    const prefixMap = EXCEED_WEAPON_UNIQUE_EFFECTS[prefix];
    if (!prefixMap) return '';
    for (const [keyGroup, effectText] of Object.entries(prefixMap)) {
        if (keyGroup.split('|').includes(job)) return effectText;
    }
    return '';
}

function buildWeaponStatCompare(section1, section2, name1, name2) {
    const weaponData = (typeof WEAPON_ITEM_STATS !== 'undefined') ? WEAPON_ITEM_STATS : {};

    function getWeaponStats(section) {
        const itemname = section.querySelector('[data-key="무기_itemname"]')?.value || '';
        const prefix   = section.querySelector('select[data-key="무기_prefix"]')?.value || '';
        const exceed   = section.querySelector('select[data-key="무기_exceed"]')?.value || '';
        const job      = section.querySelector('[data-key="info_job"]')?.value || '';
        if (!itemname || !weaponData[itemname]) return { itemname, prefix, exceed, job, stats: null, attrs: [], desc: '' };
        const item = weaponData[itemname];
        const src = (exceed === '침식' && item.침식) ? item.침식 : item;
        const map = {};
        const addToMap = (arr, sl) => {
            if (!Array.isArray(arr)) return;
            arr.forEach(entry => { (entry.stats || []).forEach(sn => { const k = `[${sl}] ${sn}`; if (!map[k]) map[k] = { amount: 0, unit: entry.unit || '' }; map[k].amount += (entry.amount || 0); }); });
        };
        addToMap(src.base, '기본효과'); addToMap(src.eff, '효과');
        return { itemname, prefix, exceed, job, stats: map, attrs: src.attrs || [], desc: src.desc || '' };
    }

    const r1 = getWeaponStats(section1);
    const r2 = getWeaponStats(section2);
    const prefixColor = { '광채': '#3399cc', '분쇄': '#ff4d4f', '선명': '#25c2a0', '강타': '#ffd700' };

    const CHIM_LABEL = `<span style="background:linear-gradient(to bottom,#ffb3c6,#ffffff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-weight:bold;font-size:0.9em;">[침식]</span> `;
    const makeWeaponLabel = (r) => {
        if (!r.itemname) return '(미착용)';
        const chimPart   = r.exceed === '침식' ? CHIM_LABEL : '';
        const prefixPart = r.prefix ? `<span style="color:${prefixColor[r.prefix]||'#fff'};font-weight:bold;">[${r.prefix}]</span> ` : '';
        return `${chimPart}${prefixPart}${r.itemname}`;
    };

    const ATTACK_SPEED_GROUP = [
        '[기본효과] 매우 느린 공격 속도','[기본효과] 느린 공격 속도','[기본효과] 보통 공격 속도','[기본효과] 빠른 공격 속도','[기본효과] 매우 빠른 공격 속도',
        '[기본효과] 매우 느린 뽑는 속도','[기본효과] 느린 뽑는 속도','[기본효과] 보통 뽑는 속도','[기본효과] 빠른 뽑는 속도','[기본효과] 매우 빠른 뽑는 속도',
    ];

    let tbodyHtml = `<tr>
        <td style="text-align:center;padding:4px 8px;color:#e6c86e;font-size:0.85em;white-space:nowrap;font-weight:bold;border-right:1px solid #2a3158;">무기</td>
        <td style="text-align:center;padding:3px 8px;color:#aad4ff;font-size:0.78em;white-space:nowrap;border-right:2px solid #aaa !important;" colspan="2">${makeWeaponLabel(r1)}</td>
        <td style="text-align:center;padding:3px 8px;color:#aad4ff;font-size:0.78em;white-space:nowrap;" colspan="2">${makeWeaponLabel(r2)}</td>
        <td style="text-align:center;padding:4px 8px;color:#e6c86e;font-size:0.85em;white-space:nowrap;font-weight:bold;border-left:1px solid #2a3158;">무기</td>
    </tr>`;

    const noData1 = !r1.stats || Object.keys(r1.stats).length === 0;
    const noData2 = !r2.stats || Object.keys(r2.stats).length === 0;

    if (!noData1 || !noData2) {
        const speedKey1 = Object.keys(r1.stats || {}).find(k => ATTACK_SPEED_GROUP.includes(k)) || null;
        const speedKey2 = Object.keys(r2.stats || {}).find(k => ATTACK_SPEED_GROUP.includes(k)) || null;
        const allKeys = [...new Set([
            ...Object.keys(r1.stats || {}).filter(k => !ATTACK_SPEED_GROUP.includes(k)),
            ...Object.keys(r2.stats || {}).filter(k => !ATTACK_SPEED_GROUP.includes(k)),
        ])];
        const sectionOrder = ['[기본효과]', '[효과]'];
        allKeys.sort((a, b) => sectionOrder.findIndex(s => a.startsWith(s)) - sectionOrder.findIndex(s => b.startsWith(s)));

        if (speedKey1 || speedKey2) {
            const dk1 = speedKey1 ? speedKey1.replace(/^\[기본효과\] /, '') : '';
            const dk2 = speedKey2 ? speedKey2.replace(/^\[기본효과\] /, '') : '';
            const isSame = dk1 === dk2;
            const hl = !isSame ? 'background:rgba(100,114,168,0.12);' : '';
            tbodyHtml += `<tr style="${hl}">
    <td style="text-align:center;padding:2px 6px;color:#7a9fcf;font-size:0.75em;white-space:nowrap;border-right:1px solid #2a3158;">${speedKey1 ? '기본효과' : ''}</td>
    <td style="text-align:center;padding:2px 8px;color:#ccc;font-size:0.82em;white-space:nowrap;border-right:2px solid #aaa !important;" colspan="2">${dk1}</td>
    <td style="text-align:center;padding:2px 8px;color:#ccc;font-size:0.82em;white-space:nowrap;" colspan="2">${dk2}</td>
    <td style="text-align:center;padding:2px 6px;color:#7a9fcf;font-size:0.75em;white-space:nowrap;border-left:1px solid #2a3158;">${speedKey2 ? '기본효과' : ''}</td>
</tr>`;
        }

        allKeys.forEach(key => {
            const e1 = r1.stats?.[key], e2 = r2.stats?.[key];
            const v1 = e1?.amount ?? 0, v2 = e2?.amount ?? 0;
            const unit = e1?.unit || e2?.unit || '';
            const highlight = (v1 !== v2) ? 'background:rgba(100,114,168,0.12);' : '';
            const displayKey = key.replace(/^\[기본효과\] |^\[효과\] /, '');
            const sectionTag = key.match(/^\[(.+?)\]/)?.[1] || '';
            const tagColor = sectionTag === '기본효과' ? '#7a9fcf' : '#a0d4a0';
            const display1 = _fmtStatCell(v1, v2, unit, e1 !== undefined);
            const display2 = _fmtStatCell(v2, v1, unit, e2 !== undefined);
            tbodyHtml += _statRow(tagColor, sectionTag, displayKey, display1, display2, highlight, e1 !== undefined, e2 !== undefined);
        });
    }

    // attrs 행
    const attrs1 = r1.attrs || [], attrs2 = r2.attrs || [];
    if (attrs1.length > 0 || attrs2.length > 0) {
        const ad = (attrs) => attrs.map(a => `<span style="display:inline-block;padding:1px 6px;border-radius:3px;background:rgba(100,114,168,0.25);color:#b0bcff;font-size:0.8em;margin:1px 2px;">${a}</span>`).join(' ') || '<span style="color:#555;font-size:0.8em;">-</span>';
        tbodyHtml += `<tr style="background:rgba(100,114,168,0.08);">
            <td style="text-align:center;padding:2px 6px;color:#b0bcff;font-size:0.75em;white-space:nowrap;border-right:1px solid #2a3158;">속성</td>
            <td style="text-align:center;padding:3px 8px;white-space:nowrap;border-right:2px solid #aaa !important;" colspan="2">${ad(attrs1)}</td>
            <td style="text-align:center;padding:3px 8px;white-space:nowrap;" colspan="2">${ad(attrs2)}</td>
            <td style="text-align:center;padding:2px 6px;color:#b0bcff;font-size:0.75em;white-space:nowrap;border-left:1px solid #2a3158;">속성</td>
        </tr>`;
    }

    // desc 행
    const desc1 = r1.desc || '', desc2 = r2.desc || '';
    if (desc1 || desc2) {
        const fd = (d) => d ? d.split('\n').map(l => `<span style="display:block;line-height:1.5;">${l}</span>`).join('') : '<span style="color:#555;font-size:0.8em;">-</span>';
        const rowBg = (desc1 !== desc2) ? 'background:rgba(240,165,0,0.06);' : '';
        tbodyHtml += `<tr style="${rowBg}">
            <td style="text-align:center;padding:2px 6px;color:#c8b87a;font-size:0.75em;white-space:nowrap;border-right:1px solid #2a3158;">설명</td>
            <td colspan="2" style="padding:4px 8px;color:#c8b87a;font-size:0.8em;border-right:2px solid #aaa !important;text-align:left;vertical-align:top;">${fd(desc1)}</td>
            <td colspan="2" style="padding:4px 8px;color:#c8b87a;font-size:0.8em;border-right:1px solid #2a3158;text-align:left;vertical-align:top;">${fd(desc2)}</td>
            <td style="text-align:center;padding:2px 6px;color:#c8b87a;font-size:0.75em;white-space:nowrap;border-left:1px solid #2a3158;">설명</td>
        </tr>`;
    }

    // 접두어 고유효과 행
    const PREFIXES_ORDER = ['광채', '분쇄', '선명', '강타'];
    const fmtEff = (eff, pref) => {
        if (!eff) return '<span style="color:#555;font-size:0.8em;">-</span>';
        const color = prefixColor[pref] || '#fff';
        return `<span style="color:${color};font-weight:bold;font-size:0.8em;">[${pref}]</span>` +
            eff.split('\n').map(l => `<span style="display:block;line-height:1.5;color:${color};font-size:0.8em;">${l}</span>`).join('');
    };
    const eff1 = PREFIXES_ORDER.includes(r1.prefix) ? getWeaponPrefixUniqueEffect(r1.job, r1.prefix) : '';
    const eff2 = PREFIXES_ORDER.includes(r2.prefix) ? getWeaponPrefixUniqueEffect(r2.job, r2.prefix) : '';
    if (eff1 || eff2) {
        tbodyHtml += `<tr style="background:rgba(100,114,168,0.08);">
            <td style="text-align:center;padding:2px 6px;color:#d6d989;font-size:0.75em;white-space:nowrap;border-right:1px solid #2a3158;">고유 효과</td>
            <td style="text-align:left;padding:4px 8px;border-right:2px solid #aaa !important;vertical-align:top;" colspan="2">${fmtEff(eff1, r1.prefix)}</td>
            <td style="text-align:left;padding:4px 8px;border-right:1px solid #2a3158;vertical-align:top;" colspan="2">${fmtEff(eff2, r2.prefix)}</td>
            <td style="text-align:center;padding:2px 6px;color:#d6d989;font-size:0.75em;white-space:nowrap;border-left:1px solid #2a3158;">고유 효과</td>
        </tr>`;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'compare-section-wrapper';
    const titleEl = document.createElement('div');
    titleEl.className = 'compare-section-title';
    titleEl.textContent = '*무기 스탯 비교*';
    wrapper.appendChild(titleEl);
    const tableWrap = document.createElement('div');
    tableWrap.style.cssText = 'overflow-x:auto;margin-top:6px;';
    tableWrap.innerHTML = `<table class="stat-compare-table" style="border-collapse:collapse;width:max-content;min-width:400px;">${_statTableThead(name1, name2)}<tbody>${tbodyHtml}</tbody></table>`;
    wrapper.appendChild(tableWrap);
    return wrapper;
}

// ============================================
// 방어구/악세서리/특수장비 스탯 비교 공통 헬퍼
// ============================================

function _buildSlotStatCompare(title, slots, section1, section2, name1, name2, getStatsFn, exceedSlotTrigger) {
    const slotResults1 = {}, slotResults2 = {};
    slots.forEach(slot => { slotResults1[slot] = getStatsFn(section1, slot); slotResults2[slot] = getStatsFn(section2, slot); });

    let tbodyHtml = '';
    const sectionOrderFull = ['[기본효과]', '[효과]', '[방어구 마스터리]'];

    slots.forEach((slot, slotIdx) => {
        const r1 = slotResults1[slot], r2 = slotResults2[slot];
        if (slotIdx > 0) tbodyHtml += `<tr><td colspan="6" style="padding:0;border-top:1px solid #2a3158;"></td></tr>`;

        if (!r1.stats && !r2.stats) {
            tbodyHtml += `<tr>
                <td style="text-align:center;padding:3px 8px;color:#e6c86e;font-size:0.85em;white-space:nowrap;font-weight:bold;border-right:1px solid #2a3158;">${slot}</td>
                <td style="text-align:center;padding:3px 8px;color:#555;font-size:0.8em;border-right:2px solid #aaa !important;" colspan="2">${r1.itemname || '(미착용)'}</td>
                <td style="text-align:center;padding:3px 8px;color:#555;font-size:0.8em;" colspan="2">${r2.itemname || '(미착용)'}</td>
                <td style="text-align:center;padding:3px 8px;color:#e6c86e;font-size:0.85em;font-weight:bold;">${slot}</td>
            </tr>`;
            return;
        }

        const makeLabel = (r) => r.itemname
            ? `${r.exceed ? `[${r.exceed}] ` : ''}${r.prefix && r.prefix !== '기본' ? `${r.prefix}: ` : ''}${r.itemname}`
            : '(미착용)';

        tbodyHtml += `<tr>
            <td style="text-align:center;padding:4px 8px;color:#e6c86e;font-size:0.85em;white-space:nowrap;font-weight:bold;border-right:1px solid #2a3158;">${slot}</td>
            <td style="text-align:center;padding:3px 8px;color:#aad4ff;font-size:0.78em;white-space:nowrap;border-right:2px solid #aaa !important;" colspan="2">${makeLabel(r1)}</td>
            <td style="text-align:center;padding:3px 8px;color:#aad4ff;font-size:0.78em;white-space:nowrap;" colspan="2">${makeLabel(r2)}</td>
            <td style="text-align:center;padding:4px 8px;color:#e6c86e;font-size:0.85em;white-space:nowrap;font-weight:bold;border-left:1px solid #2a3158;">${slot}</td>
        </tr>`;

        const allKeys = [...new Set([...Object.keys(r1.stats || {}), ...Object.keys(r2.stats || {})])];
        allKeys.sort((a, b) => sectionOrderFull.findIndex(s => a.startsWith(s)) - sectionOrderFull.findIndex(s => b.startsWith(s)));

        allKeys.forEach(key => {
            const e1 = r1.stats?.[key], e2 = r2.stats?.[key];
            const v1 = e1?.amount ?? 0, v2 = e2?.amount ?? 0;
            const unit = e1?.unit || e2?.unit || '';
            const highlight = (v1 !== v2) ? 'background:rgba(100,114,168,0.12);' : '';
            const displayKey = key.replace(/^\[기본효과\] |^\[효과\] |^\[방어구 마스터리\] /, '');
            const sectionTag = key.match(/^\[(.+?)\]/)?.[1] || '';
            const tagColor = sectionTag === '기본효과' ? '#7a9fcf' : sectionTag === '효과' ? '#a0d4a0' : '#c8a0d4';
            const display1 = _fmtStatCell(v1, v2, unit, e1 !== undefined);
            const display2 = _fmtStatCell(v2, v1, unit, e2 !== undefined);
            tbodyHtml += _statRow(tagColor, sectionTag, displayKey, display1, display2, highlight, e1 !== undefined, e2 !== undefined);
        });

        // attrs 행
        const attrs1 = r1.attrs || [], attrs2 = r2.attrs || [];
        if (attrs1.length > 0 || attrs2.length > 0) {
            const ad = (attrs) => attrs.map(a => `<span style="display:inline-block;padding:1px 6px;border-radius:3px;background:rgba(100,114,168,0.25);color:#b0bcff;font-size:0.8em;margin:1px 2px;">${a}</span>`).join(' ') || '<span style="color:#555;font-size:0.8em;">-</span>';
            tbodyHtml += `<tr style="background:rgba(100,114,168,0.08);">
                <td style="text-align:center;padding:2px 6px;color:#b0bcff;font-size:0.75em;white-space:nowrap;border-right:1px solid #2a3158;">속성</td>
                <td style="text-align:center;padding:3px 8px;white-space:nowrap;border-right:2px solid #aaa !important;" colspan="2">${ad(attrs1)}</td>
                <td style="text-align:center;padding:3px 8px;white-space:nowrap;" colspan="2">${ad(attrs2)}</td>
                <td style="text-align:center;padding:2px 6px;color:#b0bcff;font-size:0.75em;white-space:nowrap;border-left:1px solid #2a3158;">속성</td>
            </tr>`;
        }

        // desc 행
        const desc1 = r1.desc || '', desc2 = r2.desc || '';
        if (desc1 || desc2) {
            const fd = (d) => d ? d.split('\n').map(l => `<span style="display:block;line-height:1.5;">${l}</span>`).join('') : '<span style="color:#555;font-size:0.8em;">-</span>';
            const rowBg = (desc1 !== desc2) ? 'background:rgba(240,165,0,0.06);' : '';
            tbodyHtml += `<tr style="${rowBg}">
                <td style="text-align:center;padding:2px 6px;color:#c8b87a;font-size:0.75em;white-space:nowrap;border-right:1px solid #2a3158;">설명</td>
                <td colspan="2" style="padding:4px 8px;color:#c8b87a;font-size:0.8em;border-right:2px solid #aaa !important;text-align:left;vertical-align:top;">${fd(desc1)}</td>
                <td colspan="2" style="padding:4px 8px;color:#c8b87a;font-size:0.8em;border-right:1px solid #2a3158;text-align:left;vertical-align:top;">${fd(desc2)}</td>
                <td style="text-align:center;padding:2px 6px;color:#c8b87a;font-size:0.75em;white-space:nowrap;border-left:1px solid #2a3158;">설명</td>
            </tr>`;
        }

        // 익시드 고유효과 행
        if (slot === exceedSlotTrigger) {
            const job1 = section1.querySelector('[data-key="info_job"]')?.value || '';
            const job2 = section2.querySelector('[data-key="info_job"]')?.value || '';
            tbodyHtml += buildExceedUniqueEffectRows(
                getExceedUniqueEffect(job1, r1.exceed || ''),
                r1.exceed || '',
                getExceedUniqueEffect(job2, r2.exceed || ''),
                r2.exceed || ''
            );
        }
    });

    const wrapper = document.createElement('div');
    wrapper.className = 'compare-section-wrapper';
    const titleEl = document.createElement('div');
    titleEl.className = 'compare-section-title';
    titleEl.textContent = title;
    wrapper.appendChild(titleEl);
    const tableWrap = document.createElement('div');
    tableWrap.style.cssText = 'overflow-x:auto;margin-top:6px;';
    tableWrap.innerHTML = `<table class="stat-compare-table" style="border-collapse:collapse;width:max-content;min-width:400px;">${_statTableThead(name1, name2)}<tbody>${tbodyHtml}</tbody></table>`;
    wrapper.appendChild(tableWrap);
    return wrapper;
}

function buildArmorStatCompare(section1, section2, name1, name2) {
    const armorData = (typeof ARMOR_ITEM_STATS !== 'undefined') ? ARMOR_ITEM_STATS : {};
    const getArmorStats = (section, slot) => {
        const itemname = section.querySelector(`[data-key="${slot}_itemname"]`)?.value || '';
        const exceed   = section.querySelector(`select[data-key="${slot}_exceed"]`)?.value || '';
        const prefix   = section.querySelector(`select[data-key="${slot}_prefix"]`)?.value || '';
        if (!itemname || !armorData[itemname]) return { itemname, exceed, prefix, stats: null, attrs: [], desc: '' };
        const item = armorData[itemname];
        const pfxKey = item.exceed ? (prefix || '전격') : (prefix || '기본');
        const eStage = exceed || '이상';
        const map = {};
        const add = (arr, sl) => { if (!Array.isArray(arr)) return; arr.forEach(e => { (e.stats||[]).forEach(sn => { const k=`[${sl}] ${sn}`; if(!map[k]) map[k]={amount:0,unit:e.unit||''}; map[k].amount+=(e.amount||0); }); }); };
        add(item.base?.[pfxKey], '기본효과'); add(item.eff?.[pfxKey], '효과'); add(item.mastery?.[pfxKey], '방어구 마스터리');
        const attrs = item.attrs ? (item.exceed ? (item.attrs?.[eStage]?.[prefix||'전격']||[]) : (item.attrs?.[pfxKey]||[])) : [];
        const desc  = item.desc  ? (item.exceed ? (item.desc?.[eStage]?.[prefix||'전격']||'')  : (item.desc?.[pfxKey]||''))   : '';
        return { itemname, exceed, prefix, stats: map, attrs, desc };
    };
    return _buildSlotStatCompare('*방어구 스탯 비교*', ["상의","어깨","하의","신발","벨트"], section1, section2, name1, name2, getArmorStats, '상의');
}

function buildAccStatCompare(section1, section2, name1, name2) {
    const accData = (typeof ACCESSORY_ITEM_STATS !== 'undefined') ? ACCESSORY_ITEM_STATS : {};
    const getAccStats = (section, slot) => {
        const itemname = section.querySelector(`[data-key="${slot}_itemname"]`)?.value || '';
        const exceed   = section.querySelector(`select[data-key="${slot}_exceed"]`)?.value || '';
        const prefix   = section.querySelector(`select[data-key="${slot}_prefix"]`)?.value || '';
        if (!itemname || !accData[itemname]) return { itemname, exceed, prefix, stats: null, attrs: [], desc: '' };
        const item = accData[itemname];
        const pfxKey = item.exceed ? (prefix || '견고') : (prefix || '기본');
        const eStage = exceed || '이상';
        const map = {};
        const add = (arr, sl) => { if (!Array.isArray(arr)) return; arr.forEach(e => { (e.stats||[]).forEach(sn => { const k=`[${sl}] ${sn}`; if(!map[k]) map[k]={amount:0,unit:e.unit||''}; map[k].amount+=(e.amount||0); }); }); };
        add(item.base?.[pfxKey], '기본효과'); add(item.eff?.[pfxKey], '효과');
        const attrs = item.attrs ? (item.exceed ? (item.attrs?.[eStage]?.[prefix||'견고']||[]) : (item.attrs?.[pfxKey]||[])) : [];
        const desc  = item.desc  ? (item.exceed ? (item.desc?.[eStage]?.[prefix||'견고']||'')  : (item.desc?.[pfxKey]||''))   : '';
        return { itemname, exceed, prefix, stats: map, attrs, desc };
    };
    return _buildSlotStatCompare('*악세서리 스탯 비교*', ["팔찌","목걸이","반지"], section1, section2, name1, name2, getAccStats, '팔찌');
}

function buildSpecialStatCompare(section1, section2, name1, name2) {
    const specialData = (typeof SPECIAL_ITEM_STATS !== 'undefined') ? SPECIAL_ITEM_STATS : {};
    const getSpecialStats = (section, slot) => {
        const itemname = section.querySelector(`[data-key="${slot}_itemname"]`)?.value || '';
        const exceed   = section.querySelector(`select[data-key="${slot}_exceed"]`)?.value || '';
        const prefix   = section.querySelector(`select[data-key="${slot}_prefix"]`)?.value || '';
        if (!itemname || !specialData[itemname]) return { itemname, exceed, prefix, stats: null, attrs: [], desc: '' };
        const item = specialData[itemname];
        const pfxKey = item.exceed ? (prefix || '불굴') : (prefix || '기본');
        const eStage = exceed || '이상';
        const map = {};
        const add = (arr, sl) => { if (!Array.isArray(arr)) return; arr.forEach(e => { (e.stats||[]).forEach(sn => { const k=`[${sl}] ${sn}`; if(!map[k]) map[k]={amount:0,unit:e.unit||''}; map[k].amount+=(e.amount||0); }); }); };
        add(item.base?.[pfxKey], '기본효과'); add(item.eff?.[pfxKey], '효과');
        const attrs = item.attrs ? (item.exceed ? (item.attrs?.[eStage]?.[prefix||'불굴']||[]) : (item.attrs?.[pfxKey]||[])) : [];
        const desc  = item.desc  ? (item.exceed ? (item.desc?.[eStage]?.[prefix||'불굴']||'')  : (item.desc?.[pfxKey]||''))   : '';
        return { itemname, exceed, prefix, stats: map, attrs, desc };
    };
    return _buildSlotStatCompare('*특수장비 스탯 비교*', ["귀걸이","마법석","보조장비"], section1, section2, name1, name2, getSpecialStats, '귀걸이');
}

// ============================================
// 세트 효과 비교 tbody 행 생성 헬퍼
// ============================================

function buildSetEffectRows(eff1, eff2, tierLabel1, tierLabel2, tierColor, tierBg) {
    let html = `<tr style="background:${tierBg};">
        <td colspan="3" style="text-align:center;padding:6px 8px;color:${tierColor};font-size:0.9em;font-weight:bold;border-right:2px solid #aaa !important;">${tierLabel1 ? `━━━ ${tierLabel1} 효과 ━━━` : ''}</td>
        <td colspan="3" style="text-align:center;padding:6px 8px;color:${tierColor};font-size:0.9em;font-weight:bold;">${tierLabel2 ? `━━━ ${tierLabel2} 효과 ━━━` : ''}</td>
    </tr>`;

    // attrs 행
    const attrs1 = eff1?.attrs || [], attrs2 = eff2?.attrs || [];
    if (attrs1.length > 0 || attrs2.length > 0) {
        const ad = (attr) => attr ? `<span style="display:inline-block;padding:1px 6px;border-radius:3px;background:rgba(100,114,168,0.25);color:#b0bcff;font-size:0.8em;margin:1px 2px;">${attr}</span>` : '';
        const set1 = new Set(attrs1), set2 = new Set(attrs2);
        const allAttrs = [...attrs1, ...attrs2.filter(a => !set1.has(a))];
        allAttrs.forEach(attr => {
            const has1 = set1.has(attr), has2 = set2.has(attr);
            html += `<tr style="background:rgba(100,114,168,0.08);">
                <td style="text-align:center;padding:2px 6px;color:${tierColor};font-size:0.75em;white-space:nowrap;border-right:1px solid #2a3158;">${has1 ? tierLabel1 : ''}</td>
                <td style="text-align:center;padding:3px 8px;white-space:nowrap;border-right:2px solid #aaa !important;" colspan="2">${has1 ? ad(attr) : ''}</td>
                <td style="text-align:center;padding:3px 8px;white-space:nowrap;" colspan="2">${has2 ? ad(attr) : ''}</td>
                <td style="text-align:center;padding:2px 6px;color:${tierColor};font-size:0.75em;white-space:nowrap;border-left:1px solid #2a3158;">${has2 ? tierLabel2 : ''}</td>
            </tr>`;
        });
    }

    // stats 행
    const statMap1 = {}, statMap2 = {};
    (eff1?.stats || []).forEach(e => e.stats.forEach(n => { statMap1[n] = { amount: e.amount, unit: e.unit || '' }; }));
    (eff2?.stats || []).forEach(e => e.stats.forEach(n => { statMap2[n] = { amount: e.amount, unit: e.unit || '' }; }));
    const allStatNames = [...Object.keys(statMap1), ...Object.keys(statMap2).filter(n => !statMap1[n])];

    if (allStatNames.length === 0 && attrs1.length === 0 && attrs2.length === 0) {
        const noDataLabel = tierLabel1 === tierLabel2 ? tierLabel1 : `${tierLabel1} / ${tierLabel2}`;
        html += `<tr><td colspan="6" style="text-align:center;padding:8px;color:#888;font-size:0.85em;">${noDataLabel} 효과 데이터 없음</td></tr>`;
    } else {
        allStatNames.forEach(statName => {
            const s1 = statMap1[statName] || null, s2 = statMap2[statName] || null;
            const v1 = s1?.amount ?? 0, v2 = s2?.amount ?? 0;
            const unit = s1?.unit || s2?.unit || '';
            const display1 = _fmtStatCell(v1, v2, unit, !!s1);
            const display2 = _fmtStatCell(v2, v1, unit, !!s2);
            const highlight = (display1 !== display2) ? 'background:rgba(100,114,168,0.12);' : '';
            html += `<tr style="${highlight}">
                <td style="text-align:center;padding:2px 6px;color:${tierColor};font-size:0.75em;white-space:nowrap;border-right:1px solid #2a3158;">${s1 ? tierLabel1 : ''}</td>
                <td style="text-align:center;padding:2px 8px;color:#ccc;font-size:0.82em;white-space:nowrap;">${s1 ? statName : ''}</td>
                <td style="text-align:center;padding:2px 8px;color:#e6e9ff;font-size:0.85em;white-space:nowrap;border-right:2px solid #aaa !important;">${display1}</td>
                <td style="text-align:center;padding:2px 8px;color:#e6e9ff;font-size:0.85em;white-space:nowrap;border-right:1px solid #2a3158;">${display2}</td>
                <td style="text-align:center;padding:2px 8px;color:#ccc;font-size:0.82em;white-space:nowrap;">${s2 ? statName : ''}</td>
                <td style="text-align:center;padding:2px 6px;color:${tierColor};font-size:0.75em;white-space:nowrap;border-left:1px solid #2a3158;">${s2 ? tierLabel2 : ''}</td>
            </tr>`;
        });
    }

    // desc 행
    const desc1 = eff1?.desc || '', desc2 = eff2?.desc || '';
    if (desc1 || desc2) {
        const fd = (d) => d ? d.split('\n').map(l => `<span style="display:block;line-height:1.5;">${l}</span>`).join('') : '';
        const rowBg = (desc1 !== desc2) ? 'background:rgba(240,165,0,0.06);' : '';
        html += `<tr style="${rowBg}">
            <td style="text-align:center;padding:2px 6px;color:${tierColor};font-size:0.75em;white-space:nowrap;border-right:1px solid #2a3158;">${eff1 ? tierLabel1 : ''}</td>
            <td colspan="2" style="padding:4px 8px;color:#c8b87a;font-size:0.8em;border-right:2px solid #aaa !important;text-align:left;vertical-align:top;">${fd(desc1)}</td>
            <td colspan="2" style="padding:4px 8px;color:#c8b87a;font-size:0.8em;border-right:1px solid #2a3158;text-align:left;vertical-align:top;">${fd(desc2)}</td>
            <td style="text-align:center;padding:2px 6px;color:${tierColor};font-size:0.75em;white-space:nowrap;border-left:1px solid #2a3158;">${eff2 ? tierLabel2 : ''}</td>
        </tr>`;
    }
    return html;
}

// ============================================
// 방어구 세트 효과 비교
// ============================================

function buildArmorSetEffectCompare(section1, section2, name1, name2) {
    const ARMOR_SLOTS = ["상의", "어깨", "하의", "신발", "벨트"];
    const setEffectsData = (typeof ARMOR_SET_EFFECTS !== 'undefined') ? ARMOR_SET_EFFECTS : {};

    function getArmorSetEffects(section) {
        const armorItemInfo = (typeof ARMOR_ITEM_INFO !== 'undefined') ? ARMOR_ITEM_INFO : {};
        const equipped = {};
        ARMOR_SLOTS.forEach(slot => {
            const itemname = section.querySelector(`[data-key="${slot}_itemname"]`)?.value || '';
            const prefix   = section.querySelector(`select[data-key="${slot}_prefix"]`)?.value || '';
            if (itemname) equipped[slot] = { itemname, prefix };
        });
        const setTotalCount = {}, setPrefixCount = {};
        Object.values(equipped).forEach(({ itemname, prefix }) => {
            const info = armorItemInfo[itemname]; if (!info) return;
            const sn = info.setName;
            setTotalCount[sn] = (setTotalCount[sn] || 0) + 1;
            if (prefix) { if (!setPrefixCount[sn]) setPrefixCount[sn] = {}; setPrefixCount[sn][prefix] = (setPrefixCount[sn][prefix] || 0) + 1; }
        });
        let bestSet = null, bestCount = 0;
        Object.entries(setTotalCount).forEach(([sn, c]) => { if (c > bestCount) { bestSet = sn; bestCount = c; } });
        if (!bestSet || bestCount < 3) return { setName: bestSet, count: bestCount, baseEffects: null, prefixEffect: null };
        const setData = setEffectsData[bestSet] || {};
        const pfxCntBS = setPrefixCount[bestSet] || {};
        let bestPrefix = null, bestPrefixCount = 0;
        Object.entries(pfxCntBS).forEach(([p, c]) => { if (c >= 3 && c > bestPrefixCount) { bestPrefix = p; bestPrefixCount = c; } });
        let prefixEffect = null;
        if (bestPrefix) {
            const pData = setData[bestPrefix] || {};
            prefixEffect = { prefix: bestPrefix, count: bestPrefixCount, effects3: bestPrefixCount >= 3 ? (pData['3']||null) : null, effects5: bestPrefixCount >= 5 ? (pData['5']||null) : null };
        }
        const allSamePrefix = bestPrefix && bestPrefixCount === bestCount;
        let baseEffects = null;
        if (!allSamePrefix) {
            const bData = setData['기본'] || {};
            if (bestPrefix) { const has5 = bestCount >= 5 && bData['5']; baseEffects = { effects3: (!has5 && bestCount >= 3) ? (bData['3']||null) : null, effects5: has5 ? (bData['5']||null) : null }; }
            else { baseEffects = { effects3: bestCount >= 3 ? (bData['3']||null) : null, effects5: bestCount >= 5 ? (bData['5']||null) : null }; }
        }
        return { setName: bestSet, count: bestCount, baseEffects, prefixEffect };
    }

    const result1 = getArmorSetEffects(section1);
    const result2 = getArmorSetEffects(section2);
    const set1Label = result1.setName ? `${result1.setName} (${result1.count}셋)` : '세트 없음';
    const set2Label = result2.setName ? `${result2.setName} (${result2.count}셋)` : '세트 없음';

    let tbodyHtml = `<tr>
        <td style="text-align:center;padding:6px 8px;color:#ffd700;font-size:0.9em;white-space:nowrap;font-weight:bold;border-right:2px solid #aaa !important;" colspan="3">${set1Label}</td>
        <td style="text-align:center;padding:6px 8px;color:#ffd700;font-size:0.9em;white-space:nowrap;font-weight:bold;" colspan="3">${set2Label}</td>
    </tr>`;

    const base3eff1 = result1.baseEffects?.effects3 || null;
    const base3eff2 = result2.baseEffects?.effects3 || null;
    if (base3eff1 || base3eff2) tbodyHtml += buildSetEffectRows(base3eff1, base3eff2, '3세트 (기본)', '3세트 (기본)', '#7fd4ff', 'rgba(127,212,255,0.15)');

    const pe1p = result1.prefixEffect?.prefix || null, pe2p = result2.prefixEffect?.prefix || null;
    const p3eff1 = result1.prefixEffect?.effects3 || null, p3eff2 = result2.prefixEffect?.effects3 || null;
    if (p3eff1 || p3eff2) tbodyHtml += buildSetEffectRows(p3eff1, p3eff2, p3eff1 ? `3세트 (${pe1p})` : '', p3eff2 ? `3세트 (${pe2p})` : '', '#25c2a0', 'rgba(37,194,160,0.15)');

    const left5 = (result1.prefixEffect?.effects5 || result1.baseEffects?.effects5 || null);
    const right5 = (result2.prefixEffect?.effects5 || result2.baseEffects?.effects5 || null);
    if (left5 || right5) {
        const lbl1 = left5  ? (result1.prefixEffect?.effects5 ? `5세트 (${pe1p})` : '5세트 (기본)') : '';
        const lbl2 = right5 ? (result2.prefixEffect?.effects5 ? `5세트 (${pe2p})` : '5세트 (기본)') : '';
        tbodyHtml += buildSetEffectRows(left5, right5, lbl1, lbl2, '#ffd700', 'rgba(255,215,0,0.15)');
    }

    const anyEffect = base3eff1 || base3eff2 || left5 || right5 || result1.prefixEffect || result2.prefixEffect;
    if (!anyEffect) tbodyHtml += `<tr><td colspan="6" style="text-align:center;padding:12px 8px;color:#888;font-size:0.85em;">세트 효과 없음</td></tr>`;

    const wrapper = document.createElement('div');
    wrapper.className = 'compare-section-wrapper';
    const titleEl = document.createElement('div'); titleEl.className = 'compare-section-title'; titleEl.textContent = '*방어구 세트 효과 비교*';
    wrapper.appendChild(titleEl);
    const tableWrap = document.createElement('div');
    tableWrap.style.cssText = 'overflow-x:auto;margin-top:6px;';
    tableWrap.innerHTML = `<table class="stat-compare-table" style="border-collapse:collapse;width:max-content;min-width:400px;">${_setEffectThead(name1, name2)}<tbody>${tbodyHtml}</tbody></table>`;
    wrapper.appendChild(tableWrap);
    return wrapper;
}

// ============================================
// 악세서리/특수장비 세트 효과 공통 헬퍼
// ============================================

function _buildSimpleSetEffectCompare(title, slots, slotPrefixKeys, section1, section2, name1, name2, setEffectsData, itemInfoData) {
    function getSetEffects(section) {
        const slotData = {};
        slots.forEach(slot => {
            const itemname = section.querySelector(`[data-key="${slot}_itemname"]`)?.value || '';
            const prefix   = section.querySelector(`select[data-key="${slot}_prefix"]`)?.value || '';
            if (itemname) slotData[slot] = { itemname, prefix };
        });
        const items = Object.values(slotData);
        if (!items.length) return { setName: null, prefix: null, count: 0, effects3: null };
        const setNames = items.map(({ itemname }) => itemInfoData[itemname]?.setName).filter(Boolean);
        if (!setNames.length) return { setName: null, prefix: null, count: 0, effects3: null };
        const snCnt = {};
        setNames.forEach(s => { snCnt[s] = (snCnt[s] || 0) + 1; });
        const bestSet = Object.entries(snCnt).sort((a, b) => b[1] - a[1])[0][0];
        const count = snCnt[bestSet];
        if (count < 3) return { setName: bestSet, prefix: null, count, effects3: null };
        const prefixes = slotPrefixKeys.map(k => slotData[k]?.prefix || '기본');
        const resultPrefix = (prefixes.every(p => p === prefixes[0]) && prefixes[0] !== '기본') ? prefixes[0] : '기본';
        let effects3 = null;
        const setData = setEffectsData[bestSet];
        if (setData?.[resultPrefix]) { effects3 = setData[resultPrefix]["3"]; }
        else { const sd = setEffectsData[bestSet.replace(/^[^:]+:\s*/, '')]; if (sd?.[resultPrefix]) effects3 = sd[resultPrefix]["3"]; }
        return { setName: bestSet, prefix: resultPrefix, count, effects3 };
    }

    const result1 = getSetEffects(section1);
    const result2 = getSetEffects(section2);
    const mkLabel = (r) => r.setName ? `${r.prefix && r.prefix !== '기본' ? r.prefix + ': ' : ''}${r.setName} (${r.count}셋)` : '세트 없음';

    let tbodyHtml = `<tr>
        <td style="text-align:center;padding:6px 8px;color:#ffd700;font-size:0.9em;white-space:nowrap;font-weight:bold;border-right:2px solid #aaa !important;" colspan="3">${mkLabel(result1)}</td>
        <td style="text-align:center;padding:6px 8px;color:#ffd700;font-size:0.9em;white-space:nowrap;font-weight:bold;" colspan="3">${mkLabel(result2)}</td>
    </tr>`;

    if (result1.effects3 || result2.effects3) {
        const lbl1 = result1.effects3 ? (result1.prefix && result1.prefix !== '기본' ? `3세트 (${result1.prefix})` : '3세트') : '';
        const lbl2 = result2.effects3 ? (result2.prefix && result2.prefix !== '기본' ? `3세트 (${result2.prefix})` : '3세트') : '';
        tbodyHtml += buildSetEffectRows(result1.effects3 || null, result2.effects3 || null, lbl1, lbl2, '#7fd4ff', 'rgba(127,212,255,0.15)');
    }
    if (!result1.effects3 && !result2.effects3) tbodyHtml += `<tr><td colspan="6" style="text-align:center;padding:12px 8px;color:#888;font-size:0.85em;">세트 효과 없음</td></tr>`;

    const wrapper = document.createElement('div');
    wrapper.className = 'compare-section-wrapper';
    const titleEl = document.createElement('div'); titleEl.className = 'compare-section-title'; titleEl.textContent = title;
    wrapper.appendChild(titleEl);
    const tableWrap = document.createElement('div');
    tableWrap.style.cssText = 'overflow-x:auto;margin-top:6px;';
    tableWrap.innerHTML = `<table class="stat-compare-table" style="border-collapse:collapse;width:max-content;min-width:400px;">${_setEffectThead(name1, name2)}<tbody>${tbodyHtml}</tbody></table>`;
    wrapper.appendChild(tableWrap);
    return wrapper;
}

function buildAccSetEffectCompare(section1, section2, name1, name2) {
    return _buildSimpleSetEffectCompare(
        '*악세서리 세트 효과 비교*',
        ["팔찌", "목걸이", "반지"], ["팔찌", "목걸이", "반지"],
        section1, section2, name1, name2,
        (typeof ACCESSORY_SET_EFFECTS !== 'undefined') ? ACCESSORY_SET_EFFECTS : {},
        (typeof ACC_ITEM_INFO !== 'undefined') ? ACC_ITEM_INFO : {}
    );
}

function buildSpecialSetEffectCompare(section1, section2, name1, name2) {
    return _buildSimpleSetEffectCompare(
        '*특수장비 세트 효과 비교*',
        ["귀걸이", "마법석", "보조장비"], ["귀걸이", "마법석", "보조장비"],
        section1, section2, name1, name2,
        (typeof SPECIAL_SET_EFFECTS !== 'undefined') ? SPECIAL_SET_EFFECTS : {},
        (typeof SPECIAL_ITEM_INFO !== 'undefined') ? SPECIAL_ITEM_INFO : {}
    );
}

console.log("✅ mode-compare-stat.js 로드 완료");
