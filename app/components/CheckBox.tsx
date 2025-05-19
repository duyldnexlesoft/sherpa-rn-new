import {Pressable} from 'react-native';
import CheckedIcon from 'app/assets/svg/checked.svg';
import Svg from './Svg';

const CheckBox = ({status, onPress}: any) => {
  return (
    <Pressable
      className={`w-[30px] h-[30px] rounded-sm flex items-center justify-center 
      ${status ? 'bg-primary' : 'bg-backgroundHover'}`}
      onPress={onPress}>
      <Svg icon={CheckedIcon} width={18} height={12} className={`${status ? 'text-white' : 'text-backgroundHover'}`} />
    </Pressable>
  );
};

export default CheckBox;
