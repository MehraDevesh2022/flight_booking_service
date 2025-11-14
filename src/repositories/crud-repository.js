const { AppError } = require("../utils");
const { StatusCodes } = require("http-status-codes")


class CrudRepository {

    constructor(model) {
        this.model = model;
    }




    async create(data , t =null) {
        const response = await this.model.create(data , {transaction : t});
        return response;
    }
     

    async get(id) {
        const response = await this.model.findByPk(id);
        if (!response) {
            throw new AppError(["Not able to found resource."], StatusCodes.NOT_FOUND)
        }
        return response

    }

    async getAll() {
        const response = await this.model.findAll();
        return response;
    }


    async destory(id) {
        const response = await this.model.destroy({
            where: {
                id: id
            }
        });
        if (!response) {
            if (!response) {
                throw new AppError(["Not able to found resource."], StatusCodes.NOT_FOUND)
            }
        }
    }


    async update(id, data) { // data => {col: value, ....}

        const response = await this.model.update(data, {
            where: {
                id: id
            }
        });
        if (!response) {
            throw new AppError(["Not able to found resource."], StatusCodes.NOT_FOUND)
        }
        return response;

    }

}


module.exports = CrudRepository