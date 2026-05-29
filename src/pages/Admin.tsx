import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Tag, Package, LogOut, Loader2,
  Plus, Trash2, Check, X, Download, MessageCircle,
  Upload, Image, Sparkles, Eye, EyeOff, Calendar, Edit, Printer, Settings, Palette
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CouponCode {
  id: string;
  code: string;
  discount_percent: number;
  is_active: boolean;
  usage_limit: number | null;
  used_count: number;
  expires_at: string | null;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  images: string[] | null;
  sizes: string[];
  category: string | null;
  instagram_url: string | null;
  stock_count: number;
  is_sold_out: boolean;
  is_active: boolean;
  created_at: string;
}

interface Booking {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  size: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_address: string;
  remarks: string | null;
  coupon_code: string | null;
  discount_percent: number;
  total_amount: number;
  status: string;
  payment_method: string | null;
  created_at: string;
}

interface Message {
  id: string;
  name: string;
  phone: string | null;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface Offer {
  id: string;
  title: string;
  description: string | null;
  discount_percent: number | null;
  is_active: boolean;
  created_at: string;
}

type AdminTab = 'products' | 'bookings' | 'coupons' | 'messages' | 'offers' | 'settings';

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [coupons, setCoupons] = useState<CouponCode[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Theme state
  const [themeColor, setThemeColor] = useState('#e01a4f');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#000000');

  // Booking details state
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);

  // Product form
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    instagramUrl: '',
    // legacy single stock/is_sold_out fields on `products`
    stockCount: '0',
    isSoldOut: false,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  });

  const [sizeInventory, setSizeInventory] = useState<Record<
    string,
    { stockCount: string; isSoldOut: boolean }
  >>({});

  const [productImages, setProductImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [uploadingProduct, setUploadingProduct] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Coupon form
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount_percent: 10,
    usage_limit: '',
    expires_at: ''
  });

  // Offer form
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerForm, setOfferForm] = useState({
    title: '',
    description: '',
    discount_percent: '',
  });

  // Date filter for bookings
  const [bookingDateFilter, setBookingDateFilter] = useState(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (!loading && user && !isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
      fetchUnreadCount();
      fetchThemeData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, activeTab]);

  const applyColorToRoot = (hex: string, cssVar: string) => {
    if (!hex) return;
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt('0x' + hex[1] + hex[1]);
      g = parseInt('0x' + hex[2] + hex[2]);
      b = parseInt('0x' + hex[3] + hex[3]);
    } else if (hex.length === 7) {
      r = parseInt('0x' + hex[1] + hex[2]);
      g = parseInt('0x' + hex[3] + hex[4]);
      b = parseInt('0x' + hex[5] + hex[6]);
    }
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h /= 6;
    }
    const hsl = `${Math.round(h * 360)} ${+(s * 100).toFixed(1)}% ${+(l * 100).toFixed(1)}%`;
    document.documentElement.style.setProperty(cssVar, hsl);
  };

  useEffect(() => {
    if (activeTab === 'settings') {
      applyColorToRoot(themeColor, '--primary');
      applyColorToRoot(themeColor, '--red-accent');
      applyColorToRoot(backgroundColor, '--background');
      applyColorToRoot(backgroundColor, '--card');
      applyColorToRoot(backgroundColor, '--popover');
      applyColorToRoot(textColor, '--foreground');
      applyColorToRoot(textColor, '--card-foreground');
      applyColorToRoot(textColor, '--popover-foreground');
    }
  }, [themeColor, backgroundColor, textColor, activeTab]);

  // Use site_settings table (which actually exists in the DB schema)
  const fetchThemeData = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (data) {
        const d = data as Record<string, unknown>;
        if (d['theme_color']) setThemeColor(d['theme_color'] as string);
        if (d['background_color']) setBackgroundColor(d['background_color'] as string);
        if (d['text_color']) setTextColor(d['text_color'] as string);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveThemeColor = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      const payload = {
        theme_color: themeColor,
        background_color: backgroundColor,
        text_color: textColor,
      } as Record<string, unknown>;

      if (data) {
        const row = data as Record<string, unknown>;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('site_settings') as any)
          .update(payload)
          .eq('id', row['id']);
        toast.success('Theme settings updated');
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('site_settings') as any).insert(payload);
        toast.success('Theme settings set');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to update theme settings');
    }
  };

  const fetchUnreadCount = async () => {
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);
    setUnreadCount(count || 0);
  };

  const fetchData = async () => {
    setLoadingData(true);
    try {
      if (activeTab === 'products') {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) console.error(error);
        // Cast to Product[] to handle any missing optional fields from DB type
        if (!error && data) setProducts(data as unknown as Product[]);

      } else if (activeTab === 'bookings') {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) {
          console.error('Bookings fetch error:', error);
          toast.error('Failed to load bookings. Did you run the SQL migrations?');
        }
        if (!error && data) setBookings(data as unknown as Booking[]);

      } else if (activeTab === 'coupons') {
        const { data, error } = await supabase
          .from('coupon_codes')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) console.error(error);
        if (!error && data) setCoupons(data);

      } else if (activeTab === 'messages') {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) console.error(error);
        if (!error && data) setMessages(data as unknown as Message[]);

      } else if (activeTab === 'offers') {
        const { data, error } = await supabase
          .from('offers')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) console.error(error);
        if (!error && data) setOffers(data);
      }
    } catch (err) {
      console.error('Fetch Data Error:', err);
      toast.error('An unexpected error occurred while loading data.');
    } finally {
      setLoadingData(false);
    }
  };

  // Product functions
  const resetProductForm = () => {
    setProductForm({
      name: '', description: '', price: '', originalPrice: '',
      category: '', instagramUrl: '', stockCount: '0',
      isSoldOut: false, sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    });
    setProductImages([]);
    setExistingImages([]);
    setEditingProduct(null);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    const sizes = product.sizes || ['S', 'M', 'L', 'XL', 'XXL'];

    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      originalPrice: product.original_price?.toString() || '',
      category: product.category || '',
      instagramUrl: product.instagram_url || '',
      stockCount: product.stock_count?.toString() || '0',
      isSoldOut: product.is_sold_out || false,
      sizes,
    });

    // Pre-fill per-size inventory from legacy fields as a fallback.
    // (Real values will be entered by admin; storefront uses derived `products.is_sold_out` too.)
    const fallback = Object.fromEntries(
      sizes.map((s) => [s, { stockCount: product.stock_count?.toString() || '0', isSoldOut: product.is_sold_out || false }])
    ) as Record<string, { stockCount: string; isSoldOut: boolean }>;

    setSizeInventory(fallback);

    setExistingImages(product.images || (product.image_url ? [product.image_url] : []));
    setProductImages([]);
    setShowProductForm(true);
  };


  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price) {
      toast.error('Please fill in required fields');
      return;
    }
    setUploadingProduct(true);
    try {
      const uploadedImageUrls: string[] = [...existingImages];
      for (const image of productImages) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(fileName, image);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('products').getPublicUrl(fileName);
        uploadedImageUrls.push(urlData.publicUrl);
      }

      const parsedSizeInventory = productForm.sizes.map((size) => {
        const row = sizeInventory[size] || { stockCount: '0', isSoldOut: false };
        const stock = Math.max(0, parseInt(row.stockCount) || 0);
        const soldOut = !!row.isSoldOut;
        return { size, stock, soldOut };
      });

      const derivedIsSoldOut =
        parsedSizeInventory.length > 0 && parsedSizeInventory.every((r) => r.soldOut || r.stock <= 0);

      // Keep legacy columns updated for backward compatibility.
      const totalStock = parsedSizeInventory.reduce((sum, r) => sum + r.stock, 0);

      const productData = {
        name: productForm.name,
        description: productForm.description || null,
        price: parseFloat(productForm.price),
        original_price: productForm.originalPrice ? parseFloat(productForm.originalPrice) : null,
        category: productForm.category || null,
        instagram_url: productForm.instagramUrl || null,
        stock_count: totalStock,
        is_sold_out: derivedIsSoldOut,
        sizes: productForm.sizes,
        image_url: uploadedImageUrls[0] || null,
        images: uploadedImageUrls.length > 0 ? uploadedImageUrls : null,
      };

      if (editingProduct) {
        const { error } = await supabase.from('products').update(productData).eq('id', editingProduct.id);
        if (error) throw error;

        const { error: invError } = await (supabase as any).from('product_size_inventory').upsert(
          parsedSizeInventory.map((r) => ({
            product_id: editingProduct.id,
            size: r.size,
            stock_count: r.stock,
            is_sold_out: r.soldOut,
          })),
          {
            onConflict: 'product_id,size',
          }
        );

        if (invError) throw invError;

        toast.success('Product updated successfully');
      } else {
        const { data: inserted, error } = await supabase
          .from('products')
          .insert({ ...productData, is_active: true })
          .select('id')
          .single();
        if (error) throw error;

        const { error: invError } = await (supabase as any).from('product_size_inventory').upsert(
          parsedSizeInventory.map((r) => ({
            product_id: inserted.id,
            size: r.size,
            stock_count: r.stock,
            is_sold_out: r.soldOut,
          })),
          {
            onConflict: 'product_id,size',
          }
        );

        if (invError) throw invError;

        toast.success('Product created successfully');
      }

      setShowProductForm(false);
      resetProductForm();
      fetchData();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setUploadingProduct(false);
    }
  };

  const toggleProductStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('products').update({ is_active: !currentStatus }).eq('id', id);
    if (!error) { toast.success(`Product ${!currentStatus ? 'activated' : 'deactivated'}`); fetchData(); }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) { toast.success('Product deleted'); fetchData(); }
  };

  const deleteBooking = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (!error) { toast.success('Order deleted'); fetchData(); }
  };

  const handlePrintBill = (booking: Booking) => {
    const billWindow = window.open('', '_blank');
    if (!billWindow) return;
    const logoUrl = window.location.origin + '/logo-placeholder.png';
    const paymentMethod = booking.payment_method?.toUpperCase() ?? 'PREPAID';
    const status = booking.status?.toUpperCase() ?? 'COMPLETED';
    const html = `
      <html>
        <head>
          <title>Bill - ${booking.id}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; color: #1a1a1a; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
            .logo { max-width: 150px; margin-bottom: 10px; }
            .details { margin-bottom: 30px; line-height: 1.6; display: flex; justify-content: space-between; }
            .items { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .items th, .items td { border-bottom: 1px solid #eee; padding: 12px 0; text-align: left; }
            .items th { color: #666; font-weight: 500; }
            .total { text-align: right; font-size: 1.2em; font-weight: bold; padding-top: 20px; border-top: 2px solid #eee; }
            .footer { text-align: center; color: #666; margin-top: 50px; font-size: 0.9em; }
          </style>
        </head>
        <body onload="setTimeout(() => window.print(), 500)">
          <div class="header">
            <img src="${logoUrl}" alt="YEOUBI Logo" class="logo" onerror="this.style.display='none'" />
            <div style="font-size: 28px; font-weight: bold; letter-spacing: 2px;">YEOUBI</div>
            <p>Premium Streetwear</p>
          </div>
          <div class="details">
            <div>
              <strong>Bill To:</strong><br>
              ${booking.customer_name}<br>
              ${booking.customer_phone} | ${booking.customer_email}<br>
              ${booking.customer_address}
            </div>
            <div style="text-align: right;">
              <strong>Order Details:</strong><br>
              Date: ${new Date(booking.created_at).toLocaleDateString()}<br>
              Payment: ${paymentMethod}<br>
              Status: ${status}
            </div>
          </div>
          <table class="items">
            <tr>
              <th>Item</th><th>Size</th><th>Qty</th><th style="text-align:right">Price</th>
            </tr>
            <tr>
              <td>${booking.product_name}</td>
              <td>${booking.size || 'N/A'}</td>
              <td>${booking.quantity}</td>
              <td style="text-align:right">Rs. ${booking.product_price}</td>
            </tr>
          </table>
          <div class="total"><p>Total Amount: Rs. ${booking.total_amount}</p></div>
          <div class="footer">Thank you for shopping with YEOUBI!</div>
        </body>
      </html>
    `;
    billWindow.document.write(html);
    billWindow.document.close();
  };

  // Coupon functions
  const handleCreateCoupon = async () => {
    if (!couponForm.code || !couponForm.discount_percent) {
      toast.error('Please fill in required fields'); return;
    }
    const { error } = await supabase.from('coupon_codes').insert({
      code: couponForm.code.toUpperCase(),
      discount_percent: couponForm.discount_percent,
      usage_limit: couponForm.usage_limit ? parseInt(couponForm.usage_limit) : null,
      expires_at: couponForm.expires_at || null,
    });
    if (error) { toast.error('Failed to create coupon'); }
    else {
      toast.success('Coupon created successfully');
      setShowCouponForm(false);
      setCouponForm({ code: '', discount_percent: 10, usage_limit: '', expires_at: '' });
      fetchData();
    }
  };

  const toggleCouponStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('coupon_codes').update({ is_active: !currentStatus }).eq('id', id);
    if (!error) { toast.success(`Coupon ${!currentStatus ? 'activated' : 'deactivated'}`); fetchData(); }
  };

  const deleteCoupon = async (id: string) => {
    const { error } = await supabase.from('coupon_codes').delete().eq('id', id);
    if (!error) { toast.success('Coupon deleted'); fetchData(); }
  };

  // Offer functions
  const handleCreateOffer = async () => {
    if (!offerForm.title) { toast.error('Please enter offer title'); return; }
    const { error } = await supabase.from('offers').insert({
      title: offerForm.title,
      description: offerForm.description || null,
      discount_percent: offerForm.discount_percent ? parseInt(offerForm.discount_percent) : null,
      is_active: true,
    });
    if (error) { toast.error('Failed to create offer'); }
    else {
      toast.success('Offer created successfully');
      setShowOfferForm(false);
      setOfferForm({ title: '', description: '', discount_percent: '' });
      fetchData();
    }
  };

  const toggleOfferStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('offers').update({ is_active: !currentStatus }).eq('id', id);
    if (!error) { toast.success(`Offer ${!currentStatus ? 'activated' : 'deactivated'}`); fetchData(); }
  };

  const deleteOffer = async (id: string) => {
    const { error } = await supabase.from('offers').delete().eq('id', id);
    if (!error) { toast.success('Offer deleted'); fetchData(); }
  };

  // Message functions
  const markMessageRead = async (id: string, isRead: boolean) => {
    await supabase.from('messages').update({ is_read: !isRead }).eq('id', id);
    fetchData();
    fetchUnreadCount();
  };

  // CSV Export
  const downloadBookingsCSV = (filterDate?: string) => {
    let filtered = bookings;
    if (filterDate) {
      filtered = bookings.filter(b =>
        new Date(b.created_at).toISOString().split('T')[0] === filterDate
      );
    }
    const headers = ['ID', 'Product', 'Price', 'Qty', 'Size', 'Customer', 'Phone', 'Email', 'Address', 'Remarks', 'Coupon', 'Discount%', 'Total', 'Status', 'Payment', 'Date'];
    const rows = filtered.map(b => [
      b.id, b.product_name, b.product_price, b.quantity, b.size || '',
      b.customer_name, b.customer_phone, b.customer_email,
      b.customer_address.replace(/,/g, ';'),
      b.remarks?.replace(/,/g, ';') || '',
      b.coupon_code || '', b.discount_percent, b.total_amount, b.status,
      b.payment_method || '',
      new Date(b.created_at).toLocaleDateString(),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings_${filterDate || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getDailyStats = () => {
    const dateMap: Record<string, { count: number; total: number }> = {};
    bookings.forEach(b => {
      const date = new Date(b.created_at).toISOString().split('T')[0];
      if (!dateMap[date]) dateMap[date] = { count: 0, total: 0 };
      dateMap[date].count += 1;
      dateMap[date].total += b.total_amount;
    });
    return dateMap;
  };

  const dailyStats = getDailyStats();
  const filteredBookings = bookings.filter(b =>
    new Date(b.created_at).toISOString().split('T')[0] === bookingDateFilter
  );
  const todayStats = dailyStats[bookingDateFilter] || { count: 0, total: 0 };

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  const tabs = [
    { id: 'products' as AdminTab, label: 'Products', icon: Package },
    { id: 'bookings' as AdminTab, label: 'Bookings', icon: Users },
    { id: 'coupons' as AdminTab, label: 'Coupons', icon: Tag },
    { id: 'messages' as AdminTab, label: 'Messages', icon: MessageCircle, badge: unreadCount },
    { id: 'offers' as AdminTab, label: 'Offers', icon: Sparkles },
    { id: 'settings' as AdminTab, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-strong border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-display font-bold">Admin Panel</h1>
            <span className="text-sm text-muted-foreground bg-red-accent/20 text-red-accent px-2 py-1 rounded">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="text-sm text-muted-foreground hover:text-foreground">
              View Store
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 glass px-4 py-2 rounded-lg hover:bg-muted transition-colors"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors relative ${activeTab === tab.id ? 'bg-foreground text-background' : 'glass hover:bg-muted'
                }`}
            >
              <tab.icon size={18} />
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-accent text-white text-xs rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card">
          {loadingData ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin" size={32} /></div>
          ) : (
            <>
              {/* ── Products Tab ── */}
              {activeTab === 'products' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Products</h2>
                    <button onClick={() => setShowProductForm(!showProductForm)} className="flex items-center gap-2 glass-btn-primary">
                      <Plus size={18} /> Add Product
                    </button>
                  </div>

                  {showProductForm && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass p-6 rounded-lg mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Product Name *" value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          className="glass px-4 py-2 rounded-lg" />
                        <input type="number" placeholder="Price (₹) *" value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          className="glass px-4 py-2 rounded-lg" />
                        <input type="number" placeholder="Original Price (₹) - for discount" value={productForm.originalPrice}
                          onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                          className="glass px-4 py-2 rounded-lg" />
                        <input type="text" placeholder="Category" value={productForm.category}
                          onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                          className="glass px-4 py-2 rounded-lg" />
                        <input type="url" placeholder="Instagram URL (optional)" value={productForm.instagramUrl}
                          onChange={(e) => setProductForm({ ...productForm, instagramUrl: e.target.value })}
                          className="glass px-4 py-2 rounded-lg" />
                        <div className="md:col-span-2">
                          <h4 className="font-medium mb-2">Size Inventory</h4>
                          <p className="text-xs text-muted-foreground mb-3">Enter stock count and sold-out per size chart.</p>
                          <div className="space-y-3">
                            {productForm.sizes.map((size) => {
                              const row = sizeInventory[size] || { stockCount: '0', isSoldOut: false };
                              return (
                                <div key={size} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                                  <div className="glass px-4 py-2 rounded-lg">{size}</div>
                                  <input
                                    type="number"
                                    min={0}
                                    placeholder="Stock"
                                    value={row.stockCount}
                                    onChange={(e) =>
                                      setSizeInventory((prev) => ({
                                        ...prev,
                                        [size]: { ...row, stockCount: e.target.value },
                                      }))
                                    }
                                    className="glass px-4 py-2 rounded-lg"
                                  />
                                  <label className="flex items-center gap-2 glass px-4 py-2 rounded-lg justify-start">
                                    <input
                                      type="checkbox"
                                      checked={row.isSoldOut}
                                      onChange={(e) =>
                                        setSizeInventory((prev) => ({
                                          ...prev,
                                          [size]: { ...row, isSoldOut: e.target.checked },
                                        }))
                                      }
                                    />
                                    Sold Out
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 md:col-span-2">
                          <input type="file" ref={fileInputRef} accept="image/*" multiple
                            onChange={(e) => { if (e.target.files) setProductImages(prev => [...prev, ...Array.from(e.target.files!)]); }}
                            className="hidden" />
                          <button onClick={() => fileInputRef.current?.click()}
                            className="glass px-4 py-2 rounded-lg flex items-center gap-2 justify-center hover:bg-muted">
                            <Upload size={18} /> Add Images ({productImages.length} new)
                          </button>
                          {existingImages.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              <span className="text-sm text-muted-foreground w-full">Existing:</span>
                              {existingImages.map((img, idx) => (
                                <div key={`ex-${idx}`} className="relative">
                                  <img src={img} alt="" className="w-16 h-16 object-cover rounded-lg" />
                                  <button onClick={() => setExistingImages(prev => prev.filter((_, i) => i !== idx))}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-accent text-white rounded-full flex items-center justify-center text-xs">
                                    <X size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          {productImages.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              <span className="text-sm text-muted-foreground w-full">New:</span>
                              {productImages.map((img, idx) => (
                                <div key={`new-${idx}`} className="relative">
                                  <img src={URL.createObjectURL(img)} alt="" className="w-16 h-16 object-cover rounded-lg" />
                                  <button onClick={() => setProductImages(prev => prev.filter((_, i) => i !== idx))}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-accent text-white rounded-full flex items-center justify-center text-xs">
                                    <X size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <textarea placeholder="Description" value={productForm.description}
                          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                          className="glass px-4 py-2 rounded-lg md:col-span-2" rows={2} />
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button onClick={handleSaveProduct} disabled={uploadingProduct} className="glass-btn-primary flex items-center gap-2">
                          {uploadingProduct && <Loader2 size={16} className="animate-spin" />}
                          {editingProduct ? 'Update Product' : 'Create Product'}
                        </button>
                        <button onClick={() => { setShowProductForm(false); resetProductForm(); }} className="glass px-4 py-2 rounded-lg hover:bg-muted">
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <div key={product.id} className="glass p-4 rounded-lg relative">
                        {product.is_sold_out && (
                          <span className="absolute top-2 left-2 z-10 bg-red-accent text-white px-2 py-1 rounded text-xs font-bold">SOLD OUT</span>
                        )}
                        <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
                          {product.image_url
                            ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><Image size={32} className="text-muted-foreground" /></div>}
                        </div>
                        <h3 className="font-bold">{product.name}</h3>
                        <p className="text-muted-foreground text-sm line-clamp-2">{product.description}</p>
                        <div className="flex items-baseline justify-between mt-2">
                          <div className="flex items-baseline gap-2">
                            <p className="text-lg font-bold">₹{product.price}</p>
                            {product.original_price && <p className="text-sm text-muted-foreground line-through">₹{product.original_price}</p>}
                          </div>
                          <span className="text-xs text-muted-foreground">Stock: {product.stock_count || 0}</span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => openEditProduct(product)}
                            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-sm glass hover:bg-muted">
                            <Edit size={14} /> Edit
                          </button>
                          <button onClick={() => toggleProductStatus(product.id, product.is_active)}
                            className={`p-2 rounded-lg text-sm ${product.is_active ? 'glass hover:bg-muted' : 'bg-green-500/20 text-green-500'}`}>
                            {product.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button onClick={() => deleteProduct(product.id)}
                            className="p-2 glass rounded-lg hover:bg-red-accent/20 text-red-accent">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {products.length === 0 && (
                      <div className="col-span-full text-center py-12 text-muted-foreground">No products yet. Add your first product!</div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Bookings Tab ── */}
              {activeTab === 'bookings' && (
                <div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h2 className="text-xl font-bold">Bookings</h2>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-muted-foreground" />
                        <input type="date" value={bookingDateFilter}
                          onChange={(e) => setBookingDateFilter(e.target.value)}
                          className="glass px-3 py-2 rounded-lg" />
                      </div>
                      <button onClick={() => downloadBookingsCSV(bookingDateFilter)} disabled={filteredBookings.length === 0}
                        className="flex items-center gap-2 glass px-3 py-2 rounded-lg hover:bg-muted disabled:opacity-50">
                        <Download size={18} /> Day CSV
                      </button>
                      <button onClick={() => downloadBookingsCSV()} disabled={bookings.length === 0}
                        className="flex items-center gap-2 glass-btn-primary disabled:opacity-50">
                        <Download size={18} /> All CSV
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="glass p-4 rounded-lg text-center">
                      <p className="text-muted-foreground text-sm">Selected Day Orders</p>
                      <p className="text-2xl font-bold">{todayStats.count}</p>
                    </div>
                    <div className="glass p-4 rounded-lg text-center">
                      <p className="text-muted-foreground text-sm">Selected Day Revenue</p>
                      <p className="text-2xl font-bold text-green-500">₹{todayStats.total.toLocaleString()}</p>
                    </div>
                    <div className="glass p-4 rounded-lg text-center">
                      <p className="text-muted-foreground text-sm">Total Orders</p>
                      <p className="text-2xl font-bold">{bookings.length}</p>
                    </div>
                    <div className="glass p-4 rounded-lg text-center">
                      <p className="text-muted-foreground text-sm">Total Revenue</p>
                      <p className="text-2xl font-bold text-green-500">
                        ₹{bookings.reduce((sum, b) => sum + b.total_amount, 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left">
                          <th className="pb-4 font-medium">Product</th>
                          <th className="pb-4 font-medium">Customer</th>
                          <th className="pb-4 font-medium">Contact</th>
                          <th className="pb-4 font-medium">Size</th>
                          <th className="pb-4 font-medium">Total</th>
                          <th className="pb-4 font-medium">Status</th>
                          <th className="pb-4 font-medium">Date</th>
                          <th className="pb-4 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.map((booking) => (
                          <tr key={booking.id} className="border-b border-border/50">
                            <td className="py-4">{booking.product_name}</td>
                            <td className="py-4">
                              <div>{booking.customer_name}</div>
                              <div className="text-xs text-muted-foreground">{booking.customer_address.substring(0, 30)}...</div>
                            </td>
                            <td className="py-4">
                              <div>{booking.customer_phone}</div>
                              <div className="text-xs text-muted-foreground">{booking.customer_email}</div>
                            </td>
                            <td className="py-4">{booking.size}</td>
                            <td className="py-4 font-bold">₹{booking.total_amount}</td>
                            <td className="py-4">
                              <span className="px-2 py-1 rounded text-xs bg-yellow-500/20 text-yellow-500">{booking.status}</span>
                            </td>
                            <td className="py-4 text-muted-foreground">{new Date(booking.created_at).toLocaleDateString()}</td>
                            <td className="py-4">
                              <div className="flex gap-2">
                                <button onClick={() => { setSelectedBooking(booking); setShowBookingDetails(true); }}
                                  className="p-2 glass rounded-lg hover:bg-muted" title="View Details">
                                  <Eye size={16} />
                                </button>
                                <button onClick={() => deleteBooking(booking.id)}
                                  className="p-2 glass rounded-lg hover:bg-red-accent/20 text-red-accent" title="Delete">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredBookings.length === 0 && (
                          <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">No bookings for {bookingDateFilter}</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── Coupons Tab ── */}
              {activeTab === 'coupons' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Coupon Codes</h2>
                    <button onClick={() => setShowCouponForm(!showCouponForm)} className="flex items-center gap-2 glass-btn-primary">
                      <Plus size={18} /> Add Coupon
                    </button>
                  </div>
                  {showCouponForm && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass p-4 rounded-lg mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input type="text" placeholder="Code (e.g., SUMMER20)" value={couponForm.code}
                          onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                          className="glass px-4 py-2 rounded-lg" />
                        <input type="number" placeholder="Discount %" value={couponForm.discount_percent} min="1" max="100"
                          onChange={(e) => setCouponForm({ ...couponForm, discount_percent: parseInt(e.target.value) })}
                          className="glass px-4 py-2 rounded-lg" />
                        <input type="number" placeholder="Usage limit (optional)" value={couponForm.usage_limit}
                          onChange={(e) => setCouponForm({ ...couponForm, usage_limit: e.target.value })}
                          className="glass px-4 py-2 rounded-lg" />
                        <input type="date" value={couponForm.expires_at}
                          onChange={(e) => setCouponForm({ ...couponForm, expires_at: e.target.value })}
                          className="glass px-4 py-2 rounded-lg" />
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button onClick={handleCreateCoupon} className="glass-btn-primary">Create Coupon</button>
                        <button onClick={() => setShowCouponForm(false)} className="glass px-4 py-2 rounded-lg hover:bg-muted">Cancel</button>
                      </div>
                    </motion.div>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border text-left">
                          <th className="pb-4 font-medium">Code</th>
                          <th className="pb-4 font-medium">Discount</th>
                          <th className="pb-4 font-medium">Usage</th>
                          <th className="pb-4 font-medium">Status</th>
                          <th className="pb-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {coupons.map((coupon) => (
                          <tr key={coupon.id} className="border-b border-border/50">
                            <td className="py-4 font-mono font-bold">{coupon.code}</td>
                            <td className="py-4">{coupon.discount_percent}%</td>
                            <td className="py-4 text-muted-foreground">{coupon.used_count} / {coupon.usage_limit || '∞'}</td>
                            <td className="py-4">
                              <span className={`px-2 py-1 rounded text-xs ${coupon.is_active ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                                {coupon.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="py-4">
                              <div className="flex gap-2">
                                <button onClick={() => toggleCouponStatus(coupon.id, coupon.is_active)} className="p-2 glass rounded hover:bg-muted"
                                  title={coupon.is_active ? 'Deactivate' : 'Activate'}>
                                  {coupon.is_active ? <X size={16} /> : <Check size={16} />}
                                </button>
                                <button onClick={() => deleteCoupon(coupon.id)} className="p-2 glass rounded hover:bg-red-accent/20 text-red-accent">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {coupons.length === 0 && (
                          <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No coupons found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── Messages Tab ── */}
              {activeTab === 'messages' && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Customer Messages</h2>
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`glass p-4 rounded-lg ${!msg.is_read ? 'border-l-4 border-red-accent' : ''}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{msg.name}</span>
                              {!msg.is_read && <span className="text-xs bg-red-accent/20 text-red-accent px-2 py-0.5 rounded">New</span>}
                            </div>
                            <p className="text-sm text-muted-foreground">{msg.email} • {msg.phone}</p>
                            <p className="mt-2">{msg.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">{new Date(msg.created_at).toLocaleString()}</p>
                          </div>
                          <button onClick={() => markMessageRead(msg.id, msg.is_read)} className="p-2 glass rounded-lg hover:bg-muted">
                            {msg.is_read ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    ))}
                    {messages.length === 0 && <div className="text-center py-12 text-muted-foreground">No messages yet</div>}
                  </div>
                </div>
              )}

              {/* ── Offers Tab ── */}
              {activeTab === 'offers' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Promotional Offers</h2>
                    <button onClick={() => setShowOfferForm(!showOfferForm)} className="flex items-center gap-2 glass-btn-primary">
                      <Plus size={18} /> Add Offer
                    </button>
                  </div>
                  {showOfferForm && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass p-4 rounded-lg mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="text" placeholder="Offer Title *" value={offerForm.title}
                          onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                          className="glass px-4 py-2 rounded-lg" />
                        <input type="text" placeholder="Description" value={offerForm.description}
                          onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                          className="glass px-4 py-2 rounded-lg" />
                        <input type="number" placeholder="Discount % (optional)" value={offerForm.discount_percent}
                          onChange={(e) => setOfferForm({ ...offerForm, discount_percent: e.target.value })}
                          className="glass px-4 py-2 rounded-lg" />
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button onClick={handleCreateOffer} className="glass-btn-primary">Create Offer</button>
                        <button onClick={() => setShowOfferForm(false)} className="glass px-4 py-2 rounded-lg hover:bg-muted">Cancel</button>
                      </div>
                    </motion.div>
                  )}
                  <div className="space-y-4">
                    {offers.map((offer) => (
                      <div key={offer.id} className="glass p-4 rounded-lg flex items-center justify-between">
                        <div>
                          <h3 className="font-bold">{offer.title}</h3>
                          {offer.description && <p className="text-muted-foreground text-sm">{offer.description}</p>}
                          {offer.discount_percent && (
                            <span className="text-xs bg-red-accent/20 text-red-accent px-2 py-0.5 rounded mt-2 inline-block">
                              {offer.discount_percent}% OFF
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => toggleOfferStatus(offer.id, offer.is_active)}
                            className={`p-2 rounded-lg ${offer.is_active ? 'glass hover:bg-muted' : 'bg-green-500/20 text-green-500'}`}>
                            {offer.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                          <button onClick={() => deleteOffer(offer.id)} className="p-2 glass rounded-lg hover:bg-red-accent/20 text-red-accent">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {offers.length === 0 && <div className="text-center py-12 text-muted-foreground">No offers yet</div>}
                  </div>
                </div>
              )}

              {/* ── Settings Tab ── */}
              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Store Settings</h2>
                  <div className="glass p-6 rounded-lg max-w-md">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2"><Palette size={18} /> Theme Colors</h3>
                    <p className="text-sm text-muted-foreground mb-6">Customize the colors of your store. Changes are reflected instantly.</p>
                    <div className="space-y-4 mb-6">
                      {[
                        { label: 'Background Color', value: backgroundColor, setter: setBackgroundColor },
                        { label: 'Text Color', value: textColor, setter: setTextColor },
                        { label: 'Accent Color', value: themeColor, setter: setThemeColor },
                      ].map(({ label, value, setter }) => (
                        <div key={label} className="flex items-center justify-between">
                          <span>{label}</span>
                          <div className="flex items-center gap-4">
                            <span className="font-mono text-sm text-muted-foreground">{value.toUpperCase()}</span>
                            <input type="color" value={value} onChange={(e) => setter(e.target.value)}
                              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={handleSaveThemeColor} className="glass-btn-primary w-full">Save Changes</button>
                  </div>
                </div>
              )}

              {/* ── Booking Details Modal ── */}
              {showBookingDetails && selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                  <div className="glass-strong rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
                    <button onClick={() => setShowBookingDetails(false)}
                      className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors">
                      <X size={20} />
                    </button>
                    <h2 className="text-2xl font-bold mb-6">Order Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <h3 className="font-semibold text-muted-foreground mb-2">Customer Info</h3>
                        <p className="font-medium text-lg">{selectedBooking.customer_name}</p>
                        <p>{selectedBooking.customer_email}</p>
                        <p>{selectedBooking.customer_phone}</p>
                        <div className="mt-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg">{selectedBooking.customer_address}</div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-muted-foreground mb-2">Order Info</h3>
                        <p><span className="text-muted-foreground">Date:</span> {new Date(selectedBooking.created_at).toLocaleString()}</p>
                        <p><span className="text-muted-foreground">Status:</span> <span className="font-medium">{selectedBooking.status}</span></p>
                        <p><span className="text-muted-foreground">Payment:</span> <span className="font-medium">{selectedBooking.payment_method?.toUpperCase() ?? 'PREPAID'}</span></p>
                        <p><span className="text-muted-foreground">ID:</span> {selectedBooking.id}</p>
                      </div>
                    </div>
                    <div className="border-t border-border/50 pt-6 mb-6">
                      <h3 className="font-semibold text-muted-foreground mb-4">Item Details</h3>
                      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-bold text-lg">{selectedBooking.product_name}</p>
                          <p className="text-muted-foreground">Size: {selectedBooking.size || 'N/A'}</p>
                          {selectedBooking.remarks && (
                            <p className="text-sm mt-2"><span className="font-medium">Remarks:</span> {selectedBooking.remarks}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p>Qty: {selectedBooking.quantity}</p>
                          <p className="font-bold text-xl mt-2">₹{selectedBooking.total_amount}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-8">
                      <button onClick={() => setShowBookingDetails(false)} className="glass px-6 py-2 rounded-lg">Close</button>
                      <button onClick={() => handlePrintBill(selectedBooking)} className="glass-btn-primary flex items-center gap-2 px-6 py-2">
                        <Printer size={18} /> Print Bill
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Admin;