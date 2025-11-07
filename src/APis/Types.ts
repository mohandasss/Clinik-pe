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

export type VerifyOtpPayload =  {
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
  emailMobile: string  | number;
  device_type: string
  device_id: string;
  frontend_type: string
}

export type VerifyOtpToGetToken = {
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






