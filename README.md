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



---
---

###2. 코드 보완 및 주의사항
   ① lastSnapshot 초기화 문제  
   현재 changeHistory를 기록할 때 lastSnapshot 변수를 참조하고 있습니다.  
   페이지가 처음 로드될 때 이 변수가 비어있으면 첫 번째 변경 사항이 기록되지 않을 수 있습니다.    
   window.onload 끝에 updateLastSnapshot();을 추가하는 것이 좋습니다.

```
window.onload = () => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (saved.length > 0) saved.forEach(d => createCharacterTable(d));
    else createCharacterTable();

    updateLastSnapshot(); // 초기 스냅샷 생성
};
```

###③ autoSave와 changeHistory 충돌 방지
autoSave 내부에서 updateLastSnapshot을 호출하고 있는데, change 이벤트와 autoSave(800ms 디바운스) 사이의 시차 때문에 기록이 누락되거나 중복될 가능성이 있습니다. 현재 구조는 무난하지만, 데이터가 많아질 경우 기록 시점을 명확히 분리하는 것이 안전합니다.

---> 해결방안
```
function autoSave()  

document.addEventListener('change', function(e) {  
```
코드 수정

---
---

1. 세트 체크 통합 실행 함수 (runSetCheck)
   코드 내에서 runSetCheck(slot, charId)가 자주 호출되고 있습니다. 이 함수는 방어구 세트와 특수장비 세트 체크를 슬롯에 따라 분기하여 실행해주는 역할을 합니다.
   ```function runSetCheck(slot, charId) 수정```
   




==============================================================

해당 오류는 createCharacterTable 함수 마지막 부분에서 savedData가 없는 상태(신규 캐릭터 추가 시)인데도 속성에 접근하려고 해서 발생하는 전형적인 자바스크립트 에러입니다.

코드의 마지막 줄을 보면 다음과 같이 되어 있을 것입니다.

```
// 오류 발생 지점
toggleEdit(charId, !!savedData.locked);
```
**1. 원인 분석**
  - **신규 추가 시**: createCharacterTable()을 매개변수 없이 호출하면 savedData는 null이 됩니다.
  - **접근 오류**: null.locked를 읽으려고 하니 "null의 속성을 읽을 수 없다"는 에러가 발생합니다.
  - **실행 영향**: 이 줄이 함수의 가장 마지막에 있기 때문에, 테이블 생성은 이미 끝난 상태라 겉보기에는 문제가 없어 보이지만, 이후에 실행되어야 할 다른 스크립트가 있다면 중단될 위험이 있습니다.

**2. 해결 방법**  
savedData가 존재할 때만 해당 값을 참조하도록 **옵셔널 체이닝(?.)**을 사용하거나 단락 평가를 추가해야 합니다.

**[수정 전]**  
```toggleEdit(charId, !!savedData.locked);```  
**[수정 후 (추천)]**  
```
// savedData가 있으면 locked 값을 쓰고, 없으면 false(잠금 해제)를 기본값으로 사용
toggleEdit(charId, savedData ? !!savedData.locked : false);
```
또는 더 깔끔하게 옵셔널 체이닝을 사용할 수 있습니다.  
```toggleEdit(charId, !!savedData?.locked);```  
