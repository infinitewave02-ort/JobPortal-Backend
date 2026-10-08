
import Joi from 'joi';

const userSchema = Joi.object({
  uid: Joi.string().required(),
  email: Joi.string().email().required(),
  name: Joi.string().required(),
  phone: Joi.string().optional(),
  profileImage: Joi.string().uri().optional()
});

const employeeSchema = Joi.object({
  uid: Joi.string().required(),
  userId: Joi.string().required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().optional(),
  profileImage: Joi.string().uri().optional(),
  jobTitle: Joi.string().optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  education: Joi.string().optional(),
  experience: Joi.string().optional(),
  location: Joi.string().optional(),
  expectedSalary: Joi.number().optional(),
  noticePeriod: Joi.string().optional()
});

const employerSchema = Joi.object({
  uid: Joi.string().required(),
  userId: Joi.string().required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().optional(),
  companyName: Joi.string().optional(),
  companyEmail: Joi.string().email().optional(),
  status: Joi.string().valid('pending', 'approved', 'rejected', 'blocked').default('pending')
});

const companySchema = Joi.object({
  companyId: Joi.string().required(),
  ownerId: Joi.string().required(),
  companyName: Joi.string().required(),
  logo: Joi.string().uri().optional(),
  description: Joi.string().optional(),
  industry: Joi.string().optional(),
  website: Joi.string().uri().optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  location: Joi.string().optional(),
  address: Joi.string().optional()
});

const jobSchema = Joi.object({
  jobId: Joi.string().required(),
  employerId: Joi.string().required(),
  companyId: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string().required(),
  skills: Joi.array().items(Joi.string()).required(),
  employmentType: Joi.string().required(),
  experience: Joi.number().optional(),
  salary: Joi.number().optional(),
  qualification: Joi.string().optional(),
  responsibilities: Joi.string().optional(),
  requirements: Joi.string().optional(),
  status: Joi.string().valid('active', 'closed').default('active'),
  applicationCount: Joi.number().default(0)
});

const applicationSchema = Joi.object({
  applicationId: Joi.string().required(),
  jobId: Joi.string().required(),
  employerId: Joi.string().required(),
  companyId: Joi.string().required(),
  resumeId: Joi.string().required(),
  coverLetter: Joi.string().optional(),
  status: Joi.string().valid('applied', 'shortlisted', 'interview', 'selected', 'rejected').default('applied')
});

const resumeSchema = Joi.object({
  resumeId: Joi.string().required(),
  employeeId: Joi.string().required(),
  fileName: Joi.string().required(),
  fileType: Joi.string().required(),
  fileSize: Joi.number().required(),
  storagePath: Joi.string().required(),
  downloadUrl: Joi.string().uri().required()
});

const messageSchema = Joi.object({
  senderId: Joi.string().required(),
  receiverId: Joi.string().required(),
  message: Joi.string().required(),
  type: Joi.string().required()
});

const notificationSchema = Joi.object({
  userId: Joi.string().required(),
  type: Joi.string().required(),
  title: Joi.string().optional(),
  message: Joi.string().required(),
  isRead: Joi.boolean().default(false)
});

const planSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().min(0).required(),
  description: Joi.string().optional(),
  features: Joi.array().items(Joi.string()).optional(),
  status: Joi.string().valid('active', 'inactive').default('active')
});

const paymentSchema = Joi.object({
  userId: Joi.string().required(),
  planId: Joi.string().required(),
  amount: Joi.number().min(0).required(),
  status: Joi.string().valid('pending', 'successful', 'failed').default('pending'),
  paymentMethod: Joi.string().required(),
  transactionId: Joi.string().optional()
});

export {
  userSchema, employeeSchema, employerSchema, companySchema,
  jobSchema, applicationSchema, resumeSchema,
  messageSchema, notificationSchema, planSchema, paymentSchema
};
