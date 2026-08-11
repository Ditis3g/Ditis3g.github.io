---
title: "시뮬레이션은 테스트장이자 데이터 공장이다"
date: 2026-08-11
draft: false
tags: ["시뮬레이션", "평가", "로봇 데이터"]
categories: ["5부. 가상에서 현실로"]
book_weight: 370
book_chapter: "시뮬레이션은 테스트장이자 데이터 공장이다"
---

시뮬레이션은 정책을 학습하는 장소이면서 평가 조건을 만드는 장소다. 같은 작업을 조명, 물체 위치, 마찰, 카메라 시점별로 반복하면 모델의 약한 조건을 비교할 수 있다.

## 학습 환경과 평가 환경을 나누기

학습에 사용한 장면을 그대로 평가하면 모델이 익숙한 장면을 외운 것인지, 작업 원리를 배운 것인지 구분하기 어렵다. 물체 위치·조명·배치·작업 순서를 일부 바꾼 평가 장면을 따로 두어야 한다.

| 평가 구성 | 확인할 것 |
| --- | --- |
| 익숙한 장면 | 기본 동작이 유지되는가 |
| 가까운 변형 | 위치·조명 변화에 대응하는가 |
| 새로운 조합 | 물체와 지시의 관계를 연결하는가 |
| 실패 조건 | 멈추거나 복구할 수 있는가 |
| 현실 샘플 | 가상과 다른 관측에서도 작동하는가 |

<div class="book-flow" aria-label="시뮬레이션 평가 흐름">
  <div class="book-flow-step"><strong>조건 설계</strong><span>장면·물체·센서 변형</span></div>
  <div class="book-flow-arrow" aria-hidden="true">→</div>
  <div class="book-flow-step"><strong>반복 실행</strong><span>성공·실패·중단 기록</span></div>
  <div class="book-flow-arrow" aria-hidden="true">→</div>
  <div class="book-flow-step"><strong>약점 분석</strong><span>다음 데이터와 검증 생성</span></div>
</div>

시뮬레이션의 장점은 같은 조건을 반복할 수 있다는 것이다. 모델 버전이 바뀔 때 이전 평가 조건을 다시 실행하면 업데이트로 기존 능력이 손상되었는지 확인할 수 있다.

