import { Controller, Get, Route, Tags, Query } from 'tsoa';
import CustomerService from '../services/CustomerService';
import { CustomerResponse } from '../types/customer';

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
    if (customers.length === 0) {
      this.setStatus(404);
      throw new Error('No customers found for the given email');
    }

    return customers; 
  }

  @Get('/')
  public async getAllCustomers(
    @Query() page: number = 1,
    @Query() limit: number = 10,
    @Query() search?: string
  ): Promise<{ total: number; customers: CustomerResponse[] }> {
    const { total, customers } = await CustomerService.getAllCustomers({ page, limit, search });

    if (customers.length === 0) {
      this.setStatus(404);
      throw new Error('No customers found');
    }

    return {
      total,
      customers, 
    };
  }
}