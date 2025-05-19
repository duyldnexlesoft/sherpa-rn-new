/* eslint-disable import/no-unresolved */
import { Pressable, StyleSheet, View } from 'react-native';
import Text from 'app/components/Text';
import ImageIcon from 'app/assets/svg/image.svg';
import RoutingIcon from 'app/assets/svg/routing.svg';
import ROUTER from 'app/navigation/router';
import { useTranslation } from 'react-i18next';
import Image from 'app/components/Image';
import Svg from 'app/components/Svg';

const ServicesTab = ({ verifiedUser, navigation }: any) => {
  const { t } = useTranslation();
  const { Services } = verifiedUser;
  return (
    <View className="flex-1 bg-white px-4 pt-2 min-h-[600px]">
      {Services?.map((service: any, index: number) => (
        <Pressable
          onPress={() => navigation.navigate(ROUTER.SERVICE_DETAIL, { verifiedUser, service })}
          style={styles.shadowBox}
          key={`service-key-${index}`}
          className="bg-white rounded-[10px] my-2">
          <View className="bg-lightSecondary p-2.5 rounded-t-[10px] overflow-hidden flex-row items-center">
            <View className="flex-none w-[62px] h-[40px] mr-2.5 rounded overflow-hidden bg-gray-100 items-center justify-center">
              {service?.Images?.[0] && <Image uri={service.Images?.[0]} className="w-full flex-[1]" />}
              {!service?.Images?.[0] && <Svg icon={ImageIcon} className="text-gray-300" width={22} height={22} />}
            </View>
            <View className="flex-1">
              <View className="flex-row items-start">
                <Text className="text-base text-[14px] font-medium grow whitespace-normal w-[1px] leading-[16px] bg-blue">{service?.Name}</Text>
                <View className="flex-none items-center">
                  <View className="bg-white justify-center ml-2 px-1.5 py-0.5 rounded-sm items-center">
                    <Text className="text-[10px] text-gray-500">{service?.Category}</Text>
                  </View>
                </View>
              </View>
              <View className="flex-row items-center justify-between pt-1 mb-1">
                <View className="flex-row items-center">
                  {service.DefaultAmountTime && (
                    <>
                      <Text className="text-xs text-gray-500">{t('defaulDuration')}: </Text>
                      <Text className="text-xs text-gray-500 font-bold">{service.DefaultAmountTime}</Text>
                    </>
                  )}
                </View>
                <Text className="text-xs font-medium text-secondary">${(service.Amount / 100).toFixed(2)}/h</Text>
              </View>
            </View>
          </View>
          <View className="p-2.5">
            <View className="flex-row items-center">
              <View className="rounded-full border border-border h-9 w-9 items-center justify-center">
                <Svg icon={RoutingIcon} className="text-gray-500" width={18} height={18} />
              </View>
              <Text className="pl-3 flex-1 text-[12px] text-textContainer leading-[16px]">{service.StartAddress}</Text>
            </View>
          </View>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  shadowBox: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
});

export default ServicesTab;
