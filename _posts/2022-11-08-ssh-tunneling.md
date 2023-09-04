---
layout: post
title:  "SSH와 SCP 명령어에서 프록시를 사용하는 방법"
date:   2022-11-08 15:30:00 +0900
category: [Programming]
thumbnail: 
comments: true
---
<span class="caps">A</span>WS를 운영하다 보면 일명 배스천(Bastion) 호스트를 만들게 된다.<!--more--> 따라서 프라이빗 서브넷에 있는 컨테이너에 접속할 때 점프 호스트가 필요하거나, 터널링이 필요한 상황이 많이 발생하게 된다.<!--more--> 이번 글에서는 SSH와 SCP 명령어를 사용할 때 설정 파일 변경 없이 간단하게 점프 호스트이나 터널링 하는 방법을 정리하고자 한다.

## 상황
{% include image.html url="situation.png" caption="① C 호스트의 SFTP에 접속하려는 상황<br>② B 호스트에서 파일을 가져오려는 상황" alt="상황" %}

첫 번째 상황은 C 호스트의 SFTP 방화벽이 B 호스트에만 허용이 되어 있어서 터널링이 필요한 상황이다.

두 번째 상황은 A 호스트를 통해서만 접속 가능한 B 호스트에서 파일을 가져오려는 상황이다.

## 명령어 구성
```bash
# 첫 번째 상황
> ssh -o ProxyCommand="ssh (A Destination) -i (A *.pem) -W %h:%p" -i (B *.pem) -L (Local Port):(C Destination):(C Port) (B Destination)

# 두 번째 상황
> scp -o ProxyCommand="ssh (A Destination) -i (A *.pem) -W %h:%p" -i (B *.pem) -r (B Destination):(B Path) (Local Path)
```