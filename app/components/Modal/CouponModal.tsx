import {useState} from 'react';
import {SafeAreaView, TouchableOpacity, View} from 'react-native';
import TextInput from '../TextInput';
import Text from '../Text';
import {useTranslation} from 'react-i18next';
import Modal from './Modal';
import ClearIcon from 'app/assets/svg/clear.svg';
import {useMutation} from '@tanstack/react-query';
import {checkPromoCode} from 'app/api/userOrderApi';

const CouponModal = (props: any) => {
  const {t} = useTranslation();
  const [code, setCode]: any = useState('');
  const [error, setError]: any = useState(false);
  const muCheckPromoCode = useMutation({mutationKey: ['createPaymentIntent'], mutationFn: checkPromoCode, onError: () => {}});
  const handleOnChange = (event: any) => {
    if (event?.nativeEvent?.text === undefined) return;
    setCode(event.nativeEvent.text);
    setError(false);
  };
  const handleSubmit = () => {
    muCheckPromoCode.mutate(
      {promoCode: code},
      {
        onSuccess: ({data}) => {
          if (data?.data) {
            props.onSubmit(data?.data);
            props.setModal(false);
          } else {
            setError(true);
          }
        },
      },
    );
  };

  return (
    <Modal animationType="slide" {...props} className="items-center justify-end">
      <SafeAreaView className="absolute bottom-4 w-full z-10">
        <View className="px-4">
          <View className="bg-white flex-1 rounded-[10px] overflow-hidden p-4 flex-col items-center">
            <View className="w-16 h-2 bg-[#F9F5F5] rounded-full mb-2" />
            <Text className="text-center text-lg font-medium text-textContainer mb-6">{t('Coupon Codes')}</Text>
            <View>
              <TextInput
                label="Coupon Codes"
                value={code}
                onChange={handleOnChange}
                rightIcon={code && ClearIcon}
                rightAction={code ? () => setCode('') : null}
                error={error}
              />
              {error && <Text className="text-red-600 pt-0.5 text-[10px]">{t('Invalid promo code')}</Text>}
            </View>
            <View className="mt-4 w-full">
              <TouchableOpacity
                onPress={handleSubmit}
                className={`${code ? 'bg-secondary' : 'bg-border'} w-full flex-row items-center justify-center rounded-md h-12`}
                disabled={!code}>
                <Text className={`${code ? 'text-white' : 'text-textContainer'}  font-medium`}>APPLY</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default CouponModal;
