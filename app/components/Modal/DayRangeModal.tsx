/* eslint-disable react-hooks/exhaustive-deps */
import moment from 'moment';
import {useEffect, useState} from 'react';
import {Pressable, SafeAreaView, Text, TouchableOpacity, View} from 'react-native';
import DatePicker from 'react-native-date-picker';
import CloseIcon from 'app/assets/svg/close.svg';
import ArrowLeftIcon from 'app/assets/svg/arrow-left.svg';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import {useTranslation} from 'react-i18next';
import ServiceCalendar from '../ServiceCalendar';
import {getWarningAvailability} from 'app/utils/helpler';
import {split} from 'lodash';
import Modal from './Modal';
import {create} from 'twrnc';
import tailwindConfig from 'tailwind.config';

const DayRangeModal = (props: any) => {
  const newConfig: any = {theme: tailwindConfig.theme};
  const tw = create(newConfig);
  const {t} = useTranslation();
  const {modal, setModal, onConfirm, onNext, dateRange, delayTime, minDate, requiredStart, requiredEnd, availability} = props;
  const mode = props.mode || 'date';
  const [startDate, setStartDate]: any = useState(dateRange.startDate);
  const [endDate, setEndDate]: any = useState(dateRange.endDate);
  const [minimumDate, setMinimumDate]: any = useState(minDate);
  const [widthTrans, setWidthTrans]: any = useState(0);
  const [isWarning, setIsWarning]: any = useState(false);
  const [range, setRange]: any = useState(true);
  const aTransX = useSharedValue(0);
  const styleTrans = useAnimatedStyle(() => ({transform: [{translateX: aTransX.value}]}));

  useEffect(() => {
    if (modal) {
      setStartDate(dateRange.startDate);
      setEndDate(dateRange.endDate);
      setMinimumDate(minDate);
      setWidthTrans(0);
      setIsWarning(false);
      setRange(true);
    }
  }, [modal]);

  useEffect(() => {
    setMinimumDate(range ? minDate : startDate);
    setTimeout(() => {
      aTransX.value = withTiming(range ? 0 : widthTrans, {duration: 200});
    }, 20);
  }, [range]);

  useEffect(() => {
    setStartDate(dateRange?.startDate);
    setEndDate(dateRange?.endDate);
  }, [dateRange]);

  useEffect(() => {
    const newDateRange = {startDate: new Date(startDate), endDate: new Date(endDate)};
    setIsWarning(getWarningAvailability(availability, newDateRange));
  }, [startDate, endDate, availability]);

  const handleConfirm = () => {
    if (range) {
      handleSetRange(false);
      if (onNext) onNext({startDate, endDate});
    }
    if (!range && (!requiredEnd || endDate)) {
      onConfirm({startDate, endDate});
    }
  };

  const handleOnChange = (value: any) => {
    if (range) {
      setStartDate(value);
      if (endDate && endDate < value) {
        setEndDate(null);
      }
    } else {
      setEndDate(value);
    }
  };

  const handleSetRange = (value: any) => {
    if (value != range) {
      if (!value && (!requiredStart || startDate)) {
        setRange(value);
        if (startDate && delayTime && !endDate) {
          setEndDate(new Date(moment(startDate).add(getMinutes(delayTime), 'minutes').format()));
        }
      }
      if (value) {
        setRange(value);
      }
    }
  };

  const handleConfirmCalendar = (value: any) => {
    setStartDate(new Date(value.startDate));
    handleSetRange(false);
    setEndDate(new Date(value.endDate));
  };

  const getMinutes = (stringTime: any) => {
    if (!stringTime) return null;
    const [hour, minute] = split(stringTime, ':');
    return Number(hour) * 60 + Number(minute);
  };

  return (
    <Modal animationType="slide" {...props}>
      <SafeAreaView className="absolute bottom-4 w-full z-10">
        <View className="px-4">
          <View className="bg-white rounded-[10px] overflow-hidden">
            <View className="mt-4 mb-2 bg-white items-center justify-center">
              <View className="w-16 h-2 bg-[#F9F5F5] rounded-full mb-2" />
              <Text className="text-center text-lg font-medium text-textContainer">{t('selectTimeRange')}</Text>
            </View>
            <View
              className="bg-border rounded-[10px] items-center justify-center flex-row mx-4"
              onLayout={event => setWidthTrans(event.nativeEvent.layout.width)}>
              <Animated.View
                className="absolute left-0 h-full w-1/2"
                onLayout={event => setWidthTrans(event.nativeEvent.layout.width)}
                style={[styleTrans]}>
                <View className="bg-white flex-1 rounded-[10px] m-0.5" />
              </Animated.View>
              <View className={`w-1/2 p-2 rounded-[10px] flex-1 items-center justify-between flex-row`}>
                <Pressable className="w-full flex-1 pl-1" onPress={() => handleSetRange(true)}>
                  <Text className="text-xs text-textContainer text-gray-500">{t('startTime')}</Text>
                  {startDate ? (
                    <Text className={`${!range ? 'text-textContainer' : 'text-secondary'} text-xs font-medium`}>
                      {moment(startDate).format(mode === 'date' ? 'MMM DD, YYYY' : 'MMM DD, hh:mm A')}
                    </Text>
                  ) : (
                    <Text className="text-xs text-textContainer">{t('pleaseSelect')}</Text>
                  )}
                </Pressable>
                {startDate && range && (
                  <Pressable
                    className="items-center justify-center h-8 w-6"
                    onPress={() => {
                      setStartDate(null), setEndDate(null);
                    }}>
                    <View className="w-5 h-5 rounded-full items-center justify-center bg-gray-500">
                      <CloseIcon style={tw`text-white`} width={10} height={10} />
                    </View>
                  </Pressable>
                )}
              </View>
              <View className={`w-1/2 p-2 rounded-[10px] flex-1 items-center justify-between flex-row`}>
                <Pressable className="w-full flex-1 pl-1" onPress={() => handleSetRange(false)}>
                  <Text className="text-xs text-textContainer text-gray-500">{t('endTime')}</Text>
                  {endDate ? (
                    <Text className={`${range ? 'text-textContainer' : 'text-secondary'} text-xs font-medium`}>
                      {moment(endDate).format(mode === 'date' ? 'MMM DD, YYYY' : 'MMM DD, hh:mm A')}
                    </Text>
                  ) : (
                    <Text className="text-xs text-textContainer">{t('pleaseSelect')}</Text>
                  )}
                </Pressable>
                {endDate && !range && (
                  <Pressable className="items-center justify-center h-8 w-6" onPress={() => setEndDate(null)}>
                    <View className="w-5 h-5 rounded-full items-center justify-center bg-gray-500">
                      <CloseIcon style={tw`text-white`} width={10} height={10} />
                    </View>
                  </Pressable>
                )}
              </View>
            </View>
            <View className="items-center justify-center">
              <DatePicker
                theme="light"
                // androidVariant="iosClone"
                minimumDate={minimumDate}
                date={(range ? startDate : endDate) || new Date()}
                mode={mode || 'date'}
                onDateChange={handleOnChange}
                onCancel={() => setModal(false)}
              />
            </View>
            {availability && (
              <View className="pb-4">
                <Text className="px-4 pb-2 font-medium">{t('availabilityNote')}</Text>
                <ServiceCalendar
                  // {...props}
                  onConfirm={handleConfirmCalendar}
                  availability={availability}
                  selected={moment(startDate).format('YYYY-MM-DD')}
                  notShowCalendar={true}
                />
                {isWarning && (
                  <View className="flex-row items-center pt-2 px-4">
                    <Text className="text-red-600 text-[10px]">{t('warningRequest')}</Text>
                  </View>
                )}
              </View>
            )}
            <View className="bg-white rounded-[10px] h-12 flex-row items-center justify-between border-t border-border px-4">
              <View className="w-12 h-full">
                {!range && (
                  <TouchableOpacity className="flex-1 items-center justify-center" onPress={() => handleSetRange(true)}>
                    <ArrowLeftIcon style={tw`text-secondary`} />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity className="flex-1 items-center justify-center" onPress={() => handleConfirm()}>
                <Text className="text-lg font-bold text-secondary">{range ? 'Next' : 'Confirm'}</Text>
              </TouchableOpacity>
              <View className="w-12 h-full" />
            </View>
          </View>
          <TouchableOpacity className="bg-white rounded-[10px] h-12 mt-3 items-center justify-center" onPress={() => setModal(false)}>
            <Text className="text-lg font-bold text-secondary">{t('cancel')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default DayRangeModal;
