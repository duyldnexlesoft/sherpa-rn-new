import {PermissionsAndroid, Platform} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import store from 'app/store/store';
import {bookingAction} from 'app/store/actions';
import {omit} from 'lodash';

const requestAndroidPermission = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  }
};

const NotificationListener = async () => {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
  });

  messaging().onMessage(async (remoteMessage: any) => {
    console.log('Notification in force ground state: ', remoteMessage);
    store.dispatch(bookingAction.setTimeNotification(omit(remoteMessage.data, 'isMessage')));
  });

  messaging()
    .getInitialNotification()
    .then((remoteMessage: any) => {
      if (remoteMessage) {
        console.log('App opened from quit state by notification:', remoteMessage);
        store.dispatch(bookingAction.setTimeNotification(remoteMessage.data));
      }
    });

  messaging().onNotificationOpenedApp((remoteMessage: any) => {
    console.log('App opened from background by notification:', remoteMessage);
    store.dispatch(bookingAction.setTimeNotification(remoteMessage.data));
  });
};

export const requestUserPermission = async () => {
  await requestAndroidPermission();
  const authorizationStatus = await messaging().requestPermission();
  const enabled =
    authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED || authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    const token = await messaging().getToken();
    NotificationListener();
    console.log('Authorization status:', authorizationStatus);
    return token;
  } else {
    console.log('User has notification permissions disabled');
    return null;
  }
};
