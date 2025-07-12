import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Alert, TextInput, LayoutAnimation, Platform, UIManager, Animated, Dimensions } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { Entypo, Ionicons } from '@expo/vector-icons'
import SimpleHeader from '@/components/common/SimpleHeader'
import { router } from 'expo-router'
import MyText from '@/components/common/MyText'
import MyButton from '@/components/common/MyButton'
import { myColors } from '@/constants/MyColors'
import { BORDER_RADIUS } from '@/constants/Dimentions'
import { useGarages, type Garage as APIGarage, type GarageCar, useAddCarToGarage, useCreateGarage, useDeleteCarFromGarage, useDeleteGarage } from '@/Services/api/hooks/garage.hooks'
import { myStyles } from '@/Styles/myStyles'
import RegistrationNumberInput from '@/components/common/RegistrationNumberInput'
import { useAuth } from '@/Services/api/context/auth.context'
import { useIsFocused } from '@react-navigation/native'
import KeyboardAvoidingWrapper from '@/components/common/KeyboardAvoidingWrapper'
import { LoginPopup } from '@/components/auth'
import { Swipeable as RNGHSwipeable } from 'react-native-gesture-handler'
import AsyncStorage from '@react-native-async-storage/async-storage'
import FooterWrapper from '@/components/common/ScreenWrapper'
import { IconAdd, IconCheckmark, IconChevronDown, IconChevronUp, IconClose, IconHourglass, IconTrashOutline, IconWarning } from '@/assets/icons'
import { isDesktopWeb, isMobileWeb } from '@/utils/deviceInfo'
import { H1, H2, H3, P, SemanticMain } from '@/components/common/SemanticText'
import DesktopViewWrapper from '@/components/common/DesktopViewWrapper'
import HeaderWithSearch from '@/components/common/HeaderWithSearch'
import InlineAlert from '@/components/common/InlineAlert'

const STORAGE_KEY = 'garageExpansionState';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
const isMobile = !isDesktopWeb();

// Types
interface Vehicle {
    id: string
    registration: string
    brand: string
    model: string
    hasWarning?: boolean
}

interface UIGarage {
    id: string
    name: string
    vehicles: Vehicle[]
    isExpanded: boolean
}

interface GarageHeaderProps {
    garage: UIGarage
    isDeleting: boolean
    isSwipedOpen: boolean
    onToggleExpansion: (garageId: string) => void
    onDelete: (garageId: string, garageName: string) => void
    onSwipeStateChange: (garageId: string, isOpen: boolean) => void
}

interface VehicleItemProps {
    vehicle: Vehicle
    garageId: string
    isDeleting: boolean
    isSwipedOpen: boolean
    onDelete: (garageId: string, carId: string, registration: string) => void
    onSwipeStateChange: (vehicleId: string, isOpen: boolean) => void
    onPress: (vehicle: Vehicle) => void
}

interface InlineAlertConfig {
    title: string
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
    buttons: Array<{
        text: string
        onPress: () => void
        style?: 'default' | 'cancel' | 'destructive'
    }>
}

// Components
const GarageHeader: React.FC<GarageHeaderProps> = ({
    garage,
    isDeleting,
    isSwipedOpen,
    onToggleExpansion,
    onDelete,
    onSwipeStateChange
}) => {
    const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
        const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] })
        const opacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] })
        return (
            <TouchableOpacity
                style={styles.garageRightAction}
                onPress={() => onDelete(garage.id, garage.name)}
                disabled={isDeleting}
                activeOpacity={0.8}
            >
                <Animated.View style={{ transform: [{ scale }], opacity }}>
                    {/* <Ionicons name={isDeleting ? 'hourglass' : 'trash-outline'} size={24} color={myColors.white} /> */}
                    {isDeleting ? <IconHourglass
                        color={myColors.white}
                        size={24}
                    /> : <IconTrashOutline
                        color={myColors.white}
                        size={24}
                    />}
                </Animated.View>
            </TouchableOpacity>
        )
    }

    // Check if this is the default garage (case-insensitive check)
    const isDefaultGarage = garage.name.toLowerCase() === 'mina fordon' || garage.name === 'Mina Fordon';

    return (
        <SwipeableWrapper
            friction={2}
            renderRightActions={!isDefaultGarage ? renderRightActions : undefined}
            overshootRight={false}
            rightThreshold={40}
            onSwipeableOpen={() => onSwipeStateChange(garage.id, true)}
            onSwipeableClose={() => onSwipeStateChange(garage.id, false)}
        >
            <View style={styles.garageSectionHeaderContainer}>
                <TouchableOpacity
                    style={styles.garageSectionHeader}
                    onPress={() => onToggleExpansion(garage.id)}
                    onLongPress={Platform.OS !== 'web' && !isDefaultGarage ? () => onDelete(garage.id, garage.name) : undefined}
                    delayLongPress={600}
                >
                    <MyText fontFamily="Poppins" style={styles.sectionTitle}>{garage.name}</MyText>

                    <View style={styles.garageSectionHeaderRight}>
                        {/* Web-only delete button - positioned before chevron */}
                        {Platform.OS === 'web' && !isDefaultGarage && (
                            <TouchableOpacity
                                style={[styles.webDeleteButtonNice, Platform.OS === 'web' && { ':hover': { backgroundColor: myColors.error + '15', transform: 'scale(1.05)' } } as any]}
                                onPress={(e) => {
                                    e.stopPropagation();
                                    onDelete(garage.id, garage.name);
                                }}
                                disabled={isDeleting}
                                activeOpacity={0.8}
                            >
                                {isDeleting ? <IconHourglass
                                    color={myColors.error}
                                    size={18}
                                /> : <IconTrashOutline
                                    color={myColors.error}
                                    size={18}
                                />}
                            </TouchableOpacity>
                        )}

                        {/* Chevron arrow */}
                        {garage.isExpanded ? <IconChevronUp
                            color={myColors.black}
                            size={20}
                        /> : <IconChevronDown
                            color={myColors.black}
                            size={20}
                        />}
                    </View>
                </TouchableOpacity>
            </View>
        </SwipeableWrapper>
    )
}

const VehicleItem: React.FC<VehicleItemProps> = ({
    vehicle,
    garageId,
    isDeleting,
    isSwipedOpen,
    onDelete,
    onSwipeStateChange,
    onPress
}) => {
    const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
        const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] })
        const opacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] })
        return (
            <TouchableOpacity
                style={styles.rightAction}
                onPress={() => onDelete(garageId, vehicle.id, vehicle.registration)}
                disabled={isDeleting}
                activeOpacity={0.8}
            >
                <Animated.View style={{ transform: [{ scale }], opacity }}>
                    {/* <Ionicons name={isDeleting ? 'hourglass' : 'trash-outline'} size={24} color={myColors.white} /> */}
                    {isDeleting ? <IconHourglass
                        color={myColors.white}
                        size={24}
                    /> : <IconTrashOutline
                        color={myColors.white}
                        size={24}
                    />}
                </Animated.View>
            </TouchableOpacity>
        )
    }

    return (
        <View style={styles.vehicleItemContainer}>
            <SwipeableWrapper
                friction={2}
                renderRightActions={renderRightActions}
                overshootRight={false}
                rightThreshold={40}
                onSwipeableOpen={() => onSwipeStateChange(vehicle.id, true)}
                onSwipeableClose={() => onSwipeStateChange(vehicle.id, false)}
            >
                <TouchableOpacity
                    style={styles.vehicleItem}
                    onPress={() => onPress(vehicle)}
                    onLongPress={Platform.OS !== 'web' ? () => onDelete(garageId, vehicle.id, vehicle.registration) : undefined}
                    delayLongPress={600}
                >
                    <View style={styles.vehicleInfoContainer}>
                        <View style={styles.vehicleInfo}>
                            <MyText style={styles.regNumber}>{vehicle.registration}</MyText>
                            <MyText style={styles.separator}>-</MyText>
                            <MyText style={styles.carModel}>{vehicle.brand} {vehicle.model}</MyText>

                            {/* Web-only delete button - inline with vehicle info */}
                            {Platform.OS === 'web' && (
                                <TouchableOpacity
                                    style={[styles.webDeleteButtonInline, Platform.OS === 'web' && { ':hover': { backgroundColor: myColors.error + '15', transform: 'scale(1.1)' } } as any]}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        onDelete(garageId, vehicle.id, vehicle.registration);
                                    }}
                                    disabled={isDeleting}
                                    activeOpacity={0.8}
                                >
                                    {isDeleting ? <IconHourglass
                                        color={myColors.error}
                                        size={16}
                                    /> : <IconTrashOutline
                                        color={myColors.error}
                                        size={16}
                                    />}
                                </TouchableOpacity>
                            )}
                        </View>

                        {vehicle.hasWarning && (
                            <IconWarning
                                color={myColors.warning}
                                size={20}
                            />
                        )}
                    </View>
                </TouchableOpacity>
            </SwipeableWrapper>
        </View>
    )
}

function SwipeableWrapper(props: any) {
    if (Platform.OS === 'web') {
        // Simply render children without swipe behaviour on web
        const { children } = props;
        return <>{children}</>;
    }
    // @ts-ignore - props type mismatch isn't critical here
    return <RNGHSwipeable {...props} />;
}

// Main Component
const Minafordon: React.FC = () => {
    // State
    const isFocused = useIsFocused()
    const [garages, setGarages] = useState<UIGarage[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddCarInput, setShowAddCarInput] = useState<string | null>(null)
    const [addingCar, setAddingCar] = useState(false)
    const [showNewGarageInput, setShowNewGarageInput] = useState(false)
    const [newGarageName, setNewGarageName] = useState('')
    const [isCreatingGarage, setIsCreatingGarage] = useState(false)
    const [showLoginPopup, setShowLoginPopup] = useState(false)
    const [swipedItemId, setSwipedItemId] = useState<string | null>(null)
    const [deletingCarId, setDeletingCarId] = useState<string | null>(null)
    const [swipedGarageId, setSwipedGarageId] = useState<string | null>(null)
    const [deletingGarageId, setDeletingGarageId] = useState<string | null>(null)
    const [expansionState, setExpansionState] = useState<{ [id: string]: boolean }>({})
    const [hasLoadedExpansionState, setHasLoadedExpansionState] = useState(false)
    const [inlineAlert, setInlineAlert] = useState<InlineAlertConfig & { visible: boolean }>({
        visible: false,
        title: '',
        message: '',
        type: 'info',
        buttons: []
    })

    // Hooks
    const { isAuthenticated, isGuestMode } = useAuth()
    const { data: apiGarages, isLoading, error, refetch } = useGarages({ enabled: isFocused })
    const addCarToGarageMutation = useAddCarToGarage()
    const createGarageMutation = useCreateGarage()
    const deleteCarFromGarageMutation = useDeleteCarFromGarage()
    const deleteGarageMutation = useDeleteGarage()

    // Effects
    useEffect(() => {
        const loadExpansionState = async () => {
            try {
                const stored = await AsyncStorage.getItem(STORAGE_KEY)
                if (stored) {
                    setExpansionState(JSON.parse(stored))
                }
            } catch (e) {
                // console.error('Failed to load garage expansion state', e)
            } finally {
                setHasLoadedExpansionState(true)
            }
        }
        loadExpansionState()
    }, [])

    useEffect(() => {
        if (apiGarages) {
            const transformedGarages: UIGarage[] = apiGarages.map((apiGarage: APIGarage) => {
                const savedExpanded = expansionState.hasOwnProperty(apiGarage.id)
                    ? expansionState[apiGarage.id]
                    : apiGarage.name === 'Mina Fordon'

                return {
                    id: apiGarage.id,
                    name: apiGarage.name,
                    isExpanded: savedExpanded,
                    vehicles: apiGarage.GarageData?.map((car: GarageCar) => ({
                        id: car.id,
                        registration: car.reg_name,
                        brand: car.brand || '',
                        model: car.model || '',
                        hasWarning: false
                    })) || []
                }
            })

            const mergedExpansionState = { ...expansionState }
            transformedGarages.forEach(g => {
                if (!mergedExpansionState.hasOwnProperty(g.id)) {
                    mergedExpansionState[g.id] = g.isExpanded
                }
            })

            if (hasLoadedExpansionState && Object.keys(mergedExpansionState).length !== Object.keys(expansionState).length) {
                setExpansionState(mergedExpansionState)
                persistExpansionState(mergedExpansionState)
            }

            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
            setGarages(transformedGarages)
        }
        setLoading(isLoading)
    }, [apiGarages, isLoading, expansionState, hasLoadedExpansionState])

    // Helper Functions
    const persistExpansionState = async (stateObj: { [id: string]: boolean }) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stateObj))
        } catch (e) {
            // console.error('Failed to save garage expansion state', e)
        }
    }

    const handleGoBack = () => {
        try {
            if (router.canGoBack()) {
                router.back()
            } else {
                router.replace('/')
            }
        } catch (err) {
            router.replace('/')
        }
    }

    const handleAddVehicle = (garageId?: string) => {
        if (!isAuthenticated || isGuestMode) {
            if (typeof global !== 'undefined') {
                global.returnToPath = '/mina-fordon'
            }
            setShowLoginPopup(true)
            return
        }

        if (garageId) {
            setShowAddCarInput(garageId)
        } else {
            setShowNewGarageInput(true)
        }
    }

    const handleCancelAddCar = () => {
        setShowAddCarInput(null)
    }

    const handleCancelNewGarage = () => {
        setShowNewGarageInput(false)
        setNewGarageName('')
    }

    const createNewGarage = async () => {
        if (newGarageName.trim() === '') return

        if (!isAuthenticated || isGuestMode) {
            if (typeof global !== 'undefined') {
                global.returnToPath = '/mina-fordon'
            }
            setShowLoginPopup(true)
            return
        }

        try {
            setIsCreatingGarage(true)
            const result = await createGarageMutation.mutateAsync({
                name: newGarageName.trim()
            })

            if (result) {
                setExpansionState(prev => {
                    const newState = { ...prev, [result.id]: true }
                    persistExpansionState(newState)
                    return newState
                })
                refetch()
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || "Det gick inte att skapa ett nytt garage. Försök igen."
            showInlineAlert({
                title: "Fel",
                message: errorMessage,
                type: 'error',
                buttons: [{ text: 'OK', onPress: () => { } }]
            })
        } finally {
            setNewGarageName('')
            setShowNewGarageInput(false)
            setIsCreatingGarage(false)
        }
    }

    const addCarToGarage = async (garageId: string, registrationNumber: string) => {
        if (addingCar) return

        if (!isAuthenticated || isGuestMode) {
            if (typeof global !== 'undefined') {
                global.returnToPath = '/mina-fordon'
            }
            setShowLoginPopup(true)
            return
        }

        setAddingCar(true)

        try {
            await addCarToGarageMutation.mutateAsync({
                garageId,
                data: {
                    reg_name: registrationNumber.replace(/\s/g, ''),
                }
            })
            refetch()
            setShowAddCarInput(null)
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Ett fel uppstod när fordonet skulle läggas till.'
            showInlineAlert({
                title: 'Fel',
                message: errorMessage,
                type: 'error',
                buttons: [{ text: 'OK', onPress: () => { } }]
            })
        } finally {
            setAddingCar(false)
        }
    }

    const handleRegistrationSubmit = (carData: any) => {
        if (showAddCarInput && carData?.regNumber) {
            addCarToGarage(showAddCarInput, carData.regNumber)
        }
    }

    const handleRefresh = () => {
        refetch()
    }

    const toggleGarageExpansion = (garageId: string) => {
        setGarages(prevGarages =>
            prevGarages.map(garage =>
                garage.id === garageId
                    ? { ...garage, isExpanded: !garage.isExpanded }
                    : garage
            )
        )

        setExpansionState(prev => {
            const newState = { ...prev, [garageId]: !prev[garageId] }
            persistExpansionState(newState)
            return newState
        })
    }

    const handleVehiclePress = (vehicle: Vehicle) => {
        try {
            router.push({
                pathname: '/(main)/biluppgifter/[regnr]',
                params: {
                    regnr: vehicle.registration,
                }
            })
        } catch (err) {
            // console.error('Navigation error:', err)
        }
    }

    const handleDeleteCar = async (garageId: string, carId: string, carRegistration: string) => {
        showInlineAlert({
            title: 'Ta bort fordon',
            message: `Är du säker på att du vill ta bort ${carRegistration} från detta garage?`,
            type: 'warning',
            buttons: [
                {
                    text: 'Nej',
                    onPress: () => { },
                    style: 'cancel'
                },
                {
                    text: 'Ja',
                    onPress: async () => {
                        try {
                            setDeletingCarId(carId)
                            await deleteCarFromGarageMutation.mutateAsync({
                                garageId,
                                carId
                            })
                            setSwipedItemId(null)
                            refetch()
                            showInlineAlert({
                                title: 'Framgång',
                                message: 'Fordonet har tagits bort från garaget.',
                                type: 'success',
                                buttons: [{ text: 'OK', onPress: () => { } }]
                            })
                        } catch (error: any) {
                            const errorMessage = error?.response?.data?.message || error?.message || 'Ett fel uppstod när fordonet skulle tas bort.'
                            showInlineAlert({
                                title: 'Fel',
                                message: errorMessage,
                                type: 'error',
                                buttons: [{ text: 'OK', onPress: () => { } }]
                            })
                        } finally {
                            setDeletingCarId(null)
                        }
                    },
                    style: 'destructive'
                }
            ]
        })
    }

    const handleDeleteGarage = async (garageId: string, garageName: string) => {
        showInlineAlert({
            title: 'Ta bort garage',
            message: `Är du säker på att du vill ta bort garaget "${garageName}"? Detta kan inte ångras.`,
            type: 'warning',
            buttons: [
                {
                    text: 'Nej',
                    onPress: () => { },
                    style: 'cancel'
                },
                {
                    text: 'Ja',
                    onPress: async () => {
                        try {
                            setDeletingGarageId(garageId)
                            await deleteGarageMutation.mutateAsync(garageId)
                            setSwipedGarageId(null)
                            refetch()
                            showInlineAlert({
                                title: 'Framgång',
                                message: 'Garaget har tagits bort.',
                                type: 'success',
                                buttons: [{ text: 'OK', onPress: () => { } }]
                            })
                        } catch (error: any) {
                            const errorMessage = error?.response?.data?.message || error?.message || 'Det gick inte att ta bort garaget. Försök igen.'
                            showInlineAlert({
                                title: 'Fel',
                                message: errorMessage,
                                type: 'error',
                                buttons: [{ text: 'OK', onPress: () => { } }]
                            })
                        } finally {
                            setDeletingGarageId(null)
                        }
                    },
                    style: 'destructive'
                }
            ]
        })
    }

    const handleScrollViewPress = () => {
        if (swipedItemId) setSwipedItemId(null)
        if (swipedGarageId) setSwipedGarageId(null)
    }

    const handleSwipeStateChange = (vehicleId: string, isOpen: boolean) => {
        if (isOpen) {
            setSwipedItemId(vehicleId)
        } else if (swipedItemId === vehicleId) {
            setSwipedItemId(null)
        }
    }

    const handleGarageSwipeStateChange = (garageId: string, isOpen: boolean) => {
        if (isOpen) {
            setSwipedGarageId(garageId)
        } else if (swipedGarageId === garageId) {
            setSwipedGarageId(null)
        }
    }

    const showInlineAlert = (config: InlineAlertConfig) => {
        setInlineAlert({ ...config, visible: true })
    }

    const hideInlineAlert = () => {
        setInlineAlert(prev => ({ ...prev, visible: false }))
    }

    // New component for mobile header when garages exist
    const renderMobileHeader = () => {
        if (isDesktopWeb() || garages.length === 0) return null;

        return (
            <View style={styles.mobileHeaderContainer}>
                <MyText style={styles.mobileHeaderTitle}>Mina Fordon</MyText>
                <TouchableOpacity
                    onPress={() => handleAddVehicle()}
                    style={styles.mobileHeaderAddButton}
                    activeOpacity={0.7}
                >
                    <IconAdd color={myColors.white} size={24} />
                </TouchableOpacity>
            </View>
        );
    };

    // New component for mobile welcome section when authenticated but no garages
    const renderMobileWelcome = () => {
        return (
            <View style={styles.mobileWelcomeContainer}>
                <View style={styles.mobileWelcomeContent}>
                    <View style={styles.mobileWelcomeIcon}>
                        <IconAdd color={myColors.primary.main} size={32} />
                    </View>
                    <MyText style={styles.mobileWelcomeTitle}>
                        Välkommen till Mina Fordon!
                    </MyText>
                    <MyText style={styles.mobileWelcomeSubtitle}>
                        Håll koll på alla dina fordon på ett ställe. Få påminnelser om besiktning, service och viktig information.
                    </MyText>
                    <View style={styles.mobileWelcomeFeatures}>
                        <View style={styles.mobileFeatureItem}>
                            <IconWarning color={myColors.primary.main} size={16} />
                            <MyText style={styles.mobileFeatureText}>Smart påminnelser</MyText>
                        </View>
                        <View style={styles.mobileFeatureItem}>
                            <IconCheckmark color={myColors.primary.main} size={16} />
                            <MyText style={styles.mobileFeatureText}>Enkel Hantering</MyText>
                        </View>
                    </View>
                    <MyButton
                        title="Skapa ditt första garage"
                        onPress={() => handleAddVehicle()}
                        buttonStyle={styles.mobileWelcomeCTA}
                        textStyle={styles.mobileWelcomeCTAText}
                    />
                </View>
            </View>
        );
    };

    // Landing page for non-authenticated users (desktop and mobile)
    const renderDesktopLandingPage = () => {
        if (isAuthenticated) return null;

        return (
            <SemanticMain style={styles.landingContainer}>
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <H1 id="mina-fordon-hero-title" style={styles.heroTitle}>
                        Hantera Alla Dina Fordon på Ett Ställe
                    </H1>
                    <MyText style={styles.heroSubtitle}>
                        Få full kontroll över din fordonspark med påminnelser om besiktning, service och viktig information.
                        Spara tid och pengar genom att aldrig missa viktiga datum igen.
                    </MyText>
                    <View style={styles.heroButtons}>
                        <MyButton
                            title="Kom Igång Nu - Gratis"
                            onPress={() => setShowLoginPopup(true)}
                            buttonStyle={styles.primaryCTA}
                            textStyle={styles.primaryCTAText}
                        />
                    </View>
                </View>

                {/* Features Section */}
                <View style={styles.featuresSection}>
                    <H2 style={styles.sectionTitle}>Varför Välja Mina Fordon?</H2>
                    <View style={styles.featuresGrid}>
                        <View style={styles.featureCard}>
                            <View style={styles.featureIcon}>
                                <IconWarning color={myColors.primary.main} size={32} />
                            </View>
                            <H3 style={styles.featureTitle}>Smart Påminnelser</H3>
                            <P style={styles.featureDescription}>
                                Få automatiska påminnelser om besiktning, service och andra viktiga datum.
                                Missa aldrig ett viktigt tillfälle igen.
                            </P>
                        </View>

                        <View style={styles.featureCard}>
                            <View style={styles.featureIcon}>
                                <IconAdd color={myColors.primary.main} size={32} />
                            </View>
                            <H3 style={styles.featureTitle}>Enkel Hantering</H3>
                            <P style={styles.featureDescription}>
                                Lägg till obegränsat antal fordon i anpassade garage.
                                Organisera dina bilar, motorcyklar och andra fordon enkelt.
                            </P>
                        </View>

                        <View style={styles.featureCard}>
                            <View style={styles.featureIcon}>
                                <IconCheckmark color={myColors.primary.main} size={32} />
                            </View>
                            <H3 style={styles.featureTitle}>Alltid Uppdaterat</H3>
                            <P style={styles.featureDescription}>
                                Få tillgång till aktuell fordonsinformation direkt från våra källor.
                                Alla uppgifter hålls automatiskt uppdaterade.
                            </P>
                        </View>
                    </View>
                </View>

                {/* Benefits Section */}
                <View style={styles.benefitsSection}>
                    <H2 style={styles.sectionTitle}>Spara Tid och Pengar</H2>
                    <View style={styles.benefitsContent}>
                        <View style={styles.benefitsList}>
                            <View style={styles.benefitItem}>
                                <IconCheckmark color={myColors.success} size={20} />
                                <MyText style={styles.benefitText}>
                                    <MyText style={styles.benefitHighlight}>Undvik böter</MyText> - Få påminnelser innan besiktningen går ut
                                </MyText>
                            </View>
                            <View style={styles.benefitItem}>
                                <IconCheckmark color={myColors.success} size={20} />
                                <MyText style={styles.benefitText}>
                                    <MyText style={styles.benefitHighlight}>Spara tid</MyText> - All fordonsinformation på ett ställe
                                </MyText>
                            </View>
                            <View style={styles.benefitItem}>
                                <IconCheckmark color={myColors.success} size={20} />
                                <MyText style={styles.benefitText}>
                                    <MyText style={styles.benefitHighlight}>Organisera enkelt</MyText> - Skapa garage för olika typer av fordon
                                </MyText>
                            </View>
                            <View style={styles.benefitItem}>
                                <IconCheckmark color={myColors.success} size={20} />
                                <MyText style={styles.benefitText}>
                                    <MyText style={styles.benefitHighlight}>Alltid tillgängligt</MyText> - Använd från mobil, tablet eller dator
                                </MyText>
                            </View>
                        </View>
                        <View style={styles.benefitsImage}>
                            <View style={styles.mockupContainer}>
                                <MyText style={styles.mockupText}>📱 Din Fordonspark</MyText>
                                <View style={styles.mockupCard}>
                                    <MyText style={styles.mockupCardTitle}>🏠 Hemma Garage</MyText>
                                    <MyText style={styles.mockupCardItem}>🚗 ABC 123 - Volvo V70</MyText>
                                    <MyText style={styles.mockupCardItem}>🏍️ XYZ 456 - Yamaha MT-07</MyText>
                                </View>
                                <View style={styles.mockupCard}>
                                    <MyText style={styles.mockupCardTitle}>🏢 Företag</MyText>
                                    <MyText style={styles.mockupCardItem}>🚛 DEF 789 - Scania R500</MyText>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* CTA Section */}
                <View style={styles.ctaSection}>
                    <H2 style={styles.ctaTitle}>Börja Hantera Dina Fordon Idag</H2>
                    <MyText style={styles.ctaDescription}>
                        Gå med i tusentals nöjda användare som redan använder Mina Fordon för att hålla koll på sina fordon.
                        Helt gratis att komma igång!
                    </MyText>
                    <MyButton
                        title="Skapa Ditt Första Garage Nu"
                        onPress={() => setShowLoginPopup(true)}
                        buttonStyle={styles.finalCTA}
                        textStyle={styles.finalCTAText}
                    />
                    <MyText style={styles.ctaSubtext}>
                        Inga dolda avgifter • Avsluta när som helst • Säker och trygg
                    </MyText>
                </View>

                {/* SEO Content - Hide on mobile to save space */}
                {!isMobile && (
                    <View style={styles.seoSection}>
                        <H2 style={styles.seoTitle}>Fordonhantering - Enkelt och Effektivt</H2>
                        <MyText style={styles.seoText}>
                            Mina Fordon är den ultimata lösningen för dig som vill ha full kontroll över din fordonspark.
                            Oavsett om du äger en bil, flera bilar, motorcyklar eller tunga fordon, hjälper vår plattform dig
                            att organisera och hålla koll på allt på ett smidigt sätt.
                        </MyText>
                        <MyText style={styles.seoText}>
                            Med våra intelligenta påminnelser slipper du oroa dig för att missa viktiga datum som besiktning, serviceintervaller eller försäkringsförnyelser. Vi hämtar informationen automatiskt och ser till att den alltid är korrekt och uppdaterad – så att du kan känna dig trygg i att inget glöms bort
                        </MyText>
                        <MyText style={styles.seoText}>
                            Skapa anpassade garage för olika typer av fordon - hemma, på jobbet, eller för olika familjemedlemmar.
                            Varje garage kan innehålla obegränsat antal fordon, och du får en tydlig överblick över status
                            för varje enskilt fordon. Perfekt för privatpersoner såväl som företag med större fordonsflottor.
                        </MyText>
                    </View>
                )}
            </SemanticMain>
        );
    };

    // Render Functions
    const renderVehicleItem = (vehicle: Vehicle, garageId: string) => {
        const isDeleting = deletingCarId === vehicle.id
        const isSwipedOpen = swipedItemId === vehicle.id

        return (
            <VehicleItem
                key={vehicle.id}
                vehicle={vehicle}
                garageId={garageId}
                isDeleting={isDeleting}
                isSwipedOpen={isSwipedOpen}
                onDelete={handleDeleteCar}
                onSwipeStateChange={handleSwipeStateChange}
                onPress={handleVehiclePress}
            />
        )
    }

    const renderGarageSection = (garage: UIGarage) => (
        <View key={garage.id} style={styles.garageSection}>
            <GarageHeader
                garage={garage}
                isDeleting={deletingGarageId === garage.id}
                isSwipedOpen={swipedGarageId === garage.id}
                onToggleExpansion={toggleGarageExpansion}
                onDelete={handleDeleteGarage}
                onSwipeStateChange={handleGarageSwipeStateChange}
            />

            {garage.isExpanded && (
                <View style={styles.garageSectionContent}>
                    {garage.vehicles.length > 0 ? (
                        garage.vehicles.map(vehicle => renderVehicleItem(vehicle, garage.id))
                    ) : (
                        <MyText style={styles.noVehiclesText}>
                            Inga fordon i detta garage
                        </MyText>
                    )}

                    {showAddCarInput === garage.id ? (
                        <View style={styles.addCarInputContainer}>
                            <View style={styles.inputRow}>
                                <View style={styles.inputWrapper}>
                                    <RegistrationNumberInput
                                        placeholder="ABC 123"
                                        style={styles.registrationInput}
                                        onSearchResult={handleRegistrationSubmit}

                                    />
                                </View>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.confirmButton]}
                                    onPress={() => { }}
                                    disabled={addingCar}
                                >
                                    {/* <Ionicons
                                        name={addingCar ? "hourglass" : "checkmark"}
                                        size={20}
                                        color={myColors.white}
                                    /> */}
                                    {addingCar ? <IconHourglass
                                        color={myColors.white}
                                        size={20}
                                    /> : <IconCheckmark
                                        color={myColors.white}
                                        size={20}
                                    />}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.cancelButton]}
                                    onPress={handleCancelAddCar}
                                    disabled={addingCar}
                                >
                                    <IconClose
                                        color={myColors.white}
                                        size={20}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <MyButton
                            title="+ Lägg till fordon"
                            onPress={() => handleAddVehicle(garage.id)}
                            buttonStyle={styles.addVehicleButton}
                            textStyle={styles.addVehicleButtonText}
                        />
                    )}
                </View>
            )}
        </View>
    )

    // Error State
    if (error && !loading) {
        return (
            <>
                <LoginPopup
                    visible={showLoginPopup}
                    onClose={() => setShowLoginPopup(false)}
                    onLoginSuccess={() => {
                        setShowLoginPopup(false)
                        refetch()
                    }}
                />
                <FooterWrapper
                    bounces={false}
                    overScrollMode="never"
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    scrollEventThrottle={16}
                >
                    <SafeAreaView style={styles.container}>
                        <StatusBar barStyle="dark-content" backgroundColor={myColors.primary.main} />
                        {!isDesktopWeb() && !(isMobile && garages.length > 0) &&
                            <SimpleHeader
                                title="Mina Fordon"
                                onBackPress={handleGoBack}
                                rightComponent={
                                    <TouchableOpacity onPress={() => handleAddVehicle()} style={styles.addGarageButtonContainer}>
                                        <IconAdd
                                            color={myColors.text.primary}
                                            size={24}
                                            style={{}}
                                        />
                                    </TouchableOpacity>
                                }
                            />
                        }
                        <View style={styles.errorContainer}>
                            <MyText style={styles.errorText}>
                                Kunde inte ladda garage. Kontrollera din internetanslutning.
                            </MyText>
                            <MyButton
                                title="Försök igen"
                                onPress={handleRefresh}
                                buttonStyle={styles.retryButton}
                            />
                        </View>
                    </SafeAreaView>
                </FooterWrapper>
            </>
        )
    }

    // Loading State
    if (loading) {
        return (
            <>
                <LoginPopup
                    visible={showLoginPopup}
                    onClose={() => setShowLoginPopup(false)}
                    onLoginSuccess={() => {
                        setShowLoginPopup(false)
                        refetch()
                    }}
                />
                <FooterWrapper
                    bounces={false}
                    overScrollMode="never"
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    scrollEventThrottle={16}
                >
                    <SafeAreaView style={styles.container}>
                        <StatusBar barStyle="dark-content" backgroundColor={myColors.primary.main} />
                        {!isDesktopWeb() && !(isMobile && garages.length > 0) &&
                            <SimpleHeader
                                title="Mina Fordon"
                                onBackPress={handleGoBack}
                                rightComponent={
                                    <TouchableOpacity onPress={() => handleAddVehicle()} style={styles.addGarageButtonContainer}>
                                        <IconAdd
                                            color={myColors.text.primary}
                                            size={24}
                                            style={{}}
                                        />
                                    </TouchableOpacity>
                                }
                            />
                        }
                        <View style={styles.loadingContainer}>
                            <MyText>Laddar garage...</MyText>
                        </View>
                    </SafeAreaView>
                </FooterWrapper>
            </>
        )
    }



    // Main Render
    return (
        <>
            <LoginPopup
                visible={showLoginPopup}
                onClose={() => setShowLoginPopup(false)}
                onLoginSuccess={() => {
                    setShowLoginPopup(false)
                    refetch()
                }}
            />

            {/* Inline Alert */}
            <InlineAlert
                visible={inlineAlert.visible}
                title={inlineAlert.title}
                message={inlineAlert.message}
                type={inlineAlert.type}
                buttons={inlineAlert.buttons}
                onDismiss={hideInlineAlert}
            />
            <FooterWrapper
                bounces={false}
                overScrollMode="never"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                scrollEventThrottle={16}
            >
                {!isDesktopWeb() && <HeaderWithSearch />}
                <SafeAreaView style={styles.container}>
                    <DesktopViewWrapper>
                        {/* Header with Search Component - Only show on mobile */}
                        <StatusBar barStyle="dark-content" backgroundColor={myColors.primary.main} />
                        {!isDesktopWeb() && !(isMobile && garages.length > 0) &&
                            <SimpleHeader
                                title="Mina Fordon"
                                onBackPress={handleGoBack}
                                rightComponent={
                                    <TouchableOpacity onPress={() => handleAddVehicle()} style={styles.addGarageButtonContainer}>
                                        <IconAdd
                                            color={myColors.text.primary}
                                            size={24}
                                            style={{}}
                                        />
                                    </TouchableOpacity>
                                }
                            />
                        }
                        <View
                            style={styles.contentView}
                            onTouchStart={handleScrollViewPress}
                        >
                            {/* Show landing page for non-authenticated users, garage interface for authenticated */}
                            {!isAuthenticated ? renderDesktopLandingPage() : (
                                <View style={styles.content}>
                                    {isDesktopWeb() &&
                                        <View style={styles.desktopHeader}>
                                            <H1 id="mina-fordon-page-title" style={styles.pageTitle}>
                                                Mina Fordon
                                            </H1>
                                            <TouchableOpacity onPress={() => handleAddVehicle()} style={styles.addGarageButtonContainer}>
                                                <IconAdd
                                                    color={myColors.text.primary}
                                                    size={24}
                                                    style={{}}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    }

                                    {/* Show mobile header when there are garages */}
                                    {renderMobileHeader()}

                                    {showNewGarageInput && (
                                        <View style={styles.newGarageInputContainer}>
                                            <View style={styles.newGarageInputRow}>
                                                <TextInput
                                                    style={styles.newGarageInput}
                                                    placeholder="Garage namn"
                                                    placeholderTextColor={myColors.text.placeholder}
                                                    value={newGarageName}
                                                    onChangeText={setNewGarageName}
                                                    autoFocus
                                                    editable={!isCreatingGarage}
                                                    maxLength={50}
                                                />
                                                <TouchableOpacity
                                                    style={[styles.actionButton, styles.confirmButton]}
                                                    onPress={createNewGarage}
                                                    disabled={isCreatingGarage || newGarageName.trim() === ''}
                                                >
                                                    {isCreatingGarage ? <IconHourglass
                                                        color={myColors.white}
                                                        size={20}
                                                    /> : <IconCheckmark
                                                        color={myColors.white}
                                                        size={20}
                                                    />}
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[styles.actionButton, styles.cancelButton]}
                                                    onPress={handleCancelNewGarage}
                                                    disabled={isCreatingGarage}
                                                >
                                                    <IconClose
                                                        color={myColors.white}
                                                        size={20}
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}

                                    {garages.length > 0 ? (
                                        garages.map(garage => renderGarageSection(garage))
                                    ) : (
                                        /* Show mobile welcome for authenticated users with no garages */
                                        renderMobileWelcome()
                                    )}
                                </View>
                            )}
                        </View>
                    </DesktopViewWrapper>
                </SafeAreaView>
            </FooterWrapper>
        </>
    )
}

export default Minafordon

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: myColors.screenBackgroundColor,
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        paddingBottom: 20,
    },
    content: {
        padding: isMobile ? 12 : 16,
        minHeight: isDesktopWeb() ? 400 : 1000,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: isMobile ? 20 : 0,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: isMobile ? 16 : 20,
    },
    errorText: {
        fontSize: isMobile ? 14 : 16,
        color: myColors.text.secondary,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: isMobile ? 20 : 24,
    },
    retryButton: {
        backgroundColor: myColors.primary.main,
        paddingHorizontal: isMobile ? 24 : 30,
        paddingVertical: isMobile ? 12 : 14,
        borderRadius: BORDER_RADIUS.Regular,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: isMobile ? 60 : 100,
        paddingHorizontal: isMobile ? 16 : 0,
        paddingBottom: isMobile ? 40 : 0,
    },
    emptyStateText: {
        fontSize: isMobile ? 14 : 16,
        color: myColors.text.secondary,
        textAlign: 'center',
        marginBottom: isMobile ? 24 : 30,
        paddingHorizontal: isMobile ? 4 : 20,
        lineHeight: isMobile ? 20 : 24,
    },
    garageSection: {
        borderBottomWidth: 1,
        borderBottomColor: myColors.border.light,
        marginBottom: isMobile ? 8 : 0,
    },
    garageHeaderContainer: {
        position: 'relative',
        overflow: 'hidden',
    },
    garageHeaderWrapper: {
        position: 'relative',
    },
    garageDeleteButtonContainer: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        width: isMobile ? 70 : 60,
        backgroundColor: myColors.error,
    },
    garageDeleteButton: {
        padding: isMobile ? 10 : 8,
        borderRadius: 20,
        width: isMobile ? 40 : 36,
        height: isMobile ? 40 : 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    garageHeaderContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 1,
        width: '100%',
    },
    garageSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: isMobile ? 18 : 16,
        backgroundColor: myColors.screenBackgroundColor,
        minHeight: isMobile ? 54 : 48,
        flex: 1,
        width: '100%',
    },
    sectionContainer: {
        marginBottom: 5,
        borderBottomWidth: 1,
        marginHorizontal: isMobile ? 12 : 15,
        borderColor: myColors.border.light
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    sectionTitle: {
        fontSize: isMobile ? 18 : 20,
        color: myColors.text.primary,
        marginBottom: 10,
        lineHeight: isMobile ? 24 : 28,
    },
    regNumber: {
        fontSize: isMobile ? 15 : 14,
        color: myColors.text.primary,
        fontFamily: 'Poppins-Medium',
    },
    separator: {
        fontSize: isMobile ? 15 : 14,
        color: myColors.text.primary,
        marginHorizontal: isMobile ? 8 : 10,
        fontFamily: 'Poppins-Regular',
    },
    carModel: {
        fontSize: isMobile ? 15 : 14,
        color: myColors.text.primary,
        flex: 1,
        fontFamily: 'Poppins-Regular',
    },
    addGarageButtonContainer: {
        height: isMobile ? 44 : 40,
        width: isMobile ? 44 : 40,
        borderRadius: 30,
        backgroundColor: myColors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
        ...myStyles.shadow
    },
    addCarInputContainer: {
        marginTop: 16,
        marginBottom: 10,
        paddingEnd: isMobile ? 12 : 10,
        backgroundColor: myColors.white,
        borderRadius: BORDER_RADIUS.Regular,
        borderWidth: 1,
        borderColor: myColors.border.light,
        ...myStyles.shadow,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: isMobile ? 52 : 48,
    },
    inputWrapper: {
        flex: 1,
    },
    registrationInput: {
        padding: isMobile ? 14 : 12,
        color: myColors.text.primary,
        height: isMobile ? 52 : 48,
        borderWidth: 1,
        borderColor: myColors.border.light,
        borderRadius: BORDER_RADIUS.Regular,
        fontSize: isMobile ? 16 : 14,
    },
    actionButton: {
        padding: isMobile ? 12 : 10,
        borderRadius: 22,
        marginLeft: 10,
        width: isMobile ? 48 : 44,
        height: isMobile ? 48 : 44,
        justifyContent: 'center',
        alignItems: 'center',
        ...myStyles.shadow,
    },
    confirmButton: {
        backgroundColor: myColors.primary.main,
    },
    cancelButton: {
        backgroundColor: myColors.text.secondary,
    },
    newGarageInputContainer: {
        marginBottom: 16,
        padding: isMobile ? 12 : 10,
        backgroundColor: myColors.black,
        borderRadius: BORDER_RADIUS.Regular,
    },
    newGarageInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: isMobile ? 52 : 48,
    },
    newGarageInputWrapper: {
        flex: 1,
    },
    newGarageInput: {
        flex: 1,
        padding: isMobile ? 12 : 10,
        fontSize: isMobile ? 16 : 16,
        color: myColors.white,
        backgroundColor: 'transparent',
        outlineWidth: 0,
        minHeight: isMobile ? 48 : 44,
    } as any,
    garageSectionContent: {
        paddingHorizontal: isMobile ? 4 : 0,
    },
    vehicleItemContainer: {
        marginBottom: isMobile ? 12 : 16,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: BORDER_RADIUS.Regular,
    },
    vehicleItemWrapper: {
        position: 'relative',
    },
    vehicleItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: isMobile ? 16 : 12,
        backgroundColor: myColors.white,
        borderRadius: BORDER_RADIUS.Regular,
        height: isMobile ? 60 : 52,
        paddingHorizontal: isMobile ? 16 : 15,
        minHeight: isMobile ? 60 : 52,
        ...myStyles.shadow,
    },
    vehicleContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 1,
        width: '100%',
    },
    vehicleItemSwiped: {
        backgroundColor: myColors.error,
        paddingRight: isMobile ? 70 : 60,
    },
    deleteButtonContainer: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        width: isMobile ? 70 : 60,
        backgroundColor: myColors.error,
        borderRadius: BORDER_RADIUS.Regular,
    },
    deleteButton: {
        padding: isMobile ? 10 : 8,
        borderRadius: 20,
        width: isMobile ? 40 : 36,
        height: isMobile ? 40 : 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    vehicleInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: isMobile ? 8 : 6,
    },
    vehicleRegistration: {
        fontSize: isMobile ? 17 : 16,
        fontWeight: '600',
        color: myColors.text.primary,
        marginBottom: 2,
    },
    vehicleDetails: {
        fontSize: isMobile ? 15 : 14,
        color: myColors.text.secondary,
        lineHeight: isMobile ? 20 : 18,
    },
    noVehiclesText: {
        fontSize: isMobile ? 15 : 14,
        color: myColors.text.secondary,
        textAlign: 'center',
        paddingVertical: isMobile ? 24 : 20,
        lineHeight: isMobile ? 22 : 20,
    },
    addVehicleButton: {
        backgroundColor: myColors.primary.main,
        marginTop: 16,
        paddingVertical: isMobile ? 16 : 14,
        width: '100%',
        borderRadius: BORDER_RADIUS.Regular,
        minHeight: isMobile ? 52 : 48,
    },
    addVehicleButtonText: {
        color: myColors.white,
        fontSize: isMobile ? 16 : 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    rightAction: {
        width: isMobile ? 85 : 80,
        height: isMobile ? 60 : 52,
        backgroundColor: myColors.error,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: BORDER_RADIUS.Regular,
        marginBottom: isMobile ? 12 : 16,
        shadowColor: myColors.error,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    garageRightAction: {
        width: isMobile ? 85 : 80,
        backgroundColor: myColors.error,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: BORDER_RADIUS.Regular,
        shadowColor: myColors.error,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    pageTitle: {
        fontSize: isMobile ? 28 : 40,
        fontWeight: '700',
        color: myColors.text.primary,
        marginBottom: isDesktopWeb() ? 16 : (isMobile ? 8 : 12),
        textAlign: 'left',
        lineHeight: isMobile ? 34 : 48,
    },
    desktopHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 10,
    },
    landingContainer: {
        maxWidth: isDesktopWeb() ? 1200 : '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingHorizontal: isMobile ? 16 : 40,
        paddingVertical: isMobile ? 20 : 40,
        backgroundColor: myColors.screenBackgroundColor,
        width: '100%',
    } as any,
    heroSection: {
        alignItems: 'center',
        paddingVertical: isMobile ? 40 : 60,
        paddingHorizontal: isMobile ? 16 : 20,
    } as any,
    heroTitle: {
        fontSize: isMobile ? 28 : 42,
        fontWeight: '700',
        color: myColors.text.primary,
        marginBottom: isMobile ? 16 : 24,
        lineHeight: isMobile ? 34 : 50,
        maxWidth: isMobile ? '100%' : 800,
        textAlign: 'center',
    } as any,
    heroSubtitle: {
        fontSize: isMobile ? 16 : 18,
        color: myColors.text.primary,
        lineHeight: isMobile ? 24 : 28,
        maxWidth: isMobile ? '100%' : 600,
        textAlign: 'center',
        marginBottom: isMobile ? 32 : 40,
        opacity: 0.8,
    } as any,
    heroButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: isMobile ? 12 : 16,
        width: '100%',
    } as any,
    primaryCTA: {
        backgroundColor: myColors.primary.main,
        paddingHorizontal: isMobile ? 32 : 48,
        paddingVertical: isMobile ? 16 : 18,
        borderRadius: BORDER_RADIUS.Regular,
        minWidth: isMobile ? '100%' : 280,
        maxWidth: isMobile ? 350 : 400,
        ...myStyles.shadow,
    },
    primaryCTAText: {
        color: myColors.white,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    } as any,
    featuresSection: {
        paddingVertical: isMobile ? 40 : 60,
        paddingHorizontal: isMobile ? 16 : 20,
    },
    featuresGrid: {
        flexDirection: isDesktopWeb() ? 'row' : 'column',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        gap: isMobile ? 20 : 30,
    } as any,
    featureCard: {
        flex: 1,
        minWidth: isDesktopWeb() ? 280 : '100%',
        maxWidth: isDesktopWeb() ? 350 : '100%',
        backgroundColor: myColors.white,
        padding: isMobile ? 20 : 25,
        borderRadius: BORDER_RADIUS.Regular,
        alignItems: 'center',
        ...myStyles.shadow,
    } as any,
    featureIcon: {
        marginBottom: isMobile ? 12 : 16,
        padding: isMobile ? 12 : 16,
        backgroundColor: myColors.primary.light1,
        borderRadius: 40,
        width: isMobile ? 56 : 64,
        height: isMobile ? 56 : 64,
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureTitle: {
        fontSize: isMobile ? 16 : 18,
        fontWeight: '600',
        color: myColors.text.primary,
        marginBottom: isMobile ? 8 : 12,
        textAlign: 'center',
        lineHeight: isMobile ? 22 : 24,
    } as any,
    featureDescription: {
        fontSize: isMobile ? 14 : 15,
        color: myColors.text.primary,
        lineHeight: isMobile ? 20 : 22,
        textAlign: 'center',
        opacity: 0.8,
    } as any,
    benefitsSection: {
        paddingVertical: isMobile ? 40 : 60,
        paddingHorizontal: isMobile ? 16 : 20,
        backgroundColor: myColors.white,
        borderRadius: BORDER_RADIUS.Regular,
        marginHorizontal: isMobile ? 0 : 20,
        marginVertical: isMobile ? 16 : 20,
        ...myStyles.shadow,
    } as any,
    benefitsContent: {
        flexDirection: isDesktopWeb() ? 'row' : 'column',
        gap: isMobile ? 24 : 40,
        alignItems: 'center',
    } as any,
    benefitsList: {
        flex: 1,
        gap: isMobile ? 12 : 16,
        width: '100%',
    } as any,
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: isMobile ? 8 : 12,
    } as any,
    benefitText: {
        fontSize: isMobile ? 14 : 15,
        color: myColors.text.primary,
        lineHeight: isMobile ? 20 : 22,
        flex: 1,
        opacity: 0.8,
    },
    benefitHighlight: {
        fontWeight: '600',
        color: myColors.text.primary,
    },
    benefitsImage: {
        flex: 1,
        alignItems: 'center',
        marginTop: isDesktopWeb() ? 0 : 20,
        width: '100%',
    },
    mockupContainer: {
        backgroundColor: myColors.screenBackgroundColor,
        padding: isMobile ? 16 : 20,
        borderRadius: BORDER_RADIUS.Regular,
        width: '100%',
        maxWidth: isMobile ? '100%' : 280,
        ...myStyles.shadow,
    },
    mockupText: {
        fontSize: isMobile ? 14 : 16,
        fontWeight: '600',
        color: myColors.text.primary,
        marginBottom: isMobile ? 12 : 16,
        textAlign: 'center',
    } as any,
    mockupCard: {
        backgroundColor: myColors.white,
        padding: isMobile ? 10 : 12,
        borderRadius: BORDER_RADIUS.Regular,
        marginBottom: isMobile ? 8 : 12,
        ...myStyles.shadow,
    },
    mockupCardTitle: {
        fontSize: isMobile ? 13 : 14,
        fontWeight: '600',
        color: myColors.text.primary,
        marginBottom: isMobile ? 6 : 8,
    },
    mockupCardItem: {
        fontSize: isMobile ? 12 : 13,
        color: myColors.text.primary,
        marginBottom: 4,
        opacity: 0.7,
    },
    ctaSection: {
        paddingVertical: isMobile ? 40 : 60,
        paddingHorizontal: isMobile ? 16 : 20,
        alignItems: 'center',
    } as any,
    ctaTitle: {
        fontSize: isMobile ? 24 : 32,
        fontWeight: '700',
        color: myColors.text.primary,
        marginBottom: isMobile ? 12 : 16,
        textAlign: 'center',
        lineHeight: isMobile ? 30 : 40,
    } as any,
    ctaDescription: {
        fontSize: isMobile ? 14 : 16,
        color: myColors.text.primary,
        lineHeight: isMobile ? 20 : 24,
        maxWidth: isMobile ? '100%' : 580,
        textAlign: 'center',
        marginBottom: isMobile ? 24 : 32,
        opacity: 0.8,
    } as any,
    finalCTA: {
        backgroundColor: myColors.primary.main,
        paddingHorizontal: isMobile ? 32 : 32,
        paddingVertical: isMobile ? 16 : 16,
        borderRadius: BORDER_RADIUS.Regular,
        marginBottom: isMobile ? 8 : 12,
        minWidth: isMobile ? '100%' : 'auto',
        maxWidth: isMobile ? 350 : undefined,
        alignSelf: isMobile ? 'center' : 'auto',
        ...myStyles.shadow,
    },
    finalCTAText: {
        color: myColors.white,
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
    } as any,
    ctaSubtext: {
        fontSize: isMobile ? 12 : 13,
        color: myColors.text.primary,
        textAlign: 'center',
        lineHeight: isMobile ? 16 : 18,
        opacity: 0.7,
    } as any,
    seoSection: {
        paddingVertical: 50,
        paddingHorizontal: 20,
        backgroundColor: myColors.white,
        borderRadius: BORDER_RADIUS.Regular,
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 20,
        ...myStyles.shadow,
    } as any,
    seoTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: myColors.text.primary,
        marginBottom: 24,
        textAlign: 'center',
        lineHeight: 32,
    } as any,
    seoText: {
        fontSize: 15,
        color: myColors.text.primary,
        lineHeight: 24,
        marginBottom: 16,
        maxWidth: 700,
        marginLeft: 'auto',
        marginRight: 'auto',
        opacity: 0.8,
    } as any,
    mobileWelcomeContainer: {
        backgroundColor: myColors.screenBackgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 16,
        minHeight: 400,
    },
    mobileWelcomeContent: {
        backgroundColor: myColors.white,
        padding: 24,
        borderRadius: BORDER_RADIUS.Regular,
        alignItems: 'center',
        width: '100%',
        maxWidth: 350,
        ...myStyles.shadow,
    },
    mobileWelcomeIcon: {
        backgroundColor: myColors.primary.light1,
        padding: 16,
        borderRadius: 40,
        marginBottom: 16,
    },
    mobileWelcomeTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: myColors.text.primary,
        marginBottom: 12,
        textAlign: 'center',
        lineHeight: 28,
    },
    mobileWelcomeSubtitle: {
        fontSize: 15,
        color: myColors.text.primary,
        lineHeight: 22,
        maxWidth: 280,
        textAlign: 'center',
        marginBottom: 20,
        opacity: 0.8,
    },
    mobileWelcomeFeatures: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
        marginBottom: 24,
        flexWrap: 'wrap',
    },
    mobileFeatureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    mobileFeatureText: {
        fontSize: 13,
        color: myColors.text.primary,
        lineHeight: 18,
        fontWeight: '500',
    },
    mobileWelcomeCTA: {
        backgroundColor: myColors.primary.main,
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: BORDER_RADIUS.Regular,
        minWidth: 240,
        minHeight: 52,
        ...myStyles.shadow,
    },
    mobileWelcomeCTAText: {
        color: myColors.white,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    mobileHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: myColors.screenBackgroundColor,
        borderBottomWidth: 1,
        borderBottomColor: myColors.border.light,
    },
    mobileHeaderTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: myColors.text.primary,
    },
    mobileHeaderAddButton: {
        padding: 10,
        borderRadius: 22,
        backgroundColor: myColors.primary.main,
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        ...myStyles.shadow,
    },
    contentView: {
        flex: 1,
    },



    garageSectionHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    garageTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: isMobile ? 8 : 6,
    },
    garageSectionHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: isMobile ? 8 : 6,
    },
    vehicleInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 1,
        width: '100%',
    },
    webDeleteButton: {
        padding: isMobile ? 12 : 8,
        borderRadius: 20,
        marginLeft: isMobile ? 12 : 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        width: isMobile ? 40 : 36,
        height: isMobile ? 40 : 36,
        opacity: 0.7,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    } as any,
    webDeleteButtonInline: {
        padding: isMobile ? 6 : 4,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: myColors.error + '05',
        width: isMobile ? 28 : 24,
        height: isMobile ? 28 : 24,
        marginLeft: isMobile ? 10 : 8,
        borderWidth: 1,
        borderColor: myColors.error + '15',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        opacity: 0.8,
    } as any,
    webDeleteButtonNice: {
        padding: isMobile ? 10 : 8,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: myColors.error + '08',
        width: isMobile ? 36 : 32,
        height: isMobile ? 36 : 32,
        borderWidth: 1,
        borderColor: myColors.error + '20',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        shadowColor: myColors.error,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    } as any,
})

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true)
}
