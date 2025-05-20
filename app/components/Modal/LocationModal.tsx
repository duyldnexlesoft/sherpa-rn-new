/* eslint-disable react-hooks/exhaustive-deps */
import {useEffect, useState} from 'react';
import {Platform, Pressable, SafeAreaView, ScrollView, StatusBar, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {geocoding} from 'app/api/mapboxApi';
import TextInput from '../TextInput';
import LocationIcon from 'app/assets/svg/location-outline.svg';
import ArrowLeftIcon from 'app/assets/svg/arrow-left.svg';
import ClearIcon from 'app/assets/svg/clear.svg';
import Text from '../Text';
import _ from 'lodash';
import Modal from './Modal';
import Svg from '../Svg';

const LocationModal = (props: any) => {
  const {location, setModal, handleSelectLocation} = props;
  const [locationValue, setLocationValue]: any = useState(location ? location.place_name : '');
  const [searchValue, setSearchText]: any = useState(location ? location.place_name : '');
  const statusBarHeight = Platform.OS === 'android' ? Number(StatusBar.currentHeight || 0) + 10 : 0;

  const handlegGeocoding = () => (searchValue ? geocoding(searchValue, 10, 'US') : null);
  const {data: dataGeocoding, isLoading} = useQuery({queryKey: ['geocodingSearch', searchValue], queryFn: handlegGeocoding, staleTime: Infinity});

  useEffect(() => {
    if (!isLoading) {
      setSearchText(locationValue);
    }
  }, [isLoading]);

  const handleOnChange = (event: any) => {
    if (event?.nativeEvent?.text === undefined) return;
    setLocationValue(event.nativeEvent.text);
    if (!isLoading) {
      setSearchText(event.nativeEvent.text);
    }
  };

  const renderText = (text: string) => {
    const form = _.lowerCase(text).indexOf(_.lowerCase(searchValue));
    const to = form + searchValue.length;
    if (form === -1) {
      return <Text className="text-gray-400 flex-1 pr-2">{text}</Text>;
    } else {
      return (
        <Text className="text-gray-400 flex-1 pr-2">
          <Text className="text-textContainer">{text.substring(form, to)}</Text>
          {text.substring(to)}
        </Text>
      );
    }
  };

  return (
    <Modal animationType="fade" {...props}>
      <View className="bg-white h-full w-full">
        <SafeAreaView className="pb-4 flex-1">
          <View className="p-4" style={{paddingTop: statusBarHeight}}>
            <TextInput
              label="Location"
              name="Location"
              value={locationValue}
              onChange={handleOnChange}
              rightAction={locationValue ? () => setLocationValue('') : null}
              rightIcon={!locationValue ? LocationIcon : ClearIcon}
              leftAction={() => setModal(false)}
              leftIcon={<Svg icon={ArrowLeftIcon} className={`text-textContainer ml-2`} />}
            />
            <ScrollView className="bg-white h-full mb-20">
              {(searchValue ? dataGeocoding?.data?.features : [])?.map((feature: any, index: any) => {
                return (
                  <Pressable
                    key={`key-l-${index + 1}`}
                    className="border-b flex-row border-border items-center py-3"
                    onPress={() => handleSelectLocation(feature)}>
                    <View className="w-8 h-8 bg-backgroundHover rounded-full items-center justify-center mr-3">
                      <LocationIcon width={16} height={16} />
                    </View>
                    {renderText(feature.place_name)}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default LocationModal;
