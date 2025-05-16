import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import ArrowRightIcon from 'assets/svg/arrow-right.svg';
import Text from '../Text';

const ButtonBlue = (props: any) => {
  const { children, noIcon, uppercase, disabled } = props;
  return (
    <TouchableOpacity className={`bg-secondary rounded-full h-[60px] px-6 justify-center ${disabled ? 'opacity-40' : ''}`} {...props}>
      <View className="flex-row items-center ">
        <Text className={`text-white font-medium ${uppercase ? 'uppercase' : ''}`}>{children}</Text>
        {!noIcon && <ArrowRightIcon className="text-white ml-2" width={7} />}
      </View>
    </TouchableOpacity>
  );
};


export default ButtonBlue;
