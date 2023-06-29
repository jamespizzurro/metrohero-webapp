import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';

import ActionThumbUp from 'material-ui/svg-icons/action/thumb-up';
import ActionThumbDown from 'material-ui/svg-icons/action/thumb-down';

import {red400, green400} from 'material-ui/styles/colors';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin
  ],

  propTypes: {
    Group: PropTypes.string,
    morePositiveTags: PropTypes.bool,
    moreNegativeTags: PropTypes.bool,
    trainId: PropTypes.string,
    Line: PropTypes.string,
    DestinationName: PropTypes.string,
    Car: PropTypes.string,
    Min: PropTypes.string,
    isSlowOrHolding: PropTypes.bool,
    isTrainDelayed: PropTypes.bool,
    isScheduled: PropTypes.bool,
    realTrainId: PropTypes.string,
    onClick: PropTypes.func
  },

  contextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  render() {
    let rating;
    const ratingStyle = {
      position: 'absolute',
      width: 16,
      height: 16,
      top: 12,
      left: 11,
      borderRadius: '50%',
      color: 'rgb(255, 255, 255)',
      backgroundColor: (this.props.morePositiveTags ? green400 : red400),
      border: `1px ${this.context.muiTheme.palette.canvasColor} solid`
    };
    const iconStyle ={
      display: 'inline-block',
      fill: '#fff',
      width: 12,
      height: 12,
      marginBottom: 1,
      marginLeft: 2
    };
    if (this.props.morePositiveTags) {
      rating = <div style={ratingStyle}><ActionThumbUp style={iconStyle} /></div>;
    } else if (this.props.moreNegativeTags) {
      rating = <div style={ratingStyle}><ActionThumbDown style={iconStyle} /></div>;
    }

    let color;
    if (this.props.shouldGrayOut) {
      color = null;
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
    }

    return (
      <div className="StationDialogTrainRow" onClick={this.props.onClick.bind(null, this.props.trainId)}>
        <div className={`list-item-icon${this.props.isScheduled ? ' scheduled' : ''}`}>
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
          {
            (this.props.Group !== '1') ?
              <div
                className="left"
                dangerouslySetInnerHTML={{
                  __html: `
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 92.386 15.348">
                      <path fill="${color}" stroke="${this.context.muiTheme.palette.canvasColor}" stroke-width="1" d="M22.75 0h46.886L46.193 15.348z"/>
                    </svg>
                  `
                }}
                style={{
                  width: 24,
                  height: 24
                }}
              />
              :
              <div
                className="right"
                dangerouslySetInnerHTML={{
                  __html: `
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 92.386 15.348">
                      <path fill="${color}" stroke="${this.context.muiTheme.palette.canvasColor}" stroke-width="1" d="M22.75 15.348h46.886L46.193 0z"/>
                    </svg>
                  `
                }}
                style={{
                  width: 24,
                  height: 24
                }}
              />
          }
          {rating}
        </div>
        <div className="list-item-text">
          <div className="list-item-text-primary">
            {this.props.DestinationName}
          </div>
          <div className="list-item-text-secondary" style={{color: this.context.muiTheme.palette.secondaryTextColor}}>
            <span>{(this.props.Car !== 'N/A') ? this.props.Car : '?'} cars</span>
            <span className="train-id" style={{display: !this.props.realTrainId ? 'none' : undefined}}> · Train {this.props.realTrainId}</span>
          </div>
        </div>
        <div className="list-item-text eta">
          <div className="list-item-text-primary">
            {this.props.Min + (this.props.isSlowOrHolding ? '*' : '')}
          </div>
          <div className="list-item-text-secondary eta" style={{color: this.context.muiTheme.palette.secondaryTextColor}}>
            {this.props.isTrainDelayed ? 'delayed' : ''}
          </div>
        </div>
      </div>
    );
  }
});
