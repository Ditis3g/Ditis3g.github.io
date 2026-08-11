---
title: "LLM에서 VLM, 그리고 VLA로"
date: 2026-08-11
draft: false
tags: ["LLM", "VLM", "VLA"]
categories: ["4부. VLA를 자세히 들여다보기"]
book_weight: 220
book_chapter: "LLM에서 VLM, 그리고 VLA로"
---

세 모델의 차이는 이름보다 출력에서 선명해진다. LLM은 언어를 입력받아 언어를 출력한다. VLM은 이미지와 언어를 함께 다루며 장면을 설명하거나 질문에 답한다. VLA는 여기서 한 걸음 더 나아가 로봇 행동을 출력으로 연결한다.

| 모델 | 입력 | 출력 | 컵 예시 |
| --- | --- | --- | --- |
| LLM | 문장 | 문장 | 컵을 집는 방법을 설명 |
| VLM | 이미지·문장 | 문장·분류 | 빨간 컵의 위치를 말함 |
| VLA | 이미지·문장·로봇 상태 | 행동 | 팔과 그리퍼의 다음 움직임을 제안 |

<div class="book-flow" aria-label="LLM VLM VLA의 출력 변화">
  <div class="book-flow-step"><strong>언어</strong><span>말을 이해하고 말로 답함</span></div>
  <div class="book-flow-arrow" aria-hidden="true">→</div>
  <div class="book-flow-step"><strong>시각·언어</strong><span>장면과 말을 연결함</span></div>
  <div class="book-flow-arrow" aria-hidden="true">→</div>
  <div class="book-flow-step"><strong>시각·언어·행동</strong><span>로봇의 움직임으로 이어짐</span></div>
</div>

하지만 VLA의 출력이 곧 모터 전압이라는 뜻은 아니다. 모델이 행동의 방향이나 궤적을 내놓으면, 로봇 시스템은 그것을 제어 가능한 명령으로 바꾸고 안전 범위 안에서 실행한다.

## “언어를 안다”와 “행동을 만든다”의 차이

언어 모델은 “깨지기 쉬운 컵은 조심해서 다뤄야 한다”는 문장을 만들 수 있다. 시각언어 모델은 사진 속 컵을 찾아 위치를 설명할 수 있다. VLA는 그 장면과 지시를 실제 행동으로 연결하려 한다. 그러나 조심스럽게 다룬다는 말이 정확한 그립 힘과 속도로 자동 변환되는 것은 아니다.

VLA의 핵심은 말의 의미를 로봇이 배운 몸 기술과 연결하는 데 있다. 다음 장에서는 웹에서 넓은 의미를 배운 모델이 왜 로봇 행동과 결합될 때 큰 기대를 받았는지 살펴본다.

