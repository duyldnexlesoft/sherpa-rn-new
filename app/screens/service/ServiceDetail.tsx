import Header from 'app/components/Header';
import Text from 'app/components/Text';
import {ScrollView, View, SafeAreaView} from 'react-native';
import LocationIcon from 'app/assets/svg/location.svg';
import LocationOutlineIcon from 'app/assets/svg/location-outline.svg';
import DashIcon from 'app/assets/svg/dash.svg';
import StarIcon from 'app/assets/svg/star.svg';
import User30Svg from 'app/assets/svg/user30.svg';
import ImageIcon from 'app/assets/svg/image.svg';
import TextLazy from 'app/components/TextLazy';
import {useEffect, useState} from 'react';
import moment from 'moment';
import ROUTER from 'app/navigation/router';
import ButtonBlue from 'app/components/button/ButtonBlue';
import DayRangeModal from 'app/components/Modal/DayRangeModal';
import {MapView, Camera, PointAnnotation} from '@rnmapbox/maps';
import SherpaFavorite from 'app/components/SherpaFavorite';
import {floorReview} from 'app/utils/helpler';
import {concat} from 'lodash';
import {useTranslation} from 'react-i18next';
import SliderImage from 'app/components/SliderImage';
import {useSelector} from 'react-redux';
import {userSelector} from 'app/store/selectors';
import ColorLayout from 'app/layout/ColorLayout';
import Image from 'app/components/Image';
import {useQuery} from '@tanstack/react-query';
import {getAvailability} from 'app/api/availabilityApi';
import Svg from 'app/components/Svg';

const ServiceDetail = (props: any) => {
  const {t} = useTranslation();
  const {navigation} = props;
  const {currentUser} = useSelector(userSelector);
  const [dateRangeModal, setDateRangeModal]: any = useState(false);
  const [availability, setAvailability]: any = useState(null);
  const dateRange = {startDate: new Date(moment().add(1, 'hours').format()), endDate: null};
  const {service, verifiedUser} = props?.route?.params;
  const {Reviews} = verifiedUser;
  const {rating, number} = floorReview(Reviews);
  const {StartAddress, StartAddressLocation, EndAddress, EndAddressLocation, Description, SpecialInstruction, DefaultAmountTime} = service;
  const startCoor = StartAddressLocation.coordinates;
  const endCoor = EndAddressLocation ? EndAddressLocation.coordinates : startCoor;
  const centerLocation = [(startCoor[0] + endCoor[0]) / 2, (startCoor[1] + endCoor[1]) / 2];
  let latitude = startCoor[0] > endCoor[0] ? startCoor[0] - endCoor[0] : endCoor[0] - startCoor[0];
  let longitude = startCoor[1] > endCoor[1] ? startCoor[1] - endCoor[1] : endCoor[1] - startCoor[1];
  const hypotenuse = Math.sqrt(latitude * latitude + longitude * longitude) + 0.01;
  const topLeftLocation = [centerLocation[0] + hypotenuse, centerLocation[1] + hypotenuse];
  const botRightLocation = [centerLocation[0] - hypotenuse, centerLocation[1] - hypotenuse];

  const {data} = useQuery({
    queryKey: ['getAvailability', verifiedUser._id],
    queryFn: () => getAvailability(verifiedUser._id),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (data?.data?.data) {
      setAvailability(data.data.data);
    }
  }, [data?.data?.data]);

  const onConfirm = ({startDate, endDate}: any) => {
    if (startDate && endDate) {
      const rangeDate = {startDate: moment(startDate).format(), endDate: moment(endDate).format()};
      navigation.navigate(ROUTER.SERVICE_REQUEST, {service, verifiedUser, rangeDate});
      setTimeout(() => {
        setDateRangeModal(false);
      }, 0);
    }
  };

  const renderMapView = () => {
    return (
      <MapView scrollEnabled={false} zoomEnabled={false} logoEnabled={false} attributionEnabled={false} style={{flex: 1, height: 300}}>
        <Camera bounds={{ne: topLeftLocation, sw: botRightLocation}} animationDuration={0} />
        <PointAnnotation id="pointAnnoStart" coordinate={StartAddressLocation.coordinates}>
          <Svg icon={LocationIcon} className="text-primary" />
        </PointAnnotation>
        {EndAddressLocation && (
          <PointAnnotation id="pointAnnoEnd" coordinate={EndAddressLocation.coordinates}>
            <Svg icon={LocationIcon} className="text-secondary" />
          </PointAnnotation>
        )}
      </MapView>
    );
  };

  return (
    <ColorLayout className="bg-white h-full pt-0">
      <Header {...props} absolute />
      <ScrollView className="h-full" showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
        <View className="w-full">
          <SliderImage height={250} {...props} Images={concat(renderMapView, service.Images)} bottom={10} renderMapView />
        </View>
        <View className="px-4 divide-y divide-border">
          <View className="pb-4">
            <View className="flex-row items-center mt-4 justify-between">
              {verifiedUser?.Images?.[0] && (
                <View className="w-16 h-16 rounded-full overflow-hidden">
                  <Image className="w-full h-full rounded-t-md" uri={verifiedUser?.Images?.[0]} />
                </View>
              )}
              {!verifiedUser?.Images?.[0] && (
                <View className="w-16 h-16 bg-secondary rounded-full items-center justify-center">
                  <Svg icon={User30Svg} className="text-gray-500" width={26} height={26} />
                </View>
              )}
              <View className="flex-1 pl-4">
                <Text className="text-base font-medium">
                  {verifiedUser.FirstName} {verifiedUser.LastName}
                </Text>
                {rating && (
                  <View className="flex-row items-center pt-0.5">
                    <Svg icon={StarIcon} width={13} height={13} />
                    <Text className="pl-1.5 text-gray-500 text-xs">
                      {rating} ({number} {number === 1 ? 'review' : 'reviews'})
                    </Text>
                  </View>
                )}
                {service.StartAddress && (
                  <View className="flex-row items-center">
                    <Svg icon={LocationOutlineIcon} width={13} />
                    <Text className="pl-1 text-gray-500 text-xs">{service.StartAddress}</Text>
                  </View>
                )}
              </View>
              <SherpaFavorite className="px-2" />
            </View>
            <View className="bg-lightSecondary rounded-[10px] p-2.5 mt-4 flex-row items-center">
              <View className="w-[62px] h-[40px] mr-2.5 rounded overflow-hidden bg-gray-100 items-center justify-center">
                {service?.Images?.[0] && <Image uri={service.Images?.[0]} className="w-full flex-[1]" />}
                {!service?.Images?.[0] && <Svg icon={ImageIcon} className="text-gray-300" width={22} height={22} />}
              </View>
              <View className="flex-1 ">
                <View className="flex-row items-start justify-between">
                  <Text className="text-base text-[14px] font-medium grow whitespace-normal w-[1px] leading-[16px] bg-blue">{service?.Name}</Text>
                  <View className="flex-row items-center">
                    <View className="bg-white items-center justify-center ml-2 px-1.5 py-0.5 rounded-sm">
                      <Text className="text-[10px] text-gray-500">{service?.Category}</Text>
                    </View>
                  </View>
                </View>
                <View className="flex-row items-center justify-between pt-1 mb-1">
                  <View className="flex-row items-center">
                    {service.DefaultAmountTime && (
                      <>
                        <Text className="text-xs text-gray-500">{t('defaulDuration')}: </Text>
                        <Text className="text-xs text-gray-500 font-bold">{service.DefaultAmountTime}</Text>
                      </>
                    )}
                  </View>
                  <Text className="text-xs font-medium text-secondary">${(service.Amount / 100).toFixed(2)}/h</Text>
                </View>
              </View>
            </View>
            <Text className="text-lg font-medium mt-4">{t('description')}</Text>
            <TextLazy className="text-gray-500">{Description}</TextLazy>
            {SpecialInstruction && (
              <>
                <Text className="text-lg font-medium mt-4">{t('specialInstructions')}</Text>
                <TextLazy className="text-gray-500">{SpecialInstruction}</TextLazy>
              </>
            )}
          </View>
          <View className="py-4">
            <View className="flex-row items-center">
              <Svg icon={LocationIcon} width={18} className="text-primary" />
              <Text className="pl-2" numberOfLines={2}>
                {StartAddress}
              </Text>
            </View>
            {EndAddress && (
              <>
                <Svg icon={DashIcon} />
                <View className="flex-row items-center">
                  <Svg icon={LocationIcon} width={18} className="text-secondary" />
                  <Text className="pl-2" numberOfLines={2}>
                    {EndAddress}
                  </Text>
                </View>
              </>
            )}
          </View>
          <View />
        </View>
      </ScrollView>
      <SafeAreaView className="w-full mb-4 flex-row items-center justify-center bg-white">
        <View className="px-4 pt-2">
          {currentUser.Email === verifiedUser.Email && <Text className="text-red-500 font-bold">{t('canNotBook')}</Text>}
          {currentUser.Email !== verifiedUser.Email && (
            <View className="w-full flex-row justify-end">
              <ButtonBlue uppercase onPress={() => setDateRangeModal(true)}>
                {t('selectDateTime')}
              </ButtonBlue>
            </View>
          )}
        </View>
      </SafeAreaView>
      <DayRangeModal
        {...{modal: dateRangeModal, setModal: setDateRangeModal, dateRange, onConfirm, availability, mode: 'datetime'}}
        minDate={dateRange.startDate}
        delayTime={DefaultAmountTime}
        requiredStart
        requiredEnd
      />
    </ColorLayout>
  );
};
export default ServiceDetail;
