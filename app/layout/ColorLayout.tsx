import React from 'react';
import {StatusBar, View, Platform} from 'react-native';
import LoadingScreenModal from 'app/components/Modal/LoadingScreenModal';

const ColorLayout = ({isLoading, children, light, style}: any) => {
  const statusBarHeight = Platform.OS === 'android' ? Number(StatusBar.currentHeight || 0) + 5 : 0;
  const paramPaddingTop = style?.find((elm: any) => elm.paddingTop)?.paddingTop || 0;
  return (
    <View className="h-full w-full" style={[{paddingTop: statusBarHeight + paramPaddingTop}, style]}>
      <LoadingScreenModal isLoading={isLoading} />
      {Platform.OS !== 'ios' && <StatusBar animated={true} backgroundColor={'transparent'} barStyle={!light ? 'dark-content' : 'light-content'} />}
      {children}
    </View>
  );
};
export default ColorLayout;
