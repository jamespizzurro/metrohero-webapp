import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Reflux from 'reflux';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import StoreMixin from 'reflux-immutable/StoreMixin';
import ga from 'react-ga4';
import { TransitionMotion, spring } from 'react-motion';
import {Tooltip} from 'react-tippy';

import Utilities from '../utilities/Utilities';

import RealtimeMapActions from '../actions/RealtimeMapActions';
import RealtimeMapStore from '../stores/RealtimeMapStore';
import PredictionsStore from '../stores/PredictionsStore';
import SettingsStore from "../stores/SettingsStore";

import GoogleMap from 'google-map-react';

import TrainMarker from './TrainMarker';
import TrainDialog from './TrainDialog';
import StationMarker from './StationMarker';
import StationDialog from './StationDialog';
import PlaybackControls from './PlaybackControls';

import red_stations from '../red_stations';
import orange_stations from '../orange_stations';
import silver_stations from '../silver_stations';
import blue_stations from '../blue_stations';
import yellow_stations from '../yellow_stations';
import green_stations from '../green_stations';

import standardRoutes from '../standard-routes';
import trackCircuits from '../track-circuits';
import trackCircuitGpsCoords from '../track-circuit-gps-coords';
import stationGpsCoords from '../station-gps-coords';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(RealtimeMapStore, 'onStoreChange'),
    Reflux.listenTo(PredictionsStore, 'onStoreChange'),
    Reflux.listenTo(SettingsStore, 'onStoreChange')
  ],

  contextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  propTypes: {
    isPlaybackLoaded: PropTypes.bool.isRequired,
    isDarkMode: PropTypes.bool.isRequired,
    isMobileDevice: PropTypes.bool.isRequired
  },

  getDefaultProps() {
    return {
      center: {lat: 38.898303, lng: -77.028099},
      zoom: 13
    };
  },

  getStoreState() {
    return {
      trainStatuses: PredictionsStore.get('data') ? (this.props.isPlaybackLoaded ? PredictionsStore.get('data') : PredictionsStore.get('data').get('trainStatuses')) : null,
      stationCodeCoordsMap: RealtimeMapStore.get('stationCodeCoordsMap'),
      selectedStationName: RealtimeMapStore.get('selectedStationName'),
      selectedStationCode: RealtimeMapStore.get('selectedStationCode'),
      selectedTrainId: RealtimeMapStore.get('selectedTrainId'),
      standardRoutes: RealtimeMapStore.get('standardRoutes'),
      connectedCircuitIdsByCircuitId: RealtimeMapStore.get('connectedCircuitIdsByCircuitId'),
      coordsData: RealtimeMapStore.get('coordsData'),
      isNerdMode: SettingsStore.get('isNerdMode')
    };
  },

  UNSAFE_componentWillMount() {
    const stationCoordsData = {};

    for (let i = 0; i < stationGpsCoords.length; i++) {
      const data = stationGpsCoords[i];
      stationCoordsData[data['station_code']] = {
        lat: data['lat'],
        lon: data['lon']
      }
    }

    // we need to obtain and store the GPS coordinates of each station
    const stationCodeCoordsMap = {};
    // pull out all stations from our station lists, which are separated by line,
    // and combine them into one master list (without duplicates)
    const stationLists = [red_stations, orange_stations, silver_stations, blue_stations, yellow_stations, green_stations];
    for (let i = 0; i < stationLists.length; i++) {
      const stationList = stationLists[i].Stations;
      for (let j = 0; j < stationList.length; j++) {
        const station = stationList[j];

        if (!stationCodeCoordsMap.hasOwnProperty(station.Code)) {
          stationCodeCoordsMap[station.Code] = {
            lat: stationCoordsData[station.Code] ? stationCoordsData[station.Code].lat : station.Lat,
            lng: stationCoordsData[station.Code] ? stationCoordsData[station.Code].lon : station.Lon,
            stationName: station.Name
          };
        }
      }
    }

    const coordsData = {};

    for (let i = 0; i < trackCircuitGpsCoords.length; i++) {
      const data = trackCircuitGpsCoords[i];
      coordsData[data['track_circuit_id']] = {
        lat: data['lat'],
        lon: data['lon']
      }
    }

    const connectedCircuitIdsByCircuitId = {};

    for (let i = 0; i < trackCircuits['TrackCircuits'].length; i++) {
      const trackCircuit = trackCircuits['TrackCircuits'][i];
      const trackCircuitId = trackCircuit['CircuitId'];

      let connectedTrackCircuitIds = [];
      for (let j = 0; j < trackCircuit['Neighbors'].length; j++) {
        const neighboringTrackCircuitIds = trackCircuit['Neighbors'][j]['CircuitIds'];
        Array.prototype.push.apply(connectedTrackCircuitIds, neighboringTrackCircuitIds);
      }

      connectedCircuitIdsByCircuitId[trackCircuitId] = connectedTrackCircuitIds;
    }

    RealtimeMapActions.updateState({
      stationCodeCoordsMap: stationCodeCoordsMap,
      standardRoutes: standardRoutes,
      connectedCircuitIdsByCircuitId: connectedCircuitIdsByCircuitId,
      coordsData: coordsData
    });
  },

  _drawMetrorailLines(data) {
    // (see https://github.com/istarkov/google-map-react#ongoogleapiloaded-func)
    const map = data.map;
    //var maps = data.maps;

    // disable POI clicking
    const fnSet = google.maps.InfoWindow.prototype.set;
    google.maps.InfoWindow.prototype.set = function() {};

    const revenueCircuitIds = {};

    // draw revenue track
    this.state.standardRoutes.get('StandardRoutes').forEach((route) => {
      if (route.get('LineCode') !== "YLRP") {
        let lineColor;
        if (route.get('LineCode') === "RD") {
          lineColor = "#E51636";
        } else if (route.get('LineCode') === "OR") {
          lineColor = "#F68712";
        } else if (route.get('LineCode') === "SV") {
          lineColor = "#9D9F9C";
        } else if (route.get('LineCode') === "BL") {
          lineColor = "#1574C4";
        } else if (route.get('LineCode') === "YL") {
          lineColor = "#FCD006";
        } else if (route.get('LineCode') === "GR") {
          lineColor = "#0FAB4B";
        }

        const path = [];
        route.get('TrackCircuits').forEach((circuit) => {
          revenueCircuitIds[circuit.get('CircuitId')] = circuit.get('CircuitId');

          const coords = this.state.coordsData.get(circuit.get('CircuitId').toString());
          if (coords && coords.get('lat') != null && coords.get('lon') != null) {
            path.push(new google.maps.LatLng(coords.get('lat'), coords.get('lon')));
          }
        });

        new google.maps.Polyline({
          path: path,
          geodesic: true,
          strokeColor: lineColor,
          strokeOpacity: 0.5,
          strokeWeight: 4
        }).setMap(map);
      }
    });

    // draw non-revenue track
    const drawnCoordinatePairs = {};
    this.state.connectedCircuitIdsByCircuitId.forEach((connectedCircuitIds, circuitId) => {
      const fromCircuit = this.state.coordsData.get(circuitId.toString());
      if (fromCircuit && fromCircuit.get('lat') != null && fromCircuit.get('lon') != null) {
        connectedCircuitIds.forEach((connectedCircuitId) => {
          if (!revenueCircuitIds[circuitId] || !revenueCircuitIds[connectedCircuitId]) {
            // only draw circuit paths that haven't been drawn yet, i.e. circuit paths that involve non-revenue track
            const toCircuit = this.state.coordsData.get(connectedCircuitId.toString());
            if (toCircuit && toCircuit.get('lat') != null && toCircuit.get('lon') != null) {
              const key = fromCircuit.get('lat') + "," + fromCircuit.get('lon') + ";" + toCircuit.get('lat') + "," + toCircuit.get('lon');
              if (!drawnCoordinatePairs[key]) {
                new google.maps.Polyline({
                  path: [
                    new google.maps.LatLng(fromCircuit.get('lat'), fromCircuit.get('lon')),
                    new google.maps.LatLng(toCircuit.get('lat'), toCircuit.get('lon'))
                  ],
                  geodesic: true,
                  strokeColor: "#000000",
                  strokeOpacity: 0.25,
                  strokeWeight: 2
                }).setMap(map);
                drawnCoordinatePairs[key] = true;
              }
            }
          }
        });
      }
    });
  },

  _createStationMarkers() {
    const stationMarkers = [];

    this.state.stationCodeCoordsMap.forEach((stationCoords, stationCode) => {
      let key = stationCode;
      if (key === 'B06') {
        key = 'B06|E06';  // Fort Totten
      } else if (key === 'E06') {
        return;
      } else if (key === 'B01') {
        key = 'B01|F01';  // Gallery Place
      } else if (key === 'F01') {
        return;
      } else if (key === 'D03') {
        key = 'D03|F03';  // L'Enfant Plaza
      } else if (key === 'F03') {
        return;
      } else if (key === 'C01') {
        key = 'C01|A01';  // Metro Center
      } else if (key === 'A01') {
        return;
      }

      stationMarkers.push(
        <Tooltip
          key={'stationmarker-' + key}
          title={this.state.isNerdMode ? key : stationCoords.get('stationName')}
          position="bottom"
          animateFill={false}
          arrow={true}
          distance={20}
          lat={stationCoords.get('lat')}
          lng={stationCoords.get('lng')}
        >
          <StationMarker
            muiTheme={this.context.muiTheme}
            onClick={this._handleClickStation.bind(null, stationCoords.get('stationName'), key)}
          />
        </Tooltip>
      );
    });

    return stationMarkers;
  },

  _handleStationDialog(stationName, stationCode, tabValue) {
    if (this.props.isPlaybackLoaded) {
      return;
    }

    ga.send(Utilities.getDataForModalView(window.location.pathname + "#" + stationCode));
    ga.event({
      category: 'Realtime Map',
      action: 'Displayed Station Modal',
      label: 'For ' + stationCode + ' (' + stationName + ')'
    });

    RealtimeMapActions.updateState({
      selectedStationName: stationName,
      selectedStationCode: stationCode
    });
    this.refs.stationDialog.show(stationCode, tabValue);
  },

  _handleClickStation(stationName, stationCode) {
    this._handleStationDialog(stationName, stationCode, 'train-etas');
  },

  _handleClickTrain(trainStatus) {
    ga.send(Utilities.getDataForModalView(window.location.pathname + "#" + trainStatus.get('trainId')));
    ga.event({
      category: 'Realtime Map',
      action: 'Displayed Train Modal',
      label: 'Not From Station'
    });

    RealtimeMapActions.updateState({
      selectedTrainId: trainStatus.get('trainId')
    });
    this.refs.trainDialog.show();
  },

  _onTrainDialogHide() {
    RealtimeMapActions.updateState({
      selectedTrainId: null
    });
  },

  _onStationDialogHide() {
    RealtimeMapActions.updateState({
      selectedStationName: null,
      selectedStationCode: null
    });
  },

  _getTrainMarkerStyles() {
    const trainMarkerStyles = [];

    if (this.state.trainStatuses) {
      this.state.trainStatuses.forEach((trainStatus, index) => {
        const rawTrackCircuitId = trainStatus.get('rawTrackCircuitId');
        const rawTrackCircuitCoords = rawTrackCircuitId ? this.state.coordsData.get(rawTrackCircuitId.toString()) : null;
        let lat = trainStatus.get('lat') ? trainStatus.get('lat') : (rawTrackCircuitCoords ? rawTrackCircuitCoords.get('lat') : null);
        let lon = trainStatus.get('lon') ? trainStatus.get('lon') : (rawTrackCircuitCoords ? rawTrackCircuitCoords.get('lon') : null);
        if ((lat != null) && (lon != null)) {
          const springConfig = {
            stiffness: 170,
            damping: 40,
            precision: 0.0001
          };
          const trainMarkerStyle = {
            key: trainStatus.get('trainId'),
            data: {
              Car: trainStatus.get('Car'),
              Line: trainStatus.get('Line'),
              DestinationName: trainStatus.get('DestinationName'),
              realTrainId: trainStatus.get('realTrainId'),
              chevronAngle: trainStatus.get('direction'),
              areDoorsOpenOnLeft: trainStatus.get('areDoorsOpenOnLeft'),
              areDoorsOpenOnRight: trainStatus.get('areDoorsOpenOnRight'),
              onClick: this._handleClickTrain.bind(null, trainStatus),
              muiTheme: this.context.muiTheme
            },
            style: {
              lat: spring(lat, springConfig),
              lng: spring(lon, springConfig)
            }
          };

          trainMarkerStyles.push(trainMarkerStyle);
        }
      });
    }

    return trainMarkerStyles;
  },

  render() {
    if (!this.state.stationCodeCoordsMap) {
      return false;
    }

    return (
      <div
        className='RealtimeMap'
      >
        <TransitionMotion
          styles={this._getTrainMarkerStyles()}
        >
          {interpolatedStyles =>
            <GoogleMap
              bootstrapURLKeys={{
                key: 'AIzaSyC5JJA1M_5GtVLwvWQzVa-yWkkG-woykZM',
                language: 'en',
                region: 'en'
              }}
              defaultCenter={this.props.center}
              defaultZoom={this.props.zoom}
              options={{
                minZoom: 11,
                maxZoom: 19,
                mapTypeControl: true,
                styles: [
                  {
                    "elementType": "geometry",
                    "stylers": [
                      {
                        "color": "#f5f5f5"
                      }
                    ]
                  },
                  {
                    "elementType": "labels.icon",
                    "stylers": [
                      {
                        "visibility": "off"
                      }
                    ]
                  },
                  {
                    "elementType": "labels.text.fill",
                    "stylers": [
                      {
                        "color": "#616161"
                      }
                    ]
                  },
                  {
                    "elementType": "labels.text.stroke",
                    "stylers": [
                      {
                        "color": "#f5f5f5"
                      }
                    ]
                  },
                  {
                    "featureType": "administrative.land_parcel",
                    "elementType": "labels.text.fill",
                    "stylers": [
                      {
                        "color": "#bdbdbd"
                      }
                    ]
                  },
                  {
                    "featureType": "poi",
                    "elementType": "geometry",
                    "stylers": [
                      {
                        "color": "#eeeeee"
                      }
                    ]
                  },
                  {
                    "featureType": "poi",
                    "elementType": "labels.text.fill",
                    "stylers": [
                      {
                        "color": "#757575"
                      }
                    ]
                  },
                  {
                    "featureType": "poi.park",
                    "elementType": "geometry",
                    "stylers": [
                      {
                        "color": "#e5e5e5"
                      }
                    ]
                  },
                  {
                    "featureType": "poi.park",
                    "elementType": "labels.text.fill",
                    "stylers": [
                      {
                        "color": "#9e9e9e"
                      }
                    ]
                  },
                  {
                    "featureType": "road",
                    "elementType": "geometry",
                    "stylers": [
                      {
                        "color": "#ffffff"
                      }
                    ]
                  },
                  {
                    "featureType": "road.arterial",
                    "elementType": "labels.text.fill",
                    "stylers": [
                      {
                        "color": "#757575"
                      }
                    ]
                  },
                  {
                    "featureType": "road.highway",
                    "elementType": "geometry",
                    "stylers": [
                      {
                        "color": "#dadada"
                      }
                    ]
                  },
                  {
                    "featureType": "road.highway",
                    "elementType": "labels.text.fill",
                    "stylers": [
                      {
                        "color": "#616161"
                      }
                    ]
                  },
                  {
                    "featureType": "road.local",
                    "elementType": "labels.text.fill",
                    "stylers": [
                      {
                        "color": "#9e9e9e"
                      }
                    ]
                  },
                  {
                    "featureType": "transit.line",
                    "elementType": "geometry",
                    "stylers": [
                      {
                        "color": "#e5e5e5"
                      }
                    ]
                  },
                  {
                    "featureType": "transit.station",
                    "elementType": "geometry",
                    "stylers": [
                      {
                        "color": "#eeeeee"
                      }
                    ]
                  },
                  {
                    "featureType": "water",
                    "elementType": "geometry",
                    "stylers": [
                      {
                        "color": "#c9c9c9"
                      }
                    ]
                  },
                  {
                    "featureType": "water",
                    "elementType": "labels.text.fill",
                    "stylers": [
                      {
                        "color": "#9e9e9e"
                      }
                    ]
                  }
                ]
              }}
              onGoogleApiLoaded={this._drawMetrorailLines}
              yesIWantToUseGoogleMapApiInternals
            >
              {this._createStationMarkers()}
              {interpolatedStyles.map(config => {
                return (
                  <TrainMarker
                    key={config.key}
                    {...config.data}
                    {...config.style}
                  />
                );
              })}
            </GoogleMap>
          }
        </TransitionMotion>
        <PlaybackControls />
        <StationDialog
          ref="stationDialog"
          stationName={this.state.selectedStationName}
          onHide={this._onStationDialogHide}
        />
        <TrainDialog
          ref="trainDialog"
          trainId={this.state.selectedTrainId}
          stationName={this.state.selectedStationName}
          shouldRender={!this.state.selectedStationCode}
          storeName={'PredictionsStore'}
          onHide={this._onTrainDialogHide}
        />
      </div>
    );
  }
});
