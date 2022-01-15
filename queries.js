const Pool = require('pg').Pool
const pool = new Pool({
  connectionString: "postgres://twviwytdgumecr:704b9ba05afdb529678955f3e0223f07515a7f41167ecdaefd1952b5a817f1c1@ec2-54-77-182-219.eu-west-1.compute.amazonaws.com:5432/da8gf7ls09bs64",
  ssl: {
    rejectUnauthorized: false
  }
})

const get_treatments = (request, response) => {
    pool.query('SELECT treatmentid, treatmentinfo, treatmentdate,treatmenttime,workeremail,carnumber FROM treatments;',[], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows);
    })
}

module.exports = {
  get_treatments,
}