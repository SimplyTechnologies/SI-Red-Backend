import { Customer } from '../models/Customer.model';
import { Vehicle } from '../models/Vehicle.model';
import { Op, Order, Transaction } from 'sequelize';
import { CreateOrUpdateCustomerRequest, CustomerResponse } from '../types/customer';
import { Make, Model } from '../models';

class CustomerService {
  async getAllCustomers({
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  }: {
    page: number;
    limit: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<{ total: number; customers: CustomerResponse[] }> {
    const offset = (page - 1) * limit;

    const whereClause = search
      ? {
          [Op.or]: [
            { firstName: { [Op.iLike]: `%${search}%` } },
            { lastName: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } },
          ],
        }
      : undefined;

    let order: Order = [['createdAt', 'DESC']]; // default

    if (sortBy) {
      if (sortBy === 'name') {
        order = [
          [Customer.sequelize!.literal(`"firstName" || ' ' || "lastName"`), sortOrder || 'ASC'],
        ];
      } else if (sortBy === 'assignedDate') {
        order = [[{ model: Vehicle, as: 'vehicles' }, 'assignedDate', sortOrder || 'ASC']];
      } else {
        order = [[sortBy, sortOrder || 'ASC']];
      }
    }
    const count = await Customer.count({ where: whereClause });

    const rows = await Customer.findAll({
      limit,
      offset,
      where: whereClause,
      order,
      include: [
        {
          model: Vehicle,
          as: 'vehicles',
          attributes: ['id', 'model_id', 'year', 'vin', 'status', 'assignedDate'],
          include: [
            {
              model: Model,
              as: 'model',
              attributes: ['name'],
              include: [
                {
                  model: Make,
                  as: 'make',
                  attributes: ['name'],
                },
              ],
            },
          ],
        },
      ],
    });

    const customers: CustomerResponse[] = rows.map((customer: Customer) =>
      customer.get({ plain: true })
    );

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

  async deleteCustomer(id: string): Promise<boolean> {
    const customer = await Customer.findByPk(id);
    if (!customer) return false;

    await customer.destroy();

    await Vehicle.update(
      {
        status: 'in stock',
        assignedDate: null,
        customer_id: null,
      },
      { where: { customer_id: id } }
    );

    return true;
  }
}

export default new CustomerService();
