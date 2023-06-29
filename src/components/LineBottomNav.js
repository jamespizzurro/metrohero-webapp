import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Reflux from 'reflux';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import StoreMixin from 'reflux-immutable/StoreMixin';

import AppStore from '../stores/AppStore';

import Paper from 'material-ui/Paper';
import {BottomNavigation, BottomNavigationItem} from 'material-ui/BottomNavigation';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(AppStore, 'onStoreChange')
  ],

  propTypes: {
    lineColor: PropTypes.string,
    onClickNavItem: PropTypes.func.isRequired,
    isDarkMode: PropTypes.bool.isRequired,
  },

  getStoreState() {
    return {
      isShowingAnySnackbar: AppStore.get('isShowingAnySnackbar')
    };
  },

  _getSelectedBottomNavItemIndex() {
    let selectedIndex;

    const lineColor = this.props.lineColor;
    if (lineColor === 'red') {
      selectedIndex = 0;
    } else if (lineColor === 'orange') {
      selectedIndex = 1;
    } else if (lineColor === 'silver') {
      selectedIndex = 2;
    } else if (lineColor === 'blue') {
      selectedIndex = 3;
    } else if (lineColor === 'yellow') {
      selectedIndex = 4;
    } else if (lineColor === 'green') {
      selectedIndex = 5;
    }

    return selectedIndex;
  },

  _getLineDot(lineColor) {
    if (!lineColor) {
      return null;
    }

    const lineDotStyle = {
      display: 'inline-block',
      height: 16,
      width: 16,
      marginTop: 2,
      marginLeft: 2,
      marginRight: 2
    };

    if (lineColor === 'red') {
      lineDotStyle.backgroundColor = "#E51636"
    } else if (lineColor === 'orange') {
      lineDotStyle.backgroundColor = "#F68712"
    } else if (lineColor === 'silver') {
      lineDotStyle.backgroundColor = "#9D9F9C"
    } else if (lineColor === 'blue') {
      lineDotStyle.backgroundColor = "#1574C4"
    } else if (lineColor === 'yellow') {
      lineDotStyle.backgroundColor = "#FCD006"
    } else if (lineColor === 'green') {
      lineDotStyle.backgroundColor = "#0FAB4B"
    }

    return (
      <Paper
        key={lineColor}
        style={lineDotStyle}
        zDepth={1}
        circle={true}
      />
    );
  },

  render() {
    const bottom = this.state.isShowingAnySnackbar ? 44 : 0;
    const itemStyle = {
      minWidth: 53,
      maxWidth: 92,
      paddingRight: 0,
      paddingLeft: 0
    };

    return (
      <Paper
        zDepth={1}
        style={{position: 'absolute', bottom: bottom, width: '100%'}}
      >
        <BottomNavigation
          selectedIndex={this._getSelectedBottomNavItemIndex()}
        >
          <BottomNavigationItem
            label="Red"
            icon={this._getLineDot('red')}
            onClick={this.props.onClickNavItem.bind(null, '/line-red')}
            style={itemStyle}
          />
          <BottomNavigationItem
            label="Orange"
            icon={this._getLineDot('orange')}
            onClick={this.props.onClickNavItem.bind(null, '/line-orange')}
            style={itemStyle}
          />
          <BottomNavigationItem
            label="Silver"
            icon={this._getLineDot('silver')}
            onClick={this.props.onClickNavItem.bind(null, '/line-silver')}
            style={itemStyle}
          />
          <BottomNavigationItem
            label="Blue"
            icon={this._getLineDot('blue')}
            onClick={this.props.onClickNavItem.bind(null, '/line-blue')}
            style={itemStyle}
          />
          <BottomNavigationItem
            label="Yellow"
            icon={this._getLineDot('yellow')}
            onClick={this.props.onClickNavItem.bind(null, '/line-yellow')}
            style={itemStyle}
          />
          <BottomNavigationItem
            label="Green"
            icon={this._getLineDot('green')}
            onClick={this.props.onClickNavItem.bind(null, '/line-green')}
            style={itemStyle}
          />
        </BottomNavigation>
      </Paper>
    );
  }
});
