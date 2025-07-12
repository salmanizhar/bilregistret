import React from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  Linking, 
  ViewStyle, 
  TextStyle 
} from 'react-native';
import MyText from '@/components/common/MyText';
import { myColors } from '@/constants/MyColors';
import { Ionicons } from '@expo/vector-icons';

interface TermsAndConditionsPopupProps {
  visible: boolean;
  onClose: () => void;
}

export default function TermsAndConditionsPopup({ visible, onClose }: TermsAndConditionsPopupProps) {
  const handleOpenLink = () => {
    Linking.openURL('https://www.bilregistret.ai/sekretesspolicy');
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <MyText style={styles.title}>Villkor & Policys</MyText>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={myColors.black} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <MyText style={styles.introText}>
              Bilregistret.ai (drivs av Bilregistret Sverige AB) respekterar din integritet och följer gällande dataskyddsregler (GDPR inom EU och kraven från Apple App Store och Google Play). Denna policy förklarar hur vi samlar in, använder och skyddar dina uppgifter.
            </MyText>

            <View style={styles.section}>
              <MyText style={styles.sectionTitle}>1. Insamlade uppgifter</MyText>
              <MyText style={styles.paragraph}>
                När du använder vår webb eller app samlar vi in följande typer av data:
              </MyText>

              <View style={styles.subsection}>
                <MyText style={styles.subsectionTitle}>Personuppgifter:</MyText>
                <View style={styles.bulletList}>
                  <MyText style={styles.bulletItem}>• Namn</MyText>
                  <MyText style={styles.bulletItem}>• E-post</MyText>
                  <MyText style={styles.bulletItem}>• Telefonnummer (om du kontaktar oss eller skapar konto)</MyText>
                </View>
              </View>

              <View style={styles.subsection}>
                <MyText style={styles.subsectionTitle}>Teknisk information:</MyText>
                <View style={styles.bulletList}>
                  <MyText style={styles.bulletItem}>• IP-adress</MyText>
                  <MyText style={styles.bulletItem}>• Enhetstyp och operativsystem</MyText>
                  <MyText style={styles.bulletItem}>• App- och webbanvändning</MyText>
                  <MyText style={styles.bulletItem}>• Webbläsartyp, språk, tidszon</MyText>
                </View>
              </View>

              <View style={styles.subsection}>
                <MyText style={styles.subsectionTitle}>Användarbeteende:</MyText>
                <View style={styles.bulletList}>
                  <MyText style={styles.bulletItem}>• Sökningar</MyText>
                  <MyText style={styles.bulletItem}>• Klick och visningar</MyText>
                  <MyText style={styles.bulletItem}>• Sessionstider</MyText>
                  <MyText style={styles.bulletItem}>• Felrapporter</MyText>
                </View>
              </View>

              <View style={styles.subsection}>
                <MyText style={styles.subsectionTitle}>Platsinformation:</MyText>
                <View style={styles.bulletList}>
                  <MyText style={styles.bulletItem}>• Exakt eller ungefärlig plats (om du ger tillstånd i appen)</MyText>
                </View>
              </View>

              <View style={styles.subsection}>
                <MyText style={styles.subsectionTitle}>Betalningsinformation:</MyText>
                <View style={styles.bulletList}>
                  <MyText style={styles.bulletItem}>• Hanteras via tredje part (t.ex. Stripe, Google Pay) – vi sparar ej känsliga kortuppgifter.</MyText>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <MyText style={styles.sectionTitle}>2. Hur vi använder din information</MyText>
              <MyText style={styles.paragraph}>
                Vi använder informationen för att:
              </MyText>
              <View style={styles.bulletList}>
                <MyText style={styles.bulletItem}>• Tillhandahålla, anpassa och förbättra våra tjänster</MyText>
                <MyText style={styles.bulletItem}>• Kommunicera med dig (t.ex. support, uppdateringar)</MyText>
                <MyText style={styles.bulletItem}>• Förbättra användarupplevelsen</MyText>
                <MyText style={styles.bulletItem}>• Analysera användning och teknisk funktion</MyText>
                <MyText style={styles.bulletItem}>• Uppfylla lagkrav</MyText>
                <MyText style={styles.bulletItem}>• Förebygga missbruk, bedrägerier och säkerhetshot</MyText>
              </View>
            </View>

            <View style={styles.section}>
              <MyText style={styles.sectionTitle}>3. Rättslig grund (GDPR)</MyText>
              <MyText style={styles.paragraph}>
                Vi behandlar data med följande rättsliga grunder:
              </MyText>
              <View style={styles.bulletList}>
                <MyText style={styles.bulletItem}>• Avtal: för att erbjuda tjänsten du begär</MyText>
                <MyText style={styles.bulletItem}>• Samtycke: t.ex. för platsdelning, marknadsföring</MyText>
                <MyText style={styles.bulletItem}>• Rättslig förpliktelse: vid krav enligt lag</MyText>
                <MyText style={styles.bulletItem}>• Berättigat intresse: t.ex. för analys och säkerhet</MyText>
              </View>
            </View>

            <View style={styles.section}>
              <MyText style={styles.sectionTitle}>4. Lagringstid</MyText>
              <MyText style={styles.paragraph}>
                Dina uppgifter sparas så länge de behövs för syftet de samlades in för. Därefter raderas de eller anonymiseras.
              </MyText>
              <MyText style={styles.paragraph}>
                Exempel: teknisk loggdata sparas i 12 månader, användarkonto i max 24 månader efter inaktivitet.
              </MyText>
            </View>

            <View style={styles.section}>
              <MyText style={styles.sectionTitle}>5. Delning av information</MyText>
              <MyText style={styles.paragraph}>
                Vi säljer aldrig din data. Vi delar bara med:
              </MyText>
              <View style={styles.bulletList}>
                <MyText style={styles.bulletItem}>• Tekniska leverantörer (t.ex. serverhosting, Google Analytics, e-postverktyg)</MyText>
                <MyText style={styles.bulletItem}>• Betalningsleverantörer (t.ex. Stripe, Google Pay)</MyText>
                <MyText style={styles.bulletItem}>• Myndigheter om vi är skyldiga enligt lag</MyText>
              </View>
            </View>

            <View style={styles.section}>
              <MyText style={styles.sectionTitle}>6. Internationella dataöverföringar</MyText>
              <MyText style={styles.paragraph}>
                Om uppgifter behandlas utanför EU/EES (t.ex. via molntjänster), skyddas de genom godkända mekanismer som:
              </MyText>
              <View style={styles.bulletList}>
                <MyText style={styles.bulletItem}>• EU:s standardavtalsklausuler</MyText>
                <MyText style={styles.bulletItem}>• Leverantörer i länder med adekvat skyddsnivå</MyText>
              </View>
            </View>

            <View style={styles.section}>
              <MyText style={styles.sectionTitle}>7. Barn och minderåriga</MyText>
              <MyText style={styles.paragraph}>
                Tjänsten är inte avsedd för barn under 13 år. Vi samlar inte medvetet in data från minderåriga. Om detta sker av misstag raderar vi informationen omgående vid kontakt.
              </MyText>
            </View>

            <View style={styles.section}>
              <MyText style={styles.sectionTitle}>8. Cookies & analysverktyg</MyText>
              <MyText style={styles.paragraph}>
                Vi använder cookies och liknande tekniker för:
              </MyText>
              <View style={styles.bulletList}>
                <MyText style={styles.bulletItem}>• Grundläggande funktionalitet</MyText>
                <MyText style={styles.bulletItem}>• Statistik & prestanda (t.ex. Google Analytics)</MyText>
                <MyText style={styles.bulletItem}>• Annonsspårning (endast om du samtycker)</MyText>
              </View>
              <MyText style={styles.paragraph}>
                Du kan hantera cookies i din webbläsare eller via appinställningar.
              </MyText>
            </View>

            <View style={styles.section}>
              <MyText style={styles.sectionTitle}>9. Dina rättigheter</MyText>
              <MyText style={styles.paragraph}>
                Du har rätt att:
              </MyText>
              <View style={styles.bulletList}>
                <MyText style={styles.bulletItem}>• Begära tillgång till dina personuppgifter</MyText>
                <MyText style={styles.bulletItem}>• Begära rättelse eller radering</MyText>
                <MyText style={styles.bulletItem}>• Begränsa behandlingen</MyText>
                <MyText style={styles.bulletItem}>• Invända mot behandling</MyText>
                <MyText style={styles.bulletItem}>• Få ut dina uppgifter (dataportabilitet)</MyText>
                <MyText style={styles.bulletItem}>• Återkalla samtycke när som helst</MyText>
              </View>
              <MyText style={styles.paragraph}>
                Kontakta oss via info@bilregistret.ai så hanterar vi din begäran inom 30 dagar.
              </MyText>
            </View>

            <View style={styles.section}>
              <MyText style={styles.sectionTitle}>10. Personuppgiftsansvarig</MyText>
              <MyText style={styles.paragraph}>
                Bilregistret Sverige AB{'\n'}
                E-post: info@bilregistret.ai{'\n'}
                Webb: www.bilregistret.ai{'\n'}
                Organisationsnummer: SE5594665571{'\n'}
                Adress: Fornminnesgatan 4{'\n'}
                253 68 Helsingborg
              </MyText>
            </View>

            <View style={styles.section}>
              <MyText style={styles.sectionTitle}>11. Uppdateringar</MyText>
              <MyText style={styles.paragraph}>
                Vi kan uppdatera denna policy. Den senaste versionen finns alltid på:
              </MyText>
              <TouchableOpacity onPress={handleOpenLink}>
                <MyText style={styles.linkText}>👉 https://www.bilregistret.ai/sekretesspolicy</MyText>
              </TouchableOpacity>
            </View>

            <View style={styles.emptySpace} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

type Styles = {
  modalOverlay: ViewStyle;
  modalContainer: ViewStyle;
  header: ViewStyle;
  closeButton: ViewStyle;
  title: TextStyle;
  content: ViewStyle;
  section: ViewStyle;
  sectionTitle: TextStyle;
  subsection: ViewStyle;
  subsectionTitle: TextStyle;
  paragraph: TextStyle;
  bulletList: ViewStyle;
  bulletItem: TextStyle;
  emptySpace: ViewStyle;
  separator: ViewStyle;
  introText: TextStyle;
  linkText: TextStyle;
};

const styles = StyleSheet.create<Styles>({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 600,
    maxHeight: '90%',
    backgroundColor: myColors.screenBackgroundColor,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: myColors.border.light,
  },
  closeButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center'
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: myColors.primary.main,
  },
  subsection: {
    marginTop: 8,
    marginBottom: 8,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    color: myColors.text.primary,
    marginBottom: 8,
  },
  bulletList: {
    marginLeft: 8,
    marginBottom: 8,
  },
  bulletItem: {
    fontSize: 14,
    lineHeight: 20,
    color: myColors.text.primary,
    marginBottom: 4,
  },
  emptySpace: {
    height: 24,
  },
  separator: {
    height: 1,
    backgroundColor: myColors.border.light,
    marginTop: 8
  },
  introText: {
    fontSize: 14,
    lineHeight: 20,
    color: myColors.text.primary,
    marginBottom: 16,
    marginTop: 8,
  },
  linkText: {
    fontSize: 14,
    color: myColors.primary.main,
    textDecorationLine: 'underline',
    marginTop: 4,
  }
}); 