import type { OrganizationAddPayloads, OrganizationLoginRequestPayload, OrganizationRegistrationPayload, OrganizationSuccessResponse, ResendOtpPayload, ResendOtpResponse, VerifyOtpPayload, VerifyOtpResponse, AccessToken, OrganizationAddInside, OrganizationAddInsideResponse, OrganizationListResponse, ClinicRequestPayload, CenterRequestPayload, CreateCenterResponse, CenterListResponse, ExperienceResponse, QualificationResponse, SpecialityResponse, FileUploadResponse, ProviderDetails } from "./Types";
import apiAgent from "./apiAgents";

class Apis {
  async RegisterOrganization(
    payload: OrganizationRegistrationPayload
  ): Promise<| OrganizationSuccessResponse> {
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

  //switch accesss clinic // later needed
  // async SwitchClinic(
  // ): Promise<AccessToken> {
  //   const response = await apiAgent
  //     .path("/organizations/switch-clinic")
  //     .method("POST")
  //     .execute();

  //   return response.data as AccessToken;
  // }

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
      .path(`/organizations/${organization_id}/doctor`)
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


}
const apis = new Apis();
export default apis;