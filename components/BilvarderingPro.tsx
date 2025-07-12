import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Platform,
    Linking,
    Animated,
} from 'react-native';
import MyText from '@/components/common/MyText';
import { myColors } from '@/constants/MyColors';
import { isDesktopWeb, isMobileWeb } from '@/utils/deviceInfo';
import { createWebStyles } from '@/utils/shadowHelper';
import { useCreateBilvarderingPro, useBilvarderingProRecords } from '@/Services/api/hooks/bilvardering.hooks';
import { BilvarderingProRecord } from '@/Services/api/types/bilvardering.types';
import { showSuccess, showError } from '@/utils/alert';
import { useSectionState } from '@/Services/api/hooks/sectionState.hooks';

interface BilvarderingProFormData {
    id?: string;
    name?: string;
    telefon?: string;
    email?: string;
    inpris?: string;
    utpris?: string;
    miltal?: string; 
    comment?: string;
}

interface BilvarderingProProps {
    regNumber: string;
    vehicleData?: any;
    findValueInCarData?: (key: string) => string | string[] | null;
}

const BilvarderingPro: React.FC<BilvarderingProProps> = ({ regNumber, vehicleData, findValueInCarData }) => {
    // Use persistent state for contact info visibility (global, not per vehicle)
    const contactInfoState = useSectionState({
        sectionKey: 'bilvardering_pro_contact_global',
        defaultState: false,
        dataVersion: '1.0'
    });
    
    // Use persistent state for comments visibility (global, not per vehicle)
    const commentsState = useSectionState({
        sectionKey: 'bilvardering_pro_comments_global',
        defaultState: false,
        dataVersion: '1.0'
    });
    
    const [formData, setFormData] = useState<BilvarderingProFormData>({
        name: '',
        telefon: '',
        email: '',
        inpris: '',
        utpris: '',
        miltal: '',
        comment: ''
    });

    const [comments, setComments] = useState<Array<BilvarderingProRecord>>([]);
    
    // Animation values - initialize based on persisted state
    const heightAnim = useRef(new Animated.Value(contactInfoState.isOpen ? 1 : 0)).current;
    const fadeAnim = useRef(new Animated.Value(contactInfoState.isOpen ? 1 : 0)).current;
    
    // Animation values for comments section - initialize based on persisted state
    const commentsHeightAnim = useRef(new Animated.Value(commentsState.isOpen ? 1 : 0)).current;
    const commentsFadeAnim = useRef(new Animated.Value(commentsState.isOpen ? 1 : 0)).current;

    // API hooks
    const createMutation = useCreateBilvarderingPro();
    // Only fetch records when comments section is open
    const { data: recordsData, isLoading: isLoadingRecords } = useBilvarderingProRecords(
        commentsState.isOpen ? regNumber : undefined
    );

    useEffect(() => {
        // Update comments when data is fetched
        if (recordsData?.success && recordsData.data) {
            setComments(recordsData.data);
        }
    }, [recordsData]);
    
    // Sync animations with loaded state (in case state loads after component mount)
    useEffect(() => {
        if (!contactInfoState.isLoading) {
            heightAnim.setValue(contactInfoState.isOpen ? 1 : 0);
            fadeAnim.setValue(contactInfoState.isOpen ? 1 : 0);
        }
    }, [contactInfoState.isLoading, contactInfoState.isOpen]);
    
    useEffect(() => {
        if (!commentsState.isLoading) {
            commentsHeightAnim.setValue(commentsState.isOpen ? 1 : 0);
            commentsFadeAnim.setValue(commentsState.isOpen ? 1 : 0);
        }
    }, [commentsState.isLoading, commentsState.isOpen]);
    
    // Auto-populate mileage from vehicle data
    useEffect(() => {
        if (findValueInCarData && !formData.miltal) {
            const korsträcka = findValueInCarData('Körsträcka');
            if (korsträcka) {
                // Convert from "15865 mil" to "15865"
                const milValue = korsträcka.toString().replace(/[^0-9]/g, '');
                setFormData(prev => ({ ...prev, miltal: milValue }));
            }
        }
    }, [vehicleData, findValueInCarData]);
    
    // Animate contact info visibility
    useEffect(() => {
        if (contactInfoState.isOpen) {
            // Animate in
            Animated.parallel([
                Animated.timing(heightAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: false, // Height cannot use native driver
                }),
                Animated.spring(fadeAnim, {
                    toValue: 1,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: false, // Keep all animations non-native to avoid conflicts
                }),
            ]).start();
        } else {
            // Animate out
            Animated.parallel([
                Animated.timing(heightAnim, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: false,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: false,
                }),
            ]).start();
        }
    }, [contactInfoState.isOpen]);
    
    // Animate comments section visibility
    useEffect(() => {
        if (commentsState.isOpen) {
            // Animate in
            Animated.parallel([
                Animated.timing(commentsHeightAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: false,
                }),
                Animated.spring(commentsFadeAnim, {
                    toValue: 1,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: false,
                }),
            ]).start();
        } else {
            // Animate out
            Animated.parallel([
                Animated.timing(commentsHeightAnim, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: false,
                }),
                Animated.timing(commentsFadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: false,
                }),
            ]).start();
        }
    }, [commentsState.isOpen]);


    const handleSave = async () => {
        try {
            // Convert form data to API format
            const requestData = {
                reg_num: regNumber,
                name: formData.name,
                telefon: formData.telefon,
                email: formData.email,
                price_in: formData.inpris ? parseFloat(formData.inpris) : undefined,
                price_out: formData.utpris ? parseFloat(formData.utpris) : undefined,
                mileage: formData.miltal ? parseInt(formData.miltal) * 10 : undefined, // Convert mil to km
                comments: formData.comment
            };

            await createMutation.mutateAsync(requestData);
            
            // Clear form after successful save
            setFormData({
                name: '',
                telefon: '',
                email: '',
                inpris: '',
                utpris: '',
                miltal: '',
                comment: ''
            });
            
            // Hide contact info section after save
            if (contactInfoState.isOpen) {
                await contactInfoState.toggleState();
            }
        } catch (error) {
            // Error handling is done in the mutation hook
        }
    };

    const handleInputChange = (field: keyof BilvarderingProFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const openBlocketPrice = async () => {
        try {
            // Extract car data
            console.log('Vehicle data:', vehicleData);
            const car = vehicleData?.car;
            if (!car) {
                showError('Fel', 'Å nej! Något gick fel!');
                return;
            }
            
            // Use findValueInCarData if provided, otherwise fall back to direct search
            let make = '';
            let model = '';
            let year = 0;
            
            if (findValueInCarData) {
                // Use the provided function
                make = (findValueInCarData('Bilmärke') || findValueInCarData('Fabrikat') || '') as string;
                model = (findValueInCarData('Bilmodell') || findValueInCarData('Handelsbeteckning') || '') as string;
                const yearValue = findValueInCarData('Årsmodell');
                year = yearValue ? parseInt(yearValue.toString()) : 0;
            } else {
                // Fallback: Check all entries in the car data array
                if (Array.isArray(car)) {
                    car.forEach(section => {
                        if (section.data) {
                            if (section.data.Bilmärke) make = section.data.Bilmärke;
                            if (section.data.Bilmodell) {
                                model = section.data.Bilmodell;
                            } else if (section.data.Handelsbeteckning) {
                                model = section.data.Handelsbeteckning;
                            }
                            if (section.data.Årsmodell) {
                                year = parseInt(section.data.Årsmodell);
                            }
                        }
                    });
                }
            }
            
            // Hierarchy for mileage: 1. Manual input, 2. Auto-populated from data
            let mileageInMil = 0; // Work with mil values
            if (formData.miltal) {
                // Use manually entered value (already in mil)
                mileageInMil = parseInt(formData.miltal.replace(/[^0-9]/g, '') || '0');
            } else if (findValueInCarData) {
                // Try to get from vehicle data
                const korsträcka = findValueInCarData('Körsträcka');
                if (korsträcka) {
                    // Vehicle data is in km (e.g., "123 747 km"), convert to mil
                    const km = parseInt(korsträcka.toString().replace(/[^0-9]/g, '') || '0');
                    mileageInMil = Math.round(km / 10);
                }
            }
            
            if (!make || !model) {
                showError('Fel', 'Å nej! Något gick fel!');
                return;
            }
            
            // Build search query
            const searchQuery = `${make} ${model}`.trim();
            
            // Build filters
            const filters = [];
            
            // Year filter: -3 to +3 years
            if (year > 0) {
                const minYear = Math.max(year - 3, 1990);
                const maxYear = Math.min(year + 3, new Date().getFullYear());
                filters.push({
                    key: 'modelYear',
                    range: {
                        start: minYear.toString(),
                        end: maxYear.toString()
                    }
                });
            }
            
            // Mileage filter: -22% to +22%
            if (mileageInMil > 0) {
                // Calculate range in mil (Blocket expects mil values, not km)
                const minMileageInMil = Math.max(Math.round(mileageInMil * 0.78), 0);
                const maxMileageInMil = Math.round(mileageInMil * 1.22);
                
                filters.push({
                    key: 'milage', // Note: Blocket uses 'milage' not 'mileage'
                    range: {
                        start: minMileageInMil.toString(),
                        end: maxMileageInMil.toString()
                    }
                });
            }
            
            // Build URL
            const baseUrl = 'https://www.blocket.se/bilar/sok';
            const params = new URLSearchParams();
            params.append('q', searchQuery);
            
            // Add filters if any
            if (filters.length > 0) {
                filters.forEach(filter => {
                    params.append('filter', JSON.stringify(filter));
                });
            }
            
            const blocketUrl = `${baseUrl}?${params.toString()}`;
            
            // Open URL
            if (Platform.OS === 'web' && typeof window !== 'undefined') {
                window.open(blocketUrl, '_blank');
            } else {
                Linking.openURL(blocketUrl).catch(err => 
                    console.error('Error opening URL:', err)
                );
            }
        } catch (error) {
            console.error('Error generating Blocket URL:', error);
            showError('Fel', 'Å nej! Något gick fel!');
        }
    };

    // Remove the loading state for the entire component
    // We'll show loading only for the comments section

    const isMobile = !isDesktopWeb() || isMobileWeb();
    const isDesktop = isDesktopWeb();
    
    return (
        <View style={[styles.container, isMobile && styles.containerMobile, isDesktop && styles.containerDesktop]}>
            <View style={styles.contentWrapper}>
                {/* Internal comments header */}
                <MyText style={[styles.headerTitle, isMobile && styles.headerTitleMobile, isDesktop && styles.headerTitleDesktop]}>
                    Interna kommentarer för Bilregistret AB
                </MyText>

            {/* Contact information section with animation */}
            <Animated.View style={[
                styles.contactAnimationWrapper,
                {
                    maxHeight: heightAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 500], // Use maxHeight for flexible content
                    }),
                    opacity: fadeAnim,
                }
            ]}>
                <Animated.View style={[
                    styles.contactSection,
                    isDesktop && styles.contactSectionDesktop,
                    {
                        transform: [{
                            translateY: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-20, 0],
                            }),
                        }],
                    }
                ]}>
                    <View style={[styles.inputRow, isMobile && styles.inputRowMobile, isDesktop && styles.inputRowDesktop]}>
                        <View style={[styles.inputGroup, isMobile && styles.inputGroupMobile, isDesktop && styles.inputGroupDesktop]}>
                            <MyText style={[styles.inputLabel, isDesktop && styles.inputLabelDesktop]}>Namn</MyText>
                            <TextInput
                                style={[styles.input, isMobile && styles.inputMobile, isDesktop && styles.inputDesktop]}
                                value={formData.name}
                                onChangeText={(text) => handleInputChange('name', text)}
                                placeholder="Namn"
                                placeholderTextColor="#9ea6ba"
                            />
                        </View>
                        <View style={[styles.inputGroup, isMobile && styles.inputGroupMobile, isDesktop && styles.inputGroupDesktop]}>
                            <MyText style={[styles.inputLabel, isDesktop && styles.inputLabelDesktop]}>Telefon</MyText>
                            <TextInput
                                style={[styles.input, isMobile && styles.inputMobile, isDesktop && styles.inputDesktop]}
                                value={formData.telefon}
                                onChangeText={(text) => handleInputChange('telefon', text)}
                                placeholder="Telefonnummer"
                                placeholderTextColor="#9ea6ba"
                            />
                        </View>
                        {isDesktop && (
                            <View style={[styles.inputGroupDesktop, styles.inputGroupEmail]}>
                                <MyText style={styles.inputLabelDesktop}>Email</MyText>
                                <TextInput
                                    style={[styles.input, styles.inputDesktop, styles.inputEmailDesktop]}
                                    value={formData.email}
                                    onChangeText={(text) => handleInputChange('email', text)}
                                    placeholder="E-postadress"
                                    placeholderTextColor="#9ea6ba"
                                    keyboardType="email-address"
                                />
                            </View>
                        )}
                    </View>
                    {!isDesktop && (
                        <View style={styles.inputGroupFull}>
                            <MyText style={styles.inputLabel}>Email</MyText>
                            <TextInput
                                style={[styles.input, isMobile && styles.inputMobile]}
                                value={formData.email}
                                onChangeText={(text) => handleInputChange('email', text)}
                                placeholder="E-postadress"
                                placeholderTextColor="#6c6c6c"
                                keyboardType="email-address"
                            />
                        </View>
                    )}
                </Animated.View>
            </Animated.View>

            {/* Toggle contact info button */}
            <TouchableOpacity
                style={[styles.toggleButton, isMobile && styles.toggleButtonMobile, isDesktop && styles.toggleButtonDesktop]}
                onPress={contactInfoState.toggleState}
            >
                <MyText style={[styles.toggleButtonText, isMobile && styles.toggleButtonTextMobile, isDesktop && styles.toggleButtonTextDesktop]}>
                    {contactInfoState.isOpen ? 'DÖLJ MITT KONTAKTFÄLT' : 'VISA MITT KONTAKTFÄLT'}
                </MyText>
            </TouchableOpacity>

            {/* Main form section */}
            <View style={[styles.formSection, isMobile && styles.formSectionMobile, isDesktop && styles.formSectionDesktop]}>
                <View style={[styles.inputRow, isMobile && styles.inputRowMobile, isDesktop && styles.inputRowDesktop]}>
                    <View style={[styles.inputGroup, isMobile && styles.inputGroupMobile, isDesktop && styles.inputGroupSmallDesktop]}>
                        <MyText style={[styles.inputLabel, isDesktop && styles.inputLabelDesktop]}>Inpris</MyText>
                        <TextInput
                            style={[styles.input, isMobile && styles.inputMobile, isDesktop && styles.inputDesktop]}
                            value={formData.inpris}
                            onChangeText={(text) => handleInputChange('inpris', text)}
                            placeholder="SEK"
                            placeholderTextColor={isDesktop ? "#9ea6ba" : "#8c8c8c"}
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={[styles.inputGroup, isMobile && styles.inputGroupMobile, isDesktop && styles.inputGroupSmallDesktop]}>
                        <MyText style={[styles.inputLabel, isDesktop && styles.inputLabelDesktop]}>Utpris</MyText>
                        <TextInput
                            style={[styles.input, isMobile && styles.inputMobile, isDesktop && styles.inputDesktop]}
                            value={formData.utpris}
                            onChangeText={(text) => handleInputChange('utpris', text)}
                            placeholder="SEK"
                            placeholderTextColor={isDesktop ? "#9ea6ba" : "#8c8c8c"}
                            keyboardType="numeric"
                        />
                    </View>
                    {isDesktop && (
                        <View style={styles.inputGroupSmallDesktop}>
                            <MyText style={styles.inputLabelDesktop}>Miltal</MyText>
                            <View style={styles.inputWithClear}>
                                <TextInput
                                    style={[styles.input, styles.inputDesktop, styles.inputWithClearButton]}
                                    value={formData.miltal}
                                    onChangeText={(text) => handleInputChange('miltal', text)}
                                    placeholder="Mil"
                                    placeholderTextColor="#9ea6ba"
                                    keyboardType="numeric"
                                />
                                {formData.miltal ? (
                                    <TouchableOpacity
                                        style={[styles.clearButton, styles.clearButtonDesktop]}
                                        onPress={() => handleInputChange('miltal', '')}
                                    >
                                        <MyText style={styles.clearButtonText}>×</MyText>
                                    </TouchableOpacity>
                                ) : null}
                            </View>
                        </View>
                    )}
                    {isDesktop && (
                        <View style={styles.inputGroupMediumDesktop}>
                            <MyText style={styles.inputLabelDesktop}>Kommentar</MyText>
                            <TextInput
                                style={[styles.input, styles.inputDesktop]}
                                value={formData.comment}
                                onChangeText={(text) => handleInputChange('comment', text)}
                                placeholder="Skriv kommentar..."
                                placeholderTextColor="#9ea6ba"
                                multiline={false}
                            />
                        </View>
                    )}
                    {isDesktop && (
                        <TouchableOpacity
                            style={[styles.saveButton, styles.saveButtonDesktop, createMutation.isPending && styles.saveButtonDisabled]}
                            onPress={handleSave}
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? (
                                <ActivityIndicator size="small" color={myColors.white} />
                            ) : (
                                <MyText style={styles.saveButtonTextDesktop}>SPARA</MyText>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
                
                {!isDesktop && (
                    <>
                        <View style={styles.inputGroupFull}>
                            <MyText style={styles.inputLabel}>Miltal</MyText>
                            <View style={styles.inputWithClear}>
                                <TextInput
                                    style={[styles.input, isMobile && styles.inputMobile, styles.inputWithClearButton]}
                                    value={formData.miltal}
                                    onChangeText={(text) => handleInputChange('miltal', text)}
                                    placeholder="Mil"
                                    placeholderTextColor="#6c6c6c"
                                    keyboardType="numeric"
                                />
                                {formData.miltal ? (
                                    <TouchableOpacity
                                        style={styles.clearButton}
                                        onPress={() => handleInputChange('miltal', '')}
                                    >
                                        <MyText style={styles.clearButtonText}>×</MyText>
                                    </TouchableOpacity>
                                ) : null}
                            </View>
                        </View>

                        <View style={styles.inputGroupFull}>
                            <MyText style={styles.inputLabel}>Kommentar</MyText>
                            <TextInput
                                style={[styles.input, styles.commentInput, isMobile && styles.inputMobile]}
                                value={formData.comment}
                                onChangeText={(text) => handleInputChange('comment', text)}
                                placeholder="Skriv kommentar..."
                                placeholderTextColor="#6c6c6c"
                                multiline
                                numberOfLines={3}
                            />
                        </View>
                    </>
                )}

                {/* Action buttons */}
                {!isDesktop && (
                    <View style={[styles.actionButtons, isMobile && styles.actionButtonsMobile]}>
                        <TouchableOpacity
                            style={[styles.saveButton, isMobile && styles.saveButtonMobile, createMutation.isPending && styles.saveButtonDisabled]}
                            onPress={handleSave}
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? (
                                <ActivityIndicator size="small" color={myColors.white} />
                            ) : (
                                <MyText style={[styles.saveButtonText, isMobile && styles.saveButtonTextMobile]}>SPARA</MyText>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.linkButton}
                            onPress={openBlocketPrice}
                        >
                            <MyText style={[styles.linkButtonText, isMobile && styles.linkButtonTextMobile]}>PRIS PÅ BLOCKET</MyText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.linkButton}
                            onPress={commentsState.toggleState}
                        >
                            <MyText style={[styles.linkButtonText, isMobile && styles.linkButtonTextMobile]}>
                                {commentsState.isOpen ? 'DÖLJ ALLA INTERNA KOMMENTARER' : 'VISA ALLA INTERNA KOMMENTARER'}
                            </MyText>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Desktop action buttons */}
            {isDesktop && (
                <View style={styles.actionButtonsDesktop}>
                    <TouchableOpacity
                        style={styles.desktopLinkButton}
                        onPress={openBlocketPrice}
                    >
                        <MyText style={styles.desktopLinkButtonText}>PRIS PÅ BLOCKET</MyText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.desktopLinkButton}
                        onPress={commentsState.toggleState}
                    >
                        <MyText style={styles.desktopLinkButtonText}>
                            {commentsState.isOpen ? 'DÖLJ ALLA INTERNA KOMMENTARER' : 'VISA ALLA INTERNA KOMMENTARER'}
                        </MyText>
                    </TouchableOpacity>
                </View>
            )}

            {/* Comments history section */}
            <Animated.View style={[
                styles.commentsAnimationWrapper,
                {
                    maxHeight: commentsHeightAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 2000], // Use maxHeight for flexible content
                    }),
                    opacity: commentsFadeAnim,
                }
            ]}>
                <View style={[styles.commentsSection, isDesktop && styles.commentsSectionDesktop]}>
                    {isDesktop && (
                        <MyText style={styles.commentsSectionTitle}>Intärna kommentarer</MyText>
                    )}
                    {isLoadingRecords ? (
                        <View style={styles.commentsLoadingContainer}>
                            <ActivityIndicator size="small" color={myColors.primary.main} />
                            <MyText style={styles.loadingText}>Laddar kommentarer...</MyText>
                        </View>
                    ) : comments.length > 0 ? (
                    <View style={isDesktop ? styles.commentsScrollContainer : {}}>
                        {comments.map((comment, index) => {
                            return (
                            <View key={index} style={[styles.commentCard, isDesktop && styles.commentCardDesktop]}>
                                {isDesktop ? (
                                    <View style={[styles.commentHeader, styles.commentHeaderDesktop]}>
                                        <View style={styles.commentUserInfo}>
                                            <View style={styles.commentDesktopRow}>
                                                <MyText style={styles.commentLabelDesktop}>Namn:</MyText>
                                                <MyText style={styles.commentValueDesktop}>{comment.name || ''}</MyText>
                                            </View>
                                            <View style={styles.commentDesktopRow}>
                                                <MyText style={styles.commentLabelDesktop}>Telefonnummer:</MyText>
                                                <MyText style={styles.commentValueDesktop}>{comment.telefon || ''}</MyText>
                                            </View>
                                            <View style={styles.commentDesktopRow}>
                                                <MyText style={styles.commentLabelDesktop}>Mejladress:</MyText>
                                                <MyText style={styles.commentValueDesktop}>{comment.email || ''}</MyText>
                                            </View>
                                        </View>
                                        <View style={styles.commentDetailsDesktop}>
                                            <MyText style={styles.commentDetailText}>Inpris : {comment.price_in || '-'} Sek</MyText>
                                            <MyText style={styles.commentDetailText}>Utpris : {comment.price_out || '-'} Sek</MyText>
                                            <MyText style={styles.commentDetailText}>Miltal : {comment.mileage ? Math.round(comment.mileage / 10) : '-'} mil</MyText>
                                        </View>
                                    </View>
                                ) : (
                                    <View style={styles.commentMobileContainer}>
                                        <View style={styles.commentInfoRow}>
                                            <MyText style={styles.commentLabelBold}>Namn:</MyText>
                                            <MyText style={styles.commentValueMobile}>{comment.name || ''}</MyText>
                                        </View>
                                        <View style={styles.commentInfoRow}>
                                            <MyText style={styles.commentLabelBold}>Telefonnummer:</MyText>
                                            <MyText style={styles.commentValueMobile}>{comment.telefon || ''}</MyText>
                                        </View>
                                        <View style={styles.commentInfoRow}>
                                            <MyText style={styles.commentLabelBold}>Mejladress:</MyText>
                                            <MyText style={styles.commentValueMobile}>{comment.email || ''}</MyText>
                                        </View>
                                    </View>
                                )}
                                {!isDesktop && (
                                    <View style={styles.commentDetails}>
                                        <View style={styles.commentRow}>
                                            <MyText style={styles.commentLabel}>Inpris : </MyText>
                                            <MyText style={styles.commentValue}>{comment.price_in || '-'} Sek</MyText>
                                        </View>
                                        <View style={styles.commentRow}>
                                            <MyText style={styles.commentLabel}>Utpris : </MyText>
                                            <MyText style={styles.commentValue}>{comment.price_out || '-'} Sek</MyText>
                                        </View>
                                        <View style={styles.commentRow}>
                                            <MyText style={styles.commentLabel}>Miltal : </MyText>
                                            <MyText style={styles.commentValue}>{comment.mileage ? Math.round(comment.mileage / 10) : '-'} mil</MyText>
                                        </View>
                                    </View>
                                )}
                                {comment.comments && (
                                    <MyText style={[styles.commentText, isDesktop && styles.commentTextDesktop]}>
                                        "{comment.comments}"
                                    </MyText>
                                )}
                                {comment.created_by && (
                                    <View style={styles.commentMetaContainer}>
                                        <MyText style={styles.commentMetaText}>
                                            Skapad av {comment.created_by} • {comment.created_at ? new Date(comment.created_at).toLocaleDateString('sv-SE') : ''}
                                        </MyText>
                                    </View>
                                )}
                                {isDesktop && index < comments.length - 1 && (
                                    <View style={styles.commentDivider} />
                                )}
                            </View>
                        )})}
                    </View>
                    ) : (
                        <View style={styles.emptyCommentsContainer}>
                            <MyText style={styles.emptyCommentsText}>Inga kommentarer än</MyText>
                        </View>
                    )}
                </View>
            </Animated.View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 0,
    },
    containerMobile: {
        padding: 0,
    },
    containerDesktop: {
        padding: 0,
    },
    contentWrapper: {
        marginTop: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 200,
    },
    headerTitle: {
        fontSize: isDesktopWeb() ? 18 : 15,
        lineHeight: 24,
        color: myColors.text.primary,
        marginBottom: 20,
        fontFamily: 'Poppins',
    },
    headerTitleMobile: {
        fontSize: 15,
        lineHeight: 24,
        textTransform: 'capitalize',
        marginBottom: 25,
        paddingHorizontal: 0,
        paddingTop: 10,
    },
    headerTitleDesktop: {
        fontSize: 20,
        lineHeight: 30,
        color: '#262524',
        marginBottom: 30,
        paddingHorizontal: 0,
    },
    contactAnimationWrapper: {
        overflow: 'hidden',
        marginBottom: 5,
    },
    contactSection: {
        marginBottom: 0,
        paddingHorizontal: 0,
    },
    contactSectionDesktop: {
        paddingHorizontal: 0,
        marginBottom: 20,
    },
    inputRow: {
        flexDirection: isDesktopWeb() ? 'row' : 'column',
        gap: 12,
        marginBottom: isDesktopWeb() ? 24 : 16,
    },
    inputRowMobile: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    inputRowDesktop: {
        flexDirection: 'row',
        gap: 25,
        marginBottom: 0,
        alignItems: 'flex-end',
    },
    inputGroup: {
        flex: isDesktopWeb() ? 1 : undefined,
        marginBottom: isDesktopWeb() ? 0 : 16,
    },
    inputGroupMobile: {
        flex: 1,
        marginBottom: 0,
    },
    inputGroupDesktop: {
        width: 340,
        marginBottom: 0,
    },
    inputGroupSmallDesktop: {
        width: 206,
        marginBottom: 0,
    },
    inputGroupMediumDesktop: {
        width: 346,
        marginBottom: 0,
    },
    inputGroupEmail: {
        width: 506,
    },
    inputGroupFull: {
        marginBottom: 10,
        paddingHorizontal: 0,
    },
    inputLabel: {
        fontSize: 16,
        color: '#181818',
        marginBottom: 8,
        fontWeight: '400',
        fontFamily: 'Inter',
    },
    inputLabelDesktop: {
        fontSize: 15,
        lineHeight: 24,
        color: '#262524',
        fontFamily: 'Poppins',
        textTransform: 'capitalize',
        marginBottom: 2,
    },
    input: {
        borderRadius: 8,
        backgroundColor: myColors.white,
        borderWidth: 1,
        borderColor: '#e6e6f1',
        padding: isDesktopWeb() ? 16 : 20,
        fontSize: 14,
        color: myColors.text.primary,
        ...createWebStyles({ outline: 'none' }),
    },
    inputMobile: {
        paddingVertical: 20,
        paddingHorizontal: 16,
        color: '#262524',
    },
    inputDesktop: {
        borderRadius: 10,
        backgroundColor: '#fafafa',
        borderColor: '#e6e6f1',
        paddingVertical: 15,
        paddingHorizontal: 20,
        fontSize: 13,
        lineHeight: 20,
        height: 50,
    },
    inputEmailDesktop: {
        width: '100%',
    },
    commentInput: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    toggleButton: {
        marginBottom: 25,
        alignSelf: 'stretch',
    },
    toggleButtonMobile: {
        alignItems: 'center',
        paddingHorizontal: 0,
    },
    toggleButtonDesktop: {
        alignSelf: 'flex-start',
        marginBottom: 30,
    },
    toggleButtonText: {
        color: myColors.primary.main,
        fontSize: 14,
        fontWeight: 'bold',
    },
    toggleButtonTextMobile: {
        fontSize: 13,
        textDecorationLine: 'underline',
        lineHeight: 20,
        textTransform: 'uppercase',
        color: '#013d7b',
        textAlign: 'center',
        fontFamily: 'Inter',
        fontWeight: 'bold',
    },
    toggleButtonTextDesktop: {
        fontSize: 14,
        lineHeight: 20,
        textTransform: 'uppercase',
        color: '#013d7b',
        textDecorationLine: 'underline',
        fontFamily: 'Inter',
        fontWeight: 'bold',
    },
    formSection: {
        backgroundColor: myColors.white,
        borderRadius: 10,
        padding: isDesktopWeb() ? 24 : 20,
        ...createWebStyles({
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }),
    },
    formSectionMobile: {
        backgroundColor: 'transparent',
        borderRadius: 0,
        padding: 0,
        paddingTop: 0,
        ...createWebStyles({
            boxShadow: 'none',
        }),
    },
    formSectionDesktop: {
        backgroundColor: myColors.white,
        borderRadius: 10,
        padding: 25,
        borderWidth: 1,
        borderColor: '#e9ecef',
        ...createWebStyles({
            boxShadow: 'none',
        }),
    },
    actionButtons: {
        flexDirection: isDesktopWeb() ? 'row' : 'column',
        gap: 16,
        marginTop: 24,
        alignItems: isDesktopWeb() ? 'center' : 'stretch',
    },
    actionButtonsMobile: {
        flexDirection: 'column',
        gap: 12,
        marginTop: 25,
        alignItems: 'center',
    },
    saveButton: {
        backgroundColor: myColors.primary.main,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 100,
    },
    saveButtonMobile: {
        backgroundColor: '#181818',
        width: '100%',
        maxWidth: 350,
        height: 50,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 8,
    },
    saveButtonDesktop: {
        backgroundColor: '#013d7b',
        borderRadius: 10,
        paddingVertical: 19,
        paddingHorizontal: 20,
        width: 172,
        height: 58,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: myColors.white,
        fontSize: 14,
        fontWeight: 'bold',
    },
    saveButtonTextMobile: {
        fontSize: 16,
        lineHeight: 20,
        textTransform: 'uppercase',
        fontFamily: 'Inter',
    },
    saveButtonTextDesktop: {
        color: myColors.white,
        fontSize: 16,
        lineHeight: 20,
        textTransform: 'uppercase',
        fontFamily: 'Inter',
        fontWeight: 'bold',
    },
    linkButton: {
        paddingVertical: 8,
    },
    linkButtonText: {
        color: myColors.primary.main,
        fontSize: 14,
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
    linkButtonTextMobile: {
        color: '#013d7b',
        fontSize: 13,
        textDecorationLine: 'underline',
        lineHeight: 20,
        textTransform: 'uppercase',
        fontFamily: 'Inter',
    },
    commentsSection: {
        marginTop: 24,
        marginBottom: 10,
    },
    commentCard: {
        backgroundColor: myColors.white,
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        ...createWebStyles({
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }),
    },
    commentHeader: {
        marginBottom: 12,
    },
    commentName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: myColors.text.primary,
    },
    commentPhone: {
        fontSize: 14,
        color: myColors.baseColors.light3,
    },
    commentDetails: {
        marginBottom: 12,
    },
    commentRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    commentLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: myColors.text.primary,
    },
    commentValue: {
        fontSize: 14,
        color: myColors.text.primary,
        fontWeight: '500',
    },
    commentText: {
        fontSize: 14,
        color: myColors.text.primary,
        fontStyle: 'italic',
        lineHeight: 20,
        fontWeight: '400',
    },
    actionButtonsDesktop: {
        flexDirection: 'row',
        gap: 24,
        marginTop: 30,
        marginBottom: 30,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    desktopLinkButton: {
        flex: 1,
        backgroundColor: 'rgba(1, 61, 123, 0.1)',
        borderRadius: 10,
        paddingVertical: 19,
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 0,
    },
    desktopLinkButtonText: {
        color: '#013d7b',
        fontSize: 16,
        lineHeight: 20,
        textTransform: 'uppercase',
        fontFamily: 'Inter',
        fontWeight: 'bold',
    },
    commentsSectionDesktop: {
        backgroundColor: myColors.white,
        borderRadius: 10,
        padding: 25,
        borderWidth: 1,
        borderColor: '#e9ecef',
        marginTop: 30,
        marginBottom: 10,
    },
    commentsSectionTitle: {
        fontSize: 20,
        lineHeight: 30,
        color: '#262524',
        fontFamily: 'Poppins',
        marginBottom: 30,
    },
    commentsScrollContainer: {
        maxHeight: 262,
        overflow: 'scroll',
        ...createWebStyles({
            overflowY: 'auto',
            overflowX: 'hidden',
        }),
    },
    commentCardDesktop: {
        backgroundColor: 'transparent',
        borderRadius: 0,
        padding: 0,
        marginBottom: 20,
        ...createWebStyles({
            boxShadow: 'none',
        }),
    },
    commentHeaderDesktop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    commentUserInfo: {
        gap: 8,
    },
    commentNameDesktop: {
        fontSize: 15,
        lineHeight: 22,
        fontFamily: 'Poppins',
        color: '#262524',
        fontWeight: '400',
    },
    commentPhoneDesktop: {
        fontSize: 15,
        lineHeight: 22,
        fontFamily: 'Poppins',
        color: '#262524',
    },
    commentEmail: {
        fontSize: 15,
        lineHeight: 22,
        fontFamily: 'Poppins',
        color: '#262524',
        textTransform: 'lowercase',
    },
    commentEmailMobile: {
        fontSize: 14,
        lineHeight: 20,
        color: myColors.baseColors.light3,
    },
    commentDetailsDesktop: {
        flexDirection: 'row',
        gap: 60,
        alignItems: 'center',
    },
    commentDetailText: {
        fontSize: 14,
        lineHeight: 28,
        color: '#9ea6ba',
        fontFamily: 'Inter',
    },
    commentTextDesktop: {
        fontSize: 14,
        lineHeight: 24,
        color: '#687693',
        fontFamily: 'Inter',
        fontStyle: 'normal',
        marginTop: -5,
    },
    commentDivider: {
        height: 1,
        backgroundColor: '#e6e6f1',
        marginTop: 15,
    },
    commentsAnimationWrapper: {
        overflow: 'hidden',
        marginBottom: isDesktopWeb() ? 20 : 10,
    },
    inputWithClear: {
        position: 'relative',
        width: '100%',
    },
    inputWithClearButton: {
        paddingRight: 40,
    },
    clearButton: {
        position: 'absolute',
        right: 10,
        top: '50%',
        transform: [{ translateY: -15 }],
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    clearButtonDesktop: {
        right: 10,
        transform: [{ translateY: -15 }],
    },
    clearButtonText: {
        fontSize: 20,
        color: '#666',
        fontWeight: 'bold',
        lineHeight: 20,
    },
    commentInfoRow: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    commentLabelBold: {
        fontSize: 14,
        fontWeight: 'bold',
        color: myColors.text.primary,
        marginRight: 5,
    },
    commentValueMobile: {
        fontSize: 14,
        color: myColors.text.primary,
    },
    commentMobileContainer: {
        marginBottom: 12,
    },
    commentDesktopRow: {
        flexDirection: 'row',
        marginBottom: 0,
    },
    commentLabelDesktop: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#262524',
        fontFamily: 'Poppins',
        marginRight: 5,
    },
    commentValueDesktop: {
        fontSize: 15,
        color: '#262524',
        fontFamily: 'Poppins',
    },
    commentsLoadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: myColors.text.secondary,
    },
    emptyCommentsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyCommentsText: {
        fontSize: 14,
        color: myColors.text.secondary,
        fontStyle: 'italic',
    },
    commentMetaContainer: {
        marginTop: 12,
        paddingTop: 8,
    },
    commentMetaText: {
        fontSize: 13,
        color: '#687693',
        fontWeight: '400',
        opacity: 0.9,
    },
});

export default BilvarderingPro;