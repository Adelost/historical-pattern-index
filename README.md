# Historical Pattern Index

The deadliest conflict since World War II killed 5.4 million people.

It's not Iraq. Not Syria. Not Afghanistan.

It's the Second Congo War (1998-2003). Most people have never heard of it.

Why? Because it was driven by profit (coltan, diamonds, gold), not ideology. And we don't have good frameworks for seeing profit-driven mass death. We notice genocides. We overlook "market forces."

This project attempts to fix that.

---

## The Data

27 events. 2,154 years of history. 150+ million documented deaths.

| Event | Period | Deaths | Denied? |
|-------|--------|--------|---------|
| Mongol Conquests | 1206-1368 | 30-40M | No |
| Spanish Americas | 1492-1600 | 50-56M | Partial |
| Transatlantic Slave Trade | 1501-1867 | 1.8-2.5M | No |
| Taiping Rebellion | 1850-1864 | 20-30M | Suppressed |
| British India Famines | 1876-1902 | 12-29M | Disputed |
| Congo Free State | 1885-1908 | 8-13M | No |
| Armenian Genocide | 1915-1923 | 1-1.5M | **Denied** |
| Holodomor | 1932-1933 | 3.5-7.5M | **Denied** |
| The Holocaust | 1941-1945 | 5.7-6M | No |
| Great Leap Forward | 1958-1962 | 15-55M | Suppressed |
| Bangladesh Genocide | 1971 | 300k-3M | **Denied** |
| Cambodian Genocide | 1975-1979 | 1.5-2M | No |
| Rwandan Genocide | 1994 | 500k-1M | No |
| Second Congo War | 1998-2003 | 3-5.4M | Partial |
| Darfur | 2003-2008 | 200-400k | **Denied** |

Full dataset: [`/data/events/`](data/events/)

---

## What We Found

**1. Profit kills as much as ideology.**

The highest death tolls come from profit-driven systems (slave trade, colonial extraction, resource wars), not just ideological genocides. Congo Free State killed 8-13 million for rubber. The Atlantic slave trade's death toll doesn't even count plantation deaths.

**2. Five events are still officially denied.**

| Event | Denier | Deaths |
|-------|--------|--------|
| Armenian Genocide | Turkey | 1-1.5M |
| Holodomor | Russia | 3.5-7.5M |
| Dzungar Genocide | China | 480-600k |
| Bangladesh 1971 | Pakistan | 300k-3M |
| Darfur | Sudan | 200-400k |

**3. Speed doesn't require bureaucracy.**

Rwanda killed 70% of its Tutsi population in 100 days with machetes and radio coordination. The Holocaust took 4 years with industrial infrastructure. Ideology can mobilize faster than bureaucracy.

**4. The forgotten middle.**

Events between 1206 (Mongols) and 1492 (Columbus) are poorly documented. Medieval atrocities are underrepresented. So are inter-African and intra-Asian conflicts before European contact.

---

## How It Works

Each event gets four scores (0-100%) based on binary checklists:

| Score | What it measures | Example high-scorer |
|-------|------------------|---------------------|
| **Systematic Intensity** | Organization, infrastructure, state involvement | Holocaust (90%) |
| **Profit** | Economic extraction as primary driver | Congo Free State (100%) |
| **Ideology** | Ethnic/religious "purification" as goal | Rwanda (100%) |
| **Complicity** | How society enabled it | Second Congo War (100%) |

Each score is calculated from a checklist of 5-10 binary questions. No subjective weighting. If 8 of 10 boxes are checked, the score is 80%.

Full methodology: [METHODOLOGY.md](METHODOLOGY.md)

---

## Limitations

This is a work in progress, not a finished truth.

- **Sample size**: 27 events is better than 4, but still small
- **Source bias**: English-language academic sources overrepresented
- **Equal weighting**: All checklist items count equally (debatable)
- **Death toll uncertainty**: Many estimates span 2-10x ranges
- **"Genocide" definition**: Some events (famines, resource wars) don't fit legal definitions but killed millions

We're not claiming this is the final word. We're claiming it's better than ignoring the pattern.

---

## Contributing

Add events via pull request. Requirements:

1. Academic sources (not Wikipedia)
2. Death toll ranges (min/max), not single numbers
3. Complete checklist breakdowns
4. No editorializing in `pattern_note`

Template: [`/data/events/_template.json`](data/events/_template.json)

---

## License

- **Code**: MIT
- **Data**: CC-BY-4.0 (cite this project)
