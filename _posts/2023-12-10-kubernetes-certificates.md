---
layout: post
title:  "Kubernetes 자격 취득 후기 (CKA, CKAD)"
date:   2023-12-10 15:30:00 +0900
category: [Programming]
thumbnail: 
comments: true
---
<span class="caps-en">한</span>달에 준비 끝에 Certified Kubernetes Administrator(이하 CKA), Certified Kubernetes Application Developer(이하 CKAD) 자격을 취득하였다. 해당 자격을 준비하는 분들을 위해서 여러 정보를 정리해 놓고자 한다.

필자는 팀에서 Junior Technical Architect, Junior Application Architect 포지션을 부여받아서 일하고 있다. 업무 중에 가장 큰 비중을 차지하는 것이 중규모 Amazon Elastic Kubernetes Service(이하 Amazon EKS) 클러스터 운영 및 사내 Private Cloud 내에서 자체 Kubernetes 클러스터 구축/운영 및 레거시 서비스 이관이다.

처음 입사하였을 때는 Kubernetes 관련 지식이 없었지만, 2년이라는 세월 동안 동고동락을 함께 해오며 어느 정도 활용할 수 있게 되었다. 하지만 Job, CronJob, LimitRange 같은 업무에서 잘 사용하지 않는 리소스에 대해서 많이 모르기도 하였고 On-Premise, Private Cloud와 같은 환경에서 구축할 때는 세부 아키텍처 잘 몰라서 트러블 슈팅이 어렵기도 하였다.

따라서 어디 가서라도 "나 Kubernetes 해봤다!" 라고 당당하게 말할 수 있는 자신감과 이 말에 대한 신뢰성을 얻기 위해서 CKA, CKAD 자격을 준비하며 세부적인 아키텍처와 기능들에 대해서 공부하였다.

{% include image.html url="udemy.png" caption="수강한 Udemy 강의" alt="수강한 Udemy 강의" %}
{% include image.html url="udemy-certificate.jpg" caption="수료증" alt="수료증" %}

이번 준비 과정에서 제일 많은 도움이 된 것이 바로 Mumshad Mannambeth의 **Certified Kubernetes Administrator (CKA) with Practice Tests** 강의이다. [Udemy][Udemy]를 통해서 수강하였으며 강의 수준은 Infrastructure, Programming Language의 기초만 알고 있어도 이해 가능할 것 같다.

하지만 강사가 영어로 말하기 때문에 영어에 약한 사람이라면 조금 힘들 수 있다. 자막을 제공하긴 하지만 자동 번역 수준이라서 몇몇 부분들은 이해가 어려울 수 있다. 필자의 경우 원문 자막을 모두 Notion에 한글 변역해 가면서 공부하였었다.

<figure class="article-image" markdown="0">
	<img src="{{ include.url | prepend: base_url }}/notion-1.png" alt="전체 항목">
	<img src="{{ include.url | prepend: base_url }}/notion-2.png" alt="상세 내용">
	<figcaption>Notion에 작성한 공부 내용</figcaption>
</figure>

Notion에 작성해 가면서 공부하니 강의 끝에 가서도 이전 섹션 내용들이 잘 기억이 나고, 추후에 다른 팀원분도 CKA 자격에 도전해 보겠다고 하셔서 전달드리는 등 여러모로 이점이 많았다. 근 시일 내에 내용들을 좀 더 가다듬어서 이 블로그에 하나씩 개시해 볼 생각이다.

강의를 수료할 때쯤 Cyber Monday 50% 할인이 진행 중이어서 바로 CKA, CKAD 시험을 결재하였다. 평소에도 10~30% 할인 쿠폰은 많으니 구글링을 통해서 적용해 보는 것을 추천한다.

{% include image.html url="cyber-monday.png" caption="Linux Foundation Cyber Monday 2023 할인" alt="Linux Foundation Cyber Monday 2023 할인" %}

시험을 결제하고 나니 killer.sh 시험 시뮬레이터를 자격당 2개씩 총 4개 세션을 무료로 받았다. 문제 난이도는 듣던 데로 악랄하였지만 시험 환경과 거의 80%는 유사하고 문제 유형도 실제 시험과 비슷해서 한 번씩은 해보는 것을 추천한다.

{% include image.html url="killersh.png" caption="killer.sh 시험 시뮬레이터" alt="killer.sh 시험 시뮬레이터" %}

시험 응시에 여권, 웹캠, 마이크를 준비하였어야 됐고 감독관이 주변 환경을 점검한 후에 시험이 시작되었다. 시험 환경은 killer.sh 보다 원활했고 문제도 비교적 많이 친절하여 쉽게 풀 수 있었다.

위와 같은 모든 과정을 거친 후 일주일 텀을 두고 시험을 총 2차례 응시하였고 CKA는 92점, CKAD는 89점으로 합격하였다 (커트라인은 66점이다). 자격 취득일은 2023년 12월이었고 만료일은 2026년 12월으로 총 3년이다.

{% include image.html url="cka.png" caption="CKA 자격증" alt="CKA 자격증" %}
{% include image.html url="ckad.png" caption="CKAD 자격증" alt="CKAD 자격증" %}

정리하고 보니 꽤나 복잡하고 힘든 과정이었지만 커리어 발전에 첫걸음을 뗀 것 같아서 너무 기뻤다. 무엇보다 지금까지 해온 업무들에 대해서 스스로 되돌아보고 검증해 볼 수 있는 기회였고, 팀에 도입했던 Apache Kafka, Elastic Stack 또한 관련 자격을 따보자는 새로운 목표도 생겼다.

만약 Kubernetes 관련 업무를 담당하고 있다면 해당 자격을 취득하는 것을 적극 권장하는 바이며, Kubernetes 관련된 다양한 글로 다시 돌아오도록 하겠다.

**P.S.** 자격 취득에 총 55만 원 정도가 들었다. 적은 금액은 아니니 최대한 회사 지원을 받는 것을 추천한다.

[Udemy]: https://www.udemy.com/course/certified-kubernetes-administrator-with-practice-tests/