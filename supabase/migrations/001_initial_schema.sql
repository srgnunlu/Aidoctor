-- =====================================================
-- Aidoctor - Supabase Migration
-- Firebase'den Supabase'e geçiş için initial schema
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- USERS TABLE
-- Firebase Auth yerine Supabase Auth kullanacağız
-- =====================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  title TEXT,
  specialty TEXT,
  phone TEXT,
  role TEXT DEFAULT 'DOCTOR' CHECK (role IN ('DOCTOR', 'ADMIN', 'NURSE')),
  subscription_type TEXT DEFAULT 'FREE' CHECK (subscription_type IN ('FREE', 'PRO', 'ENTERPRISE')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PATIENTS TABLE
-- =====================================================
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Patient Demographics
  name TEXT NOT NULL,
  tc_no TEXT UNIQUE,
  age INTEGER,
  gender TEXT CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
  phone TEXT,
  
  -- Admission Info
  admission_date TIMESTAMPTZ DEFAULT NOW(),
  complaint TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- VITAL SIGNS TABLE
-- =====================================================
CREATE TABLE public.vital_signs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  
  -- Vital measurements
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  heart_rate INTEGER,
  respiratory_rate INTEGER,
  temperature NUMERIC(4, 1),
  oxygen_saturation INTEGER,
  consciousness_level TEXT,
  
  -- Notes
  notes TEXT,
  
  -- Timestamps
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- MEDICAL HISTORY TABLE
-- =====================================================
CREATE TABLE public.medical_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  
  -- History fields
  complaint_history TEXT,
  medical_history TEXT,
  surgical_history TEXT,
  family_history TEXT,
  allergies TEXT,
  current_medications TEXT,
  
  -- Lifestyle
  smoking BOOLEAN DEFAULT false,
  alcohol BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure only one medical history per patient
  UNIQUE(patient_id)
);

-- =====================================================
-- LAB RESULTS TABLE
-- =====================================================
CREATE TABLE public.lab_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  
  -- Lab test info
  test_name TEXT NOT NULL,
  test_type TEXT NOT NULL,
  category TEXT DEFAULT 'BIOCHEMISTRY' CHECK (category IN ('BIOCHEMISTRY', 'HEMATOLOGY', 'MICROBIOLOGY', 'IMMUNOLOGY', 'OTHER')),
  
  -- Results (JSONB for flexibility)
  results JSONB DEFAULT '{}'::jsonb,
  parameters JSONB DEFAULT '[]'::jsonb,
  
  -- Status
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  
  -- Notes
  notes TEXT,
  
  -- Timestamps
  ordered_at TIMESTAMPTZ DEFAULT NOW(),
  resulted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- IMAGING RESULTS TABLE
-- =====================================================
CREATE TABLE public.imaging_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  
  -- Imaging info
  imaging_type TEXT NOT NULL,
  body_part TEXT,
  findings TEXT,
  image_url TEXT,
  
  -- Status
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  
  -- Timestamps
  ordered_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CHAT MESSAGES TABLE (AI Chat)
-- =====================================================
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Message content
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AI ANALYSIS TABLE
-- =====================================================
CREATE TABLE public.ai_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Analysis results
  diagnosis JSONB DEFAULT '[]'::jsonb,
  differential_diagnosis JSONB DEFAULT '[]'::jsonb,
  recommended_tests JSONB DEFAULT '[]'::jsonb,
  treatment_suggestions JSONB DEFAULT '[]'::jsonb,
  risk_assessment JSONB DEFAULT '{}'::jsonb,
  
  -- AI model info
  model_used TEXT,
  confidence_score NUMERIC(3, 2),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES for Performance
-- =====================================================

-- Users indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);

-- Patients indexes
CREATE INDEX idx_patients_user_id ON public.patients(user_id);
CREATE INDEX idx_patients_tc_no ON public.patients(tc_no);
CREATE INDEX idx_patients_is_active ON public.patients(is_active);
CREATE INDEX idx_patients_created_at ON public.patients(created_at DESC);

-- Vital signs indexes
CREATE INDEX idx_vital_signs_patient_id ON public.vital_signs(patient_id);
CREATE INDEX idx_vital_signs_recorded_at ON public.vital_signs(recorded_at DESC);

-- Medical history indexes
CREATE INDEX idx_medical_history_patient_id ON public.medical_history(patient_id);

-- Lab results indexes
CREATE INDEX idx_lab_results_patient_id ON public.lab_results(patient_id);
CREATE INDEX idx_lab_results_status ON public.lab_results(status);
CREATE INDEX idx_lab_results_ordered_at ON public.lab_results(ordered_at DESC);
CREATE INDEX idx_lab_results_category ON public.lab_results(category);

-- Imaging results indexes
CREATE INDEX idx_imaging_results_patient_id ON public.imaging_results(patient_id);
CREATE INDEX idx_imaging_results_status ON public.imaging_results(status);
CREATE INDEX idx_imaging_results_ordered_at ON public.imaging_results(ordered_at DESC);

-- Chat messages indexes
CREATE INDEX idx_chat_messages_patient_id ON public.chat_messages(patient_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

-- AI analysis indexes
CREATE INDEX idx_ai_analysis_patient_id ON public.ai_analysis(patient_id);
CREATE INDEX idx_ai_analysis_created_at ON public.ai_analysis(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imaging_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Patients policies
CREATE POLICY "Users can view own patients" ON public.patients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own patients" ON public.patients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own patients" ON public.patients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own patients" ON public.patients
  FOR DELETE USING (auth.uid() = user_id);

-- Vital signs policies
CREATE POLICY "Users can view vital signs of own patients" ON public.vital_signs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = vital_signs.patient_id
      AND patients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create vital signs for own patients" ON public.vital_signs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = vital_signs.patient_id
      AND patients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update vital signs of own patients" ON public.vital_signs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = vital_signs.patient_id
      AND patients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete vital signs of own patients" ON public.vital_signs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = vital_signs.patient_id
      AND patients.user_id = auth.uid()
    )
  );

-- Medical history policies
CREATE POLICY "Users can view medical history of own patients" ON public.medical_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = medical_history.patient_id
      AND patients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create medical history for own patients" ON public.medical_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = medical_history.patient_id
      AND patients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update medical history of own patients" ON public.medical_history
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = medical_history.patient_id
      AND patients.user_id = auth.uid()
    )
  );

-- Lab results policies
CREATE POLICY "Users can view lab results of own patients" ON public.lab_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = lab_results.patient_id
      AND patients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create lab results for own patients" ON public.lab_results
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = lab_results.patient_id
      AND patients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update lab results of own patients" ON public.lab_results
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = lab_results.patient_id
      AND patients.user_id = auth.uid()
    )
  );

-- Imaging results policies
CREATE POLICY "Users can view imaging results of own patients" ON public.imaging_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = imaging_results.patient_id
      AND patients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create imaging results for own patients" ON public.imaging_results
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = imaging_results.patient_id
      AND patients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update imaging results of own patients" ON public.imaging_results
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = imaging_results.patient_id
      AND patients.user_id = auth.uid()
    )
  );

-- Chat messages policies
CREATE POLICY "Users can view chat messages of own patients" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = chat_messages.patient_id
      AND patients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chat messages for own patients" ON public.chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = chat_messages.patient_id
      AND patients.user_id = auth.uid()
    )
    AND auth.uid() = user_id
  );

-- AI analysis policies
CREATE POLICY "Users can view AI analysis of own patients" ON public.ai_analysis
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = ai_analysis.patient_id
      AND patients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create AI analysis for own patients" ON public.ai_analysis
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = ai_analysis.patient_id
      AND patients.user_id = auth.uid()
    )
    AND auth.uid() = user_id
  );

CREATE POLICY "Users can update AI analysis of own patients" ON public.ai_analysis
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = ai_analysis.patient_id
      AND patients.user_id = auth.uid()
    )
  );

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vital_signs_updated_at
  BEFORE UPDATE ON public.vital_signs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_history_updated_at
  BEFORE UPDATE ON public.medical_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lab_results_updated_at
  BEFORE UPDATE ON public.lab_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_imaging_results_updated_at
  BEFORE UPDATE ON public.imaging_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_analysis_updated_at
  BEFORE UPDATE ON public.ai_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- Create storage bucket for medical files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('medical-files', 'medical-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for medical-files bucket
CREATE POLICY "Users can upload medical files for own patients"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'medical-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view medical files for own patients"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'medical-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update medical files for own patients"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'medical-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete medical files for own patients"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'medical-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);