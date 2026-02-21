---
description: Load TerraShield project source of truth before any work
---

# ⚠️ MANDATORY FIRST STEP FOR ALL AGENTS

Before doing ANY work on this project, every agent MUST:

1. Read the full project source of truth at:
   `c:\Users\Max\Downloads\TerraShield\.agent\PROJECT_CONTEXT.md`

2. Treat that document as the ONLY canonical source of truth for:
   - Product vision and goals
   - Architecture decisions
   - Implemented vs. planned features
   - Technology stack and versions
   - Implementation rules and constraints
   - Known risks

3. Do NOT hallucinate features or implementations not described in that file.

4. If a user request conflicts with or extends the documented architecture,
   ASK the user to confirm before proceeding, and suggest the safest approach.

5. After completing work, if significant new features or decisions were made,
   UPDATE `PROJECT_CONTEXT.md` to reflect the new state of truth.
