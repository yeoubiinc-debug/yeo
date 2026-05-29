import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  CreditCard,
  Tag,
  Check,
  X,
  Smartphone,
  Clock,
  AlertTriangle,
  Truck,
  Banknote,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCartStore, CartItem } from '@/stores/cartStore';
import { toast } from 'sonner';

import upiQr from '@/assets/upi.jpeg';

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems?: CartItem[];
}

interface SiteSettings {
  delivery_charges: number;
  free_delivery_on_prepaid: boolean;
}

const UPI_ID = 'stevevijay360@okhdfcbank';

const BookingForm = ({ isOpen, onClose, selectedItems }: BookingFormProps) => {
  const { items, clearCart } = useCartStore();

  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [paymentMethod, setPaymentMethod] = useState<'prepaid' | 'cod'>('prepaid');

  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    delivery_charges: 50,
    free_delivery_on_prepaid: true,
  });

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    remarks: '',
  });

  const cartItems = selectedItems || items;

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('delivery_charges, free_delivery_on_prepaid')
        .limit(1)
        .maybeSingle();

      if (data) {
        setSiteSettings({
          delivery_charges: data.delivery_charges || 50,
          free_delivery_on_prepaid: data.free_delivery_on_prepaid ?? true,
        });
      }
    };

    if (isOpen) fetchSettings();
  }, [isOpen]);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const discount = appliedCoupon
    ? (subtotal * appliedCoupon.discount) / 100
    : 0;

  const deliveryCharges =
    paymentMethod === 'cod'
      ? siteSettings.delivery_charges
      : siteSettings.free_delivery_on_prepaid
        ? 0
        : siteSettings.delivery_charges;

  const total = subtotal - discount + deliveryCharges;

  useEffect(() => {
    if (step === 'payment' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handlePaymentClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [step, timeLeft]);

  const handlePaymentClose = () => {
    setStep('details');
    setTimeLeft(60);
    onClose();
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;

    setApplyingCoupon(true);
    try {
      const { data, error } = await supabase
        .from('coupon_codes')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (error || !data) {
        toast.error('Invalid or expired coupon');
        return;
      }

      if (data.usage_limit && data.used_count >= data.usage_limit) {
        toast.error('Coupon usage limit reached');
        return;
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        toast.error('Coupon expired');
        return;
      }

      setAppliedCoupon({ code: data.code, discount: data.discount_percent });
      toast.success(`Coupon applied (${data.discount_percent}% OFF)`);
      setCouponCode('');
    } finally {
      setApplyingCoupon(false);
    }
  };

  // ✅ FIX: This function was missing its declaration — it was orphaned code before
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsSubmitting(true);

    try {
      const feeAmount = paymentMethod === 'prepaid' ? Math.ceil(total * 0.02) + 2 : 0;
      const finalAmount = total + feeAmount;

      const bookings = cartItems.map((item) => ({
        product_id: item.product.id,
        product_name: item.product.name,
        product_price: item.product.price,
        quantity: item.quantity,
        size: item.size,
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_email: formData.email,
        customer_address: formData.address,
        remarks: formData.remarks || null,
        coupon_code: appliedCoupon?.code || null,
        discount_percent: appliedCoupon?.discount || 0,
        total_amount:
          item.product.price *
          item.quantity *
          (1 - (appliedCoupon?.discount || 0) / 100) +
          (paymentMethod === 'cod'
            ? siteSettings.delivery_charges / cartItems.length
            : 0),
        status: 'pending',
        payment_method: paymentMethod,
        fee_amount: feeAmount,
      }));

      const { data: insertedBookings, error } = await supabase.from('bookings').insert(bookings).select();
      if (error || !insertedBookings) throw error;

      if (paymentMethod === 'cod') {
        const message = `🛒 *New COD Order*\n\nName: ${formData.name}\nPhone: ${formData.phone}\nEmail: ${formData.email}\nAddress: ${formData.address}\n\nTotal: ₹${total}\n\nPayment: Cash on Delivery`;

        window.open(
          `https://wa.me/918330858233?text=${encodeURIComponent(message)}`,
          '_blank'
        );

        clearCart();
        toast.success('Order placed successfully!');
        handlePaymentClose();
      } else {
        if (!(window as any).Razorpay) {
          toast.error('Payment system is loading, please try again in a moment. If using an ad-blocker, try pausing it.');
          setIsSubmitting(false);
          return;
        }

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: Math.round(finalAmount * 100), // amount in paise
          currency: 'INR',
          name: 'YEOUBI',
          description: 'Order Payment',
          handler: async function (response: any) {
            const updateData = insertedBookings.map((b) => ({
              ...b,
              status: 'completed',
              razorpay_payment_id: response.razorpay_payment_id,
            }));
            const { error: updError } = await supabase.from('bookings').upsert(updateData);
            if (updError) {
              console.error('Failed to update booking status', updError);
              toast.error('Payment succeeded but could not update order status.');
            } else {
              toast.success('Payment successful and order placed!');
              clearCart();
              handlePaymentClose();
            }
          },
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone,
          },
          theme: {
            color: '#000000',
          },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpiAppOpen = (app: string) => {
    let url = `upi://pay?pa=${UPI_ID}&am=${total.toFixed(
      2
    )}&tn=${encodeURIComponent(formData.phone || 'Order Payment')}&cu=INR`;

    if (app === 'gpay')
      url = `tez://upi/pay?pa=${UPI_ID}&am=${total.toFixed(
        2
      )}&tn=${encodeURIComponent(formData.phone || 'Order Payment')}&cu=INR`;

    if (app === 'paytm')
      url = `paytmmp://pay?pa=${UPI_ID}&am=${total.toFixed(
        2
      )}&tn=${encodeURIComponent(formData.phone || 'Order Payment')}&cu=INR`;

    if (app === 'phonepe')
      url = `phonepe://pay?pa=${UPI_ID}&am=${total.toFixed(
        2
      )}&tn=${encodeURIComponent(formData.phone || 'Order Payment')}&cu=INR`;

    window.open(url, '_blank');
  };

  const handlePaymentComplete = () => {
    clearCart();
    toast.success('Payment submitted. We will verify & confirm.');
    handlePaymentClose();
    setFormData({ name: '', phone: '', email: '', address: '', remarks: '' });
    setAppliedCoupon(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-strong rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          {step === 'details' ? (
            <>
              {/* ---------- DETAILS FORM ---------- */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Complete Your Order</h2>
                <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
                  <X size={20} />
                </button>
              </div>

              {/* ORDER SUMMARY */}
              <div className="glass p-4 rounded-xl mb-6">
                <h3 className="font-medium mb-3">Order Summary</h3>
                {cartItems.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm mb-1">
                    <span>{item.product.name} ({item.size}) × {item.quantity}</span>
                    <span>₹{item.product.price * item.quantity}</span>
                  </div>
                ))}

                <div className="border-t mt-2 pt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-green-500">
                      <span>Discount</span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>
                      {deliveryCharges === 0
                        ? 'FREE'
                        : `₹${deliveryCharges.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* PAYMENT METHOD */}
              <div className="mb-6 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('prepaid')}
                  className={`p-4 border-2 rounded-xl flex gap-2 justify-center ${paymentMethod === 'prepaid'
                    ? 'border-foreground bg-foreground/10'
                    : 'border-border'
                    }`}
                >
                  <CreditCard /> Online Pay
                </button>

                <button
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 border-2 rounded-xl flex gap-2 justify-center ${paymentMethod === 'cod'
                    ? 'border-foreground bg-foreground/10'
                    : 'border-border'
                    }`}
                >
                  <Banknote /> COD
                </button>
              </div>

              {/* COUPON */}
              {!appliedCoupon ? (
                <div className="flex gap-2 mb-6">
                  <input
                    className="flex-1 glass px-4 py-3 rounded-lg"
                    placeholder="Enter coupon"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  />
                  <button
                    onClick={applyCoupon}
                    className="glass px-4 rounded-lg"
                  >
                    Apply
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center bg-green-500/10 p-3 rounded-lg mb-6">
                  <span className="text-green-500 font-medium">
                    {appliedCoupon.code} (-{appliedCoupon.discount}%)
                  </span>
                  <button onClick={() => setAppliedCoupon(null)}>
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* FORM */}
              <form onSubmit={handleProceedToPayment} className="space-y-4">
                <input
                  placeholder="Full Name"
                  className="w-full glass p-3 rounded-xl"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <input
                  placeholder="Phone"
                  className="w-full glass p-3 rounded-xl"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />

                <input
                  placeholder="Email"
                  className="w-full glass p-3 rounded-xl"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />

                <textarea
                  placeholder="Delivery Address"
                  className="w-full glass p-3 rounded-xl"
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />

                <textarea
                  placeholder="Remarks (optional)"
                  className="w-full glass p-3 rounded-xl"
                  rows={2}
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                />

                <button
                  disabled={isSubmitting}
                  className="w-full glass-btn-primary py-4 text-lg flex justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" /> Processing...
                    </>
                  ) : paymentMethod === 'cod' ? (
                    <>
                      <Truck /> Place COD Order – ₹{total.toFixed(2)}
                    </>
                  ) : (
                    <>
                      <CreditCard /> Proceed to Pay – ₹{total.toFixed(2)}
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* PAYMENT SCREEN */}
              <div className="flex justify-between mb-4">
                <h2 className="text-2xl font-bold">Complete Payment</h2>
                <div className="flex gap-2 items-center text-muted-foreground">
                  <Clock size={16} />
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg mb-4 flex gap-2">
                <AlertTriangle className="text-yellow-500" />
                <p className="text-sm text-yellow-500">
                  Enter <b>{formData.phone}</b> as payment note
                </p>
              </div>

              <div className="text-center mb-5">
                <p className="text-sm text-muted-foreground">Amount to Pay</p>
                <p className="text-4xl font-bold">₹{total.toFixed(2)}</p>
              </div>

              {/* STATIC QR */}
              <div className="flex justify-center mb-6">
                <div className="glass p-4 rounded-2xl">
                  <img
                    src={upiQr}
                    alt="UPI QR"
                    className="w-56 h-56 object-contain"
                  />
                  <p className="text-xs text-center mt-2 text-muted-foreground">
                    Scan with any UPI app
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <button onClick={() => handleUpiAppOpen('gpay')} className="glass p-3 rounded-xl text-center">
                  <Smartphone className="mx-auto mb-1" />
                  GPay
                </button>
                <button onClick={() => handleUpiAppOpen('paytm')} className="glass p-3 rounded-xl text-center">
                  <Smartphone className="mx-auto mb-1" />
                  Paytm
                </button>
                <button onClick={() => handleUpiAppOpen('phonepe')} className="glass p-3 rounded-xl text-center">
                  <Smartphone className="mx-auto mb-1" />
                  PhonePe
                </button>
              </div>

              <button
                onClick={handlePaymentComplete}
                className="w-full glass-btn-primary py-4 flex justify-center gap-2 text-lg"
              >
                <Check /> I've Completed Payment
              </button>

              <button
                onClick={handlePaymentClose}
                className="w-full mt-3 glass py-3 rounded-xl text-muted-foreground"
              >
                Cancel
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BookingForm;