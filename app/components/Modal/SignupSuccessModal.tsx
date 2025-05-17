import {Pressable, View} from 'react-native';
import Text from '../Text';
import SignupSuccessSvg from 'app/assets/svg/signup-success.svg';
import ButtonGreen from '../button/ButtonGreen';
import ROUTER from 'app/navigation/router';
import {useTranslation} from 'react-i18next';
import {useMutation} from '@tanstack/react-query';
import {resendVerifyAccountLink} from 'app/api/userApi';
import Modal from './Modal';
import Alert from '../Alert';
import { remapProps } from 'nativewind';

const SignupSuccessModal = (props: any) => {
  const {navigation, userCreate} = props;
  const {t} = useTranslation();
  const muResendVerifyAccountLink = useMutation({
    mutationKey: ['resendVerifyAccountLink'],
    mutationFn: resendVerifyAccountLink,
    onSuccess: (response: any) => {
      Alert.alert(response?.data?.message);
    },
    onError: () => {},
  });

  return (
    <Modal animationType="fade" {...props} className="items-center justify-center">
      <View className="w-full p-8">
        <View className="w-full bg-white rounded-[10px] items-center">
          <View className="p-8 items-center">
            <SignupSuccessSvg />
            <Text className="text-base text-black font-bold mb-2 mt-4">{t('SignupSuccessModalTitle')}</Text>
            <Text className="text-sm text-black text-center mb-2">
              {t('SignupSuccessModalDescription1')} <Text className="text-primary font-medium">{userCreate.Email}</Text>
            </Text>
            <Text className="text-sm text-black text-center mb-2">{t('SignupSuccessModalDescription2')}</Text>
            <Text className="text-xs text-gray-500 text-center">{t('SignupSuccessModalDescription3')}</Text>
            <View className="mt-6 mb-4">
              <ButtonGreen className="px-8" onPress={() => muResendVerifyAccountLink.mutate(userCreate.Email)}>
                {t('resendEmail')}
              </ButtonGreen>
            </View>
            <View className="flex-row items-center">
              <Text className="text-base text-gray-500">{t('SignupSuccessModalDescription4')}</Text>
              <Pressable onPress={() => navigation.navigate(ROUTER.SIGN_IN)}>
                <Text className="text-base text-primary pl-1">{t('login')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

remapProps(SignupSuccessModal, {className: 'style'});
export default SignupSuccessModal;
