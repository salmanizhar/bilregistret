import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native'
import React from 'react'

type Props = {
    children: React.ReactNode
}

const KeyboardAvoidingWrapper = (props: Props) => {
    if (Platform.OS === 'ios') {
        return (
            <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
                {props.children}
            </KeyboardAvoidingView>
        )
    }
    return (
        <>
            {props.children}
        </>
    )
}


export default KeyboardAvoidingWrapper

const styles = StyleSheet.create({})