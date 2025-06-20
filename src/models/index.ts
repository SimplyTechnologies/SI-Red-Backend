import { User } from './User.model';
import { Vehicle } from './Vehicle.model';
import { Model } from './Model.model';
import { Make } from './Make.model';
import { Customer } from './Customer.model';
import { Document } from './Document.model'; 


Vehicle.belongsTo(Model, {
  foreignKey: 'model_id',
  as: 'model',
});

Vehicle.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

Model.belongsTo(Make, { foreignKey: 'make_id', as: 'make' });

Customer.hasMany(Vehicle, {
  foreignKey: 'customer_id',
  as: 'vehicles',
});

Vehicle.belongsTo(Customer, {
  foreignKey: 'customer_id',
  as: 'customer',
});

User.belongsToMany(Vehicle, {
  through: 'favorites',
  as: 'favoriteVehicles',
  foreignKey: 'userId',
  otherKey: 'vehicleId',
});
Vehicle.belongsToMany(User, {
  through: 'favorites',
  as: 'userFavorited',
  foreignKey: 'vehicleId',
  otherKey: 'userId',
});
Customer.hasMany(Document, {
  foreignKey: 'customerId',
  as: 'documents',
});

Document.belongsTo(Customer, {
  foreignKey: 'customerId',
  as: 'customer',
});
Vehicle.hasMany(Document, {
  foreignKey: 'vehicleId',
  as: 'documents',
});

Document.belongsTo(Vehicle, {
  foreignKey: 'vehicleId',
  as: 'vehicle',
});

export { User } from './User.model';
export { Vehicle } from './Vehicle.model';
export { Model } from './Model.model';
export { Make } from './Make.model';
export { Customer } from './Customer.model';