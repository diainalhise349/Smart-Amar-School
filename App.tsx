import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { Home, Login, Proposal, About, Contact, Pricing } from './pages/Public';
import { SuperAdminDashboard, TenantManagement, BlueprintDocs, SubscriptionManagement, GoogleStudioPrompt, SuperAdminSettings, ActivityLogs, GlobalReports, DomainManager, ModuleManagement, SupportHelpdesk, DataBackupExport, ScheduledBackups, ExternalStorageSync } from './pages/SuperAdmin';
import { 
  SchoolDashboard, StudentList, StudentAdmission, AdmissionRequests, StaffList, 
  FeesManagement, ExamManagement, CertificatesManagement, 
  ReportsDashboard, SchoolSettings, SchoolBackupExport, AttendanceManagement, 
  CommunicationCenter, StudentPromotion, IDCardGenerator, 
  RoutineManagement, EventsManagement, VisitorManagement, 
  ComplaintManagement, ResultSheet, RoleManagement,
  AdministratorPrimaryRequest, StudentImageUpdate, StudentDataBulkUpdate,
  StudentSelectableUpdate, StudentAddCredentials, StudentCredentialsStatus,
  StudentSendSmsCredentials, StudentTeacherAssign, StudentTeacherAssignPrint,
  StudentSeatPlan1, StudentSeatPlan2, SmallSeatPlan, IndividualStudentProgressPage,
  StudentBulkUploadPage
} from './pages/SchoolAdmin';
import { AcademicCalendar } from './pages/AcademicCalendar';
import { LibraryManagement } from './pages/LibraryManagement';
import { SchoolAdminDocuments } from './pages/SchoolAdminDocuments';
import { SchoolAdminLeaveApproval } from './pages/SchoolAdminLeaveApproval';
import { StudentVerificationPortal } from './pages/StudentVerificationPortal';
import { TeacherDashboard, TeacherPerformance, TeacherAttendance, TeacherMarks, TeacherRoutine, TeacherStudents, TeacherLeave, TeacherProfile, TeacherHomework, TeacherMaterials, TeacherLessonPlan, TeacherLiveClass } from './pages/TeacherPortal';
import { 
  StudentDashboard, StudentRoutine, StudentHomework, StudentOnlineExam, 
  StudentFees, StudentResults, StudentSyllabus, StudentMaterials, 
  StudentLibrary, StudentProfile, StudentIdCardPage, StudentLeavePage 
} from './pages/StudentPortal';
import { 
  ParentDashboard, ParentTransport, ParentClassDiary, ParentHomework, 
  ParentLeave, ParentFees, ParentResults, ParentAttendance, 
  ParentChildProfile, ParentChat, ParentChildIdCard 
} from './pages/ParentPortal';
import { PublicSchoolWebsite, InstitutionLogin, InstitutionsDirectoryPage } from './pages/PublicSchool';
import { SonarBanglaSchoolWebsite, SchoolPageTab } from './components/SonarBanglaSchoolWebsite';
import { AlAminMadrasaWebsite, MadrasaPageTab } from './components/AlAminMadrasaWebsite';
import { CollegeWebsite, CollegePageTab } from './components/CollegeWebsite';
import { UniversityWebsite, UniversityPageTab } from './components/UniversityWebsite';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TenantProvider } from './context/TenantContext';
import { LanguageProvider } from './context/LanguageContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './components/UIComponents';
import { processDueScheduledBackups } from './utils/tenantBackupExport';

const SonarBanglaRouteWrapper = () => {
  const { tab } = useParams<{ tab?: string }>();
  return <SonarBanglaSchoolWebsite initialTab={(tab as SchoolPageTab) || 'home'} showSwitcher={false} />;
};

const AlAminRouteWrapper = () => {
  const { tab } = useParams<{ tab?: string }>();
  return <AlAminMadrasaWebsite initialTab={(tab as MadrasaPageTab) || 'home'} showSwitcher={false} />;
};

const CollegeRouteWrapper = () => {
  const { tab } = useParams<{ tab?: string }>();
  return <CollegeWebsite initialTab={(tab as CollegePageTab) || 'home'} showSwitcher={false} />;
};

const UniversityRouteWrapper = () => {
  const { tab } = useParams<{ tab?: string }>();
  return <UniversityWebsite initialTab={(tab as UniversityPageTab) || 'home'} showSwitcher={false} />;
};

// Placeholder for newly requested routes that don't have full pages yet
const PlaceholderPage = ({ name }: { name: string }) => (
    <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800">{name}</h2>
        <p className="text-slate-500 mt-2">This module is part of the standard deployment package for Amar Smart School.</p>
    </div>
);

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/saas-home" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/proposal" element={<Proposal />} />
        <Route path="/verify" element={<StudentVerificationPortal />} />
        <Route path="/verify/student/:id" element={<StudentVerificationPortal />} />

        {/* --- INSTITUTION WEBSITES & DEDICATED LOGINS --- */}
        <Route path="/institutions" element={<InstitutionsDirectoryPage />} />
        
        {/* School Isolated Website Routes */}
        <Route path="/sonar-bangla" element={<SonarBanglaSchoolWebsite initialTab="home" showSwitcher={false} />} />
        <Route path="/sonar-bangla/:tab" element={<SonarBanglaRouteWrapper />} />
        <Route path="/school-website" element={<SonarBanglaSchoolWebsite initialTab="home" showSwitcher={false} />} />
        <Route path="/school-website/:tab" element={<SonarBanglaRouteWrapper />} />
        
        {/* Madrasa Isolated Website Routes */}
        <Route path="/madrasa" element={<AlAminMadrasaWebsite initialTab="home" showSwitcher={false} />} />
        <Route path="/madrasa/:tab" element={<AlAminRouteWrapper />} />
        <Route path="/al-amin" element={<AlAminMadrasaWebsite initialTab="home" showSwitcher={false} />} />
        <Route path="/al-amin/:tab" element={<AlAminRouteWrapper />} />
        <Route path="/madrasa-website" element={<AlAminMadrasaWebsite initialTab="home" showSwitcher={false} />} />
        <Route path="/madrasa-website/:tab" element={<AlAminRouteWrapper />} />

        {/* College Isolated Website Routes */}
        <Route path="/college" element={<CollegeWebsite initialTab="home" showSwitcher={false} />} />
        <Route path="/college/:tab" element={<CollegeRouteWrapper />} />
        <Route path="/dcc" element={<CollegeWebsite initialTab="home" showSwitcher={false} />} />
        <Route path="/dcc/:tab" element={<CollegeRouteWrapper />} />

        {/* University Isolated Website Routes */}
        <Route path="/university" element={<UniversityWebsite initialTab="home" showSwitcher={false} />} />
        <Route path="/university/:tab" element={<UniversityRouteWrapper />} />
        <Route path="/diu" element={<UniversityWebsite initialTab="home" showSwitcher={false} />} />
        <Route path="/diu/:tab" element={<UniversityRouteWrapper />} />

        {/* Subdomain-driven Isolated Routes */}
        <Route path="/institution/:subdomain" element={<PublicSchoolWebsite />} />
        <Route path="/institution/:subdomain/:tab" element={<PublicSchoolWebsite />} />
        <Route path="/institution/:subdomain/login" element={<InstitutionLogin />} />
        <Route path="/schools/:subdomain" element={<PublicSchoolWebsite />} />
        <Route path="/schools/:subdomain/:tab" element={<PublicSchoolWebsite />} />
        <Route path="/schools/:subdomain/login" element={<InstitutionLogin />} />
        <Route path="/school-site/:subdomain" element={<PublicSchoolWebsite />} />
        <Route path="/school-site/:subdomain/login" element={<InstitutionLogin />} />

        {/* --- SUPER ADMIN ROUTES --- */}
        <Route path="/super-admin" element={<RequireAuth><SuperAdminDashboard /></RequireAuth>} />
        <Route path="/super-admin/tenants" element={<RequireAuth><TenantManagement /></RequireAuth>} />
        <Route path="/super-admin/domains" element={<RequireAuth><DomainManager /></RequireAuth>} />
        <Route path="/super-admin/modules" element={<RequireAuth><ModuleManagement /></RequireAuth>} />
        <Route path="/super-admin/subscriptions" element={<RequireAuth><SubscriptionManagement /></RequireAuth>} />
        <Route path="/super-admin/support" element={<RequireAuth><SupportHelpdesk /></RequireAuth>} />
        <Route path="/super-admin/reports" element={<RequireAuth><GlobalReports /></RequireAuth>} />
        <Route path="/super-admin/logs" element={<RequireAuth><ActivityLogs /></RequireAuth>} />
        <Route path="/super-admin/backup" element={<RequireAuth><DataBackupExport /></RequireAuth>} />
        <Route path="/super-admin/scheduled-backups" element={<RequireAuth><ScheduledBackups /></RequireAuth>} />
        <Route path="/super-admin/cloud-storage" element={<RequireAuth><ExternalStorageSync /></RequireAuth>} />
        <Route path="/super-admin/blueprint" element={<RequireAuth><BlueprintDocs /></RequireAuth>} />
        <Route path="/super-admin/prompt-gen" element={<RequireAuth><GoogleStudioPrompt /></RequireAuth>} />
        <Route path="/super-admin/settings" element={<RequireAuth><SuperAdminSettings /></RequireAuth>} />

        {/* --- SCHOOL ADMIN ROUTES --- */}
        <Route path="/school" element={<RequireAuth><SchoolDashboard /></RequireAuth>} />
        <Route path="/school/leave-approval" element={<RequireAuth><SchoolAdminLeaveApproval /></RequireAuth>} />
        <Route path="/school/leave-policies" element={<RequireAuth><SchoolAdminLeaveApproval defaultTab="policies" /></RequireAuth>} />
        <Route path="/school/teacher-panel/leave-approval" element={<RequireAuth><SchoolAdminLeaveApproval /></RequireAuth>} />
        <Route path="/school/teacher-panel/leave-policies" element={<RequireAuth><SchoolAdminLeaveApproval defaultTab="policies" /></RequireAuth>} />
        <Route path="/school/teacher/leaves" element={<RequireAuth><SchoolAdminLeaveApproval /></RequireAuth>} />
        <Route path="/school/documents" element={<RequireAuth><SchoolAdminDocuments /></RequireAuth>} />
        <Route path="/school/documents/upload" element={<RequireAuth><SchoolAdminDocuments /></RequireAuth>} />
        <Route path="/school/communication" element={<RequireAuth><CommunicationCenter /></RequireAuth>} />
        <Route path="/school/academic-calendar" element={<RequireAuth><AcademicCalendar /></RequireAuth>} />
        <Route path="/school/library" element={<RequireAuth><LibraryManagement /></RequireAuth>} />
        <Route path="/school/events" element={<RequireAuth><AcademicCalendar /></RequireAuth>} />
        <Route path="/school/results" element={<RequireAuth><ResultSheet /></RequireAuth>} />
        <Route path="/school/activity" element={<RequireAuth><PlaceholderPage name="Activity Logs"/></RequireAuth>} />
        <Route path="/school/accounts" element={<RequireAuth><FeesManagement /></RequireAuth>} />
        <Route path="/school/attendance/holiday" element={<RequireAuth><AcademicCalendar /></RequireAuth>} />
        <Route path="/school/attendance/individual" element={<RequireAuth><IndividualStudentProgressPage /></RequireAuth>} />
        <Route path="/school/students/progress" element={<RequireAuth><IndividualStudentProgressPage /></RequireAuth>} />
        <Route path="/school/settings" element={<RequireAuth><SchoolSettings /></RequireAuth>} />
        <Route path="/school/settings/theme" element={<RequireAuth><SchoolSettings /></RequireAuth>} />
        <Route path="/school/settings/general" element={<RequireAuth><SchoolSettings /></RequireAuth>} />
        <Route path="/school/settings/correction" element={<RequireAuth><SchoolSettings /></RequireAuth>} />
        <Route path="/school/institution/profile" element={<RequireAuth><SchoolSettings /></RequireAuth>} />
        <Route path="/school/backup/database" element={<RequireAuth><SchoolBackupExport /></RequireAuth>} />
        <Route path="/school/backup/assets" element={<RequireAuth><SchoolBackupExport /></RequireAuth>} />
        
        {/* Student Sub-routes */}
        <Route path="/school/students/admission" element={<RequireAuth><StudentAdmission /></RequireAuth>} />
        <Route path="/school/students/bulk-upload" element={<RequireAuth><StudentBulkUploadPage /></RequireAuth>} />
        <Route path="/school/students/id-card" element={<RequireAuth><IDCardGenerator /></RequireAuth>} />
        <Route path="/school/card-info/student-id" element={<RequireAuth><IDCardGenerator /></RequireAuth>} />
        <Route path="/school/id-card" element={<RequireAuth><IDCardGenerator /></RequireAuth>} />
        <Route path="/school/students/admission-request" element={<RequireAuth><AdmissionRequests /></RequireAuth>} />
        <Route path="/school/students/primary-request" element={<RequireAuth><AdministratorPrimaryRequest /></RequireAuth>} />
        <Route path="/school/students/list" element={<RequireAuth><StudentList /></RequireAuth>} />
        <Route path="/school/students/image-update" element={<RequireAuth><StudentImageUpdate /></RequireAuth>} />
        <Route path="/school/students/data-update" element={<RequireAuth><StudentDataBulkUpdate /></RequireAuth>} />
        <Route path="/school/students/selectable-update" element={<RequireAuth><StudentSelectableUpdate /></RequireAuth>} />
        <Route path="/school/students/add-credentials" element={<RequireAuth><StudentAddCredentials /></RequireAuth>} />
        <Route path="/school/students/credentials-status" element={<RequireAuth><StudentCredentialsStatus /></RequireAuth>} />
        <Route path="/school/students/sms-credentials" element={<RequireAuth><StudentSendSmsCredentials /></RequireAuth>} />
        <Route path="/school/students/teacher-assign" element={<RequireAuth><StudentTeacherAssign /></RequireAuth>} />
        <Route path="/school/students/teacher-assign-print" element={<RequireAuth><StudentTeacherAssignPrint /></RequireAuth>} />

        {/* Seat Plan Sub-routes */}
        <Route path="/school/seat-plan/1" element={<RequireAuth><StudentSeatPlan1 /></RequireAuth>} />
        <Route path="/school/seat-plan/2" element={<RequireAuth><StudentSeatPlan2 /></RequireAuth>} />
        <Route path="/school/seat-plan/small" element={<RequireAuth><SmallSeatPlan /></RequireAuth>} />

        {/* --- TEACHER ROUTES --- */}
        <Route path="/teacher" element={<Navigate to="/teacher/dashboard" replace />} />
        <Route path="/teacher/dashboard" element={<RequireAuth><TeacherDashboard /></RequireAuth>} />
        <Route path="/teacher/performance" element={<RequireAuth><TeacherPerformance /></RequireAuth>} />
        <Route path="/teacher/routine" element={<RequireAuth><TeacherRoutine /></RequireAuth>} />
        <Route path="/teacher/attendance" element={<RequireAuth><TeacherAttendance /></RequireAuth>} />
        <Route path="/teacher/students" element={<RequireAuth><TeacherStudents /></RequireAuth>} />
        <Route path="/teacher/marks" element={<RequireAuth><TeacherMarks /></RequireAuth>} />
        <Route path="/teacher/homework" element={<RequireAuth><TeacherHomework /></RequireAuth>} />
        <Route path="/teacher/materials" element={<RequireAuth><TeacherMaterials /></RequireAuth>} />
        <Route path="/teacher/lesson-plan" element={<RequireAuth><TeacherLessonPlan /></RequireAuth>} />
        <Route path="/teacher/live-class" element={<RequireAuth><TeacherLiveClass /></RequireAuth>} />
        <Route path="/teacher/leave" element={<RequireAuth><TeacherLeave /></RequireAuth>} />
        <Route path="/teacher/profile" element={<RequireAuth><TeacherProfile /></RequireAuth>} />

        {/* --- STUDENT ROUTES --- */}
        <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
        <Route path="/student/dashboard" element={<RequireAuth><StudentDashboard /></RequireAuth>} />
        <Route path="/student/routine" element={<RequireAuth><StudentRoutine /></RequireAuth>} />
        <Route path="/student/homework" element={<RequireAuth><StudentHomework /></RequireAuth>} />
        <Route path="/student/online-exam" element={<RequireAuth><StudentOnlineExam /></RequireAuth>} />
        <Route path="/student/fees" element={<RequireAuth><StudentFees /></RequireAuth>} />
        <Route path="/student/results" element={<RequireAuth><StudentResults /></RequireAuth>} />
        <Route path="/student/leave" element={<RequireAuth><StudentLeavePage /></RequireAuth>} />
        <Route path="/student/id-card" element={<RequireAuth><StudentIdCardPage /></RequireAuth>} />
        <Route path="/student/syllabus" element={<RequireAuth><StudentSyllabus /></RequireAuth>} />
        <Route path="/student/materials" element={<RequireAuth><StudentMaterials /></RequireAuth>} />
        <Route path="/student/library" element={<RequireAuth><StudentLibrary /></RequireAuth>} />
        <Route path="/student/profile" element={<RequireAuth><StudentProfile /></RequireAuth>} />

        {/* --- PARENT ROUTES --- */}
        <Route path="/parent" element={<Navigate to="/parent/dashboard" replace />} />
        <Route path="/parent/dashboard" element={<RequireAuth><ParentDashboard /></RequireAuth>} />
        <Route path="/parent/class-diary" element={<RequireAuth><ParentClassDiary /></RequireAuth>} />
        <Route path="/parent/homework" element={<RequireAuth><ParentHomework /></RequireAuth>} />
        <Route path="/parent/attendance" element={<RequireAuth><ParentAttendance /></RequireAuth>} />
        <Route path="/parent/fees" element={<RequireAuth><ParentFees /></RequireAuth>} />
        <Route path="/parent/results" element={<RequireAuth><ParentResults /></RequireAuth>} />
        <Route path="/parent/leave" element={<RequireAuth><ParentLeave /></RequireAuth>} />
        <Route path="/parent/id-card" element={<RequireAuth><ParentChildIdCard /></RequireAuth>} />
        <Route path="/parent/transport" element={<RequireAuth><ParentTransport /></RequireAuth>} />
        <Route path="/parent/chat" element={<RequireAuth><ParentChat /></RequireAuth>} />
        <Route path="/parent/profile" element={<RequireAuth><ParentChildProfile /></RequireAuth>} />

        {/* Catch-all for non-existent routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Main App component wrapping the application with necessary providers and router
const App = () => {
  useEffect(() => {
    // Check immediately on mount and every 30s for any due Daily/Weekly/Monthly scheduled backups
    processDueScheduledBackups();
    const interval = window.setInterval(() => {
      processDueScheduledBackups();
    }, 30000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <AuthProvider>
      <TenantProvider>
        <LanguageProvider>
          <NotificationProvider>
            <ToastProvider>
              <Router>
                <AppRoutes />
              </Router>
            </ToastProvider>
          </NotificationProvider>
        </LanguageProvider>
      </TenantProvider>
    </AuthProvider>
  );
};

export default App;