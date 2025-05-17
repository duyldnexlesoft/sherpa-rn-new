import {Dimensions, SafeAreaView, StatusBar, View, Platform} from 'react-native';
import BgSignin from 'app/assets/svg/bg-signin.svg';
import LoadingScreenModal from 'app/components/Modal/LoadingScreenModal';
import {create} from 'twrnc';
import tailwindConfig from 'tailwind.config';
const dimensions = Dimensions.get('screen');

const BasicLayout = ({className, isLoading, children, light}: any) => {
  const newConfig: any = {theme: tailwindConfig.theme};
  const tw = create(newConfig);
  const style = tw`${className}`;
  const statusBarHeight = Platform.OS === 'android' ? Number(StatusBar.currentHeight || 0) + 10 : 0;
  const paramPaddingTop = Number(style?.paddingTop || 0);
  return (
    <View style={[{paddingTop: statusBarHeight + paramPaddingTop}, style]}>
      <LoadingScreenModal isLoading={isLoading} />
      {Platform.OS !== 'ios' && <StatusBar animated={true} backgroundColor={'transparent'} barStyle={!light ? 'dark-content' : 'light-content'} />}
      <SafeAreaView className="bg-white h-full w-full">
        <View className="absolute bottom-0 w-full">
          <BgSignin width={dimensions.width} height={(170 * dimensions.width) / 375} />
        </View>
        {children}
      </SafeAreaView>
    </View>
  );
};
export default BasicLayout;
