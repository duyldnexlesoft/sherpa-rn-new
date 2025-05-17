/* eslint-disable import/no-unresolved */
import {useEffect, useState} from 'react';
import ServiceCalendar from 'app/components/ServiceCalendar';
import {Dimensions} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {getAvailability} from 'app/api/availabilityApi';

const dimensions = Dimensions.get('screen');

const AvailalitityTab = (props: any) => {
  const [availability, setAvailability]: any = useState(null);
  const {data} = useQuery({
    queryKey: ['getAvailability', props.verifiedUser._id],
    queryFn: () => getAvailability(props.verifiedUser._id),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (data?.data?.data) {
      setAvailability(data.data.data);
    }
  }, [data?.data?.data]);

  return <ServiceCalendar {...props} availability={availability} calendarWidth={dimensions.width} />;
};

export default AvailalitityTab;
