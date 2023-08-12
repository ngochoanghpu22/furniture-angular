import { HttpClient } from '@angular/common/http';
import {
  Component, EventEmitter, Input, OnChanges, OnInit,
  Output,
  QueryList, SimpleChanges, ViewChild, ViewChildren
} from '@angular/core';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import {
  AppConfigService, Building, MapInfoWindowFloorDTO,
  MapInfoWindowUserDTO,
  MapPin, TypeOfSpace, TypeOfSpaceIcon, User
} from '@flex-team/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'fxt-google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.scss']
})
export class GoogleMapComponent implements OnInit, OnChanges {

  @ViewChildren(MapInfoWindow) infoWindows: QueryList<MapInfoWindow>;
  @ViewChildren('mapPinInfo') pinInfoWindows: QueryList<MapInfoWindow>;
  @ViewChildren(MapMarker) markerRefs: QueryList<MapMarker>;
  @ViewChild(GoogleMap, { static: false }) map: GoogleMap;

  @Input() buildings: Building[] = [];
  @Input() users: MapInfoWindowUserDTO[] = [];
  @Input() selectedDate: Date;
  @Input() highlightUserIds: string[];
  @Input() mapPins: MapPin[] = [];

  @Output() infoWindowItemClicked = new EventEmitter<{
    building: Building,
    floor: MapInfoWindowFloorDTO,
    user: User
  }>();

  @Output() clusteringend = new EventEmitter();

  googleMapLoaded: Observable<boolean>;

  options: any = {
    fullscreenControl: false,
    disableDefaultUI: true,
    mapTypeControl: false,
    zoomControl: true
  };

  buildingMarkerPositions: google.maps.LatLngLiteral[] = [];
  mapPinsPositions: google.maps.LatLngLiteral[] = [];
  userMarkerPositions: google.maps.LatLngLiteral[] = [];

  initialized = false;
  center = { lat: 48.8584, lng: 2.2945 } as google.maps.LatLngLiteral;
  zoom = 15;

  markerIconNeoNomadOptions: any = {
    icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
  };

  statesOpen: boolean[] = [];
  showClusterer = false;
  markerClustererImagePath =
    'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m';

  constructor(httpClient: HttpClient, private appConfigService: AppConfigService) {

    this.options.mapId = this.appConfigService.config.googleMapCustomId;

    const ggMapKey = this.appConfigService.config.googleMapAPIKey;

    if (!this.appConfigService.googleMapLoaded) {
      this.googleMapLoaded = httpClient.jsonp(`https://maps.googleapis.com/maps/api/js?key=${ggMapKey}&libraries=places`,
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
  }

  ngOnInit() {
    this.statesOpen = Array(this.buildings.length).fill(false);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.buildings && changes.buildings.currentValue) {

      this.buildingMarkerPositions = this.buildings.map(x => <google.maps.LatLngLiteral>{
        lat: x.lat,
        lng: x.lng
      });

      this.center = this.buildingMarkerPositions.length > 0
        ? this.buildingMarkerPositions[0]
        : this.appConfigService.parisCoordinates;

    }

    if (changes.users && this.users) {
      const usersHavingGeodata = this.users.filter(x => x.location.lat != null && x.location.lng != null);
      this.userMarkerPositions = usersHavingGeodata.map(x => <google.maps.LatLngLiteral>{
        lat: x.location.lat,
        lng: x.location.lng
      });
    }

    if (changes.mapPins && this.mapPins) {
      this.mapPins.forEach(element => {
        this.getIconFromType(element);
      });

      this.mapPinsPositions = this.mapPins.map(x => <google.maps.LatLngLiteral>{
        lat: x.latitude,
        lng: x.longitude
      });
    }
  }

  onIdle() {
    if (!this.initialized) {
      this.initialized = true;

      this.infoWindows.forEach((iw: MapInfoWindow, index: number) => {
        iw.open(this.markerRefs.get(index))
      });

      this.fitBounds();
      this.showClusterer = true;

    }
  }

  onClusteringend() {
    if (this.mapPins?.length > 0) {
      this.clusteringend.emit();
    }
  }

  openInfoWindow(marker: MapMarker, index: number) {
    this.infoWindows.get(index).open(marker);
    this.statesOpen[index] = true;
  }

  openInfoWindowUser(marker: MapMarker, userIndex: number) {
    const index = this.buildingMarkerPositions.length + userIndex;
    this.infoWindows.get(index).open(marker);
    this.statesOpen[index] = true;
  }

  openInfoWindowPin(marker: MapMarker, pinIndex: number) {
    this.pinInfoWindows.get(pinIndex).open(marker);
    this.statesOpen[pinIndex] = true;
  }

  onCollapsed(selectedIndex: number) {
    const mapInfoWindow: MapInfoWindow = this.infoWindows.get(selectedIndex);
    this.buildingMarkerPositions.forEach((item, index) => {
      if (index !== selectedIndex) {
        this.infoWindows.get(index).infoWindow.setZIndex(1);
      }
    })
    mapInfoWindow.infoWindow.setZIndex(2);
  }

  onInfoWindowItemClicked($event: { building: Building, floor: MapInfoWindowFloorDTO, user: User }) {
    this.infoWindowItemClicked.emit($event);
  }

  getIconFromType(mapPin: MapPin) {
    if (mapPin.typeOfSpace == TypeOfSpace.CafeCoworking) {
      mapPin.faIconName = TypeOfSpaceIcon.CafeCoworking;
    } else if (mapPin.typeOfSpace == TypeOfSpace.CafeWifi) {
      mapPin.faIconName = TypeOfSpaceIcon.CafeWifi;
    } else if (mapPin.typeOfSpace == TypeOfSpace.CentreDAffaires) {
      mapPin.faIconName = TypeOfSpaceIcon.CentreDAffaires;
    } else if (mapPin.typeOfSpace == TypeOfSpace.Coworking) {
      mapPin.faIconName = TypeOfSpaceIcon.Coworking;
    } else if (mapPin.typeOfSpace == TypeOfSpace.Entreprise) {
      mapPin.faIconName = TypeOfSpaceIcon.Entreprise;
    } else if (mapPin.typeOfSpace == TypeOfSpace.Hotel) {
      mapPin.faIconName = TypeOfSpaceIcon.Hotel;
    } else if (mapPin.typeOfSpace == TypeOfSpace.LieuDedieEvenementiel) {
      mapPin.faIconName = TypeOfSpaceIcon.LieuDedieEvenementiel;
    } else if (mapPin.typeOfSpace == TypeOfSpace.Lounge) {
      mapPin.faIconName = TypeOfSpaceIcon.Lounge;
    } else if (mapPin.typeOfSpace == TypeOfSpace.Pepineere) {
      mapPin.faIconName = TypeOfSpaceIcon.Pepineere;
    } else if (mapPin.typeOfSpace == TypeOfSpace.Restaurant) {
      mapPin.faIconName = TypeOfSpaceIcon.Restaurant;
    } else {
      mapPin.faIconName = TypeOfSpaceIcon.CafeCoworking;
    }
  }

  private fitBounds() {
    const bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < this.markerRefs.length; i++) {
      bounds.extend(this.markerRefs.get(i).getPosition());
    }

    this.map.fitBounds(bounds);

    //remove one zoom level to ensure no marker is on the edge.
    this.zoom = (this.map.getZoom() - 1);

    // set a minimum zoom 
    // if you got only 1 marker or all markers are on the same address map will be zoomed too much.
    if (this.map.getZoom() > 15) {
      this.zoom = 15;
    }
  }

}
