# Am I the Asshole Story Generation Prompt (Reddit-Style)

You are writing a fictional story in the style of a Reddit post from r/AmItheAsshole.

## OPTIONAL USER INPUT
- Keywords / sentences / short description (may be empty): {{seed_input}}

## TASK
Write ONE complete “Am I the asshole” post that feels authentic, discussion-worthy, and emotionally satisfying.

### IF {{seed_input}} IS NOT EMPTY
- Treat it as constraints/inspiration.
- Integrate it naturally into the plot (setting, characters, conflict, or dialogue).
- Do NOT simply list the keywords—use them as real story facts.

### IF {{seed_input}} IS EMPTY
- Invent a fresh, realistic scenario typical of top “Am I the asshole” posts (family, roommates, relationships, weddings, money, boundaries, work, parenting, etc.).
- Still ensure moral ambiguity and believable stakes.

## OUTPUT FORMAT (REQUIRED)
- On the very first line, write exactly: GENDER: male  OR  GENDER: female  (the narrator's gender).
- Then a blank line.
- Then the full story text.

## OUTPUT REQUIREMENTS
- First-person narration ("I" perspective).
- Start with a title in the format:  
  **"Am I the asshole for [insert moral dilemma]?"**
- Then write the post body in a realistic Reddit tone (conversational, grounded, emotionally believable).
- The conflict must be morally ambiguous: a reasonable case can be made for BOTH sides.
- Include:
  1. Quick background/context (who is who, relevant history)
  2. The main event (what happened, what you did/said)
  3. Aftermath (reactions: texts/calls/family/friends taking sides)
  4. Why you might be wrong (self-critique)
  5. Why you think you might be right (your justification)
- Add small concrete details (ages, relationships, timeline).
- Include 1–2 short quotes or snippets (e.g., a text message), but keep them brief.
- End with a clear question asking for judgment using the full phrase:  
  **"Am I the asshole?"**

## SATISFYING STORY REQUIREMENT (IMPORTANT)
- The story must feel **emotionally satisfying** to the reader.
- Even if the narrator may be judged “You’re the asshole”, “Everyone sucks”, or “No assholes here”, the ending should include:
  - A sense of justice, consequences, or boundaries being enforced
  - Or a subtle payoff (truth revealed, control regained, social consequences)
- Avoid unresolved frustration or purely depressing outcomes.
- The reader should feel **compelled to react, judge, or comment**.

## LENGTH
- Make the story exactly **{{word_count}}** words long.
- For ~2 minutes of video, aim for 300 words (adjust as needed).

## CONSTRAINTS
- Do NOT use the abbreviation “AITA” anywhere in the output.
- Keep it plausible (no extreme violence, no unbelievable soap opera twists).
- Do not mention it is fictional or AI-generated.
- Do not include “EDIT:” sections unless explicitly requested.
