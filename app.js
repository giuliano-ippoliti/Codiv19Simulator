const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const expressValidator =require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const { check, validationResult } = require('express-validator');

// Init app
const app = express();

// Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

//messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Home route
app.get('/', (req, res) => {
  res.render('index', {
    title:'Distribution des ages',
  });
});

// Add route
app.get('/calc', function(req, res) {
  res.render('calc', {
    title:'Résultats'
  });
});

// Submit route (withMessage logs server-side)
app.post('/calc',
 [
  check('t1').isNumeric().withMessage('Nombre requis'),
  check('t2').isNumeric().withMessage('Nombre requis'),
  check('t3').isNumeric().withMessage('Nombre requis'),
  check('t4').isNumeric().withMessage('Nombre requis'),
  check('t5').isNumeric().withMessage('Nombre requis'),
  check('t6').isNumeric().withMessage('Nombre requis'),
  check('t7').isNumeric().withMessage('Nombre requis'),
  check('t8').isNumeric().withMessage('Nombre requis'),
  check('p1').isNumeric().withMessage('Nombre requis'),
  check('p2').isNumeric().withMessage('Nombre requis'),
  check('p3').isNumeric().withMessage('Nombre requis'),
  check('p4').isNumeric().withMessage('Nombre requis'),
  check('p5').isNumeric().withMessage('Nombre requis'),
  check('p6').isNumeric().withMessage('Nombre requis'),
  check('p7').isNumeric().withMessage('Nombre requis'),
  check('p8').isNumeric().withMessage('Nombre requis'),
 ],
  (req,res,next) => {

  const errors = validationResult(req);
  console.log(errors);
  let distribution = {};

  if (!errors.isEmpty()) {
    console.log(errors);
    res.render('index',
      {
        title:'Résultats',
        errors: errors.mapped()
      });
  }
  else {
    distribution.t1 = {
      "count": parseInt(req.body.t1, 10),
      "prob": (parseFloat(req.body.p1) / 100.0)
    };
    distribution.t2 = {
      "count": parseInt(req.body.t2, 10),
      "prob": (parseFloat(req.body.p2) / 100.0)
    };
    distribution.t3 = {
      "count": parseInt(req.body.t3, 10),
      "prob": (parseFloat(req.body.p3) / 100.0)
    };
    distribution.t4 = {
      "count": parseInt(req.body.t4, 10),
      "prob": (parseFloat(req.body.p4) / 100.0)
    };
    distribution.t5 = {
      "count": parseInt(req.body.t5, 10),
      "prob": (parseFloat(req.body.p5) / 100.0)
    };
    distribution.t6 = {
      "count": parseInt(req.body.t6, 10),
      "prob": (parseFloat(req.body.p6) / 100.0)
    };
    distribution.t7 = {
      "count": parseInt(req.body.t7, 10),
      "prob": (parseFloat(req.body.p7) / 100.0)
    };
    distribution.t8 = {
      "count": parseInt(req.body.t8, 10),
      "prob": (parseFloat(req.body.p8) / 100.0)
    };

    // Calculations
    for (let [key, value] of Object.entries(distribution)) {
      distribution[key].stats = {};
      for (let contamination_rate = 5; contamination_rate <= 100; contamination_rate+=5){
        let count = value.count;
        let prob = value.prob;

        let contaminated = count * (contamination_rate/100);
        let avg_deaths = contaminated * prob;
        let prob_no_death = (1-prob) ** contaminated;

        let stats = {
          "contaminated": contaminated,
          "avg_deaths": avg_deaths,
          "prob_no_death": prob_no_death,
        };

        distribution[key].stats[contamination_rate] = stats;
      }
    }

    // Now build object for rendering (20 lines)
    let result = {};

    for (let contamination_rate = 5; contamination_rate <= 100; contamination_rate+=5){
      result[contamination_rate] = {};
      result[contamination_rate].avg_deaths = Number(distribution.t1.stats[contamination_rate].avg_deaths +
                                                distribution.t2.stats[contamination_rate].avg_deaths +
                                                distribution.t3.stats[contamination_rate].avg_deaths +
                                                distribution.t4.stats[contamination_rate].avg_deaths +
                                                distribution.t5.stats[contamination_rate].avg_deaths +
                                                distribution.t6.stats[contamination_rate].avg_deaths +
                                                distribution.t7.stats[contamination_rate].avg_deaths +
                                                distribution.t8.stats[contamination_rate].avg_deaths).toFixed(2);

      result[contamination_rate].prob_no_death = Number(100*distribution.t1.stats[contamination_rate].prob_no_death *
                                                  distribution.t2.stats[contamination_rate].prob_no_death *
                                                  distribution.t3.stats[contamination_rate].prob_no_death *
                                                  distribution.t4.stats[contamination_rate].prob_no_death *
                                                  distribution.t5.stats[contamination_rate].prob_no_death *
                                                  distribution.t6.stats[contamination_rate].prob_no_death *
                                                  distribution.t7.stats[contamination_rate].prob_no_death *
                                                  distribution.t8.stats[contamination_rate].prob_no_death).toFixed(2);

      result[contamination_rate].prob_death = Number(100 - result[contamination_rate].prob_no_death).toFixed(2);
    }

    res.render('calc',
      {
        title:'Résultats',
        result:result,
        distribution: distribution
      });
  }
});

// Start server
app.listen(3000, () => {
  console.log('Server startd on port 3000...');
});
