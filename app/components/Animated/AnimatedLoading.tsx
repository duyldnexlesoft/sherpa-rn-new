/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect} from 'react';
import {View} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming} from 'react-native-reanimated';

const AnimatedLoading = ({style}: any) => {
  const aHeightDot1 = useSharedValue(0.4);
  const aHeightDot2 = useSharedValue(0.4);
  const aHeightDot3 = useSharedValue(0.4);

  const aOpacityDot1 = useSharedValue(0.3);
  const aOpacityDot2 = useSharedValue(0.3);
  const aOpacityDot3 = useSharedValue(0.3);

  const styleDot1 = useAnimatedStyle(() => ({transform: [{scaleY: aHeightDot1.value}], opacity: aOpacityDot1.value}));
  const styleDot2 = useAnimatedStyle(() => ({transform: [{scaleY: aHeightDot2.value}], opacity: aOpacityDot2.value}));
  const styleDot3 = useAnimatedStyle(() => ({transform: [{scaleY: aHeightDot3.value}], opacity: aOpacityDot3.value}));

  useEffect(() => {
    renderAnimation(aHeightDot1, 1, 200, 0.4, 1);
    renderAnimation(aOpacityDot1, 1, 200, 0.3, 1);

    renderAnimation(aHeightDot2, 2, 200, 0.4, 1);
    renderAnimation(aOpacityDot2, 2, 200, 0.3, 1);

    renderAnimation(aHeightDot3, 3, 200, 0.4, 1);
    renderAnimation(aOpacityDot3, 3, 200, 0.3, 1);
  }, []);

  const renderAnimation = (animation: any, index: any, duration: any, formValue: any, toValue: any) => {
    animation.value = withRepeat(
      withSequence(
        withTiming(index === 1 ? toValue : formValue, {duration: index === 1 ? duration : 100}),
        withTiming(index === 2 ? toValue : formValue, {duration: index === 1 || index === 2 ? duration : 100}),
        withTiming(index === 3 ? toValue : formValue, {duration: index === 2 || index === 3 ? duration : 100}),
        withTiming(formValue, {duration: index === 3 ? duration : 100}),
      ),
      -1,
      true,
    );
  };

  return (
    <View className="flex-row items-center">
      <Animated.View className="rounded-full m-0.5" style={[styleDot1, style, {height: 24, width: 10}]} />
      <Animated.View className="rounded-full m-0.5" style={[styleDot2, style, {height: 24, width: 10}]} />
      <Animated.View className="rounded-full m-0.5" style={[styleDot3, style, {height: 24, width: 10}]} />
    </View>
  );
};

export default AnimatedLoading;
