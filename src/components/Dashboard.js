import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Reflux from 'reflux';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import StoreMixin from 'reflux-immutable/StoreMixin';

import Utilities from '../utilities/Utilities';

import DashboardStore from '../stores/DashboardStore';
import PredictionsStore from '../stores/PredictionsStore';
import AppStore from '../stores/AppStore';

import MDSpinner from "react-md-spinner";
import {Card, CardText} from 'material-ui/Card';
import Paper from 'material-ui/Paper';

import DashboardLineItem from './DashboardLineItem';
import RecentlyVisitedStations from './RecentlyVisitedStations';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(DashboardStore, 'onStoreChange'),
    Reflux.listenTo(PredictionsStore, 'onStoreChange')
  ],

  contextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  propTypes: {
    onClickNavItem: PropTypes.func,
    isDarkMode: PropTypes.bool.isRequired
  },

  getStoreState() {
    return {
      isLoadingLineMetrics: (PredictionsStore.get('data') && PredictionsStore.get('data').get('systemMetrics')) ? !PredictionsStore.get('data').get('systemMetrics').get('lineMetricsByLine') : true,
      hasLineMetrics: (PredictionsStore.get('data') && PredictionsStore.get('data').get('systemMetrics')) ? !!PredictionsStore.get('data').get('systemMetrics').get('lineMetricsByLine') && PredictionsStore.get('data').get('systemMetrics').get('lineMetricsByLine').size > 0 : false,
      isMobileDevice: AppStore.get('isMobileDevice')
    };
  },

  patreonSvg: `
    <svg
      x="0px"
      y="0px"
      viewBox="0 0 541.4375 541.4375"
      width="36px"
      height="36px"
      id="svg3168"
      version="1.1">
      <defs
        id="defs3170" />
      <g
        id="layer1"
        transform="translate(-78.58618,-210.44369)">
        <path
          id="path3204"
          d="m 349.30488,210.44369 c -149.51545,0 -270.7187,121.20325 -270.7187,270.71875 l 0,270.4687 259.375,0 c 3.7608,0.155 7.5448,0.25 11.3437,0.25 149.5155,0 270.7188,-121.2032 270.7188,-270.7187 0,-149.5155 -121.2033,-270.71875 -270.7188,-270.71875 z"
          style="fill:#ff5900;fill-opacity:1;stroke:none" />
        <path
          style="fill:#ffffff;fill-opacity:1;stroke:none"
          d="m 349.30493,273.28744 c -114.80003,0 -207.875,93.07494 -207.875,207.875 l 0,123.90625 0,83.75 0,62.8125 83.1875,0 0,-270.25 c 0,-68.64109 55.64016,-124.3125 124.28125,-124.3125 68.64109,0 124.28125,55.67141 124.28125,124.3125 0,68.64109 -55.64016,124.28125 -124.28125,124.28125 -25.09566,0 -48.463,-7.45836 -68,-20.25 l 0,89.34375 c 13.09042,8.05513 42.97659,13.74429 78.03125,14.03125 110.32856,-5.03362 198.25,-96.05383 198.25,-207.625 0,-114.80006 -93.07493,-207.875 -207.875,-207.875 z m -8.71875,415.53125 c 2.8876,0.1191 5.80191,0.21875 8.71875,0.21875 3.07049,0 6.11821,-0.087 9.15625,-0.21875 l -17.875,0 z"
          id="path3192" />
      </g>
    </svg>
  `,

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

  _getLineDots(lineCodes) {
    const lineDots = [];

    lineCodes.forEach((lineCode, index) => {
      const lineDotStyle = {
        height: 32,
        width: 32,
        margin: 2,
        textAlign: 'center',
        display: 'inline-block',
        color: '#ffffff',
        paddingTop: 8,
        fontSize: 13
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
          zDepth={1}
          circle={true}
          style={lineDotStyle}
        >
          {lineCode}
        </Paper>
      );
    });

    return lineDots;
  },

  render() {
    const lineItems = [];

    if (this.state.isLoadingLineMetrics) {
      lineItems.push(
        <div key={'loading'} style={{display: 'table', position: 'absolute', width: '100%', height: 100}}>
          <div style={{display: 'table-cell', textAlign: 'center', verticalAlign: 'middle'}}>
            <MDSpinner
              size={64}
              singleColor={this.context.muiTheme.palette.accent1Color}
            />
          </div>
        </div>
      );
    } else if (!this.state.hasLineMetrics) {
      lineItems.push(
        <Card key="nodata">
          <CardText style={{textAlign: 'center', maxWidth: 500, margin: '0 auto'}}>
            <strong>There are currently no Dashboard metrics to display.</strong>
            <p>
              You're seeing this message either because our servers have recently restarted, Metrorail is not
              currently operating, or WMATA is experiencing a data service outage. In any case, dashboard metrics will
              appear on this page as soon as they become available. We apologize for any inconvenience.
            </p>
          </CardText>
        </Card>
      );
    } else {
      const lineCodes = Utilities.getRecentlyVisitedLines();
      lineCodes.forEach((lineCode, index) => {
        lineItems.push(
          <DashboardLineItem key={"dli-" + lineCode}
                             lineName={this._lineCodeToName(lineCode)}
                             lineCode={lineCode}
                             onClickNavItem={this.props.onClickNavItem}
                             isDarkMode={this.props.isDarkMode}
          />
        );
      });
    }

    return (
      <div className="Dashboard vertical-scrolling">
        <div style={{marginBottom: '46px'}}>
          <RecentlyVisitedStations
            onClickNavItem={this.props.onClickNavItem}
            isDarkMode={this.props.isDarkMode}
          />
          <div className="alert alert-danger" style={{margin: 12}}>
            <strong>This {this.state.isMobileDevice ? "app" : "website"} will stop working on July 1st, 2023!</strong><br/>
            The MetroHero project is shutting down.<br/>
            For more info, please check out <a href="https://www.patreon.com/posts/end-of-era-78380459" target="_blank">our blog post</a>.
          </div>
          {lineItems}
        </div>
      </div>
    );
  }
});
