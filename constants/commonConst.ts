import { ImagePath } from "@/assets/images";

export const apiUrls = {
    TESTING_SERVER: 'https://dev.bilregistret.ai/api',
    LIVE_SERVER: 'https://api.bilregistret.ai/api',
    LOCAL_SERVER: 'http://localhost:3000/api',
};

// oAuth2 constants
export const FACEBOOK_APP_ID = "2392 3985527198651"//"1604332513562852"
export const GOOGLE_WEB_CLIENT_ID = '197320497670-cfo8fpdssdvmd1961qn416la9clbq9ep.apps.googleusercontent.com';
export const GOOGLE_WEB_CLIENT_ID_FOR_WEB_APP = '197320497670-nu15ndfttv40f6nudb1cp1i0lrm3o7sq.apps.googleusercontent.com';
export const GOOGLE_IOS_CLIENT_ID = '197320497670-16uk0q701hfhikac5r4obsi71ouou3uk.apps.googleusercontent.com';

// Base URL to access all apis.
export const BaseUrl = {
    url: apiUrls.LIVE_SERVER,
};

export const APP_STORE_URL = 'https://apps.apple.com/se/app/bilregistret-ai/id6744453280';
export const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.bilregistret.ai&pcampaignid=web_share';


export const MaxEmailLength = 100;
export const MaxNameLength = 100;
export const MaxPasswordLength = 100;

// Contact us number
export const ContactUsNumber = "010 162 61 62";

// Desktop web viewport width
export const desktopWebViewport = 1280;

export const TermsAndConditionsData = [
    {
        title: "Tjänstens Syfte och Användning",
        content: "Dessa användarvillkor (\"Villkoren\") reglerar din användning av Bilregistret.ai:s tjänst för sökning av registreringsnummer (\"Tjänsten\") och utgör ett juridiskt bindande avtal mellan dig (\"Användaren\") och Bilregistret.ai. Genom att använda Tjänsten samtycker du till dessa Villkor. Om du inte accepterar Villkoren, vänligen avstå från att använda Tjänsten.  \n\nTjänstens syfte är att ge Användaren tillgång till omfattande information om bilmärken, bilmodeller och specifika fordon, samt att erbjuda möjligheten att se och ladda upp bilder på fordon via vår webbplats. Du förbinder dig att använda Tjänsten i enlighet med gällande lagar och för lagliga ändamål. Det är förbjudet att använda Tjänsten för något otillbörligt eller olagligt ändamål."
    },
    {
        title: "Immateriella Rättigheter",
        content: "Allt innehåll som tillhandahålls genom Tjänsten, inklusive men inte begränsat till text, bilder, grafik, logotyper, varumärken och annat material, är skyddat av immateriella rättigheter och tillhör Bilregistret.ai eller dess licensgivare. Du förbinder dig att inte kopiera, reproducera, distribuera, publicera eller på annat sätt använda detta material utan uttryckligt skriftligt tillstånd från Bilregistret.ai."
    },
    {
        title: "Ansvarsfriskrivning",
        content: "jänsten tillhandahålls \"i befintligt skick\" utan några garantier, vare sig uttryckliga eller underförstådda, avseende Tjänstens tillförlitlighet, noggrannhet eller lämplighet för ett specifikt ändamål. Bilregistret.ai frånsäger sig allt ansvar för eventuella skador, förluster eller olägenheter som kan uppstå genom din användning av Tjänsten. Användning av Tjänsten sker helt på egen risk."
    },
    {
        title: "Personuppgifter och Integritet",
        content: "Genom att använda Tjänsten godkänner du att Bilregistret.ai samlar in och behandlar dina personuppgifter enligt vår integritetspolicy, som du kan läsa mer om på vår webbplats. Vi värnar om din integritet och vidtar alla nödvändiga åtgärder för att skydda dina personuppgifter."
    },
    {
        title: "Ändringar och Uppsägning",
        content: "Bilregistret.ai förbehåller sig rätten att när som helst ändra dessa Villkor eller att avbryta, ändra eller avsluta Tjänsten utan föregående meddelande. Det är ditt ansvar som Användare att regelbundet granska Villkoren för att säkerställa att du är medveten om eventuella ändringar. Din fortsatta användning av Tjänsten efter sådana ändringar innebär att du accepterar de uppdaterade Villkoren."
    },
    {
        title: "Rättigheter och Upphovsrätt",
        content: "Samtliga immateriella rättigheter, inklusive upphovsrätt, som rör Tjänsten och dess innehåll tillhör Bilregistret.ai. Genom din användning av Tjänsten erhåller du ingen licens eller annan rätt att använda denna egendom, förutom vad som uttryckligen anges i dessa Villkor."
    },
    {
        title: "Användarinskickad Information",
        content: "Bilregistret.ai förbehåller sig rätten att använda bilder och annan data som Användare laddar upp till Tjänsten eller webbplatsen, både i marknadsföringssyfte och för andra ändamål relaterade till Tjänsten. Genom att ladda upp innehåll ger du Bilregistret.ai en obegränsad och vederlagsfri licens att använda, bearbeta och anpassa detta innehåll för publicering på webbplatsen och i Tjänsten. Denna licens gäller under avtalets giltighet och därefter utan tidsbegränsning."
    },
    {
        title: "Rättighetsklarering",
        content: "Bilregistret.ai förbehåller sig rätten att använda bilder och annan data som Användare laddar upp till Tjänsten eller webbplatsen, både i marknadsföringssyfte och för andra ändamål relaterade till Tjänsten. Genom att ladda upp innehåll ger du Bilregistret.ai en obegränsad och vederlagsfri licens att Du som Användare ansvarar för att du har inhämtat alla nödvändiga rättigheter och godkännanden från tredje parter innan du laddar upp innehåll till Tjänsten. Om Bilregistret.ai blir föremål för ersättningskrav från tredje part på grund av att du inte har inhämtat sådant godkännande, förbinder du dig att hålla Bilregistret.ai skadeslöst och ersätta eventuella skador som uppstår., bearbeta och anpassa detta innehåll för publicering på webbplatsen och i Tjänsten. Denna licens gäller under avtalets giltighet och därefter utan tidsbegränsning."
    },
    {
        title: "Tillgänglighet och Ansvar",
        content: "Tjänsten tillhandahålls utan några garantier gällande dess tillgänglighet, funktionalitet eller support. Bilregistret.ai tar inget ansvar för eventuella avbrott i Tjänsten, oavsett om dessa beror på tekniska problem, underhåll eller andra omständigheter. Vidare lämnas inga garantier för korrektheten av den information som tillhandahålls genom Tjänsten. Bilregistret.ai ansvarar inte för några åtgärder som Användaren vidtar baserat på information erhållen genom Tjänsten."
    },
    {
        title: "Begränsningar för Automatiserade System och Dataintrång",
        content: "Användning av automatiserade system, programvara eller annan teknik för att söka, hämta eller lagra data från Tjänsten utan tillstånd är förbjudet och betraktas som dataintrång. Bilregistret.ai förbehåller sig rätten att vidta rättsliga åtgärder mot överträdelser av detta förbud."
    },
    {
        title: "Skydd av Inloggningsuppgifter",
        content: "Du som Användare ansvarar för att skydda dina inloggningsuppgifter, inklusive användarnamn och lösenord. All aktivitet som sker under din inloggning är ditt ansvar. Om du misstänker obehörig användning av ditt konto, ska du omedelbart informera Bilregistret.ai."
    },
    {
        title: "API-lösningar för System och Plattformar",
        content: "För kunder som önskar integrera vår fordonsdata i sina egna system eller plattformar erbjuder vi API-lösningar med särskilda användarvillkor och kontrakt. Om du är intresserad av en sådan integration, vänligen kontakta oss via vårt kontaktformulär för mer information och för att diskutera dina specifika behov."
    },
    {
        title: "Priser och Fakturering",
        content: "Alla priser för Tjänsten är exklusive moms. Tjänsten debiteras månadsvis och faktureras automatiskt den 1 varje månad. Vid utebliven betalning förfaller fakturan, och tillgången till Tjänsten kan komma att stängas av tills betalning mottagits."
    }
];


// Car Details List
// Value is the key from carDetailsData and the title is the label.
export const CarDetailsList = [
    {
        "index": 1,
        "title": "Besiktad",
        "value": "Besiktad",
        "icon": ImagePath.SvgIcons.CarDetailsIcons[1]
    },
    {
        "index": 2,
        "title": "Besikta senast",
        "value": "Besikta senast",
        "icon": ImagePath.SvgIcons.CarDetailsIcons[2]
    },
    {
        "index": 3,
        "title": "Påställd/Avställd", // Add a clause to also change the title of Fordonsstatus.
        "value": "Fordonsstatus datum",
        "icon": ImagePath.SvgIcons.CarDetailsIcons[3]
    },
    {
        "index": 4,
        "title": "Registreringsdatum",
        "value": "Registreringsdatum",
        "icon": ImagePath.SvgIcons.CarDetailsIcons[4]
    },
    {
        "index": 5,
        "title": "Mätarställning",
        "value": "Körsträcka",
        "icon": ImagePath.SvgIcons.CarDetailsIcons[11]
    },
    {
        "index": 6,
        "title": "Fordonsstatus",
        "value": "Fordonsstatus",
        "icon": ImagePath.SvgIcons.CarDetailsIcons[12],
        "VehiclestatusField": true
    },
    {
        "index": 7,
        "title": "Direktimport",
        "value": "Direktimport",
        "icon": ImagePath.SvgIcons.CarDetailsIcons[5]
    },
    {
        "index": 8,
        "title": "Köpform",
        "value": "Kopform", // Add a clause to also change the value of Köpform.
        "icon": ImagePath.SvgIcons.CarDetailsIcons[6]
    },
    {
        "index": 9,
        "title": "Ägarform",
        "value": "Ägarform",
        "icon": ImagePath.SvgIcons.CarDetailsIcons[7]
    },
    {
        "index": 10,
        "title": "Växellåda",
        "value": "Växellåda",
        "icon": ImagePath.SvgIcons.CarDetailsIcons[8]
    },
    {
        "index": 11,
        "title": "Färg",
        "value": "Färg",
        "icon": ImagePath.SvgIcons.CarDetailsIcons[9]
    },
    {
        "index": 12,
        "title": "Maxhastighet",
        "value": "Maxhastighet",
        "icon": ImagePath.SvgIcons.CarDetailsIcons[10]
    },
    {
        "index": 13,
        "title": "Hästkrafter",
        "value": "Total hästkrafter",
        "icon": ImagePath.SvgIcons.CarDetailsIcons[13]
    },
    {
        "index": 14,
        "title": "Motoreffekt",
        "value": "Total effekt",
        "icon": ImagePath.SvgIcons.CarDetailsIcons[14]
    },
    {
        "index": 15,
        "title": "Antal ägare",
        "value": "Antal brukare",
        "icon": ImagePath.SvgIcons.CarDetailsIcons[15]
    },
    {
        "index": 16,
        "title": "Antal sittplatser",
        "value": "Antal passagerare",
        "icon": ImagePath.SvgIcons.CarDetailsIcons[16]
    }
]

export const AboutUsData = [
    {
        "id": 1,
        "title": "Fordonsuppgifter",
        "icon": ImagePath.SvgIcons.VehicleInformationIcons[1]
    },
    {
        "id": 2,
        "title": "Motor",
        "icon": ImagePath.SvgIcons.VehicleInformationIcons[5]
    },
    {
        "id": 3,
        "title": "Fordonsinformation",
        "icon": ImagePath.SvgIcons.VehicleInformationIcons[6]
    },
    {
        "id": 4,
        "title": "Kaross",
        "icon": ImagePath.SvgIcons.VehicleInformationIcons[2]
    },
    {
        "id": 5,
        "title": "Vikt",
        "icon": ImagePath.SvgIcons.VehicleInformationIcons[4]
    },
    {
        "id": 6,
        "title": "Ägare & Fordonshistorik",
        "icon": ImagePath.SvgIcons.VehicleInformationIcons[7]
    },
    {
        "id": 7,
        "title": "Utsläpp",
        "icon": ImagePath.SvgIcons.VehicleInformationIcons[11]
    },
    {
        "id": 8,
        "title": "Bränsleförbrukning NEDC",
        "icon": ImagePath.SvgIcons.VehicleInformationIcons[14]
    },
    {
        "id": 9,
        "title": "Miljö- & Avgasvärden NEDC",
        "icon": ImagePath.SvgIcons.VehicleInformationIcons[13]
    },
    {
        "id": 10,
        "title": "Besiktning & Ägarinformation",
        "icon": ImagePath.SvgIcons.AboutUsIcons[10]
    },
    {
        "id": 11,
        "title": "Mått",
        "icon": ImagePath.SvgIcons.VehicleInformationIcons[3]
    },
    {
        "id": 12,
        "title": "Utrustning",
        "icon": ImagePath.SvgIcons.VehicleInformationIcons[8]
    },
    {
        "id": 13,
        "title": "Däck & Fälg",
        "icon": ImagePath.SvgIcons.VehicleInformationIcons[10]
    }
]

export const AllPackageData = [
    {
        "id": "0a5acf96-e6cc-4d05-b57a-28a16bce709a",
        "name": "GUEST-PLAN",
        "packageName": null,
        "description": "Biluppgifter Gäst",
        "fullDescription": null,
        "additionalInformation": null,
        "price": "5.00",
        "priceDisplay": "kr",
        "period": "/månad",
        "duration": 100,
        "searchesPerDay": 6,
        "features": {
            "highResImages": true,
            "historyAccess": true,
            "advancedSearch": true
        },
        "icon": ImagePath.SvgIcons.EnergyIcon,
        "isActive": true,
        "isPopular": false
    },
    {
        "id": "e144eae1-df3d-4a4e-93f4-1fa1ca02b5e5",
        "name": "Däck & Fälg",
        "packageName": null,
        "description": "All information för däck och fälgar samlad på ett ställe.",
        "fullDescription": null,
        "additionalInformation": null,
        "price": "399.00",
        "priceDisplay": "kr",
        "period": "/månad",
        "duration": 30,
        "searchesPerDay": 150,
        "features": [
            {
                "title": "Däck & Fälg",
                "description": "Få specifikationer och rekommendationer för däck och fälgar."
            },
            {
                "title": "TPMS",
                "description": "Fordon utrustade med TPMS."
            }
        ],
        "icon": ImagePath.SvgIcons.EnergyIcon,
        "isActive": true,
        "isPopular": false
    },
    {
        "id": "e95c05f5-387a-45fd-a0f5-5a612ff352b6",
        "name": "Plus",
        "packageName": "Registreringsnummer Plus",
        "description": "All information för bilverkstäder och bilhandlare.",
        "fullDescription": "Vår exklusiva tjänst är skräddarsydd för företag som behöver djupgående fordonsanalyser och en omfattande uppsättning av data. För endast 699kr per månad och användare får du tillgång till avancerad information om fordon, bildelskopplingar samt däck- och fälgdata med min- och maxvärden.",
        "additionalInformation": "Denna tjänst låter dig utföra ett stort antal registreringsnummer-sökningar per dag, vilket ger dig möjlighet att utforska bilregistret och historiken utan begränsningar. Du har friheten att analysera och fördjupa dig i all den fordonsdata du behöver för att fatta välgrundade beslut i ditt företag.\n\nFör användare som vill ta sina fordonsanalyser till nästa nivå erbjuder vi även en rad premiumfunktioner. När ditt konto är aktiverat får du tillgång till ytterligare fordonsinformation, vilket ger dig en heltäckande förståelse av varje fordon. Uppgradera din bilinfo och dra nytta av all den kunskap och insikt som vår tjänst erbjuder.",
        "price": "699.00",
        "priceDisplay": "kr",
        "period": "/månad",
        "duration": 30,
        "searchesPerDay": 150,
        "features": [
            {
                "title": "Däck & Fälg",
                "description": "Få specifikationer och rekommendationer för däck och fälgar."
            },
            {
                "title": "TPMS",
                "description": "Fordon utrustade med TPMS."
            },
            {
                "title": "Bilkod",
                "description": "Se specifik motorkod data."
            },
            {
                "title": "Carlinkment ID",
                "description": "Koppling till bildelar och reservdelar."
            }
        ],
        "icon": ImagePath.SvgIcons.Cube3Icon,
        "isActive": true,
        "isPopular": false
    },
    {
        "id": "70488882-dace-49d7-aa14-c4c6c7cb8c95",
        "name": "Max",
        "packageName": "Registreringsnummer Max",
        "description": "All information för försäkringsbolag och bilhandlare.",
        "fullDescription": "Upptäck Vår Exklusiva Tjänst - Nu Endast 799 kr/månad per Användare! Vår exklusiva tjänst är skapad för företag som strävar efter en fördjupad fordonsanalys och söker en omfattande uppsättning av bilinfo, bildelskoppling och däck och fälg med min och max värde.",
        "additionalInformation": "För endast 799kr/månad per användare får du tillgång till en värld av information och insikter som kommer att ta din fordonskännedom till en helt ny nivå. Denna tjänst ger dig möjlighet att utföra ett hög antal sökningar med registreringsnummer per dag. Du kan dyka djupare in i fordonsdata och historik utan att oroa dig för sökgränser. Detta innebär att du har friheten att utforska och analysera precis så mycket som du behöver för ditt företag. För de användare som verkligen vill maximera sina fordonsdata-analyser erbjuder vi även en rad premiumfunktioner. När du har aktiverat ditt konto har du möjlighet att få tillgång till extra fordonsinformation som ger dig en heltäckande förståelse för ditt fordon.",
        "price": "799.00",
        "priceDisplay": "kr",
        "period": "/månad",
        "duration": 30,
        "searchesPerDay": 150,
        "features": [
            {
                "title": "Däck & Fälg",
                "description": "Få specifikationer och rekommendationer för däck och fälgar."
            },
            {
                "title": "TPMS",
                "description": "Fordon utrustade med TPMS."
            },
            {
                "title": "Bilkod",
                "description": "Se specifik motorkod data."
            },
            {
                "title": "Carlinkment ID",
                "description": "Koppling till bildelar och reservdelar."
            },
            {
                "title": "Motorkod",
                "description": "Se specifik motorkod data."
            },
            {
                "title": "Fordonsbestånd",
                "description": "Se antal bilar med samma specifikationer i Sverige."
            },
            {
                "title": "Fordons- & Ägarhistorik",
                "description": "Se all fordons- & Ägarhistorik som hör ihop med bilen."
            }
        ],
        "icon": ImagePath.SvgIcons.MaxPremiumIcon,
        "isActive": true,
        "isPopular": false
    }
]

// FAQ Data
export const FAQData = [
    {
        id: 2,
        category: 'biluppgifter',
        question: "Vad är biluppgifter?",
        answer: "Biluppgifter är detaljerad information om ett fordon – såsom registreringsnummer, bilmärke, modell, färg, fordonstyp, ägarhistorik, besiktningsstatus, skatteskuld och mycket mer. Du kan enkelt hämta biluppgifter genom att skriva in registreringsnumret i en söktjänst som bilregistret.ai."
    },
    {
        id: 3,
        category: 'biluppgifter',
        question: "Hur hittar jag biluppgifter med registreringsnummer?",
        answer: "Du kan söka efter biluppgifter genom att ange registreringsnumret i vår sökruta. Inom sekunder får du tillgång till viktiga uppgifter om fordonet, exempelvis besiktningsdatum, fordonsstatus och senaste ägarbyte."
    },
    {
        id: 4,
        category: 'biluppgifter',
        question: "Är det gratis att söka biluppgifter?",
        answer: "Ja! På bilregistret.ai är det helt kostnadsfritt att ta fram grundläggande biluppgifter. Du behöver inte skapa konto för att se fordonsdata."
    },
    {
        id: 5,
        category: 'biluppgifter',
        question: "Vilka biluppgifter visas i er tjänst?",
        answer: "När du söker efter ett fordon hos oss kan du se:\n\n -Registreringsnummer och tillverkningsår\n -Bilmärke, modell och färg\n -Om fordonet är påställt eller avställt\n -Besiktningsinformation\n -Fordonsskatt och körförbud\n -Information om fordonets vikt, drivmedel och CO₂-utsläpp"
    },
    {
        id: 6,
        category: 'biluppgifter',
        question: "Hur uppdaterade är era biluppgifter?",
        answer: "Fordonsuppgifter hämtas från offentliga och tillförlitliga datakällor. Uppgifterna uppdateras kontinuerligt för att säkerställa att informationen är korrekt och aktuell."
    },
    {
        id: 7,
        category: 'biluppgifter',
        question: "Kan jag se biluppgifter på andra fordon än mina egna?",
        answer: "Ja, du kan söka efter biluppgifter på både dina egna fordon och andras – så länge du har tillgång till registreringsnumret. Detta är användbart vid exempelvis köp av begagnad bil."
    },
    {
        id: 8,
        category: 'biluppgifter',
        question: "Är det säkert att söka biluppgifter online?",
        answer: "Ja. Bilregistret.ai använder säkra anslutningar och visar endast publikt tillgängliga biluppgifter enligt svensk lagstiftning. Vi delar aldrig din personliga information vidare."
    },
    {
        id: 9,
        category: 'biluppgifter',
        question: "Varför är det viktigt att kontrollera biluppgifter?",
        answer: "Genom att granska biluppgifter kan du:\n\n -Undvika att köpa fordon med skulder eller körförbud\n -Se om bilen är besiktigad och påställd\n -Kontrollera bilens tekniska data och utrustning\n -Få ett uppskattat andrahandsvärde"
    },
    {
        id: 1,
        category: "HomeScreen",
        question: "Sök Tjänst för Fordonsinformation via Registreringsnummer",
        answer: "Välkommen till vår innovativa söktjänst där du enkelt och snabbt kan få detaljerad information om fordon genom att ange registreringsnumret. Oavsett om du är en potentiell begagnad bilköpare, en bilentusiast eller bara nyfiken på fordonets historia, erbjuder vår plattform en gratis och användarvänlig lösning för att få tillgång till värdefull fordonsinformation."
    },
    {
        id: 2,
        category: "HomeScreen",
        question: "Vad är en söktjänst för registreringsnummer?",
        answer: "En söktjänst för registreringsnummer är en digital plattform som låter användare söka efter fordonets uppgifter genom att ange dess registreringsnummer. Genom att använda denna tjänst kan du få information som tidigare ägare, servicehistorik, krockskador, och mycket mer. Detta är särskilt användbart när du överväger att köpa en begagnad bil, eftersom det ger dig en djupare insikt i bilens tillstånd och historia."
    },
    {
        id: 3,
        category: "HomeScreen",
        question: "Hur fungerar det?",
        answer: "Att använda vår söktjänst är enkelt och kräver bara några få steg: \n\nAnge Registreringsnummer: Gå till vår hemsida och skriv in registreringsnumret för det fordon du vill ha information om. \nVälj Informationstyp: Välj vilken typ av information du är intresserad av, såsom ägarhistorik, tekniska specifikationer eller eventuella skador. \nFå Resultat: Klicka på \"Sök eller enter\" och få omedelbart tillgång till detaljerad fordonsinformation. All information är lätt att förstå och presenterad på ett överskådligt sätt."
    },
    {
        id: 4,
        category: "HomeScreen",
        question: "Kan jag söka på alla typer av fordon?",
        answer: "Ja, vår tjänst omfattar ett brett utbud av fordon, inklusive personbilar, lastbilar, motorcyklar och mer. Så länge fordonet har ett registreringsnummer kan du få information om det. \n\nÄr det lagligt att söka på ett registreringsnummer? \nJa, det är helt lagligt att söka information om fordon via registreringsnummer, så länge informationen används för legitima syften, såsom att undersöka en begagnad bil innan köp. \n\n Vad kan jag få reda på om ett fordon? \nGenom vår tjänst kan du få information om tidigare ägare, registreringsdatum, krockhistorik, servicehistorik, besiktningsstatus och mycket mer. Detta hjälper dig att fatta informerade beslut när du överväger att köpa eller sälja ett fordon."
    },
    {
        id: 10,
        category: "minaFordon",
        question: "Vad är \"Mina Fordon\"?",
        answer: "Mina Fordon är en kostnadsfri tjänst på Bilregistret.ai där du kan spara dina fordon och få smarta påminnelser om besiktning, service, bilskatt och andra viktiga datum. Du får en fullständig översikt över dina bilar – allt samlat på ett ställe."
    },
    {
        id: 11,
        category: "minaFordon",
        question: "Hur fungerar besiktningspåminnelsen?",
        answer: "När du lägger till ett fordon i Mina Fordon får du automatiskt en påminnelse när det är dags att besiktiga bilen. Du får ett meddelande ca 30 dagar innan sista besiktningsdatum – så att du har gott om tid att boka."
    },
    {
        id: 12,
        category: "minaFordon",
        question: "Är tjänsten gratis?",
        answer: "Ja, Mina Fordon är helt gratis att använda. Det finns inga dolda avgifter eller bindningstider. Du kan när som helst lägga till eller ta bort fordon."
    },
    {
        id: 13,
        category: "minaFordon",
        question: "Behöver jag skapa ett konto?",
        answer: "Ja, du behöver skapa ett konto för att spara dina fordon och ta emot påminnelser. Det går snabbt – du anger bara din e-postadress och registrerar ditt/dina fordon med registreringsnummer."
    },
    {
        id: 14,
        category: "minaFordon",
        question: "Kan jag lägga till flera fordon?",
        answer: "Absolut. Du kan lägga till flera fordon – t.ex. familjens bilar, husbilar eller släpvagnar – och få separata påminnelser för varje fordon."
    },
    {
        id: 15,
        category: "minaFordon",
        question: "Vad kan jag hålla koll på i Mina Fordon?",
        answer: "Med vår tjänst får du översikt över:\n• Besiktningsdatum\n• Kommande service\n• Bilens uppskattade värde\n• Däckbyte (vinter/sommar)\n• Egna anteckningar och bilrelaterade dokument"
    },
    {
        id: 16,
        category: "minaFordon",
        question: "Fungerar Mina Fordon på mobilen?",
        answer: "Ja! Bilregistret.ai och Mina Fordon fungerar utmärkt på både mobil, surfplatta och dator. Du kan logga in och se information var du än är."
    },
    {
        id: 17,
        category: "minaFordon",
        question: "Hur får jag påminnelser?",
        answer: "Du väljer själv om du vill få påminnelser via e-post eller direkt i appen/webbläsaren. Fler kanaler (som SMS eller pushnotiser) kommer inom kort."
    },
    {
        id: 18,
        category: "minaFordon",
        question: "Är min data säker?",
        answer: "Ja, din information lagras säkert och enligt GDPR. Vi delar aldrig dina uppgifter med tredje part utan ditt medgivande."
    },
    {
        id: 19,
        category: "minaFordon",
        question: "Hur börjar jag?",
        answer: "Besök https://beta.bilregistret.ai/mina-fordon, skapa ett konto och lägg till ditt registreringsnummer – klart!"
    },
    {
        id: 20,
        category: "slapvagnskalkylator",
        question: "Vad är en släpvagnskalkylator?",
        answer: "En släpvagnskalkylator är ett digitalt verktyg som hjälper dig räkna ut exakt hur tungt släp du får dra med din bil – med eller utan körkortsklass B, B96 eller BE. Med Bilregistret.ai:s släpvagnskalkylator får du direkt svar utifrån ditt fordon och körkort."
    },
    {
        id: 21,
        category: "slapvagnskalkylator",
        question: "Hur fungerar er släpvagnskalkylator?",
        answer: "Du anger bilens registreringsnummer (och eventuellt släpets). Vår släpvagnskalkylator hämtar teknisk information automatiskt och räknar ut:\n\n• Max släpvagnsvikt\n• Tillåten totalvikt\n• Om du får köra kombinationen med ditt körkort\n\nResultatet visas direkt – enkelt, säkert och 100 % gratis."
    },
    {
        id: 22,
        category: "slapvagnskalkylator",
        question: "Behöver jag registrera mig för att använda släpvagnskalkylatorn?",
        answer: "Nej, du kan använda släpvagnskalkylatorn helt utan konto. Allt sker direkt på sidan – snabbt och smidigt."
    },
    {
        id: 23,
        category: "slapvagnskalkylator",
        question: "Vad betyder totalvikt, tjänstevikt och dragvikt i släpvagnskalkylatorn?",
        answer: "• Totalvikt = fordonets vikt inklusive max last.\n• Tjänstevikt = fordonets vikt utan last men med förare.\n• Dragvikt = den maximala vikt bilen får dra enligt registreringsbeviset.\n\nSläpvagnskalkylatorn tar hänsyn till alla dessa parametrar för korrekt resultat."
    },
    {
        id: 24,
        category: "slapvagnskalkylator",
        question: "Kan jag använda släpvagnskalkylatorn för att planera körkort eller utbildning?",
        answer: "Ja. Kalkylatorn visar om du får dra släpet med B, B96 eller BE-körkort. Perfekt om du funderar på att ta utökat B eller BE."
    },
    {
        id: 25,
        category: "slapvagnskalkylator",
        question: "Fungerar släpvagnskalkylatorn på mobil?",
        answer: "Absolut. Vår släpvagnskalkylator är helt mobilanpassad och fungerar lika bra på dator, mobil och surfplatta."
    },
    {
        id: 26,
        category: "slapvagnskalkylator",
        question: "Är resultatet från släpvagnskalkylatorn juridiskt bindande?",
        answer: "Nej, det är en hjälpande beräkning baserad på registrerade uppgifter. Du är själv ansvarig för att kontrollera att din fordonskombination är godkänd enligt gällande regler."
    }

];
