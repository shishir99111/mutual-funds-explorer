const express = require('express');
const router = express.Router();
const request = require('request');
const csvjson = require('csvjson');
const fs = require('fs');
const path = require('path');

function filterSearchData(data, search) {
  return data.filter(function (d, i) {
    const searchExp = new RegExp(search, "i")
    if (d['Scheme Name'].search(searchExp) !== -1)
      return true;
    return false;
  });
}

function getPaginatedData(req, data, query) {
  const page = query.page;
  const limit = query.limit;
  console.log('between', (page - 1) * limit, page * limit);
  return data.filter(function (d, i) {
    if (i >= ((page - 1) * limit) && (i < page * limit))
      return true;
    return false;
  });
}

/* GET home page. */
router.get('/funds', function (req, res, next) {
  const url = 'http://portal.amfiindia.com/spages/NAV0.txt';
  let totalRecords;
  let filteredRecords;
  try {
    request(url, function (error, response, body) {
      if (error)
        return err;
      if (response.statusCode === 200) {
        // splitting data by line
        body = body.split('\n');

        // removing blank line && fetching only fund data with header
        body = body.filter((e, i) => {
          e = e.trim();
          return (e !== '' && e.indexOf(';') !== -1);
        }).join('');

        // csv to json conversion 
        var options = {
          delimiter: ';'
        };
        let finalData = csvjson.toObject(body, options);
        console.log('All records', finalData.length);
        if (req.query.sort === 'Date') {
          finalData = finalData.sort(function (a, b) {
            a = new Date(a.Date);
            b = new Date(b.Date);
            return a > b ? -1 : a < b ? 1 : 0;
          });
        } else {
          finalData = finalData.sort(function (a, b) {
            a = a[req.query.sort];
            b = b[req.query.sort];
            return a > b ? -1 : a < b ? 1 : 0;
          });
        }
        if (req.query.search && req.query.search.length !== 0) {
          finalData = filterSearchData(finalData, req.query.search);
        }
        totalRecords = finalData.length;
        console.log('finalData', finalData);
        finalData = getPaginatedData(req, finalData, req.query);
        filteredRecords = finalData.length;
        res.send({ data: finalData, totalRecords: totalRecords, filteredRecords: filteredRecords });

      } else {
        throw new Error('Failed to get data the link');
      }
    });
  } catch (e) {
    throw (e);
  }
});

module.exports = router;