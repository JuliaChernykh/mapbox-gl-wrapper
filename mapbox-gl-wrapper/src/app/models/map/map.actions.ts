import { createAction, props } from '@ngrx/store';
import { DataView } from '../../services/map/constants';
import { PinsData } from '../../types/types';

export const setSelectedDataView = createAction(
  '[Action Panel] SetSelectedDataView',
  props<{ dataView: DataView }>()
);
export const setPinsData = createAction(
  '[Action Panel] LoadDataSuccess',
  props<PinsData>()
);
