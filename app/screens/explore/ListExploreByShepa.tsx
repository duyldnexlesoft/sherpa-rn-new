/* eslint-disable react-hooks/exhaustive-deps */
import {SafeAreaView, ScrollView, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {getShepas} from 'app/api/verifiedUserApi';
import {useEffect, useState} from 'react';
import ColorLayout from 'app/layout/ColorLayout';
import SearchIcon from 'app/assets/svg/search.svg';
import Header from 'app/components/Header';
import TextInput from 'app/components/TextInput';
import ClearIcon from 'app/assets/svg/clear.svg';
import ExploreIcon from 'app/assets/svg/explore.svg';
import _ from 'lodash';
import Text from 'app/components/Text';
import AnimatedLoading from 'app/components/Animated/AnimatedLoading';
import BoxShepa from 'app/components/BoxShepa';
import {useTranslation} from 'react-i18next';
const limit = 10;

const ListExploreByShepa = (props: any) => {
  const {t} = useTranslation();
  const [shepas, setShepas]: any = useState(null);
  const [inputValue, setInputValue]: any = useState('');
  const [searchValue, setSearchValue]: any = useState('');
  const [skip, setSkip]: any = useState(0);
  const [checkScroll, setCheckScroll]: any = useState(true);
  const [heightScroll, setHeightScroll]: any = useState(0);
  const handlegGetShepas = () => (searchValue ? getShepas({searchValue, skip, limit}) : null);
  const {data: dataShepas, isLoading} = useQuery({
    queryKey: ['getShepasByName', searchValue, skip, limit],
    queryFn: handlegGetShepas,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (dataShepas?.data?.data && !isLoading) {
      const count = dataShepas?.data?.data?.pageInfo?.[0]?.count || 0;
      const newShepas = _.filter(_.concat(skip ? shepas : [], dataShepas?.data?.data?.edges));
      if (newShepas.length === count) {
        setCheckScroll(false);
      }
      setShepas(newShepas);
    }
  }, [dataShepas?.data?.data]);

  useEffect(() => {
    if (!isLoading) {
      setSearchValue(inputValue);
    }
  }, [isLoading]);

  const handleOnChange = (event: any) => {
    setInputValue(event.nativeEvent.text);
    if (!isLoading) {
      setSearchValue(event.nativeEvent.text);
    }
    setSkip(0);
  };

  const handleScroll = (event: any) => {
    const {contentSize, contentOffset, layoutMeasurement} = event.nativeEvent;
    if (
      contentOffset.y + layoutMeasurement.height > contentSize.height - 20 &&
      contentSize.height > layoutMeasurement.height + 20 &&
      !isLoading &&
      checkScroll &&
      heightScroll < contentOffset.y
    ) {
      setHeightScroll(contentOffset.y);
      setSkip(skip + limit);
    }
  };

  return (
    <ColorLayout className="pt-8 bg-white">
      <SafeAreaView className="bg-white h-full">
        <Header {...props} showHeaderTitle />
        <View className="p-4">
          <TextInput
            label="Sherpas by Name"
            value={inputValue}
            onChange={handleOnChange}
            rightIcon={!inputValue ? <SearchIcon className="text-gray-500" width={20} height={20} /> : ClearIcon}
            rightAction={inputValue ? () => setInputValue('') : null}
          />
        </View>
        <ScrollView className="px-4" scrollEventThrottle={16} onScroll={handleScroll}>
          {_.chunk(shepas, 2).map((shepa, index) => {
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
          {shepas && !isLoading && _.isEmpty(shepas) && (
            <View className="h-full w-full items-center px-[50px] pt-12">
              <ExploreIcon width={80} height={80} />
              <Text className="text-xl font-bold text-gray-500 mt-7">{t('noResults')}</Text>
              <Text className="text-base text-gray-500 mt-2 mb-6 text-center">{t('noResultsDescription')}</Text>
            </View>
          )}
        </ScrollView>

        {isLoading && (
          <View className="h-8 items-center justify-center">
            <AnimatedLoading className="bg-secondary" />
          </View>
        )}
      </SafeAreaView>
    </ColorLayout>
  );
};

export default ListExploreByShepa;
