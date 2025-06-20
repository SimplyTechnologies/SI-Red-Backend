import { Customer } from '../models/Customer.model';
import { Vehicle } from '../models/Vehicle.model';
import { Op, Transaction } from 'sequelize';
import { CreateOrUpdateCustomerRequest, CustomerResponse } from '../types/customer';
import { Make, Model } from '../models';
import { Document } from '../models/Document.model'; 

class CustomerService {
  async getAllCustomers({
    page,
    limit,
    search,
  }: {
    page: number;
    limit: number;
    search?: string;
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

    const count = await Customer.count({ where: whereClause });

    const rows = await Customer.findAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      where: whereClause,
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
        {
          model: Document,
          as: 'documents',
          attributes: ['id', 'name', 'fileUrl', 'size', 'mimeType'],
          where: { deletedAt: null },
          required: false,
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

     async getCustomerDocuments(customerId: string) {
    return await Document.findAll({
      where: { customerId, deletedAt: null },
      attributes: ['id', 'name', 'fileUrl', 'size', 'mimeType'],
    });
  }

   async uploadDocuments(customerId: string, files: Express.Multer.File[]) {
    // Implement your storage logic here if needed
    const uploaded = await Promise.all(
      files.map(async (file) => {
        // If you use S3 or other storage, upload and get fileUrl here
        const fileUrl = `/uploads/${file.filename}`; // Example for local storage
        return await Document.create({
          customerId,
          name: file.originalname,
          fileUrl,
          size: file.size,
          mimeType: file.mimetype,
        });
      })
    );
    return uploaded;
  }
}




export default new CustomerService();
