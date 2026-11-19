// Local-only import. No request is sent to the source website and imported hours
// are never represented as a live or verified opening-hours lookup.
const MAX_INPUT = 100000;
const MAX_TEXT = 6000;
const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday','PublicHolidays'];
const dayLabels = {
  'zh-CN':['周一','周二','周三','周四','周五','周六','周日','公共假日'],
  'zh-TW':['週一','週二','週三','週四','週五','週六','週日','公共假日'],
};
const labels = {
  en:{closed:'Closed',allDay:'Open 24 hours',nextDay:'next day',unknownDays:'Days not specified',from:'from',through:'through'},
  'zh-CN':{closed:'休息',allDay:'全天营业',nextDay:'次日',unknownDays:'未注明营业日',from:'起',through:'至'},
  'zh-TW':{closed:'休息',allDay:'全天營業',nextDay:'次日',unknownDays:'未註明營業日',from:'起',through:'至'},
};
export const openingHoursMessages = {
  'Hours source must be a valid http:// or https:// URL without credentials.':['营业时间来源必须是有效且不含登录信息的 http:// 或 https:// 链接。','營業時間來源必須是有效且不含登入資訊的 http:// 或 https:// 連結。'],
  'Opening hours must be text or an hours object.':['营业时间必须是文字或营业时间对象。','營業時間必須是文字或營業時間物件。'],
  'Opening hours must be text up to 6000 characters.':['营业时间必须是文字，最多 6000 个字符。','營業時間必須是文字，最多 6000 個字元。'],
  'Hours checked date must be a valid YYYY-MM-DD date.':['核对日期必须是有效的 YYYY-MM-DD 日期。','核對日期必須是有效的 YYYY-MM-DD 日期。'],
  'Hours must be marked as manual or imported, not live verified.':['营业时间必须标记为手动填写或导入，不可标记为实时核实。','營業時間必須標記為手動填寫或匯入，不可標記為即時核實。'],
  'Imported hours contain an invalid validity date.':['导入的营业时间包含无效的适用日期。','匯入的營業時間包含無效的適用日期。'],
  'Imported opening hours contain an invalid time.':['导入的营业时间包含无效时间。','匯入的營業時間包含無效時間。'],
  'Invalid openingHoursSpecification entry.':['openingHoursSpecification 条目无效。','openingHoursSpecification 項目無效。'],
  'Imported hours contain too many days.':['导入的营业时间包含过多营业日。','匯入的營業時間包含過多營業日。'],
  'Imported hours contain an unsupported day of week.':['导入的营业时间包含不支持的星期值。','匯入的營業時間包含不支援的星期值。'],
  'Imported hours validity dates are reversed.':['导入的营业时间适用日期顺序颠倒。','匯入的營業時間適用日期順序顛倒。'],
  'Imported opening time must be earlier than 24:00.':['导入的开门时间必须早于 24:00。','匯入的開門時間必須早於 24:00。'],
  'Identical opening and closing times are ambiguous. Paste the hours as text instead.':['开门与关门时间相同，含义不明确。请改为粘贴文字说明。','開門與關門時間相同，含義不明確。請改為貼上文字說明。'],
  'Imported hours contain too many entries.':['导入的营业时间条目过多。','匯入的營業時間項目過多。'],
  'Imported openingHours must contain text.':['导入的 openingHours 必须包含文字。','匯入的 openingHours 必須包含文字。'],
  'The hours document is too complex. Paste just one place’s opening hours.':['营业时间文档过于复杂。请仅粘贴一个地点的营业时间。','營業時間文件過於複雜。請僅貼上一個地點的營業時間。'],
  'No schema.org opening hours were found. Paste hours as plain text instead.':['未找到 schema.org 营业时间。请改为粘贴纯文字。','未找到 schema.org 營業時間。請改為貼上純文字。'],
  'This document contains hours for multiple places. Paste only the intended place’s data.':['此文档包含多个地点的营业时间。请仅粘贴目标地点的数据。','此文件包含多個地點的營業時間。請僅貼上目標地點的資料。'],
  'The imported document contains no opening hours.':['导入的文档不包含营业时间。','匯入的文件不包含營業時間。'],
  'The hours JSON could not be read. Check the file or paste hours as text.':['无法读取营业时间 JSON。请检查文件或改为粘贴文字。','無法讀取營業時間 JSON。請檢查檔案或改為貼上文字。'],
  'Paste opening hours or a JSON/HTML file smaller than 100 KB.':['请粘贴营业时间，或导入小于 100 KB 的 JSON/HTML 文件。','請貼上營業時間，或匯入小於 100 KB 的 JSON/HTML 檔案。'],
  'No JSON-LD hours were found in this HTML. Paste the visible hours as plain text.':['此 HTML 中未找到 JSON-LD 营业时间。请粘贴页面上显示的营业时间文字。','此 HTML 中未找到 JSON-LD 營業時間。請貼上頁面上顯示的營業時間文字。'],
};
const error = message => { throw new Error(message); };
function cleanText(value, limit, message) {
  if(typeof value!=='string' || value.length>limit || /\u0000/.test(value)) error(message);
  return value.trim();
}
function validDate(value) {
  return typeof value==='string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10)===value;
}
function sourceURL(value) {
  if(value==null || value==='')return '';
  if(typeof value!=='string' || value.length>2048)error('Hours source must be a valid http:// or https:// URL without credentials.');
  try { const url=new URL(value.trim());if(!['https:','http:'].includes(url.protocol)||url.username||url.password)throw new Error();return url.href; }
  catch { error('Hours source must be a valid http:// or https:// URL without credentials.'); }
}
export function normalizeHours(value) {
  if(value==null || value==='')return null;
  if(typeof value==='string')value={text:value};
  if(!value || typeof value!=='object' || Array.isArray(value))error('Opening hours must be text or an hours object.');
  const text=cleanText(value.text??'',MAX_TEXT,'Opening hours must be text up to 6000 characters.');
  if(!text)return null;
  const checkedAt=value.checkedAt??'';
  if(checkedAt!==''&&!validDate(checkedAt))error('Hours checked date must be a valid YYYY-MM-DD date.');
  const kind=value.kind??'manual';
  if(!['manual','imported'].includes(kind))error('Hours must be marked as manual or imported, not live verified.');
  return {text,sourceUrl:sourceURL(value.sourceUrl),checkedAt,kind};
}
function schemaDate(value) {
  if(value==null || value==='')return '';
  if(typeof value!=='string')error('Imported hours contain an invalid validity date.');
  if(validDate(value))return value;
  if(/^\d{4}-\d{2}-\d{2}T/.test(value)&&validDate(value.slice(0,10))&&Number.isFinite(Date.parse(value)))return value.slice(0,10);
  error('Imported hours contain an invalid validity date.');
}
function clock(value) {
  if(typeof value!=='string'||!/^([01]\d|2[0-3]):[0-5]\d(?::00)?$/.test(value)) {
    if(value==='24:00'||value==='24:00:00')return '24:00';
    error('Imported opening hours contain an invalid time.');
  }
  return value.slice(0,5);
}
function formatSpecification(spec,language) {
  if(!spec || typeof spec!=='object' || Array.isArray(spec))error('Invalid openingHoursSpecification entry.');
  const words=labels[language]||labels.en;
  const inputDays=spec.dayOfWeek==null?[]:Array.isArray(spec.dayOfWeek)?spec.dayOfWeek:[spec.dayOfWeek];
  if(inputDays.length>8)error('Imported hours contain too many days.');
  const dayNames=inputDays.map(day=>{
    const name=typeof day==='object'&&day?day['@id']:day;
    if(typeof name!=='string')error('Imported hours contain an unsupported day of week.');
    const canonical=name.replace(/^https?:\/\/schema\.org\//,'');
    const index=days.indexOf(canonical);
    if(index<0)error('Imported hours contain an unsupported day of week.');
    return dayLabels[language]?.[index]||canonical;
  });
  const from=schemaDate(spec.validFrom),through=schemaDate(spec.validThrough);
  if(!inputDays.length&&!from&&!through&&spec.opens==null&&spec.closes==null)error('Invalid openingHoursSpecification entry.');
  if(from&&through&&from>through)error('Imported hours validity dates are reversed.');
  let range;
  if(spec.opens==null || spec.opens==='')range=words.closed;
  else {
    const opens=clock(spec.opens),closes=clock(spec.closes);
    if(opens==='24:00')error('Imported opening time must be earlier than 24:00.');
    if(opens==='00:00'&&closes==='00:00')range=words.closed;
    else if(opens==='00:00'&&['23:59','24:00'].includes(closes))range=words.allDay;
    else if(opens===closes)error('Identical opening and closing times are ambiguous. Paste the hours as text instead.');
    else range=`${opens}–${closes}${closes<opens?` (${words.nextDay})`:''}`;
  }
  const validity=from||through?` [${from?`${words.from} ${from}`:''}${from&&through?' · ':''}${through?`${words.through} ${through}`:''}]`:'';
  return `${dayNames.length?[...new Set(dayNames)].join(', '):words.unknownDays}: ${range}${validity}`;
}
function candidateText(candidate,language) {
  let values=[];
  if(candidate.openingHours!=null) {
    const input=Array.isArray(candidate.openingHours)?candidate.openingHours:[candidate.openingHours];
    if(input.length>100)error('Imported hours contain too many entries.');
    values=input.map(value=>cleanText(value,MAX_TEXT,'Imported openingHours must contain text.')).filter(Boolean);
  }
  if(candidate.openingHoursSpecification!=null) {
    const specifications=Array.isArray(candidate.openingHoursSpecification)?candidate.openingHoursSpecification:[candidate.openingHoursSpecification];
    if(specifications.length>100)error('Imported hours contain too many entries.');
    // A structured specification is more explicit than a compact openingHours
    // string; preserve every declared split interval and validity qualifier.
    values=specifications.map(spec=>formatSpecification(spec,language));
  }
  return values.join('\n');
}
function extractStructured(data,language) {
  if(Array.isArray(data)&&data.length&&data.every(item=>item&&typeof item==='object'&&('dayOfWeek'in item||item['@type']==='OpeningHoursSpecification')))data={openingHoursSpecification:data};
  if(data&&typeof data==='object'&&!Array.isArray(data)&&(data['@type']==='OpeningHoursSpecification'||('dayOfWeek'in data&&('opens'in data||'closes'in data))))data={openingHoursSpecification:data};
  const queue=[data],candidates=[];let count=0;
  while(queue.length) {
    if(++count>1000)error('The hours document is too complex. Paste just one place’s opening hours.');
    const node=queue.shift();
    if(!node||typeof node!=='object')continue;
    if(!Array.isArray(node)&&('openingHours'in node||'openingHoursSpecification'in node)) {candidates.push(node);continue;}
    queue.push(...Object.values(node).filter(value=>value&&typeof value==='object'));
  }
  if(!candidates.length)error('No schema.org opening hours were found. Paste hours as plain text instead.');
  if(candidates.length>1)error('This document contains hours for multiple places. Paste only the intended place’s data.');
  const text=candidateText(candidates[0],language);
  if(!text)error('The imported document contains no opening hours.');
  return text;
}
function parseJSON(text) {
  try{return JSON.parse(text);}catch{error('The hours JSON could not be read. Check the file or paste hours as text.');}
}
export function importHours(input,{sourceUrl='',checkedAt='',language='en'}={}) {
  const text=cleanText(input,MAX_INPUT,'Paste opening hours or a JSON/HTML file smaller than 100 KB.');
  if(new TextEncoder().encode(input).length>MAX_INPUT)error('Paste opening hours or a JSON/HTML file smaller than 100 KB.');
  if(!text)return null;
  let data,kind='manual',output=text;
  if(text.startsWith('<')) {
    // Only read the text inside JSON-LD script tags. This never builds a DOM,
    // runs scripts, fetches resources, or renders the supplied HTML.
    const blocks=[];
    for(const match of text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
      if(/\btype\s*=\s*(?:"application\/ld\+json"|'application\/ld\+json'|application\/ld\+json)(?:\s|$)/i.test(match[1]))blocks.push(parseJSON(match[2].trim()));
    }
    if(!blocks.length)error('No JSON-LD hours were found in this HTML. Paste the visible hours as plain text.');
    data=blocks;kind='imported';
  } else if(/^[\[{]/.test(text)) { data=parseJSON(text);kind='imported'; }
  if(data!==undefined)output=extractStructured(data,language);
  return normalizeHours({text:output,sourceUrl,checkedAt,kind});
}
