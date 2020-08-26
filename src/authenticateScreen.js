import React, {Component} from 'react';
import {
  StyleSheet,
  Image,
  View,
  TouchableHighlight,
  Alert,
  TextInput,
  Text,
  Modal,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import AsyncStorage from '@react-native-community/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  responsiveScreenHeight,
  responsiveScreenWidth,
  responsiveScreenFontSize,
} from 'react-native-responsive-dimensions';
import getTimeoutSignal from './commonApis';

MaterialCommunityIcons.loadFont();

export default class AuthenticateScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mobileNumber: null,
      isLoading: false,
      otpScreenVisible: false,
      otp: [],
      enteredOTP: null,
    };
  }

  async componentDidMount() {}

  async componentWillUnmount() {}

  sendOtp = async () => {
    const otp = Math.floor(1000 + Math.random() * 9000);
    const URL =
      'https://login.bulksmsgateway.in/sendmessage.php?user=FHCL&password=Fhcl$m$@12@&mobile=' +
      this.state.mobileNumber +
      '&message=OTP for Lavazza Caffè is ' +
      otp +
      '. Please DO NOT SHARE with anyone "Enjoy a safe cup of refreshment" - Lavazza&sender=LVZAPP&type=3';
    console.log(URL);
    /*this.state.otp.push(otp.toString());
    console.log(this.state.otp);
    setTimeout(()=>{this.setState({isLoading: false});},2000)
    this.setState({otpScreenVisible: true});*/
    fetch(URL, {signal: (await getTimeoutSignal(5000)).signal})
      .then((response) => response.json())
      .then(async (resultData) => {
        console.log(resultData);
        if (resultData.status === 'success') {
          this.state.otp.push(otp.toString());
          console.log(this.state.otp);
          this.setState({otpScreenVisible: true});
        } else {
          Alert.alert('', 'Please check the Internet connection', [
            {text: 'Ok'},
          ]);
        }
        this.setState({isLoading: false});
      })
      .catch(async (e) => {
        console.log(e);
        this.setState({isLoading: false});
        Alert.alert('', 'Please check the Internet connection', [{text: 'Ok'}]);
      });
  };

  checkOTPValidity = async () => {
    if (this.state.otp.includes(this.state.enteredOTP)) {
      AsyncStorage.setItem('isUserVerified', 'true');
      this.props.navigation.replace('connectScreen');
      Alert.alert('', 'Registered Successfully', [
        {
          text: 'Ok',
        },
      ]);
    } else {
      Alert.alert('', 'Invalid OTP', [{text: 'Ok'}]);
    }
  };

  onSubmit = async () => {
    if (this.state.mobileNumber !== null && this.state.mobileNumber !== '') {
      if (this.state.mobileNumber.match(/^\d{10}$/)) {
        this.setState({isLoading: true});
        await this.sendOtp();
      } else {
        this.setState({isLoading: false});
        Alert.alert('', 'Invalid Mobile Number Format', [{text: 'Ok'}]);
      }
    } else {
      Alert.alert('', 'Please Enter the Number', [{text: 'Ok'}]);
    }
  };

  render() {
    return (
      <View style={styles.mainContainer}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.registrationScreenContainer}>
              <Image
                style={styles.logoStyleInModal}
                source={require('../assets/lavazza_logo_without_year.png')}
              />
            </View>
            <View style={styles.registrationScreenContainer}>
              <Text style={styles.registrationTextStyle}>Registration</Text>
              <TextInput
                style={styles.mobileNumberInput}
                keyboardType="number-pad"
                placeholder=" Mobile Number"
                fontSize={responsiveScreenFontSize(1.5)}
                onChangeText={(number) => (this.state.mobileNumber = number)}
              />
            </View>
            {this.state.isLoading ? (
              <View style={styles.registrationScreenContainer}>
                <View style={styles.loadingActivityContainer}>
                  <ActivityIndicator size="small" color="#100A45" />
                  <Text style={styles.loadingActivityTextStyle}>
                    Loading...!
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.registrationScreenContainer}>
                <TouchableHighlight
                  underlayColor="#100A45"
                  style={styles.submitButtonStyle}
                  onPress={() => {
                    Keyboard.dismiss();
                    this.onSubmit();
                  }}>
                  <Text style={styles.buttonTextStyle}>Submit</Text>
                </TouchableHighlight>
              </View>
            )}
          </View>
        </View>
        <Modal
          animationType="slide"
          visible={this.state.otpScreenVisible}
          onRequestClose={async () => {
            this.setState({
              otpScreenVisible: false,
              enteredOTP: null,
            });
            this.state.otp = [];
            console.log(this.state.otp);
          }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <MaterialCommunityIcons
                name="close-circle"
                style={styles.modalExitIconStyle}
                onPress={() => {
                  this.setState({
                    otpScreenVisible: false,
                    enteredOTP: null,
                  });
                  this.state.otp = [];
                  console.log(this.state.otp);
                }}
                size={responsiveScreenHeight(3.5)}
              />
              <View style={styles.otpScreenContainer}>
                <Image
                  style={styles.logoStyleInModal}
                  source={require('../assets/lavazza_logo_without_year.png')}
                />
              </View>
              <View style={styles.otpScreenContainer}>
                <Text style={styles.OTPTextStyle}>OTP Verification</Text>
              </View>
              <View style={styles.otpScreenContainer}>
                <OTPInputView
                  style={styles.otpInputView}
                  pinCount={4}
                  autoFocusOnLoad={false}
                  codeInputFieldStyle={styles.otpBoxUnderlineStyleBase}
                  codeInputHighlightStyle={
                    styles.otpBoxUnderlineStyleHighLighted
                  }
                  placeholderTextColor="#100A45"
                  onCodeFilled={(code) => {
                    console.log('code', code);
                    this.state.enteredOTP = code;
                    Keyboard.dismiss();
                    this.checkOTPValidity();
                  }}
                />
              </View>
              <View style={styles.otpScreenContainer}>
                <Text style={styles.otpSentToNumberTextStyle}>
                  OTP has been sent to
                </Text>
                <Text style={styles.otpSentToNumberTextStyle}>
                  +91 {this.state.mobileNumber}
                </Text>
              </View>
              <View style={styles.otpScreenContainer}>
                <TouchableHighlight
                  underlayColor="#100A45"
                  style={styles.resendOtpButtonStyle}
                  onPress={() => {
                    this.sendOtp();
                  }}>
                  <Text style={styles.buttonTextStyle}>Resend OTP</Text>
                </TouchableHighlight>
              </View>
            </View>
          </View>
        </Modal>
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
  },
  modalView: {
    margin: '10%',
    backgroundColor: 'white',
    borderRadius: responsiveScreenWidth(5),
    borderColor: '#100A45',
    borderWidth: responsiveScreenWidth(0.5),
    paddingLeft: responsiveScreenWidth(5),
    paddingRight: responsiveScreenWidth(5),
    paddingBottom: responsiveScreenWidth(5),
    paddingTop: responsiveScreenWidth(2),
  },
  modalExitIconStyle: {
    color: '#100A45',
    left: '95%',
  },
  registrationScreenContainer: {
    marginTop: '5%',
    alignItems: 'center',
  },
  logoStyleInModal: {
    width: responsiveScreenWidth(25),
    height: responsiveScreenHeight(4),
    resizeMode: 'contain',
  },
  registrationTextStyle: {
    color: '#100A45',
    fontSize: responsiveScreenFontSize(1.5),
    fontWeight: 'bold',
  },
  mobileNumberInput: {
    height: responsiveScreenHeight(5),
    width: responsiveScreenWidth(45),
    color: '#100A45',
    borderColor: 'gray',
    borderWidth: responsiveScreenWidth(0.1),
    borderRadius: responsiveScreenWidth(2),
    backgroundColor: '#EBEBEB',
    marginTop: '5%',
  },
  submitButtonStyle: {
    width: responsiveScreenWidth(25),
    height: responsiveScreenHeight(5),
    borderRadius: responsiveScreenHeight(1),
    backgroundColor: '#100A45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingActivityContainer: {
    flexDirection: 'row',
    marginTop: '5%',
  },
  loadingActivityTextStyle: {
    color: '#100A45',
    fontSize: responsiveScreenFontSize(1.5),
  },
  buttonTextStyle: {
    color: 'white',
    fontSize: responsiveScreenFontSize(1.5),
  },
  otpScreenContainer: {
    marginTop: '3%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  OTPTextStyle: {
    color: '#100A45',
    fontSize: responsiveScreenFontSize(1.5),
    fontWeight: 'bold',
    marginTop: '5%',
  },
  otpInputView: {
    width: '75%',
    color: '#100A45',
    height: responsiveScreenHeight(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxUnderlineStyleBase: {
    color: '#100A45',
    borderColor: '#100A45',
  },
  otpBoxUnderlineStyleHighLighted: {
    borderColor: '#100A45',
    color: '#100A45',
  },
  otpSentToNumberTextStyle: {
    fontSize: responsiveScreenFontSize(1.3),
    color: '#6F6D6D',
  },
  resendOtpButtonStyle: {
    width: responsiveScreenWidth(35),
    height: responsiveScreenHeight(5),
    borderRadius: responsiveScreenHeight(1),
    backgroundColor: '#100A45',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
