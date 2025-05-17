import {useState} from 'react';
import {Pressable, View} from 'react-native';
import _ from 'lodash';
import Text from './Text';

const TextLazy = ({children, style}: any) => {
  const [seeMore, setSeeMore] = useState(false);
  const sizeText = _.size(children) > 200;
  const textLess = sizeText ? children.substring(0, 150) : children;
  return (
    <View>
      <Text className="text-sm" style={[style]}>
        {seeMore ? children : textLess} {sizeText && !seeMore ? '...' : ''}
      </Text>
      {sizeText && (
        <Pressable className="py-2" onPress={() => setSeeMore(!seeMore)}>
          <Text className="text-center text-gray-500">{seeMore ? 'See less' : 'See more'}</Text>
        </Pressable>
      )}
    </View>
  );
};

export default TextLazy;
