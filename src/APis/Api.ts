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
  DoctorAvailabilityResponse,
  DoctorAvailabilityInput,
  AddDoctorAvailabilityResponse,
  PaymentSettingsPayload,
  SyncSettingsResponse,
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



  async GetProviderAvailabilities(
    provider_id: string): Promise<DoctorAvailabilityResponse> {
    const response = await apiAgent
      .path(`/doctors/${provider_id}/availabilities`)
      .method("GET")
      .execute();
    return response.data as DoctorAvailabilityResponse;
  }



  async AddDoctorAvailability(
    provider_id: string,
    payload: DoctorAvailabilityInput[]
  ): Promise<AddDoctorAvailabilityResponse> {
    const response = await apiAgent
      .path(`/doctors/${provider_id}/availabilities`)
      .method("POST")
      .json(payload)
      .execute();
    return response.data as AddDoctorAvailabilityResponse;
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





}
const apis = new Apis();
export default apis;