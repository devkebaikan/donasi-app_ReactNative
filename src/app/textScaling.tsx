import React, {createContext, useContext, useMemo} from 'react';
import type {
  StyleProp,
  TextProps,
  TextInputProps,
  TextStyle,
} from 'react-native';
import {APP_FONT_SCALE, useSettingStore} from '@/stores/settingStore';
import {scaleTextStyle} from '@/utils/fontScale';

const FontScaleContext = createContext<number>(1);

interface ScalableProps {
  style?: StyleProp<TextStyle>;
}

// Modul internal React Native yang komponennya ditukar. Bentuknya sengaja
// dituliskan minimal — yang dipakai hanya `default`.
interface ScalableModule<P extends ScalableProps> {
  default: React.ComponentType<P>;
}

let isInstalled = false;

function withFontScale<P extends ScalableProps>(
  Base: React.ComponentType<P>,
): React.ComponentType<P> {
  function FontScaled(props: P): React.JSX.Element {
    const scale = useContext(FontScaleContext);
    const style = useMemo(
      () => scaleTextStyle(props.style, scale),
      [props.style, scale],
    );

    // `ref` ikut terbawa lewat spread: sejak React 19 ref adalah prop biasa
    // pada function component, jadi pembungkus ini tidak perlu forwardRef.
    return <Base {...props} style={style as P['style']} />;
  }

  FontScaled.displayName = `FontScaled(${Base.displayName ?? 'Component'})`;
  return FontScaled;
}

// Menukar komponen Text dan TextInput bawaan React Native dengan versi yang
// mengalikan fontSize-nya. Ini satu-satunya cara mengubah ukuran huruf SELURUH
// aplikasi tanpa menyentuh ratusan StyleSheet yang sudah ada — alasan lengkap
// dan opsi yang ditolak ada di
// docs/05-architecture/adr/ADR-010-app-font-scale.md.
//
// Harus dipanggil sekali sebelum render pertama. Path modulnya ditulis literal
// karena Metro tidak mendukung require dengan path dinamis.
export function installTextScaling(): void {
  if (isInstalled) {
    return;
  }
  isInstalled = true;

  try {
    // Deep import memang disengaja: justru modul internal inilah yang harus
    // ditukar. Impor dari 'react-native' hanya memberi hasil getter, menulis
    // ke sana tidak mengubah komponen yang dipakai layar lain.
    const textModule =
      // eslint-disable-next-line @react-native/no-deep-imports
      require('react-native/Libraries/Text/Text') as ScalableModule<TextProps>;
    textModule.default = withFontScale(textModule.default);

    const textInputModule =
      // eslint-disable-next-line @react-native/no-deep-imports
      require('react-native/Libraries/Components/TextInput/TextInput') as ScalableModule<TextInputProps>;
    textInputModule.default = withFontScale(textInputModule.default);
  } catch (error) {
    // Kalau React Native suatu saat mengunci modulnya, ukuran font berhenti
    // bekerja tapi aplikasi tetap jalan dengan ukuran normal. Kegagalan ini
    // harus terlihat saat development, bukan diam-diam.
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('Gagal memasang penskalaan ukuran font aplikasi', error);
    }
  }
}

interface TextScalingProviderProps {
  children: React.ReactNode;
}

// Pengali disebar lewat context, bukan dibaca langsung dari store di tiap
// Text: satu Text bisa muncul ribuan kali di layar panjang, dan context jauh
// lebih murah dibaca daripada membuat langganan store sebanyak itu.
export function TextScalingProvider({
  children,
}: TextScalingProviderProps): React.JSX.Element {
  const appFontSize = useSettingStore(s => s.appFontSize);
  const scale = APP_FONT_SCALE[appFontSize];

  return (
    <FontScaleContext.Provider value={scale}>
      {children}
    </FontScaleContext.Provider>
  );
}
