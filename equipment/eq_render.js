/* ========================================
   eq_render.js - 장비 탭 렌더링
   (renderEquipmentTab, renderFullEquipmentTab,
    toggleCharacterEquipmentView, renderCharacterEquipmentDetail 등)
======================================== */

function renderEquipmentTab(mode) {
    // 상태 초기화
    isCharacterEquipmentViewOpen = false;
    isStatisticsViewOpen = false;
    selectedCharacterForEquipment = null;

    // 모든 영역 초기화
    document.getElementById("character-selection-area").style.display = "none";
    document.getElementById("character-equipment-detail").style.display = "none";
    document.getElementById("equipment-display-area").style.display = "block";

    const displayArea = document.getElementById("equipment-display-area");
    const CATEGORIES = [
        {name: "방어구", sets: ARMOR_SETS, prefix: ARMOR_PREFIX, id: 'cat-armor'},
        {name: "악세", sets: ACCESSORY_SETS, prefix: ACCESSORY_PREFIX, id: 'cat-accessory'},
        {name: "특장", sets: SPECIAL_SETS, prefix: SPECIAL_PREFIX, id: 'cat-special'}
    ];

    // 스크롤 버튼 추가
    let scrollButtonHtml = `<div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">`;
    CATEGORIES.forEach(cat => {
        scrollButtonHtml += `<button class="char-btn" style="background: #4a33cc; border: 1px solid #ffd700;"
                            onclick="scrollToCategory('${cat.id}')">${cat.name}로 이동 →</button>`;
    });
    scrollButtonHtml += `</div>`;

    let fullHtml = scrollButtonHtml + `<h2 style="color:#ffd700; margin-bottom:20px;">📊 캐릭터별 상세 현황 (${mode})</h2>`;

    CATEGORIES.forEach(cat => {
        fullHtml += `<div id="${cat.id}" style="margin-bottom: 50px; padding-top: 20px; border-top: 3px solid #4a33cc;">`;
        fullHtml += `<h2 style="color:#ffd700; font-size: 24px; margin-bottom: 15px;">🔹 ${cat.name}</h2>`;

        Object.keys(cat.sets).forEach(baseSetName => {
            const prefixes = cat.prefix[baseSetName] || [];
            const slots = cat.sets[baseSetName];
            const setType = getSetType(baseSetName);
            let targetGroupKeys = [];

            // NORMAL: 레거시 세트는 일반 행 없음
            if ((mode === 'NORMAL' || mode === 'ALL') && !LEGACY_PREFIX_SETS.includes(baseSetName)) {
                targetGroupKeys.push({
                    full: baseSetName,
                    display: "일반",
                    type: 'NORMAL'
                });
            }

            if (mode === 'PREFIX' || mode === 'ALL') {
                prefixes.forEach(p => {
                    const prefKey = makePrefixKey(p, baseSetName);
                    targetGroupKeys.push({
                        full: prefKey,
                        display: p,
                        type: 'PREFIX'
                    });
                });
            }

            if (mode === 'EXCEED' || mode === 'ALL') {
                if (prefixes.length > 0) {
                    prefixes.forEach(p => {
                        const prefKey = makePrefixKey(p, baseSetName);
                        EXCEED_TAGS.forEach(tag => targetGroupKeys.push({
                            full: `[${tag}] ${prefKey}`,
                            display: p,
                            tag: tag,
                            type: 'EXCEED'
                        }));
                    });
                }
            }

            if (targetGroupKeys.length === 0) return;

            fullHtml += `<h3 style="color:#fff; margin-top:30px;">[${baseSetName} 세트]</h3>`;

            let displaySlots = slots;
            if (mode === 'EXCEED') {
                if (setType === "ARMOR") displaySlots = ["상의"];
                else if (setType === "ACCESSORY") displaySlots = ["팔찌"];
                else if (setType === "SPECIAL") displaySlots = ["귀걸이"];
            }

            fullHtml += `<table style="width:max-content; border-collapse:collapse; margin-bottom:20px; border:1px solid #2a3158;">
    <thead style="background:#181c33;"><tr>
        <th style="padding:10px; border:1px solid #2a3158; white-space:nowrap;">직업</th>
        <th style="padding:10px; border:1px solid #2a3158; white-space:nowrap;">이름</th>
        ${(mode === 'ALL' || mode === 'EXCEED') ? '<th style="padding:10px; border:1px solid #2a3158; white-space:nowrap;">익시드</th>' : ''}
        ${mode !== 'NORMAL' ? '<th style="padding:10px; border:1px solid #2a3158; white-space:nowrap;">접두어</th>' : ''}
        ${displaySlots.map(s => {
                const rawName = (setType === "SPECIAL" && SPECIAL_DISPLAY_NAMES[baseSetName] && SPECIAL_DISPLAY_NAMES[baseSetName][s])
                    ? SPECIAL_DISPLAY_NAMES[baseSetName][s]
                    : (setType === "ACCESSORY" && ACCESSORY_DISPLAY_NAMES[baseSetName] && ACCESSORY_DISPLAY_NAMES[baseSetName][s])
                        ? ACCESSORY_DISPLAY_NAMES[baseSetName][s]
                        : (setType === "ARMOR" && ARMOR_DISPLAY_NAMES[baseSetName] && ARMOR_DISPLAY_NAMES[baseSetName][s])
                            ? ARMOR_DISPLAY_NAMES[baseSetName][s]
                            : s;
                let displayName;
                if (Array.isArray(rawName)) {
                    // 익시드 모드: [0](익시드), 일반/접두어 모드: [1](일반), ALL: 둘 다 표시
                    if (mode === 'EXCEED') displayName = rawName[0];
                    else if (mode === 'ALL') displayName = rawName[0] + "<br>" + rawName[1];
                    else displayName = rawName[1];
                } else {
                    displayName = rawName;
                }
                const thWrap = (Array.isArray(rawName) && mode === 'ALL') ? "normal" : "nowrap";
                return `<th style="padding:10px; border:1px solid #2a3158; white-space:${thWrap}; font-size:0.85em; line-height:1.2;">${displayName}</th>`;
            }).join('')}
        ${mode !== 'EXCEED' ? '<th style="padding:10px; border:1px solid #2a3158; white-space:nowrap;">달성</th>' : ''}
    </tr></thead><tbody>`;

            characters.forEach(char => {
                const totalDistinct = calcTotalDistinctParts(char, baseSetName);

                // 해당 캐릭터가 가진 현재 세트의 아이템 데이터 그룹들
                const charGroups = targetGroupKeys.filter(group =>
                    slots.some(s => (char.armorCounts?.[`${group.full} ${s}`] || 0) > 0)
                );

                charGroups.forEach((group, gIdx) => {
                    // 각 모드별로 달성도 계산
                    let displayDistinct = totalDistinct;
                    let statusColor = "#fff";

                    if (mode === 'NORMAL') {
                        displayDistinct = 0;
                        slots.forEach(slot => {
                            const key = `${baseSetName} ${slot}`;
                            if ((char.armorCounts[key] || 0) > 0) displayDistinct++;
                        });
                    } else if (mode === 'PREFIX') {
                        displayDistinct = 0;
                        slots.forEach(slot => {
                            const key = `${group.full} ${slot}`;
                            if ((char.armorCounts[key] || 0) > 0) displayDistinct++;
                        });
                    }

                    // 색상 결정
                    if (setType === "ARMOR") {
                        if (displayDistinct === 5) statusColor = "#ffd700";
                        else if (displayDistinct >= 3) statusColor = "#2ecc71";
                    } else {
                        if (displayDistinct === 3) statusColor = "#2ecc71";
                    }

                    let slotsHtml = displaySlots.map(s => {
                        const count = char.armorCounts?.[`${group.full} ${s}`] || 0;
                        return `<td style="padding:10px; border:1px solid #2a3158; text-align:center; color:${count > 0 ? '#fff' : '#444'}; font-weight:bold;">${count}</td>`;
                    }).join('');

                    let rowInfo = "";
                    const tagColor = EXCEED_COLOR_MAP[group.tag] || "#ffd700";

                    // 일반 모드가 아닐 때만 접두어(display) 셀을 생성
                    if (mode === 'ALL' || mode === 'EXCEED') {
                        const tagCol = group.tag ? `<td style="padding:10px; border:1px solid #2a3158; color:${tagColor}; font-weight:bold; white-space:nowrap;">[${group.tag}]</td>` : `<td style="border:1px solid #2a3158;"></td>`;
                        rowInfo = tagCol + `<td style="padding:10px; border:1px solid #2a3158; color:#ffd700; font-weight:bold; white-space:nowrap;">${group.display}</td>`;
                    } else if (mode === 'PREFIX') {
                        rowInfo = `<td style="padding:10px; border:1px solid #2a3158; color:#ffd700; font-weight:bold; white-space:nowrap;">${group.display}</td>`;
                    }

                    // [모두] 버튼일 때만 캐릭터 경계선에 진한 선 적용
                    const isLastRowOfChar = (gIdx === charGroups.length - 1);
                    const borderStyle = (mode === 'ALL' && isLastRowOfChar) ? "border-bottom: 3px solid #666;" : "border-bottom: 1px solid #2a3158;";

                    fullHtml += `<tr>
                    <td style="padding:10px; ${borderStyle} background:#181c33; white-space:nowrap;">${char.job}</td>
                    <td style="padding:10px; ${borderStyle} white-space:nowrap;">${char.name}</td>
                    ${rowInfo.replace(/border:1px solid #2a3158/g, borderStyle)}${slotsHtml.replace(/border:1px solid #2a3158/g, borderStyle)}
                    ${mode !== 'EXCEED' ? `<td style="padding:10px; ${borderStyle} font-weight:bold; text-align:center; color:${statusColor};">${displayDistinct}</td>` : ''}
                </tr>`;
                });
            });
            fullHtml += `</tbody></table>`;
        });

        fullHtml += `</div>`; // 카테고리 닫는 태그 추가
    });

    displayArea.innerHTML = fullHtml;
}

// 2. 전체 현황 렌더링 (이름 열 너비 고정 및 색상 적용)
function renderFullEquipmentTab(mode) {
    // 상태 초기화
    isCharacterEquipmentViewOpen = false;
    isStatisticsViewOpen = false;
    selectedCharacterForEquipment = null;

    // 모든 영역 초기화
    document.getElementById("character-selection-area").style.display = "none";
    document.getElementById("character-equipment-detail").style.display = "none";
    document.getElementById("equipment-display-area").style.display = "block";

    const displayArea = document.getElementById("equipment-display-area");
    const CATEGORIES = [
        {name: "방어구", sets: ARMOR_SETS, prefix: ARMOR_PREFIX, id: 'cat-armor'},
        {name: "악세", sets: ACCESSORY_SETS, prefix: ACCESSORY_PREFIX, id: 'cat-accessory'},
        {name: "특장", sets: SPECIAL_SETS, prefix: SPECIAL_PREFIX, id: 'cat-special'}
    ];

    // 스크롤 버튼 추가
    let scrollButtonHtml = `<div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">`;
    CATEGORIES.forEach(cat => {
        scrollButtonHtml += `<button class="char-btn" style="background: #4a33cc; border: 1px solid #ffd700;"
                            onclick="scrollToCategory('${cat.id}')">${cat.name}로 이동 →</button>`;
    });
    scrollButtonHtml += `</div>`;

    let fullHtml = scrollButtonHtml + `<h2 style="color:#ffd700; margin-bottom:20px;">🌎 아이템별 전체 현황 (${mode})</h2>`;

    CATEGORIES.forEach(cat => {
        fullHtml += `<div id="${cat.id}" style="margin-bottom: 50px; padding-top: 20px; border-top: 3px solid #4a33cc;">`;
        fullHtml += `<h2 style="color:#ffd700; font-size: 24px; margin-bottom: 15px;">🔹 ${cat.name}</h2>`;

        Object.keys(cat.sets).forEach(baseSetName => {
            const prefixes = cat.prefix[baseSetName] || [];
            let slots = [...cat.sets[baseSetName]];
            let targetGroups = [];

            if (mode === 'NORMAL' && !LEGACY_PREFIX_SETS.includes(baseSetName)) {
                targetGroups.push({display: baseSetName, full: baseSetName, type: 'NORMAL'});
            } else if (mode === 'PREFIX') {
                prefixes.forEach(p => {
                    const prefKey = makePrefixKey(p, baseSetName);
                    targetGroups.push({
                        display: p,
                        full: prefKey,
                        type: 'PREFIX'
                    });
                });
            } else if (mode === 'EXCEED') {
                slots = slots.filter(s => s === "상의" || s === "팔찌" || s === "귀걸이");
                if (slots.length === 0) return;

                // 기존 로직 (접두어 있는 익시드)
                if (prefixes.length > 0) {
                    prefixes.forEach(p => {
                        const prefKey = makePrefixKey(p, baseSetName);
                        EXCEED_TAGS.forEach(tag => targetGroups.push({
                            display: p,
                            full: prefKey,
                            tag: tag,
                            type: 'EXCEED'
                        }));
                    });
                }
            }

            if (targetGroups.length === 0) return;

            // 해당 세트 데이터 존재 여부 확인
            const hasData = targetGroups.some(group => {
                const searchKeyBase = group.tag ? `[${group.tag}] ${group.full}` : group.full;
                return characters.some(c => slots.some(slot => (c.armorCounts?.[`${searchKeyBase} ${slot}`] || 0) > 0));
            });
            if (!hasData) return;

            fullHtml += `<h3 style="color:#fff; margin-top:30px; margin-bottom:10px;">[${baseSetName} 세트]</h3>`;

            // renderFullEquipmentTab() 함수 내부
            fullHtml += `<table style="width: max-content; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #2a3158;">
    <thead style="background:#181c33;"><tr>
        <th style="padding:10px; border:1px solid #2a3158; color:#fff; text-align:center; white-space:nowrap;">아이템 세트 이름</th>
        ${slots.map(s => {
                // 표시용 이름 적용
                const setType = getSetType(baseSetName);
                const rawName = (setType === "SPECIAL" && SPECIAL_DISPLAY_NAMES[baseSetName] && SPECIAL_DISPLAY_NAMES[baseSetName][s])
                    ? SPECIAL_DISPLAY_NAMES[baseSetName][s]
                    : (setType === "ACCESSORY" && ACCESSORY_DISPLAY_NAMES[baseSetName] && ACCESSORY_DISPLAY_NAMES[baseSetName][s])
                        ? ACCESSORY_DISPLAY_NAMES[baseSetName][s]
                        : (setType === "ARMOR" && ARMOR_DISPLAY_NAMES[baseSetName] && ARMOR_DISPLAY_NAMES[baseSetName][s])
                            ? ARMOR_DISPLAY_NAMES[baseSetName][s]
                            : s;
                let displayName;
                if (Array.isArray(rawName)) {
                    // 익시드 모드: [0](익시드), 일반/접두어 모드: [1](일반)
                    displayName = (mode === 'EXCEED') ? rawName[0] : rawName[1];
                } else {
                    displayName = rawName;
                }
                return `<th style="padding:10px; border:1px solid #2a3158; color:#fff; text-align:center; white-space:nowrap; min-width:180px; max-width:200px; font-size:0.85em; line-height:1.2;">${displayName}</th>`;
            }).join('')}
    </tr></thead><tbody>`;

            targetGroups.forEach(group => {
                const searchKeyBase = group.tag ? `[${group.tag}] ${group.full}` : group.full;

                // 접두어 장비일 때만 모든 슬롯 보유 여부를 체크
                const isFullPrefixSet = (group.type === 'PREFIX') && slots.every(slot =>
                    characters.some(c => (c.armorCounts?.[`${searchKeyBase} ${slot}`] || 0) > 0)
                );

                const rowBg = isFullPrefixSet ? "#5c4d00" : "#0f1222";
                const labelBg = isFullPrefixSet ? "#7a6700" : "#111529";

                let relevantOwners = characters.filter(c => {
                    return slots.some(slot => (c.armorCounts?.[`${searchKeyBase} ${slot}`] || 0) > 0);
                });

                let displayName = "";
                if (group.type === 'EXCEED' || group.type === 'PREFIX') {
                    // 레거시 세트: baseSetName이 이미 "레거시: 마력의 소용돌이" 형태
                    // group.full도 "레거시: 마력의 소용돌이"이므로 중복 방지
                    if (LEGACY_PREFIX_SETS.includes(baseSetName)) {
                        // baseSetName에서 "레거시: " 부분 제거
                        const pureSetName = baseSetName.replace(/^레거시:\s*/, '');
                        displayName = `<span style="color:#ffd700; font-weight:bold;">레거시</span>: <span style="color:#fff;">${pureSetName}</span>`;
                    } else {
                        displayName = `<span style="color:#ffd700; font-weight:bold;">${group.display}</span>: <span style="color:#fff;">${baseSetName}</span>`;
                    }
                    if (group.tag) {
                        const tagColor = EXCEED_COLOR_MAP[group.tag] || "#ffd700";
                        displayName = `<span style="color:${tagColor}; font-weight:bold;">[${group.tag}]</span> ` + displayName;
                    }
                } else {
                    displayName = `<span style="color:#fff;">${group.full}</span>`;
                }

                fullHtml += `<tr style="background: ${rowBg};">
                <td style="padding:12px; border:1px solid #2a3158; background:${labelBg}; vertical-align:middle; text-align:center; white-space:nowrap; color:#fff; font-size:14px;">${displayName}</td>`;

                slots.forEach(slot => {
                    fullHtml += `<td style="padding:8px; border:1px solid #2a3158; vertical-align:middle; text-align:center;">`;

                    if (mode === 'EXCEED') {
                        // 익시드: 가로줄 맞추지 않고 데이터가 있는 캐릭터만 촘촘하게 출력
                        const ownersWithItem = characters.filter(c => (c.armorCounts?.[`${searchKeyBase} ${slot}`] || 0) > 0);
                        if (ownersWithItem.length > 0) {
                            ownersWithItem.forEach(owner => {
                                const count = owner.armorCounts[`${searchKeyBase} ${slot}`];
                                fullHtml += `<div style="margin:4px 0; white-space:nowrap; font-size:14px;">
                                    <span style="color:#aaa;">${owner.job}</span>
                                    <span style="color:#fff; font-weight:bold;">(${owner.name})</span>
                                    <span style="color:#ffd700; font-weight:bold;">[${count}]</span>
                                </div>`;
                            });
                        } else {
                            fullHtml += `<span style="color:#444;">0</span>`;
                        }
                    } else {
                        // 일반/접두어: 모든 캐릭터의 자리를 만들어 가로줄 라인을 맞춤 (30px 고정)
                        relevantOwners.forEach(owner => {
                            const count = owner.armorCounts?.[`${searchKeyBase} ${slot}`] || 0;
                            fullHtml += `<div style="height:30px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:center; align-items:center; gap:8px; white-space:nowrap; padding: 0 10px; font-size:14px;">`;
                            if (count > 0) {
                                fullHtml += `<span style="color:#aaa;">${owner.job}</span>
                                             <span style="color:#fff; font-weight:bold;">(${owner.name})</span>
                                             <span style="color:#ffd700; font-weight:bold;">[${count}]</span>`;
                            } else {
                                fullHtml += `<span style="color:#444;">0</span>`;
                            }
                            fullHtml += `</div>`;
                        });
                    }
                    fullHtml += `</td>`;
                });
                fullHtml += `</tr>`;
            });
            fullHtml += `</tbody></table>`;
        });
        fullHtml += `</div>`; // 카테고리 닫는 태그 추가
    });

    displayArea.innerHTML = fullHtml;
}

// 장비 관리 버튼 활성화 로직 (무기 관리 방식 참조)
function setActiveEquipmentButton(clickedBtn) {
    // 1. 장비 관리 섹션(#section-equipment-view) 전체에서 모든 char-btn을 찾음
    const allEquipmentButtons = document.querySelectorAll("#section-equipment-view .char-btn");

    // 2. 모든 버튼에서 active 클래스 제거 (불빛 끄기)
    allEquipmentButtons.forEach(btn => btn.classList.remove('active'));

    // 3. 현재 클릭한 버튼에만 active 클래스 추가 (불빛 켜기)
    if (clickedBtn) {
        clickedBtn.classList.add('active');
    }
}

function scrollToCategory(categoryId) {
    const element = document.getElementById(categoryId);
    if (element) {
        element.scrollIntoView({behavior: 'smooth'});
    }
}

/* ========================================
캐릭터별 장비 보유 현황
======================================== */
let isCharacterEquipmentViewOpen = false;
let selectedCharacterForEquipment = null;
let isStatisticsViewOpen = false;  // 통계 화면 상태 추가

// 캐릭터별 장비 보유 현황 토글
function toggleCharacterEquipmentView() {
    const selectionArea = document.getElementById("character-selection-area");
    const detailArea = document.getElementById("character-equipment-detail");
    const displayArea = document.getElementById("equipment-display-area");

    // 통계 화면 닫기
    isStatisticsViewOpen = false;

    // 토글
    isCharacterEquipmentViewOpen = !isCharacterEquipmentViewOpen;

    if (isCharacterEquipmentViewOpen) {
        // 열기
        displayArea.style.display = "none";
        selectionArea.style.display = "block";
        detailArea.style.display = "none";

        // 캐릭터 버튼 렌더링
        renderCharacterButtons();

        // 모든 장비 관리 버튼 비활성화
        document.querySelectorAll("#section-equipment-view .equipment-button-row .char-btn").forEach(btn => {
            btn.classList.remove('active');
        });
    } else {
        // 닫기
        selectionArea.style.display = "none";
        detailArea.style.display = "none";
        displayArea.style.display = "block";

        // 기본 화면으로 복귀
        renderEquipmentTab('ALL');

        // 첫 번째 버튼(모두) 활성화
        const firstBtn = document.querySelector("#section-equipment-view .equipment-button-row .char-btn");
        if (firstBtn) {
            firstBtn.classList.add('active');
        }
    }
}

// 캐릭터 버튼 렌더링
function renderCharacterButtons() {
    const buttonArea = document.getElementById("character-buttons-area");
    buttonArea.innerHTML = "";

    characters.forEach(char => {
        const btn = document.createElement("button");
        btn.className = "char-btn";
        btn.textContent = `${char.job} (${char.name})`;
        btn.style.minWidth = "150px";

        if (selectedCharacterForEquipment === char.id) {
            btn.classList.add("active");
        }

        btn.onclick = () => {
            selectedCharacterForEquipment = char.id;
            renderCharacterButtons(); // 버튼 활성화 상태 갱신
            renderCharacterEquipmentDetail(char);
        };

        buttonArea.appendChild(btn);
    });
}

// 캐릭터 장비 상세 현황 렌더링
function renderCharacterEquipmentDetail(char) {
    const detailArea = document.getElementById("character-equipment-detail");
    detailArea.style.display = "block";

    let html = `<h2 style="color: #ffd700; margin-bottom: 20px;">${char.job} (${char.name}) - 장비 보유 현황</h2>`;

    const CATEGORIES = [
        {
            title: "방어구",
            sets: ARMOR_SETS,
            prefix: ARMOR_PREFIX,
            exceedOnly: [],
            exceedSlot: "상의"
        },
        {
            title: "악세",
            sets: ACCESSORY_SETS,
            prefix: ACCESSORY_PREFIX,
            exceedOnly: [],
            exceedSlot: "팔찌"
        },
        {
            title: "특장",
            sets: SPECIAL_SETS,
            prefix: SPECIAL_PREFIX,
            exceedOnly: [],
            exceedSlot: "귀걸이"
        }
    ];

    CATEGORIES.forEach(category => {
        // 카테고리별 총 개수 계산
        let categoryTotal = 0;
        Object.keys(category.sets).forEach(baseSetName => {
            const setSlots = category.sets[baseSetName];
            const prefixes = category.prefix[baseSetName] || [];
            const isLegacy = LEGACY_PREFIX_SETS.includes(baseSetName);

            // 일반 장비 개수 (레거시는 없음)
            if (!isLegacy) {
                setSlots.forEach(slot => {
                    const normalKey = `${baseSetName} ${slot}`;
                    categoryTotal += char.armorCounts[normalKey] || 0;
                });
            }

            // 접두어 장비 개수
            prefixes.forEach(pref => {
                const prefKey = makePrefixKey(pref, baseSetName);
                setSlots.forEach(slot => {
                    categoryTotal += char.armorCounts[`${prefKey} ${slot}`] || 0;
                });
            });

            // 익시드 장비 개수
            EXCEED_TAGS.forEach(tag => {
                prefixes.forEach(pref => {
                    const prefKey = makePrefixKey(pref, baseSetName);
                    setSlots.forEach(slot => {
                        const exceedKey = `[${tag}] ${prefKey} ${slot}`;
                        categoryTotal += char.armorCounts[exceedKey] || 0;
                    });
                });
            });
        });

        // 제목에 총 개수 표시
        html += `<h2 style="color: #ffd700; margin-bottom: 15px;">🔹 ${category.title} <span style="color: #ffd700; font-weight: bold;">(${categoryTotal}개)</span></h2>`;

        // 각 세트별 데이터 (세트마다 별도 테이블)
        Object.keys(category.sets).forEach(baseSetName => {
            const setSlots = category.sets[baseSetName];
            const prefixes = category.prefix[baseSetName] || [];
            const exceedSlot = category.exceedSlot;
            const isLegacy = LEGACY_PREFIX_SETS.includes(baseSetName);

            // 세트타입 결정
            const setType = category.title === "방어구" ? "ARMOR"
                : category.title === "악세"   ? "ACCESSORY" : "SPECIAL";

            // 세트별 데이터 수집
            let rows = [];

            prefixes.forEach(pref => {
                EXCEED_TAGS.forEach(tag => {
                    let rowData = {
                        type: 'exceed',
                        exceed: tag,
                        prefix: pref,
                        slots: {}
                    };

                    setSlots.forEach(slot => {
                        const prefKey = makePrefixKey(pref, baseSetName);
                        const key = `[${tag}] ${prefKey} ${slot}`;
                        rowData.slots[slot] = char.armorCounts[key] || 0;
                    });

                    if (Object.values(rowData.slots).some(v => v > 0)) {
                        rows.push(rowData);
                    }
                });
            });

            prefixes.forEach(pref => {
                let rowData = {
                    type: 'prefix',
                    exceed: '',
                    prefix: pref,
                    slots: {}
                };

                setSlots.forEach(slot => {
                    const prefKey = makePrefixKey(pref, baseSetName);
                    const key = `${prefKey} ${slot}`;
                    rowData.slots[slot] = char.armorCounts[key] || 0;
                });

                // 데이터가 있는 경우만 추가
                if (Object.values(rowData.slots).some(v => v > 0)) {
                    rows.push(rowData);
                }
            });

            // 3. 일반 행 (레거시 세트는 없음)
            if (!isLegacy) {
                let normalRowData = {
                    type: 'normal',
                    exceed: '',
                    prefix: '',
                    slots: {}
                };

                setSlots.forEach(slot => {
                    const key = `${baseSetName} ${slot}`;
                    normalRowData.slots[slot] = char.armorCounts[key] || 0;
                });

                if (Object.values(normalRowData.slots).some(v => v > 0)) {
                    rows.push(normalRowData);
                }
            }

            // 행이 하나도 없으면 이 세트는 건너뜀
            if (rows.length === 0) return;

            // 세트별 테이블 시작 + 헤더에 아이템명 표시
            const hasExceedRow = rows.some(r => r.type === 'exceed');
            html += `<table style="width: max-content; border-collapse: collapse; margin-bottom: 20px;">`;
            html += `<thead style="background: #181c33;"><tr>
    <th style="padding: 10px; border: 1px solid #2a3158; white-space: nowrap; text-align: center;">세트</th>
    <th style="padding: 10px; border: 1px solid #2a3158; white-space: nowrap;">익시드</th>
    <th style="padding: 10px; border: 1px solid #2a3158; white-space: nowrap;">접두어</th>`;

            setSlots.forEach(slot => {
                let normalName = slot;
                let exceedName = null;
                if (setType === "ARMOR" && ARMOR_DISPLAY_NAMES[baseSetName] && ARMOR_DISPLAY_NAMES[baseSetName][slot]) {
                    const raw = ARMOR_DISPLAY_NAMES[baseSetName][slot];
                    if (Array.isArray(raw)) { exceedName = raw[0]; normalName = raw[1]; }
                    else normalName = raw;
                } else if (setType === "ACCESSORY" && ACCESSORY_DISPLAY_NAMES[baseSetName] && ACCESSORY_DISPLAY_NAMES[baseSetName][slot]) {
                    const raw = ACCESSORY_DISPLAY_NAMES[baseSetName][slot];
                    if (Array.isArray(raw)) { exceedName = raw[0]; normalName = raw[1]; }
                    else normalName = raw;
                } else if (setType === "SPECIAL" && SPECIAL_DISPLAY_NAMES[baseSetName] && SPECIAL_DISPLAY_NAMES[baseSetName][slot]) {
                    const raw = SPECIAL_DISPLAY_NAMES[baseSetName][slot];
                    if (Array.isArray(raw)) { exceedName = raw[0]; normalName = raw[1]; }
                    else normalName = raw;
                }

                const isExceedSlot = slot === exceedSlot;
                if (isExceedSlot && exceedName && exceedName !== normalName) {
                    html += `<th style="padding: 10px; border: 1px solid #2a3158; white-space: nowrap; font-size: 0.82em; line-height: 1.3; text-align: center;">
        <div style="color:#aad4ff;">${exceedName}</div>
        <div style="color:#fff; font-size:0.9em; margin-top:2px;">${normalName}</div>
    </th>`;
                } else {
                    html += `<th style="padding: 10px; border: 1px solid #2a3158; white-space: nowrap; font-size: 0.82em; line-height: 1.3; text-align: center; color:#fff;">${normalName}</th>`;
                }
            });

            html += `<th style="padding: 10px; border: 1px solid #2a3158; white-space: nowrap;">달성</th>`;
            html += `</tr></thead><tbody>`;
            rows.forEach((row, rowIdx) => {
                html += `<tr style="border-bottom: 1px solid #444;">`;

                // 세트명 (첫 행에만 rowspan으로 표시)
                if (rowIdx === 0) {
                    html += `<td rowspan="${rows.length}" style="padding: 10px; border: 1px solid #2a3158; font-weight: bold; background: #1a1e33; text-align: center; vertical-align: middle; white-space: nowrap;">${baseSetName}</td>`;
                }

                // 익시드 열
                if (row.exceed) {
                    const tagColor = EXCEED_COLOR_MAP[row.exceed] || "#ffd700";
                    html += `<td style="padding: 10px; border: 1px solid #2a3158; text-align: center; white-space: nowrap;">
                        <span style="color: ${tagColor}; font-weight: bold;">[${row.exceed}]</span>
                    </td>`;
                } else {
                    html += `<td style="padding: 10px; border: 1px solid #2a3158; text-align: center;"></td>`;
                }

                // 접두어 열
                if (row.prefix) {
                    html += `<td style="padding: 10px; border: 1px solid #2a3158; text-align: center; white-space: nowrap;">
                        <span style="color: #e6b800; font-weight: bold;">${row.prefix}</span>
                    </td>`;
                } else {
                    html += `<td style="padding: 10px; border: 1px solid #2a3158; text-align: center;"></td>`;
                }

                // 각 슬롯별 개수 (아이템명은 헤더에 표시됨)
                setSlots.forEach(slot => {
                    const count = row.slots[slot] || 0;

                    // 익시드 행인데 익시드 슬롯이 아니면 빈칸
                    if (row.type === 'exceed' && slot !== exceedSlot) {
                        html += `<td style="padding: 10px; border: 1px solid #2a3158; text-align: center; background: #0a0c15;"></td>`;
                    } else {
                        if (count > 0) {
                            html += `<td style="padding: 10px; border: 1px solid #2a3158; text-align: center; color: #fff; font-weight: bold;">${count}</td>`;
                        } else {
                            html += `<td style="padding: 10px; border: 1px solid #2a3158; text-align: center; color: #fff; font-weight: bold;"></td>`;
                        }
                    }
                });

                // 달성 열
                if (row.type === 'exceed') {
                    html += `<td style="padding: 10px; border: 1px solid #2a3158; text-align: center;"></td>`;
                } else {
                    const achieved = setSlots.filter(slot => (row.slots[slot] || 0) > 0).length;
                    const fullSize = setSlots.length;
                    let achieveColor = "#fff";
                    if (fullSize === 5) {
                        if (achieved === 5) achieveColor = "#ffd700";
                        else if (achieved >= 3) achieveColor = "#2ecc71";
                    } else {
                        if (achieved === 3) achieveColor = "#2ecc71";
                    }
                    html += `<td style="padding: 10px; border: 1px solid #2a3158; text-align: center; font-weight: bold; color: ${achieveColor};">${achieved}</td>`;
                }

                html += `</tr>`;
            });

            // 세트별 테이블 닫기
            html += `</tbody></table>`;
        });

        // 카테고리 구분 여백
        html += `<div style="margin-bottom: 10px;"></div>`;
    });

    // 무기 섹션 추가
    if (char.weaponCounts && Object.keys(char.weaponCounts).length > 0) {
        // 무기 총 개수 계산
        let totalWeapons = 0;
        Object.values(char.weaponCounts).forEach(count => {
            totalWeapons += count || 0;
        });

        html += `<h2 style="color: #ffd700; margin-top: 40px; margin-bottom: 15px;">🔹 무기 <span style="color: #ffd700; font-weight: bold;">(${totalWeapons}개)</span></h2>`;

        // 직업별로 무기 분류
        JOB_LIST.forEach(jobName => {
            const jobWeaponData = WEAPON_DATA_MAP[jobName];
            if (!jobWeaponData) return;

            // 해당 직업의 무기를 보유하고 있는지 확인
            let hasWeaponsForJob = false;
            const weaponRows = [];

            Object.entries(jobWeaponData).forEach(([category, weaponList]) => {
                let categoryWeapons = [];

                weaponList.forEach(weaponName => {
                    WEAPON_PREFIXES.forEach(prefix => {
                        const weaponKey = `${prefix.tag} ${weaponName}`;
                        const count = char.weaponCounts[weaponKey] || 0;

                        if (count > 0) {
                            hasWeaponsForJob = true;
                            categoryWeapons.push({name: weaponName, prefix: prefix, count: count});
                        }
                    });
                });

                if (categoryWeapons.length > 0) {
                    weaponRows.push({category: category, weapons: categoryWeapons});
                }
            });

            if (!hasWeaponsForJob) return;

            html += `<h4 style="color: #fff; margin-top: 25px; margin-bottom: 10px;">[${jobName}]</h4>`;

            html += `<table style="width: max-content; border-collapse: collapse; margin-bottom: 20px;">`;
            html += `<thead style="background: #181c33;"><tr>
                <th style="padding: 10px; border: 1px solid #2a3158; white-space: nowrap; text-align: center; width: 100px;">종류</th>
                <th style="padding: 10px; border: 1px solid #2a3158; white-space: nowrap; text-align: left;">무기 이름</th>
                <th style="padding: 10px; border: 1px solid #2a3158; white-space: nowrap; text-align: center; width: 80px;">개수</th>
            </tr></thead><tbody>`;

            weaponRows.forEach(row => {
                row.weapons.forEach((weapon, idx) => {
                    html += `<tr style="border-bottom: 1px solid #444;">`;

                    // 종류 (첫 무기에만 rowspan)
                    if (idx === 0) {
                        html += `<td rowspan="${row.weapons.length}" style="padding: 10px; border: 1px solid #2a3158; font-weight: bold; background: #1a1e33; text-align: center; vertical-align: middle;">${row.category}</td>`;
                    }

                    // 무기 이름 (접두어 색상 적용)
                    html += `<td style="padding: 10px; border: 1px solid #2a3158; text-align: left;">
                        <span style="color: ${weapon.prefix.color}; font-weight: bold;">${weapon.prefix.tag}</span> ${weapon.name}
                    </td>`;

                    // 개수
                    html += `<td style="padding: 10px; border: 1px solid #2a3158; text-align: center; color: #fff; font-weight: bold;">${weapon.count}</td>`;

                    html += `</tr>`;
                });

                // 종류 구분선
                html += `<tr style="height: 3px; background: #2a3158;"><td colspan="3" style="padding: 0; border: none;"></td></tr>`;
            });

            html += `</tbody></table>`;
        });
    }

    detailArea.innerHTML = html;
}