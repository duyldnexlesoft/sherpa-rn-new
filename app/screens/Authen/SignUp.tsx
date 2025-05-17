/* eslint-disable import/no-unresolved */
import {useRef, useState} from 'react';
import {View, ScrollView, Pressable} from 'react-native';
import {useForm} from 'react-hook-form';
import {useMutation} from '@tanstack/react-query';
import {signup} from 'app/api/userApi';
import TextInput from 'app/components/TextInput';
import ButtonGreen from 'app/components/button/ButtonGreen';
import LogoSvg from 'app/assets/svg/logo.svg';
import EmailIcon from 'app/assets/svg/email.svg';
import EyeIcon from 'app/assets/svg/eye.svg';
import EyeOffIcon from 'app/assets/svg/eye-slash.svg';
import {useTranslation} from 'react-i18next';
import ROUTER from 'app/navigation/router';
import BasicLayout from 'app/layout/BasicLayout';
import ToughClick from 'app/components/ToughClick';
import Text from 'app/components/Text';
import SignupSuccessModal from 'app/components/Modal/SignupSuccessModal';
import Alert from 'app/components/Alert';
import Recaptcha from 'react-native-recaptcha-that-works';
import {verifyPassword} from 'app/utils/helpler';
import {CAPTCHA_SITE_KEY, WEBAPP_URL} from '@env';

const SignUp = ({navigation}: any) => {
  const {t} = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [signupSuccessModal, setSignupSuccessModal] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [argee, setAgree]: any = useState(false);
  const [userCreate, setUserCreate]: any = useState(false);
  const recaptcha: any = useRef(null);

  const onVerify = (token: any) => muSignup.mutate({...getValues(), SiteToken: token});

  const onExpire = () => {
    console.warn('expired!');
  };

  const muSignup = useMutation({
    mutationKey: ['signup'],
    mutationFn: signup,
    onSuccess: (response: any) => {
      if (response?.data?.data?._id) {
        setUserCreate(response?.data?.data);
        setSignupSuccessModal(true);
      } else {
        Alert.alert(response?.data?.message);
      }
    },
    onError: () => {},
  });

  const {
    control,
    handleSubmit,
    getValues,
    formState: {errors},
  } = useForm();

  const onSubmit = () => recaptcha.current.open();

  return (
    <BasicLayout isLoading={muSignup.isPending} className="bg-white">
      <ScrollView className="h-full">
        <View className="p-8">
          <View className="items-center">
            <LogoSvg />
          </View>
          <View className="mt-8 items-center">
            <Text className="items-center text-[24px]">{t('createAccount')}</Text>
          </View>
          <View className="mt-4">
            <TextInput label="Email Address*" name="Email" rules={{required: true}} control={control} error={errors.Email} rightIcon={EmailIcon} />
            {errors.Email && <Text className="pt-0.5 text-[10px] text-red-600">{t('required')}</Text>}
          </View>
          <View className="mt-4">
            <TextInput
              label="Password*"
              name="Password"
              rules={{
                required: t('passwordRequired'),
                minLength: {value: 8, message: t('min8Char')},
                validate: (value: any) => verifyPassword(value, t),
              }}
              error={errors.Password}
              secureTextEntry={!showPassword}
              control={control}
              rightIcon={showPassword ? EyeOffIcon : EyeIcon}
              rightAction={() => setShowPassword(!showPassword)}
            />
            {errors.Password && <Text className="pt-0.5 text-[10px] text-orange-600">{errors.Password.message}</Text>}
          </View>
          <View className="mt-4">
            <TextInput
              label="Confirm Password*"
              name="ConfirmPassword"
              rules={{
                required: t('confirmPasswordRequired'),
                validate: (value: any) => value === getValues('Password') || t('passwordsDontMatch'),
              }}
              error={errors.ConfirmPassword}
              secureTextEntry={!showPasswordConfirm}
              control={control}
              rightIcon={showPasswordConfirm ? EyeOffIcon : EyeIcon}
              rightAction={() => setShowPasswordConfirm(!showPasswordConfirm)}
            />
            {errors.ConfirmPassword && <Text className="pt-0.5 text-[10px] text-orange-600">{errors.ConfirmPassword.message}</Text>}
          </View>
          <View className="mt-4 flex flex-row items-center justify-center">
            <ToughClick {...{argee, setAgree, data: userCreate}} />
          </View>
          <View className="mt-8 items-center">
            <ButtonGreen onPress={handleSubmit(onSubmit)} disabled={!argee}>
              {t('signUp')}
            </ButtonGreen>
          </View>
          <View className="flex flex-row items-center justify-center">
            <Text>{t('alreadyAccount')}</Text>
            <Pressable className="px-2 py-3" onPress={() => navigation.navigate(ROUTER.SIGN_IN)}>
              <Text className="font-semibold color-primary" onPress={() => navigation.navigate(ROUTER.SIGN_IN)}>
                {t('login')}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
      <Recaptcha ref={recaptcha} siteKey={CAPTCHA_SITE_KEY} baseUrl={WEBAPP_URL} onVerify={onVerify} onExpire={onExpire} size="invisible" />
      <SignupSuccessModal {...{modal: signupSuccessModal, setModal: setSignupSuccessModal, navigation, userCreate}} />
    </BasicLayout>
  );
};
export default SignUp;
