import { Customer } from '../models/Customer.model';
import { Op } from 'sequelize';
import { CreateOrUpdateCustomerRequest } from '../types/customer';

class CustomerService {
  async suggestCustomers(email: string): Promise<Customer[]> {
    return await Customer.findAll({
      where: {
        email: {
          [Op.like]: `%${email}%`,
        },
      },
    });
  }

  async createOrUpdateCustomer(data: CreateOrUpdateCustomerRequest): Promise<Customer> {
    const existingCustomer = await Customer.findOne({ where: { email: data.email } });

    if (existingCustomer) {
      await existingCustomer.update(data);
      return existingCustomer;
    }

    return await Customer.create(data);
  }

  async getAllCustomers(): Promise<Customer[]> {
    return await Customer.findAll();
  }
}

export default new CustomerService();