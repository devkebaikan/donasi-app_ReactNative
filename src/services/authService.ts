import {apiClient} from './apiClient';
import type {ApiResponse} from '@/types/api';

interface LoginPayload {
  phone: string;
  password: string;
}

export type LoginData = {
  access_token: string;
  expires_in: number;
};

export async function login(
  payload: LoginPayload,
): Promise<ApiResponse<LoginData>> {
  const res = await apiClient.post<ApiResponse<LoginData>>(
    '/auth/login',
    payload,
  );
  return res.data;
}

interface LoginOtpPayload {
  phone: string;
}

interface ValidateLoginOtpPayload {
  phone: string;
  otp: string;
}

export type LoginOtpData = {
  expires_in: number;
};

export type ValidateLoginOtpData = {
  access_token: string;
  expires_in: number;
};

export async function sendLoginOtp(
  payload: LoginOtpPayload,
): Promise<ApiResponse<LoginOtpData>> {
  const res = await apiClient.post<ApiResponse<LoginOtpData>>(
    '/auth/login-otp',
    payload,
  );
  return res.data;
}

export async function validateLoginOtp(
  payload: ValidateLoginOtpPayload,
): Promise<ApiResponse<ValidateLoginOtpData>> {
  const res = await apiClient.post<ApiResponse<ValidateLoginOtpData>>(
    '/auth/validate-login-otp',
    payload,
  );
  return res.data;
}

interface RequestResetPasswordPayload {
  phone: string;
}

export type RequestResetPasswordData = {
  expiresIn: number;
};

interface ValidateResetPasswordPayload {
  phone: string;
  otp: string;
}

interface CreatePasswordPayload {
  phone: string;
  password: string;
  password_confirmation: string;
}

export type CreatePasswordData = {
  accessToken: string;
  expiresIn: number;
};

export async function requestResetPassword(
  payload: RequestResetPasswordPayload,
): Promise<ApiResponse<RequestResetPasswordData>> {
  const res = await apiClient.post<ApiResponse<RequestResetPasswordData>>(
    '/auth/request-reset-password',
    payload,
  );
  return res.data;
}

export async function validateResetPassword(
  payload: ValidateResetPasswordPayload,
): Promise<ApiResponse<null>> {
  const res = await apiClient.post<ApiResponse<null>>(
    '/auth/validate-reset-password',
    payload,
  );
  return res.data;
}

export async function createPassword(
  payload: CreatePasswordPayload,
): Promise<ApiResponse<CreatePasswordData>> {
  const res = await apiClient.post<ApiResponse<CreatePasswordData>>(
    '/auth/create-password',
    payload,
  );
  return res.data;
}

interface RequestOtpPayload {
  name: string;
  phone: string;
  email?: string;
}

interface VerifyOtpPayload {
  otp: string;
  phone: string;
}

interface SetPasswordPayload {
  password: string;
  password_confirmation: string;
  phone: string;
}

export type RequestOtpData = {
  expiresIn: number;
};

export type SetPasswordData = {
  accessToken: string;
  expiresIn: number;
};

export async function requestOtp(
  payload: RequestOtpPayload,
): Promise<ApiResponse<RequestOtpData>> {
  const res = await apiClient.post<ApiResponse<RequestOtpData>>(
    '/auth/request-otp',
    payload,
  );
  return res.data;
}

export async function verifyOtp(
  payload: VerifyOtpPayload,
): Promise<ApiResponse<null>> {
  const res = await apiClient.post<ApiResponse<null>>('/auth/otp', payload);
  return res.data;
}

export async function setPassword(
  payload: SetPasswordPayload,
): Promise<ApiResponse<SetPasswordData>> {
  const res = await apiClient.post<ApiResponse<SetPasswordData>>(
    '/auth/set-password',
    payload,
  );
  return res.data;
}

export async function logout(): Promise<ApiResponse<null>> {
  const res = await apiClient.post<ApiResponse<null>>('/auth/logout');
  return res.data;
}
