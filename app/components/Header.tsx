import {Platform, Pressable, SafeAreaView, StatusBar, View} from 'react-native';
import {CommonActions} from '@react-navigation/native';
import ArrowLeft from 'app/assets/svg/arrow-left.svg';
import Text from './Text';
import Svg from './Svg';

const Header = ({navigation, showLeft = true, leftAction, absolute, route, showHeaderTitle, renderRight, title}: any) => {
  const statusBarHeight = Platform.OS === 'android' && absolute ? Number(StatusBar.currentHeight || 0) + 10 : 0;
  return (
    <SafeAreaView className={` ${absolute ? 'absolute' : ''} z-[1] w-full`}>
      <View className="px-4 flex-row justify-between items-center" style={{paddingTop: statusBarHeight}}>
        {showLeft ? (
          <Pressable
            className="rounded-full w-9 h-9 items-center justify-center bg-white border border-border"
            onPress={() => (leftAction ? leftAction() : navigation?.dispatch(CommonActions.goBack()))}>
            <Svg icon={ArrowLeft} className="text-textContainer" />
          </Pressable>
        ) : (
          <View className="w-9 h-9" />
        )}

        {showHeaderTitle && <Text className="text-lg font-medium">{title || route?.name}</Text>}
        {renderRight ? renderRight() : <View className="w-9 h-9" />}
      </View>
    </SafeAreaView>
  );
};

export default Header;
