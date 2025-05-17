import {StatusBar, View, Platform} from 'react-native';
import LoadingScreenModal from 'app/components/Modal/LoadingScreenModal';
import {create} from 'twrnc';
import tailwindConfig from 'tailwind.config';

const ColorLayout = ({isLoading, children, light, className}: any) => {
  const newConfig: any = {theme: tailwindConfig.theme};
  const tw = create(newConfig);
  const style = tw`${className}`;
  const statusBarHeight = Platform.OS === 'android' ? Number(StatusBar.currentHeight || 0) + 5 : 0;
  const paramPaddingTop = Number(style?.paddingTop || 0);
  return (
    <View className="h-full w-full" style={[{paddingTop: statusBarHeight + paramPaddingTop}, style]}>
      <LoadingScreenModal isLoading={isLoading} />
      {Platform.OS !== 'ios' && <StatusBar animated={true} backgroundColor={'transparent'} barStyle={!light ? 'dark-content' : 'light-content'} />}
      {children}
    </View>
  );
};
export default ColorLayout;
