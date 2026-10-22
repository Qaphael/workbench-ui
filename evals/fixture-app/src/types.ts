export type InvoiceStatus = 'paid' | 'due' | 'overdue';

export interface Invoice {
  id: string;
  customer: string;
  amount: number;
  issued: string;
  status: InvoiceStatus;
}
