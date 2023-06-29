import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Reflux from 'reflux';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import StoreMixin from 'reflux-immutable/StoreMixin';
import Immutable from 'immutable';

import Utilities from '../utilities/Utilities';

import TrainDialogActions from '../actions/TrainDialogActions';
import TrainDialogStore from '../stores/TrainDialogStore';
import PredictionsStore from '../stores/PredictionsStore';
import AppStore from '../stores/AppStore';
import StationStore from '../stores/StationStore';
import SettingsStore from "../stores/SettingsStore";

import MDSpinner from "react-md-spinner";
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {Tabs, Tab} from 'material-ui/Tabs';
import AlertError from 'material-ui/svg-icons/alert/error';

import TrainDialogTags from './TrainDialogTags';
import TrainDialogAlerts from "./TrainDialogAlerts";

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(TrainDialogStore, 'onStoreChange'),
    Reflux.listenTo(AppStore, 'onStoreChange')
  ],

  contextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  propTypes: {
    trainId: PropTypes.string,
    stationName: PropTypes.string,
    shouldRender: PropTypes.bool.isRequired,
    storeName: PropTypes.string.isRequired,
    savedTripKey: PropTypes.string,
    onHide: PropTypes.func
  },

  getStoreState() {
    return {
      showDialog: TrainDialogStore.get('showDialog'),
      tabValue: TrainDialogStore.get('tabValue'),
      isMobileDevice: AppStore.get('isMobileDevice')
    };
  },

  componentWillUnmount() {
    this.hide();
  },

  show() {
    TrainDialogActions.updateState({
      showDialog: true
    });
  },

  hide() {
    TrainDialogActions.updateState({
      showDialog: false
    });

    if (this.props.onHide) {
      this.props.onHide();
    }
  },

  render() {
    if (!this.props.shouldRender) {
      return false;
    }

    return (
      <Dialog
        title={
          <TrainDialogTitle
            trainId={this.props.trainId}
            stationName={this.props.stationName}
            storeName={this.props.storeName}
            savedTripKey={this.props.savedTripKey}
          />
        }
        actions={
          <TrainDialogActionBar
            trainId={this.props.trainId}
            onHide={this.hide}
          />
        }
        modal={this.state.isMobileDevice}
        contentStyle={{width: '95%', maxWidth: 450}}
        bodyClassName="scrolling-dialog-body"
        bodyStyle={{borderTop: 0, padding: 0, maxWidth: 'auto', color: this.context.muiTheme.palette.textColor}}
        open={this.state.showDialog}
        onRequestClose={this.hide}
        autoScrollBodyContent
        repositionOnUpdate
      >
        <TrainDialogBody
          tabValue={this.props.tabValue}
          trainId={this.props.trainId}
          storeName={this.props.storeName}
          savedTripKey={this.props.savedTripKey}
        />
      </Dialog>
    );
  }
});

const TrainDialogTitle = createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(StationStore, 'onStoreChange'),
    Reflux.listenTo(PredictionsStore, 'onStoreChange')
  ],

  contextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  propTypes: {
    trainId: PropTypes.string,
    stationName: PropTypes.string,
    storeName: PropTypes.string.isRequired,
    savedTripKey: PropTypes.string
  },

  getStoreState() {
    let isLoading;
    let error;
    let data;
    let trainStatuses;

    if (this.props.storeName === 'StationStore') {
      isLoading = StationStore.get('isLoading');
      error = StationStore.get('error');
      data = StationStore.get('data');
      trainStatuses = StationStore.get('data') ? StationStore.get('data').get('trainStatuses') : null;
    } else if (this.props.storeName === 'PredictionsStore') {
      const isPlaybackLoaded = PredictionsStore.get('playback') ? PredictionsStore.get('playback').get('enabled') : false;
      if (isPlaybackLoaded) {
        trainStatuses = PredictionsStore.get('data');
      } else {
        isLoading = PredictionsStore.get('isLoading');
        error = PredictionsStore.get('error');
        data = PredictionsStore.get('data');

        if (this.props.savedTripKey) {
          trainStatuses = (PredictionsStore.get('data') && PredictionsStore.get('data').get('savedTrips') && PredictionsStore.get('data').get('savedTrips').get(this.props.savedTripKey)) ? Immutable.fromJS(PredictionsStore.get('data').get('savedTrips').get(this.props.savedTripKey).fromStationTrainStatuses) : null;
        } else {
          trainStatuses = PredictionsStore.get('data') ? PredictionsStore.get('data').get('trainStatuses') : null;
        }
      }
    }

    const trainStatus = this._getTrainStatus(trainStatuses);

    const isScheduled = trainStatus ? trainStatus.get('isScheduled') : null;
    const Min = trainStatus ? trainStatus.get('Min') : null;
    const isDelayed = trainStatus ? trainStatus.get('isCurrentlyHoldingOrSlow') : null;
    const PreviousStationCode = trainStatus ? trainStatus.get('PreviousStationCode') : null;
    const currentStationName = trainStatus ? trainStatus.get('currentStationName') : null;

    isLoading = (isLoading || !!error);

    return {
      isScheduled,
      Min,
      isDelayed,
      PreviousStationCode,
      currentStationName,
      isLoading
    };
  },

  _getTrainStatus(trainStatuses) {
    if (!trainStatuses || !this.props.trainId) {
      return null;
    }

    let selectedTrainStatus;

    trainStatuses.forEach((trainStatus, index) => {
      if (trainStatus.get('trainId') === this.props.trainId) {
        selectedTrainStatus = trainStatus;
        return false;
      }
    });

    return selectedTrainStatus;
  },

  render() {
    if (!this.props.trainId) {
      return false;
    }

    let primaryTitle;
    let isBoardingOrArriving = false;

    if (this.state.isScheduled) {
      primaryTitle = this.state.Min + ' scheduled departure';
    } else {
      if (this.state.Min === "ARR") {
        primaryTitle = "ARRIVING";
        isBoardingOrArriving = true;
      } else if (this.state.Min === "BRD") {
        primaryTitle = "BOARDING";
        isBoardingOrArriving = true;
      } else if (this.state.Min === "1") {
        primaryTitle = "1 minute";
      } else {
        primaryTitle = this.state.Min + " minutes";
      }
    }

    let delayedIcon;
    if (this.state.isDelayed) {
      primaryTitle += "*";
      delayedIcon = (
        <i className="metrohero-trains_holding" />
      );
    }

    let secondaryTitle = `${isBoardingOrArriving ? "at " : "from "} ${this.props.stationName ? this.props.stationName : this.state.currentStationName}`;

    let loadingContent;
    if (this.state.isLoading) {
      loadingContent = (
        <MDSpinner
          size={42}
          singleColor={this.context.muiTheme.palette.accent1Color}
          style={{position: 'absolute', top: 5, right: 4}}
        />
      );
    }

    return (
      <div className="train-dialog-title" style={{backgroundColor: this.context.muiTheme.palette.primary1Color, color: this.context.muiTheme.palette.alternateTextColor}}>
        {delayedIcon}
        <div className="train-dialog-title-primary">{primaryTitle}</div>
        <div className="train-dialog-title-secondary">{secondaryTitle}</div>
        {loadingContent}
      </div>
    );
  }
});

const TrainDialogActionBar = createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(PredictionsStore, 'onStoreChange')
  ],

  propTypes: {
    trainId: PropTypes.string,
    onHide: PropTypes.func.isRequired
  },

  getStoreState() {
    return {
      isPlaybackLoaded: PredictionsStore.get('playback') ? PredictionsStore.get('playback').get('enabled') : false
    };
  },

  render() {
    return (
      <div className='train-dialog-actions'>
        {(this.props.trainId && !this.state.isPlaybackLoaded) ? <TrainDialogTags trainId={this.props.trainId} /> : null}
        <FlatButton label='Close' primary={true} keyboardFocused={true} onClick={this.props.onHide} />
      </div>
    );
  }
});

const TrainDialogBody = createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(StationStore, 'onStoreChange'),
    Reflux.listenTo(PredictionsStore, 'onStoreChange'),
    Reflux.listenTo(SettingsStore, 'onStoreChange')
  ],

  propTypes: {
    tabValue: PropTypes.string,
    trainId: PropTypes.string,
    storeName: PropTypes.string.isRequired,
    savedTripKey: PropTypes.string
  },

  getStoreState() {
    let trainStatuses;

    if (this.props.storeName === 'StationStore') {
      trainStatuses = StationStore.get('data') ? StationStore.get('data').get('trainStatuses') : null;
    } else if (this.props.storeName === 'PredictionsStore') {
      const isPlaybackLoaded = PredictionsStore.get('playback') ? PredictionsStore.get('playback').get('enabled') : false;
      if (isPlaybackLoaded) {
        trainStatuses = PredictionsStore.get('data');
      } else {
        if (this.props.savedTripKey) {
          trainStatuses = (PredictionsStore.get('data') && PredictionsStore.get('data').get('savedTrips') && PredictionsStore.get('data').get('savedTrips').get(this.props.savedTripKey)) ? Immutable.fromJS(PredictionsStore.get('data').get('savedTrips').get(this.props.savedTripKey).fromStationTrainStatuses) : null;
        } else {
          trainStatuses = PredictionsStore.get('data') ? PredictionsStore.get('data').get('trainStatuses') : null;
        }
      }
    }

    const trainStatus = this._getTrainStatus(trainStatuses);

    const realTrainId = trainStatus ? trainStatus.get('realTrainId') : null;
    const isScheduled = trainStatus ? trainStatus.get('isScheduled') : null;
    const Min = trainStatus ? trainStatus.get('Min') : null;
    const parentMin = trainStatus ? trainStatus.get('parentMin') : null;
    const PreviousStationCode = trainStatus ? trainStatus.get('PreviousStationCode') : null;
    const currentStationName = trainStatus ? trainStatus.get('currentStationName') : null;
    const DestinationName = trainStatus ? trainStatus.get('DestinationName') : null;
    const Car = trainStatus ? trainStatus.get('Car') : null;
    const Line = trainStatus ? trainStatus.get('Line') : null;
    const trackNumber = trainStatus ? trainStatus.get('trackNumber') : null;
    const secondsSinceLastMoved = trainStatus ? trainStatus.get('secondsSinceLastMoved') : null;
    const secondsOffSchedule = trainStatus ? trainStatus.get('secondsOffSchedule') : null;
    const trainSpeed = trainStatus ? trainStatus.get('trainSpeed') : null;
    const isNotOnRevenueTrack = trainStatus ? trainStatus.get('isNotOnRevenueTrack') : null;
    const isKeyedDown = trainStatus ? trainStatus.get('isKeyedDown') : null;
    const wasKeyedDown = trainStatus ? trainStatus.get('wasKeyedDown') : null;
    const distanceFromNextStation = trainStatus ? trainStatus.get('distanceFromNextStation') : null;
    const isCurrentlyHoldingOrSlow = trainStatus ? trainStatus.get('isCurrentlyHoldingOrSlow') : null;
    const destinationId = trainStatus ? trainStatus.get('destinationId') : null;
    const destinationCode = trainStatus ? trainStatus.get('DestinationCode') : null;
    const recentTweets = trainStatus ? trainStatus.get('recentTweets') : null;
    const trackCircuitId = trainStatus ? trainStatus.get('trackCircuitId') : null;
    const circuitName = trainStatus ? trainStatus.get('circuitName') : null;
    const areDoorsOpenOnLeft = trainStatus ? trainStatus.get('areDoorsOpenOnLeft') : null;
    const areDoorsOpenOnRight = trainStatus ? trainStatus.get('areDoorsOpenOnRight') : null;

    return {
      realTrainId,
      Line,
      isScheduled,
      Car,
      DestinationName,
      parentMin,
      Min,
      isNotOnRevenueTrack,
      PreviousStationCode,
      trackNumber,
      trainSpeed,
      currentStationName,
      secondsSinceLastMoved,
      secondsOffSchedule,
      isKeyedDown,
      wasKeyedDown,
      distanceFromNextStation,
      isCurrentlyHoldingOrSlow,
      isNerdMode: SettingsStore.get('isNerdMode'),
      destinationId,
      destinationCode,
      recentTweets,
      trackCircuitId,
      circuitName,
      areDoorsOpenOnLeft,
      areDoorsOpenOnRight
    };
  },

  componentDidMount() {
    this._resizeHack();
  },

  componentDidUpdate() {
    this._resizeHack();
  },

  _resizeHack() {
    // workaround, see: https://github.com/callemall/material-ui/issues/5793#issuecomment-301282845
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 0);
  },

  _getTrainStatus(trainStatuses) {
    if (!trainStatuses || !this.props.trainId) {
      return null;
    }

    let selectedTrainStatus;

    trainStatuses.forEach((trainStatus, index) => {
      if (trainStatus.get('trainId') === this.props.trainId) {
        selectedTrainStatus = trainStatus;
        return false;
      }
    });

    return selectedTrainStatus;
  },

  _lineCodeToName(lineCode) {
    let lineName;

    if (lineCode === "RD") {
      lineName = "Red";
    } else if (lineCode === "OR") {
      lineName = "Orange";
    } else if (lineCode === "SV") {
      lineName = "Silver";
    } else if (lineCode === "BL") {
      lineName = "Blue";
    } else if (lineCode === "YL") {
      lineName = "Yellow";
    } else if (lineCode === "GR") {
      lineName = "Green";
    } else {
      lineName = lineCode;
    }

    return lineName;
  },

  _handleTabChange(value) {
    TrainDialogActions.updateState({
      tabValue: value || 'status'
    });

    this._resizeHack();
  },

  render() {
    let message;
    let delayMessage = "";
    if (this.props.trainId) {
      const lineName = this._lineCodeToName(this.state.Line);
      const lineNameLowerCase = lineName ? lineName.toLowerCase() : null;

      let carText = this.state.isScheduled ? 'A' : '';
      if (this.state.Car && this.state.Car !== 'N/A') {
        carText += ` <span class='colored-text ${lineNameLowerCase}'>${this.state.Car}-car</span>`;
      }

      let lineText = '';
      if (this.state.DestinationName && this.state.DestinationName === 'No Passenger') {
        lineText = ` <strong>No Passenger</strong>`;
      } else if (this.state.Line && this.state.Line !== 'N/A') {
        lineText = ` <span class='colored-text ${lineNameLowerCase}'>${lineName} Line</span>`;
      }

      const min = this.state.parentMin || this.state.Min;
      let description = ' Train ';
      let description2 = "";
      if (this.state.isScheduled) {
        description += 'is scheduled to depart';
        description2 = ` at ${min}`;
      } else if (min === 'BRD') {
        description += `${this.state.realTrainId} is boarding at`;
      } else if (min === 'ARR') {
        description += `${this.state.realTrainId} is arriving at`;
      } else if (min === '1') {
        description += `${this.state.realTrainId} is 1 minute from `;
      } else {
        description += `${this.state.realTrainId} is ${min} minutes from `;
      }

      const distanceText = this.state.distanceFromNextStation ? ` (about ${this.state.distanceFromNextStation.toLocaleString()} feet away)` : '';
      const trackText = this.state.isNotOnRevenueTrack ? ' on non-revenue track' : (this.state.trackNumber ? ` on track ${this.state.trackNumber}` : '');
      const trainSpeed = this.state.trainSpeed ? `, traveling at approximately ${this.state.trainSpeed} mph` : '';
      const destinationText = (this.state.DestinationName !== 'N/A' && this.state.DestinationName !== 'No Passenger') ? `a final destination of <strong>${this.state.DestinationName}</strong>` : 'an unknown final destination';
      const doorStatus = (this.state.areDoorsOpenOnLeft || this.state.areDoorsOpenOnRight) ? ` The train's ${this.state.areDoorsOpenOnLeft ? 'left' : 'right'} boarding doors are open.` : '';

      let scheduledDepartureText = "";
      if (this.state.isScheduled) {
        scheduledDepartureText = "<p>There is currently no real-time ETA available for this train, so we cannot guarantee it will operate at all, let alone on time; scheduled train departures like this one are subject to change due to delays or operational problems.</p>";
      }

      message = carText + lineText + description + ` <span style="font-weight:500;">${this.state.currentStationName}</span>${description2}${distanceText}${trackText}${trainSpeed} with ${destinationText}.${doorStatus}${scheduledDepartureText}`;

      if (this.state.isCurrentlyHoldingOrSlow) {
        delayMessage += `<p>This train is either holding or moving slowly; it has been reporting the same ETA for at least <strong>${Utilities.displaySeconds(this.state.secondsSinceLastMoved)}</strong>.</p>`;
      }

      if (this.state.secondsOffSchedule >= 60) {
        delayMessage += `<p>This train has accumulated at least <span style="font-weight:500;">${Utilities.displaySeconds(this.state.secondsOffSchedule)} of delays</span> during its trip so far.</p>`;
      }

      if (this.state.isKeyedDown) {
        if (!delayMessage) {
          delayMessage = '';
        }
        delayMessage += `<p>Our data indicates that this train is likely powered down.</p>`
      } else if (this.state.wasKeyedDown) {
        if (!delayMessage) {
          delayMessage = '';
        }
        delayMessage += `<p>Our data indicates that this train was likely powered down recently.</p>`
      }
    } else {
      message = `<p><strong>Whoops!</strong> We're unable to locate this train anymore. If it was a scheduled train, it may have departed and started its trip, otherwise it may have actually finished its trip or still be operating but outside of revenue track. It's also possible the train's ID changed mid-trip.</p><p>Keep this window open and we'll keep looking for the train, otherwise you're welcome to close it.</p>`;
    }

    let nerdText;
    if (!this.state.isScheduled && this.state.isNerdMode) {
      nerdText = (
        <div
          className='train-dialog-text'
          style={{
            marginBottom: 8
          }}
        >
          <div><u>Nerd Stuff</u></div>
          <div>AIMS Train ID: {this.props.trainId}</div>
          <div>Destination Code: {this.state.destinationId}</div>
          <div>Predicted Destination Station Code: {this.state.destinationCode}</div>
          <div>Lead Circuit Name & API ID: {this.state.circuitName} ({this.state.trackCircuitId})</div>
        </div>
      )
    }

    const tabContentHackedStyle = { // for older browsers
      display: 'block',
      margin: '0 auto',
      lineHeight: '48px'
    };

    let stationProblemsLabel;
    if (this.state.recentTweets) {
      stationProblemsLabel = (
        <span style={tabContentHackedStyle}>
          Recent Tweets&nbsp;<AlertError style={{width: 16, height: 16}} color="#ccc"/>
        </span>
      );
    } else {
      stationProblemsLabel = (
        <span style={tabContentHackedStyle}>
          Recent Tweets
        </span>
      );
    }

    return (
      <Tabs
        value={this.props.tabValue}
        onChange={this._handleTabChange}
        tabItemContainerStyle={{
          display: 'block',
          height: 38
        }}
      >
        <Tab
          value='status'
          label={
            <span
              style={tabContentHackedStyle}
            >
              Status
            </span>
          }
          style={{
            height: 38
          }}
        >
          <div
            className='train-dialog-content'
          >
            <p
              className='train-dialog-text'
              dangerouslySetInnerHTML={{__html: message}}
            />
            <div
              className='train-dialog-text'
              dangerouslySetInnerHTML={{__html: delayMessage}}
            />
            {nerdText}
          </div>
        </Tab>
        <Tab
          value='alerts'
          label={stationProblemsLabel}
          style={{
            height: 38
          }}
        >
          <TrainDialogAlerts
            recentTweets={this.state.recentTweets}
          />
        </Tab>
      </Tabs>
    );
  }
});
