import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';

import Snackbar from 'material-ui/Snackbar';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin
  ],

  propTypes: {
    isDataStale: PropTypes.bool,
    isNetworkProblem: PropTypes.bool,
    isAppUpdateAvailable: PropTypes.bool
  },

  render() {
    const { isDataStale, isNetworkProblem, isAppUpdateAvailable } = this.props;

    return (
      <Snackbar
        message="App updated. Refresh to apply?"
        action="Yes!"
        bodyStyle={{minWidth: 272}}
        contentStyle={{fontSize: 12}}
        open={!isDataStale && !isNetworkProblem && isAppUpdateAvailable}
        onActionClick={() => window.location.reload(true)}
        onRequestClose={() => { /* do nothing; do not dismiss */ }}
      />
    );
  }
});
