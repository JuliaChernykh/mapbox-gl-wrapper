import { Injectable } from '@angular/core';
import { catchError, EMPTY, map, mergeMap } from 'rxjs';
import { Pin } from '../../types/types';
import { createEffect, ofType } from '@ngrx/effects';

@Injectable()
export class MapStoreEffects {
  // loadMovies$ = createEffect(() =>
  //   this.pins$.pipe(
  //     ofType('[Map Page] Load Pins'),
  //     mergeMap(() =>
  //       this.moviesService.getAll().pipe(
  //         map((movies) => ({
  //           type: '[Movies API] Movies Loaded Success',
  //           payload: movies,
  //         })),
  //         catchError(() => EMPTY)
  //       )
  //     )
  //   )
  // );

  constructor(private pins$: Pin[]) {}
}
