const sequelize = require('./sequelize');
const Sequelize = require('sequelize');

//---------------------------------------------用户部分-----------------------------------------------------

/*用户表：
手机号，密码，昵称，token,type(账户类型，1为普通用户，2位商家,3为配送员)，年龄，性别，余额
隐藏方法：店铺们，地址们，购物车们，订单们，订单商品，账单(支出账单，收入账单)
 */
const User = sequelize.define('user', {
    phone: {
        type: Sequelize.STRING,
        unique: true                    //唯一性约束
    },
    pass: {
        type: Sequelize.STRING,
        allowNull: false
    },
    alias: {
        type: Sequelize.STRING
    },
    token: {
        type: Sequelize.STRING
    },
    type: {
        type: Sequelize.INTEGER,
        defaultValue: 1
    },
    age: Sequelize.INTEGER,
    sex: {
        type: Sequelize.ENUM,
        values: ['男', '女', '未知'],
        defaultValue: '未知'
    },
    money: {
        type: Sequelize.FLOAT,
        defaultValue: 0.00
    }
}, {
    freezeTableName: true
});


/*地址表：
收货人姓名，手机号，地址，是否为默认地址
外键：用户
隐藏方法：订单们
 */
const Address = sequelize.define('address', {
    name: {
        type: Sequelize.STRING,
    },
    phone: {
        type: Sequelize.STRING,
    },
    addr: {
        type: Sequelize.STRING,
    },
    isDefault: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }

}, {
    freezeTableName: true
});


//---------------------------------------------商品部分-----------------------------------------------------

/*商品表：
名称,价格，描述，图片,库存，销量，自定义分类,是否为活动商品，原价
外键：商品平台类别表、商店、商品本店类别表
隐藏方法：图片们，购物车们
 */
const Goods = sequelize.define('goods', {
    name: {
        type: Sequelize.STRING,
    },
    price: {
        type: Sequelize.FLOAT
    },
    desc: {
        type: Sequelize.STRING
    },
    imgUrl: {
        type: Sequelize.STRING,
    },
    stock: {
        type: Sequelize.STRING,
    },
    volume: {
        type: Sequelize.STRING
    },
    isDiscount: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    original: Sequelize.FLOAT,
    online: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
    },
}, {
    freezeTableName: true
});

//商品平台类别表：名称、图片
//隐藏方法：商品们
const GoodsType = sequelize.define('goodsType', {
    name: {
        type: Sequelize.STRING,
    },
    img: {
        type: Sequelize.STRING,
    }
}, {
    freezeTableName: true
});


//商品本店类别表：名称、图片
//外键：商店
//隐藏方法：商品们
const Custom = sequelize.define('custom', {
    name: {
        type: Sequelize.STRING,
    },
    img: {
        type: Sequelize.STRING,
    }
}, {
    freezeTableName: true
});

//商品图片表：图片
//外键：商品
const GoodsImg = sequelize.define('goodsImg', {
    img: Sequelize.STRING,
}, {
    freezeTableName: true
});

//店铺表：名称、图片、地址、电话
//外键：用户表（拥有者id）
//隐藏方法：商品们,订单货物们，自定义分类们
const Store = sequelize.define('store', {
    name: Sequelize.STRING,
    img: Sequelize.STRING,
    addr: Sequelize.STRING,
    phone: Sequelize.STRING,
}, {
    freezeTableName: true
});

//---------------------------------------------购物部分-----------------------------------------------------

//购物车表：单个商品购买数量
//外键：用户，商品
const Cart = sequelize.define('cart', {
    num: Sequelize.INTEGER,
}, {
    freezeTableName: true
});

//订单表：总金额，支付方式,配送员(外键用户表)，状态(待支付，待接单，待收货，待评价，已完成)
//外键：地址、用户(顾客，配送员)
const Order = sequelize.define('order', {
    total: Sequelize.FLOAT,
    payment: Sequelize.STRING,
    state: {
        type: Sequelize.ENUM,
        // values: ['待支付', '待接单', '待收货', '待评价', '已完成'],
        values: ['0', '1', '2', '3', '4'],
        defaultValue: '0'
    }

}, {
    freezeTableName: true
});

//订单商品表：数量，评价,星级,状态(待支付，待接单，待收货，待评价，已完成)
//外键：订单，商品,用户，商店
//隐藏方法：getBill
const OrderGoods = sequelize.define('orderGoods', {
    num: Sequelize.INTEGER,
    evaluate: Sequelize.STRING,
    start: Sequelize.INTEGER,
    state: {
        type: Sequelize.ENUM,
        // values: ['待支付', '待接单', '待收货', '待评价', '已完成'],
        values: ['0', '1', '2', '3', '4'],
        defaultValue: '0'
    }

}, {
    freezeTableName: true
});


//---------------------------------------------金钱部分-----------------------------------------------------

//账单表：金额,操作(1为转账)，
//外键：发起用户，目标用户，订单货物
const Bill = sequelize.define('bill', {
    money: Sequelize.FLOAT,
    type: {
        type: Sequelize.INTEGER,
        defaultValue: 1
    }
}, {
    freezeTableName: true
});


//---------------------------------------------表与表主外键关系-----------------------------------------------------

//数据库表关联关系


Address.belongsTo(User);
User.hasMany(Address);

Goods.belongsTo(GoodsType);
GoodsType.hasMany(Goods);

Goods.belongsTo(Custom);
Custom.hasMany(Goods);

Custom.belongsTo(Store);
Store.hasMany(Custom);

GoodsImg.belongsTo(Goods);
Goods.hasMany(GoodsImg);

Store.belongsTo(User);
User.hasOne(Store);

Goods.belongsTo(Store);
Store.hasMany(Goods);

Cart.belongsTo(User);
User.hasMany(Cart);

Cart.belongsTo(Goods);
Goods.hasMany(Cart);

Order.belongsTo(Address);
Address.hasMany(Order);

Order.belongsTo(User, {
    as: 'owner',
    foreignKey: 'ownerId',
    targetKey: 'id'
});
User.hasMany(Order, {
    as: 'Orders',
    foreignKey: 'ownerId',
    sourceKey: 'id'
});

Order.belongsTo(User, {
    as: 'courier',
    foreignKey: 'courierId',
    targetKey: 'id'
});
User.hasMany(Order, {
    as: 'Achievement',
    foreignKey: 'courierId',
    sourceKey: 'id'
});

OrderGoods.belongsTo(Order);
Order.hasMany(OrderGoods);

OrderGoods.belongsTo(Goods);
Goods.hasMany(OrderGoods);

OrderGoods.belongsTo(Store);
Store.hasMany(OrderGoods);

OrderGoods.belongsTo(User);
User.hasMany(OrderGoods);


Bill.belongsTo(User, {
    as: 'from',
    foreignKey: 'fromId',
    targetKey: 'id'
});
User.hasMany(Bill, {
    as: 'Spend',
    foreignKey: 'fromId',
    sourceKey: 'id'
});

Bill.belongsTo(User, {
    as: 'to',
    foreignKey: 'toId',
    targetKey: 'id'
});
User.hasMany(Bill, {
    as: 'Income',
    foreignKey: 'toId',
    sourceKey: 'id'
});


Bill.belongsTo(OrderGoods);
OrderGoods.hasOne(Bill);


//---------------------------------------------模块导出-----------------------------------------------------


module.exports = {
    User, Address,
    Goods, GoodsImg, GoodsType, Store,Custom,
    Cart, Order, OrderGoods,
    Bill
};