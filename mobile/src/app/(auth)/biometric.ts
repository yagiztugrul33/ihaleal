export async function canUseBiometric(): Promise<boolean> {
  try {
    // eslint-disable-next-line no-eval
    const req = eval('require') as NodeRequire;
    const LocalAuthentication = req('expo-local-authentication') as {
      hasHardwareAsync: () => Promise<boolean>;
      isEnrolledAsync: () => Promise<boolean>;
    };
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && enrolled;
  } catch {
    return false;
  }
}

export async function authenticateBiometric(reason = 'Hızlı giriş için biyometrik doğrulama'): Promise<boolean> {
  try {
    // eslint-disable-next-line no-eval
    const req = eval('require') as NodeRequire;
    const LocalAuthentication = req('expo-local-authentication') as {
      authenticateAsync: (options: Record<string, unknown>) => Promise<{ success: boolean }>;
    };
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      fallbackLabel: 'Parola gir',
      cancelLabel: 'Vazgeç',
      disableDeviceFallback: false,
    });
    return Boolean(result.success);
  } catch {
    return false;
  }
}

