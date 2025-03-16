import React, { useEffect, useState, useRef } from 'react';
import { StatusBar, StyleSheet, View, Text, TouchableOpacity, Modal } from 'react-native';
import { NavigationContainer, RouteProp, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from './lib/store';
import ScanLog from './components/ScanLog';
import ItemForm from './components/ItemForm';
import Toast from './components/Toast';
import { RootStackParamList, SquareItem } from './types';
import HomeScreen from './screens/HomeScreen';
import ItemDetailScreen from './screens/ItemDetailScreen';

// Create placeholder components for admin screens until they're implemented
const AdminCategoriesScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Categories Screen</Text></View>;
const AdminItemFieldsScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Item Fields Screen</Text></View>;
const AdminPrintSettingsScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Print Settings Screen</Text></View>;
const AuditLogsScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Audit Logs Screen</Text></View>;
const SquareDebugScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Square Debug Screen</Text></View>;

const Stack = createStackNavigator<RootStackParamList>();

const CustomHeader = ({ title }: { title: string }) => {
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const menuRef = useRef(null);
  
  return (
    <View style={styles.customHeader}>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerRight}>
        <View style={styles.headerTabs}>
          <View style={styles.activeTab}>
            <Text style={styles.activeTabText}>Home</Text>
          </View>
          <TouchableOpacity 
            style={styles.adminTab} 
            onPress={() => setAdminMenuOpen(!adminMenuOpen)}
          >
            <Text style={styles.adminTabText}>Admin</Text>
            <Text style={styles.adminTabIcon}>{adminMenuOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Admin Dropdown Menu */}
      <Modal
        visible={adminMenuOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAdminMenuOpen(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setAdminMenuOpen(false)}
        >
          <View 
            style={[styles.adminMenu, { top: 60, right: 10 }]}
          >
            <AdminMenuItem 
              title="Categories" 
              route="AdminCategories" 
              onPress={() => setAdminMenuOpen(false)} 
            />
            <AdminMenuItem 
              title="Item Fields" 
              route="AdminItemFields" 
              onPress={() => setAdminMenuOpen(false)} 
            />
            <AdminMenuItem 
              title="Print Settings" 
              route="AdminPrintSettings" 
              onPress={() => setAdminMenuOpen(false)} 
            />
            <AdminMenuItem 
              title="Audit Logs" 
              route="AuditLogs" 
              onPress={() => setAdminMenuOpen(false)} 
            />
            <AdminMenuItem 
              title="Square Debug" 
              route="SquareDebug" 
              onPress={() => setAdminMenuOpen(false)} 
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// Helper component for admin menu items
const AdminMenuItem = ({ 
  title, 
  route, 
  onPress 
}: { 
  title: string; 
  route: keyof RootStackParamList; 
  onPress: () => void;
}) => {
  const { navigation } = useStore();
  
  const handlePress = () => {
    onPress();
    if (navigation) {
      navigation.navigate(route as any);
    }
  };
  
  return (
    <TouchableOpacity 
      style={styles.adminMenuItem}
      onPress={handlePress}
    >
      <Text style={styles.adminMenuItemText}>{title}</Text>
    </TouchableOpacity>
  );
};

const App: React.FC = () => {
  const {
    selectedItem,
    squareStatus,
    isCheckingSquare,
    toast,
    fetchRecentLogs,
    checkSquareStatus,
    handleSaveItem,
    handleCancel,
    clearToast,
    setNavigation,
  } = useStore();

  // Create a ref to store the navigation object and prevent unnecessary re-renders
  const navigationRef = useRef<any>(null);
  const hasSetInitialNavigation = useRef(false);

  // Initial data loading
  useEffect(() => {
    fetchRecentLogs();
    checkSquareStatus();

    // Set up periodic checks for Square status
    const intervalId = setInterval(() => {
      checkSquareStatus();
    }, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [fetchRecentLogs, checkSquareStatus]);

  return (
    <SafeAreaProvider>
      <NavigationContainer
        ref={(navRef) => {
          // We don't need to set the navigation from the container ref
          navigationRef.current = navRef;
        }}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              header: ({ 
                navigation, 
                route, 
                options 
              }: {
                navigation: any;
                route: any;
                options: any;
              }) => {
                // Only set the navigation once to avoid infinite loops
                if (!hasSetInitialNavigation.current) {
                  hasSetInitialNavigation.current = true;
                  setNavigation(navigation);
                }
                
                const title = options.headerTitle !== undefined
                  ? options.headerTitle
                  : options.title !== undefined
                  ? options.title
                  : route.name;
                  
                return <CustomHeader title={title as string} />;
              },
              cardStyle: { backgroundColor: '#f8fafc' }
            }}
          >
            <Stack.Screen 
              name="Home"
              component={HomeScreen}
              options={{
                title: 'Joyventory',
              }}
            />
            <Stack.Screen 
              name="ItemDetail" 
              component={ItemDetailScreen}
              options={{ 
                title: 'Item Details',
                headerStyle: {
                  backgroundColor: '#fff',
                  elevation: 1,
                  shadowOpacity: 0.1,
                },
                headerTintColor: '#333',
              }}
            />
            
            {/* Admin Screens */}
            <Stack.Screen 
              name="AdminCategories" 
              component={AdminCategoriesScreen}
              options={{ title: 'Categories' }}
            />
            <Stack.Screen 
              name="AdminItemFields" 
              component={AdminItemFieldsScreen}
              options={{ title: 'Item Fields' }}
            />
            <Stack.Screen 
              name="AdminPrintSettings" 
              component={AdminPrintSettingsScreen}
              options={{ title: 'Print Settings' }}
            />
            <Stack.Screen 
              name="AuditLogs" 
              component={AuditLogsScreen}
              options={{ title: 'Audit Logs' }}
            />
            <Stack.Screen 
              name="SquareDebug" 
              component={SquareDebugScreen}
              options={{ title: 'Square Debug' }}
            />
          </Stack.Navigator>
        </SafeAreaView>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={clearToast}
          />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  customHeader: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTabs: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    overflow: 'hidden',
  },
  activeTab: {
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '500',
  },
  adminTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  adminTabText: {
    color: '#64748b',
    fontWeight: '500',
    marginRight: 4,
  },
  adminTabIcon: {
    fontSize: 10,
    color: '#64748b',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  adminMenu: {
    position: 'absolute',
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  adminMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  adminMenuItemText: {
    fontSize: 16,
    color: '#334155',
  },
});

export default App; 