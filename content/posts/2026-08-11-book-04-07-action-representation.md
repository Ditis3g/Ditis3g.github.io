---
title: "Action Token, 연속 행동, Diffusion과 Flow"
date: 2026-08-11
draft: false
tags: ["VLA", "Action Token", "Diffusion Policy", "Flow Matching"]
categories: ["4부. VLA — 의미를 행동으로 연결하다"]
book_weight: 270
book_chapter: "Action Token, 연속 행동, Diffusion과 Flow"
---

행동은 언어 토큰처럼 이산화할 수도 있고, 연속적인 값으로 직접 예측할 수도 있다. 이산 표현은 언어 모델과 연결하기 쉽지만 정밀한 움직임을 표현하는 데 한계가 생길 수 있다.

연속 행동은 관절이나 말단 위치를 직접 다루기 좋지만, 같은 목표로 가는 여러 경로를 평균 내면 어색한 행동이 될 수 있다. Diffusion이나 Flow 계열은 하나의 평균값이 아니라 가능한 행동의 분포를 생성하려는 접근이다.

어느 표현이 항상 최고인 것은 아니다. 작업의 정밀도, 행동의 다중성, 추론 속도, 데이터 규모에 따라 선택이 달라진다. 액션 표현은 구현 세부가 아니라 시스템 설계의 핵심 결정이다.

