import React from 'react';
import {Dimensions, SafeAreaView, StatusBar, View, Platform} from 'react-native';
// import BgSignin from 'assets/svg/bg-signin.svg';
import LoadingScreenModal from 'app/components/Modal/LoadingScreenModal';
const dimensions = Dimensions.get('screen');

const BasicLayout = ({style, isLoading, children, light}: any) => {
  const statusBarHeight = Platform.OS === 'android' ? Number(StatusBar.currentHeight || 0) + 10 : 0;
  const paramPaddingTop = style?.find((elm: any) => elm.paddingTop)?.paddingTop || 0;
  return (
    <View style={[{paddingTop: statusBarHeight + paramPaddingTop}, style]}>
      <LoadingScreenModal isLoading={isLoading} />
      {Platform.OS !== 'ios' && <StatusBar animated={true} backgroundColor={'transparent'} barStyle={!light ? 'dark-content' : 'light-content'} />}
      <SafeAreaView className="bg-white h-full w-full">
        <View className="absolute bottom-0 w-full">
          {/* <BgSignin width={dimensions.width} height={(170 * dimensions.width) / 375} /> */}
        </View>
        {children}
      </SafeAreaView>
    </View>
  );
};
export default BasicLayout;
