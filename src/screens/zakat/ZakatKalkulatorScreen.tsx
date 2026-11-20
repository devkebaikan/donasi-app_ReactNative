import React from 'react';
import ZakatScreen from './ZakatScreen';
import type {ZakatKalkulatorScreenProps, ZakatScreenProps} from '@/types/navigation';

export default function ZakatKalkulatorScreen(
  props: ZakatKalkulatorScreenProps,
): React.JSX.Element {
  return <ZakatScreen {...(props as unknown as ZakatScreenProps)} />;
}
