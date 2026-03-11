---
name: gsd:context
description: Switch GSD context mode (dev/research/review)
argument-hint: <mode>
allowed-tools:
  - Read
  - Bash
---

<objective>
Switch the active GSD context mode. Context modes change how GSD workflows execute by adjusting behavior around planning depth, execution speed, communication style, and verification rigor.

Available modes:
- **dev** -- Write code first, explain after. Minimize discussion, maximize output.
- **research** -- Read widely before concluding. Extended research, deeper questioning.
- **review** -- Quality over speed. Thorough evaluation, security-first, severity-ordered findings.
</objective>

<context>
$ARGUMENTS
</context>

<process>
1. **Parse the mode argument** from `$ARGUMENTS`. Accepted values: `dev`, `research`, `review`.

2. **Validate the mode:**
   - If no argument is provided, list the three available modes with one-line descriptions and ask the user to choose.
   - If the argument does not match an available mode, show an error with the valid options.

3. **Load the context file:**
   - Read the context file at `@~/.claude/get-shit-done/contexts/<mode>.md`.
   - If the file does not exist, report the error and abort.

4. **Apply the context:**
   - Display the context mode name and focus statement to confirm activation.
   - Instruct all subsequent GSD workflows in this session to follow the behavior overrides defined in the loaded context file.

5. **Confirm activation:**
   - Output: `Context mode switched to: <mode>`
   - Show the focus line from the context file as a reminder.
</process>
