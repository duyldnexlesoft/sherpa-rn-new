import {Pressable} from 'react-native';
import CheckedIcon from 'app/assets/svg/checked.svg';
import {create} from 'twrnc';
import tailwindConfig from 'tailwind.config';

const CheckBox = ({status, onPress}: any) => {
  const newConfig: any = {theme: tailwindConfig.theme};
  const tw = create(newConfig);
  return (
    <Pressable
      className={`w-[30px] h-[30px] rounded-sm flex items-center justify-center 
      ${status ? 'bg-primary' : 'bg-backgroundHover'}`}
      onPress={onPress}>
      <CheckedIcon width={18} height={12} style={tw`${status ? 'text-white' : 'text-backgroundHover'}`} />
    </Pressable>
  );
};

export default CheckBox;
