import {PermissionsAndroid, Platform} from 'react-native';
import messaging from '@react-native-firebase/messaging';

if (Platform.OS === 'android') {
  requestAndroidPermission();
}

function requestAndroidPermission() {
  PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
}

export async function requestUserPermission() {
  const authorizationStatus = await messaging().requestPermission();
  const enabled =
    authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED || authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authorizationStatus);
  } else {
    console.log('User has notification permissions disabled');
  }
}

export async function NotificationListener() {
  messaging().onNotificationOpenedApp((remoteMessage: any) => {
    console.log('Notification caused app to open from background state:', remoteMessage.notification);
  });

  messaging()
    .getInitialNotification()
    .then((remoteMessage: any) => {
      if (remoteMessage) {
        console.log('Notification caused app to open from quit state:', remoteMessage.notification);
      }
    });

  messaging().onMessage(async (remoteMessage: any) => {
    console.log('Notification in force ground state: ', remoteMessage);
  });
}
