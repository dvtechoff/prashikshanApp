import { ScrollView, StyleSheet, Text, View, Pressable, Alert } from 'react-native';

const modules = [
  {
    title: 'Internship readiness toolkit',
    description: 'Learn how to communicate with mentors, set goals, and stay organised.',
    duration: '45 min',
    level: 'Beginner'
  },
  {
    title: 'Industry communication essentials',
    description: 'Practice drafting weekly updates, escalation notes, and demo readouts.',
    duration: '60 min',
    level: 'Intermediate'
  },
  {
    title: 'Portfolio storytelling',
    description: 'Craft a compelling internship portfolio with metrics and impact narratives.',
    duration: '40 min',
    level: 'Advanced'
  },
  {
    title: 'AI & data literacy sprint',
    description: 'Brush up on GenAI prompts, data visualisation, and ethical usage.',
    duration: '75 min',
    level: 'Intermediate'
  }
];

export default function SkillReadinessScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Skill readiness</Text>
      <Text style={styles.subtitle}>
        Close your skill gaps before starting the internship. Complete these curated micro-courses.
      </Text>

      {modules.map((module) => (
        <View key={module.title} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{module.title}</Text>
            <Text style={styles.badge}>{module.level}</Text>
          </View>
          <Text style={styles.cardBody}>{module.description}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{module.duration}</Text>
            <Pressable
              style={styles.enrolButton}
              onPress={() => Alert.alert('Coming soon', 'We will open this module shortly.')}
            >
              <Text style={styles.enrolText}>Start module</Text>
            </Pressable>
          </View>
        </View>
      ))}

      <View style={styles.callout}>
        <Text style={styles.calloutTitle}>Need a personalised plan?</Text>
        <Text style={styles.calloutBody}>
          Share your internship goal and we will recommend learning resources tailored to your role.
        </Text>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => Alert.alert('Mentor assist', 'A mentor will contact you soon.')}
        >
          <Text style={styles.secondaryText}>Request mentor assist</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
    backgroundColor: '#f8fafc'
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a'
  },
  subtitle: {
    color: '#475569'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    gap: 12,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a'
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    fontWeight: '600'
  },
  cardBody: {
    color: '#475569',
    lineHeight: 22
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  metaText: {
    color: '#64748b',
    fontWeight: '600'
  },
  enrolButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16
  },
  enrolText: {
    color: '#ffffff',
    fontWeight: '600'
  },
  callout: {
    backgroundColor: '#1d4ed8',
    borderRadius: 18,
    padding: 20,
    gap: 12
  },
  calloutTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff'
  },
  calloutBody: {
    color: '#bfdbfe'
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12
  },
  secondaryText: {
    color: '#1d4ed8',
    fontWeight: '700'
  }
});
