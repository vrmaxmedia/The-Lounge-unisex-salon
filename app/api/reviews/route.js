import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/* =====================================================================
   SETTINGS (Cost Optimized, Fast & Hard-Locked Model)
   ===================================================================== */
const MODEL = 'gemini-3.5-flash-lite'; // Hard-locked: sabse fast aur sasta model
const MAX_ROUNDS = 2;                   // 1 single call; fail hone par sirf 1 retry round
const CALL_TIMEOUT_MS = 12000;          // 12 second timeout
const MAX_OUTPUT_TOKENS = 480;          // 2 to 8 lines ke liye exact token cap
const HISTORY_SIZE = 120;               // Server memory: pichhle 120 reviews track honge
const RECENT_WINDOW = 25;               // Lagatar 25-50 reviews me pattern repeat nahi hoga

/* =====================================================================
   BUSINESS PACK  (Client: The Lounge Unisex Salon, Pathankot Junction, Pathankot)
   ===================================================================== */
const OWNER_NAME = process.env.OWNER_NAME || 'the salon team';

// Local SEO Keywords (Har review me ek alag keyword naturally inject hoga)
const SEO_KEYWORDS = [
  'unisex salon in Pathankot',
  'The Lounge Unisex Salon Pathankot',
  'salon near Pathankot Junction',
  'hair stylist in Pathankot',
  'bridal makeup artist in Pathankot',
  'makeup artist in Pathankot',
  'unisex beauty parlour in Pathankot',
  'beard styling in Pathankot',
  'hair colour in Pathankot',
  'hair straightening in Pathankot',
  'waxing service in Pathankot',
  'best salon in Pathankot Junction',
  'salon in Pathankot Punjab',
  'haircut in Pathankot',
];

const KEYWORD_PLACEMENTS = [
  'in the first half of the review (never as the very first words)',
  'somewhere naturally in the middle of the review',
  'near the end of the review',
  'wherever it blends most naturally into a sentence',
];

// Topics used when a visitor selects "All" or no specific chip.
// Kept broad so the draft does not invent a specific service.
const TOPICS = {
  overall: {
    id: 'overall',
    text: 'the overall visit to The Lounge Unisex Salon, keeping the comment general and limited to the visitor\'s actual experience',
    must: /salon|lounge|visit|experience|overall|service|yahan|yahaan|aaya|aayi|gaya|gayi|visited/i,
  },
  ambience: {
    id: 'ambience',
    text: 'the salon ambience, interior, lighting, comfort and overall feel of the place',
    must: /ambience|atmosphere|interior|decor|lighting|comfort|vibe|environment|mahaul|jagah|look|setup|place/i,
  },
  staff: {
    id: 'staff',
    text: 'the behaviour of the salon staff: polite communication, attention and helpful guidance, only as it matches the visitor\'s experience',
    must: /staff|team|behav|polite|friendly|helpful|attention|nature|baat|cooperat|attentive|stylist/i,
  },
  hygiene: {
    id: 'hygiene',
    text: 'the cleanliness and hygiene of the salon, only if the visitor actually noticed it',
    must: /clean|hygiene|hygienic|neat|tidy|sanit|fresh|safai|saaf/i,
  },
  location: {
    id: 'location',
    text: 'the salon location at Pathankot Junction, Pathankot, and how easy it was to find and reach',
    must: /pathankot|junction|location|address|reach|rasta|raasta|paas|nazdik|near|find|easy|aasan/i,
  },
  value: {
    id: 'value',
    text: 'the value for money or pricing experience, without mentioning an exact price or an unverified offer',
    must: /price|pricing|rate|cost|value|money|worth|budget|reasonable|afford|daam|paise|paisa|mehenga|sasta/i,
  },
  professionalism: {
    id: 'professionalism',
    text: 'the professionalism, care and attention shown during the service the visitor actually received',
    must: /professional|care|attention|skill|skilled|expert|service|kaam|dhyan|quality|stylist/i,
  },
};

// Chip labels must match the labels used by the salon page.js.
// "All" is intentionally handled as no specific chip.
const CHIPS = {
  'Haircut & Styling': {
    id: 'chip_hair',
    text: 'the haircut or hair styling the visitor actually got; do not claim any other hair treatment',
    must: /hair|cut|style|styling|hairstyle|baal|look|stylist/i,
  },
  'Hair Colour': {
    id: 'chip_colour',
    text: 'the hair colouring service the visitor actually got, described generally; do not name a brand, shade or damage-free claim',
    must: /colou?r|shade|hair|rang|highlight|look/i,
  },
  'Straightening & Rebonding': {
    id: 'chip_straight',
    text: 'the hair straightening or rebonding service the visitor actually got; do not promise how long the result lasts and do not make hair-health claims',
    must: /straight|rebond|smooth|hair|baal|sidhe|look|finish/i,
  },
  'Beard Grooming': {
    id: 'chip_beard',
    text: 'the beard styling, trimming or shaving the visitor actually got, described in plain words',
    must: /beard|daadhi|dadhi|shave|trim|shaving|trimming|styling|groom|shape|look/i,
  },
  'Waxing': {
    id: 'chip_wax',
    text: 'the waxing service the visitor actually got; keep it general, mention comfort and handling only if it fits, and do not claim skin outcomes',
    must: /wax|waxing|smooth|comfort|service|careful|gentle|hygien/i,
  },
  'Bridal Makeup': {
    id: 'chip_bridal',
    text: 'the bridal or occasion makeup the visitor actually got; do not invent a wedding date, package, product brand or an exact look',
    must: /bridal|bride|dulhan|makeup|make.?up|look|finish|artist|wedding|shaadi|occasion/i,
  },
  'Salon Ambience': {
    id: 'chip_ambience',
    text: 'the salon interior, lighting, ambience and comfort the visitor noticed',
    must: /ambience|atmosphere|interior|decor|lighting|comfort|comfortable|vibe|environment|mahaul|jagah|setup|look|place/i,
  },
  'Staff Behaviour': {
    id: 'chip_staff',
    text: 'the staff behaviour, communication and helpfulness based on the visitor\'s actual experience',
    must: /staff|team|behav|polite|friendly|helpful|nature|cooperat|service|stylist/i,
  },
  'Clean & Hygiene': {
    id: 'chip_hygiene',
    text: 'the cleanliness and hygiene the visitor personally noticed at the salon',
    must: /clean|hygiene|hygienic|neat|tidy|sanit|safai|saaf/i,
  },
  'Professional Service': {
    id: 'chip_professional',
    text: 'the professionalism, attention and care during the service actually received',
    must: /professional|care|attention|skill|expert|service|quality|kaam|dhyan/i,
  },
  'Value for Money': {
    id: 'chip_value',
    text: 'the value for money or pricing experience without giving an exact price or claiming an offer',
    must: /price|pricing|rate|cost|value|money|worth|budget|reasonable|afford|daam|paise|paisa/i,
  },
  'Pathankot Location': {
    id: 'chip_location',
    text: 'the salon location at Pathankot Junction, Pathankot, and how easy it was to reach',
    must: /pathankot|junction|location|address|reach|rasta|paas|nazdik|near|find|easy/i,
  },
};

const ALL_TOPICS = [
  'overall',
  'ambience',
  'staff',
  'hygiene',
  'location',
  'value',
  'professionalism',
];

// Socio-Economic Class Matrix (Upper, Middle, Mass diversity — non-hallucinating voice profiles)
const PERSONAS = [
  { id: 'simple', cls: 'mass', text: 'a straightforward local customer from Pathankot, uses simple everyday words and short natural sentences' },
  { id: 'professional', cls: 'upper', text: 'a working professional, clear and composed, with a natural and polished but not promotional tone' },
  { id: 'young', cls: 'mass', text: 'a young adult, casual and conversational, like an ordinary WhatsApp-style review' },
  { id: 'practical', cls: 'middle', text: 'a practical customer, thoughtful and measured, focused on the actual service experience' },
  { id: 'blunt', cls: 'mass', text: 'a direct no-nonsense customer who says only what mattered' },
  { id: 'warm', cls: 'middle', text: 'a warm and appreciative customer, friendly but not exaggerated' },
  { id: 'detailed', cls: 'upper', text: 'an observant customer who naturally mentions one or two specific details they personally noticed' },
  { id: 'reserved', cls: 'mass', text: 'a quiet customer who writes a short, understated review without big claims' },
  { id: 'firstvisit', cls: 'middle', text: 'a customer describing a visit naturally without inventing any specific occasion' },
  { id: 'regular', cls: 'middle', text: 'a familiar local customer tone, without claiming repeat visits unless supplied' },
  { id: 'budget', cls: 'middle', text: 'a practical customer who cares about fair value, without inventing prices or discounts' },
  { id: 'styleaware', cls: 'upper', text: 'a style-conscious customer who notices presentation and finishing, without exaggeration' },
  { id: 'concise', cls: 'mass', text: 'a customer who writes casually and briefly, with no unnecessary explanation' },
  { id: 'traveller', cls: 'middle', text: 'a customer who found the salon near the Pathankot Junction area and writes plainly about the visit, without inventing travel details' },
];

const WRITING_STYLES = [
  'neat spelling and proper grammar',
  'casual WhatsApp-style typing, relaxed',
  'all small letters, casual typing, no capital letters',
  'simple and slightly rough, natural everyday wording',
];

const HINGLISH_LEVELS = [
  'mostly Hindi words, with a few common English words like salon, service, hair and staff',
  'half Hindi and half English words, with natural Hindi sentence structure',
  'Hindi grammar with common English salon words mixed in naturally',
];

const OPENERS = [
  'start with the service or experience',
  'start with the salon or its Pathankot Junction location',
  'start with the staff or interaction',
  'start with a simple personal verdict',
  'start with how the visit felt',
  'start casually in the middle of a thought',
  'start with what the visitor wanted from the visit',
  'start with a plain statement about the salon',
  'start with one detail the visitor personally noticed',
  'start with the overall experience in simple words',
  'start with the look or result only when the selected topic supports it',
  'start naturally without a promotional introduction',
];

// Middle-Part Story Diversity: beech ka flow har review me alag rahe
const MIDDLE_FLOWS = [
  'describe how neatly set up, well-lit and comfortable the salon interior felt during the visit',
  'mention how patiently the staff listened to what was requested and explained things clearly without rushing',
  'highlight the cleanliness, hygiene and calm atmosphere noticed inside the salon',
  'share a quick contrast: wanted a straightforward, no-fuss service near the junction and felt completely at ease here',
  'focus on practical value: the care and attention given during the service felt genuinely worth the money',
  'talk about how easy it was to reach the salon near Pathankot Junction and how smoothly everything went',
];

const ENDINGS = [
  'end with a small thank-you',
  'end by saying the visitor may consider coming again, without making an exaggerated promise',
  'end with a short plain remark about the experience',
  'end with a natural recommendation only if the review genuinely supports it',
  'stop naturally after the last point, without a wrap-up line',
];

// 2 crisp tone samples per language (input tokens bachane ke liye concise rakha hai)
const EXAMPLES = {
  ENGLISH: [
    'Visited The Lounge and found the place neatly set up, the overall experience felt comfortable and simple.',
    'The staff listened properly to what I wanted and explained things clearly, that mattered most to me',
  ],
  HINGLISH: [
    'salon ka setup achha laga, staff ne dhang se baat ki aur experience comfortable raha.',
    'junction ke paas easily mil gaya, overall visit sahi raha aur jagah bhi achhi lagi',
  ],
};

/* =====================================================================
   ENGINE  (Locked Core Engine)
   ===================================================================== */
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const chance = (p) => Math.random() < p;
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const countWords = (t) => t.split(/\s+/).filter(Boolean).length;

function pickWeighted(items) {
  const total = items.reduce((s, i) => s + i.w, 0);
  let r = Math.random() * total;
  for (const i of items) {
    if ((r -= i.w) <= 0) return i;
  }
  return items[0];
}

/* ---- 60-20-20 Weighted Random Length System (2 to 8 Lines) ----
   - 20% Short  (2 to 3 lines) -> w: 10 + 10 = 20
   - 60% Medium (4 to 5 lines) -> w: 32 + 28 = 60
   - 20% Long   (6 to 8 lines) -> w: 9 + 7 + 4 = 20
   Pichhle 2 reviews ki exact line count repeat nahi hogi. */
const LENGTHS = [
  { w: 10, lines: 2, min: 13, max: 21, rule: 'TWO lines, about 14 to 20 words' },
  { w: 10, lines: 3, min: 21, max: 31, rule: 'THREE lines, about 22 to 30 words' },
  { w: 32, lines: 4, min: 30, max: 42, rule: 'FOUR lines, about 32 to 40 words' },
  { w: 28, lines: 5, min: 40, max: 54, rule: 'FIVE lines, about 42 to 52 words' },
  { w: 9,  lines: 6, min: 50, max: 66, rule: 'SIX lines, about 52 to 64 words' },
  { w: 7,  lines: 7, min: 58, max: 78, rule: 'SEVEN lines, about 60 to 75 words' },
  { w: 4,  lines: 8, min: 66, max: 90, rule: 'EIGHT lines, about 68 to 86 words' },
];

function chooseLength(recent, minLines = 2) {
  const lastTwo = recent.map((r) => r.lines).filter(Boolean).slice(-2);
  let pool = LENGTHS.filter((x) => x.lines >= minLines);

  const fresh = pool.filter((x) => !lastTwo.includes(x.lines));
  if (fresh.length) pool = fresh;

  return pickWeighted(pool);
}

function choosePersona(recent) {
  const lastVoices = recent.map((r) => r.voice).filter(Boolean).slice(-10);
  const lastClass = recent.map((r) => r.cls).filter(Boolean).slice(-2);

  let pool = PERSONAS.filter((v) => !lastVoices.includes(v.id));
  if (lastClass.length === 2 && lastClass[0] === lastClass[1]) {
    const diffClass = pool.filter((v) => v.cls !== lastClass[1]);
    if (diffClass.length) pool = diffClass;
  }
  return pick(pool.length ? pool : PERSONAS);
}

function chooseTopic(recent) {
  const last = recent.map((r) => r.topic).filter(Boolean).slice(-6);
  const pool = ALL_TOPICS.filter((t) => !last.includes(t));
  return TOPICS[pick(pool.length ? pool : ALL_TOPICS)];
}

// Customer ke selected chips ("All" ko chhod kar max 3) random order me shuffle karke lo
function chosenChips(body) {
  const labels = Array.isArray(body.selectedChips) ? body.selectedChips : [];
  const valid = labels.filter((l) => typeof l === 'string' && l !== 'All' && CHIPS[l]).slice(0, 3);
  return shuffle(valid).map((l) => ({ label: l, ...CHIPS[l] }));
}

function chooseFrom(list, key, recent, n = 8) {
  const last = recent.map((r) => r[key]).filter((v) => v !== undefined && v !== null).slice(-n);
  const pool = list.filter((x) => !last.includes(x));
  return pick(pool.length ? pool : list);
}

const SERVER_KWS = [];

function chooseKeyword(recent) {
  let used = recent.map((r) => r.seo).filter(Boolean).slice(-12);
  if (!used.length) used = SERVER_KWS.slice(-12);
  const pool = SEO_KEYWORDS.filter((k) => !used.includes(k));
  return pick(pool.length ? pool : SEO_KEYWORDS);
}

const BANNED_OPENINGS = [
  'Great', 'Best', 'Amazing', 'Excellent', 'Highly recommend', 'Bhai',
  'Superb', 'Awesome', 'The staff here', 'Outstanding', 'Fantastic',
  'Wonderful', 'Perfect', 'Must visit', 'Trust me',
];

const AI_PHRASES = /seamless|hassle[- ]free|top[- ]notch|look no further|go-to|game[- ]changer|one[- ]stop|unparalleled|exceptional|impeccable|commendable|must[- ]visit|highly recommended|hands down|truly|delighted|kudos|—|–/i;

const DANGLING = new Set([
  'to', 'aur', 'ki', 'ke', 'ka', 'se', 'me', 'mein', 'par', 'pe', 'ko', 'toh',
  'and', 'but', 'the', 'a', 'an', 'of', 'in', 'on', 'for', 'with', 'at', 'that',
  'so', 'if', 'or', 'because', 'jo', 'jab', 'agar', 'lekin', 'ya', 'jaise', 'kyunki',
]);

const HINDI_WORDS = new Set([
  'hai', 'hain', 'nahi', 'nahin', 'bahut', 'bohot', 'bhot', 'mera', 'meri', 'mere', 'mujhe', 'hume',
  'aur', 'ki', 'ke', 'ka', 'ko', 'se', 'par', 'pe', 'tha', 'thi', 'kiya', 'mila', 'mil', 'gaya', 'gayi',
  'liya', 'wala', 'wale', 'jo', 'kaafi', 'accha', 'acha', 'achha', 'sach', 'yahan', 'yaha', 'kar', 'karke', 'raha',
  'rahe', 'rahi', 'laga', 'lagi', 'bilkul', 'ekdum', 'sab', 'kuch', 'koi', 'phir', 'fir', 'bhi', 'toh', 'lekin',
  'isliye', 'abhi', 'dekh', 'dekha', 'diya', 'dikhaya', 'samjhaya', 'sahi', 'dukaan', 'dukan', 'aap', 'aapne',
  'paise', 'kam', 'jyada', 'zyada', 'badhiya', 'mast', 'yaar', 'mein', 'yeh', 'ye', 'woh', 'wo', 'ne', 'hu', 'hun', 'tak', 'wahan', 'sabse',
  'achhi', 'jagah', 'kaam', 'karwaya', 'karaya', 'dhyan', 'aaram', 'baat', 'theek', 'gaye', 'liye', 'wali', 'dhang', 'sunke', 'suna',
]);

const KW_STOP_WORDS = new Set(['salon', 'unisex', 'lounge', 'in', 'pathankot', 'junction', 'punjab', 'best', 'near', 'and', 'for', 'beauty', 'parlour']);

/* ------------------ Memory & 50-Review Anti-Repetition ------------------ */
const HISTORY = [];
const HITS = new Map();

const openingOf = (text) => text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean).slice(0, 3).join(' ');
const wordSet = (t) =>
  new Set(
    t
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !KW_STOP_WORDS.has(w))
  );

function tooSimilar(text, recentOpenings) {
  const open = openingOf(text);
  if (recentOpenings.includes(open)) return true;
  const ws = wordSet(text);
  for (const h of HISTORY) {
    if (h.open === open) return true;
    if (ws.size < 7 || h.ws.size < 7) continue;
    let inter = 0;
    for (const w of ws) if (h.ws.has(w)) inter++;
    const union = ws.size + h.ws.size - inter || 1;
    if (inter / union > 0.36) return true; // Strict 36% similarity limit across last 120 reviews
  }
  return false;
}

function remember(text) {
  HISTORY.push({ open: openingOf(text), ws: wordSet(text) });
  while (HISTORY.length > HISTORY_SIZE) HISTORY.shift();
}

function rateLimited(request) {
  const ip = (request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  const now = Date.now();
  const arr = (HITS.get(ip) || []).filter((t) => now - t < 5 * 60 * 1000);
  arr.push(now);
  HITS.set(ip, arr);
  if (HITS.size > 2000) {
    for (const [k, v] of HITS) if (!v.some((t) => now - t < 5 * 60 * 1000)) HITS.delete(k);
  }
  return arr.length > 35;
}

/* ------------------ Auto-Repair & Cleaning Pipeline ------------------ */
function scrubRobotic(text) {
  const startedUpper = /^[A-Z]/.test(text);
  let t = text
    .replace(/\s*[—–]\s*/g, ', ')
    .replace(/\btruly\s+/gi, '')
    .replace(/\bseamless(ly)?\b/gi, (m, ly) => (ly ? 'smoothly' : 'smooth'))
    .replace(/\bhassle[- ]free\b/gi, 'easy')
    .replace(/\btop[- ]notch\b/gi, 'very good')
    .replace(/\bexceptional(ly)?\b/gi, (m, ly) => (ly ? 'very' : 'very good'))
    .replace(/\bimpeccabl(e|y)\b/gi, (m, e) => (e === 'y' ? 'very well' : 'very good'))
    .replace(/\bcommendable\b/gi, 'good')
    .replace(/\bunparalleled\b/gi, 'very good')
    .replace(/\bgo-to\b/gi, 'favourite')
    .replace(/\bgame[- ]changer\b/gi, 'big plus')
    .replace(/\bone[- ]stop\b/gi, 'complete')
    .replace(/\bmust[- ]visit\b/gi, 'worth visiting')
    .replace(/\bhighly recommended\b/gi, 'recommended')
    .replace(/\bhands down,?\s*/gi, '')
    .replace(/\bdelighted\b/gi, 'happy')
    .replace(/\bkudos( to)?\b/gi, (m, to) => (to ? 'thanks to' : 'thanks'));
  t = t.replace(/\s{2,}/g, ' ').replace(/\s+([.,])/g, '$1').trim();
  if (startedUpper && /^[a-z]/.test(t)) t = t[0].toUpperCase() + t.slice(1);
  return t;
}

function cleanReview(text, useFullStop) {
  let t = text
    .replace(/[*#]/g, '')
    .replace(/^['"`\s]+|['"`\s]+$/g, '')
    .replace(/\s*\n+\s*/g, ' ')
    .replace(/[—–]/g, ', ');

  if (useFullStop) {
    t = t
      .replace(/!+/g, '.')
      .replace(/\.{2,}|…/g, '.')
      .replace(/\s+([.,])/g, '$1')
      .replace(/\.(?=[A-Za-z])/g, '. ')
      .replace(/\.\s*\./g, '.')
      .replace(/,\s*\./g, '.');
  } else {
    t = t
      .replace(/!+/g, ',')
      .replace(/\.{2,}|…/g, ' ')
      .replace(/\.\s+/g, ', ')
      .replace(/\.+$/g, '');
  }

  return t
    .replace(/,\s*,/g, ',')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function fixCutOff(text) {
  let parts = text.trim().replace(/[,-\s]+$/g, '').split(/\s+/);
  while (parts.length > 5) {
    const last = parts[parts.length - 1].toLowerCase().replace(/[^a-z]/g, '');
    if (!DANGLING.has(last)) break;
    parts.pop();
    parts = parts.join(' ').replace(/[,-\s]+$/g, '').split(/\s+/);
  }
  return parts.join(' ');
}

function trimToLimit(text, maxWords, stillOk) {
  const m = text.match(/^([\s\S]*?)([\s\uFE0F\u200D\p{Extended_Pictographic}]*)$/u);
  const core = m ? m[1].trim() : text;
  const tail = m ? m[2].trim() : '';
  const sentences = core.split(/(?<=[.,])\s+/).filter(Boolean);

  while (countWords(sentences.join(' ')) > maxWords && sentences.length > 2) {
    let removed = false;
    for (let i = sentences.length - 1; i >= 1; i--) {
      const test = sentences.filter((_, j) => j !== i).join(' ');
      if (!stillOk(test)) continue;
      sentences.splice(i, 1);
      removed = true;
      break;
    }
    if (!removed) break;
  }
  const out = sentences.join(' ');
  return tail ? `${out} ${tail}` : out;
}

function finalizeReview(text, useFullStop) {
  const m = text.match(/^([\s\S]*?)([\s\p{Extended_Pictographic}\uFE0F\u200D]*)$/u);
  let core = (m ? m[1] : text).replace(/[,;:\-\s]+$/g, '').trim();
  const tail = (m ? m[2] : '').replace(/\s+/g, '');

  if (useFullStop) {
    if (!/\.$/.test(core)) core += '.';
  } else {
    core = core.replace(/\.+$/g, '').trim();
  }
  return tail ? `${core} ${tail}` : core;
}

function looksCutOff(text) {
  const last = text.split(/\s+/).pop().toLowerCase().replace(/[^a-z]/g, '');
  return DANGLING.has(last) || /[,-]$/.test(text.trim());
}

function hindiCount(text) {
  return text.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter((w) => HINDI_WORDS.has(w)).length;
}

function languageOk(text, language, words) {
  const h = hindiCount(text);
  if (language === 'HINGLISH') return h >= Math.max(2, Math.floor(words * 0.18));
  return h <= 2;
}

function startsBanned(text) {
  const t = text.trim().toLowerCase();
  return BANNED_OPENINGS.some((b) => t.startsWith(b.toLowerCase()));
}

/* ------------------ Compressed Prompt Builder ------------------ */
function buildPrompt(body, recent) {
  const language = body.language === 'HINGLISH' ? 'HINGLISH' : 'ENGLISH';
  const businessName = String(body.businessName || 'The Lounge Unisex Salon').slice(0, 120);
  const category = String(body.category || 'Unisex Salon, Hair Stylist & Bridal Makeup Artist').slice(0, 200);
  const description = String(
    body.description || 'A unisex salon at Pathankot Junction, Pathankot, offering hair styling, haircuts, hair colour, straightening, beard grooming, waxing and makeup services.'
  ).slice(0, 600);
  const city = String(body.city || 'Pathankot Junction, Pathankot, Punjab').slice(0, 120);
  const suppliedExperience = String(body.customerExperience || '').slice(0, 500);
  const suppliedInstruction = String(body.customInstruction || '').slice(0, 500);

  const chips = chosenChips(body);
  const minLines = chips.length >= 3 ? 4 : 2;
  const length = chooseLength(recent, minLines);
  const persona = choosePersona(recent);

  const primaryTopic = chips.length
    ? { id: chips[0].id, text: chips[0].text, must: chips[0].must }
    : chooseTopic(recent);
  const extraChips = chips.slice(1);

  let bonusTopic = null;
  if (!extraChips.length && length.lines >= 4 && chance(0.65)) {
    const candidate = chooseTopic([...recent, { topic: primaryTopic.id }]);
    if (candidate.id !== primaryTopic.id) bonusTopic = candidate;
  }

  const opener = chooseFrom(OPENERS, 'opener', recent, 9);
  const middleFlow = chooseFrom(MIDDLE_FLOWS, 'mid', recent, 5);
  const ending = chooseFrom(ENDINGS, 'ending', recent, 5);

  const hasSpellingSlip = chance(0.10); // 10% natural spelling slip
  const style = hasSpellingSlip
    ? 'casual WhatsApp typing with 1 or 2 natural human spelling slips (like real people typing fast on phone)'
    : pick(WRITING_STYLES);
  const useFullStop = chance(0.80); // 80% full stop, 20% without full stop
  const hinglishLevel = pick(HINGLISH_LEVELS);

  const mentionName = length.lines >= 3 && chance(0.4);
  const mentionStaff = length.lines >= 3 && (primaryTopic.id === 'chip_staff' || primaryTopic.id === 'staff' ? chance(0.5) : chance(0.12));
  const useEmoji = chance(0.06);

  // Mandatory unique SEO keyword in every review (rotated across last 12 reviews)
  const seo = chooseKeyword(recent);
  const kwPlacement = pick(KEYWORD_PLACEMENTS);

  const languageBlock = language === 'HINGLISH'
    ? `LANGUAGE: HINGLISH = Hindi sentences typed in Roman/English letters like a local Pathankot customer on WhatsApp. Level: ${hinglishLevel}. Hindi grammar (hai, tha, kiya, mila, nahi, bahut, aur, ke liye). Service/SEO words can stay in English. Never write a full English sentence. No Devanagari.`
    : 'LANGUAGE: Simple natural Indian English. Do not use Hindi words.';

  const examples = shuffle(EXAMPLES[language]).map((e) => `- ${e}`).join('\n');
  const experienceBlock = suppliedExperience
    ? `CUSTOMER-SUPPLIED EXPERIENCE (highest priority; use only these facts): ${suppliedExperience}`
    : 'No detailed customer experience was supplied. Keep the draft limited to the selected topic/chips and broad visit impressions. Do not invent a specific treatment, package, occasion, result, product, staff member, price or repeat visit.';
  const customBlock = suppliedInstruction
    ? `ADDITIONAL BUSINESS GUIDANCE (must not override factual rules): ${suppliedInstruction}`
    : '';

  const punctuationRule = useFullStop
    ? `- FULL STOPS: End every sentence with a full stop (.) and end the review with a full stop (.). No exclamation marks or dashes.`
    : `- NO FULL STOPS: Do NOT use a full stop (.) anywhere. Use commas, "aur"/"and", or natural flow.`;

  const prompt = `${languageBlock}

You are ${persona.text}. You visited ${businessName}, a ${category} in ${city}, and are drafting a Google Maps review based on the customer's actual experience.
Business: ${businessName} (${city}) | ${category}
About: ${description}
${experienceBlock}
${customBlock}

Tone samples (feel only, never copy words/structure):
${examples}

THIS REVIEW:
- Main topic: ${primaryTopic.text}.
${extraChips.length ? `- ALSO cover these selected points: ${extraChips.map((c) => c.text).join('; ')}.` : bonusTopic ? `- Also weave in a short natural mention of ${bonusTopic.text}.` : '- Keep it focused on the main topic.'}
- Style: ${style}.
- Opening: ${opener}.
${length.lines >= 4 ? `- Middle flow: ${middleFlow}.` : ''}
${length.lines >= 3 ? `- Ending: ${ending}.` : ''}
- Length: ${length.rule}. Stay strictly inside this word count.
- SEO KEYWORD (MANDATORY): Naturally include the phrase "${seo}" ${kwPlacement} without making it sound like an ad.
${mentionName ? `- Mention "${businessName}" once naturally.` : '- Do not repeat the full business name.'}
${mentionStaff ? `- You may mention ${OWNER_NAME} only as the salon team; do not invent a person's name.` : '- Do not name any person.'}
${useEmoji ? '- One emoji at the very end is allowed.' : '- No emojis.'}

RULES:
- ONE single paragraph. No line breaks, bullets, or title.
${punctuationRule}
- Never start with: ${BANNED_OPENINGS.join(', ')}.
- Sound like a real human customer, not an ad. No hashtags, slogans, keyword stuffing, or heavy marketing words.
- Never invent a service, treatment, product, package, price, discount, offer, appointment, result, event, staff name, years of experience, rating or repeat visit.
- Do not claim bridal makeup, hair colour, straightening, rebonding, beard grooming or waxing unless the selected chip or customer-supplied experience specifically supports it.
- Do not state that the salon is open now, mention business hours, or make medical/skin/hair-health/long-lasting outcome claims.
- Complete thought only. Output ONLY the review text.`;

  return { prompt, length, persona, topic: primaryTopic, extraChips, opener, middleFlow, ending, seo, language, useFullStop };
}

async function callGemini(apiKey, payload, signal) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    }
  );
  const data = await res.json();
  return { res, data };
}

/* ------------------ Single-Shot Attempt + Auto-Repair ------------------ */
async function attempt(apiKey, body, recent, signal, strict = true) {
  const built = buildPrompt(body, recent);
  const { prompt, length, persona, topic, extraChips, opener, middleFlow, ending, seo, language, useFullStop } = built;

  const payload = {
    contents: [{ role: 'user', parts: [{ text: `Write the review for ${body.businessName || 'The Lounge Unisex Salon'} now.` }] }],
    systemInstruction: { parts: [{ text: prompt }] },
    generationConfig: {
      temperature: 1.0,
      topP: 0.95,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
    },
  };

  try {
    const { res, data } = await callGemini(apiKey, payload, signal);
    if (!res.ok) return { ok: false, error: data?.error?.message || 'Gemini API request failed.' };

    const candidate = data.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    const raw = parts.filter((p) => !p.thought).map((p) => p.text || '').join('');
    const usage = data.usageMetadata;

    if (!raw.trim()) return { ok: false, error: 'Empty response from Gemini.' };
    if (candidate?.finishReason === 'MAX_TOKENS') return { ok: false, error: 'Response was cut off.' };

    // Auto-repair pipeline (prevents wasteful Round 2 API calls)
    let review = scrubRobotic(raw);
    review = fixCutOff(cleanReview(review, useFullStop));
    if (looksCutOff(review)) return { ok: false, error: 'Review ended mid-sentence.' };

    const stillOk = (t) => topic.must.test(t) && extraChips.every((c) => c.must.test(t));

    let words = countWords(review);
    if (words > length.max + 5) {
      review = trimToLimit(review, length.max + 3, stillOk);
      words = countWords(review);
    }

    review = finalizeReview(review, useFullStop);
    words = countWords(review);

    const maxAllowed = length.max + (strict ? 8 : 16);
    const minAllowed = Math.floor(length.min * (strict ? 0.72 : 0.60));

    if (words > maxAllowed) return { ok: false, error: 'Review too long.' };
    if (words < minAllowed) return { ok: false, error: 'Review too short.' };
    if (/[\u0900-\u097F]/.test(review)) return { ok: false, error: 'Devanagari used.' };
    if (AI_PHRASES.test(review)) return { ok: false, error: 'Robotic phrase used.' };
    if (startsBanned(review)) return { ok: false, error: 'Banned opening used.' };
    if (!languageOk(review, language, words)) return { ok: false, error: 'Wrong language style.' };
    if (!topic.must.test(review)) return { ok: false, error: 'Review missed the selected topic.' };
    if (extraChips.some((c) => !c.must.test(review))) return { ok: false, error: 'Review missed a selected keyword.' };

    const recentOpenings = recent.map((r) => r.open).filter(Boolean);
    if (tooSimilar(review, recentOpenings)) return { ok: false, error: 'Too similar to an earlier review.' };

    return {
      ok: true,
      review,
      usage,
      meta: {
        lines: length.lines,
        voice: persona.id,
        cls: persona.cls,
        topic: topic.id,
        opener,
        mid: middleFlow,
        ending,
        seo,
        open: openingOf(review),
      },
    };
  } catch (e) {
    return {
      ok: false,
      error: e?.name === 'AbortError' ? 'Request timed out.' : e?.message || 'Request failed.',
    };
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key not configured.' }, { status: 500 });
    }
    if (rateLimited(request)) {
      return NextResponse.json({ error: 'Too many requests. Please wait a minute.' }, { status: 429 });
    }

    const recent = (Array.isArray(body.recentLengths) ? body.recentLengths : [])
      .filter((r) => r && typeof r === 'object')
      .slice(-RECENT_WINDOW);

    let lastError = 'Failed to generate review draft.';

    // 1 single call per round; sirf fail/reject hone par Round 2 chalega
    for (let round = 0; round < MAX_ROUNDS; round++) {
      const strict = round === 0;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), CALL_TIMEOUT_MS);

      const result = await attempt(apiKey, body, recent, controller.signal, strict);
      clearTimeout(timer);

      if (result.ok) {
        remember(result.review);
        SERVER_KWS.push(result.meta.seo);
        while (SERVER_KWS.length > SEO_KEYWORDS.length) SERVER_KWS.shift();

        if (result.usage) {
          console.log(
            `[API Cost] ${MODEL} | In: ${result.usage.promptTokenCount} | Out: ${result.usage.candidatesTokenCount} | Total: ${result.usage.totalTokenCount}`
          );
        }
        return NextResponse.json({ review: result.review, meta: result.meta });
      }
      lastError = result.error;
    }

    throw new Error(lastError);
  } catch (error) {
    console.error('API Review Generation Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate review draft.' },
      { status: 500 }
    );
  }
}
