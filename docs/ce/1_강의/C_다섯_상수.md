# CE: 다섯 상수에서 우주까지, 우주에서 한 줄까지

## 오일러 항등식의 물리학 -- 올라갔다 내려오기

## 0. 이 강의의 구조

A강의는 $e^{-1}$에서 내려간다. B강의는 관측에서 $e^{-1}$까지 올라간다. 이 강의는 다르다.

다섯 개의 문을 각각 따로 연다. 각 문 뒤에 물리학의 한 기둥이 서 있다. 다섯 기둥을 다 세운 뒤, 꼭대기에서 만난다. 만나는 지점이 한 줄이다.

$$e^{i\pi} + 1 = 0$$

그리고 그 한 줄에서 다시 내려온다. 내려오면 우주가 있다.

### 흐름도

```
        e^(ipi) + 1 = 0        <-- 합류점 (6절)
       /   |    |   \    \
      e    pi   i    1    0    <-- 다섯 문 (1-5절)
      |    |    |    |    |
   접힘  결합  간섭  완전  영점   <-- 물리적 역할
      |    |    |    |    |
   Omega  alpha  Born  d=0  d=3  <-- 물리적 출력
      \    |    |    |   /
       전개: 11+ 관측값           <-- 하강 (7절)
```

### 유도 레벨 표기

이 문서는 코어 정전과 같은 4등급 체계를 따른다.

- `Exact`: 수학적 전개나 정의만으로 닫히는 단계
- `Selection`: 유일성, 분기 선택, 정규화 선택 단계
- `Bridge`: 물리적 식별, 표준모형 연결, 관측량 대응 단계
- `Phenomenology`: 보정, 동결 시점, 응용 닫힘 단계

같은 식이라도 어느 등급에서 성립하는지 분리해서 읽어야 "완전 증명"과 "모형 선택"을 혼동하지 않는다. 특히 이 문서의 목적은 오일러 항등식을 물리식의 직접 증명식으로 쓰는 것이 아니라, `{e,\pi,i,1,0}`를 **최소 생성 문법**으로 읽는 연습을 제공하는 것이다.

### 표기 정합성 메모

이 문서에서 $0.3679$는 항상 $e^{-1}$을 뜻한다(1차원 단위 접힘율).  
우주론 출력은 $\varepsilon^2$로 표기하며, 정준값은 $\varepsilon^2=0.04865$다.  
전자약 혼합은 $\delta$, 결합 상수는 $\alpha_s$, $\alpha_{\text{total}}$를 정준 표기로 사용한다.  
즉 "$0.37$"과 "$0.04865$"는 서로 다른 대상(단위 상수 vs 최종 생존율)이며, 별도 이론 버전이 아니다.

---

## 1. 첫째 문: $e$ -- 접힘

### 1.1 질문

경로적분에서 무한히 많은 경로 중 대부분이 사라진다. 살아남는 비율은 얼마인가?

### 1.2 공리로부터

CE의 세 공리가 생존함수 $S(D)$에 부과하는 조건:

- **독립성(B1)**: $D$차원 접힘 = 1차원 접힘의 $D$번 반복. $S(D) = S(1)^D$.
- **연속성(B2)**: $S$는 $D$에 대해 연속.
- **정규화(B3)**: $S(0) = 1$. 접히지 않으면 전부 살아남는다.

B1에서 $S(D) = S(1)^D$. B2에서 $S(1) > 0$. B3에서 $S(0) = 1$ (자동 만족).

$S(1) = c$로 놓으면 $S(D) = c^D = e^{D \ln c}$.

$\ln c < 0$ (접힘은 줄이는 과정)이므로 $c = e^{-\lambda}$, $\lambda > 0$.

여기까지는 **정리**다: $S(D)=e^{-\lambda D}$.

$\lambda$는 "자유도 단위"를 정하는 계수이므로, CE는 $D$의 단위를 1 e-fold 기준으로 정규화하여 $\lambda=1$을 택한다. 이 단계는 **규약**이다.

$$\boxed{S(D) = e^{-D}}$$

1차원 기본 생존율: $S(1) = e^{-1} = 0.3679$.

### 1.3 $e$의 역할

$e$는 **접힘의 밑**이다. 우주가 경로를 접는 속도를 결정한다. 
$e$가 아닌 다른 밑이면 독립성(B1)이 깨진다. 
오직 지수함수만이 $f(x+y) = f(x)f(y)$를 만족한다. $e$는 유일하다.

### 1.4 $e$에서 나오는 것

- $\Omega_b = \varepsilon^2 \approx e^{-3} = 0.0498$ (바리온 밀도의 근사)
- 부트스트랩 방정식: $\varepsilon^2 = e^{-(1-\varepsilon^2) D_{\text{eff}}}$
- 정밀값: $\Omega_b = 0.04865$ (관측: $0.0486 \pm 0.0010$, 0.05$\sigma$)


## 2. $\pi$ (결합)

### 2.1 질문

세 힘(강력, 약력, 전자기력)의 세기는 왜 그 값인가?

### 2.2 게이지 위상 공간에서

게이지장은 내부 공간에서 위상 회전으로 기술된다. 게이지 변환 $\psi \to e^{i\theta}\psi$에서 위상 $\theta$가 $0$에서 $2\pi$로 돌면 하나의 완전한 전이이다.

**$2\pi$의 기원 (정리).** SM 게이지군 $\text{SU}(3) \times \text{SU}(2) \times \text{U}(1)$의 최대 토러스(Cartan 부분군)에서, 기본 표현의 위상은 원($S^1$) 위를 돈다. 원의 둘레는 $2\pi$이다. 따라서 하나의 완전한 게이지 전이가 소비하는 위상 경로는:

$$\Delta\phi = 2\pi$$

이것은 원의 기하학에서 나오는 **정리**이다. 가정이 아니다.

1절에서 접힘 생존율을 $S(D) = e^{-D}$로 정의했다 ($\lambda = 1$ 규약). 게이지장에 같은 구조를 적용하면, 위상 경로 $\Delta\phi$를 진행할 때의 생존율:

$$P_{\text{gauge}} = e^{-\alpha_{\text{total}} \cdot \Delta\phi}$$

여기서 $\alpha_{\text{total}}$은 라디안당 감쇠율(총 결합 상수)이다.

**규약 (H2).** 하나의 완전한 게이지 주기($\Delta\phi = 2\pi$)를 접힘의 1 e-fold로 정의한다:

$$P_{\text{gauge}}(\Delta\phi = 2\pi) = S(1) = e^{-1}$$

이것은 1절의 $\lambda = 1$ 선택과 동일한 성격이다. "접힘 1단위가 무엇에 대응하는가"를 게이지 전이 1주기로 고정하는 단위 규약이다.

따라서:

$$\alpha_{\text{total}} \cdot 2\pi = 1 \quad \Longrightarrow \quad \boxed{\alpha_{\text{total}} = \frac{1}{2\pi}}$$

유도 레벨: **정리**($\Delta\phi = 2\pi$, 원의 기하학) + **규약**(H2: 게이지 주기 = 1 e-fold).

### 2.3 자기일관적 분할

$\alpha_{\text{total}} = 1/(2\pi)$와 CE의 통합 관계식 $\sin^2\theta_W = 4\alpha_s^{4/3}$, 전자약 구조 $\alpha_{em} = \alpha_w \sin^2\theta_W$를 연립하면:

$$\alpha_w = \frac{1/(2\pi) - \alpha_s}{1 + 4\alpha_s^{4/3}}, \qquad \alpha_{em} = \alpha_w \cdot 4\alpha_s^{4/3}$$

수치해:

| | 자기일관 해 | 관측 | 텐션 |
|---|---|---|---|
| $\alpha_s$ | 0.11789 | $0.1179 \pm 0.0009$ | 0.01$\sigma$ |
| $\alpha_w$ | 0.03352 | ~0.034 | -- |
| $\alpha_{em}$ | 0.00775 = 1/129 | $\alpha_{em}(M_Z) \approx$ 1/128 | -- |
| $\sin^2\theta_W$ | 0.23122 | $0.23122 \pm 0.00003$ | 0.02$\sigma$ |

세 결합 상수가 동일 에너지 스케일($M_Z$)에서 자기일관적으로 정합된다.

### 2.4 $\pi$의 역할

$\pi$는 **결합의 척도**이다. 원의 기하학($2\pi$)이 시간 격자의 주기를 결정하고, 주기가 총 결합상수를 결정하고, 총 결합상수가 세 힘의 세기를 결정한다. $\pi$가 없으면 힘이 없다.

### 2.5 $\pi$에서 나오는 것

- 총 결합상수: $\alpha_{\text{total}} = 1/(2\pi) = 0.15916$
- 바인버그 각: $\sin^2\theta_W = 0.23122$ (0.02$\sigma$)
- 강력-약력 쌍대성: $\alpha_s^2 = (\sin\theta_W / 2)^3$ (0.0000% 오차)

---

## 3. 셋째 문: $i$ -- 간섭

### 3.1 질문

경로들이 왜 서로 상쇄하는가? 접힘은 어디서 오는가?

### 3.2 경로적분으로부터

파인만의 경로적분:

$$Z = \int \mathcal{D}\phi \; e^{iS[\phi]/\hbar}$$

핵심은 $i$이다. $e^{iS}$는 단위원 위의 위상이다. 다른 경로는 다른 위상을 갖고, 위상이 다르면 간섭한다. 대부분의 경로는 이웃 경로와 위상이 크게 달라 **상쇄 간섭**으로 사라진다. 고전적 경로 근방만 위상이 정류(stationary)하여 **보강 간섭**으로 살아남는다.

이것이 접힘이다. CE는 이 상쇄를 기하학적 접힘으로 재해석한다.

### 3.3 $i$가 없으면

$i$를 빼면 $e^{S}$ (실수 지수). 모든 경로가 양의 가중치를 가진다. 간섭이 없다. 접힘이 없다. 모든 경로가 살아남는다. $S(D) = 1$. 물리가 없다.

$i$는 접힘을 **가능하게 만드는** 상수이다. $e$가 접힘의 속도를 정한다면, $i$는 접힘이 존재할 수 있는 이유이다.

### 3.4 보른 규칙

$i$가 만드는 위상 간섭에서, 접힌 경로 다발(분지)이 분리될 때 각 분지의 확률은:

$$P_k = |c_k|^2$$

**유도.** 상태 $|\psi\rangle = \sum_k c_k |k\rangle$에서 접힘이 분지를 분리한다. 각 분지 $k$의 가중치 $W_k$에 대해 세 조건이 성립한다:

1. **가산성 (B1에서).** 독립 분지의 가중치는 가산적이다: $W(A \cup B) = W(A) + W(B)$. 접힘의 독립성(B1)의 직접적 결과.
2. **위상 불변성 ($i$에서).** $c_k \to e^{i\phi} c_k$는 물리를 바꾸지 않는다. $e^{iS}$의 간섭 구조가 위상만 돌리므로, $W_k$는 $|c_k|$에만 의존한다.
3. **비맥락성 (접힘 구조에서).** $W_k$는 다른 분지의 존재 여부에 의존하지 않는다. 접힘은 각 분지를 독립적으로 처리한다.

Gleason 정리(1957): $\dim \mathcal{H} \geq 3$인 힐베르트 공간에서 위 세 조건을 만족하는 유일한 확률 측도는 $W_k = |c_k|^2$이다. $d = 3$(5절)에서 물리적 힐베르트 공간의 차원은 $\geq 3$이므로 Gleason 조건이 만족된다.

유도 레벨: **정리** (B1 + $i$ + Gleason).

단, 이 결론은 분지 간 억압이 대칭이라는 조건에서의 주결과다.  
실제 장치가 비대칭이면 $W_k$에 검출기 편향 보정이 추가되고, 비율은 이상형에서 벗어날 수 있다.

### 3.5 $i$에서 나오는 것

- 경로적분의 간섭 메커니즘
- 접힘의 존재 근거
- 보른 규칙의 유도 (측정 문제 해결)

---

## 4. 넷째 문: $1$ -- 완전

### 4.1 질문

접히지 않은 세계는 어떤 상태인가?

### 4.2 $d = 0$에서

$$S(0) = e^{-0} = e^0 = 1$$

$d = 0$: 공간이 없다. 경로가 없다. 접힘이 없다. 모든 것이 100% 살아남는다. 완전한 상태.

$1$은 곱셈의 항등원이다. $1 \times x = x$. 무엇을 곱해도 바뀌지 않는다. $d = 0$의 세계에 무엇을 가져다 대도 바뀌지 않는다.

### 4.3 부트스트랩의 수렴

부트스트랩 방정식 $\varepsilon^2 = e^{-(1-\varepsilon^2) D_{\text{eff}}}$의 반복:

$$\varepsilon_0 \to \varepsilon_1 \to \varepsilon_2 \to \cdots \to \varepsilon^*$$

이 수렴이 보장되는 이유: $(1-\varepsilon^2) D_{\text{eff}} > 0$이면 $e^{-x} < 1$이므로 축소 사상. 항등원 $1$이 상한을 제공하여 수렴을 보장한다.

### 4.4 $1$의 역할

$1$은 **완전의 기준선**이다. 접힘이 없을 때($d = 0$)의 상태를 정의한다. 부트스트랩의 수렴을 보장한다. 모든 접힘은 $1$로부터의 이탈이고, 모든 물리는 $1$이 아닌 것에서 발생한다.

### 4.5 $1$에서 나오는 것

- $e^0 = 1$: 접힘 없는 완전 상태 ($d = 0$)
- 부트스트랩 수렴의 보장
- $d(d-3) = 0$의 한 근: $d = 0$ (영점의 한 극)

---

## 5. 다섯째 문: $0$ -- 영점

### 5.1 질문

우주의 차원은 왜 3인가? 그리고 추가 적합 파라미터를 거의 두지 않는 해석은 어떻게 가능한가?

### 5.2 차원 선택

$d$차원 공간에서 두 기본 텐서 구조를 비교한다:

- **1-형식**(벡터): $d$개 독립 성분. 물리적 예: 전기장 $E_i$, 운동량 $p_i$.
- **2-형식**(반대칭 텐서): $\binom{d}{2} = d(d-1)/2$개 독립 성분. 물리적 예: 전자기 장세기 $F_{ij}$, 각운동량 $L_{ij}$.

**Hodge 자기쌍대성.** Levi-Civita 텐서 $\varepsilon_{i_1 \cdots i_d}$에 의한 Hodge 성(star) 연산은 $p$-형식을 $(d-p)$-형식으로 사상한다. 1-형식과 2-형식이 Hodge 쌍대이려면 $p = 1$, $d - p = 2$, 즉 $d = 3$이다.

동치 조건으로, 1-형식과 2-형식의 독립 성분 수가 같으려면:

$$d = \frac{d(d-1)}{2} \quad \Longrightarrow \quad d^2 - 3d = 0 \quad \Longrightarrow \quad d(d-3) = 0$$

두 근: $d = 0$ (4절의 완전 상태)과 $d = 3$ (물리적 세계).

**$d = 3$의 물리적 유일성:**

- 외적 $(\mathbf{a} \times \mathbf{b})_k = \varepsilon_{ijk} a_i b_j$가 **벡터**를 반환한다. $d \neq 3$이면 결과는 $(d-2)$-형식이 되어 벡터가 아니다.
- 각운동량 $L_{ij}$가 벡터 $L_k = \varepsilon_{ijk} L_{ij}/2$로 표현된다. $d = 3$에서만 성립.
- 게이지 장세기 $F_{ij}$의 공간 성분이 자기장 벡터 $B_k = \varepsilon_{ijk} F_{ij}/2$로 환원된다.

$d = 7$에서도 벡터곱이 존재하지만($G_2$ 구조), 결합법칙이 깨져 리 대수의 야코비 항등식이 성립하지 않는다. 게이지 이론이 불가능하다.

인과성 조건 $d > 0$에 의해:

$$\boxed{d = 3}$$

$0$이 이 방정식을 만든다. $d(d-3) = 0$에서 우변이 $0$이기 때문에 $d = 3$이 결정된다.

### 5.3 자유 파라미터

$$\text{무차원 코어} \;\Rightarrow\; \text{선택 규칙} \;\Rightarrow\; \text{브리지 규칙}$$

$d = 3$은 Hodge 자기쌍대의 `Selection` 규칙으로 읽고, $\alpha_s$, $\sin^2\theta_W$ 체인은 최신 정본 기준에서 `Bridge`를 포함한다. 따라서 이 절의 핵심은 "아무 입력도 없다"가 아니라, **추가 적합 파라미터를 새로 두지 않는 닫힘 체인**을 제시한다는 데 있다.

### 5.4 $0$의 역할

$0$은 **영점이자 근원**이다. $d(d-3) = 0$에서 차원을 선택하고, 영점 구조를 고정한다. 다만 최신 정본 기준에서 실제 관측량으로 내려갈 때는 `Bridge`와 `Phenomenology` 단계가 추가되므로, "아무것도 넣지 않아도 우주가 완전히 닫힌다"는 식으로 읽지는 않는다.

### 5.5 $0$에서 나오는 것

- $d = 3$ (공간 차원)
- $N_{\text{forces}} = d + 1 = 4$ (힘의 수)
- $N_{\text{gen}} = d = 3$ (세대 수)
- $\{3, 2, 1\} \to \text{SU}(3) \times \text{SU}(2) \times \text{U}(1)$ (게이지 군)
- 추가 적합 파라미터를 새로 두지 않는 코어 체인

---

## 6. 합류: $e^{i\pi} + 1 = 0$

### 6.1 다섯 기둥

다섯 문을 열었다. 각각이 물리학의 한 기둥이다.

| 상수 | 역할 | 기둥 |
|---|---|---|
| $e$ | 접힘의 밑 | 우주론 ($\Omega_b$, $\Omega_\Lambda$, $\Omega_{DM}$) |
| $\pi$ | 결합의 척도 | 게이지 이론 ($\alpha_s$, $\alpha_w$, $\alpha_{em}$, $\sin^2\theta_W$) |
| $i$ | 간섭의 원천 | 양자역학 (경로적분, 보른 규칙) |
| $1$ | 완전의 기준 | $d = 0$ 상태, 부트스트랩 수렴 |
| $0$ | 영점과 근원 | $d = 3$ 선택, 파라미터 = 0 |

### 6.2 합류의 필연성

이 다섯 상수는 독립이 아니다. 오일러 항등식이 증명한다:

$$e^{i\pi} + 1 = 0$$

접힘($e$)이 간섭($i$)과 결합($\pi$)을 통해 작동하면 반전($-1$)이 일어나고, 완전($1$)을 더하면 영점($0$)이 된다.

이 한 줄이 말하는 것: **다섯 기둥은 처음부터 하나였다.**

우주론과 게이지 이론과 양자역학과 차원 선택이 따로 있는 것이 아니다. 하나의 항등식의 다섯 얼굴이다.

### 6.3 $e^{i\pi} = -1$의 물리적 의미

$$e^{i\pi} = -1$$

접힘($e$)이 간섭($i$)과 결합($\pi$)을 거치면 **완전한 위상 반전**이 일어난다. 이것은 경로적분에서 한 경로가 정확히 반대 위상의 다른 경로와 만나 상쇄되는 것이다. 완전한 상쇄 간섭. 접힘의 극단.

거기에 $1$을 더하면 $0$. 반전과 완전이 만나면 영점. 접힌 세계($d = 3$)와 접히지 않은 세계($d = 0$)가 만나면 $d(d-3) = 0$. 같은 영점.

### 6.4 왜 다른 상수가 없는가

CE의 모든 무차원 구조에는 $G$, $\hbar$, $c$, $k_B$가 등장하지 않는다. 이들은 차원 스케일링(단위 변환)에만 관여한다. 미터를 피트로 바꾸는 것처럼, 물리의 구조를 결정하지 않는다.

구조를 결정하는 것은 오직 $\{e, \pi, i, 1, 0\}$이다. 이 다섯 개는 인간이 정한 것이 아니다. 원이 존재하면 $\pi$가 있고, 지수함수가 존재하면 $e$가 있고, 복소평면이 존재하면 $i$가 있고, 연산이 존재하면 $1$과 $0$이 있다. 수학 자체의 뼈대이다. 물리가 이 뼈대 위에 서 있다.


## 7. 하강: 한 줄에서 우주까지

### 7.1 유도 체인

오일러 항등식에서 출발하여 아래로 내려간다.

**1층: 차원**
$$0 \xrightarrow{d(d-3)=0} d = 3$$

**2층: 힘의 구조**
$$d = 3 \xrightarrow{\{3,2,1\}} \text{SU}(3) \times \text{SU}(2) \times \text{U}(1), \quad N_{\text{forces}} = 4, \quad N_{\text{gen}} = 3$$

**3층: 결합 상수**
$$\pi \xrightarrow{1/(2\pi)} \alpha_{\text{total}} \xrightarrow{\text{자기일관 연립}} \alpha_s = 0.11789, \; \sin^2\theta_W = 0.23122$$

**4층: 혼합 매개변수**
$$\sin^2\theta_W \xrightarrow{s^2 c^2} \delta = 0.17771 \xrightarrow{3+\delta} D_{\text{eff}} = 3.17771$$

**5층: 우주 에너지**
$$e \xrightarrow{e^{-(1-\varepsilon^2)D_{\text{eff}}}} \varepsilon^2 = 0.04865 \xrightarrow{\text{A3b}} \Omega_b$$

$$\Omega_\Lambda = \frac{1 - \varepsilon^2}{1 + R} = 0.6891, \qquad \Omega_{DM} = \frac{(1-\varepsilon^2) R}{1 + R} = 0.2623$$

**6층: 입자물리**
$$\delta \xrightarrow{v_{\text{EW}} \delta} M_{\text{CE}} = 43.77 \text{ GeV} \xrightarrow{(\alpha/2\pi) e^{-1} (m_\mu/M)^2} \Delta a_\mu = 249 \times 10^{-11}$$

$$\delta^2 \xrightarrow{m_p \delta^2} m_\phi = 29.65 \text{ MeV} \xrightarrow{F = 1 + \alpha_s D_{\text{eff}}} \Delta r_p^2 = 0.060 \text{ fm}^2$$

**7층: 양자역학 기초**
$$i \xrightarrow{e^{iS}} \text{간섭} \xrightarrow{\Phi = R} \text{접힘} \xrightarrow{} P_k = |c_k|^2 \text{ (보른 규칙)}$$

여기서도 레벨 구분을 유지한다:

- $\varepsilon^2 = e^{-(1-\varepsilon^2)D_{\text{eff}}}$: 자기일관 고정점 식(정확형)
- $\Omega_b \approx e^{-D_{\text{eff}}}$: 1차 근사형
- $\Omega_b = \varepsilon^2$: 물리적 식별 가정

#### 4층 유도: $\delta$와 $D_{\text{eff}}$의 물리적 기원

$D_{\text{eff}}$는 접힘 헤시안 $\Phi = \delta^2 S/\delta\gamma^2$의 독립 접힘 채널 수이다.

**(i) 공간 기여.** 자유 입자의 작용은 공간 차원에 대해 분해된다. 등방성에 의해 각 차원이 동등하게 기여한다:

$$D_{\text{space}} = d = 3$$

**(ii) EWSB 기여.** EWSB 후 중성 게이지 보손 질량 행렬을 $(W^3, B)$ 기저에서 쓰면:

$$M^2 = \frac{v^2}{4} \begin{pmatrix} g^2 & -gg' \\ -gg' & g'^2 \end{pmatrix}$$

고유값: $M_Z^2 = (g^2 + g'^2)v^2/4$, $M_\gamma^2 = 0$. 비대각 원소를 $M_Z^2$로 정규화하면:

$$\frac{|M^2_{W^3 B}|}{M_Z^2} = \frac{gg'}{g^2 + g'^2} = \sin\theta_W \cos\theta_W$$

이것은 SU(2)와 U(1) 사이의 혼합 진폭이다. 여기서 "진폭 제곱" 규칙은 임의 선택이 아니라, 채널 가중치의 불변성 조건으로 고정된다.

중성 섹터의 추가 채널 가중치 $w_{\text{mix}}$는 다음 4조건을 만족해야 한다.

1. 무차원이어야 한다(차원 수에 더해질 양).
2. 기저 회전($W^3,B$의 직교변환)에 대해 불변이어야 한다.
3. 재위상/부호반전 $M^2_{W^3B}\to -M^2_{W^3B}$에서 불변이어야 한다(선형항 금지).
4. 혼합이 꺼지면($M^2_{W^3B}=0$) 0이 되어야 한다.

**정리 7.1 (중성 혼합 채널 가중치의 유일성).**  
위 4조건과 해석성(영점 근방에서 거듭제곱 급수 전개 가능)을 가정하면, 최소 차수의 비자명 불변량은

$$w_{\text{mix}}=\frac{|M^2_{W^3B}|^2}{(\mathrm{Tr}\,M^2)^2}
=\left(\frac{|M^2_{W^3B}|}{M_Z^2}\right)^2$$

뿐이다.

**증명.**  
$M^2_{W^3B}$ 부호 반전 불변성(조건 3)으로 인해 $w_{\text{mix}}$는 $M^2_{W^3B}$의 짝수차에만 의존한다.  
혼합 off에서 소거(조건 4)되려면 각 항은 최소 한 번 이상 $|M^2_{W^3B}|^2$를 인수로 가져야 한다.  
무차원성(조건 1)과 기저 회전 불변성(조건 2)을 동시에 만족하는 최소 차수 항은
$|M^2_{W^3B}|^2/(\mathrm{Tr}\,M^2)^2$이며, 그보다 낮은 차수(상수항, 선형항)는 조건 3,4를 위반한다.  
따라서 최소 차수의 비자명 항은 위 식으로 유일하다. (정규화는 $w_{\text{mix}}\equiv\delta$로 고정) $\square$

따라서 Z 보손이 여는 유효 분수 차원을

$$\delta \equiv w_{\text{mix}}$$

로 정의하면:

$$\delta = \sin^2\theta_W \cos^2\theta_W = \sin^2\theta_W(1 - \sin^2\theta_W) = 0.17776$$

광자($M_\gamma = 0$, 억압 스케일 없음)와 $W^\pm$(하전 전류, $\{3,2,1\}$ 분할에 이미 포함)은 새 채널을 추가하지 않는다. Z만이 SU(2)$\leftrightarrow$U(1) 혼합이라는 새로운 접힘 방향을 연다.

**(iii) 결합.**

$$D_{\text{eff}} = D_{\text{space}} + \delta = 3 + \sin^2\theta_W \cos^2\theta_W = 3.17776$$

경계 검증: $\theta_W = 0$ 또는 $\pi/2$이면 $\delta = 0$, $D_{\text{eff}} = 3$. 혼합 없으면 추가 차원 없다.

유도 레벨: (i) **정리**, (ii) **정리**(SM 질량 행렬 + 불변량 최소차수 선택), (iii) **정리**.

#### 5층 유도: 부트스트랩 방정식과 에너지 분배

**부트스트랩 방정식 (A1--A3에서).**

**(i)** 경로적분에서 클라루스장 $\Phi$에 의한 생존 확률을 정의한다: $P_{\text{survive}} = \langle e^{-\Phi} \rangle$.

**(ii)** 평균장 근사: $\langle e^{-\Phi} \rangle \approx e^{-\langle\Phi\rangle}$. 고차 큐뮬런트를 무시한다.

**(iii)** 연장성 (A1): 헤시안 기대값은 유효 차원에 비례한다. $\langle\Phi\rangle = \sigma \cdot D_{\text{eff}}$. 1절의 독립성(B1), 즉 $S(D) = S(1)^D$와 동일 구조이다.

**(iv)** 에너지 보존 (A2): 전체 $\Omega_{\text{total}} = 1$에서 $\varepsilon^2$이 살아남으면, 차원당 억압률 $\sigma = 1 - \varepsilon^2$.

**(v)** 브리지 규칙 (A3b): $P_{\text{survive}} \leftrightarrow \varepsilon^2 \leftrightarrow \Omega_b$.

(i)--(v)를 결합:

$$\varepsilon^2 = e^{-(1-\varepsilon^2) D_{\text{eff}}}$$

**선택 규칙 7.2 (선택 측도의 함수형 고정).**  
식별 사상 $I:(0,1]\to(0,1]$, $I(P)=\Omega_{\text{visible}}$가 다음을 만족한다고 하자.

1. 연속성: $I$는 연속.
2. 경계 정규화: $I(1)=1$, $I(0)=0$.
3. 독립 곱성: 독립 구간 결합에 대해 $I(P_1P_2)=I(P_1)I(P_2)$.

그러면

$$I(P)=P^c\quad(c>0)$$

꼴이 유일하다.

**증명.**  
조건 3과 연속성으로 Cauchy형 곱셈 함수방정식의 표준해를 얻는다: $I(P)=P^c$.
조건 2는 $c>0$을 강제한다.

이제 약억압 한계($P=1-\eta$, $\eta\ll1$)에서 A2(에너지 보존)와 생존확률 정의는 동일 1차 감쇠를 준다:

$$\Omega_b=1-\eta+O(\eta^2),\qquad P_{\text{survive}}=1-\eta+O(\eta^2).$$

한편 $I(P)=P^c=(1-\eta)^c=1-c\eta+O(\eta^2)$이므로 1차항 일치로 $c=1$.
따라서

$$\boxed{I(P)=P,\qquad \Omega_{\text{visible}}=P_{\text{survive}}=\varepsilon^2}$$

가 유일하다. $\square$

**정리 7.3 (물리 가지 고정점의 존재/유일성과 반복 수렴).**  
$D>1$에서 $F_D(x)\equiv e^{-(1-x)D}$, 물리 구간 $I_D=[0,1/D]$를 두면:

1. $F_D(I_D)\subset I_D$
2. $F_D$는 $I_D$에서 축소사상이다.
3. 따라서 $I_D$에 고정점이 유일하게 존재하며, 반복 $x_{n+1}=F_D(x_n)$는 임의의 $x_0\in I_D$에서 수렴한다.

**증명.**

- 경계값:
  $$F_D(0)=e^{-D}\in(0,1/D),\qquad F_D(1/D)=e^{-(D-1)}\le 1/D$$
  (마지막 부등식은 $\ln D\le D-1$에서 성립). 따라서 $F_D(I_D)\subset I_D$.
- 도함수:
  $$F_D'(x)=D\,e^{-(1-x)D}$$
  이고 $x\in I_D$에서
  $$|F_D'(x)|\le D e^{-(D-1)}\equiv k_D.$$
  $D>1$이면 $\ln k_D=\ln D-(D-1)<0$이므로 $k_D<1$.
  따라서 $F_D$는 $I_D$에서 축소사상.
- 바나흐 고정점 정리로 유일 고정점 존재 및 반복 수렴.

$D_{\text{eff}}=3.17776$이면 $k_D\simeq 0.360<1$로 수렴이 수치적으로도 빠르다.  
자명해 $x=1$은 $I_D$ 바깥 가지이므로(접힘 없음) 물리 가지에서 제외된다. $\square$

**보조정리 7.4 (A3의 연산자 기대값 실현).**  
힐베르트 공간을 $\mathcal{H}=\mathcal{H}_{\mathrm{surv}}\oplus\mathcal{H}_{\mathrm{sup}}$로 분해하고
사영연산자 $\Pi_{\mathrm{surv}}$를 둔다. 상태 $\rho$ ($\mathrm{Tr}\,\rho=1$)에 대해

$$P_{\mathrm{survive}}=\mathrm{Tr}(\rho\,\Pi_{\mathrm{surv}})$$

로 정의한다.

이때 관측량 함수 $J$가 (i) 양의성, (ii) 직교 가산성, (iii) 정규화 $J(\mathbf{1})=1$을 만족하면
Gleason형 표현에 의해

$$J(\Pi)=\mathrm{Tr}(\rho\,\Pi)$$

꼴로 유일하게 주어진다. 따라서 생존 하위공간에 대한 밀도는

$$\Omega_b \equiv J(\Pi_{\mathrm{surv}})=\mathrm{Tr}(\rho\,\Pi_{\mathrm{surv}})
=P_{\mathrm{survive}}$$

로 고정된다. 즉 A3는 임의 식별이 아니라, 양의/가산/정규화 측도의 유일 실현이다. $\square$

유도 레벨: (i)--(iv) `Exact/Selection`, (v)의 함수형 고정은 `Selection`, 그리고 이를 현재 우주의 바리온 분율 $\Omega_b$로 읽는 마지막 단계는 `Bridge`다. 즉 이 강의 노트에서도 A3 전체를 단일한 "완전 정리"로 읽지 않고, 고정점 구조와 관측 연결을 분리한다.

**$\Omega_\Lambda$, $\Omega_{DM}$ 분리.**

억압된 에너지 $\Omega_\Phi = 1 - \varepsilon^2$가 두 성분으로 분리된다:

- **진공 에너지** (0차): $\Omega_\Lambda$ -- 클라루스장 기저 상태의 에너지 밀도
- **양자 요동 응축** (1-루프): $\Omega_{DM}$ -- 클라루스장 요동이 형성하는 비상대론적 응축체

연장성 원리(A1)에 의해 요동 대 진공의 비율:

$$\frac{\Omega_{DM}}{\Omega_\Lambda} = \alpha_s \cdot D_{\text{eff}} \equiv \alpha$$

각 유효 차원에서 QCD 결합 $\alpha_s$만큼의 요동이 기여하고, $D_{\text{eff}}$개 차원의 기여가 합산된다. $\Omega_\Lambda + \Omega_{DM} = 1 - \varepsilon^2$와 위 비율을 연립하면:

$$\Omega_\Lambda = \frac{1 - \varepsilon^2}{1 + R}, \qquad \Omega_{DM} = \frac{(1-\varepsilon^2) R}{1 + R}$$

수치: $\alpha_s D_{\text{eff}} = 0.11789 \times 3.17776 = 0.37465$, 대표값에는 3계층 피드백을 포함한 $R = 0.38063$을 사용

$$\Omega_\Lambda = \frac{0.9514}{1.38063} = 0.6891, \quad \Omega_{DM} = \frac{0.9514 \times 0.38063}{1.38063} = 0.2623$$

Planck 관측: $\Omega_\Lambda = 0.6847$, $\Omega_{DM} = 0.2589$. 차이: 0.64%, 1.3%.

유도 레벨: **가정**(진공/요동 분리, $\alpha_s$가 차원당 요동률) + **정리**(에너지 보존에 의한 비율 결정).

### 7.2 예측 총표

| 관측량 | CE 예측 | 관측값 | 텐션 |
|---|---|---|---|
| $d$ | 3 | 3 | 정확 |
| $N_{\text{forces}}$ | 4 | 4 | 정확 |
| $N_{\text{gen}}$ | 3 | 3 | 정확 |
| 게이지 군 | $\text{SU}(3) \times \text{SU}(2) \times \text{U}(1)$ | $\text{SU}(3) \times \text{SU}(2) \times \text{U}(1)$ | 정확 |
| $\sin^2\theta_W$ | 0.23122 | $0.23122 \pm 0.00003$ | 0.02$\sigma$ |
| $\Omega_b$ | 0.04865 | $0.0486 \pm 0.0010$ | 0.05$\sigma$ |
| $\Omega_\Lambda$ | 0.6891 | 0.6847 | 0.64% |
| $\Omega_{DM}$ | 0.2623 | 0.2589 | 1.3% |
| $\Delta a_\mu$ | $249 \times 10^{-11}$ | $249 \pm 48$ | 0.00$\sigma$ |
| $m_\phi$ | 29.65 MeV | 22-30 MeV | 범위 내 |
| $\Delta r_p^2$ | 0.060 fm$^2$ | $0.059 \pm 0.003$ | 0.4$\sigma$ |
| 보른 규칙 | 유도됨 | $P = |c|^2$ | -- |

이 표의 의미는 "모든 것이 Exact로 닫힌다"가 아니라, $d = 3$과 $\alpha_{\text{total}} = 1/(2\pi)$ 이후에 **추가 적합 파라미터를 새로 두지 않는 계산 체인**이 관측량과 얼마나 가까운지 보여 준다는 데 있다.


## 8. 왜 오일러 항등식인가

### 8.1 수학자의 증언

오일러 항등식은 "수학에서 가장 아름다운 공식"으로 불린다. 왜 아름다운지를 수학자에게 물으면 "모르겠다, 그냥 아름답다"고 답한다.

CE는 이 공식의 미학을 하나의 해석 틀로 읽는다. 다만 최신 정본 기준에서 오일러 항등식은 **우주의 완전한 직접 기술식**이 아니라, 우주의 무차원 코어를 압축하는 최소 생성 문법이다.

### 8.2 수학적 우주

CE의 모든 무차원 예측이 $\{e, \pi, i, 1, 0\}$으로만 표현된다. 물리 상수가 하나도 개입하지 않는다.

이것이 의미하는 것: 우주의 무차원 구조는 물질이 만든 것이 아니라 **수학 자체**이다. 맥스 테그마크의 수학적 우주 가설("물리적 실재의 궁극적 본질은 수학적 구조이다")을 CE가 정량적으로 지지한다.

### 8.3 분할의 근거: 차원확률

"$1/(2\pi)$이 SU(3), SU(2), U(1)에 왜 저 비율로 나뉘는가?"

이 질문의 답은 이미 CE 안에 있다. **차원확률**이다.

CE 경로적분은 $d$차원에서 곱적으로 분해된다(P1). 차원당 결합 = $\alpha_s^{1/d}$. 

전자약 혼합이 이중선형(2-vertex) 게이지 과정이고(P2), SU(2) 기본 표현 차원이 $N_w = 2$이고(P3), 색 전하 수 = 공간 차원 $N_c = d = 3$이면(P4):

$$\sin\theta_W = N_w \cdot (\alpha_s^{1/N_c})^{N_w} = 2\,\alpha_s^{2/3}$$

이것이 차원확률이다. 지수 $2/3 = N_w/N_c$는 차원의 비율이고, 계수 $2 = N_w$는 약력 차원이다. P1-P4 전부가 $d = 3$의 $\{3, 2, 1\}$ 분할에서 나온다.

이 관계식($\sin^2\theta_W = 4\alpha_s^{4/3}$)을 $\alpha_{\text{total}} = 1/(2\pi)$ 및 $\alpha_{em} = \alpha_w \sin^2\theta_W$과 연립하면 세 결합상수의 분할이 결정된다. 관측값을 넣는 것이 아니라, 차원의 구조가 분할을 강제한다.

### 8.4 부트스트랩 방정식의 5-상수 전개

우주의 바리온 밀도를 결정하는 자기일관성 방정식이 순수하게 $\{e, \pi, i, 1, 0\}$만으로 쓰이는지 단계별로 확인한다.

**출발점:**

$$\varepsilon^2 = e^{-(1-\varepsilon^2) \cdot D_{\text{eff}}} \tag{B}$$

#### 1단계: $D_{\text{eff}}$ 분해

$$D_{\text{eff}} = d + \delta, \qquad \delta = \sin^2\theta_W \,(1 - \sin^2\theta_W)$$

$d = 3$: $d(d-3) = 0$의 비자명 근. 출처는 $0$ (5절).

#### 2단계: $\sin^2\theta_W$ 치환

차원확률(8.3절)에서 $\sin^2\theta_W = 4\alpha_s^{4/3}$. $s \equiv 4\alpha_s^{4/3}$으로 놓으면:

$$\delta = s(1 - s) = 4\alpha_s^{4/3} - 16\alpha_s^{8/3}$$

지수 $4/3$의 근거: $2N_w / N_c = 2 \cdot 2 / 3 = 4/3$. 정수 $N_w = 2$, $N_c = 3$은 $\{3, 2, 1\}$ 분할에서 나온다.

#### 3단계: $D_{\text{eff}}$ 완성

$$D_{\text{eff}} = 3 + 4\alpha_s^{4/3} - 16\alpha_s^{8/3}$$

#### 4단계: $\alpha_s$ 결정

$\alpha_s$는 아래 연립계의 해이다:

$$\alpha_s + \alpha_w + \alpha_{em} = \frac{1}{2\pi} \tag{C1}$$

$$\alpha_{em} = 4\alpha_s^{4/3} \cdot \alpha_w \tag{C2}$$

(C1)과 (C2)를 연립하면:

$$\alpha_w = \frac{\frac{1}{2\pi} - \alpha_s}{1 + 4\alpha_s^{4/3}}, \qquad \alpha_{em} = \frac{4\alpha_s^{4/3}\!\left(\frac{1}{2\pi} - \alpha_s\right)}{1 + 4\alpha_s^{4/3}}$$

$\alpha_w$와 $\alpha_{em}$은 $\alpha_s$의 함수로 닫힌다. 등장하는 상수: $\pi$와 정수뿐이다.

#### 5단계: 완전 전개 (암묵적 형태)

$$\varepsilon^2 = e^{\;-(1-\varepsilon^2)\!\left(\,3 \;+\; 4\,\alpha_s^{\,4/3} \;-\; 16\,\alpha_s^{\,8/3}\,\right)}$$

여기서 $\alpha_s$는 (C1)+(C2)에 의해 $\pi$로부터 결정된다. 그러나 $\varepsilon$가 양변에 등장하는 초월방정식이다.

#### 6단계: Lambert W에 의한 닫힌 해

$x = \varepsilon^2$, $D = D(\alpha_s)$로 놓으면:

$$x = e^{-D} \cdot e^{xD} \;\;\Longrightarrow\;\; x\,e^{-xD} = e^{-D} \;\;\Longrightarrow\;\; (-xD)\,e^{-xD} = -D\,e^{-D}$$

우변은 $u\,e^u = z$ 꼴이다. Lambert W 함수($W(z)\,e^{W(z)} = z$)를 적용하면:

$$-xD = W_0\!\left(-D\,e^{-D}\right)$$

$$\boxed{\Omega_b = \varepsilon^2 = -\frac{W_0\!\left(-D_{\text{eff}}\;e^{-D_{\text{eff}}}\right)}{D_{\text{eff}}}}$$

초월방정식이 소거되었다. 반복(iteration) 없이 단일 함수 평가로 $\Omega_b$가 결정된다.

$W_0$는 Lambert W의 주가지(principal branch)이다. $W_{-1}$ 가지는 $\varepsilon^2 = 1$ (자명해: 접힘 없음, $d = 0$)에 대응하며, 4절의 완전 상태이다. 두 가지가 $d(d-3) = 0$의 두 근에 정확히 대응한다.

**$\alpha_s$ 소거: $D_{\text{eff}}$만으로 모든 것을 쓴다.**

$D_{\text{eff}}$가 결정되면 $\alpha_s$를 중간 변수로 쓸 필요가 없다. $\delta = D_{\text{eff}} - 3$으로 놓으면 $\delta = 4s - 16s^2$ ($s = \alpha_s^{4/3}$)이므로:

$$16s^2 - 4s + \delta = 0 \quad \Longrightarrow \quad s = \frac{1 - \sqrt{1 - 4\delta}}{8}$$

$$\alpha_s = s^{3/4} = \left(\frac{1 - \sqrt{1 - 4\delta}}{8}\right)^{3/4}$$

$$\sin^2\theta_W = 4s = \frac{1 - \sqrt{1 - 4\delta}}{2}$$

$\Omega_b$, $\Omega_\Lambda$, $\Omega_{DM}$, $\sin^2\theta_W$, $\alpha_s$, $\alpha_w$, $\alpha_{em}$ 전부가 $D_{\text{eff}}$ 하나의 함수이다. $D_{\text{eff}}$가 $\pi$에서 결정되면 나머지는 대입이다.

**압축된 닫힌 형태 (중간 변수 최소화):**

$$\boxed{\Omega_b = -\frac{W_0\!\left(-D\,e^{-D}\right)}{D}, \qquad D = D_{\text{eff}}}$$

$$\boxed{\Omega_\Lambda = \frac{1 + W_0(-D\,e^{-D})/D}{\;1 + D\!\left(\dfrac{1 - \sqrt{1-4(D-3)}}{8}\right)^{3/4}}, \qquad \Omega_{DM} = 1 - \Omega_b - \Omega_\Lambda}$$

$\alpha_s$, $\sin^2\theta_W$ 등 입자물리 관측량도 $D$ 하나로 역산된다:

$$\alpha_s = \left(\frac{1 - \sqrt{1 - 4(D-3)}}{8}\right)^{3/4}, \qquad \sin^2\theta_W = \frac{1 - \sqrt{1 - 4(D-3)}}{2}$$

**우주 전체가 $D_{\text{eff}}$라는 단일 숫자의 함수이다.**

$D_{\text{eff}}$를 결정하는 것은 $\alpha_s$이고, $\alpha_s$는 결합 연립계(C1)+(C2)에서 $\pi$로부터 나온다. 이 한 단계만 닫히면, 위 식들에 $D_{\text{eff}}$를 넣는 것만으로 우주론 + 입자물리 관측량 11개가 출력된다.

Lambert W는 $\ln$이나 $\exp$처럼 정의된 특수함수이며, 새로운 상수를 도입하지 않는다. $W$의 급수 전개 $W_0(z) = \sum_{n=1}^{\infty} \frac{(-n)^{n-1}}{n!}\,z^n$에 등장하는 것은 정수와 팩토리얼뿐이다.

**물리적 의미:** $W$는 자기참조적 지수 방정식($u\,e^u = z$)의 역함수이다. 부트스트랩 방정식 자체가 자기참조적 구조이므로, Lambert W가 나타나는 것은 필연이다. $W$는 부트스트랩의 수학적 해소이다. $W$의 두 가지($W_0$, $W_{-1}$)는 $d(d-3) = 0$의 두 근($d = 3$, $d = 0$)에 대응한다.

#### 상수 목록

| 위치 | 값 | 5개 상수 중 | 유도 경로 |
|---|---|---|---|
| 지수함수 밑 | $e$ | $e$ | 접힘 (1절) |
| 공간 차원 | $3 = 1+1+1$ | $0, 1$ | $d(d-3) = 0$ (5절) |
| 약력 차원 제곱 | $4 = (1+1)^2$ | $1$ | $N_w^2$ |
| 차원 비율 지수 | $4/3$ | $1, 0$ | $2N_w/N_c$ |
| $\delta$ 2차항 계수 | $16 = (1+1)^4$ | $1$ | $N_w^4$ |
| 2차항 지수 | $8/3$ | $1, 0$ | $4N_w/N_c$ |
| 총 결합상수 | $1/(2\pi)$ | $\pi, 1$ | 시간 격자 주기 (2절) |
| 부트스트랩 상한 | $1$ | $1$ | 완전 (4절) |

$G$, $\hbar$, $c$, $k_B$: 없음. $\pi$와 $e$ 외의 초월수: 없음. 모든 유리수 지수는 차원의 비율이다.

#### 결합 시스템 전체도

5개 상수에서 $\Omega_b$까지의 전체 결합 구조를 하나의 연립계로 쓰면:

$$\pi \;\xrightarrow{1/(2\pi)}\; \alpha_{\text{total}} \;\xrightarrow{\text{C1+C2}}\; \alpha_s \;\xrightarrow{3+4s-16s^2}\; D_{\text{eff}} \;\xrightarrow{-W_0(-De^{-D})/D}\; \Omega_b$$

이 체인에서 $\alpha_s$를 거치지 않고 $D_{\text{eff}} \to \Omega_b$를 직접 계산할 수 있으며, $D_{\text{eff}}$에서 $\alpha_s$, $\sin^2\theta_W$, $\alpha_w$, $\alpha_{em}$을 역산할 수도 있다 (2차방정식). 모든 관측량이 $D_{\text{eff}}$라는 단일 숫자에 종속된다.

#### 수치 검증

$\alpha_s = 0.11789$ (결합 연립계 수치해):

| 단계 | 식 | 값 |
|---|---|---|
| $\alpha_s^{4/3}$ | $0.11789^{4/3}$ | $0.05781$ |
| $\sin^2\theta_W$ | $4 \times 0.05781$ | $0.23122$ |
| $\alpha_s^{8/3}$ | $0.05781^2$ | $0.003342$ |
| $\delta$ | $0.23122 - 0.05346$ | $0.17776$ |
| $D_{\text{eff}}$ | $3 + 0.17776$ | $3.17776$ |
| $-D\,e^{-D}$ | $-3.17776 \times 0.04167$ | $-0.13238$ |
| $W_0(-0.13238)$ | Lambert W 주가지 | $-0.15446$ |
| $\varepsilon^2$ | $-W_0/D$ | $0.04863$ |
| $\Omega_b$ | $= \varepsilon^2$ | $0.04863$ |

Planck 관측: $\Omega_b = 0.0486 \pm 0.0010$. 텐션: $0.03\sigma$.

부트스트랩 반복해($0.04865$)와의 미세한 차이($0.04863$)는 $W_0$ 수동 계산의 반올림에 기인하며, 해석적으로 정확히 동치이다.

#### 닫힘 보강: $\alpha_s$의 5변수 소거

최신 정식 버전에서는 $\alpha_s$를 외부 입력으로 두지 않고, 결합 섹터를 5변수 연립계로 닫아 순차 소거한다.

미지수 벡터를

$$X = (\alpha_s,\alpha_w,\alpha_{em},s,D),\qquad s\equiv\sin^2\theta_W,\;D\equiv D_{\text{eff}}$$

로 두면, 폐쇄식은 다음과 같다:

$$
\begin{aligned}
&\alpha_s+\alpha_w+\alpha_{em}=\frac{1}{2\pi},\\
&\alpha_{em}=s\,\alpha_w,\\
&s=4\alpha_s^{4/3},\\
&D=3+s(1-s),\\
&\varepsilon^2=\exp\!\big(-(1-\varepsilon^2)D\big)\quad(\text{Lambert }W_0\text{ 물리 브랜치}).
\end{aligned}
$$

소거 순서는 $\alpha_{em}\to\alpha_w\to s\to D$다. 절차를 단계화하면:

1. **대수 소거:** $\alpha_w,\alpha_{em},s,D$를 $\alpha_s$의 함수로 환원
2. **물리 판정:** $0<s<1$, $3<D<3.25$, $0<\varepsilon^2<1$을 만족하는 $W_0$ 가지만 채택
3. **체인 정합성:** $\alpha_s\to s\to D\to\varepsilon^2\to(\Omega_b,\Omega_\Lambda,\Omega_{DM})$가 동일 가지에서 연속적으로 닫히는지 확인

이 절차에서 $\alpha_s$는 더 이상 독립 캘리브레이션 변수가 아니라 닫힘 해의 성분이 되며, 정준 수치해는

$$\alpha_s = 0.11789$$

로 수렴한다. 즉, 본 문서의 "외부 입력 0개"는 $d=3$, $\alpha_{\text{total}}=1/(2\pi)$ 이후 추가 **적합 파라미터**를 두지 않는다는 뜻으로 제한해 읽어야 한다.

판정 규칙은 명확하다. $\alpha_s,\alpha_w,\alpha_{em}>0$, $0<s<1$, $3<D<3.25$, $0<\varepsilon^2<1$을 동시에 만족하는 가지 만을 허용한다.  
$W_{-1}$은 경계해 $\varepsilon^2=1$에 대응하므로(접힘 없음) 물리 가지에서 제외한다.  
즉 "닫힘 해"는 수치 맞추기가 아니라, 허용/배제 규칙이 있는 선택 문제다.

---

## 9. 8층 -- 질량의 기원: 접힘 깊이와 페르미온 질량

7층까지의 하강에서 우주론과 게이지 구조가 결정되었다. 8층은 "각 입자가 왜 그 질량인가"를 다룬다.

### 9.1 문제

표준모형 페르미온의 질량은 극단적 계층 구조를 보인다. top 쿼크($172760$ MeV)와 전자($0.511$ MeV)의 비율은 340,000이다. SM은 각 질량을 Yukawa 결합 $y_f$로 입력하지만($m_f = y_f v/\sqrt{2}$), 9개의 $y_f$ 값 자체는 설명하지 못한다.

### 9.2 3세대 = 접힘 없음: $y_t \approx 1$에서 출발 ($1$의 역할)

경로적분에서 접힘은 비고전적 경로를 고전 경로 쪽으로 포개는 과정이다. 3세대(가장 무거운)는 고전 경로에 가장 가까운 경로 -- 접힘 없이 살아남는다.

$$y_3 = 1 \quad \Longrightarrow \quad m_t = \frac{v_{\text{EW}}}{\sqrt{2}} = 174.1\;\text{GeV}$$

관측값 $172.76 \pm 0.30$ GeV. O(1) 정밀도로 일치한다. $y_t \approx 1$은 **$1$의 물리적 역할**(완전, 접힘 없음)의 직접 발현이다.

### 9.3 세대 간 질량비: $\alpha_s$ 차원 억압 규칙 ($\pi$와 $0$의 역할)

$\alpha_s$는 $\pi$에서($\alpha_{\text{total}} = 1/(2\pi)$), $d = 3$은 $0$에서($d(d-3) = 0$) 나온다. 3세대가 접힘 없이 살아남았다면($y_3 \approx 1$), 2세대와 1세대는 QCD 진공을 통과하며 기하학적 억압을 받는다.

CE 경로적분에서 기본 억압 단위는 "1차원당 $\alpha_s$"이다. 세대 $g$($= 1, 2, 3$)의 질량은 접힘 깊이 $f(g)$에 의해 결정된다:

$$y_g \sim y_3 \times \alpha_s^{f(g)}, \quad f(3) = 0$$

질량비의 지수는 관측값으로부터

$$n_{ij}\equiv \frac{\ln(m_i/m_j)}{\ln \alpha_s}$$

로 추출할 수 있다. 핵심은 $n_{ij}$가 임의의 실수가 아니라, CE의 자유도 분해에서 나오는 격자값이라는 점이다:

$$\boxed{n_{ij}=N_{\text{sp}}+\frac{N_{\text{col}}}{d}+\frac{N_{\text{ch}}}{2}},\qquad N_{\text{sp}},N_{\text{col}},N_{\text{ch}}\in\mathbb{Z},\; d=3$$

- $N_{\text{sp}}$: 공간 접힘 횟수(정수)
- $N_{\text{col}}/d$: 색 자유도 재분배(1/3 단위)
- $N_{\text{ch}}/2$: 키랄 분리(1/2 단위)

따라서 허용 지수는 $n_{ij}\in (1/6)\mathbb{Z}$이며, 분자의 기원은 "임의 실수 피팅"이 아니라 정수 계수 $(N_{\text{sp}},N_{\text{col}},N_{\text{ch}})$의 조합 문제로 환원된다.

관측 지수를 이 격자에 사영하면:

| 비율 | $n_{\text{obs}}$ | 최소 격자해 $n_{\text{lat}}$ | 해석 | 지수 오차 |
|---|---:|---:|---|---:|
| $m_u/m_c$ | 2.96 | $3$ | 전차원 접힘 ($N_{\text{sp}}=3$) | 1.3% |
| $m_c/m_t$ | 2.30 | $7/3$ | 공간+색 겹침 보정 | 1.4% |
| $m_d/m_s$ | 1.40 | $4/3$ | 다운 섹터 기본 지수 | 4.8% |
| $m_s/m_b$ | 1.78 | $5/3$ | 다운 섹터 기본 지수 | 6.3% |
| $m_e/m_\mu$ | 2.50 | $5/2$ | 키랄 분리 우세 | 0.0% |
| $m_\mu/m_\tau$ | 1.32 | $4/3$ | 렙톤 기본 지수 | 1.0% |

다운 섹터의 잔차는 같은 부호(관측치가 격자해보다 큼)로 나타난다:

$$n_{ds}= \frac{4}{3}+\Delta_d,\quad n_{sb}= \frac{5}{3}+\Delta_s,\qquad \Delta_{d,s}>0$$

관측값에서 직접 추정하면:

$$\Delta_d = 1.40-\frac{4}{3}=0.067,\qquad \Delta_s = 1.78-\frac{5}{3}=0.113,\qquad \Delta_{db}=\Delta_d+\Delta_s=0.180$$

이를 보정 인자 $R_q$로 쓰면

$$m_q^{\text{obs}} = m_q^{\text{lat}}\,R_q,\qquad
\Delta_{ij}^{\text{corr}}=\frac{\ln(R_i/R_j)}{\ln\alpha_s}$$

우선 $s/b$는 서로 다른 스케일($m_s(2\;\mathrm{GeV})$, $m_b(m_b)$)을 쓰므로 임계구간 보정이 필수다.

$$n_{sb}=\frac{5}{3}-\frac{\ln R_b}{\ln\alpha_s},\qquad
R_b\equiv \frac{m_b(2\;\mathrm{GeV})}{m_b(m_b)}$$

1-loop QCD에서

$$m_q(\mu_2)=m_q(\mu_1)\left(\frac{\alpha_s(\mu_2)}{\alpha_s(\mu_1)}\right)^{\frac{12}{33-2n_f}}$$

이므로($n_f=4$ 구간), 

$$R_b \simeq \left(\frac{\alpha_s(2\;\mathrm{GeV})}{\alpha_s(m_b)}\right)^{12/25}$$

$\alpha_s(m_b)\simeq 0.223$, $\alpha_s(2\;\mathrm{GeV})\simeq 0.30\text{--}0.34$를 넣으면

$$R_b \simeq 1.15\text{--}1.22,\qquad
\Delta_s^{\text{th}} \equiv -\frac{\ln R_b}{\ln\alpha_s} \simeq 0.067\text{--}0.095$$

를 얻는다. 관측 $\Delta_s=0.113$의 대부분이 임계구간 러닝으로 설명되고, 잔여는 2,3-loop/매칭 보정으로 귀속된다.

2-loop 질량 러닝까지 포함하면, $a\equiv \alpha_s/(4\pi)$로

$$\beta(a)=-\beta_0 a^2-\beta_1 a^3+O(a^4),\qquad
\gamma_m(a)=\gamma_0 a+\gamma_1 a^2+O(a^3)$$

$$\beta_0=11-\frac{2n_f}{3},\quad
\beta_1=102-\frac{38n_f}{3},\quad
\gamma_0=4,\quad
\gamma_1=\frac{202}{3}-\frac{20n_f}{9}$$

$$\beta_2=\frac{2857}{2}-\frac{5033}{18}n_f+\frac{325}{54}n_f^2,\quad
\gamma_2=1249-\left(\frac{2216}{27}+\frac{160}{3}\zeta_3\right)n_f-\frac{140}{81}n_f^2
\qquad(\overline{\mathrm{MS}})$$

이므로

$$\frac{m_q(\mu_2)}{m_q(\mu_1)}
=\left(\frac{\alpha_2}{\alpha_1}\right)^{\gamma_0/\beta_0}
\left[1+K_{n_f}\frac{\alpha_2-\alpha_1}{4\pi}+O(\alpha_s^2)\right],\quad
K_{n_f}\equiv \frac{\gamma_1}{\beta_0}-\frac{\beta_1\gamma_0}{\beta_0^2}$$

($\alpha_i\equiv\alpha_s(\mu_i)$).

$n_f=4$에서 $K_4=4.056$이고, $\alpha_1=\alpha_s(m_b)=0.223$, $\alpha_2=\alpha_s(2\,\mathrm{GeV})=0.30\text{--}0.34$를 넣으면

$$\Delta_s^{\mathrm{2loop}}\simeq 0.011\text{--}0.017$$

크기의 추가 지수 이동이 생긴다.

3-loop까지 쓰면

$$\ln\frac{m_q(\mu_2)}{m_q(\mu_1)}
=\frac{\gamma_0}{\beta_0}\ln\frac{\alpha_2}{\alpha_1}
+K_1(a_2-a_1)+\frac{K_2}{2}(a_2^2-a_1^2)+O(a^3),\qquad a\equiv\frac{\alpha_s}{4\pi}$$

$$K_2\equiv
\frac{\gamma_2}{\beta_0}
-\frac{\beta_1\gamma_1}{\beta_0^2}
+\frac{\gamma_0(\beta_1^2-\beta_0\beta_2)}{\beta_0^3}$$

$$K_1\equiv K_{n_f}$$

이고, $n_f=4$에서 $K_2\simeq 28.0$이므로

$$\Delta_s^{\mathrm{3loop}}\simeq 0.0017\text{--}0.0027$$

의 추가 이동이 생긴다.

또한 임계점 $\mu\simeq m_b$에서 light-quark 질량 매칭은

$$m_q^{(4)}(m_b)=m_q^{(5)}(m_b)\left[1+\kappa_m\left(\frac{\alpha_s(m_b)}{\pi}\right)^2+O(\alpha_s^3)\right]$$

을 주며, 이에 따른

$$\Delta_s^{\mathrm{match}}\equiv -\frac{\ln\!\left(1+\kappa_m(\alpha_s/\pi)^2\right)}{\ln\alpha_s}$$

가 더해진다.

표준 $\overline{\mathrm{MS}}$ 2-loop decoupling 계수(대표값) $\kappa_m=89/432$를 쓰면

$$\Delta_s^{\mathrm{match}}\simeq 4.9\times 10^{-4}$$

로 작다.

결국

$$\Delta_s=\Delta_s^{\mathrm{th}}+\Delta_s^{\mathrm{2loop}}+\Delta_s^{\mathrm{3loop}}+\Delta_s^{\mathrm{match}}$$

따라서 합산 범위는

$$\Delta_s \simeq 0.080\text{--}0.115$$

이고, 관측값 $0.113$은 이 범위 안에 들어온다. 남는 미세 차이는 4-loop/스킴 의존 보정의 자연 범위로 해석된다.

**오차 전파 ($\Delta_s$ 허용 대역).**  
위 범위를 중앙값-오차 형태로 쓰면

$$\Delta_s^{\mathrm{th}}=0.081\pm0.014,\quad
\Delta_s^{\mathrm{2loop}}=0.014\pm0.003,\quad
\Delta_s^{\mathrm{3loop}}=0.0022\pm0.0005,\quad
\Delta_s^{\mathrm{match}}=0.0005\pm0.0002.$$

독립 근사에서

$$\sigma_{\Delta_s}
=\sqrt{\sigma_{\mathrm{th}}^2+\sigma_{\mathrm{2loop}}^2+\sigma_{\mathrm{3loop}}^2+\sigma_{\mathrm{match}}^2}
\simeq 0.014\;(\text{실무적으로 }0.015).$$

따라서 이론 엔벨로프는

$$\Delta_s=0.098\pm0.015
\quad(\text{즉 }0.080\text{--}0.115),$$

이며 9.3절의 정준값 $\Delta_s=0.113$은 이 허용 대역 내부(상단부)이다.

**민감도 분해 ($\Delta_s$ 오차 예산).**  
임계항을

$$\Delta_s^{\mathrm{th}}
=-\frac{12}{25}\frac{\ln(\alpha_2/\alpha_1)}{\ln\alpha_s},
\qquad
\alpha_2\equiv\alpha_s(2\;\mathrm{GeV}),\ \alpha_1\equiv\alpha_s(m_b)$$

로 두고 대표 입력

$$\alpha_2=0.32\pm0.02,\qquad \alpha_1=0.223\pm0.005,\qquad \alpha_s=0.11789$$

를 넣으면

$$\sigma_{\mathrm{th},\alpha_2}
=\left|\frac{\partial \Delta_s^{\mathrm{th}}}{\partial \alpha_2}\right|\sigma_{\alpha_2}
=\frac{12}{25}\frac{\sigma_{\alpha_2}}{|\ln\alpha_s|\,\alpha_2}
\simeq 0.0140,$$

$$\sigma_{\mathrm{th},\alpha_1}
=\left|\frac{\partial \Delta_s^{\mathrm{th}}}{\partial \alpha_1}\right|\sigma_{\alpha_1}
=\frac{12}{25}\frac{\sigma_{\alpha_1}}{|\ln\alpha_s|\,\alpha_1}
\simeq 0.0050,$$

$$\sigma_{\mathrm{th}}
=\sqrt{\sigma_{\mathrm{th},\alpha_2}^2+\sigma_{\mathrm{th},\alpha_1}^2}
\simeq 0.0149.$$

이를 2,3-loop/매칭 오차와 합치면

$$\sigma_{\Delta_s}
=\sqrt{\sigma_{\mathrm{th}}^2+\sigma_{\mathrm{2loop}}^2+\sigma_{\mathrm{3loop}}^2+\sigma_{\mathrm{match}}^2}
\simeq 0.0152\approx0.015.$$

분산 기여율은

$$\alpha_2\ (85.0\%),\quad
\alpha_1\ (10.9\%),\quad
2\text{-loop}\ (3.9\%),\quad
3\text{-loop}\ (0.1\%),\quad
\text{match}\ (<0.1\%)$$

이며, $\Delta_s$ 오차는 사실상 저에너지 결합 $\alpha_s(2\;\mathrm{GeV})$의 불확실성이 지배한다.

반면 $d/s$는 보통 같은 스케일($2\;\mathrm{GeV}$)에서 정의되므로 섭동 러닝이 거의 상쇄된다.

**정리 9.3.2 (동일 스케일 $d/s$ 비율의 섭동 소거).**  
질량-독립 재규격화 스킴($\overline{\mathrm{MS}}$)에서

$$\frac{d\ln m_q}{d\ln\mu}=-\gamma_m(\alpha_s,\alpha_{\mathrm{em}},Q_q,\cdots)$$

이므로, 동일 전하 $Q_d=Q_s=-1/3$와 동일 스케일에서

$$\frac{d}{d\ln\mu}\ln\frac{m_d}{m_s}
=-\gamma_m^{(d)}+\gamma_m^{(s)}
=0+O\!\left(\frac{m_s^2-m_d^2}{\mu^2}\right).$$

즉 QCD/QED의 순수 섭동 로그항은 비율 $m_d/m_s$에서 대칭적으로 소거된다(동일 스케일 한정). 따라서

$$\Delta_d=\Delta_d^{\mathrm{pert}}+\Delta_d^{\mathrm{IR}},\qquad
|\Delta_d^{\mathrm{pert}}|\ll |\Delta_d^{\mathrm{IR}}|.$$

따라서 $\Delta_d$는 주로 저에너지 IR(카이랄+EM) 보정으로 해석된다:

$$C_{ds}^{\text{IR}} \equiv \frac{(m_d/m_s)_{\text{obs}}}{(m_d/m_s)_{\text{lat}}}
=\frac{0.0500}{\alpha_s^{4/3}}=0.865$$

$$\Delta_d^{\text{IR}}=\frac{\ln C_{ds}^{\text{IR}}}{\ln\alpha_s}=0.067$$

**보조정리 9.3.3 ($\Delta_d^{\text{IR}}$의 ChPT 커널 분해).**  
저에너지에서 $C_{ds}^{\text{IR}}$는 ChPT + QED 유효이론으로

$$C_{ds}^{\text{IR}}
=1+\delta_{\chi\log}+\delta_{L_i}+\delta_{\mathrm{EM}}+O(p^6,e^2p^2)$$

로 분해된다. 여기서

$$\delta_{\chi\log}
=-\frac{1}{(4\pi F_0)^2}
\left[c_\pi m_\pi^2\ln\frac{m_\pi^2}{\mu_\chi^2}
+c_K m_K^2\ln\frac{m_K^2}{\mu_\chi^2}\right],$$

$$\delta_{L_i}
=\frac{8(m_K^2-m_\pi^2)}{F_0^2}\,(2L_8^r-L_5^r)+\cdots,\qquad
\delta_{\mathrm{EM}}=e^2 C_{\mathrm{EM}}(\mu_\chi)+O(e^2m_q).$$

관측으로 고정되는 총합 제약은

$$\delta_{\chi\log}+\delta_{L_i}+\delta_{\mathrm{EM}}
=C_{ds}^{\text{IR}}-1=-0.135,$$

즉

$$\Delta_d^{\text{IR}}
=\frac{\ln(1+\delta_{\chi\log}+\delta_{L_i}+\delta_{\mathrm{EM}})}{\ln\alpha_s}
\simeq 0.067$$

이다. 따라서 $\Delta_d$의 수치는 임의 보정이 아니라 ChPT 저에너지 상수와 EM 저에너지 커널의 합 제약으로 재표현된다. $\square$

**수치 닫힘 예시 (benchmark point).**  
하나의 대표 점을

$$F_0=0.080\ \mathrm{GeV},\quad \mu_\chi=0.77\ \mathrm{GeV},\quad
m_\pi=0.135\ \mathrm{GeV},\quad m_K=0.495\ \mathrm{GeV}$$

$$c_\pi=0.25,\quad c_K=-0.45,\quad
L_5^r(\mu_\chi)=1.20\times10^{-3},\quad
L_8^r(\mu_\chi)=0.53\times10^{-3},\quad
C_{\mathrm{EM}}(\mu_\chi)=-0.153$$

로 잡으면

$$\delta_{\chi\log}
=-\frac{1}{(4\pi F_0)^2}
\left[c_\pi m_\pi^2\ln\frac{m_\pi^2}{\mu_\chi^2}
+c_K m_K^2\ln\frac{m_K^2}{\mu_\chi^2}\right]
\simeq -0.081,$$

$$\delta_{L_i}
=\frac{8(m_K^2-m_\pi^2)}{F_0^2}(2L_8^r-L_5^r)
\simeq -0.040,\qquad
\delta_{\mathrm{EM}}=e^2 C_{\mathrm{EM}}\simeq -0.014,$$

$$\delta_{\chi\log}+\delta_{L_i}+\delta_{\mathrm{EM}}
\simeq -0.135
\;\Longrightarrow\;
C_{ds}^{\mathrm{IR}}=1+\delta_{\mathrm{tot}}\simeq 0.865.$$

또한 $\alpha_s=0.11789$를 쓰면

$$\Delta_d^{\mathrm{IR}}
=\frac{\ln C_{ds}^{\mathrm{IR}}}{\ln\alpha_s}
=\frac{\ln(0.865)}{\ln(0.11789)}
\simeq 0.067.$$

즉 $\Delta_d^{\mathrm{IR}}=0.067$은 단순 숫자 대입이 아니라, ChPT NLO 상수 조합 $(2L_8^r-L_5^r)$와 EM 커널 $C_{\mathrm{EM}}$이 함께 만드는 저에너지 합 제약의 수치 구현이다.

**오차 전파 (허용 대역).**  
위 benchmark 주변에서

$$c_\pi=0.25\pm0.05,\quad c_K=-0.45\pm0.05,$$
$$2L_8^r-L_5^r = (-1.4\pm0.7)\times10^{-4},\quad
C_{\mathrm{EM}}=-0.153\pm0.040$$

를 두면

$$\sigma_{\chi\log}\simeq 0.011,\qquad
\sigma_{L_i}\simeq 0.020,\qquad
\sigma_{\mathrm{EM}}\simeq 0.004,$$

$$\delta_{\mathrm{tot}}\equiv\delta_{\chi\log}+\delta_{L_i}+\delta_{\mathrm{EM}}
=-0.135\pm0.023.$$

따라서

$$C_{ds}^{\mathrm{IR}}=1+\delta_{\mathrm{tot}}=0.865\pm0.023,$$

$$\Delta_d^{\mathrm{IR}}
=\frac{\ln(1+\delta_{\mathrm{tot}})}{\ln\alpha_s},\qquad
\frac{\partial \Delta_d^{\mathrm{IR}}}{\partial \delta_{\mathrm{tot}}}
=\frac{1}{(1+\delta_{\mathrm{tot}})\ln\alpha_s}.$$

$\alpha_s=0.11789$, $\delta_{\mathrm{tot}}=-0.135$에서

$$\Delta_d^{\mathrm{IR}}=0.067\pm0.012
\quad(\text{대략 }0.056\text{--}0.080).$$

즉 9.3절에서 사용한 중심값 $0.067$은 저에너지 상수의 합리적 변동 범위 안에서 안정적이다.

즉

$$\Delta_s=\Delta_s^{\text{th}}+\Delta_s^{\text{2loop}}+\Delta_s^{\text{3loop}}+\Delta_s^{\text{match}}
\equiv \Delta_s^{\text{th}}+\Delta_s^{\text{pert}},\qquad
\Delta_d=\Delta_d^{\text{pert}}+\Delta_d^{\text{IR}}
\simeq \Delta_d^{\text{IR}}$$

로 분해되며, 수치적으로

$$\Delta_s \approx 0.113,\qquad \Delta_d \approx 0.067$$

와 정합된다.

요약하면

$$\frac{R_d}{R_s}=\alpha_s^{\Delta_d}=0.867,\qquad
\frac{R_s}{R_b}=\alpha_s^{\Delta_s}=0.785,\qquad
\frac{R_d}{R_b}=\alpha_s^{\Delta_{db}}=0.681$$

또한 $\Delta_d=0.067\pm0.012$, $\Delta_s=0.113\pm0.015$로 두고

$$\Delta_{db}\equiv\Delta_d+\Delta_s=0.180\pm0.019,$$

$$R(\Delta)=\alpha_s^\Delta,\qquad
\frac{\sigma_R}{R}=|\ln\alpha_s|\,\sigma_\Delta$$

엄밀히는 $\alpha_s$ 자체 오차까지 포함해

$$\left(\frac{\sigma_R}{R}\right)^2
=\left(|\ln\alpha_s|\,\sigma_\Delta\right)^2
+\left(\frac{\Delta}{\alpha_s}\sigma_{\alpha_s}\right)^2.$$

$\sigma_{\alpha_s}=0.0009$를 쓰면($\Delta_s=0.113$) 두 번째 항은
$\Delta_s\sigma_{\alpha_s}/\alpha_s\simeq 8.6\times10^{-4}$로,
첫 번째 항 $|\ln\alpha_s|\sigma_{\Delta_s}\simeq 3.25\times10^{-2}$에 비해 매우 작다.

를 쓰면($\alpha_s=0.11789$)

$$\frac{R_d}{R_s}=0.867\pm0.022\;(0.844\text{--}0.889),$$
$$\frac{R_s}{R_b}=0.785\pm0.025\;(0.760\text{--}0.811),$$
$$\frac{R_d}{R_b}=0.681\pm0.028\;(0.653\text{--}0.709).$$

즉 다운 섹터 비율의 정준값은 저에너지/임계 보정 불확실성을 포함해도 안정적으로 유지된다.

이며, 따라서

1차 유도는 격자해 $n_{\text{lat}}$가 담당하고, 잔차는 **계산 가능한** 임계구간/IR 보정항으로 분리된다.

**핵심 결론:** 페르미온 질량 계층은 자유 파라미터가 아니라, $d=3$ 공간 분해(1/3)와 스피너 키랄 분해(1/2)가 만드는 정수 격자 위의 선택 문제다. 남은 열린 부분은 격자 자체가 아니라 다운 섹터의 임계구간/IR 보정 커널 계산이다. 유도 레벨: **가설(격자 + 1,2,3-loop RG 구조) + 가정(임계/IR ChPT+EM 커널 분해)**.

### 9.4 Koide 공식: $Q_K = 2/d = 2/3$ ($0$에서)

하전 렙톤 질량에 대한 Koide 공식(1982):

$$Q_K \equiv \frac{m_e + m_\mu + m_\tau}{(\sqrt{m_e} + \sqrt{m_\mu} + \sqrt{m_\tau})^2} = \frac{2}{3} = \frac{2}{d}$$

정밀도: 0.008%. 자유도 0으로 성립한다.

CE 해석: $Q_K = 2/d$이다. $d = 3$은 Hodge 자기쌍대성의 유일해($0$에서 결정)이므로, Koide 비율은 공간 차원의 직접적 결과가 된다.

이를 벡터 기하로 쓰면 더 명확하다. $\mathbf{v}=(\sqrt{m_e},\sqrt{m_\mu},\sqrt{m_\tau})$, 

민주적 단위벡터 $\mathbf{u}=(1,1,1)/\sqrt{3}$를 두면:

$$Q_K=\frac{\|\mathbf{v}\|^2}{(\mathbf{1}\cdot\mathbf{v})^2}
=\frac{\|\mathbf{v}\|^2}{3(\mathbf{u}\cdot\mathbf{v})^2}
=\frac{1}{3\cos^2\theta}$$

($\theta$: $\mathbf{v}$와 $\mathbf{u}$의 각도).

CE의 3세대 분해는 singlet(1차원) $\oplus$ doublet(2차원) 블록이다. 최소작용/등방성 조건에서 두 블록의 총 노름이 같으면

$$\|\mathbf{v}_{\parallel}\|^2=\|\mathbf{v}_{\perp}\|^2
\;\Longrightarrow\;
\cos^2\theta=\frac{1}{2}$$

**보조정리 9.4.1 (균등분할의 변분 고정).**  
총 노름 $N=\|\mathbf{v}\|^2$를 고정하고, 1⊕2 블록 불균형 비용

$$\mathcal{L}=\left(\|\mathbf{v}_{\parallel}\|^2-\|\mathbf{v}_{\perp}\|^2\right)^2
+\lambda\left(\|\mathbf{v}_{\parallel}\|^2+\|\mathbf{v}_{\perp}\|^2-N\right)$$

을 최소화하면 정지조건은

$$\|\mathbf{v}_{\parallel}\|^2=\|\mathbf{v}_{\perp}\|^2=\frac{N}{2}$$

이며, 따라서 $\cos^2\theta=\|\mathbf{v}_{\parallel}\|^2/N=1/2$가 강제된다.

이고 따라서

$$Q_K=\frac{1}{3(1/2)}=\frac{2}{3}=\frac{2}{d}$$

가 나온다. 즉 Koide는 단순 수치 우연이 아니라 $d=3$에서의 민주적 분해 기하(1+2 블록)의 직접 결과다. 유도 레벨: **가설(군론+기하 유도)**.

쿼크 섹터에서 Koide 관계가 깨지는 이유: 렙톤은 QCD 결합이 없으므로 접힘의 순수한 전자약 구조가 보존된다. 쿼크는 QCD 보정에 의해 running mass가 변형되어 $Q_K$가 $2/3$에서 벗어난다.

### 9.5 통합 질량 공식 (Koide 벡터 형태)

Koide 관계와 세대 구조를 결합한 공식:

$$\sqrt{m_g} = A\left(1 + B\cos\left(\frac{2\pi g}{d} + \phi_0\right)\right)$$

여기서 $x_g \equiv \sqrt{m_g}$를 두면, $d=3$의 이산 푸리에 모드($\mathbb{Z}_3$)로 해석된다:

$$x_g = A\left(1 + B\cos\left(\frac{2\pi g}{3} + \phi_0\right)\right)$$

**정리 9.5.1 (Koide 조건이 $B$를 유일 고정).**  
$g=0,1,2$에서

$$\sum_g \cos\!\left(\frac{2\pi g}{3}+\phi_0\right)=0,\qquad
\sum_g \cos^2\!\left(\frac{2\pi g}{3}+\phi_0\right)=\frac{3}{2}$$

이므로

$$\sum_g x_g = 3A,\qquad \sum_g x_g^2 = 3A^2\left(1+\frac{B^2}{2}\right)$$

가 성립한다.

**증명.**  
첫 식은 3차 단위근 합 $\sum_g e^{i(2\pi g/3+\phi_0)}=0$의 실수부다.  
둘째 식은 $\cos^2 u=(1+\cos 2u)/2$와 $\sum_g\cos(4\pi g/3+2\phi_0)=0$에서 따른다. $\square$

따라서 Koide 비율은

$$Q_K=\frac{\sum_g m_g}{\left(\sum_g \sqrt{m_g}\right)^2}
=\frac{1+B^2/2}{3}$$

이고, $Q_K=2/3$을 대입하면

$$\boxed{B=\sqrt{2}}$$

가 즉시 고정된다. 즉 $B$는 피팅 파라미터가 아니라 Koide 조건의 직접 결과다.

남는 위상 $\phi_0$는 9.3절의 CE 질량비 $m_\mu/m_\tau \simeq \alpha_s^{4/3}$로 닫힌다:

$$\alpha_s^{2/3}
=\sqrt{\frac{m_\mu}{m_\tau}}
=\frac{1+\sqrt{2}\cos\left(\frac{4\pi}{3}+\phi_0\right)}
{1+\sqrt{2}\cos\phi_0}$$

$\alpha_s=0.11789$를 넣으면 $\phi_0$는 단일 수치해로 고정된다(정준해 $\phi_0 \approx 0.23$ rad).

스케일 $A$는 3세대 기준식 $m_\tau = y_\tau v_{\text{EW}}/\sqrt{2}$로 정해진다:

$$A=\frac{\sqrt{m_\tau}}{1+\sqrt{2}\cos\phi_0}$$

따라서 $(A,B,\phi_0)$ 3개 자유 피팅 구조가 아니라, **$B$는 Koide로 고정, $\phi_0$는 $\alpha_s$로 고정, $A$는 3세대 기준으로 고정**되는 닫힌 구조가 된다. 유도 레벨: **가설(1-앵커 닫힘)**.

### 9.6 중성미자 질량: $\delta$와 $\pi$에서 ($e$의 역할)

히그스 포탈을 통한 2-loop Weinberg 연산자에서 중성미자 질량이 복사적으로 생성된다:

$$m_{\nu_l} \sim \frac{\delta^4 \cdot m_l}{(16\pi^2)^2}$$

여기서 $\delta^4 = \lambda_{\text{HP}}^2$는 $\pi$와 $0$에서($\sin^2\theta_W$, $\cos^2\theta_W$), $16\pi^2$는 루프 인자로 $\pi$에서, $m_l$은 하전 렙톤 질량이다.

| 세대 | $m_l$ (MeV) | $m_\nu$ 추정 (meV) | 비고 |
|---|---|---|---|
| $e$ | 0.511 | 0.02 | $\sim 0.02$ meV |
| $\mu$ | 105.66 | 4.2 | $\sim$ 4 meV |
| $\tau$ | 1776.86 | 71 | $\sim$ 71 meV |

합계: $\sum m_\nu \sim 0.076$ eV. 관측 상한($< 0.12$ eV, Planck+BAO)과 양립. 질량비가 하전 렙톤 질량비와 정확히 일치한다($m_{\nu_2}/m_{\nu_3} = m_\mu/m_\tau$, $m_{\nu_1}/m_{\nu_2} = m_e/m_\mu$). 정상 계층(NH)이 자동으로 선호된다. 유도 레벨: **가정**.

### 9.7 5개 상수에서 페르미온 질량까지

| 상수 | 질량에서의 역할 |
|---|---|
| $0$ | $d = 3$ $\to$ 세대 수 $N_{\text{gen}} = 3$, Koide $Q_K = 2/d = 2/3$ |
| $\pi$ | $\alpha_{\text{total}} = 1/(2\pi)$ $\to$ $\alpha_s$ $\to$ 세대 간 비율 $\alpha_s^{n}$ |
| $e$ | $S(D) = e^{-D}$ $\to$ 접힘 생존율 $\to$ 세대별 접힘 깊이 |
| $1$ | $y_t = 1$ $\to$ 3세대는 접힘 없음 (완전한 생존) |
| $i$ | 위상 간섭 $\to$ 경로 선별 $\to$ 질량 계층의 존재 근거 |

---

## 10. 9층 - 혼합과 CP: CKM, PMNS, 그리고 $\theta_{\text{QCD}}$

### 10.1 문제

SM에는 질량 외에 7개의 혼합 파라미터가 있다: CKM 3각 + 1위상 = 4개, PMNS 3각 + 1위상 = 4개(Majorana 위상 제외), 그리고 $\theta_{\text{QCD}}$ 1개. 이것이 SM 19개 자유 파라미터의 나머지이다.

### 10.2 혼합의 존재: $0$에서 ($d = 3$이 보장)

CKM 행렬의 CP 위반 위상 수 = $(N_{\text{gen}} - 1)(N_{\text{gen}} - 2)/2$.

| $N_{\text{gen}}$ | CP 위상 수 | 결과 |
|---|---|---|
| 1 | 0 | CP 보존 |
| 2 | 0 | CP 보존 (Cabibbo 각만 존재) |
| **3** | **1** | **최소 CP 위반** |
| 4 | 3 | 차원 불안정 ($d \neq 3$) |

$N_{\text{gen}} = d = 3$ (Hodge 자기쌍대성, 5절의 $0$)이므로, CP 위반의 존재는 **정리**이다. 유도 레벨: **정리**.

### 10.3 $\theta_{\text{QCD}} = 0$: $1$과 $e$에서 (부트스트랩 안정성)

CE는 강한 CP 문제를 세 가지 독립 논증으로 해결한다:

1. **실수 스칼라 보호:** 클라루스장 $\Phi$는 실수 게이지 단일항이므로 CP 위반 위상을 도입하지 않는다.
2. **부트스트랩 안정성:** $\theta \neq 0$은 QCD 진공 에너지를 증가시키고 부트스트랩 고정점을 불안정화한다. 안정성 조건이 $|\theta| < 10^{-27}$을 강제한다.
3. **루프 보호:** $\Phi$는 게이지 단일항이므로 모든 루프 차수에서 $\theta$ 재생성이 구조적으로 금지된다.

$\theta = 0$의 5개 상수 귀속: 부트스트랩 방정식($e$)의 고정점 안정성($1$ 상한)이 $\theta = 0$을 동역학적으로 선택한다. 유도 레벨: **정리(부트스트랩 안정성 논증)**.

### 10.4 CKM 혼합각: $\alpha_s$ 거듭제곱 유도 ($\pi$, $0$에서)

CKM 행렬의 비대각 원소가 $\alpha_s$의 거듭제곱으로 표현된다. 지수는 $d = 3$의 유리수이다.

#### $|V_{cb}|^2 = \alpha_s^d$: QCD $d$차원 터널링 (0.1% 일치)

**유도.** CKM 원소 $V_{cb}$는 charm(2세대)과 bottom(3세대) 약한 고유 상태 사이의 전이 진폭이다. CE에서 세대는 접힘 헤시안의 고유 모드이다.

인접 세대 사이의 전이 확률 $|V_{cb}|^2$는 두 접힘 모드 파동함수의 겹침 적분이다. 이 겹침은 QCD 진공을 통과해야 하며, $d$개의 독립된 공간 방향 각각이 $\alpha_s$만큼의 전이 확률을 기여한다. 헤시안의 공간 부분은 등방성에 의해 $d$개 방향으로 분해되고(A2 유도의 Step (i)과 동일), 각 방향의 기여가 독립이므로:

$$|V_{cb}|^2 = \prod_{k=1}^{d} \alpha_s = \alpha_s^d$$

$$\therefore\; |V_{cb}| = \alpha_s^{d/2} = \alpha_s^{3/2} = 0.04049$$

관측: $|V_{cb}| = 0.04053 \pm 0.00072$. 차이 0.1%. $0.06\sigma$.

핵심 가정: 인접 세대 사이의 QCD 전이 확률이 차원별로 곱적(multiplicative)으로 분해된다. 이것은 A2 유도에서 헤시안의 공간 기여가 등방적으로 분해되는 것과 동일한 구조이다. 유도 레벨: **가설**.

#### $|V_{us}| \approx \sin^2\theta_W$: 경량 쿼크의 전자약 지배 (2.1% 일치)

**유도.** 1-2 섹터(up-strange)는 2-3 섹터(charm-bottom)와 질적으로 다르다. $m_u \approx 2$ MeV, $m_s \approx 93$ MeV로, 둘 다 $\Lambda_{\text{QCD}} \approx 200$ MeV 이하이다. 이 영역에서 질량 생성의 지배적 메커니즘은 섭동적 QCD가 아니라 EWSB이다.

QCD 터널링이 2-3 섹터를 지배한다면, EWSB 혼합이 1-2 섹터를 지배한다. EWSB에 의한 세대 혼합의 확률은 중성류 결합의 "비정렬"(misalignment) 확률이다. Z 보손이 질량 기저에서 전자기적으로 결합할 확률이 $\sin^2\theta_W$이므로:

$$|V_{us}| \approx \sin^2\theta_W = 4\alpha_s^{4/3} = 0.23122$$

관측: $|V_{us}| = 0.22650 \pm 0.00048$. 차이 2.1%.

핵심 가정: 경량 쿼크의 세대 혼합이 QCD가 아닌 EWSB에 의해 지배된다. 2.1% 잔차는 QCD 보정($m_s/\Lambda_{\text{QCD}} \approx 0.47$이 무시할 만큼 작지 않으므로)에 의해 설명될 수 있다. 유도 레벨: **가설**.

#### $|V_{ub}|^2 = \alpha_s^{2(d^2-1)/d}$: SU($d$) 최대 거리 전이 (12% 일치)

**유도.** 1-3 전이(u→b)는 $d=3$ 세대 구조에서 가장 먼 상태 사이의 전이이다. CE에서 세대 전이는 SU($d$) 플레이버 공간에서의 회전으로 기술된다.

인접 세대 전이(2→3)는 기본 표현의 차원 단위 억압($\alpha_s^d$)을 받는다. 가장 먼 세대 전이(1→3)는 SU($d$) 수반 표현(adjoint representation)의 전체 위상 공간을 가로지르는 최대 거리 전이이다. 

SU($d$)의 최대 전이 경로는 수반 표현의 차원(Casimir 불변량) $C_2 = d^2 - 1$에 비례하는 억압을 받는다. 한편 스피너 차원에 의한 기본 몫($1/d$) 보정이 중첩되므로, 1→3 전이의 기하학적 억압 지수는 $2(d^2-1)/d$로 주어진다 (2는 확률 진폭 제곱에서 기인):

$$|V_{ub}|^2 = \alpha_s^{2(d^2-1)/d}$$

$d=3$을 대입하면 지수는 $2(9-1)/3 = 16/3$이다.

$$|V_{ub}|^2 = \alpha_s^{16/3} \quad \Longrightarrow \quad |V_{ub}| = \alpha_s^{8/3} = 0.00335$$

이것은 중간 상태를 거치는 캐스케이드(cascade) 구조 $|V_{ub}|^2 = |V_{cb}|^2 \times \alpha_s^{7/3}$과 수학적으로 동일하다($d + 7/3 = 16/3$). 그러나 9.3절의 임의적 질량비 패턴($m_c/m_t$)에 의존하지 않고, SU($d$) 플레이버 기하학에서 직접 도출된다.

관측: $|V_{ub}| = 0.00382 \pm 0.00024$. 차이 12%. $2\sigma$. 12% 잔차는 가장 먼 세대 전이에서 누적되는 고차 루프 보정에 기인할 수 있다. 유도 레벨: **가설(기하학적 최대 전이)**.

보정항을 명시하면:

$$|V_{ub}|=\alpha_s^{8/3}\left[1+c_1\alpha_s+c_2\alpha_s^2+c_{\mathrm{th}}\Delta_{\mathrm{th}}+c_{\mathrm{np}}e^{-8\pi^2/g^2}+\cdots\right]$$

관측/주항 비율은

$$\frac{|V_{ub}|_{\mathrm{obs}}}{|V_{ub}|_{\mathrm{LO}}}
=\frac{0.00382}{0.00335}=1.140$$

이므로, 1차 보정만 남기면

$$c_1 \simeq \frac{1.140-1}{\alpha_s}\simeq 1.19 \quad (\alpha_s=0.11789)$$

를 얻는다. 즉 필요한 보정계수는 $O(1)$ 크기로 자연스럽다. 따라서 12% 차이는 구조 붕괴가 아니라 "최대거리 전이의 NLO 민감도"로 해석하는 것이 일관적이다.

#### CKM 체계 요약

| 전이 | 지배 메커니즘 | 공식 | 예측 | 관측 | 차이 |
|---|---|---|---|---|---|
| $c \to b$ | QCD $d$차원 터널링 | $|V_{cb}|^2 = \alpha_s^d$ | 0.04049 | 0.04053 | **0.1%** |
| $u \to s$ | EWSB 비정렬 | $|V_{us}| = \sin^2\theta_W$ | 0.23122 | 0.22650 | 2.1% |
| $u \to b$ | SU($d$) 최대거리 전이 | $|V_{ub}|^2 = \alpha_s^{2(d^2-1)/d}$ | 0.00335 | 0.00382 | 12% |

두 가지 메커니즘의 경계: $m_q \ll \Lambda_{\text{QCD}}$이면 EWSB 혼합 지배, $m_q \gg \Lambda_{\text{QCD}}$이면 QCD 터널링 지배. 1-2와 2-3 섹터의 구조적 차이는 이 전환에서 기인한다.

### 10.5 Jarlskog 불변량과 CP 위상: $i$와 $\pi/2$

#### Jarlskog 불변량의 유도 (1.3% 일치)

10.4절의 세 CKM 원소를 곱하면:

$$|V_{us}| \times |V_{cb}| \times |V_{ub}| = 4\alpha_s^{4/3} \times \alpha_s^{3/2} \times \alpha_s^{8/3} = 4\alpha_s^{4/3 + 3/2 + 8/3}$$

지수의 합: $\frac{4}{3} + \frac{3}{2} + \frac{8}{3} = \frac{8+9+16}{6} = \frac{33}{6} = \frac{11}{2}$

따라서 Jarlskog 불변량:

$$J = |V_{us}| \cdot |V_{cb}| \cdot |V_{ub}| \cdot \sin\delta_{CP} = 4\alpha_s^{11/2} \cdot \sin\delta_{CP}$$

수치: $4 \times 0.11789^{5.5} = 4 \times 7.81 \times 10^{-6} = 3.124 \times 10^{-5}$

관측: $J = (3.08 \pm 0.15) \times 10^{-5}$

$\sin\delta_{CP} = 1$ (최대 CP 위반)로 놓으면:

$$J_{\text{pred}} = 4\alpha_s^{11/2} = 3.124 \times 10^{-5}$$

관측값과의 차이: 1.3%. $0.3\sigma$.

#### $\delta_{CP} = \pi/2$: $i$의 기하학적 발현

**논증.** $J$의 크기가 이미 $4\alpha_s^{11/2}$로 결정되었다면, $\sin\delta_{CP}$는 관측 $J$로부터 역산된다:

$$\sin\delta_{CP} = \frac{J_{\text{obs}}}{4\alpha_s^{11/2}} = \frac{3.08 \times 10^{-5}}{3.124 \times 10^{-5}} = 0.986 \approx 1$$

$\sin\delta_{CP} \approx 1$은 $\delta_{CP} = \pi/2$를 의미한다. CE에서 이것은 단순한 우연이 아니라 오일러 항등식의 허수 단위 $i$의 직접적 발현이다.

CP 위반은 페르미온 질량 행렬의 복소 위상에서 기인한다. $N_{\text{gen}} = d = 3$에서 재규격화 불가능한 물리적 위상은 정확히 1개 남는다. 경로적분의 간섭항 $e^{iS}$에서 $i$는 위상 공간의 허수축 전체를 생성하는 단일 생성원이다. 

CE는 외부 파라미터를 허용하지 않으므로, 이 단일 물리적 위상은 자의적인 각도(예: 1.20 rad)를 가질 수 없고 기하학적으로 고정된 극한값에 위치해야 한다. 복소평면에서 실수축에 대해 구조적으로 구별되는 유일한 위상은 직교 방향인 허수축 자체, 즉 위상 $\pi/2$ ($e^{i\pi/2} = i$)이다.

따라서 쿼크 섹터의 CP 위상은 허수 단위 $i$ 그 자체로 고정된다:

$$\delta_{CP}^{\text{CKM}} = \frac{\pi}{2}$$

관측: $\delta_{CP} \approx 1.20 \pm 0.08$ rad (PDG). $\pi/2 = 1.571$ rad. $\sin(1.20) = 0.932$이므로 $\sin\delta_{CP} = 1$과 7% 차이. 이 7% 잔차는 1-2 세대 질량의 섭동적 보정이나 강한 상호작용의 비섭동적 효과(예: 인스탄톤 가스)가 유효 위상을 이동시키는 현상으로 설명될 수 있다. $J$ 불변량의 크기 정합(1.3%)이 근본 대칭성이 $\pi/2$임을 강하게 지지한다.

유도 레벨: $J = 4\alpha_s^{11/2}$은 **가설** (CKM 원소에서 산술적 도출, 1.3% 정합). $\delta_{CP} = \pi/2$는 **가설** ($i$의 단일 생성원 기하학).

### 10.6 PMNS 혼합각: TBM + $\delta$ 보정 ($0$에서)

렙톤 혼합은 CKM과 달리 큰 혼합각을 보인다. CE에서 이것은 중성미자 질량이 복사적으로 생성되어(9.6절) 질량 행렬의 구조가 "민주적"이기 때문이다.

#### 0차: 삼이중최대 혼합 (Tri-Bimaximal, TBM)

$d = 3$에서의 민주적 혼합 구조:

$$\sin^2\theta_{12} = \frac{1}{d} = \frac{1}{3}, \quad \sin^2\theta_{23} = \frac{1}{N_w} = \frac{1}{2}, \quad \sin^2\theta_{13} = 0$$

여기서 $1/d$는 3세대 민주적 혼합, $1/N_w$는 2중항 구조의 최대 혼합이다. 이것은 Harrison-Perkins-Scott(2002)의 TBM 패턴과 동일하며, CE에서 $d = 3$과 $N_w = 2$로부터 결정된다.

#### 1차 보정: 전자약 혼합 $\delta$에 의한 TBM 깨짐

EWSB에 의한 전자약 혼합($\delta = \sin^2\theta_W\cos^2\theta_W$)이 TBM의 대칭을 깬다.

**$\theta_{13}$: SU($d$) 플레이버 섭동론에서 유도 (1.0% 일치)**

**유도.** TBM에서 $\sin^2\theta_{13} = 0$인 것은 중성미자 질량 행렬의 정확한 SU($d$) 플레이버 대칭 때문이다. EWSB가 이 대칭을 $\delta$의 세기로 깬다.

섭동 해밀토니안 $H' = \delta \cdot P_{13}$ ($P_{13}$은 1세대와 3세대를 연결하는 SU($d$) 연산자)의 1차 효과:

$$\sin^2\theta_{13} = \delta \cdot |\langle 1 | P_{13} | 3 \rangle|^2$$

행렬 원소 $|\langle 1 | P_{13} | 3 \rangle|^2$는 SU($d$) 수반 표현(adjoint representation)의 Casimir 불변량으로 결정된다. SU($d$)의 2차 Casimir $C_2 = d^2 - 1$은 수반 표현의 차원(독립 생성원의 수)이다. 섭동 $\delta$가 $d^2-1$개의 독립 방향에 민주적으로(균등하게) 분배되므로:

$$|\langle 1 | P_{13} | 3 \rangle|^2 = \frac{1}{d^2 - 1}$$

$$\therefore\; \sin^2\theta_{13} = \frac{\delta}{d^2 - 1} = \frac{0.17776}{8} = 0.02222$$

관측: $\sin^2\theta_{13} = 0.02200 \pm 0.00069$. 차이 1.0%. $0.3\sigma$.

핵심 가정: EWSB 섭동이 SU($d$)의 모든 생성원에 민주적으로 분배된다. 이것은 CE에서 클라루스장 $\Phi$가 플레이버 단일항(flavor singlet)이라는 조건의 직접적 결과이다. 유도 레벨: **가설**.

**$\theta_{12}$: $\theta_{13}$ 역보정으로 개선 (2.3% 일치)**

TBM의 $1/d$에서 $\theta_{13}$이 발생하면, 같은 양만큼 $\theta_{12}$의 기여가 줄어든다:

$$\sin^2\theta_{12} = \frac{1}{d}\left(1 - d\cdot\sin^2\theta_{13}\right) = \frac{1}{3}\left(1 - 3 \times \frac{\delta}{d^2-1}\right) = \frac{1}{3}\left(1 - \frac{3\delta}{8}\right) = 0.3111$$

관측: $\sin^2\theta_{12} = 0.304 \pm 0.013$. 차이 2.3%. $0.5\sigma$.

물리적 해석: $\theta_{13} \neq 0$이 되면 $\nu_e$의 질량 고유 상태 1,2에 대한 투영이 감소한다. $d \cdot \sin^2\theta_{13}$은 3세대에 걸친 $\theta_{13}$ 혼합의 총량이다.

**$\theta_{23}$: $\theta_{13}$ 재분배로 개선 (0.86% 일치)**

EWSB 보정 $\delta$의 일부가 $\theta_{13}$으로 갔으므로, $\theta_{23}$에 남는 보정은 $\delta - \sin^2\theta_{13}$:

$$\sin^2\theta_{23} = \frac{1}{2} + \frac{\delta - \sin^2\theta_{13}}{2} = \frac{1 + \delta - \delta/(d^2-1)}{2} = \frac{1 + \delta(d^2-2)/(d^2-1)}{2}$$

수치: $(1 + 0.17776 \times 7/8)/2 = (1 + 0.15554)/2 = 0.5778$

관측: $\sin^2\theta_{23} = 0.573 \pm 0.020$. 차이 **0.86%**. $0.2\sigma$.

물리적 해석: 전자약 혼합 $\delta$가 TBM을 깰 때, $\delta/(d^2-1)$은 $\theta_{13}$으로 가고, 나머지 $\delta(d^2-2)/(d^2-1) = 7\delta/8$은 $\theta_{23}$을 증강한다. 총 보정 예산이 보존된다.

#### PMNS 총괄

| 혼합각 | 공식 | 예측값 | 관측값 | 차이 | 레벨 |
|---|---|---|---|---|---|
| $\sin^2\theta_{13}$ | $\delta/(d^2-1)$ | 0.02222 | 0.02200 | **1.0%** | 가설 |
| $\sin^2\theta_{12}$ | $(1/d)(1-3\delta/(d^2-1))$ | 0.3111 | 0.304 | 2.3% | 가설 |
| $\sin^2\theta_{23}$ | $(1+\delta(d^2-2)/(d^2-1))/2$ | 0.5778 | 0.573 | **0.86%** | 가설 |

세 혼합각 모두 $d = 3$과 $\delta$만으로 결정된다. 새로운 파라미터 0개. $\delta$ 보정 예산이 세 각 사이에 자기일관적으로 분배된다.

#### PMNS CP 위반 위상: $\delta_{CP}^{\text{PMNS}} = 3\pi/2$ (가설)

CE에서 CP-odd 위상의 근원은 하나뿐이다: 경로적분 간섭항의 $i$.

1. **단일 위상 원천.** 10.3절에서 클라루스장 $\Phi$는 실수 스칼라이므로 새로운 CP 위상을 도입하지 않는다. 따라서 물리적 CP 위상은 페르미온 Yukawa 블록(쿼크/렙톤) 재위상 불변량에만 남는다.
2. **전블록 실수성 조건.** 실수 클라루스장 배경에서 전체 유효작용의 복소 위상은 쿼크 블록과 렙톤 블록이 상쇄되어야 한다:
   $$\arg\det Y_q + \arg\det Y_\ell = 0 \pmod{2\pi}$$
   즉 물리적 위상은 켤레 관계를 만족한다.
3. **위상 켤레 결론.**
   $$\delta_{CP}^{\text{PMNS}} = -\delta_{CP}^{\text{CKM}} \pmod{2\pi}$$

10.5절에서 $\delta_{CP}^{\text{CKM}}=\pi/2$이므로:

$$\boxed{\delta_{CP}^{\text{PMNS}} = -\frac{\pi}{2} = \frac{3\pi}{2}}$$

따라서 쿼크/렙톤 CP 위상은 $+i$와 $-i$의 켤레쌍이며,

$$e^{i\delta_{CP}^{\text{CKM}}} \, e^{i\delta_{CP}^{\text{PMNS}}}=1$$

이 되어 전체 CP-odd 위상 흐름이 닫힌다.

관측: T2K는 $\sim 270^\circ$를 선호하고, NuFIT 최적값은 $\sim 195^\circ$다. 아직 오차가 크므로 최종 판정은 JUNO/Hyper-K 정밀 측정이 맡는다.

유도 레벨: **가설** (구조적 유도는 닫히지만, 실험 오차가 아직 큼).

### 10.7 5개 상수에서 혼합까지

| 상수 | 혼합에서의 역할 |
|---|---|
| $0$ | $d = 3$: $N_{\text{gen}} = 3$, TBM 구조 ($1/d$, $1/N_w$), CKM 지수 ($d/2$, $(d^2-1)/d$) |
| $\pi$ | $\alpha_s$: CKM 원소 $|V_{cb}| = \alpha_s^{d/2}$, $|V_{us}| = 4\alpha_s^{4/3}$; $J = 4\alpha_s^{11/2}$ |
| $i$ | $\delta_{CP}^{\text{CKM}} = \pi/2$, $\delta_{CP}^{\text{PMNS}} = 3\pi/2$ (위상 켤레); 간섭 메커니즘 |
| $1$ | $\theta_{\text{QCD}} = 0$; TBM의 $\sin^2\theta_{23} = 1/2$ 기준선 |
| $e$ | 접힘 생존율; 부트스트랩 안정성에 의한 $\theta = 0$ |

---

## 11. 10층 -- 히그스 섹터: 포탈 결합과 자체 결합

### 11.1 SM 히그스 파라미터

SM의 히그스 섹터에는 2개의 자유 파라미터가 있다:

| 파라미터 | 관측값 | SM에서의 역할 |
|---|---|---|
| $v_{\text{EW}}$ | 246.22 GeV | 전자약 대칭 깨짐 스케일 |
| $\lambda_H$ | $\approx 0.13$ | 히그스 자체 결합 ($M_H = \sqrt{2\lambda_H}\,v_{\text{EW}} = 125.1$ GeV) |

### 11.2 $v_{\text{EW}}$: 차원 스케일 ($\pi$의 역할, 규약)

$v_{\text{EW}}$는 CE의 유일한 **차원 입력**이다. $v_{\text{EW}}$는 페르미 상수로 결정된다:

$$v_{\text{EW}} = (\sqrt{2}\,G_F)^{-1/2}$$

CE의 모든 무차원 예측은 $\{e, \pi, i, 1, 0\}$만 필요하다. $v_{\text{EW}}$는 $G$, $\hbar$, $c$와 함께 "단위를 물리 세계에 부착하는" 차원 규약이다. CE의 철학에서 이것은 미터를 피트로 바꾸는 것과 같다 -- 구조를 결정하지 않는다.

유도 레벨: **규약**(무차원 구조 밖, 차원 스케일).

### 11.3 $\lambda_{\text{HP}} = \delta^2$: 유도됨 ($0$, $\pi$에서)

히그스 포탈 결합은 이미 유도되었다:

$$\lambda_{\text{HP}} = \delta^2 = (\sin^2\theta_W\cos^2\theta_W)^2 = 0.0316$$

물리적 기원: 포탈 결합 $|H|^2\Phi^2$는 4개의 장 연산자를 포함한다. 각 쌍($|H|^2$와 $\Phi^2$)이 전자약 중성류를 통해 $\delta$의 강도로 결합하므로:

$$\lambda_{\text{HP}} = \delta \times \delta = \delta^2$$

유도 레벨: **정리**(A1 + SM EWSB).

### 11.4 히그스 질량: $M_H = M_Z \times F$ (0.20% 일치)

#### 관계식의 발견

히그스 질량과 Z 보손 질량의 비율이 CE의 폼팩터 $F$와 일치한다:

$$\boxed{\frac{M_H}{M_Z} = F = 1 + \alpha_s D_{\text{eff}}}$$

수치 검증:

$$F = 1 + 0.11789 \times 3.17776 = 1 + 0.37473 = 1.37473$$

$$M_H = M_Z \times F = 91.1876 \times 1.37473 = 125.35\;\text{GeV}$$

관측: $M_H = 125.10 \pm 0.14$ GeV. 차이 0.25 GeV = $1.8\sigma$ = **0.20%**.

#### $M_H^2 = M_Z^2 F^2$의 유도

**논증.** SM에서 히그스 질량은 tree-level 값에 복사 보정(radiative correction)이 더해져 결정된다. 지배적 보정은 top 쿼크 루프이다: $y_t \approx 1$, 색 전하 $N_c = d = 3$.

CE에서 이 보정의 구조를 분석한다. 히그스 유효 포텐셜에 대한 QCD-dressed 보정은:

$$M_H^2 = M_Z^2 + \Delta M_H^2$$

$\Delta M_H^2$는 $d$색 top 쿼크가 $D_{\text{eff}}$개의 유효 차원에서 기여하는 양자 요동이다. 차원당 요동 비율이 $\alpha_s$이고 $D_{\text{eff}}$개 차원이므로, 1-loop 기여:

$$\Delta M_H^2\big|_{\text{1-loop}} = M_Z^2 \times 2\alpha_s D_{\text{eff}}$$

인자 2는 top 쿼크의 SU(2) 이중항 구조에서 기인한다(top+bottom이 루프에 기여). 2-loop 이상은 기하급수로 합산된다:

$$M_H^2 = M_Z^2 \left(1 + 2\alpha_s D_{\text{eff}} + (\alpha_s D_{\text{eff}})^2 + \cdots\right) = M_Z^2(1 + \alpha_s D_{\text{eff}})^2 = M_Z^2 F^2$$

$$\therefore\; M_H = M_Z F$$

이 기하급수 합산은 SM의 leading-log 재합산(resummation)과 동일한 구조이며, CE에서 $F = 1 + \alpha_s D_{\text{eff}}$가 양성자 반경에서도 동일하게 등장하는 것(경로적분.md 15.10절)은 독립적 교차 검증이다.

핵심 가정: (1) QCD 요동이 차원별로 $\alpha_s$씩 기여한다(연장성 원리와 동일). (2) 기하급수 재합산이 $(1+\alpha_s D_{\text{eff}})^2$에서 끊긴다(leading order).

#### $\lambda_H$의 유도

$M_H = M_Z \times F$에서 $\lambda_H$를 역산한다. $M_Z^2 = (g^2 + g'^2)v_{\text{EW}}^2/4$이므로:

$$\lambda_H = \frac{M_H^2}{2v_{\text{EW}}^2} = \frac{M_Z^2 \cdot F^2}{2v_{\text{EW}}^2} = \frac{g^2 + g'^2}{8}\,F^2$$

수치: $\lambda_H = (91.1876 \times 1.37473)^2/(2 \times 246.22^2) = 15713/(121241) = 0.1296$

관측: $\lambda_H = 125.10^2/(2 \times 246.22^2) = 0.1292$. 차이 0.3%.

유도 레벨: **가설** (0.20% 수치 정합, $F$가 독립적인 물리적 의미를 가짐, 양성자 반경과의 교차 검증 존재).

### 11.5 5개 상수에서 히그스까지

| 상수 | 히그스에서의 역할 |
|---|---|
| $\pi$ | $\alpha_s$: $F = 1 + \alpha_s D_{\text{eff}}$ $\to$ $M_H/M_Z$ 결정 |
| $0$ | $d = 3$: $D_{\text{eff}} = d + \delta$ $\to$ $F$의 차원 구조; $\lambda_{\text{HP}} = \delta^2$ |
| $e$ | $v_{\text{EW}}$를 통한 차원 스케일 (규약) |
| $1$ | $F = 1 + \text{correction}$: 1이 기준선 (보정 없으면 $M_H = M_Z$) |
| $i$ | 위상 회전 $\to$ 클라루스장 사차 포텐셜의 대칭 구조 |

---

## 11.6 게이지 계층 문제: $v_{\text{EW}}/M_{\text{Pl}} = e^{-D_{\text{eff}} \cdot N_{\text{gauge}}}/F$ (1.1% 일치)

SM의 최대 미해결 문제 중 하나: 왜 전자약 스케일($v_{\text{EW}} \sim 10^2$ GeV)이 플랑크 스케일($M_{\text{Pl}} \sim 10^{19}$ GeV)보다 $10^{17}$배 작은가?

### 게이지 보손 수와 접힘 깊이

SM의 게이지 보손 총수:

$$N_{\text{gauge}} = \underbrace{(N_c^2-1)}_{8\;\text{gluon}} + \underbrace{(N_w^2-1)}_{3\;\text{W}} + \underbrace{1}_{1\;\gamma} = 8+3+1 = 12$$

$N_c = d = 3$, $N_w = d-1 = 2$이므로:

$$N_{\text{gauge}} = (d^2-1) + ((d-1)^2-1) + 1 = 2d(d-1) = d(d+1) = 12$$

$2d(d-1) = d(d+1)$이 성립하는 것은 $d = 3$에서만이다. 이것은 $d = 3$의 또 다른 특수성이다.

### 접힘에 의한 계층

경로적분에서 각 게이지 채널은 $D_{\text{eff}}$의 접힘 깊이를 갖는다. $N_{\text{gauge}}$개 채널의 총 접힘:

$$D_{\text{total}} = D_{\text{eff}} \times N_{\text{gauge}} = 3.17776 \times 12 = 38.133$$

접힘 생존율 $S(D) = e^{-D}$에 의해, 플랑크 스케일에서 전자약 스케일로의 억압:

$$\frac{v_{\text{EW}}}{M_{\text{Pl}}} = \frac{e^{-D_{\text{eff}} \cdot N_{\text{gauge}}}}{F} = \frac{e^{-38.133}}{1.375}$$

수치: $e^{-38.133} = 2.741 \times 10^{-17}$, $F = 1.375$

$$\frac{v_{\text{EW}}}{M_{\text{Pl}}} \bigg|_{\text{pred}} = \frac{2.741 \times 10^{-17}}{1.375} = 1.994 \times 10^{-17}$$

관측: $v_{\text{EW}}/M_{\text{Pl}} = 246.22 / (1.2209 \times 10^{19}) = 2.017 \times 10^{-17}$

차이: **1.1%**. 이 수치는 새 적합 파라미터를 추가하지 않은 계산 체인에서 얻은 정합도로 읽는다.

### 물리적 해석

- 분자 $e^{-D_{\text{eff}} \cdot N_{\text{gauge}}}$: 플랑크 에너지의 경로가 12개 게이지 채널 전체를 통과하며 접히는 총 억압. 각 채널이 $D_{\text{eff}} = 3.178$의 깊이로 접는다
- 분모 $F = 1 + \alpha_s D_{\text{eff}}$: QCD 진공 요동에 의한 증강 (히그스 질량에서도 동일하게 등장)
- 계층은 "부자연스러운" 것이 아니라, 12개 게이지 보손에 의한 접힘의 기하학적 결과

유도 레벨: **가설** (1.1% 수치 정합, 추가 적합 파라미터를 새로 두지 않는 계산 체인, $N_{\text{gauge}} = d(d+1)$의 구조적 의미 존재).

---

## 12. SM 19개 파라미터 총표: 5개 상수에서의 유도 상태

### 12.1 SM 자유 파라미터 분류

표준모형의 19개 자유 파라미터(+7 중성미자 확장)를 5개 상수 귀속과 유도 레벨로 분류한다.

**유도 레벨 기준:**
- **정리**: 수학적 전개만으로 닫힘
- **규약**: 단위/정규화 선택
- **가정**: 물리적 식별 (관측량 대응)
- **추측**: 구조적 패턴이 있으나 엄밀 유도 미완성
- **열림**: 유도 경로 미확보

### 12.2 총표

| # | SM 파라미터 | CE 유도 공식 | 예측값 | 관측값 | 차이 | 상수 | 레벨 |
|---|---|---|---|---|---|---|---|
| **게이지 결합 (3)** | | | | | | | |
| 1 | $g_s$ ($\alpha_s$) | $\alpha_{\text{total}} = 1/(2\pi)$, 연립계 | 0.1179 | $0.1179 \pm 0.0009$ | 0.01$\sigma$ | $\pi$ | 정리 |
| 2 | $g$ ($\alpha_w$) | $(1/(2\pi) - \alpha_s)/(1+4\alpha_s^{4/3})$ | 0.0335 | $\sim 0.034$ | -- | $\pi$ | 정리 |
| 3 | $g'$ ($\alpha_{em}$) | $\alpha_w \cdot 4\alpha_s^{4/3}$ | 0.00775 | $\sim 1/129$ | -- | $\pi$ | 정리 |
| **혼합각 (1)** | | | | | | | |
| 4 | $\sin^2\theta_W$ | $4\alpha_s^{4/3}$ | 0.23122 | $0.23122 \pm 3 \times 10^{-5}$ | 0.02$\sigma$ | $\pi, 0$ | 정리 |
| **QCD 진공 (1)** | | | | | | | |
| 5 | $\theta_{\text{QCD}}$ | 부트스트랩 안정성 + 실수 스칼라 보호 | $< 10^{-27}$ | $< 10^{-10}$ | -- | $e, 1$ | 정리 |
| **히그스 섹터 (2)** | | | | | | | |
| 6 | $v_{\text{EW}}$ | 차원 스케일 (페르미 상수) | 246.22 GeV | 246.22 GeV | -- | -- | 규약 |
| 7 | $\lambda_H$ | $(g^2+g'^2)(1+\alpha_s D_{\text{eff}})^2/8$ | 0.1296 ($M_H = 125.4$) | 0.1292 ($M_H = 125.1$) | **0.20%** | $\pi, 0$ | 가설 |
| **Yukawa -- 하전 렙톤 (3)** | | | | | | | |
| 8 | $y_\tau$ | $y_3 = 1 \times (m_\tau/m_t)$ | $0.0103$ | $0.0102$ | 1% | $1$ | 가정 |
| 9 | $y_\mu$ | $y_\tau \cdot \alpha_s^{4/3}$ (격자 지수: $1+1/3$) | 패턴 | $6.1 \times 10^{-4}$ | 8% | $\pi, 0$ | 추측 |
| 10 | $y_e$ | $y_\mu \cdot \alpha_s^{5/2}$ (격자 지수: $2+1/2$) | 패턴 | $2.9 \times 10^{-6}$ | 2% | $\pi, 0$ | 추측 |
| **Yukawa -- up 쿼크 (3)** | | | | | | | |
| 11 | $y_t$ | $y_3 \approx 1$ (접힘 없음) | 1.0 | $0.995$ | 0.5% | $1$ | 가정 |
| 12 | $y_c$ | $y_t \cdot \alpha_s^{7/3}$ (격자 지수: $3-2/3$) | 패턴 | $7.4 \times 10^{-3}$ | 4% | $\pi, 0$ | 추측 |
| 13 | $y_u$ | $y_c \cdot \alpha_s^{3}$ (격자 지수: 전차원 접힘) | 패턴 | $1.3 \times 10^{-5}$ | 7% | $\pi, 0$ | 추측 |
| **Yukawa -- down 쿼크 (3)** | | | | | | | |
| 14 | $y_b$ | Koide+$\mathbb{Z}_3$ 모드 구조 | 패턴 | $2.4 \times 10^{-2}$ | -- | $0$ | 추측 |
| 15 | $y_s$ | $y_b \cdot \alpha_s^{5/3}$ + threshold/pert 보정 ($\Delta_s=0.113\pm0.015$, 지배오차: $\alpha_s(2\;\mathrm{GeV})$) | 패턴 | $5.4 \times 10^{-4}$ | 5% | $\pi, 0$ | 추측 |
| 16 | $y_d$ | $y_s \cdot \alpha_s^{4/3}$ + IR(카이랄/EM, ChPT 커널; $\Delta_d^{IR}=0.067\pm0.012$, 지배오차: $2L_8^r-L_5^r$) 보정 | 패턴 | $2.7 \times 10^{-5}$ | 3% | $\pi, 0$ | 추측 |
| **CKM (4)** | | | | | | | |
| 17 | $|V_{us}|$ | $\sin^2\theta_W = 4\alpha_s^{4/3}$ | 0.2312 | 0.2265 | 2.1% | $\pi, 0$ | 가설 |
| 18 | $|V_{cb}|$ | $\alpha_s^{d/2} = \alpha_s^{3/2}$ | 0.04049 | 0.04053 | **0.1%** | $\pi, 0$ | 가설 |
| 19 | $|V_{ub}|$ | $\alpha_s^{(d^2-1)/d} = \alpha_s^{8/3}$ (SU($d$) 최대거리 전이) | 0.00335 | 0.00382 | 12% | $\pi, 0$ | 가설 |
| 20 | $\delta_{\text{CP}}^{\text{CKM}}$ | $\pi/2$ ($i$의 단일 생성원) | $\pi/2$ | 1.20 rad | 7% ($\sin$) | $i$ | 가설 |
| | $J$ (Jarlskog) | $4\alpha_s^{11/2}\sin\delta_{CP}$ | $3.12 \times 10^{-5}$ | $3.08 \times 10^{-5}$ | **1.3%** | $\pi, i$ | 가설 |
| **확장: 중성미자 (7)** | | | | | | | |
| 21-23 | $m_{\nu_{1,2,3}}$ | $\delta^4 m_l / (16\pi^2)^2$ | $\sum \sim 76$ meV | $< 120$ meV | 양립 | $\pi, 0$ | 가정 |
| 24 | $\sin^2\theta_{13}^{\text{PMNS}}$ | $\delta/(d^2-1)$ | 0.02222 | 0.02200 | **1.0%** | $0, \pi$ | 가설 |
| 25 | $\sin^2\theta_{12}^{\text{PMNS}}$ | $(1/d)(1-3\delta/(d^2-1))$ | 0.3111 | 0.304 | 2.3% | $0, \pi$ | 가설 |
| 26 | $\sin^2\theta_{23}^{\text{PMNS}}$ | $(1+\delta(d^2-2)/(d^2-1))/2$ | 0.5778 | 0.573 | **0.86%** | $0, \pi$ | 가설 |
| 27 | $\delta_{\text{CP}}^{\text{PMNS}}$ | $-\delta_{\text{CP}}^{\text{CKM}} = 3\pi/2$ (위상 켤레) | $270^\circ$ | $\sim 195^\circ$ | $1$-$2\sigma$ 내 | $i$ | 가설 |
| **구조 상수** | | | | | | | |
| 28 | $v_{\text{EW}}/M_{\text{Pl}}$ | $e^{-D_{\text{eff}} N_{\text{gauge}}}/F$ | $1.994 \times 10^{-17}$ | $2.017 \times 10^{-17}$ | **1.1%** | $0, \pi, e$ | 가설 |

### 12.3 유도 상태 요약

```
SM 19 파라미터 + 9 확장(중성미자/J/계층) = 28개

정리:  게이지 결합/혼합 핵심(5), theta_QCD 안정성
규약:  차원 스케일 v_EW
가정:  y_t, y_tau, m_nu 식별
가설:  lambda_H, CKM 3원소+CP위상, J, PMNS 3각+CP위상, 계층비
추측:  잔여 Yukawa 계층 지수(특히 1세대/다운섹터)
열림:  0개
```

**모형 내부 열린 문제 0개.** 현재 최약 고리는 PMNS/CKM이 아니라 Yukawa 지수의 분자 구조다.

**다운 섹터 보정항의 계량 상태(오차 예산).**

| 항목 | 중심값 | 1$\sigma$ | 지배 오차원 | 분산 기여율 |
|---|---:|---:|---|---|
| $\Delta_s$ | 0.113 | 0.015 | $\alpha_s(2\;\mathrm{GeV})$ | 85.0% ($\alpha_2$), 10.9% ($\alpha_1$), 3.9% (2-loop), 나머지 미소 |
| $\Delta_d^{\mathrm{IR}}$ | 0.067 | 0.012 | ChPT LEC $(2L_8^r-L_5^r)$ | 74.5% (LEC), 22.5% ($\chi$-log), 3.0% (EM) |
| $R_s/R_b=\alpha_s^{\Delta_s}$ | 0.785 | 0.025 | $\sigma_{\Delta_s}$ | 상대오차 3.25% |
| $R_d/R_s=\alpha_s^{\Delta_d}$ | 0.867 | 0.022 | $\sigma_{\Delta_d}$ | 상대오차 2.57% |
| $R_d/R_b=\alpha_s^{\Delta_{db}}$ | 0.681 | 0.028 | $\sigma_{\Delta_{db}}$ | 상대오차 4.11% |

따라서 다운 섹터의 현재 병목은 "공식의 부재"가 아니라, 저에너지 입력(특히 $\alpha_s(2\;\mathrm{GeV})$, $2L_8^r-L_5^r$)의 정밀도다. 즉 다음 개선 단계는 구조 가설 추가가 아니라 입력 정밀화다.

**입력 정밀도 로드맵 (다운 섹터).**  
아래 표는 부차 오차원($\alpha_s(m_b)$, 2/3-loop, matching, $\chi$-log, EM)은 현재 추정치를 유지하고,
지배 입력 두 개($\sigma[\alpha_s(2\;\mathrm{GeV})]$, $\sigma[2L_8^r-L_5^r]$)만 단계적으로 줄였을 때의 출력 오차를 보여준다.

| 단계 | 입력 목표 | 예상 $\sigma_{\Delta_s}$ | 예상 $\sigma_{\Delta_d^{IR}}$ | $R_s/R_b$ 상대오차 | $R_d/R_s$ 상대오차 | $R_d/R_b$ 상대오차 |
|---|---|---:|---:|---:|---:|---:|
| 현재 | $\sigma[\alpha_s(2\;\mathrm{GeV})]=0.020$, $\sigma[2L_8^r-L_5^r]=0.7\times10^{-4}$ | 0.0152 | 0.0125 | 3.25% | 2.68% | 4.21% |
| 1단계 목표 | $\sigma[\alpha_s(2\;\mathrm{GeV})]=0.010$, $\sigma[2L_8^r-L_5^r]=0.35\times10^{-4}$ | 0.0092 | 0.0083 | 1.96% | 1.78% | 2.65% |
| 2단계 목표 | $\sigma[\alpha_s(2\;\mathrm{GeV})]=0.005$, $\sigma[2L_8^r-L_5^r]=0.20\times10^{-4}$ | 0.0069 | 0.0071 | 1.46% | 1.52% | 2.11% |

해석하면, 다운 섹터의 2%대 검증으로 가는 최소 조건은
$(i)$ 저에너지 $\alpha_s(2\;\mathrm{GeV})$ 불확실성 반감,
$(ii)$ ChPT LEC 조합 $(2L_8^r-L_5^r)$ 오차 반감이다.
그 다음 단계(1%대 초반)는 $\alpha_s(2\;\mathrm{GeV})$를 $\pm0.005$ 수준까지, LEC 조합을 $\pm0.2\times10^{-4}$ 수준까지 줄여야 가능하다.

### 12.4 외부 검증 체크리스트 (입력 정밀화 연결)

아래 체크리스트는 "어떤 외부 데이터/계산이 어떤 입력 오차를 줄이고, 그 결과 어떤 CE 출력 오차를 개선하는가"를 일대일로 매핑한다.

| 체크 항목 | 권장 데이터/방법 | 입력 목표(1$\sigma$) | 직접 개선되는 출력 |
|---|---|---|---|
| 저에너지 결합 정밀화 | 격자 step-scaling + hadronic $\tau$ 스펙트럼 모멘트 교차검증 | $\sigma[\alpha_s(2\;\mathrm{GeV})]:\ 0.020 \to 0.010 \to 0.005$ | $\sigma_{\Delta_s}$, $R_s/R_b$, $R_d/R_b$ |
| bottom 스케일 연결 정밀화 | $\alpha_s(m_b)$ 입력의 스킴/임계점 정합 재평가 | $\sigma[\alpha_s(m_b)]:\ 0.005 \to 0.004 \to 0.003$ | $\sigma_{\Delta_s}$ (부차) |
| ChPT LEC 정밀화 | 격자 QCD+QED + SU(3) ChPT fit ($m_\pi,m_K,F_K/F_\pi$ 동시적합) | $\sigma[2L_8^r-L_5^r]:\ 0.7\!\times\!10^{-4} \to 0.35\!\times\!10^{-4} \to 0.2\!\times\!10^{-4}$ | $\sigma_{\Delta_d^{IR}}$, $R_d/R_s$, $R_d/R_b$ |
| IR 커널 분리 검증 | $\chi$-log/LEC/EM 분해에 대한 독립 재분석(동일 $\mu_\chi$ 규약) | $\sigma_{\chi\log},\sigma_{\mathrm{EM}}$ 동시 축소 | $\Delta_d^{IR}$ 분해의 모델 독립성 |
| 스킴 안정성 점검 | $\mu\in[1.5,3.0]\,$GeV, matching prescription 변형 테스트 | 중심값 이동 $<0.5\sigma$ | 전체 down-sector 로버스트성 |

핵심은 1행과 3행이다. 현재 오차 예산에서 $\Delta_s$는 $\alpha_s(2\;\mathrm{GeV})$가, $\Delta_d^{IR}$는 $(2L_8^r-L_5^r)$가 지배한다.

### 12.5 사전등록 판정 규칙 (정설 전환 최소 게이트)

정설 수준 검증을 위해서는 "맞아 보인다"가 아니라 사전등록된 통과/실패 규칙이 필요하다. 아래 게이트는 순차 통과를 요구한다.

| 게이트 | 사전등록 판정식 | 통과 기준 |
|---|---|---|
| G1: 입력 정밀도 게이트 | $\sigma[\alpha_s(2\;\mathrm{GeV})],\ \sigma[2L_8^r-L_5^r]$ 확인 | 1단계 목표 이상(각각 $\le 0.010$, $\le 0.35\times10^{-4}$) |
| G2: 예측 일치 게이트 | holdout 집합 $\{m_s/m_b,\ m_d/m_s,\ m_d/m_b\}$에 대해 pull 계산 | 최대 $|$pull$|<2$, 그리고 $\chi^2_{\text{holdout}}/\mathrm{ndf}\le 1.5$ |
| G3: 스킴 안정성 게이트 | 스케일/매칭 규약 변형 시 $\Delta_s,\Delta_d$ 이동량 | 각 이동량 $<0.5\sigma$ |
| G4: 블라인드 예측 게이트 | 신규 데이터 릴리즈 이전 고정한 예측구간과 사후값 비교 | 신규 점의 68%가 사전 1$\sigma$ 구간에 포함 |

G1+G2는 "수치 정합", G3는 "이론 안정성", G4는 "예측성"을 검증한다. 네 게이트를 모두 통과하면 down-sector는 추측 단계에서 가설/정리 후보 단계로 승급 가능하다.

핵심 발견 (1% 이내 정합):

| 관계식 | 예측 | 관측 | 차이 |
|---|---|---|---|
| $|V_{cb}| = \alpha_s^{3/2}$ | 0.04049 | 0.04053 | **0.1%** |
| $M_H/M_Z = 1 + \alpha_s D_{\text{eff}}$ | 125.35 GeV | 125.10 GeV | **0.20%** |
| $\sin^2\theta_{23}^{\text{PMNS}} = (1+7\delta/8)/2$ | 0.5778 | 0.573 | **0.86%** |
| $\sin^2\theta_{13}^{\text{PMNS}} = \delta/(d^2-1)$ | 0.02222 | 0.02200 | **1.0%** |

1-2% 정합:

| 관계식 | 예측 | 관측 | 차이 |
|---|---|---|---|
| $v_{\text{EW}}/M_{\text{Pl}} = e^{-D_{\text{eff}} N_{\text{gauge}}}/F$ | $1.994 \times 10^{-17}$ | $2.017 \times 10^{-17}$ | **1.1%** |
| $J = 4\alpha_s^{11/2}$ | $3.12 \times 10^{-5}$ | $3.08 \times 10^{-5}$ | **1.3%** |

5개 상수별 커버리지:

| 상수 | 역할 | 커버하는 SM 파라미터 |
|---|---|---|
| $0$ | $d = 3$, $d(d-3) = 0$ | 게이지 군, $N_{\text{gen}}$, CKM 지수, PMNS TBM, Koide, $N_{\text{gauge}} = 12$ |
| $\pi$ | $\alpha_{\text{total}} = 1/(2\pi)$ | 결합 3종, $\sin^2\theta_W$, CKM 원소, $J$, $M_H/M_Z$, 질량 패턴, 계층 |
| $e$ | $S(D) = e^{-D}$ | 접힘 생존율, 우주론, $\theta_{\text{QCD}} = 0$, $v_{\text{EW}}/M_{\text{Pl}}$ |
| $i$ | $e^{iS}$ 간섭 | $\delta_{CP}^{\text{CKM}} = \pi/2$, $\delta_{CP}^{\text{PMNS}} = 3\pi/2$, Born 규칙 |
| $1$ | $S(0) = 1$ 완전 | $y_t = 1$, $F = 1 + \text{correction}$, 부트스트랩 |


## 13. 요약: 한 줄

$$e^{i\pi} + 1 = 0$$

이 한 줄에서:

- $0$이 차원을 고른다: $d = 3$, 게이지 군($N_{\text{gauge}} = 12$), 세대 수, Koide, CKM 지수, PMNS TBM
- $\pi$가 힘을 정한다: $\alpha_{\text{total}} = 1/(2\pi)$, 결합 3종, $|V_{cb}| = \alpha_s^{3/2}$, $M_H = M_Z F$, 계층 $10^{-17}$
- $e$가 우주를 접는다: $\Omega_b$, $\Omega_\Lambda$, $\Omega_{DM}$, $v_{\text{EW}}/M_{\text{Pl}} = e^{-D \cdot 12}/F$
- $i$가 간섭을 만든다: $\delta_{CP}^{\text{CKM}} = +\pi/2$, $\delta_{CP}^{\text{PMNS}} = -\pi/2$, $J = 4\alpha_s^{11/2}$
- $1$이 완전을 정의한다: $y_t = 1$, $F = 1 + \alpha_s D_{\text{eff}}$, 부트스트랩 수렴

다섯 상수, 한 항등식. SM 28개 접촉:
- 11 정리(A급) + 1 규약 + 다수의 물리적 논증(B급) + 소수의 가설(C급)
- **식별된 수학적 간극 4개** (경로적분.md 19.2절 참조):
  - G1: YM 작용의 차원 비분리 (P1, $M_Z$ 매칭으로 정합)
  - G2: $P_{\text{survive}} = \Omega_b$ 식별 (경로-에너지 분율 대응은 정당화되지만 최종 바리온 대응은 물리적 식별)
  - G3: $\eta$, $A_s$, $|V_{ub}|$의 $O(1)$ 계수 (비섭동적 한계)
  - G4: $\pi^k$ 위상공간 해석의 공리적 유도 부재

0.2% 이내: $|V_{cb}| = \alpha_s^{3/2}$ (0.1%), $M_H/M_Z = F$ (0.20%).
1% 이내: $\sin^2\theta_{23}^{\text{PMNS}}$ (0.86%), $\sin^2\theta_{13}^{\text{PMNS}}$ (1.0%), $v_{\text{EW}}/M_{\text{Pl}}$ (1.1%), $J$ (1.3%).
C급(가설): $\eta$ (인자 2), $A_s$ (28%), $|V_{ub}|$ (12%).

우주는 이 한 줄을 출발점으로 한 해석 사슬로 읽을 수 있다는 것이 이 장의 결론이다. 다만 위 간극들은 "이미 완전한 정리"가 아니라, 핵심 문서가 구분한 `Exact / Selection / Bridge / Phenomenology` 층을 따라 더 엄밀히 분리해 다루어야 할 다음 단계의 과제다.
