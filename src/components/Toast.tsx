import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, Animated, View } from 'react-native';
import { ToastType } from '../types';

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose 
}) => {
  const [animation] = useState(new Animated.Value(0));
  
  useEffect(() => {
    // Animate in
    Animated.timing(animation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    // Set timeout to close
    const timer = setTimeout(() => {
      // Animate out
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        onClose();
      });
    }, duration);
    
    return () => clearTimeout(timer);
  }, [animation, duration, onClose]);
  
  // Get styles based on toast type
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#10b981'; // Green
      case 'error':
        return '#ef4444'; // Red
      case 'info':
      default:
        return '#3b82f6'; // Blue
    }
  };
  
  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'info':
      default:
        return 'ℹ';
    }
  };
  
  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          backgroundColor: getBackgroundColor(),
          opacity: animation,
          transform: [
            { 
              translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>{getIcon()}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>×</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    color: 'white',
    fontSize: 18,
    marginRight: 10,
    fontWeight: 'bold',
  },
  message: {
    color: 'white',
    fontSize: 16,
    flex: 1,
  },
  closeButton: {
    marginLeft: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default Toast; 