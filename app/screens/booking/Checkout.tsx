/* eslint-disable import/no-unresolved */
import {PaymentSheetError, useStripe} from '@stripe/stripe-react-native';
import {checkout, createPaymentIntent, createEphemeralKeys} from 'app/api/userOrderApi';
import Header from 'app/components/Header';
import Text from 'app/components/Text';
import ButtonBlue from 'app/components/button/ButtonBlue';
import ColorLayout from 'app/layout/ColorLayout';
import {useRef, useState} from 'react';
import {Dimensions, Pressable, SafeAreaView, ScrollView, TouchableOpacity, View} from 'react-native';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import MessageOutlineIcon from 'app/assets/svg/message-outline.svg';
import CouponIcon from 'app/assets/svg/coupon.svg';
import ArrowRightIcon from 'app/assets/svg/arrow-right.svg';
import User30Svg from 'app/assets/svg/user30.svg';
import ClearIcon from 'app/assets/svg/close.svg';
import {useSelector} from 'react-redux';
import {userSelector, bookingSelector} from 'app/store/selectors';
import ROUTER from 'app/navigation/router';
import Avatar from 'app/components/Avatar';
import moment from 'moment';
import {floor} from 'lodash';
import {useTranslation} from 'react-i18next';
import Image from 'app/components/Image';
import Alert from 'app/components/Alert';
import Recaptcha from 'react-native-recaptcha-that-works';
import {CAPTCHA_SITE_KEY, WEBAPP_URL} from '@env';
import CouponModal from 'app/components/Modal/CouponModal';
import Svg from 'app/components/Svg';
const {width} = Dimensions.get('screen');

const Checkout = (props: any) => {
  const {t} = useTranslation();
  const {currentUser} = useSelector(userSelector);
  const {booking} = useSelector(bookingSelector);
  const {Service, StartTime, EndTime, VerifiedUser, TotalAmount, OrderAmount, Amount, OrderFee, _id} = booking;
  const queryClient = useQueryClient();
  const {initPaymentSheet, presentPaymentSheet} = useStripe();
  const recaptcha: any = useRef(null);
  const [promo, setPromo]: any = useState(null);
  const [couponModal, setCouponModal]: any = useState(null);
  const muCreatePaymentIntent = useMutation({mutationKey: ['createPaymentIntent'], mutationFn: createPaymentIntent, onError: () => {}});
  const muCheckout = useMutation({mutationKey: ['checkout'], mutationFn: checkout, onError: () => {}});
  const muCreateEphemeralKeys = useMutation({mutationKey: ['createEphemeralKeys'], mutationFn: createEphemeralKeys, onError: () => {}});
  const getCouponAmount = () => (promo ? Number((promo.amount_off || (promo.percent_off * TotalAmount) / 100).toFixed(0)) : 0);

  const confirmHandler = async (paymentMethod: any, _shouldSavePaymentMethod: any, intentCreationCallback: any) => {
    muCreatePaymentIntent.mutate(
      {UserOrderId: _id, Card: paymentMethod.Card, CouponAmount: getCouponAmount()},
      {
        onSuccess: ({data}: any) => {
          if (data?.data?.client_secret) {
            intentCreationCallback({clientSecret: data?.data?.client_secret});
          } else {
            intentCreationCallback(data?.message ? {error: {localizedMessage: data.message}} : {});
          }
        },
      },
    );
  };

  const didTapCheckoutButton = async () => {
    const ephemeralKeys = await muCreateEphemeralKeys.mutateAsync();
    await initPaymentSheet({
      merchantDisplayName: 'Sherpa',
      returnURL: 'sherpa://stripe',
      customerId: ephemeralKeys?.data?.data.customer,
      customerEphemeralKeySecret: ephemeralKeys?.data?.data.ephemeralKey,
      intentConfiguration: {
        mode: {amount: TotalAmount - getCouponAmount(), currencyCode: 'USD'},
        confirmHandler: confirmHandler,
      },
    });
    const {error} = await presentPaymentSheet();
    if (error) {
      if (error.code !== PaymentSheetError.Canceled) {
        Alert.alert(`Error code: ${error.code}`, error.message);
      }
    } else {
      muCheckout.mutate(
        {UserOrderId: _id, CouponAmount: getCouponAmount(), PromoCode: promo?.code},
        {
          onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['getUserOrders']});
            props.navigation.replace(ROUTER.HOME, {screen: ROUTER.BOOKINGS});
            Alert.alert('Success', t('bookingConfirmed'));
          },
        },
      );
    }
  };

  const onVerify = (token: any) => setTimeout(didTapCheckoutButton, 200);

  const onExpire = () => {
    console.warn('expired!');
  };

  return (
    <ColorLayout isLoading={muCheckout.isPending} className="bg-white">
      <Header {...props} showHeaderTitle />
      <ScrollView className="flex-1 bg-white p-4" showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
        <View className="w-full border border-border rounded-xl divide-y divide-border">
          <View className="flex-row justify-between px-4 py-3 items-center w-full">
            <Text>{t('runningWith')}</Text>
            <View className="flex-row items-center">
              <Text className="font-medium pr-2">
                {VerifiedUser?.FirstName} {VerifiedUser?.LastName}
              </Text>
              {VerifiedUser?.Images?.[0] && (
                <View className="w-6 h-6 rounded-full overflow-hidden">
                  <Image className="w-full h-full rounded-t-md" uri={VerifiedUser?.Images?.[0]} />
                </View>
              )}
              {!VerifiedUser?.Images?.[0] && (
                <View className="w-6 h-6 bg-secondary rounded-full items-center justify-center">
                  <Svg icon={User30Svg} className="text-gray-500" width={10} height={10} />
                </View>
              )}
              <TouchableOpacity className="pl-2" onPress={() => props.navigation.navigate(ROUTER.MESSAGES)}>
                <Svg icon={MessageOutlineIcon} className="text-gray-500" width={24} height={24} />
              </TouchableOpacity>
            </View>
          </View>
          <View className="flex-row justify-between px-4 py-3 items-center w-full">
            <Text className="text-textContainer">{Service?.Name}</Text>
            <Text className="font-medium">${(Amount / 100).toFixed(2)}/h</Text>
          </View>
          <View className="flex-row justify-between px-4 py-3 items-center w-full">
            <Text>{t('startTime')}</Text>
            <Text className="font-medium">{moment(StartTime).format('dddd, MMM DD, YYYY, hh:mmA')}</Text>
          </View>
          <View className="flex-row justify-between px-4 py-3 items-center w-full">
            <Text>{t('endTime')}</Text>
            <Text className="font-medium">{moment(EndTime).format('dddd, MMM DD, YYYY, hh:mmA')}</Text>
          </View>
          <View className="flex-row justify-between px-4 py-3 items-center w-full">
            <Text>
              {t('totalhour')} ({floor(moment(EndTime).diff(moment(StartTime), 'minutes') / 60, 1)}h)
            </Text>
            <Text className="font-medium">${(OrderAmount / 100).toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between px-4 py-3 items-center w-full">
            <View>
              <Text className="text-textContainer">{t('processingFee1')}</Text>
              <Text className="text-gray-400 text-xs">{t('processingFee2')}</Text>
            </View>
            <Text className="font-medium">${(OrderFee / 100).toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between px-4 py-3 items-center w-full">
            <View className="flex-row items-center">
              <CouponIcon />
              <Text className="text-textContainer mx-2">{t('Coupon')}</Text>
              {!promo && (
                <Pressable onPress={() => setCouponModal(true)} className="bg-lightGray border border-border h-8 px-2.5 flex-row items-center">
                  <Text className="text-gray-500 font-medium">Enter code</Text>
                  <Svg icon={ArrowRightIcon} className="text-gray-500 ml-1.5" height={12} width={6} />
                </Pressable>
              )}
              {promo && (
                <Pressable className="bg-lightPrimary border border-dashed border-primary h-8 px-2.5 flex-row items-center">
                  <Text className="text-textContainer font-medium">{promo.code}</Text>
                  <Pressable onPress={() => setPromo(null)}>
                    <Svg icon={ClearIcon} className="text-gray-500 ml-1.5" height={24} />
                  </Pressable>
                </Pressable>
              )}
            </View>
            <Text className="font-medium">{promo ? `-$${getCouponAmount() / 100}` : '$0'}</Text>
          </View>
          <View className="flex-row bg-backgroundHover justify-between px-4 py-3 items-center w-full">
            <Text className="font-bold text-base">{t('total')}</Text>
            <Text className="font-bold text-red-500">${(TotalAmount - getCouponAmount()) / 100}</Text>
          </View>
        </View>
        <Text className="font-bold text-base pt-4">{t('accountInformation')}</Text>
        <View className="rounded-xl overflow-hidden mt-3">
          <Image source={require('app/assets/image/bgCheckout.jpg')} style={{width: width - 32, height: 85 * ((width - 32) / 345)}} />
          <View className="flex-row p-4 bg-backgroundHover">
            <Avatar item={currentUser} className="w-12 h-12 mr-4" />
            <View>
              <Text className="text-base">
                {currentUser.FirstName} {currentUser.LastName}
              </Text>
              <Text className="text-gray-500">{currentUser.Email}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <SafeAreaView className="mb-4">
        <View className="w-full px-4 pt-2 flex-row items-center justify-end bg-white">
          <ButtonBlue uppercase onPress={() => recaptcha.current.open()}>
            {t('payNow')}
          </ButtonBlue>
        </View>
      </SafeAreaView>
      <Recaptcha ref={recaptcha} siteKey={CAPTCHA_SITE_KEY} baseUrl={WEBAPP_URL} onVerify={onVerify} onExpire={onExpire} size="invisible" />
      <CouponModal {...{modal: couponModal, setModal: setCouponModal, onSubmit: (value: any) => setPromo(value)}} />
    </ColorLayout>
  );
};
export default Checkout;
