#!/usr/bin/env python3
"""
Adds rationales (justifications) for score breakdowns to each event.
Each rationale explains WHY the checkboxes are marked as they are.
"""

import json
from pathlib import Path

ROOT = Path(__file__).parent.parent
DATA_DIR = ROOT / "data" / "events"

# Rationales for each event - explaining the scoring decisions
RATIONALES = {
    "destruction_of_carthage": {
        "systematic_intensity": "Rome's explicit policy of annihilation (Carthago delenda est). City systematically razed, population killed or enslaved, land salted.",
        "profit": "Seizure of Carthaginian wealth, slaves, and North African trade routes was a major Roman objective.",
        "ideology": "Framed as eliminating an existential rival, but primarily strategic rather than ethnic/religious purification.",
        "complicity": "Roman citizens celebrated the victory and benefited from plunder and expanded territory."
    },
    "mongol_conquests": {
        "systematic_intensity": "Organized military campaigns with deliberate terror tactics. Cities given choice: surrender or annihilation.",
        "profit": "Primary driver was tribute, trade route control, and wealth extraction from conquered peoples.",
        "ideology": "Mandate of Heaven concept, but conquest was pragmatic rather than ideologically purifying.",
        "complicity": "Mongol soldiers and administrators directly benefited; conquered peoples often collaborated to survive."
    },
    "spanish_americas": {
        "systematic_intensity": "Encomienda system, forced labor, religious conversion mandates, destruction of indigenous governance.",
        "profit": "Gold, silver, and labor extraction were explicit colonial objectives. Wealth flowed to Spain.",
        "ideology": "Catholic mission to 'save souls' combined with racial hierarchy justifying exploitation.",
        "complicity": "Spanish crown, church, and settlers all profited. Disease deaths often treated as providential."
    },
    "spanish_conquest_yucatan": {
        "systematic_intensity": "Systematic destruction of Maya texts, temples, and religious practices. Auto-da-fé of Maní burned 27+ codices.",
        "profit": "Encomienda labor system, tribute extraction, land seizure for Spanish settlers.",
        "ideology": "Franciscan mission to eradicate 'idolatry' - religious conversion as explicit goal.",
        "complicity": "Spanish crown sanctioned cultural destruction; settlers benefited from indigenous labor."
    },
    "transatlantic_slave_trade": {
        "systematic_intensity": "Centuries-long infrastructure: forts, ships, auctions, plantations, legal codes. State-chartered companies.",
        "profit": "Pure economic extraction. Entire colonial economies built on enslaved labor. Sugar, cotton, tobacco.",
        "ideology": "Racism developed to justify the system, but profit preceded and drove the ideology.",
        "complicity": "European consumers, investors, insurers all benefited. 'Triangle trade' enriched multiple continents."
    },
    "dzungar_genocide": {
        "systematic_intensity": "Qing Emperor Qianlong ordered complete elimination of Dzungar people. Military campaigns 1755-1758.",
        "profit": "Land seizure for Qing expansion and resettlement. Control of Central Asian trade routes.",
        "ideology": "Framed as eliminating a threat to Qing rule, but ethnic targeting was explicit.",
        "complicity": "Qing military and settlers benefited from depopulated lands. Still denied by China today."
    },
    "tasmania_black_war": {
        "systematic_intensity": "Colonial policy evolved from frontier violence to systematic removal. Black Line operation 1830.",
        "profit": "Primary driver was land for sheep farming and settlers. Indigenous people seen as obstacle.",
        "ideology": "Social Darwinism and 'dying race' narratives justified dispossession, not extermination ideology.",
        "complicity": "Settlers directly benefited from cleared land. Colonial government enabled violence through inaction."
    },
    "french_algeria": {
        "systematic_intensity": "132-year colonial occupation with military conquest, land seizure, and suppression of resistance.",
        "profit": "Settler colonialism: French settlers (pieds-noirs) took prime agricultural land.",
        "ideology": "Mission civilisatrice ideology, but primarily territorial expansion and settlement.",
        "complicity": "French state, military, and settlers all benefited. Algerian resistance brutally suppressed."
    },
    "native_american_genocide": {
        "systematic_intensity": "Indian Removal Act, reservation system, forced marches (Trail of Tears), boarding schools.",
        "profit": "Land seizure for settlers, gold rushes, railroad expansion. 'Manifest Destiny' as cover.",
        "ideology": "'Savage' vs 'civilized' narratives, but land acquisition was primary driver.",
        "complicity": "US government, settlers, and railroad companies all benefited. Treaties systematically broken."
    },
    "circassian_genocide": {
        "systematic_intensity": "Russian military campaigns, forced deportations, destruction of villages. 90% of population killed or expelled.",
        "profit": "Land seizure for Russian settlers and military bases in North Caucasus.",
        "ideology": "Christian Russia vs Muslim Circassians, but primarily strategic territorial control.",
        "complicity": "Russian settlers occupied depopulated lands. Ottoman Empire accepted refugees but didn't intervene."
    },
    "british_opium_trade": {
        "systematic_intensity": "State-backed East India Company trade, two Opium Wars to force market access.",
        "profit": "Pure profit motive: opium solved British trade deficit with China. Vast wealth extracted.",
        "ideology": "Free trade ideology used to justify drug trafficking. No ethnic targeting.",
        "complicity": "British government, merchants, and consumers benefited. Addiction framed as Chinese weakness."
    },
    "great_famine_ireland": {
        "systematic_intensity": "British policies continued food exports during famine. Poor Law system inadequate by design.",
        "profit": "Irish land remained profitable for absentee landlords. Food exported for profit during starvation.",
        "ideology": "Laissez-faire economics and anti-Irish prejudice, but not extermination ideology.",
        "complicity": "British government, landlords, and merchants prioritized profit over relief. Still debated today."
    },
    "taiping_rebellion": {
        "systematic_intensity": "Massive civil war with religious ideology. Qing counter-insurgency equally brutal.",
        "profit": "Not primarily profit-driven; resource competition was consequence not cause.",
        "ideology": "Hong Xiuquan's syncretic Christianity drove Taiping movement. Qing fought for dynastic survival.",
        "complicity": "Foreign powers eventually aided Qing. Chinese society deeply traumatized. Suppressed in PRC history."
    },
    "british_india_famines": {
        "systematic_intensity": "Colonial policies prioritized export over food security. Railways moved grain out during famines.",
        "profit": "Cash crop exports continued during famines. Colonial economy extracted wealth systematically.",
        "ideology": "Malthusian and racial theories blamed Indian 'overpopulation' rather than policy.",
        "complicity": "British government, merchants, and consumers benefited. Famine relief deliberately limited."
    },
    "congo_free_state": {
        "systematic_intensity": "Leopold II's personal colony. Force Publique enforced rubber quotas with mutilation and hostage-taking.",
        "profit": "Pure extraction: rubber, ivory. Leopold became one of world's richest men. Quintessential profit atrocity.",
        "ideology": "Framed as 'civilizing mission' but no ethnic purification goal. Pure exploitation.",
        "complicity": "European consumers bought rubber products. Other powers looked away. Leopold's propaganda effective."
    },
    "herero_nama_genocide": {
        "systematic_intensity": "Extermination order by von Trotha. Concentration camps, forced labor, medical experiments.",
        "profit": "Land and cattle seizure for German settlers. Diamond mining interests.",
        "ideology": "Racial ideology and colonial domination. First genocide of 20th century.",
        "complicity": "German settlers occupied seized lands. Government protected perpetrators. Germany acknowledged 2021."
    },
    "armenian_genocide": {
        "systematic_intensity": "Systematic deportations, death marches, concentration camps. CUP planning documented.",
        "profit": "Seizure of Armenian property and businesses. Economic elimination alongside physical.",
        "ideology": "Turkish nationalism and pan-Turanism. Armenians seen as internal enemy during WWI.",
        "complicity": "Ottoman officials, Kurdish irregulars, and neighbors participated. Turkey still denies."
    },
    "greek_genocide": {
        "systematic_intensity": "Pontic Greeks targeted alongside Armenians. Deportations, labor battalions, massacres.",
        "profit": "Property seizure, economic Turkification of Anatolia.",
        "ideology": "Same Turkish nationalist project as Armenian Genocide. 'Turkey for Turks.'",
        "complicity": "Local collaborators benefited from seized property. Greece absorbed survivors. Turkey denies."
    },
    "assyrian_genocide": {
        "systematic_intensity": "Simultaneous with Armenian and Greek genocides. Same methods: massacres, deportations, starvation.",
        "profit": "Land and property seizure in ancestral Assyrian territories.",
        "ideology": "Christian minorities targeted in Ottoman Muslim nationalist project.",
        "complicity": "Kurdish tribes participated in massacres. Least recognized of the three genocides."
    },
    "holodomor": {
        "systematic_intensity": "Grain requisitions, internal passports preventing escape, blacklisted villages. Deliberate policy.",
        "profit": "Grain exports continued during famine. Industrialization funded by extracted agricultural surplus.",
        "ideology": "Class warfare against 'kulaks' combined with suppression of Ukrainian nationalism.",
        "complicity": "Soviet officials enforced quotas. Western intellectuals denied famine. Russia still denies genocide."
    },
    "italian_ethiopia": {
        "systematic_intensity": "Mustard gas, concentration camps, mass executions. Colonial occupation with brutal suppression.",
        "profit": "Colonial prestige and resources. Mussolini's imperial ambitions.",
        "ideology": "Fascist racism, 'civilizing' rhetoric, revenge for Adwa defeat.",
        "complicity": "Italian military and settlers participated. League of Nations sanctions ineffective. Italy downplays today."
    },
    "soviet_great_purge": {
        "systematic_intensity": "NKVD quotas, show trials, Gulag system. Paranoid targeting of perceived enemies.",
        "profit": "Gulag labor economically significant but not primary driver.",
        "ideology": "Stalinist paranoia and elimination of perceived counter-revolutionaries. Political, not ethnic.",
        "complicity": "Party members denounced colleagues. Society paralyzed by fear. Archives opened post-USSR."
    },
    "nanking_massacre": {
        "systematic_intensity": "Six weeks of uncontrolled violence. Mass rape, murder, arson. Command breakdown.",
        "profit": "Looting occurred but not primary driver. War atrocity not economic system.",
        "ideology": "Japanese militarism and racism toward Chinese, but massacre was chaotic not planned.",
        "complicity": "Japanese military command failed to stop violence. International witnesses documented. Japan disputes numbers."
    },
    "the_holocaust": {
        "systematic_intensity": "Nuremberg Laws, ghettos, Einsatzgruppen, death camps. Maximum bureaucratic organization of murder.",
        "profit": "Seized Jewish assets, forced labor, but extermination prioritized over exploitation.",
        "ideology": "Racial antisemitism as core Nazi ideology. Jews as existential threat requiring elimination.",
        "complicity": "German society benefited from seized property. Collaborators across Europe. Most documented genocide."
    },
    "soviet_deportations": {
        "systematic_intensity": "NKVD operations deported entire ethnic groups: Chechens, Crimean Tatars, Volga Germans, others.",
        "profit": "Land seizure, but primarily punitive and security-driven.",
        "ideology": "Collective punishment for alleged collaboration. Ethnic targeting for political reasons.",
        "complicity": "Soviet officials and settlers benefited from vacated lands. Survivors rehabilitated post-Stalin."
    },
    "bengal_famine_1943": {
        "systematic_intensity": "British war policies: rice denial, boat denial, inflation. Churchill's priorities.",
        "profit": "War economy prioritized over Bengali lives. Resources directed to military.",
        "ideology": "Racial attitudes toward Indians, but primarily wartime indifference not targeting.",
        "complicity": "British government, military, and hoarders contributed. Debate continues on intentionality."
    },
    "partition_of_india": {
        "systematic_intensity": "Hasty British withdrawal, communal violence, forced migrations. State collapse.",
        "profit": "Not profit-driven. Chaotic violence over religious identity and territory.",
        "ideology": "Hindu-Muslim communalism exploited by politicians. Two-nation theory.",
        "complicity": "British rushed partition. Political leaders inflamed tensions. Communities turned on neighbors."
    },
    "great_leap_forward": {
        "systematic_intensity": "Central planning, impossible quotas, suppressed information. Mao's policies killed millions.",
        "profit": "Industrialization goals, but famine was unintended consequence of ideology.",
        "ideology": "Communist utopianism and Mao's personal hubris. Ideology over reality.",
        "complicity": "Local officials falsified reports. Critics purged. CCP still limits discussion."
    },
    "indonesian_killings": {
        "systematic_intensity": "Army-organized, civilian militias, death lists. Six months of systematic killings.",
        "profit": "Land seizure from PKI members. Western economic interests in anti-communist Indonesia.",
        "ideology": "Anti-communism with religious and ethnic dimensions. Cold War context.",
        "complicity": "US and UK provided support. Indonesian society participated. Long suppressed in Indonesia."
    },
    "cultural_revolution": {
        "systematic_intensity": "Red Guards, struggle sessions, forced relocations. Mao's political campaign.",
        "profit": "Not profit-driven. Political purge disguised as class struggle.",
        "ideology": "Maoist ideology against 'capitalist roaders' and traditional culture.",
        "complicity": "Youth mobilized as Red Guards. Society turned on itself. Limited acknowledgment in China."
    },
    "biafra_famine": {
        "systematic_intensity": "Nigerian blockade, deliberate starvation strategy. International relief obstructed.",
        "profit": "Oil resources in Biafra region. Economic interests in keeping Nigeria unified.",
        "ideology": "Ethnic tensions (Igbo secession) but primarily political and economic.",
        "complicity": "Nigeria, Britain, Soviet Union supported blockade. International community slow to respond."
    },
    "bangladesh_genocide": {
        "systematic_intensity": "Operation Searchlight targeted Bengali intellectuals, Hindus. Pakistani military systematic.",
        "profit": "Not primarily profit-driven. Political control and punishment.",
        "ideology": "Pakistani nationalism vs Bengali self-determination. Religious and ethnic dimensions.",
        "complicity": "Pakistani military, local collaborators (Razakars). US supported Pakistan. Pakistan denies."
    },
    "cambodia_khmer_rouge": {
        "systematic_intensity": "Evacuation of cities, execution of educated, forced collectivization. Total social engineering.",
        "profit": "Agrarian utopia ideology, not profit extraction.",
        "ideology": "Extreme Maoist utopianism. Year Zero, erasure of all prior society.",
        "complicity": "Khmer Rouge cadres enforced policies. Neighbors reported neighbors. International community slow to act."
    },
    "east_timor_genocide": {
        "systematic_intensity": "Indonesian military occupation, forced displacement, famine policies, sterilization.",
        "profit": "Oil and gas resources in Timor Sea. Strategic location.",
        "ideology": "Anti-communist rationale (Fretilin), but primarily territorial annexation.",
        "complicity": "US, Australia, UK armed Indonesia. International community ignored until 1999."
    },
    "dirty_war_argentina": {
        "systematic_intensity": "State terrorism: disappearances, torture centers, death flights. Systematic targeting.",
        "profit": "Not primarily profit-driven. Political repression of leftists.",
        "ideology": "Anti-communist Cold War ideology. National Security Doctrine.",
        "complicity": "Military junta, police, some civilians collaborated. US supported. Trials held post-junta."
    },
    "guatemalan_genocide": {
        "systematic_intensity": "Scorched earth campaigns, model villages, massacres. Maya specifically targeted.",
        "profit": "Land interests, but primarily counter-insurgency.",
        "ideology": "Anti-communism combined with racism against Maya. Cold War context.",
        "complicity": "US trained and supported military. Ladino elites benefited. Truth commission 1999."
    },
    "anfal_genocide": {
        "systematic_intensity": "Chemical weapons (Halabja), forced relocations, mass executions. Saddam's campaigns.",
        "profit": "Oil-rich Kurdish regions, but primarily political control.",
        "ideology": "Arab nationalism vs Kurdish autonomy. Ethnic targeting explicit.",
        "complicity": "Iraqi military and Ba'ath party. West ignored during Iran-Iraq War. Saddam tried 2006."
    },
    "bosnian_genocide": {
        "systematic_intensity": "Ethnic cleansing, concentration camps, Srebrenica massacre. Systematic targeting.",
        "profit": "Land and property seizure for ethnic homogeneity.",
        "ideology": "Serbian nationalism, Greater Serbia project. Ethnic purification.",
        "complicity": "Serbian military, paramilitaries, some civilians. UN failed to protect. ICTY prosecutions."
    },
    "rwandan_genocide": {
        "systematic_intensity": "100 days, radio coordination, roadblocks, neighbor killing neighbor. Extremely organized.",
        "profit": "Land redistribution to Hutu, but ideology primary driver.",
        "ideology": "Hutu Power, decades of ethnic propaganda. Tutsi as 'cockroaches.'",
        "complicity": "Hutu civilians participated en masse. France supported regime. UN withdrew. ICTR prosecutions."
    },
    "second_congo_war": {
        "systematic_intensity": "Multiple state and militia actors. Systematic resource extraction through violence.",
        "profit": "Coltan, diamonds, gold, timber. Corporations and neighboring states extracted resources.",
        "ideology": "Ethnic tensions exploited, but profit drove the war. 'Africa's World War.'",
        "complicity": "Rwanda, Uganda, multinational corporations, consumers of electronics. Ongoing instability."
    },
    "darfur_genocide": {
        "systematic_intensity": "Janjaweed militias, aerial bombing, forced displacement. Government-coordinated.",
        "profit": "Land and resources, but primarily counter-insurgency.",
        "ideology": "Arab supremacism against African groups. Racial dimensions.",
        "complicity": "Sudanese government, China blocked UN action. ICC indicted Bashir. Sudan denies."
    },
    "yazidi_genocide": {
        "systematic_intensity": "ISIS systematic: mass executions of men, sexual slavery of women, forced conversion.",
        "profit": "Slave trade, property seizure, but ideology primary.",
        "ideology": "Extreme jihadism. Yazidis as 'devil worshippers' requiring elimination.",
        "complicity": "Local Sunni Arabs sometimes collaborated. International coalition slow to respond."
    },
    "rohingya_genocide": {
        "systematic_intensity": "Military operations, village burning, mass rape, forced displacement. Coordinated campaigns.",
        "profit": "Land seizure in Rakhine State for development projects.",
        "ideology": "Buddhist nationalism, Rohingya as 'Bengali invaders.' Ethnic cleansing.",
        "complicity": "Myanmar military (Tatmadaw), some civilian support. International community slow to act."
    },
    "uyghur_persecution": {
        "systematic_intensity": "Mass detention camps, surveillance, forced labor, birth suppression. Unprecedented scale.",
        "profit": "Forced labor in supply chains. Economic development of Xinjiang.",
        "ideology": "Han nationalism, 'counter-terrorism' pretext. Cultural elimination.",
        "complicity": "CCP, local officials, corporations using forced labor. International response limited."
    },
    "tigray_war": {
        "systematic_intensity": "Ethiopian and Eritrean military operations, siege, humanitarian blockade, mass atrocities.",
        "profit": "Political control, but not primarily profit-driven.",
        "ideology": "Ethnic federalism vs centralization. TPLF as threat to Ethiopian unity.",
        "complicity": "Ethiopian government, Eritrea, Amhara militias. International community slow to respond."
    }
}


def add_rationales():
    """Add rationales to all event files."""
    for filepath in sorted(DATA_DIR.glob("*.json")):
        if "template" in filepath.name:
            continue

        with open(filepath, encoding="utf-8") as f:
            event = json.load(f)

        event_id = event.get("id", "").split("_")[:-1]  # Remove year suffix
        event_key = "_".join(event_id) if event_id else filepath.stem

        # Try different key formats
        rationale = RATIONALES.get(event_key)
        if not rationale:
            rationale = RATIONALES.get(filepath.stem)
        if not rationale:
            # Try without year suffix
            for key in RATIONALES:
                if filepath.stem.startswith(key):
                    rationale = RATIONALES[key]
                    break

        if rationale:
            event["metrics"]["rationales"] = rationale
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(event, f, indent=2, ensure_ascii=False)
                f.write("\n")
            print(f"Added rationales to {filepath.name}")
        else:
            print(f"No rationale found for {filepath.name} (key: {event_key})")


if __name__ == "__main__":
    add_rationales()
    print("Done!")
