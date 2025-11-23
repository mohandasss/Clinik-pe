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
  ReorderPanelsPayload,
  ReorderPanelsResponse,
  TestCategoryPayload,
  TestCategoryResponse,
  TestCategoryListResponse,
  ReorderCategoriesPayload,
  ReorderCategoriesResponse,
  CreateUnitResponse,
  UnitsListResponse,
  DeleteUnitResponse,
  CreateTestPayload,
  CreateLabTestResponse,
  DoctorSpecialitiesResponse,
  DoctorSlotsResponse,
  PanelsListResponse,
  LabTestsListResponse,
  CreatePanelPayload,
  UpdatePanelPayload,
  PanelDetailsResponse,
  LabTest,
  TestPackageUpdatePayload,
  LabInvestigationsResponse,
  InvoicePayload,
  BookingResponse,
  BookingsListResponse,
  SidebarMenuResponse,
  CreateRolePermissionResponse,
  QrCodeApiResponse,
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

  // Roles


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



  async GetDoctorSpecalities(
    organization_id: string,
    center_id: string,
    provider_id: string

  ): Promise<DoctorSpecialitiesResponse> {
    const response = await apiAgent
      .path(`/organizations/${organization_id}/centers/${center_id}/doctors/${provider_id}/specialities`)
      .method("GET")
      .execute();

    return response.data as DoctorSpecialitiesResponse;
  }

  async GetDoctorAvailabilities(
    organization_id: string,
    center_id: string,
    provider_id: string,
    speciality_id?: string
  ): Promise<DoctorSlotsResponse> {
    const response = await apiAgent
      .path(`/organizations/${organization_id}/centers/${center_id}/doctors/${provider_id}/slots-list`)
      .method("GET")
      .query({ speciality_id })
      .execute();

    return response.data as DoctorSlotsResponse;
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







  async GetTestPackages(
    search: string,
    pageNumber: number,
    pageSize: number,
    organization_id: string, center_id: string): Promise<TestPackageListResponse> {
    const response = await apiAgent
      .path(`organizations/${organization_id}/centers/${center_id}/diagnostics/packages`)
      .method("GET")
      .query({ search, pageNumber, pageSize })
      .execute();
    return response.data as TestPackageListResponse;
  }








  async AddTestPackage(organization_id: string, center_id: string, payload: TestPackagePayload): Promise<TestPackageResponse> {
    const response = await apiAgent
      .path(`organizations/${organization_id}/centers/${center_id}/diagnostics/packages`)
      .method("POST")
      .json(payload)
      .execute();
    return response.data as TestPackageResponse;
  }










  async UpdateTestPackage(
    organization_id: string,
    center_id: string,
    id: string, payload: TestPackageUpdatePayload): Promise<TestPackageResponse> {
    const response = await apiAgent
      .path(`organizations/${organization_id}/centers/${center_id}/diagnostics/packages/${id}`)
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
  async GetTestPanels(pageNumber: number, pageSize: number, organization_id: string, center_id: string, search: string): Promise<PanelsListResponse> {
    const response = await apiAgent
      .path(`organizations/${organization_id}/centers/${center_id}/diagnostics/panels`)
      .method("GET")
      .query({ search, pageNumber, pageSize })
      .execute();
    return response.data as PanelsListResponse;
  }

  //working
  async AddTestPanels(
    payload: CreatePanelPayload,
    organization_id: string, center_id: string): Promise<PanelsListResponse> {
    const response = await apiAgent
      .path(`organizations/${organization_id}/centers/${center_id}/diagnostics/panels`)
      .method("POST")
      .json(payload)
      .execute();
    return response.data as PanelsListResponse;
  }

  async UpdateTestPanels(
    payload: UpdatePanelPayload,
    organization_id: string, center_id: string, panel_id: string): Promise<PanelsListResponse> {
    const response = await apiAgent
      .path(`organizations/${organization_id}/centers/${center_id}/diagnostics/panels/${panel_id}`)
      .method("PATCH")
      .json(payload)
      .execute();
    return response.data as PanelsListResponse;
  }


  async GetAllTests(
    required_fields: string[],
    organization_id: string,
    center_id: string
  ): Promise<LabTestsListResponse> {

    const requiredFieldsParam =
      required_fields?.length ? required_fields.join(",") : "";

    const response = await apiAgent
      .path(`organizations/${organization_id}/centers/${center_id}/diagnostics/lab/test`)
      .method("GET")
      .query({
        required_fields: requiredFieldsParam // <-- correct param key
      })
      .execute();

    return response.data as LabTestsListResponse;
  }


  async GetTestpanelById(
    organization_id: string,
    center_id: string,
    panel_id: string
  ): Promise<PanelDetailsResponse> {

    const response = await apiAgent
      .path(`organizations/${organization_id}/centers/${center_id}/diagnostics/panels/${panel_id}`)
      .method("GET")
      .execute();
    return response.data as PanelDetailsResponse;
  }



  //not needed for now
  // async DeleteTestPanel(
  //   organization_id: string,
  //   center_id: string,
  //   id: string): Promise<{ success: boolean; message: string }> {
  //   const response = await apiAgent.path(`/test-panels/${id}`).method("DELETE").execute();
  //   return response.data as { success: boolean; message: string };
  // }


  async ReorderTestPanelsDetails(
    organization_id: string,
    center_id: string,
    panel_id: string,
    payload: ReorderPanelsPayload): Promise<ReorderPanelsResponse> {
    const response = await apiAgent
      .path(`organizations/${organization_id}/centers/${center_id}/diagnostics/panels/${panel_id}/tests/order-sequencing`)
      .method("PATCH")
      .json(payload)
      .execute();
    return response.data as ReorderPanelsResponse;
  }






  async AddTestPanel(payload: TestPanelPayload): Promise<TestPanelResponse> {
    const response = await apiAgent.path(`/test-panels`).method("POST").json(payload).execute();
    return response.data as TestPanelResponse;
  }

  async UpdateTestPanel(id: string, payload: TestPanelPayload): Promise<TestPanelResponse> {
    const response = await apiAgent.path(`/test-panels/${id}`).method("PUT").json(payload).execute();
    return response.data as TestPanelResponse;
  }



  async ReorderTestPanels(
    organization_id: string,
    center_id: string,
    payload: ReorderPanelsPayload): Promise<ReorderPanelsResponse> {
    const response = await apiAgent
      .path(`organizations/${organization_id}/centers/${center_id}/diagnostics/panels/order-sequencing`)
      .method("PATCH")
      .json(payload)
      .execute();
    return response.data as ReorderPanelsResponse;
  }





















  // Test Categories APIs
  async GetTestCategories(
    organization_id: string,
    center_id: string,
    search?: string,
    pageNumber?: number,
    pageSize?: number
  ): Promise<TestCategoryListResponse> {
    const response = await apiAgent
      .path(`/organizations/${organization_id}/centers/${center_id}/diagnostics/categories`)
      .method("GET")
      .query({ search, pageNumber, pageSize })
      .execute();
    return response.data as TestCategoryListResponse;
  }

  async AddTestCategory(organization_id: string, center_id: string, payload: TestCategoryPayload): Promise<TestCategoryResponse> {
    const response = await apiAgent
      .path(`/organizations/${organization_id}/centers/${center_id}/diagnostics/categories`)
      .method("POST")
      .json(payload)
      .execute();
    return response.data as TestCategoryResponse;
  }

  async UpdateTestCategory(organization_id: string, center_id: string, id: string, payload: TestCategoryPayload): Promise<TestCategoryResponse> {
    const response = await apiAgent
      .path(`/organizations/${organization_id}/centers/${center_id}/diagnostics/categories/${id}`)
      .method("PATCH")
      .json(payload)
      .execute();
    return response.data as TestCategoryResponse;
  }

  async DeleteTestCategory(organization_id: string, center_id: string, id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiAgent
      .path(`/organizations/${organization_id}/centers/${center_id}/diagnostics/categories/${id}`)
      .method("DELETE")
      .execute();
    return response.data as { success: boolean; message: string };
  }

  async ReorderTestCategories(organization_id: string, center_id: string, payload: ReorderCategoriesPayload): Promise<ReorderCategoriesResponse> {
    const response = await apiAgent
      .path(`/organizations/${organization_id}/centers/${center_id}/diagnostics/categories/order-sequencing`)
      .method("PATCH")
      .json(payload)
      .execute();
    return response.data as ReorderCategoriesResponse;
  }





  //units

  async AddTestUnits(organization_id: string, center_id: string, name: string, description?: string): Promise<CreateUnitResponse> {
    const response = await apiAgent
      .path(`/organizations/${organization_id}/centers/${center_id}/diagnostics/units`)
      .method("POST")
      .json({ name, description })
      .execute();
    return response.data as CreateUnitResponse;

  }

  async GetTestUnits(
    pageNumber: number, pageSize: number,
    organization_id: string, center_id: string, search: string): Promise<UnitsListResponse> {
    const response = await apiAgent
      .path(`/organizations/${organization_id}/centers/${center_id}/diagnostics/units`)
      .method("GET")
      .query({ search ,pageNumber, pageSize })
      .execute();
    return response.data as UnitsListResponse;

  }

  async DeleteTestUnits(organization_id: string, center_id: string, id: string): Promise<DeleteUnitResponse> {
    const response = await apiAgent
      .path(`/organizations/${organization_id}/centers/${center_id}/diagnostics/units/${id}`)
      .method("DELETE")
      .execute();
    return response.data as DeleteUnitResponse;
  }
  //lab databse
  async AddTestToLabDatabase(organization_id: string, center_id: string, payload: CreateTestPayload): Promise<CreateLabTestResponse> {
    const response = await apiAgent
      .path(`/organizations/${organization_id}/centers/${center_id}/diagnostics/lab/test`)
      .method("POST")
      .json(payload)
      .execute();
    return response.data as CreateLabTestResponse;
  }

  // async GetLabTests(
  //   search?: string,
  //   categoryId?: string,
  //   pageNumber?: number,
  //   pageSize?: number
  // ): Promise<> {
  //   const response = await apiAgent
  //     .path(`/diagnostics/lab/tests`)
  //     .method("GET")
  //     .query({ search, categoryId, pageNumber, pageSize })
  //     .execute();
  //   return response.data as ;
  // }
  async GetAllTestsList(
    search?: string,
    pageNumber?: number,
    pageSize?: number,
    organization_id?: string,
    center_id?: string
  ): Promise<LabTest> {

    const response = await apiAgent
      .path(`organizations/${organization_id}/centers/${center_id}/diagnostics/lab/test`)
      .method("GET")
      .query({
        search,
        pageNumber,
        pageSize,
      })
      .execute();

    return response.data as LabTest;
  }


  //test ones
  async GetTestInterpretations(
    organization_id: string,
    center_id: string
  ): Promise<FeeManagementResponse> {
    const response = await apiAgent
      .path(`/organizations/${organization_id}/centers/${center_id}/diagnostics/interpretations/tests`)
      .method("GET")
      .execute();
    return response.data as FeeManagementResponse;
  }

  async UpdateTestInterpretations(
    organization_id: string,
    center_id: string,
    uid: string,
    interpretation: string
  ): Promise<FeeManagementResponse> {
    const response = await apiAgent
      .path(`/organizations/${organization_id}/centers/${center_id}/diagnostics/interpretations/tests/${uid}`)
      .method("PATCH")
      .json({ interpretation })
      .execute();
    return response.data as FeeManagementResponse;
  }


  //panel ones 

  async GetPanelInterpretations(
    organization_id: string,
    center_id: string
  ): Promise<FeeManagementResponse> {
    const response = await apiAgent
      .path(`/organizations/${organization_id}/centers/${center_id}/diagnostics/interpretations/panels`)
      .method("GET")
      .execute();
    return response.data as FeeManagementResponse;
  }

  async UpdatePanelInterpretations(
    organization_id: string,
    center_id: string,
    uid: string,
    interpretation: string
  ): Promise<FeeManagementResponse> {
    const response = await apiAgent
      .path(`/organizations/${organization_id}/centers/${center_id}/diagnostics/interpretations/panels/${uid}`)
      .method("PATCH")
      .json({ interpretation })
      .execute();
    return response.data as FeeManagementResponse;
  }



  async GetLabInvestigations(
    organization_id: string,
    center_id: string
  ): Promise<LabInvestigationsResponse> {
    const response = await apiAgent
      .path(`/organizations/${organization_id}/centers/${center_id}/diagnostics/bookings/lab-investigations`)
      .method("GET")
      .execute();
    return response.data as LabInvestigationsResponse;
  }


  async Addbilling(
    organization_id: string,
    center_id: string,
    payload: InvoicePayload
  ): Promise<BookingResponse> {
    const response = await apiAgent
      .path(`/organizations/${organization_id}/centers/${center_id}/diagnostics/bookings`)
      .method("POST")
      .json(payload)
      .execute();
    return response.data as BookingResponse;
  }



  async GetBillingList(
    organization_id: string,
    center_id: string,
    pageNumber: number = 1,
    pageSize: number = 10
  ): Promise<BookingsListResponse> {
    const response = await apiAgent
      .path(`/organizations/${organization_id}/centers/${center_id}/diagnostics/bookings`)
      .method("GET")
      .query({ pageNumber, pageSize })
      .execute();
    return response.data as BookingsListResponse;
  }


  //https://devs.v-xplore.com/clinicpe/doctor/fee?center_id=g7jN3S41&doctor_id=XvQ7ufZV&speciality_id=E5F6G7H8&appointment_type=in_clinic

  async GetProviderFees(
    speciality_id: string,
    appointment_type: string,
    center_id: string,
    provider_id: string
  ): Promise<FeeManagementResponse> {
    const response = await apiAgent
      .path(`doctor/fee`)
      .method("GET")
      .query({ center_id, doctor_id: provider_id, speciality_id, appointment_type })
      .execute();
    return response.data as FeeManagementResponse;
  }


  async GetSidebarData(
  ): Promise<SidebarMenuResponse> {
    const response = await apiAgent
      .path(`organizations/sidebar-menu`)
      .method("GET")
      .execute();
    return response.data as SidebarMenuResponse;
  }





  async AddRole(
    payload: { name: string; permissions?: string; status?: string }
  ): Promise<CreateRolePermissionResponse> {
    const response = await apiAgent
      .path(`organizations/users/roles`)
      .method("POST")
      .json(payload)
      .execute();
    return response.data as CreateRolePermissionResponse;
  }
  //role based
  async GetRoles(
    organization_id: string,
    center_id: string,
    search?: string
  ): Promise<import("./Types").RolesListResponse> {
    const response = await apiAgent
      .path(`organizations/${organization_id}/centers/${center_id}/roles`)
      .method("GET")
      .query({ search })
      .execute();
    return response.data as import("./Types").RolesListResponse;
  }



  async UpdateRole(
    organization_id: string,
    center_id: string,
    uid: string,
    payload: { name?: string; permissions?: string[]; status?: string }
  ): Promise<{ success: boolean; message: string } & { httpStatus?: number }> {
    const response = await apiAgent
      .path(`organizations/${organization_id}/centers/${center_id}/roles/${uid}`)
      .method("PATCH")
      .json(payload)
      .execute();
    return response.data as any;
  }

  async DeleteRole(
    organization_id: string,
    center_id: string,
    uid: string
  ): Promise<{ success: boolean; message: string } & { httpStatus?: number }> {
    const response = await apiAgent
      .path(`organizations/${organization_id}/centers/${center_id}/roles/${uid}`)
      .method("DELETE")
      .execute();
    return response.data as any;
  }


  async GetQRcode(
    organization_id: string,
    center_id: string
  ): Promise<QrCodeApiResponse> {
    const response = await apiAgent
      .path(`organizations/${organization_id}/centers/${center_id}/qr-code`)
      .method("GET")
      .execute();
    return response.data as QrCodeApiResponse;
  }

  // Other Test Panels (Radiology) APIs
  // async GetOtherTestPanels(pageNumber: number, pageSize: number, organization_id: string, center_id: string, search: string): Promise<any> {
  //   const response = await apiAgent
  //     .path(`organizations/${organization_id}/centers/${center_id}/diagnostics/other-panels`)
  //     .method("GET")
  //     .query({ search, pageNumber, pageSize })
  //     .execute();
  //   return response.data as any;
  // }

  // async AddOtherTestPanel(
  //   payload: any,
  //   organization_id: string, center_id: string): Promise<any> {
  //   const response = await apiAgent
  //     .path(`organizations/${organization_id}/centers/${center_id}/diagnostics/other-panels`)
  //     .method("POST")
  //     .json(payload)
  //     .execute();
  //   return response.data as any;
  // }

  // async UpdateOtherTestPanel(
  //   payload: any,
  //   organization_id: string, center_id: string, panel_id: string): Promise<any> {
  //   const response = await apiAgent
  //     .path(`organizations/${organization_id}/centers/${center_id}/diagnostics/other-panels/${panel_id}`)
  //     .method("PATCH")
  //     .json(payload)
  //     .execute();
  //   return response.data as any;
  // }

  // async DeleteOtherTestPanel(
  //   organization_id: string,
  //   center_id: string,
  //   id: string): Promise<any> {
  //   const response = await apiAgent
  //     .path(`organizations/${organization_id}/centers/${center_id}/diagnostics/other-panels/${id}`)
  //     .method("DELETE")
  //     .execute();
  //   return response.data as any;
  // }

  // async ReorderOtherTestPanels(
  //   organization_id: string,
  //   center_id: string,
  //   payload: ReorderPanelsPayload): Promise<any> {
  //   const response = await apiAgent
  //     .path(`organizations/${organization_id}/centers/${center_id}/diagnostics/other-panels/order-sequencing`)
  //     .method("PATCH")
  //     .json(payload)
  //     .execute();
  //   return response.data as any;
  // }

  // async GetOtherTestPanelById(
  //   organization_id: string,
  //   center_id: string,
  //   panel_id: string
  // ): Promise<any> {
  //   const response = await apiAgent
  //     .path(`organizations/${organization_id}/centers/${center_id}/diagnostics/other-panels/${panel_id}`)
  //     .method("GET")
  //     .execute();
  //   return response.data as any;
  // }

}
const apis = new Apis();
export default apis;