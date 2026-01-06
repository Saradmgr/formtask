import { z } from 'zod';

export const formSchema = z.object({
  fullNameEnglish: z
    .string()
    .min(1, 'Full name in English is required')
    .regex(/^[A-Za-z\s]+$/, 'Only alphabets and spaces allowed'),
  fullNameNepali: z.string().optional(),
  gender: z.enum(['male', 'female', 'other'], {
    message: 'Gender is required'
  }),
  dateOfBirthAD: z.string().min(1, 'Date of birth is required'),
  dateOfBirthBS: z.string().min(1, 'Date of birth is required'),
  phoneNumber: z.string().optional().refine((phone) => {
    if (!phone || phone.trim() === '') return true; // Optional field
    return /^9\d{9}$/.test(phone); // Must be 10 digits starting with 9
  }, 'Phone number must be 10 digits starting with 9'),
  citizenshipNumber: z.string().min(1, 'Citizenship number is required'),
  issuedDistrict: z.string().min(1, 'Issued district is required'),
  issuedDateAD: z.string().min(1, 'Issued date is required'),
  issuedDateBS: z.string().min(1, 'Issued date is required'),
  citizenshipFront: z
    .any()
    .optional()
    .refine((file) => {
      if (!file) return true;
      return file.size <= 2 * 1024 * 1024; // 2MB
    }, 'File size must be less than 2MB')
    .refine((file) => {
      if (!file) return true;
      return ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type);
    }, 'Only JPG, PNG, or PDF files allowed'),
  citizenshipBack: z
    .any()
    .optional()
    .refine((file) => {
      if (!file) return true;
      return file.size <= 2 * 1024 * 1024; // 2MB
    }, 'File size must be less than 2MB')
    .refine((file) => {
      if (!file) return true;
      return ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type);
    }, 'Only JPG, PNG, or PDF files allowed'),
}).refine((data) => {
  const currentYear = new Date().getFullYear();
  const birthYear = new Date(data.dateOfBirthAD).getFullYear();
  const age = currentYear - birthYear;

  if (age > 18 && data.gender === 'male') {
    return data.phoneNumber && data.phoneNumber.length > 0;
  }
  return true;
}, {
  message: 'Phone number is required for males over 18',
  path: ['phoneNumber'],
});

export type FormData = z.infer<typeof formSchema>;