import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import {Tooltip} from 'react-tippy';

export default createReactClass({

  propTypes: {
    Car: PropTypes.string,
    Line: PropTypes.string,
    DestinationName: PropTypes.string,
    realTrainId: PropTypes.string,
    chevronAngle: PropTypes.number,
    areDoorsOpenOnLeft: PropTypes.bool,
    areDoorsOpenOnRight: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
    muiTheme: PropTypes.object.isRequired
  },

  contextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  childContextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  getChildContext() {
    return {
      muiTheme: this.props.muiTheme
    };
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    return (this.props.Car !== nextProps.Car || this.props.Line !== nextProps.Line || this.props.DestinationName !== nextProps.DestinationName || this.props.realTrainId !== nextProps.realTrainId || this.props.chevronAngle !== nextProps.chevronAngle);
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

  render() {
    let color;
    if (this.props.shouldGrayOut) {
      color = this.context.muiTheme.palette.textColor;
    } else if (this.props.Line === 'RD') {
      color = "#E51636";
    } else if (this.props.Line === 'OR') {
      color = "#F68712";
    } else if (this.props.Line === 'SV') {
      color = "#9D9F9C";
    } else if (this.props.Line === 'BL') {
      color = "#1574C4";
    } else if (this.props.Line === 'YL') {
      color = "#FCD006";
    } else if (this.props.Line === 'GR') {
      color = "#0FAB4B";
    } else {
      color = this.context.muiTheme.palette.textColor;
    }

    let trainSvg;
    if (this.props.areDoorsOpenOnLeft) {
      trainSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 92.386 71.959">
          <path fill="${color}" stroke="${this.context.muiTheme.palette.textColor}" stroke-width="3" d="M46.484 0a29.43 8.656 0 00-29.318 8.042c-.148.093-.244.192-.284.298a135.539 135.539 0 00-2.235 6.524 1.629 1.629 0 00-.638-.13H1.625c-.9 0-1.625.726-1.625 1.626v46.686c0 .9.725 1.626 1.625 1.626h11.252c.118.017.238.028.361.029 1.616.008 3.545.011 5.507.014-.105.273-.165.57-.165.88v3.917a2.442 2.442 0 002.448 2.447h50.75a2.442 2.442 0 002.447-2.447v-3.917c0-.31-.06-.607-.164-.88 1.962-.003 3.89-.006 5.506-.014 7.12-.034 6.455-29.25-3.634-56.334A29.43 8.656 0 0046.521 0a29.43 8.656 0 00-.037 0zM36.173 4.563h20.46A2.443 2.443 0 0159.08 7.01v.422a2.442 2.442 0 01-2.448 2.447H36.173a2.442 2.442 0 01-2.448-2.447V7.01a2.443 2.443 0 012.448-2.447zm33.003 3.196a3.01 3.01 0 013.011 3.01 3.01 3.01 0 01-3.01 3.01 3.01 3.01 0 01-3.011-3.01 3.01 3.01 0 013.01-3.01zm-45.479.529a3.01 3.01 0 01.001 0 3.01 3.01 0 013.01 3.01 3.01 3.01 0 01-3.01 3.01 3.01 3.01 0 01-3.01-3.01 3.01 3.01 0 013.01-3.01zm14.22 9.602h16.971v21.879h-16.97v-21.88zm-16.205 2.862h7.157a2.245 2.245 0 012.249 2.25v14.517a2.245 2.245 0 01-2.25 2.25h-7.156c-3.595.293-4.65-1.9-4.452-3.13l2.203-13.637c.199-1.23 1.003-2.25 2.25-2.25zm42.224 0h7.157c1.246 0 2.05 1.02 2.25 2.25l2.202 13.636c.199 1.23-.856 3.424-4.452 3.13h-7.157a2.244 2.244 0 01-2.249-2.249V23.002a2.244 2.244 0 012.25-2.25zM20.293 46.175a4.038 4.038 0 014.038 4.039 4.038 4.038 0 01-4.038 4.039 4.038 4.038 0 01-4.039-4.039 4.038 4.038 0 014.039-4.039zm51.79 0a4.038 4.038 0 014.039 4.039 4.038 4.038 0 01-4.039 4.039 4.038 4.038 0 01-4.038-4.039 4.038 4.038 0 014.038-4.039zm-40.717 3.231a4.993 4.993 0 01.014 0 4.993 4.993 0 014.993 4.993 4.993 4.993 0 01-4.993 4.993 4.993 4.993 0 01-4.993-4.993 4.993 4.993 0 014.979-4.993zm29.616 0a4.993 4.993 0 01.014 0A4.993 4.993 0 0165.99 54.4a4.993 4.993 0 01-4.993 4.993 4.993 4.993 0 01-4.993-4.993 4.993 4.993 0 014.979-4.993z"/>
        </svg>
      `;
    } else if (this.props.areDoorsOpenOnRight) {
      trainSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 92.386 71.959">
          <path fill="${color}" stroke="${this.context.muiTheme.palette.textColor}" stroke-width="3" d="M46.484 0a29.43 8.656 0 00-29.318 8.042c-.148.093-.244.192-.284.298C6.784 35.43 6.116 64.667 13.238 64.7c1.616.008 3.545.011 5.507.014-.105.273-.165.57-.165.88v3.917a2.442 2.442 0 002.448 2.447h50.75a2.442 2.442 0 002.447-2.447v-3.917c0-.31-.06-.607-.164-.88 1.962-.003 3.89-.006 5.506-.014a2.5 2.5 0 00.36-.03h10.834c.9 0 1.625-.725 1.625-1.625V16.36c0-.9-.725-1.625-1.625-1.625H78.376c-.086 0-.17.008-.252.02a135.49 135.49 0 00-2.19-6.388A29.43 8.656 0 0046.52 0a29.43 8.656 0 00-.037 0zM36.173 4.563h20.46A2.443 2.443 0 0159.08 7.01v.422a2.442 2.442 0 01-2.448 2.447H36.173a2.442 2.442 0 01-2.448-2.447V7.01a2.443 2.443 0 012.448-2.447zm33.003 3.196a3.01 3.01 0 013.011 3.01 3.01 3.01 0 01-3.01 3.01 3.01 3.01 0 01-3.011-3.01 3.01 3.01 0 013.01-3.01zm-45.479.529a3.01 3.01 0 01.001 0 3.01 3.01 0 013.01 3.01 3.01 3.01 0 01-3.01 3.01 3.01 3.01 0 01-3.01-3.01 3.01 3.01 0 013.01-3.01zm14.22 9.602h16.971v21.879h-16.97v-21.88zm-16.205 2.862h7.157a2.245 2.245 0 012.249 2.25v14.517a2.245 2.245 0 01-2.25 2.25h-7.156c-3.595.293-4.65-1.9-4.452-3.13l2.203-13.637c.199-1.23 1.003-2.25 2.25-2.25zm42.224 0h7.157c1.246 0 2.05 1.02 2.25 2.25l2.202 13.636c.199 1.23-.856 3.424-4.452 3.13h-7.157a2.244 2.244 0 01-2.249-2.249V23.002a2.244 2.244 0 012.25-2.25zM20.293 46.175a4.038 4.038 0 014.038 4.039 4.038 4.038 0 01-4.038 4.039 4.038 4.038 0 01-4.039-4.039 4.038 4.038 0 014.039-4.039zm51.79 0a4.038 4.038 0 014.039 4.039 4.038 4.038 0 01-4.039 4.039 4.038 4.038 0 01-4.038-4.039 4.038 4.038 0 014.038-4.039zm-40.717 3.231a4.993 4.993 0 01.014 0 4.993 4.993 0 014.993 4.993 4.993 4.993 0 01-4.993 4.993 4.993 4.993 0 01-4.993-4.993 4.993 4.993 0 014.979-4.993zm29.616 0a4.993 4.993 0 01.014 0A4.993 4.993 0 0165.99 54.4a4.993 4.993 0 01-4.993 4.993 4.993 4.993 0 01-4.993-4.993 4.993 4.993 0 014.979-4.993z"/>
        </svg>
      `;
    } else {
      trainSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 92.386 71.959">
          <path fill="${color}" stroke="${this.context.muiTheme.palette.textColor}" stroke-width="3" d="M46.484 0a29.43 8.656 0 00-29.318 8.042c-.148.093-.244.192-.284.298C6.784 35.43 6.116 64.667 13.238 64.7c1.616.008 3.545.011 5.507.014-.105.273-.165.57-.165.88v3.917a2.442 2.442 0 002.448 2.447h50.75a2.442 2.442 0 002.447-2.447v-3.917c0-.31-.06-.607-.164-.88 1.962-.003 3.89-.006 5.506-.014 7.12-.034 6.455-29.25-3.634-56.334A29.43 8.656 0 0046.521 0a29.43 8.656 0 00-.037 0zM36.173 4.563h20.46A2.443 2.443 0 0159.08 7.01v.422a2.442 2.442 0 01-2.448 2.447H36.173a2.442 2.442 0 01-2.448-2.447V7.01a2.443 2.443 0 012.448-2.447zm33.003 3.196a3.01 3.01 0 013.011 3.01 3.01 3.01 0 01-3.01 3.01 3.01 3.01 0 01-3.011-3.01 3.01 3.01 0 013.01-3.01zm-45.479.529a3.01 3.01 0 01.001 0 3.01 3.01 0 013.01 3.01 3.01 3.01 0 01-3.01 3.01 3.01 3.01 0 01-3.01-3.01 3.01 3.01 0 013.01-3.01zm14.22 9.602h16.971v21.879h-16.97zm-16.205 2.862h7.157a2.245 2.245 0 012.249 2.25v14.517a2.245 2.245 0 01-2.25 2.25h-7.156c-3.595.293-4.65-1.9-4.452-3.13l2.203-13.637c.199-1.23 1.003-2.25 2.25-2.25zm42.224 0h7.157c1.246 0 2.05 1.02 2.25 2.25l2.202 13.636c.199 1.23-.856 3.424-4.452 3.13h-7.157a2.244 2.244 0 01-2.249-2.249V23.002a2.244 2.244 0 012.25-2.25zM20.293 46.175a4.038 4.038 0 014.038 4.039 4.038 4.038 0 01-4.038 4.038 4.038 4.038 0 01-4.039-4.038 4.038 4.038 0 014.039-4.039zm51.79 0a4.038 4.038 0 014.039 4.039 4.038 4.038 0 01-4.039 4.038 4.038 4.038 0 01-4.038-4.038 4.038 4.038 0 014.038-4.039zm-40.717 3.231a4.993 4.993 0 01.014 0 4.993 4.993 0 014.993 4.993 4.993 4.993 0 01-4.993 4.993 4.993 4.993 0 01-4.993-4.993 4.993 4.993 0 014.979-4.993zm29.616 0a4.993 4.993 0 01.014 0A4.993 4.993 0 0165.99 54.4a4.993 4.993 0 01-4.993 4.993 4.993 4.993 0 01-4.993-4.993 4.993 4.993 0 014.979-4.993z"/>
        </svg>
      `;
    }

    let chevron;
    if (this.props.chevronAngle != null) {
      const chevronX = Math.sin(this.props.chevronAngle * (Math.PI / 180)) * 24;
      const chevronY = Math.cos(this.props.chevronAngle * (Math.PI / 180)) * 24;
      const chevronRotateString = `rotate(${this.props.chevronAngle + 180}deg)`;
      const chevronStyle = {
        position: 'absolute',
        bottom: -2 + chevronY,
        left: -4 + chevronX,
        width: 32,
        height: 32,
        WebkitTransform: chevronRotateString,
        MozTransform: chevronRotateString,
        msTransform: chevronRotateString,
        OTransform: chevronRotateString,
        transform: chevronRotateString
      };
      chevron = (
        <div
          dangerouslySetInnerHTML={{
            __html: `
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 92.386 15.348">
                <path fill="${color}" stroke="${this.context.muiTheme.palette.textColor}" stroke-width="3" d="M22.75 0h46.886L46.193 15.348z"/>
              </svg>
            `
          }}
          style={chevronStyle}
        >
        </div>
      );
    }

    let component = (
      <div
        className='TrainMarker'
        onClick={this.props.onClick}
      >
        <div
          dangerouslySetInnerHTML={{__html: trainSvg}}
          style={{
            width: 24,
            height: 24
          }}
        />
        {chevron}
      </div>
    );
    if (!this.props.isMobileDevice) {
      let lineText = '';
      if (this.props.DestinationName === 'No Passenger') {
        lineText = ` ${this.props.DestinationName}`;
      } else if (this.props.Line !== 'N/A') {
        lineText = ` ${this._lineCodeToName(this.props.Line)} Line`;
      }

      let destinationText = '';
      if (this.props.DestinationName && this.props.DestinationName !== 'N/A' && this.props.DestinationName !== 'No Passenger') {
        destinationText = ` to ${this.props.DestinationName}`;
      }

      component = (
        <Tooltip
          title={`${this.props.Car !== "N/A" ? this.props.Car : "?"}-car${lineText} Train ${this.props.realTrainId}${destinationText}`}
          position="bottom"
          animateFill={false}
          distance={4}
          followCursor={true}
        >
          {component}
        </Tooltip>
      )
    }

    return component;
  }
});
