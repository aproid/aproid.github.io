---
layout: post
title:  "VirtualBox 속도 향상 방법 (feat. WSL2)"
date:   2023-07-17 14:52:00 +0900
category: [Programming]
thumbnail: 
comments: true
---
<span class="caps-en">V</span>irtualBox는 오픈소스 계열에서 가장 유명한 가상화 소프트웨어로 필자가 자주 사용하는 **하이퍼바이저**이다. 최근 WSL2가 유명세를 타면서 점차 인지도가 떨어져서 모습이 자주 보이지는 않지만 아직 서버 구축 테스트, 네트워킹 테스트에서는 사용하게 된다. 하지만 WSL2를 활성화하면 VirtualBox의 속도가 엄청나게 느려지는데 해결 방법을 정리해서 남기고자 한다.

## 해결 방법

### 1. 하드웨어 가상화 활성화
만약 WSL2를 설치한 경우라면 되어 있겠지만 등잔 밑이 어두운 법, 가장 기본적인 사항이라 짚고 넘어가 본다. 가상화는 하드웨어로부터 시작한다. AMD-V, VT-x 기술들이 하드웨어 가상화이며 VirtualBox, Hyper-V(WSL2)는 해당 기술 사용하는 하이퍼바이저이다.

따라서 자신이 사용하는 하드웨어가 가상화를 지원하는지 먼저 확인하여야 하며, **BIOS에서 가상화 기능을 활성화**해야 한다. 하드웨어 가상화 활성화 여부는 작업 관리자의 성능 탭에서 확인하거나 [SecurAble][SecurAble] 프로그램을 통해서 확인 가능하다.

{% include image.html url="chipset-spec.png" caption="내가 사용하는 i5-1135G7 칩셋 사양" alt="i5-1135G7 칩셋 사양" %}

{% include image.html url="task-manager.png" caption="작업 관리자로 가상화 활성화 여부 확인" alt="작업 관리자로 가상화 활성화 여부 확인" %}

### 2. Hyper-V 비활성화
Hyper-V와 VirtualBox는 같은 하드웨어 가상화 기술을 사용한다. 하지만 하드웨어 가상화는 하나의 하이퍼바이저에서만 사용 가능하며 WSL2로 인해서 Hyper-V가 활성화되어 있는 경우 VirtualBox는 사용할 수 없게 된다. 아래 명령줄을 통해서 Hyper-V를 비활성화/활성화할 수 있다.

```bash
# Hyper-V 비활성화
bcdedit /set hypervisorlaunchtype off

# Hyper-V 활성화
bcdedit /set hypervisorlaunchtype auto
```

### 3. 메모리 무결성 비활성화
Windows 기본 기능 중에 메모리 무결성(Hypervisor Enforced Code Integrity)은 Hyper-V를 사용하기 때문에 비활성화해야 한다. 비활성화는 Windows 설정에서 변경하면 되며, 상세 내용은 [Microsoft 공식 웹페이지][HVCI]를 참조해서 진행한다.

{% include image.html url="hvci.png" caption="메모리 무결성 비활성화" alt="메모리 무결성 비활성화" %}

## 결론
하드웨어 가상화는 하나의 하이퍼바이저에만 사용할 수 있다는 한계를 알 수 있었다.

아쉽지만 하이퍼바이저 특성이기 때문에 현재는 설정을 바꿔가며 사용해야 한다.

{% include image.html url="solved.png" caption="VirtualBox에 VT-x가 정상적으로 적용된 모습" alt="VirtualBox에 VT-x가 정상적으로 적용된 모습" %}

[SecurAble]: https://www.grc.com/securable.htm
[HVCI]: https://learn.microsoft.com/ko-kr/windows/security/hardware-security/enable-virtualization-based-protection-of-code-integrity#how-to-turn-on-memory-integrity