const SETS=[
{name:"Первый день в зоне",bonuses:{knife:5,pistol:5,auto:5}},
{name:"Любитель прогулок",bonuses:{grenade:6,gl:11,gauss:36}},
{name:"Марафонец",bonuses:{knife:9,pistol:10,auto:11}},
{name:"Полевой",bonuses:{grenade:16,gl:34,gauss:108}},
{name:"Болотник",bonuses:{knife:14,pistol:14,auto:16}},
{name:"Омон",bonuses:{grenade:30,gl:62,gauss:198},critGaussChance:.01,critGaussDamage:100},
{name:"КХК-01",bonuses:{grenade:41,gl:85,gauss:270},critGaussChance:.01,critGaussDamage:100},
{name:"Рубеж-М",bonuses:{grenade:50,gl:102,gauss:324},critChance:.02,critDamage:50},
{name:"Научный сотрудник",bonuses:{knife:18,pistol:19,auto:22}},
{name:"Копатель",bonuses:{grenade:22,gl:45,gauss:144},critGrenadeChance:.01,critGrenadeDamage:75},
{name:"Жестянка",bonuses:{grenade:60,gl:124,gauss:396},critChance:.03,critDamage:75}
];
const ITEMS=[
{name:"Футболка «Сердце Зоны»",bonuses:{grenade:1,gl:2,gauss:7}},
{name:"Кожаная куртка",bonuses:{grenade:3,gl:7,gauss:22}},
{name:"Бандитский плащ",bonuses:{grenade:2,gl:5,gauss:14}},
{name:"Комбинезон «Рассвет»",bonuses:{knife:12,pistol:12,auto:14},cooldown:.03,freeNoCooldown:.01}
];
const state={sets:new Set(),items:new Set(),talents:{}};
const keys=["knife","pistol","auto","grenade","gl","gauss"];
const talentWeaponNames={knife:"Нож",pistol:"Пистолет",rifle:"Автомат",grenade:"Граната",ubgl:"Гранатомёт",gauss:"Гаусс"};
const $=id=>document.getElementById(id),STORAGE_KEY="gameHelperState",MAX_TALENT_POINTS=TALENTS.length*5;

function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify({sets:[...state.sets],items:[...state.items],level:$("level").value,talents:state.talents}))}
function loadState(){try{const data=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");if(!data)return;state.sets.clear();state.items.clear();state.talents={};(Array.isArray(data.sets)?data.sets:[]).filter(i=>Number.isInteger(i)&&i>=0&&i<SETS.length).forEach(i=>state.sets.add(i));(Array.isArray(data.items)?data.items:[]).filter(i=>Number.isInteger(i)&&i>=0&&i<ITEMS.length).forEach(i=>state.items.add(i));if(data.level!==undefined)$("level").value=data.level;if(data.talents&&typeof data.talents==="object")Object.entries(data.talents).forEach(([id,v])=>{if(TALENTS.some(t=>t[0]===id))state.talents[id]=Math.max(0,Math.min(5,Number(v)||0))})}catch{}}
const num=id=>Math.max(0,Number($(id).value)||0),fmt=n=>Math.round(n).toLocaleString("ru-RU"),talentRank=code=>state.talents[code]||0,talentDef=code=>TALENTS.find(t=>t[0]===code);
function canUpgrade(t){return talentRank(t[0])<5&&t[8].every(req=>talentRank(req)>=5)}
function spentTalentPoints(){return Object.values(state.talents).reduce((a,b)=>a+b,0)}
function talentTotals(){const total=Object.fromEntries(keys.map(k=>[k,0]));let critChance=0,critDamage=0,noCooldown=0,cooldown=0;TALENTS.forEach(t=>{const rank=talentRank(t[0]);if(!rank)return;const stat=t[7],target=t[6],value=t[5][rank-1];if(stat==="free_hit_damage_flat")total[target==="rifle"?"auto":target]+=value;if(stat==="paid_hit_damage_flat")total[target==="ubgl"?"gl":target]+=value;if(stat==="paid_hit_crit_damage_flat")critDamage+=value;if(stat==="paid_hit_crit_chance_pct")critChance+=value/100;if(stat==="free_hit_cooldown_reduction_pct")cooldown+=value/100;if(stat==="free_hit_cooldown_dodge_chance_pct")noCooldown+=value/100});return{total,critChance,critDamage,noCooldown,cooldown}}
function talentEffectText(t){const rank=talentRank(t[0]),stat=t[7],target=t[6],value=rank?t[5][rank-1]:0,next=rank<5?t[5][rank]:null;const labels={free_hit_damage_flat:"Урон",paid_hit_damage_flat:"Урон",paid_hit_crit_damage_flat:"Крит. урон",paid_hit_crit_chance_pct:"Шанс крита",free_hit_cooldown_reduction_pct:"Сокращение отката",free_hit_cooldown_dodge_chance_pct:"Удар без отката"};const unit=stat&&stat.endsWith("_pct")?"%":"",weapon=target?" · "+talentWeaponNames[target]:"";return rank<5?labels[stat]+weapon+": <b>"+next+unit+"</b> на следующем ранге":labels[stat]+weapon+": <b>"+value+unit+"</b>"}
function renderTalents(){
 const branches=[{code:"free_hits",name:"Боевая подготовка",desc:"Бесплатные удары по боссам."},{code:"paid_hits",name:"Арсенал",desc:"Расходуемые удары по боссам."}];
 $("talentBranches").innerHTML=branches.map(branch=>{const tiers=[1,2,3,4,5].map(tier=>{const nodes=TALENTS.filter(t=>t[1]===branch.code&&t[4]===tier).sort((a,b)=>a[5]-b[5]);if(!nodes.length)return"";return '<div class="talent-tier"><div class="talent-tier-label">Уровень '+tier+'</div><div class="talent-tier-grid">'+nodes.map(t=>{const rank=talentRank(t[0]),unlocked=t[8].every(req=>talentRank(req)>=5),up=canUpgrade(t),req=t[8].length?"Требует: "+t[8].map(code=>talentDef(code)[2]).join(", "):"Начальный талант";return '<article class="talent-node '+(rank?"has-rank ":"")+(unlocked?"unlocked":"locked")+'" data-talent="'+t[0]+'"><div class="talent-node-top"><span>'+t[0].replace("TALENT_","")+'</span><b>'+rank+'/5</b></div><h3>'+t[2]+'</h3><p>'+t[3]+'</p><div class="talent-effect">'+talentEffectText(t)+'</div><div class="talent-requirement">'+req+'</div><div class="talent-actions">'+(rank?'<button type="button" data-talent-down="'+t[0]+'">−</button>':"")+'<button type="button" class="talent-up" data-talent-up="'+t[0]+'" '+(up?"":"disabled")+'>'+(rank>=5?"Макс.":rank?"+1":"Изучить")+'</button></div></article>'}).join("")+'</div></div>'}).join("");return '<section class="talent-branch"><header><div><h3>'+branch.name+'</h3><p>'+branch.desc+'</p></div><span>'+spentTalentPoints()+' очков</span></header>'+tiers+'</section>'}).join("");
 $("talentPointsBadge").textContent=spentTalentPoints()+" / "+MAX_TALENT_POINTS;$("modalSpentPoints").textContent=spentTalentPoints();$("talentSummary").textContent=spentTalentPoints()?"Распределено "+spentTalentPoints()+" очков":"Очки не распределены";
}
function openTalents(){$("talentModal").classList.add("show");$("talentModal").setAttribute("aria-hidden","false");renderTalents()}
function closeTalents(){$("talentModal").classList.remove("show");$("talentModal").setAttribute("aria-hidden","true")}
function totals(){
 const total=Object.fromEntries(keys.map(k=>[k,0]));let critChance=0,critDamage=0,critGaussChance=0,critGrenadeChance=0,critGaussDamage=0,critGrenadeDamage=0,noCooldown=0,cooldown=0;
 [...state.sets,...state.items].forEach((i,n)=>{const arr=n<state.sets.size?SETS:ITEMS,x=arr[i];keys.forEach(k=>total[k]+=x.bonuses[k]||0);critChance+=x.critChance||0;critDamage+=x.critDamage||0;critGaussChance+=x.critGaussChance||0;critGrenadeChance+=x.critGrenadeChance||0;critGaussDamage+=x.critGaussDamage||0;critGrenadeDamage+=x.critGrenadeDamage||0;noCooldown+=x.freeNoCooldown||0;cooldown+=x.cooldown||0});
 const t=talentTotals();keys.forEach(k=>total[k]+=t.total[k]);return{total,critChance:critChance+t.critChance,critDamage:critDamage+t.critDamage,critGaussChance,critGrenadeChance,critGaussDamage,critGrenadeDamage,noCooldown:noCooldown+t.noCooldown,cooldown:cooldown+t.cooldown};
}
function optionMarkup(arr,set,type){return arr.map((x,i)=>'<label class="option"><input type="checkbox" data-type="'+type+'" data-index="'+i+'" '+(set.has(i)?"checked":"")+'><span>'+x.name+'</span></label>').join("")}
function set(id,v){$(id).textContent=v}
function calc(){
 const level=Math.max(1,num("level"));$("level").value=level;const {total,critChance,critDamage,critGaussChance,critGrenadeChance,critGaussDamage,critGrenadeDamage,noCooldown,cooldown}=totals(),tal=talentTotals().total;
 const base={grenade:Math.round(55*Math.pow(1.02,level)),gl:Math.round(113*Math.pow(1.02,level)),gauss:Math.round(360*Math.pow(1.02,level)),knife:Math.floor(45.85+1.15*level),pistol:Math.floor(47.8+1.2*level),auto:Math.floor(53.65+1.35*level)};
 keys.forEach(k=>{const K=k[0].toUpperCase()+k.slice(1);set("base"+K,fmt(base[k]));set("gear"+K,fmt(total[k]-tal[k]));set("talentOut"+K,fmt(tal[k]));set("result"+K,fmt(base[k]+total[k]))});
 set("critGrenade",((critChance+critGrenadeChance)*100).toFixed(0)+"%");set("critGrenadeDamage",fmt(critDamage+critGrenadeDamage));set("critGl",(critChance*100).toFixed(0)+"%");set("critGlDamage",fmt(critDamage));set("critGauss",((critChance+critGaussChance)*100).toFixed(0)+"%");set("critGaussDamageOut",fmt(critDamage+critGaussDamage));set("noCooldown",(noCooldown*100).toFixed(0)+"%");set("cooldown",(cooldown*100).toFixed(0)+"%");
}
function render(){$("sets").innerHTML=optionMarkup(SETS,state.sets,"set");$("items").innerHTML=optionMarkup(ITEMS,state.items,"item");$("selectAllEquipment").checked=state.sets.size===SETS.length&&state.items.size===ITEMS.length;renderTalents();calc()}
function showToast(){const t=$("toast");t.classList.add("show");clearTimeout(window.__toastTimer);window.__toastTimer=setTimeout(()=>t.classList.remove("show"),1800)}
document.addEventListener("click",e=>{
 const guide=e.target.closest(".guide-link");if(guide){e.preventDefault();showToast();return}
 const up=e.target.closest("[data-talent-up]");if(up){const t=talentDef(up.dataset.talentUp);if(t&&canUpgrade(t)){state.talents[t[0]]=talentRank(t[0])+1;saveState();render();openTalents()}return}
 const down=e.target.closest("[data-talent-down]");if(down){const t=talentDef(down.dataset.talentDown),rank=talentRank(down.dataset.talentDown);if(t&&rank>0){state.talents[t[0]]=rank-1;saveState();render();openTalents()}return}
 if(e.target.closest("#openTalents")){openTalents();return}
 if(e.target.closest("[data-close-talents]")){closeTalents();return}
 const b=e.target.closest("[data-remove]");if(b){const s=b.dataset.remove==="set"?state.sets:state.items;s.delete(Number(b.dataset.index));saveState();render()}
});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeTalents()});
document.addEventListener("change",e=>{const i=e.target;if(!i.matches("[data-type]"))return;const s=i.dataset.type==="set"?state.sets:state.items,n=Number(i.dataset.index);i.checked?s.add(n):s.delete(n);saveState();render()});
document.addEventListener("click",e=>{const b=e.target.closest("[data-step]");if(!b)return;const input=$(b.dataset.step),dir=Number(b.dataset.dir)||0,min=Number(input.min)||0,max=Number(input.max)||999;input.value=Math.min(max,Math.max(min,(Number(input.value)||0)+dir));saveState();calc()});
$("selectAllEquipment").addEventListener("change",e=>{state.sets.clear();state.items.clear();if(e.target.checked){SETS.forEach((_,i)=>state.sets.add(i));ITEMS.forEach((_,i)=>state.items.add(i))}saveState();render()});
$("level").addEventListener("input",()=>{saveState();calc()});
$("resetAll").onclick=()=>{state.sets.clear();state.items.clear();state.talents={};$("level").value=1;saveState();render()};
loadState();render();