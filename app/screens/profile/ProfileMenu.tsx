/* eslint-disable import/no-unresolved */
import React, {useState} from 'react';
import {SafeAreaView, ScrollView, View, Pressable, Dimensions, Linking, TouchableOpacity} from 'react-native';
import BgHeader from 'app/assets/svg/bgHeader.svg';
import User30Icon from 'app/assets/svg/user30.svg';
import User22Icon from 'app/assets/svg/user22.svg';
import SherpaIcon from 'app/assets/svg/sherpa.svg';
import LockIcon from 'app/assets/svg/lock.svg';
import HelpIcon from 'app/assets/svg/help.svg';
import CardIcon from 'app/assets/svg/card.svg';
import SecurityIcon from 'app/assets/svg/security.svg';
import UserRemoveIcon from 'app/assets/svg/user-remove.svg';
import LogoutIcon from 'app/assets/svg/logout.svg';
import ArrowRightIcon from 'app/assets/svg/arrow-right.svg';
import Pencil14Icon from 'app/assets/svg/pencil14.svg';
import SupportIcon from 'app/assets/svg/support.svg';
import {useDispatch, useSelector} from 'react-redux';
import {userSelector} from 'app/store/selectors';
import ROUTER from 'app/navigation/router';
import {userAction, bookingAction} from 'app/store/actions';
import _ from 'lodash';
import {REGISTER_SHERPA_URL} from '@env';
import {useMutation} from '@tanstack/react-query';
import {deleteUser, logout} from 'app/api/userApi';
import Text from 'app/components/Text';
import ColorLayout from 'app/layout/ColorLayout';
import colors from 'app/utils/colors';
import {verifiedUser} from 'app/api/verifiedUserApi';
import DeleteUserModal from 'app/components/Modal/DeleteUserModal';
import LogoutModal from 'app/components/Modal/LogoutModal';
import {useTranslation} from 'react-i18next';
import Image from 'app/components/Image';
import NavBar from 'app/components/NavBar';
import Alert from 'app/components/Alert';
import Intercom, {Space} from '@intercom/intercom-react-native';
const dimensions = Dimensions.get('screen');

const ProfileMenu = (props: any) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const {currentUser} = useSelector(userSelector);
  const [deleteUserModal, setDeleteUserModal] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);

  const muLogout = useMutation({
    mutationKey: ['logout'],
    mutationFn: logout,
    onSuccess: (response: any) => {
      if (response?.data?.code === 200) {
        dispatch(userAction.removeCurrentUser());
      }
    },
    onError: () => {},
  });

  const muDeleteUser = useMutation({
    mutationKey: ['deleteUser'],
    mutationFn: deleteUser,
    onSuccess: (response: any) => {
      if (response?.data?.code === 200) {
        dispatch(userAction.removeCurrentUser());
      }
    },
    onError: () => {},
  });

  const muVerifiedUser = useMutation({
    mutationKey: ['verifiedUser'],
    mutationFn: verifiedUser,
    onSuccess: (response: any) => {
      if (response?.data?.code === 200) {
        props.navigation.navigate(ROUTER.REGISTER_SHERPA, {token: response?.data?.data?.token});
      } else {
        Alert.alert(response?.data?.message);
      }
    },
    onError: () => {},
  });

  const handleViewProfile = () => {
    dispatch(bookingAction.cleanBooking());
    dispatch(userAction.cleanSherpa());
    props.navigation.navigate(ROUTER.USER_DETAIL);
  };

  const handleDeleteUser = () => {
    setDeleteUserModal(false);
    muDeleteUser.mutate();
  };

  const handlelogoutUser = () => {
    setLogoutModal(false);
    muLogout.mutate();
    Intercom.logout();
  };

  const handleRegister = () => Linking.openURL(REGISTER_SHERPA_URL);

  const handleHelpCenter = () => Intercom.presentSpace(Space.helpCenter);
  const muHelpCenter = useMutation({mutationKey: ['helpCenter'], mutationFn: handleHelpCenter, onError: () => {}});

  return (
    <ColorLayout
      isLoading={muLogout.isPending || muVerifiedUser.isPending || muDeleteUser.isPending || muHelpCenter.isPending}
      color={colors.primary}
      light>
      <View className="absolute w-full">
        <BgHeader width={dimensions.width} height={(166 * dimensions.width) / 375} />
      </View>
      <SafeAreaView className="flex-1">
        <ScrollView>
          <View className="items-center justify-center">
            <Pressable className="mb-2 relative" onPress={() => props.navigation.navigate(ROUTER.EDIT_GALLERY)}>
              {!_.isEmpty(currentUser?.Images) ? (
                <Image className="w-20 h-20 rounded-full" uri={currentUser?.Images?.[0]} />
              ) : (
                <View className="w-20 h-20 rounded-full bg-secondary items-center justify-center">
                  <User30Icon />
                </View>
              )}
              <View className="items-center justify-center bg-gray-900/80 w-7 h-7 rounded-full absolute bottom-0 right-0">
                <Pencil14Icon />
              </View>
            </Pressable>
            <Text className="text-white">{currentUser.Email}</Text>
          </View>
          <View className="rounded-lg bg-white mx-6 mt-10 divide-y divide-backgroundHover">
            <RowMenu lable={t('editProfile')} Icon={User22Icon} onPress={handleViewProfile} />
            {!currentUser.IsSherpaLinkOpen && <RowMenu lable={t('becomeSherpa')} Icon={SherpaIcon} onPress={handleRegister} />}
            <RowMenu lable={t('changePassword')} Icon={LockIcon} onPress={() => props.navigation.navigate(ROUTER.CHANGE_PASSWORD)} />
            <RowMenu lable={t('myCard')} Icon={CardIcon} onPress={() => props.navigation.navigate(ROUTER.MY_CARD)} />
          </View>
          <View className="rounded-lg bg-white mx-6 mt-4 divide-y divide-backgroundHover">
            <RowMenu lable={t('legal')} Icon={SecurityIcon} onPress={() => Linking.openURL('https://legal.gowithsherpa.com/')} />
            <RowMenu lable={t('support')} Icon={SupportIcon} onPress={() => props.navigation.navigate(ROUTER.SUPPORT)} />
            <RowMenu lable={'Help Center'} Icon={HelpIcon} onPress={() => muHelpCenter.mutate()} />
            <RowMenu lable={t('deleteAccount')} Icon={UserRemoveIcon} onPress={() => setDeleteUserModal(true)} />
            <RowMenu lable={t('logOut')} Icon={LogoutIcon} onPress={() => setLogoutModal(true)} />
          </View>
        </ScrollView>
      </SafeAreaView>
      <NavBar {...props} focused={ROUTER.PROFILE} />
      <DeleteUserModal {...{modal: deleteUserModal, setModal: setDeleteUserModal, onSubmit: handleDeleteUser}} />
      <LogoutModal {...{modal: logoutModal, setModal: setLogoutModal, onSubmit: handlelogoutUser}} />
    </ColorLayout>
  );
};

const RowMenu = (props: any) => {
  return (
    <TouchableOpacity className="p-4 flex-row justify-between items-center bg-redd-300" {...props}>
      <View className="flex-row items-center">
        <props.Icon />
        <Text className="text-base pl-3">{props.lable}</Text>
      </View>

      <ArrowRightIcon className="text-activePrimary" />
    </TouchableOpacity>
  );
};

export default ProfileMenu;
