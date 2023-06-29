import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import Reflux from 'reflux';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import StoreMixin from 'reflux-immutable/StoreMixin';
import ga from 'react-ga4';

import Utilities from '../utilities/Utilities';

import LineActions from '../actions/LineActions';
import LineStore from '../stores/LineStore';
import PredictionsStore from '../stores/PredictionsStore';
import AppStore from '../stores/AppStore';
import SettingsStore from "../stores/SettingsStore";

import Paper from 'material-ui/Paper';
import {Tabs, Tab} from 'material-ui/Tabs';

import StationRow from './StationRow';
import BetweenStationRow from './BetweenStationRow';
import TrainIcon from './TrainIcon';
import TrainDialog from './TrainDialog';
import StationDialog from './StationDialog';
import DashboardLineItem from './DashboardLineItem';
import PlaybackControls from './PlaybackControls';
import SpeedRestrictionIcon from './SpeedRestrictionIcon';
import SpeedRestrictionDialog from './SpeedRestrictionDialog';
import NearestStationFloatingActionButton from './NearestStationFloatingActionButton';
import LineBottomNav from './LineBottomNav';

import red_stations from '../red_stations';
import orange_stations from '../orange_stations';
import silver_stations from '../silver_stations';
import blue_stations from '../blue_stations';
import yellow_stations from '../yellow_stations';
import green_stations from '../green_stations';
import NotificationActions from "../actions/NotificationActions";

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(LineStore, 'onStoreChange'),
    Reflux.listenTo(AppStore, 'onStoreChange')
  ],

  propTypes: {
    lineColor: PropTypes.string.isRequired,
    isPlaybackLoaded: PropTypes.bool.isRequired,
    onClickNavItem: PropTypes.func.isRequired,
    isDarkMode: PropTypes.bool.isRequired
  },

  lineCodes: {
    GR_YL: ["GR", "YL"],
    YL_GR: ["YL", "GR"],
    OR_SV_BL: ["OR", "SV", "BL"],
    BL_SV_OR: ["BL", "SV", "OR"],
    BL_SV: ["BL", "SV"],
    RD: ["RD"],
    OR: ["OR"],
    YL: ["YL"],
    SV_OR_BL_GR: ["SV", "OR", "BL", "GR"],
    BL_OR_SV: ["BL", "OR", "SV"],
    BL: ["BL"],
    SV_OR_BL_YL: ["SV", "OR", "BL", "YL"],
    SV: ["SV"],
    OR_SV: ["OR", "SV"]
  },

  getStoreState() {
    return {
      selectedTrainId: LineStore.get('selectedTrainId'),
      selectedSpeedRestrictionId: LineStore.get('selectedSpeedRestrictionId'),
      selectedStationName: LineStore.get('selectedStationName'),
      selectedStationCode: LineStore.get('selectedStationCode'),
      lastLineColor: LineStore.get('lastLineColor'),
      tabValue: LineStore.get('tabValue'),
      lineMapScrollY: LineStore.get('lineMapScrollY'),
      scrollTop: LineStore.get('scrollTop'),
      shouldAutoPress: LineStore.get('shouldAutoPress'),
      effectiveViewportHeight: AppStore.get('effectiveViewportHeight')
    };
  },

  componentDidMount() {
    // if specified, automatically open station dialog associated with station code in pathname
    const path = window.location.href.split("#");
    if (path.length === 2) {
      const stationCode = path[1].toUpperCase();
      const ref = this.refs[stationCode];
      if (ref) {
        const stationName = ref.props.stationName;
        if (stationCode && stationName) {
          this._handleStationScrolling(stationCode);
          this._handleClickStation(stationName, stationCode);
        }
      }
    } else {
      if (this.state.selectedStationCode) {
        // restored state
        this._handleStationScrolling(this.state.selectedStationCode);
      } else {
        this._handleStationScrolling();
      }
    }
    this._updateStationRefs(null, null);
  },

  componentDidUpdate(prevProps, prevState) {
    this._handleStationScrolling();
    this._updateStationRefs(prevProps, prevState);
  },

  componentWillUnmount() {
    LineActions.reset();
  },

  _updateStationRefs(prevProps, prevState) {
    if (!this.refs) {
      return;
    }

    const anchorNode = this.refs.anchor ? ReactDOM.findDOMNode(this.refs.anchor) : null;
    const refs = {
      anchorNodeClientHeight: anchorNode ? anchorNode.clientHeight : null
    };
    Object.keys(this.refs).forEach((key) => {
      const ref = this.refs[key];
      const node = ref ? ReactDOM.findDOMNode(ref) : null;
      if (node) {
        const rect = node ? node.getBoundingClientRect() : null;
        if (rect) {
          refs[key] = rect;
        }
      }
    });
    LineActions.updateState({
      refs: refs
    });
  },

  _handleClickTrain(trainStatus) {
    ga.send(Utilities.getDataForModalView(window.location.pathname + "#" + trainStatus.get('trainId')));
    ga.event({
      category: 'Line Map',
      action: 'Displayed Train Modal',
      label: 'Not From Station'
    });

    LineActions.updateState({
      selectedTrainId: trainStatus.get('trainId')
    });
    this.refs.trainDialog.show();
  },

  _onTrainDialogHide() {
    LineActions.updateState({
      selectedTrainId: null
    });
  },

  _handleClickSpeedRestriction(speedRestriction) {
    ga.send(Utilities.getDataForModalView(window.location.pathname + '#speedRestriction-' + speedRestriction.get('id')));
    ga.event({
      category: 'Line Map',
      action: 'Displayed Speed Restriction Modal'
    });

    LineActions.updateState({
      selectedSpeedRestrictionId: speedRestriction.get('id')
    });
    this.refs.speedRestrictionDialog.show();
  },

  _onSpeedRestrictionDialogHide() {
    LineActions.updateState({
      selectedSpeedRestrictionId: null
    });
  },

  _handleStationDialog(stationName, stationCode, tabValue) {
    if (this.props.isPlaybackLoaded) {
      return;
    }

    ga.send(Utilities.getDataForModalView(window.location.pathname + "#" + stationCode));
    ga.event({
      category: 'Line Map',
      action: 'Displayed Station Modal',
      label: 'For ' + stationCode + ' (' + stationName + ')'
    });

    LineActions.updateState({
      selectedStationName: stationName,
      selectedStationCode: stationCode
    });
    this.refs.stationDialog.show(stationCode, tabValue);
  },

  _handleClickStation(stationName, stationCode) {
    Utilities.addRecentlyVisitedStation(stationCode, this.props.lineColor, stationName);
    this._handleStationDialog(stationName, stationCode, 'train-etas');
  },

  _handleClickStationTwitter(stationName, stationCode) {
    this._handleStationDialog(stationName, stationCode, 'station-problems');
  },

  _handleTapOutage(stationName, stationCode) {
    this._handleStationDialog(stationName, stationCode, 'station-outages');
  },

  _onStationDialogHide() {
    LineActions.updateState({
      selectedStationName: null,
      selectedStationCode: null
    });
  },

  _onGetCurrentPositionSuccess(position) {
    let stations = null;
    if (this.props.lineColor === "red") {
      stations = red_stations.Stations;
    } else if (this.props.lineColor === "orange") {
      stations = orange_stations.Stations;
    } else if (this.props.lineColor === "silver") {
      stations = silver_stations.Stations;
    } else if (this.props.lineColor === "blue") {
      stations = blue_stations.Stations;
    } else if (this.props.lineColor === "yellow") {
      stations = yellow_stations.Stations;
    } else if (this.props.lineColor === "green") {
      stations = green_stations.Stations;
    }
    if (stations) {
      let nearestStationCode = null;
      let smallestDistance = 99999; // this is stupid
      for (let i = 0; i < stations.length; i++) {
        const station = stations[i];
        const deltaX = position.coords.latitude - station.Lat;
        const deltaY = position.coords.longitude - station.Lon;
        const squaredDistance = (deltaX * deltaX) + (deltaY * deltaY);
        if (squaredDistance < smallestDistance) {
          nearestStationCode = station.Code;
          smallestDistance = squaredDistance;
        }
      }
      if (nearestStationCode) {
        this._scrollToStation(nearestStationCode);
      }
    }

    if (this.state.shouldAutoPress) {
      LineActions.updateState({
        shouldAutoPress: false
      });
    }
  },

  _onGetCurrentPositionFailed(positionError) {
    NotificationActions.showNotification('warning', "Failed to find nearest station");

    if (this.state.shouldAutoPress) {
      LineActions.updateState({
        shouldAutoPress: false
      });
    }
  },

  _handleStationScrolling(stationCode) {
    if ((this.state.lastLineColor != this.props.lineColor) || stationCode) {
      let shouldAutoPress = true;
      if (stationCode) {
        this._scrollToStation(stationCode);
        shouldAutoPress = false;
      } else {
        const path = window.location.href.split("#");
        if (path.length === 2) {
          shouldAutoPress = false;
        }
      }

      LineActions.updateState({
        lastLineColor: this.props.lineColor,
        tabValue: 'line-map',
        shouldAutoPress: shouldAutoPress
      });
    } else if (this.state.scrollTop != null) {
      const lineContainerNode = ReactDOM.findDOMNode(this.refs.lineContainer);
      lineContainerNode.scrollTop = this.state.scrollTop;
      LineActions.updateState({
        scrollTop: null
      });
    }
  },

  _scrollToStation(stationCode) {
    const ref = this.refs[stationCode];
    if (ref) {
      const node = ReactDOM.findDOMNode(ref);
      Element.prototype.documentOffsetTop = function () {
        return this.offsetTop + (this.offsetParent ? this.offsetParent.documentOffsetTop() : 0);
      };
      const lineContainerNode = ReactDOM.findDOMNode(this.refs.lineContainer);
      lineContainerNode.scrollTop = node.documentOffsetTop() - (lineContainerNode.offsetHeight / 2) - 74 /* MAGIC NUMBERS YAY */;
    }
  },

  _handleTabChange(value) {
    const lineContainerNode = ReactDOM.findDOMNode(this.refs.lineContainer);
    LineActions.updateState({
      tabValue: value,
      lineMapScrollY: (this.state.tabValue === 'line-map') ? lineContainerNode.scrollTop : null,
      scrollTop: (value === 'line-map') ? this.state.lineMapScrollY : 0
    });
  },

  _getSwitchedStationCode() {
    let switchedStationCode;

    if (this.state.selectedStationCode === 'B06') {
      switchedStationCode = 'E06';
    } else if (this.state.selectedStationCode === 'E06') {
      switchedStationCode = 'B06';
    } else if (this.state.selectedStationCode === 'B01') {
      switchedStationCode = 'F01';
    } else if (this.state.selectedStationCode === 'F01') {
      switchedStationCode = 'B01';
    } else if (this.state.selectedStationCode === 'D03') {
      switchedStationCode = 'F03';
    } else if (this.state.selectedStationCode === 'F03') {
      switchedStationCode = 'D03';
    } else if (this.state.selectedStationCode === 'C01') {
      switchedStationCode = 'A01';
    } else if (this.state.selectedStationCode === 'A01') {
      switchedStationCode = 'C01';
    }

    return switchedStationCode;
  },

  _switchSelectedStationCode() {
    const switchedStationCode = this._getSwitchedStationCode();
    if (!switchedStationCode) {
      return;
    }

    this._handleStationDialog(this.state.selectedStationName, switchedStationCode, null);
  },

  render() {
    let lineContent;
    let stations;
    if (this.props.lineColor === 'red') {
      stations = red_stations.Stations;
      lineContent = (
        <div ref='anchor' className='colored-line-content'>
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Glenmont"} stationCode={"B11"} ref="B11" onClick={this._handleClickStation.bind(null, "Glenmont", "B11")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Glenmont", "B11")} onTapOutage={this._handleTapOutage.bind(null, "Glenmont", "B11")} />
          <BetweenStationRow code={'B11_B10'} isOnLeft={true} />
          <BetweenStationRow code={'B10_B11'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Wheaton"} stationCode={"B10"} ref="B10" onClick={this._handleClickStation.bind(null, "Wheaton", "B10")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Wheaton", "B10")} onTapOutage={this._handleTapOutage.bind(null, "Wheaton", "B10")} />
          <BetweenStationRow code={'B10_B09'} isOnLeft={true} />
          <BetweenStationRow code={'B09_B10'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Forest Glen"} stationCode={"B09"} ref="B09" onClick={this._handleClickStation.bind(null, "Forest Glen", "B09")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Forest Glen", "B09")} onTapOutage={this._handleTapOutage.bind(null, "Forest Glen", "B09")} />
          <BetweenStationRow code={'B09_B08'} isOnLeft={true} />
          <BetweenStationRow code={'B08_B09'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Silver Spring"} stationCode={"B08"} ref="B08" onClick={this._handleClickStation.bind(null, "Silver Spring", "B08")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Silver Spring", "B08")} onTapOutage={this._handleTapOutage.bind(null, "Silver Spring", "B08")} />
          <BetweenStationRow code={'B08_B07'} isOnLeft={true} />
          <BetweenStationRow code={'B07_B08'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Takoma"} stationCode={"B07"} ref="B07" onClick={this._handleClickStation.bind(null, "Takoma", "B07")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Takoma", "B07")} onTapOutage={this._handleTapOutage.bind(null, "Takoma", "B07")} />
          <BetweenStationRow code={'B07_B06'} isOnLeft={true} />
          <BetweenStationRow code={'B06_B07'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Fort Totten"} stationCode={"B06"} ref="B06" onClick={this._handleClickStation.bind(null, "Fort Totten", "B06")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Fort Totten", "B06")} onTapOutage={this._handleTapOutage.bind(null, "Fort Totten", "B06")} fromLineCodes={this.lineCodes.GR_YL} toLineCodes={this.lineCodes.YL_GR} />
          <BetweenStationRow code={'B06_B05'} isOnLeft={true} />
          <BetweenStationRow code={'B05_B06'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Brookland–CUA"} stationCode={"B05"} ref="B05" onClick={this._handleClickStation.bind(null, "Brookland–CUA", "B05")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Brookland–CUA", "B05")} onTapOutage={this._handleTapOutage.bind(null, "Brookland–CUA", "B05")} />
          <BetweenStationRow code={'B05_B04'} isOnLeft={true} />
          <BetweenStationRow code={'B04_B05'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Rhode Island Avenue–Brentwood"} stationCode={"B04"} ref="B04" onClick={this._handleClickStation.bind(null, "Rhode Island Avenue–Brentwood", "B04")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Rhode Island Avenue–Brentwood", "B04")} onTapOutage={this._handleTapOutage.bind(null, "Rhode Island Avenue–Brentwood", "B04")} />
          <BetweenStationRow code={'B04_B35'} isOnLeft={true} />
          <BetweenStationRow code={'B35_B04'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"NoMa–Gallaudet U"} stationCode={"B35"} ref="B35" onClick={this._handleClickStation.bind(null, "NoMa–Gallaudet U", "B35")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "NoMa–Gallaudet U", "B35")} onTapOutage={this._handleTapOutage.bind(null, "NoMa–Gallaudet U", "B35")} />
          <BetweenStationRow code={'B35_B03'} isOnLeft={true} />
          <BetweenStationRow code={'B03_B35'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Union Station"} stationCode={"B03"} ref="B03" onClick={this._handleClickStation.bind(null, "Union Station", "B03")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Union Station", "B03")} onTapOutage={this._handleTapOutage.bind(null, "Union Station", "B03")} />
          <BetweenStationRow code={'B03_B02'} isOnLeft={true} />
          <BetweenStationRow code={'B02_B03'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Judiciary Square"} stationCode={"B02"} ref="B02" onClick={this._handleClickStation.bind(null, "Judiciary Square", "B02")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Judiciary Square", "B02")} onTapOutage={this._handleTapOutage.bind(null, "Judiciary Square", "B02")} />
          <BetweenStationRow code={'B02_B01'} isOnLeft={true} />
          <BetweenStationRow code={'B01_B02'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Gallery Place"} stationCode={"B01"} ref="B01" onClick={this._handleClickStation.bind(null, "Gallery Place", "B01")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Gallery Place", "B01")} onTapOutage={this._handleTapOutage.bind(null, "Gallery Place", "B01")} fromLineCodes={this.lineCodes.GR_YL} toLineCodes={this.lineCodes.YL_GR} />
          <BetweenStationRow code={'B01_A01'} isOnLeft={true} />
          <BetweenStationRow code={'A01_B01'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Metro Center"} stationCode={"A01"} ref="A01" onClick={this._handleClickStation.bind(null, "Metro Center", "A01")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Metro Center", "A01")} onTapOutage={this._handleTapOutage.bind(null, "Metro Center", "A01")} fromLineCodes={this.lineCodes.OR_SV_BL} toLineCodes={this.lineCodes.BL_SV_OR} />
          <BetweenStationRow code={'A01_A02'} isOnLeft={true} />
          <BetweenStationRow code={'A02_A01'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Farragut North"} stationCode={"A02"} ref="A02" onClick={this._handleClickStation.bind(null, "Farragut North", "A02")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Farragut North", "A02")} onTapOutage={this._handleTapOutage.bind(null, "Farragut North", "A02")} />
          <BetweenStationRow code={'A02_A03'} isOnLeft={true} />
          <BetweenStationRow code={'A03_A02'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Dupont Circle"} stationCode={"A03"} ref="A03" onClick={this._handleClickStation.bind(null, "Dupont Circle", "A03")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Dupont Circle", "A03")} onTapOutage={this._handleTapOutage.bind(null, "Dupont Circle", "A03")} />
          <BetweenStationRow code={'A03_A04'} isOnLeft={true} />
          <BetweenStationRow code={'A04_A03'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Woodley Park"} stationCode={"A04"} ref="A04" onClick={this._handleClickStation.bind(null, "Woodley Park", "A04")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Woodley Park", "A04")} onTapOutage={this._handleTapOutage.bind(null, "Woodley Park", "A04")} />
          <BetweenStationRow code={'A04_A05'} isOnLeft={true} />
          <BetweenStationRow code={'A05_A04'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Cleveland Park"} stationCode={"A05"} ref="A05" onClick={this._handleClickStation.bind(null, "Cleveland Park", "A05")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Cleveland Park", "A05")} onTapOutage={this._handleTapOutage.bind(null, "Cleveland Park", "A05")} />
          <BetweenStationRow code={'A05_A06'} isOnLeft={true} />
          <BetweenStationRow code={'A06_A05'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Van Ness–UDC"} stationCode={"A06"} ref="A06" onClick={this._handleClickStation.bind(null, "Van Ness–UDC", "A06")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Van Ness–UDC", "A06")} onTapOutage={this._handleTapOutage.bind(null, "Van Ness–UDC", "A06")} />
          <BetweenStationRow code={'A06_A07'} isOnLeft={true} />
          <BetweenStationRow code={'A07_A06'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Tenleytown–AU"} stationCode={"A07"} ref="A07" onClick={this._handleClickStation.bind(null, "Tenleytown–AU", "A07")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Tenleytown–AU", "A07")} onTapOutage={this._handleTapOutage.bind(null, "Tenleytown–AU", "A07")} />
          <BetweenStationRow code={'A07_A08'} isOnLeft={true} />
          <BetweenStationRow code={'A08_A07'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Friendship Heights"} stationCode={"A08"} ref="A08" onClick={this._handleClickStation.bind(null, "Friendship Heights", "A08")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Friendship Heights", "A08")} onTapOutage={this._handleTapOutage.bind(null, "Friendship Heights", "A08")} />
          <BetweenStationRow code={'A08_A09'} isOnLeft={true} />
          <BetweenStationRow code={'A09_A08'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Bethesda"} stationCode={"A09"} ref="A09" onClick={this._handleClickStation.bind(null, "Bethesda", "A09")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Bethesda", "A09")} onTapOutage={this._handleTapOutage.bind(null, "Bethesda", "A09")} />
          <BetweenStationRow code={'A09_A10'} isOnLeft={true} />
          <BetweenStationRow code={'A10_A09'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Medical Center"} stationCode={"A10"} ref="A10" onClick={this._handleClickStation.bind(null, "Medical Center", "A10")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Medical Center", "A10")} onTapOutage={this._handleTapOutage.bind(null, "Medical Center", "A10")} />
          <BetweenStationRow code={'A10_A11'} isOnLeft={true} />
          <BetweenStationRow code={'A11_A10'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Grosvenor–Strathmore"} stationCode={"A11"} ref="A11" onClick={this._handleClickStation.bind(null, "Grosvenor–Strathmore", "A11")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Grosvenor–Strathmore", "A11")} onTapOutage={this._handleTapOutage.bind(null, "Grosvenor–Strathmore", "A11")} />
          <BetweenStationRow code={'A11_A12'} isOnLeft={true} />
          <BetweenStationRow code={'A12_A11'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"North Bethesda"} stationCode={"A12"} ref="A12" onClick={this._handleClickStation.bind(null, "North Bethesda", "A12")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "North Bethesda", "A12")} onTapOutage={this._handleTapOutage.bind(null, "North Bethesda", "A12")} />
          <BetweenStationRow code={'A12_A13'} isOnLeft={true} />
          <BetweenStationRow code={'A13_A12'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Twinbrook"} stationCode={"A13"} ref="A13" onClick={this._handleClickStation.bind(null, "Twinbrook", "A13")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Twinbrook", "A13")} onTapOutage={this._handleTapOutage.bind(null, "Twinbrook", "A13")} />
          <BetweenStationRow code={'A13_A14'} isOnLeft={true} />
          <BetweenStationRow code={'A14_A13'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Rockville"} stationCode={"A14"} ref="A14" onClick={this._handleClickStation.bind(null, "Rockville", "A14")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Rockville", "A14")} onTapOutage={this._handleTapOutage.bind(null, "Rockville", "A14")} />
          <BetweenStationRow code={'A14_A15'} isOnLeft={true} />
          <BetweenStationRow code={'A15_A14'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Shady Grove"} stationCode={"A15"} ref="A15" onClick={this._handleClickStation.bind(null, "Shady Grove", "A15")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Shady Grove", "A15")} onTapOutage={this._handleTapOutage.bind(null, "Shady Grove", "A15")} />
        </div>
      );
    } else if (this.props.lineColor === 'orange') {
      stations = orange_stations.Stations;
      lineContent = (
        <div ref='anchor' className='colored-line-content'>
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"New Carrollton"} stationCode={"D13"} ref="D13" onClick={this._handleClickStation.bind(null, "New Carrollton", "D13")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "New Carrollton", "D13")} onTapOutage={this._handleTapOutage.bind(null, "New Carrollton", "D13")} />
          <BetweenStationRow code={'D13_D12'} isOnLeft={true} />
          <BetweenStationRow code={'D12_D13'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Landover"} stationCode={"D12"} ref="D12" onClick={this._handleClickStation.bind(null, "Landover", "D12")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Landover", "D12")} onTapOutage={this._handleTapOutage.bind(null, "Landover", "D12")} />
          <BetweenStationRow code={'D12_D11'} isOnLeft={true} />
          <BetweenStationRow code={'D11_D12'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Cheverly"} stationCode={"D11"} ref="D11" onClick={this._handleClickStation.bind(null, "Cheverly", "D11")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Cheverly", "D11")} onTapOutage={this._handleTapOutage.bind(null, "Cheverly", "D11")} />
          <BetweenStationRow code={'D11_D10'} isOnLeft={true} />
          <BetweenStationRow code={'D10_D11'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Deanwood"} stationCode={"D10"} ref="D10" onClick={this._handleClickStation.bind(null, "Deanwood", "D10")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Deanwood", "D10")} onTapOutage={this._handleTapOutage.bind(null, "Deanwood", "D10")} />
          <BetweenStationRow code={'D10_D09'} isOnLeft={true} />
          <BetweenStationRow code={'D09_D10'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Minnesota Avenue"} stationCode={"D09"} ref="D09" onClick={this._handleClickStation.bind(null, "Minnesota Avenue", "D09")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Minnesota Avenue", "D09")} onTapOutage={this._handleTapOutage.bind(null, "Minnesota Avenue", "D09")} />
          <BetweenStationRow code={'D09_D08'} isOnLeft={true} />
          <BetweenStationRow code={'D08_D09'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Stadium–Armory"} stationCode={"D08"} ref="D08" onClick={this._handleClickStation.bind(null, "Stadium–Armory", "D08")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Stadium–Armory", "D08")} onTapOutage={this._handleTapOutage.bind(null, "Stadium–Armory", "D08")} fromLineCodes={this.lineCodes.BL_SV} />
          <BetweenStationRow code={'D08_D07'} isOnLeft={true} />
          <BetweenStationRow code={'D07_D08'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Potomac Avenue"} stationCode={"D07"} ref="D07" onClick={this._handleClickStation.bind(null, "Potomac Avenue", "D07")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Potomac Avenue", "D07")} onTapOutage={this._handleTapOutage.bind(null, "Potomac Avenue", "D07")} />
          <BetweenStationRow code={'D07_D06'} isOnLeft={true} />
          <BetweenStationRow code={'D06_D07'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Eastern Market"} stationCode={"D06"} ref="D06" onClick={this._handleClickStation.bind(null, "Eastern Market", "D06")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Eastern Market", "D06")} onTapOutage={this._handleTapOutage.bind(null, "Eastern Market", "D06")} />
          <BetweenStationRow code={'D06_D05'} isOnLeft={true} />
          <BetweenStationRow code={'D05_D06'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Capitol South"} stationCode={"D05"} ref="D05" onClick={this._handleClickStation.bind(null, "Capitol South", "D05")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Capitol South", "D05")} onTapOutage={this._handleTapOutage.bind(null, "Capitol South", "D05")} />
          <BetweenStationRow code={'D05_D04'} isOnLeft={true} />
          <BetweenStationRow code={'D04_D05'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Federal Center SW"} stationCode={"D04"} ref="D04" onClick={this._handleClickStation.bind(null, "Federal Center SW", "D04")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Federal Center SW", "D04")} onTapOutage={this._handleTapOutage.bind(null, "Federal Center SW", "D04")} />
          <BetweenStationRow code={'D04_D03'} isOnLeft={true} />
          <BetweenStationRow code={'D03_D04'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"L'Enfant Plaza"} stationCode={"D03"} ref="D03" onClick={this._handleClickStation.bind(null, "L'Enfant Plaza", "D03")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "L'Enfant Plaza", "D03")} onTapOutage={this._handleTapOutage.bind(null, "L'Enfant Plaza", "D03")} fromLineCodes={this.lineCodes.GR_YL} toLineCodes={this.lineCodes.YL_GR} />
          <BetweenStationRow code={'D03_D02'} isOnLeft={true} />
          <BetweenStationRow code={'D02_D03'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Smithsonian"} stationCode={"D02"} ref="D02" onClick={this._handleClickStation.bind(null, "Smithsonian", "D02")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Smithsonian", "D02")} onTapOutage={this._handleTapOutage.bind(null, "Smithsonian", "D02")} />
          <BetweenStationRow code={'D02_D01'} isOnLeft={true} />
          <BetweenStationRow code={'D01_D02'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Federal Triangle"} stationCode={"D01"} ref="D01" onClick={this._handleClickStation.bind(null, "Federal Triangle", "D01")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Federal Triangle", "D01")} onTapOutage={this._handleTapOutage.bind(null, "Federal Triangle", "D01")} />
          <BetweenStationRow code={'D01_C01'} isOnLeft={true} />
          <BetweenStationRow code={'C01_D01'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Metro Center"} stationCode={"C01"} ref="C01" onClick={this._handleClickStation.bind(null, "Metro Center", "C01")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Metro Center", "C01")} onTapOutage={this._handleTapOutage.bind(null, "Metro Center", "C01")} fromLineCodes={this.lineCodes.RD} toLineCodes={this.lineCodes.RD} />
          <BetweenStationRow code={'C01_C02'} isOnLeft={true} />
          <BetweenStationRow code={'C02_C01'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"McPherson Square"} stationCode={"C02"} ref="C02" onClick={this._handleClickStation.bind(null, "McPherson Square", "C02")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "McPherson Square", "C02")} onTapOutage={this._handleTapOutage.bind(null, "McPherson Square", "C02")} />
          <BetweenStationRow code={'C02_C03'} isOnLeft={true} />
          <BetweenStationRow code={'C03_C02'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Farragut West"} stationCode={"C03"} ref="C03" onClick={this._handleClickStation.bind(null, "Farragut West", "C03")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Farragut West", "C03")} onTapOutage={this._handleTapOutage.bind(null, "Farragut West", "C03")} />
          <BetweenStationRow code={'C03_C04'} isOnLeft={true} />
          <BetweenStationRow code={'C04_C03'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Foggy Bottom–GWU"} stationCode={"C04"} ref="C04" onClick={this._handleClickStation.bind(null, "Foggy Bottom–GWU", "C04")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Foggy Bottom–GWU", "C04")} onTapOutage={this._handleTapOutage.bind(null, "Foggy Bottom–GWU", "C04")} />
          <BetweenStationRow code={'C04_C05'} isOnLeft={true} />
          <BetweenStationRow code={'C05_C04'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Rosslyn"} stationCode={"C05"} ref="C05" onClick={this._handleClickStation.bind(null, "Rosslyn", "C05")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Rosslyn", "C05")} onTapOutage={this._handleTapOutage.bind(null, "Rosslyn", "C05")} toLineCodes={this.lineCodes.BL} />
          <BetweenStationRow code={'C05_K01'} isOnLeft={true} />
          <BetweenStationRow code={'K01_C05'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Court House"} stationCode={"K01"} ref="K01" onClick={this._handleClickStation.bind(null, "Court House", "K01")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Court House", "K01")} onTapOutage={this._handleTapOutage.bind(null, "Court House", "K01")} />
          <BetweenStationRow code={'K01_K02'} isOnLeft={true} />
          <BetweenStationRow code={'K02_K01'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Clarendon"} stationCode={"K02"} ref="K02" onClick={this._handleClickStation.bind(null, "Clarendon", "K02")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Clarendon", "K02")} onTapOutage={this._handleTapOutage.bind(null, "Clarendon", "K02")} />
          <BetweenStationRow code={'K02_K03'} isOnLeft={true} />
          <BetweenStationRow code={'K03_K02'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Virginia Square–GMU"} stationCode={"K03"} ref="K03" onClick={this._handleClickStation.bind(null, "Virginia Square–GMU", "K03")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Virginia Square–GMU", "K03")} onTapOutage={this._handleTapOutage.bind(null, "Virginia Square–GMU", "K03")} />
          <BetweenStationRow code={'K03_K04'} isOnLeft={true} />
          <BetweenStationRow code={'K04_K03'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Ballston–MU"} stationCode={"K04"} ref="K04" onClick={this._handleClickStation.bind(null, "Ballston–MU", "K04")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Ballston–MU", "K04")} onTapOutage={this._handleTapOutage.bind(null, "Ballston–MU", "K04")} />
          <BetweenStationRow code={'K04_K05'} isOnLeft={true} />
          <BetweenStationRow code={'K05_K04'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"East Falls Church"} stationCode={"K05"} ref="K05" onClick={this._handleClickStation.bind(null, "East Falls Church", "K05")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "East Falls Church", "K05")} onTapOutage={this._handleTapOutage.bind(null, "East Falls Church", "K05")} toLineCodes={this.lineCodes.SV} />
          <BetweenStationRow code={'K05_K06'} isOnLeft={true} />
          <BetweenStationRow code={'K06_K05'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"West Falls Church"} stationCode={"K06"} ref="K06" onClick={this._handleClickStation.bind(null, "West Falls Church", "K06")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "West Falls Church", "K06")} onTapOutage={this._handleTapOutage.bind(null, "West Falls Church", "K06")} />
          <BetweenStationRow code={'K06_K07'} isOnLeft={true} />
          <BetweenStationRow code={'K07_K06'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Dunn Loring"} stationCode={"K07"} ref="K07" onClick={this._handleClickStation.bind(null, "Dunn Loring", "K07")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Dunn Loring", "K07")} onTapOutage={this._handleTapOutage.bind(null, "Dunn Loring", "K07")} />
          <BetweenStationRow code={'K07_K08'} isOnLeft={true} />
          <BetweenStationRow code={'K08_K07'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Vienna"} stationCode={"K08"} ref="K08" onClick={this._handleClickStation.bind(null, "Vienna", "K08")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Vienna", "K08")} onTapOutage={this._handleTapOutage.bind(null, "Vienna", "K08")} />
        </div>
      );
    } else if (this.props.lineColor === 'silver') {
      stations = silver_stations.Stations;
      lineContent = (
        <div ref='anchor' className='colored-line-content'>
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Downtown Largo"} stationCode={"G05"} ref="G05" onClick={this._handleClickStation.bind(null, "Downtown Largo", "G05")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Downtown Largo", "G05")} onTapOutage={this._handleTapOutage.bind(null, "Downtown Largo", "G05")} />
          <BetweenStationRow code={'G05_G04'} isOnLeft={true} />
          <BetweenStationRow code={'G04_G05'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Morgan Boulevard"} stationCode={"G04"} ref="G04" onClick={this._handleClickStation.bind(null, "Morgan Boulevard", "G04")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Morgan Boulevard", "G04")} onTapOutage={this._handleTapOutage.bind(null, "Morgan Boulevard", "G04")} />
          <BetweenStationRow code={'G04_G03'} isOnLeft={true} />
          <BetweenStationRow code={'G03_G04'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Addison Road"} stationCode={"G03"} ref="G03" onClick={this._handleClickStation.bind(null, "Addison Road", "G03")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Addison Road", "G03")} onTapOutage={this._handleTapOutage.bind(null, "Addison Road", "G03")} />
          <BetweenStationRow code={'G03_G02'} isOnLeft={true} />
          <BetweenStationRow code={'G02_G03'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Capitol Heights"} stationCode={"G02"} ref="G02" onClick={this._handleClickStation.bind(null, "Capitol Heights", "G02")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Capitol Heights", "G02")} onTapOutage={this._handleTapOutage.bind(null, "Capitol Heights", "G02")} />
          <BetweenStationRow code={'G02_G01'} isOnLeft={true} />
          <BetweenStationRow code={'G01_G02'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Benning Road"} stationCode={"G01"} ref="G01" onClick={this._handleClickStation.bind(null, "Benning Road", "G01")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Benning Road", "G01")} onTapOutage={this._handleTapOutage.bind(null, "Benning Road", "G01")} />
          <BetweenStationRow code={'G01_D08'} isOnLeft={true} />
          <BetweenStationRow code={'D08_G01'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Stadium–Armory"} stationCode={"D08"} ref="D08" onClick={this._handleClickStation.bind(null, "Stadium–Armory", "D08")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Stadium–Armory", "D08")} onTapOutage={this._handleTapOutage.bind(null, "Stadium–Armory", "D08")} fromLineCodes={this.lineCodes.OR} />
          <BetweenStationRow code={'D08_D07'} isOnLeft={true} />
          <BetweenStationRow code={'D07_D08'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Potomac Avenue"} stationCode={"D07"} ref="D07" onClick={this._handleClickStation.bind(null, "Potomac Avenue", "D07")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Potomac Avenue", "D07")} onTapOutage={this._handleTapOutage.bind(null, "Potomac Avenue", "D07")} />
          <BetweenStationRow code={'D07_D06'} isOnLeft={true} />
          <BetweenStationRow code={'D06_D07'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Eastern Market"} stationCode={"D06"} ref="D06" onClick={this._handleClickStation.bind(null, "Eastern Market", "D06")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Eastern Market", "D06")} onTapOutage={this._handleTapOutage.bind(null, "Eastern Market", "D06")} />
          <BetweenStationRow code={'D06_D05'} isOnLeft={true} />
          <BetweenStationRow code={'D05_D06'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Capitol South"} stationCode={"D05"} ref="D05" onClick={this._handleClickStation.bind(null, "Capitol South", "D05")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Capitol South", "D05")} onTapOutage={this._handleTapOutage.bind(null, "Capitol South", "D05")} />
          <BetweenStationRow code={'D05_D04'} isOnLeft={true} />
          <BetweenStationRow code={'D04_D05'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Federal Center SW"} stationCode={"D04"} ref="D04" onClick={this._handleClickStation.bind(null, "Federal Center SW", "D04")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Federal Center SW", "D04")} onTapOutage={this._handleTapOutage.bind(null, "Federal Center SW", "D04")} />
          <BetweenStationRow code={'D04_D03'} isOnLeft={true} />
          <BetweenStationRow code={'D03_D04'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"L'Enfant Plaza"} stationCode={"D03"} ref="D03" onClick={this._handleClickStation.bind(null, "L'Enfant Plaza", "D03")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "L'Enfant Plaza", "D03")} onTapOutage={this._handleTapOutage.bind(null, "L'Enfant Plaza", "D03")} fromLineCodes={this.lineCodes.GR_YL} toLineCodes={this.lineCodes.YL_GR} />
          <BetweenStationRow code={'D03_D02'} isOnLeft={true} />
          <BetweenStationRow code={'D02_D03'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Smithsonian"} stationCode={"D02"} ref="D02" onClick={this._handleClickStation.bind(null, "Smithsonian", "D02")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Smithsonian", "D02")} onTapOutage={this._handleTapOutage.bind(null, "Smithsonian", "D02")} />
          <BetweenStationRow code={'D02_D01'} isOnLeft={true} />
          <BetweenStationRow code={'D01_D02'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Federal Triangle"} stationCode={"D01"} ref="D01" onClick={this._handleClickStation.bind(null, "Federal Triangle", "D01")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Federal Triangle", "D01")} onTapOutage={this._handleTapOutage.bind(null, "Federal Triangle", "D01")} />
          <BetweenStationRow code={'D01_C01'} isOnLeft={true} />
          <BetweenStationRow code={'C01_D01'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Metro Center"} stationCode={"C01"} ref="C01" onClick={this._handleClickStation.bind(null, "Metro Center", "C01")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Metro Center", "C01")} onTapOutage={this._handleTapOutage.bind(null, "Metro Center", "C01")} fromLineCodes={this.lineCodes.RD} toLineCodes={this.lineCodes.RD} />
          <BetweenStationRow code={'C01_C02'} isOnLeft={true} />
          <BetweenStationRow code={'C02_C01'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"McPherson Square"} stationCode={"C02"} ref="C02" onClick={this._handleClickStation.bind(null, "McPherson Square", "C02")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "McPherson Square", "C02")} onTapOutage={this._handleTapOutage.bind(null, "McPherson Square", "C02")} />
          <BetweenStationRow code={'C02_C03'} isOnLeft={true} />
          <BetweenStationRow code={'C03_C02'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Farragut West"} stationCode={"C03"} ref="C03" onClick={this._handleClickStation.bind(null, "Farragut West", "C03")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Farragut West", "C03")} onTapOutage={this._handleTapOutage.bind(null, "Farragut West", "C03")} />
          <BetweenStationRow code={'C03_C04'} isOnLeft={true} />
          <BetweenStationRow code={'C04_C03'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Foggy Bottom–GWU"} stationCode={"C04"} ref="C04" onClick={this._handleClickStation.bind(null, "Foggy Bottom–GWU", "C04")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Foggy Bottom–GWU", "C04")} onTapOutage={this._handleTapOutage.bind(null, "Foggy Bottom–GWU", "C04")} />
          <BetweenStationRow code={'C04_C05'} isOnLeft={true} />
          <BetweenStationRow code={'C05_C04'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Rosslyn"} stationCode={"C05"} ref="C05" onClick={this._handleClickStation.bind(null, "Rosslyn", "C05")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Rosslyn", "C05")} onTapOutage={this._handleTapOutage.bind(null, "Rosslyn", "C05")} toLineCodes={this.lineCodes.BL} />
          <BetweenStationRow code={'C05_K01'} isOnLeft={true} />
          <BetweenStationRow code={'K01_C05'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Court House"} stationCode={"K01"} ref="K01" onClick={this._handleClickStation.bind(null, "Court House", "K01")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Court House", "K01")} onTapOutage={this._handleTapOutage.bind(null, "Court House", "K01")} />
          <BetweenStationRow code={'K01_K02'} isOnLeft={true} />
          <BetweenStationRow code={'K02_K01'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Clarendon"} stationCode={"K02"} ref="K02" onClick={this._handleClickStation.bind(null, "Clarendon", "K02")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Clarendon", "K02")} onTapOutage={this._handleTapOutage.bind(null, "Clarendon", "K02")} />
          <BetweenStationRow code={'K02_K03'} isOnLeft={true} />
          <BetweenStationRow code={'K03_K02'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Virginia Square–GMU"} stationCode={"K03"} ref="K03" onClick={this._handleClickStation.bind(null, "Virginia Square–GMU", "K03")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Virginia Square–GMU", "K03")} onTapOutage={this._handleTapOutage.bind(null, "Virginia Square–GMU", "K03")} />
          <BetweenStationRow code={'K03_K04'} isOnLeft={true} />
          <BetweenStationRow code={'K04_K03'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Ballston–MU"} stationCode={"K04"} ref="K04" onClick={this._handleClickStation.bind(null, "Ballston–MU", "K04")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Ballston–MU", "K04")} onTapOutage={this._handleTapOutage.bind(null, "Ballston–MU", "K04")} />
          <BetweenStationRow code={'K04_K05'} isOnLeft={true} />
          <BetweenStationRow code={'K05_K04'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"East Falls Church"} stationCode={"K05"} ref="K05" onClick={this._handleClickStation.bind(null, "East Falls Church", "K05")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "East Falls Church", "K05")} onTapOutage={this._handleTapOutage.bind(null, "East Falls Church", "K05")} toLineCodes={this.lineCodes.OR} />
          <BetweenStationRow code={'K05_N01'} isOnLeft={true} />
          <BetweenStationRow code={'N01_K05'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"McLean"} stationCode={"N01"} ref="N01" onClick={this._handleClickStation.bind(null, "McLean", "N01")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "McLean", "N01")} onTapOutage={this._handleTapOutage.bind(null, "McLean", "N01")} />
          <BetweenStationRow code={'N01_N02'} isOnLeft={true} />
          <BetweenStationRow code={'N02_N01'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Tysons"} stationCode={"N02"} ref="N02" onClick={this._handleClickStation.bind(null, "Tysons", "N02")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Tysons", "N02")} onTapOutage={this._handleTapOutage.bind(null, "Tysons", "N02")} />
          <BetweenStationRow code={'N02_N03'} isOnLeft={true} />
          <BetweenStationRow code={'N03_N02'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Greensboro"} stationCode={"N03"} ref="N03" onClick={this._handleClickStation.bind(null, "Greensboro", "N03")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Greensboro", "N03")} onTapOutage={this._handleTapOutage.bind(null, "Greensboro", "N03")} />
          <BetweenStationRow code={'N03_N04'} isOnLeft={true} />
          <BetweenStationRow code={'N04_N03'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Spring Hill"} stationCode={"N04"} ref="N04" onClick={this._handleClickStation.bind(null, "Spring Hill", "N04")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Spring Hill", "N04")} onTapOutage={this._handleTapOutage.bind(null, "Spring Hill", "N04")} />
          <BetweenStationRow code={'N04_N06'} isOnLeft={true} />
          <BetweenStationRow code={'N06_N04'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Wiehle–Reston East"} stationCode={"N06"} ref="N06" onClick={this._handleClickStation.bind(null, "Wiehle–Reston East", "N06")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Wiehle–Reston East", "N06")} onTapOutage={this._handleTapOutage.bind(null, "Wiehle–Reston East", "N06")} />
          <BetweenStationRow code={'N06_N07'} isOnLeft={true} />
          <BetweenStationRow code={'N07_N06'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Reston Town Center"} stationCode={"N07"} ref="N07" onClick={this._handleClickStation.bind(null, "Reston Town Center", "N07")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Reston Town Center", "N07")} onTapOutage={this._handleTapOutage.bind(null, "Reston Town Center", "N07")} />
          <BetweenStationRow code={'N07_N08'} isOnLeft={true} />
          <BetweenStationRow code={'N08_N07'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Herndon"} stationCode={"N08"} ref="N08" onClick={this._handleClickStation.bind(null, "Herndon", "N08")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Herndon", "N08")} onTapOutage={this._handleTapOutage.bind(null, "Herndon", "N08")} />
          <BetweenStationRow code={'N08_N09'} isOnLeft={true} />
          <BetweenStationRow code={'N09_N08'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Innovation Center"} stationCode={"N09"} ref="N09" onClick={this._handleClickStation.bind(null, "Innovation Center", "N09")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Innovation Center", "N09")} onTapOutage={this._handleTapOutage.bind(null, "Innovation Center", "N09")} />
          <BetweenStationRow code={'N09_N10'} isOnLeft={true} />
          <BetweenStationRow code={'N10_N09'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Dulles International Airport"} stationCode={"N10"} ref="N10" onClick={this._handleClickStation.bind(null, "Dulles International Airport", "N10")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Dulles International Airport", "N10")} onTapOutage={this._handleTapOutage.bind(null, "Dulles International Airport", "N10")} />
          <BetweenStationRow code={'N10_N11'} isOnLeft={true} />
          <BetweenStationRow code={'N11_N10'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Loudoun Gateway"} stationCode={"N11"} ref="N11" onClick={this._handleClickStation.bind(null, "Loudoun Gateway", "N11")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Loudoun Gateway", "N11")} onTapOutage={this._handleTapOutage.bind(null, "Loudoun Gateway", "N11")} />
          <BetweenStationRow code={'N11_N12'} isOnLeft={true} />
          <BetweenStationRow code={'N12_N11'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Ashburn"} stationCode={"N12"} ref="N12" onClick={this._handleClickStation.bind(null, "Ashburn", "N12")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Ashburn", "N12")} onTapOutage={this._handleTapOutage.bind(null, "Ashburn", "N12")} />
        </div>
      );
    } else if (this.props.lineColor === 'blue') {
      stations = blue_stations.Stations;
      lineContent = (
        <div ref='anchor' className='colored-line-content'>
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Downtown Largo"} stationCode={"G05"} ref="G05" onClick={this._handleClickStation.bind(null, "Downtown Largo", "G05")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Downtown Largo", "G05")} onTapOutage={this._handleTapOutage.bind(null, "Downtown Largo", "G05")} />
          <BetweenStationRow code={'G05_G04'} isOnLeft={true} />
          <BetweenStationRow code={'G04_G05'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Morgan Boulevard"} stationCode={"G04"} ref="G04" onClick={this._handleClickStation.bind(null, "Morgan Boulevard", "G04")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Morgan Boulevard", "G04")} onTapOutage={this._handleTapOutage.bind(null, "Morgan Boulevard", "G04")} />
          <BetweenStationRow code={'G04_G03'} isOnLeft={true} />
          <BetweenStationRow code={'G03_G04'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Addison Road"} stationCode={"G03"} ref="G03" onClick={this._handleClickStation.bind(null, "Addison Road", "G03")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Addison Road", "G03")} onTapOutage={this._handleTapOutage.bind(null, "Addison Road", "G03")} />
          <BetweenStationRow code={'G03_G02'} isOnLeft={true} />
          <BetweenStationRow code={'G02_G03'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Capitol Heights"} stationCode={"G02"} ref="G02" onClick={this._handleClickStation.bind(null, "Capitol Heights", "G02")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Capitol Heights", "G02")} onTapOutage={this._handleTapOutage.bind(null, "Capitol Heights", "G02")} />
          <BetweenStationRow code={'G02_G01'} isOnLeft={true} />
          <BetweenStationRow code={'G01_G02'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Benning Road"} stationCode={"G01"} ref="G01" onClick={this._handleClickStation.bind(null, "Benning Road", "G01")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Benning Road", "G01")} onTapOutage={this._handleTapOutage.bind(null, "Benning Road", "G01")} />
          <BetweenStationRow code={'G01_D08'} isOnLeft={true} />
          <BetweenStationRow code={'D08_G01'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Stadium–Armory"} stationCode={"D08"} ref="D08" onClick={this._handleClickStation.bind(null, "Stadium–Armory", "D08")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Stadium–Armory", "D08")} onTapOutage={this._handleTapOutage.bind(null, "Stadium–Armory", "D08")} fromLineCodes={this.lineCodes.OR} />
          <BetweenStationRow code={'D08_D07'} isOnLeft={true} />
          <BetweenStationRow code={'D07_D08'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Potomac Avenue"} stationCode={"D07"} ref="D07" onClick={this._handleClickStation.bind(null, "Potomac Avenue", "D07")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Potomac Avenue", "D07")} onTapOutage={this._handleTapOutage.bind(null, "Potomac Avenue", "D07")} />
          <BetweenStationRow code={'D07_D06'} isOnLeft={true} />
          <BetweenStationRow code={'D06_D07'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Eastern Market"} stationCode={"D06"} ref="D06" onClick={this._handleClickStation.bind(null, "Eastern Market", "D06")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Eastern Market", "D06")} onTapOutage={this._handleTapOutage.bind(null, "Eastern Market", "D06")} />
          <BetweenStationRow code={'D06_D05'} isOnLeft={true} />
          <BetweenStationRow code={'D05_D06'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Capitol South"} stationCode={"D05"} ref="D05" onClick={this._handleClickStation.bind(null, "Capitol South", "D05")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Capitol South", "D05")} onTapOutage={this._handleTapOutage.bind(null, "Capitol South", "D05")} />
          <BetweenStationRow code={'D05_D04'} isOnLeft={true} />
          <BetweenStationRow code={'D04_D05'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Federal Center SW"} stationCode={"D04"} ref="D04" onClick={this._handleClickStation.bind(null, "Federal Center SW", "D04")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Federal Center SW", "D04")} onTapOutage={this._handleTapOutage.bind(null, "Federal Center SW", "D04")} />
          <BetweenStationRow code={'D04_D03'} isOnLeft={true} />
          <BetweenStationRow code={'D03_D04'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"L'Enfant Plaza"} stationCode={"D03"} ref="D03" onClick={this._handleClickStation.bind(null, "L'Enfant Plaza", "D03")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "L'Enfant Plaza", "D03")} onTapOutage={this._handleTapOutage.bind(null, "L'Enfant Plaza", "D03")} fromLineCodes={this.lineCodes.GR_YL} toLineCodes={this.lineCodes.YL_GR} />
          <BetweenStationRow code={'D03_D02'} isOnLeft={true} />
          <BetweenStationRow code={'D02_D03'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Smithsonian"} stationCode={"D02"} ref="D02" onClick={this._handleClickStation.bind(null, "Smithsonian", "D02")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Smithsonian", "D02")} onTapOutage={this._handleTapOutage.bind(null, "Smithsonian", "D02")} />
          <BetweenStationRow code={'D02_D01'} isOnLeft={true} />
          <BetweenStationRow code={'D01_D02'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Federal Triangle"} stationCode={"D01"} ref="D01" onClick={this._handleClickStation.bind(null, "Federal Triangle", "D01")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Federal Triangle", "D01")} onTapOutage={this._handleTapOutage.bind(null, "Federal Triangle", "D01")} />
          <BetweenStationRow code={'D01_C01'} isOnLeft={true} />
          <BetweenStationRow code={'C01_D01'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Metro Center"} stationCode={"C01"} ref="C01" onClick={this._handleClickStation.bind(null, "Metro Center", "C01")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Metro Center", "C01")} onTapOutage={this._handleTapOutage.bind(null, "Metro Center", "C01")} fromLineCodes={this.lineCodes.RD} toLineCodes={this.lineCodes.RD} />
          <BetweenStationRow code={'C01_C02'} isOnLeft={true} />
          <BetweenStationRow code={'C02_C01'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"McPherson Square"} stationCode={"C02"} ref="C02" onClick={this._handleClickStation.bind(null, "McPherson Square", "C02")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "McPherson Square", "C02")} onTapOutage={this._handleTapOutage.bind(null, "McPherson Square", "C02")} />
          <BetweenStationRow code={'C02_C03'} isOnLeft={true} />
          <BetweenStationRow code={'C03_C02'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Farragut West"} stationCode={"C03"} ref="C03" onClick={this._handleClickStation.bind(null, "Farragut West", "C03")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Farragut West", "C03")} onTapOutage={this._handleTapOutage.bind(null, "Farragut West", "C03")} />
          <BetweenStationRow code={'C03_C04'} isOnLeft={true} />
          <BetweenStationRow code={'C04_C03'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Foggy Bottom – GWU"} stationCode={"C04"} ref="C04" onClick={this._handleClickStation.bind(null, "Foggy Bottom – GWU", "C04")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Foggy Bottom – GWU", "C04")} onTapOutage={this._handleTapOutage.bind(null, "Foggy Bottom – GWU", "C04")} />
          <BetweenStationRow code={'C04_C05'} isOnLeft={true} />
          <BetweenStationRow code={'C05_C04'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Rosslyn"} stationCode={"C05"} ref="C05" onClick={this._handleClickStation.bind(null, "Rosslyn", "C05")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Rosslyn", "C05")} onTapOutage={this._handleTapOutage.bind(null, "Rosslyn", "C05")} toLineCodes={this.lineCodes.OR_SV} />
          <BetweenStationRow code={'C05_C06'} isOnLeft={true} />
          <BetweenStationRow code={'C06_C05'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Arlington Cemetery"} stationCode={"C06"} ref="C06" onClick={this._handleClickStation.bind(null, "Arlington Cemetery", "C06")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Arlington Cemetery", "C06")} onTapOutage={this._handleTapOutage.bind(null, "Arlington Cemetery", "C06")} />
          <BetweenStationRow code={'C06_C07'} isOnLeft={true} />
          <BetweenStationRow code={'C07_C06'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Pentagon"} stationCode={"C07"} ref="C07" onClick={this._handleClickStation.bind(null, "Pentagon", "C07")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Pentagon", "C07")} onTapOutage={this._handleTapOutage.bind(null, "Pentagon", "C07")} fromLineCodes={this.lineCodes.YL} />
          <BetweenStationRow code={'C07_C08'} isOnLeft={true} />
          <BetweenStationRow code={'C08_C07'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Pentagon City"} stationCode={"C08"} ref="C08" onClick={this._handleClickStation.bind(null, "Pentagon City", "C08")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Pentagon City", "C08")} onTapOutage={this._handleTapOutage.bind(null, "Pentagon City", "C08")} />
          <BetweenStationRow code={'C08_C09'} isOnLeft={true} />
          <BetweenStationRow code={'C09_C08'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Crystal City"} stationCode={"C09"} ref="C09" onClick={this._handleClickStation.bind(null, "Crystal City", "C09")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Crystal City", "C09")} onTapOutage={this._handleTapOutage.bind(null, "Crystal City", "C09")} />
          <BetweenStationRow code={'C09_C10'} isOnLeft={true} />
          <BetweenStationRow code={'C10_C09'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Ronald Reagan Washington National Airport"} stationCode={"C10"} ref="C10" onClick={this._handleClickStation.bind(null, "Ronald Reagan Washington National Airport", "C10")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Ronald Reagan Washington National Airport", "C10")} onTapOutage={this._handleTapOutage.bind(null, "Ronald Reagan Washington National Airport", "C10")} />
          <BetweenStationRow code={'C10_C12'} isOnLeft={true} />
          <BetweenStationRow code={'C12_C10'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Braddock Road"} stationCode={"C12"} ref="C12" onClick={this._handleClickStation.bind(null, "Braddock Road", "C12")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Braddock Road", "C12")} onTapOutage={this._handleTapOutage.bind(null, "Braddock Road", "C12")} />
          <BetweenStationRow code={'C12_C13'} isOnLeft={true} />
          <BetweenStationRow code={'C13_C12'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"King Street – Old Town"} stationCode={"C13"} ref="C13" onClick={this._handleClickStation.bind(null, "King Street – Old Town", "C13")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "King Street – Old Town", "C13")} onTapOutage={this._handleTapOutage.bind(null, "King Street – Old Town", "C13")} toLineCodes={this.lineCodes.YL} />
          <BetweenStationRow code={'C13_J02'} isOnLeft={true} />
          <BetweenStationRow code={'J02_C13'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Van Dorn Street"} stationCode={"J02"} ref="J02" onClick={this._handleClickStation.bind(null, "Van Dorn Street", "J02")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Van Dorn Street", "J02")} onTapOutage={this._handleTapOutage.bind(null, "Van Dorn Street", "J02")} />
          <BetweenStationRow code={'J02_J03'} isOnLeft={true} />
          <BetweenStationRow code={'J03_J02'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Franconia–Springfield"} stationCode={"J03"} ref="J03" onClick={this._handleClickStation.bind(null, "Franconia–Springfield", "J03")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Franconia–Springfield", "J03")} onTapOutage={this._handleTapOutage.bind(null, "Franconia–Springfield", "J03")} />
        </div>
      );
    } else if (this.props.lineColor === 'yellow') {
      stations = yellow_stations.Stations;
      lineContent = (
        <div ref='anchor' className='colored-line-content'>
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Greenbelt"} stationCode={"E10"} ref="E10" onClick={this._handleClickStation.bind(null, "Greenbelt", "E10")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Greenbelt", "E10")} onTapOutage={this._handleTapOutage.bind(null, "Greenbelt", "E10")} />
          <BetweenStationRow code={'E10_E09'} isOnLeft={true} />
          <BetweenStationRow code={'E09_E10'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"College Park – University of Maryland"} stationCode={"E09"} ref="E09" onClick={this._handleClickStation.bind(null, "College Park – University of Maryland", "E09")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "College Park – University of Maryland", "E09")} onTapOutage={this._handleTapOutage.bind(null, "College Park – University of Maryland", "E09")} />
          <BetweenStationRow code={'E09_E08'} isOnLeft={true} />
          <BetweenStationRow code={'E08_E09'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Hyattsville Crossing"} stationCode={"E08"} ref="E08" onClick={this._handleClickStation.bind(null, "Hyattsville Crossing", "E08")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Hyattsville Crossing", "E08")} onTapOutage={this._handleTapOutage.bind(null, "Hyattsville Crossing", "E08")} />
          <BetweenStationRow code={'E08_E07'} isOnLeft={true} />
          <BetweenStationRow code={'E07_E08'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"West Hyattsville"} stationCode={"E07"} ref="E07" onClick={this._handleClickStation.bind(null, "West Hyattsville", "E07")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "West Hyattsville", "E07")} onTapOutage={this._handleTapOutage.bind(null, "West Hyattsville", "E07")} />
          <BetweenStationRow code={'E07_E06'} isOnLeft={true} />
          <BetweenStationRow code={'E06_E07'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Fort Totten"} stationCode={"E06"} ref="E06" onClick={this._handleClickStation.bind(null, "Fort Totten", "E06")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Fort Totten", "E06")} onTapOutage={this._handleTapOutage.bind(null, "Fort Totten", "E06")} fromLineCodes={this.lineCodes.RD} toLineCodes={this.lineCodes.RD} />
          <BetweenStationRow code={'E06_E05'} isOnLeft={true} />
          <BetweenStationRow code={'E05_E06'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Georgia Avenue – Petworth"} stationCode={"E05"} ref="E05" onClick={this._handleClickStation.bind(null, "Georgia Avenue – Petworth", "E05")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Georgia Avenue – Petworth", "E05")} onTapOutage={this._handleTapOutage.bind(null, "Georgia Avenue – Petworth", "E05")} />
          <BetweenStationRow code={'E05_E04'} isOnLeft={true} />
          <BetweenStationRow code={'E04_E05'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Columbia Heights"} stationCode={"E04"} ref="E04" onClick={this._handleClickStation.bind(null, "Columbia Heights", "E04")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Columbia Heights", "E04")} onTapOutage={this._handleTapOutage.bind(null, "Columbia Heights", "E04")} />
          <BetweenStationRow code={'E04_E03'} isOnLeft={true} />
          <BetweenStationRow code={'E03_E04'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"U Street"} stationCode={"E03"} ref="E03" onClick={this._handleClickStation.bind(null, "U Street", "E03")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "U Street", "E03")} onTapOutage={this._handleTapOutage.bind(null, "U Street", "E03")} />
          <BetweenStationRow code={'E03_E02'} isOnLeft={true} />
          <BetweenStationRow code={'E02_E03'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Shaw – Howard University"} stationCode={"E02"} ref="E02" onClick={this._handleClickStation.bind(null, "Shaw – Howard University", "E02")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Shaw – Howard University", "E02")} onTapOutage={this._handleTapOutage.bind(null, "Shaw – Howard University", "E02")} />
          <BetweenStationRow code={'E02_E01'} isOnLeft={true} />
          <BetweenStationRow code={'E01_E02'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Mount Vernon Square"} stationCode={"E01"} ref="E01" onClick={this._handleClickStation.bind(null, "Mount Vernon Square", "E01")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Mount Vernon Square", "E01")} onTapOutage={this._handleTapOutage.bind(null, "Mount Vernon Square", "E01")} />
          <BetweenStationRow code={'E01_F01'} isOnLeft={true} />
          <BetweenStationRow code={'F01_E01'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Gallery Place"} stationCode={"F01"} ref="F01" onClick={this._handleClickStation.bind(null, "Gallery Place", "F01")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Gallery Place", "F01")} onTapOutage={this._handleTapOutage.bind(null, "Gallery Place", "F01")} fromLineCodes={this.lineCodes.RD} toLineCodes={this.lineCodes.RD} />
          <BetweenStationRow code={'F01_F02'} isOnLeft={true} />
          <BetweenStationRow code={'F02_F01'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Archives – Navy Memorial – Penn Quarter"} stationCode={"F02"} ref="F02" onClick={this._handleClickStation.bind(null, "Archives – Navy Memorial – Penn Quarter", "F02")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Archives – Navy Memorial – Penn Quarter", "F02")} onTapOutage={this._handleTapOutage.bind(null, "Archives – Navy Memorial – Penn Quarter", "F02")} />
          <BetweenStationRow code={'F02_F03'} isOnLeft={true} />
          <BetweenStationRow code={'F03_F02'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"L'Enfant Plaza"} stationCode={"F03"} ref="F03" onClick={this._handleClickStation.bind(null, "L'Enfant Plaza", "F03")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "L'Enfant Plaza", "F03")} onTapOutage={this._handleTapOutage.bind(null, "L'Enfant Plaza", "F03")} toLineCodes={this.lineCodes.SV_OR_BL_GR} fromLineCodes={this.lineCodes.BL_OR_SV} />
          <BetweenStationRow code={'F03_C07'} isOnLeft={true} />
          <BetweenStationRow code={'C07_F03'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Pentagon"} stationCode={"C07"} ref="C07" onClick={this._handleClickStation.bind(null, "Pentagon", "C07")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Pentagon", "C07")} onTapOutage={this._handleTapOutage.bind(null, "Pentagon", "C07")} fromLineCodes={this.lineCodes.BL} />
          <BetweenStationRow code={'C07_C08'} isOnLeft={true} />
          <BetweenStationRow code={'C08_C07'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Pentagon City"} stationCode={"C08"} ref="C08" onClick={this._handleClickStation.bind(null, "Pentagon City", "C08")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Pentagon City", "C08")} onTapOutage={this._handleTapOutage.bind(null, "Pentagon City", "C08")} />
          <BetweenStationRow code={'C08_C09'} isOnLeft={true} />
          <BetweenStationRow code={'C09_C08'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Crystal City"} stationCode={"C09"} ref="C09" onClick={this._handleClickStation.bind(null, "Crystal City", "C09")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Crystal City", "C09")} onTapOutage={this._handleTapOutage.bind(null, "Crystal City", "C09")} />
          <BetweenStationRow code={'C09_C10'} isOnLeft={true} />
          <BetweenStationRow code={'C10_C09'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Ronald Reagan Washington National Airport"} stationCode={"C10"} ref="C10" onClick={this._handleClickStation.bind(null, "Ronald Reagan Washington National Airport", "C10")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Ronald Reagan Washington National Airport", "C10")} onTapOutage={this._handleTapOutage.bind(null, "Ronald Reagan Washington National Airport", "C10")} />
          <BetweenStationRow code={'C10_C12'} isOnLeft={true} />
          <BetweenStationRow code={'C12_C10'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Braddock Road"} stationCode={"C12"} ref="C12" onClick={this._handleClickStation.bind(null, "Braddock Road", "C12")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Braddock Road", "C12")} onTapOutage={this._handleTapOutage.bind(null, "Braddock Road", "C12")} />
          <BetweenStationRow code={'C12_C13'} isOnLeft={true} />
          <BetweenStationRow code={'C13_C12'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"King Street – Old Town"} stationCode={"C13"} ref="C13" onClick={this._handleClickStation.bind(null, "King Street – Old Town", "C13")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "King Street – Old Town", "C13")} onTapOutage={this._handleTapOutage.bind(null, "King Street – Old Town", "C13")} toLineCodes={this.lineCodes.BL} />
          <BetweenStationRow code={'C13_C14'} isOnLeft={true} />
          <BetweenStationRow code={'C14_C13'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Eisenhower Avenue"} stationCode={"C14"} ref="C14" onClick={this._handleClickStation.bind(null, "Eisenhower Avenue", "C14")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Eisenhower Avenue", "C14")} onTapOutage={this._handleTapOutage.bind(null, "Eisenhower Avenue", "C14")} />
          <BetweenStationRow code={'C14_C15'} isOnLeft={true} />
          <BetweenStationRow code={'C15_C14'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Huntington"} stationCode={"C15"} ref="C15" onClick={this._handleClickStation.bind(null, "Huntington", "C15")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Huntington", "C15")} onTapOutage={this._handleTapOutage.bind(null, "Huntington", "C15")} />
        </div>
      );
    } else if (this.props.lineColor === 'green') {
      stations = green_stations.Stations;
      lineContent = (
        <div ref='anchor' className='colored-line-content'>
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Greenbelt"} stationCode={"E10"} ref="E10" onClick={this._handleClickStation.bind(null, "Greenbelt", "E10")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Greenbelt", "E10")} onTapOutage={this._handleTapOutage.bind(null, "Greenbelt", "E10")} />
          <BetweenStationRow code={'E10_E09'} isOnLeft={true} />
          <BetweenStationRow code={'E09_E10'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"College Park – University of Maryland"} stationCode={"E09"} ref="E09" onClick={this._handleClickStation.bind(null, "College Park – University of Maryland", "E09")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "College Park – University of Maryland", "E09")} onTapOutage={this._handleTapOutage.bind(null, "College Park – University of Maryland", "E09")} />
          <BetweenStationRow code={'E09_E08'} isOnLeft={true} />
          <BetweenStationRow code={'E08_E09'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Hyattsville Crossing"} stationCode={"E08"} ref="E08" onClick={this._handleClickStation.bind(null, "Hyattsville Crossing", "E08")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Hyattsville Crossing", "E08")} onTapOutage={this._handleTapOutage.bind(null, "Hyattsville Crossing", "E08")} />
          <BetweenStationRow code={'E08_E07'} isOnLeft={true} />
          <BetweenStationRow code={'E07_E08'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"West Hyattsville"} stationCode={"E07"} ref="E07" onClick={this._handleClickStation.bind(null, "West Hyattsville", "E07")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "West Hyattsville", "E07")} onTapOutage={this._handleTapOutage.bind(null, "West Hyattsville", "E07")} />
          <BetweenStationRow code={'E07_E06'} isOnLeft={true} />
          <BetweenStationRow code={'E06_E07'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Fort Totten"} stationCode={"E06"} ref="E06" onClick={this._handleClickStation.bind(null, "Fort Totten", "E06")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Fort Totten", "E06")} onTapOutage={this._handleTapOutage.bind(null, "Fort Totten", "E06")} fromLineCodes={this.lineCodes.RD} toLineCodes={this.lineCodes.RD} />
          <BetweenStationRow code={'E06_E05'} isOnLeft={true} />
          <BetweenStationRow code={'E05_E06'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Georgia Avenue – Petworth"} stationCode={"E05"} ref="E05" onClick={this._handleClickStation.bind(null, "Georgia Avenue – Petworth", "E05")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Georgia Avenue – Petworth", "E05")} onTapOutage={this._handleTapOutage.bind(null, "Georgia Avenue – Petworth", "E05")} />
          <BetweenStationRow code={'E05_E04'} isOnLeft={true} />
          <BetweenStationRow code={'E04_E05'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Columbia Heights"} stationCode={"E04"} ref="E04" onClick={this._handleClickStation.bind(null, "Columbia Heights", "E04")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Columbia Heights", "E04")} onTapOutage={this._handleTapOutage.bind(null, "Columbia Heights", "E04")} />
          <BetweenStationRow code={'E04_E03'} isOnLeft={true} />
          <BetweenStationRow code={'E03_E04'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"U Street"} stationCode={"E03"} ref="E03" onClick={this._handleClickStation.bind(null, "U Street", "E03")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "U Street", "E03")} onTapOutage={this._handleTapOutage.bind(null, "U Street", "E03")} />
          <BetweenStationRow code={'E03_E02'} isOnLeft={true} />
          <BetweenStationRow code={'E02_E03'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Shaw – Howard University"} stationCode={"E02"} ref="E02" onClick={this._handleClickStation.bind(null, "Shaw – Howard University", "E02")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Shaw – Howard University", "E02")} onTapOutage={this._handleTapOutage.bind(null, "Shaw – Howard University", "E02")} />
          <BetweenStationRow code={'E02_E01'} isOnLeft={true} />
          <BetweenStationRow code={'E01_E02'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Mount Vernon Square"} stationCode={"E01"} ref="E01" onClick={this._handleClickStation.bind(null, "Mount Vernon Square", "E01")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Mount Vernon Square", "E01")} onTapOutage={this._handleTapOutage.bind(null, "Mount Vernon Square", "E01")} />
          <BetweenStationRow code={'E01_F01'} isOnLeft={true} />
          <BetweenStationRow code={'F01_E01'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Gallery Place"} stationCode={"F01"} ref="F01" onClick={this._handleClickStation.bind(null, "Gallery Place", "F01")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Gallery Place", "F01")} onTapOutage={this._handleTapOutage.bind(null, "Gallery Place", "F01")} fromLineCodes={this.lineCodes.RD} toLineCodes={this.lineCodes.RD} />
          <BetweenStationRow code={'F01_F02'} isOnLeft={true} />
          <BetweenStationRow code={'F02_F01'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Archives"} stationCode={"F02"} ref="F02" onClick={this._handleClickStation.bind(null, "Archives", "F02")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Archives", "F02")} onTapOutage={this._handleTapOutage.bind(null, "Archives", "F02")} />
          <BetweenStationRow code={'F02_F03'} isOnLeft={true} />
          <BetweenStationRow code={'F03_F02'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"L'Enfant Plaza"} stationCode={"F03"} ref="F03" onClick={this._handleClickStation.bind(null, "L'Enfant Plaza", "F03")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "L'Enfant Plaza", "F03")} onTapOutage={this._handleTapOutage.bind(null, "L'Enfant Plaza", "F03")} toLineCodes={this.lineCodes.SV_OR_BL_YL} fromLineCodes={this.lineCodes.BL_OR_SV} />
          <BetweenStationRow code={'F03_F04'} isOnLeft={true} />
          <BetweenStationRow code={'F04_F03'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Waterfront"} stationCode={"F04"} ref="F04" onClick={this._handleClickStation.bind(null, "Waterfront", "F04")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Waterfront", "F04")} onTapOutage={this._handleTapOutage.bind(null, "Waterfront", "F04")} />
          <BetweenStationRow code={'F04_F05'} isOnLeft={true} />
          <BetweenStationRow code={'F05_F04'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Navy Yard – Ballpark"} stationCode={"F05"} ref="F05" onClick={this._handleClickStation.bind(null, "Navy Yard – Ballpark", "F05")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Navy Yard – Ballpark", "F05")} onTapOutage={this._handleTapOutage.bind(null, "Navy Yard – Ballpark", "F05")} />
          <BetweenStationRow code={'F05_F06'} isOnLeft={true} />
          <BetweenStationRow code={'F06_F05'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Anacostia"} stationCode={"F06"} ref="F06" onClick={this._handleClickStation.bind(null, "Anacostia", "F06")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Anacostia", "F06")} onTapOutage={this._handleTapOutage.bind(null, "Anacostia", "F06")} />
          <BetweenStationRow code={'F06_F07'} isOnLeft={true} />
          <BetweenStationRow code={'F07_F06'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Congress Heights"} stationCode={"F07"} ref="F07" onClick={this._handleClickStation.bind(null, "Congress Heights", "F07")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Congress Heights", "F07")} onTapOutage={this._handleTapOutage.bind(null, "Congress Heights", "F07")} />
          <BetweenStationRow code={'F07_F08'} isOnLeft={true} />
          <BetweenStationRow code={'F08_F07'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Southern Avenue"} stationCode={"F08"} ref="F08" onClick={this._handleClickStation.bind(null, "Southern Avenue", "F08")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Southern Avenue", "F08")} onTapOutage={this._handleTapOutage.bind(null, "Southern Avenue", "F08")} />
          <BetweenStationRow code={'F08_F09'} isOnLeft={true} />
          <BetweenStationRow code={'F09_F08'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Naylor Road"} stationCode={"F09"} ref="F09" onClick={this._handleClickStation.bind(null, "Naylor Road", "F09")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Naylor Road", "F09")} onTapOutage={this._handleTapOutage.bind(null, "Naylor Road", "F09")} />
          <BetweenStationRow code={'F09_F10'} isOnLeft={true} />
          <BetweenStationRow code={'F10_F09'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Suitland"} stationCode={"F10"} ref="F10" onClick={this._handleClickStation.bind(null, "Suitland", "F10")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Suitland", "F10")} onTapOutage={this._handleTapOutage.bind(null, "Suitland", "F10")} />
          <BetweenStationRow code={'F10_F11'} isOnLeft={true} />
          <BetweenStationRow code={'F11_F10'} isOnLeft={false} />
          <StationRow isDarkMode={this.props.isDarkMode} stationName={"Branch Avenue"} stationCode={"F11"} ref="F11" onClick={this._handleClickStation.bind(null, "Branch Avenue", "F11")} stationTwitterOnClick={this._handleClickStationTwitter.bind(null, "Branch Avenue", "F11")} onTapOutage={this._handleTapOutage.bind(null, "Branch Avenue", "F11")} />
        </div>
      );
    }

    const stationsToRender = [];
    for (let i = 0; i < stations.length; i++) {
      const station = stations[i];
      stationsToRender.push(station.Code);
    }

    const detailsContent = [];
    if (this.props.lineColor === "red") {
      detailsContent.push(
        <DashboardLineItem key='dli-RD'
                           lineName="Red"
                           lineCode='RD'
                           onClickNavItem={this.props.onClickNavItem}
                           isDarkMode={this.props.isDarkMode}/>
      );
    } else if (this.props.lineColor === "orange" || this.props.lineColor === "silver" || this.props.lineColor === "blue") {
      if (this.props.lineColor === "orange") {
        detailsContent.push(
          <DashboardLineItem key='dli-OR'
                             lineName="Orange"
                             lineCode='OR'
                             onClickNavItem={this.props.onClickNavItem}
                             isDarkMode={this.props.isDarkMode}/>
        );
        detailsContent.push(
          <DashboardLineItem key='dli-SV'
                             lineName="Silver"
                             lineCode='SV'
                             onClickNavItem={this.props.onClickNavItem}
                             isDarkMode={this.props.isDarkMode}/>
        );
        detailsContent.push(
          <DashboardLineItem key='dli-BL'
                             lineName="Blue"
                             lineCode='BL'
                             onClickNavItem={this.props.onClickNavItem}
                             isDarkMode={this.props.isDarkMode}/>
        );
      } else if (this.props.lineColor === "silver") {
        detailsContent.push(
          <DashboardLineItem key='dli-SV'
                             lineName="Silver"
                             lineCode='SV'
                             onClickNavItem={this.props.onClickNavItem}
                             isDarkMode={this.props.isDarkMode}/>
        );
        detailsContent.push(
          <DashboardLineItem key='dli-OR'
                             lineName="Orange"
                             lineCode='OR'
                             onClickNavItem={this.props.onClickNavItem}
                             isDarkMode={this.props.isDarkMode}/>
        );
        detailsContent.push(
          <DashboardLineItem key='dli-BL'
                             lineName="Blue"
                             lineCode='BL'
                             onClickNavItem={this.props.onClickNavItem}
                             isDarkMode={this.props.isDarkMode}/>
        );
      } else {
        detailsContent.push(
          <DashboardLineItem key='dli-BL'
                             lineName="Blue"
                             lineCode='BL'
                             onClickNavItem={this.props.onClickNavItem}
                             isDarkMode={this.props.isDarkMode}/>
        );
        detailsContent.push(
          <DashboardLineItem key='dli-SV'
                             lineName="Silver"
                             lineCode='SV'
                             onClickNavItem={this.props.onClickNavItem}
                             isDarkMode={this.props.isDarkMode}/>
        );
        detailsContent.push(
          <DashboardLineItem key='dli-OR'
                             lineName="Orange"
                             lineCode='OR'
                             onClickNavItem={this.props.onClickNavItem}
                             isDarkMode={this.props.isDarkMode}/>
        );
        detailsContent.push(
          <DashboardLineItem key='dli-YL'
                             lineName="Yellow"
                             lineCode='YL'
                             onClickNavItem={this.props.onClickNavItem}
                             isDarkMode={this.props.isDarkMode}/>
        );
      }
    } else if (this.props.lineColor === "yellow" || this.props.lineColor === "green") {
      if (this.props.lineColor === "yellow") {
        detailsContent.push(
          <DashboardLineItem key='dli-YL'
                             lineName="Yellow"
                             lineCode='YL'
                             onClickNavItem={this.props.onClickNavItem}
                             isDarkMode={this.props.isDarkMode}/>
        );
        detailsContent.push(
          <DashboardLineItem key='dli-GR'
                             lineName="Green"
                             lineCode='GR'
                             onClickNavItem={this.props.onClickNavItem}
                             isDarkMode={this.props.isDarkMode}/>
        );
        detailsContent.push(
          <DashboardLineItem key='dli-BL'
                             lineName="Blue"
                             lineCode='BL'
                             onClickNavItem={this.props.onClickNavItem}
                             isDarkMode={this.props.isDarkMode}/>
        );
      } else {
        detailsContent.push(
          <DashboardLineItem key='dli-GR'
                             lineName="Green"
                             lineCode='GR'
                             onClickNavItem={this.props.onClickNavItem}
                             isDarkMode={this.props.isDarkMode}/>
        );
        detailsContent.push(
          <DashboardLineItem key='dli-YL'
                             lineName="Yellow"
                             lineCode='YL'
                             onClickNavItem={this.props.onClickNavItem}
                             isDarkMode={this.props.isDarkMode}/>
        );
      }
    }

    const tabContentHackedStyle = { // for older browsers
      display: 'block',
      margin: '0 auto',
      lineHeight: '48px'
    };

    return (
      <div className="Line" style={{height: this.state.effectiveViewportHeight - 56}}>
        <Tabs value={this.state.tabValue} onChange={this._handleTabChange} style={{height: 38, marginTop: -8}}>
          <Tab label={<span style={tabContentHackedStyle}>Map</span>} value='line-map' style={{height: 38}}>
            <div className={`scrollable-container vertical-scrolling ${(this.state.tabValue !== 'line-map') ? 'disabled' : ''}`} ref="lineContainer" style={{height: this.state.effectiveViewportHeight - 142}}>
              <div style={{width: '100%'}}>
                <div
                  style={{
                    position: 'relative',
                    width: 300,
                    height: '100%',
                    marginLeft: 'auto',
                    marginRight: 'auto'
                  }}
                >
                  <Paper className={`colored-line ${this.props.lineColor}`} zDepth={1} />
                  {lineContent}
                  <SpeedRestrictions
                    isDarkMode={this.props.isDarkMode}
                    onClick={this._handleClickSpeedRestriction}
                  />
                  <TrainIcons
                    isDarkMode={this.props.isDarkMode}
                    onClick={this._handleClickTrain}
                  />
                </div>
              </div>
            </div>
            <PlaybackControls />
          </Tab>
          <Tab label={<span style={tabContentHackedStyle}>Detail</span>} value='line-details' style={{height: 38}}>
            <div className={`scrollable-container vertical-scrolling ${(this.state.tabValue !== 'line-details') ? 'disabled' : ''}`} style={{height: this.state.effectiveViewportHeight - 142}}>
              <div style={{textAlign: 'center', paddingBottom: 92}}>
                {detailsContent}
              </div>
            </div>
          </Tab>
        </Tabs>
        <LineBottomNav
          lineColor={this.props.lineColor}
          onClickNavItem={this.props.onClickNavItem}
          isDarkMode={this.props.isDarkMode}
        />
        {
          this.state.tabValue === 'line-map' ?
            <NearestStationFloatingActionButton
              baseBottomPosition={46}
              shouldAutoPress={this.state.shouldAutoPress}
              onGetCurrentPositionSuccess={this._onGetCurrentPositionSuccess}
              onGetCurrentPositionFailed={this._onGetCurrentPositionFailed}
              isDarkMode={this.props.isDarkMode}
            />
            : null
        }
        <StationDialog
          ref="stationDialog"
          stationName={this.state.selectedStationName}
          onHide={this._onStationDialogHide}
          switchedStationCode={this._getSwitchedStationCode()}
          onSwitchStationCode={this._switchSelectedStationCode}
        />
        <TrainDialog
          ref="trainDialog"
          trainId={this.state.selectedTrainId}
          stationName={this.state.selectedStationName}
          shouldRender={!this.state.selectedStationCode}
          storeName={'PredictionsStore'}
          onHide={this._onTrainDialogHide}
        />
        <SpeedRestrictionDialog
          ref="speedRestrictionDialog"
          speedRestrictionId={this.state.selectedSpeedRestrictionId}
          onHide={this._onSpeedRestrictionDialogHide}
          isDarkMode={this.props.isDarkMode}
        />
      </div>
    );
  }

});

const TrainIcons = createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(LineStore, 'onStoreChange'),
    Reflux.listenTo(PredictionsStore, 'onStoreChange'),
    Reflux.listenTo(SettingsStore, 'onStoreChange')
  ],

  propTypes: {
    isDarkMode: PropTypes.bool.isRequired,
    onClick: PropTypes.func
  },

  getStoreState() {
    let trainStatuses;
    const isPlaybackLoaded = PredictionsStore.get('playback') ? PredictionsStore.get('playback').get('enabled') : false;
    if (isPlaybackLoaded) {
      trainStatuses = PredictionsStore.get('data');
    } else {
      trainStatuses = PredictionsStore.get('data') ? PredictionsStore.get('data').get('trainStatuses') : null;
    }

    return {
      refs: LineStore.get('refs'),
      trainStatuses,
      isNerdMode: SettingsStore.get('isNerdMode')
    };
  },

  render() {
    if (!this.state.refs || !this.state.trainStatuses) {
      return false;
    }

    const anchorNodeClientHeight = this.state.refs.get('anchorNodeClientHeight');
    const anchorRect = this.state.refs.get('anchor');
    if (!anchorNodeClientHeight || !anchorRect) {
      return false;
    }

    const trainIcons = [];

    this.state.trainStatuses.forEach((trainStatus, index) => {
      if (typeof trainStatus.get === "function") {  // TODO: sometimes when switching to playback mode, we iterate over things that aren't train statuses
        const trainId = trainStatus.get('trainId');
        const currentStationCode = trainStatus.get('currentStationCode');
        if (trainId && currentStationCode) {
          const approachingStationNodeRect = this.state.refs.get(currentStationCode);
          if (approachingStationNodeRect) {
            const trackNumber = trainStatus.get('trackNumber');
            let offsetX = null;
            if (trainStatus.get('isNotOnRevenueTrack')) {
              offsetX = 89;
            } else if (trackNumber === 1) {
              offsetX = 108;
            } else if (trackNumber === 2) {
              offsetX = 0;
            }

            let offsetY = null;
            const previousStationCode = trainStatus.get('PreviousStationCode');
            if (previousStationCode && trainStatus.get('Min') !== 'BRD') {
              const previousStationNodeRect = this.state.refs.get(previousStationCode);
              if (previousStationNodeRect) {
                const minutesAway = trainStatus.get('minutesAway');
                const maxMinutesAway = trainStatus.get('maxMinutesAway');
                if (minutesAway && maxMinutesAway) {
                  const minutesAwayFraction = minutesAway / maxMinutesAway;
                  const maxOffsetY = previousStationNodeRect.top - approachingStationNodeRect.top;
                  offsetY = minutesAwayFraction * maxOffsetY;
                }
              }
            } else {
              offsetY = 0;
            }

            if (offsetX != null && offsetY != null) {
              const x = approachingStationNodeRect.left - anchorRect.left + offsetX;
              const y = approachingStationNodeRect.top - anchorRect.top - anchorNodeClientHeight + 24 + offsetY;

              const trainId = trainStatus.get('trainId');

              trainIcons.push(
                <TrainIcon
                  key={trainId}
                  ref={trainId}
                  isTrainDelayed={trainStatus.get('isCurrentlyHoldingOrSlow')}
                  trainId={trainStatus.get('realTrainId')}
                  Min={trainStatus.get('Min')}
                  directionNumber={trainStatus.get('directionNumber')}
                  trackNumber={trainStatus.get('trackNumber')}
                  numPositiveTags={trainStatus.get('numPositiveTags')}
                  numNegativeTags={trainStatus.get('numNegativeTags')}
                  Line={trainStatus.get('Line')}
                  isNotOnRevenueTrack={trainStatus.get('isNotOnRevenueTrack')}
                  Car={trainStatus.get('Car')}
                  destinationStationAbbreviation={(trainStatus.get('DestinationName') === 'No Passenger') ? 'NoPx' : (this.state.isNerdMode ? trainStatus.get('DestinationCode') : trainStatus.get('destinationStationAbbreviation'))}
                  shouldGrayOut={trainStatus.get('isKeyedDown') || trainStatus.get('wasKeyedDown')}
                  areDoorsOpen={trainStatus.get('areDoorsOpenOnLeft') || trainStatus.get('areDoorsOpenOnRight')}
                  onClick={this.props.onClick ? this.props.onClick.bind(null, trainStatus) : null}
                  isDarkMode={this.props.isDarkMode}
                  x={x}
                  y={y}
                />
              );
            }
          }
        }
      }
    });

    return (
      <div>
        {trainIcons}
      </div>
    )
  }
});

const SpeedRestrictions = createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(LineStore, 'onStoreChange'),
    Reflux.listenTo(PredictionsStore, 'onStoreChange')
  ],

  propTypes: {
    isDarkMode: PropTypes.bool.isRequired,
    onClick: PropTypes.func
  },

  getStoreState() {
    let speedRestrictions;
    const isPlaybackLoaded = PredictionsStore.get('playback') ? PredictionsStore.get('playback').get('enabled') : false;
    if (isPlaybackLoaded) {
      speedRestrictions = null;
    } else {
      speedRestrictions = PredictionsStore.get('data') ? PredictionsStore.get('data').get('speedRestrictions') : null;
    }

    return {
      refs: LineStore.get('refs'),
      speedRestrictions
    };
  },

  render() {
    if (!this.state.refs || !this.state.speedRestrictions) {
      return false;
    }

    const anchorNodeClientHeight = this.state.refs.get('anchorNodeClientHeight');
    const anchorRect = this.state.refs.get('anchor');
    if (!anchorNodeClientHeight || !anchorRect) {
      return false;
    }

    const speedRestrictions = [];

    this.state.speedRestrictions.forEach((speedRestriction, index) => {
      const fromStationCode = speedRestriction.get('fromStationCode');
      const fromStationNodeRect = this.state.refs.get(fromStationCode);
      if (fromStationNodeRect) {
        let offsetX = null;
        let offsetY = null;

        const trackNumber = speedRestriction.get('trackNumber');
        if (trackNumber === 1) {
          offsetX = 103;
        } else if (trackNumber === 2) {
          offsetX = 71;
        }

        const toStationCode = speedRestriction.get('toStationCode');
        const toStationNodeRect = this.state.refs.get(toStationCode);
        if (toStationNodeRect) {
          offsetY = ((fromStationNodeRect.bottom - toStationNodeRect.top) > 0) ? (((toStationNodeRect.top - fromStationNodeRect.bottom) / 2) + 12) : (((toStationNodeRect.bottom - fromStationNodeRect.top) / 2) - 12);
        } else {
          offsetY = 24;
        }

        if (offsetX != null && offsetY != null) {
          const key = `speedRestriction-${speedRestriction.get('id')}`;
          const maximumSpeed = speedRestriction.get('maximumSpeed');
          const x = fromStationNodeRect.left - anchorRect.left + offsetX;
          const y = fromStationNodeRect.top - anchorRect.top - anchorNodeClientHeight + offsetY;

          speedRestrictions.push((
            <SpeedRestrictionIcon
              key={key}
              ref={key}
              maximumSpeed={maximumSpeed}
              onClick={this.props.onClick ? this.props.onClick.bind(null, speedRestriction) : null}
              isDarkMode={this.props.isDarkMode}
              x={x}
              y={y}
            />
          ));
        }
      }
    });

    return (
      <div>
        {speedRestrictions}
      </div>
    );
  }
});
