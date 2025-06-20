export interface AssignCustomerWithDataRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  documents?: Express.Multer.File[]; 
}