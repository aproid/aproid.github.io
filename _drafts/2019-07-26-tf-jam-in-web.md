---
layout: post
title:  "웹에서 Tensorflow를 활용한 농구 슈팅"
date:   2019-07-26 22:34:00 +0900
category: [Programming]
thumbnail: 
comments: true
---
<span class="caps">현</span>재 Tensorflow는 오픈소스 머신러닝 라이브러리 중 가장 많이 사용되는 추세인듯 합니다. 
이번 글에서는 이 Tensorflow를 사용해서 간단한 농구 슈팅을 머신러닝 해보도록 하겠습니다. 
또한 어떤식으로 파이썬으로 머신러닝 된 모델을 웹에 적용할 수 있는지 총괄적으로 알아보도록 하겠습니다.

먼저 이 글에서는 최신 브라우저 기반으로 [ECMAScript 7][Async Support], [WebGL][WebGL Support]와 같은 웹 기술을 적용하여 설명합니다.
또한 필자는 군 복무 중 이므로 최대한 해상도를 낮추는 등 임의의 최적화 코드를 사용하였습니다.

완성된 모든 코드는 [Github][Github]에 게시되어 있습니다.

## 사용되는 도구 & 패키지 & 라이브러리

* [Python3][Python Download] : Tensorflow를 구동시킬 환경입니다.
	* tensorflow
	* tensorflow.js
	* numpy
	* pandas
	* shutil
* [Three.js][Three Download] : Javascript WebGL 라이브러리입니다. (CDN 사용)
* [Cannon.js][Cannon Download] : Javascript 3D 물리 엔진입니다. (CDN 사용)
* [Tensorflow.js][Tensorflow Download] : Javascript Tensorflow 라이브러리입니다.  (CDN 사용)

## 개발 목표

가상의 물리 공간에서 던지는 사람이 농구 골대에서 **'X'** 만큼 떨어져있을 때 얼마 만큼의 
**'Y'** 힘으로 농구공을 던져야 들어가는지 선형회귀로 해결한다.

## 웹개발 환경 준비하기

HTML 마크업을 준비해줍니다. 주의해야 할 사항은 컨테이너에 배경을 주는 것인데, 이는 추후 득점률을 
화면에 띄울때 Three.js 랜더링으로는 성능이 떨어지니 DOM 엘리먼트로 대체하여 성능을 올리기 위한 것입니다.

``` html
<!DOCTYPE html>
<html>
	<head>
		<title>TFJam</title>
		<style>
			* {
				margin: 0;
				padding: 0;
				box-sizing: border-box;
			}
			#CONTAINER {
				width: 800px;
				height: 600px;
				
				/* 컨테이너에 배경을 준다. */
				background: #A7DBD8;
			}
			#RENDER {
				position: relative;
				z-index: 1;
			}
            #INFO {
                position: absolute;
                top: 200px;
                left: 0;
                width: 800px;
                text-align: center;
                font-weight: 600;
                font-size: 50px;
                color: #3B8686;
                opacity: 0.5;
            }
		</style>
	</head>
	<body>
		<div id="CONTAINER">
			<div id="INFO"></div>
		</div>
		<!-- CDN를 통한 라이브러리 불러오기 -->
		<script src="https://cdnjs.cloudflare.com/ajax/libs/tensorflow/1.1.2/tf.min.js"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/cannon.js/0.6.2/cannon.min.js"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/105/three.min.js"></script>
		<!-- 우리가 사용할 JS 파일 -->
		<script src="js/app.js"></script>
	</body>
</html>
```

Javascript의 개발 루틴을 만들어 둡니다. Tensorflow.js, Cannon.js, Three.js의 초기화 함수를 각각 분리하여 작성합니다.

``` javascript
// 'console.log == dd', 편의를 위해...
window.dd = console.log.bind(console);

// DOM 엘리먼트 변수 선언
var $container = document.getElementById('CONTAINER');
var $info = document.getElementById('INFO');

/*
 * 전역변수 선언 공간
 */

// 시작 지점
(() => {
	initTensorflow();
	initCannon();
	initThree();
})();
 
function initTensorflow() {
	
}

function initCannon() {
	
}

function initThree() {
	
}
```

## Cannon.js 구성하기

Cannon.js는 Javascript로 만들어진 3D 물리 엔진입니다.

Cannon.js는 하나의 World에 모든 물체가 집약되어 있는 형태로 개발을 진행하겠습니다.

먼저, `world` 를 전역변수로 선언해줍니다.

``` javascript
var world;
```

이후 `world` 를 초기화 시켜주고 기본적인 바닥을 만들어줍니다. 이때 바닥의 크기는 무한입니다.

``` javascript
function initCannon() {
	// world 초기화
	world = new CANNON.World();
	world.quatNormalizeSkip = 0;
	world.quatNormalizeFast = false;
	world.defaultContactMaterial.contactEquationStiffness = 1e7;
	world.defaultContactMaterial.contactEquationRelaxation = 5;
	world.broadphase = new CANNON.NaiveBroadphase();
	world.gravity.set(0,-20,0);
	
	// 물리 계산 객체 초기화
	var solver = new CANNON.GSSolver();
	solver.iterations = 50;
	solver.tolerance = 0;
	world.solver = new CANNON.SplitSolver(solver);
	
	// 매질 추가
	var physicsMaterial = new CANNON.Material('slipperyMaterial');
	var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial, physicsMaterial, 0.0, 0.3);
	world.addContactMaterial(physicsContactMaterial);
	
	// 바닥 추가
	var groundShape = new CANNON.Plane(0);
	var groundBody = new CANNON.Body({ mass: 0 });
	groundBody.addShape(groundShape);
	groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
	world.add(groundBody);
}
```

## Three.js 구성하기

Three.js는 Javascript로 만들어진 3D WebGL 라이브러리입니다.

Three.js에서는 하나의 Scene에 Camera, Light, Element가 모두 집적되어 있는 형태로 개발하겠습니다.

먼저, 랜더링 사이즈( `RENDER_WIDTH`, `RENDER_HEIGHT` )를 전역상수로 선언해줍니다.

``` javascript
const RENDER_WIDTH = 800;
const RENDER_HEIGHT = 600;
```

카메라 객체 `camera`, Scene 객체 `scene`, 랜더링 객체 `renderer`, 빛( `directionalLight`, `ambient` )을 초기화 해줍니다.

Cannon.js와 관계없이 대략적인 바닥을 만들고, 랜더와 Cannon.js 프레임 루프를 위한 루프를 만들어줍니다.

앞으로 Three.js에서 Cannon.js의 모든 조작을 담당할 예정입니다. (코드를 심플하게 유지하기 위해서 캡슐화는 생략하겠습니다.)

``` javascript
function initThree() {
	var camera = new THREE.PerspectiveCamera(60, RENDER_WIDTH / RENDER_HEIGHT, 0.01, 1000);
	camera.position.set(0, 30, 80);
	
	var scene = new THREE.Scene();
	
	var ambient = new THREE.AmbientLight(0xFFFFFF);
	scene.add(ambient);
	
	var directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.2);
	directionalLight.position.set(-50, 100, 100);
	directionalLight.castShadow = true;
	directionalLight.shadow.mapSize.width = 1024;
	directionalLight.shadow.mapSize.height = 1024;
	directionalLight.shadow.camera = new THREE.OrthographicCamera(-100, 100, 100, -100, 0.5, 1000);
	scene.add(directionalLight);
	
	var planeGeometry = new THREE.PlaneGeometry(200, 200);
	var planeMaterial = new THREE.MeshLambertMaterial({color: 0xE0E4CC, side: THREE.FrontSide});
	var planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
	planeMesh.rotation.x = -Math.PI / 2;
	planeMesh.castShadow = true;
	planeMesh.receiveShadow = true;
	scene.add(planeMesh);
	
	var renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
	renderer.domElement.id = 'RENDER';
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.shadowMap.renderSingleSided = false;
	renderer.setSize(RENDER_WIDTH, RENDER_HEIGHT);
	$container.appendChild(renderer.domElement);
	
	var dt = 1/30; // Framerate 조절
	
	animate();
	
	function animate(t) {
		requestAnimationFrame(animate);
		
		world.step(dt);
		
		renderer.render(scene, camera);
	}
}
```

## 농구장 구성하기

간단한 샘플인 만큼 최대한 심플하게 농구장을 만들어보겠습니다.

{% include image.html url="stage.png" caption="간단하게 만들어진 농구장" alt="농구장" %}

농구공을 던지는 사람, **슈터**라 부르겠습니다. 슈터를 박스 형태로 만들어보겠습니다. `renderer` 선언 이전에 만들어주시면 되겠습니다.

특징을 잡아보자면 Cannon.js 박스의 `body` 의 크기는 Three.js에 절반인 것을 알 수 있습니다.

이것은 Cannon.js와 Three.js의 크기 정하는 것의 다른 점인데 Cannon.js는 물체 중앙에서의 거리를 받고 
Three.js는 물체 자체의 크기를 받기 때문입니다.

``` javascript
	...
	
	var boxHalfExtents = new CANNON.Vec3(2, 4, 2);
	var boxShape = new CANNON.Box(boxHalfExtents);
	var boxBody = new CANNON.Body({mass: 0});
	var boxGeometry = new THREE.BoxGeometry(boxHalfExtents.x * 2, boxHalfExtents.y * 2, boxHalfExtents.z * 2);
	var boxMaterial = new THREE.MeshLambertMaterial({color: 0xFA6900});
	var boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
	boxBody.position.set(0, boxHalfExtents.y, 0);
	boxMesh.position.set(0, boxHalfExtents.y, 0);
	boxBody.addShape(boxShape);
	boxMesh.castShadow = true;
	boxMesh.receiveShadow = true;
	world.add(boxBody);
	scene.add(boxMesh);
	
	...
```

Cannon.js와 Three.js를 연동시키 위해서 `animate()` 함수 안에서 `world.step(dt);` 다음 줄에 다음과 같이 코드를 넣어줍니다.

이 코드는 Cannon.js에서 변경되는 위치와 회전을 Three.js에 복사합니다.

``` javascript
		...
		
		boxMesh.position.copy(boxBody.position);
		boxMesh.quaternion.copy(boxBody.quaternion);
		
		...
```

다음으로 농구 골대를 만들어보겠습니다.

농구 골대는 모양이 슈터에 비해 복잡하므로 따로 함수를 만들어서 관리하도록 하겠습니다.

객체를 `renderer` 선언 이전에 만들어 주겠습니다.

``` javascript
	...
	
	var basket = createBasket();
	
	...
```

`createBasket()` 함수는 `animate()` 함수 뒤에 만들어주면 되겠군요.

``` javascript
	function createBasket() {
		var btmSize = new CANNON.Vec3(.35, 15, .35);
		var backSize = new CANNON.Vec3(.35, 5, 6);
		var sRingSize = new CANNON.Vec3(2, .7, .35);
		var fRingSize = new CANNON.Vec3(.35, .7, 2);
		
		var backTranslate = new CANNON.Vec3(0, btmSize.y + backSize.y, 0);
		var lRingTranslate = new CANNON.Vec3(-sRingSize.x, btmSize.y + backSize.y / 1.5, fRingSize.z);
		var rRingTranslate = new CANNON.Vec3(-sRingSize.x, btmSize.y + backSize.y / 1.5, -fRingSize.z);
		var fRingTranslate = new CANNON.Vec3(-sRingSize.x * 2, btmSize.y + backSize.y / 1.5, 0);
		
		var btmShape = new CANNON.Box(btmSize);
		var backShape = new CANNON.Box(backSize);
		var sRingShape = new CANNON.Box(sRingSize);
		var fRingShape = new CANNON.Box(fRingSize);
		
		var basketBody = new CANNON.Body({mass: 0});
		basketBody.addShape(btmShape);
		basketBody.addShape(backShape, backTranslate);
		basketBody.addShape(sRingShape, lRingTranslate);
		basketBody.addShape(sRingShape, rRingTranslate);
		basketBody.addShape(fRingShape, fRingTranslate);
		
		world.add(basketBody);
		
		var btmGeometry = new THREE.BoxGeometry(btmSize.x * 2, btmSize.y * 2, btmSize.z * 2);
		var backGeometry = new THREE.BoxGeometry(backSize.x * 2, backSize.y * 2, backSize.z * 2);
		var sRingGeometry = new THREE.BoxGeometry(sRingSize.x * 2, sRingSize.y * 2, sRingSize.z * 2);
		var fRingGeometry = new THREE.BoxGeometry(fRingSize.x * 2, fRingSize.y * 2, fRingSize.z * 2);
		backGeometry.translate(backTranslate.x, backTranslate.y, backTranslate.z);
		sRingGeometry.translate(lRingTranslate.x, lRingTranslate.y, lRingTranslate.z);
		fRingGeometry.translate(fRingTranslate.x, fRingTranslate.y, fRingTranslate.z);
		
		var ringMatrix = new THREE.Matrix4().makeTranslation(0, 0, -lRingTranslate.z * 2);
		
		var basketGeometry = new THREE.Geometry();
		basketGeometry.merge(btmGeometry);
		basketGeometry.merge(backGeometry);
		basketGeometry.merge(sRingGeometry);
		basketGeometry.merge(sRingGeometry, ringMatrix);
		basketGeometry.merge(fRingGeometry);
		
		var basketMaterial = new THREE.MeshLambertMaterial({color: 0x3B8686});
		
		var basketMesh = new THREE.Mesh(basketGeometry, basketMaterial);
		basketMesh.castShadow = true;
		basketMesh.receiveShadow = true;
		basketMesh.position.set(50, 0, 0);
		basketBody.position.set(50, 0, 0);
		
		scene.add(basketMesh);
		
		return {
			body: basketBody,
			geometry: basketGeometry,
			material: basketMaterial,
			mesh: basketMesh
		}
	}
```

농구 골대도 Three.js와 Cannon.js가 따로 나뉘어 있으니 연동시킵니다.

``` javascript
		...
		
		basket.mesh.position.copy(basket.body.position);
		basket.mesh.quaternion.copy(basket.body.quaternion);
		
		...
```

## 공 던지기

이제 농구장을 만들었으니 공을 던질 차례입니다.

위에 있는 슈터와 골대와 같이 공 또한 Three.js와 Cannon.js를 연동해야 하기 때문에 던지는 모든 공의 body와 mesh를 저장할 필요가 있습니다.

그리고 전체 던진 공 개수와 골인한 공의 개수를 기록할 필요가 있습니다.

따라서 전역변수로 `balls`, `totalCnt`, `goalCnt` 를 선언해줍니다.

``` javascript
var balls = [];

var totalCnt = 0;
var goalCnt = 0;
```

우리 컴퓨터의 메모리는 한정적이니 5초뒤 공이 사라지도록 만들겠습니다.

또한 던질 힘을 아직까진 예측하지 못하니 랜덤으로 줍니다.

함수를 `createBasket()` 함수 뒤에 만들어줍니다.

``` javascript
	function shootBall(originPosition, targetPosition) {
		var radius = 1.5;
		var arch = 0.5; // 포물선이 거리에 미치는 비율입니다.
		var dist = originPosition.distanceTo(targetPosition);
		var closeness = Math.min(10, dist) / 10; // 거리가 너무 짧을 때 힘의 양을 줄여줍니다.
		var dir = new THREE.Vector3().copy(targetPosition);
		dir.sub(originPosition);
		dir.normalize();
		
		var force = Math.random();
		
		var shape = new CANNON.Sphere(radius);
		var body = new CANNON.Body({mass: 1});
		body.addShape(shape);
		body.position.set(originPosition.x, 10, originPosition.z);
		body.velocity.set(dir.x * arch * closeness, force, dir.z * arch * closeness);
		body.velocity.scale(40, body.velocity);
		
		// 공의 던진 위치, 골대와 거리, 던진 힘, 골인 여부를 공에 기록합니다.
		body._position = new CANNON.Vec3().copy(body.position);
		body._force = force;
		body._dist = dist;
		body.isBall = true; // true: 공이 안 들어감, false: 공이 들어감
		
		world.add(body);
		
		var geometry = new THREE.SphereGeometry(radius, 32, 32);
		var material = new THREE.MeshLambertMaterial({color: 0xF38630});
		var mesh = new THREE.Mesh(geometry, material);
		mesh.castShadow = true;
		mesh.receiveShadow = true;
		
		scene.add(mesh);
		
		// 공의 body와 mesh를 balls에 담아줍니다.
		var id = balls.push([body, mesh]) - 1;
		
		// 5초 뒤 공을 삭제합니다.
		setTimeout(function() {
			var [body, mesh] = balls[id];
			
			world.remove(body);
			scene.remove(mesh);
			
			if(body.isBall) {
				totalCnt++;
			}
			
			delete balls[id];
		}, 5000);
	}
```

공의 모든 body와 mesh를 연동시키기 위해서 `animate()` 함수 안에 코드를 추가합니다.

``` javascript
		...

		for(var i in balls) {
			const [body, mesh] = balls[i];
			
			body.position.z = 0; // 공이 튀어서 옆으로 나가지 않도록 방지
			mesh.position.copy(body.position);
			mesh.quaternion.copy(body.quaternion);
		}
		
		...
```

공은 0.1초에 한 번씩 랜덤한 장소에서 던지도록 하겠습니다.

이를 위해 `animate()` 함수의 첫 파라메터를 이용할 수 있습니다.

``` javascript
	var pt = 0, ct = 0;
	
	...
	
	function animate(t) { // t: 첫 animate가 실행된 시점부터의 시간 차이 (단위: ms)
		...
		
		ct = Math.floor(t / 100);
		
		if(ct > pt) {
			pt = ct;
			
			boxBody.position.x = (Math.random() * 40) - 20;
			
			shootBall(boxBody.position, basket.body.position);
		}
		
		...
	}
```

공끼리 충돌하지 않도록 하기위해 충돌 그룹(Collision Group)을 설정해주겠습니다.

전역변수로 충돌 그룹 3개를 만들어줍니다. 각 충돌 그룹의 값은 2의 제곱 형태입니다.

3개를 만드는 이유는 공을 인식할 트리거를 위한 그룹들도 미리 만들어 두는 겁니다.

``` javascript
const COLLISION_GROUP1 = 1; // 기본값
const COLLISION_GROUP2 = 2; // 공 자체와 공에 충돌 될 물체 그룹
const COLLISION_GROUP3 = 4; // 추후 설명될 CCD를 위한 그룹
```

바닥, 골대, 공에 그룹을 지정해줍니다.

``` javascript
// initCannon()
groundBody.collisionFilterGroup = COLLISION_GROUP1 | COLLISION_GROUP2;

// createBasket()
sRingShape.collisionFilterGroup = COLLISION_GROUP1 | COLLISION_GROUP2 | COLLISION_GROUP3;
fRingShape.collisionFilterGroup = COLLISION_GROUP1 | COLLISION_GROUP2 | COLLISION_GROUP3;

...

basketBody.collisionFilterGroup = COLLISION_GROUP1 | COLLISION_GROUP2;

// shootBall()
body.collisionFilterMask = COLLISION_GROUP2;
```

## 골인 인식하기

골을 인식하기 위해서는 공이 통과하는 길목을 체크할 필요가 있습니다.

{% include image.html url="trigger.png" caption="초록색이 트리거 검은색이 골대" alt="트리거" %}

정말 대략적으로 그렸는데, 정확하게 설명하고 있습니다.

위, 아래로 인식해 주면서 공이 정확히 골대를 통과해야 인식되는 구조입니다.

`createBasket()` 함수를 확장하여 트리거를 만들어 보도록 하겠습니다.

``` javascript
		...

		var triggerShape = new CANNON.Box(new CANNON.Vec3(sRingSize.x - .35, .35, fRingSize.z - .35));
		var topTriggerTranslate = new CANNON.Vec3(-sRingSize.x, fRingTranslate.y + .35, 0);
		var btmTriggerTranslate = new CANNON.Vec3(-sRingSize.x, fRingTranslate.y - .7, 0);
		
		var topTriggerBody = new CANNON.Body({mass: 0});
		topTriggerBody.addShape(triggerShape, topTriggerTranslate);
		topTriggerBody.collisionResponse = 0;
		topTriggerBody.triggerName = 'rimTop';
		topTriggerBody.position = basketBody.position;
		topTriggerBody.collisionFilterGroup = COLLISION_GROUP2;
		topTriggerBody.addEventListener('collide', collideEvent, false);
		
		var btmTriggerBody = new CANNON.Body({mass: 0});
		btmTriggerBody.addShape(triggerShape, btmTriggerTranslate);
		btmTriggerBody.collisionResponse = 0;
		btmTriggerBody.triggerName = 'rimBtm';
		btmTriggerBody.position = basketBody.position;
		btmTriggerBody.collisionFilterGroup = COLLISION_GROUP2;
		btmTriggerBody.addEventListener('collide', collideEvent, false);
		
		...
		
		world.add(topTriggerBody);
		world.add(btmTriggerBody);
		
		...
```

공이 충돌 될때 호출될 함수입니다.

``` javascript
	function collideEvent(e) {
		collideBall(e.body, this.triggerName);
	}
	
	function collideBall(body, type) {
		if(body.isBall) {
			if(type === 'rimTop') {
				body.isPassedTop = true;
			} else if(body.isPassedTop) {
				body.isBall = false;
				body.isPassedTop = false;
				
				totalCnt++;
				goalCnt++;
			}
		}
	}
```

골인한 공의 색을 다르게 만들게 위해서 프레임 루프의 공 물리엔진 동기화 부분에 다음 코드를 넣어줍니다.

``` javascript
			...
			
			mesh.material.color.setHex(body.isBall ? 0xF38630 : 0xA8DBA8);
```

## Continous Collision Detection

지금 까지 코드로 작동시켜보면 잘 되는 듯 보입니다.

하지만 성능이 낮은 기기에서 작동시킬 경우에 프레임 드랍이 발생하고

이것으로 인해 인식률이 낮아지게 됩니다.

이것을 **터널링(Tunneling)**이라고 합니다.

{% include image.html url="ccd.png" caption="Raytracing을 이용한 CCD" alt="CCD" %}

터널링을 방지하기 위해서 **지속적인 충돌감지(Continous Collision Detection, CCD)** 기법이 사용됩니다.

우리는 여기서 다음 이동할 거리, 즉 가속도(velocity) 크기 만큼 Raytracing하여 충돌감지를 해보겠습니다.

공 물리엔진 동기화 부분에 다음 코드를 넣어서 CCD를 간단하게 구현할 수 있습니다.

``` javascript
			...
			
			if(body.isBall) {
				var velocity = body.velocity.clone().mult(dt);
				var current = body.position;
				var next = body.position.clone().vadd(velocity);
				
				var ray = new CANNON.Ray(current, next);
				ray._updateDirection();
				ray.checkCollisionResponse = false;
				ray.collisionFilterMask = COLLISION_GROUP3;
				ray.intersectBody(basket.body);
				
				if(!ray.result.hasHit) {
					ray.collisionFilterMask = -1;
					
					for(var i in basket.triggers) {
						ray.result.reset();
						ray.intersectBody(basket.triggers[i]);
						
						if(ray.result.hasHit) {
							collideBall(body, ray.result.body.triggerName);
						}
					}
				}
			}
			
			...
```

여기서 핵심은 골대의 림(Rim) 부분을 통과하여 인식하지 않도록 방지해주는 것입니다.

만약 통과하여 인식한다면 림에 튕겨져 나갔는데 골인으로 인식할 수 있는 문제점이 있습니다.

## 득점률 표시하기

먼저 만들어 두었던 `#INFO` 엘리먼트를 사용하여 만들어 보겠습니다.

호출하기 편하도록 `updateInfo()` 라는 이름의 함수로 관리하도록 하겠습니다.

``` javascript
	function updateInfo() {
		var ratio = goalCnt / totalCnt;
		var rounded = Math.round(ratio * 10000) / 100; // 소수점 두 번째 자리에서 끊기
		
		$info.innerText = rounded + '%';
	}
```

이 함수를 **공이 사라질 때**, **골인 할 때** 넣어줍니다.

``` javascript
// shootBall()
		setTimeout(function() {
			...
			
			updateInfo();
			
			...
		}, 5000);
		
// collideBall()
		if(body.isBall) {
			if(type === 'rimTop') {
				...
			} else if(body.isPassedTop) {
				...
				
				updateInfo();
			}
		}
```

## 골인 데이터 CSV로 추출

여기까지 따라오셨다면 공을 던지고 인식하고 득점률이 어느정도 인지 확인이 가능합니다.

{% include image.html url="stage_complete.png" caption="완성된 농구장" alt="완성된 농구장" %}

하지만 득점률이 형편이 없습니다.

이것을 Tensorflow를 이용하여 해결하기 위해서 데이터를 수집해야 합니다.

그 데이터를 출력하는 함수를 만들어 보겠습니다.

그 전에 데이터를 담아둘 전역변수를 선언합니다.

``` javascript
var tfData = [];
```

골인한 공만 추출하여 거리(X)와 던지는 힘(Y)를 전역변수에 넣습니다.

``` javascript
// collideBall()
		if(body.isBall) {
			if(type === 'rimTop') {
				...
			} else if(body.isPassedTop) {
				...
				
				tfData.push([
					body._force, // Y
					body._dist   // X
				]);
				
				...
			}
		}
```

이후 CSV 형식으로 데이터를 가공하여 콘솔에 출력합니다.

사용하기 편하도록 window 객체에 등록하여 전역함수로 만듭니다.

``` javascript
	window.exportResult = exportResult;
	
	...

	function exportResult(offset=0) { // `offset` 을 이용하여 시작 id를 지정합니다.
		var result = ['id', 'power', 'dist'].join(',') + '\n';
		
		result += tfData.map((cur, idx) => {
			return (offset + idx) + ',' + cur.join(',') + '\n';
		}).join('');
		
		console.info(result);
	}
```

이제 콘솔에 `exportResult()` 로 함수를 호출하면 골인한 공의 데이터가 출력됩니다.

이 CSV 데이터를 **'tfjam.csv'** 이름으로 저장해둡시다.




**출처**
: TF Jam — Shooting Hoops with Machine Learning. (2018). Retrieved from [Link][Source]
{:.ref}

[Async Support]: https://caniuse.com/#search=await
[WebGL Support]: https://caniuse.com/#search=webgl
[Source]: https://medium.com/tensorflow/tf-jam-shooting-hoops-with-machine-learning-7a96e1236c32
[Github]: https://github.com/aproid/tf-jam-in-web
[Python Download]: https://www.python.org/downloads/
[Three Download]: https://threejs.org/
[Cannon Download]: https://schteppe.github.io/cannon.js/
[Tensorflow Download]: https://www.tensorflow.org/js/tutorials/setup