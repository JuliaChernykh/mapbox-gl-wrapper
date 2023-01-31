import { Pin } from '../../types/types';
import { DataView } from '../../services/map/constants';

export type MapStoreState = {
  pins: Pin[];
  pinsLoadedSuccessfully: boolean;
  selectedDataView: DataView;
};
