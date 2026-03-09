export interface Txn {
    id: number;
    header: string;
    txnDate: string;
    txnType: string;
    amount: number;
    isEditable?: boolean;
}