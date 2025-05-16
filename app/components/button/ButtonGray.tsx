import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import Text from '../Text';

const ButtonGray = (props: any) => {
  return (
    <TouchableOpacity className="bg-backgroundHover rounded-full h-[60px] px-6 justify-center" {...props} style={[styles.shadow]}>
      <View className="flex-row items-center">
        <Text className="text-gray-900 font-medium" style={props.style}>{props.children}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
});
export default ButtonGray;
