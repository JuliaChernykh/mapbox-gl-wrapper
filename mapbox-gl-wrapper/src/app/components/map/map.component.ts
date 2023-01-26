import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MapService } from '../../services/map/map.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('map')
  map: ElementRef<HTMLDivElement>;

  constructor(private mapService: MapService) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.mapService.drawMap(this.map.nativeElement);
    this.mapService.addPins();
  }

  ngOnDestroy() {
    this.mapService.removeMap();
  }
}
