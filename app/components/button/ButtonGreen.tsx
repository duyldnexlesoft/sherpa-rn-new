import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import Text from '../Text';

export interface ButtonProps {
  style?: any;
  children?: React.ReactNode;
  onPress?: any;
  disabled?: any;
  className?: any;
}

const ButtonGreen = (props: ButtonProps) => {
  return (
    <View className="bg-white w-full rounded-md overflow-hidden">
      <TouchableOpacity
        accessibilityRole="button"
        className={`bg-primary w-full active:opacity-80 ${props.disabled ? 'opacity-60' : ''}`}
        disabled={props.disabled}
        {...props}>
        <Text className="text-center text-gray-900 text-sm font-semibold p-4 uppercase">{props.children}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ButtonGreen;
