"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeController = void 0;
const database_1 = __importDefault(require("../config/database"));
const logger_1 = __importDefault(require("../utils/logger"));
class HomeController {
    constructor() {
        this.getOrderById = async (req, res) => {
            try {
                const { id } = req.params;
                const orderId = parseInt(id, 10);
                if (isNaN(orderId)) {
                    res.status(400).json({
                        success: false,
                        error: 'Invalid order ID'
                    });
                    return;
                }
                const order = await database_1.default.order.findUnique({
                    where: { id: orderId },
                    include: {
                        createdBy: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                                lastName: true,
                                phoneNumber: true
                            }
                        },
                        driver: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        email: true,
                                        name: true,
                                        lastName: true,
                                        phoneNumber: true
                                    }
                                },
                                transportDivision: true
                            }
                        },
                        route: {
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
                            }
                        },
                        orderHasRoutes: {
                            include: {
                                route: {
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
                                    }
                                }
                            }
                        },
                        deliveryConfirmations: true
                    }
                });
                if (!order) {
                    res.status(404).json({
                        success: false,
                        error: 'Order not found'
                    });
                    return;
                }
                res.json({
                    success: true,
                    data: order
                });
            }
            catch (error) {
                logger_1.default.error('Get order by ID error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        };
        this.setUserAvailability = async (req, res) => {
            try {
                const { available } = req.body;
                const userId = req.user.id;
                if (typeof available !== 'boolean') {
                    res.status(400).json({
                        success: false,
                        error: 'Available status must be a boolean'
                    });
                    return;
                }
                const driver = await database_1.default.driver.findFirst({
                    where: { userId }
                });
                if (!driver) {
                    res.status(404).json({
                        success: false,
                        error: 'Driver profile not found'
                    });
                    return;
                }
                await database_1.default.driver.update({
                    where: { id: driver.id },
                    data: { available }
                });
                res.json({
                    success: true,
                    data: { available },
                    message: `Availability set to ${available ? 'available' : 'unavailable'}`
                });
            }
            catch (error) {
                logger_1.default.error('Set user availability error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        };
        this.getDriverOrders = async (req, res) => {
            try {
                const userId = req.user.id;
                const { page = 1, take = 10, today = true, differentFromToday = false } = req.query;
                const pageNum = parseInt(page.toString(), 10);
                const takeNum = parseInt(take.toString(), 10);
                const skip = (pageNum - 1) * takeNum;
                const driver = await database_1.default.driver.findFirst({
                    where: { userId }
                });
                if (!driver) {
                    res.status(404).json({
                        success: false,
                        error: 'Driver profile not found'
                    });
                    return;
                }
                let dateFilter = {};
                if (today) {
                    const todayStart = new Date();
                    todayStart.setHours(0, 0, 0, 0);
                    const todayEnd = new Date();
                    todayEnd.setHours(23, 59, 59, 999);
                    dateFilter = {
                        assignmentDate: {
                            gte: todayStart,
                            lte: todayEnd
                        }
                    };
                }
                else if (differentFromToday) {
                    const todayStart = new Date();
                    todayStart.setHours(0, 0, 0, 0);
                    dateFilter = {
                        assignmentDate: {
                            lt: todayStart
                        }
                    };
                }
                const [orders, total] = await Promise.all([
                    database_1.default.order.findMany({
                        where: {
                            driverId: driver.id,
                            ...dateFilter
                        },
                        include: {
                            createdBy: {
                                select: {
                                    id: true,
                                    email: true,
                                    name: true,
                                    lastName: true,
                                    phoneNumber: true
                                }
                            },
                            driver: {
                                include: {
                                    user: {
                                        select: {
                                            id: true,
                                            email: true,
                                            name: true,
                                            lastName: true,
                                            phoneNumber: true
                                        }
                                    },
                                    transportDivision: true
                                }
                            },
                            route: {
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
                                }
                            },
                            orderHasRoutes: {
                                include: {
                                    route: {
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
                                        }
                                    }
                                }
                            },
                            deliveryConfirmations: true
                        },
                        orderBy: {
                            createdAt: 'desc'
                        },
                        skip,
                        take: takeNum
                    }),
                    database_1.default.order.count({
                        where: {
                            driverId: driver.id,
                            ...dateFilter
                        }
                    })
                ]);
                const totalPages = Math.ceil(total / takeNum);
                const response = {
                    data: orders,
                    pagination: {
                        page: pageNum,
                        take: takeNum,
                        total,
                        totalPages
                    }
                };
                res.json({
                    success: true,
                    data: response
                });
            }
            catch (error) {
                logger_1.default.error('Get driver orders error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        };
        this.createOrder = async (req, res) => {
            try {
                const { orderNumber, bolNumber, rate, instructions, weight, driverId, material, date, startTime, endTime, routeId } = req.body;
                const userId = req.user.id;
                if (!orderNumber || !bolNumber || !rate || !instructions || !weight || !driverId || !material || !date || !startTime || !endTime || !routeId) {
                    res.status(400).json({
                        success: false,
                        error: 'All fields are required'
                    });
                    return;
                }
                const existingOrder = await database_1.default.order.findUnique({
                    where: { orderNumber }
                });
                if (existingOrder) {
                    res.status(409).json({
                        success: false,
                        error: 'Order number already exists'
                    });
                    return;
                }
                const driver = await database_1.default.driver.findUnique({
                    where: { id: driverId }
                });
                if (!driver) {
                    res.status(404).json({
                        success: false,
                        error: 'Driver not found'
                    });
                    return;
                }
                const route = await database_1.default.route.findUnique({
                    where: { id: routeId }
                });
                if (!route) {
                    res.status(404).json({
                        success: false,
                        error: 'Route not found'
                    });
                    return;
                }
                const assignmentDate = new Date(`${date}T${startTime}:00`);
                const order = await database_1.default.order.create({
                    data: {
                        orderNumber,
                        bolNumber,
                        rate,
                        instructions,
                        weight,
                        assignmentDate,
                        driverId,
                        routeId,
                        material,
                        startTime,
                        endTime,
                        createdById: userId,
                        status: 'ASSIGNED'
                    },
                    include: {
                        createdBy: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                                lastName: true,
                                phoneNumber: true
                            }
                        },
                        driver: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        email: true,
                                        name: true,
                                        lastName: true,
                                        phoneNumber: true
                                    }
                                },
                                transportDivision: true
                            }
                        },
                        route: {
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
                            }
                        }
                    }
                });
                res.status(201).json({
                    success: true,
                    data: order,
                    message: 'Order created successfully'
                });
            }
            catch (error) {
                logger_1.default.error('Create order error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        };
    }
}
exports.HomeController = HomeController;
