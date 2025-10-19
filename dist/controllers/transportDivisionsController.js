"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransportDivisionsController = void 0;
const database_1 = __importDefault(require("../config/database"));
const logger_1 = __importDefault(require("../utils/logger"));
class TransportDivisionsController {
    constructor() {
        this.getTransportDivisions = async (req, res) => {
            try {
                const transportDivisions = [
                    {
                        id: 1,
                        name: 'South Florida Division',
                        description: 'Covers Miami-Dade, Broward, and Palm Beach counties',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    },
                    {
                        id: 2,
                        name: 'Central Florida Division',
                        description: 'Covers Orange, Seminole, and Osceola counties',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    },
                    {
                        id: 3,
                        name: 'North Florida Division',
                        description: 'Covers Jacksonville, Gainesville, and Tallahassee areas',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                ];
                res.json({
                    success: true,
                    data: transportDivisions
                });
            }
            catch (error) {
                logger_1.default.error('Get transport divisions error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        };
        this.getTransportDivisionById = async (req, res) => {
            try {
                const { id } = req.params;
                const divisionId = parseInt(id, 10);
                if (isNaN(divisionId)) {
                    res.status(400).json({
                        success: false,
                        error: 'Invalid transport division ID'
                    });
                    return;
                }
                const transportDivision = await database_1.default.transportDivision.findUnique({
                    where: { id: divisionId },
                    include: {
                        drivers: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        email: true,
                                        name: true,
                                        lastName: true,
                                        phoneNumber: true
                                    }
                                }
                            }
                        }
                    }
                });
                if (!transportDivision) {
                    res.status(404).json({
                        success: false,
                        error: 'Transport division not found'
                    });
                    return;
                }
                res.json({
                    success: true,
                    data: transportDivision
                });
            }
            catch (error) {
                logger_1.default.error('Get transport division by ID error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        };
    }
}
exports.TransportDivisionsController = TransportDivisionsController;
