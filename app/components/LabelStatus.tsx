import {View} from 'react-native';
import {STATUS} from 'app/utils/constants';
import Text from './Text';
import {getStatus} from 'app/utils/helpler';

const LabelStatus = (props: any) => {
  const {booking} = props;
  let viewCss = '';
  let textCss = '';
  let status = getStatus(booking);
  if (STATUS.REQUESTED === status) {
    viewCss = ' bg-purple-50';
    textCss = ' text-purple-600';
  } else if (STATUS.EXPIRED === status) {
    viewCss = ' bg-orange-50';
    textCss = ' text-orange-600';
  } else if (STATUS.REJECTED === status) {
    viewCss = ' bg-red-50';
    textCss = ' text-red-600';
  } else if (STATUS.ACCEPTED === status) {
    viewCss = ' bg-yellow-50';
    textCss = ' text-yellow-600';
  } else if (STATUS.CONFIRMED === status) {
    viewCss = ' bg-green-50';
    textCss = ' text-green-600';
  } else if (STATUS.CANCELED === status || STATUS.REFUNDED === status) {
    viewCss = ' bg-gray-50';
    textCss = ' text-gray-600';
  } else if (STATUS.COMPLETED === status) {
    viewCss = ' bg-blue-50';
    textCss = ' text-blue-600';
  }
  return (
    <View className={'px-2 py-1 rounded items-center ' + viewCss} {...props}>
      <Text className={'text-xs ' + textCss}>{status}</Text>
    </View>
  );
};

export default LabelStatus;
