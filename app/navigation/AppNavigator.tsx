/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {CommonActions, NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useEffect, useState, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {bookingSelector, userSelector} from 'app/store/selectors';
import SignInScreen from 'app/screens/Authen/SignIn';
import SignUpScreen from 'app/screens/Authen/SignUp';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {bookingAction, userAction} from 'app/store/actions';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {CURRENT_USER, LIMIT_ITEM, STATUS} from 'app/utils/constants';
import ROUTER from './router';
import * as SplashScreen from 'expo-splash-screen';
import ChangePassword from 'app/screens/profile/ChangePassword';
import RegisterSherpa from 'app/screens/profile/RegisterSherpa';
import UserDetail from 'app/screens/user/UserDetail';
import EditGallery from 'app/screens/profile/gallerry/EditGallery';
import ListExploreByShepa from 'app/screens/explore/ListExploreByShepa';
import ServiceDetail from 'app/screens/service/ServiceDetail';
import ServiceRequest from 'app/screens/service/ServiceRequest';
import Messages from 'app/screens/booking/Messages';
import BookingDetail from 'app/screens/booking/BookingDetail';
import Checkout from 'app/screens/booking/Checkout';
import MyCard from 'app/screens/profile/MyCard';
import Support from 'app/screens/profile/Support';
import ForgotPassword from 'app/screens/Authen/ForgotPassword';
import ConfirmPasswordCode from 'app/screens/Authen/ConfirmPasswordCode';
import ResetPassword from 'app/screens/Authen/ResetPassword';
import RemindReviewToast from 'app/components/Toast/RemindReviewToast';
import {getUserOrders} from 'app/api/userOrderApi';
import {checkNotice, getProfile, updateFCMToken} from 'app/api/userApi';
import {Platform, View} from 'react-native';
import MySherpas from 'app/screens/mySherpas/MySherpas';
import Bookings from 'app/screens/booking/Bookings';
import ListExplore from 'app/screens/explore/ListExplore';
import ProfileMenu from 'app/screens/profile/ProfileMenu';
import Intercom from '@intercom/intercom-react-native';
import {generateHmac, getIntercomContact} from 'app/api/intercomApi';
import {requestUserPermission} from 'app/utils/firebase';
import {navigationRef} from './RootNavigation';
import {useNavigation} from '@react-navigation/native';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 300,
  fade: true,
});
const Stack = createNativeStackNavigator();
const linking = {
  prefixes: ['sherpa://'],
  config: {
    screens: {
      stripe: 'stripe',
    },
  },
};

const TabNavigator = () => (
  <Stack.Navigator screenOptions={{headerShown: false, animation: 'none'}}>
    <Stack.Screen name={ROUTER.MY_SHERPAS} component={MySherpas} />
    <Stack.Screen name={ROUTER.BOOKINGS} component={Bookings} />
    <Stack.Screen name={ROUTER.EXPLORE} component={ListExplore} />
    <Stack.Screen name={ROUTER.PROFILE} component={ProfileMenu} />
  </Stack.Navigator>
);

const StackScreenAuthen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const {currentUser} = useSelector(userSelector);
  const [booking, setBooking]: any = useState(null);
  const {timeNotification} = useSelector(bookingSelector);

  useEffect(() => {
    queryClient.invalidateQueries({queryKey: ['checkNotice']});
    if (timeNotification?.data?.bookingId) {
      queryClient.invalidateQueries({queryKey: ['getUserOrders']});
      (async () => {
        const dataBooking = await muBooking.mutateAsync({userOrderId: timeNotification?.data?.bookingId});
        dispatch(bookingAction.setBooking(dataBooking?.data?.data?.edges?.[0]));
        if (timeNotification?.data?.isMessage) {
          navigation.dispatch(CommonActions.navigate(ROUTER.MESSAGES));
        }
      })();
    }
  }, [timeNotification]);
  const muBooking = useMutation({
    mutationKey: ['getBooking'],
    mutationFn: getUserOrders,
    onError: () => {},
  });

  const {data: dataCheckNotice} = useQuery({
    queryKey: ['checkNotice'],
    queryFn: checkNotice,
  });

  const {data} = useQuery({
    queryKey: ['getUserOrders', currentUser._id],
    queryFn: () =>
      getUserOrders({
        limit: LIMIT_ITEM,
        skip: 0,
        status: STATUS.COMPLETED,
        isAthleteReview: '0',
        searchValue: '',
        userId: currentUser._id,
        sortBy: 'StartTime',
        sortOrder: 'desc',
      }),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (dataCheckNotice?.data?.code === 200) {
      dispatch(userAction.setCheckNotice(!!dataCheckNotice?.data?.data));
    }
    setBooking(data?.data?.data?.edges?.[0]);
  }, [dataCheckNotice?.data?.data]);

  useEffect(() => {
    setBooking(data?.data?.data?.edges?.[0]);
  }, [data?.data?.data?.edges]);

  return (
    <>
      <Stack.Navigator screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
        <Stack.Screen name={ROUTER.HOME} component={TabNavigator} />
        <Stack.Screen name={ROUTER.USER_DETAIL} component={UserDetail} />
        <Stack.Screen name={ROUTER.EDIT_GALLERY} component={EditGallery} />
        <Stack.Screen name={ROUTER.CHANGE_PASSWORD} component={ChangePassword} />
        <Stack.Screen name={ROUTER.REGISTER_SHERPA} component={RegisterSherpa} />
        <Stack.Screen name={ROUTER.FIND_SHERPA} component={ListExploreByShepa} />
        <Stack.Screen name={ROUTER.SERVICE_DETAIL} component={ServiceDetail} />
        <Stack.Screen name={ROUTER.SERVICE_REQUEST} component={ServiceRequest} />
        <Stack.Screen name={ROUTER.MESSAGES} component={Messages} />
        <Stack.Screen name={ROUTER.BOOKING_DEAIL} component={BookingDetail} />
        <Stack.Screen name={ROUTER.CHECKOUT} component={Checkout} />
        <Stack.Screen name={ROUTER.MY_CARD} component={MyCard} />
        <Stack.Screen name={ROUTER.SUPPORT} component={Support} />
      </Stack.Navigator>
      {booking && <RemindReviewToast booking={booking} />}
    </>
  );
};

const StackScreenNoAuthen = () => (
  <Stack.Navigator screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
    <Stack.Screen name={ROUTER.SIGN_IN} component={SignInScreen} />
    <Stack.Screen name={ROUTER.SIGN_UP} component={SignUpScreen} />
    <Stack.Screen name={ROUTER.FORGOT_PASSWORD} component={ForgotPassword} />
    <Stack.Screen name={ROUTER.EMAIL_VERTIFICATION} component={ConfirmPasswordCode} />
    <Stack.Screen name={ROUTER.RESET_PASSWORD} component={ResetPassword} />
  </Stack.Navigator>
);

const AppNavigator = (props: any) => {
  const dispatch = useDispatch();
  const {currentUser} = useSelector(userSelector);

  const loginIntercom = async () => {
    const responseIntercomContact: any = await getIntercomContact();
    const intercomContact = responseIntercomContact?.data?.data;
    const userHashData = await generateHmac({
      contactId: intercomContact?.id,
      platform: Platform.OS,
    });
    const userHash: any = userHashData?.data?.data;
    await Intercom.setUserHash(userHash);
    await Intercom.loginUserWithUserAttributes({
      email: intercomContact?.email,
      name: intercomContact?.name,
      userId: intercomContact?.id,
    });
  };

  const getStorageCurrentUser = async () => {
    try {
      const userStorage: any = await AsyncStorage.getItem(CURRENT_USER);
      if (userStorage) {
        const user = JSON.parse(userStorage);
        const response = await getProfile(user._id);
        if (response?.data?.code === 401) return;
        dispatch(userAction.setCurrentUser({...user, ...response?.data?.data}));
        const token = await requestUserPermission();
        if (token) setTimeout(() => updateFCMToken(token), 200);
        setTimeout(() => loginIntercom(), 200);
      }
    } catch (_error) {}
    return true;
  };
  const handleNavigationRef = (ref: any) => (navigationRef.current = ref);

  const {isLoading} = useQuery({
    queryKey: ['getStorageCurrentUser'],
    queryFn: getStorageCurrentUser,
  });
  if (isLoading && !currentUser) return <View />;
  return (
    <NavigationContainer ref={handleNavigationRef} linking={linking} onReady={() => SplashScreen.hide()} {...props}>
      {currentUser ? <StackScreenAuthen /> : <StackScreenNoAuthen />}
    </NavigationContainer>
  );
};

export default AppNavigator;
