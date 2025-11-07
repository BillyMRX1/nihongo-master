# 日本語マスター (Nihongo Master)

A free, open-source Japanese learning platform with spaced repetition and gamification. Learn hiragana, katakana, and over 2,000 kanji covering all JLPT levels.

## Features

**Learning Content**
- 2,211 kanji characters (JLPT N5 through N1)
- Complete hiragana and katakana sets
- Readings, meanings, and stroke counts for all characters

**Learning Modes**
- Recognition: Character → romaji input
- Production: Romaji → multiple choice selection
- Writing: Interactive stroke-by-stroke practice with real-time feedback

**Study System**
- Spaced repetition algorithm (SuperMemo 2)
- Progress tracking with 6 mastery levels
- Smart review scheduling based on performance

**Gamification**
- XP and leveling system
- Combo multipliers for accuracy streaks
- 23+ achievements to unlock
- Daily goal tracking

**Other Features**
- Works offline (PWA)
- Dark mode
- Audio pronunciation via Web Speech API
- Data export/import for backups
- Responsive design for mobile and desktop

## Quick Start

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` to see the app.

## Deployment

The app is designed to run as a static site on GitHub Pages.

1. Update the `base` path in `vite.config.ts` to match your repo name
2. Run `npm run deploy`
3. Enable GitHub Pages in your repo settings (source: gh-pages branch)

See `QUICK_DEPLOY.md` for detailed instructions.

## Tech Stack

Built with React 19, TypeScript, Vite, and Tailwind CSS v4.

Key libraries:
- Zustand for state management
- React Router for navigation
- HanziWriter for stroke order animations
- Framer Motion for UI animations
- Chart.js for progress visualization

## Project Structure

```
src/
├── components/        # React components
├── data/             # JSON files for learning content
├── pages/            # Top-level page components
├── services/         # Business logic (SRS algorithm, etc.)
├── store/            # Zustand state management
└── types/            # TypeScript type definitions
```

## How the SRS Works

Characters progress through 6 mastery levels with increasing review intervals:
- Level 0 (New): Review immediately
- Level 1 (Learning): 1 day
- Level 2 (Familiar): 3 days
- Level 3 (Known): 7 days
- Level 4 (Mastered): 14 days
- Level 5 (Burned): 30+ days

Incorrect answers decrease mastery level; correct answers increase it.

## Data Sources

Kanji data is sourced from [davidluzgouveia/kanji-data](https://github.com/davidluzgouveia/kanji-data) (MIT License).

## Future Plans

Some ideas for future development:

- Vocabulary mode with example sentences (JMdict integration)
- Study calendar/heatmap visualization
- Sentence practice mode
- Custom deck creation
- Anki deck import/export
- Daily challenge system

Contributions welcome if you want to help build any of these features!

## Contributing

Found a bug or have a feature suggestion? Open an issue.

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

<a href="https://github.com/BillyMRX1/nihongo-master/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=BillyMRX1/nihongo-master" />
</a>

## License

MIT License - see LICENSE file for details.

## Acknowledgments

Thanks to the open-source community and the creators of the libraries and data sources that make this project possible.
