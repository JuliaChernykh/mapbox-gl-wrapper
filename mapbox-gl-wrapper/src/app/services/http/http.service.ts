import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MapItems } from '../../types/types';
import { HttpPath } from './constants';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(private http: HttpClient) {}

  fetchPins(): Observable<MapItems> {
    return this.http
      .get<MapItems>(HttpPath.FetchPinsUrl)
      .pipe(catchError(this.handleError<MapItems>({ records: [] })));
  }

  private handleError<T>(res?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      return of(res as T);
    };
  }
}
