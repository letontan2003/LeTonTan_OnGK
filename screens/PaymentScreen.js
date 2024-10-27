import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    StyleSheet,
    Platform,
    SafeAreaView,
    Modal,
    ActivityIndicator, // Thêm import này để sử dụng ActivityIndicator
} from 'react-native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const PaymentScreen = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isAlertVisible, setAlertVisible] = useState(false);
  const [loading, setLoading] = useState(false); // Thêm trạng thái loading
  const navigation = useNavigation();
  const route = useRoute();
  const total = route.params?.total;

  useEffect(() => {
    axios.get('https://6705de97031fd46a8311369d.mockapi.io/paymentMethods')
      .then(response => {
        setPaymentMethods(response.data);
        const selected = response.data.find(method => method.selected);
        setSelectedMethod(selected?.id || null);
      })
      .catch(error => console.error(error));
  }, []);

  const handleSelectMethod = (id) => {
    setSelectedMethod(id);
  };

  const handlePayNow = () => {
    if (!selectedMethod) {
      setAlertVisible(true);
    } else {
      setModalVisible(true);
    }
  };

  const confirmPayment = () => {
    const selectedMethodDetails = paymentMethods.find(method => method.id === selectedMethod);
    
    setModalVisible(false);
    setLoading(true); // Bắt đầu loading

    // Chờ 2 giây trước khi điều hướng
    setTimeout(() => {
      setLoading(false); // Dừng loading
      navigation.navigate('PaymentSuccess', { selectedMethod: selectedMethodDetails, total });
    }, 1000);
  };

  const cancelPayment = () => {
    setModalVisible(false);
  };

  const closeAlert = () => {
    setAlertVisible(false);
  };

  const renderPaymentMethod = ({ item }) => {
    const isSelected = selectedMethod === item.id;

    return (
      <TouchableOpacity
        style={[styles.paymentMethod, isSelected && styles.selectedMethod]}
        onPress={() => handleSelectMethod(item.id)}
      >
        <Image
          style={styles.logo}
          source={
                item.brand === 'visa'
              ? require('../assets/Data/visa.png')
              : item.brand === 'mastercard'
              ? require('../assets/Data/mastercard.png')
              : item.brand === 'paypal'
              ? require('../assets/Data/paypal.png')
              : require('../assets/Data/momo.png')
          }
        />
        <Text style={styles.cardInfo}>
          {item.type === 'PayPal' ? item.email : `****** ${item.number}`}
        </Text>
        <View style={styles.radioButtonContainer}>
          <View style={[styles.radioButton, isSelected ? styles.selectedRadioButton : styles.defaultRadioButton]}>
            {isSelected && <View style={styles.radioButtonInner} />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00bdd6" />
        <Text>Đang xử lý thanh toán...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#000"/>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment</Text>
        </View>
        <Text style={styles.totalText}>TOTAL</Text>
        <Text style={styles.amountText}>${total?.toFixed(2)}</Text>

        <View style={styles.paymentContainer}>
          <FlatList
            data={paymentMethods}
            renderItem={renderPaymentMethod}
            keyExtractor={item => item.id.toString()}
            style={styles.paymentList}
          />
          <TouchableOpacity style={styles.payButton} onPress={handlePayNow}>
            <MaterialIcons name="payment" size={24} color="#fff" style={styles.icon}/>
            <Text style={styles.payButtonText}>Pay now</Text>
          </TouchableOpacity>
        </View>

        {/* Modal xác nhận thanh toán */}
        <Modal
          transparent={true}
          animationType="slide"
          visible={isModalVisible}
          onRequestClose={cancelPayment}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Xác nhận thanh toán?</Text>
              <Text style={styles.modalMessage}>Bạn có muốn thanh toán với phương thức này không?</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalButtonConfirm} onPress={confirmPayment}>
                  <Text style={styles.modalButtonTextConfirm}>Có</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButtonCancel} onPress={cancelPayment}>
                  <Text style={styles.modalButtonTextCancel}>Không</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal thông báo chọn phương thức thanh toán */}
        <Modal
          transparent={true}
          animationType="slide"
          visible={isAlertVisible}
          onRequestClose={closeAlert}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Thông báo</Text>
              <Text style={styles.modalMessage}>Vui lòng chọn 1 phương thức thanh toán.</Text>
              <TouchableOpacity style={styles.modalButtonConfirmOnePayment} onPress={closeAlert}>
                <Text style={styles.modalButtonTextConfirmOnePayment}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  backButton: {
    padding: 10,
    marginLeft: '-3%',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'left',
    flex: 1,
    marginLeft: 10,
  },
  totalText: {
    paddingVertical: 10,
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 10,
  },
  amountText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  paymentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentList: {
    marginVertical: 20,
    width: '100%',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
    width: '100%',
  },
  selectedMethod: {
    borderColor: '#00bdd6',
    borderWidth: 2,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 15,
    resizeMode: 'contain',
  },
  cardInfo: {
    fontSize: 18,
    flex: 1,
  },
  payButton: {
    backgroundColor: '#00bdd6',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  icon: {
    marginRight: 8,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  radioButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  radioButton: {
    height: 24,
    width: 24,
    borderRadius: 12,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRadioButton: {
    borderWidth: 2,
    borderColor: '#00bdd6',
  },
  defaultRadioButton: {
    borderWidth: 2,
    borderColor: '#ddd',
  },
  radioButtonInner: {
    height: 14,
    width: 14,
    borderRadius: 7,
    backgroundColor: '#00bdd6',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButtonConfirm: {
    flex: 1,
    backgroundColor: '#00bdd6',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonConfirmOnePayment: {
    flex: 1,
    backgroundColor: '#00bdd6',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
    width: '100%',
  },
  modalButtonTextConfirmOnePayment: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalButtonTextConfirm: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalButtonCancel: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalButtonTextCancel: {
    color: '#888',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PaymentScreen;
