const $=id=>document.getElementById(id);
const fmt=n=>Math.round(n).toLocaleString("ru-RU");

/* Разбивает массив строк на n колонок бок о бок (последняя может быть короче) —
   тот же приём, что и в исходных экспортируемых таблицах, чтобы длинный список
   талантов (135 строк) не растягивал страницу в один узкий столбец. */
function chunkRows(rows,n){
 if(n<=1)return[rows];
 const size=Math.ceil(rows.length/n),chunks=[];
 for(let i=0;i<n;i++)chunks.push(rows.slice(i*size,(i+1)*size));
 return chunks;
}
const INFO_MILESTONE_STEP=10;
/* Цвет заметки под таблицей ПДА подбирается по её тексту — так же, как в
   исходном экспортируемом изображении (см. html_progress-tables.html):
   новичок — зелёный (цвет секции), ветеран — оранжевый, учёный — бирюзовый.
   Так заметки визуально совпадают с исходником, а не идут одним серым цветом. */
function infoNoteColor(note){
 if(note.includes("ветерана"))return"#ffb74d";
 if(note.includes("ученого")||note.includes("учёного"))return"#26c6da";
 return"#6fcf97";
}
function infoTableMarkup(rows,headers){
 return '<table class="data-table info-table"><thead><tr>'+headers.map(h=>'<th>'+h+'</th>').join("")+'</tr></thead><tbody>'+rows.map(([lvl,step,totalSum])=>'<tr'+(lvl%INFO_MILESTONE_STEP===0?' class="info-milestone"':"")+'><td>'+lvl+'</td><td>'+fmt(step)+'</td><td>'+fmt(totalSum)+'</td></tr>').join("")+'</tbody></table>';
}
function infoGroupMarkup(title,ledColor,body,notes,modClass){
 return '<div class="info-group'+(modClass?" info-group-"+modClass:"")+'"><div class="info-group-title"><i class="info-led" style="--led:'+ledColor+'"></i><b>'+title+'</b></div>'+body+(notes&&notes.length?'<ul class="info-notes">'+notes.map(n=>'<li style="color:'+infoNoteColor(n)+'">'+n+'</li>').join("")+'</ul>':"")+'</div>';
}
function renderInfo(){
 const talentChunks=chunkRows(TALENT_LEVELS,3).map(rows=>infoTableMarkup(rows,["Уровень","Урон","Всего"])).join("");
 $("infoGroups").innerHTML=
  infoGroupMarkup("Таланты","#ffb74d",'<div class="info-subcols">'+talentChunks+'</div>',null,"talents")+
  infoGroupMarkup("Опыт ПДА","#9fdc9f",infoTableMarkup(PDA_LEVELS,["Уровень","Опыт","Всего"]),PDA_LEVEL_NOTES,"pda")+
  infoGroupMarkup("Опыт персонажа","#54bfff",infoTableMarkup(CHAR_LEVELS,["Уровень","Опыт","Всего"]),null,"char");
}
renderInfo();
