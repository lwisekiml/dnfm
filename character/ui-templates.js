/**
 * HTML 템플릿 헬퍼 함수
 * templates.html의 <template> 태그를 복제하고 데이터를 주입하는 유틸리티
 */

window.TemplateHelper = {
    /**
     * 템플릿 복제 및 플레이스홀더 치환
     * @param {string} templateId - 템플릿 ID
     * @param {Object} replacements - 치환할 키-값 쌍
     * @returns {DocumentFragment}
     */
    clone(templateId, replacements = {}) {
        const template = document.getElementById(templateId);
        if (!template) {
            console.error(`템플릿을 찾을 수 없습니다: ${templateId}`);
            return document.createDocumentFragment();
        }

        const clone = template.content.cloneNode(true);

        // 플레이스홀더 치환
        this._replaceInFragment(clone, replacements);

        return clone;
    },

    /**
     * DocumentFragment 내의 모든 텍스트와 속성값 치환
     * @private
     */
    _replaceInFragment(fragment, replacements) {
        const walker = document.createTreeWalker(
            fragment,
            NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
            null,
            false
        );

        const nodes = [];
        let node;
        while (node = walker.nextNode()) {
            nodes.push(node);
        }

        nodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                node.textContent = this._replace(node.textContent, replacements);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                // 속성 치환
                Array.from(node.attributes).forEach(attr => {
                    attr.value = this._replace(attr.value, replacements);
                });
            }
        });
    },

    /**
     * 문자열 내 플레이스홀더 치환
     * @private
     */
    _replace(str, replacements) {
        let result = str;
        for (const [key, value] of Object.entries(replacements)) {
            result = result.replaceAll(`{${key}}`, value);
        }
        return result;
    },

    /**
     * 캐릭터 정보 칸 생성
     */
    createCharacterInfo(charId) {
        return this.clone('character-info-template', {
            CHAR_ID: charId
        });
    },

    /**
     * 일반 장비 행 생성
     */
    createEquipmentRow(slot, charId, options = {}) {
        const {
            emblemClass = 'emb-bg-gray',
            defaultEnchant = '',
            defaultEnchantVal = ''
        } = options;

        const fragment = this.clone('equipment-row-template', {
            SLOT: slot,
            SLOT_NAME: slot,
            CHAR_ID: charId,
            EMB_CLASS: emblemClass,
            DEFAULT_ENCHANT: defaultEnchant,
            DEFAULT_ENCHANT_VAL: defaultEnchantVal
        });

        // 익시드는 무기, 상의, 팔찌, 귀걸이만 가능
        const exceedSlots = ['상의', '팔찌', '귀걸이'];
        if (!exceedSlots.includes(slot)) {
            // 익시드가 없는 슬롯은 select를 "-"로 교체
            const exceedSelect = fragment.querySelector(`[data-key="${slot}_exceed"]`);
            if (exceedSelect) {
                const td = exceedSelect.parentElement;
                td.innerHTML = '<span style="color: #666;">-</span>';
            }
        }

        // 보조장비, 귀걸이, 마법석은 첫 번째 엠블렘을 select로 변경
        const elementSlots = ['보조장비', '귀걸이', '마법석'];
        if (elementSlots.includes(slot)) {
            const emb1Input = fragment.querySelector(`[data-key="${slot}_emb1"]`);
            if (emb1Input && emb1Input.tagName === 'INPUT') {
                const td = emb1Input.parentElement;
                const tdClass = td.className;

                // select 엘리먼트로 교체
                td.innerHTML = `
                    <select data-key="${slot}_emb1" class="${tdClass}" onchange="autoSave()">
                        <option></option>
                        <option>모속강</option>
                        <option>화속강</option>
                        <option>수속강</option>
                        <option>명속강</option>
                        <option>암속강</option>
                        <option>힘</option>
                        <option>지능</option>
                    </select>
                `;
            }
        }

        return fragment;
    },

    /**
     * 스킬룬 행 생성
     */
    createSkillRuneRow(charId) {
        return this.clone('skillrune-row-template', {
            CHAR_ID: charId
        });
    },

    /**
     * 크리쳐 행 생성
     */
    createCreatureRow() {
        return this.clone('creature-row-template', {});
    },

    /**
     * 칭호 행 생성
     */
    createTitleRow() {
        return this.clone('title-row-template', {});
    },

    /**
     * 간단한 행 생성 (외형칭호/오라/아바타)
     */
    createSimpleRow(slotName) {
        return this.clone('simple-row-template', {
            SLOT: slotName,
            SLOT_NAME: slotName
        });
    },

    /**
     * 엠블렘 클래스 결정
     */
    getEmblemClass(slot) {
        const emblemMap = {
            '상의': 'emb-bg-red',
            '하의': 'emb-bg-red',
            '어깨': 'emb-bg-yellow',
            '벨트': 'emb-bg-yellow',
            '신발': 'emb-bg-blue',
            '팔찌': 'emb-bg-blue',
            '목걸이': 'emb-bg-green',
            '반지': 'emb-bg-green'
        };
        return emblemMap[slot] || 'emb-bg-gray';
    },

    /**
     * 기본 마법부여 값 결정
     */
    getDefaultEnchant(slot) {
        const enchantMap = {
            '무기': { enchant: '물마공', val: '30' },
            '상의': { enchant: '힘지능', val: '68' },
            '하의': { enchant: '힘지능', val: '68' },
            '어깨': { enchant: '물마크', val: '50' },
            '신발': { enchant: '물마크', val: '50' },
            '벨트': { enchant: '물마크', val: '50' },
            '목걸이': { enchant: '모속강', val: '13' },
            '팔찌': { enchant: '모속강', val: '13' },
            '반지': { enchant: '모속강', val: '13' },
            '보조장비': { enchant: '물마공/크', val: '30/19' }
        };
        return enchantMap[slot] || { enchant: '', val: '' };
    }
};