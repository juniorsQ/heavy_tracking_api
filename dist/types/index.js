"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationType = exports.OrderStatus = void 0;
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["ASSIGNED"] = "ASSIGNED";
    OrderStatus["IN_PROGRESS"] = "IN_PROGRESS";
    OrderStatus["COMPLETED"] = "COMPLETED";
    OrderStatus["CANCELLED"] = "CANCELLED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var VerificationType;
(function (VerificationType) {
    VerificationType["EMAIL_VERIFICATION"] = "EMAIL_VERIFICATION";
    VerificationType["PASSWORD_RECOVERY"] = "PASSWORD_RECOVERY";
})(VerificationType || (exports.VerificationType = VerificationType = {}));
