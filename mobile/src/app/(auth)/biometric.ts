import * as LocalAuthentication from "expo-local-authentication";

export async function canUseBiometric(): Promise<boolean> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && enrolled;
  } catch {
    return false;
  }
}

export async function authenticateBiometric(
  reason = 'Hızlı giriş için biyometrik doğrulama',
  options?: { strict?: boolean },
): Promise<boolean> {
  try {
    const strict = options?.strict === true;
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      fallbackLabel: 'Parola gir',
      cancelLabel: 'Vazgeç',
      disableDeviceFallback: strict,
    });
    return Boolean(result.success);
  } catch {
    return false;
  }
}

