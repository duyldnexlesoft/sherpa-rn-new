import React, {useEffect} from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import AppNavigator from './app/navigation/AppNavigator';
// import {SENTRY_DSN, MAPBOX_ACCESS_TOKEN, STRIPE_PUBLISHABLE_KEY} from '@env';
import * as Sentry from '@sentry/react-native';
import {ErrorBoundary} from './app/errors/ErrorBoundary';
import {Provider} from 'react-redux';
import store from './app/store/store';
import './reactotronConfig';
import 'locales/i18next';
import './global.css';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StripeProvider} from '@stripe/stripe-react-native';
// import Mapbox from '@rnmapbox/maps';
import {Dimensions, StatusBar} from 'react-native';
let deviceHeight = Dimensions.get('screen').height;
let windowHeight = Dimensions.get('window').height;
// Mapbox.setAccessToken('MAPBOX_ACCESS_TOKEN');

// if (SENTRY_DSN) {
//   Sentry.init({
//     dsn: SENTRY_DSN,
//     enableAppHangTracking: false,
//   });
// }

const queryClient = new QueryClient();

function App(): React.JSX.Element {
  const navHeight = deviceHeight - windowHeight - (StatusBar.currentHeight || 0);
  // useEffect(() => {
  //   Mapbox.setTelemetryEnabled(false);
  //   Mapbox.Logger.setLogCallback(log => {
  //     if (log.message.includes('RNMBX-mapview-callouts_drag')) {
  //       return true;
  //     }
  //     if (log.message.includes('RNMBX-mapview-point-annotations_drag')) {
  //       return true;
  //     }
  //     return false;
  //   });
  // }, []);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{flex: 1, paddingBottom: navHeight > 20 ? navHeight : 0}}>
          <ErrorBoundary>
            {/* <StripeProvider publishableKey={'STRIPE_PUBLISHABLE_KEY'}> */}
              <AppNavigator />
            {/* </StripeProvider> */}
          </ErrorBoundary>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
