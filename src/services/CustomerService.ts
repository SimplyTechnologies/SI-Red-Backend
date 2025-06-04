import { Customer } from '../models/Customer.model';
import { Op } from 'sequelize';
import { CreateOrUpdateCustomerRequest } from '../types/customer';
import createError from 'http-errors';

function validateCustomerData(data: CreateOrUpdateCustomerRequest) {
  const { email, firstName, lastName, phone } = data;

  if (!email || !firstName || !lastName) {
    throw new createError.BadRequest('Email, first name, and last name are required');
  }

  if (typeof email !== 'string' || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    throw new createError.BadRequest('Invalid email format');
  }

  if (phone && !phone.match(/^\+?\d{7,15}$/)) {
    throw new createError.BadRequest('Invalid phone number format');
  }

  if (!firstName.trim() || !lastName.trim()) {
    throw new createError.BadRequest('Name fields cannot be empty');
  }
}

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
    validateCustomerData(data);

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
