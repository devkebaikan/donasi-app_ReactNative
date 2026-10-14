import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import {formatCurrency} from '@/utils/formatCurrency';
import {getDonationProgress, formatDaysLeftValue} from '@/utils/donationProgress';
import type {Program} from '@/types/program';

interface ProgramTheme {
  nama_tema: string;
  deskripsi_tema: string;
  program: Program[];
}

interface ProgramMendesakSectionProps {
  thema: ProgramTheme;
  onPressProgram: (program: Program) => void;
  cardWidth?: number;
}

const DEFAULT_CARD_WIDTH = 320;
const CARD_MARGIN = spacing.sm;
const DEFAULT_ASPECT_RATIO = 1080 / 1920; // 16:9

export function ProgramMendesakSection({
  thema,
  onPressProgram,
  cardWidth = DEFAULT_CARD_WIDTH,
}: ProgramMendesakSectionProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.themeName}>{thema.nama_tema}</Text>
          <Text style={styles.themaDescription}>{thema.deskripsi_tema}</Text>
        </View>
      </View>

      <FlatList
        data={thema.program}
        renderItem={({item}) => (
          <ProgramMendesakCard
            program={item}
            onPress={onPressProgram}
            cardWidth={cardWidth}
          />
        )}
        keyExtractor={item => String(item.id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        scrollEventThrottle={16}
      />
    </View>
  );
}

function ProgramMendesakCard({
  program,
  onPress,
  cardWidth,
}: {
  program: Program;
  onPress: (program: Program) => void;
  cardWidth: number;
}): React.JSX.Element {
  const [imageHeight, setImageHeight] = useState<number>(cardWidth * DEFAULT_ASPECT_RATIO);

  const collectedAmount = Number(program.nominal_achieved) || 0;
  const progress = getDonationProgress(
    collectedAmount,
    program.nominal_target,
  );

  useEffect(() => {
    Image.getSize(
      program.image,
      (width, height) => {
        const aspectRatio = height / width;
        setImageHeight(cardWidth * aspectRatio);
      },
      () => {
        setImageHeight(cardWidth * DEFAULT_ASPECT_RATIO);
      },
    );
  }, [program.image, cardWidth]);

  return (
    <TouchableOpacity
      style={[styles.card, {width: cardWidth}]}
      onPress={() => onPress(program)}
      accessibilityRole="button"
      accessibilityLabel={program.title}>
      <Image
        source={{uri: program.image}}
        style={[styles.cardImage, {width: cardWidth, height: imageHeight}]}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2} ellipsizeMode="tail">
          {program.title}
        </Text>

        <View style={styles.organizationRow}>
          <Text style={styles.organization} numberOfLines={1}>
            {program.mitra.name}
          </Text>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, {width: `${progress}%`}]} />
        </View>

        <View style={styles.footer}>
          <View>
            <Text style={styles.footerLabel}>Terkumpul</Text>
            <Text style={styles.footerValue} numberOfLines={1}>
              {formatCurrency(collectedAmount)}
            </Text>
          </View>
          <View style={styles.footerRight}>
            <Text style={styles.footerLabel}>Sisa Hari</Text>
            <Text style={styles.footerValue}>
              {formatDaysLeftValue(program.remaining_days)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[0],
    paddingVertical: spacing.lg,
  },
  header: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  titleSection: {
    gap: spacing.xs,
  },
  themeName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  themaDescription: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  listContainer: {
    paddingHorizontal: spacing.lg,
    gap: CARD_MARGIN,
  },
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  cardImage: {
    backgroundColor: colors.neutral[100],
  },
  cardContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  cardTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
    lineHeight: 18,
  },
  organizationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: spacing.xs,
  },
  organization: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  progressBar: {
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[200],
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FD6542',
    borderRadius: radius.full,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  footerRight: {
    alignItems: 'flex-end',
  },
  footerLabel: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  footerValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.primary[600],
  },
});
