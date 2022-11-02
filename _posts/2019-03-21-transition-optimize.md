---
layout: post
title:  "CSS Transition 성능 최적화"
date:   2019-03-21 22:33:00 +0900
category: [Programming]
thumbnail: 
comments: true
---
<span class="caps-en">C</span>SS3의 강력한 기능중 하나인 Transition, 
하지만 대부분의 개발자는 Transition 사용의 주의점을 알지 못하고 사용하여 모바일같은 성능이 좋지 못한 기기에서 부드러운 효과를 보지 못하는 경우가 자주 보입니다. 
이번 포스트에서는 Transition의 올바른 사용방법을 통해 성능을 향상시켜보도록 하겠습니다.<!--more-->

## 스타일 적용 순서 이해하기
웹브라우저가 HTML, CSS를 로드를 마친 후 CSS 속성은 4단계를 거치게 됩니다. 
이는 Critical Rendering Path의 일부분인데 더 자세한 내용은 [Google Developers][Google Guide]를 참고하시기 바랍니다. 
각 과정에 있는 표는 그 과정에서 계산되는 속성입니다. **단, 브라우저마다 다를 수 있습니다.**

### 1. Styles
브라우저가 객체에 적용할 스타일의 값을 계산, 재계산합니다.

### 2. Layout
브라우저가 객체의 모양과 위치를 생성합니다.

<div class="article-table">
| position | display | overflow | overflow-y |
| width | height | min-width | min-height |
| padding | margin | border | border-width |
| top | bottom | left | right |
| font | font-family | font-size | font-weight |
| white-space | line-height | vertical-align | float |
| clear | | |
{:.u-oneline}
</div>

### 3. Paint
브라우저가 객체 영역의 픽셀들을 채웁니다.

<div class="article-table">
| color | background | visibility | text-deocration |
| background-image | background-position | background-repeat | background-size |
| outline | outline-color | outline-style | outline-width |
| border-radius | border-style | box-shadow | |
{:.u-oneline}
</div>

### 4. Composite
브라우저가 레이어(z-index) 순서대로 객채를 화면에 그려냅니다.

<div class="article-table">
| transform | opacity |
{:.u-oneline}
</div>

## Transition 성능 향상의 원리
위 순서에 따르면 'Layout' 속성을 바꾸면 'Paint', 'Composite' 순서를 거치기 때문에 성능 저하가 일어납니다. 이를 **Reflow**라고 합니다.<br>
또한 'Paint' 속성을 바꾸면 'Composite' 순서를 거치기 때문에 성능 저하가 일어납니다. 이를 **Repaint**라고 합니다.

따라서 성능을 최대로 발휘하려면 'Composite' 속성만 바꾸는 것이 최고의 방법입니다.
다음 HTML & JS 코드기준으로 알아보도록 하겠습니다.

``` html
<!-- .menu가 활성화 될 때, .wrap객체에 .menu-wrap클레스가 추가됨 -->
<div class="wrap">
	<div class="menu"></div>
	<div class="header">
		<div class="menu-toggler"></div>
	</div>
</div>
```
``` javascript
var $toggler = document.querySelector('.menu-toggler');
$toggler.addEventListener('click', toggle, false);

function toggle() {
	var $wrap = document.querySelector('.wrap');
	if($wrap.classList.contains('menu-open')) {
		$wrap.classList.add('menu-open');
	} else {
		$wrap.classList.remove('menu-open');
	}
}
```
#### BAD
``` css
.menu {
	left: -300px;
	transition: left 300ms linear;
}

.menu-open .menu {
	left: 0px;
}
```
#### GOOD
``` css
.menu {
	-webkit-transform: translateX(-100%);
		transform: translateX(-100%);
	transition: transform 300ms linear;
}
.menu-open .menu {
	-webkit-transform: none;
		transform: none;
}
```

## GPU가속 이용하기
GPU가속을 이용하여 애니메이션의 프레임을 최대로 끌어올릴 수 있습니다.
이를 위해 `will-change` 속성을 사용하는데 [브라우저 호환성][Will Change Support]와 [주의점][Will Change Knowledge]을 꼭 참고하시길 바랍니다.

``` css
.app-menu {
	-webkit-transform: translateX(-100%);
		transform: translateX(-100%);
	transition: transform 300ms linear;
	will-change: transform;
}
```

## HTML 최적화 하기
이전 HTML코드는 `.wrap` 객체에 클레스를 추가하여 사용하였는데 이는 `.content` 객체 등 자식요소에 DOM Tree를 변경하는 성능 저하를 유발합니다.
또한 `will-change` 속성은 애니메이션이 종료되었을 때 속성 제거를 해주는 것을 권장하고 있습니다.
다음 HTML와 CSS는 Transition의 성능을 최대로 사용한 예제가 되겠습니다.

``` html
<div class="menu"></div>
<div class="wrap">
	<div class="header">
		<div class="menu-toggler"></div>
	</div>
</div>
```
``` javascript
var $menu = document.querySelector('.menu');
$menu.addEventListener('transitionend', OnTransitionEnd, false);

var $toggler = document.querySelector('.menu-toggler');
$toggler.addEventListener('click', toggle, false);

function toggle() {
	$menu.classList.add('menu-animatable');
	if(!$menu.classList.contains('menu-visible')) {
		$menu.classList.add('menu-visible');
	} else {
		$menu.classList.remove('menu-visible');
	}
}

function OnTransitionEnd() {
	$menu.classList.remove("menu-animatable");
}
```
``` css
.menu {
	-webkit-transform: translateX(-100%);
		transform: translateX(-100%);
	will-change: transform;
}
.menu-animatable {
	transition: transform 300ms linear;
}
.menu-visible {
	-webkit-transform: none;
		transform: none;
}
.menu-visible:not(.menu-animatable) {
	will-change: auto;
}
```

**출처**
: Smooth as Butter: Achieving 60 FPS Animations with CSS3. (2019). Retrieved from [Link][Source]
{:.ref}

[Google Guide]: https://developers.google.com/web/fundamentals/performance/critical-rendering-path/?hl=ko
[Will Change Support]: https://caniuse.com/#search=will-change
[Will Change Knowledge]: https://dev.opera.com/articles/ko/css-will-change-property/
[Source]: https://medium.com/outsystems-experts/how-to-achieve-60-fps-animations-with-css3-db7b98610108