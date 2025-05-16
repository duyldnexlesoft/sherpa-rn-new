/* eslint-disable import/no-unresolved */
import React, { useRef, useState } from 'react';
import { View, ScrollView, Pressable, TouchableOpacity } from 'react-native';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login } from 'app/api/userApi';
import { userAction } from 'app/store/actions';
import { useDispatch } from 'react-redux';
import TextInput from 'app/components/TextInput';
import ButtonGreen from 'app/components/button/ButtonGreen';
import LogoSvg from 'app/assets/svg/logo.svg';
// import EmailIcon from 'app/assets/svg/email.svg';
// import EyeIcon from 'app/assets/svg/eye.svg';
// import EyeOffIcon from 'app/assets/svg/eye-slash.svg';
import { useTranslation } from 'react-i18next';
import ROUTER from 'app/navigation/router';
import BasicLayout from 'app/layout/BasicLayout';
import Text from 'app/components/Text';
import Alert from 'app/components/Alert';

const SignIn = ({ navigation }: any) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const passwordInputRef: any = useRef(null);
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const muLogin = useMutation({
    mutationKey: ['login'],
    mutationFn: login,
    onSuccess: (response: any) => {
      queryClient.removeQueries();
      if (response?.data?.data?._id) {
        dispatch(userAction.setCurrentUser(response?.data?.data));
      } else {
        Alert.alert(response?.data?.message);
      }
    },
    onError: () => {},
  });
  // const muLogin = useMutationState('login', {
  //   mutationFn: login,
  //   onSuccess: (response: any) => {
  //     queryClient.removeQueries();
  //     if (response?.data?.data?._id) {
  //       dispatch(userAction.setCurrentUser(response?.data?.data));
  //     } else {
  //       Alert.alert(response?.data?.message);
  //     }
  //   },
  //   onError: () => {},
  // });
  const { control, handleSubmit, formState } = useForm({
    defaultValues: { Email: '', Password: '' },
  });
  const { errors } = formState;
  const onSubmit = (data: any) => muLogin.mutate(data);

  return (
    <BasicLayout isLoading={muLogin.isPending} className="bg-white">
      <ScrollView className="h-full">
        <View className="p-8">
          <View className="items-center">
            <LogoSvg />
          </View>
          <View className="mt-8 items-center">
            <Text className="items-center text-[24px]">{t('getStarted')}</Text>
          </View>
          <View className="mt-8">
            <TextInput
              label="Email Address*"
              name="Email"
              rules={{ required: true }}
              control={control}
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current.focus()}
              error={errors.Email}
              // rightIcon={EmailIcon}
            />
            {errors.Email && (
              <Text className="pt-0.5 text-[10px] text-red-600">{t('invalidUsername')}</Text>
            )}
          </View>
          <View className="mt-4">
            <TextInput
              comRef={passwordInputRef}
              label="Password*"
              name="Password"
              returnKeyType="done"
              onSubmitEditing={handleSubmit(onSubmit)}
              secureTextEntry={!showPassword}
              control={control}
              // rightIcon={showPassword ? EyeOffIcon : EyeIcon}
              rightAction={() => setShowPassword(!showPassword)}
            />
          </View>
          <TouchableOpacity
            className="mt-4 items-end text-gray-900"
            onPress={() => navigation.navigate(ROUTER.FORGOT_PASSWORD)}>
            <Text>{t('forgotPassword')}</Text>
          </TouchableOpacity>
          <View className="mt-8 items-center">
            <ButtonGreen onPress={handleSubmit(onSubmit)}>{t('login')}</ButtonGreen>
          </View>
          <View className="flex flex-row items-center justify-center">
            <Text className="text-gray-900">{t('donAccount')}</Text>
            <Pressable className="px-2 py-3" onPress={() => navigation.navigate(ROUTER.SIGN_UP)}>
              <Text className="color-primary font-semibold">{t('signUp')}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </BasicLayout>
  );
};
export default SignIn;
