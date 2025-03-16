import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';

type AuditLogsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AuditLogs'>;

interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
  itemId?: string;
  itemName?: string;
}

const AuditLogsScreen: React.FC = () => {
  const navigation = useNavigation<AuditLogsScreenNavigationProp>();
  
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string | null>(null);
  
  // Mock actions for filtering
  const actions = [
    'All',
    'Item Created',
    'Item Updated',
    'Item Deleted',
    'Category Created',
    'Category Updated',
    'Category Deleted',
    'User Login',
    'Settings Changed'
  ];

  // Generate mock audit log data
  useEffect(() => {
    const mockLogs: AuditLog[] = [];
    const actions = [
      'Item Created', 
      'Item Updated', 
      'Item Deleted', 
      'Category Created',
      'Category Updated',
      'Category Deleted',
      'User Login',
      'Settings Changed'
    ];
    const users = ['admin', 'john.doe', 'jane.smith'];
    
    // Generate 50 random logs
    for (let i = 0; i < 50; i++) {
      const action = actions[Math.floor(Math.random() * actions.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // Random date in the last 30 days
      
      let details = '';
      let itemId;
      let itemName;
      
      if (action.includes('Item')) {
        itemId = `ITEM${Math.floor(Math.random() * 10000)}`;
        itemName = ['Soda', 'Chips', 'Candy', 'Water', 'Coffee'][Math.floor(Math.random() * 5)];
        details = `${action} ${itemName} (${itemId})`;
      } else if (action.includes('Category')) {
        const category = ['Food', 'Drinks', 'Snacks', 'Household', 'Electronics'][Math.floor(Math.random() * 5)];
        details = `${action} ${category}`;
      } else if (action === 'User Login') {
        details = `${user} logged in`;
      } else {
        details = `${user} changed settings`;
      }
      
      mockLogs.push({
        id: `log-${i}`,
        action,
        user,
        timestamp: date.toISOString(),
        details,
        ...(itemId && { itemId }),
        ...(itemName && { itemName })
      });
    }
    
    // Sort by timestamp (newest first)
    mockLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Simulate API delay
    setTimeout(() => {
      setLogs(mockLogs);
      setFilteredLogs(mockLogs);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter logs based on search query and action filter
  useEffect(() => {
    let result = logs;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(log => 
        log.details.toLowerCase().includes(query) || 
        log.user.toLowerCase().includes(query) ||
        (log.itemName && log.itemName.toLowerCase().includes(query))
      );
    }
    
    if (actionFilter && actionFilter !== 'All') {
      result = result.filter(log => log.action === actionFilter);
    }
    
    setFilteredLogs(result);
  }, [searchQuery, actionFilter, logs]);

  // Format timestamp to readable date
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render each log item
  const renderLogItem = ({ item }: { item: AuditLog }) => (
    <View style={styles.logItem}>
      <View style={styles.logHeader}>
        <Text style={styles.logAction}>{item.action}</Text>
        <Text style={styles.logTimestamp}>{formatDate(item.timestamp)}</Text>
      </View>
      <Text style={styles.logDetails}>{item.details}</Text>
      <Text style={styles.logUser}>By: {item.user}</Text>
    </View>
  );

  // Render action filter buttons
  const renderActionFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {actions.map(action => (
          <TouchableOpacity
            key={action}
            style={[
              styles.filterButton,
              actionFilter === action || (action === 'All' && !actionFilter) 
                ? styles.activeFilterButton 
                : null
            ]}
            onPress={() => setActionFilter(action === 'All' ? null : action)}
          >
            <Text 
              style={[
                styles.filterButtonText,
                actionFilter === action || (action === 'All' && !actionFilter)
                  ? styles.activeFilterButtonText
                  : null
              ]}
            >
              {action}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Audit Logs</Text>
        <Text style={styles.subtitle}>
          View a history of all actions performed in the system.
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search logs..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {renderActionFilters()}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e91e63" />
          <Text style={styles.loadingText}>Loading audit logs...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredLogs}
          renderItem={renderLogItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No logs found matching your criteria.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    paddingHorizontal: 12,
    backgroundColor: 'white',
  },
  filtersContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: '#e91e63',
  },
  filterButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: 'white',
  },
  listContent: {
    padding: 16,
  },
  logItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  logAction: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 16,
  },
  logTimestamp: {
    color: '#666',
    fontSize: 12,
  },
  logDetails: {
    color: '#333',
    marginBottom: 8,
    fontSize: 14,
  },
  logUser: {
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 14,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default AuditLogsScreen;
 