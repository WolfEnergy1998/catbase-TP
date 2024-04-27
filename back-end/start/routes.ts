/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.group(() => {
  Route.post('register', 'AuthController.register')
  Route.post('login', 'AuthController.login')
  Route.post('logout', 'AuthController.logout').middleware('auth')
  Route.get('me', 'AuthController.me').middleware('auth')
  Route.get('verify/:code', 'AuthController.verifyUser')
}).prefix('auth')

Route.group(() => {
  Route.get('/all', 'AuthController.getRoles').middleware('auth')
}).prefix('roles')

Route.group(() => {
  Route.get('/:id', 'CatController.getCat')
  Route.post('/', 'CatController.createCat').middleware('auth').middleware('admin')
  Route.put('/:id', 'CatController.updateCat').middleware('auth').middleware('admin')
  Route.delete('/:id', 'CatController.deleteCat').middleware('auth').middleware('admin')
  Route.get('/pedigree/:id?:gen', 'CatController.getPedigree')
  Route.get('/offsprings/:id', 'CatController.getOffsprings')
  Route.get('/foundation/:id', 'CatController.getFoundation')
  Route.post('/all', 'CatController.getCats')
  Route.post('/names/:character', 'CatController.getCatNamesByAlphabet')
  Route.post('/import/', 'ImportController.importCsv').middleware('auth').middleware('admin')
  Route.post('/importDeduplication/', 'DeduplicationController.importDeduplication').middleware('auth').middleware('admin')
  Route.post('/runDeduplication/', 'DeduplicationController.runDeduplication').middleware('auth').middleware('admin')
  Route.get('/pedigree/pdf/:id', 'PdfController.getPedigreePdf')
  Route.post('/countCats', 'CatController.countCats')
}).prefix('cats')

Route.group(() => {
  Route.get('/all/', 'BreedController.getBreeds')
  Route.post('/', 'BreedController.createBreed').middleware('auth').middleware('superadmin')
  Route.put('/:id', 'BreedController.updateBreed').middleware('auth').middleware('superadmin')
  Route.delete('/:id', 'BreedController.deleteBreed').middleware('auth').middleware('superadmin')
}).prefix('breeds')

Route.group(() => {
  Route.get('/all/', 'UserController.getUsers').middleware('auth').middleware('superadmin')
  Route.delete('/:id', 'UserController.deleteUser').middleware('auth').middleware('superadmin')
  Route.put('/:id', 'UserController.updateUser').middleware('auth').middleware('superadmin')
}).prefix('users')

Route.group(() => {
  Route.get('/breeds', 'StatsController.groupByBreeds')
  Route.get('/year', 'StatsController.groupByYear')
  Route.get('/country', 'StatsController.groupByCurrentCountry')
  Route.get('/getCatYears', 'StatsController.getCatYears')
  Route.post('/getBreedCount', 'StatsController.getBreedCount')
  Route.post('/getBreedYearCount', 'StatsController.getBreedYearCount')
}).prefix('stats')

Route.group(() => {
  Route.get('/get/cron/:cron', 'LogsController.getLogsByCron')
  Route.get('/get/event/:event', 'LogsController.getLogsByEvent')
  // Route.post('/create', 'LogsController.createLog')
}).prefix('logs')

