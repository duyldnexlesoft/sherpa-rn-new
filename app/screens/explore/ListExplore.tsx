/* eslint-disable react-hooks/exhaustive-deps */
import ColorLayout from 'app/layout/ColorLayout';
import {useEffect, useState} from 'react';
import {SafeAreaView, ScrollView, View, Dimensions, Pressable, RefreshControl} from 'react-native';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {getShepas} from 'app/api/verifiedUserApi';
import BgHeader from 'app/assets/svg/bgHeader.svg';
import TextInput from 'app/components/TextInput';
import LocationIcon from 'app/assets/svg/location-outline.svg';
import CalendarIcon from 'app/assets/svg/calendar.svg';
import FilterIcon from 'app/assets/svg/filter.svg';
import ExploreIcon from 'app/assets/svg/explore.svg';
import ClearIcon from 'app/assets/svg/clear.svg';
import Text from 'app/components/Text';
import LocationModal from 'app/components/Modal/LocationModal';
import moment from 'moment';
import ROUTER from 'app/navigation/router';
import AnimatedLoading from 'app/components/Animated/AnimatedLoading';
import _, {values, concat, size, take} from 'lodash';
import DayRangeModal from 'app/components/Modal/DayRangeModal';
import colors from 'app/utils/colors';
import {CATEGORIES, LIMIT_ITEM} from 'app/utils/constants';
import BoxShepa from 'app/components/BoxShepa';
import {useTranslation} from 'react-i18next';
import GetLocation from 'react-native-get-location';
import {geocoding} from 'app/api/mapboxApi';
import ButtonGreen from 'app/components/button/ButtonGreen';
import {addWaitlist, getWaitlist} from 'app/api/waitlistApi';
import NavBar from 'app/components/NavBar';
const dimensions = Dimensions.get('screen');

const ListExplore = (props: any) => {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const [shepas, setShepas]: any = useState([]);
  const [totalShepas, setTotalShepas]: any = useState(0);
  const [category, setCategory]: any = useState(null);
  const [dateRange, setDateRange]: any = useState(null);
  const [dateRangeModal, setDateRangeModal]: any = useState(false);
  const [location, setLocation]: any = useState(null);
  const [locationModal, setLocationModal]: any = useState(false);
  const [skip, setSkip]: any = useState(0);
  const [myLocation, setMyLocation]: any = useState(null);
  const [waitList, seWaitlist]: any = useState([]);

  const {data: dataCurrentPosition} = useQuery({
    queryKey: ['getCurrentPosition'],
    queryFn: () => GetLocation.getCurrentPosition({enableHighAccuracy: true, timeout: 60000}),
    staleTime: Infinity,
  });
  const {data: dataCWaitlist} = useQuery({
    queryKey: ['getWaitlist'],
    queryFn: getWaitlist,
    staleTime: Infinity,
  });
  const handlegGeocoding = () => (myLocation ? geocoding(`${myLocation.longitude},${myLocation.latitude}`) : null);
  const {data: dataGeocoding} = useQuery({
    queryKey: ['geocodingLocation', myLocation],
    queryFn: handlegGeocoding,
    staleTime: Infinity,
  });

  const handleGetSherpas = () => {
    const [longitude, latitude] = location?.geometry?.coordinates || [null, null];
    const startDate = dateRange?.startDate && moment(dateRange.startDate).format('YYYY-MM-DD');
    const endDate = dateRange?.endDate && moment(dateRange.endDate).format('YYYY-MM-DD');
    const params = {limit: LIMIT_ITEM, skip, category, radius: 100, longitude, latitude, startDate, endDate};
    return getShepas(params);
  };
  const {isLoading, data: dataSherpas} = useQuery({
    queryKey: ['getShepas', skip, dateRange, location, category],
    queryFn: handleGetSherpas,
    staleTime: Infinity,
  });

  const muAddWaitlist = useMutation({
    mutationKey: ['addWaitlist'],
    mutationFn: addWaitlist,
    onSuccess: ({data}: any) => {
      if (data?.code === 200) {
        queryClient.invalidateQueries({queryKey: ['getWaitlist']});
      }
    },
    onError: () => {},
  });

  const onConfirm = (dateRange: any) => {
    setDateRangeModal(!dateRangeModal);
    handleQueryData({dateRange});
  };

  useEffect(() => {
    handleQueryData({skip, dateRange, location, category});
  }, [dataSherpas?.data?.data]);

  useEffect(() => {
    if (dataGeocoding?.data) {
      setLocation(dataGeocoding?.data?.features?.[0]);
      handleQueryData({skip, dateRange, location: dataGeocoding?.data?.features?.[0], category});
    }
  }, [dataGeocoding?.data]);

  useEffect(() => {
    if (dataCurrentPosition) setMyLocation(dataCurrentPosition);
  }, [dataCurrentPosition]);

  useEffect(() => {
    if (dataCWaitlist?.data) seWaitlist(dataCWaitlist?.data?.data || []);
  }, [dataCWaitlist]);

  useEffect(() => {
    handleQueryData({skip, dateRange, location, category});
  }, []);

  const handleSelectLocation = (location: any) => {
    handleQueryData({skip: 0, location});
    setLocationModal(false);
  };

  const handleScroll = (event: any) => {
    const {contentSize, contentOffset, layoutMeasurement} = event.nativeEvent;
    const checkScroll = contentOffset.y > 0 && layoutMeasurement.height / (contentSize.height - contentOffset.y) > 0.6;
    if (checkScroll && !isLoading && totalShepas > size(shepas)) {
      handleQueryData({skip: skip + LIMIT_ITEM});
    }
  };

  const renderRangeDate = () => {
    const startDate = dateRange?.startDate ? moment(dateRange.startDate).format('MMM DD, YYYY') : '';
    const endDate = dateRange?.endDate ? moment(dateRange.endDate).format('MMM DD, YYYY') : '';
    return startDate || endDate ? `${startDate} - ${endDate}` : '';
  };

  const handleQueryData = (payload: any) => {
    const nSkip = payload.skip !== undefined ? payload.skip : skip;
    const nDateRange = payload.dateRange !== undefined ? payload.dateRange : dateRange;
    const nLocation = payload.location !== undefined ? payload.location : location;
    const nCategory = payload.category !== undefined ? payload.category : category;
    const data: any = queryClient.getQueryData(['getShepas', nSkip, nDateRange, nLocation, nCategory]);
    setSkip(nSkip);
    setDateRange(nDateRange);
    setLocation(nLocation);
    setCategory(nCategory);
    if (data?.data?.data) {
      setShepas(concat(nSkip ? take(shepas, nSkip) : [], data?.data?.data?.edges || []));
      setTotalShepas(data?.data?.data?.pageInfo?.[0]?.count || 0);
    }
  };

  const onRefresh = () => {
    setSkip(0);
    setTimeout(() => {
      queryClient.invalidateQueries({queryKey: ['getShepas']});
      queryClient.invalidateQueries({queryKey: ['getListReview']});
    });
  };

  return (
    <ColorLayout color={colors.primary} light>
      <View className="absolute w-full">
        <BgHeader width={dimensions.width} height={(166 * dimensions.width) / 375} />
      </View>
      <SafeAreaView className="flex-1">
        <View className="flex-1 p-4 pt-0">
          <View className="w-full bg-white items-center justify-center rounded-[10px] p-4">
            <View className="w-full">
              <TextInput
                label="Where would you like to exercise?"
                value={location ? location.place_name : ''}
                rightIcon={location?.place_name ? ClearIcon : LocationIcon}
                rightAction={location?.place_name ? () => handleQueryData({location: null}) : null}
                onPress={() => setLocationModal(true)}
              />
            </View>
            <View className="w-full flex-row items-center mt-4">
              <View className="w-full flex-1">
                <TextInput
                  label="When?"
                  value={renderRangeDate()}
                  rightIcon={dateRange?.startDate || dateRange?.endDate ? ClearIcon : <CalendarIcon className="text-gray-500" />}
                  rightAction={dateRange?.startDate || dateRange?.endDate ? () => handleQueryData({dateRange: null}) : null}
                  onPress={() => setDateRangeModal(true)}
                />
              </View>
              <View className="ml-4">
                <Pressable
                  className="rounded-md items-center justify-center bg-backgroundHover w-12 h-12"
                  onPress={() => props.navigation.navigate(ROUTER.FIND_SHERPA)}>
                  <FilterIcon className="text-gray-500" />
                </Pressable>
              </View>
            </View>
          </View>
          <View className="py-3">
            <ScrollView horizontal={true} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
              <View className="flex-row">
                {values(CATEGORIES).map((c, index) => (
                  <Pressable
                    className="bg-red-500 mx-1 rounded-md overflow-hidden"
                    onPress={() => handleQueryData({category: c === category ? null : c})}
                    key={`c-${index}`}>
                    {c === category && <Text className="py-2 px-2.5 bg-secondary text-white">{c}</Text>}
                    {c !== category && <Text className="py-2 px-2.5 bg-tabDefault">{c}</Text>}
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={handleScroll}
            refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}>
            {shepas &&
              _.chunk(shepas, 2).map((shepa, index) => {
                return (
                  <View key={`sherpa-${index + 1}`}>
                    <View className="flex-row justify-between">
                      <BoxShepa item={shepa[0]} navigation={props.navigation} />
                      <View className="p-2" />
                      <BoxShepa item={shepa?.[1]} navigation={props.navigation} />
                    </View>
                    <View className="p-2" />
                  </View>
                );
              })}
            {!_.isEmpty(shepas) && <View className="p-2" />}
            {!isLoading && _.isEmpty(shepas) && (
              <View>
                {location && category === null && !dateRange && (
                  <View className="h-full w-full items-center px-[50px] pt-12">
                    <ExploreIcon width={80} height={80} />
                    <Text className="text-xl font-bold text-gray-500 mt-7 text-center">{t('waitlistTitle')}</Text>
                    <Text className="text-base text-gray-500 mt-2 mb-6 text-center">
                      {t(waitList.find((w: any) => w.Address === location.place_name) ? 'waitlistNoteAdded' : 'waitlistNoteNotAdd')}
                    </Text>
                    {!waitList.find((w: any) => w.Address === location.place_name) && (
                      <View>
                        <ButtonGreen onPress={() => muAddWaitlist.mutate({Address: location.place_name})}>join our waitlist</ButtonGreen>
                      </View>
                    )}
                  </View>
                )}
                {(location || category !== null || dateRange) && (
                  <View className="h-full w-full items-center px-[50px] pt-12">
                    <ExploreIcon width={80} height={80} />
                    <Text className="text-xl font-bold text-gray-500 mt-7">{t('noResults')}</Text>
                    <Text className="text-base text-gray-500 mt-2 mb-6 text-center">{t('noResultsDescription')}</Text>
                  </View>
                )}
                {!location && category === null && !dateRange && (
                  <View className="h-full w-full items-center px-[50px] pt-12">
                    <ExploreIcon width={80} height={80} />
                    <Text className="text-xl font-bold text-gray-500 mt-7">{t('emptyBook')}</Text>
                    <Text className="text-base text-gray-500 mt-2 mb-6 text-center">{t('emptyBookDescription')}</Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
        {isLoading && (
          <View className="h-8 items-center justify-center">
            <AnimatedLoading className="bg-secondary" />
          </View>
        )}
      </SafeAreaView>
      <NavBar {...props} focused={ROUTER.EXPLORE} />
      <DayRangeModal
        {...{modal: dateRangeModal, setModal: setDateRangeModal, onConfirm}}
        dateRange={dateRange?.startDate || dateRange?.endDate ? dateRange : {startDate: new Date(), endDate: null}}
      />
      <LocationModal {...{location, modal: locationModal, setModal: setLocationModal, handleSelectLocation}} />
    </ColorLayout>
  );
};

export default ListExplore;
