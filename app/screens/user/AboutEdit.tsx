/* eslint-disable react-hooks/exhaustive-deps */
import {useEffect, useState} from 'react';
import {View} from 'react-native';
import TextInput from 'app/components/TextInput';
import ArrowDownIcon from 'app/assets/svg/arrow-down.svg';
import LocationIcon from 'app/assets/svg/location-outline.svg';
import CalendarIcon from 'app/assets/svg/calendar.svg';
import moment from 'moment';
import DatePicker from 'react-native-date-picker';
import _ from 'lodash';
import {useTranslation} from 'react-i18next';
import Text from 'app/components/Text';
import Svg from 'app/components/Svg';

const AboutEdit = ({user, hookForm, dateOfBirth, setDateOfBirth, countryCode, setModalCountryCode, setLocationModal, setModalGender}: any) => {
  const {t} = useTranslation();
  const [modalOB, setModalOB] = useState(false);
  const {control, reset, setValue, formState, clearErrors} = hookForm;
  const errors = formState.errors;

  useEffect(() => {
    if (user) {
      const params = [
        'FirstName',
        'LastName',
        'PhoneNumber',
        'DateOfBirth',
        'Gender',
        'Address',
        'Unit',
        'AboutMe',
        'TrainingGoals',
        'FitnessAchievements',
      ];
      const cloneUser = _.pick(user, params);
      if (cloneUser.DateOfBirth) {
        setDateOfBirth(cloneUser.DateOfBirth);
        cloneUser.DateOfBirth = moment(cloneUser.DateOfBirth).format('ll');
      }
      reset(cloneUser);
    }
  }, [user]);

  const handleDateOfBirth = (date: any) => {
    setModalOB(false);
    setValue('DateOfBirth', moment(date).format('ll'));
    setDateOfBirth(moment(date).format('YYYY-MM-DD'));
    clearErrors('DateOfBirth');
  };

  const renderLeftInputCountryCode = () => (
    <View className="flex-row items-center pl-1 pr-2 border-r border-border">
      <Text className="w-12 text-textContainer text-right pr-2">{countryCode.id}</Text>
      <ArrowDownIcon />
    </View>
  );

  return (
    <View className="flex-1 bg-white px-4">
      <View className="flex flex-row mt-4 w-full">
        <View className="basis-1/2 pr-2">
          <TextInput label={t('firstName')} name="FirstName" rules={{required: true}} error={errors.FirstName} control={control} />
          {errors.FirstName && <Text className="text-red-600 pt-0.5 text-[10px]">{t('firstNameRequired')}</Text>}
        </View>
        <View className="basis-1/2 pl-2">
          <TextInput label={t('lastName')} name="LastName" rules={{required: true}} error={errors.LastName} control={control} />
          {errors.LastName && <Text className="text-red-600 pt-0.5 text-[10px]">{t('lastNameRequired')}</Text>}
        </View>
      </View>
      <View className="mt-4 w-full">
        <TextInput
          label={t('phoneNumber')}
          name="PhoneNumber"
          mask="[000]-[000]-[0000]"
          rules={{required: true, minLength: 12, maxLength: 12}}
          error={errors.PhoneNumber}
          control={control}
          leftIcon={renderLeftInputCountryCode()}
          leftAction={() => setModalCountryCode(true)}
        />
        {errors.PhoneNumber && <Text className="text-red-600 pt-0.5 text-[10px]">{t('invalidPhoneNumber')}</Text>}
      </View>
      <View className="flex flex-row mt-4 w-full">
        <View className="basis-1/2 pr-2">
          <TextInput
            label={t('dateOfBirth')}
            name="DateOfBirth"
            control={control}
            rightIcon={<Svg icon={CalendarIcon} className="text-gray-500" />}
            onPress={() => setModalOB(true)}
          />
        </View>
        <View className="basis-1/2 pl-2">
          <TextInput label={t('gender')} name="Gender" control={control} rightIcon={ArrowDownIcon} onPress={() => setModalGender(true)} />
        </View>
      </View>
      <View className="mt-4 w-full">
        <TextInput label={t('address')} name="Address" control={control} rightIcon={LocationIcon} onPress={() => setLocationModal(true)} />
      </View>
      <View className="mt-4 w-full">
        <TextInput label={t('unit')} name="Unit" control={control} />
      </View>
      <View className="mt-4 w-full">
        <TextInput label={t('aboutMe')} name="AboutMe" multiline={true} numberOfLines={10} height={100} control={control} />
      </View>

      <View className="mt-4 w-full">
        <TextInput label={t('trainingGoals')} name="TrainingGoals" multiline={true} numberOfLines={10} height={100} control={control} />
      </View>
      <View className="mt-4 w-full">
        <TextInput label={t('fitnessAchievements')} name="FitnessAchievements" multiline={true} numberOfLines={10} height={100} control={control} />
      </View>
      {modalOB && (
        <DatePicker
          modal
          theme="light"
          // androidVariant="iosClone"
          open={modalOB}
          date={dateOfBirth ? new Date(dateOfBirth) : new Date()}
          mode="date"
          onConfirm={handleDateOfBirth}
          onCancel={() => setModalOB(false)}
        />
      )}
    </View>
  );
};

export default AboutEdit;
