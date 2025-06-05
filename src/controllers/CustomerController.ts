import { Controller, Get, Route, Tags, Query, Delete, Path } from 'tsoa';
import CustomerService from '../services/CustomerService';
import { CustomerResponse } from '../types/customer';
import { CUSTOMERS_SEARCH } from '../constants/constants';

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
    @Query() page: number = CUSTOMERS_SEARCH.PAGE_NUMBER,
    @Query() limit: number = CUSTOMERS_SEARCH.LIMIT,
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

  @Delete('/{id}')
  public async deleteCustomer(@Path() id: string): Promise<{ message: string }> {
    const deleted = await CustomerService.deleteCustomer(id);

    if (!deleted) {
      this.setStatus(404);
      throw new Error('Customer not found');
    }

    return { message: 'Customer deleted successfully' };
  }
}