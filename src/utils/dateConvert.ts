export function bsToAd(bsDate: string): string {
  if (!bsDate) return "";

  const [bsYear, bsMonth, bsDay] = bsDate.split("-").map(Number);

  // BS → AD conversion
  let adYear = bsYear - 56;
  let adMonth = bsMonth - 8;
  let adDay = bsDay;

  // Handle month underflow
  if (adMonth <= 0) {
    adMonth += 12;
    adYear -= 1;
  }

  // Simple day adjustment: subtract 15 days
  adDay = bsDay - 15;
  if (adDay <= 0) {
    adDay += 30;
    adMonth -= 1;
    if (adMonth <= 0) {
      adMonth += 12;
      adYear -= 1;
    }
  }

  // Keep day within reasonable bounds
  if (adDay > 31) adDay = 31;
  if (adDay < 1) adDay = 1;

  return `${adYear}-${adMonth.toString().padStart(2, "0")}-${adDay
    .toString()
    .padStart(2, "0")}`;
}

export function adToBs(adDate: string): string {
  if (!adDate) return "";

  const [adYear, adMonth, adDay] = adDate.split("-").map(Number);

  // AD → BS conversion
  let bsYear = adYear + 56;
  let bsMonth = adMonth + 8;
  let bsDay = adDay;

  // Handle month overflow
  if (bsMonth > 12) {
    bsMonth -= 12;
    bsYear += 1;
  }

  // Simple day adjustment: add 15 days
  bsDay = adDay + 15;
  if (bsDay > 30) {
    bsDay -= 30;
    bsMonth += 1;
    if (bsMonth > 12) {
      bsMonth -= 12;
      bsYear += 1;
    }
  }

  // Keep day within reasonable bounds
  if (bsDay > 32) bsDay = 32;
  if (bsDay < 1) bsDay = 1;

  return `${bsYear}-${bsMonth.toString().padStart(2, "0")}-${bsDay
    .toString()
    .padStart(2, "0")}`;
}

export function calculateAge(adDate: string): number {
  if (!adDate) return 0;

  const today = new Date();
  const birthDate = new Date(adDate);

  let age = today.getFullYear() - birthDate.getFullYear();

  // Check if birthday hasn't occurred this year yet
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age;
}
