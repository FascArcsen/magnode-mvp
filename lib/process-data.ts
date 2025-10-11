import { ProcessSummary } from '@/types/database';

export const criticalProcesses: ProcessSummary[] = [
  {
    process_key: 'kyc_verification',
    name: 'KYC Verification Blocked',
    from_dept: 'Sales',
    to_dept: 'Compliance',
    avg_time_hours: 168,
    handoff_count: 8,
    completion_rate: 0.45,
    status: 'critical',
    user_complaint: 'Sent my ID 4 times, still rejected'
  },
  {
    process_key: 'account_opening',
    name: 'Business Account Opening',
    from_dept: 'Sales',
    to_dept: 'Product',
    avg_time_hours: 28.9,
    handoff_count: 14,
    completion_rate: 0.67,
    status: 'critical',
    user_complaint: '2 weeks and still no account'
  },
  {
    process_key: 'support_ticket',
    name: 'Support Ticket Ignored',
    from_dept: 'Support',
    to_dept: 'Engineering',
    avg_time_hours: 7.1,
    handoff_count: 4,
    completion_rate: 0.52,
    status: 'critical',
    user_complaint: '5 emails sent, no response'
  },
  {
    process_key: 'transfer_delayed',
    name: "Int'l Transfer Delayed",
    from_dept: 'Support',
    to_dept: 'Finance',
    avg_time_hours: 6.5,
    handoff_count: 7,
    completion_rate: 0.62,
    status: 'critical',
    user_complaint: 'Money disappeared for 3 days'
  },
  {
    process_key: 'fraud_block',
    name: 'Fraud False Positive',
    from_dept: 'Support',
    to_dept: 'Operations',
    avg_time_hours: 6.9,
    handoff_count: 5,
    completion_rate: 0.55,
    status: 'critical',
    user_complaint: 'My money blocked, did nothing wrong'
  },
  {
    process_key: 'loan_approval',
    name: 'Loan Approval Slow',
    from_dept: 'Sales',
    to_dept: 'Finance',
    avg_time_hours: 28.9,
    handoff_count: 11,
    completion_rate: 0.63,
    status: 'critical',
    user_complaint: 'Promised 24h, been 5 days'
  },
  {
    process_key: 'charge_dispute',
    name: 'Charge Dispute',
    from_dept: 'Support',
    to_dept: 'Legal',
    avg_time_hours: 8.2,
    handoff_count: 9,
    completion_rate: 0.58,
    status: 'critical',
    user_complaint: 'Waiting 1 month for refund'
  },
  {
    process_key: 'payment_rejected',
    name: 'Payment Rejected',
    from_dept: 'Engineering',
    to_dept: 'Operations',
    avg_time_hours: 4.3,
    handoff_count: 5,
    completion_rate: 0.68,
    status: 'warning',
    user_complaint: "Payment rejected, don't know why"
  },
  {
    process_key: 'account_activation',
    name: 'Account Activation Stopped',
    from_dept: 'Support',
    to_dept: 'Compliance',
    avg_time_hours: 5.2,
    handoff_count: 6,
    completion_rate: 0.71,
    status: 'warning',
    user_complaint: 'Account blocked, no one responds'
  },
  {
    process_key: 'credit_rejected',
    name: 'Credit Application Rejected',
    from_dept: 'Sales',
    to_dept: 'Operations',
    avg_time_hours: 5.1,
    handoff_count: 6,
    completion_rate: 0.69,
    status: 'warning',
    user_complaint: 'Rejected, no explanation'
  }
];

export const departmentConnections = [
  { source: 'Customer', target: 'Sales', processes: 5, status: 'critical' as const },
  { source: 'Customer', target: 'Support', processes: 8, status: 'critical' as const },
  { source: 'Sales', target: 'Product', processes: 3, status: 'critical' as const },
  { source: 'Sales', target: 'Operations', processes: 4, status: 'warning' as const },
  { source: 'Sales', target: 'Finance', processes: 2, status: 'critical' as const },
  { source: 'Support', target: 'Engineering', processes: 6, status: 'critical' as const },
  { source: 'Support', target: 'Operations', processes: 4, status: 'critical' as const },
  { source: 'Support', target: 'Finance', processes: 2, status: 'warning' as const },
  { source: 'Support', target: 'Legal', processes: 3, status: 'critical' as const },
  { source: 'Product', target: 'Engineering', processes: 5, status: 'warning' as const },
  { source: 'Operations', target: 'Compliance', processes: 3, status: 'warning' as const },
  { source: 'Operations', target: 'Legal', processes: 2, status: 'warning' as const },
];