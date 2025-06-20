import { Controller, Get, Route, Tags, Query, Delete, Path, Post, Security, Request, Middlewares
} from 'tsoa';
import CustomerService from '../services/CustomerService';
import { CustomerResponse } from '../types/customer';
import { CUSTOMERS_SEARCH } from '../constants/constants';
import { Request as ExpressRequest } from 'express';
import { upload } from '../middlewares/upload';

@Route('customers')
@Tags('Customer')
export class CustomerController extends Controller {
  @Get('/suggest')
  public async suggestCustomers(@Query() email: string): Promise<CustomerResponse[]> {
    if (!email) {
      this.setStatus(400);
      throw new Error("Missing 'email' query parameter");
    }

    const customers = await CustomerService.suggestCustomers(email);

    return customers;
  }

  @Get('/')
  public async getAllCustomers(
    @Query() page: number = CUSTOMERS_SEARCH.PAGE_NUMBER,
    @Query() limit: number = CUSTOMERS_SEARCH.LIMIT,
    @Query() search?: string,
    @Query() sortBy?: string,
    @Query() sortOrder?: 'ASC' | 'DESC'
  ): Promise<{ total: number; customers: CustomerResponse[] }> {
    const { total, customers } = await CustomerService.getAllCustomers({
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    });
    return {
      total,
      customers,
    };
  }

  @Delete('/{id}')
  public async deleteCustomer(@Path() id: string): Promise<{ message: string }> {
    const deleted = await CustomerService.deleteCustomer(id);

    if (!deleted) {
      this.setStatus(404);
      throw new Error('Customer not found');
    }

    return { message: 'Customer deleted successfully' };
  }

   /**
   * Get customer documents
   * @param id Customer ID
   */
  @Get('/{id}/documents')
  @Security('bearerAuth')
  public async getCustomerDocuments(
    @Path() id: string
  ): Promise<Array<{
    id: string;
    name: string;
    fileUrl: string;
    size: number;
    mimeType: string;
  }>> {
    const documents = await CustomerService.getCustomerDocuments(id);
    return documents;
  }

  /**
   * Upload documents for a customer
   * @param id Customer ID
   * @param documents Documents to upload (PDF, JPEG, PNG)
   * @consumes multipart/form-data
   */
  @Post('/{id}/documents')
  @Security('bearerAuth')
  @Middlewares([upload.array('documents')])
  public async uploadDocuments(
    @Path() id: string,
    @Request() req: ExpressRequest
  ): Promise<{ message: string; documents: Array<{
    id: string;
    name: string;
    fileUrl: string;
  }> }> {
    const files = req.files as Express.Multer.File[];
    const documents = await CustomerService.uploadDocuments(id, files);
    
    return {
      message: 'Documents uploaded successfully',
      documents
    };
  }
}
