import {
  requestForgotPassword as rfp,
  resetPassword as rp,
  changeMyPassword as cmp,
  updateMyProfile as ump,
  startTotpEnrollment,
  confirmTotpEnrollment,
  disableTotp,
  regenerateBackupCodes,
} from '@/auth/auth-api';

export { startTotpEnrollment, confirmTotpEnrollment, disableTotp, regenerateBackupCodes };
export type { TotpEnrollResponse } from '@/auth/auth-api';
export const requestForgotPassword = rfp;
export const resetPassword = rp;
export const changeMyPassword = cmp;
export const updateMyProfile = ump;
