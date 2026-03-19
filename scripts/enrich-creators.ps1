<#
.SYNOPSIS
    Enrich SEGA graph with creator data from Wikidata SPARQL and Wikipedia.
.DESCRIPTION
    Queries Wikidata for Sega game creators (director, composer, producer, designer),
    filters non-game-creators, maps to existing graph IDs, enriches with Wikipedia data,
    and merges results into nodes.json and edges.json idempotently.
.NOTES
    Constitution v1.3.0 -- structured data exception for Wikidata (CC0).
    Rate limit: 1 request/second to Wikidata SPARQL endpoint.
#>

param(
    [switch]$DryRun,
    [switch]$SkipWikipedia
)

Set-Location $PSScriptRoot\..
$ErrorActionPreference = "Stop"

# ── Paths ──────────────────────────────────────────────────────────────────────
$nodesPath = "src/data/nodes.json"
$edgesPath = "src/data/edges.json"

# ── Exclusion list (non-game-creators per research.md §R2) ─────────────────────
$excludedQIDs = @(
    "Q2831"        # Michael Jackson -- musician, not game developer
    "Q131472725"   # Unresolved QID
    "Q260125"      # John G. Avildsen -- film director
    "Q3276468"     # Kei Tani -- actor/comedian
    "Q358842"      # Ron Thal -- rock musician
    "Q3180045"     # Joe Delia -- film composer
    "Q464833"      # Ian McDonald -- musician
    "Q5290049"     # Domenic Troiano -- musician
    "Q3098670"     # Yoshio Sakamoto -- Nintendo employee
    "Q56348353"    # Ko Takeuchi -- Nintendo employee
    "Q56348334"    # Masami Yone -- Nintendo employee
    "Q1155641"     # Tsunku -- J-pop producer
)

# ── Wikidata property → edge label mapping (research.md §R4) ──────────────────
$propertyToLabel = @{
    "P943"  = "directed"      # game director
    "P57"   = "directed"      # director
    "P86"   = "composed for"  # composer
    "P170"  = "designed"      # creator (treat as designed)
    "P162"  = "produced"      # producer
    "P3080" = "designed"      # game designer
}

# ── Game label → graph node ID mapping (research.md §R3) ──────────────────────
$gameMapping = @{
    "Gain Ground"                              = "gain-ground"
    "Rambo III"                                = "rambo-arcade"
    "Scramble Spirits"                         = "scramble-spirits"
    "Crack Down"                               = "crack-down"
    "Wonder Boy in Monster Land"               = "wonder-boy-monster-land"
    "Streets of Rage"                          = "streets-of-rage"
    "Golden Axe II"                            = "golden-axe-ii"
    "Golden Axe III"                           = "golden-axe-iii"
    "Yakuza 0"                                 = "yakuza-0"
    "Valkyria Chronicles"                      = "valkyria-chronicles"
    "Sakura Wars"                              = "sakura-wars"
    "Fantasy Zone"                             = "fantasy-zone"
    "Alex Kidd: The Lost Stars"                = "alex-kidd-the-lost-stars"
    "ESWAT: City Under Siege"                  = "eswat"
    "Let's Go Jungle!: Lost on the Island of Spice" = "lets-go-jungle"
    "Super Monkey Ball"                        = "monkey-ball"
    "Golden Axe: The Revenge of Death Adder"   = "golden-axe-revenge-of-death-adder"
    "Hang-On"                                  = "hang-on"
    "Space Harrier"                            = "space-harrier"
    "Out Run"                                  = "out-run"
    "After Burner"                             = "after-burner"
    "Sonic the Hedgehog"                       = "sonic-the-hedgehog"
    "Virtua Fighter"                           = "virtua-fighter"
    "Daytona USA"                              = "daytona-usa"
    "Sonic Generations"                        = "sonic-generations"
}

# ── Creator inclusion list with metadata (data-model.md) ──────────────────────
# Only creators we want to add -- pre-vetted from research
$creatorData = @(
    # Tier 1: No Wikipedia
    @{ id="katsuhiro-hayashi"; label="Katsuhiro Hayashi"; qid="Q11532861"; birthYear=1965; roles=@("composer"); notableRoles="Composer"; gender="male"; hasWikipedia=$false }
    @{ id="yasuhiro-kawakami"; label="Yasuhiro Kawakami"; qid="Q8049979"; birthYear=$null; roles=@("composer"); notableRoles="Composer"; gender="male"; hasWikipedia=$false }
    @{ id="shinichi-sakamoto"; label="Shinichi Sakamoto"; qid="Q125399846"; birthYear=1966; roles=@("composer"); notableRoles="Composer"; gender="male"; hasWikipedia=$false }
    # Tier 2: With Wikipedia
    @{ id="yuzo-koshiro"; label="Yuzo Koshiro"; qid="Q948524"; birthYear=1967; roles=@("composer"); notableRoles="Composer"; gender="male"; hasWikipedia=$true; wpTitle="Yuzo_Koshiro" }
    @{ id="naofumi-hataya"; label="Naofumi Hataya"; qid="Q6964522"; birthYear=1966; roles=@("composer"); notableRoles="Composer"; gender="male"; hasWikipedia=$true; wpTitle="Naofumi_Hataya" }
    @{ id="hidenori-shoji"; label="Hidenori Shoji"; qid="Q5752541"; birthYear=1975; roles=@("composer"); notableRoles="Composer"; gender="male"; hasWikipedia=$true; wpTitle="Hidenori_Shoji" }
    @{ id="hitoshi-sakimoto"; label="Hitoshi Sakimoto"; qid="Q1196596"; birthYear=1969; roles=@("composer"); notableRoles="Composer"; gender="male"; hasWikipedia=$true; wpTitle="Hitoshi_Sakimoto" }
    @{ id="saori-kobayashi"; label="Saori Kobayashi"; qid="Q3950173"; birthYear=$null; roles=@("composer"); notableRoles="Composer"; gender="female"; hasWikipedia=$true; wpTitle="Saori_Kobayashi" }
    @{ id="tatsuyuki-maeda"; label="Tatsuyuki Maeda"; qid="Q3516110"; birthYear=1968; roles=@("composer"); notableRoles="Composer"; gender="male"; hasWikipedia=$true; wpTitle="Tatsuyuki_Maeda" }
    @{ id="hideaki-kobayashi"; label="Hideaki Kobayashi"; qid="Q5752243"; birthYear=1973; roles=@("composer"); notableRoles="Composer"; gender="male"; hasWikipedia=$true; wpTitle="Hideaki_Kobayashi_(composer)" }
    @{ id="kohei-tanaka"; label="Kōhei Tanaka"; qid="Q2562073"; birthYear=1954; roles=@("composer"); notableRoles="Composer"; gender="male"; hasWikipedia=$true; wpTitle="Kohei_Tanaka_(composer)" }
    @{ id="spencer-nilsen"; label="Spencer Nilsen"; qid="Q4118577"; birthYear=1961; roles=@("composer"); notableRoles="Composer"; gender="male"; hasWikipedia=$true; wpTitle="Spencer_Nilsen" }
    @{ id="motoaki-takenouchi"; label="Motoaki Takenouchi"; qid="Q3325232"; birthYear=1967; roles=@("composer"); notableRoles="Composer"; gender="male"; hasWikipedia=$true; wpTitle="Motoaki_Takenouchi" }
    @{ id="hiroki-kikuta"; label="Hiroki Kikuta"; qid="Q2588785"; birthYear=1962; roles=@("composer"); notableRoles="Composer"; gender="male"; hasWikipedia=$true; wpTitle="Hiroki_Kikuta" }
    # Tier 3: Wikidata-only, various roles
    @{ id="tetsu-katano"; label="Tetsu Katano"; qid="Q4217158"; birthYear=$null; roles=@("director"); notableRoles="Game Director"; gender="male"; hasWikipedia=$false }
    @{ id="hiroshi-miyamoto"; label="Hiroshi Miyamoto"; qid="Q17118987"; birthYear=1985; roles=@("director"); notableRoles="Game Director"; gender="male"; hasWikipedia=$false }
    @{ id="hiroyoshi-kato"; label="Hiroyoshi Katō"; qid="Q11399379"; birthYear=$null; roles=@("producer"); notableRoles="Producer"; gender="male"; hasWikipedia=$false }
    @{ id="mitsuharu-fukuyama"; label="Mitsuharu Fukuyama"; qid="Q124378546"; birthYear=$null; roles=@("producer"); notableRoles="Producer"; gender="male"; hasWikipedia=$false }
    @{ id="mariko-nanba"; label="Mariko Nanba"; qid="Q6763443"; birthYear=1971; roles=@("director"); notableRoles="Game Director"; gender="female"; hasWikipedia=$false }
    @{ id="akiyuki-tateyama"; label="Akiyuki Tateyama"; qid="Q18818397"; birthYear=1980; roles=@("director"); notableRoles="Game Director"; gender="male"; hasWikipedia=$false }
)

# ── Credit edges from data-model.md (Tier 1 + new edges for existing creators) ──
$creditEdges = @(
    # Tier 1 creator → game edges
    @{ from="katsuhiro-hayashi"; to="gain-ground"; label="composed for" }
    @{ from="katsuhiro-hayashi"; to="rambo-arcade"; label="composed for" }
    @{ from="yasuhiro-kawakami"; to="scramble-spirits"; label="composed for" }
    @{ from="yasuhiro-kawakami"; to="crack-down"; label="composed for" }
    @{ from="shinichi-sakamoto"; to="wonder-boy-monster-land"; label="composed for" }
    # Tier 2 creator → game edges
    @{ from="yuzo-koshiro"; to="streets-of-rage"; label="composed for" }
    @{ from="naofumi-hataya"; to="golden-axe-ii"; label="composed for" }
    @{ from="naofumi-hataya"; to="golden-axe-iii"; label="composed for" }
    @{ from="hidenori-shoji"; to="yakuza-0"; label="composed for" }
    @{ from="hitoshi-sakimoto"; to="valkyria-chronicles"; label="composed for" }
    @{ from="kohei-tanaka"; to="sakura-wars"; label="composed for" }
    # New edges for EXISTING creators (data-model.md §New Edges for Existing Creators)
    @{ from="takayuki-nakamura"; to="eswat"; label="composed for" }
    @{ from="takenobu-mitsuyoshi"; to="lets-go-jungle"; label="composed for" }
    @{ from="hideki-naganuma"; to="monkey-ball"; label="composed for" }
    @{ from="tomoya-ohtani"; to="monkey-ball"; label="composed for" }
    @{ from="makoto-uchida"; to="golden-axe-revenge-of-death-adder"; label="directed" }
    @{ from="hiroshi-kawaguchi"; to="alex-kidd-the-lost-stars"; label="composed for" }
)

# ── "worked at" edges for all new creators ────────────────────────────────────
$workedAtEdges = $creatorData | ForEach-Object {
    @{ from=$_.id; to="sega"; label="worked at" }
}

# ── New game nodes needed (Tier 2 games not in graph) ─────────────────────────
# Wikipedia data will be fetched live; these are the skeleton definitions
$newGames = @(
    @{ id="streets-of-rage"; label="Streets of Rage"; releaseYear=1991; genre="Beat 'em up"; wpTitle="Streets_of_Rage_(video_game)"; qid="Q1064284" }
    @{ id="golden-axe-ii"; label="Golden Axe II"; releaseYear=1991; genre="Beat 'em up"; wpTitle="Golden_Axe_II"; qid="Q2253279" }
    @{ id="golden-axe-iii"; label="Golden Axe III"; releaseYear=1993; genre="Beat 'em up"; wpTitle="Golden_Axe_III"; qid="Q3110083" }
    @{ id="yakuza-0"; label="Yakuza 0"; releaseYear=2015; genre="Action-adventure"; wpTitle="Yakuza_0"; qid="Q20899846" }
    @{ id="valkyria-chronicles"; label="Valkyria Chronicles"; releaseYear=2008; genre="Tactical RPG"; wpTitle="Valkyria_Chronicles"; qid="Q587268" }
    @{ id="sakura-wars"; label="Sakura Wars"; releaseYear=1996; genre="Tactical RPG"; wpTitle="Sakura_Wars_(1996_video_game)"; qid="Q1068498" }
)

# ── Functions ──────────────────────────────────────────────────────────────────

function Get-WikipediaSummary {
    param([string]$Title)
    $uri = "https://en.wikipedia.org/api/rest_v1/page/summary/$Title"
    try {
        Start-Sleep -Seconds 1
        $resp = Invoke-RestMethod -Uri $uri -Headers @{ "User-Agent" = "SEGAGraphBot/1.0 (https://github.com/arjen1981/SEGA)" }
        $summary = $resp.extract
        $thumbnail = if ($resp.thumbnail) { $resp.thumbnail.source } else { $null }
        return @{ summary = $summary; thumbnail = $thumbnail }
    } catch {
        Write-Warning "Wikipedia fetch failed for $Title : $_"
        return @{ summary = $null; thumbnail = $null }
    }
}

function Add-NodeIfMissing {
    param($nodes, $node)
    $existing = $nodes | Where-Object { $_.id -eq $node.id }
    if ($existing) {
        Write-Host "  SKIP node: $($node.id) (already exists)" -ForegroundColor Yellow
        return $false
    }
    $nodes.Add($node) | Out-Null
    Write-Host "  ADD node: $($node.id)" -ForegroundColor Green
    return $true
}

function Add-EdgeIfMissing {
    param($edges, $edge)
    $existing = $edges | Where-Object { $_.from -eq $edge.from -and $_.to -eq $edge.to -and $_.label -eq $edge.label }
    if ($existing) {
        Write-Host "  SKIP edge: $($edge.from) -> $($edge.to) ($($edge.label)) (already exists)" -ForegroundColor Yellow
        return $false
    }
    $edges.Add($edge) | Out-Null
    Write-Host "  ADD edge: $($edge.from) -> $($edge.to) ($($edge.label))" -ForegroundColor Green
    return $true
}

# ── Main ───────────────────────────────────────────────────────────────────────

Write-Host "=== SEGA Creator Enrichment ===" -ForegroundColor Cyan
Write-Host ""

# Load existing data
# Load existing data
$nodesJson = Get-Content -Raw $nodesPath | ConvertFrom-Json
$edgesJson = Get-Content -Raw $edgesPath | ConvertFrom-Json
$nodes = New-Object System.Collections.ArrayList
$edges = New-Object System.Collections.ArrayList
foreach ($n in $nodesJson) { $nodes.Add($n) | Out-Null }
foreach ($e in $edgesJson) { $edges.Add($e) | Out-Null }
Write-Host "Loaded: $($nodes.Count) nodes, $($edges.Count) edges"
Write-Host ""

$stats = @{ nodesAdded=0; edgesAdded=0; enriched=0; wikidataOnly=0; gamesAdded=0 }

# ── Step 1: Add new game nodes ────────────────────────────────────────────────
Write-Host "--- Adding new game nodes ---" -ForegroundColor Cyan
foreach ($game in $newGames) {
    $node = [ordered]@{
        id           = $game.id
        label        = $game.label
        group        = "game"
        summary      = ""
        releaseYear  = $game.releaseYear
        genre        = $game.genre
        wikipediaUrl = "https://en.wikipedia.org/wiki/$($game.wpTitle)"
        wikidataId   = $game.qid
    }

    if (-not $SkipWikipedia) {
        $wp = Get-WikipediaSummary -Title $game.wpTitle
        if ($wp.summary) { $node.summary = $wp.summary }
        if ($wp.thumbnail) { $node.thumbnail = $wp.thumbnail }
    }

    if (-not $node.summary) {
        $node.summary = "$($game.label) is a $($game.releaseYear) video game developed and published by Sega."
    }

    $nodeObj = [PSCustomObject]$node
    if (Add-NodeIfMissing $nodes $nodeObj) {
        $stats.nodesAdded++
        $stats.gamesAdded++

        # Add standard game edges: "developed by" sega, "runs on" appropriate platform
        Add-EdgeIfMissing $edges ([PSCustomObject]@{ from=$game.id; to="sega"; label="developed by" }) | Out-Null
        $stats.edgesAdded++
    }
}
Write-Host ""

# ── Step 2: Add new creator nodes ─────────────────────────────────────────────
Write-Host "--- Adding new creator nodes ---" -ForegroundColor Cyan
foreach ($creator in $creatorData) {
    $node = [ordered]@{
        id           = $creator.id
        label        = $creator.label
        group        = "creator"
        summary      = ""
        notableRoles = $creator.notableRoles
        roles        = $creator.roles
        gender       = $creator.gender
        wikipediaUrl = ""
        wikidataId   = $creator.qid
    }

    if ($creator.birthYear) {
        $node.birthYear = $creator.birthYear
    }

    if ($creator.hasWikipedia -and -not $SkipWikipedia) {
        $wp = Get-WikipediaSummary -Title $creator.wpTitle
        if ($wp.summary) {
            $node.summary = $wp.summary
            $stats.enriched++
        }
        if ($wp.thumbnail) { $node.thumbnail = $wp.thumbnail }
        $node.wikipediaUrl = "https://en.wikipedia.org/wiki/$($creator.wpTitle)"
    } elseif ($creator.hasWikipedia) {
        $node.wikipediaUrl = "https://en.wikipedia.org/wiki/$($creator.wpTitle)"
    }

    if (-not $creator.hasWikipedia) {
        $node.wikipediaUrl = "https://www.wikidata.org/wiki/$($creator.qid)"
        $node.summary = "$($creator.label) is a Japanese video game $($creator.roles[0]) who worked at Sega."
        $stats.wikidataOnly++
    } elseif (-not $node.summary) {
        $node.summary = "$($creator.label) is a Japanese video game $($creator.roles[0]) who worked at Sega."
    }

    $nodeObj = [PSCustomObject]$node
    if (Add-NodeIfMissing $nodes $nodeObj) {
        $stats.nodesAdded++
    }
}
Write-Host ""

# ── Step 3: Add credit edges ─────────────────────────────────────────────────
Write-Host "--- Adding credit edges ---" -ForegroundColor Cyan
foreach ($edge in $creditEdges) {
    $edgeObj = [PSCustomObject]$edge
    if (Add-EdgeIfMissing $edges $edgeObj) {
        $stats.edgesAdded++
    }
}
Write-Host ""

# ── Step 4: Add "worked at" edges ────────────────────────────────────────────
Write-Host "--- Adding 'worked at' edges ---" -ForegroundColor Cyan
foreach ($edge in $workedAtEdges) {
    $edgeObj = [PSCustomObject]$edge
    if (Add-EdgeIfMissing $edges $edgeObj) {
        $stats.edgesAdded++
    }
}
Write-Host ""

# ── Step 5: Write output ─────────────────────────────────────────────────────
if ($DryRun) {
    Write-Host "DRY RUN -- no files written" -ForegroundColor Yellow
} else {
    $nodes | ConvertTo-Json -Depth 10 | Set-Content $nodesPath -Encoding UTF8
    $edges | ConvertTo-Json -Depth 10 | Set-Content $edgesPath -Encoding UTF8
    Write-Host "Written: $($nodes.Count) nodes, $($edges.Count) edges" -ForegroundColor Green
}

# ── Summary report (FR-007, T009) ────────────────────────────────────────────
Write-Host ""
Write-Host "=== ENRICHMENT SUMMARY ===" -ForegroundColor Cyan
Write-Host "Creators added:      $($stats.nodesAdded - $stats.gamesAdded)"
Write-Host "Games added:         $($stats.gamesAdded)"
Write-Host "Edges added:         $($stats.edgesAdded)"
Write-Host "Wikipedia-enriched:  $($stats.enriched)"
Write-Host "Wikidata-only:       $($stats.wikidataOnly)"
Write-Host "Total nodes now:     $($nodes.Count)"
Write-Host "Total edges now:     $($edges.Count)"
Write-Host "=========================" -ForegroundColor Cyan
