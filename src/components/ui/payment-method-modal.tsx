'use client';

import { X, CreditCard, Smartphone, Bitcoin } from 'lucide-react';

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMethod: (method: 'card' | 'mpesa' | 'crypto') => void;
}

export default function PaymentMethodModal({ isOpen, onClose, onSelectMethod }: PaymentMethodModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-black">Select Payment Method</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <button
            onClick={() => onSelectMethod('mpesa')}
            className="w-full flex items-center gap-4 p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
          >
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Smartphone className="size-8 text-white" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-lg font-bold text-black mb-1">M-Pesa</h3>
              <p className="text-sm text-gray-600">Pay via M-Pesa mobile money</p>
            </div>
          </button>

          <button
            onClick={() => onSelectMethod('card')}
            className="w-full flex items-center gap-4 p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="size-8 text-white" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-lg font-bold text-black mb-1">Credit/Debit Card</h3>
              <p className="text-sm text-gray-600">Pay with Visa, Mastercard, or Amex</p>
            </div>
          </button>

          <button
            onClick={() => onSelectMethod('crypto')}
            className="w-full flex items-center gap-4 p-6 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all group"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bitcoin className="size-8 text-white" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-lg font-bold text-black mb-1">Cryptocurrency</h3>
              <p className="text-sm text-gray-600">Pay with Bitcoin, Ethereum, or USDT</p>
            </div>
          </button>
        </div>

        <div className="p-6 bg-gray-50 border-t">
          <p className="text-sm text-gray-600 text-center">
            All payment methods are secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
}