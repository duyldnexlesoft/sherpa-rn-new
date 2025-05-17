/* eslint-disable import/no-unresolved */
/* eslint-disable react-hooks/exhaustive-deps */
import {useEffect} from 'react';
import {View, Dimensions, Pressable} from 'react-native';
import ImageIcon from 'app/assets/svg/image.svg';
import CloseIcon from 'app/assets/svg/close.svg';
import AddIcon from 'app/assets/svg/add.svg';
import Animated, {runOnJS, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import _ from 'lodash';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {useDispatch} from 'react-redux';
import {userAction} from 'app/store/actions';
import {changeImageIndex, deleteImage} from 'app/api/userApi';
import {useMutation} from '@tanstack/react-query';
import Image from 'app/components/Image';
import {create} from 'twrnc';
import tailwindConfig from 'tailwind.config';
const dimensions = Dimensions.get('screen');
const GAP = 10;
const WIDH_DEFAULD = (dimensions.width - 32 - GAP * 2) / 3;

const BoxImage = ({image, boxImages, setBoxImages, handleChoosePhoto, rootLayout}: any) => {
  const newConfig: any = {theme: tailwindConfig.theme};
  const tw = create(newConfig);
  const dispatch = useDispatch();
  const {size, url, index, pointX, pointY} = image;
  const width = WIDH_DEFAULD * size + (size - 1) * GAP;
  const aTransX = useSharedValue(pointX);
  const aTransY = useSharedValue(pointY);
  const adWidth = useSharedValue(width);
  const aHeight = useSharedValue(width);
  const aZindex = useSharedValue(1);

  const muChangeImageIndex = useMutation({
    mutationKey: ['changeImageIndex'],
    mutationFn: changeImageIndex,
    onSuccess: (response: any) => {
      if (response?.data?.code === 200) {
        dispatch(userAction.updateCurrentUser(response?.data?.data));
      }
    },
    onError: () => {},
  });

  const muDeleteImage = useMutation({
    mutationKey: ['deleteImage'],
    mutationFn: deleteImage,
    onSuccess: (response: any) => {
      if (response?.data?.code === 200) {
        dispatch(userAction.updateCurrentUser(response?.data?.data));
      }
    },
    onError: () => {},
  });

  const styleTrans = useAnimatedStyle(() => ({
    transform: [{translateX: aTransX.value}, {translateY: aTransY.value}],
    width: adWidth.value,
    height: aHeight.value,
    zIndex: aZindex.value,
  }));

  useEffect(() => {
    aTransX.value = withTiming(pointX, {duration: 200});
    aTransY.value = withTiming(pointY, {duration: 200});
  }, [pointX, pointY]);

  useEffect(() => {
    adWidth.value = withTiming(width, {duration: 200});
    aHeight.value = withTiming(width, {duration: 200});
  }, [width]);

  const handleTouchEnd = (px: any, py: any) => {
    const newBoxImages = _.cloneDeep(boxImages);
    let imagecheck: any;

    boxImages.forEach((img: any) => {
      const centerPointX = img.pointX + rootLayout.x + (WIDH_DEFAULD * img.size + (img.size - 1) * GAP) / 2;
      const centerPointY = img.pointY + rootLayout.y + (WIDH_DEFAULD * img.size + (img.size - 1) * GAP) / 2;
      const raX = px - centerPointX > 0 ? px - centerPointX : centerPointX - px;
      const raY = py - centerPointY > 0 ? py - centerPointY : centerPointY - py;
      if (raX < (img.index === 0 ? 80 : 50) && raY < (img.index === 0 ? 80 : 50) && img.url && img.index !== index) {
        imagecheck = img;
      }
    });

    if (imagecheck) {
      newBoxImages.forEach((boxImage: any) => {
        if (boxImage.url === url) {
          boxImage.index = imagecheck.index;
          boxImage.pointX = imagecheck.pointX;
          boxImage.pointY = imagecheck.pointY;
          boxImage.size = imagecheck.size;
        } else if (boxImage.url === imagecheck.url) {
          boxImage.index = index;
          boxImage.pointX = pointX;
          boxImage.pointY = pointY;
          boxImage.size = size;
        }
      });
      setBoxImages(newBoxImages);
      muChangeImageIndex.mutate({images: _.filter(_.map(_.orderBy(newBoxImages, 'index'), 'url'))});
      aZindex.value = 1;
    } else {
      adWidth.value = withTiming(width, {duration: 100});
      aHeight.value = withTiming(width, {duration: 100});
      aTransX.value = withTiming(pointX, {duration: 100});
      aTransY.value = withTiming(pointY, {duration: 100});
      aZindex.value = 1;
    }
  };

  const handleDeleteImage = () => {
    let newBoxImages = _.cloneDeep(boxImages);
    let indexMaxImage = _.max(_.map(_.filter(newBoxImages, 'url'), 'index'));
    for (let i = 0; i < newBoxImages.length; i++) {
      const boxImage = newBoxImages[i];
      if (boxImage.index === index && boxImage.url) {
        boxImage.url = null;
        boxImage.size = 0;
      }
    }
    for (let i = 0; i < newBoxImages.length; i++) {
      const boxImage = newBoxImages[i];
      if (boxImage.index > index && boxImage.url) {
        const indexsPer = boxImages.find((img: any) => img.index === boxImage.index - 1 && img.url && img.size !== 0);
        boxImage.index = indexsPer.index;
        boxImage.pointX = indexsPer.pointX;
        boxImage.pointY = indexsPer.pointY;
        boxImage.size = indexsPer.size;
      }
    }
    if (newBoxImages.filter((img: any) => img.size !== 0).length < 7) {
      const indexsPer = boxImages.find((img: any) => img.index === indexMaxImage && img.url && img.size !== 0);
      newBoxImages.push({index: indexMaxImage, url: null, pointX: indexsPer.pointX, pointY: indexsPer.pointY, size: indexsPer.size});
    }
    indexMaxImage = _.max(_.map(_.filter(newBoxImages, 'url'), 'index'));
    newBoxImages = newBoxImages.filter((img: any) => img.index <= (indexMaxImage > 5 ? indexMaxImage : 5));
    setBoxImages(newBoxImages);
    muDeleteImage.mutate({image: url});
  };

  const gesturePan = Gesture.Pan()
    .onChange(event => {
      aTransX.value = event.absoluteX - rootLayout.x - WIDH_DEFAULD / 2;
      aTransY.value = event.absoluteY - rootLayout.y - WIDH_DEFAULD / 2;
      aZindex.value = 2;
    })
    .onFinalize(event => {
      runOnJS(handleTouchEnd)(event.absoluteX, event.absoluteY);
    })
    .onBegin(event => {
      if (event.x < width - 30 && event.y < width - 30) {
        adWidth.value = withTiming(WIDH_DEFAULD, {duration: 100});
        aHeight.value = withTiming(WIDH_DEFAULD, {duration: 100});
        aTransX.value = withTiming(event.absoluteX - rootLayout.x - WIDH_DEFAULD / 2, {duration: 100});
        aTransY.value = withTiming(event.absoluteY - rootLayout.y - WIDH_DEFAULD / 2, {duration: 100});
        aZindex.value = 2;
      }
    });

  if (size === 0) {
    return null;
  }

  if (!url) {
    return (
      <Pressable
        onPress={handleChoosePhoto}
        className="bg-backgroundHover absolute rounded-[10px] items-center justify-center"
        style={{width: width, height: width, transform: [{translateX: pointX}, {translateY: pointY}]}}>
        <ImageIcon style={tw`text-border`} width={width / 4} height={width / 4} />
        <View className="w-6 h-6 rounded-full items-center justify-center bg-white absolute right-2 bottom-2 border border-border">
          <AddIcon style={tw`text-primary`} width={14} height={14} />
        </View>
      </Pressable>
    );
  }

  return (
    <GestureDetector gesture={gesturePan}>
      <Animated.View style={[styleTrans]} className="bg-backgroundHover rounded-[10px] absolute items-center justify-center">
        <View className="rounded-[10px] overflow-hidden w-full h-full">
          <Image className="w-full h-full" uri={url} />
        </View>
        <Pressable
          className="w-6 h-6 rounded-full items-center justify-center bg-white absolute right-2 bottom-2 border border-border"
          onPress={handleDeleteImage}>
          <CloseIcon style={tw`text-gray-500`} width={14} height={14} />
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
};

export default BoxImage;
