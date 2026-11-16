
import React, { useState, useRef, useEffect } from 'react';
import { User, CreditCard, FileText, CheckSquare, MessageSquare, Phone, MapPin, Send, Paperclip, Smile, MoreVertical, Calendar, Clock, AlertCircle, Loader2, CheckCircle, Download, BookOpen, Coffee, Plus, CalendarCheck, Bus, Printer, Award, ExternalLink, Edit, Users, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '../components/Layout';
import { Card, Button, Badge, Modal, Input, useToast } from '../components/UIComponents';
import { UserRole } from '../types';
import { MOCK_STUDENTS, MOCK_INVOICES, MOCK_RESULTS, MOCK_CHATS, MOCK_MESSAGES, MOCK_ATTENDANCE, MOCK_LEAVES, MOCK_STAFF, MOCK_TRANSPORTS } from '../constants';
import { MockPaymentGateway, PaymentTransaction, PaymentInvoiceInfo } from '../components/MockPaymentGateway';
import { useAuth } from '../context/AuthContext';
import { getStoredStudents } from '../utils/studentStorage';
import { StudentIDCard } from '../components/StudentIDCard';
import { getStudentVerificationUrl } from '../utils/studentVerification';
import { useLanguage } from '../context/LanguageContext';
import { DashboardNotificationWidget } from '../components/DashboardNotificationWidget';
import { useNotifications } from '../context/NotificationContext';
import { OfficialFeeReceiptModal } from '../components/OfficialFeeReceiptModal';
import { downloadFeeReceiptPDF } from '../utils/feeReceiptResolver';

export const ParentDashboard = () => {
  const { user, switchActiveChild } = useAuth();
  const { t, formatNumber } = useLanguage();
  const students = getStoredStudents();
  const child = user?.studentData || students.find(s => s.id === user?.studentId) || students[0] || MOCK_STUDENTS[0];
  const allChildren = user?.allChildren && user.allChildren.length > 0 ? user.allChildren : [child];

  return (
    <DashboardLayout role={UserRole.PARENT}>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t('parent_portal_title', 'Parent Portal')}</h2>
          <p className="text-slate-500">
            {t('welcome', 'Welcome')}, <span className="font-semibold text-slate-700">{user?.name || user?.guardianName || child.guardian}</span> • {t('viewing_data_for', 'Viewing data for')} <span className="font-semibold text-indigo-600">{child.name}</span>
          </p>
        </div>

        {/* Child Switcher for Parents with multiple or linked children */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
          <Users size={16} className="text-indigo-600 ml-1" />
          <span className="text-xs font-bold text-slate-600 uppercase">{t('child_label', 'Child:')}</span>
          <select
            value={child.id}
            onChange={(e) => switchActiveChild(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {allChildren.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.class} - {t('roll_no', 'Roll')}: {formatNumber(c.rollNo)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Centralized Child Academic & School Alerts Hub */}
      <DashboardNotificationWidget
        role={UserRole.PARENT}
        childName={child.name}
        childClass={child.class}
        className="mb-8"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-indigo-500">
           <div className="flex items-center">
              <div className="p-3 bg-indigo-50 rounded-lg"><CheckSquare className="text-indigo-600 w-6 h-6" /></div>
              <div className="ml-4">
                 <p className="text-sm text-slate-500">{t('attendance_this_month', 'Attendance This Month')}</p>
                 <h3 className="text-2xl font-bold text-slate-800">{formatNumber(95)}%</h3>
              </div>
           </div>
        </Card>
        <Card className="border-l-4 border-red-500">
           <div className="flex items-center">
              <div className="p-3 bg-red-50 rounded-lg"><CreditCard className="text-red-600 w-6 h-6" /></div>
              <div className="ml-4">
                 <p className="text-sm text-slate-500">{t('fees_due', 'Fees Due')}</p>
                 <h3 className="text-2xl font-bold text-slate-800">৳{formatNumber(child.feesDue)}</h3>
              </div>
           </div>
        </Card>
        <Card className="border-l-4 border-green-500">
           <div className="flex items-center">
              <div className="p-3 bg-green-50 rounded-lg"><FileText className="text-green-600 w-6 h-6" /></div>
              <div className="ml-4">
                 <p className="text-sm text-slate-500">{t('last_result', 'Last Result')}</p>
                 <h3 className="text-2xl font-bold text-slate-800">GPA {formatNumber('5.0')}</h3>
              </div>
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title={t('recent_notices', 'Recent Notices')}>
             <div className="space-y-4">
                 <div className="p-3 border-l-4 border-yellow-400 bg-yellow-50 rounded-r-lg">
                     <h4 className="font-bold text-yellow-800">School Picnic</h4>
                     <p className="text-xs text-yellow-700 mt-1">Annual picnic scheduled for next Friday. Please submit consent form.</p>
                 </div>
                 <div className="p-3 border-l-4 border-blue-400 bg-blue-50 rounded-r-lg">
                     <h4 className="font-bold text-blue-800">Parents Meeting</h4>
                     <p className="text-xs text-blue-700 mt-1">Monthly parents teacher meeting on 25th May at 10 AM.</p>
                 </div>
             </div>
          </Card>
          
          <Card title={t('fee_status', 'Fee Status')}>
             {MOCK_INVOICES.filter(inv => inv.studentName === child.name).slice(0, 3).map(inv => (
                 <div key={inv.id} className="flex justify-between items-center p-3 border-b border-slate-100 last:border-0">
                     <div>
                         <p className="font-bold text-slate-800">{inv.type} Fee</p>
                         <p className="text-xs text-slate-500">Due: {inv.dueDate}</p>
                     </div>
                     <div className="text-right">
                         <p className="font-bold text-slate-800">${inv.amount}</p>
                         <Badge color={inv.status === 'Paid' ? 'green' : 'red'}>{inv.status}</Badge>
                     </div>
                 </div>
             ))}
          </Card>
      </div>
    </DashboardLayout>
  );
};

export const ParentTransport = () => {
    // Mock getting the route assigned to the child
    const route = MOCK_TRANSPORTS[0]; 
    
    return (
        <DashboardLayout role={UserRole.PARENT}>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Transport Tracking</h2>
                <p className="text-slate-500">Route: {route.routeName}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card className="h-96 relative overflow-hidden p-0">
                        {/* Mock Map */}
                        <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
                            <div className="text-slate-400 text-center">
                                <MapPin size={48} className="mx-auto mb-2 text-slate-400" />
                                <p className="font-medium">Live Map View</p>
                                <p className="text-xs">Google Maps Integration</p>
                            </div>
                            
                            {/* Simulated Route Path */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.5 }}>
                                <path d="M100,100 Q250,50 400,200 T700,300" fill="none" stroke="#6366f1" strokeWidth="4" strokeDasharray="10,5" />
                                <circle cx="400" cy="200" r="8" fill="#ef4444" className="animate-ping" />
                                <circle cx="400" cy="200" r="6" fill="#ef4444" />
                            </svg>
                        </div>
                        
                        <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-lg">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-bold text-slate-700">Live: On Route</span>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card title="Driver Information">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                                <User size={32} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">{route.driverName}</h3>
                                <p className="text-sm text-slate-500">Driver ID: DRV-01</p>
                                <div className="flex gap-2 mt-1">
                                    <Badge color="blue">{route.vehicleNumber}</Badge>
                                </div>
                            </div>
                        </div>
                        <Button className="w-full mb-2" icon={Phone}>Call Driver</Button>
                        <Button variant="secondary" className="w-full">Message Support</Button>
                    </Card>

                    <Card title="Timeline">
                        <div className="relative pl-4 border-l-2 border-slate-200 space-y-6">
                            <div className="relative">
                                <div className="absolute -left-[21px] top-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
                                <p className="text-xs text-slate-500">07:30 AM</p>
                                <p className="font-bold text-sm text-slate-800">School Campus</p>
                                <p className="text-xs text-slate-400">Bus Departed</p>
                            </div>
                            <div className="relative">
                                <div className="absolute -left-[21px] top-1 w-4 h-4 rounded-full bg-indigo-500 border-2 border-white"></div>
                                <p className="text-xs text-slate-500">07:45 AM</p>
                                <p className="font-bold text-sm text-slate-800">Mirpur Stop 1</p>
                                <p className="text-xs text-green-600 font-bold">Passed</p>
                            </div>
                            <div className="relative">
                                <div className="absolute -left-[21px] top-1 w-4 h-4 rounded-full bg-slate-300 border-2 border-white animate-pulse"></div>
                                <p className="text-xs text-slate-500">--:--</p>
                                <p className="font-bold text-sm text-slate-800">Dhanmondi Stop (Your Stop)</p>
                                <p className="text-xs text-indigo-600 font-bold">Arriving in 10 mins</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};

export const ParentClassDiary = () => {
    const plans = [
        { id: 1, date: '2024-05-20', subject: 'Mathematics', topic: 'Algebraic Formulas', work: 'Ex 3.1 Q1-5', status: 'Completed' },
        { id: 2, date: '2024-05-20', subject: 'English', topic: 'Poetry Recitation', work: 'Memorize "The Daffodils"', status: 'Completed' },
        { id: 3, date: '2024-05-21', subject: 'Mathematics', topic: 'Quadratic Equations', work: 'Read theory page 45', status: 'Planned' },
    ];

    return (
        <DashboardLayout role={UserRole.PARENT}>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Class Diary</h2>
                <p className="text-slate-500">See what was taught today and homework.</p>
            </div>

            <div className="space-y-6">
                {['2024-05-20', '2024-05-21'].map(date => (
                    <Card key={date} title={new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}>
                        <div className="space-y-4">
                            {plans.filter(p => p.date === date).map(plan => (
                                <div key={plan.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="mb-2 sm:mb-0">
                                        <h4 className="font-bold text-slate-800">{plan.subject}</h4>
                                        <p className="text-sm text-slate-600">Topic: {plan.topic}</p>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <div className="text-xs font-bold text-slate-500 uppercase mb-1">Classwork / Homework</div>
                                        <p className="text-sm font-medium text-indigo-700 bg-indigo-50 px-2 py-1 rounded inline-block">{plan.work}</p>
                                    </div>
                                </div>
                            ))}
                            {plans.filter(p => p.date === date).length === 0 && (
                                <p className="text-sm text-slate-500 italic">No diary entries for this date.</p>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </DashboardLayout>
    );
};

export const ParentHomework = () => {
    const { notifications } = useNotifications();
    const liveHw = notifications.filter(n => n.type === 'homework');

    const defaultAssignments = [
        { id: 'def-1', title: 'Algebra Practice Set 1', subject: 'Mathematics', teacher: 'Abdul Jabbar', dueDate: '2024-05-25', status: 'Pending' },
        { id: 'def-2', title: 'Hamlet Essay', subject: 'English', teacher: 'Salma Khatun', dueDate: '2024-05-22', status: 'Submitted' },
        { id: 'def-3', title: 'Physics Lab Report', subject: 'Physics', teacher: 'Nasreen Akter', dueDate: '2024-05-30', status: 'Pending' },
    ];

    const dynamicAssignments = liveHw.map((n, i) => ({
        id: `live-p-${n.id || i}`,
        title: n.title,
        subject: n.subject || 'General',
        teacher: n.authorName || 'Teacher',
        dueDate: n.metadata?.dueDate || 'Upcoming',
        status: 'Pending'
    }));

    const assignments = [
        ...dynamicAssignments.filter(d => !defaultAssignments.some(a => a.title.toLowerCase() === d.title.toLowerCase())),
        ...defaultAssignments
    ];

    return (
        <DashboardLayout role={UserRole.PARENT}>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Child's Homework</h2>
                <p className="text-slate-500">Track homework progress for Rahim Ahmed.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignments.map(assign => (
                    <Card key={assign.id} className="hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <BookOpen size={24} />
                            </div>
                            <Badge color={assign.status === 'Submitted' ? 'green' : 'red'}>{assign.status}</Badge>
                        </div>
                        <h3 className="font-bold text-lg text-slate-800 mb-1">{assign.title}</h3>
                        <p className="text-sm text-slate-500">{assign.subject} • {assign.teacher}</p>
                        <p className="text-xs text-slate-400 mt-3">Due: {assign.dueDate}</p>
                    </Card>
                ))}
            </div>
        </DashboardLayout>
    );
};

export const ParentLeave = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <DashboardLayout role={UserRole.PARENT}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Leave Application</h2>
                    <p className="text-slate-500">Apply for leave on behalf of your child.</p>
                </div>
                <Button icon={Plus} onClick={() => setIsModalOpen(true)}>Apply Leave</Button>
            </div>

            <Card>
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Dates</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Reason</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {MOCK_LEAVES.filter(l => l.role === 'Student').map((leave) => (
                            <tr key={leave.id}>
                                <td className="px-6 py-4 text-sm font-medium text-slate-900">{leave.type}</td>
                                <td className="px-6 py-4 text-sm text-slate-500">{leave.startDate} to {leave.endDate}</td>
                                <td className="px-6 py-4 text-sm text-slate-500">{leave.reason}</td>
                                <td className="px-6 py-4">
                                    <Badge color={leave.status === 'Approved' ? 'green' : leave.status === 'Rejected' ? 'red' : 'yellow'}>{leave.status}</Badge>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Leave Application">
                <form className="space-y-4">
                    <Input label="Leave Type" placeholder="Sick, Family Event..." />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="From Date" type="date" />
                        <Input label="To Date" type="date" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                        <textarea className="w-full px-3 py-2 border border-slate-300 rounded-lg h-24 resize-none" placeholder="Details..."></textarea>
                    </div>
                    <div className="flex justify-end pt-2">
                        <Button onClick={() => setIsModalOpen(false)}>Submit Application</Button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
};


export const ParentFees = () => {
    const { activeTenant } = useAuth();
    const { showToast } = useToast();
    const [invoicesList, setInvoicesList] = useState(MOCK_INVOICES);
    const [selectedInvoiceForPay, setSelectedInvoiceForPay] = useState<PaymentInvoiceInfo | null>(null);
    const [isGatewayOpen, setIsGatewayOpen] = useState(false);
    const [receiptInvoice, setReceiptInvoice] = useState<any>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const handleDownloadPDF = async (inv: any) => {
        try {
            setDownloadingId(inv.id);
            await downloadFeeReceiptPDF(inv, activeTenant);
            showToast(`Official PDF receipt for ${inv.studentName || 'student'} downloaded!`, 'success');
        } catch (e) {
            showToast('Failed to download PDF receipt', 'error');
        } finally {
            setDownloadingId(null);
        }
    };

    const handleOpenGateway = (inv: any) => {
        setSelectedInvoiceForPay({
            id: inv.id,
            studentName: inv.studentName || MOCK_STUDENTS[0].name,
            studentClass: MOCK_STUDENTS[0].class,
            studentRoll: MOCK_STUDENTS[0].rollNo,
            guardianPhone: MOCK_STUDENTS[0].phone || '01712345678',
            amount: inv.amount,
            feeType: inv.type || 'Monthly Tuition Fee',
            dueDate: inv.dueDate,
            month: 'May'
        });
        setIsGatewayOpen(true);
    };

    const handlePaymentSuccess = (txn: PaymentTransaction) => {
        setInvoicesList(prev => prev.map(inv => {
            if (inv.id === txn.invoiceId) {
                return { ...inv, status: 'Paid' as any, paidDate: txn.paidAt, trxId: txn.trxId };
            }
            return inv;
        }));
    };

    return (
        <DashboardLayout role={UserRole.PARENT}>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Fee Payments</h2>
                    <p className="text-slate-500">Manage online payments with instant status tracking for your child.</p>
                </div>
            </div>
            <Card>
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Invoice</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Due Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {invoicesList.filter(i => i.studentName === MOCK_STUDENTS[0].name).map(inv => (
                            <tr key={inv.id}>
                                <td className="px-6 py-4 text-sm font-medium text-indigo-600">
                                  {inv.id}
                                  {inv.type && <div className="text-xs text-slate-400 font-normal">{inv.type}</div>}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">{inv.dueDate}</td>
                                <td className="px-6 py-4 text-sm font-bold text-slate-800">৳{inv.amount.toLocaleString()}</td>
                                <td className="px-6 py-4"><Badge color={inv.status === 'Paid' ? 'green' : 'red'}>{inv.status}</Badge></td>
                                <td className="px-6 py-4 text-right">
                                    {inv.status !== 'Paid' ? (
                                        <div className="flex justify-end gap-2">
                                            <Button 
                                                className="text-xs h-8 bg-pink-600 hover:bg-pink-700 text-white font-bold" 
                                                icon={CreditCard} 
                                                onClick={() => handleOpenGateway(inv)}
                                            >
                                                Pay Online
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-end gap-1.5">
                                            <Button 
                                                size="sm" 
                                                variant="secondary" 
                                                className="text-xs h-8"
                                                onClick={() => setReceiptInvoice(inv)}
                                            >
                                                Receipt
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                className="text-xs h-8 bg-indigo-700 hover:bg-indigo-800 text-white font-bold"
                                                icon={downloadingId === inv.id ? Loader2 : Download}
                                                disabled={downloadingId === inv.id}
                                                onClick={() => handleDownloadPDF(inv)}
                                                title="Download Official School-Branded Fee Receipt PDF"
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
                invoice={selectedInvoiceForPay}
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

export const ParentResults = () => {
    const { user, activeTenant } = useAuth();
    const students = getStoredStudents();
    const child = user?.studentData || students.find(s => s.id === user?.studentId) || students[0] || MOCK_STUDENTS[0];
    const [selectedExam, setSelectedExam] = useState<any>(null);

    const instName = activeTenant?.name || user?.tenantName || child?.tenantName || 'SmartSchool International';
    const instAddress = activeTenant?.address || 'Bangladesh';

    return (
        <DashboardLayout role={UserRole.PARENT}>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Academic Results</h2>
                <p className="text-slate-500">Exam performance reports for {child.name}.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['First Term 2024', 'Annual 2023'].map(exam => (
                    <Card key={exam} title={exam}>
                        <div className="space-y-4">
                            {MOCK_RESULTS.slice(0, 3).map(res => (
                                <div key={res.id} className="flex justify-between items-center border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-bold text-slate-800">{res.subjectId}</p>
                                        <p className="text-xs text-slate-500">Full Marks: 100</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-indigo-600 text-lg">{res.marks.total}</p>
                                        <Badge color="green">Grade {res.grade}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                            <Button variant="secondary" className="w-full" icon={FileText} onClick={() => setSelectedExam(exam)}>View Report Card</Button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Report Card Modal - Reused Design */}
            <Modal isOpen={!!selectedExam} onClose={() => setSelectedExam(null)} title="Report Card">
                {selectedExam && (
                    <div className="bg-white p-4">
                        <div className="border border-slate-400 p-6">
                            <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
                                <h1 className="text-2xl font-serif font-bold text-slate-900 uppercase">{instName}</h1>
                                <p className="text-sm text-slate-600">{instAddress}</p>
                                <h2 className="text-xl font-bold mt-4 uppercase underline decoration-2 decoration-slate-400">Academic Transcript</h2>
                                <p className="text-sm font-bold mt-2">{selectedExam}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6 text-sm">
                                <div className="flex"><span className="w-24 font-bold">Name:</span> <span className="border-b border-dotted border-slate-400 flex-1">{child.name}</span></div>
                                <div className="flex"><span className="w-24 font-bold">Student ID:</span> <span className="border-b border-dotted border-slate-400 flex-1">{child.id}</span></div>
                                <div className="flex"><span className="w-24 font-bold">Class:</span> <span className="border-b border-dotted border-slate-400 flex-1">{child.class} ({child.section})</span></div>
                                <div className="flex"><span className="w-24 font-bold">Roll No:</span> <span className="border-b border-dotted border-slate-400 flex-1">{child.rollNo}</span></div>
                            </div>

                            <table className="w-full border-collapse border border-slate-800 text-sm mb-6">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="border border-slate-800 px-2 py-1 text-left">Subject Name</th>
                                        <th className="border border-slate-800 px-2 py-1 text-center">Full Marks</th>
                                        <th className="border border-slate-800 px-2 py-1 text-center">Obtained</th>
                                        <th className="border border-slate-800 px-2 py-1 text-center">Letter Grade</th>
                                        <th className="border border-slate-800 px-2 py-1 text-center">Grade Point</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {MOCK_RESULTS.map((res, i) => (
                                        <tr key={i}>
                                            <td className="border border-slate-800 px-2 py-1">{res.subjectId}</td>
                                            <td className="border border-slate-800 px-2 py-1 text-center">100</td>
                                            <td className="border border-slate-800 px-2 py-1 text-center font-bold">{res.marks.total}</td>
                                            <td className="border border-slate-800 px-2 py-1 text-center font-bold">{res.grade}</td>
                                            <td className="border border-slate-800 px-2 py-1 text-center">
                                                {res.grade === 'A+' ? '5.00' : res.grade === 'A' ? '4.00' : res.grade === 'A-' ? '3.50' : '0.00'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="font-bold bg-slate-50">
                                        <td colSpan={4} className="border border-slate-800 px-2 py-1 text-right">Grade Point Average (GPA)</td>
                                        <td className="border border-slate-800 px-2 py-1 text-center text-indigo-700">4.50</td>
                                    </tr>
                                </tfoot>
                            </table>

                            <div className="grid grid-cols-3 gap-4 mt-16 text-center text-xs">
                                <div>
                                    <div className="border-t border-slate-400 pt-1 font-bold">Class Teacher</div>
                                </div>
                                <div>
                                    <div className="border-t border-slate-400 pt-1 font-bold">Exam Controller</div>
                                </div>
                                <div>
                                    <div className="border-t border-slate-400 pt-1 font-bold">Principal</div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="secondary" onClick={() => window.print()} icon={Printer}>Print Transcript</Button>
                            <Button onClick={() => setSelectedExam(null)}>Close</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </DashboardLayout>
    );
};

export const ParentAttendance = () => {
    const student = MOCK_STUDENTS[0];
    return (
        <DashboardLayout role={UserRole.PARENT}>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Attendance Record</h2>
                <p className="text-slate-500">{student.name}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                 <Card className="text-center p-6 bg-green-50 border-green-100">
                     <h3 className="text-3xl font-bold text-green-700">24</h3>
                     <p className="text-sm text-green-600">Present Days</p>
                 </Card>
                 <Card className="text-center p-6 bg-red-50 border-red-100">
                     <h3 className="text-3xl font-bold text-red-700">2</h3>
                     <p className="text-sm text-red-600">Absent Days</p>
                 </Card>
                 <Card className="text-center p-6 bg-yellow-50 border-yellow-100">
                     <h3 className="text-3xl font-bold text-yellow-700">1</h3>
                     <p className="text-sm text-yellow-600">Late Arrivals</p>
                 </Card>
                 <Card className="text-center p-6 bg-indigo-50 border-indigo-100">
                     <h3 className="text-3xl font-bold text-indigo-700">92%</h3>
                     <p className="text-sm text-indigo-600">Attendance Rate</p>
                 </Card>
            </div>

            <Card title="Attendance Log (May 2024)">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Day</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Check-in Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {MOCK_ATTENDANCE.filter(a => a.personId === '101' || a.personId === 'ST-2024-001').map(att => (
                            <tr key={att.id}>
                                <td className="px-6 py-4 text-sm text-slate-900">{att.date}</td>
                                <td className="px-6 py-4 text-sm text-slate-500">Monday</td>
                                <td className="px-6 py-4 text-sm font-mono text-slate-600">{att.checkInTime}</td>
                                <td className="px-6 py-4">
                                    <Badge color={att.status === 'Present' ? 'green' : att.status === 'Late' ? 'yellow' : 'red'}>{att.status}</Badge>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </DashboardLayout>
    );
};

export const ParentChildProfile = () => {
    const child = MOCK_STUDENTS[0];
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const { addToast } = useToast();

    return (
        <DashboardLayout role={UserRole.PARENT}>
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">My Child Profile</h2>
                <Button variant="secondary" icon={Edit} onClick={() => setIsEditModalOpen(true)}>Update Info</Button>
            </div>
            
            <Card className="max-w-4xl">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex flex-col items-center">
                        <div className="w-32 h-32 bg-slate-200 rounded-full mb-4 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                             {child.imageUrl ? (
                                <img src={child.imageUrl} className="w-full h-full object-cover" alt={child.name} />
                             ) : (
                                <User size={64} className="text-slate-400" />
                             )}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">{child.name}</h3>
                        <p className="text-indigo-600 font-medium">{child.class} - Section {child.section}</p>
                        <Badge color="blue" className="mt-2">Roll: {child.rollNo}</Badge>
                    </div>

                    <div className="flex-1 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Student ID</label>
                                <div className="mt-1 text-slate-800 font-medium">{child.id}</div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Blood Group</label>
                                <div className="mt-1 text-slate-800 font-medium">{child.bloodGroup}</div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Date of Birth</label>
                                <div className="flex items-center gap-2 mt-1 text-slate-800">
                                    <Calendar size={16} className="text-slate-400" /> 15 Aug 2008
                                </div>
                            </div>
                             <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Guardian</label>
                                <div className="flex items-center gap-2 mt-1 text-slate-800">
                                    <User size={16} className="text-slate-400" /> {child.guardian}
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><AlertCircle size={16}/> Emergency Contact</h4>
                             <div className="flex items-center gap-2 text-slate-800">
                                <Phone size={16} className="text-slate-400" /> {child.phone}
                            </div>
                             <div className="flex items-center gap-2 mt-2 text-slate-800">
                                <MapPin size={16} className="text-slate-400" /> 123, Mirpur DOHS, Dhaka
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex justify-end">
                            <Button variant="secondary" className="text-xs">Request Info Update</Button>
                        </div>
                    </div>
                </div>
            </Card>

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Update Emergency Contact">
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsEditModalOpen(false); addToast('Emergency contact updated', 'success'); }}>
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-xs text-yellow-800 mb-2">
                        Updating this will change the primary contact number for SMS alerts.
                    </div>
                    <Input label="New Phone Number" defaultValue={child.phone} />
                    <Input label="Relationship" placeholder="Father/Mother" />
                    <Input label="New Address" defaultValue="123, Mirpur DOHS, Dhaka" />
                    <div className="flex justify-end pt-2">
                        <Button type="submit">Update Info</Button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
};

// ... (keep ParentChat) ...
export const ParentChat = () => {
    const [messages, setMessages] = useState(MOCK_MESSAGES);
    const [messageInput, setMessageInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const teacher = MOCK_STAFF[0]; // Assume talking to class teacher

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim()) return;

        const newMessage = {
            id: `MSG-${Date.now()}`,
            sender: 'me' as const,
            text: messageInput,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages([...messages, newMessage]);
        setMessageInput('');

        // Simulate reply
        setTimeout(() => {
            const reply = {
                id: `MSG-${Date.now()+1}`,
                sender: 'other' as const,
                text: "Thanks for your message. We will get back to you shortly.",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, reply]);
        }, 1500);
    };

    return (
        <DashboardLayout role={UserRole.PARENT}>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Communication with Teachers</h2>
            </div>
            <Card className="h-[calc(100vh-200px)] flex flex-col p-0 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold overflow-hidden">
                            {teacher.imageUrl ? <img src={teacher.imageUrl} className="w-full h-full object-cover" alt={teacher.name}/> : 'T'}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">{teacher.name}</h3>
                            <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <p className="text-xs text-slate-500">Class Teacher</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${msg.sender === 'me' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'}`}>
                                <p className="text-sm">{msg.text}</p>
                                <p className={`text-[10px] mt-1 text-right ${msg.sender === 'me' ? 'text-indigo-200' : 'text-slate-400'}`}>{msg.time}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-white border-t border-slate-100">
                    <form className="flex items-center gap-3" onSubmit={handleSendMessage}>
                        <input 
                            type="text" 
                            placeholder="Type your message..." 
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-300"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                        />
                        <button type="submit" className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors">
                            <Send size={18} className="ml-0.5" />
                        </button>
                    </form>
                </div>
            </Card>
        </DashboardLayout>
    );
};

export const ParentChildIdCard = () => {
    const { user, switchActiveChild } = useAuth();
    const students = getStoredStudents();
    const child = user?.studentData || students.find(s => s.id === user?.studentId) || students[0] || MOCK_STUDENTS[0];
    const allChildren = user?.allChildren && user.allChildren.length > 0 ? user.allChildren : [child];
    const verificationUrl = getStudentVerificationUrl(child.id);

    return (
        <DashboardLayout role={UserRole.PARENT}>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Child's Digital ID Card / ডিজিটাল শিক্ষার্থী পরিচয়পত্র</h2>
                    <p className="text-slate-500">Official verified credentials with dynamic security QR code for {child.name}</p>
                </div>
                <div className="flex items-center gap-2">
                    {allChildren.length > 1 && (
                        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-lg border border-slate-300">
                            <span className="text-xs font-bold text-slate-600">Child:</span>
                            <select
                                value={child.id}
                                onChange={(e) => switchActiveChild(e.target.value)}
                                className="text-xs font-bold bg-slate-50 border border-slate-300 rounded px-2 py-1"
                            >
                                {allChildren.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} ({c.class})</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <Button variant="secondary" onClick={() => window.print()} icon={Printer}>Print Card</Button>
                    <a
                        href={verificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs transition-colors border border-indigo-200"
                    >
                        <ExternalLink size={14} />
                        <span>Public Verification</span>
                    </a>
                </div>
            </div>

            <div className="max-w-xl mx-auto py-4">
                <StudentIDCard student={child} defaultShowBack={false} />
            </div>
        </DashboardLayout>
    );
};

