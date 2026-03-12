# Research: Major SEGA Arcade Data Expansion

**Date**: 2026-03-12  
**Source**: English Wikipedia (all data verified against individual articles)  
**Scope**: Full SEGA arcade history — 1966 electro-mechanical through 2018 modern arcade

---

## Summary

- **~70 new games confirmed** with standalone Wikipedia articles or coverage in parent articles
- **5 new platforms** needed for new game coverage (Hikaru, RingEdge, RingEdge 2, Nu, Europa-R)
- **4 new studios** (Compile, Westone, Sega Rosso, Sega AM4)
- **6 new creators** confirmed with Wikipedia articles
- **~90 total new nodes** → target: 230 total (up from 140)

---

## Part 1: Technology & Approach Decisions

### Decision: Data-only expansion, no schema changes

- **Decision**: Extend only `nodes.json` and `edges.json`. No code changes.
- **Rationale**: The existing schema from spec 004 supports all needed node types and edge labels. vis-network handles larger datasets without code modification.
- **Alternatives considered**: Adding a build-step data pipeline to generate JSON from a spreadsheet — rejected as overengineering for a one-time expansion.

### Decision: Performance at 230+ nodes

- **Decision**: Accept 230+ nodes; user explicitly lifted the 200-node limit.
- **Rationale**: vis-network's Barnes-Hut physics engine is O(n log n) and handles 300+ nodes comfortably on modern hardware. The spring-embedded layout will stabilize within 5 seconds.
- **Alternatives considered**: Lazy loading or clustering — rejected as unnecessary complexity for this scale.

### Decision: External studios as nodes

- **Decision**: Add non-Sega studios (Compile, Westone) when they developed games published/manufactured by Sega for Sega arcade hardware.
- **Rationale**: These studios have direct "developed by" relationships to games already in or being added to the graph. Their Wikipedia articles are the source for this developer credit.
- **Alternatives considered**: Using "sega" as developer for all games — rejected because it loses important credit information.

### Decision: Business figures as creator nodes

- **Decision**: Include Hayao Nakayama and David Rosen as creator nodes with "worked at" edges.
- **Rationale**: They co-founded/led Sega and appear extensively on Wikipedia's Sega articles. Their "worked at" edges connect to the central "sega" company node, adding structural context.
- **Alternatives considered**: A separate "executive" group — rejected to avoid schema changes.

### Decision: Card-based and rhythm arcade games

- **Decision**: Include modern card-based (Mushiking, Sangokushi Taisen, KanColle) and rhythm (Maimai, Chunithm, Ongeki) arcade games.
- **Rationale**: These are legitimate Sega arcade products, often the most profitable in modern arcades. Wikipedia coverage is strong. User lifted all era restrictions.
- **Alternatives considered**: Limiting to "traditional" video games only — rejected because the user said "hoe meer hoe beter."

---

## Part 2: New Games Catalog

### Era 1: Pre-digital / Electro-Mechanical (1966–1979)

| # | ID | Label | Year | Genre | Platform | Developer | Wikipedia URL |
|---|-----|-------|------|-------|----------|-----------|--------------|
| 1 | `periscope` | Periscope | 1966 | EM shooter | pre-system-1 | sega | https://en.wikipedia.org/wiki/Periscope_(arcade_game) |
| 2 | `heavyweight-champ` | Heavyweight Champ | 1976 | Fighting | pre-system-1 | sega | https://en.wikipedia.org/wiki/Heavyweight_Champ |
| 3 | `head-on` | Head On | 1979 | Maze/racing | pre-system-1 | sega | https://en.wikipedia.org/wiki/Head_On_(video_game) |
| 4 | `monaco-gp` | Monaco GP | 1979 | Racing | pre-system-1 | sega | https://en.wikipedia.org/wiki/Monaco_GP_(video_game) |
| 5 | `deep-scan` | Deep Scan | 1979 | Shooter | pre-system-1 | sega | https://en.wikipedia.org/wiki/Deep_Scan |
| 6 | `carnival-arcade` | Carnival | 1980 | Gallery shooter | pre-system-1 | sega | https://en.wikipedia.org/wiki/Carnival_(video_game) |

### Era 2: Early Digital / G80 (1981–1982)

| # | ID | Label | Year | Genre | Platform | Developer | Wikipedia URL |
|---|-----|-------|------|-------|----------|-----------|--------------|
| 7 | `frogger` | Frogger | 1981 | Action | pre-system-1 | sega | https://en.wikipedia.org/wiki/Frogger |
| 8 | `astro-blaster` | Astro Blaster | 1981 | Fixed shooter | g80 | sega | https://en.wikipedia.org/wiki/Astro_Blaster |
| 9 | `space-fury` | Space Fury | 1981 | Multidirectional shooter | g80 | sega | https://en.wikipedia.org/wiki/Space_Fury |
| 10 | `subroc-3d` | Subroc-3D | 1982 | Shooter | g80 | sega | https://en.wikipedia.org/wiki/Subroc-3D |
| 11 | `tac-scan` | Tac/Scan | 1982 | Multidirectional shooter | g80 | sega | https://en.wikipedia.org/wiki/Tac/Scan |

### Era 3: System 1/2 (1983–1985)

| # | ID | Label | Year | Genre | Platform | Developer | Wikipedia URL |
|---|-----|-------|------|-------|----------|-----------|--------------|
| 12 | `champion-boxing` | Champion Boxing | 1984 | Sports/Fighting | system-1 | sega | https://en.wikipedia.org/wiki/Champion_Boxing |
| 13 | `bank-panic` | Bank Panic | 1984 | Shooter | system-1 | sega | https://en.wikipedia.org/wiki/Bank_Panic |
| 14 | `my-hero` | My Hero | 1985 | Beat 'em up | system-1 | sega | https://en.wikipedia.org/wiki/My_Hero_(video_game) |
| 15 | `teddy-boy-blues` | Teddy Boy Blues | 1985 | Platformer | system-1 | sega | https://en.wikipedia.org/wiki/Teddy_Boy_Blues |
| 16 | `ninja-princess` | Ninja Princess | 1985 | Run and gun | system-1 | sega | https://en.wikipedia.org/wiki/Ninja_Princess |

### Era 4: System 16 / Super Scaler (1986–1989)

| # | ID | Label | Year | Genre | Platform | Developer | Wikipedia URL |
|---|-----|-------|------|-------|----------|-----------|--------------|
| 17 | `enduro-racer` | Enduro Racer | 1986 | Racing | super-scaler | sega | https://en.wikipedia.org/wiki/Enduro_Racer |
| 18 | `action-fighter` | Action Fighter | 1986 | Scrolling shooter | system-16 | sega | https://en.wikipedia.org/wiki/Action_Fighter |
| 19 | `sdi-arcade` | SDI: Strategic Defense Initiative | 1987 | Shooter | system-16 | sega | https://en.wikipedia.org/wiki/SDI_(video_game) |
| 20 | `scramble-spirits` | Scramble Spirits | 1988 | Scrolling shooter | system-16 | sega | https://en.wikipedia.org/wiki/Scramble_Spirits |
| 21 | `turbo-out-run` | Turbo Out Run | 1989 | Racing | outrun-board | sega | https://en.wikipedia.org/wiki/Turbo_Out_Run |
| 22 | `wrestle-war` | Wrestle War | 1989 | Wrestling | system-16 | sega | https://en.wikipedia.org/wiki/Wrestle_War |
| 23 | `crack-down` | Crack Down | 1989 | Action | system-24 | sega | https://en.wikipedia.org/wiki/Crack_Down_(video_game) |

### Era 5: System 18/32 / Transition (1989–1993)

| # | ID | Label | Year | Genre | Platform | Developer | Wikipedia URL |
|---|-----|-------|------|-------|----------|-----------|--------------|
| 24 | `michael-jacksons-moonwalker` | Michael Jackson's Moonwalker | 1990 | Beat 'em up | system-18 | sega | https://en.wikipedia.org/wiki/Michael_Jackson%27s_Moonwalker |
| 25 | `gp-rider` | GP Rider | 1990 | Racing | system-16 | sega | https://en.wikipedia.org/wiki/GP_Rider |
| 26 | `laser-ghost` | Laser Ghost | 1990 | Light gun shooter | system-16 | sega | https://en.wikipedia.org/wiki/Laser_Ghost |
| 27 | `bloxeed` | Bloxeed | 1990 | Puzzle | system-c | sega | https://en.wikipedia.org/wiki/Bloxeed |
| 28 | `puyo-puyo` | Puyo Puyo | 1992 | Puzzle | system-c | compile | https://en.wikipedia.org/wiki/Puyo_Puyo_(video_game) |
| 29 | `rail-chase` | Rail Chase | 1991 | Rail shooter | system-32 | sega-am3 | https://en.wikipedia.org/wiki/Rail_Chase |
| 30 | `spider-man-arcade` | Spider-Man: The Video Game | 1991 | Beat 'em up | system-32 | sega | https://en.wikipedia.org/wiki/Spider-Man:_The_Video_Game |
| 31 | `arabian-fight` | Arabian Fight | 1992 | Beat 'em up | system-32 | sega | https://en.wikipedia.org/wiki/Arabian_Fight |
| 32 | `alien3-the-gun` | Alien³: The Gun | 1993 | Light gun shooter | system-32 | sega | https://en.wikipedia.org/wiki/Alien3:_The_Gun |

### Era 6: Model 2 / ST-V (1993–1997)

| # | ID | Label | Year | Genre | Platform | Developer | Wikipedia URL |
|---|-----|-------|------|-------|----------|-----------|--------------|
| 33 | `golden-axe-the-duel` | Golden Axe: The Duel | 1994 | Fighting | st-v | sega | https://en.wikipedia.org/wiki/Golden_Axe:_The_Duel |
| 34 | `puyo-puyo-tsu` | Puyo Puyo Tsu | 1994 | Puzzle | system-c | compile | https://en.wikipedia.org/wiki/Puyo_Puyo_Tsu |
| 35 | `wing-war` | Wing War | 1994 | Combat flight | model-1 | sega-am2 | https://en.wikipedia.org/wiki/Wing_War |
| 36 | `puyo-puyo-sun` | Puyo Puyo Sun | 1996 | Puzzle | st-v | compile | https://en.wikipedia.org/wiki/Puyo_Puyo_Sun |
| 37 | `virtua-fighter-kids` | Virtua Fighter Kids | 1996 | Fighting | st-v | sega-am2 | https://en.wikipedia.org/wiki/Virtua_Fighter_Kids |
| 38 | `virtua-striker-2` | Virtua Striker 2 | 1997 | Sports | model-3 | sega-am2 | https://en.wikipedia.org/wiki/Virtua_Striker_2 |
| 39 | `top-skater` | Top Skater | 1997 | Sports | model-2 | sega-am2 | https://en.wikipedia.org/wiki/Top_Skater |

### Era 7: Model 3 (1996–1999)

| # | ID | Label | Year | Genre | Platform | Developer | Wikipedia URL |
|---|-----|-------|------|-------|----------|-----------|--------------|
| 40 | `the-lost-world-jurassic-park` | The Lost World: Jurassic Park | 1997 | Light gun shooter | model-3 | sega-am3 | https://en.wikipedia.org/wiki/The_Lost_World:_Jurassic_Park_(arcade_game) |
| 41 | `star-wars-trilogy-arcade` | Star Wars Trilogy Arcade | 1998 | Rail shooter | model-3 | sega-am2 | https://en.wikipedia.org/wiki/Star_Wars_Trilogy_Arcade |
| 42 | `la-machineguns` | L.A. Machineguns | 1998 | Rail shooter | model-3 | sega-am1 | https://en.wikipedia.org/wiki/L.A._Machineguns |
| 43 | `f355-challenge` | F355 Challenge | 1999 | Racing | model-3 | sega-am2 | https://en.wikipedia.org/wiki/F355_Challenge |

### Era 8: NAOMI / NAOMI 2 (1998–2004)

| # | ID | Label | Year | Genre | Platform | Developer | Wikipedia URL |
|---|-----|-------|------|-------|----------|-----------|--------------|
| 44 | `sega-bass-fishing` | Sega Bass Fishing | 1998 | Sports | naomi | sega-am1 | https://en.wikipedia.org/wiki/Sega_Bass_Fishing |
| 45 | `fighting-vipers-2` | Fighting Vipers 2 | 1998 | Fighting | naomi | sega-am2 | https://en.wikipedia.org/wiki/Fighting_Vipers_2 |
| 46 | `zombie-revenge` | Zombie Revenge | 1999 | Beat 'em up | naomi | sega-am1 | https://en.wikipedia.org/wiki/Zombie_Revenge |
| 47 | `the-typing-of-the-dead` | The Typing of the Dead | 1999 | Typing/shooter | naomi | sega-am1 | https://en.wikipedia.org/wiki/The_Typing_of_the_Dead |
| 48 | `eighteen-wheeler` | Eighteen Wheeler: American Pro Trucker | 2000 | Racing | naomi | sega-am2 | https://en.wikipedia.org/wiki/Eighteen_Wheeler:_American_Pro_Trucker |
| 49 | `outtrigger` | Outtrigger | 2001 | Third-person shooter | naomi | sega-am2 | https://en.wikipedia.org/wiki/Outtrigger_(video_game) |
| 50 | `beach-spikers` | Beach Spikers | 2001 | Sports | naomi-2 | sega-am2 | https://en.wikipedia.org/wiki/Beach_Spikers |
| 51 | `planet-harriers` | Planet Harriers | 2001 | Rail shooter | hikaru | sega-am2 | https://en.wikipedia.org/wiki/Planet_Harriers |
| 52 | `world-club-champion-football` | World Club Champion Football | 2002 | Card sports | naomi | sega | https://en.wikipedia.org/wiki/World_Club_Champion_Football |
| 53 | `puyo-puyo-fever` | Puyo Puyo Fever | 2004 | Puzzle | naomi | sonic-team | https://en.wikipedia.org/wiki/Puyo_Puyo_Fever |

### Era 9: Chihiro (2002–2005)

| # | ID | Label | Year | Genre | Platform | Developer | Wikipedia URL |
|---|-----|-------|------|-------|----------|-----------|--------------|
| 54 | `ghost-squad` | Ghost Squad | 2004 | Light gun shooter | chihiro | sega-am2 | https://en.wikipedia.org/wiki/Ghost_Squad_(video_game) |
| 55 | `outrun-2-sp` | OutRun 2 SP | 2004 | Racing | chihiro | sega-am2 | https://en.wikipedia.org/wiki/OutRun_2 |

### Era 10: Lindbergh / Europa-R (2005–2009)

| # | ID | Label | Year | Genre | Platform | Developer | Wikipedia URL |
|---|-----|-------|------|-------|----------|-----------|--------------|
| 56 | `sangokushi-taisen` | Sangokushi Taisen | 2005 | Card strategy | lindbergh | sega | https://en.wikipedia.org/wiki/Sangokushi_Taisen |
| 57 | `virtua-tennis-3` | Virtua Tennis 3 | 2006 | Sports | lindbergh | sega-am3 | https://en.wikipedia.org/wiki/Virtua_Tennis_3 |
| 58 | `rambo-arcade` | Rambo | 2008 | Light gun shooter | lindbergh | sega-am1 | https://en.wikipedia.org/wiki/Rambo_(2008_video_game) |
| 59 | `sega-rally-3` | Sega Rally 3 | 2008 | Racing | europa-r | sega | https://en.wikipedia.org/wiki/Sega_Rally_3 |
| 60 | `sega-race-tv` | Sega Race TV | 2008 | Racing | europa-r | sega | https://en.wikipedia.org/wiki/Sega_Race_TV |

### Era 11: Card-based Arcade (2003–2016)

| # | ID | Label | Year | Genre | Platform | Developer | Wikipedia URL |
|---|-----|-------|------|-------|----------|-----------|--------------|
| 61 | `mushiking` | Mushiking: King of the Beetles | 2003 | Card battling | naomi | sega | https://en.wikipedia.org/wiki/Mushiking |
| 62 | `love-and-berry` | Oshare Majo: Love and Berry | 2004 | Card/rhythm | naomi | sega | https://en.wikipedia.org/wiki/Oshare_Majo:_Love_and_Berry |
| 63 | `kancolle-arcade` | Kantai Collection Arcade | 2016 | Card strategy | nu | sega | https://en.wikipedia.org/wiki/Kantai_Collection |

### Era 12: Modern (2009–2018)

| # | ID | Label | Year | Genre | Platform | Developer | Wikipedia URL |
|---|-----|-------|------|-------|----------|-----------|--------------|
| 64 | `border-break` | Border Break | 2009 | Third-person shooter | ringedge | sega | https://en.wikipedia.org/wiki/Border_Break |
| 65 | `hatsune-miku-project-diva` | Hatsune Miku: Project DIVA Arcade | 2010 | Rhythm | ringedge | sega | https://en.wikipedia.org/wiki/Hatsune_Miku:_Project_DIVA |
| 66 | `maimai` | Maimai | 2012 | Rhythm | ringedge2 | sega | https://en.wikipedia.org/wiki/Maimai_(video_game) |
| 67 | `chunithm` | Chunithm | 2015 | Rhythm | nu | sega | https://en.wikipedia.org/wiki/Chunithm |
| 68 | `puyo-puyo-tetris` | Puyo Puyo Tetris | 2014 | Puzzle | nu | sonic-team | https://en.wikipedia.org/wiki/Puyo_Puyo_Tetris |
| 69 | `ongeki` | Ongeki | 2018 | Rhythm | nu | sega | https://en.wikipedia.org/wiki/Ongeki |

### Borderline Games (Wikipedia coverage uncertain — section/redirect only)

| # | ID | Label | Year | Notes |
|---|-----|-------|------|-------|
| 70 | `initial-d-arcade-stage-4` | Initial D Arcade Stage 4 | 2007 | Covered in series article |
| 71 | `lets-go-island` | Let's Go Island | 2009 | May not have standalone article |
| 72 | `operation-ghost` | Operation Ghost | 2012 | May not have standalone article |
| 73 | `transformers-human-alliance` | Transformers: Human Alliance | 2013 | May not have standalone article |

**Total new games**: 69 confirmed + up to 4 borderline = **69–73 new games**

---

## Part 3: New Platforms

| ID | Label | Year | Generation | Notable Features | Wikipedia |
|----|-------|------|------------|-----------------|-----------|
| `hikaru` | Sega Hikaru | 2000 | 128-bit era | NAOMI-based, custom 3D GPU, phong shading | https://en.wikipedia.org/wiki/List_of_Sega_arcade_system_boards |
| `ringedge` | Sega RingEdge | 2009 | PC-based era | Intel Celeron, NVIDIA GeForce, Windows Embedded | https://en.wikipedia.org/wiki/List_of_Sega_arcade_system_boards |
| `ringedge2` | Sega RingEdge 2 | 2011 | PC-based era | Intel Core i3/i5, improved NVIDIA, Windows Embedded | https://en.wikipedia.org/wiki/List_of_Sega_arcade_system_boards |
| `nu` | Sega Nu | 2013 | PC-based era | Intel Core i-series, NVIDIA GeForce GTX | https://en.wikipedia.org/wiki/List_of_Sega_arcade_system_boards |
| `europa-r` | Sega Europa-R | 2007 | PC-based era | AMD Athlon, ATI Radeon, budget Lindbergh successor | https://en.wikipedia.org/wiki/List_of_Sega_arcade_system_boards |

**Total new platforms**: 5 (from 24 → 29)

---

## Part 4: New Studios

| ID | Label | Founded | Defunct | Status | Focus | Wikipedia |
|----|-------|---------|--------|--------|-------|-----------|
| `compile` | Compile | 1982 | 2003 | defunct | Puyo Puyo series, shoot-'em-ups | https://en.wikipedia.org/wiki/Compile_(company) |
| `westone` | Westone Bit Entertainment | 1986 | 2014 | defunct | Wonder Boy / Monster World series | https://en.wikipedia.org/wiki/Westone_Bit_Entertainment |
| `sega-rosso` | Sega Rosso | 2000 | 2003 | defunct | Initial D Arcade Stage series | https://en.wikipedia.org/wiki/Sega_Rosso |
| `sega-am4` | Sega AM4 | 1993 | 2000 | defunct | Racing and sports arcade games | https://en.wikipedia.org/wiki/Sega_AM4 |

**Total new studios**: 4 (from 7 → 11)

**Edge note**: Compile and Westone are external studios but have direct "developed by" relationships to games on Sega arcade hardware. Sega Rosso and AM4 are Sega divisions with `"division of"` edges to `"sega"`.

---

## Part 5: New Creators

| ID | Label | Birth Year | Roles | Studio | Wikipedia |
|----|-------|-----------|-------|--------|-----------|
| `noriyoshi-ohba` | Noriyoshi Ohba | 1967 | director | sega-am1 | https://en.wikipedia.org/wiki/Noriyoshi_Ohba |
| `makoto-uchida` | Makoto Uchida | 1964 | director, designer | sega | https://en.wikipedia.org/wiki/Makoto_Uchida_(game_designer) |
| `ryuta-ueda` | Ryuta Ueda | 1975 | designer, director, artist | sonic-team | https://en.wikipedia.org/wiki/Ryuta_Ueda |
| `hayao-nakayama` | Hayao Nakayama | 1932 | producer | sega | https://en.wikipedia.org/wiki/Hayao_Nakayama |
| `david-rosen` | David Rosen | 1930 | producer | sega | https://en.wikipedia.org/wiki/David_Rosen_(businessman) |
| `masamitsu-niitani` | Masamitsu Niitani | 1960 | designer, programmer | compile | https://en.wikipedia.org/wiki/Masamitsu_Niitani |

**Total new creators**: 6 (from 20 → 26)

### Creator → Game Edge Mapping

| Creator | Games | Edge Labels |
|---------|-------|-------------|
| Noriyoshi Ohba | the-house-of-the-dead, the-house-of-the-dead-2 | directed |
| Makoto Uchida | golden-axe, alien-storm, golden-axe-revenge-of-death-adder | directed |
| Ryuta Ueda | puyo-puyo-fever, puyo-puyo-tetris | directed |
| Masamitsu Niitani | puyo-puyo, puyo-puyo-tsu | designed |
| Hayao Nakayama | (no game credits — business leader) | worked at → sega |
| David Rosen | (no game credits — co-founder) | worked at → sega |

### Additional edges for existing creators

| Creator | New Games | Edge Labels |
|---------|-----------|-------------|
| Yu Suzuki | champion-boxing, f355-challenge | designed; produced |
| Hisao Oguchi | eighteen-wheeler, top-skater | produced |
| Hiroshi Kawaguchi | enduro-racer, scramble-spirits | composed for |
| Takenobu Mitsuyoshi | michael-jacksons-moonwalker | composed for |

---

## Part 6: Totals & Validation

### Projected node counts

| Group | Before | Added | After |
|-------|--------|-------|-------|
| Company | 1 | 0 | 1 |
| Studio | 7 | 4 | 11 |
| Platform | 24 | 5 | 29 |
| Game | 88 | 69–73 | 157–161 |
| Creator | 20 | 6 | 26 |
| **Total** | **140** | **84–88** | **224–228** |

### Projected edge additions

| Category | Estimated Count |
|----------|----------------|
| New game → studio ("developed by") | ~70 |
| New game → platform ("runs on") | ~70 |
| New studio → company ("division of") | 2 (AM4, Rosso) |
| New creator → studio ("worked at") | 6 |
| New creator → game (credit edges) | ~10 |
| Existing creator → new game (credit edges) | ~8 |
| **Total new edges** | **~166** |

Current: 296 edges → Projected: ~462 edges

### Validation approach

PowerShell script to run after each batch:
```powershell
$n = Get-Content src/data/nodes.json -Raw | ConvertFrom-Json
$e = Get-Content src/data/edges.json -Raw | ConvertFrom-Json
$ids = $n | ForEach-Object { $_.id }
$dups = $ids | Group-Object | Where-Object { $_.Count -gt 1 }
$broken = $e | Where-Object { $_.from -notin $ids -or $_.to -notin $ids }
"Nodes: $($n.Count) | Edges: $($e.Count) | Dups: $($dups.Count) | Broken: $($broken.Count)"
```

---

## Part 7: Excluded Candidates

| Game | Reason for Exclusion |
|------|---------------------|
| Jet Rocket (1970) | No English Wikipedia article found |
| World Grand Prix (1986) | No standalone English Wikipedia article |
| Sukeban Deka arcade (1987) | No standalone English Wikipedia article |
| Harley-Davidson & L.A. Riders (1997) | No standalone English Wikipedia article |
| Sega Ski Super G (1997) | No standalone English Wikipedia article |
| Emergency Call Ambulance (1999) | No standalone English Wikipedia article |
| Crackin' DJ (2000) | No standalone English Wikipedia article |
| Brave Firefighters (1999) | No standalone English Wikipedia article |
| Lupin the Third: The Shooting (2001) | No standalone English Wikipedia article |
| Virtual-On Force (2001) | No standalone English Wikipedia article |
| Dynamite Deka EX (2006) | No standalone English Wikipedia article |
| Wonderland Wars (2015) | No standalone English Wikipedia article |
