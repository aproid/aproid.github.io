---
layout: post
title:  "Docker 컨테이너 멈추지 않게 하기"
date:   2023-09-04 15:46:00 +0900
category: [Programming]
thumbnail: 
comments: true
---
<span class="caps-en">D</span>ocker 프로젝트를 인수인계받을 때나 베이스 이미지를 파악할 때 유용한 커멘드 스니펫을 정리해 놓고자 한다.<!--more--> 주의할 점으로는 Dockerfile에 대한 이해가 있어야 되고 이미지 빌드 에러, **ENTRYPOINT** 존재 유무 등 글에서 다루지 않는 변수가 존재할 수 있다.

### 1. Dockerfile
```bash
CMD tail -f /dev/null
```

### 2. Command-Line Interface
```bash
> docker exec -it (컨테이너 이름 또는 ID) /bin/sh
```