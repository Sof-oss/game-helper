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
const state={sets:new Set(),items:new Set()};
const keys=["knife","pistol","auto","grenade","gl","gauss"];
const names={knife:"Нож",pistol:"Пистолет",auto:"Автомат",grenade:"Граната",gl:"Гранатомёт",gauss:"Гаусс"};
const bonusText={knife:"Нож",pistol:"Пистолет",auto:"Автомат",grenade:"Граната",gl:"Гранатомёт",gauss:"Гаусс"};
const $=id=>document.getElementById(id);
const num=id=>Math.max(0,Number($(id).value)||0);
function fmt(n){return Math.round(n).toLocaleString("ru-RU")}
function totals(){
 const total=Object.fromEntries(keys.map(k=>[k,0]));
 let critChance=0,critDamage=0,critGaussChance=0,critGrenadeChance=0,critGaussDamage=0,critGrenadeDamage=0,noCooldown=0,cooldown=0;
 [...state.sets].forEach(i=>{const x=SETS[i];keys.forEach(k=>total[k]+=x.bonuses[k]||0);critChance+=x.critChance||0;critDamage+=x.critDamage||0;critGaussChance+=x.critGaussChance||0;critGrenadeChance+=x.critGrenadeChance||0;critGaussDamage+=x.critGaussDamage||0;critGrenadeDamage+=x.critGrenadeDamage||0;noCooldown+=x.freeNoCooldown||0;cooldown+=x.cooldown||0});
 [...state.items].forEach(i=>{const x=ITEMS[i];keys.forEach(k=>total[k]+=x.bonuses[k]||0);critChance+=x.critChance||0;critDamage+=x.critDamage||0;critGaussChance+=x.critGaussChance||0;critGrenadeChance+=x.critGrenadeChance||0;critGaussDamage+=x.critGaussDamage||0;critGrenadeDamage+=x.critGrenadeDamage||0;noCooldown+=x.freeNoCooldown||0;cooldown+=x.cooldown||0});
 return {total,critChance,critDamage,critGaussChance,critGrenadeChance,critGaussDamage,critGrenadeDamage,noCooldown,cooldown};
}
function optionMarkup(arr,set,type){
 return arr.map((x,i)=>`<label class="option"><input type="checkbox" data-type="${type}" data-index="${i}" ${set.has(i)?"checked":""}><span>${x.name}</span></label>`).join("");
}
function chips(arr,set,type){
 return [...set].map(i=>`<span class="chip">${arr[i].name}<button type="button" data-remove="${type}" data-index="${i}">×</button></span>`).join("")||'<span style="color:#587082;font-size:11px">Не выбрано</span>';
}
function summary(arr,set){
 if(!set.size)return '<div class="empty">Комплекты не выбраны</div>';
 return [...set].map(i=>{const x=arr[i];const parts=Object.entries(x.bonuses||{}).filter(([,v])=>v).map(([k,v])=>`<span>${bonusText[k]} <b>+${v}</b></span>`);
 if(x.critGaussChance)parts.push(`<span>Крит. шанс (Гаусс) <b>+${x.critGaussChance*100}%</b></span>`);
 if(x.critChance)parts.push(`<span>Крит. шанс <b>+${x.critChance*100}%</b></span>`);
 if(x.critDamage)parts.push(`<span>Крит. урон <b>+${x.critDamage}</b></span>`);
 if(x.critGaussDamage)parts.push(`<span>Крит. урон <b>+${x.critGaussDamage}</b></span>`);
 return `<div class="summary-item"><div class="summary-icon">♜</div><div class="summary-name">${x.name}</div><div class="summary-bonuses">${parts.join("")}</div></div>`}).join("");
}
function itemSummary(){
 if(!state.items.size)return '<div class="empty">Одиночные вещи не выбраны</div>';
 return [...state.items].map(i=>{const x=ITEMS[i];const parts=Object.entries(x.bonuses||{}).filter(([,v])=>v).map(([k,v])=>`<span>${bonusText[k]} <b>+${v}</b></span>`);
 if(x.cooldown)parts.push(`<span>Сокращение отката <b>+${x.cooldown*100}%</b></span>`);
 if(x.freeNoCooldown)parts.push(`<span>Удар без отката <b>+${x.freeNoCooldown*100}%</b></span>`);
 return `<div class="summary-item"><div class="summary-icon">◈</div><div class="summary-name">${x.name}</div><div class="summary-bonuses">${parts.join("")}</div></div>`}).join("");
}
function set(id,v){$(id).textContent=v}
function calc(){
 const level=Math.max(1,num("level"));$("level").value=level;const t={knife:num("talentKnife"),pistol:num("talentPistol"),auto:num("talentAuto"),grenade:num("talentGrenade"),gl:num("talentGl"),gauss:num("talentGauss")};
 const {total,critChance,critDamage,critGaussChance,critGrenadeChance,critGaussDamage,critGrenadeDamage,noCooldown,cooldown}=totals();
 const base={grenade:Math.round(55*Math.pow(1.02,level)),gl:Math.round(113*Math.pow(1.02,level)),gauss:Math.round(360*Math.pow(1.02,level)),knife:Math.floor(45.85+1.15*level),pistol:Math.floor(47.8+1.2*level),auto:Math.floor(53.65+1.35*level)};
 keys.forEach(k=>{
  const K=k[0].toUpperCase()+k.slice(1);
  set("base"+K,fmt(base[k]));set("gear"+K,fmt(total[k]));set("talentOut"+K,fmt(t[k]));set("result"+K,fmt(base[k]+total[k]+t[k]));
 });
 const grenadeCritChance=critChance+critGrenadeChance;
 const gaussCritChance=critChance+critGaussChance;
 const grenadeCritDamage=critDamage+critGrenadeDamage;
 const gaussCritDamage=critDamage+critGaussDamage;
 set("critGrenade", (grenadeCritChance*100).toFixed(0)+"%");set("critGrenadeDamage",fmt(grenadeCritDamage));
 set("critGl", (critChance*100).toFixed(0)+"%");set("critGlDamage",fmt(critDamage));
 set("critGauss", (gaussCritChance*100).toFixed(0)+"%");set("critGaussDamageOut",fmt(gaussCritDamage));
 set("noCooldown",(noCooldown*100).toFixed(0)+"%");set("cooldown",(cooldown*100).toFixed(0)+"%");
}
function render(){
 $("sets").innerHTML=optionMarkup(SETS,state.sets,"set");$("items").innerHTML=optionMarkup(ITEMS,state.items,"item");
 const all=state.sets.size===SETS.length&&state.items.size===ITEMS.length;
 $("selectAllEquipment").checked=all;
 calc();
}
function showToast(){const t=$("toast");t.classList.add("show");clearTimeout(window.__toastTimer);window.__toastTimer=setTimeout(()=>t.classList.remove("show"),1800)}
document.addEventListener("click",e=>{const guide=e.target.closest(".guide-link");if(guide){e.preventDefault();showToast();return}});
document.addEventListener("change",e=>{const i=e.target;if(!i.matches("[data-type]"))return;const s=i.dataset.type==="set"?state.sets:state.items;const n=Number(i.dataset.index);i.checked?s.add(n):s.delete(n);render()});
document.addEventListener("click",e=>{const b=e.target.closest("[data-remove]");if(b){const s=b.dataset.remove==="set"?state.sets:state.items;s.delete(Number(b.dataset.index));render()}});
document.addEventListener("click",e=>{
 const b=e.target.closest("[data-step]");
 if(!b)return;
 const id=b.dataset.step, input=$(id), dir=Number(b.dataset.dir)||0;
 const min=Number(input.min)||0, max=Number(input.max)||999;
 input.value=Math.min(max,Math.max(min,(Number(input.value)||0)+dir));
 calc();
});
$("selectAllEquipment").addEventListener("change",e=>{
 state.sets.clear();state.items.clear();
 if(e.target.checked){SETS.forEach((_,i)=>state.sets.add(i));ITEMS.forEach((_,i)=>state.items.add(i))}
 render();
});
["level","talentKnife","talentPistol","talentAuto","talentGrenade","talentGl","talentGauss"].forEach(id=>$(id).addEventListener("input",calc));
$("resetAll").onclick=()=>{state.sets.clear();state.items.clear();$("level").value=1;["talentKnife","talentPistol","talentAuto","talentGrenade","talentGl","talentGauss"].forEach(id=>$(id).value=0);render()};
render();