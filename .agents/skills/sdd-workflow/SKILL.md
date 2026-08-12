---
name: sdd-workflow
description: >-
  Use this skill to implement the Spec-Driven Development (SDD) workflow.
  Activate this skill whenever the user explicitly requests to follow SDD,
  or uses slash commands like /sdd, /spec, /plan, /tasks, or /implement.
---

# Spec-Driven Development (SDD) Workflow

Follow this strict 5-step process when developing features in this project. Never jump straight to coding without completing the preceding steps.

## The 5 Steps of SDD

1. **Constitution (`/constitution`)**: Review the core project principles. Ensure you understand the tech stack, the coding style, and the architectural constraints before proposing any design.
2. **Specify (`/spec`)**: Ask the user to describe WHAT to build. Focus purely on user requirements, business logic, and behavior. Do NOT discuss technical implementation at this stage. Document this in an artifact file.
3. **Plan (`/plan`)**: Translate the Specification into a technical implementation plan. Decide on the Database Schema (tables, fields, relations), API endpoints, and Frontend components.
4. **Tasks (`/tasks`)**: Break down the Plan into a sequential, actionable checklist of micro-tasks.
5. **Implement (`/implement`)**: Execute the Tasks one by one. Write the code, verify the syntax, and commit the changes.

## Available Slash Commands

If the user types one of the following commands, immediately execute the corresponding step:
*   `/sdd`: Explain this 5-step SDD workflow to the user and ask if they want to start with step 1.
*   `/constitution`: Display the project's technical constitution and rules.
*   `/spec`: Guide the user to define the specification.
*   `/plan`: Generate the technical plan based on the specification.
*   `/tasks`: Generate the task checklist.
*   `/implement`: Start executing the code implementation based on the tasks.
