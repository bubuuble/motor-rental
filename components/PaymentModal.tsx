import React, { useState } from 'react';
import Image from 'next/image';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  total: number;
  onUploadProof: (file: File, method: 'cash' | 'qris') => void;
}

const paymentMethods = [
  { key: 'cash', label: 'Cash' },
  { key: 'qris', label: 'QRIS' },
];

export default function PaymentModal({ open, onClose, total, onUploadProof }: PaymentModalProps) {
  const [method, setMethod] = useState<'cash' | 'qris' | null>(null);
  const [showPay, setShowPay] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm animate-in zoom-in">
        <h2 className="text-lg font-bold mb-4 text-center">Pembayaran</h2>
        {/* Metode Pembayaran */}
        <div className="flex flex-col gap-2 mb-6">
          {paymentMethods.map((m) => (
            <button
              key={m.key}
              onClick={() => { setMethod(m.key as 'cash' | 'qris'); setShowPay(false); }}
              className={`border rounded-lg px-4 py-3 font-medium text-sm transition-all ${method === m.key ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-400'}`}
            >
              {m.label}
            </button>
          ))}
        </div>
        {/* Total */}
        <div className="mb-6 text-center">
          <span className="text-xs text-slate-500">Total</span>
          <div className="text-2xl font-bold text-blue-600">Rp {total.toLocaleString()}</div>
        </div>
        {/* Bayar Sekarang */}
        {!showPay && method && (
          <button
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition mb-2"
            onClick={() => setShowPay(true)}
          >
            Bayar Sekarang
          </button>
        )}
        {/* QRIS & Upload Bukti */}
        {showPay && method === 'qris' && (
          <div className="flex flex-col items-center gap-4 mt-2">
            <Image src="/images/qris.jpeg" alt="QRIS" width={180} height={180} className="rounded-xl border" />
            <p className="text-xs text-slate-500">Scan QRIS untuk membayar</p>
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="border rounded-lg p-2 w-full" />
            <button
              disabled={!file}
              onClick={() => file && onUploadProof(file, 'qris')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              Upload Bukti Bayar
            </button>
          </div>
        )}
        {/* Cash & Upload Bukti */}
        {showPay && method === 'cash' && (
          <div className="flex flex-col items-center gap-4 mt-2">
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="border rounded-lg p-2 w-full" />
            <button
              disabled={!file}
              onClick={() => file && onUploadProof(file, 'cash')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              Upload Bukti Bayar
            </button>
          </div>
        )}
        <button onClick={onClose} className="mt-6 text-xs text-slate-400 underline w-full">Tutup</button>
      </div>
    </div>
  );
}
