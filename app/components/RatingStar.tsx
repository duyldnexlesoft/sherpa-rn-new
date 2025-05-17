import {View} from 'react-native';
import {fill} from 'lodash';
import StarIcon from 'app/assets/svg/star.svg';

const RatingStar = (props: any) => {
  const {rate} = props;
  return (
    <View {...props}>
      {fill(Array(rate), null).map((_, index) => (
        <StarIcon width={13} className="mx-0.5" key={`star-${index}`} />
      ))}
    </View>
  );
};

export default RatingStar;
