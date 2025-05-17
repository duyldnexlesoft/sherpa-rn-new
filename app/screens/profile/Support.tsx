import {SafeAreaView, View} from 'react-native';
import {useMutation} from '@tanstack/react-query';
import Header from 'app/components/Header';
import ColorLayout from 'app/layout/ColorLayout';
import {useTranslation} from 'react-i18next';
import {useForm} from 'react-hook-form';
import TextInput from 'app/components/TextInput';
import SupportIcon from 'app/assets/svg/support-boy.svg';
import Text from 'app/components/Text';
import ButtonGreen from 'app/components/button/ButtonGreen';
import {userSelector} from 'app/store/selectors';
import {useSelector} from 'react-redux';
import {sendMailToSupport} from 'app/api/supportApi';
import ROUTER from 'app/navigation/router';
import Alert from 'app/components/Alert';

const Support = (props: any) => {
  const {t} = useTranslation();
  const {currentUser} = useSelector(userSelector);

  const muSendMailToSupport = useMutation({
    mutationKey: ['sendMailToSupport'],
    mutationFn: sendMailToSupport,
    onSuccess: (response: any) => {
      if (response?.data?.code === 201) {
        Alert.alert(t('sendSupportSuccess'));
        props.navigation.navigate(ROUTER.PROFILE);
      } else {
        Alert.alert(t('supportError'));
      }
    },
    onError: () => Alert.alert(t('supportError')),
  });

  const {control, handleSubmit, formState} = useForm();
  const {errors} = formState;

  const onSubmit = ({Message}: any) => {
    const GivenByUserId = currentUser._id;
    muSendMailToSupport.mutate({GivenByUserId, Message});
  };

  return (
    <ColorLayout isLoading={muSendMailToSupport.isPending} className="bg-white">
      <SafeAreaView className="bg-white h-full w-full">
        <Header {...props} showHeaderTitle />
        <View className="p-8">
          <View className="items-center">
            <SupportIcon />
            <Text className="text-textContainer font-medium pt-4 text-center">{t('supportDescription')}</Text>
          </View>
          <View className="mt-4 w-full">
            <TextInput
              label={t('message')}
              name="Message"
              rules={{required: true}}
              control={control}
              error={errors.Message}
              multiline={true}
              numberOfLines={10}
              height={150}
            />
          </View>
          <View className="items-center mt-8">
            <ButtonGreen onPress={handleSubmit(onSubmit)}>{t('send')}</ButtonGreen>
          </View>
        </View>
      </SafeAreaView>
    </ColorLayout>
  );
};
export default Support;
