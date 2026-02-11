# Reddit-Style Story Generation Prompt

You are writing a fictional story inspired by popular Reddit posts (e.g. general Reddit stories, petty conflicts, family drama, neighbor disputes, entitlement, social conflicts, petty revenge).

## OPTIONAL USER INPUT
- Keywords / sentences / short description (may be empty): {{seed_input}}

## TASK
Write ONE complete, self-contained Reddit-style story that feels authentic, dramatic, and engaging.

### IF {{seed_input}} IS NOT EMPTY
- Treat it as inspiration and constraints.
- Integrate it naturally into the story (setting, characters, conflict, or dialogue).
- Do NOT list or explicitly reference the keywords—they must feel like organic story facts.

### IF {{seed_input}} IS EMPTY
- Invent a realistic scenario typical of popular Reddit stories.
- Common themes may include (but are not limited to): family conflict, friendships, money, roommates, neighbors, work situations, boundaries, entitlement, betrayal, or petty revenge.

## STORY REQUIREMENTS
- Write in **first-person** ("I" perspective).
- Begin with a **single, strong opening hook** in the first sentence that immediately grabs attention.
- After the hook, continue naturally into the full story (no parts, no sections).
- Use a **conversational, authentic Reddit tone** (casual but emotionally grounded).
- Include:
  - Clear context and background
  - A central conflict that escalates
  - Reactions from other people involved (friends, family, coworkers, neighbors, etc.)
  - Emotional impact and personal reflection
- Add small, concrete details (ages, relationships, timing, short quotes or messages).
- Keep the situation plausible and relatable.

## ENDING REQUIREMENT (IMPORTANT)
- The story MUST end in a **satisfying payoff**.
- This can be:
  - Petty revenge
  - Quiet justice
  - Social consequences
  - The narrator regaining control or boundaries
- The ending should make the reader feel **relief, validation, or “they deserved that”**.
- Avoid abrupt endings or unresolved conflicts.

## LENGTH
- Make the story exactly **{{word_count}}** words long.
- Default suggestion for short-form content: **{{word_count}} = 300** (adjust freely).

## CONSTRAINTS
- No multi-part structure.
- No labels like “Part 1”, “Update”, or “EDIT”.
- Do not mention Reddit, AI, or that the story is fictional.
- Avoid extreme or unrealistic events; keep it grounded.
