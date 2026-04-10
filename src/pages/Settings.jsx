import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useToast } from '../contexts/ToastContext';
import { formatCurrency } from '../utils/helpers';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Mail,
  Save,
  Building2,
} from 'lucide-react';

export default function SettingsPage() {
  const { user, isConsultant } = useAuth();
  const { generalContractors, emailTemplates } = useData();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'compliance', label: 'Compliance Defaults', icon: Shield },
    { key: 'email', label: 'Email Templates', icon: Mail },
  ];

  const [notifSettings, setNotifSettings] = useState({
    email_30day: true,
    email_14day: true,
    email_7day: true,
    email_1day: true,
    notify_gc_on_response: true,
    notify_consultant_on_response: true,
  });

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="lg:w-56 shrink-0">
          <nav className="bg-white rounded-xl border border-gray-200 p-2 flex lg:flex-col gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? 'bg-slate-900 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" defaultValue={user.name} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-electric" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" defaultValue={user.email} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-electric" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input type="text" defaultValue={user.company} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-electric" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <input type="text" value={user.role === 'consultant' ? 'Consultant' : 'General Contractor'} disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500" />
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Change Password</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input type="password" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-electric" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input type="password" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-electric" />
                  </div>
                </div>
              </div>
              <button onClick={handleSave} className="inline-flex items-center gap-2 bg-amber-action hover:bg-amber-action-dark text-white font-medium py-2.5 px-4 rounded-lg transition-colors">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
              <p className="text-sm text-gray-500">Configure when automated emails are sent to insurance agents.</p>
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Expiration Warnings</h3>
                {[
                  { key: 'email_30day', label: '30 days before expiration' },
                  { key: 'email_14day', label: '14 days before expiration' },
                  { key: 'email_7day', label: '7 days before expiration' },
                  { key: 'email_1day', label: '1 day before expiration' },
                ].map(item => (
                  <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifSettings[item.key]}
                      onChange={(e) => setNotifSettings(s => ({ ...s, [item.key]: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-300 text-electric focus:ring-electric"
                    />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </label>
                ))}

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Response Notifications</h3>
                  {[
                    { key: 'notify_gc_on_response', label: 'Notify GC when agent responds' },
                    { key: 'notify_consultant_on_response', label: 'Notify consultant when agent responds' },
                  ].map(item => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer mb-3">
                      <input
                        type="checkbox"
                        checked={notifSettings[item.key]}
                        onChange={(e) => setNotifSettings(s => ({ ...s, [item.key]: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-300 text-electric focus:ring-electric"
                      />
                      <span className="text-sm text-gray-700">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button onClick={handleSave} className="inline-flex items-center gap-2 bg-amber-action hover:bg-amber-action-dark text-white font-medium py-2.5 px-4 rounded-lg transition-colors">
                <Save className="w-4 h-4" /> Save Preferences
              </button>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Compliance Defaults</h2>
              <p className="text-sm text-gray-500">Default insurance requirements applied to new GC clients. Idaho-specific defaults.</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" /> General Liability
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-blue-800 mb-1">Per Occurrence Minimum</label>
                      <input type="text" defaultValue="$1,000,000" className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-blue-800 mb-1">Aggregate Minimum</label>
                      <input type="text" defaultValue="$2,000,000" className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm bg-white" />
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Workers Compensation
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-purple-800 mb-1">Employer&apos;s Liability</label>
                      <input type="text" defaultValue="$500,000 / $500,000 / $500,000" className="w-full px-3 py-2 border border-purple-200 rounded-lg text-sm bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-purple-800 mb-1">WC Coverage</label>
                      <input type="text" defaultValue="Statutory (Idaho)" className="w-full px-3 py-2 border border-purple-200 rounded-lg text-sm bg-white" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800">
                  <strong>Idaho Code 72-216:</strong> GCs are liable as statutory employers for uninsured subcontractor employees.
                  Ensure all subs carry valid Workers Comp or provide proof of sole-proprietor exemption.
                </p>
              </div>
              <button onClick={handleSave} className="inline-flex items-center gap-2 bg-amber-action hover:bg-amber-action-dark text-white font-medium py-2.5 px-4 rounded-lg transition-colors">
                <Save className="w-4 h-4" /> Save Defaults
              </button>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Email Templates</h2>
              <p className="text-sm text-gray-500">Customize the automated emails sent to insurance agents.</p>
              <div className="space-y-4">
                {emailTemplates.map(tpl => (
                  <div key={tpl.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-900">{tpl.name}</h3>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {tpl.is_default ? 'Default' : 'Custom'}
                      </span>
                    </div>
                    <div className="mb-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
                      <input
                        type="text"
                        defaultValue={tpl.subject}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-electric"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Body</label>
                      <textarea
                        defaultValue={tpl.body}
                        rows={5}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-electric font-mono text-xs"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Variables: {'{{sub_name}}'}, {'{{gc_name}}'}, {'{{agent_name}}'}, {'{{policy_type}}'}, {'{{magic_link}}'}, {'{{expiration_date}}'}, {'{{coverage_requirement}}'}
                    </p>
                  </div>
                ))}
              </div>
              <button onClick={handleSave} className="inline-flex items-center gap-2 bg-amber-action hover:bg-amber-action-dark text-white font-medium py-2.5 px-4 rounded-lg transition-colors">
                <Save className="w-4 h-4" /> Save Templates
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
