/* eslint-disable react-hooks/exhaustive-deps */
import ButtonGreen from 'app/components/button/ButtonGreen';
import Header from 'app/components/Header';
import TextInput from 'app/components/TextInput';
import {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {Pressable, SafeAreaView, ScrollView, StyleSheet, View} from 'react-native';
import ArrowDownIcon from 'app/assets/svg/arrow-down.svg';
import LocationIcon from 'app/assets/svg/location-outline.svg';
import CalendarIcon from 'app/assets/svg/calendar.svg';
import AlertSelectModal from 'app/components/Modal/AlertSelectModal';
import {ACTIVITY_EXPERIENCE_LEVEL, CATEGORIES} from 'app/utils/constants';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import {useMutation} from '@tanstack/react-query';
import PageSelectModal from 'app/components/Modal/PageSelectModal';
import {countries} from 'app/utils/countryCode';
import {createSherpaUser} from 'app/api/verifiedUserApi';
import {useDispatch, useSelector} from 'react-redux';
import {userSelector} from 'app/store/selectors';
import {userAction} from 'app/store/actions';
import {useTranslation} from 'react-i18next';
import _, {values} from 'lodash';
import ToughClick from 'app/components/ToughClick';
import Text from 'app/components/Text';
import ColorLayout from 'app/layout/ColorLayout';
import LocationModal from 'app/components/Modal/LocationModal';
import ToSherpaSuccessModal from 'app/components/Modal/ToSherpaSuccessModal';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Alert from 'app/components/Alert';

const RegisterSherpa = (props: any) => {
  const {t} = useTranslation();
  const navigation = props?.navigation;
  const token = props?.route?.params?.token;
  const newCountries = countries.map(c => ({id: c.code, name: `${c.name} (${c.code})`}));
  const dispatch = useDispatch();
  const {currentUser} = useSelector(userSelector);
  const [argee, setAgree]: any = useState(false);
  const [userCreate, setUserCreate]: any = useState(false);
  const [modalCountryCode, setModalCountryCode] = useState(false);
  const [modalAP, setModalAP] = useState(false);
  const [modalAEL, setModalAEL] = useState(false);
  const [modalOB, setModalOB] = useState(false);
  const [locationModal, setLocationModal]: any = useState(false);
  const [toSherpaSuccessModal, setToSherpaSuccessModal]: any = useState(false);
  const [dateOfBirth, setDateOfBirth]: any = useState(undefined);
  const [countryCode, setCountryCode]: any = useState(newCountries.find((c: any) => c.id === '+1'));

  const muCreateSherpaUser = useMutation({
    mutationKey: ['createSherpaUser'],
    mutationFn: createSherpaUser,
    onSuccess: (response: any) => {
      if (response?.data?.code === 200) {
        const userUpdate: any = {IsSherpaLinkOpen: true};
        setUserCreate({Email: currentUser.Email});
        dispatch(userAction.updateCurrentUser(userUpdate));
        setToSherpaSuccessModal(true);
      } else {
        Alert.alert(response?.data?.message);
      }
    },
    onError: () => {},
  });

  useEffect(() => {
    if (currentUser) {
      const params = ['FirstName', 'LastName', 'PhoneNumber', 'DateOfBirth', 'Unit', 'Address', 'AboutMe', 'TrainingGoals', 'FitnessAchievements'];
      const cloneUser = _.pick(currentUser, params);
      if (cloneUser.DateOfBirth) {
        setDateOfBirth(cloneUser.DateOfBirth);
        cloneUser.DateOfBirth = moment(cloneUser.DateOfBirth).format('ll');
      }
      reset(cloneUser);
    }
  }, [currentUser]);

  const {control, handleSubmit, setValue, reset, formState, clearErrors} = useForm();
  const {errors} = formState;

  const onSubmit = (value: any) => {
    const dataSave = _.cloneDeep(value);
    dataSave.ActivityPreference = value.ActivityPreference;
    dataSave.ActivityExpertise = value.ActivityExpertise;
    dataSave.DateOfBirth = dateOfBirth;
    dataSave.token = token;
    muCreateSherpaUser.mutate(dataSave);
  };

  const handleActivityPreference = (value: any) => {
    setValue('ActivityPreference', value);
    clearErrors('ActivityPreference');
  };
  const handleActivityExperienceLevel = (value: any) => {
    setValue('ActivityExpertise', value);
    clearErrors('ActivityExpertise');
  };
  const handleCountryCode = (value: any) => {
    setCountryCode(value);
  };
  const handleDateOfBirth = (date: any) => {
    setModalOB(false);
    setValue('DateOfBirth', moment(date).format('ll'));
    setDateOfBirth(moment(date).format('YYYY-MM-DD'));
    clearErrors('DateOfBirth');
  };

  const renderLeftInputCountryCode = () => (
    <Pressable className="flex-row items-center pl-1 pr-2 border-r border-border" onPress={() => setModalCountryCode(true)}>
      <Text className="w-12 text-textContainer text-right pr-2">{countryCode?.id}</Text>
      <ArrowDownIcon />
    </Pressable>
  );

  const handleSelectLocation = (feature: any) => {
    setLocationModal(false);
    setValue('Address', feature.place_name);
  };

  return (
    <ColorLayout isLoading={muCreateSherpaUser.isPending} className="bg-white">
      <Header {...props} showHeaderTitle />
      <KeyboardAwareScrollView className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
          <View className="items-center justify-center px-4 pb-2">
            <View className="flex flex-row mt-4 w-full">
              <View className="basis-1/2">
                <TextInput
                  label={t('firstName')}
                  name="FirstName"
                  rules={{required: t('firstNameRequired')}}
                  error={errors.FirstName}
                  control={control}
                />
                {errors.FirstName && <Text className="text-red-600 pt-0.5 text-[10px]">{errors.FirstName.message}</Text>}
              </View>
              <View className="basis-1/2 pl-2">
                <TextInput
                  label={t('lastName')}
                  name="LastName"
                  rules={{required: t('lastNameRequired')}}
                  error={errors.LastName}
                  control={control}
                />
                {errors.LastName && <Text className="text-red-600 pt-0.5 text-[10px]">{errors.LastName.message}</Text>}
              </View>
            </View>
            <View className="mt-4 w-full">
              <TextInput
                label={t('phoneNumber')}
                name="PhoneNumber"
                mask="[000]-[000]-[0000]"
                rules={{
                  required: t('phoneRequired'),
                  minLength: {value: 12, message: t('invalidPhoneNumber')},
                  maxLength: {value: 12, message: t('invalidPhoneNumber')},
                }}
                error={errors.PhoneNumber}
                control={control}
                leftIcon={renderLeftInputCountryCode()}
              />
              {errors.PhoneNumber && <Text className="text-red-600 pt-0.5 text-[10px]">{errors.PhoneNumber.message}</Text>}
            </View>
            <View className="mt-4 w-full">
              <TextInput
                label={t('dateOfBirth')}
                name="DateOfBirth"
                rules={{required: t('birthDayRequired')}}
                error={errors.DateOfBirth}
                control={control}
                rightIcon={<CalendarIcon className="text-gray-500" />}
                onPress={() => setModalOB(true)}
              />
              {errors.DateOfBirth && <Text className="text-red-600 pt-0.5 text-[10px]">{errors.DateOfBirth.message}</Text>}
            </View>
            <View className="mt-4 w-full">
              <TextInput label="Unit" name="Unit" control={control} />
            </View>
            <View className="mt-4 w-full">
              <TextInput label={t('address')} name="Address" control={control} rightIcon={LocationIcon} onPress={() => setLocationModal(true)} />
            </View>
            <View className="mt-4 w-full">
              <TextInput
                label={t('aboutMe')}
                name="AboutMe"
                multiline={true}
                rules={{required: t('aboutMeRequired')}}
                error={errors.AboutMe}
                numberOfLines={10}
                height={100}
                control={control}
              />
              {errors.AboutMe && <Text className="text-red-600 pt-0.5 text-[10px]">{errors.AboutMe.message}</Text>}
            </View>
            <View className="mt-4 w-full">
              <TextInput
                label={t('trainingGoals')}
                name="TrainingGoals"
                multiline={true}
                rules={{required: t('trainingGoalsRequired')}}
                error={errors.TrainingGoals}
                numberOfLines={10}
                height={100}
                control={control}
              />
              {errors.TrainingGoals && <Text className="text-red-600 pt-0.5 text-[10px]">{errors.TrainingGoals.message}</Text>}
            </View>
            <View className="mt-4 w-full">
              <TextInput
                label={t('fitnessAchievements')}
                name="FitnessAchievements"
                multiline={true}
                rules={{required: t('fitnessAchievementsRequired')}}
                error={errors.FitnessAchievements}
                numberOfLines={10}
                height={100}
                control={control}
              />
              {errors.FitnessAchievements && <Text className="text-red-600 pt-0.5 text-[10px]">{errors.FitnessAchievements.message}</Text>}
            </View>
            <View className="mt-4 w-full">
              <TextInput
                label={t('activityPreference')}
                name="ActivityPreference"
                rules={{required: t('activityPreferenceRequired')}}
                error={errors.ActivityPreference}
                control={control}
                rightIcon={ArrowDownIcon}
                onPress={() => setModalAP(true)}
              />
              {errors.ActivityPreference && <Text className="text-red-600 pt-0.5 text-[10px]">{errors.ActivityPreference.message}</Text>}
            </View>
            <View className="mt-4 w-full">
              <TextInput
                label={t('activityExpertise')}
                name="ActivityExpertise"
                rules={{required: t('activityExpertisesRequired')}}
                error={errors.ActivityExpertise}
                control={control}
                rightIcon={ArrowDownIcon}
                onPress={() => setModalAEL(true)}
              />
              {errors.ActivityExpertise && <Text className="text-red-600 pt-0.5 text-[10px]">{errors.ActivityExpertise.message}</Text>}
            </View>
            <View className="flex flex-row justify-center items-center mt-4">
              <ToughClick {...{argee, setAgree, data: userCreate}} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAwareScrollView>
      <SafeAreaView className="mb-4">
        <View className="w-full px-4 pt-2 bg-white" style={styles.shadowBottom}>
          <ButtonGreen onPress={handleSubmit(onSubmit)} disabled={!argee}>
            {t('submit')}
          </ButtonGreen>
        </View>
      </SafeAreaView>
      <AlertSelectModal
        key={'key-ap'}
        {...{modal: modalAP, setModal: setModalAP, title: t('activityPreference')}}
        {...{onSelect: handleActivityPreference, items: values(CATEGORIES)}}
      />
      <AlertSelectModal
        key={'key-ael'}
        {...{modal: modalAEL, setModal: setModalAEL, title: t('activityExpertise')}}
        {...{onSelect: handleActivityExperienceLevel, items: ACTIVITY_EXPERIENCE_LEVEL}}
      />
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
      <PageSelectModal
        key={'key-phone'}
        {...{modal: modalCountryCode, setModal: setModalCountryCode, title: t('countryCode')}}
        {...{onSelect: handleCountryCode, itemSelect: countryCode, items: newCountries}}
        {...props}
      />
      <LocationModal {...{modal: locationModal, setModal: setLocationModal, handleSelectLocation}} />
      <ToSherpaSuccessModal {...{setModal: setToSherpaSuccessModal, modal: toSherpaSuccessModal, navigation}} />
    </ColorLayout>
  );
};

const styles = StyleSheet.create({
  shadowBottom: {
    shadowColor: '#FFF',
    shadowOffset: {
      width: 0,
      height: -7,
    },
    shadowOpacity: 1,
    shadowRadius: 7.0,
  },
});

export default RegisterSherpa;
