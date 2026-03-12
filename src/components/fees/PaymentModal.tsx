"use client";

import { X, Banknote, Receipt } from "lucide-react";

interface PaymentModalProps {
    isOpen: boolean;
    role?: "admin" | "student";
    selectedFees: any[];

    amount: number;
    setAmount: (v: number) => void;

    discount: number;
    setDiscount: (v: number) => void;

    fine: number;
    setFine: (v: number) => void;

    receiptNo: string;
    setReceiptNo: (v: string) => void;

    receiptDate: string;
    setReceiptDate: (v: string) => void;

    remarks: string;
    setRemarks: (v: string) => void;

    selectedPaymentMode: string;
    setSelectedPaymentMode: (v: string) => void;

    isProcessing: boolean;

    handleManualFormSubmit: () => void;
    setIsModalOpen: (v: boolean) => void;

    formatCurrency: (v: number) => string;
    InputGroup: any;
}

export default function PaymentModal({
    isOpen,
    role,
    selectedFees,
    amount,
    setAmount,
    discount,
    setDiscount,
    fine,
    setFine,
    receiptNo,
    setReceiptNo,
    receiptDate,
    setReceiptDate,
    remarks,
    setRemarks,
    selectedPaymentMode,
    setSelectedPaymentMode,
    isProcessing,
    handleManualFormSubmit,
    setIsModalOpen,
    formatCurrency,
    InputGroup,
}: PaymentModalProps) {
    if (!isOpen || role !== "admin") return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between">
                    <div>
                        <h2 className="text-lg font-bold">Collect Payment</h2>

                        <p className="text-xs text-slate-500 mt-1">
                            {selectedFees.length > 1
                                ? `Bulk Payment (${selectedFees.length} items)`
                                : `${selectedFees[0]?.term} • ${selectedFees[0]?.academicYear}`}
                        </p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(false)}
                        className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">

                    <div className="bg-indigo-50 dark:bg-slate-800 rounded-lg p-4 text-center">
                        <span className="text-xs uppercase font-bold">
                            Total Payable
                        </span>

                        <div className="text-3xl font-bold mt-1">
                            {formatCurrency(amount)}
                        </div>
                    </div>

                    <InputGroup
                        label="Payment Amount"
                        value={amount}
                        onChange={(v: string) => setAmount(Number(v))}
                        type="number"
                        icon={<Banknote size={16} />}
                        autoFocus
                    />

                    {selectedFees.length === 1 && (
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup
                                label="Discount"
                                value={discount}
                                onChange={(v: string) => setDiscount(Number(v))}
                                type="number"
                            />

                            <InputGroup
                                label="Fine"
                                value={fine}
                                onChange={(v: string) => setFine(Number(v))}
                                type="number"
                            />
                        </div>
                    )}

                    {/* Payment Mode */}
                    <div>
                        <label className="block text-xs font-semibold mb-2 uppercase">
                            Payment Mode
                        </label>

                        <div className="grid grid-cols-2 gap-2">
                            {["CASH", "UPI", "ONLINE", "BANK_TRANSFER"].map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setSelectedPaymentMode(m)}
                                    className={`text-xs py-2 rounded-lg border transition
${selectedPaymentMode === m
                                            ? "bg-indigo-600 text-white border-indigo-600"
                                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700"
                                        }`}
                                >
                                    {m.replace("_", " ")}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup
                            label="Receipt No"
                            value={receiptNo}
                            onChange={(v: string) => setReceiptNo(v)}
                            type="text"
                            icon={<Receipt size={16} />}
                        />

                        <InputGroup
                            label="Date"
                            value={receiptDate}
                            onChange={(v: string) => setReceiptDate(v)}
                            type="date"
                        />
                    </div>

                    <InputGroup
                        label="Remarks"
                        value={remarks}
                        onChange={(v: string) => setRemarks(v)}
                        type="text"
                    />
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex gap-3">

                    <button
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleManualFormSubmit}
                        disabled={isProcessing}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2 transition"
                    >
                        {isProcessing ? "Processing..." : "Confirm Payment"}
                    </button>

                </div>
            </div>
        </div>
    );
}