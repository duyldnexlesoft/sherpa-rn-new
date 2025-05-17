/* eslint-disable react/no-unstable-nested-components */
import {useEffect, useState} from 'react';
import {Pressable, TouchableOpacity, View} from 'react-native';
import moment from 'moment';
import Text from 'app/components/Text';
import {CalendarList} from 'react-native-calendars';
import {isEmpty} from 'lodash';
import {timesForCalendar} from 'app/utils/helpler';
import {useTranslation} from 'react-i18next';
import Alert from './Alert';

const ServiceCalendar = (props: any) => {
  const {t} = useTranslation();
  const {onConfirm, availability} = props;
  const [selected, setSelected]: any = useState(null);
  const [times, setTimes]: any = useState([]);

  useEffect(() => {
    if (props.selected) {
      let times = timesForCalendar(availability, props.selected);
      handleSelected(times, {dateString: props.selected});
    }
  }, [props.selected, availability]);

  const handleSelected = (times: any, date: any) => {
    setTimes(times);
    setSelected(date.dateString);
  };

  const formatHours = (time: any) => moment().startOf('days').add(time, 'hours').format('hh:mm A');

  const handleConfirm = (time: any) => {
    if (!selected) return;
    const startOfDay = moment(selected).startOf('days');
    const start = startOfDay.clone().add(time.startTime, 'hours');
    if (onConfirm) {
      if (start > moment().add(1, 'hours')) {
        onConfirm({startDate: start, endDate: startOfDay.clone().add(time.endTime, 'hours')});
      } else {
        Alert.alert(t('timeHasPassed'));
      }
    }
  };

  const renderDate = (date: any) => {
    const {dateString} = date;
    const isCurrent = dateString === moment().format('YYYY-MM-DD');
    const isSelect = dateString === selected;
    let times = timesForCalendar(availability, dateString);

    let cssView = '';
    let cssText = ' text-textContainer';
    let cssDot = ' bg-secondary';

    if (isCurrent) {
      cssView = ' border border-primary';
      cssText = ' text-primary';
      cssDot = ' bg-primary';
    }
    if (isSelect) {
      cssView = ' bg-primary';
      cssText = ' text-white';
      cssDot = ' bg-white';
    }
    return (
      <Pressable
        key={date.dateString}
        className={'w-[40px] h-[40px] items-center justify-center rounded-full relative' + cssView}
        onPress={() => handleSelected(times, date)}>
        <Text className={'text-base' + cssText}>{date.day}</Text>
        {!isEmpty(times) && (
          <View className="absolute bottom-1 justify-center items-center w-full">
            <View className={'w-1.5 h-1.5 rounded-full' + cssDot} />
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-white">
      {!props.notShowCalendar && (
        <CalendarList
          hideExtraDays={true}
          horizontal={true}
          pagingEnabled={true}
          hideDayNames={false}
          calendarWidth={props.calendarWidth}
          renderHeader={date => <Text className="text-base font-bold pb-2 flex-1">{moment(date.toString()).format('MMM')}</Text>}
          theme={{
            textSectionTitleColor: '#6B7280',
          }}
          dayComponent={({date}: any) => renderDate(date)}
        />
      )}
      <View className="flex-row flex-wrap px-2 w-full">
        {times?.map((time: any, index: any) => (
          <TouchableOpacity
            onPress={() => handleConfirm(time)}
            className="h-[44px] items-center justify-center border border-border border-l-4 rounded-lg pl-3 pr-4 m-1.5"
            key={`time-${index}`}>
            <Text>
              {formatHours(time.startTime)} - {formatHours(time.endTime)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default ServiceCalendar;
