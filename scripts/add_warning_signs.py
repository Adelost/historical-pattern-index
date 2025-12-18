#!/usr/bin/env python3
"""
Adds warning_signs and root_causes to each event.
These help identify patterns that could repeat.
"""

import json
from pathlib import Path

ROOT = Path(__file__).parent.parent
DATA_DIR = ROOT / "data" / "events"

# Warning signs and root causes for each event
CAUSES = {
    "destruction_of_carthage": {
        "warning_signs": [
            "Rival framed as existential threat",
            "Dehumanizing rhetoric ('Carthago delenda est')",
            "Total war ideology"
        ],
        "root_causes": "Imperial rivalry, fear of resurgent competitor, desire for Mediterranean dominance"
    },
    "mongol_conquests": {
        "warning_signs": [
            "Expanding military power unchecked",
            "Resistance met with disproportionate violence",
            "Terror as deliberate strategy"
        ],
        "root_causes": "Centralized military power, weak/fragmented opposition, conquest culture"
    },
    "spanish_americas": {
        "warning_signs": [
            "Indigenous peoples deemed 'uncivilized'",
            "Religious justification for conquest",
            "Wealth extraction as primary goal"
        ],
        "root_causes": "Colonial expansion, gold/silver fever, religious mission ideology, technological superiority"
    },
    "spanish_conquest_yucatan": {
        "warning_signs": [
            "Foreign religion declared only truth",
            "Indigenous knowledge labeled 'devil worship'",
            "Book burning and cultural destruction"
        ],
        "root_causes": "Religious fanaticism, colonial extraction, erasure of competing worldviews"
    },
    "transatlantic_slave_trade": {
        "warning_signs": [
            "Economic system dependent on dehumanization",
            "Legal frameworks normalizing bondage",
            "Racial theories justifying exploitation"
        ],
        "root_causes": "Labor demand in colonies, profit motive, development of racial capitalism"
    },
    "dzungar_genocide": {
        "warning_signs": [
            "Ethnic group labeled security threat",
            "Calls for complete elimination",
            "Land targeted for resettlement"
        ],
        "root_causes": "Imperial expansion, fear of nomadic military power, desire for territory"
    },
    "tasmania_black_war": {
        "warning_signs": [
            "Settlers viewing indigenous as obstacles",
            "Frontier violence normalized",
            "'Dying race' narratives"
        ],
        "root_causes": "Settler colonialism, land hunger for sheep farming, dehumanization"
    },
    "french_algeria": {
        "warning_signs": [
            "Colonial 'civilizing mission' rhetoric",
            "Settler land seizures",
            "Brutal suppression of resistance"
        ],
        "root_causes": "Imperial expansion, settler colonialism, strategic Mediterranean control"
    },
    "native_american_genocide": {
        "warning_signs": [
            "'Manifest Destiny' expansionism",
            "Treaties made to be broken",
            "Indigenous portrayed as 'savages'"
        ],
        "root_causes": "Land hunger, gold discoveries, railroad expansion, settler colonialism"
    },
    "circassian_genocide": {
        "warning_signs": [
            "Ethnic cleansing for 'security'",
            "Forced deportations",
            "Land cleared for settlers"
        ],
        "root_causes": "Russian imperial expansion, strategic Black Sea control, religious difference"
    },
    "british_opium_trade": {
        "warning_signs": [
            "Corporate profits over human welfare",
            "Military force to open markets",
            "'Free trade' masking exploitation"
        ],
        "root_causes": "Trade deficit, corporate greed (East India Company), imperial arrogance"
    },
    "great_famine_ireland": {
        "warning_signs": [
            "Food exports during starvation",
            "Ideology (laissez-faire) over lives",
            "Blaming victims for their poverty"
        ],
        "root_causes": "Colonial extraction, absentee landlordism, ideological rigidity, anti-Irish prejudice"
    },
    "taiping_rebellion": {
        "warning_signs": [
            "Messianic leader with absolute following",
            "Apocalyptic religious ideology",
            "Weak central government"
        ],
        "root_causes": "Qing dynasty decline, economic hardship, foreign incursions, millenarian movement"
    },
    "british_india_famines": {
        "warning_signs": [
            "Cash crops prioritized over food",
            "Colonial policies ignore local needs",
            "Famine relief seen as 'moral hazard'"
        ],
        "root_causes": "Colonial extraction, export-oriented agriculture, racist indifference, economic ideology"
    },
    "congo_free_state": {
        "warning_signs": [
            "Corporate/personal rule without oversight",
            "Quotas enforced through violence",
            "'Humanitarian' cover for extraction"
        ],
        "root_causes": "Personal greed (Leopold II), rubber demand, lack of international accountability"
    },
    "herero_nama_genocide": {
        "warning_signs": [
            "Settler land seizures",
            "Racial ideology of superiority",
            "Military given extermination orders"
        ],
        "root_causes": "Settler colonialism, land hunger, racial ideology, colonial military culture"
    },
    "armenian_genocide": {
        "warning_signs": [
            "Minority blamed for military defeats",
            "Nationalism excluding minorities",
            "Wartime 'security' justifications"
        ],
        "root_causes": "Ottoman collapse, Turkish nationalism, WWI chaos, history of pogroms"
    },
    "greek_genocide": {
        "warning_signs": [
            "Ethnic homogenization ideology",
            "'Turkey for Turks' rhetoric",
            "Deportations and labor battalions"
        ],
        "root_causes": "Turkish nationalism, WWI context, goal of ethnically homogeneous state"
    },
    "assyrian_genocide": {
        "warning_signs": [
            "Christians targeted as 'foreign element'",
            "Coordinated with other ethnic cleansing",
            "Wartime cover for atrocities"
        ],
        "root_causes": "Ottoman collapse, religious nationalism, WWI opportunity"
    },
    "holodomor": {
        "warning_signs": [
            "Grain quotas despite crop failure",
            "Borders closed to prevent escape",
            "Denial of famine existence"
        ],
        "root_causes": "Stalinist collectivization, suppression of Ukrainian nationalism, ideological rigidity"
    },
    "italian_ethiopia": {
        "warning_signs": [
            "Fascist imperial ambitions",
            "Revenge narrative for past defeat",
            "Racist 'civilizing' rhetoric"
        ],
        "root_causes": "Fascist ideology, desire for empire, revenge for Adwa, international weakness"
    },
    "soviet_great_purge": {
        "warning_signs": [
            "Paranoid leader with absolute power",
            "Quotas for arrests and executions",
            "Enemies everywhere mentality"
        ],
        "root_causes": "Stalinist paranoia, consolidation of power, totalitarian system"
    },
    "nanking_massacre": {
        "warning_signs": [
            "Military culture of brutality",
            "Dehumanization of enemy civilians",
            "Command structure breakdown"
        ],
        "root_causes": "Japanese militarism, racism toward Chinese, lack of command accountability"
    },
    "the_holocaust": {
        "warning_signs": [
            "Scapegoating minorities for national problems",
            "Dehumanizing propaganda ('vermin', 'parasites')",
            "Legal exclusion escalating to violence",
            "Economic crisis blamed on outgroup"
        ],
        "root_causes": "Antisemitism, Nazi racial ideology, WWI humiliation, Great Depression, weak Weimar institutions"
    },
    "soviet_deportations": {
        "warning_signs": [
            "Entire ethnic groups labeled 'traitors'",
            "Collective punishment",
            "Wartime 'security' justification"
        ],
        "root_causes": "Stalinist paranoia, WWII pressures, ethnic scapegoating"
    },
    "bengal_famine_1943": {
        "warning_signs": [
            "War priorities over civilian welfare",
            "Colonial indifference to 'natives'",
            "Denial of crisis severity"
        ],
        "root_causes": "WWII resource diversion, colonial racism, policy failures, Japanese threat"
    },
    "partition_of_india": {
        "warning_signs": [
            "Communal violence escalating",
            "Political leaders inflaming tensions",
            "Hasty colonial withdrawal"
        ],
        "root_causes": "British divide-and-rule legacy, communalism, rushed partition, weak transitional authority"
    },
    "great_leap_forward": {
        "warning_signs": [
            "Impossible targets from ideological leadership",
            "Local officials afraid to report truth",
            "Ideology overriding reality"
        ],
        "root_causes": "Maoist utopianism, centralized control, fear of dissent, statistical fraud"
    },
    "indonesian_killings": {
        "warning_signs": [
            "Communists labeled existential threat",
            "Death lists prepared in advance",
            "Military coordinating civilian militias"
        ],
        "root_causes": "Cold War anti-communism, military power grab, foreign encouragement, religious tensions"
    },
    "cultural_revolution": {
        "warning_signs": [
            "Youth mobilized against 'enemies'",
            "Intellectuals and elders targeted",
            "Denunciations rewarded"
        ],
        "root_causes": "Mao's power consolidation, ideological fanaticism, generational mobilization"
    },
    "biafra_famine": {
        "warning_signs": [
            "Blockade of civilian population",
            "Starvation as military strategy",
            "International community passive"
        ],
        "root_causes": "Ethnic tensions, oil resources, Nigerian unity prioritized over lives"
    },
    "bangladesh_genocide": {
        "warning_signs": [
            "Military crackdown on political movement",
            "Intellectuals and minorities targeted",
            "Rape as systematic weapon"
        ],
        "root_causes": "Bengali nationalism, Pakistani military dominance, ethnic and linguistic tensions"
    },
    "cambodia_khmer_rouge": {
        "warning_signs": [
            "Radical ideology rejecting all modernity",
            "Evacuation of cities",
            "Educated and urban people targeted"
        ],
        "root_causes": "Extreme Maoist ideology, US bombing destabilization, radical utopianism"
    },
    "east_timor_genocide": {
        "warning_signs": [
            "Military occupation after decolonization",
            "Independence movement crushed",
            "International powers looking away"
        ],
        "root_causes": "Indonesian expansionism, Cold War anti-communism, oil interests, international complicity"
    },
    "dirty_war_argentina": {
        "warning_signs": [
            "Military coup against elected government",
            "Leftists labeled 'subversives'",
            "Disappearances and secret detention"
        ],
        "root_causes": "Cold War ideology, military authoritarianism, US support for anti-communist regimes"
    },
    "guatemalan_genocide": {
        "warning_signs": [
            "Indigenous linked to insurgency",
            "Scorched earth military doctrine",
            "US-backed military government"
        ],
        "root_causes": "Cold War counter-insurgency, racism against Maya, land inequality, US intervention"
    },
    "anfal_genocide": {
        "warning_signs": [
            "Ethnic autonomy movements crushed",
            "Chemical weapons used on civilians",
            "Villages systematically destroyed"
        ],
        "root_causes": "Kurdish autonomy threat, Ba'athist Arab nationalism, Iran-Iraq War context"
    },
    "bosnian_genocide": {
        "warning_signs": [
            "Nationalist rhetoric of ethnic purity",
            "Historical grievances weaponized",
            "Ethnic cleansing for 'Greater Serbia'"
        ],
        "root_causes": "Yugoslav collapse, Serbian nationalism, historical tensions, weak international response"
    },
    "rwandan_genocide": {
        "warning_signs": [
            "Radio inciting violence against minority",
            "Tutsi called 'cockroaches' (inyenzi)",
            "Militia training and weapon distribution",
            "Previous massacres unpunished"
        ],
        "root_causes": "Colonial ethnic categories, Hutu Power ideology, political assassination trigger, international abandonment"
    },
    "second_congo_war": {
        "warning_signs": [
            "Multiple armed groups competing for resources",
            "Minerals funding warfare",
            "Civilian population as target"
        ],
        "root_causes": "Post-Mobutu vacuum, Rwandan genocide spillover, mineral wealth, weak state"
    },
    "darfur_genocide": {
        "warning_signs": [
            "Government arming ethnic militias",
            "Aerial bombing of villages",
            "Forced displacement campaigns"
        ],
        "root_causes": "Arab supremacism, competition for land/water, counter-insurgency, government complicity"
    },
    "yazidi_genocide": {
        "warning_signs": [
            "Religious minority labeled 'devil worshippers'",
            "Extremist ideology spreading",
            "Sexual slavery systematized"
        ],
        "root_causes": "ISIS jihadism, religious intolerance, state collapse in Iraq/Syria"
    },
    "rohingya_genocide": {
        "warning_signs": [
            "Citizenship stripped from minority",
            "Buddhist nationalist monks inciting",
            "Social media spreading hate"
        ],
        "root_causes": "Buddhist nationalism, military power, historical discrimination, Islamophobia"
    },
    "uyghur_persecution": {
        "warning_signs": [
            "Mass surveillance infrastructure",
            "'Re-education' camps for minority",
            "'Counter-terrorism' justifying repression",
            "Cultural and religious practices banned"
        ],
        "root_causes": "Han nationalism, Xinjiang development goals, security state expansion, Islamophobia"
    },
    "tigray_war": {
        "warning_signs": [
            "Political party excluded from power",
            "Communications and aid blocked",
            "Ethnic militias mobilized"
        ],
        "root_causes": "TPLF-federal government conflict, ethnic federalism tensions, Eritrean involvement"
    }
}


def add_causes():
    """Add warning_signs and root_causes to all event files."""
    for filepath in sorted(DATA_DIR.glob("*.json")):
        if "template" in filepath.name:
            continue

        with open(filepath, encoding="utf-8") as f:
            event = json.load(f)

        # Try to match the file to our causes dict
        causes = CAUSES.get(filepath.stem)

        if causes:
            event["analysis"]["warning_signs"] = causes["warning_signs"]
            event["analysis"]["root_causes"] = causes["root_causes"]

            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(event, f, indent=2, ensure_ascii=False)
                f.write("\n")
            print(f"Added causes to {filepath.name}")
        else:
            print(f"No causes found for {filepath.name}")


if __name__ == "__main__":
    add_causes()
    print("Done!")
