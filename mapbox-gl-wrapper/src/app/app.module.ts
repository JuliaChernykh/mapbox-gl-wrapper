import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { MapComponent } from './components/map/map.component';
import { HttpClientModule } from '@angular/common/http';
import { ActionPanelComponent } from './components/action-panel/action-panel.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { mapStoreReducer } from './models/map/map.reducer';
import { MapStoreEffects } from './models/map/map.effects';

@NgModule({
  declarations: [AppComponent, MapComponent, ActionPanelComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    StoreModule.forRoot({ mapStore: mapStoreReducer }, {}),
    EffectsModule.forRoot([MapStoreEffects]),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
