import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import moment from 'moment';

import AddSavedTripActions from '../actions/AddSavedTripActions';

import {Card, CardTitle, CardText} from 'material-ui/Card';
import {List, ListItem} from 'material-ui/List';
import NotificationAirlineSeatReclineNormal from 'material-ui/svg-icons/notification/airline-seat-recline-normal';
import Chip from 'material-ui/Chip';
import DeviceAccessTime from 'material-ui/svg-icons/device/access-time';
import MapsTransferWithinAStation from 'material-ui/svg-icons/maps/transfer-within-a-station';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin
  ],

  contextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  propTypes: {
    savedTrip: PropTypes.object,
    systemName: PropTypes.string,
    originStopId: PropTypes.string,
    destinationStopId: PropTypes.string,
    canDelete: PropTypes.bool,
    isPreview: PropTypes.bool,
    isSavedTripLoading: PropTypes.bool,
    isDarkMode: PropTypes.bool
  },

  _signalSvg: `
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 1000 1000" width="8px" height="8px" enable-background="new 0 0 1000 1000" xml:space="preserve">
      <g>
        <path d="M132.5,745C64.8,745,10,799.8,10,867.5S64.8,990,132.5,990S255,935.2,255,867.5S200.2,745,132.5,745z M10,362.2v168.4c253.7,0,459.4,205.7,459.4,459.4h168.4C637.8,643.2,356.7,362.2,10,362.2z M10,10v168.4c448.2,0,811.6,363.4,811.6,811.6H990C990,448.8,551.2,10,10,10z"/>
      </g>
    </svg>
  `,

  _busSvg: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 75.769 71.959">
      <path d="M70.588 17.393a8.105 8.105 0 00-2.2.44c-.675.242-1.291.51-1.726 1.168l1.668 1.103c-.032.05.263-.221.73-.388a6.34 6.34 0 011.651-.327c.569-.035 1.098.035 1.36.137.26.102.172.03.173.082 0 .049-.012 2.296-.02 3.444l2 .011c.008-1.16.02-3.482.02-3.482v-.035c-.028-.905-.75-1.611-1.447-1.883-.696-.272-1.448-.316-2.209-.27zM10.268 0C8.672 0 7.387 1.629 7.387 3.652v14.183l-.006-.002a8.106 8.106 0 00-2.2-.44c-.76-.047-1.514-.002-2.21.27-.697.272-1.417.977-1.446 1.883l-.002.017v.018l.001.172H.81c-.448 0-.809.319-.809.714v5.09c0 .396.36.714.809.714h3.576c.448 0 .808-.318.808-.713v-5.091c0-.395-.36-.714-.808-.714h-.86l-.002-.145c.002-.052-.087.02.174-.082.261-.102.793-.171 1.362-.137.568.035 1.18.16 1.648.327.336.12.579.29.68.36V61.89c0 2.024 1.285 3.652 2.881 3.652h3.418v2.764c0 2.023 1.285 3.652 2.882 3.652h6.013c1.597 0 2.882-1.629 2.882-3.652v-2.764h25.27v2.398c0 2.023 1.285 3.652 2.881 3.652h6.013c1.597 0 2.883-1.629 2.883-3.652v-2.398h3.233c1.596 0 2.881-1.628 2.881-3.652V3.652C68.624 1.629 67.34 0 65.743 0zm8.715 3.617h38.046c1.106 0 1.998 1.393 1.998 3.122 0 1.73-.892 3.121-1.998 3.121H18.983c-1.107 0-1.998-1.392-1.998-3.12 0-1.73.891-3.123 1.998-3.123zm-2.826 12.964H35.64a6.722 6.722 0 00-.013.405v22.352H16.157c-1.597 0-2.882-1.618-2.882-3.627V20.208c0-2.01 1.285-3.627 2.882-3.627zm24.213 0h19.485c1.596 0 2.881 1.618 2.881 3.627v15.503c0 2.01-1.285 3.627-2.881 3.627H40.384V16.986c0-.137-.005-.272-.014-.405zM15.353 52.377h6.087c.79 0 1.427.988 1.427 2.217V56.2c0 1.228-.636 2.217-1.427 2.217h-6.087c-.79 0-1.427-.989-1.427-2.217v-1.607c0-1.229.637-2.217 1.427-2.217zm39.218 0h6.088c.79 0 1.426.988 1.426 2.217V56.2c0 1.228-.636 2.217-1.426 2.217H54.57c-.79 0-1.427-.989-1.427-2.217v-1.607c0-1.229.636-2.217 1.427-2.217zM74.96 19.753h-3.576c-.448 0-.809.318-.809.714v5.09c0 .396.361.714.81.714h3.575c.448 0 .809-.318.809-.713v-5.091c0-.396-.36-.714-.809-.714z"/>
    </svg>
  `,

  _onTapDeleteSavedTrip() {
    AddSavedTripActions.deleteSavedTrip(this.props.systemName, this.props.originStopId, this.props.destinationStopId);
  },

  _buildVehiclePredictionListItem(vehiclePrediction) {
    const chipStyle = {
      display: 'inline-block',
      margin: 2
    };
    const chipLabelStyle = {
      height: 16,
      margin: 2,
      paddingLeft: 8,
      paddingRight: 8,
      fontSize: 12,
      lineHeight: '16px',
      color: '#000'
    };

    let blinkIcon;
    if (vehiclePrediction.status.indexOf(':') <= -1) {
      blinkIcon = (
        <span
          className="blink"
          dangerouslySetInnerHTML={{
            __html: this._signalSvg
          }}
          style={{
            display: 'inline-block',
            verticalAlign: 'middle',
            marginRight: 4,
            height: 20,
            fill: this.context.muiTheme.palette.textColor
          }}
        />
      );
    }

    let etaText;
    if (vehiclePrediction.status === "BRD") {
      etaText = "boarding now";
    } else if (vehiclePrediction.status === "ARR") {
      etaText = "arriving now";
    } else if (vehiclePrediction.status.indexOf(':') > -1) {
      etaText = `scheduled to arrive @ ${vehiclePrediction.status}`;
    } else {
      if (vehiclePrediction.numStopsAway >= 1) {
        etaText = `${vehiclePrediction.status} minute${(vehiclePrediction.status !== "1") ? 's': ''} (${vehiclePrediction.numStopsAway} stop${(vehiclePrediction.numStopsAway > 1) ? 's' : ''}) away`;
      } else {
        etaText = `${vehiclePrediction.status} minute${(vehiclePrediction.status !== "1") ? 's': ''} away`;
      }
    }

    let vehicleIdChip;
    if (vehiclePrediction.vehicleStatus.vehicleId) {
      const vehicleIdChipLabelStyle = {
        height: chipLabelStyle.height,
        margin: chipLabelStyle.margin,
        paddingLeft: chipLabelStyle.paddingLeft,
        paddingRight: chipLabelStyle.paddingRight,
        fontSize: chipLabelStyle.fontSize,
        lineHeight: chipLabelStyle.lineHeight,
        color: chipLabelStyle.color
      };

      vehicleIdChip = (
        <Chip
          style={chipStyle}
          labelStyle={vehicleIdChipLabelStyle}
          backgroundColor={this.props.isDarkMode ? '#aaa' : undefined}
        >
          {`Bus #${vehiclePrediction.vehicleStatus.vehicleId}`}
        </Chip>
      );
    }

    let crowdingChip;
    const occupancyStatus = vehiclePrediction.vehicleStatus.occupancyStatus;
    let crowdingChipBackgroundColor;
    if (occupancyStatus) {
      if (occupancyStatus === 'EMPTY' || occupancyStatus === 'MANY_SEATS_AVAILABLE') {
        crowdingChipBackgroundColor = "rgb(150, 233, 150)";
      } else if (occupancyStatus === 'FEW_SEATS_AVAILABLE' || occupancyStatus === 'STANDING_ROOM_ONLY') {
        crowdingChipBackgroundColor = "#FFC107";
      } else {
        crowdingChipBackgroundColor = "rgb(233, 150, 150)";
      }
    }
    if (crowdingChipBackgroundColor) {
      crowdingChip = (
        <Chip
          style={chipStyle}
          labelStyle={chipLabelStyle}
          backgroundColor={crowdingChipBackgroundColor}
        >
          {occupancyStatus.toLowerCase().replace(/_/g, " ")}
        </Chip>
      );
    }

    let ghostBusChip;
    if ((vehiclePrediction.vehicleStatus.previousStopId != null) && (vehiclePrediction.vehicleStatus.projectionDeviation > 30)) {
      ghostBusChip = (
        <Chip
          style={chipStyle}
          labelStyle={chipLabelStyle}
          backgroundColor="rgb(233, 150, 150)"
        >
          detouring; ghost bus? 👻
        </Chip>
      );
    }

    let scheduleChip;
    const numMinutesOffSchedule = ((vehiclePrediction.predictedTimeLeft != null) && (vehiclePrediction.scheduledTimeLeft != null)) ? (vehiclePrediction.predictedTimeLeft - vehiclePrediction.scheduledTimeLeft) : null;
    if (numMinutesOffSchedule < -2) {
      const numMinutesEarly = Math.round(-1 * numMinutesOffSchedule);
      scheduleChip = (
        <Chip
          style={chipStyle}
          labelStyle={chipLabelStyle}
          backgroundColor="rgb(233, 150, 150)"
        >
          {`running ${numMinutesEarly} ${(numMinutesEarly === 1) ? "min" : "mins"} early`}
        </Chip>
      );
    } else if (numMinutesOffSchedule > 7) {
      const numMinutesLate = Math.round(numMinutesOffSchedule);
      scheduleChip = (
        <Chip
          style={chipStyle}
          labelStyle={chipLabelStyle}
          backgroundColor="rgb(233, 150, 150)"
        >
          {`running ${numMinutesLate} ${(numMinutesLate === 1) ? "min" : "mins"} late`}
        </Chip>
      );
    }

    let holdingChip;
    if (vehiclePrediction.vehicleStatus.timeSpentHoldingOrMovingSlowly >= 90) {
      const numMinutesHolding = Math.round(vehiclePrediction.vehicleStatus.timeSpentHoldingOrMovingSlowly / 60);
      holdingChip = (
        <Chip
          style={chipStyle}
          labelStyle={chipLabelStyle}
          backgroundColor="rgb(233, 150, 150)"
        >
          {`holding for past ${numMinutesHolding} ${(numMinutesHolding === 1) ? "min" : "mins"}`}
        </Chip>
      );
    }

    let delayedChip;
    if (vehiclePrediction.vehicleStatus.tripTimeSpentHoldingOrMovingSlowly > 7) {
      const numMinutesDelayed = Math.round(vehiclePrediction.vehicleStatus.tripTimeSpentHoldingOrMovingSlowly);
      delayedChip = (
        <Chip
          style={chipStyle}
          labelStyle={chipLabelStyle}
          backgroundColor="rgb(233, 150, 150)"
        >
          {`cumulatively delayed ${numMinutesDelayed} ${(numMinutesDelayed === 1) ? "min" : "mins"}`}
        </Chip>
      );
    }

    return (
      <div
        key={vehiclePrediction.vehicleStatus.compositeTripId}
        className="saved-trip-module-list-item-wrapper"
      >
        <ListItem
          className="saved-trip-module-list-item with-left-icon with-secondary-text"
          leftIcon={
            <div
              dangerouslySetInnerHTML={{
                __html: this._busSvg
              }}
              style={{
                top: 4,
                margin: 0,
                width: 24,
                height: 24,
                fill: (vehiclePrediction.status.indexOf(':') > -1) ? this.context.muiTheme.palette.secondaryTextColor : this.context.muiTheme.palette.textColor
              }}
            >
            </div>
          }
          primaryText={`${vehiclePrediction.vehicleStatus.routeId} ${vehiclePrediction.vehicleStatus.tripDestination}`}
          secondaryText={
            <span>
              {blinkIcon}
              <span>
                {etaText}
              </span>
            </span>
          }
          disabled
        />
        <div>
          {vehicleIdChip}
          {crowdingChip}
          {ghostBusChip}
          {scheduleChip}
          {holdingChip}
          {delayedChip}
        </div>
      </div>
    );
  },

  render() {
    const savedTrip = this.props.savedTrip;

    if (savedTrip && !savedTrip.usualRideTime) {
      // => trip involves a transfer
      return (
        <Card
          className="SavedTrip"
        >
          <CardText>
            <MapsTransferWithinAStation
              style={{
                width: 48,
                height: 48
              }}
            />
            <div
              style={{
                marginTop: 8
              }}
            >
              <strong>Your trip involves a transfer.</strong><br/>
              Please split your trip into segments to get information about each leg of your trip.
            </div>
            <div
              style={{
                marginTop: 8
              }}
            >
              Why do we ask you to split up your trip? Variables like traffic and your walking speed can mean the difference between catching and missing your next bus.
            </div>
          </CardText>
        </Card>
      );
    }

    const secondaryHeadingStyle = {
      display: 'table',
      fontSize: 14,
      color: this.context.muiTheme.palette.secondaryTextColor,
      marginLeft: 30
    };

    const waitTimeIconStyle = {
      display: 'inline-block',
      verticalAlign: 'middle',
      marginRight: 6,
      fontSize: 24
    };
    let timeUntilNextVehicleText;
    if (savedTrip && savedTrip.originVehiclePredictions && savedTrip.originVehiclePredictions.length > 0) {
      let vehiclePrediction = savedTrip.originVehiclePredictions[0];
      if ((vehiclePrediction.status === "BRD" || vehiclePrediction.status === "ARR") && savedTrip.originVehiclePredictions.length >= 2) {
        vehiclePrediction = savedTrip.originVehiclePredictions[1];
      }

      const roundedTimeUntilNextVehicle = Math.round(vehiclePrediction.predictedTimeLeft || vehiclePrediction.scheduledTimeLeft);
      const roundedTimeUntilNextVehicleForDisplay = (roundedTimeUntilNextVehicle < 1) ? "<1" : roundedTimeUntilNextVehicle;
      timeUntilNextVehicleText = `${roundedTimeUntilNextVehicleForDisplay} ${(roundedTimeUntilNextVehicleForDisplay === 1 || roundedTimeUntilNextVehicleForDisplay === "<1") ? "minute" : "minutes"}${((vehiclePrediction.vehicleStatus.timeSpentHoldingOrMovingSlowly >= 90) || (vehiclePrediction.status.indexOf(':') > -1)) ? "*" : ""} until next bus`;
    }
    let timeSinceLastVehicleText;
    if (savedTrip && savedTrip.timeSincePreviousVisit != null) {
      const vehiclePrediction = (savedTrip.originVehiclePredictions && savedTrip.originVehiclePredictions.length > 0) ? savedTrip.originVehiclePredictions[0] : null;
      if (vehiclePrediction && vehiclePrediction.status === "BRD") {
        timeSinceLastVehicleText = "a bus is boarding now";
      } else if (vehiclePrediction && vehiclePrediction.status === "ARR") {
        timeSinceLastVehicleText = "a bus is arriving now";
      } else {
        const roundedTimeSinceLastVehicle = Math.round(savedTrip.timeSincePreviousVisit);
        const roundedTimeSinceLastVehicleForDisplay = (roundedTimeSinceLastVehicle < 1) ? "<1" : roundedTimeSinceLastVehicle;
        timeSinceLastVehicleText = `last bus left ${roundedTimeSinceLastVehicleForDisplay} ${(roundedTimeSinceLastVehicleForDisplay === 1 || roundedTimeSinceLastVehicleForDisplay === "<1") ? "minute" : "minutes"} ago`;
      }
    }
    const vehiclePredictions = [];
    if (savedTrip && savedTrip.originVehiclePredictions) {
      for (let i = 0; i < 5 && i < savedTrip.originVehiclePredictions.length; i++) {
        vehiclePredictions.push(this._buildVehiclePredictionListItem(savedTrip.originVehiclePredictions[i]));
      }
    }

    const rideIconStyle = {
      display: 'inline-block',
      verticalAlign: 'middle',
      marginRight: 6,
      fontSize: 24
    };
    let predictedRideTimeText;
    if (savedTrip && savedTrip.predictedRideTime != null) {
      const roundedPredictedRideTime = Math.round(savedTrip.predictedRideTime);
      const roundedPredictedRideTimeForDisplay = (roundedPredictedRideTime < 1) ? "<1" : roundedPredictedRideTime;
      predictedRideTimeText = `${roundedPredictedRideTimeForDisplay}-minute ride once aboard`;
    }
    let predictedRideTimeSubText;
    if (savedTrip) {
      const usualRideTime = (savedTrip.usualRideTime != null) ? Math.round(savedTrip.usualRideTime) : "?";
      const predictedRideTime = (savedTrip.predictedRideTime != null) ? Math.round(savedTrip.predictedRideTime) : "?";
      if (usualRideTime !== "?" && predictedRideTime !== "?") {
        const diff = savedTrip.predictedRideTime - savedTrip.usualRideTime;
        const roundedDiff = Math.round(Math.abs(diff));
        const roundedUsualRideTime = (roundedDiff < 1) ? "<1" : roundedDiff;
        if (diff > 0) {
          predictedRideTimeSubText = `${roundedUsualRideTime} ${(roundedUsualRideTime === 1 || roundedUsualRideTime === "<1") ? "minute" : "minutes"} longer than usual`;
        } else {
          predictedRideTimeSubText = `${roundedUsualRideTime} ${(roundedUsualRideTime === 1 || roundedUsualRideTime === "<1") ? "minute" : "minutes"} shorter than usual`;
        }
      }
    }

    let lastUpdated;
    if (savedTrip) {
      if (savedTrip.originVehiclePredictions && savedTrip.originVehiclePredictions.length > 0) {
        lastUpdated = savedTrip.originVehiclePredictions[0].vehicleStatus.lastUpdated;
      } else {
        lastUpdated = savedTrip.lastUpdated;
      }
    }
    let lastUpdatedText;
    let lastUpdatedTextColor;
    if (lastUpdated) {
      const lastUpdatedMoment = moment(lastUpdated);

      lastUpdatedText = `updated ${lastUpdatedMoment.fromNow()}`;

      const diff = moment().diff(lastUpdatedMoment);
      if (moment.duration(diff).minutes() >= 2) {
        lastUpdatedTextColor = "rgb(233, 73, 73)";
      }
    }

    return (
      <Card
        key={this.props.isDarkMode}
        className={"SavedTrip" + (savedTrip ? "" : " loading")}
        style={{
          maxWidth: this.props.isPreview ? 300 : undefined
        }}
        containerStyle={{
          position: 'relative'
        }}
      >
        {
          this.props.canDelete ?
          <div
            className="saved-trip-list-item-delete"
            onClick={this._onTapDeleteSavedTrip}>×</div>
          : null
        }
        <CardTitle
          className="saved-trip-header"
        >
          <div
            className="saved-trip-header-from-station-name"
          >
            {savedTrip ? savedTrip.originStopName : "Loading…"}
          </div>
          <div
            className="saved-trip-header-to-station-name"
          >
            {savedTrip ? `to ${savedTrip.destinationStopName}` : null}
          </div>
        </CardTitle>
        <hr
          style={{
            color: this.context.muiTheme.palette.textColor,
            opacity: this.props.isDarkMode ? 0.2 : 0.3,
            margin: 0
          }}
        />
        <Card
          className={"saved-trip-module" + (savedTrip ? "" : " disabled")}
          initiallyExpanded={true}
          style={{
            boxShadow: null,
            backgroundColor: this.props.isDarkMode ? '#272727' : undefined
          }}
        >
          <CardTitle
            actAsExpander={true}
            showExpandableButton={vehiclePredictions.length > 0}
          >
            <DeviceAccessTime
              style={waitTimeIconStyle}
            />
            <span
              style={{
                fontWeight: 500
              }}
            >
              {timeUntilNextVehicleText}
            </span>
            <span
              style={secondaryHeadingStyle}
            >
              {timeSinceLastVehicleText}
            </span>
          </CardTitle>
          <CardText
            expandable={true}
          >
            <List
              className="saved-trip-module-list"
            >
              {vehiclePredictions}
            </List>
          </CardText>
        </Card>
        <hr
          style={{
            color: this.context.muiTheme.palette.textColor,
            opacity: this.props.isDarkMode ? 0.2 : 0.3,
            margin: 0
          }}
        />
        <Card
          className={"saved-trip-module" + (savedTrip ? "" : " disabled")}
          style={{
            boxShadow: null,
            backgroundColor: this.props.isDarkMode ? '#272727' : undefined
          }}
        >
          <CardTitle>
            <NotificationAirlineSeatReclineNormal
              style={rideIconStyle}
            />
            <span
              style={{
                fontWeight: 500
              }}
            >
              {predictedRideTimeText}
            </span>
            <span
              style={secondaryHeadingStyle}
            >
              {predictedRideTimeSubText}
            </span>
          </CardTitle>
        </Card>
        <div
          style={{
            backgroundColor: this.props.isDarkMode ? '#333' : '#eee',
            width: '100%',
            height: 36,
            color: this.context.muiTheme.palette.secondaryTextColor,
            fontSize: 10
          }}
        >
          <div
            style={{
              display: 'inline-block',
              float: 'left',
              margin: 12,
              color: lastUpdatedTextColor
            }}
          >
            {lastUpdatedText}
          </div>
          <div
            style={{
              display: 'inline-block',
              float: 'right',
              margin: 12
            }}
          >
            powered by <a href="https://aries.dcmetrohero.com" target='_blank'>ARIES for Transit</a>
          </div>
        </div>
      </Card>
    );
  }
});
