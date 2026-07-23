---
title: "RT-Trajectory 읽기 — 말 대신 궤적을 그려 로봇에게 새 동작 가르치기"
date: 2026-07-23
draft: false
tags: ["Physical AI", "Robot Learning", "RT-Trajectory", "Task Generalization"]
categories: ["5부. 최전선 논문 읽기"]
book_weight: 90
book_chapter: "RT-Trajectory 읽기 — 궤적 스케치로 새 동작 가르치기"
---

구글 딥마인드가 ICLR 2024 Spotlight로 발표한 [RT-Trajectory](https://arxiv.org/abs/2311.01977)는 로봇에게 작업을 지시하는 표현 자체를 바꾼 논문이다. 한 줄 요약은 이렇다. **자연어 대신 카메라 영상 위에 로봇 팔의 이동 궤적을 대략 그려 주면, 같은 학습 데이터로도 이전에 보지 못한 작업에 훨씬 잘 일반화한다.**

논문이 제안하는 것은 더 큰 모델도, 더 많은 데이터도 아니다. 작업을 어떤 조건으로 표현하느냐가 로봇의 일반화 범위를 바꾼다는 주장이다.

## 자연어와 목표 이미지 사이의 빈자리

자연어는 목표를 전달하기에는 편리하다. "수건을 접어라", "의자를 돌려라"라고 말하면 사람은 무슨 뜻인지 곧바로 안다. 하지만 로봇 정책 입장에서 이 문장만으로는 팔이 어느 경로로 움직여야 하는지, 언제 물체를 잡고 놓아야 하는지 알기 어렵다.

학습 데이터에 pick-and-place 동작만 있다고 해보자. 팔의 움직임만 보면 수건 접기와 비슷한 부분이 있어도, 언어 공간에서 `fold towel`은 본 적 없는 명령이다. 언어 조건 정책은 이미 알고 있는 움직임을 새 작업에 재조합하지 못할 수 있다.

반대편에는 목표 이미지와 시연 영상이 있다. 이들은 말로 표현하기 어려운 상태를 보여 줄 수 있지만, 목표와 무관한 배경·조명·물체 배치까지 함께 담는다. 전체 영상을 조건으로 쓰면 정보량과 학습 비용도 커진다.

RT-Trajectory는 둘 사이의 중간 표현을 택한다. 카메라 영상 위에 **end-effector가 지나갈 선**을 그리고, **gripper가 물체를 잡거나 놓을 지점**을 원으로 표시한다. 작업의 핵심 동작은 구체적으로 알려 주되, 정확한 물체 위치와 자세에 맞춘 세부 제어는 학습된 정책에 맡기는 방식이다.

## 과거 시연에서 미래의 스케치를 만든다

이 접근의 실용적인 장점은 기존 로봇 시연을 그대로 재사용할 수 있다는 데 있다. 각 시연에는 시간에 따른 3차원 end-effector 위치가 기록되어 있다. 이를 카메라의 intrinsic·extrinsic parameter로 영상 평면에 투영하고 인접한 점을 선으로 연결하면, 사람이 따로 그리지 않아도 hindsight trajectory label을 만들 수 있다.

논문은 두 가지 표현을 비교한다.

| 표현 | 담고 있는 정보 |
|---|---|
| RT-Trajectory 2D | 2D 이동 경로, 시간의 진행 방향, grasp/release marker |
| RT-Trajectory 2.5D | 2D 정보 + 색상 채널로 표현한 end-effector 높이 |

시간 정보는 선의 색상 변화로 표현한다. gripper의 sensed joint position과 target joint position 차이를 이용해 물체와 상호작용하는 시점을 찾아 grasp와 release marker도 자동으로 붙인다. 2.5D 표현은 색상 채널 하나를 높이에 할당해, 영상에서 같은 위치로 보이지만 실제로는 위로 들어야 하는지 뒤쪽으로 밀어야 하는지 구분한다.

정책의 뼈대는 RT-1이다. 최근 6개 RGB 관측 각각에 trajectory sketch를 결합해 EfficientNet-B3 tokenizer로 처리하고, Transformer 기반 behavior cloning으로 다음 행동을 예측한다. 언어 명령은 입력하지 않으므로 원래 RT-1의 FiLM layer도 제거한다.

학습 때는 로봇 시연에서 자동 추출한 궤적을 쓰지만, 추론 때 입력을 만드는 방법은 다양하다.

- 사용자가 GUI에서 직접 그린 선과 grasp/release marker
- 1인칭 인간 시연 영상에서 추정한 손의 움직임
- LLM의 Code as Policies가 생성한 3D waypoint
- image-generation model이 만든 trajectory image

즉 RT-Trajectory는 하나의 정책 앞에 사람, 영상, LLM, 생성 모델을 모두 연결할 수 있는 **동작 인터페이스**이기도 하다.

## 같은 73K 시연, 달라진 일반화 범위

실험에는 Everyday Robots의 7-DoF arm과 2-finger gripper가 사용됐다. 학습 데이터는 RT-1의 실제 로봇 시연 약 73,000개로, 8개 manipulation skill과 542개 task를 포함한다.

평가는 학습에 없던 7개 스킬에서 이루어졌다. 과일을 새 용기에 넣기, 물체를 세운 뒤 옮기기, 서랍 안에서 물체 옮기기, 서랍 채우기, 의자 위 물체 집기, 수건 접기, 의자 돌리기처럼 기존 동작을 새 방식으로 조합하거나 새로운 높이·물체·작업 공간에 적응해야 하는 과제다. 총 64 trials의 결과는 다음과 같다.

| 정책 | 미학습 7개 스킬 전체 성공률 |
|---|---:|
| **RT-Trajectory 2.5D** | **67%** |
| **RT-Trajectory 2D** | **50%** |
| RT-1-Goal | 26% |
| RT-1 | 17% |
| RT-2 | 11% |

높이 정보의 효과가 특히 눈에 띈다. `Pick from Chair`는 2D 0%에서 2.5D 38%로, `Swivel Chair`는 0%에서 70%로 올랐다. 같은 2D 픽셀 위치라도 실제 로봇 팔이 어느 높이로 움직여야 하는지 구분할 수 있었기 때문이다. 다만 모든 작업에서 2.5D가 우세한 것은 아니다. `Restock Drawer`에서는 2D가 92%, 2.5D가 67%였다.

입력 방식이 달라져도 어느 정도 작동했다. 인간 영상에서 만든 sketch로 `Pick`은 94~100%, `Fold Towel`은 75%를 기록했다. 동일한 궤적을 직접 실행하는 IK planner는 각각 42%, 25%였다. 학습된 정책이 거친 궤적을 물체의 실제 위치와 방향에 맞춰 보정한 결과다.

반면 LLM waypoint를 입력한 실험에서 `Pick`은 RT-Trajectory 89%, IK planner 83%였지만, `Open Drawer`는 RT-Trajectory 60%, IK planner 71%였다. 학습 정책이 언제나 고전적인 planner보다 낫다는 뜻은 아니다. 장면 적응의 이점은 작업과 궤적 품질에 따라 달라진다.

## visual prompt가 여는 가능성과 남은 한계

이 논문에서 가장 흥미로운 개념은 **visual prompt engineering**이다. 로봇이 실패했을 때 데이터를 더 모아 재학습하는 대신, 궤적을 조금 다르게 그려 행동 모드를 바꿀 수 있다. LLM에 다른 문장을 입력해 결과를 개선하듯 로봇 정책에는 다른 이동 경로를 보여 주는 셈이다. 실제 실험에서도 높은 곳에 물체를 놓을 때 궤적의 중간 peak를 더 높게 그리자 성공하는 사례가 나타났다.

다만 결과를 해석할 때 몇 가지 조건을 기억해야 한다.

- 정량 평가는 특정 로봇 플랫폼, 미학습 7개 스킬, 총 64 trials에서 이루어졌다.
- 사람 sketch 평가는 held-out policy로 여러 prompt를 시험한 뒤 성공한 sketch를 저장하는 절차를 포함한다. 완전한 one-shot 입력 성공률은 아니다.
- 고정 camera와 stationary robot base를 가정한다. mobile manipulation과 whole-body control에는 그대로 적용할 수 없다.
- 2.5D도 완전한 3D pose가 아니다. end-effector orientation, force, compliance는 직접 표현하지 않는다.
- 장애물을 피해야 하는 구역이나 깨지기 쉬운 물체처럼 반드시 지켜야 할 spatial constraint를 별도로 지정할 수 없다.
- 이 실험에서 RT-2보다 높은 수치가 나왔다고 해서 RT-Trajectory가 모든 조건에서 RT-2보다 우수하다는 의미는 아니다.

그럼에도 RT-Trajectory가 던지는 메시지는 분명하다. 로봇의 일반화 능력은 모델과 데이터뿐 아니라 **작업을 표현하는 좌표계**에도 달려 있다. 언어는 의미를, 궤적은 움직임을 잘 표현한다. 다음 단계는 둘 중 하나를 고르는 것이 아니라 language condition과 trajectory condition을 결합해 의미 일반화와 동작 일반화를 함께 얻는 방향일 가능성이 크다.

프로젝트의 영상과 추가 사례는 [공식 페이지](https://rt-trajectory.github.io/)에서 확인할 수 있다.

## 한 줄 정리

RT-Trajectory는 로봇에게 목표를 말로만 설명하는 대신 움직임의 윤곽을 그려 줌으로써, 같은 시연 데이터 안에 숨어 있던 동작을 새로운 작업으로 재조합하게 만든다.
