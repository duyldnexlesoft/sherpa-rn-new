import Text from 'app/components/Text';
import {Pressable, StyleSheet, View} from 'react-native';
import ImageIcon from 'app/assets/svg/image.svg';
import LocationIcon from 'app/assets/svg/location-outline.svg';
import ROUTER from 'app/navigation/router';
import SherpaFavorite from 'app/components/SherpaFavorite';
import {useDispatch} from 'react-redux';
import {bookingAction, userAction} from 'app/store/actions';
import Image from './Image';
import Svg from './Svg';

const BoxShepa = ({item, navigation}: any) => {
  const dispatch = useDispatch();
  if (!item) {
    return <View className="h-48 flex-1" />;
  }  
  const handleViewSherpa = () => {
    dispatch(userAction.setSherpa(item));
    dispatch(bookingAction.cleanBooking());
    navigation.navigate(ROUTER.USER_DETAIL);
  };

  return (
    <Pressable className="w-1/2 bg-white flex-1 rounded-md h-48" style={styles.shadowBox} onPress={handleViewSherpa}>
      {item?.Images?.[0] ? (
        <Image className="w-full h-28 rounded-t-md" uri={item?.Images?.[0]} />
      ) : (
        <View className="w-full h-28 rounded-t-md bg-backgroundHover items-center justify-center">
          <Svg icon={ImageIcon} width={40} height={40} className='text-gray-200' />
        </View>
      )}
      <View className="px-2.5 py-2">
        <Text className="font-medium text-textContainer">
          {item.FirstName} {item.LastName}
        </Text>
        <View className="flex-row mt-1 overflow-hidden">
          {item?.Services?.map((service: any, index: any) => (
            <View className="bg-backgroundHover h-5 px-1 mr-1.5 items-center justify-center rounded-sm border border-border" key={`ca-${index}`}>
              <Text className="text-xs text-gray-500">{service.Category}</Text>
            </View>
          ))}
        </View>
        {item?.Services?.[0] && (
          <View className="flex-row items-center mt-1">
            <LocationIcon width={13} height={13} />
            <Text className="text-xs flex-1 text-gray-500 ml-1" numberOfLines={1}>
              {item.Services[0].StartAddress}
            </Text>
          </View>
        )}
      </View>
      <SherpaFavorite className="absolute rounded-full w-7 h-7 bg-white items-center justify-center top-1 right-1" verifiedUser={item} size={16} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  shadowBox: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
});

export default BoxShepa;
