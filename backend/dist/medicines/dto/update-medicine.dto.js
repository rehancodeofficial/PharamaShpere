"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMedicineDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_medicine_dto_1 = require("./create-medicine.dto");
class UpdateMedicineDto extends (0, mapped_types_1.PartialType)(create_medicine_dto_1.CreateMedicineDto) {
}
exports.UpdateMedicineDto = UpdateMedicineDto;
//# sourceMappingURL=update-medicine.dto.js.map