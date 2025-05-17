import {TouchableOpacity, View} from 'react-native';
import Text from '../Text';
import {useTranslation} from 'react-i18next';
import Modal from './Modal';

const NeedServiceModal = (props: any) => {
  const {setModal, onSubmit} = props;
  const {t} = useTranslation();

  return (
    <Modal animationType="fade" {...props} className="items-center justify-center">
      <View className="w-full p-8">
        <View className="w-full bg-white rounded-[10px] items-center">
          <View className="p-8 items-center">
            <Text className="text-base text-black font-bold mb-4">{t('goToServiceTitle')}</Text>
            <View className="flex-row">
              <TouchableOpacity className="h-12 items-center justify-center bg-border px-6 rounded-md mr-2" onPress={() => setModal(false)}>
                <Text className="font-medium text-textContainer">{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity className="h-12 items-center justify-center bg-primary px-6 rounded-md ml-2" onPress={onSubmit}>
                <Text className="font-medium text-textContainer">{t('goToService')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default NeedServiceModal;
