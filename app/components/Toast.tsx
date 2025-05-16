import React, {useState} from 'react';
import {Dimensions, SafeAreaView, View} from 'react-native';
import Animated, {runOnJS, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
const dimensions = Dimensions.get('screen');

const Toast = ({children, action, delay = 4000}: any) => {
  const translateY = useSharedValue(-dimensions.height);
  const translateX = useSharedValue(0);
  const transOpacity = useSharedValue(1);
  const [isHidden, setIsHidden]: any = useState(false);
  const [isChange, setIsChange]: any = useState(false);
  const [isHeight, setIsHeight]: any = useState(false);
  const styleTrans = useAnimatedStyle(() => ({
    opacity: transOpacity.value,
    transform: [{translateX: translateX.value}, {translateY: translateY.value}],
  }));

  const handleTouchEnd = () => setTimeout(() => setIsHidden(true), 300);

  const handleGetLayout = (event: any) => {
    const height = event.nativeEvent.layout.height + 50;
    if (!isHeight && height) {
      setIsHeight(true);
      translateY.value = -height;
      translateY.value = withSequence(withTiming(0, {duration: 400}), withDelay(delay - 400, withTiming(-height, {duration: 200})));
      setTimeout(() => setIsHidden(true), delay + 300);
    }
  };

  const gesturePan = Gesture.Pan()
    .onChange(event => {
      if (!isChange) {
        runOnJS(setIsChange)(true);
      }
      if (event.translationX < 0) {
        translateX.value = event.translationX;
        transOpacity.value = 1 - event.translationX / -dimensions.width;
      }
    })
    .onFinalize(() => {
      if (isChange) {
        if (translateX.value > -dimensions.width / 4) {
          translateX.value = withTiming(0, {duration: 100});
          transOpacity.value = withTiming(1, {duration: 100});
        } else {
          translateX.value = withTiming(-dimensions.width, {duration: 200});
          transOpacity.value = withTiming(0, {duration: 200});
          runOnJS(handleTouchEnd)();
        }
        runOnJS(setIsChange)(false);
      } else {
        translateX.value = withDelay(400, withTiming(-dimensions.width, {duration: 200}));
        transOpacity.value = withDelay(400, withTiming(0, {duration: 200}));
        runOnJS(action)();
      }
    });

  return (
    <SafeAreaView className={`absolute top-4 w-full px-4 py-2 z-10 mb-8 ${isHidden ? 'hidden' : ''}`}>
      <View className="px-4 pt-2" onLayout={handleGetLayout}>
        <GestureDetector gesture={gesturePan}>
          <Animated.View className="bg-white rounded-[10px] p-4" style={[options.shadow, styleTrans]}>
            {children}
          </Animated.View>
        </GestureDetector>
      </View>
    </SafeAreaView>
  );
};

const options = {
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
};

export default Toast;
