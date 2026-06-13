export const DEFAULT_COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'IN', name: 'India' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'SG', name: 'Singapore' },
  { code: 'MY', name: 'Malaysia' }
]

export const DEFAULT_STATES: Record<string, { code: string; name: string }[]> = {
  US: [
    { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
  ],
  CA: [
    { code: 'AB', name: 'Alberta' }, { code: 'BC', name: 'British Columbia' }, { code: 'MB', name: 'Manitoba' },
    { code: 'NB', name: 'New Brunswick' }, { code: 'NL', name: 'Newfoundland and Labrador' },
    { code: 'NS', name: 'Nova Scotia' }, { code: 'ON', name: 'Ontario' }, { code: 'PE', name: 'Prince Edward Island' },
    { code: 'QC', name: 'Quebec' }, { code: 'SK', name: 'Saskatchewan' }
  ],
  GB: [
    { code: 'ENG', name: 'England' }, { code: 'SCT', name: 'Scotland' }, { code: 'WLS', name: 'Wales' }, { code: 'NIR', name: 'Northern Ireland' }
  ],
  AU: [
    { code: 'NSW', name: 'New South Wales' }, { code: 'QLD', name: 'Queensland' }, { code: 'SA', name: 'South Australia' },
    { code: 'TAS', name: 'Tasmania' }, { code: 'VIC', name: 'Victoria' }, { code: 'WA', name: 'Western Australia' }
  ],
  IN: [
    { code: 'AP', name: 'Andhra Pradesh' }, { code: 'AR', name: 'Arunachal Pradesh' }, { code: 'AS', name: 'Assam' },
    { code: 'BR', name: 'Bihar' }, { code: 'CG', name: 'Chhattisgarh' }, { code: 'GA', name: 'Goa' },
    { code: 'GJ', name: 'Gujarat' }, { code: 'HR', name: 'Haryana' }, { code: 'HP', name: 'Himachal Pradesh' },
    { code: 'JH', name: 'Jharkhand' }, { code: 'KA', name: 'Karnataka' }, { code: 'KL', name: 'Kerala' },
    { code: 'MP', name: 'Madhya Pradesh' }, { code: 'MH', name: 'Maharashtra' }, { code: 'MN', name: 'Manipur' },
    { code: 'ML', name: 'Meghalaya' }, { code: 'MZ', name: 'Mizoram' }, { code: 'NL', name: 'Nagaland' },
    { code: 'OD', name: 'Odisha' }, { code: 'PB', name: 'Punjab' }, { code: 'RJ', name: 'Rajasthan' },
    { code: 'SK', name: 'Sikkim' }, { code: 'TN', name: 'Tamil Nadu' }, { code: 'TG', name: 'Telangana' },
    { code: 'TR', name: 'Tripura' }, { code: 'UP', name: 'Uttar Pradesh' }, { code: 'UK', name: 'Uttarakhand' },
    { code: 'WB', name: 'West Bengal' }
  ],
  ID: [
    { code: 'AC', name: 'Aceh' }, { code: 'BA', name: 'Bali' }, { code: 'BT', name: 'Banten' },
    { code: 'BE', name: 'Bengkulu' }, { code: 'GO', name: 'Gorontalo' }, { code: 'JK', name: 'DKI Jakarta' },
    { code: 'JA', name: 'Jambi' }, { code: 'JB', name: 'Jawa Barat' }, { code: 'JT', name: 'Jawa Tengah' },
    { code: 'JI', name: 'Jawa Timur' }, { code: 'KB', name: 'Kalimantan Barat' }, { code: 'KS', name: 'Kalimantan Selatan' },
    { code: 'KT', name: 'Kalimantan Tengah' }, { code: 'KI', name: 'Kalimantan Timur' }, { code: 'KU', name: 'Kalimantan Utara' },
    { code: 'KR', name: 'Kepulauan Riau' }, { code: 'BB', name: 'Kepulauan Bangka Belitung' }, { code: 'LA', name: 'Lampung' },
    { code: 'MA', name: 'Maluku' }, { code: 'MU', name: 'Maluku Utara' }, { code: 'NB', name: 'Nusa Tenggara Barat' },
    { code: 'NT', name: 'Nusa Tenggara Timur' }, { code: 'PA', name: 'Papua' }, { code: 'PB', name: 'Papua Barat' },
    { code: 'RI', name: 'Riau' }, { code: 'SR', name: 'Sulawesi Barat' }, { code: 'SN', name: 'Sulawesi Selatan' },
    { code: 'ST', name: 'Sulawesi Tengah' }, { code: 'SG', name: 'Sulawesi Tenggara' }, { code: 'SA', name: 'Sulawesi Utara' },
    { code: 'SB', name: 'Sumatera Barat' }, { code: 'SS', name: 'Sumatera Selatan' }, { code: 'SU', name: 'Sumatera Utara' },
    { code: 'YO', name: 'DI Yogyakarta' }
  ],
  MY: [
    { code: 'JH', name: 'Johor' }, { code: 'KD', name: 'Kedah' }, { code: 'KL', name: 'Kelantan' },
    { code: 'ML', name: 'Melaka' }, { code: 'NS', name: 'Negeri Sembilan' }, { code: 'PH', name: 'Pahang' },
    { code: 'PG', name: 'Penang' }, { code: 'PK', name: 'Perak' }, { code: 'PL', name: 'Perlis' },
    { code: 'SB', name: 'Sabah' }, { code: 'SR', name: 'Sarawak' }, { code: 'SL', name: 'Selangor' },
    { code: 'TR', name: 'Terengganu' }, { code: 'KL_FT', name: 'Kuala Lumpur (FT)' },
    { code: 'LB_FT', name: 'Labuan (FT)' }, { code: 'PJ_FT', name: 'Putrajaya (FT)' }
  ],
  SG: [
    { code: 'SG', name: 'Singapore' }
  ]
}
