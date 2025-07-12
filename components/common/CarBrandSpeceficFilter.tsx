import { StyleSheet, Text, View, Platform, TouchableOpacity, Modal, ScrollView } from 'react-native'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { myColors } from '@/constants/MyColors'
import CustomDropdownPicker from './CustomDropdownPicker'
import CustomDropdown from './CustomDropdown'
import { DropdownItem } from './CustomDropdownPicker'
import { Ionicons } from '@expo/vector-icons'
import MyText from './MyText'
import { SvgXml } from 'react-native-svg'
import { ImagePath } from '@/assets/images'
import { MYSCREEN } from '@/constants/Dimentions'
import YearRangeSlider from './YearRangeSlider'
import moment from 'moment'
import { isDesktopWeb } from '@/utils/deviceInfo'
import { IconChevronDown, IconClose } from '@/assets/icons'

interface FilterValue {
    fuelType: string | number | null;
    chassis: string | number | null;
    seats: string | number | null;
    yearRange: number[];
}

interface CarBrandSpeceficFilterProps {
    onFilterChange: (filterValues: FilterValue) => void;
    resetFilters?: boolean;
    closeDropdowns?: boolean;
    selectedFilterValues?: FilterValue;
    isMobileModal?: boolean;
    onCloseMobileModal?: () => void;
}

const iconSize = 24;
const yearRangeArray = [1950, moment().year()]

const CarBrandSpeceficFilter = ({
    onFilterChange,
    resetFilters = false,
    closeDropdowns = false,
    isMobileModal = false,
    onCloseMobileModal
}: CarBrandSpeceficFilterProps) => {
    const [yearrangeDropdownVisible, setYearrangeDropdownVisible] = useState(false);
    const [selectedFuelType, setSelectedFuelType] = useState<string | number | null>(null);
    const [selectedChassis, setSelectedChassis] = useState<string | number | null>(null);
    const [selectedSeats, setSelectedSeats] = useState<string | number | null>(null);
    const [yearRange, setYearRange] = useState(yearRangeArray);

    // Mobile modal states
    const [activeMobileFilter, setActiveMobileFilter] = useState<'fuel' | 'chassis' | 'seats' | 'year' | null>(null);

    // Reset filters when the resetFilters prop changes
    useEffect(() => {
        if (resetFilters) {
            setSelectedFuelType(null);
            setSelectedChassis(null);
            setSelectedSeats(null);
            setYearRange(yearRangeArray);
        }
    }, [resetFilters]);

    //added useeffect to handle backdrop press for year range slider
    useEffect(() => {
        if (closeDropdowns && yearrangeDropdownVisible) {
            setYearrangeDropdownVisible(false);
        }
    }, [closeDropdowns]);

    // Update parent component when any filter changes
    useEffect(() => {
        onFilterChange({
            fuelType: selectedFuelType,
            chassis: selectedChassis,
            seats: selectedSeats,
            yearRange
        });
    }, [selectedFuelType, selectedChassis, selectedSeats, yearRange, onFilterChange]);

    // Sample data with left and right components
    const FuelTypeData: DropdownItem[] = [
        {
            label: 'Bensin',
            value: 'BENSIN',
            leftComponent: <SvgXml xml={ImagePath.SvgIcons.CarBrandFuelTypeBIcon} height={iconSize} />,
        },
        {
            label: 'Bensin/Elhybrid',
            value: 'BENSIN/ELHYBRID',
            leftComponent: <SvgXml xml={ImagePath.SvgIcons.CarBrandFuelTypeHBcon} height={iconSize} />,
        },
        {
            label: 'Bensin/Etanol',
            value: 'BENSIN/ETANOL',
            leftComponent: <SvgXml xml={ImagePath.SvgIcons.CarBrandFuelTypeBE85con} height={iconSize} />,
        },
        {
            label: 'Bensin/Motorgas',
            value: 'BENSIN/MOTORGAS',
            leftComponent: <SvgXml xml={ImagePath.SvgIcons.CarBrandFuelTypeBLPGcon} height={iconSize} />,
        },
        {
            label: 'Bensin/Motorgas (CNG)',
            value: 'BENSIN/MOTORGAS (CNG)',
            leftComponent: <SvgXml xml={ImagePath.SvgIcons.CarBrandFuelTypeBLPGcon} height={iconSize} />,
        },
        {
            label: 'Bensin/Motorgas (LPG)',
            value: 'BENSIN/MOTORGAS (LPG)',
            leftComponent: <SvgXml xml={ImagePath.SvgIcons.CarBrandFuelTypeBLPGcon} height={iconSize} />,
        },
        {
            label: 'Bensin/Naturgas (CNG)',
            value: 'BENSIN/NATURGAS (CNG)',
            leftComponent: <SvgXml xml={ImagePath.SvgIcons.CarBrandFuelTypeBCNGIcon} height={iconSize} />,
        },
        {
            label: 'CNG',
            value: 'CNG',
            leftComponent: <SvgXml xml={ImagePath.SvgIcons.CarBrandFuelTypeCNGIcon} height={iconSize} />,
        },
        {
            label: 'Diesel',
            value: 'DIESEL',
            leftComponent: <SvgXml xml={ImagePath.SvgIcons.CarBrandFuelTypeDIcon} height={iconSize} />,
        },
        {
            label: 'Diesel/Elhybrid',
            value: 'DIESEL/ELHYBRID',
            leftComponent: <SvgXml xml={ImagePath.SvgIcons.CarBrandFuelTypeHDcon} height={iconSize} />,
        },
        {
            label: 'El',
            value: 'EL',
            leftComponent: <SvgXml xml={ImagePath.SvgIcons.CarBrandFuelTypeELIcon} height={iconSize} />,
        },
        {
            label: 'Etanol',
            value: 'ETANOL',
            leftComponent: <SvgXml xml={ImagePath.SvgIcons.CarBrandFuelTypeE85con} height={iconSize} />,
        },
        {
            label: 'Motorgas',
            value: 'MOTORGAS',
            leftComponent: <SvgXml xml={ImagePath.SvgIcons.CarBrandFuelTypeLPGcon} height={iconSize} />,
        },
        {
            label: 'Vätgas',
            value: 'VÄTGAS',
            leftComponent: <SvgXml xml={ImagePath.SvgIcons.CarBrandFuelTypeHIcon} height={iconSize} />,
        },
    ];

    const ChassisData: DropdownItem[] = [
        {
            label: 'Buss',
            value: 'BUSS',
            leftComponent: <SvgXml xml={ImagePath.SvgIcons.BusIcon} width={iconSize} height={iconSize} />,
            rightComponent: <View style={styles.countBadge}><MyText style={styles.countText}>520</MyText></View>,
        },
        {
            label: 'Cabriolet',
            value: 'CABRIOLET',
            leftComponent: <SvgXml xml={ImagePath.SvgIcons.CabrioletIcon} width={iconSize} height={iconSize} />,
            rightComponent: <View style={styles.countBadge}><MyText style={styles.countText}>520</MyText></View>,
        },
        {
            label: 'Coupé',
            value: "COUPE",
            leftComponent: <SvgXml xml={ImagePath.SvgIcons.CoupeIcon} width={iconSize} height={iconSize} />,
            rightComponent: <View style={styles.countBadge}><MyText style={styles.countText}>520</MyText></View>,
        },
        {
            label: 'SUV',
            value: "SUV",
            leftComponent: <SvgXml xml={ImagePath.SvgIcons.SUVIcon} width={iconSize} height={iconSize} />,
            rightComponent: <View style={styles.countBadge}><MyText style={styles.countText}>520</MyText></View>,
        },
        {
            label: 'Halvkombi',
            value: "HALVKOMBI",
            leftComponent: <SvgXml xml={ImagePath.SvgIcons.HalvkombiIcon} width={iconSize} height={iconSize} />,
            rightComponent: <View style={styles.countBadge}><MyText style={styles.countText}>520</MyText></View>,
        },
        {
            label: 'Skåpbil',
            value: "SKAPBIL",
            leftComponent: <SvgXml xml={ImagePath.SvgIcons.SkapbilIcon} width={iconSize} height={iconSize} />,
            rightComponent: <View style={styles.countBadge}><MyText style={styles.countText}>520</MyText></View>,
        }
    ];
    const NoOfSeatsData: DropdownItem[] = [
        {
            label: '10 Säten',
            value: '10',
            rightComponent: <View style={styles.countBadge}><MyText style={styles.countText}>520</MyText></View>,
        },
        {
            label: '8 Säten',
            value: '8',
            rightComponent: <View style={styles.countBadge}><MyText style={styles.countText}>520</MyText></View>,
        },
        {
            label: '6 Säten',
            value: "6",
            rightComponent: <View style={styles.countBadge}><MyText style={styles.countText}>520</MyText></View>,
        },
        {
            label: '5 Säten',
            value: "5",
            rightComponent: <View style={styles.countBadge}><MyText style={styles.countText}>520</MyText></View>,
        },
        {
            label: '4 Säten',
            value: "4",
            rightComponent: <View style={styles.countBadge}><MyText style={styles.countText}>520</MyText></View>,
        },
        {
            label: '2 Säten',
            value: "2",
            rightComponent: <View style={styles.countBadge}><MyText style={styles.countText}>520</MyText></View>,
        }
    ];

    const handleFuelTypeChange = useCallback((item: DropdownItem) => {
        setSelectedFuelType(item.value);
        if (isMobileModal) {
            setActiveMobileFilter(null);
        }
    }, [isMobileModal]);

    const handleChassisChange = useCallback((item: DropdownItem) => {
        setSelectedChassis(item.value);
        if (isMobileModal) {
            setActiveMobileFilter(null);
        }
    }, [isMobileModal]);

    const handleSeatsChange = useCallback((item: DropdownItem) => {
        setSelectedSeats(item.value);
        if (isMobileModal) {
            setActiveMobileFilter(null);
        }
    }, [isMobileModal]);

    // Direct handler for our custom slider
    const handleYearRangeChange = useCallback((minValue: number, maxValue: number) => {
        if (yearRange[0] !== minValue || yearRange[1] !== maxValue) {
            setYearRange([minValue, maxValue]);
        }
    }, [yearRange]);

    const toggleYearRangeDropdown = useCallback(() => {
        setYearrangeDropdownVisible(!yearrangeDropdownVisible);
    }, [yearrangeDropdownVisible]);

    // Mobile filter button component
    const MobileFilterButton = ({
        title,
        value,
        onPress,
        filterType
    }: {
        title: string;
        value: string;
        onPress: () => void;
        filterType: 'fuel' | 'chassis' | 'seats' | 'year';
    }) => (
        <TouchableOpacity
            style={styles.mobileFilterButton}
            onPress={onPress}
        >
            {/* <MyText style={styles.mobileFilterButtonText}>{title}</MyText> */}
            <MyText style={styles.mobileFilterButtonValue}>{value}</MyText>
            {/* <Ionicons name="chevron-down" size={20} color={myColors.text.secondary} /> */}
            <IconChevronDown
                color={myColors.text.secondary}
                size={20}
            />
        </TouchableOpacity>
    );

    // Mobile filter list component
    const MobileFilterList = ({
        data,
        onSelect,
        selectedValue
    }: {
        data: DropdownItem[];
        onSelect: (item: DropdownItem) => void;
        selectedValue: string | number | null;
    }) => (
        <ScrollView style={styles.mobileFilterList} showsVerticalScrollIndicator={false}>
            {data.map((item, index) => (
                <TouchableOpacity
                    key={index}
                    style={[
                        styles.mobileFilterItem,
                        selectedValue === item.value && styles.mobileFilterItemSelected
                    ]}
                    onPress={() => onSelect(item)}
                >
                    {item.leftComponent}
                    <MyText style={[
                        styles.mobileFilterItemText,
                        selectedValue === item.value && styles.mobileFilterItemTextSelected
                    ]}>
                        {item.label}
                    </MyText>
                    {item.rightComponent}
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    // Mobile modal content
    const MobileModalContent = () => {
        if (!activeMobileFilter) return null;

        return (
            <Modal
                visible={true}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setActiveMobileFilter(null)}
            >
                <View style={styles.mobileModalOverlay}>
                    <TouchableOpacity
                        style={styles.mobileModalBackdrop}
                        onPress={() => setActiveMobileFilter(null)}
                    />
                    <View style={styles.mobileModalContent}>
                        <View style={styles.mobileModalHeader}>
                            <MyText style={styles.mobileModalTitle}>
                                {activeMobileFilter === 'fuel' && 'Välj Bränsle'}
                                {activeMobileFilter === 'chassis' && 'Välj Chassi'}
                                {activeMobileFilter === 'seats' && 'Välj Antal Säten'}
                            </MyText>
                            <TouchableOpacity
                                onPress={() => setActiveMobileFilter(null)}
                                style={styles.mobileModalCloseButton}
                            >
                                {/* <Ionicons name="close" size={24} color={myColors.text.primary} />
                                */}
                                <IconClose
                                    color={myColors.text.primary}
                                    size={20}
                                />
                            </TouchableOpacity>
                        </View>

                        <MobileFilterList
                            data={
                                activeMobileFilter === 'fuel' ? FuelTypeData :
                                    activeMobileFilter === 'chassis' ? ChassisData :
                                        NoOfSeatsData
                            }
                            onSelect={
                                activeMobileFilter === 'fuel' ? handleFuelTypeChange :
                                    activeMobileFilter === 'chassis' ? handleChassisChange :
                                        handleSeatsChange
                            }
                            selectedValue={
                                activeMobileFilter === 'fuel' ? selectedFuelType :
                                    activeMobileFilter === 'chassis' ? selectedChassis :
                                        selectedSeats
                            }
                        />
                    </View>
                </View>
            </Modal>
        );
    };

    const YearRangeDropdown = () => {
        return (
            <View style={styles.container}>
                <CustomDropdown
                    visible={yearrangeDropdownVisible}
                    values={[]}
                    placeholder={`År: ${yearRange[0]}-${yearRange[1]}`}
                    error={null}
                    toggleDropdown={toggleYearRangeDropdown}
                    customPopupView={
                        <Modal
                            visible={true}
                            transparent={true}
                            animationType="none"
                            onRequestClose={toggleYearRangeDropdown}
                        >
                            <View style={styles.modalOverlay}>
                                <View style={styles.yearRangeDropdownPopup}>
                                    <YearRangeSlider
                                        minValue={yearRangeArray[0]}
                                        maxValue={yearRangeArray[1]}
                                        initialMinValue={yearRange[0]}
                                        initialMaxValue={yearRange[1]}
                                        onValueChange={handleYearRangeChange}
                                    />

                                    <TouchableOpacity onPress={toggleYearRangeDropdown} style={styles.closeButton}>
                                        <MyText style={styles.closeButtonText}>Stäng</MyText>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>
                    }
                />
            </View>
        )
    }

    const FuelTypeDropdown = () => {
        return (
            <View style={styles.container}>
                <CustomDropdownPicker
                    data={FuelTypeData}
                    value={selectedFuelType}
                    onChange={handleFuelTypeChange}
                    placeholder="Bränslen"
                    search={true}
                    searchPlaceholder="Sök Bränslen..."
                />
            </View>
        )
    }
    const ChassisDropdown = () => {
        return (
            <View style={styles.container}>
                <CustomDropdownPicker
                    data={ChassisData}
                    value={selectedChassis}
                    onChange={handleChassisChange}
                    placeholder="Chassi"
                    search={true}
                    searchPlaceholder="Sök Chassi..."
                />
            </View>
        )
    }
    const NoOfSeatsDropdown = () => {
        return (
            <View style={styles.container}>
                <CustomDropdownPicker
                    data={NoOfSeatsData}
                    value={selectedSeats}
                    onChange={handleSeatsChange}
                    placeholder="Antal säten"
                    search={true}
                    searchPlaceholder="Sök antal säten..."
                />
            </View>
        )
    }


    // Mobile modal version
    if (isMobileModal) {
        return (
            <View style={styles.mobileContainer}>
                <View style={styles.mobileFilterRowContainer}>
                    <View style={styles.mobileFilterRowHalf}>
                        {YearRangeDropdown()}
                    </View>
                    <View style={styles.mobileDivider} />
                    <View style={styles.mobileFilterRowHalf}>
                        <MobileFilterButton
                            title="Bränsle"
                            value={selectedFuelType ? FuelTypeData.find(item => item.value === selectedFuelType)?.label || 'Bränsle' : 'Bränsle'}
                            onPress={() => setActiveMobileFilter('fuel')}
                            filterType="fuel"
                        />
                    </View>
                </View>
                <View style={styles.mobileFilterRowContainer}>
                    <View style={styles.mobileFilterRowHalf}>
                        <MobileFilterButton
                            title="Chassi"
                            value={selectedChassis ? ChassisData.find(item => item.value === selectedChassis)?.label || 'Chassi' : 'Chassi'}
                            onPress={() => setActiveMobileFilter('chassis')}
                            filterType="chassis"
                        />
                    </View>
                    <View style={styles.mobileDivider} />
                    <View style={styles.mobileFilterRowHalf}>
                        <MobileFilterButton
                            title="Antal säten"
                            value={selectedSeats ? NoOfSeatsData.find(item => item.value === selectedSeats)?.label || 'Antal säten' : 'Antal säten'}
                            onPress={() => setActiveMobileFilter('seats')}
                            filterType="seats"
                        />
                    </View>
                </View>

                <MobileModalContent />
            </View>
        );
    }

    if (isDesktopWeb()) {
        return (
            <View style={styles.filterRowContainerWeb}>
                {/* <YearRangeDropdown /> */}
                {YearRangeDropdown()}
                <View style={styles.divider} />
                <FuelTypeDropdown />
                <View style={styles.divider} />
                <ChassisDropdown />
                <View style={styles.divider} />
                <NoOfSeatsDropdown />
            </View>
        )
    }

    return (
        <View>
            <View style={styles.filterRowContainer}>
                {/* <YearRangeDropdown /> */}
                {YearRangeDropdown()}
                <View style={styles.divider} />
                <FuelTypeDropdown />
            </View>
            <View style={styles.filterRowContainer}>
                <ChassisDropdown />
                <View style={styles.divider} />
                <NoOfSeatsDropdown />
            </View>
        </View>
    )
}

export default CarBrandSpeceficFilter

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // position: 'relative',
        // zIndex: 1000,
    },
    filterRowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    filterRowContainerWeb: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000,
    },
    section: {
        marginBottom: 20,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: myColors.text.primary,
    },
    countBadge: {
        backgroundColor: myColors.screenBackgroundColor,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    countText: {
        fontSize: 12,
        color: myColors.text.primary,
    },
    divider: {
        width: 8,
    },
    yearRangeDropdownPopup: {
        width: isDesktopWeb() ? 400 : MYSCREEN.WIDTH - 30,
        height: 145,
        // position: 'absolute',
        // top: 0,
        // top: 220,
        // left: 10,
        backgroundColor: myColors.white,
        borderRadius: 12,
        padding: 15,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    yearRangeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        marginTop: 20,
    },
    yearRangeTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: myColors.text.primary,
    },
    closeButton: {
        backgroundColor: myColors.black,
        borderRadius: 10,
        // padding: 10,
        height: 30,
        width: 70,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-end',
    },
    closeButtonText: {
        color: myColors.white,
    },
    // Mobile modal styles
    mobileContainer: {
        padding: 0,
    },
    mobileFilterRow: {
        marginBottom: 12,
    },
    mobileFilterRowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    mobileFilterRowHalf: {
        flex: 1,
    },
    mobileDivider: {
        width: 8,
    },
    mobileFilterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: myColors.white,
        borderWidth: 1,
        borderColor: myColors.border.light,
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        minHeight: 48,
    },
    mobileFilterButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: myColors.text.primary,
        flex: 1,
    },
    mobileFilterButtonValue: {
        fontSize: 14,
        color: myColors.text.primary,
        marginRight: 8,
        maxWidth: 120,
    },
    mobileModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    mobileModalBackdrop: {
        flex: 1,
    },
    mobileModalContent: {
        backgroundColor: myColors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
        minHeight: 300,
        flex: 1,
    },
    mobileModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: myColors.border.light,
    },
    mobileModalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: myColors.text.primary,
    },
    mobileModalCloseButton: {
        padding: 4,
    },
    mobileFilterList: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        flex: 1,
    },
    mobileFilterItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: myColors.border.light,
    },
    mobileFilterItemSelected: {
        backgroundColor: myColors.primary.light3,
    },
    mobileFilterItemText: {
        fontSize: 16,
        color: myColors.text.primary,
        marginLeft: 12,
        flex: 1,
    },
    mobileFilterItemTextSelected: {
        color: myColors.primary.main,
        fontWeight: '600',
    },
    mobileYearRangeContainer: {
        padding: 20,
        minHeight: 200,
    },
    mobileYearRangeCloseButton: {
        backgroundColor: myColors.primary.main,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignSelf: 'center',
        marginTop: 20,
    },
    mobileYearRangeCloseButtonText: {
        color: myColors.white,
        fontSize: 16,
        fontWeight: '600',
    },
})