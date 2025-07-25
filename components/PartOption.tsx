import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { ExternalLink, Star } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Part } from '@/types/parts';

interface PartOptionProps {
  part: Part;
  onPress: (part: Part) => void;
}

export const PartOption: React.FC<PartOptionProps> = ({ part, onPress }) => {
  const renderTierStars = () => {
    const stars = [];
    const tierLevel = part.tier === 'low' ? 1 : part.tier === 'mid' ? 2 : 3;
    
    for (let i = 0; i < 3; i++) {
      stars.push(
        <Star 
          key={i}
          size={14} 
          fill={i < tierLevel ? Colors.secondary.main : 'transparent'} 
          color={i < tierLevel ? Colors.secondary.main : Colors.text.muted}
        />
      );
    }
    
    return (
      <View style={styles.tierStars}>
        {stars}
      </View>
    );
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(part)}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{part.name}</Text>
          <Text style={styles.source}>{part.source}</Text>
        </View>
        {renderTierStars()}
      </View>
      
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Part #</Text>
          <Text style={styles.detailValue}>{part.partNumber}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Price</Text>
          <Text style={styles.price}>${part.price.toFixed(2)}</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <ExternalLink size={16} color={Colors.primary.light} />
        <Text style={styles.viewLink}>View on website</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.light,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  source: {
    fontSize: 12,
    color: Colors.text.muted,
    marginTop: 2,
  },
  tierStars: {
    flexDirection: 'row',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.text.muted,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.secondary.main,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.background.main,
  },
  viewLink: {
    fontSize: 14,
    color: Colors.primary.light,
    marginLeft: 6,
  },
});