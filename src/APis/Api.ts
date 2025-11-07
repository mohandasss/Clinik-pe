import type { OrganizationAddPayloads, OrganizationLoginRequestPayload, OrganizationRegistrationPayload, OrganizationSuccessResponse, ResendOtpPayload, ResendOtpResponse, VerifyOtpPayload, VerifyOtpResponse, AccessToken, OrganizationAddInside, OrganizationAddInsideResponse, OrganizationListResponse } from "./Types";
import apiAgent from "./apiAgents";

class Apis {
  async RegisterOrganization(
    payload: OrganizationRegistrationPayload
  ): Promise<| OrganizationSuccessResponse> {
    const response = await apiAgent
      .path("/organization/register")
      .method("POST")
      .json(payload)
      .execute();

    return response.data as OrganizationSuccessResponse;
  }

  async OrganizationOtpVerification(
    payload: VerifyOtpPayload
  ): Promise<VerifyOtpResponse> {
    const response = await apiAgent
      .path("/organization/otp-verification")
      .method("POST")
      .json(payload)
      .execute();

    return response.data as VerifyOtpResponse;
  }

  async ResendOrganizationOtp(
    payload: ResendOtpPayload
  ): Promise<ResendOtpResponse> {
    const response = await apiAgent
      .path("/organization/resent-otp")
      .method("POST")
      .json(payload)
      .execute();
    return response.data as ResendOtpResponse;
  }



  async AddOrganization(
    payload: OrganizationAddPayloads
  ): Promise<OrganizationSuccessResponse> {
    const response = await apiAgent
      .path("/organization/onboarding")
      .method("POST")
      .json(payload)
      .execute();
    return response.data as OrganizationSuccessResponse;
  }

  async OrganizationLogin(
    payload: OrganizationLoginRequestPayload
  ): Promise<OrganizationSuccessResponse> {
    const response = await apiAgent
      .path("/organization/login")
      .method("POST")
      .json(payload)
      .execute();
    return response.data as OrganizationSuccessResponse;
  }

  async OrganizationLoginOtpVerification(
    payload: VerifyOtpPayload
  ): Promise<AccessToken> {
    const response = await apiAgent
      .path("/organization/login-otp-verification")
      .method("POST")
      .json(payload)
      .execute();

    return response.data as AccessToken;
  }
  async OrganizationLoginResendOtpVerification(
    payload: ResendOtpPayload
  ): Promise<ResendOtpResponse> {
    const response = await apiAgent
      .path("/organization/resend-login-otp")
      .method("POST")
      .json(payload)
      .execute();

    return response.data as ResendOtpResponse;
  }

  //switch accesss clinic // later needed
  async SwitchClinic(
  ): Promise<AccessToken> {
    const response = await apiAgent
      .path("/organization/switch-clinic")
      .method("POST")
      .execute();

    return response.data as AccessToken;
  }

  async AddOrganizationFromInside(
    payload: OrganizationAddInside
  ): Promise<OrganizationAddInsideResponse> {
    const response = await apiAgent
      .path("/organization")
      .method("POST")
      .json(payload)
      .execute();

    return response.data as OrganizationAddInsideResponse;
  }

  async GetOrganizationsList(): Promise<OrganizationListResponse> {
    const response = await apiAgent
      .path("/organization/list")
      .method("GET")
      .query({})
      .execute();
    return response.data as OrganizationListResponse;
  }





}
const apis = new Apis();
export default apis;