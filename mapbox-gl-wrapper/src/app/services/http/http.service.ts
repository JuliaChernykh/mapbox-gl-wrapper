import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { PinsData } from '../../types/types';
import { HttpPath, REQUEST_TOKEN } from './constants';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(private http: HttpClient) {}

  fetchData(): Observable<PinsData> {
    return this.http
      .get<PinsData>(HttpPath.FetchPinsUrl)
      .pipe(catchError(this.handleError<PinsData>({ records: [] })));
  }

  updateFavorites(
    listID: number,
    propertyID: number,
    isFavorite: boolean
  ): Observable<any> {
    return this.http
      .post(
        HttpPath.UpdateFavoritesUrl,
        {
          listID: listID.toString(),
          propertyID,
          isFavorite,
          token: REQUEST_TOKEN,
        },
        { responseType: 'text' }
      )
      .pipe(catchError(this.handleError<any>()));
  }

  private handleError<T>(res?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      return of(res as T);
    };
  }
}
