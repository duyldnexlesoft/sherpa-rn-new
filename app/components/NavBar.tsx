import {Pressable, SafeAreaView, StyleSheet, View} from 'react-native';
import Text from './Text';
import ProfileIcon from 'app/assets/svg/profile.svg';
import ProfileActiveIcon from 'app/assets/svg/profile-active.svg';
import ExploreIcon from 'app/assets/svg/explore.svg';
import ExploreActiveIcon from 'app/assets/svg/explore-active.svg';
import RunnermaIcon from 'app/assets/svg/runnerman.svg';
import RunnermaActiveIcon from 'app/assets/svg/runnerman-active.svg';
import HeartIcon from 'app/assets/svg/heart.svg';
import HeartActiveIcon from 'app/assets/svg/heart-active.svg';
import ROUTER from 'app/navigation/router';
import {useSelector} from 'react-redux';
import {userSelector} from 'app/store/selectors';

const NavItem = ({focused, navigation, router, name, Icon, ActiveIcon, isNotice}: any) => (
  <Pressable className="flex-1 items-center" onPress={() => navigation.navigate(router, {time: new Date().getTime()})}>
    <View>
      {isNotice && <View className="bg-red-600 h-[10px] w-[10px] items-center justify-center absolute right-[-12px] rounded-full px-1.5" />}
      {focused === router ? <ActiveIcon height={24} /> : <Icon height={24} />}
    </View>
    <Text className={`text-xs pt-2 ${focused === router ? 'text-primary' : 'text-gray-500'}`}>{name}</Text>
  </Pressable>
);

const NavBar = (props: any) => {
  const {isNotice} = useSelector(userSelector);
  return (
    <View className="w-full rounded-t-[20px] bg-white border border-white pt-4" style={styles.shadowBox}>
      <SafeAreaView className="flex-row justify-between pb-2 mb-2">
        <NavItem {...props} router={ROUTER.MY_SHERPAS} name="My Sherpas" Icon={HeartIcon} ActiveIcon={HeartActiveIcon} />
        <NavItem {...props} {...{isNotice}} router={ROUTER.BOOKINGS} name="Bookings" Icon={RunnermaIcon} ActiveIcon={RunnermaActiveIcon} />
        <NavItem {...props} router={ROUTER.EXPLORE} name="Explore" Icon={ExploreIcon} ActiveIcon={ExploreActiveIcon} />
        <NavItem {...props} router={ROUTER.PROFILE} name="Profile" Icon={ProfileIcon} ActiveIcon={ProfileActiveIcon} />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowBox: {
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2.22,
    elevation: 8,
  },
});

export default NavBar;
