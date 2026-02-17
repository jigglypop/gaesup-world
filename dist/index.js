import * as b from "three";
import { Vector3 as Di } from "three";
import Ze, { useRef as C, useEffect as z, useCallback as _, useState as q, useSyncExternalStore as Ei, useMemo as ne, memo as _n, forwardRef as pi, useImperativeHandle as gr, createElement as yr, Suspense as Tn, useLayoutEffect as _s } from "react";
import { useFrame as Ke, useThree as un, useGraph as Ts, Canvas as vr, extend as mi, useLoader as br } from "@react-three/fiber";
import { vec3 as ti, euler as gi, RigidBody as $t, CapsuleCollider as yi, Physics as xr, CuboidCollider as wr } from "@react-three/rapier";
import { useGLTF as dn, Line as Sr, useAnimations as ks, Text as Mr, Environment as Cr, Grid as Pr, useTexture as As, shaderMaterial as Rs, OrbitControls as jr } from "@react-three/drei";
import { SkeletonUtils as kn, Water as Ir } from "three-stdlib";
var Ni = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, Oi = {};
/*! *****************************************************************************
Copyright (C) Microsoft. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
var Li;
function _r() {
  if (Li) return Oi;
  Li = 1;
  var n;
  return function(e) {
    (function(t) {
      var i = typeof globalThis == "object" ? globalThis : typeof Ni == "object" ? Ni : typeof self == "object" ? self : typeof this == "object" ? this : l(), s = r(e);
      typeof i.Reflect < "u" && (s = r(i.Reflect, s)), t(s, i), typeof i.Reflect > "u" && (i.Reflect = e);
      function r(u, d) {
        return function(f, h) {
          Object.defineProperty(u, f, { configurable: !0, writable: !0, value: h }), d && d(f, h);
        };
      }
      function o() {
        try {
          return Function("return this;")();
        } catch {
        }
      }
      function a() {
        try {
          return (0, eval)("(function() { return this; })()");
        } catch {
        }
      }
      function l() {
        return o() || a();
      }
    })(function(t, i) {
      var s = Object.prototype.hasOwnProperty, r = typeof Symbol == "function", o = r && typeof Symbol.toPrimitive < "u" ? Symbol.toPrimitive : "@@toPrimitive", a = r && typeof Symbol.iterator < "u" ? Symbol.iterator : "@@iterator", l = typeof Object.create == "function", u = { __proto__: [] } instanceof Array, d = !l && !u, f = {
        // create an object in dictionary mode (a.k.a. "slow" mode in v8)
        create: l ? function() {
          return Bn(/* @__PURE__ */ Object.create(null));
        } : u ? function() {
          return Bn({ __proto__: null });
        } : function() {
          return Bn({});
        },
        has: d ? function(w, S) {
          return s.call(w, S);
        } : function(w, S) {
          return S in w;
        },
        get: d ? function(w, S) {
          return s.call(w, S) ? w[S] : void 0;
        } : function(w, S) {
          return w[S];
        }
      }, h = Object.getPrototypeOf(Function), g = typeof Map == "function" && typeof Map.prototype.entries == "function" ? Map : Vn(), v = typeof Set == "function" && typeof Set.prototype.entries == "function" ? Set : Wn(), y = typeof WeakMap == "function" ? WeakMap : fr(), p = r ? Symbol.for("@reflect-metadata:registry") : void 0, m = zt(), x = mt(m);
      function M(w, S, j, A) {
        if (O(j)) {
          if (!X(w))
            throw new TypeError();
          if (!E(S))
            throw new TypeError();
          return oe(w, S);
        } else {
          if (!X(w))
            throw new TypeError();
          if (!ce(S))
            throw new TypeError();
          if (!ce(A) && !O(A) && !ye(A))
            throw new TypeError();
          return ye(A) && (A = void 0), j = Q(j), le(w, S, j, A);
        }
      }
      t("decorate", M);
      function P(w, S) {
        function j(A, K) {
          if (!ce(A))
            throw new TypeError();
          if (!O(K) && !pe(K))
            throw new TypeError();
          xe(w, S, A, K);
        }
        return j;
      }
      t("metadata", P);
      function I(w, S, j, A) {
        if (!ce(j))
          throw new TypeError();
        return O(A) || (A = Q(A)), xe(w, S, j, A);
      }
      t("defineMetadata", I);
      function k(w, S, j) {
        if (!ce(S))
          throw new TypeError();
        return O(j) || (j = Q(j)), ge(w, S, j);
      }
      t("hasMetadata", k);
      function R(w, S, j) {
        if (!ce(S))
          throw new TypeError();
        return O(j) || (j = Q(j)), me(w, S, j);
      }
      t("hasOwnMetadata", R);
      function $(w, S, j) {
        if (!ce(S))
          throw new TypeError();
        return O(j) || (j = Q(j)), he(w, S, j);
      }
      t("getMetadata", $);
      function D(w, S, j) {
        if (!ce(S))
          throw new TypeError();
        return O(j) || (j = Q(j)), ue(w, S, j);
      }
      t("getOwnMetadata", D);
      function J(w, S) {
        if (!ce(w))
          throw new TypeError();
        return O(S) || (S = Q(S)), be(w, S);
      }
      t("getMetadataKeys", J);
      function W(w, S) {
        if (!ce(w))
          throw new TypeError();
        return O(S) || (S = Q(S)), ee(w, S);
      }
      t("getOwnMetadataKeys", W);
      function Z(w, S, j) {
        if (!ce(S))
          throw new TypeError();
        if (O(j) || (j = Q(j)), !ce(S))
          throw new TypeError();
        O(j) || (j = Q(j));
        var A = Qe(
          S,
          j,
          /*Create*/
          !1
        );
        return O(A) ? !1 : A.OrdinaryDeleteMetadata(w, S, j);
      }
      t("deleteMetadata", Z);
      function oe(w, S) {
        for (var j = w.length - 1; j >= 0; --j) {
          var A = w[j], K = A(S);
          if (!O(K) && !ye(K)) {
            if (!E(K))
              throw new TypeError();
            S = K;
          }
        }
        return S;
      }
      function le(w, S, j, A) {
        for (var K = w.length - 1; K >= 0; --K) {
          var we = w[K], je = we(S, j, A);
          if (!O(je) && !ye(je)) {
            if (!ce(je))
              throw new TypeError();
            A = je;
          }
        }
        return A;
      }
      function ge(w, S, j) {
        var A = me(w, S, j);
        if (A)
          return !0;
        var K = at(S);
        return ye(K) ? !1 : ge(w, K, j);
      }
      function me(w, S, j) {
        var A = Qe(
          S,
          j,
          /*Create*/
          !1
        );
        return O(A) ? !1 : T(A.OrdinaryHasOwnMetadata(w, S, j));
      }
      function he(w, S, j) {
        var A = me(w, S, j);
        if (A)
          return ue(w, S, j);
        var K = at(S);
        if (!ye(K))
          return he(w, K, j);
      }
      function ue(w, S, j) {
        var A = Qe(
          S,
          j,
          /*Create*/
          !1
        );
        if (!O(A))
          return A.OrdinaryGetOwnMetadata(w, S, j);
      }
      function xe(w, S, j, A) {
        var K = Qe(
          j,
          A,
          /*Create*/
          !0
        );
        K.OrdinaryDefineOwnMetadata(w, S, j, A);
      }
      function be(w, S) {
        var j = ee(w, S), A = at(w);
        if (A === null)
          return j;
        var K = be(A, S);
        if (K.length <= 0)
          return j;
        if (j.length <= 0)
          return K;
        for (var we = new v(), je = [], se = 0, N = j; se < N.length; se++) {
          var U = N[se], V = we.has(U);
          V || (we.add(U), je.push(U));
        }
        for (var B = 0, re = K; B < re.length; B++) {
          var U = re[B], V = we.has(U);
          V || (we.add(U), je.push(U));
        }
        return je;
      }
      function ee(w, S) {
        var j = Qe(
          w,
          S,
          /*create*/
          !1
        );
        return j ? j.OrdinaryOwnMetadataKeys(w, S) : [];
      }
      function te(w) {
        if (w === null)
          return 1;
        switch (typeof w) {
          case "undefined":
            return 0;
          case "boolean":
            return 2;
          case "string":
            return 3;
          case "symbol":
            return 4;
          case "number":
            return 5;
          case "object":
            return w === null ? 1 : 6;
          default:
            return 6;
        }
      }
      function O(w) {
        return w === void 0;
      }
      function ye(w) {
        return w === null;
      }
      function We(w) {
        return typeof w == "symbol";
      }
      function ce(w) {
        return typeof w == "object" ? w !== null : typeof w == "function";
      }
      function ot(w, S) {
        switch (te(w)) {
          case 0:
            return w;
          case 1:
            return w;
          case 2:
            return w;
          case 3:
            return w;
          case 4:
            return w;
          case 5:
            return w;
        }
        var j = "string", A = ae(w, o);
        if (A !== void 0) {
          var K = A.call(w, j);
          if (ce(K))
            throw new TypeError();
          return K;
        }
        return Ge(w);
      }
      function Ge(w, S) {
        var j, A, K;
        {
          var we = w.toString;
          if (H(we)) {
            var A = we.call(w);
            if (!ce(A))
              return A;
          }
          var j = w.valueOf;
          if (H(j)) {
            var A = j.call(w);
            if (!ce(A))
              return A;
          }
        }
        throw new TypeError();
      }
      function T(w) {
        return !!w;
      }
      function L(w) {
        return "" + w;
      }
      function Q(w) {
        var S = ot(w);
        return We(S) ? S : L(S);
      }
      function X(w) {
        return Array.isArray ? Array.isArray(w) : w instanceof Object ? w instanceof Array : Object.prototype.toString.call(w) === "[object Array]";
      }
      function H(w) {
        return typeof w == "function";
      }
      function E(w) {
        return typeof w == "function";
      }
      function pe(w) {
        switch (te(w)) {
          case 3:
            return !0;
          case 4:
            return !0;
          default:
            return !1;
        }
      }
      function ie(w, S) {
        return w === S || w !== w && S !== S;
      }
      function ae(w, S) {
        var j = w[S];
        if (j != null) {
          if (!H(j))
            throw new TypeError();
          return j;
        }
      }
      function Oe(w) {
        var S = ae(w, a);
        if (!H(S))
          throw new TypeError();
        var j = S.call(w);
        if (!ce(j))
          throw new TypeError();
        return j;
      }
      function rt(w) {
        return w.value;
      }
      function _e(w) {
        var S = w.next();
        return S.done ? !1 : S;
      }
      function Ne(w) {
        var S = w.return;
        S && S.call(w);
      }
      function at(w) {
        var S = Object.getPrototypeOf(w);
        if (typeof w != "function" || w === h || S !== h)
          return S;
        var j = w.prototype, A = j && Object.getPrototypeOf(j);
        if (A == null || A === Object.prototype)
          return S;
        var K = A.constructor;
        return typeof K != "function" || K === w ? S : K;
      }
      function Rt() {
        var w;
        !O(p) && typeof i.Reflect < "u" && !(p in i.Reflect) && typeof i.Reflect.defineMetadata == "function" && (w = St(i.Reflect));
        var S, j, A, K = new y(), we = {
          registerProvider: je,
          getProvider: N,
          setProvider: V
        };
        return we;
        function je(B) {
          if (!Object.isExtensible(we))
            throw new Error("Cannot add provider to a frozen registry.");
          switch (!0) {
            case w === B:
              break;
            case O(S):
              S = B;
              break;
            case S === B:
              break;
            case O(j):
              j = B;
              break;
            case j === B:
              break;
            default:
              A === void 0 && (A = new v()), A.add(B);
              break;
          }
        }
        function se(B, re) {
          if (!O(S)) {
            if (S.isProviderFor(B, re))
              return S;
            if (!O(j)) {
              if (j.isProviderFor(B, re))
                return S;
              if (!O(A))
                for (var ve = Oe(A); ; ) {
                  var Se = _e(ve);
                  if (!Se)
                    return;
                  var Je = rt(Se);
                  if (Je.isProviderFor(B, re))
                    return Ne(ve), Je;
                }
            }
          }
          if (!O(w) && w.isProviderFor(B, re))
            return w;
        }
        function N(B, re) {
          var ve = K.get(B), Se;
          return O(ve) || (Se = ve.get(re)), O(Se) && (Se = se(B, re), O(Se) || (O(ve) && (ve = new g(), K.set(B, ve)), ve.set(re, Se))), Se;
        }
        function U(B) {
          if (O(B))
            throw new TypeError();
          return S === B || j === B || !O(A) && A.has(B);
        }
        function V(B, re, ve) {
          if (!U(ve))
            throw new Error("Metadata provider not registered.");
          var Se = N(B, re);
          if (Se !== ve) {
            if (!O(Se))
              return !1;
            var Je = K.get(B);
            O(Je) && (Je = new g(), K.set(B, Je)), Je.set(re, ve);
          }
          return !0;
        }
      }
      function zt() {
        var w;
        return !O(p) && ce(i.Reflect) && Object.isExtensible(i.Reflect) && (w = i.Reflect[p]), O(w) && (w = Rt()), !O(p) && ce(i.Reflect) && Object.isExtensible(i.Reflect) && Object.defineProperty(i.Reflect, p, {
          enumerable: !1,
          configurable: !1,
          writable: !1,
          value: w
        }), w;
      }
      function mt(w) {
        var S = new y(), j = {
          isProviderFor: function(U, V) {
            var B = S.get(U);
            return O(B) ? !1 : B.has(V);
          },
          OrdinaryDefineOwnMetadata: je,
          OrdinaryHasOwnMetadata: K,
          OrdinaryGetOwnMetadata: we,
          OrdinaryOwnMetadataKeys: se,
          OrdinaryDeleteMetadata: N
        };
        return m.registerProvider(j), j;
        function A(U, V, B) {
          var re = S.get(U), ve = !1;
          if (O(re)) {
            if (!B)
              return;
            re = new g(), S.set(U, re), ve = !0;
          }
          var Se = re.get(V);
          if (O(Se)) {
            if (!B)
              return;
            if (Se = new g(), re.set(V, Se), !w.setProvider(U, V, j))
              throw re.delete(V), ve && S.delete(U), new Error("Wrong provider for target.");
          }
          return Se;
        }
        function K(U, V, B) {
          var re = A(
            V,
            B,
            /*Create*/
            !1
          );
          return O(re) ? !1 : T(re.has(U));
        }
        function we(U, V, B) {
          var re = A(
            V,
            B,
            /*Create*/
            !1
          );
          if (!O(re))
            return re.get(U);
        }
        function je(U, V, B, re) {
          var ve = A(
            B,
            re,
            /*Create*/
            !0
          );
          ve.set(U, V);
        }
        function se(U, V) {
          var B = [], re = A(
            U,
            V,
            /*Create*/
            !1
          );
          if (O(re))
            return B;
          for (var ve = re.keys(), Se = Oe(ve), Je = 0; ; ) {
            var zi = _e(Se);
            if (!zi)
              return B.length = Je, B;
            var pr = rt(zi);
            try {
              B[Je] = pr;
            } catch (mr) {
              try {
                Ne(Se);
              } finally {
                throw mr;
              }
            }
            Je++;
          }
        }
        function N(U, V, B) {
          var re = A(
            V,
            B,
            /*Create*/
            !1
          );
          if (O(re) || !re.delete(U))
            return !1;
          if (re.size === 0) {
            var ve = S.get(V);
            O(ve) || (ve.delete(B), ve.size === 0 && S.delete(ve));
          }
          return !0;
        }
      }
      function St(w) {
        var S = w.defineMetadata, j = w.hasOwnMetadata, A = w.getOwnMetadata, K = w.getOwnMetadataKeys, we = w.deleteMetadata, je = new y(), se = {
          isProviderFor: function(N, U) {
            var V = je.get(N);
            return !O(V) && V.has(U) ? !0 : K(N, U).length ? (O(V) && (V = new v(), je.set(N, V)), V.add(U), !0) : !1;
          },
          OrdinaryDefineOwnMetadata: S,
          OrdinaryHasOwnMetadata: j,
          OrdinaryGetOwnMetadata: A,
          OrdinaryOwnMetadataKeys: K,
          OrdinaryDeleteMetadata: we
        };
        return se;
      }
      function Qe(w, S, j) {
        var A = m.getProvider(w, S);
        if (!O(A))
          return A;
        if (j) {
          if (m.setProvider(w, S, x))
            return x;
          throw new Error("Illegal state.");
        }
      }
      function Vn() {
        var w = {}, S = [], j = (
          /** @class */
          function() {
            function se(N, U, V) {
              this._index = 0, this._keys = N, this._values = U, this._selector = V;
            }
            return se.prototype["@@iterator"] = function() {
              return this;
            }, se.prototype[a] = function() {
              return this;
            }, se.prototype.next = function() {
              var N = this._index;
              if (N >= 0 && N < this._keys.length) {
                var U = this._selector(this._keys[N], this._values[N]);
                return N + 1 >= this._keys.length ? (this._index = -1, this._keys = S, this._values = S) : this._index++, { value: U, done: !1 };
              }
              return { value: void 0, done: !0 };
            }, se.prototype.throw = function(N) {
              throw this._index >= 0 && (this._index = -1, this._keys = S, this._values = S), N;
            }, se.prototype.return = function(N) {
              return this._index >= 0 && (this._index = -1, this._keys = S, this._values = S), { value: N, done: !0 };
            }, se;
          }()
        ), A = (
          /** @class */
          function() {
            function se() {
              this._keys = [], this._values = [], this._cacheKey = w, this._cacheIndex = -2;
            }
            return Object.defineProperty(se.prototype, "size", {
              get: function() {
                return this._keys.length;
              },
              enumerable: !0,
              configurable: !0
            }), se.prototype.has = function(N) {
              return this._find(
                N,
                /*insert*/
                !1
              ) >= 0;
            }, se.prototype.get = function(N) {
              var U = this._find(
                N,
                /*insert*/
                !1
              );
              return U >= 0 ? this._values[U] : void 0;
            }, se.prototype.set = function(N, U) {
              var V = this._find(
                N,
                /*insert*/
                !0
              );
              return this._values[V] = U, this;
            }, se.prototype.delete = function(N) {
              var U = this._find(
                N,
                /*insert*/
                !1
              );
              if (U >= 0) {
                for (var V = this._keys.length, B = U + 1; B < V; B++)
                  this._keys[B - 1] = this._keys[B], this._values[B - 1] = this._values[B];
                return this._keys.length--, this._values.length--, ie(N, this._cacheKey) && (this._cacheKey = w, this._cacheIndex = -2), !0;
              }
              return !1;
            }, se.prototype.clear = function() {
              this._keys.length = 0, this._values.length = 0, this._cacheKey = w, this._cacheIndex = -2;
            }, se.prototype.keys = function() {
              return new j(this._keys, this._values, K);
            }, se.prototype.values = function() {
              return new j(this._keys, this._values, we);
            }, se.prototype.entries = function() {
              return new j(this._keys, this._values, je);
            }, se.prototype["@@iterator"] = function() {
              return this.entries();
            }, se.prototype[a] = function() {
              return this.entries();
            }, se.prototype._find = function(N, U) {
              if (!ie(this._cacheKey, N)) {
                this._cacheIndex = -1;
                for (var V = 0; V < this._keys.length; V++)
                  if (ie(this._keys[V], N)) {
                    this._cacheIndex = V;
                    break;
                  }
              }
              return this._cacheIndex < 0 && U && (this._cacheIndex = this._keys.length, this._keys.push(N), this._values.push(void 0)), this._cacheIndex;
            }, se;
          }()
        );
        return A;
        function K(se, N) {
          return se;
        }
        function we(se, N) {
          return N;
        }
        function je(se, N) {
          return [se, N];
        }
      }
      function Wn() {
        var w = (
          /** @class */
          function() {
            function S() {
              this._map = new g();
            }
            return Object.defineProperty(S.prototype, "size", {
              get: function() {
                return this._map.size;
              },
              enumerable: !0,
              configurable: !0
            }), S.prototype.has = function(j) {
              return this._map.has(j);
            }, S.prototype.add = function(j) {
              return this._map.set(j, j), this;
            }, S.prototype.delete = function(j) {
              return this._map.delete(j);
            }, S.prototype.clear = function() {
              this._map.clear();
            }, S.prototype.keys = function() {
              return this._map.keys();
            }, S.prototype.values = function() {
              return this._map.keys();
            }, S.prototype.entries = function() {
              return this._map.entries();
            }, S.prototype["@@iterator"] = function() {
              return this.keys();
            }, S.prototype[a] = function() {
              return this.keys();
            }, S;
          }()
        );
        return w;
      }
      function fr() {
        var w = 16, S = f.create(), j = A();
        return (
          /** @class */
          function() {
            function N() {
              this._key = A();
            }
            return N.prototype.has = function(U) {
              var V = K(
                U,
                /*create*/
                !1
              );
              return V !== void 0 ? f.has(V, this._key) : !1;
            }, N.prototype.get = function(U) {
              var V = K(
                U,
                /*create*/
                !1
              );
              return V !== void 0 ? f.get(V, this._key) : void 0;
            }, N.prototype.set = function(U, V) {
              var B = K(
                U,
                /*create*/
                !0
              );
              return B[this._key] = V, this;
            }, N.prototype.delete = function(U) {
              var V = K(
                U,
                /*create*/
                !1
              );
              return V !== void 0 ? delete V[this._key] : !1;
            }, N.prototype.clear = function() {
              this._key = A();
            }, N;
          }()
        );
        function A() {
          var N;
          do
            N = "@@WeakMap@@" + se();
          while (f.has(S, N));
          return S[N] = !0, N;
        }
        function K(N, U) {
          if (!s.call(N, j)) {
            if (!U)
              return;
            Object.defineProperty(N, j, { value: f.create() });
          }
          return N[j];
        }
        function we(N, U) {
          for (var V = 0; V < U; ++V)
            N[V] = Math.random() * 255 | 0;
          return N;
        }
        function je(N) {
          if (typeof Uint8Array == "function") {
            var U = new Uint8Array(N);
            return typeof crypto < "u" ? crypto.getRandomValues(U) : typeof msCrypto < "u" ? msCrypto.getRandomValues(U) : we(U, N), U;
          }
          return we(new Array(N), N);
        }
        function se() {
          var N = je(w);
          N[6] = N[6] & 79 | 64, N[8] = N[8] & 191 | 128;
          for (var U = "", V = 0; V < w; ++V) {
            var B = N[V];
            (V === 4 || V === 6 || V === 8) && (U += "-"), B < 16 && (U += "0"), U += B.toString(16).toLowerCase();
          }
          return U;
        }
      }
      function Bn(w) {
        return w.__ = void 0, delete w.__, w;
      }
    });
  }(n || (n = {})), Oi;
}
_r();
class Tr {
  engines;
  snapshots;
  eventListeners;
  eventHandlers;
  middlewares;
  constructor() {
    this.engines = /* @__PURE__ */ new Map(), this.snapshots = /* @__PURE__ */ new Map(), this.eventListeners = /* @__PURE__ */ new Set(), this.eventHandlers = /* @__PURE__ */ new Map(), this.middlewares = [];
  }
  use(e) {
    this.middlewares.push(e);
  }
  emit(e) {
    const t = this.eventHandlers.get(e.type);
    t && t.forEach((r) => r(e));
    let i = 0;
    const s = () => {
      if (i < this.middlewares.length) {
        const r = this.middlewares[i++];
        r?.(e, s);
      }
    };
    s();
  }
  on(e, t) {
    return this.eventHandlers.has(e) || this.eventHandlers.set(e, /* @__PURE__ */ new Set()), this.eventHandlers.get(e).add(t), () => {
      this.eventHandlers.get(e)?.delete(t);
    };
  }
  register(e, ...t) {
    const i = this.buildEngine(e, ...t);
    if (!i) return;
    const s = this.engines.get(e);
    s && (s.dispose(), this.snapshots.delete(e)), this.engines.set(e, i), this.emit({
      type: "register",
      id: e,
      timestamp: Date.now(),
      data: { engine: i }
    });
  }
  unregister(e) {
    const t = this.engines.get(e);
    t && (t.dispose(), this.engines.delete(e), this.snapshots.delete(e), this.emit({
      type: "unregister",
      id: e,
      timestamp: Date.now(),
      data: { engine: t }
    }));
  }
  getEngine(e) {
    return this.engines.get(e);
  }
  execute(e, t) {
    const i = this.getEngine(e);
    i && (this.emit({ type: "execute", id: e, timestamp: Date.now(), data: { command: t } }), this.executeCommand(i, t, e), this.notifyListeners(e));
  }
  snapshot(e) {
    const t = this.getEngine(e);
    if (!t) return null;
    const i = this.createSnapshot(t, e);
    return i && this.emit({ type: "snapshot", id: e, timestamp: Date.now(), data: { snapshot: i } }), i;
  }
  getCachedSnapshot(e) {
    return this.snapshots.get(e);
  }
  cacheSnapshot(e, t) {
    this.snapshots.set(e, t);
  }
  subscribe(e) {
    return this.eventListeners.add(e), () => this.eventListeners.delete(e);
  }
  notifyListeners(e) {
    if (this.eventListeners.size === 0) return;
    const t = this.snapshot(e);
    t && (this.cacheSnapshot(e, t), this.eventListeners.forEach((i) => i(t, e)));
  }
  getAllSnapshots() {
    const e = /* @__PURE__ */ new Map();
    return this.engines.forEach((t, i) => {
      const s = this.snapshot(i);
      s && e.set(i, s);
    }), e;
  }
  dispose() {
    this.engines.forEach((e) => e.dispose()), this.engines.clear(), this.snapshots.clear(), this.eventListeners.clear(), this.eventHandlers.clear(), this.middlewares = [];
  }
}
class gt {
  static registry = /* @__PURE__ */ new Map();
  static register(e, t) {
    gt.registry.has(e) && console.warn(`[BridgeRegistry] Domain '${e}' is already registered. Overwriting.`), gt.registry.set(e, t);
  }
  static get(e) {
    return gt.registry.get(e);
  }
  static list() {
    return Array.from(gt.registry.keys());
  }
}
class Ot {
  static instance;
  enabled = !1;
  level = "info";
  constructor() {
  }
  static getInstance() {
    return Ot.instance || (Ot.instance = new Ot()), Ot.instance;
  }
  enable() {
    this.enabled = !0;
  }
  disable() {
    this.enabled = !1;
  }
  setLevel(e) {
    this.level = e;
  }
  shouldLog(e) {
    if (!this.enabled) return !1;
    const t = {
      error: 0,
      warn: 1,
      info: 2,
      log: 3
    };
    return t[e] <= t[this.level];
  }
  log(e, ...t) {
    this.shouldLog("log") && console.log(`[LOG] ${e}`, ...t);
  }
  info(e, ...t) {
    this.shouldLog("info") && console.info(`[INFO] ${e}`, ...t);
  }
  warn(e, ...t) {
    this.shouldLog("warn") && console.warn(`[WARN] ${e}`, ...t);
  }
  error(e, ...t) {
    this.shouldLog("error") && console.error(`[ERROR] ${e}`, ...t);
  }
}
const Ce = Ot.getInstance();
function mn(n) {
  return typeof n == "function" ? n.name : typeof n == "symbol" ? n.toString() : String(n);
}
class yt {
  static instance;
  factories = /* @__PURE__ */ new Map();
  singletons = /* @__PURE__ */ new Map();
  resolving = /* @__PURE__ */ new Set();
  constructor() {
  }
  static getInstance() {
    return yt.instance || (yt.instance = new yt()), yt.instance;
  }
  register(e, t, i = !0) {
    this.factories.set(e, t), i || this.singletons.delete(e);
  }
  registerService(e) {
    const t = Reflect.getMetadata("di:token", e) || e;
    if (this.factories.has(t))
      return;
    const i = Reflect.getMetadata("di:singleton", e) ?? !0, s = () => this.createInstance(e);
    this.register(t, s, i);
  }
  resolve(e) {
    if (this.resolving.has(e)) {
      const r = `DIContainer: Circular dependency detected: ${Array.from(this.resolving).map(mn).join(" -> ")} -> ${mn(
        e
      )}`;
      throw Ce.error(r), new Error(r);
    }
    if (!this.singletons.has(e)) {
      const s = this.factories.get(e);
      if (s) {
        this.resolving.add(e);
        try {
          const r = s();
          return this.singletons.set(e, r), r;
        } finally {
          this.resolving.delete(e);
        }
      }
    }
    if (this.singletons.has(e))
      return this.singletons.get(e);
    const i = this.factories.get(e);
    if (!i) {
      if (typeof e == "function" && "prototype" in e)
        return this.registerService(e), this.resolve(e);
      throw new Error(`DIContainer: No factory registered for token: ${mn(e)}`);
    }
    this.resolving.add(e);
    try {
      return i();
    } finally {
      this.resolving.delete(e);
    }
  }
  createInstance(e) {
    const t = Reflect.getMetadata("di:paramtypes", e) || [], s = (Reflect.getMetadata("design:paramtypes", e) || []).map((o, a) => {
      const l = t[a] || o;
      if (!l)
        throw new Error(`DIContainer: Cannot resolve dependency for parameter ${a} of ${e.name}. Type is not inferable and no @Inject decorator found.`);
      try {
        return this.resolve(l);
      } catch (u) {
        const d = u instanceof Error ? u.message : String(u);
        throw Ce.error(`DIContainer: Failed to resolve parameter ${a} (${mn(l)}) for ${e.name}.`, d), new Error(`Could not construct ${e.name}.`);
      }
    }), r = new e(...s);
    return this.autowireProperties(r), r;
  }
  injectProperties(e) {
    this.autowireProperties(e);
  }
  autowireProperties(e) {
    const t = e.constructor, i = Reflect.getMetadata("autowired", t.prototype) || [];
    for (const r of i) {
      const o = Reflect.getMetadata("design:type", e, r);
      if (o)
        try {
          e[r] = this.resolve(o);
        } catch (a) {
          const l = a instanceof Error ? a.message : String(a);
          Ce.warn(`DIContainer: Failed to autowire property '${r}' on '${t.name}'.`, l);
        }
    }
    const s = Reflect.getMetadata("di:properties", t) || {};
    for (const r in s) {
      const o = s[r];
      try {
        e[r] = this.resolve(o);
      } catch (a) {
        const l = a instanceof Error ? a.message : String(a);
        Ce.warn(`DIContainer: Failed to inject property '${r}' with token '${String(o)}' on '${t.name}'.`, l);
      }
    }
  }
  clear() {
    this.factories.clear(), this.singletons.clear(), this.resolving.clear();
  }
}
function zs() {
  return function(n, e) {
    const t = n.constructor, i = Reflect.getMetadata("autowired", t) || [];
    i.push(e), Reflect.defineMetadata("autowired", i, t);
  };
}
function kr(n = {}) {
  return function(e) {
    const { token: t, singleton: i = !0 } = n;
    Reflect.defineMetadata("di:token", t || e, e), Reflect.defineMetadata("di:singleton", i, e);
  };
}
class Ie {
  static instances = /* @__PURE__ */ new Map();
  static create(e) {
    const t = Ie.instances.get(e);
    if (t)
      return t;
    const i = gt.get(e);
    if (!i)
      return Ce.error(`[BridgeFactory] No bridge registered for domain: ${e}`), null;
    try {
      const s = yt.getInstance().resolve(i);
      return Ie.instances.set(e, s), Ce.info(`[BridgeFactory] Created bridge instance for domain: ${e}`), s;
    } catch (s) {
      return Ce.error(`[BridgeFactory] Failed to create bridge for domain: ${e}`, s), null;
    }
  }
  static get(e) {
    const t = Ie.instances.get(e);
    return t || null;
  }
  static getOrCreate(e) {
    return Ie.get(e) ?? Ie.create(e);
  }
  static has(e) {
    return Ie.instances.has(e);
  }
  static dispose(e) {
    const t = Ie.instances.get(e);
    t && (Ce.info(`[BridgeFactory] Disposing bridge instance for domain: ${e}`), t.dispose(), Ie.instances.delete(e));
  }
  static disposeAll() {
    Ce.info(`[BridgeFactory] Disposing all bridge instances (${Ie.instances.size} total)`), Ie.instances.forEach((e, t) => {
      Ce.info(`[BridgeFactory] Disposing: ${t}`), e.dispose();
    }), Ie.instances.clear();
  }
  static listDomains() {
    return gt.list();
  }
  static listActiveInstances() {
    return Array.from(Ie.instances.keys());
  }
  static getInstanceCount() {
    return Ie.instances.size;
  }
}
class qt extends Tr {
  constructor() {
    super(), this.processMetrics(), this.processEventLog();
  }
  processMetrics() {
    const e = Object.getPrototypeOf(this);
    Reflect.getMetadata("enableMetrics", e);
  }
  processEventLog() {
    const e = Object.getPrototypeOf(this);
    Reflect.getMetadata("enableEventLog", e);
  }
}
function vi() {
  return function(...n) {
    if (n.length === 1) {
      const i = n[0];
      Reflect.defineMetadata("enableEventLog", !0, i.prototype);
      return;
    }
    const [e, t] = n;
    Reflect.defineMetadata("enableEventLog", !0, e, t);
  };
}
function bt() {
  return function(n, e, t) {
    const i = t.value;
    return t.value = function(...s) {
      const r = performance.now(), o = i.apply(this, s), a = performance.now();
      return Ce.log(`[${this.constructor.name}] ${e} snapshot processed in ${(a - r).toFixed(2)}ms`), o;
    }, t;
  };
}
function Ht() {
  return function(n, e, t) {
    const i = t.value;
    return t.value = function(s, r, ...o) {
      if (!r || typeof r != "object") {
        Ce.warn(`[${this.constructor.name}] Invalid command passed to ${e}`);
        return;
      }
      return i.apply(this, [s, r, ...o]);
    }, t;
  };
}
function ze() {
  return function(n, e, t) {
    const i = t.value;
    return t.value = function(...s) {
      const [r] = s;
      return r ? this.getEngine ? (this.getEngine(r) || Ce.warn(`[${this.constructor.name}] No engine found for id: ${r} in ${e}`), i.apply(this, s)) : i.apply(this, s) : (Ce.warn(`[${this.constructor.name}] No id provided for ${e}`), i.apply(this, s));
    }, t;
  };
}
function jt(n = 16) {
  const e = /* @__PURE__ */ new Map();
  return function(t, i, s) {
    const r = s.value;
    return s.value = function(...o) {
      const a = o[0], l = typeof a == "object" && a !== null && "id" in a ? String(a.id) : String(a ?? "default"), u = `${this.constructor.name}_${i}_${l}`, d = Date.now(), f = e.get(u);
      if (f && d - f.timestamp < n)
        return f.value;
      const h = r.apply(this, o);
      return e.set(u, { value: h, timestamp: d }), h;
    }, s;
  };
}
class Ar {
  systems = /* @__PURE__ */ new Map();
  safeDispose(e) {
    if (typeof e != "object" || e === null) return;
    const t = e.dispose;
    if (typeof t == "function")
      try {
        t.call(e);
      } catch {
      }
  }
  register(e, t) {
    this.systems.has(e) && console.warn(`System with type "${e}" is already registered. Overwriting.`), this.systems.set(e, t);
  }
  get(e) {
    return this.systems.get(e);
  }
  getAll() {
    return this.systems;
  }
  unregister(e) {
    if (!this.systems.has(e)) return;
    const t = this.systems.get(e);
    this.safeDispose(t), this.systems.delete(e);
  }
  clear() {
    this.systems.forEach((e) => this.safeDispose(e)), this.systems.clear();
  }
}
const Rr = new Ar();
function G(n) {
  return function(e, t, i) {
    const s = i.value;
    return i.value = function(...r) {
      try {
        return s.apply(this, r);
      } catch (o) {
        return Ce.error(`[${this.constructor.name}] Error in ${t}:`, o), n;
      }
    }, i;
  };
}
function An(n) {
  return function(e) {
    const t = class extends e {
      // TS mixin requirement: rest args must be `any[]`.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      constructor(...i) {
        super(...i), Rr.register(n, this), Ce.info(`[${e.name}] Registered as ${n} system`);
      }
    };
    return Object.defineProperty(t, "name", { value: e.name }), t;
  };
}
function Qt(n = {}) {
  return function(e) {
    const t = class extends e {
      animationFrameId = null;
      lastTime = 0;
      totalTime = 0;
      frameCount = 0;
      // TS mixin requirement: rest args must be `any[]`.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      constructor(...i) {
        super(...i), n.autoStart && this.startRuntime();
      }
      startRuntime() {
        const i = (s) => {
          this.lastTime === 0 && (this.lastTime = s);
          const r = s - this.lastTime;
          this.lastTime = s, this.totalTime += r, this.frameCount++;
          const o = {
            deltaTime: r,
            totalTime: this.totalTime,
            frameCount: this.frameCount
          }, a = this;
          a.update && typeof a.update == "function" && a.update(o), this.animationFrameId = requestAnimationFrame(i);
        };
        this.animationFrameId = requestAnimationFrame(i), Ce.info(`[${e.name}] Runtime started`);
      }
      dispose() {
        this.animationFrameId !== null && (cancelAnimationFrame(this.animationFrameId), this.animationFrameId = null, Ce.info(`[${e.name}] Runtime stopped`));
        const i = e.prototype.dispose;
        i && typeof i == "function" && i.call(this);
      }
    };
    return Object.defineProperty(t, "name", { value: e.name }), t;
  };
}
const Ds = (n, e, t) => t;
function F(n) {
  return Ds;
}
function Jt(n = 100) {
  return Ds;
}
function Es(n) {
  return function(e, t, i) {
    const s = i.value;
    return i.value = async function(...r) {
      const o = new Promise((a, l) => {
        setTimeout(() => l(new Error(`${t} timed out after ${n}ms`)), n);
      });
      try {
        return await Promise.race([
          s.apply(this, r),
          o
        ]);
      } catch (a) {
        throw Ce.error(`[${this.constructor.name}] ${t} timeout:`, a), a;
      }
    }, i;
  };
}
function bi() {
  return function(n) {
    Reflect.defineMetadata("enableMetrics", !0, n.prototype);
  };
}
const zr = {
  id: "char_mage_fire",
  name: "Fire Mage",
  type: "character",
  version: "1.0.0",
  tags: ["magic", "ranged", "fire"],
  description: "A powerful mage specializing in fire magic",
  physics: {
    mass: 60,
    height: 1.75,
    radius: 0.25,
    jumpForce: 300,
    moveSpeed: 4,
    runSpeed: 8,
    airControl: 0.3
  },
  animations: {
    idle: "mage_idle.glb",
    walk: "mage_walk.glb",
    run: "mage_run.glb",
    jump: {
      start: "mage_jump_start.glb",
      loop: "mage_jump_loop.glb",
      land: "mage_jump_land.glb"
    },
    combat: {
      cast_fireball: "cast_fireball.glb",
      cast_meteor: "cast_meteor.glb",
      cast_firewall: "cast_firewall.glb",
      channel: "channel_spell.glb"
    },
    special: {
      meditate: "meditate.glb",
      teleport: "teleport.glb"
    }
  },
  behaviors: {
    type: "state-machine",
    data: {
      initial: "idle",
      states: {
        idle: {
          on: {
            MOVE: "moving",
            CAST: "casting",
            MEDITATE: "meditating"
          }
        },
        moving: {
          on: {
            STOP: "idle",
            CAST: "casting"
          }
        },
        casting: {
          on: {
            FINISH: "idle",
            INTERRUPT: "idle"
          }
        },
        meditating: {
          on: {
            FINISH: "idle",
            INTERRUPT: "idle"
          }
        }
      }
    }
  },
  stats: {
    health: 70,
    stamina: 30,
    mana: 100,
    strength: 5,
    defense: 8,
    speed: 12
  },
  visuals: {
    model: "mage_model.glb",
    textures: ["mage_diffuse.png", "mage_normal.png", "mage_emissive.png"],
    scale: 1
  }
}, Dr = {
  id: "char_warrior_basic",
  name: "Basic Warrior",
  type: "character",
  version: "1.0.0",
  tags: ["melee", "tank", "starter"],
  description: "A basic warrior character with sword and shield",
  physics: {
    mass: 80,
    height: 1.8,
    radius: 0.3,
    jumpForce: 350,
    moveSpeed: 5,
    runSpeed: 10,
    airControl: 0.2
  },
  animations: {
    idle: "warrior_idle.glb",
    walk: "warrior_walk.glb",
    run: "warrior_run.glb",
    jump: {
      start: "warrior_jump_start.glb",
      loop: "warrior_jump_loop.glb",
      land: "warrior_jump_land.glb"
    },
    combat: {
      attack_light: ["attack_1.glb", "attack_2.glb", "attack_3.glb"],
      attack_heavy: "attack_heavy.glb",
      block: "block.glb",
      parry: "parry.glb"
    }
  },
  behaviors: {
    type: "state-machine",
    data: {
      initial: "idle",
      states: {
        idle: {
          on: {
            MOVE: "moving",
            ATTACK: "combat"
          }
        },
        moving: {
          on: {
            STOP: "idle",
            ATTACK: "combat"
          }
        },
        combat: {
          on: {
            FINISH: "idle"
          }
        }
      }
    }
  },
  stats: {
    health: 100,
    stamina: 50,
    strength: 15,
    defense: 12,
    speed: 10
  },
  visuals: {
    parts: [
      {
        id: "warrior-body",
        type: "body",
        url: "gltf/ally_body.glb"
      },
      {
        id: "warrior-cloth",
        type: "top",
        url: "gltf/ally_cloth_rabbit.glb"
      }
    ],
    scale: 1
  },
  camera: {
    mode: "thirdPerson",
    distance: { x: 15, y: 8, z: 15 },
    fov: 50,
    smoothing: { position: 0.1, rotation: 0.1, fov: 0.1 },
    enableCollision: !0,
    enableZoom: !0,
    zoomSpeed: 1e-3,
    minZoom: 0.5,
    maxZoom: 2
  },
  controls: {
    enableKeyboard: !0,
    enableMouse: !0,
    enableGamepad: !1,
    clickToMove: !0
  }
}, Er = {
  id: "vehicle_kart_basic",
  name: "Basic Kart",
  type: "vehicle",
  version: "1.0.0",
  tags: ["land", "fast", "small"],
  description: "A small and nimble racing kart",
  physics: {
    mass: 150,
    maxSpeed: 30,
    acceleration: 15,
    braking: 20,
    turning: 2.5,
    suspension: {
      stiffness: 30,
      damping: 3,
      restLength: 0.3,
      maxTravel: 0.2
    }
  },
  seats: [
    {
      position: [0, 0.5, 0],
      isDriver: !0
    }
  ],
  animations: {
    idle: "kart_idle.glb",
    moving: "kart_moving.glb",
    wheels: ["wheel_fl.glb", "wheel_fr.glb", "wheel_bl.glb", "wheel_br.glb"]
  }
};
class Lt {
  static instance;
  blueprints = /* @__PURE__ */ new Map();
  constructor() {
    this.registerDefaults();
  }
  static getInstance() {
    return Lt.instance || (Lt.instance = new Lt()), Lt.instance;
  }
  registerDefaults() {
    this.register(Dr), this.register(zr), this.register(Er);
  }
  register(e) {
    this.blueprints.set(e.id, e);
  }
  get(e) {
    return this.blueprints.get(e);
  }
  getByType(e) {
    const t = [];
    return this.blueprints.forEach((i) => {
      i.type === e && t.push(i);
    }), t;
  }
  getAll() {
    return Array.from(this.blueprints.values());
  }
  has(e) {
    return this.blueprints.has(e);
  }
  remove(e) {
    return this.blueprints.delete(e);
  }
  clear() {
    this.blueprints.clear();
  }
}
Lt.getInstance();
function Zt(n) {
  return function(e) {
    Reflect.defineMetadata("domain", n, e), gt.register(n, e), yt.getInstance().registerService(e);
  };
}
function Ns(n) {
  return function(e, t) {
    const i = Reflect.getMetadata("commands", e) || [];
    i.push({ name: n, method: t }), Reflect.defineMetadata("commands", i, e);
  };
}
var Nr = Object.defineProperty, Or = Object.getOwnPropertyDescriptor, Kt = (n, e, t, i) => {
  for (var s = Or(e, t), r = n.length - 1, o; r >= 0; r--)
    (o = n[r]) && (s = o(e, t, s) || s);
  return s && Nr(e, t, s), s;
};
class qe {
  id;
  capabilities = {
    hasAsync: !0,
    hasMetrics: !0,
    hasState: !0,
    hasEvents: !1
  };
  state;
  metrics;
  options;
  _isDisposed = !1;
  _updateCount = 0;
  constructor(e, t, i) {
    this.options = { ...i }, this.state = this.createInitialState(e, this.options.initialState), this.metrics = this.createInitialMetrics(t, this.options.initialMetrics);
  }
  createInitialState(e, t) {
    return {
      ...e,
      ...t,
      lastUpdate: 0
    };
  }
  createInitialMetrics(e, t) {
    return {
      ...e,
      ...t,
      frameTime: 0
    };
  }
  async init() {
  }
  async start() {
  }
  pause() {
  }
  resume() {
  }
  update(e) {
    const t = this.createUpdateArgs(e);
    this.performUpdateWithArgs(t);
  }
  createUpdateArgs(e) {
    return {
      ...e,
      deltaTime: e.deltaTime
    };
  }
  performUpdateWithArgs(e) {
    if (this._isDisposed)
      throw new Error("Cannot update disposed system");
    const t = performance.now();
    this._updateCount++, this.state.lastUpdate = Date.now(), this.beforeUpdate(e), this.performUpdate(e);
    const i = performance.now();
    this.metrics.frameTime = i - t, this.updateMetrics(e.deltaTime), this.afterUpdate(e);
  }
  beforeUpdate(e) {
  }
  afterUpdate(e) {
  }
  updateMetrics(e) {
  }
  getState() {
    return this.state;
  }
  getMetrics() {
    return this.metrics;
  }
  get isDisposed() {
    return this._isDisposed;
  }
  get updateCount() {
    return this._updateCount;
  }
  reset() {
    this.state = this.createInitialState(this.state, this.options.initialState), this.metrics = this.createInitialMetrics(this.metrics, this.options.initialMetrics), this._updateCount = 0, this.onReset();
  }
  onReset() {
  }
  dispose() {
    this._isDisposed || (this.onDispose(), this._isDisposed = !0);
  }
  onDispose() {
  }
}
Kt([
  G()
], qe.prototype, "init");
Kt([
  G()
], qe.prototype, "start");
Kt([
  F()
], qe.prototype, "update");
Kt([
  F()
], qe.prototype, "performUpdateWithArgs");
Kt([
  G()
], qe.prototype, "reset");
Kt([
  G()
], qe.prototype, "dispose");
const Lr = 16, Gr = 100;
var Fr = Object.defineProperty, Ur = (n, e, t, i) => {
  for (var s = void 0, r = n.length - 1, o; r >= 0; r--)
    (o = n[r]) && (s = o(e, t, s) || s);
  return s && Fr(e, t, s), s;
};
class $r {
  constructor(e, t, i = {}) {
    this.id = e, this.engine = t, this.options = i;
  }
  bridge;
  commandQueue = [];
  lastSnapshot = null;
  lastSnapshotTime = 0;
  disposed = !1;
  unsubscribers = [];
  initialize() {
    if (!this.bridge)
      throw new Error(`ManagedEntity ${this.id}: Bridge is not injected. Ensure this entity is created via DI container or injector is configured.`);
    this.bridge.register(this.id, this.engine), this.setupEventHandlers();
  }
  setupEventHandlers() {
    const e = this.bridge.on("execute", (i) => {
      i.id === this.id && i.data?.command && this.onCommandExecuted(i.data.command);
    });
    this.unsubscribers.push(e);
    const t = this.bridge.on("snapshot", (i) => {
      i.id === this.id && i.data?.snapshot && this.onSnapshotTaken(i.data.snapshot);
    });
    this.unsubscribers.push(t);
  }
  onCommandExecuted(e) {
  }
  onSnapshotTaken(e) {
    this.options.enableStateCache && (this.lastSnapshot = e, this.lastSnapshotTime = Date.now());
  }
  dispose() {
    this.disposed || (this.disposed = !0, this.options.onDispose && this.options.onDispose(this), this.unsubscribers.forEach((e) => e()), this.unsubscribers = [], this.commandQueue = [], this.lastSnapshot = null, this.bridge.unregister(this.id));
  }
  execute(e) {
    if (this.disposed)
      throw new Error(`ManagedEntity ${this.id} is already disposed`);
    this.options.enableCommandQueue ? this.queueCommand(e) : this.bridge.execute(this.id, e);
  }
  queueCommand(e) {
    const t = this.options.maxQueueSize || Gr;
    this.commandQueue.length >= t && this.commandQueue.shift(), this.commandQueue.push(e);
  }
  flushCommands() {
    if (!this.disposed)
      for (; this.commandQueue.length > 0; ) {
        const e = this.commandQueue.shift();
        e && this.bridge.execute(this.id, e);
      }
  }
  snapshot() {
    if (this.disposed) return null;
    if (this.options.enableStateCache && this.lastSnapshot) {
      const t = this.options.cacheTimeout || Lr;
      if (Date.now() - this.lastSnapshotTime < t)
        return this.lastSnapshot;
    }
    const e = this.bridge.snapshot(this.id);
    return e && this.options.enableStateCache && (this.lastSnapshot = e, this.lastSnapshotTime = Date.now()), e;
  }
  isDisposed() {
    return this.disposed;
  }
  getId() {
    return this.id;
  }
  getQueueSize() {
    return this.commandQueue.length;
  }
}
Ur([
  zs()
], $r.prototype, "bridge");
var Vr = Object.defineProperty, Wr = Object.getOwnPropertyDescriptor, Ye = (n, e, t, i) => {
  for (var s = i > 1 ? void 0 : i ? Wr(e, t) : e, r = n.length - 1, o; r >= 0; r--)
    (o = n[r]) && (s = (i ? o(e, t, s) : o(s)) || s);
  return i && s && Vr(e, t, s), s;
};
const Br = {
  position: new b.Vector3(),
  velocity: new b.Vector3(),
  rotation: new b.Euler(),
  isGrounded: !1,
  isMoving: !1,
  speed: 0,
  direction: new b.Vector3(),
  lastUpdate: 0
}, qr = {
  currentSpeed: 0,
  averageSpeed: 0,
  totalDistance: 0,
  frameTime: 0,
  physicsTime: 0,
  lastPosition: new b.Vector3(),
  isAccelerating: !1,
  groundContact: !1
};
let $e = class extends qe {
  motionService;
  // Hot-path scratch objects to avoid per-frame allocations.
  temp = {
    position: new b.Vector3(),
    velocity: new b.Vector3(),
    rotation: new b.Euler()
  };
  tempQuaternion = new b.Quaternion();
  tempForce = new b.Vector3();
  constructor(n) {
    super(Br, qr, n);
  }
  performUpdate(n) {
    if (!n.rigidBody) return;
    const { position: e, velocity: t, rotation: i } = this.extractPhysicsState(n.rigidBody);
    this.updatePosition(e, n.activeState), this.updateVelocity(t, n.activeState, n.gameStates), this.updateRotation(i, n.activeState);
  }
  updateMetrics(n) {
    const e = this.metrics.currentSpeed;
    this.calculateSpeed(), this.state.isAccelerating = this.metrics.currentSpeed > e, this.metrics.averageSpeed = this.metrics.totalDistance / (this.state.lastUpdate / 1e3 || 1);
  }
  extractPhysicsState(n) {
    const e = n.translation();
    this.temp.position.set(e.x, e.y, e.z);
    const t = n.linvel();
    this.temp.velocity.set(t.x, t.y, t.z);
    const i = n.rotation();
    return this.tempQuaternion.set(i.x, i.y, i.z, i.w), this.temp.rotation.setFromQuaternion(this.tempQuaternion), this.temp;
  }
  updatePosition(n, e) {
    this.metrics.lastPosition.copy(this.state.position), this.state.position.copy(n), this.copyVector3(e.position, n);
  }
  updateVelocity(n, e, t) {
    this.state.velocity.copy(n), this.state.speed = n.length(), this.updateStateIfChanged("isMoving", this.state.speed > 0.1, () => {
      t.isMoving = this.state.isMoving, t.isNotMoving = !this.state.isMoving;
    }), this.copyVector3(e.velocity, n);
  }
  updateRotation(n, e) {
    this.state.rotation.copy(n), e.euler.copy(n);
  }
  setGrounded(n, e, t) {
    this.state.isGrounded = n, this.metrics.groundContact = n, e.isGround = n, t.isOnTheGround = n;
  }
  calculateSpeed() {
    const n = this.state.position.distanceTo(this.metrics.lastPosition);
    this.metrics.totalDistance += n, this.metrics.currentSpeed = this.motionService.calculateSpeed(this.state.velocity);
  }
  calculateJump(n, e) {
    return this.motionService.calculateJumpForce(this.state.isGrounded, n.jumpSpeed, e);
  }
  applyForce(n, e) {
    const t = this.motionService.getDefaultConfig(), i = this.motionService.calculateMovementForce(n, this.state.velocity, t, this.tempForce);
    e.applyImpulse(i, !0);
  }
  onDispose() {
    this.metrics.lastPosition.set(0, 0, 0);
  }
  /**
   * Vector3 헬퍼 - 한 벡터를 다른 벡터로 복사
   */
  copyVector3(n, e) {
    n.set(e.x, e.y, e.z);
  }
  /**
   * 조건부 상태 업데이트 - 변경된 경우에만 업데이트
   */
  updateStateIfChanged(n, e, t) {
    return this.state[n] !== e ? (this.state[n] = e, t?.(), !0) : !1;
  }
};
Ye([
  zs()
], $e.prototype, "motionService", 2);
Ye([
  F()
], $e.prototype, "performUpdate", 1);
Ye([
  F()
], $e.prototype, "updateMetrics", 1);
Ye([
  G()
], $e.prototype, "updatePosition", 1);
Ye([
  G()
], $e.prototype, "updateVelocity", 1);
Ye([
  G()
], $e.prototype, "updateRotation", 1);
Ye([
  G()
], $e.prototype, "setGrounded", 1);
Ye([
  F()
], $e.prototype, "calculateSpeed", 1);
Ye([
  G()
], $e.prototype, "calculateJump", 1);
Ye([
  G()
], $e.prototype, "applyForce", 1);
$e = Ye([
  Qt({ autoStart: !1 })
], $e);
var Hr = Object.defineProperty, Qr = Object.getOwnPropertyDescriptor, Os = (n, e, t, i) => {
  for (var s = i > 1 ? void 0 : i ? Qr(e, t) : e, r = n.length - 1, o; r >= 0; r--)
    (o = n[r]) && (s = (i ? o(e, t, s) : o(s)) || s);
  return i && s && Hr(e, t, s), s;
};
let ni = class extends qt {
  tempQuaternion = new b.Quaternion();
  createEmptySnapshot(n) {
    return {
      type: n,
      position: new b.Vector3(),
      velocity: new b.Vector3(),
      rotation: new b.Euler(),
      isGrounded: !1,
      isMoving: !1,
      speed: 0,
      metrics: {
        currentSpeed: 0,
        averageSpeed: 0,
        totalDistance: 0,
        frameTime: 0,
        isAccelerating: !1
      },
      config: { maxSpeed: 10, acceleration: 5, jumpForce: 12 }
    };
  }
  getOrCreateSnapshot(n, e) {
    const t = this.getCachedSnapshot(n);
    if (t) return t;
    const i = this.createEmptySnapshot(e);
    return this.cacheSnapshot(n, i), i;
  }
  buildEngine(n, e, t) {
    if (!e || !t) return null;
    const i = new $e({ type: e });
    return yt.getInstance().injectProperties(i), {
      system: i,
      rigidBody: t,
      type: e,
      dispose: () => i.dispose()
    };
  }
  executeCommand(n, e, t) {
    const { system: i, rigidBody: s } = n;
    switch (e.type) {
      case "move":
        e.data?.movement && i.applyForce(e.data.movement, s);
        break;
      case "jump":
        const r = i.calculateJump({ jumpSpeed: 12 }, {});
        r.length() > 0 && i.applyForce(r, s);
        break;
      case "stop":
        const o = s.linvel();
        s.setLinvel({ x: 0, y: o.y, z: 0 }, !0);
        break;
      case "reset":
        i.reset(), s.setTranslation({ x: 0, y: 0, z: 0 }, !0), s.setLinvel({ x: 0, y: 0, z: 0 }, !0);
        break;
      case "setConfig": {
        const a = e.data?.config;
        if (!a) break;
        const l = this.getOrCreateSnapshot(t, n.type);
        Object.assign(l.config, a);
        break;
      }
    }
  }
  createSnapshot(n, e) {
    const { system: t, rigidBody: i, type: s } = n, r = this.getOrCreateSnapshot(e, s);
    r.type = s;
    const o = i.translation();
    r.position.set(o.x, o.y, o.z);
    const a = i.linvel();
    r.velocity.set(a.x, a.y, a.z);
    const l = i.rotation();
    this.tempQuaternion.set(l.x, l.y, l.z, l.w), r.rotation.setFromQuaternion(this.tempQuaternion);
    const u = t.getState();
    r.isGrounded = u.isGrounded, r.isMoving = u.isMoving, r.speed = u.speed;
    const d = t.getMetrics();
    return r.metrics.currentSpeed = d.currentSpeed, r.metrics.averageSpeed = d.averageSpeed, r.metrics.totalDistance = d.totalDistance, r.metrics.frameTime = d.frameTime, r.metrics.isAccelerating = d.isAccelerating, this.cacheSnapshot(e, r), r;
  }
  getActiveEntities() {
    return Array.from(this.engines.keys());
  }
  getRigidBody(n) {
    return this.getEngine(n)?.rigidBody;
  }
};
Os([
  Ht()
], ni.prototype, "executeCommand", 1);
ni = Os([
  Zt("motion"),
  vi()
], ni);
const Gi = (n) => {
  let e;
  const t = /* @__PURE__ */ new Set(), i = (u, d) => {
    const f = typeof u == "function" ? u(e) : u;
    if (!Object.is(f, e)) {
      const h = e;
      e = d ?? (typeof f != "object" || f === null) ? f : Object.assign({}, e, f), t.forEach((g) => g(e, h));
    }
  }, s = () => e, a = { setState: i, getState: s, getInitialState: () => l, subscribe: (u) => (t.add(u), () => t.delete(u)) }, l = e = n(i, s, a);
  return a;
}, Jr = (n) => n ? Gi(n) : Gi, Zr = (n) => n;
function Kr(n, e = Zr) {
  const t = Ze.useSyncExternalStore(
    n.subscribe,
    () => e(n.getState()),
    () => e(n.getInitialState())
  );
  return Ze.useDebugValue(t), t;
}
const Fi = (n) => {
  const e = Jr(n), t = (i) => Kr(e, i);
  return Object.assign(t, e), t;
}, ft = (n) => n ? Fi(n) : Fi, Ui = { BASE_URL: "/", DEV: !1, MODE: "esm", PROD: !0, SSR: !1 }, rn = /* @__PURE__ */ new Map(), gn = (n) => {
  const e = rn.get(n);
  return e ? Object.fromEntries(
    Object.entries(e.stores).map(([t, i]) => [t, i.getState()])
  ) : {};
}, Yr = (n, e, t) => {
  if (n === void 0)
    return {
      type: "untracked",
      connection: e.connect(t)
    };
  const i = rn.get(t.name);
  if (i)
    return { type: "tracked", store: n, ...i };
  const s = {
    connection: e.connect(t),
    stores: {}
  };
  return rn.set(t.name, s), { type: "tracked", store: n, ...s };
}, Xr = (n, e) => {
  if (e === void 0) return;
  const t = rn.get(n);
  t && (delete t.stores[e], Object.keys(t.stores).length === 0 && rn.delete(n));
}, eo = (n) => {
  var e, t;
  if (!n) return;
  const i = n.split(`
`), s = i.findIndex(
    (o) => o.includes("api.setState")
  );
  if (s < 0) return;
  const r = ((e = i[s + 1]) == null ? void 0 : e.trim()) || "";
  return (t = /.+ (.+) .+/.exec(r)) == null ? void 0 : t[1];
}, to = (n, e = {}) => (t, i, s) => {
  const { enabled: r, anonymousActionType: o, store: a, ...l } = e;
  let u;
  try {
    u = (r ?? (Ui ? "esm" : void 0) !== "production") && window.__REDUX_DEVTOOLS_EXTENSION__;
  } catch {
  }
  if (!u)
    return n(t, i, s);
  const { connection: d, ...f } = Yr(a, u, l);
  let h = !0;
  s.setState = (y, p, m) => {
    const x = t(y, p);
    if (!h) return x;
    const M = m === void 0 ? {
      type: o || eo(new Error().stack) || "anonymous"
    } : typeof m == "string" ? { type: m } : m;
    return a === void 0 ? (d?.send(M, i()), x) : (d?.send(
      {
        ...M,
        type: `${a}/${M.type}`
      },
      {
        ...gn(l.name),
        [a]: s.getState()
      }
    ), x);
  }, s.devtools = {
    cleanup: () => {
      d && typeof d.unsubscribe == "function" && d.unsubscribe(), Xr(l.name, a);
    }
  };
  const g = (...y) => {
    const p = h;
    h = !1, t(...y), h = p;
  }, v = n(s.setState, i, s);
  if (f.type === "untracked" ? d?.init(v) : (f.stores[f.store] = s, d?.init(
    Object.fromEntries(
      Object.entries(f.stores).map(([y, p]) => [
        y,
        y === f.store ? v : p.getState()
      ])
    )
  )), s.dispatchFromDevtools && typeof s.dispatch == "function") {
    let y = !1;
    const p = s.dispatch;
    s.dispatch = (...m) => {
      (Ui ? "esm" : void 0) !== "production" && m[0].type === "__setState" && !y && (console.warn(
        '[zustand devtools middleware] "__setState" action type is reserved to set state from the devtools. Avoid using it.'
      ), y = !0), p(...m);
    };
  }
  return d.subscribe((y) => {
    var p;
    switch (y.type) {
      case "ACTION":
        if (typeof y.payload != "string") {
          console.error(
            "[zustand devtools middleware] Unsupported action format"
          );
          return;
        }
        return qn(
          y.payload,
          (m) => {
            if (m.type === "__setState") {
              if (a === void 0) {
                g(m.state);
                return;
              }
              Object.keys(m.state).length !== 1 && console.error(
                `
                    [zustand devtools middleware] Unsupported __setState action format.
                    When using 'store' option in devtools(), the 'state' should have only one key, which is a value of 'store' that was passed in devtools(),
                    and value of this only key should be a state object. Example: { "type": "__setState", "state": { "abc123Store": { "foo": "bar" } } }
                    `
              );
              const x = m.state[a];
              if (x == null)
                return;
              JSON.stringify(s.getState()) !== JSON.stringify(x) && g(x);
              return;
            }
            s.dispatchFromDevtools && typeof s.dispatch == "function" && s.dispatch(m);
          }
        );
      case "DISPATCH":
        switch (y.payload.type) {
          case "RESET":
            return g(v), a === void 0 ? d?.init(s.getState()) : d?.init(gn(l.name));
          case "COMMIT":
            if (a === void 0) {
              d?.init(s.getState());
              return;
            }
            return d?.init(gn(l.name));
          case "ROLLBACK":
            return qn(y.state, (m) => {
              if (a === void 0) {
                g(m), d?.init(s.getState());
                return;
              }
              g(m[a]), d?.init(gn(l.name));
            });
          case "JUMP_TO_STATE":
          case "JUMP_TO_ACTION":
            return qn(y.state, (m) => {
              if (a === void 0) {
                g(m);
                return;
              }
              JSON.stringify(s.getState()) !== JSON.stringify(m[a]) && g(m[a]);
            });
          case "IMPORT_STATE": {
            const { nextLiftedState: m } = y.payload, x = (p = m.computedStates.slice(-1)[0]) == null ? void 0 : p.state;
            if (!x) return;
            g(a === void 0 ? x : x[a]), d?.send(
              null,
              // FIXME no-any
              m
            );
            return;
          }
          case "PAUSE_RECORDING":
            return h = !h;
        }
        return;
    }
  }), v;
}, no = to, qn = (n, e) => {
  let t;
  try {
    t = JSON.parse(n);
  } catch (i) {
    console.error(
      "[zustand devtools middleware] Could not parse the received json",
      i
    );
  }
  t !== void 0 && e(t);
}, io = (n) => (e, t, i) => {
  const s = i.subscribe;
  return i.subscribe = (o, a, l) => {
    let u = o;
    if (a) {
      const d = l?.equalityFn || Object.is;
      let f = o(i.getState());
      u = (h) => {
        const g = o(h);
        if (!d(f, g)) {
          const v = f;
          a(f = g, v);
        }
      }, l?.fireImmediately && a(f, f);
    }
    return s(u);
  }, n(e, t, i);
}, so = io;
function ro(n, e) {
  let t;
  try {
    t = n();
  } catch {
    return;
  }
  return {
    getItem: (s) => {
      var r;
      const o = (l) => l === null ? null : JSON.parse(l, void 0), a = (r = t.getItem(s)) != null ? r : null;
      return a instanceof Promise ? a.then(o) : o(a);
    },
    setItem: (s, r) => t.setItem(s, JSON.stringify(r, void 0)),
    removeItem: (s) => t.removeItem(s)
  };
}
const ii = (n) => (e) => {
  try {
    const t = n(e);
    return t instanceof Promise ? t : {
      then(i) {
        return ii(i)(t);
      },
      catch(i) {
        return this;
      }
    };
  } catch (t) {
    return {
      then(i) {
        return this;
      },
      catch(i) {
        return ii(i)(t);
      }
    };
  }
}, oo = (n, e) => (t, i, s) => {
  let r = {
    storage: ro(() => localStorage),
    partialize: (y) => y,
    version: 0,
    merge: (y, p) => ({
      ...p,
      ...y
    }),
    ...e
  }, o = !1;
  const a = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set();
  let u = r.storage;
  if (!u)
    return n(
      (...y) => {
        console.warn(
          `[zustand persist middleware] Unable to update item '${r.name}', the given storage is currently unavailable.`
        ), t(...y);
      },
      i,
      s
    );
  const d = () => {
    const y = r.partialize({ ...i() });
    return u.setItem(r.name, {
      state: y,
      version: r.version
    });
  }, f = s.setState;
  s.setState = (y, p) => {
    f(y, p), d();
  };
  const h = n(
    (...y) => {
      t(...y), d();
    },
    i,
    s
  );
  s.getInitialState = () => h;
  let g;
  const v = () => {
    var y, p;
    if (!u) return;
    o = !1, a.forEach((x) => {
      var M;
      return x((M = i()) != null ? M : h);
    });
    const m = ((p = r.onRehydrateStorage) == null ? void 0 : p.call(r, (y = i()) != null ? y : h)) || void 0;
    return ii(u.getItem.bind(u))(r.name).then((x) => {
      if (x)
        if (typeof x.version == "number" && x.version !== r.version) {
          if (r.migrate) {
            const M = r.migrate(
              x.state,
              x.version
            );
            return M instanceof Promise ? M.then((P) => [!0, P]) : [!0, M];
          }
          console.error(
            "State loaded from storage couldn't be migrated since no migrate function was provided"
          );
        } else
          return [!1, x.state];
      return [!1, void 0];
    }).then((x) => {
      var M;
      const [P, I] = x;
      if (g = r.merge(
        I,
        (M = i()) != null ? M : h
      ), t(g, !0), P)
        return d();
    }).then(() => {
      m?.(g, void 0), g = i(), o = !0, l.forEach((x) => x(g));
    }).catch((x) => {
      m?.(void 0, x);
    });
  };
  return s.persist = {
    setOptions: (y) => {
      r = {
        ...r,
        ...y
      }, y.storage && (u = y.storage);
    },
    clearStorage: () => {
      u?.removeItem(r.name);
    },
    getOptions: () => r,
    rehydrate: () => v(),
    hasHydrated: () => o,
    onHydrate: (y) => (a.add(y), () => {
      a.delete(y);
    }),
    onFinishHydration: (y) => (l.add(y), () => {
      l.delete(y);
    })
  }, r.skipHydration || v(), g || h;
}, ao = oo, $i = new b.Vector3(), Vi = new b.Vector3(0, 0, 1), co = [];
new b.Vector3(0, 0, 0);
new b.Vector3(1, 1, 1);
function xi() {
  return co.pop() || new b.Vector3();
}
function lo(n, e, t) {
  const i = n.x - e.x;
  n.y - e.y;
  const s = n.z - e.z;
  return Math.sqrt(i * i + 0 + s * s);
}
function uo(n) {
  const e = n.dot(Vi) / n.length(), t = Math.acos(Math.max(-1, Math.min(1, e)));
  $i.copy(n).cross(Vi);
  const i = Math.sin($i.y) || 1;
  return Math.PI - t * i;
}
const Ut = (n = 0, e = 0, t = 0) => {
  const i = xi();
  return i.set(n, e, t), i;
}, fu = () => xi(), pu = () => Ut(1, 1, 1), Pe = {
  OFFSET: Ut(-10, -10, -10),
  MAX_DISTANCE: -7,
  DISTANCE: -1,
  X_DISTANCE: 15,
  Y_DISTANCE: 8,
  Z_DISTANCE: 15,
  ZOOM: 1,
  TARGET: Ut(0, 0, 0),
  POSITION: Ut(-15, 8, -15),
  FOCUS: !1,
  ENABLE_COLLISION: !0,
  COLLISION_MARGIN: 0.1,
  SMOOTHING: {
    POSITION: 0.08,
    ROTATION: 0.1,
    FOV: 0.1
  },
  FOV: 75,
  MIN_FOV: 10,
  MAX_FOV: 120,
  BOUNDS: {
    MIN_Y: 2,
    MAX_Y: 50
  }
}, ho = (n) => ({
  cameraOption: {
    offset: Pe.OFFSET,
    maxDistance: Pe.MAX_DISTANCE,
    distance: Pe.DISTANCE,
    xDistance: Pe.X_DISTANCE,
    yDistance: Pe.Y_DISTANCE,
    zDistance: Pe.Z_DISTANCE,
    zoom: Pe.ZOOM,
    target: Pe.TARGET,
    position: Pe.POSITION,
    focus: Pe.FOCUS,
    enableCollision: Pe.ENABLE_COLLISION,
    collisionMargin: Pe.COLLISION_MARGIN,
    smoothing: {
      position: Pe.SMOOTHING.POSITION,
      rotation: Pe.SMOOTHING.ROTATION,
      fov: Pe.SMOOTHING.FOV
    },
    fov: Pe.FOV,
    minFov: Pe.MIN_FOV,
    maxFov: Pe.MAX_FOV,
    bounds: {
      minY: Pe.BOUNDS.MIN_Y,
      maxY: Pe.BOUNDS.MAX_Y
    },
    modeSettings: {}
  },
  setCameraOption: (e) => n((t) => ({
    cameraOption: { ...t.cameraOption, ...e }
  }))
}), fo = {
  characterUrl: "",
  vehicleUrl: "",
  airplaneUrl: "",
  wheelUrl: "",
  ridingUrl: ""
}, po = (n) => ({
  urls: fo,
  setUrls: (e) => n((t) => ({
    urls: { ...t.urls, ...e }
  }))
}), Wi = {
  type: "character",
  controller: "keyboard",
  control: "thirdPerson"
}, Bi = {
  lerp: {
    cameraTurn: 1,
    cameraPosition: 1
  }
}, mo = (n) => ({
  mode: Wi,
  controllerOptions: Bi,
  setMode: (e) => n((t) => ({
    mode: { ...t.mode, ...e }
  })),
  setControllerOptions: (e) => n((t) => ({
    controllerOptions: { ...t.controllerOptions, ...e }
  })),
  resetMode: () => n(() => ({
    mode: Wi,
    controllerOptions: Bi
  }))
}), go = (n) => ({
  sizes: {},
  setSizes: (e) => n((t) => ({
    sizes: e(t.sizes)
  }))
}), yo = (n) => ({
  rideable: {},
  setRideable: (e, t) => n((i) => {
    const r = {
      ...i.rideable[e] ?? { objectkey: e },
      ...t,
      objectkey: e
    };
    return {
      rideable: { ...i.rideable, [e]: r }
    };
  }),
  removeRideable: (e) => n((t) => {
    const i = { ...t.rideable };
    return delete i[e], { rideable: i };
  })
}), vo = {
  render: {
    calls: 0,
    triangles: 0,
    points: 0,
    lines: 0
  },
  engine: {
    geometries: 0,
    textures: 0
  }
}, bo = (n) => ({
  performance: vo,
  setPerformance: (e) => n({
    performance: e
  })
}), qi = {
  // character
  walkSpeed: 10,
  runSpeed: 20,
  jumpSpeed: 15,
  jumpGravityScale: 1.5,
  normalGravityScale: 1,
  airDamping: 0.1,
  stopDamping: 2,
  // vehicle
  maxSpeed: 10,
  accelRatio: 2,
  brakeRatio: 5,
  // airplane
  gravityScale: 0.3,
  angleDelta: new Di(0.02, 0.02, 0.02),
  maxAngle: new Di(Math.PI / 6, Math.PI, Math.PI / 6),
  // common
  linearDamping: 0.9
}, xo = (n) => ({
  physics: qi,
  setPhysics: (e) => n((t) => ({
    physics: { ...t.physics, ...e }
  })),
  resetPhysics: () => n({ physics: qi })
}), Hi = {
  character: {
    current: "idle",
    default: "idle",
    store: {}
  },
  vehicle: {
    current: "idle",
    default: "idle",
    store: {}
  },
  airplane: {
    current: "idle",
    default: "idle",
    store: {}
  }
}, wo = (n) => ({
  animationState: Hi,
  setAnimation: (e, t) => {
    n((i) => ({
      animationState: {
        ...i.animationState,
        [e]: {
          ...i.animationState[e],
          current: t
        }
      }
    }));
  },
  resetAnimations: () => n(() => ({
    animationState: Hi
  })),
  setAnimationAction: (e, t, i) => n((s) => ({
    animationState: {
      ...s.animationState,
      [e]: {
        ...s.animationState[e],
        store: {
          ...s.animationState[e].store,
          [t]: i
        }
      }
    }
  }))
});
var So = Object.defineProperty, Mo = Object.getOwnPropertyDescriptor, Co = (n, e, t) => e in n ? So(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t, Po = (n, e, t, i) => {
  for (var s = i > 1 ? void 0 : i ? Mo(e, t) : e, r = n.length - 1, o; r >= 0; r--)
    (o = n[r]) && (s = o(s) || s);
  return s;
}, jo = (n, e, t) => Co(n, e + "", t);
let Fe = class extends qe {
  config;
  eventCallbacks;
  // public으로 변경
  constructor() {
    super(
      {
        keyboard: { forward: !1, backward: !1, leftward: !1, rightward: !1, shift: !1, space: !1, keyZ: !1, keyR: !1, keyF: !1, keyE: !1, escape: !1 },
        mouse: { target: new b.Vector3(), angle: 0, isActive: !1, shouldRun: !1, buttons: { left: !1, right: !1, middle: !1 }, wheel: 0, position: new b.Vector2() },
        gamepad: { connected: !1, leftStick: new b.Vector2(), rightStick: new b.Vector2(), triggers: { left: 0, right: 0 }, buttons: {}, vibration: { weak: 0, strong: 0 } },
        touch: { touches: [], gestures: { pinch: 1, rotation: 0, pan: new b.Vector2() } },
        lastUpdate: 0,
        isActive: !0
      },
      {
        inputLatency: 0,
        frameTime: 0,
        eventCount: 0,
        activeInputs: [],
        performanceScore: 100,
        lastUpdate: 0
      }
    ), this.config = this.createDefaultConfig(), this.eventCallbacks = /* @__PURE__ */ new Map();
  }
  static getInstance() {
    return Fe.instance || (Fe.instance = new Fe()), Fe.instance;
  }
  // ... 나머지 코드는 거의 동일
  performUpdate(n) {
  }
  createDefaultConfig() {
    return {
      sensitivity: { mouse: 1, gamepad: 1, touch: 1 },
      deadzone: { gamepad: 0.1, touch: 0.05 },
      smoothing: { mouse: 0.1, gamepad: 0.2 },
      invertY: !1,
      enableVibration: !0
    };
  }
  getKeyboardRef() {
    return this.state.keyboard;
  }
  getMouseRef() {
    return this.state.mouse;
  }
  updateKeyboard(n) {
    Object.assign(this.state.keyboard, n), this.updateMetrics(0);
  }
  updateMouse(n) {
    Object.assign(this.state.mouse, n), this.updateMetrics(0);
  }
  updateGamepad(n) {
    Object.assign(this.state.gamepad, n), this.updateMetrics(0);
  }
  updateTouch(n) {
    Object.assign(this.state.touch, n), this.updateMetrics(0);
  }
  dispatchInput(n) {
    this.updateMouse(n);
  }
  setConfig(n) {
    Object.assign(this.config, n);
  }
  getConfig() {
    return { ...this.config };
  }
  // getState, getMetrics는 AbstractSystem에 이미 있으므로 제거
  addEventListener(n, e) {
    this.eventCallbacks.has(n) || this.eventCallbacks.set(n, []), this.eventCallbacks.get(n).push(e);
  }
  removeEventListener(n, e) {
    const t = this.eventCallbacks.get(n);
    if (t) {
      const i = t.indexOf(e);
      i > -1 && t.splice(i, 1);
    }
  }
  updateMetrics(n) {
    super.updateMetrics(n), this.metrics.eventCount++, this.metrics.activeInputs = this.getActiveInputs();
  }
  getActiveInputs() {
    const n = [];
    return Object.entries(this.state.keyboard).forEach(([e, t]) => {
      t && n.push(`keyboard:${e}`);
    }), Object.entries(this.state.mouse.buttons).forEach(([e, t]) => {
      t && n.push(`mouse:${e}`);
    }), this.state.gamepad.connected && n.push("gamepad:connected"), this.state.touch.touches.length > 0 && n.push(`touch:${this.state.touch.touches.length}`), n;
  }
  onReset() {
    super.onReset(), this.eventCallbacks.clear();
  }
  onDispose() {
    super.onDispose(), Fe.instance = null;
  }
};
jo(Fe, "instance", null);
Fe = Po([
  An("interaction")
], Fe);
const Qi = () => ({
  keyboard: {
    forward: !1,
    backward: !1,
    leftward: !1,
    rightward: !1,
    shift: !1,
    space: !1,
    keyZ: !1,
    keyR: !1,
    keyF: !1,
    keyE: !1,
    escape: !1
  },
  mouse: {
    target: new b.Vector3(),
    angle: 0,
    isActive: !1,
    shouldRun: !1,
    buttons: { left: !1, right: !1, middle: !1 },
    wheel: 0,
    position: new b.Vector2()
  },
  gamepad: {
    connected: !1,
    leftStick: new b.Vector2(),
    rightStick: new b.Vector2(),
    triggers: { left: 0, right: 0 },
    buttons: {},
    vibration: { weak: 0, strong: 0 }
  },
  touch: {
    touches: [],
    gestures: {
      pinch: 1,
      rotation: 0,
      pan: new b.Vector2()
    }
  },
  lastUpdate: 0,
  isActive: !0
}), Ji = () => ({
  isActive: !1,
  queue: {
    actions: [],
    currentIndex: 0,
    isRunning: !1,
    isPaused: !1,
    loop: !1,
    maxRetries: 3
  },
  currentAction: null,
  executionStats: {
    totalExecuted: 0,
    successRate: 100,
    averageTime: 0,
    errors: []
  },
  settings: {
    throttle: 100,
    autoStart: !1,
    trackProgress: !0,
    showVisualCues: !0
  }
}), Zi = () => ({
  isActive: !0,
  lastCommand: null,
  commandHistory: [],
  syncStatus: "idle"
}), Ki = () => ({
  sensitivity: { mouse: 1, gamepad: 1, touch: 1 },
  deadzone: { gamepad: 0.1, touch: 0.05 },
  smoothing: { mouse: 0.1, gamepad: 0.2 },
  invertY: !1,
  enableVibration: !0
}), Yi = () => ({
  maxConcurrentActions: 1,
  defaultDelay: 100,
  retryDelay: 1e3,
  timeoutDuration: 5e3,
  enableLogging: !0,
  visualCues: {
    showPath: !0,
    showTargets: !0,
    lineColor: "#00ff00",
    targetColor: "#ff0000"
  }
}), Xi = () => ({
  lastUpdate: 0,
  inputLatency: 0,
  frameTime: 0,
  eventCount: 0,
  activeInputs: [],
  performanceScore: 100
}), es = () => ({
  queueLength: 0,
  executionTime: 0,
  performance: 100,
  memoryUsage: 0,
  errorRate: 0
}), Io = (n) => ({
  interaction: Qi(),
  automation: Ji(),
  bridge: Zi(),
  config: {
    interaction: Ki(),
    automation: Yi()
  },
  metrics: {
    interaction: Xi(),
    automation: es()
  },
  dispatchInput: (e) => {
    Fe.getInstance().dispatchInput(e);
  },
  addAutomationAction: (e) => {
    const t = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, i = {
      ...e,
      id: t,
      timestamp: Date.now()
    };
    return n((s) => ({
      automation: {
        ...s.automation,
        queue: {
          ...s.automation.queue,
          actions: [...s.automation.queue.actions, i]
        }
      }
    })), t;
  },
  removeAutomationAction: (e) => n((t) => ({
    automation: {
      ...t.automation,
      queue: {
        ...t.automation.queue,
        actions: t.automation.queue.actions.filter((i) => i.id !== e)
      }
    }
  })),
  startAutomation: () => n((e) => ({
    automation: {
      ...e.automation,
      queue: {
        ...e.automation.queue,
        isRunning: !0,
        isPaused: !1
      }
    }
  })),
  pauseAutomation: () => n((e) => ({
    automation: {
      ...e.automation,
      queue: {
        ...e.automation.queue,
        isPaused: !0
      }
    }
  })),
  resumeAutomation: () => n((e) => ({
    automation: {
      ...e.automation,
      queue: {
        ...e.automation.queue,
        isPaused: !1
      }
    }
  })),
  stopAutomation: () => n((e) => ({
    automation: {
      ...e.automation,
      queue: {
        ...e.automation.queue,
        isRunning: !1,
        isPaused: !1,
        currentIndex: 0
      },
      currentAction: null
    }
  })),
  clearAutomationQueue: () => n((e) => ({
    automation: {
      ...e.automation,
      queue: {
        ...e.automation.queue,
        actions: [],
        currentIndex: 0
      }
    }
  })),
  updateAutomationSettings: (e) => n((t) => ({
    automation: {
      ...t.automation,
      settings: { ...t.automation.settings, ...e }
    }
  })),
  updateInteractionConfig: (e) => n((t) => ({
    config: {
      ...t.config,
      interaction: { ...t.config.interaction, ...e }
    }
  })),
  updateAutomationConfig: (e) => n((t) => ({
    config: {
      ...t.config,
      automation: { ...t.config.automation, ...e }
    }
  })),
  updateInteractionMetrics: (e) => n((t) => ({
    metrics: {
      ...t.metrics,
      interaction: { ...t.metrics.interaction, ...e }
    }
  })),
  updateAutomationMetrics: (e) => n((t) => ({
    metrics: {
      ...t.metrics,
      automation: { ...t.metrics.automation, ...e }
    }
  })),
  setBridgeStatus: (e) => n((t) => ({
    bridge: { ...t.bridge, syncStatus: e }
  })),
  addCommandToHistory: (e) => n((t) => ({
    bridge: {
      ...t.bridge,
      lastCommand: e,
      commandHistory: [...t.bridge.commandHistory, e].slice(-100)
    }
  })),
  resetInteractions: () => n(() => ({
    interaction: Qi(),
    automation: Ji(),
    bridge: Zi(),
    config: {
      interaction: Ki(),
      automation: Yi()
    },
    metrics: {
      interaction: Xi(),
      automation: es()
    }
  })),
  updateMouse: (e) => n((t) => ({
    interaction: {
      ...t.interaction,
      mouse: { ...t.interaction.mouse, ...e }
    }
  })),
  updateKeyboard: (e) => n((t) => ({
    interaction: {
      ...t.interaction,
      keyboard: { ...t.interaction.keyboard, ...e }
    }
  })),
  updateGamepad: (e) => n((t) => ({
    interaction: {
      ...t.interaction,
      gamepad: { ...t.interaction.gamepad, ...e }
    }
  })),
  updateTouch: (e) => n((t) => ({
    interaction: {
      ...t.interaction,
      touch: { ...t.interaction.touch, ...e }
    }
  })),
  setInteractionActive: (e) => n((t) => ({
    interaction: {
      ...t.interaction,
      isActive: e
    }
  }))
}), _o = (n) => ({
  meshes: /* @__PURE__ */ new Map(),
  currentMeshId: null,
  addMesh: (e) => {
    n((t) => {
      const i = new Map(t.meshes);
      return i.set(e.id, e), { meshes: i };
    });
  },
  removeMesh: (e) => {
    n((t) => {
      const i = new Map(t.meshes);
      return i.delete(e), { meshes: i };
    });
  },
  updateMesh: (e, t) => {
    n((i) => {
      const s = i.meshes.get(e);
      if (s) {
        const r = { ...s, ...t }, o = new Map(i.meshes);
        return o.set(e, r), { meshes: o };
      }
      return i;
    });
  },
  setCurrentMeshId: (e) => {
    n({ currentMeshId: e });
  },
  tiles: /* @__PURE__ */ new Map(),
  addTile: (e) => {
    n((t) => {
      const i = new Map(t.tiles);
      return i.set(e.id, e), { tiles: i };
    });
  },
  removeTile: (e) => {
    n((t) => {
      const i = new Map(t.tiles);
      return i.delete(e), { tiles: i };
    });
  },
  updateTile: (e, t) => {
    n((i) => {
      const s = i.tiles.get(e);
      if (s) {
        const r = { ...s, ...t }, o = new Map(i.tiles);
        return o.set(e, r), { tiles: o };
      }
      return i;
    });
  },
  tileGroups: /* @__PURE__ */ new Map(),
  addTileGroup: (e) => {
    n((t) => {
      const i = new Map(t.tileGroups);
      return i.set(e.id, e), { tileGroups: i };
    });
  },
  removeTileGroup: (e) => {
    n((t) => {
      const i = new Map(t.tileGroups);
      i.delete(e);
      const s = new Map(t.tiles);
      return s.forEach((r) => {
        if (r.groupId === e) {
          const { groupId: o, ...a } = r;
          s.set(r.id, a);
        }
      }), { tileGroups: i, tiles: s };
    });
  },
  updateTileGroup: (e, t) => {
    n((i) => {
      const s = i.tileGroups.get(e);
      if (s) {
        const r = { ...s, ...t }, o = new Map(i.tileGroups);
        return o.set(e, r), { tileGroups: o };
      }
      return i;
    });
  },
  addTileToGroup: (e, t) => {
    n((i) => {
      const s = i.tiles.get(t);
      if (s && i.tileGroups.has(e)) {
        const r = new Map(i.tiles);
        return r.set(t, { ...s, groupId: e }), { tiles: r };
      }
      return i;
    });
  },
  removeTileFromGroup: (e) => {
    n((t) => {
      const i = t.tiles.get(e);
      if (i?.groupId) {
        const s = new Map(t.tiles), { groupId: r, ...o } = i;
        return s.set(e, o), { tiles: s };
      }
      return t;
    });
  },
  walls: /* @__PURE__ */ new Map(),
  addWall: (e) => {
    n((t) => {
      const i = new Map(t.walls);
      return i.set(e.id, e), { walls: i };
    });
  },
  removeWall: (e) => {
    n((t) => {
      const i = new Map(t.walls);
      return i.delete(e), { walls: i };
    });
  },
  updateWall: (e, t) => {
    n((i) => {
      const s = i.walls.get(e);
      if (s) {
        const r = { ...s, ...t }, o = new Map(i.walls);
        return o.set(e, r), { walls: o };
      }
      return i;
    });
  },
  wallGroups: /* @__PURE__ */ new Map(),
  addWallGroup: (e) => {
    n((t) => {
      const i = new Map(t.wallGroups);
      return i.set(e.id, e), { wallGroups: i };
    });
  },
  removeWallGroup: (e) => {
    n((t) => {
      const i = new Map(t.wallGroups);
      i.delete(e);
      const s = new Map(t.walls);
      return s.forEach((r) => {
        if (r.groupId === e) {
          const { groupId: o, ...a } = r;
          s.set(r.id, a);
        }
      }), { wallGroups: i, walls: s };
    });
  },
  updateWallGroup: (e, t) => {
    n((i) => {
      const s = i.wallGroups.get(e);
      if (s) {
        const r = { ...s, ...t }, o = new Map(i.wallGroups);
        return o.set(e, r), { wallGroups: o };
      }
      return i;
    });
  },
  addWallToGroup: (e, t) => {
    n((i) => {
      const s = i.walls.get(t);
      if (s && i.wallGroups.has(e)) {
        const r = new Map(i.walls);
        return r.set(t, { ...s, groupId: e }), { walls: r };
      }
      return i;
    });
  },
  removeWallFromGroup: (e) => {
    n((t) => {
      const i = t.walls.get(e);
      if (i?.groupId) {
        const s = new Map(t.walls), { groupId: r, ...o } = i;
        return s.set(e, o), { walls: s };
      }
      return t;
    });
  },
  npcs: /* @__PURE__ */ new Map(),
  addNpc: (e) => {
    n((t) => {
      const i = new Map(t.npcs);
      return i.set(e.id, e), { npcs: i };
    });
  },
  removeNpc: (e) => {
    n((t) => {
      const i = new Map(t.npcs);
      return i.delete(e), { npcs: i };
    });
  },
  updateNpc: (e, t) => {
    n((i) => {
      const s = i.npcs.get(e);
      if (s) {
        const r = { ...s, ...t }, o = new Map(i.npcs);
        return o.set(e, r), { npcs: o };
      }
      return i;
    });
  },
  interactableObjects: /* @__PURE__ */ new Map(),
  addInteractableObject: (e) => {
    n((t) => {
      const i = new Map(t.interactableObjects);
      return i.set(e.id, e), { interactableObjects: i };
    });
  },
  removeInteractableObject: (e) => {
    n((t) => {
      const i = new Map(t.interactableObjects);
      return i.delete(e), { interactableObjects: i };
    });
  },
  updateInteractableObject: (e, t) => {
    n((i) => {
      const s = i.interactableObjects.get(e);
      if (s) {
        const r = { ...s, ...t }, o = new Map(i.interactableObjects);
        return o.set(e, r), { interactableObjects: o };
      }
      return i;
    });
  }
}), Y = ft()(
  no(
    so(
      (...n) => ({
        ...mo(...n),
        ...po(...n),
        ...go(...n),
        ...yo(...n),
        ...bo(...n),
        ...ho(...n),
        ...xo(...n),
        ...wo(...n),
        ...Io(...n),
        ..._o(...n)
      })
    )
  )
);
function wi() {
  return Ie.getOrCreate("animation");
}
function Rn() {
  const n = C(null), e = Y((d) => d.mode), t = Y((d) => d.animationState), i = Y((d) => d.setAnimation), s = wi();
  z(() => {
    n.current = s;
    const d = s.subscribe((f, h) => {
      if (!f) return;
      const g = h, v = Y.getState().animationState?.[g]?.current;
      f.currentAnimation !== v && i(g, f.currentAnimation);
    });
    return () => {
      d();
    };
  }, [i, s]);
  const r = _(
    (d, f) => {
      n.current && n.current.execute(d, f);
    },
    []
  ), o = _(
    (d, f) => {
      r(d, { type: "play", animation: f });
    },
    [r]
  ), a = _(
    (d) => {
      r(d, { type: "stop" });
    },
    [r]
  ), l = _(
    (d, f) => {
      n.current && n.current.registerAnimations(d, f);
    },
    []
  ), u = e?.type || "character";
  return {
    bridge: n.current,
    playAnimation: o,
    stopAnimation: a,
    executeCommand: r,
    registerAnimations: l,
    currentType: u,
    currentAnimation: t?.[u]?.current || "idle"
  };
}
var To = Object.defineProperty, ko = Object.getOwnPropertyDescriptor, Ao = (n, e, t, i) => {
  for (var s = ko(e, t), r = n.length - 1, o; r >= 0; r--)
    (o = n[r]) && (s = o(e, t, s) || s);
  return s && To(e, t, s), s;
};
let Ls = class {
  animationBridge = wi();
  lastAnimation = "idle";
  update(e) {
    const { isMoving: t, isRunning: i, isJumping: s, isFalling: r, isRiding: o } = e;
    let a = "idle";
    o ? a = "ride" : s ? a = "jump" : r ? a = "fall" : i ? a = "run" : t && (a = "walk"), a !== this.lastAnimation && (this.animationBridge.execute("character", {
      type: "play",
      animation: a
    }), this.lastAnimation = a);
  }
};
Ao([
  G(),
  F()
], Ls.prototype, "update");
var Ro = Object.defineProperty, zo = Object.getOwnPropertyDescriptor, zn = (n, e, t, i) => {
  for (var s = zo(e, t), r = n.length - 1, o; r >= 0; r--)
    (o = n[r]) && (s = o(e, t, s) || s);
  return s && Ro(e, t, s), s;
};
class hn {
  config;
  constructor(e) {
    this.config = e;
  }
  applyGravity(e, t) {
    if (!e.current) return;
    const { modeType: i } = t;
    switch (i) {
      case "character":
        this.applyCharacterGravity(e, t);
        break;
      case "airplane":
        this.applyAirplaneGravity(e);
        break;
      case "vehicle":
        this.applyVehicleGravity(e);
        break;
      default:
        this.applyCharacterGravity(e, t);
    }
  }
  applyCharacterGravity(e, t) {
    const {
      gameStates: { isJumping: i, isFalling: s }
    } = t, { jumpGravityScale: r = 1.5, normalGravityScale: o = 1 } = this.config;
    i || s ? e.current.setGravityScale(r, !1) : e.current.setGravityScale(o, !1);
  }
  applyAirplaneGravity(e) {
    const { gravityScale: t = 0.3 } = this.config;
    e.current.setGravityScale(t, !1);
  }
  applyVehicleGravity(e) {
    const { normalGravityScale: t = 1 } = this.config;
    e.current.setGravityScale(t, !1);
  }
}
zn([
  F()
], hn.prototype, "applyGravity");
zn([
  F()
], hn.prototype, "applyCharacterGravity");
zn([
  F()
], hn.prototype, "applyAirplaneGravity");
zn([
  F()
], hn.prototype, "applyVehicleGravity");
var Do = Object.defineProperty, Eo = Object.getOwnPropertyDescriptor, Si = (n, e, t, i) => {
  for (var s = Eo(e, t), r = n.length - 1, o; r >= 0; r--)
    (o = n[r]) && (s = o(e, t, s) || s);
  return s && Do(e, t, s), s;
};
const No = 100, si = 1e3, Hn = 10;
function Oo() {
  const n = /* @__PURE__ */ new Map(), e = Array.from({ length: Hn }, () => new b.Vector3());
  return {
    getTempVector: (t) => {
      const i = e[t % Hn];
      return i ? i.set(0, 0, 0) : new b.Vector3();
    },
    getCached: (t, i) => {
      if (!n.has(t)) {
        if (n.size >= No) {
          const s = n.keys().next().value;
          s !== void 0 && n.delete(s);
        }
        n.set(t, i());
      }
      return n.get(t);
    },
    clear: () => n.clear(),
    getStats: () => ({ cacheSize: n.size, tempVectorCount: Hn })
  };
}
const ct = /* @__PURE__ */ new Map(), ts = (n) => {
  const e = Math.round(n * 100) / 100;
  if (!ct.has(e)) {
    if (ct.size >= si) {
      const t = ct.keys().next().value;
      t !== void 0 && ct.delete(t);
    }
    ct.set(e, { sin: Math.sin(n), cos: Math.cos(n) });
  }
  return ct.get(e);
}, Lo = () => ct.clear(), Go = () => ({
  size: ct.size,
  maxSize: si,
  coverage: `${(ct.size / si * 100).toFixed(1)}%`
}), ns = (n, e, t = 0.01) => Math.abs(n - e) >= t, Dn = class Gs {
  static instance;
  vectorCaches = /* @__PURE__ */ new Map();
  static getInstance() {
    return this.instance ??= new Gs();
  }
  getVectorCache(e) {
    return this.vectorCaches.get(e) ?? (this.vectorCaches.set(e, Oo()), this.vectorCaches.get(e));
  }
  clearAll() {
    this.vectorCaches.forEach((e) => e.clear()), Lo();
  }
  getStats() {
    return {
      vectorCaches: Array.from(this.vectorCaches.entries()).map(([e, t]) => ({
        id: e,
        ...t.getStats()
      })),
      trigCache: Go()
    };
  }
};
Si([
  F()
], Dn.prototype, "getVectorCache");
Si([
  G()
], Dn.prototype, "clearAll");
Si([
  Jt(10)
], Dn.prototype, "getStats");
let Fo = Dn;
var Uo = Object.defineProperty, $o = Object.getOwnPropertyDescriptor, fn = (n, e, t, i) => {
  for (var s = $o(e, t), r = n.length - 1, o; r >= 0; r--)
    (o = n[r]) && (s = o(e, t, s) || s);
  return s && Uo(e, t, s), s;
};
class Yt {
  memoManager = Fo.getInstance();
  vectorCache = this.memoManager.getVectorCache("direction");
  lastEulerY = { character: 0, vehicle: 0, airplane: 0 };
  lastDirectionLength = 0;
  lastKeyboardState = {
    forward: !1,
    backward: !1,
    leftward: !1,
    rightward: !1
  };
  timers = /* @__PURE__ */ new Set();
  interactionSystem;
  config;
  tempEuler = new b.Euler();
  tempQuaternion = new b.Quaternion();
  targetQuaternion = new b.Quaternion();
  constructor(e) {
    this.interactionSystem = Fe.getInstance(), this.config = e;
  }
  updateDirection(e, t, i, s) {
    const { modeType: r } = e;
    switch (r) {
      case "character":
        this.updateCharacterDirection(e, t, i);
        break;
      case "vehicle":
        this.updateVehicleDirection(e, t);
        break;
      case "airplane":
        this.updateAirplaneDirection(e, s, t);
        break;
      default:
        this.updateCharacterDirection(e, t, i);
    }
  }
  updateCharacterDirection(e, t, i) {
    const { activeState: s } = e, r = this.interactionSystem.getKeyboardRef(), o = this.interactionSystem.getMouseRef(), a = this.lastKeyboardState.forward !== r.forward || this.lastKeyboardState.backward !== r.backward || this.lastKeyboardState.leftward !== r.leftward || this.lastKeyboardState.rightward !== r.rightward;
    o.isActive ? this.handleMouseDirection(s, o, this.config, i) : a && ((r.forward || r.backward || r.leftward || r.rightward) && this.handleKeyboardDirection(s, r, this.config, t), this.lastKeyboardState = {
      forward: r.forward,
      backward: r.backward,
      leftward: r.leftward,
      rightward: r.rightward
    }), this.emitRotationUpdate(s, "character");
  }
  updateVehicleDirection(e, t) {
    const { activeState: i } = e, s = this.interactionSystem.getKeyboardRef(), { forward: r, backward: o, leftward: a, rightward: l } = s, u = Number(l) - Number(a), d = Number(o) - Number(r);
    i.euler.y += u * (Math.PI / 64);
    const { sin: f, cos: h } = ts(i.euler.y);
    i.direction.set(f * d, 0, h * d), i.dir.copy(i.direction), this.emitRotationUpdate(i, "vehicle");
  }
  updateAirplaneDirection(e, t, i) {
    const { activeState: s } = e, r = this.interactionSystem.getKeyboardRef(), { forward: o, backward: a, leftward: l, rightward: u, shift: d, space: f } = r, {
      angleDelta: h = { x: 0.02, y: 0.02, z: 0.02 },
      maxAngle: g = { x: Math.PI / 6, y: Math.PI, z: Math.PI / 6 },
      accelRatio: v = 1.5
    } = this.config || {};
    if (!t?.current) return;
    let y = 1;
    d && (y *= v), f && (y *= 1.5);
    const p = Number(o) - Number(a), m = Number(l) - Number(u);
    i === "chase" ? s.euler.y += m * h.y * 0.5 : s.euler.y += m * h.y, this.applyAirplaneRotation(t.current, p, m, g, s), s.direction.set(
      Math.sin(s.euler.y) * y,
      -p * y,
      Math.cos(s.euler.y) * y
    ), s.dir.copy(s.direction).normalize(), this.emitRotationUpdate(s, "airplane");
  }
  applyAirplaneRotation(e, t, i, s, r) {
    const o = s.x * t, a = s.z * i, l = e.rotation.x, u = e.rotation.z, d = s.x, f = s.z;
    let h = l + o, g = u + a;
    h < -d ? h = -d : h > d && (h = d), g < -f ? g = -f : g > f && (g = f), r.euler.x = h, r.euler.z = g, this.tempEuler.set(h, 0, g), this.tempQuaternion.setFromEuler(e.rotation), this.targetQuaternion.setFromEuler(this.tempEuler), this.tempQuaternion.slerp(this.targetQuaternion, 0.2), e.setRotationFromQuaternion(this.tempQuaternion);
  }
  handleMouseDirection(e, t, i, s) {
    const { automation: r } = s?.worldContext || {};
    if (r?.settings.trackProgress && r.queue.actions && r.queue.actions.length > 0) {
      const o = r.queue.actions.shift();
      if (o && o.target) {
        const a = this.vectorCache.getTempVector(2), l = s?.rigidBodyRef?.current;
        if (l) {
          const f = l.translation();
          a.set(f.x, f.y, f.z);
        } else
          a.set(0, 0, 0);
        const u = o.target, d = this.vectorCache.getTempVector(1);
        d.subVectors(u, a).normalize(), s?.memo && (s.memo.direction || (s.memo.direction = new b.Vector3()), s.memo.directionTarget || (s.memo.directionTarget = new b.Vector3()), s.memo.direction.copy(d), s.memo.directionTarget.copy(u)), r.queue.loop && o && r.queue.actions && r.queue.actions.push(o);
      }
    } else {
      if (s?.rigidBodyRef.current) {
        const o = s.rigidBodyRef.current.translation(), a = this.vectorCache.getTempVector(0);
        if (a.set(o.x, o.y, o.z), lo(a, t.target) < 1) {
          this.handleClicker(s, o);
          return;
        }
      }
      this.applyMouseRotation(e, t, i);
    }
  }
  handleClicker(e, t) {
    const { automation: i } = e.worldContext || {};
    if (i?.settings.trackProgress && i.queue.actions && i.queue.actions.length > 0) {
      const s = i.queue.actions.shift();
      if (s && s.target) {
        const r = Math.atan2(s.target.z - t.z, s.target.x - t.x);
        e.setMouseInput?.({ target: s.target, angle: r, isActive: !0 });
      } else if (s && s.type === "wait") {
        const r = s.duration || 1e3;
        if (e.state) {
          e.state.clock.stop();
          const o = setTimeout(() => {
            e.state && e.state.clock.start(), this.timers.delete(o);
          }, r);
          this.timers.add(o);
        }
      }
      i.queue.loop && s && i.queue.actions && i.queue.actions.push(s);
    } else
      e.setMouseInput?.({ isActive: !1, shouldRun: !1 });
  }
  applyMouseRotation(e, t, i) {
    e.euler.y = Math.PI / 2 - t.angle;
    const { sin: s, cos: r } = ts(e.euler.y);
    e.dir.set(-s, 0, -r), e.direction.copy(e.dir);
  }
  handleKeyboardDirection(e, t, i, s) {
    const { forward: r, backward: o, leftward: a, rightward: l } = t, u = Number(l) - Number(a), d = Number(o) - Number(r);
    if (u === 0 && d === 0) return;
    const f = this.vectorCache.getTempVector(5);
    f.set(u, 0, d);
    const h = uo(f);
    e.euler.y = h, e.dir.set(u, 0, d), e.direction.copy(e.dir);
  }
  emitRotationUpdate(e, t) {
    const i = e.dir.length(), s = ns(e.euler.y, this.lastEulerY[t], 1e-3), r = ns(i, this.lastDirectionLength, 0.01);
    (s || r) && (this.lastDirectionLength = i), this.lastEulerY[t] = e.euler.y;
  }
  dispose() {
    this.timers.forEach((e) => clearTimeout(e)), this.timers.clear();
  }
}
fn([
  F()
], Yt.prototype, "updateDirection");
fn([
  F()
], Yt.prototype, "updateCharacterDirection");
fn([
  F()
], Yt.prototype, "updateVehicleDirection");
fn([
  F()
], Yt.prototype, "updateAirplaneDirection");
fn([
  G()
], Yt.prototype, "dispose");
var Vo = Object.defineProperty, Wo = Object.getOwnPropertyDescriptor, Xt = (n, e, t, i) => {
  for (var s = Wo(e, t), r = n.length - 1, o; r >= 0; r--)
    (o = n[r]) && (s = o(e, t, s) || s);
  return s && Vo(e, t, s), s;
};
class xt {
  refs;
  constructor() {
    this.refs = {
      activeState: {
        position: new b.Vector3(),
        quaternion: new b.Quaternion(),
        euler: new b.Euler(),
        velocity: new b.Vector3(),
        direction: new b.Vector3(),
        dir: new b.Vector3(),
        angular: new b.Vector3(),
        isGround: !1
      },
      gameStates: {
        canRide: !1,
        isRiding: !1,
        isJumping: !1,
        isFalling: !1,
        isMoving: !1,
        isRunning: !1,
        isNotMoving: !0,
        isNotRunning: !0,
        isOnTheGround: !0,
        nearbyRideable: void 0,
        currentRideable: void 0,
        rideableDistance: void 0
      }
    };
  }
  getActiveState() {
    return this.refs.activeState;
  }
  getGameStates() {
    return this.refs.gameStates;
  }
  getState() {
    return this.refs;
  }
  updateActiveState(e) {
    Object.assign(this.refs.activeState, e);
  }
  updateGameStates(e) {
    Object.assign(this.refs.gameStates, e);
  }
  resetActiveState() {
    this.refs.activeState.position.set(0, 0, 0), this.refs.activeState.quaternion.identity(), this.refs.activeState.euler.set(0, 0, 0), this.refs.activeState.velocity.set(0, 0, 0), this.refs.activeState.direction.set(0, 0, 0), this.refs.activeState.dir.set(0, 0, 0), this.refs.activeState.angular.set(0, 0, 0), this.refs.activeState.isGround = !1;
  }
  resetGameStates() {
    this.refs.gameStates.canRide = !1, this.refs.gameStates.isRiding = !1, this.refs.gameStates.isJumping = !1, this.refs.gameStates.isFalling = !1, this.refs.gameStates.isMoving = !1, this.refs.gameStates.isRunning = !1, this.refs.gameStates.isNotMoving = !0, this.refs.gameStates.isNotRunning = !0, this.refs.gameStates.isOnTheGround = !0, this.refs.gameStates.nearbyRideable = void 0, this.refs.gameStates.currentRideable = void 0, this.refs.gameStates.rideableDistance = void 0;
  }
  reset() {
    this.resetActiveState(), this.resetGameStates();
  }
  dispose() {
    this.reset();
  }
}
Xt([
  F()
], xt.prototype, "updateActiveState");
Xt([
  F()
], xt.prototype, "updateGameStates");
Xt([
  G()
], xt.prototype, "resetActiveState");
Xt([
  G()
], xt.prototype, "resetGameStates");
Xt([
  G()
], xt.prototype, "reset");
Xt([
  G()
], xt.prototype, "dispose");
var Bo = Object.defineProperty, qo = Object.getOwnPropertyDescriptor, Fs = (n, e, t, i) => {
  for (var s = qo(e, t), r = n.length - 1, o; r >= 0; r--)
    (o = n[r]) && (s = o(e, t, s) || s);
  return s && Bo(e, t, s), s;
};
class Mi {
  stateManager;
  interactionSystem;
  config;
  constructor(e) {
    this.stateManager = new xt(), this.interactionSystem = Fe.getInstance(), this.config = e;
  }
  applyImpulse(e, t) {
    if (!e.current) return;
    const { modeType: i } = t;
    switch (i) {
      case "character":
        this.applyCharacterImpulse(e, t);
        break;
      case "vehicle":
        this.applyVehicleImpulse(e, t);
        break;
      case "airplane":
        this.applyAirplaneImpulse(e, t);
        break;
      default:
        this.applyCharacterImpulse(e, t);
    }
  }
  applyCharacterImpulse(e, t) {
    const {
      gameStates: { isMoving: i, isRunning: s, isOnTheGround: r, isJumping: o },
      activeState: a
    } = t, { walkSpeed: l = 10, runSpeed: u = 20, jumpSpeed: d = 15 } = this.config;
    if (o && r) {
      const f = e.current.linvel();
      e.current.setLinvel({ x: f.x, y: d, z: f.z }, !0), this.stateManager.updateGameStates({
        isOnTheGround: !1
      });
    }
    if (i) {
      const f = s ? u : l, h = a.dir, g = a.velocity, v = e.current.mass(), y = -h.x * f, p = -h.z * f, m = y - g.x, x = p - g.z, M = m * v, P = x * v;
      e.current.applyImpulse({ x: M, y: 0, z: P }, !0);
    }
  }
  applyVehicleImpulse(e, t) {
    const { activeState: i } = t, s = this.interactionSystem.getKeyboardRef(), { maxSpeed: r = 10, accelRatio: o = 2 } = this.config, { shift: a } = s, l = e.current.linvel(), u = Math.max(0, r);
    if (l.x * l.x + l.z * l.z < u * u) {
      const f = e.current.mass(), h = a ? o : 1, g = {
        x: i.dir.x * f * h,
        y: 0,
        z: i.dir.z * f * h
      };
      e.current.applyImpulse(g, !0);
    }
  }
  applyAirplaneImpulse(e, t) {
    const { activeState: i } = t, { maxSpeed: s = 20 } = this.config, r = e.current.linvel(), o = Math.max(0, s);
    if (r.x * r.x + r.y * r.y + r.z * r.z < o * o) {
      const l = e.current.mass(), u = {
        x: i.direction.x * l,
        y: i.direction.y * l,
        z: i.direction.z * l
      };
      e.current.applyImpulse(u, !0);
    }
  }
}
Fs([
  F()
], Mi.prototype, "applyImpulse");
Fs([
  F()
], Mi.prototype, "applyCharacterImpulse");
var Ho = Object.defineProperty, Qo = Object.getOwnPropertyDescriptor, De = (n, e, t, i) => {
  for (var s = i > 1 ? void 0 : i ? Qo(e, t) : e, r = n.length - 1, o; r >= 0; r--)
    (o = n[r]) && (s = (i ? o(e, t, s) : o(s)) || s);
  return i && s && Ho(e, t, s), s;
};
const Jo = {
  isJumping: !1,
  isMoving: !1,
  isRunning: !1,
  lastUpdate: 0
}, Zo = {
  forcesApplied: 0,
  dampingChanges: 0,
  frameTime: 0
};
let ke = class extends qe {
  directionComponent;
  impulseComponent;
  gravityComponent;
  animationController = new Ls();
  forceComponents = [];
  keyStateCache = /* @__PURE__ */ new Map();
  isCurrentlyJumping = !1;
  lastMovingState = !1;
  lastRunningState = !1;
  tempQuaternion = new b.Quaternion();
  tempEuler = new b.Euler();
  tempVector = new b.Vector3();
  config;
  constructor(n, e = {}) {
    super(Jo, Zo, e), this.config = n, this.directionComponent = new Yt(this.config), this.impulseComponent = new Mi(this.config), this.gravityComponent = new hn(this.config);
  }
  updateConfig(n) {
    this.config = { ...this.config, ...n };
  }
  performUpdate(n) {
    this.calculate(n.calcProp, n.physicsState);
  }
  updateMetrics(n) {
    this.state.isJumping = this.isCurrentlyJumping, this.state.isMoving = this.lastMovingState, this.state.isRunning = this.lastRunningState;
  }
  updateWithArgs(n) {
    this.performUpdateWithArgs(n);
  }
  calculate(n, e) {
    if (!e || !n.rigidBodyRef.current) return;
    const t = n.rigidBodyRef.current.linvel();
    e.activeState.velocity.set(
      t.x,
      t.y,
      t.z
    ), this.checkAllStates(n, e), this.animationController.update(e.gameStates);
    const { modeType: s = "character" } = e;
    switch (s) {
      case "character":
        this.calculateCharacter(n, e);
        break;
      case "vehicle":
        this.calculateVehicle(n, e);
        break;
      case "airplane":
        this.calculateAirplane(n, e);
        break;
    }
  }
  checkAllStates(n, e) {
    const t = n.rigidBodyRef.current?.handle ?? -1;
    this.checkGround(n, e), this.checkMoving(e), this.checkRiding(t, e);
  }
  checkGround(n, e) {
    const { rigidBodyRef: t } = n, i = e.gameStates, s = e.activeState;
    if (!t.current) {
      i.isOnTheGround = !1, i.isFalling = !0;
      return;
    }
    const r = t.current.linvel(), o = t.current.translation(), l = o.y <= 1, u = Math.abs(r.y) < 0.5, d = l && u, f = !d && r.y < -0.1;
    d && this.resetJumpState(e), i.isOnTheGround = d, i.isFalling = f, this.copyVector3(s.position, o), this.copyVector3(s.velocity, r);
  }
  checkMoving(n) {
    const e = n.gameStates, t = n.keyboard, i = n.mouse, { shift: s, space: r, forward: o, backward: a, leftward: l, rightward: u } = t, d = o || a || l || u, f = d || i.isActive, h = d && s || i.isActive && i.shouldRun;
    r && !this.isCurrentlyJumping && (this.isCurrentlyJumping = !0, e.isJumping = !0), this.updateStateIfChanged("isMoving", f, () => {
      this.lastMovingState = f, e.isMoving = f, e.isNotMoving = !f;
    }), this.updateStateIfChanged("isRunning", h, () => {
      this.lastRunningState = h, e.isRunning = h, e.isNotRunning = !h;
    });
  }
  checkRiding(n = -1, e) {
    const t = e.keyboard;
    this.keyStateCache.has(n) || this.keyStateCache.set(n, { lastKeyE: !1, lastKeyR: !1 });
    const i = this.keyStateCache.get(n), s = t.keyE, r = e.gameStates;
    s && !i.lastKeyE && (r.canRide && !r.isRiding || r.isRiding), i.lastKeyE = s, i.lastKeyR = !1;
  }
  resetJumpState(n) {
    this.isCurrentlyJumping = !1, n.gameStates.isJumping = !1;
  }
  calculateCharacter(n, e) {
    const { rigidBodyRef: t, innerGroupRef: i } = n;
    if (this.directionComponent.updateDirection(e, "normal", n), this.impulseComponent.applyImpulse(t, e), this.gravityComponent.applyGravity(t, e), this.updateForces(t, e.delta ?? 0), t?.current) {
      const s = e.gameStates, r = e.activeState, { isJumping: o, isFalling: a, isNotMoving: l } = s, {
        linearDamping: u = 0.9,
        airDamping: d = 0.2,
        stopDamping: f = 1
      } = this.config;
      t.current.setLinearDamping(
        o || a ? d : l ? u * f : u
      ), t.current.setEnabledRotations(!1, !1, !1, !1), i?.current && i.current.quaternion.setFromEuler(r.euler);
    }
  }
  calculateVehicle(n, e) {
    const { rigidBodyRef: t, innerGroupRef: i } = n;
    if (this.directionComponent.updateDirection(e, "normal", n), this.impulseComponent.applyImpulse(t, e), this.applyDamping(t, e), this.updateForces(t, e.delta ?? 0), t?.current) {
      const s = e.activeState;
      t.current.setEnabledRotations(!1, !0, !1, !1), this.tempEuler.set(0, s.euler.y, 0), this.tempQuaternion.setFromEuler(this.tempEuler), t.current.setRotation(this.tempQuaternion, !0), i?.current && (i.current.rotation.y = 0);
    }
  }
  calculateAirplane(n, e) {
    const { rigidBodyRef: t, innerGroupRef: i } = n;
    this.directionComponent.updateDirection(
      e,
      "normal",
      n,
      i
    ), this.impulseComponent.applyImpulse(t, e), this.gravityComponent.applyGravity(t, e), this.applyDamping(t, e), this.updateForces(t, e.delta ?? 0), t?.current && t.current.setEnabledRotations(!1, !1, !1, !1);
  }
  applyDamping(n, e) {
    if (!n?.current || !e) return;
    const { modeType: t, keyboard: i } = e, { space: s } = i;
    if (t === "vehicle") {
      const { linearDamping: r = 0.9, brakeRatio: o = r } = this.config, a = s ? o : r;
      n.current.setLinearDamping(a);
    } else if (t === "airplane") {
      const { linearDamping: r = 0.2 } = this.config;
      n.current.setLinearDamping(r);
    }
  }
  addForceComponent(n) {
    this.forceComponents.push(n);
  }
  applyForce(n, e) {
    if (!e) return;
    const t = e.linvel();
    this.tempVector.set(
      t.x + n.x,
      t.y + n.y,
      t.z + n.z
    ), e.setLinvel(this.tempVector, !0);
  }
  calculateMovement(n, e, t, i) {
    const s = new b.Vector3(), r = n.shift ? 2 : 1, o = (e.maxSpeed ?? 10) * r;
    return n.forward && (s.z += 1), n.backward && (s.z -= 1), n.leftward && (s.x += 1), n.rightward && (s.x -= 1), s.length() > 0 && (s.normalize().multiplyScalar(o * i), t.isRunning = n.shift, t.isNotRunning = !n.shift), s;
  }
  calculateJump(n, e, t) {
    return t ? (e.isJumping = !0, new b.Vector3(0, n.jumpSpeed, 0)) : new b.Vector3();
  }
  updateForces(n, e) {
    if (n.current)
      for (const t of this.forceComponents)
        t.update(n.current, e);
  }
  /**
   * Vector3 헬퍼 - 한 벡터를 다른 벡터로 복사
   */
  copyVector3(n, e) {
    n.set(e.x, e.y, e.z);
  }
  /**
   * 조건부 상태 업데이트 - 변경된 경우에만 업데이트
   */
  updateStateIfChanged(n, e, t) {
    return this.state[n] !== e ? (this.state[n] = e, t?.(), !0) : !1;
  }
};
De([
  G()
], ke.prototype, "updateConfig", 1);
De([
  F()
], ke.prototype, "performUpdate", 1);
De([
  F()
], ke.prototype, "updateMetrics", 1);
De([
  G(),
  F()
], ke.prototype, "calculate", 1);
De([
  F()
], ke.prototype, "checkAllStates", 1);
De([
  F()
], ke.prototype, "checkGround", 1);
De([
  F()
], ke.prototype, "checkMoving", 1);
De([
  G(),
  F()
], ke.prototype, "calculateCharacter", 1);
De([
  G(),
  F()
], ke.prototype, "calculateVehicle", 1);
De([
  G(),
  F()
], ke.prototype, "calculateAirplane", 1);
De([
  F()
], ke.prototype, "applyDamping", 1);
De([
  G()
], ke.prototype, "applyForce", 1);
De([
  G(),
  F()
], ke.prototype, "calculateMovement", 1);
De([
  G()
], ke.prototype, "calculateJump", 1);
De([
  F()
], ke.prototype, "updateForces", 1);
ke = De([
  Qt({ autoStart: !1 })
], ke);
var Ko = Object.defineProperty, Yo = Object.getOwnPropertyDescriptor, Ci = (n, e, t, i) => {
  for (var s = i > 1 ? void 0 : i ? Yo(e, t) : e, r = n.length - 1, o; r >= 0; r--)
    (o = n[r]) && (s = (i ? o(e, t, s) : o(s)) || s);
  return i && s && Ko(e, t, s), s;
};
let xn = class extends qt {
  buildEngine(n, e) {
    const t = new ke(e);
    return { system: t, dispose: () => t.dispose() };
  }
  executeCommand(n, e, t) {
    switch (e.type) {
      case "updateConfig":
        n.system.updateConfig(e.data);
        break;
    }
  }
  // 60fps 캐싱
  createSnapshot(n) {
    return {
      ...n.system.getState(),
      metrics: { ...n.system.getMetrics() }
    };
  }
  updateEntity(n, e) {
    const t = this.getEngine(n);
    t && (t.system.updateWithArgs(e), this.notifyListeners(n));
  }
};
Ci([
  Ht()
], xn.prototype, "executeCommand", 1);
Ci([
  bt(),
  jt(16)
], xn.prototype, "createSnapshot", 1);
xn = Ci([
  Zt("physics"),
  vi()
], xn);
class Gt {
  cellSize;
  cells = /* @__PURE__ */ new Map();
  objectPositions = /* @__PURE__ */ new Map();
  constructor(e = {}) {
    this.cellSize = e.cellSize ?? 10;
  }
  static zigZag(e) {
    return e >= 0 ? e * 2 : -e * 2 - 1;
  }
  static pair(e, t) {
    const i = Gt.zigZag(e), s = Gt.zigZag(t), r = i + s;
    return r * (r + 1) / 2 + s;
  }
  getCellKey(e, t) {
    const i = Math.floor(e / this.cellSize), s = Math.floor(t / this.cellSize);
    return Gt.pair(i, s);
  }
  add(e, t) {
    this.remove(e);
    const i = this.getCellKey(t.x, t.z);
    this.cells.has(i) || this.cells.set(i, /* @__PURE__ */ new Set()), this.cells.get(i).add(e), this.objectPositions.set(e, t.clone());
  }
  remove(e) {
    const t = this.objectPositions.get(e);
    if (t) {
      const i = this.getCellKey(t.x, t.z), s = this.cells.get(i);
      s && (s.delete(e), s.size === 0 && this.cells.delete(i)), this.objectPositions.delete(e);
    }
  }
  update(e, t) {
    const i = this.objectPositions.get(e);
    if (!i) {
      this.add(e, t);
      return;
    }
    if (i.equals(t)) return;
    const s = this.getCellKey(i.x, i.z), r = this.getCellKey(t.x, t.z);
    if (s !== r) {
      const o = this.cells.get(s);
      o && (o.delete(e), o.size === 0 && this.cells.delete(s));
      const a = this.cells.get(r) ?? /* @__PURE__ */ new Set();
      a.add(e), this.cells.set(r, a);
    }
    i.copy(t);
  }
  getNearby(e, t, i) {
    const s = i ?? [];
    i && (i.length = 0);
    const r = Math.ceil(t / this.cellSize), o = Math.floor(e.x / this.cellSize), a = Math.floor(e.z / this.cellSize), l = t * t;
    for (let u = o - r; u <= o + r; u++)
      for (let d = a - r; d <= a + r; d++) {
        const f = Gt.pair(u, d), h = this.cells.get(f);
        if (h)
          for (const g of h) {
            const v = this.objectPositions.get(g);
            if (!v) continue;
            const y = e.x - v.x, p = e.y - v.y, m = e.z - v.z;
            y * y + p * p + m * m <= l && s.push(g);
          }
      }
    return s;
  }
  clear() {
    this.cells.clear(), this.objectPositions.clear();
  }
  get size() {
    return this.objectPositions.size;
  }
}
var Xo = Object.defineProperty, ea = Object.getOwnPropertyDescriptor, En = (n, e, t, i) => {
  for (var s = i > 1 ? void 0 : i ? ea(e, t) : e, r = n.length - 1, o; r >= 0; r--)
    (o = n[r]) && (s = (i ? o(e, t, s) : o(s)) || s);
  return i && s && Xo(e, t, s), s;
};
let Vt = class {
  objects = /* @__PURE__ */ new Map();
  interactionEvents = [];
  spatial = new Gt({ cellSize: 10 });
  raycaster = new b.Raycaster();
  tempVector = new b.Vector3();
  nearbyIds = [];
  nearbyIds2 = [];
  async init() {
    console.log("[WorldSystem] Initialized");
  }
  update(n) {
  }
  dispose() {
    this.cleanup();
  }
  addObject(n) {
    this.objects.set(n.id, n), this.spatial.add(n.id, n.position);
  }
  removeObject(n) {
    return this.objects.get(n) && this.spatial.remove(n), this.objects.delete(n);
  }
  getObject(n) {
    return this.objects.get(n);
  }
  getAllObjects() {
    return Array.from(this.objects.values());
  }
  getObjectsByType(n) {
    return this.getAllObjects().filter((e) => e.type === n);
  }
  updateObject(n, e) {
    const t = this.objects.get(n);
    return t ? (Object.assign(t, e), e.position && this.spatial.update(n, e.position), !0) : !1;
  }
  getObjectsInRadius(n, e) {
    const t = this.spatial.getNearby(n, e, this.nearbyIds), i = [];
    for (const s of t) {
      const r = this.objects.get(s);
      r && i.push(r);
    }
    return i;
  }
  checkCollisions(n) {
    const e = this.objects.get(n);
    if (!e || !e.boundingBox) return [];
    const t = e.boundingBox.max.distanceTo(e.boundingBox.min), i = this.spatial.getNearby(e.position, t, this.nearbyIds2), s = [];
    for (const r of i) {
      if (r === n) continue;
      const o = this.objects.get(r);
      !o || !o.boundingBox || e.boundingBox.intersectsBox(o.boundingBox) && s.push(o);
    }
    return s;
  }
  processInteraction(n) {
    this.interactionEvents.push(n), this.interactionEvents.length > 1e3 && (this.interactionEvents = this.interactionEvents.slice(-500));
  }
  getRecentEvents(n = 1e3) {
    const e = Date.now();
    return this.interactionEvents.filter(
      (t) => e - t.timestamp <= n
    );
  }
  raycast(n, e, t = 100) {
    this.raycaster.set(n, e), this.raycaster.near = 0, this.raycaster.far = t;
    const i = this.spatial.getNearby(n, t, this.nearbyIds);
    for (const s of i) {
      const r = this.objects.get(s);
      if (r && r.boundingBox) {
        const o = this.raycaster.ray.intersectBox(r.boundingBox, this.tempVector);
        if (o)
          return {
            object: r,
            distance: n.distanceTo(o),
            point: o.clone()
          };
      }
    }
    return null;
  }
  cleanup() {
    this.objects.clear(), this.interactionEvents.length = 0, this.spatial.clear();
  }
};
En([
  G()
], Vt.prototype, "init", 1);
En([
  F(),
  G()
], Vt.prototype, "update", 1);
En([
  G()
], Vt.prototype, "dispose", 1);
Vt = En([
  An("world")
], Vt);
var ta = Object.defineProperty, na = Object.getOwnPropertyDescriptor, Pi = (n, e, t, i) => {
  for (var s = i > 1 ? void 0 : i ? na(e, t) : e, r = n.length - 1, o; r >= 0; r--)
    (o = n[r]) && (s = (i ? o(e, t, s) : o(s)) || s);
  return i && s && ta(e, t, s), s;
};
let wn = class extends qt {
  buildEngine(n, e) {
    const t = new Vt(), i = {
      ...e?.selectedObjectId !== void 0 ? { selectedObjectId: e.selectedObjectId } : {},
      interactionMode: e?.interactionMode ?? "view",
      showDebugInfo: e?.showDebugInfo ?? !1
    };
    return {
      system: t,
      state: i,
      dispose: () => t.dispose()
    };
  }
  executeCommand(n, e, t) {
    const { system: i, state: s } = n;
    switch (e.type) {
      case "addObject":
        const { id: r, ...o } = e.data, a = typeof r == "string" && r.length > 0 ? r : this.generateId(), l = { ...o, id: a };
        i.addObject(l);
        break;
      case "removeObject":
        i.removeObject(e.data.id), s.selectedObjectId === e.data.id && delete s.selectedObjectId;
        break;
      case "updateObject":
        i.updateObject(e.data.id, e.data.updates);
        break;
      case "selectObject":
        e.data.id !== void 0 ? s.selectedObjectId = e.data.id : delete s.selectedObjectId;
        break;
      case "setInteractionMode":
        s.interactionMode = e.data.mode;
        break;
      case "toggleDebugInfo":
        s.showDebugInfo = !s.showDebugInfo;
        break;
      case "interact":
        const u = i.getObject(e.data.objectId);
        if (u && u.canInteract) {
          const d = {
            type: "custom",
            object1Id: e.data.objectId,
            timestamp: Date.now(),
            data: { action: e.data.action }
          };
          i.processInteraction(d);
        }
        break;
      case "cleanup":
        i.cleanup(), delete s.selectedObjectId, s.interactionMode = "view", s.showDebugInfo = !1;
        break;
    }
  }
  // 60fps 캐싱
  createSnapshot(n, e) {
    const { system: t, state: i } = n;
    return {
      objects: t.getAllObjects(),
      ...i.selectedObjectId !== void 0 ? { selectedObjectId: i.selectedObjectId } : {},
      interactionMode: i.interactionMode,
      showDebugInfo: i.showDebugInfo,
      events: t.getRecentEvents(),
      // 추가 조회 기능들을 함수로 제공
      objectsInRadius: (s, r) => t.getObjectsInRadius(s, r),
      objectsByType: (s) => t.getObjectsByType(s),
      raycast: (s, r) => t.raycast(s, r)?.object || null
    };
  }
  // 편의 메서드들 (기존 API 호환성 유지)
  addObject(n, e) {
    const t = e.id, i = typeof t == "string" && t.length > 0 ? t : this.generateId();
    return this.execute(n, { type: "addObject", data: { ...e, id: i } }), i;
  }
  removeObject(n, e) {
    this.execute(n, { type: "removeObject", data: { id: e } });
  }
  updateObject(n, e, t) {
    this.execute(n, { type: "updateObject", data: { id: e, updates: t } });
  }
  selectObject(n, e) {
    this.execute(
      n,
      { type: "selectObject", data: e !== void 0 ? { id: e } : {} }
    );
  }
  setInteractionMode(n, e) {
    this.execute(n, { type: "setInteractionMode", data: { mode: e } });
  }
  toggleDebugInfo(n) {
    this.execute(n, { type: "toggleDebugInfo" });
  }
  interact(n, e, t) {
    this.execute(n, { type: "interact", data: { objectId: e, action: t } });
  }
  cleanup(n) {
    this.execute(n, { type: "cleanup" });
  }
  // 조회 메서드들
  getObjectsInRadius(n, e, t) {
    const i = this.getEngine(n);
    return i ? i.system.getObjectsInRadius(e, t) : [];
  }
  getObjectsByType(n, e) {
    const t = this.getEngine(n);
    return t ? t.system.getObjectsByType(e) : [];
  }
  raycast(n, e, t) {
    const i = this.getEngine(n);
    return i && i.system.raycast(e, t)?.object || null;
  }
  generateId() {
    return `world_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};
Pi([
  Ht()
], wn.prototype, "executeCommand", 1);
Pi([
  bt(),
  jt(16)
], wn.prototype, "createSnapshot", 1);
wn = Pi([
  Zt("world"),
  vi()
], wn);
var ia = Object.getOwnPropertyDescriptor, sa = (n, e, t, i) => {
  for (var s = i > 1 ? void 0 : i ? ia(e, t) : e, r = n.length - 1, o; r >= 0; r--)
    (o = n[r]) && (s = o(s) || s);
  return s;
};
let ri = class extends qe {
  callbacks;
  systemType;
  constructor(n = "default") {
    const e = {
      currentAnimation: "idle",
      animationMixer: null,
      actions: /* @__PURE__ */ new Map(),
      isPlaying: !1,
      currentWeight: 1,
      blendDuration: 0.3,
      lastUpdate: Date.now()
    }, t = {
      activeAnimations: 0,
      totalActions: 0,
      currentWeight: 1,
      mixerTime: 0,
      lastUpdate: 0,
      blendProgress: 0,
      frameTime: 0
    };
    super(e, t), this.callbacks = /* @__PURE__ */ new Set(), this.systemType = n;
  }
  getSystemType() {
    return this.systemType;
  }
  subscribe(n) {
    return this.callbacks.add(n), () => this.callbacks.delete(n);
  }
  notifyCallbacks() {
    this.callbacks.forEach((n) => n(this.getMetrics()));
  }
  initializeMixer(n) {
    this.state.animationMixer = new b.AnimationMixer(n);
  }
  addAnimation(n, e) {
    if (!this.state.animationMixer) return;
    const t = this.state.animationMixer.clipAction(e);
    this.state.actions.set(n, t), this.updateMetrics(0), this.notifyCallbacks();
  }
  registerAction(n, e) {
    this.state.actions.set(n, e), this.updateMetrics(0), this.notifyCallbacks();
  }
  playAnimation(n, e = this.state.blendDuration) {
    const t = this.state.actions.get(n);
    if (!t) return;
    const i = this.state.actions.get(this.state.currentAnimation);
    i && i !== t && i.fadeOut(e), t.reset().fadeIn(e).play(), this.state.currentAnimation = n, this.state.isPlaying = !0, this.updateMetrics(0), this.notifyCallbacks();
  }
  stopAnimation() {
    const n = this.state.actions.get(this.state.currentAnimation);
    n && n.stop(), this.state.isPlaying = !1, this.state.currentAnimation = "idle", this.updateMetrics(0), this.notifyCallbacks();
  }
  setWeight(n) {
    const e = this.state.actions.get(this.state.currentAnimation);
    e && (e.weight = n, this.state.currentWeight = n, this.updateMetrics(0), this.notifyCallbacks());
  }
  setTimeScale(n) {
    const e = this.state.actions.get(this.state.currentAnimation);
    e && (e.timeScale = n, this.notifyCallbacks());
  }
  // AbstractSystem의 추상 메서드 구현
  performUpdate(n) {
    this.state.animationMixer && (this.state.animationMixer.update(n.deltaTime / 1e3), this.metrics.mixerTime += n.deltaTime / 1e3);
  }
  // AnimationBridge에서 호출하는 update 메서드 (deltaTime 파라미터 유지)
  updateAnimation(n) {
    const e = {
      deltaTime: n * 1e3,
      // seconds to ms
      totalTime: 0,
      frameCount: 0
    };
    super.update(e), this.callbacks.size > 0 && this.notifyCallbacks();
  }
  getCurrentAnimation() {
    return this.state.currentAnimation;
  }
  getAnimationList() {
    return Array.from(this.state.actions.keys());
  }
  getMetrics() {
    return { ...this.metrics };
  }
  getState() {
    return { ...this.state };
  }
  updateMetrics(n) {
    this.metrics.frameTime = n, this.metrics.activeAnimations = Array.from(this.state.actions.values()).filter((e) => e.isRunning()).length, this.metrics.totalActions = this.state.actions.size, this.metrics.currentWeight = this.state.currentWeight, this.metrics.lastUpdate = Date.now();
  }
  clearActions() {
    this.state.actions.forEach((n) => {
      n.isRunning() && n.stop();
    }), this.state.actions.clear(), this.state.currentAnimation = "idle", this.state.isPlaying = !1, this.updateMetrics(0), this.notifyCallbacks();
  }
  onDispose() {
    this.state.animationMixer && (this.state.animationMixer.stopAllAction(), this.state.animationMixer = null), this.state.actions.clear(), this.callbacks.clear();
  }
};
ri = sa([
  Qt({ autoStart: !1 })
], ri);
var ra = Object.defineProperty, oa = Object.getOwnPropertyDescriptor, wt = (n, e, t, i) => {
  for (var s = i > 1 ? void 0 : i ? oa(e, t) : e, r = n.length - 1, o; r >= 0; r--)
    (o = n[r]) && (s = (i ? o(e, t, s) : o(s)) || s);
  return i && s && ra(e, t, s), s;
};
function is(n) {
  return n.replace(/[\x00-\x1F\x7F]/g, "").trim();
}
let ut = class extends qt {
  constructor() {
    super(), ["character", "vehicle", "airplane"].forEach((e) => {
      this.register(e);
    }), this.setupEngineSubscriptions();
  }
  setupEngineSubscriptions() {
    this.engines.forEach((n, e) => {
      n.subscribe(() => {
        this.notifyListeners(e);
      });
    });
  }
  buildEngine(n) {
    return new ri(n);
  }
  registerAnimationAction(n, e, t) {
    const i = this.getEngine(n);
    if (i) {
      const s = is(e), r = s.length > 0 ? s : e;
      i.registerAction(r, t);
    }
  }
  registerAnimations(n, e) {
    const t = this.getEngine(n);
    t && Object.entries(e).forEach(([i, s]) => {
      if (s) {
        const r = is(i), o = r.length > 0 ? r : i;
        t.registerAction(o, s);
      }
    });
  }
  unregisterAnimations(n) {
    const e = this.getEngine(n);
    e && e.clearActions();
  }
  executeCommand(n, e) {
    switch (e.type) {
      case "play":
        e.animation && n.playAnimation(e.animation, e.duration);
        break;
      case "stop":
        n.stopAnimation();
        break;
      case "setWeight":
        e.weight !== void 0 && n.setWeight(e.weight);
        break;
      case "setSpeed":
        e.speed !== void 0 && n.setTimeScale(e.speed);
        break;
    }
  }
  // 60fps 캐싱
  createSnapshot(n) {
    const e = n.getState(), t = n.getMetrics();
    return {
      currentAnimation: e.currentAnimation,
      isPlaying: e.isPlaying,
      weight: e.currentWeight,
      speed: 1,
      availableAnimations: n.getAnimationList(),
      metrics: {
        activeAnimations: t.activeAnimations,
        totalActions: t.totalActions,
        mixerTime: t.mixerTime,
        lastUpdate: t.lastUpdate
      }
    };
  }
  getMetrics(n) {
    const e = this.getEngine(n);
    return e ? e.getMetrics() : null;
  }
  update(n, e) {
    const t = this.getEngine(n);
    t && t.updateAnimation(e);
  }
  execute(n, e) {
    super.execute(n, e);
  }
  snapshot(n) {
    const e = super.snapshot(n);
    return e || {
      currentAnimation: "idle",
      isPlaying: !1,
      weight: 0,
      speed: 1,
      availableAnimations: [],
      metrics: {
        activeAnimations: 0,
        totalActions: 0,
        mixerTime: 0,
        lastUpdate: 0
      }
    };
  }
};
wt([
  ze()
], ut.prototype, "registerAnimationAction", 1);
wt([
  ze()
], ut.prototype, "unregisterAnimations", 1);
wt([
  Ns("play"),
  Ht()
], ut.prototype, "executeCommand", 1);
wt([
  bt(),
  jt(16)
], ut.prototype, "createSnapshot", 1);
wt([
  ze()
], ut.prototype, "getMetrics", 1);
wt([
  ze()
], ut.prototype, "update", 1);
wt([
  bt(),
  jt(16)
], ut.prototype, "snapshot", 1);
ut = wt([
  Zt("animation"),
  bi()
], ut);
var Qn = { exports: {} }, en = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var ss;
function aa() {
  if (ss) return en;
  ss = 1;
  var n = Symbol.for("react.transitional.element"), e = Symbol.for("react.fragment");
  function t(i, s, r) {
    var o = null;
    if (r !== void 0 && (o = "" + r), s.key !== void 0 && (o = "" + s.key), "key" in s) {
      r = {};
      for (var a in s)
        a !== "key" && (r[a] = s[a]);
    } else r = s;
    return s = r.ref, {
      $$typeof: n,
      type: i,
      key: o,
      ref: s !== void 0 ? s : null,
      props: r
    };
  }
  return en.Fragment = e, en.jsx = t, en.jsxs = t, en;
}
var rs;
function ca() {
  return rs || (rs = 1, Qn.exports = aa()), Qn.exports;
}
var c = ca();
const la = [
  { value: "idle", label: "Idle" },
  { value: "walk", label: "Walk" },
  { value: "run", label: "Run" },
  { value: "jump", label: "Jump" },
  { value: "fall", label: "Fall" },
  { value: "dance", label: "Dance" },
  { value: "wave", label: "Wave" }
];
function ua() {
  const { playAnimation: n, currentType: e, currentAnimation: t } = Rn(), i = (s) => {
    n(e, s);
  };
  return /* @__PURE__ */ c.jsx("div", { className: "ac-panel", children: /* @__PURE__ */ c.jsx("div", { className: "ac-grid", children: la.map((s) => /* @__PURE__ */ c.jsx(
    "button",
    {
      className: `ac-button ${s.value === t ? "active" : ""}`,
      onClick: () => i(s.value),
      title: s.label,
      children: s.label
    },
    s.value
  )) }) });
}
const da = () => /* @__PURE__ */ c.jsx("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ c.jsx("path", { d: "M8 5v14l11-7z" }) }), ha = () => /* @__PURE__ */ c.jsx("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ c.jsx("path", { d: "M6 19h4V5H6v14zm8-14v14h4V5h-4z" }) }), fa = () => /* @__PURE__ */ c.jsx("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ c.jsx("path", { d: "M6 6h2v12H6zm3.5 6l8.5 6V6z" }) }), pa = () => /* @__PURE__ */ c.jsx("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ c.jsx("path", { d: "M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" }) });
function ma() {
  const { bridge: n, playAnimation: e, stopAnimation: t, currentType: i, currentAnimation: s } = Rn(), [r, o] = q(!1), [a, l] = q([]), [u, d] = q(30);
  z(() => {
    if (!n) return;
    const h = () => {
      const v = n.snapshot(i);
      v && (o(v.isPlaying), l(v.availableAnimations));
    };
    return h(), n.subscribe((v, y) => {
      y === i && h();
    });
  }, [n, i]);
  const f = () => {
    r ? t(i) : e(i, s);
  };
  return /* @__PURE__ */ c.jsxs("div", { className: "ap-panel", children: [
    /* @__PURE__ */ c.jsxs("div", { className: "ap-controls", children: [
      /* @__PURE__ */ c.jsx(
        "select",
        {
          className: "ap-select",
          value: s,
          onChange: (h) => e(i, h.target.value),
          children: a.map((h) => /* @__PURE__ */ c.jsx("option", { value: h, children: h }, h))
        }
      ),
      /* @__PURE__ */ c.jsxs("div", { className: "ap-buttons", children: [
        /* @__PURE__ */ c.jsx("button", { className: "ap-btn", "aria-label": "previous animation", children: /* @__PURE__ */ c.jsx(fa, {}) }),
        /* @__PURE__ */ c.jsx("button", { className: "ap-btn-primary", onClick: f, "aria-label": r ? "pause" : "play", children: r ? /* @__PURE__ */ c.jsx(ha, {}) : /* @__PURE__ */ c.jsx(da, {}) }),
        /* @__PURE__ */ c.jsx("button", { className: "ap-btn", "aria-label": "next animation", children: /* @__PURE__ */ c.jsx(pa, {}) })
      ] })
    ] }),
    /* @__PURE__ */ c.jsxs("div", { className: "ap-timeline", children: [
      /* @__PURE__ */ c.jsx("span", { className: "ap-time", children: "0:00" }),
      /* @__PURE__ */ c.jsx(
        "input",
        {
          type: "range",
          className: "ap-slider",
          min: "0",
          max: "100",
          value: u,
          onChange: (h) => d(Number(h.target.value))
        }
      ),
      /* @__PURE__ */ c.jsx("span", { className: "ap-time", children: "1:30" })
    ] })
  ] });
}
const ga = [
  {
    key: "currentAnimation",
    label: "현재 애니메이션",
    format: "text",
    enabled: !0
  },
  {
    key: "animationType",
    label: "애니메이션 타입",
    format: "text",
    enabled: !0
  },
  {
    key: "isPlaying",
    label: "재생 상태",
    format: "text",
    enabled: !0
  },
  {
    key: "weight",
    label: "가중치",
    format: "number",
    enabled: !0
  },
  {
    key: "speed",
    label: "속도",
    format: "number",
    enabled: !0
  },
  {
    key: "blendDuration",
    label: "블렌드 시간",
    format: "number",
    enabled: !1
  },
  {
    key: "activeActions",
    label: "활성 액션",
    format: "number",
    enabled: !0
  },
  {
    key: "availableAnimations",
    label: "사용 가능 애니메이션",
    format: "array",
    enabled: !1
  },
  {
    key: "frameCount",
    label: "프레임 카운트",
    format: "number",
    enabled: !1
  },
  {
    key: "averageFrameTime",
    label: "평균 프레임 시간",
    format: "number",
    enabled: !1
  }
];
function ya() {
  const { bridge: n, currentType: e } = Rn(), [t, i] = q({
    frameCount: 0,
    averageFrameTime: 0,
    lastUpdateTime: Date.now(),
    currentAnimation: "idle",
    animationType: "character",
    availableAnimations: [],
    isPlaying: !1,
    weight: 1,
    speed: 1,
    blendDuration: 0.3,
    activeActions: 0
  });
  z(() => {
    if (!n) return;
    const o = () => {
      const l = n.snapshot(e);
      if (!l) return;
      const u = n.getMetrics(e);
      i((d) => ({
        ...d,
        currentAnimation: l.currentAnimation,
        animationType: e,
        availableAnimations: l.availableAnimations,
        isPlaying: l.isPlaying,
        weight: l.weight,
        speed: l.speed,
        activeActions: l.metrics.activeAnimations,
        frameCount: u?.totalActions || 0,
        averageFrameTime: u?.mixerTime || 0,
        lastUpdateTime: Date.now()
      }));
    };
    return o(), n.subscribe((l, u) => {
      u === e && o();
    });
  }, [n, e]);
  const s = (o, a, l = 2) => {
    if (o == null) return "N/A";
    switch (a) {
      case "array":
        return Array.isArray(o) ? `${o.length} animations` : String(o);
      case "boolean":
        return o ? "Yes" : "No";
      case "number":
        return typeof o == "number" ? o.toFixed(l) : String(o);
      default:
        return String(o);
    }
  }, r = (o) => t[o];
  return /* @__PURE__ */ c.jsx("div", { className: "ad-panel", children: /* @__PURE__ */ c.jsx("div", { className: "ad-content", children: ga.filter((o) => o.enabled).map((o) => /* @__PURE__ */ c.jsxs("div", { className: "ad-item", children: [
    /* @__PURE__ */ c.jsx("span", { className: "ad-label", children: o.label }),
    /* @__PURE__ */ c.jsx("span", { className: "ad-value", children: s(r(o.key), o.format) })
  ] }, o.key)) }) });
}
function va(n) {
  return { all: n = n || /* @__PURE__ */ new Map(), on: function(e, t) {
    var i = n.get(e);
    i ? i.push(t) : n.set(e, [t]);
  }, off: function(e, t) {
    var i = n.get(e);
    i && (t ? i.splice(i.indexOf(t) >>> 0, 1) : n.set(e, []));
  }, emit: function(e, t) {
    var i = n.get(e);
    i && i.slice().map(function(s) {
      s(t);
    }), (i = n.get("*")) && i.slice().map(function(s) {
      s(e, t);
    });
  } };
}
var ba = Object.defineProperty, xa = Object.getOwnPropertyDescriptor, ji = (n, e, t, i) => {
  for (var s = xa(e, t), r = n.length - 1, o; r >= 0; r--)
    (o = n[r]) && (s = o(e, t, s) || s);
  return s && ba(e, t, s), s;
};
class Nn {
  emitter;
  config;
  metrics = {
    frameCount: 0,
    totalFrameTime: 0,
    lastUpdateTime: 0
  };
  constructor(e) {
    this.emitter = va(), this.config = e;
  }
  updateConfig(e) {
    const t = { ...this.config };
    this.config = { ...this.config, ...e }, Object.keys(e).forEach((i) => {
      this.emitter.emit("configChange", {
        key: i,
        value: e[i]
      });
    }), t.mode !== this.config.mode && this.emitter.emit("modeChange", {
      from: t.mode,
      to: this.config.mode
    });
  }
  getConfig() {
    return { ...this.config };
  }
  getState() {
    return {
      config: this.getConfig(),
      metrics: this.getMetrics()
    };
  }
  getMetrics() {
    return {
      frameCount: this.metrics.frameCount,
      averageFrameTime: this.metrics.frameCount > 0 ? this.metrics.totalFrameTime / this.metrics.frameCount : 0,
      lastUpdateTime: this.metrics.lastUpdateTime
    };
  }
  trackFrameMetrics(e) {
    this.metrics.frameCount++, this.metrics.totalFrameTime += e, this.metrics.lastUpdateTime = Date.now();
  }
  emitError(e, t) {
    this.emitter.emit("error", { message: e, details: t });
  }
  destroy() {
    this.emitter.all.clear();
  }
}
ji([
  G()
], Nn.prototype, "updateConfig");
ji([
  F()
], Nn.prototype, "trackFrameMetrics");
ji([
  G()
], Nn.prototype, "destroy");
const Dt = new b.Vector3(), Jn = new b.Vector3(), wa = new b.Quaternion(), Sa = new b.Matrix4(), os = new b.Quaternion(), Ct = {
  tempVectors: {
    temp1: new b.Vector3(),
    temp2: new b.Vector3(),
    temp3: new b.Vector3()
  },
  clampValue: (n, e, t) => Math.max(e, Math.min(t, n)),
  frameRateIndependentLerpVector3: (n, e, t, i) => {
    const s = 1 - Math.exp(-t * i);
    n.lerp(e, s);
  },
  smoothLookAt: (n, e, t, i) => {
    const s = wa.setFromRotationMatrix(Sa.lookAt(n.position, e, n.up)).normalize();
    os.copy(n.quaternion).normalize(), os.dot(s) < 0 && (s.x *= -1, s.y *= -1, s.z *= -1, s.w *= -1);
    const r = 1 - Math.exp(-t * i);
    n.quaternion.slerp(s, r).normalize();
  },
  preventCameraJitter: (n, e, t, i, s) => {
    Ct.frameRateIndependentLerpVector3(n.position, e, i, s), Ct.smoothLookAt(n, t, i * 0.8, s);
  },
  improvedCollisionCheck: (n, e, t, i = 0.5) => {
    const s = new b.Vector3().subVectors(e, n).normalize(), r = n.distanceTo(e), o = new b.Raycaster(n, s, 0, r), a = [];
    if (t.traverse((d) => {
      if (!(d instanceof b.Mesh) || d.userData.intangible || !d.geometry?.boundingSphere) return;
      const h = o.intersectObject(d, !1)[0];
      h && a.push({
        object: d,
        distance: h.distance,
        point: h.point
      });
    }), a.length === 0)
      return { safe: !0, position: e, obstacles: [] };
    const l = a.reduce(
      (d, f) => f.distance < d.distance ? f : d
    );
    return { safe: !1, position: n.clone().add(s.multiplyScalar(Math.max(0, l.distance - i))), obstacles: a };
  },
  distanceSquared: (n, e) => Dt.subVectors(n, e).lengthSq(),
  safeNormalize: (n) => {
    const e = n.length();
    return e > 0 ? n.divideScalar(e) : n.set(0, 0, 0);
  },
  smoothDamp: (n, e, t, i, s, r) => {
    const o = 2 / i, a = o * s, l = 1 / (1 + a + 0.48 * a * a + 0.235 * a * a * a);
    Dt.subVectors(n, e);
    const u = r ? r * i : 1 / 0;
    Dt.clampLength(0, u), Jn.copy(t).addScaledVector(Dt, o).multiplyScalar(s), t.copy(t).sub(Jn).multiplyScalar(l), n.copy(e).add(Dt.add(Jn).multiplyScalar(l));
  },
  calculateBounds: (n, e, t) => {
    if (!t) return n;
    const i = t.minX !== void 0 ? Math.max(t.minX, n.x) : n.x, s = t.minY !== void 0 ? Math.max(t.minY, n.y) : n.y, r = t.minZ !== void 0 ? Math.max(t.minZ, n.z) : n.z, o = t.maxX !== void 0 ? Math.min(t.maxX, i) : i, a = t.maxY !== void 0 ? Math.min(t.maxY, s) : s, l = t.maxZ !== void 0 ? Math.min(t.maxZ, r) : r;
    return Dt.set(o, a, l);
  },
  fastAtan2: (n, e) => e === 0 ? n > 0 ? Math.PI / 2 : n < 0 ? -Math.PI / 2 : 0 : e > 0 ? Math.atan(n / e) : Math.atan(n / e) + (n >= 0 ? Math.PI : -Math.PI),
  updateFOV: (n, e, t) => {
    const i = t && t > 0 ? b.MathUtils.lerp(n.fov, e, t) : e;
    Math.abs(i - n.fov) < 1e-4 || (n.fov = i, n.updateProjectionMatrix());
  },
  clampPosition: (n, e) => (e && (n.y = Ct.clampValue(
    n.y,
    e.minY || -1 / 0,
    e.maxY || 1 / 0
  )), n),
  isPositionEqual: (n, e, t = 1e-3) => Math.abs(n.x - e.x) < t && Math.abs(n.y - e.y) < t && Math.abs(n.z - e.z) < t,
  pool: {
    vectors: [],
    getVector3: () => Ct.pool.vectors.pop() || new b.Vector3(),
    releaseVector3: (n) => {
      n.set(0, 0, 0), Ct.pool.vectors.push(n);
    }
  },
  calculateSafeDistance: (n, e, t, i) => {
    const s = n.distanceTo(e);
    return b.MathUtils.clamp(s, t, i);
  },
  isPositionValid: (n, e) => e ? n.y >= (e.minY ?? -1 / 0) && n.y <= (e.maxY ?? 1 / 0) : !0
}, Ue = {
  getPosition: (n) => n?.position ? n.position : new b.Vector3(0, 0, 0),
  getEuler: (n) => n?.euler ? n.euler : new b.Euler(0, 0, 0),
  getVelocity: (n) => n?.velocity ? n.velocity : new b.Vector3(0, 0, 0),
  calculateCameraOffset: (n, e, t) => {
    const { xDistance: i = 15, yDistance: s = 8, zDistance: r = 15, euler: o, mode: a = "thirdPerson" } = e, l = t ?? new b.Vector3();
    switch (a) {
      case "chase":
        if (o) {
          const u = 1 / Math.SQRT2;
          return l.set(
            -i * Math.sin(o.y) * u,
            s * u,
            -r * Math.cos(o.y) * u
          );
        }
        return l.set(-i, s, -r);
      case "thirdPerson":
      default:
        return l.set(-i, s, -r);
    }
  },
  getCameraTarget: (n, e) => {
    const t = Ue.getPosition(n);
    return e.target || t;
  }
};
var Ma = Object.defineProperty, Ca = Object.getOwnPropertyDescriptor, Us = (n, e, t, i) => {
  for (var s = Ca(e, t), r = n.length - 1, o; r >= 0; r--)
    (o = n[r]) && (s = o(e, t, s) || s);
  return s && Ma(e, t, s), s;
};
class pt {
  // Scratch objects reused per controller instance (one instance per CameraSystem).
  focusTarget = new b.Vector3();
  focusDirection = new b.Vector3();
  focusTargetPosition = new b.Vector3();
  applyDefaults(e) {
    const t = this.defaultConfig, i = e.config;
    if (t.enableCollision !== void 0 && i.enableCollision === void 0 && (i.enableCollision = t.enableCollision), t.distance) {
      const s = i.distance;
      s ? (s.x === void 0 && t.distance.x !== void 0 && (s.x = t.distance.x), s.y === void 0 && t.distance.y !== void 0 && (s.y = t.distance.y), s.z === void 0 && t.distance.z !== void 0 && (s.z = t.distance.z)) : i.distance = { ...t.distance };
    }
    if (t.smoothing) {
      const s = i.smoothing;
      s ? (s.position === void 0 && t.smoothing.position !== void 0 && (s.position = t.smoothing.position), s.rotation === void 0 && t.smoothing.rotation !== void 0 && (s.rotation = t.smoothing.rotation), s.fov === void 0 && t.smoothing.fov !== void 0 && (s.fov = t.smoothing.fov)) : i.smoothing = { ...t.smoothing };
    }
  }
  calculateLookAt(e, t) {
    return Ue.getPosition(e.activeState);
  }
  update(e, t) {
    const { camera: i, deltaTime: s, activeState: r } = e;
    if (!r) return;
    this.applyDefaults(t);
    const o = t.config;
    let a, l;
    if (o.focus && o.focusTarget) {
      const f = this.focusTarget;
      f.set(
        o.focusTarget.x,
        o.focusTarget.y,
        o.focusTarget.z
      ), l = f;
      const h = o.focusDistance || 10, g = this.focusDirection;
      g.copy(i.position).sub(f), g.lengthSq() === 0 && g.set(1, 1, 1), g.normalize(), a = this.focusTargetPosition.copy(f).addScaledVector(g, h);
    } else
      a = this.calculateTargetPosition(e, t), l = this.calculateLookAt(e, t);
    const u = o.focusLerpSpeed || 10, d = o.focus ? u : 10;
    Ct.preventCameraJitter(
      i,
      a,
      l,
      d,
      s
    ), t.config.fov && i instanceof b.PerspectiveCamera && Ct.updateFOV(i, t.config.fov, t.config.smoothing?.fov);
  }
}
Us([
  F()
], pt.prototype, "calculateLookAt");
Us([
  G(),
  F()
], pt.prototype, "update");
class Pa extends pt {
  name = "thirdPerson";
  target = new b.Vector3();
  offset = new b.Vector3();
  defaultConfig = {
    distance: { x: 15, y: 8, z: 15 },
    smoothing: { position: 0.1, rotation: 0.1, fov: 0.1 },
    enableCollision: !0
  };
  calculateTargetPosition(e, t) {
    const i = Ue.getPosition(e.activeState), s = t.config.zoom || 1;
    return Ue.calculateCameraOffset(i, {
      xDistance: t.config.distance.x * s,
      yDistance: t.config.distance.y * s,
      zDistance: t.config.distance.z * s,
      mode: "thirdPerson"
    }, this.offset), this.target.copy(i).add(this.offset);
  }
}
class ja extends pt {
  name = "firstPerson";
  target = new b.Vector3();
  lookAt = new b.Vector3();
  lookDirection = new b.Vector3();
  defaultConfig = {
    distance: { x: 0, y: 1.7, z: 0 },
    smoothing: { position: 0.2, rotation: 0.15, fov: 0.1 },
    enableCollision: !1
  };
  calculateTargetPosition(e, t) {
    const i = Ue.getPosition(e.activeState);
    return this.target.set(i.x, i.y + 1.7, i.z);
  }
  calculateLookAt(e, t) {
    const i = Ue.getPosition(e.activeState), s = Ue.getEuler(e.activeState), r = this.lookDirection.set(0, 0, -1);
    return s && r.applyEuler(s), this.lookAt.copy(i).add(r);
  }
}
class Ia extends pt {
  name = "chase";
  target = new b.Vector3();
  offset = new b.Vector3();
  defaultConfig = {
    distance: { x: 10, y: 5, z: 10 },
    smoothing: { position: 0.15, rotation: 0.1, fov: 0.1 },
    enableCollision: !0
  };
  calculateTargetPosition(e, t) {
    const i = Ue.getPosition(e.activeState), s = Ue.getEuler(e.activeState), r = t.config.zoom || -1;
    return Ue.calculateCameraOffset(i, {
      xDistance: t.config.distance.x * r,
      yDistance: t.config.distance.y * r,
      zDistance: t.config.distance.z * r,
      euler: s,
      mode: "chase"
    }, this.offset), this.target.copy(i).add(this.offset);
  }
}
class _a extends pt {
  name = "topDown";
  target = new b.Vector3();
  defaultConfig = {
    distance: { x: 0, y: 20, z: 0 },
    smoothing: { position: 0.1, rotation: 0.1, fov: 0.1 },
    enableCollision: !1
  };
  calculateTargetPosition(e, t) {
    const i = Ue.getPosition(e.activeState);
    return this.target.set(i.x, i.y + t.config.distance.y, i.z);
  }
}
class Ta extends pt {
  name = "isometric";
  target = new b.Vector3();
  defaultConfig = {
    distance: { x: 15, y: 15, z: 15 },
    smoothing: { position: 0.1, rotation: 0.1, fov: 0.1 },
    enableCollision: !1
  };
  calculateTargetPosition(e, t) {
    const i = Ue.getPosition(e.activeState), s = Math.PI / 4, r = Math.sqrt(t.config.distance.x ** 2 + t.config.distance.z ** 2);
    return this.target.set(
      i.x + Math.cos(s) * r,
      i.y + t.config.distance.y,
      i.z + Math.sin(s) * r
    );
  }
}
class ka extends pt {
  name = "sideScroll";
  target = new b.Vector3();
  defaultConfig = {
    distance: { x: 0, y: 5, z: 10 },
    smoothing: { position: 0.08, rotation: 0.1, fov: 0.1 },
    enableCollision: !1
  };
  calculateTargetPosition(e, t) {
    const i = Ue.getPosition(e.activeState);
    return this.target.set(
      i.x + t.config.distance.x,
      i.y + t.config.distance.y,
      t.config.distance.z
    );
  }
}
class Aa extends pt {
  name = "fixed";
  defaultPosition = new b.Vector3(0, 10, 10);
  defaultLookAt = new b.Vector3(0, 0, 0);
  defaultConfig = {
    distance: { x: 0, y: 0, z: 0 },
    smoothing: { position: 0, rotation: 0, fov: 0 },
    enableCollision: !1
  };
  calculateTargetPosition(e, t) {
    return t.config.fixedPosition || this.defaultPosition;
  }
  calculateLookAt(e, t) {
    return t.config.fixedLookAt || this.defaultLookAt;
  }
}
var Ra = Object.getOwnPropertyDescriptor, za = (n, e, t, i) => {
  for (var s = i > 1 ? void 0 : i ? Ra(e, t) : e, r = n.length - 1, o; r >= 0; r--)
    (o = n[r]) && (s = o(s) || s);
  return s;
};
let oi = class extends Nn {
  controllers = /* @__PURE__ */ new Map();
  state;
  cameraStates = /* @__PURE__ */ new Map();
  currentCameraStateName = "default";
  cameraTransitions = [];
  constructor(n) {
    super(n), this.state = this.createInitialState(), this.registerControllers(), this.initializeCameraStates();
  }
  createInitialState() {
    return {
      config: {
        mode: "thirdPerson",
        distance: { x: 15, y: 8, z: 15 },
        enableCollision: !0,
        smoothing: { position: 0.1, rotation: 0.1, fov: 0.1 },
        fov: 75,
        zoom: 1
      },
      lastUpdate: Date.now()
    };
  }
  initializeCameraStates() {
    const n = {
      name: "default",
      type: "thirdPerson",
      position: new b.Vector3(0, 5, 10),
      rotation: new b.Euler(0, 0, 0),
      fov: 75,
      config: {
        distance: { x: 15, y: 8, z: 15 },
        height: 5,
        followSpeed: 0.1,
        rotationSpeed: 0.1
      },
      priority: 0,
      tags: []
    };
    this.cameraStates.set("default", n);
  }
  registerController(n) {
    this.controllers.set(n.name, n);
  }
  updateConfig(n) {
    Object.assign(this.state.config, n);
  }
  update(n) {
    this.trackFrameMetrics(n);
  }
  calculate(n) {
    try {
      const e = this.controllers.get(this.state.config.mode);
      if (!e) return;
      this.state.activeController = e, e.update(n, this.state);
    } catch (e) {
      this.emitError("Camera calculation failed", e);
    }
  }
  getCameraState(n) {
    return this.cameraStates.get(n);
  }
  getCurrentCameraState() {
    return this.cameraStates.get(this.currentCameraStateName);
  }
  addCameraState(n, e) {
    this.cameraStates.set(n, e);
  }
  setCameraTransitions(n) {
    this.cameraTransitions = n, this.cameraTransitions.length;
  }
  switchCameraState(n) {
    if (this.cameraStates.has(n)) {
      this.currentCameraStateName = n;
      const e = this.cameraStates.get(n);
      this.state.config.mode = e.type, e.config.distance && (this.state.config.distance = e.config.distance), this.state.config.fov = e.fov;
    }
  }
  registerControllers() {
    this.registerController(new Pa()), this.registerController(new ja()), this.registerController(new Ia()), this.registerController(new _a()), this.registerController(new Ta()), this.registerController(new ka()), this.registerController(new Aa());
  }
};
oi = za([
  Qt({ autoStart: !1 })
], oi);
var $s = Symbol.for("immer-nothing"), as = Symbol.for("immer-draftable"), fe = Symbol.for("immer-state");
function Be(n, ...e) {
  throw new Error(
    `[Immer] minified error nr: ${n}. Full error at: https://bit.ly/3cXEKWf`
  );
}
var Wt = Object.getPrototypeOf;
function Bt(n) {
  return !!n && !!n[fe];
}
function dt(n) {
  return n ? Vs(n) || Array.isArray(n) || !!n[as] || !!n.constructor?.[as] || Ln(n) || Gn(n) : !1;
}
var Da = Object.prototype.constructor.toString();
function Vs(n) {
  if (!n || typeof n != "object")
    return !1;
  const e = Wt(n);
  if (e === null)
    return !0;
  const t = Object.hasOwnProperty.call(e, "constructor") && e.constructor;
  return t === Object ? !0 : typeof t == "function" && Function.toString.call(t) === Da;
}
function on(n, e) {
  On(n) === 0 ? Reflect.ownKeys(n).forEach((t) => {
    e(t, n[t], n);
  }) : n.forEach((t, i) => e(i, t, n));
}
function On(n) {
  const e = n[fe];
  return e ? e.type_ : Array.isArray(n) ? 1 : Ln(n) ? 2 : Gn(n) ? 3 : 0;
}
function ai(n, e) {
  return On(n) === 2 ? n.has(e) : Object.prototype.hasOwnProperty.call(n, e);
}
function Ws(n, e, t) {
  const i = On(n);
  i === 2 ? n.set(e, t) : i === 3 ? n.add(t) : n[e] = t;
}
function Ea(n, e) {
  return n === e ? n !== 0 || 1 / n === 1 / e : n !== n && e !== e;
}
function Ln(n) {
  return n instanceof Map;
}
function Gn(n) {
  return n instanceof Set;
}
function Te(n) {
  return n.copy_ || n.base_;
}
function ci(n, e) {
  if (Ln(n))
    return new Map(n);
  if (Gn(n))
    return new Set(n);
  if (Array.isArray(n))
    return Array.prototype.slice.call(n);
  const t = Vs(n);
  if (e === !0 || e === "class_only" && !t) {
    const i = Object.getOwnPropertyDescriptors(n);
    delete i[fe];
    let s = Reflect.ownKeys(i);
    for (let r = 0; r < s.length; r++) {
      const o = s[r], a = i[o];
      a.writable === !1 && (a.writable = !0, a.configurable = !0), (a.get || a.set) && (i[o] = {
        configurable: !0,
        writable: !0,
        // could live with !!desc.set as well here...
        enumerable: a.enumerable,
        value: n[o]
      });
    }
    return Object.create(Wt(n), i);
  } else {
    const i = Wt(n);
    if (i !== null && t)
      return { ...n };
    const s = Object.create(i);
    return Object.assign(s, n);
  }
}
function Ii(n, e = !1) {
  return Fn(n) || Bt(n) || !dt(n) || (On(n) > 1 && (n.set = n.add = n.clear = n.delete = Na), Object.freeze(n), e && Object.entries(n).forEach(([t, i]) => Ii(i, !0))), n;
}
function Na() {
  Be(2);
}
function Fn(n) {
  return Object.isFrozen(n);
}
var li = {};
function Pt(n) {
  const e = li[n];
  return e || Be(0, n), e;
}
function Oa(n, e) {
  li[n] || (li[n] = e);
}
var an;
function Sn() {
  return an;
}
function La(n, e) {
  return {
    drafts_: [],
    parent_: n,
    immer_: e,
    // Whenever the modified draft contains a draft from another scope, we
    // need to prevent auto-freezing so the unowned draft can be finalized.
    canAutoFreeze_: !0,
    unfinalizedDrafts_: 0
  };
}
function cs(n, e) {
  e && (Pt("Patches"), n.patches_ = [], n.inversePatches_ = [], n.patchListener_ = e);
}
function ui(n) {
  di(n), n.drafts_.forEach(Ga), n.drafts_ = null;
}
function di(n) {
  n === an && (an = n.parent_);
}
function ls(n) {
  return an = La(an, n);
}
function Ga(n) {
  const e = n[fe];
  e.type_ === 0 || e.type_ === 1 ? e.revoke_() : e.revoked_ = !0;
}
function us(n, e) {
  e.unfinalizedDrafts_ = e.drafts_.length;
  const t = e.drafts_[0];
  return n !== void 0 && n !== t ? (t[fe].modified_ && (ui(e), Be(4)), dt(n) && (n = Mn(e, n), e.parent_ || Cn(e, n)), e.patches_ && Pt("Patches").generateReplacementPatches_(
    t[fe].base_,
    n,
    e.patches_,
    e.inversePatches_
  )) : n = Mn(e, t, []), ui(e), e.patches_ && e.patchListener_(e.patches_, e.inversePatches_), n !== $s ? n : void 0;
}
function Mn(n, e, t) {
  if (Fn(e))
    return e;
  const i = e[fe];
  if (!i)
    return on(
      e,
      (s, r) => ds(n, i, e, s, r, t)
    ), e;
  if (i.scope_ !== n)
    return e;
  if (!i.modified_)
    return Cn(n, i.base_, !0), i.base_;
  if (!i.finalized_) {
    i.finalized_ = !0, i.scope_.unfinalizedDrafts_--;
    const s = i.copy_;
    let r = s, o = !1;
    i.type_ === 3 && (r = new Set(s), s.clear(), o = !0), on(
      r,
      (a, l) => ds(n, i, s, a, l, t, o)
    ), Cn(n, s, !1), t && n.patches_ && Pt("Patches").generatePatches_(
      i,
      t,
      n.patches_,
      n.inversePatches_
    );
  }
  return i.copy_;
}
function ds(n, e, t, i, s, r, o) {
  if (Bt(s)) {
    const a = r && e && e.type_ !== 3 && // Set objects are atomic since they have no keys.
    !ai(e.assigned_, i) ? r.concat(i) : void 0, l = Mn(n, s, a);
    if (Ws(t, i, l), Bt(l))
      n.canAutoFreeze_ = !1;
    else
      return;
  } else o && t.add(s);
  if (dt(s) && !Fn(s)) {
    if (!n.immer_.autoFreeze_ && n.unfinalizedDrafts_ < 1)
      return;
    Mn(n, s), (!e || !e.scope_.parent_) && typeof i != "symbol" && Object.prototype.propertyIsEnumerable.call(t, i) && Cn(n, s);
  }
}
function Cn(n, e, t = !1) {
  !n.parent_ && n.immer_.autoFreeze_ && n.canAutoFreeze_ && Ii(e, t);
}
function Fa(n, e) {
  const t = Array.isArray(n), i = {
    type_: t ? 1 : 0,
    // Track which produce call this is associated with.
    scope_: e ? e.scope_ : Sn(),
    // True for both shallow and deep changes.
    modified_: !1,
    // Used during finalization.
    finalized_: !1,
    // Track which properties have been assigned (true) or deleted (false).
    assigned_: {},
    // The parent draft state.
    parent_: e,
    // The base state.
    base_: n,
    // The base proxy.
    draft_: null,
    // set below
    // The base copy with any updated values.
    copy_: null,
    // Called by the `produce` function.
    revoke_: null,
    isManual_: !1
  };
  let s = i, r = _i;
  t && (s = [i], r = cn);
  const { revoke: o, proxy: a } = Proxy.revocable(s, r);
  return i.draft_ = a, i.revoke_ = o, a;
}
var _i = {
  get(n, e) {
    if (e === fe)
      return n;
    const t = Te(n);
    if (!ai(t, e))
      return Ua(n, t, e);
    const i = t[e];
    return n.finalized_ || !dt(i) ? i : i === Zn(n.base_, e) ? (Kn(n), n.copy_[e] = ln(i, n)) : i;
  },
  has(n, e) {
    return e in Te(n);
  },
  ownKeys(n) {
    return Reflect.ownKeys(Te(n));
  },
  set(n, e, t) {
    const i = Bs(Te(n), e);
    if (i?.set)
      return i.set.call(n.draft_, t), !0;
    if (!n.modified_) {
      const s = Zn(Te(n), e), r = s?.[fe];
      if (r && r.base_ === t)
        return n.copy_[e] = t, n.assigned_[e] = !1, !0;
      if (Ea(t, s) && (t !== void 0 || ai(n.base_, e)))
        return !0;
      Kn(n), lt(n);
    }
    return n.copy_[e] === t && // special case: handle new props with value 'undefined'
    (t !== void 0 || e in n.copy_) || // special case: NaN
    Number.isNaN(t) && Number.isNaN(n.copy_[e]) || (n.copy_[e] = t, n.assigned_[e] = !0), !0;
  },
  deleteProperty(n, e) {
    return Zn(n.base_, e) !== void 0 || e in n.base_ ? (n.assigned_[e] = !1, Kn(n), lt(n)) : delete n.assigned_[e], n.copy_ && delete n.copy_[e], !0;
  },
  // Note: We never coerce `desc.value` into an Immer draft, because we can't make
  // the same guarantee in ES5 mode.
  getOwnPropertyDescriptor(n, e) {
    const t = Te(n), i = Reflect.getOwnPropertyDescriptor(t, e);
    return i && {
      writable: !0,
      configurable: n.type_ !== 1 || e !== "length",
      enumerable: i.enumerable,
      value: t[e]
    };
  },
  defineProperty() {
    Be(11);
  },
  getPrototypeOf(n) {
    return Wt(n.base_);
  },
  setPrototypeOf() {
    Be(12);
  }
}, cn = {};
on(_i, (n, e) => {
  cn[n] = function() {
    return arguments[0] = arguments[0][0], e.apply(this, arguments);
  };
});
cn.deleteProperty = function(n, e) {
  return cn.set.call(this, n, e, void 0);
};
cn.set = function(n, e, t) {
  return _i.set.call(this, n[0], e, t, n[0]);
};
function Zn(n, e) {
  const t = n[fe];
  return (t ? Te(t) : n)[e];
}
function Ua(n, e, t) {
  const i = Bs(e, t);
  return i ? "value" in i ? i.value : (
    // This is a very special case, if the prop is a getter defined by the
    // prototype, we should invoke it with the draft as context!
    i.get?.call(n.draft_)
  ) : void 0;
}
function Bs(n, e) {
  if (!(e in n))
    return;
  let t = Wt(n);
  for (; t; ) {
    const i = Object.getOwnPropertyDescriptor(t, e);
    if (i)
      return i;
    t = Wt(t);
  }
}
function lt(n) {
  n.modified_ || (n.modified_ = !0, n.parent_ && lt(n.parent_));
}
function Kn(n) {
  n.copy_ || (n.copy_ = ci(
    n.base_,
    n.scope_.immer_.useStrictShallowCopy_
  ));
}
var $a = class {
  constructor(n) {
    this.autoFreeze_ = !0, this.useStrictShallowCopy_ = !1, this.produce = (e, t, i) => {
      if (typeof e == "function" && typeof t != "function") {
        const r = t;
        t = e;
        const o = this;
        return function(l = r, ...u) {
          return o.produce(l, (d) => t.call(this, d, ...u));
        };
      }
      typeof t != "function" && Be(6), i !== void 0 && typeof i != "function" && Be(7);
      let s;
      if (dt(e)) {
        const r = ls(this), o = ln(e, void 0);
        let a = !0;
        try {
          s = t(o), a = !1;
        } finally {
          a ? ui(r) : di(r);
        }
        return cs(r, i), us(s, r);
      } else if (!e || typeof e != "object") {
        if (s = t(e), s === void 0 && (s = e), s === $s && (s = void 0), this.autoFreeze_ && Ii(s, !0), i) {
          const r = [], o = [];
          Pt("Patches").generateReplacementPatches_(e, s, r, o), i(r, o);
        }
        return s;
      } else
        Be(1, e);
    }, this.produceWithPatches = (e, t) => {
      if (typeof e == "function")
        return (o, ...a) => this.produceWithPatches(o, (l) => e(l, ...a));
      let i, s;
      return [this.produce(e, t, (o, a) => {
        i = o, s = a;
      }), i, s];
    }, typeof n?.autoFreeze == "boolean" && this.setAutoFreeze(n.autoFreeze), typeof n?.useStrictShallowCopy == "boolean" && this.setUseStrictShallowCopy(n.useStrictShallowCopy);
  }
  createDraft(n) {
    dt(n) || Be(8), Bt(n) && (n = Va(n));
    const e = ls(this), t = ln(n, void 0);
    return t[fe].isManual_ = !0, di(e), t;
  }
  finishDraft(n, e) {
    const t = n && n[fe];
    (!t || !t.isManual_) && Be(9);
    const { scope_: i } = t;
    return cs(i, e), us(void 0, i);
  }
  /**
   * Pass true to automatically freeze all copies created by Immer.
   *
   * By default, auto-freezing is enabled.
   */
  setAutoFreeze(n) {
    this.autoFreeze_ = n;
  }
  /**
   * Pass true to enable strict shallow copy.
   *
   * By default, immer does not copy the object descriptors such as getter, setter and non-enumrable properties.
   */
  setUseStrictShallowCopy(n) {
    this.useStrictShallowCopy_ = n;
  }
  applyPatches(n, e) {
    let t;
    for (t = e.length - 1; t >= 0; t--) {
      const s = e[t];
      if (s.path.length === 0 && s.op === "replace") {
        n = s.value;
        break;
      }
    }
    t > -1 && (e = e.slice(t + 1));
    const i = Pt("Patches").applyPatches_;
    return Bt(n) ? i(n, e) : this.produce(
      n,
      (s) => i(s, e)
    );
  }
};
function ln(n, e) {
  const t = Ln(n) ? Pt("MapSet").proxyMap_(n, e) : Gn(n) ? Pt("MapSet").proxySet_(n, e) : Fa(n, e);
  return (e ? e.scope_ : Sn()).drafts_.push(t), t;
}
function Va(n) {
  return Bt(n) || Be(10, n), qs(n);
}
function qs(n) {
  if (!dt(n) || Fn(n))
    return n;
  const e = n[fe];
  let t;
  if (e) {
    if (!e.modified_)
      return e.base_;
    e.finalized_ = !0, t = ci(n, e.scope_.immer_.useStrictShallowCopy_);
  } else
    t = ci(n, !0);
  return on(t, (i, s) => {
    Ws(t, i, qs(s));
  }), e && (e.finalized_ = !1), t;
}
function Hs() {
  class n extends Map {
    constructor(l, u) {
      super(), this[fe] = {
        type_: 2,
        parent_: u,
        scope_: u ? u.scope_ : Sn(),
        modified_: !1,
        finalized_: !1,
        copy_: void 0,
        assigned_: void 0,
        base_: l,
        draft_: this,
        isManual_: !1,
        revoked_: !1
      };
    }
    get size() {
      return Te(this[fe]).size;
    }
    has(l) {
      return Te(this[fe]).has(l);
    }
    set(l, u) {
      const d = this[fe];
      return o(d), (!Te(d).has(l) || Te(d).get(l) !== u) && (t(d), lt(d), d.assigned_.set(l, !0), d.copy_.set(l, u), d.assigned_.set(l, !0)), this;
    }
    delete(l) {
      if (!this.has(l))
        return !1;
      const u = this[fe];
      return o(u), t(u), lt(u), u.base_.has(l) ? u.assigned_.set(l, !1) : u.assigned_.delete(l), u.copy_.delete(l), !0;
    }
    clear() {
      const l = this[fe];
      o(l), Te(l).size && (t(l), lt(l), l.assigned_ = /* @__PURE__ */ new Map(), on(l.base_, (u) => {
        l.assigned_.set(u, !1);
      }), l.copy_.clear());
    }
    forEach(l, u) {
      const d = this[fe];
      Te(d).forEach((f, h, g) => {
        l.call(u, this.get(h), h, this);
      });
    }
    get(l) {
      const u = this[fe];
      o(u);
      const d = Te(u).get(l);
      if (u.finalized_ || !dt(d) || d !== u.base_.get(l))
        return d;
      const f = ln(d, u);
      return t(u), u.copy_.set(l, f), f;
    }
    keys() {
      return Te(this[fe]).keys();
    }
    values() {
      const l = this.keys();
      return {
        [Symbol.iterator]: () => this.values(),
        next: () => {
          const u = l.next();
          return u.done ? u : {
            done: !1,
            value: this.get(u.value)
          };
        }
      };
    }
    entries() {
      const l = this.keys();
      return {
        [Symbol.iterator]: () => this.entries(),
        next: () => {
          const u = l.next();
          if (u.done)
            return u;
          const d = this.get(u.value);
          return {
            done: !1,
            value: [u.value, d]
          };
        }
      };
    }
    [Symbol.iterator]() {
      return this.entries();
    }
  }
  function e(a, l) {
    return new n(a, l);
  }
  function t(a) {
    a.copy_ || (a.assigned_ = /* @__PURE__ */ new Map(), a.copy_ = new Map(a.base_));
  }
  class i extends Set {
    constructor(l, u) {
      super(), this[fe] = {
        type_: 3,
        parent_: u,
        scope_: u ? u.scope_ : Sn(),
        modified_: !1,
        finalized_: !1,
        copy_: void 0,
        base_: l,
        draft_: this,
        drafts_: /* @__PURE__ */ new Map(),
        revoked_: !1,
        isManual_: !1
      };
    }
    get size() {
      return Te(this[fe]).size;
    }
    has(l) {
      const u = this[fe];
      return o(u), u.copy_ ? !!(u.copy_.has(l) || u.drafts_.has(l) && u.copy_.has(u.drafts_.get(l))) : u.base_.has(l);
    }
    add(l) {
      const u = this[fe];
      return o(u), this.has(l) || (r(u), lt(u), u.copy_.add(l)), this;
    }
    delete(l) {
      if (!this.has(l))
        return !1;
      const u = this[fe];
      return o(u), r(u), lt(u), u.copy_.delete(l) || (u.drafts_.has(l) ? u.copy_.delete(u.drafts_.get(l)) : (
        /* istanbul ignore next */
        !1
      ));
    }
    clear() {
      const l = this[fe];
      o(l), Te(l).size && (r(l), lt(l), l.copy_.clear());
    }
    values() {
      const l = this[fe];
      return o(l), r(l), l.copy_.values();
    }
    entries() {
      const l = this[fe];
      return o(l), r(l), l.copy_.entries();
    }
    keys() {
      return this.values();
    }
    [Symbol.iterator]() {
      return this.values();
    }
    forEach(l, u) {
      const d = this.values();
      let f = d.next();
      for (; !f.done; )
        l.call(u, f.value, f.value, this), f = d.next();
    }
  }
  function s(a, l) {
    return new i(a, l);
  }
  function r(a) {
    a.copy_ || (a.copy_ = /* @__PURE__ */ new Set(), a.base_.forEach((l) => {
      if (dt(l)) {
        const u = ln(l, a);
        a.drafts_.set(l, u), a.copy_.add(u);
      } else
        a.copy_.add(l);
    }));
  }
  function o(a) {
    a.revoked_ && Be(3, JSON.stringify(Te(a)));
  }
  Oa("MapSet", { proxyMap_: e, proxySet_: s });
}
var Ve = new $a(), Wa = Ve.produce;
Ve.produceWithPatches.bind(
  Ve
);
Ve.setAutoFreeze.bind(Ve);
Ve.setUseStrictShallowCopy.bind(Ve);
Ve.applyPatches.bind(Ve);
Ve.createDraft.bind(Ve);
Ve.finishDraft.bind(Ve);
const Ba = (n) => (e, t, i) => (i.setState = (s, r, ...o) => {
  const a = typeof s == "function" ? Wa(s) : s;
  return e(a, r, ...o);
}, n(i.setState, t, i)), Qs = Ba, Ae = Object.freeze({
  GRID_CELL_SIZE: 4,
  // 그리드 한 칸 크기
  SNAP_GRID_SIZE: 4,
  // 스냅도 그리드에 맞춤
  TILE_MULTIPLIERS: Object.freeze({
    SMALL: 1,
    // 1x1 (4x4m)
    MEDIUM: 2,
    // 2x2 (8x8m)
    LARGE: 3,
    // 3x3 (12x12m)
    HUGE: 4
    // 4x4 (16x16m)
  }),
  WALL_SIZES: Object.freeze({
    WIDTH: 4,
    // 벽 길이
    HEIGHT: 4,
    // 벽 높이  
    THICKNESS: 0.5,
    // 벽 두께
    MIN_LENGTH: 0.5,
    MAX_LENGTH: 10
  }),
  GRID_DIVISIONS: 25,
  // 100m / 4m = 25 divisions
  DEFAULT_GRID_SIZE: 100
});
Hs();
const hs = (n) => n >= 0 ? n * 2 : -n * 2 - 1, hi = (n, e) => {
  const t = hs(n), i = hs(e), s = t + i;
  return s * (s + 1) / 2 + i;
}, Et = (n, e, t) => {
  const i = e.get(t);
  if (i) {
    for (const s of i) {
      const r = n.get(s);
      r && (r.delete(t), r.size === 0 && n.delete(s));
    }
    e.delete(t);
  }
}, tn = (n, e, t, i, s, r, o, a) => {
  const l = Math.floor(i / a), u = Math.floor(s / a), d = Math.floor(r / a), f = Math.floor(o / a), h = [];
  for (let g = l; g <= u; g++)
    for (let v = d; v <= f; v++) {
      const y = hi(g, v);
      let p = n.get(y);
      p || (p = /* @__PURE__ */ new Set(), n.set(y, p)), p.add(t), h.push(y);
    }
  e.set(t, h);
}, de = ft()(
  Qs((n, e) => ({
    initialized: !1,
    tileIndex: /* @__PURE__ */ new Map(),
    tileCells: /* @__PURE__ */ new Map(),
    tileMeta: /* @__PURE__ */ new Map(),
    wallIndex: /* @__PURE__ */ new Map(),
    wallCells: /* @__PURE__ */ new Map(),
    wallMeta: /* @__PURE__ */ new Map(),
    meshes: /* @__PURE__ */ new Map(),
    wallGroups: /* @__PURE__ */ new Map(),
    tileGroups: /* @__PURE__ */ new Map(),
    wallCategories: /* @__PURE__ */ new Map(),
    tileCategories: /* @__PURE__ */ new Map(),
    editMode: "none",
    showGrid: !0,
    gridSize: 100,
    snapToGrid: !0,
    hoverPosition: null,
    currentTileMultiplier: 1,
    currentWallRotation: 0,
    selectedTileObjectType: "none",
    initializeDefaults: () => n((t) => {
      if (t.initialized) return;
      t.meshes.set("brick-wall", {
        id: "brick-wall",
        color: "#8B4513",
        material: "STANDARD",
        roughness: 0.8
      }), t.meshes.set("glass-wall", {
        id: "glass-wall",
        material: "GLASS",
        opacity: 0.3,
        transparent: !0
      }), t.meshes.set("concrete-wall", {
        id: "concrete-wall",
        color: "#808080",
        material: "STANDARD",
        roughness: 0.9
      }), t.meshes.set("wood-floor", {
        id: "wood-floor",
        color: "#654321",
        material: "STANDARD",
        roughness: 0.6
      }), t.meshes.set("marble-floor", {
        id: "marble-floor",
        color: "#f0f0f0",
        material: "STANDARD",
        roughness: 0.2,
        metalness: 0.1
      }), t.wallCategories.set("interior-walls", {
        id: "interior-walls",
        name: "Interior Walls",
        description: "Walls for interior spaces",
        wallGroupIds: ["plaster-walls", "painted-walls"]
      }), t.wallCategories.set("exterior-walls", {
        id: "exterior-walls",
        name: "Exterior Walls",
        description: "Walls for building exteriors",
        wallGroupIds: ["brick-walls", "concrete-walls"]
      }), t.wallCategories.set("special-walls", {
        id: "special-walls",
        name: "Special Walls",
        description: "Glass and special material walls",
        wallGroupIds: ["glass-walls"]
      }), t.tileCategories.set("wood-floors", {
        id: "wood-floors",
        name: "Wood Floors",
        description: "Various wood flooring options",
        tileGroupIds: ["oak-floor", "pine-floor"]
      }), t.tileCategories.set("stone-floors", {
        id: "stone-floors",
        name: "Stone Floors",
        description: "Marble and stone flooring",
        tileGroupIds: ["marble-floor", "granite-floor"]
      }), t.wallGroups.set("brick-walls", {
        id: "brick-walls",
        name: "Brick Walls",
        frontMeshId: "brick-wall",
        backMeshId: "brick-wall",
        sideMeshId: "brick-wall",
        walls: []
      }), t.wallGroups.set("glass-walls", {
        id: "glass-walls",
        name: "Glass Walls",
        frontMeshId: "glass-wall",
        backMeshId: "glass-wall",
        sideMeshId: "glass-wall",
        walls: []
      }), t.wallGroups.set("concrete-walls", {
        id: "concrete-walls",
        name: "Concrete Walls",
        frontMeshId: "concrete-wall",
        backMeshId: "concrete-wall",
        sideMeshId: "concrete-wall",
        walls: []
      }), t.wallGroups.set("plaster-walls", {
        id: "plaster-walls",
        name: "Plaster Walls",
        frontMeshId: "brick-wall",
        // 임시로 brick 재질 사용
        backMeshId: "brick-wall",
        sideMeshId: "brick-wall",
        walls: []
      }), t.wallGroups.set("painted-walls", {
        id: "painted-walls",
        name: "Painted Walls",
        frontMeshId: "brick-wall",
        // 임시로 brick 재질 사용
        backMeshId: "brick-wall",
        sideMeshId: "brick-wall",
        walls: []
      }), t.tileGroups.set("oak-floor", {
        id: "oak-floor",
        name: "Oak Wood Floor",
        floorMeshId: "wood-floor",
        tiles: []
      }), t.tileGroups.set("pine-floor", {
        id: "pine-floor",
        name: "Pine Wood Floor",
        floorMeshId: "wood-floor",
        tiles: []
      }), t.tileGroups.set("marble-floor", {
        id: "marble-floor",
        name: "Marble Floor",
        floorMeshId: "marble-floor",
        tiles: []
      }), t.tileGroups.set("granite-floor", {
        id: "granite-floor",
        name: "Granite Floor",
        floorMeshId: "marble-floor",
        // 임시로 marble 재질 사용
        tiles: []
      }), t.selectedWallCategoryId = "exterior-walls", t.selectedWallGroupId = "brick-walls", t.selectedTileCategoryId = "wood-floors", t.selectedTileGroupId = "oak-floor";
      const i = t.tileGroups.get("oak-floor");
      if (i) {
        const s = Ae.GRID_CELL_SIZE, r = -5 * s, o = -5 * s;
        for (let a = 0; a < 10; a++)
          for (let l = 0; l < 10; l++) {
            const u = {
              id: `default-tile-${a}-${l}`,
              position: {
                x: r + a * s,
                y: 0,
                z: o + l * s
              },
              tileGroupId: i.id,
              size: 1
            };
            i.tiles.push(u);
            const d = (u.size || 1) * s / 2;
            t.tileMeta.set(u.id, { x: u.position.x, z: u.position.z, halfSize: d }), tn(
              t.tileIndex,
              t.tileCells,
              u.id,
              u.position.x - d,
              u.position.x + d,
              u.position.z - d,
              u.position.z + d,
              s
            );
          }
      }
      t.initialized = !0;
    }),
    addMesh: (t) => n((i) => {
      i.meshes.set(t.id, t);
    }),
    updateMesh: (t, i) => n((s) => {
      const r = s.meshes.get(t);
      r && s.meshes.set(t, { ...r, ...i });
    }),
    removeMesh: (t) => n((i) => {
      i.meshes.delete(t);
    }),
    addWallGroup: (t) => n((i) => {
      i.wallGroups.set(t.id, t);
    }),
    updateWallGroup: (t, i) => n((s) => {
      const r = s.wallGroups.get(t);
      r && s.wallGroups.set(t, { ...r, ...i });
    }),
    removeWallGroup: (t) => n((i) => {
      const s = i.wallGroups.get(t);
      if (s)
        for (const r of s.walls)
          Et(i.wallIndex, i.wallCells, r.id), i.wallMeta.delete(r.id);
      i.wallGroups.delete(t);
    }),
    addWall: (t, i) => n((s) => {
      const r = s.wallGroups.get(t);
      if (r) {
        r.walls.push(i);
        const o = 0.5;
        s.wallMeta.set(i.id, { x: i.position.x, z: i.position.z, rotY: i.rotation.y }), tn(
          s.wallIndex,
          s.wallCells,
          i.id,
          i.position.x - o,
          i.position.x + o,
          i.position.z - o,
          i.position.z + o,
          1
        );
      }
    }),
    updateWall: (t, i, s) => n((r) => {
      const o = r.wallGroups.get(t);
      if (o) {
        const a = o.walls.findIndex((l) => l.id === i);
        if (a !== -1) {
          const l = o.walls[a];
          if (l) {
            const u = s.position !== void 0 || s.rotation !== void 0;
            u && (Et(r.wallIndex, r.wallCells, i), r.wallMeta.delete(i)), Object.assign(l, s), u && (r.wallMeta.set(l.id, { x: l.position.x, z: l.position.z, rotY: l.rotation.y }), tn(
              r.wallIndex,
              r.wallCells,
              l.id,
              l.position.x - 0.5,
              l.position.x + 0.5,
              l.position.z - 0.5,
              l.position.z + 0.5,
              1
            ));
          }
        }
      }
    }),
    removeWall: (t, i) => n((s) => {
      const r = s.wallGroups.get(t);
      r && (Et(s.wallIndex, s.wallCells, i), s.wallMeta.delete(i), r.walls = r.walls.filter((o) => o.id !== i));
    }),
    addTileGroup: (t) => n((i) => {
      i.tileGroups.set(t.id, t);
    }),
    updateTileGroup: (t, i) => n((s) => {
      const r = s.tileGroups.get(t);
      r && s.tileGroups.set(t, { ...r, ...i });
    }),
    removeTileGroup: (t) => n((i) => {
      const s = i.tileGroups.get(t);
      if (s)
        for (const r of s.tiles)
          Et(i.tileIndex, i.tileCells, r.id), i.tileMeta.delete(r.id);
      i.tileGroups.delete(t);
    }),
    addTile: (t, i) => n((s) => {
      const r = s.tileGroups.get(t);
      if (r) {
        const o = {
          ...i,
          objectType: s.selectedTileObjectType,
          ...s.selectedTileObjectType === "grass" ? { objectConfig: { grassDensity: 1e3 } } : {}
        };
        r.tiles.push(o);
        const a = Ae.GRID_CELL_SIZE, l = (o.size || 1) * a / 2;
        s.tileMeta.set(o.id, { x: o.position.x, z: o.position.z, halfSize: l }), tn(
          s.tileIndex,
          s.tileCells,
          o.id,
          o.position.x - l,
          o.position.x + l,
          o.position.z - l,
          o.position.z + l,
          a
        );
      }
    }),
    updateTile: (t, i, s) => n((r) => {
      const o = r.tileGroups.get(t);
      if (o) {
        const a = o.tiles.findIndex((l) => l.id === i);
        if (a !== -1) {
          const l = o.tiles[a];
          if (l) {
            const u = s.position !== void 0 || s.size !== void 0;
            if (u && (Et(r.tileIndex, r.tileCells, i), r.tileMeta.delete(i)), Object.assign(l, s), u) {
              const d = Ae.GRID_CELL_SIZE, f = (l.size || 1) * d / 2;
              r.tileMeta.set(l.id, { x: l.position.x, z: l.position.z, halfSize: f }), tn(
                r.tileIndex,
                r.tileCells,
                l.id,
                l.position.x - f,
                l.position.x + f,
                l.position.z - f,
                l.position.z + f,
                d
              );
            }
          }
        }
      }
    }),
    removeTile: (t, i) => n((s) => {
      const r = s.tileGroups.get(t);
      r && (Et(s.tileIndex, s.tileCells, i), s.tileMeta.delete(i), r.tiles = r.tiles.filter((o) => o.id !== i));
    }),
    setEditMode: (t) => n((i) => {
      i.editMode = t, t !== "none" && (i.showGrid = !0);
    }),
    setShowGrid: (t) => n((i) => {
      i.showGrid = t;
    }),
    setGridSize: (t) => n((i) => {
      i.gridSize = t;
    }),
    setSnapToGrid: (t) => n((i) => {
      i.snapToGrid = t;
    }),
    setHoverPosition: (t) => n((i) => {
      i.hoverPosition = t;
    }),
    setTileMultiplier: (t) => n((i) => {
      i.currentTileMultiplier = t;
    }),
    setWallRotation: (t) => n((i) => {
      i.currentWallRotation = t;
    }),
    snapPosition: (t) => {
      const { snapToGrid: i } = e();
      if (!i) return t;
      const s = Ae.SNAP_GRID_SIZE;
      return {
        x: Math.round(t.x / s) * s,
        y: t.y,
        z: Math.round(t.z / s) * s
      };
    },
    checkTilePosition: (t) => {
      const { tileIndex: i, tileMeta: s, currentTileMultiplier: r } = e(), o = Ae.GRID_CELL_SIZE, a = o * r / 2, l = t.x - a, u = t.x + a, d = t.z - a, f = t.z + a, h = Math.floor(l / o), g = Math.floor(u / o), v = Math.floor(d / o), y = Math.floor(f / o);
      for (let p = h; p <= g; p++)
        for (let m = v; m <= y; m++) {
          const x = hi(p, m), M = i.get(x);
          if (M)
            for (const P of M) {
              const I = s.get(P);
              if (I && Math.abs(I.x - t.x) < a + I.halfSize - 0.1 && Math.abs(I.z - t.z) < a + I.halfSize - 0.1)
                return !0;
            }
        }
      return !1;
    },
    checkWallPosition: (t, i) => {
      const { wallIndex: s, wallMeta: r } = e(), o = 0.5, a = t.x - o, l = t.x + o, u = t.z - o, d = t.z + o, f = Math.floor(a / 1), h = Math.floor(l / 1), g = Math.floor(u / 1), v = Math.floor(d / 1);
      for (let y = f; y <= h; y++)
        for (let p = g; p <= v; p++) {
          const m = hi(y, p), x = s.get(m);
          if (x)
            for (const M of x) {
              const P = r.get(M);
              if (P && Math.abs(P.x - t.x) < o && Math.abs(P.z - t.z) < o && Math.abs(P.rotY - i) < 0.1)
                return !0;
            }
        }
      return !1;
    },
    isInEditMode: () => {
      const { editMode: t } = e();
      return t !== "none";
    },
    addWallCategory: (t) => n((i) => {
      i.wallCategories.set(t.id, t);
    }),
    updateWallCategory: (t, i) => n((s) => {
      const r = s.wallCategories.get(t);
      r && s.wallCategories.set(t, { ...r, ...i });
    }),
    removeWallCategory: (t) => n((i) => {
      i.wallCategories.delete(t);
    }),
    setSelectedWallCategory: (t) => n((i) => {
      i.selectedWallCategoryId = t;
      const s = i.wallCategories.get(t);
      if (s && s.wallGroupIds.length > 0) {
        const r = s.wallGroupIds[0];
        r && (i.selectedWallGroupId = r);
      }
    }),
    addTileCategory: (t) => n((i) => {
      i.tileCategories.set(t.id, t);
    }),
    updateTileCategory: (t, i) => n((s) => {
      const r = s.tileCategories.get(t);
      r && s.tileCategories.set(t, { ...r, ...i });
    }),
    removeTileCategory: (t) => n((i) => {
      i.tileCategories.delete(t);
    }),
    setSelectedTileCategory: (t) => n((i) => {
      i.selectedTileCategoryId = t;
      const s = i.tileCategories.get(t);
      if (s && s.tileGroupIds.length > 0) {
        const r = s.tileGroupIds[0];
        r && (i.selectedTileGroupId = r);
      }
    }),
    setSelectedTileObjectType: (t) => n((i) => {
      i.selectedTileObjectType = t;
    })
  }))
);
let Yn = null;
const fi = /* @__PURE__ */ new Set();
function Js() {
  return Yn || (Yn = new xt()), Yn;
}
const fs = (n) => (fi.add(n), () => {
  fi.delete(n);
}), yn = () => {
  fi.forEach((n) => n());
};
function Xe() {
  const n = C(null);
  n.current || (n.current = Js());
  const e = Ei(
    fs,
    () => n.current.getActiveState(),
    () => n.current.getActiveState()
  ), t = Ei(
    fs,
    () => n.current.getGameStates(),
    () => n.current.getGameStates()
  ), i = _((a) => {
    n.current?.updateActiveState(a), yn();
  }, []), s = _((a) => {
    n.current?.updateGameStates(a), yn();
  }, []), r = _(() => {
    n.current?.resetActiveState(), yn();
  }, []), o = _(() => {
    n.current?.resetGameStates(), yn();
  }, []);
  return z(() => () => {
    n.current = null;
  }, []), {
    activeState: e,
    gameStates: t,
    updateActiveState: i,
    updateGameStates: s,
    resetActiveState: r,
    resetGameStates: o
  };
}
function qa(n, e, t) {
  const i = C(null);
  i.current || (i.current = new n(e));
  const s = i.current;
  Ke((l, u) => {
    s?.update(u);
  }), z(() => {
  }, [t, s]), z(() => () => {
    s?.destroy();
  }, [s]);
  const r = _((l) => {
    s?.updateConfig(l);
  }, [s]), o = _(() => s?.getState(), [s]), a = _(() => s?.getMetrics(), [s]);
  return {
    system: s,
    updateConfig: r,
    getState: o,
    getMetrics: a
  };
}
function Ha() {
  const { gl: n } = un(), { activeState: e } = Xe(), t = Y((v) => v.cameraOption), i = Y((v) => v.setCameraOption), s = Y((v) => v.mode), r = de((v) => v.isInEditMode()), o = C(t);
  z(() => {
    o.current = t;
  }, [t]);
  const a = C(r);
  z(() => {
    a.current = r;
  }, [r]);
  const l = C([]), u = C(null), d = ne(() => ({
    mode: s?.control || "thirdPerson",
    distance: {
      x: t?.xDistance ?? 0,
      y: t?.yDistance ?? 0,
      z: t?.zDistance ?? 0
    },
    smoothing: {
      position: t?.smoothing?.position ?? 0.1,
      rotation: t?.smoothing?.rotation ?? 0.1,
      fov: t?.smoothing?.fov ?? 0.1
    },
    fov: t?.fov ?? 75,
    zoom: t?.zoom ?? 1,
    enableCollision: t?.enableCollision ?? !0,
    ...t?.maxDistance !== void 0 ? { maxDistance: t.maxDistance } : {},
    ...t?.offset ? { offset: { x: t.offset.x, y: t.offset.y, z: t.offset.z } } : {},
    ...t?.target ? { lookAt: { x: t.target.x, y: t.target.y, z: t.target.z } } : {}
  }), []), { system: f, updateConfig: h } = qa(
    oi,
    d
  ), g = _((v) => {
    const y = o.current;
    if (!y?.enableZoom || a.current) return;
    v.preventDefault();
    const p = y.zoomSpeed || 1e-3, m = y.minZoom || 0.1, x = y.maxZoom || 2, M = y.zoom || 1, P = v.deltaY * p, I = Math.min(Math.max(M + P, m), x);
    i({ zoom: I });
  }, [i]);
  return z(() => {
    const v = n.domElement;
    if (t?.enableZoom && !r)
      return v.addEventListener("wheel", g, { passive: !1 }), () => {
        v.removeEventListener("wheel", g);
      };
  }, [n, g, t?.enableZoom, r]), z(() => {
    const v = (y) => {
      const p = o.current;
      y.key === "Escape" && p?.focus && i({ focus: !1 });
    };
    if (t?.enableFocus && !r)
      return window.addEventListener("keydown", v), () => {
        window.removeEventListener("keydown", v);
      };
  }, [t?.enableFocus, r, i]), z(() => {
    h({
      mode: s?.control || "thirdPerson",
      distance: {
        x: t?.xDistance ?? 0,
        y: t?.yDistance ?? 0,
        z: t?.zDistance ?? 0
      },
      smoothing: {
        position: t?.smoothing?.position ?? 0.1,
        rotation: t?.smoothing?.rotation ?? 0.1,
        fov: t?.smoothing?.fov ?? 0.1
      },
      fov: t?.fov ?? 75,
      zoom: t?.zoom ?? 1,
      enableCollision: t?.enableCollision ?? !0,
      ...t?.maxDistance !== void 0 ? { maxDistance: t.maxDistance } : {},
      ...t?.offset ? { offset: { x: t.offset.x, y: t.offset.y, z: t.offset.z } } : {},
      ...t?.target ? { lookAt: { x: t.target.x, y: t.target.y, z: t.target.z } } : {}
    });
  }, [t, s, h]), Ke((v, y) => {
    if (!(!f || r)) {
      if (!u.current)
        u.current = {
          camera: v.camera,
          scene: v.scene,
          deltaTime: y,
          activeState: e,
          clock: v.clock,
          excludeObjects: l.current
        };
      else {
        const p = u.current;
        p.camera = v.camera, p.scene = v.scene, p.deltaTime = y, p.activeState = e, p.clock = v.clock;
      }
      f.calculate(u.current);
    }
  }), {
    system: f
  };
}
function Qa() {
  return Ha(), null;
}
var Ja = Object.defineProperty, Za = Object.getOwnPropertyDescriptor, et = (n, e, t, i) => {
  for (var s = Za(e, t), r = n.length - 1, o; r >= 0; r--)
    (o = n[r]) && (s = o(e, t, s) || s);
  return s && Ja(e, t, s), s;
};
class tt {
  isEnabled = !1;
  positionHistory = [];
  debugInfo = [];
  maxHistoryLength = 100;
  cleanupInterval = null;
  disposables = /* @__PURE__ */ new Set();
  debugLines = [];
  scene = null;
  constructor(e) {
    this.scene = e || null;
  }
  enable(e) {
    this.isEnabled = !0, e && (this.scene = e), this.setupCleanupInterval(), this.setupEventListeners();
  }
  disable() {
    this.isEnabled = !1, this.cleanup();
  }
  setupCleanupInterval() {
    this.cleanupInterval = window.setInterval(() => {
      this.cleanupOldHistory();
    }, 5e3), this.disposables.add(() => {
      this.cleanupInterval && (clearInterval(this.cleanupInterval), this.cleanupInterval = null);
    });
  }
  setupEventListeners() {
    const e = () => this.handleResize();
    window.addEventListener("resize", e), this.disposables.add(() => window.removeEventListener("resize", e));
  }
  handleResize = () => {
    this.clearDebugInfo();
  };
  update(e, t, i) {
    if (!this.isEnabled) return;
    const s = e.position.clone(), r = new b.Vector3();
    e.getWorldDirection(r), r.multiplyScalar(10).add(s), this.addPositionToHistory(s);
    const o = {
      position: s.clone(),
      target: r.clone(),
      distance: s.length(),
      fov: e instanceof b.PerspectiveCamera ? e.fov : 0,
      state: i || "unknown",
      timestamp: Date.now()
    };
    this.addDebugInfo(o), this.updateDebugVisuals(e);
  }
  addPositionToHistory(e) {
    this.positionHistory.push(e.clone()), this.positionHistory.length > this.maxHistoryLength && this.positionHistory.shift();
  }
  addDebugInfo(e) {
    this.debugInfo.push(e), this.debugInfo.length > this.maxHistoryLength && this.debugInfo.shift();
  }
  updateDebugVisuals(e) {
    if (this.scene && (this.clearDebugLines(), this.positionHistory.length > 1)) {
      const t = new b.BufferGeometry(), i = [];
      this.positionHistory.forEach((o) => {
        i.push(o.x, o.y, o.z);
      }), t.setAttribute("position", new b.Float32BufferAttribute(i, 3));
      const s = new b.LineBasicMaterial({
        color: 65280,
        transparent: !0,
        opacity: 0.6
      }), r = new b.Line(t, s);
      this.scene.add(r), this.debugLines.push(r), this.disposables.add(() => {
        t.dispose(), s.dispose(), this.scene && this.scene.remove(r);
      });
    }
  }
  clearDebugLines() {
    this.debugLines.forEach((e) => {
      e.geometry && e.geometry.dispose(), e.material instanceof b.Material && e.material.dispose(), this.scene && this.scene.remove(e);
    }), this.debugLines.length = 0;
  }
  cleanupOldHistory() {
    const e = Date.now(), t = 1e4;
    if (this.debugInfo = this.debugInfo.filter((i) => e - i.timestamp < t), this.positionHistory.length > this.maxHistoryLength * 0.8) {
      const i = Math.floor(this.positionHistory.length * 0.2);
      this.positionHistory.splice(0, i);
    }
  }
  getDebugInfo() {
    return [...this.debugInfo];
  }
  getPositionHistory() {
    return [...this.positionHistory];
  }
  exportData() {
    const e = {
      debugInfo: this.debugInfo,
      positionHistory: this.positionHistory.map((t) => ({ x: t.x, y: t.y, z: t.z })),
      timestamp: Date.now()
    };
    return JSON.stringify(e, null, 2);
  }
  clearDebugInfo() {
    this.debugInfo.length = 0, this.positionHistory.length = 0, this.clearDebugLines();
  }
  cleanup() {
    this.clearDebugInfo(), this.clearDebugLines();
  }
  dispose() {
    this.disable(), this.disposables.forEach((e) => e()), this.disposables.clear(), this.cleanup();
  }
}
et([
  G()
], tt.prototype, "enable");
et([
  G()
], tt.prototype, "disable");
et([
  F()
], tt.prototype, "update");
et([
  F()
], tt.prototype, "updateDebugVisuals");
et([
  G()
], tt.prototype, "clearDebugLines");
et([
  F()
], tt.prototype, "cleanupOldHistory");
et([
  Jt(5)
], tt.prototype, "getDebugInfo");
et([
  Jt(5)
], tt.prototype, "getPositionHistory");
et([
  Jt(10)
], tt.prototype, "exportData");
et([
  G()
], tt.prototype, "clearDebugInfo");
et([
  G()
], tt.prototype, "dispose");
const Ka = [
  { value: "thirdPerson", label: "Third Person" },
  { value: "firstPerson", label: "First Person" },
  { value: "chase", label: "Chase" },
  { value: "topDown", label: "Top Down" },
  { value: "isometric", label: "Isometric" },
  { value: "sideScroll", label: "Side-Scroller" },
  { value: "fixed", label: "Fixed" }
];
function Ya() {
  const { mode: n, setMode: e } = Y(), t = n?.control || "thirdPerson";
  return /* @__PURE__ */ c.jsx("div", { className: "cc-panel", children: /* @__PURE__ */ c.jsx("div", { className: "cc-list", children: Ka.map((i) => /* @__PURE__ */ c.jsx(
    "button",
    {
      className: `cc-button ${t === i.value ? "active" : ""}`,
      onClick: () => e({ control: i.value }),
      children: i.label
    },
    i.value
  )) }) });
}
const Xa = [
  { key: "mode", label: "Mode", enabled: !0, format: "text" },
  { key: "position", label: "Position", enabled: !0, format: "vector3", precision: 2 },
  { key: "distance", label: "Distance", enabled: !0, format: "vector3", precision: 2 },
  { key: "fov", label: "FOV", enabled: !0, format: "angle", precision: 1 },
  { key: "velocity", label: "Velocity", enabled: !1, format: "vector3", precision: 2 },
  { key: "rotation", label: "Rotation", enabled: !1, format: "vector3", precision: 2 },
  { key: "zoom", label: "Zoom", enabled: !1, format: "number", precision: 2 },
  { key: "activeController", label: "Controller", enabled: !0, format: "text" }
];
function Xn(n) {
  if (typeof n != "object" || n === null) return !1;
  const e = n;
  return typeof e.x == "number" && typeof e.y == "number" && typeof e.z == "number";
}
function ec() {
  const n = {
    frameCount: 0,
    averageFrameTime: 0,
    lastUpdateTime: Date.now(),
    mode: "unknown",
    activeController: "unknown",
    distance: null,
    fov: 0,
    position: null,
    targetPosition: null,
    velocity: null,
    rotation: null
  }, [e, t] = q(n), i = Y((f) => f.mode), s = Y((f) => f.cameraOption), { activeState: r } = Xe(), o = C(n), a = _((f, h) => f === h ? !1 : Xn(f) ? Xn(h) ? f.x !== h.x || f.y !== h.y || f.z !== h.z : !0 : typeof f != "object" || f === null ? !0 : JSON.stringify(f) !== JSON.stringify(h), []), l = _((f) => Xn(f) ? { x: f.x, y: f.y, z: f.z } : null, []), u = _(() => {
    const f = s?.xDistance !== void 0 && s?.yDistance !== void 0 && s?.zDistance !== void 0 ? {
      x: s.xDistance,
      y: s.yDistance,
      z: s.zDistance
    } : null, h = {
      ...o.current,
      mode: i?.control ?? "unknown",
      activeController: s?.mode ?? i?.control ?? "unknown",
      distance: f,
      fov: s?.fov ?? 0,
      position: l(r?.position),
      targetPosition: l(s?.target),
      velocity: l(r?.velocity),
      rotation: l(r?.euler),
      lastUpdateTime: Date.now(),
      ...s?.zoom !== void 0 ? { zoom: s.zoom } : {}
    };
    Object.keys(h).some(
      (v) => a(
        h[v],
        o.current[v]
      )
    ) && (o.current = h, t(h));
  }, [i, s, r, a, l]);
  z(() => {
    u();
    const f = setInterval(u, 100);
    return () => {
      clearInterval(f);
    };
  }, [u]);
  const d = _((f, h = 2) => f == null ? "N/A" : typeof f == "object" && f.x !== void 0 ? `X:${f.x.toFixed(h)} Y:${f.y.toFixed(h)} Z:${f.z.toFixed(h)}` : typeof f == "number" ? f.toFixed(h) : f.toString(), []);
  return /* @__PURE__ */ c.jsx("div", { className: "cd-panel", children: /* @__PURE__ */ c.jsx("div", { className: "cd-grid", children: Xa.map((f) => /* @__PURE__ */ c.jsxs("div", { className: "cd-item", children: [
    /* @__PURE__ */ c.jsx("span", { className: "cd-label", children: f.label }),
    /* @__PURE__ */ c.jsx("span", { className: "cd-value", children: d(e[f.key]) })
  ] }, f.key)) }) });
}
const tc = [
  {
    id: "classic",
    name: "Classic",
    description: "A traditional third-person view.",
    icon: "camera",
    config: {
      mode: "thirdPerson",
      distance: { x: 0, y: 8, z: 10 },
      fov: 75,
      smoothing: { position: 0.1, rotation: 0.1, fov: 0.1 }
    }
  },
  {
    id: "cinematic",
    name: "Cinematic",
    description: "Smooth, movie-like camera work.",
    icon: "camera",
    config: {
      mode: "chase",
      distance: { x: 2, y: 7, z: 8 },
      fov: 60,
      smoothing: { position: 0.05, rotation: 0.05, fov: 0.05 }
    }
  },
  {
    id: "action",
    name: "Action",
    description: "Responsive camera for fast gameplay.",
    icon: "camera",
    config: {
      mode: "thirdPerson",
      distance: { x: 0, y: 6, z: 6 },
      fov: 85,
      smoothing: { position: 0.2, rotation: 0.2, fov: 0.2 }
    }
  },
  {
    id: "strategy",
    name: "Strategy",
    description: "Top-down view for an overview.",
    icon: "camera",
    config: {
      mode: "topDown",
      distance: { x: 0, y: 20, z: 0 },
      fov: 45,
      smoothing: { position: 0.1, rotation: 0.1, fov: 0.1 }
    }
  },
  {
    id: "retro",
    name: "Retro",
    description: "Classic side-scroller style.",
    icon: "camera",
    config: {
      mode: "sideScroll",
      distance: { x: 15, y: 0, z: 0 },
      fov: 75,
      smoothing: { position: 0.15, rotation: 0.15, fov: 0.15 }
    }
  }
];
function nc(n, e) {
  return !n || !e ? !1 : n.x === e.x && n.y === e.y && n.z === e.z;
}
function ic(n) {
  const e = n?.xDistance, t = n?.yDistance, i = n?.zDistance;
  if (!(e === void 0 || t === void 0 || i === void 0))
    return { x: e, y: t, z: i };
}
function sc() {
  const [n] = q(tc), e = Y((l) => l.setMode), t = Y((l) => l.setCameraOption), i = Y((l) => l.mode), s = Y((l) => l.cameraOption), [r, o] = q(null), a = _((l) => {
    e({ control: l.config.mode }), t({
      xDistance: l.config.distance.x,
      yDistance: l.config.distance.y,
      zDistance: l.config.distance.z,
      fov: l.config.fov,
      smoothing: l.config.smoothing || { position: 0.1, rotation: 0.1, fov: 0.1 }
    });
  }, [e, t, s]);
  return z(() => {
    const l = n.find(
      (u) => u.config.mode === i?.control && nc(u.config.distance, ic(s))
    );
    o(l ? l.id : null);
  }, [i, s, n]), /* @__PURE__ */ c.jsx("div", { className: "cp-panel", children: /* @__PURE__ */ c.jsx("div", { className: "cp-grid", children: n.map((l) => /* @__PURE__ */ c.jsxs(
    "button",
    {
      className: `cp-item ${r === l.id ? "active" : ""}`,
      onClick: () => a(l),
      children: [
        /* @__PURE__ */ c.jsx("div", { className: "cp-name", children: l.name }),
        /* @__PURE__ */ c.jsx("div", { className: "cp-description", children: l.description })
      ]
    },
    l.id
  )) }) });
}
var rc = Object.defineProperty, oc = Object.getOwnPropertyDescriptor, It = (n, e, t, i) => {
  for (var s = i > 1 ? void 0 : i ? oc(e, t) : e, r = n.length - 1, o; r >= 0; r--)
    (o = n[r]) && (s = (i ? o(e, t, s) : o(s)) || s);
  return i && s && rc(e, t, s), s;
};
let ht = class extends qe {
  config;
  executionTimer;
  eventCallbacks;
  constructor() {
    super(
      {
        isActive: !1,
        queue: { actions: [], currentIndex: 0, isRunning: !1, isPaused: !1, loop: !1, maxRetries: 3 },
        currentAction: null,
        executionStats: { totalExecuted: 0, successRate: 100, averageTime: 0, errors: [] },
        settings: { throttle: 100, autoStart: !1, trackProgress: !0, showVisualCues: !0 },
        lastUpdate: Date.now()
      },
      {
        queueLength: 0,
        executionTime: 0,
        performance: 100,
        memoryUsage: 0,
        errorRate: 0,
        frameTime: 0
      }
    ), this.config = this.createDefaultConfig(), this.executionTimer = null, this.eventCallbacks = /* @__PURE__ */ new Map();
  }
  performUpdate(n) {
  }
  createDefaultConfig() {
    return {
      maxConcurrentActions: 1,
      defaultDelay: 100,
      retryDelay: 1e3,
      timeoutDuration: 5e3,
      enableLogging: !0,
      visualCues: {
        showPath: !0,
        showTargets: !0,
        lineColor: "#00ff00",
        targetColor: "#ff0000"
      }
    };
  }
  getConfig() {
    return { ...this.config };
  }
  addAction(n) {
    const e = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, t = {
      ...n,
      id: e,
      timestamp: Date.now()
    };
    return this.state.queue.actions.push(t), this.updateMetrics(0), this.emit("actionAdded", t), this.state.settings.autoStart && !this.state.queue.isRunning && this.start(), e;
  }
  removeAction(n) {
    const e = this.state.queue.actions.findIndex((t) => t.id === n);
    return e > -1 ? (this.state.queue.actions.splice(e, 1), this.updateMetrics(0), this.emit("actionRemoved", n), !0) : !1;
  }
  clearQueue() {
    this.state.queue.actions = [], this.state.queue.currentIndex = 0, this.updateMetrics(0), this.emit("queueCleared");
  }
  async start() {
    this.state.queue.actions.length !== 0 && (this.state.queue.isRunning = !0, this.state.queue.isPaused = !1, this.emit("automationStarted"), await this.executeNext());
  }
  pause() {
    this.state.queue.isPaused = !0, this.executionTimer && (clearTimeout(this.executionTimer), this.executionTimer = null), this.emit("automationPaused");
  }
  resume() {
    this.state.queue.isPaused && (this.state.queue.isPaused = !1, this.emit("automationResumed"), this.executeNext());
  }
  stop() {
    this.state.queue.isRunning = !1, this.state.queue.isPaused = !1, this.state.currentAction = null, this.executionTimer && (clearTimeout(this.executionTimer), this.executionTimer = null), this.emit("automationStopped");
  }
  async executeNext() {
    if (!this.state.queue.isRunning || this.state.queue.isPaused) return;
    if (this.state.queue.currentIndex >= this.state.queue.actions.length)
      if (this.state.queue.loop)
        this.state.queue.currentIndex = 0;
      else {
        this.stop(), this.emit("automationCompleted");
        return;
      }
    const n = this.state.queue.actions[this.state.queue.currentIndex];
    if (n) {
      this.state.currentAction = n, this.emit("actionStarted", n);
      try {
        await this.executeAction(n), this.state.executionStats.totalExecuted++, this.state.queue.currentIndex++, this.emit("actionCompleted", n);
        const e = n.delay || this.state.settings.throttle;
        this.executionTimer = window.setTimeout(() => this.executeNext(), e);
      } catch (e) {
        this.handleExecutionError(n, e);
      }
    }
  }
  async executeAction(n) {
    n.beforeCallback && n.beforeCallback();
    const e = Date.now();
    switch (n.type) {
      case "move":
        n.target && this.emit("moveRequested", n.target);
        break;
      case "click":
        n.target && this.emit("clickRequested", n.target);
        break;
      case "wait":
        await new Promise((i) => setTimeout(i, n.duration || 1e3));
        break;
      case "key":
        n.key && this.emit("keyRequested", n.key);
        break;
      case "custom":
        this.emit("customActionRequested", n.data);
        break;
    }
    const t = Date.now() - e;
    this.updateExecutionStats(t), n.afterCallback && n.afterCallback();
  }
  handleExecutionError(n, e) {
    this.state.executionStats.errors.push(`${n.id}: ${e.message}`), this.emit("actionError", { action: n, error: e });
    const t = n.data?.retryCount ?? 0;
    t < this.state.queue.maxRetries ? (n.data = { ...n.data, retryCount: t + 1 }, this.executionTimer = window.setTimeout(() => this.executeNext(), this.config.retryDelay)) : (this.state.queue.currentIndex++, this.executionTimer = window.setTimeout(() => this.executeNext(), this.state.settings.throttle));
  }
  updateExecutionStats(n) {
    const e = this.state.executionStats;
    e.averageTime = (e.averageTime * e.totalExecuted + n) / (e.totalExecuted + 1);
  }
  updateMetrics(n) {
    super.updateMetrics(n), this.metrics.queueLength = this.state.queue.actions.length, this.metrics.errorRate = this.state.executionStats.errors.length / Math.max(this.state.executionStats.totalExecuted, 1) * 100;
  }
  emit(n, e) {
    const t = this.eventCallbacks.get(n);
    t && t.forEach((i) => i(e));
  }
  addEventListener(n, e) {
    this.eventCallbacks.has(n) || this.eventCallbacks.set(n, []), this.eventCallbacks.get(n).push(e);
  }
  removeEventListener(n, e) {
    const t = this.eventCallbacks.get(n);
    if (t) {
      const i = t.indexOf(e);
      i > -1 && t.splice(i, 1);
    }
  }
  updateSettings(n) {
    Object.assign(this.state.settings, n);
  }
  onReset() {
    this.stop(), this.clearQueue(), super.onReset();
  }
  onDispose() {
    this.stop(), this.eventCallbacks.clear(), super.onDispose();
  }
};
It([
  G(),
  F()
], ht.prototype, "addAction", 1);
It([
  G()
], ht.prototype, "removeAction", 1);
It([
  G()
], ht.prototype, "clearQueue", 1);
It([
  G(),
  F()
], ht.prototype, "start", 1);
It([
  G(),
  F()
], ht.prototype, "executeNext", 1);
It([
  G(),
  F()
], ht.prototype, "executeAction", 1);
ht = It([
  An("automation"),
  Qt({ autoStart: !1 })
], ht);
var ac = Object.defineProperty, cc = Object.getOwnPropertyDescriptor, nt = (n, e, t, i) => {
  for (var s = cc(e, t), r = n.length - 1, o; r >= 0; r--)
    (o = n[r]) && (s = o(e, t, s) || s);
  return s && ac(e, t, s), s;
};
const He = class Mt {
  static globalInstance = null;
  static getGlobal() {
    return Mt.globalInstance || (Mt.globalInstance = new Mt()), Mt.globalInstance;
  }
  static disposeGlobal() {
    Mt.globalInstance?.dispose(), Mt.globalInstance = null;
  }
  interactionSystem;
  automationSystem;
  state;
  eventSubscribers;
  eventQueue;
  syncTimer;
  visibilityCleanup;
  MAX_COMMAND_HISTORY = 1e3;
  MAX_EVENT_QUEUE = 500;
  SYNC_DELAY_MS = 16;
  engineListenerCleanups = [];
  eventListeners;
  interactables;
  hoveredInteractableIds;
  constructor() {
    this.interactionSystem = Fe.getInstance(), this.automationSystem = new ht(), this.state = {
      isActive: !0,
      lastCommand: null,
      commandHistory: [],
      syncStatus: "idle"
    }, this.eventSubscribers = /* @__PURE__ */ new Map(), this.eventQueue = [], this.syncTimer = null, this.visibilityCleanup = null, this.eventListeners = /* @__PURE__ */ new Set(), this.interactables = /* @__PURE__ */ new Map(), this.hoveredInteractableIds = /* @__PURE__ */ new Set(), this.setupEngineListeners(), this.setupVisibilityListener();
  }
  setupEngineListeners() {
    const e = (s) => {
      if (!(s instanceof b.Vector3)) return;
      const r = s;
      this.executeCommand({
        type: "input",
        action: "moveTo",
        data: { target: r }
      });
    }, t = (s) => {
      if (!(s instanceof b.Vector3)) return;
      const r = s;
      this.executeCommand({
        type: "input",
        action: "clickAt",
        data: { target: r }
      });
    }, i = (s) => {
      if (typeof s != "string") return;
      const r = s;
      this.executeCommand({
        type: "input",
        action: "keyPress",
        data: { key: r }
      });
    };
    this.automationSystem.addEventListener("moveRequested", e), this.automationSystem.addEventListener("clickRequested", t), this.automationSystem.addEventListener("keyRequested", i), this.engineListenerCleanups.push(
      () => this.automationSystem.removeEventListener("moveRequested", e),
      () => this.automationSystem.removeEventListener("clickRequested", t),
      () => this.automationSystem.removeEventListener("keyRequested", i)
    );
  }
  executeCommand(e) {
    if (!e || typeof e != "object") {
      Ce.warn(`[${this.constructor.name}] Invalid command passed to executeCommand`);
      return;
    }
    if (!e.type || !e.action) {
      Ce.warn(`[${this.constructor.name}] Command missing required fields: type or action`);
      return;
    }
    const t = {
      ...e,
      timestamp: Date.now()
    };
    switch (this.state.lastCommand = t, this.state.commandHistory.push(t), this.state.commandHistory.length > this.MAX_COMMAND_HISTORY && (this.state.commandHistory = this.state.commandHistory.slice(-this.MAX_COMMAND_HISTORY)), this.emitEvent({
      type: t.type,
      event: "commandExecuted",
      data: t,
      timestamp: Date.now()
    }), e.type) {
      case "input":
        this.handleInputCommand(t);
        break;
      case "automation":
        this.handleAutomationCommand(t);
        break;
    }
  }
  handleInputCommand(e) {
    const { action: t, data: i } = e;
    switch (t) {
      case "updateKeyboard":
        this.interactionSystem.updateKeyboard(i), this.notifyListeners();
        break;
      case "updateMouse":
        this.interactionSystem.updateMouse(i), this.notifyListeners();
        break;
      case "updateGamepad":
        this.interactionSystem.updateGamepad(i);
        break;
      case "updateTouch":
        this.interactionSystem.updateTouch(i);
        break;
      case "setConfig":
        this.interactionSystem.setConfig(i);
        break;
      case "moveTo":
        this.emitEvent({
          type: "input",
          event: "moveToRequested",
          data: i,
          timestamp: Date.now()
        });
        break;
      case "clickAt":
        this.emitEvent({
          type: "input",
          event: "clickAtRequested",
          data: i,
          timestamp: Date.now()
        });
        break;
      case "keyPress":
        this.emitEvent({
          type: "input",
          event: "keyPressRequested",
          data: i,
          timestamp: Date.now()
        });
        break;
    }
  }
  handleAutomationCommand(e) {
    const { action: t, data: i } = e;
    switch (t) {
      case "addAction":
        this.automationSystem.addAction(i);
        break;
      case "removeAction":
        this.automationSystem.removeAction(i);
        break;
      case "start":
        this.automationSystem.start();
        break;
      case "pause":
        this.automationSystem.pause();
        break;
      case "resume":
        this.automationSystem.resume();
        break;
      case "stop":
        this.automationSystem.stop();
        break;
      case "clearQueue":
        this.automationSystem.clearQueue();
        break;
      case "updateSettings":
        this.automationSystem.updateSettings(i);
        break;
    }
  }
  snapshot() {
    const e = this.interactionSystem.getState(), t = this.interactionSystem.getConfig(), i = this.interactionSystem.getMetrics(), s = this.automationSystem.getState(), r = this.automationSystem.getConfig(), o = this.automationSystem.getMetrics();
    return {
      interaction: {
        state: e,
        config: t,
        metrics: i
      },
      automation: {
        state: s,
        config: r,
        metrics: o
      },
      bridge: this.state
    };
  }
  subscribe(e, t) {
    if (typeof e == "string") {
      const s = e, r = t;
      if (typeof r != "function") return () => {
      };
      const o = this.eventSubscribers.get(s) ?? [];
      return o.push(r), this.eventSubscribers.set(s, o), this.scheduleSync(), () => this.unsubscribe(s, r);
    }
    const i = e;
    return this.eventListeners.add(i), () => this.eventListeners.delete(i);
  }
  unsubscribe(e, t) {
    const i = this.eventSubscribers.get(e);
    if (!i) return;
    const s = i.indexOf(t);
    s !== -1 && (i.splice(s, 1), i.length === 0 ? this.eventSubscribers.delete(e) : this.eventSubscribers.set(e, i), this.eventSubscribers.size === 0 && this.cancelSync());
  }
  notifyListeners() {
    const e = this.interactionSystem.getKeyboardRef(), t = this.interactionSystem.getMouseRef();
    this.eventListeners.forEach((i) => i({ keyboard: e, mouse: t }));
  }
  registerInteractable(e) {
    e?.id && this.interactables.set(e.id, e);
  }
  unregisterInteractable(e) {
    e && (this.interactables.delete(e), this.hoveredInteractableIds.delete(e));
  }
  getInteractable(e) {
    return this.interactables.get(e);
  }
  updateHoveredObjects(e) {
    const t = /* @__PURE__ */ new Set();
    for (const i of e) {
      const s = i?.object?.userData?.id;
      typeof s == "string" && t.add(s);
    }
    for (const i of this.hoveredInteractableIds) {
      if (t.has(i)) continue;
      const s = this.interactables.get(i);
      !s || s.active === !1 || s.onPointerOut?.();
    }
    for (const i of t) {
      if (this.hoveredInteractableIds.has(i)) continue;
      const s = this.interactables.get(i);
      !s || s.active === !1 || s.onPointerOver?.();
    }
    this.hoveredInteractableIds = t;
  }
  handleClick(e) {
    const t = e?.object?.userData?.id;
    if (typeof t != "string") return;
    const i = this.interactables.get(t);
    !i || i.active === !1 || i.onClick?.();
  }
  emitEvent(e) {
    this.eventSubscribers.size !== 0 && (this.eventQueue.push(e), this.eventQueue.length > this.MAX_EVENT_QUEUE && (this.eventQueue = this.eventQueue.slice(-this.MAX_EVENT_QUEUE)), this.scheduleSync());
  }
  dispatchEvent(e) {
    const t = [e.event, e.type, "*"];
    for (const i of t) {
      const s = this.eventSubscribers.get(i);
      !s || s.length === 0 || s.forEach((r) => {
        try {
          r(e);
        } catch (o) {
          console.error("Event callback error:", o);
        }
      });
    }
  }
  setupVisibilityListener() {
    if (typeof document > "u" || typeof document.addEventListener != "function") return;
    const e = () => {
      if (document.hidden) {
        this.cancelSync();
        return;
      }
      this.eventQueue.length > 0 && this.scheduleSync();
    };
    document.addEventListener("visibilitychange", e), this.visibilityCleanup = () => document.removeEventListener("visibilitychange", e);
  }
  cancelSync() {
    this.syncTimer !== null && (clearTimeout(this.syncTimer), this.syncTimer = null);
  }
  scheduleSync() {
    this.syncTimer === null && (typeof document < "u" && document.hidden || this.eventSubscribers.size !== 0 && (this.syncTimer = window.setTimeout(() => {
      this.syncTimer = null, this.state.syncStatus = "syncing";
      try {
        this.processEventQueue(), this.updateMetrics();
      } catch (e) {
        this.state.syncStatus = "error", console.error("Sync error:", e);
      }
      this.state.syncStatus = "idle", this.eventQueue.length > 0 && this.eventSubscribers.size > 0 && this.scheduleSync();
    }, this.SYNC_DELAY_MS)));
  }
  processEventQueue() {
    const t = this.eventQueue.splice(0, 10);
    for (const i of t)
      this.dispatchEvent(i);
    t.length > 0 && this.dispatchEvent({
      type: "sync",
      event: "batchProcessed",
      data: { count: t.length },
      timestamp: Date.now()
    });
  }
  updateMetrics() {
    const e = this.interactionSystem.getMetrics(), t = this.automationSystem.getMetrics();
    this.dispatchEvent({
      type: "sync",
      event: "metricsUpdated",
      data: {
        interaction: e,
        automation: t
      },
      timestamp: Date.now()
    });
  }
  getInteractionSystem() {
    return this.interactionSystem;
  }
  getAutomationSystem() {
    return this.automationSystem;
  }
  reset() {
    this.interactionSystem.reset(), this.automationSystem.reset(), this.state.commandHistory = [], this.state.lastCommand = null, this.eventQueue = [], this.notifyListeners();
  }
  dispose() {
    this.cancelSync(), this.visibilityCleanup?.(), this.visibilityCleanup = null, this.engineListenerCleanups.forEach((e) => e()), this.engineListenerCleanups = [], this.interactionSystem.dispose(), this.automationSystem.dispose(), this.eventSubscribers.clear(), this.eventQueue = [], this.state.commandHistory = [], this.eventListeners.clear(), this.interactables.clear(), this.hoveredInteractableIds.clear();
  }
  cleanup() {
    this.dispose();
  }
  getKeyboardState() {
    return this.interactionSystem.getKeyboardRef();
  }
  getMouseState() {
    return this.interactionSystem.getMouseRef();
  }
};
nt([
  G(),
  F()
], He.prototype, "executeCommand");
nt([
  G()
], He.prototype, "handleInputCommand");
nt([
  G()
], He.prototype, "handleAutomationCommand");
nt([
  bt()
], He.prototype, "snapshot");
nt([
  F()
], He.prototype, "notifyListeners");
nt([
  G()
], He.prototype, "emitEvent");
nt([
  G()
], He.prototype, "setupVisibilityListener");
nt([
  F()
], He.prototype, "processEventQueue");
nt([
  F()
], He.prototype, "updateMetrics");
nt([
  G()
], He.prototype, "reset");
nt([
  G()
], He.prototype, "dispose");
let Pn = He;
function Zs() {
  const n = C(null), [e, t] = q(() => {
    const o = Pn.getGlobal();
    return {
      keyboard: o.getKeyboardState(),
      mouse: o.getMouseState()
    };
  });
  n.current || (n.current = Pn.getGlobal()), z(() => n.current.subscribe((l) => {
    t(l);
  }), []);
  const i = _((o) => {
    n.current?.executeCommand({
      type: "input",
      action: "updateKeyboard",
      data: o
    });
  }, []), s = _((o) => {
    n.current?.executeCommand({
      type: "input",
      action: "updateMouse",
      data: o
    });
  }, []), r = _((o) => {
    n.current?.executeCommand({
      type: "input",
      action: "updateMouse",
      data: o
    });
  }, []);
  return {
    keyboard: e.keyboard,
    mouse: e.mouse,
    updateKeyboard: i,
    updateMouse: s,
    dispatchInput: r
  };
}
function Ks(n) {
  const { playAnimation: e, currentType: t, currentAnimation: i } = Rn(), { keyboard: s, mouse: r } = Zs(), o = Y((f) => f.automation), { gameStates: a } = Xe(), l = ne(() => {
    const f = s?.forward || s?.backward || s?.leftward || s?.rightward, h = r?.isActive || !1;
    return {
      isMoving: f || h,
      isRunning: s?.shift && f || r?.shouldRun && h && o?.queue.isRunning
    };
  }, [s.forward, s.backward, s.leftward, s.rightward, s.shift, r.isActive, r.shouldRun, o]), u = ne(() => a?.isJumping ? "jump" : a?.isFalling ? "fall" : a?.isRiding ? "ride" : l.isRunning ? "run" : l.isMoving ? "walk" : "idle", [a.isJumping, a.isFalling, a.isRiding, l.isRunning, l.isMoving]), d = ne(() => ["idle", "walk", "run", "jump", "fall", "ride", "land"], []);
  z(() => {
    if (!n) return;
    u !== "idle" ? u !== i && e(t, u) : d.includes(i) && i !== "idle" && e(t, "idle");
  }, [n, u, i, e, t, d]);
}
function Ys(n = {}) {
  const { minHeight: e = 0.5, offsetY: t = 0.5 } = n, { activeState: i } = Xe(), s = Pn.getGlobal(), r = !!i?.position, o = (u, d, f) => {
    if (f !== "ground" || !i?.position)
      return !1;
    try {
      const h = i.position, g = Ut(u.point.x, u.point.y, u.point.z), v = Math.atan2(
        g.z - h.z,
        g.x - h.x
      ), y = Math.max(g.y + t, e), p = Ut(g.x, y, g.z);
      return s.executeCommand({
        type: "input",
        action: "updateMouse",
        data: {
          target: p,
          angle: v,
          position: new b.Vector2(p.x, p.z),
          isActive: !0,
          shouldRun: d
        }
      }), !0;
    } catch (h) {
      return console.error("moveClicker error:", h), !1;
    }
  };
  return {
    moveClicker: o,
    stopClicker: () => {
      try {
        if (!r) return;
        s.executeCommand({
          type: "input",
          action: "updateMouse",
          data: { isActive: !1, shouldRun: !1 }
        });
      } catch {
      }
    },
    onClick: (u) => {
      o(u, !1, "ground");
    },
    isReady: r
  };
}
function gu() {
  const { activeState: n, gameStates: e } = Xe(), t = Y((s) => ({
    mode: s.mode,
    states: e,
    control: s.controllerOptions
  })), i = Y();
  return {
    state: n || null,
    mode: t.mode,
    states: t.states,
    control: t.control,
    context: t,
    controller: i
  };
}
const lc = {
  KeyW: "backward",
  KeyA: "leftward",
  KeyS: "forward",
  KeyD: "rightward",
  ShiftLeft: "shift",
  Space: "space",
  KeyZ: "keyZ",
  KeyR: "keyR",
  KeyF: "keyF",
  KeyE: "keyE",
  Escape: "escape"
}, Ti = (n = !0, e = !0, t) => {
  const i = Y((d) => d.automation?.queue.isRunning), s = Y((d) => d.stopAutomation), r = C(null);
  r.current || (r.current = Pn.getGlobal());
  const o = C(/* @__PURE__ */ new Set()), a = ne(() => ({ ...lc }), []), l = _(
    (d, f) => {
      try {
        return r.current?.executeCommand({
          type: "input",
          action: "updateKeyboard",
          data: { [d]: f }
        }), f ? o.current.add(d) : o.current.delete(d), !0;
      } catch (h) {
        return console.error("Error updating keyboard state:", h), !1;
      }
    },
    []
  ), u = _(() => {
    o.current.clear(), r.current?.executeCommand({
      type: "input",
      action: "updateKeyboard",
      data: {
        forward: !1,
        backward: !1,
        leftward: !1,
        rightward: !1,
        shift: !1,
        space: !1,
        keyZ: !1,
        keyR: !1,
        keyF: !1,
        keyE: !1,
        escape: !1
      }
    });
  }, []);
  return z(() => {
    const d = (v, y) => {
      const p = a[v.code];
      if (!p) return;
      const m = o.current.has(v.code);
      y && !m ? (o.current.add(v.code), v.code === "Space" && v.preventDefault(), e && v.code === "KeyS" && i && (s(), r.current?.executeCommand({
        type: "input",
        action: "updateMouse",
        data: { isActive: !1, shouldRun: !1 }
      })), r.current?.executeCommand({
        type: "input",
        action: "updateKeyboard",
        data: { [p]: !0 }
      })) : !y && m && (o.current.delete(v.code), r.current?.executeCommand({
        type: "input",
        action: "updateKeyboard",
        data: { [p]: !1 }
      }));
    }, f = (v) => d(v, !0), h = (v) => d(v, !1), g = () => document.hidden && u();
    return window.addEventListener("keydown", f), window.addEventListener("keyup", h), document.addEventListener("visibilitychange", g), () => {
      window.removeEventListener("keydown", f), window.removeEventListener("keyup", h), document.removeEventListener("visibilitychange", g);
    };
  }, [
    a,
    e,
    s,
    i,
    u
  ]), {
    pressedKeys: Array.from(o.current),
    pushKey: l,
    isKeyPressed: (d) => o.current.has(d),
    clearAllKeys: u
  };
}, jn = /* @__PURE__ */ new Map(), bn = new b.Vector3(1, 1, 1), uc = new b.Box3(), dc = (n) => {
  const e = jn.get(n);
  e && --e.refCount <= 0 && jn.delete(n);
}, hc = (n) => {
  try {
    return uc.setFromObject(n).getSize(xi());
  } catch {
    return bn.clone();
  }
}, fc = ({ url: n }) => {
  const e = Y((f) => f.sizes), t = Y((f) => f.setSizes), i = n ?? "data:application/json,{}", s = !!n?.trim(), r = dn(i), o = C(!1), a = _(
    () => s && r.scene ? hc(r.scene) : bn.clone(),
    [r.scene, s]
  );
  z(() => {
    if (!n || !s) return;
    const f = jn.get(n);
    return f ? f.refCount++ : jn.set(n, { gltf: r, refCount: 1, size: a() }), () => dc(n);
  }, [n, s, r, a]), z(() => {
    if (o.current || !s || !n || !r.scene || e[n]) return;
    o.current = !0;
    const f = a();
    t((h) => ({ ...h, [n]: f }));
  }, [n, r.scene, e, t, a, s]);
  const l = ne(
    () => s && n ? e[n] ?? bn : bn,
    [e, n, s]
  ), u = _(
    (f, h) => {
      if (!s) return;
      const g = h ?? n;
      g && Promise.resolve().then(() => t((v) => ({ ...v, [g]: f })));
    },
    [n, t, s]
  ), d = _(
    (f) => {
      if (!s) return null;
      const h = f ?? n;
      return h ? e[h] ?? null : null;
    },
    [n, e, s]
  );
  return { gltf: r, size: l, setSize: u, getSize: d };
};
ti(), gi(), ti();
function pc() {
  const { activeState: n, updateActiveState: e } = Xe(), t = !!n;
  return {
    teleport: _((s, r) => {
      if (!n) {
        console.warn("[useTeleport]: Cannot teleport - activeState not available");
        return;
      }
      e({
        position: s.clone(),
        euler: r || n.euler
      });
    }, [n, e]),
    canTeleport: t
  };
}
const ps = {
  minimap: {
    enabled: !0,
    position: "bottom-right",
    size: 200,
    opacity: 0.9,
    showZoom: !0,
    showCompass: !0,
    updateInterval: 33
  },
  tooltip: {
    enabled: !0,
    delay: 500,
    fadeSpeed: 200,
    maxWidth: 300,
    fontSize: 14
  },
  hud: {
    enabled: !0,
    opacity: 0.9,
    showHealthBar: !0,
    showManaBar: !0,
    showExperienceBar: !0
  },
  modal: {
    closeOnEscape: !0,
    closeOnBackdrop: !0,
    backdropOpacity: 0.5
  },
  notifications: {
    maxCount: 5,
    autoHideDuration: 5e3,
    position: "top-right"
  },
  speechBalloon: {
    enabled: !0,
    fontSize: 80,
    padding: 30,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: "#000000",
    maxWidth: 100,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    textColor: "#000000",
    fadeDistance: 20,
    scaleMultiplier: 2,
    defaultOffset: { x: 0, y: 4.5, z: 0 }
  }
}, mc = ft((n) => ({
  config: ps,
  updateConfig: (e) => n((t) => ({
    config: { ...t.config, ...e }
  })),
  updateMinimapConfig: (e) => n((t) => ({
    config: {
      ...t.config,
      minimap: { ...t.config.minimap, ...e }
    }
  })),
  updateTooltipConfig: (e) => n((t) => ({
    config: {
      ...t.config,
      tooltip: { ...t.config.tooltip, ...e }
    }
  })),
  updateHudConfig: (e) => n((t) => ({
    config: {
      ...t.config,
      hud: { ...t.config.hud, ...e }
    }
  })),
  updateModalConfig: (e) => n((t) => ({
    config: {
      ...t.config,
      modal: { ...t.config.modal, ...e }
    }
  })),
  updateNotificationsConfig: (e) => n((t) => ({
    config: {
      ...t.config,
      notifications: { ...t.config.notifications, ...e }
    }
  })),
  updateSpeechBalloonConfig: (e) => n((t) => ({
    config: {
      ...t.config,
      speechBalloon: { ...t.config.speechBalloon, ...e }
    }
  })),
  resetConfig: () => n({ config: ps })
}));
function Xs() {
  const n = C(null), e = C(null), t = C(null), i = C(null);
  return {
    outerGroupRef: n,
    innerGroupRef: e,
    rigidBodyRef: t,
    colliderRef: i
  };
}
function gc({ value: n, name: e, gamePadButtonStyle: t }) {
  const [i, s] = q(!1), { pushKey: r } = Ti(), o = () => {
    r(n, !0), s(!0);
  }, a = () => {
    r(n, !1), s(!1);
  };
  return /* @__PURE__ */ c.jsx(
    "button",
    {
      className: `pad-button ${i ? "is-clicked" : ""}`,
      onMouseDown: o,
      onMouseUp: a,
      onMouseLeave: a,
      onContextMenu: (l) => {
        l.preventDefault(), a();
      },
      onPointerDown: o,
      onPointerUp: a,
      style: t,
      children: e
    }
  );
}
function yu(n) {
  const { gamePadStyle: e, gamePadButtonStyle: t, label: i } = n, s = Y((a) => a.interaction?.keyboard), { mode: r } = Y();
  Ti();
  const o = Object.keys(s || {}).map((a) => {
    const l = i?.[a] || a;
    return a === "forward" || a === "backward" || a === "leftward" || a === "rightward" ? {
      key: a,
      name: l,
      type: "direction",
      active: s?.[a] || !1
    } : {
      key: a,
      name: l,
      type: "action",
      active: s?.[a] || !1
    };
  }).filter(Boolean);
  return /* @__PURE__ */ c.jsx(
    "div",
    {
      className: "gamepad-container",
      style: {
        ...e,
        display: r?.controller === "gamepad" ? "flex" : "none"
      },
      children: o.map((a) => /* @__PURE__ */ c.jsx(
        gc,
        {
          value: a.key,
          name: a.name,
          gamePadButtonStyle: t
        },
        a.key
      ))
    }
  );
}
const er = _n(({ points: n, color: e }) => n.length < 2 ? null : /* @__PURE__ */ c.jsx(
  Sr,
  {
    points: n,
    color: e,
    lineWidth: 2,
    dashed: !1
  }
));
er.displayName = "PathLine";
const tr = _n(() => /* @__PURE__ */ c.jsxs("group", { children: [
  /* @__PURE__ */ c.jsxs("mesh", { children: [
    /* @__PURE__ */ c.jsx("sphereGeometry", { args: [0.2, 16, 16] }),
    /* @__PURE__ */ c.jsx(
      "meshStandardMaterial",
      {
        color: "#00ff88",
        emissive: "#00ff88",
        emissiveIntensity: 0.5,
        transparent: !0,
        opacity: 0.9
      }
    )
  ] }),
  /* @__PURE__ */ c.jsxs("mesh", { rotation: [Math.PI / 2, 0, 0], children: [
    /* @__PURE__ */ c.jsx("ringGeometry", { args: [0.3, 0.5, 8] }),
    /* @__PURE__ */ c.jsx(
      "meshStandardMaterial",
      {
        color: "#00ff88",
        transparent: !0,
        opacity: 0.6,
        side: b.DoubleSide
      }
    )
  ] })
] }));
tr.displayName = "TargetMarker";
const yc = () => ({
  position: new b.Vector3(0, 0, 0),
  velocity: new b.Vector3(0, 0, 0),
  rotation: new b.Euler(0, 0, 0),
  isMoving: !1,
  isGrounded: !1,
  speed: 0,
  height: 2
  // Default character height
});
function vc(n = {}) {
  const { updateInterval: e = 0, entityId: t } = n, i = C(null);
  i.current || (i.current = yc());
  const [, s] = q(0), r = C(0), o = C(0), a = C(void 0), l = C(null), { activeState: u, gameStates: d } = Xe(), f = (h) => {
    if (t) return t;
    if (a.current) return a.current;
    const g = h.getActiveEntities();
    return a.current = g[0], a.current;
  };
  return z(() => {
    a.current = void 0, l.current = Ie.getOrCreate("motion");
    const h = l.current;
    if (!h) return;
    const g = h.subscribe((v, y) => {
      const p = f(h);
      if (!p || y !== p) return;
      const m = performance.now();
      if (o.current = m, e > 0 && m - r.current < e) return;
      r.current = m;
      const x = i.current;
      x.position.copy(v.position), x.velocity.copy(v.velocity), x.rotation.copy(v.rotation), x.isMoving = v.isMoving, x.isGrounded = v.isGrounded, x.speed = v.speed, x.height = 2, s((M) => M + 1);
    });
    return () => {
      g();
    };
  }, [t, e]), Ke(() => {
    const h = performance.now();
    if (e > 0 && h - r.current < e) return;
    const g = i.current, v = l.current;
    if (v) {
      const y = f(v);
      if (!(h - o.current < 16) && y) {
        const m = v.snapshot(y);
        if (m) {
          g.position.copy(m.position), g.velocity.copy(m.velocity), g.rotation.copy(m.rotation), g.isMoving = m.isMoving, g.isGrounded = m.isGrounded, g.speed = m.speed, g.height = 2, r.current = h, s((x) => x + 1);
          return;
        }
      }
    }
    u?.position && (g.position.copy(u.position), u.velocity ? g.velocity.copy(u.velocity) : g.velocity.set(0, 0, 0), u.euler ? g.rotation.copy(u.euler) : g.rotation.set(0, 0, 0), g.isMoving = d?.isMoving || !1, g.isGrounded = d?.isOnTheGround || !1, g.speed = u.velocity ? u.velocity.length() : 0, g.height = 2, r.current = h, s((y) => y + 1));
  }), i.current;
}
function nr() {
  const n = Y((g) => g.automation), { position: e } = vc(), { mouse: t } = Zs(), i = t?.target || new b.Vector3(), s = t?.isActive || !1, r = n?.queue || { actions: [], currentIndex: 0 }, o = r.actions || [], a = r.currentIndex || 0, u = e.distanceTo(i) < 1, d = s && !u, f = o.map((g) => g.type === "move" && g.target ? new b.Vector3(g.target.x, g.target.y, g.target.z) : null).filter((g) => g !== null), h = d ? [e, i, ...f] : f.length > 0 ? [e, ...f] : [];
  return /* @__PURE__ */ c.jsxs("group", { children: [
    d && /* @__PURE__ */ c.jsx("group", { position: i, children: /* @__PURE__ */ c.jsx(tr, {}) }),
    h.length > 1 && /* @__PURE__ */ c.jsx(
      er,
      {
        points: h,
        color: a >= 0 ? "#00ff88" : "#ffaa00"
      }
    ),
    o.map((g, v) => {
      if (g.type === "move" && g.target) {
        const y = v === a, p = v < a;
        return /* @__PURE__ */ c.jsx(
          "group",
          {
            position: [g.target.x, g.target.y, g.target.z],
            children: /* @__PURE__ */ c.jsxs("mesh", { children: [
              /* @__PURE__ */ c.jsx("sphereGeometry", { args: [0.1, 8, 8] }),
              /* @__PURE__ */ c.jsx(
                "meshStandardMaterial",
                {
                  color: p ? "#888" : y ? "#ff4444" : "#ffaa00",
                  transparent: !0,
                  opacity: p ? 0.3 : 0.8
                }
              )
            ] })
          },
          `action-${v}`
        );
      }
      return null;
    })
  ] });
}
function ir() {
  const { onClick: n } = Ys(), e = (t) => {
    t.stopPropagation(), n(t);
  };
  return /* @__PURE__ */ c.jsxs(
    "mesh",
    {
      position: [0, 0, 0],
      rotation: [-Math.PI / 2, 0, 0],
      onPointerDown: e,
      visible: !0,
      userData: { intangible: !0 },
      children: [
        /* @__PURE__ */ c.jsx("planeGeometry", { args: [1e3, 1e3] }),
        /* @__PURE__ */ c.jsx("meshBasicMaterial", { transparent: !0, opacity: 0 })
      ]
    }
  );
}
function bc(n, e, t) {
  const i = C(!1);
  z(() => {
    if (!n || !t || i.current) return;
    const s = wi();
    return s.registerAnimations(e, n), i.current = !0, () => {
      i.current && (s.unregisterAnimations(e), i.current = !1);
    };
  }, [n, e, t]);
}
function xc(n, e, t, i) {
  const s = C(!1), r = C(null);
  return r.current || (r.current = Ie.getOrCreate("motion")), z(() => {
    if (!(!e.current || s.current || !r.current))
      return r.current.register(
        n,
        t === "vehicle" || t === "airplane" ? "vehicle" : "character",
        e.current
      ), s.current = !0, () => {
        r.current?.unregister(n), s.current = !1;
      };
  }, [e, t, n]), { executeMotionCommand: (l) => {
    s.current && i && r.current && r.current.execute(n, l);
  }, getMotionSnapshot: () => s.current && i && r.current ? r.current.snapshot(n) : null };
}
const wc = (n, e) => {
  ["forward", "backward", "leftward", "rightward", "shift", "space", "keyE", "keyR"].forEach((i) => {
    n.keyboard[i] !== e.keyboard[i] && (n.keyboard[i] = e.keyboard[i]);
  }), n.mouse.target.equals(e.mouse.target) || n.mouse.target.copy(e.mouse.target), n.mouse.angle !== e.mouse.angle && (n.mouse.angle = e.mouse.angle), n.mouse.isActive !== e.mouse.isActive && (n.mouse.isActive = e.mouse.isActive), n.mouse.shouldRun !== e.mouse.shouldRun && (n.mouse.shouldRun = e.mouse.shouldRun);
};
function Sc(n, e, t, i, s) {
  const r = n.mode?.type || "character", o = e.getActiveState(), a = e.getGameStates(), l = n.automation;
  return {
    activeState: o,
    gameStates: a,
    keyboard: { ...t.keyboard },
    mouse: {
      target: s.copy(t.mouse.target),
      angle: t.mouse.angle,
      isActive: t.mouse.isActive,
      shouldRun: t.mouse.shouldRun
    },
    automationOption: l,
    modeType: r,
    delta: i
  };
}
function Mc(n) {
  const e = C(null), t = C(new b.Vector3()), i = C(null), s = C(null), r = Y(), { activeState: o } = Xe(), a = Fe.getInstance(), l = a.getState(), u = Y((h) => h.urls), d = !!(l && u && o);
  z(() => {
    const h = Ie.getOrCreate("physics");
    return h && (s.current = h, s.current.register("global-physics", r.physics)), i.current = Js(), () => {
      s.current && s.current.unregister("global-physics");
    };
  }, [r.physics]), z(() => {
    s.current && r.physics && s.current.execute("global-physics", {
      type: "updateConfig",
      data: r.physics
    });
  }, [r.physics]), z(() => {
    const h = (g) => {
      const { position: v } = g.detail;
      n.rigidBodyRef?.current && v && (n.rigidBodyRef.current.setTranslation(
        { x: v.x, y: v.y, z: v.z },
        !0
      ), n.rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, !0), n.rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, !0));
    };
    return window.addEventListener("gaesup:teleport", h), document.addEventListener("teleport-request", h), () => {
      window.removeEventListener("gaesup:teleport", h), document.removeEventListener("teleport-request", h);
    };
  }, [n.rigidBodyRef]);
  const f = _((h, g) => {
    if (!d || !s.current || !i.current) return;
    const v = {
      keyboard: l.keyboard,
      mouse: l.mouse
    };
    let y = e.current;
    if (y)
      wc(y, v), y.activeState = i.current.getActiveState(), y.gameStates = i.current.getGameStates(), y.delta = g;
    else {
      const m = Y.getState();
      if (y = Sc(
        m,
        i.current,
        v,
        g,
        t.current
      ), e.current = y, y.activeState) {
        const { activeState: x } = y;
        n.rigidBodyRef.current.lockRotations(!1, !0), x.euler.set(0, 0, 0), n.rigidBodyRef.current.setTranslation(
          {
            x: x.position.x,
            y: x.position.y + 5,
            z: x.position.z
          },
          !0
        );
      }
    }
    const p = {
      rigidBodyRef: n.rigidBodyRef,
      state: h,
      delta: g,
      worldContext: Y.getState(),
      dispatch: () => {
      },
      inputRef: { current: v },
      setKeyboardInput: (m) => a.updateKeyboard(m),
      setMouseInput: (m) => a.updateMouse(m),
      ...n.innerGroupRef ? { innerGroupRef: n.innerGroupRef } : {}
    };
    s.current.updateEntity("global-physics", {
      deltaTime: g,
      calcProp: p,
      physicsState: y
    });
  }, [d, l, u, a, n]);
  return Ke((h, g) => {
    d && f(h, g);
  }), {
    isReady: d,
    bridge: s.current
  };
}
function Cc(n) {
  const {
    onIntersectionEnter: e,
    onIntersectionExit: t,
    onCollisionEnter: i,
    userData: s
  } = n, r = (u, ...d) => {
    if (typeof u == "function")
      try {
        u(...d);
      } catch {
      }
  }, o = _(
    (u) => {
      r(e, u), r(s?.onNear, u, s);
    },
    [e, s]
  ), a = _(
    (u) => {
      r(t, u), r(s?.onFar, u, s), r(s?.onLeave, u, s);
    },
    [t, s]
  ), l = _(
    (u) => {
      r(i, u), r(s?.onNear, u, s);
    },
    [i, s]
  );
  return {
    handleIntersectionEnter: o,
    handleIntersectionExit: a,
    handleCollisionEnter: l
  };
}
function Pc(n) {
  const { onReady: e, onFrame: t, onAnimate: i, actions: s } = n;
  z(() => {
    e && e();
  }, [e]), z(() => {
    let r;
    const o = () => {
      t && t(), i && s && i(), r = requestAnimationFrame(o);
    };
    if (!(!t && !(i && s)))
      return r = requestAnimationFrame(o), () => {
        cancelAnimationFrame(r);
      };
  }, [t, i, s]);
}
function jc(n) {
  const {
    id: e,
    rigidBodyRef: t,
    isActive: i,
    actions: s,
    outerGroupRef: r,
    innerGroupRef: o,
    colliderRef: a,
    groundRay: l
  } = n, u = C(
    e || `entity-${Date.now()}-${Math.random()}`
  ).current, d = Y((p) => p.mode), f = d?.type ?? "character", h = i === !0;
  bc(s, f, h), Ks(h && f === "character");
  const { executeMotionCommand: g, getMotionSnapshot: v } = xc(
    u,
    t,
    f,
    h
  );
  if (h) {
    const p = {
      rigidBodyRef: t,
      ...r ? { outerGroupRef: r } : {},
      ...o ? { innerGroupRef: o } : {},
      ...a ? { colliderRef: a } : {},
      ...l ? { groundRay: l } : {}
    };
    Mc(p);
  }
  const y = Cc(n);
  return Pc(n), {
    executeMotionCommand: g,
    getMotionSnapshot: v,
    mode: d,
    ...y
  };
}
function sr({ nodes: n, color: e, skeleton: t, url: i, excludeNodeNames: s }) {
  const r = ne(() => {
    const o = s && s.length > 0 ? new Set(s) : null;
    return Object.keys(n).map((a, l) => {
      if (o && o.has(a)) return null;
      const u = n[a];
      return u instanceof b.SkinnedMesh ? {
        type: "skinnedMesh",
        material: Array.isArray(u.material) ? u.material.map((f) => {
          const h = f.clone();
          return e && "color" in h && h.color instanceof b.Color && h.color.set(e), h;
        }) : (() => {
          const f = u.material.clone();
          return e && "color" in f && f.color instanceof b.Color && f.color.set(e), f;
        })(),
        geometry: u.geometry,
        skeleton: t || u.skeleton,
        key: `${i}-${a}-${l}`
      } : u instanceof b.Mesh ? {
        type: "mesh",
        material: Array.isArray(u.material) ? u.material.map((f) => {
          const h = f.clone();
          return e && "color" in h && h.color instanceof b.Color && h.color.set(e), h;
        }) : (() => {
          const f = u.material.clone();
          return e && "color" in f && f.color instanceof b.Color && f.color.set(e), f;
        })(),
        geometry: u.geometry,
        key: `${i}-${a}-${l}`
      } : null;
    }).filter(Boolean);
  }, [n, e, t, i, s]);
  return /* @__PURE__ */ c.jsx(c.Fragment, { children: r.map((o) => o ? o.type === "skinnedMesh" ? /* @__PURE__ */ c.jsx(
    "skinnedMesh",
    {
      castShadow: !0,
      receiveShadow: !0,
      material: o.material,
      geometry: o.geometry,
      skeleton: o.skeleton,
      frustumCulled: !1
    },
    o.key
  ) : /* @__PURE__ */ c.jsx(
    "mesh",
    {
      castShadow: !0,
      receiveShadow: !0,
      material: o.material,
      geometry: o.geometry
    },
    o.key
  ) : null) });
}
function Ic({ url: n, isActive: e, color: t, skeleton: i }) {
  const { scene: s } = dn(n), r = ne(() => kn.clone(s), [s]), { nodes: o } = Ts(r);
  return Ks(e), /* @__PURE__ */ c.jsx("group", { children: /* @__PURE__ */ c.jsx(
    sr,
    {
      nodes: o,
      url: n,
      ...t ? { color: t } : {},
      ...i ? { skeleton: i } : {}
    }
  ) });
}
const rr = pi((n, e) => {
  const t = typeof n.modelYawOffset == "number" ? n.modelYawOffset : n.componentType === "character" ? Math.PI : 0, i = n.baseColor ?? n.parts?.[0]?.color;
  return /* @__PURE__ */ c.jsx("group", { receiveShadow: !0, castShadow: !0, ref: e, userData: { intangible: !0 }, children: /* @__PURE__ */ c.jsxs("group", { "rotation-y": t, children: [
    n.children,
    n.objectNode && n.animationRef && /* @__PURE__ */ c.jsx(
      "primitive",
      {
        object: n.objectNode,
        visible: !1,
        receiveShadow: !0,
        castShadow: !0,
        ref: n.animationRef
      }
    ),
    /* @__PURE__ */ c.jsx(
      sr,
      {
        nodes: n.nodes,
        skeleton: n.skeleton,
        url: n.url || "",
        ...i ? { color: i } : {},
        ...n.excludeBaseNodes && n.excludeBaseNodes.length > 0 ? { excludeNodeNames: n.excludeBaseNodes } : {}
      }
    )
  ] }) });
});
rr.displayName = "InnerGroupRef";
const _c = "data:application/json," + encodeURIComponent(
  JSON.stringify({
    asset: { version: "2.0" },
    scenes: [{ nodes: [] }],
    nodes: []
  })
);
function Tc() {
  return ({ groundRay: n, length: e, colliderRef: t }) => {
    if (!t.current || !n || !n.origin || !n.dir) return;
    const i = new b.Raycaster();
    i.set(n.origin, n.dir), i.far = e, i.intersectObjects([], !0).length > 0 && t.current.setActiveEvents(1);
  };
}
const Un = pi(
  (n, e) => {
    const t = C(null);
    gr(e, () => t.current);
    const { size: i } = fc({ url: n.url || "" }), s = Tc(), r = n.url?.trim() ? n.url : _c, { scene: o, animations: a } = dn(r), { actions: l, ref: u } = ks(a), {
      handleIntersectionEnter: d,
      handleIntersectionExit: f,
      handleCollisionEnter: h
    } = jc({
      rigidBodyRef: t,
      ...n.name ? { id: n.name } : {},
      ...n.userData ? { userData: n.userData } : {},
      ...n.onIntersectionEnter ? { onIntersectionEnter: n.onIntersectionEnter } : {},
      ...n.onIntersectionExit ? { onIntersectionExit: n.onIntersectionExit } : {},
      ...n.onCollisionEnter ? { onCollisionEnter: n.onCollisionEnter } : {},
      ...n.onReady ? { onReady: n.onReady } : {},
      ...n.onFrame ? { onFrame: n.onFrame } : {},
      ...n.onAnimate ? { onAnimate: n.onAnimate } : {},
      actions: l,
      isActive: n.isActive,
      ...n.outerGroupRef ? { outerGroupRef: n.outerGroupRef } : {},
      ...n.innerGroupRef ? { innerGroupRef: n.innerGroupRef } : {},
      ...n.colliderRef ? { colliderRef: n.colliderRef } : {},
      ...n.groundRay ? { groundRay: n.groundRay } : {}
    }), g = ne(() => kn.clone(o), [o]), v = ne(() => {
      let I = null;
      return g.traverse((k) => {
        k instanceof b.SkinnedMesh && (I = k.skeleton);
      }), I;
    }, [g]), y = ne(() => !n.parts || n.parts.length === 0 ? null : n.parts.map(({ url: I, color: k }, R) => I ? /* @__PURE__ */ yr(
      Ic,
      {
        url: I,
        isActive: !0,
        componentType: n.componentType,
        ...n.currentAnimation ? { currentAnimation: n.currentAnimation } : {},
        ...k ? { color: k } : {},
        key: `${n.componentType}-${I}-${k || "default"}-${R}`,
        ...v ? { skeleton: v } : {}
      }
    ) : null).filter(Boolean), [n.parts, n.componentType, n.currentAnimation, v]);
    n.groundRay && n.colliderRef && s({
      groundRay: n.groundRay,
      length: 2,
      colliderRef: n.colliderRef
    });
    const { nodes: p } = Ts(g), m = Object.values(p).find((I) => I.type === "Object3D"), x = n.rotation instanceof b.Euler ? n.rotation.y : 0, M = n.outerGroupRef ? { ref: n.outerGroupRef } : {}, P = n.innerGroupRef ? { ref: n.innerGroupRef } : {};
    return /* @__PURE__ */ c.jsx("group", { ...M, userData: { intangible: !0 }, children: /* @__PURE__ */ c.jsxs(
      $t,
      {
        canSleep: !1,
        ccd: !0,
        colliders: !1,
        ref: t,
        ...n.name ? { name: n.name } : {},
        position: n.position,
        rotation: gi().set(0, x, 0),
        userData: n.userData,
        type: n.rigidbodyType || (n.isActive ? "dynamic" : "fixed"),
        ...n.sensor !== void 0 ? { sensor: n.sensor } : {},
        onIntersectionEnter: d,
        onIntersectionExit: f,
        onCollisionEnter: h,
        ...n.rigidBodyProps,
        children: [
          !n.isNotColliding && /* @__PURE__ */ c.jsx(
            yi,
            {
              ref: n.colliderRef,
              args: [(i.y / 2 - i.x) * 1.2, i.x * 1.2],
              position: [0, i.x * 1.2, 0]
            }
          ),
          /* @__PURE__ */ c.jsxs(
            rr,
            {
              animationRef: u,
              nodes: p,
              ...P,
              isActive: n.isActive,
              componentType: n.componentType,
              ...m ? { objectNode: m } : {},
              ...n.modelYawOffset !== void 0 ? { modelYawOffset: n.modelYawOffset } : {},
              ...n.isRiderOn !== void 0 ? { isRiderOn: n.isRiderOn } : {},
              ...n.enableRiding !== void 0 ? { enableRiding: n.enableRiding } : {},
              ...n.ridingUrl ? { ridingUrl: n.ridingUrl } : {},
              ...n.offset ? { offset: n.offset } : {},
              ...n.baseColor ? { baseColor: n.baseColor } : {},
              ...n.excludeBaseNodes ? { excludeBaseNodes: n.excludeBaseNodes } : {},
              ...n.parts ? { parts: n.parts } : {},
              children: [
                n.children,
                y
              ]
            }
          )
        ]
      }
    ) });
  }
);
Un.displayName = "PhysicsEntity";
function kc({ props: n, children: e }) {
  const t = Y((v) => v.mode), { gameStates: i } = Xe(), s = Y((v) => v.rideable), r = Y((v) => v.urls), o = Xs();
  if (Ti(), !t || !i || !s || !r || t.type === "character" && !r.characterUrl || t.type === "vehicle" && !r.vehicleUrl || t.type === "airplane" && !r.airplaneUrl) return null;
  const { canRide: a, isRiding: l, currentRideable: u } = i, d = u?.id, f = ne(
    () => (d ? s[d]?.offset : void 0) ?? ti(),
    [d, s]
  ), g = (() => {
    const v = n.rigidBodyRef ?? o.rigidBodyRef, y = n.outerGroupRef ?? o.outerGroupRef, p = n.innerGroupRef ?? o.innerGroupRef, m = n.colliderRef ?? o.colliderRef, x = {
      isActive: !0,
      componentType: t.type,
      enableRiding: a,
      isRiderOn: l,
      offset: f,
      ref: v,
      outerGroupRef: y,
      innerGroupRef: p,
      colliderRef: m,
      onAnimate: n.onAnimate || (() => {
      }),
      onFrame: n.onFrame || (() => {
      }),
      onReady: n.onReady || (() => {
      }),
      onDestory: n.onDestory || (() => {
      }),
      parts: (n.parts || []).filter((I) => !!I.url).map((I) => ({ ...I, url: I.url })),
      ...typeof n.baseColor == "string" && n.baseColor.trim().length > 0 ? { baseColor: n.baseColor } : {},
      ...Array.isArray(n.excludeBaseNodes) && n.excludeBaseNodes.length > 0 ? { excludeBaseNodes: n.excludeBaseNodes } : {},
      ...n.rigidBodyProps ? { rigidBodyProps: n.rigidBodyProps } : {},
      ...n.controllerOptions ? { controllerOptions: n.controllerOptions } : {},
      ...n.groundRay ? { groundRay: n.groundRay } : {},
      ...n.position ? { position: n.position } : {},
      ...n.rotation ? { rotation: n.rotation } : {},
      ...n.scale ? { scale: n.scale } : {}
    }, M = l && t.type !== "character" ? r.ridingUrl : void 0, P = typeof M == "string" && M.length > 0 ? { ridingUrl: M } : {};
    switch (t.type) {
      case "character":
        return {
          ...x,
          url: r.characterUrl || ""
        };
      case "vehicle":
        return {
          ...x,
          ...P,
          url: r.vehicleUrl || "",
          wheelUrl: r.wheelUrl
        };
      case "airplane":
        return {
          ...x,
          ...P,
          url: r.airplaneUrl || ""
        };
      default:
        return {
          ...x,
          url: r.characterUrl || ""
        };
    }
  })();
  return t.type === "character" && i.isRiding ? null : /* @__PURE__ */ c.jsx(Un, { ...g, children: e });
}
const ms = [
  { id: "slow", name: "Slow", maxSpeed: 5, acceleration: 8 },
  { id: "normal", name: "Normal", maxSpeed: 10, acceleration: 15 },
  { id: "fast", name: "Fast", maxSpeed: 20, acceleration: 25 },
  { id: "sprint", name: "Sprint", maxSpeed: 35, acceleration: 40 }
], gs = [
  { id: "eco", name: "Eco", maxSpeed: 15, acceleration: 10 },
  { id: "comfort", name: "Comfort", maxSpeed: 25, acceleration: 20 },
  { id: "sport", name: "Sport", maxSpeed: 40, acceleration: 35 },
  { id: "turbo", name: "Turbo", maxSpeed: 60, acceleration: 50 }
];
function Ac(n, e) {
  const t = n ?? "bottom-left", i = {
    position: "fixed",
    zIndex: e ?? 1e4
  };
  return t.includes("top") && (i.top = 12), t.includes("bottom") && (i.bottom = 12), t.includes("left") && (i.left = 12), t.includes("right") && (i.right = 12), i;
}
function or(n) {
  const e = Ac(n.position, n.zIndex), t = Y((h) => h.mode), i = Y((h) => h.setMode), s = Y((h) => h.setPhysics), r = t?.type === "vehicle" ? "vehicle" : "character", o = r === "vehicle" ? gs : ms, [a, l] = q(
    r === "vehicle" ? "comfort" : "normal"
  ), u = _(
    (h, g) => {
      const y = (h === "vehicle" ? gs : ms).find((p) => p.id === g);
      if (y) {
        if (h === "vehicle") {
          s({ maxSpeed: y.maxSpeed, accelRatio: y.acceleration });
          return;
        }
        s({
          walkSpeed: Math.max(1, y.maxSpeed * 0.5),
          runSpeed: y.maxSpeed,
          accelRatio: y.acceleration
        });
      }
    },
    [s]
  ), d = _((h) => {
    l(h), u(r, h), n.onPresetChange?.(h);
  }, [u, r, n]), f = _((h) => {
    const g = h.target.value;
    i({ type: g });
    const v = g === "vehicle" ? "comfort" : "normal";
    l(v), u(g, v), n.onPresetChange?.(v);
  }, [u, i, n]);
  return /* @__PURE__ */ c.jsxs("div", { className: `mc-panel ${n.compact ? "compact" : ""}`, style: e, children: [
    /* @__PURE__ */ c.jsxs("div", { className: "mc-setting-row", children: [
      /* @__PURE__ */ c.jsx("label", { htmlFor: "motion-type-select", className: "mc-label", children: "Motion Type" }),
      /* @__PURE__ */ c.jsxs(
        "select",
        {
          id: "motion-type-select",
          className: "mc-select",
          value: r,
          onChange: f,
          children: [
            /* @__PURE__ */ c.jsx("option", { value: "character", children: "Character" }),
            /* @__PURE__ */ c.jsx("option", { value: "vehicle", children: "Vehicle" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ c.jsxs("div", { className: "mc-setting-row", children: [
      /* @__PURE__ */ c.jsx("label", { className: "mc-label", children: "Presets" }),
      /* @__PURE__ */ c.jsx("div", { className: "mc-presets-grid", children: o.map((h) => /* @__PURE__ */ c.jsx(
        "button",
        {
          className: `mc-preset-btn ${h.id === a ? "active" : ""}`,
          onClick: () => d(h.id),
          title: `Max Speed: ${h.maxSpeed}, Accel: ${h.acceleration}`,
          children: h.name
        },
        h.id
      )) })
    ] })
  ] });
}
function Rc(n) {
  const { clickToMove: e, children: t, ...i } = n;
  return /* @__PURE__ */ c.jsx(kc, { props: i, children: /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
    e && /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
      /* @__PURE__ */ c.jsx(ir, {}),
      /* @__PURE__ */ c.jsx(nr, {})
    ] }),
    t
  ] }) });
}
const zc = pi(
  ({ children: n, position: e, focusDistance: t = 10, focusDuration: i = 1, onFocus: s, onBlur: r, ...o }, a) => {
    const l = Y((v) => v.setCameraOption), u = Y((v) => v.cameraOption), d = (v) => {
      if (v.stopPropagation(), !u?.enableFocus) return;
      const y = v.object.getWorldPosition(new b.Vector3());
      l({
        ...u,
        focusTarget: y,
        focusDuration: i,
        focusDistance: t,
        focus: !0
      }), s && s(v);
    }, f = () => {
      u?.enableFocus && (document.body.style.cursor = "pointer");
    }, h = (v) => {
      document.body.style.cursor = "default", r && r(v);
    }, g = {
      ...o,
      ...e ? { position: e } : {}
    };
    return /* @__PURE__ */ c.jsx(
      "group",
      {
        ref: a,
        onClick: d,
        onPointerOver: f,
        onPointerOut: h,
        ...g,
        children: n
      }
    );
  }
);
zc.displayName = "FocusableObject";
var Dc = Object.defineProperty, Ec = Object.getOwnPropertyDescriptor, _t = (n, e, t, i) => {
  for (var s = i > 1 ? void 0 : i ? Ec(e, t) : e, r = n.length - 1, o; r >= 0; r--)
    (o = n[r]) && (s = (i ? o(e, t, s) : o(s)) || s);
  return i && s && Dc(e, t, s), s;
};
let vt = class {
  DEFAULT_JUMP_FORCE = 12;
  DEFAULT_MAX_SPEED = 10;
  DEFAULT_ACCELERATION = 5;
  GROUND_THRESHOLD = 0.1;
  calculateMovementForce(n, e, t, i) {
    const { maxSpeed: s, acceleration: r } = t, o = i ?? new b.Vector3(), a = n.x * n.x + n.y * n.y + n.z * n.z;
    if (a > 0) {
      const u = 1 / Math.sqrt(a) * s;
      o.set(n.x * u, n.y * u, n.z * u);
    } else
      o.set(0, 0, 0);
    return o.sub(e), o.multiplyScalar(r), o;
  }
  calculateJumpForce(n, e = this.DEFAULT_JUMP_FORCE, t, i) {
    const s = i ?? new b.Vector3(0, 0, 0);
    if (!n) return s.set(0, 0, 0);
    const r = t?.isJumping ? 1.5 : 1;
    return s.set(0, e * r, 0);
  }
  calculateGroundState(n, e) {
    return Math.abs(e.y) < this.GROUND_THRESHOLD && n.y < this.GROUND_THRESHOLD;
  }
  calculateSpeed(n) {
    return Math.sqrt(n.x * n.x + n.z * n.z);
  }
  calculateDirection(n, e, t) {
    return (t ?? new b.Vector3()).subVectors(e, n).normalize();
  }
  applyDamping(n, e = 0.95, t) {
    return (t ?? new b.Vector3()).copy(n).multiplyScalar(e);
  }
  limitVelocity(n, e) {
    const t = this.calculateSpeed(n);
    if (t > e) {
      const i = e / t;
      n.x *= i, n.z *= i;
    }
    return n;
  }
  calculateRotationToTarget(n, e) {
    const t = e.x - n.x, i = e.z - n.z;
    return Math.atan2(t, i);
  }
  smoothRotation(n, e, t = 0.1) {
    let i = e - n;
    for (; i > Math.PI; ) i -= 2 * Math.PI;
    for (; i < -Math.PI; ) i += 2 * Math.PI;
    return n + i * t;
  }
  calculateMetrics(n, e, t, i) {
    const s = this.calculateSpeed(n), r = this.calculateSpeed(e), o = s * t, a = i + o;
    return {
      currentSpeed: s,
      averageSpeed: a / (t * 1e3),
      totalDistance: a,
      frameTime: t,
      isAccelerating: s > r
    };
  }
  getDefaultConfig() {
    return {
      maxSpeed: this.DEFAULT_MAX_SPEED,
      acceleration: this.DEFAULT_ACCELERATION,
      jumpForce: this.DEFAULT_JUMP_FORCE
    };
  }
};
_t([
  F()
], vt.prototype, "calculateMovementForce", 1);
_t([
  F()
], vt.prototype, "calculateJumpForce", 1);
_t([
  F()
], vt.prototype, "limitVelocity", 1);
_t([
  F()
], vt.prototype, "calculateRotationToTarget", 1);
_t([
  F()
], vt.prototype, "smoothRotation", 1);
_t([
  F()
], vt.prototype, "calculateMetrics", 1);
vt = _t([
  kr()
], vt);
const ys = [
  { key: "motionType", label: "Motion Type", type: "text" },
  { key: "position", label: "Position", type: "vector3" },
  { key: "velocity", label: "Velocity", type: "vector3" },
  { key: "speed", label: "Speed", type: "number" },
  { key: "direction", label: "Direction", type: "vector3" },
  { key: "isGrounded", label: "Grounded", type: "text" },
  { key: "isMoving", label: "Moving", type: "text" },
  { key: "acceleration", label: "Acceleration", type: "number" },
  { key: "jumpForce", label: "Jump Force", type: "number" },
  { key: "maxSpeed", label: "Max Speed", type: "number" },
  { key: "totalDistance", label: "Total Distance", type: "number" },
  { key: "gameState", label: "Game State", type: "text" }
];
function Nc(n, e) {
  const t = n ?? "top-right", i = {
    position: "fixed",
    zIndex: e ?? 1e4
  };
  return t.includes("top") && (i.top = 12), t.includes("bottom") && (i.bottom = 12), t.includes("left") && (i.left = 12), t.includes("right") && (i.right = 12), i;
}
function ar(n) {
  const e = Nc(n.position, n.zIndex), t = Y((d) => d.mode), i = Y((d) => d.physics), { activeState: s, gameStates: r } = Xe(), o = n.precision ?? 2, a = n.customFields ? [...ys, ...n.customFields] : ys, l = (d, f, h = 2) => {
    if (f == null) return "N/A";
    switch (d.type) {
      case "vector3":
        if (Array.isArray(f) && f.length === 3) {
          const [g, v, y] = f;
          return `X:${g.toFixed(h)} Y:${v.toFixed(h)} Z:${y.toFixed(h)}`;
        }
        if (typeof f == "object" && f !== null && "x" in f && "y" in f && "z" in f) {
          const g = f;
          return `X:${g.x.toFixed(h)} Y:${g.y.toFixed(h)} Z:${g.z.toFixed(h)}`;
        }
        return String(f);
      case "number":
        return typeof f == "number" ? f.toFixed(h) : String(f);
      default:
        return String(f);
    }
  }, u = (d) => {
    if (d.value !== void 0) return d.value;
    switch (d.key) {
      case "motionType":
        return t?.type ?? "character";
      case "position":
        return s?.position ? { x: s.position.x, y: s.position.y, z: s.position.z } : { x: 0, y: 0, z: 0 };
      case "velocity":
        return s?.velocity ? { x: s.velocity.x, y: s.velocity.y, z: s.velocity.z } : { x: 0, y: 0, z: 0 };
      case "speed":
        return s?.velocity ? s.velocity.length() : 0;
      case "direction":
        return s?.direction ? { x: s.direction.x, y: s.direction.y, z: s.direction.z } : { x: 0, y: 0, z: 0 };
      case "isGrounded":
        return r?.isOnTheGround ? "Yes" : "No";
      case "isMoving":
        return r?.isMoving ? "Yes" : "No";
      case "acceleration":
        return i?.accelRatio ?? 0;
      case "jumpForce":
        return i?.jumpSpeed ?? 0;
      case "maxSpeed":
        return t?.type === "character" ? i?.runSpeed ?? 0 : i?.maxSpeed ?? 0;
      case "totalDistance":
        return 0;
      case "gameState":
        return r?.isRiding ? "riding" : r?.isOnTheGround ? "ground" : "air";
      default:
        return null;
    }
  };
  return /* @__PURE__ */ c.jsx(
    "div",
    {
      className: `md-panel ${n.compact ? "compact" : ""} ${n.theme ? `theme-${n.theme}` : ""}`,
      style: e,
      children: /* @__PURE__ */ c.jsx("div", { className: "md-content", children: a.map((d) => /* @__PURE__ */ c.jsxs("div", { className: "md-item", children: [
        /* @__PURE__ */ c.jsx("span", { className: "md-label", children: d.label }),
        /* @__PURE__ */ c.jsx("span", { className: "md-value", children: l(d, u(d), o) })
      ] }, d.key)) })
    }
  );
}
function vu({
  showController: n = !0,
  showDebugPanel: e = !0,
  controllerProps: t = {},
  debugPanelProps: i = {}
}) {
  return /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
    n && /* @__PURE__ */ c.jsx(
      or,
      {
        position: "bottom-left",
        showLabels: !0,
        compact: !1,
        ...t
      }
    ),
    e && /* @__PURE__ */ c.jsx(
      ar,
      {
        position: "top-right",
        updateInterval: 100,
        precision: 2,
        compact: !1,
        ...i
      }
    )
  ] });
}
function bu({ text: n, position: e, teleportStyle: t }) {
  const { teleport: i, canTeleport: s } = pc(), r = () => {
    i(e);
  };
  return /* @__PURE__ */ c.jsxs(
    "div",
    {
      className: `teleport ${s ? "" : "teleport--disabled"}`,
      onClick: r,
      style: t,
      title: s ? "Click to teleport" : "Teleport not available",
      children: [
        n || "Teleport",
        !s && /* @__PURE__ */ c.jsx("span", { className: "teleport__cooldown", children: "⏱️" })
      ]
    }
  );
}
var Oc = Object.defineProperty, Lc = Object.getOwnPropertyDescriptor, Gc = (n, e, t) => e in n ? Oc(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t, Fc = (n, e, t, i) => {
  for (var s = i > 1 ? void 0 : i ? Lc(e, t) : e, r = n.length - 1, o; r >= 0; r--)
    (o = n[r]) && (s = o(s) || s);
  return s;
}, Uc = (n, e, t) => Gc(n, e + "", t);
let Le = class extends qe {
  listeners;
  constructor() {
    const n = {
      markers: /* @__PURE__ */ new Map(),
      canvas: null,
      ctx: null,
      isDirty: !0,
      lastPosition: null,
      lastRotation: null,
      gradientCache: {
        background: null,
        avatar: null
      },
      lastUpdate: Date.now()
    }, e = {
      markerCount: 0,
      renderTime: 0,
      frameTime: 0
    };
    super(n, e), this.listeners = /* @__PURE__ */ new Set();
  }
  static getInstance() {
    return (!Le.instance || Le.instance.isDisposed) && (Le.instance = new Le()), Le.instance;
  }
  addMarker(n, e, t, i, s) {
    const r = { id: n, type: e, text: t, center: i, size: s };
    this.state.markers.set(n, r), this.updateMetrics(0), this.notifyListeners();
  }
  removeMarker(n) {
    this.state.markers.delete(n), this.updateMetrics(0), this.notifyListeners();
  }
  updateMarker(n, e) {
    const t = this.state.markers.get(n);
    t && (this.state.markers.set(n, { ...t, ...e }), this.updateMetrics(0), this.notifyListeners());
  }
  getMarkers() {
    return new Map(this.state.markers);
  }
  getMarker(n) {
    return this.state.markers.get(n);
  }
  clear() {
    this.state.markers.clear(), this.updateMetrics(0), this.notifyListeners();
  }
  subscribe(n) {
    return this.listeners.add(n), () => this.listeners.delete(n);
  }
  notifyListeners() {
    const n = this.getMarkers();
    this.listeners.forEach((e) => e(n));
  }
  setCanvas(n) {
    this.state.canvas = n, this.state.ctx = n ? n.getContext("2d") : null, this.state.isDirty = !0, this.state.gradientCache = {
      background: null,
      avatar: null
    };
  }
  checkForUpdates(n, e, t = 0.1, i = 0.01) {
    const s = this.state.lastPosition, r = this.state.lastRotation;
    if (!s || r === null) {
      this.state.isDirty = !0, this.state.lastPosition = { x: n.x, z: n.z }, this.state.lastRotation = e;
      return;
    }
    const o = Math.abs(n.x - s.x) > t || Math.abs(n.z - s.z) > t, a = Math.abs(e - r) > i;
    (o || a) && (this.state.isDirty = !0, this.state.lastPosition = { x: n.x, z: n.z }, this.state.lastRotation = e);
  }
  render(n) {
    if (!this.state.canvas || !this.state.ctx || !this.state.isDirty) return;
    const e = performance.now(), { size: t, scale: i, position: s, rotation: r, blockRotate: o, tileGroups: a, sceneObjects: l } = n, u = this.state.ctx;
    if (u.clearRect(0, 0, t, t), u.save(), u.beginPath(), u.arc(t / 2, t / 2, t / 2, 0, Math.PI * 2), u.clip(), !this.state.gradientCache.background) {
      const f = u.createRadialGradient(t / 2, t / 2, 0, t / 2, t / 2, t / 2);
      f.addColorStop(0, "rgba(20, 30, 40, 0.9)"), f.addColorStop(1, "rgba(10, 20, 30, 0.95)"), this.state.gradientCache.background = f;
    }
    u.fillStyle = this.state.gradientCache.background, u.fillRect(0, 0, t, t);
    const d = r * 180 / Math.PI;
    u.translate(t / 2, t / 2), u.rotate(-d * Math.PI / 180), u.translate(-t / 2, -t / 2), u.save(), u.strokeStyle = "rgba(255, 255, 255, 0.1)", u.lineWidth = 1;
    for (let f = 0; f < t; f += 20)
      u.beginPath(), u.moveTo(f, 0), u.lineTo(f, t), u.moveTo(0, f), u.lineTo(t, f), u.stroke();
    u.restore(), this.renderCompass(u, t, d), a && a.size > 0 && this.renderTiles(u, t, i, s, a), l && l.size > 0 && this.renderSceneObjects(u, t, i, s, l), this.renderMarkers(u, t, i, s, d, o), this.renderAvatar(u, t), u.restore(), this.state.isDirty = !1, this.metrics.renderTime = performance.now() - e;
  }
  renderCompass(n, e, t) {
    n.save(), n.fillStyle = "white", n.font = "bold 16px sans-serif", n.shadowColor = "rgba(0, 0, 0, 0.8)", n.shadowBlur = 3, [
      { text: "N", x: e / 2, y: 25, color: "#ff6b6b" },
      { text: "S", x: e / 2, y: e - 25, color: "#4ecdc4" },
      { text: "E", x: e - 25, y: e / 2, color: "#45b7d1" },
      { text: "W", x: 25, y: e / 2, color: "#f9ca24" }
    ].forEach(({ text: s, x: r, y: o, color: a }) => {
      n.save(), n.fillStyle = a, n.translate(r, o), n.rotate(t * Math.PI / 180), n.textAlign = "center", n.textBaseline = "middle", n.fillText(s, 0, 0), n.restore();
    }), n.restore();
  }
  renderTiles(n, e, t, i, s) {
    Array.from(s.values()).forEach((o) => {
      o && o.tiles && Array.isArray(o.tiles) && o.tiles.forEach((a) => {
        if (!a || !a.position) return;
        const l = (a.position.x - i.x) * t, u = (a.position.z - i.z) * t, d = (a.size || 1) * 4 * t;
        n.save();
        const f = e / 2 - l - d / 2, h = e / 2 - u - d / 2;
        a.objectType === "water" ? n.fillStyle = "rgba(0, 150, 255, 0.6)" : a.objectType === "grass" ? n.fillStyle = "rgba(50, 200, 50, 0.4)" : n.fillStyle = "rgba(150, 150, 150, 0.3)", n.fillRect(f, h, d, d), n.strokeStyle = "rgba(255, 255, 255, 0.2)", n.lineWidth = 0.5, n.strokeRect(f, h, d, d), n.restore();
      });
    });
  }
  renderSceneObjects(n, e, t, i, s) {
    s.forEach((r) => {
      if (!r?.position || !r?.size) return;
      const o = (r.position.x - i.x) * t, a = (r.position.z - i.z) * t, l = r.size.x * t, u = r.size.z * t;
      n.save();
      const d = e / 2 - o - l / 2, f = e / 2 - a - u / 2;
      n.fillStyle = "rgba(100, 150, 200, 0.4)", n.fillRect(d, f, l, u), n.strokeStyle = "rgba(255, 255, 255, 0.4)", n.lineWidth = 1, n.strokeRect(d, f, l, u), n.restore();
    });
  }
  renderMarkers(n, e, t, i, s, r) {
    this.state.markers.size !== 0 && this.state.markers.forEach((o) => {
      if (!o?.center || !o?.size) return;
      const { center: a, size: l, text: u } = o, d = (a.x - i.x) * t, f = (a.z - i.z) * t;
      n.save();
      const h = l.x * t, g = l.z * t, v = e / 2 - d - h / 2, y = e / 2 - f - g / 2;
      n.shadowColor = "rgba(0, 0, 0, 0.6)", n.shadowBlur = 4, n.shadowOffsetX = 2, n.shadowOffsetY = 2, n.fillStyle = "rgba(0,0,0,0.3)", n.fillRect(v, y, h, g), n.shadowColor = "transparent", n.strokeStyle = "rgba(255, 255, 255, 0.3)", n.lineWidth = 1, n.strokeRect(v, y, h, g), u && (n.save(), n.fillStyle = "white", n.font = "bold 12px sans-serif", n.shadowColor = "rgba(0, 0, 0, 0.8)", n.shadowBlur = 2, n.translate(v + h / 2, y + g / 2), r || n.rotate(-s * Math.PI / 180), n.textAlign = "center", n.textBaseline = "middle", n.fillText(u, 0, 0), n.restore()), n.restore();
    });
  }
  renderAvatar(n, e) {
    if (n.save(), !this.state.gradientCache.avatar) {
      const t = n.createRadialGradient(e / 2, e / 2, 0, e / 2, e / 2, 12);
      t.addColorStop(0, "#01fff7"), t.addColorStop(0.7, "#01fff7"), t.addColorStop(1, "transparent"), this.state.gradientCache.avatar = t;
    }
    n.fillStyle = this.state.gradientCache.avatar, n.beginPath(), n.arc(e / 2, e / 2, 12, 0, Math.PI * 2), n.fill(), n.fillStyle = "#01fff7", n.shadowColor = "0 0 10px rgba(1,255,247,0.7)", n.shadowBlur = 8, n.beginPath(), n.arc(e / 2, e / 2, 6, 0, Math.PI * 2), n.fill(), n.shadowColor = "transparent", n.strokeStyle = "rgba(255, 255, 255, 0.8)", n.lineWidth = 2, n.beginPath(), n.moveTo(e / 2, e / 2), n.lineTo(e / 2, e / 2 - 12), n.stroke(), n.restore();
  }
  // AbstractSystem의 추상 메서드 구현
  performUpdate(n) {
  }
  updateMetrics(n) {
    this.metrics.markerCount = this.state.markers.size, this.metrics.frameTime = n;
  }
  onDispose() {
    this.clear(), this.listeners.clear(), this.state.canvas = null, this.state.ctx = null, Le.instance = null;
  }
};
Uc(Le, "instance", null);
Le = Fc([
  An("minimap"),
  Qt({ autoStart: !1 })
], Le);
class vs {
  state;
  minimapSystem;
  listeners = /* @__PURE__ */ new Set();
  constructor() {
    this.state = {
      minimapVisible: !0,
      hudVisible: !0,
      tooltipText: "",
      tooltipPosition: new b.Vector2(0, 0),
      tooltipVisible: !1,
      modalVisible: !1,
      modalContent: null,
      notifications: [],
      lastUpdate: Date.now()
    }, this.minimapSystem = Le.getInstance();
  }
  getState() {
    return { ...this.state };
  }
  execute(e) {
    switch (e.type) {
      case "showTooltip":
        this.state.tooltipText = e.text, this.state.tooltipPosition = e.position, this.state.tooltipVisible = !0;
        break;
      case "hideTooltip":
        this.state.tooltipVisible = !1, this.state.tooltipText = "";
        break;
      case "showModal":
        this.state.modalVisible = !0, this.state.modalContent = e.content;
        break;
      case "hideModal":
        this.state.modalVisible = !1, this.state.modalContent = null;
        break;
      case "toggleMinimap":
        this.state.minimapVisible = !this.state.minimapVisible;
        break;
      case "toggleHUD":
        this.state.hudVisible = !this.state.hudVisible;
        break;
      case "addNotification":
        this.state.notifications.push({
          id: e.id,
          message: e.message,
          type: e.notificationType || "info",
          timestamp: Date.now()
        });
        break;
      case "removeNotification":
        this.state.notifications = this.state.notifications.filter(
          (t) => t.id !== e.id
        );
        break;
      case "addMinimapMarker":
        this.minimapSystem.addMarker(
          e.id,
          e.markerType,
          e.text,
          e.position,
          e.size
        );
        break;
      case "removeMinimapMarker":
        this.minimapSystem.removeMarker(e.id);
        break;
      case "updateMinimapMarker":
        this.minimapSystem.updateMarker(e.id, e.updates);
        break;
      default:
        console.warn("Unknown UI command:", e);
    }
    this.state.lastUpdate = Date.now(), this.notifyListeners();
  }
  subscribe(e) {
    return this.listeners.add(e), () => this.listeners.delete(e);
  }
  notifyListeners() {
    this.listeners.forEach((e) => e());
  }
  dispose() {
    this.listeners.clear(), this.minimapSystem.clear();
  }
  getMetrics() {
    return {
      notificationCount: this.state.notifications.length,
      isMinimapVisible: this.state.minimapVisible,
      isHudVisible: this.state.hudVisible,
      isTooltipVisible: this.state.tooltipVisible,
      isModalVisible: this.state.modalVisible,
      lastUpdate: this.state.lastUpdate
    };
  }
}
const $c = 5, Vc = 0.5, Wc = 20, Bc = 200, qc = (n) => {
  const { activeState: e } = Xe(), t = de((m) => m.tileGroups), i = C(/* @__PURE__ */ new Map()), s = C(Le.getInstance()), {
    scale: r = $c,
    blockRotate: o = !1,
    updateInterval: a = 33
  } = n, l = C(null), [u, d] = q(r), f = !!(e.position && n);
  z(() => {
    const m = l.current;
    return m && s.current.setCanvas(m), () => {
      s.current.setCanvas(null);
    };
  }, []);
  const h = _(() => {
    n.blockScale || d((m) => Math.min(Wc, m + 0.1));
  }, [n.blockScale]), g = _(() => {
    n.blockScale || d((m) => Math.max(Vc, m - 0.1));
  }, [n.blockScale]), v = _(
    (m) => {
      n.blockScale || (m.preventDefault(), m.deltaY < 0 ? h() : g());
    },
    [n.blockScale, h, g]
  ), y = _(() => {
    const m = l.current;
    if (!m) return;
    const x = (M) => {
      n.blockScale || (M.preventDefault(), M.deltaY < 0 ? h() : g());
    };
    return m.addEventListener("wheel", x, { passive: !1 }), () => {
      m.removeEventListener("wheel", x);
    };
  }, [n.blockScale, h, g]), p = _(() => {
    const { position: m, euler: x } = e;
    !m || !x || s.current.render({
      size: Bc,
      scale: u,
      position: m,
      rotation: x.y,
      blockRotate: o,
      tileGroups: t,
      sceneObjects: i.current
    });
  }, [e, u, o, t]);
  return z(() => {
    if (!f) return;
    const m = setInterval(() => {
      const { position: x, euler: M } = e;
      x && M && (s.current.checkForUpdates(x, M.y), p());
    }, a);
    return () => {
      clearInterval(m);
    };
  }, [p, a, f, e]), z(() => {
    p();
  }, [u, p]), {
    canvasRef: l,
    scale: u,
    upscale: h,
    downscale: g,
    handleWheel: v,
    setupWheelListener: y,
    updateCanvas: p,
    isReady: f
  };
};
function Hc({
  playerPosition: n,
  offset: e
}) {
  const t = C(null), i = C(new b.Vector3()), s = C(new b.Vector3()), r = C(new b.Vector3()), o = C(!1);
  return Ke((a, l) => {
    if (!t.current) return;
    const u = r.current;
    if (u.set(
      n.x + e.x,
      n.y + e.y,
      n.z + e.z
    ), !o.current) {
      t.current.position.copy(u), i.current.copy(u), s.current.copy(u), o.current = !0;
      return;
    }
    u.distanceTo(s.current) > 0.05 && s.current.copy(u);
    const f = 1 - Math.exp(-8 * l), h = i.current, g = s.current;
    h.lerp(g, f), h.distanceTo(g) < 1e-3 && h.copy(g), t.current.position.copy(h);
  }), t;
}
const bs = 200;
function xu({
  scale: n = 5,
  minScale: e = 0.5,
  maxScale: t = 20,
  blockScale: i = !1,
  blockScaleControl: s = !1,
  blockRotate: r = !1,
  angle: o = 0,
  minimapStyle: a,
  scaleStyle: l,
  plusMinusStyle: u,
  position: d = "top-right",
  showZoom: f = !0,
  showCompass: h = !0,
  markers: g = []
}) {
  const { canvasRef: v, scale: y, upscale: p, downscale: m, handleWheel: x } = qc({
    blockScale: i,
    blockRotate: r
  }), M = d ? `minimap--${d}` : "";
  return /* @__PURE__ */ c.jsxs("div", { className: `minimap ${M}`, style: a, children: [
    /* @__PURE__ */ c.jsx(
      "canvas",
      {
        ref: v,
        className: "minimap__canvas",
        width: bs,
        height: bs,
        onWheel: x
      }
    ),
    h && /* @__PURE__ */ c.jsx("div", { className: "minimap__compass", children: /* @__PURE__ */ c.jsx("div", { style: { transform: `rotate(${o}deg)` }, children: "N" }) }),
    g.map((P, I) => /* @__PURE__ */ c.jsx(
      "div",
      {
        className: `minimap__marker minimap__marker--${P.type || "normal"}`,
        style: {
          left: `${P.x}%`,
          top: `${P.y}%`
        },
        children: P.label && /* @__PURE__ */ c.jsx("div", { className: "minimap__marker-label", children: P.label })
      },
      P.id || I
    )),
    f && !s && /* @__PURE__ */ c.jsx("div", { className: "minimap__controls", style: l, children: /* @__PURE__ */ c.jsxs("div", { className: "minimap__zoom-controls", children: [
      /* @__PURE__ */ c.jsx(
        "button",
        {
          className: "minimap__control-button",
          onClick: p,
          disabled: y >= t,
          style: u,
          children: "+"
        }
      ),
      /* @__PURE__ */ c.jsx(
        "button",
        {
          className: "minimap__control-button",
          onClick: m,
          disabled: y <= e,
          style: u,
          children: "-"
        }
      )
    ] }) })
  ] });
}
function Qc({
  id: n,
  position: e,
  size: t = [2, 2, 2],
  text: i = "",
  type: s = "normal",
  children: r
}) {
  return z(() => {
    const o = Le.getInstance(), a = Array.isArray(e) ? e : [e.x, e.y, e.z], l = Array.isArray(t) ? t : [t.x, t.y, t.z];
    return o.addMarker(
      n,
      s,
      i || "",
      new b.Vector3(a[0], a[1], a[2]),
      new b.Vector3(l[0], l[1], l[2])
    ), () => {
      o.removeMarker(n);
    };
  }, [n, e, t, s, i]), /* @__PURE__ */ c.jsx(c.Fragment, { children: r });
}
function wu({
  id: n,
  position: e,
  size: t,
  label: i,
  children: s
}) {
  return /* @__PURE__ */ c.jsx(Qc, { id: n, position: e, size: t, text: i, type: "ground", children: s });
}
function xs(n, e, t, i, s, r) {
  n.beginPath(), n.moveTo(e + r, t), n.lineTo(e + i - r, t), n.quadraticCurveTo(e + i, t, e + i, t + r), n.lineTo(e + i, t + s - r), n.quadraticCurveTo(e + i, t + s, e + i - r, t + s), n.lineTo(e + r, t + s), n.quadraticCurveTo(e, t + s, e, t + s - r), n.lineTo(e, t + r), n.quadraticCurveTo(e, t, e + r, t), n.closePath();
}
function Jc(n, e, t, i, s, r, o, a = 8, l = "#000000") {
  n.fillStyle = o, xs(n, e, t, i, s, r), n.fill(), n.strokeStyle = l, n.lineWidth = a;
  const u = a / 2;
  xs(n, e + u, t + u, i - a, s - a, r), n.stroke();
}
function Zc({
  text: n,
  backgroundColor: e,
  textColor: t,
  fontSize: i,
  padding: s,
  borderRadius: r,
  borderWidth: o,
  borderColor: a,
  maxWidth: l
}) {
  try {
    const u = String(n || "안녕"), d = Math.max(Math.floor(i ?? 120), 40), f = Math.max(Math.floor(s ?? 30), 15), h = 512, g = 256, v = document.createElement("canvas");
    v.width = h, v.height = g;
    const y = v.getContext("2d", { alpha: !0 }) ?? v.getContext("2d");
    if (!y)
      return console.error("Cannot get 2D context"), null;
    y.clearRect(0, 0, h, g);
    const p = f, m = f, x = h - f * 2, M = g - f * 2;
    Jc(
      y,
      p,
      m,
      x,
      M,
      r ?? 80,
      e ?? "rgba(255, 255, 255, 0.95)",
      o ?? 12,
      a ?? "#000000"
    );
    const P = "Arial Black, Arial, sans-serif";
    y.fillStyle = t ?? "#000000", y.font = `bold ${d}px ${P}`, y.textAlign = "center", y.textBaseline = "middle";
    const I = Math.max(10, Math.min(x - f * 2, l)), k = y.measureText(u).width;
    if (k > I) {
      const D = I / k, J = Math.max(12, Math.floor(d * D));
      y.font = `bold ${J}px ${P}`;
    }
    y.fillText(u, h / 2, g / 2);
    const R = new b.CanvasTexture(v);
    return R.needsUpdate = !0, R.flipY = !0, R.generateMipmaps = !1, R.minFilter = b.LinearFilter, R.magFilter = b.LinearFilter, R.wrapS = b.ClampToEdgeWrapping, R.wrapT = b.ClampToEdgeWrapping, {
      texture: R,
      width: h,
      height: g,
      cleanup: () => {
        try {
          R.dispose();
        } catch (D) {
          console.warn("Error disposing texture:", D);
        }
      }
    };
  } catch (u) {
    return console.error("Error creating text texture:", u), null;
  }
}
function cr({
  text: n,
  position: e = new b.Vector3(0, 2, 0),
  offset: t,
  backgroundColor: i,
  textColor: s,
  fontSize: r,
  padding: o,
  borderRadius: a,
  borderWidth: l,
  borderColor: u,
  maxWidth: d,
  visible: f = !0,
  opacity: h = 1,
  children: g
}) {
  const { camera: v } = un(), y = C(0), p = C(0), m = mc(($) => $.config.speechBalloon), x = t || new b.Vector3(m.defaultOffset.x, m.defaultOffset.y, m.defaultOffset.z), M = Hc({
    playerPosition: e,
    offset: x
  }), [P, I] = Ze.useState(null), k = C(null);
  Ze.useEffect(() => {
    if (k.current?.cleanup && (k.current.cleanup(), k.current = null), !f || !m.enabled) {
      I(null);
      return;
    }
    const $ = n && n.trim().length > 0 ? n.trim() : "안녕", D = Zc({
      text: $,
      backgroundColor: i ?? m.backgroundColor,
      textColor: s ?? m.textColor,
      fontSize: r ?? m.fontSize,
      padding: o ?? m.padding,
      borderRadius: a ?? m.borderRadius,
      borderWidth: l ?? m.borderWidth,
      borderColor: u ?? m.borderColor,
      maxWidth: d ?? m.maxWidth
    });
    return D && (k.current = D, I(D)), () => {
      k.current?.cleanup && (k.current.cleanup(), k.current = null);
    };
  }, [
    n,
    i ?? m.backgroundColor,
    s ?? m.textColor,
    r ?? m.fontSize,
    o ?? m.padding,
    a ?? m.borderRadius,
    l ?? m.borderWidth,
    u ?? m.borderColor,
    d ?? m.maxWidth,
    f,
    m.enabled
  ]);
  const R = ne(() => P?.texture ? new b.SpriteMaterial({
    map: P.texture,
    transparent: !0,
    opacity: Math.max(0, Math.min(1, h || 1)),
    depthTest: !1,
    // 항상 보이도록
    depthWrite: !1,
    alphaTest: 0.1
  }) : null, [P, h]);
  return Ze.useEffect(() => {
    if (M.current && P) {
      const $ = m.scaleMultiplier;
      M.current.scale.set($ * 2, $, 1), y.current = 0;
    }
  }, [P, m.scaleMultiplier]), Ke(() => {
    if (!(!M.current || !P || !f) && (p.current++, p.current % 30 === 0))
      try {
        const $ = M.current.position, D = v.position.distanceTo($);
        if (Math.abs(D - y.current) > 5) {
          const W = m.scaleMultiplier;
          M.current.scale.set(W * 2, W, 1), y.current = D;
        }
      } catch ($) {
        console.warn("Error in sprite scaling:", $);
      }
  }), z(() => () => {
    R && R.dispose();
  }, [R]), !f || !P?.texture || !R ? null : /* @__PURE__ */ c.jsxs("group", { children: [
    /* @__PURE__ */ c.jsx(
      "sprite",
      {
        ref: M,
        material: R,
        renderOrder: 1e3,
        frustumCulled: !1
      }
    ),
    g
  ] });
}
var Kc = Object.defineProperty, Yc = Object.getOwnPropertyDescriptor, Ee = (n, e, t, i) => {
  for (var s = i > 1 ? void 0 : i ? Yc(e, t) : e, r = n.length - 1, o; r >= 0; r--)
    (o = n[r]) && (s = (i ? o(e, t, s) : o(s)) || s);
  return i && s && Kc(e, t, s), s;
};
let Re = class extends qt {
  constructor() {
    super(), this.register("main", new vs()), this.setupEngineSubscriptions();
  }
  setupEngineSubscriptions() {
    this.engines.forEach((n) => {
      n.subscribe(() => {
        this.notifyListeners("main");
      });
    });
  }
  buildEngine() {
    return new vs();
  }
  executeCommand(n, e) {
    n.execute(e);
  }
  createSnapshot(n) {
    const e = n.getState();
    return {
      minimapVisible: e.minimapVisible,
      hudVisible: e.hudVisible,
      tooltipVisible: e.tooltipVisible,
      modalVisible: e.modalVisible,
      notificationCount: e.notifications.length,
      lastUpdate: e.lastUpdate
    };
  }
  showTooltip(n, e) {
    this.execute("main", { type: "showTooltip", text: n, position: e });
  }
  hideTooltip() {
    this.execute("main", { type: "hideTooltip" });
  }
  showModal(n) {
    this.execute("main", { type: "showModal", content: n });
  }
  hideModal() {
    this.execute("main", { type: "hideModal" });
  }
  toggleMinimap() {
    this.execute("main", { type: "toggleMinimap" });
  }
  toggleHUD() {
    this.execute("main", { type: "toggleHUD" });
  }
  addNotification(n, e, t) {
    this.execute("main", {
      type: "addNotification",
      id: n,
      message: e,
      notificationType: t || "info"
    });
  }
  removeNotification(n) {
    this.execute("main", { type: "removeNotification", id: n });
  }
  addMinimapMarker(n, e, t, i, s) {
    this.execute("main", {
      type: "addMinimapMarker",
      id: n,
      markerType: e,
      text: t,
      position: i,
      size: s
    });
  }
  removeMinimapMarker(n) {
    this.execute("main", { type: "removeMinimapMarker", id: n });
  }
  updateMinimapMarker(n, e) {
    this.execute("main", { type: "updateMinimapMarker", id: n, updates: e });
  }
  getUIMetrics() {
    const n = this.getEngine("main");
    return n ? n.getMetrics() : null;
  }
  execute(n, e) {
    super.execute(n, e);
  }
  snapshot(n) {
    return super.snapshot(n);
  }
};
Ee([
  Ns("ui"),
  Ht()
], Re.prototype, "executeCommand", 1);
Ee([
  bt(),
  jt(16)
], Re.prototype, "createSnapshot", 1);
Ee([
  ze()
], Re.prototype, "showTooltip", 1);
Ee([
  ze()
], Re.prototype, "hideTooltip", 1);
Ee([
  ze()
], Re.prototype, "showModal", 1);
Ee([
  ze()
], Re.prototype, "hideModal", 1);
Ee([
  ze()
], Re.prototype, "toggleMinimap", 1);
Ee([
  ze()
], Re.prototype, "toggleHUD", 1);
Ee([
  ze()
], Re.prototype, "addNotification", 1);
Ee([
  ze()
], Re.prototype, "removeNotification", 1);
Ee([
  ze()
], Re.prototype, "addMinimapMarker", 1);
Ee([
  ze()
], Re.prototype, "removeMinimapMarker", 1);
Ee([
  ze()
], Re.prototype, "updateMinimapMarker", 1);
Ee([
  ze()
], Re.prototype, "getUIMetrics", 1);
Ee([
  bt(),
  jt(16)
], Re.prototype, "snapshot", 1);
Re = Ee([
  Zt("ui"),
  bi()
], Re);
class vn {
  available = [];
  inUse = /* @__PURE__ */ new Set();
  createFn;
  resetFn;
  config;
  constructor(e, t, i = {}) {
    this.createFn = e, this.resetFn = t, this.config = {
      initialSize: 10,
      maxSize: 100,
      growthRate: 2,
      ...i
    }, this.initialize();
  }
  initialize() {
    for (let e = 0; e < this.config.initialSize; e++)
      this.available.push(this.createFn());
  }
  acquire() {
    if (this.available.length === 0) {
      if (this.available.length + this.inUse.size >= this.config.maxSize)
        throw new Error(`ObjectPool: Maximum size ${this.config.maxSize} reached`);
      if (this.grow(), this.available.length === 0) {
        const i = this.createFn();
        return this.inUse.add(i), i;
      }
    }
    const e = this.available.pop();
    return this.inUse.add(e), e;
  }
  release(e) {
    this.inUse.has(e) && (this.resetFn(e), this.inUse.delete(e), this.available.push(e));
  }
  grow() {
    const e = this.available.length + this.inUse.size;
    if (e >= this.config.maxSize) return;
    const t = Math.min(
      Math.ceil(e * (this.config.growthRate - 1)),
      this.config.maxSize - e
    );
    for (let i = 0; i < t; i++)
      this.available.push(this.createFn());
  }
  clear() {
    this.available = [], this.inUse.clear();
  }
  get stats() {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.available.length + this.inUse.size
    };
  }
}
class Ft {
  static instance;
  vector3Pool;
  quaternionPool;
  eulerPool;
  matrix4Pool;
  constructor() {
    this.vector3Pool = new vn(
      () => new b.Vector3(),
      (e) => e.set(0, 0, 0),
      { initialSize: 20, maxSize: 200 }
    ), this.quaternionPool = new vn(
      () => new b.Quaternion(),
      (e) => e.set(0, 0, 0, 1),
      { initialSize: 10, maxSize: 100 }
    ), this.eulerPool = new vn(
      () => new b.Euler(),
      (e) => e.set(0, 0, 0),
      { initialSize: 10, maxSize: 100 }
    ), this.matrix4Pool = new vn(
      () => new b.Matrix4(),
      (e) => e.identity(),
      { initialSize: 5, maxSize: 50 }
    );
  }
  static getInstance() {
    return Ft.instance || (Ft.instance = new Ft()), Ft.instance;
  }
  acquireVector3() {
    return this.vector3Pool.acquire();
  }
  releaseVector3(e) {
    this.vector3Pool.release(e);
  }
  acquireQuaternion() {
    return this.quaternionPool.acquire();
  }
  releaseQuaternion(e) {
    this.quaternionPool.release(e);
  }
  acquireEuler() {
    return this.eulerPool.acquire();
  }
  releaseEuler(e) {
    this.eulerPool.release(e);
  }
  acquireMatrix4() {
    return this.matrix4Pool.acquire();
  }
  releaseMatrix4(e) {
    this.matrix4Pool.release(e);
  }
  withVector3(e) {
    const t = this.acquireVector3();
    try {
      return e(t);
    } finally {
      this.releaseVector3(t);
    }
  }
  withQuaternion(e) {
    const t = this.acquireQuaternion();
    try {
      return e(t);
    } finally {
      this.releaseQuaternion(t);
    }
  }
  withEuler(e) {
    const t = this.acquireEuler();
    try {
      return e(t);
    } finally {
      this.releaseEuler(t);
    }
  }
  withMatrix4(e) {
    const t = this.acquireMatrix4();
    try {
      return e(t);
    } finally {
      this.releaseMatrix4(t);
    }
  }
  getStats() {
    return {
      vector3: this.vector3Pool.stats,
      quaternion: this.quaternionPool.stats,
      euler: this.eulerPool.stats,
      matrix4: this.matrix4Pool.stats
    };
  }
  clear() {
    this.vector3Pool.clear(), this.quaternionPool.clear(), this.eulerPool.clear(), this.matrix4Pool.clear();
  }
}
Ft.getInstance();
var Xc = Object.defineProperty, el = Object.getOwnPropertyDescriptor, it = (n, e, t, i) => {
  for (var s = el(e, t), r = n.length - 1, o; r >= 0; r--)
    (o = n[r]) && (s = o(e, t, s) || s);
  return s && Xc(e, t, s), s;
};
const tl = "1.0.0", Nt = "gaesup_world_save_";
class st {
  version;
  constructor() {
    this.version = tl;
  }
  // 5초 타임아웃
  async save(e, t, i = {}) {
    try {
      const s = {
        version: this.version,
        timestamp: Date.now(),
        world: this.filterWorldData(e, i),
        ...t ? {
          metadata: {
            ...t,
            createdAt: t.createdAt || Date.now(),
            updatedAt: Date.now()
          }
        } : {}
      };
      return i.compress ? await this.saveCompressed(s) : await this.saveUncompressed(s);
    } catch (s) {
      return {
        success: !1,
        error: s instanceof Error ? s.message : "Unknown error occurred"
      };
    }
  }
  async load(e, t = {}) {
    try {
      const i = `${Nt}${e}`, s = localStorage.getItem(i);
      if (!s)
        throw new Error(`Save data not found: ${e}`);
      let r;
      if (s.startsWith("{") ? r = JSON.parse(s) : r = await this.decompressData(s), !this.validateSaveData(r))
        throw new Error("Invalid save data format");
      return {
        success: !0,
        data: {
          ...r,
          world: this.filterWorldData(r.world, t)
        }
      };
    } catch (i) {
      return {
        success: !1,
        error: i instanceof Error ? i.message : "Failed to load save data"
      };
    }
  }
  async saveToFile(e, t, i, s = {}) {
    try {
      const r = await this.save(e, i, s);
      if (!r.success || !r.data)
        return r;
      const o = new Blob(
        [JSON.stringify(r.data, null, 2)],
        { type: "application/json" }
      ), a = URL.createObjectURL(o), l = document.createElement("a");
      return l.href = a, l.download = t.endsWith(".json") ? t : `${t}.json`, document.body.appendChild(l), l.click(), document.body.removeChild(l), URL.revokeObjectURL(a), { success: !0, data: r.data };
    } catch (r) {
      return {
        success: !1,
        error: r instanceof Error ? r.message : "Failed to save file"
      };
    }
  }
  async loadFromFile(e, t = {}) {
    try {
      const i = await e.text(), s = JSON.parse(i);
      if (!this.validateSaveData(s))
        throw new Error("Invalid save file format");
      return {
        success: !0,
        data: {
          ...s,
          world: this.filterWorldData(s.world, t)
        }
      };
    } catch (i) {
      return {
        success: !1,
        error: i instanceof Error ? i.message : "Failed to load file"
      };
    }
  }
  listSaves() {
    const e = [];
    for (let t = 0; t < localStorage.length; t++) {
      const i = localStorage.key(t);
      if (i && i.startsWith(Nt))
        try {
          const s = i.substring(Nt.length), r = localStorage.getItem(i);
          if (r) {
            const o = JSON.parse(r);
            e.push({
              id: s,
              timestamp: o.timestamp,
              ...o.metadata ? { metadata: o.metadata } : {}
            });
          }
        } catch (s) {
          console.error(`Failed to parse save: ${i}`, s);
        }
    }
    return e.sort((t, i) => i.timestamp - t.timestamp);
  }
  deleteSave(e) {
    try {
      const t = `${Nt}${e}`;
      return localStorage.removeItem(t), !0;
    } catch (t) {
      return console.error("Failed to delete save:", t), !1;
    }
  }
  filterWorldData(e, t) {
    const i = { ...e };
    return t.includeBuildings === !1 && (i.buildings = {
      wallGroups: [],
      tileGroups: [],
      meshes: []
    }), t.includeNPCs === !1 && (i.npcs = []), t.includeEnvironment === !1 && (i.environment = {
      lighting: {
        ambientIntensity: 1,
        directionalIntensity: 1,
        directionalPosition: { x: 0, y: 10, z: 0 }
      }
    }), t.includeCamera === !1 && delete i.camera, i;
  }
  async saveUncompressed(e) {
    const t = `${e.world.id}_${e.timestamp}`, i = `${Nt}${t}`;
    try {
      return localStorage.setItem(i, JSON.stringify(e)), { success: !0, data: e };
    } catch (s) {
      throw s instanceof Error && s.name === "QuotaExceededError" ? new Error("Storage quota exceeded. Please delete some saves.") : s;
    }
  }
  async saveCompressed(e) {
    const t = await this.compressData(e), i = `${e.world.id}_${e.timestamp}`, s = `${Nt}${i}`;
    try {
      return localStorage.setItem(s, t), { success: !0, data: e };
    } catch (r) {
      throw r instanceof Error && r.name === "QuotaExceededError" ? new Error("Storage quota exceeded. Please delete some saves.") : r;
    }
  }
  async compressData(e) {
    const t = JSON.stringify(e), s = new TextEncoder().encode(t);
    return btoa(String.fromCharCode(...s));
  }
  async decompressData(e) {
    const t = atob(e), i = new Uint8Array(t.split("").map((o) => o.charCodeAt(0))), r = new TextDecoder().decode(i);
    return JSON.parse(r);
  }
  validateSaveData(e) {
    return e !== null && typeof e == "object" && "version" in e && "timestamp" in e && "world" in e && typeof e.version == "string" && typeof e.timestamp == "number" && e.world && typeof e.world.id == "string" && typeof e.world.name == "string";
  }
}
it([
  G(),
  F(),
  Es(5e3)
], st.prototype, "save");
it([
  G(),
  F(),
  Es(5e3)
], st.prototype, "load");
it([
  G(),
  F()
], st.prototype, "saveToFile");
it([
  G(),
  F()
], st.prototype, "loadFromFile");
it([
  Jt(10)
], st.prototype, "listSaves");
it([
  G()
], st.prototype, "deleteSave");
it([
  F()
], st.prototype, "filterWorldData");
it([
  G()
], st.prototype, "saveUncompressed");
it([
  G()
], st.prototype, "saveCompressed");
it([
  F()
], st.prototype, "compressData");
it([
  F()
], st.prototype, "decompressData");
_n(function({
  object: e,
  isSelected: t,
  onSelect: i,
  showDebugInfo: s = !1,
  enableInteraction: r = !0
}) {
  const o = Xs(), a = e.metadata?.modelUrl, l = typeof a == "string" ? a : void 0, u = _(() => {
    r && e.interactable && i && i(e.id);
  }, [r, e.interactable, e.id, i]), d = _((h) => {
    r && e.interactable && (h.stopPropagation(), document.body.style.cursor = "pointer");
  }, [r, e.interactable]), f = _(() => {
    document.body.style.cursor = "default";
  }, []);
  return l ? /* @__PURE__ */ c.jsx(
    Un,
    {
      url: l,
      isActive: !1,
      componentType: e.type,
      name: `passive-${e.type}-${e.id}`,
      position: e.position,
      rotation: e.rotation,
      scale: e.scale,
      ref: o.rigidBodyRef,
      outerGroupRef: o.outerGroupRef,
      innerGroupRef: o.innerGroupRef,
      colliderRef: o.colliderRef,
      userData: {
        id: e.id,
        type: "passive",
        subType: e.type,
        interactable: e.interactable,
        onNear: e.metadata?.onNear,
        onLeave: e.metadata?.onLeave,
        onInteract: e.metadata?.onInteract
      },
      onCollisionEnter: () => {
        r && e.interactable && i && i(e.id);
      },
      children: t && s && /* @__PURE__ */ c.jsxs("mesh", { position: [0, 3, 0], children: [
        /* @__PURE__ */ c.jsx("boxGeometry", { args: [0.5, 0.5, 0.5] }),
        /* @__PURE__ */ c.jsx("meshStandardMaterial", { color: "#00ff00", transparent: !0, opacity: 0.6 })
      ] })
    }
  ) : /* @__PURE__ */ c.jsxs(
    $t,
    {
      type: "fixed",
      position: e.position,
      rotation: e.rotation,
      colliders: !1,
      children: [
        /* @__PURE__ */ c.jsx(yi, { args: [1, 0.5], position: [0, 1, 0] }),
        /* @__PURE__ */ c.jsx(
          "group",
          {
            scale: e.scale,
            onClick: u,
            onPointerEnter: d,
            onPointerLeave: f
          }
        )
      ]
    }
  );
});
function nl({ children: n, showGrid: e, showAxes: t }) {
  return /* @__PURE__ */ c.jsxs("group", { name: "gaesup-world", children: [
    e && /* @__PURE__ */ c.jsx("gridHelper", { args: [100, 100, "#888888", "#444444"] }),
    t && /* @__PURE__ */ c.jsx("axesHelper", { args: [10] }),
    n
  ] });
}
function il(n) {
  const e = Y((r) => r.setMode), t = Y((r) => r.setUrls), i = Y((r) => r.setCameraOption);
  z(() => {
    n.mode && e(n.mode);
  }, [n.mode, e]);
  const s = ne(() => {
    if (!n.urls) return null;
    const r = Object.entries(n.urls).filter(([, l]) => l !== void 0);
    if (r.length === 0) return null;
    const o = Object.fromEntries(r), a = { ...o };
    return typeof o.character == "string" && !o.characterUrl && (a.characterUrl = o.character), typeof o.vehicle == "string" && !o.vehicleUrl && (a.vehicleUrl = o.vehicle), typeof o.airplane == "string" && !o.airplaneUrl && (a.airplaneUrl = o.airplane), delete a.character, delete a.vehicle, delete a.airplane, a;
  }, [n.urls]);
  return z(() => {
    s && t(s);
  }, [s, t]), z(() => {
    n.cameraOption && i(n.cameraOption);
  }, [n.cameraOption, i]), n.children;
}
function sl({ children: n, showGrid: e, showAxes: t }) {
  return /* @__PURE__ */ c.jsxs(Tn, { fallback: null, children: [
    /* @__PURE__ */ c.jsx(Qa, {}),
    /* @__PURE__ */ c.jsx(nl, { showGrid: e ?? !1, showAxes: t ?? !1, children: n })
  ] });
}
function rl({
  type: n = "normal",
  text: e,
  position: t,
  children: i,
  interactive: s = !0,
  showMinimap: r = !0
}) {
  const o = C(null), a = Ys(), l = ne(() => `world-prop-${Date.now()}-${Math.random()}`, []), u = C({
    center: new b.Vector3(),
    size: new b.Vector3(),
    positionAdd: new b.Vector3()
  });
  return z(() => {
    if (!r || !o.current) return;
    const d = Le.getInstance(), h = setTimeout(() => {
      const g = o.current;
      if (!g) return;
      const v = new b.Box3();
      if (v.setFromObject(g), !v.isEmpty()) {
        const { center: y, size: p, positionAdd: m } = u.current;
        v.getCenter(y), v.getSize(p), t && (m.set(t[0], t[1], t[2]), y.add(m)), d.addMarker(
          l,
          n,
          e || "",
          y.clone(),
          // Clone only when passing to engine
          p.clone()
          // Clone only when passing to engine
        );
      }
    }, 100);
    return () => {
      clearTimeout(h), d.removeMarker(l);
    };
  }, [t, n, e, r, l]), /* @__PURE__ */ c.jsxs(
    "group",
    {
      ref: o,
      ...t ? { position: t } : {},
      onClick: (d) => {
        s && (d.stopPropagation(), a.onClick(d));
      },
      children: [
        i,
        e && /* @__PURE__ */ c.jsx("group", { position: [0, 2, 0], children: /* @__PURE__ */ c.jsx("sprite", { scale: [2, 0.5, 1], children: /* @__PURE__ */ c.jsx(
          "spriteMaterial",
          {
            color: "#ffffff",
            transparent: !0,
            opacity: 0.8
          }
        ) }) })
      ]
    }
  );
}
class ol {
  availableConnections = [];
  activeConnections = /* @__PURE__ */ new Map();
  connectionIdCounter = 1;
  maxPoolSize;
  defaultOptions;
  constructor(e = 50, t) {
    this.maxPoolSize = e, this.defaultOptions = {
      timeout: 3e4,
      retries: 3,
      bandwidth: 1e3,
      encryption: !1,
      ...t
    };
  }
  // 새 연결 생성
  createConnection(e, t, i) {
    const s = { ...this.defaultOptions, ...i };
    return {
      id: `conn_${this.connectionIdCounter++}`,
      nodeA: e,
      nodeB: t,
      strength: 1,
      latency: Math.random() * 50 + 10,
      // 10-60ms
      bandwidth: s.bandwidth,
      status: "establishing",
      lastActivity: Date.now()
    };
  }
  // 연결 가져오기 또는 생성
  getConnection(e, t, i) {
    const s = { ...this.defaultOptions, ...i }, r = this.availableConnections.pop();
    if (r)
      return r.nodeA = e, r.nodeB = t, r.status = "establishing", r.strength = 1, r.latency = 0, r.bandwidth = s.bandwidth, r.lastActivity = Date.now(), this.activeConnections.set(r.id, r), r;
    const o = this.createConnection(e, t, i);
    return this.activeConnections.set(o.id, o), o;
  }
  // 연결 해제 및 풀로 반환
  releaseConnection(e) {
    const t = this.activeConnections.get(e);
    return t ? (this.activeConnections.delete(e), this.resetConnection(t), this.availableConnections.length < this.maxPoolSize && this.availableConnections.push(t), !0) : !1;
  }
  // 연결 상태 리셋
  resetConnection(e) {
    e.nodeA = "", e.nodeB = "", e.status = "disconnected", e.strength = 0, e.latency = 0, e.lastActivity = 0;
  }
  // 활성 연결 가져오기
  getActiveConnection(e) {
    return this.activeConnections.get(e) || null;
  }
  // 두 노드 간 활성 연결 찾기
  findActiveConnection(e, t) {
    for (const i of this.activeConnections.values())
      if (i.nodeA === e && i.nodeB === t || i.nodeA === t && i.nodeB === e)
        return i;
    return null;
  }
  // 연결 상태 업데이트
  updateConnectionStatus(e, t) {
    const i = this.activeConnections.get(e);
    return i ? (i.status = t, i.lastActivity = Date.now(), !0) : !1;
  }
  // 연결 성능 업데이트
  updateConnectionMetrics(e, t) {
    const i = this.activeConnections.get(e);
    return i ? (t.latency !== void 0 && (i.latency = t.latency), t.bandwidth !== void 0 && (i.bandwidth = t.bandwidth), t.strength !== void 0 && (i.strength = t.strength), i.lastActivity = Date.now(), !0) : !1;
  }
  // 오래된 연결 정리
  cleanupInactiveConnections(e = 3e5) {
    const t = Date.now();
    let i = 0;
    const s = [];
    for (const [r, o] of this.activeConnections.entries())
      t - o.lastActivity > e && s.push(r);
    for (const r of s)
      this.releaseConnection(r) && i++;
    return i;
  }
  // 풀 통계 정보
  getPoolStats() {
    const e = this.availableConnections.length, t = this.activeConnections.size, i = e + t, s = i > 0 ? t / i : 0;
    return {
      available: e,
      active: t,
      total: i,
      maxSize: this.maxPoolSize,
      utilizationRate: s
    };
  }
  // 풀 비우기
  clear() {
    this.activeConnections.clear(), this.availableConnections = [], this.connectionIdCounter = 1;
  }
  // 특정 노드의 모든 연결 해제
  disconnectNode(e) {
    let t = 0;
    const i = [];
    for (const [s, r] of this.activeConnections.entries())
      (r.nodeA === e || r.nodeB === e) && i.push(s);
    return i.forEach((s) => {
      this.releaseConnection(s), t++;
    }), t;
  }
  // 풀 설정 업데이트
  updatePoolSettings(e, t) {
    for (this.maxPoolSize = Math.max(0, e), t && (this.defaultOptions = { ...this.defaultOptions, ...t }); this.availableConnections.length > this.maxPoolSize; )
      this.availableConnections.pop();
  }
}
class sn {
  queues = /* @__PURE__ */ new Map();
  maxSize;
  batchSize;
  enableBatching;
  totalSize = 0;
  static prioritiesLowToHigh = [
    "low",
    "normal",
    "high",
    "critical"
  ];
  static prioritiesHighToLow = [
    "critical",
    "high",
    "normal",
    "low"
  ];
  constructor(e = 1e3, t = 10, i = !0) {
    this.maxSize = Math.max(1, e), this.batchSize = t, this.enableBatching = i;
  }
  getOrCreateQueue(e) {
    const t = this.queues.get(e);
    if (t) return t;
    const i = { items: [], head: 0 };
    return this.queues.set(e, i), i;
  }
  getQueueSizeInternal(e) {
    return e.items.length - e.head;
  }
  compactQueueIfNeeded(e) {
    if (e.head !== 0) {
      if (e.head >= e.items.length) {
        e.items = [], e.head = 0;
        return;
      }
      e.head > 64 && e.head * 2 >= e.items.length && (e.items = e.items.slice(e.head), e.head = 0);
    }
  }
  shiftOne(e) {
    if (this.getQueueSizeInternal(e) <= 0) return null;
    const t = e.items[e.head] ?? null;
    return e.head += 1, this.totalSize = Math.max(0, this.totalSize - 1), this.compactQueueIfNeeded(e), t;
  }
  // 메시지를 우선순위별 큐에 추가
  enqueue(e) {
    const t = e.priority;
    for (; this.totalSize >= this.maxSize; )
      if (!this.evictOne(t)) return !1;
    return this.getOrCreateQueue(t).items.push(e), this.totalSize += 1, !0;
  }
  // 현재 우선순위보다 낮은 큐에서 가장 오래된 항목 1개 제거
  evictOne(e) {
    const t = sn.prioritiesLowToHigh, i = t.indexOf(e);
    for (let r = 0; r < i; r++) {
      const o = t[r];
      if (!o) continue;
      const a = this.queues.get(o);
      if (a && this.shiftOne(a))
        return !0;
    }
    const s = this.queues.get(e);
    return !!(s && this.shiftOne(s));
  }
  // 우선순위에 따라 메시지 처리
  dequeue() {
    for (const e of sn.prioritiesHighToLow) {
      const t = this.queues.get(e);
      if (!t) continue;
      const i = this.shiftOne(t);
      if (i) return i;
    }
    return null;
  }
  // 배치 처리용 여러 메시지 가져오기
  dequeueBatch() {
    if (!this.enableBatching) {
      const t = this.dequeue();
      return t ? [t] : [];
    }
    const e = [];
    for (const t of sn.prioritiesHighToLow) {
      if (e.length >= this.batchSize) break;
      const i = this.queues.get(t);
      if (!i) continue;
      const s = this.batchSize - e.length, r = this.getQueueSizeInternal(i), o = Math.min(s, r);
      for (let a = 0; a < o; a++) {
        const l = this.shiftOne(i);
        if (!l) break;
        e.push(l);
      }
    }
    return e;
  }
  // 특정 우선순위 큐 크기
  getQueueSize(e) {
    const t = this.queues.get(e);
    return t ? this.getQueueSizeInternal(t) : 0;
  }
  // 전체 큐 크기
  getTotalSize() {
    return this.totalSize;
  }
  // 큐 비우기
  clear() {
    this.queues.clear(), this.totalSize = 0;
  }
  // 특정 메시지 찾기
  findMessage(e) {
    for (const t of this.queues.values())
      for (let i = t.head; i < t.items.length; i++) {
        const s = t.items[i];
        if (s && s.id === e) return s;
      }
    return null;
  }
  // 특정 메시지 제거
  removeMessage(e) {
    for (const t of this.queues.values())
      for (let i = t.head; i < t.items.length; i++) {
        const s = t.items[i];
        if (!(!s || s.id !== e))
          return i === t.head ? (this.shiftOne(t), !0) : (t.items.splice(i, 1), this.totalSize = Math.max(0, this.totalSize - 1), this.compactQueueIfNeeded(t), !0);
      }
    return !1;
  }
  // 배치 설정 업데이트
  updateBatchSettings(e, t) {
    this.batchSize = Math.max(1, e), this.enableBatching = t;
  }
  // 큐 최대 크기 업데이트
  updateMaxSize(e) {
    for (this.maxSize = Math.max(1, e); this.totalSize > this.maxSize && this.evictOne("critical"); )
      ;
  }
  // 큐 통계 정보
  getStats() {
    const e = {};
    for (const [t, i] of this.queues.entries())
      e[t] = this.getQueueSizeInternal(i);
    return {
      totalMessages: this.getTotalSize(),
      queueSizes: e,
      maxSize: this.maxSize,
      batchSize: this.batchSize,
      enableBatching: this.enableBatching
    };
  }
}
class al {
  nodes = /* @__PURE__ */ new Map();
  groups = /* @__PURE__ */ new Map();
  eventCallbacks = /* @__PURE__ */ new Map();
  performanceMetrics;
  proximityRange;
  maxDistance;
  groupIdCounter = 1;
  maxMessageQueueSize;
  gridCellSize;
  grid = /* @__PURE__ */ new Map();
  nodeCellKey = /* @__PURE__ */ new Map();
  scratchNearbyNodeIds = /* @__PURE__ */ new Set();
  scratchDisconnectIds = [];
  scratchCenter = new b.Vector3();
  constructor(e = 50, t = 100, i = 200) {
    this.proximityRange = e, this.maxDistance = t, this.maxMessageQueueSize = i, this.gridCellSize = Math.max(1, e), this.performanceMetrics = {
      messagesProcessed: 0,
      averageLatency: 0,
      bandwidth: 0,
      connectionCount: 0,
      errorRate: 0,
      lastUpdate: Date.now()
    };
  }
  // NPC 노드 등록
  registerNode(e, t, i) {
    const s = `node_${e}`;
    if (this.nodes.has(s))
      throw new Error(`Node ${s} is already registered`);
    const r = {
      id: s,
      npcId: e,
      position: t.clone(),
      connections: /* @__PURE__ */ new Set(),
      messageQueue: [],
      lastUpdate: Date.now(),
      status: "active",
      communicationRange: i?.communicationRange || this.proximityRange,
      signalStrength: i?.signalStrength || 1
    };
    return this.nodes.set(s, r), this.addToGrid(s, r.position), this.emitEvent({
      type: "nodeConnected",
      nodeId: s,
      data: { npcId: e, position: t },
      timestamp: Date.now()
    }), r;
  }
  // NPC 노드 제거
  unregisterNode(e) {
    const t = `node_${e}`;
    return this.nodes.get(t) ? (this.disconnectAllConnections(t), this.leaveAllGroups(t), this.nodes.delete(t), this.removeFromGrid(t), this.emitEvent({
      type: "nodeDisconnected",
      nodeId: t,
      data: { npcId: e },
      timestamp: Date.now()
    }), !0) : !1;
  }
  // 노드 위치 업데이트
  updateNodePosition(e, t) {
    const i = `node_${e}`, s = this.nodes.get(i);
    return s ? (s.position.copy(t), s.lastUpdate = Date.now(), this.updateGridPosition(i, s.position), this.updateProximityConnections(i), !0) : !1;
  }
  // 두 노드 간 직접 연결
  connectNodes(e, t) {
    const i = `node_${e}`, s = `node_${t}`, r = this.nodes.get(i), o = this.nodes.get(s);
    if (!r || !o)
      return !1;
    const a = this.maxDistance * this.maxDistance;
    return r.position.distanceToSquared(o.position) > a ? !1 : (r.connections.add(s), o.connections.add(i), this.performanceMetrics.connectionCount = this.getTotalConnections(), !0);
  }
  // 두 노드 간 연결 해제
  disconnectNodes(e, t) {
    const i = `node_${e}`, s = `node_${t}`, r = this.nodes.get(i), o = this.nodes.get(s);
    return !r || !o ? !1 : (r.connections.delete(s), o.connections.delete(i), this.performanceMetrics.connectionCount = this.getTotalConnections(), !0);
  }
  // 노드의 모든 연결 해제
  disconnectAllConnections(e) {
    const t = this.nodes.get(e);
    if (t) {
      for (const i of t.connections) {
        const s = this.nodes.get(i);
        s && s.connections.delete(e);
      }
      t.connections.clear();
    }
  }
  // 근접 기반 자동 연결 업데이트
  updateProximityConnections(e) {
    const t = this.nodes.get(e);
    if (!t) return;
    const i = (o, a) => {
      const l = Math.min(o.communicationRange, a.communicationRange);
      return o.position.distanceToSquared(a.position) <= l * l;
    }, s = this.scratchDisconnectIds;
    s.length = 0;
    for (const o of t.connections) {
      const a = this.nodes.get(o);
      if (!a) {
        s.push(o);
        continue;
      }
      i(t, a) || s.push(o);
    }
    for (const o of s) {
      t.connections.delete(o);
      const a = this.nodes.get(o);
      a && a.connections.delete(e);
    }
    const r = this.getNearbyNodeIds(t, this.scratchNearbyNodeIds);
    for (const o of r) {
      if (e === o || t.connections.has(o)) continue;
      const a = this.nodes.get(o);
      a && i(t, a) && (t.connections.add(o), a.connections.add(e));
    }
  }
  // nodeId 정규화: npcId 또는 nodeId 모두 받아서 nodeId로 통일
  resolveNodeId(e) {
    return e.startsWith("node_") ? e : `node_${e}`;
  }
  getCellKey(e) {
    const t = this.gridCellSize, i = Math.floor(e.x / t), s = Math.floor(e.z / t);
    return `${i},${s}`;
  }
  addToGrid(e, t) {
    const i = this.getCellKey(t), s = this.grid.get(i) ?? /* @__PURE__ */ new Set();
    s.add(e), this.grid.set(i, s), this.nodeCellKey.set(e, i);
  }
  removeFromGrid(e) {
    const t = this.nodeCellKey.get(e);
    if (!t) return;
    const i = this.grid.get(t);
    i && (i.delete(e), i.size === 0 && this.grid.delete(t)), this.nodeCellKey.delete(e);
  }
  updateGridPosition(e, t) {
    const i = this.nodeCellKey.get(e), s = this.getCellKey(t);
    if (i === s) return;
    this.removeFromGrid(e);
    const r = this.grid.get(s) ?? /* @__PURE__ */ new Set();
    r.add(e), this.grid.set(s, r), this.nodeCellKey.set(e, s);
  }
  collectNearbyNodeIdsByPosition(e, t, i) {
    i.clear();
    const s = this.gridCellSize, r = Math.max(1, Math.ceil(Math.max(1, t) / s)), o = Math.floor(e.x / s), a = Math.floor(e.z / s);
    for (let l = -r; l <= r; l++)
      for (let u = -r; u <= r; u++) {
        const d = `${o + l},${a + u}`, f = this.grid.get(d);
        f && f.forEach((h) => i.add(h));
      }
  }
  getNearbyNodeIds(e, t) {
    const i = t ?? /* @__PURE__ */ new Set();
    return this.collectNearbyNodeIdsByPosition(e.position, e.communicationRange, i), i;
  }
  // 노드에 메시지를 추가하되 큐 크기를 제한
  enqueueMessage(e, t) {
    e.messageQueue.length >= this.maxMessageQueueSize && e.messageQueue.shift(), e.messageQueue.push(t);
  }
  // 메시지 전송
  sendMessage(e) {
    return this.nodes.get(this.resolveNodeId(e.from)) ? e.to === "broadcast" ? this.broadcastMessage(e) : e.to === "group" && e.groupId ? this.sendGroupMessage(e) : this.sendDirectMessage(e) : !1;
  }
  // 직접 메시지 전송
  sendDirectMessage(e) {
    const t = e.to.startsWith("node_") ? e.to : `node_${e.to}`, i = this.nodes.get(t);
    if (!i)
      return !1;
    this.enqueueMessage(i, e);
    const s = Date.now();
    return this.performanceMetrics.messagesProcessed++, this.performanceMetrics.lastUpdate = s, this.emitEvent({
      type: "messageReceived",
      nodeId: t,
      data: e,
      timestamp: s
    }), !0;
  }
  // 브로드캐스트 메시지 전송
  broadcastMessage(e) {
    let t = 0;
    const i = this.resolveNodeId(e.from);
    for (const r of this.nodes.values()) {
      if (r.id === i) continue;
      const o = {
        ...e,
        to: r.id
      };
      this.enqueueMessage(r, o), t++;
    }
    const s = Date.now();
    return this.performanceMetrics.messagesProcessed += t, this.performanceMetrics.lastUpdate = s, t > 0;
  }
  // 그룹 메시지 전송
  sendGroupMessage(e) {
    if (!e.groupId) return !1;
    const t = this.groups.get(e.groupId);
    if (!t) return !1;
    let i = 0;
    const s = this.resolveNodeId(e.from);
    for (const o of t.members) {
      if (o === s) continue;
      const a = this.nodes.get(o);
      if (a) {
        const l = {
          ...e,
          to: o
        };
        this.enqueueMessage(a, l), i++;
      }
    }
    const r = Date.now();
    return this.performanceMetrics.messagesProcessed += i, this.performanceMetrics.lastUpdate = r, i > 0;
  }
  // 노드의 메시지 가져오기
  getMessages(e) {
    const t = `node_${e}`, i = this.nodes.get(t);
    if (!i)
      return [];
    const s = [...i.messageQueue];
    return i.messageQueue = [], s;
  }
  // 그룹 생성
  createGroup(e, t) {
    const i = `group_${this.groupIdCounter++}`, s = {
      id: i,
      type: e,
      members: /* @__PURE__ */ new Set(),
      maxMembers: t?.maxMembers || (e === "party" ? 8 : e === "guild" ? 100 : 20),
      range: t?.range || (e === "proximity" ? 30 : 1e3),
      persistent: t?.persistent !== void 0 ? t.persistent : e === "guild",
      createdAt: Date.now(),
      lastActivity: Date.now()
    };
    return this.groups.set(i, s), s;
  }
  // 그룹 참여
  joinGroup(e, t) {
    const i = `node_${e}`, s = this.nodes.get(i), r = this.groups.get(t);
    return !s || !r || r.members.size >= r.maxMembers ? !1 : (r.members.add(i), r.lastActivity = Date.now(), this.emitEvent({
      type: "groupJoined",
      nodeId: i,
      data: { groupId: t },
      timestamp: Date.now()
    }), !0);
  }
  // 그룹 탈퇴
  leaveGroup(e, t) {
    const i = `node_${e}`, s = this.groups.get(t);
    return !s || !s.members.has(i) ? !1 : (s.members.delete(i), s.lastActivity = Date.now(), !s.persistent && s.members.size === 0 && this.groups.delete(t), this.emitEvent({
      type: "groupLeft",
      nodeId: i,
      data: { groupId: t },
      timestamp: Date.now()
    }), !0);
  }
  // 노드의 모든 그룹 탈퇴
  leaveAllGroups(e) {
    for (const [t, i] of this.groups.entries())
      i.members.has(e) && (i.members.delete(e), !i.persistent && i.members.size === 0 && this.groups.delete(t));
  }
  // 근접 그룹 자동 참여
  updateProximityGroups() {
    const e = this.scratchCenter, t = this.scratchNearbyNodeIds;
    for (const i of this.groups.values()) {
      if (i.type !== "proximity" || i.members.size === 0 || i.range <= 0) continue;
      let s = 0, r = 0, o = 0, a = 0;
      for (const u of i.members) {
        const d = this.nodes.get(u);
        d && (s += d.position.x, r += d.position.y, o += d.position.z, a += 1);
      }
      if (a === 0) continue;
      e.set(s / a, r / a, o / a), this.collectNearbyNodeIdsByPosition(e, i.range, t);
      const l = i.range * i.range;
      for (const u of t) {
        if (i.members.size >= i.maxMembers) break;
        if (i.members.has(u)) continue;
        const d = this.nodes.get(u);
        if (!d) continue;
        const f = d.position.x - e.x, h = d.position.y - e.y, g = d.position.z - e.z;
        f * f + h * h + g * g <= l && i.members.add(u);
      }
    }
  }
  // 이벤트 리스너 등록
  addEventListener(e, t) {
    this.eventCallbacks.has(e) || this.eventCallbacks.set(e, []), this.eventCallbacks.get(e).push(t);
  }
  // 이벤트 리스너 제거
  removeEventListener(e, t) {
    const i = this.eventCallbacks.get(e);
    if (i) {
      const s = i.indexOf(t);
      s !== -1 && i.splice(s, 1);
    }
  }
  // 이벤트 발생
  emitEvent(e) {
    const t = this.eventCallbacks.get(e.type);
    t && t.forEach((i) => {
      try {
        i(e);
      } catch (s) {
        console.error("Error in event callback:", s);
      }
    });
  }
  // 총 연결 수 계산
  getTotalConnections() {
    let e = 0;
    for (const t of this.nodes.values())
      e += t.connections.size;
    return e / 2;
  }
  // 성능 메트릭 가져오기
  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }
  // 노드 정보 가져오기
  getNode(e) {
    const t = `node_${e}`;
    return this.nodes.get(t) || null;
  }
  // 모든 노드 가져오기
  getAllNodes() {
    return Array.from(this.nodes.values());
  }
  // Map을 array로 만들지 않고 순회
  forEachNode(e) {
    for (const t of this.nodes.values()) e(t);
  }
  // 그룹 정보 가져오기
  getGroup(e) {
    return this.groups.get(e) || null;
  }
  // 모든 그룹 가져오기
  getAllGroups() {
    return Array.from(this.groups.values());
  }
  // Map을 array로 만들지 않고 순회
  forEachGroup(e) {
    for (const t of this.groups.values()) e(t);
  }
  // 매니저 초기화
  clear() {
    this.nodes.clear(), this.groups.clear(), this.eventCallbacks.clear(), this.grid.clear(), this.nodeCellKey.clear(), this.performanceMetrics = {
      messagesProcessed: 0,
      averageLatency: 0,
      bandwidth: 0,
      connectionCount: 0,
      errorRate: 0,
      lastUpdate: Date.now()
    }, this.groupIdCounter = 1;
  }
  // 설정 업데이트
  updateSettings(e, t) {
    e !== void 0 && (this.proximityRange = Math.max(0, e)), t !== void 0 && (this.maxDistance = Math.max(0, t));
  }
  // 네트워크 통계 정보
  getNetworkStats() {
    const e = this.nodes.size, t = this.getTotalConnections(), i = this.groups.size, s = e > 0 ? t / e : 0;
    let r = 0;
    for (const o of this.nodes.values())
      r += o.messageQueue.length;
    return {
      nodeCount: e,
      connectionCount: t,
      groupCount: i,
      averageConnections: s,
      totalMessages: r
    };
  }
}
class cl {
  state;
  npcManager;
  messageQueue;
  connectionPool;
  config;
  lastCleanupTime = 0;
  lastStatsUpdateAt = 0;
  updateTimer;
  scratchNodeIds = /* @__PURE__ */ new Set();
  scratchGroupIds = /* @__PURE__ */ new Set();
  scratchRemoveIds = [];
  messageQueueSig = /* @__PURE__ */ new Map();
  constructor(e) {
    this.config = { ...e }, this.npcManager = new al(e.proximityRange, e.maxDistance), this.messageQueue = new sn(e.messageQueueSize, e.batchSize, e.enableBatching), this.connectionPool = new ol(e.connectionPoolSize), this.state = {
      nodes: /* @__PURE__ */ new Map(),
      connections: /* @__PURE__ */ new Map(),
      groups: /* @__PURE__ */ new Map(),
      messageQueues: /* @__PURE__ */ new Map(),
      stats: {
        totalNodes: 0,
        activeConnections: 0,
        messagesPerSecond: 0,
        averageLatency: 0,
        bandwidth: 0,
        lastUpdate: Date.now()
      },
      isRunning: !1,
      lastUpdate: Date.now()
    };
  }
  // 시스템 시작
  start() {
    this.state.isRunning || (this.state.isRunning = !0, this.lastCleanupTime = Date.now(), this.startUpdateLoop());
  }
  // 시스템 정지
  stop() {
    this.state.isRunning && (this.state.isRunning = !1, this.updateTimer && (clearTimeout(this.updateTimer), this.updateTimer = void 0));
  }
  // 업데이트 루프 시작
  startUpdateLoop() {
    this.updateTimer && clearTimeout(this.updateTimer);
    const e = Math.max(1, this.config.updateFrequency), t = Math.max(1, Math.floor(1e3 / e));
    let i = Date.now() + t;
    const s = () => {
      if (!this.state.isRunning) return;
      this.update();
      const r = Date.now();
      i += t, i < r && (i = r + t);
      const o = Math.max(0, i - Date.now());
      this.updateTimer = setTimeout(s, o);
    };
    this.updateTimer = setTimeout(s, t);
  }
  // 시스템 업데이트
  update() {
    if (!this.state.isRunning) return;
    const e = Date.now();
    this.processMessageBatch(), this.npcManager.updateProximityGroups(), e - this.lastCleanupTime >= this.config.connectionTimeout && (this.connectionPool.cleanupInactiveConnections(this.config.connectionTimeout), this.lastCleanupTime = e), this.updateStatistics(e), this.syncState(), this.state.lastUpdate = e;
  }
  // 메시지 배치 처리
  processMessageBatch() {
    const e = this.messageQueue.dequeueBatch();
    for (const t of e)
      try {
        this.npcManager.sendMessage(t);
      } catch (i) {
        console.error("Error processing message:", i);
      }
  }
  // 통계 업데이트
  updateStatistics(e) {
    const t = Math.max(0, this.config.debugUpdateInterval ?? 250);
    if (t > 0 && e - this.lastStatsUpdateAt < t)
      return;
    this.lastStatsUpdateAt = e;
    const i = this.npcManager.getNetworkStats(), s = this.npcManager.getPerformanceMetrics();
    this.state.stats = {
      totalNodes: i.nodeCount,
      activeConnections: i.connectionCount,
      messagesPerSecond: this.calculateMessagesPerSecond(s),
      averageLatency: s.averageLatency,
      bandwidth: s.bandwidth,
      lastUpdate: e
    };
  }
  // 초당 메시지 수 계산
  calculateMessagesPerSecond(e) {
    const t = (Date.now() - e.lastUpdate) / 1e3, i = Math.max(1e-3, t);
    return e.messagesProcessed / i;
  }
  // 상태 동기화
  syncState() {
    const e = this.scratchNodeIds;
    e.clear(), this.npcManager.forEachNode((s) => {
      e.add(s.id), this.state.nodes.set(s.id, s);
    });
    const t = this.scratchRemoveIds;
    t.length = 0;
    for (const s of this.state.nodes.keys())
      e.has(s) || t.push(s);
    for (const s of t) this.state.nodes.delete(s);
    const i = this.scratchGroupIds;
    i.clear(), this.npcManager.forEachGroup((s) => {
      i.add(s.id), this.state.groups.set(s.id, s);
    }), t.length = 0;
    for (const s of this.state.groups.keys())
      i.has(s) || t.push(s);
    for (const s of t) this.state.groups.delete(s);
    for (const s of e) {
      const r = this.state.nodes.get(s);
      if (!r || r.messageQueue.length === 0) {
        this.state.messageQueues.delete(s), this.messageQueueSig.delete(s);
        continue;
      }
      const o = r.messageQueue, a = o[o.length - 1]?.id ?? null, l = this.messageQueueSig.get(s);
      l && l.len === o.length && l.tailId === a || (l ? (l.len = o.length, l.tailId = a) : this.messageQueueSig.set(s, { len: o.length, tailId: a }), this.state.messageQueues.set(s, o.slice()));
    }
    t.length = 0;
    for (const s of this.state.messageQueues.keys())
      e.has(s) || t.push(s);
    for (const s of t)
      this.state.messageQueues.delete(s), this.messageQueueSig.delete(s);
  }
  // 명령 실행
  executeCommand(e) {
    try {
      switch (e.type) {
        case "registerNPC":
          return this.registerNPC(e.npcId, e.position, e.options), !0;
        case "unregisterNPC":
          return this.unregisterNPC(e.npcId);
        case "updateNPCPosition":
          return this.updateNPCPosition(e.npcId, e.position);
        case "connect":
          return this.npcManager.connectNodes(e.npcId, e.targetId);
        case "disconnect":
          return e.targetId ? this.npcManager.disconnectNodes(e.npcId, e.targetId) : this.npcManager.unregisterNode(e.npcId);
        case "sendMessage":
          return this.messageQueue.enqueue(e.message), !0;
        case "broadcast":
          const t = {
            ...e.message,
            to: "broadcast"
          };
          return this.messageQueue.enqueue(t), !0;
        case "joinGroup":
          return this.npcManager.joinGroup(e.npcId, e.groupId);
        case "leaveGroup":
          return this.npcManager.leaveGroup(e.npcId, e.groupId);
        case "createGroup":
          return !!this.npcManager.createGroup(e.group.type, {
            maxMembers: e.group.maxMembers,
            range: e.group.range,
            persistent: e.group.persistent
          });
        case "updateSettings":
          return this.updateConfig(e.settings), !0;
        case "updateConfig":
          return this.updateConfig(e.data.config), !0;
        case "startMonitoring":
          return !0;
        case "stopMonitoring":
          return !0;
        default:
          return console.warn("Unknown network command:", e), !1;
      }
    } catch (t) {
      return console.error("Error executing network command:", t), !1;
    }
  }
  // 스냅샷 생성
  createSnapshot() {
    return {
      nodeCount: this.state.stats.totalNodes,
      connectionCount: this.state.stats.activeConnections,
      activeGroups: this.state.groups.size,
      messagesPerSecond: this.state.stats.messagesPerSecond,
      averageLatency: this.state.stats.averageLatency,
      lastUpdate: this.state.lastUpdate
    };
  }
  // 설정 업데이트
  updateConfig(e) {
    this.config = { ...this.config, ...e }, (e.messageQueueSize || e.batchSize || e.enableBatching) && (this.messageQueue.updateBatchSettings(
      this.config.batchSize,
      this.config.enableBatching
    ), this.messageQueue.updateMaxSize(this.config.messageQueueSize)), e.connectionPoolSize && this.connectionPool.updatePoolSettings(this.config.connectionPoolSize), (e.proximityRange || e.maxDistance) && this.npcManager.updateSettings(this.config.proximityRange, this.config.maxDistance), e.updateFrequency && this.state.isRunning && this.startUpdateLoop();
  }
  // NPC 등록
  registerNPC(e, t, i) {
    return this.npcManager.registerNode(e, t, i);
  }
  // NPC 제거
  unregisterNPC(e) {
    return this.npcManager.unregisterNode(e);
  }
  // NPC 위치 업데이트
  updateNPCPosition(e, t) {
    return this.npcManager.updateNodePosition(e, t);
  }
  // 메시지 가져오기
  getMessages(e) {
    return this.npcManager.getMessages(e);
  }
  // 시스템 상태 가져오기
  getState() {
    return { ...this.state };
  }
  // 설정 가져오기
  getConfig() {
    return { ...this.config };
  }
  // 시스템 정리
  dispose() {
    this.stop(), this.npcManager.clear(), this.messageQueue.clear(), this.connectionPool.clear(), this.state.nodes.clear(), this.state.connections.clear(), this.state.groups.clear(), this.state.messageQueues.clear();
  }
  // 이벤트 리스너 등록
  addEventListener(e, t) {
    this.npcManager.addEventListener(e, t);
  }
  // 이벤트 리스너 제거
  removeEventListener(e, t) {
    this.npcManager.removeEventListener(e, t);
  }
  // 디버그 정보
  getDebugInfo() {
    return {
      isRunning: this.state.isRunning,
      config: this.config,
      stats: this.state.stats,
      networkStats: this.npcManager.getNetworkStats(),
      performanceMetrics: this.npcManager.getPerformanceMetrics(),
      poolStats: this.connectionPool.getPoolStats(),
      messageQueueStats: this.messageQueue.getStats()
    };
  }
}
class lr {
  ws = null;
  url;
  roomId;
  playerName;
  playerColor;
  players = /* @__PURE__ */ new Map();
  localPlayerId = null;
  isConnected = !1;
  isConnecting = !1;
  logLevel;
  logToConsole;
  reconnectAttemptsMax;
  reconnectDelayMs;
  reconnectAttemptsUsed = 0;
  reconnectTimer = null;
  shouldReconnect = !1;
  pingIntervalMs;
  pingTimer = null;
  lastPingSentAt = 0;
  updateRateLimitMs;
  lastUpdateSentAt = 0;
  pendingUpdate = null;
  updateFlushTimer = null;
  offlineQueueSize;
  pendingChats = [];
  // Optional app-level ACK (server must echo Ack for dedupe/retry).
  enableAck;
  reliableTimeoutMs;
  reliableRetryCount;
  ackIdCounter = 1;
  pendingAcks = /* @__PURE__ */ new Map();
  // 콜백 함수들
  onConnect;
  onDisconnect;
  onWelcome;
  onPlayerJoin;
  onPlayerUpdate;
  onPlayerLeave;
  onChat;
  onPing;
  onReliableFailed;
  onError;
  constructor(e) {
    this.url = e.url, this.roomId = e.roomId, this.playerName = e.playerName, this.playerColor = e.playerColor, this.reconnectAttemptsMax = Math.max(0, Math.floor(e.reconnectAttempts ?? 0)), this.reconnectDelayMs = Math.max(0, Math.floor(e.reconnectDelay ?? 1e3)), this.pingIntervalMs = Math.max(0, Math.floor(e.pingInterval ?? 0)), this.updateRateLimitMs = Math.max(0, Math.floor(e.sendRateLimit ?? 0)), this.offlineQueueSize = Math.max(0, Math.floor(e.offlineQueueSize ?? 50)), this.enableAck = !!e.enableAck, this.reliableTimeoutMs = Math.max(0, Math.floor(e.reliableTimeout ?? 5e3)), this.reliableRetryCount = Math.max(0, Math.floor(e.reliableRetryCount ?? 0)), this.logLevel = e.logLevel ?? "none", this.logToConsole = e.logToConsole ?? !1, e.onConnect && (this.onConnect = e.onConnect), e.onDisconnect && (this.onDisconnect = e.onDisconnect), e.onWelcome && (this.onWelcome = e.onWelcome), e.onPlayerJoin && (this.onPlayerJoin = e.onPlayerJoin), e.onPlayerUpdate && (this.onPlayerUpdate = e.onPlayerUpdate), e.onPlayerLeave && (this.onPlayerLeave = e.onPlayerLeave), e.onChat && (this.onChat = e.onChat), e.onPing && (this.onPing = e.onPing), e.onReliableFailed && (this.onReliableFailed = e.onReliableFailed), e.onError && (this.onError = e.onError);
  }
  shouldLog(e) {
    if (!this.logToConsole) return !1;
    const t = {
      none: 0,
      error: 1,
      warn: 2,
      info: 3,
      debug: 4
    };
    return t[e] <= t[this.logLevel];
  }
  debug(e, ...t) {
    this.shouldLog("debug") && console.log(e, ...t);
  }
  info(e, ...t) {
    this.shouldLog("info") && console.info(e, ...t);
  }
  warn(e, ...t) {
    this.shouldLog("warn") && console.warn(e, ...t);
  }
  error(e, ...t) {
    this.shouldLog("error") && console.error(e, ...t);
  }
  getConnectionStatus() {
    return this.isConnected;
  }
  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.warn("[PlayerNetworkManager] Already connected");
      return;
    }
    if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
      this.warn("[PlayerNetworkManager] Already connecting");
      return;
    }
    if (this.isConnecting) {
      this.warn("[PlayerNetworkManager] Already connecting");
      return;
    }
    this.shouldReconnect = this.reconnectAttemptsMax > 0, this.clearReconnectTimer(), this.isConnecting = !0, this.info("[PlayerNetworkManager] Connecting WebSocket", this.url);
    let e;
    try {
      e = new WebSocket(this.url);
    } catch {
      this.isConnecting = !1, this.isConnected = !1, this.onError?.("WebSocket 연결 실패");
      return;
    }
    this.ws = e, e.onopen = () => {
      this.info("[PlayerNetworkManager] WebSocket connected"), this.isConnected = !0, this.isConnecting = !1, this.reconnectAttemptsUsed = 0, this.startPingLoop(), e.send(JSON.stringify({
        type: "Join",
        room_id: this.roomId,
        name: this.playerName,
        color: this.playerColor
      })), this.flushOfflineQueue(), this.resumePendingAcks(), this.onConnect && this.onConnect();
    }, e.onmessage = (t) => {
      const i = (o) => {
        try {
          const a = JSON.parse(o);
          this.handleServerMessage(a);
        } catch {
          this.onError?.("서버 메시지 파싱 실패");
        }
      }, s = t.data;
      if (typeof s == "string") {
        i(s);
        return;
      }
      const r = s;
      if (r && typeof r.text == "function") {
        r.text().then((o) => i(o)).catch(() => this.onError?.("서버 메시지 수신 실패"));
        return;
      }
      if (s instanceof ArrayBuffer)
        try {
          const o = new TextDecoder().decode(new Uint8Array(s));
          i(o);
        } catch {
          this.onError?.("서버 메시지 디코딩 실패");
        }
    }, e.onerror = (t) => {
      this.error("[PlayerNetworkManager] WebSocket error", t), this.isConnected = !1, this.isConnecting = !1, this.onError && this.onError("WebSocket 연결 에러");
    }, e.onclose = (t) => {
      this.info("[PlayerNetworkManager] WebSocket closed", { code: t.code, reason: t.reason });
      const i = this.isConnected || this.isConnecting;
      this.isConnected = !1, this.isConnecting = !1, this.stopPingLoop(), this.pausePendingAcks(), this.players.clear(), this.localPlayerId = null, this.onDisconnect && this.onDisconnect(), (t.code === 1e3 || t.code === 1001) && (this.shouldReconnect = !1), i && this.tryReconnect();
    };
  }
  disconnect() {
    if (this.shouldReconnect = !1, this.clearReconnectTimer(), this.stopPingLoop(), this.clearUpdateFlushTimer(), this.clearAllPendingAcks(!0), !this.ws) {
      this.players.clear(), this.isConnected = !1, this.isConnecting = !1, this.localPlayerId = null, this.onDisconnect?.();
      return;
    }
    const e = this.ws;
    if (e.onopen = null, e.onmessage = null, e.onerror = null, e.onclose = null, e.readyState === WebSocket.OPEN)
      try {
        e.send(JSON.stringify({ type: "Leave" }));
      } catch {
      }
    try {
      e.close();
    } catch {
    }
    this.ws = null, this.players.clear(), this.isConnected = !1, this.isConnecting = !1, this.localPlayerId = null, this.pendingUpdate = null, this.pendingChats = [], this.onDisconnect?.();
  }
  updateLocalPlayer(e) {
    this.pendingUpdate = this.pendingUpdate ? { ...this.pendingUpdate, ...e } : { ...e };
    const t = this.ws;
    if (!t || t.readyState !== WebSocket.OPEN) return;
    const i = Date.now();
    if (this.updateRateLimitMs <= 0 || i - this.lastUpdateSentAt >= this.updateRateLimitMs) {
      this.lastUpdateSentAt = i;
      const r = this.pendingUpdate;
      if (this.pendingUpdate = null, !r) return;
      t.send(JSON.stringify({ type: "Update", state: r }));
      return;
    }
    if (this.updateFlushTimer) return;
    const s = Math.max(0, this.updateRateLimitMs - (i - this.lastUpdateSentAt));
    this.updateFlushTimer = setTimeout(() => {
      this.updateFlushTimer = null;
      const r = this.pendingUpdate;
      r && this.updateLocalPlayer(r);
    }, s);
  }
  sendChat(e, t) {
    const i = String(e ?? "").trim().slice(0, 200);
    if (!i) return;
    const s = this.ws;
    if (!s || s.readyState !== WebSocket.OPEN) {
      if (this.offlineQueueSize <= 0) return;
      this.pendingChats.length >= this.offlineQueueSize && this.pendingChats.shift(), t?.range !== void 0 ? this.pendingChats.push({ text: i, range: t.range }) : this.pendingChats.push({ text: i });
      return;
    }
    const r = {
      type: "Chat",
      text: i,
      ...t?.range !== void 0 ? { range: t.range } : {}
    };
    if (this.enableAck) {
      this.sendReliable(r);
      return;
    }
    s.send(JSON.stringify(r));
  }
  handleServerMessage(e) {
    switch (this.debug("[PlayerNetworkManager] Server message", e.type, e), e.type) {
      case "Ack": {
        typeof e.ackId == "string" && e.ackId && this.ackReceived(e.ackId);
        break;
      }
      case "Pong": {
        if (typeof e.ts == "number" && e.ts > 0) {
          const t = Math.max(0, Date.now() - e.ts);
          this.onPing?.(t);
        } else if (this.lastPingSentAt > 0) {
          const t = Math.max(0, Date.now() - this.lastPingSentAt);
          this.onPing?.(t);
        }
        break;
      }
      case "Welcome":
        if (this.localPlayerId = e.client_id, this.onWelcome?.(this.localPlayerId, e.room_state), e.room_state)
          for (const [t, i] of Object.entries(e.room_state))
            t !== this.localPlayerId && (this.players.set(t, i), this.onPlayerJoin && this.onPlayerJoin(t, i));
        break;
      case "PlayerJoined":
        this.debug("[PlayerNetworkManager] PlayerJoined", e.client_id), e.client_id !== this.localPlayerId && (this.players.set(e.client_id, e.state), this.onPlayerJoin && this.onPlayerJoin(e.client_id, e.state));
        break;
      case "PlayerLeft":
        this.debug("[PlayerNetworkManager] PlayerLeft", e.client_id), this.players.delete(e.client_id), this.onPlayerLeave && this.onPlayerLeave(e.client_id);
        break;
      case "PlayerUpdate":
        this.debug("[PlayerNetworkManager] PlayerUpdate", e.client_id);
        {
          const t = this.players.get(e.client_id);
          if (t) {
            const r = { ...t, ...e.state };
            this.players.set(e.client_id, r), this.onPlayerUpdate?.(e.client_id, r);
            break;
          }
          const i = e.state, s = {
            name: i?.name ?? "Player",
            color: i?.color ?? "#ffffff",
            position: i?.position ?? [0, 0, 0],
            rotation: i?.rotation ?? [1, 0, 0, 0],
            ...i ?? {}
          };
          this.players.set(e.client_id, s), this.onPlayerJoin?.(e.client_id, s), this.onPlayerUpdate?.(e.client_id, s);
        }
        break;
      case "Chat":
        this.onChat?.(e.client_id, e.text, e.timestamp);
        break;
    }
  }
  setCallbacks(e) {
    e.onConnect && (this.onConnect = e.onConnect), e.onDisconnect && (this.onDisconnect = e.onDisconnect), e.onWelcome && (this.onWelcome = e.onWelcome), e.onPlayerJoin && (this.onPlayerJoin = e.onPlayerJoin), e.onPlayerUpdate && (this.onPlayerUpdate = e.onPlayerUpdate), e.onPlayerLeave && (this.onPlayerLeave = e.onPlayerLeave), e.onChat && (this.onChat = e.onChat), e.onPing && (this.onPing = e.onPing), e.onReliableFailed && (this.onReliableFailed = e.onReliableFailed), e.onError && (this.onError = e.onError);
  }
  getPlayers() {
    return new Map(this.players);
  }
  clearReconnectTimer() {
    this.reconnectTimer && (clearTimeout(this.reconnectTimer), this.reconnectTimer = null);
  }
  startPingLoop() {
    this.pingIntervalMs <= 0 || (this.stopPingLoop(), this.pingTimer = setInterval(() => {
      const e = this.ws;
      if (!e || e.readyState !== WebSocket.OPEN) return;
      const t = Date.now();
      this.lastPingSentAt = t;
      try {
        e.send(JSON.stringify({ type: "Ping", ts: t }));
      } catch {
      }
    }, this.pingIntervalMs));
  }
  stopPingLoop() {
    this.pingTimer && (clearInterval(this.pingTimer), this.pingTimer = null);
  }
  clearUpdateFlushTimer() {
    this.updateFlushTimer && (clearTimeout(this.updateFlushTimer), this.updateFlushTimer = null);
  }
  flushOfflineQueue() {
    const e = this.ws;
    if (!(!e || e.readyState !== WebSocket.OPEN)) {
      if (this.pendingChats.length > 0) {
        const t = this.pendingChats;
        this.pendingChats = [];
        for (const i of t)
          try {
            const s = {
              type: "Chat",
              text: i.text,
              ...i.range !== void 0 ? { range: i.range } : {}
            };
            this.enableAck ? this.sendReliable(s) : e.send(JSON.stringify(s));
          } catch {
            this.offlineQueueSize > 0 && (this.pendingChats = t.slice(t.indexOf(i)));
            break;
          }
      }
      if (this.pendingUpdate) {
        const t = this.pendingUpdate;
        this.pendingUpdate = null, this.updateLocalPlayer(t);
      }
    }
  }
  tryReconnect() {
    if (!this.shouldReconnect || this.reconnectAttemptsMax <= 0 || this.reconnectAttemptsUsed >= this.reconnectAttemptsMax || this.isConnecting) return;
    const e = this.reconnectAttemptsUsed + 1, t = this.reconnectDelayMs || 0, i = Math.min(3e4, Math.floor(t * Math.pow(2, this.reconnectAttemptsUsed)));
    this.reconnectAttemptsUsed = e, this.warn("[PlayerNetworkManager] Reconnecting...", { attempt: e, delay: i }), this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null, this.shouldReconnect && this.connect();
    }, i);
  }
  nextAckId() {
    const e = this.ackIdCounter++;
    return `ack_${Date.now()}_${e}`;
  }
  sendReliable(e) {
    const t = this.ws;
    if (!t || t.readyState !== WebSocket.OPEN) return;
    const i = this.nextAckId(), s = String(e.type ?? "Unknown"), r = JSON.stringify({ ...e, ackId: i });
    try {
      t.send(r);
    } catch {
      return;
    }
    this.trackPendingAck({ ackId: i, raw: r, messageType: s });
  }
  trackPendingAck(e) {
    this.enableAck && (this.stopAckTimer(e.ackId), this.pendingAcks.set(e.ackId, {
      raw: e.raw,
      messageType: e.messageType,
      retriesLeft: this.reliableRetryCount,
      timer: null
    }), this.scheduleAckTimeout(e.ackId));
  }
  scheduleAckTimeout(e) {
    if (!this.enableAck) return;
    const t = this.pendingAcks.get(e);
    t && (this.reliableTimeoutMs <= 0 || (t.timer = setTimeout(() => {
      const i = this.pendingAcks.get(e);
      if (!i) return;
      const s = this.ws;
      if (!s || s.readyState !== WebSocket.OPEN) {
        i.timer = null;
        return;
      }
      if (i.retriesLeft <= 0) {
        this.pendingAcks.delete(e), this.onReliableFailed?.({ ackId: e, messageType: i.messageType });
        return;
      }
      i.retriesLeft -= 1;
      try {
        s.send(i.raw);
      } catch {
        i.timer = null;
        return;
      }
      this.scheduleAckTimeout(e);
    }, this.reliableTimeoutMs)));
  }
  stopAckTimer(e) {
    const t = this.pendingAcks.get(e);
    !t || !t.timer || (clearTimeout(t.timer), t.timer = null);
  }
  ackReceived(e) {
    this.pendingAcks.get(e) && (this.stopAckTimer(e), this.pendingAcks.delete(e));
  }
  pausePendingAcks() {
    for (const [e, t] of this.pendingAcks.entries())
      t.timer && (clearTimeout(t.timer), t.timer = null), this.enableAck || this.pendingAcks.delete(e);
  }
  resumePendingAcks() {
    if (!this.enableAck) return;
    const e = this.ws;
    if (!(!e || e.readyState !== WebSocket.OPEN))
      for (const [t, i] of this.pendingAcks.entries()) {
        try {
          e.send(i.raw);
        } catch {
          continue;
        }
        this.scheduleAckTimeout(t);
      }
  }
  clearAllPendingAcks(e) {
    for (const [t, i] of this.pendingAcks.entries())
      i.timer && clearTimeout(i.timer), i.timer = null, e && this.pendingAcks.delete(t);
    e && this.pendingAcks.clear();
  }
}
class ll {
  lastPosition = new b.Vector3();
  lastRotation = new b.Quaternion();
  lastAnimation = "idle";
  velocity = new b.Vector3();
  lastUpdateTime = 0;
  config;
  tempPos = new b.Vector3();
  tempRot = new b.Quaternion();
  tempSendRot = new b.Quaternion();
  tempEuler = new b.Euler();
  baseYaw = null;
  constructor(e) {
    this.config = e;
  }
  trackPosition(e, t, i, s, r) {
    if (!e.current) return null;
    const o = Date.now();
    if (o - this.lastUpdateTime < this.config.sendRateLimit)
      return null;
    const a = e.current.translation(), l = e.current.rotation();
    this.tempPos.set(a.x, a.y, a.z), this.tempRot.set(l.x, l.y, l.z, l.w);
    const u = e.current, d = typeof u.linvel == "function" ? u.linvel() : null;
    if (d)
      this.velocity.set(d.x, d.y, d.z);
    else {
      const $ = (o - this.lastUpdateTime) / 1e3;
      $ > 0 && this.velocity.set(
        (a.x - this.lastPosition.x) / $,
        (a.y - this.lastPosition.y) / $,
        (a.z - this.lastPosition.z) / $
      );
    }
    const f = this.velocity.length(), h = typeof r == "string" ? r.trim() : "", g = this.config.velocityThreshold, v = this.config.velocityThreshold * 0.6, y = this.lastAnimation === "run" ? f < v ? "idle" : "run" : f > g ? "run" : "idle", p = h.length > 0 ? h : y;
    this.tempSendRot.copy(this.tempRot);
    const m = this.velocity.x, x = this.velocity.z;
    if (Math.hypot(m, x) > 0.05) {
      this.baseYaw === null && (this.tempEuler.setFromQuaternion(this.tempRot, "YXZ"), this.baseYaw = this.tempEuler.y + Math.PI);
      const $ = Math.atan2(m, x) + (this.baseYaw ?? 0);
      this.tempEuler.set(0, $, 0, "YXZ"), this.tempSendRot.setFromEuler(this.tempEuler);
    }
    const P = !this.lastPosition.equals(this.tempPos), I = !this.lastRotation.equals(this.tempSendRot), k = this.lastAnimation !== p;
    if (!P && !I && !k)
      return null;
    const R = {
      name: t,
      color: i,
      position: [a.x, a.y, a.z],
      // Quaternion (w, x, y, z)
      rotation: [this.tempSendRot.w, this.tempSendRot.x, this.tempSendRot.y, this.tempSendRot.z],
      animation: p,
      velocity: [this.velocity.x, this.velocity.y, this.velocity.z],
      ...s !== void 0 ? { modelUrl: s } : {}
    };
    return this.lastPosition.copy(this.tempPos), this.lastRotation.copy(this.tempSendRot), this.lastAnimation = p, this.lastUpdateTime = o, R;
  }
  updateConfig(e) {
    this.config = { ...this.config, ...e };
  }
  reset() {
    this.lastPosition.set(0, 0, 0), this.lastRotation.set(0, 0, 0, 1), this.lastAnimation = "idle", this.velocity.set(0, 0, 0), this.lastUpdateTime = 0, this.baseYaw = null;
  }
}
function $n(n = {}) {
  const {
    systemId: e = "main",
    config: t,
    enableAutoUpdate: i = !0
  } = n, s = C(null), [r, o] = q(null), [a, l] = q(!1);
  z(() => {
    s.current || (s.current = Ie.getOrCreate("networks"));
    const v = s.current;
    return v ? (e === "main" ? v.ensureMainEngine() : v.getEngine(e) || v.register(e), t && Object.keys(t).length > 0 && v.execute(e, { type: "updateConfig", data: { config: t } }), o(v), l(!0), () => {
    }) : (o(null), l(!1), () => {
    });
  }, [e, t]), Ke((v, y) => {
    i && s.current && a && s.current.updateSystem(e, y);
  });
  const u = _((v) => {
    s.current && a && s.current.execute(e, v);
  }, [e, a]), d = _(() => s.current && a ? s.current.snapshot(e) : null, [e, a]), f = _(() => s.current && a ? s.current.getNetworkStats(e) : null, [e, a]), h = _(() => s.current && a ? s.current.getSystemState(e) : null, [e, a]), g = _((v) => {
    s.current && a && s.current.updateSystem(e, v);
  }, [e, a]);
  return {
    bridge: r,
    executeCommand: u,
    getSnapshot: d,
    getNetworkStats: f,
    getSystemState: h,
    updateSystem: g,
    isReady: a
  };
}
function Su(n) {
  const { npcId: e, initialOptions: t, ...i } = n, {
    executeCommand: s,
    getSnapshot: r,
    isReady: o
  } = $n(i), a = C(!1), l = C(null), u = C(/* @__PURE__ */ new Set());
  z(() => (o && t && !a.current && d(t), () => {
    a.current && f();
  }), [o, t]);
  const d = _((m) => {
    !o || a.current || (s({
      type: "registerNPC",
      npcId: e,
      position: m.position,
      ...m.connectionRange !== void 0 ? { options: { communicationRange: m.connectionRange } } : {}
    }), a.current = !0, l.current = m.position.clone(), m.autoConnect);
  }, [o, s, e]), f = _(() => {
    !o || !a.current || (s({
      type: "unregisterNPC",
      npcId: e
    }), a.current = !1, l.current = null, u.current.clear());
  }, [o, s, e]), h = _((m) => {
    !o || !a.current || (s({
      type: "updateNPCPosition",
      npcId: e,
      position: m
    }), l.current = m.clone());
  }, [o, s, e]), g = _((m, x) => {
    !o || !a.current || (s({
      type: "connect",
      npcId: e,
      targetId: m
    }), u.current.add(m));
  }, [o, s, e]), v = _((m) => {
    !o || !a.current || (s({
      type: "disconnect",
      npcId: e,
      targetId: m
    }), u.current.delete(m));
  }, [o, s, e]), y = _(() => Array.from(u.current), []), p = _(() => l.current ? l.current.clone() : null, []);
  return {
    // NPC 관리
    registerNPC: d,
    unregisterNPC: f,
    updatePosition: h,
    // 연결 관리
    connectTo: g,
    disconnectFrom: v,
    // 상태 조회
    isRegistered: a.current,
    getConnections: y,
    getPosition: p,
    // 브릿지 기능
    executeCommand: s,
    getSnapshot: r,
    isReady: o
  };
}
function Mu(n) {
  const { senderId: e, onMessageSent: t, ...i } = n, {
    executeCommand: s,
    isReady: r
  } = $n(i), o = 500, [a, l] = q([]), [u, d] = q([]), [f, h] = q([]), g = C(0), v = _((P, I, k = "chat", R) => {
    if (!r) return "";
    const $ = `${e}-${++g.current}-${Date.now()}`, D = Date.now(), J = {
      id: $,
      from: e,
      to: P,
      type: k === "action" || k === "state" || k === "system" ? k : "chat",
      payload: I,
      priority: R?.priority ?? "normal",
      timestamp: D,
      reliability: R?.reliable ? "reliable" : "unreliable",
      ...R?.retries !== void 0 ? { retryCount: R.retries } : {}
    };
    return s({
      type: "sendMessage",
      message: J
    }), d((W) => {
      const Z = [...W, J];
      return Z.length > o ? Z.slice(-o) : Z;
    }), t?.(J), $;
  }, [r, s, e, t]), y = _((P, I = "chat", k) => {
    if (!r) return "";
    const R = `${e}-broadcast-${++g.current}-${Date.now()}`, $ = Date.now(), D = {
      id: R,
      from: e,
      type: I === "action" || I === "state" || I === "system" ? I : "chat",
      payload: P,
      priority: k?.priority ?? "normal",
      timestamp: $,
      reliability: k?.reliable ? "reliable" : "unreliable",
      ...k?.groupId ? { groupId: k.groupId } : {},
      ...k?.retries !== void 0 ? { retryCount: k.retries } : {}
    };
    s({
      type: "broadcast",
      message: D
    });
    const J = { ...D, to: "broadcast" };
    return d((W) => {
      const Z = [...W, J];
      return Z.length > o ? Z.slice(-o) : Z;
    }), t?.(J), R;
  }, [r, s, e, t]), p = _(() => {
    l([]), d([]), h([]);
  }, []), m = _((P) => P ? [...a, ...u].filter(
    (I) => I.from === P || I.to === P || I.from === e && I.to === P || I.to === e && I.from === P
  ).sort((I, k) => I.timestamp - k.timestamp) : [...a, ...u].sort((I, k) => I.timestamp - k.timestamp), [a, u, e]), x = _((P) => [...a, ...u].find((I) => I.id === P) || null, [a, u]), M = _(() => ({
    totalSent: u.length,
    totalReceived: a.length,
    totalPending: f.length,
    averageLatency: 0
  }), [u, a, f]);
  return {
    sendMessage: v,
    broadcastMessage: y,
    receivedMessages: a,
    sentMessages: u,
    pendingMessages: f,
    clearMessages: p,
    getMessageHistory: m,
    getMessageById: x,
    getMessageStats: M,
    isReady: r
  };
}
function Cu(n) {
  const {
    npcId: e,
    onGroupJoined: t,
    onGroupLeft: i,
    onGroupMessage: s,
    onGroupMemberJoined: r,
    onGroupMemberLeft: o,
    ...a
  } = n, {
    executeCommand: l,
    getSystemState: u,
    isReady: d
  } = $n(a), [f, h] = q([]), [g, v] = q([]), [y, p] = q([]), [m, x] = q(/* @__PURE__ */ new Map()), M = C(0), P = C(/* @__PURE__ */ new Map()), I = C(/* @__PURE__ */ new Set()), k = C([]);
  k.current = f;
  const R = C(/* @__PURE__ */ new Set()), $ = C(""), D = C(null), J = 2e3, W = 500;
  z(() => {
    if (!d) return;
    const ee = `node_${e}`, te = setInterval(() => {
      const O = u();
      if (!O) return;
      const ye = Array.from(O.groups.values()), We = ye.map((L) => `${L.id}:${L.members.size}:${L.lastActivity}`).join("|");
      if (We !== $.current) {
        $.current = We, p(ye);
        const L = ye.filter((E) => E.members.has(ee)).map((E) => E.id);
        R.current.clear();
        for (const E of L) R.current.add(E);
        const Q = k.current, X = L.filter((E) => !Q.includes(E)), H = Q.filter((E) => !L.includes(E));
        if ((X.length > 0 || H.length > 0) && (h(L), v(L), D.current = null, X.forEach((E) => {
          const pe = ye.find((ie) => ie.id === E);
          pe && t?.(E, pe);
        }), H.forEach((E) => i?.(E)), H.length > 0)) {
          for (const E of H)
            P.current.delete(E);
          x((E) => {
            const pe = new Map(E);
            for (const ie of H) pe.delete(ie);
            return pe;
          });
        }
        for (const E of ye) {
          const pe = new Set(
            Array.from(E.members).map(
              (ae) => ae.startsWith("node_") ? ae.slice(5) : ae
            )
          ), ie = P.current.get(E.id);
          if (ie) {
            for (const ae of pe)
              ie.has(ae) || r?.(ae, E.id);
            for (const ae of ie)
              pe.has(ae) || o?.(ae, E.id);
          }
          P.current.set(E.id, pe);
        }
      }
      const ce = O.messageQueues.get(ee) ?? [];
      if (ce.length === 0) return;
      const ot = ce[ce.length - 1]?.id ?? null, Ge = D.current;
      if (Ge && Ge === ot) return;
      let T = 0;
      if (Ge) {
        for (let L = ce.length - 1; L >= 0; L--)
          if (ce[L]?.id === Ge) {
            T = L + 1;
            break;
          }
      }
      D.current = ot, !(T >= ce.length) && R.current.size !== 0 && x((L) => {
        const Q = new Map(L), X = /* @__PURE__ */ new Set();
        for (let H = T; H < ce.length; H++) {
          const E = ce[H];
          if (!E || E.to !== "group" || !E.groupId || !R.current.has(E.groupId) || I.current.has(E.id)) continue;
          if (I.current.size >= J) {
            const ae = Array.from(I.current);
            I.current = new Set(ae.slice(ae.length - Math.floor(J / 2)));
          }
          I.current.add(E.id);
          const pe = Q.get(E.groupId), ie = X.has(E.groupId) ? pe ?? [] : pe ? pe.slice() : [];
          X.has(E.groupId) || (X.add(E.groupId), Q.set(E.groupId, ie)), ie.push(E), s?.(E, E.groupId);
        }
        if (X.size === 0) return L;
        for (const H of X) {
          const E = Q.get(H);
          E && E.length > W && Q.set(H, E.slice(-W));
        }
        return Q;
      });
    }, 250);
    return () => clearInterval(te);
  }, [d, u, e, t, i, s, r, o]);
  const Z = _((ee, te = [], O) => {
    if (!d) return;
    const ye = Date.now();
    l({
      type: "createGroup",
      group: {
        type: "party",
        members: /* @__PURE__ */ new Set(),
        maxMembers: O?.maxSize ?? 20,
        range: 1e3,
        persistent: !1,
        createdAt: ye,
        lastActivity: ye
      }
    });
  }, [d, l, e]), oe = _((ee) => {
    d && l({
      type: "joinGroup",
      npcId: e,
      groupId: ee
    });
  }, [d, l, e]), le = _((ee) => {
    d && l({
      type: "leaveGroup",
      npcId: e,
      groupId: ee
    });
  }, [d, l, e]), ge = _((ee, te, O = "chat") => {
    if (!d || !f.includes(ee)) return "";
    const ye = `${e}-group-${++M.current}-${Date.now()}`, We = Date.now();
    return l({
      type: "sendMessage",
      message: {
        id: ye,
        from: e,
        to: "group",
        groupId: ee,
        type: O === "action" || O === "state" || O === "system" ? O : "chat",
        payload: te,
        priority: "normal",
        timestamp: We,
        reliability: "reliable"
      }
    }), ye;
  }, [d, l, e, f]), me = _((ee, te) => {
    if (!d || !g.includes(ee)) return;
    const O = {
      id: `invite-${Date.now()}`,
      from: e,
      to: te,
      type: "system",
      payload: { groupId: ee, inviterId: e },
      priority: "normal",
      timestamp: Date.now(),
      reliability: "reliable"
    };
    l({
      type: "sendMessage",
      message: O
    });
  }, [d, l, e, g]), he = _((ee, te) => {
    !d || !g.includes(ee) || l({
      type: "leaveGroup",
      npcId: te,
      groupId: ee
    });
  }, [d, l, g]), ue = _((ee) => y.find((te) => te.id === ee) || null, [y]), xe = _((ee) => {
    const te = ue(ee);
    return te ? Array.from(te.members).map(
      (O) => O.startsWith("node_") ? O.slice(5) : O
    ) : [];
  }, [ue]), be = _((ee) => m.get(ee) || [], [m]);
  return {
    // 그룹 생성 및 관리
    createGroup: Z,
    joinGroup: oe,
    leaveGroup: le,
    // 그룹 메시지
    sendGroupMessage: ge,
    // 그룹 멤버 관리
    inviteToGroup: me,
    kickFromGroup: he,
    // 그룹 상태
    joinedGroups: f,
    ownedGroups: g,
    availableGroups: y,
    // 그룹 정보 조회
    getGroupInfo: ue,
    getGroupMembers: xe,
    getGroupMessages: be,
    // 브릿지 기능
    isReady: d
  };
}
function Pu(n = {}) {
  const {
    updateInterval: e = 1e3,
    enableRealTime: t = !0,
    trackHistory: i = !1,
    historyLength: s = 100,
    ...r
  } = n, {
    getSnapshot: o,
    getNetworkStats: a,
    getSystemState: l,
    isReady: u
  } = $n(r), [d, f] = q(null), [h, g] = q([]), [v, y] = q(!1), [p, m] = q(0), x = _(() => {
    if (!u) return null;
    const k = o(), R = a(), $ = l();
    if (!k || !R) return null;
    const D = k.nodeCount, J = k.connectionCount, W = R.totalMessages ?? 0, Z = J, oe = 0, le = (J > 0, 100), ge = k.messagesPerSecond, me = {
      updateTime: 0,
      messageProcessingTime: 0,
      connectionProcessingTime: 0
    }, he = $ ? Array.from($.groups.values()) : [], ue = $ ? $.groups.size : k.activeGroups, xe = ue, be = ue > 0 ? he.reduce((ee, te) => ee + te.members.size, 0) / ue : 0;
    return {
      // 기본 통계
      totalNodes: D,
      totalConnections: J,
      totalMessages: W,
      averageLatency: k.averageLatency,
      messagesPerSecond: ge,
      // 연결 통계
      activeConnections: Z,
      failedConnections: oe,
      connectionSuccessRate: le,
      // 메시지 통계
      sentMessages: W,
      receivedMessages: W,
      failedMessages: 0,
      messageSuccessRate: 100,
      // 성능 통계
      updateTime: me.updateTime,
      messageProcessingTime: me.messageProcessingTime,
      connectionProcessingTime: me.connectionProcessingTime,
      // 그룹 통계
      totalGroups: ue,
      activeGroups: xe,
      averageGroupSize: be
    };
  }, [u, o, a, l, e]), M = _(() => {
    y(!0);
    const k = x();
    k && (f(k), m(Date.now()), i && g((R) => {
      const $ = [...R, k];
      return $.length > s ? $.slice(-s) : $;
    })), y(!1);
  }, [x, i, s]);
  z(() => {
    if (!t || !u) return;
    const k = setInterval(() => {
      M();
    }, e);
    return () => clearInterval(k);
  }, [t, u, M, e]), z(() => {
    u && M();
  }, [u, M]);
  const P = _((k) => h.length === 0 ? 0 : h.reduce(($, D) => $ + D[k], 0) / h.length, [h]), I = _((k) => h.length === 0 ? 0 : Math.max(...h.map((R) => R[k])), [h]);
  return {
    // 현재 통계
    stats: d,
    // 기록된 통계
    statsHistory: i ? h : [],
    // 통계 조회
    refreshStats: M,
    getHistoricalAverage: P,
    getPeakValue: I,
    // 상태
    isLoading: v,
    lastUpdate: p,
    // 브릿지 기능
    isReady: u
  };
}
function ju(n) {
  const [e, t] = q(!1), [i, s] = q(/* @__PURE__ */ new Map()), [r, o] = q(), a = C(null), l = _((f) => {
    const h = { ...n, ...f };
    a.current && a.current.disconnect();
    const g = new lr({
      url: h.url,
      roomId: h.roomId,
      playerName: h.playerName,
      playerColor: h.playerColor,
      onConnect: () => {
        t(!0), o(void 0);
      },
      onDisconnect: () => {
        t(!1), s(/* @__PURE__ */ new Map());
      },
      onPlayerJoin: (v, y) => {
        s((p) => {
          const m = new Map(p);
          return m.set(v, y), m;
        });
      },
      onPlayerUpdate: (v, y) => {
        s((p) => {
          const m = new Map(p);
          return m.set(v, y), m;
        });
      },
      onPlayerLeave: (v) => {
        s((y) => {
          const p = new Map(y);
          return p.delete(v), p;
        });
      },
      onError: (v) => {
        o(v);
      }
    });
    a.current = g, g.connect();
  }, [n]), u = _(() => {
    a.current?.disconnect(), t(!1), s(/* @__PURE__ */ new Map());
  }, []), d = _((f) => {
    a.current?.updateLocalPlayer(f);
  }, []);
  return z(() => () => {
    a.current?.disconnect(), a.current = null;
  }, []), {
    isConnected: e,
    players: i,
    error: r,
    connect: l,
    disconnect: u,
    updateLocalPlayer: d
  };
}
function Iu(n) {
  const { config: e, characterUrl: t, rigidBodyRef: i } = n, s = Y((D) => D.mode?.type ?? "character"), r = Y((D) => D.animationState), [o, a] = q({
    isConnected: !1,
    connectionStatus: "disconnected",
    players: /* @__PURE__ */ new Map(),
    localPlayerId: null,
    roomId: null,
    error: null,
    ping: 0,
    lastUpdate: 0
  }), l = C(null), u = C(null), d = C(null), f = C(null), h = C(e), g = C(o), v = C(s), y = C(r);
  z(() => {
    g.current = o;
  }, [o]), z(() => {
    v.current = s;
  }, [s]), z(() => {
    y.current = r;
  }, [r]);
  const [p, m] = q(
    () => /* @__PURE__ */ new Map()
  ), x = C(/* @__PURE__ */ new Map());
  z(() => {
    x.current = p;
  }, [p]), z(() => {
    i && (f.current = i);
  }, [i]), z(() => {
    const D = {
      updateRate: e.tracking.updateRate,
      velocityThreshold: e.tracking.velocityThreshold,
      sendRateLimit: e.tracking.sendRateLimit
    };
    d.current = new ll(D);
  }, [e.tracking]);
  const M = _((D) => {
    u.current && u.current.disconnect(), l.current = {
      playerName: D.playerName,
      playerColor: D.playerColor
    }, a((W) => ({
      ...W,
      connectionStatus: "connecting",
      error: null,
      roomId: D.roomId
    }));
    const J = new lr({
      url: e.websocket.url,
      roomId: D.roomId,
      playerName: D.playerName,
      playerColor: D.playerColor,
      reconnectAttempts: e.websocket.reconnectAttempts,
      reconnectDelay: e.websocket.reconnectDelay,
      pingInterval: e.websocket.pingInterval,
      sendRateLimit: e.tracking.sendRateLimit,
      enableAck: e.enableAck,
      reliableTimeout: e.reliableTimeout,
      reliableRetryCount: e.reliableRetryCount,
      logLevel: e.logLevel,
      logToConsole: e.logToConsole,
      onConnect: () => {
        a((W) => ({
          ...W,
          isConnected: !0,
          connectionStatus: "connected",
          error: null,
          lastUpdate: Date.now()
        }));
      },
      onWelcome: (W) => {
        a((Z) => ({
          ...Z,
          localPlayerId: W,
          lastUpdate: Date.now()
        }));
      },
      onDisconnect: () => {
        a((W) => ({
          ...W,
          isConnected: !1,
          connectionStatus: "disconnected",
          players: /* @__PURE__ */ new Map(),
          localPlayerId: null,
          lastUpdate: Date.now()
        }));
      },
      onPlayerJoin: (W, Z) => {
        a((oe) => {
          const le = new Map(oe.players);
          return le.set(W, Z), {
            ...oe,
            players: le,
            lastUpdate: Date.now()
          };
        });
      },
      onPlayerUpdate: (W, Z) => {
        a((oe) => {
          const le = new Map(oe.players);
          return le.set(W, Z), {
            ...oe,
            players: le,
            lastUpdate: Date.now()
          };
        });
      },
      onPlayerLeave: (W) => {
        a((Z) => {
          const oe = new Map(Z.players);
          return oe.delete(W), {
            ...Z,
            players: oe,
            lastUpdate: Date.now()
          };
        });
      },
      onChat: (W, Z, oe) => {
        m((ge) => {
          const me = new Map(ge);
          return me.set(W, { text: Z, expiresAt: Date.now() + 2500 }), me;
        });
      },
      onPing: (W) => {
        a((Z) => ({
          ...Z,
          ping: W,
          lastUpdate: Date.now()
        }));
      },
      onError: (W) => {
        a((Z) => ({
          ...Z,
          connectionStatus: "error",
          error: W,
          lastUpdate: Date.now()
        }));
      }
    });
    u.current = J, J.connect();
  }, [
    e.websocket.url,
    e.websocket.reconnectAttempts,
    e.websocket.reconnectDelay,
    e.websocket.pingInterval,
    e.tracking.sendRateLimit,
    e.logLevel,
    e.logToConsole
  ]), P = _(() => {
    u.current?.disconnect(), d.current?.reset(), f.current = null, m(/* @__PURE__ */ new Map()), a((D) => ({
      ...D,
      isConnected: !1,
      connectionStatus: "disconnected",
      players: /* @__PURE__ */ new Map(),
      localPlayerId: null,
      roomId: null,
      error: null
    }));
  }, []), I = _((D) => {
    f.current = D;
  }, []), k = _(() => {
    f.current = null, d.current?.reset();
  }, []), R = _((D) => {
    h.current = { ...h.current, ...D }, D.tracking && d.current && d.current.updateConfig(D.tracking);
  }, []), $ = _((D, J) => {
    const W = u.current;
    if (!W) return;
    const Z = J?.range ?? h.current.proximityRange;
    W.sendChat(D, { range: Z });
    const oe = o.localPlayerId;
    if (!oe) return;
    const le = J?.ttlMs ?? 2500, ge = String(D ?? "").trim().slice(0, 200);
    ge && m((me) => {
      const he = new Map(me);
      return he.set(oe, { text: ge, expiresAt: Date.now() + le }), he;
    });
  }, [o.localPlayerId]);
  return z(() => {
    if (!o.isConnected) return;
    const D = Math.max(15, Math.floor(1e3 / Math.max(1, h.current.tracking.updateRate))), J = window.setInterval(() => {
      if (!g.current.isConnected || !u.current || !d.current || !f.current?.current || !l.current) return;
      const { playerName: Z, playerColor: oe } = l.current, le = v.current, ge = y.current?.[le]?.current ?? "idle", me = d.current.trackPosition(
        f.current,
        Z,
        oe,
        t,
        ge
      );
      if (me && u.current.updateLocalPlayer(me), x.current.size > 0) {
        const he = Date.now();
        let ue = !1;
        const xe = new Map(x.current);
        xe.forEach((be, ee) => {
          be.expiresAt <= he && (xe.delete(ee), ue = !0);
        }), ue && m(xe);
      }
    }, D);
    return () => window.clearInterval(J);
  }, [o.isConnected, t]), z(() => () => {
    u.current?.disconnect();
  }, []), {
    ...o,
    connect: M,
    disconnect: P,
    startTracking: I,
    stopTracking: k,
    updateConfig: R,
    sendChat: $,
    speechByPlayerId: new Map(Array.from(p.entries()).map(([D, J]) => [D, J.text])),
    localSpeechText: o.localPlayerId ? p.get(o.localPlayerId)?.text ?? null : null
  };
}
const ul = (n, e, t) => n < e ? e : n > t ? t : n, dl = (n) => ul(n, 0, 1), hl = (n, e, t, i = 4) => {
  const s = Math.max(0, n), r = Math.max(0, e), o = Math.max(r + 1e-6, t), a = Math.max(0, i);
  return !Number.isFinite(s) || !Number.isFinite(r) || !Number.isFinite(o) || !Number.isFinite(a) ? a : dl((s - r) / (o - r)) * a;
}, fl = (n) => {
  const e = Math.max(0, n);
  return Number.isFinite(e) ? Math.exp(-e) : 0;
}, ki = (n, e, t, i = 4) => n <= e ? 1 : n >= t ? 0 : fl(hl(n, e, t, i));
function pl({ state: n, characterUrl: e, config: t, speechText: i }) {
  const s = C(null), r = C(null), o = C(null);
  o.current || (o.current = [n.position[0], n.position[1], n.position[2]]);
  const a = C(new b.Vector3()), l = C(new b.Quaternion()), u = C(new b.Vector3()), d = C(performance.now()), f = C(new b.Vector3()), h = C(new b.Quaternion()), g = C(new b.Vector3()), v = C(new b.Vector3()), y = C(new b.Vector3()), p = C(new b.Quaternion()), m = C(!1), x = C(new b.Vector3()), M = C(new b.Vector3()), P = C(new b.Vector3()), I = C(new b.Vector3()), k = C(new b.Vector3()), R = C(new b.Vector3()), $ = C({ x: 0, y: 0, z: 0 }), D = C({ x: 0, y: 0, z: 0, w: 1 }), J = C(0), W = C(0), Z = e || n.modelUrl || "";
  if (!Z) return null;
  const oe = (Q) => {
    if (typeof Q != "string") return null;
    const X = Q.trim();
    if (!X) return null;
    const H = X.startsWith("#") ? X : `#${X}`;
    return /^#[0-9a-fA-F]{3}$/.test(H) || /^#[0-9a-fA-F]{6}$/.test(H) ? H : null;
  }, le = ne(() => oe(n.color), [n.color]), ge = t?.tracking?.interpolationSpeed || 0.15, me = t?.rendering?.characterScale || 1, he = t?.rendering?.nameTagHeight || 3.5, ue = t?.rendering?.nameTagSize || 0.5, { scene: xe, animations: be } = dn(Z), ee = ne(() => kn.clone(xe), [xe]), { actions: te, ref: O } = ks(be, r), ye = C([]), We = C(null), ce = C(null), ot = C(performance.now()), Ge = C(new b.Vector3());
  z(() => {
    for (const X of ye.current)
      try {
        X.dispose();
      } catch {
      }
    if (ye.current = [], !le) return;
    const Q = (X) => {
      const H = X;
      if (!H?.color || typeof H.color.set != "function") return X;
      const E = X.clone();
      return E.color?.set?.(le), ye.current.push(E), E;
    };
    return ee.traverse((X) => {
      const H = X;
      !H || !H.isMesh && !H.isSkinnedMesh || !H.material || (Array.isArray(H.material) ? H.material = H.material.map((E) => Q(E)) : H.material = Q(H.material));
    }), () => {
      for (const X of ye.current)
        try {
          X.dispose();
        } catch {
        }
      ye.current = [];
    };
  }, [ee, le]);
  const T = (Q) => {
    if (!te) return null;
    const X = te[Q];
    if (X) return X;
    const H = Q.toLowerCase(), E = Object.keys(te), pe = E.find((ie) => ie.toLowerCase().includes(H));
    if (pe) return te[pe] ?? null;
    if (H === "run") {
      const ie = E.find((ae) => ae.toLowerCase().includes("walk")) ?? E[0];
      return ie ? te[ie] ?? null : null;
    }
    if (H === "idle") {
      const ie = E.find((ae) => ae.toLowerCase().includes("idle")) ?? E[0];
      return ie ? te[ie] ?? null : null;
    }
    return E[0] ? te[E[0]] ?? null : null;
  }, L = (Q, X, H, E, pe, ie, ae) => {
    const Oe = Math.max(1e-4, E), rt = Math.max(0, ie), _e = 2 / Oe, Ne = _e * rt, at = 1 / (1 + Ne + 0.48 * Ne * Ne + 0.235 * Ne * Ne * Ne);
    P.current.copy(X), x.current.copy(Q).sub(X);
    const Rt = pe * Oe, zt = x.current.length();
    zt > Rt && zt > 0 && x.current.multiplyScalar(Rt / zt), I.current.copy(Q).sub(x.current), M.current.copy(H).addScaledVector(x.current, _e).multiplyScalar(rt), H.addScaledVector(M.current, -_e).multiplyScalar(at), ae.copy(x.current).add(M.current).multiplyScalar(at).add(I.current), k.current.copy(P.current).sub(Q), R.current.copy(ae).sub(P.current), k.current.dot(R.current) > 0 && (ae.copy(P.current), H.set(0, 0, 0));
  };
  return z(() => {
    if (!te) return;
    const Q = t?.tracking?.velocityThreshold ?? 0.5, X = Q, H = Q * 0.6, E = 180, pe = n.velocity ? Math.hypot(n.velocity[0], n.velocity[1], n.velocity[2]) : u.current.length(), ie = n.animation?.trim(), ae = (We.current ?? "idle") === "run" ? pe < H ? "idle" : "run" : pe > X ? "run" : "idle", Oe = (ie && ie.length > 0 ? ie : ae) || "idle";
    if (We.current === Oe) return;
    const rt = performance.now();
    if (rt - ot.current < E) return;
    const _e = T(Oe);
    if (!_e) return;
    const Ne = ce.current;
    return _e.enabled = !0, _e.setEffectiveTimeScale(1), _e.setEffectiveWeight(1), _e.reset().play(), Ne && Ne !== _e ? _e.crossFadeFrom(Ne, 0.18, !0) : _e.fadeIn(0.18), We.current = Oe, ce.current = _e, ot.current = rt, () => {
    };
  }, [te, n.animation, n.velocity, t?.tracking?.velocityThreshold]), z(() => {
    if (d.current = performance.now(), a.current.set(
      n.position[0],
      n.position[1],
      n.position[2]
    ), Ge.current.set(n.position[0], n.position[1], n.position[2]), !m.current && s.current) {
      const E = a.current;
      m.current = !0, v.current.copy(E), y.current.set(0, 0, 0), p.current.copy(l.current);
      const pe = s.current, ie = $.current;
      ie.x = E.x, ie.y = E.y, ie.z = E.z, pe.setNextKinematicTranslation?.(ie);
      const ae = D.current;
      ae.x = l.current.x, ae.y = l.current.y, ae.z = l.current.z, ae.w = l.current.w, pe.setNextKinematicRotation?.(ae);
    }
    const Q = n.rotation, H = Math.abs(Q[0]) < 1e-6 && Math.abs(Q[1]) < 1e-6 && Math.abs(Q[2]) < 1e-6 && Math.abs(Q[3] - 1) < 1e-6 ? [1, 0, 0, 0] : Q;
    l.current.set(
      H[1],
      H[2],
      H[3],
      H[0]
    ), n.velocity && u.current.set(
      n.velocity[0],
      n.velocity[1],
      n.velocity[2]
    );
  }, [n.position, n.rotation, n.velocity]), Ke((Q, X) => {
    if (!s.current || !r.current) return;
    const H = W.current;
    if (H > 0) {
      if (J.current += Math.max(0, X), J.current < H) return;
      J.current = 0;
    } else
      J.current = 0;
    const E = m.current ? v.current : a.current, pe = Q.camera.position.distanceTo(E), ie = m.current ? ki(pe, 25, 140, 4) : 1;
    W.current = ie >= 0.7 ? 0 : ie >= 0.4 ? 1 / 30 : ie >= 0.2 ? 1 / 15 : 1 / 8;
    const ae = s.current.translation(), Oe = s.current.rotation(), rt = (performance.now() - d.current) / 1e3, _e = Math.max(0, Math.min(0.12, rt));
    g.current.copy(a.current).addScaledVector(u.current, _e), m.current || (m.current = !0, v.current.set(ae.x, ae.y, ae.z), y.current.set(0, 0, 0), p.current.set(Oe.x, Oe.y, Oe.z, Oe.w));
    const Ne = Math.max(0.01, Math.min(0.9, ge)), at = Math.max(0.03, Math.min(0.22, 0.03 + (1 - Ne) * 0.19)), Rt = 120;
    if (v.current.distanceTo(g.current) > 10 || X > 0.25)
      v.current.copy(g.current), y.current.set(0, 0, 0), p.current.copy(l.current);
    else {
      L(
        v.current,
        g.current,
        y.current,
        at,
        Rt,
        X,
        f.current
      ), v.current.copy(f.current);
      const Vn = Math.max(0.025, at * 0.7), Wn = 1 - Math.exp(-Math.max(0, X) / Vn);
      h.current.copy(p.current).slerp(l.current, Wn), p.current.copy(h.current);
    }
    Ge.current.copy(v.current);
    const mt = s.current, St = $.current;
    St.x = v.current.x, St.y = v.current.y, St.z = v.current.z, typeof mt.setNextKinematicTranslation == "function" ? mt.setNextKinematicTranslation(St) : mt.setTranslation?.(St, !0);
    const Qe = D.current;
    Qe.x = p.current.x, Qe.y = p.current.y, Qe.z = p.current.z, Qe.w = p.current.w, typeof mt.setNextKinematicRotation == "function" ? mt.setNextKinematicRotation(Qe) : mt.setRotation?.(p.current, !0);
  }), /* @__PURE__ */ c.jsxs("group", { children: [
    /* @__PURE__ */ c.jsxs(
      $t,
      {
        ref: s,
        type: "kinematicPosition",
        position: o.current ?? void 0,
        colliders: !1,
        children: [
          /* @__PURE__ */ c.jsx(yi, { args: [0.5, 0.5], position: [0, 1.5, 0] }),
          /* @__PURE__ */ c.jsx("group", { ref: r, children: /* @__PURE__ */ c.jsx("group", { ref: O, scale: [me, me, me], children: /* @__PURE__ */ c.jsx("primitive", { object: ee }) }) }),
          /* @__PURE__ */ c.jsx(
            Mr,
            {
              position: [0, he, 0],
              fontSize: ue,
              color: "white",
              anchorX: "center",
              anchorY: "middle",
              outlineWidth: 0.05,
              outlineColor: "black",
              children: n.name
            }
          )
        ]
      }
    ),
    i ? /* @__PURE__ */ c.jsx(
      cr,
      {
        text: i,
        position: Ge.current
      }
    ) : null
  ] });
}
function _u({ onConnect: n, error: e, isConnecting: t }) {
  const [i, s] = q(""), [r, o] = q("room1"), [a] = q(() => `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`), l = (u) => {
    u.preventDefault(), i.trim() && n({
      roomId: r,
      playerName: i.trim(),
      playerColor: a
    });
  };
  return /* @__PURE__ */ c.jsx("div", { style: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#1a1a1a"
  }, children: /* @__PURE__ */ c.jsxs(
    "form",
    {
      onSubmit: l,
      style: {
        background: "rgba(0, 0, 0, 0.8)",
        padding: "40px",
        borderRadius: "10px",
        color: "white",
        minWidth: "300px"
      },
      children: [
        /* @__PURE__ */ c.jsx("h2", { style: { marginBottom: "20px", textAlign: "center" }, children: "네트워크 멀티플레이어" }),
        /* @__PURE__ */ c.jsxs("div", { style: { marginBottom: "15px" }, children: [
          /* @__PURE__ */ c.jsx("label", { style: { display: "block", marginBottom: "5px" }, children: "플레이어 이름" }),
          /* @__PURE__ */ c.jsx(
            "input",
            {
              type: "text",
              placeholder: "이름을 입력하세요",
              value: i,
              onChange: (u) => s(u.target.value),
              disabled: t,
              style: {
                width: "100%",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                background: "#333",
                color: "white",
                fontSize: "14px"
              }
            }
          )
        ] }),
        /* @__PURE__ */ c.jsxs("div", { style: { marginBottom: "20px" }, children: [
          /* @__PURE__ */ c.jsx("label", { style: { display: "block", marginBottom: "5px" }, children: "방 코드" }),
          /* @__PURE__ */ c.jsx(
            "input",
            {
              type: "text",
              placeholder: "방 코드",
              value: r,
              onChange: (u) => o(u.target.value),
              disabled: t,
              style: {
                width: "100%",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                background: "#333",
                color: "white",
                fontSize: "14px"
              }
            }
          )
        ] }),
        /* @__PURE__ */ c.jsxs("div", { style: { marginBottom: "20px" }, children: [
          /* @__PURE__ */ c.jsx("label", { style: { display: "block", marginBottom: "5px" }, children: "플레이어 색상" }),
          /* @__PURE__ */ c.jsx(
            "div",
            {
              style: {
                width: "30px",
                height: "30px",
                backgroundColor: a,
                borderRadius: "50%",
                border: "2px solid #ccc"
              }
            }
          )
        ] }),
        /* @__PURE__ */ c.jsx(
          "button",
          {
            type: "submit",
            disabled: !i.trim() || t,
            style: {
              width: "100%",
              padding: "12px",
              borderRadius: "5px",
              border: "none",
              background: !i.trim() || t ? "#666" : "#4CAF50",
              color: "white",
              fontSize: "16px",
              cursor: !i.trim() || t ? "not-allowed" : "pointer",
              transition: "background-color 0.2s"
            },
            children: t ? "연결 중..." : "연결하기"
          }
        ),
        e && /* @__PURE__ */ c.jsx("div", { style: {
          color: "#ff6b6b",
          marginTop: "15px",
          padding: "10px",
          background: "rgba(255, 107, 107, 0.1)",
          borderRadius: "5px",
          fontSize: "14px"
        }, children: e })
      ]
    }
  ) });
}
function Tu({ state: n, playerName: e, onDisconnect: t, onSendChat: i }) {
  const { isConnected: s, connectionStatus: r, players: o, roomId: a, error: l, ping: u, localPlayerId: d, lastUpdate: f } = n, [h, g] = q("");
  if (!s) return null;
  const v = _(() => {
    if (!i) return;
    const y = h.trim();
    y && (i(y), g(""));
  }, [i, h]);
  return /* @__PURE__ */ c.jsxs("div", { style: {
    position: "fixed",
    top: 10,
    left: 10,
    background: "rgba(0, 0, 0, 0.8)",
    padding: "8px",
    borderRadius: "6px",
    color: "white",
    minWidth: "160px",
    backdropFilter: "blur(5px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    lineHeight: 1.2
  }, children: [
    /* @__PURE__ */ c.jsx("h3", { style: {
      marginTop: 0,
      marginBottom: "6px",
      fontSize: "12px",
      borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
      paddingBottom: "6px"
    }, children: "네트워크 정보" }),
    /* @__PURE__ */ c.jsxs("div", { style: { marginBottom: "6px", fontSize: "12px" }, children: [
      /* @__PURE__ */ c.jsx("strong", { children: "상태:" }),
      /* @__PURE__ */ c.jsx("span", { style: {
        marginLeft: "8px",
        color: r === "connected" ? "#4CAF50" : "#ff6b6b"
      }, children: r === "connected" ? "연결됨" : r === "connecting" ? "연결 중" : r === "error" ? "오류" : "연결 끊김" })
    ] }),
    e && /* @__PURE__ */ c.jsxs("div", { style: { marginBottom: "6px", fontSize: "12px" }, children: [
      /* @__PURE__ */ c.jsx("strong", { children: "플레이어:" }),
      " ",
      /* @__PURE__ */ c.jsx("span", { style: { marginLeft: "8px" }, children: e })
    ] }),
    a && /* @__PURE__ */ c.jsxs("div", { style: { marginBottom: "6px", fontSize: "12px" }, children: [
      /* @__PURE__ */ c.jsx("strong", { children: "방:" }),
      " ",
      /* @__PURE__ */ c.jsx("span", { style: { marginLeft: "8px" }, children: a })
    ] }),
    d && /* @__PURE__ */ c.jsxs("div", { style: { marginBottom: "6px", fontSize: "12px" }, children: [
      /* @__PURE__ */ c.jsx("strong", { children: "내 ID:" }),
      " ",
      /* @__PURE__ */ c.jsx("span", { style: { marginLeft: "8px" }, children: d })
    ] }),
    /* @__PURE__ */ c.jsxs("div", { style: { marginBottom: "6px", fontSize: "12px" }, children: [
      /* @__PURE__ */ c.jsx("strong", { children: "최근 업데이트:" }),
      /* @__PURE__ */ c.jsx("span", { style: { marginLeft: "8px" }, children: f ? `${Math.max(0, Date.now() - f)}ms 전` : "-" })
    ] }),
    /* @__PURE__ */ c.jsxs("div", { style: { marginBottom: "6px", fontSize: "12px" }, children: [
      /* @__PURE__ */ c.jsx("strong", { children: "접속자:" }),
      /* @__PURE__ */ c.jsxs("span", { style: { marginLeft: "8px" }, children: [
        o.size + (s ? 1 : 0),
        "명"
      ] })
    ] }),
    u > 0 && /* @__PURE__ */ c.jsxs("div", { style: { marginBottom: "8px", fontSize: "12px" }, children: [
      /* @__PURE__ */ c.jsx("strong", { children: "핑:" }),
      /* @__PURE__ */ c.jsxs("span", { style: {
        marginLeft: "8px",
        color: u < 50 ? "#4CAF50" : u < 100 ? "#FFA726" : "#ff6b6b"
      }, children: [
        u,
        "ms"
      ] })
    ] }),
    o.size > 0 && /* @__PURE__ */ c.jsxs("div", { style: { marginBottom: "8px" }, children: [
      /* @__PURE__ */ c.jsx("strong", { children: "다른 플레이어:" }),
      /* @__PURE__ */ c.jsx("div", { style: {
        marginTop: "6px",
        maxHeight: "80px",
        overflowY: "auto",
        fontSize: "11px"
      }, children: Array.from(o.entries()).map(([y, p]) => /* @__PURE__ */ c.jsxs(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            marginBottom: "4px",
            padding: "3px",
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "3px"
          },
          children: [
            /* @__PURE__ */ c.jsx(
              "div",
              {
                style: {
                  width: "10px",
                  height: "10px",
                  backgroundColor: p.color,
                  borderRadius: "50%",
                  marginRight: "6px",
                  border: "1px solid rgba(255, 255, 255, 0.3)"
                }
              }
            ),
            /* @__PURE__ */ c.jsxs("span", { style: { flex: 1 }, children: [
              p.name,
              /* @__PURE__ */ c.jsxs("span", { style: { opacity: 0.7, marginLeft: "8px" }, children: [
                "(",
                p.position[0].toFixed(1),
                ",",
                p.position[1].toFixed(1),
                ",",
                p.position[2].toFixed(1),
                ")"
              ] }),
              p.animation ? /* @__PURE__ */ c.jsx("span", { style: { opacity: 0.7, marginLeft: "8px" }, children: p.animation }) : null
            ] })
          ]
        },
        y
      )) })
    ] }),
    l && /* @__PURE__ */ c.jsx("div", { style: {
      color: "#ff6b6b",
      marginBottom: "15px",
      padding: "8px",
      background: "rgba(255, 107, 107, 0.1)",
      borderRadius: "5px",
      fontSize: "14px"
    }, children: l }),
    i ? /* @__PURE__ */ c.jsxs("div", { style: { marginBottom: "8px" }, children: [
      /* @__PURE__ */ c.jsx("strong", { children: "채팅:" }),
      /* @__PURE__ */ c.jsxs("div", { style: { display: "flex", gap: "6px", marginTop: "6px" }, children: [
        /* @__PURE__ */ c.jsx(
          "input",
          {
            value: h,
            onChange: (y) => g(y.target.value),
            placeholder: "Enter로 전송",
            style: {
              flex: 1,
              padding: "6px",
              borderRadius: "4px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              background: "rgba(255, 255, 255, 0.05)",
              color: "white",
              fontSize: "12px"
            },
            onKeyDown: (y) => {
              y.key === "Enter" && (y.preventDefault(), v());
            }
          }
        ),
        /* @__PURE__ */ c.jsx(
          "button",
          {
            onClick: v,
            style: {
              padding: "6px 8px",
              borderRadius: "4px",
              border: "none",
              background: "#4CAF50",
              color: "white",
              fontSize: "12px",
              cursor: "pointer"
            },
            disabled: !h.trim(),
            children: "전송"
          }
        )
      ] })
    ] }) : null,
    /* @__PURE__ */ c.jsx(
      "button",
      {
        onClick: t,
        style: {
          width: "100%",
          padding: "8px",
          borderRadius: "4px",
          border: "none",
          background: "#ff6b6b",
          color: "white",
          fontSize: "12px",
          cursor: "pointer",
          transition: "background-color 0.2s"
        },
        onMouseEnter: (y) => {
          y.currentTarget.style.backgroundColor = "#ff5252";
        },
        onMouseLeave: (y) => {
          y.currentTarget.style.backgroundColor = "#ff6b6b";
        },
        children: "연결 끊기"
      }
    )
  ] });
}
function ku({
  players: n,
  characterUrl: e,
  vehicleUrl: t,
  airplaneUrl: i,
  playerRef: s,
  config: r,
  localPlayerColor: o,
  proximityRange: a,
  speechByPlayerId: l,
  localSpeechText: u
}) {
  z(() => {
    window.CHARACTER_URL = e;
  }, [e]);
  const [d, f] = q([0, 0, 0]), h = ne(() => new b.Vector3(), []);
  z(() => {
    const v = window.setInterval(() => {
      const y = s.current;
      if (!y) return;
      const p = y.translation();
      f((m) => {
        const x = p.x - m[0], M = p.y - m[1], P = p.z - m[2];
        return x * x + M * M + P * P < 1e-4 ? m : [p.x, p.y, p.z];
      });
    }, 100);
    return () => window.clearInterval(v);
  }, [s]), z(() => {
    h.set(d[0], d[1], d[2]);
  }, [d, h]);
  const g = ne(() => {
    const v = a;
    if (!v || v <= 0) return n;
    const [y, p, m] = d, x = /* @__PURE__ */ new Map();
    return n.forEach((M, P) => {
      const [I, k, R] = M.position, $ = I - y, D = k - p, J = R - m;
      $ * $ + D * D + J * J <= v * v && x.set(P, M);
    }), x;
  }, [n, a, d]);
  return /* @__PURE__ */ c.jsx(
    il,
    {
      urls: {
        characterUrl: e,
        vehicleUrl: t,
        airplaneUrl: i
      },
      children: /* @__PURE__ */ c.jsxs(
        vr,
        {
          shadows: !0,
          dpr: [1, 1.5],
          camera: { position: [0, 10, 20], fov: 75, near: 0.1, far: 1e3 },
          style: { width: "100vw", height: "100vh" },
          children: [
            /* @__PURE__ */ c.jsx(Cr, { background: !0, preset: "sunset", backgroundBlurriness: 1 }),
            /* @__PURE__ */ c.jsx(
              "directionalLight",
              {
                castShadow: !0,
                "shadow-normalBias": 0.06,
                position: [20, 30, 10],
                intensity: 0.5,
                "shadow-mapSize": [1024, 1024],
                "shadow-camera-near": 1,
                "shadow-camera-far": 50,
                "shadow-camera-top": 50,
                "shadow-camera-right": 50,
                "shadow-camera-bottom": -50,
                "shadow-camera-left": -50
              }
            ),
            /* @__PURE__ */ c.jsx(Tn, { fallback: null, children: /* @__PURE__ */ c.jsx(sl, { children: /* @__PURE__ */ c.jsxs(xr, { children: [
              /* @__PURE__ */ c.jsx(
                Rc,
                {
                  rigidBodyRef: s,
                  rotation: gi({ x: 0, y: Math.PI, z: 0 }),
                  parts: [],
                  ...o ? { baseColor: o } : {}
                }
              ),
              u ? /* @__PURE__ */ c.jsx(
                cr,
                {
                  text: u,
                  position: h
                }
              ) : null,
              Array.from(g.entries()).map(([v, y]) => /* @__PURE__ */ c.jsx(
                pl,
                {
                  playerId: v,
                  state: y,
                  characterUrl: e,
                  config: r,
                  ...(() => {
                    const p = l?.get(v);
                    return p ? { speechText: p } : {};
                  })()
                },
                v
              )),
              /* @__PURE__ */ c.jsx(
                Pr,
                {
                  renderOrder: -1,
                  position: [0, 0.01, 0],
                  infiniteGrid: !0,
                  cellSize: 2,
                  cellThickness: 1,
                  cellColor: "#1d1d1d",
                  sectionSize: 5,
                  sectionThickness: 0,
                  fadeDistance: 1e3
                }
              ),
              /* @__PURE__ */ c.jsx($t, { type: "fixed", children: /* @__PURE__ */ c.jsxs("mesh", { receiveShadow: !0, position: [0, -1, 0], children: [
                /* @__PURE__ */ c.jsx("boxGeometry", { args: [1e3, 2, 1e3] }),
                /* @__PURE__ */ c.jsx("meshStandardMaterial", { color: "#3d3d3d" })
              ] }) }),
              /* @__PURE__ */ c.jsx(nr, {}),
              /* @__PURE__ */ c.jsx(ir, {})
            ] }) }) })
          ]
        }
      )
    }
  );
}
const Au = {
  // 기본 NetworkConfig
  updateFrequency: 30,
  maxConnections: 100,
  messageQueueSize: 1e3,
  // 통신 설정
  maxDistance: 100,
  signalStrength: 1,
  bandwidth: 1e3,
  proximityRange: 10,
  // 최적화 설정
  enableBatching: !0,
  batchSize: 10,
  compressionLevel: 1,
  connectionPoolSize: 50,
  // 메시지 설정
  enableChatMessages: !0,
  enableActionMessages: !0,
  enableStateMessages: !0,
  enableSystemMessages: !0,
  // 신뢰성 설정
  reliableRetryCount: 3,
  reliableTimeout: 5e3,
  enableAck: !0,
  // 그룹 설정
  maxGroupSize: 20,
  autoJoinProximity: !0,
  groupMessagePriority: "normal",
  // 디버깅 설정
  enableDebugPanel: !1,
  enableVisualizer: !1,
  showConnectionLines: !1,
  showMessageFlow: !1,
  debugUpdateInterval: 500,
  logLevel: "warn",
  logToConsole: !0,
  logToFile: !1,
  maxLogEntries: 1e3,
  // 보안 설정
  enableEncryption: !1,
  enableRateLimit: !0,
  maxMessagesPerSecond: 100,
  // 메모리 관리
  messageGCInterval: 3e4,
  connectionTimeout: 3e4,
  inactiveNodeCleanup: 6e4,
  // 멀티플레이어 전용 설정
  websocket: {
    url: "ws://localhost:8090",
    reconnectAttempts: 5,
    reconnectDelay: 1e3,
    pingInterval: 3e4
  },
  tracking: {
    updateRate: 20,
    // 20Hz (50ms)
    velocityThreshold: 0.5,
    sendRateLimit: 50,
    // 50ms
    interpolationSpeed: 0.15
  },
  rendering: {
    nameTagHeight: 3.5,
    nameTagSize: 0.5,
    characterScale: 1
  }
}, ws = {
  // 성능 설정
  updateFrequency: 30,
  maxConnections: 100,
  messageQueueSize: 1e3,
  // 통신 설정
  maxDistance: 100,
  signalStrength: 1,
  bandwidth: 1e3,
  proximityRange: 10,
  // 최적화 설정
  enableBatching: !0,
  batchSize: 10,
  compressionLevel: 1,
  connectionPoolSize: 50,
  // 메시지 설정
  enableChatMessages: !0,
  enableActionMessages: !0,
  enableStateMessages: !0,
  enableSystemMessages: !0,
  // 신뢰성 설정
  reliableRetryCount: 3,
  reliableTimeout: 5e3,
  enableAck: !0,
  // 그룹 설정
  maxGroupSize: 20,
  autoJoinProximity: !0,
  groupMessagePriority: "normal",
  // 디버깅 설정
  enableDebugPanel: !1,
  enableVisualizer: !1,
  showConnectionLines: !1,
  showMessageFlow: !1,
  debugUpdateInterval: 500,
  logLevel: "warn",
  logToConsole: !0,
  logToFile: !1,
  maxLogEntries: 1e3,
  // 보안 설정
  enableEncryption: !1,
  enableRateLimit: !0,
  maxMessagesPerSecond: 100,
  // 메모리 관리
  messageGCInterval: 3e4,
  connectionTimeout: 3e4,
  inactiveNodeCleanup: 6e4
}, ml = {
  high: {
    updateFrequency: 60,
    maxConnections: 200,
    messageQueueSize: 2e3,
    enableBatching: !0,
    batchSize: 20,
    compressionLevel: 3,
    connectionPoolSize: 100,
    bandwidth: 2e3,
    signalStrength: 2
  },
  balanced: {
    updateFrequency: 30,
    maxConnections: 100,
    messageQueueSize: 1e3,
    enableBatching: !0,
    batchSize: 10,
    compressionLevel: 1,
    connectionPoolSize: 50,
    bandwidth: 1e3,
    signalStrength: 1
  },
  low: {
    updateFrequency: 15,
    maxConnections: 50,
    messageQueueSize: 500,
    enableBatching: !1,
    batchSize: 5,
    compressionLevel: 0,
    connectionPoolSize: 25,
    bandwidth: 500,
    signalStrength: 0.5
  }
}, gl = (n) => {
  const e = [];
  return (n.updateFrequency <= 0 || n.updateFrequency > 120) && e.push("updateFrequency must be between 1 and 120"), n.maxConnections <= 0 && e.push("maxConnections must be greater than 0"), n.messageQueueSize <= 0 && e.push("messageQueueSize must be greater than 0"), n.maxDistance <= 0 && e.push("maxDistance must be greater than 0"), n.signalStrength <= 0 && e.push("signalStrength must be greater than 0"), n.bandwidth <= 0 && e.push("bandwidth must be greater than 0"), n.proximityRange <= 0 && e.push("proximityRange must be greater than 0"), n.batchSize <= 0 && e.push("batchSize must be greater than 0"), (n.compressionLevel < 0 || n.compressionLevel > 9) && e.push("compressionLevel must be between 0 and 9"), n.connectionPoolSize < 0 && e.push("connectionPoolSize must be non-negative"), n.reliableRetryCount < 0 && e.push("reliableRetryCount must be non-negative"), n.reliableTimeout <= 0 && e.push("reliableTimeout must be greater than 0"), n.maxGroupSize <= 0 && e.push("maxGroupSize must be greater than 0"), n.debugUpdateInterval <= 0 && e.push("debugUpdateInterval must be greater than 0"), n.maxLogEntries <= 0 && e.push("maxLogEntries must be greater than 0"), n.maxMessagesPerSecond <= 0 && e.push("maxMessagesPerSecond must be greater than 0"), n.messageGCInterval <= 0 && e.push("messageGCInterval must be greater than 0"), n.connectionTimeout <= 0 && e.push("connectionTimeout must be greater than 0"), n.inactiveNodeCleanup <= 0 && e.push("inactiveNodeCleanup must be greater than 0"), {
    isValid: e.length === 0,
    errors: e
  };
};
ft((n, e) => ({
  config: ws,
  updateConfig: (t) => n((i) => ({
    config: { ...i.config, ...t }
  })),
  updatePerformanceConfig: (t) => n((i) => ({
    config: { ...i.config, ...t }
  })),
  updateCommunicationConfig: (t) => n((i) => ({
    config: { ...i.config, ...t }
  })),
  updateOptimizationConfig: (t) => n((i) => ({
    config: { ...i.config, ...t }
  })),
  updateDebugConfig: (t) => n((i) => ({
    config: { ...i.config, ...t }
  })),
  resetConfig: () => n({ config: { ...ws } }),
  resetToProfile: (t) => n((i) => ({
    config: {
      ...i.config,
      ...ml[t]
    }
  })),
  validateConfig: () => gl(e().config)
}));
const Ss = {
  snapshot: null,
  connectedNodes: /* @__PURE__ */ new Map(),
  activeGroups: /* @__PURE__ */ new Map(),
  recentMessages: [],
  isConnected: !1,
  connectionStatus: "disconnected",
  lastError: null,
  lastUpdate: 0
};
ft((n, e) => ({
  state: { ...Ss },
  updateSnapshot: (t) => n((i) => ({
    state: {
      ...i.state,
      snapshot: { ...t },
      lastUpdate: Date.now()
    }
  })),
  updateConnectedNodes: (t) => n((i) => {
    const s = /* @__PURE__ */ new Map();
    return t.forEach((r) => {
      s.set(r.id, { ...r });
    }), {
      state: {
        ...i.state,
        connectedNodes: s,
        lastUpdate: Date.now()
      }
    };
  }),
  updateActiveGroups: (t) => n((i) => {
    const s = /* @__PURE__ */ new Map();
    return t.forEach((r) => {
      s.set(r.id, {
        ...r,
        members: new Set(r.members)
        // Set 복사
      });
    }), {
      state: {
        ...i.state,
        activeGroups: s,
        lastUpdate: Date.now()
      }
    };
  }),
  addRecentMessage: (t) => n((i) => {
    const s = [...i.state.recentMessages, { ...t }];
    return s.length > 100 && s.shift(), {
      state: {
        ...i.state,
        recentMessages: s,
        lastUpdate: Date.now()
      }
    };
  }),
  setConnectionStatus: (t, i) => n((s) => ({
    state: {
      ...s.state,
      connectionStatus: t,
      isConnected: t === "connected",
      lastError: i || null,
      lastUpdate: Date.now()
    }
  })),
  clearRecentMessages: () => n((t) => ({
    state: {
      ...t.state,
      recentMessages: [],
      lastUpdate: Date.now()
    }
  })),
  getNodeById: (t) => {
    const { state: i } = e();
    return i.connectedNodes.get(t) || null;
  },
  getGroupById: (t) => {
    const { state: i } = e();
    return i.activeGroups.get(t) || null;
  },
  getNodesByGroup: (t) => {
    const { state: i } = e(), s = i.activeGroups.get(t);
    if (!s) return [];
    const r = [];
    return s.members.forEach((o) => {
      const a = i.connectedNodes.get(o);
      a && r.push(a);
    }), r;
  },
  getMessagesForNode: (t) => {
    const { state: i } = e();
    return i.recentMessages.filter(
      (s) => s.from === t || s.to === t
    );
  },
  resetState: () => n({
    state: {
      ...Ss,
      connectedNodes: /* @__PURE__ */ new Map(),
      activeGroups: /* @__PURE__ */ new Map(),
      recentMessages: []
    }
  })
}));
var yl = Object.defineProperty, vl = Object.getOwnPropertyDescriptor, Ai = (n, e, t, i) => {
  for (var s = i > 1 ? void 0 : i ? vl(e, t) : e, r = n.length - 1, o; r >= 0; r--)
    (o = n[r]) && (s = (i ? o(e, t, s) : o(s)) || s);
  return i && s && yl(e, t, s), s;
};
let In = class extends qt {
  constructor() {
    super(), this.setupEngineSubscriptions();
  }
  /**
   * Register the 'main' engine with default config (call from consumer, not constructor).
   */
  ensureMainEngine(n) {
    this.getEngine("main") || this.register("main", n ?? this.createDefaultConfig());
  }
  buildEngine(n, e) {
    try {
      const t = new cl(e ?? this.createDefaultConfig());
      return t.start(), {
        system: t,
        dispose: () => t.dispose()
      };
    } catch (t) {
      return console.error("[NetworkBridge] Failed to build engine:", t), null;
    }
  }
  executeCommand(n, e, t) {
    const { system: i } = n;
    i.executeCommand(e);
  }
  // 60fps에서 16프레임마다 캐싱
  createSnapshot(n, e) {
    const { system: t } = n;
    return t.createSnapshot();
  }
  /**
   * 시스템 업데이트 (매 프레임 호출)
   */
  updateSystem(n, e) {
    this.getEngine(n) && this.notifyListeners(n);
  }
  /**
   * 기본 설정으로 시스템 등록
   */
  createDefaultConfig() {
    return {
      // 성능 설정
      updateFrequency: 30,
      maxConnections: 100,
      messageQueueSize: 1e3,
      // 통신 설정
      maxDistance: 100,
      signalStrength: 1,
      bandwidth: 1e3,
      proximityRange: 10,
      // 최적화 설정
      enableBatching: !0,
      batchSize: 10,
      compressionLevel: 1,
      connectionPoolSize: 50,
      // 메시지 설정
      enableChatMessages: !0,
      enableActionMessages: !0,
      enableStateMessages: !0,
      enableSystemMessages: !0,
      // 신뢰성 설정
      reliableRetryCount: 3,
      reliableTimeout: 5e3,
      enableAck: !0,
      // 그룹 설정
      maxGroupSize: 20,
      autoJoinProximity: !0,
      groupMessagePriority: "normal",
      // 디버깅 설정
      enableDebugPanel: !1,
      enableVisualizer: !1,
      showConnectionLines: !1,
      showMessageFlow: !1,
      debugUpdateInterval: 500,
      logLevel: "warn",
      logToConsole: !0,
      logToFile: !1,
      maxLogEntries: 1e3,
      // 보안 설정
      enableEncryption: !1,
      enableRateLimit: !0,
      maxMessagesPerSecond: 100,
      // 메모리 관리
      messageGCInterval: 3e4,
      connectionTimeout: 3e4,
      inactiveNodeCleanup: 6e4
    };
  }
  /**
   * 엔진 구독 설정
   */
  setupEngineSubscriptions() {
    this.on("snapshot", (n) => {
    });
  }
  /**
   * 네트워크 통계 조회
   */
  getNetworkStats(n = "main") {
    const e = this.getEngine(n);
    return e ? e.system.getDebugInfo()?.networkStats ?? null : null;
  }
  /**
   * 시스템 상태 조회
   */
  getSystemState(n = "main") {
    const e = this.getEngine(n);
    return e ? e.system.getState() : null;
  }
};
Ai([
  Ht()
], In.prototype, "executeCommand", 1);
Ai([
  bt(),
  jt(16)
], In.prototype, "createSnapshot", 1);
In = Ai([
  Zt("networks"),
  bi()
], In);
function bl() {
  const [n, e] = q("Controller"), t = () => {
    switch (n) {
      case "Controller":
        return /* @__PURE__ */ c.jsx(Ya, {});
      case "Presets":
        return /* @__PURE__ */ c.jsx(sc, {});
      case "Debug":
        return /* @__PURE__ */ c.jsx(ec, {});
      default:
        return null;
    }
  };
  return /* @__PURE__ */ c.jsxs("div", { className: "tabbed-panel", children: [
    /* @__PURE__ */ c.jsxs("div", { className: "panel-tabs", children: [
      /* @__PURE__ */ c.jsx("button", { className: `panel-tab ${n === "Controller" ? "active" : ""}`, onClick: () => e("Controller"), children: "Controller" }),
      /* @__PURE__ */ c.jsx("button", { className: `panel-tab ${n === "Presets" ? "active" : ""}`, onClick: () => e("Presets"), children: "Presets" }),
      /* @__PURE__ */ c.jsx("button", { className: `panel-tab ${n === "Debug" ? "active" : ""}`, onClick: () => e("Debug"), children: "Debug" })
    ] }),
    /* @__PURE__ */ c.jsx("div", { className: "panel-tab-content", children: t() })
  ] });
}
function xl() {
  const [n, e] = q("Player"), t = () => {
    switch (n) {
      case "Player":
        return /* @__PURE__ */ c.jsx("div", { className: "panel-content-wrapper", children: /* @__PURE__ */ c.jsx(ma, {}) });
      case "Controller":
        return /* @__PURE__ */ c.jsx("div", { className: "panel-content-wrapper", children: /* @__PURE__ */ c.jsx(ua, {}) });
      case "Debug":
        return /* @__PURE__ */ c.jsx("div", { className: "panel-content-wrapper", children: /* @__PURE__ */ c.jsx(ya, {}) });
      default:
        return null;
    }
  };
  return /* @__PURE__ */ c.jsxs("div", { className: "tabbed-panel", children: [
    /* @__PURE__ */ c.jsxs("div", { className: "panel-tabs", children: [
      /* @__PURE__ */ c.jsx("button", { className: `panel-tab ${n === "Player" ? "active" : ""}`, onClick: () => e("Player"), children: "Player" }),
      /* @__PURE__ */ c.jsx("button", { className: `panel-tab ${n === "Controller" ? "active" : ""}`, onClick: () => e("Controller"), children: "Controller" }),
      /* @__PURE__ */ c.jsx("button", { className: `panel-tab ${n === "Debug" ? "active" : ""}`, onClick: () => e("Debug"), children: "Debug" })
    ] }),
    /* @__PURE__ */ c.jsx("div", { className: "panel-tab-content", children: t() })
  ] });
}
function wl() {
  const [n, e] = q("Controller"), t = () => {
    switch (n) {
      case "Controller":
        return /* @__PURE__ */ c.jsx("div", { className: "panel-content-wrapper", children: /* @__PURE__ */ c.jsx(or, {}) });
      case "Debug":
        return /* @__PURE__ */ c.jsx("div", { className: "panel-content-wrapper", children: /* @__PURE__ */ c.jsx(ar, {}) });
      default:
        return null;
    }
  };
  return /* @__PURE__ */ c.jsxs("div", { className: "tabbed-panel", children: [
    /* @__PURE__ */ c.jsxs("div", { className: "panel-tabs", children: [
      /* @__PURE__ */ c.jsx("button", { className: `panel-tab ${n === "Controller" ? "active" : ""}`, onClick: () => e("Controller"), children: "Controller" }),
      /* @__PURE__ */ c.jsx("button", { className: `panel-tab ${n === "Debug" ? "active" : ""}`, onClick: () => e("Debug"), children: "Debug" })
    ] }),
    /* @__PURE__ */ c.jsx("div", { className: "panel-tab-content", children: t() })
  ] });
}
const Ms = ({ data: n, color: e, max: t }) => {
  const s = n.filter((a) => isFinite(a));
  if (s.length < 2) return null;
  const r = Math.max(1, t), o = s.map((a, l) => {
    const u = l / (s.length - 1) * 100, d = 40 - a / r * 40;
    return `${l === 0 ? "M" : "L"}${u.toFixed(2)},${d.toFixed(2)}`;
  }).join(" ");
  return /* @__PURE__ */ c.jsx("div", { className: "perf-chart", children: /* @__PURE__ */ c.jsx("svg", { width: "100%", height: 40, preserveAspectRatio: "none", viewBox: "0 0 100 40", children: /* @__PURE__ */ c.jsx("path", { d: o, fill: "none", stroke: e, strokeWidth: "2", strokeLinejoin: "round", strokeLinecap: "round" }) }) });
};
function Sl() {
  const n = Y((p) => p.performance), [e, t] = q({ current: 0, min: 1 / 0, max: 0, avg: 0, history: Array(50).fill(0) }), [i, s] = q({ used: 0, limit: 0, history: Array(50).fill(0) }), [r, o] = q(0), a = C(0), l = C(0), u = C(0), d = C([]), f = C(null), h = C(0), g = C(0);
  z(() => {
    const p = window.performance.now();
    a.current = p, l.current = p;
    const m = (x) => {
      const M = x - l.current;
      if (l.current = x, d.current.push(M), d.current.length > 30 && d.current.shift(), h.current += M, g.current++, g.current >= 10) {
        const P = h.current / g.current;
        o(P), h.current = 0, g.current = 0;
      }
      if (u.current++, x - a.current >= 500) {
        const P = u.current * 1e3 / (x - a.current);
        t((k) => {
          const R = [...k.history.slice(1), P], $ = Math.min(
            k.min === 1 / 0 ? P : k.min,
            P
          ), D = Math.max(k.max, P), J = R.reduce((W, Z) => W + Z, 0) / R.length;
          return {
            current: P,
            min: $,
            max: D,
            avg: J,
            history: R
          };
        }), (() => {
          const k = window.performance.memory;
          k && s((R) => {
            const $ = Math.round(k.usedJSHeapSize / 1048576), D = Math.round(k.jsHeapSizeLimit / 1048576), J = [...R.history.slice(1), $];
            return { used: $, limit: D, history: J };
          });
        })(), a.current = x, u.current = 0;
      }
      f.current = requestAnimationFrame(m);
    };
    return f.current = requestAnimationFrame(m), () => {
      f.current && cancelAnimationFrame(f.current);
    };
  }, []);
  const v = (p) => p >= 55 ? "#4ade80" : p >= 30 ? "#facc15" : "#f87171", y = (p, m) => {
    const x = m > 0 ? p / m * 100 : 0;
    return x < 60 ? "#4ade80" : x < 80 ? "#facc15" : "#f87171";
  };
  return /* @__PURE__ */ c.jsxs("div", { className: "perf-panel", children: [
    /* @__PURE__ */ c.jsxs("div", { className: "perf-stat-group", children: [
      /* @__PURE__ */ c.jsxs("div", { className: "perf-header", children: [
        /* @__PURE__ */ c.jsx("h4", { className: "perf-title", children: "Frame Rate (FPS)" }),
        /* @__PURE__ */ c.jsx("span", { className: "perf-current", style: { color: v(e.current) }, children: e.current.toFixed(0) })
      ] }),
      /* @__PURE__ */ c.jsxs("div", { className: "perf-details-grid", children: [
        /* @__PURE__ */ c.jsxs("div", { children: [
          /* @__PURE__ */ c.jsx("span", { className: "perf-label", children: "Avg" }),
          e.avg.toFixed(1)
        ] }),
        /* @__PURE__ */ c.jsxs("div", { children: [
          /* @__PURE__ */ c.jsx("span", { className: "perf-label", children: "Min" }),
          isFinite(e.min) ? e.min.toFixed(1) : "..."
        ] }),
        /* @__PURE__ */ c.jsxs("div", { children: [
          /* @__PURE__ */ c.jsx("span", { className: "perf-label", children: "Max" }),
          e.max.toFixed(1)
        ] }),
        /* @__PURE__ */ c.jsxs("div", { children: [
          /* @__PURE__ */ c.jsx("span", { className: "perf-label", children: "Time" }),
          r.toFixed(1),
          " ms"
        ] })
      ] }),
      /* @__PURE__ */ c.jsx(Ms, { data: e.history, color: v(e.current), max: 90 })
    ] }),
    /* @__PURE__ */ c.jsxs("div", { className: "perf-stat-group", children: [
      /* @__PURE__ */ c.jsxs("div", { className: "perf-header", children: [
        /* @__PURE__ */ c.jsx("h4", { className: "perf-title", children: "Memory (MB)" }),
        /* @__PURE__ */ c.jsx("span", { className: "perf-current", style: { color: y(i.used, i.limit) }, children: i.used })
      ] }),
      /* @__PURE__ */ c.jsxs("div", { className: "perf-details-grid", children: [
        /* @__PURE__ */ c.jsxs("div", { children: [
          /* @__PURE__ */ c.jsx("span", { className: "perf-label", children: "Limit" }),
          i.limit
        ] }),
        /* @__PURE__ */ c.jsxs("div", { children: [
          /* @__PURE__ */ c.jsx("span", { className: "perf-label", children: "Usage" }),
          i.limit > 0 ? (i.used / i.limit * 100).toFixed(0) : 0,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ c.jsx(Ms, { data: i.history, color: y(i.used, i.limit), max: i.limit || 1 })
    ] }),
    /* @__PURE__ */ c.jsxs("div", { className: "perf-stat-group", children: [
      /* @__PURE__ */ c.jsx("div", { className: "perf-header", children: /* @__PURE__ */ c.jsx("h4", { className: "perf-title", children: "Rendering" }) }),
      /* @__PURE__ */ c.jsxs("div", { className: "perf-details-grid", children: [
        /* @__PURE__ */ c.jsxs("div", { children: [
          /* @__PURE__ */ c.jsx("span", { className: "perf-label", children: "Draws" }),
          n.render.calls
        ] }),
        /* @__PURE__ */ c.jsxs("div", { children: [
          /* @__PURE__ */ c.jsx("span", { className: "perf-label", children: "Tris" }),
          (n.render.triangles / 1e3).toFixed(1),
          "K"
        ] }),
        /* @__PURE__ */ c.jsxs("div", { children: [
          /* @__PURE__ */ c.jsx("span", { className: "perf-label", children: "Geometries" }),
          n.engine.geometries
        ] }),
        /* @__PURE__ */ c.jsxs("div", { children: [
          /* @__PURE__ */ c.jsx("span", { className: "perf-label", children: "Textures" }),
          n.engine.textures
        ] })
      ] })
    ] })
  ] });
}
const Ml = () => {
  const n = Y((s) => s.mode), e = Y((s) => s.setMode), t = (s) => {
    e({
      type: s,
      controller: "keyboard",
      control: s === "airplane" || s === "vehicle" ? "chase" : "thirdPerson"
    });
  }, i = [
    { type: "character", label: "Character", description: "Walk around as character" },
    { type: "vehicle", label: "Vehicle", description: "Drive a ground vehicle" },
    { type: "airplane", label: "Airplane", description: "Fly an airplane" }
  ];
  return /* @__PURE__ */ c.jsxs("div", { className: "vehicle-panel", children: [
    /* @__PURE__ */ c.jsx("div", { className: "vehicle-panel__modes", children: i.map((s) => /* @__PURE__ */ c.jsxs(
      "button",
      {
        className: `vehicle-panel__mode-button ${n.type === s.type ? "vehicle-panel__mode-button--active" : ""}`,
        onClick: () => t(s.type),
        children: [
          /* @__PURE__ */ c.jsx("span", { className: "vehicle-panel__mode-label", children: s.label }),
          /* @__PURE__ */ c.jsx("span", { className: "vehicle-panel__mode-description", children: s.description })
        ]
      },
      s.type
    )) }),
    /* @__PURE__ */ c.jsxs("div", { className: "vehicle-panel__info", children: [
      /* @__PURE__ */ c.jsxs("div", { className: "vehicle-panel__info-item", children: [
        /* @__PURE__ */ c.jsx("span", { className: "vehicle-panel__info-label", children: "Current Mode:" }),
        /* @__PURE__ */ c.jsx("span", { className: "vehicle-panel__info-value", children: n.type })
      ] }),
      /* @__PURE__ */ c.jsxs("div", { className: "vehicle-panel__info-item", children: [
        /* @__PURE__ */ c.jsx("span", { className: "vehicle-panel__info-label", children: "Controls:" }),
        /* @__PURE__ */ c.jsx("span", { className: "vehicle-panel__info-value", children: n.type === "airplane" ? "WASD + Space/Shift" : "WASD + Space" })
      ] })
    ] })
  ] });
}, Cl = () => {
  const n = de((d) => d.editMode), e = de((d) => d.setEditMode), t = de((d) => d.currentTileMultiplier), i = de((d) => d.setTileMultiplier), s = de((d) => d.selectedTileObjectType), r = de((d) => d.setSelectedTileObjectType), o = de((d) => d.snapToGrid), a = de((d) => d.setSnapToGrid), l = [
    { type: "none", label: "None", description: "No building mode" },
    { type: "wall", label: "Wall", description: "Place wall segments" },
    { type: "tile", label: "Tile", description: "Place floor tiles" },
    { type: "npc", label: "NPC", description: "Place NPC entities" }
  ], u = [
    { type: "none", label: "None" },
    { type: "grass", label: "Grass" },
    { type: "water", label: "Water" },
    { type: "flag", label: "Flag" }
  ];
  return /* @__PURE__ */ c.jsxs("div", { className: "building-panel", children: [
    /* @__PURE__ */ c.jsxs("div", { className: "building-panel__section", children: [
      /* @__PURE__ */ c.jsx("div", { className: "building-panel__section-title", children: "Edit Mode" }),
      /* @__PURE__ */ c.jsx("div", { className: "building-panel__modes", children: l.map((d) => /* @__PURE__ */ c.jsxs(
        "button",
        {
          className: `building-panel__mode-btn ${n === d.type ? "building-panel__mode-btn--active" : ""}`,
          onClick: () => e(d.type),
          children: [
            /* @__PURE__ */ c.jsx("span", { className: "building-panel__mode-label", children: d.label }),
            /* @__PURE__ */ c.jsx("span", { className: "building-panel__mode-desc", children: d.description })
          ]
        },
        d.type
      )) })
    ] }),
    /* @__PURE__ */ c.jsxs("div", { className: "building-panel__section", children: [
      /* @__PURE__ */ c.jsx("div", { className: "building-panel__section-title", children: "Tile Object" }),
      /* @__PURE__ */ c.jsx("div", { className: "building-panel__grid", children: u.map((d) => /* @__PURE__ */ c.jsx(
        "button",
        {
          className: `building-panel__grid-btn ${s === d.type ? "building-panel__grid-btn--active" : ""}`,
          onClick: () => r(d.type),
          children: d.label
        },
        d.type
      )) })
    ] }),
    /* @__PURE__ */ c.jsxs("div", { className: "building-panel__section", children: [
      /* @__PURE__ */ c.jsx("div", { className: "building-panel__section-title", children: "Tile Settings" }),
      /* @__PURE__ */ c.jsxs("div", { className: "building-panel__info", children: [
        /* @__PURE__ */ c.jsxs("div", { className: "building-panel__info-item", children: [
          /* @__PURE__ */ c.jsx("span", { className: "building-panel__info-label", children: "Size" }),
          /* @__PURE__ */ c.jsxs("div", { className: "building-panel__stepper", children: [
            /* @__PURE__ */ c.jsx(
              "button",
              {
                className: "building-panel__stepper-btn",
                onClick: () => i(Math.max(1, t - 1)),
                children: "-"
              }
            ),
            /* @__PURE__ */ c.jsx("span", { className: "building-panel__stepper-value", children: t }),
            /* @__PURE__ */ c.jsx(
              "button",
              {
                className: "building-panel__stepper-btn",
                onClick: () => i(Math.min(4, t + 1)),
                children: "+"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ c.jsxs("div", { className: "building-panel__info-item", children: [
          /* @__PURE__ */ c.jsx("span", { className: "building-panel__info-label", children: "Snap to Grid" }),
          /* @__PURE__ */ c.jsx(
            "button",
            {
              className: `building-panel__toggle ${o ? "building-panel__toggle--on" : ""}`,
              onClick: () => a(!o),
              children: o ? "ON" : "OFF"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ c.jsxs("div", { className: "building-panel__info", style: { marginTop: "auto" }, children: [
      /* @__PURE__ */ c.jsxs("div", { className: "building-panel__info-item", children: [
        /* @__PURE__ */ c.jsx("span", { className: "building-panel__info-label", children: "Current Mode" }),
        /* @__PURE__ */ c.jsx("span", { className: "building-panel__info-value", children: n })
      ] }),
      /* @__PURE__ */ c.jsxs("div", { className: "building-panel__info-item", children: [
        /* @__PURE__ */ c.jsx("span", { className: "building-panel__info-label", children: "Object Type" }),
        /* @__PURE__ */ c.jsx("span", { className: "building-panel__info-value", children: s })
      ] })
    ] })
  ] });
}, Pl = () => /* @__PURE__ */ c.jsx("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ c.jsx("line", { x1: "5", y1: "12", x2: "19", y2: "12" }) }), jl = () => /* @__PURE__ */ c.jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ c.jsx("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
  /* @__PURE__ */ c.jsx("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
] }), ei = ({
  children: n,
  title: e,
  initialWidth: t = 280,
  initialHeight: i = 400,
  minWidth: s = 200,
  minHeight: r = 150,
  maxWidth: o = 600,
  maxHeight: a = 800,
  resizeHandles: l = ["right"],
  className: u = "",
  style: d = {},
  onClose: f,
  onMinimize: h,
  draggable: g = !0,
  onDrop: v
}) => {
  const [y, p] = q({ width: t, height: i }), [m, x] = q({ x: 0, y: 0 }), [M, P] = q(!1), [I, k] = q(!1), [R, $] = q(""), [D, J] = q({ x: 0, y: 0 }), W = C(null), Z = C(null), oe = _((he) => (ue) => {
    ue.preventDefault(), P(!0), $(he);
  }, []), le = _((he) => {
    if (W.current)
      if (M) {
        const ue = W.current.getBoundingClientRect();
        let xe = y.width, be = y.height;
        R.includes("right") && (xe = Math.min(o, Math.max(s, he.clientX - ue.left))), R.includes("bottom") && (be = Math.min(a, Math.max(r, he.clientY - ue.top))), p({ width: xe, height: be });
      } else I && x({
        x: he.clientX - D.x,
        y: he.clientY - D.y
      });
  }, [M, I, R, y, s, o, r, a, D]), ge = _(() => {
    I && v && v(m.x, m.y), P(!1), k(!1), $("");
  }, [I, v, m]), me = _((he) => {
    if (!g || M) return;
    he.preventDefault(), k(!0);
    const ue = W.current?.getBoundingClientRect();
    ue && J({
      x: he.clientX - ue.left,
      y: he.clientY - ue.top
    });
  }, [g, M]);
  return z(() => {
    if (M || I)
      return document.addEventListener("mousemove", le), document.addEventListener("mouseup", ge), () => {
        document.removeEventListener("mousemove", le), document.removeEventListener("mouseup", ge);
      };
  }, [M, I, le, ge]), /* @__PURE__ */ c.jsxs(
    "div",
    {
      ref: W,
      className: `rp-panel ${u} ${I ? "dragging" : ""}`,
      style: {
        width: `${y.width}px`,
        height: `${y.height}px`,
        ...I ? {
          position: "fixed",
          left: `${m.x}px`,
          top: `${m.y}px`,
          zIndex: 10003
        } : {},
        ...d
      },
      children: [
        /* @__PURE__ */ c.jsxs(
          "div",
          {
            ref: Z,
            className: "rp-header",
            onMouseDown: me,
            children: [
              /* @__PURE__ */ c.jsx("h3", { className: "rp-title", children: e }),
              /* @__PURE__ */ c.jsxs("div", { className: "rp-controls", children: [
                h && /* @__PURE__ */ c.jsx("button", { className: "rp-btn", onClick: h, title: "Minimize", children: /* @__PURE__ */ c.jsx(Pl, {}) }),
                f && /* @__PURE__ */ c.jsx("button", { className: "rp-btn", onClick: f, title: "Close", children: /* @__PURE__ */ c.jsx(jl, {}) })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ c.jsx("div", { className: "rp-content", children: n }),
        l.map((he) => /* @__PURE__ */ c.jsx(
          "div",
          {
            className: `rp-resize-handle handle-${he}`,
            onMouseDown: oe(he.replace("corner", "right bottom"))
          },
          he
        ))
      ]
    }
  );
}, Il = ({ children: n }) => {
  const [e, t] = q(["building", "vehicle", "performance"]), [i, s] = q([]), [r, o] = q([]), a = [
    { id: "building", title: "Building", component: /* @__PURE__ */ c.jsx(Cl, {}), defaultSide: "left" },
    { id: "animation", title: "Animation", component: /* @__PURE__ */ c.jsx(xl, {}), defaultSide: "left" },
    { id: "camera", title: "Camera", component: /* @__PURE__ */ c.jsx(bl, {}), defaultSide: "left" },
    { id: "motion", title: "Motion", component: /* @__PURE__ */ c.jsx(wl, {}), defaultSide: "right" },
    { id: "performance", title: "Performance", component: /* @__PURE__ */ c.jsx(Sl, {}), defaultSide: "right" },
    { id: "vehicle", title: "Vehicle", component: /* @__PURE__ */ c.jsx(Ml, {}), defaultSide: "left" }
  ], l = (p) => {
    t((m) => m.includes(p) ? m.filter((x) => x !== p) : [...m, p]), o((m) => m.filter((x) => x !== p));
  }, u = (p) => {
    t((m) => m.filter((x) => x !== p)), s((m) => m.filter((x) => x.id !== p)), o((m) => m.filter((x) => x !== p));
  }, d = (p) => {
    o((m) => [...m, p]), t((m) => m.filter((x) => x !== p)), s((m) => m.filter((x) => x.id !== p));
  }, f = (p) => {
    o((m) => m.filter((x) => x !== p)), t((m) => [...m, p]);
  }, h = (p, m, x) => {
    const M = i.find((P) => P.id === p);
    s(M ? (P) => P.map(
      (I) => I.id === p ? { ...I, x: m, y: x } : I
    ) : (P) => [...P, {
      id: p,
      x: m,
      y: x,
      width: 300,
      height: 400
    }]);
  }, g = () => a.filter(
    (p) => e.includes(p.id) && p.defaultSide === "left" && !i.some((m) => m.id === p.id)
  ), v = () => a.filter(
    (p) => e.includes(p.id) && p.defaultSide === "right" && !i.some((m) => m.id === p.id)
  ), y = () => i.filter((p) => e.includes(p.id));
  return /* @__PURE__ */ c.jsxs("div", { className: "editor-root", children: [
    /* @__PURE__ */ c.jsx("div", { className: "editor-panel-bar", children: a.map((p) => /* @__PURE__ */ c.jsx(
      "button",
      {
        onClick: () => l(p.id),
        className: `editor-panel-toggle ${e.includes(p.id) ? "active" : ""}`,
        title: p.title,
        children: p.title
      },
      p.id
    )) }),
    g().length > 0 && /* @__PURE__ */ c.jsx("div", { className: "editor-left-stack", children: g().map((p, m) => /* @__PURE__ */ c.jsx(
      ei,
      {
        title: p.title,
        initialWidth: 280,
        initialHeight: Math.max(300, (window.innerHeight - 120) / g().length),
        minWidth: 200,
        maxWidth: 500,
        resizeHandles: ["right"],
        className: "editor-glass-panel",
        style: {
          marginBottom: m < g().length - 1 ? "8px" : "0"
        },
        onClose: () => u(p.id),
        onMinimize: () => d(p.id),
        onDrop: (x, M) => h(p.id, x, M),
        children: p.component
      },
      p.id
    )) }),
    v().length > 0 && /* @__PURE__ */ c.jsx("div", { className: "editor-right-stack", children: v().map((p, m) => /* @__PURE__ */ c.jsx(
      ei,
      {
        title: p.title,
        initialWidth: 320,
        initialHeight: Math.max(300, (window.innerHeight - 120) / v().length),
        minWidth: 200,
        maxWidth: 500,
        resizeHandles: ["corner"],
        className: "editor-glass-panel",
        style: {
          marginBottom: m < v().length - 1 ? "8px" : "0"
        },
        onClose: () => u(p.id),
        onMinimize: () => d(p.id),
        onDrop: (x, M) => h(p.id, x, M),
        children: p.component
      },
      p.id
    )) }),
    y().map((p) => {
      const m = a.find((x) => x.id === p.id);
      return m ? /* @__PURE__ */ c.jsx(
        ei,
        {
          title: m.title,
          initialWidth: p.width,
          initialHeight: p.height,
          minWidth: 200,
          maxWidth: 800,
          resizeHandles: ["right", "bottom", "corner"],
          className: "editor-glass-panel",
          style: {
            position: "fixed",
            left: `${p.x}px`,
            top: `${p.y}px`,
            zIndex: 1001
          },
          onClose: () => u(m.id),
          onMinimize: () => d(m.id),
          onDrop: (x, M) => h(m.id, x, M),
          children: m.component
        },
        p.id
      ) : null;
    }),
    r.length > 0 && /* @__PURE__ */ c.jsx("div", { className: "editor-minimized-dock", children: r.map((p) => {
      const m = a.find((x) => x.id === p);
      return m ? /* @__PURE__ */ c.jsx(
        "button",
        {
          onClick: () => f(p),
          className: "editor-minimized-item",
          title: `Restore ${m.title}`,
          children: m.title
        },
        p
      ) : null;
    }) }),
    n
  ] });
}, Ru = ({
  children: n,
  className: e = "",
  style: t = {}
}) => /* @__PURE__ */ c.jsx(
  "div",
  {
    className: `gaesup-editor ${e}`,
    style: {
      ...t
    },
    children: /* @__PURE__ */ c.jsx(Il, { children: n })
  }
), _l = (n) => ({
  selectedObjectIds: [],
  setSelectedObjectIds: (e) => n({ selectedObjectIds: e }),
  layoutConfig: null,
  setLayoutConfig: (e) => n({ layoutConfig: e }),
  activeNodeGraph: null,
  setActiveNodeGraph: (e) => n({ activeNodeGraph: e }),
  clipboard: null,
  setClipboard: (e) => n({ clipboard: e })
});
ft(_l);
Hs();
const Me = ft()(
  Qs((n, e) => ({
    initialized: !1,
    templates: /* @__PURE__ */ new Map(),
    instances: /* @__PURE__ */ new Map(),
    categories: /* @__PURE__ */ new Map(),
    clothingSets: /* @__PURE__ */ new Map(),
    clothingCategories: /* @__PURE__ */ new Map(),
    animations: /* @__PURE__ */ new Map(),
    editMode: !1,
    previewAccessories: {},
    initializeDefaults: () => n((t) => {
      t.initialized || (t.animations.set("idle", {
        id: "idle",
        name: "Idle",
        loop: !0,
        speed: 1
      }), t.animations.set("walk", {
        id: "walk",
        name: "Walk",
        loop: !0,
        speed: 1
      }), t.animations.set("greet", {
        id: "greet",
        name: "Greet",
        loop: !1,
        speed: 1
      }), t.animations.set("jump", {
        id: "jump",
        name: "Jump",
        loop: !1,
        speed: 1
      }), t.animations.set("run", {
        id: "run",
        name: "Run",
        loop: !0,
        speed: 1.5
      }), t.clothingCategories.set("basic", {
        id: "basic",
        name: "기본 의상",
        description: "Basic clothing sets",
        clothingSetIds: ["rabbit-outfit", "basic-suit", "formal-suit"]
      }), t.clothingCategories.set("accessories", {
        id: "accessories",
        name: "액세서리",
        description: "Hats and glasses",
        clothingSetIds: ["hat-set-a", "hat-set-b", "hat-set-c", "glass-set-a", "glass-set-b"]
      }), t.clothingSets.set("rabbit-outfit", {
        id: "rabbit-outfit",
        name: "토끼옷",
        category: "casual",
        parts: [
          {
            id: "rabbit-cloth",
            type: "top",
            url: "gltf/ally_cloth_rabbit.glb",
            position: [0, 0, 0]
          }
        ]
      }), t.clothingSets.set("basic-suit", {
        id: "basic-suit",
        name: "양복",
        category: "formal",
        parts: [
          {
            id: "basic-suit-cloth",
            type: "top",
            url: "gltf/ally_cloth.glb",
            position: [0, 0, 0]
          }
        ]
      }), t.clothingSets.set("formal-suit", {
        id: "formal-suit",
        name: "양복 2",
        category: "formal",
        parts: [
          {
            id: "formal-suit-cloth",
            type: "top",
            url: "gltf/formal.glb",
            position: [0, 0, 0]
          }
        ]
      }), t.clothingSets.set("hat-set-a", {
        id: "hat-set-a",
        name: "모자 A",
        category: "casual",
        parts: [
          {
            id: "hat-a",
            type: "hat",
            url: "gltf/hat_a.glb",
            position: [0, 0, 0]
          }
        ]
      }), t.clothingSets.set("hat-set-b", {
        id: "hat-set-b",
        name: "모자 B",
        category: "casual",
        parts: [
          {
            id: "hat-b",
            type: "hat",
            url: "gltf/hat_b.glb",
            position: [0, 0, 0]
          }
        ]
      }), t.clothingSets.set("hat-set-c", {
        id: "hat-set-c",
        name: "모자 C",
        category: "casual",
        parts: [
          {
            id: "hat-c",
            type: "hat",
            url: "gltf/hat_c.glb",
            position: [0, 0, 0]
          }
        ]
      }), t.clothingSets.set("glass-set-a", {
        id: "glass-set-a",
        name: "안경 A",
        category: "casual",
        parts: [
          {
            id: "glass-a",
            type: "glasses",
            url: "gltf/glass_a.glb",
            position: [0, 0, 0]
          }
        ]
      }), t.clothingSets.set("glass-set-b", {
        id: "glass-set-b",
        name: "슈퍼 안경",
        category: "casual",
        parts: [
          {
            id: "super-glass",
            type: "glasses",
            url: "gltf/super_glass.glb",
            position: [0, 0, 0]
          }
        ]
      }), t.categories.set("humanoid", {
        id: "humanoid",
        name: "캐릭터",
        description: "Human-like characters",
        templateIds: ["ally", "oneyee"]
      }), t.templates.set("ally", {
        id: "ally",
        name: "올춘삼",
        description: "Ally character",
        category: "humanoid",
        baseParts: [
          {
            id: "ally-body",
            type: "body",
            url: "gltf/ally_body.glb",
            position: [0, 0, 0]
          }
        ],
        clothingParts: [],
        defaultAnimation: "idle",
        defaultClothingSet: "rabbit-outfit"
      }), t.templates.set("oneyee", {
        id: "oneyee",
        name: "원덕배",
        description: "Oneyee character",
        category: "humanoid",
        baseParts: [
          {
            id: "oneyee-body",
            type: "body",
            url: "gltf/oneyee.glb",
            position: [0, 0, 0]
          }
        ],
        clothingParts: [],
        defaultAnimation: "idle",
        defaultClothingSet: "basic-suit"
      }), t.selectedCategoryId = "humanoid", t.selectedTemplateId = "ally", t.selectedClothingCategoryId = "basic", t.selectedClothingSetId = "rabbit-outfit", t.initialized = !0);
    }),
    addTemplate: (t) => n((i) => {
      i.templates.set(t.id, t);
    }),
    updateTemplate: (t, i) => n((s) => {
      const r = s.templates.get(t);
      r && s.templates.set(t, { ...r, ...i });
    }),
    removeTemplate: (t) => n((i) => {
      i.templates.delete(t);
    }),
    addInstance: (t) => n((i) => {
      i.instances.set(t.id, t);
    }),
    updateInstance: (t, i) => n((s) => {
      const r = s.instances.get(t);
      r && s.instances.set(t, { ...r, ...i });
    }),
    removeInstance: (t) => n((i) => {
      i.instances.delete(t);
    }),
    addCategory: (t) => n((i) => {
      i.categories.set(t.id, t);
    }),
    updateCategory: (t, i) => n((s) => {
      const r = s.categories.get(t);
      r && s.categories.set(t, { ...r, ...i });
    }),
    removeCategory: (t) => n((i) => {
      i.categories.delete(t);
    }),
    addClothingSet: (t) => n((i) => {
      i.clothingSets.set(t.id, t);
    }),
    updateClothingSet: (t, i) => n((s) => {
      const r = s.clothingSets.get(t);
      r && s.clothingSets.set(t, { ...r, ...i });
    }),
    removeClothingSet: (t) => n((i) => {
      i.clothingSets.delete(t);
    }),
    addClothingCategory: (t) => n((i) => {
      i.clothingCategories.set(t.id, t);
    }),
    updateClothingCategory: (t, i) => n((s) => {
      const r = s.clothingCategories.get(t);
      r && s.clothingCategories.set(t, { ...r, ...i });
    }),
    removeClothingCategory: (t) => n((i) => {
      i.clothingCategories.delete(t);
    }),
    addAnimation: (t) => n((i) => {
      i.animations.set(t.id, t);
    }),
    updateAnimation: (t, i) => n((s) => {
      const r = s.animations.get(t);
      r && s.animations.set(t, { ...r, ...i });
    }),
    removeAnimation: (t) => n((i) => {
      i.animations.delete(t);
    }),
    setSelectedTemplate: (t) => n((i) => {
      i.selectedTemplateId = t;
    }),
    setSelectedCategory: (t) => n((i) => {
      i.selectedCategoryId = t;
      const s = i.categories.get(t);
      if (s && s.templateIds.length > 0) {
        const r = s.templateIds[0];
        r && (i.selectedTemplateId = r);
      } else
        delete i.selectedTemplateId;
    }),
    setSelectedInstance: (t) => n((i) => {
      i.selectedInstanceId = t;
    }),
    setSelectedClothingSet: (t) => n((i) => {
      i.selectedClothingSetId = t;
    }),
    setSelectedClothingCategory: (t) => n((i) => {
      i.selectedClothingCategoryId = t;
      const s = i.clothingCategories.get(t);
      if (s && s.clothingSetIds.length > 0) {
        const r = s.clothingSetIds[0];
        r && (i.selectedClothingSetId = r);
      } else
        delete i.selectedClothingSetId;
    }),
    setEditMode: (t) => n((i) => {
      i.editMode = t;
    }),
    createInstanceFromTemplate: (t, i) => {
      const s = e().templates.get(t);
      if (!s) return;
      const r = `npc-${Date.now()}`, o = e().selectedClothingSetId || s.defaultClothingSet, a = [], l = e().previewAccessories.hat;
      if (l) {
        const h = e().clothingSets.get(l)?.parts[0];
        h && a.push(h);
      }
      const u = e().previewAccessories.glasses;
      if (u) {
        const h = e().clothingSets.get(u)?.parts[0];
        h && a.push(h);
      }
      const d = {
        id: r,
        templateId: t,
        name: `${s.name} ${Date.now()}`,
        position: i,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        ...s.defaultAnimation ? { currentAnimation: s.defaultAnimation } : {},
        ...o ? { currentClothingSetId: o } : {},
        ...a.length > 0 ? { customParts: a } : {},
        events: []
      };
      e().addInstance(d), e().setSelectedInstance(r);
    },
    updateInstancePart: (t, i, s) => n((r) => {
      const o = r.instances.get(t);
      if (!o) return;
      const a = o.customParts || [], l = a.findIndex((u) => u.id === i);
      if (l >= 0) {
        const u = a[l];
        a[l] = {
          ...u,
          ...s,
          id: u.id,
          type: u.type,
          url: u.url
        };
      } else {
        const u = s.type ?? "accessory", d = s.url ?? "";
        a.push({
          id: i,
          type: u,
          url: d,
          ...s.category !== void 0 ? { category: s.category } : {},
          ...s.position !== void 0 ? { position: s.position } : {},
          ...s.rotation !== void 0 ? { rotation: s.rotation } : {},
          ...s.scale !== void 0 ? { scale: s.scale } : {},
          ...s.color !== void 0 ? { color: s.color } : {},
          ...s.metadata !== void 0 ? { metadata: s.metadata } : {}
        });
      }
      r.instances.set(t, { ...o, customParts: a });
    }),
    changeInstanceClothing: (t, i) => n((s) => {
      const r = s.instances.get(t);
      r && s.instances.set(t, { ...r, currentClothingSetId: i });
    }),
    addInstanceEvent: (t, i) => n((s) => {
      const r = s.instances.get(t);
      if (r) {
        const o = r.events || [];
        o.push(i), s.instances.set(t, { ...r, events: o });
      }
    }),
    removeInstanceEvent: (t, i) => n((s) => {
      const r = s.instances.get(t);
      if (r && r.events) {
        const o = r.events.filter((a) => a.id !== i);
        s.instances.set(t, { ...r, events: o });
      }
    }),
    setPreviewAccessory: (t, i) => n((s) => {
      i ? s.previewAccessories[t] = i : delete s.previewAccessories[t];
    })
  }))
);
function Tl({ part: n }) {
  return /* @__PURE__ */ c.jsxs(
    "mesh",
    {
      position: n.position || [0, 0, 0],
      rotation: n.rotation || [0, 0, 0],
      scale: n.scale || [1, 1, 1],
      children: [
        /* @__PURE__ */ c.jsx("boxGeometry", { args: [0.5, 1.8, 0.5] }),
        /* @__PURE__ */ c.jsx(
          "meshStandardMaterial",
          {
            color: "royalblue",
            transparent: !0,
            opacity: 0.7
          }
        )
      ]
    }
  );
}
function kl() {
  const n = de((u) => u.editMode), e = de((u) => u.hoverPosition), { templates: t, clothingSets: i, selectedTemplateId: s, selectedClothingSetId: r, previewAccessories: o } = Me();
  if (n !== "npc" || !e || !s)
    return null;
  const a = t.get(s);
  if (!a)
    return null;
  const l = [];
  if (l.push(...a.baseParts), r) {
    const u = i.get(r);
    u && l.push(...u.parts);
  }
  if (o.hat) {
    const u = i.get(o.hat);
    if (u && u.parts.length > 0) {
      const d = u.parts[0];
      d && l.push(d);
    }
  }
  if (o.glasses) {
    const u = i.get(o.glasses);
    if (u && u.parts.length > 0) {
      const d = u.parts[0];
      d && l.push(d);
    }
  }
  return /* @__PURE__ */ c.jsxs("group", { position: [e.x, e.y, e.z], children: [
    l.map((u) => /* @__PURE__ */ c.jsx(Tl, { part: u }, u.id)),
    /* @__PURE__ */ c.jsxs("mesh", { position: [0, 0.01, 0], rotation: [-Math.PI / 2, 0, 0], children: [
      /* @__PURE__ */ c.jsx("circleGeometry", { args: [1, 32] }),
      /* @__PURE__ */ c.jsx(
        "meshStandardMaterial",
        {
          color: "#00ff00",
          transparent: !0,
          opacity: 0.3,
          emissive: "#00ff00",
          emissiveIntensity: 0.3
        }
      )
    ] })
  ] });
}
function Al({
  size: n = Ae.DEFAULT_GRID_SIZE,
  divisions: e = n / Ae.GRID_CELL_SIZE,
  color1: t = "#888888",
  color2: i = "#444444"
}) {
  return /* @__PURE__ */ c.jsx(
    "gridHelper",
    {
      args: [n, e, t, i],
      position: [0, 0.01, 0]
    }
  );
}
function Rl() {
  const { editMode: n, hoverPosition: e, checkTilePosition: t, currentTileMultiplier: i } = de(), s = Ae.GRID_CELL_SIZE * i;
  if (n !== "tile" || !e)
    return null;
  const o = t(e) ? "#ff0000" : "#00ff00";
  return /* @__PURE__ */ c.jsxs("mesh", { position: [e.x, e.y + 0.05, e.z], children: [
    /* @__PURE__ */ c.jsx("boxGeometry", { args: [s, 0.1, s] }),
    /* @__PURE__ */ c.jsx(
      "meshStandardMaterial",
      {
        color: o,
        transparent: !0,
        opacity: 0.5,
        emissive: o,
        emissiveIntensity: 0.3
      }
    )
  ] });
}
function zl() {
  const { editMode: n, hoverPosition: e, currentWallRotation: t, checkWallPosition: i } = de(), s = Ae.WALL_SIZES.WIDTH, r = Ae.WALL_SIZES.HEIGHT, o = Ae.WALL_SIZES.THICKNESS;
  if (n !== "wall" || !e)
    return null;
  const l = i(e, t) ? "#ff0000" : "#00ff00";
  return /* @__PURE__ */ c.jsx("group", { position: [e.x, e.y + r / 2, e.z], rotation: [0, t, 0], children: /* @__PURE__ */ c.jsxs("mesh", { position: [0, 0, s / 2], children: [
    /* @__PURE__ */ c.jsx("boxGeometry", { args: [s, r, o] }),
    /* @__PURE__ */ c.jsx(
      "meshStandardMaterial",
      {
        color: l,
        transparent: !0,
        opacity: 0.5,
        emissive: l,
        emissiveIntensity: 0.3
      }
    )
  ] }) });
}
var Dl = Object.defineProperty, El = Object.getOwnPropertyDescriptor, pn = (n, e, t, i) => {
  for (var s = El(e, t), r = n.length - 1, o; r >= 0; r--)
    (o = n[r]) && (s = o(e, t, s) || s);
  return s && Dl(e, t, s), s;
};
class Tt {
  materials = /* @__PURE__ */ new Map();
  textures = /* @__PURE__ */ new Map();
  textureLoader;
  constructor() {
    this.textureLoader = new b.TextureLoader();
  }
  getMaterial(e) {
    const t = this.materials.get(e.id);
    if (t) return t;
    const i = this.createMaterial(e);
    return this.materials.set(e.id, i), i;
  }
  createMaterial(e) {
    const t = {
      color: e.color || "#ffffff",
      roughness: e.roughness || 0.5,
      metalness: e.metalness || 0,
      opacity: e.opacity || 1,
      transparent: e.transparent || !1
    };
    return e.material === "GLASS" ? new b.MeshPhysicalMaterial({
      ...t,
      transmission: 0.98,
      roughness: 0.1,
      envMapIntensity: 1
    }) : (e.mapTextureUrl && (t.map = this.loadTexture(e.mapTextureUrl)), e.normalTextureUrl && (t.normalMap = this.loadTexture(e.normalTextureUrl)), new b.MeshStandardMaterial(t));
  }
  // 텍스처는 메모리를 많이 사용할 수 있음
  loadTexture(e) {
    const t = this.textures.get(e);
    if (t) return t;
    const i = this.textureLoader.load(e);
    return i.wrapS = b.RepeatWrapping, i.wrapT = b.RepeatWrapping, i.needsUpdate = !0, this.textures.set(e, i), i;
  }
  updateMaterial(e, t) {
    const i = this.materials.get(e);
    i && i instanceof b.MeshStandardMaterial && (t.color && i.color.set(t.color), t.roughness !== void 0 && (i.roughness = t.roughness), t.metalness !== void 0 && (i.metalness = t.metalness), t.opacity !== void 0 && (i.opacity = t.opacity), i.needsUpdate = !0);
  }
  dispose() {
    this.materials.forEach((e) => e.dispose()), this.materials.clear(), this.textures.forEach((e) => e.dispose()), this.textures.clear();
  }
}
pn([
  G(),
  F()
], Tt.prototype, "getMaterial");
pn([
  G(),
  F()
], Tt.prototype, "createMaterial");
pn([
  G(),
  Jt(20)
], Tt.prototype, "loadTexture");
pn([
  G(),
  F()
], Tt.prototype, "updateMaterial");
pn([
  G()
], Tt.prototype, "dispose");
mi({ Water: Ir });
function Nl({ lod: n, center: e }) {
  const t = C(null), i = As("/resources/waternormals.jpeg"), s = C(new b.Vector3()), r = C(!0), o = C(0);
  z(() => {
    i && (i.wrapS = i.wrapT = b.RepeatWrapping, i.repeat.set(4, 4));
  }, [i]), z(() => {
    e && s.current.set(e[0], e[1], e[2]);
  }, [e]);
  const a = ne(
    () => ({
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: i,
      sunDirection: new b.Vector3(0.1, 0.7, 0.2),
      sunColor: 16777215,
      waterColor: 7695,
      distortionScale: 3.7
    }),
    [i]
  ), l = ne(() => new b.PlaneGeometry(16, 16), []);
  return z(() => () => {
    l.dispose();
    const u = t.current;
    u?.material?.dispose?.(), typeof u?.dispose == "function" && u.dispose();
  }, [l]), Ke((u, d) => {
    const f = t.current;
    if (!f) return;
    if (n) {
      o.current += Math.max(0, d);
      const g = r.current ? 0.2 : 0.5;
      if (o.current >= g) {
        o.current = 0;
        const v = n.near ?? 30, y = n.far ?? 180, p = n.strength ?? 4, m = u.camera.position.distanceTo(s.current), M = ki(m, v, y, p) > 0;
        M !== r.current && (r.current = M, f.visible = M);
      }
      if (!r.current) return;
    }
    const h = f.material.uniforms?.time;
    h && (h.value += d * 0.3);
  }), /* @__PURE__ */ c.jsx(
    "water",
    {
      ref: t,
      args: [l, a],
      "rotation-x": -Math.PI / 2,
      position: [0, 0.1, 0]
    }
  );
}
const ur = /* @__PURE__ */ Math.sqrt(3), Ol = 0.5 * (ur - 1), nn = (3 - ur) / 6, Cs = (n) => Math.floor(n) | 0, Ps = /* @__PURE__ */ new Float64Array([
  1,
  1,
  -1,
  1,
  1,
  -1,
  -1,
  -1,
  1,
  0,
  -1,
  0,
  1,
  0,
  -1,
  0,
  0,
  1,
  0,
  -1,
  0,
  1,
  0,
  -1
]);
function Ll(n = Math.random) {
  const e = Gl(n), t = new Float64Array(e).map((s) => Ps[s % 12 * 2]), i = new Float64Array(e).map((s) => Ps[s % 12 * 2 + 1]);
  return function(r, o) {
    let a = 0, l = 0, u = 0;
    const d = (r + o) * Ol, f = Cs(r + d), h = Cs(o + d), g = (f + h) * nn, v = f - g, y = h - g, p = r - v, m = o - y;
    let x, M;
    p > m ? (x = 1, M = 0) : (x = 0, M = 1);
    const P = p - x + nn, I = m - M + nn, k = p - 1 + 2 * nn, R = m - 1 + 2 * nn, $ = f & 255, D = h & 255;
    let J = 0.5 - p * p - m * m;
    if (J >= 0) {
      const oe = $ + e[D], le = t[oe], ge = i[oe];
      J *= J, a = J * J * (le * p + ge * m);
    }
    let W = 0.5 - P * P - I * I;
    if (W >= 0) {
      const oe = $ + x + e[D + M], le = t[oe], ge = i[oe];
      W *= W, l = W * W * (le * P + ge * I);
    }
    let Z = 0.5 - k * k - R * R;
    if (Z >= 0) {
      const oe = $ + 1 + e[D + 1], le = t[oe], ge = i[oe];
      Z *= Z, u = Z * Z * (le * k + ge * R);
    }
    return 70 * (a + l + u);
  };
}
function Gl(n) {
  const t = new Uint8Array(512);
  for (let i = 0; i < 512 / 2; i++)
    t[i] = i;
  for (let i = 0; i < 512 / 2 - 1; i++) {
    const s = i + ~~(n() * (256 - i)), r = t[i];
    t[i] = t[s], t[s] = r;
  }
  for (let i = 256; i < 512; i++)
    t[i] = t[i - 256];
  return t;
}
const Fl = "/resources/blade_alpha.jpg", Ul = "/resources/blade_diffuse.jpg";
var $l = `precision highp float;\r
uniform sampler2D map;\r
uniform sampler2D alphaMap;\r
uniform vec3 tipColor;\r
uniform vec3 bottomColor;\r
varying vec2 vUv;\r
varying float frc;

void main() {\r
  float alpha = texture2D(alphaMap, vUv).r;\r
  if(alpha < 0.15)\r
    discard;\r
  vec4 col = texture2D(map, vUv);\r
  col = mix(vec4(bottomColor, 1.0), col, frc);\r
  col = mix(col, vec4(tipColor, 1.0), 1.0 - frc);

  col.rgb = col.rgb / (col.rgb + vec3(1.0));\r
  col.rgb = pow(col.rgb, vec3(1.0 / 2.2));

  gl_FragColor = col;\r
}`, Vl = `precision highp float;\r
attribute vec3 offset;\r
attribute vec4 orientation;\r
attribute float halfRootAngleSin;\r
attribute float halfRootAngleCos;\r
attribute float stretch;\r
uniform float time;\r
uniform float bladeHeight;\r
varying vec2 vUv;\r
varying float frc;

vec3 mod289(vec3 x) {\r
  return x - floor(x * (1.0 / 289.0)) * 289.0;\r
}\r
vec2 mod289(vec2 x) {\r
  return x - floor(x * (1.0 / 289.0)) * 289.0;\r
}\r
vec3 permute(vec3 x) {\r
  return mod289(((x * 34.0) + 1.0) * x);\r
}

float snoise(vec2 v) {\r
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);\r
  vec2 i = floor(v + dot(v, C.yy));\r
  vec2 x0 = v - i + dot(i, C.xx);\r
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\r
  vec4 x12 = x0.xyxy + C.xxzz;\r
  x12.xy -= i1;\r
  i = mod289(i);\r
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));\r
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);\r
  m = m * m;\r
  m = m * m;\r
  vec3 x = 2.0 * fract(p * C.www) - 1.0;\r
  vec3 h = abs(x) - 0.5;\r
  vec3 ox = floor(x + 0.5);\r
  vec3 a0 = x - ox;\r
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);\r
  vec3 g;\r
  g.x = a0.x * x0.x + h.x * x0.y;\r
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;\r
  return 130.0 * dot(m, g);\r
}

vec3 rotateVectorByQuaternion(vec3 v, vec4 q) {\r
  return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);\r
}

void main() {\r
  frc = position.y / float(bladeHeight);\r
  float noise = 1.0 - snoise(vec2((time - offset.x / 50.0), (time - offset.z / 50.0)));\r
  vec4 direction = vec4(0.0, halfRootAngleSin, 0.0, halfRootAngleCos);\r
  vec4 tiltAxis = vec4(-orientation.z, 0.0, orientation.x, orientation.w);\r
  vec4 bent = normalize(mix(direction, tiltAxis, frc));\r
  vec3 vPosition = vec3(position.x, position.y + position.y * stretch, position.z);\r
  vPosition = rotateVectorByQuaternion(vPosition, bent);

  float windAngle = noise * 0.3;\r
  vec4 windQuat = vec4(sin(windAngle), 0.0, -sin(windAngle), cos(windAngle));\r
  vPosition = rotateVectorByQuaternion(vPosition, windQuat);

  vUv = uv;\r
  gl_Position = projectionMatrix * modelViewMatrix * vec4(offset + vPosition, 1.0);\r
}`;
const js = Ll(), Wl = Rs(
  {
    bladeHeight: 1,
    map: null,
    alphaMap: null,
    time: 0,
    tipColor: new b.Color(0, 0.6, 0).convertSRGBToLinear(),
    bottomColor: new b.Color(0, 0.1, 0).convertSRGBToLinear()
  },
  Vl,
  $l
);
mi({ GrassMaterial: Wl });
function dr(n, e) {
  return 0.05 * js(n / 50, e / 50) + 0.05 * js(n / 100, e / 100);
}
function Bl(n, e) {
  const t = new Float32Array(n * 3), i = new Float32Array(n * 4), s = new Float32Array(n), r = new Float32Array(n), o = new Float32Array(n), a = new b.Quaternion(), l = new b.Quaternion(), u = new b.Vector3(1, 0, 0), d = new b.Vector3(0, 0, 1), f = Math.ceil(Math.sqrt(n)), h = e / f;
  let g = 0, v = 0;
  for (let y = 0; y < n; y++) {
    const p = y % f, m = y / f | 0, x = (p + 0.5) * h - e / 2, M = (m + 0.5) * h - e / 2;
    t[g] = x, t[g + 1] = dr(x, M), t[g + 2] = M, g += 3;
    const P = Math.PI - Math.random() * (Math.PI / 6);
    r[y] = Math.sin(0.5 * P), o[y] = Math.cos(0.5 * P), a.setFromAxisAngle(d, P), l.setFromAxisAngle(u, Math.random() * Math.PI / 8), a.multiply(l), i[v] = a.x, i[v + 1] = a.y, i[v + 2] = a.z, i[v + 3] = a.w, v += 4, s[y] = 0.8 + Math.random() * 0.2;
  }
  return { offsets: t, orientations: i, stretches: s, halfRootAngleCos: o, halfRootAngleSin: r };
}
const hr = _n(
  ({
    options: n = { bW: 0.12, bH: 0.5, joints: 5 },
    width: e = 4,
    instances: t = 1e3,
    ...i
  }) => {
    const { bW: s, bH: r, joints: o } = n, a = C(null), l = C(null), [u, d] = br(b.TextureLoader, [
      Ul,
      Fl
    ]), f = ne(
      () => Bl(t, e),
      [t, e]
    ), [h, g] = ne(() => {
      const v = new b.PlaneGeometry(s, r, 1, o).translate(0, r / 2, 0), y = new b.PlaneGeometry(e, e, 32, 32), p = y.getAttribute("position");
      for (let m = 0; m < p.count; m++) {
        const x = p.getX(m), M = p.getZ(m);
        p.setY(m, dr(x, M));
      }
      return y.computeVertexNormals(), [v, y];
    }, [s, r, o, e]);
    return z(() => () => {
      h.dispose(), g.dispose();
    }, [h, g]), z(() => {
      const v = l.current;
      v && (v.instanceCount = t);
    }, [t, f]), Ke((v) => {
      const y = a.current?.uniforms?.time;
      y && (y.value = v.clock.elapsedTime / 4);
    }), /* @__PURE__ */ c.jsxs("group", { ...i, children: [
      /* @__PURE__ */ c.jsxs("mesh", { children: [
        /* @__PURE__ */ c.jsxs(
          "instancedBufferGeometry",
          {
            ref: l,
            index: h.index,
            "attributes-position": h.getAttribute("position"),
            "attributes-uv": h.getAttribute("uv"),
            children: [
              /* @__PURE__ */ c.jsx("instancedBufferAttribute", { attach: "attributes-offset", args: [f.offsets, 3] }),
              /* @__PURE__ */ c.jsx("instancedBufferAttribute", { attach: "attributes-orientation", args: [f.orientations, 4] }),
              /* @__PURE__ */ c.jsx("instancedBufferAttribute", { attach: "attributes-stretch", args: [f.stretches, 1] }),
              /* @__PURE__ */ c.jsx("instancedBufferAttribute", { attach: "attributes-halfRootAngleSin", args: [f.halfRootAngleSin, 1] }),
              /* @__PURE__ */ c.jsx("instancedBufferAttribute", { attach: "attributes-halfRootAngleCos", args: [f.halfRootAngleCos, 1] })
            ]
          }
        ),
        /* @__PURE__ */ c.jsx(
          "grassMaterial",
          {
            ref: a,
            map: u ?? null,
            alphaMap: d ?? null,
            toneMapped: !1,
            side: b.DoubleSide,
            transparent: !0
          }
        )
      ] }),
      /* @__PURE__ */ c.jsxs("mesh", { position: [0, 0, 0], rotation: [-Math.PI / 2, 0, 0], children: [
        /* @__PURE__ */ c.jsx("bufferGeometry", { ...g }),
        /* @__PURE__ */ c.jsx("meshStandardMaterial", { color: "#001f00" })
      ] })
    ] });
  }
);
hr.displayName = "Grass";
var ql = `precision highp float;

uniform sampler2D map;\r
uniform float transmission;\r
uniform float roughness;\r
uniform float envMapIntensity;

varying vec2 vUv;

void main() {\r
    vec4 texColor = texture2D(map, vUv);\r
    gl_FragColor = texColor;\r
    gl_FragColor.a *= 1.0 - transmission;\r
    gl_FragColor.rgb *= envMapIntensity;\r
}`, Hl = `precision highp float;

uniform float time;\r
varying vec2 vUv;

void main() {\r
    vUv = uv;\r
    float waveX = sin(uv.x * 5.0 + time * 1.0) * 0.05;\r
    float waveY = sin(uv.y * 5.0 + time * 1.0) * 0.025;\r
    vec3 pos = position;\r
    pos.z += waveX + waveY;\r
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);\r
}`;
const Ql = Rs(
  {
    map: null,
    time: 0,
    transmission: 0.99,
    roughness: 0.8,
    envMapIntensity: 1
  },
  Hl,
  ql
);
mi({ FlagMaterial: Ql });
const Jl = ({ geometry: n, pamplet_url: e, lod: t, center: i, ...s }) => {
  const r = C(null), o = C(null), a = C(new b.Vector3()), l = C(!0), u = C(0), d = As(
    e || "./image/main/aggjack.webp",
    (f) => {
      f.flipY = !1;
    }
  );
  return z(() => {
    i && a.current.set(i[0], i[1], i[2]);
  }, [i]), Ke((f, h) => {
    if (t) {
      const v = t.near ?? 30, y = t.far ?? 180, p = t.strength ?? 4;
      u.current += Math.max(0, h);
      const m = l.current ? 0.2 : 0.5;
      if (u.current >= m) {
        u.current = 0, !i && o.current && o.current.getWorldPosition(a.current);
        const x = f.camera.position.distanceTo(a.current), P = ki(x, v, y, p) > 0;
        P !== l.current && (l.current = P, o.current && (o.current.visible = P));
      }
      if (!l.current) return;
    }
    const g = r.current;
    g.time = f.clock.elapsedTime * 5;
  }), z(() => () => {
    r.current && r.current.dispose();
  }, [d]), /* @__PURE__ */ c.jsx("mesh", { ref: o, geometry: n, ...s, children: /* @__PURE__ */ c.jsx(
    "flagMaterial",
    {
      ref: r,
      map: d,
      transmission: 0.1,
      roughness: 0.8,
      envMapIntensity: 1,
      side: b.DoubleSide,
      transparent: !0
    }
  ) });
};
function Zl({ textureUrl: n }) {
  const e = ne(() => new b.PlaneGeometry(1.5, 1), []);
  return z(() => () => {
    e.dispose();
  }, [e]), /* @__PURE__ */ c.jsxs("group", { position: [0, 0, 0], children: [
    /* @__PURE__ */ c.jsxs("mesh", { position: [0, 2, 0], children: [
      /* @__PURE__ */ c.jsx("boxGeometry", { args: [0.05, 4, 0.05] }),
      /* @__PURE__ */ c.jsx("meshStandardMaterial", { color: "#8B4513" })
    ] }),
    /* @__PURE__ */ c.jsx(
      Jl,
      {
        geometry: e,
        pamplet_url: n,
        position: [0.75, 3, 0]
      }
    )
  ] });
}
function Kl({ tile: n }) {
  if (!n.objectType || n.objectType === "none") return null;
  const e = Ae.GRID_CELL_SIZE * (n.size || 1), t = [n.position.x, n.position.y, n.position.z];
  return /* @__PURE__ */ c.jsx("group", { position: t, children: /* @__PURE__ */ c.jsxs(Tn, { fallback: null, children: [
    n.objectType === "water" && /* @__PURE__ */ c.jsx("group", { scale: [e / 16, 1, e / 16], children: /* @__PURE__ */ c.jsx(Nl, {}) }),
    n.objectType === "grass" && /* @__PURE__ */ c.jsx(
      hr,
      {
        width: e,
        instances: n.objectConfig?.grassDensity || 1e3,
        position: [0, 0.05, 0]
      }
    ),
    n.objectType === "flag" && /* @__PURE__ */ c.jsx(
      Zl,
      {
        textureUrl: n.objectConfig?.flagTexture ?? null
      }
    )
  ] }) });
}
function Yl({
  tileGroup: n,
  meshes: e,
  isEditMode: t = !1,
  onTileClick: i
}) {
  const s = C(new Tt()), r = C(null), o = C(null), a = n.tiles.length, [l, u] = q(() => Math.max(1, a)), d = ne(() => {
    const p = s.current, m = e.get(n.floorMeshId);
    if (!m) {
      o.current?.dispose();
      const x = new b.MeshStandardMaterial({ color: "#888888" });
      return o.current = x, x;
    }
    return o.current?.dispose(), o.current = null, p.getMaterial(m);
  }, [n.floorMeshId, e]), f = ne(() => {
    const p = new b.PlaneGeometry(1, 1, 1, 1);
    return p.rotateX(-Math.PI / 2), p;
  }, []), h = ne(() => new b.Object3D(), []), g = ne(() => new b.BoxGeometry(0.8, 0.3, 0.8), []), v = ne(
    () => new b.MeshStandardMaterial({
      color: "#ff0000",
      transparent: !0,
      opacity: 0.6,
      emissive: new b.Color("#ff0000"),
      emissiveIntensity: 0.2
    }),
    []
  ), y = ne(
    () => n.tiles.filter((p) => p.objectType && p.objectType !== "none"),
    [n.tiles]
  );
  return z(() => {
    a <= l || u(Math.max(a, Math.ceil(l * 1.5)));
  }, [a, l]), _s(() => {
    const p = r.current;
    if (!p) return;
    const m = Ae.GRID_CELL_SIZE;
    p.count = a;
    for (let x = 0; x < a; x++) {
      const M = n.tiles[x];
      if (!M) continue;
      const P = M.size || 1, I = m * P;
      h.position.set(M.position.x, M.position.y + 1e-3, M.position.z), h.rotation.set(0, M.rotation ?? 0, 0), h.scale.set(I, 1, I), h.updateMatrix(), p.setMatrixAt(x, h.matrix);
    }
    p.instanceMatrix.needsUpdate = !0;
  }, [n.tiles, a, h]), z(() => {
    if (n.tiles.length === 0) return;
    const p = Le.getInstance(), m = new b.Box3(), x = new b.Vector3();
    n.tiles.forEach((I) => {
      const R = (I.size || 1) * Ae.GRID_CELL_SIZE / 2;
      x.set(I.position.x - R, I.position.y, I.position.z - R), m.expandByPoint(x), x.set(I.position.x + R, I.position.y, I.position.z + R), m.expandByPoint(x);
    });
    const M = new b.Vector3(), P = new b.Vector3();
    return m.getCenter(M), m.getSize(P), p.addMarker(
      `tile-group-${n.id}`,
      "ground",
      n.name || "Tiles",
      M,
      P
    ), () => {
      p.removeMarker(`tile-group-${n.id}`);
    };
  }, [n]), z(() => () => {
    s.current.dispose(), o.current?.dispose(), o.current = null, f.dispose(), g.dispose(), v.dispose();
  }, [f, g, v]), /* @__PURE__ */ c.jsx(rl, { type: "ground", children: /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
    t && n.tiles.map((p) => /* @__PURE__ */ c.jsx(
      "group",
      {
        position: [p.position.x, p.position.y + 0.3, p.position.z],
        onClick: () => i?.(p.id),
        children: /* @__PURE__ */ c.jsx("mesh", { geometry: g, material: v })
      },
      p.id
    )),
    /* @__PURE__ */ c.jsx(
      "instancedMesh",
      {
        ref: r,
        args: [f, d, l],
        castShadow: !0,
        receiveShadow: !0,
        frustumCulled: !1
      }
    ),
    y.map((p) => /* @__PURE__ */ c.jsx(Kl, { tile: p }, `${p.id}-object`))
  ] }) });
}
function Xl({
  wallGroup: n,
  meshes: e,
  isEditMode: t = !1,
  onWallClick: i
}) {
  const s = C(new Tt()), r = C(null), o = Ae.WALL_SIZES.WIDTH, a = Ae.WALL_SIZES.HEIGHT, l = Ae.WALL_SIZES.THICKNESS, u = n.walls.length, [d, f] = q(() => Math.max(1, u)), h = ne(() => new b.Object3D(), []);
  z(() => {
    u <= d || f(Math.max(u, Math.ceil(d * 1.5)));
  }, [u, d]);
  const g = ne(() => {
    const y = new b.BoxGeometry(o, a, l);
    return y.translate(0, 0, o / 2), y;
  }, [o, a, l]), v = ne(() => {
    const y = s.current, p = { id: "default", color: "#000000" }, m = n.frontMeshId ? e.get(n.frontMeshId) : p, x = n.backMeshId ? e.get(n.backMeshId) : p, M = n.sideMeshId ? e.get(n.sideMeshId) : p;
    return [
      y.getMaterial(M || p),
      y.getMaterial(M || p),
      y.getMaterial(M || p),
      y.getMaterial(M || p),
      y.getMaterial(m || p),
      y.getMaterial(x || p)
    ];
  }, [n, e]);
  return _s(() => {
    const y = r.current;
    if (y) {
      y.count = u;
      for (let p = 0; p < u; p++) {
        const m = n.walls[p];
        m && (h.position.set(m.position.x, m.position.y + a / 2, m.position.z), h.rotation.set(0, m.rotation.y, 0), h.updateMatrix(), y.setMatrixAt(p, h.matrix));
      }
      y.instanceMatrix.needsUpdate = !0;
    }
  }, [n.walls, u, h, a]), z(() => () => {
    s.current.dispose(), g.dispose();
  }, [g]), /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
    !t && n.walls.map((y) => {
      const p = o / 2, m = Math.sin(y.rotation.y), x = Math.cos(y.rotation.y), M = m * p, P = x * p;
      return /* @__PURE__ */ c.jsx(
        wr,
        {
          position: [
            y.position.x + M,
            y.position.y + a / 2,
            y.position.z + P
          ],
          rotation: [0, y.rotation.y, 0],
          args: [o / 2, a / 2, l / 2]
        },
        y.id
      );
    }),
    t && n.walls.map((y) => /* @__PURE__ */ c.jsx(
      "group",
      {
        position: [y.position.x, y.position.y + a + 0.5, y.position.z],
        onClick: () => i?.(y.id),
        children: /* @__PURE__ */ c.jsxs("mesh", { children: [
          /* @__PURE__ */ c.jsx("boxGeometry", { args: [0.5, 0.5, 0.5] }),
          /* @__PURE__ */ c.jsx("meshStandardMaterial", { color: "#ff0000" })
        ] })
      },
      y.id
    )),
    /* @__PURE__ */ c.jsx(
      "instancedMesh",
      {
        ref: r,
        args: [g, v, d],
        castShadow: !0,
        receiveShadow: !0
      }
    )
  ] });
}
function eu({
  onWallClick: n,
  onTileClick: e,
  onWallDelete: t,
  onTileDelete: i
}) {
  const {
    meshes: s,
    wallGroups: r,
    tileGroups: o,
    editMode: a,
    showGrid: l,
    gridSize: u
  } = de(), d = ne(() => Array.from(r.values()), [r]), f = ne(() => Array.from(o.values()), [o]);
  return /* @__PURE__ */ c.jsx(Tn, { fallback: null, children: /* @__PURE__ */ c.jsxs("group", { name: "building-system", children: [
    l && /* @__PURE__ */ c.jsx(Al, { size: u }),
    /* @__PURE__ */ c.jsx(Rl, {}),
    /* @__PURE__ */ c.jsx(zl, {}),
    /* @__PURE__ */ c.jsx(kl, {}),
    d.map((h) => /* @__PURE__ */ c.jsx(
      Xl,
      {
        wallGroup: h,
        meshes: s,
        isEditMode: a === "wall",
        ...n ? { onWallClick: n } : {},
        ...t ? { onWallDelete: t } : {}
      },
      h.id
    )),
    f.map((h) => /* @__PURE__ */ c.jsx(
      Yl,
      {
        tileGroup: h,
        meshes: s,
        isEditMode: a === "tile",
        ...e ? { onTileClick: e } : {},
        ...i ? { onTileDelete: i } : {}
      },
      h.id
    ))
  ] }) });
}
function Is({ part: n, instanceId: e }) {
  const t = n.url && n.url.trim() !== "", i = t ? dn(n.url) : null, s = ne(() => i ? kn.clone(i.scene) : null, [i]);
  return t ? s ? /* @__PURE__ */ c.jsx(
    "primitive",
    {
      object: s,
      position: n.position || [0, 0, 0],
      rotation: n.rotation || [0, 0, 0],
      scale: n.scale || [1, 1, 1]
    }
  ) : null : /* @__PURE__ */ c.jsxs(
    "mesh",
    {
      position: n.position || [0, 0, 0],
      rotation: n.rotation || [0, 0, 0],
      scale: n.scale || [1, 1, 1],
      children: [
        /* @__PURE__ */ c.jsx("boxGeometry", { args: [0.5, 0.5, 0.5] }),
        /* @__PURE__ */ c.jsx(
          "meshStandardMaterial",
          {
            color: n.color || "#cccccc",
            transparent: !0,
            opacity: 0.6
          }
        )
      ]
    }
  );
}
function tu({ instance: n, isEditMode: e, onClick: t }) {
  const i = C(null), { templates: s, clothingSets: r } = Me(), o = s.get(n.templateId), a = _((h) => {
    h.stopPropagation(), document.body.style.cursor = "pointer";
    const g = i.current?.__handlers;
    g?.pointerover && g.pointerover();
  }, []), l = _(() => {
    document.body.style.cursor = "default";
  }, []);
  if (!o)
    return null;
  const u = [];
  if (u.push(...o.baseParts), n.currentClothingSetId) {
    const h = r.get(n.currentClothingSetId);
    h && u.push(...h.parts);
  }
  o.accessoryParts && u.push(...o.accessoryParts), n.customParts && n.customParts.forEach((h) => {
    const g = u.findIndex((v) => v.type === h.type);
    g >= 0 ? u[g] = { ...u[g], ...h } : u.push(h);
  }), z(() => {
    if (!n.events || n.events.length === 0) return;
    const h = i.current;
    if (!h) return;
    const g = () => {
      n.events?.find((p) => p.type === "onHover");
    }, v = () => {
      const p = n.events?.find((m) => m.type === "onClick");
      p && p.action;
    }, y = h;
    return y.__handlers = {
      pointerover: g,
      click: v
    }, () => {
      delete y.__handlers;
    };
  }, [n.events]);
  const d = o.fullModelUrl || n.metadata?.modelUrl;
  return d ? /* @__PURE__ */ c.jsx(
    Un,
    {
      url: d,
      isActive: !1,
      componentType: "character",
      name: `npc-${n.id}`,
      position: n.position,
      rotation: n.rotation,
      currentAnimation: n.currentAnimation || "idle",
      userData: {
        instanceId: n.id,
        templateId: n.templateId,
        nameTag: n.metadata?.nameTag
      },
      onCollisionEnter: () => {
        t && t();
      },
      children: e && /* @__PURE__ */ c.jsxs("mesh", { position: [0, 2.5, 0], children: [
        /* @__PURE__ */ c.jsx("boxGeometry", { args: [0.5, 0.5, 0.5] }),
        /* @__PURE__ */ c.jsx("meshStandardMaterial", { color: "#00ff00", transparent: !0, opacity: 0.6 })
      ] })
    }
  ) : u.find((h) => h.url && h.type === "body")?.url || u.find((h) => h.url)?.url ? /* @__PURE__ */ c.jsx(
    $t,
    {
      type: "fixed",
      position: n.position,
      rotation: n.rotation,
      colliders: "cuboid",
      children: /* @__PURE__ */ c.jsxs(
        "group",
        {
          ref: i,
          scale: n.scale,
          ...t ? {
            onClick: (h) => {
              h.stopPropagation(), t();
            }
          } : {},
          onPointerEnter: a,
          onPointerLeave: l,
          children: [
            u.map((h) => /* @__PURE__ */ c.jsx(Is, { part: h, instanceId: n.id }, h.id)),
            e && /* @__PURE__ */ c.jsxs("mesh", { position: [0, 2.5, 0], children: [
              /* @__PURE__ */ c.jsx("boxGeometry", { args: [0.5, 0.5, 0.5] }),
              /* @__PURE__ */ c.jsx("meshStandardMaterial", { color: "#00ff00", transparent: !0, opacity: 0.6 })
            ] })
          ]
        }
      )
    }
  ) : /* @__PURE__ */ c.jsx(
    $t,
    {
      type: "fixed",
      position: n.position,
      rotation: n.rotation,
      colliders: "cuboid",
      children: /* @__PURE__ */ c.jsxs(
        "group",
        {
          ref: i,
          scale: n.scale,
          ...t ? {
            onClick: (h) => {
              h.stopPropagation(), t();
            }
          } : {},
          onPointerEnter: a,
          onPointerLeave: l,
          children: [
            u.map((h) => /* @__PURE__ */ c.jsx(Is, { part: h, instanceId: n.id }, h.id)),
            e && /* @__PURE__ */ c.jsxs("mesh", { position: [0, 2.5, 0], children: [
              /* @__PURE__ */ c.jsx("boxGeometry", { args: [0.5, 0.5, 0.5] }),
              /* @__PURE__ */ c.jsx("meshStandardMaterial", { color: "#00ff00", transparent: !0, opacity: 0.6 })
            ] })
          ]
        }
      )
    }
  );
}
function nu() {
  const { gl: n } = un(), {
    instances: e,
    selectedTemplateId: t,
    createInstanceFromTemplate: i,
    setSelectedInstance: s
  } = Me(), r = de((l) => l.editMode), o = de((l) => l.hoverPosition), a = r === "npc";
  return z(() => {
    if (!a || !t || !o) return;
    const l = () => {
      o && i(t, [
        o.x,
        o.y,
        o.z
      ]);
    };
    return n.domElement.addEventListener("click", l), () => n.domElement.removeEventListener("click", l);
  }, [a, t, o, n, i]), /* @__PURE__ */ c.jsx("group", { name: "npc-system", children: Array.from(e.values()).map((l) => /* @__PURE__ */ c.jsx(
    tu,
    {
      instance: l,
      isEditMode: a,
      onClick: () => {
        a && s(l.id);
      }
    },
    l.id
  )) });
}
function iu() {
  const { camera: n, raycaster: e } = un(), t = C({ x: 0, y: 0 }), {
    editMode: i,
    selectedWallGroupId: s,
    selectedTileGroupId: r,
    snapPosition: o,
    addWall: a,
    addTile: l,
    removeWall: u,
    removeTile: d,
    setHoverPosition: f
  } = de(), h = _((x) => {
    const M = x.target;
    if (t.current.x = x.clientX / M.clientWidth * 2 - 1, t.current.y = -(x.clientY / M.clientHeight) * 2 + 1, i === "tile" || i === "wall" || i === "npc") {
      e.setFromCamera(
        new b.Vector2(t.current.x, t.current.y),
        n
      );
      const P = new b.Plane(new b.Vector3(0, 1, 0), 0), I = new b.Vector3();
      if (e.ray.intersectPlane(P, I)) {
        const k = o({
          x: I.x,
          y: 0,
          z: I.z
        });
        f(k);
      } else
        f(null);
    } else
      f(null);
  }, [n, e, o, i, f]), g = _(() => {
    e.setFromCamera(
      new b.Vector2(t.current.x, t.current.y),
      n
    );
    const x = new b.Plane(new b.Vector3(0, 1, 0), 0), M = new b.Vector3();
    return e.ray.intersectPlane(x, M) ? o({
      x: M.x,
      y: 0,
      z: M.z
    }) : null;
  }, [n, e, o]), v = _(() => {
    if (i !== "wall" || !s) return;
    const x = g();
    if (!x) return;
    const { currentWallRotation: M, checkWallPosition: P } = de.getState();
    if (P(x, M)) {
      console.warn("Wall already exists at this position");
      return;
    }
    const I = { x: 0, y: M, z: 0 };
    a(s, {
      id: `wall-${Date.now()}`,
      position: x,
      rotation: I,
      wallGroupId: s
    });
  }, [i, s, g, a]), y = _(() => {
    if (i !== "tile" || !r) return;
    const x = g();
    if (!x) return;
    const { checkTilePosition: M, currentTileMultiplier: P } = de.getState();
    if (M(x)) {
      console.warn("Tile already exists at this position");
      return;
    }
    l(r, {
      id: `tile-${Date.now()}`,
      position: x,
      tileGroupId: r,
      size: P
    });
  }, [i, r, g, l]), p = _((x) => {
    i === "wall" && s && u(s, x);
  }, [i, s, u]), m = _((x) => {
    i === "tile" && r && d(r, x);
  }, [i, r, d]);
  return {
    updateMousePosition: h,
    placeWall: v,
    placeTile: y,
    handleWallClick: p,
    handleTileClick: m,
    getGroundPosition: g
  };
}
function zu() {
  const { gl: n } = un(), {
    updateMousePosition: e,
    placeWall: t,
    placeTile: i,
    handleWallClick: s,
    handleTileClick: r
  } = iu(), o = de((h) => h.editMode), a = o !== "none", l = de((h) => h.setHoverPosition), u = de((h) => h.setWallRotation), d = de((h) => h.initialized), f = de((h) => h.initializeDefaults);
  return z(() => {
    d || f();
  }, [d, f]), z(() => {
    if (o !== "wall") return;
    const h = (g) => {
      switch (g.key) {
        case "ArrowUp":
          u(0);
          break;
        case "ArrowRight":
          u(Math.PI / 2);
          break;
        case "ArrowDown":
          u(Math.PI);
          break;
        case "ArrowLeft":
          u(Math.PI * 1.5);
          break;
      }
    };
    return window.addEventListener("keydown", h), () => window.removeEventListener("keydown", h);
  }, [o, u]), z(() => {
    const h = n.domElement, g = (y) => e(y), v = (y) => {
      o !== "npc" && (y.preventDefault(), o === "wall" ? t() : o === "tile" && i());
    };
    return h.addEventListener("mousemove", g), h.addEventListener("click", v), () => {
      h.removeEventListener("mousemove", g), h.removeEventListener("click", v), l(null);
    };
  }, [n, e, t, i, o, l]), /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
    a && /* @__PURE__ */ c.jsx(
      jr,
      {
        enablePan: !0,
        enableZoom: !0,
        enableRotate: !0,
        maxPolarAngle: Math.PI / 2.5,
        minDistance: 5,
        maxDistance: 100
      }
    ),
    /* @__PURE__ */ c.jsx(
      eu,
      {
        onWallClick: s,
        onTileClick: r,
        onWallDelete: s,
        onTileDelete: r
      }
    ),
    /* @__PURE__ */ c.jsx(nu, {})
  ] });
}
const Ri = ft()(
  ao(
    (n) => ({
      isLoggedIn: !1,
      user: null,
      loading: !1,
      modal: {
        on: !1,
        type: "",
        file: -1,
        username: "",
        gltf_url: ""
      },
      login: async (e, t) => {
        n({ loading: !0 });
        try {
          return e === "admin" && t === "password" ? (n({ isLoggedIn: !0, user: { username: e }, loading: !1 }), !0) : (n({ loading: !1 }), !1);
        } catch {
          return n({ loading: !1 }), !1;
        }
      },
      logout: () => {
        n({ isLoggedIn: !1, user: null });
      },
      setLoading: (e) => {
        n({ loading: e });
      },
      setModal: (e) => {
        n({ modal: e });
      }
    }),
    {
      name: "gaesup-admin-auth",
      partialize: (n) => ({ isLoggedIn: n.isLoggedIn, user: n.user })
    }
  )
);
function Du({ onClose: n }) {
  const {
    setEditMode: e,
    editMode: t,
    isInEditMode: i,
    currentTileMultiplier: s,
    setTileMultiplier: r,
    currentWallRotation: o,
    setWallRotation: a,
    wallCategories: l,
    tileCategories: u,
    selectedWallCategoryId: d,
    selectedTileCategoryId: f,
    selectedWallGroupId: h,
    selectedTileGroupId: g,
    setSelectedWallCategory: v,
    setSelectedTileCategory: y,
    wallGroups: p,
    tileGroups: m,
    meshes: x,
    updateMesh: M,
    addMesh: P,
    addWallGroup: I,
    addTileGroup: k,
    selectedTileObjectType: R,
    setSelectedTileObjectType: $
  } = de(), D = Ri((T) => T.isLoggedIn), J = i(), {
    templates: W,
    selectedTemplateId: Z,
    setSelectedTemplate: oe,
    initializeDefaults: le,
    selectedInstanceId: ge
  } = Me(), [me, he] = Ze.useState(!1), [ue, xe] = Ze.useState(""), [be, ee] = Ze.useState("#808080"), [te, O] = Ze.useState(""), ye = ne(() => Array.from(u.values()), [u]), We = ne(() => Array.from(l.values()), [l]), ce = ne(() => Array.from(W.values()), [W]), ot = _(() => {
    e("none"), n?.();
  }, [e, n]), Ge = _(() => he((T) => !T), []);
  return Ze.useEffect(() => {
    le();
  }, [le]), Ze.useEffect(() => {
    if (t === "wall" && h) {
      const T = p.get(h);
      if (T && T.frontMeshId) {
        const L = x.get(T.frontMeshId);
        L && (ee(L.color || "#808080"), O(L.mapTextureUrl || ""));
      }
    } else if (t === "tile" && g) {
      const T = m.get(g);
      if (T && T.floorMeshId) {
        const L = x.get(T.floorMeshId);
        L && (ee(L.color || "#808080"), O(L.mapTextureUrl || ""));
      }
    }
  }, [t, h, g, p, m, x]), D ? /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
    J && /* @__PURE__ */ c.jsx("div", { className: "building-edit-mode-overlay" }),
    /* @__PURE__ */ c.jsx("div", { className: "building-ui-container", children: J ? /* @__PURE__ */ c.jsxs("div", { className: "building-ui-panel", children: [
      /* @__PURE__ */ c.jsxs("div", { className: "building-ui-header", children: [
        /* @__PURE__ */ c.jsx("span", { className: "building-ui-title", children: "Building Mode" }),
        /* @__PURE__ */ c.jsx(
          "button",
          {
            onClick: ot,
            className: "building-ui-close",
            children: "×"
          }
        )
      ] }),
      /* @__PURE__ */ c.jsxs("div", { className: "building-ui-mode-group", children: [
        /* @__PURE__ */ c.jsx(
          "button",
          {
            onClick: () => e("wall"),
            className: `building-ui-mode-button ${t === "wall" ? "active" : ""}`,
            children: "Wall Mode"
          }
        ),
        /* @__PURE__ */ c.jsx(
          "button",
          {
            onClick: () => e("tile"),
            className: `building-ui-mode-button ${t === "tile" ? "active" : ""}`,
            children: "Tile Mode"
          }
        ),
        /* @__PURE__ */ c.jsx(
          "button",
          {
            onClick: () => e("npc"),
            className: `building-ui-mode-button ${t === "npc" ? "active" : ""}`,
            children: "NPC Mode"
          }
        )
      ] }),
      t === "tile" && /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
        /* @__PURE__ */ c.jsxs("div", { className: "building-ui-category-group", children: [
          /* @__PURE__ */ c.jsx("span", { className: "building-ui-label", children: "Category:" }),
          /* @__PURE__ */ c.jsx(
            "select",
            {
              value: f || "",
              onChange: (T) => y(T.target.value),
              className: "building-ui-select",
              children: ye.map((T) => /* @__PURE__ */ c.jsx("option", { value: T.id, children: T.name }, T.id))
            }
          )
        ] }),
        /* @__PURE__ */ c.jsxs("div", { className: "building-ui-category-group", children: [
          /* @__PURE__ */ c.jsx("span", { className: "building-ui-label", children: "Type:" }),
          /* @__PURE__ */ c.jsx(
            "select",
            {
              value: g || "",
              onChange: (T) => de.setState({ selectedTileGroupId: T.target.value }),
              className: "building-ui-select",
              children: f && u.get(f)?.tileGroupIds.map((T) => {
                const L = m.get(T);
                return L ? /* @__PURE__ */ c.jsx("option", { value: L.id, children: L.name }, L.id) : null;
              })
            }
          )
        ] }),
        /* @__PURE__ */ c.jsxs(
          "button",
          {
            onClick: Ge,
            className: "building-ui-custom-toggle",
            children: [
              me ? "Hide" : "Show",
              " Custom Settings"
            ]
          }
        ),
        me && /* @__PURE__ */ c.jsxs("div", { className: "building-ui-custom-settings", children: [
          /* @__PURE__ */ c.jsxs("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ c.jsx("span", { className: "building-ui-label", children: "Name:" }),
            /* @__PURE__ */ c.jsx(
              "input",
              {
                type: "text",
                value: ue,
                onChange: (T) => xe(T.target.value),
                placeholder: "Custom Floor Name",
                className: "building-ui-input"
              }
            )
          ] }),
          /* @__PURE__ */ c.jsxs("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ c.jsx("span", { className: "building-ui-label", children: "Color:" }),
            /* @__PURE__ */ c.jsxs("div", { className: "building-ui-color-input", children: [
              /* @__PURE__ */ c.jsx(
                "input",
                {
                  type: "color",
                  value: be,
                  onChange: (T) => ee(T.target.value),
                  className: "building-ui-color-picker"
                }
              ),
              /* @__PURE__ */ c.jsx(
                "input",
                {
                  type: "text",
                  value: be,
                  onChange: (T) => ee(T.target.value),
                  className: "building-ui-input",
                  style: { width: "100px" }
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ c.jsxs("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ c.jsx("span", { className: "building-ui-label", children: "Texture URL:" }),
            /* @__PURE__ */ c.jsx(
              "input",
              {
                type: "text",
                value: te,
                onChange: (T) => O(T.target.value),
                placeholder: "https://...",
                className: "building-ui-input"
              }
            )
          ] }),
          /* @__PURE__ */ c.jsx(
            "button",
            {
              onClick: () => {
                if (g) {
                  const T = m.get(g);
                  T && T.floorMeshId && M(T.floorMeshId, {
                    color: be,
                    ...te ? { mapTextureUrl: te } : {}
                  });
                }
              },
              className: "building-ui-apply-button",
              children: "Apply Changes"
            }
          ),
          /* @__PURE__ */ c.jsx(
            "button",
            {
              onClick: () => {
                if (ue) {
                  const T = `custom-tile-${Date.now()}`, L = `custom-floor-mesh-${Date.now()}`;
                  if (P({
                    id: L,
                    color: be,
                    material: "STANDARD",
                    ...te ? { mapTextureUrl: te } : {},
                    roughness: 0.6
                  }), k({
                    id: T,
                    name: ue,
                    floorMeshId: L,
                    tiles: []
                  }), f) {
                    const Q = u.get(f);
                    Q && de.getState().updateTileCategory(f, {
                      tileGroupIds: [...Q.tileGroupIds, T]
                    });
                  }
                  de.setState({ selectedTileGroupId: T }), xe("");
                }
              },
              className: "building-ui-create-button",
              children: "Create New Type"
            }
          )
        ] }),
        /* @__PURE__ */ c.jsxs("div", { className: "building-ui-size-group", children: [
          /* @__PURE__ */ c.jsx("span", { className: "building-ui-label", children: "Tile Size:" }),
          /* @__PURE__ */ c.jsxs("div", { className: "building-ui-size-buttons", children: [
            /* @__PURE__ */ c.jsx(
              "button",
              {
                onClick: () => r(1),
                className: `building-ui-size-button ${s === 1 ? "active" : ""}`,
                children: "1x1"
              }
            ),
            /* @__PURE__ */ c.jsx(
              "button",
              {
                onClick: () => r(2),
                className: `building-ui-size-button ${s === 2 ? "active" : ""}`,
                children: "2x2"
              }
            ),
            /* @__PURE__ */ c.jsx(
              "button",
              {
                onClick: () => r(3),
                className: `building-ui-size-button ${s === 3 ? "active" : ""}`,
                children: "3x3"
              }
            ),
            /* @__PURE__ */ c.jsx(
              "button",
              {
                onClick: () => r(4),
                className: `building-ui-size-button ${s === 4 ? "active" : ""}`,
                children: "4x4"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ c.jsxs("div", { className: "building-ui-object-group", children: [
          /* @__PURE__ */ c.jsx("span", { className: "building-ui-label", children: "Tile Object:" }),
          /* @__PURE__ */ c.jsxs("div", { className: "building-ui-object-buttons", children: [
            /* @__PURE__ */ c.jsx(
              "button",
              {
                onClick: () => $("none"),
                className: `building-ui-object-button ${R === "none" ? "active" : ""}`,
                children: "None"
              }
            ),
            /* @__PURE__ */ c.jsx(
              "button",
              {
                onClick: () => $("water"),
                className: `building-ui-object-button ${R === "water" ? "active" : ""}`,
                children: "Water"
              }
            ),
            /* @__PURE__ */ c.jsx(
              "button",
              {
                onClick: () => $("grass"),
                className: `building-ui-object-button ${R === "grass" ? "active" : ""}`,
                children: "Grass"
              }
            ),
            /* @__PURE__ */ c.jsx(
              "button",
              {
                onClick: () => $("flag"),
                className: `building-ui-object-button ${R === "flag" ? "active" : ""}`,
                children: "Flag"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ c.jsxs("div", { className: "building-ui-info", children: [
          /* @__PURE__ */ c.jsxs("p", { children: [
            "Category: ",
            u.get(f || "")?.name
          ] }),
          /* @__PURE__ */ c.jsxs("p", { children: [
            "Type: ",
            m.get(g || "")?.name
          ] }),
          /* @__PURE__ */ c.jsxs("p", { children: [
            "Size: ",
            s,
            "x",
            s,
            " (",
            s * 4,
            "m)"
          ] }),
          /* @__PURE__ */ c.jsxs("p", { children: [
            "Object: ",
            R === "none" ? "None" : R
          ] }),
          /* @__PURE__ */ c.jsx("p", { children: "Click to place tiles" }),
          /* @__PURE__ */ c.jsx("p", { children: "Red = Occupied, Green = Available" })
        ] })
      ] }),
      t === "wall" && /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
        /* @__PURE__ */ c.jsxs("div", { className: "building-ui-category-group", children: [
          /* @__PURE__ */ c.jsx("span", { className: "building-ui-label", children: "Category:" }),
          /* @__PURE__ */ c.jsx(
            "select",
            {
              value: d || "",
              onChange: (T) => v(T.target.value),
              className: "building-ui-select",
              children: We.map((T) => /* @__PURE__ */ c.jsx("option", { value: T.id, children: T.name }, T.id))
            }
          )
        ] }),
        /* @__PURE__ */ c.jsxs("div", { className: "building-ui-category-group", children: [
          /* @__PURE__ */ c.jsx("span", { className: "building-ui-label", children: "Type:" }),
          /* @__PURE__ */ c.jsx(
            "select",
            {
              value: h || "",
              onChange: (T) => de.setState({ selectedWallGroupId: T.target.value }),
              className: "building-ui-select",
              children: d && l.get(d)?.wallGroupIds.map((T) => {
                const L = p.get(T);
                return L ? /* @__PURE__ */ c.jsx("option", { value: L.id, children: L.name }, L.id) : null;
              })
            }
          )
        ] }),
        /* @__PURE__ */ c.jsxs(
          "button",
          {
            onClick: Ge,
            className: "building-ui-custom-toggle",
            children: [
              me ? "Hide" : "Show",
              " Custom Settings"
            ]
          }
        ),
        me && /* @__PURE__ */ c.jsxs("div", { className: "building-ui-custom-settings", children: [
          /* @__PURE__ */ c.jsxs("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ c.jsx("span", { className: "building-ui-label", children: "Name:" }),
            /* @__PURE__ */ c.jsx(
              "input",
              {
                type: "text",
                value: ue,
                onChange: (T) => xe(T.target.value),
                placeholder: "Custom Wall Name",
                className: "building-ui-input"
              }
            )
          ] }),
          /* @__PURE__ */ c.jsxs("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ c.jsx("span", { className: "building-ui-label", children: "Color:" }),
            /* @__PURE__ */ c.jsxs("div", { className: "building-ui-color-input", children: [
              /* @__PURE__ */ c.jsx(
                "input",
                {
                  type: "color",
                  value: be,
                  onChange: (T) => ee(T.target.value),
                  className: "building-ui-color-picker"
                }
              ),
              /* @__PURE__ */ c.jsx(
                "input",
                {
                  type: "text",
                  value: be,
                  onChange: (T) => ee(T.target.value),
                  className: "building-ui-input",
                  style: { width: "100px" }
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ c.jsxs("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ c.jsx("span", { className: "building-ui-label", children: "Texture URL:" }),
            /* @__PURE__ */ c.jsx(
              "input",
              {
                type: "text",
                value: te,
                onChange: (T) => O(T.target.value),
                placeholder: "https://...",
                className: "building-ui-input"
              }
            )
          ] }),
          /* @__PURE__ */ c.jsx(
            "button",
            {
              onClick: () => {
                if (h) {
                  const T = p.get(h);
                  if (T && T.frontMeshId) {
                    const L = {
                      color: be,
                      ...te ? { mapTextureUrl: te } : {}
                    };
                    M(T.frontMeshId, {
                      ...L
                    }), T.backMeshId && M(T.backMeshId, {
                      ...L
                    }), T.sideMeshId && M(T.sideMeshId, {
                      ...L
                    });
                  }
                }
              },
              className: "building-ui-apply-button",
              children: "Apply Changes"
            }
          ),
          /* @__PURE__ */ c.jsx(
            "button",
            {
              onClick: () => {
                if (ue) {
                  const T = `custom-wall-${Date.now()}`, L = `custom-mesh-${Date.now()}`;
                  if (P({
                    id: L,
                    color: be,
                    material: "STANDARD",
                    ...te ? { mapTextureUrl: te } : {},
                    roughness: 0.7
                  }), I({
                    id: T,
                    name: ue,
                    frontMeshId: L,
                    backMeshId: L,
                    sideMeshId: L,
                    walls: []
                  }), d) {
                    const Q = l.get(d);
                    Q && de.getState().updateWallCategory(d, {
                      wallGroupIds: [...Q.wallGroupIds, T]
                    });
                  }
                  de.setState({ selectedWallGroupId: T }), xe("");
                }
              },
              className: "building-ui-create-button",
              children: "Create New Type"
            }
          )
        ] }),
        /* @__PURE__ */ c.jsxs("div", { className: "building-ui-direction-group", children: [
          /* @__PURE__ */ c.jsx("span", { className: "building-ui-label", children: "Wall Direction:" }),
          /* @__PURE__ */ c.jsxs("div", { className: "building-ui-direction-buttons", children: [
            /* @__PURE__ */ c.jsx(
              "button",
              {
                onClick: () => a(0),
                className: `building-ui-direction-button ${o === 0 ? "active" : ""}`,
                title: "North",
                children: "↑"
              }
            ),
            /* @__PURE__ */ c.jsx(
              "button",
              {
                onClick: () => a(Math.PI / 2),
                className: `building-ui-direction-button ${o === Math.PI / 2 ? "active" : ""}`,
                title: "East",
                children: "→"
              }
            ),
            /* @__PURE__ */ c.jsx(
              "button",
              {
                onClick: () => a(Math.PI),
                className: `building-ui-direction-button ${o === Math.PI ? "active" : ""}`,
                title: "South",
                children: "↓"
              }
            ),
            /* @__PURE__ */ c.jsx(
              "button",
              {
                onClick: () => a(Math.PI * 1.5),
                className: `building-ui-direction-button ${o === Math.PI * 1.5 ? "active" : ""}`,
                title: "West",
                children: "←"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ c.jsxs("div", { className: "building-ui-info", children: [
          /* @__PURE__ */ c.jsxs("p", { children: [
            "Category: ",
            l.get(d || "")?.name
          ] }),
          /* @__PURE__ */ c.jsxs("p", { children: [
            "Type: ",
            p.get(h || "")?.name
          ] }),
          /* @__PURE__ */ c.jsx("p", { children: "Use arrow keys to rotate" }),
          /* @__PURE__ */ c.jsx("p", { children: "Click to place walls" }),
          /* @__PURE__ */ c.jsx("p", { children: "Red = Occupied, Green = Available" }),
          /* @__PURE__ */ c.jsx("p", { children: "Click red boxes to delete" })
        ] })
      ] }),
      t === "npc" && /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
        /* @__PURE__ */ c.jsxs("div", { className: "building-ui-category-group", children: [
          /* @__PURE__ */ c.jsx("span", { className: "building-ui-label", children: "캐릭터:" }),
          /* @__PURE__ */ c.jsx(
            "select",
            {
              value: Z || "",
              onChange: (T) => oe(T.target.value),
              className: "building-ui-select",
              children: ce.map((T) => /* @__PURE__ */ c.jsx("option", { value: T.id, children: T.name }, T.id))
            }
          )
        ] }),
        /* @__PURE__ */ c.jsxs("div", { className: "building-ui-category-group", children: [
          /* @__PURE__ */ c.jsx("span", { className: "building-ui-label", children: "옷:" }),
          /* @__PURE__ */ c.jsxs("div", { className: "building-ui-clothing-buttons", children: [
            ["rabbit-outfit", "basic-suit", "formal-suit"].map((T) => {
              const L = Me.getState().clothingSets.get(T);
              return L ? /* @__PURE__ */ c.jsx(
                "button",
                {
                  onClick: () => Me.getState().setSelectedClothingSet(L.id),
                  className: `building-ui-clothing-button ${Me.getState().selectedClothingSetId === L.id ? "active" : ""}`,
                  children: L.name
                },
                L.id
              ) : null;
            }),
            /* @__PURE__ */ c.jsx(
              "button",
              {
                onClick: () => Me.getState().setSelectedClothingSet(""),
                className: `building-ui-clothing-button ${Me.getState().selectedClothingSetId ? "" : "active"}`,
                children: "없음"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ c.jsxs("div", { className: "building-ui-category-group", children: [
          /* @__PURE__ */ c.jsx("span", { className: "building-ui-label", children: "모자:" }),
          /* @__PURE__ */ c.jsxs("div", { className: "building-ui-clothing-buttons", children: [
            ["hat-set-a", "hat-set-b", "hat-set-c"].map((T) => {
              const L = Me.getState().clothingSets.get(T);
              return L ? /* @__PURE__ */ c.jsx(
                "button",
                {
                  onClick: () => {
                    Me.getState().setPreviewAccessory("hat", L.id);
                    const Q = Me.getState().selectedInstanceId, X = L.parts[0];
                    Q && X && Me.getState().updateInstancePart(Q, X.id, X);
                  },
                  className: `building-ui-clothing-button ${Me.getState().previewAccessories.hat === L.id ? "active" : ""}`,
                  children: L.name
                },
                L.id
              ) : null;
            }),
            /* @__PURE__ */ c.jsx(
              "button",
              {
                onClick: () => Me.getState().setPreviewAccessory("hat", ""),
                className: `building-ui-clothing-button ${Me.getState().previewAccessories.hat ? "" : "active"}`,
                children: "없음"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ c.jsxs("div", { className: "building-ui-category-group", children: [
          /* @__PURE__ */ c.jsx("span", { className: "building-ui-label", children: "안경:" }),
          /* @__PURE__ */ c.jsxs("div", { className: "building-ui-clothing-buttons", children: [
            ["glasses-set-a", "glasses-set-b"].map((T) => {
              const L = Me.getState().clothingSets.get(T);
              return L ? /* @__PURE__ */ c.jsx(
                "button",
                {
                  onClick: () => Me.getState().setPreviewAccessory("glasses", L.id),
                  className: `building-ui-clothing-button ${Me.getState().previewAccessories.glasses === L.id ? "active" : ""}`,
                  children: L.name
                },
                L.id
              ) : null;
            }),
            /* @__PURE__ */ c.jsx(
              "button",
              {
                onClick: () => Me.getState().setPreviewAccessory("glasses", ""),
                className: `building-ui-clothing-button ${Me.getState().previewAccessories.glasses ? "" : "active"}`,
                children: "없음"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ c.jsxs("div", { className: "building-ui-category-group", children: [
          /* @__PURE__ */ c.jsx("span", { className: "building-ui-label", children: "Selected Instance:" }),
          /* @__PURE__ */ c.jsx("span", { className: "building-ui-info-value", children: ge || "None" })
        ] }),
        Z && W.get(Z) && /* @__PURE__ */ c.jsxs("div", { className: "building-ui-info", children: [
          /* @__PURE__ */ c.jsxs("p", { children: [
            "현재 선택: ",
            W.get(Z)?.name
          ] }),
          /* @__PURE__ */ c.jsx("p", { children: "클릭하여 NPC 배치" }),
          /* @__PURE__ */ c.jsx("p", { children: "배치된 NPC를 클릭하여 선택" })
        ] })
      ] })
    ] }) : null })
  ] }) : null;
}
var su = Object.defineProperty, ru = Object.getOwnPropertyDescriptor, kt = (n, e, t, i) => {
  for (var s = ru(e, t), r = n.length - 1, o; r >= 0; r--)
    (o = n[r]) && (s = o(e, t, s) || s);
  return s && su(e, t, s), s;
};
class At {
  static convertLegacyPosition(e) {
    return { x: e[0], y: e[1], z: e[2] };
  }
  static convertLegacyRotation(e) {
    return { x: e[0], y: e[1], z: e[2] };
  }
  static convertToLegacyPosition(e) {
    return [e.x, e.y, e.z];
  }
  static convertToLegacyRotation(e) {
    return [e.x, e.y, e.z];
  }
  static convertLegacyWall(e) {
    return {
      id: e.id || `wall-${Date.now()}`,
      position: this.convertLegacyPosition(e.position),
      rotation: this.convertLegacyRotation(e.rotation),
      wallGroupId: e.wall_parent_id || "default",
      width: 4,
      height: 4,
      depth: 0.5
    };
  }
  static convertLegacyTile(e) {
    return {
      id: e.id || `tile-${Date.now()}`,
      position: this.convertLegacyPosition(e.position),
      tileGroupId: e.tile_parent_id || "default",
      size: 4
    };
  }
  static convertLegacyMesh(e) {
    const t = {
      id: e.id || `mesh-${Date.now()}`,
      color: e.color || "#ffffff",
      material: e.material === "GLASS" ? "GLASS" : "STANDARD",
      roughness: e.roughness || 0.5,
      metalness: e.metalness || 0,
      opacity: e.opacity || 1,
      transparent: e.transparent || !1
    };
    return e.map_texture_url && (t.mapTextureUrl = e.map_texture_url), e.normal_texture_url && (t.normalTextureUrl = e.normal_texture_url), t;
  }
}
kt([
  G(),
  F()
], At, "convertLegacyPosition");
kt([
  G(),
  F()
], At, "convertLegacyRotation");
kt([
  G()
], At, "convertToLegacyPosition");
kt([
  G()
], At, "convertToLegacyRotation");
kt([
  G(),
  F()
], At, "convertLegacyWall");
kt([
  G(),
  F()
], At, "convertLegacyTile");
kt([
  G(),
  F()
], At, "convertLegacyMesh");
const ou = () => {
  const [n, e] = q(""), [t, i] = q(""), [s, r] = q(""), o = Ri((l) => l.login), a = async (l) => {
    l.preventDefault(), r(""), await o(n, t) || r("Invalid username or password");
  };
  return /* @__PURE__ */ c.jsxs("div", { className: "login-container", children: [
    /* @__PURE__ */ c.jsx("h1", { children: "Admin Login" }),
    /* @__PURE__ */ c.jsxs("form", { onSubmit: a, className: "login-form", children: [
      /* @__PURE__ */ c.jsx(
        "input",
        {
          type: "text",
          value: n,
          onChange: (l) => e(l.target.value),
          placeholder: "Username",
          className: "login-input",
          autoComplete: "username"
        }
      ),
      /* @__PURE__ */ c.jsx(
        "input",
        {
          type: "password",
          value: t,
          onChange: (l) => i(l.target.value),
          placeholder: "Password",
          className: "login-input",
          autoComplete: "current-password"
        }
      ),
      /* @__PURE__ */ c.jsx("button", { type: "submit", className: "login-button", children: "Login" }),
      s && /* @__PURE__ */ c.jsx("p", { className: "login-error", children: s })
    ] })
  ] });
}, Eu = ({ children: n, requireLogin: e = !1 }) => {
  const t = Ri((i) => i.isLoggedIn);
  return e && !t ? /* @__PURE__ */ c.jsx(ou, {}) : /* @__PURE__ */ c.jsx(c.Fragment, { children: n });
};
ft((n, e) => ({
  toasts: [],
  timers: /* @__PURE__ */ new Map(),
  addToast: (t) => {
    const i = Date.now().toString(), s = { ...t, id: i };
    n((o) => ({ toasts: [...o.toasts, s] }));
    const r = setTimeout(() => {
      e().removeToast(i);
    }, 3e3);
    n((o) => (o.timers.set(i, r), {}));
  },
  addToastAsync: async (t) => new Promise((i) => {
    e().addToast(t), i();
  }),
  removeToast: (t) => {
    const { timers: i } = e(), s = i.get(t);
    s && (clearTimeout(s), i.delete(t)), n((r) => ({ toasts: r.toasts.filter((o) => o.id !== t) }));
  }
}));
export {
  ya as AnimationDebugPanel,
  zu as BuildingController,
  eu as BuildingSystem,
  Du as BuildingUI,
  Qa as Camera,
  ec as CameraDebugPanel,
  sc as CameraPresets,
  nr as Clicker,
  _u as ConnectionForm,
  Ru as Editor,
  zc as FocusableObject,
  rl as GaeSupProps,
  Eu as GaesupAdmin,
  Rc as GaesupController,
  il as GaesupWorld,
  sl as GaesupWorldContent,
  yu as Gamepad,
  Al as GridHelper,
  ir as GroundClicker,
  xu as MiniMap,
  wu as MinimapPlatform,
  or as MotionController,
  ar as MotionDebugPanel,
  vu as MotionUI,
  ku as MultiplayerCanvas,
  Tu as PlayerInfoOverlay,
  pl as RemotePlayer,
  cr as SpeechBalloon,
  bu as Teleport,
  Yl as TileSystem,
  Ut as V3,
  fu as V30,
  pu as V31,
  Xl as WallSystem,
  il as World,
  il as WorldContainer,
  Au as defaultMultiplayerConfig,
  iu as useBuildingEditor,
  de as useBuildingStore,
  gu as useGaesupController,
  Y as useGaesupStore,
  Iu as useMultiplayer,
  Su as useNPCConnection,
  $n as useNetworkBridge,
  Cu as useNetworkGroup,
  Mu as useNetworkMessage,
  Pu as useNetworkStats,
  ju as usePlayerNetwork,
  pc as useTeleport
};
