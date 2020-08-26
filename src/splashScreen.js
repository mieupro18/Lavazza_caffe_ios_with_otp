import React, {Component} from 'react';
import {StyleSheet, Image, View} from 'react-native';
import {SPLASHSCREEN_VISIBLE_TIME} from './macros';
import AsyncStorage from '@react-native-community/async-storage';
import {
  responsiveScreenHeight,
  responsiveScreenWidth,
} from 'react-native-responsive-dimensions';

export default class SplashScreen extends Component {
  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    //await AsyncStorage.setItem('isUserVerified','');
    const isUserVerified = await AsyncStorage.getItem('isUserVerified');
    console.log(isUserVerified);
    setTimeout(async () => {
      if (isUserVerified === 'true') {
        this.props.navigation.replace('connectScreen');
      } else {
        this.props.navigation.replace('authenticateScreen');
      }
    }, SPLASHSCREEN_VISIBLE_TIME);
  }

  async componentWillUnmount() {}

  render() {
    return (
      <View style={styles.mainContainer}>
        <View style={styles.splashScreenLogoContainer}>
          <Image
            style={styles.splashScreenLogo}
            source={require('../assets/lavazza_logo_with_year.png')}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  splashScreenLogoContainer: {
    flex: 1,
    height: responsiveScreenHeight(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashScreenLogo: {
    width: responsiveScreenWidth(50),
    height: '100%',
    resizeMode: 'contain',
  },
});
