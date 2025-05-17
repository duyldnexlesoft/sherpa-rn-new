import React, { useEffect, useState } from 'react';
import { View, SafeAreaView } from 'react-native';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { resetPassword } from 'app/api/userApi';
import ButtonGreen from 'app/components/button/ButtonGreen';
import EyeIcon from 'app/assets/svg/eye.svg';
import EyeOffIcon from 'app/assets/svg/eye-slash.svg';
import { useTranslation } from 'react-i18next';
import ROUTER from 'app/navigation/router';
import Text from 'app/components/Text';
import Header from 'app/components/Header';
import TextInput from 'app/components/TextInput';
import ColorLayout from 'app/layout/ColorLayout';
import { verifyPassword } from 'app/utils/helpler';
import Alert from 'app/components/Alert';

const ResetPassword = (props: any) => {
  const { t } = useTranslation();
  const token = props?.route?.params?.token;
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  useEffect(() => {
    if (!token) props.navigation.navigate(ROUTER.SIGN_IN);
  });

  const muResetPassword = useMutation({
    mutationKey: ['resetPassword'],
    mutationFn: resetPassword,
    onSuccess: (response: any) => {
      if (response?.data.code === 200) {
        props.navigation.navigate(ROUTER.SIGN_IN);
      }
      Alert.alert(response?.data?.message);
    },
    onError: () => {},
  });
  const { control, handleSubmit, getValues, formState } = useForm();
  const { errors } = formState;
  const onSubmit = (value: any) => muResetPassword.mutate({ token, ...value });

  return (
    <ColorLayout className="bg-white">
      <Header
        {...props}
        showHeaderTitle
        leftAction={() => props.navigation.navigate(ROUTER.FORGOT_PASSWORD)}
      />
      <SafeAreaView className="h-full items-center">
        <View className="p-8">
          <Text className="pb-4 text-textContainer">{t('resetPassDescription')}</Text>
          <View className="mt-4">
            <TextInput
              label="Password*"
              name="NewPassword"
              rules={{
                required: t('passwordRequired'),
                minLength: { value: 8, message: t('min8Char') },
                validate: (value: any) => verifyPassword(value, t),
              }}
              error={errors.NewPassword}
              secureTextEntry={!showPassword}
              control={control}
              rightIcon={showPassword ? EyeOffIcon : EyeIcon}
              rightAction={() => setShowPassword(!showPassword)}
            />
            {errors.NewPassword && (
              <Text className="pt-0.5 text-[10px] text-red-600">{errors.NewPassword.message}</Text>
            )}
          </View>
          <View className="mt-4">
            <TextInput
              label="Confirm Password*"
              name="ConfirmPassword"
              rules={{
                required: t('confirmPasswordRequired'),
                validate: (value: any) =>
                  value === getValues('NewPassword') || t('passwordsDontMatch'),
              }}
              error={errors.ConfirmPassword}
              secureTextEntry={!showPasswordConfirm}
              control={control}
              rightIcon={showPasswordConfirm ? EyeOffIcon : EyeIcon}
              rightAction={() => setShowPasswordConfirm(!showPasswordConfirm)}
            />
            {errors.ConfirmPassword && (
              <Text className="pt-0.5 text-[10px] text-red-600">
                {errors.ConfirmPassword.message}
              </Text>
            )}
          </View>
          <View className="pt-8">
            <ButtonGreen onPress={handleSubmit(onSubmit)}>{t('submit')}</ButtonGreen>
          </View>
        </View>
      </SafeAreaView>
    </ColorLayout>
  );
};
export default ResetPassword;
