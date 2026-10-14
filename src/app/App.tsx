import React from 'react';
import {StyleSheet} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {QueryClientProvider} from '@tanstack/react-query';
import {queryClient} from '@/services/queryClient';
import {RootNavigator} from '@/navigation/RootNavigator';
import {ToastContainer} from '@/components/shared/ToastContainer';
import {installTextScaling, TextScalingProvider} from '@/app/textScaling';

// Dipasang di lingkup modul, bukan di dalam komponen: penukaran komponen Text
// harus sudah terjadi sebelum satu pun layar dirender.
installTextScaling();

export function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={styles.root}>
      {/* Paling luar: isi bottom sheet dirender lewat portal milik
          BottomSheetModalProvider, jadi provider ini harus berada DI ATAS-nya
          supaya teks di dalam sheet ikut menyesuaikan ukuran. */}
      <TextScalingProvider>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <BottomSheetModalProvider>
              <RootNavigator />
              <ToastContainer />
            </BottomSheetModalProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </TextScalingProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
