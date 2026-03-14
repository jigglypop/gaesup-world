import { useState, useRef, useEffect, useCallback } from "react";

// ══════════════════════════════════════════════════════════
// 양재천 앵화야행 — 상세 동선 타임라인 v4
// 지도: 양재천 실측 기반 확대 · 코스 세분화 · 구간별 거리/시간
// ══════════════════════════════════════════════════════════

// ── 양재천 하천 중심선 (실제 곡률 반영, viewBox 0~200 x 0~120) ──
const riverCenter = [
  {x:2,y:56},{x:12,y:55},{x:22,y:54},{x:30,y:53},{x:38,y:52.5},
  {x:46,y:52},{x:54,y:52},{x:62,y:52.5},{x:68,y:53},{x:74,y:54},
  {x:82,y:55},{x:90,y:55.5},{x:98,y:56},{x:106,y:56},{x:114,y:55.5},
  {x:122,y:55},{x:130,y:54.5},{x:138,y:55},{x:146,y:56},{x:154,y:57},
  {x:162,y:57.5},{x:170,y:57},{x:178,y:56},{x:186,y:55},{x:194,y:54},
  {x:200,y:53.5},
];
const riverTop = riverCenter.map(p => ({x:p.x, y:p.y - 3.5}));
const riverBot = riverCenter.map(p => ({x:p.x, y:p.y + 3.5}));

// ── 산책로 (하천 양쪽) ──
const pathNorth = riverCenter.map(p => ({x:p.x, y:p.y - 6}));
const pathSouth = riverCenter.map(p => ({x:p.x, y:p.y + 6}));

// ── 다리(교량) ──
const bridges = [
  {id:"y3", name:"영동3교", x:22, note:""},
  {id:"yw", name:"양원교", x:52, note:""},
  {id:"y2", name:"영동2교", x:78, note:"A코스 중간"},
  {id:"sb", name:"수변교", x:106, note:"수변무대 옆"},
  {id:"y1", name:"영동1교", x:138, note:"B코스 경유"},
  {id:"yj", name:"양재교", x:170, note:"출발점 인근"},
];

// ── 주요 지점 (역·시설·공원) ──
const pois = [
  {id:"maebong", name:"매봉역", x:14, y:35, icon:"🚇", type:"station"},
  {id:"stage", name:"수변무대", x:98, y:42, icon:"🎤", type:"venue"},
  {id:"park_a", name:"양재천공원", x:60, y:68, icon:"🌳", type:"park"},
  {id:"park_b", name:"도곡근린공원", x:30, y:68, icon:"🌲", type:"park"},
  {id:"yangjae", name:"양재역 3번출구", x:178, y:35, icon:"🚇", type:"station"},
  {id:"dogok", name:"도곡역", x:8, y:35, icon:"🚇", type:"station"},
  {id:"toilet1", name:"화장실", x:50, y:42, icon:"🚻", type:"facility"},
  {id:"toilet2", name:"화장실", x:130, y:68, icon:"🚻", type:"facility"},
  {id:"conv", name:"편의점(양재역)", x:185, y:42, icon:"🏪", type:"facility"},
];

// ── 벚꽃 핫스팟 ──
const cherryZones = [
  {x1:66, x2:120, label:"벚꽃 핵심구간 (약 700m)", density:"★★★"},
  {x1:120, x2:155, label:"벚꽃 양호구간 (약 450m)", density:"★★"},
];

// ═══════════════════════════════════════
// 코스 세분화 — 구간별 waypoint + 거리 + 소요시간
// ═══════════════════════════════════════

const courseASegments = [
  {
    id:"a1", label:"양재역→양재교 남측", dist:"200m", time:"3분",
    desc:"양재역 3번출구에서 양재천 진입로까지. 계단 하강 후 남측 산책로 진입",
    pts:[{x:178,y:42},{x:174,y:48},{x:172,y:58},{x:170,y:63}],
    color:"#FF6B9D"
  },
  {
    id:"a2", label:"양재교→영동1교(남측)", dist:"400m", time:"6분",
    desc:"남측 산책로 따라 하류 방향(서쪽). 벚꽃 양호구간 진입",
    pts:[{x:170,y:63},{x:160,y:63.5},{x:150,y:63},{x:140,y:62},{x:138,y:62}],
    color:"#FF6B9D"
  },
  {
    id:"a3", label:"영동1교→수변교(남측)", dist:"400m", time:"6분",
    desc:"벚꽃 핵심구간. 수변무대 건너편. 포토존 다수",
    pts:[{x:138,y:62},{x:128,y:61},{x:118,y:61},{x:110,y:60},{x:106,y:60}],
    color:"#FF6B9D"
  },
  {
    id:"a4", label:"수변교 도하(남→북)", dist:"50m", time:"1분",
    desc:"수변교에서 북측으로 건너감. 코스 전환 포인트",
    pts:[{x:106,y:60},{x:106,y:49}],
    color:"#FF6B9D"
  },
  {
    id:"a5", label:"수변교→영동2교(북측)", dist:"350m", time:"5분",
    desc:"북측 산책로. 벚꽃 터널 구간. 조명 설치 예정",
    pts:[{x:106,y:49},{x:98,y:48},{x:90,y:48.5},{x:82,y:49},{x:78,y:49}],
    color:"#FF6B9D"
  },
  {
    id:"a6", label:"영동2교→양원교(북측)", dist:"350m", time:"5분",
    desc:"벚꽃 터널 후반부. 양재천공원 옆. 여유 구간",
    pts:[{x:78,y:49},{x:70,y:48},{x:62,y:47},{x:56,y:46.5},{x:52,y:46}],
    color:"#FF6B9D"
  },
  {
    id:"a7", label:"양원교 도하 → 영동2교(남측)", dist:"400m", time:"6분",
    desc:"양원교에서 남측으로 건너 되돌아오기. U턴 구간",
    pts:[{x:52,y:46},{x:52,y:59},{x:60,y:59},{x:68,y:59.5},{x:78,y:59}],
    color:"#FF6B9D"
  },
  {
    id:"a8", label:"영동2교→수변무대(남측)", dist:"300m", time:"5분",
    desc:"벚꽃 아래 마지막 구간. 수변무대 도착",
    pts:[{x:78,y:59},{x:86,y:59.5},{x:92,y:59},{x:96,y:58},{x:98,y:58}],
    color:"#FF6B9D"
  },
];

const courseBSegments = [
  {
    id:"b1", label:"양재역→양재교 북측", dist:"200m", time:"3분",
    desc:"양재역 3번출구에서 양재천 진입. 북측 산책로 이용",
    pts:[{x:178,y:42},{x:174,y:44},{x:172,y:48},{x:170,y:49}],
    color:"#4ECDC4"
  },
  {
    id:"b2", label:"양재교→영동1교(북측)", dist:"400m", time:"6분",
    desc:"북측 산책로 따라 하류(서쪽). 조용한 구간",
    pts:[{x:170,y:49},{x:160,y:49.5},{x:150,y:49},{x:142,y:48.5},{x:138,y:48}],
    color:"#4ECDC4"
  },
  {
    id:"b3", label:"영동1교→수변교(북측)", dist:"400m", time:"6분",
    desc:"벚꽃 핵심구간 북측. 하천에 비친 벚꽃 감상",
    pts:[{x:138,y:48},{x:128,y:48.5},{x:118,y:49},{x:110,y:49},{x:106,y:49}],
    color:"#4ECDC4"
  },
  {
    id:"b4", label:"수변교→수변무대(도보)", dist:"100m", time:"2분",
    desc:"수변교 바로 옆 수변무대 도착",
    pts:[{x:106,y:49},{x:102,y:48},{x:100,y:46},{x:98,y:44}],
    color:"#4ECDC4"
  },
];

// ── 타임라인 ──
const getTimeline = (ppl) => {
  const cpCount = ppl <= 60 ? 4 : ppl <= 80 ? 5 : 6;
  const aRatio = ppl <= 60 ? 0.42 : ppl <= 80 ? 0.44 : 0.4;
  const aPpl = Math.round(ppl * aRatio);
  const bPpl = ppl - aPpl;
  const staff = ppl <= 60 ? 9 : ppl <= 80 ? 11 : 15;
  const aGrp = Math.ceil(aPpl / 6);
  const bGrp = Math.ceil(bPpl / 6);

  return [
    { time:"16:20", label:"운영진 집결", phase:"prep",
      desc:`양재역 3번출구 집결 → 체크인 부스·음향장비 세팅 (스태프 ${staff}명)`,
      aSeg:-1, bSeg:-1, mapFocus:{x:178,y:38,r:18},
      markers:[{x:178,y:35,color:"#ff6b6b",label:"집결",pulse:true}]},
    { time:"16:40", label:"체크인 시작", phase:"checkin",
      desc:`양재역 인근 광장. 명찰(조번호 사전배정)+NFC키링 수령. A/B 코스 선택 확정`,
      aSeg:-1, bSeg:-1, mapFocus:{x:178,y:42,r:16},
      markers:[{x:178,y:40,color:"#ffd93d",label:"체크인",pulse:true}]},
    { time:"17:10", label:"A코스 출발", phase:"a_start",
      desc:`"더 걷기" ${aPpl}명(${aGrp}개조) 출발. 총 2.45km/37분. 양재역→(남측)→수변교→(북측)→양원교→U턴→수변무대`,
      aSeg:0, bSeg:-1, mapFocus:{x:140,y:55,r:50},
      markers:[{x:178,y:42,color:"#FF6B9D",label:`A출발 ${aPpl}명`,pulse:true}]},
    { time:"17:20", label:"A코스 영동1교 통과", phase:"a_mid1",
      desc:`A코스 영동1교 남측 통과. 벚꽃 양호구간. 1번째 게임CP 조우 가능`,
      aSeg:2, bSeg:-1, mapFocus:{x:120,y:55,r:40},
      markers:[{x:138,y:62,color:"#FF6B9D",label:"A진행중"}]},
    { time:"17:30", label:"B코스 출발 · CP 산개", phase:"b_start",
      desc:`"가볍게" ${bPpl}명(${bGrp}개조) 출발. 총 1.1km/17분. 양재역→(북측)→수변무대. 게임CP ${cpCount}명 산개`,
      aSeg:4, bSeg:0, mapFocus:{x:130,y:52,r:55},
      markers:[
        {x:178,y:42,color:"#4ECDC4",label:`B출발 ${bPpl}명`,pulse:true},
        {x:98,y:49,color:"#FF6B9D",label:"A진행중"},
      ]},
    { time:"17:40", label:"A코스 양원교 U턴", phase:"a_uturn",
      desc:`A코스 양원교에서 남측→다시 동쪽으로. 벚꽃 터널 2회 통과 포인트`,
      aSeg:6, bSeg:2, mapFocus:{x:78,y:54,r:40},
      markers:[
        {x:52,y:53,color:"#FF6B9D",label:"A U턴"},
        {x:138,y:48,color:"#4ECDC4",label:"B진행중"},
      ]},
    { time:"17:47", label:"B코스 수변무대 도착", phase:"b_arrive",
      desc:`B코스 도착. 도착 인증샷 촬영하며 A코스 대기. 벚꽃등 점등`,
      aSeg:7, bSeg:3, mapFocus:{x:98,y:52,r:30},
      markers:[
        {x:98,y:44,color:"#4ECDC4",label:"B도착",pulse:true},
        {x:86,y:59,color:"#FF6B9D",label:"A마지막구간"},
      ]},
    { time:"17:55", label:"A코스 합류 · 전원 집결", phase:"merge",
      desc:`A코스 수변무대 도착. 전원 집결. 단체 기념사진 촬영`,
      aSeg:7, bSeg:3, mapFocus:{x:98,y:50,r:25},
      markers:[
        {x:98,y:50,color:"#FFB6C1",label:"전원 합류",pulse:true},
      ]},
    { time:"18:00", label:"1부 종료 · 미성년 귀가", phase:"dismiss",
      desc:`공식 1부 종료 선언. 미성년자 귀가 안내(조장 체크리스트). 성인 잔류`,
      aSeg:-1, bSeg:-1, mapFocus:{x:98,y:50,r:25},
      markers:[{x:98,y:42,color:"#ffd93d",label:"1부 종료"}]},
    { time:"18:05", label:"🎤 2부 오프닝", phase:"part2",
      desc:`수변무대. MC 오프닝 + 캔음료 토큰교환(쿨러박스). 블루아워 시작`,
      aSeg:-1, bSeg:-1, mapFocus:{x:98,y:48,r:20},
      markers:[{x:98,y:42,color:"#FFB6C1",label:"2부 START",pulse:true}]},
    { time:"18:15", label:"🎵 버스킹 세트 1", phase:"busking1",
      desc:`어쿠스틱 세트 (4~5분). 일몰(18:50) 전 골든아워 활용`,
      aSeg:-1, bSeg:-1, mapFocus:{x:98,y:48,r:20},
      markers:[{x:98,y:42,color:"#FF6B9D",label:"♪ SET 1",pulse:true}]},
    { time:"18:22", label:"🎵 버스킹 세트 2 + 앵콜", phase:"busking2",
      desc:`세트 2 (4~5분) + MC 브릿지 + 앵콜 30초. 일몰 전환 타이밍`,
      aSeg:-1, bSeg:-1, mapFocus:{x:98,y:48,r:20},
      markers:[{x:98,y:42,color:"#FF6B9D",label:"♪ SET 2"}]},
    { time:"18:30", label:"🥂 자유 네트워킹", phase:"network",
      desc:`삼삼오오 자유 대화. 벚꽃등 아래 야경. 굿즈 교환(스티커 3개). 25분`,
      aSeg:-1, bSeg:-1, mapFocus:{x:98,y:48,r:20},
      markers:[{x:98,y:42,color:"#4ECDC4",label:"네트워킹"}]},
    { time:"18:55", label:"✨ 엔딩 · 해산", phase:"end",
      desc:`단체 야경샷 → "오늘 밤의 여운은 여기까지" → 안전 귀가 안내`,
      aSeg:-1, bSeg:-1, mapFocus:{x:98,y:48,r:20},
      markers:[{x:98,y:42,color:"#ffd93d",label:"END",pulse:true}]},
  ];
};

const smooth = (pts) => {
  if(pts.length < 2) return "";
  let d = `M${pts[0].x},${pts[0].y}`;
  for(let i=1;i<pts.length;i++){
    const p=pts[i-1], c=pts[i];
    const mx=(p.x+c.x)/2, my=(p.y+c.y)/2;
    d += ` Q${p.x},${p.y} ${mx},${my}`;
  }
  d += ` L${pts[pts.length-1].x},${pts[pts.length-1].y}`;
  return d;
};

const phaseColor = {
  prep:"#ff6b6b", checkin:"#ffd93d", a_start:"#FF6B9D", a_mid1:"#FF6B9D",
  b_start:"#4ECDC4", a_uturn:"#FF6B9D", b_arrive:"#4ECDC4", merge:"#FFB6C1",
  dismiss:"#aaa", part2:"#FFB6C1", busking1:"#FF6B9D", busking2:"#FF6B9D",
  network:"#4ECDC4", end:"#ffd93d",
};

export default function App() {
  const [ppl, setPpl] = useState(80);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [tab, setTab] = useState("map"); // map | courseA | courseB
  const timerRef = useRef(null);
  const tl = getTimeline(ppl);
  const cur = tl[step];

  useEffect(() => {
    if(playing){
      timerRef.current = setInterval(() => {
        setStep(s => { if(s >= tl.length-1){setPlaying(false);return s;} return s+1; });
      }, 3000);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, tl.length]);

  const bg = "#08090a";
  const pk = "#FFB6C1";
  const pkDim = "rgba(255,182,193,0.35)";
  const tx = "rgba(210,220,210,0.6)";
  const txDim = "rgba(210,220,210,0.22)";

  // 코스 A/B 전체 라인 합치기
  const allAPts = courseASegments.flatMap((s,i) => i===0 ? s.pts : s.pts.slice(1));
  const allBPts = courseBSegments.flatMap((s,i) => i===0 ? s.pts : s.pts.slice(1));

  // 현재 진행 중인 세그먼트까지의 점
  const activeAPts = cur.aSeg >= 0
    ? courseASegments.slice(0, cur.aSeg+1).flatMap((s,i) => i===0 ? s.pts : s.pts.slice(1))
    : [];
  const activeBPts = cur.bSeg >= 0
    ? courseBSegments.slice(0, cur.bSeg+1).flatMap((s,i) => i===0 ? s.pts : s.pts.slice(1))
    : [];

  // 게임 CP 위치
  const cpA = Math.ceil((ppl<=60?4:ppl<=80?5:6)/2);
  const cpB = (ppl<=60?4:ppl<=80?5:6) - cpA;
  const gameCPs = (cur.phase==="b_start"||cur.phase==="a_uturn"||cur.phase==="b_arrive"||cur.phase==="a_mid1") ? [
    ...Array.from({length:cpA},(_,i)=>{
      const seg = courseASegments[Math.min(2+i, courseASegments.length-1)];
      const pt = seg.pts[Math.floor(seg.pts.length/2)];
      return {...pt, label:`CP${i+1}`, route:"A"};
    }),
    ...Array.from({length:cpB},(_,i)=>{
      const seg = courseBSegments[Math.min(1+i, courseBSegments.length-1)];
      const pt = seg.pts[Math.floor(seg.pts.length/2)];
      return {...pt, label:`CP${cpA+i+1}`, route:"B"};
    }),
  ] : [];

  const btn = (c) => ({
    padding:"4px 12px", fontSize:10, borderRadius:20, cursor:"pointer",
    background:`${c}10`, color:c, border:`1px solid ${c}25`,
    fontFamily:"inherit", transition:"all 0.2s",
  });

  return (
    <div style={{minHeight:"100vh", background:bg, color:tx, fontFamily:"'Noto Sans KR',system-ui,sans-serif", padding:"10px 6px"}}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet"/>

      {/* ── Header ── */}
      <div style={{textAlign:"center",marginBottom:8}}>
        <div style={{fontSize:7,letterSpacing:4,color:txDim}}>2026 MENSA KOREA</div>
        <div style={{fontSize:16,fontWeight:700,color:pk}}>양재천 앵화야행 상세 동선</div>
        <div style={{fontSize:9,color:pkDim,marginTop:2}}>4/4(토) 16:20~18:55 · 워크 + 야외버스킹</div>
      </div>

      {/* ── People + Tab ── */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,flexWrap:"wrap",gap:4}}>
        <div style={{display:"flex",gap:3}}>
          {[60,80,100].map(n=>(
            <button key={n} onClick={()=>{setPpl(n);setStep(0);setPlaying(false);}} style={{
              ...btn(ppl===n?pk:txDim), fontWeight:ppl===n?600:300,
              background:ppl===n?"rgba(255,182,193,0.1)":"rgba(255,255,255,0.015)",
            }}>{n}명</button>
          ))}
        </div>
        <div style={{display:"flex",gap:3}}>
          {[["map","🗺 지도"],["courseA","A코스"],["courseB","B코스"]].map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)} style={{
              ...btn(tab===k ? (k==="courseA"?"#FF6B9D":k==="courseB"?"#4ECDC4":pk) : txDim),
              fontWeight:tab===k?600:300,
              background:tab===k?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.01)",
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* ══════════ MAP TAB ══════════ */}
      {tab === "map" && (
        <div style={{background:"rgba(255,255,255,0.008)",border:"1px solid rgba(255,182,193,0.06)",borderRadius:10,padding:"6px 2px",marginBottom:8}}>
          <svg viewBox="0 0 200 100" style={{width:"100%",height:"auto"}}>
            {/* 하천 물 */}
            <path d={smooth(riverCenter)} fill="none" stroke="rgba(80,140,220,0.06)" strokeWidth="14" strokeLinecap="round"/>
            <path d={smooth(riverCenter)} fill="none" stroke="rgba(80,140,220,0.1)" strokeWidth="7" strokeLinecap="round"/>
            <path d={smooth(riverCenter)} fill="none" stroke="rgba(100,160,240,0.15)" strokeWidth="2" strokeLinecap="round"/>

            {/* 산책로 (점선) */}
            <path d={smooth(pathNorth)} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" strokeDasharray="2 1.5" strokeLinecap="round"/>
            <path d={smooth(pathSouth)} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" strokeDasharray="2 1.5" strokeLinecap="round"/>
            <text x="6" y={pathNorth[0].y-1.5} fontSize="2.2" fill="rgba(255,255,255,0.12)">북측 산책로</text>
            <text x="6" y={pathSouth[0].y+4} fontSize="2.2" fill="rgba(255,255,255,0.12)">남측 산책로</text>

            {/* 벚꽃 구간 */}
            {cherryZones.map((z,i)=>(
              <g key={`cz${i}`}>
                <rect x={z.x1} y={38} width={z.x2-z.x1} height={32} rx="4"
                  fill={i===0?"rgba(255,182,193,0.04)":"rgba(255,182,193,0.02)"}
                  stroke={i===0?"rgba(255,182,193,0.1)":"rgba(255,182,193,0.05)"}
                  strokeWidth="0.3" strokeDasharray="3 1.5"/>
                <text x={(z.x1+z.x2)/2} y={39} textAnchor="middle" fontSize="2.5"
                  fill={i===0?"rgba(255,182,193,0.4)":"rgba(255,182,193,0.2)"}>
                  🌸 {z.label}
                </text>
                <text x={(z.x1+z.x2)/2} y={72} textAnchor="middle" fontSize="2"
                  fill={i===0?"rgba(255,182,193,0.3)":"rgba(255,182,193,0.15)"}>
                  밀도 {z.density}
                </text>
              </g>
            ))}

            {/* 다리 */}
            {bridges.map(b=>{
              const yc = riverCenter.find(p=>Math.abs(p.x-b.x)<4)?.y || 55;
              return (
                <g key={b.id}>
                  <line x1={b.x} y1={yc-8} x2={b.x} y2={yc+8} stroke="rgba(255,255,255,0.12)" strokeWidth="1.2"/>
                  <line x1={b.x-2} y1={yc-8} x2={b.x+2} y2={yc-8} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5"/>
                  <line x1={b.x-2} y1={yc+8} x2={b.x+2} y2={yc+8} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5"/>
                  <text x={b.x} y={yc-10} textAnchor="middle" fontSize="2.5" fill="rgba(255,255,255,0.35)" fontWeight="500">{b.name}</text>
                  {b.note && <text x={b.x} y={yc+12} textAnchor="middle" fontSize="1.8" fill={pkDim}>{b.note}</text>}
                </g>
              );
            })}

            {/* 코스 A 전체 (흐릿) */}
            <path d={smooth(allAPts)} fill="none" stroke="rgba(255,107,157,0.12)" strokeWidth="0.6" strokeDasharray="2 1" strokeLinecap="round"/>
            {/* 코스 B 전체 (흐릿) */}
            <path d={smooth(allBPts)} fill="none" stroke="rgba(78,205,196,0.12)" strokeWidth="0.6" strokeDasharray="2 1" strokeLinecap="round"/>

            {/* Active A */}
            {activeAPts.length > 1 && (
              <path d={smooth(activeAPts)} fill="none" stroke="#FF6B9D" strokeWidth="1.4" strokeLinecap="round" opacity="0.8"/>
            )}
            {/* Active B */}
            {activeBPts.length > 1 && (
              <path d={smooth(activeBPts)} fill="none" stroke="#4ECDC4" strokeWidth="1.4" strokeLinecap="round" opacity="0.8"/>
            )}

            {/* A코스 구간 번호 */}
            {courseASegments.map((seg,i)=>{
              const mid = seg.pts[Math.floor(seg.pts.length/2)];
              return (
                <g key={seg.id} opacity={cur.aSeg>=i?0.7:0.15}>
                  <circle cx={mid.x} cy={mid.y} r="2.5" fill="rgba(255,107,157,0.15)" stroke="rgba(255,107,157,0.3)" strokeWidth="0.3"/>
                  <text x={mid.x} y={mid.y+0.8} textAnchor="middle" fontSize="2.2" fill="#FF6B9D" fontWeight="600">{i+1}</text>
                </g>
              );
            })}

            {/* B코스 구간 번호 */}
            {courseBSegments.map((seg,i)=>{
              const mid = seg.pts[Math.floor(seg.pts.length/2)];
              return (
                <g key={seg.id} opacity={cur.bSeg>=i?0.7:0.15}>
                  <circle cx={mid.x} cy={mid.y} r="2.5" fill="rgba(78,205,196,0.15)" stroke="rgba(78,205,196,0.3)" strokeWidth="0.3"/>
                  <text x={mid.x} y={mid.y+0.8} textAnchor="middle" fontSize="2.2" fill="#4ECDC4" fontWeight="600">{i+1}</text>
                </g>
              );
            })}

            {/* 게임 CP */}
            {gameCPs.map((cp,i)=>(
              <g key={`gcp${i}`}>
                <circle cx={cp.x} cy={cp.y} r="2.5" fill="rgba(255,215,61,0.1)" stroke="rgba(255,215,61,0.4)" strokeWidth="0.4">
                  <animate attributeName="r" values="2;3;2" dur="2s" repeatCount="indefinite"/>
                </circle>
                <text x={cp.x} y={cp.y+1} textAnchor="middle" fontSize="2.8">🎮</text>
                <text x={cp.x} y={cp.y-3.5} textAnchor="middle" fontSize="2" fill="rgba(255,215,61,0.6)">{cp.label}</text>
              </g>
            ))}

            {/* POIs */}
            {pois.map(p=>(
              <g key={p.id}>
                {p.type==="station" && <circle cx={p.x} cy={p.y} r="3.5" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.4"/>}
                <text x={p.x} y={p.y+1.2} textAnchor="middle" fontSize={p.type==="station"?"3.5":"2.8"}>{p.icon}</text>
                <text x={p.x} y={p.y-(p.type==="station"?5:4)} textAnchor="middle" fontSize={p.type==="station"?"2.8":"2"} fill={p.type==="station"?"rgba(255,255,255,0.45)":"rgba(255,255,255,0.2)"} fontWeight={p.type==="station"?500:300}>{p.name}</text>
              </g>
            ))}

            {/* Markers (current step) */}
            {cur.markers.map((m,i)=>(
              <g key={`mk${i}`}>
                {m.pulse ? (
                  <circle cx={m.x} cy={m.y} r="4" fill={`${m.color}15`} stroke={m.color} strokeWidth="0.6">
                    <animate attributeName="r" values="3;6;3" dur="1.5s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite"/>
                  </circle>
                ) : (
                  <circle cx={m.x} cy={m.y} r="3" fill={`${m.color}20`} stroke={m.color} strokeWidth="0.5"/>
                )}
                <text x={m.x} y={m.y+(m.y>55?6:-5)} textAnchor="middle" fontSize="2.2" fill={m.color} fontWeight="600">{m.label}</text>
              </g>
            ))}

            {/* Legend */}
            <g transform="translate(2,88)">
              <line x1="0" y1="0" x2="6" y2="0" stroke="#FF6B9D" strokeWidth="1"/>
              <text x="8" y="1" fontSize="2.2" fill="#FF6B9D">A코스 2.45km/37분(남측→북측→U턴)</text>
              <line x1="80" y1="0" x2="86" y2="0" stroke="#4ECDC4" strokeWidth="1"/>
              <text x="88" y="1" fontSize="2.2" fill="#4ECDC4">B코스 1.1km/17분(북측 직행)</text>
              <text x="155" y="1" fontSize="2.2" fill="rgba(255,215,61,0.5)">🎮 이동형 게임CP</text>
            </g>

            {/* 방향 표시 */}
            <text x="195" y="48" fontSize="2.5" fill="rgba(255,255,255,0.15)" textAnchor="end">← 상류(동)</text>
            <text x="5" y="48" fontSize="2.5" fill="rgba(255,255,255,0.15)">하류(서) →</text>
          </svg>
        </div>
      )}

      {/* ══════════ COURSE DETAIL TABS ══════════ */}
      {(tab==="courseA"||tab==="courseB") && (
        <div style={{marginBottom:8}}>
          {(tab==="courseA"?courseASegments:courseBSegments).map((seg,i)=>{
            const c = seg.color;
            const isActive = tab==="courseA" ? cur.aSeg===i : cur.bSeg===i;
            const isPast = tab==="courseA" ? cur.aSeg>i : cur.bSeg>i;
            return (
              <div key={seg.id} style={{
                display:"flex", gap:8, padding:"8px 10px", marginBottom:2,
                background: isActive?`${c}10`:"transparent",
                border:`1px solid ${isActive?`${c}30`:"rgba(255,255,255,0.02)"}`,
                borderRadius:8, opacity:isPast?0.5:1, transition:"all 0.3s",
              }}>
                <div style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
                  background:`${c}15`,border:`1.5px solid ${c}40`,fontSize:12,fontWeight:700,color:c,flexShrink:0}}>
                  {i+1}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:11,fontWeight:600,color:isActive?c:tx,marginBottom:2}}>{seg.label}</div>
                  <div style={{display:"flex",gap:8,fontSize:9,color:pkDim,marginBottom:3}}>
                    <span>📏 {seg.dist}</span><span>⏱ {seg.time}</span>
                  </div>
                  <div style={{fontSize:9,color:txDim,lineHeight:1.5}}>{seg.desc}</div>
                </div>
              </div>
            );
          })}
          {/* Course summary */}
          <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:8,padding:"8px",
            background:"rgba(255,255,255,0.01)",borderRadius:8,border:"1px solid rgba(255,255,255,0.03)"}}>
            {tab==="courseA" ? (<>
              <Stat label="총거리" value="2.45km"/>
              <Stat label="소요시간" value="37분"/>
              <Stat label="구간수" value="8구간"/>
              <Stat label="도하" value="2회"/>
            </>) : (<>
              <Stat label="총거리" value="1.1km"/>
              <Stat label="소요시간" value="17분"/>
              <Stat label="구간수" value="4구간"/>
              <Stat label="도하" value="0회"/>
            </>)}
          </div>
        </div>
      )}

      {/* ── Current step card ── */}
      <div style={{
        padding:"10px 12px",borderRadius:8,marginBottom:8,
        background:`${phaseColor[cur.phase]}08`,border:`1px solid ${phaseColor[cur.phase]}20`,
      }}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
          <span style={{fontSize:15,fontWeight:700,color:phaseColor[cur.phase],fontFamily:"monospace"}}>{cur.time}</span>
          <span style={{fontSize:11,fontWeight:600,color:tx}}>{cur.label}</span>
          <span style={{marginLeft:"auto",fontSize:8,color:txDim}}>{step+1}/{tl.length}</span>
        </div>
        <div style={{fontSize:10,color:txDim,lineHeight:1.6}}>{cur.desc}</div>
      </div>

      {/* ── Playback ── */}
      <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:8}}>
        <Btn label="◀" color={txDim} onClick={()=>{setStep(s=>Math.max(0,s-1));setPlaying(false);}}/>
        <Btn label={playing?"⏸":"▶"} color={playing?"#ff6b6b":pk}
          onClick={()=>{if(step>=tl.length-1)setStep(0);setPlaying(!playing);}}/>
        <Btn label="▶" color={txDim} onClick={()=>{setStep(s=>Math.min(tl.length-1,s+1));setPlaying(false);}}/>
        <div style={{flex:1,display:"flex",gap:1.5}}>
          {tl.map((t,i)=>(
            <div key={i} onClick={()=>{setStep(i);setPlaying(false);}} style={{
              flex:1,height:6,borderRadius:3,cursor:"pointer",
              background:i<=step?phaseColor[t.phase]:"rgba(255,255,255,0.03)",
              opacity:i===step?1:i<step?0.35:0.12,transition:"all 0.3s",
            }}/>
          ))}
        </div>
      </div>

      {/* ── Full timeline ── */}
      <div style={{padding:"6px 0"}}>
        <div style={{fontSize:8,color:txDim,letterSpacing:2,marginBottom:6}}>전체 타임라인 ({tl.length}단계)</div>
        {tl.map((t,i)=>{
          const active=i===step, past=i<step;
          return (
            <div key={i} onClick={()=>{setStep(i);setPlaying(false);}} style={{
              display:"flex",gap:8,padding:"4px 8px",cursor:"pointer",
              borderLeft:`2px solid ${active?phaseColor[t.phase]:past?`${phaseColor[t.phase]}35`:"rgba(255,255,255,0.025)"}`,
              background:active?`${phaseColor[t.phase]}08`:"transparent",
              marginBottom:1,borderRadius:"0 4px 4px 0",transition:"all 0.2s",
            }}>
              <span style={{width:36,flexShrink:0,fontSize:10,fontFamily:"monospace",
                color:active?phaseColor[t.phase]:past?txDim:"rgba(210,220,210,0.12)",fontWeight:active?600:300}}>
                {t.time}
              </span>
              <span style={{flex:1,fontSize:10,
                color:active?tx:past?txDim:"rgba(210,220,210,0.12)",fontWeight:active?500:300}}>
                {t.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Summary ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,marginTop:8}}>
        <SumCard label="총 행사" value="2시간 35분" sub="16:20~18:55"/>
        <SumCard label="1부 워크" value={`${Math.round(ppl*(ppl<=60?0.42:ppl<=80?0.44:0.4))}+${ppl-Math.round(ppl*(ppl<=60?0.42:ppl<=80?0.44:0.4))}명`} sub="A+B 동시"/>
        <SumCard label="2부 야외" value="55분" sub="버스킹+네트워킹"/>
      </div>

      {/* ── Staff ── */}
      <div style={{marginTop:10,padding:"8px 10px",background:"rgba(255,255,255,0.01)",border:"1px solid rgba(255,182,193,0.06)",borderRadius:8}}>
        <div style={{fontSize:8,color:pkDim,letterSpacing:1,marginBottom:6}}>{ppl}명 운영 배치</div>
        {(() => {
          const c = ppl<=60
            ? {total:9,ci:2,dep:1,cp:4,arr:1,mc:1}
            : ppl<=80 ? {total:11,ci:2,dep:2,cp:5,arr:1,mc:1}
            : {total:15,ci:3,dep:2,cp:6,arr:2,mc:2};
          return [
            {r:"총괄",n:1,note:"전체 타임·비상대응"},
            {r:"체크인",n:c.ci,note:`L${c.ci} 레인 운영`},
            {r:"출발통제",n:c.dep,note:"A/B 코스 분리 유도"},
            {r:"게임CP",n:c.cp,note:`A ${Math.ceil(c.cp/2)} + B ${c.cp-Math.ceil(c.cp/2)}`},
            {r:"도착/귀가",n:c.arr,note:"수변무대·미성년 체크"},
            {r:"2부 MC/음향",n:c.mc,note:"앰프·마이크·엔딩"},
          ].map((row,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",
              borderBottom:"1px solid rgba(255,255,255,0.015)",fontSize:9}}>
              <span style={{color:tx,width:60}}>{row.r}</span>
              <span style={{color:txDim,flex:1,textAlign:"center"}}>{row.note}</span>
              <span style={{color:pk,fontWeight:500,width:28,textAlign:"right"}}>{row.n}명</span>
            </div>
          ));
        })()}
      </div>

      <div style={{marginTop:12,textAlign:"center",fontSize:7,color:"rgba(210,220,210,0.1)",lineHeight:1.8}}>
        양재천 영동2교~양재교 구간 기준 · 4/4(토) 일몰 ~18:50<br/>
        2026 MENSA KOREA 앵화야행 · v4 상세
      </div>
    </div>
  );
}

function Btn({label,color,onClick}){
  return <button onClick={onClick} style={{
    width:28,height:28,borderRadius:"50%",border:`1px solid ${color}30`,
    background:`${color}10`,color,fontSize:10,cursor:"pointer",
    display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit",
  }}>{label}</button>;
}
function Stat({label,value}){
  return <div style={{textAlign:"center"}}>
    <div style={{fontSize:8,color:"rgba(210,220,210,0.22)"}}>{label}</div>
    <div style={{fontSize:13,fontWeight:700,color:"#FFB6C1"}}>{value}</div>
  </div>;
}
function SumCard({label,value,sub}){
  return <div style={{padding:"8px 6px",background:"rgba(255,255,255,0.01)",border:"1px solid rgba(255,182,193,0.06)",borderRadius:8,textAlign:"center"}}>
    <div style={{fontSize:8,color:"rgba(210,220,210,0.22)"}}>{label}</div>
    <div style={{fontSize:13,fontWeight:700,color:"#FFB6C1",margin:"2px 0"}}>{value}</div>
    <div style={{fontSize:8,color:"rgba(210,220,210,0.22)"}}>{sub}</div>
  </div>;
}
