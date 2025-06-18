import { User } from './User.model';
import { Vehicle } from './Vehicle.model';
import { Model } from './Model.model';
import { Make } from './Make.model';
import { Customer } from './Customer.model';
import { VehicleImage } from './VehicleImage.model';

Vehicle.hasMany(VehicleImage, {
  foreignKey: 'vehicle_id',
  as: 'images',
});
VehicleImage.belongsTo(Vehicle, {
  foreignKey: 'vehicle_id',
  as: 'vehicle',
});

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

export { User } from './User.model';
export { Vehicle } from './Vehicle.model';
export { Model } from './Model.model';
export { Make } from './Make.model';
export { Customer } from './Customer.model';
export { VehicleImage } from './VehicleImage.model';