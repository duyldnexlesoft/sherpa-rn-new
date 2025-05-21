/* eslint-disable react-hooks/exhaustive-deps */
import {useEffect, useState} from 'react';
import {remapProps} from 'nativewind';
import {BackHandler, Dimensions, KeyboardAvoidingView, Platform, View} from 'react-native';
import {Gesture, GestureDetector, GestureHandlerRootView} from 'react-native-gesture-handler';
import Animated, {runOnJS, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
const dimensions = Dimensions.get('screen');

const Modal = (props: any) => {
  const {modal, setModal, animationType, style, children} = props;
  const aOpacity = useSharedValue(0);
  const aTransY = useSharedValue(dimensions.height);
  const aTransX = useSharedValue(0);
  const styleOpacity = useAnimatedStyle(() => ({opacity: aOpacity.value}));
  const styleTransY = useAnimatedStyle(() => ({transform: [{translateY: aTransY.value}]}));
  const styleTransX = useAnimatedStyle(() => ({transform: [{translateX: aTransX.value}]}));
  const isNone = animationType === 'none';
  const showDuration = animationType === 'slide' ? 350 : 200;
  const hideDuration = animationType === 'slide' ? 250 : 150;
  const [modalReact, setModalReact] = useState(modal);

  useEffect(() => {
    if (modal) {
      aTransX.value = 0;
    }
    if (!isNone) {
      aOpacity.value = withTiming(modal ? 1 : 0, {duration: modal ? showDuration : hideDuration});
      aTransY.value = withTiming(modal ? 0 : dimensions.height, {duration: modal ? showDuration : hideDuration});
    }
    if (!modal && !isNone) {
      setTimeout(() => setModalReact(modal), hideDuration);
    } else {
      setModalReact(modal);
    }
  }, [modal]);

  const gesturePan = Gesture.Pan()
    .onChange(event => {
      if (event.translationY >= 0) aTransY.value = event.translationY;
    })
    .onEnd(event => {
      if (event.translationY < 90) {
        aTransY.value = withTiming(0, {duration: showDuration});
      } else {
        aTransY.value = withTiming(dimensions.height, {duration: hideDuration});
        runOnJS(setModal)(false);
      }
    });

  const gesturePanFull = Gesture.Pan()
    .onChange(event => {
      if (event.translationX >= 0 && event.absoluteX - event.translationX <= 40) aTransX.value = event.translationX;
    })
    .onEnd(event => {
      if (event.translationX >= 90 && event.absoluteX - event.translationX <= 40) {
        aTransX.value = withTiming(dimensions.height, {duration: hideDuration});
        runOnJS(setModal)(false);
      } else {
        aTransX.value = withTiming(0, {duration: showDuration});
      }
    });

  useEffect(() => {
    const handleBackPress = () => {
      if (!modal) return false;
      setModal(false);
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, [modal]);

  if (!modalReact) return <></>;

  return !isNone ? (
    <View className="absolute w-full z-10" style={{height: dimensions.height}}>
      <GestureHandlerRootView style={{flex: 1}}>
        <Animated.View style={styleOpacity} className="absolute bg-textContainer/50 h-full w-full z-10" onTouchEnd={() => setModal(false)} />
        <GestureDetector gesture={gesturePanFull}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="z-10 w-full h-full">
            <Animated.View className="flex-1 z-10" style={[style, styleTransX, animationType === 'slide' ? styleTransY : styleOpacity]}>
              <View className="absolute flex-1 h-full w-full" onTouchEnd={() => setModal(false)}></View>
              {animationType === 'slide' ? <GestureDetector gesture={gesturePan}>{children}</GestureDetector> : children}
            </Animated.View>
          </KeyboardAvoidingView>
        </GestureDetector>
      </GestureHandlerRootView>
    </View>
  ) : (
    <View className="absolute w-full z-10" style={[style, {width: dimensions.width, height: dimensions.height}]}>
      <View className="absolute bg-textContainer/50 h-full w-full" onTouchEnd={() => setModal(false)} />
      {children}
    </View>
  );
};
remapProps(Modal, {className: 'style'});
export default Modal;
