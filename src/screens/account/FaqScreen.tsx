import React from 'react';
import {View, ScrollView, ActivityIndicator, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {HeaderLight} from '@/components/shared/HeaderLight';
import type {RootStackNavigationProp} from '@/types/navigation';
import {useFaqs} from '@/hooks/useFaqs';
import {FaqAccordionItem} from '@/components/shared/FaqAccordionItem';
import {colors, spacing} from '@/theme';

export default function FaqScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const {faqs, isLoading, expandedFaqs, toggleFaq} = useFaqs();

  return (
    <View style={styles.root}>
      <HeaderLight
        title="Pertanyaan Sering Diajukan"
        onBack={() => navigation.goBack()}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary[500]} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}>
          {faqs.map(faq => (
            <FaqAccordionItem
              key={faq.id}
              question={faq.question}
              answer={faq.answer}
              expanded={expandedFaqs.includes(faq.id)}
              onToggle={() => toggleFaq(faq.id)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
});
