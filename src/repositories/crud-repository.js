const { where } = require("sequelize");

class CrudRepository {
    constructor(model){
       this.model = model;
    }

     async create(data){
          const response  = await this.model.create(data);
          return response;
     }

    async getAll(){
        const response = await this.model.findAll();
        return response;
}


async get(id){
    const response = await this.model.findByPk(id);
      if(!response){
        throw new Error('Not Found');
      }
      return response;
    }

async destroy(id){
       const response = await this.model.destroy({
        where : {
            id
        }
       });
       if(!response){
        throw new Error("Not found"); 
    }
       return response;
}


  async update(id , data){
        const response  = await  this.model.update(data ,{where : {id}});
        if(!response){
            throw new Error('Not Found');
        }

        return response;
  }




}

module.exports = CrudRepository;