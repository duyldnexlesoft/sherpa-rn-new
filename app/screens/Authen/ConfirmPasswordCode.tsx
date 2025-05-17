import {useEffect, useRef, useState} from 'react';
import {View, Pressable, SafeAreaView, Keyboard, TextInput, TouchableOpacity} from 'react-native';
import {useMutation} from '@tanstack/react-query';
import {checkPasswordCode, generatePasswordCode} from 'app/api/userApi';
import {useTranslation} from 'react-i18next';
import ROUTER from 'app/navigation/router';
import Text from 'app/components/Text';
import Header from 'app/components/Header';
import {fill, size} from 'lodash';
import ColorLayout from 'app/layout/ColorLayout';
import Alert from 'app/components/Alert';

const ConfirmPasswordCode = (props: any) => {
  const {t} = useTranslation();
  const Email = props?.route?.params?.Email;
  const inputRef: any = useRef(null);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [arrayPasscode, setArrayPasscode]: any = useState(fill(Array(6), null));

  useEffect(() => {
    if (!Email) props.navigation.navigate(ROUTER.SIGN_IN);
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    const interval = setInterval(() => setSecondsLeft(s => s - 1), 1000);
    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
      clearInterval(interval);
    };
  }, []);

  const muGeneratePasswordCode = useMutation({
    mutationKey: ['generatePasswordCode'],
    mutationFn: generatePasswordCode,
    onSuccess: (response: any) => {
      if (response?.data.code === 200) {
        setSecondsLeft(60);
      } else if (response?.data.code === 404) {
        Alert.alert(t('emailNotRegistered'));
        setPasscode('');
        setArrayPasscode(fill(Array(6), null));
      } else {
        Alert.alert(t('requestFailed'));
        setPasscode('');
        setArrayPasscode(fill(Array(6), null));
      }
    },
    onError: () => {},
  });

  const mucheckPasswordCode = useMutation({
    mutationKey: ['checkPasswordCode'],
    mutationFn: checkPasswordCode,
    onSuccess: (response: any) => {
      if (response?.data.code === 200) {
        props.navigation.navigate(ROUTER.RESET_PASSWORD, {token: response?.data?.data});
      } else if (response?.data.code === 406) {
        Alert.alert(t('passwordCodeNotInCorrect'));
        setPasscode('');
        setArrayPasscode(fill(Array(6), null));
      } else {
        Alert.alert(t('requestFailed'));
        setPasscode('');
        setArrayPasscode(fill(Array(6), null));
      }
    },
    onError: () => {},
  });

  return (
    <ColorLayout className="bg-white">
      <Header {...props} showHeaderTitle />
      <SafeAreaView className="h-full items-center">
        <View className="py-8 px-2 flex-col items-center">
          <Text className="text-black mb-8 text-center">
            {t('confirmPassNote1')} <Text className="text-black font-medium">{Email}</Text>
          </Text>
          <Pressable
            className="flex-row mb-8 items-center"
            onPress={() => {
              if (inputRef.current && !isKeyboardVisible) {
                inputRef.current.blur();
                inputRef.current.focus();
              }
            }}>
            {arrayPasscode.map((elm: any, index: any) => (
              <>
                <View className="w-[40px] h-[50px] rounded-[10px] bg-backgroundHover items-center justify-center mx-1.5" key={`key-${index + 1}`}>
                  {elm !== null && <Text className="text-black font-medium text-4xl">{elm}</Text>}
                </View>
                {index === 2 && <View key={`key-l-${index + 1}`} className="w-[8px] h-[3.5px] bg-black mx-1"></View>}
              </>
            ))}
          </Pressable>
          {secondsLeft < 1 && (
            <TouchableOpacity onPress={() => !muGeneratePasswordCode.isPending && muGeneratePasswordCode.mutate({Email})}>
              <Text className="text-secondary font-medium">{t('confirmPassNote2')} </Text>
            </TouchableOpacity>
          )}
          {secondsLeft > 0 && <Text>{t('confirmPassNote2')} </Text>}
          {secondsLeft > 0 && (
            <TouchableOpacity>
              <Text className="text-Secondary font-medium mt-1">
                {t('confirmPassNote2')} {secondsLeft}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
      <TextInput
        onLayout={() => inputRef?.current?.focus()}
        ref={inputRef}
        value={passcode}
        keyboardType="numeric"
        className="w-full h-12 bg-white"
        onChangeText={value => {
          if (mucheckPasswordCode.isPending) {
            return;
          } else if (size(value) <= 6) {
            const splitValue = value.split('');
            const newArray = fill(Array(6), null).map((elm, index) => splitValue[index] || elm);
            setArrayPasscode(newArray);
            setPasscode(value);
            if (size(value) === 6) {
              mucheckPasswordCode.mutate({Email, PasswordCode: value});
            }
          }
        }}
      />
    </ColorLayout>
  );
};
export default ConfirmPasswordCode;
