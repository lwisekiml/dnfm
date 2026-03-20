/* ========================================
   eq_statistics.js - 장비 통계 및 검색
   (showEquipmentStatistics, showWeaponStatistics, searchEquipment)
======================================== */

// 장비 통계 표시 함수
function showEquipmentStatistics() {
    // 상태 업데이트
    isCharacterEquipmentViewOpen = false;
    isStatisticsViewOpen = true;
    selectedCharacterForEquipment = null;

    // 기존 화면 숨기기
    document.getElementById("character-selection-area").style.display = "none";
    document.getElementById("character-equipment-detail").style.display = "none";

    const displayArea = document.getElementById("equipment-display-area");
    displayArea.style.display = "block";

    // 모든 장비 관리 버튼 비활성화
    document.querySelectorAll("#section-equipment-view .equipment-button-row .char-btn").forEach(btn => {
        btn.classList.remove('active');
    });

    let html = `<h2 style="color: #ffd700; margin-bottom: 20px;">📊 캐릭터별 장비 보유 통계</h2>`;

    // 통계 테이블
    html += `<table style="width: max-content; border-collapse: collapse; margin-bottom: 30px;">`;
    html += `<thead style="background: #181c33;"><tr>
        <th style="padding: 10px; border: 1px solid #2a3158; white-space: nowrap; text-align: center;">직업(이름)</th>
        <th style="padding: 10px; border: 1px solid #2a3158; white-space: nowrap; text-align: center;">방어구</th>
        <th style="padding: 10px; border: 1px solid #2a3158; white-space: nowrap; text-align: center;">악세</th>
        <th style="padding: 10px; border: 1px solid #2a3158; white-space: nowrap; text-align: center;">특장</th>
        <th style="padding: 10px; border: 1px solid #2a3158; white-space: nowrap; text-align: center;">무기</th>
        <th style="padding: 10px; border: 1px solid #2a3158; white-space: nowrap; text-align: center;">합계</th>
    </tr></thead><tbody>`;

    // 각 캐릭터별 통계
    characters.forEach(char => {
        let armorCount = 0;
        let accessoryCount = 0;
        let specialCount = 0;
        let weaponCount = 0;

        // 방어구/악세/특장 개수 계산
        if (char.armorCounts) {
            Object.entries(char.armorCounts).forEach(([key, count]) => {
                if (count <= 0) return;

                const parts = key.split(' ');
                const slot = parts.pop();
                const name = parts.join(' ');
                const groupKey = getGroupKey(name);
                const setType = getSetType(groupKey);

                if (setType === "ARMOR") armorCount += count;
                else if (setType === "ACCESSORY") accessoryCount += count;
                else if (setType === "SPECIAL") specialCount += count;
            });
        }

        // 무기 개수 계산
        if (char.weaponCounts) {
            Object.values(char.weaponCounts).forEach(count => {
                weaponCount += count || 0;
            });
        }

        const total = armorCount + accessoryCount + specialCount + weaponCount;

        html += `<tr style="border-bottom: 1px solid #444;">
            <td style="padding: 10px; border: 1px solid #2a3158; text-align: center; font-weight: bold;">${char.job}(${char.name})</td>
            <td style="padding: 10px; border: 1px solid #2a3158; text-align: center; color: #fff; font-weight: bold;">${armorCount}</td>
            <td style="padding: 10px; border: 1px solid #2a3158; text-align: center; color: #fff; font-weight: bold;">${accessoryCount}</td>
            <td style="padding: 10px; border: 1px solid #2a3158; text-align: center; color: #fff; font-weight: bold;">${specialCount}</td>
            <td style="padding: 10px; border: 1px solid #2a3158; text-align: center; color: #fff; font-weight: bold;">${weaponCount}</td>
            <td style="padding: 10px; border: 1px solid #2a3158; text-align: center; color: #ffd700; font-weight: bold;">${total}</td>
        </tr>`;
    });

    // 전체 합계 행
    let totalArmor = 0;
    let totalAccessory = 0;
    let totalSpecial = 0;
    let totalWeapon = 0;

    characters.forEach(char => {
        if (char.armorCounts) {
            Object.entries(char.armorCounts).forEach(([key, count]) => {
                if (count <= 0) return;
                const parts = key.split(' ');
                const slot = parts.pop();
                const name = parts.join(' ');
                const groupKey = getGroupKey(name);
                const setType = getSetType(groupKey);

                if (setType === "ARMOR") totalArmor += count;
                else if (setType === "ACCESSORY") totalAccessory += count;
                else if (setType === "SPECIAL") totalSpecial += count;
            });
        }

        if (char.weaponCounts) {
            Object.values(char.weaponCounts).forEach(count => {
                totalWeapon += count || 0;
            });
        }
    });

    const grandTotal = totalArmor + totalAccessory + totalSpecial + totalWeapon;

    html += `<tr style="background: #1a1e33; border-top: 3px solid #ffd700;">
        <td style="padding: 10px; border: 1px solid #2a3158; text-align: center; font-weight: bold; color: #ffd700;">전체 합계</td>
        <td style="padding: 10px; border: 1px solid #2a3158; text-align: center; color: #ffd700; font-weight: bold;">${totalArmor}</td>
        <td style="padding: 10px; border: 1px solid #2a3158; text-align: center; color: #ffd700; font-weight: bold;">${totalAccessory}</td>
        <td style="padding: 10px; border: 1px solid #2a3158; text-align: center; color: #ffd700; font-weight: bold;">${totalSpecial}</td>
        <td style="padding: 10px; border: 1px solid #2a3158; text-align: center; color: #ffd700; font-weight: bold;">${totalWeapon}</td>
        <td style="padding: 10px; border: 1px solid #2a3158; text-align: center; color: #ffd700; font-weight: bold; font-size: 1.1em;">${grandTotal}</td>
    </tr>`;

    html += `</tbody></table>`;

    displayArea.innerHTML = html;
}

/* ========================================
무기 보유 현황
======================================== */
let activeWeaponStatJob = null;

function showWeaponStatistics(selectedJob = null) {
    isCharacterEquipmentViewOpen = false;
    isStatisticsViewOpen = true;
    selectedCharacterForEquipment = null;

    document.getElementById("character-selection-area").style.display = "none";
    document.getElementById("character-equipment-detail").style.display = "none";

    const displayArea = document.getElementById("equipment-display-area");
    displayArea.style.display = "block";

    const availableJobs = JOB_LIST.filter(jobGroup => {
        const jobData = WEAPON_DATA_MAP[jobGroup];
        if (!jobData) return false;
        return Object.values(jobData).some(weaponList =>
            weaponList.some(weaponName =>
                WEAPON_PREFIXES.some(prefix =>
                    characters.some(char => (char.weaponCounts?.[`${prefix.tag} ${weaponName}`] || 0) > 0)
                )
            )
        );
    });

    if (!selectedJob) selectedJob = availableJobs[0] || null;
    activeWeaponStatJob = selectedJob;

    let html = `<h2 style="color:#ffd700; margin-bottom:16px;">⚔️ 무기 보유 현황</h2>`;
    html += `<div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:20px;">`;
    availableJobs.forEach(job => {
        html += `<button class="char-btn${job === selectedJob ? ' active' : ''}" onclick="showWeaponStatistics('${job}')">${job}</button>`;
    });
    html += `</div>`;

    if (!selectedJob) {
        html += `<p style="color:#888;">보유한 무기가 없습니다.</p>`;
        displayArea.innerHTML = html;
        return;
    }

    const jobData = WEAPON_DATA_MAP[selectedJob];

    html += `<div style="overflow-x:auto;">`;
    html += `<table style="table-layout:fixed; border-collapse:collapse; width:max-content;">`;
    html += `<thead><tr style="background:#181c33;">`;
    html += `<th style="width:120px; padding:12px; border:1px solid #2a3158; white-space:nowrap;">종류</th>`;
    html += `<th style="width:300px; padding:12px; border:1px solid #2a3158; white-space:nowrap;">무기 이름</th>`;
    html += `<th style="width:150px; padding:12px; border:1px solid #2a3158; white-space:nowrap; text-align:center;">직업(이름)</th>`;
    html += `<th style="width:70px;  padding:12px; border:1px solid #2a3158; white-space:nowrap; text-align:center;">개수</th>`;
    html += `</tr></thead><tbody>`;

    const categories = Object.keys(jobData);
    categories.forEach((category, cIdx) => {
        const weaponList = jobData[category];
        const visibleItems = [];
        weaponList.forEach(weaponName => {
            WEAPON_PREFIXES.forEach(pref => {
                const key = `${pref.tag} ${weaponName}`;
                const owners = characters
                    .map(char => ({ job: char.job, name: char.name, val: char.weaponCounts?.[key] || 0 }))
                    .filter(o => o.val > 0);
                if (owners.length > 0) visibleItems.push({ weaponName, pref, owners });
            });
        });
        if (visibleItems.length === 0) return;

        const totalRows = visibleItems.reduce((sum, item) => sum + item.owners.length, 0);
        let categoryRendered = false;

        visibleItems.forEach(item => {
            item.owners.forEach((owner, oIdx) => {
                html += `<tr>`;
                if (!categoryRendered) {
                    html += `<td rowspan="${totalRows}" style="background:#181c33; font-weight:bold; width:120px; border:1px solid #2a3158; text-align:center; vertical-align:middle; color:#fff; padding:10px;">${category}</td>`;
                    categoryRendered = true;
                }
                if (oIdx === 0) {
                    html += `<td rowspan="${item.owners.length}" style="text-align:left; padding:8px 15px; white-space:nowrap; border:1px solid #2a3158; vertical-align:middle;"><span style="color:${item.pref.color}; font-weight:bold;">${item.pref.tag}</span>&nbsp;${item.weaponName}</td>`;
                }
                html += `<td style="padding:6px 10px; border:1px solid #2a3158; text-align:center; white-space:nowrap;">${owner.job}(${owner.name})</td>`;
                html += `<td style="padding:6px 10px; border:1px solid #2a3158; text-align:center; color:${item.pref.color}; font-weight:bold;">${owner.val}</td>`;
                html += `</tr>`;
            });
        });

        if (cIdx < categories.length - 1) {
            html += `<tr style="height:20px;"><td colspan="4" style="border:none; border-bottom:1px solid #2a3158; background:transparent;"></td></tr>`;
        }
    });

    html += `</tbody></table></div>`;
    displayArea.innerHTML = html;
}

/* ========================================
장비 검색 기능
======================================== */
function searchEquipment() {
    const searchInput = document.getElementById("equipment-search-input");
    const searchTerm = searchInput.value.trim();

    if (!searchTerm) {
        alert("검색어를 입력해주세요!");
        return;
    }

    // 상태 업데이트
    isCharacterEquipmentViewOpen = false;
    isStatisticsViewOpen = false;
    selectedCharacterForEquipment = null;

    document.getElementById("character-selection-area").style.display = "none";
    document.getElementById("character-equipment-detail").style.display = "none";

    const displayArea = document.getElementById("equipment-display-area");
    displayArea.style.display = "block";

    document.querySelectorAll("#section-equipment-view .equipment-button-row .char-btn").forEach(btn => {
        btn.classList.remove('active');
    });

    let html = `<h2 style="color:#ffd700; margin-bottom:20px;">🔍 검색 결과: "${searchTerm}"</h2>`;
    let found = false;

    // ── 1. 장비(방어구/악세/특장) 검색 ──────────────────────────
    const CATEGORIES = [
        {name: "방어구", sets: ARMOR_SETS, prefix: ARMOR_PREFIX},
        {name: "악세",   sets: ACCESSORY_SETS, prefix: ACCESSORY_PREFIX},
        {name: "특장",   sets: SPECIAL_SETS, prefix: SPECIAL_PREFIX}
    ];

    CATEGORIES.forEach(category => {
        Object.keys(category.sets).forEach(baseSetName => {
            if (!baseSetName.includes(searchTerm)) return;
            found = true;

            const set = {
                category: category.name,
                setName: baseSetName,
                slots: category.sets[baseSetName],
                prefixes: category.prefix[baseSetName] || [],
                isLegacy: LEGACY_PREFIX_SETS.includes(baseSetName)
            };

            html += `<h3 style="color:#fff; margin-top:30px; margin-bottom:15px;">[${set.category}] ${set.setName}</h3>`;
            html += `<table style="width:max-content; border-collapse:collapse; margin-bottom:30px; border:1px solid #2a3158;">`;
            html += `<thead style="background:#181c33;"><tr>
                <th style="padding:10px; border:1px solid #2a3158; white-space:nowrap;">직업(이름)</th>
                <th style="padding:10px; border:1px solid #2a3158; white-space:nowrap;">익시드</th>
                <th style="padding:10px; border:1px solid #2a3158; white-space:nowrap;">접두어</th>`;
            set.slots.forEach(slot => {
                html += `<th style="padding:10px; border:1px solid #2a3158; white-space:normal; max-width:120px; font-size:0.85em; line-height:1.2;">${slot}</th>`;
            });
            html += `<th style="padding:10px; border:1px solid #2a3158; white-space:nowrap;">달성</th>`;
            html += `</tr></thead><tbody>`;

            characters.forEach(char => {
                let charRows = [];

                if (set.prefixes.length > 0) {
                    set.prefixes.forEach(pref => {
                        EXCEED_TAGS.forEach(tag => {
                            let rowData = {exceed: tag, prefix: pref, slots: {}, total: 0};
                            const prefKey = makePrefixKey(pref, set.setName);
                            set.slots.forEach(slot => {
                                const count = char.armorCounts?.[`[${tag}] ${prefKey} ${slot}`] || 0;
                                rowData.slots[slot] = count;
                                rowData.total += count;
                            });
                            if (rowData.total > 0) charRows.push(rowData);
                        });
                    });
                }

                set.prefixes.forEach(pref => {
                    let rowData = {exceed: '', prefix: pref, slots: {}, total: 0};
                    const prefKey = makePrefixKey(pref, set.setName);
                    set.slots.forEach(slot => {
                        const count = char.armorCounts?.[`${prefKey} ${slot}`] || 0;
                        rowData.slots[slot] = count;
                        rowData.total += count;
                    });
                    if (rowData.total > 0) charRows.push(rowData);
                });

                if (!set.isLegacy) {
                    let normalRow = {exceed: '', prefix: '', slots: {}, total: 0};
                    set.slots.forEach(slot => {
                        const count = char.armorCounts?.[`${set.setName} ${slot}`] || 0;
                        normalRow.slots[slot] = count;
                        normalRow.total += count;
                    });
                    if (normalRow.total > 0) charRows.push(normalRow);
                }

                if (charRows.length === 0) return;

                charRows.forEach((row, rowIdx) => {
                    html += `<tr style="border-bottom:1px solid #444;">`;
                    if (rowIdx === 0) {
                        html += `<td rowspan="${charRows.length}" style="padding:10px; border:1px solid #2a3158; font-weight:bold; background:#1a1e33; text-align:center; vertical-align:middle; white-space:nowrap;">${char.job}(${char.name})</td>`;
                    }
                    if (row.exceed) {
                        const tagColor = EXCEED_COLOR_MAP[row.exceed] || "#ffd700";
                        html += `<td style="padding:10px; border:1px solid #2a3158; text-align:center; white-space:nowrap;"><span style="color:${tagColor}; font-weight:bold;">[${row.exceed}]</span></td>`;
                    } else {
                        html += `<td style="padding:10px; border:1px solid #2a3158;"></td>`;
                    }
                    if (row.prefix) {
                        html += `<td style="padding:10px; border:1px solid #2a3158; text-align:center; white-space:nowrap;"><span style="color:#e6b800; font-weight:bold;">${row.prefix}</span></td>`;
                    } else {
                        html += `<td style="padding:10px; border:1px solid #2a3158;"></td>`;
                    }
                    set.slots.forEach(slot => {
                        const count = row.slots[slot] || 0;
                        html += `<td style="padding:10px; border:1px solid #2a3158; text-align:center; color:#fff; font-weight:bold;">${count > 0 ? count : ''}</td>`;
                    });

                    // 달성 열
                    if (row.exceed) {
                        html += `<td style="padding:10px; border:1px solid #2a3158; text-align:center;"></td>`;
                    } else {
                        const achieved = set.slots.filter(slot => (row.slots[slot] || 0) > 0).length;
                        const fullSize = set.slots.length;
                        let achieveColor = "#fff";
                        if (fullSize === 5) {
                            if (achieved === 5) achieveColor = "#ffd700";
                            else if (achieved >= 3) achieveColor = "#2ecc71";
                        } else {
                            if (achieved === 3) achieveColor = "#2ecc71";
                        }
                        html += `<td style="padding:10px; border:1px solid #2a3158; text-align:center; font-weight:bold; color:${achieveColor};">${achieved}</td>`;
                    }

                    html += `</tr>`;
                });

                html += `<tr style="height:3px; background:#666;"><td colspan="${4 + set.slots.length}" style="padding:0; border:none;"></td></tr>`;
            });

            html += `</tbody></table>`;
        });
    });

    // ── 2. 무기 검색 ──────────────────────────────────────────────
    // 종류(소검/도/...) 또는 무기 이름으로 검색
    JOB_LIST.forEach(jobGroup => {
        const jobData = WEAPON_DATA_MAP[jobGroup];
        if (!jobData) return;

        // 이 직업군에서 검색어와 일치하는 항목 수집
        // visibleItems: { weaponName, pref, owners }
        const visibleItems = [];
        Object.entries(jobData).forEach(([category, weaponList]) => {
            const categoryMatch = category.includes(searchTerm);
            weaponList.forEach(weaponName => {
                if (!categoryMatch && !weaponName.includes(searchTerm)) return;
                WEAPON_PREFIXES.forEach(pref => {
                    const key = `${pref.tag} ${weaponName}`;
                    const owners = characters
                        .map(char => ({ job: char.job, name: char.name, val: char.weaponCounts?.[key] || 0 }))
                        .filter(o => o.val > 0);
                    if (owners.length > 0) {
                        visibleItems.push({ category, weaponName, pref, owners });
                    }
                });
            });
        });

        if (visibleItems.length === 0) return;
        found = true;

        html += `<h3 style="color:#aad4ff; margin-top:30px; margin-bottom:15px;">[무기] ${jobGroup}</h3>`;
        html += `<table style="table-layout:fixed; border-collapse:collapse; margin-bottom:30px; width:max-content;">`;
        html += `<thead><tr style="background:#181c33;">`;
        html += `<th style="width:120px; padding:12px; border:1px solid #2a3158; white-space:nowrap;">종류</th>`;
        html += `<th style="width:300px; padding:12px; border:1px solid #2a3158; white-space:nowrap;">무기 이름</th>`;
        html += `<th style="width:150px; padding:12px; border:1px solid #2a3158; white-space:nowrap; text-align:center;">직업(이름)</th>`;
        html += `<th style="width:70px;  padding:12px; border:1px solid #2a3158; white-space:nowrap; text-align:center;">개수</th>`;
        html += `</tr></thead><tbody>`;

        // 카테고리별로 그룹핑해서 종류 rowspan 처리
        const byCategory = {};
        visibleItems.forEach(item => {
            if (!byCategory[item.category]) byCategory[item.category] = [];
            byCategory[item.category].push(item);
        });

        Object.entries(byCategory).forEach(([category, items], cIdx, arr) => {
            const totalRows = items.reduce((sum, item) => sum + item.owners.length, 0);
            let categoryRendered = false;

            items.forEach(item => {
                item.owners.forEach((owner, oIdx) => {
                    html += `<tr>`;
                    if (!categoryRendered) {
                        html += `<td rowspan="${totalRows}" style="background:#181c33; font-weight:bold; width:120px; border:1px solid #2a3158; text-align:center; vertical-align:middle; color:#fff; padding:10px;">${category}</td>`;
                        categoryRendered = true;
                    }
                    if (oIdx === 0) {
                        html += `<td rowspan="${item.owners.length}" style="text-align:left; padding:8px 15px; white-space:nowrap; border:1px solid #2a3158; vertical-align:middle;"><span style="color:${item.pref.color}; font-weight:bold;">${item.pref.tag}</span>&nbsp;${item.weaponName}</td>`;
                    }
                    html += `<td style="padding:6px 10px; border:1px solid #2a3158; text-align:center; white-space:nowrap;">${owner.job}(${owner.name})</td>`;
                    html += `<td style="padding:6px 10px; border:1px solid #2a3158; text-align:center; color:${item.pref.color}; font-weight:bold;">${owner.val}</td>`;
                    html += `</tr>`;
                });
            });

            if (cIdx < arr.length - 1) {
                html += `<tr style="height:20px;"><td colspan="4" style="border:none; border-bottom:1px solid #2a3158; background:transparent;"></td></tr>`;
            }
        });

        html += `</tbody></table>`;
    });

    if (!found) {
        html += `<p style="color:#888; font-size:1.2em; margin-top:50px; text-align:center;">검색 결과가 없습니다.</p>`;
    }

    displayArea.innerHTML = html;
}

// Enter 키로도 검색 가능하도록 이벤트 리스너 추가 (초기화 섹션에 추가)
document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById("equipment-search-input");
    if (searchInput) {
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') searchEquipment();
        });
    }
});