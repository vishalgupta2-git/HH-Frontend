import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ReferralConnectBlock() {
  const referralCode = 'hh2547d6';
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Refer friends & family</Text>
      <Text style={styles.subtitle}>
        Invite your friend and family to grow their spiritual journey
      </Text>
      <View style={styles.referralRow}>
        <Text style={styles.referralLabel}>Referal Code : </Text>
        <Text style={styles.referralCode}>{referralCode}</Text>
        <TouchableOpacity
          style={styles.copyButton}
          onPress={async () => {
            await Clipboard.setStringAsync(referralCode);
            Alert.alert('Copied!', 'Referral code copied to clipboard.');
          }}
        >
          <Feather name="copy" size={20} color="#FF9800" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.inviteButton}>
        <Text style={styles.inviteButtonText}>Invite & Earn Mudra</Text>
      </TouchableOpacity>
    </View>
  );
}

export function SocialRow() {
  // Use the same icon row as before
  const { FontAwesome, MaterialCommunityIcons, Ionicons } = require('@expo/vector-icons');
  return (
    <View style={styles.connectRow}>
      <TouchableOpacity style={styles.socialIcon}>
        <FontAwesome name="facebook" size={26} color="#1877F3" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.socialIcon}>
        <FontAwesome name="youtube-play" size={26} color="#FF0000" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.socialIcon}>
        <MaterialCommunityIcons name="alpha-x-circle" size={26} color="#000" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.socialIcon}>
        <FontAwesome name="whatsapp" size={26} color="#25D366" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.socialIcon}>
        <Ionicons name="logo-instagram" size={26} color="#E1306C" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 12,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#aaa',
    marginBottom: 10,
  },
  referralRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  referralLabel: {
    fontSize: 15,
    color: '#FF9800',
    fontWeight: '500',
  },
  referralCode: {
    fontSize: 15,
    color: '#FF9800',
    fontWeight: 'bold',
    marginLeft: 2,
  },
  copyButton: {
    marginLeft: 6,
    padding: 2,
  },
  inviteButton: {
    backgroundColor: '#3A3939',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  connectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 2,
    marginHorizontal: 12,
  },
  socialIcon: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    padding: 8,
    marginHorizontal: 2,
  },
}); 