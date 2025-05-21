import {useTranslation} from 'react-i18next';
import {Pressable, SafeAreaView, View} from 'react-native';
import Modal from './Modal';
import { remapProps } from 'nativewind';
import Text from '../Text';

const AlertSelectModal = (props: any) => {
  const {setModal, modal, onSelect, title, items} = props;
  const {t} = useTranslation();
  const handleSelect = (value: string) => {
    onSelect && onSelect(value);
    setModal(!modal);
  };
  return (
    <Modal animationType="slide" {...props}>
      <SafeAreaView className="absolute bottom-4 w-full z-10">
        <View className="px-4 ">
          <View className="bg-white rounded-[10px] overflow-hidden">
            <View className="divide-y divide-border">
              <View className="mt-4 mb-2 bg-white items-center justify-center">
                <View className="w-16 h-2 bg-[#F9F5F5] rounded-full mb-2" />
                <Text className="text-center text-lg font-medium text-textContainer">
                  {t('select')} {title}
                </Text>
              </View>
              {items.map((item: string, index: any) => (
                <Pressable key={`key-${title}-${index + 1}`} className="bg-white h-12 items-center justify-center" onPress={() => handleSelect(item)}>
                  <Text className="text-center text-lg text-secondary">{item}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <Pressable className="bg-white rounded-[10px] h-12 mt-3 items-center justify-center" onPress={() => setModal(false)}>
            <Text className="text-lg font-bold text-textContainer">{t('cancel')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
remapProps(AlertSelectModal, {className: 'style'});
export default AlertSelectModal;
