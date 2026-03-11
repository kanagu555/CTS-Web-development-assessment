

export interface Txn {
    id: number;
    txnDate: string;
    header: string;
    txnType: 'CREDIT' | 'DEBIT';
    amount: number;
    isEditable?: Boolean;
    data: () => void;
    resolver: () => void;
}
