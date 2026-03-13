import * as Yup from "yup";

export const txnSchema = Yup.object({
    header: Yup.string().trim().required("Description is required"),
    txnDate: Yup.string().required("Date is required"),
    txnType: Yup.mixed<"CREDIT" | "DEBIT">()
        .oneOf(["CREDIT", "DEBIT"], "Invalid transaction type")
        .required(),
    amount: Yup.number()
        .typeError("Amount must be a number")
        .positive("Amount must be greater than 0")
        .required("Amount is required"),

    isEditable: Yup.boolean().optional().default(false),
});