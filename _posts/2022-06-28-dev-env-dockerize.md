---
layout: post
title:  "개발 환경을 Dockerize 해본 경험"
date:   2022-06-28 16:06:00 +0900
category: [Programming]
thumbnail: 
comments: true
---
<span class="caps-en">D</span>ocker와 Kubernetes를 활용하여 배포를 관리하는 프로젝트에 참여하게 되었습니다. 
Docker가 무엇인지, Kubernetes가 무엇인지 정도만 알고 있었지만 실제로 운영해 보면서 많은 이점을 느꼈습니다. 
최근 Docker로 재미있는 토이 프로젝트를 해본 경험이 있어서 공유하고자 합니다.<!--more-->

제가 소속된 팀은 DevOps 형태를 띠고 있었지만 막상 인프라에 대한 지식을 가진 사람이 많지 않았습니다. 
심지어는 개발 환경마저도 새로 오신 분이 세팅하려면 최소 하루는 사용하는 불상사도 있었죠. 

위와 같은 이유로 개발 환경 자체를 Dockerize 해보면 어떨까라는 발상을 하게 되었고, 
그 결과 gulp.js와 같이 환경 설정이 까다로운 빌드 도구까지 도입해 볼 수 있게 되었습니다.

{% include image.html url="advantages.png" caption="README.md에 적어놓은 장점들" alt="Advantages" %}


## 네트워킹

가장 먼저 고민했던 것이 Container 사이의 네트워킹이었습니다.

로컬 개발 환경에서는 각 모듈끼리 `localhost` 로 통신을 했었고, 코드 변경을 피하고자 Wrapping Container를 만들게 되었습니다. 
또한 Remote Debugger를 연결하기 위한 포트도 따로 만들어서 열어주었습니다.

이렇게 구성했을 때 장ㆍ단점이 있었는데, 장점은 Host에서도 `localhost` 를 `host.docker.internal` 로 변경하지 않아도 된다는 것이고,
단점은 Wrapping Container가 내려가면 다른 컨테이너를 접근할 방법이 없다는 것이었습니다.

이번 환경에서는 Wrapping Container가 gulp.js 빌드도 지속적으로 담당하기에 필수 컨테이너라고 생각하여 이렇게 구성하게 되었습니다.

{% include image.html url="networking.png" caption="Docker 네트워크 구조도" alt="Docker 네트워크 구조도" %}


## 프로젝트 구조

두 번째로 고민했던 것이 Docker 안에 코드를 어떻게 쉽게 접근할까 이었습니다.

기존 로컬에 Java를 설치해서 하는 것이 더 편한 개발자분들도 계셨기 때문에 코드는 계속 쓸 수 있게 해드리면서, 
새로 오시는 분들은 Java나 Node.js를 설치하지 않아도 되게 하려고 했습니다.

먼저 Wrapping Container에 프로젝트 폴더와 빌드 환경(Gradle)을 만들어 놓고, Module Container은 단지 Jar을 실행할 수 있는 Docker 환경을 구성하였습니다.

그렇게 만들어진 Wrapping Container 안에 있는 프로젝트 폴더를 **remote(Remote Dev-Environment)** 폴더와 Volume으로 엮어서 소스 코드를 윈도우 환경에서 수정할 수 있게 하였습니다.

**Module Builder**들을 실행하면 Wrapping Container 안에서 Jar을 빌드를 하고, 윈도우에서 Image와 Container를 만들어서 실행시킵니다.

로컬 개발 환경이지만 운영, QA 데이터베이스로 연결하는 경우도 있어서 Spring Profile를 변경해주는 **Dockerfile**도 구성하였습니다.

{% include image.html url="structure.png" caption="프로젝트 구조도" alt="프로젝트 구조도" %}


## 시행착오

잘 구성되어 실행까지 잘 되었지만 문제가 발생하였습니다. 
바로 **빌드 속도 문제**였습니다.

Docker 내부에 파일을 Volume으로 연결하여 빌드 할 경우 빌드 시간이 10분까지 늘어나는 현상이 나타났었습니다. 
Docker에서 Volume으로 지정된 파일을 IO 할 때 Locking 방식을 사용하기 때문에 윈도우에서 계속 Lock을 잡고 있다는 메시지가 나왔었죠.

이걸 어떻게 해결할까 하다가 결국 찾은 방법은 `rsync` 였습니다.

빌드 시작 전에 `rsync` 을 통해서 Container 내부에 복사본을 만들고 복사본을 대상으로 빌드 하여 해결하였습니다.


## 결과

사내 Git 레포지토리에 배포가 되어 사용되고 있는 상태입니다.

gulp.js를 이용하여 멀티 모듈에서 Static Asset들을 Hot-Swapping 한다거나,
로컬에서 SonarQube를 직접 돌려볼 수 있있습니다.

README.md도 열심히 작성하여 다른 개발자분들도 쉽게 환경 구성을 할 수 있게 안내까지 해보았습니다.

{% include image.html url="result.png" caption="Dockerize 결과" alt="Dockerize 결과" %}


## 결론

최신 기술로 많이 떠오르고 있는 Docker를 팀 문화에 어떻게 접목해 볼까 하면서 진행한 프로젝트가 팀 개발 환경 통합까지 가게 된 장황한 이야기였습니다.

현재는 AWS Cloud9을 활용하여 IDE도 클라우드로 올려보려는 시도를 하면서 새로운 시행착오를 겪고 있습니다.

아직 Docker와 친숙하지 않은 팀이라 적응 과정이 필요하여 개발적으로나 커뮤니케이션적으로나 많은 배움이 있었던 것 같습니다.