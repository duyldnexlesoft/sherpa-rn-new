import React from 'react';
import {View} from 'react-native';
import Text from '../Text';
import Button from '../button/Button';
import WarningSvg from 'app/assets/svg/warning.svg';
import moment from 'moment';
import {useTranslation} from 'react-i18next';
import Modal from './Modal';
import { remapProps } from 'nativewind';

const CancelBookingModal = (props: any) => {
  const {setModal, onSubmit, booking} = props;
  const {t} = useTranslation();
  const isRefunded = moment().diff(moment(booking.StartTime), 'days') > 0;
  return (
    <Modal animationType="fade" {...props} className="items-center justify-center">
      <View className="w-full p-8">
        {!isRefunded && (
          <View className="w-full bg-white rounded-[10px] p-8 items-center">
            <Text className="text-base text-black font-bold mb-2">{t('cancelBooking')}</Text>
            <Text className="text-sm text-black text-center">{t('cancelBookingNote')}</Text>
            <View className="flex-row mt-4">
              <Button onPress={() => setModal(false)}>{t('cancel')}</Button>
              <Button className="ml-3 bg-primary" onPress={onSubmit}>
                {t('sure')}
              </Button>
            </View>
          </View>
        )}
        {isRefunded && (
          <View className="w-full bg-white rounded-[10px] p-8 items-center">
            <WarningSvg />
            <Text className="text-base text-black font-bold mb-2 mt-4">{t('warning')}</Text>
            <Text className="text-sm text-black text-center">
              {t('cancelBookingWarning1')}
              <Text className="font-bold">50%</Text>
              {t('cancelBookingWarning2')}
            </Text>
            <View className="flex-row items-center w-full pt-2 px-2">
              <Text className="text-gray-500 w-36 text-xs">{t('startTimeBooking')}</Text>
              <Text className="text-gray-500 text-xs">{moment(booking.StartTime).format('ddd, MMM DD, hh:mmA')}</Text>
            </View>
            <View className="flex-row items-center w-full pt-2 px-2">
              <Text className="text-gray-500 w-36 text-xs">{t('duration')}</Text>
              <Text className="text-gray-500 text-xs">{moment(booking.StartTime).diff(moment(), 'hours')} hour</Text>
            </View>
            <View className="flex-row mt-4">
              <Button onPress={() => setModal(false)}>{t('cancel')}</Button>
              <Button className="ml-3 bg-primary" onPress={onSubmit}>
                {t('iGotIt')}
              </Button>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};
remapProps(CancelBookingModal, {className: 'style'});
export default CancelBookingModal;
