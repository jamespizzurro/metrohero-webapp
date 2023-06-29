import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import moment from 'moment';

import {Tooltip} from 'react-tippy';

import Utilities from "../utilities/Utilities";

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin
  ],

  contextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  propTypes: {
    departureStationCode: PropTypes.string,
    lineCode: PropTypes.string,
    directionNumber: PropTypes.number,
    observedDepartureTime: PropTypes.string,
    scheduledDepartureTime: PropTypes.string,
    observedTimeSinceLastDeparture: PropTypes.number,
    directionName: PropTypes.string,
    lineName: PropTypes.string,
    observedNumCars: PropTypes.number,
    trainId: PropTypes.string,
    observedDestinationStationName: PropTypes.string,
    departureStationName: PropTypes.string,
    selectedMetricValue: PropTypes.number,
    selectedMetric: PropTypes.string
  },

  _getTrainColor(value) {
    const hue= ((1 - value) * 120).toString(10);
    return ["hsl(", hue, ",65%,50%)"].join("");
  },

  _getTooltipHeaderText() {
    if (this.props.selectedMetricValue || this.props.selectedMetricValue === 0) {
      if (this.props.selectedMetricValue < -0.5) {
        return <span>{Utilities.displaySeconds(Math.abs(this.props.selectedMetricValue * 60), true).toUpperCase()} EARLY<br/></span>;
      } else if (this.props.selectedMetricValue > 0.5) {
        return <span>{Utilities.displaySeconds(Math.abs(this.props.selectedMetricValue * 60), true).toUpperCase()} LATE<br/></span>;
      } else {
        return <span>ON-TIME<br/></span>;
      }
    } else if (this.props.selectedMetric === 'scheduleDeviation') {
      if (this.props.scheduledDepartureTime) {
        return <span>MISSED<br/></span>;
      } else {
        return <span>UNSCHEDULED<br/></span>;
      }
    } else {
      return null;
    }
  },

  render() {
    let color;
    let bottomLeftText;
    let bottomRightText;

    if (this.props.selectedMetric === 'headwayDeviation') {
      if (this.props.selectedMetricValue || this.props.selectedMetricValue === 0) {
        color = this._getTrainColor(Math.min(Math.max(this.props.selectedMetricValue, 0), 4 /* minutes */) / 4 /* minutes */);
      } else {
        color = "#E4E5E6";
      }

      if (this.props.observedDepartureTime) {
        bottomLeftText = <span>Departed: ~{moment(this.props.observedDepartureTime).format('h:mm:ssa')}</span>;
      } else {
        return false;
      }

      if (this.props.observedTimeSinceLastDeparture || this.props.observedTimeSinceLastDeparture === 0) {
        bottomRightText = <span>{Utilities.displaySeconds(this.props.observedTimeSinceLastDeparture * 60, true)} since last train</span>;
      }
    } else if (this.props.selectedMetric === 'scheduleDeviation') {
      if ((this.props.selectedMetricValue || this.props.selectedMetricValue === 0) && this.props.scheduledDepartureTime) {
        color = this._getTrainColor(Math.min(Math.max(Math.abs(this.props.selectedMetricValue), 0), 4 /* minutes */) / 4 /* minutes */);
      } else {
        color = "#E4E5E6";
      }

      if (this.props.scheduledDepartureTime) {
        bottomLeftText = <span>Scheduled: {moment(this.props.scheduledDepartureTime).format('h:mma')}</span>;
      } else {
        bottomLeftText = <span>Scheduled: n/a</span>;
      }

      if (this.props.observedDepartureTime) {
        bottomRightText = <span>Departed: ~{moment(this.props.observedDepartureTime).format('h:mm:ssa')}</span>;
      } else {
        bottomRightText = <span>Departed: n/a</span>;
      }
    }

    let bottomText;
    if (bottomLeftText && bottomRightText) {
      bottomText = <span><br/>{bottomLeftText}; {bottomRightText}</span>;
    } else if (bottomLeftText) {
      bottomText = <span><br/>{bottomLeftText}</span>;
    } else if (bottomRightText) {
      bottomText = <span><br/>{bottomRightText}</span>;
    }

    let directionText;
    if (this.props.directionName) {
      directionText = <span><nobr>{this.props.directionName}</nobr> </span>;
    }

    let noPassengerText;
    if (this.props.observedDestinationStationName === "No Passenger") {
      noPassengerText = <span><nobr>No Passenger</nobr> </span>;
    }

    let observedNumCarsText;
    if (this.props.observedNumCars || this.props.observedNumCars === 0) {
      observedNumCarsText = <span><nobr>{this.props.observedNumCars}-car</nobr> </span>;
    }

    let trainIdText;
    if (this.props.trainId) {
      trainIdText = <span><nobr>Train {this.props.trainId}</nobr> </span>;
    }

    let destinationText;
    if (this.props.observedDestinationStationName && this.props.observedDestinationStationName !== "No Passenger") {
      destinationText = <span>to <i>{this.props.observedDestinationStationName}</i></span>;
    }

    return (
      <Tooltip
        html={
          <div style={{textAlign: 'left', fontSize: 12}}>
            {this._getTooltipHeaderText()}{directionText}{noPassengerText}{observedNumCarsText}{trainIdText}{destinationText}<br/>
            <span>Departing <i>{this.props.departureStationName}</i></span>
            {bottomText}
          </div>
        }
        position="bottom"
        arrow={true}
        animateFill={false}
        sticky={true}
        distance={0}
      >
        <div
          dangerouslySetInnerHTML={{
            __html: `
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 92.386 71.959">
                <path fill="${color}" d="M46.484 0a29.43 8.656 0 00-29.318 8.042c-.148.093-.244.192-.284.298C6.784 35.43 6.116 64.667 13.238 64.7c1.616.008 3.545.011 5.507.014-.105.273-.165.57-.165.88v3.917a2.442 2.442 0 002.448 2.447h50.75a2.442 2.442 0 002.447-2.447v-3.917c0-.31-.06-.607-.164-.88 1.962-.003 3.89-.006 5.506-.014 7.12-.034 6.455-29.25-3.634-56.334A29.43 8.656 0 0046.521 0a29.43 8.656 0 00-.037 0zM36.173 4.563h20.46A2.443 2.443 0 0159.08 7.01v.422a2.442 2.442 0 01-2.448 2.447H36.173a2.442 2.442 0 01-2.448-2.447V7.01a2.443 2.443 0 012.448-2.447zm33.003 3.196a3.01 3.01 0 013.011 3.01 3.01 3.01 0 01-3.01 3.01 3.01 3.01 0 01-3.011-3.01 3.01 3.01 0 013.01-3.01zm-45.479.529a3.01 3.01 0 01.001 0 3.01 3.01 0 013.01 3.01 3.01 3.01 0 01-3.01 3.01 3.01 3.01 0 01-3.01-3.01 3.01 3.01 0 013.01-3.01zm14.22 9.602h16.971v21.879h-16.97zm-16.205 2.862h7.157a2.245 2.245 0 012.249 2.25v14.517a2.245 2.245 0 01-2.25 2.25h-7.156c-3.595.293-4.65-1.9-4.452-3.13l2.203-13.637c.199-1.23 1.003-2.25 2.25-2.25zm42.224 0h7.157c1.246 0 2.05 1.02 2.25 2.25l2.202 13.636c.199 1.23-.856 3.424-4.452 3.13h-7.157a2.244 2.244 0 01-2.249-2.249V23.002a2.244 2.244 0 012.25-2.25zM20.293 46.175a4.038 4.038 0 014.038 4.039 4.038 4.038 0 01-4.038 4.038 4.038 4.038 0 01-4.039-4.038 4.038 4.038 0 014.039-4.039zm51.79 0a4.038 4.038 0 014.039 4.039 4.038 4.038 0 01-4.039 4.038 4.038 4.038 0 01-4.038-4.038 4.038 4.038 0 014.038-4.039zm-40.717 3.231a4.993 4.993 0 01.014 0 4.993 4.993 0 014.993 4.993 4.993 4.993 0 01-4.993 4.993 4.993 4.993 0 01-4.993-4.993 4.993 4.993 0 014.979-4.993zm29.616 0a4.993 4.993 0 01.014 0A4.993 4.993 0 0165.99 54.4a4.993 4.993 0 01-4.993 4.993 4.993 4.993 0 01-4.993-4.993 4.993 4.993 0 014.979-4.993z"/>
              </svg>
            `
          }}
          style={{
            display: 'inline-block',
            width: 24,
            height: 24
          }}
        >
        </div>
      </Tooltip>
    )
  }
});
