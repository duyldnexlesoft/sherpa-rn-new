import { tw } from 'app/utils/helpler';
import { filter } from 'lodash';

const Svg = (props: any) => {
  const {icon: Icon, className, width, height} = props;  
  return <Icon style={tw`${className}`} {...filter({width, height})} />;
};
export default Svg;
