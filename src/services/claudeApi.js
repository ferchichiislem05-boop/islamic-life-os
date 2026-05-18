import Anthropic from '@anthropic-ai/sdk'

// ─── Client factory (key from env — never hardcoded) ──────────────────────
const getClient = () => {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!key || key === 'sk-ant-your-key-here') {
    throw new Error(
      'Missing API key. Add VITE_ANTHROPIC_API_KEY to your .env file.'
    )
  }
  return new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true })
}

const MODEL = 'claude-sonnet-4-6'

// ─── JSON schema validator ────────────────────────────────────────────────
function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0
}
function isArray(v) {
  return Array.isArray(v)
}

/**
 * Validates and sanitises the AI psychology session response.
 * Returns a clean object; missing/malformed fields get safe defaults.
 * Never throws — always returns something renderable.
 */
export function validatePsychResponse(raw) {
  if (!raw || typeof raw !== 'object') return null

  const clean = {}

  // pattern
  clean.pattern = isNonEmptyString(raw.pattern) ? raw.pattern : 'Psychological Pattern'

  // rootBelief
  clean.rootBelief = isNonEmptyString(raw.rootBelief) ? raw.rootBelief : null

  // islamicReframe
  clean.islamicReframe = isNonEmptyString(raw.islamicReframe) ? raw.islamicReframe : null

  // ayaat — array of { arabic, translation, surah }
  if (isArray(raw.ayaat)) {
    clean.ayaat = raw.ayaat
      .filter(
        (a) =>
          a &&
          typeof a === 'object' &&
          isNonEmptyString(a.arabic) &&
          isNonEmptyString(a.translation)
      )
      .map((a) => ({
        arabic: a.arabic,
        translation: a.translation,
        surah: isNonEmptyString(a.surah) ? a.surah : '',
        relevance: isNonEmptyString(a.relevance) ? a.relevance : '',
      }))
  } else {
    clean.ayaat = []
  }

  // ahadith — array of { text|translation, source, context, arabic? }
  if (isArray(raw.ahadith)) {
    clean.ahadith = raw.ahadith
      .filter(
        (h) =>
          h &&
          typeof h === 'object' &&
          (isNonEmptyString(h.text) || isNonEmptyString(h.translation))
      )
      .map((h) => ({
        arabic: isNonEmptyString(h.arabic) ? h.arabic : null,
        text: isNonEmptyString(h.text) ? h.text : h.translation,
        source: isNonEmptyString(h.source) ? h.source : 'Hadith',
        context: isNonEmptyString(h.context) ? h.context : '',
      }))
  } else {
    clean.ahadith = []
  }

  // propheticModel
  if (raw.propheticModel && typeof raw.propheticModel === 'object') {
    clean.propheticModel = {
      incident: isNonEmptyString(raw.propheticModel.incident)
        ? raw.propheticModel.incident
        : 'Prophetic Example',
      narrative: isNonEmptyString(raw.propheticModel.narrative)
        ? raw.propheticModel.narrative
        : '',
      parallel: isNonEmptyString(raw.propheticModel.parallel)
        ? raw.propheticModel.parallel
        : '',
    }
  } else {
    clean.propheticModel = null
  }

  // exercises — array of { title, description, duration, type }
  if (isArray(raw.exercises)) {
    clean.exercises = raw.exercises
      .filter(
        (e) =>
          e &&
          typeof e === 'object' &&
          isNonEmptyString(e.title)
      )
      .map((e) => ({
        title: e.title,
        description: isNonEmptyString(e.description) ? e.description : '',
        duration: isNonEmptyString(e.duration) ? e.duration : '',
        type: ['dhikr', 'cognitive', 'physical', 'journaling', 'social'].includes(e.type)
          ? e.type
          : 'dhikr',
        checked: false,
      }))
  } else {
    clean.exercises = []
  }

  // weeklyPlan — array of { day, focus, task, dua?, reflection? }
  if (isArray(raw.weeklyPlan)) {
    clean.weeklyPlan = raw.weeklyPlan
      .filter((d) => d && typeof d === 'object' && d.day >= 1 && d.day <= 7)
      .sort((a, b) => a.day - b.day)
      .map((d) => ({
        day: d.day,
        focus: isNonEmptyString(d.focus) ? d.focus : `Day ${d.day}`,
        task: isNonEmptyString(d.task) ? d.task : '',
        dua: isNonEmptyString(d.dua) ? d.dua : '',
        reflection: isNonEmptyString(d.reflection) ? d.reflection : '',
      }))
  } else {
    clean.weeklyPlan = []
  }

  return clean
}

/**
 * Safely parses the first JSON object found in a text response.
 * Returns null if nothing parseable is found.
 */
function extractJSON(text) {
  // Try direct parse first
  try {
    return JSON.parse(text)
  } catch {
    // Try to find a JSON block
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null
    try {
      return JSON.parse(match[0])
    } catch {
      return null
    }
  }
}

// ─── Psychology Session ────────────────────────────────────────────────────
export async function generatePsychSession(userInput, category = '') {
  const client = getClient()

  const systemPrompt = `You are an Islamic psychological coach with deep knowledge of the Quran, Sahih Sunnah, and modern psychology (CBT, attachment theory, trauma, ACT).

When a user shares a life struggle, respond with a structured JSON object. Be authentic, compassionate, and grounded in authentic Islamic sources only.

CRITICAL RULES:
- Only cite Quran and Sahih (authenticated) hadith — never fabricate
- Be specific and personal in your response
- The seerahConnection must name a specific incident from the Prophet's ﷺ life
- Practical exercises must be actionable TODAY

Return ONLY valid JSON matching this exact schema (no markdown, no prose outside JSON):
{
  "pattern": "Name of psychological pattern (e.g. 'Scarcity Mindset', 'Abandonment Wound')",
  "rootBelief": "Core limiting belief (e.g. 'I am not enough')",
  "islamicReframe": "How Islam reframes this belief using a Quranic principle (2-3 sentences)",
  "ayaat": [
    {
      "arabic": "Full Arabic text of the ayah",
      "translation": "English translation",
      "surah": "Surah name and verse number",
      "relevance": "Why this ayah addresses this specific feeling"
    }
  ],
  "ahadith": [
    {
      "arabic": "Arabic text if available",
      "text": "Full English translation",
      "source": "Exact source (e.g. Sahih al-Bukhari 6311)",
      "context": "When the Prophet ﷺ said this and why it is relevant"
    }
  ],
  "propheticModel": {
    "incident": "Name of specific Seerah incident",
    "narrative": "150-200 word narrative of how the Prophet ﷺ faced a similar situation",
    "parallel": "Direct connection to the user's situation"
  },
  "exercises": [
    {
      "title": "Exercise title",
      "description": "Clear actionable description",
      "duration": "Time required (e.g. '5 minutes')",
      "type": "dhikr | cognitive | physical | journaling | social"
    }
  ],
  "weeklyPlan": [
    {
      "day": 1,
      "focus": "Theme for the day",
      "task": "Specific action to take",
      "dua": "A specific Arabic dua to recite today",
      "reflection": "Evening reflection question"
    }
  ]
}`

  const userMessage = category
    ? `Category: ${category}\n\nUser's situation: ${userInput}`
    : `User's situation: ${userInput}`

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: userMessage }],
  })

  const raw = extractJSON(response.content[0].text)
  if (!raw) throw new Error('AI returned an unreadable response. Please try again.')

  const validated = validatePsychResponse(raw)
  if (!validated) throw new Error('AI response was malformed. Please try again.')

  return validated
}

// ─── AI Dua Search ─────────────────────────────────────────────────���──────
export async function searchDuas(query) {
  const client = getClient()

  const systemPrompt = `You are an Islamic scholar specializing in authentic duas from the Quran and Sahih Sunnah.

Given a situation or need, return 2-3 authentic duas that directly address it.

RULES:
- Only Quran and Sahih authenticated hadith — never fabricate
- Include exact source citations

Return ONLY valid JSON (no markdown):
{
  "duas": [
    {
      "arabic": "Full Arabic text",
      "transliteration": "Latin transliteration",
      "translation": "English translation",
      "source": "Exact source",
      "context": "When/why this dua is used",
      "howToUse": "Practical instructions (timing, repetitions, etc.)"
    }
  ]
}`

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: `Find authentic duas for: ${query}` }],
  })

  const raw = extractJSON(response.content[0].text)
  if (!raw || !Array.isArray(raw.duas)) throw new Error('Invalid AI response')

  return {
    duas: raw.duas.filter(
      (d) =>
        d &&
        isNonEmptyString(d.arabic) &&
        isNonEmptyString(d.translation)
    ),
  }
}

// ─── Seerah Story Generator ───────────────────────────────────────────────
export async function generateSeerahStory(topic, userContext = '') {
  const client = getClient()

  const systemPrompt = `You are an Islamic scholar specializing in the Seerah of Prophet Muhammad ﷺ.

Permitted sources ONLY:
- Sirat Ibn Hisham
- Tabaqat Ibn Sa'd
- Sahih al-Bukhari and Sahih Muslim (for hadith within Seerah context)
- Ibn Kathir's Al-Bidaya wan-Nihaya

Return ONLY valid JSON (no markdown):
{
  "title": "Story title in English",
  "narrative": "300-500 word narrative of the Seerah incident",
  "source": "Primary source reference",
  "modernParallel": "How this applies to a modern person's situation",
  "keyLesson": "The main lesson in 2-3 sentences",
  "dua": {
    "arabic": "A relevant dua in Arabic",
    "translation": "English translation",
    "source": "Source"
  }
}`

  const userMessage = userContext
    ? `Tell a Seerah story about: ${topic}\n\nUser's context: ${userContext}`
    : `Tell a Seerah story about: ${topic}`

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: userMessage }],
  })

  const raw = extractJSON(response.content[0].text)
  if (!raw || !isNonEmptyString(raw.title)) throw new Error('Invalid story response')
  return raw
}

// ─── Apply Seerah to My Life ─────────────────────────────────────────────────
export async function applySeerahToLife(seerahTitle, seerahLesson, userSituation) {
  const client = getClient()

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 512,
    system: [
      {
        type: 'text',
        text: 'You are a compassionate Islamic life coach. When given a Seerah story and a personal situation, respond in 3-4 sentences showing specifically how the Prophet\'s ﷺ example applies. Be direct, practical, and warm — speak as a mentor, not a lecturer. Ground every point in the story provided.',
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: `Seerah Story: ${seerahTitle}\nKey Lesson: ${seerahLesson}\n\nMy situation: ${userSituation}`,
      },
    ],
  })

  return response.content[0].text.trim()
}

