# AI-Doctor Full Stack System

## Overview
AI-Doctor is an AI-powered, mobile-first SaaS solution for emergency medicine specialists. It serves as a patient tracking and clinical decision support system, featuring a Node.js/Express backend API and a React Native mobile application. The platform aims to streamline emergency medical workflows, enhance decision-making through AI insights, and provide comprehensive patient management and clinical documentation in emergency room settings with an intuitive Turkish-language interface. The business vision is to offer a scalable solution for healthcare providers, focusing on efficiency and intelligent assistance.

## Recent Changes
**October 19, 2025**: Major UI/UX improvements across Chat and AI Analysis interfaces
- **Chat Interface Enhancements**:
  - Redesigned QuickQuestions bar: more compact (8px padding, 12px font), always visible
  - Fixed keyboard overlap issue with improved KeyboardAvoidingView settings (iOS: 140px, Android: 20px offset)
  - Modernized input box with rounded corners (24px radius), elevation, and shadow
  - Repositioned clear chat button next to input for better UX
  - Implemented auto-scroll with floating FAB and empty state
- **AI Analysis Page Redesign**:
  - Minimized risk score (70px gauge) and emergency badge to compact header layout
  - Moved emergency alert from large banner to small chip badge in top-right
  - Created ChecklistItem component for tests/interventions with checkbox UI
  - Implemented Firestore-backed persistence for completed checklist items
  - Strikethrough styling for completed tasks with opacity effects
- **Technical Improvements**:
  - Added useEffect sync for ChecklistItem to properly restore Firestore state
  - Integrated Firestore subcollection for tracking test/intervention completion
  - Fixed all LSP issues and completed architect review

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The mobile application prioritizes a Turkish-language interface and adheres to Material Design principles using React Native Paper components, ensuring visual coherence with a consistent color palette.

### Technical Implementations

#### Backend Framework
The backend is built with Node.js and Express.js, providing a scalable RESTful API.

#### Authentication & Security
Firebase Authentication handles user authentication, with the Firebase Admin SDK verifying ID tokens for API security.

#### Data Layer Architecture
Cloud Firestore (NoSQL) serves as the primary database, offering automatic scaling, real-time capabilities, and offline support. Data is organized into collections for users, patients, vital signs, lab results, imaging results, medical history, AI analyses, chat messages, OCR results, and file metadata.

#### File Storage
Replit Object Storage is used for medical image uploads and OCR processing.

#### Application Structure
A layered architecture separates concerns into controllers, services, middleware, and utilities.

#### Error Handling
A centralized error middleware provides consistent, environment-aware error responses.

#### Role-Based Access Control
A role-based system (DOCTOR, ADMIN) manages permissions via Firestore Security Rules and backend middleware.

#### Patient Management System
A state machine manages patient workflow through statuses (EVALUATION, LAB_WAITING, CONSULTATION, READY, DISCHARGED) and priority levels (low, medium, high, critical).

#### Subscription & Usage Limits
A tiered subscription model (FREE, PREMIUM, ENTERPRISE) is implemented, with the FREE tier limited to 3 active patients.

### Feature Specifications

#### Backend API
- **Patient Management**: CRUD operations for patients, including soft-delete, subscription limits, and status workflow validation.
- **Clinical Data Entry**: APIs for managing vital signs, medical history, lab results, and imaging results.
- **User Authentication**: User registration and profile management with Firebase Authentication.
- **Firebase Integration**: Full Firebase Admin SDK integration with Firestore and Storage.

#### Mobile Application
- **Authentication Flow**: Login/Register screens with Firebase Authentication and session persistence.
- **Patient List Screen**: Displays patients with priority indicators, status badges (in Turkish), and active patient count. Supports adding new patients.
- **Patient Detail Screen**: Features tab navigation (Summary, Anamnesis, Tests, AI, Chat) for comprehensive patient data management.
  - **SummaryTab**: Patient overview, demographics, and latest vital signs.
  - **AnamnesisTab**: Medical history form.
  - **TestsTab**: Lab and imaging results with status tracking and OCR support.
  - **AITab**: AI-powered patient analysis with diagnosis suggestions and risk assessment.
  - **ChatTab**: Professional AI chat assistant with Markdown support, quick questions, message copying, chat clearing, and real-time synchronization.
- **Navigation**: Stack Navigator for app navigation.
- **AI Integration**: Backend OpenAI service provides comprehensive patient evaluations and real-time chat assistance.

## External Dependencies

### Core Backend Dependencies
- **express**: Web application framework.
- **firebase-admin**: Firebase Admin SDK for authentication and Firestore.
- **@google-cloud/vision**: Google Cloud Vision API for OCR.
- **@replit/object-storage**: Replit's object storage for file uploads.
- **cors**: Enables Cross-Origin Resource Sharing.
- **dotenv**: Manages environment variables.
- **openai**: OpenAI API client for GPT-4 integration.

### Mobile Application Dependencies
- **React Native + Expo**: Mobile frontend framework.
- **firebase**: Firebase SDK for authentication, Firestore, and Storage.
- **Redux Toolkit**: State management.
- **React Navigation**: For app navigation.
- **react-native-tab-view**: Tab navigation.
- **Axios**: HTTP client for API communication.
- **React Native Paper**: Material Design components.
- **AsyncStorage**: Persistent data storage.
- **expo-camera**: Camera functionality for OCR.
- **expo-image-picker**: Image selection from gallery.
- **expo-file-system**: File system access.
- **expo-clipboard**: Clipboard API for copying text.
- **react-native-svg**: SVG rendering for risk gauges and charts.

### Completed Integrations
- **Firebase**: Full platform integration (Authentication, Firestore, Storage).
- **OpenAI API**: For AI-powered clinical decision support using GPT-4 model, including patient analysis and chat assistant.
- **Google Cloud Vision API**: For OCR text extraction from medical documents.
- **Replit Object Storage**: For secure medical file storage.