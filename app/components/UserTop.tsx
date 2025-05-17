import {View, TouchableOpacity} from 'react-native';
import LocationIcon from 'app/assets/svg/location-outline.svg';
import ROUTER from 'app/navigation/router';
import StarIcon from 'app/assets/svg/star.svg';
import MessageOutlineIcon from 'app/assets/svg/message-outline.svg';
import Text from 'app/components/Text';
import SherpaFavorite from './SherpaFavorite';
import {useSelector} from 'react-redux';
import {userSelector, bookingSelector} from 'app/store/selectors';
import {floorReview} from 'app/utils/helpler';
import {isEmpty, join, size, split, trim} from 'lodash';
import { useTranslation } from 'react-i18next';
import {create} from 'twrnc';
import tailwindConfig from 'tailwind.config';

const UserTop = ({navigation, style}: any) => {
  const newConfig: any = {theme: tailwindConfig.theme};
  const tw = create(newConfig);
  const {t} = useTranslation();
  const {currentUser, sherpa} = useSelector(userSelector);
  const {booking} = useSelector(bookingSelector);
  const user = booking?.VerifiedUser || sherpa || currentUser;
  const {FirstName, LastName} = user;
  const isViewSherpa = sherpa || booking;
  const {rating, number} = floorReview(user?.Reviews);
  const Messages = booking?.Messages;

  const getAddress = (address: string) => {
    const addressArr = split(address, ',');
    const addressSize = size(addressArr);
    if (addressArr[addressSize - 2] && addressArr[addressSize - 3]) {
      return join([addressArr[addressSize - 3], addressArr[addressSize - 2]], ',');
    } else {
      return join(addressArr, ',');
    }
  };
  const Address = isViewSherpa ? getAddress(user?.Address) : user.Address;
  const fullName = trim(`${FirstName} ${LastName}`) || t(isViewSherpa ? 'Sherpa' : 'myProfile');

  return (
    <View className="px-4 pb-2" style={style}>
      <View className="flex-row justify-between items-center">
        <Text className="text-2xl font-medium">
          {fullName}
        </Text>
        {isViewSherpa && (
          <View className="flex-row">
            <SherpaFavorite className="px-1.5" />
            {booking && (
              <TouchableOpacity className="px-1.5 relative" onPress={() => navigation.navigate(ROUTER.MESSAGES)}>
                <MessageOutlineIcon style={tw`text-gray-500`} />
                {!isEmpty(Messages) && (
                  <View className="bg-red-600 h-[18px] min-w-[18px] items-center justify-center absolute top-[-6px] right-0 rounded-full px-1.5">
                    <Text className="text-white text-[10px] font-bold">
                      {size(Messages) > 5 ? 5 : size(Messages)}
                      {size(Messages) > 5 ? '+' : ''}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
      {rating && (
        <View className="flex-row items-center pt-1">
          <StarIcon width={13} height={13} />
          <Text className="pl-1.5 text-gray-500 text-xs">
            {rating} ({number} {number === 1 ? 'review' : 'reviews'})
          </Text>
        </View>
      )}
      {Address && (
        <View className="flex-row items-center pt-1">
          <LocationIcon width={13} height={13} />
          <Text className="pl-1.5 text-gray-500 text-xs">{Address}</Text>
        </View>
      )}
    </View>
  );
};

export default UserTop;
