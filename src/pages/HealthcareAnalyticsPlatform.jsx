import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, ScatterPlot, Scatter } from 'recharts';
import { Activity, Users, Clock, TrendingUp, AlertTriangle, Database, Server, BarChart3, Heart } from 'lucide-react';

const HealthcareAnalyticsPlatform = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [patientData, setPatientData] = useState([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    activePatients: 1247,
    avgLOS: 4.2,
    readmissionRate: 12.5,
    satisfactionScore: 8.7
  });

  // Simulate real-time data updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setRealTimeMetrics(prev => ({
        ...prev,
        activePatients: prev.activePatients + Math.floor(Math.random() * 10) - 5,
        avgLOS: +(prev.avgLOS + (Math.random() - 0.5) * 0.1).toFixed(1),
        readmissionRate: +(prev.readmissionRate + (Math.random() - 0.5) * 0.2).toFixed(1),
        satisfactionScore: +(prev.satisfactionScore + (Math.random() - 0.5) * 0.1).toFixed(1)
      }));
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  // Generate synthetic patient journey data
  useEffect(() => {
    const generatePatientData = () => {
      const patients = [];
      const departments = ['Emergency', 'Cardiology', 'Oncology', 'Orthopedics', 'Neurology', 'ICU'];
      const outcomes = ['Discharged', 'Transferred', 'Readmitted', 'Ongoing'];
      
      for (let i = 0; i < 100; i++) {
        patients.push({
          id: `P${String(i + 1).padStart(4, '0')}`,
          age: Math.floor(Math.random() * 80) + 20,
          gender: Math.random() > 0.5 ? 'Male' : 'Female',
          department: departments[Math.floor(Math.random() * departments.length)],
          admissionDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          lengthOfStay: Math.floor(Math.random() * 14) + 1,
          cost: Math.floor(Math.random() * 15000) + 2000,
          outcome: outcomes[Math.floor(Math.random() * outcomes.length)],
          riskScore: Math.floor(Math.random() * 100),
          satisfactionScore: +(Math.random() * 3 + 7).toFixed(1)
        });
      }
      setPatientData(patients);
    };

    generatePatientData();
  }, []);

  // Monthly trend data
  const monthlyTrends = [
    { month: 'Jan', patients: 1200, readmissions: 150, avgCost: 8200, satisfaction: 8.5 },
    { month: 'Feb', patients: 1350, readmissions: 162, avgCost: 8400, satisfaction: 8.6 },
    { month: 'Mar', patients: 1100, readmissions: 132, avgCost: 7900, satisfaction: 8.4 },
    { month: 'Apr', patients: 1450, readmissions: 174, avgCost: 8600, satisfaction: 8.7 },
    { month: 'May', patients: 1320, readmissions: 158, avgCost: 8300, satisfaction: 8.8 },
    { month: 'Jun', patients: 1280, readmissions: 154, avgCost: 8100, satisfaction: 8.9 }
  ];

  // Department utilization data
  const departmentData = [
    { name: 'Emergency', patients: 320, utilization: 95, avgLOS: 2.1 },
    { name: 'Cardiology', patients: 180, utilization: 78, avgLOS: 5.2 },
    { name: 'Oncology', patients: 95, utilization: 85, avgLOS: 7.8 },
    { name: 'Orthopedics', patients: 220, utilization: 72, avgLOS: 4.5 },
    { name: 'Neurology', patients: 130, utilization: 68, avgLOS: 6.1 },
    { name: 'ICU', patients: 45, utilization: 92, avgLOS: 8.9 }
  ];

  // Risk distribution data
  const riskDistribution = [
    { name: 'Low Risk (0-30)', value: 45, color: '#22c55e' },
    { name: 'Medium Risk (31-60)', value: 35, color: '#f59e0b' },
    { name: 'High Risk (61-80)', value: 15, color: '#f97316' },
    { name: 'Critical Risk (81-100)', value: 5, color: '#ef4444' }
  ];

  const DataCaptureLayer = () => (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4 flex items-center">
        <Database className="mr-2 text-blue-600" />
        Data Capture Layer
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800">EHR Systems</h4>
          <p className="text-sm text-gray-600">Electronic Health Records, Patient Demographics, Medical History</p>
          <div className="mt-2 text-xs text-green-600">✓ Connected</div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <h4 className="font-semibold text-green-800">Laboratory (LIS)</h4>
          <p className="text-sm text-gray-600">Lab Results, Test Orders, Quality Metrics</p>
          <div className="mt-2 text-xs text-green-600">✓ Real-time</div>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <h4 className="font-semibold text-purple-800">PACS Imaging</h4>
          <p className="text-sm text-gray-600">Medical Images, Radiology Reports, Metadata</p>
          <div className="mt-2 text-xs text-green-600">✓ Streaming</div>
        </div>
        <div className="p-4 bg-orange-50 rounded-lg">
          <h4 className="font-semibold text-orange-800">Pharmacy</h4>
          <p className="text-sm text-gray-600">Medication Orders, Dispensing Records, Interactions</p>
          <div className="mt-2 text-xs text-green-600">✓ Integrated</div>
        </div>
        <div className="p-4 bg-red-50 rounded-lg">
          <h4 className="font-semibold text-red-800">Patient Portal</h4>
          <p className="text-sm text-gray-600">Patient Reported Outcomes, Appointments, Mobile Data</p>
          <div className="mt-2 text-xs text-green-600">✓ Active</div>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-semibold text-yellow-800">Billing System</h4>
          <p className="text-sm text-gray-600">Claims, CPT Codes, Financial Data, Insurance</p>
          <div className="mt-2 text-xs text-green-600">✓ Synchronized</div>
        </div>
      </div>
    </div>
  );

  const DataProcessingLayer = () => (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4 flex items-center">
        <Server className="mr-2 text-green-600" />
        Data Processing & ML Pipeline
      </h3>
      <div className="space-y-4">
        <div className="p-4 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800">Real-time Streaming (Apache Kafka)</h4>
          <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Messages/sec:</span> 1,247
            </div>
            <div>
              <span className="font-medium">Lag:</span> 23ms
            </div>
            <div>
              <span className="font-medium">Topics:</span> 12 active
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-gradient-to-r from-green-100 to-green-50 rounded-lg">
          <h4 className="font-semibold text-green-800">ML Models Performance</h4>
          <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Readmission Prediction:</span> 89% accuracy
            </div>
            <div>
              <span className="font-medium">LOS Prediction:</span> 0.8 days MAE
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-purple-100 to-purple-50 rounded-lg">
          <h4 className="font-semibold text-purple-800">Data Quality Metrics</h4>
          <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Completeness:</span> 97.3%
            </div>
            <div>
              <span className="font-medium">Accuracy:</span> 94.8%
            </div>
            <div>
              <span className="font-medium">Timeliness:</span> 98.1%
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ExecutiveDashboard = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Active Patients</p>
              <p className="text-2xl font-bold">{realTimeMetrics.activePatients.toLocaleString()}</p>
            </div>
            <Users className="h-8 w-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Avg Length of Stay</p>
              <p className="text-2xl font-bold">{realTimeMetrics.avgLOS} days</p>
            </div>
            <Clock className="h-8 w-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Readmission Rate</p>
              <p className="text-2xl font-bold">{realTimeMetrics.readmissionRate}%</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Satisfaction Score</p>
              <p className="text-2xl font-bold">{realTimeMetrics.satisfactionScore}/10</p>
            </div>
            <Heart className="h-8 w-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Monthly Patient Volume & Readmissions</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="patients" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="readmissions" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Risk Score Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Utilization */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Department Utilization & Average LOS</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={departmentData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="patients" fill="#3b82f6" />
            <Bar dataKey="utilization" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const PatientJourneyView = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Patient Journey Mapping</h3>
        
        {/* Journey Timeline */}
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
          
          {[
            { stage: 'Initial Contact', time: '00:00', status: 'completed', description: 'Patient registration and triage' },
            { stage: 'Assessment', time: '00:15', status: 'completed', description: 'Vital signs, medical history, initial examination' },
            { stage: 'Diagnosis', time: '01:30', status: 'completed', description: 'Laboratory tests, imaging, diagnosis confirmation' },
            { stage: 'Treatment Plan', time: '02:45', status: 'active', description: 'Treatment protocol initiation, care team assignment' },
            { stage: 'Monitoring', time: '04:00', status: 'pending', description: 'Progress tracking, outcome measurement' },
            { stage: 'Discharge/Follow-up', time: 'TBD', status: 'pending', description: 'Discharge planning, follow-up scheduling' }
          ].map((stage, index) => (
            <div key={index} className="relative flex items-center mb-8">
              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                stage.status === 'completed' ? 'bg-green-500 text-white' :
                stage.status === 'active' ? 'bg-blue-500 text-white' :
                'bg-gray-300 text-gray-600'
              }`}>
                {index + 1}
              </div>
              <div className="ml-6">
                <div className="flex items-center space-x-4">
                  <h4 className="font-semibold">{stage.stage}</h4>
                  <span className="text-sm text-gray-500">{stage.time}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    stage.status === 'completed' ? 'bg-green-100 text-green-800' :
                    stage.status === 'active' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {stage.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{stage.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Patient Risk Analysis */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Patient Risk Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">High-Risk Patients</h4>
            <div className="space-y-3">
              {patientData.filter(p => p.riskScore > 70).slice(0, 5).map(patient => (
                <div key={patient.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium">{patient.id}</p>
                    <p className="text-sm text-gray-600">{patient.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">{patient.riskScore}</p>
                    <p className="text-xs text-gray-500">Risk Score</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Cost vs LOS Analysis</h4>
            <ResponsiveContainer width="100%" height={200}>
              <ScatterPlot data={patientData.slice(0, 20)}>
                <CartesianGrid />
                <XAxis dataKey="lengthOfStay" name="Length of Stay" />
                <YAxis dataKey="cost" name="Cost" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter data={patientData.slice(0, 20)} fill="#8884d8" />
              </ScatterPlot>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const DataGovernanceView = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">HIPAA Compliance & Data Governance</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Security Measures</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span>Data Encryption (AES-256)</span>
                <span className="text-green-600 font-semibold">✓ Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span>PHI De-identification</span>
                <span className="text-green-600 font-semibold">✓ Automated</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span>Access Controls (RBAC)</span>
                <span className="text-green-600 font-semibold">✓ Enforced</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span>Audit Logging</span>
                <span className="text-green-600 font-semibold">✓ Comprehensive</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Data Quality Monitoring</h4>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span>Completeness</span>
                  <span className="font-semibold">97.3%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '97.3%'}}></div>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span>Accuracy</span>
                  <span className="font-semibold">94.8%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '94.8%'}}></div>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span>Timeliness</span>
                  <span className="font-semibold">98.1%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{width: '98.1%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Data Lineage & Pipeline Status</h3>
        <div className="space-y-4">
          {[
            { source: 'EHR System', destination: 'Data Lake', status: 'Active', lastSync: '2 mins ago' },
            { source: 'Laboratory LIS', destination: 'Real-time Stream', status: 'Active', lastSync: '30 secs ago' },
            { source: 'Data Lake', destination: 'Analytics Warehouse', status: 'Processing', lastSync: '5 mins ago' },
            { source: 'ML Pipeline', destination: 'Prediction Service', status: 'Active', lastSync: '1 min ago' },
            { source: 'Analytics Warehouse', destination: 'Power BI', status: 'Active', lastSync: '3 mins ago' }
          ].map((pipeline, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  pipeline.status === 'Active' ? 'bg-green-500' :
                  pipeline.status === 'Processing' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></div>
                <span className="font-medium">{pipeline.source}</span>
                <span className="text-gray-400">→</span>
                <span>{pipeline.destination}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{pipeline.status}</p>
                <p className="text-xs text-gray-500">{pipeline.lastSync}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: BarChart3 },
    { id: 'journey', label: 'Patient Journey', icon: Activity },
    { id: 'capture', label: 'Data Capture', icon: Database },
    { id: 'processing', label: 'Processing & ML', icon: Server },
    { id: 'governance', label: 'Governance', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Healthcare Patient Journey Analytics</h1>
              <p className="text-sm text-gray-600">Real-time Patient Data Integration & Insights Platform</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Keya Chaudhary - ADT23SOCB0517</p>
              <p className="text-xs text-gray-500">{currentTime.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <ExecutiveDashboard />}
        {activeTab === 'journey' && <PatientJourneyView />}
        {activeTab === 'capture' && <DataCaptureLayer />}
        {activeTab === 'processing' && <DataProcessingLayer />}
        {activeTab === 'governance' && <DataGovernanceView />}
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <p>© 2024 Healthcare Analytics Platform - Educational Project</p>
            <p>Synthetic data used - HIPAA compliant design</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthcareAnalyticsPlatform;
