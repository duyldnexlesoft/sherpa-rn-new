/* eslint-disable react-hooks/exhaustive-deps */
import {useEffect, useState} from 'react';
import {SafeAreaView, Text, View, Pressable, TextInput, FlatList, Platform, TouchableOpacity, KeyboardAvoidingView, Alert} from 'react-native';
import ArrowLeftSvg from 'app/assets/svg/arrow-left.svg';
import StapleSvg from 'app/assets/svg/staple.svg';
import SubtractSvg from 'app/assets/svg/subtract.svg';
import CopySvg from 'app/assets/svg/copy.svg';
import Avatar from 'app/components/Avatar';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {createMessage, getMessages} from 'app/api/messagesApi';
import {cloneDeep, concat, first, isEmpty, isNull, last, omitBy, size} from 'lodash';
import {userSelector, bookingSelector} from 'app/store/selectors';
import {useSelector} from 'react-redux';
import moment from 'moment';
import {LIMIT_MESSAGE} from 'app/utils/constants';
import AnimatedLoading from 'app/components/Animated/AnimatedLoading';
import ImageModal from 'app/components/Modal/ImageModal';
import {launchImageLibrary} from 'react-native-image-picker';
import colors from 'app/utils/colors';
import LabelStatus from 'app/components/LabelStatus';
import {Snackbar} from 'react-native-paper';
import Clipboard from '@react-native-clipboard/clipboard';
import {useTranslation} from 'react-i18next';
import ColorLayout from 'app/layout/ColorLayout';
import Image from 'app/components/Image';
import {getImageSize} from 'app/utils/helpler';
import Svg from 'app/components/Svg';
const width = 275;
const gap = 5;

const Messages = ({navigation, route}: any) => {
  const {t} = useTranslation();
  const {currentUser} = useSelector(userSelector);
  const {booking} = useSelector(bookingSelector);
  const queryClient = useQueryClient();
  const verifiedUser = booking.VerifiedUser;
  const VerifiedUserId = verifiedUser._id;
  const UserOrderId = booking._id;
  const UserId = currentUser._id;
  const [messages, setMessages]: any = useState([]);
  const [totalEntities, setTotalEntities] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageOfModal, setImageOfModal] = useState(null);
  const [paramsMessage, setParamsMessage]: any = useState({toDate: moment().toISOString(), limit: LIMIT_MESSAGE});
  const [scrollParamsMessage, setScrollParamsMessage]: any = useState(null);
  const [visibleSnackbar, setVisibleSnackbar] = useState(false);
  const [ConversationId, setConversationId]: any = useState(route.params?.ConversationId);
  const [top, setTop]: any = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [sendText, setSendText]: any = useState('');

  const handleGetMessagesSuccess = (data: any, isTop: boolean) => {
    if (!isEmpty(data?.data?.data?.edges)) {
      setMessages(isTop ? concat(data?.data?.data?.edges || [], messages) : concat(messages, data?.data?.data?.edges || []));
      setTotalEntities(data?.data?.data?.pageInfo?.[0]?.count || 0);
      const newBooking = cloneDeep(booking);
      newBooking.Messages = [];
      queryClient.invalidateQueries({queryKey: ['getUserOrders']});
    }
  };

  const handleGetMessages = (params: any) => {
    if (params) {
      const newParam = ConversationId ? {ConversationId} : {UserId, VerifiedUserId, UserOrderId};
      return getMessages(omitBy({...newParam, ...params}, isNull));
    }
    return null;
  };

  const {data: dataMessage} = useQuery({
    queryKey: ['getMessages', UserId, VerifiedUserId, UserOrderId, paramsMessage],
    queryFn: () => handleGetMessages(paramsMessage),
    staleTime: Infinity,
  });

  const {isLoading} = useQuery({
    queryKey: ['getMessagesScroll', scrollParamsMessage],
    queryFn: () => handleGetMessages(scrollParamsMessage),
  });

  const mutCreateMessage = useMutation({
    mutationKey: ['createMessage'],
    mutationFn: createMessage,
    onSuccess: (_data: any) => {
      handleSetParamsMessage();
    },
  });

  const handleSendMessage = (FileIds?: string[]) => {
    if (!isEmpty(sendText) || FileIds) {
      mutCreateMessage.mutate({Text: sendText, ConversationId, UserOrderId, FileIds});
      setSendText('');
    }
  };

  useEffect(() => {
    const interval = setInterval(() => setSeconds(s => s + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    handleGetMessagesSuccess(dataMessage, true);
  }, [dataMessage?.data?.data]);

  useEffect(() => {
    if (seconds) {
      handleSetParamsMessage();
    }
  }, [seconds]);

  useEffect(() => {
    if (!isEmpty(messages) && messages?.[0]?.ConversationId !== ConversationId) {
      setConversationId(messages?.[0]?.ConversationId);
    }
  }, [messages]);

  const handleSetParamsMessage = () => {
    const payload: any = {toDate: moment().toISOString()};
    if (!isEmpty(messages)) {
      const firstMess: any = first(messages);
      payload.formDate = moment(firstMess.createdAt).add(1, 'milliseconds').toISOString();
      payload.limit = null;
    } else {
      payload.formDate = null;
      payload.limit = LIMIT_MESSAGE;
    }
    setParamsMessage(payload);
  };

  const coverMessages = (listMess: any = []) => {
    const newMessages = [];
    for (let i = 0; i < listMess.length; i++) {
      const message = listMess[i];
      const messageNext = listMess[i + 1];
      newMessages.push(message);
      if (!messageNext || moment(message.createdAt).diff(moment(messageNext.createdAt), 'minutes') > 30) {
        newMessages.push({createdAt: message.createdAt});
      }
    }
    return newMessages;
  };

  const getFullName = (u: any) => `${u?.FirstName || ''} ${u?.LastName || ''}`.trim() || u?.Email;

  const handleOnScroll = (event: any) => {
    const {contentSize, contentOffset, layoutMeasurement} = event.nativeEvent;
    const checkScroll = contentOffset.y > 0 && layoutMeasurement.height / (contentSize.height - contentOffset.y) > 0.7;
    if (checkScroll && !isLoading && totalEntities > size(messages)) {
      const lastMess: any = last(messages);
      const payload: any = {toDate: moment(lastMess.createdAt).toISOString(), limit: LIMIT_MESSAGE};
      setScrollParamsMessage(payload);
    }
  };

  const handleChoosePhoto = () => {
    const options: any = {selectionLimit: 10, noData: true};
    launchImageLibrary(options, response => {
      if (response?.assets) {
        const size25mb = 1024 * 1024 * 25;
        const checkfileSize: any = response?.assets.find((item: any) => item.fileSize > size25mb);
        if (!checkfileSize) {
          const formData = new FormData();
          response?.assets.forEach((file: any) => {
            file.uri = Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri;
            file.name = file.fileName;
            formData.append('files[]', file);
          });
          const payload: any = omitBy({Text: sendText, ConversationId, UserOrderId}, elm => !elm);
          Object.keys(payload).forEach(key => {
            formData.append(key, payload[key]);
          });
          mutCreateMessage.mutate(formData);
        } else {
          Alert.alert(t('updoad25Mb'));
        }
      }
    });
  };

  const copyToClipboard = (value: string) => {
    Clipboard.setString(`${value}`);
    setVisibleSnackbar(true);
  };

  return (
    <ColorLayout className="bg-white h-full w-full px-4 flex-1 top-0">
      <SafeAreaView onLayout={event => setTop(event.nativeEvent.layout.height)} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <SafeAreaView className="h-full flex-1 justify-center justify-around pb-4">
          <View className="flex-row items-center pb-2 border-b border-border pt-1">
            <Pressable className="w-9 h-9 items-center justify-center" onPress={() => navigation.goBack()}>
              <Svg icon={ArrowLeftSvg} className="text-primary" width={14} height={20} />
            </Pressable>
            <Avatar item={verifiedUser} className="w-[40px] h-[40px] ml-2" />
            <Text className="text-base font-medium text-black pl-3">{getFullName(verifiedUser)}</Text>
          </View>
          <FlatList
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            onScroll={handleOnScroll}
            inverted
            data={[...coverMessages(messages), {booking}, {isLoading}]}
            renderItem={({item: message}: any) => {
              const isUser = message.UserId === currentUser._id;
              return (
                <View>
                  {message.isLoading && (
                    <View className="w-full items-center">
                      <AnimatedLoading className="bg-primary" />
                    </View>
                  )}
                  {message.booking && (
                    <View className="w-full bg-lightSecondary rounded-md p-2.5 pt-1.5 gap-y-2 mt-2">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-textContainer font-medium">{t('bookingNumber')}</Text>
                        <View className="flex-row items-center">
                          <Text className="text-textContainer font-medium pr-2">{booking.OrderCode}</Text>
                          <TouchableOpacity onPress={() => copyToClipboard(booking.OrderCode)}>
                            <Svg icon={CopySvg} />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-textContainer">{t('requestTime')}</Text>
                        <Text className="text-textContainer">{moment(booking.createdAt).format('dddd, MMM DD, h:mmA')}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-textContainer">{t('total')}</Text>
                        <Text className="text-textContainer">${(booking.TotalAmount / 100).toFixed(2)}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-textContainer">{t('status')}</Text>
                        <LabelStatus booking={booking} />
                      </View>
                    </View>
                  )}
                  {!message._id && message.createdAt && <MessageDay key={message._id} message={message} />}
                  {message._id && isUser && <MessageItem isUser={false} key={message._id} {...{message, setModalVisible, setImageOfModal}} />}
                  {message._id && !isUser && <MessageItem isUser={true} key={message._id} {...{message, setModalVisible, setImageOfModal}} />}
                </View>
              );
            }}
            keyExtractor={(item, index) => `mess-key-${index + 1}`}
          />
          <View className="w-full h-12 flex-row items-center">
            <Pressable className="h-full w-[40] justify-center items-center" onPress={handleChoosePhoto}>
              <Svg icon={StapleSvg} />
            </Pressable>
            <View className="w-full flex-row h-[42px] flex-1 bg-lightGray rounded-[10px] justify-between items-center">
              <TextInput
                className="w-full h-full flex-1 pl-4 text-black"
                defaultValue={sendText}
                placeholder="Type a message..."
                placeholderTextColor={colors.gray500}
                onChangeText={value => setSendText(value)}
              />
              <Pressable className="h-full w-[40] justify-center items-center" onPress={() => handleSendMessage()}>
                <Svg icon={SubtractSvg} className="text-secondary" />
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
      {Platform.OS === 'ios' && (
        <Snackbar className="mb-24 bg-[#FFFFFF0]" visible={visibleSnackbar} duration={1500} onDismiss={() => setVisibleSnackbar(false)}>
          <View className="items-center">
            <View className="rounded-full bg-gray-900 w-52 p-2.5">
              <Text className="text-center text-white">{t('copiedbookingNumber')}</Text>
            </View>
          </View>
        </Snackbar>
      )}
      {imageOfModal && modalVisible && <ImageModal {...{modal: modalVisible, setModal: setModalVisible, image: imageOfModal, top}} />}
    </ColorLayout>
  );
};

const MessageItem = ({message, isUser, setModalVisible, setImageOfModal}: any) => {
  const length = size(message?.Files);
  const boxCss = isUser ? ' items-start' : ' items-end';
  const bgCss = isUser ? ' bg-backgroundHover' : ' bg-lightSecondary';
  const paddingCss = length > 1 ? ' p-[5px] pb-0' : '';
  const paddingImageCss = length > 1 ? ' pb-[5px]' : '';
  const roundedCss = isUser ? ' rounded-b-3xl rounded-tr-3xl' : ' rounded-t-3xl rounded-bl-3xl';
  const sizeImage = length === 1 ? width : length === 2 ? (width - 15) / 2 : (width - 20) / 3;
  return (
    <View className={'mb-2.5' + boxCss}>
      {length > 0 && (
        <View className={'rounded-[10px]' + paddingCss + bgCss} style={{width}}>
          <FlatList
            data={message?.Files}
            numColumns={length < 3 ? length : 3}
            contentContainerStyle={{gap}}
            columnWrapperStyle={length > 1 ? {gap} : null}
            renderItem={({item}) => (
              <View className={paddingImageCss}>
                <DetailImage uri={item} size={sizeImage} {...{setModalVisible, setImageOfModal}} />
              </View>
            )}
          />
        </View>
      )}
      {length === 0 && (
        <View className={'p-4' + bgCss + roundedCss} style={{maxWidth: width}}>
          <Text className="text-sm text-black break-words">{message.Text}</Text>
        </View>
      )}
    </View>
  );
};

const DetailImage = (props: any) => {
  const {uri, size, setModalVisible, setImageOfModal} = props;
  const [image, setImage] = useState({});
  const {data} = useQuery({
    queryKey: ['getImageSize', uri],
    queryFn: () => getImageSize(uri),
    staleTime: Infinity,
  });
  useEffect(() => {
    if (data) setImage({uri, ...data});
  }, [data]);

  const handelViewImage = () => {
    if (!isEmpty(image)) {
      setImageOfModal(image);
      setModalVisible(true);
    }
  };
  return (
    <View className="overflow-hidden rounded-[10px]">
      <Pressable onPress={handelViewImage}>
        <Image uri={uri} style={{width: size, height: size}} />
      </Pressable>
    </View>
  );
};

const MessageDay = ({message}: any) => {
  const formatDateMessage = (date: any) => {
    if (!moment().startOf('days').diff(moment(date).startOf('days'), 'minutes')) {
      return moment(date).format('hh:mm A');
    } else if (!moment().startOf('week').diff(moment(date).startOf('week'), 'minutes')) {
      return moment(date).format('ddd, MMM DD, hh:mm A');
    } else {
      return moment(date).format('MMM DD, YYYY, hh:mm A');
    }
  };
  return (
    <View className="flex items-center mb-2.5">
      <Text className="p-2.5 font-medium text-xs text-gray-500">{formatDateMessage(message.created)}</Text>
    </View>
  );
};
export default Messages;
