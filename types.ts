import React from 'react';

export type View =
  | 'circularsList'
  | 'circularDetails'
  | 'actionableDetails'
  | 'subClauseDetails';

export interface Task {
  status: string;
  count: number;
  color: string;
}

export interface DateInfo {
  label: string;
  date: string;
  icon: React.ElementType;
}

export interface TagInfo {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
}

export interface Chapter {
  number: string;
  title: string;
}

/* 🔥 New: Clause type for extracted clauses */
export interface Clause {
  number: number | string;
  text: string;
}

/* 🔥 New: AI Insights for right sidebar accordion */
export interface Insights {
  organizationImpact: string;
  technicalChanges: string;
  operationalChanges: string;
  disclosureAreas: string;
}

export interface Circular {
  id: string;
  regulator: 'SEBI' | 'RBI';
  title: string;
  breadcrumbs: string[];
  issueDate: string;
  dueDate: string;
  effectiveDate: string;
  circularNo: string | null;
  commonTag: string;
  tagColor: string;
  summary: string;
  hasClauses: boolean;
  referencesCount: number;
  chapters?: Chapter[];

  /* Optional - Filled when LLM clause extraction runs */
  clauses?: Clause[];

  /* Optional - Filled when LLM insights are generated */
  insights?: Insights;
}

/* ===================== Audit Types (unchanged) ===================== */

export interface AuditTaskStatus {
  compliant: number;
  nonCompliant: number;
  partiallyCompliant: number;
}

export interface EvidenceFile {
  name: string;
  score: string;
  analysis: string;
}

export interface Finding {
  title: string;
  description: string;
}

export interface ControlDetails {
  evidenceFiles: EvidenceFile[];
  findings: Finding[];
}

export interface Control {
  id: string;
  name: string;
  weightage: string;
  artifacts: number;
  status: 'pending' | 'done' | 'review';
  score: number;
  scoreStatus: 'good' | 'bad';
  details?: ControlDetails;
}

export interface AuditFindingStatus {
  resolved: number;
  inProgress: number;
  open: number;
  new: number;
  total: number;
}

export interface AuditTaskDetails {
  compliant: number;
  nonCompliant: number;
  partiallyCompliant: number;
  notedForCompliance: number;
  total: number;
}

export interface ControlGroup {
  name: string;
  weight: string;
  score: number;
  totalScore: number;
  color: string;
}

export interface AuditFindingItem {
  id: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  description: string;
  findingDate: string;
  nature: string;
  linkedControls: string;
}

export interface Audit {
  id: string;
  title: string;
  description: string;
  auditDate: string;
  controls: number;
  auditScore: number;
  taskStatus: AuditTaskStatus;
  totalTasks: number;
  isAddNew?: boolean;
  details?: {
    lastRunDate: string;
    lastRunStatus: string;
    breadcrumbs: string[];
    taskDetails: AuditTaskDetails;
    findingDetails: AuditFindingStatus;
    controlsList: Control[];
    controlGroups?: ControlGroup[];
    auditFindingsList?: AuditFindingItem[];
  };
}
