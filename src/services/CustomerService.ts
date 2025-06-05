import { Customer } from '../models/Customer.model';
import { Op, Transaction, Sequelize } from 'sequelize';
import { CreateOrUpdateCustomerRequest, CustomerResponse } from '../types/customer';

class CustomerService {
  async getAllCustomers({
    page,
    limit,
    search,
  }: { page: number; limit: number; search?: string }): Promise<{ total: number; customers: CustomerResponse[] }> {
    const offset = (page - 1) * limit;

    const whereClause: Record<string, unknown> = {
      ...(search && {
        [Op.or]: [
          Sequelize.where(
            Sequelize.fn('concat', Sequelize.col('firstName'), ' ', Sequelize.col('lastName')),
            {
              [Op.iLike]: `%${search.trim()}%`,
            }
          ),
          { email: { [Op.iLike]: `%${search.trim()}%` } },
          { phone: { [Op.iLike]: `%${search.trim()}%` } },
        ],
      }),
    };

    const { count, rows } = await Customer.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    const customers: CustomerResponse[] = rows.map((customer: Customer) => customer.get({ plain: true }));

    return {
      total: count,
      customers,
    };
  }

  async suggestCustomers(email: string): Promise<CustomerResponse[]> {
    const customers = await Customer.findAll({
      where: {
        email: {
          [Op.iLike]: `%${email}%`,
        },
      },
    });

    return customers.map((customer: Customer) => customer.get({ plain: true }));
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