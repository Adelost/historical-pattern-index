#!/usr/bin/env python3
"""Add description field to all event files."""

import json
import os

DESCRIPTIONS = {
    "an_lushan_rebellion": "A devastating civil war in Tang Dynasty China sparked by general An Lushan's rebellion against Emperor Xuanzong. The eight-year conflict destroyed the empire's heartland, caused massive population displacement, and left the Tang Dynasty permanently weakened. Census records suggest one of history's largest population losses.",

    "anfal_genocide": "Saddam Hussein's systematic campaign against Iraqi Kurds, using chemical weapons, mass executions, and forced displacement. The operation destroyed thousands of villages and killed up to 182,000 civilians. The 1988 Halabja chemical attack became an enduring symbol of the genocide.",

    "armenian_genocide": "The Ottoman Empire's systematic extermination of 1.5 million Armenians during World War I. Deportation marches into the Syrian desert, mass shootings, and deliberate starvation were used to destroy the Armenian population of Anatolia. Turkey continues to deny it was genocide.",

    "assyrian_genocide": "The Ottoman Empire's massacres of Assyrian Christians during World War I, concurrent with the Armenian Genocide. Assyrians faced mass killings, forced marches, and destruction of their ancient communities in southeastern Anatolia and northwestern Iran.",

    "banda_islands_massacre": "The Dutch East India Company's extermination of the Bandanese people to monopolize the nutmeg trade. VOC forces killed or enslaved nearly the entire population of approximately 15,000 people, replacing them with Dutch planters and imported slaves.",

    "bangladesh_genocide": "The Pakistan Army's brutal crackdown on Bengali nationalists following Bangladesh's declaration of independence. Operation Searchlight targeted intellectuals, Hindus, and independence supporters, killing hundreds of thousands and causing ten million refugees to flee to India.",

    "bengal_famine_1943": "A catastrophic famine in British-ruled Bengal caused by wartime policies, including rice exports and denial of food imports. Winston Churchill's War Cabinet prioritized military needs over famine relief. Three million Bengalis died while food stocks existed elsewhere in the empire.",

    "biafra_famine": "The deliberate starvation of the Igbo people during Nigeria's civil war against the secessionist Republic of Biafra. The Nigerian government blockaded food and medicine, causing mass starvation that killed up to two million people, mostly children.",

    "bosnian_genocide": "Serbian forces' systematic ethnic cleansing of Bosniaks during the Yugoslav Wars. The siege of Sarajevo, concentration camps, mass rape, and the Srebrenica massacre—where 8,000 Muslim men and boys were executed—marked Europe's worst atrocities since World War II.",

    "british_india_famines": "A series of devastating famines under British colonial rule in India, caused by exploitative economic policies, forced crop exports, and inadequate relief. The famines of 1876-78, 1896-97, and others killed tens of millions while India exported grain to Britain.",

    "british_opium_trade": "Britain's forced export of opium to China, causing widespread addiction and social devastation. When China tried to ban the trade, Britain launched the Opium Wars (1839-42, 1856-60) to force continued imports, eventually seizing Hong Kong and extracting massive reparations.",

    "cambodia_khmer_rouge": "The Khmer Rouge's radical attempt to create an agrarian utopia by evacuating cities, abolishing money, and eliminating 'enemies.' Intellectuals, ethnic minorities, and suspected dissidents were executed at killing fields. Nearly a quarter of Cambodia's population perished in four years.",

    "circassian_genocide": "Russia's ethnic cleansing of Circassians from the Caucasus during and after the Russian-Circassian War. Between 1-1.5 million Circassians were killed or expelled, with survivors forced to resettle in the Ottoman Empire. The destruction was nearly total.",

    "congo_free_state": "King Leopold II's personal colony in Congo, run as a forced labor camp to extract rubber. Workers who failed to meet quotas had their hands cut off. Systematic brutality, hostage-taking, and punitive expeditions killed approximately ten million Congolese.",

    "cultural_revolution": "Mao Zedong's decade-long campaign to purge 'counter-revolutionary' elements from Chinese society. Red Guards terrorized 'class enemies,' destroyed cultural artifacts, and sent millions to labor camps. The chaos caused economic collapse and between 1-2 million deaths.",

    "darfur_genocide": "The Sudanese government's campaign against non-Arab ethnic groups in Darfur, using Janjaweed militias for systematic killings, rape, and village destruction. The conflict displaced millions and killed an estimated 300,000 people while the international community debated intervention.",

    "destruction_of_carthage": "Rome's complete annihilation of Carthage following the Third Punic War. The city was razed, the population killed or enslaved, and the site reportedly salted to prevent resettlement. Rome eliminated its greatest rival and absorbed its North African territories.",

    "dirty_war_argentina": "Argentina's military junta's campaign against suspected leftists and dissidents from 1976-83. Security forces kidnapped, tortured, and 'disappeared' up to 30,000 people. Victims were drugged and thrown from planes into the ocean. Children of the disappeared were given to military families.",

    "dzungar_genocide": "The Qing Dynasty's systematic destruction of the Dzungar Mongol people. After defeating the Dzungar Khanate, Qing forces killed approximately 80% of the Dzungar population through military campaigns, organized massacres, and deliberately spread smallpox.",

    "east_timor_genocide": "Indonesia's brutal occupation of East Timor following its 1975 invasion. Military operations, forced starvation, and massacres killed up to 180,000 people—about a quarter of the population. The occupation lasted until 1999 when East Timor gained independence.",

    "fall_of_nojpeten": "The Spanish conquest of the last independent Maya kingdom, Nojpetén (modern Flores, Guatemala). After resisting Spanish rule for 170 years, the Itza Maya capital fell in 1697. The conquest ended Maya political independence and accelerated cultural destruction.",

    "french_algeria": "France's 132-year colonization of Algeria, marked by initial conquest massacres, land seizure, and the brutal suppression of the 1954-62 independence war. French forces used torture, collective punishment, and resettlement camps. A million Algerians died in the independence struggle.",

    "great_famine_ireland": "The Irish Potato Famine caused by potato blight and British policies prioritizing free-market ideology over relief. Despite Ireland exporting food throughout the crisis, a million died of starvation and disease while another million emigrated. Ireland's population never recovered.",

    "great_leap_forward": "Mao Zedong's catastrophic industrialization campaign that caused history's deadliest famine. Forced collectivization, impossible grain quotas, and the diversion of agricultural labor to steel production led to 15-55 million deaths while officials reported false harvests.",

    "greek_genocide": "The Ottoman Empire's systematic killing and deportation of Pontic and Anatolian Greeks from 1914-1923. Concurrent with the Armenian Genocide, Greeks faced death marches, massacres, and forced labor battalions. Hundreds of thousands died; survivors were expelled in the 1923 population exchange.",

    "guatemalan_genocide": "The Guatemalan military's systematic destruction of Maya communities during the civil war, particularly under General Ríos Montt (1982-83). Entire villages were massacred, survivors displaced, and Maya identity targeted. The UN Truth Commission documented 626 massacres.",

    "herero_nama_genocide": "Germany's extermination campaign against the Herero and Nama peoples in colonial Namibia. Following uprisings, General von Trotha ordered the annihilation of both groups. Survivors were driven into the desert to die or imprisoned in concentration camps. Up to 80% of Herero and 50% of Nama perished.",

    "holodomor": "The Soviet-engineered famine in Ukraine caused by forced collectivization and grain requisitions. Stalin's policies deliberately targeted Ukrainian peasants, confiscating all food and blocking relief. An estimated 3.5-7 million Ukrainians starved to death in 1932-33.",

    "indonesian_killings": "The Indonesian military's anti-communist purge following the alleged 1965 coup attempt. With Western support, the army and civilian militias killed 500,000-1 million suspected communists, ethnic Chinese, and leftists. The killings brought Suharto to power for 32 years.",

    "italian_ethiopia": "Fascist Italy's brutal conquest and occupation of Ethiopia (1935-41). Mussolini's forces used poison gas, massacred civilians, and destroyed Ethiopian Orthodox churches. The 1937 Addis Ababa massacre killed up to 30,000 in retaliation for an assassination attempt.",

    "jewish_roman_wars": "Three major Roman military campaigns to suppress Jewish revolts in Judea. The First Jewish-Roman War (66-73 CE) ended with Jerusalem's destruction and the Temple's fall. The Bar Kokhba revolt (132-136 CE) resulted in Jews being banned from Jerusalem and Judea renamed Palestine.",

    "khmelnytsky_uprising": "Cossack hetman Bohdan Khmelnytsky's rebellion against Polish rule, which unleashed devastating pogroms against Ukrainian Jews. Cossacks and peasants massacred Jewish communities across Ukraine and Poland. Contemporary accounts describe unprecedented brutality; estimates suggest 100,000 Jewish deaths.",

    "mfecane": "A period of widespread chaos and warfare among indigenous ethnic communities in southern Africa during the 1810s-1830s. Driven by Zulu expansion, drought, and slave trading, the upheaval caused massive displacement, famine, and death across the region.",

    "mongol_conquests": "The Mongol Empire's expansion under Genghis Khan and successors, destroying cities and killing populations across Asia and Eastern Europe. Cities that resisted faced complete annihilation. The conquests caused demographic collapse in Central Asia, Persia, and China.",

    "nakba_1948": "The mass displacement of 700,000 Palestinians during the creation of Israel. Arab villages were depopulated through military operations, massacres, and psychological warfare. Most refugees were denied return; their descendants remain stateless in camps across the Middle East.",

    "nanking_massacre": "The Japanese Imperial Army's rampage through the Chinese capital after its capture in December 1937. Over six weeks, soldiers killed an estimated 200,000-300,000 civilians and prisoners of war. Systematic rape affected up to 80,000 women. Japan's denial continues to strain relations with China.",

    "napoleon_haiti": "Napoleon's attempt to restore slavery in Haiti and crush the revolution that had freed enslaved people. French forces under Leclerc used mass executions, deportations, and chemical warfare (sulfur dioxide). The campaign failed; Haiti became the first free Black republic, but France extracted crippling reparations.",

    "native_american_genocide": "The systematic destruction of Indigenous peoples in North America through warfare, forced removal, intentional starvation, and cultural erasure. From colonial massacres through the reservation system, Native American populations declined by 90%. Policies explicitly aimed at elimination.",

    "paraguayan_war": "The devastating 1864-1870 war in which Brazil, Argentina, and Uruguay fought Paraguay. Paraguay lost 60-90% of its population, including most adult males. The victors imposed harsh terms and territorial losses. One of the deadliest conflicts in modern history by proportion of population killed.",

    "partition_of_india": "The chaotic division of British India into India and Pakistan in 1947. Hastily drawn borders triggered massive population transfers and communal violence. Hindus, Muslims, and Sikhs massacred each other across Punjab and Bengal. Up to two million died; 15 million became refugees.",

    "putumayo_genocide": "The enslavement and murder of indigenous people by the Peruvian Amazon Company to extract rubber. Company agents used torture, mutilation, and killing to force labor quotas. Exposed by journalist Roger Casement, the scandal revealed systematic atrocities that killed tens of thousands.",

    "rwandan_genocide": "The systematic slaughter of 800,000 Tutsis and moderate Hutus in 100 days. Hutu extremists used radio propaganda to mobilize ordinary citizens as killers. The international community and UN peacekeepers failed to intervene. The genocide ended when the Rwandan Patriotic Front took power.",

    "sack_of_baghdad": "The Mongol destruction of Baghdad, the Abbasid Caliphate's capital and the Islamic world's cultural center. Hulagu Khan's forces killed hundreds of thousands, destroyed the Grand Library, and ended Baghdad's role as civilization's intellectual heart. The Tigris reportedly ran black with ink and red with blood.",

    "second_congo_war": "Africa's deadliest modern conflict, involving nine nations fighting across the Democratic Republic of Congo. Armed groups systematically used mass rape and ethnic massacres. The war and its aftermath killed over 5 million people, mostly from disease and starvation.",

    "soviet_deportations": "Stalin's forced relocation of entire ethnic groups to Siberia and Central Asia, accused of collaboration with Nazi Germany. Chechens, Crimean Tatars, Volga Germans, and others were deported in cattle cars. Hundreds of thousands died during transport and in exile.",

    "soviet_great_purge": "Stalin's campaign of political repression from 1936-38. Show trials condemned party leaders as traitors; the NKVD executed or imprisoned millions. Anyone could be denounced; fear paralyzed society. Approximately 750,000 were executed; millions more sent to Gulag camps.",

    "spanish_americas": "Spain's conquest and colonization of the Americas, which killed 90% of the indigenous population within a century. Warfare, enslavement in mines and plantations, and epidemic diseases devastated Native American civilizations. The encomienda system institutionalized exploitation.",

    "spanish_conquest_yucatan": "The Spanish conquest of Maya territories and the systematic destruction of Maya civilization. Bishop Diego de Landa burned thousands of Maya books and religious images in his 1562 auto-da-fé. Of thousands of Maya codices, only four survive. Centuries of accumulated knowledge were lost.",

    "swedish_deluge": "The Swedish invasion of Poland-Lithuania (1655-1660) that devastated the Polish state. Swedish and allied forces destroyed cities, massacred populations, and looted cultural treasures. Poland lost approximately one-third of its population and never regained its former power.",

    "taiping_rebellion": "A massive civil war in Qing China led by Hong Xiuquan, who claimed to be Jesus's brother. The Taiping established a rival state based on a syncretic Christian ideology. The 14-year conflict killed 20-30 million people, making it one of the deadliest wars in history.",

    "tasmania_black_war": "The colonial extermination of Aboriginal Tasmanians. British settlers waged guerrilla war, and the government organized 'Black Line' roundups to remove survivors to offshore camps. The last full-blooded Aboriginal Tasmanian, Truganini, died in 1876. An entire people was destroyed.",

    "the_holocaust": "Nazi Germany's systematic murder of six million Jews and millions of others deemed 'undesirable.' Industrial killing centers like Auschwitz used gas chambers and crematoria. The Holocaust was history's most systematic genocide, implemented with bureaucratic precision across occupied Europe.",

    "timur_conquests": "Timur's campaigns across Asia that killed approximately 5% of the world's population. Cities that resisted were destroyed and inhabitants massacred; skulls were piled into towers as warnings. Delhi, Baghdad, Damascus, and countless other cities were devastated.",

    "transatlantic_slave_trade": "The forced transportation of 12.5 million Africans to the Americas over four centuries. Two million died during the Middle Passage. Slavery built the economies of colonial powers and the United States. The trade's scale and duration make it history's largest forced migration.",

    "yazidi_genocide": "ISIS's systematic campaign to destroy the Yazidi religious minority in Iraq. Thousands of men were executed and buried in mass graves. Women and girls were enslaved and trafficked. The UN recognized the atrocities as genocide; recovery efforts continue."
}

def add_description_to_file(filepath):
    """Add description to a single event file."""
    basename = os.path.basename(filepath).replace('.json', '')

    if basename not in DESCRIPTIONS:
        print(f"No description for: {basename}")
        return False

    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Add description after name
    if 'description' in data:
        print(f"Already has description: {basename}")
        return False

    data['description'] = DESCRIPTIONS[basename]

    # Reorder to put description after name
    ordered = {}
    for key in data:
        ordered[key] = data[key]
        if key == 'name':
            ordered['description'] = DESCRIPTIONS[basename]

    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(ordered, f, indent=2, ensure_ascii=False)

    print(f"Added description: {basename}")
    return True

def main():
    events_dir = 'data/events'
    count = 0

    for filename in os.listdir(events_dir):
        if filename.endswith('.json') and not filename.startswith('_'):
            filepath = os.path.join(events_dir, filename)
            if add_description_to_file(filepath):
                count += 1

    print(f"\nAdded descriptions to {count} files")

if __name__ == '__main__':
    main()
