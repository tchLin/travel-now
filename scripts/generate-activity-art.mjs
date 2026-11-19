import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { activityArt } from '../app/activity-art.js';

// Original Travel Now vector drawings. Each activity has its own composition;
// region-specific architecture, foliage, food, and craft details recur as a visual language.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const palettes = {
  japan: ['#f7f0e4','#dfb1a2','#59694f','#ac6650','#cbd0b1','#b7d1cd','#615246'],
  korea: ['#f6eee3','#e1c7ac','#637763','#bc7d61','#c3cda9','#b9d0d6','#5e5751'],
  us: ['#f6eedf','#e4ba79','#577158','#b9664c','#bacba7','#adcbce','#595349'],
  china: ['#f4ecdd','#d8b890','#5b745e','#a65642','#c5c7a1','#b2c8bf','#5b5146'],
  france: ['#f8eee6','#ddbeb0','#7d8566','#b97a66','#c9c7a6','#b8cfd5','#615c5d'],
  spain: ['#f8ecda','#e6b982','#738366','#bd6d49','#d4d2a2','#add0d4','#685448'],
  germany: ['#f2eddf','#d5b994','#496952','#aa6e49','#b5c3a0','#b3c8c6','#5c5144'],
  'southeast-asia': ['#f6efdc','#dfbe89','#597a61','#bc7950','#bed3a3','#a6cbc4','#615a43'],
  europe: ['#f5eee2','#d5be9f','#667765','#ae765c','#c7cfae','#b2cad0','#5d5b50'],
};
let p, r;
const rect=(x,y,w,h,fill,rx=0)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(w/2,h/2,Math.max(rx,Math.min(w,h)*.16))}" fill="${fill}" stroke="none"/>`;
const circle=(x,y,size,fill)=>g(path(`M0 ${-size}C${size*.58} ${-size*1.06} ${size*1.06} ${-size*.5} ${size} 0C${size*1.03} ${size*.61} ${size*.44} ${size*1.04} 0 ${size}C${-size*.67} ${size*1.06} ${-size*1.07} ${size*.42} ${-size} 0C${-size*1.03} ${-size*.62} ${-size*.48} ${-size*1.05} 0 ${-size}Z`,fill,'none'),x,y);
const ellipse=(x,y,rx,ry,fill)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="none"/>`;
const path=(d,fill='none',stroke=p.ink,sw=3)=>`<path d="${d}" fill="${fill}" stroke="${fill!=='none' && stroke===p.ink ? 'none' : stroke}" stroke-width="${sw*.72}" stroke-linecap="round" stroke-linejoin="round"/>`;
const line=(x,y,xx,yy,stroke=p.ink,sw=3)=>path(`M${x} ${y}Q${(x+xx)/2+Math.min(1.8,Math.abs(yy-y)*.016)} ${(y+yy)/2-Math.min(1.6,Math.abs(xx-x)*.014)} ${xx} ${yy}`,'none',stroke,sw);
const g=(body,x=0,y=0,scale=1)=>`<g transform="translate(${x} ${y}) scale(${scale})">${body}</g>`;
const shadow=(x=320,y=385,w=215)=>g(path(`M${-w} 0C${-w*.9}-18 ${-w*.25}-22 0-17C${w*.5}-24 ${w*1.1}-9 ${w} 4C${w*.9} 23 ${w*.2} 17 0 20C${-w*.6} 19 ${-w} 16 ${-w} 0Z`,p.light,'none'),x,y);
const cloud=(x,y,s=1)=>g(path('M0 23C-3 7 14-3 29 5C41-13 70-6 74 12C96 8 109 20 105 32H0Z',p.paper,p.paper),x,y,s);
function sky(){return circle(493,101,36,p.sand)+cloud(78,88,.8)+cloud(338,58,.55)+path('M385 114q10-12 20 0q10-12 20 0','none',p.ink,2.5);}
function grass(){return path('M42 371Q160 335 301 365T603 360L603 480H42Z',p.light,p.light)+path('M84 398l4-12m0 12 9-8M521 407l5-13m-4 12 13-6','none',p.leaf,2);}
function tree(x,y,s=1){
  if(r==='southeast-asia'||r==='spain')return g(path('M0 0Q15-53 4-126','none',p.ink,8)+path('M4-120Q-52-153-71-104Q-29-119 4-120M4-120Q50-154 76-109Q37-122 4-120M4-120Q8-178-27-166Q-14-139 4-120M4-120Q45-164 55-144Q29-128 4-120',p.leaf,p.leaf),x,y,s);
  if(r==='germany'||r==='us')return g(line(0,0,0,-126,p.ink,6)+path('M0-159C-8-150-18-124-38-108Q-49-95-23-99C-33-81-43-67-52-60Q-62-48-29-51C-38-31-50-19-58-12Q-70 3-35 5Q0 15 35 5Q70 3 58-12C50-19 38-31 29-51Q62-48 52-60C43-67 33-81 23-99Q49-95 38-108C18-124 8-150 0-159Z',p.leaf,p.leaf),x,y,s);
  const pink=r==='japan';return g(line(0,0,0,-113,p.ink,6)+line(0,-56,-26,-89,p.ink,4)+line(0,-70,25,-109,p.ink,4)+path('M-54-103C-75-117-59-150-38-148C-49-177-7-188 10-169C35-190 65-163 55-142C87-124 72-89 48-90C43-65 12-60-3-78C-27-60-60-76-54-103Z',pink?p.sand:p.leaf,'none')+path('M-47-126C-33-157-9-142 3-155M17-99Q42-116 53-106','none',pink?p.paper:p.light,5)+circle(-43,-133,5,p.paper)+circle(21,-153,4,p.paper),x,y,s);
}
function plant(x,y,s=1){return g(path('M-17-28H17L12 0H-12Z',p.accent)+path('M0-29V-69M0-44Q-33-70-28-42Q-16-31 0-34M0-57Q32-86 27-57Q17-43 0-45',p.leaf,p.leaf),x,y,s);}
function lantern(x,y,s=1){return g(line(0,-30,0,-14)+rect(-13,-14,26,34,p.accent,9)+line(-8,-7,-8,13,p.sand,2)+line(8,-7,8,13,p.sand,2)+rect(-11,-17,22,5,p.ink,2)+rect(-9,19,18,5,p.ink,1)+line(0,24,0,32,p.accent,2),x,y,s);}
function window(x,y,w=25,h=35,arched=false){return (arched?path(`M${x} ${y+h}V${y+w/2}a${w/2} ${w/2} 0 0 1 ${w} 0V${y+h}Z`,p.water):rect(x,y,w,h,p.water,2))+line(x+w/2,y+2,x+w/2,y+h,p.ink,2)+line(x+2,y+h/2,x+w-2,y+h/2,p.ink,2);}
function house(x,y,w=160,h=140,variant=0){
  let body=rect(0,0,w,h,p.sand,3),roof='';
  const asian=['japan','korea','china'].includes(r);
  if(asian){roof=path(`M-14 4Q${w*.22}-8 ${w/2}-43Q${w*.78}-8 ${w+14} 4L${w+4} 13H-4Z`,r==='japan'?p.ink:p.leaf)+line(-6,9,w+6,9,p.paper,2);body+=rect(w*.38,h*.38,w*.24,h*.62,p.ink,2)+rect(w*.405,h*.42,w*.19,h*.58,p.paper,1);for(let i=1;i<4;i++)body+=line(w*.405+w*.19*i/4,h*.42,w*.405+w*.19*i/4,h,p.ink,2);body+=window(w*.1,h*.4,w*.18,h*.29)+window(w*.72,h*.4,w*.18,h*.29);if(r==='japan')for(let i=1;i<5;i++)body+=line(0,i*h/5,w*.32,i*h/5,p.accent,1.5);if(r==='china')body+=lantern(w*.09,34,.75)+lantern(w*.91,34,.75);if(r==='korea')body+=circle(w*.5,23,10,p.accent);}
  else if(r==='france'){roof=path(`M-7 3L12-32H${w-12}L${w+7} 3Z`,p.ink)+rect(w*.36,-28,w*.28,31,p.paper,2)+window(w*.43,-22,w*.14,19);body+=window(w*.12,25,w*.2,37,true)+window(w*.68,25,w*.2,37,true)+path(`M${w*.39} ${h}V${h-45}q${w*.11}-23 ${w*.22} 0V${h}Z`,p.ink)+line(w*.06,76,w*.94,76,p.accent,3);for(const xx of [w*.08,w*.35,w*.64,w*.91])body+=rect(xx,26,6,38,p.leaf);}
  else if(r==='spain'){roof=path(`M-9 3L${w/2}-28L${w+9} 3Z`,p.accent);for(let i=0;i<8;i++)roof+=line(w*i/8,0,w*i/8+5,-7,p.sand,2);body+=path(`M${w*.35} ${h}V${h*.5}a${w*.15} ${w*.15} 0 0 1 ${w*.3} 0V${h}Z`,p.ink)+window(w*.09,27,w*.17,37,true)+window(w*.74,27,w*.17,37,true);for(let i=0;i<12;i++)body+=rect(i*w/12,h-8,w/12,8,i%2?p.paper:p.water);}
  else if(r==='germany'){roof=path(`M-10 4L${w/2}-53L${w+10} 4Z`,p.accent);body=rect(0,0,w,h,p.paper,2)+line(0,0,w,h,p.ink,7)+line(w,0,0,h,p.ink,7)+line(w/2,0,w/2,h,p.ink,7)+line(0,h/2,w,h/2,p.ink,6)+line(0,0,0,h,p.ink,7)+line(w,0,w,h,p.ink,7)+window(w*.08,15,w*.23,34)+window(w*.69,15,w*.23,34)+rect(w*.37,h*.57,w*.26,h*.43,p.accent,3);}
  else if(r==='southeast-asia'){roof=path(`M-5 1L13-16H${w-13}L${w+5} 1Z`,p.accent);body=rect(0,0,w,h,p.sand,3)+rect(0,h*.53,w,10,p.paper)+window(w*.1,18,w*.28,40,true)+window(w*.62,18,w*.28,40,true)+path(`M${w*.15} ${h}V${h*.72}q${w*.12}-22 ${w*.24} 0V${h}Z`,p.ink)+path(`M${w*.61} ${h}V${h*.72}q${w*.12}-22 ${w*.24} 0V${h}Z`,p.ink);for(let i=0;i<4;i++)body+=line(w*.12,28+i*7,w*.35,28+i*7,p.leaf,3)+line(w*.64,28+i*7,w*.87,28+i*7,p.leaf,3);}
  else if(r==='us'){roof=path(`M-15 5L${w/2}-40L${w+15} 5Z`,p.leaf);for(let i=1;i<6;i++)body+=line(0,i*h/6,w,i*h/6,p.paper,2);body+=rect(w*.39,h*.45,w*.22,h*.55,p.accent,3)+window(w*.1,22,w*.22,40)+window(w*.69,22,w*.22,40)+rect(-14,h-20,w+28,12,p.paper,2)+line(-9,h-20,-9,h+6,p.ink,4)+line(w+9,h-20,w+9,h+6,p.ink,4);}
  else {roof=path(`M-9 4L${w/2}-44L${w+9} 4Z`,p.accent);body+=window(w*.1,24,w*.2,36,true)+window(w*.7,24,w*.2,36,true)+path(`M${w*.37} ${h}V${h-42}q${w*.13}-25 ${w*.26} 0V${h}Z`,p.ink)+rect(w*.05,65,w*.9,7,p.paper);}
  if(variant%2)body+=rect(w*.78,-42,14,30,p.ink,2);
  return g(body+roof,x,y);
}
function regionalBackdrop(){return house(82,198,100,105,1)+house(446,206,102,99,0);}
function cup(x,y,s=1){return g(ellipse(0,31,37,8,p.light)+path('M-26-13H23V16Q18 39-3 35Q-25 34-26 16Z',p.paper)+path('M24-6Q55-7 47 17Q39 27 25 18','none',p.ink,4)+ellipse(-1,-13,25,7,p.accent)+path('M-13-29q-10-11 0-24M7-30q11-11 0-24','none',p.ink,2.5),x,y,s);}
function bread(x,y,s=1){const bakery={japan:'melon',korea:'roll',us:'pie',china:'mooncake',france:'croissant',spain:'churro',germany:'pretzel','southeast-asia':'coconut',europe:'loaf'}[r];let v='';
  if(bakery==='croissant')v=path('M-58 0Q-33-47 0-26Q33-47 58 0L37 16Q21-3 0 6Q-21-3-37 16Z',p.sand)+line(-20,-22,-12,5,p.accent,3)+line(20,-22,12,5,p.accent,3);
  else if(bakery==='pretzel')v=path('M-26 19C-65 8-43-44-17-15L24 27C43 38 63 6 40-15C13-40-26 16-9 28C7 40 38 13 22-4C6-22-28 7-26 19Z',p.sand,p.accent,8);
  else if(bakery==='churro')v=path('M-39 26L-22-35M-8 28L10-35M24 27L41-35','none',p.sand,17)+path('M-39 26L-22-35M-8 28L10-35M24 27L41-35','none',p.accent,3);
  else if(bakery==='pie')v=path('M-55 0Q0-49 55 0L45 29H-45Z',p.sand)+line(-40,-5,30,22,p.accent,5)+line(-22,-19,47,10,p.accent,5)+line(40,-5,-30,22,p.accent,5)+line(22,-19,-47,10,p.accent,5);
  else if(bakery==='mooncake')v=circle(0,0,38,p.sand)+circle(0,0,28,p.paper)+path('M-15-12Q0-29 15-12Q29 0 15 12Q0 28-15 12Q-28 0-15-12Z',p.accent)+circle(0,0,8,p.sand);
  else if(bakery==='melon')v=ellipse(0,0,48,32,p.sand)+path('M-30-23L20 26M-10-30L38 16M-40-9L0 29M30-23L-20 26M10-30L-38 16M40-9L0 29','none',p.accent,2.5);
  else if(bakery==='coconut')v=ellipse(0,0,46,30,p.sand)+ellipse(0,-1,30,18,p.paper)+path('M-15-4l8 8m6-16 8 11m4-2 9 7','none',p.light,3);
  else v=path('M-48 16Q-54-31 0-30Q54-31 48 16Z',p.sand)+path('M-27-14l12 18M-4-20 8 0M21-14l12 17','none',p.accent,4);
  return g(ellipse(0,22,63,14,p.paper)+v,x,y,s);
}
function bowl(x,y,s=1,kind='dinner'){
  let meal=ellipse(0,0,70,32,p.paper)+ellipse(0,-2,57,24,p.sand);
  if(kind==='breakfast'&&['us','france','spain','germany','europe'].includes(r)){
    if(r==='us')meal=ellipse(0,10,64,20,p.sand)+ellipse(0,-2,62,20,p.accent)+ellipse(0,-10,61,20,p.sand)+rect(-14,-28,27,19,p.paper,3)+path('M20-16q-5 18 16 25','none',p.accent,7);
    else if(r==='spain')meal+=rect(-39,-24,58,42,p.sand,10)+rect(-32,-17,44,28,p.accent,6)+circle(45,2,20,p.sand)+circle(45,2,15,p.paper)+path('M45-12V16M31 2H59M35-8L55 12M35 12L55-8','none',p.sand,2);
    else meal+=bread(-5,-7,.65)+circle(47,4,17,p.paper)+circle(47,4,8,p.sand);
  }else if(kind==='breakfast'&&r==='china'){meal=ellipse(0,0,73,33,p.sand)+ellipse(0,-5,64,27,p.paper);for(const [x,y]of[[-27,0],[7,-12],[30,8]])meal+=circle(x,y,19,p.paper)+path(`M${x-7} ${y-6}q9-12 13 0q2 8-6 5`,'none',p.accent,2);meal+=path('M-66 10q66 48 132 0','none',p.accent,4);
  }else if(kind==='breakfast'&&r==='southeast-asia'){meal=path('M-80 4Q-4-60 80 4Q0 59-80 4Z',p.leaf)+path('M-30 10Q-38-28 0-28Q38-28 30 10Z',p.paper,p.paper)+ellipse(42,10,18,10,p.sand)+ellipse(57,-5,17,9,p.sand);
  }else if(kind==='breakfast'){meal+=path('M-39-1Q-33-39 0-37Q33-39 39-1Z',p.paper,p.paper)+path('M-26 2h52','none',p.ink,2)+circle(44,9,10,p.accent);}
  else if(r==='china'){for(const [x,y]of[[-26,-3],[8,-11],[31,8],[-10,13]])meal+=path(`M${x-16} ${y+6}Q${x} ${y-24} ${x+16} ${y+6}Z`,p.paper)+path(`M${x-8} ${y+1}l4-8m4 7v-9m5 10 3-7`,'none',p.accent,1.5);}
  else if(r==='spain'){meal=ellipse(0,0,75,32,p.ink)+ellipse(0,-4,66,25,p.sand)+line(-78,0,-94,-2,p.ink,7)+line(78,0,94,-2,p.ink,7);for(const[x,y]of[[-33,-5],[12,9],[38,-9]])meal+=path(`M${x-11} ${y}q3-19 17-9q12 9-4 18`,'none',p.accent,7);meal+=circle(-8,-13,5,p.leaf)+circle(45,10,5,p.leaf);}
  else if(r==='us')meal=path('M-50-7Q-46-49 0-49Q46-49 50-7Z',p.sand)+path('M-52 0Q-25-12 0 0T52 0','none',p.leaf,10)+rect(-50,7,100,12,p.accent,6)+path('M-48 24H48Q43 45 0 43Q-43 45-48 24Z',p.sand)+circle(-22,-27,2,p.paper)+circle(9,-31,2,p.paper)+circle(26,-20,2,p.paper);
  else if(r==='germany')meal+=path('M-41 2Q-10-24 25-4','none',p.accent,14)+circle(31,9,11,p.sand)+circle(48,3,9,p.sand)+path('M-42 15q14-16 21 1','none',p.leaf,8);
  else if(r==='france')meal+=ellipse(0,-4,51,20,p.accent)+path('M-19-9q16-13 31 2q13 12-7 15','none',p.paper,4)+circle(-26,2,4,p.leaf)+circle(25,-9,3,p.leaf);
  else if(r==='korea')meal+=path('M-43-8Q-34-27-17-16M15-18Q38-28 45-6M-35 16Q-15 23-10 12','none',p.leaf,12)+path('M18 11l23 1','none',p.accent,12)+circle(0,-2,19,p.paper)+circle(0,-2,10,p.sand);
  else meal+=path('M-35-7q12-14 26 0t27 0M-32 6q12-14 26 0t27 0','none',p.paper,5)+circle(31,4,14,p.paper)+circle(31,4,7,p.sand)+path('M-29-14l12 13m-2-18 14 13','none',p.leaf,5);
  if(kind==='breakfast'&&r==='japan')meal+=path('M-61 12L-41 7L-26 17L-46 23Z',p.accent)+line(59,-44,70,36,p.ink,2)+line(68,-44,79,36,p.ink,2);
  if(kind==='breakfast'&&r==='korea')meal+=ellipse(-57,14,20,10,p.paper)+path('M-68 14l11-8 8 8-12 6Z',p.accent)+line(73,-42,69,35,p.ink,3)+ellipse(73,-43,7,11,p.paper);
  if(!['us','spain'].includes(r))meal+=path('M-69 2Q-60 57 0 60Q60 57 69 2','none',p.ink,3);
  return g(meal,x,y,s);
}
function table(){return ellipse(320,345,167,48,p.sand)+line(235,365,219,439,p.ink,7)+line(405,365,421,439,p.ink,7);}
function bike(x=315,y=326,s=1){return g(circle(-72,18,44,p.paper)+circle(72,18,44,p.paper)+path('M-72 18L-26-40 7 18H-72L-41-20H45L72 18M7 18 36-47M-37-48h31M35-49h25l11-16','none',p.accent,6)+circle(7,18,9,p.ink),x,y,s);}
function parasol(x,y,s=1){return g(line(0,0,0,-128,p.ink,5)+path('M-80-97Q0-192 80-97Z',p.paper)+path('M-80-97Q-25-165 0-153L-24-97ZM0-153Q25-165 80-97H25Z',p.accent,p.accent),x,y,s);}
function framedArt(x,y,s=1){return g(rect(-45,-60,90,120,p.paper,4)+rect(-35,-50,70,100,p.light,2)+circle(8,-21,21,p.sand)+path('M-35 50L-9-5 35 50Z',p.accent,p.accent)+path('M-35 50L8 13 35 50Z',p.leaf,p.leaf),x,y,s);}
function scene(activity){switch(activity){
  case 'cafe':return sky()+house(67,186,153,139)+tree(547,361,.85)+shadow()+table()+cup(306,302,1.1)+bread(402,321,.58)+rect(219,311,35,47,p.paper,2)+line(229,324,244,324,p.accent,2)+plant(488,378,.9);
  case 'breakfast':return cloud(67,61,.8)+rect(132,72,376,211,p.sand,9)+rect(148,88,344,175,p.water,4)+line(320,88,320,263,p.paper,9)+line(148,171,492,171,p.paper,9)+circle(414,130,27,p.paper)+path('M148 239Q231 154 320 239T492 224L492 263H148Z',p.light,p.light)+shadow(320,397,235)+table()+bowl(303,310,1.1,'breakfast')+cup(444,295,.58)+g(house(0,0,74,66),82,177,.55)+plant(110,363,.8);
  case 'market':{let v=sky()+regionalBackdrop()+shadow(320,390,248)+rect(147,249,346,128,p.sand,3)+rect(135,208,370,57,p.paper,3);for(let i=0;i<10;i++)v+=rect(135+i*37,208,19,57,p.accent,2);v+=path('M135 208L167 164H473L505 208Z',p.paper)+line(153,267,153,389,p.ink,6)+line(489,267,489,389,p.ink,6);for(let i=0;i<3;i++)v+=rect(170+i*102,283,85,65,p.paper,3)+circle(187+i*102,298,12,i===1?p.sand:p.accent)+circle(214+i*102,297,13,i===1?p.leaf:p.sand)+circle(235+i*102,319,11,p.leaf);return v+plant(92,390,.8);}
  case 'museum':return sky()+shadow()+house(93,161,145,190)+rect(252,142,279,211,p.sand,5)+rect(269,161,245,171,p.paper,3)+framedArt(331,246,.7)+framedArt(448,246,.7)+rect(278,350,238,14,p.ink,2)+line(290,364,290,390,p.ink,5)+line(504,364,504,390,p.ink,5)+plant(572,366,.85);
  case 'heritage':return sky()+grass()+shadow(320,381,220)+house(197,179,246,177,1)+house(82,244,90,112)+house(469,244,90,112)+path('M276 356L247 480H393L365 356Z',p.sand,p.sand)+plant(161,378,.8)+plant(483,378,.8);
  case 'park':return sky()+grass()+tree(101,339,1.25)+tree(541,342,1.1)+house(253,214,125,92)+path('M174 346L430 334L480 413L199 427Z',p.paper)+path('M180 362L441 353M189 389L457 378M232 342L260 424M290 339L317 420M350 338L376 416M407 335L437 410','none',p.accent,5)+cup(335,357,.55)+bread(272,390,.6)+rect(385,354,38,35,p.sand,5)+path('M390 354v-12q15-17 28 0v12');
  case 'garden':return sky()+grass()+tree(102,333,1.13)+house(394,201,162,124)+ellipse(302,353,154,59,p.water)+path('M179 343Q305 248 422 343','none',p.accent,15)+path('M179 327Q305 226 422 327','none',p.ink,4)+line(207,305,207,327)+line(252,282,252,304)+line(300,274,300,294)+line(350,282,350,304)+line(396,307,396,330)+ellipse(282,377,22,6,p.light)+plant(466,395,.8)+plant(146,397,.6);
  case 'old-town':return sky()+path('M260 262H378L465 480H172Z',p.sand,p.sand)+house(56,170,155,205,1)+house(421,170,155,205,0)+house(235,208,92,106,1)+house(337,218,68,96)+path('M226 407h168M238 380h145M249 355h123M208 438h203M292 355l-6 24m47 1 5 26m-80 1-5 29m103 4 5 23','none',p.paper,4)+plant(185,411,.8)+plant(453,398,.7);
  case 'train':{let v=sky()+path('M25 282Q142 127 274 278Q421 132 615 277V357H25Z',p.light,p.light)+tree(88,334,.75)+tree(560,333,.8)+house(43,253,77,83)+path('M31 401H609M31 419H609','none',p.ink,4);for(let i=0;i<17;i++)v+=line(39+i*35,395,56+i*35,427,p.ink,3);v+=rect(137,220,364,152,p.paper,25)+rect(137,313,364,42,p.accent,4)+path('M156 220Q185 183 228 191H440Q479 190 494 220Z',p.leaf)+circle(207,375,22,p.ink)+circle(430,375,22,p.ink)+circle(207,375,10,p.sand)+circle(430,375,10,p.sand);for(let i=0;i<4;i++)v+=rect(160+i*86,243,64,49,p.water,7)+line(192+i*86,244,192+i*86,291,p.paper,3);return v+line(148,329,491,329,p.paper,3);}
  case 'cycling':return sky()+grass()+house(412,200,140,120,1)+tree(103,334,1)+path('M0 410Q227 309 640 410','none',p.paper,48)+shadow(315,391,147)+bike()+rect(351,264,45,29,p.sand,3)+line(357,270,390,270,p.accent,2)+plant(521,416,.6);
  case 'beach':return sky()+rect(0,234,640,246,p.water)+path('M0 314Q235 297 363 349Q508 386 640 342V480H0Z',p.sand,p.sand)+path('M22 285q42 10 84 0m182-18q42 10 84 0m100 25q42 10 84 0','none',p.paper,3)+parasol(226,385,1.08)+path('M325 338L399 351L375 412L300 395Z',p.paper)+path('M336 341L411 356M328 355L402 369M317 379L386 396','none',p.accent,7)+line(324,405,305,436,p.ink,4)+line(381,414,395,436,p.ink,4)+cup(449,400,.6)+tree(576,377,.9)+house(66,241,82,70);
  case 'boat':return sky()+house(61,180,129,123)+house(449,175,131,128,1)+rect(0,298,640,182,p.water)+path('M145 350H503L462 397H202Z',p.accent)+rect(239,287,179,61,p.paper,6)+rect(252,299,57,34,p.water,3)+rect(324,299,78,34,p.water,3)+path('M229 287H427L407 268H252Z',p.leaf)+line(333,265,333,208,p.ink,4)+path('M333 208L375 221L333 233Z',p.sand)+path('M103 416q48 13 99 0m14 10q75 16 151 0m47-13q63 12 121 0','none',p.paper,4)+(r==='southeast-asia'?line(477,351,561,310,p.ink,6):circle(212,362,12,p.paper));
  case 'hiking':return sky()+path('M10 347C68 273 120 137 160 137C198 137 249 290 282 329C321 258 359 111 398 111C446 111 560 272 630 347Z',p.leaf,p.leaf)+path('M118 193Q144 137 160 137Q177 137 204 204Q180 188 171 190Q159 211 155 203Q143 181 138 181Z',p.paper,p.paper)+path('M347 184Q380 111 398 111Q424 111 474 203Q442 184 424 187Q406 160 403 165Q388 190 383 184Z',p.paper,p.paper)+path('M0 347Q155 283 313 347T640 326V480H0Z',p.light,p.light)+path('M164 480Q440 388 320 340','none',p.sand,43)+tree(91,394,.7)+tree(543,390,.7)+house(442,286,72,65)+rect(394,332,57,69,p.accent,15)+path('M407 335v-13q15-16 30 0v13')+rect(403,364,39,26,p.sand,5)+line(460,338,483,425,p.ink,5);
  case 'spa':return sky()+house(55,161,175,158,1)+tree(537,322,1)+shadow(322,401,230)+ellipse(322,353,209,76,p.ink)+ellipse(322,344,196,67,p.sand)+ellipse(322,337,174,48,p.water)+path('M260 312q-18-23 0-44m55 48q-18-23 0-44m56 40q-18-23 0-44','none',p.paper,5)+rect(412,307,59,24,p.paper,7)+rect(418,294,49,18,p.paper,7)+ellipse(169,322,27,16,p.light)+plant(510,414,.8);
  case 'resort':return sky()+grass()+house(172,147,298,189,1)+rect(204,341,239,20,p.accent,3)+path('M255 362L229 439H414L387 362Z',p.sand,p.sand)+tree(88,347,1.2)+tree(552,347,1.1)+rect(111,333,43,62,p.paper,8)+path('M119 334v-14q14-12 27 0v14')+line(125,346,125,385,p.accent,3)+line(139,346,139,385,p.accent,3)+plant(468,391,.8);
  case 'bakery':return sky()+house(74,171,182,186,1)+rect(276,193,265,171,p.sand,4)+rect(273,181,270,48,p.paper,3)+path('M273 181H543L521 151H295Z',p.accent)+rect(296,244,225,93,p.paper,4)+bread(354,287,.7)+bread(459,290,.65)+rect(292,344,233,26,p.accent,3)+rect(156,275,41,57,p.ink,3)+plant(555,390,.8)+shadow(320,407,215);
  case 'dinner':return rect(75,59,490,246,p.light,17)+house(107,169,111,120)+house(418,164,114,125,1)+path('M100 94Q317 156 541 92','none',p.ink,2)+[132,206,283,360,435,510].map((x,i)=>circle(x,110+Math.sin(i*.62)*18,7,p.paper)).join('')+shadow(320,417,219)+table()+bowl(311,307,1.16)+cup(477,321,.55)+rect(187,283,15,58,p.paper,3)+path('M193 279q-12-16 0-27q13 12 0 27Z',p.sand,p.sand)+line(232,298,209,363,p.ink,4)+line(248,298,228,365,p.ink,4);
  case 'shopping':return sky()+house(78,175,191,187,1)+rect(300,194,246,170,p.sand,4)+rect(293,170,260,43,p.accent,4)+rect(321,235,105,96,p.paper,4)+rect(444,235,76,129,p.leaf,4)+( ['japan','korea','china'].includes(r)?path('M346 298q-19-35 5-41v-15h24v15q24 6 5 41Z',p.accent)+path('M390 307q-15-25 3-31v-12h18v12q18 6 3 31Z',p.water):[0,1,2,3,4].map((n)=>rect(333+n*16,265-(n%2)*7,13,53+(n%2)*7,n%2?p.accent:p.water,2)).join(''))+rect(237,336,60,64,p.paper,5)+path('M249 337v-13q18-21 36 0v13')+plant(570,393,.8);
  case 'music':{let body=rect(72,63,496,324,p.light,18)+g(house(0,0,74,66),378,147,.7)+path('M73 64H190Q147 213 109 312H73Z',p.accent,p.accent)+path('M567 64H450Q493 213 531 312H567Z',p.accent,p.accent)+rect(73,360,494,27,p.sand,3)+ellipse(321,374,142,19,p.sand)+line(440,171,440,350,p.ink,5)+ellipse(440,168,17,8,p.ink)+line(440,350,413,371,p.ink,4)+line(440,350,467,371,p.ink,4);
    if(r==='france'||r==='germany')body+=rect(247,220,143,96,p.accent,8)+rect(232,217,28,101,p.paper,4)+rect(377,217,25,101,p.ink,4)+Array.from({length:7},(_,i)=>line(269+i*15,224,269+i*15,309,p.paper,3)).join('')+Array.from({length:5},(_,i)=>rect(235,226+i*17,15,9,p.ink,1)).join('');
    else body+=g(ellipse(0,16,45,56,p.sand)+ellipse(0,-28,33,40,p.sand)+rect(-10,-124,20,111,p.accent,4)+rect(-15,-147,30,34,p.ink,5)+circle(0,-5,15,p.ink)+line(-5,-128,-5,53,p.paper,1.5)+line(0,-128,0,53,p.paper,1.5)+line(5,-128,5,53,p.paper,1.5)+rect(-15,48,30,7,p.accent,2),315,278);
    return body+path('M181 146v39q-22-8-19 6q4 10 19-1v-44l28-8v38q-23-8-20 7q5 9 20-1v-44Z',p.ink,p.ink)+plant(100,416,.75)+plant(544,416,.75);}
  case 'sunset':return rect(0,0,640,480,p.sand)+circle(322,178,73,p.paper)+path('M0 280Q100 219 223 280Q386 209 640 281V480H0Z',p.water,p.water)+path('M0 352Q151 320 298 352T640 348V480H0Z',p.light,p.light)+house(70,264,132,110,1)+house(448,264,128,110)+path('M250 378h140M233 396h173M260 414h121','none',p.paper,5)+path('M414 124q12-13 24 0q12-13 24 0','none',p.ink,3)+(r==='japan'||r==='china'?lantern(230,319,1.1)+lantern(411,319,1.1):tree(552,385,.65));
  default:throw new Error(`Unknown activity: ${activity}`);
}}
const escape = text => text.replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
for(const art of activityArt){
  r=art.region;const [paper,sand,leaf,accent,light,water,ink]=palettes[r];p={paper,sand,leaf,accent,light,water,ink};
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480" role="img" aria-labelledby="title"><title id="title">${escape(art.labels.en)}</title><rect width="640" height="480" rx="20" fill="${paper}"/><g stroke="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${scene(art.activity)}</g></svg>\n`;
  const file=resolve(root,'app',art.src);await mkdir(dirname(file),{recursive:true});await writeFile(file,svg);
}
console.log(`Generated ${activityArt.length} original activity illustrations across ${Object.keys(palettes).length} destinations.`);
