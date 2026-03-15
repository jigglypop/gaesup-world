## 1. 목표와 상태

이 문서는 CE 클라루스장 이론을 **강곡률계, 특히 블랙홀**에 적용하는 최소 유도 문서다.

목표는 세 가지다.

- 기존 CE 문서에 이미 있는 양들 $\delta$, $D_{\text{eff}}$, $\alpha_s$, $F$, $\xi$, $\Phi$를 사용해
  블랙홀 유효 작용을 닫는다.
- Schwarzschild, Reissner-Nordstrom, Kerr, Kerr-Newman의 대표식을
  **하나의 CE 사전**으로 다시 쓴다.
- "블랙홀 = d=3 구조가 d=0 문법에 가까워지는 접경"이라는 해석이
  어디까지 수식적으로 뒷받침되는지 선을 그어 둔다.

이 문서는 **최소 유도**다. 즉, 정적 배경에서의 유효 중력상수와 horizon 구조를 평균장 수준에서 닫지만,
완전한 $\Phi(r,\theta)$와 계량의 exact coupled solution까지는 아직 요구하지 않는다.

---

## 2. 출발점: 기존 CE 라그랑지안

`docs/경로적분.md`의 기본 라그랑지안은 다음과 같다.

$$
\mathcal{L}
=
\frac{R}{16\pi G}
+ \xi R\Phi^2
+ \mathcal{L}_{\text{SM}}^{d=3}
+ \frac{1}{2}(\partial_\mu\Phi)^2
- V(\Phi)
+ \delta^2 \Phi^2 |H|^2
$$

여기서

$$
\xi = \alpha_s^{1/3},\qquad
\delta = \sin^2\theta_W\cos^2\theta_W,\qquad
D_{\text{eff}} = 3 + \delta,\qquad
F = 1 + \alpha_s D_{\text{eff}}
$$

는 이미 CE 내부에서 고정된 양이다.

수치적으로는

$$
\delta = 0.17776,\qquad
D_{\text{eff}} = 3.17776,\qquad
\alpha_s \simeq 0.1179,\qquad
F \simeq 1.3746
$$

이다.

문제는 블랙홀처럼 강곡률 배경에서 $\xi R\Phi^2$ 항을 어떻게 유효적으로 읽을 것인가이다.
이를 위해 **정적, 구면대칭 근처의 평균장 배경**을 취한다.

---

## 3. 강곡률 배경에서의 유효 작용

블랙홀 외부의 정적 배경에서 다음 근사를 둔다.

1. $\Phi$는 $Z_2$ 보존을 유지하므로 선형 VEV 대신 **2차 평균량** $\langle \Phi^2 \rangle$로 중력항에 기여한다.
2. 사건지평선 바깥의 첫 근사에서는 $\partial\Phi$ 항이 중력항 재정의보다 작다.
3. 강곡률 배경에서의 유효 중력 보정은 기존 CE의 보편 form factor $F$로 닫는다.

그러면 중력항은

$$
\frac{R}{16\pi G} + \xi R\langle \Phi^2 \rangle
=
\frac{R}{16\pi G}\left(1 + 16\pi G\,\xi \langle \Phi^2 \rangle\right)
$$

로 쓸 수 있다. 이제 CE의 기존 유효 증강 인자와 맞추기 위해

$$
1 + 16\pi G\,\xi \langle \Phi^2 \rangle \equiv F = 1 + \alpha_s D_{\text{eff}}
$$

로 **유효 닫힘 조건**을 둔다.

그러면 블랙홀 섹터의 최소 유효 작용은

$$
S_{\text{BH}}^{\text{CE}}
=
\int d^4x\,\sqrt{-g}
\left[
\frac{F}{16\pi G}R
- \frac{1}{2}(\partial\Phi)^2
- V(\Phi)
\right]
$$

가 된다.

이 단계의 지위는 다음과 같다.

- $\xi R\Phi^2$ 자체는 기존 CE 라그랑지안에 있는 항이다.
- $F = 1 + \alpha_s D_{\text{eff}}$ 역시 기존 CE의 핵심 양이다.
- 둘을 강곡률 평균장 배경에서 하나의 유효 중력 계수로 묶는 것은
  **블랙홀 섹터를 닫기 위한 최소 모델링 가정**이다.

---

## 4. 유효 중력상수의 유도

위 작용을 계량에 대해 변분하면

$$
F\left(R_{\mu\nu} - \frac{1}{2}Rg_{\mu\nu}\right)
=
8\pi G\,T_{\mu\nu}^{(\Phi)}
$$

를 얻는다. 따라서 유효 중력상수는

$$
\boxed{
G_{\text{eff}} = \frac{G}{F}
}
$$

이다.

CE 수치를 넣으면

$$
G_{\text{eff}} = \frac{G}{1+\alpha_s D_{\text{eff}}}
\simeq \frac{G}{1.3746}
\simeq 0.727\,G
$$

가 된다.

즉 CE 블랙홀 최소 모델은

- 질량을 더 크게 만드는 모형이 아니라
- **같은 질량에 대해 더 압축된 horizon을 갖는 모형**

으로 읽힌다.

---

## 5. Schwarzschild 블랙홀

정적 진공해의 최소형을

$$
ds^2
=
-\left(1-\frac{2G_{\text{eff}}M}{rc^2}\right)c^2dt^2
+\left(1-\frac{2G_{\text{eff}}M}{rc^2}\right)^{-1}dr^2
+r^2 d\Omega^2
$$

로 두면, horizon 조건 $f(r_h)=0$에서

$$
\boxed{
r_h^{\text{CE}}
=
\frac{2G_{\text{eff}}M}{c^2}
=
\frac{2GM}{F c^2}
=
\frac{r_s}{F}
}
$$

를 얻는다.

따라서

$$
r_h^{\text{CE}} \simeq 0.727\,r_s
$$

이다.

### 5.1 면적

$$
\boxed{
A_{\text{CE}} = 4\pi (r_h^{\text{CE}})^2 = \frac{1}{F^2}A_{\text{GR}}
}
$$

즉

$$
A_{\text{CE}} \simeq 0.529\,A_{\text{GR}}
$$

이다.

### 5.2 표면중력과 Hawking 온도

표면중력은

$$
\kappa_{\text{CE}}
=
\frac{c^4}{4G_{\text{eff}}M}
=
F\,\kappa_{\text{GR}}
$$

이고, 따라서 Hawking 온도는

$$
\boxed{
T_H^{\text{CE}}
=
\frac{\hbar c^3}{8\pi G_{\text{eff}} M k_B}
=
F\,T_H^{\text{GR}}
}
$$

다. 수치적으로는

$$
T_H^{\text{CE}} \simeq 1.375\,T_H^{\text{GR}}
$$

이다.

### 5.3 Wald 엔트로피

중력항 앞에 $F$가 직접 곱해진 형태이므로, 엔트로피는 단순 $A/(4G_{\text{eff}})$보다
Wald 공식을 쓰는 것이 더 정합적이다.

$$
S_{\text{CE}}
=
\frac{k_B c^3}{4\hbar G} F A_{\text{CE}}
=
\frac{k_B c^3}{4\hbar G}F\frac{A_{\text{GR}}}{F^2}
$$

따라서

$$
\boxed{
S_{\text{CE}} = \frac{1}{F}S_{\text{GR}}
}
$$

이며,

$$
S_{\text{CE}} \simeq 0.727\,S_{\text{GR}}
$$

이다.

### 5.4 증발률과 수명

복사 출력의 스케일은

$$
P \sim A T^4
$$

이므로,

$$
P_{\text{CE}}
\sim
\frac{A_{\text{GR}}}{F^2}\cdot(F^4 T_{\text{GR}}^4)
=
F^2 P_{\text{GR}}
$$

즉

$$
\boxed{
P_{\text{CE}} \sim F^2 P_{\text{GR}},\qquad
\tau_{\text{CE}} \sim \frac{1}{F^2}\tau_{\text{GR}}
}
$$

이다. CE 최소 모델에서는 블랙홀이

- 더 작고
- 더 뜨겁고
- 더 빨리 증발하는

쪽으로 이동한다.

---

## 6. Reissner-Nordstrom 블랙홀

표준 정의

$$
r_s = \frac{2GM}{c^2},\qquad
r_Q^2 = \frac{GQ^2}{4\pi\varepsilon_0 c^4}
$$

를 쓰면, CE 사전은

$$
r_s \to \frac{r_s}{F},\qquad
r_Q^2 \to \frac{r_Q^2}{F}
$$

이다. 따라서 horizon은

$$
\boxed{
r_\pm^{\text{RN,CE}}
=
\frac{1}{2}
\left(
\frac{r_s}{F}
\pm
\sqrt{\frac{r_s^2}{F^2} - \frac{4r_Q^2}{F}}
\right)
}
$$

가 된다.

extremal 조건은

$$
\frac{r_s^2}{F^2} = \frac{4r_Q^2}{F}
$$

즉

$$
\boxed{
r_s^2 = 4F r_Q^2
}
$$

이다. 같은 $M,Q$라면 CE에서는
전하가 horizon을 무너뜨리는 임계 조건이 더 엄격해진다.

---

## 7. Kerr 블랙홀

회전 파라미터를

$$
a = \frac{J}{Mc}
$$

로 두면, 최소 CE 사전에서는 $a$는 그대로 두고
$r_s$만 $r_s/F$로 치환한다. 따라서

$$
\boxed{
r_\pm^{\text{Kerr,CE}}
=
\frac{1}{2}
\left(
\frac{r_s}{F}
\pm
\sqrt{\frac{r_s^2}{F^2} - 4a^2}
\right)
}
$$

를 얻는다.

extremal Kerr 조건은

$$
\frac{r_s^2}{F^2} = 4a^2
$$

즉

$$
\boxed{
r_s^2 = 4F^2 a^2
}
$$

이다. 따라서 회전 벌점은 전하보다 한 단계 더 강하게 들어간다.

같은 질량에 대해 허용 가능한 최대 spin은

$$
\boxed{
a_{\max}^{\text{CE}} = \frac{1}{F}a_{\max}^{\text{GR}}
}
$$

이다.

---

## 8. Kerr-Newman 블랙홀

회전과 전하를 함께 넣으면 outer/inner horizon은

$$
\boxed{
r_\pm^{\text{KN,CE}}
=
\frac{r_s}{2F}
\pm
\sqrt{
\frac{r_s^2}{4F^2}
- a^2
- \frac{r_Q^2}{F}
}
}
$$

가 된다.

extremal 조건은

$$
\frac{r_s^2}{4F^2}
=
a^2 + \frac{r_Q^2}{F}
$$

즉

$$
\boxed{
r_s^2 = 4F^2 a^2 + 4F r_Q^2
}
$$

로 정리된다.

이 식은 CE 보정이

- 전하에는 $F$
- 회전에는 $F^2$

로 들어간다는 것을 보여 준다. 따라서 CE 최소 모델의 블랙홀은
강한 회전에서 특히 더 예민한 임계 압축계로 해석된다.

---

## 9. CE 해석: 블랙홀은 무엇인가

위 최소 유도에서 수식적으로 닫히는 것은 다음까지다.

- 강곡률 배경에서의 유효 중력상수 $G_{\text{eff}} = G/F$
- horizon, 면적, 온도, 엔트로피, extremality 조건의 CE 변형

이 수식 위에 CE 해석을 얹으면, 블랙홀은 단순한 "무한 압축점"보다
**d=3 구조가 d=0 문법에 가까워지는 접경**으로 읽힌다.

그 이유는 세 가지다.

1. CE의 핵심 form factor $F$가 강곡률계에서도 그대로 작동한다.
2. horizon은 커지지 않고 오히려 더 안쪽으로 수축한다.
3. 온도는 올라가고 엔트로피는 줄어, 블랙홀이 더 민감한 임계계로 변한다.

즉 CE 최소 모델의 블랙홀은 "거대한 저장소"보다

- 더 작은 반경
- 더 높은 온도
- 더 엄격한 극한 조건

을 가진 **임계 압축장**에 가깝다.

이 해석을 CE 용어로 쓰면:

$$
\text{Black hole} \approx d=3 \to d=0 \text{ 접경}
$$

이다.

단, 이 등식은 현재 단계에서는 **정확한 정리**가 아니라
위 유효 사전 위에 얹는 존재론적 해석이다.

---

## 10. 반증 가능성과 남은 과제

이 문서의 최소 블랙홀 유도는 다음 단계에서 더 강해질 수 있다.

### 10.1 지금 닫힌 것

- $F = 1 + \alpha_s D_{\text{eff}}$를 블랙홀 섹터에 연결하는 최소 사전
- 평균장/유효장 가정 아래의 $G_{\text{eff}} = G/F$
- Schwarzschild, RN, Kerr, KN의 horizon 구조에 대한 1차 변형 규칙
- Wald 엔트로피와 Hawking 온도의 일관된 재표현

### 10.2 아직 남은 것

1. $\Phi(r)$의 실제 배경해를 푸는 일
2. 축대칭 배경에서의 exact coupled equation 정리
3. 강곡률 영역에서의 정보 보존/압축 문제 정식화
4. 축대칭 shadow와 ringdown의 정밀 수치 스펙트럼

### 10.3 최소 coupled equation

향후 exact 해를 위해 필요한 방정식은 최소한 다음과 같다.

$$
\delta S/\delta g_{\mu\nu} = 0,\qquad
\delta S/\delta \Phi = 0
$$

즉

$$
F G_{\mu\nu} = 8\pi G\,T_{\mu\nu}^{(\Phi)},
\qquad
\Box \Phi - \frac{dV}{d\Phi} = 0
$$

이다.

현재 문서는 여기까지를 다음 단계의 출발점으로 고정한다.

---

## 11. photon sphere와 shadow

Schwarzschild 계에서 광자구(photon sphere)는

$$
r_{\text{ph}}^{\text{GR}} = \frac{3GM}{c^2} = \frac{3}{2}r_s
$$

이다. CE 최소 사전에서는 $G \to G_{\text{eff}} = G/F$이므로

$$
\boxed{
r_{\text{ph}}^{\text{CE}}
=
\frac{3G_{\text{eff}}M}{c^2}
=
\frac{1}{F}r_{\text{ph}}^{\text{GR}}
}
$$

이다.

수치적으로는

$$
r_{\text{ph}}^{\text{CE}} \simeq 0.727\,r_{\text{ph}}^{\text{GR}}
$$

이다.

광자구에서의 임계 충돌매개변수(impact parameter)는

$$
b_{\text{sh}}^{\text{GR}} = \frac{3\sqrt{3}GM}{c^2}
$$

이므로 CE shadow 스케일은

$$
\boxed{
b_{\text{sh}}^{\text{CE}} = \frac{1}{F} b_{\text{sh}}^{\text{GR}}
}
$$

가 된다.

즉 CE 최소 모델에서 그림자(shadow)는 표준 GR보다
반경 기준으로 약 $27.3\%$ 작아진다.

### 11.1 의미

블랙홀 그림자는 사건지평선 자체가 아니라,
빛이 마지막으로 불안정 궤도를 가질 수 있는 바깥 껍질을 반영한다.
따라서 CE에서 shadow가 줄어든다는 것은

- horizon이 안쪽으로 이동하고
- photon sphere도 함께 안쪽으로 이동하며
- "d=3이 마지막으로 유지되는 광학적 외곽선" 자체가 수축한다

는 뜻이다.

---

## 12. ISCO와 원반 물리

Schwarzschild 블랙홀의 가장 안쪽 안정 원궤도(ISCO)는

$$
r_{\text{ISCO}}^{\text{GR}} = \frac{6GM}{c^2} = 3r_s
$$

이다.

CE 사전을 적용하면

$$
\boxed{
r_{\text{ISCO}}^{\text{CE}}
=
\frac{6G_{\text{eff}}M}{c^2}
=
\frac{1}{F}r_{\text{ISCO}}^{\text{GR}}
}
$$

가 된다.

즉

$$
r_{\text{ISCO}}^{\text{CE}} \simeq 0.727\,r_{\text{ISCO}}^{\text{GR}}
$$

이다.

### 12.1 궤도 주파수

원궤도 각주파수는 대략

$$
\Omega \sim \sqrt{\frac{GM}{r^3}}
$$

이므로, CE에서 $G \to G/F$와 $r \to r/F$를 동시에 넣으면

$$
\Omega_{\text{CE}}
\sim
\sqrt{
\frac{G/F}{(r/F)^3}
}
=
F\Omega_{\text{GR}}
$$

를 얻는다.

따라서 ISCO 주파수도 1차 근사에서

$$
\boxed{
\Omega_{\text{ISCO}}^{\text{CE}} \sim F\,\Omega_{\text{ISCO}}^{\text{GR}}
}
$$

로 스케일한다.

이는 CE 최소 모델에서

- 원반의 안쪽 경계가 더 안으로 들어가고
- 안쪽 원반의 대표 주파수는 더 높아진다

는 뜻이다.

---

## 13. QNM과 ringdown

블랙홀 고유진동수(quasinormal mode)는 대체로

$$
\omega_{\text{QNM}} \sim \frac{c^3}{GM}
$$

의 스케일을 가진다. 따라서 CE 사전에서

$$
G \to \frac{G}{F}
$$

를 넣으면

$$
\boxed{
\omega_{\text{QNM}}^{\text{CE}}
\sim
F\,\omega_{\text{QNM}}^{\text{GR}}
}
$$

를 얻는다.

같은 이유로 damping time은

$$
\tau_{\text{ring}} \sim \omega^{-1}
$$

이므로

$$
\boxed{
\tau_{\text{ring}}^{\text{CE}} \sim \frac{1}{F}\tau_{\text{ring}}^{\text{GR}}
}
$$

이다.

즉 CE 최소 모델에서는 ringdown이

- 더 높은 주파수에서
- 더 짧은 시간 척도로

일어난다.

이 단계는 아직 exact Teukolsky 방정식 해를 푼 것이 아니라,
길이 스케일이 $1/F$로 수축한다는 사실에서 나온
**첫 번째 관측 예측**이다.

---

## 14. CE 우주검열 bound

앞 절들의 결과를 하나로 묶으면, CE 블랙홀의 horizon 존재 조건은
표준 GR보다 더 엄격해진다.

가장 일반적인 최소형은 Kerr-Newman 결과

$$
r_s^2 \ge 4F^2 a^2 + 4F r_Q^2
$$

이다.

이를 CE 우주검열 bound로 부른다.

$$
\boxed{
r_s^2 - 4F^2 a^2 - 4F r_Q^2 \ge 0
}
$$

해석은 다음과 같다.

- 질량은 horizon을 유지하는 쪽으로 작용한다.
- 전하는 horizon을 깨는 방향으로 작용하며 벌점은 $F$다.
- 회전은 더 강하게 horizon을 깨는 방향으로 작용하며 벌점은 $F^2$다.

즉 CE 최소 모델의 블랙홀은
**강한 회전성에 특히 민감한 임계 압축계**다.

이 구조는 CE가 복잡성의 증가를 "안정화 비용"으로 읽는다는 점과 정합적이다.
회전은 단순 에너지 추가가 아니라 구조적 비틀림을 만들기 때문에,
전하보다 더 강한 벌점을 받는다.

---

## 15. 관측 예측의 요약

CE 최소 블랙홀 사전이 주는 대표 예측은 아래와 같다.

| 관측량 | GR | CE 최소 모델 | 스케일 |
|---|---|---|---|
| 유효 중력상수 | $G$ | $G/F$ | $1/F$ |
| horizon 반경 | $r_h$ | $r_h/F$ | $1/F$ |
| photon sphere | $r_{\text{ph}}$ | $r_{\text{ph}}/F$ | $1/F$ |
| shadow 반경 | $b_{\text{sh}}$ | $b_{\text{sh}}/F$ | $1/F$ |
| ISCO | $r_{\text{ISCO}}$ | $r_{\text{ISCO}}/F$ | $1/F$ |
| 면적 | $A$ | $A/F^2$ | $1/F^2$ |
| Wald 엔트로피 | $S$ | $S/F$ | $1/F$ |
| Hawking 온도 | $T_H$ | $F T_H$ | $F$ |
| ringdown 주파수 | $\omega_{\text{QNM}}$ | $F\omega_{\text{QNM}}$ | $F$ |
| 증발 수명 | $\tau$ | $\tau/F^2$ | $1/F^2$ |

수치적으로 $F \simeq 1.3746$이므로,

- 길이 관측량은 약 $0.727$배
- 면적은 약 $0.529$배
- 온도와 특성 주파수는 약 $1.375$배

로 이동한다.

이 표는 현재 문서의 핵심이다.
즉 CE 블랙홀은 "GR 식을 각각 임의 수정한 모델"이 아니라,
**하나의 공통 사전 $F$로 관측량 전체가 함께 이동하는 모델**이다.

---

## 16. 해석의 정리

이제 블랙홀은 세 층으로 구분해 읽을 수 있다.

### 16.1 수식 층

이 문서에서 직접 닫힌 것은

- 평균장 가정 아래의 $G_{\text{eff}} = G/F$
- horizon 계열 식의 CE 변환 규칙
- shadow, ISCO, QNM의 1차 스케일 예측

이다.

### 16.2 물리 층

수식이 말해 주는 블랙홀은

- 더 작은 길이 스케일
- 더 높은 온도
- 더 짧은 동역학 시간척도
- 더 엄격한 회전/전하 임계조건

을 가진 강곡률계다.

### 16.3 존재론 층

이 물리적 결과 위에서 CE 해석을 붙이면,
블랙홀은 단순한 "소멸 구멍"이 아니라

$$
\text{강하게 압축된 } d=3 \text{ 구조가 } d=0 \text{ 문법에 접근하는 경계}
$$

로 읽힌다.

이 마지막 층은 아직 exact theorem은 아니지만,
최소 수식 결과와 방향성은 일관된다.

---

## 17. 요약

CE 문서에 이미 있는 양

$$
\delta,\quad D_{\text{eff}},\quad \alpha_s,\quad F,\quad \xi,\quad \Phi
$$

만으로 블랙홀 최소 유효 이론을 닫으면,

$$
\boxed{
G_{\text{eff}} = \frac{G}{1+\alpha_s D_{\text{eff}}}
}
$$

가 되고, 그 결과

$$
\boxed{
r_h = \frac{2GM}{c^2(1+\alpha_s D_{\text{eff}})}
}
$$

를 얻는다.

이 하나의 사전으로부터

- Schwarzschild
- Reissner-Nordstrom
- Kerr
- Kerr-Newman

의 horizon 식이 전부 같은 방식으로 변환된다.

따라서 블랙홀은 CE에서 예외적 부록이 아니라,
기존 CE 핵심량들이 강곡률 영역에서 어떻게 작동할 수 있는지를 보여 주는
**유효 적용 대상**이 된다. 다만 최신 정본 기준에서 이는 완전한 exact 해의 직접 유도가 아니라, 평균장과 form-factor 가정을 포함한 응용 문서다.
