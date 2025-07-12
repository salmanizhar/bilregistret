import { myColors } from '@/constants/MyColors';
import React, { Component } from 'react';
import { StyleSheet, View, ActivityIndicator, ViewStyle } from 'react-native';


interface MyLoaderProps {
    // Add any props if needed
}

interface MyLoaderState {
    is_loading: number;
    updated: boolean;
}

// This is used from Apps.js, and then used by reference in whole application
export default class MyLoader extends Component<MyLoaderProps, MyLoaderState> {
    private loaderInterval: NodeJS.Timeout | null;
    private loaderStopTimeOut: number; // In Seconds to wait for kill the loader
    private countDownValue: number;

    constructor(props: MyLoaderProps) {
        super(props);

        // Added feature on 13th April 2023
        this.loaderInterval = null;
        this.loaderStopTimeOut = 30; // In Seconds to wait for kill the loader
        this.countDownValue = 0;

        this.state = {
            is_loading: 0,
            updated: false,
        };

        this.show_loader = this.show_loader.bind(this);
    }

    componentDidMount(): void {
        // ADD ORIENTATION LISTENER
        this.countDownValue = 0;
        clearInterval(this.loaderInterval as NodeJS.Timeout);
    }

    componentWillUnmount(): void {
        // REMOVE ORIENTATION LISTENER
        this.countDownValue = 0;
        clearInterval(this.loaderInterval as NodeJS.Timeout);
    }

    show_loader(is_loader: number): void {
        // Stop previous timer in any case, before start new timer. Other wise it will create multile timers
        this.countDownValue = 0;
        // // console.log('this.countDownValue = ' + this.countDownValue)
        clearInterval(this.loaderInterval as NodeJS.Timeout);

        // If user has stopped loader then reset counter
        if (is_loader == 1) {
            this.countDownValue = this.loaderStopTimeOut;
            // // console.log('this.countDownValue = ' + this.countDownValue)
            this.actLoaderResume();
        }

        this.setState({ is_loading: is_loader });
    }

    actLoaderResume = async (): Promise<void> => {
        this.loaderInterval = setInterval(() => {
            this.recurrentTask();

            if (this.countDownValue <= 0) {
                // // console.log('Forse fully stopping Loader')
                clearInterval(this.loaderInterval as NodeJS.Timeout);
                this.setState({
                    is_loading: 0,
                    updated: !this.state.updated,
                });
            }
        }, 1000);
    };

    recurrentTask = (): void => {
        this.countDownValue -= 1;
        // // console.log('this.countDownValue = ' + this.countDownValue)
    };

    render(): React.ReactNode {
        if (this.state.is_loading == 0) {
            return <View />;
        }
        return (
            <View style={styles.maincontainer}>
                <View style={styles.container}>
                    <View
                        style={{
                            width: 150,
                            height: 150,
                            justifyContent: 'center',
                            backgroundColor: '#fff',
                            borderRadius: 8,
                        }}>
                        {/* BEGIN METHOD FOR DISPLAY LOADER VIEW */}

                        <ActivityIndicator
                            style={{}}
                            size="large"
                            color={myColors.primary.main}
                        />

                        {/* END METHOD FOR DISPLAY LOADER VIEW */}
                    </View>
                </View>
            </View>
        );
    }
}

interface Styles {
    maincontainer: ViewStyle;
    container: ViewStyle;
    // text: ViewStyle;
}

const styles = StyleSheet.create<Styles>({
    maincontainer: {
        backgroundColor: myColors.backgroundDimmingColor,
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        flex: 1,
        zIndex: 100000,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // text: {
    //     color: myColors.black,
    //     fontSize: 18,
    //     marginTop: 16,
    //     marginLeft: 35,
    //     marginRight: 35,
    // },
});