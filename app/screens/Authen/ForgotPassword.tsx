import {View, SafeAreaView} from 'react-native';
import {useForm} from 'react-hook-form';
import {useMutation} from '@tanstack/react-query';
import {generatePasswordCode} from 'app/api/userApi';
import ButtonGreen from 'app/components/button/ButtonGreen';
import EmailIcon from 'app/assets/svg/email.svg';
import {useTranslation} from 'react-i18next';
import ROUTER from 'app/navigation/router';
import Text from 'app/components/Text';
import Header from 'app/components/Header';
import TextInput from 'app/components/TextInput';
import ColorLayout from 'app/layout/ColorLayout';
import Alert from 'app/components/Alert';

const ForgotPassword = (props: any) => {
  const {t} = useTranslation();
  const muGeneratePasswordCode = useMutation({
    mutationKey: ['generatePasswordCode'],
    mutationFn: generatePasswordCode,
    onSuccess: (response: any, variables) => {
      if (response?.data.code === 200) {
        props.navigation.navigate(ROUTER.EMAIL_VERTIFICATION, variables);
      } else if (response?.data.code === 404) {
        Alert.alert(t('emailNotRegistered'));
      } else {
        Alert.alert(t('requestFailed'));
      }
    },
    onError: () => {},
  });
  const {control, handleSubmit, formState} = useForm();
  const {errors} = formState;
  const onSubmit = (value: any) => muGeneratePasswordCode.mutate(value);

  return (
    <ColorLayout className="bg-white h-full items-center p-2">
      <Header {...props} showHeaderTitle />
      <SafeAreaView className="h-full items-center">
        <View className="p-8">
          <Text className="text-textContainer pb-4">{t('forgotPassDescription')}</Text>
          <View className="mt-8">
            <TextInput
              label="Email Address*"
              name="Email"
              rules={{
                required: t('invalidUsername'),
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: t('invalidEmail'),
                },
              }}
              control={control}
              error={errors.Email}
              rightIcon={EmailIcon}
            />
            {errors.Email && <Text className="text-red-600 pt-0.5 text-[10px]">{errors.Email.message}</Text>}
          </View>
          <View className="pt-8">
            <ButtonGreen onPress={handleSubmit(onSubmit)}>{t('submit')}</ButtonGreen>
          </View>
        </View>
      </SafeAreaView>
    </ColorLayout>
  );
};
export default ForgotPassword;
