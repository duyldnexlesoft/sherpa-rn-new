import {TouchableOpacity, View} from 'react-native';
import ArrowRightIcon from 'app/assets/svg/arrow-right.svg';
import Text from '../Text';
import {remapProps} from 'nativewind';
import Svg from '../Svg';

const ButtonBlue = (props: any) => {
  const {children, noIcon, uppercase, disabled} = props;
  return (
    <TouchableOpacity className={`bg-secondary rounded-full h-[60px] px-6 justify-center ${disabled ? 'opacity-40' : ''}`} {...props}>
      <View className="flex-row items-center ">
        <Text className={`text-white font-medium ${uppercase ? 'uppercase' : ''}`}>{children}</Text>
        {!noIcon && <Svg icon={ArrowRightIcon} className="text-white ml-2" width={7} />}
      </View>
    </TouchableOpacity>
  );
};
remapProps(ButtonBlue, {className: 'style'});
export default ButtonBlue;
