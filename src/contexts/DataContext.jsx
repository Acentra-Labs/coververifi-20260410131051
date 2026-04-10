import { createContext, useContext, useState, useCallback } from 'react';
import {
  generalContractors as gcData,
  subcontractors as subData,
  insuranceAgents as agentData,
  gcSubRelationships as relData,
  certificates as certData,
  verificationRequests as vrData,
  activityLog as logData,
  emailTemplates as tplData,
} from '../data/mockData';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [generalContractors, setGCs] = useState(gcData);
  const [subcontractors, setSubs] = useState(subData);
  const [agents] = useState(agentData);
  const [relationships, setRelationships] = useState(relData);
  const [certificates, setCerts] = useState(certData);
  const [verificationRequests, setVRs] = useState(vrData);
  const [activityLog, setLog] = useState(logData);
  const [emailTemplates] = useState(tplData);

  const getSubsForGC = useCallback((gcId) => {
    const rels = relationships.filter(r => r.gc_id === gcId);
    return rels.map(rel => {
      const sub = subcontractors.find(s => s.id === rel.sub_id);
      const agent = agents.find(a => a.id === rel.agent_id);
      return { ...sub, relationship: rel, agent };
    }).filter(Boolean);
  }, [relationships, subcontractors, agents]);

  const getGCsForConsultant = useCallback((consultantId) => {
    return generalContractors.filter(gc => gc.consultant_id === consultantId);
  }, [generalContractors]);

  const getCertsForSub = useCallback((subId) => {
    return certificates.filter(c => c.sub_id === subId);
  }, [certificates]);

  const getAgentForSub = useCallback((subId, gcId) => {
    const rel = relationships.find(r => r.sub_id === subId && r.gc_id === gcId);
    if (!rel) return null;
    return agents.find(a => a.id === rel.agent_id);
  }, [relationships, agents]);

  const getVRsForSub = useCallback((subId) => {
    return verificationRequests.filter(vr => vr.sub_id === subId);
  }, [verificationRequests]);

  const addSubcontractor = useCallback((subData, gcId, agentId) => {
    const newSub = {
      ...subData,
      id: `sub-${String(subcontractors.length + 1).padStart(3, '0')}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setSubs(prev => [...prev, newSub]);

    const newRel = {
      id: `rel-${String(relationships.length + 1).padStart(3, '0')}`,
      gc_id: gcId,
      sub_id: newSub.id,
      agent_id: agentId,
      require_additional_insured: false,
      created_at: new Date().toISOString(),
    };
    setRelationships(prev => [...prev, newRel]);

    addLogEntry('sub_added', `${newSub.company_name} added`, 'Current User');
    return newSub;
  }, [subcontractors.length, relationships.length]);

  const addGC = useCallback((data, consultantId) => {
    const newGC = {
      ...data,
      id: `gc-${String(generalContractors.length + 1).padStart(3, '0')}`,
      consultant_id: consultantId,
      default_gl_requirement: 1000000,
      default_wc_requirement: 500000,
      require_additional_insured: true,
      active_jobs: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setGCs(prev => [...prev, newGC]);
    addLogEntry('gc_added', `${newGC.company_name} onboarded as new GC client`, 'Current User');
    return newGC;
  }, [generalContractors.length]);

  const sendVerification = useCallback((gcId, subId, agentId, policyType) => {
    const newVR = {
      id: `vr-${String(verificationRequests.length + 1).padStart(3, '0')}`,
      gc_id: gcId,
      sub_id: subId,
      agent_id: agentId,
      type: 'new_certificate',
      policy_type: policyType,
      token: crypto.randomUUID(),
      status: 'sent',
      sent_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      responded_at: null,
      created_at: new Date().toISOString(),
    };
    setVRs(prev => [...prev, newVR]);

    const sub = subcontractors.find(s => s.id === subId);
    addLogEntry('verification_sent', `Verification request sent for ${sub?.company_name} ${policyType === 'general_liability' ? 'GL' : 'WC'}`, 'System');
    return newVR;
  }, [verificationRequests.length, subcontractors]);

  const addLogEntry = useCallback((type, message, user) => {
    setLog(prev => [{
      id: `log-${String(prev.length + 1).padStart(3, '0')}`,
      type,
      message,
      user,
      timestamp: new Date().toISOString(),
    }, ...prev]);
  }, []);

  return (
    <DataContext.Provider value={{
      generalContractors,
      subcontractors,
      agents,
      relationships,
      certificates,
      verificationRequests,
      activityLog,
      emailTemplates,
      getSubsForGC,
      getGCsForConsultant,
      getCertsForSub,
      getAgentForSub,
      getVRsForSub,
      addSubcontractor,
      addGC,
      sendVerification,
      addLogEntry,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
