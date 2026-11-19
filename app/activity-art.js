// Original, code-native illustrations. Paths are a closed allowlist: imported SVG
// markup and arbitrary SVG URLs are deliberately not supported.
export const artworkRegions = [
  { id: 'japan', name: 'Japan', labels: { en: 'Japan', 'zh-CN': '日本', 'zh-TW': '日本' } },
  { id: 'korea', name: 'Korea', labels: { en: 'Korea', 'zh-CN': '韩国', 'zh-TW': '韓國' } },
  { id: 'us', name: 'US', labels: { en: 'United States', 'zh-CN': '美国', 'zh-TW': '美國' } },
  { id: 'china', name: 'China', labels: { en: 'China', 'zh-CN': '中国', 'zh-TW': '中國' } },
  { id: 'france', name: 'France', labels: { en: 'France', 'zh-CN': '法国', 'zh-TW': '法國' } },
  { id: 'spain', name: 'Spain', labels: { en: 'Spain', 'zh-CN': '西班牙', 'zh-TW': '西班牙' } },
  { id: 'germany', name: 'Germany', labels: { en: 'Germany', 'zh-CN': '德国', 'zh-TW': '德國' } },
  { id: 'southeast-asia', name: 'Southeast Asia', labels: { en: 'Southeast Asia', 'zh-CN': '东南亚', 'zh-TW': '東南亞' } },
  { id: 'europe', name: 'Europe', labels: { en: 'Europe', 'zh-CN': '欧洲', 'zh-TW': '歐洲' } },
];
const activities = [
  ['cafe', 'Food & drink'], ['breakfast', 'Food & drink'], ['market', 'Food & drink'],
  ['museum', 'Explore'], ['heritage', 'Explore'], ['park', 'Explore'],
  ['garden', 'Explore'], ['old-town', 'Explore'], ['train', 'Transport'],
  ['cycling', 'Explore'], ['beach', 'Free time'], ['boat', 'Transport'],
  ['hiking', 'Explore'], ['spa', 'Free time'], ['resort', 'Stay'],
  ['bakery', 'Food & drink'], ['dinner', 'Food & drink'], ['shopping', 'Explore'],
  ['music', 'Free time'], ['sunset', 'Free time'],
];
const titles = {
  japan: [
    'Kissaten coffee|喫茶店咖啡时光|喫茶店咖啡時光', 'A Japanese breakfast|日式早餐|日式早餐',
    'Neighborhood food market|街角美食市场|街角美食市場', 'A quiet art museum|静谧美术馆|靜謐美術館',
    'Temple courtyard|寺院庭院|寺院庭院', 'Cherry blossom picnic|樱花野餐|櫻花野餐',
    'A little Zen garden|小小禅意庭园|小小禪意庭園', 'Old wooden lanes|木屋老街漫步|木屋老街漫步',
    'A local train ride|地方电车之旅|地方電車之旅', 'Riverside cycling|河畔骑行|河畔騎行',
    'A seaside afternoon|海边午后|海邊午後', 'A little island ferry|小岛渡轮|小島渡輪',
    'A mountain trail|山间步道|山間步道', 'Warm onsen waters|暖暖温泉|暖暖溫泉',
    'A restful ryokan|日式旅馆小憩|日式旅館小憩', 'Melon-pan bakery|菠萝包烘焙坊|菠蘿麵包烘焙坊',
    'A comforting ramen bowl|暖心拉面|暖心拉麵', 'A pottery shop|陶器小店|陶器小店',
    'An intimate jazz evening|温馨爵士夜|溫馨爵士夜', 'A lantern-lit sunset|灯笼与夕阳|燈籠與夕陽',
  ],
  korea: [
    'Seoul café afternoon|首尔咖啡午后|首爾咖啡午後', 'A Korean breakfast|韩式早餐|韓式早餐',
    'A neighborhood market|邻里传统市场|鄰里傳統市場', 'Modern art pause|现代艺术小憩|現代藝術小憩',
    'Hanok courtyard|韩屋庭院|韓屋庭院', 'Riverside park picnic|江畔公园野餐|江畔公園野餐',
    'A peaceful pavilion garden|亭台花园|亭臺花園', 'Hanok village lanes|韩屋村小巷|韓屋村小巷',
    'A coastal train ride|海岸列车之旅|海岸列車之旅', 'Cycling beside the river|沿江骑行|沿江騎行',
    'Jeju beach break|济州海滩小憩|濟州海灘小憩', 'Harbor ferry crossing|港口渡轮|港口渡輪',
    'Pine-covered mountain walk|松林山间漫步|松林山間漫步', 'A quiet spa afternoon|静享水疗午后|靜享水療午後',
    'A cozy hanok stay|温馨韩屋住宿|溫馨韓屋住宿', 'A neighborhood bakery|街坊烘焙坊|街坊烘焙坊',
    'Bibimbap for dinner|拌饭晚餐|拌飯晚餐', 'A little ceramics studio|小小陶艺工作室|小小陶藝工作室',
    'Acoustic café evening|咖啡馆原声之夜|咖啡館原聲之夜', 'Sunset over tiled roofs|瓦屋夕照|瓦屋夕照',
  ],
  us: [
    'Neighborhood coffee stop|街角咖啡站|街角咖啡站', 'Pancake breakfast|松饼早餐|鬆餅早餐',
    'Saturday farmers market|周六农夫市集|週六農夫市集', 'An afternoon at the museum|博物馆午后|博物館午後',
    'A historic main street|历史小镇主街|歷史小鎮主街', 'A park picnic|公园野餐|公園野餐',
    'Botanical garden wander|植物园散步|植物園散步', 'A cozy neighborhood walk|温馨街区漫步|溫馨街區漫步',
    'A scenic rail journey|风景铁路之旅|風景鐵路之旅', 'Lakeside bike ride|湖畔骑行|湖畔騎行',
    'A coastal picnic|海岸野餐|海岸野餐', 'A lake boat ride|湖上泛舟|湖上泛舟',
    'National park trail|国家公园步道|國家公園步道', 'A cabin spa break|木屋水疗小憩|木屋水療小憩',
    'A woodland lodge|林间度假小屋|林間度假小屋', 'A little pie bakery|手作派烘焙坊|手作派烘焙坊',
    'A cozy diner dinner|温馨美式餐馆|溫馨美式餐館', 'A small-town bookshop|小镇书店|小鎮書店',
    'Jazz under warm lights|暖灯爵士夜|暖燈爵士夜', 'Desert sunset pause|沙漠落日小憩|沙漠落日小憩',
  ],
  china: [
    'Courtyard tea break|庭院茶歇|庭院茶歇', 'Steamed bun breakfast|包子早餐|包子早餐',
    'A morning food market|早晨美食市场|早晨美食市場', 'An art museum afternoon|美术馆午后|美術館午後',
    'A traditional courtyard|传统院落|傳統院落', 'Lakeside park picnic|湖畔公园野餐|湖畔公園野餐',
    'A classical garden|古典园林|古典園林', 'Old-town lantern lanes|古城灯笼小巷|古城燈籠小巷',
    'A scenic train journey|风景列车之旅|風景列車之旅', 'Cycling beside the lake|环湖骑行|環湖騎行',
    'A quiet coastal day|静享海岸一天|靜享海岸一天', 'A little river boat|小河游船|小河遊船',
    'Misty mountain walk|云雾山间漫步|雲霧山間漫步', 'Mountain hot springs|山间温泉|山間溫泉',
    'A courtyard guesthouse|庭院民宿|庭院民宿', 'A mooncake bakery|月饼糕点坊|月餅糕點坊',
    'Dumplings to share|分享一笼饺子|分享一籠餃子', 'A porcelain shop|瓷器小店|瓷器小店',
    'A quiet music salon|静谧音乐小聚|靜謐音樂小聚', 'Lanterns by the water|水畔灯影|水畔燈影',
  ],
  france: [
    'A Parisian café table|巴黎街边咖啡|巴黎街邊咖啡', 'Croissant breakfast|可颂早餐|可頌早餐',
    'A village produce market|乡村蔬果市集|鄉村蔬果市集', 'An afternoon with art|艺术午后|藝術午後',
    'A château garden visit|城堡花园之旅|城堡花園之旅', 'A park-side picnic|公园野餐时光|公園野餐時光',
    'A lavender garden|薰衣草花园|薰衣草花園', 'A little village lane|乡村小巷|鄉村小巷',
    'A countryside train|乡间列车|鄉間列車', 'Cycling past vineyards|葡萄园骑行|葡萄園騎行',
    'A Mediterranean beach day|地中海海滩时光|地中海海灘時光', 'A quiet canal boat|静静运河游船|靜靜運河遊船',
    'An Alpine trail|阿尔卑斯山步道|阿爾卑斯山步道', 'A countryside spa|乡间水疗|鄉間水療',
    'A Provence cottage stay|普罗旺斯小屋住宿|普羅旺斯小屋住宿', 'A boulangerie stop|法式面包房|法式麵包房',
    'A candlelit bistro|烛光小酒馆|燭光小酒館', 'A little bookshop|小小书店|小小書店',
    'An evening accordion|手风琴之夜|手風琴之夜', 'Sunset over rooftops|屋顶夕照|屋頂夕照',
  ],
  spain: [
    'A courtyard café|庭院咖啡馆|庭院咖啡館', 'Toast and orange breakfast|香橙吐司早餐|香橙吐司早餐',
    'A covered food market|室内美食市场|室內美食市場', 'A colorful art museum|缤纷美术馆|繽紛美術館',
    'A tiled courtyard|彩砖庭院|彩磚庭院', 'An orange-grove picnic|橙树林野餐|橙樹林野餐',
    'A fountain garden|喷泉花园|噴泉花園', 'A terracotta old town|陶土色老城|陶土色老城',
    'A coastal rail trip|海岸铁路之旅|海岸鐵路之旅', 'A sunny bike ride|阳光骑行|陽光騎行',
    'A Mediterranean siesta|地中海午憩|地中海午憩', 'A little harbor boat|海港小船|海港小船',
    'A hillside walking trail|山坡步道|山坡步道', 'A warm thermal bath|暖暖温泉浴|暖暖溫泉浴',
    'A seaside courtyard stay|海边庭院住宿|海邊庭院住宿', 'A churros bakery|吉拿棒小店|吉拿棒小店',
    'Paella with friends|和朋友分享海鲜饭|和朋友分享海鮮飯', 'A tiled craft shop|彩砖工艺小店|彩磚工藝小店',
    'A guitar evening|吉他之夜|吉他之夜', 'A terracotta sunset|陶土屋顶夕阳|陶土屋頂夕陽',
  ],
  germany: [
    'A cozy café pause|温馨咖啡小憩|溫馨咖啡小憩', 'A hearty bread breakfast|丰盛面包早餐|豐盛麵包早餐',
    'A little town market|小镇市集|小鎮市集', 'A museum afternoon|博物馆午后|博物館午後',
    'A timbered town square|木架屋广场|木架屋廣場', 'A meadow picnic|草地野餐|草地野餐',
    'A woodland garden|林间花园|林間花園', 'A timbered old-town lane|木架屋老街|木架屋老街',
    'A forest railway|森林铁路|森林鐵路', 'A riverside cycle path|河畔自行车道|河畔自行車道',
    'A Baltic beach break|波罗的海海滩小憩|波羅的海海灘小憩', 'A lake ferry trip|湖泊渡轮之旅|湖泊渡輪之旅',
    'A Black Forest trail|黑森林步道|黑森林步道', 'A thermal spa afternoon|温泉水疗午后|溫泉水療午後',
    'A Bavarian guesthouse|巴伐利亚旅舍|巴伐利亞旅舍', 'A pretzel bakery|碱水结面包房|鹼水結麵包房',
    'A cozy tavern supper|温馨小馆晚餐|溫馨小館晚餐', 'A riverside bookshop|河畔书店|河畔書店',
    'A chamber music evening|室内乐之夜|室內樂之夜', 'A lakeside sunset|湖畔落日|湖畔落日',
  ],
  'southeast-asia': [
    'A tropical café break|热带咖啡时光|熱帶咖啡時光', 'A rice-and-fruit breakfast|米食水果早餐|米食水果早餐',
    'A lively street market|热闹街头市集|熱鬧街頭市集', 'An art gallery pause|艺廊小憩|藝廊小憩',
    'An old-town courtyard|古城庭院|古城庭院', 'A shady park picnic|树荫下的野餐|樹蔭下的野餐',
    'A tropical garden|热带花园|熱帶花園', 'Colorful shophouse lanes|缤纷骑楼小巷|繽紛騎樓小巷',
    'A slow scenic train|慢悠悠风景列车|慢悠悠風景列車', 'A rice-field bike ride|稻田骑行|稻田騎行',
    'A palm-fringed beach|棕榈海滩|棕櫚海灘', 'A little long-tail boat|长尾船小旅行|長尾船小旅行',
    'A green hillside trail|绿意山间步道|綠意山間步道', 'A garden spa pause|花园水疗小憩|花園水療小憩',
    'A tropical bungalow|热带度假小屋|熱帶度假小屋', 'A coconut bakery|椰香烘焙坊|椰香烘焙坊',
    'A comforting noodle bowl|暖心面食|暖心麵食', 'An old-town craft shop|古城手作小店|古城手作小店',
    'A mellow acoustic night|悠闲原声之夜|悠閒原聲之夜', 'An island sunset|小岛落日|小島落日',
  ],
  europe: [
    'A little square café|广场咖啡时光|廣場咖啡時光', 'A village breakfast|乡村早餐|鄉村早餐',
    'A weekend market|周末市集|週末市集', 'A small art museum|小小美术馆|小小美術館',
    'An old-town square|古城广场|古城廣場', 'A lakeside picnic|湖畔野餐|湖畔野餐',
    'A cottage garden|小屋花园|小屋花園', 'A cobblestone lane|石板小巷|石板小巷',
    'A rail travel day|铁道旅行日|鐵道旅行日', 'A canal-side cycle|运河旁骑行|運河旁騎行',
    'A quiet seaside break|宁静海边小憩|寧靜海邊小憩', 'A lake boat crossing|湖上小船|湖上小船',
    'A hillside walking day|山间徒步日|山間徒步日', 'A lakeside spa|湖畔水疗|湖畔水療',
    'A lakeside cottage|湖畔小屋|湖畔小屋', 'A village bakery|乡村面包房|鄉村麵包房',
    'A little courtyard supper|小庭院晚餐|小庭院晚餐', 'A neighborhood bookshop|街坊书店|街坊書店',
    'A small concert evening|小型音乐会|小型音樂會', 'A lakeside golden hour|湖畔金色时光|湖畔金色時光',
  ],
};
export const activityArt = Object.freeze(artworkRegions.flatMap(region => activities.map(([activity, category], index) => {
  const [en, simplified, traditional] = titles[region.id][index].split('|');
  return Object.freeze({ id: `${region.id}-${activity}`, region: region.id, destination: region.name, activity, category,
    src: `assets/activities/${region.id}/${activity}.svg`, rasterSrc: `assets/activities/${region.id}/${activity}.png`, labels: Object.freeze({ en, 'zh-CN': simplified, 'zh-TW': traditional }) });
})));
const byId = new Map(activityArt.map(item => [item.id, item]));
const byPath = new Map(activityArt.flatMap(item => [[item.src, item], [item.rasterSrc, item]]));
export function getActivityArt(idOrPath) { return byId.get(idOrPath) || byPath.get(idOrPath) || null; }
export function activityArtLabel(item, language = 'en') { return item?.labels?.[language] || item?.labels?.en || ''; }
export function artworkRegionForDestination(value) {
  const text = String(value || '').trim().toLocaleLowerCase();
  const aliases = { usa:'us', 'united states':'us', 'south korea':'korea', 'south east asia':'southeast-asia', 'south-east asia':'southeast-asia' };
  return aliases[text] || artworkRegions.find(region => [region.id, region.name, ...Object.values(region.labels)].some(label => label.toLocaleLowerCase() === text))?.id || 'all';
}
export function filterActivityArt(region = 'all', category = 'all') {
  const selectedRegion = region === 'all' ? 'all' : artworkRegionForDestination(region);
  return activityArt.filter(item => (selectedRegion === 'all' || item.region === selectedRegion) && (category === 'all' || item.category === category));
}
