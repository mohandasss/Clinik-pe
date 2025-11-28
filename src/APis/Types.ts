export type GlobalAPIResponse = {
  success: boolean;
  httpStatus: number;
  message: string;
  data: any;

}


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
};

export type VerifyOtpResponse = {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    verified: boolean;
  };
};

export type ResendOtpPayload = {
  request_id: string;
  device_type: string;
  device_id: string;
  frontend_type: string;
};

export type ResendOtpResponse = {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    otp_id: string;
  };
};

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
  device_type: string;
  device_id: string;
  frontend_type: string;
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
};

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
  address: PatientAddress | null;
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

export interface TestImageUploadResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    image_id: string;
  };
}

export interface UploadedTestImage {
  type: "icon" | "image";
  target_type: string;
  target_id: string;
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
  qualifications: QualificationItem[];
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
      experience: any[]; // Same here
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
  duration: string; // minutes as string
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
  schedule_id?: string;
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
  startTime: string; // "10:00 AM"
  endTime: string; // "05:00 PM"
  waitTime: string; // "0"
  slotInterval: string; // "30"
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
  dob: string; // format: YYYY-MM-DD
  email: string;
  mobile: string;
  age: number;
  age_on_date: string; // format: YYYY-MM-DD
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
  gender: string; // or literal type: "male" | "female" | "other"
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
  payment?: AppointmentPayment;
};

export type AppointmentSymptom = {
  symptom_id?: string;
  symptom_name?: string;
};

export type AppointmentPayment = {
  amount: number;
  as: "advance" | "paid";
  purpose: "appointment";
  source: "manual";
  mode: "cash" | "upi";
  note?: string;
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
  uid?: string; // API uses uid
  id?: string; // keep for backwards compat
  name: string;
  price?: string | number; // API returns price
  fee?: string; // keep for backwards compat
  bill_only_for_gender?: "male" | "female" | "both"; // API key
  gender?: "Male" | "Female" | "Both"; // keep for backwards compat
  included?: string;
  status?: string;
  tests?: { test_id: string; test_name?: string }[]; // object array from API
  panels?: { panel_id: string; panel_name?: string }[]; // object array from API
}

export type TestPackagePayload = {
  name: string;
  description?: string;
  price: number | string; // price instead of fee
  bill_only_for_gender: "male" | "female" | "both"; // exact key requested
  data?: string;
  included?: string;
  // Each test/panel should be an object per user request
  tests?: { test_id: string }[];
  panels?: { panel_id: string }[];
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
    pagination?: {
      pageNumber: number;
      pageSize: number;
      totalPages: number;
      totalRecords: number;
    };
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

// Roles
export interface Role {
  uid: string;
  name: string;
  permissions?: string[];
  status?: string; // active | inactive
  access?: {
    read: "none" | "allow" | "deny" | "mixed";
    write: "none" | "allow" | "deny" | "mixed";
  }[];
}

export type RolesListResponse = {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    roles: Role[];
    pagination?: Pagination;
  };
};

export type TestChild = {
  order: string;
  name: string;
  unit_id: string;
  input_type: string; // you can convert to union if needed
  default_result: string;
  group_by?: string;
  optional: boolean;
};

export type CreateTestPayload = {
  type: string; // e.g. "multiple"
  name: string;
  short_name: string;
  category_id: string;
  unit_id?: string;
  input_type?: string; // e.g. "numeric" (optional for multiple tests)
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
  type: string; // e.g. "multiple"
  created_by: string;
};

export type LabTestChild = {
  uid: string;
  name: string;
  unit_id: string;
  input_type: string; // e.g. "numeric"
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
  price: number;
  bill_only_for_gender: string; // adjust if needed
  tests: {
    test_id: string;
  }[];
  panels: {
    panel_id: string;
  }[];
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
  department_id: string;
  type: string;
  group_by: string;
  status: string;
  created_by: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string | null;
  organization_id: string;
  central_account_id: string;
  center_id: string;
  tags: string | null;
  display_name: string | null;
  short_about: string | null;
  long_about: string | null;
  sample_type: string | null;
  gender: string | null;
  age_range: string | null;
  images: string | null;
  preparation: string | null;
  mrp: string | null;
  faq: string | null;
  home_collection_possible: "0" | "1";
  home_collection_fee: string | null;
  machine_based: string | null;
}

export type TestPackageUpdatePayload = {
  name: string;
  price: number;
  bill_only_for_gender: string;
  included?: string;

  tests: { test_id: string }[];
  panels: { panel_id: string }[];

  remove_tests?: string[];
  remove_panels?: string[];
};

export interface FeeManagementResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: FeeManagementData;
}

export interface FeeManagementData {
  tests: FeeTestItem[];
  pagination: Pagination; // <-- use existing one
}

export interface FeeTestItem {
  uid: string;
  name: string;
  interpretation: string;
}

export interface LabInvestigationsResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: LabInvestigationsData;
}

export interface LabInvestigationsData {
  lab_investigations: LabInvestigationItem[];
}

export interface LabInvestigationItem {
  uid: string;
  name: string | null;
  short_name: string | null;
  amount: number;
  type: "panel" | "test" | "package";
  investigation: "lab";
}

export type InvoiceItem = {
  type: "panel" | "test";
  sub_type: string;
  item_id: string;
  amount: number;
};

export type InvoicePayload = {
  patient_id: string;
  total_amount: number;
  discount_unit: "percentage" | "flat";
  discount_value: number;
  referred_by_doctor_id: string | null;
  referrer_details: string | null;
  payable_amount: number;
  items: InvoiceItem[];
  payment: {
    amount: number;
    as: "full" | "advance";
    purpose: string;
    source: string;
    mode: string;
    note: string;
  };
};

export type BookingResponse = {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    booking_uid: string;
  };
};

export interface BookingItem {
  booking_uid: string;
  patient_id: string;
  total_amount: string; // "1450.00"
  discount_unit: string; // "percentage" | "flat"
  discount_value: string; // "10"
  payable_amount: string; // "1305.00"
  created_at: string | null; // can be null
  patient_uid: string;
  patient_name: string;
  patient_mobile: string | null;
  patient_age: string;
  patient_gender: string;
  doctor_uid: string;
  doctor_name: string;
}

export interface Pagination {
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface BookingsListResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    bookings: BookingItem[];
    pagination: Pagination;
  };
}

export interface Fee {
  id: string;
  uid: string;
  central_account_id: string;
  organization_id: string;
  center_id: string;
  doctor_id: string;
  speciality_id: string;
  schedule_id: string;
  appointment_type: "in_clinic" | "video" | string; // adjust if needed
  fee: string; // or number if your API returns number
  commission_type: "%" | "flat" | string;
  commission: string; // or number
  created_at: string; // ISO datetime string
  created_by: string;
  updated_at: string | null;
  updated_by: string | null;
  cron_expression: string;
  time_range: string; // raw string from API
  details: string;
}

export interface FeeManagementResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  // @ts-expect-error: allow data
  data: {
    fees: Fee[];
  };
}

export interface SidebarMenuResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: SidebarMenuItem[];
}

export interface SidebarMenuItem {
  id: string;
  title: string;
  path: string;
  icon: string;
  dedicated?: boolean;
  children: SidebarMenuItem[];
}

export interface CreateRolePermissionResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    role_uid: string;
  };
}




export interface QrCodeApiResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    qr_code: QrCode;
  };
}

export interface QrCode {
  qr_image_path: string;
  qr_image_url: string;
  booking_url: string | null;
}

export interface OtherTestPanelRow {
  id: string;
  uid: string;
  order: number;
  name: string;
  description: string;
  price: number | string;
  status: "active" | "inactive" | string;
  data: string;
  tests: string[];
  hide_individual?: Record<string, string>;
}

// Display type for Radiology Test Panels (converted from OtherPanelItem)
export interface RadiologyTestPanel {
  id: string;
  uid: string;
  order: number;
  name: string;
  description: string;
  price: string | number;
  status: string;
  data: string;
  tests: string[];
}

export interface CreateOtherTestPanelPayload {
  name: string;
  description: string;
  price: number;
  status: "active" | "inactive" | string;
  data: string;
  tests: Array<{ test_id: string }>;
}

export interface UpdateOtherTestPanelPayload extends CreateOtherTestPanelPayload {
  remove_tests?: Array<{ test_id: string }>;
}

// Other Test Package Types (Radiology Package)
export interface OtherTestPackageRow {
  id?: string;
  uid?: string;
  name: string;
  description?: string;
  price: number | string;
  status: "male" | "female" | "both" | "active" | "inactive";
  data?: string;
  tests?: Array<{ test_id: string; name?: string }> | string[];
  panels?: Array<{ panel_id: string; name?: string }> | string[];
}

// Doctor Login Types
export type DoctorLoginPayload = {
  email?: string;
  mobile?: string;
  user_id?: string;
  password?: string;
  device_type: string;
  device_id: string;
  frontend_type: string;
};

export interface DocLoginResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: DocLoginData;
}

export interface DocLoginData {
  organization_id: string | null;
  organization_name: string | null;
  user_id: string;
  center_name: string | null;
  center_id: string | null;
  central_account_id: string;
  user_type: "doctor" | "admin" | "receptionist" | "staff" | string; // expand as needed
  name: string;
  email: string | null;
  mobile: string | null;
  time_zone: string;
  currency: string | null;
  country: string | null;
  access: unknown | null; // change to correct structure if you know it
  image: string | null;
}


export type DoctorVerifyOtpPayload = {
  request_id: string;
  otp_id: string;
  otp: string;
  device_type: string;
  device_id: string;
  frontend_type: string;
};

export type DoctorVerifyOtpResponse = {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    verified: boolean;
    loggedUserDetails: {
      doctor_id: string;
      organization_id: string | null;
      organization_name: string | null;
      user_id: string;
      center_name: string | null;
      center_id: string | null;
      central_account_id: string | null;
      user_type: string;
      name: string;
      email: string | null;
      mobile: string | null;
      time_zone: string;
      currency: string | null;
      country: string | null;
      access: string | null;
      image: string | null;
    };
  };
};

// Doctor Appointments Types
export type DoctorAppointment = {
  uid: string;
  doctor_id: string;
  patient_id: string;
  date: string;
  time: string;
  duration: string;
  status: string;
  appointment_type: string | null;
  appointment_status?: string;
  patient_name: string;
  patient_image?: string;
  doctor_name: string;
  symptoms: string | null;
};

export type DoctorAppointmentListResponse = {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    appointments: DoctorAppointment[];
    pagination?: {
      pageNumber: number;
      pageSize: number;
      totalRecords: number;
      pageCount: number;
    };
    filter?: Array<{
      from_date: string;
      to_date: string;
    }>;
  };
};


export interface Medicine {
  name: string;
  saltQuantity: string;
  type: string;
}

export interface MedicineSidebarResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: Medicine[];
}
export interface AppointmentResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    appointments: AppointmentDoc[];
  };
}

export interface AppointmentDoc {
  uid: string;
  doctor_id: string;
  patient_id: string;
  date: string;      // ISO date string
  time: string;      // HH:mm:ss
  duration: string;  // could be number, but API sends string
  status: string;
  appointment_type: string | null;
  appointment_status: string;
  patient_name: string;
  doctor_name: string;
  symptoms: string;
}
export interface VitalItem {
  id: string;
  uid: string;
  key: string;
  name: string;
  lower_limit: string;
  higher_limit: string;
  unit: string;
  input: string | null;
  status: string;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}



export interface VitalListData {
  vital: VitalItem[];
}

export interface VitalListResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: VitalListData;
}

export interface PrescriptionSaveData {
  prescription_uid: string;
  pdf_url: string;
}


export type CreatePrescriptionPayload = {
  doctor_id: string;
  patient_id: string;
  info: string;
  notes: string;
  symptoms: string;
  condition: string;
  lab_test_id: string[];
  medicine: {
    medicineName: string;
    saltQuantity: string;
    medicinetype: string;
    duration: string;
    dosage: string;
    instruction: string;
  }[];
  vitals: Record<string, string>;
  appointment_id: string;
  clinic_id: string;
};

export type CreatePrescriptionResponse = {
  success: boolean;
  httpStatus: number;
  message: string;
  data: PrescriptionSaveData;
};
export interface LabItem {
  uid: string;
  name: string;
}

export interface LabResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: LabItem[];
}


export interface Department {
  id: string;
  uid: string;
  central_account_id: string | null;
  organization_id: string | null;
  center_id: string | null;
  name: string;
  slug: string;
  status: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}


export interface DepartmentListResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    departments: Department[];
    pagination: Pagination;
  };
}


//

export interface TestItem {
  id: string;
  uid: string;
  name: string;
  description: string;
  price: string;
  status: string;
  data: string;
  department_id: string;
  category_id: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  central_account_id: string;
  organization_id: string;
  center_id: string;
}

export interface Pagination {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
}

export interface TestListData {
  tests: TestItem[];
  pagination: Pagination;
}

export interface TestListResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: TestListData;
}


export interface TestPayload {
  name: string;
  description: string;
  price: string;
  data: string;
  category_id: string;
}




export interface CategoryItem {
  id: string;
  uid: string;
  central_account_id: string | null;
  organization_id: string | null;
  center_id: string | null;
  name: string;
  department_id: string;
  status: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}

export interface Pagination {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
}

export interface CategoryListData {
  categorys: CategoryItem[]; // keeping same key as API
  pagination: Pagination;
}

export interface CategoryListResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: CategoryListData;
}


//OTHER TEST PANEL TYPES
export interface CreateOtherPanelPayload {
  name: string;
  description: string;
  price: number;
  data: string;
  status: "active" | "inactive" | string; // adjust if status is fixed
  tests: {
    test_id: string;
  }[];
}


export interface OtherPanelsResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: OtherPanelsData;
}

export interface OtherPanelsData {
  panels: OtherPanelItem[];
  pagination: Pagination;
}

export interface OtherPanelItem {
  id: string;
  uid: string;
  panel_id?: string;
  order: number;
  name: string;
  description: string;
  price: string | number;
  status: string;
  data: string;
  tests: Array<{ test_id: string; test_name: string }> | string[];
  hide_individual?: Record<string, string>;
  created_at?: string;
}


export interface OtherPanelDetailsResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    panel: Panel;
  };
}

export interface Panel {
  panel_id: string;
  name: string;
  description: string;
  price: string;              // API gives price as string
  department_id: string;
  status: string;
  created_at: string;
  department_name: string;
  tests: PanelTest[];
  tests_count: number;
}

export interface PanelTest {
  uid: string;
  test_id: string;
  test_name: string;
}




//dashbaord data 
// export interface ReportRequest { //parent ok
//   success: boolean;
//   httpStatus: number;
//   message: string;
//   data: ReportRequestData;
// }

export interface ReportRequestData {
  hierarchy: Hierarchy;
  items: ReportRequestItem[];
}

export interface Hierarchy {
  central_account_id: string;
  organization_id: string;
  center_id: string;
}

// Dashboard API Types
export interface DashboardRequestPayload {
  hierarchy: DashboardHierarchy;
  items: DashboardRequestItem[];
}

export interface DashboardHierarchy {
  central_account_id: string; // mandatory
  organization_id?: string | string[] | "all"; // optional: single id, array of ids, or "all"
  center_id?: string | string[] | "all"; // optional: single id, array of ids, or "all"
}

export interface DashboardRequestItem {
  topics: DashboardTopic;
  date_range: DateRange;
  period: Period;
  criteria?: DashboardCriteria;
}

export type DashboardTopic =
  | "appointment"
  | "appointments"
  | "provider"
  | "providers"
  | "revenue"
  | "patient"
  | "patients"
  | "department"
  | "category"
  | "test"
  | "panel"
  | "package"
  | "users"
  | "center"
  | "business";

export interface DateRange {
  from: string; // format: YYYY-MM-DD
  to: string; // format: YYYY-MM-DD
}

export interface Period {
  unit: "day" | "hour" | "week" | "month" | "year";
  value: number;
}

export interface DashboardCriteria {
  status?: DashboardStatus;
  mode?: RevenueMode;
  [key: string]: any; // Allow additional dynamic criteria
}

export interface DashboardStatus {
  active?: boolean;
  inactive?: boolean;
  cancelled?: boolean;
  rescheduled?: boolean;
}

export interface RevenueMode {
  cash?: boolean;
  online?: boolean;
}

// Dashboard Response Types
export interface DashboardResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: DashboardResponseData;
}

export interface DashboardResponseData {
  items: DashboardResponseItem[];
}

export interface DashboardResponseItem {
  topics: DashboardTopic;
  date_range: DateRange;
  period: Period;
  data: DashboardDataBlock[];
}

export interface DashboardDataBlock {
  value: number;
  date_range: DateRange;
  criteria?: DashboardCriteria;
}

// Legacy Report Types (keeping for backward compatibility)
export interface ReportRequestItem {
  topics: string;
  date_range: DateRange;
  period: Period;
  criteria: Criteria;
}

export interface Criteria {
  status: ReportStatus;
}

export interface ReportStatus {
  active: boolean;
  inactive: boolean;
  cancelled: boolean;
  rescheduled: boolean;
}

export interface ReportResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: ReportResponseData;
}

export interface ReportResponseData {
  items: ReportResponseItem[];
}

export interface ReportResponseItem {
  topics: string;
  date_range: DateRange;
  period: Period;
  data: ReportDataBlock[];
}

export interface ReportDataBlock {
  value: number;
  date_range: DateRange;
  criteria: Criteria;
}




export interface PackageTest {
  test_id: string;
  test_name: string;
}

export interface PackagePanel {
  panel_id: string;
  panel_name: string;
}

export interface PackageItem {
  uid: string;
  name: string;
  description: string;
  price: string;            // API sends price as string
  status: "active" | "inactive";
  data: string | null;
  department_uid: string;
  department_name: string;
  tests: PackageTest[];
  panels: PackagePanel[];
}

export interface Pagination {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
}

export interface PackagesData {
  packages: PackageItem[];
  pagination: Pagination;
}

export interface PackagesListResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: PackagesData;
}

// Package Details Types
export interface PackageDetailsData {
  package: {
    uid: string;
    name: string;
    description: string;
    price: string;
    status: string;
    data: string;
    department_uid: string;
    department_name: string;
    tests: Array<{
      test_id: string;
      test_name: string;
    }>;
    panels: Array<{
      panel_id: string;
      panel_name: string;
    }>;
  };
}

export interface PackageDetailsResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: PackageDetailsData;
}

// Test Availability Types
export interface TestAvailabilityWorkingHours {
  monday: { enabled: boolean; start: string; end: string };
  tuesday: { enabled: boolean; start: string; end: string };
  wednesday: { enabled: boolean; start: string; end: string };
  thursday: { enabled: boolean; start: string; end: string };
  friday: { enabled: boolean; start: string; end: string };
  saturday: { enabled: boolean; start: string; end: string };
  sunday: { enabled: boolean; start: string; end: string };
}

export interface TestAvailabilityItem {
  id: string;
  uid: string;
  department_id: string;
  department_name: string;
  category_id: string;
  category_name: string;
  item_type: 'test' | 'panel' | 'package' | 'special_package';
  item_id: string;
  item_name: string;
  purpose: 'test' | 'home_collection';
  principal_type: 'home_collection_agent' | 'technician' | 'machine';
  principal_id: string;
  principal_name: string;
  capacity: number;
  period_value: number;
  period_unit: 'day' | 'week' | 'month' | 'year';
  slot_duration: number;
  start_time: string;
  end_time: string;
  is_24x7: boolean;
  week_days: string[];
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface TestAvailabilityListResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    availabilities: TestAvailabilityItem[];
    pagination: Pagination;
  };
}

export interface TestAvailabilityPayload {
  department_id: string;
  category_id: string;
  item_type: 'test' | 'panel' | 'package' | 'special_package';
  item_id: string;
  purpose: 'test' | 'home_collection';
  principal_type: 'home_collection_agent' | 'technician' | 'machine';
  principal_id: string;
  capacity: number;
  period_value: number;
  period_unit: 'day' | 'week' | 'month' | 'year';
  slot_duration: number;
  start_time: string;
  end_time: string;
  is_24x7: boolean;
  week_days: string[];
}

export interface TestAvailabilityResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    availability_id: string;
  };
}
