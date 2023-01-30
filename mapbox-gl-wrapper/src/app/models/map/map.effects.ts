import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { HttpService } from '../../services/http/http.service';
import { setPinsData } from './map.actions';

@Injectable()
export class MapStoreEffects {
  loadData$ = createEffect(() => {
    return this.actions$.pipe(
      ofType('[Action Panel] Load Data'),
      mergeMap(() =>
        this.httpService.fetchData().pipe(
          map((data) => setPinsData(data)),
          catchError(() => EMPTY)
        )
      )
    );
  });

  constructor(private actions$: Actions, private httpService: HttpService) {}
}
