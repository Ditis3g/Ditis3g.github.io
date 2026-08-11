---
title: "피지컬 AI 시스템 전체 지도"
date: 2026-08-11
draft: false
tags: ["피지컬 AI", "센서", "로봇 시스템"]
categories: ["2부. 피지컬 AI는 어떻게 배우고 움직이는가"]
book_weight: 120
book_chapter: "피지컬 AI 시스템 전체 지도"
---

2부에서 살펴본 내용을 하나의 작업 흐름으로 연결해 보자. 로봇은 센서로 현실을 관찰하고, 관측을 해석해 다음 행동을 고르며, 그 행동을 몸의 움직임으로 바꾼다. 실행 결과는 다시 센서로 돌아와 다음 판단의 입력이 된다.

<div class="book-flow" aria-label="피지컬 AI 시스템 전체 흐름">
  <div class="book-flow-step"><strong>센서</strong><span>영상·거리·관절 상태</span></div>
  <div class="book-flow-arrow" aria-hidden="true">→</div>
  <div class="book-flow-step"><strong>상태 해석</strong><span>물체·목표·위험</span></div>
  <div class="book-flow-arrow" aria-hidden="true">→</div>
  <div class="book-flow-step"><strong>정책</strong><span>다음 행동 제안</span></div>
  <div class="book-flow-arrow" aria-hidden="true">→</div>
  <div class="book-flow-step"><strong>제어</strong><span>경로·속도·힘</span></div>
  <div class="book-flow-arrow" aria-hidden="true">→</div>
  <div class="book-flow-step"><strong>몸</strong><span>모터·손·바퀴</span></div>
</div>

실행 뒤에는 결과 확인과 안전 판단이 끼어들고, 필요하면 이전 단계로 되돌아간다.

## 한 장의 지도에서 층을 구분하기

| 질문 | 담당 영역 | 실패 예시 |
| --- | --- | --- |
| 무엇이 보이는가? | 센서·인식 | 컵을 놓침 |
| 지금 목표는 무엇인가? | 상태 해석·정책 | 컵 대신 병을 선택 |
| 어떤 행동을 할 것인가? | 정책 | 좁은 틈으로 무리하게 이동 |
| 어떻게 움직일 것인가? | 계획·제어 | 경로가 흔들림 |
| 움직여도 안전한가? | 안전층 | 사람 근처에서 계속 실행 |
| 성공했는가? | 재관찰·평가 | 컵을 들었다고 착각 |

이 표는 모듈을 엄격하게 분리하자는 뜻이 아니다. 실제 제품에서는 여러 기능이 하나의 모델이나 여러 소프트웨어 모듈에 섞일 수 있다. 중요한 것은 이름이 아니라 각 기능이 어떤 질문에 답하는지 구분하는 것이다.

## 문제를 추적하는 순서

로봇이 작업에 실패했을 때 바로 모델을 바꾸기보다, 다음 순서로 기록을 따라가면 원인을 좁힐 수 있다.

1. 센서가 당시 장면과 몸 상태를 제대로 기록했는가?
2. 기록된 장면에서 목표 물체와 주변 위험을 해석할 수 있었는가?
3. 정책이 현재 목표에 맞는 행동을 제안했는가?
4. 제어기가 그 행동을 실제 궤적으로 변환했는가?
5. 안전층이 행동을 제한했거나, 제한해야 했는데 놓쳤는가?
6. 실행 결과를 다시 관찰하고 실패로 분류했는가?

<div class="book-callout">
  <strong>2부의 결론</strong>
  <p>피지컬 AI는 센서, 정책, 제어기, 안전층, 몸이 연결된 폐루프다. 어느 한 부분만 똑똑해져도 전체 작업이 자동으로 해결되는 것은 아니다.</p>
</div>

다음 3부에서는 이 시스템의 정책이 어디서 오는지 본격적으로 살펴본다. 사람이 로봇을 직접 조종해 만든 행동 경험은 어떻게 학습 데이터가 되고, 모방학습과 강화학습은 각각 어떤 빈틈을 메우는가? 그리고 그 경험을 현장 규모로 확장하려면 무엇이 필요한가?

