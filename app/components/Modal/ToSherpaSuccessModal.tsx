import {View} from 'react-native';
import Text from '../Text';
import SherpauserSvg from 'app/assets/svg/sherpa-user.svg';
import ButtonGreen from '../button/ButtonGreen';
import ROUTER from 'app/navigation/router';
import {useTranslation} from 'react-i18next';
import Modal from './Modal';

const ToSherpaSuccessModal = (props: any) => {
  const {setModal, navigation} = props;
  const {t} = useTranslation();
  const handleSubmit = () => {
    setModal(false);
    navigation.navigate(ROUTER.PROFILE);
  };

  return (
    <Modal animationType="fade" {...props} className="items-center justify-center">
      <View className="w-full p-8">
        <View className="w-full bg-white rounded-[10px] items-center">
          <View className="p-8 items-center">
            <SherpauserSvg />
            <Text className="text-base text-black font-bold mb-2 mt-4">{t('toSherpaSuccess')}</Text>
            <Text className="text-sm text-black text-center">{t('toSherpaSuccessDescription')}</Text>
            <View className="mt-6">
              <ButtonGreen className="px-8" onPress={handleSubmit}>
                {t('ok')}
              </ButtonGreen>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ToSherpaSuccessModal;
