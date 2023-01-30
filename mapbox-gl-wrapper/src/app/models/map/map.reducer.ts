import { createReducer, on } from '@ngrx/store';
import { setSelectedDataView, setPinsData } from './map.actions';
import { DataView } from '../../services/map/constants';
import { MapStoreState } from './types';
import { Pin } from '../../types/types';

const initialState: MapStoreState = {
  pins: [],
  selectedDataView: DataView.IndividualPins,
};

export const mapStoreReducer = createReducer(
  initialState,
  on(setSelectedDataView, (state, { dataView }) => ({
    ...state,
    selectedDataView: dataView,
  })),
  on(setPinsData, (state, { records }) => {
    const pins: Pin[] = records.map((pinRecord, idx) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [
          Number(pinRecord.geocode.Longitude),
          Number(pinRecord.geocode.Latitude),
        ],
      },
      properties: {
        ...pinRecord,
      },
      id: idx,
    }));
    return { ...state, pins: pins };
  })
);
