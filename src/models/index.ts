import { User } from './User.model';
import { Vehicle } from './Vehicle.model';
import { Model } from './Model.model';
import { Make } from './Make.model';

// ✅ One Vehicle belongs to one Model
Vehicle.belongsTo(Model, {
  foreignKey: 'model_id',
  as: 'model',
});

// ✅ One Vehicle belongs to one User
Vehicle.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// ✅ One Model belongs to one Make
Model.belongsTo(Make, { foreignKey: 'make_id', as: 'make' });

// User-Vehicle MTM
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
