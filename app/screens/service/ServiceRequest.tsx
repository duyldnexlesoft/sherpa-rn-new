import Header from 'app/components/Header';
import {SafeAreaView, Text, TouchableOpacity, View} from 'react-native';
import WarningIcon from 'app/assets/svg/warning-outline.svg';
import ArrowLeft16Icon from 'app/assets/svg/arrow-left-16.svg';
import RunningSvg from 'app/assets/svg/Running.svg';
import WalkingSvg from 'app/assets/svg/Walking.svg';
import CyclingSvg from 'app/assets/svg/Cycling.svg';
import HikingSvg from 'app/assets/svg/Hiking.svg';
import PersonalTrainingSvg from 'app/assets/svg/PersonalTraining.svg';
import PerformativeSports from 'app/assets/svg/PerformativeSports.svg';
import GolfSvg from 'app/assets/svg/Golf.svg';
import TennisSvg from 'app/assets/svg/Tennis.svg';
import OtherSvg from 'app/assets/svg/Other.svg';
import FeeIcon from 'app/assets/svg/fee.svg';
import {useEffect, useState} from 'react';
import moment from 'moment';
import {floor} from 'lodash';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {createUserOrder, updateUserOrder} from 'app/api/userOrderApi';
import ColorLayout from 'app/layout/ColorLayout';
import ROUTER from 'app/navigation/router';
import AvailabilityModal from 'app/components/Modal/AvailabilityModal';
import {getAvailability} from 'app/api/availabilityApi';
import {STATUS, CATEGORIES} from 'app/utils/constants';
import ButtonBlue from 'app/components/button/ButtonBlue';
import DayRangeModal from 'app/components/Modal/DayRangeModal';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {getWarningAvailability} from 'app/utils/helpler';
import Alert from 'app/components/Alert';
import {userSelector} from 'app/store/selectors';
import UpdateProfileModal from 'app/components/Modal/UpdateProfileModal';
import Svg from 'app/components/Svg';

const ServiceRequest = (props: any) => {
  const {t} = useTranslation();
  const {currentUser} = useSelector(userSelector);
  const queryClient = useQueryClient();
  const {booking, service, verifiedUser, rangeDate, isUpdated} = props?.route?.params;
  const DefaultAmountTime = service.DefaultAmountTime || 0;
  const {RUNNING, WALKING, CYCLING, HIKING, PERSONAL_TRAINING, GOLF, TENNIS, PERFORMATIVE_SPORTS, OTHER} = CATEGORIES;
  const [width, setWidth]: any = useState(0);
  const [isWarning, setIsWarning]: any = useState(false);
  const [dateRange, setDateRange]: any = useState({startDate: new Date(rangeDate.startDate), endDate: new Date(rangeDate.endDate)});
  const [dateRangeModal, setDateRangeModal]: any = useState(false);
  const [calendarModal, setCalendarModal]: any = useState(false);
  const [updateModal, setUpdateModal]: any = useState(false);
  const [availability, setAvailability]: any = useState(null);

  const {data: dataAvailability} = useQuery({
    queryKey: ['getAvailability', verifiedUser._id],
    queryFn: () => getAvailability(verifiedUser._id),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (dataAvailability?.data?.data) {
      setAvailability(dataAvailability.data.data);
    }
  }, [dataAvailability?.data?.data]);

  const muCreateUserOrder = useMutation({
    mutationKey: ['createUserOrder'],
    mutationFn: createUserOrder,
    onSuccess: ({data}: any) => {
      if (data?.code === 201) {
        props.navigation.navigate(ROUTER.HOME, {screen: ROUTER.BOOKINGS});
      } else if (data?.code === 409) {
        Alert.alert(t('serviceOld'));
        props.navigation.navigate(ROUTER.HOME, {screen: ROUTER.EXPLORE});
      } else {
        Alert.alert(t('requestFailed'));
      }
    },
    onError: () => {},
  });

  const muUpdateUserOrder = useMutation({
    mutationKey: ['updateUserOrder'],
    mutationFn: updateUserOrder,
    onSuccess: ({data}: any) => {
      if (data?.code === 200) {
        props.navigation.goBack();
        queryClient.invalidateQueries({queryKey: ['getUserOrders']});
      } else {
        Alert.alert(t('requestFailed'));
      }
    },
    onError: () => {},
  });

  useEffect(() => {
    setIsWarning(getWarningAvailability(availability, dateRange));
  }, [dateRange, availability]);

  const onConfirm = (rDate: any) => {
    setDateRange(rDate);
    setDateRangeModal(false);
  };

  const handleRequest = async () => {
    if (!currentUser.FirstName || !currentUser.LastName) {
      setUpdateModal(true);
      return;
    }

    if (booking) {
      const patams = {_id: booking._id, StartTime: dateRange.startDate, EndTime: dateRange.endDate, Status: STATUS.REQUESTED};
      await muUpdateUserOrder.mutateAsync(patams);
    } else {
      const OrderAmount = calculateAmount();
      const orderFee = floor(OrderAmount * 0.03 + 29);
      const patams = {
        VerifiedUserId: verifiedUser._id,
        ServiceId: service._id,
        StartTime: dateRange.startDate,
        EndTime: dateRange.endDate,
        OrderFee: orderFee,
        Amount: service.Amount,
        OrderAmount,
        TotalAmount: OrderAmount + orderFee,
      };
      await muCreateUserOrder.mutateAsync(patams);
    }
    queryClient.invalidateQueries({queryKey: ['getUserOrders']});
  };
  const handleBack = () => props.navigation.navigate(ROUTER.SERVICE_DETAIL, {verifiedUser, service});
  const handleUpdateProfile = () => props.navigation.navigate(ROUTER.EDIT_GALLERY, {isUpdateProfile: true, service, verifiedUser, rangeDate});
  const getMinutes = () => moment(dateRange.endDate).diff(moment(dateRange.startDate), 'minutes');
  const calculateAmount = () => floor((booking?.Amount || service.Amount) * (getMinutes() / 60));

  return (
    <ColorLayout isLoading={muCreateUserOrder.isPending} className="bg-white">
      <Header {...props} showHeaderTitle leftAction={isUpdated && handleBack} />
      <View className="flex-1 bg-white p-4 items-center">
        <View className="flex-row">
          <Text className="font-bold">{t('bookedService1')}</Text>
          <Text className="font-bold text-secondary">{service.Category}</Text>
          <Text className="font-bold">{t('bookedService2')}</Text>
          <Text className="font-bold text-secondary">
            {verifiedUser?.FirstName} {verifiedUser?.LastName}
          </Text>
        </View>
        <View className="w-full rounded-[10px] bg-lightPrimary overflow-hidden mt-3" onLayout={event => setWidth(event.nativeEvent.layout.width)}>
          {service.Category === RUNNING && <RunningSvg width={width} height={130 * (width / 325)} />}
          {service.Category === WALKING && <WalkingSvg width={width} height={130 * (width / 325)} />}
          {service.Category === CYCLING && <CyclingSvg width={width} height={130 * (width / 325)} />}
          {service.Category === HIKING && <HikingSvg width={width} height={130 * (width / 325)} />}
          {service.Category === PERSONAL_TRAINING && <PersonalTrainingSvg width={width} height={130 * (width / 325)} />}
          {service.Category === GOLF && <GolfSvg width={width} height={130 * (width / 325)} />}
          {service.Category === TENNIS && <TennisSvg width={width} height={130 * (width / 325)} />}
          {service.Category === PERFORMATIVE_SPORTS && <PerformativeSports width={width} height={130 * (width / 325)} />}
          {service.Category === OTHER && <OtherSvg width={width} height={130 * (width / 325)} />}
          <View className="w-full p-4  flex-row items-center justify-between">
            <View className="w-9 h-9 rounded-full bg-primary items-center justify-center">
              <Text className="text-white text-xs font-medium">{floor(getMinutes() / 60, 1)}h</Text>
            </View>
            <View className="flex-row flex-1 pl-3 items-center">
              <View>
                <Text className="text-activePrimary font-medium">{moment(dateRange.startDate).format('ddd, MMM DD')}</Text>
                <Text className="text-primary text-xs">{moment(dateRange.startDate).format('hh:mm A')}</Text>
              </View>
              <Svg icon={ArrowLeft16Icon} className="text-primary mx-2" />
              <View>
                <Text className="text-activePrimary font-medium">{moment(dateRange.endDate).format('ddd, MMM DD')}</Text>
                <Text className="text-primary text-xs">{moment(dateRange.endDate).format('hh:mm A')}</Text>
              </View>
            </View>
            <Text className="text-activeSecondary font-medium">${(calculateAmount() / 100).toFixed(2)}</Text>
          </View>
          <View className="overflow-hidden h-[1px] px-4">
            <View className="w-full border border-dashed border-primary" />
          </View>
          <View className="w-full p-4 flex-row items-center justify-between">
            <View className="w-9 h-9 rounded-full bg-primary items-center justify-center">
              <Svg icon={FeeIcon} className="text-white" width={18} height={18} />
            </View>
            <View className="flex-1 pl-3">
              <Text className="text-activePrimary font-medium">{t('processingFee1')}</Text>
              <Text className="text-primary text-xs">{t('processingFee2')}</Text>
            </View>
            <Text className="text-activeSecondary font-medium">${(floor(calculateAmount() * 0.03 + 29) / 100).toFixed(2)}</Text>
          </View>
        </View>
        {isWarning && (
          <>
            <View className="flex-row items-center pt-2">
              <Svg icon={WarningIcon} width={16} className="text-red-600" />
              <Text className="text-red-600 text-[10px] pl-2">{t('warningRequest')}</Text>
            </View>
            <TouchableOpacity className="bg-border rounded-full h-[60px] px-8 mt-4 justify-center" onPress={() => setDateRangeModal(true)}>
              <View className="flex-row items-center">
                <Text className="font-medium">{t('selectOtherTime')}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity className="mt-4" onPress={() => setCalendarModal(true)}>
              <Text className="text-primary underline">{t('viewAvailability')}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      <SafeAreaView className="mb-4">
        <View className="w-full px-4 pt-2 flex-row items-center justify-between bg-white">
          <View>
            <Text className="text-red-600 font-bold text-lg">${(floor(calculateAmount() + calculateAmount() * 0.03 + 29) / 100).toFixed(2)}</Text>
            <Text className="text-xs text-gray-500">{t('processfrees')}</Text>
          </View>
          <ButtonBlue uppercase onPress={handleRequest}>
            {t('request')}
          </ButtonBlue>
        </View>
      </SafeAreaView>
      <DayRangeModal
        {...{modal: dateRangeModal, setModal: setDateRangeModal, dateRange, onConfirm, availability, mode: 'datetime'}}
        minDate={new Date(moment().add(1, 'hours').format())}
        delayTime={DefaultAmountTime}
        requiredStart
        requiredEnd
      />
      <AvailabilityModal {...{modal: calendarModal, setModal: setCalendarModal, availability, onConfirm}} />
      <UpdateProfileModal {...{modal: updateModal, setModal: setUpdateModal, onSubmit: handleUpdateProfile}} />
    </ColorLayout>
  );
};
export default ServiceRequest;
