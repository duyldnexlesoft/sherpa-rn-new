/* eslint-disable react-hooks/exhaustive-deps */
import {useEffect, useState} from 'react';
import {View, Pressable, Dimensions} from 'react-native';
import Add18Icon from 'app/assets/svg/add18.svg';
import Header from 'app/components/Header';
import {launchImageLibrary} from 'react-native-image-picker';
import {uploadImage} from 'app/api/userApi';
import {createFormData} from 'app/utils/helpler';
import {useMutation} from '@tanstack/react-query';
import {useDispatch, useSelector} from 'react-redux';
import {userSelector} from 'app/store/selectors';
import {bookingAction, userAction} from 'app/store/actions';
import BoxImage from './BoxImage';
import {cloneDeep, difference, isEmpty, map, max, size} from 'lodash';
import ColorLayout from 'app/layout/ColorLayout';
import {useTranslation} from 'react-i18next';
import Alert from 'app/components/Alert';
import Text from 'app/components/Text';
import ButtonBlue from 'app/components/button/ButtonBlue';
import ROUTER from 'app/navigation/router';
import {create} from 'twrnc';
import tailwindConfig from 'tailwind.config';
const dimensions = Dimensions.get('screen');

const EditGallery = (props: any) => {
  const newConfig: any = {theme: tailwindConfig.theme};
  const tw = create(newConfig);
  const {isUpdateProfile, service, verifiedUser, rangeDate} = props.route?.params || {};
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const [boxImages, setBoxImages] = useState([]);
  const [rootLayout, setRootLayout]: any = useState();
  const {currentUser} = useSelector(userSelector);
  const GAP = 10;
  const WIDH_DEFAULD = (dimensions.width - 32 - GAP * 2) / 3;

  const muUploadImage = useMutation({
    mutationKey: ['updateImage'],
    mutationFn: uploadImage,
    onSuccess: (response: any) => {
      if (response?.data?.code === 200) {
        const images = response?.data?.data.Images || [];
        const imageUrl: any = difference(images, map(boxImages, 'url'));
        const newBoxImages: any = cloneDeep(boxImages);
        const boxImage: any = newBoxImages.find((img: any) => img.index === size(images) - 1 && img.size);
        boxImage.url = imageUrl[0];
        if (size(images) > 5) {
          newBoxImages.push(handleBoxImage(size(images), null));
        }
        setBoxImages(newBoxImages);
        dispatch(userAction.updateCurrentUser(response?.data?.data));
      }
    },
    onError: () => {},
  });

  const handleChoosePhoto = () => {
    const data: any = {noData: true};
    launchImageLibrary(data, response => {
      if (response?.assets) {
        const size25mb = 1024 * 1024 * 25;
        const fileSize: any = response?.assets?.[0].fileSize;
        if (fileSize <= size25mb) {
          muUploadImage.mutate(createFormData(response?.assets?.[0]));
        } else {
          Alert.alert(t('updoad25Mb'));
        }
      }
    });
  };

  const handleBoxImage = (i: number, url: any) => {
    const row = parseInt(Number(i) / 3 + '', 10);
    const colum = Number(i) % 3;
    let pointX = 0;
    let pointY = 0;
    let size = 1;
    if (i === 1) {
      pointX = (WIDH_DEFAULD + GAP) * 2;
      pointY = 0;
    } else if (i === 2) {
      pointX = (WIDH_DEFAULD + GAP) * 2;
      pointY = WIDH_DEFAULD + GAP;
    } else if (i !== 0) {
      pointX = (WIDH_DEFAULD + GAP) * colum;
      pointY = (WIDH_DEFAULD + GAP) * (row + 1);
    } else {
      size = 2;
    }
    return {index: i, url, pointX, pointY, size};
  };

  useEffect(() => {
    const images = currentUser?.Images || [];
    const sizeList = size(images) > 5 ? size(images) + 1 : 6;
    const listImage: any = [];
    for (let i = 0; i < sizeList; i++) {
      listImage.push(handleBoxImage(i, images?.[i] || null));
    }
    setBoxImages(listImage);
  }, []);

  const handleViewProfile = () => {
    dispatch(bookingAction.cleanBooking());
    dispatch(userAction.cleanSherpa());
    props.navigation.navigate(ROUTER.USER_DETAIL, {isUpdateProfile, service, verifiedUser, rangeDate});
  };

  return (
    <ColorLayout isLoading={muUploadImage.isPending}>
      <Header
        {...props}
        renderRight={() => (
          <Pressable className="rounded-full w-9 h-9 items-center justify-center bg-white border border-border" onPress={handleChoosePhoto}>
            <Add18Icon width={18} style={tw`text-primary`} />
          </Pressable>
        )}
        title={isUpdateProfile ? t('addPhotos') : null}
        showHeaderTitle
      />
      {isUpdateProfile && <Text className="px-8 text-center text-sx text-medium">{t('updatePhotoMes')}</Text>}
      <View
        className="m-4 z-[3]"
        onLayout={event => setRootLayout(event.nativeEvent.layout)}
        style={{height: (max(map(boxImages, (img: any) => img.pointX)) || 0) + WIDH_DEFAULD}}>
        {boxImages.map((image: any, i: any) => (
          <BoxImage key={`key-${i + 1}`} {...{image, setBoxImages, boxImages, handleChoosePhoto, rootLayout}} />
        ))}
      </View>
      {isUpdateProfile && (
        <View className="items-center">
          <ButtonBlue uppercase disabled={isEmpty(currentUser?.Images)} onPress={handleViewProfile}>
            {t('continue')}
          </ButtonBlue>
        </View>
      )}
    </ColorLayout>
  );
};
export default EditGallery;
