"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteTypesController = exports.WorkPlantsController = exports.RoutesController = void 0;
const database_1 = __importDefault(require("../config/database"));
const logger_1 = __importDefault(require("../utils/logger"));
class RoutesController {
    constructor() {
        this.getRoutes = async (req, res) => {
            try {
                const routes = await database_1.default.route.findMany({
                    include: {
                        routeType: true,
                        pickWorkPlant: {
                            include: {
                                address: {
                                    include: {
                                        city: {
                                            include: {
                                                state: true
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        dropWorkPlant: {
                            include: {
                                address: {
                                    include: {
                                        city: {
                                            include: {
                                                state: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        id: 'asc'
                    }
                });
                res.json({
                    success: true,
                    data: routes
                });
            }
            catch (error) {
                logger_1.default.error('Get routes error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        };
        this.getRouteById = async (req, res) => {
            try {
                const { id } = req.params;
                const routeId = parseInt(id, 10);
                if (isNaN(routeId)) {
                    res.status(400).json({
                        success: false,
                        error: 'Invalid route ID'
                    });
                    return;
                }
                const route = await database_1.default.route.findUnique({
                    where: { id: routeId },
                    include: {
                        routeType: true,
                        pickWorkPlant: {
                            include: {
                                address: {
                                    include: {
                                        city: {
                                            include: {
                                                state: true
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        dropWorkPlant: {
                            include: {
                                address: {
                                    include: {
                                        city: {
                                            include: {
                                                state: true
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        orders: {
                            include: {
                                driver: {
                                    include: {
                                        user: {
                                            select: {
                                                id: true,
                                                email: true,
                                                name: true,
                                                lastName: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
                if (!route) {
                    res.status(404).json({
                        success: false,
                        error: 'Route not found'
                    });
                    return;
                }
                res.json({
                    success: true,
                    data: route
                });
            }
            catch (error) {
                logger_1.default.error('Get route by ID error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        };
    }
}
exports.RoutesController = RoutesController;
class WorkPlantsController {
    constructor() {
        this.getWorkPlants = async (req, res) => {
            try {
                const workPlants = await database_1.default.workPlant.findMany({
                    include: {
                        address: {
                            include: {
                                city: {
                                    include: {
                                        state: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        name: 'asc'
                    }
                });
                res.json({
                    success: true,
                    data: workPlants
                });
            }
            catch (error) {
                logger_1.default.error('Get work plants error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        };
        this.getWorkPlantById = async (req, res) => {
            try {
                const { id } = req.params;
                const workPlantId = parseInt(id, 10);
                if (isNaN(workPlantId)) {
                    res.status(400).json({
                        success: false,
                        error: 'Invalid work plant ID'
                    });
                    return;
                }
                const workPlant = await database_1.default.workPlant.findUnique({
                    where: { id: workPlantId },
                    include: {
                        address: {
                            include: {
                                city: {
                                    include: {
                                        state: true
                                    }
                                }
                            }
                        }
                    }
                });
                if (!workPlant) {
                    res.status(404).json({
                        success: false,
                        error: 'Work plant not found'
                    });
                    return;
                }
                res.json({
                    success: true,
                    data: workPlant
                });
            }
            catch (error) {
                logger_1.default.error('Get work plant by ID error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        };
    }
}
exports.WorkPlantsController = WorkPlantsController;
class RouteTypesController {
    constructor() {
        this.getRouteTypes = async (req, res) => {
            try {
                const routeTypes = await database_1.default.routeType.findMany({
                    orderBy: {
                        name: 'asc'
                    }
                });
                res.json({
                    success: true,
                    data: routeTypes
                });
            }
            catch (error) {
                logger_1.default.error('Get route types error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        };
    }
}
exports.RouteTypesController = RouteTypesController;
