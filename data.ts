import { Circular, Audit } from './types';

export const circulars: Record<string, Circular> = {
  'disclosure_2024': {
    id: 'disclosure_2024',
    regulator: 'SEBI',
    title: 'Disclosure of expenses, half yearly returns, yield and risk-o-meter of schemes of Mutual Funds',
    breadcrumbs: ['Circulars', 'SEBI', 'Disclosure of expenses, half yearly returns, yield and...'],
    issueDate: 'November 5th, 2024',
    dueDate: 'No due date assigned',
    effectiveDate: 'December 5th, 2024',
    circularNo: 'SEBI/HO/IMD/PoD1/CIR/P/2024/150',
    commonTag: 'Mutual Fund Disclosures',
    tagColor: 'bg-purple-100 text-purple-800',
    summary: 'The circular introduces enhanced transparency requirements for Mutual Funds including: 1) Mandatory separate disclosures of expenses, returns, and yields for direct and regular plans 2) Introduction of a new color scheme for Risk-o-meter representation with six risk levels 3) Standardized format for disclosure of changes in Risk-o-meter to unitholders. These changes aim to facilitate better comprehension by investors and standardize industry disclosures.',
    hasClauses: true,
    referencesCount: 7,
  },
  'sebi_1996': {
    id: 'sebi_1996',
    regulator: 'SEBI',
    title: 'SEBI (MUTUAL FUNDS) REGULATIONS, 1996',
    breadcrumbs: ['Regulations', 'SEBI', 'SEBI (MUTUAL FUNDS) REGULATIONS, 1996'],
    issueDate: 'December 9th, 1996',
    dueDate: 'No due date assigned',
    effectiveDate: 'December 9th, 1996',
    circularNo: null,
    commonTag: 'Mutual Funds',
    tagColor: 'bg-purple-100 text-purple-800',
    summary: 'This document contains the comprehensive regulations governing mutual funds in India, including chapters on registration, constitution and management, schemes, investment objectives, valuation policies, and various other operational aspects of mutual funds. It also covers specialized segments like Real Estate Mutual Funds, Infrastructure Debt Funds, and Mutual Fund Lite.',
    hasClauses: false,
    referencesCount: 0,
    chapters: [
        { number: '6.0', title: 'Furnishing information' },
        { number: '7.0', title: 'Eligibility criteria' },
        { number: '8.0', title: 'Consideration of application' },
    ],
  },
  'rbi_master_kyc': {
    id: 'rbi_master_kyc',
    regulator: 'RBI',
    title: 'Master Direction - Know Your Customer (KYC) Direction, 2016',
    breadcrumbs: ['Circulars', 'RBI', 'Master Direction - KYC...'],
    issueDate: 'February 25, 2016',
    dueDate: 'No due date assigned',
    effectiveDate: 'February 25, 2016',
    circularNo: 'DBR.AML.BC.No.81/14.01.001/2015-16',
    commonTag: 'KYC/AML',
    tagColor: 'bg-red-100 text-red-800',
    summary: 'This Master Direction provides a consolidated set of instructions to all Regulated Entities (REs) on the Customer Due Diligence (CDD) procedure, to be carried out at the time of commencing a relationship with the customer.',
    hasClauses: true,
    referencesCount: 12,
  },
  'rbi_digital_lending': {
    id: 'rbi_digital_lending',
    regulator: 'RBI',
    title: 'Guidelines on Digital Lending',
    breadcrumbs: ['Circulars', 'RBI', 'Guidelines on Digital Lending'],
    issueDate: 'September 2, 2022',
    dueDate: 'No due date assigned',
    effectiveDate: 'September 2, 2022',
    circularNo: 'RBI/2022-23/111',
    commonTag: 'Digital Lending',
    tagColor: 'bg-red-100 text-red-800',
    summary: 'This circular lays down the regulatory framework for digital lending, aiming to enhance customer protection and make the digital lending ecosystem safe and sound while encouraging innovation.',
    hasClauses: true,
    referencesCount: 5,
  }
};

export const audits: Audit[] = [
  {
    id: 'internal_audit_mt13',
    title: 'Internal Audit_MT13',
    description: 'Internal Audit',
    auditDate: 'Mar 25, 2025',
    controls: 6,
    auditScore: 7.50,
    taskStatus: {
      compliant: 5,
      nonCompliant: 1,
      partiallyCompliant: 0,
    },
    totalTasks: 6,
  },
  {
    id: '2',
    title: 'Internal Audit_test1',
    description: 'Internal Audit',
    auditDate: 'Mar 20, 2025',
    controls: 6,
    auditScore: 0.00,
    taskStatus: {
      compliant: 6,
      nonCompliant: 0,
      partiallyCompliant: 0,
    },
    totalTasks: 6,
  },
  {
    id: '3',
    title: 'Internal Audit_test1',
    description: 'Internal Audit',
    auditDate: 'Mar 20, 2025',
    controls: 6,
    auditScore: 23.00,
    taskStatus: {
      compliant: 4,
      partiallyCompliant: 2,
      nonCompliant: 0,
    },
    totalTasks: 6,
  },
  {
    id: '4',
    title: 'Add Audit Title',
    description: 'Add Audit Description',
    auditDate: 'Nov 23, 2025',
    controls: 1,
    auditScore: 0.00,
    taskStatus: {
      compliant: 0,
      partiallyCompliant: 0,
      nonCompliant: 0,
    },
    totalTasks: 1,
    isAddNew: true,
  },
];


export const detailedAudits: Record<string, Audit> = {
  'internal_audit_mt13': {
    ...audits[0],
    details: {
      lastRunDate: 'Mar 25, 2025 22:28',
      lastRunStatus: 'Your last audit run was successfully processed',
      breadcrumbs: ['Audits', 'SEBI', 'Internal Audit_MT13'],
      taskDetails: {
        compliant: 5,
        nonCompliant: 1,
        partiallyCompliant: 0,
        notedForCompliance: 0,
        total: 6,
      },
      findingDetails: {
        resolved: 0,
        inProgress: 0,
        open: 6,
        new: 0,
        total: 6,
      },
      controlsList: [
        { id: '1', name: 'Earnings', weightage: '25.00%', artifacts: 0, status: 'pending', score: 8.00, scoreStatus: 'good' },
        { 
          id: '2', 
          name: 'Income Tax Above 2% Threshold', 
          weightage: '30.00%', 
          artifacts: 0, 
          status: 'pending', 
          score: 0.00, 
          scoreStatus: 'bad',
          details: {
              evidenceFiles: [
                  {
                      name: 'Payslip_MT-13_Jan_2025.pdf',
                      score: '0.0/10.0',
                      analysis: 'The provided payslip does not show any Income Tax deduction. The only deduction mentioned is Professional Tax of ₹200.00. The gross salary is ₹1,16,667.00, and 2% of this would be ₹2,333.34. Since there is no Income Tax deduction visible on the payslip, it does not meet the requirement of Income Tax being more than 2% of the Gross Salary.'
                  }
              ],
              findings: [
                  {
                      title: 'Investigate and Rectify Income Tax Deduction Discrepancy',
                      description: 'The payslip for MT-13 for January 2025 does not show any Income Tax deduction, which is a significant concern as Income Tax is typically deducted from salaries in India. This indicates either an error in payroll processing, incomplete documentation, or potential non-compliance with tax regulations. The gross salary is ₹1,16,667.00, and 2% of this would be ₹2,333.34. Since there is no Income Tax deduction visible on the payslip, it does not meet the requirement of Income Tax being more than 2% of the Gross Salary.'
                  }
              ]
          }
        },
        { id: '3', name: 'Employee Info', weightage: '20.00%', artifacts: 0, status: 'pending', score: 10.00, scoreStatus: 'good' },
      ],
      controlGroups: [
        { name: 'Earnings', weight: '25.00%', score: 8.00, totalScore: 10.00, color: 'fuchsia' },
        { name: 'Deductions', weight: '30.00%', score: 3.33, totalScore: 10.00, color: 'orange' },
        { name: 'Employee Info', weight: '20.00%', score: 10.00, totalScore: 10.00, color: 'green' },
        { name: 'Totals', weight: '25.00%', score: 10.00, totalScore: 10.00, color: 'blue' },
      ],
      auditFindingsList: [
        {
          id: 'f1',
          title: 'Implement Systematic Verification of Non-Zero Basic Salary',
          priority: 'High',
          description: 'The payslip for MT-13 for January 2025 shows a non-zero Basic Salary of ₹46,667.00, which complies with the requirement that Basic Salary should be greater than zero. While this specific payslip meets the requirement, it’s important to ensure that this is consistently applied across all employees and pay periods.',
          findingDate: '2025-03-25',
          nature: 'Observation',
          linkedControls: 'Non-Zero Basic Salary',
        },
        {
          id: 'f2',
          title: 'Implement Consistent Decimal Point Formatting for Basic Salary',
          priority: 'High',
          description: 'The Basic Salary amount on the payslip is not consistently formatted with two decimal points as required. The current format shows “\u20b946,667.00” which displays zero decimal places instead of two. This inconsistency may lead to discrepancies in financial reporting and could potentially cause confusion or errors in payroll processing.',
          findingDate: '2025-03-25',
          nature: 'Minor',
          linkedControls: 'Consistent Formatting',
        },
        {
          id: 'f3',
          title: 'Investigate and Rectify Income Tax Deduction Discrepancy',
          priority: 'High',
          description: 'The payslip for MT-13 for January 2025 does not show any Income Tax deduction, which is a significant concern as Income Tax is typically deducted from salaries in India. This indicates either an error in payroll processing, incomplete documentation, or potential non-compliance with tax regulations. The gross salary is ₹1,16,667.00, and 2% of this would be ₹2,333.34. Since there is no Income Tax deduction visible on the payslip, it does not meet the requirement of Income Tax being more than 2% of the Gross Salary.',
          findingDate: '2025-03-25',
          nature: 'Major',
          linkedControls: 'Income Tax Above 2% Threshold',
        },
        {
          id: 'f4',
          title: 'Implement Standardized INR Denomination Policy for All Financial Documents',
          priority: 'High',
          description: 'The provided payslip (Payslip_MT-13_Jan_2025.pdf) correctly displays all monetary values, including income and deductions, in Indian Rupees (INR). This is evidenced by the use of the ₹ symbol throughout the document and the total net payable amount written out in words as "Indian Rupee One Lakh Sixteen Thousand Four Hundred Sixty-Seven Only". While this specific document complies with the requirement to show Income Tax in INR, there is a need to ensure consistent compliance across all relevant documents.',
          findingDate: '2025-03-25',
          nature: 'Observation',
          linkedControls: 'Income Tax INR Denomination',
        },
        {
            id: 'f5',
            title: 'Maintain PAN Format Compliance',
            priority: 'High',
            description: 'A PAN card must be in the specified format, which consists of ten alphanumeric characters. The first five characters are letters, the next four are numbers, and the last character is a letter. The provided PAN card image shows the PAN as "ABCDE1234F", which is a valid format.',
            findingDate: '2025-03-25',
            nature: 'Observation',
            linkedControls: 'PAN Format Compliance',
        },
        {
            id: 'f6',
            title: 'Document and Implement Net Pay Recalculation Process',
            priority: 'High',
            description: 'The provided document is a payslip for an employee named Test User. The payslip shows a gross salary of ₹1,16,667.00 and deductions of ₹200.00 for Professional Tax. The net pay is calculated as ₹1,16,467.00, which is the gross salary minus the deductions. The payslip also shows the net pay in words as "Indian Rupee One Lakh Sixteen Thousand Four Hundred Sixty-Seven Only".',
            findingDate: '2025-03-25',
            nature: 'Observation',
            linkedControls: 'Net Pay Recalculation',
        }
      ],
    }
  }
};