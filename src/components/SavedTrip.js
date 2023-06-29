import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import ga from 'react-ga4';
import moment from 'moment';

import AddSavedTripActions from '../actions/AddSavedTripActions';

import {Card, CardTitle, CardText} from 'material-ui/Card';
import {List, ListItem} from 'material-ui/List';
import Linkify from 'react-linkify';
import Paper from 'material-ui/Paper';
import AlertWarning from 'material-ui/svg-icons/alert/warning';
import NotificationAirlineSeatReclineNormal from 'material-ui/svg-icons/notification/airline-seat-recline-normal';
import Chip from 'material-ui/Chip';
import DeviceAccessTime from 'material-ui/svg-icons/device/access-time';
import MapsTransferWithinAStation from 'material-ui/svg-icons/maps/transfer-within-a-station';
import FlatButton from 'material-ui/FlatButton';
import MapsPlace from 'material-ui/svg-icons/maps/place';
import ActionSettingsEthernet from 'material-ui/svg-icons/action/settings-ethernet';

import SavedTripChart from './SavedTripChart';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin
  ],

  contextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  propTypes: {
    savedTrip: PropTypes.object,
    savedTripKey: PropTypes.string,
    lineCodes: PropTypes.array,
    stationCode: PropTypes.string,
    onClickNavItem: PropTypes.func,
    onClickTrain: PropTypes.func,
    isPreview: PropTypes.bool,
    isSavedTripLoading: PropTypes.bool,
    isDarkMode: PropTypes.bool
  },

  _signalSvg: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 1000 1000" width="8px" height="8px" enable-background="new 0 0 1000 1000" xml:space="preserve"><g><path d="M132.5,745C64.8,745,10,799.8,10,867.5S64.8,990,132.5,990S255,935.2,255,867.5S200.2,745,132.5,745z M10,362.2v168.4c253.7,0,459.4,205.7,459.4,459.4h168.4C637.8,643.2,356.7,362.2,10,362.2z M10,10v168.4c448.2,0,811.6,363.4,811.6,811.6H990C990,448.8,551.2,10,10,10z"/></g></svg>`,
  _twitterSvg: `<svg viewBox="328 355 335 276" width="22px" height="22px" xmlns="http://www.w3.org/2000/svg" > <path d=" M 630, 425 A 195, 195 0 0 1 331, 600 A 142, 142 0 0 0 428, 570 A 70, 70 0 0 1 370, 523 A 70, 70 0 0 0 401, 521 A 70, 70 0 0 1 344, 455 A 70, 70 0 0 0 372, 460 A 70, 70 0 0 1 354, 370 A 195, 195 0 0 0 495, 442 A 67, 67 0 0 1 611, 380 A 117, 117 0 0 0 654, 363 A 65, 65 0 0 1 623, 401 A 117, 117 0 0 0 662, 390 A 65, 65 0 0 1 630, 425 Z" style="fill:#3BA9EE;"/> </svg>`,

  _lineCodeToLineColor(lineCode) {
    let lineColor;

    if (lineCode === 'RD') {
      lineColor = "red";
    } else if (lineCode === 'OR') {
      lineColor = "orange";
    } else if (lineCode === 'SV') {
      lineColor = "silver";
    } else if (lineCode === 'BL') {
      lineColor = "blue";
    } else if (lineCode === 'YL') {
      lineColor = "yellow";
    } else if (lineCode === 'GR') {
      lineColor = "green";
    }

    return lineColor;
  },

  _getLineDots(lineCodes) {
    if (!lineCodes) {
      return null;
    }

    const lineDots = [];

    lineCodes.forEach((lineCode) => {
      const lineDotStyle = {
        display: 'inline-block',
        height: 16,
        width: 16,
        marginTop: 2,
        marginLeft: 2,
        marginRight: 2
      };

      if (lineCode === 'RD') {
        lineDotStyle.backgroundColor = "#E51636"
      } else if (lineCode === 'OR') {
        lineDotStyle.backgroundColor = "#F68712"
      } else if (lineCode === 'SV') {
        lineDotStyle.backgroundColor = "#9D9F9C"
      } else if (lineCode === 'BL') {
        lineDotStyle.backgroundColor = "#1574C4"
      } else if (lineCode === 'YL') {
        lineDotStyle.backgroundColor = "#FCD006"
      } else if (lineCode === 'GR') {
        lineDotStyle.backgroundColor = "#0FAB4B"
      }

      lineDots.push(
        <Paper
          key={lineCode}
          style={lineDotStyle}
          zDepth={1}
          circle={true}
        />
      );
    });

    return lineDots;
  },

  _onTapSavedTrip(savedTrip) {
    if (this.props.onClickNavItem && savedTrip.lineCodes && savedTrip.lineCodes.length > 0) {
      const lineColor = this._lineCodeToLineColor(savedTrip.lineCodes[0]);
      if (lineColor) {
        ga.event({
          category: 'Dashboard',
          action: 'Tapped Saved Trip'
        });
        const path = `/line-${lineColor}#${savedTrip.fromStationCode}`;
        ga.send({
          hitType: "pageview",
          page: path
        });

        this.props.onClickNavItem(path);
      }
    }
  },

  _onTapDeleteSavedTrip(savedTrip) {
    AddSavedTripActions.deleteSavedTrip('Metrorail', savedTrip.fromStationCode, savedTrip.toStationCode);
  },

  _buildOutageListItem(outage) {
    const outOfServiceDateTime = moment(outage.outOfServiceDate);
    const estimatedReturnToServiceDateTime = outage.estimatedReturnToServiceDate ? moment(outage.estimatedReturnToServiceDate) : null;

    return (
      <ListItem
        key={outage.unitName}
        className="saved-trip-module-list-item with-secondary-text"
        primaryText={`${outage.locationDescription} at ${outage.stationName} is out for ${outage.symptomDescription.toLowerCase()}`}
        secondaryText={
          <div
            style={{
              height: 30,
              textAlign: 'right',
              fontSize: 12,
              lineHeight: '14px'
            }}
          >
            <div>
              last reported in service {outOfServiceDateTime.fromNow()}
            </div>
            {
              estimatedReturnToServiceDateTime ?
                (
                  <div>
                    expected to return to service {estimatedReturnToServiceDateTime.fromNow()}
                  </div>
                )
                : null
            }
          </div>
        }
        secondaryTextLines={estimatedReturnToServiceDateTime ? 2 : 1}
        disabled
      />
    );
  },

  _getLineColor(lineCode) {
    let color;

    if (lineCode === 'RD') {
      color = "#E51636";
    } else if (lineCode === 'OR') {
      color = "#F68712";
    } else if (lineCode === 'SV') {
      color = "#9D9F9C";
    } else if (lineCode === 'BL') {
      color = "#1574C4";
    } else if (lineCode === 'YL') {
      color = "#FCD006";
    } else if (lineCode === 'GR') {
      color = "#0FAB4B";
    }

    return color;
  },

  _tagTypeCodeToName(tagTypeCode) {
    let tagTypeName;

    if (tagTypeCode === "GOOD_OPERATOR") {
      tagTypeName = "Good Operator";
    } else if (tagTypeCode === "GOOD_RIDE") {
      tagTypeName = "Smooooth Ride";
    } else if (tagTypeCode === "NEW_TRAIN") {
      tagTypeName = "New Train!";
    } else if (tagTypeCode === "EMPTY") {
      tagTypeName = "(Mostly) Empty";
    } else if (tagTypeCode === "BAD_OPERATOR") {
      tagTypeName = "Bad Operator";
    } else if (tagTypeCode === "CROWDED") {
      tagTypeName = "Too Crowded";
    } else if (tagTypeCode === "UNCOMFORTABLE_TEMPS") {
      tagTypeName = "Too Hot/Cold";
    } else if (tagTypeCode === "RECENTLY_OFFLOADED") {
      tagTypeName = "Recently Offloaded";
    } else if (tagTypeCode === "UNCOMFORTABLE_RIDE") {
      tagTypeName = "Bumpy/Jerky Ride";
    } else if (tagTypeCode === "ISOLATED_CARS") {
      tagTypeName = "Isolated Cars";
    } else if (tagTypeCode === "WRONG_NUM_CARS") {
      tagTypeName = "Wrong # of Cars";
    } else if (tagTypeCode === "WRONG_DESTINATION") {
      tagTypeName = "Wrong Destination";
    } else if (tagTypeCode === "NEEDS_WORK") {
      tagTypeName = "Needs Cleaning/Work";
    } else if (tagTypeCode === "BROKEN_INTERCOM") {
      tagTypeName = "Broken Intercom";
    } else if (tagTypeCode === "DISRUPTIVE_PASSENGER") {
      tagTypeName = "Disruptive Passenger";
    }

    return tagTypeName;
  },

  _isTagPositive(tagTypeCode) {
    return (tagTypeCode === "GOOD_OPERATOR" || tagTypeCode === "GOOD_RIDE" || tagTypeCode === "NEW_TRAIN" || tagTypeCode === "EMPTY");
  },

  _buildTrainPredictionListItem(trainPrediction) {
    const signalIconStyle = {
      display: 'inline-block',
      verticalAlign: 'middle',
      marginRight: 4,
      height: 20,
      fill: this.context.muiTheme.palette.textColor
    };
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

    let etaText;
    if (trainPrediction.Min === "BRD") {
      etaText = "boarding now";
    } else if (trainPrediction.Min === "ARR") {
      etaText = "arriving now";
    } else if (trainPrediction.Min === "1") {
      etaText = "1 minute away";
    } else if (trainPrediction.isScheduled) {
      etaText = `scheduled to depart @ ${trainPrediction.Min}`;
    } else {
      etaText = `${trainPrediction.Min} minutes away`;
    }

    let blinkIcon;
    if (!trainPrediction.isScheduled) {
      blinkIcon = (
        <span
          className="blink"
          dangerouslySetInnerHTML={{
            __html: this._signalSvg
          }}
          style={signalIconStyle}
        />
      );
    }

    let trainIdChip;
    if (trainPrediction.realTrainId) {
      const trainIdChipLabelStyle = {
        height: chipLabelStyle.height,
        margin: chipLabelStyle.margin,
        paddingLeft: chipLabelStyle.paddingLeft,
        paddingRight: chipLabelStyle.paddingRight,
        fontSize: chipLabelStyle.fontSize,
        lineHeight: chipLabelStyle.lineHeight,
        color: chipLabelStyle.color
      };

      trainIdChip = (
        <Chip
          style={chipStyle}
          labelStyle={trainIdChipLabelStyle}
          backgroundColor={this.props.isDarkMode ? '#aaa' : undefined}
        >
          {`Train ${trainPrediction.realTrainId}`}
        </Chip>
      );
    }

    let numCarsChip;
    if (trainPrediction.Car !== "N/A") {
      const numCarsChipLabelStyle = {
        height: chipLabelStyle.height,
        margin: chipLabelStyle.margin,
        paddingLeft: chipLabelStyle.paddingLeft,
        paddingRight: chipLabelStyle.paddingRight,
        fontSize: chipLabelStyle.fontSize,
        lineHeight: chipLabelStyle.lineHeight,
        color: chipLabelStyle.color
      };

      numCarsChip = (
        <Chip
          style={chipStyle}
          labelStyle={numCarsChipLabelStyle}
          backgroundColor={(trainPrediction.Car === "8") ? "rgb(150, 233, 150)" : (this.props.isDarkMode ? '#aaa' : undefined)}
        >
          {`${trainPrediction.Car} cars`}
        </Chip>
      );
    }

    let holdingChip;
    if (trainPrediction.isCurrentlyHoldingOrSlow && trainPrediction.secondsSinceLastMoved) {
      const numMinutesHolding = Math.round(trainPrediction.secondsSinceLastMoved / 60);
      holdingChip = (
        <Chip
          style={chipStyle}
          labelStyle={chipLabelStyle}
          backgroundColor="rgb(233, 150, 150)"
        >
          {`holding for past ${numMinutesHolding} ${numMinutesHolding === 1 ? "min" : "mins"}`}
        </Chip>
      );
    }

    let delayedChip;
    if (trainPrediction.secondsOffSchedule >= 300) {
      const numMinutesDelayed = Math.round(trainPrediction.secondsOffSchedule / 60);
      delayedChip = (
        <Chip
          style={chipStyle}
          labelStyle={chipLabelStyle}
          backgroundColor="rgb(233, 150, 150)"
        >
          {`delayed ${numMinutesDelayed} ${numMinutesDelayed === 1 ? "min" : "mins"}`}
        </Chip>
      );
    }

    let trainTagChips = [];
    if (trainPrediction.numTagsByType) {
      Object.keys(trainPrediction.numTagsByType).forEach((tagType) => {
        const trainTagName = this._tagTypeCodeToName(tagType);
        if (trainTagName) {
          trainTagChips.push(
            <Chip
              key={tagType}
              style={chipStyle}
              labelStyle={chipLabelStyle}
              backgroundColor={this._isTagPositive(tagType) ? "rgb(150, 233, 150)" : "rgb(233, 150, 150)"}
            >
              {trainTagName.toLowerCase()}
            </Chip>
          );
        }
      });
    }

    return (
      <div
        className="saved-trip-module-list-item-wrapper clickable"
        key={trainPrediction.trainId}
        onClick={this.props.onClickTrain ? this.props.onClickTrain.bind(null, trainPrediction.trainId, this.props.savedTrip.fromStationName, this.props.savedTripKey) : null}
      >
        <ListItem
          className="saved-trip-module-list-item with-left-icon with-secondary-text"
          leftIcon={
            <div
              dangerouslySetInnerHTML={{
                __html: `
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 92.386 71.959">
                    <path fill="${this._getLineColor(trainPrediction.Line)}" d="M46.484 0a29.43 8.656 0 00-29.318 8.042c-.148.093-.244.192-.284.298C6.784 35.43 6.116 64.667 13.238 64.7c1.616.008 3.545.011 5.507.014-.105.273-.165.57-.165.88v3.917a2.442 2.442 0 002.448 2.447h50.75a2.442 2.442 0 002.447-2.447v-3.917c0-.31-.06-.607-.164-.88 1.962-.003 3.89-.006 5.506-.014 7.12-.034 6.455-29.25-3.634-56.334A29.43 8.656 0 0046.521 0a29.43 8.656 0 00-.037 0zM36.173 4.563h20.46A2.443 2.443 0 0159.08 7.01v.422a2.442 2.442 0 01-2.448 2.447H36.173a2.442 2.442 0 01-2.448-2.447V7.01a2.443 2.443 0 012.448-2.447zm33.003 3.196a3.01 3.01 0 013.011 3.01 3.01 3.01 0 01-3.01 3.01 3.01 3.01 0 01-3.011-3.01 3.01 3.01 0 013.01-3.01zm-45.479.529a3.01 3.01 0 01.001 0 3.01 3.01 0 013.01 3.01 3.01 3.01 0 01-3.01 3.01 3.01 3.01 0 01-3.01-3.01 3.01 3.01 0 013.01-3.01zm14.22 9.602h16.971v21.879h-16.97zm-16.205 2.862h7.157a2.245 2.245 0 012.249 2.25v14.517a2.245 2.245 0 01-2.25 2.25h-7.156c-3.595.293-4.65-1.9-4.452-3.13l2.203-13.637c.199-1.23 1.003-2.25 2.25-2.25zm42.224 0h7.157c1.246 0 2.05 1.02 2.25 2.25l2.202 13.636c.199 1.23-.856 3.424-4.452 3.13h-7.157a2.244 2.244 0 01-2.249-2.249V23.002a2.244 2.244 0 012.25-2.25zM20.293 46.175a4.038 4.038 0 014.038 4.039 4.038 4.038 0 01-4.038 4.038 4.038 4.038 0 01-4.039-4.038 4.038 4.038 0 014.039-4.039zm51.79 0a4.038 4.038 0 014.039 4.039 4.038 4.038 0 01-4.039 4.038 4.038 4.038 0 01-4.038-4.038 4.038 4.038 0 014.038-4.039zm-40.717 3.231a4.993 4.993 0 01.014 0 4.993 4.993 0 014.993 4.993 4.993 4.993 0 01-4.993 4.993 4.993 4.993 0 01-4.993-4.993 4.993 4.993 0 014.979-4.993zm29.616 0a4.993 4.993 0 01.014 0A4.993 4.993 0 0165.99 54.4a4.993 4.993 0 01-4.993 4.993 4.993 4.993 0 01-4.993-4.993 4.993 4.993 0 014.979-4.993z"/>
                  </svg>
                `
              }}
              style={{
                top: 6,
                margin: 0,
                width: 24,
                height: 24
              }}
            >
            </div>
          }
          primaryText={`to ${trainPrediction.DestinationName}`}
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
          {trainIdChip}
          {numCarsChip}
          {holdingChip}
          {delayedChip}
          {trainTagChips}
        </div>
      </div>
    );
  },

  _buildMetroAlertListItem(metroAlert) {
    const metroAlertDateTime = moment(metroAlert.date);

    return (
      <ListItem
        key={metroAlert.incidentId}
        className="saved-trip-module-list-item with-secondary-text"
        primaryText={
          <Linkify
            properties={{
              target: 'blank'
            }}
          >
            {metroAlert.description}
          </Linkify>
        }
        secondaryText={`as of ${metroAlertDateTime.fromNow()} (${metroAlertDateTime.format('h:mm a')})`}
        disabled
      />
    );
  },

  _buildTweetListItem(tweet) {
    const tweetDateTime = moment(tweet.date);

    return (
      <ListItem
        key={tweet.twitterId}
        className="saved-trip-module-list-item with-secondary-text"
        primaryText={
          <Linkify
            properties={{
              target: 'blank'
            }}
          >
            {tweet.text}
          </Linkify>
        }
        secondaryText={
          <div>
            <a
              href={tweet.url}
              target='_blank'
            >
              tweeted
            </a>
            &nbsp;
            <span>
              {`${tweetDateTime.fromNow()} (${tweetDateTime.format('h:mm a')})`}
              </span>
          </div>
        }
        disabled
      />
    );
  },

  _buildServiceGapListItem(serviceGap) {
    const timeBetweenTrains = serviceGap.timeBetweenTrains;
    const scheduledTimeBetweenTrains = serviceGap.scheduledTimeBetweenTrains;
    const diffTimeBetweenTrains = (timeBetweenTrains - scheduledTimeBetweenTrains);

    const percentDifference = Math.round((diffTimeBetweenTrains / scheduledTimeBetweenTrains) * 100);

    const lineColor = this._lineCodeToLineColor(serviceGap.lineCode);
    const lineName = lineColor.charAt(0).toUpperCase() + lineColor.slice(1);

    return (
      <ListItem
        key={`${serviceGap.fromTrainId}-${serviceGap.toTrainId}`}
        className="saved-trip-module-list-item"
        primaryText={`${Math.round(timeBetweenTrains)}-minute service gap for ${serviceGap.direction.toLowerCase()} ${lineName} Line trains from ${serviceGap.fromStationName} to ${serviceGap.toStationName}, ${Math.round(diffTimeBetweenTrains)} minutes (${percentDifference}%) longer than scheduled`}
        disabled
      />
    );
  },

  render() {
    const savedTrip = this.props.savedTrip;

    if (savedTrip && !savedTrip.expectedRideTime && !savedTrip.lineCodes) {
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
              For example, if you commute from Glenmont to Vienna, create one trip from Glenmont to Metro Center, then another from Metro Center to Vienna.
            </div>
            <div
              style={{
                marginTop: 8
              }}
            >
              Why do we ask you to split up your trip? We can only predict train movement; variables like crowding conditions and your walking speed can mean the difference between catching and missing your next train.
            </div>
          </CardText>
        </Card>
      );
    }

    const secondaryHeadingStyle = {
      display: 'table',
      fontSize: 14,
      color: this.context.muiTheme.palette.secondaryTextColor
    };

    const escalatorSvg = `<svg version="1.1" x="0px" y="0px" viewBox="0 0 375 375" enable-background="new 0 0 512 512" id="svg3974" width="20px" height="20px" style="fill:${this.context.muiTheme.palette.textColor}"> <path id="path3978" d="m 311,68.5 -88.5,88.6 c -6.2,-18.7 -23.6,-32.3 -44.3,-32.3 -25.9,0 -46.9,21 -46.9,46.9 v 76.6 L 86,293.5 H 0 V 331 h 101.5 l 225,-225 H 375 V 68.5 h -64 z"/><circle id="circle3980" r="28.1" cy="190.39999" cx="246.60001" transform="translate(-68.5,-112.5)" style="fill:${this.context.muiTheme.palette.textColor}"/> <g id="g4623" transform="translate(-68.5,-112.5)"> <path id="path3868" d="m 320.05173,326.46459 96.30704,100.89308 z" style="fill:none;stroke:#F34235;stroke-width:25;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none"/> <path id="path3868-3" d="M 416.35877,326.46459 320.05173,427.35767 z" style="fill:none;stroke:#F34235;stroke-width:25;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none"/> </g> </svg>`;
    const escalatorIconStyle = {
      display: 'inline-block',
      verticalAlign: 'middle',
      marginRight: 10,
      height: 20
    };

    const fromStationOutages = [];
    let numFromStationOutagesText;
    if (savedTrip) {
      const numFromStationElevatorOutages = savedTrip.fromStationElevatorOutages ? savedTrip.fromStationElevatorOutages.length : 0;
      const numFromStationEscalatorOutages = savedTrip.fromStationEscalatorOutages ? savedTrip.fromStationEscalatorOutages.length : 0;
      const numFromStationOutages = numFromStationElevatorOutages + numFromStationEscalatorOutages;
      numFromStationOutagesText = `${numFromStationOutages} elevator/escalator ${(numFromStationOutages === 1) ? "outage" : "outages"}`;
      if (savedTrip.fromStationElevatorOutages) {
        savedTrip.fromStationElevatorOutages.forEach((elevatorOutage) => {
          fromStationOutages.push(this._buildOutageListItem(elevatorOutage));
        });
      }
      if (savedTrip.fromStationEscalatorOutages) {
        savedTrip.fromStationEscalatorOutages.forEach((escalatorOutage) => {
          fromStationOutages.push(this._buildOutageListItem(escalatorOutage));
        });
      }
    }

    const waitTimeIconStyle = {
      display: 'inline-block',
      verticalAlign: 'middle',
      marginRight: 6,
      fontSize: 24
    };
    let timeUntilNextTrainText;
    if (savedTrip && savedTrip.fromStationTrainStatuses && savedTrip.fromStationTrainStatuses.length > 0) {
      let trainStatus = savedTrip.fromStationTrainStatuses[0];
      if ((trainStatus.Min === "BRD" || trainStatus.Min === "ARR") && savedTrip.fromStationTrainStatuses.length >= 2) {
        trainStatus = savedTrip.fromStationTrainStatuses[1];
      }

      const roundedTimeUntilNextTrain = Math.round(trainStatus.minutesAway);
      const roundedTimeUntilNextTrainForDisplay = (roundedTimeUntilNextTrain < 1) ? "<1" : roundedTimeUntilNextTrain;
      timeUntilNextTrainText = `${roundedTimeUntilNextTrainForDisplay} ${(roundedTimeUntilNextTrainForDisplay === 1 || roundedTimeUntilNextTrainForDisplay === "<1") ? "minute" : "minutes"}${(trainStatus.isCurrentlyHoldingOrSlow || trainStatus.isScheduled) ? "*" : ""} until next train`;
    }
    let timeSinceLastTrainText;
    if (savedTrip && savedTrip.timeSinceLastTrain != null) {
      const trainStatus = (savedTrip.fromStationTrainStatuses && savedTrip.fromStationTrainStatuses.length > 0) ? savedTrip.fromStationTrainStatuses[0] : null;
      if (trainStatus && trainStatus.Min === "BRD") {
        timeSinceLastTrainText = "a train is boarding now";
      } else if (trainStatus && trainStatus.Min === "ARR") {
        timeSinceLastTrainText = "a train is arriving now";
      } else {
        const roundedTimeSinceLastTrain = Math.round(savedTrip.timeSinceLastTrain);
        const roundedTimeSinceLastTrainForDisplay = (roundedTimeSinceLastTrain < 1) ? "<1" : roundedTimeSinceLastTrain;
        timeSinceLastTrainText = `last train left ${roundedTimeSinceLastTrainForDisplay} ${(roundedTimeSinceLastTrainForDisplay === 1 || roundedTimeSinceLastTrainForDisplay === "<1") ? "minute" : "minutes"} ago`;
      }
    }
    const trainPredictions = [];
    if (savedTrip && savedTrip.fromStationTrainStatuses) {
      for (let i = 0; i < 3 && i < savedTrip.fromStationTrainStatuses.length; i++) {
        trainPredictions.push(this._buildTrainPredictionListItem(savedTrip.fromStationTrainStatuses[i]));
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
      const expectedRideTime = (savedTrip.expectedRideTime != null) ? Math.round(savedTrip.expectedRideTime) : "?";
      const predictedRideTime = (savedTrip.predictedRideTime != null) ? Math.round(savedTrip.predictedRideTime) : "?";
      if (expectedRideTime !== "?" && predictedRideTime !== "?") {
        const diff = predictedRideTime - expectedRideTime;
        const roundedDiff = Math.round(Math.abs(diff));
        const roundedExpectedRideTime = (roundedDiff < 1) ? "<1" : roundedDiff;
        if (diff > 0) {
          predictedRideTimeSubText = `${roundedExpectedRideTime} ${(roundedExpectedRideTime === 1 || roundedExpectedRideTime === "<1") ? "minute" : "minutes"} longer than usual`;
        } else {
          predictedRideTimeSubText = `${roundedExpectedRideTime} ${(roundedExpectedRideTime === 1 || roundedExpectedRideTime === "<1") ? "minute" : "minutes"} shorter than usual`;
        }
      }
    }
    let rideTimeChart;
    if (savedTrip && savedTrip.recentData) {
      rideTimeChart = (
        <SavedTripChart
          key={this.props.isDarkMode}
          times={savedTrip.recentData.times}
          predictedRideTimes={savedTrip.recentData.predictedRideTimes}
          expectedRideTimes={savedTrip.recentData.expectedRideTimes}
        />
      );
    }

    const metroAlertIconStyle = {
      display: 'inline-block',
      verticalAlign: 'middle',
      marginRight: 6,
      fontSize: 24
    };
    let numMetroAlertsText;
    if (savedTrip) {
      const numMetroAlerts = savedTrip.metroAlerts ? savedTrip.metroAlerts.length : 0;
      numMetroAlertsText = `${numMetroAlerts} relevant ${(numMetroAlerts === 1) ? "MetroAlert" : "MetroAlerts"}`;
    }
    let numMetroAlertsSubText;
    if (savedTrip && savedTrip.metroAlertKeywords && savedTrip.metroAlertKeywords.length > 0) {
      numMetroAlertsSubText = `Metro is reporting ${savedTrip.metroAlertKeywords.join(', ')}`;
    }
    const metroAlerts = [];
    if (savedTrip && savedTrip.metroAlerts) {
      savedTrip.metroAlerts.forEach((metroAlert) => {
        metroAlerts.push(this._buildMetroAlertListItem(metroAlert));
      });
    }

    const twitterIconStyle = {
      display: 'inline-block',
      verticalAlign: 'middle',
      marginRight: 8,
      height: 22
    };
    let numTweetsText;
    if (savedTrip) {
      const numTweets = savedTrip.tweets ? savedTrip.tweets.length : 0;
      numTweetsText = `${numTweets} relevant ${(numTweets === 1) ? "tweet" : "tweets"}`;
    }
    let numTweetsSubText;
    if (savedTrip && savedTrip.tweetKeywords && savedTrip.tweetKeywords.length > 0) {
      numTweetsSubText = `riders are reporting ${savedTrip.tweetKeywords.join(', ')}`;
    }
    const tweets = [];
    if (savedTrip && savedTrip.tweets) {
      savedTrip.tweets.forEach((tweet) => {
        tweets.push(this._buildTweetListItem(tweet));
      });
    }

    const serviceGapIconStyle = {
      display: 'inline-block',
      verticalAlign: 'middle',
      marginRight: 6,
      fontSize: 24
    };
    let numServiceGapsText;
    let numServiceGapsSubText;
    if (savedTrip) {
      const numServiceGaps = savedTrip.serviceGaps ? savedTrip.serviceGaps.length : 0;
      numServiceGapsText = `${numServiceGaps} significant ${(numServiceGaps === 1) ? "service gap" : "service gaps"}`;

      if (numServiceGaps <= 0) {
        numServiceGapsSubText = `en route to ${savedTrip.toStationName}`;
      } else {
        numServiceGapsSubText = `trains may be more crowded than usual`;
      }
    }
    const serviceGaps = [];
    if (savedTrip && savedTrip.serviceGaps) {
      savedTrip.serviceGaps.forEach((serviceGap) => {
        serviceGaps.push(this._buildServiceGapListItem(serviceGap));
      });
    }

    const toStationOutages = [];
    let numToStationOutagesText;
    if (savedTrip) {
      const numToStationElevatorOutages = savedTrip.toStationElevatorOutages ? savedTrip.toStationElevatorOutages.length : 0;
      const numToStationEscalatorOutages = savedTrip.toStationEscalatorOutages ? savedTrip.toStationEscalatorOutages.length : 0;
      const numToStationOutages = numToStationElevatorOutages + numToStationEscalatorOutages;
      numToStationOutagesText = `${numToStationOutages} elevator/escalator ${(numToStationOutages === 1) ? "outage" : "outages"}`;
      if (savedTrip.toStationElevatorOutages) {
        savedTrip.toStationElevatorOutages.forEach((elevatorOutage) => {
          toStationOutages.push(this._buildOutageListItem(elevatorOutage));
        });
      }
      if (savedTrip.toStationEscalatorOutages) {
        savedTrip.toStationEscalatorOutages.forEach((escalatorOutage) => {
          toStationOutages.push(this._buildOutageListItem(escalatorOutage));
        });
      }
    }

    let stationButton;
    if (this.props.onClickNavItem && savedTrip) {
      stationButton = (
        <div
          style={{
            margin: 8
          }}
        >
          <FlatButton
            label={savedTrip ? `View ${savedTrip.fromStationName}` : ''}
            onClick={this._onTapSavedTrip.bind(null, savedTrip)}
            icon={<MapsPlace />}
            primary={true}
            labelStyle={{
              display: 'inline-block',
              maxWidth: 210,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
            style={{
              width: '100%'
            }}
          />
        </div>
      );
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
          this.props.onClickNavItem ?
          <div
            className="saved-trip-list-item-delete"
            onClick={this._onTapDeleteSavedTrip.bind(null, savedTrip)}>×</div>
          : null
        }
        <CardTitle
          className="saved-trip-header clickable"
          onClick={this._onTapSavedTrip.bind(null, savedTrip)}
        >
          <div>
            {savedTrip && savedTrip.lineCodes ? this._getLineDots(savedTrip.lineCodes) : null}
          </div>
          <div
            className="saved-trip-header-from-station-name"
          >
            {savedTrip ? savedTrip.fromStationName : "Loading…"}
          </div>
          <div
            className="saved-trip-header-to-station-name"
          >
            {savedTrip ? `to ${savedTrip.toStationName}` : null}
          </div>
        </CardTitle>
        <Card
          className={"saved-trip-module" + ((fromStationOutages.length <= 0) ? " disabled" : "")}
        >
          <CardTitle
            actAsExpander={true}
            showExpandableButton={fromStationOutages.length > 0}
          >
            <span
              dangerouslySetInnerHTML={{
                __html: escalatorSvg
              }}
              style={escalatorIconStyle}
            />
            <span>
              {numFromStationOutagesText}
            </span>
            <span
              style={secondaryHeadingStyle}
            >
              {savedTrip ? `at ${savedTrip.fromStationName}` : null}
            </span>
          </CardTitle>
          <CardText
            expandable={true}
          >
            <List
              className="saved-trip-module-list"
            >
              {fromStationOutages}
            </List>
          </CardText>
        </Card>
        <Card
          className={"saved-trip-module" + (savedTrip ? "" : " disabled")}
        >
          <CardTitle
            actAsExpander={true}
            showExpandableButton={trainPredictions.length > 0}
          >
            <DeviceAccessTime
              style={waitTimeIconStyle}
            />
            <span
              style={{
                fontWeight: 500
              }}
            >
              {timeUntilNextTrainText}
            </span>
            <span
              style={secondaryHeadingStyle}
            >
              {timeSinceLastTrainText}
            </span>
          </CardTitle>
          <CardText
            expandable={true}
          >
            <List
              className="saved-trip-module-list"
            >
              {trainPredictions}
            </List>
          </CardText>
        </Card>
        <Card
          className={"saved-trip-module" + (savedTrip ? "" : " disabled")}
        >
          <CardTitle
            actAsExpander={true}
            showExpandableButton={!!rideTimeChart}
          >
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
          <CardText
            expandable={true}
          >
            <div
              style={{
                paddingBottom: 12
              }}
            >
              {rideTimeChart}
            </div>
          </CardText>
        </Card>
        <Card
          className={"saved-trip-module" + ((metroAlerts.length <= 0) ? " disabled" : "")}
        >
          <CardTitle
            actAsExpander={true}
            showExpandableButton={metroAlerts.length > 0}
          >
            <AlertWarning
              color={'#FFC107'}
              style={metroAlertIconStyle}
            />
            <span>
              {numMetroAlertsText}
            </span>
            <span
              style={secondaryHeadingStyle}
            >
              {numMetroAlertsSubText}
            </span>
          </CardTitle>
          <CardText
            expandable={true}
          >
            <List
              className="saved-trip-module-list"
            >
              {metroAlerts}
            </List>
          </CardText>
        </Card>
        <Card
          className={"saved-trip-module" + ((tweets.length <= 0) ? " disabled" : "")}
        >
          <CardTitle
            actAsExpander={true}
            showExpandableButton={tweets.length > 0}
          >
            <span
              dangerouslySetInnerHTML={{
                __html: this._twitterSvg
              }}
              style={twitterIconStyle}
            />
            <span>
              {numTweetsText}
            </span>
            <span
              style={secondaryHeadingStyle}
            >
              {numTweetsSubText}
            </span>
          </CardTitle>
          <CardText
            expandable={true}
          >
            <List
              className="saved-trip-module-list"
            >
              {tweets}
            </List>
          </CardText>
        </Card>
        <Card
          className={"saved-trip-module" + ((serviceGaps.length <= 0) ? " disabled" : "")}
        >
          <CardTitle
            actAsExpander={true}
            showExpandableButton={serviceGaps.length > 0}
          >
            <ActionSettingsEthernet
              style={serviceGapIconStyle}
            />
            <span>
              {numServiceGapsText}
            </span>
            <span
              style={secondaryHeadingStyle}
            >
              {numServiceGapsSubText}
            </span>
          </CardTitle>
          <CardText
            expandable={true}
          >
            <List
              className="saved-trip-module-list"
            >
              {serviceGaps}
            </List>
          </CardText>
        </Card>
        <Card
          className={"saved-trip-module" + ((toStationOutages.length <= 0) ? " disabled" : "")}
        >
          <CardTitle
            actAsExpander={true}
            showExpandableButton={toStationOutages.length > 0}
          >
            <span
              dangerouslySetInnerHTML={{
                __html: escalatorSvg
              }}
              style={escalatorIconStyle}
            />
            <span>
              {numToStationOutagesText}
            </span>
            <span
              style={secondaryHeadingStyle}
            >
              {savedTrip ? `at ${savedTrip.toStationName}` : null}
            </span>
          </CardTitle>
          <CardText
            expandable={true}
          >
            <List
              className="saved-trip-module-list"
            >
              {toStationOutages}
            </List>
          </CardText>
        </Card>
        {stationButton}
      </Card>
    );
  }
});
