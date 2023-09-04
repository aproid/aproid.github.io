---
layout: post
title:  "Spring Boot - Thymeleaf 재시작 없이 변경 사항 빠르게 확인하기"
date:   2022-12-12 10:25:00 +0900
category: [Programming]
thumbnail: 
comments: true
---
<span class="caps-en">S</span>pring Boot + Thymeleaf 조합을 공식적으로 밀고 있어서 많이 사용되는 것 같다.<!--more--> 하지만 코드가 많아지면 Spring Boot 시작 속도가 느려져서 HTML을 조금 수정하더라도 재기동하여 확인해야 하는 불편함이 있었다. Spring Framework 시절에는 Deploy 설정을 바꿔주면 새로고침만으로 적용되었지만 Spring Boot는 그런 가이드를 찾기가 어려웠다.

이번 글에서는 재시작 없이 Thymeleaf(HTML), Assets(Javascript, CSS) 변경 사항을 새로 고침으로 확인할 수 있는 방법을 정리하고자 한다.

{% include image.html url="spring-boot-initializr.png" caption="이번 글에서 사용한 Spring Boot 설정" alt="Spring Initializr" %}

## 적용 방법

필자는 Intellij IDEA Ultimate 사용하고 있기 때문에 `$PROJECT_DIR$` 이라는 프로젝트 루트 경로를 가진 변수가 설정되어 있다. Spring Tool Suite 또는 Eclipse 사용자라면 절대 경로를 사용하거나 IDE에서 제공하는 방법을 활용하면 된다.

첫 번째 방법: Program Arguments에 아래 내용 추가

```bash
--spring.thymeleaf.cache=false \
--spring.thymeleaf.prefix=file:///$PROJECT_DIR$/src/main/resources/templates/ \
--spring.web.resources.static-locations=file:///$PROJECT_DIR$/src/main/resources/static/
```

두 번째 방법: application.properties에 아래 내용 추가

```
spring.thymeleaf.cache=false
spring.thymeleaf.prefix=file:///$PROJECT_DIR$/src/main/resources/templates/
spring.web.resources.static-locations=file:///$PROJECT_DIR$/src/main/resources/static/
```

{% include image.html url="intellij-program-arguments.png" caption="Intellij IDEA에서 Program Arguments 설정하는 방법" alt="Intellij IDEA에서 Program Arguments 설정하는 방법" %}

## 동작 원리

기본 설정에서 Thymeleaf Template을 찾는 경로 접두사는 `classpath:/templates/` 이다. 이는 \*.jar 파일 안에 `BOOT-INF\classes` 폴더 경로 기반으로 찾겠다는 의미이고, 따라서 Gradle 기준으로 processResources 태스크를 다시 실행하거나 프로그램을 재시작해야 하는 이유이다.

위와 같은 기본 설정 대신에 `file://` 프로토콜을 사용하면 로컬 파일 경로에서 Thymeleaf Template을 찾게 된다. 이 경우 파일 변경 사항이 재시작 없이 새로고침만으로 적용 가능하다.

## 추가 적용 사항

지금 개발/운영하고 있는 플랫폼은 Thymeleaf, Assets 같은 정적 리소스를 별도의 모듈로 관리하고 다양한 서비스에서 참조하여 사용한다. 위 방법만으로는 분산된 정적 리소스를 모두 참조할 수 없기 때문에 오류가 발생하였다. 이에 따라서 **gulp.js**를 추가로 도입하여 정적 리소스를 합해서 특정 폴더에 모아놓도록 구성하고 위 방법을 변형하여 적용하여 해결하였다.