import {View} from 'react-native';
import Text from '../Text';
import TrashSvg from 'app/assets/svg/trash.svg';
import {useTranslation} from 'react-i18next';
import Modal from './Modal';
import { remapProps } from 'nativewind';

const DeleteUserModal = (props: any) => {
  const {setModal, onSubmit} = props;
  const {t} = useTranslation();
  return (
    <Modal animationType="fade" {...props} className="items-center justify-center">
      <View className="w-full p-8">
        <View className="w-full bg-white rounded-[10px] items-center">
          <View className="p-8 items-center">
            <View className="items-center justify-center w-[60px] h-[60px] bg-red-500 rounded-full border border-[6px] border-red-50">
              <TrashSvg className="text-white" />
            </View>
            <Text className="text-base text-black font-bold mb-2 mt-4">{t('deleteAccountTitle')}</Text>
            <Text className="text-sm text-black text-center">{t('deleteAccountDescription')}</Text>
          </View>
          <View className="w-full items-center py-2 border-t border-border">
            <View className="flex-row ">
              <View className="mr-6" onTouchStart={() => setModal(false)}>
                <Text className="text-secondary text-base py-2 px-4"> {t('cancel')}</Text>
              </View>
              <View className="ml-6" onTouchStart={onSubmit}>
                <Text className="text-red-500 text-base py-2 px-4"> {t('delete')}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
remapProps(DeleteUserModal, {className: 'style'});
export default DeleteUserModal;
