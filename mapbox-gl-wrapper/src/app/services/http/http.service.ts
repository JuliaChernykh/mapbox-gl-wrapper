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

  private handleError<T>(res?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      return of(res as T);
    };
  }
}
