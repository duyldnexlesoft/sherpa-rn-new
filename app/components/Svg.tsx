import { tw } from 'app/utils/helpler';
import { pickBy } from 'lodash';

const Svg = (props: any) => {
  const {icon: Icon, className, width, height} = props;
  return <Icon style={tw`${className}`} {...pickBy({width, height})} />;
};
export default Svg;
