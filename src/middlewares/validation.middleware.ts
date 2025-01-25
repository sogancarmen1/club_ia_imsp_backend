import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { Request, Response, NextFunction } from "express";

export function validateDto(dtoClass: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dtoObject = plainToInstance(dtoClass, req.body);
    const errors = await validate(dtoObject);

    if (errors.length > 0) {
      const formattedErrors = errors.map((error) => ({
        field: error.property,
        messages: Object.values(error.constraints || {}),
      }));

      res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: formattedErrors,
      });
    } else {
      next();
    }
  };
}

export default validateDto;
