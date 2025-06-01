import { Controller, Get, Post, Route, Tags, Query, Body } from 'tsoa';
import CustomerService from '../services/CustomerService';
import { Customer } from '../models/Customer.model';
import { CustomerResponse, CreateOrUpdateCustomerRequest } from '../types/customer';

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

  @Post('/')
  public async createOrUpdateCustomer(
    @Body() data: CreateOrUpdateCustomerRequest
  ): Promise<CustomerResponse> {
    const customer = await CustomerService.createOrUpdateCustomer(data);
    return customer.get({ plain: true });
  }


  @Get('/')
  public async getAllCustomers(): Promise<CustomerResponse[]> {
    const customers = await CustomerService.getAllCustomers();
    return customers.map((customer: Customer) => customer.get({ plain: true }));
  }
}