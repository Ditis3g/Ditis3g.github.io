---
title: "행동은 문장이 아니라 숫자다"
date: 2026-08-11
draft: false
tags: ["VLA", "행동 표현", "로봇 제어"]
categories: ["4부. VLA를 자세히 들여다보기"]
book_weight: 260
book_chapter: "행동은 문장이 아니라 숫자다"
---

“상자를 치워 줘”는 사람에게는 의미 있는 문장이지만 모터에는 충분하지 않다. 로봇은 팔의 위치, 관절 각도, 그리퍼 상태, 시간에 따른 변화량과 같은 숫자를 받아야 움직일 수 있다.

<div class="book-flow" aria-label="언어 지시에서 숫자 행동으로">
  <div class="book-flow-step"><strong>지시</strong><span>상자를 치워 줘</span></div>
  <div class="book-flow-arrow" aria-hidden="true">→</div>
  <div class="book-flow-step"><strong>장면 해석</strong><span>상자·목표 위치·장애물</span></div>
  <div class="book-flow-arrow" aria-hidden="true">→</div>
  <div class="book-flow-step"><strong>행동 숫자</strong><span>위치·자세·속도·그립</span></div>
  <div class="book-flow-arrow" aria-hidden="true">→</div>
  <div class="book-flow-step"><strong>몸의 실행</strong><span>관절·모터·도구</span></div>
</div>

## 행동 벡터를 직관적으로 보기

어떤 순간의 로봇 행동을 아주 단순화하면 다음처럼 표현할 수 있다.

| 숫자의 의미 | 예시 질문 |
| --- | --- |
| 위치 | 손끝은 작업대의 어디에 있는가? |
| 자세 | 그리퍼의 방향은 어떤가? |
| 이동 변화 | 다음 순간 어느 방향으로 얼마나 움직이는가? |
| 도구 상태 | 그리퍼가 열려 있는가, 닫히는가? |
| 시간 | 이 변화가 어느 시점에 일어나는가? |

실제 시스템은 더 많은 상태와 표현을 사용할 수 있지만, 핵심은 문장의 의미가 바로 모터 명령이 되지 않는다는 점이다. 중간에 장면과 몸을 고려한 행동 표현이 필요하다.

## 같은 지시도 몸에 따라 숫자가 달라진다

두 로봇에게 같은 “상자를 왼쪽 선반에 올려라”를 지시해도 팔의 길이와 관절 구조가 다르면 필요한 숫자는 달라진다. 따라서 VLA가 출력하는 행동은 특정 몸의 좌표계와 센서 구성에 연결되어 있을 수 있다.

이 사실은 행동 표현의 일반화가 왜 어려운지 보여 준다. 의미는 여러 몸에서 공유할 수 있지만, 실행 숫자는 몸의 제약에 맞춰 다시 해석되어야 한다. 다음 장에서는 이 숫자를 토큰처럼 다룰지, 연속 값으로 다룰지 살펴본다.

