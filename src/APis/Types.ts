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

export type TimeRangeInput = {
  start: string;
  end: string;
  wait_time?: string; // optional wait time in minutes as string
  time_slot_interval: string; // minutes as string
};

export type AvailabilityInputItem = {
  week_days: string[]; // single string entry like ["Wednesday , Friday"]
  time_ranges: TimeRangeInput[];
  appointment_type: string;
  speciality_id?: string;
};

export type DoctorAvailabilityInput = {
  availabilities: AvailabilityInputItem[];
  speciality_id?: string;
};

export type DoctorAvailabilityCreateResponse = {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    saved_availabilities: string[];
    doctorUid: string;
  };
};



export type PaymentSetting = {
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
export type SyncSettingsResponse = {
  success: boolean;
  httpStatus: number;
  message: string;
  data: null;
};

export type CreateDoctorFeeResponse = {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    feeUid: string;
  };
};


export type DoctorCommissionPayload = {
  doctor_id: string;
  appointment_type: string;
  fee_amount: string;
  commission_type: string;
  commission: string;
  speciality_id?: string;
};


export interface FeeManagementResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: FeeManagementData;
}

export interface FeeManagementData {
  provider_fee_list: ProviderFee[];
  pagination: Pagination;
}

export interface ProviderFee {
  id: string;
  uid: string;
  central_account_id: string;
  organization_id: string;
  center_id: string;
  doctor_id: string;
  appointment_type: string;
  fee: string;
  commission_type: "%" | "₹" | string;
  commission: string;
  created_at: string;
  created_by: string;
  updated_at: string | null;
  updated_by: string | null;
  doctor_name: string;
  doctor_email: string | null;
  doctor_mobile: string | null;
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
}

export interface DoctorAvailabilityListResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    availabilities: DoctorAvailability[];
    pagination: PaginationInfo;
  };
}

export interface DoctorAvailabilityRES {
  uid: string;
  centerId: string;
  doctorId: string;
  doctorName: string;
  specializationId: string;
  organizationId: string;
  appointmentType: "online" | "in-clinic" | "both";
  defaultSlotInterval: string;
  weekDays: string;
  timeRanges: AvailabilityTimeRange[];
  status: "active" | "inactive";
}

// Internal time slots per availability
export interface AvailabilityTimeRange {
  startTime: string;      // "10:00 AM"
  endTime: string;        // "05:00 PM"
  waitTime: string;       // "0"
  slotInterval: string;   // "30"
}

// Pagination block
export interface PaginationInfo {
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  pageCount: number;
}

export interface CreatePatientPayload {
  name: string;
  last_name: string;
  dob: string;               // format: YYYY-MM-DD
  email: string;
  mobile: string;
  age: number;
  age_on_date: string;       // format: YYYY-MM-DD
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
  gender: string;            // or literal type: "male" | "female" | "other"
}



export interface CreatePatientResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    patient_id: string;
  };
}

export type PatientListResponse = {
  success?: boolean;
  httpStatus?: number;
  message?: string;
  data?: {
    patients?: Patient[];
    pagination?: Pagination;
  };
};

export type Patient = {
  id?: string;
  uid?: string;
  name?: string;
  email?: string | null;
  owner_type?: string;
  owner_id?: string;
  tagged_as?: string | null;
  mobile?: string | null;
  age?: string;
  age_on_date?: string;
  dob?: string;
  gender?: string;
  more_details?: string;
  profile_image?: string;
  status?: string;
  created_by?: string;
  updated_by?: string | null;
  created_at?: string;
  updated_at?: string;
  time_zone?: string | null;

  address?: PatientAddress;

  contact_email?: string;
  contact_mobile?: string;
  is_registered?: string;
};

export type PatientAddress = {
  address?: string;
  lat?: string;
  lng?: string;
  postalCode?: string;

  line_1?: string;
  line_2?: string;
  country?: string;
  state_or_province?: string;
  district?: string;
  city?: string;
  village?: string;
  town?: string;
  land_mark?: string;
  instruction?: string;
};
export type AppointmentListResponse = {
  success?: boolean;
  httpStatus?: number;
  message?: string;
  data?: {
    appointments?: Appointment[];
    pagination?: Pagination;
  };
};

export type Appointment = {
  appointment_uid?: string;
  doctor_id?: string;
  patient_id?: string;
  date?: string;
  time?: string;
  duration?: string;
  status?: string;
  appointment_type?: string | null;
  patient_name?: string;
  doctor_name?: string;
  symptoms?: string;
};

// export type Pagination = {
//   pageNumber?: number;
//   pageSize?: number;
//   totalRecords?: number;
//   pageCount?: number;
// };


// export type Pagination = {
//   pageNumber?: number;
//   pageSize?: number;
//   totalRecords?: number;
//   pageCount?: number;
// };

export type AvailableSlotsResponse = {
  success?: boolean;
  httpStatus?: number;
  message?: string;
  data?: {
    date?: string;
    slots?: Slot[];
  };
};

export type Slot = {
  start?: string;
  end?: string;
};


export type AppointmentSymptomsResponse = {
  success?: boolean;
  httpStatus?: number;
  message?: string;
  data?: Symptom[];
};

export type Symptom = {
  id?: string;
  name?: string;
  description?: string;
  image?: string;
};

export type CreateAppointmentRequest = {
  doctor_id: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  duration: string;
  appointmentSymptoms: AppointmentSymptom[];
};

export type AppointmentSymptom = {
  symptom_id?: string;
  symptom_name?: string;
};


export type CreateAppointmentResponse = {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    appointment_id: string;
    symptoms_added: number;
  };
};
//new today 
export interface TestPackageRow {
  id: string;
  name: string;
  fee: string;
  gender: "Male" | "Female" | "Both";
  included: string;
  tests?: string[];
  panels?: string[];
}

export type TestPackagePayload = {
  name: string;
  fee: string;
  gender: "Male" | "Female" | "Both";
  included?: string;
  tests?: string[];
  panels?: string[];
};

export type TestPackageResponse = {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    package: TestPackageRow;
  };
};

export type TestPackageListResponse = {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    packages: TestPackageRow[];
  };
};

// Test Panels
export interface TestPanelRow {
  id: string;
  uid: string;
  order: number;
  name: string;
  category: string;
  tests: string[];
  ratelistEntries?: string;
  categoryId?: string;
  price?: string;
  hide_individual?: Record<string, string>;
  interpretation?: string;
  hideInterpretation?: boolean;
  hideMethod?: boolean;
}

export type TestPanelPayload = {
  name: string;
  category: string;
  tests: string[];
  order?: number;
  interpretation?: string;
  hideInterpretation?: boolean;
  hideMethod?: boolean;
};

export type TestPanelResponse = {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    panel: TestPanelRow;
  };
};

export type TestPanelListResponse = {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    panels: TestPanelRow[];
  };
};

export type ReorderPanelsPayload = {
  uid: string;
  after_uid: string;
};

export type ReorderPanelsResponse = {
  success: boolean;
  httpStatus: number;
  message: string;
};

// Test Categories
export interface TestCategoryRow {
  id: string;
  order: number;
  name: string;
}

export type TestCategoryPayload = {
  name: string;

};

export type TestCategoryResponse = {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    categoryUid: string;
  };
};

// export type TestCategoryListResponse = {
//   success: boolean;
//   httpStatus: number;
//   message: string;
//   data: {
//     categories: TestCategoryRow[];
//   };
// };

export type ReorderCategoriesPayload = {
  uid: string;
  after_uid: string;

};

export type ReorderCategoriesResponse = {
  success: boolean;
  httpStatus: number;
  message: string;
};


export interface TestCategory {
  id: string;
  uid: string;
  name: string;
  order: string;
  backup_name: string | null;
  status: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface TestCategoryPagination {
  page: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
}

export interface TestCategoryData {
  categorys: TestCategory[];
  pagination: TestCategoryPagination;
}

export interface TestCategoryListResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: TestCategoryData;
}






export type CreateUnitResponse = {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    unit_id: string;
  };
};

export type Unit = {
  id: string;
  uid: string;
  name: string;
  description: string;
  backup_name: string | null;
  status: string; // consider union: "active" | "inactive"
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string | null;
};


export type UnitsListResponse = {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    units: Unit[];
    pagination: Pagination;
  };
};


export type DeleteUnitResponse = {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    unit_id: string;
  };
};

export type TestChild = {
  order: string;
  name: string;
  unit_id: string;
  input_type: string;        // you can convert to union if needed
  default_result: string;
  group_by?: string;
  optional: boolean;
};

export type CreateTestPayload = {
  type: string;              // e.g. "multiple"
  name: string;
  short_name: string;
  category_id: string;
  unit_id?: string;
  input_type?: string;        // e.g. "numeric" (optional for multiple tests)
  default_result?: string;
  optional?: boolean;
  price: string;
  method: string;
  instrument: string;
  interpretation: string;
  notes: string;
  comments: string;
  format_options?: {
    always_bold?: boolean;
    print_line_after?: boolean;
  };
  children?: TestChild[];
};


export type LabTestParent = {
  uid: string;
  name: string;
  short_name: string;
  category_id: string;
  price: string;
  method: string;
  instrument: string;
  interpretation: string;
  notes: string;
  comments: string;
  order: number;
  type: string;          // e.g. "multiple"
  created_by: string;
};

export type LabTestChild = {
  uid: string;
  name: string;
  unit_id: string;
  input_type: string;    // e.g. "numeric"
  default_result: string;
  optional: boolean;
  parent_id: string;
  order: number;
  type: string;
  created_by: string;
};

export type CreateLabTestResponse = {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    parent_uid: string;
    parent: LabTestParent;
    children?: LabTestChild[];
  };
};


export interface DoctorSpeciality {
  speciality_id: string;
  doctor_id: string;
  status: string;
  speciality_name: string;
}

export interface DoctorSpecialitiesData {
  doctor_specialities: DoctorSpeciality[];
}

export interface DoctorSpecialitiesResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: DoctorSpecialitiesData;
}

// Single time range inside a slot
export interface TimeRange {
  start: string;
  end: string;
  wait_time: number;
  time_slot_interval: number;
}

// Slot item (one entry in the slots array)
export interface DoctorSlot {
  uid: string;
  time_ranges: TimeRange[];
  days: string; // Example: "Tuesday, Friday"
}

// Full API response
export interface DoctorSlotsResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    slots: DoctorSlot[];
  };
}

export interface PanelsListResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    data: PanelItem[];
    pagination: Pagination;
  };
}

export interface PanelItem {
  panel_id: string;
  name: string;
  order_no: string;
  price: string;
  category_id: string;
  hide_individual: Record<string, string>; // Because structure is dynamic
  status: string;
  created_at: string;
  category_name: string;
  tests: {
    count: number;
    list: TestItem[];
  };
}

export interface TestItem {
  uid: string;
  order: string;
  test_id: string;
  test_name: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
}




export interface LabTestsListResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    data: LabTestItem[];
    pagination: Pagination | null;
  };
}

export interface LabTestItem {
  name: string;
  uid: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
}


export interface CreatePanelPayload {
  name: string;
  category_id: string;
  price: number;
  interpretation: string;
  hide_individual: Record<string, string>; // dynamic keys
  tests: PanelTestItem[];
}

export interface UpdatePanelPayload extends CreatePanelPayload {
  remove_tests?: PanelTestItem[];
}

export interface PanelTestItem {
  test_id: string;
}



export interface PanelDetailsResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    panel: PanelDetails;
  };
}

export interface PanelDetails {
  panel_id: string;
  name: string;
  order_no: string;
  price: string;
  category_id: string;
  hide_individual: Record<string, string>; // dynamic keys
  interpretation: string;
  status: string;
  created_at: string;
  category_name: string;
  tests: PanelTestDetails[];
  tests_count: number;
}

export interface PanelTestDetails {
  uid: string;
  order: string;
  test_id: string;
  test_name: string;
}




export interface LabTest {
  id: string;
  uid: string;
  order: string;
  name: string;
  short_name: string;
  category_id: string;
  unit_id: string | null;
  input_type: string;
  default_result: string;
  method: string;
  instrument: string;
  interpretation: string;
  notes: string;
  comments: string;
  formating: string | null;
  price: string;
  optional: "0" | "1";
  parent_id: string | null;
  type: string;
  group_by: string;
  status: string;
  created_by: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  organization_id: string;
  central_account_id: string;
  center_id: string;
}



