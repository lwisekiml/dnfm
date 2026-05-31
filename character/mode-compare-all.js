// ============================================
// mode-compare-all.js - 전체 비교 탭
// ============================================
// ※ 의존: mode-compare-utils.js (CmpData, CS)
// ============================================

function buildAllItemsCompare(container) {
    const SECTION_ORDER = ['[기본효과]', '[효과]', '[방어구 마스터리]'];

    [
        { label: '방어구',   data: CmpData.armor,   type: 'armor'   },
        { label: '악세서리', data: CmpData.acc,     type: 'acc'     },
        { label: '특수장비', data: CmpData.special, type: 'special' }
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
                const stats   = _extractStatMap(item, prefixKey, type);
                const allKeys = Object.keys(stats);
                allKeys.sort((a, b) => {
                    const sa = SECTION_ORDER.findIndex(s => a.startsWith(s));
                    const sb = SECTION_ORDER.findIndex(s => b.startsWith(s));
                    return (sa === -1 ? 99 : sa) - (sb === -1 ? 99 : sb);
                });

                if (varIdx === 0) tbodyHtml += `<tr><td colspan="3" style="padding:0;border-top:2px solid #2a3158;"></td></tr>`;
                tbodyHtml += `<tr><td colspan="3" style="padding:4px 10px;background:rgba(100,114,168,0.18);color:#aad4ff;font-size:0.82em;white-space:nowrap;font-weight:bold;">${displayLabel}</td></tr>`;
                if (allKeys.length === 0) tbodyHtml += `<tr><td colspan="3" style="padding:3px 10px;color:#555;font-size:0.8em;">(스탯 데이터 없음)</td></tr>`;

                allKeys.forEach(key => {
                    const { amount: v, unit = '' } = stats[key];
                    const displayKey = key.replace(/^\[기본효과\] |^\[효과\] |^\[방어구 마스터리\] /, '');
                    const sectionTag = key.match(/^\[(.+?)\]/)?.[1] || '';
                    const tagColor   = sectionTag === '기본효과' ? CS.TAG_BASE : sectionTag === '효과' ? CS.TAG_EFF : CS.TAG_MASTER;
                    tbodyHtml += `<tr>
                        <td style="${CS.TAG_CELL(tagColor)}width:90px;${CS.BR_THIN}">${sectionTag}</td>
                        <td style="text-align:left;padding:2px 10px;color:#ccc;font-size:0.82em;white-space:nowrap;">${displayKey}</td>
                        <td style="${CS.VAL_CELL}${CS.BL_THIN}width:80px;">${v !== 0 ? `${v}${unit}` : ''}</td>
                    </tr>`;
                });

                // 속성 행
                const attrs = _getItemAttrs(item, prefixKey);
                if (attrs.length > 0) {
                    const attrHtml = attrs.map(a => `<span style="display:inline-block;padding:1px 6px;border-radius:3px;background:rgba(100,114,168,0.25);color:#b0bcff;font-size:0.8em;margin:1px 2px;">${a}</span>`).join(' ');
                    tbodyHtml += `<tr style="${CS.ROW_ATTR}"><td style="${CS.ATTR_CELL}${CS.BR_THIN}">속성</td><td colspan="2" style="padding:3px 10px;">${attrHtml}</td></tr>`;
                }

                // 설명 행
                const desc = _getItemDesc(item, prefixKey);
                if (desc) {
                    const fmtDesc = desc.split('\n').map(line => `<span style="display:block;line-height:1.5;">${line}</span>`).join('');
                    tbodyHtml += `<tr><td style="${CS.TAG_CELL(CS.TAG_DESC)}${CS.BR_THIN}">설명</td><td colspan="2" style="${CS.DESC_CELL}">${fmtDesc}</td></tr>`;
                }
            });
        });

        tableWrap.innerHTML = `<table style="border-collapse:collapse;width:max-content;min-width:340px;">
            <thead><tr>
                <th style="padding:4px 8px;text-align:center;font-size:0.8em;width:90px;${CS.BR_THIN}">구분</th>
                <th style="padding:4px 8px;text-align:center;font-size:0.8em;">스탯</th>
                <th style="padding:4px 8px;text-align:center;font-size:0.8em;width:80px;${CS.BL_THIN}">수치</th>
            </tr></thead>
            <tbody>${tbodyHtml}</tbody>
        </table>`;
        wrapper.appendChild(tableWrap);
        container.appendChild(wrapper);
    });
}

function _getAllItemVariants(item, itemname) {
    if (item.exceed) {
        const firstPrefix = Object.keys(item.base || {})[0] || '';
        return [{ prefixKey: firstPrefix, displayLabel: `[익시드 이상] ${itemname} / ${firstPrefix}` }];
    }
    return Object.keys(item.base || {}).map(pfx => ({
        prefixKey:    pfx,
        displayLabel: pfx === '기본' ? itemname : `${itemname} / ${pfx}`
    }));
}

function _extractStatMap(item, prefixKey, type) {
    const map = {};
    const add = (arr, label) => {
        if (!Array.isArray(arr)) return;
        arr.forEach(entry => {
            (entry.stats || []).forEach(statName => {
                const k = `[${label}] ${statName}`;
                if (!map[k]) map[k] = { amount: 0, unit: entry.unit || '' };
                map[k].amount += (entry.amount || 0);
            });
        });
    };
    add(item.base?.[prefixKey], '기본효과');
    add(item.eff?.[prefixKey],  '효과');
    if (type === 'armor') add(item.mastery?.[prefixKey], '방어구 마스터리');
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