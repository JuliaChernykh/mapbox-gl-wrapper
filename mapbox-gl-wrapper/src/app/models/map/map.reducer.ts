import { createReducer, on } from '@ngrx/store';
import { increment, decrement, reset } from './map.actions';
import { Pin } from '../../types/types';

export type MapStore = {
  pins: Pin[];
};

export const initialState: MapStore = {
  pins: [],
};

export const mapStoreReducer = createReducer(
  initialState
  // on(increment, (state) => state + 1),
  // on(decrement, (state) => state - 1),
  // on(reset, (state) => 0)
);
