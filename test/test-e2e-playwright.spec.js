// ============================================
// Playwright E2E 테스트
// ============================================

// 설치 방법:
// npm install -D @playwright/test
// npx playwright install

// 실행 방법:
// npx playwright test test-e2e-playwright.spec.js

const { test, expect } = require('@playwright/test');

// 테스트 설정
test.describe('RPG 장비 관리 시스템 E2E 테스트', () => {

    // 각 테스트 전에 페이지 열기
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8000/index.html');
        // localStorage 초기화
        await page.evaluate(() => localStorage.clear());
        await page.reload();
        await page.waitForLoadState('networkidle');

        // ⭐ 자동 생성된 캐릭터 삭제 (localStorage 비우면 1개 자동 생성됨)
        await page.evaluate(() => {
            const sections = document.querySelectorAll('.char-section');
            sections.forEach(sec => sec.remove());
        });
        await page.waitForTimeout(300);
    });

    // ========================================
    // 시나리오 1: 캐릭터 생성 전체 플로우
    // ========================================
    test('시나리오 1: 캐릭터 생성부터 데이터 복구까지', async ({ page }) => {
        // 1. 캐릭터 추가 버튼 클릭
        await page.click('button:has-text("캐릭터 추가")');
        await page.waitForTimeout(500);

        // 2. 캐릭터 섹션 생성 확인
        const charSection = await page.locator('.char-section').first();
        await expect(charSection).toBeVisible();

        // 3. 직업 입력
        await page.fill('[data-key="info_job"]', '귀검사');

        // 4. 이름 입력
        await page.fill('[data-key="info_name"]', 'E2E테스트캐릭터');

        // 5. 항마력 입력
        await page.fill('[data-key="info_power"]', '52000');

        // 6. 무기 희귀도 선택
        await page.selectOption('[data-key="무기_rarity"]', '에픽');

        // 7. 무기 강화 입력
        await page.fill('[data-key="무기_reinforce"]', '+12');

        // 8. 자동 저장 대기
        await page.waitForTimeout(1000);

        // 9. localStorage에 저장 확인
        const savedData = await page.evaluate(() => {
            return localStorage.getItem('dnfm_character_equipment_data');
        });
        expect(savedData).toBeTruthy();

        // 10. 저장된 데이터 검증
        const data = JSON.parse(savedData);
        expect(data[0].inputs['info_name'].val).toBe('E2E테스트캐릭터');
        expect(data[0].inputs['info_job'].val).toBe('귀검사');
        expect(data[0].inputs['무기_rarity'].val).toBe('에픽');

        // 11. 페이지 새로고침
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        // 12. 데이터 복구 확인
        const nameValue = await page.inputValue('[data-key="info_name"]');
        expect(nameValue).toBe('E2E테스트캐릭터');

        const jobValue = await page.inputValue('[data-key="info_job"]');
        expect(jobValue).toBe('귀검사');

        console.log('✅ 시나리오 1 통과: 캐릭터 생성 → 저장 → 복구');
    });

    // ========================================
    // 시나리오 2: 스킬룬 설정 전체 플로우
    // ========================================
    test('시나리오 2: 스킬룬 설정부터 저장까지', async ({ page }) => {
        // 1. 캐릭터 추가
        await page.click('button:has-text("캐릭터 추가")');
        await page.waitForTimeout(500);

        // 2. 캐릭터 이름 입력 (식별용)
        await page.fill('[data-key="info_name"]', '스킬룬테스트');
        await page.waitForTimeout(1000);

        // 3. 스킬룬 수정 버튼 클릭
        await page.click('.char-section button:has-text("수정")');
        await page.waitForTimeout(300);

        // 4. 모달이 열렸는지 확인
        const modal = page.locator('#skillRunemodal');
        await expect(modal).toBeVisible();

        // 5. 첫 번째 룬 설정
        await page.selectOption('.m-rune-name >> nth=0', '각성');
        await page.selectOption('.m-rune-lv >> nth=0', 'IV');
        await page.selectOption('.m-rune-skillLv >> nth=0', '60');

        // 6. 두 번째 룬 설정
        await page.selectOption('.m-rune-name >> nth=1', '가호');
        await page.selectOption('.m-rune-lv >> nth=1', 'III');

        // 7. 세 번째 룬 설정
        await page.selectOption('.m-rune-name >> nth=2', '왜곡');
        await page.selectOption('.m-rune-lv >> nth=2', 'IV');

        // 8. 각인 입력
        await page.fill('#m-gakin1', '각인1');
        await page.fill('#m-gakin2', '각인2');

        // 9. 저장 버튼 클릭
        await page.click('#skillRunemodal button:has-text("저장")');
        await page.waitForTimeout(500);

        // 10. 모달이 닫혔는지 확인
        await expect(modal).not.toBeVisible();

        // 11. 룬 요약이 표시되는지 확인
        const runeSummary = await page.locator('[id$="_runeSummary"]').first();
        const summaryText = await runeSummary.textContent();
        expect(summaryText).toContain('각성');

        // 12. 자동 저장 대기
        await page.waitForTimeout(1000);

        // 13. 페이지 새로고침
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        // 14. 스킬룬 모달 다시 열기
        await page.click('.char-section button:has-text("수정")');
        await page.waitForTimeout(300);

        // 15. 룬 데이터 복구 확인
        const rune1Name = await page.inputValue('.m-rune-name >> nth=0');
        expect(rune1Name).toBe('각성');

        const gakin2 = await page.inputValue('#m-gakin2');
        expect(gakin2).toBe('각인2');

        console.log('✅ 시나리오 2 통과: 스킬룬 설정 → 저장 → 복구');
    });

    // ========================================
    // 시나리오 3: 2개 캐릭터 비교 플로우
    // ========================================
    test('시나리오 3: 2개 캐릭터 생성 및 비교', async ({ page }) => {
        // 1. 첫 번째 캐릭터 생성
        await page.click('button:has-text("캐릭터 추가")');
        await page.waitForTimeout(300);
        await page.fill('[data-key="info_name"] >> nth=0', '캐릭터1');
        await page.fill('[data-key="무기_reinforce"] >> nth=0', '+10');
        await page.waitForTimeout(500);

        // 2. 두 번째 캐릭터 생성
        await page.click('button:has-text("캐릭터 추가")');
        await page.waitForTimeout(300);
        await page.fill('[data-key="info_name"] >> nth=1', '캐릭터2');
        await page.fill('[data-key="무기_reinforce"] >> nth=1', '+12');
        await page.waitForTimeout(500);

        // 3. 캐릭터 섹션 2개 확인
        const sections = await page.locator('.char-section').count();
        expect(sections).toBe(2);

        // 4. 비교 모드 진입
        await page.click('#btnCompareMode');
        await page.waitForTimeout(300);

        // 5. 비교 선택 UI 확인
        const compareContainer = page.locator('#compareCharSelectionContainer');
        await expect(compareContainer).toBeVisible();

        // 6. 왼쪽 캐릭터 선택
        const leftSelect = page.locator('#compareCharacterSelectLeft');
        const leftOptions = await leftSelect.locator('option').count();
        expect(leftOptions).toBeGreaterThan(1); // 빈 옵션 + 캐릭터들

        // 7. 첫 번째 캐릭터 선택 (index 1 = 첫 번째 캐릭터)
        await leftSelect.selectOption({ index: 1 });
        await page.waitForTimeout(300);

        // 8. 오른쪽 캐릭터 선택 (index 2 = 두 번째 캐릭터)
        const rightSelect = page.locator('#compareCharacterSelectRight');
        await rightSelect.selectOption({ index: 2 });
        await page.waitForTimeout(500);

        // 9. 비교 테이블 확인
        const compareContent = page.locator('#compareContent');
        const isVisible = await compareContent.isVisible();
        expect(isVisible).toBe(true);

        // 10. 비교 테이블에 데이터 있는지 확인
        const compareText = await compareContent.textContent();
        expect(compareText.length).toBeGreaterThan(100);

        // 11. 기본 모드로 복귀
        await page.click('#btnBasicMode');
        await page.waitForTimeout(300);

        // 12. 캐릭터 컨테이너 확인
        const charContainer = page.locator('#characterContainer');
        await expect(charContainer).toBeVisible();

        console.log('✅ 시나리오 3 통과: 2개 캐릭터 비교');
    });

    // ========================================
    // 시나리오 4: 잠금/해제 플로우
    // ========================================
    test('시나리오 4: 캐릭터 잠금 및 해제', async ({ page }) => {
        // 1. 캐릭터 추가
        await page.click('button:has-text("캐릭터 추가")');
        await page.waitForTimeout(300);

        // 2. 데이터 입력 (⭐ first() 사용)
        await page.locator('[data-key="info_name"]').first().fill('잠금테스트');
        await page.waitForTimeout(500);

        // 3. 잠금 버튼 클릭 (⭐ first() 사용)
        await page.locator('.char-section .lock-btn').first().click();
        await page.waitForTimeout(200);

        // 4. 입력 필드가 readOnly인지 확인 (⭐ first() 사용)
        const nameInput = page.locator('[data-key="info_name"]').first();
        const isReadOnly = await nameInput.evaluate(el => el.readOnly);
        expect(isReadOnly).toBe(true);

        // 5. 잠금 버튼이 활성화되었는지 확인 (⭐ first() 사용)
        const lockBtn = page.locator('.char-section .lock-btn').first();
        const hasActive = await lockBtn.evaluate(el => el.classList.contains('btn-active'));
        expect(hasActive).toBe(true);

        // 6. 해제 버튼 클릭 (⭐ first() 사용)
        await page.locator('.char-section .unlock-btn').first().click();
        await page.waitForTimeout(200);

        // 7. 입력 필드가 활성화되었는지 확인
        const isReadOnlyAfter = await nameInput.evaluate(el => el.readOnly);
        expect(isReadOnlyAfter).toBe(false);

        // 8. 데이터 수정 가능 확인
        await page.locator('[data-key="info_name"]').first().fill('잠금해제됨');
        const newValue = await page.inputValue('[data-key="info_name"]');
        expect(newValue).toBe('잠금해제됨');

        console.log('✅ 시나리오 4 통과: 잠금/해제');
    });

    // ========================================
    // 시나리오 5: 전체 장비 세팅 플로우
    // ========================================
    test('시나리오 5: 전체 장비 세팅 및 저장', async ({ page }) => {
        // 1. 캐릭터 추가
        await page.click('button:has-text("캐릭터 추가")');
        await page.waitForTimeout(300);

        // 2. 기본 정보 입력
        await page.fill('[data-key="info_job"]', '마법사');
        await page.fill('[data-key="info_name"]', '풀세팅캐릭터');
        await page.fill('[data-key="info_power"]', '54000');

        // 3. 무기 설정
        await page.selectOption('[data-key="무기_rarity"]', '에픽');
        await page.selectOption('[data-key="무기_exceed"]', '이상');
        await page.fill('[data-key="무기_reinforce"]', '+12');

        // 4. 상의 설정
        await page.selectOption('[data-key="상의_rarity"]', '에픽');
        await page.fill('[data-key="상의_reinforce"]', '+10');

        // 5. 목걸이 설정
        await page.selectOption('[data-key="목걸이_rarity"]', '에픽');

        // 6. 칭호 설정
        await page.selectOption('[data-key="칭호_rarity"]', '레어');

        // 7. 자동 저장 대기
        await page.waitForTimeout(1500);

        // 8. localStorage 확인
        const savedData = await page.evaluate(() => {
            return localStorage.getItem('dnfm_character_equipment_data');
        });
        const data = JSON.parse(savedData);

        expect(data[0].inputs['info_name'].val).toBe('풀세팅캐릭터');
        expect(data[0].inputs['무기_exceed'].val).toBe('이상');

        // 9. 페이지 새로고침
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        // 10. 모든 데이터 복구 확인
        expect(await page.inputValue('[data-key="info_name"]')).toBe('풀세팅캐릭터');
        expect(await page.inputValue('[data-key="무기_reinforce"]')).toBe('+12');

        const exceedValue = await page.inputValue('[data-key="무기_exceed"]');
        expect(exceedValue).toBe('이상');

        console.log('✅ 시나리오 5 통과: 전체 장비 세팅');
    });

    // ========================================
    // 시나리오 6: 캐릭터 삭제 플로우
    // ========================================
    test('시나리오 6: 캐릭터 삭제', async ({ page }) => {
        // 1. 캐릭터 추가
        await page.click('button:has-text("캐릭터 추가")');
        await page.waitForTimeout(300);
        await page.fill('[data-key="info_name"]', '삭제될캐릭터');
        await page.waitForTimeout(500);

        // 2. 캐릭터 개수 확인
        let count = await page.locator('.char-section').count();
        expect(count).toBe(1);

        // 3. 삭제 버튼 클릭 (confirm 대화상자 자동 확인)
        page.on('dialog', dialog => dialog.accept());
        await page.click('.char-section .del-btn');
        await page.waitForTimeout(500);

        // 4. 캐릭터가 삭제되었는지 확인
        count = await page.locator('.char-section').count();
        expect(count).toBe(0);

        console.log('✅ 시나리오 6 통과: 캐릭터 삭제');
    });

    // ========================================
    // 시나리오 7: 여러 캐릭터 동시 관리
    // ========================================
    test('시나리오 7: 3개 캐릭터 동시 관리', async ({ page }) => {
        // 1. 3개 캐릭터 생성
        for (let i = 1; i <= 3; i++) {
            await page.click('button:has-text("캐릭터 추가")');
            await page.waitForTimeout(300);
            await page.fill(`[data-key="info_name"] >> nth=${i-1}`, `캐릭터${i}`);
            await page.fill(`[data-key="info_power"] >> nth=${i-1}`, `${50000 + i * 1000}`);
        }

        await page.waitForTimeout(1000);

        // 2. 3개 섹션 확인
        const count = await page.locator('.char-section').count();
        expect(count).toBe(3);

        // 3. 각 캐릭터 이름 확인
        for (let i = 0; i < 3; i++) {
            const name = await page.inputValue(`[data-key="info_name"] >> nth=${i}`);
            expect(name).toBe(`캐릭터${i + 1}`);
        }

        // 4. localStorage 확인
        const savedData = await page.evaluate(() => {
            return localStorage.getItem('dnfm_character_equipment_data');
        });
        const data = JSON.parse(savedData);
        expect(data.length).toBe(3);

        // 5. 페이지 새로고침
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        // 6. 3개 모두 복구되었는지 확인
        const countAfter = await page.locator('.char-section').count();
        expect(countAfter).toBe(3);

        console.log('✅ 시나리오 7 통과: 3개 캐릭터 동시 관리');
    });

    // ========================================
    // 시나리오 8: 히스토리 모달
    // ========================================
    test('시나리오 8: 변경 히스토리 확인', async ({ page }) => {
        // 1. 캐릭터 추가
        await page.click('button:has-text("캐릭터 추가")');
        await page.waitForTimeout(300);

        // 2. 여러 변경 수행
        await page.fill('[data-key="info_name"]', '히스토리테스트');
        await page.waitForTimeout(500);

        await page.fill('[data-key="info_job"]', '귀검사');
        await page.waitForTimeout(500);

        // 3. 히스토리 모달 열기
        await page.click('button:has-text("기록")');
        await page.waitForTimeout(300);

        // 4. 모달 확인
        const modal = page.locator('#historyModal');
        await expect(modal).toBeVisible();

        // 5. 히스토리 내용 확인
        const historyList = await page.locator('#historyList').textContent();
        expect(historyList.length).toBeGreaterThan(0);

        // 6. 모달 닫기
        await page.click('#historyModal button:has-text("닫기")');
        await page.waitForTimeout(200);

        await expect(modal).not.toBeVisible();

        console.log('✅ 시나리오 8 통과: 히스토리 확인');
    });
});