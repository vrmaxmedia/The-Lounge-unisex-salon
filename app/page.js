"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

/* =====================================================================
   GALLERY

   Photos aane par:
   1. photos ko root ke "gallery" folder mein photo1.webp, photo2.webp ... naam se rakho
   2. neeche ke import lines se // hata do (jitni photos hain utni hi lines)
   3. GALLERY_IMAGES array mein wahi photo names se // hata do

   Jab tak photos nahi hain, gallery section "coming soon" slides ke saath dikhega.
   ===================================================================== */

// import photo1 from "../gallery/photo1.webp";
// import photo2 from "../gallery/photo2.webp";
// import photo3 from "../gallery/photo3.webp";
// import photo4 from "../gallery/photo4.webp";
// import photo5 from "../gallery/photo5.webp";
// import photo6 from "../gallery/photo6.webp";
// import photo7 from "../gallery/photo7.webp";
// import photo8 from "../gallery/photo8.webp";
// import photo9 from "../gallery/photo9.webp";
// import photo10 from "../gallery/photo10.webp";
// import photo11 from "../gallery/photo11.webp";
// import photo12 from "../gallery/photo12.webp";

const GALLERY_IMAGES = [
  // photo1,
  // photo2,
  // photo3,
  // photo4,
  // photo5,
  // photo6,
  // photo7,
  // photo8,
  // photo9,
  // photo10,
  // photo11,
  // photo12,
];

// Photos nahi hain toh 3 placeholder slides (null) dikhengi
const GALLERY_SLIDES =
  GALLERY_IMAGES.length > 0 ? GALLERY_IMAGES : [null, null, null];

const CLIENT_CONFIG = {
  clientId: "the_lounge_unisex_salon_01",
  businessName: "The Lounge Unisex Salon",
  subHeading: "Unisex Salon, Hair Stylist & Bridal Makeup Artist in Pathankot",
  category: "Unisex Salon, Hair Stylist & Bridal Makeup Artist",
  description:
    "A unisex salon at Pathankot Junction, Pathankot, offering hair styling, haircuts, hair colour, straightening, beard grooming, waxing and makeup services.",
  city: "Pathankot Junction, Pathankot, Punjab",
  areaLabel: "Pathankot Junction",
  fullAddress: "Pathankot Junction, Pathankot, Punjab",
  logoUrl: "/logo.png",

  // TODO: Asli Google review link yahan daalo (Copy & Paste on Google button isi par khulta hai)
  googleReviewUrl: "https://www.justdial.com/Pathankot/The-Lounge-Unisex-Salon-Near-Bedi-Petrol-Pump-Pathankot-Junction/9999PX186-X186-250821125144-S4C7_BZDET/writereview?fromFlow=1&ratingPresent=1&rate=1&defFid=1669890460968692&fromRevCta=1&scrollToTags=1",

  mapSearch: "The Lounge Unisex Salon, Pathankot Junction, Pathankot, Punjab",
  // Asli Google Maps share link mil jaye toh yahan replace kar sakte ho.
  // Abhi search-based link hai jo seedha map khol deta hai.
  mapsDirectionUrl:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(
      "The Lounge Unisex Salon, Pathankot Junction, Pathankot, Punjab"
    ),

  // WhatsApp aur "Call Us" ke liye mobile number
  phone: "+917837988007",
  cleanPhone: "917837988007",

  // "Direct Call to Salon" button ka alag number (landline)
  directCallPhone: "+911862910016",

  // Jis link ki value khali hai, uska button page par nahi dikhega.
  // Asli link aane par bas yahan daal do, button apne aap aa jayega.
  instagramUrl: "",
  facebookUrl: "",
  websiteUrl: "",
  youtubeUrl: "",
  whatsappChannelUrl: "",

  agencyName: "VR Max AI",
  agencyWhatsapp: "918700660097",
  agencyPhoneDisplay: "+91 87006 60097",

  // NOTE: chip labels route.js ke CHIPS se bilkul match hone chahiye ("All" ke alawa)
  chips: [
    { label: "All" },
    { label: "Haircut & Styling" },
    { label: "Hair Colour" },
    { label: "Straightening & Rebonding" },
    { label: "Beard Grooming" },
    { label: "Waxing" },
    { label: "Bridal Makeup" },
    { label: "Salon Ambience" },
    { label: "Staff Behaviour" },
    { label: "Clean & Hygiene" },
    { label: "Professional Service" },
    { label: "Value for Money" },
    { label: "Pathankot Location" },
  ],
};

const MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(
  CLIENT_CONFIG.mapSearch
)}&output=embed`;

const AGENCY_WA_LINK = `https://wa.me/${
  CLIENT_CONFIG.agencyWhatsapp
}?text=${encodeURIComponent(
  "Hi VR Max AI, I want to get a QR review system for my business."
)}`;

const HAS_LOWER_ROW_LINKS = Boolean(
  CLIENT_CONFIG.instagramUrl ||
    CLIENT_CONFIG.websiteUrl ||
    CLIENT_CONFIG.whatsappChannelUrl ||
    CLIENT_CONFIG.facebookUrl ||
    CLIENT_CONFIG.youtubeUrl
);

function useTypewriter(fullText, totalMs = 2300) {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!fullText) {
      setDisplayText("");
      setIsTyping(false);
      return;
    }

    setDisplayText("");
    setIsTyping(true);

    const COMMA_PAUSE = 90;
    const commas = (fullText.match(/,/g) || []).length;
    const base = Math.min(
      26,
      Math.max(10, (totalMs - commas * COMMA_PAUSE) / fullText.length)
    );

    const times = [];
    let t = 0;

    for (let i = 0; i < fullText.length; i++) {
      t += base;
      times.push(t);
      if (fullText[i] === ",") t += COMMA_PAUSE;
    }

    const start = performance.now();
    let raf;

    const tick = (now) => {
      const elapsed = now - start;
      let n = 0;

      while (n < times.length && times[n] <= elapsed) n++;

      setDisplayText(fullText.slice(0, n));

      if (n >= fullText.length) {
        setIsTyping(false);
      } else {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [fullText, totalMs]);

  return { displayText, isTyping };
}

async function copyToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    // Fallback below
  }

  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);

    const ok = document.execCommand("copy");
    ta.remove();

    return ok;
  } catch (e) {
    return false;
  }
}

export default function UniversalReviewPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState(["All"]);
  const firstRunRef = useRef(true);
  const [language, setLanguage] = useState("ENGLISH");
  const [reviewDraft, setReviewDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  // Gallery state
  const [galleryIndex, setGalleryIndex] = useState(0);
  const galleryTouchStartXRef = useRef(0);

  const abortControllerRef = useRef(null);
  const requestIdRef = useRef(0);
  const recentLengthsRef = useRef([]);

  const { displayText, isTyping } = useTypewriter(reviewDraft);

  useEffect(() => {
    setMounted(true);

    return () => {
      requestIdRef.current++;
      abortControllerRef.current?.abort();
    };
  }, []);

  // Gallery automatic sliding - every 3 seconds
  useEffect(() => {
    if (!mounted || GALLERY_SLIDES.length === 0) return;

    const galleryTimer = window.setInterval(() => {
      setGalleryIndex((current) => (current + 1) % GALLERY_SLIDES.length);
    }, 3000);

    return () => window.clearInterval(galleryTimer);
  }, [mounted]);

  // Manual touch swipe
  function handleGalleryTouchStart(event) {
    galleryTouchStartXRef.current = event.changedTouches[0].clientX;
  }

  function handleGalleryTouchEnd(event) {
    const touchEndX = event.changedTouches[0].clientX;
    const difference = galleryTouchStartXRef.current - touchEndX;

    if (Math.abs(difference) < 45) return;

    if (difference > 0) {
      // Swipe left: next image
      setGalleryIndex((current) => (current + 1) % GALLERY_SLIDES.length);
    } else {
      // Swipe right: previous image
      setGalleryIndex(
        (current) =>
          (current - 1 + GALLERY_SLIDES.length) % GALLERY_SLIDES.length
      );
    }
  }

  function handleGalleryPrevious() {
    setGalleryIndex(
      (current) =>
        (current - 1 + GALLERY_SLIDES.length) % GALLERY_SLIDES.length
    );
  }

  function handleGalleryNext() {
    setGalleryIndex((current) => (current + 1) % GALLERY_SLIDES.length);
  }

  const generateAIReview = useCallback(async (labels, lang) => {
    abortControllerRef.current?.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const requestId = ++requestIdRef.current;

    setLoading(true);
    setCopied(false);
    setError("");
    setReviewDraft("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          businessName: CLIENT_CONFIG.businessName,
          category: CLIENT_CONFIG.category,
          description: CLIENT_CONFIG.description,
          city: CLIENT_CONFIG.city,
          selectedChips: labels.includes("All") ? [] : labels,
          language: lang,
          customerExperience: "",
          customInstruction: "",
          recentLengths: recentLengthsRef.current,
          nonce: Math.random().toString(36).substring(2, 12),
          timestamp: Date.now(),
          randomSeed: Math.floor(Math.random() * 100000),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.error || `Draft generation failed (${res.status}).`
        );
      }

      if (!data.review?.trim()) {
        throw new Error("The API returned an empty draft.");
      }

      if (requestId !== requestIdRef.current) return;

      if (data.meta) {
        recentLengthsRef.current = [
          ...recentLengthsRef.current,
          data.meta,
        ].slice(-6);
      }

      setReviewDraft(data.review.trim());
    } catch (err) {
      if (err.name === "AbortError") return;

      if (requestId === requestIdRef.current) {
        setError(err.message || "Unable to generate a draft.");
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const delay = firstRunRef.current ? 0 : 350;
    firstRunRef.current = false;

    const t = setTimeout(
      () => generateAIReview(selectedLabels, language),
      delay
    );

    return () => {
      clearTimeout(t);
      abortControllerRef.current?.abort();
    };
  }, [mounted, selectedLabels, language, generateAIReview]);

  function handleChipChange(chipObj) {
    if (chipObj.label === "All") {
      if (
        selectedLabels.length === 1 &&
        selectedLabels[0] === "All"
      ) {
        generateAIReview(["All"], language);
      } else {
        setSelectedLabels(["All"]);
      }
      return;
    }

    let next = selectedLabels.filter((l) => l !== "All");

    if (next.includes(chipObj.label)) {
      next = next.filter((l) => l !== chipObj.label);
    } else {
      next = [...next, chipObj.label];

      if (next.length > 3) {
        next = next.slice(-3);
      }
    }

    setSelectedLabels(next.length ? next : ["All"]);
  }

  function handleLanguageChange(lang) {
    if (lang === language) {
      generateAIReview(selectedLabels, lang);
      return;
    }

    setLanguage(lang);
  }

  async function handleCopyAndRedirect() {
    if (!reviewDraft || loading || isTyping) return;

    const ok = await copyToClipboard(reviewDraft);

    if (!ok) {
      setError(
        "Could not copy the draft. Please select and copy it manually."
      );
      return;
    }

    setCopied(true);

    setTimeout(() => {
      window.location.href = CLIENT_CONFIG.googleReviewUrl;
    }, 550);
  }

  function handleSaveContact() {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${CLIENT_CONFIG.businessName}
ORG:${CLIENT_CONFIG.businessName}
TEL;TYPE=CELL:${CLIENT_CONFIG.phone}
ADR;TYPE=WORK:;;${CLIENT_CONFIG.fullAddress};;;;
NOTE:${CLIENT_CONFIG.subHeading}
END:VCARD`;

    const blob = new Blob([vcard], {
      type: "text/vcard;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${CLIENT_CONFIG.businessName.replace(/\s+/g, "_")}.vcf`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  if (!mounted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#0b0a09",
        }}
      />
    );
  }

  return (
    <main className="soft-luxury-viewport">

      {/* Fixed Background */}
      <div className="fixed-bg"></div>

      <div className="main-content-flow">

        {/* Logo */}
        <div className="brand-medallion-badge">
          <div className="logo-ring">
            <div
              className="logo-circle-container"
              style={{
                backgroundImage: `url(${CLIENT_CONFIG.logoUrl})`,
              }}
              role="img"
              aria-label={`${CLIENT_CONFIG.businessName} logo`}
            ></div>
          </div>

          <h1 className="brand-main-title">
            {CLIENT_CONFIG.businessName}
          </h1>
        </div>

        <p className="brand-serif-subtitle">
          {CLIENT_CONFIG.subHeading}
        </p>

        <div className="royal-shahi-divider">
          <span className="divider-line"></span>
          <span className="divider-gem">◆</span>
          <span className="divider-line"></span>
        </div>

        <div className="stars-cluster" aria-hidden="true">
          <span>★</span>
          <span>★</span>
          <span>★</span>
          <span>★</span>
          <span>★</span>
        </div>

        <p className="experience-tracker-title">
          SHARE YOUR EXPERIENCE
        </p>

        {/* Filter Chips */}
        <div className="floating-pills-cloud">
          {CLIENT_CONFIG.chips.map((chip) => {
            const active = selectedLabels.includes(chip.label);

            return (
              <button
                key={chip.label}
                type="button"
                onClick={() => handleChipChange(chip)}
                aria-pressed={active}
                className={`embossed-pill ${active ? "active" : ""}`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        <p className="chip-hint">
          Tap up to 3 keywords for your review
        </p>

        {/* Language Selector */}
        <div className="capsule-lang-dock">
          {["ENGLISH", "HINGLISH"].map((lang) => {
            const active = language === lang;

            return (
              <button
                key={lang}
                type="button"
                onClick={() => handleLanguageChange(lang)}
                aria-pressed={active}
                className={`capsule-lang-btn ${active ? "active" : ""}`}
              >
                {lang}
              </button>
            );
          })}
        </div>

        {/* Review Box */}
        <div className="signature-review-box">

          <div className="box-top-ribbon">
            <div className="label-badge">
              <span className="dot-ping"></span>
              YOUR REVIEW
            </div>

            <button
              type="button"
              disabled={loading || isTyping}
              onClick={() => generateAIReview(selectedLabels, language)}
              className="top-rewrite-btn"
            >
              <span>Rewrite</span>
            </button>
          </div>

          <div className="review-display-zone">
            {loading ? (
              <div className="loader-shimmer-wrap">
                <span className="sparkle-icon">✦</span>
                <span className="shimmer-text">
                  Crafting authentic review...
                </span>
              </div>
            ) : error ? (
              <p className="review-error">{error}</p>
            ) : reviewDraft ? (
              <p className="review-body-text">
                {displayText}
                {isTyping && (
                  <span className="typewriter-cursor"></span>
                )}
              </p>
            ) : (
              <p className="review-placeholder">
                Your review draft will appear here.
              </p>
            )}
          </div>

          <div className="card-ornament-center">
            <span>◆</span>
          </div>

          <button
            type="button"
            disabled={loading || isTyping || !reviewDraft}
            onClick={handleCopyAndRedirect}
            className={`full-luxury-copy-btn ${copied ? "copied" : ""}`}
          >
            <span>
              {copied
                ? "Copied! Opening Google..."
                : "Copy & Paste on Google"}
            </span>
          </button>

          <p className="card-disclaimer-note">
            Please review the wording before posting.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-card">
          <div className="soft-action-grid">

            <div className="action-row-upper">

              {/* WhatsApp */}
              <a
                href={`https://wa.me/${CLIENT_CONFIG.cleanPhone}`}
                target="_blank"
                rel="noreferrer"
                className="soft-circle-action"
              >
                <div className="icon-disc whatsapp-disc">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </div>
                <span className="icon-tag">WhatsApp</span>
              </a>

              {/* Call Us */}
              <a
                href={`tel:${CLIENT_CONFIG.phone}`}
                className="soft-circle-action"
              >
                <div className="icon-disc call-disc">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <span className="icon-tag">Call Us</span>
              </a>

              {/* Save Contact */}
              <button
                type="button"
                onClick={handleSaveContact}
                className="soft-circle-action"
              >
                <div className="icon-disc contact-disc">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                </div>
                <span className="icon-tag">Save Contact</span>
              </button>

              {/* Directions */}
              <a
                href={CLIENT_CONFIG.mapsDirectionUrl}
                target="_blank"
                rel="noreferrer"
                className="soft-circle-action"
              >
                <div className="icon-disc map-disc">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <span className="icon-tag">Directions</span>
              </a>

            </div>

            {HAS_LOWER_ROW_LINKS && (
              <div className="action-row-lower">

                {/* Instagram */}
                {CLIENT_CONFIG.instagramUrl && (
                  <a
                    href={CLIENT_CONFIG.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="soft-circle-action"
                  >
                    <div className="icon-disc insta-disc">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                      </svg>
                    </div>
                    <span className="icon-tag">Instagram</span>
                  </a>
                )}

                {/* Website */}
                {CLIENT_CONFIG.websiteUrl && (
                  <a
                    href={CLIENT_CONFIG.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="soft-circle-action"
                  >
                    <div className="icon-disc contact-disc">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                    </div>
                    <span className="icon-tag">Website</span>
                  </a>
                )}

                {/* WhatsApp Channel */}
                {CLIENT_CONFIG.whatsappChannelUrl && (
                  <a
                    href={CLIENT_CONFIG.whatsappChannelUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="soft-circle-action"
                  >
                    <div className="icon-disc wa-channel-disc">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                      </svg>
                    </div>
                    <span className="icon-tag">WA Channel</span>
                  </a>
                )}

                {/* Facebook */}
                {CLIENT_CONFIG.facebookUrl && (
                  <a
                    href={CLIENT_CONFIG.facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="soft-circle-action"
                  >
                    <div className="icon-disc fb-disc">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                      </svg>
                    </div>
                    <span className="icon-tag">Facebook</span>
                  </a>
                )}

                {/* YouTube */}
                {CLIENT_CONFIG.youtubeUrl && (
                  <a
                    href={CLIENT_CONFIG.youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="soft-circle-action"
                  >
                    <div className="icon-disc yt-disc">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                        <polygon
                          points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                    <span className="icon-tag">YouTube</span>
                  </a>
                )}

              </div>
            )}

            {/* Direct Call to Salon - Slim Premium Button */}
            <a
              href={`tel:${CLIENT_CONFIG.directCallPhone}`}
              className="direct-call-btn"
              aria-label="Direct call to salon"
            >
              <span className="direct-call-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </span>
              <span className="direct-call-text">Direct Call to Salon</span>
              <span className="direct-call-shine" aria-hidden="true"></span>
            </a>

          </div>
        </div>

        {/* =========================================
            PREMIUM SALON PHOTO GALLERY
            Photos na hon toh shining placeholder slides dikhengi
            ========================================= */}

        <section className="cafe-gallery-section" aria-label="Salon photo gallery">

          <span className="gallery-section-shine" aria-hidden="true"></span>

          <div className="gallery-heading">
            <span className="gallery-eyebrow">
              A GLIMPSE OF THE LOUNGE
            </span>

            <h2 className="gallery-title">
              Explore Our Salon
            </h2>

            <p className="gallery-subtitle">
              Styles, looks & moments worth sharing
            </p>
          </div>

          <div
            className="gallery-slider"
            onTouchStart={handleGalleryTouchStart}
            onTouchEnd={handleGalleryTouchEnd}
            onTouchCancel={() => {
              galleryTouchStartXRef.current = 0;
            }}
          >

            <div
              className="gallery-track"
              style={{
                transform: `translateX(-${galleryIndex * 100}%)`,
              }}
            >
              {GALLERY_SLIDES.map((image, index) => (
                <div
                  className="gallery-slide"
                  key={`lounge-gallery-${index + 1}`}
                >
                  <div className="gallery-image-frame">
                    {image ? (
                      <Image
                        src={image}
                        alt={`The Lounge Unisex Salon Pathankot gallery photo ${index + 1}`}
                        fill
                        sizes="(max-width: 410px) 100vw, 410px"
                        quality={90}
                        priority={index === 0}
                        loading={index === 0 ? "eager" : "lazy"}
                        draggable={false}
                        style={{
                          objectFit: "contain",
                          padding: "7px",
                          boxSizing: "border-box",
                          userSelect: "none",
                        }}
                      />
                    ) : (
                      <div className="gallery-placeholder">
                        <span className="gallery-placeholder-gem">◆</span>
                        <span className="gallery-placeholder-title">
                          The Lounge
                        </span>
                        <span className="gallery-placeholder-text">
                          Photos coming soon
                        </span>
                      </div>
                    )}

                    {/* Shining sweep over every slide */}
                    <span className="gallery-frame-shine" aria-hidden="true"></span>
                  </div>
                </div>
              ))}
            </div>

            {/* Previous Slide */}
            <button
              type="button"
              className="gallery-arrow gallery-arrow-left"
              onClick={handleGalleryPrevious}
              aria-label="Previous gallery photo"
            >
              <svg
                viewBox="0 0 24 24"
                width="19"
                height="19"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            {/* Next Slide */}
            <button
              type="button"
              className="gallery-arrow gallery-arrow-right"
              onClick={handleGalleryNext}
              aria-label="Next gallery photo"
            >
              <svg
                viewBox="0 0 24 24"
                width="19"
                height="19"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>

          </div>

          {/* Gallery indicators */}
          <div className="gallery-bottom-controls">

            <div className="gallery-dots" aria-label="Gallery slides">
              {GALLERY_SLIDES.map((_, index) => (
                <button
                  key={`gallery-dot-${index + 1}`}
                  type="button"
                  className={`gallery-dot ${
                    galleryIndex === index ? "active" : ""
                  }`}
                  onClick={() => setGalleryIndex(index)}
                  aria-label={`Show photo ${index + 1}`}
                  aria-current={galleryIndex === index ? "true" : undefined}
                />
              ))}
            </div>

            <span className="gallery-counter">
              {String(galleryIndex + 1).padStart(2, "0")}
              <span className="gallery-counter-divider"> / </span>
              {String(GALLERY_SLIDES.length).padStart(2, "0")}
            </span>

          </div>
        </section>

        {/* Map Card */}
        <div className="embedded-map-card">

          <a
            href={CLIENT_CONFIG.mapsDirectionUrl}
            target="_blank"
            rel="noreferrer"
            className="map-card-header-link"
          >
            <div className="address-highlight-box">
              <p className="agency-clean-address">
                <strong>📍 Address:</strong>{" "}
                {CLIENT_CONFIG.fullAddress}
              </p>
            </div>

            <div className="map-card-header">
              <span>Visit Us • {CLIENT_CONFIG.areaLabel}</span>
            </div>
          </a>

          <div className="map-iframe-container">
            <iframe
              title={`${CLIENT_CONFIG.businessName} Location`}
              src={MAP_EMBED_URL}
              width="100%"
              height="170"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <a
            href={CLIENT_CONFIG.mapsDirectionUrl}
            target="_blank"
            rel="noreferrer"
            className="map-directions-link"
          >
            Get Directions on Google Maps &rarr;
          </a>
        </div>

        {/* Mini Footer */}
        <footer className="mini-footer">
          <span className="mini-footer-pill">
            Powered by <strong>{CLIENT_CONFIG.agencyName}</strong>
            <span className="mini-footer-dot">•</span>
            Get QR:
            <a
              href={AGENCY_WA_LINK}
              target="_blank"
              rel="noreferrer"
            >
              {CLIENT_CONFIG.agencyPhoneDisplay}
            </a>
          </span>
        </footer>

      </div>

      <style jsx global>{`

        /* =========================================
           THE LOUNGE UNISEX SALON
           THEME: NOIR & CHAMPAGNE GOLD
           Poori coloring variables mein hai, sirf
           :root ke values badlo toh theme badal jayegi.
           ========================================= */

        :root {
          --c-page: #0b0a09;
          --c-surface: #17140f;
          --c-surface-rgb: 23, 20, 15;
          --c-soft: #221c13;
          --c-border: rgba(217, 183, 106, 0.28);
          --c-gold: #d9b76a;
          --c-gold-rgb: 217, 183, 106;
          --c-gold-light: #f3e2b0;
          --c-gold-deep: #a07d34;
          --c-text: #f4ecd8;
          --c-muted: #b5a687;
          --c-on-gold: #1b1408;
          --c-shadow-rgb: 0, 0, 0;
        }

        html,
        body {
          margin: 0 !important;
          padding: 0 !important;
          background: var(--c-page) !important;
          min-height: 100% !important;
          overflow-x: hidden !important;
        }

        /* =========================================
           FIXED BACKGROUND: black marble with gold veins
           ========================================= */

        .fixed-bg {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100vh;
          height: 100dvh;

          background-color: var(--c-page);
          background-image:
            radial-gradient(
              120% 55% at 50% -8%,
              rgba(var(--c-gold-rgb), 0.20),
              transparent 62%
            ),
            radial-gradient(
              90% 45% at 100% 100%,
              rgba(var(--c-gold-rgb), 0.10),
              transparent 62%
            ),
            linear-gradient(
              118deg,
              transparent 34%,
              rgba(var(--c-gold-rgb), 0.07) 35%,
              transparent 36.2%,
              transparent 58%,
              rgba(var(--c-gold-rgb), 0.05) 59%,
              transparent 60%,
              transparent 82%,
              rgba(var(--c-gold-rgb), 0.06) 83%,
              transparent 84%
            ),
            linear-gradient(180deg, #100e0b 0%, #090807 100%);
          background-repeat: no-repeat;

          z-index: 0;
          pointer-events: none;
        }

        .soft-luxury-viewport {
          position: relative;
          isolation: isolate;
          z-index: 1;
          min-height: 100vh;
          min-height: 100dvh;
          background: transparent;
          padding: 12px 16px 24px;
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: var(--c-text);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .main-content-flow {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 410px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .brand-medallion-badge {
          margin-top: 2px;
          margin-bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Double gold ring around the logo */
        .logo-ring {
          padding: 4px;
          border-radius: 50%;
          margin-bottom: 9px;
          background: conic-gradient(
            from 140deg,
            var(--c-gold-deep),
            var(--c-gold-light),
            var(--c-gold),
            var(--c-gold-deep),
            var(--c-gold-light),
            var(--c-gold-deep)
          );
          box-shadow:
            0 10px 22px rgba(var(--c-shadow-rgb), 0.55),
            0 0 22px rgba(var(--c-gold-rgb), 0.22);
          animation: floatLogo 3.5s ease-in-out infinite;
        }

        .logo-circle-container {
          width: 76px;
          height: 76px;
          border-radius: 50%;
          background-color: #000000;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          border: 3px solid #0b0a09;
          transition: transform 0.2s ease;
        }

        .logo-ring:active .logo-circle-container {
          transform: scale(0.96);
        }

        @keyframes floatLogo {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        @media (prefers-reduced-motion: reduce) {
          .logo-ring { animation: none; }
        }

        .brand-main-title {
          font-family: "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif;
          font-size: 15.5px;
          line-height: 1.25;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2.3px;
          margin: 0 0 4px;

          background: linear-gradient(
            180deg,
            var(--c-gold-light) 0%,
            var(--c-gold) 55%,
            var(--c-gold-deep) 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: var(--c-gold);
        }

        .brand-serif-subtitle {
          font-family: "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif;
          font-style: italic;
          font-size: 11.5px;
          line-height: 1.35;
          color: var(--c-muted);
          margin: 0 0 2px;
          letter-spacing: 0.3px;
        }

        .royal-shahi-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 85%;
          margin: 4px auto 6px;
          gap: 10px;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            var(--c-gold),
            transparent
          );
        }

        .divider-gem {
          color: var(--c-gold);
          font-size: 8px;
        }

        .stars-cluster {
          display: flex;
          gap: 4px;
          color: var(--c-gold);
          font-size: 13px;
          line-height: 1.15;
          margin-bottom: 2px;
          text-shadow: 0 0 10px rgba(var(--c-gold-rgb), 0.45);
        }

        .experience-tracker-title {
          font-size: 8.5px;
          font-weight: 800;
          letter-spacing: 3px;
          color: var(--c-gold-light);
          text-transform: uppercase;
          margin: 0 0 8px;
        }

        .floating-pills-cloud {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 6px 5px;
          margin: 0 auto 7px;
          width: 100%;
        }

        .chip-hint {
          text-align: center;
          font-size: 10.5px;
          color: var(--c-muted);
          margin: 0 0 8px;
          letter-spacing: 0.3px;
        }

        /* =========================================
           PREMIUM 3D FILTER CHIPS
           ========================================= */

        .embossed-pill {
          position: relative;
          border-radius: 999px;
          padding: 4.5px 10.5px;
          font-size: 10.5px;
          line-height: 1.4;
          letter-spacing: 0.2px;

          background: linear-gradient(
            145deg,
            #2a2216 0%,
            #16120c 100%
          );

          color: var(--c-gold-light);
          border: 1px solid var(--c-border);

          cursor: pointer;

          box-shadow:
            0 3px 7px rgba(var(--c-shadow-rgb), 0.45),
            0 1px 2px rgba(var(--c-shadow-rgb), 0.35),
            inset 0 1px 1px rgba(255, 236, 190, 0.14),
            inset 0 -1px 1px rgba(var(--c-shadow-rgb), 0.45);

          transition:
            transform 0.16s ease,
            box-shadow 0.16s ease,
            background 0.18s ease,
            color 0.18s ease,
            border-color 0.18s ease;
        }

        .embossed-pill:hover {
          transform: translateY(-2px);
          border-color: rgba(var(--c-gold-rgb), 0.6);
          box-shadow:
            0 6px 10px rgba(var(--c-shadow-rgb), 0.5),
            0 0 12px rgba(var(--c-gold-rgb), 0.14),
            inset 0 1px 1px rgba(255, 236, 190, 0.2);
        }

        .embossed-pill:active {
          transform: translateY(2px) scale(0.98);
          box-shadow:
            0 1px 3px rgba(var(--c-shadow-rgb), 0.5),
            inset 0 2px 4px rgba(var(--c-shadow-rgb), 0.5);
        }

        /* Selected chip */
        .embossed-pill.active {
          background: linear-gradient(
            145deg,
            var(--c-gold-light) 0%,
            var(--c-gold) 55%,
            var(--c-gold-deep) 100%
          );

          color: var(--c-on-gold);
          font-weight: 700;
          border: 1px solid var(--c-gold-light);

          box-shadow:
            0 4px 10px rgba(var(--c-gold-rgb), 0.30),
            0 2px 4px rgba(var(--c-shadow-rgb), 0.4),
            inset 0 1px 1px rgba(255, 255, 255, 0.55),
            inset 0 -2px 2px rgba(120, 85, 20, 0.35);
        }

        .embossed-pill.active:active {
          transform: translateY(2px);
          box-shadow:
            0 1px 3px rgba(var(--c-shadow-rgb), 0.4),
            inset 0 2px 4px rgba(120, 85, 20, 0.45);
        }

        /* =========================================
           PREMIUM 3D LANGUAGE SELECTOR
           ========================================= */

        .capsule-lang-dock {
          display: inline-flex;
          background: linear-gradient(145deg, #1d1810, #110e09);

          border-radius: 999px;
          padding: 3px;
          gap: 3px;
          margin: 0 auto 12px;

          box-shadow:
            0 5px 12px rgba(var(--c-shadow-rgb), 0.5),
            inset 0 1px 2px rgba(var(--c-shadow-rgb), 0.6);

          border: 1px solid var(--c-border);
        }

        .capsule-lang-btn {
          position: relative;
          padding: 5px 18px;
          border-radius: 999px;
          border: 1px solid transparent;
          background: transparent;
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.8px;
          color: var(--c-muted);
          cursor: pointer;

          transition:
            transform 0.16s ease,
            background 0.18s ease,
            box-shadow 0.18s ease,
            color 0.18s ease;
        }

        .capsule-lang-btn.active {
          background: linear-gradient(
            145deg,
            var(--c-gold-light),
            var(--c-gold) 60%,
            var(--c-gold-deep)
          );

          color: var(--c-on-gold);
          border-color: var(--c-gold-light);

          box-shadow:
            0 4px 9px rgba(var(--c-gold-rgb), 0.28),
            inset 0 1px 1px rgba(255, 255, 255, 0.5),
            inset 0 -2px 2px rgba(120, 85, 20, 0.3);
        }

        .capsule-lang-btn:active {
          transform: translateY(2px);
        }

        /* =========================================
           REVIEW CARD
           ========================================= */

        .signature-review-box {
          position: relative;
          width: 100%;
          background:
            linear-gradient(
              180deg,
              rgba(34, 28, 19, 0.96) 0%,
              rgba(var(--c-surface-rgb), 0.97) 100%
            );
          border-radius: 24px;
          padding: 12px 15px 10px;
          box-sizing: border-box;

          box-shadow:
            0 20px 44px rgba(var(--c-shadow-rgb), 0.55),
            0 0 0 1px rgba(var(--c-gold-rgb), 0.06),
            inset 0 1px 0 rgba(255, 236, 190, 0.10);

          margin-bottom: 16px;
          text-align: left;

          border: 1px solid var(--c-border);
          border-top: 3px solid var(--c-gold);

          outline: 1px solid rgba(var(--c-gold-rgb), 0.14);
          outline-offset: -7px;

          color: var(--c-text);
        }

        .box-top-ribbon {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .label-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 8.5px;
          font-weight: 800;
          letter-spacing: 2px;
          color: var(--c-gold);
          text-transform: uppercase;
        }

        .dot-ping {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--c-gold);
          box-shadow: 0 0 8px rgba(var(--c-gold-rgb), 0.8);
        }

        /* =========================================
           PREMIUM 3D REWRITE BUTTON
           ========================================= */

        .top-rewrite-btn {
          position: relative;
          display: inline-flex;
          align-items: center;

          padding: 5px 12px;
          border-radius: 999px;

          background: linear-gradient(145deg, #2a2216 0%, #16120c 100%);

          border: 1px solid var(--c-border);
          color: var(--c-gold-light);

          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.4px;

          cursor: pointer;

          box-shadow:
            0 3px 7px rgba(var(--c-shadow-rgb), 0.45),
            inset 0 1px 1px rgba(255, 236, 190, 0.14),
            inset 0 -1px 2px rgba(var(--c-shadow-rgb), 0.45);

          transition:
            transform 0.16s ease,
            box-shadow 0.16s ease,
            border-color 0.18s ease;
        }

        .top-rewrite-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          border-color: rgba(var(--c-gold-rgb), 0.6);
          box-shadow:
            0 6px 11px rgba(var(--c-shadow-rgb), 0.5),
            0 0 10px rgba(var(--c-gold-rgb), 0.14),
            inset 0 1px 1px rgba(255, 236, 190, 0.2);
        }

        .top-rewrite-btn:active:not(:disabled) {
          transform: translateY(2px);
          box-shadow:
            0 1px 2px rgba(var(--c-shadow-rgb), 0.5),
            inset 0 2px 3px rgba(var(--c-shadow-rgb), 0.55);
        }

        .top-rewrite-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Is height se review box ki lambai control hoti hai */
        .review-display-zone {
          min-height: 92px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2px 2px 2px;
        }

        .loader-shimmer-wrap {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: var(--c-muted);
          font-size: 12px;
          font-style: italic;
        }

        .sparkle-icon {
          color: var(--c-gold);
          animation: sparkleSpin 2.2s ease-in-out infinite;
        }

        @keyframes sparkleSpin {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.8; }
          50% { transform: scale(1.25) rotate(90deg); opacity: 1; }
        }

        .shimmer-text {
          background: linear-gradient(
            90deg,
            var(--c-muted) 0%,
            var(--c-gold-light) 50%,
            var(--c-muted) 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmerMove 1.8s linear infinite;
        }

        @keyframes shimmerMove {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .review-body-text {
          font-family: "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif;
          font-size: 13px;
          line-height: 1.55;
          color: var(--c-text);
          margin: 0;
          width: 100%;
          white-space: pre-wrap;
        }

        .review-placeholder {
          font-family: "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif;
          font-size: 13px;
          font-style: italic;
          color: var(--c-muted);
          margin: 0;
        }

        .review-error {
          font-size: 12px;
          color: #ff9a9a;
          margin: 0;
        }

        .typewriter-cursor {
          display: inline-block;
          width: 2px;
          height: 13px;
          background: var(--c-gold);
          margin-left: 3px;
          vertical-align: middle;
          animation: blink 0.7s infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .card-ornament-center {
          text-align: center;
          color: var(--c-gold);
          font-size: 7px;
          line-height: 1;
          margin: 3px 0 7px;
        }

        /* =========================================
           PREMIUM 3D MAIN COPY BUTTON
           ========================================= */

        .full-luxury-copy-btn {
          position: relative;
          overflow: hidden;

          width: 100%;
          height: 44px;
          border-radius: 999px;

          background: linear-gradient(
            145deg,
            var(--c-gold-light) 0%,
            var(--c-gold) 48%,
            var(--c-gold-deep) 100%
          );

          border: 1px solid var(--c-gold-light);
          color: var(--c-on-gold);

          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.6px;
          cursor: pointer;

          box-shadow:
            0 9px 18px rgba(var(--c-gold-rgb), 0.26),
            0 3px 6px rgba(var(--c-shadow-rgb), 0.45),
            inset 0 1px 1px rgba(255, 255, 255, 0.6),
            inset 0 -2px 3px rgba(120, 85, 20, 0.35);

          transition:
            transform 0.16s ease,
            background 0.18s ease,
            box-shadow 0.16s ease,
            opacity 0.18s ease;
        }

        .full-luxury-copy-btn:hover:not(:disabled) {
          transform: translateY(-2px);

          box-shadow:
            0 13px 22px rgba(var(--c-gold-rgb), 0.32),
            0 4px 8px rgba(var(--c-shadow-rgb), 0.45),
            inset 0 1px 1px rgba(255, 255, 255, 0.65);
        }

        .full-luxury-copy-btn:active:not(:disabled) {
          transform: translateY(2px);

          box-shadow:
            0 2px 4px rgba(var(--c-shadow-rgb), 0.45),
            inset 0 3px 5px rgba(120, 85, 20, 0.5);
        }

        .full-luxury-copy-btn.copied {
          filter: brightness(0.9);
        }

        .full-luxury-copy-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          box-shadow: none;
        }

        .card-disclaimer-note {
          font-size: 9.5px;
          color: var(--c-muted);
          text-align: center;
          margin: 7px 0 0;
          font-style: italic;
        }

        /* =========================================
           QUICK ACTIONS CARD
           ========================================= */

        .quick-actions-card {
          width: 100%;
          background: rgba(var(--c-surface-rgb), 0.94);
          border-radius: 22px;
          padding: 18px 12px;
          box-sizing: border-box;

          border: 1px solid var(--c-border);

          box-shadow:
            0 14px 32px rgba(var(--c-shadow-rgb), 0.5),
            inset 0 1px 0 rgba(255, 236, 190, 0.08);

          outline: 1px solid rgba(var(--c-gold-rgb), 0.12);
          outline-offset: -6px;

          margin-bottom: 16px;
        }

        .soft-action-grid {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          width: 100%;
        }

        .action-row-upper {
          display: flex;
          justify-content: center;
          gap: 14px;
          width: 100%;
        }

        .action-row-lower {
          display: flex;
          justify-content: center;
          gap: 14px;
          width: 100%;
        }

        /* =========================================
           PREMIUM 3D ACTION BUTTONS
           ========================================= */

        .soft-circle-action {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          gap: 7px;

          text-decoration: none !important;
          color: var(--c-muted);

          background: transparent;
          border: none;

          cursor: pointer;
          padding: 3px 4px 5px;

          -webkit-tap-highlight-color: transparent;

          transition:
            transform 0.18s ease,
            color 0.18s ease;
        }

        .soft-circle-action:hover {
          transform: translateY(-3px);
        }

        .soft-circle-action:active {
          transform: translateY(2px) scale(0.97);
        }

        .soft-circle-action:focus-visible {
          outline: 2px solid var(--c-gold);
          outline-offset: 4px;
          border-radius: 14px;
        }

        .icon-disc {
          position: relative;

          width: 54px;
          height: 54px;
          border-radius: 50%;

          background: linear-gradient(145deg, #2a2216 0%, #14110b 100%);

          display: grid;
          place-items: center;

          border: 1px solid rgba(var(--c-gold-rgb), 0.4);

          box-shadow:
            0 8px 14px rgba(var(--c-shadow-rgb), 0.5),
            0 2px 4px rgba(var(--c-shadow-rgb), 0.35),
            inset 0 2px 3px rgba(255, 236, 190, 0.14),
            inset 0 -2px 3px rgba(var(--c-shadow-rgb), 0.5);

          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease,
            background 0.18s ease,
            border-color 0.18s ease;
        }

        /* Soft inner highlight */
        .icon-disc::before {
          content: "";
          position: absolute;
          top: 3px;
          left: 7px;
          right: 7px;
          height: 35%;
          border-radius: 50%;

          background: linear-gradient(
            180deg,
            rgba(255, 236, 190, 0.18),
            rgba(255, 236, 190, 0)
          );

          pointer-events: none;
        }

        /* Icon depth */
        .icon-disc svg {
          position: relative;
          z-index: 1;

          width: 21px;
          height: 21px;

          stroke: var(--c-gold);
          stroke-width: 1.8;

          filter: drop-shadow(0 1px 2px rgba(var(--c-shadow-rgb), 0.6));

          transition:
            stroke 0.18s ease,
            transform 0.18s ease;
        }

        .soft-circle-action:hover .icon-disc {
          transform: translateY(-2px);
          border-color: rgba(var(--c-gold-rgb), 0.75);

          box-shadow:
            0 11px 18px rgba(var(--c-shadow-rgb), 0.55),
            0 0 14px rgba(var(--c-gold-rgb), 0.16),
            inset 0 2px 3px rgba(255, 236, 190, 0.2);
        }

        .soft-circle-action:active .icon-disc {
          transform: translateY(2px);

          box-shadow:
            0 2px 4px rgba(var(--c-shadow-rgb), 0.5),
            inset 0 3px 5px rgba(var(--c-shadow-rgb), 0.55);
        }

        .icon-tag {
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.3px;
          color: var(--c-muted);
          line-height: 1.3;
          white-space: nowrap;
          transition: color 0.18s ease;
        }

        .soft-circle-action:hover .icon-tag {
          color: var(--c-gold-light);
        }

        /* WhatsApp */
        .whatsapp-disc:hover {
          background: linear-gradient(145deg, #42e486, #1aaf58);
          border-color: #169c4d;
          box-shadow:
            0 7px 14px rgba(37, 211, 102, 0.25),
            inset 0 2px 3px rgba(255, 255, 255, 0.35);
        }

        .whatsapp-disc:hover svg {
          stroke: #ffffff;
        }

        /* Call */
        .call-disc:hover {
          background: linear-gradient(145deg, #45a4ff, #0874d1);
          border-color: #0868bd;
          box-shadow:
            0 7px 14px rgba(0, 122, 255, 0.22),
            inset 0 2px 3px rgba(255, 255, 255, 0.35);
        }

        .call-disc:hover svg {
          stroke: #ffffff;
        }

        /* Contact and Website: gold on hover */
        .contact-disc:hover {
          background: linear-gradient(
            145deg,
            var(--c-gold-light),
            var(--c-gold) 60%,
            var(--c-gold-deep)
          );
          border-color: var(--c-gold-light);
          box-shadow:
            0 8px 16px rgba(var(--c-gold-rgb), 0.28),
            inset 0 2px 3px rgba(255, 255, 255, 0.45);
        }

        .contact-disc:hover svg {
          stroke: var(--c-on-gold);
        }

        /* Directions */
        .map-disc:hover {
          background: linear-gradient(145deg, #ff776b, #e34539);
          border-color: #cf382e;
          box-shadow:
            0 7px 14px rgba(234, 67, 53, 0.22),
            inset 0 2px 3px rgba(255, 255, 255, 0.30);
        }

        .map-disc:hover svg {
          stroke: #ffffff;
        }

        /* Instagram */
        .insta-disc:hover {
          background: radial-gradient(
            circle at 30% 107%,
            #fdf497 0%,
            #fdf497 5%,
            #fd5949 45%,
            #d6249f 60%,
            #285AEB 90%
          );

          border-color: #d6249f;

          box-shadow:
            0 7px 14px rgba(214, 36, 159, 0.20),
            inset 0 2px 3px rgba(255, 255, 255, 0.30);
        }

        .insta-disc:hover svg {
          stroke: #ffffff;
        }

        /* WhatsApp Channel */
        .wa-channel-disc:hover {
          background: linear-gradient(145deg, #42e486, #1aaf58);
          border-color: #169c4d;
        }

        .wa-channel-disc:hover svg {
          stroke: #ffffff;
        }

        /* Facebook */
        .fb-disc:hover {
          background: linear-gradient(145deg, #4095ff, #1877f2);
          border-color: #1266cf;
          box-shadow:
            0 7px 14px rgba(24, 119, 242, 0.22),
            inset 0 2px 3px rgba(255, 255, 255, 0.30);
        }

        .fb-disc:hover svg {
          stroke: #ffffff;
        }

        /* YouTube */
        .yt-disc:hover {
          background: linear-gradient(145deg, #ff4848, #cc0000);
          border-color: #b00000;
          box-shadow:
            0 7px 14px rgba(255, 0, 0, 0.20),
            inset 0 2px 3px rgba(255, 255, 255, 0.30);
        }

        .yt-disc:hover svg {
          stroke: #ffffff;
          color: #ffffff;
        }

        /* =========================================
           DIRECT CALL TO SALON - SLIM PREMIUM BUTTON
           ========================================= */

        .direct-call-btn {
          position: relative;
          overflow: hidden;
          isolation: isolate;

          width: 72%;
          max-width: 250px;
          height: 42px;
          border-radius: 999px;
          box-sizing: border-box;

          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          text-decoration: none !important;
          cursor: pointer;
          margin-top: 2px;

          background: linear-gradient(
            145deg,
            var(--c-gold-light) 0%,
            var(--c-gold) 55%,
            var(--c-gold-deep) 100%
          );

          border: 1px solid var(--c-gold-light);
          color: var(--c-on-gold);

          box-shadow:
            0 8px 16px rgba(var(--c-gold-rgb), 0.24),
            0 2px 4px rgba(var(--c-shadow-rgb), 0.4),
            inset 0 1px 1px rgba(255, 255, 255, 0.6),
            inset 0 -2px 3px rgba(120, 85, 20, 0.3);

          -webkit-tap-highlight-color: transparent;

          transition:
            transform 0.16s ease,
            filter 0.18s ease,
            box-shadow 0.18s ease;
        }

        .direct-call-btn::before {
          content: "";
          position: absolute;
          top: 2px;
          left: 14px;
          right: 14px;
          height: 38%;
          border-radius: 999px;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.5),
            rgba(255, 255, 255, 0)
          );
          pointer-events: none;
          z-index: 1;
        }

        .direct-call-shine {
          position: absolute;
          top: -20%;
          left: -60%;
          width: 34%;
          height: 140%;
          background: linear-gradient(
            100deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.65) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: skewX(-20deg);
          animation: directCallShine 3.4s ease-in-out infinite;
          pointer-events: none;
          z-index: 2;
        }

        @keyframes directCallShine {
          0% { left: -60%; }
          55%, 100% { left: 130%; }
        }

        .direct-call-icon {
          position: relative;
          z-index: 3;

          width: 24px;
          height: 24px;
          border-radius: 50%;

          display: grid;
          place-items: center;

          background: linear-gradient(145deg, #2a2216, #0f0c07);
          color: var(--c-gold-light);

          box-shadow:
            0 2px 4px rgba(var(--c-shadow-rgb), 0.45),
            inset 0 1px 1px rgba(255, 236, 190, 0.2);
        }

        .direct-call-icon svg {
          width: 12px;
          height: 12px;
          stroke: currentColor;
          animation: directCallRing 2.4s ease-in-out infinite;
          transform-origin: center;
        }

        @keyframes directCallRing {
          0%, 60%, 100% { transform: rotate(0deg); }
          66% { transform: rotate(-14deg); }
          72% { transform: rotate(12deg); }
          78% { transform: rotate(-10deg); }
          84% { transform: rotate(8deg); }
          90% { transform: rotate(0deg); }
        }

        .direct-call-text {
          position: relative;
          z-index: 3;

          font-size: 11.5px;
          font-weight: 800;
          letter-spacing: 0.6px;
          color: var(--c-on-gold);
        }

        .direct-call-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.05);
          box-shadow:
            0 12px 20px rgba(var(--c-gold-rgb), 0.3),
            0 3px 6px rgba(var(--c-shadow-rgb), 0.4),
            inset 0 1px 1px rgba(255, 255, 255, 0.65);
        }

        .direct-call-btn:active {
          transform: translateY(2px) scale(0.985);
          box-shadow:
            0 2px 4px rgba(var(--c-shadow-rgb), 0.4),
            inset 0 2px 4px rgba(120, 85, 20, 0.4);
        }

        .direct-call-btn:focus-visible {
          outline: 2px solid var(--c-gold-light);
          outline-offset: 3px;
        }

        @media (prefers-reduced-motion: reduce) {
          .direct-call-btn,
          .direct-call-shine,
          .direct-call-icon svg {
            animation: none !important;
          }
        }

        /* =========================================
           PREMIUM SALON GALLERY (with shining effect)
           ========================================= */

        .cafe-gallery-section {
          position: relative;
          width: 100%;
          box-sizing: border-box;
          padding: 17px 13px 14px;
          margin: 0 0 16px;

          background: rgba(var(--c-surface-rgb), 0.95);
          border: 1px solid var(--c-border);
          border-top: 3px solid var(--c-gold);
          border-radius: 22px;

          box-shadow:
            0 14px 32px rgba(var(--c-shadow-rgb), 0.5),
            0 0 22px rgba(var(--c-gold-rgb), 0.08),
            inset 0 1px 0 rgba(255, 236, 190, 0.08);

          outline: 1px solid rgba(var(--c-gold-rgb), 0.12);
          outline-offset: -6px;

          overflow: hidden;
          isolation: isolate;
        }

        .gallery-section-shine {
          position: absolute;
          top: -10%;
          left: -70%;
          width: 30%;
          height: 120%;
          background: linear-gradient(
            100deg,
            rgba(255, 236, 190, 0) 0%,
            rgba(255, 236, 190, 0.10) 50%,
            rgba(255, 236, 190, 0) 100%
          );
          transform: skewX(-20deg);
          animation: gallerySectionShine 6s ease-in-out infinite;
          pointer-events: none;
          z-index: 0;
        }

        @keyframes gallerySectionShine {
          0% { left: -70%; }
          60%, 100% { left: 150%; }
        }

        .gallery-heading {
          position: relative;
          z-index: 1;
          text-align: center;
          margin: 0 0 13px;
        }

        .gallery-eyebrow {
          display: inline-block;
          color: var(--c-gold);
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 5px;
        }

        .gallery-title {
          font-family: "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif;
          font-size: 21px;
          font-weight: 700;
          line-height: 1.2;
          margin: 0 0 5px;

          background: linear-gradient(
            180deg,
            var(--c-gold-light) 0%,
            var(--c-gold) 60%,
            var(--c-gold-deep) 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: var(--c-gold-light);
        }

        .gallery-subtitle {
          color: var(--c-muted);
          font-family: "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif;
          font-size: 11px;
          font-style: italic;
          line-height: 1.4;
          margin: 0;
        }

        .gallery-slider {
          position: relative;
          z-index: 1;
          width: 100%;
          overflow: hidden;
          border-radius: 17px;
          background: #0f0c08;

          touch-action: pan-y;
          user-select: none;
          -webkit-user-select: none;
        }

        .gallery-track {
          display: flex;
          width: 100%;

          transition: transform 650ms cubic-bezier(
            0.22,
            1,
            0.36,
            1
          );

          will-change: transform;
        }

        .gallery-slide {
          flex: 0 0 100%;
          width: 100%;
          min-width: 100%;
          box-sizing: border-box;
        }

        .gallery-image-frame {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          min-height: 210px;
          max-height: 290px;

          overflow: hidden;
          border-radius: 17px;

          background: linear-gradient(145deg, #1d1810 0%, #0f0c08 100%);

          border: 1px solid rgba(var(--c-gold-rgb), 0.4);

          box-shadow:
            0 4px 14px rgba(var(--c-shadow-rgb), 0.45),
            0 0 14px rgba(var(--c-gold-rgb), 0.10),
            inset 0 1px 2px rgba(255, 236, 190, 0.10);
        }

        .gallery-image-frame img {
          user-select: none;
          -webkit-user-drag: none;
        }

        .gallery-frame-shine {
          position: absolute;
          top: -20%;
          left: -60%;
          width: 32%;
          height: 140%;
          background: linear-gradient(
            100deg,
            rgba(255, 236, 190, 0) 0%,
            rgba(255, 236, 190, 0.28) 50%,
            rgba(255, 236, 190, 0) 100%
          );
          transform: skewX(-20deg);
          animation: galleryFrameShine 4s ease-in-out infinite;
          pointer-events: none;
          z-index: 3;
        }

        @keyframes galleryFrameShine {
          0% { left: -60%; }
          55%, 100% { left: 135%; }
        }

        .gallery-placeholder {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;

          background:
            radial-gradient(
              70% 60% at 50% 40%,
              rgba(var(--c-gold-rgb), 0.14),
              transparent 70%
            ),
            linear-gradient(145deg, #1d1810 0%, #0f0c08 100%);
        }

        .gallery-placeholder-gem {
          color: var(--c-gold);
          font-size: 14px;
          text-shadow: 0 0 14px rgba(var(--c-gold-rgb), 0.7);
        }

        .gallery-placeholder-title {
          font-family: "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif;
          font-size: 19px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;

          background: linear-gradient(
            180deg,
            var(--c-gold-light) 0%,
            var(--c-gold) 60%,
            var(--c-gold-deep) 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: var(--c-gold);
        }

        .gallery-placeholder-text {
          font-family: "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif;
          font-size: 11px;
          font-style: italic;
          letter-spacing: 0.6px;
          color: var(--c-muted);
        }

        .gallery-arrow {
          position: absolute;
          z-index: 4;
          top: 50%;
          transform: translateY(-50%);

          width: 34px;
          height: 34px;
          border-radius: 50%;

          display: grid;
          place-items: center;

          background: rgba(15, 12, 8, 0.82);
          color: var(--c-gold-light);
          border: 1px solid rgba(var(--c-gold-rgb), 0.45);

          box-shadow:
            0 4px 10px rgba(var(--c-shadow-rgb), 0.5),
            inset 0 1px 1px rgba(255, 236, 190, 0.14);

          cursor: pointer;

          transition:
            background 0.18s ease,
            transform 0.18s ease,
            box-shadow 0.18s ease,
            color 0.18s ease;

          -webkit-tap-highlight-color: transparent;
        }

        .gallery-arrow-left {
          left: 8px;
        }

        .gallery-arrow-right {
          right: 8px;
        }

        .gallery-arrow:hover {
          background: var(--c-gold);
          color: var(--c-on-gold);
          box-shadow: 0 6px 14px rgba(var(--c-gold-rgb), 0.3);
        }

        .gallery-arrow:active {
          transform: translateY(-50%) scale(0.91);
        }

        .gallery-arrow:focus-visible {
          outline: 2px solid var(--c-gold);
          outline-offset: 3px;
        }

        .gallery-bottom-controls {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 12px;
          min-height: 12px;
        }

        .gallery-dots {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }

        .gallery-dot {
          appearance: none;
          -webkit-appearance: none;

          width: 6px;
          height: 6px;
          min-width: 6px;

          padding: 0;
          border: 0;
          border-radius: 999px;

          background: rgba(var(--c-gold-rgb), 0.28);
          cursor: pointer;

          transition:
            width 350ms ease,
            background 250ms ease,
            box-shadow 250ms ease;
        }

        .gallery-dot.active {
          width: 19px;
          background: linear-gradient(90deg, var(--c-gold-deep), var(--c-gold-light));
          box-shadow: 0 0 8px rgba(var(--c-gold-rgb), 0.45);
        }

        .gallery-counter {
          color: var(--c-muted);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.8px;
          font-variant-numeric: tabular-nums;
        }

        .gallery-counter-divider {
          color: var(--c-gold);
          padding: 0 2px;
        }

        /* =========================================
           MAP CARD
           ========================================= */

        .embedded-map-card {
          width: 100%;
          background: rgba(var(--c-surface-rgb), 0.95);
          border-radius: 22px;
          padding: 14px 16px;
          box-sizing: border-box;

          border: 1px solid var(--c-border);

          box-shadow:
            0 12px 28px rgba(var(--c-shadow-rgb), 0.5),
            inset 0 1px 0 rgba(255, 236, 190, 0.08);

          margin-bottom: 12px;
          text-align: left;
        }

        .map-card-header-link {
          text-decoration: none;
        }

        .map-card-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;

          font-size: 11.5px;
          font-weight: 800;
          letter-spacing: 0.8px;
          color: var(--c-gold-light);

          margin-bottom: 8px;
        }

        .map-iframe-container {
          width: 100%;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid var(--c-border);
          margin-bottom: 8px;
        }

        .map-iframe-container iframe {
          display: block;
          filter: grayscale(0.35) contrast(1.05) brightness(0.92);
        }

        .map-directions-link {
          font-size: 11px;
          font-weight: 750;
          color: var(--c-gold);
          text-decoration: none;
          display: block;
          text-align: center;
          margin-bottom: 8px;
        }

        .address-highlight-box {
          background: linear-gradient(145deg, #221c13, #17140f);
          border-radius: 12px;
          padding: 10px 12px;
          border: 1px solid var(--c-border);
          margin-bottom: 8px;
        }

        .agency-clean-address {
          font-size: 10.5px;
          color: var(--c-muted);
          margin: 0;
          line-height: 1.4;
          text-align: center;
        }

        .agency-clean-address strong {
          color: var(--c-gold-light);
        }

        /* =========================================
           MINI FOOTER
           ========================================= */

        .mini-footer {
          width: 100%;
          display: flex;
          justify-content: center;
          margin-top: 2px;
        }

        .mini-footer-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 4px;

          padding: 5px 12px;

          border: 1px solid var(--c-border);
          border-radius: 999px;
          background: rgba(var(--c-surface-rgb), 0.94);

          font-size: 8.5px;
          letter-spacing: 0.3px;
          color: var(--c-muted);
          line-height: 1.4;
        }

        .mini-footer-pill strong {
          color: var(--c-gold-light);
          font-weight: 700;
        }

        .mini-footer-dot {
          color: var(--c-gold);
        }

        .mini-footer-pill a {
          color: var(--c-gold);
          font-weight: 700;
          text-decoration: none;
        }

        /* =========================================
           CHHOTE / KAM HEIGHT WALE PHONES
           Taaki review box ka button wahan bhi pehli screen mein dikhe
           ========================================= */

        @media (max-height: 780px) {
          .soft-luxury-viewport {
            padding-top: 8px;
          }

          .logo-circle-container {
            width: 64px;
            height: 64px;
          }

          .logo-ring {
            margin-bottom: 6px;
          }

          .brand-main-title {
            font-size: 14.5px;
            margin-bottom: 2px;
          }

          .brand-serif-subtitle {
            font-size: 10.5px;
          }

          .royal-shahi-divider {
            margin: 3px auto 4px;
          }

          .experience-tracker-title {
            margin-bottom: 6px;
          }

          .floating-pills-cloud {
            gap: 5px 4px;
            margin-bottom: 5px;
          }

          .embossed-pill {
            padding: 3.5px 9px;
            font-size: 10px;
          }

          .chip-hint {
            margin-bottom: 6px;
          }

          .capsule-lang-dock {
            margin-bottom: 9px;
          }

          .review-display-zone {
            min-height: 80px;
          }

          .review-body-text {
            font-size: 12.5px;
            line-height: 1.5;
          }

          .full-luxury-copy-btn {
            height: 42px;
          }
        }

        @media (max-height: 680px) {
          .stars-cluster,
          .chip-hint {
            display: none;
          }

          .logo-circle-container {
            width: 52px;
            height: 52px;
          }

          .review-display-zone {
            min-height: 70px;
          }
        }

        /* =========================================
           RESPONSIVE GALLERY
           ========================================= */

        @media (max-width: 360px) {
          .cafe-gallery-section {
            padding: 14px 10px 12px;
          }

          .gallery-title {
            font-size: 19px;
          }

          .gallery-image-frame {
            min-height: 190px;
          }

          .gallery-arrow {
            width: 30px;
            height: 30px;
          }

          .gallery-dots {
            gap: 4px;
          }

          .brand-main-title {
            font-size: 14px;
            letter-spacing: 2px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .gallery-track {
            transition: none;
          }

          .gallery-dot,
          .gallery-arrow {
            transition: none;
          }

          .gallery-frame-shine,
          .gallery-section-shine {
            animation: none !important;
            display: none;
          }
        }

        /* =========================================
           ACCESSIBILITY & MOBILE TOUCH
           ========================================= */

        button,
        a {
          -webkit-tap-highlight-color: transparent;
        }

        button:focus-visible,
        a:focus-visible {
          outline: 2px solid var(--c-gold);
          outline-offset: 3px;
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            scroll-behavior: auto !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

      `}</style>
    </main>
  );
}
