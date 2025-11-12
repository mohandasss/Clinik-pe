export type OrganizationRegistrationPayload = {
  name: string;
  email: string;
  mobile: string;
  role: string;
  device_type: string;
  device_id: string;
  frontend_type: string;
  time_zone?: string;
};

export type OrganizationSuccessResponse = {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    request_id: string;
    otp_id: string;
  };
};

export type VerifyOtpPayload = {
  request_id: string;
  otp_id: string;
  otp: string;
  device_type: string;
  device_id: string;
  frontend_type: string;
}

export type VerifyOtpResponse = {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    verified: boolean;
  };
}

export type ResendOtpPayload = {
  request_id: string;
  device_type: string;
  device_id: string;
  frontend_type: string;
}

export type ResendOtpResponse = {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    otp_id: string;
  };
}

export type OrganizationAddPayloads = {
  organization_name: string;
  center_name: string;
  is_clinic: number;
  is_diagnostic: number;
  primary_contact: string;
  secondary_contact?: string;
  branch_email: string;
  address: {
    address: string;
    lat: string;
    lng: string;
    postalCode: string;
    line_1: string;
    line_2: string;
    country: string;
    state_or_province: string;
    district: string;
    city: string;
    village: string;
    town: string;
    land_mark: string;
    instruction: string;
  };
};


export interface OrganizationLoginRequestPayload {
  emailMobile: string | number;
  device_type: string
  device_id: string;
  frontend_type: string
}

export type AccessToken = {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    verified: boolean;
    loggedUserDetails: {
      organization_id: string | null;
      user_id: string;
      name: string;
      email: string;
      mobile: string;
      user_role: string;
      user_type: string;
      central_account_id: string;
      time_zone: string;
      currency: string | null;
      country: string | null;
      access: string | null;
      center_id: string | null;
      image: string | null;
    };
  };
}

export type OrganizationAddInside = {
  organization_name: string;
  address: string;
  phone: string;
  legal_id: string;
  email: string;
  founded_date: string; // You can use Date if you plan to parse it as a Date object
};
export type OrganizationAddInsideResponse = {
  success: boolean;
  httpStatus: number;
  message: string;

};


//twin
export interface Organization {
  id: string;
  uid: string;
  central_account_id: string;
  name: string;
  country: string | null;
  currency: string | null;
  status: string;
  created_at: string;
  updated_at: string | null;
  time_zone: string;
  legal_id: string;
  founded_date: string;
  phone: string;
  email: string;
  address: string;
}

export interface Pagination {
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  pageCount: number;
}

export interface OrganizationListResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    organization: Organization[];
    pagination: Pagination;
  };
}


export type WorkingHour = {
  week_day: string;
  start_time: string;
  end_time: string;
};

export type CenterRequestPayload = {
  name: string;
  address: string;
  email: string;
  primary_contact: string;
  secondary_contact: string;
  image_path: string;
  is_clinic: number;
  is_diagnostic: number;
  working_hours: WorkingHour[];
  organization_id?: string;
};

export interface CreateCenterResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    center_id: string;
  };
}

export interface CenterListResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    center: Center[];
    center_stats: CenterStats;
    pagination: Pagination;
  };
}

export interface Center {
  id: string;
  uid: string;
  central_account_id: string;
  organization_id: string | null;
  name: string;
  address: string | null;
  email: string;
  primary_contact: string;
  secondary_contact: string;
  is_clinic: string;
  is_diagnostic: string;
  lat: string | null;
  lng: string | null;
  image: string;
  status: string;
  type: string;
  created_by: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string | null;
  time_zone: string;
}

export interface CenterStats {
  total: number;
  active: number;
  inactive: number;
  growth: {
    total: GrowthInfo;
    active: GrowthInfo;
    inactive: GrowthInfo;
  };
}

export interface GrowthInfo {
  percentage: number;
  icon: string | null;
  current: number;
  last: number;
}

export interface Pagination {
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  pageCount: number;
}
export interface ExperienceItem {
  uid: string;
  name: string;
}


export interface ExperienceResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: ExperienceItem[];
}

export interface QualificationItem {
  uid: string;
  name: string;
}

export interface QualificationResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: QualificationItem[];
}


export interface SpecialityItem {
  uid: string;
  name: string;
}

export interface SpecialityResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: SpecialityItem[];
}


export interface UploadData {
  uploadPath: string;
}

export interface FileUploadResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: UploadData;
}


export type DoctorExperience = {
  speciality_id: string;
  years_of_experience: string;
};

export type DoctorLicense = {
  speciality_id: string;
  license_number: string;
};

export type DoctorQualification = {
  name: string;
  qualification_id: string;
  institute_id: string;
  institute_name: string;
};

export type DoctorSpeciality = {
  name: string;
  speciality_id: string;
};

export type ProviderDetails = {
  contact_email: string;
  contact_mobile: string;
  doctorExperiences: DoctorExperience[];
  doctorLicenses: DoctorLicense[];
  doctorQualification: DoctorQualification[];
  doctorSpecialty: DoctorSpeciality[];
  image_path: string;
  name: string;
  time_zone: string;
};


export interface ProviderListResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    providers: Provider[];
    stats: Stats;
    pagination: Pagination;
  };
}

export interface Provider {
  uid: string;
  profile_pic: string;
  name: string;
  email: string;
  mobile: string;
  gender: string;
  dob: string;
  summary: string;
  status: string;
  registration: string;
  specialities: Speciality[];
}

export interface Speciality {
  uid: string;
  name: string;
}

export interface Stats {
  total: string;
  active: string;
  inactive: number;
  filteredTotal: string;
}

export interface Pagination {
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  pageCount: number;
}


export interface SwitchOrganizationResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    last_organization_uid: string;
    switchAccessDetails: {
      organization_id: string;
      organization_name: string;
      user_id: string;
      center_name: string;
      center_id: string;
      central_account_id: string;
      user_type: string;
      name: string;
      email: string;
      mobile: string;
      time_zone: string;
      currency: string | null;
      country: string | null;
      access: any | null;
      image: string | null;
      iat: number;
      exp: number;
    };
  };
}

export interface DoctorAvailabilityResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    doctorProfile: {
      uid: string;
      profile_pic: string;
      name: string;
      email: string | null;
      mobile: string | null;
      gender: string;
      dob: string | null;
      summary: string;
      registration: string | null;
      specialities: any[]; // You can replace `any` with a proper type if known
      experience: any[];   // Same here
    };
    availabilities: any[]; // Define structure when known
    pagination: {
      pageNumber: number;
      pageSize: number;
      totalRecords: number;
      pageCount: number;
    };
  };
}


export type DoctorAvailability = {
  uid: string;
  center_id: string;
  doctor_id: string;
  specialization_id: string;
  organization_id: string | null;
  appointment_type: string;
  time_slot_interval: string;
  week_days: string[];
  start_time: string;
  end_time: string;
  status: string;
};

export type DoctorAvailabilityInput = {
  week_days: string[];
  times: string[];
  time_slot_interval: string;
  appointment_type: string;
  speciality_id: string;
  center_id: string;
};

export type AddDoctorAvailabilityResponse = {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    doctorUid: string;
  };
};


export  type PaymentSetting = {
  key:
    | "payment.cash"
    | "payment.online"
    | "payment.bank_account_name"
    | "payment.bank_account_type"
    | "payment.bank_account_number"
    | "payment.ifsc_code"
    | "payment.bank_name"
    | "payment.branch_name";
  value: string | boolean;
};

 export type PaymentSettingsPayload = {
  central_account_id: string;
  settings: PaymentSetting[];
};
export  type SyncSettingsResponse = {
  success: boolean;
  httpStatus: number;
  message: string;
  data: null;
};






















