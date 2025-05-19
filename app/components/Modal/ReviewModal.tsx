import {useRef, useState} from 'react';
import {Alert, Pressable, SafeAreaView, TouchableOpacity, View} from 'react-native';
import ButtonBlue from 'app/components/button/ButtonBlue';
import {find, first, get, indexOf, isEmpty, keys, size, split, take} from 'lodash';
import StartSvg from 'app/assets/svg/star.svg';
import StartOutlineSvg from 'app/assets/svg/star-outline.svg';
import User30Svg from 'app/assets/svg/user30.svg';
import DollarSvg from 'app/assets/svg/dollar.svg';
import InfoSvg from 'app/assets/svg/info.svg';
import TextInput from '../TextInput';
import {REVIEW_TYPE, TIPS} from 'app/utils/constants';
import {formatTimeRequest, getFullName} from 'app/utils/helpler';
import Text from '../Text';
import {useTranslation} from 'react-i18next';
import Image from '../Image';
import Modal from './Modal';
import {checkout, createEphemeralKeys, createPaymentIntent} from 'app/api/userOrderApi';
import {useMutation} from '@tanstack/react-query';
import {PaymentSheetError, useStripe} from '@stripe/stripe-react-native';
import {useDispatch} from 'react-redux';
import {bookingAction} from 'app/store/actions';
import { remapProps } from 'nativewind';

const ReviewModal = (props: any) => {
  const {booking} = props;
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const {_id, VerifiedUser, Reviews, User, TotalAmount} = booking;
  const sherpaReview = find(Reviews, r => r.Type === REVIEW_TYPE.SHERPA);
  const athleteReview = find(Reviews, r => r.Type === REVIEW_TYPE.ATHLETE);
  const {Images, FirstName, LastName} = VerifiedUser || {};
  const [Rating, setRating] = useState(athleteReview?.Rating || 0);
  const [Comment, setComment] = useState(athleteReview?.Comment || '');
  const [tip, setTip]: any = useState(first(keys(TIPS)));
  const [tipAmount, setTipAmount]: any = useState();
  const inputRef: any = useRef(null);
  const {initPaymentSheet, presentPaymentSheet} = useStripe();

  const muCreatePaymentIntent = useMutation({mutationKey: ['createPaymentIntent'], mutationFn: createPaymentIntent, onError: () => {}});
  const muEphemeralKeys = useMutation({mutationKey: ['createEphemeralKeys'], mutationFn: createEphemeralKeys, onError: () => {}});
  const muCheckout = useMutation({mutationKey: ['checkout'], mutationFn: checkout, onError: () => {}});

  const handleRating = (value: number) => {
    if (!athleteReview) {
      setRating(value);
    }
  };

  const initializePaymentSheet = async (ephemeral: any, amount: any) => {
    await initPaymentSheet({
      merchantDisplayName: 'Sherpa',
      returnURL: 'sherpa://stripe',
      customerId: ephemeral.customer,
      customerEphemeralKeySecret: ephemeral.ephemeralKey,
      intentConfiguration: {
        mode: {amount, currencyCode: 'USD'},
        confirmHandler: confirmHandler,
      },
    });
  };

  const confirmHandler = async (paymentMethod: any, _shouldSavePaymentMethod: any, intentCreationCallback: any) => {
    const TipAmount = getTipAmount(tip);
    muCreatePaymentIntent.mutate(
      {UserOrderId: _id, Card: paymentMethod.Card, TipAmount},
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
    const {error} = await presentPaymentSheet();
    if (error) {
      if (error.code !== PaymentSheetError.Canceled) {
        Alert.alert(`Error code: ${error.code}`, error.message);
      }
    } else {
      const TipAmount = getTipAmount(tip);
      muCheckout.mutate(
        {UserOrderId: _id},
        {
          onSuccess: () => {
            dispatch(bookingAction.setBooking({...booking, TipAmount}));
            props.handleReview(Rating, Comment);
          },
        },
      );
    }
  };

  const handleReview = async () => {
    if (get(TIPS, tip || 'No Tip') === 0 || !Rating) {
      props.handleReview(Rating, Comment);
      return;
    }
    if (Rating > 0 && (get(TIPS, tip) || Number(tipAmount))) {
      const response = await muEphemeralKeys.mutateAsync();
      const ephemeralKey = response?.data?.data;
      const amount = getTipAmount(tip);
      await initializePaymentSheet(ephemeralKey, amount < 50 ? 50 : amount);
      didTapCheckoutButton();
    }
  };
  const getTipAmount = (key: any) => (!!get(TIPS, key) ? Number((TotalAmount * get(TIPS, key || 'No Tip')).toFixed(0)) : 0);

  return (
    <>
      <Modal animationType="slide" {...props} className="items-center justify-end">
        <SafeAreaView className="absolute bottom-4 w-full z-10">
          <View className="px-4">
            <View className="bg-white flex-1 rounded-[10px] overflow-hidden p-4 flex-col items-center">
              <View className="w-16 h-2 bg-[#F9F5F5] rounded-full mb-2" />
              <Text className="text-center text-lg font-medium text-textContainer mb-6">{t('review')}</Text>
              {!athleteReview && (
                <>
                  <View className="w-16 h-16 rounded-full overflow-hidden bg-secondary flex items-center justify-center">
                    {isEmpty(Images) && <User30Svg width={22} />}
                    {!isEmpty(Images) && <Image uri={Images?.[0]} className="w-16 h-16" />}
                  </View>
                  <Text className="text-center text-base font-medium text-textContainer mt-2">
                    {FirstName} {LastName}
                  </Text>
                  <View className="flex-row my-6">
                    {[1, 2, 3, 4, 5].map((r, index) => (
                      <Pressable className="px-2" onPress={() => handleRating(r)} key={`sta-${index}`}>
                        {Rating < r ? <StartOutlineSvg width={36} height={36} /> : <StartSvg width={36} height={36} />}
                      </Pressable>
                    ))}
                  </View>
                  <TextInput
                    label="Your comment"
                    name="TrainingGoals"
                    multiline={true}
                    numberOfLines={10}
                    height={100}
                    value={Comment}
                    onChange={event => setComment(event.nativeEvent.text)}
                  />
                  <View className="mt-4 border border-border p-0.5 rounded w-full">
                    <View className="rounded">
                      <View className="flex-row justify-between">
                        {keys(TIPS).map((key, index) => {
                          const stypeChecked = tip === key ? 'bg-[#CDECE5]' : 'bg-tabDefault';
                          const stypeRight = index < size(TIPS) - 1 ? 'mr-0.5' : '';
                          return (
                            <TouchableOpacity
                              key={`tip_${index}`}
                              onPress={() => {
                                setTip(key);
                                setTipAmount(getTipAmount(key) / 100);
                                if (get(TIPS, key) === null) {
                                  setTimeout(() => inputRef?.current?.focus(), 100);
                                }
                              }}
                              className={`${stypeChecked} ${stypeRight} flex-1 justify-center items-center h-12 `}>
                              <Text>{key}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                      {tip !== 'No Tip' && (
                        <View className="flex-row items-center bg-lightGray p-1">
                          <TextInput
                            className="font-bold text-base leading-[18px]"
                            comRef={inputRef}
                            name="TipAmount"
                            value={tipAmount ? tipAmount.toString() : ''}
                            keyboardType="numeric"
                            leftIcon={DollarSvg}
                            onChange={(event: any) => {
                              const text = event.nativeEvent.text;
                              const indexDot = indexOf(text, '.');
                              const firstText = indexDot >= 0 ? text.substring(0, indexOf(text, '.')) : text;
                              const lastText = indexDot >= 0 ? text.substring(indexOf(text, '.')) : '';
                              split(event.nativeEvent.text, '.');
                              setTipAmount([firstText, ...take(lastText, 3)].join(''));
                            }}
                            onPress={get(TIPS, tip) === null ? null : () => {}}
                          />
                        </View>
                      )}
                    </View>
                  </View>
                  <View className="flex-row mt-4 bg-lightSecondary p-2 rounded w-full">
                    <InfoSvg width={14} />
                    <View className="ml-2">
                      <Text className="text-textContainer text-xs">Tips are subject to a card processing fee.</Text>
                      <Text className="text-textContainer text-xs">Sherpa, Inc. does not keep any of the tipped amount.</Text>
                    </View>
                  </View>
                  <ButtonBlue noIcon uppercase className="rounded-md h-12	mt-4" onPress={() => handleReview()}>
                    {t('submit')}
                  </ButtonBlue>
                </>
              )}
              {athleteReview && (
                <View className="w-full">
                  {sherpaReview && (
                    <View className="border border-border w-full rounded-[10px] overflow-hidden mb-4">
                      <View className="items-center p-3 bg-lightGray">
                        <Text className="pl-3 font-medium text-primary">{t('sherpaReviewYou')}</Text>
                      </View>
                      <View className="w-full p-3">
                        <View className="w-full flex-row items-center justify-between mb-2">
                          <View className="flex-row items-center">
                            <View className="w-9 h-9 rounded-full bg-secondary overflow-hidden flex items-center justify-center">
                              {isEmpty(VerifiedUser?.Images) && <User30Svg width={22} />}
                              {!isEmpty(VerifiedUser?.Images) && <Image uri={VerifiedUser?.Images?.[0]} className="w-16 h-16" />}
                            </View>
                            <View className="pl-3">
                              <Text className="text-textContainer font-medium text-base">{getFullName(VerifiedUser)}</Text>
                              <Text className="text-gray-500 text-xs">{formatTimeRequest(sherpaReview.createdAt)}</Text>
                            </View>
                          </View>
                          <View className="flex-row items-center bg-lightSecondary px-2 py-1">
                            <StartSvg width={13} />
                            <Text className="pl-1 text-activeSecondary">{sherpaReview.Rating}.0</Text>
                          </View>
                        </View>
                        <Text className="text-gray-500">{sherpaReview.Comment}</Text>
                      </View>
                    </View>
                  )}
                  <View className="border border-border w-full rounded-[10px] overflow-hidden">
                    <View className="flex-row items-center p-3 bg-lightGray">
                      <Text className="font-medium text-secondary">{t('YouReviewSherpa')}</Text>
                    </View>
                    <View className="w-full p-3">
                      <View className="w-full flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center">
                          <View className="w-9 h-9 rounded-full bg-secondary overflow-hidden flex items-center justify-center">
                            {isEmpty(User?.Images) && <User30Svg width={22} />}
                            {!isEmpty(User?.Images) && <Image uri={User?.Images?.[0]} className="w-16 h-16" />}
                          </View>
                          <View className="pl-3">
                            <Text className="text-textContainer font-medium text-base">{getFullName(User)}</Text>
                            <Text className="text-gray-500 text-xs">{formatTimeRequest(athleteReview.createdAt)}</Text>
                          </View>
                        </View>
                        <View className="flex-row items-center bg-lightSecondary px-2 py-1">
                          <StartSvg width={13} />
                          <Text className="pl-1 text-activeSecondary">{athleteReview.Rating}.0</Text>
                        </View>
                      </View>
                      <Text className="text-gray-500">{athleteReview.Comment}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

remapProps(ReviewModal, {className: 'style'});
export default ReviewModal;
