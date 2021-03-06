/* eslint-disable class-methods-use-this */
/* eslint-disable no-else-return */
import moment from 'moment';
import uuid from 'uuid';
import Query from '../helpers/dbquery';

class Car {
  constructor() {
    this.cars = [];
  }

  // Add car in fleet
  async add(data) {
    // Query string
    const insertCar = `INSERT INTO cars(id,owner,email,state,status,price,manufacturer,model,body_type,createddate,modifieddate) 
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) returning *`;

    const car = {
      id: uuid.v4(),
      owner: data.owner || '',
      email: data.email || '',
      state: data.state || '',
      status: data.status || 'available',
      price: data.price || '',
      manufacturer: data.manufacturer || '',
      model: data.model || '',
      body_type: data.body_type || '',
      createdDate: moment().format(),
      modifiedDate: moment().format(),
    };
    const carArr = Object.keys(car).map(u => car[u]);
    const { rows } = await Query(insertCar, carArr);
    return rows[0];
  }

  // Find car by Id
  async findById(id) {
    const query = 'SELECT * FROM cars WHERE id=$1';
    const { rows } = await Query(query, [id]);
    return rows[0];
  }

  findByMin(min) {
    const minPrice = parseInt(min, 10);
    const result = this.cars.filter((car) => {
      if (car.status === 'available') {
        if ((car.price >= minPrice)) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    });
    return result;
  }

  findByMax(max) {
    const maxPrice = parseInt(max, 10);
    const result = this.cars.filter((car) => {
      if (car.status === 'available') {
        if ((car.price <= maxPrice)) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    });
    return result;
  }

  async findByState(state) {
    const query = 'SELECT * FROM cars WHERE status=$1 AND state=$2';
    const { rows } = await Query(query, ['available', state]);
    return rows;
  }

  // Find all cars
  async findAll() {
    const query = 'SELECT * FROM cars';
    const { rows } = await Query(query, []);
    return rows;
  }

  // Find all unsold cars
  async findUnsold() {
    const query = 'SELECT * FROM cars WHERE status=$1';
    const { rows } = await Query(query, ['available']);
    return rows;
  }

  // Find all unsold cars in a fleet within a price range
  async findByPrice(min, max) {
    const minPrice = parseInt(min, 10);
    const maxPrice = parseInt(max, 10);
    const query = 'SELECT * FROM cars WHERE price>=$1 AND price<=$2';
    const { rows } = await Query(query, [minPrice, maxPrice]);

    return rows;
  }

  // Update car
  async update(id, data) {
    const priceUpdate = 'UPDATE cars SET status=$1,modifieddate=$2 WHERE id=$3';
    const response = await Query(priceUpdate, [data, moment().format(), id]);

    return response;
  }

  async updatePrice(id, data) {
    const priceUpdate = 'UPDATE cars SET price=$1,modifieddate=$2 WHERE id=$3';
    const response = await Query(priceUpdate, [data, moment().format(), id]);

    return response;
  }

  // Delete car by id
  async delete(id) {
    const query = 'DELETE FROM cars WHERE id=$1';
    const result = await Query(query, [id]);
    return result;
  }
}

export default Car;
