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
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
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
import {LAVAZZA_SERVER_ENDPOINT, SUCCESS, TOKEN} from './macros';

MaterialCommunityIcons.loadFont();

export default class AuthenticateScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mobileNumber: null,
      isLoading: false,
      otpScreenVisible: false,
      otpTimeout: null,
      otpTimeoutVisible: false,
      otp: [],
      enteredOTP: null,
    };
  }

  async componentDidMount() {}

  async componentWillUnmount() {}

  sendOtp = async () => {
    const otpRequestData = {
      mobileNumber: this.state.mobileNumber,
    };
    console.log(LAVAZZA_SERVER_ENDPOINT);
    fetch(LAVAZZA_SERVER_ENDPOINT + '/otpRequest', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        tokenId: TOKEN,
      },
      body: JSON.stringify(otpRequestData),
      signal: (await getTimeoutSignal(30000)).signal,
    })
      .then((response) => response.json())
      .then(async (resultData) => {
        console.log(resultData);
        if (resultData.status === SUCCESS) {
          this.state.otp.push(resultData.otp);
          console.log(this.state.otp);
          this.setState({
            isLoading: false,
            otpScreenVisible: true,
            otpTimeoutVisible: true,
            otpTimeout: 90,
          });
          this.intervalId = setInterval(async () => {
            this.setState({otpTimeout: this.state.otpTimeout - 1});
            console.log(this.state.otpTimeout);
            if (this.state.otpTimeout === 0) {
              clearInterval(this.intervalId);
              this.setState({otpTimeoutVisible: false, otpTimeout: null});
            }
          }, 1000);
        } else {
          Alert.alert('', 'Something went wrong Please Try again', [
            {text: 'Ok'},
          ]);
          this.setState({isLoading: false});
        }
      })
      .catch(async (e) => {
        console.log(e);
        this.setState({isLoading: false});
        Alert.alert(
          '',
          'Something went wrong Please check the Internet connection',
          [{text: 'Ok'}],
        );
      });
  };

  checkOTPValidity = async () => {
    if (this.state.otp.includes(this.state.enteredOTP)) {
      clearInterval(this.intervalId);
      this.setState({otpTimeoutVisible: false, otpTimeout: null});
      Alert.alert('', 'Registered Successfully', [
        {
          text: 'Ok',
        },
      ]);
      AsyncStorage.setItem('isUserVerified', 'true');
      this.props.navigation.replace('connectScreen');
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

  onClosingOtpScreen = async () => {
    clearInterval(this.intervalId);
    this.setState({
      otpScreenVisible: false,
      enteredOTP: null,
      otpTimeoutVisible: false,
      otpTimeout: null,
      isLoading: false,
    });

    this.state.otp = [];
    console.log(this.state.otp);
  };

  render() {
    return (
      <View style={styles.mainContainer}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={styles.registrationScreenContainer}>
                <Image
                  style={styles.logoStyleInModal}
                  source={require('../assets/lavazza_logo_without_year.png')}
                />
              </View>
              <View style={styles.registrationScreenContainer}>
                <Text style={styles.registrationTextStyle}>
                  User Registration
                </Text>
                <TextInput
                  style={styles.mobileNumberInput}
                  keyboardType="number-pad"
                  selectionColor="#100A45"
                  maxLength={10}
                  placeholder="Enter phone number"
                  fontSize={responsiveScreenFontSize(1.5)}
                  onChangeText={(number) => (this.state.mobileNumber = number)}
                />
              </View>
              {this.state.isLoading ? (
                <View style={styles.registrationScreenContainer}>
                  <View style={styles.loadingActivityContainer}>
                    <ActivityIndicator size="small" color="#100A45" />
                    <Text style={styles.loadingActivityTextStyle}>
                      {' '}
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
                      this.onSubmit();
                    }}>
                    <Text style={styles.buttonTextStyle}>Submit</Text>
                  </TouchableHighlight>
                </View>
              )}
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
        <Modal
          animationType="slide"
          visible={this.state.otpScreenVisible}
          onRequestClose={async () => {
            this.onClosingOtpScreen();
          }}>
          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            accessible={false}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.centeredView}>
              <View style={styles.modalView}>
                <MaterialCommunityIcons
                  name="close-circle"
                  style={styles.modalExitIconStyle}
                  onPress={() => {
                    this.onClosingOtpScreen();
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
                    secureTextEntry={true}
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
                    +91 xxxxxx{this.state.mobileNumber % 10000}
                  </Text>
                </View>
                {this.state.otpTimeoutVisible ? (
                  <View style={styles.otpScreenContainer}>
                    <Text style={styles.timeoutTextStyle}>
                      Resend OTP in {this.state.otpTimeout} Sec
                    </Text>
                  </View>
                ) : this.state.isLoading ? (
                  <View style={styles.otpScreenContainer}>
                    <View style={styles.loadingActivityContainer}>
                      <ActivityIndicator size="small" color="#100A45" />
                      <Text style={styles.loadingActivityTextStyle}>
                        {' '}
                        Loading...!
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.otpScreenContainer}>
                    <TouchableHighlight
                      underlayColor="#100A45"
                      style={styles.resendOtpButtonStyle}
                      onPress={() => {
                        this.setState({isLoading: true});
                        //setTimeout(async()=>{await this.sendOtp()},3000)
                        this.sendOtp();
                      }}>
                      <Text style={styles.buttonTextStyle}>Resend OTP</Text>
                    </TouchableHighlight>
                  </View>
                )}
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    marginTop: '7%',
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
    width: responsiveScreenWidth(50),
    textAlign: 'center',
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
    fontWeight: 'bold',
    fontSize: responsiveScreenFontSize(1.5),
  },
  buttonTextStyle: {
    color: 'white',
    fontSize: responsiveScreenFontSize(1.5),
  },
  timeoutTextStyle: {
    color: '#100A45',
    fontWeight: 'bold',
    fontSize: responsiveScreenFontSize(1.2),
  },
  otpScreenContainer: {
    marginTop: '2%',
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
