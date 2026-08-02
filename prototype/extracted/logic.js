class Component extends DCLogic {
  state = {
    phase:'login', ob:0,
    ans:{ sexo:'homem', idade:29, peso:78, altura:179, objetivo:'massa', nivel:'intermediario', dias:5, lesoes:[], restricoes:[] },
    analyzePct:0, analyzeMsg:'', tab:'home',
    detail:null, sets:{}, meals:[], water:0,
    meta:{ kcal:2600, p:180, c:300, g:70, water:3000 },
    activeDays:{},
    timerSec:0, timerRun:false, restSec:0, restTotal:0, restRun:false,
    overlay:null, foodTab:'voz', notif:{ treino:true, dieta:true, avaliacao:false }, theme:'dark',
    brand:'iron', adminTab:'alunos', adminToast:0, adminSel:'A', adminStudent:null,
    customName:'', customLogo:null, customColor:'#2E7BFF', customText:'#FFFFFF',
    mealsByDay:{}, food:{ type:'almoco', method:'buscar', baseId:null, qty:150, kcal:0, p:0, c:0, g:0 },
    workoutDays:{}, dayView:null,
    loads:{}, loadDraft:{}, plans:null,
    notifs:[
      { id:1, kind:'novo', name:'Bruno Nunes', ini:'BN', txt:'Novo aluno — monte o primeiro treino', time:'há 2h', done:false },
      { id:2, kind:'troca', name:'Rafael Dias', ini:'RD', txt:'Pediu troca de treino (dor no joelho)', time:'há 5h', done:false },
      { id:3, kind:'novo', name:'Ana Prado', ini:'AP', txt:'Novo aluno — monte o primeiro treino', time:'ontem', done:false },
      { id:4, kind:'aval', name:'Marina Costa', ini:'MC', txt:'Reavaliação mensal disponível', time:'ontem', done:false },
    ],
  };

  brands = {
    iron:   { name:'Iron House', ini:'IH', trainer:'Prof. Marcos', ac:'#FF6B2C', acR:'255,107,44', acT:'#0A0B0A', desc:'Laranja · estilo box/crossfit' },
    smart:  { name:'SmartFit',   ini:'SF', trainer:'Prof. Renata', ac:'#FFE100', acR:'255,225,0',  acT:'#0A0B0A', desc:'Amarelo e preto' },
    gaviao: { name:'Gaviões',    ini:'GV', trainer:'Prof. Douglas',ac:'#E4022E', acR:'228,2,46',   acT:'#FFFFFF', desc:'Vermelho e branco' },
  };

  frases=['Disciplina vence motivação.','Um dia de cada vez.','Constância é o atalho.'];

  defaultPlans = [
    { id:'A', nome:'Peito & Tríceps', dia:'Segunda', foco:'Empurrar', dur:'55 min', ex:[
      {n:'Supino reto com halteres',s:4,r:'8–10'},{n:'Supino inclinado máquina',s:3,r:'10'},{n:'Crucifixo na polia',s:3,r:'12'},{n:'Tríceps corda',s:4,r:'12–15'},{n:'Tríceps francês',s:3,r:'12'} ]},
    { id:'B', nome:'Costas & Bíceps', dia:'Terça', foco:'Puxar', dur:'55 min', ex:[
      {n:'Puxada frente aberta',s:4,r:'10'},{n:'Remada curvada',s:4,r:'10'},{n:'Remada baixa',s:3,r:'12'},{n:'Rosca direta barra',s:3,r:'12'},{n:'Rosca martelo',s:3,r:'12'} ]},
    { id:'C', nome:'Pernas completo', dia:'Quarta', foco:'Inferiores', dur:'60 min', ex:[
      {n:'Agachamento livre',s:4,r:'8–10'},{n:'Leg press 45°',s:4,r:'12'},{n:'Cadeira extensora',s:3,r:'15'},{n:'Mesa flexora',s:3,r:'12'},{n:'Panturrilha em pé',s:4,r:'15–20'} ]},
    { id:'D', nome:'Ombro & Abdômen', dia:'Quinta', foco:'Empurrar', dur:'50 min', ombro:true, ex:[
      {n:'Desenvolvimento máquina',s:4,r:'10',ombro:true},{n:'Elevação lateral',s:4,r:'12',ombro:true},{n:'Elevação frontal',s:3,r:'12'},{n:'Abdominal supra',s:4,r:'20'},{n:'Prancha',s:3,r:'40s'} ]},
    { id:'E', nome:'Full body / Glúteo', dia:'Sexta', foco:'Geral', dur:'55 min', ex:[
      {n:'Levantamento terra',s:4,r:'8'},{n:'Afundo com halteres',s:3,r:'12'},{n:'Elevação pélvica',s:4,r:'12'},{n:'Remada máquina',s:3,r:'12'},{n:'Rosca inversa',s:3,r:'15'} ]},
    { id:'F', nome:'Livre (a definir)', dia:'—', foco:'—', dur:'—', ex:[] },
  ];

  foods = [
    { nome:'Ovos mexidos (3 un)', kcal:230, p:19, c:2, g:16 },
    { nome:'Peito de frango (150g)', kcal:248, p:46, c:0, g:5 },
    { nome:'Arroz branco (150g)', kcal:195, p:4, c:42, g:0 },
    { nome:'Whey protein (1 dose)', kcal:120, p:24, c:3, g:1 },
    { nome:'Banana + pasta de amendoim', kcal:270, p:8, c:32, g:12 },
    { nome:'Batata doce (200g)', kcal:172, p:3, c:40, g:0 },
  ];

  // per-100g database for the elaborate add-food form
  foodsDB = [
    { id:'ovo', n:'Ovo inteiro', per:{kcal:155,p:13,c:1.1,g:11}, def:100 },
    { id:'frango', n:'Peito de frango grelhado', per:{kcal:165,p:31,c:0,g:3.6}, def:150 },
    { id:'patinho', n:'Patinho moído', per:{kcal:187,p:26,c:0,g:9}, def:120 },
    { id:'arroz', n:'Arroz branco cozido', per:{kcal:130,p:2.7,c:28,g:0.3}, def:150 },
    { id:'batata', n:'Batata doce cozida', per:{kcal:86,p:1.6,c:20,g:0.1}, def:200 },
    { id:'feijao', n:'Feijão cozido', per:{kcal:76,p:4.8,c:14,g:0.5}, def:100 },
    { id:'aveia', n:'Aveia em flocos', per:{kcal:389,p:17,c:66,g:7}, def:40 },
    { id:'pao', n:'Pão integral', per:{kcal:250,p:9,c:45,g:3}, def:50 },
    { id:'banana', n:'Banana', per:{kcal:89,p:1.1,c:23,g:0.3}, def:120 },
    { id:'whey', n:'Whey protein (pó)', per:{kcal:400,p:80,c:8,g:5}, def:30 },
    { id:'amendoim', n:'Pasta de amendoim', per:{kcal:588,p:25,c:20,g:50}, def:20 },
    { id:'leite', n:'Leite desnatado', per:{kcal:35,p:3.4,c:5,g:0.1}, def:200 },
  ];
  mealTypes = [['cafe','Café da manhã'],['almoco','Almoço'],['lanche','Lanche'],['jantar','Jantar'],['ceia','Ceia']];

  get WK(){ return this.state.plans || this.defaultPlans; }

  componentDidMount(){
    try{ const s=JSON.parse(localStorage.getItem('wl_state')||'null'); if(s) this.setState(s); }catch(e){}
    this.setState(s=>{ const activeDays={...(s.activeDays||{})}; activeDays[this.dayKey()]=true;
      let plans = s.plans || JSON.parse(JSON.stringify(this.defaultPlans));
      if(!plans.find(p=>p.id==='F')) plans=[...plans,{id:'F', nome:'Livre (a definir)', dia:'—', foco:'—', dur:'—', ex:[]}];
      return {activeDays, plans}; }, ()=>this.persist({}));
    this._tick=setInterval(()=>{ this.setState(s=>{ const o={}; if(s.timerRun) o.timerSec=s.timerSec+1; if(s.restRun){ const r=Math.max(0,s.restSec-1); o.restSec=r; if(r===0) o.restRun=false; } return o; }); },1000);
  }
  componentWillUnmount(){ clearInterval(this._tick); clearTimeout(this._an); clearTimeout(this._tst); }

  dayKey(d){ d=d||new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
  persist(extra){ try{ const st={...this.state,...extra}; const keep={ sets:st.sets,meals:st.meals,water:st.water,meta:st.meta,ans:st.ans,activeDays:st.activeDays,notif:st.notif,brand:st.brand,theme:st.theme,mealsByDay:st.mealsByDay,loads:st.loads,plans:st.plans,workoutDays:st.workoutDays,customName:st.customName,customLogo:st.customLogo,customColor:st.customColor,customText:st.customText,notifs:st.notifs }; localStorage.setItem('wl_state', JSON.stringify(keep)); }catch(e){} }
  toggleTheme=()=>this.setState(s=>{ const theme=s.theme==='light'?'dark':'light'; this.persist({theme}); return {theme}; });

  theme(){ const s=this.state;
    if(s.brand==='custom'){ const name=(s.customName||'Sua Academia').trim(); const ac=s.customColor||'#2E7BFF';
      const words=name.split(/\s+/).filter(Boolean); const ini=((words[0]||'S')[0]+((words[1]||words[0]||'A')[0]||'')).toUpperCase();
      return { name, ini, trainer:'Prof. da casa', ac, acR:this.hexRgb(ac), acT:s.customText||'#FFFFFF', logo:s.customLogo||null }; }
    const b=this.brands[s.brand]||this.brands.iron;
    return { name:b.name, ini:b.ini, trainer:b.trainer, ac:b.ac, acR:b.acR, acT:b.acT, logo:null }; }
  applyLogo=(e)=>{ const f=e&&e.target&&e.target.files&&e.target.files[0]; if(!f) return; const rd=new FileReader(); rd.onload=()=>{ this.setState({customLogo:rd.result, brand:'custom'}); this.persist({customLogo:rd.result, brand:'custom'}); }; rd.readAsDataURL(f); };
  applyName=()=>{ const n=(this._draftName!=null?this._draftName:this.state.customName); this.setState({customName:n, brand:'custom'}); this.persist({customName:n, brand:'custom'}); };
  setCustomColor=(c,t)=>{ this.setState({customColor:c, customText:t, brand:'custom'}); this.persist({customColor:c, customText:t, brand:'custom'}); };
  hexRgb(h){ h=h.replace('#',''); if(h.length===3)h=h.split('').map(x=>x+x).join(''); const n=parseInt(h,16); return (n>>16)+','+((n>>8)&255)+','+(n&255); }

  // metas (Mifflin-St Jeor)
  computeMeta(a){ a=a||this.state.ans; const kg=a.peso,cm=a.altura,age=a.idade;
    const bmr=Math.round(a.sexo==='mulher'?(10*kg+6.25*cm-5*age-161):(10*kg+6.25*cm-5*age+5));
    const af=a.dias<=3?1.375:a.dias<=5?1.55:1.725; const tdee=Math.round(bmr*af);
    const adj=a.objetivo==='massa'?0.10:a.objetivo==='secar'?-0.18:0;
    const kcal=Math.round(tdee*(1+adj)/10)*10;
    const pPer=a.objetivo==='secar'?2.2:a.objetivo==='massa'?2.0:1.8;
    const p=Math.round(kg*pPer), g=Math.round(kg*0.8), c=Math.max(0,Math.round((kcal-p*4-g*9)/4));
    const water=Math.round((kg*35+(a.dias>=5?500:250))/250)*250;
    return { kcal,p,c,g,water, bmr,tdee, adjPct:Math.round(adj*100) }; }

  // onboarding
  startOnboarding=()=>this.setState({phase:'onboarding',ob:0});
  obPrev=()=>{ if(this.state.ob===0) this.setState({phase:'login'}); else this.setState(s=>({ob:s.ob-1})); };
  obNext=()=>{ if(this.state.ob>=6) this.startAnalyze(); else this.setState(s=>({ob:s.ob+1})); };
  setAns=(k,v)=>this.setState(s=>({ans:{...s.ans,[k]:v}}));
  bump=(k,d,min,max)=>this.setState(s=>{ const v=Math.max(min,Math.min(max,(s.ans[k]||0)+d)); return {ans:{...s.ans,[k]:v}}; });
  toggleMulti=(k,v)=>this.setState(s=>{ const arr=s.ans[k]||[]; const has=arr.includes(v); const na=v==='nenhuma'?(has?[]:['nenhuma']):(has?arr.filter(x=>x!==v):[...arr.filter(x=>x!=='nenhuma'),v]); return {ans:{...s.ans,[k]:na}}; });
  startAnalyze=()=>{ const meta=this.computeMeta(); this.setState({phase:'analyzing',analyzePct:0,meta}); this.persist({meta});
    const msgs=['Lendo sua avaliação...','Calculando gasto calórico...','Ajustando macros...','Preparando seu treino...'];
    let p=0; this._an=setInterval(()=>{ p+=Math.random()*18+26; if(p>=100){p=100;clearInterval(this._an); setTimeout(()=>this.setState({phase:'plan'}),450);} this.setState({analyzePct:Math.floor(p),analyzeMsg:msgs[Math.min(msgs.length-1,Math.floor(p/26))]}); },230); };
  enterApp=()=>{ this.setState({phase:'app',tab:'home'}); this.persist({}); };
  logout=()=>this.setState({phase:'login',overlay:null});

  // nav
  go=(t)=>this.setState({tab:t,overlay:null});
  openOv=(o)=>this.setState({overlay:o});
  closeOv=()=>this.setState({overlay:null});
  stop=(e)=>{ if(e&&e.stopPropagation) e.stopPropagation(); };

  openWorkout=(id)=>this.setState({detail:id, overlay:'workout', restSec:0, restTotal:0, restRun:false});
  toggleSet=(k)=>this.setState(s=>{ const on=!s.sets[k]; const sets={...s.sets,[k]:on}; const today=this.dayKey(); const activeDays={...s.activeDays}; const workoutDays={...s.workoutDays};
    if(on){ activeDays[today]=true; const pid=k.split('-')[0]; workoutDays[today]={...(workoutDays[today]||{}),[pid]:true}; }
    this.persist({sets,activeDays,workoutDays}); return {sets,activeDays,workoutDays}; });
  toggleTimer=()=>this.setState(s=>({timerRun:!s.timerRun}));
  resetTimer=()=>this.setState({timerSec:0,timerRun:false});
  setRest=(n)=>this.setState({restSec:n,restTotal:n,restRun:true});
  loadBump=(k,d)=>this.setState(s=>{ const base=(s.loadDraft[k]!=null)?s.loadDraft[k]:((s.loads[k]&&s.loads[k].length)?s.loads[k][s.loads[k].length-1].w:20); const v=Math.max(0,Math.min(500,Math.round((base+d)*2)/2)); return {loadDraft:{...s.loadDraft,[k]:v}}; });
  saveLoad=(k)=>this.setState(s=>{ const cur=(s.loadDraft[k]!=null)?s.loadDraft[k]:20; const arr=(s.loads[k]||[]).slice(); const today=this.dayKey(); const last=arr[arr.length-1]; if(last&&last.d===today){ arr[arr.length-1]={d:today,w:cur}; } else { arr.push({d:today,w:cur}); } const loads={...s.loads,[k]:arr}; const activeDays={...s.activeDays,[today]:true}; this.persist({loads,activeDays}); return {loads,activeDays}; });

  addWater=()=>this.setState(s=>{ const water=Math.min(s.meta.water,s.water+250); this.persist({water}); return {water}; });
  removeWater=()=>this.setState(s=>{ const water=Math.max(0,s.water-250); this.persist({water}); return {water}; });
  mealTypeNow(){ const h=new Date().getHours(); return h<10?'cafe':h<14?'almoco':h<17?'lanche':h<21?'jantar':'ceia'; }
  openFoodModal=()=>this.setState(s=>({overlay:'food', food:{...s.food, type:this.mealTypeNow(), method:'buscar', baseId:null, kcal:0, p:0, c:0, g:0}}));
  setFoodType=(t)=>this.setState(s=>({food:{...s.food,type:t}}));
  setFoodMethod=(m)=>this.setState(s=>({food:{...s.food, method:m, baseId:null, kcal:m==='buscar'?s.food.kcal:0, p:m==='buscar'?s.food.p:0, c:m==='buscar'?s.food.c:0, g:m==='buscar'?s.food.g:0}}));
  onMName=(e)=>{ this._mname=e.target.value; };
  foodManualAdd=()=>this.setState(s=>{ const nm=(this._mname||'').trim()||'Refeição'; const key=this.dayKey(); const rec={nome:nm, type:s.food.type, kcal:s.food.kcal, p:s.food.p, c:s.food.c, g:s.food.g}; const mealsByDay={...s.mealsByDay,[key]:(s.mealsByDay[key]||[]).concat([rec])}; const activeDays={...s.activeDays,[key]:true}; this._mname=''; this.persist({mealsByDay,activeDays}); return {mealsByDay,activeDays,overlay:null}; });
  audioSim=()=>{ this._mname='2 ovos e 1 banana'; this.setState(s=>({food:{...s.food, method:'escrever', kcal:399, p:27, c:25, g:22}})); };
  openDay=(key)=>this.setState({overlay:'dayView', dayView:key});
  compMacros(base,qty){ const f=base.per; return {kcal:Math.round(f.kcal*qty/100), p:Math.round(f.p*qty/100), c:Math.round(f.c*qty/100), g:Math.round(f.g*qty/100)}; }
  selectBase=(id)=>this.setState(s=>{ const base=this.foodsDB.find(x=>x.id===id); const qty=base.def; return {food:{...s.food,baseId:id,qty,...this.compMacros(base,qty)}}; });
  setFoodQty=(q)=>this.setState(s=>{ const base=this.foodsDB.find(x=>x.id===s.food.baseId); if(!base) return {}; return {food:{...s.food,qty:q,...this.compMacros(base,q)}}; });
  foodQtyBump=(d)=>this.setState(s=>{ const q=Math.max(0,Math.min(2000,s.food.qty+d)); const base=this.foodsDB.find(x=>x.id===s.food.baseId); return {food:{...s.food,qty:q,...(base?this.compMacros(base,q):{})}}; });
  foodMacroBump=(k,d)=>this.setState(s=>({food:{...s.food,[k]:Math.max(0,s.food[k]+d)}}));
  foodAdd=()=>this.setState(s=>{ const base=this.foodsDB.find(x=>x.id===s.food.baseId); if(!base) return {}; const key=this.dayKey(); const rec={nome:base.n+' ('+s.food.qty+'g)', type:s.food.type, qty:s.food.qty, kcal:s.food.kcal, p:s.food.p, c:s.food.c, g:s.food.g}; const mealsByDay={...s.mealsByDay,[key]:(s.mealsByDay[key]||[]).concat([rec])}; const activeDays={...s.activeDays,[key]:true}; this.persist({mealsByDay,activeDays}); return {mealsByDay, activeDays, overlay:null, food:{...s.food,baseId:null}}; });
  quickAddMeal=(r)=>this.setState(s=>{ const key=this.dayKey(); const rec={nome:r.nome, type:this.mealTypeNow(), kcal:r.kcal, p:r.p, c:r.c, g:r.g}; const mealsByDay={...s.mealsByDay,[key]:(s.mealsByDay[key]||[]).concat([rec])}; const activeDays={...s.activeDays,[key]:true}; this.persist({mealsByDay,activeDays}); return {mealsByDay,activeDays}; });
  removeMeal=(i)=>this.setState(s=>{ const key=this.dayKey(); const mealsByDay={...s.mealsByDay,[key]:(s.mealsByDay[key]||[]).filter((_,x)=>x!==i)}; this.persist({mealsByDay}); return {mealsByDay}; });
  bumpMeta=(k,d,min,max)=>this.setState(s=>{ const v=Math.max(min,Math.min(max,(s.meta[k]||0)+d)); const meta={...s.meta,[k]:v}; this.persist({meta}); return {meta}; });
  toggleNotif=(k)=>this.setState(s=>{ const notif={...s.notif,[k]:!s.notif[k]}; this.persist({notif}); return {notif}; });

  setBrand=(b)=>{ this.setState({brand:b}); this.persist({brand:b}); };
  setAdminTab=(t)=>this.setState({adminTab:t});
  setAdminSel=(id)=>this.setState({adminSel:id});
  openStudent=(a)=>this.setState({adminStudent:a});
  closeStudent=()=>this.setState({adminStudent:null});
  resolveNotif=(id)=>this.setState(s=>{ const notifs=s.notifs.map(n=>n.id===id?{...n,done:true}:n); this.persist({notifs}); return {notifs, adminToast:Date.now()}; }, ()=>{ clearTimeout(this._tst); this._tst=setTimeout(()=>this.setState({adminToast:0}),2100); });
  createPlan=()=>this.setState(s=>{ const plans=JSON.parse(JSON.stringify(s.plans||this.defaultPlans)); const letters='ABCDEFGHIJ'; const used=plans.map(p=>p.id); const id=letters.split('').find(l=>!used.includes(l))||('X'+plans.length); plans.push({id, nome:'Novo treino '+id, dia:'—', foco:'Geral', dur:'—', ex:[{n:'Novo exercício',s:3,r:'12'}]}); this.persist({plans}); return {plans, adminSel:id}; });
  editPlan(fn){ this.setState(s=>{ const plans=JSON.parse(JSON.stringify(s.plans||this.defaultPlans)); const p=plans.find(x=>x.id===s.adminSel)||plans[0]; fn(p,plans); this.persist({plans}); return {plans}; }); }
  adminRemoveEx=(i)=>this.editPlan(p=>{ p.ex.splice(i,1); });
  adminAddEx=()=>this.editPlan(p=>{ p.ex.push({n:'',s:3,r:'12'}); });
  editPlanEx=(i,patch)=>this.editPlan(p=>{ p.ex[i]={...p.ex[i],...patch}; });
  adminPublish=()=>{ this.setState({adminToast:Date.now()}); clearTimeout(this._tst); this._tst=setTimeout(()=>this.setState({adminToast:0}),2100); };

  monthName(){ return ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'][new Date().getMonth()]; }
  toggleDay=(key)=>this.setState(s=>{ const activeDays={...s.activeDays,[key]:!s.activeDays[key]}; this.persist({activeDays}); return {activeDays}; });

  renderVals(){
    const s=this.state, a=s.ans, T=this.theme();
    const pProp = (typeof this.props.primaryColor==='string') ? this.props.primaryColor : null;
    const tProp = (typeof this.props.accentText==='string') ? this.props.accentText : null;
    const ac  = pProp || T.ac;
    const acR = pProp ? this.hexRgb(pProp) : T.acR;
    const acT = tProp || T.acT;
    const dk = { bg:'#0A0B0A', inp:'#0f120e', sheet:'#141610', surf:'rgba(255,255,255,0.035)', surf2:'rgba(255,255,255,0.07)', bd:'rgba(255,255,255,0.1)', tx:'#F4F6F1', tx2:'#c3c9b9', tx3:'#8b937f', tx4:'#6c7566', nav:'rgba(12,13,11,0.94)', scrim:'rgba(5,6,5,0.72)' };
    const lt = { bg:'#EEF0EA', inp:'#FFFFFF', sheet:'#FFFFFF', surf:'rgba(0,0,0,.045)', surf2:'rgba(0,0,0,.07)', bd:'rgba(0,0,0,.1)', tx:'#16180F', tx2:'#3d4335', tx3:'#727a66', tx4:'#9aa08d', nav:'rgba(252,253,250,.92)', scrim:'rgba(20,22,16,.4)' };
    const tk = s.theme==='light' ? lt : dk;
    const rootStyle = `height:100%;width:100%;font-family:Barlow,system-ui,sans-serif;position:relative;overflow:hidden;--ac:${ac};--acR:${acR};--acT:${acT};--acHaze:rgba(${acR},.14);--acHaze2:rgba(${acR},.08);--bg:${tk.bg};--inp:${tk.inp};--sheet:${tk.sheet};--surf:${tk.surf};--surf2:${tk.surf2};--bd:${tk.bd};--tx:${tk.tx};--tx2:${tk.tx2};--tx3:${tk.tx3};--tx4:${tk.tx4};--nav:${tk.nav};--scrim:${tk.scrim};background:var(--bg);color:var(--tx);`;
    const acPanel = `linear-gradient(135deg, rgba(${acR},.13), var(--surf))`;

    const phase=s.phase;
    const R = {
      rootStyle, acPanel, dw:402, dh:874,
      brandName:T.name, brandInitials:T.ini, trainerName:T.trainer,
      brandHasLogo:!!T.logo, brandNoLogo:!T.logo,
      brandLogoEl:T.logo?React.createElement('img',{src:T.logo,style:{width:'100%',height:'100%',objectFit:'cover'}}):null,
      isLogin:phase==='login', isOnboarding:phase==='onboarding', isAnalyzing:phase==='analyzing', isPlan:phase==='plan', isApp:phase==='app',
      startOnboarding:this.startOnboarding, enterApp:this.enterApp, logout:this.logout, stop:this.stop,
      openBrand:()=>this.openOv('brand'),
    };

    // ----- onboarding -----
    const steps=7;
    R.obStep=s.ob; R.obLabel=s.ob+'/'+ (steps-1); R.obPrev=this.obPrev; R.obNext=this.obNext;
    R.obBarStyle={height:'100%',width:Math.round(s.ob/(steps-1)*100)+'%',background:ac,borderRadius:3,transition:'width .3s'};
    R.obCta = s.ob===0?'Começar':(s.ob>=6?'Ver minhas metas':'Continuar');
    for(let i=0;i<steps;i++) R['isOb'+i]=(s.ob===i);
    R.idade=a.idade; R.peso=a.peso; R.altura=a.altura; R.dias=a.dias;
    R.idadeInc=()=>this.bump('idade',1,14,90); R.idadeDec=()=>this.bump('idade',-1,14,90);
    R.pesoInc=()=>this.bump('peso',1,35,220); R.pesoDec=()=>this.bump('peso',-1,35,220);
    R.alturaInc=()=>this.bump('altura',1,130,220); R.alturaDec=()=>this.bump('altura',-1,130,220);
    R.diasInc=()=>this.bump('dias',1,1,7); R.diasDec=()=>this.bump('dias',-1,1,7);
    R.stepDecStyle={width:46,height:46,borderRadius:12,border:'1px solid var(--bd)',background:'var(--surf2)',color:'var(--tx)',fontSize:26,cursor:'pointer'};
    R.stepIncStyle={width:46,height:46,borderRadius:12,border:'none',background:ac,color:acT,fontSize:26,cursor:'pointer'};
    const optBtn=(sel)=>({width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,cursor:'pointer',padding:'15px 16px',borderRadius:14,textAlign:'left',border:'1px solid '+(sel?ac:'var(--bd)'),background:sel?`rgba(${acR},.12)`:'var(--surf)',color:'var(--tx)',font:"600 15px Barlow"});
    const mk=(k,list)=>list.map(o=>({label:o.label,sub:o.sub,sel:(a[k]===o.v),onClick:()=>this.setAns(k,o.v),style:optBtn(a[k]===o.v)}));
    const mkMulti=(k,list)=>list.map(o=>({label:o.label,sel:(a[k]||[]).includes(o.v),onClick:()=>this.toggleMulti(k,o.v),style:optBtn((a[k]||[]).includes(o.v))}));
    R.sexoOpts=mk('sexo',[{label:'Homem',v:'homem'},{label:'Mulher',v:'mulher'}]);
    R.objOpts=mk('objetivo',[{label:'Ganhar massa',sub:'Superávit calórico + força',v:'massa'},{label:'Perder gordura',sub:'Déficit calórico + preservar músculo',v:'secar'},{label:'Manter / performance',sub:'Manutenção e condicionamento',v:'perf'}]);
    R.nivelOpts=mk('nivel',[{label:'Iniciante',v:'iniciante'},{label:'Intermediário',v:'intermediario'},{label:'Avançado',v:'avancado'}]);
    R.lesaoOpts=mkMulti('lesoes',[{label:'Ombro',v:'ombro'},{label:'Joelho',v:'joelho'},{label:'Lombar',v:'lombar'},{label:'Punho',v:'punho'},{label:'Nenhuma',v:'nenhuma'}]);
    R.restricaoOpts=mkMulti('restricoes',[{label:'Lactose',v:'lactose'},{label:'Glúten',v:'gluten'},{label:'Vegetariano',v:'vegetariano'},{label:'Vegano',v:'vegano'},{label:'Nenhuma',v:'nenhuma'}]);

    // ----- analyzing / plan -----
    R.analyzePct=s.analyzePct; R.analyzeMsg=s.analyzeMsg;
    const cm=this.computeMeta(a);
    const objMap={massa:'ganho de massa',secar:'perda de gordura',perf:'performance'};
    R.planObj=objMap[a.objetivo]||'seu objetivo'; R.planKcal=cm.kcal; R.planP=cm.p; R.planC=cm.c; R.planG=cm.g;
    R.planBmr=cm.bmr; R.planTdee=cm.tdee; R.planDias=a.dias;
    R.planAdjTxt=cm.adjPct>0?('+'+cm.adjPct+'% superávit'):cm.adjPct<0?(cm.adjPct+'% déficit'):'manutenção';
    R.planUpdated='hoje';
    const lesoesReal=(a.lesoes||[]).filter(x=>x!=='nenhuma');
    R.hasLesao=lesoesReal.length>0; R.lesaoTxt=lesoesReal[0]||'';

    // ----- meta / macros -----
    const M=s.meta;
    const todayKey=this.dayKey();
    const todayMeals=(s.mealsByDay&&s.mealsByDay[todayKey])||[];
    const consumed=todayMeals.reduce((o,m)=>({kcal:o.kcal+m.kcal,p:o.p+m.p,c:o.c+m.c,g:o.g+m.g}),{kcal:0,p:0,c:0,g:0});
    R.kcalCur=consumed.kcal; R.kcalTgt=M.kcal; R.kcalLeft=Math.max(0,M.kcal-consumed.kcal); R.consumedKcal=consumed.kcal;
    const pctBar=(cur,tgt,col)=>({height:'100%',width:Math.min(100,Math.round(cur/Math.max(1,tgt)*100))+'%',background:col,borderRadius:5,transition:'width .4s'});
    R.pCur=consumed.p; R.pTgt=M.p; R.cCur=consumed.c; R.cTgt=M.c; R.gCur=consumed.g; R.gTgt=M.g;
    R.pBarStyle=pctBar(consumed.p,M.p,'#FF5C43'); R.cBarStyle=pctBar(consumed.c,M.c,'#F4B740'); R.gBarStyle=pctBar(consumed.g,M.g,'#9C8BFF');
    const kpct=Math.min(100,Math.round(consumed.kcal/Math.max(1,M.kcal)*100));
    R.ringKcalStyle=`background:conic-gradient(${ac} ${kpct*3.6}deg, var(--surf2) 0deg);`;

    // ----- home -----
    const now=new Date();
    R.greetDate=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'][now.getDay()]+', '+now.getDate()+' '+this.monthName().slice(0,3).toLowerCase();
    R.firstName=a.sexo==='mulher'?'Aluna':'Victor';
    R.userInitials=(R.firstName[0]||'A').toUpperCase()+(R.firstName[1]||'').toUpperCase();
    const WK=this.WK; const todayIdx=(now.getDay()+6)%7; const todayW=WK[Math.min(todayIdx,WK.length-1)];
    R.todayTitle='Treino '+todayW.id+' · '+todayW.nome; R.todaySub=todayW.foco+' · '+todayW.dur;
    R.openSettings=()=>this.openOv('settings'); R.openFood=this.openFoodModal; R.openMetasCfg=()=>this.openOv('metas');
    R.openTodayWorkout=()=>this.openWorkout(todayW.id); R.goTreino=()=>this.go('treino');
    R.addWater=this.addWater; R.removeWater=this.removeWater;
    R.waterCur=(s.water/1000).toFixed(1).replace('.',',')+'L'; R.waterTgt=(M.water/1000).toFixed(1).replace('.',',')+'L';
    const cups=Math.round(M.water/250), fill=Math.round(s.water/250);
    R.waterCups=Array.from({length:cups}).map((_,i)=>({filled:i<fill,empty:i>=fill}));
    R.frase=this.frases[now.getDate()%this.frases.length];

    // calendar
    R.calMonth=this.monthName()+' '+now.getFullYear();
    R.calWeekdays=['D','S','T','Q','Q','S','S'].map(l=>({l}));
    const y=now.getFullYear(), mo=now.getMonth(); const first=new Date(y,mo,1).getDay(); const days=new Date(y,mo+1,0).getDate();
    const cells=[]; for(let i=0;i<first;i++) cells.push({label:'',blank:true});
    let streak=0, active=0; const todayD=now.getDate();
    for(let d=1;d<=days;d++){ const key=y+'-'+(mo+1)+'-'+d; const on=!!s.activeDays[key]; if(on) active++;
      const isToday=d===todayD;
      cells.push({label:String(d),onClick:()=>this.openDay(key),
        style:{aspectRatio:'1',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:9,cursor:'pointer',fontSize:12,fontWeight:on?800:600,fontFamily:on?"'Barlow Condensed'":'Barlow',
          color:on?acT:(isToday?ac:'var(--tx2)'),background:on?ac:(isToday?`rgba(${acR},.14)`:'var(--surf)'),border:isToday&&!on?('1px solid '+ac):'1px solid transparent'}}); }
    for(let d=todayD;d>=1;d--){ if(s.activeDays[y+'-'+(mo+1)+'-'+d]) streak++; else break; }
    R.calCells=cells; R.activeThisMonth=active; R.streakCount=streak;

    // ----- treino list -----
    const hasOmbro=lesoesReal.includes('ombro');
    const wprog=(w)=>{ let done=0,total=0; w.ex.forEach((e,ei)=>{ for(let si=0;si<e.s;si++){ total++; if(s.sets[w.id+'-'+ei+'-'+si]) done++; } }); return {done,total,pct:total?done/total:0}; };
    let setsDoneTotal=0; WK.forEach(w=>{ setsDoneTotal+=wprog(w).done; });
    R.setsDone=setsDoneTotal;
    R.workoutList=WK.map(w=>{ const p=wprog(w); return { id:w.id, nome:w.nome, dia:w.dia, foco:w.foco, dur:w.dur, onClick:()=>this.openWorkout(w.id),
      complete:p.pct>=1, doneTxt:p.done+'/'+p.total, hasAdapted:w.ombro&&hasOmbro,
      pctStyle:{height:'100%',width:Math.round(p.pct*100)+'%',background:ac,borderRadius:4,transition:'width .3s'} }; });

    // ----- workout detail -----
    const detW=WK.find(w=>w.id===s.detail)||WK[0];
    R.isWorkoutOpen=s.overlay==='workout'; R.detW=detW; R.closeDetail=this.closeOv;
    const mmss=(t)=>String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0');
    R.timerTxt=mmss(s.timerSec); R.timerBtn=s.timerRun?'Pausar':'Iniciar'; R.toggleTimer=this.toggleTimer; R.resetTimer=this.resetTimer;
    R.restTxt=s.restSec>0?mmss(s.restSec):'--:--';
    R.restColor=s.restSec>0?(s.restSec<=10?'#FF5C43':'#3FC7F2'):'var(--tx3)';
    R.restOpts=[60,90,120].map(n=>({label:(n<120?n+'s':'2m'),onClick:()=>this.setRest(n),
      style:{flex:1,cursor:'pointer',padding:'7px 4px',borderRadius:8,border:'1px solid '+(s.restTotal===n&&s.restRun?'#3FC7F2':'var(--bd)'),background:s.restTotal===n&&s.restRun?'rgba(63,199,242,.16)':'var(--surf2)',color:s.restTotal===n&&s.restRun?'#3FC7F2':'var(--tx3)',font:"700 12px 'Barlow Condensed'",textTransform:'uppercase'}}));
    R.detExercises=detW.ex.map((e,ei)=>{ const lk=e.n; const hist=s.loads[lk]||[]; const lastW=hist.length?hist[hist.length-1].w:null; const firstW=hist.length?hist[0].w:null;
      const cur=(s.loadDraft[lk]!=null)?s.loadDraft[lk]:(lastW!=null?lastW:20); const delta=(hist.length&&firstW!=null)?(lastW-firstW):0; const maxW=Math.max(1,...hist.map(h=>h.w));
      return { n:e.n, s:e.s, r:e.r, adapted:e.ombro&&hasOmbro,
      setCells:Array.from({length:e.s}).map((_,si)=>{ const k=detW.id+'-'+ei+'-'+si; const on=!!s.sets[k]; return { n:si+1, onClick:()=>this.toggleSet(k),
        style:{width:40,height:40,borderRadius:11,cursor:'pointer',border:'1px solid '+(on?ac:'var(--bd)'),background:on?ac:'transparent',color:on?acT:'var(--tx3)',font:"800 15px 'Barlow Condensed'"} }; }),
      loadCur:cur, loadDec:()=>this.loadBump(lk,-2.5), loadInc:()=>this.loadBump(lk,2.5), onSaveLoad:()=>this.saveLoad(lk),
      hasLoadHist:hist.length>0, loadLast:lastW, loadDelta:(delta>0?'+':'')+delta+' kg', deltaColor:delta>0?'#12B76A':delta<0?'#FF5C43':'var(--tx3)',
      loadBars:hist.slice(-6).map(h=>({style:{width:8,borderRadius:3,background:'var(--ac)',height:Math.max(6,Math.round(h.w/maxW*38))+'px'}})) }; });

    // ----- dieta -----
    R.isHome=s.tab==='home'; R.isTreino=s.tab==='treino'; R.isDieta=s.tab==='dieta'; R.isPerfil=s.tab==='perfil';
    R.hasMeals=todayMeals.length>0; R.noMeals=todayMeals.length===0;
    const typeLabel=(t)=>{ const m=this.mealTypes.find(x=>x[0]===t); return m?m[1]:'Refeição'; };
    // group today's meals by meal type
    const groupsMap={};
    todayMeals.forEach((m,i)=>{ const t=m.type||'lanche'; (groupsMap[t]=groupsMap[t]||[]).push({...m,idx:i}); });
    R.mealGroups=this.mealTypes.filter(([t])=>groupsMap[t]).map(([t,label])=>{ const items=groupsMap[t]; const kc=items.reduce((a,m)=>a+m.kcal,0);
      return { label, kcal:kc, items:items.map(m=>({ n:m.nome, kcal:m.kcal, p:m.p, c:m.c, g:m.g, onRemove:()=>this.removeMeal(m.idx) })) }; });
    R.suggestions=this.foods.slice(0,3).map(r=>({ nome:r.nome, kcal:r.kcal, p:r.p, c:r.c, g:r.g, onAdd:()=>this.quickAddMeal(r) }));
    // history (previous days)
    const histKeys=Object.keys(s.mealsByDay||{}).filter(k=>k!==todayKey && (s.mealsByDay[k]||[]).length).sort().reverse().slice(0,7);
    R.hasHistory=histKeys.length>0;
    R.histDays=histKeys.map(k=>{ const arr=s.mealsByDay[k]; const tot=arr.reduce((o,m)=>({kcal:o.kcal+m.kcal,p:o.p+m.p,c:o.c+m.c,g:o.g+m.g}),{kcal:0,p:0,c:0,g:0});
      const parts=k.split('-'); const dd=new Date(+parts[0],+parts[1]-1,+parts[2]); const wd=['dom','seg','ter','qua','qui','sex','sáb'][dd.getDay()];
      const pct=Math.min(100,Math.round(tot.kcal/Math.max(1,M.kcal)*100));
      return { dateLabel:dd.getDate()+' '+this.monthName().slice(0,3).toLowerCase()+' · '+wd, kcal:tot.kcal, meals:arr.length, macro:'P'+Math.round(tot.p)+' C'+Math.round(tot.c)+' G'+Math.round(tot.g),
        barStyle:{height:'100%',width:pct+'%',background:ac,borderRadius:4} }; });

    // ----- food modal (meal type -> food -> quantity) -----
    R.isFoodOpen=s.overlay==='food'; R.closeFood=this.closeOv;
    const fd=s.food;
    R.foodMealChips=this.mealTypes.map(([t,label])=>({ label, onClick:()=>this.setFoodType(t),
      style:{flexShrink:0,cursor:'pointer',padding:'8px 13px',borderRadius:10,border:'1px solid '+(fd.type===t?ac:'var(--bd)'),background:fd.type===t?`rgba(${acR},.14)`:'var(--surf)',color:fd.type===t?ac:'var(--tx2)',font:"700 13px 'Barlow Condensed'",textTransform:'uppercase',whiteSpace:'nowrap'} }));
    const base=fd.baseId?this.foodsDB.find(x=>x.id===fd.baseId):null;
    R.foodNoBase=!base; R.foodHasBase=!!base; R.foodBaseName=base?base.n:'';
    R.foodSearch=this.foodsDB.map(x=>({ n:x.n, per:x.per.kcal+' kcal /100g', onClick:()=>this.selectBase(x.id) }));
    R.foodQty=fd.qty; R.foodKcal=fd.kcal; R.foodP=fd.p; R.foodC=fd.c; R.foodG=fd.g;
    R.foodQtyDec=()=>this.foodQtyBump(-10); R.foodQtyInc=()=>this.foodQtyBump(10);
    R.foodQtyChips=[50,100,150,200].map(q=>({ label:q+'g', onClick:()=>this.setFoodQty(q),
      style:{flex:1,cursor:'pointer',padding:'8px',borderRadius:9,border:'1px solid '+(fd.qty===q?ac:'var(--bd)'),background:fd.qty===q?`rgba(${acR},.12)`:'var(--surf)',color:fd.qty===q?ac:'var(--tx3)',font:"700 12px 'Barlow Condensed'"} }));
    R.foodMacroEdit=[['kcal','Kcal',10],['p','Prot',1],['c','Carb',1],['g','Gord',1]].map(([k,label,step])=>({ label, value:fd[k]+(k==='kcal'?'':'g'),
      dec:()=>this.foodMacroBump(k,-step), inc:()=>this.foodMacroBump(k,step) }));
    R.foodClear=()=>this.setState(s=>({food:{...s.food,baseId:null}}));
    R.foodAdd=this.foodAdd; R.foodAddLabel='Adicionar ao '+typeLabel(fd.type).toLowerCase();
    // método de registro (buscar / escrever / áudio)
    R.foodBuscar=fd.method!=='escrever'&&fd.method!=='audio'; R.foodEscrever=fd.method==='escrever'; R.foodAudio=fd.method==='audio';
    R.foodMethodChips=[['buscar','Buscar'],['escrever','Escrever'],['audio','Áudio']].map(([m,label])=>({ label, onClick:()=>this.setFoodMethod(m),
      style:{flex:1,cursor:'pointer',border:'none',padding:'9px 6px',borderRadius:9,background:(fd.method===m||(m==='buscar'&&R.foodBuscar))?ac:'transparent',color:(fd.method===m||(m==='buscar'&&R.foodBuscar))?acT:'var(--tx3)',font:"700 13px 'Barlow Condensed'",textTransform:'uppercase',letterSpacing:'.02em'} }));
    R.mNameVal=this._mname||''; R.onMName=this.onMName; R.foodManualAdd=this.foodManualAdd; R.audioSim=this.audioSim;
    R.foodManualLabel='Adicionar ao '+typeLabel(fd.type).toLowerCase();
    // day extract
    R.isDayOpen=s.overlay==='dayView'; R.closeDay=this.closeOv;
    const dvk=s.dayView||todayKey; const dp=dvk.split('-'); const dvd=new Date(+dp[0],+dp[1]-1,+dp[2]);
    R.dayLabel=dvd.getDate()+' '+['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'][dvd.getMonth()]+' · '+['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'][dvd.getDay()];
    const dvMeals=(s.mealsByDay&&s.mealsByDay[dvk])||[];
    R.dayHasMeals=dvMeals.length>0; R.dayNoMeals=dvMeals.length===0; R.dayKcal=dvMeals.reduce((a,m)=>a+m.kcal,0);
    R.dayMeals=this.mealTypes.filter(([t])=>dvMeals.some(m=>(m.type||'lanche')===t)).map(([t,label])=>{ const its=dvMeals.filter(m=>(m.type||'lanche')===t);
      return { label, items:its.map(m=>({ n:m.nome, kcal:m.kcal, macro:'P'+m.p+' · C'+m.c+' · G'+m.g })) }; });
    const wdIds=Object.keys((s.workoutDays&&s.workoutDays[dvk])||{});
    R.dayHasWk=wdIds.length>0; R.dayNoWk=wdIds.length===0;
    R.dayWorkouts=wdIds.map(id=>{ const p=this.WK.find(w=>w.id===id); return { id, nome:p?p.nome:('Treino '+id) }; });

    // ----- metas config -----
    R.isMetasOpen=s.overlay==='metas'; R.closeMetas=this.closeOv;
    R.metaRows=[
      {label:'Calorias',value:M.kcal,unit:'kcal',inc:()=>this.bumpMeta('kcal',50,1000,6000),dec:()=>this.bumpMeta('kcal',-50,1000,6000)},
      {label:'Proteína',value:M.p,unit:'g',inc:()=>this.bumpMeta('p',5,40,400),dec:()=>this.bumpMeta('p',-5,40,400)},
      {label:'Carboidrato',value:M.c,unit:'g',inc:()=>this.bumpMeta('c',10,0,700),dec:()=>this.bumpMeta('c',-10,0,700)},
      {label:'Água',value:(M.water/1000).toFixed(1).replace('.',','),unit:'L',inc:()=>this.bumpMeta('water',250,500,6000),dec:()=>this.bumpMeta('water',-250,500,6000)},
    ];

    // ----- perfil / tabs -----
    R.openAdmin=()=>this.openOv('admin');
    R.profileRows=[
      {label:'Meus dados e avaliação',icon:'M12 2a5 5 0 015 5v0a5 5 0 01-10 0v0a5 5 0 015-5zM4 21c0-4 4-6 8-6s8 2 8 6',onClick:()=>this.openOv('settings')},
      {label:'Ajustar metas de dieta',icon:'M4 6h16M4 12h16M4 18h10',onClick:()=>this.openOv('metas')},
      {label:'Notificações',icon:'M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0',onClick:()=>this.openOv('settings')},
      {label:'Sobre o app',icon:'M12 16v-4M12 8h.01M12 2a10 10 0 100 20 10 10 0 000-20z',onClick:()=>this.openOv('settings')},
    ];
    const tabDef=[['home','Início','M3 11l9-8 9 8M5 10v10h14V10'],['treino','Treino','M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12'],['dieta','Dieta','M12 21s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 11c0 5.5-7 10-7 10z'],['perfil','Perfil','M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 4-6 8-6s8 2 8 6']];
    R.tabs=tabDef.map(([t,l,ic])=>({label:l,icon:ic,color:s.tab===t?ac:'var(--tx4)',onClick:()=>this.go(t)}));

    // ----- settings -----
    R.isSettingsOpen=s.overlay==='settings'; R.closeSettings=this.closeOv;
    const dark=s.theme!=='light'; R.toggleTheme=this.toggleTheme;
    R.themeLabel=dark?'Ativado':'Desativado (tema claro)';
    R.themeIcon=dark?'M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z':'M12 3v2M12 19v2M5 12H3M21 12h-2M6.3 6.3L4.9 4.9M19.1 19.1l-1.4-1.4M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4M12 8a4 4 0 100 8 4 4 0 000-8z';
    R.themeTrackStyle={width:44,height:26,borderRadius:99,border:'none',cursor:'pointer',padding:2,background:dark?ac:'var(--bd)',display:'flex',justifyContent:dark?'flex-end':'flex-start',alignItems:'center'};
    R.themeKnobStyle={width:20,height:20,borderRadius:'50%',background:dark?acT:'#fff',display:'block'};
    R.dataRows=[{label:'Objetivo',value:R.planObj},{label:'Peso',value:a.peso+' kg'},{label:'Altura',value:a.altura+' cm'},{label:'Frequência',value:a.dias+'x / semana'}];
    R.notifRows=[['treino','Lembrete de treino'],['dieta','Lembrete de refeição'],['avaliacao','Reavaliação mensal']].map(([k,l])=>{ const on=s.notif[k]; return {label:l,onToggle:()=>this.toggleNotif(k),
      trackStyle:{width:44,height:26,borderRadius:99,border:'none',cursor:'pointer',padding:2,background:on?ac:'var(--bd)',display:'flex',justifyContent:on?'flex-end':'flex-start',alignItems:'center'},
      knobStyle:{width:20,height:20,borderRadius:'50%',background:on?acT:'var(--tx2)',display:'block'}}; });

    // ----- admin -----
    R.isAdminOpen=s.overlay==='admin'; R.closeAdmin=this.closeOv;
    R.adminOnAlunos=s.adminTab==='alunos'; R.adminOnTreinos=s.adminTab==='treinos'; R.adminOnAvisos=s.adminTab==='avisos';
    R.adminAlunos=()=>this.setAdminTab('alunos'); R.adminTreinos=()=>this.setAdminTab('treinos'); R.adminAvisos=()=>this.setAdminTab('avisos');
    const admSeg=(on)=>({flex:1,cursor:'pointer',border:'none',padding:'9px 6px',borderRadius:8,background:on?ac:'transparent',color:on?acT:'#9aa2ad',font:"700 13px 'Barlow Condensed'",textTransform:'uppercase',display:'flex',alignItems:'center',justifyContent:'center',gap:6});
    R.admSegAlunos=admSeg(s.adminTab==='alunos'); R.admSegTreinos=admSeg(s.adminTab==='treinos'); R.admSegAvisos=admSeg(s.adminTab==='avisos');
    const stag=(c,bg)=>({font:"600 10px Barlow",letterSpacing:'.04em',textTransform:'uppercase',color:c,background:bg,borderRadius:7,padding:'4px 8px',flexShrink:0});
    const openNotifs=(s.notifs||[]).filter(n=>!n.done).length; R.notifCount=openNotifs; R.hasNotifBadge=openNotifs>0;
    R.notifBadgeStyle={minWidth:18,height:18,borderRadius:9,background:'#FF5C43',color:'#fff',font:'700 11px Barlow',display:'flex',alignItems:'center',justifyContent:'center',padding:'0 5px'};
    R.pendCount=(s.notifs||[]).filter(n=>!n.done).length;
    const roster=[
      {ini:'VS',name:'Victor Silva',obj:'Hipertrofia',freq:'5x/sem',tag:'Ativo',peso:'78 kg',altura:'179 cm',idade:'29',lesao:'Nenhuma',restr:'Nenhuma',plano:'Treino A–E',ult:'Treinou hoje'},
      {ini:'MC',name:'Marina Costa',obj:'Emagrecimento',freq:'4x/sem',tag:'Ativo',peso:'64 kg',altura:'166 cm',idade:'33',lesao:'Lombar',restr:'Lactose',plano:'Treino A–D',ult:'Treinou ontem'},
      {ini:'RD',name:'Rafael Dias',obj:'Performance',freq:'6x/sem',tag:'Revisar',peso:'82 kg',altura:'181 cm',idade:'27',lesao:'Joelho',restr:'Nenhuma',plano:'Pediu troca',ult:'há 3 dias'},
      {ini:'LP',name:'Letícia Prado',obj:'Hipertrofia',freq:'3x/sem',tag:'Ativo',peso:'59 kg',altura:'162 cm',idade:'24',lesao:'Nenhuma',restr:'Vegetariana',plano:'Treino A–C',ult:'Treinou hoje'},
      {ini:'BN',name:'Bruno Nunes',obj:'Iniciante',freq:'3x/sem',tag:'Novo',peso:'90 kg',altura:'175 cm',idade:'38',lesao:'Ombro',restr:'Nenhuma',plano:'Sem treino',ult:'Cadastrou-se'},
    ];
    const tagColor=(t)=>t==='Revisar'?['#F4B740','rgba(244,183,64,.16)']:t==='Novo'?['#9C8BFF','rgba(124,107,255,.16)']:[ac,`rgba(${acR},.14)`];
    R.adminStudents=roster.map(a=>{ const[c,bg]=tagColor(a.tag); return { ini:a.ini, name:a.name, plan:a.obj, freq:a.freq, tag:a.tag, tagStyle:stag(c,bg), onClick:()=>this.openStudent(a) }; });
    // student detail
    R.adminStudentOpen=!!s.adminStudent; const stu=s.adminStudent||{}; R.closeStudent=this.closeStudent;
    R.stuName=stu.name||''; R.stuIni=stu.ini||''; R.stuObj=stu.obj||''; R.stuFreq=stu.freq||'';
    R.stuRows=[['Objetivo',stu.obj],['Frequência',stu.freq],['Idade',stu.idade+' anos'],['Peso',stu.peso],['Altura',stu.altura],['Lesão / limitação',stu.lesao],['Restrição alimentar',stu.restr],['Plano atual',stu.plano],['Última atividade',stu.ult]].map(([label,value])=>({label,value:value||'—'}));
    R.stuLesaoWarn=stu.lesao&&stu.lesao!=='Nenhuma'; R.stuLesaoTxt=stu.lesao;
    R.openStudentTreino=()=>{ this.setState({adminTab:'treinos'}); this.closeStudent(); };
    // montar treino — plan chips
    R.adminPlanChips=this.WK.map(p=>({ label:'Treino '+p.id, sel:s.adminSel===p.id, onClick:()=>this.setAdminSel(p.id),
      style:{flexShrink:0,cursor:'pointer',padding:'8px 14px',borderRadius:10,border:'1px solid '+(s.adminSel===p.id?ac:'rgba(255,255,255,.1)'),background:s.adminSel===p.id?`rgba(${acR},.16)`:'transparent',color:s.adminSel===p.id?ac:'#9aa2ad',font:"700 14px 'Barlow Condensed'",textTransform:'uppercase',whiteSpace:'nowrap'} }));
    R.adminCreatePlan=this.createPlan;
    const admPlan=this.WK.find(w=>w.id===s.adminSel)||this.WK[0];
    R.adminPlanName=admPlan.nome; R.adminPlanFoco=admPlan.foco; R.adminPlanId=admPlan.id;
    R.adminHasEx=admPlan.ex.length>0; R.adminNoEx=admPlan.ex.length===0;
    R.adminExercises=admPlan.ex.map((e,i)=>({ nVal:e.n, sVal:e.s, rVal:e.r,
      onName:(ev)=>this.editPlanEx(i,{n:ev.target.value}), onSeries:(ev)=>this.editPlanEx(i,{s:ev.target.value}), onReps:(ev)=>this.editPlanEx(i,{r:ev.target.value}),
      remove:()=>this.adminRemoveEx(i) }));
    R.adminAddEx=this.adminAddEx; R.adminPublish=this.adminPublish; R.adminToast=!!s.adminToast;
    // avisos
    const kindMeta={novo:['Novo aluno','#9C8BFF','M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM19 8v6M22 11h-6'],troca:['Troca de treino','#F4B740','M17 2l4 4-4 4M3 11V9a4 4 0 014-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 01-4 4H3'],aval:['Reavaliação','#3FC7F2','M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11']};
    const notifCta={novo:'Montar treino',troca:'Ajustar treino',aval:'Abrir avaliação'};
    R.adminNotifs=(s.notifs||[]).map(n=>{ const[kl,kc,ic]=kindMeta[n.kind]||kindMeta.novo; return { ini:n.ini, name:n.name, txt:n.txt, time:n.time, done:n.done, pending:!n.done, cta:notifCta[n.kind]||'Resolver', kindLabel:kl, kindColor:kc, kindIcon:ic,
      onResolve:()=>this.resolveNotif(n.id),
      iconWrap:{width:38,height:38,borderRadius:11,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',background:n.done?'rgba(255,255,255,.05)':kc+'28',color:n.done?'#7f8794':kc},
      cardOpacity:n.done?0.55:1 }; });

    // ----- brand switcher -----
    R.isBrandOpen=s.overlay==='brand'; R.closeBrand=this.closeOv;
    R.brandOpts=Object.keys(this.brands).map(k=>{ const b=this.brands[k]; const sel=s.brand===k; return { name:b.name, ini:b.ini, desc:b.desc, ac:b.ac, acT:b.acT, sel, onClick:()=>this.setBrand(k),
      rowStyle:{width:'100%',display:'flex',alignItems:'center',gap:13,cursor:'pointer',padding:14,borderRadius:15,border:'1px solid '+(sel?b.ac:'var(--bd)'),background:sel?`rgba(${b.acR},.1)`:'var(--surf)'} }; });
    // custom brand controls
    R.customSel=s.brand==='custom'; R.customNameVal=s.customName||''; R.customHasLogo=!!s.customLogo; R.noCustomLogo=!s.customLogo;
    R.customLogoEl=s.customLogo?React.createElement('img',{src:s.customLogo,style:{width:'100%',height:'100%',objectFit:'cover'}}):null;
    R.onNameInput=(e)=>{ this._draftName=e.target.value; }; R.applyName=this.applyName; R.applyLogo=this.applyLogo; R.useCustom=this.applyName;
    R.customColorOpts=[['#2E7BFF','#FFFFFF'],['#12B76A','#04220f'],['#FF6B2C','#0A0B0A'],['#E4022E','#FFFFFF'],['#7C3AED','#FFFFFF'],['#111111','#FFFFFF']].map(([c,t])=>({ onClick:()=>this.setCustomColor(c,t),
      style:{width:38,height:38,borderRadius:11,cursor:'pointer',background:c,border:s.customColor===c?'2px solid var(--tx)':'2px solid transparent',boxShadow:s.customColor===c?'0 0 0 2px var(--bg) inset':'none'} }));
    R.useCustomBtnStyle={marginTop:14,width:'100%',border:'none',cursor:'pointer',padding:'13px',borderRadius:12,background:'var(--ac)',color:'var(--acT)',fontFamily:"'Barlow Condensed'",fontWeight:700,fontSize:16,textTransform:'uppercase',letterSpacing:'.03em'};

    return R;
  }
}
