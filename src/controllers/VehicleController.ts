import { Request, Response } from "express";
import { Vehicle } from "../models/Vehicle.model";

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

export const createVehicle = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const { model_id, year, vin, street, city, state, country, zipcode } =
      req.body;

    // Optional: field validation
    if (
      !model_id ||
      !year ||
      !vin ||
      !street ||
      !city ||
      !state ||
      !country ||
      !zipcode
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // const newVehicle = await Vehicle.create({
    //   model_id,
    //   year,
    //   vin,
    //   user_id: user.id,
    //   street,
    //   city,
    //   state,
    //   country,
    //   zipcode,
    // });

    // res.status(201).json(newVehicle);
  } catch (error: any) {
    console.error("Vehicle creation error:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ message: "VIN already exists" });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
};
