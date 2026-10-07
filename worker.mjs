const SOURCES = {
  warnings: 'https://weather.metoffice.gov.uk/public/data/PWSCache/WarningsRSS/Region/he',
  news: 'https://feeds.bbci.co.uk/news/scotland/highlands_and_islands/rss.xml',
};
const WEATHER = 'https://api.open-meteo.com/v1/forecast?latitude=57.3305&longitude=-3.608&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,is_day&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&wind_speed_unit=mph&timezone=Europe%2FLondon&forecast_days=5';
function decode(s='') { return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/<[^>]*>/g,'').replace(/&#(x[\da-f]+|\d+);/gi,(_,n)=>String.fromCodePoint(n[0]==='x'?parseInt(n.slice(1),16):Number(n))).replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'").trim(); }
function tag(block,name) { return decode(block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`,'i'))?.[1]); }
export function parseFeed(xml) {
  if (!/<(?:rss|feed)[\s>]/i.test(xml)) throw new Error('Invalid feed');
  return [...xml.matchAll(/<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi)].map(([, , b])=>{
    const url=tag(b,'link') || b.match(/<link[^>]*href=["']([^"']+)["']/i)?.[1] || '';
    return {title:tag(b,'title'),url:decode(url),published:tag(b,'pubDate')||tag(b,'updated'),summary:tag(b,'description')||tag(b,'summary')};
  }).filter(i=>i.title&&/^https?:\/\//.test(i.url));
}
async function load(url, json=false) {
  const r=await fetch(url,{signal:AbortSignal.timeout(10000),headers:{'User-Agent':'HighlandWatch/1.0'},cf:{cacheTtl:300,cacheEverything:true}});
  if(!r.ok)throw new Error('Source unavailable');
  return json?r.json():parseFeed(await r.text());
}
export function isImportant(text) { return /\b(warnings?|flood(?:ing|s)?|storms?|closures?|closed|disruption|missing|evacuat\w*|wildfires?|power cuts?|outages?|major incident|crash(?:es)?|collision|snow|ice|urgent|landslides?|rescue|bird flu|protection zone)\b|\b(?:bus|rail|ferry|train)\b.{0,60}\b(?:cut|cancel|suspend)|\b(?:cut|cancel|suspend)\w*\b.{0,60}\b(?:bus|rail|ferry|train)\b/i.test(text); }
export async function dashboard() {
  const results=await Promise.allSettled([load(WEATHER,true),load(SOURCES.warnings),load(SOURCES.news)]);
  const [weather,warnings,news]=results.map(r=>r.status==='fulfilled'?r.value:null);
  const now=Date.now();
  const articles=news?.filter(i=>{const date=Date.parse(i.published);return Number.isFinite(date)&&date<=now+3600000&&now-date<7*86400000;}).map(i=>({...i,local:/grantown|strathspey|badenoch|aviemore|cairngorm|carrbridge|nethy bridge|boat of garten|\bA95\b|\bA9\b/i.test(i.title+' '+i.summary),important:isImportant(i.title+' '+i.summary)})).sort((a,b)=>Number(b.local)-Number(a.local)||Number(b.important)-Number(a.important)||Date.parse(b.published)-Date.parse(a.published)).slice(0,12) ?? null;
  return {weather,warnings,news:articles,checkedAt:new Date().toISOString(),errors:results.flatMap((r,i)=>r.status==='rejected'?[['weather','warnings','news'][i]]:[])};
}
export default {async fetch(request,env) {
  const path=new URL(request.url).pathname;
  if(path==='/api/dashboard')return Response.json(await dashboard(),{headers:{'Cache-Control':'private, max-age=120'}});
  return env.ASSETS.fetch(request);
}};
