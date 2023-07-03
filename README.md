# MetroHero Webapp

The webapp for the MetroHero project, a (now defunct) app for WMATA Metrorail commuters and transit nerds in and around the DC area. This repository contains all the client-side source code for the webapp. For MetroHero's server-side source code, see [the MetroHero server repository](https://github.com/jamespizzurro/metrohero-server).

This project requires a live connection to an instance of [the MetroHero server](https://github.com/jamespizzurro/metrohero-server). Check out that repository for more information. It includes the latest official build of this webapp inside of it, so if you're only looking to use MetroHero as-is, you may not need to use this repository at all.

## Setup

1. Replace the Google API key `AIzaSyC5JJA1M_5GtVLwvWQzVa-yWkkG-woykZM` in src/components/RealtimeMap.js with your own key. (This key has been deactivated and doesn't do anything.) You can follow [this guide](https://developers.google.com/maps/documentation/javascript/get-api-key) to generate your own key. If you don't do this, the 'Live Google Map' feature of the app won't work properly.
2. Replace the Google Analytics 4 API key `G-7PMPTFBSB3` in src/components/App.js with your own key. (This key has been deactivated and doesn't do anything.) You can follow [this guide](https://support.google.com/analytics/answer/9304153) to generate your own key. If you don't do this, you won't be able to collect anonymized data about how users are using the webapp via Google Analytics, e.g. what pages they're visiting and when.

## Developer Setup

1. Globally install [nvm](https://github.com/creationix/nvm)
2. Globally install node: `nvm install 10.24.1` (you can try newer versions, but YMMV)
3. Globally install gulp (using the same version defined in package.json): `npm install --global gulp-cli@^2.3.0`
4. (Optional) Globally install [npm-check](https://www.npmjs.com/package/npm-check) to periodically try upgrading packages and whatnot.
5. Run `npm install` in the project directory to install dependencies. If you get errors, e.g. with a newer version of Node and npm, try `npm install --legacy-peer-deps`.

## Developer Usage

To test against a running local instance of metrohero-server:
  ```
  ./node_modules/gulp-cli/bin/gulp.js watch --test
  ```

Or, to test against live production:
  ```
  ./node_modules/gulp-cli/bin/gulp.js watch --production
  ```

Your browser should start automatically. Wait a few seconds for it to load.

Once initial loading is complete, make changes to the project. Any changes you make should then take effect within a few seconds if you go back and look at them in your browser. You may need to re-navigate to the page you were on in the webapp once refreshing is complete.

## Deploying Changes

1. Modify the value of the `stage` attribute in the `scripts` object of the package.json file located in the same directory as this README to target the relative path of where your local MetroHero Server source code is checked out. The bit that you'll want to replace in that `stage` attribute value is this: `../metrohero-server/src/main/webapp`
2. Run `gulp build`
3. Run `npm run stage`
4. Start MetroHero Server or, if it's already started, simply hard refresh your browser to see your changes.
5. Once you're satisfied with the changes, use `git` to push your changes to production or whatever other workflow you've established for releasing to your production environment; change control of the compiled/built webapp code is handled by MetroHero Server, not MetroHero Webapp itself.
