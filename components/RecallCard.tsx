import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { AlertTriangle, ExternalLink, Calendar, Users } from 'lucide-react-native';
import { Recall } from '@/types/recall';
import { Colors } from '@/constants/colors';
import { useRecallSearch } from '@/hooks/useRecallSearch';

interface RecallCardProps {
  recall: Recall;
  testId?: string;
}

export const RecallCard: React.FC<RecallCardProps> = ({ recall, testId }) => {
  const { getSeverityColor, getSeverityLabel } = useRecallSearch();

  const handleOpenUrl = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const severityColor = getSeverityColor(recall.severity);
  const severityLabel = getSeverityLabel(recall.severity);

  return (
    <View style={styles.container} testID={testId}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <AlertTriangle size={20} color={severityColor} />
          <Text style={styles.title} numberOfLines={2}>
            {recall.title}
          </Text>
        </View>
        <View style={[styles.severityBadge, { backgroundColor: severityColor }]}>
          <Text style={styles.severityText}>{severityLabel}</Text>
        </View>
      </View>

      <View style={styles.vehicleInfo}>
        <Text style={styles.vehicleText}>
          {recall.year} {recall.make} {recall.model}
        </Text>
        {recall.nhtsa_id && (
          <Text style={styles.nhtsaId}>ID: {recall.nhtsa_id}</Text>
        )}
      </View>

      <Text style={styles.description} numberOfLines={3}>
        {recall.description}
      </Text>

      <View style={styles.metaInfo}>
        <View style={styles.metaItem}>
          <Calendar size={14} color={Colors.text.muted} />
          <Text style={styles.metaText}>
            Issued: {formatDate(recall.date_issued)}
          </Text>
        </View>
        {recall.affected_vehicles_count && (
          <View style={styles.metaItem}>
            <Users size={14} color={Colors.text.muted} />
            <Text style={styles.metaText}>
              {formatNumber(recall.affected_vehicles_count)} vehicles
            </Text>
          </View>
        )}
      </View>

      {recall.affected_components.length > 0 && (
        <View style={styles.componentsSection}>
          <Text style={styles.componentsTitle}>Affected Components:</Text>
          <View style={styles.componentsList}>
            {recall.affected_components.slice(0, 3).map((component, index) => (
              <View key={index} style={styles.componentTag}>
                <Text style={styles.componentText}>{component}</Text>
              </View>
            ))}
            {recall.affected_components.length > 3 && (
              <View style={styles.componentTag}>
                <Text style={styles.componentText}>
                  +{recall.affected_components.length - 3} more
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {recall.remedy_description && (
        <View style={styles.remedySection}>
          <Text style={styles.remedyTitle}>Remedy:</Text>
          <Text style={styles.remedyText} numberOfLines={2}>
            {recall.remedy_description}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        {recall.manufacturer_contact && (
          <Text style={styles.contactText} numberOfLines={1}>
            {recall.manufacturer_contact}
          </Text>
        )}
        {recall.nhtsa_url && (
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => handleOpenUrl(recall.nhtsa_url!)}
            testID={`${testId}-link`}
          >
            <Text style={styles.linkText}>View Details</Text>
            <ExternalLink size={14} color={Colors.secondary.main} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.background.light,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginLeft: 8,
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  severityText: {
    color: Colors.text.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  vehicleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  vehicleText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  nhtsaId: {
    fontSize: 12,
    color: Colors.text.muted,
  },
  description: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: Colors.text.muted,
    marginLeft: 4,
  },
  componentsSection: {
    marginBottom: 12,
  },
  componentsTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginBottom: 6,
  },
  componentsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  componentTag: {
    backgroundColor: Colors.background.main,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.background.light,
  },
  componentText: {
    fontSize: 11,
    color: Colors.text.muted,
  },
  remedySection: {
    marginBottom: 12,
  },
  remedyTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  remedyText: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.background.light,
  },
  contactText: {
    fontSize: 11,
    color: Colors.text.muted,
    flex: 1,
    marginRight: 8,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  linkText: {
    fontSize: 12,
    color: Colors.secondary.main,
    fontWeight: '500',
    marginRight: 4,
  },
});