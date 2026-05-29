// ============================================
// mode-compare-all.js - 전체 비교 탭
// ============================================
// ※ 의존: mode-compare-utils.js
// ============================================

function buildAllItemsCompare(container) {
    const armorData   = (typeof ARMOR_ITEM_STATS   !== 'undefined') ? ARMOR_ITEM_STATS   : {};
    const accData     = (typeof ACCESSORY_ITEM_STATS !== 'undefined') ? ACCESSORY_ITEM_STATS : {};
    const specialData = (typeof SPECIAL_ITEM_STATS  !== 'undefined') ? SPECIAL_ITEM_STATS  : {};

    [{ label: '방어구', data: armorData, type: 'armor' },
        { label: '악세서리', data: accData, type: 'acc' },
        { label: '특수장비', data: specialData, type: 'special' }
    ].forEach(({ label, data, type }) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'compare-section-wrapper';
        wrapper.style.marginBottom = '24px';
        const titleEl = document.createElement('div');
        titleEl.className = 'compare-section-title';
        titleEl.textContent = `*${label} 전체 스탯*`;
        wrapper.appendChild(titleEl);

        const tableWrap = document.createElement('div');
        tableWrap.style.cssText = 'overflow-x:auto;margin-top:6px;';
        let tbodyHtml = '';

        Object.entries(data).forEach(([itemname, item]) => {
            _getAllItemVariants(item, itemname).forEach(({ prefixKey, displayLabel }, varIdx) => {
                const stats = _extractStatMap(item, prefixKey, type);
                const allKeys = Object.keys(stats);
                const sectionOrder = ['[기본효과]', '[효과]', '[방어구 마스터리]'];
                allKeys.sort((a, b) => {
                    const sa = sectionOrder.findIndex(s => a.startsWith(s));
                    const sb = sectionOrder.findIndex(s => b.startsWith(s));
                    return (sa === -1 ? 99 : sa) - (sb === -1 ? 99 : sb);
                });
                if (varIdx === 0) tbodyHtml += `<tr><td colspan="4" style="padding:0;border-top:2px solid #2a3158;"></td></tr>`;
                tbodyHtml += `<tr><td colspan="4" style="padding:4px 10px;background:rgba(100,114,168,0.18);color:#aad4ff;font-size:0.82em;white-space:nowrap;font-weight:bold;">${displayLabel}</td></tr>`;
                if (allKeys.length === 0) tbodyHtml += `<tr><td colspan="4" style="padding:3px 10px;color:#555;font-size:0.8em;">(스탯 데이터 없음)</td></tr>`;
                allKeys.forEach(key => {
                    const entry = stats[key];
                    const v = entry.amount, unit = entry.unit || '';
                    const displayKey = key.replace(/^\[기본효과\] |^\[효과\] |^\[방어구 마스터리\] /, '');
                    const sectionTag = key.match(/^\[(.+?)\]/)?.[1] || '';
                    const tagColor = sectionTag === '기본효과' ? '#7a9fcf' : sectionTag === '효과' ? '#a0d4a0' : '#c8a0d4';
                    tbodyHtml += `<tr>
                        <td style="text-align:center;padding:2px 8px;color:${tagColor};font-size:0.75em;white-space:nowrap;width:90px;border-right:1px solid #2a3158;">${sectionTag}</td>
                        <td style="text-align:left;padding:2px 10px;color:#ccc;font-size:0.82em;white-space:nowrap;">${displayKey}</td>
                        <td style="text-align:center;padding:2px 10px;color:#e6e9ff;font-size:0.85em;white-space:nowrap;border-left:1px solid #2a3158;width:80px;">${v !== 0 ? `${v}${unit}` : ''}</td>
                        <td style="width:10px;"></td>
                    </tr>`;
                });
                const attrs = _getItemAttrs(item, prefixKey);
                if (attrs.length > 0) {
                    const attrHtml = attrs.map(a => `<span style="display:inline-block;padding:1px 6px;border-radius:3px;background:rgba(100,114,168,0.25);color:#b0bcff;font-size:0.8em;margin:1px 2px;">${a}</span>`).join(' ');
                    tbodyHtml += `<tr style="background:rgba(100,114,168,0.08);"><td style="text-align:center;padding:2px 8px;color:#b0bcff;font-size:0.75em;white-space:nowrap;border-right:1px solid #2a3158;">속성</td><td colspan="3" style="padding:3px 10px;">${attrHtml}</td></tr>`;
                }
                const desc = _getItemDesc(item, prefixKey);
                if (desc) {
                    const fmtDesc = desc.split('\n').map(line => `<span style="display:block;line-height:1.5;">${line}</span>`).join('');
                    tbodyHtml += `<tr><td style="text-align:center;padding:2px 8px;color:#c8b87a;font-size:0.75em;white-space:nowrap;border-right:1px solid #2a3158;">설명</td><td colspan="3" style="padding:4px 10px;color:#c8b87a;font-size:0.8em;text-align:left;vertical-align:top;">${fmtDesc}</td></tr>`;
                }
            });
        });

        tableWrap.innerHTML = `<table style="border-collapse:collapse;width:max-content;min-width:340px;"><thead><tr><th style="padding:4px 8px;text-align:center;font-size:0.8em;width:90px;border-right:1px solid #2a3158;">구분</th><th style="padding:4px 8px;text-align:center;font-size:0.8em;">스탯</th><th style="padding:4px 8px;text-align:center;font-size:0.8em;width:80px;border-left:1px solid #2a3158;">수치</th><th style="width:10px;"></th></tr></thead><tbody>${tbodyHtml}</tbody></table>`;
        wrapper.appendChild(tableWrap);
        container.appendChild(wrapper);
    });
}

function _getAllItemVariants(item, itemname) {
    const variants = [];
    if (item.exceed) {
        const firstPrefix = Object.keys(item.base || {})[0] || '';
        variants.push({ prefixKey: firstPrefix, displayLabel: `[익시드 이상] ${itemname} / ${firstPrefix}` });
    } else {
        Object.keys(item.base || {}).forEach(pfx => {
            variants.push({ prefixKey: pfx, displayLabel: pfx === '기본' ? `${itemname}` : `${itemname} / ${pfx}` });
        });
    }
    return variants;
}

function _extractStatMap(item, prefixKey, type) {
    const map = {};
    const addToMap = (arr, section) => {
        if (!Array.isArray(arr)) return;
        arr.forEach(entry => {
            (entry.stats || []).forEach(statName => {
                const key = `[${section}] ${statName}`;
                if (!map[key]) map[key] = { amount: 0, unit: entry.unit || '' };
                map[key].amount += (entry.amount || 0);
            });
        });
    };
    addToMap(item.base?.[prefixKey], '기본효과');
    addToMap(item.eff?.[prefixKey],  '효과');
    if (type === 'armor') addToMap(item.mastery?.[prefixKey], '방어구 마스터리');
    return map;
}

function _getItemAttrs(item, prefixKey) {
    if (!item.attrs) return [];
    const val = item.attrs[prefixKey];
    return Array.isArray(val) ? val : [];
}

function _getItemDesc(item, prefixKey) {
    if (!item.desc) return '';
    const val = item.desc[prefixKey];
    return typeof val === 'string' ? val : '';
}

console.log("✅ mode-compare-all.js 로드 완료");
