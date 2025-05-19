/* eslint-disable react-hooks/exhaustive-deps */
import {Pressable, SafeAreaView, View, Dimensions, Platform, StatusBar} from 'react-native';
import Animated, {runOnJS, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import CloseSvg from 'app/assets/svg/close22.svg';
import DownloadSvg from 'app/assets/svg/download.svg';
import {useEffect, useState} from 'react';
import {Gesture, GestureDetector, gestureHandlerRootHOC} from 'react-native-gesture-handler';
import {last, max, split} from 'lodash';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import RNFetchBlob from 'rn-fetch-blob';
import {Snackbar} from 'react-native-paper';
import Text from '../Text';
import Image from '../Image';
import Modal from './Modal';
import Svg from '../Svg';
const dimensions = Dimensions.get('screen');

const ImageModal = (props: any) => {
  const {modal} = props;
  const [visibleSnackbar, setVisibleSnackbar] = useState(false);
  if (!modal) return <></>;
  return (
    <Modal animationType="none" {...props}>
      <WithHoc {...props} setVisibleSnackbar={setVisibleSnackbar} />
      <Snackbar
        className="mb-12 bg-gray-900 rounded-full mx-16"
        visible={visibleSnackbar}
        duration={1500}
        onDismiss={() => setVisibleSnackbar(false)}>
        <Text className="text-center text-white">Dowmload Completed!</Text>
      </Snackbar>
    </Modal>
  );
};

const WithHoc = gestureHandlerRootHOC((props: any) => {
  const top = props.top + 40;
  const bottom = 20;
  const {image, modal, setModal, setVisibleSnackbar} = props;
  const {width, height}: any = image;
  const dWidth = dimensions.width - 30;
  const dHeight = dimensions.height - top - bottom;
  const cWidth = width * (dHeight / height);
  const cHeight = height * (dWidth / width);
  let sizeCustom: any = {};
  if (width > height || (cWidth > dWidth && cHeight < dHeight)) {
    sizeCustom = {width: dWidth, height: cHeight};
  } else {
    sizeCustom = {height: dHeight, width: cWidth};
  }
  const percHeight = dimensions.height / sizeCustom.height;
  const percWidth = dimensions.width / sizeCustom.width;
  const percent: any = max([3, percHeight, percWidth]);
  const [visible, setVisible]: any = useState(modal);
  const aTransX = useSharedValue(15 + (dimensions.width - 30 - sizeCustom.width) / 2);
  const aTransY = useSharedValue(top + (dimensions.height - top - bottom - sizeCustom.height) / 2);
  const offsetY = useSharedValue(top + (dimensions.height - top - bottom - sizeCustom.height) / 2);
  const customWidth = useSharedValue(sizeCustom.width);
  const customHeight = useSharedValue(sizeCustom.height);
  const openity = useSharedValue(1);
  const statusBarHeight = Platform.OS === 'android' ? Number(StatusBar.currentHeight || 0) + 10 : 0;

  const styleTransOp = useAnimatedStyle(() => ({opacity: openity.value}));
  const styleTrans = useAnimatedStyle(() => ({
    transform: [{translateX: aTransX.value}, {translateY: aTransY.value}],
    width: customWidth.value,
    height: customHeight.value,
  }));

  useEffect(() => {
    setTimeout(() => {
      setModal(visible);
    }, 150);
  }, [visible]);

  const saveToGallery = () => {
    const filename = new Date().getTime() + 'image.' + last(split(split(image.uri, '?')[0], '.'));
    const cacheDir = RNFetchBlob.fs.dirs.DownloadDir;
    const imagePath = `${cacheDir}/${filename}`;
    RNFetchBlob.config({fileCache: true, path: imagePath})
      .fetch('GET', image.uri)
      .then(res => {
        CameraRoll.saveAsset(res.data)
          .then(() => {
            setVisibleSnackbar(true);
            res.flush();
          })
          .catch(error => console.log(error));
      });
  };

  const panGesture = Gesture.Pan()
    .onChange(event => {
      if (sizeCustom.width !== customWidth.value) {
        let transX = aTransX.value + event.changeX;
        transX = transX < -(sizeCustom.width * percent - dimensions.width) ? -(sizeCustom.width * percent - dimensions.width) : transX;
        aTransX.value = transX > 0 ? 0 : transX;

        let transY = aTransY.value + event.changeY;
        transY = transY < -(sizeCustom.height * percent - dimensions.height) ? -(sizeCustom.height * percent - dimensions.height) : transY;
        aTransY.value = transY > 0 ? 0 : transY;
      }
    })
    .onUpdate(event => {
      const op = 1 - event.translationY / 400;
      if (sizeCustom.width === customWidth.value) {
        let transY = offsetY.value + event.translationY;
        aTransY.value = transY > offsetY.value ? transY : offsetY.value;
        openity.value = op;
      }
    })
    .onEnd(event => {
      if (sizeCustom.width === customWidth.value) {
        if (event.translationY > 130) {
          aTransY.value = withTiming(dimensions.height, {duration: 150});
          runOnJS(setVisible)(false);
        } else {
          aTransY.value = withTiming(offsetY.value, {duration: 150});
          openity.value = withTiming(1, {duration: 150});
        }
      }
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(event => {
      const {x, y} = event;
      if (sizeCustom.width === customWidth.value) {
        let transX = -(x * percent - dimensions.width / 2);
        transX = transX < -(sizeCustom.width * percent - dimensions.width) ? -(sizeCustom.width * percent - dimensions.width) : transX;
        let transY = -(y * percent - dimensions.height / 2);
        transY = transY < -(sizeCustom.height * percent - dimensions.height) ? -(sizeCustom.height * percent - dimensions.height) : transY;
        customWidth.value = withTiming(sizeCustom.width * percent, {duration: 150});
        customHeight.value = withTiming(sizeCustom.height * percent, {duration: 150});
        aTransX.value = withTiming(transX > 0 ? 0 : transX, {duration: 150});
        aTransY.value = withTiming(transY > 0 ? 0 : transY, {duration: 150});
      } else {
        customWidth.value = withTiming(sizeCustom.width, {duration: 150});
        customHeight.value = withTiming(sizeCustom.height, {duration: 150});
        aTransX.value = withTiming(15 + (dimensions.width - 30 - sizeCustom.width) / 2, {duration: 150});
        aTransY.value = withTiming(top + (dimensions.height - top - bottom - sizeCustom.height) / 2, {duration: 150});
      }
    });
  return (
    <View className="flex-1">
      <Animated.View className="absolute bg-black h-full w-full" style={[styleTransOp]} />
      <SafeAreaView>
        <View className="flex-row justify-end px-[15] h-[40px]" style={{paddingTop: statusBarHeight}}>
          <Pressable onPress={saveToGallery}>
            <Svg icon={DownloadSvg} className={`text-white`} />
          </Pressable>
          <Pressable className="pl-4" onPress={() => setModal(false)}>
            <Svg icon={CloseSvg} className={`text-white`} />
          </Pressable>
        </View>
      </SafeAreaView>
      <GestureDetector gesture={Gesture.Exclusive(panGesture, doubleTap)}>
        <Image animated className="absolute rounded-2xl" uri={image.uri} style={styleTrans} />
      </GestureDetector>
    </View>
  );
});

export default ImageModal;
