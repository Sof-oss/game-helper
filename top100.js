const $=id=>document.getElementById(id);
const fmt=n=>Math.round(n).toLocaleString("ru-RU");
const TOP100_TAB_KEY="gameHelperTop100Tab";

/* Три раздела рейтинга: ключ, подпись вкладки, подпись колонки-показателя,
   данные и акцентный цвет (перекликается с блоками вкладки «Информация»:
   таланты — янтарный, экспедиции — зелёный, защита лагеря — синий). */
const TOP100_TABS=[
 {key:"defense",label:"Защита лагеря",metric:"Защита лагеря",data:()=>window.TOP100_DEFENSE,accent:"#54bfff"},
 {key:"expeditions",label:"Экспедиции",metric:"Экспедиции",data:()=>window.TOP100_EXPEDITIONS,accent:"#9fdc9f"},
 {key:"talents",label:"Таланты",metric:"Таланты",data:()=>window.TOP100_TALENTS,accent:"#ffb74d"}
];

let currentTop100Tab="defense";
try{const saved=localStorage.getItem(TOP100_TAB_KEY);if(TOP100_TABS.some(t=>t.key===saved))currentTop100Tab=saved}catch{}

/* Значок покинувшего отряд игрока (та же сломанная антенна, что и в подписи под таблицей) */
const LEFT_ICON='<svg class="top100-left-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 3h6M9 21h6M6 3c0 4 3 5.5 3 9s-3 5-3 9M18 3c0 4-3 5.5-3 9s3 5 3 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';

/* Значки 1–3 места вместо медалей — радиационный символ в цвете места,
   в духе логотипа сайта (☢), а не игровые иконки из исходных картинок. */
function rankCell(rank){
 if(rank>3)return '<span class="top100-rank-num">'+rank+'</span>';
 return '<span class="top100-medal top100-medal-'+rank+'" title="'+rank+' место">☢</span><span class="top100-rank-num">'+rank+'</span>';
}

function top100RowMarkup(row,rank){
 const[nick,level,value,inactive]=row;
 const nickHtml=(inactive?LEFT_ICON:"")+nick.replace(/</g,"&lt;");
 return '<tr class="'+(rank<=3?"top100-podium top100-podium-"+rank:"")+(inactive?" top100-inactive":"")+'"><td class="top100-rank">'+rankCell(rank)+'</td><td class="top100-nick">'+nickHtml+'</td><td>'+level+'</td><td class="top100-value">'+fmt(value)+'</td></tr>';
}

function top100TableMarkup(tab){
 const rows=tab.data();
 return '<div class="data-wrap top100-scroll" style="--accent:'+tab.accent+'"><table class="data-table top100-table"><thead><tr><th>#</th><th>Ник</th><th>Ур.</th><th>'+tab.metric+'</th></tr></thead><tbody>'+rows.map((r,i)=>top100RowMarkup(r,i+1)).join("")+'</tbody></table></div>';
}

function renderTop100Tabs(){
 $("top100Tabs").innerHTML=TOP100_TABS.map(t=>'<button type="button" class="top100-tab'+(t.key===currentTop100Tab?" active":"")+'" data-top100-tab="'+t.key+'" style="--accent:'+t.accent+'">'+t.label+'</button>').join("");
}
function renderTop100Table(){
 const tab=TOP100_TABS.find(t=>t.key===currentTop100Tab)||TOP100_TABS[0];
 $("top100TableWrap").innerHTML=top100TableMarkup(tab);
}
function renderTop100(){renderTop100Tabs();renderTop100Table()}

document.addEventListener("click",e=>{
 const btn=e.target.closest("[data-top100-tab]");
 if(!btn)return;
 currentTop100Tab=btn.dataset.top100Tab;
 try{localStorage.setItem(TOP100_TAB_KEY,currentTop100Tab)}catch{}
 renderTop100();
});

renderTop100();
