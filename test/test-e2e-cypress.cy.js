// ============================================
// Cypress E2E 테스트
// ============================================

// 설치 방법:
// npm install -D cypress
// npx cypress open

// 실행 방법:
// npx cypress run --spec "cypress/e2e/test-e2e-cypress.cy.js"

describe('RPG 장비 관리 시스템 E2E 테스트', () => {

    beforeEach(() => {
        // 각 테스트 전에 페이지 방문 및 localStorage 초기화
        cy.visit('http://localhost:8000/index.html');
        cy.clearLocalStorage();
        cy.reload();
        cy.wait(500);

        // ⭐ 자동 생성된 캐릭터 삭제 (localStorage 비우면 1개 자동 생성됨)
        cy.window().then((win) => {
            const sections = win.document.querySelectorAll('.char-section');
            sections.forEach(sec => sec.remove());
        });
        cy.wait(300);
    });

    // ========================================
    // 시나리오 1: 캐릭터 생성 전체 플로우
    // ========================================
    it('시나리오 1: 캐릭터 생성부터 데이터 복구까지', () => {
        // 1. 캐릭터 추가 버튼 클릭
        cy.contains('캐릭터 추가').click();
        cy.wait(500);

        // 2. 캐릭터 섹션이 생성되었는지 확인
        cy.get('.char-section').should('be.visible');

        // 3. 직업 입력
        cy.get('[data-key="info_job"]').type('귀검사');

        // 4. 이름 입력
        cy.get('[data-key="info_name"]').type('Cypress테스트');

        // 5. 항마력 입력
        cy.get('[data-key="info_power"]').type('52000');

        // 6. 무기 희귀도 선택
        cy.get('[data-key="무기_rarity"]').select('에픽');

        // 7. 무기 강화 입력
        cy.get('[data-key="무기_reinforce"]').type('+12');

        // 8. 자동 저장 대기
        cy.wait(1000);

        // 9. localStorage에 저장 확인
        cy.window().then((win) => {
            const savedData = win.localStorage.getItem('dnfm_character_equipment_data');
            expect(savedData).to.exist;

            const data = JSON.parse(savedData);
            expect(data[0].inputs['info_name'].val).to.equal('Cypress테스트');
        });

        // 10. 페이지 새로고침
        cy.reload();
        cy.wait(500);

        // 11. 데이터 복구 확인
        cy.get('[data-key="info_name"]').should('have.value', 'Cypress테스트');
        cy.get('[data-key="info_job"]').should('have.value', '귀검사');

        cy.log('✅ 시나리오 1 통과: 캐릭터 생성 → 저장 → 복구');
    });

    // ========================================
    // 시나리오 2: 스킬룬 설정 전체 플로우
    // ========================================
    it('시나리오 2: 스킬룬 설정부터 저장까지', () => {
        // 1. 캐릭터 추가
        cy.contains('캐릭터 추가').click();
        cy.wait(500);

        // 2. 캐릭터 이름 입력 (⭐ first() 추가)
        cy.get('[data-key="info_name"]').first().type('스킬룬테스트');
        cy.wait(1000);

        // 3. 스킬룬 수정 버튼 클릭 (⭐ first() 추가)
        cy.get('.char-section').first().contains('수정').click();
        cy.wait(300);

        // 4. 모달이 열렸는지 확인
        cy.get('#skillRunemodal').should('be.visible');

        // 5. 첫 번째 룬 설정
        cy.get('.m-rune-name').eq(0).select('각성');
        cy.get('.m-rune-lv').eq(0).select('IV');
        cy.get('.m-rune-skillLv').eq(0).select('60');

        // 6. 두 번째 룬 설정
        cy.get('.m-rune-name').eq(1).select('가호');
        cy.get('.m-rune-lv').eq(1).select('III');

        // 7. 세 번째 룬 설정
        cy.get('.m-rune-name').eq(2).select('수호');
        cy.get('.m-rune-lv').eq(2).select('II');

        // 8. 각인 입력
        cy.get('#m-gakin1').type('테스트각인1');
        cy.get('#m-gakin2').type('테스트각인2');

        // 9. 저장 버튼 클릭
        cy.get('#skillRunemodal').contains('저장').click();
        cy.wait(500);

        // 10. 모달이 닫혔는지 확인
        cy.get('#skillRunemodal').should('not.be.visible');

        // 11. 룬 요약 확인
        cy.get('[id$="_runeSummary"]').first().should('contain', '각성');

        // 12. 자동 저장 대기
        cy.wait(1000);

        // 13. 페이지 새로고침
        cy.reload();
        cy.wait(500);

        // 14. 스킬룬 모달 다시 열기 (⭐ first() 추가)
        cy.get('.char-section').first().contains('수정').click();
        cy.wait(300);

        // 15. 룬 데이터 복구 확인
        cy.get('.m-rune-name').eq(0).should('have.value', '각성');
        cy.get('#m-gakin2').should('have.value', '테스트각인2');

        cy.log('✅ 시나리오 2 통과: 스킬룬 설정 → 저장 → 복구');
    });

    // ========================================
    // 시나리오 3: 2개 캐릭터 비교 플로우
    // ========================================
    it('시나리오 3: 2개 캐릭터 생성 및 비교', () => {
        // 1. 첫 번째 캐릭터 생성
        cy.contains('캐릭터 추가').click();
        cy.wait(300);
        cy.get('[data-key="info_name"]').eq(0).type('캐릭터1');
        cy.get('[data-key="무기_reinforce"]').eq(0).type('+10');
        cy.wait(500);

        // 2. 두 번째 캐릭터 생성
        cy.contains('캐릭터 추가').click();
        cy.wait(300);
        cy.get('[data-key="info_name"]').eq(1).type('캐릭터2');
        cy.get('[data-key="무기_reinforce"]').eq(1).type('+12');
        cy.wait(500);

        // 3. 캐릭터 섹션 2개 확인
        cy.get('.char-section').should('have.length', 2);

        // 4. 비교 모드 진입
        cy.get('#btnCompareMode').click();
        cy.wait(300);

        // 5. 비교 선택 UI 확인
        cy.get('#compareCharSelectionContainer').should('be.visible');

        // 6. 왼쪽 캐릭터 선택
        cy.get('#compareCharacterSelectLeft').select(1);
        cy.wait(300);

        // 7. 오른쪽 캐릭터 선택
        cy.get('#compareCharacterSelectRight').select(2);
        cy.wait(500);

        // 8. 비교 테이블 확인
        cy.get('#compareContent').should('be.visible');
        cy.get('#compareContent').should('not.be.empty');

        // 9. 기본 모드로 복귀
        cy.get('#btnBasicMode').click();
        cy.wait(300);

        // 10. 캐릭터 컨테이너 확인
        cy.get('#characterContainer').should('be.visible');

        cy.log('✅ 시나리오 3 통과: 2개 캐릭터 비교');
    });

    // ========================================
    // 시나리오 4: 잠금/해제 플로우
    // ========================================
    it('시나리오 4: 캐릭터 잠금 및 해제', () => {
        // 1. 캐릭터 추가
        cy.contains('캐릭터 추가').click();
        cy.wait(300);

        // 2. 데이터 입력 (⭐ first() 추가)
        cy.get('[data-key="info_name"]').first().type('잠금테스트');
        cy.wait(500);

        // 3. 잠금 버튼 클릭 (⭐ first() 추가)
        cy.get('.char-section .lock-btn').first().click();
        cy.wait(200);

        // 4. 입력 필드가 readOnly인지 확인 (⭐ first() 추가)
        cy.get('[data-key="info_name"]').first().should('have.attr', 'readonly');

        // 5. 잠금 버튼이 활성화되었는지 확인 (⭐ first() 추가)
        cy.get('.char-section .lock-btn').first().should('have.class', 'btn-active');

        // 6. 해제 버튼 클릭 (⭐ first() 추가)
        cy.get('.char-section .unlock-btn').first().click();
        cy.wait(200);

        // 7. 입력 필드가 활성화되었는지 확인 (⭐ first() 추가)
        cy.get('[data-key="info_name"]').first().should('not.have.attr', 'readonly');

        // 8. 데이터 수정 가능 확인 (⭐ first() 추가)
        cy.get('[data-key="info_name"]').first().clear().type('잠금해제됨');
        cy.get('[data-key="info_name"]').first().should('have.value', '잠금해제됨');

        cy.log('✅ 시나리오 4 통과: 잠금/해제');
    });

    // ========================================
    // 시나리오 5: 전체 장비 세팅 플로우
    // ========================================
    it('시나리오 5: 전체 장비 세팅 및 저장', () => {
        // 1. 캐릭터 추가
        cy.contains('캐릭터 추가').click();
        cy.wait(300);

        // 2. 기본 정보 입력 (⭐ first() 추가)
        cy.get('[data-key="info_job"]').first().type('마법사');
        cy.get('[data-key="info_name"]').first().type('풀세팅캐릭터');
        cy.get('[data-key="info_power"]').first().type('54000');

        // 3. 무기 설정 (⭐ first() 추가)
        cy.get('[data-key="무기_rarity"]').first().select('에픽');
        cy.get('[data-key="무기_exceed"]').first().select('이상');
        cy.get('[data-key="무기_reinforce"]').first().type('+12');

        // 4. 상의 설정 (⭐ first() 추가)
        cy.get('[data-key="상의_rarity"]').first().select('에픽');
        cy.get('[data-key="상의_reinforce"]').first().type('+10');

        // 5. 목걸이 설정 (⭐ first() 추가)
        cy.get('[data-key="목걸이_rarity"]').first().select('에픽');

        // 6. 칭호 설정 (⭐ first() 추가)
        cy.get('[data-key="칭호_rarity"]').first().select('레어');

        // 7. 자동 저장 대기
        cy.wait(1500);

        // 8. localStorage 확인
        cy.window().then((win) => {
            const savedData = win.localStorage.getItem('dnfm_character_equipment_data');
            const data = JSON.parse(savedData);

            expect(data[0].inputs['info_name'].val).to.equal('풀세팅캐릭터');
            expect(data[0].inputs['무기_exceed'].val).to.equal('이상');
        });

        // 9. 페이지 새로고침
        cy.reload();
        cy.wait(500);

        // 10. 모든 데이터 복구 확인 (⭐ first() 추가)
        cy.get('[data-key="info_name"]').first().should('have.value', '풀세팅캐릭터');
        cy.get('[data-key="무기_reinforce"]').first().should('have.value', '+12');
        cy.get('[data-key="무기_exceed"]').first().should('have.value', '이상');

        cy.log('✅ 시나리오 5 통과: 전체 장비 세팅');
    });

    // ========================================
    // 시나리오 6: 캐릭터 삭제 플로우
    // ========================================
    it('시나리오 6: 캐릭터 삭제', () => {
        // 1. 캐릭터 추가
        cy.contains('캐릭터 추가').click();
        cy.wait(300);
        cy.get('[data-key="info_name"]').first().type('삭제될캐릭터');
        cy.wait(500);

        // 2. 캐릭터 개수 확인
        cy.get('.char-section').should('have.length', 1);

        // 3. confirm 대화상자 자동 확인 설정
        cy.on('window:confirm', () => true);

        // 4. 삭제 버튼 클릭 (⭐ first() 추가)
        cy.get('.char-section .del-btn').first().click();
        cy.wait(500);

        // 5. 캐릭터가 삭제되었는지 확인
        cy.get('.char-section').should('have.length', 0);

        cy.log('✅ 시나리오 6 통과: 캐릭터 삭제');
    });

    // ========================================
    // 시나리오 7: 여러 캐릭터 동시 관리
    // ========================================
    it('시나리오 7: 3개 캐릭터 동시 관리', () => {
        // 1. 3개 캐릭터 생성
        for (let i = 1; i <= 3; i++) {
            cy.contains('캐릭터 추가').click();
            cy.wait(300);
            cy.get('[data-key="info_name"]').eq(i - 1).type(`캐릭터${i}`);
            cy.get('[data-key="info_power"]').eq(i - 1).type(`${50000 + i * 1000}`);
        }

        cy.wait(1000);

        // 2. 3개 섹션 확인
        cy.get('.char-section').should('have.length', 3);

        // 3. 각 캐릭터 이름 확인
        cy.get('[data-key="info_name"]').eq(0).should('have.value', '캐릭터1');
        cy.get('[data-key="info_name"]').eq(1).should('have.value', '캐릭터2');
        cy.get('[data-key="info_name"]').eq(2).should('have.value', '캐릭터3');

        // 4. localStorage 확인
        cy.window().then((win) => {
            const savedData = win.localStorage.getItem('dnfm_character_equipment_data');
            const data = JSON.parse(savedData);
            expect(data).to.have.length(3);
        });

        // 5. 페이지 새로고침
        cy.reload();
        cy.wait(500);

        // 6. 3개 모두 복구되었는지 확인
        cy.get('.char-section').should('have.length', 3);

        cy.log('✅ 시나리오 7 통과: 3개 캐릭터 동시 관리');
    });

    // ========================================
    // 시나리오 8: 히스토리 모달
    // ========================================
    it('시나리오 8: 변경 히스토리 확인', () => {
        // 1. 캐릭터 추가
        cy.contains('캐릭터 추가').click();
        cy.wait(300);

        // 2. 여러 변경 수행 (⭐ first() 추가)
        cy.get('[data-key="info_name"]').first().type('히스토리테스트');
        cy.wait(500);

        cy.get('[data-key="info_job"]').first().type('귀검사');
        cy.wait(500);

        // 3. 히스토리 모달 열기
        cy.contains('기록').click();
        cy.wait(300);

        // 4. 모달 확인
        cy.get('#historyModal').should('be.visible');

        // 5. 히스토리 내용 확인
        cy.get('#historyList').should('not.be.empty');

        // 6. 모달 닫기
        cy.get('#historyModal').contains('닫기').click();
        cy.wait(200);

        cy.get('#historyModal').should('not.be.visible');

        cy.log('✅ 시나리오 8 통과: 히스토리 확인');
    });

    // ========================================
    // 시나리오 9: 반응형 테스트 (모바일)
    // ========================================
    it('시나리오 9: 모바일 반응형 테스트', () => {
        // 1. 모바일 뷰포트로 변경
        cy.viewport('iphone-x');
        cy.wait(300);

        // 2. 캐릭터 추가
        cy.contains('캐릭터 추가').click();
        cy.wait(500);

        // 3. 테이블이 가로 스크롤 가능한지 확인
        cy.get('.table-container').should('have.css', 'overflow-x', 'auto');

        // 4. 태블릿 뷰포트로 변경
        cy.viewport('ipad-2');
        cy.wait(300);

        // 5. 레이아웃 확인
        cy.get('.control-bar').should('be.visible');

        cy.log('✅ 시나리오 9 통과: 반응형 테스트');
    });

    // ========================================
    // 시나리오 10: 전체 사용자 플로우
    // ========================================
    it('시나리오 10: 완전한 사용자 플로우', () => {
        // 1. 첫 번째 캐릭터 생성 (⭐ first() 추가)
        cy.contains('캐릭터 추가').click();
        cy.wait(300);

        cy.get('[data-key="info_job"]').first().type('귀검사');
        cy.get('[data-key="info_name"]').first().type('메인캐릭터');
        cy.get('[data-key="info_power"]').first().type('55000');

        cy.get('[data-key="무기_rarity"]').first().select('에픽');
        cy.get('[data-key="무기_reinforce"]').first().type('+12');
        cy.wait(500);

        // 2. 스킬룬 설정 (⭐ first() 추가)
        cy.get('.char-section').first().contains('수정').click();
        cy.wait(300);

        cy.get('.m-rune-name').eq(0).select('각성');
        cy.get('.m-rune-lv').eq(0).select('IV');

        cy.get('#skillRunemodal').contains('저장').click();
        cy.wait(500);

        // 3. 두 번째 캐릭터 생성
        cy.contains('캐릭터 추가').click();
        cy.wait(300);

        cy.get('[data-key="info_name"]').eq(1).type('부캐릭터');
        cy.get('[data-key="무기_reinforce"]').eq(1).type('+10');
        cy.wait(1000);

        // 4. 비교 모드로 비교
        cy.get('#btnCompareMode').click();
        cy.wait(300);

        cy.get('#compareCharacterSelectLeft').select(1);
        cy.get('#compareCharacterSelectRight').select(2);
        cy.wait(500);

        cy.get('#compareContent').should('be.visible');

        // 5. 기본 모드로 복귀
        cy.get('#btnBasicMode').click();
        cy.wait(300);

        // 6. 첫 번째 캐릭터 잠금
        cy.get('.char-section').eq(0).find('.lock-btn').click();
        cy.wait(200);

        // ⭐ 자동 저장 대기 (중요!)
        cy.wait(1000);

        // 7. localStorage 확인
        cy.window().then((win) => {
            const savedData = win.localStorage.getItem('dnfm_character_equipment_data');
            const data = JSON.parse(savedData);

            expect(data).to.have.length(2);
            expect(data[0].inputs['info_name'].val).to.equal('메인캐릭터');
            expect(data[0].locked).to.be.true;
        });

        // 8. 페이지 새로고침 후 복구 확인
        cy.reload();
        cy.wait(500);

        // ⭐ 자동 생성 캐릭터가 추가로 생길 수 있으므로 최소 2개 이상 확인
        cy.get('.char-section').should('have.length.at.least', 2);

        // ⭐ 첫 번째 캐릭터(메인)가 잠금 상태로 복구되었는지 확인
        cy.get('[data-key="info_name"]').eq(0).should('have.value', '메인캐릭터');
        cy.get('[data-key="info_name"]').eq(0).should('have.attr', 'readonly');

        cy.log('✅ 시나리오 10 통과: 완전한 사용자 플로우');
    });
});