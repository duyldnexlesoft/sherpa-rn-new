/* eslint-disable react-hooks/exhaustive-deps */
import ColorLayout from 'app/layout/ColorLayout';
import {useEffect, useState} from 'react';
import {SafeAreaView, ScrollView, View, Dimensions, Pressable, RefreshControl, StyleSheet} from 'react-native';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import BgHeader from 'app/assets/svg/bgHeader.svg';
import TextInput from 'app/components/TextInput';
import RunnermanIcon from 'app/assets/svg/runnerman.svg';
import ArrowLeft16Icon from 'app/assets/svg/arrow-left-16.svg';
import SearchIcon from 'app/assets/svg/search.svg';
import ClearIcon from 'app/assets/svg/clear.svg';
import ExploreIcon from 'app/assets/svg/explore.svg';
import User30Svg from 'app/assets/svg/user30.svg';
import ImageIcon from 'app/assets/svg/image.svg';
import Text from 'app/components/Text';
import ROUTER from 'app/navigation/router';
import StarIcon from 'app/assets/svg/star.svg';
import {concat, floor, isEmpty, size} from 'lodash';
import colors from 'app/utils/colors';
import {BOOKING_TABS, LIMIT_ITEM as limit, STATUS} from 'app/utils/constants';
import ButtonGreen from 'app/components/button/ButtonGreen';
import {getUserOrders} from 'app/api/userOrderApi';
import {useDispatch, useSelector} from 'react-redux';
import {bookingSelector, userSelector} from 'app/store/selectors';
import moment from 'moment';
import LabelStatus from 'app/components/LabelStatus';
import AnimatedLoading from 'app/components/Animated/AnimatedLoading';
import {getReviewAthlete} from 'app/utils/helpler';
import {bookingAction, userAction} from 'app/store/actions';
import {useTranslation} from 'react-i18next';
import Image from 'app/components/Image';
import NavBar from 'app/components/NavBar';
import Svg from 'app/components/Svg';
const dimensions = Dimensions.get('screen');

const Bookings = (props: any) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const {booking} = useSelector(bookingSelector);
  const {REQUESTED, REJECTED, ACCEPTED, CONFIRMED, COMPLETED, CANCELED, REFUNDED, EXPIRED} = STATUS;
  const [tab, setTab] = useState(BOOKING_TABS.UPCOMING);
  const [bookings, setBookings]: any = useState([]);
  const [totalOrder, setTotalOrder]: any = useState(0);
  const [searchValue, setSearchValue]: any = useState('');
  const [skip, setSkip]: any = useState(0);
  const {currentUser} = useSelector(userSelector);

  const handleRequestData = () => {
    let status = null;
    let isAthleteReview = null;
    if (tab === BOOKING_TABS.UPCOMING) {
      isAthleteReview = '0';
      status = [REQUESTED, ACCEPTED, CONFIRMED].join(',');
    } else if (tab === BOOKING_TABS.REVIEW) {
      isAthleteReview = '0';
      status = COMPLETED;
    } else if (tab === BOOKING_TABS.PAST) {
      isAthleteReview = '1';
      status = [COMPLETED, CANCELED, REFUNDED, REJECTED, EXPIRED].join(',');
    }
    return getUserOrders({limit, skip, status, isAthleteReview, searchValue, userId: currentUser._id, sortBy: 'StartTime', sortOrder: 'desc'});
  };

  const {data: dataBookings, isLoading} = useQuery({
    queryKey: ['getUserOrders', searchValue, tab, skip],
    queryFn: handleRequestData,
    staleTime: Infinity,
  });

  useEffect(() => {
    handleQueryData(tab, searchValue, skip);
  }, [dataBookings?.data?.data]);

  const handleQueryData = (tab: any, searchValue: any, skip: any) => {
    const data: any = queryClient.getQueryData(['getUserOrders', searchValue, tab, skip]);
    setSkip(skip);
    setTab(tab);
    setSearchValue(searchValue);
    if (data?.data?.data) {
      setBookings(concat(skip ? bookings : [], data?.data?.data?.edges || []));
      setTotalOrder(data?.data?.data?.pageInfo?.[0]?.count || 0);
      updateStageBooking(data?.data?.data?.edges);
    }
  };

  const updateStageBooking = (bookings: any) => {
    bookings.forEach((item: any) => {
      if (booking?._id === item._id) {
        dispatch(bookingAction.setBooking(item));
      }
    });
  };

  const onRefresh = () => {
    setSkip(0);
    setSearchValue('');
    setTimeout(() => {
      queryClient.invalidateQueries({queryKey: ['getUserOrders']});
    });
  };

  const handleScroll = (event: any) => {
    const {contentSize, contentOffset, layoutMeasurement} = event.nativeEvent;
    const checkScroll = contentOffset.y > 0 && layoutMeasurement.height / (contentSize.height - contentOffset.y) > 0.6;
    if (checkScroll && !isLoading && totalOrder > size(bookings)) {
      handleQueryData(tab, searchValue, skip + limit);
    }
  };

  const handleViewSherpa = (booking: any) => {
    dispatch(bookingAction.setBooking(booking));
    dispatch(userAction.cleanSherpa());
    props.navigation.navigate(ROUTER.BOOKING_DEAIL);
  };

  return (
    <ColorLayout color={colors.primary} light>
      <View className="absolute w-full top-[-50px]">
        <BgHeader width={dimensions.width} height={(166 * dimensions.width) / 375} />
      </View>
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center m-4 mt-0">
          <View className="flex-1">
            <TextInput
              placeholder="Search Bookings"
              placeholderTextColor={colors.gray500}
              className="bg-white"
              value={searchValue}
              onChange={event => event?.nativeEvent?.text !== undefined && handleQueryData(tab, event?.nativeEvent?.text, 0)}
              rightAction={searchValue ? () => handleQueryData(tab, '', 0) : null}
              rightIcon={searchValue ? ClearIcon : <SearchIcon className="text-gray-500" width={20} height={20} />}
            />
          </View>
        </View>
        <View className="border-b border-border px-4 mb-4 mt-3">
          <View className="flex-row">
            {Object.values(BOOKING_TABS).map((tabName: any, index: any) => {
              const cssPres = tab === tabName ? 'border-textContainer border-b' : 'border-white';
              const cssText = tab === tabName ? 'text-textContainer font-medium' : 'text-gray-500';
              return (
                <Pressable
                  key={`tab-${index}`}
                  className={cssPres + ' items-center w-1/4 pt-2 m-[-1px] pb-3'}
                  onPress={() => handleQueryData(tabName, searchValue, 0)}>
                  <Text className={cssText + ' '}>{tabName}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {isEmpty(bookings) && isEmpty(searchValue) && !isLoading && (
          <View className="items-center pt-28 mx-4">
            <RunnermanIcon width={60} height={60} />
            <Text className="text-xl font-bold text-gray-500 pt-6">{t('noBookings', {tab})}</Text>
            {tab === BOOKING_TABS.UPCOMING && <Text className="text-base text-gray-500 text-center pt-2">{t('emptyBookingUpcomingDesc')}</Text>}
            {tab === BOOKING_TABS.REVIEW && <Text className="text-base text-gray-500 text-center pt-2">{t('emptyBookingReviewDesc')}</Text>}
            {tab === BOOKING_TABS.PAST && <Text className="text-base text-gray-500 text-center pt-2">{t('emptyBookingPastDesc')}</Text>}
            <View className="w-48 pt-8">
              <ButtonGreen className="uppercase" onPress={() => props.navigation.navigate(ROUTER.EXPLORE)}>
                {t('book')}
              </ButtonGreen>
            </View>
          </View>
        )}
        {isEmpty(bookings) && !isEmpty(searchValue) && !isLoading && (
          <View className="h-full w-full items-center px-[50px] pt-28 mx-4">
            <ExploreIcon width={80} height={80} />
            <Text className="text-xl font-bold text-gray-500 mt-7">{t('noResults')}</Text>
            <Text className="text-base text-gray-500 mt-2 mb-6 text-center">{t('noResultsDescription')}</Text>
          </View>
        )}
        <ScrollView
          className="mx-4"
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}>
          <View className="w-full">
            {!isEmpty(bookings) &&
              (!isLoading || skip > 0) &&
              bookings.map((booking: any, index: any) => {
                const {VerifiedUser, Service, EndTime, StartTime, Messages, OrderAmount} = booking;
                const Review = getReviewAthlete(booking);
                const minutes = moment(EndTime).diff(moment(StartTime), 'minutes');
                return (
                  <Pressable
                    className="flex-1 bg-white rounded-[10px] mb-3 border border-border overflow-hidden"
                    key={`booking-${index + 1}`}
                    style={styles.shadowBox}
                    onPress={() => handleViewSherpa(booking)}>
                    <View className="flex-1 p-2.5 flex-row items-center justify-between bg-lightSecondary">
                      <View className="w-[62px] h-[40px] mr-2.5 rounded overflow-hidden bg-gray-100 items-center justify-center">
                        {Service?.Images?.[0] && <Image uri={Service?.Images?.[0]} className="w-full flex-[1]" />}
                        {!Service?.Images?.[0] && <ImageIcon className="text-gray-300" width={22} height={22} />}
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center">
                            <Text className="font-medium text-textContainer pb-0.5">{Service.Name}</Text>
                            <View className="bg-white items-center justify-center ml-2 px-1.5 py-0.5 rounded-sm">
                              <Text className="text-[10px] text-gray-500">{Service?.Category}</Text>
                            </View>
                          </View>
                          <View className="w-6 h-6 relative">
                            <View className="w-6 h-6 rounded-full overflow-hidden bg-secondary items-center justify-center">
                              {VerifiedUser?.Images?.[0] && <Image className="w-full h-full rounded-t-md" uri={VerifiedUser?.Images?.[0]} />}
                              {!VerifiedUser?.Images?.[0] && <Svg icon={User30Svg} className="text-gray-500" width={12} height={12} />}
                            </View>
                            {!isEmpty(Messages) && (
                              <View className="bg-red-600 h-[18px] min-w-[18px] items-center justify-center absolute top-[-6px] right-[-6px] rounded-full px-1.5">
                                <Text className="text-white text-[10px] font-bold">
                                  {size(Messages) > 5 ? 5 : size(Messages)}
                                  {size(Messages) > 5 ? '+' : ''}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                        <View className="flex-row items-center justify-between pt-0.5">
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
                    <View className="flex-row items-center justify-between p-2.5 border-b border-border">
                      <View className="flex-row items-center flex-1">
                        <View>
                          <Text className="text-textContainer pb-0.5">{moment(StartTime).format('ddd, MMM DD')}</Text>
                          <Text className="text-gray-400">{moment(StartTime).format('hh:mm A')}</Text>
                        </View>
                        <Svg icon={ArrowLeft16Icon} className="mx-2 text-primary" />
                        <View>
                          <Text className="text-textContainer pb-0.5">{moment(EndTime).format('ddd, MMM DD')}</Text>
                          <Text className="text-gray-400">{moment(EndTime).format('hh:mm A')}</Text>
                        </View>
                      </View>
                      <View>
                        <Text className="text-textContainer pb-0.5 font-medium">${(OrderAmount / 100).toFixed(2)}</Text>
                        <Text className="text-gray-400 text-xs text-right">({floor(minutes / 60, 1)}h)</Text>
                      </View>
                    </View>
                    <View className="flex-row items-center justify-between p-2.5">
                      <View className="flex-row items-center">
                        <LabelStatus booking={booking} />
                        {Review && (
                          <View className="flex-row items-center h-[22px] border border-blue-50 px-2 ml-2 rounded-sm">
                            <StarIcon width={13} />
                            <Text className="text-xs text-blue-500 pl-1">{Review?.Rating || ''}</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-base font-bold text-red-500">${(booking.TotalAmount / 100).toFixed(2)}</Text>
                    </View>
                  </Pressable>
                );
              })}
          </View>
        </ScrollView>
        {isLoading && skip > 0 && (
          <View className="h-8 items-center justify-center">
            <AnimatedLoading className="bg-secondary" />
          </View>
        )}
      </SafeAreaView>
      <NavBar {...props} focused={ROUTER.BOOKINGS} />
    </ColorLayout>
  );
};

const styles = StyleSheet.create({
  shadowBox: {
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

export default Bookings;
