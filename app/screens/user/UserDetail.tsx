/* eslint-disable react-hooks/exhaustive-deps */
import SliderImage from 'app/components/SliderImage';
import {useEffect, useState} from 'react';
import {View, SafeAreaView, Pressable, StyleSheet, ScrollView} from 'react-native';
import Header from 'app/components/Header';
import Animated, {runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import ButtonGreen from 'app/components/button/ButtonGreen';
import {userSelector} from 'app/store/selectors';
import {useDispatch, useSelector} from 'react-redux';
import AboutView from './AboutView';
import Edit from 'app/assets/svg/edit.svg';
import AboutEdit from './AboutEdit';
import {useForm} from 'react-hook-form';
import {useMutation, useQuery} from '@tanstack/react-query';
import {updateUser} from 'app/api/userApi';
import {bookingAction, userAction} from 'app/store/actions';
import {LIMIT_ITEM, REVIEW_TYPE, PROFILE_TABS, GENDER} from 'app/utils/constants';
import {countries} from 'app/utils/countryCode';
import _, {concat} from 'lodash';
import Text from 'app/components/Text';
import ColorLayout from 'app/layout/ColorLayout';
import ServicesTab from './ServicesTab';
import AvailalitityTab from './AvailalitityTab';
import ReviewTab from './ReviewTab';
import UserTop from 'app/components/UserTop';
import {getListReview} from 'app/api/reviewApi';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useTranslation} from 'react-i18next';
import AlertSelectModal from 'app/components/Modal/AlertSelectModal';
import LocationModal from 'app/components/Modal/LocationModal';
import PageSelectModal from 'app/components/Modal/PageSelectModal';
import Alert from 'app/components/Alert';
import NeedServiceModal from 'app/components/Modal/NeedServiceModal';
import ROUTER from 'app/navigation/router';

const UserDetail = (props: any) => {
  const {isUpdateProfile, service, verifiedUser, rangeDate} = props.route?.params || {};
  const {t} = useTranslation();
  const {navigation} = props;
  const newCountries = countries.map(c => ({id: c.code, name: `${c.name} (${c.code})`}));
  const dispatch = useDispatch();
  const {currentUser, sherpa} = useSelector(userSelector);
  const isViewSherpa = !!sherpa;
  const [tab, setTab] = useState(isViewSherpa ? PROFILE_TABS.SERVICES : PROFILE_TABS.BIO);
  const userInfo = sherpa || currentUser;
  const [dateOfBirth, setDateOfBirth]: any = useState(undefined);
  const [countryCode, setCountryCode]: any = useState(newCountries.find((c: any) => c.id === '+1'));
  const [reviews, setReviews]: any = useState([]);
  const [totalReview, setTotalReview]: any = useState(0);
  const [skip, setSkip]: any = useState(0);
  const [isEdit, setIsEdit] = useState(!!props.route?.params?.isUpdateProfile);
  const [modalGender, setModalGender] = useState(false);
  const [modalCountryCode, setModalCountryCode] = useState(false);
  const [locationModal, setLocationModal]: any = useState(false);
  const [needModal, setNeedModal]: any = useState(false);
  const transOpacity = useSharedValue(0);
  const transTop = useSharedValue(0);
  const styleOpacity = useAnimatedStyle(() => ({opacity: transOpacity.value, zIndex: transOpacity.value * 2}));
  const styleSliderTop = useAnimatedStyle(() => ({transform: [{translateY: transTop.value}]}));

  const muUpdateUser = useMutation({
    mutationKey: ['updateUser'],
    mutationFn: updateUser,
    onSuccess: (response: any) => {
      if (response?.data?.code === 200) {
        dispatch(userAction.updateCurrentUser(response?.data?.data));
        if (isUpdateProfile) {
          dispatch(userAction.setSherpa(verifiedUser));
          dispatch(bookingAction.cleanBooking());
          navigation.navigate(ROUTER.SERVICE_REQUEST, {service, verifiedUser, rangeDate, isUpdated: true});
        } else {
          setIsEdit(false);
        }
      } else {
        Alert.alert(response?.data?.message);
      }
    },
    onError: () => {},
  });

  const {data: dataReviews, isLoading} = useQuery({
    queryKey: ['getListReview', skip, userInfo._id],
    queryFn: () => getListReview({limit: LIMIT_ITEM, skip, verifiedUserId: userInfo._id, type: REVIEW_TYPE.ATHLETE}),
    staleTime: Infinity,
  });

  useEffect(() => {
    setIsEdit(!!isUpdateProfile);
  }, [isUpdateProfile]);

  useEffect(() => {
    if (dataReviews?.data?.data) {
      setReviews(concat(reviews, dataReviews?.data?.data?.edges || []));
      setTotalReview(dataReviews?.data?.data?.pageInfo?.[0]?.count || 0);
    }
  }, [dataReviews?.data?.data]);

  useEffect(() => {
    setTab(!!sherpa ? PROFILE_TABS.SERVICES : PROFILE_TABS.BIO);
  }, [sherpa]);

  const onSubmit = (value: any) => {
    const dataSave = _.cloneDeep(value);
    dataSave.DateOfBirth = dateOfBirth;
    muUpdateUser.mutate(_.omitBy(dataSave, _.isUndefined));
  };

  const scrollHandler = useAnimatedScrollHandler((event: any) => {
    transTop.value = event.contentOffset.y < 0 ? 0 : event.contentOffset.y;
    let index = event.contentOffset.y - 230;    
    transOpacity.value = Number(((index > 50 ? 50 : index < 0 ? 0 : index) / 50).toFixed(0));
    const checkScroll = event.contentOffset.y > 0 && event.layoutMeasurement.height / (event.contentSize.height - event.contentOffset.y) > 0.6;
    if (checkScroll && !isLoading && totalReview > reviews.length && tab === PROFILE_TABS.REVIEWS) {
      runOnJS(setSkip)(skip + LIMIT_ITEM);
    }
  });

  const hookForm = useForm({});
  const {setValue} = hookForm;

  const renderRight = () => (
    <Pressable className="rounded-full w-9 h-9 items-center justify-center bg-white border border-border" onPress={() => setIsEdit(!isEdit)}>
      <Edit width={18} className="text-textContainer" />
    </Pressable>
  );

  const handleGender = (gender: any) => {
    setValue('Gender', gender);
  };

  const handleCountryCode = (value: any) => {
    setCountryCode(value);
  };

  const handleSelectLocation = (feature: any) => {
    setLocationModal(false);
    setValue('Address', feature.place_name);
  };

  const handleNeedService = () => {
    setNeedModal(false);
    setTab(PROFILE_TABS.SERVICES);
  };

  return (
    <ColorLayout isLoading={muUpdateUser.isPending} className="bg-white pt-0">
      <Header {...props} absolute renderRight={!isViewSherpa && !isUpdateProfile && renderRight} />
      <Animated.View style={[styleOpacity]}>
        <SafeAreaView className="absolute w-full bg-white z-10 pt-8" style={styles.shadowTop}>
          <UserTop navigation={navigation} />
        </SafeAreaView>
      </Animated.View>
      <Animated.ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} className="h-full" onScroll={scrollHandler}>
        <KeyboardAwareScrollView className="flex-1">
          <ScrollView>
            <Animated.View className="absolute bg-backgroundHover" style={[styleSliderTop]}>
              <SliderImage height={300} {...props} {...userInfo} isViewSherpa={isViewSherpa} />
            </Animated.View>
            <View className="pt-4 top-[250px] bg-white rounded-t-[20px] pb-[290px] z-[2] h-full">
              <UserTop navigation={navigation} />
              {isViewSherpa && (
                <View className="border-b border-border flex-1 px-4">
                  <View className="flex flex-row">
                    {Object.values(PROFILE_TABS).map((tabName: any, index: any) => {
                      const cssPres = tab === tabName ? 'border-primary border-b-4' : 'border-white';
                      const cssText = tab === tabName ? 'text-primary' : 'text-textContainer';
                      return (
                        <Pressable key={`tab-${index}`} className={cssPres + ' items-center pt-2 grow m-[-1px] pb-3'} onPress={() => setTab(tabName)}>
                          <Text className={cssText + ' font-medium'}>{tabName}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}
              {tab === PROFILE_TABS.BIO &&
                (isEdit ? (
                  <AboutEdit
                    {...{dateOfBirth, setDateOfBirth, countryCode, hookForm, user: userInfo, setModalGender, setModalCountryCode, setLocationModal}}
                  />
                ) : (
                  <AboutView {...userInfo} isViewSherpa={isViewSherpa} />
                ))}
              {tab === PROFILE_TABS.SERVICES && <ServicesTab verifiedUser={userInfo} {...props} />}
              {tab === PROFILE_TABS.AVAILABILITY && <AvailalitityTab verifiedUser={userInfo} onConfirm={() => setNeedModal(true)} />}
              {tab === PROFILE_TABS.REVIEWS && <ReviewTab verifiedUser={userInfo} reviews={reviews} />}
            </View>
          </ScrollView>
        </KeyboardAwareScrollView>
      </Animated.ScrollView>
      {isEdit && (
        <SafeAreaView className="mb-4">
          <View className="w-full px-4 pt-2 bg-white" style={styles.shadowBottom}>
            <ButtonGreen onPress={hookForm.handleSubmit(onSubmit)}>{t('submit')}</ButtonGreen>
          </View>
        </SafeAreaView>
      )}
      <AlertSelectModal
        key={'key-city'}
        {...{modal: modalGender, setModal: setModalGender, title: t('gender')}}
        {...{onSelect: handleGender, items: GENDER}}
      />
      <PageSelectModal
        key={'key-phone'}
        {...{modal: modalCountryCode, setModal: setModalCountryCode, title: t('countryCode')}}
        {...{onSelect: handleCountryCode, itemSelect: countryCode, items: newCountries}}
      />
      <LocationModal {...{modal: locationModal, setModal: setLocationModal, handleSelectLocation}} />
      <NeedServiceModal {...{modal: needModal, setModal: setNeedModal, onSubmit: handleNeedService}} />
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
export default UserDetail;
