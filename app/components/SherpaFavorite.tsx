import {useEffect, useState} from 'react';
import {TouchableOpacity} from 'react-native';
import HeadOutlineIcon from 'app/assets/svg/head-outline.svg';
import HeadIcon from 'app/assets/svg/head.svg';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {setFavorite} from 'app/api/userApi';
import {useDispatch, useSelector} from 'react-redux';
import {userSelector, bookingSelector} from 'app/store/selectors';
import {userAction} from 'app/store/actions';
import Svg from './Svg';

const SherpaFavorite = ({verifiedUser, className, size}: any) => {
  const dispatch = useDispatch();
  const {sherpa} = useSelector(userSelector);
  const {booking} = useSelector(bookingSelector);
  const user = verifiedUser || booking?.VerifiedUser || sherpa;
  const [isFavorite, setIsFavorite]: any = useState(user.isFavorite);
  const queryClient = useQueryClient();
  const muSetFavorite = useMutation({
    mutationKey: ['setFavorite'],
    mutationFn: setFavorite,
    onSuccess: () => {
      queryClient.refetchQueries({queryKey: ['todgetShepasos']});
      queryClient.refetchQueries({queryKey: ['getMyShepas']});
      queryClient.refetchQueries({queryKey: ['getUserOrders']});
      queryClient.refetchQueries({queryKey: ['getShepasByName']});
      if (sherpa) {
        dispatch(userAction.setSherpa({...sherpa, isFavorite: !user.isFavorite}));
      }
    },
    onError: () => {},
  });

  useEffect(() => {
    setIsFavorite(user.isFavorite);
  }, [user.isFavorite]);

  const handleSetFavorite = () => {
    setIsFavorite(!isFavorite);
    muSetFavorite.mutate({VerifiedUserId: user._id, isFavorite: !isFavorite});
  };
  return (
    <TouchableOpacity className={className} onPress={handleSetFavorite}>
      {!isFavorite && <Svg icon={HeadOutlineIcon} className={`text-gray-500`} width={size || 24} height={size || 24} />}
      {isFavorite && <Svg icon={HeadIcon} className={`text-red-500`}  width={size || 24} height={size || 24} />}
    </TouchableOpacity>
  );
};

export default SherpaFavorite;
