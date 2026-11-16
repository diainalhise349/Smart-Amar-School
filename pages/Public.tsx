import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Shield, Globe, TrendingUp, Users, Target, Heart, Mail, MapPin, Phone, Check, ArrowRight, BarChart3, PieChart, Layers, Zap, Calculator, Star, Quote, Smartphone, Menu, X, PlayCircle, HelpCircle, ShieldCheck, Video, LayoutDashboard, GraduationCap, Clock, FileText, Lock, Server, Building2, User, CheckSquare, CreditCard, Cpu, Smile, Lightbulb, MessageCircle, BookOpen, Bus, BedDouble, Archive, Fingerprint, Moon, CalendarCheck, School, ExternalLink, AlertTriangle, Eye, EyeOff, Copy, Key, MessageSquare, LogIn, Sparkles, Compass, CheckCircle2, ChevronRight, ChevronDown, ChevronUp, Radio, Calendar, DollarSign, Award, Briefcase, FileSpreadsheet, ArrowUpRight, CheckCheck } from 'lucide-react';
import { Button, Input, Card, Badge, Modal, useToast } from '../components/UIComponents';
import { PublicLayout } from '../components/Layout';
import { MOCK_PLANS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { getStoredStudents } from '../utils/studentStorage';
import { getStoredTenants, DEFAULT_TENANTS } from '../utils/tenantStorage';

// --- Home Page ---
export { HomeView as Home } from '../components/HomeView';


// --- About Page ---
export const About = () => (
  <PublicLayout>
    <div className="bg-white">
        {/* Header */}
        <div className="relative bg-slate-900 py-24 sm:py-32">
            <div className="absolute inset-0 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2830&q=80&blend=111827&sat=-100&exp=15&blend-mode=multiply" alt="" className="h-full w-full object-cover object-center" />
            </div>
            <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">Building the Digital Backbone of Education</h1>
                <p className="mt-6 text-lg leading-8 text-slate-300 max-w-2xl mx-auto">
                    Bridging the gap between traditional teaching and modern technology for Schools, Colleges, and Madrasas across South Asia.
                </p>
            </div>
        </div>

      {/* Story Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
            <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Journey</h2>
                <p className="text-slate-600 mb-4 leading-relaxed">
                    It started with a simple observation: Educators in rural and semi-urban areas were spending more time on paperwork than on their students. Manual attendance, handwritten mark sheets, and chaotic fee collection were the norm.
                </p>
                <p className="text-slate-600 leading-relaxed mb-6">
                    Smart Amar School was born to solve this. We built a cloud-native SaaS platform that automates the mundane—attendance, finances, results—so teachers can do what they do best: Teach. Today, we serve hundreds of institutions with a system that is robust enough for a university but simple enough for a primary school.
                </p>
                <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-indigo-50 border-none shadow-none"><h3 className="font-bold text-indigo-700 text-2xl">2022</h3><p className="text-sm text-slate-600">Founded in Dhaka</p></Card>
                    <Card className="bg-purple-50 border-none shadow-none"><h3 className="font-bold text-purple-700 text-2xl">500+</h3><p className="text-sm text-slate-600">Feature Updates</p></Card>
                    <Card className="bg-green-50 border-none shadow-none"><h3 className="font-bold text-green-700 text-2xl">64</h3><p className="text-sm text-slate-600">Districts Covered</p></Card>
                    <Card className="bg-orange-50 border-none shadow-none"><h3 className="font-bold text-orange-700 text-2xl">24/7</h3><p className="text-sm text-slate-600">Support Team</p></Card>
                </div>
            </div>
            <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-20 blur-lg"></div>
                <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80" alt="Team meeting" className="relative rounded-2xl shadow-xl border border-slate-200" />
            </div>
        </div>

        {/* Values Grid */}
        <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why We Do It</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Our core values drive every line of code we write and every customer interaction we have.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
           <Card className="text-center p-8 border-t-4 border-indigo-600 hover:shadow-lg transition-all">
              <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                 <Lightbulb className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Innovation for All</h3>
              <p className="text-slate-600 text-sm">We believe advanced technology shouldn't be expensive. We bring Enterprise-grade ERP features to affordable price points.</p>
           </Card>
           <Card className="text-center p-8 border-t-4 border-red-600 hover:shadow-lg transition-all">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                 <ShieldCheck className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Data Integrity</h3>
              <p className="text-slate-600 text-sm">Student data is sacred. We enforce strict data isolation protocols and bank-grade encryption for every tenant.</p>
           </Card>
           <Card className="text-center p-8 border-t-4 border-green-600 hover:shadow-lg transition-all">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                 <Smile className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Customer First</h3>
              <p className="text-slate-600 text-sm">We don't just sell software; we build partnerships. Our success is measured by the success of the institutions we serve.</p>
           </Card>
        </div>

        {/* Tailored Solutions Section */}
        <div className="mb-24 bg-slate-50 p-12 rounded-3xl">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900">Tailored for Every Institution</h2>
                <p className="text-slate-600 mt-2">Specific features designed for the unique needs of different educational bodies.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4"><GraduationCap className="text-blue-600"/></div>
                    <h3 className="font-bold text-lg mb-2">Schools</h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                        <li className="flex gap-2"><Check size={16} className="text-green-500"/> Class & Section Management</li>
                        <li className="flex gap-2"><Check size={16} className="text-green-500"/> Subject-wise Grading</li>
                        <li className="flex gap-2"><Check size={16} className="text-green-500"/> Activity Clubs</li>
                    </ul>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4"><Moon className="text-green-600"/></div>
                    <h3 className="font-bold text-lg mb-2">Madrasas</h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                        <li className="flex gap-2"><Check size={16} className="text-green-500"/> Hifz Monitoring Dashboard</li>
                        <li className="flex gap-2"><Check size={16} className="text-green-500"/> Befaq/Board Result Processing</li>
                        <li className="flex gap-2"><Check size={16} className="text-green-500"/> Donation Management</li>
                    </ul>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4"><Building2 className="text-purple-600"/></div>
                    <h3 className="font-bold text-lg mb-2">Colleges</h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                        <li className="flex gap-2"><Check size={16} className="text-green-500"/> Semester Planning</li>
                        <li className="flex gap-2"><Check size={16} className="text-green-500"/> Department Management</li>
                        <li className="flex gap-2"><Check size={16} className="text-green-500"/> Credit-based Result System</li>
                    </ul>
                </div>
            </div>
        </div>
      </div>

      {/* Tech Stack Section */}
      <div className="bg-slate-900 py-24 text-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div>
                      <h2 className="text-3xl font-bold mb-6">Powered by Modern Tech</h2>
                      <p className="text-slate-300 mb-8 leading-relaxed">
                          Smart Amar School isn't just a PHP script. It's a full-fledged Single Page Application (SPA) built on a scalable cloud architecture.
                      </p>
                      <ul className="space-y-6">
                          <li className="flex gap-4">
                              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                                  <Server className="w-6 h-6 text-indigo-400"/>
                              </div>
                              <div>
                                  <h4 className="font-bold text-lg">Multi-Tenant Cloud</h4>
                                  <p className="text-sm text-slate-400">Isolated databases for every school ensuring 100% data privacy and zero leakage.</p>
                              </div>
                          </li>
                          <li className="flex gap-4">
                              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                                  <Cpu className="w-6 h-6 text-indigo-400"/>
                              </div>
                              <div>
                                  <h4 className="font-bold text-lg">AI & Automation</h4>
                                  <p className="text-sm text-slate-400">Integrated AI for lesson planning, result analysis, and routine generation.</p>
                              </div>
                          </li>
                          <li className="flex gap-4">
                              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                                  <Shield className="w-6 h-6 text-indigo-400"/>
                              </div>
                              <div>
                                  <h4 className="font-bold text-lg">99.9% Uptime</h4>
                                  <p className="text-sm text-slate-400">Hosted on reliable servers with daily backups and redundant connections.</p>
                              </div>
                          </li>
                      </ul>
                  </div>
                  <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-slate-900/50 rounded-xl text-center">
                              <h4 className="font-bold text-2xl text-indigo-400">200ms</h4>
                              <p className="text-xs text-slate-500">API Latency</p>
                          </div>
                          <div className="p-4 bg-slate-900/50 rounded-xl text-center">
                              <h4 className="font-bold text-2xl text-green-400">SSL</h4>
                              <p className="text-xs text-slate-500">Encrypted</p>
                          </div>
                          <div className="p-4 bg-slate-900/50 rounded-xl text-center">
                              <h4 className="font-bold text-2xl text-yellow-400">API</h4>
                              <p className="text-xs text-slate-500">First Design</p>
                          </div>
                          <div className="p-4 bg-slate-900/50 rounded-xl text-center">
                              <h4 className="font-bold text-2xl text-purple-400">PWA</h4>
                              <p className="text-xs text-slate-500">Mobile Ready</p>
                          </div>
                      </div>
                      <div className="mt-8">
                          <h5 className="font-bold mb-2 text-sm text-slate-300">Technology Partners</h5>
                          <div className="flex gap-4 text-slate-500 font-bold text-xl grayscale opacity-50">
                              <span>AWS</span>
                              <span>CLOUDFLARE</span>
                              <span>STRIPE</span>
                              <span>BKASH</span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  </PublicLayout>
);

// --- Pricing Page ---
export const Pricing = () => {
    const [students, setStudents] = useState(500);
    const [billingCycle, setBillingCycle] = useState<'Monthly' | 'Yearly'>('Monthly');
    const [openPricingFaq, setOpenPricingFaq] = useState<number | null>(0);
    const [faqCategory, setFaqCategory] = useState<'all' | 'onboarding' | 'multitenant'>('all');

    return (
  <PublicLayout>
    <div className="relative isolate pt-14 bg-white">
      {/* Background decoration */}
      <div className="absolute inset-x-0 -top-3 -z-10 transform-gpu overflow-hidden px-36 blur-3xl" aria-hidden="true">
        <div className="mx-auto aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Plans for every stage of your growth
          </p>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Whether you are a small madrasa or a large college, we have a plan that fits your needs. 
            Transparent pricing, no hidden costs.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="mt-16 flex justify-center">
            <div className="relative flex bg-slate-100 p-1 rounded-full border border-slate-200">
                <button 
                  onClick={() => setBillingCycle('Monthly')}
                  className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 ${billingCycle === 'Monthly' ? 'bg-white shadow-sm text-slate-900 ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
                >
                    Monthly
                </button>
                <button 
                  onClick={() => setBillingCycle('Yearly')}
                  className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 ${billingCycle === 'Yearly' ? 'bg-white shadow-sm text-slate-900 ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
                >
                    Yearly <span className="text-[10px] text-green-600 font-bold ml-1 uppercase tracking-wide bg-green-100 px-1 rounded">-20%</span>
                </button>
            </div>
        </div>

        {/* Cost Calculator Section */}
        <div className="mt-16 max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-8 sm:p-10">
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600"><Calculator size={20}/></div>
                    <h3 className="text-lg font-bold text-slate-800">Dynamic Cost Estimator</h3>
                </div>
                
                <div className="space-y-8">
                    <div>
                        <div className="flex justify-between mb-4">
                            <label className="text-sm font-medium text-slate-600">Total Students</label>
                            <span className="text-2xl font-bold text-indigo-600">{students}</span>
                        </div>
                        <input 
                            type="range" 
                            min="100" 
                            max="5000" 
                            step="50" 
                            value={students} 
                            onChange={(e) => setStudents(parseInt(e.target.value))}
                            className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-700 transition-all"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                            <span>100 Students</span>
                            <span>5000+ Students</span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Recommended Plan</p>
                            <h4 className="text-xl font-bold text-slate-900">
                                {students <= 500 ? 'Basic Starter' : students <= 2000 ? 'Standard Growth' : 'Premium Enterprise'}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1">Best value for your size</p>
                        </div>
                        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex flex-col justify-center text-right">
                             <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-1">Estimated Cost</p>
                             <h4 className="text-3xl font-bold text-slate-900">
                                ${students <= 500 ? (billingCycle === 'Monthly' ? 20 : 16) : students <= 2000 ? (billingCycle === 'Monthly' ? 50 : 40) : (billingCycle === 'Monthly' ? 100 : 80)}
                                <span className="text-sm font-normal text-slate-500 ml-1">/mo</span>
                             </h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-none lg:grid-cols-3">
          {MOCK_PLANS.map((plan, planIdx) => {
            const price = billingCycle === 'Monthly' ? plan.price : Math.round(plan.price * 0.8);
            // Logic for highlighting based on student count
            const isRecommended = (students > 500 && students <= 2000 && plan.id === 'PLAN-S') || (students <= 500 && plan.id === 'PLAN-B') || (students > 2000 && plan.id === 'PLAN-P');
            
            return (
            <div 
                key={plan.id} 
                className={`
                    flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-slate-200 xl:p-10 transition-all duration-300
                    ${isRecommended ? 'z-10 scale-105 shadow-2xl ring-2 ring-indigo-600' : 'hover:shadow-lg hover:scale-[1.02]'}
                    ${planIdx === 0 ? 'lg:rounded-r-none' : ''} 
                    ${planIdx === 2 ? 'lg:rounded-l-none' : ''}
                    ${planIdx === 1 ? 'lg:rounded-none lg:mx-0' : ''}
                `}
            >
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3 id={plan.id} className={`text-lg font-semibold leading-8 ${isRecommended ? 'text-indigo-600' : 'text-slate-900'}`}>
                    {plan.name}
                  </h3>
                  {isRecommended && (
                    <span className="rounded-full bg-indigo-600/10 px-2.5 py-1 text-xs font-semibold leading-5 text-indigo-600">
                      Most Popular
                    </span>
                  )}
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                    Perfect for {plan.id === 'PLAN-B' ? 'small schools starting their digital journey.' : plan.id === 'PLAN-S' ? 'growing institutions needing automation.' : 'large organizations requiring full control.'}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-slate-900">${price}</span>
                  <span className="text-sm font-semibold leading-6 text-slate-600">/month</span>
                </p>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-slate-600">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <Check className="h-6 w-5 flex-none text-indigo-600" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                   <li className="flex gap-x-3">
                      <Check className="h-6 w-5 flex-none text-indigo-600" aria-hidden="true" />
                      Max <span className="font-bold text-slate-900">{plan.maxStudentsLimit}</span> Students
                   </li>
                </ul>
              </div>
              <a
                href="#"
                className={`mt-8 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${isRecommended ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
              >
                Get started today
              </a>
            </div>
          )})}
        </div>

        {/* Feature Comparison */}
        <div className="mt-24 flow-root">
            <div className="isolate -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">Compare Features</h3>
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">Feature</th>
                                    <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-slate-900">Basic</th>
                                    <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-indigo-600">Standard</th>
                                    <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-slate-900">Premium</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                                {[
                                    { name: 'Student Management', basic: true, standard: true, premium: true },
                                    { name: 'Fee Collection', basic: true, standard: true, premium: true },
                                    { name: 'Result Processing', basic: true, standard: true, premium: true },
                                    { name: 'Finance & Accounts', basic: false, standard: true, premium: true },
                                    { name: 'SMS Gateway (Masking)', basic: false, standard: true, premium: true },
                                    { name: 'Attendance Device (ZKTeco)', basic: false, standard: true, premium: true },
                                    { name: 'Online Payment Gateway', basic: false, standard: false, premium: true },
                                    { name: 'Inventory & Hostel', basic: false, standard: false, premium: true },
                                    { name: 'Transport Tracking', basic: false, standard: false, premium: true },
                                    { name: 'Live Classes (Zoom/Meet)', basic: false, standard: false, premium: true },
                                    { name: 'Hifz / Befaq Module', basic: false, standard: true, premium: true },
                                    { name: 'Custom Domain', basic: false, standard: false, premium: true },
                                    { name: 'White-label App', basic: false, standard: false, premium: true },
                                ].map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-700 sm:pl-6">{row.name}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 text-center">{row.basic ? <Check className="mx-auto text-green-500 w-5 h-5"/> : <span className="text-slate-300 block w-5 mx-auto font-bold">-</span>}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 text-center bg-indigo-50/30">{row.standard ? <Check className="mx-auto text-green-500 w-5 h-5"/> : <span className="text-slate-300 block w-5 mx-auto font-bold">-</span>}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 text-center">{row.premium ? <Check className="mx-auto text-green-500 w-5 h-5"/> : <span className="text-slate-300 block w-5 mx-auto font-bold">-</span>}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        {/* ========================================================= */}
        {/* PLATFORM COMPARISON: Smart Amar School vs Manual / Legacy */}
        {/* ========================================================= */}
        <div className="mt-28">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-black text-indigo-700 tracking-wide">
              <Sparkles size={14} className="text-amber-500" />
              <span>PLATFORM COMPARISON • অনন্য সুবিধা ও রূপান্তর</span>
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Smart Amar School vs Manual & Legacy Processes
            </h3>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Why 1,200+ schools, colleges, and madrasahs are leaving paper registers, disconnected spreadsheets, and error-prone cash slips for our automated cloud ecosystem.
            </p>

            {/* Quick Value Metrics */}
            <div className="pt-2 flex flex-wrap justify-center items-center gap-2.5 sm:gap-4 text-xs font-bold text-slate-700">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>৭৫% প্রশাসনিক সময় সাশ্রয়</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
                <CheckCircle2 size={14} className="text-blue-600" />
                <span>৯৮.৪% সময়মতো ফি আদায়</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
                <CheckCircle2 size={14} className="text-amber-600" />
                <span>১০০% পেপারলেস অটোমেশন</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200">
                <CheckCircle2 size={14} className="text-purple-600" />
                <span>০% হিসাব ও তথ্যের গরমিল</span>
              </span>
            </div>
          </div>

          {/* Detailed Responsive Comparison Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-5 px-6 text-xs font-black uppercase tracking-wider text-slate-500 bg-slate-50 w-[24%]">
                      কার্যক্রম ও ক্ষেত্র (Domain / Function)
                    </th>
                    <th className="py-5 px-6 text-xs font-black uppercase tracking-wider text-rose-700 bg-rose-50/70 border-l border-slate-200 w-[38%]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span>সনাতনী খাতা-কলম ও অফলাইন পদ্ধতি</span>
                      </div>
                      <span className="text-[10px] font-normal text-rose-600 block mt-0.5">
                        Manual Registers, Paper Slips & Offline Disjointed Tools
                      </span>
                    </th>
                    <th className="py-5 px-6 text-xs font-black uppercase tracking-wider text-indigo-900 bg-indigo-50/80 border-l border-slate-200 w-[38%]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-sm font-black text-indigo-700">Smart Amar School (Cloud ERP)</span>
                        </div>
                        <span className="bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                          Modern Advantage
                        </span>
                      </div>
                      <span className="text-[10px] font-normal text-indigo-500 block mt-0.5">
                        সম্পূর্ণ স্বয়ংক্রিয় ক্লাউড প্ল্যাটফর্ম ও মোবাইল অ্যাপ
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {[
                    {
                      domain: 'শিক্ষার্থী ভর্তি ও রেজিস্ট্রেশন',
                      sub: 'Student Admission & Enrollment',
                      icon: Users,
                      manual: 'দীর্ঘ লাইনে দাঁড়িয়ে হাতে লেখা ফরম পূরণ, ছবি আঠা দিয়ে লাগানো, খসড়া রেজিস্টারে এন্ট্রি করতে একাধিক দিন নষ্ট, খাতা নষ্ট হলে ডেটা বিলুপ্তির চরম ঝুঁকি।',
                      smart: '১০০% অনলাইন পেপারলেস আবেদন, ডিজিটাল ডকুমেন্ট আপলোড, এক ক্লিকে অনুমোদন এবং কিউআর কোডযুক্ত ডিজিটাল আইডি কার্ড স্বয়ংক্রিয়ভাবে তৈরি।',
                      badge: '১৫০+ ঘণ্টা সময় সাশ্রয়'
                    },
                    {
                      domain: 'ফি কালেকশন ও হিসাবরক্ষণ',
                      sub: 'Fee Collection & Audit Ledger',
                      icon: DollarSign,
                      manual: 'কাউন্টারে দীর্ঘ লাইন, রশিদ বইয়ে হাতে বারবার লেখা, হিসাব মেলাতে গিয়ে গরমিল, বকেয়া ট্র্যাকিং জটিল এবং নগদ টাকা তছরুপের তীব্র ঝুঁকি।',
                      smart: 'বিকাশ, নগদ, রকেট, কার্ড ও ব্যাংক সরাসরি ইন্টিগ্রেশন, ফি জমা হওয়ামাত্র স্বয়ংক্রিয় পিডিএফ রশিদ ইমেইল ও এসএমএস প্রেরণ, রিয়েল-টাইম অডিট ট্রেইল।',
                      badge: '০% ক্যাশ লিকেজ'
                    },
                    {
                      domain: 'উপস্থিতি ও নিরাপত্তা ট্র্যাকিং',
                      sub: 'Attendance & Gate Safety',
                      icon: Fingerprint,
                      manual: 'প্রতি ক্লাসে রোল কলে ১৫-২০ মিনিট নষ্ট, প্রক্সি উপস্থিতি, শিক্ষার্থী ক্লাসে অনুপস্থিত থাকলেও অভিভাবকদের কাছে কোনো খবর পৌঁছায় না।',
                      smart: 'বায়োমেট্রিক ও RFID কার্ড পাঞ্চিং, শিক্ষার্থী প্রবেশ ও বের হওয়ার ৫ সেকেন্ডের মধ্যে অভিভাবকের মোবাইলে স্বয়ংক্রিয় উপস্থিতি এসএমএস এলার্ট।',
                      badge: 'রিয়েল-টাইম নোটিফিকেশন'
                    },
                    {
                      domain: 'পরীক্ষা, গ্রেডিং ও ফলাফল',
                      sub: 'Exam Results & Tabulation Sheets',
                      icon: Award,
                      manual: 'পরীক্ষার পর শিক্ষকদের সপ্তাহজুড়ে ক্যালকুলেটরে নম্বর যোগ, লাল কালির কাটাকাটি, হাতে লেখা টেবুলেশন শিট ও প্রোগ্রেস রিপোর্টে ব্যাপক ভুলভ্রান্তি।',
                      smart: 'জাতীয় কারিকুলাম ও বেফাক/মাদ্রাসা গ্রেডিং অনুযায়ী মাত্র ১ ক্লিকে অটোমেটিক জিপিএ, মার্কশিট, টেবুলেশন শিট ও সম্মিলিত মেধাক্রম প্রস্তুত।',
                      badge: '৯০% সময় সাশ্রয়'
                    },
                    {
                      domain: 'বাল্ক এসএমএস ও জরুরি নোটিশ',
                      sub: 'Parent Communication & SMS',
                      icon: Radio,
                      manual: 'কাগজে নোটিশ ছাপিয়ে ব্যাগে দেওয়া যা অধিকাংশ অভিভাবক দেখেন না, জরুরি দুর্যোগ বা ছুটির দিনে শত শত অভিভাবককে ফোন করা প্রায় অসম্ভব।',
                      smart: 'বিটিআরসি অনুমোদিত অফিসিয়াল মাস্কিং গেটওয়ে, [StudentName], [DueAmount] ইত্যাদিসহ ডায়নামিক ট্যাগ ও ভবিষ্যৎ তারিখ/সময়ের শিডিউলিং কিউ।',
                      badge: '১০০% অভিভাবক কভারেজ'
                    },
                    {
                      domain: 'ক্লাস রুটিন ও দৈনিক ডায়েরি',
                      sub: 'Routine & Digital Class Diary',
                      icon: Calendar,
                      manual: 'একই শিক্ষকের একই সময়ে দুটি ক্লাসের জটিল সংঘাত, ডায়রি হারিয়ে যাওয়া, আজ কী বাড়ির কাজ দেওয়া হলো তা অভিভাবকের জানার উপায় নেই।',
                      smart: 'শিক্ষক ও রুমের সংঘাতমুক্ত অটো রুটিন মেকার, প্রতিদিনের লেসন প্ল্যান ও হোমওয়ার্ক ডায়েরিতে দিলে অভিভাবকরা সাথে সাথে অ্যাপে দেখতে পান।',
                      badge: 'সংঘাতমুক্ত ক্লাসরুম'
                    },
                    {
                      domain: 'প্রতিষ্ঠানিক ওয়েবসাইট ও ব্র্যান্ডিং',
                      sub: 'School Website & Web Portal',
                      icon: Globe,
                      manual: 'কোনো নিজস্ব ওয়েবসাইট নেই অথবা বহু আগের তৈরি স্ট্যাটিক সাইট যা কখনো আপডেট হয় না, ইন্টারনেটে প্রতিষ্ঠানের নির্ভরযোগ্য পরিচয় থাকে না।',
                      smart: 'প্রতিটি প্রতিষ্ঠানের জন্য নিজস্ব সাবডোমেন ও কাস্টম ডোমেন কানেকশন, আধুনিক রেসপনসিভ ওয়েব পোর্টাল যা ইআরপি থেকে লাইভ ডেটা দেখায়।',
                      badge: 'উচ্চ ব্র্যান্ড ভ্যালু'
                    },
                    {
                      domain: 'তথ্য নিরাপত্তা ও ক্লাউড অ্যাক্সেস',
                      sub: 'Data Security & Anytime Access',
                      icon: ShieldCheck,
                      manual: 'কম্পিউটার নষ্ট হওয়া, ভাইরাস আক্রমণ, চুরি বা আগুনে পুড়ে সমস্ত রেকর্ড চিরতরে হারিয়ে যাওয়ার ভয়; কেবল অফিস ডেস্কটপ ছাড়া কাজ অসম্ভব।',
                      smart: 'ব্যাংক-গ্রেড ২৫৬-বিট এসএসএল এনক্রিপশন, স্বয়ংক্রিয় ক্লাউড ব্যাকআপ, মোবাইল-ট্যাবলেট-ল্যাপটপ থেকে সপ্তাহের ৭ দিন ২৪ ঘণ্টা নিরাপদ ব্যবহার।',
                      badge: '১০০% ডেটা গ্যারান্টি'
                    },
                    {
                      domain: 'কাগজ ও প্রশাসনিক খরচ',
                      sub: 'Paperwork & Operational Cost',
                      icon: Calculator,
                      manual: 'খাতা, রেজিস্টার, রশিদ বই, টেবুলেশন শিট ও ফটোকপিতে প্রতি বছর লক্ষাধিক টাকা অপচয় এবং স্টাফদের ক্লারিকাল কাজে সীমাহীন সময় ব্যয়।',
                      smart: 'সম্পূর্ণ পেপারলেস সমাধান; বার্ষিক কাগজ ও প্রিন্টিং খরচে ৮০% সাশ্রয়—মাত্র ২ মাসের খরচ বাঁচিয়েই পুরো সফটওয়্যার লাইসেন্সের খরচ উঠে আসে।',
                      badge: '৮০% বাজেট সাশ্রয়'
                    }
                  ].map((row, idx) => {
                    const Icon = row.icon;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        {/* Domain Column */}
                        <td className="py-4 px-6 align-top">
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-100">
                              <Icon size={16} />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-xs sm:text-sm">
                                {row.domain}
                              </div>
                              <div className="text-[10px] text-slate-400 font-medium">
                                {row.sub}
                              </div>
                              <span className="inline-block mt-1.5 text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                {row.badge}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Manual / Legacy Column */}
                        <td className="py-4 px-6 align-top bg-rose-50/30 border-l border-slate-100">
                          <div className="flex items-start gap-2 text-slate-600 leading-relaxed text-xs">
                            <X size={16} className="text-rose-500 shrink-0 mt-0.5" />
                            <span>{row.manual}</span>
                          </div>
                        </td>

                        {/* Smart Amar School Column */}
                        <td className="py-4 px-6 align-top bg-indigo-50/20 border-l border-slate-100">
                          <div className="flex items-start gap-2 text-slate-800 leading-relaxed text-xs font-medium">
                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                            <span>{row.smart}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Benefit Callout Card */}
            <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center md:text-left">
                <h4 className="text-base sm:text-lg font-black text-white flex items-center justify-center md:justify-start gap-2">
                  <Sparkles size={18} className="text-amber-400" />
                  <span>আপনার প্রতিষ্ঠানকে ডিজিটাল যুগে এক ধাপ এগিয়ে নিন</span>
                </h4>
                <p className="text-xs text-slate-300 max-w-xl">
                  কাগজ-কলমের ভুলভ্রান্তি ও সময় অপচয় বন্ধ করে আজই আপনার স্কুল, কলেজ বা মাদ্রাসাকে শতভাগ অটোমেটেড করুন।
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  to="/proposal"
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
                >
                  প্রস্তাবনা ও প্যাকেজ
                </Link>
                <Link
                  to="/contact"
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer"
                >
                  ফ্রি কনসালটেশন বুক করুন
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ONBOARDING & MULTI-TENANT FREQUENTLY ASKED QUESTIONS (FAQ) */}
        {/* ========================================================= */}
        <div className="mt-28 mb-16">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-black text-indigo-700 tracking-wide">
              <HelpCircle size={14} className="text-indigo-600" />
              <span>ONBOARDING & SETUP FAQ • অনবোর্ডিং ও কারিগরি তথ্যাবলী</span>
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h3>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Common questions about institution onboarding, Excel data migration, multi-tenant data privacy, and custom domain setup.
            </p>

            {/* Category Filter Tabs */}
            <div className="pt-3 flex flex-wrap justify-center gap-2">
              {[
                { id: 'all', label: 'সকল সাধারণ প্রশ্ন (All Questions)' },
                { id: 'onboarding', label: '🚀 অনবোর্ডিং ও ডেটা মাইগ্রেশন (Onboarding)' },
                { id: 'multitenant', label: '🔒 মাল্টি-টেন্যান্ট ও নিরাপত্তা (Multi-Tenant & Security)' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFaqCategory(tab.id as any)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    faqCategory === tab.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Accordion Items */}
          <div className="max-w-4xl mx-auto space-y-3.5">
            {[
              {
                id: 1,
                category: 'onboarding',
                q: 'আমাদের প্রতিষ্ঠানে Smart Amar School চালু করতে কত সময় লাগে? (How fast is onboarding?)',
                enQ: 'How fast can our school, college, or madrasa go live with Smart Amar School?',
                a: 'সাধারণত ৪৮ ঘণ্টারও কম সময়ে আপনার প্রতিষ্ঠান সম্পূর্ণরূপে লাইভ করা সম্ভব। সাইন আপ করার পর আমাদের ডেডিকেটেড অনবোর্ডিং ইঞ্জিনিয়ারিং টিম আপনার প্রতিষ্ঠানের অ্যাকাডেমিক ক্লাস, সেকশন, শিফট ও ফি কাঠামো কনফিগার করে দেয় এবং অবিলম্বে ব্যবহারের জন্য প্রস্তুত করে তোলে।'
              },
              {
                id: 2,
                category: 'onboarding',
                q: 'আমাদের পূর্ববর্তী শিক্ষার্থী ও শিক্ষকদের এক্সেল ডেটা কীভাবে ট্রান্সফার করব? (Excel Data Migration)',
                enQ: 'How do we migrate our existing student, teacher, and financial records from Excel?',
                a: 'আমাদের সিস্টেমে রয়েছে আদর্শ ১-ক্লিক বাল্ক এক্সেল ইমপোর্ট সুবিধা। আপনি এক ক্লিকেই পূর্ববর্তী এক্সেল ফাইল থেকে শত শত শিক্ষার্থীর নাম, রোল, শ্রেণি ও অভিভাবকের ফোন নম্বর নির্ভুলভাবে ইমপোর্ট করতে পারবেন। আমাদের ডেটা ভ্যালিডেটর স্বয়ংক্রিয়ভাবে ডুপ্লিকেট রোল বা ভুলের বিষয়ে সতর্ক করে দেয়।'
              },
              {
                id: 3,
                category: 'onboarding',
                q: 'আমাদের শিক্ষক, হিসাবরক্ষক ও কর্মচারীদের কি প্রশিক্ষণ (Training) প্রদান করা হবে?',
                enQ: 'Is comprehensive training provided for our teachers, accountants, and administrative staff?',
                a: 'হ্যাঁ, শতভাগ। প্রতিটি প্রতিষ্ঠানের জন্য অনলাইন ভিডিও সেশন অথবা সরাসরি অন-ক্যাম্পাস প্রশিক্ষণের ব্যবস্থা রয়েছে। পাশাপাশি রয়েছে সম্পূর্ণ বাংলায় সচিত্র ভিডিও টিউটোরিয়াল, ধাপে ধাপে ইউজার গাইড এবং যেকোনো প্রয়োজনে সার্বক্ষণিক (২৪/৭) ফোন ও হোয়াটসঅ্যাপ সাপোর্ট।'
              },
              {
                id: 4,
                category: 'onboarding',
                q: 'আমাদের প্রতিষ্ঠানে কোনো বড় কম্পিউটার সেটআপ বা সার্ভার রুম লাগবে কি? (Hardware Requirements)',
                enQ: 'What physical devices or hardware do we need on campus?',
                a: 'কোনো নিজস্ব সার্ভার বা অতিরিক্ত আইটি ইনফ্রাস্ট্রাকচারের প্রয়োজন নেই। এটি সম্পূর্ণ আধুনিক ক্লাউড সফটওয়্যার। সাধারণ ল্যাপটপ, কম্পিউটার, এমনকি স্মার্টফোন বা ট্যাবে ইন্টারনেট সংযোগ থাকলেই পুরো ক্যাম্পাস পরিচালনা করা যায়। আর বায়োমেট্রিক হাজিরার জন্য সরাসরি ZKTeco ফিঙ্গারপ্রিন্ট বা RFID কার্ড ডিভাইস প্লাগ-অ্যান্ড-প্লে কাজ করে।'
              },
              {
                id: 5,
                category: 'multitenant',
                q: 'মাল্টি-টেন্যান্ট সিস্টেমে আমাদের প্রতিষ্ঠানের তথ্যের গোপনীয়তা কীভাবে সংরক্ষিত থাকে? (Data Isolation & Privacy)',
                enQ: 'How does the multi-tenant architecture ensure our institution\'s data remains completely private?',
                a: 'প্রতিটি প্রতিষ্ঠান নিজস্ব সম্পূর্ণ বিচ্ছিন্ন লজিক্যাল টেন্যান্ট স্যান্ডবক্সে পরিচালিত হয়। আপনার প্রতিষ্ঠানের শিক্ষার্থী তথ্য, পরীক্ষার ফলাফল বা আর্থিক হিসাব অন্য কোনো প্রতিষ্ঠানের সাথে শেয়ার হওয়া প্রযুক্তিগতভাবে অসম্ভব। সমস্ত ডেটা ব্যাংক-গ্রেড ২৫৬-বিট এসএসএল এনক্রিপশনের মাধ্যমে সম্পূর্ণ সুরক্ষিত।'
              },
              {
                id: 6,
                category: 'multitenant',
                q: 'আমরা কি আমাদের নিজস্ব কাস্টম ডোমেন (যেমন: www.yourschool.edu.bd) ব্যবহার করতে পারব?',
                enQ: 'Can our institution use its own custom domain (e.g., www.ourschool.edu.bd)?',
                a: 'হ্যাঁ, অবশ্যই! প্রতিটি প্রতিষ্ঠানকে সংযুক্ত হওয়ার সাথে সাথে একটি ফ্রি সাবডোমেন (যেমন: yourschool.smartamarschool.com) দেওয়া হয়। এছাড়া আপনার প্রতিষ্ঠানের নিজস্ব অফিসিয়াল `.edu.bd` বা `.org` কাস্টম ডোমেন থাকলে তা মাত্র ২ মিনিটে প্ল্যাটফর্মে অটোমেটিক এসএসএল সার্টিফিকেটসহ কানেক্ট করে নিতে পারবেন।'
              },
              {
                id: 7,
                category: 'multitenant',
                q: 'একটি ট্রাস্ট বা গভর্নিং বডির অধীনে একাধিক শাখা পরিচালনা করা সম্ভব কি? (Multi-Branch Management)',
                enQ: 'Can an educational board, trust, or group of institutions manage multiple branches centrally?',
                a: 'হ্যাঁ! আমাদের সুপার অ্যাডমিন ও মাল্টি-টেন্যান্ট আর্কিটেকচার এমনভাবে প্রস্তুত যে ট্রাস্টি বা গভর্নিং বডি এক ক্লিকেই সমস্ত ব্রাঞ্চের সম্মিলিত উপস্থিতি ও আর্থিক আয়-ব্যয় রিপোর্ট দেখতে পারেন, অথচ প্রতিটি শাখার প্রধান শিক্ষক শুধুমাত্র তার নিজস্ব ব্রাঞ্চের স্বাধীন পরিচালনা করতে পারেন।'
              },
              {
                id: 8,
                category: 'multitenant',
                q: 'শিক্ষার্থীদের দেওয়া ফি-র টাকা কোথায় জমা হয় এবং কীভাবে পরিশোধ হয়? (Payment Gateway Settlement)',
                enQ: 'Where do parents\' online fee payments go, and how is financial security maintained?',
                a: 'অভিভাবকরা বিকাশ, নগদ, রকেট বা ডেবিট/ক্রেডিট কার্ডে ফি পরিশোধ করামাত্র সেই টাকা সরাসরি আপনার প্রতিষ্ঠানের নিজস্ব মার্চেন্ট বা ব্যাংক অ্যাকাউন্টে জমা হয়। প্ল্যাটফর্ম কোনো মধ্যস্থতাকারী হিসেবে টাকা আটকে রাখে না; সাথে সাথে ডিজিটাল রশিদ জেনারেট হয়ে অভিভাবকদের মোবাইলে এসএমএস ও ইমেইলে পৌঁছে যায়।'
              },
              {
                id: 9,
                category: 'onboarding',
                q: 'ভবিষ্যতে প্রয়োজন হলে কি আমরা আমাদের সব ডেটা ডাউনলোড বা ব্যাকআপ নিতে পারব? (Zero Vendor Lock-in)',
                enQ: 'Can we export our data if we ever need physical backups or wish to migrate?',
                a: 'হ্যাঁ, আপনার প্রতিষ্ঠানের ডেটার শতভাগ মালিকানা শুধুই আপনার। আপনি যেকোনো সময় সম্পূর্ণ শিক্ষার্থী প্রোফাইল, টেবুলেশন শিট, হাজিরা রিপোর্ট ও আর্থিক অডিট লেজার এক্সেল (Excel/CSV) অথবা প্রিন্টেবল অফিসিয়াল PDF ফরম্যাটে এক ক্লিকেই ডাউনলোড করে নিতে পারবেন।'
              }
            ]
              .filter(item => faqCategory === 'all' || item.category === faqCategory)
              .map((faq, index) => {
                const isOpen = openPricingFaq === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:border-indigo-300 transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenPricingFaq(isOpen ? null : faq.id)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 hover:text-indigo-600 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono shrink-0 ${isOpen ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          {index + 1}
                        </span>
                        <div>
                          <span>{faq.q}</span>
                          <span className="block text-xs font-normal text-slate-400 mt-0.5">{faq.enQ}</span>
                        </div>
                      </div>
                      {isOpen ? (
                        <ChevronUp size={20} className="shrink-0 text-indigo-600" />
                      ) : (
                        <ChevronDown size={20} className="shrink-0 text-slate-400" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/60">
                        <div className="flex items-start gap-2 pt-2">
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                          <div>{faq.a}</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Need More Assistance Banner */}
          <div className="mt-8 max-w-4xl mx-auto p-5 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <h5 className="text-xs sm:text-sm font-black text-indigo-950">আপনার কি বিশেষ কোনো প্রশ্ন বা কাস্টম রিকোয়ারমেন্ট আছে?</h5>
              <p className="text-xs text-indigo-700 mt-0.5">আমাদের টেকনিক্যাল সাপোর্ট টিম সবসময় আপনার প্রশ্নের উত্তর দিতে প্রস্তুত রয়েছে।</p>
            </div>
            <Link
              to="/contact"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 shadow-sm transition-all"
            >
              সরাসরি যোগাযোগ করুন
            </Link>
          </div>
        </div>
      </div>
    </div>
  </PublicLayout>
)};

// --- Contact Page ---
export const Contact = () => (
  <PublicLayout>
    <div className="bg-white">
      {/* Hero Header */}
      <div className="relative bg-slate-900 py-24 sm:py-32">
          <div className="absolute inset-x-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
             <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
          </div>
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">Get in touch</h1>
              <p className="mt-6 text-lg leading-8 text-slate-300 max-w-2xl mx-auto">
                  Our friendly team is always here to chat. Whether you have a question about features like Biometrics, SMS, or Payments.
              </p>
          </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Contact Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="hover:shadow-md transition-all">
                    <div className="p-3 bg-indigo-50 rounded-lg inline-block mb-4">
                        <MessageCircle className="w-6 h-6 text-indigo-600"/>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">Chat to sales</h3>
                    <p className="text-sm text-slate-500 mb-2">Speak to our friendly team.</p>
                    <a href="mailto:sales@smartamarschool.com" className="text-sm font-semibold text-indigo-600 hover:underline">sales@smartamarschool.com</a>
                </Card>
                <Card className="hover:shadow-md transition-all">
                    <div className="p-3 bg-green-50 rounded-lg inline-block mb-4">
                        <HelpCircle className="w-6 h-6 text-green-600"/>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">Chat to support</h3>
                    <p className="text-sm text-slate-500 mb-2">We're here to help.</p>
                    <a href="mailto:support@smartamarschool.com" className="text-sm font-semibold text-indigo-600 hover:underline">support@smartamarschool.com</a>
                </Card>
                <Card className="hover:shadow-md transition-all">
                    <div className="p-3 bg-yellow-50 rounded-lg inline-block mb-4">
                        <MapPin className="w-6 h-6 text-yellow-600"/>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">Visit us</h3>
                    <p className="text-sm text-slate-500 mb-2">Visit our office HQ.</p>
                    <p className="text-sm font-semibold text-slate-700">Level 4, Sheikh Hasina Software Technology Park, Jashore</p>
                </Card>
                <Card className="hover:shadow-md transition-all">
                    <div className="p-3 bg-red-50 rounded-lg inline-block mb-4">
                        <Phone className="w-6 h-6 text-red-600"/>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">Call us</h3>
                    <p className="text-sm text-slate-500 mb-2">Mon-Fri from 9am to 6pm.</p>
                    <a href="tel:+8801712345678" className="text-sm font-semibold text-indigo-600 hover:underline">+880 1712 345 678</a>
                </Card>
            </div>

            {/* Styled Map Placeholder */}
            <div className="mt-8 rounded-2xl overflow-hidden h-64 relative bg-slate-200 shadow-inner group cursor-pointer">
                <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/Map_of_Dhaka_City_Corporation.svg')] bg-cover opacity-20 transition-opacity group-hover:opacity-30"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg flex items-center gap-2 transform transition-transform group-hover:scale-105">
                        <MapPin className="text-red-500 w-5 h-5 animate-bounce"/>
                        <span className="font-semibold text-slate-800">View on Google Maps</span>
                    </div>
                </div>
            </div>
          </div>

          <Card className="p-8 shadow-xl border-t-4 border-t-indigo-600 h-fit">
             <div className="mb-6">
                 <h3 className="text-xl font-bold text-slate-900">Send us a message</h3>
                 <p className="text-sm text-slate-500">We will get back to you within 24 hours.</p>
             </div>
             <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
               <div className="grid grid-cols-2 gap-4">
                 <Input label="First Name" placeholder="John" />
                 <Input label="Last Name" placeholder="Doe" />
               </div>
               <Input label="Email Address" type="email" placeholder="john@school.edu" />
               <Input label="Phone Number" placeholder="+880..." />
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Institution Name</label>
                 <Input placeholder="e.g. Dhaka Model School" className="mb-0"/>
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                 <textarea className="w-full px-3 py-2 border border-slate-200 rounded-lg h-32 resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50 transition-colors" placeholder="Tell us about your requirements..."></textarea>
               </div>
               <Button type="submit" className="w-full h-12 text-base shadow-lg shadow-indigo-200">Send Message</Button>
             </form>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-24 border-t border-slate-200 pt-16">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-12">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 max-w-4xl mx-auto">
                <div>
                    <h3 className="font-bold text-slate-900 flex gap-2 items-center"><Fingerprint size={18} className="text-indigo-600"/> Does it support ZKTeco Devices?</h3>
                    <p className="mt-2 text-sm text-slate-600">Yes, our software has direct API integration with most ZKTeco biometric devices for real-time attendance push.</p>
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 flex gap-2 items-center"><CreditCard size={18} className="text-indigo-600"/> How does the Payment Gateway work?</h3>
                    <p className="mt-2 text-sm text-slate-600">We integrate bKash, Nagad, and Rocket directly into the Student App. Fees paid are instantly reconciled in the Accounts module.</p>
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 flex gap-2 items-center"><MessageCircle size={18} className="text-indigo-600"/> Can we send SMS with our School Name?</h3>
                    <p className="mt-2 text-sm text-slate-600">Yes, we support Masking SMS (Non-masking also available). You can send results, attendance alerts, and notices with your brand name.</p>
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 flex gap-2 items-center"><Server size={18} className="text-indigo-600"/> Is my data secure?</h3>
                    <p className="mt-2 text-sm text-slate-600">Absolutely. We use isolated databases for each institution and enterprise-grade encryption to ensure your data remains private and secure.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  </PublicLayout>
);

// --- Login Page (SmartAmarSchool Design System) ---
export const Login = () => {
  const navigate = useNavigate();
  const { login, loginAsSchoolAdmin, loginAsStudent, loginAsParent, loginAsTeacher } = useAuth();
  const tenants = getStoredTenants();
  
  const [selectedRole, setSelectedRole] = useState<'admin' | 'superadmin' | 'teacher' | 'student' | 'parent'>('admin');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [copiedField, setCopiedField] = useState<'username' | 'password' | 'both' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotInput, setForgotInput] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Quick switch role tab and auto-fill corresponding demo credentials
  const handleRoleSelect = (roleKey: 'admin' | 'superadmin' | 'teacher' | 'student' | 'parent') => {
    setSelectedRole(roleKey);
    setErrorMessage('');
    if (roleKey === 'admin') {
      setUsername('admin');
      setPassword('123456');
    } else if (roleKey === 'superadmin') {
      setUsername('superadmin');
      setPassword('123456');
    } else if (roleKey === 'teacher') {
      setUsername('abdul@school.edu');
      setPassword('123456');
    } else if (roleKey === 'student') {
      setUsername('101');
      setPassword('123456');
    } else if (roleKey === 'parent') {
      setUsername('01711111111');
      setPassword('123456');
    }
  };

  const handleCopy = (field: 'username' | 'password', val: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(val);
    setCopiedField(field);
    if (field === 'username') setUsername(val);
    if (field === 'password') setPassword(val);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const handleCopyBoth = () => {
    if (selectedRole === 'admin') {
      setUsername('admin');
      setPassword('123456');
    } else if (selectedRole === 'superadmin') {
      setUsername('superadmin');
      setPassword('123456');
    } else if (selectedRole === 'teacher') {
      setUsername('abdul@school.edu');
      setPassword('123456');
    } else if (selectedRole === 'student') {
      setUsername('101');
      setPassword('123456');
    } else if (selectedRole === 'parent') {
      setUsername('01711111111');
      setPassword('123456');
    }
    setCopiedField('both');
    setTimeout(() => setCopiedField(null), 1800);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    setTimeout(() => {
      // 1. Super Admin
      if (cleanUser === 'superadmin' || cleanUser === 'super' || cleanUser === 'admin@demo.com' || selectedRole === 'superadmin') {
        login('superadmin');
        setSuccessMessage('Super Admin হিসেবে সফলভাবে লগইন হয়েছে! কন্ট্রোল প্যানেলে প্রবেশ করা হচ্ছে...');
        setTimeout(() => navigate('/super-admin'), 350);
        return;
      }

      // 2. Teacher
      if (cleanUser.includes('teacher') || cleanUser === 'abdul@school.edu' || selectedRole === 'teacher') {
        const result = loginAsTeacher(cleanUser || 'abdul@school.edu', cleanPass, 'dcc');
        if (result.success) {
          setSuccessMessage(result.message);
          setTimeout(() => navigate('/teacher/dashboard'), 350);
        } else {
          login('teacher');
          setSuccessMessage('শিক্ষক পোর্টালে স্বাগতম!');
          setTimeout(() => navigate('/teacher/dashboard'), 350);
        }
        return;
      }

      // 3. Student
      if (cleanUser.includes('student') || cleanUser === '101' || selectedRole === 'student') {
        const result = loginAsStudent(cleanUser || '101', cleanPass, 'dcc');
        if (result.success) {
          setSuccessMessage(result.message);
          setTimeout(() => navigate('/student/dashboard'), 350);
        } else {
          loginAsStudent('101', '123456', 'dcc');
          setSuccessMessage('শিক্ষার্থী পোর্টালে স্বাগতম!');
          setTimeout(() => navigate('/student/dashboard'), 350);
        }
        return;
      }

      // 4. Parent
      if (cleanUser.includes('parent') || cleanUser === '01711111111' || selectedRole === 'parent') {
        const result = loginAsParent(cleanUser || '01711111111', cleanPass, 'dcc');
        if (result.success) {
          setSuccessMessage(result.message);
          setTimeout(() => navigate('/parent/dashboard'), 350);
        } else {
          loginAsParent('01711111111', '123456', 'dcc');
          setSuccessMessage('অভিভাবক পোর্টালে স্বাগতম!');
          setTimeout(() => navigate('/parent/dashboard'), 350);
        }
        return;
      }

      // 5. Default: School Administrator
      const targetTenant = tenants[0] || { subdomain: 'dcc', name: 'Dhaka Central College' };
      const result = loginAsSchoolAdmin(targetTenant.subdomain, {
        name: 'Principal Rafiq',
        email: cleanUser.includes('@') ? cleanUser : `principal@${targetTenant.subdomain}.edu.bd`
      });
      setSuccessMessage(result.message || 'এডমিন হিসেবে সফলভাবে লগইন হয়েছে! ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...');
      setTimeout(() => navigate('/school'), 350);
    }, 350);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotInput) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setForgotSuccess(false);
      setIsForgotPasswordOpen(false);
      setForgotInput('');
    }, 2200);
  };

  // Roles metadata
  const rolesList = [
    { id: 'admin' as const, label: 'স্কুল এডমিন', icon: Building2, defaultUser: 'admin', defaultPass: '123456', desc: 'প্রতিষ্ঠান প্রধান ও প্রশাসনিক একাউন্ট' },
    { id: 'superadmin' as const, label: 'সুপার এডমিন', icon: Globe, defaultUser: 'superadmin', defaultPass: '123456', desc: 'মেইন SaaS ক্লাউড কন্ট্রোল প্যানেল' },
    { id: 'teacher' as const, label: 'শিক্ষক', icon: Users, defaultUser: 'abdul@school.edu', defaultPass: '123456', desc: 'হাজিরা, নম্বর এন্ট্রি ও ডায়েরি' },
    { id: 'student' as const, label: 'শিক্ষার্থী', icon: GraduationCap, defaultUser: '101', defaultPass: '123456', desc: 'রেজাল্ট, রুটিন ও নোটিশ বোর্ড' },
    { id: 'parent' as const, label: 'অভিভাবক', icon: User, defaultUser: '01711111111', defaultPass: '123456', desc: 'ফি প্রদান ও শিক্ষার্থীর অগ্রগতি' },
  ];

  const currentRoleInfo = rolesList.find(r => r.id === selectedRole) || rolesList[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between relative isolate overflow-x-hidden selection:bg-indigo-600 selection:text-white">
      {/* Background Ambient Glows (SmartAmarSchool SaaS style) */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl pointer-events-none sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-500/20 to-purple-500/25 opacity-70 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
      </div>
      <div className="absolute right-0 bottom-0 -z-10 transform-gpu overflow-hidden blur-3xl pointer-events-none">
        <div className="aspect-[800/600] w-[30rem] bg-gradient-to-bl from-blue-400/15 to-indigo-500/20 opacity-60"></div>
      </div>

      {/* Brand Top Header Navigation */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-md shadow-indigo-200 group-hover:bg-indigo-700 transition-colors">
              S
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
                Smart<span className="text-indigo-600">Amar</span>School
              </span>
              <span className="text-[10px] text-slate-500 font-medium -mt-0.5">Education Management Platform</span>
            </div>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-6 text-xs sm:text-sm font-medium text-slate-600">
            <Link to="/" className="hidden sm:inline-block hover:text-indigo-600 transition-colors">
              হোমপেজ
            </Link>
            <Link to="/institutions" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
              <School size={15} />
              <span>প্রতিষ্ঠানসমূহ</span>
            </Link>
            <Link to="/pricing" className="hidden md:inline-block hover:text-indigo-600 transition-colors">
              প্যাকেজসমূহ
            </Link>
            <Link to="/contact" className="hidden md:inline-block hover:text-indigo-600 transition-colors">
              যোগাযোগ
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12 lg:px-8">
        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl shadow-indigo-950/10 border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative">
          
          {/* LEFT COLUMN: SmartAmarSchool Core Brand Showcase (Indigo SaaS Aesthetics) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Subtle Grid Accent Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
            
            {/* Ambient Violet Glow */}
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-indigo-200 mb-6">
                <ShieldCheck size={13} className="text-indigo-400" />
                <span>Smart Amar School Cloud OS</span>
              </div>

              {/* Title */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-indigo-500/40">
                  S
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-white leading-tight">
                    Smart Amar School
                  </h1>
                  <p className="text-xs text-indigo-200">স্মার্ট শিক্ষা ব্যবস্থাপনা সমাধান</p>
                </div>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed mb-8">
                স্কুল, কলেজ ও মাদরাসা পরিচালনার আধুনিক প্ল্যাটফর্ম। ভর্তি, ফলাফল, উপস্থিতি, হিসাব ও অনলাইন পেমেন্ট সব এখন এক জায়গায়।
              </p>

              {/* Key Platform Highlights */}
              <div className="space-y-3.5 mb-8">
                <div className="flex items-start gap-3 bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-xs">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Server size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">মাল্টি-টেন্যান্ট ক্লাউড সিস্টেম</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">প্রতিটি প্রতিষ্ঠানের জন্য নিজস্ব সাবডোমেন ও সুরক্ষিত ডাটাবেস।</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">অটোমেটেড রেজাল্ট ও গ্রেডিং</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">জিপিএ হিসাব, মেধাতালিকা ও এক ক্লিকে আকর্ষণীয় মার্কশিট প্রিন্ট।</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-xs">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CreditCard size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">অনলাইন ফি ও হিসাব কালেকশন</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">বিকাশ ও রকেট গেটওয়ে, অটো এসএমএস ও ডিজিটাল রসিদ।</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Institutional Trust Metric */}
            <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-indigo-200">
              <span className="flex items-center gap-1.5">
                <CheckCircle size={13} className="text-emerald-400" />
                <span>৯৯.৯% ক্লাউড আপটাইম</span>
              </span>
              <span>v3.2 Cloud Edition</span>
            </div>
          </div>

          {/* RIGHT COLUMN: Modern Smart Sign-in Panel */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white">
            
            {/* Header info */}
            <div className="mb-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    পোর্টাল লগইন
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Smart Amar School একাউন্টে প্রবেশ করতে তথ্য দিন
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold">
                  <Lock size={13} />
                  <span>এসএসএল এনক্রিপ্টেড</span>
                </div>
              </div>
            </div>

            {/* Role Switcher Tabs */}
            <div className="mb-5">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                লগইন রোল নির্বাচন করুন:
              </div>
              <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                {rolesList.map((r) => {
                  const Icon = r.icon;
                  const isActive = selectedRole === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleRoleSelect(r.id)}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                      }`}
                    >
                      <Icon size={16} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                      <span className="mt-1 truncate max-w-full">{r.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* One-Click Quick Demo Box (Stylized in SmartAmarSchool Indigo & Slate) */}
            <div 
              onClick={handleCopyBoth}
              title="ক্লিক করে তথ্যগুলো অটো-ফিল করুন"
              className="border border-indigo-100 bg-indigo-50/60 hover:bg-indigo-50 rounded-2xl p-3.5 mb-5 cursor-pointer transition-colors group"
            >
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
                  <Sparkles size={14} className="text-indigo-600 fill-indigo-600/20" />
                  <span>কুইক ডেমো তথ্য ({currentRoleInfo.label}):</span>
                </div>
                <span className="text-[11px] font-bold text-indigo-600 group-hover:underline flex items-center gap-1">
                  <span>অটো-ফিল করুন</span>
                  <ArrowRight size={12} />
                </span>
              </div>

              <div className="text-xs text-slate-700 font-medium flex items-center gap-2 flex-wrap bg-white/80 rounded-xl p-2 border border-indigo-100/70">
                <span className="flex items-center gap-1">
                  <span className="text-slate-500">ইউজার:</span>
                  <strong className="text-slate-900 font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                    {currentRoleInfo.defaultUser}
                  </strong>
                  <button
                    type="button"
                    onClick={(e) => handleCopy('username', currentRoleInfo.defaultUser, e)}
                    className="p-1 hover:bg-indigo-100 rounded text-indigo-600 transition-colors"
                    title="ইউজারনেম কপি করুন"
                  >
                    {copiedField === 'username' || copiedField === 'both' ? (
                      <Check size={12} className="text-emerald-600" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                </span>

                <span className="text-slate-300">|</span>

                <span className="flex items-center gap-1">
                  <span className="text-slate-500">পাসওয়ার্ড:</span>
                  <strong className="text-slate-900 font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                    {currentRoleInfo.defaultPass}
                  </strong>
                  <button
                    type="button"
                    onClick={(e) => handleCopy('password', currentRoleInfo.defaultPass, e)}
                    className="p-1 hover:bg-indigo-100 rounded text-indigo-600 transition-colors"
                    title="পাসওয়ার্ড কপি করুন"
                  >
                    {copiedField === 'password' || copiedField === 'both' ? (
                      <Check size={12} className="text-emerald-600" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                </span>

                {copiedField && (
                  <span className="text-[10px] text-emerald-600 font-bold ml-auto flex items-center gap-1">
                    <Check size={11} /> পূরণ হয়েছে!
                  </span>
                )}
              </div>
            </div>

            {/* Error & Success Alerts */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2 animate-in fade-in">
                <AlertTriangle size={15} className="text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2 animate-in fade-in">
                <CheckCircle size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ইউজারনেম, ইমেইল অথবা রোল আইডি
                </label>
                <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-600/10 focus-within:bg-white transition-all">
                  <User className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. admin or username"
                    className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none font-medium"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  পাসওয়ার্ড
                </label>
                <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-600/10 focus-within:bg-white transition-all">
                  <Key className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none ml-2 shrink-0 p-0.5"
                    title={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Options Row: Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1 pb-1">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 accent-indigo-600"
                  />
                  <span>মনে রাখুন</span>
                </label>

                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                >
                  পাসওয়ার্ড ভুলে গেছেন?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl text-sm shadow-lg shadow-indigo-200 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 mt-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>যাচাই করা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={16} />
                    <span>লগইন করুন ({currentRoleInfo.label})</span>
                  </>
                )}
              </button>
            </form>

            {/* Bottom info */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>লাইসেন্স: <strong className="text-slate-700 font-semibold">SmartAmarSchool</strong></span>
              <Link to="/institutions" className="text-indigo-600 hover:underline font-medium flex items-center gap-1">
                <span>সকল প্রতিষ্ঠান</span>
                <ArrowRight size={11} />
              </Link>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        <p>© 2026 Smart Amar School System. সর্বস্বত্ব সংরক্ষিত।</p>
      </footer>

      {/* Floating Support Chat Button */}
      <button
        type="button"
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 w-13 h-13 sm:w-14 sm:h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-300 flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-40 cursor-pointer focus:outline-none"
        title="Smart Amar School হেল্প ও সাপোর্ট"
      >
        <MessageSquare className="w-6 h-6 fill-white" />
      </button>

      {/* Instant Support Drawer / Modal */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-[340px] max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in slide-in-from-bottom-5">
          <div className="bg-indigo-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold text-sm">
                S
              </div>
              <div>
                <h4 className="font-bold text-sm leading-none">Smart Amar School Support</h4>
                <p className="text-[11px] text-indigo-100 mt-0.5">অনলাইন হেল্প ডেস্ক • সবসময় প্রস্তুত</p>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-4 space-y-3 max-h-[360px] overflow-y-auto text-xs">
            <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none text-slate-800 leading-relaxed">
              স্বাগতম! Smart Amar School-এ আপনাকে সাহায্য করার জন্য আমরা আছি। লগইন করতে কোনো সমস্যা হলে নিচে ডেমো তথ্য নির্বাচন করুন।
            </div>

            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">দ্রুত সহায়তা:</p>
              <button
                onClick={() => { handleRoleSelect('admin'); setIsChatOpen(false); }}
                className="w-full text-left p-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-indigo-900 font-semibold transition-colors flex items-center justify-between"
              >
                <span>⚡ স্কুল এডমিন ডেমো পূরণ করুন</span>
                <span className="text-[10px] text-indigo-600 font-mono">admin / 123456</span>
              </button>
              <a
                href="mailto:support@smartamarschool.com"
                className="block text-center p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-medium"
              >
                ✉️ ইমেইল: support@smartamarschool.com
              </a>
              <a
                href="tel:+8801712345678"
                className="block text-center p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-medium"
              >
                📞 হটলাইন: +880 1712 345 678
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 relative animate-in zoom-in-95">
            <button
              onClick={() => setIsForgotPasswordOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={18} />
            </button>

            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <Key size={20} />
            </div>

            <h3 className="text-lg font-bold text-slate-900">পাসওয়ার্ড রিসেট</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
              আপনার নিবন্ধিত ইউজারনেম বা প্রাতিষ্ঠানিক ইমেইল দিন। পাসওয়ার্ড রিসেট নির্দেশাবলী পাঠিয়ে দেওয়া হবে।
            </p>

            {forgotSuccess ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-600" />
                <span>রিসেট নির্দেশাবলী পাঠানো হয়েছে! ইনবক্স চেক করুন।</span>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <input
                  type="text"
                  required
                  value={forgotInput}
                  onChange={(e) => setForgotInput(e.target.value)}
                  placeholder="Username or email@domain.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                />
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-200"
                >
                  রিসেট লিংক পাঠান
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};



// --- Proposal Page ---
export const Proposal = () => (
  <PublicLayout>
    <div className="py-16 bg-white">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-4">Smart Amar School SaaS</h1>
            <p className="text-xl text-indigo-600 font-semibold">Digitizing 150,000+ Institutions in South Asia</p>
            <div className="mt-4 flex justify-center gap-2">
                <Badge color="blue">Series A</Badge>
                <Badge color="green">B2B SaaS</Badge>
                <Badge color="yellow">EdTech</Badge>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="col-span-2 border-l-4 border-indigo-500">
                <h3 className="text-xl font-bold text-slate-800 mb-3">Executive Summary</h3>
                <p className="text-slate-600 leading-relaxed">
                    Smart Amar School is a cloud-native, multi-tenant SaaS platform designed to bridge the digital divide in the education sector of Bangladesh and South Asia. 
                    By replacing expensive, fragmented legacy software with an affordable ($20/mo) all-in-one solution, we aim to capture 5% of the market within 3 years.
                    Our architecture supports instant deployment (2 minutes) for any School, College, or Madrasa.
                </p>
            </Card>
            <Card className="border-l-4 border-red-500">
                <h3 className="text-xl font-bold text-slate-800 mb-3">The Problem</h3>
                <ul className="space-y-3 text-slate-600 text-sm">
                    <li className="flex items-start gap-2"><ArrowRight size={16} className="mt-1 text-red-500"/> High infrastructure cost ($2000+) for standalone ERPs.</li>
                    <li className="flex items-start gap-2"><ArrowRight size={16} className="mt-1 text-red-500"/> Fragmentation: Separate tools for Fees, SMS, and Results.</li>
                    <li className="flex items-start gap-2"><ArrowRight size={16} className="mt-1 text-red-500"/> Lack of technical expertise in rural institutions.</li>
                </ul>
            </Card>
        </div>

        <div className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b pb-2">The Solution: Multi-Tenant Architecture</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: "Instant Deployment", desc: "Automated subdomain creation (school.app.com) in 120 seconds.", icon: Zap },
                    { title: "Cost Efficiency", desc: "Shared infrastructure reduces per-tenant cost by 90%.", icon: PieChart },
                    { title: "Data Isolation", desc: "Strict database-level isolation ensures privacy & security.", icon: Shield },
                    { title: "Modular Growth", desc: "Schools enable modules (HR, Transport) as they grow.", icon: Layers },
                ].map((item, i) => (
                    <div key={i} className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <item.icon className="w-8 h-8 text-indigo-600 mb-3" />
                        <h4 className="font-bold text-slate-800 mb-1">{item.title}</h4>
                        <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b pb-2">Business Model & Pricing</h2>
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                        <div>
                            <h4 className="font-bold text-slate-800">Basic Plan</h4>
                            <p className="text-sm text-slate-500">Core Modules, 500 Students</p>
                        </div>
                        <div className="text-right">
                            <h3 className="text-xl font-bold text-indigo-600">$20<span className="text-sm font-normal text-slate-400">/mo</span></h3>
                        </div>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-indigo-50 border border-indigo-200 rounded-lg shadow-sm">
                        <div>
                            <h4 className="font-bold text-slate-800">Standard Plan</h4>
                            <p className="text-sm text-slate-500">Accounts, SMS, 2000 Students</p>
                        </div>
                        <div className="text-right">
                            <h3 className="text-xl font-bold text-indigo-600">$50<span className="text-sm font-normal text-slate-400">/mo</span></h3>
                        </div>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                        <div>
                            <h4 className="font-bold text-slate-800">Premium Plan</h4>
                            <p className="text-sm text-slate-500">White-label, Custom Domain</p>
                        </div>
                        <div className="text-right">
                            <h3 className="text-xl font-bold text-indigo-600">$100<span className="text-sm font-normal text-slate-400">/mo</span></h3>
                        </div>
                    </div>
                </div>
            </div>
            
            <div>
                 <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b pb-2">Revenue Streams</h2>
                 <ul className="space-y-4">
                     <li className="flex gap-4">
                         <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold shrink-0">1</div>
                         <div>
                             <h4 className="font-bold text-slate-800">SaaS Subscriptions</h4>
                             <p className="text-sm text-slate-500">Recurring Monthly/Yearly revenue from institutions.</p>
                         </div>
                     </li>
                     <li className="flex gap-4">
                         <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">2</div>
                         <div>
                             <h4 className="font-bold text-slate-800">Fintech Commissions</h4>
                             <p className="text-sm text-slate-500">1.5% transaction fee on online fee payments via our gateway.</p>
                         </div>
                     </li>
                     <li className="flex gap-4">
                         <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold shrink-0">3</div>
                         <div>
                             <h4 className="font-bold text-slate-800">Hardware Sales</h4>
                             <p className="text-sm text-slate-500">One-time margin on Biometric Devices & ID Card Printers.</p>
                         </div>
                     </li>
                 </ul>
            </div>
        </div>

        <Card className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4 mx-6 mt-2">Financial Projections (3 Years)</h2>
            <div className="overflow-x-auto px-6 pb-6">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-bold text-gray-900">Metric</th>
                    <th className="px-3 py-3.5 text-left text-sm font-bold text-gray-900">Year 1</th>
                    <th className="px-3 py-3.5 text-left text-sm font-bold text-gray-900">Year 2</th>
                    <th className="px-3 py-3.5 text-left text-sm font-bold text-gray-900">Year 3</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  <tr><td className="whitespace-nowrap py-4 pl-4 text-sm font-medium text-slate-600">Active Institutions</td><td className="px-3 py-4 text-sm font-bold">200</td><td className="px-3 py-4 text-sm font-bold">850</td><td className="px-3 py-4 text-sm font-bold">2,500</td></tr>
                  <tr><td className="whitespace-nowrap py-4 pl-4 text-sm font-medium text-slate-600">Annual Recurring Revenue (ARR)</td><td className="px-3 py-4 text-sm font-bold text-indigo-600">$120,000</td><td className="px-3 py-4 text-sm font-bold text-indigo-600">$510,000</td><td className="px-3 py-4 text-sm font-bold text-indigo-600">$1,800,000</td></tr>
                  <tr><td className="whitespace-nowrap py-4 pl-4 text-sm font-medium text-slate-600">Fintech GMV (Throughput)</td><td className="px-3 py-4 text-sm font-bold">$2M</td><td className="px-3 py-4 text-sm font-bold">$10M</td><td className="px-3 py-4 text-sm font-bold">$35M</td></tr>
                  <tr><td className="whitespace-nowrap py-4 pl-4 text-sm font-medium text-slate-600">Net Profit Margin</td><td className="px-3 py-4 text-sm text-red-500 font-bold">-15%</td><td className="px-3 py-4 text-sm text-green-600 font-bold">12%</td><td className="px-3 py-4 text-sm text-green-600 font-bold">35%</td></tr>
                </tbody>
              </table>
            </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div>
                 <h2 className="text-xl font-bold text-slate-900 mb-4">Go-to-Market Strategy</h2>
                 <ul className="list-disc list-inside space-y-2 text-slate-600 text-sm">
                     <li><strong>Direct Sales:</strong> Field agents targeting district-level top schools.</li>
                     <li><strong>Partnerships:</strong> Collaboration with ISPs and Computer Hardware vendors.</li>
                     <li><strong>Freemium:</strong> Free "Result Processing" module to capture initial data.</li>
                     <li><strong>Govt. Liaison:</strong> Integration with Education Board APIs for seamless compliance.</li>
                 </ul>
            </div>
            <div>
                 <h2 className="text-xl font-bold text-slate-900 mb-4">Competitive Advantage</h2>
                 <div className="space-y-3">
                     <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                         <CheckCircle className="text-green-600 w-5 h-5" />
                         <span className="text-sm font-medium">Native Bengali/English Support</span>
                     </div>
                     <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                         <CheckCircle className="text-green-600 w-5 h-5" />
                         <span className="text-sm font-medium">Offline-First Mobile App</span>
                     </div>
                     <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                         <CheckCircle className="text-green-600 w-5 h-5" />
                         <span className="text-sm font-medium">Local Payment Gateway Integration (bKash, Nagad)</span>
                     </div>
                 </div>
            </div>
        </div>

        <div className="bg-slate-900 text-white rounded-2xl p-10 text-center">
            <h2 className="text-3xl font-bold mb-4">Join Us in Revolutionizing Education</h2>
            <p className="text-slate-300 max-w-2xl mx-auto mb-8">We are raising $500k in Seed funding to accelerate product development and expand our sales team across 64 districts.</p>
            <div className="flex justify-center gap-4">
                <Button className="bg-white text-slate-900 hover:bg-slate-100">Download Full Deck</Button>
                <Button variant="secondary" className="bg-transparent border-slate-600 text-white hover:bg-slate-800 hover:text-white">Contact Founders</Button>
            </div>
        </div>
      </div>
    </div>
  </PublicLayout>
);