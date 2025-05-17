import {useState} from 'react';
import {Dimensions, Pressable, FlatList, View} from 'react-native';
import ImageIcon from 'app/assets/svg/image.svg';
import ROUTER from 'app/navigation/router';
import _, {isString} from 'lodash';
import Image from './Image';
import {create} from 'twrnc';
import tailwindConfig from 'tailwind.config';
const {width} = Dimensions.get('screen');

const SliderImage = ({height, Images, navigation, isViewSherpa, bottom}: any) => {
  const newConfig: any = {theme: tailwindConfig.theme};
  const tw = create(newConfig);
  const [indexImage, setIndexImage] = useState(0);
  const handleScroll = (event: any) => {
    const index = event.nativeEvent.contentOffset.x / width;
    setIndexImage(Number(index.toFixed(0)));
  };

  return (
    <View className="relative w-full">
      {!_.isEmpty(Images) ? (
        <>
          <FlatList
            data={Images.map((item: any) => (isString(item) ? {url: item} : {render: item}))}
            renderItem={({item}) => {
              if (item.render) {
                return <View style={{height, width}}>{item.render()}</View>;
              } else {
                return <SliderItem item={item} height={height} />;
              }
            }}
            horizontal
            pagingEnabled
            snapToAlignment="center"
            onScroll={handleScroll}
            showsHorizontalScrollIndicator={false}
          />
          <View className="absolute w-full" style={{bottom: bottom || 56}}>
            {_.size(Images) > 1 && <Pagination indexImage={indexImage} images={Images} />}
          </View>
        </>
      ) : (
        <Pressable
          onPress={() => !isViewSherpa && navigation.navigate(ROUTER.EDIT_GALLERY)}
          className="items-center justify-center w-full"
          style={{height, width}}>
          <ImageIcon style={tw`text-border`} width={100} height={100} />
        </Pressable>
      )}
    </View>
  );
};

const SliderItem = ({item, height}: any) => {
  return (
    <View className="items-center" style={{width, height}}>
      <Image uri={item.url} className="w-full flex-[1]" />
    </View>
  );
};
const Pagination = ({indexImage, images}: any) => {
  return (
    <View className="flex-row items-center justify-center">
      {images?.map((_s: any, i: any) => (
        <View key={`key-pag-${i + 1}`} className={`${indexImage === i ? 'bg-primary' : 'bg-white'} w-3 h-3 rounded-full mx-1.5`} />
      ))}
    </View>
  );
};
export default SliderImage;
