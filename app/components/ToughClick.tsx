/* eslint-disable react-hooks/exhaustive-deps */
import {useEffect, useState} from 'react';
import {Linking} from 'react-native';
import Checkbox from 'app/components/CheckBox';
import _ from 'lodash';
import {useMutation, useQuery} from '@tanstack/react-query';
import {createAcceptance, render} from 'app/api/toughclicksApi';
import DeviceInfo from 'react-native-device-info';
import Text from './Text';

const ToughClick = ({argee, setAgree, data}: any) => {
  const [toughclick, setToughclick]: any = useState(false);
  const {data: tlData} = useQuery({
    queryKey: ['toughclicksRender'],
    queryFn: render,
  });

  useEffect(() => {
    setToughclick(tlData?.data);
  }, [tlData?.data]);

  const muAcceptance = useMutation({
    mutationKey: [createAcceptance],
    mutationFn: createAcceptance,
  });

  useEffect(() => {
    if (data) {
      const model = DeviceInfo.getModel();
      const documents = toughclick.documents.map((document: any) => ({
        checked: true,
        checkedAt: new Date(),
        documentId: document.id,
      }));
      muAcceptance.mutate({...data, model, documents});
    }
  }, [data]);

  return (
    <>
      <Checkbox status={argee} onPress={() => setAgree(!argee)} />
      <Text className="ml-2 flex-1">
        <Text>{toughclick?.customLabelStart}</Text>
        {_.orderBy(toughclick?.documents, 'order').map((document: any, index: any) => (
          <Text key={`key_a_${index + 1}`}>
            <Text
              className="color-secondary"
              onPress={() => {
                Linking.openURL(document.documentUrl);
              }}>
              {document?.displayName}
            </Text>
            <Text>{_.size(toughclick?.documents) - 1 === index ? '' : _.size(toughclick?.documents) - 2 === index ? ' and ' : ', '}</Text>
          </Text>
        ))}
      </Text>
    </>
  );
};

export default ToughClick;
