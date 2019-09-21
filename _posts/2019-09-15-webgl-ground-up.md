---
layout: post
title:  "WebGL 바닥부터 해보기"
date:   2019-09-15 22:41:00 +0900
category: [Programming]
thumbnail: 
comments: true
---
<span class="caps-en">W</span>ebGL를 사용하면서 three.js, Babylon.js를 시작으로 많이 접하게 됩니다. 
구조가 잘 잡힌 것도 있지만 편리하고 빠르게 프로젝트를 진행하는 데 의미가 있죠. 
하지만 아무것도 모르고 쓰는 것보다 내부 동작 원리를 파악하면 테크닉이 늘어나는 것이 사실입니다.

이번 글을 통해서 WebGL을 사용하는 가장 기초적인 방법에 관해서 설명하려고 합니다. 
또한 모든 그래픽 프로그래밍에서 중요시되는 쉐이더에 대한 내용도 다뤄보려고 합니다. 
가장 중요한 것은 이 모든 것을 하는데 라이브러리를 사용하지 않는 것에 있습니다.


## 구조 구상

코드의 전체적인 형태를 잡아보도록 하겠습니다.

전역 상수로 선언된 `WIDTH`, `HEIGHT` 를 우리의 Canvas 사이즈의 기초를 두겠습니다.

이어서 `initalize()` 함수를 초기화 함수로 지정하여 DOM을 전부 읽고, 준비된 상태가 됐을 때 실행합니다.

``` javascript
const WIDTH = 500;
const HEIGHT = 500;

function initalize() {
    // ...
}

document.addEventListener('DOMContentLoaded', function() {
    initalize();
}, false);
```


## Canvas 생성

WebGL의 출력을 담당하는 Canvas 엘리먼트를 생성하고 WebGL를 조작할 수 있는 Context를 가져옵니다.

저는 IE11 환경이므로 `experimental-webgl` 를 Context로 사용하였습니다.

``` javascript
function initalize() {
    var $canvas = document.createElement('canvas');
    $canvas.width = WIDTH;
    $canvas.height = HEIGHT;
    document.body.appendChild($canvas);
    
    var gl = $canvas.getContext('experimental-webgl');
}
```


## 그래픽 렌더링 파이프라인

{% include image.html url="opengl-pipeline.jpg" caption="OpenGL Pipeline" alt="OpenGL Pipeline" %}

쉐이더를 들어가기 전에 간단하게 렌더링 파이프라인을 이해할 필요가 있습니다.

이번 글에서는 버텍스(Vertex) 쉐이더와 프래그먼트(Fragment) 쉐이더를 집중적으로 보겠습니다. 

먼저 WebGL이라는 것은 사실상 이미지 레스터링 엔진이라 해도 될 정도로 단순한 역할만 해줍니다. 
우리는 단지 쉐이더라는 도구를 통해서 이 공간을 마구 그리고 칠하고를 할 수 있죠. 
간단하게 느낌으로만 보면 수학을 붓으로 두고 그림을 그리는 거라고 생각하시면 됩니다.

가장 먼저 보이는 것이 **{vertices}** 입니다. 
어려울 것도 없이 이것은 Javascript의 배열입니다. 
각 꼭짓점을 단순하게 배열 형식으로 표현할 뿐입니다.

바로 다음에 **Vertex Shader** 가 나옵니다. 
우리가 Javascript 배열을 통해 입력해준 꼭짓점을 Vertex Shader에서 변환하는 작업을 합니다. 
작업 결과물은 **Clip Space** 이란 좌표가 나오며 X, Y를 각각 -1.0 ~ 1.0 까지로 변환합니다. 
이것은 데카르트 좌표계와 똑같이 생겼다고 생각하시면 됩니다.

이후 만들어진 삼각형을 레스터화(Rasterizion) 시키고 색을 칠하는 데, 이때 **Fragment Shader** 가 나옵니다. 
각 픽셀마다 어떤 색을 표현할 것인가를 결정하는 쉐이더 입니다.

이 모든 과정을 거치면 우리 눈에 보이게 되는 것이지요.
이 일련의 행위를 모두 모아서 **Program** 이라고 합니다.


## 쉐이더와 프로그램 생성

HTML에 새로운 Script 엘리먼트를 만들어서 쉐이더를 따로 관리하도록 하겠습니다.

쉐이더를 프로그래밍 할 때 Script 엘리먼트 안에 프로그래밍 해주면 됩니다.

``` html
<script type="x-shader/x-vertex" id="VERTEX_SHADER"></script>
<script type="x-shader/x-fragment" id="FRAGMENT_SHADER"></script>
```

쉐이더를 Script 엘리먼트의 내용을 통해서 생성하겠습니다.

이 동작은 추후 확장성을 고려해서 함수로 만들어 두겠습니다.

``` javascript
function initalize() {
    ...
    
    var vertexShaderSource = document.getElementById('VERTEX_SHADER').text;
    var fragmentShaderSource = document.getElementById('FRAGMENT_SHADER').text;
    
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
}

function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    
    if(success) {
        return shader;
    }
    
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}
```

이제 버텍스 쉐이더와 프래그먼트 쉐이더를 하나의 프로그램(Program)으로 만들어야 합니다.

이 동작 또한 확장성을 고려해서 함수로 만들겠습니다.

``` javascript
function initalize() {
    ...
    
    var program = createProgram(gl, vertexShader, fragmentShader);
}

function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    
    if(success) {
        return program;
    }
    
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}
```

## 버퍼에 대해

WebGL에서 버퍼란 우리의 데이터를 GPU의 메모리에 적재시켜 명령어가 실행될 때 병렬처리될 수 있도록 데이터를 업로드하는 듯한 형태를 띱니다.

여기서 우리가 쉐이더에 사용할 버퍼 2개를 알아보도록 하겠습니다.

**Attribute** 버퍼는 이전에 언급했던 꼭짓점을 나타내는 버퍼로 하나의 연결된 배열을 일정 간격으로 나누어 1~4차원의 백터를 나타내는 특징이 있습니다. 
당연하게도 이 버퍼는 버텍스 쉐이더에서만 접근 가능합니다.

**Uniform** 버퍼는 Program 전체에서 접근 가능한 전역 상수 같은 역할을 합니다.

추가적으로 **Varying** 이 있는데 버퍼는 아니지만 버텍스에서 프래그먼트 쉐이더로 데이터를 전달하는 다리 같은 역할을 하는 변수입니다.


## 그려보기

이전에 구해왔던 Context를 가지고 Canvas 엘리먼트에 직접 그려보겠습니다.

먼저 영역 크기를 지정해주고 GPU의 색상을 담당하는 버퍼를 모두 초기화 시켜 우리가 설정한 배경으로 적용시킵니다.

이후에는 만들어 놨던 Program을 적용시켜 둡니다.

``` javascript
function initalize() {
    ...
    
    // Canvas 엘리먼트의 크기와 같게 영역 지정
    gl.viewport(0, 0, $canvas.width, $canvas.height);
    
    // 배경을 RGBA를 모두 0으로 설정하고 기존에 있던 모든 색 버퍼를 지우기
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // 우리가 만든 Program을 적용하기
    gl.useProgram(program);
}
```

한 번 빨간색 삼각형을 그려보도록 하겠습니다.

먼저 각 삼각형의 꼭짓점을 **Clip Space** 을 기준으로 하여 작성해봅시다.

이후 `vertices` 를 `a_position` 이라는 이름의 Attribute 버퍼에 올려보겠습니다.

여기서 `vertices` 의 값을 두 개씩 Float형으로 읽어서 총 3개의 꼭짓점이 생기는 것을 알 수 있습니다.

``` javascript
function initalize() {
    ...
    
    var vertices = [
         0,   1,
        -1,  -1,
         1,  -1
    ];
    
    setAttribute(gl, program, 'a_position', new Float32Array(vertices), 2, gl.FLOAT, false, 0, 0);
}

/**
 * Attribute 버퍼를 설정합니다.
 *
 * @param gl		
 * @param program	
 * @param name		버퍼의 이름입니다.
 * @param data		버퍼의 데이터입니다.
 * @param size		버퍼의 데이터를 몇 개 단위로 잘라낼 것인지 정합니다.
 * @param type		버퍼의 데이터의 자료형입니다.
 * @param normalize	버퍼의 데이터를 정규화 할것 인지 정합니다.
 * @param stride	버퍼의 데이터를 읽을 때 몇 개 단위로 읽을 지 정합니다.
 * @param offset	버퍼의 데이터를 읽을 때 어디서 부터 건너뛰고 읽을 지 정합니다.
 * 
 * @return position	버퍼의 위치입니다.
 * @return buffer	버퍼 객체입니다.
 */
function setAttribute(gl, program, name, data, size, type, normalize, stride, offset) {
    var position = gl.getAttribLocation(program, name);
    var buffer = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, size, type, normalize, stride, offset);
    
    return {
        position: position,
        buffer: buffer
    }
}
```

방금 설정한 꼭짓점(Vertices)를 화면에 출력해보겠습니다.

``` javascript
function initalize() {
    ...
    
    // 삼각형을, 0 번째 꼭짓점부터, 3 개의 꼭짓점을 그린다.
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}
```


## 쉐이더 작성하기

아마 꼭짓점을 출력을 해도 화면에는 아무것도 나오지 않을 것입니다.

왜냐하면 쉐이더 프로그램이 완전히 비어 있기 때문이죠.

맨 처음 만들어둔 쉐이더 Script 엘리먼트로 돌아가 보겠습니다.

버택스 쉐이더를 작성해 보겠습니다.

``` glsl
attribute vec2 a_position;

void main() {
    gl_Position = vec4(a_position, 0, 1);
}
```

아까 올려둔 버퍼 `a_position` 을 이용하여 `gl_Position` 이라는 전역변수에 값을 설정하고 있습니다.

여기서 할 말이 많은데, `gl_Position` 은 버택스 쉐이더가 최종적으로 어떤 위치에 점을 찍을 것인가를 정하는 변수입니다.

여기서 `gl_Position` 이 `vec4` 자료형인 것을 알 수 있는데 이는 3차원 백터 변환을 기준으로 디자인되었기 때문입니다.

그리고 심상치 않은 문장이 보이는데 `vec4(a_position, 0, 1)` 이것은 `vec4(a_position[0], a_position[1], 0, 1)` 와 같습니다.

이와 같이 모든 쉐이더는 GLSL(OpenGL Shading Language)으로 작성됩니다.

자세한 문법은 따로 글을 적도록 하겠습니다.

``` glsl
precision mediump float;

void main() {
    gl_FragColor = vec4(1, 0, 0, 1);
}
```

프래그먼트 쉐이더입니다.

`precision mediump float` 이 문장은 프래그먼트 쉐이더의 실수 정확도를 중간으로 맞추겠다는 의미입니다.

정확도에 대해서 더 알아보자면 `highp` 는 Vertex, `mediump` 는 Texture, `lowp` 는 Color를 사용한다고 합니다.

`gl_FragColor` 또한 프래그먼트 쉐이더가 한 픽셀의 RGBA를 정하는 변수입니다.

여기서는 빨간색으로 정해두도록 하겠습니다.

이제 출력해보도록 하겠습니다.

지금까지 잘 따라오셨다면 아래와 같이 빨간 삼각형이 보입니다.

{% include image.html url="result-1.png" caption="중간 결과물" alt="중간 결과물" %}


## 삼각형 색칠해보기

이번에는 삼각형을 알록달록하게 칠해보겠습니다.

먼저 프래그먼트 쉐이더의 비밀 하나를 알아보도록 하겠습니다.

프래그먼트 쉐이더는 각 꼭짓점에 따른 색을 받고 그 색 사이는 선형 보간법으로 채웁니다.

말로는 이해하기 힘들 테니 직접 만들어서 확인해보도록 하겠습니다.

먼저 각 꼭짓점에 대한 색을 프래그먼트 쉐이더에 넘겨주어야 하니 `varying` 변수를 사용할 때입니다.

각 꼭짓점마다 `a_color` 는 달라질 것이고 그것을 `varying` 변수로 프래그먼트 쉐이더에 넘겨줍니다.

``` javascript
function initalize() {
    ...
    
    var color = [
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
    ];
    
    setAttribute(gl, program, 'a_color', new Float32Array(color), 3, gl.FLOAT, false, 0, 0);
    
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}
```

``` glsl
// Vertex Shader
attribute vec2 a_position;
attribute vec3 a_color;

varying vec3 v_color;

void main() {
    v_color = a_color;
    
    gl_Position = vec4(a_position, 0, 1);
}
```

``` glsl
// Fragment Shader
precision mediump float;

varying vec3 v_color;

void main() {
    gl_FragColor = vec4(v_color, 1);
}
```

{% include image.html url="result-2.png" caption="최종 결과물" alt="최종 결과물" %}

각 꼭짓점에 빨강, 초록, 파랑을 넣은 결과입니다.

삼각형의 내부는 3가지의 색이 선형 보간을 이루고 있습니다.

따라서 알록달록한 색이 보이는 것입니다.


## 결론

생각보다 단순한 프로그램이지만 WebGL이 어떤 방식으로 화면에 렌더링을 하는 것인지 느낌을 받으셨으면 좋겠습니다.

우리가 접하는 OpenGL이 어떤 식으로 동작하는지 인지하는 것만으로 WebGL의 성능을 끌어올리는데 기여할 것이라고 생각합니다.

추후에는 선형변환을 통한 2D 이미지 조작, 3D 오브젝트 만들기와 같은 흥미로운 글로 돌아오겠습니다.

감사합니다.






**출처**
: WebGL Fundamentals. (2016). Retrieved from [Link][Source]
{:.ref}

[Source]: https://webglfundamentals.org/webgl/lessons/webgl-fundamentals.html