import {View} from 'react-native';
import User16Svg from 'app/assets/svg/user16.svg';
import {camelCase, map, split} from 'lodash';
import Text from './Text';
import Image from './Image';

const Avatar = (props: any) => {
  const {item} = props;
  const size = props.size || 52;
  const nameArr = split(item?.Name || `${camelCase(item?.FirstName)} ${camelCase(item?.LastName)}`, ' ', 2);
  const name = map(nameArr, str => str[0]).join('');
  const url = item?.Image || item?.Images?.[0];
  return (
    <View className="rounded-full bg-border items-center justify-center overflow-hidden" style={{width: size, height: size}} {...props}>
      {url && <Image uri={url} className="w-full flex-[1]" />}
      {!url && name && <Text className="text-gray-500 font-bold uppercase">{name}</Text>}
      {!url && !name && <User16Svg className="text-gray-500" width={size * 0.6} height={size * 0.6} />}
    </View>
  );
};

export default Avatar;
