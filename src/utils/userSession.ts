export const getDeviceUserId = (): string => {
  try {
    let id = localStorage.getItem('deviceUserId');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('deviceUserId', id);
    }
    return id;
  } catch {
    // Fallback if unavailable
    return '00000000-0000-0000-0000-000000000000';
  }
};