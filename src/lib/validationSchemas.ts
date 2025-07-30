import { z } from 'zod'

/**
 * Authentication validation schemas
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must not exceed 255 characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(255, 'Password must not exceed 255 characters'),
})

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(255, 'Name must not exceed 255 characters')
      .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address')
      .max(255, 'Email must not exceed 255 characters'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .max(255, 'Password must not exceed 255 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one lowercase letter, one uppercase letter, and one number',
      ),
    password_confirmation: z.string().min(1, 'Password confirmation is required'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ['password_confirmation'],
  })

/**
 * User management validation schemas
 */
export const userCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must not exceed 255 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must not exceed 255 characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(255, 'Password must not exceed 255 characters'),
  role: z.enum(['admin', 'editor', 'moderator', 'customer'], {
    required_error: 'Role is required',
    invalid_type_error: 'Please select a valid role',
  }),
})

export const userUpdateSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must not exceed 255 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must not exceed 255 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(255, 'Password must not exceed 255 characters')
    .optional()
    .or(z.literal('')),
  role: z.enum(['admin', 'editor', 'moderator', 'customer'], {
    required_error: 'Role is required',
    invalid_type_error: 'Please select a valid role',
  }),
})

/**
 * Product management validation schemas
 */
export const productSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(255, 'Product name must not exceed 255 characters'),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional()
    .or(z.literal('')),
  price: z
    .number({ required_error: 'Price is required' })
    .min(0, 'Price must be positive')
    .max(999999.99, 'Price is too high'),
  stock: z
    .number({ required_error: 'Stock is required' })
    .int('Stock must be a whole number')
    .min(0, 'Stock must be non-negative'),
  category_id: z
    .number({ required_error: 'Category is required' })
    .int('Invalid category')
    .min(1, 'Please select a category')
    .optional(),
})

/**
 * Category management validation schemas
 */
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(255, 'Category name must not exceed 255 characters'),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional()
    .or(z.literal('')),
})

/**
 * Transaction management validation schemas
 */
export const transactionUpdateSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'], {
    required_error: 'Status is required',
    invalid_type_error: 'Please select a valid status',
  }),
  notes: z.string().max(1000, 'Notes must not exceed 1000 characters').optional().or(z.literal('')),
})

/**
 * File upload validation schemas
 */
export const fileUploadSchema = z.object({
  files: z
    .array(z.instanceof(File))
    .min(1, 'Please select at least one file')
    .max(10, 'Maximum 10 files allowed'),
})

export const imageUploadSchema = z.object({
  images: z
    .array(z.instanceof(File))
    .min(1, 'Please select at least one image')
    .max(5, 'Maximum 5 images allowed')
    .refine(
      (files) => files.every((file) => file.type.startsWith('image/')),
      'Only image files are allowed',
    )
    .refine(
      (files) => files.every((file) => file.size <= 5 * 1024 * 1024), // 5MB
      'Each image must be less than 5MB',
    ),
})

/**
 * Search and filter validation schemas
 */
export const searchSchema = z.object({
  query: z.string().max(255, 'Search query is too long').optional(),
  filters: z.record(z.any()).optional(),
  sort: z.string().max(100, 'Sort parameter is too long').optional(),
  order: z.enum(['asc', 'desc']).optional(),
  page: z.number().int().min(1).optional(),
  per_page: z.number().int().min(1).max(100).optional(),
})

// Export types for TypeScript
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type UserCreateFormData = z.infer<typeof userCreateSchema>
export type UserUpdateFormData = z.infer<typeof userUpdateSchema>
export type ProductFormData = z.infer<typeof productSchema>
export type CategoryFormData = z.infer<typeof categorySchema>
export type TransactionUpdateFormData = z.infer<typeof transactionUpdateSchema>
export type FileUploadFormData = z.infer<typeof fileUploadSchema>
export type ImageUploadFormData = z.infer<typeof imageUploadSchema>
export type SearchFormData = z.infer<typeof searchSchema>
