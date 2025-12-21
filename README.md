[문제점]

### 1. innerHTML 재생성으로 인한 이벤트/상태 유실 가능성  
updateStyle에서 희귀도 변경 시:  
```parentTd.innerHTML = `<select ...>...</select>```

이 방식은:  
  - 기존 요소에 바인딩된 포커스 상태  
  - 향후 addEventListener로 붙일 이벤트  
  - 커서 위치를 전부 날려버릴 수 있음

👉 지금은 inline 이벤트 위주라 당장 문제는 없지만 확장 시 위험

---

###2. onchange="checkFunc; autoSave()"는 문자열 실행 구조
   ```onchange="checkArmorSetColor('char1'); autoSave()"```

- 문자열 기반 이벤트는
  - 디버깅 어려움
  - 오타 시 런타임 에러
  - IDE 자동완성/검증 불가

👉 동작은 하지만 구조적으로 좋지 않음

---

###3. 세트 체크 로직이 중복되고 하드코딩됨
- checkArmorSetColor
- checkAccSetColor
- checkSpecialSetColor

→ 거의 동일한 로직이 3번 반복
- 슬롯 배열만 다름
- 세트 데이터만 다름

👉 유지보수 시 수정 누락 위험 큼

---

### 4. lastSnapshot 동기화 타이밍 문제 가능성
   ```const oldVal = lastSnapshot.find(...)```
- autoSave는 800ms 지연
- change 이벤트는 즉시 기록

👉 빠르게 연속 변경 시:

- oldVal이 실제 직전 값이 아닐 수 있음
- 변경 기록이 틀어질 가능성 있음

---

### 6. querySelector 반복 사용으로 성능 비효율
- 예: applySealHighlight
  - 슬롯마다 querySelector, querySelectorAll 반복
- 캐릭터 수 × 슬롯 수가 늘면 DOM 접근 비용 증가

👉 현재는 괜찮지만 확장성 낮음

---

### 번호	수정 내용
|번호|수정 내용|
|---|------|
|1|	innerHTML 재생성 최소화 → 요소 교체 함수화|
|2|	문자열 onchange="..." 제거 → JS 이벤트 바인딩|
|3|	세트 체크 로직 공통화 (⚠️ 기존 3함수 유지)|
|4|	lastSnapshot 갱신 타이밍 안정화|
|6|	반복 querySelector 캐싱|