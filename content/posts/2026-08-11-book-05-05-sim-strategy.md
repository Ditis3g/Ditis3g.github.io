---
title: "세 가지 전략은 중간에서 만난다"
date: 2026-08-11
draft: false
tags: ["Sim-to-Real", "시뮬레이션", "현장 적용"]
categories: ["5부. 가상에서 현실로"]
book_weight: 350
book_chapter: "세 가지 전략은 중간에서 만난다"
---

현실 전이에는 한 가지 정답이 없다. 시뮬레이션을 현실에 가깝게 만들고, 현실의 입력을 정돈하고, 남은 차이를 견디도록 정책을 학습하는 세 방향을 함께 사용한다.

| 전략 | 무엇을 바꾸는가 | 적합한 상황 |
| --- | --- | --- |
| 시뮬레이션을 현실에 맞춤 | 가상 환경과 물리 모델 | 특정 현장·장비를 정밀하게 재현할 때 |
| 현실을 정돈 | 카메라·조명·작업 범위 | 통제 가능한 공정에서 변동을 줄일 때 |
| 정책을 강건하게 | 학습 경험과 변형 범위 | 다양한 현실 조건을 견뎌야 할 때 |

<div class="book-flow" aria-label="Sim-to-Real 전략 조합">
  <div class="book-flow-step"><strong>가상 모델</strong><span>현실에 가까운 기준</span></div>
  <div class="book-flow-arrow" aria-hidden="true">+</div>
  <div class="book-flow-step"><strong>현장 설계</strong><span>불필요한 변동 감소</span></div>
  <div class="book-flow-arrow" aria-hidden="true">+</div>
  <div class="book-flow-step"><strong>강건한 정책</strong><span>남은 차이에 대응</span></div>
  <div class="book-flow-arrow" aria-hidden="true">→</div>
  <div class="book-flow-step"><strong>실물 검증</strong><span>실패를 다시 반영</span></div>
</div>

예를 들어 카메라 위치는 고정할 수 있지만 조명은 하루 동안 달라질 수 있다. 작업대의 형태는 스캔할 수 있지만 물체의 표면 마찰은 매번 같지 않다. 이런 경우 환경 정돈과 랜덤화, 실제 실패 수집을 함께 사용해야 한다.

중요한 것은 어느 전략을 택했는지보다, 가상에서 만든 가정과 현실에서 검증한 사실을 분리해 기록하는 것이다. 다음 장에서는 현장과 가상 환경을 지속적으로 연결하는 디지털 트윈을 살펴본다.

