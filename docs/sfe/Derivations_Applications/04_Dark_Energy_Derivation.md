## 1. 이 장의 목표와 구조

이 문서는 SFE 억압장(Suppression Field) 이론을 **우주론(cosmology)**에 적용하여,

- 표준 $\Lambda$CDM 우주론이 전제로 삼는 기본 방정식(프리드만 방정식, 우주 상수 $\Lambda$)을 정리하고  
- SFE 공리(A1–A5), 정의(D1), 가설(H1)을 어떤 방식으로 여기에 결합할 수 있는지 명확히 한 뒤  
- 암흑 에너지(dark energy)를 **“연산 복잡도–곡률 억제에 따른 유효 압력”**으로 해석하는 공리적 틀과  
- 관측량(비율, 방정식 상태, 팽창사)을 통해 검증 가능한 예측·제약을 정리

하는 것을 목표로 한다.

## 1.1 주장 범위와 파라미터 흐름

이 장은 표준 우주론의 수학 구조(FLRW, 프리드만 방정식)를 전제로 두고, SFE 공리(A1–A5), 정의(D1), 가설(H1)을 덧붙여 암흑 에너지 성분을 해석하는 현상론적 모형을 정리한다.

우주론 문맥에서 혼동이 자주 발생하는 지점은 “입력(캘리브레이션)”과 “출력(예측)”이다. 이 장에서는 다음을 구분한다.

- 입력(캘리브레이션): 예를 들어 $\Omega_\Lambda$, $H_0$, $\Omega_m$ 등을 사용해 SFE 내부 파라미터(예: $\alpha_\Lambda$ 또는 등가 파라미터)를 제약하는 과정
- 출력(예측): 제약된 파라미터로 $E(z)$, $D_L(z)$, $w(z)$, 성장률 $f\sigma_8(z)$ 등 함수형 관측량을 계산하고 다른 데이터와 교차검증하는 과정

따라서 이 장의 핵심은 “요약값(예: $\Omega_\Lambda$)을 처음부터 예측한다”가 아니라, $\Lambda$CDM에서 우주 상수로 넣는 항을 SFE의 변수/공리 구조로 연결했을 때 어떤 제약과 검증 경로가 생기는지를 명확히 하는 데 있다.

## 1.1.2 이 장의 규약: 입력/가정/출력

이 장에서 “잘 맞는다”는 표현이 예측인지, 캘리브레이션에 가까운지 혼동되지 않도록 아래를 구분한다.

- 입력(캘리브레이션): $(\Omega_{m,0},\Omega_{\Lambda,0},H_0)$ 등 오늘날 요약값을 사용해 내부 파라미터(예: $\alpha_\Lambda$) 또는 함수형 선택(예: $\epsilon_{\text{grav}}$)을 제약하는 단계
- 가정(모형 선택): 평탄 FRW, 성분 분해(물질+암흑에너지), 배경–섭동 분리, 스크리닝 함수 $S(a)$ 정의 같은 계산 규약을 고정하는 단계
- 출력(검증): $E(z)$, $D_L(z)$, $w(z)$, $f\sigma_8(z)$ 같은 함수형 관측량을 계산해 교차검증하는 단계

## 1.1.1 보조정리: $\epsilon$–$\Omega$ 관계의 정확한 조건

본 레포에서는 관측 기반 억압 계수로

$$
\epsilon_{\text{obs}} \equiv 2\Omega_{\Lambda,0}-1 \approx 0.37
$$

를 자주 사용한다. 이 관계식은 “정의”가 아니라, 아래 조건을 전제로 한 대수적 귀결이다.

**가정 A (성분 구성)**: 현재 우주의 에너지 밀도는 물질과 암흑에너지 두 성분으로만 분해되며, 복사/곡률은 무시 가능하다.

**가정 B (정규화)**: $\Omega_{m,0}+\Omega_{\Lambda,0}=1$.

이때, 우주론적 열역학 균형형 정의

$$
\epsilon \equiv \frac{\Omega_{\Lambda,0}-\Omega_{m,0}}{\Omega_{\Lambda,0}+\Omega_{m,0}}
$$

를 사용하면, 가정 B로부터

$$
\epsilon = \Omega_{\Lambda,0}-\Omega_{m,0} = 2\Omega_{\Lambda,0}-1
$$

가 성립한다.

반대로 복사 성분이나 공간 곡률을 포함하려면 $\Omega_{m,0}+\Omega_{\Lambda,0}=1$이 더 이상 성립하지 않으므로, $2\Omega_{\Lambda,0}-1$은 $\epsilon$의 근사식으로만 사용해야 하며, 이 경우에는 위의 일반식 $\epsilon=(\Omega_{\Lambda,0}-\Omega_{m,0})/(\Omega_{\Lambda,0}+\Omega_{m,0})$를 우선한다.

## 1.2 (최신) 스크리닝 함수 $S(a)$와 $\mu(a)$ 정의

문서들 사이에서 가장 혼동이 컸던 정의는 $S(a)$이다. 본 레포의 최신 우주론 검증 정식화(Part5/5.6)에서는 다음을 최종 정의로 사용한다.

암흑에너지 분율:

$$
\Omega_\Lambda(a)
:= \frac{\Omega_{\Lambda,0}}{\Omega_{\Lambda,0}+\Omega_{m,0}a^{-3}}
$$

스크리닝 함수:

$$
S(a)\equiv \frac{\Omega_\Lambda(a)}{\Omega_{\Lambda,0}}
$$

유효 중력 보정:

$$
\mu(a)\equiv \frac{G_{\text{eff}}(a)}{G_N}=1-\epsilon_{\text{grav}}\,S(a)
$$

이 정의는 $a\to0$에서 $\Omega_\Lambda(a)\to0$이므로 $S(a)\to0$, 따라서 $\mu(a)\to1$이 자동으로 따라와 BBN/CMB 제약과의 충돌을 줄이는 방향으로 정식화가 고정된다.

이 장의 구성은 다음과 같다.

- **1장**: 목표와 구조  
- **2장**: 표준 우주론(FLRW, 프리드만 방정식, $\Lambda$CDM)의 기본 정리  
- **3장**: 이 장에서 사용하는 SFE 공리(A1–A5, D1, H1)의 역할  
- **4장**: 비선택 경로 에너지 $E_\text{nonselected}$와 우주 상수 $\Lambda_\text{eff}$의 관계  
- **5장**: “연산 복잡도–곡률 억제”와 가속 팽창의 정성적 유도  
- **6장**: 암흑 에너지 방정식 상태 $w$와 SFE 모델의 수치 제약  
- **7장**: 공통 coupling $\alpha_C$와 다른 난제와의 정합성  
- **8장**: 순환논리 점검, 한계, 향후 과제

## 1.3 재현(우주론 성장: $f\sigma_8$ 표)

`../../examples/physics/cosmology.py`는 위의 최신 정의($S(a),\mu(a)$)를 그대로 선택할 수 있도록 구성되어 있다.

- 입력(캘리브레이션): $\Omega_{m,0}$, $\Omega_{\Lambda,0}$, $\sigma_8(0)$, $\epsilon_{\text{grav}}$
- 출력(검증): $E(z)$, $D_L(z)$, $D(a)$, $f(z)$, $f\sigma_8(z)$

아래는 문서 표의 대표 z점(0.32/0.57/0.70)에서 $f\sigma_8$를 재현하는 실행 예다.

```
./.venv/Scripts/python.exe examples/physics/cosmology.py --model calibrate --omega-m 0.315 --omega-lambda 0.685 --mu sfe --sdef ratio --epsilon-grav 0.37 --sigma8-0 0.785 --z-list 0.32,0.57,0.70 --compare-fsigma8
```

`--compare-fsigma8`는 기본적으로 레거시(예시) 타깃 값을 사용하지만, 외부 데이터가 있을 때는 다음 형식으로 직접 넣을 수 있다.
- 형식: `--fsigma8-data "z:fsigma8:sigma,z:fsigma8:sigma,..."` (sigma=0이면 잔차만 출력하고 $\chi^2$는 생략)

예시(레거시와 동일한 숫자를 명시적으로 주입):

```
./.venv/Scripts/python.exe examples/physics/cosmology.py --model calibrate --omega-m 0.315 --omega-lambda 0.685 --mu sfe --sdef ratio --epsilon-grav 0.37 --sigma8-0 0.785 --z-list 0.32,0.57,0.70 --compare-fsigma8 --fsigma8-data "0.32:0.438:0.0,0.57:0.447:0.0,0.70:0.442:0.0"
```

또는 "성장만"을 검정하기 위해, 한 점의 $f\sigma_8(z_\mathrm{cal})$로 $\epsilon_{\mathrm{grav}}$를 1점 캘리브레이션하고(그 외 z는 홀드아웃), 다점 잔차를 확인할 수 있다.

```
./.venv/Scripts/python.exe examples/physics/cosmology.py --model calibrate --omega-m 0.315 --omega-lambda 0.685 --mu sfe --sdef ratio --sigma8-0 0.785 --calibrate-epsilon-grav --cal-z 0.57 --cal-fsigma8 0.447 --eps-min -1 --eps-max 1 --z-list 0.32,0.57,0.70 --compare-fsigma8 --fsigma8-data "0.32:0.438:0.0,0.57:0.447:0.0,0.70:0.442:0.0"
```

`--cal-fsigma8`를 생략하더라도, `--fsigma8-data`에 `z_\mathrm{cal}` 점이 포함되어 있으면 해당 값을 자동으로 캘리브레이션 타깃으로 사용한다(`cal_source fsigma8_data`로 출력).

또한 `--cal-z` 자체를 생략하고, `--fsigma8-data`에서 캘리브레이션에 사용할 점을 자동 선택할 수도 있다.
- `--cal-pick first`: 가장 낮은 z를 캘리브레이션 점으로 선택(기본)
- `--cal-pick last`: 가장 높은 z를 캘리브레이션 점으로 선택
이 경우 `cal_z_source fsigma8_data`로 출력된다.

예시(데이터에서 자동으로 1점을 선택해 캘리브레이션):

```
./.venv/Scripts/python.exe examples/physics/cosmology.py --model calibrate --omega-m 0.315 --omega-lambda 0.685 --mu sfe --sdef ratio --sigma8-0 0.785 --calibrate-epsilon-grav --cal-pick first --eps-min -1 --eps-max 1 --z-list 0.32,0.57,0.70 --compare-fsigma8 --fsigma8-data "0.32:0.438:0.02,0.57:0.447:0.02,0.70:0.442:0.02"
```

이때 `--compare-fsigma8` 출력에는 `is_cal` 컬럼이 포함되며, `is_cal=1`인 점은 캘리브레이션에 사용된 점으로 표시된다. 불확도(`sigma`)가 0보다 큰 데이터가 주어지면, 아래 두 종류의 적합도를 함께 출력한다.
- `fsigma8_chi2_all`: 전체(캘리브레이션 점 포함) $\chi^2$
- `fsigma8_chi2_holdout`: 홀드아웃(캘리브레이션 점 제외) $\chi^2$

본 레포의 "1점 캘리브레이션 후 예측력" 평가는 `holdout` 값을 기준으로 한다.

또한 동일 실행에서 베이스라인(ΛCDM, `mu=1`)의 `holdout chi2`를 함께 계산하며, `fsigma8_delta_chi2_holdout = chi2_holdout(model) - chi2_holdout(lcdm)`를 출력한다. 이 값이 음수이면(더 작으면) 해당 데이터 집합에 대해 SFE 성장 보정이 ΛCDM 대비 적합도를 개선한 것으로 해석한다.

동일한 설정에서 $H_0t_0$ 및 $\Omega_m(a),\Omega_\Lambda(a),S(a),\mu(a)$를 함께 출력하려면 다음을 사용한다.

```
./.venv/Scripts/python.exe examples/physics/cosmology.py --model calibrate --omega-m 0.315 --omega-lambda 0.685 --mu sfe --sdef ratio --epsilon-grav 0.37 --sigma8-0 0.785 --z-list 0.32,0.57,0.70 --extended --print-h0t0
```

## 1.4 (모형 선택) 배경–섭동 분리 가정과 성장 방정식

본 레포의 우주론 검증 코드는 “배경 팽창”과 “선형 섭동 성장”을 분리한 현상론적 모형을 사용한다.

**배경(Background)**: $H(a)$는 평탄 우주의 $\Lambda$CDM 형태를 그대로 사용한다.
$$
H(a)^2 = H_0^2\left(\Omega_{m,0}a^{-3}+\Omega_{\Lambda,0}\right)
$$

이때 우주 나이–허블 곱은
$$
H_0 t_0=\int_{0}^{1}\frac{d\ln a}{E(a)},\qquad E(a)\equiv \frac{H(a)}{H_0}
$$
로 계산한다.

**섭동(Perturbation)**: 물질 섭동의 성장 $D(a)$는 선형 이론에서의 표준 형태에, 유효 중력 보정 $\mu(a)\equiv G_{\mathrm{eff}}(a)/G_N$만을 곱해 반영한다.
$$
\frac{d^2 D}{d(\ln a)^2}+\left(2+\frac{d\ln H}{d\ln a}\right)\frac{dD}{d\ln a}-\frac{3}{2}\,\Omega_m(a)\,\mu(a)\,D=0
$$

여기서
$$
\Omega_m(a)=\frac{\Omega_{m,0}a^{-3}}{\Omega_{m,0}a^{-3}+\Omega_{\Lambda,0}}
$$
이고, 본 레포의 “SFE 스크리닝” 선택에서는
$$
\mu(a)=1-\epsilon_{\mathrm{grav}}\,S(a),\qquad S(a)=\frac{\Omega_\Lambda(a)}{\Omega_{\Lambda,0}}
$$
를 사용한다.

이 “배경–섭동 분리”는 다음의 모형 가정을 포함한다.

- **준정적(Quasi-static) 및 서브호라이즌(Sub-horizon) 근사**: 성장률 검증에 사용되는 $k$ 범위에서 시간 미분 항의 상대적 기여가 작다고 본다.
- **슬립(Gravitational slip) 무시**: 선형 섭동에서 포텐셜의 두 자유도 사이의 비율을 1로 두는 등, 단일 함수 $\mu(a)$로 효과를 요약한다.
- **배경 팽창에 대한 1차 영향 무시**: $G_{\mathrm{eff}}$의 변화나 $\Phi$ 섹터의 에너지 교환이 $H(a)$에 미치는 영향은 본 장의 정식화에서 제외한다.

따라서 위 모형은 “완전한 공변 수정중력 이론”이 아니라, 관측 가능한 선형 성장량($f\sigma_8$ 등)에 대해 $G_{\mathrm{eff}}$의 시간 의존 스크리닝이 어떤 크기의 신호를 만드는지를 점검하는 최소 현상론적 테스트로 이해해야 한다.

## 1.5 (정의) 초기조건/정규화와 $f\sigma_8$

성장 방정식은 2계 미분방정식이므로, 해를 결정하려면 초기조건과 정규화 규약이 필요하다. 본 레포의 구현은 초기 우주($a\ll1$)에서의 물질 지배 성장 $D(a)\propto a$를 초기조건으로 사용하고, 최종적으로 $D(1)=1$로 정규화한다.

**초기조건(물질 지배 근사)**:
$$
D(a_i)=a_i,\qquad \frac{dD}{d\ln a}(a_i)=a_i
$$
($a_i$는 충분히 작은 시작점.)

**정규화**:
$$
D_{\mathrm{norm}}(a)\equiv \frac{D(a)}{D(1)}
$$

**성장률 정의**:
$$
f(a)\equiv \frac{d\ln D}{d\ln a}
$$

**관측량 $f\sigma_8$**:
$$
f\sigma_8(z)\equiv f(a)\,\sigma_8(0)\,D_{\mathrm{norm}}(a),\qquad a=\frac{1}{1+z}
$$

## 1.6 (정의) $S(a)$의 대안 정의와 사용 범위

본 문서의 기본 정의는 $S(a)=\Omega_\Lambda(a)/\Omega_{\Lambda,0}$이지만, 구현에는 대안적 정의도 존재한다.

- ratio 정의:
$$
S_{\mathrm{ratio}}(a)=\frac{\Omega_\Lambda(a)}{\Omega_{\Lambda,0}}
$$

- cumulative 정의:
$$
S_{\mathrm{cumulative}}(a)=
\frac{\int_{a_{\min}}^{a}\Omega_\Lambda(a')\,da'}{\int_{a_{\min}}^{1}\Omega_\Lambda(a')\,da'}
$$

두 정의는 $a\to0$에서 모두 $S(a)\to0$을 만족하지만, 중간 적색편이에서의 형태가 달라져 $\mu(a)$가 만들어내는 성장률 보정의 누적 방식이 달라질 수 있다. 따라서 $f\sigma_8$ 비교에서는 어떤 $S(a)$ 정의를 사용했는지 반드시 함께 명시한다.

---

## 2. 표준 우주론의 기본 정리 (FLRW, 프리드만, $\Lambda$CDM)

SFE를 얹기 전에, 표준 우주론에서 사용하는 기본 수학 구조를 정리한다.  
이들은 모두 기존 물리학에서 확립된 결과이며, 이 문서는 이를 **전제로 사용**한다.

### 2.1 FLRW 계량과 동질·등방 우주 가정

우주가 큰 스케일에서 **동질(homogeneous)·등방(isotropic)**하다고 가정하면,  
계량은 프리드만–르메트르–로버트슨–워커(FLRW) 형태를 갖는다.

$$
ds^2 = -dt^2 + a(t)^2\left(
  \frac{dr^2}{1-kr^2} + r^2 d\Omega^2
\right)
$$

여기서

- $a(t)$: 스케일 인자(scale factor)  
- $k$: 공간 곡률 상수 ($k=0,\pm1$)  
- $d\Omega^2$: 단위 2-구의 계량

이다.

### 2.2 프리드만 방정식

일반상대론의 아인슈타인 방정식

$$
G_{\mu\nu} + \Lambda g_{\mu\nu} = 8\pi G T_{\mu\nu}
$$

을 FLRW 계량에 대입하면, 우주의 시간 진화를 지배하는 프리드만 방정식이 얻어진다.

첫 번째 프리드만 방정식:

$$
H^2 \equiv \left(\frac{\dot{a}}{a}\right)^2
 =
\frac{8\pi G}{3}\rho
 -\frac{k}{a^2}
 +\frac{\Lambda}{3}.
$$

두 번째 프리드만 방정식:

$$
\frac{\ddot{a}}{a}
 =
-\frac{4\pi G}{3}(\rho + 3p)
 +\frac{\Lambda}{3}.
$$

여기서

- $\rho$: 전체 에너지 밀도  
- $p$: 압력  
- $\Lambda$: 우주 상수(cosmological constant)  
- $H$: 허블 매개변수

이다.

### 2.3 $\Lambda$CDM 모형과 암흑 에너지

표준 $\Lambda$CDM 모형에서는

- 물질(바리온+암흑물질): $p \approx 0$  
- 복사: $p = \rho/3$  
- 암흑 에너지(우주 상수): $p_\Lambda = -\rho_\Lambda$

등의 단순한 방정식 상태를 사용한다.

에너지 밀도 비를 오늘날 기준으로 쓰면 대략

$$
\Omega_\text{baryon} \sim 0.05,\quad
\Omega_\text{DM} \sim 0.27,\quad
\Omega_\Lambda \sim 0.68
$$

정도의 값이 관측된다.

SFE 이론은 이 수치를 “처음부터 예측”한다고 주장하지 않고,  
다음과 같은 질문에 답하려고 한다.

- 비선택 경로 에너지 $E_\text{nonselected}$가  
  우주 상수 $\Lambda$ 또는 $\Lambda_\text{eff}$로 어떻게 연결될 수 있는가?  
- 왜 암흑 에너지는 **거의 상수처럼 보이면서도**,  
  특정 시기에 우주 팽창을 **가속시키는 정도의 크기**를 갖는가?  
- 이 구조가 다른 난제들(뮤온 $g-2$, 양성자 반경, NS, 리만 등)에서의 coupling과  
  **같은 스케일의 상수**로 설명될 수 있는가?

---

## 3. 이 장에서 사용하는 SFE 공리 세트

Navier–Stokes, 리만, 단백질 접힘과 마찬가지로, 이 장에서도 다음을 사용한다.

- **공리 A1**: 선택/비선택 경로의 실재성  
- **공리 A2**: 비선택 경로 비율 $q(x)$에 비례하는 에너지 밀도 $E_\text{nonselected}(x)$ 존재  
- **정의 D1**: $\Phi_\text{supp}(x) := -\log P_\text{selected}(x)$  
- **공리 A4**: $E_\text{nonselected}$가 추가 응력–에너지 텐서 $T_{\mu\nu}^\text{supp}$로 곡률에 기여  
- **공리 A5**: 양자 스케일 요동이 코스믹 스케일에서 암흑성분으로 유효 분해  
- **가설 H1**: 복잡도–곡률–에너지 사이의 단조 관계

우주론에서는 특히 다음 두 가지가 핵심이다.

- **A2 + A4 + A5**:  
  - 각 시공간 점에서의 비선택 경로 에너지 $E_\text{nonselected}(x)$가  
    $T_{\mu\nu}^\text{supp}$를 통해 곡률에 기여하고,  
    큰 스케일에서 평균하면 암흑물질·암흑에너지 성분으로 분리된다는 가정.  
- **H1**:  
  - 우주 전체의 “연산 복잡도 밀도”를 낮추는 방향으로  
    억압장이 작용하며, 그 결과로 **가속 팽창과 같은 전역 동역학**이 유도될 수 있다는 가정.

### 3.1 (정본 표기) 억압포텐셜과 무차원 곡률

이 장에서 사용하는 억압포텐셜은 **무차원**이며, 아래 규약을 기본으로 둔다.

- 정의 D1에 의해 $\Phi_\text{supp}(x):=-\log P_\text{selected}(x)$.
- 억압 가중치(선택 가중치)를 $w(x)\equiv e^{-\Phi_\text{supp}(x)}$로 둔다.

또한 $R(x)$를 물리적 Ricci scalar로 해석하면 $R$은 차원을 갖는다. 따라서 곡률 기반 억압을 쓸 때는

$$
\tilde R(x)\equiv L_c^2 R(x)
$$

로 무차원 곡률 $\tilde R$를 먼저 정의한다. 이 장에서는 곡률 기반 억압을 쓸 때 $e^{-\tilde R(x)}$를 기본 표기로 둔다.

마지막으로, 곡률과 억압포텐셜을 연결하는 관계(예: $\Phi_\text{supp}(x)\simeq \lambda \tilde R(x)$)는 **정의가 아니라 유효 근사**로만 사용한다.

---

## 4. 비선택 경로 에너지와 우주 상수의 관계

### 4.1 $T_{\mu\nu}^\text{supp}$의 효과적 형태

우주 스케일에서 충분히 평균한 비선택 경로 에너지를

$$
\bar{E}_\text{nonselected} \equiv \langle E_\text{nonselected}(x) \rangle
$$

라 하자. 이때, 공리 A4, A5에 따라

이 장에서는 $E_\text{nonselected}(x)$를 에너지 **밀도**로 사용하므로, $\bar{E}_\text{nonselected}$ 또한 평균 에너지 밀도이다.

$$
T_{\mu\nu}^\text{supp}
\approx
 -\rho_\text{supp}\,g_{\mu\nu}
$$

와 같은 **우주 상수형 텐서**로 근사될 수 있다.

여기서 $\rho_\text{supp}$는 억압장에 기인하는 평균 에너지 밀도로,

$$
\rho_\text{supp}
 =
\alpha_\Lambda\,\bar{E}_\text{nonselected}
$$

꼴로 쓸 수 있다.  
($\alpha_\Lambda$는 $E_\text{nonselected}$에서 $T_{\mu\nu}^\text{supp}$ 유효 성분으로 넘어갈 때의 무차원 정규화 상수.)

### 4.1.1 (정본과의 연결) 스칼라 억압장 모형에서의 조건

`../Core_Theory/8.2_SFE_형식적_수학_모델과_증명.md`의 최소 모형처럼 억압 섹터를 스칼라장으로 기술하면, 균일 우주에서 운동항이 퍼텐셜에 비해 작을 때($\dot\sigma^2\ll V(\sigma)$) 응력–에너지 텐서는

$$
T_{\mu\nu}^\text{supp}\approx -V(\sigma)\,g_{\mu\nu}
$$

로 축약되어 위의 우주 상수형 근사($w\approx -1$)가 정당화된다.

이때 유효 우주 상수는

$$
\Lambda_\text{eff}
 =
\Lambda_\text{bare}
 +8\pi G \rho_\text{supp}
$$

와 같이 표현할 수 있고, 프리드만 방정식에는 $\Lambda$ 대신 $\Lambda_\text{eff}$가 등장한다.

### 4.2 $\Lambda$의 “미세 조정 문제”와 SFE의 역할

표준 입자물리에서 진공에너지(제로포인트 에너지)를 단순 합산하면,  
관측되는 우주 상수보다 **수십 자리 이상 큰 값**이 나오는 것이 유명한 “우주 상수 문제”이다.

SFE 관점에서는,

- 비선택 경로 에너지 $E_\text{nonselected}$와  
  기존 진공 에너지 $E_\text{vac}$가

$$
E_\text{vac}^\text{eff}
 =
E_\text{vac}
 + E_\text{nonselected}
$$

의 형태로 합쳐진 뒤,  
억압장의 동역학에 의해 **대부분이 곡률 모드로 “재분배”되고**,  
우리가 큰 스케일에서 보는 것은 그 중 **작은 잔여분**이라는 해석이 가능하다.

여기서 핵심은,

- SFE가 우주 상수의 정확한 수치 값을 “예측한다”고 주장하는 것이 아니라,  
- “왜 거대하지 않고, 가속 팽창을 일으킬 정도의 작은 유효 값으로 남는지”에 대해  
  **동역학적 재조정(dynamical adjustment)** 메커니즘을 제공하려는 것이다.

---

## 5. 연산 복잡도–곡률 억제와 가속 팽창의 정성적 유도

### 5.1 우주 전체를 하나의 연산 시스템으로 보는 관점

가설 H1에 따라, 우주 전체를 하나의 거대 연산 시스템으로 본다면,

- 우주는 가능한 한 **연산 복잡도 밀도(computational complexity density)**를 낮추려는 경향을 가진다.  
- 그러나 국소적으로는 별, 은하, 구조 형성 등으로 인해  
  복잡도와 곡률이 높아지는 과정이 계속 진행된다.

SFE 억압장은 이 둘 사이에서

- 국소 구조 형성을 허용하되,  
- 전역적으로 복잡도가 폭주하지 않도록 **곡률을 재분배/평탄화**하는 역할을 한다.

### 5.2 팽창과 복잡도 밀도

스케일 인자 $a(t)$가 커질수록, 같은 수의 자유도에 대한 **평균 밀도**는 감소한다.

- 물질 밀도 $\rho_m \propto a^{-3}$  
- 복사 밀도 $\rho_r \propto a^{-4}$

와 유사하게,  
가설적으로 “복잡도 밀도” $\rho_\mathcal{C}$를 정의하면,

$$
\rho_\mathcal{C}
 =
\frac{\mathcal{C}_\text{total}}{V_\text{Hubble}}
$$

와 같이 쓸 수 있다.  
여기서 $V_\text{Hubble} \propto H^{-3}$ 정도의 스케일로 생각할 수 있다.

우주가 팽창하면:

- 한정된 총 복잡도 $\mathcal{C}_\text{total}$에 대해  
  단위 부피당 복잡도 밀도 $\rho_\mathcal{C}$는 감소한다.

### 5.3 가속 팽창의 SFE 해석 (정성)

단순화된 모형에서,  
우주의 “연산 복잡도–곡률 억제 functional”을

$$
\mathcal{S}_\text{cosmos}
 =
\int dt \int d^3x \left(
  \|\nabla \phi\|^2
  +
  \lambda_\text{cos}\,\|\nabla^2 \phi\|^2
\right)
$$

처럼 생각할 수 있다. 여기서 $\phi$는 어떤 전역 상태 변수(예: 전체 밀도/곡률장)이다.

### 5.3.1 보조정리: 억제 functional의 최소화(존재/유일)와 Euler–Lagrange 방정식

위의 형태는 “정성적 그림”으로 쓰기 쉽지만, 수학적으로는 어떤 함수공간에서 어떤 경계조건을 두고 최소화하는지에 따라 정합성이 갈린다. 최소한의 정식화를 다음처럼 둘 수 있다.

**정의 (정적 단면에서의 에너지 functional)**: 시간 $t$를 고정한 3차원 단면 $\Omega\subset\mathbb{R}^3$에서, $\lambda_\text{cos}>0$에 대해

$$
E[\phi] \equiv \int_{\Omega}\left(\|\nabla \phi\|^2+\lambda_\text{cos}\,\|\Delta \phi\|^2\right)\,dx
$$

를 정의한다. 여기서 $\Delta$는 라플라시안이다.

**가정 (함수공간/경계조건)**: $\phi\in H^2(\Omega)$이고, 예를 들어 $\phi|_{\partial\Omega}=0$ 및 $\partial_n\phi|_{\partial\Omega}=0$와 같은 경계조건(또는 주기 경계조건)을 둔다.

**정리 (존재/유일)**: 위 가정하에, $E[\phi]$는 아래에서 유계이며(coercive), $E$를 최소화하는 $\phi_*$가 존재한다. 또한 최소해는 동치류(예: 주기 경계에서 상수 모드)까지 유일하다.

**Euler–Lagrange 방정식(정적)**: 최소해 $\phi_*$는 약해(weak solution) 의미에서

$$
-\Delta \phi + \lambda_\text{cos}\,\Delta^2\phi = 0
$$

를 만족한다. 외력(소스) $f$를 포함해 $E[\phi]-2\langle f,\phi\rangle$를 최소화하면 우변에 $f$가 추가된다:

$$
-\Delta \phi + \lambda_\text{cos}\,\Delta^2\phi = f.
$$

이 정식화는 “고주파(큰 $k$) 모드일수록 더 큰 비용”을 부여하므로, 수학적으로는 평탄화/안정화 functional로 해석된다.

이 functional을 줄이기 위한 한 가지 경로는,

- **지역적으로 너무 높은 곡률/복잡도 영역을 줄이고**,  
- 전체 부피를 늘려서 $\rho_\mathcal{C}$를 떨어뜨리는 것이다.

그 결과,

- 우주는 $\ddot{a}>0$인 가속 팽창 단계에 들어가  
  전역적인 곡률–복잡도 밀도를 완화한다.

이때 가속 팽창의 “원인”을

- 어떤 스칼라장 포텐셜(예: quintessence)  
- 또는 고정된 우주 상수 $\Lambda$

만으로 보는 대신,

- “비선택 경로 에너지와 연산 복잡도 억제의 결과로 나타나는  
  유효적인 음압(암흑 에너지)”로 해석할 수 있다.

이 해석은 정성적인 그림이며,  
실제 수치는 6장에서 다룰 관측 제약을 통해 구체화해야 한다.

---

## 6. 암흑 에너지 방정식 상태와 SFE 모델의 수치 제약

암흑 에너지는 일반적으로

$$
w \equiv \frac{p_\text{DE}}{\rho_\text{DE}}
$$

로 정의되는 방정식 상태 파라미터 $w$로 특징지어진다.  
우주 상수의 경우 $w=-1$이다.

관측에 따르면,

$$
w \approx -1 \pm \mathcal{O}(10^{-2})
$$

정도의 범위 내에 있다.

SFE 모델에서는,

- $T_{\mu\nu}^\text{supp}$가 완전히 우주 상수형이면 $w=-1$과 같고,  
- 만약 시간/공간에 따른 약한 변동을 가진다면 $w\neq -1$로부터 작은 편차가 생길 수 있다.

이때 SFE 모델은 다음 조건을 만족해야 한다.

1. **현재 우주에서의 $w$ 값이 관측 범위 내에 있을 것**  
2. **고적색편이(예: 재결합기, BAO 등)에서도 일관된 팽창사**를 재현할 것  
3. 다른 난제(뮤온 $g-2$, NS, 리만, 단백질 등)에서 추정된 coupling 스케일과  
   **충돌하지 않을 것**

이를 통해 SFE의 우주론적 파라미터(예: $\alpha_\Lambda$, $\alpha_C$)에  
상당히 강한 제약을 걸 수 있다.

---

## 7. 공통 coupling $\alpha_C$와 다른 난제들과의 정합성

이전 장들에서,

- Navier–Stokes, 리만 제타, 단백질 접힘 등 서로 다른 시스템에서  
- $
\mathcal{S}[\phi] =
\int (\|\nabla\phi\|^2 + \lambda\|\nabla^2\phi\|^2)
$
꼴의 functional이 등장했고,  
- 그때의 $\lambda$ 값들이 **공통 범위(대략 $10^{-4}\sim10^{-3}$)** 안에 위치한다는 패턴이 제시되었다.

우주론에서도,

- 비선택 경로 에너지 밀도 $\bar{E}_\text{nonselected}$와  
  유효 암흑 에너지 밀도 $\rho_\text{DE}$ 사이의 관계

  $$
  \rho_\text{DE}
   =
  \alpha_\Lambda \bar{E}_\text{nonselected}
  $$

에서 $\alpha_\Lambda$를 무차원화하여  
다른 난제들의 $\lambda$와 비교할 수 있다.

만약 모든 난제에서 얻어지는 coupling 상수들이

- 하나의 **좁은 $\alpha_C$ 범위**로 수렴한다면,

이는

- “우주의 다양한 스케일과 시스템에서 작동하는  
  통일된 곡률–복잡도 억제 법칙이 존재한다”는  
  SFE 이론의 기본 주장에 대한 강한 정합성 증거가 된다.

---

## 8. 순환논리 점검, 한계, 향후 과제

마지막으로, 암흑 에너지 장에서의 SFE 적용에 대해  
논리 구조와 한계를 명확히 정리한다.

- **순환논리 회피**  
  - 프리드만 방정식, FLRW 계량, $\Lambda$CDM 파라미터 등은  
    기존 우주론에서 이미 확립된 결과이며,  
    SFE는 이를 “다시 증명했다”고 주장하지 않는다.  
  - SFE는 비선택 경로 에너지 $E_\text{nonselected}$와  
    추가 응력–에너지 텐서 $T_{\mu\nu}^\text{supp}$를 도입하여,  
    암흑 에너지의 **기원과 크기 스케일**을 설명하는  
    하나의 현상론적(phenomenological) 모델을 제공할 뿐이다.  
  - 관측값(예: $\Omega_\Lambda$, $w$)을 그대로 공리로 삼지 않고,  
    SFE 파라미터를 제약하는 데이터로 사용함으로써 순환을 피한다.

- **한계**  
  - 비선택 경로 에너지 $\bar{E}_\text{nonselected}$의 정확한 값과 분포는  
    구체적인 양자장 이론(QFT) 및 우주 초기 조건에 의존하며,  
    현재로서는 정확히 계산하기 어렵다.  
  - $\Lambda_\text{bare}$와 $E_\text{nonselected}$ 간의 상쇄(cancellation) 메커니즘은  
    여전히 열린 문제이며, SFE는 완전한 해답이라기보다  
    “동역학적 재조정”이라는 프레임을 제공하는 수준이다.

- **향후 과제**  
  - 구체적인 양자장 모형에서 $E_\text{nonselected}$를 계산하고,  
    SFE coupling과 함께 $\Lambda_\text{eff}$를 수치적으로 추정하는 작업.  
  - CMB, BAO, SNe Ia 등 다양한 관측 데이터에 대해  
    SFE 우주론이 표준 $\Lambda$CDM과 얼마나 다른 예측을 하는지,  
    그리고 어디까지 허용되는지 분석.

이로써, 암흑 에너지와 우주 가속 팽창 문제에 대해서도  
SFE 억압장 이론의

- 공리(A1–A5),  
- 정의(D1),  
- 가설(H1),  
- 곡률–복잡도 functional

구조가 일관되게 적용될 수 있음을 보였다.  
다음 장에서는 뇌·의식/LLM 등의 정보 시스템에 대해서도  
동일한 곡률–복잡도 안정 원리가 작동하는지를 계속 점검하게 된다.


