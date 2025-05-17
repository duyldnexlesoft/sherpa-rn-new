import React from 'react';
import {Dimensions, Pressable, SafeAreaView, Text, View} from 'react-native';
import ServiceCalendar from '../ServiceCalendar';
import {useTranslation} from 'react-i18next';
import Modal from './Modal';
import { remapProps } from 'nativewind';
const dimensions = Dimensions.get('screen');

const AvailabilityModal = (props: any) => {
  const {setModal, availability} = props;
  const {t} = useTranslation();
  return (
    <Modal animationType="slide" {...props}>
      <SafeAreaView className="absolute bottom-4 w-full z-10">
        <View className="px-4 ">
          <View className="bg-white rounded-[10px] overflow-hidden">
          <View className="mt-4 mb-2 bg-white items-center justify-center">
            <View className="w-16 h-2 bg-[#F9F5F5] rounded-full mb-2" />
            <Text className="text-center text-lg font-medium text-textContainer">{t('availability')}</Text>
          </View>
            <View className="pb-4">
              <ServiceCalendar {...{availability}} calendarWidth={dimensions.width - 32} />
            </View>
          </View>
          <Pressable className="bg-white rounded-[10px] h-12 mt-3 items-center justify-center" onPress={() => setModal(false)}>
            <Text className="text-lg font-bold text-textContainer">{t('cancel')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
remapProps(AvailabilityModal, {className: 'style'});
export default AvailabilityModal;
