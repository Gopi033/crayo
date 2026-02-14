# r/tifu Story Generation Prompt (Reddit-Style)

You are writing a fictional story in the style of a highly upvoted post from r/tifu (“Today I Fucked Up”).

## OPTIONAL USER INPUT
- Keywords / sentences / short description (may be empty): {{seed_input}}

## TASK
Write ONE complete “Today I fucked up” post that feels authentic, funny/cringe, and has real consequences.

### IF {{seed_input}} IS NOT EMPTY
- Treat it as constraints/inspiration.
- Integrate it naturally into the story (setting, characters, conflict, or key moments).
- Do NOT list the keywords—use them as real story facts.

### IF {{seed_input}} IS EMPTY
- Invent a fresh, realistic screw-up typical of top r/tifu posts.
- Choose a scenario with relatable stakes (work, family, dating, tech, travel, friends, social embarrassment, money, misunderstandings, accidental messages/calls, etc.).

## OUTPUT FORMAT (REQUIRED)
- On the very first line, write exactly: GENDER: male  OR  GENDER: female  (the narrator's gender).
- Then a blank line.
- Then the full story text.

## OUTPUT REQUIREMENTS (TIFU AUTHENTICITY)
- Write in first-person (“I” perspective).
- Start with a title exactly in this format (no abbreviation):
  **"Today I fucked up by [doing the thing]"**
- In the first 1–2 sentences, include a strong hook that immediately signals the disaster (humor + dread).
- The story must be a real “fuck up” with consequences (not a humblebrag, not a nothing-burger).
- Use a conversational Reddit tone: self-deprecating, specific, believable.
- Include these beats (smoothly, no headings):
  1) Quick context (who/where/why it mattered)
  2) The mistake (what you did wrong)
  3) Escalation (how it got worse step-by-step)
  4) The “oh no” moment (the peak cringe / panic)
  5) Fallout (what happened after: reactions, costs, awkward aftermath)
  6) A small reflection (what you learned / what you’ll never do again)
- Add concrete details (ages optional, timing, location, 1–2 short quotes/text snippets).
- Keep it plausible and grounded (avoid extreme violence or unbelievable soap-opera twists).
- End with a separate final line starting with:
  **"TL;DR:"** followed by a one-sentence summary.

## LENGTH
- Make the story exactly **{{word_count}}** words long.
- Default suggestion for ~2 minutes: **{{word_count}} = 300** (adjust freely).

## CONSTRAINTS
- Do NOT use the abbreviation “TIFU” anywhere in the output.
- No “Part 1/Part 2”, no “EDIT:” unless explicitly requested.
- Do not mention Reddit, AI, or that the story is fictional.
- Keep any adult content non-graphic and TikTok-safe (implied, not explicit).
