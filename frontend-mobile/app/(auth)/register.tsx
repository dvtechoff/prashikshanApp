import { useState } from 'react';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

import { useRegisterMutation } from '@/hooks/useAuth';
import type { RegisterRequest, UserRole, StudentProfileData, FacultyProfileData, IndustryProfileData } from '@/types/api';
import { getErrorMessage } from '@/utils/error';

interface RegisterFormState {
  // Common fields
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  phone: string;
  university: string;
  college: string;
  
  // Student fields
  enrollment_no: string;
  course: string;
  year: string;
  skills: string;
  
  // Faculty fields
  designation: string;
  department: string;
  faculty_id: string;
  
  // Industry fields
  company_name: string;
  company_website: string;
  contact_person_name: string;
  contact_number: string;
  industry_designation: string;
  company_address: string;
}

const initialState: RegisterFormState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'STUDENT',
  phone: '',
  university: '',
  college: '',
  enrollment_no: '',
  course: '',
  year: '',
  skills: '',
  designation: '',
  department: '',
  faculty_id: '',
  company_name: '',
  company_website: '',
  contact_person_name: '',
  contact_number: '',
  industry_designation: '',
  company_address: ''
};

const roleOptions: Array<{ label: string; value: UserRole; icon: string }> = [
  { label: 'Student', value: 'STUDENT', icon: '👩‍🎓' },
  { label: 'Faculty', value: 'FACULTY', icon: '👨‍🏫' },
  { label: 'Industry', value: 'INDUSTRY', icon: '🏢' }
];

export default function RegisterScreen() {
  const [formState, setFormState] = useState<RegisterFormState>(initialState);
  const registerMutation = useRegisterMutation();

  const passwordsMatch = formState.password === formState.confirmPassword;
  
  const isFormValid = () => {
    const baseValid = !!formState.name.trim() &&
      !!formState.email.trim() &&
      formState.password.length >= 8 &&
      passwordsMatch;
    
    if (formState.role === 'FACULTY') {
      return baseValid && !!formState.phone.trim();
    }
    if (formState.role === 'INDUSTRY') {
      return baseValid && 
        !!formState.company_name.trim() && 
        !!formState.contact_person_name.trim() &&
        !!formState.contact_number.trim();
    }
    return baseValid;
  };

  const handleChange = <Key extends keyof RegisterFormState>(key: Key, value: RegisterFormState[Key]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const payload: RegisterRequest = {
      name: formState.name.trim(),
      email: formState.email.trim().toLowerCase(),
      password: formState.password,
      role: formState.role,
      phone: formState.role !== 'INDUSTRY' ? formState.phone.trim() || undefined : undefined,
      university: formState.role !== 'INDUSTRY' ? formState.university.trim() || undefined : undefined
    };

    if (formState.role === 'STUDENT') {
      const student_profile: StudentProfileData = {
        phone: formState.phone.trim() || undefined,
        university: formState.university.trim() || undefined,
        college: formState.college.trim() || undefined,
        enrollment_no: formState.enrollment_no.trim() || undefined,
        course: formState.course.trim() || undefined,
        year: formState.year.trim() || undefined,
        skills: formState.skills.trim() 
          ? formState.skills.split(',').map(s => s.trim()).filter(Boolean)
          : undefined
      };
      payload.student_profile = student_profile;
    } else if (formState.role === 'FACULTY') {
      const faculty_profile: FacultyProfileData = {
        phone: formState.phone.trim(),
        university: formState.university.trim() || undefined,
        college: formState.college.trim() || undefined,
        designation: formState.designation.trim() || undefined,
        department: formState.department.trim() || undefined,
        faculty_id: formState.faculty_id.trim() || undefined
      };
      payload.faculty_profile = faculty_profile;
    } else if (formState.role === 'INDUSTRY') {
      const industry_profile: IndustryProfileData = {
        company_name: formState.company_name.trim(),
        company_website: formState.company_website.trim() || undefined,
        contact_person_name: formState.contact_person_name.trim(),
        contact_number: formState.contact_number.trim(),
        designation: formState.industry_designation.trim() || undefined,
        company_address: formState.company_address.trim() || undefined
      };
      payload.industry_profile = industry_profile;
    }

    try {
      await registerMutation.mutateAsync(payload);
      if (formState.role === 'FACULTY' || formState.role === 'INDUSTRY') {
        Alert.alert(
          'Account Created! 🎉',
          'Your account is pending admin verification. You\'ll be notified once approved.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
        );
      } else {
        router.replace('/(app)/dashboard');
      }
    } catch (error) {
      Alert.alert('Could not create account', getErrorMessage(error));
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.flex} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Prashikshan and start your journey</Text>
        </View>

        {/* Role Selection */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Select Your Role</Text>
          <View style={styles.roleSelector}>
            {roleOptions.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.roleCard,
                  formState.role === option.value && styles.roleCardActive
                ]}
                onPress={() => handleChange('role', option.value)}
              >
                <Text style={styles.roleIcon}>{option.icon}</Text>
                <Text style={[
                  styles.roleLabel,
                  formState.role === option.value && styles.roleLabelActive
                ]}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Common Fields */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              autoCapitalize="words"
              value={formState.name}
              onChangeText={(value) => handleChange('name', value)}
              placeholder="Enter your full name"
              placeholderTextColor="#94a3b8"
              style={styles.input}
              textContentType="name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              value={formState.email}
              onChangeText={(value) => handleChange('email', value)}
              placeholder="your.email@example.com"
              placeholderTextColor="#94a3b8"
              style={styles.input}
              textContentType="emailAddress"
              autoComplete="email"
            />
          </View>

          <View style={styles.rowGroup}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Password *</Text>
              <TextInput
                value={formState.password}
                onChangeText={(value) => handleChange('password', value)}
                placeholder="Min. 8 characters"
                placeholderTextColor="#94a3b8"
                style={styles.input}
                secureTextEntry
                textContentType="newPassword"
                autoComplete="password-new"
              />
            </View>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Confirm *</Text>
              <TextInput
                value={formState.confirmPassword}
                onChangeText={(value) => handleChange('confirmPassword', value)}
                placeholder="Re-enter"
                placeholderTextColor="#94a3b8"
                style={styles.input}
                secureTextEntry
                textContentType="password"
              />
            </View>
          </View>

          {!passwordsMatch && formState.confirmPassword.length > 0 && (
            <Text style={styles.errorText}>⚠️ Passwords do not match</Text>
          )}

          {formState.role !== 'INDUSTRY' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone {formState.role === 'FACULTY' ? '*' : ''}</Text>
                <TextInput
                  keyboardType="phone-pad"
                  value={formState.phone}
                  onChangeText={(value) => handleChange('phone', value)}
                  placeholder="+91 XXXXXXXXXX"
                  placeholderTextColor="#94a3b8"
                  style={styles.input}
                  textContentType="telephoneNumber"
                  autoComplete="tel"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>University</Text>
                <TextInput
                  value={formState.university}
                  onChangeText={(value) => handleChange('university', value)}
                  placeholder="Enter university name"
                  placeholderTextColor="#94a3b8"
                  style={styles.input}
                />
              </View>

              <View style={styles.inputGroup}>
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

        {/* Student Fields */}
        {formState.role === 'STUDENT' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>👩‍🎓 Student Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Enrollment Number</Text>
              <TextInput
                value={formState.enrollment_no}
                onChangeText={(value) => handleChange('enrollment_no', value)}
                placeholder="e.g., 2021CSE001"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />
            </View>

            <View style={styles.rowGroup}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Course</Text>
                <TextInput
                  value={formState.course}
                  onChangeText={(value) => handleChange('course', value)}
                  placeholder="B.Tech CSE"
                  placeholderTextColor="#94a3b8"
                  style={styles.input}
                />
              </View>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Year</Text>
                <TextInput
                  value={formState.year}
                  onChangeText={(value) => handleChange('year', value)}
                  placeholder="3rd Year"
                  placeholderTextColor="#94a3b8"
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Skills (comma-separated)</Text>
              <TextInput
                value={formState.skills}
                onChangeText={(value) => handleChange('skills', value)}
                placeholder="React, Python, ML"
                placeholderTextColor="#94a3b8"
                style={styles.input}
                multiline
              />
            </View>
          </View>
        )}

        {/* Faculty Fields */}
        {formState.role === 'FACULTY' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>👨‍🏫 Faculty Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Designation</Text>
              <TextInput
                value={formState.designation}
                onChangeText={(value) => handleChange('designation', value)}
                placeholder="Assistant Professor"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Department</Text>
              <TextInput
                value={formState.department}
                onChangeText={(value) => handleChange('department', value)}
                placeholder="Computer Science"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Faculty ID</Text>
              <TextInput
                value={formState.faculty_id}
                onChangeText={(value) => handleChange('faculty_id', value)}
                placeholder="Employee ID"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />
            </View>

            {/* <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                🔒 Requires admin verification
              </Text>
            </View> */}
          </View>
        )}

        {/* Industry Fields */}
        {formState.role === 'INDUSTRY' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>🏢 Company Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Company Name *</Text>
              <TextInput
                value={formState.company_name}
                onChangeText={(value) => handleChange('company_name', value)}
                placeholder="Company name"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Website</Text>
              <TextInput
                autoCapitalize="none"
                value={formState.company_website}
                onChangeText={(value) => handleChange('company_website', value)}
                placeholder="www.company.com"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contact Person *</Text>
              <TextInput
                value={formState.contact_person_name}
                onChangeText={(value) => handleChange('contact_person_name', value)}
                placeholder="HR Manager name"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contact Number *</Text>
              <TextInput
                keyboardType="phone-pad"
                value={formState.contact_number}
                onChangeText={(value) => handleChange('contact_number', value)}
                placeholder="+91 XXXXXXXXXX"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Designation</Text>
              <TextInput
                value={formState.industry_designation}
                onChangeText={(value) => handleChange('industry_designation', value)}
                placeholder="HR Manager"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                value={formState.company_address}
                onChangeText={(value) => handleChange('company_address', value)}
                placeholder="Company address"
                placeholderTextColor="#94a3b8"
                style={styles.input}
                multiline
              />
            </View>

            {/* <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                🔒 Requires admin verification
              </Text>
            </View> */}
          </View>
        )}

        {/* Submit Button */}
        <Pressable
          style={[styles.submitButton, (!isFormValid() || registerMutation.isPending) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!isFormValid() || registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitButtonText}>Create Account</Text>
          )}
        </Pressable>

        {/* Login Link */}
        <Pressable style={styles.loginLink} onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.loginLinkText}>
            Already have an account? <Text style={styles.loginLinkBold}>Sign In</Text>
          </Text>
        </Pressable>

        <View style={styles.spacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  container: {
    padding: 20,
    paddingTop: 40
  },
  header: {
    marginBottom: 24
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 22
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 16
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 12
  },
  roleCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0'
  },
  roleCardActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb'
  },
  roleIcon: {
    fontSize: 32,
    marginBottom: 8
  },
  roleLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center'
  },
  roleLabelActive: {
    color: '#2563eb'
  },
  inputGroup: {
    marginBottom: 16
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0f172a'
  },
  rowGroup: {
    flexDirection: 'row',
    gap: 12
  },
  halfWidth: {
    flex: 1
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    marginTop: -8,
    marginBottom: 8
  },
  infoBox: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 12,
    marginTop: 8
  },
  infoText: {
    fontSize: 13,
    color: '#92400e',
    lineHeight: 18
  },
  submitButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8
  },
  submitButtonDisabled: {
    opacity: 0.5
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600'
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center'
  },
  loginLinkText: {
    color: '#64748b',
    fontSize: 15
  },
  loginLinkBold: {
    color: '#2563eb',
    fontWeight: '600'
  },
  spacer: {
    height: 40
  }
});
