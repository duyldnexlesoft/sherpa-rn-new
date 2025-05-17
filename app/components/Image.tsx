import {ImageProps} from 'react-native';
import {remapProps} from 'nativewind';
import FastImage from '@d11/react-native-fast-image';

export interface ImageCustomProps extends ImageProps {
  width?: number;
  height?: number;
  source?: any;
  uri?: string;
  animated?: boolean;
}

const Image = (props: ImageCustomProps) => {
  const {style, source, uri}: any = props;
  return <FastImage style={style} source={source || {uri: uri, priority: FastImage.priority.normal}} resizeMode={FastImage.resizeMode.contain} />;
};
remapProps(Image, {className: 'style'});

export default Image;
