import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {WebView} from 'react-native-webview';
import {HeaderLight} from '@/components/shared/HeaderLight';
import type {
  RootStackNavigationProp,
  WebViewScreenProps,
} from '@/types/navigation';
import {colors} from '@/theme';

export default function WebViewScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const {params} = useRoute<WebViewScreenProps['route']>();

  return (
    <View style={styles.root}>
      <HeaderLight title={params.title} onBack={() => navigation.goBack()} />

      <WebView source={{uri: params.url}} style={styles.webview} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  webview: {
    flex: 1,
  },
});
