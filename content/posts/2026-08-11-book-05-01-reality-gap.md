---
title: "시뮬레이션과 현실의 차이 — Reality Gap"
date: 2026-08-11
draft: false
tags: ["Sim-to-Real", "Reality Gap", "시뮬레이션"]
categories: ["5부. 가상에서 현실로"]
book_weight: 310
book_chapter: "시뮬레이션과 현실의 차이 — Reality Gap"
---

가상 창고에서 상자를 잘 집던 로봇이 실제 창고에서 실패할 수 있다. 현실에는 시뮬레이션에 없던 조명 변화, 센서 잡음, 마찰, 케이블 흔들림, 물체의 변형과 접촉이 있기 때문이다. 이 차이를 Reality Gap이라고 부른다.

<div class="book-flow" aria-label="시뮬레이션과 현실의 차이">
  <div class="book-flow-step"><strong>가상 경험</strong><span>정리된 장면·물리 모델</span></div>
  <div class="book-flow-arrow" aria-hidden="true">→</div>
  <div class="book-flow-step"><strong>현실 전이</strong><span>새 센서·재질·사람</span></div>
  <div class="book-flow-arrow" aria-hidden="true">→</div>
  <div class="book-flow-step"><strong>차이 관찰</strong><span>오차·실패·불확실성</span></div>
</div>

## 현실은 하나의 차이가 아니다

| 차이의 종류 | 가상에서의 가정 | 현실에서 생기는 문제 |
| --- | --- | --- |
| 시각 | 일정한 조명과 선명한 물체 | 반사·그림자·노출 변화 |
| 센서 | 정확한 위치와 거리 | 지연·잡음·가림 |
| 물리 | 고정된 마찰과 강체 | 미끄러짐·변형·탄성 |
| 몸 | 알려진 질량과 관절 | 조립 오차·마모·케이블 영향 |
| 환경 | 비어 있는 작업 공간 | 사람·도구·예상 밖 물체 |

Reality Gap은 시뮬레이션이 쓸모없다는 증거가 아니다. 오히려 무엇을 가상에서 학습하고 무엇을 현실에서 반드시 검증해야 하는지를 구분하게 해 준다.

가상 정책을 현실에 배치할 때는 “성공했는가”만 보지 말고 어떤 차이에서 실패했는지 기록해야 한다. 그 기록은 시뮬레이션의 모델을 고치거나, 현실 입력을 정돈하거나, 정책이 변형을 견디도록 만드는 다음 단계의 재료가 된다.

