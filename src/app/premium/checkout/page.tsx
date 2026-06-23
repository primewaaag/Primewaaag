'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams, useRouter } from 'next/navigation';
import { Check, ChevronDown, Loader2, Award, CheckCircle, ShieldAlert, CreditCard, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/utils/firebase';
import { collection, query, where, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';

function CheckoutContent() {
  const { user, isLoading: authLoading, loginOAuthPlatform, updateUserFields } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Query parameter parsing
  const tierParam = parseInt(searchParams.get('tier') || '1', 10);
  const tier = (tierParam === 1 || tierParam === 2 || tierParam === 3) ? (tierParam as 1 | 2 | 3) : 1;

  // Checkout Wizard steps: 1 = Plan summary + Twitch banner, 2 = Billing info & Payment
  const [step, setStep] = useState<1 | 2>(1);
  const [isTwitchAccordionOpen, setIsTwitchAccordionOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Billing address form state
  const [billingEmail, setBillingEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('');

  // Upgrade & Previous Payment state
  const [previousPaid, setPreviousPaid] = useState<number>(0);
  const [previousTier, setPreviousTier] = useState<number>(0);
  const [activeSubId, setActiveSubId] = useState<string | null>(null);
  const [loadingSub, setLoadingSub] = useState<boolean>(true);

  // PayPal integration state
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [showOtherPaymentMethods, setShowOtherPaymentMethods] = useState(false);

  // Pre-fill user information if logged in
  useEffect(() => {
    if (user) {
      setBillingEmail(user.email || '');
    }
  }, [user]);

  // Fetch user's active subscription to calculate upgrade credit
  useEffect(() => {
    const fetchActiveSub = async () => {
      if (!user || !user.userId) {
        setLoadingSub(false);
        return;
      }
      try {
        const q = query(
          collection(db, 'premium'),
          where('userId', '==', user.userId)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const subData = snap.docs[0].data();
          setPreviousPaid(subData.pricePaid || 0);
          setPreviousTier(subData.tier || 0);
          setActiveSubId(snap.docs[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch active subscription:', err);
      } finally {
        setLoadingSub(false);
      }
    };
    fetchActiveSub();
  }, [user]);

  const isSubscribed = user && (
    user.role === 'Twitch Subscriber' ||
    user.role === 'Premium' ||
    user.role === 'Admin' ||
    (user as any).isSubscriber === true
  );

  const isTwitchConnected = !!(user && (user.twitchId || user.twitchUsername));

  const hasDiscount = !!(isTwitchConnected || isSubscribed);

  const getBasePriceNum = (t: 1 | 2 | 3, discount: boolean) => {
    if (t === 1) return discount ? 0 : 10;
    if (t === 2) return discount ? 20 : 25;
    return discount ? 40 : 50; // Tier 3
  };

  const basePriceVal = getBasePriceNum(tier, hasDiscount);
  const checkoutCost = Math.max(0, basePriceVal - previousPaid);

  const originalPrice = tier === 1 ? '€10.00' : tier === 2 ? '€25.00' : '€50.00';
  const finalPrice = checkoutCost === 0 ? 'FREE' : `€${checkoutCost.toFixed(2)}`;

  const handleConnectTwitch = async () => {
    if (!user) {
      router.push(`/auth/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    localStorage.setItem('connect_twitch_uid', user.userId);
    try {
      await loginOAuthPlatform('twitch');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to connect Twitch account.');
    }
  };

  const handleVerifySubscription = async () => {
    if (!user) return;
    setVerifying(true);
    setStatusMsg('');
    setErrorMsg('');

    setTimeout(async () => {
      try {
        await updateUserFields({
          role: 'Twitch Subscriber',
          isSubscriber: true as any
        });
        setStatusMsg('Subscription verified successfully! Welcome to Waag Premium.');
      } catch (err: any) {
        console.error(err);
        setErrorMsg('Failed to update subscription status. Please try again.');
      } finally {
        setVerifying(false);
      }
    }, 1500);
  };

  const getPricingInfo = (t: 1 | 2 | 3) => {
    const base = getBasePriceNum(t, hasDiscount);
    const costVal = Math.max(0, base - previousPaid);
    const rateText = costVal === 0 ? 'FREE' : `€${costVal.toFixed(2)}`;
    return {
      rate: rateText,
      sub: hasDiscount ? 'Twitch discount applied' : 'Standard rate',
      billText: costVal === 0 ? 'Free lifetime membership' : `€${costVal.toFixed(2)} billed once`
    };
  };

  const isFormValid =
    billingEmail.trim() !== '' &&
    fullName.trim() !== '' &&
    street.trim() !== '' &&
    city.trim() !== '' &&
    zip.trim() !== '' &&
    country.trim() !== '';

  // Load PayPal SDK script dynamically when entering step 2
  useEffect(() => {
    if (step === 2 && checkoutCost > 0) {
      if ((window as any).paypal) {
        setPaypalLoaded(true);
        return;
      }

      // Check if script tag is already in the document to prevent double-injection
      const existingScript = document.getElementById('paypal-sdk-script');
      if (existingScript) {
        const handleLoad = () => setPaypalLoaded(true);
        existingScript.addEventListener('load', handleLoad);
        return () => {
          existingScript.removeEventListener('load', handleLoad);
        };
      }

      const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test';
      const script = document.createElement('script');
      script.id = 'paypal-sdk-script';
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=EUR`;
      script.async = true;
      script.onload = () => {
        setPaypalLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load PayPal SDK');
      };
      document.body.appendChild(script);
    }
  }, [step, checkoutCost]);

  // Unified Checkout Success handler
  const handleCheckoutSuccess = async (paypalOrderDetails: any) => {
    if (!user) return;
    try {
      const premiumCol = collection(db, 'premium');
      const q = query(premiumCol, where('userId', '==', user.userId));
      const snap = await getDocs(q);

      const subId = user.userId;
      // Clean up old random sub document if it existed under a different ID
      if (!snap.empty && snap.docs[0].id !== subId) {
        try {
          await deleteDoc(doc(db, 'premium', snap.docs[0].id));
        } catch (e) {
          console.error('Failed to delete legacy premium document:', e);
        }
      }

      await setDoc(doc(db, 'premium', subId), {
        id: subId,
        userId: user.userId,
        tier: tier,
        pricePaid: basePriceVal, // Total value of this tier
        createdAt: !snap.empty ? (snap.docs[0].data().createdAt || new Date().toISOString()) : new Date().toISOString()
      }, { merge: true });

      // 3. Create order document in orders collection
      const orderId = doc(collection(db, 'orders')).id;
      await setDoc(doc(db, 'orders', orderId), {
        id: orderId,
        userId: user.userId,
        subscriptionId: subId,
        tier: tier,
        billingEmail: billingEmail,
        billingAddress: {
          fullName,
          street,
          city,
          zip,
          country
        },
        cost: checkoutCost, // Price paid in this transaction
        createdAt: new Date().toISOString(),
        paypalOrder: paypalOrderDetails || null
      });

      // 4. We no longer write the subscription role to the user document directly, as we link via the subscriptions collection instead.

      // 5. Add user to public supporters collection only if they are Tier 3
      if (tier === 3) {
        await setDoc(doc(db, 'supporters', user.userId), {
          userId: user.userId,
          username: user.username,
          avatar: user.avatar,
        });
      } else {
        try {
          await deleteDoc(doc(db, 'supporters', user.userId));
        } catch (e) {
          console.error('Failed to clean up supporter document:', e);
        }
      }

      router.push(`/premium?success=true&tier=${tier}&oldTier=${previousTier}`);
    } catch (err: any) {
      console.error('Checkout recording error:', err);
      setErrorMsg('Payment succeeded, but failed to register your membership in the database. Please contact support.');
    }
  };

  // Render PayPal button container once script is loaded
  useEffect(() => {
    let paypalButtons: any = null;

    if (paypalLoaded && step === 2 && (window as any).paypal && isFormValid && checkoutCost > 0) {
      const container = document.getElementById('paypal-button-container');
      if (container) {
        container.innerHTML = ''; // Clear prior triggers
        try {
          paypalButtons = (window as any).paypal.Buttons({
            style: {
              layout: 'vertical',
              color: 'gold',
              shape: 'pill',
              label: 'paypal'
            },
            createOrder: (data: any, actions: any) => {
              return actions.order.create({
                purchase_units: [{
                  amount: {
                    currency_code: 'EUR',
                    value: checkoutCost.toFixed(2)
                  },
                  description: `Tier ${tier} Premium Lifetime Membership`
                }]
              });
            },
            onApprove: async (data: any, actions: any) => {
              return actions.order.capture().then(async (details: any) => {
                const paypalOrderDetails = {
                  orderID: data.orderID,
                  payerID: data.payerID,
                  paymentID: details.id,
                  payerEmail: details.payer?.email_address
                };
                await handleCheckoutSuccess(paypalOrderDetails);
              });
            },
            onError: (err: any) => {
              console.error('PayPal Transaction Error:', err);
            }
          });
          paypalButtons.render('#paypal-button-container');
        } catch (err) {
          console.error('Error rendering PayPal buttons:', err);
        }
      }
    }

    return () => {
      if (paypalButtons && paypalButtons.close) {
        try {
          paypalButtons.close();
        } catch (e) {
          // Suppress close errors
        }
      }
    };
  }, [paypalLoaded, step, isFormValid, billingEmail, fullName, street, city, zip, country, tier, checkoutCost, basePriceVal, activeSubId]);

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
      {/* Checkout Card */}
      <div className="bg-[#121214] border border-zinc-800 rounded-[28px] w-full p-8 md:p-10 relative shadow-2xl space-y-8">

        {step === 1 ? (
          <>
            <div className="space-y-1 text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white font-sans">
                Tier {tier} Membership
              </h2>
            </div>

            {/* Selected Plan Info Card */}
            <div className="border border-zinc-800 bg-zinc-900/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-semibold text-zinc-300">Price</span>
              <div className="flex items-baseline justify-center gap-2 mt-2">
                {(hasDiscount || previousPaid > 0) && (
                  <span className="text-zinc-500 line-through text-sm sm:text-base font-medium">{originalPrice}</span>
                )}
                <span className="text-2xl sm:text-3xl font-extrabold text-white">
                  {finalPrice}
                </span>
              </div>
              {previousPaid > 0 && (
                <span className="text-xs text-emerald-400 font-semibold mt-1">
                  Includes €{previousPaid.toFixed(2)} upgrade credit from your previous tier
                </span>
              )}
              <span className="text-xs text-zinc-500 mt-1">billed once</span>
            </div>

            {tier === 1 && hasDiscount && (
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-purple-300 text-xs text-center font-semibold leading-relaxed animate-fadeIn">
                ✨ Note: This is free for as long as you're a subscriber. After that, it runs out.
              </div>
            )}

            {/* Twitch Banner Section */}
            {isTwitchConnected ? (
              <div className="w-full bg-[#8b5cf6] text-white p-6 rounded-[20px] shadow-lg relative overflow-hidden">
                <div className="flex items-center gap-4">
                  <img src="https://cdn.simpleicons.org/twitch/ffffff" alt="Twitch" className="h-6 w-6 sm:h-7 sm:w-7" />
                  <div className="text-left">
                    <h3 className="font-extrabold text-sm sm:text-base leading-tight font-sans tracking-wide">You're a Twitch subscriber</h3>
                    <p className="text-xs text-purple-100 font-medium mt-0.5">
                      {tier === 1 ? 'You get Tier 1 for free!' : 'You save 20% on all memberships.'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Expandable accordion banner if NOT connected */
              <div className="w-full bg-[#8b5cf6] text-white p-6 rounded-[20px] shadow-lg relative overflow-hidden">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setIsTwitchAccordionOpen(!isTwitchAccordionOpen)}
                >
                  <div className="flex items-center gap-4">
                    <img src="https://cdn.simpleicons.org/twitch/ffffff" alt="Twitch" className="h-6 w-6 sm:h-7 sm:w-7" />
                    <div className="text-left">
                      <h3 className="font-extrabold text-sm sm:text-base leading-tight font-sans tracking-wide">
                        Already subscribed on Twitch?
                      </h3>
                      <p className="text-xs text-purple-100 font-medium mt-0.5">
                        {tier === 1 ? "Get Tier 1 for free when you're an active Twitch Sub." : "Save 20% on memberships when you're an active Twitch sub."}
                      </p>
                    </div>
                  </div>
                  <ChevronDown size={20} className={`text-white transition-transform ${isTwitchAccordionOpen ? 'rotate-180' : ''}`} />
                </div>

                {isTwitchAccordionOpen && (
                  <div className="mt-5 pt-5 border-t border-white/20 flex flex-col gap-4 items-start">
                    {authLoading ? (
                      <div className="flex items-center gap-2 text-purple-100 text-xs justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        <span>Checking Twitch account...</span>
                      </div>
                    ) : user && user.twitchId ? (
                      <div className="w-full space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-green-400 animate-ping" />
                          <span className="text-xs font-bold">Twitch Linked: <code className="bg-white/10 px-2 py-0.5 rounded font-mono">{user.twitchId}</code></span>
                        </div>
                        {isSubscribed ? (
                          <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
                            <Check size={14} /> Twitch Subscriber status verified! Discount applied.
                          </div>
                        ) : (
                          <div className="space-y-3 pt-1">
                            <p className="text-xs text-purple-200">No active subscription detected. Click verify if you recently subscribed.</p>
                            <div className="flex gap-2">
                              <a href="https://twitch.tv/primewaaag/subscribe" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-full bg-white text-[#8b5cf6] font-bold text-[10px] hover:bg-zinc-100 transition-all uppercase tracking-wider">
                                Subscribe on Twitch
                              </a>
                              <button onClick={handleVerifySubscription} disabled={verifying} className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white font-bold text-[10px] hover:bg-white/20 transition-all uppercase tracking-wider disabled:opacity-50">
                                {verifying && <Loader2 size={10} className="inline mr-1 animate-spin" />}
                                Verify Subscription
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={handleConnectTwitch}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#8b5cf6] font-bold text-xs hover:bg-zinc-100 transition-all uppercase shadow-md cursor-pointer"
                      >
                        <img src="https://cdn.simpleicons.org/twitch/8b5cf6" alt="Twitch" className="h-4 w-4" />
                        Connect to Twitch
                      </button>
                    )}

                    {statusMsg && (
                      <div className="p-2.5 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 flex items-center gap-2 animate-fadeIn justify-center w-full">
                        <CheckCircle size={12} className="flex-shrink-0" />
                        <span>{statusMsg}</span>
                      </div>
                    )}

                    {errorMsg && (
                      <div className="p-2.5 text-xs bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2 animate-fadeIn justify-center w-full">
                        <ShieldAlert size={12} className="flex-shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3.5 px-4 rounded-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-purple-500/20 cursor-pointer text-center"
              >
                Proceed to Payment
              </button>
              <button
                onClick={() => router.push('/premium')}
                className="px-6 py-3.5 rounded-full bg-white/5 border border-zinc-800 hover:bg-white/10 text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          /* STEP 2: Billing Form & PayPal payment */
          <div className="space-y-8 animate-fadeIn">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to details
            </button>

            <div className="space-y-1 text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white font-sans">
                BILLING ADDRESS
              </h2>
              <p className="text-xs text-zinc-400 uppercase tracking-widest font-semibold text-purple-400">
                Confirm your info for Tier {tier} - {finalPrice} once payment.
              </p>
              {tier === 1 && hasDiscount && (
                <p className="text-xs text-purple-300 font-semibold mt-2">
                  ✨ Note: This is free for as long as you're a subscriber. After that, it runs out.
                </p>
              )}
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Email Address</label>
                <input
                  type="email"
                  value={billingEmail}
                  onChange={(e) => setBillingEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-purple-500 focus:outline-none text-white font-medium"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-purple-500 focus:outline-none text-white font-medium"
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Street Address</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Main Street 123"
                  className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-purple-500 focus:outline-none text-white font-medium"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Berlin"
                  className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-purple-500 focus:outline-none text-white font-medium"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">ZIP</label>
                    <input
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      placeholder="10115"
                      className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-purple-500 focus:outline-none text-white font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Germany"
                      className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-purple-500 focus:outline-none text-white font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="pt-4 border-t border-zinc-800 space-y-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400">
                <CreditCard size={14} className="text-purple-400" />
                <span>PAYMENT METHOD</span>
              </div>

              {!isFormValid ? (
                <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl text-center text-xs text-zinc-500 font-medium">
                  Please complete the billing form above to load payment options.
                </div>
              ) : checkoutCost === 0 ? (
                <div className="space-y-4">
                  <button
                    onClick={() => handleCheckoutSuccess(null)}
                    className="w-full py-3.5 px-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-emerald-500/20 cursor-pointer text-center block"
                  >
                    Complete Free Checkout
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div id="paypal-button-container" className="w-full relative z-10 min-h-[150px]" />

                  {/* Developer Bypass */}
                  <button
                    onClick={() => handleCheckoutSuccess(null)}
                    className="w-full py-2.5 px-4 rounded-full border border-dashed border-zinc-800 hover:border-zinc-700 text-zinc-500 hover:text-zinc-400 font-bold text-[9px] uppercase tracking-widest transition-all cursor-pointer text-center block mt-2"
                  >
                    Bypass PayPal & Complete Checkout (Developer Mode)
                  </button>

                  {/* Other Payment Methods */}
                  <div className="border border-zinc-800 rounded-2xl p-4 bg-zinc-950/40 hover:border-zinc-700/50 transition-all mt-4">
                    <button 
                      type="button"
                      onClick={() => setShowOtherPaymentMethods(!showOtherPaymentMethods)}
                      className="w-full flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-white transition-colors"
                    >
                      <span>Other Payment Methods</span>
                      <ChevronDown size={14} className={`transform transition-transform duration-200 ${showOtherPaymentMethods ? 'rotate-180' : ''}`} />
                    </button>
                    {showOtherPaymentMethods && (
                      <div className="mt-3 text-xs text-zinc-400 space-y-2.5 leading-relaxed border-t border-zinc-900 pt-3">
                        <p>If you prefer to pay via credit card, bank transfer, or other methods, please reach out to me directly:</p>
                        <div className="flex flex-col gap-2 font-semibold text-zinc-300">
                          <div className="flex items-center gap-2">
                            <span className="text-purple-400">👾 Discord:</span>
                            <span>@primewaaag</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-purple-400">✉️ Email:</span>
                            <a href="mailto:marc.aeschbach@icloud.com" className="hover:text-purple-300 underline">marc.aeschbach@icloud.com</a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <main className="min-h-screen text-white selection:bg-purple-500/30 relative overflow-hidden">
      {/* Dynamic Ambient Background Elements */}
      <div className="glow-blob-1 z-0 animate-pulse duration-[8000ms]" />
      <div className="glow-blob-2 z-0 animate-pulse duration-[10000ms]" />
      <div className="glow-blob-3 z-0" />

      <div className="relative z-10">
        <Navbar />
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center text-zinc-400">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        }>
          <CheckoutContent />
        </Suspense>
      </div>
    </main>
  );
}
