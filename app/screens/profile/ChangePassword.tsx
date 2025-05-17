import ButtonGreen from 'app/components/button/ButtonGreen';
import TextInput from 'app/components/TextInput';
import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {SafeAreaView, ScrollView, View} from 'react-native';
import EyeIcon from 'app/assets/svg/eye.svg';
import EyeOffIcon from 'app/assets/svg/eye-slash.svg';
import {changePassword} from 'app/api/userApi';
import {useMutation} from '@tanstack/react-query';
import Header from 'app/components/Header';
import Text from 'app/components/Text';
import ColorLayout from 'app/layout/ColorLayout';
import Alert from 'app/components/Alert';
import ROUTER from 'app/navigation/router';

const ChangePassword = (props: any) => {
  const {t} = useTranslation();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const muChangePassword = useMutation({
    mutationKey: ['changePassword'],
    mutationFn: changePassword,
    onSuccess: (response: any) => {
      if (response?.data?.code === 200) {
        props.navigation.navigate(ROUTER.PROFILE);
        Alert.alert(response?.data?.message);
      } else {
        Alert.alert(response?.data?.message);
      }
    },
    onError: () => {},
  });
  const {control, handleSubmit} = useForm({defaultValues: {Email: '', Password: ''}});
  const onSubmit = (data: any) => muChangePassword.mutate(data);

  return (
    <ColorLayout isLoading={muChangePassword.isPending} className="bg-white">
      <SafeAreaView className="bg-white h-full w-full">
        <Header {...props} showHeaderTitle />
        <ScrollView>
          <View className="items-center justify-center p-8">
            <Text className="text-center">{t('changePasswordDescription')}</Text>
            <View className="mt-4 w-full">
              <TextInput
                label={t('oldPassword')}
                name="OldPassword"
                secureTextEntry={!showOldPassword}
                control={control}
                rightIcon={showOldPassword ? EyeOffIcon : EyeIcon}
                rightAction={() => setShowOldPassword(!showOldPassword)}
              />
            </View>
            <View className="mt-4 w-full">
              <TextInput
                label={t('newPassword')}
                name="NewPassword"
                secureTextEntry={!showNewPassword}
                control={control}
                rightIcon={showNewPassword ? EyeOffIcon : EyeIcon}
                rightAction={() => setShowNewPassword(!showNewPassword)}
              />
            </View>
            <View className="mt-4 w-full">
              <TextInput
                label={t('confirmNewPassword')}
                name="ConfirmPassword"
                secureTextEntry={!showPasswordConfirm}
                control={control}
                rightIcon={showPasswordConfirm ? EyeOffIcon : EyeIcon}
                rightAction={() => setShowPasswordConfirm(!showPasswordConfirm)}
              />
            </View>
            <View className="mt-8 w-full">
              <ButtonGreen onPress={handleSubmit(onSubmit)}>{t('Submit')}</ButtonGreen>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ColorLayout>
  );
};
export default ChangePassword;
