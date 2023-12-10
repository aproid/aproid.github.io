---
layout: post
title:  "AWS Industry Week 2023을 다녀오다"
date:   2023-12-10 14:13:00 +0900
category: [Programming]
thumbnail: 
comments: true
---
<span class="caps-en">때</span>는 회사에서 팀원분들과 점심 식사 후 커피 타임 때, 다 같이 모여서 테크 트렌드에 대해서 이야기하고 있었다. 당시 주제는 우리 팀이 Amazon Web Services(이하 AWS)를 활용하여 서비스를 개발/운영하고 있는데 과연 Best Practice에 맞게 가고 있는 것인지 대한 이야기였다. 열렬한 토론 중에 한 팀원분이 "이번에 AWS Industry Week 한다는데 가보면 좋을 것 같은데..." 라고 하시자마자 뇌가 번뜩였고, 점심시간이 끝나고 사무실에 복귀하자마자 컨퍼런스 참가 신청서를 작성해서 상신하였다.

신청서는 다행히도 승인되었다. 당시 프로젝트가 끝난 이후이기도 하고 시니어 분들이 운영 서비스를 봐주시는 덕분에 걱정 없이 다녀올 수 있었던 것 같다. 이런 과정 끝에 3명의 팀원과 같이 행사에 참가할 수 있었다.

{% include image.html url="aws-industry-week-agenda.png" caption="AWS Industry Week 2023 강연 목록" alt="AWS Industry Week 2023 강연 목록" %}

강연의 경우 팀 업무와 가장 연관성이 높은 리테일 분야를 전부 들었다. 만약 다음 연도에 가게 된다면 다른 분야 1~2개는 섞어서 들어도 재미있을 것 같다. 또한 우리 회사 고객사들도 몇몇 보여서 좀 신기한 감이 없잖아 있었다.

{% include image.html url="photo-1.png" caption="안내 배너" alt="안내 배너" %}
{% include image.html url="photo-2.png" caption="메인 포토존" alt="메인 포토존" %}

<figure class="article-image" markdown="0">
	<img src="{{ include.url | prepend: base_url }}/photo-3.png" alt="교보정보통신 부스">
	<img src="{{ include.url | prepend: base_url }}/photo-4.png" alt="하이테크 분야 부스">
	<img src="{{ include.url | prepend: base_url }}/photo-5.png" alt="하이테크 분야 부스">
	<figcaption>다양한 회사의 행사 부스</figcaption>
</figure>

{% include image.html url="photo-6.png" caption="통역기" alt="통역기" %}
{% include image.html url="photo-7.png" caption="오프닝 강연" alt="오프닝 강연" %}
{% include image.html url="photo-8.png" caption="리테일 분야 기술 트렌드 강연" alt="리테일 분야 기술 트렌드 강연" %}
{% include image.html url="photo-9.png" caption="점심 쿠폰" alt="점심 쿠폰" %}
{% include image.html url="photo-10.png" caption="알차게 준비된 점심 식사" alt="알차게 준비된 점심 식사" %}

<figure class="article-image" markdown="0">
	<img src="{{ include.url | prepend: base_url }}/photo-11.png" alt="이벤트 기반 아키텍처">
	<img src="{{ include.url | prepend: base_url }}/photo-12.png" alt="이벤트 기반 아키텍처를 위한 AWS 서비스 포트폴리오">
	<img src="{{ include.url | prepend: base_url }}/photo-13.png" alt="점진적 클라우드 이관 아키텍처">
	<img src="{{ include.url | prepend: base_url }}/photo-14.png" alt="오픈소스 기술 스택과 AWS 관리형 서비스 도입">
	<img src="{{ include.url | prepend: base_url }}/photo-15.png" alt="서비스 단위 리펙토링 - 쿠폰 서비스">
	<img src="{{ include.url | prepend: base_url }}/photo-16.png" alt="감사 인사">
	<figcaption>가장 인상 깊었던 강연 내용들</figcaption>
</figure>

강연의 내용은 너무 좋았다. 오프닝과 키노트 내용도 너무 좋았고, 다른 회사들이 어떻게 기술적 혁신을 이뤄나가고 있는지에 대해서 알아볼 수 있었다. 큰 맥락으로 봤을 때 생성형 AI의 가능성, 아키텍쳐 고도화, 데이터와 AI 접목을 통한 서비스 개선이 핵심 주제였던 것 같다.

무엇보다 가장 인상 깊었던 강연 마지막 사진과 같이 "클라우드에서는 손쉽게 기술을 사용할 수 있습니다. 보여줄 수 있는 가치에 집중하는 것이 새로운 기회를 만드는 것입니다." 라는 문구가 계속 생각났었다. 한 명의 개발자로서 아키텍처 고도화, 서비스 안정성 확보, 시스템 확장성 확보를 위해 끊임없는 공부와 적용하려는 노력도 중요하지만, 무엇보다 그러한 행위들을 통해서 고객에게 어떠한 가치를 제공할 수 있을 것인가?에 대한 생각을 계속하게 됐던 것 같다.

이번 행사를 통해서 **Over Engineering**에 대해서 다시 한 번 상기시킬 수 있었다. 우리 팀도 최신 기술 트렌드를 따라가기 위해서 여러 노력들을 하고 있다. 하지만 그러한 노력도 중요하지만, 노력의 방향성이 훨씬 중요하다는 것을 깨달을 수 있었다.

또한 생성형 AI의 강력함과 이 기술이 어떤 식으로 적용되어 앞으로 우리의 삶을 어떻게 변화시킬지에 대해서 알아보고, 우리 서비스에 접목한다면 어떻게 활용할 수 있을지 상상해 볼 수 있는 좋은 기회였다.