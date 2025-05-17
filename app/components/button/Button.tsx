import {TouchableOpacity} from 'react-native';
import Text from '../Text';
import { remapProps } from 'nativewind';

const Button = (props: any) => {
  return (
    <TouchableOpacity className="bg-border rounded-md h-12 px-4 justify-center" {...props}>
      <Text className="text-gray-900 font-medium" style={props.style}>{props.children}</Text>
    </TouchableOpacity>
  );
};

remapProps(Button, {className: 'style'});
export default Button;
