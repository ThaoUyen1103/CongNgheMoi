import React from 'react';
import { Text } from 'react-native';

export const ThemedText = ({ style, ...props }) => {
    return <Text style={[style]} {...props} />;
};