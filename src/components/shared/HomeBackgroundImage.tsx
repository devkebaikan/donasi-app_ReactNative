import React from 'react';
import {View, ImageBackground, StyleSheet} from 'react-native';
import type {ImageSourcePropType} from 'react-native';

interface HomeBackgroundImageProps {
  children: React.ReactNode;
  imageSource?: ImageSourcePropType;
}

export function HomeBackgroundImage({
  children,
  imageSource,
}: HomeBackgroundImageProps): React.JSX.Element {
  if (!imageSource) {
    return <View style={styles.container}>{children}</View>;
  }

  return (
    <ImageBackground
      source={imageSource}
      style={styles.background}
      resizeMode="cover">
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flex: 1,
  },
  container: {
    flex: 1,
  },
});
