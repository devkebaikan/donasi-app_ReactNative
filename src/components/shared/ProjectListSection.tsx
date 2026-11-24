import React from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import {SectionTitle} from '@/components/ui/SectionTitle';
import {formatDate} from '@/utils/formatDate';
import {sanitizeImageUrl} from '@/utils/imageUrl';
import type {ProjectItem} from '@/types/home';

interface ProjectListSectionProps {
  projectList: ProjectItem[];
  onPressProject?: (project: ProjectItem) => void;
  className?: string;
}

function getActivityLabel(item: ProjectItem): string {
  if (item.activity === 'active open') return 'Penggalangan';
  return item.reason ?? item.status ?? 'Selesai';
}

function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

export function ProjectListSection({
  projectList = [],
  onPressProject,
  className = '',
}: ProjectListSectionProps): React.JSX.Element {
  if (projectList.length === 0) {
    return <View />;
  }

  return (
    <View className={`bg-white pt-2 pb-3 mb-2 ${className}`}>
      <SectionTitle
        title="#BergerakBeramalBersama"
        description="Satu niat baik hari ini, jadi alasan senyum mereka sepanjang hari."
      />

      <View className="px-4 pt-1">
        {projectList.map(project => {
          const label = getActivityLabel(project);
          const dateStr = project.excecution_time
            ? formatDate(project.excecution_time)
            : '';
          const summary = stripHtml(project.description || '').slice(0, 110);

          return (
            <TouchableOpacity
              key={String(project.id)}
              className="flex-row bg-white rounded-2xl border border-neutral-100 p-2.5 items-center shadow-sm mb-2.5"
              onPress={() => onPressProject && onPressProject(project)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={project.title}>
              {/* Thumbnail Image */}
              <View className="w-36 h-20 rounded-lg overflow-hidden bg-neutral-100 mr-3 shrink-0">
                {project.image ? (
                  <Image
                    source={{uri: sanitizeImageUrl(project.image)}}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-full bg-neutral-200" />
                )}
              </View>

              {/* Information */}
              <View className="flex-1 min-w-0 justify-center">
                <View className="flex-row items-center gap-1.5 mb-1">
                  <View className="bg-secondary-50 px-2 py-0.5 rounded-full">
                    <Text className="text-secondary-600 text-[9px] font-bold leading-none">
                      {label}
                    </Text>
                  </View>
                  {Boolean(dateStr) && (
                    <Text className="text-neutral-400 text-[9px]">
                      {dateStr}
                    </Text>
                  )}
                </View>

                <Text
                  className="text-xs font-semibold text-neutral-800 leading-snug line-clamp-2 mb-1"
                  numberOfLines={2}>
                  {project.title}
                </Text>

                {Boolean(summary) && (
                  <Text className="text-[10px] text-neutral-400 truncate leading-tight" numberOfLines={1}>
                    {summary}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
