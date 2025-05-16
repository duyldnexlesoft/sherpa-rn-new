import React from 'react';
import AnimatedLoading from '../Animated/AnimatedLoading';
import Modal from './Modal';

const LoadingScreenModal = ({isLoading}: any) => {
  return (
    <Modal animationType="none" modal={!!isLoading} setModal={() => {}} className="justify-center items-center">
      <AnimatedLoading className="bg-white" />
    </Modal>
  );
};

export default LoadingScreenModal;
