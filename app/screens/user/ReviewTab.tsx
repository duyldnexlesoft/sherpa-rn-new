import {View} from 'react-native';
import Text from 'app/components/Text';
import {ProgressBar} from 'react-native-paper';
import colors from 'app/utils/colors';
import Avatar from 'app/components/Avatar';
import RatingStar from 'app/components/RatingStar';
import {floorReview, formatTimeRequest, getFullName} from 'app/utils/helpler';
import StarIcon from 'app/assets/svg/star.svg';
import {filter, floor, size} from 'lodash';
import Star60Svg from 'app/assets/svg/star60.svg';
import {useTranslation} from 'react-i18next';

const ReviewTab = ({reviews, verifiedUser}: any) => {
  const {t} = useTranslation();
  const {rating, number} = floorReview(verifiedUser.Reviews);
  const maxReviews = filter(verifiedUser.Reviews, (r: any) => r.Rating === 5);

  if (!rating) {
    return (
      <View className="flex-1 bg-white px-4 pt-4">
        <Text className="text-lg font-medium text-textContainer">{t('review')}</Text>
        <View className="items-center justify-center py-8">
          <Star60Svg />
          <Text className="text-xl font-bold text-gray-500 mt-7">{t('emptyReview')}</Text>
          <Text className="text-base text-gray-500 pt-3">{t('emptyReviewDescription')} </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white px-4 pt-4">
      <Text className="text-lg font-medium text-textContainer">
        {t('review')} <Text className="text-primary">({number})</Text>
      </Text>
      {!!size(maxReviews) && (
        <Text className="text-textContainer mt-3">
          {t('recommendReview', {
            percentRating: floor((size(maxReviews) / size(verifiedUser.Reviews)) * 100),
            fullName: getFullName(verifiedUser),
            sizeMaxReviews: size(maxReviews),
          })}
        </Text>
      )}
      <View className="flex-row items-center mt-4">
        <View className="w-[100px] h-[100px] bg-secondary rounded-full items-center justify-center">
          <Text className="text-[40px] font-medium text-white">{rating}</Text>
          <Text className="text-white">of {number}</Text>
        </View>
        <View className="w-full flex-1 ml-3">
          {[5, 4, 3, 2, 1].map((n: any, index: any) => {
            const filterReview = filter(verifiedUser.Reviews, (r: any) => r.Rating === n);
            return (
              <View className="flex-row items-center justify-between my-0.5" key={`per-${index}`}>
                <RatingStar rate={n} className="flex-row w-24" />
                <View className="flex-1">
                  <ProgressBar
                    progress={size(filterReview) / (size(verifiedUser.Reviews) || 1)}
                    color={colors.secondary}
                    className="w-full h-[6px] rounded-full bg-border"
                  />
                </View>
                <Text className="w-12 text-center">{floor((size(filterReview) / size(verifiedUser.Reviews)) * 100)}%</Text>
              </View>
            );
          })}
        </View>
      </View>
      {reviews.map((review: any, index: any) => {
        return (
          <View className="mt-4 pt-4 border-t border-border" key={`box-${index}`}>
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Avatar item={review?.User} size={38} />
                <View className="ml-2.5">
                  <Text className="text-base font-medium">
                    {review?.User?.FirstName} {review?.User?.LastName}
                  </Text>
                  <Text className="text-gray-500 text-xs">{formatTimeRequest(review.createdAt)}</Text>
                </View>
              </View>
              <View className="flex-row items-center bg-lightSecondary rounded px-2 py-0.5">
                <StarIcon width={13} />
                <Text className="pl-1 text-activeSecondary">{review.Rating}.0</Text>
              </View>
            </View>
            <Text className="text-gray-500 py-2">{review.Comment}</Text>
          </View>
        );
      })}
    </View>
  );
};

export default ReviewTab;
