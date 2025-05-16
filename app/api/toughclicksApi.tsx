/* eslint-disable prettier/prettier */
import {get, post} from 'app/utils/baseApi';
import {CLIENT_ID, PACKET_ID} from '@env';

export const render = () => {
  return get(`https://api.toughclicks.com/api/v1/client/${CLIENT_ID}/packet/${PACKET_ID}`);
};
export const createAcceptance = (payload: any) => {
  const body = {
    customData: {},
    applicationContext: {model: payload.model},
    packetId: PACKET_ID,
    displayMethod: 'group',
    signerIdentifier: payload.Email,
    documents: payload.documents,
    signerEmailAddress: '',
    dynamicData: null,
  };
  return post(`https://api.toughclicks.com/api/v1/client/${CLIENT_ID}/accept`, body);
};