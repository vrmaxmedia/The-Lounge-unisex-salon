import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/* =====================================================================
   SETTINGS (same generation engine settings as the reference route)
   ===================================================================== */
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
const PARALLEL_CALLS = 2;
const MAX_ROUNDS = 2;
const CALL_TIMEOUT_MS = 12000;
const MAX_OUTPUT_TOKENS = 300;
const HISTORY_SIZE = 60;

/* =====================================================================
   BUSINESS PACK (The Lounge Unisex Salon, Pathankot Junction, Pathankot)
   Business-specific settings live here; the engine below is reusable.
   Services listed on the public business listing: hair styling, hair
   cut, hair colour, hair straightening, blow dry, hair curling, hair
   rebonding, beard styling / shaving / trimming, waxing, bridal makeup.
   No prices, offers, packages or years of experience are invented.
   ===================================================================== */
const OWNER_NAME = process.env.OWNER_NAME || 'the salon team';

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

// Voice profiles describe writing tone, not facts about the customer.
const PERSONAS = [
  { id: 'simple', text: 'a straightforward local customer from Pathankot, uses simple everyday words and short natural sentences' },
  { id: 'professional', text: 'a working professional, clear and composed, with a natural and polished but not promotional tone' },
  { id: 'young', text: 'a young adult, casual and conversational, like an ordinary WhatsApp-style review' },
  { id: 'practical', text: 'a practical customer, thoughtful and measured, focused on the actual service experience' },
  { id: 'blunt', text: 'a direct no-nonsense customer who says only what mattered' },
  { id: 'warm', text: 'a warm and appreciative customer, friendly but not exaggerated' },
  { id: 'detailed', text: 'an observant customer who naturally mentions one or two specific details they personally noticed' },
  { id: 'reserved', text: 'a quiet customer who writes a short, understated review without big claims' },
  { id: 'firstvisit', text: 'a customer describing a first visit only if the wording does not invent any specific event' },
  { id: 'regular', text: 'a familiar local customer tone, but do not claim repeat visits unless the customer supplied that fact' },
  { id: 'budget', text: 'a practical customer who may care about value, but does not invent prices or discounts' },
  { id: 'styleaware', text: 'a style-conscious customer who notices presentation and finishing, without exaggeration' },
  { id: 'concise', text: 'a customer who writes casually and briefly, with no unnecessary explanation' },
  { id: 'traveller', text: 'a customer who found the salon near the junction area and writes plainly about the visit, without inventing travel details' },
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
  'start with the salon or its location',
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

const ENDINGS = [
  'end with a small thank-you',
  'end by saying the visitor may consider coming again, without making an exaggerated promise',
  'end with a short plain remark about the experience',
  'end with a natural recommendation only if the review genuinely supports it',
  'stop naturally after the last point, without a wrap-up line',
];

const EXAMPLES = {
  ENGLISH: [
    'Visited The Lounge and found the place neatly set up, the overall experience felt comfortable and simple',
    'The staff listened properly to what I wanted and explained things clearly, that mattered most to me',
    'Easy to find near the junction, the visit was pleasant and the interior had a nice feel',
    'I liked how the service was handled, everything was done calmly and without any rush',
  ],
  HINGLISH: [
    'salon ka setup achha laga, staff ne dhang se baat ki aur experience comfortable raha',
    'junction ke paas easily mil gaya, overall visit sahi raha aur jagah bhi achhi lagi',
    'jo service li thi usme dhyan diya, baat bhi properly samjhayi aur kaam aaram se kiya',
    'simple aur comfortable experience raha, faltu baatein nahi hui aur staff ka behaviour bhi theek tha',
  ],
};

/* =====================================================================
   ENGINE (shared review-generation strategy)
   ===================================================================== */
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const chance = (p) => Math.random() < p;
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

function pickWeighted(items) {
  const total = items.reduce((s, i) => s + i.w, 0);
  let r = Math.random() * total;
  for (const i of items) {
    if ((r -= i.w) <= 0) return i;
  }
  return items[0];
}

// ~8 words = 1 line on a phone screen. Distribution retained from reference.
const LENGTHS = [
  { w: 12, lines: 1, min: 7, max: 11, rule: 'ONE short line, 7 to 10 words' },
  { w: 16, lines: 2, min: 13, max: 21, rule: 'TWO lines, 14 to 20 words' },
  { w: 30, lines: 3, min: 21, max: 31, rule: 'THREE lines, 22 to 30 words' },
  { w: 28, lines: 4, min: 30, max: 42, rule: 'FOUR lines, 32 to 40 words' },
  { w: 14, lines: 5, min: 40, max: 52, rule: 'FIVE lines, 42 to 50 words' },
];

function chooseLength(recent, minLines = 1) {
  const lens = recent.map((r) => r.lines).filter(Boolean);
  const l1 = lens[lens.length - 1];
  const l2 = lens[lens.length - 2];
  const l3 = lens[lens.length - 3];
  let pool = LENGTHS.filter((x) => x.lines >= minLines);

  const mid = (n) => n === 3 || n === 4;
  if (lens.length >= 3 && mid(l1) && mid(l2) && mid(l3)) {
    const f = pool.filter((x) => !mid(x.lines));
    if (f.length) pool = f;
  } else if (l1 && !mid(l1)) {
    const f = pool.filter((x) => mid(x.lines));
    if (f.length) pool = f;
  }
  if (l1 && l1 === l2) {
    const f = pool.filter((x) => x.lines !== l1);
    if (f.length) pool = f;
  }
  return pickWeighted(pool);
}

function choosePersona(recent) {
  const last = recent.map((r) => r.voice).filter(Boolean).slice(-4);
  const pool = PERSONAS.filter((v) => !last.includes(v.id));
  return pick(pool.length ? pool : PERSONAS);
}

function chooseTopic(recent) {
  const last = recent.map((r) => r.topic).filter(Boolean).slice(-2);
  const pool = ALL_TOPICS.filter((t) => !last.includes(t));
  return TOPICS[pick(pool.length ? pool : ALL_TOPICS)];
}

// Customer ke selected chips (maximum 3) ko map karo.
function chosenChips(body) {
  const labels = Array.isArray(body.selectedChips) ? body.selectedChips : [];
  return labels
    .filter((l) => typeof l === 'string' && l !== 'All' && CHIPS[l])
    .slice(0, 3)
    .map((l) => ({ label: l, ...CHIPS[l] }));
}

function chooseFrom(list, key, recent, n = 3) {
  const last = recent
    .map((r) => r[key])
    .filter((v) => v !== undefined && v !== null)
    .slice(-n);
  const pool = list.filter((x) => !last.includes(x));
  return pick(pool.length ? pool : list);
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
  'achhi', 'jagah', 'kaam', 'karwaya', 'karaya', 'dhyan', 'aaram', 'baat', 'theek', 'raha', 'gaye', 'liye', 'wali', 'dhang', 'sunke', 'suna',
]);

/* ------------------ memory (server par, best-effort) ------------------ */
const HISTORY = []; // { open, ws }
const HITS = new Map(); // ip -> [timestamps]

const openingOf = (text) => text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean).slice(0, 3).join(' ');
const wordSet = (t) => new Set(t.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2));

function tooSimilar(text, recentOpenings) {
  const open = openingOf(text);
  if (recentOpenings.includes(open)) return true;
  const ws = wordSet(text);
  for (const h of HISTORY) {
    if (h.open === open) return true;
    let inter = 0;
    for (const w of ws) if (h.ws.has(w)) inter++;
    const union = ws.size + h.ws.size - inter || 1;
    if (inter / union > 0.45) return true;
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
  return arr.length > 25;
}

/* ------------------ cleaning and validation ------------------ */
function cleanReview(text) {
  return text
    .replace(/^['"`\s]+|['"`\s]+$/g, '')
    .replace(/\s*\n+\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\.{2,}/g, ' ')
    .replace(/\.\s+/g, ', ')
    .replace(/\.+$/g, '')
    .replace(/,\s*,/g, ',')
    .trim();
}

function fixCutOff(text) {
  let parts = text.trim().replace(/[,-\s]+$/g, '').split(/\s+/);
  while (parts.length > 6) {
    const last = parts[parts.length - 1].toLowerCase().replace(/[^a-z]/g, '');
    if (!DANGLING.has(last)) break;
    parts.pop();
    parts = parts.join(' ').replace(/[,-\s]+$/g, '').split(/\s+/);
  }
  return parts.join(' ');
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
  if (language === 'HINGLISH') return h >= Math.max(3, Math.floor(words * 0.2));
  return h <= 2;
}

function startsBanned(text) {
  const t = text.trim().toLowerCase();
  return BANNED_OPENINGS.some((b) => t.startsWith(b.toLowerCase()));
}

/* ------------------ Gemini prompt builder ------------------ */
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
  const minLines = chips.length >= 3 ? 4 : chips.length === 2 ? 3 : 1;
  const length = chooseLength(recent, minLines);
  const persona = choosePersona(recent);
  const topic = chips.length
    ? { id: chips[0].id, text: chips[0].text, must: chips[0].must }
    : chooseTopic(recent);
  const extraChips = chips.slice(1);
  const opener = chooseFrom(OPENERS, 'opener', recent, 3);
  const ending = chooseFrom(ENDINGS, 'ending', recent, 2);
  const style = pick(WRITING_STYLES);
  const hinglishLevel = pick(HINGLISH_LEVELS);

  const longEnough = length.lines >= 3;
  const mentionName = chance(0.4);
  const mentionStaff = topic.id === 'chip_staff' || topic.id === 'staff' ? chance(0.5) : chance(0.12);
  const useEmoji = chance(0.06);

  const recentSeo = recent.map((r) => r.seo).filter(Boolean).slice(-8);
  const seoPool = SEO_KEYWORDS.filter((k) => !recentSeo.includes(k));
  const seo = chance(0.25) ? pick(seoPool.length ? seoPool : SEO_KEYWORDS) : null;

  const languageBlock = language === 'HINGLISH'
    ? `LANGUAGE (MOST IMPORTANT): Write in HINGLISH = Hindi sentences typed in English/Roman letters, like a local Pathankot customer on WhatsApp. Level: ${hinglishLevel}. Grammar must be Hindi (hai, tha, kiya, mila, nahi, bahut, aur, ke liye, wala etc.). Service names and local keywords can stay in English. Never write a full English sentence. Never use Devanagari.`
    : 'LANGUAGE (MOST IMPORTANT): Write in simple natural English like an Indian customer. Do not use Hindi words.';

  const examples = shuffle(EXAMPLES[language]).slice(0, 3).map((e) => `- ${e}`).join('\n');
  const experienceBlock = suppliedExperience
    ? `CUSTOMER-SUPPLIED EXPERIENCE (highest priority; use only these facts): ${suppliedExperience}`
    : 'No detailed customer experience was supplied. Keep the draft limited to the selected topic/chips and broad visit impressions. Do not invent a specific treatment, package, occasion, result, product, staff member, price or repeat visit.';
  const customBlock = suppliedInstruction
    ? `ADDITIONAL BUSINESS GUIDANCE (must not override factual rules): ${suppliedInstruction}`
    : '';

  const prompt = `${languageBlock}

You are ${persona.text}. You visited ${businessName}, a ${category} in ${city}, and are drafting a Google Maps review based on the customer's actual experience.
Business: ${businessName} (${city}) | ${category}
About: ${description}
${experienceBlock}
${customBlock}

Tone samples from other customers (only for feel, never copy words or structure):
${examples}

THIS REVIEW:
- Main topic: ${topic.text}. The review must clearly be about this.
${extraChips.length ? `- ALSO naturally cover these selected points (all of them): ${extraChips.map((c) => c.text).join('; ')}.` : '- Stick to the main topic only.'}
- Writing style: ${style}.
- Opening: ${opener}.
${longEnough ? `- Ending: ${ending}.` : ''}
- Length: ${length.rule}. Stay inside this range.
${mentionName ? `- Mention the business name "${businessName}" once, naturally.` : '- Do not repeat the full business name.'}
${seo ? `- If it fits naturally, include the phrase "${seo}" without making it sound like an advertisement.` : ''}
${mentionStaff ? `- You may mention ${OWNER_NAME} only as the salon team; do not invent a person's name.` : '- Do not name any person.'}
${useEmoji ? '- One emoji at the very end is allowed.' : '- No emojis.'}

HARD RULES:
- ONE single paragraph. No line breaks, bullets or title.
- Do NOT use a full stop (.) anywhere. Use commas, "aur"/"and", or natural flow.
- Never start with: ${BANNED_OPENINGS.join(', ')}.
- Sound like a real customer, not an advertisement. No hashtags, slogans, keyword stuffing, no dashes. Avoid polished marketing words (seamless, hassle-free, top-notch, exceptional).
- Never invent a service, treatment, product, package, price, discount, offer, appointment, result, event, staff name, years of experience, rating or repeat visit.
- Do not claim bridal makeup, hair colour, straightening, rebonding, beard grooming or waxing unless the selected chip or customer-supplied experience specifically supports it.
- Do not state that the salon is open now or mention business hours.
- Do not make claims about medical, skin, hair-health or long-lasting outcomes.
- End with a COMPLETE thought. Never stop mid-sentence.
- Output only the review text.`
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\n\n(- )/g, '\n$1');

  return { prompt, length, persona, topic, extraChips, opener, ending, seo, language };
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

/* ------------------ one attempt: generate + validate ------------------ */
async function attempt(apiKey, body, recent, signal) {
  const built = buildPrompt(body, recent);
  const { prompt, length, persona, topic, extraChips, opener, ending, seo, language } = built;

  const payload = {
    contents: [{ role: 'user', parts: [{ text: `Write the review for ${body.businessName || 'The Lounge Unisex Salon'} now.` }] }],
    systemInstruction: { parts: [{ text: prompt }] },
    generationConfig: {
      temperature: 1.0,
      topP: 0.95,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      thinkingConfig: { thinkingBudget: 0 },
    },
  };

  try {
    let { res, data } = await callGemini(apiKey, payload, signal);

    if (!res.ok && /thinking/i.test(data?.error?.message || '')) {
      delete payload.generationConfig.thinkingConfig;
      ({ res, data } = await callGemini(apiKey, payload, signal));
    }
    if (!res.ok) return { ok: false, error: data?.error?.message || 'Gemini API request failed.' };

    const candidate = data.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    const raw = parts.filter((p) => !p.thought).map((p) => p.text || '').join('');
    const review = fixCutOff(cleanReview(raw));
    const words = review.split(/\s+/).filter(Boolean).length;

    if (!review) return { ok: false, error: 'Empty response from Gemini.' };
    if (candidate?.finishReason === 'MAX_TOKENS') return { ok: false, error: 'Response was cut off.' };
    if (looksCutOff(review)) return { ok: false, error: 'Review ended mid-sentence.' };
    if (words > length.max + 8) return { ok: false, error: 'Review too long.' };
    if (words < Math.floor(length.min * 0.75)) return { ok: false, error: 'Review too short.' };
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
      meta: {
        lines: length.lines,
        voice: persona.id,
        topic: topic.id,
        opener,
        ending,
        seo: seo || null,
        open: openingOf(review),
      },
    };
  } catch (e) {
    return {
      ok: false,
      error: e?.name === 'AbortError' ? 'aborted' : e?.message || 'Request failed.',
      aborted: e?.name === 'AbortError',
    };
  }
}

// Jo pehle valid result de, wahi lo.
function firstValid(tasks) {
  return new Promise((resolve) => {
    let pending = tasks.length;
    let firstError = null;
    for (const t of tasks) {
      t.then((r) => {
        if (r.ok) return resolve(r);
        if (!r.aborted && !firstError) firstError = r.error;
        if (--pending === 0) resolve({ ok: false, error: firstError || 'Failed to generate review draft.' });
      });
    }
  });
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
      .slice(-6);

    let lastError = 'Failed to generate review draft.';

    for (let round = 0; round < MAX_ROUNDS; round++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), CALL_TIMEOUT_MS);

      const winner = await firstValid(
        Array.from({ length: PARALLEL_CALLS }, () => attempt(apiKey, body, recent, controller.signal))
      );

      clearTimeout(timer);
      controller.abort(); // Stop the other parallel request after a winner/failure.

      if (winner.ok) {
        remember(winner.review);
        return NextResponse.json({ review: winner.review, meta: winner.meta });
      }
      lastError = winner.error;
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
