import type {
  OrganizationAddPayloads,
  OrganizationLoginRequestPayload,
  OrganizationRegistrationPayload,
  OrganizationSuccessResponse,
  ResendOtpPayload,
  ResendOtpResponse,
  VerifyOtpPayload,
  VerifyOtpResponse,
  AccessToken,
  OrganizationAddInside,
  OrganizationAddInsideResponse,
  OrganizationListResponse,
  CenterRequestPayload,
  CreateCenterResponse,
  CenterListResponse,
  ExperienceResponse,
  QualificationResponse,
  SpecialityResponse,
  FileUploadResponse,
  ProviderDetails,
  ProviderListResponse,
  SwitchOrganizationResponse,
  // DoctorAvailabilityResponse, (unused)
  DoctorAvailabilityInput,
  DoctorAvailabilityCreateResponse,
  PaymentSettingsPayload,
  SyncSettingsResponse,
  CreateDoctorFeeResponse,
  DoctorCommissionPayload,
  FeeManagementResponse,
  DoctorAvailabilityRES,
  CreatePatientPayload,
  CreatePatientResponse,
  PatientListResponse,
  AppointmentListResponse,
  AvailableSlotsResponse,
  AppointmentSymptomsResponse,
  CreateAppointmentRequest,
  CreateAppointmentResponse,
  TestPackagePayload,
  TestPackageResponse,
  TestPackageListResponse,
  TestPanelPayload,
  TestPanelResponse,
  TestPanelListResponse,
  ReorderPanelsPayload,
  ReorderPanelsResponse,
  TestCategoryPayload,
  TestCategoryResponse,
  TestCategoryListResponse,
  ReorderCategoriesPayload,
  ReorderCategoriesResponse,
} from "./Types";
import apiAgent from "./apiAgents";

class Apis {
  async RegisterOrganization(
    payload: OrganizationRegistrationPayload
  ): Promise<OrganizationSuccessResponse> {
    const response = await apiAgent
      .path("/organizations/register")
      .method("POST")
      .json(payload)
      .execute();

    return response.data as OrganizationSuccessResponse;
  }

  async OrganizationOtpVerification(
    payload: VerifyOtpPayload
  ): Promise<VerifyOtpResponse> {
    const response = await apiAgent
      .path("/organizations/otp-verification")
      .method("POST")
      .json(payload)
      .execute();

    return response.data as VerifyOtpResponse;
  }

  async ResendOrganizationOtp(
    payload: ResendOtpPayload
  ): Promise<ResendOtpResponse> {
    const response = await apiAgent
      .path("/organizations/resent-otp")
      .method("POST")
      .json(payload)
      .execute();
    return response.data as ResendOtpResponse;
  }



  async AddOrganization(
    payload: OrganizationAddPayloads
  ): Promise<OrganizationSuccessResponse> {
    const response = await apiAgent
      .path("/organizations/onboarding")
      .method("POST")
      .json(payload)
      .execute();
    return response.data as OrganizationSuccessResponse;
  }

  async OrganizationLogin(
    payload: OrganizationLoginRequestPayload
  ): Promise<OrganizationSuccessResponse> {
    const response = await apiAgent
      .path("/organizations/login")
      .method("POST")
      .json(payload)
      .execute();
    return response.data as OrganizationSuccessResponse;
  }

  async OrganizationLoginOtpVerification(
    payload: VerifyOtpPayload
  ): Promise<AccessToken> {
    const response = await apiAgent
      .path("/organizations/login-otp-verification")
      .method("POST")
      .json(payload)
      .execute();

    return response.data as AccessToken;
  }
  async OrganizationLoginResendOtpVerification(
    payload: ResendOtpPayload
  ): Promise<ResendOtpResponse> {
    const response = await apiAgent
      .path("/organizations/resend-login-otp")
      .method("POST")
      .json(payload)
      .execute();

    return response.data as ResendOtpResponse;
  }


  async SwitchOrganizationcenter(
    payload: {
      organization_id?: string;
      center_id?: string;
    }
  ): Promise<SwitchOrganizationResponse> {
    const response = await apiAgent
      .path("/organizations/switch-organization-center")
      .method("POST")
      .json(payload)
      .execute();

    return response.data as SwitchOrganizationResponse;
  }

  async AddOrganizationFromInside(
    payload: OrganizationAddInside
  ): Promise<OrganizationAddInsideResponse> {
    const response = await apiAgent
      .path("/organizations")
      .method("POST")
      .json(payload)
      .execute();

    return response.data as OrganizationAddInsideResponse;
  }

  async GetOrganizationsList(
    payload?: {
      search?: string,
      country?: string,
      pageNumber?: number,
      pageSize?: number,
      status?: string,
      configuration?: string | string[]
    }
  ): Promise<OrganizationListResponse> {

    const queryPayload = payload
      ? {
        ...payload,
        configuration: Array.isArray(payload.configuration)
          ? payload.configuration.join(",")
          : payload.configuration,
      }
      : {};

    const response = await apiAgent
      .path("/organizations/list")
      .method("GET")
      .query(queryPayload)
      .execute();

    return response.data as OrganizationListResponse;
  }



  //add clinic
  async AddClinicFromInside(
    organization_id: string,
    payload: CenterRequestPayload
  ): Promise<CreateCenterResponse> {
    console.log("Adding clinic with payload:", organization_id);
    const response = await apiAgent
      .path(`/organizations/${organization_id}/centers`)
      .method("POST")
      .json(payload)
      .execute();

    return response.data as CreateCenterResponse;
  }

  async GetClinicsList(
    organization_id?: string,
    payload?: {
      type?: string;
      search?: string;
      pageNumber?: number;
      pageSize?: number;
      status?: string;
      configuration?: string | string[];
    }
  ): Promise<CenterListResponse> {
    const queryPayload = payload
      ? {
        ...payload,
        configuration: Array.isArray(payload.configuration)
          ? payload.configuration.join(",")
          : payload.configuration,
      }
      : {};
    const response = await apiAgent
      .path(`organizations/${organization_id}/centers`)
      .method("GET")
      .query(queryPayload)
      .execute();
    return response.data as CenterListResponse;
  }

  async GetExperience(): Promise<ExperienceResponse> {

    const response = await apiAgent
      .path("/doctor/master/experience")
      .method("GET")
      .execute();
    return response.data as ExperienceResponse;
  }

  async GetQualification(): Promise<QualificationResponse> {
    const response = await apiAgent
      .path("/doctor/master/qualification")
      .method("GET")
      .execute();
    return response.data as QualificationResponse;
  }

  async GetSpecialities(): Promise<SpecialityResponse> {
    const response = await apiAgent
      .path("/doctor/master/speciality")
      .method("GET")
      .execute();
    return response.data as SpecialityResponse;
  }

  async ImageUpload(payload: FormData): Promise<FileUploadResponse> {
    const response = await apiAgent
      .path("/file-upload")
      .method("POST")
      .form(payload)
      .execute();
    return response.data as FileUploadResponse
  }

  async AddProvider(
    organization_id: string,
    payload: ProviderDetails
  ): Promise<OrganizationSuccessResponse> {
    const response = await apiAgent
      .path(`/organizations/${organization_id}/doctors`)
      .method("POST")
      .json(payload)
      .execute();
    return response.data as OrganizationSuccessResponse;
  }



  async Logout(
    payload: {
      isLocalStorageClear: boolean
    }
  ): Promise<void> {
    await apiAgent
      .path("/logout")
      .method("POST")
      .json(payload)
      .execute();
  }

  async GetAllProviders(
    configuration: string,
    organization_id: string,
    center_id: string,
    search?: string,
    pageNumber?: number,
    pageSize?: number
  ): Promise<ProviderListResponse> {
    const response = await apiAgent
      .path(`/organizations/${organization_id}/centers/${center_id}/doctors`)
      .method("GET")
      .query({ search, pageNumber, pageSize })
      .json({ configuration })
      .execute();
    return response.data as ProviderListResponse;
  }

  async getOrganizationCenters(
    organization_id: string
  ): Promise<CenterListResponse> {
    const response = await apiAgent
      .path(`/organizations/${organization_id}/centers`)
      .method("GET")
      .execute();
    return response.data as CenterListResponse;
  }



  /**
   * Fetch availabilities for one or multiple providers.
   * provider_idOrUids can be:
   *  - a single provider id string (e.g. "dEmpvHK5")
   *  - an array of provider ids (e.g. ["dEmpvHK5","XvQ7ufZV"]) — will be joined and encoded
   *  - the string "all" to fetch all providers
   */
  async GetProviderAvailabilities(
    organization_id: string,
    center_id: string,
    provider_idOrUids: string | string[]
  ): Promise<DoctorAvailabilityRES> {
    // If caller passed an array of uids, join with comma and encode once.
    const providerPath = Array.isArray(provider_idOrUids)
      ? encodeURIComponent(provider_idOrUids.join(","))
      : encodeURIComponent(provider_idOrUids);

    const response = await apiAgent
      .path(`/organizations/${organization_id}/centers/${center_id}/doctors/${providerPath}/availabilities`)
      .method("GET")
      .execute();
    return response.data as DoctorAvailabilityRES;
  }



  async AddDoctorAvailability(
    organization_id: string,
    center_id: string,
    provider_id: string,
    payload: DoctorAvailabilityInput
  ): Promise<DoctorAvailabilityCreateResponse> {
    const response = await apiAgent
      .path(`/organizations/${organization_id}/centers/${center_id}/doctors/${provider_id}/availabilities`)
      .method("POST")
      .json(payload)
      .execute();
    return response.data as DoctorAvailabilityCreateResponse;
  }

  // async SavePaymentSettings(payload: {
  //   central_account_id: string;
  //   settings: Array<{ key: string; value: boolean | string }>;
  // }): Promise<{ success: boolean; message: string }> {
  //   const response = await apiAgent
  //     .path("/account-settings/payment")
  //     .method("POST")
  //     .json(payload)
  //     .execute();
  //   return response.data as { success: boolean; message: string };
  // }

  async AddPaymentSettings(
    center_id: string,
    organization_id: string,
    payload: PaymentSettingsPayload
  ): Promise<SyncSettingsResponse> {
    const response = await apiAgent
      .path(`/organizations/${organization_id}/centers/${center_id}/settings`)
      .method("POST")
      .json(payload)
      .execute();
    return response.data as SyncSettingsResponse;
  }

  async GetPaymentSettings(
    center_id: string,
    organization_id: string,
    forParam: string
  ): Promise<PaymentSettingsPayload> {
    const response = await apiAgent
      .path(`/organizations/${organization_id}/centers/${center_id}/settings`)
      .method("GET")
      .query({ for: forParam })
      .execute();

    return response.data as PaymentSettingsPayload;
  }

  async AddFee(
    organization_id: string,
    center_id: string,
    payload: DoctorCommissionPayload
  ): Promise<CreateDoctorFeeResponse> {
    const response = await apiAgent
      .path(`/organizations/${organization_id}/centers/${center_id}/doctors-fee`)
      .method("POST")
      .json(payload)
      .execute();
    return response.data as CreateDoctorFeeResponse;
  }
  async GetFees(
    organization_id: string,
    center_id: string,
    pageSize?: number,
    pageNumber?: number
  ): Promise<FeeManagementResponse> {
    const response = await apiAgent
      .path(`/organizations/${organization_id}/centers/${center_id}/doctors-fee`)
      .method("GET")
      .query({ pageSize, pageNumber })
      .execute();
    return response.data as FeeManagementResponse;
  }


  async AddPatient(
    organization_id: string,
    center_id: string,
    payload: CreatePatientPayload
  ): Promise<CreatePatientResponse> {
    const response = await apiAgent
      .path(`/organizations/${organization_id}/centers/${center_id}/patients`)
      .method("POST")
      .json(payload)
      .execute();
    return response.data as CreatePatientResponse;
  }

  async GetPatients(
    organization_id: string,
    center_id: string,
    search?: string,
    pageNumber?: number,
    pageSize?: number,
    fields?: string[]
  ): Promise<PatientListResponse> {
    const fieldsParam = fields && fields.length > 0 ? fields.join(",") : [];
    const response = await apiAgent
      .path(`/organizations/${organization_id}/centers/${center_id}/patients`)
      .method("GET")
      .query({ search, pageNumber, pageSize, fields: fieldsParam })
      .execute();
    return response.data as PatientListResponse;
  }

  //{{clinicPeBaseUrl}}/organizations/dEmpvHK5/centers/Chkf3087/appointments?search &configuration&dates=[2025-10-13]

  async GetCenterAppointmentList(
    organization_id: string,
    center_id: string,
    dates?: string
  ): Promise<AppointmentListResponse> {

    const response = await apiAgent
      .path(`/organizations/${organization_id}/centers/${center_id}/appointments`)
      .method("GET")
      .query({


        dates
      })
      .execute();

    return response.data as AppointmentListResponse;


  }

  //{{clinicPeBaseUrl}}/organizations/dEmpvHK5/centers/Chkf3087/symptoms

  async GetSymptomsList(
    organization_id: string,
    center_id: string
  ): Promise<AppointmentListResponse> {
    const response = await apiAgent
      .path(`/organizations/${organization_id}/centers/${center_id}/symptoms`)
      .method("GET")
      .execute();
    return response.data as AppointmentListResponse;
  }



  async GetSlots(
    organization_id: string,
    center_id: string,
    provider_id: string,
    targetDate?: string
  ): Promise<AvailableSlotsResponse> {
    const response = await apiAgent
      .path(`/organizations/${organization_id}/centers/${center_id}/doctors/${provider_id}/slots`)
      .method("GET")
      .query({
        targetDate
      })
      .execute();

    return response.data as AvailableSlotsResponse;


  }


  async GetSymptomsListNEW(
    organization_id: string,
    center_id: string
  ): Promise<AppointmentSymptomsResponse> {
    const response = await apiAgent
      .path(`/organizations/${organization_id}/centers/${center_id}/symptoms`)
      .method("GET")
      .execute();

    return response.data as AppointmentSymptomsResponse;
  }

  async CreateAppointment(
    organization_id: string,
    center_id: string,
    payload: CreateAppointmentRequest
  ): Promise<CreateAppointmentResponse> {
    const response = await apiAgent
      .path(`/organizations/${organization_id}/centers/${center_id}/appointments`)
      .method("POST")
      .json(payload)
      .execute();
    return response.data as CreateAppointmentResponse;
  }

  // Test Packages APIs
  async GetTestPackages(): Promise<TestPackageListResponse> {
    const response = await apiAgent.path(`/test-packages`)
      .method("GET")
      .execute();
    return response.data as TestPackageListResponse;
  }

  async AddTestPackage(payload: TestPackagePayload): Promise<TestPackageResponse> {
    const response = await apiAgent.path(`/test-packages`)
      .method("POST")
      .json(payload)
      .execute();
    return response.data as TestPackageResponse;
  }

  async UpdateTestPackage(id: string, payload: TestPackagePayload): Promise<TestPackageResponse> {
    const response = await apiAgent
    .path(`/test-packages/${id}`)
    .method("PATCH")
    .json(payload)
    .execute();
    return response.data as TestPackageResponse;
  }

  async DeleteTestPackage(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiAgent.path(`/test-packages/${id}`).method("DELETE").execute();
    return response.data as { success: boolean; message: string };
  }

  // Test Panels APIs
  async GetTestPanels(): Promise<TestPanelListResponse> {
    const response = await apiAgent.path(`/test-panels`).method("GET").execute();
    return response.data as TestPanelListResponse;
  }

  async AddTestPanel(payload: TestPanelPayload): Promise<TestPanelResponse> {
    const response = await apiAgent.path(`/test-panels`).method("POST").json(payload).execute();
    return response.data as TestPanelResponse;
  }

  async UpdateTestPanel(id: string, payload: TestPanelPayload): Promise<TestPanelResponse> {
    const response = await apiAgent.path(`/test-panels/${id}`).method("PUT").json(payload).execute();
    return response.data as TestPanelResponse;
  }

  async DeleteTestPanel(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiAgent.path(`/test-panels/${id}`).method("DELETE").execute();
    return response.data as { success: boolean; message: string };
  }

  async ReorderTestPanels(payload: ReorderPanelsPayload): Promise<ReorderPanelsResponse> {
    const response = await apiAgent.path(`/test-panels/reorder`).method("POST").json(payload).execute();
    return response.data as ReorderPanelsResponse;
  }

















  // Test Categories APIs
  async GetTestCategories(
    search?: string,
    pageNumber?: number,
    pageSize?: number
  ): Promise<TestCategoryListResponse> {
    const response = await apiAgent
      .path(`diagnostics/categories`)
      .method("GET")
      .query({ search, pageNumber, pageSize })
      .execute();
    return response.data as TestCategoryListResponse;
  }

  async AddTestCategory(payload: TestCategoryPayload): Promise<TestCategoryResponse> {
    const response = await apiAgent
      .path(`/diagnostics/categories`)
      .method("POST")
      .json(payload)
      .execute();
    return response.data as TestCategoryResponse;
  }

  async UpdateTestCategory(id: string, payload: TestCategoryPayload): Promise<TestCategoryResponse> {
    const response = await apiAgent
      .path(`/diagnostics/categories/${id}`)
      .method("PATCH")
      .json(payload)
      .execute();
    return response.data as TestCategoryResponse;
  }

  async DeleteTestCategory(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiAgent
      .path(`/test-categories/${id}`)
      .method("DELETE")
      .execute();
    return response.data as { success: boolean; message: string };
  }

  async ReorderTestCategories(payload: ReorderCategoriesPayload): Promise<ReorderCategoriesResponse> {
    const response = await apiAgent
      .path(`/test-categories/reorder`)
      .method("POST")
      .json(payload)
      .execute();
    return response.data as ReorderCategoriesResponse;
  }
}
const apis = new Apis();
export default apis;