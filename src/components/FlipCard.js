import React, { useRef, useState } from 'react';
import { Animated, TouchableOpacity, View, StyleSheet } from 'react-native';

/**
 * FlipCard component
 * Shows `backContent` initially (card back / mystery).
 * On tap, flips to reveal `frontContent` (role).
 * Calls onFlipped() when animation completes.
 */
export default function FlipCard({
  backContent,
  frontContent,
  onFlipped,
  disabled = false,
  style,
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const animValue = useRef(new Animated.Value(0)).current;

  const flip = () => {
    if (disabled || isFlipped) return;
    Animated.spring(animValue, {
      toValue: 1,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start(() => {
      setIsFlipped(true);
      onFlipped?.();
    });
  };

  const reset = () => {
    animValue.setValue(0);
    setIsFlipped(false);
  };

  // Back face (visible at start, rotates away)
  const backRotate = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backOpacity = animValue.interpolate({
    inputRange: [0, 0.49, 0.5, 1],
    outputRange: [1, 1, 0, 0],
  });

  // Front face (hidden at start, rotates in)
  const frontRotate = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['-180deg', '0deg'],
  });
  const frontOpacity = animValue.interpolate({
    inputRange: [0, 0.49, 0.5, 1],
    outputRange: [0, 0, 1, 1],
  });

  // Expose reset via ref is tricky; expose via prop callback instead
  FlipCard._lastReset = reset;

  return (
    <TouchableOpacity
      onPress={flip}
      activeOpacity={isFlipped ? 1 : 0.85}
      style={[styles.wrapper, style]}
      disabled={disabled}
    >
      <View style={styles.container}>
        {/* Back face */}
        <Animated.View
          style={[
            styles.face,
            { transform: [{ rotateY: backRotate }], opacity: backOpacity },
          ]}
        >
          {backContent}
        </Animated.View>

        {/* Front face */}
        <Animated.View
          style={[
            styles.face,
            StyleSheet.absoluteFillObject,
            { transform: [{ rotateY: frontRotate }], opacity: frontOpacity },
          ]}
        >
          {frontContent}
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'center',
  },
  container: {
    position: 'relative',
  },
  face: {
    backfaceVisibility: 'hidden',
  },
});
