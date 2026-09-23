// TrailerWow.jsx — kinetic hook, 3D pushes, skewed curtains, bursts, punch zooms
const { useRef, useState, useLayoutEffect } = React;
const W = 1920, H = 1080;
const INK = '#0B1220', MUTE = 'rgba(11,18,32,0.5)', FAINT = 'rgba(11,18,32,0.4)', LINE = 'rgba(11,18,32,0.08)', RAIL = 'rgba(11,18,32,0.08)', YEL = '#FDC500';
const F = "'Archivo', sans-serif", FB = "'Archivo Black', sans-serif", FM = "'Roboto Mono', monospace";

const SECTIONS = [['Elementary School','4° a 6°',[4,5,6]],['Junior School','7° a 9°',[7,8,9]],['Senior School','10° a 12°',[10,11,12]]];
const GOALS = {4:400000,5:450000,6:550000,7:650000,8:700000,9:750000,10:850000,11:900000,12:1400000};
const PCT = {'4°A':90,'4°B':35,'4°C':72,'5°A':75,'5°B':46,'5°C':110,'6°A':45,'6°B':82,'6°C':19,'7°A':65,'7°B':85,'7°C':93,'8°A':42,'8°B':80,'8°C':20,'9°A':70,'9°B':67,'9°C':91,'10°A':90,'10°B':30,'10°C':74,'11°A':45,'11°B':105,'11°C':65,'12°A':58,'12°B':96,'12°C':38};
const STATUS = { verde:['#3E8E5E','Al día'], ambar:['#C9A24A','Atrasado'], rojo:['#B5484D','En riesgo'] };
const EXPENSES = [['Comparsas',1150000],['Refrigerios',920000],['Decoración de cafetería',580000],['Transporte',490000],['Guerra de casas',260000]];
const EVENTS = [['14 mar','Feria de talentos','Realizado'],['22 may','Jean Day','Realizado'],['18 jul','Torneo intercursos','En curso'],['12 sep','Noche de cine','Programado'],['30 oct','Bazar de Halloween','Programado']];
const NAMES = ["Valentina R.","Santiago M.","Mariana G.","Juan Pablo C.","Isabella T.","Nicolás H.","Sofía L.","Andrés F.","Camila O.","Sebastián P.","Luciana V.","Tomás A.","Gabriela S.","Daniel Q."];
const STUDENTS = [60000,55000,50000,50000,45000,45000,45000,40000,40000,40000,35000,35000,35000,30000].map((a, i) => ({ name: NAMES[i], amount: a }));
const ROOM_SPENT = [['Decoración Halloween',33000],['Actividad en diciembre',26000],['Pizza',13000]];
const cop = n => (n < 0 ? '−' : '') + '$' + Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const room = (code, grade) => { const goal = GOALS[grade], pct = PCT[code]; const raised = Math.round(goal*pct/100/1000)*1000; const st = pct>=70?'verde':pct>=40?'ambar':'rojo'; return {code, goal, raised, pct, color: STATUS[st][0], label: STATUS[st][1]}; };
const sections = SECTIONS.map(([name, grades, gs]) => ({ name, grades, rows: gs.flatMap(g => ['A','B','C'].map(l => room(g+'°'+l, g))) }));
const rooms = sections.flatMap(s => s.rows);
const totalRaised = rooms.reduce((a,r)=>a+r.raised,0), totalGoal = rooms.reduce((a,r)=>a+r.goal,0), spent = EXPENSES.reduce((a,e)=>a+e[1],0);
const SEL = rooms.find(r => r.code === '7°C');
const roomSpent = ROOM_SPENT.reduce((a,e)=>a+e[1],0);
const POLLS = [
  {tag:'Spirit Week', close:'Cierra en 3 días', q:'¿De qué se trata la Spirit Week?', opts:['Villanos de película','Años 2000','Pijamada general','Profes por un día'], base:[62,48,55,71], rate:[1.1,0.7,0.9,1.5]},
  {tag:'Navidad · Todo el colegio', close:'Cierra en 6 días', q:'¿Qué hacemos en Navidad como colegio?', opts:['Mercado navideño en la cancha','Villancicos en versión reguetón','Intercambio de regalos gigante','Cine al aire libre'], base:[84,70,45,38], rate:[1.0,3.4,0.6,0.5]},
  {tag:'Día del Estudiante', close:'Cierra mañana', q:'¿Cómo celebramos el Día del Estudiante?', opts:['Rally por casas','Festival de bandas','Día sin morral','Karaoke con profes'], base:[55,60,41,33], rate:[1.3,1.0,1.8,0.6]},
];
const VOTE = [0, 3]; // poll, option the cursor votes for

// motion helpers
const MOTION = {
  enter: (T, start, dur=0.5) => ({ o: animate({from:0,to:1,start,end:start+dur,ease:Easing.easeOutCubic})(T), y: animate({from:22,to:0,start,end:start+dur,ease:Easing.easeOutCubic})(T) }),
  draw: (T, start, dur, pct) => animate({from:0,to:Math.min(pct,100),start,end:start+dur,ease:Easing.easeInOutQuart})(T),
  count: (T, start, dur, value) => Math.round(value * animate({from:0,to:1,start,end:start+dur,ease:Easing.easeOutQuart})(T) / 1000) * 1000,
  prog: (T, start, dur, ease=Easing.easeInOutQuart) => ease(clamp((T-start)/dur, 0, 1)),
  cam: (T, keys) => { // [[t, scale, focusX, focusY], ...]
    if (T <= keys[0][0]) return keys[0]; const last = keys[keys.length-1]; if (T >= last[0]) return last;
    for (let i=0;i<keys.length-1;i++){ const a=keys[i], b=keys[i+1]; if (T>=a[0]&&T<=b[0]) { const e = Easing.easeInOutQuart((T-a[0])/(b[0]-a[0])); return [T, a[1]+(b[1]-a[1])*e, a[2]+(b[2]-a[2])*e, a[3]+(b[3]-a[3])*e]; } }
    return last;
  },
};
const ev = (T, start, dur=0.5) => { const e = MOTION.enter(T, start, dur); return { opacity: e.o, transform: 'translateY(' + e.y + 'px)' }; };
const evm = (T, start, dur, mul) => { const e = MOTION.enter(T, start, dur); return { opacity: e.o * mul, transform: 'translateY(' + e.y + 'px)' }; };
// tab-style push: outgoing slides left & fades, incoming arrives from the right
const pushOut = (T, at, d=0.3) => { const e = MOTION.prog(T, at, d); return { opacity: 1-e, transform: 'translateX(' + (-140*e) + 'px)' }; };
const pushIn = (T, at, d=0.5) => { const e = MOTION.prog(T, at + 0.22, d, Easing.easeOutQuart); return { opacity: e, transform: 'translateX(' + (140*(1-e)) + 'px)' }; };
// screen arrives from the right after a curtain, leaves left while the next curtain covers it
const move = (T, inAt, outAt) => { const a = inAt == null ? 1 : MOTION.prog(T, inAt + 0.3, 0.65, Easing.easeOutExpo); const b = outAt == null ? 0 : MOTION.prog(T, outAt - 0.42, 0.42, Easing.easeInCubic); const bl = 16 * (1 - a) + 12 * b; return { transform: 'translateX(' + (300 * (1 - a) - 220 * b) + 'px) rotateY(' + (-24 * (1 - a) + 18 * b) + 'deg) scale(' + (1 - 0.1 * b) + ')', transformOrigin: 'center 40%', filter: bl > 0.3 ? 'blur(' + bl + 'px)' : 'none' }; };
function Curtain({T, at, n, label, sub}) {
  const P = (st, d) => MOTION.prog(T, st, d, Easing.easeInOutQuart);
  const inkIn = P(at - 0.46, 0.38), inkOut = P(at + 0.42, 0.42), yIn = P(at - 0.38, 0.36), yOut = P(at + 0.32, 0.42);
  if (inkIn <= 0 || inkOut >= 1) return null;
  const pos = (i, o) => 'translateX(' + ((1 - i) * 100 - o * 100) + '%) skewX(-14deg)';
  const panel = {position:'absolute', top:0, bottom:0, left:'-20%', width:'140%'};
  const sub_e = Easing.easeOutExpo(clamp((T - at + 0.02) / 0.4, 0, 1));
  return <div style={{position:'absolute', inset:0, zIndex:20, pointerEvents:'none', overflow:'hidden'}}>
    <div style={{...panel, background:INK, transform: pos(inkIn, inkOut)}}/>
    <div style={{...panel, background:YEL, transform: pos(yIn, yOut), overflow:'hidden'}}>
      <div style={{position:'absolute', inset:0, transform:'skewX(14deg)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:INK}}>
        {label && <>
          <div style={{position:'absolute', top:'50%', left:'50%', whiteSpace:'nowrap', fontFamily:FB, fontSize:560, letterSpacing:'-0.05em', lineHeight:1, color:'transparent', WebkitTextStroke:'3px ' + INK, opacity:0.16, transform:'translate(calc(-50% + ' + ((T - at) * -1100) + 'px), -50%)'}}>{label + ' ' + label}</div>
          <div style={{position:'relative', textAlign:'center'}}>
            <div style={{fontFamily:FM, fontSize:26, letterSpacing:'0.08em', opacity: sub_e}}>{n} / 04</div>
            <div style={{display:'flex', justifyContent:'center', overflow:'hidden', marginTop:14, paddingBottom:10}}>{label.split('').map((ch, i) => { const e = Easing.easeOutExpo(clamp((T - at + 0.26 - i * 0.03) / 0.4, 0, 1)); return <div key={i} style={{fontFamily:FB, fontSize:210, letterSpacing:'-0.05em', lineHeight:1, transform:'translateY(' + (110 * (1 - e)) + '%) rotate(' + (8 * (1 - e)) + 'deg)'}}>{ch}</div>; })}</div>
            <div style={{fontFamily:F, fontSize:42, fontWeight:500, letterSpacing:'-0.03em', marginTop:22, opacity: sub_e, transform:'translateY(' + (30 * (1 - sub_e)) + 'px)'}}>{sub}</div>
          </div>
        </>}
      </div>
    </div>
  </div>;
}
const HOOK = [['¿Cuánto hay?', INK, '#fff'], ['¿En qué se gastó?', YEL, INK], ['¿Quién decide?', '#fff', INK]];
function Hook({T, C}) {
  const t0 = C.Hook; if (T >= C.Intro) return null;
  const d = (C.Intro - t0) / 3, k = Math.min(2, Math.max(0, Math.floor((T - t0) / d))), lt = (T - t0 - k * d);
  const [txt, bg, fg] = HOOK[k];
  return <div style={{position:'absolute', inset:0, zIndex:30, background:bg, color:fg, overflow:'hidden'}}>
    <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', gap:'0 44px', fontFamily:FB, fontSize:200, letterSpacing:'-0.05em', lineHeight:1, transform:'scale(' + (1 + 0.08 * lt) + ')'}}>
      {txt.split(' ').map((w, i) => { const e = Easing.easeOutExpo(clamp((lt - i * 0.08) / 0.35, 0, 1)); return <div key={i} style={{whiteSpace:'nowrap', opacity: Math.min(1, e * 2), transform:'translateY(' + (160 * (1 - e)) + 'px) scale(' + (1.5 - 0.5 * e) + ') rotate(' + (-8 * (1 - e)) + 'deg)'}}>{w}</div>; })}
    </div>
  </div>;
}
function Burst({T, at, x, y, n = 22}) {
  const t = T - at; if (t < 0 || t > 0.9) return null;
  return <div style={{position:'absolute', left:0, top:0, pointerEvents:'none', zIndex:8}}>{Array.from({length:n}).map((_, i) => { const ang = i / n * Math.PI * 2 + (i % 3) * 0.2; const sp = 320 + (i * 53 % 200); const e = Easing.easeOutCubic(t / 0.9); const px = x + Math.cos(ang) * sp * e, py = y + Math.sin(ang) * sp * e + 260 * t * t; const sz = 8 + (i % 4) * 5; return <div key={i} style={{position:'absolute', left:px, top:py, width:sz, height:sz, marginLeft:-sz / 2, marginTop:-sz / 2, borderRadius: i % 2 ? sz / 2 : 2, background: i % 3 === 0 ? INK : YEL, opacity: 1 - t / 0.9, transform:'rotate(' + (t * 500 + i * 30) + 'deg)'}}/>; })}</div>;
}
// wipe reveal for headline type
const wipe = (T, start, dur=0.7) => { const e = MOTION.prog(T, start, dur, Easing.easeInOutQuart); return { clipPath: 'inset(-10% ' + ((1-e)*102) + '% -10% -2%)' }; };

const Label = ({children, style}) => <div style={{fontSize:17, fontWeight:500, color:MUTE, fontFamily:F, ...style}}>{children}</div>;
const Big = ({children, size=120, color=INK}) => <div style={{fontFamily:FB, fontSize:size, letterSpacing:'-0.05em', lineHeight:1, marginTop:16, fontVariantNumeric:'tabular-nums', color}}>{children}</div>;
const Bar = ({pct, h=5, mt=12}) => <div style={{marginTop:mt, height:h, borderRadius:h/2, background:RAIL, overflow:'hidden'}}><div style={{height:'100%', borderRadius:h/2, background:YEL, width: pct+'%'}}/></div>;
const ColHead = ({name, grades}) => <><div style={{fontSize:32, fontWeight:600, letterSpacing:'-0.04em', lineHeight:1.1}}>{name}</div><div style={{marginTop:6, fontSize:15, color:MUTE}}>{grades}</div></>;
const Section = ({children, style}) => <div style={{fontSize:14, fontWeight:500, letterSpacing:'0.06em', textTransform:'uppercase', color:FAINT, ...style}}>{children}</div>;

const TABS = ['Salones','Leaderboard','Control','Votaciones'];
function Header({T, C, tabRefs, tabPos, brandRef, brandW}) {
  // brand: giant cold-open at center → lands in the header slot
  const S0 = 96/17;
  const fly = MOTION.prog(T, C.Leaderboard - 0.55, 0.6) * (1 - MOTION.prog(T, C.Outro + 0.05, 0.7));
  const S = S0 + (1 - S0) * fly;
  const cx0 = W/2 - brandW*S0/2, cy0 = H/2 - 17*1.2*S0/2;
  const bx = cx0 + (56 - cx0) * fly, by = cy0 + ((64 - 17*1.2)/2 - cy0) * fly;
  const chrome = MOTION.prog(T, C.Leaderboard - 0.1, 0.4, Easing.easeOutCubic) * (1 - MOTION.prog(T, C.Outro - 0.05, 0.1));
  // active tab + sliding underline
  const segs = [[-1e9,1],[C.Salones-0.05,0],[C.Control-0.05,2],[C.Votaciones-0.05,3]];
  let k = 0; segs.forEach((sg, i) => { if (T >= sg[0]) k = i; });
  const idx = segs[k][1], from = k > 0 ? segs[k-1][1] : idx, at = segs[k][0];
  const e = MOTION.prog(T, at, 0.5);
  const a = tabPos[from], b = tabPos[idx];
  const ul = { left: a.x + (b.x - a.x) * e, width: a.w + (b.w - a.w) * e };
  return <div style={{position:'absolute', left:0, top:0, width:W, height:64, zIndex:5}}>
    <div style={{position:'absolute', left:0, right:0, top:63, height:1, background:LINE, opacity: chrome}}/>
    <div ref={brandRef} style={{position:'absolute', left:bx, top:by, fontSize:17, lineHeight:1.2, fontWeight:600, letterSpacing:'-0.03em', color:INK, fontFamily:F, whiteSpace:'nowrap', transform: 'scale(' + S + ')', transformOrigin:'0 0', ...wipe(T, C.Intro + 0.1, 0.55), opacity: 1 - MOTION.prog(T, C.Outro + 3.1, 0.4)}}>Que la plata se vea.</div>
    <div style={{position:'absolute', right:56, top:0, height:64, display:'flex', gap:40, alignItems:'center', opacity: chrome, transform: 'translateY(' + (8*(1-chrome)) + 'px)'}}>
      {TABS.map((n, i) => <div key={n} ref={tabRefs[i]} data-anchor={'tab-' + i} style={{position:'relative', fontSize:16, fontWeight:500, fontFamily:F, color: idx===i ? INK : MUTE, transition:'color 0.3s'}}>{n}{i === 3 && <div style={{position:'absolute', left:'100%', top:-9, marginLeft:4, padding:'2px 6px', borderRadius:6, background:YEL, color:INK, fontSize:10, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', lineHeight:1.2}}>Nuevo</div>}</div>)}
    </div>
    <div style={{position:'absolute', top:61, height:2, background:INK, left: ul.left, width: ul.width, opacity: chrome}}/>
  </div>;
}

function Screen({children, style}) {
  return <div style={{position:'absolute', inset:0, color:INK, fontFamily:F, fontSize:18, lineHeight:1.4, overflow:'hidden', perspective:'1800px'}}>
    <div style={{padding:'120px 56px 0', ...style}}>{children}</div>
  </div>;
}

function Leaderboard({T, C}) {
  const t0 = C.Leaderboard;
  const sortE = MOTION.prog(T, t0 + 1.0, 0.6); // rows settle into ranking
  return <>
    <div style={{textAlign:'center', ...ev(T, t0, 0.4)}}>
      <Label>Ranking por sección</Label>
      <div style={{marginTop:10, fontSize:64, fontWeight:600, letterSpacing:'-0.05em', lineHeight:1, ...wipe(T, t0+0.05, 0.5)}}>¿Quién va adelante?</div>
    </div>
    <div style={{marginTop:56, display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap:64}}>
      {sections.map((s, ci) => { const sorted = [...s.rows].sort((a,b)=>b.raised-a.raised); return <div key={s.name} style={ev(T, t0+0.15+ci*0.08, 0.4)}>
        <ColHead name={s.name} grades={s.grades}/>
        <div style={{marginTop:22, borderBottom:'1px solid rgba(11,18,32,0.1)'}}/>
        {sorted.map((r, i) => { const orig = s.rows.indexOf(r); const dy = (orig - i) * 66 * (1 - sortE); const rank = Math.round(orig + (i - orig) * sortE); const en = MOTION.enter(T, t0+0.25+ci*0.08+orig*0.04, 0.35); const top = i===0 && sortE > 0.5;
          return <div key={r.code} style={{display:'grid', gridTemplateColumns:'34px minmax(0,1fr) auto', gap:'0 16px', alignItems:'center', height:66, borderBottom: '1px solid ' + LINE, opacity: en.o, transform: 'translateY(' + (en.y + dy) + 'px)', background: top ? 'rgba(253,197,0,' + (0.18*(sortE-0.5)*2) + ')' : 'transparent', margin:'0 -10px', padding:'0 10px', borderRadius:6}}>
          <div style={{fontFamily:FM, fontSize:15, color: top?INK:FAINT}}>{String(rank+1).padStart(2,'0')}</div>
          <div data-anchor={ci===1 && i===0 ? 'lb-top' : null} style={{fontSize:24, fontWeight:600, letterSpacing:'-0.03em'}}>{r.code}</div>
          <div style={{fontFamily:FM, fontSize:19, textAlign:'right', color: top?INK:'rgba(11,18,32,0.7)'}}>{cop(r.raised)}</div>
        </div>; })}
      </div>; })}
    </div>
  </>;
}

function Salones({T, C, rowRef, clickAt, pt}) {
  const t0 = C.Salones;
  const hover = MOTION.prog(T, clickAt - 0.25, 0.2, Easing.easeOutCubic);
  const pressed = T >= clickAt && T < clickAt + 0.18;
  const lift = MOTION.prog(T, clickAt + 0.15, 0.5); // selected row flies to the ficha title slot
  const others = 1 - MOTION.prog(T, clickAt + 0.12, 0.3, Easing.easeOutCubic);
  const rowFade = 1 - MOTION.prog(T, C.Ficha + 0.05, 0.35, Easing.easeOutCubic);
  const tx = (56 - pt.x) * lift, ty = (206 - pt.y) * lift, sc = 1 + 1.2 * lift, rest = 1 - MOTION.prog(T, clickAt + 0.15, 0.25, Easing.easeOutCubic);
  const total = MOTION.count(T, t0 + 0.35, 1.0, totalRaised);
  return <>
    <div style={{...evm(T, t0+0.3, 0.4, others)}}>
      <Label style={{textAlign:'center'}}>Recaudado por todos los salones</Label>
      <div style={{textAlign:'center'}}><div data-anchor="sal-total" style={{display:'inline-block'}}><Big>{cop(total)}</Big></div></div>
    </div>
    <div style={{marginTop:56, display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap:64}}>
      {sections.map((s, ci) => <div key={s.name} style={{...ev(T, t0+0.4+ci*0.08, 0.4)}}>
        <div style={{opacity: others}}><ColHead name={s.name} grades={s.grades}/>
        <div style={{marginTop:22, display:'flex', justifyContent:'space-between', paddingBottom:10, borderBottom:'1px solid rgba(11,18,32,0.1)', fontSize:13, letterSpacing:'0.06em', textTransform:'uppercase', color:FAINT}}><div>Salón</div><div>Recaudado</div></div></div>
        {s.rows.map((r, i) => { const isSel = r.code === SEL.code; const start = t0+0.6+ci*0.1+i*0.045; const pct = MOTION.draw(T, start, 0.8, r.pct); const en = ev(T, start-0.15, 0.35);
          const style = isSel
            ? { ...en, opacity: en.opacity * rowFade, transform: 'translate(' + tx + 'px,' + ty + 'px) scale(' + sc + ')', transformOrigin:'0 0', background: 'rgba(11,18,32,' + (pressed ? 0.08 : 0.04*hover*others) + ')', position:'relative', zIndex:3, borderBottomColor: 'rgba(11,18,32,' + (0.08*others) + ')' }
            : { ...en, opacity: en.opacity * others };
          return <div key={r.code} ref={isSel ? rowRef : null} data-anchor={isSel ? 'sal-7C' : null} style={{padding:'13px 10px', margin:'0 -10px', borderRadius:8, borderBottom: '1px solid ' + LINE, ...style}}>
          <div style={{display:'grid', gridTemplateColumns:'auto minmax(0,1fr) auto', gap:'0 14px', alignItems:'center'}}>
            <div style={{display:'flex', alignItems:'center', gap:12}}><div data-anchor={r.code === '4°B' ? 'sal-dot' : null} style={{width:8, height:8, borderRadius:4, background:r.color}}/><div style={{fontSize:21, fontWeight:600, letterSpacing:'-0.03em'}}>{r.code}</div></div>
            <div style={{fontFamily:FM, fontSize:14, textAlign:'right', whiteSpace:'nowrap', color:MUTE, opacity: isSel ? rest : 1}}>{Math.round(pct * r.pct / Math.min(r.pct,100))} %</div>
            <div style={{fontFamily:FM, fontSize:18, textAlign:'right', minWidth:120, opacity: isSel ? rest : 1}}>{cop(r.raised)}</div>
          </div>
          <div style={{opacity: isSel ? rest : 1}}><Bar pct={pct} h={4} mt={9}/></div>
        </div>; })}
      </div>)}
    </div>
  </>;
}

function Ficha({T, C}) {
  const t0 = C.Ficha;
  const pct = MOTION.draw(T, t0+0.35, 1.0, SEL.pct);
  const raised = MOTION.count(T, t0+0.3, 0.9, SEL.raised);
  const maxS = STUDENTS[0].amount;
  return <div style={{display:'grid', gridTemplateColumns:'minmax(0,7fr) minmax(0,9fr)', gap:96}}>
    <div>
      <div style={ev(T, t0+0.1, 0.4)}>
        <div style={{fontSize:16, fontWeight:500, color:MUTE, display:'flex', alignItems:'center', gap:8}}><span style={{fontSize:20, lineHeight:1}}>←</span> Volver a salones</div>
        <div style={{marginTop:44, display:'flex', alignItems:'center', gap:14}}><div style={{width:8, height:8, borderRadius:4, background:SEL.color}}/><Section>{SEL.label} · Junior School</Section></div>
        <div style={{marginTop:10, fontSize:84, fontWeight:600, letterSpacing:'-0.05em', lineHeight:1}}>Salón {SEL.code}</div>
      </div>
      <div style={{marginTop:56, ...ev(T, t0+0.22, 0.4)}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap:32}}>
          <div><Section>Lleva</Section><div data-anchor="fi-lleva" style={{display:'inline-block'}}><Big size={92}>{cop(raised)}</Big></div></div>
          <div style={{textAlign:'right'}}><Section>Objetivo</Section><div style={{fontFamily:FM, fontSize:34, marginTop:14, color:'rgba(11,18,32,0.8)', lineHeight:1}}>{cop(SEL.goal)}</div></div>
        </div>
        <Bar pct={pct} h={7} mt={28}/>
        <div style={{marginTop:12, display:'flex', justifyContent:'space-between', fontFamily:FM, fontSize:16, color:MUTE}}><div>{Math.round(pct)} % del objetivo</div><div>Faltan {cop(SEL.goal - SEL.raised)}</div></div>
      </div>
      <div style={{marginTop:64, ...ev(T, t0+1.2, 0.4)}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}><div style={{fontSize:30, fontWeight:600, letterSpacing:'-0.04em'}}>En qué se ha gastado</div><div style={{fontFamily:FM, fontSize:18, color:MUTE}}>{cop(roomSpent)}</div></div>
        {ROOM_SPENT.map((e, i) => { const p = MOTION.draw(T, t0+1.4+i*0.1, 0.7, Math.round(e[1]/ROOM_SPENT[0][1]*100)); return <div key={e[0]} style={{padding:'16px 0', borderBottom: '1px solid ' + LINE, ...ev(T, t0+1.3+i*0.08, 0.35)}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}><div data-anchor={e[0] === 'Pizza' ? 'fi-pizza' : null} style={{fontSize:20, fontWeight:500}}>{e[0]}</div><div style={{fontFamily:FM, fontSize:18}}>{cop(e[1])}</div></div>
          <Bar pct={p} h={4} mt={10}/>
        </div>; })}
        <div style={{marginTop:18, display:'flex', justifyContent:'space-between', fontFamily:FM, fontSize:16, color:MUTE, ...ev(T, t0+1.8, 0.35)}}><div>Disponible del salón</div><div data-anchor="fi-disp" style={{color:INK}}>{cop(SEL.raised - roomSpent)}</div></div>
      </div>
    </div>
    <div style={ev(T, t0+0.5, 0.4)}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}><div style={{fontSize:30, fontWeight:600, letterSpacing:'-0.04em'}}>Aportes por estudiante</div><div style={{fontFamily:FM, fontSize:16, color:MUTE}}>{STUDENTS.length} estudiantes</div></div>
      <div style={{marginTop:18, borderBottom:'1px solid rgba(11,18,32,0.1)'}}/>
      {STUDENTS.map((s, i) => { const start = t0+0.6+i*0.04; const p = MOTION.draw(T, start, 0.6, Math.round(s.amount/maxS*100)); return <div key={s.name} style={{display:'grid', gridTemplateColumns:'34px 200px minmax(0,1fr) 120px', gap:'0 20px', alignItems:'center', height:60, borderBottom: '1px solid ' + LINE, ...ev(T, start-0.15, 0.4)}}>
        <div style={{fontFamily:FM, fontSize:14, color:FAINT}}>{String(i+1).padStart(2,'0')}</div>
        <div data-anchor={i===0 ? 'fi-st0' : null} style={{fontSize:20, fontWeight:500}}>{s.name}</div>
        <Bar pct={p} h={4} mt={0}/>
        <div style={{fontFamily:FM, fontSize:18, textAlign:'right'}}>{cop(s.amount)}</div>
      </div>; })}
    </div>
  </div>;
}

function Control({T, C}) {
  const t0 = C.Control;
  const spentPct = MOTION.draw(T, t0+0.6, 0.9, Math.round(spent/totalRaised*100));
  const avail = MOTION.count(T, t0+0.35, 1.0, totalRaised - spent);
  const stateColor = { Realizado: FAINT, 'En curso': INK, Programado: 'rgba(11,18,32,0.6)' };
  return <>
    <div style={{textAlign:'center', ...ev(T, t0+0.3, 0.4)}}>
      <Label>Disponible hoy</Label>
      <div data-anchor="ct-avail" style={{display:'inline-block'}}><Big>{cop(avail)}</Big></div>
    </div>
    <div style={{marginTop:44, maxWidth:880, marginLeft:'auto', marginRight:'auto', ...ev(T, t0+0.4, 0.4)}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
        <div><Label style={{fontSize:15}}>Recaudado</Label><div style={{fontFamily:FM, fontSize:32, marginTop:8, lineHeight:1}}>{cop(totalRaised)}</div></div>
        <div style={{textAlign:'right'}}><Label style={{fontSize:15}}>Gastado</Label><div style={{fontFamily:FM, fontSize:32, marginTop:8, lineHeight:1, color:'rgba(11,18,32,0.65)'}}>{cop(spent)}</div></div>
      </div>
      <div data-anchor="ct-bar"><Bar pct={spentPct} h={6} mt={20}/></div>
      <div style={{marginTop:12, textAlign:'center', fontFamily:FM, fontSize:15, color:MUTE}}>{Math.round(spentPct)} % del recaudo ya ejecutado · 2 de 27 salones en meta</div>
    </div>
    <div style={{marginTop:72, display:'grid', gridTemplateColumns:'1fr 1fr', gap:120}}>
      <div style={ev(T, t0+0.8, 0.4)}>
        <div style={{fontSize:30, fontWeight:600, letterSpacing:'-0.04em', lineHeight:1.1}}>En qué se está gastando</div>
        <div style={{marginTop:20}}>{EXPENSES.map((e, i) => { const p = MOTION.draw(T, t0+1.0+i*0.08, 0.7, Math.round(e[1]/EXPENSES[0][1]*100)); return <div key={e[0]} style={{padding:'14px 0', borderBottom: '1px solid ' + LINE, ...ev(T, t0+0.9+i*0.07, 0.35)}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}><div data-anchor={i===0 ? 'ct-top' : null} style={{fontSize:20, fontWeight:500}}>{e[0]}</div><div style={{fontFamily:FM, fontSize:18}}>{cop(e[1])}</div></div>
          <Bar pct={p} h={4} mt={10}/>
        </div>; })}</div>
      </div>
      <div style={ev(T, t0+1.2, 0.4)}>
        <div style={{fontSize:30, fontWeight:600, letterSpacing:'-0.04em', lineHeight:1.1}}>Eventos</div>
        <div style={{marginTop:20}}>{EVENTS.map((e, i) => <div key={e[1]} style={{display:'grid', gridTemplateColumns:'86px minmax(0,1fr) auto', gap:'0 18px', alignItems:'center', height:62, borderBottom: '1px solid ' + LINE, ...ev(T, t0+1.3+i*0.06, 0.35)}}>
          <div style={{fontFamily:FM, fontSize:15, color:MUTE}}>{e[0]}</div><div style={{fontSize:20, fontWeight:500}}>{e[1]}</div><div data-anchor={e[2]==='En curso' ? 'ct-live' : null} style={{fontSize:13, letterSpacing:'0.06em', textTransform:'uppercase', color:stateColor[e[2]]}}>{e[2]}</div>
        </div>)}</div>
      </div>
    </div>
  </>;
}

function Votaciones({T, C, voteAt}) {
  const t0 = C.Votaciones, dt = Math.max(0, T - (t0 + 1.5));
  const voted = T >= voteAt;
  const hover = MOTION.prog(T, voteAt - 0.35, 0.25, Easing.easeOutCubic);
  const pressed = T >= voteAt && T < voteAt + 0.18;
  const tag = (txt, dark) => <div style={{padding:'3px 8px', borderRadius:6, background: dark ? INK : 'rgba(11,18,32,0.08)', color: dark ? '#fff' : INK, fontSize:11, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', lineHeight:1.2, whiteSpace:'nowrap'}}>{txt}</div>;
  return <>
    <div style={{textAlign:'center', ...ev(T, t0, 0.4)}}>
      <Label>Votaciones del colegio</Label>
      <div style={{marginTop:10, fontSize:64, fontWeight:600, letterSpacing:'-0.05em', lineHeight:1, ...wipe(T, t0+0.05, 0.5)}}>¿Qué quieres para el colegio?</div>
      <div style={{marginTop:18, fontFamily:FM, fontSize:16, color:MUTE}}>1 voto por estudiante en cada encuesta · Resultados en vivo</div>
    </div>
    <div style={{marginTop:52, display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap:64}}>
      {POLLS.map((p, pi) => {
        const counts = p.base.map((b, i) => b + Math.floor(p.rate[i] * dt * 2) + (pi === VOTE[0] && i === VOTE[1] && voted ? 1 : 0));
        const total = counts.reduce((a, b) => a + b, 0);
        const lead = counts.indexOf(Math.max(...counts));
        const draw = MOTION.prog(T, t0 + 0.6 + pi * 0.1, 0.8);
        const live = 0.45 + 0.55 * (0.5 + 0.5 * Math.cos(T * 4));
        return <div key={p.tag} style={{border:'1px solid rgba(11,18,32,0.1)', borderRadius:18, padding:36, background:'#fff', ...ev(T, t0 + 0.3 + pi * 0.08, 0.4)}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:16}}>
            <Section>{p.tag}</Section>
            <div data-anchor={pi === 1 ? 'vot-close-1' : null} style={{fontFamily:FM, fontSize:15, color:MUTE, whiteSpace:'nowrap'}}>{p.close}</div>
          </div>
          <div style={{marginTop:16, fontSize:34, fontWeight:600, letterSpacing:'-0.04em', lineHeight:1.15, textWrap:'balance', minHeight:78}}>{p.q}</div>
          <div style={{marginTop:28, display:'flex', flexDirection:'column', gap:12}}>
            {p.opts.map((o, i) => { const pct = counts[i] / total * 100; const isVote = pi === VOTE[0] && i === VOTE[1]; const mine = isVote && voted; const isLead = i === lead;
              const anchor = isVote ? 'vot-opt' : pi === 1 && i === 1 ? 'vot-nav-1' : null;
              return <div key={o} data-anchor={anchor} style={{position:'relative', height:64, borderRadius:12, overflow:'hidden', boxShadow: mine ? 'inset 0 0 0 2px ' + INK : 'inset 0 0 0 1px rgba(11,18,32,0.12)', background: isVote && !voted ? 'rgba(11,18,32,' + (pressed ? 0.08 : 0.04 * hover) + ')' : 'transparent', transform: pressed && isVote ? 'scale(0.985)' : 'none'}}>
                <div style={{position:'absolute', left:0, top:0, bottom:0, width: (pct * draw) + '%', background: isLead ? 'rgba(253,197,0,0.6)' : 'rgba(11,18,32,0.05)'}}/>
                <div style={{position:'relative', height:'100%', padding:'0 20px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12}}>
                  <div style={{display:'flex', alignItems:'center', gap:10, minWidth:0}}>
                    <div style={{fontSize:20, fontWeight: isLead ? 600 : 500, letterSpacing:'-0.02em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{o}</div>
                    {isLead && draw > 0.9 && tag('Va ganando', false)}
                    {mine && tag('Tu voto', true)}
                  </div>
                  <div style={{fontFamily:FM, fontSize:17, whiteSpace:'nowrap', opacity: draw}}>{Math.round(pct)} %</div>
                </div>
              </div>; })}
          </div>
          <div style={{marginTop:24, display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:15, color:MUTE}}>
            <div style={{display:'flex', alignItems:'center', gap:10}}><div style={{width:8, height:8, borderRadius:4, background:'#3E8E5E', opacity: live}}/>Resultados en vivo</div>
            <div data-anchor={pi === 2 ? 'vot-total-2' : null} style={{fontFamily:FM, fontSize:16, color:INK}}>{total} votos</div>
          </div>
        </div>; })}
    </div>
  </>;
}

// annotation: yellow label + hand-drawn arrow to an anchored UI element
function Callout({T, A, at, dur, a, pt='c', ox=0, oy=0, dx=0, dy=0, place='right', text, bend=0.22, w=380}) {
  const r = A[a]; if (!r || T < at || T > at + dur + 0.4) return null;
  const px = {l:0, c:0.5, r:1, t:0.5, b:0.5}[pt], py = {l:0.5, c:0.5, r:0.5, t:0, b:1}[pt];
  const tx = r.x + r.w * px + ox, ty = r.y + r.h * py + oy;
  const sx = tx + dx, sy = ty + dy;
  const L = Math.hypot(tx - sx, ty - sy) || 1, ux = (tx - sx) / L, uy = (ty - sy) / L;
  const ex = tx - ux * 10, ey = ty - uy * 10;
  const cx = (sx + ex) / 2 - uy * bend * L, cy = (sy + ey) / 2 + ux * bend * L;
  const drawP = MOTION.prog(T, at + 0.08, 0.35);
  const pop = MOTION.prog(T, at, 0.35, Easing.easeOutBack);
  const out = 1 - MOTION.prog(T, at + dur, 0.25, Easing.easeOutCubic);
  const ang = Math.atan2(ey - cy, ex - cx), hl = 18;
  const h1 = [ex + Math.cos(ang + Math.PI - 0.5) * hl, ey + Math.sin(ang + Math.PI - 0.5) * hl];
  const h2 = [ex + Math.cos(ang + Math.PI + 0.5) * hl, ey + Math.sin(ang + Math.PI + 0.5) * hl];
  const head = MOTION.prog(T, at + 0.4, 0.1);
  const tf = {right:'translate(14px,-50%)', left:'translate(calc(-100% - 14px),-50%)', above:'translate(-50%,calc(-100% - 14px))', below:'translate(-50%,14px)'}[place];
  return <div style={{position:'absolute', inset:0, pointerEvents:'none', opacity: out}}>
    <svg width={W} height={H} style={{position:'absolute', left:0, top:0, overflow:'visible'}}>
      <path d={'M' + sx + ' ' + sy + ' Q' + cx + ' ' + cy + ' ' + ex + ' ' + ey} pathLength="1" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" strokeDasharray="1" strokeDashoffset={1 - drawP}/>
      <path d={'M' + h1[0] + ' ' + h1[1] + ' L' + ex + ' ' + ey + ' L' + h2[0] + ' ' + h2[1]} fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity={head}/>
    </svg>
    <div style={{position:'absolute', left:sx, top:sy, transform: tf}}>
      <div style={{width:'max-content', maxWidth:w, padding:'12px 18px', borderRadius:12, background:YEL, color:INK, fontFamily:F, fontSize:30, fontWeight:600, letterSpacing:'-0.03em', lineHeight:1.15, textWrap:'balance', opacity: Math.min(1, pop), transform:'scale(' + (0.8 + 0.2 * pop) + ') rotate(' + (-5 * (1 - Math.min(1, pop))) + 'deg)'}}>{text}</div>
    </div>
  </div>;
}

function Cursor({x, y, opacity, pressed, ripple}) {
  return <div style={{position:'absolute', left:x, top:y, opacity, pointerEvents:'none', zIndex:6}}>
    <div style={{position:'absolute', left:2, top:2, width:64, height:64, marginLeft:-32, marginTop:-32, borderRadius:32, border: '2px solid ' + INK, opacity: (1-ripple)*0.6, transform: 'scale(' + (0.2 + ripple*0.8) + ')'}}/>
    <div style={{transform: 'scale(' + (pressed?0.8:1) + ')', transformOrigin:'2px 2px'}}>
      <svg width="30" height="34" viewBox="0 0 26 30"><path d="M3 2 L3 24 L9 18 L14 28 L18 26 L13 16 L21 16 Z" fill={INK} stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/></svg>
    </div>
  </div>;
}

function Piece() {
  const { T, CUES: C } = useComposition();
  const rowRef = useRef(null), screenRef = useRef(null), brandRef = useRef(null);
  const tabRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const [A, setA] = useState({});
  const [brandW, setBrandW] = useState(170);
  useLayoutEffect(() => {
    const measure = () => {
      const sc = screenRef.current; if (!sc) return; const out = {};
      sc.querySelectorAll('[data-anchor]').forEach(el => { let x = 0, y = 0, n = el; while (n && n !== sc) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; } out[el.getAttribute('data-anchor')] = {x, y, w: el.offsetWidth, h: el.offsetHeight}; });
      setA(out); if (brandRef.current) setBrandW(brandRef.current.offsetWidth);
    };
    measure(); if (document.fonts) document.fonts.ready.then(measure); const id = setTimeout(measure, 900); return () => clearTimeout(id);
  }, []);
  const pt = A['sal-7C'] || {x: 1040, y: 640, w: 560, h: 70};
  const tabPos = TABS.map((n, i) => A['tab-' + i] || {x: 1500 + i * 100, w: 70});
  const clickAt = C.Click + 0.65;
  const cx = pt.x + pt.w * 0.45, cy = pt.y + pt.h * 0.5;

  // camera: [t, scale, focusX, focusY] — continuous, no jump cuts
  const cam = MOTION.cam(T, [
    [0, 1.0, W/2, H/2],
    [C.Leaderboard + 0.9, 1.0, W/2, H/2], [C.Leaderboard + 1.5, 1.4, W/2 + 40, 560], [C.Leaderboard + 2.4, 1.4, W/2 + 40, 560], [C.Leaderboard + 2.9, 1.0, W/2, H/2],
    [C.Salones + 0.5, 1.0, W/2, H/2], [C.Salones + 0.95, 1.5, W/2, 230], [C.Salones + 2.2, 1.5, W/2, 230], [C.Salones + 2.65, 1.0, W/2, H/2],
    [C.Click, 1.0, W/2, H/2], [C.Click + 0.3, 1.35, W/2, 640], [clickAt - 0.08, 1.55, cx, cy], [clickAt + 0.35, 2.2, cx, cy],
    [C.Ficha + 0.2, 1.7, 380, 320], [C.Ficha + 0.9, 1.0, W/2, H/2],
    [C.Control + 0.5, 1.0, W/2, H/2], [C.Control + 0.95, 1.5, W/2, 230], [C.Control + 2.3, 1.5, W/2, 230], [C.Control + 2.75, 1.0, W/2, H/2],
    [C.Votaciones + 4.1, 1.0, W/2, H/2], [C.Votaciones + 4.6, 1.18, 700, 620], [C.Votaciones + 6.9, 1.18, 700, 620], [C.Votaciones + 7.3, 1.0, W/2, H/2],
  ]);
  const punch = (t) => T >= t && T < t + 0.45 ? Math.sin(Math.PI * (T - t) / 0.45) : 0;
  const s = cam[1] * (1 + 0.06 * Math.max(punch(C.Salones + 1.3), punch(C.Ficha + 1.15), punch(C.Control + 1.3), punch(clickAt), punch(C.Votaciones + 5.0), punch(C.Leaderboard + 1.6), punch(C.Outro + 0.7)));
  const hw = W / 2 / s, hh = H / 2 / s;
  const fx = clamp(cam[2], hw, W - hw), fy = clamp(cam[3], hh, H - hh);
  const tx = (W/2 - fx) * s, ty = (H/2 - fy) * s;

  // cursor: enters fast, decelerates onto the row, clicks, fades as the row lifts
  const curIn = animate({from:0, to:1, start:C.Click + 0.05, end:C.Click + 0.2, ease:Easing.easeOutCubic})(T);
  const mv = Easing.easeOutQuart(clamp((T - C.Click - 0.05) / 0.55, 0, 1));
  const curX = cx + 460 * (1 - mv), curY = cy + 300 * (1 - mv);
  const curOut = 1 - MOTION.prog(T, clickAt + 0.15, 0.25, Easing.easeOutCubic);
  const pressed = T >= clickAt && T < clickAt + 0.18;
  const ripple = MOTION.prog(T, clickAt, 0.45, Easing.easeOutCubic);
  const rippleOn = T >= clickAt && T < clickAt + 0.45 ? ripple : 1;
  // vote cursor
  const voteAt = C.Votaciones + 5.0;
  const vo = A['vot-opt'] || {x: 100, y: 760, w: 490, h: 64};
  const vx = vo.x + vo.w * 0.4, vy = vo.y + vo.h * 0.5;
  const vIn = animate({from:0, to:1, start:C.Votaciones + 4.4, end:C.Votaciones + 4.55, ease:Easing.easeOutCubic})(T);
  const vmv = Easing.easeOutQuart(clamp((T - C.Votaciones - 4.4) / 0.55, 0, 1));
  const vOut = 1 - MOTION.prog(T, voteAt + 0.5, 0.3, Easing.easeOutCubic);
  const vPressed = T >= voteAt && T < voteAt + 0.18;
  const vRip = T >= voteAt && T < voteAt + 0.45 ? MOTION.prog(T, voteAt, 0.45, Easing.easeOutCubic) : 1;
  // intro subline
  const subIn = 1 - MOTION.prog(T, C.Leaderboard - 0.7, 0.25, Easing.easeOutCubic);
  const LB = C.Leaderboard, S = C.Salones, Fi = C.Ficha, Ct = C.Control, V = C.Votaciones;
  const CALLOUTS = [
    {at:LB+1.6, dur:1.7, a:'lb-top', pt:'l', ox:-8, dx:-190, dy:-190, place:'left', bend:-0.25, text:'El salón con más recaudo de cada sección.'},
    {at:LB+3.5, dur:1.4, a:'tab-1', pt:'b', oy:6, dx:-40, dy:90, place:'below', w:340, text:'El ranking se actualiza con cada aporte.'},
    {at:S+1.0, dur:1.5, a:'sal-total', pt:'r', ox:16, dx:100, dy:60, place:'right', w:360, text:'Total recaudado por los 27 salones.'},
    {at:S+2.9, dur:1.5, a:'sal-dot', pt:'c', ox:-2, dx:220, dy:-230, place:'above', w:380, bend:0.3, text:'Rojo: el salón va por debajo del 40 % de su meta.'},
    {at:S+4.7, dur:1.4, a:'sal-7C', pt:'r', ox:4, dx:40, dy:-300, place:'right', w:360, bend:0.1, text:'Cada salón abre su ficha con el detalle.'},
    {at:Fi+1.3, dur:1.4, a:'fi-lleva', pt:'r', ox:14, dx:130, dy:-110, place:'right', w:300, text:'Lo recaudado por el salón hasta hoy.'},
    {at:Fi+3.0, dur:1.4, a:'fi-st0', pt:'l', ox:-10, dx:-70, dy:-50, place:'left', w:360, text:'El aporte de cada estudiante.'},
    {at:Fi+4.7, dur:1.2, a:'fi-pizza', pt:'r', ox:12, dx:130, dy:10, place:'right', w:320, text:'Cada gasto del salón queda registrado.'},
    {at:Fi+6.1, dur:1.0, a:'fi-disp', pt:'b', oy:6, dx:-40, dy:80, place:'left', w:380, text:'Saldo disponible del salón.'},
    {at:Ct+1.0, dur:1.5, a:'ct-avail', pt:'r', ox:16, dx:110, dy:50, place:'right', w:340, text:'Saldo disponible de todo el colegio.'},
    {at:Ct+3.0, dur:1.4, a:'ct-top', pt:'t', oy:-6, dx:170, dy:-140, place:'above', w:380, text:'Desglose de gastos, de mayor a menor.'},
    {at:Ct+4.7, dur:1.4, a:'ct-live', pt:'t', oy:-6, dx:-90, dy:-170, place:'above', w:330, text:'Calendario de eventos y su estado.'},
    {at:V+0.9, dur:1.4, a:'tab-3', pt:'b', oy:6, dx:-70, dy:90, place:'below', w:340, text:'Nueva sección: votaciones de todo el colegio.'},
    {at:V+2.6, dur:1.4, a:'vot-close-1', pt:'t', oy:-6, dx:170, dy:-80, place:'right', w:380, text:'Varias encuestas abiertas, cada una con su fecha de cierre.'},
    {at:V+5.25, dur:1.5, a:'vot-opt', pt:'b', oy:4, dx:0, dy:150, place:'below', w:440, bend:0, text:'Cada estudiante vota una vez por encuesta.'},
    {at:V+7.2, dur:1.0, a:'vot-total-2', pt:'b', oy:6, dx:-70, dy:120, place:'left', w:380, text:'Resultados en vivo: cada voto queda a la vista.'},
  ];

  return <div style={{position:'absolute', inset:0, background:'#fff', overflow:'hidden'}}>
    <div style={{position:'absolute', inset:0, transform: 'translate(' + tx + 'px, ' + ty + 'px) scale(' + s + ')', transformOrigin:'center center'}}>
      <div ref={screenRef} style={{position:'absolute', inset:0, background:'#fff'}}>
        <Header T={T} C={C} tabRefs={tabRefs} tabPos={tabPos} brandRef={brandRef} brandW={brandW}/>
        <Shot from={C.Leaderboard - 0.55} to={C.Salones}><Screen style={move(T, null, C.Salones)}><Leaderboard T={T} C={C}/></Screen></Shot>
        <Shot from={C.Ficha} to={C.Control}><Screen style={move(T, null, C.Control)}><Ficha T={T} C={C}/></Screen></Shot>
        <Shot from={C.Control} to={C.Votaciones}><Screen style={move(T, C.Control, C.Votaciones)}><Control T={T} C={C}/></Screen></Shot>
        <Shot from={C.Votaciones} to={C.Outro}><Screen style={move(T, C.Votaciones, C.Outro)}><Votaciones T={T} C={C} voteAt={voteAt}/></Screen></Shot>
        <div style={{position:'absolute', left:0, right:0, top:H/2 + 70, textAlign:'center', fontFamily:F, fontSize:34, fontWeight:500, letterSpacing:'-0.03em', color:'rgba(11,18,32,0.62)', opacity: subIn, zIndex:5, ...wipe(T, C.Intro + 0.55, 0.5)}}>La plata del colegio, a la vista de todos.</div>
        <Shot from={C.Outro}><div style={{position:'absolute', left:0, right:0, top:H/2 + 70, textAlign:'center', zIndex:5, opacity: 1 - MOTION.prog(T, C.Outro + 3.1, 0.4)}}>
          <div style={{fontFamily:F, fontSize:34, fontWeight:500, letterSpacing:'-0.03em', color:'rgba(11,18,32,0.62)', ...wipe(T, C.Outro + 0.7, 0.5)}}>La plata del colegio, a la vista de todos.</div>
          <div style={{marginTop:28, fontFamily:FM, fontSize:18, letterSpacing:'0.04em', color:MUTE, ...wipe(T, C.Outro + 1.0, 0.5)}}>Leaderboard · Salones · Control · Votaciones</div>
        </div></Shot>
        <Shot from={C.Salones} to={C.Ficha + 0.6}><Screen style={move(T, C.Salones, null)}><Salones T={T} C={C} rowRef={rowRef} clickAt={clickAt} pt={pt}/></Screen></Shot>
        <Cursor x={curX} y={curY} opacity={curIn * curOut} pressed={pressed} ripple={rippleOn}/>
        <Cursor x={vx + 460 * (1 - vmv)} y={vy + 300 * (1 - vmv)} opacity={vIn * vOut} pressed={vPressed} ripple={vRip}/>
        <Burst T={T} at={C.Leaderboard + 1.6} x={(A['lb-top'] || {x: 700, y: 330, w: 60, h: 30}).x + 30} y={(A['lb-top'] || {x: 700, y: 330, w: 60, h: 30}).y + 15}/>
        <Burst T={T} at={voteAt} x={vx} y={vy} n={28}/>
        <Burst T={T} at={C.Outro + 0.7} x={W/2} y={H/2} n={34}/>
        <div style={{position:'absolute', inset:0, zIndex:7, pointerEvents:'none'}}>{CALLOUTS.map((c, i) => <Callout key={i} T={T} A={A} {...c}/>)}</div>
      </div>
    </div>
    <Curtain T={T} at={C.Salones} n="02" label="Salones" sub="Cuánto lleva cada salón"/>
    <Curtain T={T} at={C.Control} n="03" label="Control" sub="Las cuentas de todo el colegio"/>
    <Curtain T={T} at={C.Votaciones} n="04" label="Votaciones" sub="El colegio decide"/>
    <Curtain T={T} at={C.Outro}/>
    <Hook T={T} C={C}/>
  </div>;
}

function TrailerWowApp() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  return <div style={{width:'100%', height:'100%'}}>
    <CompositionStage width={W} height={H} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg="#fff"><Piece/></CompositionStage>
    <TweaksPanel><TweakSection label="Editor"/><TweakToggle label="Motion editor" value={t.motionEditor} onChange={(v) => setTweak('motionEditor', v)}/></TweaksPanel>
  </div>;
}
window.TrailerWowApp = TrailerWowApp;
