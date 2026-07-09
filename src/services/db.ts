import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, AttendanceRecord, OdRecord, SyncLog } from '../types';

// ========================================================
// MOCK DATABASE ENGINE (localStorage-based)
// ========================================================

const MOCK_DELAY = 600; // ms to simulate network latency

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getMockData = <T>(key: string, defaultVal: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultVal;
};

const setMockData = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Initialize mock database with sample data if empty
const initializeMockDB = (userId: string) => {
  const attendance = getMockData<AttendanceRecord[]>('cozy_attendance', []);
  if (attendance.length === 0) {
    const sampleAttendance: AttendanceRecord[] = [
      {
        id: 'mock-att-1',
        user_id: userId,
        subject: 'Data Structures & Algorithms',
        attended_classes: 28,
        total_classes: 32,
        attendance_percentage: 87.5,
        last_updated: new Date(Date.now() - 4 * 3600000).toISOString(),
      },
      {
        id: 'mock-att-2',
        user_id: userId,
        subject: 'Database Management Systems',
        attended_classes: 24,
        total_classes: 30,
        attendance_percentage: 80.0,
        last_updated: new Date(Date.now() - 12 * 3600000).toISOString(),
      },
      {
        id: 'mock-att-3',
        user_id: userId,
        subject: 'Operating Systems',
        attended_classes: 15,
        total_classes: 22,
        attendance_percentage: 68.18,
        last_updated: new Date(Date.now() - 24 * 3600000).toISOString(),
      },
      {
        id: 'mock-att-4',
        user_id: userId,
        subject: 'Computer Networks',
        attended_classes: 25,
        total_classes: 28,
        attendance_percentage: 89.29,
        last_updated: new Date(Date.now() - 2 * 3600000).toISOString(),
      },
      {
        id: 'mock-att-5',
        user_id: userId,
        subject: 'Advanced Engineering Math',
        attended_classes: 16,
        total_classes: 20,
        attendance_percentage: 80.0,
        last_updated: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
      }
    ];
    setMockData('cozy_attendance', sampleAttendance);
  }

  const ods = getMockData<OdRecord[]>('cozy_od_records', []);
  if (ods.length === 0) {
    const sampleOds: OdRecord[] = [
      {
        id: 'mock-od-1',
        user_id: userId,
        date: new Date(Date.now() - 5 * 24 * 3600000).toISOString().split('T')[0],
        subject: 'Operating Systems',
        reason: 'Representing college in Inter-College Coding Hackathon',
        faculty: 'Dr. Sarah Smith',
        event: 'HackSummit 2026',
        proof_url: 'https://example.com/proof-certificate.pdf',
        status: 'Approved',
        created_at: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
      },
      {
        id: 'mock-od-2',
        user_id: userId,
        date: new Date(Date.now() - 1 * 24 * 3600000).toISOString().split('T')[0],
        subject: 'Database Management Systems',
        reason: 'Attending IEEE workshop on Cloud Computing',
        faculty: 'Prof. Ramesh Kumar',
        event: 'IEEE Cloudcon 2026',
        status: 'Pending',
        created_at: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
      }
    ];
    setMockData('cozy_od_records', sampleOds);
  }

  const logs = getMockData<SyncLog[]>('cozy_sync_logs', []);
  if (logs.length === 0) {
    const sampleLogs: SyncLog[] = [
      {
        id: 'mock-log-1',
        user_id: userId,
        sync_time: new Date(Date.now() - 24 * 3600000).toISOString(),
        status: 'Success',
        message: 'Successfully synchronized 5 subjects from aims.rkmvc.ac.in',
        created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
      }
    ];
    setMockData('cozy_sync_logs', sampleLogs);
  }
};

// ========================================================
// AUTHENTICATION AND PROFILE OPERATIONS
// ========================================================

// -------------------------------------------------------
// Helper: convert register number to internal fake email
// e.g. "23MCS012" -> "23mcs012@rkmvc.local"
// This lets Supabase Auth work without sending real emails.
// -------------------------------------------------------
const regToEmail = (regNumber: string) =>
  `${regNumber.trim().toLowerCase()}@student.rkmvc.ac.in`;

const DEMO_REG_NO = '2413281033018';
const seedDemoStudent = () => {
  if (isSupabaseConfigured) return;
  const mockProfiles = getMockData<UserProfile[]>('cozy_profiles', []);
  if (!mockProfiles.some(p => p.register_number?.toLowerCase() === DEMO_REG_NO.toLowerCase())) {
    const demoId = 'demo-user-id';
    const newProfile: UserProfile = {
      id: demoId,
      name: 'Demo Student',
      email: regToEmail(DEMO_REG_NO),
      register_number: DEMO_REG_NO,
      department: 'Computer Science',
      semester: 4,
      section: 'A',
      created_at: new Date().toISOString(),
    };
    mockProfiles.push(newProfile);
    setMockData('cozy_profiles', mockProfiles);
    initializeMockDB(demoId); // This ensures attendance and OD records are created for this user
  }
};
seedDemoStudent();


export const dbAuth = {
  isDemoMode: !isSupabaseConfigured,

  // registerNumber + password + profile details
  signUp: async (registerNumber: string, password: string, name: string, details: Partial<UserProfile>) => {
    const internalEmail = regToEmail(registerNumber);

    if (!isSupabaseConfigured) {
      await sleep(MOCK_DELAY);
      const mockProfiles = getMockData<UserProfile[]>('cozy_profiles', []);

      if (mockProfiles.some(p => p.register_number?.toLowerCase() === registerNumber.trim().toLowerCase())) {
        throw new Error('An account with this registration number already exists.');
      }

      const newId = crypto.randomUUID();
      const newProfile: UserProfile = {
        id: newId,
        name,
        email: internalEmail,
        register_number: registerNumber.trim().toUpperCase(),
        department: details.department || '',
        semester: details.semester || 1,
        section: details.section || '',
        created_at: new Date().toISOString(),
      };

      mockProfiles.push(newProfile);
      setMockData('cozy_profiles', mockProfiles);
      setMockData('cozy_session', newProfile);
      initializeMockDB(newId);

      return { user: { id: newId, email: internalEmail }, profile: newProfile, error: null };
    } else {
      const { data, error } = await supabase!.auth.signUp({
        email: internalEmail,
        password,
        options: {
          emailRedirectTo: undefined,
          data: {
            name,
            register_number: registerNumber.trim().toUpperCase(),
            department: details.department,
            semester: details.semester,
            section: details.section,
          }
        }
      });

      // If Supabase returns an error, propagate it
      if (error) return { user: null, profile: null, error };

      const userId = data.user?.id;
      if (!userId) {
        return { user: null, profile: null, error: { message: 'Account creation failed. Please try again.' } };
      }

      // Wait briefly for the DB trigger to run, then upsert the profile
      // manually in case email confirmation is still enabled (user exists but unconfirmed).
      await sleep(800);

      const profileData = {
        id: userId,
        name,
        email: internalEmail,
        register_number: registerNumber.trim().toUpperCase(),
        department: details.department || '',
        semester: details.semester || 1,
        section: details.section || '',
      };

      // Upsert so this works whether or not the trigger already created the row
      const { data: profile, error: pError } = await supabase!
        .from('users')
        .upsert(profileData, { onConflict: 'id' })
        .select()
        .single();

      if (pError) {
        // Profile insert failed but auth user was created — still return user so they can sign in
        console.warn('Profile upsert warning:', pError.message);
        return { user: data.user, profile: profileData as any, error: null };
      }

      return { user: data.user, profile, error: null };
    }
  },

  // Login with register number + password + captcha
  signIn: async (registerNumber: string, password: string, captcha?: string, cookie?: string) => {
    const internalEmail = regToEmail(registerNumber);

    // Try logging in via portal proxy if captcha and cookie are provided
    let proxyData: any = null;
    if (captcha && cookie) {
      try {
        const proxyRes = await fetch('http://localhost:3001/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_code: registerNumber,
            password,
            captcha,
            cookie
          })
        });
        const resData = await proxyRes.json();
        if (!proxyRes.ok) {
          throw new Error(resData.error || 'Portal login failed.');
        }
        proxyData = resData.data;
      } catch (err: any) {
        return { user: null, profile: null, error: err };
      }
    }

    if (!isSupabaseConfigured) {
      await sleep(MOCK_DELAY);
      const mockProfiles = getMockData<UserProfile[]>('cozy_profiles', []);
      let profile = mockProfiles.find(
        p => p.register_number?.toLowerCase() === registerNumber.trim().toLowerCase()
      );

      if (!profile) {
        // Since we logged into the portal, let's create a profile for them if they don't exist
        if (proxyData) {
          const newId = crypto.randomUUID();
          profile = {
            id: newId,
            name: `Student ${registerNumber}`,
            email: internalEmail,
            register_number: registerNumber.trim().toUpperCase(),
            department: 'Computer Science',
            semester: 1,
            section: 'A',
            created_at: new Date().toISOString(),
          };
          mockProfiles.push(profile);
          setMockData('cozy_profiles', mockProfiles);
          initializeMockDB(profile.id);
        } else {
          return { user: null, profile: null, error: new Error('Invalid registration number or password.') };
        }
      }

      setMockData('cozy_session', profile);
      
      // If we got proxy data (attendance), update the demo DB with it
      if (proxyData && Array.isArray(proxyData)) {
        let existingAttendance = getMockData<AttendanceRecord[]>('cozy_attendance', []);
        
        // Remove old attendance for this user to replace with real portal data
        existingAttendance = existingAttendance.filter(a => a.user_id !== profile!.id);
        
        for (const item of proxyData) {
          existingAttendance.push({
            id: crypto.randomUUID(),
            user_id: profile!.id,
            subject: item.subject,
            attended_classes: item.attended,
            total_classes: item.total,
            attendance_percentage: item.total === 0 ? 100 : Math.round((item.attended / item.total) * 10000) / 100,
            last_updated: new Date().toISOString()
          });
        }
        setMockData('cozy_attendance', existingAttendance);
      } else if (!proxyData) {
        initializeMockDB(profile.id);
      }

      return { user: { id: profile.id, email: profile.email }, profile, error: null };
    } else {
      const { data, error } = await supabase!.auth.signInWithPassword({
        email: internalEmail,
        password
      });
      if (error) return { user: null, profile: null, error };

      const { data: profile, error: pError } = await supabase!
        .from('users')
        .select('*')
        .eq('id', data.user?.id)
        .single();

      return { user: data.user, profile, error: pError };
    }
  },

  signOut: async () => {
    if (!isSupabaseConfigured) {
      await sleep(200);
      localStorage.removeItem('cozy_session');
      return { error: null };
    } else {
      const { error } = await supabase!.auth.signOut();
      return { error };
    }
  },

  getCurrentUser: async () => {
    if (!isSupabaseConfigured) {
      const session = getMockData<UserProfile | null>('cozy_session', null);
      if (session) {
        initializeMockDB(session.id);
        return { user: { id: session.id, email: session.email }, profile: session, error: null };
      }
      return { user: null, profile: null, error: null };
    } else {
      const { data: { user } } = await supabase!.auth.getUser();
      if (!user) return { user: null, profile: null, error: null };

      const { data: profile, error } = await supabase!
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      return { user, profile, error };
    }
  },

  updateProfile: async (userId: string, updates: Partial<UserProfile>) => {
    if (!isSupabaseConfigured) {
      await sleep(MOCK_DELAY);
      const mockProfiles = getMockData<UserProfile[]>('cozy_profiles', []);
      const idx = mockProfiles.findIndex(p => p.id === userId);
      if (idx === -1) throw new Error('Profile not found');

      const updatedProfile = { ...mockProfiles[idx], ...updates };
      mockProfiles[idx] = updatedProfile;
      setMockData('cozy_profiles', mockProfiles);

      const session = getMockData<UserProfile | null>('cozy_session', null);
      if (session && session.id === userId) {
        setMockData('cozy_session', updatedProfile);
      }

      return { profile: updatedProfile, error: null };
    } else {
      const { data, error } = await supabase!
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      return { data, error };
    }
  }
};

// ========================================================
// ATTENDANCE OPERATIONS
// ========================================================

export const dbAttendance = {
  getAttendance: async (userId: string): Promise<{ data: AttendanceRecord[]; error: any }> => {
    if (!isSupabaseConfigured) {
      await sleep(MOCK_DELAY - 200);
      const attendance = getMockData<AttendanceRecord[]>('cozy_attendance', []);
      return { data: attendance.filter(a => a.user_id === userId), error: null };
    } else {
      const { data, error } = await supabase!
        .from('attendance')
        .select('*')
        .eq('user_id', userId)
        .order('subject', { ascending: true });
      return { data: data || [], error };
    }
  },

  addSubject: async (userId: string, subject: string, attended: number, total: number): Promise<{ data: AttendanceRecord | null; error: any }> => {
    const percentage = total === 0 ? 100 : Math.round((attended / total) * 10000) / 100;
    
    if (!isSupabaseConfigured) {
      await sleep(MOCK_DELAY);
      const attendance = getMockData<AttendanceRecord[]>('cozy_attendance', []);
      
      if (attendance.some(a => a.user_id === userId && a.subject.toLowerCase() === subject.toLowerCase())) {
        return { data: null, error: { message: 'Subject already exists.' } };
      }

      const newRecord: AttendanceRecord = {
        id: crypto.randomUUID(),
        user_id: userId,
        subject,
        attended_classes: attended,
        total_classes: total,
        attendance_percentage: percentage,
        last_updated: new Date().toISOString()
      };

      attendance.push(newRecord);
      setMockData('cozy_attendance', attendance);
      return { data: newRecord, error: null };
    } else {
      const { data, error } = await supabase!
        .from('attendance')
        .insert({
          user_id: userId,
          subject,
          attended_classes: attended,
          total_classes: total,
          attendance_percentage: percentage
        })
        .select()
        .single();
      return { data, error };
    }
  },

  updateAttendance: async (id: string, attended: number, total: number): Promise<{ data: AttendanceRecord | null; error: any }> => {
    const percentage = total === 0 ? 100 : Math.round((attended / total) * 10000) / 100;
    
    if (!isSupabaseConfigured) {
      await sleep(200);
      const attendance = getMockData<AttendanceRecord[]>('cozy_attendance', []);
      const idx = attendance.findIndex(a => a.id === id);
      if (idx === -1) return { data: null, error: { message: 'Record not found' } };

      const updated = {
        ...attendance[idx],
        attended_classes: attended,
        total_classes: total,
        attendance_percentage: percentage,
        last_updated: new Date().toISOString()
      };
      attendance[idx] = updated;
      setMockData('cozy_attendance', attendance);
      return { data: updated, error: null };
    } else {
      const { data, error } = await supabase!
        .from('attendance')
        .update({
          attended_classes: attended,
          total_classes: total,
          attendance_percentage: percentage,
          last_updated: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    }
  },

  deleteSubject: async (id: string): Promise<{ error: any }> => {
    if (!isSupabaseConfigured) {
      await sleep(200);
      const attendance = getMockData<AttendanceRecord[]>('cozy_attendance', []);
      const filtered = attendance.filter(a => a.id !== id);
      setMockData('cozy_attendance', filtered);
      return { error: null };
    } else {
      const { error } = await supabase!
        .from('attendance')
        .delete()
        .eq('id', id);
      return { error };
    }
  }
};

// ========================================================
// ON DUTY (OD) OPERATIONS
// ========================================================

export const dbOd = {
  getOds: async (userId: string): Promise<{ data: OdRecord[]; error: any }> => {
    if (!isSupabaseConfigured) {
      await sleep(MOCK_DELAY - 200);
      const ods = getMockData<OdRecord[]>('cozy_od_records', []);
      return { data: ods.filter(o => o.user_id === userId).sort((a,b) => b.date.localeCompare(a.date)), error: null };
    } else {
      const { data, error } = await supabase!
        .from('od_records')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      return { data: data || [], error };
    }
  },

  addOd: async (userId: string, record: Omit<OdRecord, 'id' | 'user_id' | 'status' | 'created_at'>): Promise<{ data: OdRecord | null; error: any }> => {
    if (!isSupabaseConfigured) {
      await sleep(MOCK_DELAY);
      const ods = getMockData<OdRecord[]>('cozy_od_records', []);
      const newOd: OdRecord = {
        ...record,
        id: crypto.randomUUID(),
        user_id: userId,
        status: 'Pending',
        created_at: new Date().toISOString()
      };
      ods.push(newOd);
      setMockData('cozy_od_records', ods);
      return { data: newOd, error: null };
    } else {
      const { data, error } = await supabase!
        .from('od_records')
        .insert({
          user_id: userId,
          ...record,
          status: 'Pending'
        })
        .select()
        .single();
      return { data, error };
    }
  },

  updateOd: async (id: string, updates: Partial<OdRecord>): Promise<{ data: OdRecord | null; error: any }> => {
    if (!isSupabaseConfigured) {
      await sleep(300);
      const ods = getMockData<OdRecord[]>('cozy_od_records', []);
      const idx = ods.findIndex(o => o.id === id);
      if (idx === -1) return { data: null, error: { message: 'OD Record not found' } };

      const updated = { ...ods[idx], ...updates };
      ods[idx] = updated;
      setMockData('cozy_od_records', ods);
      return { data: updated, error: null };
    } else {
      const { data, error } = await supabase!
        .from('od_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    }
  },

  deleteOd: async (id: string): Promise<{ error: any }> => {
    if (!isSupabaseConfigured) {
      await sleep(200);
      const ods = getMockData<OdRecord[]>('cozy_od_records', []);
      const filtered = ods.filter(o => o.id !== id);
      setMockData('cozy_od_records', filtered);
      return { error: null };
    } else {
      const { error } = await supabase!
        .from('od_records')
        .delete()
        .eq('id', id);
      return { error };
    }
  }
};

// ========================================================
// SYNC LOGS OPERATIONS
// ========================================================

export const dbLogs = {
  getLogs: async (userId: string): Promise<{ data: SyncLog[]; error: any }> => {
    if (!isSupabaseConfigured) {
      const logs = getMockData<SyncLog[]>('cozy_sync_logs', []);
      return { data: logs.filter(l => l.user_id === userId).sort((a,b) => b.sync_time.localeCompare(a.sync_time)), error: null };
    } else {
      const { data, error } = await supabase!
        .from('sync_logs')
        .select('*')
        .eq('user_id', userId)
        .order('sync_time', { ascending: false })
        .limit(10);
      return { data: data || [], error };
    }
  },

  addLog: async (userId: string, status: 'Success' | 'Failure', message: string): Promise<{ data: SyncLog | null; error: any }> => {
    if (!isSupabaseConfigured) {
      const logs = getMockData<SyncLog[]>('cozy_sync_logs', []);
      const newLog: SyncLog = {
        id: crypto.randomUUID(),
        user_id: userId,
        sync_time: new Date().toISOString(),
        status,
        message,
        created_at: new Date().toISOString()
      };
      logs.push(newLog);
      setMockData('cozy_sync_logs', logs);
      return { data: newLog, error: null };
    } else {
      const { data, error } = await supabase!
        .from('sync_logs')
        .insert({
          user_id: userId,
          status,
          message
        })
        .select()
        .single();
      return { data, error };
    }
  }
};
