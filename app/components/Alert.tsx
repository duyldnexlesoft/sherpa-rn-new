import {Alert as AlertReact, Platform} from 'react-native';
const Alert = {
  alert: (title: any, message?: any) =>
    Platform.OS === 'ios' ? AlertReact.alert(title, message) : AlertReact.alert(message ? title : '', message || title),
};
export default Alert;
