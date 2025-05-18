/* eslint-disable react-hooks/exhaustive-deps */
import {useEffect, useState} from 'react';
import {Platform, Pressable, SafeAreaView, ScrollView, StatusBar, Text, View} from 'react-native';
import Header from '../Header';
import _ from 'lodash';
import CheckedIcon from 'app/assets/svg/checked.svg';
import {useTranslation} from 'react-i18next';
import Modal from './Modal';
import {remapProps} from 'nativewind';
import {create} from 'twrnc';
import tailwindConfig from 'tailwind.config';
const LIMIT = 20;

const PageSelectModal = (props: any) => {
  const newConfig: any = {theme: tailwindConfig.theme};
  const tw = create(newConfig);
  const {setModal, itemSelect, onSelect, title, items, navigation} = props;
  const {t} = useTranslation();
  const [selectItem, setSelectItem]: any = useState(itemSelect);
  const [loadMore, setLoadMore]: any = useState(false);
  const [showItems, setShowItems]: any = useState(_.take(items, LIMIT));
  const statusBarHeight = Platform.OS === 'android' ? Number(StatusBar.currentHeight || 0) + 10 : 0;

  const handleSelect = (value: string) => {
    onSelect && onSelect(value);
    setModal(false);
  };
  const renderRight = () => {
    return (
      <Pressable className="h-9 items-center justify-center" onPress={() => handleSelect(selectItem)}>
        <Text className="font-medium text-gray-900">{t('done')}</Text>
      </Pressable>
    );
  };

  useEffect(() => {
    if (loadMore && _.size(items) !== _.size(showItems)) {
      const lm = _.size(showItems) * 0.3;
      setShowItems(_.take(items, _.size(showItems) + (lm < LIMIT ? LIMIT : lm)));
      setLoadMore(false);
    }
  }, [loadMore]);

  const handleScroll = ({nativeEvent}: any) => {
    const {contentSize, contentOffset, layoutMeasurement} = nativeEvent;
    if (!loadMore && layoutMeasurement.height + contentOffset.y > contentSize.height * 0.6) {
      setLoadMore(true);
    }
    if (loadMore && layoutMeasurement.height + contentOffset.y < contentSize.height * 0.6) {
      setLoadMore(false);
    }
  };
  return (
    <Modal animationType="fade" {...props}>
      <View className="bg-white h-full w-full" style={{paddingTop: statusBarHeight}}>
        <Header {...{navigation, title, renderRight}} showHeaderTitle leftAction={() => setModal(false)} />
        <SafeAreaView className="pb-4 flex-1">
          <ScrollView
            className="mt-2 "
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={1}
            onScroll={handleScroll}>
            <View className="bg-white px-4 divide-y divide-border pt-2">
              {showItems?.map((item: any, index: any) => (
                <Pressable
                  key={`key-${title}-${index + 1}`}
                  className="bg-white h-12 flex-row items-center justify-between"
                  onPress={() => setSelectItem(item)}>
                  {item.render || <Text className="text-lg text-textContainer">{item.name}</Text>}
                  <View
                    className={`w-[30px] h-[30px] items-center justify-center rounded-full ${selectItem?.id === item?.id ? 'bg-primary' : 'bg-backgroundHover'}`}>
                    <CheckedIcon style={tw`${selectItem?.id === item?.id ? 'text-white' : 'text-backgroundHover'}`} />
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
};
remapProps(PageSelectModal, {className: 'style'});
export default PageSelectModal;
