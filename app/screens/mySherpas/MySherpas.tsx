/* eslint-disable react-hooks/exhaustive-deps */
import ColorLayout from 'app/layout/ColorLayout';
import {useEffect, useState} from 'react';
import {SafeAreaView, View, Dimensions, FlatList, RefreshControl} from 'react-native';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {getShepas} from 'app/api/verifiedUserApi';
import BgHeader from 'app/assets/svg/bgHeader.svg';
import TextInput from 'app/components/TextInput';
import SearchIcon from 'app/assets/svg/search.svg';
import ExploreIcon from 'app/assets/svg/explore.svg';
import ClearIcon from 'app/assets/svg/clear.svg';
import HeartIcon from 'app/assets/svg/heart.svg';
import Text from 'app/components/Text';
import ROUTER from 'app/navigation/router';
import AnimatedLoading from 'app/components/Animated/AnimatedLoading';
import {concat, isEmpty, size} from 'lodash';
import colors from 'app/utils/colors';
import {LIMIT_ITEM} from 'app/utils/constants';
import ButtonGreen from 'app/components/button/ButtonGreen';
import BoxShepa from 'app/components/BoxShepa';
import {useTranslation} from 'react-i18next';
import NavBar from 'app/components/NavBar';
const dimensions = Dimensions.get('screen');
const gap = 16;

const MySherpas = (props: any) => {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const [shepas, setShepas]: any = useState(null);
  const [totalShepas, setTotalShepas]: any = useState(0);
  const [skip, setSkip]: any = useState(0);
  const [searchValue, setSearchValue]: any = useState('');
  const {isLoading} = useQuery({
    queryKey: ['getMyShepas', skip, searchValue],
    queryFn: () => getShepas({limit: LIMIT_ITEM, searchValue, skip, isFavorite: true}),
    staleTime: Infinity,
    select() {
      handleQueryData(searchValue, skip);
    },
  });

  useEffect(() => {
    handleQueryData(searchValue, skip);
  }, []);

  const handleScroll = (event: any) => {
    const {contentSize, contentOffset, layoutMeasurement} = event.nativeEvent;
    const checkScroll = contentOffset.y > 0 && layoutMeasurement.height / (contentSize.height - contentOffset.y) > 0.6;
    if (checkScroll && !isLoading && totalShepas > size(shepas)) {
      handleQueryData(searchValue, skip + LIMIT_ITEM);
    }
  };

  const onRefresh = () => {
    setSkip(0);
    setSearchValue('');
    setTimeout(() => {
      queryClient.invalidateQueries({queryKey: ['getMyShepas']});
      queryClient.invalidateQueries({queryKey: ['getListReview']});
    });
  };

  const handleQueryData = (searchValue: any, skip: any) => {
    const data: any = queryClient.getQueryData(['getMyShepas', skip, searchValue]);
    setSkip(skip);
    setSearchValue(searchValue);
    if (data?.data?.data) {
      setShepas(concat(skip ? shepas : [], data?.data?.data?.edges || []));
      setTotalShepas(data?.data?.data?.pageInfo?.[0]?.count || 0);
    }
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
              placeholder="Search"
              placeholderTextColor={colors.gray500}
              className="bg-white"
              value={searchValue}
              onChange={event => handleQueryData(event?.nativeEvent?.text, 0)}
              rightAction={searchValue ? () => handleQueryData('', 0) : null}
              rightIcon={searchValue ? ClearIcon : <SearchIcon className="text-gray-500" width={20} height={20} />}
            />
          </View>
        </View>
        <View className="px-4 flex-1">
          <FlatList
            onScroll={handleScroll}
            refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
            data={shepas % 2 === 0 ? shepas : concat(shepas, null)}
            numColumns={2}
            contentContainerStyle={{gap}}
            columnWrapperStyle={{gap}}
            renderItem={({item}) => <BoxShepa item={item} navigation={props.navigation} />}
          />
          {isEmpty(shepas) && !isEmpty(searchValue) && !isLoading && (
            <View className="h-full w-full items-center px-[50px] pt-12">
              <ExploreIcon width={80} height={80} />
              <Text className="text-xl font-bold text-gray-500 mt-7">{t('noResults')}</Text>
              <Text className="text-base text-gray-500 mt-2 mb-6 text-center">{t('noResultsDescription')}</Text>
            </View>
          )}
          {isEmpty(shepas) && isEmpty(searchValue) && !isLoading && (
            <View className="h-full w-full items-center px-8 pt-28">
              <HeartIcon width={80} height={80} />
              <Text className="text-xl font-bold text-gray-500 mt-7">{t('enptyFavorite')}</Text>
              <Text className="text-base text-gray-500 mt-2 mb-6 text-center">{t('enptyFavoriteDescription')}</Text>
              <View>
                <ButtonGreen className="px-4" onPress={() => props.navigation.navigate(ROUTER.EXPLORE)}>
                  {t('exploreNow')}
                </ButtonGreen>
              </View>
            </View>
          )}
        </View>
        {isLoading && skip > 0 && (
          <View className="h-8 items-center justify-center">
            <AnimatedLoading className="bg-secondary" />
          </View>
        )}
      </SafeAreaView>
      <NavBar {...props} focused={ROUTER.MY_SHERPAS} />
    </ColorLayout>
  );
};
export default MySherpas;
