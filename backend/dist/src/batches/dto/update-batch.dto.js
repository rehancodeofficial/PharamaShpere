"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBatchDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_batch_dto_1 = require("./create-batch.dto");
class UpdateBatchDto extends (0, mapped_types_1.PartialType)(create_batch_dto_1.CreateBatchDto) {
}
exports.UpdateBatchDto = UpdateBatchDto;
//# sourceMappingURL=update-batch.dto.js.map