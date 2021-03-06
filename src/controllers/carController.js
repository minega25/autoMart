import _ from 'lodash';
import jwt from 'jsonwebtoken';
import config from 'config';
import Car from '../models/Car';

const cars = new Car();

// Handle car create on POST.
export const carCreatePost = async (req, res) => {
  req.newCar.owner = req.user.id;
  req.newCar.email = req.user.email;
  const addedCar = await cars.add(req.newCar);
  const response = {
    status: 201,
    message: 'Car successfully created',
    data: _.pick(addedCar, ['id', 'email', 'state', 'status', 'price', 'createdDate', 'manufacturer']),
  };
  console.log(addedCar);
  return res.status(201).json(response);
};

export const updateCarStatus = async (req, res) => {
  //  Find car
  const car = await cars.findById(req.uuid);
  if (!car) {
    const response = {
      status: 400,
      error: 'Car does not exist',
    };
    return res.status(400).json(response);
  }

  // Update car
  if (car.status === 'available') {
    await cars.update(req.uuid, 'sold');
  } else {
    await cars.update(req.uuid, 'available');
  }
  const UpdatedCar = await cars.findById(req.uuid);
  const response = {
    status: 200,
    message: 'Car status updated successfully',
    data: _.pick(UpdatedCar, ['id', 'email', 'created_on', 'manufacturer', 'model', 'price', 'state', 'status']),
  };
  return res.status(200).json(response);
};

export const updateCarPrice = async (req, res) => {
  //  Find car
  const car = await cars.findById(req.uuid);
  if (!car) {
    const response = {
      status: 400,
      error: 'Car does not exist',
    };
    return res.status(400).json(response);
  }

  // Update price
  await cars.updatePrice(req.uuid, req.price);
  const updatedCar = await cars.findById(req.uuid);
  const response = {
    status: 200,
    message: 'Car price updated successfully',
    data: _.pick(updatedCar, ['id', 'email', 'state', 'status', 'price', 'createdDate', 'model', 'manufacturer']),
  };
  return res.status(200).json(response);
};

export const getCar = async (req, res) => {
  //  Find car
  const car = await cars.findById(req.uuid);
  if (!car) {
    const response = {
      status: 400,
      error: 'Car does not exist',
    };
    return res.status(400).json(response);
  }
  // return car details to client
  const response = {
    status: 200,
    data: _.pick(car,
      ['id', 'email', 'state', 'status',
        'price', 'createdDate', 'manufacturer', 'model', 'body_type']),
  };
  return res.status(200).json(response);
};

export const getCars = async (req, res) => {
  if (req.query) {
    if (req.query.status === 'available') {
      if (req.query.min_price && req.query.max_price) {
        // eslint-disable-next-line camelcase
        const { min_price, max_price } = req.query;
        const min = Math.min(min_price, max_price);
        const max = Math.max(min_price, max_price);
        const result = await cars.findByPrice(min, max);

        // return car details to client
        const response = {
          status: 200,
          data: _.map(result, _.partialRight(_.pick,
            ['id', 'email', 'state', 'status',
              'price', 'createdDate', 'manufacturer',
              'model', 'body_type'])),
        };
        return res.status(200).json(response);
      }
      if (req.query.min_price) {
        const result = cars.findByMin(req.query.min_price);

        // return car details to client
        const response = {
          status: 200,
          data: _.map(result, _.partialRight(_.pick,
            ['id', 'email', 'state', 'status',
              'price', 'createdDate', 'manufacturer',
              'model', 'body_type'])),
        };
        return res.status(200).json(response);
      }
      if (req.query.max_price) {
        const result = cars.findByMax(req.query.max_price);

        // return car details to client
        const response = {
          status: 200,
          data: _.map(result, _.partialRight(_.pick,
            ['id', 'email', 'state', 'status',
              'price', 'createdDate', 'manufacturer',
              'model', 'body_type'])),
        };
        return res.status(200).json(response);
      }
      if (req.query.state) {
        const state = String(req.query.state);
        const isValidState = state === 'new' || state === 'used';
        if (!isValidState) {
          const response = {
            status: 400,
            error: 'Invalid car state value',
          };
          return res.status(400).json(response);
        }
        const results = await cars.findByState(state);
        const response = {
          status: 200,
          data: _.map(results, _.partialRight(_.pick,
            ['id', 'email', 'state', 'status',
              'price', 'createdDate', 'manufacturer',
              'model', 'body_type'])),
        };
        return res.status(200).json(response);
      }
      const allUnsoldCars = await cars.findUnsold();
      // return car details to client
      const response = {
        status: 200,
        data: _.map(allUnsoldCars, _.partialRight(_.pick,
          ['id', 'email', 'state', 'status',
            'price', 'createdDate', 'manufacturer',
            'model', 'body_type'])),
      };
      return res.status(200).json(response);
    }
  }
  const token = req.header('x-auth-token');
  if (token) {
    try {
      const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
      if (!decoded.isAdmin) {
        return res.status(403).send({ status: 403, data: 'Unathorized access.' });
      // eslint-disable-next-line no-else-return
      } else {
        const allCars = await cars.findAll();
        // return car details to client
        const response = {
          status: 200,
          data: _.map(allCars, _.partialRight(_.pick,
            ['id', 'email', 'state', 'status',
              'price', 'createdDate', 'manufacturer',
              'model', 'body_type'])),
        };
        return res.status(200).json(response);
      }
    } catch (ex) {
      return res.status(400).send({ status: 400, error: 'Invalid token.' });
    }
  } else {
    return res.status(400).send({ status: 400, data: 'No token provided' });
  }
};

export const deleteCar = async (req, res) => {
  //  Find car
  const car = await cars.findById(req.uuid);
  if (!car) {
    const response = {
      status: 400,
      error: 'Car does not exist',
    };
    return res.status(400).json(response);
  }
  if (!req.user.isAdmin) {
    if (req.user.id === car.owner) {
      // delete car
      await cars.delete(req.uuid);
      const response = {
        status: 200,
        data: 'Car Ad successfully deleted',
      };
      return res.status(200).json(response);
    }
    return res.status(403).send({ status: 403, data: 'Unathorized access.' });
  }
  // delete car
  await cars.delete(req.uuid);
  const response = {
    status: 200,
    data: 'Car Ad successfully deleted',
  };
  return res.status(200).json(response);
};
export const car = cars;
