---
layout: post
title:  "Kubernetes Pod에서 Java Heap Dump 추출하기"
date:   2022-11-02 14:00:00 +0900
category: [Programming]
thumbnail: 
comments: true
---
<span class="caps">어</span>느 날 팀에서 운영 중인 Spring Boot 서비스에서 **java.lang.OutOfMemoryError** 오류가 발생하였다.<!--more-->
우리 팀은 AWS Elastic Kubernetes Service를 사용 중이었고 Docker 이미지는 `openjdk:8-jre-slim` 기반으로 빌드하고 있었다. JRE 환경을 쓰고 있어서 **jmap** 커멘드가 없기도 하고 APT 패키지 매니저의 레포지토리 등록이 안 되어 있어서 다양한 설정을 해주었어야 했다.

이번 글에서는 위와 같은 환경에서 Java Heap Dump를 추출하는 방법을 요약해서 남겨두려고 한다.
주의 사항으로는 Pod 안에 접속을 하기 때문에 [kubectl] 이 준비되어 있어야 하겠고, Debian 기준이기 때문에 리눅스 종류에 따라서 다르게 대응해야 할 수도 있다.

```bash
# Pod 목록을 조회한다
> kubectl get pods -n (Namespace)

# Pod 안에 Bash 쉘을 열고 stdin을 연결한다
$ kubectl exec -n (Namespace) -it (Pod 이름) -- bash

# APT 패키지 매니저에 레포지토리를 등록한다
$ echo "deb http://deb.debian.org/debian/ sid main" >> /etc/apt/sources.list
$ apt update

# JDK를 설치한다
$ apt install -y openjdk-8-jdk

# 실행중인 프로그램에 PID를 조회한다
$ jps

# Heap Dump를 생성한다
$ jmap -dump:format=b,file=heapdump.hprof (PID)
$ exit

# Pod 안에 생성된 Heap Dump를 복사해 온다
> kubectl cp -n (Namespace) (Pod 이름):/heapdump.hprof heapdump.hprof
```

추출된 `heapdump.hprof` 파일은 [Eclipse Memory Analyzer]으로 열거나, Intellij IDEA에서 열 수 있다 (개인적으로 Eclipse Memory Analyzer가 더 좋았다). 남은 것은 Stacktrace를 쫓아가서 원인을 제거하는 것뿐이다.

{% include image.html url="result.png" caption="MyBatis 결과 데이터가 너무 많아서 오류 발생하였음" alt="분석 리포트" %}

[kubectl]: https://kubernetes.io/docs/tasks/tools/#kubectl
[Eclipse Memory Analyzer]: https://www.eclipse.org/mat/downloads.php