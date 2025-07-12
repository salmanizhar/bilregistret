import React from 'react';
import { StyleSheet, View, ViewStyle, TextStyle, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import MyText from '@/components/common/MyText';
import { myColors } from '@/constants/MyColors';
import SimpleHeader from '@/components/common/SimpleHeader';
import { getStatusBarHeight } from '@/constants/commonFunctions';
import DesktopViewWrapper from '@/components/common/DesktopViewWrapper';
import { isDesktopWeb } from '@/utils/deviceInfo';
import FooterWrapper from '@/components/common/ScreenWrapper';
import SafeSEOWrapper from '@/components/common/SafeSEOWrapper';
import { SEOHead } from '@/components/seo';

// Privacy policy data from the screenshot
const AnvändarvilkorData = [
    {
        title: "Tjänstens Syfte och Användning",
        content: "Dessa användarvillkor (\"Villkoren\") reglerar din användning av Bilregistret.ai:s tjänst för sökning av registreringsnummer (\"Tjänsten\") och utgör ett juridiskt bindande avtal mellan dig (\"Användaren\") och Bilregistret.ai. Genom att använda Tjänsten samtycker du till dessa Villkor. Om du inte accepterar Villkoren, vänligen avstå från att använda Tjänsten.Tjänstens syfte är att ge Användaren tillgång till omfattande information om bilmärken, bilmodeller och specifika fordon, samt att erbjuda möjligheten att se och ladda upp bilder på fordon via vår webbplats. Du förbinder dig att använda Tjänsten i enlighet med gällande lagar och för lagliga ändamål. Det är förbjudet att använda Tjänsten för något otillbörligt eller olagligt ändamål."
    },
    {
        title: "Immateriella Rättigheter",
        content: "Allt innehåll som tillhandahålls genom Tjänsten, inklusive men inte begränsat till text, bilder, grafik, logotyper, varumärken och annat material, är skyddat av immateriella rättigheter och tillhör Bilregistret.ai eller dess licensgivare. Du förbinder dig att inte kopiera, reproducera, distribuera, publicera eller på annat sätt använda detta material utan uttryckligt skriftligt tillstånd från Bilregistret.ai."
    },
    {
        title: "Ansvarsfriskrivning",
        content: "Tjänsten tillhandahålls \"i befintligt skick\" utan några garantier, vare sig uttryckliga eller underförstådda, avseende Tjänstens tillförlitlighet, noggrannhet eller lämplighet för ett specifikt ändamål. Bilregistret.ai frånsäger sig allt ansvar för eventuella skador, förluster eller olägenheter som kan uppstå genom din användning av Tjänsten. Användning av Tjänsten sker helt på egen risk."
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
        content: "Du som Användare ansvarar för att du har inhämtat alla nödvändiga rättigheter och godkännanden från tredje parter innan du laddar upp innehåll till Tjänsten. Om Bilregistret.ai blir föremål för ersättningskrav från tredje part på grund av att du inte har inhämtat sådant godkännande, förbinder du dig att hålla Bilregistret.ai skadeslöst och ersätta eventuella skador som uppstår."
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
    },
];

export default function PrivacyPolicy() {
    const router = useRouter();

    const handleGoBack = () => {
        router.back();
    };

    return (
        <>
            {/* SEO Head Tags */}
            <SEOHead
                title="Användarvillkor"
                description="Läs våra användarvillkor och villkor för användning av Bilregistret.ai. Information om rättigheter, ansvar och villkor för vår tjänst."
                keywords={[
                    'användarvillkor',
                    'villkor',
                    'terms',
                    'juridisk',
                    'bilregistret',
                    'rättigheter',
                    'ansvar',
                    'tjänstens villkor'
                ]}
                url="/anvandarvillkor"
                noIndex={true}
                noFollow={true}
            />

            <View style={styles.container}>
                {!isDesktopWeb() && (
                    <SimpleHeader
                        title="Användarvilkor"
                        onBackPress={handleGoBack}
                    />
                )}

                <FooterWrapper contentContainerStyle={styles.content}>
                    <DesktopViewWrapper>
                        {AnvändarvilkorData.map((item, index) => (
                            <View key={index} style={styles.section}>
                                <MyText fontFamily="Poppins" style={styles.sectionTitle}>
                                    {item.title}
                                </MyText>
                                <MyText style={styles.paragraph}>
                                    {item.content}
                                </MyText>
                                {index < AnvändarvilkorData.length - 1 && <View style={styles.separator} />}
                            </View>
                        ))}
                    </DesktopViewWrapper>
                </FooterWrapper>
            </View>
        </>
    );
}

type Styles = {
    container: ViewStyle;
    content: ViewStyle;
    section: ViewStyle;
    sectionTitle: TextStyle;
    paragraph: TextStyle;
    separator: ViewStyle;
};

const styles = StyleSheet.create<Styles>({
    container: {
        flex: 1,
        backgroundColor: myColors.screenBackgroundColor,
        paddingTop: getStatusBarHeight(),
    },
    content: {
        flex: 1,
    },
    section: {
        marginBottom: 25,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 20,
        marginBottom: 10,
        marginTop: isDesktopWeb() ? 50 : 0,
    },
    paragraph: {
        fontSize: 15,
        lineHeight: 24,
        color: myColors.baseColors.light3,
        marginBottom: 15,
    },
    separator: {
        height: 1,
        backgroundColor: myColors.border.light,
        marginTop: 10
    }
});
