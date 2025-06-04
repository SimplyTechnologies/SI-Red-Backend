import { Controller, Get, Route, Tags, Query } from 'tsoa';
import CustomerService from '../services/CustomerService';
import { Customer } from '../models/Customer.model';
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
    return customers.map((customer: Customer) => customer.get({ plain: true }));
  }

  @Get('/')
  public async getAllCustomers(): Promise<CustomerResponse[]> {
    const customers = await CustomerService.getAllCustomers();
    return customers.map((customer: Customer) => customer.get({ plain: true }));
  }
}
