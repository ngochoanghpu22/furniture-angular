import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { GoogleMap } from '@angular/google-maps';
import { AppConfigService } from '@flex-team/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'fxt-google-map-searchbox',
  templateUrl: './google-map-searchbox.component.html',
  styleUrls: ['./google-map-searchbox.component.scss']
})
export class GoogleMapSearchboxComponent {

  @ViewChild('mapSearchField', { static: true }) searchField: ElementRef;
  @ViewChild(GoogleMap, { static: false }) map: GoogleMap;
  @Output() locationSelected = new EventEmitter<any>();

  @Input() position: google.maps.LatLngLiteral;

  markerPositions: google.maps.LatLngLiteral[] = [];
  markerOptions: google.maps.MarkerOptions = { draggable: false };

  options: google.maps.MapOptions = {
    fullscreenControl: false,
    mapTypeControl: false,
    mapTypeId: 'roadmap',
    zoom: 12,
    center: { lat: 48.8584, lng: 2.2945 } as google.maps.LatLngLiteral,
  };

  center = { lat: 48.8584, lng: 2.2945 } as google.maps.LatLngLiteral;

  googleMapLoaded: Observable<boolean>;

  initialized = false;

  places: google.maps.places.PlaceResult[] = [];

  constructor(private httpClient: HttpClient,
    private appConfigService: AppConfigService) {
  }

  ngOnInit() {
    this.initMap();
  }

  onIdle() {
    if (!this.initialized) {
      this.initialized = true;
      this.initSearchBox();
    }
  }

  confirm($event: any) {
    $event.preventDefault();
    $event.stopPropagation();
    if (this.places.length == 0) return;
    const place = this.places[0];
    const coords = place.geometry.location.toJSON();
    this.locationSelected.emit({
      ...coords,
      location: place.name,
      formattedAddress: place.formatted_address
    })
  }

  initSearchBox() {
    if (!this.map) {
      return;
    }

    const searchBox = new google.maps.places.SearchBox(this.searchField.nativeElement);

    searchBox.addListener('places_changed', () => {
      const places = searchBox.getPlaces();

      if (places.length == 0) {
        return;
      }

      // For each place, get the icon, name and location.
      const bounds = new google.maps.LatLngBounds();

      places.forEach((place) => {
        if (!place.geometry || !place.geometry.location) {
          console.error("Returned place contains no geometry");
          return;
        }

        this.markerPositions = [{ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() }]
        this.center = this.markerPositions[0];

        if (place.geometry.viewport) {
          // Only geocodes have viewport.
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
      this.map.fitBounds(bounds);

      this.places = places;
    });
  }

  onInput() {
    if (this.places.length > 0) {
      this.places = [];
    }
  }

  private initMap() {
    const ggMapKey = this.appConfigService.config.googleMapAPIKey;
    if (!this.appConfigService.googleMapLoaded) {
      this.googleMapLoaded = this.httpClient.jsonp(`https://maps.googleapis.com/maps/api/js?key=${ggMapKey}&libraries=places`,
        'callback')
        .pipe(
          map(() => {
            this.appConfigService.googleMapLoaded = true;
            return true;
          }),
          catchError(() => of(false)),
        );
    } else {
      this.googleMapLoaded = of(true);
    }
    
    if (this.position && this.position.lat && this.position.lng) {
      this.markerPositions = [{ lat: this.position.lat, lng: this.position.lng }];
      this.center = this.markerPositions[0];
    }
  }
}
