import {View} from 'react-native';
import Text from '../Text';
import UserLogoutSvg from 'app/assets/svg/userLogout.svg';
import {useTranslation} from 'react-i18next';
import Modal from './Modal';

const LogoutModal = (props: any) => {
  const {setModal, onSubmit} = props;
  const {t} = useTranslation();
  return (
    <Modal animationType="fade" {...props} className="items-center justify-center">
      <View className="w-full p-8">
        <View className="w-full bg-white rounded-[10px] items-center">
          <View className="p-8 items-center">
            <View className="items-center justify-center w-[60px] h-[60px] bg-secondary rounded-full border border-[6px] border-lightSecondary">
              <UserLogoutSvg className="text-white" />
            </View>
            <Text className="text-base text-black font-bold mb-2 mt-4">{t('logOut')}</Text>
            <Text className="text-sm text-black text-center">{t('logOutDescription')}</Text>
          </View>
          <View className="w-full items-center py-2 border-t border-border">
            <View className="flex-row ">
              <View className="mr-6" onTouchStart={() => setModal(false)}>
                <Text className="text-secondary text-base py-2 px-4">{t('no')}</Text>
              </View>
              <View className="ml-6" onTouchStart={onSubmit}>
                <Text className="text-red-500 text-base py-2 px-4">{t('yes')}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LogoutModal;
