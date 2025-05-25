import {StatusBar, View, Platform} from 'react-native';
import LoadingScreenModal from 'app/components/Modal/LoadingScreenModal';
import {tw} from 'app/utils/helpler';

const ColorLayout = ({isLoading, children, light, className}: any) => {
  const style = tw`${className}`;
  const statusBarHeight = Platform.OS === 'android' ? Number(StatusBar.currentHeight || 0) + 5 : 0;
  const paramPaddingTop = Number(style?.paddingTop || 0);
  return (
    <View className="h-full w-full" style={[{paddingTop: statusBarHeight + paramPaddingTop}, style]}>
      <LoadingScreenModal isLoading={isLoading} />
      {children}
    </View>
  );
};
export default ColorLayout;
