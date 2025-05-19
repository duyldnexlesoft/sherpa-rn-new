/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable import/no-unresolved */
import ButtonGreen from 'app/components/button/ButtonGreen';
import {useEffect, useRef, useState} from 'react';
import {KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, TouchableOpacity, View} from 'react-native';
import AddIcon from 'app/assets/svg/add.svg';
import VisaIcon from 'app/assets/svg/Visa.svg';
import MasterCardIcon from 'app/assets/svg/MasterCard.svg';
import ChinaUnionPayIcon from 'app/assets/svg/ChinaUnionPay.svg';
import AmericanExpressIcon from 'app/assets/svg/AmericanExpress.svg';
import JapanCreditBureauIcon from 'app/assets/svg/JapanCreditBureau.svg';
import TrashIcon from 'app/assets/svg/trash22.svg';
import DinersClubIcon from 'app/assets/svg/DinersClub.svg';
import DiscoverIcon from 'app/assets/svg/Discover.svg';
import {useMutation, useQuery} from '@tanstack/react-query';
import Header from 'app/components/Header';
import Text from 'app/components/Text';
import ColorLayout from 'app/layout/ColorLayout';
import {attachCard, deleteCard, getCards} from 'app/api/cardApi';
import {CardField, useStripe} from '@stripe/stripe-react-native';
import CardIcon from 'app/assets/svg/cardIcon.svg';
import {assign, cloneDeep, concat, isEmpty} from 'lodash';
import {SwipeListView} from 'react-native-swipe-list-view';
import Animated, {useAnimatedStyle, useSharedValue, withDelay, withTiming} from 'react-native-reanimated';
import {useTranslation} from 'react-i18next';
import Alert from 'app/components/Alert';
import Recaptcha from 'react-native-recaptcha-that-works';
import {CAPTCHA_SITE_KEY, WEBAPP_URL} from '@env';
import Svg from 'app/components/Svg';
const HEIGHT = 82;

const MyCard = (props: any) => {
  const {t} = useTranslation();
  const {createToken, createPaymentMethod} = useStripe();
  const [cardDetails, setCardDetails]: any = useState(null);
  const [cards, setCards]: any = useState(null);
  const [cardId, setCardId]: any = useState(null);
  const cardFieldRef: any = useRef(null);
  const recaptcha: any = useRef(null);

  const send = (id: any) => {
    setCardId(id);
    recaptcha.current.open();
  };
  const onVerify = (token: any) => {
    if (cardId) {
      muDeleteCard.mutate(cardId);
    } else {
      handleSubmitAddCard();
    }
  };

  const onExpire = () => {
    console.warn('expired!');
  };

  const handleSubmitAddCard = async () => {
    if (!cardDetails?.complete) {
      Alert.alert(t('myCardMessage'));
      return;
    }
    const {token, error}: any = await createToken({type: 'Card', ...cardDetails});
    if (error) {
      Alert.alert(error.message);
    } else {
      const {paymentMethod} = await createPaymentMethod({paymentMethodType: 'Card', paymentMethodData: {token: token.id}});
      if (paymentMethod) {
        muAttachCard.mutate({paymentMethodId: paymentMethod.id});
      }
    }
  };

  const {data, isLoading} = useQuery({queryKey: [getCards], queryFn: getCards});
  const muAttachCard = useMutation({
    mutationKey: ['attachCard'],
    mutationFn: attachCard,
    onSuccess: (response: any) => {
      if (response?.data?.code === 200) {
        setCards(concat(cards, assign(response?.data?.data, {height: HEIGHT, isNew: true})));
        cardFieldRef.current?.clear();
      } else {
        Alert.alert(response?.data?.message);
      }
    },
    onError: () => {},
  });

  const muDeleteCard = useMutation({
    mutationKey: ['deleteCard'],
    mutationFn: deleteCard,
    onSuccess: (response: any, variables) => {
      if (response?.data?.code === 200) {
        const newCards = cloneDeep(cards);
        newCards.find((card: any) => card.id === variables).height = 0;
        setCards(newCards);
      } else {
        Alert.alert(response?.data?.message);
      }
    },
    onError: () => {},
  });

  useEffect(() => {
    if (!isEmpty(data?.data?.data)) {
      setCards(data?.data?.data.map((item: any) => assign(item, {height: HEIGHT})));
    } else {
      setCards(null);
    }
  }, [data?.data?.data]);

  useEffect(() => {
    if (cards && cards.length === 0) {
      cardFieldRef.current?.focus();
    }
  }, [cards]);

  const handleAddCard = async () => {
    setCards([]);
    cardFieldRef.current?.focus();
  };

  return (
    <ColorLayout isLoading={muAttachCard.isPending || muDeleteCard.isPending} className="bg-white">
      <SafeAreaView className="bg-white h-full w-full">
        <Header {...props} showHeaderTitle />
        {!isLoading && !cards && (
          <View className="items-center justify-center pt-20 px-8">
            <CardIcon />
            <Text className="text-xl font-bold text-gray-500 mt-6">{t('emptyCards')}</Text>
            <Text className="text-base text-gray-500 mt-3 text-center">{t('emptyCardsDescrription')}</Text>
            <View className="mt-8">
              <ButtonGreen className="px-4" onPress={handleAddCard}>
                {t('addNewCard')}
              </ButtonGreen>
            </View>
          </View>
        )}
        {!isLoading && cards && (
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
            <ScrollView className="py-3 px-8">
              <SwipeListView
                scrollEnabled={false}
                data={cards}
                renderItem={({item}: any, _rowMap) => <CardItem item={item} />}
                renderHiddenItem={({item}: any, rowMap) => (
                  <View className="rounded-lg flex-1 mb-4">
                    <View className="absolute rounded-r-lg top-0 bottom-0 right-0 w-[100px] bg-red-500">
                      <TouchableOpacity className="ml-5 flex-1 items-center justify-center" onPress={() => send(item.id)}>
                        <Svg icon={TrashIcon} className={`text-white`} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                rightOpenValue={-75}
              />
              <View className="border border-border rounded-lg p-3 pl-2 flex-row items-center my-2 flex-row items-center justify-between">
                <View className="flex-1">
                  <CardField
                    ref={cardFieldRef}
                    postalCodeEnabled={false}
                    placeholders={{number: '4242 4242 4242 4242'}}
                    cardStyle={{backgroundColor: '#FFFFFF', textColor: '#000000'}}
                    style={{width: '100%', height: 40}}
                    onCardChange={card => setCardDetails(card)}
                  />
                </View>
                {cardDetails?.complete && (
                  <TouchableOpacity className="ml-4 h-8 w-8 bg-primary rounded-full items-center justify-center" onPress={() => send(null)}>
                    <Svg icon={AddIcon} className={`text-white`} width={16} height={16} />
                  </TouchableOpacity>
                )}
                {!cardDetails?.complete && (
                  <TouchableOpacity className="ml-4 h-8 w-8 bg-backgroundHover rounded-full items-center justify-center">
                    <Svg icon={AddIcon} className={`text-gray-400`} width={16} height={16} />
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
      <Recaptcha ref={recaptcha} siteKey={CAPTCHA_SITE_KEY} baseUrl={WEBAPP_URL} onVerify={onVerify} onExpire={onExpire} size="invisible" />
    </ColorLayout>
  );
};

const CardItem = ({item}: any) => {
  const heightValue = useSharedValue(HEIGHT);
  const heightTrans = useAnimatedStyle(() => ({height: heightValue.value}));

  useEffect(() => {
    if (item.isNew) {
      heightValue.value = 0;
      heightValue.value = withDelay(50, withTiming(item.height, {duration: 150}));
    } else {
      heightValue.value = withTiming(item.height, {duration: 150});
    }
  }, [item.height]);

  return (
    <Animated.View className="" style={[heightTrans]}>
      <View className="border border-border rounded-lg p-4 flex-row items-center bg-white mb-4">
        <Card name={item?.brand} width={40} height={40} />
        <View className="pl-4">
          <Text className="font-medium pb-0.5">{item?.brand}</Text>
          <Text className="font-medium">**** **** **** {item?.last4}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const Card = ({name}: any) => {
  if (name === 'JCB') {
    return <JapanCreditBureauIcon width={40} height={40} />;
  } else if (name === 'Visa') {
    return <VisaIcon width={40} height={40} />;
  } else if (name === 'MasterCard') {
    return <MasterCardIcon width={40} height={40} />;
  } else if (name === 'American Express') {
    return <AmericanExpressIcon width={40} height={40} />;
  } else if (name === 'Discover') {
    return <DiscoverIcon width={40} height={40} />;
  } else if (name === 'Diners Club') {
    return <DinersClubIcon width={40} height={40} />;
  } else if (name === 'UnionPay') {
    return <ChinaUnionPayIcon width={40} height={40} />;
  }
};
export default MyCard;
