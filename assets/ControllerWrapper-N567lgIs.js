import{t as e}from"./react-B5Ws8Y4Y.js";import{i as t}from"./gaesup-world-DFZTn_G-.js";import{Co as n,Dr as r,Fs as i,Ft as a,Gi as o,I as s,In as c,Ir as l,Is as u,It as d,Kr as f,Ks as p,Nn as m,Nr as h,Po as g,Ps as _,Pt as v,Q as y,Qr as b,Rr as x,So as S,Ts as C,U as w,Un as T,Us as E,Wn as D,Xi as O,Yn as k,Yr as A,Zi as ee,Zn as j,Zr as te,_t as ne,as as M,ba as N,bo as re,br as ie,dn as ae,et as oe,ko as se,kr as ce,ks as le,mn as ue,oo as de,pn as fe,sn as pe,ws as me}from"./three.core-CzDHxBKg.js";import{D as P,E as he,T as ge,_ as F,a as _e,f as ve,h as ye,r as be,s as I,w as xe}from"./events-156d8d12.esm-Beuvy9sX.js";import{c as L,l as R,nt as z,o as Se,s as B,tt as Ce}from"./react-three-rapier.esm-BtbBATit.js";import{Ft as we,Lt as Te,Mn as Ee,Nn as De,Nt as Oe,Pn as ke,Pt as Ae,at as je,hn as Me,i as Ne,it as Pe,mn as Fe,n as Ie,r as Le,t as Re}from"./useClicker-1ejKEPV4.js";import{m as V,p as ze}from"./AbstractSystem-BVutK3P-.js";import{i as Be,t as Ve}from"./extends-3yaUhU_Q.js";import{a as He,o as Ue}from"./Gltf-CacxXBt2.js";import{n as We,t as Ge}from"./shaderMaterial-ZnlkkOoK.js";import{n as Ke,t as qe}from"./useGenericRefs-DOMT-tmM.js";import{i as Je,n as H}from"./rolldown-runtime-8BhlS34s.js";var Ye;function Xe(){return(Xe=H((()=>{He(),Ye=Ue>=125?`uv1`:`uv2`})))()}function Ze(e,t){return bt((St(e),e.subarray(2,-4)),t)}var U,Qe,$e,et,tt,nt,rt,it,at,ot,st,ct,lt,W,ut,dt,ft,pt,mt,ht,gt,G,_t,vt,yt,bt,xt,St,Ct;function wt(){return(wt=H((()=>{for(U=Uint8Array,Qe=Uint16Array,$e=Uint32Array,et=new U([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),tt=new U([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),nt=new U([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),rt=function(e,t){for(var n=new Qe(31),r=0;r<31;++r)n[r]=t+=1<<e[r-1];for(var i=new $e(n[30]),r=1;r<30;++r)for(var a=n[r];a<n[r+1];++a)i[a]=a-n[r]<<5|r;return[n,i]},it=rt(et,2),at=it[0],ot=it[1],at[28]=258,ot[258]=28,st=rt(tt,0),ct=st[0],st[1],lt=new Qe(32768),W=0;W<32768;++W)ut=(W&43690)>>>1|(W&21845)<<1,ut=(ut&52428)>>>2|(ut&13107)<<2,ut=(ut&61680)>>>4|(ut&3855)<<4,lt[W]=((ut&65280)>>>8|(ut&255)<<8)>>>1;for(dt=(function(e,t,n){for(var r=e.length,i=0,a=new Qe(t);i<r;++i)++a[e[i]-1];var o=new Qe(t);for(i=0;i<t;++i)o[i]=o[i-1]+a[i-1]<<1;var s;if(n){s=new Qe(1<<t);var c=15-t;for(i=0;i<r;++i)if(e[i])for(var l=i<<4|e[i],u=t-e[i],d=o[e[i]-1]++<<u,f=d|(1<<u)-1;d<=f;++d)s[lt[d]>>>c]=l}else for(s=new Qe(r),i=0;i<r;++i)e[i]&&(s[i]=lt[o[e[i]-1]++]>>>15-e[i]);return s}),ft=new U(288),W=0;W<144;++W)ft[W]=8;for(W=144;W<256;++W)ft[W]=9;for(W=256;W<280;++W)ft[W]=7;for(W=280;W<288;++W)ft[W]=8;for(pt=new U(32),W=0;W<32;++W)pt[W]=5;mt=dt(ft,9,1),ht=dt(pt,5,1),gt=function(e){for(var t=e[0],n=1;n<e.length;++n)e[n]>t&&(t=e[n]);return t},G=function(e,t,n){var r=t/8|0;return(e[r]|e[r+1]<<8)>>(t&7)&n},_t=function(e,t){var n=t/8|0;return(e[n]|e[n+1]<<8|e[n+2]<<16)>>(t&7)},vt=function(e){return(e/8|0)+(e&7&&1)},yt=function(e,t,n){(t==null||t<0)&&(t=0),(n==null||n>e.length)&&(n=e.length);var r=new(e instanceof Qe?Qe:e instanceof $e?$e:U)(n-t);return r.set(e.subarray(t,n)),r},bt=function(e,t,n){var r=e.length;if(!r||n&&!n.l&&r<5)return t||new U(0);var i=!t||n,a=!n||n.i;n||={},t||=new U(r*3);var o=function(e){var n=t.length;if(e>n){var r=new U(Math.max(n*2,e));r.set(t),t=r}},s=n.f||0,c=n.p||0,l=n.b||0,u=n.l,d=n.d,f=n.m,p=n.n,m=r*8;do{if(!u){n.f=s=G(e,c,1);var h=G(e,c+1,3);if(c+=3,!h){var g=vt(c)+4,_=e[g-4]|e[g-3]<<8,v=g+_;if(v>r){if(a)throw`unexpected EOF`;break}i&&o(l+_),t.set(e.subarray(g,v),l),n.b=l+=_,n.p=c=v*8;continue}if(h==1)u=mt,d=ht,f=9,p=5;else if(h==2){var y=G(e,c,31)+257,b=G(e,c+10,15)+4,x=y+G(e,c+5,31)+1;c+=14;for(var S=new U(x),C=new U(19),w=0;w<b;++w)C[nt[w]]=G(e,c+w*3,7);c+=b*3;for(var T=gt(C),E=(1<<T)-1,D=dt(C,T,1),w=0;w<x;){var O=D[G(e,c,E)];c+=O&15;var g=O>>>4;if(g<16)S[w++]=g;else{var k=0,A=0;for(g==16?(A=3+G(e,c,3),c+=2,k=S[w-1]):g==17?(A=3+G(e,c,7),c+=3):g==18&&(A=11+G(e,c,127),c+=7);A--;)S[w++]=k}}var ee=S.subarray(0,y),j=S.subarray(y);f=gt(ee),p=gt(j),u=dt(ee,f,1),d=dt(j,p,1)}else throw`invalid block type`;if(c>m){if(a)throw`unexpected EOF`;break}}i&&o(l+131072);for(var te=(1<<f)-1,ne=(1<<p)-1,M=c;;M=c){var k=u[_t(e,c)&te],N=k>>>4;if(c+=k&15,c>m){if(a)throw`unexpected EOF`;break}if(!k)throw`invalid length/literal`;if(N<256)t[l++]=N;else if(N==256){M=c,u=null;break}else{var re=N-254;if(N>264){var w=N-257,ie=et[w];re=G(e,c,(1<<ie)-1)+at[w],c+=ie}var ae=d[_t(e,c)&ne],oe=ae>>>4;if(!ae)throw`invalid distance`;c+=ae&15;var j=ct[oe];if(oe>3){var ie=tt[oe];j+=_t(e,c)&(1<<ie)-1,c+=ie}if(c>m){if(a)throw`unexpected EOF`;break}i&&o(l+131072);for(var se=l+re;l<se;l+=4)t[l]=t[l-j],t[l+1]=t[l+1-j],t[l+2]=t[l+2-j],t[l+3]=t[l+3-j];l=se}}n.l=u,n.p=M,n.b=l,u&&(s=1,n.m=f,n.d=d,n.n=p)}while(!s);return l==t.length?t:yt(t,0,l)},xt=new U(0),St=function(e){if((e[0]&15)!=8||e[0]>>>4>7||(e[0]<<8|e[1])%31)throw`invalid zlib data`;if(e[1]&32)throw`invalid zlib data: preset dictionaries not supported`},Ct=typeof TextDecoder<`u`&&new TextDecoder;try{Ct.decode(xt,{stream:!0})}catch{}})))()}var Tt,Et;function Dt(){return(Dt=H((()=>{P(),He(),Tt=e=>e&&e.isCubeTexture,Et=class extends te{constructor(e,t){let r=Tt(e),i=((r?e.image[0]?.width:e.image.width)??1024)/4,a=Math.floor(Math.log2(i)),o=2**a,s=3*Math.max(o,112),l=4*o,u=[r?`#define ENVMAP_TYPE_CUBE`:``,`#define CUBEUV_TEXEL_WIDTH ${1/s}`,`#define CUBEUV_TEXEL_HEIGHT ${1/l}`,`#define CUBEUV_MAX_MIP ${a}.0`].join(`
`)+`
        #define ENVMAP_TYPE_CUBE_UV
        varying vec3 vWorldPosition;
        uniform float radius;
        uniform float height;
        uniform float angle;
        #ifdef ENVMAP_TYPE_CUBE
            uniform samplerCube map;
        #else
            uniform sampler2D map;
        #endif
        // From: https://www.shadertoy.com/view/4tsBD7
        float diskIntersectWithBackFaceCulling( vec3 ro, vec3 rd, vec3 c, vec3 n, float r ) 
        {
            float d = dot ( rd, n );
            
            if( d > 0.0 ) { return 1e6; }
            
            vec3  o = ro - c;
            float t = - dot( n, o ) / d;
            vec3  q = o + rd * t;
            
            return ( dot( q, q ) < r * r ) ? t : 1e6;
        }
        // From: https://www.iquilezles.org/www/articles/intersectors/intersectors.htm
        float sphereIntersect( vec3 ro, vec3 rd, vec3 ce, float ra ) 
        {
            vec3 oc = ro - ce;
            float b = dot( oc, rd );
            float c = dot( oc, oc ) - ra * ra;
            float h = b * b - c;
            
            if( h < 0.0 ) { return -1.0; }
            
            h = sqrt( h );
            
            return - b + h;
        }
        vec3 project() 
        {
            vec3 p = normalize( vWorldPosition );
            vec3 camPos = cameraPosition;
            camPos.y -= height;
            float intersection = sphereIntersect( camPos, p, vec3( 0.0 ), radius );
            if( intersection > 0.0 ) {
                
                vec3 h = vec3( 0.0, - height, 0.0 );
                float intersection2 = diskIntersectWithBackFaceCulling( camPos, p, h, vec3( 0.0, 1.0, 0.0 ), radius );
                p = ( camPos + min( intersection, intersection2 ) * p ) / radius;
            } else {
                p = vec3( 0.0, 1.0, 0.0 );
            }
            return p;
        }
        #include <common>
        #include <cube_uv_reflection_fragment>
        void main() 
        {
            vec3 projectedWorldPosition = project();
            
            #ifdef ENVMAP_TYPE_CUBE
                vec3 outcolor = textureCube( map, projectedWorldPosition ).rgb;
            #else
                vec3 direction = normalize( projectedWorldPosition );
                vec2 uv = equirectUv( direction );
                vec3 outcolor = texture2D( map, uv ).rgb;
            #endif
            gl_FragColor = vec4( outcolor, 1.0 );
            #include <tonemapping_fragment>
            #include <${Ue>=154?`colorspace_fragment`:`encodings_fragment`}>
        }
        `,d={map:{value:e},height:{value:t?.height||15},radius:{value:t?.radius||100}},f=new c(1,16),p=new n({uniforms:d,fragmentShader:u,vertexShader:`
        varying vec3 vWorldPosition;
        void main() 
        {
            vec4 worldPosition = ( modelMatrix * vec4( position, 1.0 ) );
            vWorldPosition = worldPosition.xyz;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
        `,side:2});super(f,p)}set radius(e){this.material.uniforms.radius.value=e}get radius(){return this.material.uniforms.radius.value}set height(e){this.material.uniforms.height.value=e}get height(){return this.material.uniforms.height.value}}})))()}var Ot;function kt(){return(kt=H((()=>{P(),Ot=class extends a{constructor(e){super(e),this.type=m}parse(e){let t=function(e,t){switch(e){case 1:throw Error(`THREE.RGBELoader: Read Error: `+(t||``));case 2:throw Error(`THREE.RGBELoader: Write Error: `+(t||``));case 3:throw Error(`THREE.RGBELoader: Bad File Format: `+(t||``));default:case 4:throw Error(`THREE.RGBELoader: Memory Error: `+(t||``))}},n=function(e,t,n){t||=1024;let r=e.pos,i=-1,a=0,o=``,s=String.fromCharCode.apply(null,new Uint16Array(e.subarray(r,r+128)));for(;0>(i=s.indexOf(`
`))&&a<t&&r<e.byteLength;)o+=s,a+=s.length,r+=128,s+=String.fromCharCode.apply(null,new Uint16Array(e.subarray(r,r+128)));return-1<i&&(!1!==n&&(e.pos+=a+i+1),o+s.slice(0,i))},r=function(e){let r=/^#\?(\S+)/,i=/^\s*GAMMA\s*=\s*(\d+(\.\d+)?)\s*$/,a=/^\s*EXPOSURE\s*=\s*(\d+(\.\d+)?)\s*$/,o=/^\s*FORMAT=(\S+)\s*$/,s=/^\s*\-Y\s+(\d+)\s+\+X\s+(\d+)\s*$/,c={valid:0,string:``,comments:``,programtype:`RGBE`,format:``,gamma:1,exposure:1,width:0,height:0},l,u;for((e.pos>=e.byteLength||!(l=n(e)))&&t(1,`no header found`),(u=l.match(r))||t(3,`bad initial token`),c.valid|=1,c.programtype=u[1],c.string+=l+`
`;l=n(e),!1!==l;){if(c.string+=l+`
`,l.charAt(0)===`#`){c.comments+=l+`
`;continue}if((u=l.match(i))&&(c.gamma=parseFloat(u[1])),(u=l.match(a))&&(c.exposure=parseFloat(u[1])),(u=l.match(o))&&(c.valid|=2,c.format=u[1]),(u=l.match(s))&&(c.valid|=4,c.height=parseInt(u[1],10),c.width=parseInt(u[2],10)),c.valid&2&&c.valid&4)break}return c.valid&2||t(3,`missing format specifier`),c.valid&4||t(3,`missing image size specifier`),c},i=function(e,n,r){let i=n;if(i<8||i>32767||e[0]!==2||e[1]!==2||e[2]&128)return new Uint8Array(e);i!==(e[2]<<8|e[3])&&t(3,`wrong scanline width`);let a=new Uint8Array(4*n*r);a.length||t(4,`unable to allocate buffer space`);let o=0,s=0,c=4*i,l=new Uint8Array(4),u=new Uint8Array(c),d=r;for(;d>0&&s<e.byteLength;){s+4>e.byteLength&&t(1),l[0]=e[s++],l[1]=e[s++],l[2]=e[s++],l[3]=e[s++],(l[0]!=2||l[1]!=2||(l[2]<<8|l[3])!=i)&&t(3,`bad rgbe scanline format`);let n=0,r;for(;n<c&&s<e.byteLength;){r=e[s++];let i=r>128;if(i&&(r-=128),(r===0||n+r>c)&&t(3,`bad scanline data`),i){let t=e[s++];for(let e=0;e<r;e++)u[n++]=t}else u.set(e.subarray(s,s+r),n),n+=r,s+=r}let f=i;for(let e=0;e<f;e++){let t=0;a[o]=u[e+t],t+=i,a[o+1]=u[e+t],t+=i,a[o+2]=u[e+t],t+=i,a[o+3]=u[e+t],o+=4}d--}return a},a=function(e,t,n,r){let i=2**(e[t+3]-128)/255;n[r+0]=e[t+0]*i,n[r+1]=e[t+1]*i,n[r+2]=e[t+2]*i,n[r+3]=1},o=function(e,t,n,r){let i=2**(e[t+3]-128)/255;n[r+0]=d.toHalfFloat(Math.min(e[t+0]*i,65504)),n[r+1]=d.toHalfFloat(Math.min(e[t+1]*i,65504)),n[r+2]=d.toHalfFloat(Math.min(e[t+2]*i,65504)),n[r+3]=d.toHalfFloat(1)},s=new Uint8Array(e);s.pos=0;let c=r(s),l=c.width,u=c.height,f=i(s.subarray(s.pos),l,u),p,h,g;switch(this.type){case ue:g=f.length/4;let e=new Float32Array(g*4);for(let t=0;t<g;t++)a(f,t*4,e,t*4);p=e,h=ue;break;case m:g=f.length/4;let t=new Uint16Array(g*4);for(let e=0;e<g;e++)o(f,e*4,t,e*4);p=t,h=m;break;default:throw Error(`THREE.RGBELoader: Unsupported type: `+this.type)}return{width:l,height:u,data:p,header:c.string,gamma:c.gamma,exposure:c.exposure,type:h}}setDataType(e){return this.type=e,this}load(e,t,n,i){function a(e,n){switch(e.type){case ue:case m:`colorSpace`in e?e.colorSpace=`srgb-linear`:e.encoding=3e3,e.minFilter=r,e.magFilter=r,e.generateMipmaps=!1,e.flipY=!0}t&&t(e,n)}return super.load(e,a,n,i)}}})))()}var At,jt;function Mt(){return(Mt=H((()=>{P(),wt(),He(),At=Ue>=152,jt=class extends a{constructor(e){super(e),this.type=m}parse(e){let t=65536,n=8192,r=65537,i=16384,a=16383,o=65535,s=2.7182818**2.2;function c(e,n){for(var r=0,i=0;i<t;++i)(i==0||e[i>>3]&1<<(i&7))&&(n[r++]=i);for(var a=r-1;r<t;)n[r++]=0;return a}function l(e){for(var t=0;t<i;t++)e[t]={},e[t].len=0,e[t].lit=0,e[t].p=null}let u={l:0,c:0,lc:0};function f(e,t,n,r,i){for(;n<e;)t=t<<8|xe(r,i),n+=8;n-=e,u.l=t>>n&(1<<e)-1,u.c=t,u.lc=n}let p=Array(59);function h(e){for(var t=0;t<=58;++t)p[t]=0;for(var t=0;t<r;++t)p[e[t]]+=1;for(var n=0,t=58;t>0;--t){var i=n+p[t]>>1;p[t]=n,n=i}for(var t=0;t<r;++t){var a=e[t];a>0&&(e[t]=a|p[a]++<<6)}}function g(e,t,n,r,i,a,o){for(var s=n,c=0,l=0;i<=a;i++){if(s.value-n.value>r)return!1;f(6,c,l,e,s);var d=u.l;if(c=u.c,l=u.lc,o[i]=d,d==63){if(s.value-n.value>r)throw`Something wrong with hufUnpackEncTable`;f(8,c,l,e,s);var p=u.l+6;if(c=u.c,l=u.lc,i+p>a+1)throw`Something wrong with hufUnpackEncTable`;for(;p--;)o[i++]=0;i--}else if(d>=59){var p=d-59+2;if(i+p>a+1)throw`Something wrong with hufUnpackEncTable`;for(;p--;)o[i++]=0;i--}}h(o)}function _(e){return e&63}function v(e){return e>>6}function y(e,t,n,r){for(;t<=n;t++){var i=v(e[t]),a=_(e[t]);if(i>>a)throw`Invalid table entry`;if(a>14){var o=r[i>>a-14];if(o.len)throw`Invalid table entry`;if(o.lit++,o.p){var s=o.p;o.p=Array(o.lit);for(var c=0;c<o.lit-1;++c)o.p[c]=s[c]}else o.p=[,];o.p[o.lit-1]=t}else if(a)for(var l=0,c=1<<14-a;c>0;c--){var o=r[(i<<14-a)+l];if(o.len||o.p)throw`Invalid table entry`;o.len=a,o.lit=t,l++}}return!0}let b={c:0,lc:0};function x(e,t,n,r){e=e<<8|xe(n,r),t+=8,b.c=e,b.lc=t}let S={c:0,lc:0};function C(e,t,n,r,i,a,o,s,c,l){if(e==t){r<8&&(x(n,r,i,o),n=b.c,r=b.lc),r-=8;var u=n>>r,u=new Uint8Array([u])[0];if(c.value+u>l)return!1;for(var d=s[c.value-1];u-->0;)s[c.value++]=d}else if(c.value<l)s[c.value++]=e;else return!1;S.c=n,S.lc=r}function w(e){return e&65535}function T(e){var t=w(e);return t>32767?t-65536:t}let E={a:0,b:0};function D(e,t){var n=T(e),r=T(t),i=n+(r&1)+(r>>1),a=i,o=i-r;E.a=a,E.b=o}function O(e,t){var n=w(e),r=w(t),i=n-(r>>1)&o,a=r+i-32768&o;E.a=a,E.b=i}function k(e,t,n,r,i,a,o){for(var s=o<16384,c=n>i?i:n,l=1,u;l<=c;)l<<=1;for(l>>=1,u=l,l>>=1;l>=1;){for(var d=0,f=d+a*(i-u),p=a*l,m=a*u,h=r*l,g=r*u,_,v,y,b;d<=f;d+=m){for(var x=d,S=d+r*(n-u);x<=S;x+=g){var C=x+h,w=x+p,T=w+h;s?(D(e[x+t],e[w+t]),_=E.a,y=E.b,D(e[C+t],e[T+t]),v=E.a,b=E.b,D(_,v),e[x+t]=E.a,e[C+t]=E.b,D(y,b),e[w+t]=E.a,e[T+t]=E.b):(O(e[x+t],e[w+t]),_=E.a,y=E.b,O(e[C+t],e[T+t]),v=E.a,b=E.b,O(_,v),e[x+t]=E.a,e[C+t]=E.b,O(y,b),e[w+t]=E.a,e[T+t]=E.b)}if(n&l){var w=x+p;s?D(e[x+t],e[w+t]):O(e[x+t],e[w+t]),_=E.a,e[w+t]=E.b,e[x+t]=_}}if(i&l)for(var x=d,S=d+r*(n-u);x<=S;x+=g){var C=x+h;s?D(e[x+t],e[C+t]):O(e[x+t],e[C+t]),_=E.a,e[C+t]=E.b,e[x+t]=_}u=l,l>>=1}return d}function A(e,t,n,r,i,o,s,c,l,u){for(var d=0,f=0,p=c,m=Math.trunc(i.value+(o+7)/8);i.value<m;)for(x(d,f,n,i),d=b.c,f=b.lc;f>=14;){var h=t[d>>f-14&a];if(h.len)f-=h.len,C(h.lit,s,d,f,n,r,i,l,u,p),d=S.c,f=S.lc;else{if(!h.p)throw`hufDecode issues`;for(var g=0;g<h.lit;g++){for(var y=_(e[h.p[g]]);f<y&&i.value<m;)x(d,f,n,i),d=b.c,f=b.lc;if(f>=y&&v(e[h.p[g]])==(d>>f-y&(1<<y)-1)){f-=y,C(h.p[g],s,d,f,n,r,i,l,u,p),d=S.c,f=S.lc;break}}if(g==h.lit)throw`hufDecode issues`}}var w=8-o&7;for(d>>=w,f-=w;f>0;){var h=t[d<<14-f&a];if(h.len)f-=h.len,C(h.lit,s,d,f,n,r,i,l,u,p),d=S.c,f=S.lc;else throw`hufDecode issues`}return!0}function ee(e,t,n,a,o,s){var c={value:0},u=n.value,d=I(t,n),f=I(t,n);n.value+=4;var p=I(t,n);if(n.value+=4,d<0||d>=r||f<0||f>=r)throw`Something wrong with HUF_ENCSIZE`;var m=Array(r),h=Array(i);if(l(h),g(e,t,n,a-(n.value-u),d,f,m),p>8*(a-(n.value-u)))throw`Something wrong with hufUncompress`;y(m,d,f,h),A(m,h,e,t,n,p,f,s,o,c)}function j(e,t,n){for(var r=0;r<n;++r)t[r]=e[t[r]]}function te(e){for(var t=1;t<e.length;t++){var n=e[t-1]+e[t]-128;e[t]=n}}function ne(e,t){for(var n=0,r=Math.floor((e.length+1)/2),i=0,a=e.length-1;!(i>a||(t[i++]=e[n++],i>a));)t[i++]=e[r++]}function M(e){for(var t=e.byteLength,n=[],r=0,i=new DataView(e);t>0;){var a=i.getInt8(r++);if(a<0){var o=-a;t-=o+1;for(var s=0;s<o;s++)n.push(i.getUint8(r++))}else{var o=a;t-=2;for(var c=i.getUint8(r++),s=0;s<o+1;s++)n.push(c)}}return n}function re(e,t,n,r,i,a){var o=new DataView(a.buffer),s=n[e.idx[0]].width,c=n[e.idx[0]].height,l=3,u=Math.floor(s/8),d=Math.ceil(s/8),f=Math.ceil(c/8),p=s-(d-1)*8,m=c-(f-1)*8,h={value:0},g=Array(l),_=Array(l),v=Array(l),y=Array(l),b=Array(l);for(let n=0;n<l;++n)b[n]=t[e.idx[n]],g[n]=n<1?0:g[n-1]+d*f,_[n]=new Float32Array(64),v[n]=new Uint16Array(64),y[n]=new Uint16Array(d*64);for(let t=0;t<f;++t){var x=8;t==f-1&&(x=m);var S=8;for(let e=0;e<d;++e){e==d-1&&(S=p);for(let e=0;e<l;++e)v[e].fill(0),v[e][0]=i[g[e]++],ie(h,r,v[e]),ae(v[e],_[e]),oe(_[e]);se(_);for(let t=0;t<l;++t)ce(_[t],y[t],e*64)}let a=0;for(let r=0;r<l;++r){let i=n[e.idx[r]].type;for(let e=8*t;e<8*t+x;++e){a=b[r][e];for(let t=0;t<u;++t){let n=t*64+(e&7)*8;o.setUint16(a+0*i,y[r][n+0],!0),o.setUint16(a+2*i,y[r][n+1],!0),o.setUint16(a+4*i,y[r][n+2],!0),o.setUint16(a+6*i,y[r][n+3],!0),o.setUint16(a+8*i,y[r][n+4],!0),o.setUint16(a+10*i,y[r][n+5],!0),o.setUint16(a+12*i,y[r][n+6],!0),o.setUint16(a+14*i,y[r][n+7],!0),a+=16*i}}if(u!=d)for(let e=8*t;e<8*t+x;++e){let t=b[r][e]+8*u*2*i,n=u*64+(e&7)*8;for(let e=0;e<S;++e)o.setUint16(t+e*2*i,y[r][n+e],!0)}}}for(var C=new Uint16Array(s),o=new DataView(a.buffer),w=0;w<l;++w){n[e.idx[w]].decoded=!0;var T=n[e.idx[w]].type;if(n[w].type==2)for(var E=0;E<c;++E){let e=b[w][E];for(var D=0;D<s;++D)C[D]=o.getUint16(e+D*2*T,!0);for(var D=0;D<s;++D)o.setFloat32(e+D*2*T,B(C[D]),!0)}}}function ie(e,t,n){for(var r,i=1;i<64;)r=t[e.value],r==65280?i=64:r>>8==255?i+=r&255:(n[i]=r,i++),e.value++}function ae(e,t){t[0]=B(e[0]),t[1]=B(e[1]),t[2]=B(e[5]),t[3]=B(e[6]),t[4]=B(e[14]),t[5]=B(e[15]),t[6]=B(e[27]),t[7]=B(e[28]),t[8]=B(e[2]),t[9]=B(e[4]),t[10]=B(e[7]),t[11]=B(e[13]),t[12]=B(e[16]),t[13]=B(e[26]),t[14]=B(e[29]),t[15]=B(e[42]),t[16]=B(e[3]),t[17]=B(e[8]),t[18]=B(e[12]),t[19]=B(e[17]),t[20]=B(e[25]),t[21]=B(e[30]),t[22]=B(e[41]),t[23]=B(e[43]),t[24]=B(e[9]),t[25]=B(e[11]),t[26]=B(e[18]),t[27]=B(e[24]),t[28]=B(e[31]),t[29]=B(e[40]),t[30]=B(e[44]),t[31]=B(e[53]),t[32]=B(e[10]),t[33]=B(e[19]),t[34]=B(e[23]),t[35]=B(e[32]),t[36]=B(e[39]),t[37]=B(e[45]),t[38]=B(e[52]),t[39]=B(e[54]),t[40]=B(e[20]),t[41]=B(e[22]),t[42]=B(e[33]),t[43]=B(e[38]),t[44]=B(e[46]),t[45]=B(e[51]),t[46]=B(e[55]),t[47]=B(e[60]),t[48]=B(e[21]),t[49]=B(e[34]),t[50]=B(e[37]),t[51]=B(e[47]),t[52]=B(e[50]),t[53]=B(e[56]),t[54]=B(e[59]),t[55]=B(e[61]),t[56]=B(e[35]),t[57]=B(e[36]),t[58]=B(e[48]),t[59]=B(e[49]),t[60]=B(e[57]),t[61]=B(e[58]),t[62]=B(e[62]),t[63]=B(e[63])}function oe(e){let t=.5*Math.cos(3.14159/4),n=.5*Math.cos(3.14159/16),r=.5*Math.cos(3.14159/8),i=.5*Math.cos(3*3.14159/16),a=.5*Math.cos(15.70795/16),o=.5*Math.cos(3*3.14159/8),s=.5*Math.cos(21.99113/16);for(var c=[,,,,],l=[,,,,],u=[,,,,],d=[,,,,],f=0;f<8;++f){var p=f*8;c[0]=r*e[p+2],c[1]=o*e[p+2],c[2]=r*e[p+6],c[3]=o*e[p+6],l[0]=n*e[p+1]+i*e[p+3]+a*e[p+5]+s*e[p+7],l[1]=i*e[p+1]-s*e[p+3]-n*e[p+5]-a*e[p+7],l[2]=a*e[p+1]-n*e[p+3]+s*e[p+5]+i*e[p+7],l[3]=s*e[p+1]-a*e[p+3]+i*e[p+5]-n*e[p+7],u[0]=t*(e[p+0]+e[p+4]),u[3]=t*(e[p+0]-e[p+4]),u[1]=c[0]+c[3],u[2]=c[1]-c[2],d[0]=u[0]+u[1],d[1]=u[3]+u[2],d[2]=u[3]-u[2],d[3]=u[0]-u[1],e[p+0]=d[0]+l[0],e[p+1]=d[1]+l[1],e[p+2]=d[2]+l[2],e[p+3]=d[3]+l[3],e[p+4]=d[3]-l[3],e[p+5]=d[2]-l[2],e[p+6]=d[1]-l[1],e[p+7]=d[0]-l[0]}for(var m=0;m<8;++m)c[0]=r*e[16+m],c[1]=o*e[16+m],c[2]=r*e[48+m],c[3]=o*e[48+m],l[0]=n*e[8+m]+i*e[24+m]+a*e[40+m]+s*e[56+m],l[1]=i*e[8+m]-s*e[24+m]-n*e[40+m]-a*e[56+m],l[2]=a*e[8+m]-n*e[24+m]+s*e[40+m]+i*e[56+m],l[3]=s*e[8+m]-a*e[24+m]+i*e[40+m]-n*e[56+m],u[0]=t*(e[m]+e[32+m]),u[3]=t*(e[m]-e[32+m]),u[1]=c[0]+c[3],u[2]=c[1]-c[2],d[0]=u[0]+u[1],d[1]=u[3]+u[2],d[2]=u[3]-u[2],d[3]=u[0]-u[1],e[0+m]=d[0]+l[0],e[8+m]=d[1]+l[1],e[16+m]=d[2]+l[2],e[24+m]=d[3]+l[3],e[32+m]=d[3]-l[3],e[40+m]=d[2]-l[2],e[48+m]=d[1]-l[1],e[56+m]=d[0]-l[0]}function se(e){for(var t=0;t<64;++t){var n=e[0][t],r=e[1][t],i=e[2][t];e[0][t]=n+1.5747*i,e[1][t]=n-.1873*r-.4682*i,e[2][t]=n+1.8556*r}}function ce(e,t,n){for(var r=0;r<64;++r)t[n+r]=d.toHalfFloat(le(e[r]))}function le(e){return e<=1?Math.sign(e)*Math.abs(e)**2.2:Math.sign(e)*s**(Math.abs(e)-1)}function fe(e){return new DataView(e.array.buffer,e.offset.value,e.size)}function pe(e){var t=e.viewer.buffer.slice(e.offset.value,e.offset.value+e.size),n=new Uint8Array(M(t)),r=new Uint8Array(n.length);return te(n),ne(n,r),new DataView(r.buffer)}function me(e){var t=Ze(e.array.slice(e.offset.value,e.offset.value+e.size)),n=new Uint8Array(t.length);return te(t),ne(t,n),new DataView(n.buffer)}function P(e){for(var r=e.viewer,i={value:e.offset.value},a=new Uint16Array(e.width*e.scanlineBlockSize*(e.channels*e.type)),o=new Uint8Array(n),s=0,l=Array(e.channels),u=0;u<e.channels;u++)l[u]={},l[u].start=s,l[u].end=l[u].start,l[u].nx=e.width,l[u].ny=e.lines,l[u].size=e.type,s+=l[u].nx*l[u].ny*l[u].size;var d=Ce(r,i),f=Ce(r,i);if(f>=n)throw`Something is wrong with PIZ_COMPRESSION BITMAP_SIZE`;if(d<=f)for(var u=0;u<f-d+1;u++)o[u+d]=L(r,i);var p=new Uint16Array(t),m=c(o,p),h=I(r,i);ee(e.array,r,i,h,a,s);for(var u=0;u<e.channels;++u)for(var g=l[u],_=0;_<l[u].size;++_)k(a,g.start+_,g.nx,g.size,g.ny,g.nx*g.size,m);j(p,a,s);for(var v=0,y=new Uint8Array(a.buffer.byteLength),b=0;b<e.lines;b++)for(var x=0;x<e.channels;x++){var g=l[x],S=g.nx*g.size,C=new Uint8Array(a.buffer,g.end*2,S*2);y.set(C,v),v+=S*2,g.end+=S}return new DataView(y.buffer)}function he(e){var t=Ze(e.array.slice(e.offset.value,e.offset.value+e.size));let n=e.lines*e.channels*e.width,r=e.type==1?new Uint16Array(n):new Uint32Array(n),i=0,a=0,o=[,,,,];for(let n=0;n<e.lines;n++)for(let n=0;n<e.channels;n++){let n=0;switch(e.type){case 1:o[0]=i,o[1]=o[0]+e.width,i=o[1]+e.width;for(let i=0;i<e.width;++i){let e=t[o[0]++]<<8|t[o[1]++];n+=e,r[a]=n,a++}break;case 2:o[0]=i,o[1]=o[0]+e.width,o[2]=o[1]+e.width,i=o[2]+e.width;for(let i=0;i<e.width;++i){let e=t[o[0]++]<<24|t[o[1]++]<<16|t[o[2]++]<<8;n+=e,r[a]=n,a++}}}return new DataView(r.buffer)}function ge(e){var t=e.viewer,n={value:e.offset.value},r=new Uint8Array(e.width*e.lines*(e.channels*e.type*2)),i={version:R(t,n),unknownUncompressedSize:R(t,n),unknownCompressedSize:R(t,n),acCompressedSize:R(t,n),dcCompressedSize:R(t,n),rleCompressedSize:R(t,n),rleUncompressedSize:R(t,n),rleRawSize:R(t,n),totalAcUncompressedCount:R(t,n),totalDcUncompressedCount:R(t,n),acCompression:R(t,n)};if(i.version<2)throw`EXRLoader.parse: `+Re.compression+` version `+i.version+` is unsupported`;for(var a=[],o=Ce(t,n)-2;o>0;){var s=F(t.buffer,n),c=L(t,n),l=c>>2&3,u=(c>>4)-1,d=new Int8Array([u])[0],f=L(t,n);a.push({name:s,index:d,type:f,compression:l}),o-=s.length+3}for(var p=Re.channels,m=Array(e.channels),h=0;h<e.channels;++h){var g=m[h]={},_=p[h];g.name=_.name,g.compression=0,g.decoded=!1,g.type=_.pixelType,g.pLinear=_.pLinear,g.width=e.width,g.height=e.lines}for(var v={idx:[,,,]},y=0;y<e.channels;++y)for(var g=m[y],h=0;h<a.length;++h){var b=a[h];g.name==b.name&&(g.compression=b.compression,b.index>=0&&(v.idx[b.index]=y),g.offset=y)}if(i.acCompressedSize>0)switch(i.acCompression){case 0:var x=new Uint16Array(i.totalAcUncompressedCount);ee(e.array,t,n,i.acCompressedSize,x,i.totalAcUncompressedCount);break;case 1:var S=e.array.slice(n.value,n.value+i.totalAcUncompressedCount),C=Ze(S),x=new Uint16Array(C.buffer);n.value+=i.totalAcUncompressedCount}if(i.dcCompressedSize>0){var w={array:e.array,offset:n,size:i.dcCompressedSize},T=new Uint16Array(me(w).buffer);n.value+=i.dcCompressedSize}if(i.rleRawSize>0){var S=e.array.slice(n.value,n.value+i.rleCompressedSize),C=Ze(S),E=M(C.buffer);n.value+=i.rleCompressedSize}for(var D=0,O=Array(m.length),h=0;h<O.length;++h)O[h]=[];for(var k=0;k<e.lines;++k)for(var A=0;A<m.length;++A)O[A].push(D),D+=m[A].width*e.type*2;re(v,O,m,x,T,r);for(var h=0;h<m.length;++h){var g=m[h];if(!g.decoded)switch(g.compression){case 2:for(var j=0,te=0,k=0;k<e.lines;++k){for(var ne=O[h][j],N=0;N<g.width;++N){for(var ie=0;ie<2*g.type;++ie)r[ne++]=E[te+ie*g.width*g.height];te++}j++}break;default:throw`EXRLoader.parse: unsupported channel compression`}}return new DataView(r.buffer)}function F(e,t){for(var n=new Uint8Array(e),r=0;n[t.value+r]!=0;)r+=1;var i=new TextDecoder().decode(n.slice(t.value,t.value+r));return t.value=t.value+r+1,i}function _e(e,t,n){var r=new TextDecoder().decode(new Uint8Array(e).slice(t.value,t.value+n));return t.value+=n,r}function ve(e,t){return[be(e,t),I(e,t)]}function ye(e,t){return[I(e,t),I(e,t)]}function be(e,t){var n=e.getInt32(t.value,!0);return t.value+=4,n}function I(e,t){var n=e.getUint32(t.value,!0);return t.value+=4,n}function xe(e,t){var n=e[t.value];return t.value+=1,n}function L(e,t){var n=e.getUint8(t.value);return t.value+=1,n}let R=function(e,t){let n;return n=`getBigInt64`in DataView.prototype?Number(e.getBigInt64(t.value,!0)):e.getUint32(t.value+4,!0)+Number(e.getUint32(t.value,!0)<<32),t.value+=8,n};function z(e,t){var n=e.getFloat32(t.value,!0);return t.value+=4,n}function Se(e,t){return d.toHalfFloat(z(e,t))}function B(e){var t=(e&31744)>>10,n=e&1023;return(e>>15?-1:1)*(t?t===31?n?NaN:1/0:2**(t-15)*(1+n/1024):n/1024*6103515625e-14)}function Ce(e,t){var n=e.getUint16(t.value,!0);return t.value+=2,n}function we(e,t){return B(Ce(e,t))}function Te(e,t,n,r){for(var i=n.value,a=[];n.value<i+r-1;){var o=F(t,n),s=be(e,n),c=L(e,n);n.value+=3;var l=be(e,n),u=be(e,n);a.push({name:o,pixelType:s,pLinear:c,xSampling:l,ySampling:u})}return n.value+=1,a}function Ee(e,t){return{redX:z(e,t),redY:z(e,t),greenX:z(e,t),greenY:z(e,t),blueX:z(e,t),blueY:z(e,t),whiteX:z(e,t),whiteY:z(e,t)}}function De(e,t){return[`NO_COMPRESSION`,`RLE_COMPRESSION`,`ZIPS_COMPRESSION`,`ZIP_COMPRESSION`,`PIZ_COMPRESSION`,`PXR24_COMPRESSION`,`B44_COMPRESSION`,`B44A_COMPRESSION`,`DWAA_COMPRESSION`,`DWAB_COMPRESSION`][L(e,t)]}function Oe(e,t){return{xMin:I(e,t),yMin:I(e,t),xMax:I(e,t),yMax:I(e,t)}}function ke(e,t){return[`INCREASING_Y`][L(e,t)]}function Ae(e,t){return[z(e,t),z(e,t)]}function je(e,t){return[z(e,t),z(e,t),z(e,t)]}function Me(e,t,n,r,i){if(r===`string`||r===`stringvector`||r===`iccProfile`)return _e(t,n,i);if(r===`chlist`)return Te(e,t,n,i);if(r===`chromaticities`)return Ee(e,n);if(r===`compression`)return De(e,n);if(r===`box2i`)return Oe(e,n);if(r===`lineOrder`)return ke(e,n);if(r===`float`)return z(e,n);if(r===`v2f`)return Ae(e,n);if(r===`v3f`)return je(e,n);if(r===`int`)return be(e,n);if(r===`rational`)return ve(e,n);if(r===`timecode`)return ye(e,n);if(r===`preview`)return n.value+=i,`skipped`;n.value+=i}function Ne(e,t,n){let r={};if(e.getUint32(0,!0)!=20000630)throw`THREE.EXRLoader: provided file doesn't appear to be in OpenEXR format.`;r.version=e.getUint8(4);let i=e.getUint8(5);r.spec={singleTile:!!(i&2),longName:!!(i&4),deepFormat:!!(i&8),multiPart:!!(i&16)},n.value=8;for(var a=!0;a;){var o=F(t,n);if(o==0)a=!1;else{var s=F(t,n),c=Me(e,t,n,s,I(e,n));c===void 0?console.warn(`EXRLoader.parse: skipped unknown header attribute type '${s}'.`):r[o]=c}}if(i&-5)throw console.error(`EXRHeader:`,r),`THREE.EXRLoader: provided file is currently unsupported.`;return r}function Pe(e,t,n,r,i){let a={size:0,viewer:t,array:n,offset:r,width:e.dataWindow.xMax-e.dataWindow.xMin+1,height:e.dataWindow.yMax-e.dataWindow.yMin+1,channels:e.channels.length,bytesPerLine:null,lines:null,inputSize:null,type:e.channels[0].pixelType,uncompress:null,getter:null,format:null,[At?`colorSpace`:`encoding`]:null};switch(e.compression){case`NO_COMPRESSION`:a.lines=1,a.uncompress=fe;break;case`RLE_COMPRESSION`:a.lines=1,a.uncompress=pe;break;case`ZIPS_COMPRESSION`:a.lines=1,a.uncompress=me;break;case`ZIP_COMPRESSION`:a.lines=16,a.uncompress=me;break;case`PIZ_COMPRESSION`:a.lines=32,a.uncompress=P;break;case`PXR24_COMPRESSION`:a.lines=16,a.uncompress=he;break;case`DWAA_COMPRESSION`:a.lines=32,a.uncompress=ge;break;case`DWAB_COMPRESSION`:a.lines=256,a.uncompress=ge;break;default:throw`EXRLoader.parse: `+e.compression+` is unsupported`}if(a.scanlineBlockSize=a.lines,a.type==1)switch(i){case ue:a.getter=we,a.inputSize=2;break;case m:a.getter=Ce,a.inputSize=2}else if(a.type==2)switch(i){case ue:a.getter=z,a.inputSize=4;break;case m:a.getter=Se,a.inputSize=4}else throw`EXRLoader.parse: unsupported pixelType `+a.type+` for `+e.compression+`.`;a.blockCount=(e.dataWindow.yMax+1)/a.scanlineBlockSize;for(var o=0;o<a.blockCount;o++)R(t,r);a.outputChannels=a.channels==3?4:a.channels;let s=a.width*a.height*a.outputChannels;switch(i){case ue:a.byteArray=new Float32Array(s),a.channels<a.outputChannels&&a.byteArray.fill(1,0,s);break;case m:a.byteArray=new Uint16Array(s),a.channels<a.outputChannels&&a.byteArray.fill(15360,0,s);break;default:console.error(`THREE.EXRLoader: unsupported type: `,i)}return a.bytesPerLine=a.width*a.inputSize*a.channels,a.format=a.outputChannels==4?N:de,At?a.colorSpace=`srgb-linear`:a.encoding=3e3,a}let Fe=new DataView(e),Ie=new Uint8Array(e),Le={value:0},Re=Ne(Fe,e,Le),V=Pe(Re,Fe,Ie,Le,this.type),ze={value:0},Be={R:0,G:1,B:2,A:3,Y:0};for(let e=0;e<V.height/V.scanlineBlockSize;e++){let t=I(Fe,Le);V.size=I(Fe,Le),V.lines=t+V.scanlineBlockSize>V.height?V.height-t:V.scanlineBlockSize;let n=V.size<V.lines*V.bytesPerLine?V.uncompress(V):fe(V);Le.value+=V.size;for(let t=0;t<V.scanlineBlockSize;t++){let r=t+e*V.scanlineBlockSize;if(r>=V.height)break;for(let e=0;e<V.channels;e++){let i=Be[Re.channels[e].name];for(let a=0;a<V.width;a++){ze.value=(t*(V.channels*V.width)+e*V.width+a)*V.inputSize;let o=(V.height-1-r)*(V.width*V.outputChannels)+a*V.outputChannels+i;V.byteArray[o]=V.getter(n,ze)}}}}return{header:Re,width:V.width,height:V.height,data:V.byteArray,format:V.format,[At?`colorSpace`:`encoding`]:V[At?`colorSpace`:`encoding`],type:this.type}}setDataType(e){return this.type=e,this}load(e,t,n,i){function a(e,n){At?e.colorSpace=n.colorSpace:e.encoding=n.encoding,e.minFilter=r,e.magFilter=r,e.generateMipmaps=!1,e.flipY=!1,t&&t(e,n)}return super.load(e,a,n,i)}}})))()}var Nt,Pt,Ft;function It(){return(It=H((()=>{P(),Nt=new s,Pt=new i,Ft=class extends T{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type=`LineSegmentsGeometry`,this.setIndex([0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5]),this.setAttribute(`position`,new fe([-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],3)),this.setAttribute(`uv`,new fe([-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],2))}applyMatrix4(e){let t=this.attributes.instanceStart,n=this.attributes.instanceEnd;return t!==void 0&&(t.applyMatrix4(e),n.applyMatrix4(e),t.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));let n=new D(t,6,1);return this.setAttribute(`instanceStart`,new j(n,3,0)),this.setAttribute(`instanceEnd`,new j(n,3,3)),this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e,t=3){let n;e instanceof Float32Array?n=e:Array.isArray(e)&&(n=new Float32Array(e));let r=new D(n,t*2,1);return this.setAttribute(`instanceColorStart`,new j(r,t,0)),this.setAttribute(`instanceColorEnd`,new j(r,t,t)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new p(e.geometry)),this}fromLineSegments(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new s);let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;e!==void 0&&t!==void 0&&(this.boundingBox.setFromBufferAttribute(e),Nt.setFromBufferAttribute(t),this.boundingBox.union(Nt))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new g),this.boundingBox===null&&this.computeBoundingBox();let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;if(e!==void 0&&t!==void 0){let n=this.boundingSphere.center;this.boundingBox.getCenter(n);let r=0;for(let i=0,a=e.count;i<a;i++)Pt.fromBufferAttribute(e,i),r=Math.max(r,n.distanceToSquared(Pt)),Pt.fromBufferAttribute(t,i),r=Math.max(r,n.distanceToSquared(Pt));this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error(`THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.`,this)}}toJSON(){}applyMatrix(e){return console.warn(`THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4().`),this.applyMatrix4(e)}}})))()}var Lt;function Rt(){return(Rt=H((()=>{It(),Lt=class extends Ft{constructor(){super(),this.isLineGeometry=!0,this.type=`LineGeometry`}setPositions(e){let t=e.length-3,n=new Float32Array(2*t);for(let r=0;r<t;r+=3)n[2*r]=e[r],n[2*r+1]=e[r+1],n[2*r+2]=e[r+2],n[2*r+3]=e[r+3],n[2*r+4]=e[r+4],n[2*r+5]=e[r+5];return super.setPositions(n),this}setColors(e,t=3){let n=e.length-t,r=new Float32Array(2*n);if(t===3)for(let i=0;i<n;i+=t)r[2*i]=e[i],r[2*i+1]=e[i+1],r[2*i+2]=e[i+2],r[2*i+3]=e[i+3],r[2*i+4]=e[i+4],r[2*i+5]=e[i+5];else for(let i=0;i<n;i+=t)r[2*i]=e[i],r[2*i+1]=e[i+1],r[2*i+2]=e[i+2],r[2*i+3]=e[i+3],r[2*i+4]=e[i+4],r[2*i+5]=e[i+5],r[2*i+6]=e[i+6],r[2*i+7]=e[i+7];return super.setColors(r,t),this}fromLine(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}}})))()}var zt;function Bt(){return(Bt=H((()=>{P(),He(),zt=class extends n{constructor(e){super({type:`LineMaterial`,uniforms:me.clone(me.merge([xe.common,xe.fog,{worldUnits:{value:1},linewidth:{value:1},resolution:{value:new _(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}}])),vertexShader:`
				#include <common>
				#include <fog_pars_vertex>
				#include <logdepthbuf_pars_vertex>
				#include <clipping_planes_pars_vertex>

				uniform float linewidth;
				uniform vec2 resolution;

				attribute vec3 instanceStart;
				attribute vec3 instanceEnd;

				#ifdef USE_COLOR
					#ifdef USE_LINE_COLOR_ALPHA
						varying vec4 vLineColor;
						attribute vec4 instanceColorStart;
						attribute vec4 instanceColorEnd;
					#else
						varying vec3 vLineColor;
						attribute vec3 instanceColorStart;
						attribute vec3 instanceColorEnd;
					#endif
				#endif

				#ifdef WORLD_UNITS

					varying vec4 worldPos;
					varying vec3 worldStart;
					varying vec3 worldEnd;

					#ifdef USE_DASH

						varying vec2 vUv;

					#endif

				#else

					varying vec2 vUv;

				#endif

				#ifdef USE_DASH

					uniform float dashScale;
					attribute float instanceDistanceStart;
					attribute float instanceDistanceEnd;
					varying float vLineDistance;

				#endif

				void trimSegment( const in vec4 start, inout vec4 end ) {

					// trim end segment so it terminates between the camera plane and the near plane

					// conservative estimate of the near plane
					float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
					float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
					float nearEstimate = - 0.5 * b / a;

					float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

					end.xyz = mix( start.xyz, end.xyz, alpha );

				}

				void main() {

					#ifdef USE_COLOR

						vLineColor = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

					#endif

					#ifdef USE_DASH

						vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;
						vUv = uv;

					#endif

					float aspect = resolution.x / resolution.y;

					// camera space
					vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
					vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

					#ifdef WORLD_UNITS

						worldStart = start.xyz;
						worldEnd = end.xyz;

					#else

						vUv = uv;

					#endif

					// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
					// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
					// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
					// perhaps there is a more elegant solution -- WestLangley

					bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

					if ( perspective ) {

						if ( start.z < 0.0 && end.z >= 0.0 ) {

							trimSegment( start, end );

						} else if ( end.z < 0.0 && start.z >= 0.0 ) {

							trimSegment( end, start );

						}

					}

					// clip space
					vec4 clipStart = projectionMatrix * start;
					vec4 clipEnd = projectionMatrix * end;

					// ndc space
					vec3 ndcStart = clipStart.xyz / clipStart.w;
					vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

					// direction
					vec2 dir = ndcEnd.xy - ndcStart.xy;

					// account for clip-space aspect ratio
					dir.x *= aspect;
					dir = normalize( dir );

					#ifdef WORLD_UNITS

						// get the offset direction as perpendicular to the view vector
						vec3 worldDir = normalize( end.xyz - start.xyz );
						vec3 offset;
						if ( position.y < 0.5 ) {

							offset = normalize( cross( start.xyz, worldDir ) );

						} else {

							offset = normalize( cross( end.xyz, worldDir ) );

						}

						// sign flip
						if ( position.x < 0.0 ) offset *= - 1.0;

						float forwardOffset = dot( worldDir, vec3( 0.0, 0.0, 1.0 ) );

						// don't extend the line if we're rendering dashes because we
						// won't be rendering the endcaps
						#ifndef USE_DASH

							// extend the line bounds to encompass  endcaps
							start.xyz += - worldDir * linewidth * 0.5;
							end.xyz += worldDir * linewidth * 0.5;

							// shift the position of the quad so it hugs the forward edge of the line
							offset.xy -= dir * forwardOffset;
							offset.z += 0.5;

						#endif

						// endcaps
						if ( position.y > 1.0 || position.y < 0.0 ) {

							offset.xy += dir * 2.0 * forwardOffset;

						}

						// adjust for linewidth
						offset *= linewidth * 0.5;

						// set the world position
						worldPos = ( position.y < 0.5 ) ? start : end;
						worldPos.xyz += offset;

						// project the worldpos
						vec4 clip = projectionMatrix * worldPos;

						// shift the depth of the projected points so the line
						// segments overlap neatly
						vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
						clip.z = clipPose.z * clip.w;

					#else

						vec2 offset = vec2( dir.y, - dir.x );
						// undo aspect ratio adjustment
						dir.x /= aspect;
						offset.x /= aspect;

						// sign flip
						if ( position.x < 0.0 ) offset *= - 1.0;

						// endcaps
						if ( position.y < 0.0 ) {

							offset += - dir;

						} else if ( position.y > 1.0 ) {

							offset += dir;

						}

						// adjust for linewidth
						offset *= linewidth;

						// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
						offset /= resolution.y;

						// select end
						vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

						// back to clip space
						offset *= clip.w;

						clip.xy += offset;

					#endif

					gl_Position = clip;

					vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

					#include <logdepthbuf_vertex>
					#include <clipping_planes_vertex>
					#include <fog_vertex>

				}
			`,fragmentShader:`
				uniform vec3 diffuse;
				uniform float opacity;
				uniform float linewidth;

				#ifdef USE_DASH

					uniform float dashOffset;
					uniform float dashSize;
					uniform float gapSize;

				#endif

				varying float vLineDistance;

				#ifdef WORLD_UNITS

					varying vec4 worldPos;
					varying vec3 worldStart;
					varying vec3 worldEnd;

					#ifdef USE_DASH

						varying vec2 vUv;

					#endif

				#else

					varying vec2 vUv;

				#endif

				#include <common>
				#include <fog_pars_fragment>
				#include <logdepthbuf_pars_fragment>
				#include <clipping_planes_pars_fragment>

				#ifdef USE_COLOR
					#ifdef USE_LINE_COLOR_ALPHA
						varying vec4 vLineColor;
					#else
						varying vec3 vLineColor;
					#endif
				#endif

				vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

					float mua;
					float mub;

					vec3 p13 = p1 - p3;
					vec3 p43 = p4 - p3;

					vec3 p21 = p2 - p1;

					float d1343 = dot( p13, p43 );
					float d4321 = dot( p43, p21 );
					float d1321 = dot( p13, p21 );
					float d4343 = dot( p43, p43 );
					float d2121 = dot( p21, p21 );

					float denom = d2121 * d4343 - d4321 * d4321;

					float numer = d1343 * d4321 - d1321 * d4343;

					mua = numer / denom;
					mua = clamp( mua, 0.0, 1.0 );
					mub = ( d1343 + d4321 * ( mua ) ) / d4343;
					mub = clamp( mub, 0.0, 1.0 );

					return vec2( mua, mub );

				}

				void main() {

					#include <clipping_planes_fragment>

					#ifdef USE_DASH

						if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

						if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

					#endif

					float alpha = opacity;

					#ifdef WORLD_UNITS

						// Find the closest points on the view ray and the line segment
						vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
						vec3 lineDir = worldEnd - worldStart;
						vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

						vec3 p1 = worldStart + lineDir * params.x;
						vec3 p2 = rayEnd * params.y;
						vec3 delta = p1 - p2;
						float len = length( delta );
						float norm = len / linewidth;

						#ifndef USE_DASH

							#ifdef USE_ALPHA_TO_COVERAGE

								float dnorm = fwidth( norm );
								alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

							#else

								if ( norm > 0.5 ) {

									discard;

								}

							#endif

						#endif

					#else

						#ifdef USE_ALPHA_TO_COVERAGE

							// artifacts appear on some hardware if a derivative is taken within a conditional
							float a = vUv.x;
							float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
							float len2 = a * a + b * b;
							float dlen = fwidth( len2 );

							if ( abs( vUv.y ) > 1.0 ) {

								alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

							}

						#else

							if ( abs( vUv.y ) > 1.0 ) {

								float a = vUv.x;
								float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
								float len2 = a * a + b * b;

								if ( len2 > 1.0 ) discard;

							}

						#endif

					#endif

					vec4 diffuseColor = vec4( diffuse, alpha );
					#ifdef USE_COLOR
						#ifdef USE_LINE_COLOR_ALPHA
							diffuseColor *= vLineColor;
						#else
							diffuseColor.rgb *= vLineColor;
						#endif
					#endif

					#include <logdepthbuf_fragment>

					gl_FragColor = diffuseColor;

					#include <tonemapping_fragment>
					#include <${Ue>=154?`colorspace_fragment`:`encodings_fragment`}>
					#include <fog_fragment>
					#include <premultiplied_alpha_fragment>

				}
			`,clipping:!0}),this.isLineMaterial=!0,this.onBeforeCompile=function(){this.transparent?this.defines.USE_LINE_COLOR_ALPHA=`1`:delete this.defines.USE_LINE_COLOR_ALPHA},Object.defineProperties(this,{color:{enumerable:!0,get:function(){return this.uniforms.diffuse.value},set:function(e){this.uniforms.diffuse.value=e}},worldUnits:{enumerable:!0,get:function(){return`WORLD_UNITS`in this.defines},set:function(e){e===!0?this.defines.WORLD_UNITS=``:delete this.defines.WORLD_UNITS}},linewidth:{enumerable:!0,get:function(){return this.uniforms.linewidth.value},set:function(e){this.uniforms.linewidth.value=e}},dashed:{enumerable:!0,get:function(){return`USE_DASH`in this.defines},set(e){!!e!=`USE_DASH`in this.defines&&(this.needsUpdate=!0),e===!0?this.defines.USE_DASH=``:delete this.defines.USE_DASH}},dashScale:{enumerable:!0,get:function(){return this.uniforms.dashScale.value},set:function(e){this.uniforms.dashScale.value=e}},dashSize:{enumerable:!0,get:function(){return this.uniforms.dashSize.value},set:function(e){this.uniforms.dashSize.value=e}},dashOffset:{enumerable:!0,get:function(){return this.uniforms.dashOffset.value},set:function(e){this.uniforms.dashOffset.value=e}},gapSize:{enumerable:!0,get:function(){return this.uniforms.gapSize.value},set:function(e){this.uniforms.gapSize.value=e}},opacity:{enumerable:!0,get:function(){return this.uniforms.opacity.value},set:function(e){this.uniforms.opacity.value=e}},resolution:{enumerable:!0,get:function(){return this.uniforms.resolution.value},set:function(e){this.uniforms.resolution.value.copy(e)}},alphaToCoverage:{enumerable:!0,get:function(){return`USE_ALPHA_TO_COVERAGE`in this.defines},set:function(e){!!e!=`USE_ALPHA_TO_COVERAGE`in this.defines&&(this.needsUpdate=!0),e===!0?(this.defines.USE_ALPHA_TO_COVERAGE=``,this.extensions.derivatives=!0):(delete this.defines.USE_ALPHA_TO_COVERAGE,this.extensions.derivatives=!1)}}}),this.setValues(e)}}})))()}function Vt(e,t,n){return X.set(0,0,-t,1).applyMatrix4(e.projectionMatrix),X.multiplyScalar(1/X.w),X.x=Qt/n.width,X.y=Qt/n.height,X.applyMatrix4(e.projectionMatrixInverse),X.multiplyScalar(1/X.w),Math.abs(Math.max(X.x,X.y))}function Ht(e,t){let n=e.matrixWorld,r=e.geometry,a=r.attributes.instanceStart,o=r.attributes.instanceEnd,s=Math.min(r.instanceCount,a.count);for(let r=0,c=s;r<c;r++){Y.start.fromBufferAttribute(a,r),Y.end.fromBufferAttribute(o,r),Y.applyMatrix4(n);let s=new i,c=new i;Z.distanceSqToSegment(Y.start,Y.end,c,s),c.distanceTo(s)<Qt*.5&&t.push({point:c,pointOnLine:s,distance:Z.origin.distanceTo(c),object:e,face:null,faceIndex:r,uv:null,[Ye]:null})}}function Ut(e,t,n){let r=t.projectionMatrix,a=e.material.resolution,o=e.matrixWorld,s=e.geometry,c=s.attributes.instanceStart,l=s.attributes.instanceEnd,u=Math.min(s.instanceCount,c.count),d=-t.near;Z.at(1,J),J.w=1,J.applyMatrix4(t.matrixWorldInverse),J.applyMatrix4(r),J.multiplyScalar(1/J.w),J.x*=a.x/2,J.y*=a.y/2,J.z=0,qt.copy(J),Jt.multiplyMatrices(t.matrixWorldInverse,o);for(let t=0,s=u;t<s;t++){if(K.fromBufferAttribute(c,t),q.fromBufferAttribute(l,t),K.w=1,q.w=1,K.applyMatrix4(Jt),q.applyMatrix4(Jt),K.z>d&&q.z>d)continue;if(K.z>d){let e=K.z-q.z,t=(K.z-d)/e;K.lerp(q,t)}else if(q.z>d){let e=q.z-K.z,t=(q.z-d)/e;q.lerp(K,t)}K.applyMatrix4(r),q.applyMatrix4(r),K.multiplyScalar(1/K.w),q.multiplyScalar(1/q.w),K.x*=a.x/2,K.y*=a.y/2,q.x*=a.x/2,q.y*=a.y/2,Y.start.copy(K),Y.start.z=0,Y.end.copy(q),Y.end.z=0;let s=Y.closestPointToPointParameter(qt,!0);Y.at(s,Yt);let u=f.lerp(K.z,q.z,s),p=u>=-1&&u<=1,m=qt.distanceTo(Yt)<Qt*.5;if(p&&m){Y.start.fromBufferAttribute(c,t),Y.end.fromBufferAttribute(l,t),Y.start.applyMatrix4(o),Y.end.applyMatrix4(o);let r=new i,a=new i;Z.distanceSqToSegment(Y.start,Y.end,a,r),n.push({point:a,pointOnLine:r,distance:Z.origin.distanceTo(a),object:e,face:null,faceIndex:t,uv:null,[Ye]:null})}}}var Wt,Gt,Kt,K,q,J,qt,Jt,Y,Yt,Xt,Zt,X,Z,Qt,$t;function en(){return(en=H((()=>{P(),It(),Bt(),Xe(),Wt=new u,Gt=new i,Kt=new i,K=new u,q=new u,J=new u,qt=new i,Jt=new A,Y=new ie,Yt=new i,Xt=new s,Zt=new g,X=new u,$t=class extends te{constructor(e=new Ft,t=new zt({color:Math.random()*16777215})){super(e,t),this.isLineSegments2=!0,this.type=`LineSegments2`}computeLineDistances(){let e=this.geometry,t=e.attributes.instanceStart,n=e.attributes.instanceEnd,r=new Float32Array(2*t.count);for(let e=0,i=0,a=t.count;e<a;e++,i+=2)Gt.fromBufferAttribute(t,e),Kt.fromBufferAttribute(n,e),r[i]=i===0?0:r[i-1],r[i+1]=r[i]+Gt.distanceTo(Kt);let i=new D(r,2,1);return e.setAttribute(`instanceDistanceStart`,new j(i,1,0)),e.setAttribute(`instanceDistanceEnd`,new j(i,1,1)),this}raycast(e,t){let n=this.material.worldUnits,r=e.camera;r===null&&!n&&console.error(`LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.`);let i=e.params.Line2===void 0?0:e.params.Line2.threshold||0;Z=e.ray;let a=this.matrixWorld,o=this.geometry,s=this.material;Qt=s.linewidth+i,o.boundingSphere===null&&o.computeBoundingSphere(),Zt.copy(o.boundingSphere).applyMatrix4(a);let c;if(c=n?Qt*.5:Vt(r,Math.max(r.near,Zt.distanceToPoint(Z.origin)),s.resolution),Zt.radius+=c,Z.intersectsSphere(Zt)===!1)return;o.boundingBox===null&&o.computeBoundingBox(),Xt.copy(o.boundingBox).applyMatrix4(a);let l;l=n?Qt*.5:Vt(r,Math.max(r.near,Xt.distanceToPoint(Z.origin)),s.resolution),Xt.expandByScalar(l),Z.intersectsBox(Xt)!==!1&&(n?Ht(this,t):Ut(this,r,t))}onBeforeRender(e){let t=this.material.uniforms;t&&t.resolution&&(e.getViewport(Wt),this.material.uniforms.resolution.value.set(Wt.z,Wt.w))}}})))()}var tn;function nn(){return(nn=H((()=>{en(),Rt(),Bt(),tn=class extends $t{constructor(e=new Lt,t=new zt({color:Math.random()*16777215})){super(e,t),this.isLine2=!0,this.type=`Line2`}}})))()}var rn,an;function on(){return(on=H((()=>{P(),rn=()=>parseInt(`185`.replace(/\D+/g,``)),an=rn()})))()}var sn,cn,ln;function un(){return(un=H((()=>{sn=Je(e()),P(),Be(),Ge(),on(),cn=We({cellSize:.5,sectionSize:1,fadeDistance:100,fadeStrength:1,fadeFrom:1,cellThickness:.5,sectionThickness:1,cellColor:new oe,sectionColor:new oe,infiniteGrid:!1,followCamera:!1,worldCamProjPosition:new i,worldPlanePosition:new i},`
    varying vec3 localPosition;
    varying vec4 worldPosition;

    uniform vec3 worldCamProjPosition;
    uniform vec3 worldPlanePosition;
    uniform float fadeDistance;
    uniform bool infiniteGrid;
    uniform bool followCamera;

    void main() {
      localPosition = position.xzy;
      if (infiniteGrid) localPosition *= 1.0 + fadeDistance;
      
      worldPosition = modelMatrix * vec4(localPosition, 1.0);
      if (followCamera) {
        worldPosition.xyz += (worldCamProjPosition - worldPlanePosition);
        localPosition = (inverse(modelMatrix) * worldPosition).xyz;
      }

      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,`
    varying vec3 localPosition;
    varying vec4 worldPosition;

    uniform vec3 worldCamProjPosition;
    uniform float cellSize;
    uniform float sectionSize;
    uniform vec3 cellColor;
    uniform vec3 sectionColor;
    uniform float fadeDistance;
    uniform float fadeStrength;
    uniform float fadeFrom;
    uniform float cellThickness;
    uniform float sectionThickness;

    float getGrid(float size, float thickness) {
      vec2 r = localPosition.xz / size;
      vec2 grid = abs(fract(r - 0.5) - 0.5) / fwidth(r);
      float line = min(grid.x, grid.y) + 1.0 - thickness;
      return 1.0 - min(line, 1.0);
    }

    void main() {
      float g1 = getGrid(cellSize, cellThickness);
      float g2 = getGrid(sectionSize, sectionThickness);

      vec3 from = worldCamProjPosition*vec3(fadeFrom);
      float dist = distance(from, worldPosition.xyz);
      float d = 1.0 - min(dist / fadeDistance, 1.0);
      vec3 color = mix(cellColor, sectionColor, min(1.0, sectionThickness * g2));

      gl_FragColor = vec4(color, (g1 + g2) * pow(d, fadeStrength));
      gl_FragColor.a = mix(0.75 * gl_FragColor.a, gl_FragColor.a, g2);
      if (gl_FragColor.a <= 0.0) discard;

      #include <tonemapping_fragment>
      #include <${an>=154?`colorspace_fragment`:`encodings_fragment`}>
    }
  `),ln=sn.forwardRef(({args:e,cellColor:t=`#000000`,sectionColor:n=`#2080ff`,cellSize:r=.5,sectionSize:a=1,followCamera:o=!1,infiniteGrid:s=!1,fadeDistance:c=100,fadeStrength:l=1,fadeFrom:u=1,cellThickness:d=.5,sectionThickness:f=1,side:p=1,...m},h)=>{I({GridMaterial:cn});let g=sn.useRef(null);sn.useImperativeHandle(h,()=>g.current,[]);let _=new O,v=new i(0,1,0),y=new i(0,0,0);ve(e=>{_.setFromNormalAndCoplanarPoint(v,y).applyMatrix4(g.current.matrixWorld);let t=g.current.material,n=t.uniforms.worldCamProjPosition,r=t.uniforms.worldPlanePosition;_.projectPoint(e.camera.position,n.value),r.value.set(0,0,0).applyMatrix4(g.current.matrixWorld)});let b={cellSize:r,sectionSize:a,cellColor:t,sectionColor:n,cellThickness:d,sectionThickness:f},x={fadeDistance:c,fadeStrength:l,fadeFrom:u,infiniteGrid:s,followCamera:o};return sn.createElement(`mesh`,Ve({ref:g,frustumCulled:!1},m),sn.createElement(`gridMaterial`,Ve({transparent:!0,"extensions-derivatives":!0,side:p},b,x)),sn.createElement(`planeGeometry`,{args:e}))})})))()}var dn,fn,pn,mn;function hn(){return(hn=H((()=>{P(),dn=(e,t,n)=>{let r;switch(e){case C:r=new Uint8ClampedArray(t*n*4);break;case m:r=new Uint16Array(t*n*4);break;case le:r=new Uint32Array(t*n*4);break;case w:r=new Int8Array(t*n*4);break;case se:r=new Int16Array(t*n*4);break;case k:r=new Int32Array(t*n*4);break;case ue:r=new Float32Array(t*n*4);break;default:throw Error(`Unsupported data type`)}return r},pn=(e,t,n,r)=>{if(fn!==void 0)return fn;let i=new E(1,1,r);t.setRenderTarget(i);let a=new te(new ee,new b({color:16777215}));t.render(a,n),t.setRenderTarget(null);let o=dn(e,i.width,i.height);return t.readRenderTargetPixels(i,0,0,i.width,i.height,o),i.dispose(),a.geometry.dispose(),a.material.dispose(),fn=o[0]!==0,fn},mn=class e{constructor(t){this._rendererIsDisposable=!1,this._supportsReadPixels=!0,this.render=()=>{this._renderer.setRenderTarget(this._renderTarget);try{this._renderer.render(this._scene,this._camera)}catch(e){throw this._renderer.setRenderTarget(null),e}this._renderer.setRenderTarget(null)},this._width=t.width,this._height=t.height,this._type=t.type,this._colorSpace=t.colorSpace;let n={format:N,depthBuffer:!1,stencilBuffer:!1,type:this._type,colorSpace:this._colorSpace,anisotropy:t.renderTargetOptions?.anisotropy===void 0?1:t.renderTargetOptions?.anisotropy,generateMipmaps:t.renderTargetOptions?.generateMipmaps!==void 0&&t.renderTargetOptions?.generateMipmaps,magFilter:t.renderTargetOptions?.magFilter===void 0?r:t.renderTargetOptions?.magFilter,minFilter:t.renderTargetOptions?.minFilter===void 0?r:t.renderTargetOptions?.minFilter,samples:t.renderTargetOptions?.samples===void 0?void 0:t.renderTargetOptions?.samples,wrapS:t.renderTargetOptions?.wrapS===void 0?y:t.renderTargetOptions?.wrapS,wrapT:t.renderTargetOptions?.wrapT===void 0?y:t.renderTargetOptions?.wrapT};if(this._material=t.material,t.renderer?this._renderer=t.renderer:(this._renderer=e.instantiateRenderer(),this._rendererIsDisposable=!0),this._scene=new S,this._camera=new o,this._camera.position.set(0,0,10),this._camera.left=-.5,this._camera.right=.5,this._camera.top=.5,this._camera.bottom=-.5,this._camera.updateProjectionMatrix(),!pn(this._type,this._renderer,this._camera,n)){let e;switch(this._type){case m:e=this._renderer.extensions.has(`EXT_color_buffer_float`)?ue:void 0}e===void 0?(this._supportsReadPixels=!1,console.warn(`This browser dos not support toArray or toDataTexture, calls to those methods will result in an error thrown`)):(console.warn(`This browser does not support reading pixels from ${this._type} RenderTargets, switching to ${ue}`),this._type=e)}this._quad=new te(new ee,this._material),this._quad.geometry.computeBoundingBox(),this._scene.add(this._quad),this._renderTarget=new E(this.width,this.height,n),this._renderTarget.texture.mapping=t.renderTargetOptions?.mapping===void 0?300:t.renderTargetOptions?.mapping}static instantiateRenderer(){let e=new he;return e.setSize(128,128),e}toArray(){if(!this._supportsReadPixels)throw Error(`Can't read pixels in this browser`);let e=dn(this._type,this._width,this._height);return this._renderer.readRenderTargetPixels(this._renderTarget,0,0,this._width,this._height,e),e}toDataTexture(e){let t=new v(this.toArray(),this.width,this.height,N,this._type,e?.mapping||300,e?.wrapS||1001,e?.wrapT||1001,e?.magFilter||1006,e?.minFilter||1006,e?.anisotropy||1,h);return t.generateMipmaps=e?.generateMipmaps!==void 0&&e?.generateMipmaps,t}disposeOnDemandRenderer(){this._renderer.setRenderTarget(null),this._rendererIsDisposable&&(this._renderer.dispose(),this._renderer.forceContextLoss())}dispose(e){this.disposeOnDemandRenderer(),e&&this.renderTarget.dispose(),this.material instanceof n&&Object.values(this.material.uniforms).forEach(e=>{e.value instanceof M&&e.value.dispose()}),Object.values(this.material).forEach(e=>{e instanceof M&&e.dispose()}),this.material.dispose(),this._quad.geometry.dispose()}get width(){return this._width}set width(e){this._width=e,this._renderTarget.setSize(this._width,this._height)}get height(){return this._height}set height(e){this._height=e,this._renderTarget.setSize(this._width,this._height)}get renderer(){return this._renderer}get renderTarget(){return this._renderTarget}set renderTarget(e){this._renderTarget=e,this._width=e.width,this._height=e.height}get material(){return this._material}get type(){return this._type}get colorSpace(){return this._colorSpace}}})))()}var gn,_n,vn,yn,bn,xn,Sn,Cn,wn,Tn,En,Dn,On;function kn(){return(kn=H((()=>{hn(),P(),gn=`
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,_n=`
// min half float value
#define HALF_FLOAT_MIN vec3( -65504, -65504, -65504 )
// max half float value
#define HALF_FLOAT_MAX vec3( 65504, 65504, 65504 )

uniform sampler2D sdr;
uniform sampler2D gainMap;
uniform vec3 gamma;
uniform vec3 offsetHdr;
uniform vec3 offsetSdr;
uniform vec3 gainMapMin;
uniform vec3 gainMapMax;
uniform float weightFactor;

varying vec2 vUv;

void main() {
  vec3 rgb = texture2D( sdr, vUv ).rgb;
  vec3 recovery = texture2D( gainMap, vUv ).rgb;
  vec3 logRecovery = pow( recovery, gamma );
  vec3 logBoost = gainMapMin * ( 1.0 - logRecovery ) + gainMapMax * logRecovery;
  vec3 hdrColor = (rgb + offsetSdr) * exp2( logBoost * weightFactor ) - offsetHdr;
  vec3 clampedHdrColor = max( HALF_FLOAT_MIN, min( HALF_FLOAT_MAX, hdrColor ));
  gl_FragColor = vec4( clampedHdrColor , 1.0 );
}
`,vn=class extends n{constructor({gamma:e,offsetHdr:t,offsetSdr:n,gainMapMin:r,gainMapMax:a,maxDisplayBoost:o,hdrCapacityMin:s,hdrCapacityMax:c,sdr:l,gainMap:u}){super({name:`GainMapDecoderMaterial`,vertexShader:gn,fragmentShader:_n,uniforms:{sdr:{value:l},gainMap:{value:u},gamma:{value:new i(1/e[0],1/e[1],1/e[2])},offsetHdr:{value:new i().fromArray(t)},offsetSdr:{value:new i().fromArray(n)},gainMapMin:{value:new i().fromArray(r)},gainMapMax:{value:new i().fromArray(a)},weightFactor:{value:(Math.log2(o)-s)/(c-s)}},blending:0,depthTest:!1,depthWrite:!1}),this._maxDisplayBoost=o,this._hdrCapacityMin=s,this._hdrCapacityMax=c,this.needsUpdate=!0,this.uniformsNeedUpdate=!0}get sdr(){return this.uniforms.sdr.value}set sdr(e){this.uniforms.sdr.value=e}get gainMap(){return this.uniforms.gainMap.value}set gainMap(e){this.uniforms.gainMap.value=e}get offsetHdr(){return this.uniforms.offsetHdr.value.toArray()}set offsetHdr(e){this.uniforms.offsetHdr.value.fromArray(e)}get offsetSdr(){return this.uniforms.offsetSdr.value.toArray()}set offsetSdr(e){this.uniforms.offsetSdr.value.fromArray(e)}get gainMapMin(){return this.uniforms.gainMapMin.value.toArray()}set gainMapMin(e){this.uniforms.gainMapMin.value.fromArray(e)}get gainMapMax(){return this.uniforms.gainMapMax.value.toArray()}set gainMapMax(e){this.uniforms.gainMapMax.value.fromArray(e)}get gamma(){let e=this.uniforms.gamma.value;return[1/e.x,1/e.y,1/e.z]}set gamma(e){let t=this.uniforms.gamma.value;t.x=1/e[0],t.y=1/e[1],t.z=1/e[2]}get hdrCapacityMin(){return this._hdrCapacityMin}set hdrCapacityMin(e){this._hdrCapacityMin=e,this.calculateWeight()}get hdrCapacityMax(){return this._hdrCapacityMax}set hdrCapacityMax(e){this._hdrCapacityMax=e,this.calculateWeight()}get maxDisplayBoost(){return this._maxDisplayBoost}set maxDisplayBoost(e){this._maxDisplayBoost=Math.max(1,Math.min(65504,e)),this.calculateWeight()}calculateWeight(){let e=(Math.log2(this._maxDisplayBoost)-this._hdrCapacityMin)/(this._hdrCapacityMax-this._hdrCapacityMin);this.uniforms.weightFactor.value=Math.max(0,Math.min(1,e))}},yn=class extends Error{},bn=class extends Error{},xn=(e,t,n)=>{let r=RegExp(`${t}="([^"]*)"`,`i`).exec(e);if(r)return r[1];let i=RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`,`i`).exec(e);if(i){let e=i[1].match(/<rdf:li>([^<]*)<\/rdf:li>/g);return e&&e.length===3?e.map(e=>e.replace(/<\/?rdf:li>/g,``)):i[1].trim()}if(n!==void 0)return n;throw Error(`Can't find ${t} in gainmap metadata`)},Sn=e=>{let t;t=typeof TextDecoder<`u`?new TextDecoder().decode(e):e.toString();let n=t.indexOf(`<x:xmpmeta`);for(;n!==-1;){let e=t.indexOf(`x:xmpmeta>`,n),r=t.slice(n,e+10);try{let e=xn(r,`hdrgm:GainMapMin`,`0`),t=xn(r,`hdrgm:GainMapMax`),n=xn(r,`hdrgm:Gamma`,`1`),i=xn(r,`hdrgm:OffsetSDR`,`0.015625`),a=xn(r,`hdrgm:OffsetHDR`,`0.015625`),o=/hdrgm:HDRCapacityMin="([^"]*)"/.exec(r),s=o?o[1]:`0`,c=/hdrgm:HDRCapacityMax="([^"]*)"/.exec(r);if(!c)throw Error(`Incomplete gainmap metadata`);let l=c[1];return{gainMapMin:Array.isArray(e)?e.map(e=>parseFloat(e)):[parseFloat(e),parseFloat(e),parseFloat(e)],gainMapMax:Array.isArray(t)?t.map(e=>parseFloat(e)):[parseFloat(t),parseFloat(t),parseFloat(t)],gamma:Array.isArray(n)?n.map(e=>parseFloat(e)):[parseFloat(n),parseFloat(n),parseFloat(n)],offsetSdr:Array.isArray(i)?i.map(e=>parseFloat(e)):[parseFloat(i),parseFloat(i),parseFloat(i)],offsetHdr:Array.isArray(a)?a.map(e=>parseFloat(e)):[parseFloat(a),parseFloat(a),parseFloat(a)],hdrCapacityMin:parseFloat(s),hdrCapacityMax:parseFloat(l)}}catch{}n=t.indexOf(`<x:xmpmeta`,e)}},Cn=class{constructor(e){this.options={debug:e&&e.debug!==void 0?e.debug:!1,extractFII:e&&e.extractFII!==void 0?e.extractFII:!0,extractNonFII:e&&e.extractNonFII!==void 0?e.extractNonFII:!0}}extract(e){return new Promise((t,n)=>{let r=this.options.debug,i=new DataView(e.buffer);if(i.getUint16(0)!==65496){n(Error(`Not a valid jpeg`));return}let a=i.byteLength,o=2,s=0,c;for(;o<a;){if(++s>250){n(Error(`Found no marker after ${s} loops 😵`));return}if(i.getUint8(o)!==255){n(Error(`Not a valid marker at offset 0x${o.toString(16)}, found: 0x${i.getUint8(o).toString(16)}`));return}if(c=i.getUint8(o+1),r&&console.log(`Marker: ${c.toString(16)}`),c===226){r&&console.log(`Found APP2 marker (0xffe2)`);let e=o+4;if(i.getUint32(e)===1297106432){let r=e+4,a;if(i.getUint16(r)===18761)a=!1;else if(i.getUint16(r)===19789)a=!0;else{n(Error(`No valid endianness marker found in TIFF header`));return}if(i.getUint16(r+2,!a)!==42){n(Error(`Not valid TIFF data! (no 0x002A marker)`));return}let o=i.getUint32(r+4,!a);if(o<8){n(Error(`Not valid TIFF data! (First offset less than 8)`));return}let s=r+o,c=i.getUint16(s,!a),l=s+2,u=0;for(let e=l;e<l+12*c;e+=12)i.getUint16(e,!a)===45057&&(u=i.getUint32(e+8,!a));let d=s+2+c*12+4,f=[];for(let e=d;e<d+u*16;e+=16){let t={MPType:i.getUint32(e,!a),size:i.getUint32(e+4,!a),dataOffset:i.getUint32(e+8,!a),dependantImages:i.getUint32(e+12,!a),start:-1,end:-1,isFII:!1};t.dataOffset?(t.start=r+t.dataOffset,t.isFII=!1):(t.start=0,t.isFII=!0),t.end=t.start+t.size,f.push(t)}if(this.options.extractNonFII&&f.length){let e=new Blob([i]),n=[];for(let t of f){if(t.isFII&&!this.options.extractFII)continue;let r=e.slice(t.start,t.end+1,`image/jpeg`);n.push(r)}t(n)}}}o+=2+i.getUint16(o+2)}})}},wn=async e=>{let t=Sn(e);if(!t)throw new bn(`Gain map XMP metadata not found`);let n=await new Cn({extractFII:!0,extractNonFII:!0}).extract(e);if(n.length!==2)throw new yn(`Gain map recovery image not found`);return{sdr:new Uint8Array(await n[0].arrayBuffer()),gainMap:new Uint8Array(await n[1].arrayBuffer()),metadata:t}},Tn=e=>new Promise((t,n)=>{let r=document.createElement(`img`);r.onload=()=>{t(r)},r.onerror=e=>{n(e)},r.src=URL.createObjectURL(e)}),En=class extends l{constructor(e,t){super(t),e&&(this._renderer=e),this._internalLoadingManager=new x}setRenderer(e){return this._renderer=e,this}setRenderTargetOptions(e){return this._renderTargetOptions=e,this}prepareQuadRenderer(){this._renderer||console.warn(`WARNING: An existing WebGL Renderer was not passed to this Loader constructor or in setRenderer, the result of this Loader will need to be converted to a Data Texture with toDataTexture() before you can use it in your renderer.`);let e=new vn({gainMapMax:[1,1,1],gainMapMin:[0,0,0],gamma:[1,1,1],offsetHdr:[1,1,1],offsetSdr:[1,1,1],hdrCapacityMax:1,hdrCapacityMin:0,maxDisplayBoost:1,gainMap:new M,sdr:new M});return new mn({width:16,height:16,type:m,colorSpace:h,material:e,renderer:this._renderer,renderTargetOptions:this._renderTargetOptions})}async render(e,t,n,i){let a=i?new Blob([i],{type:`image/jpeg`}):void 0,o=new Blob([n],{type:`image/jpeg`}),s,c,l=!1;if(typeof createImageBitmap>`u`){let e=await Promise.all([a?Tn(a):Promise.resolve(void 0),Tn(o)]);c=e[0],s=e[1],l=!0}else{let e=await Promise.all([a?createImageBitmap(a,{imageOrientation:`flipY`}):Promise.resolve(void 0),createImageBitmap(o,{imageOrientation:`flipY`})]);c=e[0],s=e[1]}let u=new M(c||new ImageData(2,2),300,y,y,r,ce,N,C,1,h);u.flipY=l,u.needsUpdate=!0;let d=new M(s,300,y,y,r,ce,N,C,1,re);d.flipY=l,d.needsUpdate=!0,e.width=s.width,e.height=s.height,e.material.gainMap=u,e.material.sdr=d,e.material.gainMapMin=t.gainMapMin,e.material.gainMapMax=t.gainMapMax,e.material.offsetHdr=t.offsetHdr,e.material.offsetSdr=t.offsetSdr,e.material.gamma=t.gamma,e.material.hdrCapacityMin=t.hdrCapacityMin,e.material.hdrCapacityMax=t.hdrCapacityMax,e.material.maxDisplayBoost=2**t.hdrCapacityMax,e.material.needsUpdate=!0,e.render()}},Dn=class extends En{load([e,t,n],r,i,a){let o=this.prepareQuadRenderer(),s,c,l,u=async()=>{if(s&&c&&l){try{await this.render(o,l,s,c)}catch(r){this.manager.itemError(e),this.manager.itemError(t),this.manager.itemError(n),typeof a==`function`&&a(r),o.disposeOnDemandRenderer();return}typeof r==`function`&&r(o),this.manager.itemEnd(e),this.manager.itemEnd(t),this.manager.itemEnd(n),o.disposeOnDemandRenderer()}},d=!0,f=0,p=0,m=!0,h=0,g=0,_=!0,v=0,y=0,b=()=>{if(typeof i==`function`){let e=f+h+v,t=p+g+y;i(new ProgressEvent(`progress`,{lengthComputable:d&&m&&_,loaded:t,total:e}))}};this.manager.itemStart(e),this.manager.itemStart(t),this.manager.itemStart(n);let x=new ae(this._internalLoadingManager);x.setResponseType(`arraybuffer`),x.setRequestHeader(this.requestHeader),x.setPath(this.path),x.setWithCredentials(this.withCredentials),x.load(e,async e=>{if(typeof e==`string`)throw Error(`Invalid sdr buffer`);s=e,await u()},e=>{d=e.lengthComputable,p=e.loaded,f=e.total,b()},t=>{this.manager.itemError(e),typeof a==`function`&&a(t)});let S=new ae(this._internalLoadingManager);S.setResponseType(`arraybuffer`),S.setRequestHeader(this.requestHeader),S.setPath(this.path),S.setWithCredentials(this.withCredentials),S.load(t,async e=>{if(typeof e==`string`)throw Error(`Invalid gainmap buffer`);c=e,await u()},e=>{m=e.lengthComputable,g=e.loaded,h=e.total,b()},e=>{this.manager.itemError(t),typeof a==`function`&&a(e)});let C=new ae(this._internalLoadingManager);return C.setRequestHeader(this.requestHeader),C.setPath(this.path),C.setWithCredentials(this.withCredentials),C.load(n,async e=>{if(typeof e!=`string`)throw Error(`Invalid metadata string`);l=JSON.parse(e),await u()},e=>{_=e.lengthComputable,y=e.loaded,v=e.total,b()},e=>{this.manager.itemError(n),typeof a==`function`&&a(e)}),o}},On=class extends En{load(e,t,n,r){let i=this.prepareQuadRenderer(),a=new ae(this._internalLoadingManager);return a.setResponseType(`arraybuffer`),a.setRequestHeader(this.requestHeader),a.setPath(this.path),a.setWithCredentials(this.withCredentials),this.manager.itemStart(e),a.load(e,async n=>{if(typeof n==`string`)throw Error(`Invalid buffer, received [string], was expecting [ArrayBuffer]`);let a=new Uint8Array(n),o,s,c;try{let e=await wn(a);o=e.sdr,s=e.gainMap,c=e.metadata}catch(t){if(t instanceof bn||t instanceof yn)console.warn(`Failure to reconstruct an HDR image from ${e}: Gain map metadata not found in the file, HDRJPGLoader will render the SDR jpeg`),c={gainMapMin:[0,0,0],gainMapMax:[1,1,1],gamma:[1,1,1],hdrCapacityMin:0,hdrCapacityMax:1,offsetHdr:[0,0,0],offsetSdr:[0,0,0]},o=a;else throw t}try{await this.render(i,c,o,s)}catch(t){this.manager.itemError(e),typeof r==`function`&&r(t),i.disposeOnDemandRenderer();return}typeof t==`function`&&t(i),this.manager.itemEnd(e),i.disposeOnDemandRenderer()},n,t=>{this.manager.itemError(e),typeof r==`function`&&r(t)}),i}}})))()}var An;function jn(){return(jn=H((()=>{An={apartment:`lebombo_1k.hdr`,city:`potsdamer_platz_1k.hdr`,dawn:`kiara_1_dawn_1k.hdr`,forest:`forest_slope_1k.hdr`,lobby:`st_fagans_interior_1k.hdr`,night:`dikhololo_night_1k.hdr`,park:`rooitou_park_1k.hdr`,studio:`studio_small_03_1k.hdr`,sunset:`venice_sunset_1k.hdr`,warehouse:`empty_warehouse_01_1k.hdr`}})))()}function Mn({files:e=zn,path:t=``,preset:n=void 0,colorSpace:r=void 0,extensions:i}={}){n&&(Nn(n),e=An[n],t=Ln);let a=Rn(e),{extension:o,isCubemap:s}=Pn(e),c=Fn(o);if(!c)throw Error(`useEnvironment: Unrecognized file extension: `+e);let l=F(e=>e.gl);(0,In.useLayoutEffect)(()=>{if(o!==`webp`&&o!==`jpg`&&o!==`jpeg`)return;function t(){ye.clear(c,a?[e]:e)}l.domElement.addEventListener(`webglcontextlost`,t,{once:!0})},[e,l.domElement]);let u=ye(c,a?[e]:e,e=>{(o===`webp`||o===`jpg`||o===`jpeg`)&&e.setRenderer(l),e.setPath==null||e.setPath(t),i&&i(e)}),d=a?u[0]:u;return(o===`jpg`||o===`jpeg`||o===`webp`)&&(d=d.renderTarget?.texture),d.mapping=s?301:303,d.colorSpace=r??(s?`srgb`:`srgb-linear`),d}function Nn(e){if(!(e in An))throw Error(`Preset must be one of: `+Object.keys(An).join(`, `))}function Pn(e){var t;let n=Rn(e)&&e.length===6,r=Rn(e)&&e.length===3&&e.some(e=>e.endsWith(`json`)),i=Rn(e)?e[0]:e;return{extension:n?`cube`:r?`webp`:i.startsWith(`data:application/exr`)?`exr`:i.startsWith(`data:application/hdr`)?`hdr`:i.startsWith(`data:image/jpeg`)?`jpg`:(t=i.split(`.`).pop())==null||(t=t.split(`?`))==null||(t=t.shift())==null?void 0:t.toLowerCase(),isCubemap:n,isGainmap:r}}function Fn(e){return e===`cube`?ne:e===`hdr`?Ot:e===`exr`?jt:e===`jpg`||e===`jpeg`?On:e===`webp`?Dn:null}var In,Ln,Rn,zn,Bn,Vn;function Hn(){return(Hn=H((()=>{Be(),P(),kt(),Mt(),kn(),jn(),In=e(),Ln=`https://raw.githack.com/pmndrs/drei-assets/456060a26bbeb8fdf79326f224b6d99b8bcce736/hdri/`,Rn=e=>Array.isArray(e),zn=[`/px.png`,`/nx.png`,`/py.png`,`/ny.png`,`/pz.png`,`/nz.png`],Bn={files:zn,path:``,preset:void 0,extensions:void 0},Mn.preload=e=>{let t={...Bn,...e},{files:n,path:r=``}=t,{preset:i,extensions:a}=t;i&&(Nn(i),n=An[i],r=Ln);let{extension:o}=Pn(n);if(o===`webp`||o===`jpg`||o===`jpeg`)throw Error(`useEnvironment: Preloading gainmaps is not supported`);let s=Fn(o);if(!s)throw Error(`useEnvironment: Unrecognized file extension: `+n);ye.preload(s,Rn(n)?[n]:n,e=>{e.setPath==null||e.setPath(r),a&&a(e)})},Vn={files:zn,preset:void 0},Mn.clear=e=>{let t={...Vn,...e},{files:n}=t,{preset:r}=t;r&&(Nn(r),n=An[r]);let{extension:i}=Pn(n),a=Fn(i);if(!a)throw Error(`useEnvironment: Unrecognized file extension: `+n);ye.clear(a,Rn(n)?[n]:n)}})))()}function Un(e,t,n,r,i={}){var a,o;i={backgroundBlurriness:0,backgroundIntensity:1,backgroundRotation:[0,0,0],environmentIntensity:1,environmentRotation:[0,0,0],...i};let s=Xn(t||n),c=s.background,l=s.environment,u={backgroundBlurriness:s.backgroundBlurriness,backgroundIntensity:s.backgroundIntensity,backgroundRotation:((a=s.backgroundRotation)==null||a.clone==null?void 0:a.clone())??[0,0,0],environmentIntensity:s.environmentIntensity,environmentRotation:((o=s.environmentRotation)==null||o.clone==null?void 0:o.clone())??[0,0,0]};return e!==`only`&&(s.environment=r),e&&(s.background=r),be(s,i),()=>{e!==`only`&&(s.environment=l),e&&(s.background=c),be(s,u)}}function Wn({scene:e,background:t=!1,map:n,...r}){let i=F(e=>e.scene);return Q.useLayoutEffect(()=>{if(n)return Un(t,e,i,n,r)}),null}function Gn({background:e=!1,scene:t,blur:n,backgroundBlurriness:r,backgroundIntensity:i,backgroundRotation:a,environmentIntensity:o,environmentRotation:s,...c}){let l=Mn(c),u=F(e=>e.scene);return Q.useLayoutEffect(()=>Un(e,t,u,l,{backgroundBlurriness:n??r,backgroundIntensity:i,backgroundRotation:a,environmentIntensity:o,environmentRotation:s})),Q.useEffect(()=>()=>{l.dispose()},[l]),null}function Kn({children:e,near:t=.1,far:n=1e3,resolution:r=256,frames:i=1,map:a,background:o=!1,blur:s,backgroundBlurriness:c,backgroundIntensity:l,backgroundRotation:u,environmentIntensity:d,environmentRotation:f,scene:p,files:h,path:g,preset:_=void 0,extensions:v}){let y=F(e=>e.gl),b=F(e=>e.scene),x=Q.useRef(null),[C]=Q.useState(()=>new S),w=Q.useMemo(()=>{let e=new ge(r);return e.texture.type=m,e},[r]);Q.useEffect(()=>()=>{w.dispose()},[w]),Q.useLayoutEffect(()=>{if(i===1){let e=y.autoClear;y.autoClear=!0,x.current.update(y,C),y.autoClear=e}return Un(o,p,b,w.texture,{backgroundBlurriness:s??c,backgroundIntensity:l,backgroundRotation:u,environmentIntensity:d,environmentRotation:f})},[e,C,w.texture,p,b,o,i,y]);let T=1;return ve(()=>{if(i===1/0||T<i){let e=y.autoClear;y.autoClear=!0,x.current.update(y,C),y.autoClear=e,T++}}),Q.createElement(Q.Fragment,null,_e(Q.createElement(Q.Fragment,null,e,Q.createElement(`cubeCamera`,{ref:x,args:[t,n,w]}),h||_?Q.createElement(Gn,{background:!0,files:h,preset:_,path:g,extensions:v}):a?Q.createElement(Wn,{background:!0,map:a,extensions:v}):null),C))}function qn(e){let t=Mn(e),n=e.map||t;Q.useMemo(()=>I({GroundProjectedEnvImpl:Et}),[]),Q.useEffect(()=>()=>{t.dispose()},[t]);let r=Q.useMemo(()=>[n],[n]),i=e.ground?.height,a=e.ground?.radius,o=e.ground?.scale??1e3;return Q.createElement(Q.Fragment,null,Q.createElement(Wn,Ve({},e,{map:n})),Q.createElement(`groundProjectedEnvImpl`,{args:r,scale:o,height:i,radius:a}))}function Jn(e){return e.ground?Q.createElement(qn,e):e.map?Q.createElement(Wn,e):e.children?Q.createElement(Kn,e):Q.createElement(Gn,e)}var Q,Yn,Xn;function Zn(){return(Zn=H((()=>{Q=Je(e()),Be(),P(),Dt(),Hn(),Yn=e=>e.current&&e.current.isScene,Xn=e=>Yn(e)?e.current:e})))()}function Qn(e={}){let{updateInterval:t=0,entityId:n,reactive:r=!0}=e,i=(0,er.useRef)(null);i.current||=tr();let[,a]=(0,er.useState)(0),o=(0,er.useRef)(0),s=(0,er.useRef)(0),c=(0,er.useRef)({x:0,y:0,z:0}),l=(0,er.useRef)(void 0),u=(0,er.useRef)(null),{activeState:d,gameStates:f}=Me(),p=e=>{if(n)return n;if(l.current)return l.current;let t=e.getActiveEntities();return l.current=t[0],l.current};return(0,er.useEffect)(()=>{l.current=void 0,u.current=Ce.getOrCreate(`motion`);let e=u.current;if(!e)return;let n=e.subscribe((n,c)=>{let l=p(e);if(!l||c!==l)return;let u=performance.now();if(s.current=u,t>0&&u-o.current<t)return;o.current=u;let d=i.current;d.position.copy(n.position),d.velocity.copy(n.velocity),d.rotation.copy(n.rotation),d.isMoving=n.isMoving,d.isGrounded=n.isGrounded,d.speed=n.speed,d.height=2,r&&a(e=>e+1)});return()=>{n()}},[n,t,r]),ve(()=>{let e=performance.now();if(t>0&&e-o.current<t)return;let n=i.current,l=u.current,m=e=>{let t=c.current,n=e.x-t.x,r=e.y-t.y,i=e.z-t.z;return n*n+r*r+i*i>1e-6&&(t.x=e.x,t.y=e.y,t.z=e.z,!0)};if(l){let t=p(l);if(!(e-s.current<16)&&t){let i=l.snapshot(t);if(i){n.position.copy(i.position),n.velocity.copy(i.velocity),n.rotation.copy(i.rotation),n.isMoving=i.isMoving,n.isGrounded=i.isGrounded,n.speed=i.speed,n.height=2,o.current=e,r&&m(n.position)&&a(e=>e+1);return}}}d?.position&&(n.position.copy(d.position),d.velocity?n.velocity.copy(d.velocity):n.velocity.set(0,0,0),d.euler?n.rotation.copy(d.euler):n.rotation.set(0,0,0),n.isMoving=f?.isMoving||!1,n.isGrounded=f?.isOnTheGround||!1,n.speed=d.velocity?d.velocity.length():0,n.height=2,o.current=e,r&&m(n.position)&&a(e=>e+1))}),i.current}function $n(e={}){let{position:t}=Qn(e);return t}var er,tr;function nr(){return(nr=H((()=>{er=e(),Be(),P(),z(),Fe(),tr=()=>({position:new i(0,0,0),velocity:new i(0,0,0),rotation:new pe(0,0,0),isMoving:!1,isGrounded:!1,speed:0,height:2})})))()}function rr(e){let t=new Map,n=ir.get(e)??new Map;ir.set(e,n);let r=(r,i,a)=>{if(a){if(t.has(r))return;let a=n.has(i);t.set(r,i),n.set(i,(n.get(i)??0)+1),a||e.updateKeyboard({[i]:!0})}else{let i=t.get(r);if(i===void 0)return;let a=n.get(i)??0;t.delete(r),a<=1?(n.delete(i),e.updateKeyboard({[i]:!1})):n.set(i,a-1)}};return{set:r,isHeld:e=>n.has(e),release:()=>{for(let[e,n]of t)r(e,n,!1)}}}var ir;function ar(){return(ar=H((()=>{ir=new WeakMap})))()}var $,or,sr;function cr(){return(cr=H((()=>{$=e(),L(),ar(),Le(),we(),ze(),or={KeyW:`forward`,KeyA:`leftward`,KeyS:`backward`,KeyD:`rightward`,ShiftLeft:`shift`,Space:`space`,KeyZ:`keyZ`,KeyR:`keyR`,KeyF:`keyF`,KeyE:`keyE`,Escape:`escape`},sr=(e=!0,t=!0,n,r=!0,i=!0)=>{let a=R(e=>e.automation?.queue.isRunning),o=R(e=>e.stopAutomation),s=R(e=>e.interaction?.isActive??!0),c=Ne(e=>e.isInEditMode()),l=Te(),u=(0,$.useMemo)(()=>rr(l),[l]),d=(0,$.useRef)(new Set),f=(0,$.useMemo)(()=>({...or}),[]),p=(0,$.useCallback)((e,t)=>{if(!r||!s)return!1;try{return u.set(e,e,t),t?d.current.add(e):d.current.delete(e),!0}catch(e){return V.error(`Error updating keyboard state`,e instanceof Error?e:String(e)),!1}},[r,u,s]),m=(0,$.useCallback)(()=>{d.current.clear(),u.release();let e={};for(let t of Object.values(or))u.isHeld(t)||Object.assign(e,{[t]:!1});l.updateKeyboard(e)},[l,u]);return(0,$.useEffect)(()=>{let e=d.current;return()=>{u.release(),e.clear()}},[u]),(0,$.useEffect)(()=>{(!s||c)&&m()},[m,s,c]),(0,$.useEffect)(()=>{if(!i)for(let e of Object.keys(or))d.current.delete(e)&&u.set(e,or[e],!1)},[i,u]),(0,$.useEffect)(()=>{if(!r){d.current.size>0&&m();return}let e=(e,n)=>{let r=e.target;if(r instanceof HTMLElement&&(r.matches(`input, textarea, select`)||r.isContentEditable)){d.current.size>0&&m();return}let i=f[e.code];if(!i)return;if(!s||c){n&&e.preventDefault(),m();return}let p=d.current.has(e.code);n&&!p?(d.current.add(e.code),e.code===`Space`&&e.preventDefault(),t&&a&&(i===`forward`||i===`backward`||i===`leftward`||i===`rightward`)&&(o(),l.updateMouse({isActive:!1,shouldRun:!1})),u.set(e.code,i,!0)):!n&&p&&(d.current.delete(e.code),u.set(e.code,i,!1))},n=t=>e(t,!0),p=t=>e(t,!1),h=()=>document.hidden&&m();return i&&(window.addEventListener(`keydown`,n),window.addEventListener(`keyup`,p)),window.addEventListener(`blur`,m),document.addEventListener(`visibilitychange`,h),()=>{window.removeEventListener(`keydown`,n),window.removeEventListener(`keyup`,p),window.removeEventListener(`blur`,m),document.removeEventListener(`visibilitychange`,h)}},[r,i,u,f,t,o,a,m,s,c,l]),{pressedKeys:Array.from(d.current),pushKey:p,isKeyPressed:e=>d.current.has(e),clearAllKeys:m}}})))()}function lr({value:e,name:t,gamePadButtonStyle:n,onInput:r}){let[i,a]=(0,ur.useState)(!1),o=(0,ur.useRef)(!1),s=(0,ur.useRef)(r);s.current=r;let c=()=>{!o.current&&r(e,!0)&&(o.current=!0,a(!0))},l=()=>{o.current&&(r(e,!1),o.current=!1,a(!1))};return(0,ur.useEffect)(()=>()=>{o.current&&s.current(e,!1),o.current=!1},[e]),(0,ur.useEffect)(()=>{if(!i)return;let t=()=>{o.current&&s.current(e,!1),o.current=!1,a(!1)},n=()=>{document.hidden&&t()};return window.addEventListener(`blur`,t),document.addEventListener(`visibilitychange`,n),()=>{window.removeEventListener(`blur`,t),document.removeEventListener(`visibilitychange`,n)}},[i,e]),(0,dr.jsx)(`button`,{type:`button`,className:`pad-button ${i?`is-clicked`:``}`,"aria-pressed":i,onBlur:l,onContextMenu:e=>{e.preventDefault(),l()},onPointerDown:c,onPointerUp:l,onPointerLeave:l,onPointerCancel:l,onKeyDown:e=>{(e.key===` `||e.key===`Enter`)&&(e.preventDefault(),e.stopPropagation(),c())},onKeyUp:e=>{(e.key===` `||e.key===`Enter`)&&(e.preventDefault(),e.stopPropagation(),l())},style:n,children:t})}var ur,dr;function fr(){return(fr=H((()=>{ur=e(),dr=t()})))()}function pr(e){let{gamePadStyle:t,gamePadButtonStyle:n,label:r}=e,i=R(e=>e.interaction?.keyboard),a=R(e=>e.mode),{pushKey:o}=sr(!0,!0,void 0,a?.controller===`gamepad`,!1);return a?.controller===`gamepad`?(0,mr.jsx)(`div`,{className:`gamepad-container`,style:{...t,display:`flex`},children:Object.keys(i??{}).map(e=>(0,mr.jsx)(lr,{value:e,name:r?.[e]??gr[e]??e,onInput:o,gamePadButtonStyle:n},e))}):null}var mr,hr,gr;function _r(){return(_r=H((()=>{cr(),L(),fr(),mr=t(),hr={on:!0},gr={forward:`앞으로`,backward:`뒤로`,leftward:`왼쪽`,rightward:`오른쪽`,shift:`달리기`,space:`점프`,escape:`취소`,keyZ:`동작 Z`,keyR:`동작 R`,keyF:`동작 F`,keyE:`동작 E`}})))()}function vr({pointsRef:e,color:t}){let n=F(e=>e.size),r=(0,yr.useRef)(0),i=(0,yr.useRef)(Array(384).fill(0)),a=(0,yr.useMemo)(()=>{let e=new Lt;e.setPositions(Array(384).fill(0));let n=new zt({color:new oe(t).getHex(),linewidth:2,transparent:!0,opacity:.9}),r=new tn(e,n);return r.visible=!1,r.frustumCulled=!1,r},[]);return(0,yr.useEffect)(()=>{a.material.resolution.set(n.width,n.height)},[a,n.width,n.height]),(0,yr.useEffect)(()=>{a.material.color.set(t)},[a,t]),(0,yr.useEffect)(()=>()=>{a.geometry.dispose(),a.material.dispose()},[a]),ve(()=>{let t=performance.now();if(t-r.current<Sr)return;r.current=t;let n=e.current;if(!n||n.length<2){a.visible=!1;return}let o=Math.min(n.length,xr),s=i.current;for(let e=0;e<o;e+=1){let t=n[e];t&&(s[e*3]=t.x,s[e*3+1]=t.y,s[e*3+2]=t.z)}a.geometry.setPositions(s.slice(0,o*3)),a.computeLineDistances(),a.visible=!0}),(0,br.jsx)(`primitive`,{object:a})}var yr,br,xr,Sr;function Cr(){return(Cr=H((()=>{yr=e(),Be(),P(),nn(),Rt(),Bt(),br=t(),xr=128,Sr=100,vr.displayName=`PathLine`})))()}var wr,Tr,Er;function Dr(){return(Dr=H((()=>{wr=e(),P(),Tr=t(),Er=(0,wr.memo)(()=>(0,Tr.jsxs)(`group`,{children:[(0,Tr.jsxs)(`mesh`,{children:[(0,Tr.jsx)(`sphereGeometry`,{args:[.2,16,16]}),(0,Tr.jsx)(`meshStandardMaterial`,{color:`#00ff88`,emissive:`#00ff88`,emissiveIntensity:.5,transparent:!0,opacity:.9})]}),(0,Tr.jsxs)(`mesh`,{rotation:[Math.PI/2,0,0],children:[(0,Tr.jsx)(`ringGeometry`,{args:[.3,.5,8]}),(0,Tr.jsx)(`meshStandardMaterial`,{color:`#00ff88`,transparent:!0,opacity:.6,side:2})]})]})),Er.displayName=`TargetMarker`})))()}function Or(){let e=R(e=>e.automation),{position:t}=Qn({updateInterval:Mr}),{mouse:n}=Ae(),[r,a]=(0,kr.useState)(()=>[...Ee()]),o=(0,kr.useRef)([]);(0,kr.useEffect)(()=>ke(()=>{a([...Ee()])}),[]);let s=n?.target||jr,c=n?.isActive||!1,l=e?.queue||{actions:[],currentIndex:0},u=l.actions||[],d=l.currentIndex||0,f=t.distanceTo(s)<Nr,p=c&&!f,m=(0,kr.useMemo)(()=>u.map(e=>e.type===`move`&&e.target?new i(e.target.x,e.target.y,e.target.z):null).filter(e=>e!==null),[u]),h=r.length>0?r:[s];return o.current=p?[t,...h,...m]:m.length>0?[t,...m]:[],(0,Ar.jsxs)(`group`,{children:[p&&(0,Ar.jsx)(`group`,{position:s,children:(0,Ar.jsx)(Er,{})}),(0,Ar.jsx)(vr,{pointsRef:o,color:d>=0?`#00ff88`:`#ffaa00`}),u.map((e,t)=>{if(e.type===`move`&&e.target){let n=t===d,r=t<d;return(0,Ar.jsx)(`group`,{position:[e.target.x,e.target.y,e.target.z],children:(0,Ar.jsxs)(`mesh`,{children:[(0,Ar.jsx)(`sphereGeometry`,{args:[.1,8,8]}),(0,Ar.jsx)(`meshStandardMaterial`,{color:r?`#888`:n?`#ff4444`:`#ffaa00`,transparent:!0,opacity:r?.3:.8})]})},`action-${t}`)}return null})]})}var kr,Ar,jr,Mr,Nr;function Pr(){return(Pr=H((()=>{kr=e(),P(),Cr(),Dr(),Oe(),nr(),De(),L(),Ar=t(),jr=new i,Mr=150,Nr=1})))()}function Fr({clickerOptions:e}){let{onClick:t}=Ie(e);return(0,Ir.jsxs)(`mesh`,{position:[0,0,0],rotation:[-Math.PI/2,0,0],onPointerDown:e=>{if(e.nativeEvent.altKey||e.nativeEvent.ctrlKey||e.nativeEvent.metaKey||e.nativeEvent.shiftKey)return;e.stopPropagation();let{cameraOption:n,setCameraOption:r}=R.getState();if(n?.focus){r({focus:!1});return}t(e)},visible:!0,userData:{intangible:!0},children:[(0,Ir.jsx)(`planeGeometry`,{args:[1e3,1e3]}),(0,Ir.jsx)(`meshBasicMaterial`,{transparent:!0,opacity:0,depthWrite:!1,colorWrite:!1})]})}var Ir;function Lr(){return(Lr=H((()=>{Re(),L(),Ir=t()})))()}function Rr({props:e,children:t}){let n=R(e=>e.mode),{gameStates:r}=Me(),i=R(e=>e.rideable),a=R(e=>e.urls),o=Ne(e=>e.isInEditMode()),s=Ke();sr(!0,!0,void 0,e.enableKeyboard??!0);let c=r?.currentRideable?.id,l=(0,zr.useMemo)(()=>(c?i?.[c]?.offset:void 0)??B(),[c,i]);if(o||!n||!r||!i||!a||n.type===`character`&&!a.characterUrl||n.type===`vehicle`&&!a.vehicleUrl||n.type===`airplane`&&!a.airplaneUrl)return null;let{canRide:u,isRiding:d}=r,f=(()=>{let t=e.rigidBodyRef??s.rigidBodyRef,r=e.outerGroupRef??s.outerGroupRef,i=e.innerGroupRef??s.innerGroupRef,o=e.colliderRef??s.colliderRef,c={isActive:!0,componentType:n.type,enableRiding:u,isRiderOn:d,offset:l,ref:t,outerGroupRef:r,innerGroupRef:i,colliderRef:o,parts:(e.parts||[]).filter(e=>!!e.url).map(e=>({...e,url:e.url})),...e.onAnimate?{onAnimate:e.onAnimate}:{},...e.onFrame?{onFrame:e.onFrame}:{},...e.onReady?{onReady:e.onReady}:{},...e.onDestroy?{onDestroy:e.onDestroy}:{},...e.onDestory?{onDestory:e.onDestory}:{},...typeof e.baseColor==`string`&&e.baseColor.trim().length>0?{baseColor:e.baseColor}:{},...Array.isArray(e.excludeBaseNodes)&&e.excludeBaseNodes.length>0?{excludeBaseNodes:e.excludeBaseNodes}:{},...e.rigidBodyProps?{rigidBodyProps:e.rigidBodyProps}:{},...e.controllerOptions?{controllerOptions:e.controllerOptions}:{},...e.groundRay?{groundRay:e.groundRay}:{},...e.colliderSize?{colliderSize:e.colliderSize}:{},...e.position?{position:e.position}:{},...e.rotation?{rotation:e.rotation}:{},...e.scale?{scale:e.scale}:{},...e.modelHierarchy===void 0?{}:{modelHierarchy:e.modelHierarchy},...e.modelYawOffset===void 0?{}:{modelYawOffset:e.modelYawOffset}},f=d&&n.type!==`character`?a.ridingUrl:void 0,p=typeof f==`string`&&f.length>0?{ridingUrl:f}:{};switch(n.type){case`character`:return{...c,url:a.characterUrl||``};case`vehicle`:return{...c,...p,url:a.vehicleUrl||``,wheelUrl:a.wheelUrl};case`airplane`:return{...c,...p,url:a.airplaneUrl||``};default:return{...c,url:a.characterUrl||``}}})();return n.type===`character`&&r.isRiding?null:(0,Br.jsx)(Pe,{...f,children:t})}var zr,Br;function Vr(){return(Vr=H((()=>{zr=e(),Se(),qe(),cr(),Le(),L(),je(),Fe(),Br=t()})))()}function Hr(e){let{clickToMove:t,children:n,clickerOptions:r,...i}=e,a={...r??{},...r?.agentRadius===void 0&&i.colliderSize?.radius!==void 0?{agentRadius:i.colliderSize.radius}:{}};return(0,Ur.jsx)(Rr,{props:i,children:(0,Ur.jsxs)(Ur.Fragment,{children:[t&&(0,Ur.jsxs)(Ur.Fragment,{children:[(0,Ur.jsx)(Fr,{clickerOptions:a}),(0,Ur.jsx)(Or,{})]}),n]})})}var Ur;function Wr(){return(Wr=H((()=>{Vr(),Pr(),Lr(),Ur=t()})))()}export{It as A,$t as C,Lt as D,Bt as E,Rt as O,nn as S,zt as T,Jn as _,Fr as a,un as b,Pr as c,_r as d,cr as f,$n as g,Qn as h,Vr as i,Ft as k,pr as l,nr as m,Wr as n,Lr as o,sr as p,Rr as r,Or as s,Hr as t,hr as u,Zn as v,en as w,tn as x,ln as y};
//# sourceMappingURL=ControllerWrapper-N567lgIs.js.map