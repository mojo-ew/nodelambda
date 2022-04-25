const cron = require('node-cron');
const croneObj = require('../dao/cron');
const express = require("express");
const router = express.Router();
var date = new Date();
console.log('New cron script', cron);
(async () =>{
  console.log('New cron script before schedule');
cron.schedule(`10 57 12 * * *`, async function () {
  try {
    console.log('New cron script after corn code');
    console.log('static cron scheduled'+ new Date().toLocaleString());
    var cronData = await croneObj.getSupscriberDetails(0, 'Daily');
    //console.log(cronData[0]);
    console.log('New cron script before ApprovedLoopList');
    await croneObj.ApprovedLoopList();
    croneObj.ApprovedLoopList();
  }
  catch (ex) {
    console.log("static cron Error :", ex.message || ex);
  }
}, 
{
  scheduled: true,
  timezone: "Asia/Kolkata"
});
})();
console.log('End cron');

  // (async () => {
  //   console.log('running a weekly cron', new Date().toLocaleString());
  //   try {
  //     const type = 'Weekly';
  //     const day = date.getDay();
  //     var cronData = await croneObj.getSupscriberDetails(day, type);
  //     let length = cronData.length;
  //     for (let index = 0; index < length; index++) {
  //       await new Promise(async (resolve, reject) => {

  //         let [h, m] = cronData[index].exportTime.split(':');
  //         console.log(h, m);

  //         cron.schedule(`${m} ${h} * * *`, async function () {
  //           console.log(cronData[index]);
  //           await croneObj.ApprovedLoopList(cronData[index]);
  //           console.log('Schedulded', index);
  //         }, {
  //           scheduled: true,
  //           timezone: "Asia/Kolkata"
  //         });
  //         return resolve();
  //       });

  //     }
  //   }
  //   catch (Ex) {
  //     console.log("Crone Error :", Ex.message || Ex);
  //   }
  // })();

  // (async () => {
  //   console.log('running Monthly cron', new Date().toLocaleString());
  //   try {
  //     const type = 'Monthly';
  //     const day = date.getDate();
  //     const month = date.getMonth() + 1;
  //     var cronData = await croneObj.getSupscriberDetails(day, type);
  //     let length = cronData.length;
  //     for (let index = 0; index < length; index++) {
  //       await new Promise(async (resolve, reject) => {

  //         let [h, m] = cronData[index].exportTime.split(':');
  //         let d = cronData[index].exportedDay;
  //         console.log(h, m, month, d);

  //         cron.schedule(`${m} ${h} ${d} ${month} *`, async function () {
  //           console.log(cronData[index]);
  //           await croneObj.ApprovedLoopList(cronData[index]);
  //           console.log('Schedulded', index);
  //         }, {
  //           scheduled: true,
  //           timezone: "Asia/Kolkata"
  //         });
  //         return resolve();
  //       });

  //     }
  //   }
  //   catch (Ex) {
  //     console.log("Crone Error :", Ex.message || Ex);
  //   }
  // })();

module.exports = router;
