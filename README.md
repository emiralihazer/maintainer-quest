# Maintainer Quest

Maintainer Quest is a choice-based browser game about open-source maintenance.
Players run a 12-week release campaign and make tradeoffs across issue triage,
pull request review, release timing, security disclosure, documentation,
governance, funding, compatibility, incidents, and maintainer energy.

The goal is not to gamify maintenance as easy work. The goal is to help new
contributors and solo maintainers feel the pressure of real tradeoffs in a safe,
fast, replayable format.

## Why this exists

Open-source projects often fail at the human layer: unclear issue reports,
overloaded maintainers, rushed releases, hidden security work, and contributors
who want to help but do not know where the project boundary is.

Maintainer Quest turns those situations into a lightweight simulation that can be
used in workshops, onboarding docs, contributor guides, or classroom discussions.

## Features

- No build step and no external dependencies
- 12-week campaign with escalating maintainer scenarios
- Several endings based on the shape of the whole run
- Project health meters for trust, quality, velocity, maintainer energy,
  security posture, and sustainability
- Project assets such as release checklists, advisory notes, test harnesses,
  contributor maps, and funding plans
- Risk flags that track accumulated maintenance debt
- Local run persistence with `localStorage`
- Copyable run summary for discussion or issue templates
- Responsive layout and reduced-motion friendly animation

## Run locally

Open `index.html` in a browser.

For a local server:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Roadmap

- Add scenario packs for ecosystems such as Python, npm, Rust, and browser tools
- Add shareable encoded run URLs
- Add a maintainer workshop mode with facilitator prompts
- Add Turkish language content
- Add automated accessibility checks

## Contributing

Issues and pull requests are welcome. Useful contributions include:

- New realistic maintenance scenarios
- Better ending logic
- Accessibility improvements
- Translations
- Lightweight tests for the game state transitions

Please keep scenarios specific, respectful, and grounded in real open-source
maintenance work.

## License

MIT
