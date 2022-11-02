---
layout: post
title:  "웹에서 Tensorflow를 활용한 농구 슈팅"
date:   2020-03-16 00:43:00
category: [Programming]
thumbnail: 
comments: true
---
<span class="caps">현</span>재 Tensorflow는 오픈소스 머신러닝 라이브러리 중 가장 많이 사용되는 추세인듯 합니다.
Tensorflow에서 제공하는 예제 중에서 Tensor Jam 이라는 프로젝트를 발견했는데 글이 재미있게 써있더군요.<!--more-->
간단하게 내용을 설명하자면 Unity로 만들어진 간단한 농구 게임에서 득점을 많이하는 모델을 만드는 것입니다.

재밌는 예제이지만 Unity라는 플랫폼은 무겁기도 하고 Prototyping에는 적합하지 않습니다. 
특히 이 프로젝트를 실험해보는 환경이 군 복무 중이였기 때문에 웹으로 컨버팅을 해보았습니다. 
Three.js와 Cannon.js를 연동하여 3D 엔진을 구현하였고 충돌감지의 정확성을 위해 **CCD(Continous Collision Detection)** 기법을 적용하였습니다.

컨버트된 Tensor Jam 프로젝트는 Github에 올려두었으니 도움이 되셨으면 좋겠습니다.

### Github : [Tensor Jam In Web][Github]

**출처**
: TF Jam — Shooting Hoops with Machine Learning. (2018). Retrieved from [Link][Source]
{:.ref}

[Github]: https://github.com/aproid/tf-jam-in-web
[Source]: https://medium.com/tensorflow/tf-jam-shooting-hoops-with-machine-learning-7a96e1236c32