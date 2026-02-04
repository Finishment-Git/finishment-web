'use client'; 
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from "@/utils/supabase/client";

// Prevent static generation - this page requires authentication
export const dynamic = 'force-dynamic';

export default function DealerOrderingPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [dealer, setDealer] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Form data - Basic Information
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    purchaseOrderNumber: '',
    email: '',
    sidemark: '',
    phone: '',
    stairType: '' as 'standard_bullnose' | 'other' | '',
    stepsNoOpenReturn: 0,
    stepsOneOpenReturn: 0,
    stepsTwoOpenReturn: 0,
    longestPlankSize: '',
    stepsDetails: '',
    railCapTrimNeeded: false,
    railCapTrimDetails: '',
    manufacturer: '',
    style: '',
    color: '',
    floorMatchDescription: '',
  });

  // Shipping address
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'check' | 'ach'>('card');
  const [notes, setNotes] = useState('');
  const [projectImages, setProjectImages] = useState<Array<{url: string; fileName: string; fileSize: number; fileType: string}>>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [needsShipping, setNeedsShipping] = useState(false);

  // Check authorization on mount
  useEffect(() => {
    const checkAuthorization = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        router.push('/dealer-login');
        return;
      }

      setUser(authUser);

      // Get user profile with dealer info
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          dealers (*)
        `)
        .eq('id', authUser.id)
        .single();

      if (profileError || !profileData) {
        console.error('Profile error:', profileError);
        alert(`Error loading profile: ${profileError?.message || 'Profile not found'}. Please contact support.`);
        router.push('/dealer-login');
        return;
      }

      setUserProfile(profileData);
      setDealer(profileData.dealers);

      // Pre-populate form fields from user and dealer data
      const fullName = authUser.user_metadata?.full_name || '';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setFormData(prev => ({
        ...prev,
        firstName,
        lastName,
        company: profileData.dealers?.company_name || '',
        email: authUser.email || '',
        phone: authUser.phone || '',
      }));

      setShippingAddress(prev => ({
        ...prev,
        name: fullName,
        company: profileData.dealers?.company_name || '',
        phone: authUser.phone || '',
      }));

      // Check if user can order: must be ACTIVE and (primary OR can_order)
      if (profileData.status === 'ACTIVE' && (profileData.is_primary || profileData.can_order)) {
        setAuthorized(true);
      } else {
        router.push('/dealer/dashboard');
      }
      
      setLoading(false);
    };

    checkAuthorization();
  }, [router, supabase]);

  // Prevent navigation away from order page if form not submitted
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!formSubmitted && !success) {
        e.preventDefault();
        e.returnValue = 'Order not submitted. You will lose your work if you exit now.';
        return e.returnValue;
      }
    };

    // Intercept all link clicks
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && !formSubmitted && !success) {
        const href = link.getAttribute('href');
        if (href && href !== '/dealer/ordering' && !href.startsWith('#')) {
          e.preventDefault();
          const shouldLeave = window.confirm('Order not submitted. You will lose your work if you exit now. Are you sure you want to leave?');
          if (shouldLeave) {
            router.push(href);
          }
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleLinkClick, true);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleLinkClick, true);
    };
  }, [formSubmitted, success, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const uploadedUrls: Array<{url: string; fileName: string; fileSize: number; fileType: string}> = [];

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not an image file. Please upload only images.`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} is too large. Please upload images smaller than 5MB.`);
          continue;
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user?.id}/${fileName}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('order-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          if (uploadError.message?.includes('bucket') || uploadError.message?.includes('not found')) {
            alert(`Storage bucket not found. Please contact support to set up the 'order-images' bucket in Supabase Storage.`);
          } else {
            alert(`Failed to upload ${file.name}: ${uploadError.message}`);
          }
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('order-images')
          .getPublicUrl(filePath);

        if (urlData?.publicUrl) {
          uploadedUrls.push({
            url: urlData.publicUrl,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
          });
          setUploadedFiles(prev => [...prev, file]);
        }
      }

      setProjectImages(prev => [...prev, ...uploadedUrls]);
    } catch (err: any) {
      console.error('Image upload error:', err);
      alert(`Error uploading images: ${err.message}`);
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    setProjectImages(prev => prev.filter((_, i) => i !== index));
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      setError('First Name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last Name is required');
      return false;
    }
    if (!formData.purchaseOrderNumber.trim()) {
      setError('Purchase Order # is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.sidemark.trim()) {
      setError('Sidemark/Project Name is required');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone is required');
      return false;
    }
    const totalSteps = formData.stepsNoOpenReturn + formData.stepsOneOpenReturn + formData.stepsTwoOpenReturn;
    if (totalSteps === 0) {
      setError('Please enter the number of steps for at least one stair layout option');
      return false;
    }
    if (!formData.longestPlankSize.trim()) {
      setError('Longest plank size is required');
      return false;
    }
    if (!formData.stepsDetails.trim()) {
      setError('Steps details are required (e.g., "18 Steps at 55 inches")');
      return false;
    }
    if (!formData.manufacturer.trim()) {
      setError('Manufacturer is required');
      return false;
    }
    if (!formData.style.trim()) {
      setError('Style is required');
      return false;
    }
    if (!formData.color.trim()) {
      setError('Color is required');
      return false;
    }
    if (needsShipping && (!shippingAddress.name.trim() || !shippingAddress.address1.trim() || 
        !shippingAddress.city.trim() || !shippingAddress.state.trim() || 
        !shippingAddress.zip.trim() || !shippingAddress.phone.trim())) {
      setError('Please complete all required shipping address fields');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Calculate total (for now, we'll use a placeholder since pricing is TBD)
      // In the future, this will be calculated based on the order details
      const totalAmountCents = 0; // Placeholder - will be calculated by admin

      const orderData = {
        // Basic information
        first_name: formData.firstName,
        last_name: formData.lastName,
        company: formData.company,
        purchase_order_number: formData.purchaseOrderNumber,
        sidemark: formData.sidemark,
        phone: formData.phone,
        email: formData.email,
        
        // Stair details
        stair_type: formData.stairType,
        steps_no_open_return: formData.stepsNoOpenReturn,
        steps_one_open_return: formData.stepsOneOpenReturn,
        steps_two_open_return: formData.stepsTwoOpenReturn,
        longest_plank_size: formData.longestPlankSize,
        steps_details: formData.stepsDetails,
        
        // Flooring match information
        manufacturer: formData.manufacturer,
        style: formData.style,
        color: formData.color,
        floor_match_description: formData.floorMatchDescription,
        
        // Rail cap trim
        rail_cap_trim_needed: formData.railCapTrimNeeded,
        rail_cap_trim_details: formData.railCapTrimDetails || null,
        
        // Images - send both URL array (for backward compatibility) and metadata
        project_images: projectImages.map(img => img.url),
        image_metadata: projectImages,
        
        // Payment and shipping
        payment_method: paymentMethod,
        total_amount_cents: totalAmountCents,
        shipping_address: needsShipping ? shippingAddress : null,
        contact_info: {
          email: formData.email,
          phone: formData.phone,
          name: `${formData.firstName} ${formData.lastName}`,
        },
        notes: notes.trim() || null,
      };

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      setOrderNumber(data.order.order_number);
      setSuccess(true);
      setFormSubmitted(true); // Allow navigation after successful submission
    } catch (err: any) {
      console.error('Order submission error:', err);
      setError(err.message || 'Failed to submit order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#ffffff', color: '#000000' }}>
        <p style={{ color: '#000000' }}>Loading...</p>
      </div>
    );
  }

  if (!authorized) {
    return null; // Will redirect
  }

  if (success) {
  return (
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '40px', backgroundColor: '#ffffff' }}>
        <div style={{ 
          background: '#ecfdf5',
          border: '2px solid #059669',
          padding: '24px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#059669' }}>
            Order Submitted Successfully!
          </h2>
          <p style={{ fontSize: '18px', marginBottom: '8px', color: '#000' }}>
            Order Number: <strong>{orderNumber}</strong>
          </p>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
            {paymentMethod === 'card' 
              ? "We'll contact you to process your credit card payment."
              : paymentMethod === 'check'
              ? "Please send your check with the order number included."
              : "Please complete ACH transfer with the order number as reference."
            }
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              setFormData({
                firstName: '',
                lastName: '',
                company: dealer?.company_name || '',
                purchaseOrderNumber: '',
                email: user?.email || '',
                sidemark: '',
                phone: user?.phone || '',
                stairType: '',
                stepsNoOpenReturn: 0,
                stepsOneOpenReturn: 0,
                stepsTwoOpenReturn: 0,
                longestPlankSize: '',
                stepsDetails: '',
                railCapTrimNeeded: false,
                railCapTrimDetails: '',
                manufacturer: '',
                style: '',
                color: '',
                floorMatchDescription: '',
              });
              setProjectImages([]);
              setUploadedFiles([]);
            }}
            style={{
              padding: '12px 24px',
              background: '#000',
              color: '#fff',
              border: 'none',
          borderRadius: '6px', 
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '16px'
            }}
          >
            Place Another Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
      <div style={{ 
        maxWidth: '1000px', 
        margin: '0 auto', 
        padding: '40px 20px', 
        backgroundColor: '#f5f0e8', 
        color: '#3d2817',
        minHeight: '100vh'
      }}>
        <h1 style={{
        fontSize: '36px', 
        fontWeight: 'bold', 
        marginBottom: '12px', 
        color: '#3d2817',
        fontFamily: 'Georgia, serif',
        letterSpacing: '-0.5px'
      }}>
        We Look Forward to Helping You
      </h1>

      {error && (
        <div style={{ 
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#b91c1c',
          padding: '14px', 
          borderRadius: '8px', 
          marginBottom: '24px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        {/* Basic Information Section */}
        <div style={{ 
          background: '#ffffff', 
          padding: '32px', 
          borderRadius: '12px', 
          marginBottom: '28px',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            marginBottom: '24px', 
            color: '#3d2817',
            fontFamily: 'Georgia, serif'
          }}>
            Basic Information
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500', 
                fontSize: '14px',
                color: '#3d2817'
              }}>
                First Name <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                placeholder="First Name"
                required
                style={{
                  width: '100%',
                  maxWidth: '300px',
                  padding: '10px 12px',
                  border: '1px solid #e5ddd4',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#faf8f3',
                  color: '#3d2817',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#c9a882';
                  e.target.style.backgroundColor = '#ffffff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5ddd4';
                  e.target.style.backgroundColor = '#faf8f3';
                }}
              />
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500', 
                fontSize: '14px',
                color: '#3d2817'
              }}>
                Last Name <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                placeholder="Last Name"
                required
                style={{
                  width: '100%',
                  maxWidth: '300px',
                  padding: '10px 12px',
                  border: '1px solid #e5ddd4',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#faf8f3',
                  color: '#3d2817',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#c9a882';
                  e.target.style.backgroundColor = '#ffffff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5ddd4';
                  e.target.style.backgroundColor = '#faf8f3';
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500', 
                fontSize: '14px',
                color: '#3d2817'
              }}>
                Company
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                placeholder="Company"
                style={{
                  width: '100%',
                  maxWidth: '300px',
                  padding: '10px 12px',
                  border: '1px solid #e5ddd4',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#faf8f3',
                  color: '#3d2817',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#c9a882';
                  e.target.style.backgroundColor = '#ffffff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5ddd4';
                  e.target.style.backgroundColor = '#faf8f3';
                }}
              />
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500', 
                fontSize: '14px',
                color: '#3d2817'
              }}>
                Purchase Order # <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.purchaseOrderNumber}
                onChange={(e) => setFormData({...formData, purchaseOrderNumber: e.target.value})}
                placeholder="PO #"
                required
                style={{
                  width: '100%',
                  maxWidth: '300px',
                  padding: '10px 12px',
                  border: '1px solid #e5ddd4',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#faf8f3',
                  color: '#3d2817',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#c9a882';
                  e.target.style.backgroundColor = '#ffffff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5ddd4';
                  e.target.style.backgroundColor = '#faf8f3';
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500', 
                fontSize: '14px',
                color: '#3d2817'
              }}>
                Email <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Email Address"
                required
                style={{
                  width: '100%',
                  maxWidth: '300px',
                  padding: '10px 12px',
                  border: '1px solid #e5ddd4',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#faf8f3',
                  color: '#3d2817',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#c9a882';
                  e.target.style.backgroundColor = '#ffffff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5ddd4';
                  e.target.style.backgroundColor = '#faf8f3';
                }}
              />
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500', 
                fontSize: '14px',
                color: '#3d2817'
              }}>
                Sidemark <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.sidemark}
                onChange={(e) => setFormData({...formData, sidemark: e.target.value})}
                placeholder="Sidemark/Project Name"
                required
                style={{
                  width: '100%',
                  maxWidth: '300px',
                  padding: '10px 12px',
                  border: '1px solid #e5ddd4',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#faf8f3',
                  color: '#3d2817',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#c9a882';
                  e.target.style.backgroundColor = '#ffffff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5ddd4';
                  e.target.style.backgroundColor = '#faf8f3';
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '500', 
              fontSize: '14px',
              color: '#3d2817'
            }}>
              Phone <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="Phone Number"
              required
              style={{
                width: '100%',
                maxWidth: '300px',
                padding: '10px 12px',
                border: '1px solid #e5ddd4',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: '#faf8f3',
                color: '#3d2817',
                transition: 'all 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#c9a882';
                e.target.style.backgroundColor = '#ffffff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5ddd4';
                e.target.style.backgroundColor = '#faf8f3';
              }}
            />
          </div>
        </div>

        {/* Stair Type Selection */}
        <div style={{ 
          background: '#ffffff', 
          padding: '24px', 
          borderRadius: '8px', 
          marginBottom: '24px',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#000000' }}>
            Select type of nosing <span style={{ color: '#dc2626' }}>*</span>
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <label style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px',
              border: formData.stairType === 'standard_bullnose' ? '2px solid #000' : '1px solid #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer',
              background: formData.stairType === 'standard_bullnose' ? '#f9fafb' : '#fff',
              transition: 'all 0.2s'
            }}>
              <input
                type="radio"
                name="stairType"
                value="standard_bullnose"
                checked={formData.stairType === 'standard_bullnose'}
                onChange={(e) => setFormData({...formData, stairType: e.target.value as 'standard_bullnose'})}
                style={{ marginBottom: '12px' }}
              />
              <div style={{ fontWeight: '600', marginBottom: '12px', textAlign: 'center' }}>
                Standard Bullnose with return
              </div>
              <img 
                src="/stnd_return.png" 
                alt="Standard Bullnose with return"
                style={{ 
                  width: '200px', 
                  height: '150px', 
                  objectFit: 'contain',
                  borderRadius: '4px'
                }}
              />
            </label>

            <label style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px',
              border: formData.stairType === 'other' ? '2px solid #000' : '1px solid #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer',
              background: formData.stairType === 'other' ? '#f9fafb' : '#fff',
              transition: 'all 0.2s'
            }}>
              <input
                type="radio"
                name="stairType"
                value="other"
                checked={formData.stairType === 'other'}
                onChange={(e) => setFormData({...formData, stairType: e.target.value as 'other'})}
                style={{ marginBottom: '12px' }}
              />
              <div style={{ fontWeight: '600', marginBottom: '12px', textAlign: 'center' }}>
                Single end flush-mount bullnose
              </div>
              <img 
                src="/single_flush.png" 
                alt="Single end flush-mount bullnose"
                style={{ 
                  width: '200px', 
                  height: '150px', 
                  objectFit: 'contain',
                  borderRadius: '4px'
                }}
              />
            </label>
          </div>
        </div>

        {/* Stair Layout */}
        <div style={{ 
            background: '#ffffff', 
            padding: '32px', 
            borderRadius: '12px', 
            marginBottom: '28px',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              marginBottom: '24px', 
              color: '#3d2817',
              fontFamily: 'Georgia, serif'
            }}>
              Select Stairs Layout
            </h2>

            {/* Bullnose Profile Diagram */}
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px', 
              marginBottom: '40px',
              padding: '24px',
              background: '#faf8f3',
              borderRadius: '10px',
              border: '1px solid #e5ddd4'
            }}>
              <div style={{ 
                width: '100%',
                maxWidth: '400px',
                height: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img 
                  src="/stnd_dimen.png" 
                  alt="Bullnose Profile Diagram"
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                />
              </div>
              <p style={{ 
                fontSize: '20px', 
                color: '#6b5d4f', 
                lineHeight: '1.6',
                textAlign: 'center',
                margin: 0,
                fontWeight: '500'
              }}>
                Standard dimensions of a Finishment stairnose
              </p>
            </div>

            {/* Stair Layout Options */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '24px', 
              marginBottom: '32px' 
            }}>
              {/* No Open Returns */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontWeight: '600', 
                  marginBottom: '12px', 
                  color: '#3d2817',
                  fontSize: '16px'
                }}>
                  No Open Returns
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '180px', 
                  background: '#faf8f3',
                  borderRadius: '10px',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #e5ddd4',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  overflow: 'hidden'
                }}>
                  <img 
                    src="/no_return.png" 
                    alt="No Open Return Stair Diagram"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      borderRadius: '10px'
                    }}
                  />
                </div>
                <input
                  type="number"
                  min="0"
                  max="9999"
                  value={formData.stepsNoOpenReturn || ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    if (val >= 0 && val <= 9999) {
                      setFormData({...formData, stepsNoOpenReturn: val});
                    }
                  }}
                  placeholder="Quantity"
                  required
                  style={{
                    width: '80px',
                    padding: '8px 10px',
                    border: '1px solid #e5ddd4',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: '#faf8f3',
                    color: '#3d2817',
                    transition: 'all 0.2s',
                    outline: 'none',
                    textAlign: 'center',
                    MozAppearance: 'textfield'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#c9a882';
                    e.target.style.backgroundColor = '#ffffff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5ddd4';
                    e.target.style.backgroundColor = '#faf8f3';
                  }}
                />
              </div>

              {/* One Open Return */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontWeight: '600', 
                  marginBottom: '12px', 
                  color: '#3d2817',
                  fontSize: '16px'
                }}>
                  One Open Returns
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '180px', 
                  background: '#faf8f3',
                  borderRadius: '10px',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #e5ddd4',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  overflow: 'hidden'
                }}>
                  <img 
                    src="/one_return.png" 
                    alt="One Open Return Stair Diagram"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      borderRadius: '10px'
                    }}
                  />
                </div>
                <input
                  type="number"
                  min="0"
                  max="9999"
                  value={formData.stepsOneOpenReturn || ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    if (val >= 0 && val <= 9999) {
                      setFormData({...formData, stepsOneOpenReturn: val});
                    }
                  }}
                  placeholder="Quantity"
                  required
                  style={{
                    width: '80px',
                    padding: '8px 10px',
                    border: '1px solid #e5ddd4',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: '#faf8f3',
                    color: '#3d2817',
                    transition: 'all 0.2s',
                    outline: 'none',
                    textAlign: 'center',
                    MozAppearance: 'textfield'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#c9a882';
                    e.target.style.backgroundColor = '#ffffff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5ddd4';
                    e.target.style.backgroundColor = '#faf8f3';
                  }}
                />
              </div>

              {/* Two Open Returns */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontWeight: '600', 
                  marginBottom: '12px', 
                  color: '#3d2817',
                  fontSize: '16px'
                }}>
                  Two Open Returns
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '180px', 
                  background: '#faf8f3',
                  borderRadius: '10px',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #e5ddd4',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  color: '#6b7280',
                  fontSize: '14px'
                }}>
                  [Stair Diagram 3]
                </div>
                <input
                  type="number"
                  min="0"
                  max="9999"
                  value={formData.stepsTwoOpenReturn || ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    if (val >= 0 && val <= 9999) {
                      setFormData({...formData, stepsTwoOpenReturn: val});
                    }
                  }}
                  placeholder="Quantity"
                  required
                  style={{
                    width: '80px',
                    padding: '8px 10px',
                    border: '1px solid #e5ddd4',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: '#faf8f3',
                    color: '#3d2817',
                    transition: 'all 0.2s',
                    outline: 'none',
                    textAlign: 'center',
                    MozAppearance: 'textfield'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#c9a882';
                    e.target.style.backgroundColor = '#ffffff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5ddd4';
                    e.target.style.backgroundColor = '#faf8f3';
                  }}
                />
              </div>
            </div>

            {/* Total # of stair noses - Auto-calculated */}
            <div style={{ 
              maxWidth: '500px', 
              margin: '0 auto',
              padding: '28px',
              background: '#faf8f3',
              borderRadius: '12px',
              border: '1px solid #e5ddd4',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '12px', 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#3d2817',
                textAlign: 'center'
              }}>
                Total # of stair noses
              </label>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <input
                  type="number"
                  value={(() => {
                    const total = (formData.stepsNoOpenReturn || 0) + (formData.stepsOneOpenReturn || 0) + (formData.stepsTwoOpenReturn || 0);
                    return total > 0 ? total : '';
                  })()}
                  readOnly
                  style={{
                    width: '60%',
                    padding: '14px',
                    border: '2px solid #c9a882',
                    borderRadius: '8px',
                    fontSize: '20px',
                    fontWeight: '600',
                    backgroundColor: '#ffffff',
                    color: '#c9a882',
                    textAlign: 'center',
                    cursor: 'not-allowed',
                    display: 'block'
                  }}
                />
              </div>
            </div>
          </div>

        {/* Flooring Details */}
        <div style={{ 
          background: '#ffffff', 
          padding: '32px', 
          borderRadius: '12px', 
          marginBottom: '28px',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            marginBottom: '24px', 
            color: '#3d2817',
            fontFamily: 'Georgia, serif'
          }}>
            Please provide any additional details we might need to know
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>
                Manufacturer <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                placeholder="Manufacturer"
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>
                Style <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.style}
                onChange={(e) => setFormData({...formData, style: e.target.value})}
                placeholder="Style"
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>
                Color <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({...formData, color: e.target.value})}
                placeholder="Color"
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>
              Enter Size of the longest flooring planks in the box <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.longestPlankSize}
              onChange={(e) => setFormData({...formData, longestPlankSize: e.target.value})}
              placeholder="Enter Size of the longest flooring planks in the box"
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>
              List Number of Steps and the Size of each step <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.stepsDetails}
              onChange={(e) => setFormData({...formData, stepsDetails: e.target.value})}
              placeholder="Example: (18 Steps at 55 inches)"
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>
            
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>
              Please provide any additional details we might need to know
            </label>
            <textarea
              value={formData.floorMatchDescription}
              onChange={(e) => setFormData({...formData, floorMatchDescription: e.target.value})}
              placeholder="Please provide any additional details we might need to know..."
              rows={4}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', fontWeight: '500', fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={formData.railCapTrimNeeded}
                onChange={(e) => setFormData({...formData, railCapTrimNeeded: e.target.checked})}
                style={{ marginRight: '8px' }}
              />
              Additional Information: Are additional pieces needed for rail cap trim? <span style={{ color: '#dc2626' }}>*</span>
            </label>
            {formData.railCapTrimNeeded && (
              <textarea
                value={formData.railCapTrimDetails}
                onChange={(e) => setFormData({...formData, railCapTrimDetails: e.target.value})}
                placeholder="Additional information (Optional)"
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            )}
          </div>
        </div>

        {/* Image Upload */}
        <div style={{ 
          background: '#ffffff', 
          padding: '24px', 
          borderRadius: '8px', 
          marginBottom: '24px',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#000000' }}>
            Project Images (Optional)
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
            Upload photos of your project if you think it will help us understand your requirements better.
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            disabled={uploadingImages}
            style={{ marginBottom: '16px' }}
          />
          
          {uploadingImages && (
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>Uploading images...</p>
          )}

          {projectImages.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
              {projectImages.map((img, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  <img 
                    src={img.url} 
                    alt={img.fileName || `Project image ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '150px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: '#dc2626',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shipping Address */}
        <div style={{ 
          background: '#ffffff', 
          padding: '24px', 
          borderRadius: '8px', 
          marginBottom: '24px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={needsShipping}
                onChange={(e) => setNeedsShipping(e.target.checked)}
                style={{ marginRight: '8px', width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '16px', fontWeight: '500', color: '#000000' }}>
                NOT able to pick up completed order in Leander, TX
              </span>
            </label>
          </div>
          
          {needsShipping && (
            <>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#000000' }}>
                Shipping Address
              </h2>
              
              <div style={{ display: 'grid', gap: '16px', maxWidth: '600px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>
                Full Name <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                value={shippingAddress.name}
                onChange={(e) => setShippingAddress({...shippingAddress, name: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>
                Company Name
              </label>
              <input
                type="text"
                value={shippingAddress.company}
                onChange={(e) => setShippingAddress({...shippingAddress, company: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>
                Address Line 1 <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                value={shippingAddress.address1}
                onChange={(e) => setShippingAddress({...shippingAddress, address1: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>
                Address Line 2
              </label>
              <input
                type="text"
                value={shippingAddress.address2}
                onChange={(e) => setShippingAddress({...shippingAddress, address2: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>
                  City <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>
                  State <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                  required
                  maxLength={2}
                  placeholder="TX"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>
                  ZIP Code <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={shippingAddress.zip}
                  onChange={(e) => setShippingAddress({...shippingAddress, zip: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>
                  Phone <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="tel"
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
          </div>
            </>
          )}
        </div>

        {/* Payment Method */}
        <div style={{ 
          background: '#ffffff', 
          padding: '24px', 
          borderRadius: '8px', 
          marginBottom: '24px',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#000000' }}>
            Payment Method
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '600px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px',
              border: paymentMethod === 'card' ? '2px solid #000' : '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              background: paymentMethod === 'card' ? '#f9fafb' : '#fff'
            }}>
              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value as 'card')}
                style={{ marginRight: '12px' }}
              />
              <div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>Credit Card</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  We'll contact you to process payment manually
                </div>
              </div>
            </label>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px',
              border: paymentMethod === 'check' ? '2px solid #000' : '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              background: paymentMethod === 'check' ? '#f9fafb' : '#fff'
            }}>
              <input
                type="radio"
                name="payment"
                value="check"
                checked={paymentMethod === 'check'}
                onChange={(e) => setPaymentMethod(e.target.value as 'check')}
                style={{ marginRight: '12px' }}
              />
              <div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>Check</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  Mail check with order number included
                </div>
              </div>
            </label>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px',
              border: paymentMethod === 'ach' ? '2px solid #000' : '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              background: paymentMethod === 'ach' ? '#f9fafb' : '#fff'
            }}>
              <input
                type="radio"
                name="payment"
                value="ach"
                checked={paymentMethod === 'ach'}
                onChange={(e) => setPaymentMethod(e.target.value as 'ach')}
                style={{ marginRight: '12px' }}
              />
              <div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>ACH Transfer</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  Bank transfer details will be provided
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Additional Notes */}
        <div style={{ 
          background: '#ffffff', 
          padding: '24px', 
          borderRadius: '8px', 
          marginBottom: '24px',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#000000' }}>
            Additional Notes (Optional)
          </h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            style={{
              width: '100%',
              maxWidth: '600px',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              resize: 'vertical'
            }}
            placeholder="Any special instructions or notes for this order..."
          />
        </div>

        {/* Submit Button */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
            Thank you for taking the time to complete this form. Once submitted, a member of our staff will confirm a delivery time or ask any follow-up questions.
          </p>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '14px 32px',
              background: submitting ? '#9ca3af' : '#000',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '18px',
              minWidth: '200px'
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Order'}
          </button>
        </div>
      </form>
      </div>
    </>
  );
}
