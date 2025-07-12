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

// Mock data for help and support
const CookiePolicyData = [
    {
        title: "Vad är cookies?",
        content: "Cookies är små textfiler som lagras på din dator eller mobila enhet när du besöker en webbplats. Dessa filer innehåller information om ditt besök på webbplatsen och används för att förbättra din upplevelse genom att anpassa innehåll och funktioner utifrån dina preferenser. Cookies gör det möjligt för webbplatser att komma ihåg dina val och inställningar, vilket gör surfandet smidigare och mer personligt."
    },
    {
        title: "Hur använder vi cookies?",
        content: "På Bilregistret använder vi cookies för att förstå hur besökare interagerar med vår webbplats, vilket hjälper oss att optimera och förbättra användarupplevelsen. Cookies möjliggör också att vi kan erbjuda personligt anpassat innehåll och annonser som är relevanta för dig. Vi använder följande typer av cookies på vår webbplats:"
    },
    {
        title: "Nödvändiga cookies:",
        content: "Dessa cookies är essentiella för att vår webbplats ska fungera korrekt. De möjliggör grundläggande funktioner som att navigera mellan sidor och använda viktiga funktioner. Dessa cookies lagrar ingen personligt identifierbar information."
    },
    {
        title: "Prestandacookies:",
        content: "Dessa cookies samlar in information om hur besökare använder vår webbplats, till exempel vilka sidor som besöks mest och eventuella felmeddelanden som visas. Informationen används för att analysera och förbättra webbplatsens prestanda.Dessa cookies lagrar ingen personligt identifierbar information."
    },
    {
        title: "Funktionscookies",
        content: "Dessa cookies gör det möjligt för oss att erbjuda förbättrade funktioner och anpassningar, såsom att komma ihåg dina inställningar och preferenser. Till exempel kan dessa cookies komma ihåg ditt användarnamn och språval. Informationen som samlas in av dessa cookies kan vara anonymiserad och kan inte spåra din webbaktivitet på andra webbplatser."
    },
    {
        title: "Marknadsföringscookies",
        content: "Dessa cookies används för att leverera annonser som är relevanta för dig och dina intressen. De används också för att mäta effektiviteten av våra marknadsförings kampanjer. Marknadsföringscookies kan spåra din webbläsares aktivitet på andra webbplatser och skapa en profil av dina intressen. Denna information kan delas med tredjepartsleverantörer för att rikta annonser baserade på dina intressen."
    },
    {
        title: "Hur hanterar du cookies?",
        content: "Genom att använda Bilregistret samtycker du till användningen av cookies enligt denna Cookiepolicy. Du har möjlighet att blockera eller ta bort cookies genom att ändra inställningarna i din webbläsare. Vänligen notera att om du blockerar eller tar bort cookies kan vissa delar av webbplatsen sluta fungera korrekt. För att ändra dina cookieinställningar, följ instruktionerna i din webbläsare. För att hantera marknadsföringscookies från tredjepartsleverantörer, kan du besöka webbplatser som youronlinechoices.com, eller du kan välja bort målinriktad annonsering baserad på dina intressen."
    },
    {
        title: "Ändringar i Cookiepolicy",
        content: "Vi kan komma att uppdatera vår Cookiepolicy vid behov. Eventuella ändringar kommer att publiceras på denna sida, och det rekommenderas att du regelbundet granskar policyn för att hålla dig informerad om eventuella förändringar. Läs gärna våra användningsvillkor på bilregistret.ai."
    },
    {
        title: "Kontakta oss",
        content: "Om du har några frågor eller funderingar angående vår Cookiepolicy eller vår användning av cookies, är du välkommen att kontakta oss via kontaktinformation. Läs om våra användarvillkor."
    }
];

export default function CookiePolicy() {
    const router = useRouter();

    const handleGoBack = () => {
        router.back();
    };

    return (
        <View style={styles.container}>
            {!isDesktopWeb() && (
                <SimpleHeader
                    title="Cookiepolicy"
                    onBackPress={handleGoBack}
                />
            )}

            <FooterWrapper contentContainerStyle={styles.content}>
                <DesktopViewWrapper>
                    {CookiePolicyData.map((item, index) => (
                        <View key={index} style={styles.section}>
                            <MyText fontFamily="Poppins" style={styles.sectionTitle}>
                                {item.title}
                            </MyText>
                            <MyText style={styles.paragraph}>
                                {item.content}
                            </MyText>
                            {index < CookiePolicyData.length - 1 && <View style={styles.separator} />}
                        </View>
                    ))}
                </DesktopViewWrapper>
            </FooterWrapper>
        </View>
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
        fontWeight: '500',
        marginTop: isDesktopWeb() ? 50 : 0,
    },
    paragraph: {
        fontSize: 15,
        lineHeight: 24,
        color: myColors.text.primary,
        marginBottom: 15,
    },
    separator: {
        height: 1,
        backgroundColor: myColors.border.light,
        marginTop: 10
    }
});