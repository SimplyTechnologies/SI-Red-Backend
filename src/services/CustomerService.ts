import { Customer } from '../models/Customer.model';
import { Op, Transaction } from 'sequelize';
import { CreateOrUpdateCustomerRequest } from '../types/customer';

class CustomerService {
  async getAllCustomers(): Promise<Customer[]> {
    return await Customer.findAll();
  }

  async suggestCustomers(email: string): Promise<Customer[]> {
    return await Customer.findAll({
      where: {
        email: {
          [Op.like]: `%${email}%`,
        },
      },
    });
  }

  async createOrUpdateCustomer(
    data: CreateOrUpdateCustomerRequest,
    transaction?: Transaction
  ): Promise<Customer> {
    const existingCustomer = await Customer.findOne({
      where: { email: data.email },
      transaction,
    });

    if (existingCustomer) {
      await existingCustomer.update(data, { transaction });
      return existingCustomer;
    }

    return await Customer.create(data, { transaction });
  }
}

export default new CustomerService();
