import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import {Tooltip} from 'react-tippy';

import ActionThumbUp from 'material-ui/svg-icons/action/thumb-up';
import ActionThumbDown from 'material-ui/svg-icons/action/thumb-down';

import {red400, green400} from 'material-ui/styles/colors';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin
  ],

  contextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  propTypes: {
    numCars: PropTypes.string,
    lineCode: PropTypes.string,
    destinationName: PropTypes.string,
    trainId: PropTypes.string,
    isNotOnRevenueTrack: PropTypes.bool,
    numPositiveTags: PropTypes.number,
    numNegativeTags: PropTypes.number,
    areDoorsOpenOnLeft: PropTypes.bool,
    areDoorsOpenOnRight: PropTypes.bool,
    trackCircuitId: PropTypes.number.isRequired,
    trackCircuitFromX: PropTypes.number.isRequired,
    trackCircuitFromY: PropTypes.number.isRequired,
    trackCircuitToX: PropTypes.number.isRequired,
    trackCircuitToY: PropTypes.number.isRequired,
    trackCircuitZIndex: PropTypes.number.isRequired,
    isDarkMode: PropTypes.bool,
    onClick: PropTypes.func
  },

  render() {
    let rating;
    const ratingStyle = {
      position: 'absolute',
      width: 16,
      height: 16,
      bottom: -5,
      right: -6,
      zIndex: 2,
      borderRadius: '50%',
      color: 'rgb(255, 255, 255)',
      backgroundColor: (this.props.numPositiveTags > this.props.numNegativeTags ? green400 : red400),
      border: `1px ${this.context.muiTheme.palette.canvasColor} solid`
    };
    const iconStyle ={
      display: 'inline-block',
      fill: '#fff',
      width: 12,
      height: 12,
      marginBottom: 1,
      marginLeft: 2,
      marginRight: 0
    };
    if (this.props.numPositiveTags > this.props.numNegativeTags) {
      rating = <div style={ratingStyle}><ActionThumbUp style={iconStyle} /></div>;
    } else if (this.props.numNegativeTags > this.props.numPositiveTags) {
      rating = <div style={ratingStyle}><ActionThumbDown style={iconStyle} /></div>;
    }

    const len = Math.sqrt(Math.pow(this.props.trackCircuitFromX - this.props.trackCircuitToX, 2) + Math.pow(this.props.trackCircuitFromY - this.props.trackCircuitToY, 2));
    const angle = Math.atan((this.props.trackCircuitToY - this.props.trackCircuitFromY) / (this.props.trackCircuitToX - this.props.trackCircuitFromX));
    let color;
    if (this.props.lineCode === 'RD') {
      color = '#E51636';
    } else if (this.props.lineCode === 'OR') {
      color = '#F68712';
    } else if (this.props.lineCode === 'SV') {
      color = '#9D9F9C';
    } else if (this.props.lineCode === 'BL') {
      color = '#1574C4';
    } else if (this.props.lineCode === 'YL') {
      color = '#FCD006';
    } else if (this.props.lineCode === 'GR') {
      color = '#0FAB4B';
    } else {
      color = this.context.muiTheme.palette.textColor;
    }

    const style = {
      width: 24,
      height: 24,
      transform: `translate(${this.props.trackCircuitFromX - .5 * len * (1 - Math.cos(angle))}px, ${this.props.trackCircuitFromY + .5 * len * Math.sin(angle)}px) translate(${(len - 18) / 2}px, ${-20}px) rotate(${angle}rad)`,
      color: color,
      zIndex: this.props.trackCircuitZIndex
    };

    let lineAndDestinatonText = '';
    if (this.props.destinationName === 'No Passenger') {
      lineAndDestinatonText = ` ${this.props.destinationName}`;
    } else if (this.props.lineCode && this.props.lineCode !== 'N/A' && this.props.destinationName && this.props.destinationName !== 'N/A') {
      lineAndDestinatonText = ` ${this.props.lineCode}/${this.props.destinationName}`;
    } else if (this.props.lineCode && this.props.lineCode !== 'N/A') {
      lineAndDestinatonText = ` ${this.props.lineCode}`;
    }

    let trainSvg;
    if (this.props.areDoorsOpenOnLeft) {
      trainSvg = (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 92.386 71.959">
          <path fill={color} stroke={this.context.muiTheme.palette.textColor} strokeWidth="2" d="M46.484 0a29.43 8.656 0 00-29.318 8.042c-.148.093-.244.192-.284.298a135.539 135.539 0 00-2.235 6.524 1.629 1.629 0 00-.638-.13H1.625c-.9 0-1.625.726-1.625 1.626v46.686c0 .9.725 1.626 1.625 1.626h11.252c.118.017.238.028.361.029 1.616.008 3.545.011 5.507.014-.105.273-.165.57-.165.88v3.917a2.442 2.442 0 002.448 2.447h50.75a2.442 2.442 0 002.447-2.447v-3.917c0-.31-.06-.607-.164-.88 1.962-.003 3.89-.006 5.506-.014 7.12-.034 6.455-29.25-3.634-56.334A29.43 8.656 0 0046.521 0a29.43 8.656 0 00-.037 0zM36.173 4.563h20.46A2.443 2.443 0 0159.08 7.01v.422a2.442 2.442 0 01-2.448 2.447H36.173a2.442 2.442 0 01-2.448-2.447V7.01a2.443 2.443 0 012.448-2.447zm33.003 3.196a3.01 3.01 0 013.011 3.01 3.01 3.01 0 01-3.01 3.01 3.01 3.01 0 01-3.011-3.01 3.01 3.01 0 013.01-3.01zm-45.479.529a3.01 3.01 0 01.001 0 3.01 3.01 0 013.01 3.01 3.01 3.01 0 01-3.01 3.01 3.01 3.01 0 01-3.01-3.01 3.01 3.01 0 013.01-3.01zm14.22 9.602h16.971v21.879h-16.97v-21.88zm-16.205 2.862h7.157a2.245 2.245 0 012.249 2.25v14.517a2.245 2.245 0 01-2.25 2.25h-7.156c-3.595.293-4.65-1.9-4.452-3.13l2.203-13.637c.199-1.23 1.003-2.25 2.25-2.25zm42.224 0h7.157c1.246 0 2.05 1.02 2.25 2.25l2.202 13.636c.199 1.23-.856 3.424-4.452 3.13h-7.157a2.244 2.244 0 01-2.249-2.249V23.002a2.244 2.244 0 012.25-2.25zM20.293 46.175a4.038 4.038 0 014.038 4.039 4.038 4.038 0 01-4.038 4.039 4.038 4.038 0 01-4.039-4.039 4.038 4.038 0 014.039-4.039zm51.79 0a4.038 4.038 0 014.039 4.039 4.038 4.038 0 01-4.039 4.039 4.038 4.038 0 01-4.038-4.039 4.038 4.038 0 014.038-4.039zm-40.717 3.231a4.993 4.993 0 01.014 0 4.993 4.993 0 014.993 4.993 4.993 4.993 0 01-4.993 4.993 4.993 4.993 0 01-4.993-4.993 4.993 4.993 0 014.979-4.993zm29.616 0a4.993 4.993 0 01.014 0A4.993 4.993 0 0165.99 54.4a4.993 4.993 0 01-4.993 4.993 4.993 4.993 0 01-4.993-4.993 4.993 4.993 0 014.979-4.993z"/>
        </svg>
      );
    } else if (this.props.areDoorsOpenOnRight) {
      trainSvg = (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 92.386 71.959">
          <path fill={color} stroke={this.context.muiTheme.palette.textColor} strokeWidth="2" d="M46.484 0a29.43 8.656 0 00-29.318 8.042c-.148.093-.244.192-.284.298C6.784 35.43 6.116 64.667 13.238 64.7c1.616.008 3.545.011 5.507.014-.105.273-.165.57-.165.88v3.917a2.442 2.442 0 002.448 2.447h50.75a2.442 2.442 0 002.447-2.447v-3.917c0-.31-.06-.607-.164-.88 1.962-.003 3.89-.006 5.506-.014a2.5 2.5 0 00.36-.03h10.834c.9 0 1.625-.725 1.625-1.625V16.36c0-.9-.725-1.625-1.625-1.625H78.376c-.086 0-.17.008-.252.02a135.49 135.49 0 00-2.19-6.388A29.43 8.656 0 0046.52 0a29.43 8.656 0 00-.037 0zM36.173 4.563h20.46A2.443 2.443 0 0159.08 7.01v.422a2.442 2.442 0 01-2.448 2.447H36.173a2.442 2.442 0 01-2.448-2.447V7.01a2.443 2.443 0 012.448-2.447zm33.003 3.196a3.01 3.01 0 013.011 3.01 3.01 3.01 0 01-3.01 3.01 3.01 3.01 0 01-3.011-3.01 3.01 3.01 0 013.01-3.01zm-45.479.529a3.01 3.01 0 01.001 0 3.01 3.01 0 013.01 3.01 3.01 3.01 0 01-3.01 3.01 3.01 3.01 0 01-3.01-3.01 3.01 3.01 0 013.01-3.01zm14.22 9.602h16.971v21.879h-16.97v-21.88zm-16.205 2.862h7.157a2.245 2.245 0 012.249 2.25v14.517a2.245 2.245 0 01-2.25 2.25h-7.156c-3.595.293-4.65-1.9-4.452-3.13l2.203-13.637c.199-1.23 1.003-2.25 2.25-2.25zm42.224 0h7.157c1.246 0 2.05 1.02 2.25 2.25l2.202 13.636c.199 1.23-.856 3.424-4.452 3.13h-7.157a2.244 2.244 0 01-2.249-2.249V23.002a2.244 2.244 0 012.25-2.25zM20.293 46.175a4.038 4.038 0 014.038 4.039 4.038 4.038 0 01-4.038 4.039 4.038 4.038 0 01-4.039-4.039 4.038 4.038 0 014.039-4.039zm51.79 0a4.038 4.038 0 014.039 4.039 4.038 4.038 0 01-4.039 4.039 4.038 4.038 0 01-4.038-4.039 4.038 4.038 0 014.038-4.039zm-40.717 3.231a4.993 4.993 0 01.014 0 4.993 4.993 0 014.993 4.993 4.993 4.993 0 01-4.993 4.993 4.993 4.993 0 01-4.993-4.993 4.993 4.993 0 014.979-4.993zm29.616 0a4.993 4.993 0 01.014 0A4.993 4.993 0 0165.99 54.4a4.993 4.993 0 01-4.993 4.993 4.993 4.993 0 01-4.993-4.993 4.993 4.993 0 014.979-4.993z"/>
        </svg>
      );
    } else {
      trainSvg = (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 92.386 71.959">
          <path fill={color} stroke={this.context.muiTheme.palette.textColor} strokeWidth="2" d="M46.484 0a29.43 8.656 0 00-29.318 8.042c-.148.093-.244.192-.284.298C6.784 35.43 6.116 64.667 13.238 64.7c1.616.008 3.545.011 5.507.014-.105.273-.165.57-.165.88v3.917a2.442 2.442 0 002.448 2.447h50.75a2.442 2.442 0 002.447-2.447v-3.917c0-.31-.06-.607-.164-.88 1.962-.003 3.89-.006 5.506-.014 7.12-.034 6.455-29.25-3.634-56.334A29.43 8.656 0 0046.521 0a29.43 8.656 0 00-.037 0zM36.173 4.563h20.46A2.443 2.443 0 0159.08 7.01v.422a2.442 2.442 0 01-2.448 2.447H36.173a2.442 2.442 0 01-2.448-2.447V7.01a2.443 2.443 0 012.448-2.447zm33.003 3.196a3.01 3.01 0 013.011 3.01 3.01 3.01 0 01-3.01 3.01 3.01 3.01 0 01-3.011-3.01 3.01 3.01 0 013.01-3.01zm-45.479.529a3.01 3.01 0 01.001 0 3.01 3.01 0 013.01 3.01 3.01 3.01 0 01-3.01 3.01 3.01 3.01 0 01-3.01-3.01 3.01 3.01 0 013.01-3.01zm14.22 9.602h16.971v21.879h-16.97zm-16.205 2.862h7.157a2.245 2.245 0 012.249 2.25v14.517a2.245 2.245 0 01-2.25 2.25h-7.156c-3.595.293-4.65-1.9-4.452-3.13l2.203-13.637c.199-1.23 1.003-2.25 2.25-2.25zm42.224 0h7.157c1.246 0 2.05 1.02 2.25 2.25l2.202 13.636c.199 1.23-.856 3.424-4.452 3.13h-7.157a2.244 2.244 0 01-2.249-2.249V23.002a2.244 2.244 0 012.25-2.25zM20.293 46.175a4.038 4.038 0 014.038 4.039 4.038 4.038 0 01-4.038 4.038 4.038 4.038 0 01-4.039-4.038 4.038 4.038 0 014.039-4.039zm51.79 0a4.038 4.038 0 014.039 4.039 4.038 4.038 0 01-4.039 4.038 4.038 4.038 0 01-4.038-4.038 4.038 4.038 0 014.038-4.039zm-40.717 3.231a4.993 4.993 0 01.014 0 4.993 4.993 0 014.993 4.993 4.993 4.993 0 01-4.993 4.993 4.993 4.993 0 01-4.993-4.993 4.993 4.993 0 014.979-4.993zm29.616 0a4.993 4.993 0 01.014 0A4.993 4.993 0 0165.99 54.4a4.993 4.993 0 01-4.993 4.993 4.993 4.993 0 01-4.993-4.993 4.993 4.993 0 014.979-4.993z"/>
        </svg>
      );
    }

    return (
      <Tooltip
        title={`${this.props.numCars !== "N/A" ? this.props.numCars : "?"}-car${lineAndDestinatonText} Train ${this.props.trainId}`}
        position="bottom"
        animateFill={false}
        distance={4}
        followCursor={true}
      >
        <div
          className='CircuitMapTrainIcon'
          style={style}
          onClick={this.props.onClick ? this.props.onClick : null}
        >
          {trainSvg}
          {rating}
        </div>
      </Tooltip>
    );
  }
});
