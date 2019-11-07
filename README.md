# NBA Fantasy Leaderboard

This script will take a JSON file of player data - scraped from [Basketball Reference](basketball-reference.com) using [simplescraper.io](simplescraper.io) and evaluate it against a list of teams containing 10 drafted players each.

---

Only the top three _Front Court_ (SG or PG) and the top two _Back Court_ (PF, SF or C) are included in your team score

---

Scores are calculated using the following multipliers

| Stat      | Multiplier |
| --------- | :--------: |
| Points    |     1      |
| Rebounds  |    1.5     |
| Assists   |    1.5     |
| Steals    |     2      |
| Blocks    |     2      |
| Turnovers |     -2     |

---

Use `yarn install` to install all dependencies and `yarn start` to run the calculation and generate index.html
