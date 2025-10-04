import { useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  useCurrentUserQuery,
  useUpdateCurrentUserMutation
} from '@/hooks/useCurrentUser';
import { useApplicationList } from '@/hooks/useApplications';
import { useLogbookEntryList } from '@/hooks/useLogbookEntries';
import { useNotificationList } from '@/hooks/useNotifications';

interface ExtendedProfileState {
  name: string;
  email: string;
  phone: string;
  university: string;
  // Student/Faculty profile fields
  college: string;
  enrollmentNo: string;
  course: string;
  year: string;
  designation: string;
  department: string;
  facultyId: string;
  skills: string;
  resumeUrl: string;
  // Industry profile fields
  companyName: string;
  companyWebsite: string;
  contactPersonName: string;
  contactNumber: string;
  companyAddress: string;
}

const initialState: ExtendedProfileState = {
  name: '',
  email: '',
  phone: '',
  university: '',
  college: '',
  enrollmentNo: '',
  course: '',
  year: '',
  designation: '',
  department: '',
  facultyId: '',
  skills: '',
  resumeUrl: '',
  companyName: '',
  companyWebsite: '',
  contactPersonName: '',
  contactNumber: '',
  companyAddress: ''
};

export default function ProfileScreen() {
  const { data, isLoading } = useCurrentUserQuery();
  const updateMutation = useUpdateCurrentUserMutation();
  const { data: applications } = useApplicationList();
  const { data: logbookEntries } = useLogbookEntryList();
  const { data: notifications } = useNotificationList();
  const [formState, setFormState] = useState<ExtendedProfileState>(initialState);

  // Calculate stats for student
  const stats = useMemo(() => {
    if (data?.role !== 'STUDENT') return null;
    
    const unreadNotifications = (notifications ?? []).filter((n) => !n.read);
    const totalApplications = applications?.length ?? 0;
    const totalHours = logbookEntries?.reduce((sum, entry) => sum + entry.hours, 0) ?? 0;
    const acceptedCount = (applications ?? []).filter(
      (app) => app.industry_status === 'APPROVED' && app.faculty_status === 'APPROVED'
    ).length;
    const creditsEarned = acceptedCount * 4;
    
    return {
      applications: totalApplications,
      hours: totalHours,
      credits: creditsEarned,
      unread: unreadNotifications.length
    };
  }, [data?.role, applications, logbookEntries, notifications]);

  useEffect(() => {
    if (!data) {
      return;
    }
    
    // Extract skills array from profile
    const skillsArray = data.profile?.skills?.skills || [];
    const skillsString = Array.isArray(skillsArray) ? skillsArray.join(', ') : '';
    
    setFormState({
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      university: data.university || '',
      // Student/Faculty profile
      college: data.profile?.college || '',
      enrollmentNo: data.profile?.enrollment_no || '',
      course: data.profile?.course || '',
      year: data.profile?.year || '',
      designation: data.profile?.designation || '',
      department: data.profile?.department || '',
      facultyId: data.profile?.faculty_id || '',
      skills: skillsString,
      resumeUrl: data.profile?.resume_url || '',
      // Industry profile
      companyName: data.industry_profile?.company_name || '',
      companyWebsite: data.industry_profile?.company_website || '',
      contactPersonName: data.industry_profile?.contact_person_name || '',
      contactNumber: data.industry_profile?.contact_number || '',
      companyAddress: data.industry_profile?.company_address || ''
    });
  }, [data]);

  const hasChanges = useMemo(() => {
    if (!data) {
      return false;
    }
    
    const skillsArray = data.profile?.skills?.skills || [];
    const originalSkills = Array.isArray(skillsArray) ? skillsArray.join(', ') : '';
    
    return (
      formState.name !== data.name ||
      formState.phone !== (data.phone || '') ||
      formState.university !== (data.university || '') ||
      // Profile changes
      formState.college !== (data.profile?.college || '') ||
      formState.enrollmentNo !== (data.profile?.enrollment_no || '') ||
      formState.course !== (data.profile?.course || '') ||
      formState.year !== (data.profile?.year || '') ||
      formState.designation !== (data.profile?.designation || '') ||
      formState.department !== (data.profile?.department || '') ||
      formState.facultyId !== (data.profile?.faculty_id || '') ||
      formState.skills !== originalSkills ||
      formState.resumeUrl !== (data.profile?.resume_url || '') ||
      // Industry profile changes
      formState.companyName !== (data.industry_profile?.company_name || '') ||
      formState.companyWebsite !== (data.industry_profile?.company_website || '') ||
      formState.contactPersonName !== (data.industry_profile?.contact_person_name || '') ||
      formState.contactNumber !== (data.industry_profile?.contact_number || '') ||
      formState.companyAddress !== (data.industry_profile?.company_address || '')
    );
  }, [data, formState]);

  const handleChange = <Key extends keyof ExtendedProfileState>(key: Key, value: ExtendedProfileState[Key]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!data) {
      return;
    }
    try {
      const updatePayload: any = {
        name: formState.name.trim() || undefined,
        phone: formState.phone.trim() || undefined,
        university: formState.university.trim() || undefined
      };
      
      // Add profile data for Student/Faculty
      if (data.role === 'STUDENT' || data.role === 'FACULTY') {
        const skillsArray = formState.skills
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0);
          
        updatePayload.profile = {
          college: formState.college.trim() || undefined,
          enrollment_no: formState.enrollmentNo.trim() || undefined,
          course: formState.course.trim() || undefined,
          year: formState.year.trim() || undefined,
          designation: formState.designation.trim() || undefined,
          department: formState.department.trim() || undefined,
          faculty_id: formState.facultyId.trim() || undefined,
          skills: skillsArray.length > 0 ? skillsArray : undefined,
          resume_url: formState.resumeUrl.trim() || undefined
        };
      }
      
      // Add industry profile data
      if (data.role === 'INDUSTRY') {
        updatePayload.industry_profile = {
          company_name: formState.companyName.trim() || undefined,
          company_website: formState.companyWebsite.trim() || undefined,
          contact_person_name: formState.contactPersonName.trim() || undefined,
          contact_number: formState.contactNumber.trim() || undefined,
          designation: formState.designation.trim() || undefined,
          company_address: formState.companyAddress.trim() || undefined
        };
      }
      
      await updateMutation.mutateAsync(updatePayload);
      Alert.alert('Profile updated', 'Your information has been saved successfully.');
    } catch (error) {
      Alert.alert('Update failed', error instanceof Error ? error.message : 'Please try again later.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.statusText}>Loading your profile…</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Unable to load profile details.</Text>
        <Text style={styles.errorDescription}>
          Please pull down to refresh or try again later.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Stats Cards - Only for Students */}
      {data.role === 'STUDENT' && stats && (
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>Your Activity</Text>
          <View style={styles.statsGrid}>
            <Pressable style={styles.statCard} onPress={() => router.push('/(app)/applications')}>
              <View style={[styles.statIcon, { backgroundColor: '#dbeafe' }]}>
                <Ionicons name="briefcase" size={24} color="#2563eb" />
              </View>
              <Text style={styles.statValue}>{stats.applications}</Text>
              <Text style={styles.statLabel}>Applications</Text>
            </Pressable>

            <Pressable style={styles.statCard} onPress={() => router.push('/(app)/logbook')}>
              <View style={[styles.statIcon, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="time" size={24} color="#f59e0b" />
              </View>
              <Text style={styles.statValue}>{stats.hours}</Text>
              <Text style={styles.statLabel}>Hours Logged</Text>
            </Pressable>

            <Pressable style={styles.statCard} onPress={() => router.push('/(app)/credits')}>
              <View style={[styles.statIcon, { backgroundColor: '#d1fae5' }]}>
                <Ionicons name="trophy" size={24} color="#10b981" />
              </View>
              <Text style={styles.statValue}>{stats.credits}</Text>
              <Text style={styles.statLabel}>Credits Earned</Text>
            </Pressable>

            <Pressable style={styles.statCard} onPress={() => router.push('/(app)/notifications')}>
              <View style={[styles.statIcon, { backgroundColor: '#fce7f3' }]}>
                <Ionicons name="notifications" size={24} color="#ec4899" />
              </View>
              <Text style={styles.statValue}>{stats.unread}</Text>
              <Text style={styles.statLabel}>Unread Alerts</Text>
            </Pressable>
          </View>
        </View>
      )}

      <Text style={styles.title}>Personal information</Text>
      <Text style={styles.subtitle}>
        {data.role === 'INDUSTRY' ? 'Update your company details' : 'Update your contact details and profile'}
      </Text>

      {/* Basic Information - All roles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Full name</Text>
          <TextInput
            value={formState.name}
            onChangeText={(value) => handleChange('name', value)}
            placeholder="Your name"
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput 
            value={formState.email} 
            editable={false} 
            style={[styles.input, styles.disabled]} 
          />
        </View>
        
        {data.role !== 'INDUSTRY' && (
          <>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                keyboardType="phone-pad"
                value={formState.phone}
                onChangeText={(value) => handleChange('phone', value)}
                placeholder="+91 XXXXXXXXXX"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>University</Text>
              <TextInput
                value={formState.university}
                onChangeText={(value) => handleChange('university', value)}
                placeholder="Enter university name"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>College</Text>
              <TextInput
                value={formState.college}
                onChangeText={(value) => handleChange('college', value)}
                placeholder="Enter college name"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />
            </View>
          </>
        )}
      </View>

      {/* Student Profile */}
      {data.role === 'STUDENT' && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Academic Information</Text>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Enrollment Number</Text>
              <TextInput
                value={formState.enrollmentNo}
                onChangeText={(value) => handleChange('enrollmentNo', value)}
                placeholder="Enter enrollment number"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />
            </View>
            <View style={styles.row}>
              <View style={[styles.fieldGroup, styles.halfWidth]}>
                <Text style={styles.label}>Course</Text>
                <TextInput
                  value={formState.course}
                  onChangeText={(value) => handleChange('course', value)}
                  placeholder="B.Tech Computer Science"
                  placeholderTextColor="#94a3b8"
                  style={styles.input}
                />
              </View>
              <View style={[styles.fieldGroup, styles.halfWidth]}>
                <Text style={styles.label}>Year</Text>
                <TextInput
                  value={formState.year}
                  onChangeText={(value) => handleChange('year', value)}
                  placeholder="3rd"
                  placeholderTextColor="#94a3b8"
                  style={styles.input}
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills & Resume</Text>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Skills</Text>
              <TextInput
                value={formState.skills}
                onChangeText={(value) => handleChange('skills', value)}
                placeholder="e.g. JavaScript, UI Design, React Native"
                placeholderTextColor="#94a3b8"
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={3}
              />
              <Text style={styles.helperText}>Separate skills with commas</Text>
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Resume URL</Text>
              <TextInput
                value={formState.resumeUrl}
                onChangeText={(value) => handleChange('resumeUrl', value)}
                placeholder="https://..."
                placeholderTextColor="#94a3b8"
                style={styles.input}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
          </View>
        </>
      )}

      {/* Faculty Profile */}
      {data.role === 'FACULTY' && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Faculty Information</Text>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Faculty ID</Text>
              <TextInput
                value={formState.facultyId}
                onChangeText={(value) => handleChange('facultyId', value)}
                placeholder="Enter faculty ID"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Designation</Text>
              <TextInput
                value={formState.designation}
                onChangeText={(value) => handleChange('designation', value)}
                placeholder="e.g. Assistant Professor"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Department</Text>
              <TextInput
                value={formState.department}
                onChangeText={(value) => handleChange('department', value)}
                placeholder="e.g. Computer Science"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />
            </View>
          </View>
        </>
      )}

      {/* Industry Profile */}
      {data.role === 'INDUSTRY' && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Company Information</Text>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Company Name</Text>
              <TextInput
                value={formState.companyName}
                onChangeText={(value) => handleChange('companyName', value)}
                placeholder="Enter company name"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Company Website</Text>
              <TextInput
                value={formState.companyWebsite}
                onChangeText={(value) => handleChange('companyWebsite', value)}
                placeholder="https://..."
                placeholderTextColor="#94a3b8"
                style={styles.input}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Contact Person Name</Text>
              <TextInput
                value={formState.contactPersonName}
                onChangeText={(value) => handleChange('contactPersonName', value)}
                placeholder="Enter contact person name"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Contact Number</Text>
              <TextInput
                keyboardType="phone-pad"
                value={formState.contactNumber}
                onChangeText={(value) => handleChange('contactNumber', value)}
                placeholder="+91 XXXXXXXXXX"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Designation</Text>
              <TextInput
                value={formState.designation}
                onChangeText={(value) => handleChange('designation', value)}
                placeholder="e.g. HR Manager"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Company Address</Text>
              <TextInput
                value={formState.companyAddress}
                onChangeText={(value) => handleChange('companyAddress', value)}
                placeholder="Enter company address"
                placeholderTextColor="#94a3b8"
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </>
      )}

      <Pressable
        style={[styles.primaryButton, (!hasChanges || updateMutation.isPending) && styles.buttonDisabled]}
        disabled={!hasChanges || updateMutation.isPending}
        onPress={handleSave}
      >
        {updateMutation.isPending ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.primaryButtonText}>Save changes</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
    backgroundColor: '#f8fafc'
  },
  // Stats Section
  statsSection: {
    gap: 12
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a'
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  statCard: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a'
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center'
  },
  // Profile Form
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a'
  },
  subtitle: {
    color: '#475569'
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    gap: 16,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a'
  },
  fieldGroup: {
    gap: 8
  },
  label: {
    color: '#334155',
    fontSize: 14
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0f172a',
    backgroundColor: '#ffffff'
  },
  disabled: {
    backgroundColor: '#e2e8f0',
    color: '#475569'
  },
  row: {
    flexDirection: 'row',
    gap: 12
  },
  halfWidth: {
    flex: 1
  },
  textArea: {
    textAlignVertical: 'top'
  },
  helperText: {
    color: '#64748b',
    fontSize: 13
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16
  },
  buttonDisabled: {
    opacity: 0.5
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
    backgroundColor: '#f8fafc'
  },
  statusText: {
    color: '#475569'
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center'
  },
  errorDescription: {
    color: '#dc2626',
    textAlign: 'center'
  }
});
