import SliderImage from 'app/components/SliderImage';
import {useEffect, useState} from 'react';
import {View, SafeAreaView, Pressable, StyleSheet, TouchableOpacity} from 'react-native';
import Header from 'app/components/Header';
import Animated, {useAnimatedScrollHandler, useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import Edit from 'app/assets/svg/edit.svg';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import ColorLayout from 'app/layout/ColorLayout';
import UserTop from 'app/components/UserTop';
import Text from 'app/components/Text';
import {STATUS} from 'app/utils/constants';
import TextLazy from 'app/components/TextLazy';
import LocationIcon from 'app/assets/svg/location.svg';
import DashIcon from 'app/assets/svg/dash.svg';
import CalendarIcon from 'app/assets/svg/calendar.svg';
import FeeIcon from 'app/assets/svg/fee.svg';
import CopySvg from 'app/assets/svg/copy.svg';
import ImageIcon from 'app/assets/svg/image.svg';
import {floor} from 'lodash';
import moment from 'moment';
import LabelStatus from 'app/components/LabelStatus';
import ROUTER from 'app/navigation/router';
import ButtonBlue from 'app/components/button/ButtonBlue';
import {formatTimeRequest, getReviewAthlete, getStatus} from 'app/utils/helpler';
import ButtonGray from 'app/components/button/ButtonGray';
import {cancelUserOrder} from 'app/api/userOrderApi';
import Clipboard from '@react-native-clipboard/clipboard';
import {Snackbar} from 'react-native-paper';
import ReviewModal from 'app/components/Modal/ReviewModal';
import {createReview} from 'app/api/reviewApi';
import CancelBookingModal from 'app/components/Modal/CancelBookingModal';
import DayRangeModal from 'app/components/Modal/DayRangeModal';
import {useDispatch, useSelector} from 'react-redux';
import {bookingSelector} from 'app/store/selectors';
import {bookingAction} from 'app/store/actions';
import {useTranslation} from 'react-i18next';
import Image from 'app/components/Image';
import {getAvailability} from 'app/api/availabilityApi';
import Svg from 'app/components/Svg';
const {REQUESTED, ACCEPTED, CONFIRMED, COMPLETED, CANCELED, REFUNDED} = STATUS;

const BookingDetail = (props: any) => {
  const {t} = useTranslation();
  const {navigation} = props;
  const isViewSherpa = true;
  const isReview = props?.route?.params?.isReview;
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [isEdit, setIsEdit] = useState(false);
  const [dateRangeModal, setDateRangeModal]: any = useState(false);
  const [dateRange, setDateRange]: any = useState({startDate: null, endDate: null});
  const [isRerequest, setIsRerequest]: any = useState(true);
  const [cancelModal, setCancelModal]: any = useState(false);
  const [reviewModal, setReviewModal]: any = useState(!!isReview);
  const [visibleSnackbar, setVisibleSnackbar] = useState(false);
  const [availability, setAvailability]: any = useState(null);
  const {booking} = useSelector(bookingSelector);

  const {_id, OrderAmount, Status, StartTime, EndTime, VerifiedUser, User, Service, OrderPayment} = booking;
  const Review = getReviewAthlete(booking);
  const transOpacity = useSharedValue(0);
  const transTop = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event: any) => {
    transTop.value = event.contentOffset.y < 0 ? 0 : event.contentOffset.y;
    let index = event.contentOffset.y - 230;
    transOpacity.value = (index > 50 ? 50 : index < 0 ? 0 : index) / 50;
  });

  const styleOpacity = useAnimatedStyle(() => ({opacity: transOpacity.value, zIndex: transOpacity.value * 2}));
  const styleSliderTop = useAnimatedStyle(() => ({transform: [{translateY: transTop.value}]}));

  const {data} = useQuery({
    queryKey: ['getAvailability', VerifiedUser._id],
    queryFn: () => getAvailability(VerifiedUser._id),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (data?.data?.data) {
      setAvailability(data.data.data);
    }
  }, [data?.data?.data]);

  const muCancelUserOrder = useMutation({
    mutationKey: ['cancelUserOrder'],
    mutationFn: cancelUserOrder,
    onSuccess: (response: any) => {
      if (response?.data?.code === 200) {
        dispatch(bookingAction.setBooking({...booking, Status: CANCELED}));
        queryClient.invalidateQueries({queryKey: ['getUserOrders']});
      }
    },
    onError: () => {},
  });

  const mucCreateReview = useMutation({
    mutationKey: ['cancelUserOrder'],
    mutationFn: createReview,
    onSuccess: (response: any) => {
      if (response?.data?.code === 201) {
        queryClient.invalidateQueries({queryKey: ['getUserOrders']});
        setReviewModal(false);
      }
    },
    onError: () => {},
  });

  const handleConfirm = ({startDate, endDate}: any) => {
    if (startDate && endDate) {
      const rangeDate = {startDate: moment(startDate).format(), endDate: moment(endDate).format()};
      props.navigation.navigate(ROUTER.SERVICE_REQUEST, {
        booking: isRerequest ? null : booking,
        service: Service,
        verifiedUser: VerifiedUser,
        rangeDate,
      });
      setTimeout(() => {
        setDateRangeModal(false);
      }, 0);
    }
  };

  const handleReview = (Rating: any, Comment: any) => {
    if (Rating > 0) {
      const UserId = User._id;
      const VerifiedUserId = VerifiedUser._id;
      mucCreateReview.mutate({UserId, VerifiedUserId, UserOrderId: _id, Rating, Comment});
    }
  };

  const copyToClipboard = (value: string) => {
    Clipboard.setString(`${value}`);
    setVisibleSnackbar(true);
  };

  const handleCancel = () => {
    muCancelUserOrder.mutate({_id});
    setCancelModal(false);
  };

  const handleOpenChangeDate = () => {
    setIsRerequest(false);
    setDateRangeModal(true);
    setDateRange({startDate: new Date(StartTime), endDate: new Date(EndTime)});
  };

  const renderRight = () => (
    <Pressable className="rounded-full w-9 h-9 items-center justify-center bg-white border border-border" onPress={() => setIsEdit(!isEdit)}>
      <Edit width={18} className="text-textContainer" />
    </Pressable>
  );
  const getMinutes = () => moment(EndTime).diff(moment(StartTime), 'minutes');

  return (
    <ColorLayout isLoading={muCancelUserOrder.isPending} className="pt-0 bg-white">
      <Header {...props} absolute renderRight={!isViewSherpa && renderRight} />
      <Animated.View style={[styleOpacity]}>
        <SafeAreaView className="absolute w-full bg-white z-10" style={styles.shadowTop}>
          <UserTop navigation={navigation} />
        </SafeAreaView>
      </Animated.View>
      <Animated.ScrollView className="h-full" showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} onScroll={scrollHandler}>
        <Animated.View className="absolute bg-backgroundHover" style={[styleSliderTop]}>
          <SliderImage height={300} {...props} {...booking.VerifiedUser} isViewSherpa={true} />
        </Animated.View>
        <View className="pt-4 top-[250px] bg-white rounded-t-[20px] pb-[250px] z-[2]">
          <UserTop navigation={navigation} className="border-b border-border" />
          <View className="px-4 py-3 divide-y divide-border">
            <View className="pb-4">
              <View className="bg-lightSecondary rounded-[10px] p-2.5 flex-row items-center">
                <View className="w-[62px] h-[40px] mr-2.5 rounded overflow-hidden bg-gray-100 items-center justify-center">
                  {Service?.Images?.[0] && <Image uri={Service.Images?.[0]} className="w-full flex-[1]" />}
                  {!Service?.Images?.[0] && <Svg icon={ImageIcon} className="text-gray-300" width={22} height={22} />}
                </View>
                <View className="flex-1 ">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base font-medium">{Service.Name}</Text>
                    <View className="flex-row items-center">
                      <View className="bg-white items-center justify-center ml-2 px-1.5 py-0.5 rounded-sm">
                        <Text className="text-[10px] text-gray-500">{Service?.Category}</Text>
                      </View>
                    </View>
                  </View>
                  <View className="flex-row items-center justify-between pt-1 mb-1">
                    <View className="flex-row items-center">
                      {Service.DefaultAmountTime && (
                        <>
                          <Text className="text-xs text-gray-500">{t('defaulDuration')}: </Text>
                          <Text className="text-xs text-gray-500 font-bold">{Service.DefaultAmountTime}</Text>
                        </>
                      )}
                    </View>
                    <Text className="text-xs font-medium text-secondary">${(Service.Amount / 100).toFixed(2)}/h</Text>
                  </View>
                </View>
              </View>
              <Text className="font-medium mt-4">{t('description')}</Text>
              <TextLazy className="text-gray-500 mt-2">{Service.Description}</TextLazy>
              {Service.SpecialInstruction && (
                <>
                  <Text className="font-medium mt-4">{t('specialInstructions')}</Text>
                  <TextLazy className="text-gray-500 mt-2">{Service.SpecialInstruction}</TextLazy>
                </>
              )}
            </View>
            <View className="py-4">
              <View className="flex-row items-center">
                <Svg icon={LocationIcon} width={18} className="text-primary" />
                <Text className="pl-2" numberOfLines={1} ellipsizeMode="tail">
                  {Service.StartAddress}
                </Text>
              </View>
              {Service.EndAddress && (
                <>
                  <Svg icon={DashIcon} className="my-[1px]" />
                  <View className="flex-row items-center">
                    <Svg icon={LocationIcon} width={18} className="text-secondary" />
                    <Text className="pl-2" numberOfLines={1} ellipsizeMode="tail">
                      {Service.EndAddress}
                    </Text>
                  </View>
                </>
              )}
            </View>
            <View className="py-4">
              <View className="flex-row items-center justify-between">
                <View>
                  <View className="flex-row items-center">
                    <Svg icon={CalendarIcon} className="text-primary mr-2" width={20} height={20} />
                    <Text className="text-textContainer">{moment(StartTime).format('ddd, MMM DD, ')}</Text>
                    <Text className="text-gray-500">{moment(StartTime).format('hh:mm A')}</Text>
                  </View>
                  <Svg icon={DashIcon} className="my-[1px]" />
                  <View className="flex-row items-center">
                    <Svg icon={CalendarIcon} className="text-secondary mr-2" width={20} height={20} />
                    <Text className="text-textContainer">{moment(EndTime).format('ddd, MMM DD, ')}</Text>
                    <Text className="text-gray-500">{moment(EndTime).format('hh:mm A')}</Text>
                  </View>
                </View>
                <View className="items-end">
                  {!booking?.OrderPayment && (
                    <Text className="pb-1">
                      ${(OrderAmount / 100).toFixed(2)} <Text className="text-gray-500">({floor(getMinutes() / 60, 1)}h)</Text>
                    </Text>
                  )}
                  {[REQUESTED, ACCEPTED].includes(Status) && moment(StartTime) > moment() && (
                    <TouchableOpacity onPress={handleOpenChangeDate}>
                      <Text className="text-secondary">{t('changeTime')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
            <View className="py-4">
              <View className="flex-row items-center justify-between">
                <View className="border border-border bg-white items-center justify-center rounded-full w-9 h-9">
                  <Svg icon={FeeIcon} className="text-gray-500" width={18} height={18} />
                </View>
                <View className="pl-3 flex-1">
                  <Text className="text-textContainer font-medium">{t('processingFee1')}</Text>
                  <Text className="text-gray-400 text-xs">{t('processingFee2')}</Text>
                </View>
                <Text className="text-textContainer">${(booking.OrderFee / 100).toFixed(2)}</Text>
              </View>
            </View>
            <View className="py-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-textContainer font-medium">{t('bookingNumber')}</Text>
                <View className="flex-row items-center">
                  <Text className="text-textContainer font-medium pr-2">{booking.OrderCode}</Text>
                  <TouchableOpacity onPress={() => copyToClipboard(booking.OrderCode)}>
                    <CopySvg />
                  </TouchableOpacity>
                </View>
              </View>
              <View className="flex-row justify-between pt-2">
                <Text className="text-textContainer">{t('requestTime')}</Text>
                <Text className="text-textContainer">{formatTimeRequest(booking.createdAt)}</Text>
              </View>
              {!booking?.OrderPayment && (
                <>
                  <LabelStatus booking={booking} className="mt-4 py-2.5 rounded-[10px]" />
                  {OrderPayment && [CANCELED, REFUNDED].includes(Status) && (
                    <Text className="text-center text-xs pt-0.5">
                      {t('refundedNote')}
                      <Text className="text-red-600 font-bold">${(OrderPayment.RefundedAmount / 100).toFixed(2)}</Text>
                    </Text>
                  )}
                </>
              )}
            </View>
            {booking?.OrderPayment && (
              <View className="py-4">
                <View className="flex-row items-center justify-between">
                  <Text className="text-textContainer font-medium">{t('paymentDetail')}</Text>
                  <View className="flex-row items-center" />
                </View>
                <View className="flex-row justify-between pt-2">
                  <Text className="text-textContainer">{t('paymentMethod')}</Text>
                  <Text className="text-textContainer">{booking?.OrderPayment?.brand}</Text>
                </View>
                <View className="flex-row justify-between pt-2">
                  <Text className="text-textContainer">
                    {t('totalHour')} ({floor(getMinutes() / 60, 1)}h)
                  </Text>
                  <Text className="text-textContainer">${(OrderAmount / 100).toFixed(2)}</Text>
                </View>
                <View className="flex-row justify-between pt-2">
                  <Text className="text-textContainer">{t('processingFee1')}</Text>
                  <Text className="text-textContainer">${(booking.OrderFee / 100).toFixed(2)}</Text>
                </View>
                {!!booking.TipAmount && (
                  <View className="flex-row justify-between pt-2">
                    <Text className="text-textContainer">{t('Tip')}</Text>
                    <Text className="text-textContainer">${(booking.TipAmount / 100).toFixed(2)}</Text>
                  </View>
                )}
                {!!booking.CouponAmount && (
                  <View className="flex-row justify-between pt-2">
                    <Text className="text-textContainer">
                      {t('Coupon')} <Text className="text-primary">({booking.PromoCode})</Text>
                    </Text>
                    <Text className="text-textContainer">-${(booking.CouponAmount / 100).toFixed(2)}</Text>
                  </View>
                )}
                <LabelStatus booking={booking} className="mt-4 py-2.5 rounded-[10px]" />
                {OrderPayment && [CANCELED, REFUNDED].includes(Status) && (
                  <Text className="text-center text-xs pt-0.5">
                    {t('refundedNote')}
                    <Text className="text-red-600 font-bold">${(OrderPayment.RefundedAmount / 100).toFixed(2)}</Text>
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
      </Animated.ScrollView>
      <SafeAreaView className="mb-4">
        <View className="w-full px-4 pt-2 flex-row items-center justify-between bg-white">
          <View className="">
            <Text className="text-red-600 font-bold text-lg">${(booking.TotalAmount / 100).toFixed(2)}</Text>
            <Text className="text-xs text-gray-500">{t('processfrees')}</Text>
          </View>
          <View className="flex-row items-center">
            {[REQUESTED, ACCEPTED, CONFIRMED].includes(getStatus(booking)) && (
              <ButtonGray className="uppercase" onPress={() => setCancelModal(true)}>
                {t('cancel')}
              </ButtonGray>
            )}
            {ACCEPTED === getStatus(booking) && (
              <ButtonBlue uppercase className="ml-3 " onPress={() => props.navigation.navigate(ROUTER.CHECKOUT)}>
                {t('checkout')}
              </ButtonBlue>
            )}
            {COMPLETED === getStatus(booking) && (
              <TouchableOpacity className="p-4" onPress={() => setReviewModal(true)}>
                <Text className="text-primary font-medium">{Review ? 'SEE REVIEWS' : 'REVIEW NOW'}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
      <DayRangeModal
        {...{modal: dateRangeModal, setModal: setDateRangeModal, dateRange, onConfirm: handleConfirm, availability}}
        delayTime={Service.DefaultAmountTime}
        mode="datetime"
        minDate={new Date()}
      />
      <ReviewModal {...{modal: reviewModal, setModal: setReviewModal, booking, handleReview}} />
      <CancelBookingModal {...{modal: cancelModal, setModal: setCancelModal, booking, onSubmit: handleCancel}} />
      <Snackbar className="mb-24 bg-[#FFFFFF0]" visible={visibleSnackbar} duration={1500} onDismiss={() => setVisibleSnackbar(false)}>
        <View className="items-center">
          <View className="rounded-full bg-gray-900 w-52 p-2.5">
            <Text className="text-center text-white">{t('copiedbookingNumber')}</Text>
          </View>
        </View>
      </Snackbar>
    </ColorLayout>
  );
};
const styles = StyleSheet.create({
  shadowTop: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  shadowBottom: {
    shadowColor: '#FFF',
    shadowOffset: {
      width: 0,
      height: -7,
    },
    shadowOpacity: 1,
    shadowRadius: 7.0,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
});
export default BookingDetail;
