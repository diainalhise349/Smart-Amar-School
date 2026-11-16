
import React, { useState, useEffect } from 'react';
import { CreditCard, Award, Calendar, BookOpen, Clock, Download, CheckCircle, AlertCircle, User, Phone, MapPin, Loader2, Search, ArrowRight, Book, FileText, Upload, Archive, PlayCircle, HelpCircle, ChevronDown, ChevronUp, List, Printer, Flag, Timer, CheckSquare, RefreshCw, BookOpenCheck, Edit, ShieldCheck, ExternalLink, CalendarRange } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardLayout } from '../components/Layout';
import { Card, Button, Badge, Modal, Input, ImageUpload, useToast } from '../components/UIComponents';
import { UserRole } from '../types';
import { MOCK_INVOICES, MOCK_RESULTS, MOCK_ROUTINES, MOCK_BOOKS, MOCK_STUDENTS } from '../constants';
import { MockPaymentGateway, PaymentTransaction, PaymentInvoiceInfo } from '../components/MockPaymentGateway';
import { getStoredStudents } from '../utils/studentStorage';
import { StudentIDCard } from '../components/StudentIDCard';
import { getStudentVerificationUrl } from '../utils/studentVerification';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { DashboardNotificationWidget } from '../components/DashboardNotificationWidget';
import { useNotifications } from '../context/NotificationContext';
import { OfficialFeeReceiptModal } from '../components/OfficialFeeReceiptModal';
import { downloadFeeReceiptPDF } from '../utils/feeReceiptResolver';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const { t, formatNumber } = useLanguage();
  const { getNotificationsForRole } = useNotifications();
  const students = getStoredStudents();
  const student = user?.studentData || students.find(s => s.id === user?.studentId) || students[0] || MOCK_STUDENTS[0];
  
  const studentNotifs = getNotificationsForRole(UserRole.STUDENT, student.class);
  const pendingHwCount = studentNotifs.filter(n => n.type === 'homework').length || 3;

  return (
    <DashboardLayout role={UserRole.STUDENT}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">{t('welcome', 'Welcome')}, {student.name}</h2>
        <p className="text-slate-500">{student.class} - {t('section_col', 'Section')} {student.section} | {t('roll_no', 'Roll')}: {formatNumber(student.rollNo)}</p>
      </div>

      {/* Centralized Academic & School Notification Hub */}
      <DashboardNotificationWidget 
        role={UserRole.STUDENT} 
        childClass={student.class} 
        className="mb-8" 
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-indigo-600 text-white p-4">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg"><BookOpen size={24}/></div>
              <div>
                 <p className="text-indigo-100 text-xs">{t('homework_pending', 'Homework Pending')}</p>
                 <h3 className="text-2xl font-bold">{formatNumber(3)}</h3>
              </div>
           </div>
        </Card>
        <Card className="bg-green-600 text-white p-4">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg"><Award size={24}/></div>
              <div>
                 <p className="text-green-100 text-xs">{t('latest_gpa', 'Latest GPA')}</p>
                 <h3 className="text-2xl font-bold">{formatNumber('5.00')}</h3>
              </div>
           </div>
        </Card>
        <Card className="bg-orange-500 text-white p-4">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg"><Clock size={24}/></div>
              <div>
                 <p className="text-orange-100 text-xs">{t('attendance_rate', 'Attendance')}</p>
                 <h3 className="text-2xl font-bold">{formatNumber(92)}%</h3>
              </div>
           </div>
        </Card>
        <Card className="bg-slate-800 text-white p-4">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg"><CreditCard size={24}/></div>
              <div>
                 <p className="text-slate-300 text-xs">{t('fees_due', 'Fees Due')}</p>
                 <h3 className="text-2xl font-bold">৳{formatNumber(student.feesDue)}</h3>
              </div>
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
              <Card title={t('todays_classes', "Today's Classes")}>
                  <div className="flex gap-4 overflow-x-auto pb-2">
                      {['Math', 'English', 'Physics', 'Biology'].map((subj, i) => (
                          <div key={i} className="min-w-[140px] p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col items-center text-center">
                              <span className="text-xs font-bold text-slate-400 mb-1">{formatNumber('09:00')} - {formatNumber('09:45')}</span>
                              <h4 className="font-bold text-slate-800">{subj}</h4>
                              <span className="text-xs text-indigo-600 mt-2 bg-indigo-50 px-2 py-1 rounded">Room 201</span>
                          </div>
                      ))}
                  </div>
              </Card>
              <Card title={t('performance_analytics', 'Performance Analytics')}>
                  <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[{name: 'Math', score: 85}, {name: 'Eng', score: 72}, {name: 'Phy', score: 90}, {name: 'Bio', score: 78}]}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </Card>
          </div>
          <div className="space-y-6">
              <Card title={t('notice_board', 'Notice Board')}>
                  <div className="space-y-4">
                      <div className="flex gap-3">
                          <div className="w-1 bg-yellow-400 rounded-full"></div>
                          <div>
                              <p className="text-sm font-bold text-slate-800">Summer Vacation</p>
                              <p className="text-xs text-slate-500">Starts from 20th May. School will remain closed.</p>
                          </div>
                      </div>
                      <div className="flex gap-3">
                          <div className="w-1 bg-blue-400 rounded-full"></div>
                          <div>
                              <p className="text-sm font-bold text-slate-800">Exam Routine Published</p>
                              <p className="text-xs text-slate-500">Check the exams section for details.</p>
                          </div>
                      </div>
                  </div>
              </Card>
              <div className="bg-indigo-900 rounded-xl p-6 text-white text-center">
                  <h3 className="font-bold text-lg mb-2">{t('upcoming_exam', 'Upcoming Exam')}</h3>
                  <p className="text-indigo-200 mb-4">Physics Quiz</p>
                  <Button className="w-full bg-white text-indigo-900 hover:bg-indigo-50">{t('view_syllabus', 'View Syllabus')}</Button>
              </div>
          </div>
      </div>
    </DashboardLayout>
  );
};

export const StudentRoutine = () => {
    return (
        <DashboardLayout role={UserRole.STUDENT}>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Class Routine</h2>
                <Button variant="secondary" icon={Download}>Download PDF</Button>
            </div>
            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Day</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Period</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Teacher</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Room</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {MOCK_ROUTINES.filter(r => r.classId === 'CLS-10-A').map((routine) => (
                                <tr key={routine.id}>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-800">{routine.day}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{routine.period}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-indigo-600">{routine.subjectName}</td>
                                    <td className="px-6 py-4 text-sm text-slate-800">{routine.teacherName}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{routine.roomNo}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </DashboardLayout>
    );
};

export const StudentHomework = () => {
    const { addToast } = useToast();
    const { notifications } = useNotifications();
    const { user } = useAuth();
    const userClass = user?.studentClass || user?.studentData?.class || 'Class 10';

    const liveHwNotifs = notifications.filter(n => n.type === 'homework');

    const defaultAssignments = [
        { id: 1, title: 'Algebra Practice Set 1', subject: 'Mathematics', teacher: 'Abdul Jabbar', dueDate: '2024-05-25', status: 'Pending' },
        { id: 2, title: 'Hamlet Essay', subject: 'English', teacher: 'Salma Khatun', dueDate: '2024-05-22', status: 'Submitted' },
    ];

    // Combine any newly assigned homework from live notifications
    const dynamicAssignments = liveHwNotifs.map((n, idx) => ({
        id: `live-hw-${n.id || idx}`,
        title: n.title,
        subject: n.subject || 'General',
        teacher: n.authorName || 'Class Teacher',
        dueDate: n.metadata?.dueDate || 'Upcoming',
        status: 'Pending'
    }));

    const assignments = [
        ...dynamicAssignments.filter(d => !defaultAssignments.some(a => a.title.toLowerCase() === d.title.toLowerCase())),
        ...defaultAssignments
    ];

    return (
        <DashboardLayout role={UserRole.STUDENT}>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">My Homework</h2>
                <p className="text-slate-500">Track and submit your assignments.</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {assignments.map(assign => (
                    <Card key={assign.id} className="hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-lg ${assign.status === 'Pending' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                    <BookOpenCheck size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">{assign.title}</h4>
                                    <p className="text-sm text-slate-500">{assign.subject} • {assign.teacher}</p>
                                    <p className="text-xs text-slate-400 mt-1">Due: {assign.dueDate}</p>
                                </div>
                            </div>
                            <div>
                                {assign.status === 'Pending' ? (
                                    <Button size="sm" icon={Upload} onClick={() => addToast('File uploaded successfully', 'success')}>Submit</Button>
                                ) : (
                                    <Badge color="green">Submitted</Badge>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </DashboardLayout>
    );
};

export const StudentOnlineExam = () => {
    const { addToast } = useToast();
    const [activeExam, setActiveExam] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState(0); // in seconds
    const [answers, setAnswers] = useState<Record<number, string>>({});

    const exams = [
        { id: 1, title: 'Physics Quiz: Motion', subject: 'Physics', date: 'Today', duration: 15, totalMarks: 20, status: 'Active' },
        { id: 2, title: 'Math: Algebra Basics', subject: 'Mathematics', date: 'Tomorrow', duration: 30, totalMarks: 50, status: 'Upcoming' },
        { id: 3, title: 'English Grammar', subject: 'English', date: '2024-05-18', duration: 20, totalMarks: 20, status: 'Completed' },
    ];

    // Mock Questions for Exam 1
    const questions = [
        { id: 1, text: "Which of the following is a vector quantity?", options: ["Speed", "Distance", "Velocity", "Mass"] },
        { id: 2, text: "The SI unit of force is:", options: ["Pascal", "Newton", "Joule", "Watt"] },
        { id: 3, text: "What is the value of g on Earth?", options: ["9.8 m/s²", "10.5 m/s²", "8.9 m/s²", "9.1 m/s²"] },
    ];

    const startExam = (exam: any) => {
        setActiveExam(exam);
        setTimeLeft(exam.duration * 60);
        setAnswers({});
    };

    const submitExam = () => {
        setActiveExam(null);
        addToast('Exam submitted successfully! Results will be published soon.', 'success');
    };

    // Timer Logic
    useEffect(() => {
        if (activeExam && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && activeExam) {
            submitExam(); // Auto submit
        }
    }, [activeExam, timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (activeExam) {
        return (
            <DashboardLayout role={UserRole.STUDENT}>
                <div className="max-w-3xl mx-auto">
                    <div className="sticky top-20 z-10 bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex justify-between items-center">
                        <div>
                            <h2 className="font-bold text-slate-800">{activeExam.title}</h2>
                            <p className="text-xs text-slate-500">Subject: {activeExam.subject}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold ${timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                <Timer size={20}/> {formatTime(timeLeft)}
                            </div>
                            <Button variant="danger" onClick={submitExam}>Submit Exam</Button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {questions.map((q, idx) => (
                            <Card key={q.id}>
                                <div className="flex gap-4">
                                    <span className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">{idx + 1}</span>
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-900 mb-4">{q.text}</p>
                                        <div className="space-y-2">
                                            {q.options.map((opt, i) => (
                                                <label key={i} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${answers[q.id] === opt ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                                                    <input 
                                                        type="radio" 
                                                        name={`q-${q.id}`} 
                                                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                                        checked={answers[q.id] === opt}
                                                        onChange={() => setAnswers(prev => ({...prev, [q.id]: opt}))}
                                                    />
                                                    <span className="ml-3 text-sm text-slate-700">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role={UserRole.STUDENT}>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Online Exams</h2>
                <p className="text-slate-500">Upcoming and past examinations.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {exams.map(exam => (
                    <Card key={exam.id}>
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                                    <PlayCircle size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">{exam.title}</h4>
                                    <p className="text-sm text-slate-500">{exam.subject} • {exam.duration} Mins • {exam.totalMarks} Marks</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Calendar size={12} className="text-slate-400"/>
                                        <span className="text-xs text-slate-500">{exam.date}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                {exam.status === 'Active' ? (
                                    <Button onClick={() => startExam(exam)}>Start Exam</Button>
                                ) : exam.status === 'Completed' ? (
                                    <Badge color="green">Completed</Badge>
                                ) : (
                                    <Button variant="secondary" disabled>Starts Soon</Button>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </DashboardLayout>
    );
};

export const StudentFees = () => {
    const { user, activeTenant } = useAuth();
    const { showToast } = useToast();
    const students = getStoredStudents();
    const student = user?.studentData || students.find(s => s.id === user?.studentId) || students[0] || MOCK_STUDENTS[0];
    const [invoices, setInvoices] = useState(() => {
        const studentInvoices = MOCK_INVOICES.filter(i => i.studentName === student.name);
        if (studentInvoices.length > 0) return studentInvoices;
        return [
            { id: `INV-${student.id.replace(/[^a-zA-Z0-9]/g, '')}-01`, studentName: student.name, amount: student.feesDue > 0 ? student.feesDue : 1500, dueDate: '2024-06-10', status: student.feesDue > 0 ? 'Unpaid' as const : 'Paid' as const, type: 'Tuition' as const },
            { id: `INV-${student.id.replace(/[^a-zA-Z0-9]/g, '')}-02`, studentName: student.name, amount: 800, dueDate: '2024-05-15', status: 'Paid' as const, type: 'Exam' as const }
        ];
    });
    const [selectedInvoice, setSelectedInvoice] = useState<PaymentInvoiceInfo | null>(null);
    const [isGatewayOpen, setIsGatewayOpen] = useState(false);
    const [receiptInvoice, setReceiptInvoice] = useState<any>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const handleDownloadPDF = async (inv: any) => {
        try {
            setDownloadingId(inv.id);
            await downloadFeeReceiptPDF({
                ...inv,
                studentId: student.id,
                studentName: student.name,
                studentClass: student.class,
                studentSection: student.section,
                studentRoll: student.rollNo,
                guardianPhone: student.phone
            }, activeTenant);
            showToast(`Official PDF receipt for ${student.name} downloaded!`, 'success');
        } catch (e) {
            showToast('Failed to download PDF receipt', 'error');
        } finally {
            setDownloadingId(null);
        }
    };

    const handlePay = (inv: any) => {
        setSelectedInvoice({
            id: inv.id,
            studentName: student.name,
            studentClass: student.class,
            studentRoll: student.rollNo,
            guardianPhone: student.phone || '01712345678',
            amount: inv.amount,
            feeType: inv.type || 'Monthly Tuition Fee',
            dueDate: inv.dueDate,
            month: 'May'
        });
        setIsGatewayOpen(true);
    };

    const handlePaymentSuccess = (txn: PaymentTransaction) => {
        setInvoices(prev => prev.map(inv => {
            if (inv.id === txn.invoiceId) {
                return { ...inv, status: 'Paid' as any, paidDate: txn.paidAt, trxId: txn.trxId };
            }
            return inv;
        }));
    };

    return (
        <DashboardLayout role={UserRole.STUDENT}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">My Fees & Dues</h2>
                    <p className="text-slate-500">Pay tuition, exam fees, and view official clearance receipts.</p>
                </div>
            </div>
            <Card>
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Invoice #</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Due Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {invoices.map(inv => (
                            <tr key={inv.id}>
                                <td className="px-6 py-4 text-sm font-bold text-indigo-600 font-mono">{inv.id}</td>
                                <td className="px-6 py-4 text-sm font-medium text-slate-900">{inv.type} Fee</td>
                                <td className="px-6 py-4 text-sm text-slate-500">{inv.dueDate}</td>
                                <td className="px-6 py-4 text-sm font-bold text-slate-800">৳{inv.amount.toLocaleString()}</td>
                                <td className="px-6 py-4"><Badge color={inv.status === 'Paid' ? 'green' : 'red'}>{inv.status}</Badge></td>
                                <td className="px-6 py-4 text-right">
                                    {inv.status === 'Unpaid' || inv.status === 'Overdue' ? (
                                        <Button 
                                            size="sm" 
                                            className="h-8 text-xs bg-pink-600 hover:bg-pink-700 text-white font-bold" 
                                            onClick={() => handlePay(inv)}
                                        >
                                            Pay Now
                                        </Button>
                                    ) : (
                                        <div className="flex justify-end gap-1.5">
                                            <Button 
                                                size="sm" 
                                                variant="secondary" 
                                                className="h-8 text-xs" 
                                                onClick={() => setReceiptInvoice({
                                                    ...inv,
                                                    studentId: student.id,
                                                    studentName: student.name,
                                                    studentClass: student.class,
                                                    studentSection: student.section,
                                                    studentRoll: student.rollNo,
                                                    guardianPhone: student.phone
                                                })}
                                            >
                                                Receipt
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                className="h-8 text-xs bg-indigo-700 hover:bg-indigo-800 text-white font-bold" 
                                                icon={downloadingId === inv.id ? Loader2 : Download}
                                                disabled={downloadingId === inv.id}
                                                onClick={() => handleDownloadPDF(inv)}
                                                title="Download School-Branded Fee Receipt PDF"
                                            >
                                                PDF
                                            </Button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            {/* Reusable Mock Payment Gateway */}
            <MockPaymentGateway
                isOpen={isGatewayOpen}
                onClose={() => setIsGatewayOpen(false)}
                invoice={selectedInvoice}
                onPaymentSuccess={handlePaymentSuccess}
            />

            {/* Official School-Branded Fee Receipt Modal */}
            <OfficialFeeReceiptModal
                isOpen={!!receiptInvoice}
                onClose={() => setReceiptInvoice(null)}
                invoice={receiptInvoice}
            />
        </DashboardLayout>
    );
};

export const StudentResults = () => {
    const { user } = useAuth();
    const students = getStoredStudents();
    const student = user?.studentData || students.find(s => s.id === user?.studentId) || students[0] || MOCK_STUDENTS[0];
    const results = MOCK_RESULTS.filter(r => r.studentName === student.name || r.studentName === 'Rahim Ahmed');

    return (
        <DashboardLayout role={UserRole.STUDENT}>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Exam Results</h2>
                <p className="text-slate-500">Academic performance history for {student.name} ({student.class} - {student.section}).</p>
            </div>
            
            <Card title="First Term Examination 2024" className="mb-6">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Subject</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Theory</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">MCQ</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Grade</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {results.map((res) => (
                            <tr key={res.id}>
                                <td className="px-6 py-4 text-sm font-medium text-slate-900">{res.subjectId}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{res.marks.theory || '-'}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{res.marks.mcq || '-'}</td>
                                <td className="px-6 py-4 text-sm font-bold text-indigo-600">{res.marks.total}</td>
                                <td className="px-6 py-4">
                                    <Badge color={res.grade.startsWith('A') ? 'green' : 'yellow'}>{res.grade}</Badge>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="p-4 border-t border-slate-100 flex justify-end">
                    <Button variant="secondary" icon={Printer} onClick={() => window.print()}>Print Transcript</Button>
                </div>
            </Card>
        </DashboardLayout>
    );
};

export const StudentSyllabus = () => {
    const subjects = [
        { name: 'Mathematics', topics: ['Algebra: Quadratic Equations', 'Geometry: Circles', 'Trigonometry Basics'] },
        { name: 'Physics', topics: ['Motion and Force', 'Work, Power, Energy', 'Properties of Matter'] },
        { name: 'English', topics: ['Tense and Voice', 'Paragraph Writing', 'Comprehension'] },
    ];

    return (
        <DashboardLayout role={UserRole.STUDENT}>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Class Syllabus</h2>
                <p className="text-slate-500">Topics to be covered this term.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((sub, idx) => (
                    <Card key={idx} title={sub.name}>
                        <ul className="space-y-2">
                            {sub.topics.map((topic, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                    <CheckCircle size={16} className="text-indigo-500 mt-0.5 shrink-0"/>
                                    {topic}
                                </li>
                            ))}
                        </ul>
                    </Card>
                ))}
            </div>
        </DashboardLayout>
    );
};

export const StudentMaterials = () => {
    return (
        <DashboardLayout role={UserRole.STUDENT}>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Study Materials</h2>
                <p className="text-slate-500">Download notes and slides shared by teachers.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: 'Calculus Notes.pdf', subject: 'Math', size: '2.4 MB' },
                    { title: 'Physics Formulas.jpg', subject: 'Physics', size: '1.2 MB' },
                    { title: 'Hamlet Summary.docx', subject: 'English', size: '0.8 MB' },
                ].map((file, i) => (
                    <Card key={i} className="flex items-center gap-4 hover:border-indigo-300 transition-colors cursor-pointer">
                        <div className="p-3 bg-slate-100 rounded-lg text-slate-500">
                            <FileText size={24}/>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-sm text-slate-800">{file.title}</h4>
                            <p className="text-xs text-slate-500">{file.subject} • {file.size}</p>
                        </div>
                        <Button size="sm" variant="ghost" icon={Download} />
                    </Card>
                ))}
            </div>
        </DashboardLayout>
    );
};

// --- Student Library (Updated) ---
export const StudentLibrary = () => {
    const { addToast } = useToast();
    const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState<any>(null);

    const handleReserve = (book: any) => {
        setSelectedBook(book);
        setIsReserveModalOpen(true);
    };

    return (
        <DashboardLayout role={UserRole.STUDENT}>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Library Catalog</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                    <input type="text" placeholder="Search books..." className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_BOOKS.map(book => (
                    <Card key={book.id} className="flex flex-col h-full">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                                <Book size={24}/>
                            </div>
                            <Badge color={book.status === 'Available' ? 'green' : 'red'}>{book.status}</Badge>
                        </div>
                        <h4 className="font-bold text-slate-800 mb-1">{book.title}</h4>
                        <p className="text-sm text-slate-500 mb-4">{book.author}</p>
                        <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-xs text-slate-400 font-mono">{book.isbn}</span>
                            <Button size="sm" variant="secondary" className="h-8 text-xs" disabled={book.status !== 'Available'} onClick={() => handleReserve(book)}>Reserve</Button>
                        </div>
                    </Card>
                ))}
            </div>

            <Modal isOpen={isReserveModalOpen} onClose={() => setIsReserveModalOpen(false)} title="Reserve Book">
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">You are requesting to reserve: <strong>{selectedBook?.title}</strong></p>
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-xs text-yellow-800">
                        Note: You must collect the book from the library within 24 hours of reservation approval.
                    </div>
                    <Input label="Expected Pickup Date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                    <div className="flex justify-end pt-2">
                        <Button onClick={() => { setIsReserveModalOpen(false); addToast('Book reservation requested', 'success'); }}>Confirm Reservation</Button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
};

// --- Student Profile (Updated) ---
export const StudentProfile = () => {
    const { user } = useAuth();
    const students = getStoredStudents();
    const student = user?.studentData || students.find(s => s.id === user?.studentId) || students[0] || MOCK_STUDENTS[0];
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const { addToast } = useToast();

    return (
        <DashboardLayout role={UserRole.STUDENT}>
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">My Profile</h2>
                <Button variant="secondary" icon={Edit} onClick={() => setIsEditModalOpen(true)}>Request Update</Button>
            </div>
            <Card className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-32 h-32 bg-slate-200 rounded-full mb-4 overflow-hidden border-4 border-white shadow-lg">
                            {student.imageUrl ? <img src={student.imageUrl} className="w-full h-full object-cover" alt={student.name}/> : <User size={64} className="text-slate-400 m-8"/>}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">{student.name}</h3>
                        <p className="text-slate-500">{student.class} | Roll: {student.rollNo}</p>
                        <Badge color={student.status === 'Active' ? 'green' : 'red'} className="mt-2">{student.status}</Badge>
                    </div>
                    
                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Student ID</label>
                            <p className="text-slate-800 font-medium font-mono">{student.id}</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Date of Birth</label>
                            <p className="text-slate-800 font-medium">{student.dob || '15 Aug 2008'}</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Guardian Name</label>
                            <p className="text-slate-800 font-medium">{student.guardian}</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Contact Number</label>
                            <p className="text-slate-800 font-medium font-mono">{student.phone || '01712-345678'}</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Blood Group</label>
                            <p className="text-rose-700 font-black">{student.bloodGroup || 'O+'}</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Address</label>
                            <p className="text-slate-800 font-medium">{student.address || '123, School Road, Dhaka'}</p>
                        </div>
                    </div>
                </div>
            </Card>

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Request Profile Update">
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsEditModalOpen(false); addToast('Update request sent to admin', 'success'); }}>
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs text-blue-800 mb-2">
                        Profile changes require admin approval.
                    </div>
                    <Input label="Phone Number" defaultValue={student.phone || '01712345678'} />
                    <Input label="Address" defaultValue={student.address || '123, School Road, Dhaka'} />
                    <div className="flex justify-end pt-2">
                        <Button type="submit">Submit Request</Button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
};

// --- Digital Student ID Card Page ---
export const StudentIdCardPage = () => {
  const { user } = useAuth();
  const students = getStoredStudents();
  const student = user?.studentData || students.find(s => s.id === user?.studentId) || students[0] || MOCK_STUDENTS[0];

  const handlePrint = () => {
    window.print();
  };

  const verificationUrl = getStudentVerificationUrl(student.id);

  return (
    <DashboardLayout role={UserRole.STUDENT}>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Digital Student ID Card</h2>
          <p className="text-xs text-slate-500 font-bold mt-0.5">
            Official institutional identification card with scannable cryptographic QR verification
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            icon={ExternalLink}
            onClick={() => window.open(verificationUrl, '_blank')}
            className="text-indigo-600 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 font-bold text-xs"
          >
            Verification Portal
          </Button>
          <Button 
            size="sm" 
            icon={Printer} 
            onClick={handlePrint}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
          >
            Print Card
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Card Display Area */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-100 to-slate-200/80 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center border border-slate-300 shadow-inner">
          <span className="text-[11px] font-mono font-bold text-indigo-700 uppercase tracking-widest mb-3">
            Click Card to Flip (Front / Back)
          </span>
          <StudentIDCard student={student} />
        </div>

        {/* Security & Verification Details */}
        <div className="lg:col-span-7 space-y-6">
          <Card title="Identification Credentials & Anti-Fraud Security">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Student Name</span>
                <span className="text-sm font-black text-slate-800">{student.name}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Student ID #</span>
                <span className="text-sm font-mono font-black text-indigo-600">{student.id}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Class & Section</span>
                <span className="text-sm font-bold text-slate-800">{student.class} ({student.section || 'A'})</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Class Roll Number</span>
                <span className="text-sm font-mono font-bold text-slate-800">{student.rollNo}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Registered Guardian</span>
                <span className="text-sm font-bold text-slate-800">{student.guardian}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Enrollment Status</span>
                <Badge color={student.status === 'Active' ? 'green' : 'red'}>{student.status}</Badge>
              </div>
            </div>

            <div className="mt-5 p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-3">
              <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={20} />
              <div className="text-xs text-emerald-950">
                <span className="font-bold block uppercase tracking-wide">Live Anti-Counterfeit Verification</span>
                <p className="text-emerald-800 mt-0.5 leading-relaxed">
                  Your physical and digital ID card contains an encrypted QR stamp. Anyone scanning the QR code with their mobile phone will be taken directly to the official verification portal showing your live enrollment status.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

// --- Student Leave Application Page ---
export const StudentLeavePage = () => {
  const { user } = useAuth();
  const students = getStoredStudents();
  const student = user?.studentData || students.find(s => s.id === user?.studentId) || students[0] || MOCK_STUDENTS[0];
  const { addToast } = useToast();

  const [leaves, setLeaves] = useState<any[]>([
    { id: 'LEV-001', type: 'Sick Leave', startDate: '2024-05-10', endDate: '2024-05-12', days: 3, reason: 'High fever and doctor advised rest', status: 'Approved', appliedOn: '2024-05-09' },
    { id: 'LEV-002', type: 'Emergency Leave', startDate: '2024-04-02', endDate: '2024-04-03', days: 2, reason: 'Family emergency / out of town', status: 'Approved', appliedOn: '2024-04-01' },
  ]);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Sick Leave',
    startDate: '',
    endDate: '',
    reason: '',
    emergencyContact: student.phone || ''
  });

  const handleSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate || !formData.reason) {
      addToast('Please fill out all required fields', 'error');
      return;
    }

    const newLeave = {
      id: `LEV-${Date.now().toString().slice(-4)}`,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      days: 2,
      reason: formData.reason,
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0]
    };

    setLeaves([newLeave, ...leaves]);
    setIsApplyModalOpen(false);
    setFormData({ type: 'Sick Leave', startDate: '', endDate: '', reason: '', emergencyContact: student.phone || '' });
    addToast('Leave petition submitted successfully to Class Teacher & Principal.', 'success');
  };

  return (
    <DashboardLayout role={UserRole.STUDENT}>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Student Leave Petitions</h2>
          <p className="text-xs text-slate-500 font-bold mt-0.5">Submit leave requests and track administrative approval status</p>
        </div>
        <Button 
          icon={CalendarRange} 
          onClick={() => setIsApplyModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
        >
          Apply for Leave
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="bg-indigo-50 border-indigo-200 p-4">
          <span className="text-[10px] font-black uppercase text-indigo-700">Total Leaves Taken</span>
          <h3 className="text-2xl font-black text-indigo-900 mt-1">5 Days</h3>
          <span className="text-[10px] text-indigo-600 font-medium">Session 2024-25</span>
        </Card>
        <Card className="bg-emerald-50 border-emerald-200 p-4">
          <span className="text-[10px] font-black uppercase text-emerald-700">Approved Petitions</span>
          <h3 className="text-2xl font-black text-emerald-900 mt-1">2 Requests</h3>
          <span className="text-[10px] text-emerald-600 font-medium">100% Cleared</span>
        </Card>
        <Card className="bg-amber-50 border-amber-200 p-4">
          <span className="text-[10px] font-black uppercase text-amber-700">Pending Review</span>
          <h3 className="text-2xl font-black text-amber-900 mt-1">{leaves.filter(l => l.status === 'Pending').length} Pending</h3>
          <span className="text-[10px] text-amber-600 font-medium">Awaiting Class Teacher</span>
        </Card>
      </div>

      <Card title="Leave Application History">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase">Leave Type</th>
                <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase">Duration</th>
                <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase">Reason</th>
                <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase">Applied Date</th>
                <th className="px-4 py-3 text-center font-bold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {leaves.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-800">{l.type}</td>
                  <td className="px-4 py-3 text-slate-600 font-mono">
                    {l.startDate} to {l.endDate} ({l.days} days)
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{l.reason}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono">{l.appliedOn}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge color={l.status === 'Approved' ? 'green' : l.status === 'Pending' ? 'yellow' : 'red'}>
                      {l.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Apply Modal */}
      <Modal isOpen={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} title="Submit Student Leave Petition">
        <form onSubmit={handleSubmitLeave} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Leave Category</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-bold"
            >
              <option value="Sick Leave">Sick Leave (Medical Illness)</option>
              <option value="Casual Leave">Casual Leave (Personal Work)</option>
              <option value="Emergency Leave">Emergency / Family Emergency</option>
              <option value="Religious Observance">Religious Observance</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">From Date</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">To Date</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Reason & Explanation</label>
            <textarea
              required
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="State the reason for absence clearly..."
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Guardian Emergency Contact</label>
            <input
              type="text"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              placeholder="Guardian mobile number"
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-mono font-bold"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsApplyModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
              Submit Petition
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
