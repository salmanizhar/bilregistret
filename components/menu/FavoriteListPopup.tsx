import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Dimensions,
    Alert,
    Platform,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import { myColors } from '@/constants/MyColors';
import MyText from '@/components/common/MyText';
import { useGarages, useCreateGarage, useAddCarToGarage, useDeleteCarFromGarage, useDeleteGarage, Garage, getGarageIdsWithCar } from '@/Services/api/hooks/garage.hooks';
import { showAlert } from '@/utils/alert';
import InlineAlert from '@/components/common/InlineAlert';
import { useIsFocused } from '@react-navigation/native';
import { isDesktopWeb } from '@/utils/deviceInfo';
import { desktopWebViewport } from '@/constants/commonConst';
import { IconCheckmark, IconTrashOutline, IconClose, IconAddCircleOutline } from '@/assets/icons';

const { width, height } = Dimensions.get('window');

// Interfaces for the component
interface FavoriteList {
    id: string;
    name: string;
    selected: boolean;
    vehicleCount: number;
    vehicles: Array<{
        id: string;
        regNumber: string;
        brand?: string;
        model?: string;
    }>;
}

// Add interface to track car IDs in garages
interface GarageCarMap {
    [garageId: string]: string;  // car ID for each garage ID
}

interface FavoriteListPopupProps {
    visible: boolean;
    onClose: () => void;
    onSave: (selectedLists: string[]) => void;
    carDetails: {
        title: string;
        year: string;
        regNumber: string;
        id?: string;
    };
}

const FavoriteListPopup: React.FC<FavoriteListPopupProps> = ({
    visible,
    onClose,
    onSave,
    carDetails
}) => {
    const isFocused = useIsFocused();
    // Fetch garages from API - enabled when both authenticated and screen is focused
    const { data: garages, isLoading, isError, error } = useGarages({ enabled: isFocused });
    const createGarageMutation = useCreateGarage();
    const addCarToGarageMutation = useAddCarToGarage();
    const deleteCarFromGarageMutation = useDeleteCarFromGarage();
    const deleteGarageMutation = useDeleteGarage();

    // State for favorite lists
    const [favoriteLists, setFavoriteLists] = useState<FavoriteList[]>([]);
    const [newListName, setNewListName] = useState('');
    const [showNewListInput, setShowNewListInput] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Inline alert state
    const [inlineAlert, setInlineAlert] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info' as 'success' | 'error' | 'warning' | 'info',
        buttons: [] as Array<{
            text: string;
            onPress: () => void;
            style?: 'default' | 'cancel' | 'destructive';
        }>
    });

    // Map to track car IDs in each garage for deletion
    const [garageCarMap, setGarageCarMap] = useState<GarageCarMap>({});

    // Inline alert functions
    const showInlineAlert = (config: {
        title: string;
        message: string;
        type: 'success' | 'error' | 'warning' | 'info';
        buttons: Array<{
            text: string;
            onPress: () => void;
            style?: 'default' | 'cancel' | 'destructive';
        }>;
    }) => {
        setInlineAlert({
            ...config,
            visible: true
        });
    };

    const hideInlineAlert = () => {
        setInlineAlert(prev => ({ ...prev, visible: false }));
    };

    // Load garages and transform to FavoriteList format
    useEffect(() => {
        if (garages && Array.isArray(garages)) {
            // Transform garages to FavoriteList format and check if the car is already in a garage
            const transformedLists = garages.map(garage => {
                const carInGarage = garage.GarageData?.find(
                    car => car.reg_name?.toLowerCase() === carDetails.regNumber.toLowerCase()
                );

                // Track the car ID for each garage for potential deletion later
                if (carInGarage) {
                    setGarageCarMap(prev => ({ ...prev, [garage.id]: carInGarage.id }));
                }

                // Extract vehicle data for display
                const vehicles = garage.GarageData?.map(car => ({
                    id: car.id,
                    regNumber: car.reg_name,
                    brand: car.brand,
                    model: car.model
                })) || [];

                return {
                    id: garage.id,
                    name: garage.name,
                    selected: !!carInGarage,
                    vehicleCount: vehicles.length,
                    vehicles: vehicles
                };
            });

            setFavoriteLists(transformedLists);
        } else {
            // Initialize with empty array if garages is null or not an array
            setFavoriteLists([]);
        }
    }, [garages, carDetails.regNumber]);

    // Toggle selection of a list
    const toggleListSelection = (id: string) => {
        setFavoriteLists(
            favoriteLists.map(list =>
                list.id === id ? { ...list, selected: !list.selected } : list
            )
        );
    };

    // Handle long press to delete a garage
    const handleLongPress = (id: string, name: string) => {
        showInlineAlert({
            title: "Ta bort lista",
            message: `Är du säker på att du vill ta bort listan "${name}"? Detta kan inte ångras.`,
            type: 'warning',
            buttons: [
                {
                    text: 'Avbryt',
                    onPress: () => { },
                    style: 'cancel'
                },
                {
                    text: 'Ta bort',
                    onPress: async () => {
                        try {
                            setIsSubmitting(true);
                            await deleteGarageMutation.mutateAsync(id);
                            // Remove the deleted garage from local state
                            setFavoriteLists(favoriteLists.filter(list => list.id !== id));
                            showInlineAlert({
                                title: "Framgång",
                                message: "Listan har tagits bort.",
                                type: 'success',
                                buttons: [
                                    {
                                        text: 'OK',
                                        onPress: () => { }
                                    }
                                ]
                            });
                        } catch (error: any) {
                            console.error("Error deleting garage:", error);

                            // Extract error message from API response
                            let errorMessage = "Det gick inte att ta bort listan. Försök igen.";

                            if (error?.response?.data?.message) {
                                errorMessage = error.response.data.message;
                            } else if (error?.message) {
                                errorMessage = error.message;
                            } else if (typeof error === 'string') {
                                errorMessage = error;
                            }

                            showInlineAlert({
                                title: "Fel",
                                message: errorMessage,
                                type: 'error',
                                buttons: [
                                    {
                                        text: 'OK',
                                        onPress: () => { }
                                    }
                                ]
                            });
                        } finally {
                            setIsSubmitting(false);
                        }
                    },
                    style: 'destructive'
                }
            ]
        });
    };

    // Add new list
    const addNewList = async () => {
        if (newListName.trim() === '') return;

        try {
            setIsSubmitting(true);

            // Create new garage via API
            const result = await createGarageMutation.mutateAsync({
                name: newListName.trim()
            });

            if (result) {
                const newList: FavoriteList = {
                    id: result.id,
                    name: result.name,
                    selected: true,
                    vehicleCount: 0,
                    vehicles: []
                };

                setFavoriteLists([...favoriteLists, newList]);
            }
        } catch (err: any) {
            console.error("Error creating new garage:-", err);

            // Extract error message from API response
            let errorMessage = "Det gick inte att skapa en ny lista. Försök igen.";

            if (err?.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err?.message) {
                errorMessage = err.message;
            } else if (typeof err === 'string') {
                errorMessage = err;
            }

            showInlineAlert({
                title: "Fel",
                message: errorMessage,
                type: 'error',
                buttons: [
                    {
                        text: 'OK',
                        onPress: () => { }
                    }
                ]
            });
        } finally {
            setIsSubmitting(false);
            setNewListName('');
            setShowNewListInput(false);
        }
    };

    // Save selected lists
    const handleSave = async () => {
        if (carDetails?.title === "") {
            onClose();
            showAlert({
                title: "Fel",
                message: "Car not found with that registration number",
                type: 'error',
            });
            return
        }

        try {
            setIsSubmitting(true);
            const selectedListIds = favoriteLists
                .filter(list => list.selected)
                .map(list => list.id);

            // Get previously selected garages that contain this car
            const previouslySelectedGarageIds = garages ?
                getGarageIdsWithCar(garages, carDetails.regNumber) : [];

            // Add car to newly selected garages
            const addPromises = selectedListIds
                .filter(id => !previouslySelectedGarageIds.includes(id))
                .map(garageId =>
                    addCarToGarageMutation.mutateAsync({
                        garageId,
                        data: {
                            reg_name: carDetails.regNumber,
                        }
                    })
                );

            // Remove car from previously selected garages that are now unselected
            const removePromises = previouslySelectedGarageIds
                .filter(id => !selectedListIds.includes(id) && garageCarMap[id])
                .map(garageId =>
                    deleteCarFromGarageMutation.mutateAsync({
                        garageId,
                        carId: garageCarMap[garageId]
                    })
                );

            // Execute all promises in parallel
            const allPromises = [...addPromises, ...removePromises];
            if (allPromises.length > 0) {
                await Promise.all(allPromises);
            }

            // Return the selected list IDs to the parent component
            onSave(selectedListIds);
            onClose();
        } catch (err: any) {
            console.error("Error updating garages:", err);

            // Extract error message from API response
            let errorMessage = "Det gick inte att uppdatera listorna. Försök igen.";

            if (err?.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err?.message) {
                errorMessage = err.message;
            } else if (typeof err === 'string') {
                errorMessage = err;
            }

            showInlineAlert({
                title: "Fel",
                message: errorMessage,
                type: 'error',
                buttons: [
                    {
                        text: 'OK',
                        onPress: () => { }
                    }
                ]
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Render list item (improved for desktop)
    const renderListItem = (list: FavoriteList) => (
        <View key={list.id} style={[
            styles.listItem,
            isDesktopWeb() && styles.listItemDesktop,
            list.selected && styles.listItemSelected
        ]}>
            <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => toggleListSelection(list.id)}
                activeOpacity={0.7}
                disabled={isSubmitting}
            >
                <View style={[
                    styles.checkbox,
                    list.selected && styles.checkboxSelected
                ]}>
                    {list.selected && (
                        <IconCheckmark size={isDesktopWeb() ? 20 : 18} color={myColors.white} />
                    )}
                </View>
                <View style={styles.listItemContent}>
                    <View style={styles.listItemHeader}>
                        <MyText style={[
                            styles.listItemText,
                            isDesktopWeb() && styles.listItemTextDesktop
                        ]}>
                            {list.name}
                        </MyText>
                        <MyText style={[
                            styles.vehicleCountText,
                            isDesktopWeb() && styles.vehicleCountTextDesktop
                        ]}>
                            {list.vehicleCount} fordon
                        </MyText>
                    </View>

                    {/* Show vehicles as inline badges on desktop */}
                    {isDesktopWeb() && list.vehicles.length > 0 && (
                        <View style={styles.vehicleTagsContainer}>
                            {list.vehicles.slice(0, 2).map(vehicle => (
                                <View key={vehicle.id} style={styles.vehicleTag}>
                                    <MyText style={styles.vehicleTagText}>
                                        {vehicle.regNumber}
                                    </MyText>
                                </View>
                            ))}
                            {list.vehicles.length > 2 && (
                                <View style={styles.moreVehiclesTag}>
                                    <MyText style={styles.moreVehiclesTagText}>
                                        +{list.vehicles.length - 2}
                                    </MyText>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </TouchableOpacity>

            {list.name.toLowerCase() !== "mina fordon" && (
                <TouchableOpacity
                    style={[styles.deleteButton, isDesktopWeb() && styles.deleteButtonDesktop]}
                    onPress={() => handleLongPress(list.id, list.name)}
                    disabled={isSubmitting}
                >
                    <IconTrashOutline size={isDesktopWeb() ? 22 : 20} color={myColors.error} />
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                    <View style={styles.modalOverlay}>
                        <View style={[
                            styles.modalContainer,
                            isDesktopWeb() && styles.modalContainerDesktop
                        ]}>
                            {/* Header */}
                            <View style={[
                                styles.header,
                                isDesktopWeb() && styles.headerDesktop
                            ]}>
                                <View style={styles.headerContent}>
                                    <MyText style={[
                                        styles.title,
                                        isDesktopWeb() && styles.titleDesktop
                                    ]}>
                                        Lägg till i mina fordon
                                    </MyText>
                                    <MyText style={[
                                        styles.subtitle,
                                        isDesktopWeb() && styles.subtitleDesktop
                                    ]}>
                                        {carDetails.regNumber} • {carDetails.title}
                                        {carDetails.year && ` • ${carDetails.year}`}
                                    </MyText>
                                </View>
                                <TouchableOpacity
                                    style={[styles.closeButton, isDesktopWeb() && styles.closeButtonDesktop]}
                                    onPress={onClose}
                                    disabled={isSubmitting}
                                >
                                    <IconClose size={isDesktopWeb() ? 28 : 24} color={myColors.text.secondary} />
                                </TouchableOpacity>
                            </View>

                            {isLoading ? (
                                <View style={[
                                    styles.loadingContainer,
                                    isDesktopWeb() && styles.loadingContainerDesktop
                                ]}>
                                    <MyText style={[
                                        styles.loadingText,
                                        isDesktopWeb() && styles.loadingTextDesktop
                                    ]}>
                                        Laddar listor...
                                    </MyText>
                                </View>
                            ) : isError ? (
                                <View style={[
                                    styles.errorContainer,
                                    isDesktopWeb() && styles.errorContainerDesktop
                                ]}>
                                    <MyText style={[
                                        styles.errorText,
                                        isDesktopWeb() && styles.errorTextDesktop
                                    ]}>
                                        Det gick inte att ladda listor. Försök igen.
                                    </MyText>
                                </View>
                            ) : (
                                <>
                                    {/* List of existing favorite lists */}
                                    <ScrollView
                                        style={[
                                            styles.listContainer,
                                            isDesktopWeb() && styles.listContainerDesktop
                                        ]}
                                        showsVerticalScrollIndicator={false}
                                    >
                                        {favoriteLists.map(renderListItem)}
                                    </ScrollView>

                                    {/* Add new list option */}
                                    {showNewListInput ? (
                                        <View style={[
                                            styles.newListInputContainer,
                                            isDesktopWeb() && styles.newListInputContainerDesktop
                                        ]}>
                                            <TextInput
                                                style={[
                                                    styles.textInput,
                                                    isDesktopWeb() && styles.textInputDesktop
                                                ]}
                                                placeholder="Ny lista"
                                                placeholderTextColor={myColors.text.secondary}
                                                value={newListName}
                                                onChangeText={setNewListName}
                                                autoFocus
                                                editable={!isSubmitting}
                                            />
                                            <TouchableOpacity
                                                style={[
                                                    styles.checkButton,
                                                    isDesktopWeb() && styles.checkButtonDesktop
                                                ]}
                                                onPress={addNewList}
                                                disabled={isSubmitting || newListName.trim() === ''}
                                            >
                                                <IconCheckmark size={isDesktopWeb() ? 26 : 24} color="white" />
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            style={[
                                                styles.addNewListButton,
                                                isDesktopWeb() && styles.addNewListButtonDesktop
                                            ]}
                                            onPress={() => setShowNewListInput(true)}
                                            disabled={isSubmitting}
                                        >
                                            <IconAddCircleOutline size={isDesktopWeb() ? 26 : 24} color={myColors.primary.main} />
                                            <MyText style={[
                                                styles.addNewListText,
                                                isDesktopWeb() && styles.addNewListTextDesktop
                                            ]}>
                                                Skapa ny lista
                                            </MyText>
                                        </TouchableOpacity>
                                    )}
                                </>
                            )}

                            {/* Action buttons */}
                            <View style={[
                                styles.actionButtons,
                                isDesktopWeb() && styles.actionButtonsDesktop
                            ]}>
                                <TouchableOpacity
                                    style={[
                                        styles.cancelButton,
                                        isDesktopWeb() && styles.cancelButtonDesktop
                                    ]}
                                    onPress={onClose}
                                    disabled={isSubmitting}
                                >
                                    <MyText style={[
                                        styles.cancelButtonText,
                                        isDesktopWeb() && styles.cancelButtonTextDesktop
                                    ]}>
                                        Avbryt
                                    </MyText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.saveButton,
                                        isDesktopWeb() && styles.saveButtonDesktop,
                                        isSubmitting && styles.disabledButton
                                    ]}
                                    onPress={handleSave}
                                    disabled={isSubmitting}
                                >
                                    <IconCheckmark size={isDesktopWeb() ? 26 : 24} color="white" />
                                    {isDesktopWeb() && (
                                        <MyText style={styles.saveButtonText}>
                                            Spara
                                        </MyText>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Inline Alert Component */}
                        <InlineAlert
                            visible={inlineAlert.visible}
                            title={inlineAlert.title}
                            message={inlineAlert.message}
                            type={inlineAlert.type}
                            buttons={inlineAlert.buttons}
                            onDismiss={hideInlineAlert}
                        />
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        paddingHorizontal: isDesktopWeb() ? 40 : 20,
    },
    modalContainer: {
        width: width * 0.9,
        maxHeight: height * 0.7,
        backgroundColor: '#FFFFFF',
        borderRadius: isDesktopWeb() ? 2 : 8,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    modalContainerDesktop: {
        width: Math.min(desktopWebViewport * 0.6, 700),
        maxHeight: height * 0.85,
        borderRadius: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isDesktopWeb() ? 20 : 16,
        borderBottomWidth: 2,
        borderBottomColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
    },
    headerDesktop: {
        padding: 24,
        borderBottomWidth: 2,
        borderBottomColor: '#D1D5DB',
    },
    headerContent: {
        flex: 1,
        marginRight: 16,
    },
    title: {
        fontSize: isDesktopWeb() ? 18 : 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 2,
    },
    titleDesktop: {
        fontSize: 20,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: isDesktopWeb() ? 14 : 13,
        color: '#6B7280',
        fontWeight: '400',
    },
    subtitleDesktop: {
        fontSize: 15,
    },
    closeButton: {
        padding: 6,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 2,
    },
    closeButtonDesktop: {
        padding: 8,
        backgroundColor: '#F9FAFB',
        borderColor: '#9CA3AF',
    },
    listContainer: {
        maxHeight: height * 0.4,
        backgroundColor: '#FFFFFF',
    },
    listContainerDesktop: {
        maxHeight: height * 0.52,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: isDesktopWeb() ? 12 : 10,
        paddingHorizontal: isDesktopWeb() ? 20 : 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        minHeight: isDesktopWeb() ? 48 : 44,
    },
    listItemDesktop: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        minHeight: 52,
        borderBottomColor: '#E5E7EB',
    },
    listItemSelected: {
        backgroundColor: isDesktopWeb() ? '#F0F9FF' : '#F8FAFC',
        borderLeftWidth: isDesktopWeb() ? 3 : 0,
        borderLeftColor: isDesktopWeb() ? '#2563EB' : 'transparent',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    checkbox: {
        width: 16,
        height: 16,
        borderWidth: 1,
        borderColor: '#9CA3AF',
        marginRight: isDesktopWeb() ? 12 : 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 2,
        backgroundColor: '#FFFFFF',
    },
    checkboxSelected: {
        backgroundColor: '#2563EB',
        borderColor: '#2563EB',
    },
    listItemContent: {
        flex: 1,
    },
    listItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isDesktopWeb() ? 4 : 2,
    },
    listItemText: {
        fontSize: isDesktopWeb() ? 14 : 13,
        fontWeight: '500',
        color: '#111827',
        flex: 1,
    },
    listItemTextDesktop: {
        fontSize: 15,
        fontWeight: '600',
    },
    vehicleCountText: {
        fontSize: isDesktopWeb() ? 12 : 11,
        color: '#6B7280',
        fontWeight: '400',
        fontStyle: 'italic',
    },
    vehicleCountTextDesktop: {
        fontSize: 13,
    },
    vehicleTagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 4,
    },
    vehicleTag: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 2,
    },
    vehicleTagText: {
        fontSize: 10,
        fontWeight: '400',
        color: '#374151',
        fontFamily: 'monospace',
    },
    moreVehiclesTag: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        backgroundColor: '#E5E7EB',
        borderWidth: 1,
        borderColor: '#9CA3AF',
        borderRadius: 2,
    },
    moreVehiclesTagText: {
        fontSize: 10,
        fontWeight: '400',
        color: '#6B7280',
        fontFamily: 'monospace',
    },
    deleteButton: {
        padding: 6,
        marginLeft: 8,
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
        borderRadius: 2,
    },
    deleteButtonDesktop: {
        padding: 8,
        marginLeft: 12,
        backgroundColor: '#FEF2F2',
        borderColor: '#FCA5A5',
    },
    newListInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: isDesktopWeb() ? 24 : 16,
        marginVertical: isDesktopWeb() ? 16 : 12,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 16,
    },
    newListInputContainerDesktop: {
        marginHorizontal: 24,
        marginVertical: 20,
        paddingTop: 20,
    },
    textInput: {
        flex: 1,
        height: isDesktopWeb() ? 36 : 32,
        borderWidth: 1,
        borderColor: '#9CA3AF',
        borderRadius: 2,
        paddingHorizontal: 8,
        fontSize: isDesktopWeb() ? 14 : 13,
        backgroundColor: '#FFFFFF',
        fontWeight: '400',
        color: '#111827',
    },
    textInputDesktop: {
        height: 38,
        fontSize: 14,
        paddingHorizontal: 10,
    },
    checkButton: {
        width: isDesktopWeb() ? 36 : 32,
        height: isDesktopWeb() ? 36 : 32,
        borderRadius: 2,
        backgroundColor: '#16A34A',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        borderWidth: 1,
        borderColor: '#15803D',
    },
    checkButtonDesktop: {
        width: 38,
        height: 38,
        marginLeft: 10,
    },
    addNewListButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: isDesktopWeb() ? 24 : 16,
        marginVertical: isDesktopWeb() ? 12 : 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 2,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    addNewListButtonDesktop: {
        marginHorizontal: 24,
        marginVertical: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    addNewListText: {
        fontSize: isDesktopWeb() ? 14 : 13,
        color: '#2563EB',
        marginLeft: 8,
        fontWeight: '500',
    },
    addNewListTextDesktop: {
        fontSize: 14,
        marginLeft: 10,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: isDesktopWeb() ? 20 : 16,
        borderTopWidth: 2,
        borderTopColor: '#E5E7EB',
        gap: 8,
        backgroundColor: '#F9FAFB',
    },
    actionButtonsDesktop: {
        padding: 24,
        gap: 12,
        borderTopColor: '#D1D5DB',
    },
    cancelButton: {
        paddingVertical: isDesktopWeb() ? 8 : 7,
        paddingHorizontal: isDesktopWeb() ? 16 : 12,
        borderRadius: 2,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#9CA3AF',
    },
    cancelButtonDesktop: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#F9FAFB',
        borderColor: '#6B7280',
    },
    cancelButtonText: {
        color: '#374151',
        fontSize: isDesktopWeb() ? 14 : 13,
        fontWeight: '500',
    },
    cancelButtonTextDesktop: {
        fontSize: 14,
        fontWeight: '600',
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: isDesktopWeb() ? 8 : 7,
        paddingHorizontal: isDesktopWeb() ? 16 : 12,
        borderRadius: 2,
        backgroundColor: '#2563EB',
        justifyContent: 'center',
        gap: 6,
        borderWidth: 1,
        borderColor: '#1D4ED8',
    },
    saveButtonDesktop: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        gap: 8,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: isDesktopWeb() ? 14 : 13,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.5,
    },
    loadingContainer: {
        height: height * 0.3,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        backgroundColor: '#FFFFFF',
    },
    loadingContainerDesktop: {
        height: 200,
        padding: 40,
    },
    loadingText: {
        fontSize: isDesktopWeb() ? 14 : 13,
        color: '#6B7280',
        fontWeight: '400',
    },
    loadingTextDesktop: {
        fontSize: 15,
    },
    errorContainer: {
        height: height * 0.3,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        backgroundColor: '#FFFFFF',
    },
    errorContainerDesktop: {
        height: 200,
        padding: 40,
    },
    errorText: {
        color: '#DC2626',
        textAlign: 'center',
        fontSize: isDesktopWeb() ? 14 : 13,
        fontWeight: '400',
        lineHeight: 20,
    },
    errorTextDesktop: {
        fontSize: 15,
        lineHeight: 22,
    },
});

export default FavoriteListPopup;