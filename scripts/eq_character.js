/* ========================================
[섹션 7] 캐릭터 관리
======================================== */

// ─────────────────────────────────────────
// 7.1 캐릭터 CRUD
// ─────────────────────────────────────────
// Create
function addCharacter() {
    const newChar = {
        id: "char_" + Date.now() + Math.random().toString(16).slice(2),
        job: "",
        name: "",
        armorCounts: {},
        updateTimes: {},
        craftMaterials: {},
        locked: false,
        inputs: {
            'info_job': { val: '', cls: '' },
            'info_name': { val: '', cls: '' }
        },
        runeData: {
            runes: Array(20).fill(null).map(() => ({ name: '', lv: '', skillLv: '' })),
            gakin: ['', '']
        },
        tags: []
    };

    characters.push(newChar);
    saveLocalData();
    renderCharacterList();

    // project1 상세입력(캐릭터 관리) 탭 DOM에도 동기화
    if (!_syncInProgress && typeof createCharacterTable === 'function') {
        _syncInProgress = true;
        createCharacterTable(newChar);
        _syncInProgress = false;
    }

    alert("캐릭터가 추가되었습니다!");
}

// Read
function renderCharacterList() {
    const listEl = document.getElementById("characterList");
    if (!listEl) return;

    listEl.innerHTML = "";

    characters.forEach((c, index) => {
        const wrapper = document.createElement("div");
        wrapper.className = "character-wrapper";
        wrapper.style.display = "inline-flex";
        wrapper.style.alignItems = "center";
        wrapper.style.marginRight = "10px";
        wrapper.style.marginBottom = "10px";

        // 캐릭터 버튼
        const btn = document.createElement("button");
        btn.className = "char-btn" + (c.id === activeCharacterId ? " active" : "");
        btn.textContent = `${c.job} (${c.name})`;
        btn.onclick = () => {
            if (typeof showSetButtons === "function") showSetButtons(c);
        };

        // ⚙️ 설정 버튼
        const settingsBtn = document.createElement("button");
        settingsBtn.textContent = "⚙️";
        settingsBtn.className = "settings-btn";
        settingsBtn.onclick = (e) => {
            e.stopPropagation();
            openActionModal(c.id, c.name, c.job);
        };

        wrapper.appendChild(btn);
        wrapper.appendChild(settingsBtn);

        // // 편집 모드일 때만 ⬆️⬇️ 버튼 표시
        // if (isEditingCharacterOrder) {
        //     // ⬆️ 위로 버튼
        //     const upBtn = document.createElement("button");
        //     upBtn.textContent = "⬆️";
        //     upBtn.className = "settings-btn";
        //     upBtn.title = "위로 이동";
        //     upBtn.onclick = (e) => {
        //         e.stopPropagation();
        //         moveCharacterUp(index);
        //     };
        //     if (index === 0) {
        //         upBtn.disabled = true;
        //         upBtn.style.opacity = "0.3";
        //         upBtn.style.cursor = "not-allowed";
        //     }
        //
        //     // ⬇️ 아래로 버튼
        //     const downBtn = document.createElement("button");
        //     downBtn.textContent = "⬇️";
        //     downBtn.className = "settings-btn";
        //     downBtn.title = "아래로 이동";
        //     downBtn.onclick = (e) => {
        //         e.stopPropagation();
        //         moveCharacterDown(index);
        //     };
        //     if (index === characters.length - 1) {
        //         downBtn.disabled = true;
        //         downBtn.style.opacity = "0.3";
        //         downBtn.style.cursor = "not-allowed";
        //     }
        //
        //     wrapper.appendChild(upBtn);
        //     wrapper.appendChild(downBtn);
        // }

        // 편집 모드일 때만 ⬅️➡️ 버튼 표시
        if (isEditingCharacterOrder) {
            // ⬅️ 왼쪽(위로) 버튼
            const leftBtn = document.createElement("button");
            leftBtn.textContent = "⬅️";
            leftBtn.className = "settings-btn";
            leftBtn.title = "왼쪽으로 이동";
            leftBtn.onclick = (e) => {
                e.stopPropagation();
                moveCharacterUp(index);
            };
            if (index === 0) {
                leftBtn.disabled = true;
                leftBtn.style.opacity = "0.3";
                leftBtn.style.cursor = "not-allowed";
            }

            // ➡️ 오른쪽(아래로) 버튼
            const rightBtn = document.createElement("button");
            rightBtn.textContent = "➡️";
            rightBtn.className = "settings-btn";
            rightBtn.title = "오른쪽으로 이동";
            rightBtn.onclick = (e) => {
                e.stopPropagation();
                moveCharacterDown(index);
            };
            if (index === characters.length - 1) {
                rightBtn.disabled = true;
                rightBtn.style.opacity = "0.3";
                rightBtn.style.cursor = "not-allowed";
            }

            wrapper.appendChild(leftBtn);
            wrapper.appendChild(rightBtn);
        }

        listEl.appendChild(wrapper);
    });
}

// Update
function updateCharacterInfo(charId) {
    const nameInput = document.getElementById("edit-charName");
    const jobInput = document.getElementById("edit-charJob");

    if (!nameInput || !jobInput) {
        alert("수정 입력창을 찾을 수 없습니다.");
        return;
    }

    const newName = nameInput.value.trim();
    const newJob = jobInput.value.trim();

    if (!newName || !newJob) {
        alert("이름과 직업을 모두 입력해 주세요.");
        return;
    }

    const char = characters.find(c => c.id === charId);
    if (char) {
        char.name = newName;
        char.job = newJob;

        // 통합 구조: inputs 필드도 동기화
        if (!char.inputs) char.inputs = {};
        char.inputs['info_job'] = { val: newJob, cls: '' };
        char.inputs['info_name'] = { val: newName, cls: '' };

        // project1 DOM 동기화
        const section = document.getElementById(charId);
        if (section) {
            const jobEl = section.querySelector('[data-key="info_job"]');
            const nameEl = section.querySelector('[data-key="info_name"]');
            if (jobEl) jobEl.value = newJob;
            if (nameEl) nameEl.value = newName;
        }

        saveLocalData();
        renderCharacterList();
        closeActionModal();
        alert("정보가 수정되었습니다.");
    }
}

// Delete
function deleteCharacterConfirmed() {
    openConfirmModal(
        "캐릭터 삭제",
        "정말로 이 캐릭터를 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.",
        function () {
            // 1. 전역 배열에서 해당 캐릭터 제외
            characters = characters.filter(c => String(c.id) !== String(currentActionCharId));

            // 2. 저장
            saveLocalData();

            // 3. project1 DOM에서도 해당 캐릭터 섹션 제거
            const p1Section = document.getElementById(currentActionCharId);
            if (p1Section) {
                p1Section.remove();
                if (typeof AppState !== 'undefined') {
                    delete AppState.charRuneData[currentActionCharId];
                    delete AppState.charTags?.[currentActionCharId];
                }
            }

            // 4. 화면 UI 갱신
            renderCharacterList();

            if (activeCharacterId === currentActionCharId) {
                const setListEl = document.getElementById("setList");
                const panelEl = document.getElementById("panel");
                if (setListEl) setListEl.innerHTML = "";
                if (panelEl) panelEl.innerHTML = "";
                activeCharacterId = null;
            }

            closeActionModal();
            alert("삭제되었습니다.");
        }
    );
}

function resetCharacterStatsConfirmed() {
    const targetId = currentActionCharId;

    if (!targetId) {
        alert("대상 캐릭터를 선택할 수 없습니다.");
        return;
    }

    openConfirmModal(
        "수치 초기화",
        "이 캐릭터의 모든 장비 보유 현황 및 업데이트 기록을 초기화하시겠습니까?",
        function () {
            const char = characters.find(c => String(c.id) === String(targetId));

            if (char) {
                // 2. 핵심: 사용자님의 데이터 필드명(armorCounts, updateTimes)을 초기화합니다.
                char.armorCounts = {};
                char.updateTimes = {};

                // 무기 정보가 있다면 함께 초기화
                if (char.weaponCounts) char.weaponCounts = {};

                saveLocalData();

                // 4. 화면 UI 갱신
                if (typeof renderCharacterList === "function") renderCharacterList();

                // 5. 상세 보기 영역 비우기 (초기화되었으므로 이전 정보를 지웁니다)
                const setListEl = document.getElementById("setList");
                const panelEl = document.getElementById("panel");
                if (setListEl) setListEl.innerHTML = "";
                if (panelEl) panelEl.innerHTML = "";

                activeCharacterId = null; // 선택 상태 해제

                alert("모든 수치가 초기화되었습니다.");
                closeActionModal(); // 설정 창 닫기
            } else {
                alert("캐릭터 데이터를 찾을 수 없습니다.");
            }
        }
    );
}

// ─────────────────────────────────────────
// 7.3 순서 관리
// ─────────────────────────────────────────
// 5-4. 캐릭터 순서 변경 (↑↓ 버튼)
function moveCharacterUp(index) {
    if (index === 0) return; // 첫 번째는 위로 갈 수 없음

    // 배열에서 위치 교환
    [characters[index], characters[index - 1]] = [characters[index - 1], characters[index]];

    saveLocalData();
    renderCharacterList();

    // 현재 선택된 캐릭터 유지
    if (activeCharacterId) {
        const activeChar = characters.find(c => c.id === activeCharacterId);
        if (activeChar) showSetButtons(activeChar, true);
    }
}

function moveCharacterDown(index) {
    if (index === characters.length - 1) return; // 마지막은 아래로 갈 수 없음

    // 배열에서 위치 교환
    [characters[index], characters[index + 1]] = [characters[index + 1], characters[index]];

    saveLocalData();
    renderCharacterList();

    // 현재 선택된 캐릭터 유지
    if (activeCharacterId) {
        const activeChar = characters.find(c => c.id === activeCharacterId);
        if (activeChar) showSetButtons(activeChar, true);
    }
}

// 5-5. 편집 모드 토글
function toggleEditMode() {
    const editBtn = document.getElementById("edit-order-btn");

    isEditingCharacterOrder = !isEditingCharacterOrder;

    if (isEditingCharacterOrder) {
        // 편집 모드 활성화
        editBtn.textContent = "변경완료";
        editBtn.style.background = "linear-gradient(135deg, #25c2a0, #1a8c7d)";
    } else {
        // 편집 모드 비활성화
        editBtn.textContent = "✏️ 편집";
        editBtn.style.background = "linear-gradient(135deg, #3399cc, #2a6f9e)";

        // 데이터 저장
        saveLocalData();
        alert("순서 변경이 완료되었습니다!");
    }

    // 캐릭터 리스트 다시 렌더링
    renderCharacterList();
}