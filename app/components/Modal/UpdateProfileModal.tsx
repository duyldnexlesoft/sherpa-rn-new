import {View} from 'react-native';
import Text from '../Text';
import Button from '../button/Button';
import UpdateSvg from 'app/assets/svg/update-profile.svg';
import {useTranslation} from 'react-i18next';
import Modal from './Modal';

const UpdateProfileModal = (props: any) => {
  const {onSubmit} = props;
  const {t} = useTranslation();
  return (
    <Modal animationType="fade" {...props} className="items-center justify-center">
      <View className="w-full p-8">
        <View className="w-full bg-white rounded-[10px] p-8 items-center">
          <UpdateSvg />
          <Text className="text-sm text-black text-center text-md mt-4">{t('updateprofileMes')}</Text>
          <View className="flex-row mt-4">
            <Button className="bg-primary" onPress={onSubmit}>
              {t('updateprofileButton')}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default UpdateProfileModal;
