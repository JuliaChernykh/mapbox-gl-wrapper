import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(private http: HttpClient) {}

  fetchPins() {
    return this.http
      .get<any>(
        'https://app.smartapartmentdata.com/List/json/listItems.aspx?listID=7892472&token=AD6110320424834934DE62FD2935A49264B6D947&receipt=undefined'
      )
      .pipe(catchError(this.handleError<any>([])));
  }

  private handleError<T>(res?: T) {
    return (error: any): Observable<T> => {
      console.error('error1234', error);
      return of(res as T);
    };
  }
}

export type Pin = {
  latitude: string;
  longitude: string;
};
