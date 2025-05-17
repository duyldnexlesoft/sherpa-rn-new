import {View} from 'react-native';
import TextLazy from 'app/components/TextLazy';
import moment from 'moment';
import Text from 'app/components/Text';
import {useTranslation} from 'react-i18next';

const AboutView = ({PhoneNumber, DateOfBirth, Gender, Email, AboutMe, TrainingGoals, FitnessAchievements, isViewSherpa}: any) => {
  const {t} = useTranslation();
  return (
    <View className="flex-1 bg-white p-4">
      {!isViewSherpa && (
        <>
          <View className="flex-row justify-between items-center mb-3">
            <Text>{t('phoneNo')}</Text>
            <Text>{PhoneNumber}</Text>
          </View>
          <View className="flex-row justify-between items-center mb-3">
            <Text>{t('dateOfBirth')}</Text>
            <Text>{DateOfBirth ? moment(DateOfBirth).format('ll') : ''}</Text>
          </View>
          <View className="flex-row justify-between items-center mb-3">
            <Text>{t('gender')}</Text>
            <Text>{Gender || ''}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text>{t('email')}</Text>
            <Text>{Email}</Text>
          </View>
          <View className="h-0.5 w-full bg-border my-4" />
        </>
      )}
      <Text className="text-lg font-medium">{t('aboutMe')}</Text>
      <TextLazy>{AboutMe}</TextLazy>
      <View className="h-0.5 w-full bg-border my-4" />
      <Text className="text-lg font-medium">{t('trainingGoals')}</Text>
      <TextLazy>{TrainingGoals}</TextLazy>
      <View className="h-0.5 w-full bg-border my-4" />
      <Text className="text-lg font-medium">{t('fitnessAchievements')}</Text>
      <TextLazy>{FitnessAchievements}</TextLazy>
    </View>
  );
};

export default AboutView;
