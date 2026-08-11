---
title: "도메인 랜덤화와 강건한 정책"
date: 2026-08-11
draft: false
tags: ["도메인 랜덤화", "Sim-to-Real", "강건성"]
categories: ["5부. 가상에서 현실로"]
book_weight: 340
book_chapter: "도메인 랜덤화와 강건한 정책"
---

두 번째 전략은 현실을 정확히 하나 복제하는 대신, 현실에서 만날 수 있는 변형을 가상에서 많이 보여 주는 것이다. 조명, 색, 카메라 노이즈, 마찰, 물체 위치를 바꾸면 정책은 특정 장면의 겉모습보다 작업에 공통인 단서를 찾도록 압박받는다.

<div class="book-flow" aria-label="도메인 랜덤화의 기본 흐름">
  <div class="book-flow-step"><strong>기준 장면</strong><span>작업·로봇·물체</span></div>
  <div class="book-flow-arrow" aria-hidden="true">→</div>
  <div class="book-flow-step"><strong>변형 생성</strong><span>빛·색·위치·마찰·잡음</span></div>
  <div class="book-flow-arrow" aria-hidden="true">→</div>
  <div class="book-flow-step"><strong>공통 행동 학습</strong><span>변형에도 목표 유지</span></div>
</div>

## 랜덤하게 바꾸면 모두 좋아지는가

그렇지 않다. 현실에서 일어나지 않는 변형을 너무 많이 넣으면 학습이 작업과 무관한 장면에 맞춰질 수 있다. 반대로 실제로 자주 발생하는 변형을 빼면 전이 때 취약점이 그대로 남는다.

| 선택 | 효과 | 주의점 |
| --- | --- | --- |
| 현실적인 조명 변형 | 특정 밝기에 과적합하는 것을 줄임 | 작업 단서가 사라지지 않아야 함 |
| 물체 위치 변형 | 위치 변화에 대응 | 도달 불가능한 위치는 제외 |
| 센서 잡음 추가 | 측정 오차에 견딤 | 실제 센서 특성과 맞아야 함 |
| 마찰 변형 | 접촉 조건 변화에 대응 | 안전한 힘 범위를 함께 검증 |

랜덤화는 현실을 모델에게 보여 주는 한 방법이지, 실제 데이터를 대체하는 만능 버튼이 아니다. 시뮬레이션에서 버틴 조건을 다시 현실의 대표 사례에서 확인해야 한다.

