import React from 'react';
import {Image, View} from 'react-native';
import Text from '../Text';
import {useTranslation} from 'react-i18next';
// import User30Svg from 'assets/svg/user30.svg';
import {CommonActions, useNavigation} from '@react-navigation/native';
import ROUTER from 'app/navigation/router';
import {useDispatch} from 'react-redux';
import {bookingAction} from 'app/store/actions';
import Toast from '../Toast';

const ToastModal = ({booking}: any) => {
  const {FirstName, LastName, Images} = booking.VerifiedUser;
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {t} = useTranslation();

  const handleNavigate = () => {
    dispatch(bookingAction.setBooking(booking));
    navigation.dispatch(CommonActions.navigate(ROUTER.BOOKING_DEAIL, {isReview: true}));
  };

  return (
    <Toast action={handleNavigate} style={options.shadow}>
      <View className="flex-row">
        <View className="relative pr-4 pt-1">
          <View className="w-10 h-10 rounded-full overflow-hidden bg-secondary items-center justify-center">
            {Images?.[0] && <Image className="w-full h-full rounded-t-md" source={{uri: Images?.[0]}} />}
            {/* {!Images?.[0] && <User30Svg className="text-gray-500" width={15} height={15} />} */}
          </View>
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold text-textContainer pb-2">
            {t('happyWith')}
            <Text className="text-secondary">
              {FirstName} {LastName}?
            </Text>
          </Text>
          <Text className="text-sm stext-textContainer">{t('toastNote')}</Text>
        </View>
      </View>
    </Toast>
  );
};

const options = {
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
};

export default ToastModal;
