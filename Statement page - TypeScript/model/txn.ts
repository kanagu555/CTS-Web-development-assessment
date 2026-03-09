

export interface TXN {
    id: string;
    date: string;
    header: string;
    txnType: 'Credit' | 'Debit';
    amount: number;
}
