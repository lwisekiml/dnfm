/* ========================================
   eq_craft.js - 제작 시스템
   ※ craftLocked 변수 → eq_data.js 에 선언됨
   ※ saveLocalData()  → eq_core.js 에 선언됨
   ※ characters 배열  → eq_data.js 에 선언됨
======================================== */

/* ========================================
[섹션 12] 제작 시스템
======================================== */
function renderCraftTable() {
    const area = document.getElementById("craft-table-area");

    // 현재 포커스된 input의 위치 저장
    const focusedElement = document.activeElement;
    let focusedCharIndex = -1;
    let focusedMatIndex = -1;

    if (focusedElement && focusedElement.className === "craft-input") {
        // 어느 캐릭터, 어느 재료인지 찾기
        const allInputs = Array.from(document.querySelectorAll(".craft-input:not(.craft-special)"));
        const focusedIndex = allInputs.indexOf(focusedElement);

        if (focusedIndex !== -1) {
            const materialsCount = 8; // 재료 개수
            focusedCharIndex = Math.floor(focusedIndex / materialsCount);
            focusedMatIndex = focusedIndex % materialsCount;
        }
    }

    area.innerHTML = "";

    const materials = [
        {name: "망가진 기계 캡슐", img: "images/craftMaterials/망가진기계캡슐.png"},
        {name: "스펙쿨룸 파편", img: "images/craftMaterials/스펙쿨룸파편.png"},
        {name: "망가진 강철 톱니바퀴", img: "images/craftMaterials/망가진강철톱니바퀴.png"},
        {name: "강철 화로의 파편", img: "images/craftMaterials/강철화로의파편.png"},
        {name: "빛의 저장소", img: "images/craftMaterials/빛의저장소.png"},
        {name: "마누스 메모리얼", img: "images/craftMaterials/마누스메모리얼.png"},
        {name: "데이터 칩 상자", img: "images/craftMaterials/데이터칩.png"},
        {name: "강화된 데이터 칩 상자", img: "images/craftMaterials/강화된데이터칩.png"}
    ];

    const table = document.createElement("table");

    // 헤더 1행: 이미지 + 재료명 합계
    const headerRow1 = document.createElement("tr");
    const emptyTh = document.createElement("th");
    emptyTh.textContent = "캐릭터";
    headerRow1.appendChild(emptyTh);

    materials.forEach(mat => {
        const th = document.createElement("th");
        th.innerHTML = `<img src="${mat.img}" style="width:32px; display:block; margin:0 auto 4px;"><span>${mat.name}</span>`;
        headerRow1.appendChild(th);
    });

    // 합계 열 헤더
    const totalTh = document.createElement("th");
    totalTh.textContent = "합계";
    totalTh.style.background = "#ffd700";
    totalTh.style.color = "#000";
    headerRow1.appendChild(totalTh);

    table.appendChild(headerRow1);

    // 재료별 합계를 저장할 배열
    const materialTotals = materials.map(() => 0);

    // 데이터 행: 각 캐릭터
    characters.forEach((char, charIdx) => {
        if (!char.craftMaterials) {
            char.craftMaterials = {};
        }

        const tr = document.createElement("tr");

        // 캐릭터 이름
        const nameTd = document.createElement("td");
        nameTd.innerHTML = `${char.job}<br>(${char.name})`;
        nameTd.style.fontWeight = "bold";
        nameTd.style.cursor = "pointer";
        nameTd.style.userSelect = "none";
        // 잠금 상태에서 클릭 시 해당 행 전체 선택 토글
        nameTd.addEventListener('click', function () {
            if (!craftLocked) return;
            const rowInputs = tr.querySelectorAll("input.craft-input");
            // 행 내 모든 input이 선택된 상태면 전체 해제, 아니면 전체 선택
            const allSelected = Array.from(rowInputs).every(inp => inp.classList.contains("craft-selected"));
            rowInputs.forEach(inp => {
                const inpTd = inp.parentElement;
                if (allSelected) {
                    inp.classList.remove("craft-selected");
                    if (inpTd) { inpTd.style.background = ""; inpTd.style.outline = ""; }
                } else {
                    inp.classList.add("craft-selected");
                    if (inpTd) { inpTd.style.background = "#0e2e2a"; inpTd.style.outline = "2px solid #25c2a0"; }
                }
            });
        });
        tr.appendChild(nameTd);

        let charTotal = 0; // 캐릭터별 합계

        // 각 재료의 입력 필드
        materials.forEach((mat, matIdx) => {
            const td = document.createElement("td");
            const input = document.createElement("input");
            input.type = "number";
            input.className = "craft-input";
            input.style.width = "60px";
            input.min = "0";
            input.placeholder = "0";

            const savedValue = char.craftMaterials[mat.name];
            if (savedValue && savedValue > 0) {
                input.value = savedValue;
                charTotal += savedValue;
                materialTotals[matIdx] += savedValue;
            }

            input.addEventListener('input', function () {
                const value = parseInt(this.value);

                if (isNaN(value) || value <= 0) {
                    delete char.craftMaterials[mat.name];
                } else {
                    char.craftMaterials[mat.name] = value;
                }

                saveLocalData();
                updateCraftTotals(); // 전체 재렌더링 없이 합계만 갱신
            });

            // 잠금 상태에서 td 클릭 → 선택 토글
            td.addEventListener('click', function () {
                if (!craftLocked) return;
                const isSelected = input.classList.toggle("craft-selected");
                td.style.background = isSelected ? "#0e2e2a" : "";
                td.style.outline = isSelected ? "2px solid #25c2a0" : "";
            });

            // 포커스 복원
            if (charIdx === focusedCharIndex && matIdx === focusedMatIndex) {
                setTimeout(() => {
                    input.focus();
                    // 커서를 끝으로 이동
                    const len = input.value.length;
                    input.setSelectionRange(len, len);
                }, 0);
            }

            td.appendChild(input);
            tr.appendChild(td);
        });

        // 캐릭터별 합계 표시
        const totalTd = document.createElement("td");
        totalTd.textContent = charTotal > 0 ? charTotal : "";
        totalTd.style.textAlign = "center";
        totalTd.style.fontWeight = "bold";
        totalTd.style.background = "#ffd700";
        totalTd.style.color = "#000";
        tr.appendChild(totalTd);

        table.appendChild(tr);
    });

    // 합계 행 추가
    const totalRow = document.createElement("tr");
    totalRow.style.background = "#ffd700";

    const totalLabelTd = document.createElement("td");
    totalLabelTd.textContent = "합계";
    totalLabelTd.style.fontWeight = "bold";
    totalLabelTd.style.color = "#000";
    totalLabelTd.style.textAlign = "center";
    totalRow.appendChild(totalLabelTd);

    let grandTotal = 0;

    materialTotals.forEach(total => {
        const td = document.createElement("td");
        td.textContent = total > 0 ? total : "";
        td.style.textAlign = "center";
        td.style.fontWeight = "bold";
        td.style.color = "#000";
        grandTotal += total;
        totalRow.appendChild(td);
    });

    // 전체 합계 (오른쪽 아래)
    const grandTotalTd = document.createElement("td");
    grandTotalTd.textContent = grandTotal > 0 ? grandTotal : "";
    grandTotalTd.style.textAlign = "center";
    grandTotalTd.style.fontWeight = "bold";
    grandTotalTd.style.color = "#000";
    grandTotalTd.style.fontSize = "1.1em";
    totalRow.appendChild(grandTotalTd);

    table.appendChild(totalRow);

    // 특산물 표 (메인 표 위에 추가)
    const specialItems = [
        { key: "죽은 자의 성 던전 특산물 선택 상자", img: "images/craftMaterials/죽은자의성던전특산물선택상자.png" },
        { key: "데이터 칩 상자 (특산물)", img: "images/craftMaterials/데이터칩.png" },
        { key: "강화된 데이터 칩 상자 (특산물)", img: "images/craftMaterials/강화된데이터칩.png" }
    ];
    const specialDisplayNames = [
        "죽은 자의 성 던전 특산물 선택 상자",
        "데이터 칩 상자",
        "강화된 데이터 칩 상자"
    ];

    const specialTable = document.createElement("table");
    specialTable.style.marginBottom = "16px";

    // 헤더행
    const specialHeader = document.createElement("tr");
    const specialHeaderNameTh = document.createElement("th");
    specialHeaderNameTh.textContent = "이름";
    specialHeader.appendChild(specialHeaderNameTh);
    const specialHeaderCountTh = document.createElement("th");
    specialHeaderCountTh.textContent = "개수";
    specialHeader.appendChild(specialHeaderCountTh);
    specialTable.appendChild(specialHeader);

    specialItems.forEach((item, i) => {
        const row = document.createElement("tr");

        // 이미지 + 이름 합친 칸
        const nameTd = document.createElement("td");
        nameTd.innerHTML = `<img src="${item.img}" style="width:28px;vertical-align:middle;margin-right:6px;">${specialDisplayNames[i]}`;
        row.appendChild(nameTd);

        // 개수 입력 칸
        const inputTd = document.createElement("td");
        const input = document.createElement("input");
        input.type = "number";
        input.className = "craft-input craft-special";
        input.style.width = "60px";
        input.min = "0";
        input.placeholder = "0";

        if (characters[0]) {
            if (!characters[0].craftMaterials) characters[0].craftMaterials = {};
            const savedVal = characters[0].craftMaterials[item.key];
            if (savedVal && savedVal > 0) input.value = savedVal;
        }

        input.addEventListener('input', function () {
            const value = parseInt(this.value);
            if (characters[0]) {
                if (isNaN(value) || value <= 0) {
                    delete characters[0].craftMaterials[item.key];
                } else {
                    characters[0].craftMaterials[item.key] = value;
                }
                saveLocalData();
            }
        });

        inputTd.appendChild(input);
        row.appendChild(inputTd);
        specialTable.appendChild(row);
    });

    area.appendChild(specialTable);
    area.appendChild(table);
    setCraftLock(craftLocked);
}

// 재렌더링 없이 합계만 갱신 (깜박임/스크롤 이동 방지)
function updateCraftTotals() {
    const table = document.querySelector("#craft-table-area table:last-child");
    if (!table) return;

    const materials = [
        "망가진 기계 캡슐", "스펙쿨룸 파편", "망가진 강철 톱니바퀴", "강철 화로의 파편",
        "빛의 저장소", "마누스 메모리얼", "데이터 칩 상자", "강화된 데이터 칩 상자"
    ];

    const rows = table.querySelectorAll("tr");
    // 첫 행은 헤더, 마지막 행은 합계 행
    const dataRows = Array.from(rows).slice(1, rows.length - 1);
    const totalRow = rows[rows.length - 1];
    const materialTotals = new Array(materials.length).fill(0);
    let grandTotal = 0;

    // 각 캐릭터 행의 합계 셀 갱신
    dataRows.forEach((tr, charIdx) => {
        const char = characters[charIdx];
        if (!char) return;
        let charTotal = 0;
        const inputs = tr.querySelectorAll("input.craft-input");
        inputs.forEach((input, matIdx) => {
            const val = parseInt(input.value) || 0;
            materialTotals[matIdx] += val;
            charTotal += val;
        });
        // 마지막 td가 캐릭터 합계 셀
        const charTotalTd = tr.querySelector("td:last-child");
        if (charTotalTd) charTotalTd.textContent = charTotal > 0 ? charTotal : "";
        grandTotal += charTotal;
    });

    // 합계 행 갱신 (첫 td는 "합계" 라벨, 마지막 td는 전체 합계)
    const totalCells = totalRow.querySelectorAll("td");
    materialTotals.forEach((total, i) => {
        if (totalCells[i + 1]) totalCells[i + 1].textContent = total > 0 ? total : "";
    });
    const grandTotalTd = totalCells[totalCells.length - 1];
    if (grandTotalTd) grandTotalTd.textContent = grandTotal > 0 ? grandTotal : "";
}

function setCraftLock(lock) {
    craftLocked = lock;

    document.getElementById("craft-lock-btn")
        .classList.toggle("active", lock);
    document.getElementById("craft-unlock-btn")
        .classList.toggle("active", !lock);

    // 계산 버튼: 잠금 상태에서만 활성
    const calcBtn = document.getElementById("craft-calc-btn");
    if (calcBtn) {
        calcBtn.disabled = !lock;
        calcBtn.style.opacity = lock ? "1" : "0.4";
        calcBtn.style.cursor = lock ? "pointer" : "not-allowed";
    }

    document.querySelectorAll("#section-craft-view input.craft-input")
        .forEach(input => {
            input.readOnly = lock;
            input.style.pointerEvents = lock ? "none" : "";
            const td = input.parentElement;
            if (td) td.style.cursor = lock ? "pointer" : "";

            if (!lock) {
                // 해제 시 선택 초기화
                input.classList.remove("craft-selected");
                const td = input.parentElement;
                if (td) {
                    td.style.background = "";
                    td.style.outline = "";
                }
            }
        });
}

// 실행 취소용 스냅샷
let craftUndoSnapshot = null;

// 선택된 칸들에 % 100 적용
function applyCraftModulo() {
    if (!craftLocked) return;

    const selected = document.querySelectorAll("#section-craft-view input.craft-selected");
    if (selected.length === 0) {
        alert("계산할 칸을 선택해주세요.");
        return;
    }

    // 실행 취소용 스냅샷 저장 (깊은 복사)
    craftUndoSnapshot = characters.map(char => ({
        id: char.id,
        craftMaterials: Object.assign({}, char.craftMaterials)
    }));

    // 실행 취소 버튼 활성화
    const undoBtn = document.getElementById("craft-undo-btn");
    if (undoBtn) {
        undoBtn.disabled = false;
        undoBtn.style.opacity = "1";
        undoBtn.style.cursor = "pointer";
    }

    const allInputs = Array.from(document.querySelectorAll("#section-craft-view input.craft-input:not(.craft-special)"));
    const materialsCount = 8;

    const materials = [
        "망가진 기계 캡슐", "스펙쿨룸 파편", "망가진 강철 톱니바퀴", "강철 화로의 파편",
        "빛의 저장소", "마누스 메모리얼", "데이터 칩 상자", "강화된 데이터 칩 상자"
    ];

    // 특산물 상자에 합산할 값 계산
    let specialBoxAdd = 0;       // matIdx 0~5: 100으로 나눈 몫 * 10 → 죽은자의성 특산물
    let dataChipAdd = 0;         // matIdx 6: 10으로 나눈 몫 → 데이터 칩 상자 (특산물)
    let enhDataChipAdd = 0;      // matIdx 7: 10으로 나눈 몫 → 강화된 데이터 칩 상자 (특산물)

    selected.forEach(input => {
        const idx = allInputs.indexOf(input);
        if (idx === -1) return;
        const charIdx = Math.floor(idx / materialsCount);
        const matIdx = idx % materialsCount;
        const char = characters[charIdx];
        if (!char) return;

        const original = parseInt(input.value) || 0;
        const result = (matIdx === 6 || matIdx === 7) ? original % 10 : original % 100;

        if (matIdx <= 5) {
            specialBoxAdd += Math.floor(original / 100) * 10;
        } else if (matIdx === 6) {
            dataChipAdd += Math.floor(original / 10);
        } else if (matIdx === 7) {
            enhDataChipAdd += Math.floor(original / 10);
        }

        if (result <= 0) {
            delete char.craftMaterials[materials[matIdx]];
        } else {
            char.craftMaterials[materials[matIdx]] = result;
        }
    });

    // 특산물 칸에 합산 (characters[0] 기준)
    if (characters[0]) {
        if (!characters[0].craftMaterials) characters[0].craftMaterials = {};
        if (specialBoxAdd > 0) {
            const cur = characters[0].craftMaterials["죽은 자의 성 던전 특산물 선택 상자"] || 0;
            characters[0].craftMaterials["죽은 자의 성 던전 특산물 선택 상자"] = cur + specialBoxAdd;
        }
        if (dataChipAdd > 0) {
            const cur = characters[0].craftMaterials["데이터 칩 상자 (특산물)"] || 0;
            characters[0].craftMaterials["데이터 칩 상자 (특산물)"] = cur + dataChipAdd;
        }
        if (enhDataChipAdd > 0) {
            const cur = characters[0].craftMaterials["강화된 데이터 칩 상자 (특산물)"] || 0;
            characters[0].craftMaterials["강화된 데이터 칩 상자 (특산물)"] = cur + enhDataChipAdd;
        }
    }

    saveLocalData();
    renderCraftTable();
}

// 실행 취소
function undoCraftModulo() {
    if (!craftUndoSnapshot) return;

    craftUndoSnapshot.forEach(snap => {
        const char = characters.find(c => c.id === snap.id);
        if (char) char.craftMaterials = Object.assign({}, snap.craftMaterials);
    });
    craftUndoSnapshot = null;

    // 실행 취소 버튼 비활성화
    const undoBtn = document.getElementById("craft-undo-btn");
    if (undoBtn) {
        undoBtn.disabled = true;
        undoBtn.style.opacity = "0.4";
        undoBtn.style.cursor = "not-allowed";
    }

    saveLocalData();
    renderCraftTable();
}

console.log("✅ eq_craft.js 로드 완료");
