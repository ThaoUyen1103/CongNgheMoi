import React from 'react';
import { View } from 'react-native';

export const ThemedView = ({ style, ...props }) => {
    return <View style={[style]} {...props} />;
};