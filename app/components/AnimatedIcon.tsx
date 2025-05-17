import CheckedIcon from 'app/assets/svg/checked.svg';
import React from 'react';
import Animated from 'react-native-reanimated';

class CheckedComponent extends React.Component<any, any> {
  render() {
    return <CheckedIcon style={{color: this.props.color}} />;
  }
}

export const AnimatedCheckedIcon: any = Animated.createAnimatedComponent(CheckedComponent);
